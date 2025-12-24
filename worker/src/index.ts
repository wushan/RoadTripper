import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { cache } from 'hono/cache';

type Bindings = {
  GOOGLE_PLACES_API_KEY: string;
  ALLOWED_ORIGINS: string;
};

type PlaceType =
  | 'restaurant'
  | 'cafe'
  | 'tourist_attraction'
  | 'lodging'
  | 'gas_station'
  | 'convenience_store';

interface NearbyRequest {
  latitude: number;
  longitude: number;
  radius: number;
  types: PlaceType[];
}

interface GooglePlace {
  id: string;
  displayName: { text: string };
  location: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
  priceLevel?: string;
  regularOpeningHours?: { openNow?: boolean };
  formattedAddress?: string;
  primaryType?: string;
}

interface GoogleNearbyResponse {
  places?: GooglePlace[];
}

const app = new Hono<{ Bindings: Bindings }>();

// CORS middleware
app.use('*', async (c, next) => {
  const allowedOrigins = c.env.ALLOWED_ORIGINS?.split(',') || [];
  const origin = c.req.header('Origin') || '';

  if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
    c.header('Access-Control-Allow-Origin', origin);
    c.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type');
  }

  if (c.req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  await next();
});

// Health check
app.get('/', (c) => {
  return c.json({ status: 'ok', service: 'RoadTripper API' });
});

// Nearby places search
app.post('/api/places/nearby', async (c) => {
  try {
    const body = await c.req.json<NearbyRequest>();
    const { latitude, longitude, radius, types } = body;

    if (!latitude || !longitude || !radius || !types?.length) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const apiKey = c.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      return c.json({ error: 'API key not configured' }, 500);
    }

    // Build Google Places API (New) request
    const requestBody = {
      includedTypes: types,
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: { latitude, longitude },
          radius
        }
      }
    };

    const response = await fetch(
      'https://places.googleapis.com/v1/places:searchNearby',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask':
            'places.id,places.displayName,places.location,places.rating,places.userRatingCount,places.priceLevel,places.regularOpeningHours.openNow,places.formattedAddress,places.primaryType'
        },
        body: JSON.stringify(requestBody)
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Places API error:', errorText);
      return c.json({ error: 'Failed to fetch places' }, 502);
    }

    const data: GoogleNearbyResponse = await response.json();

    // Transform response to our format
    const places = (data.places || []).map((place) => ({
      id: place.id,
      name: place.displayName?.text || 'Unknown',
      type: mapGoogleTypeToOurType(place.primaryType),
      location: {
        latitude: place.location?.latitude || 0,
        longitude: place.location?.longitude || 0
      },
      rating: place.rating || 0,
      ratingCount: place.userRatingCount || 0,
      priceLevel: mapPriceLevel(place.priceLevel),
      isOpen: place.regularOpeningHours?.openNow,
      address: place.formattedAddress
    }));

    return c.json({ places });
  } catch (error) {
    console.error('Error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Place details
app.get('/api/places/:id', async (c) => {
  try {
    const placeId = c.req.param('id');
    const apiKey = c.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return c.json({ error: 'API key not configured' }, 500);
    }

    const response = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        headers: {
          'X-Goog-Api-Key': apiKey,
          'X-Goog-FieldMask':
            'id,displayName,location,rating,userRatingCount,priceLevel,regularOpeningHours,formattedAddress,primaryType,nationalPhoneNumber,websiteUri,photos'
        }
      }
    );

    if (!response.ok) {
      return c.json({ error: 'Place not found' }, 404);
    }

    const place: GooglePlace = await response.json();

    return c.json({
      id: place.id,
      name: place.displayName?.text || 'Unknown',
      type: mapGoogleTypeToOurType(place.primaryType),
      location: place.location,
      rating: place.rating,
      ratingCount: place.userRatingCount,
      priceLevel: mapPriceLevel(place.priceLevel),
      isOpen: place.regularOpeningHours?.openNow,
      address: place.formattedAddress
    });
  } catch (error) {
    console.error('Error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

function mapGoogleTypeToOurType(googleType?: string): string {
  const typeMap: Record<string, string> = {
    restaurant: 'restaurant',
    cafe: 'cafe',
    tourist_attraction: 'attraction',
    lodging: 'hotel',
    gas_station: 'gas_station',
    convenience_store: 'convenience_store'
  };
  return typeMap[googleType || ''] || 'restaurant';
}

function mapPriceLevel(priceLevel?: string): number | undefined {
  if (!priceLevel) return undefined;
  const levelMap: Record<string, number> = {
    PRICE_LEVEL_FREE: 0,
    PRICE_LEVEL_INEXPENSIVE: 1,
    PRICE_LEVEL_MODERATE: 2,
    PRICE_LEVEL_EXPENSIVE: 3,
    PRICE_LEVEL_VERY_EXPENSIVE: 4
  };
  return levelMap[priceLevel];
}

export default app;
