import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { cache } from 'hono/cache';

type Bindings = {
  GOOGLE_PLACES_API_KEY: string;
  ALLOWED_ORIGINS: string;
};

// Our internal types
type AppPlaceType =
  | 'restaurant'
  | 'cafe'
  | 'attraction'
  | 'hotel'
  | 'gas_station'
  | 'convenience_store';

// Google Places API types
type GooglePlaceType =
  | 'restaurant'
  | 'cafe'
  | 'tourist_attraction'
  | 'lodging'
  | 'gas_station'
  | 'convenience_store';

// Map our types to Google Places API types
const typeToGoogleType: Record<AppPlaceType, GooglePlaceType> = {
  restaurant: 'restaurant',
  cafe: 'cafe',
  attraction: 'tourist_attraction',
  hotel: 'lodging',
  gas_station: 'gas_station',
  convenience_store: 'convenience_store'
};

interface NearbyRequest {
  latitude: number;
  longitude: number;
  radius: number;
  types: AppPlaceType[];
}

interface GooglePhoto {
  name: string;
  widthPx: number;
  heightPx: number;
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
  types?: string[];
  photos?: GooglePhoto[];
}

interface GoogleNearbyResponse {
  places?: GooglePlace[];
}

const app = new Hono<{ Bindings: Bindings }>();

// CORS middleware
app.use('*', async (c, next) => {
  const allowedOrigins = c.env.ALLOWED_ORIGINS?.split(',') || [];
  const origin = c.req.header('Origin') || '';

  const corsHeaders: Record<string, string> = {};

  if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
    corsHeaders['Access-Control-Allow-Origin'] = origin;
    corsHeaders['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
    corsHeaders['Access-Control-Allow-Headers'] = 'Content-Type';
  }

  if (c.req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Set headers for non-OPTIONS requests
  Object.entries(corsHeaders).forEach(([key, value]) => {
    c.header(key, value);
  });

  await next();
});

// Health check
app.get('/', (c) => {
  return c.json({ status: 'ok', service: 'RoadTripper API' });
});

// Helper to construct photo URL from Google Places photo reference
function getPhotoUrl(photo: GooglePhoto | undefined, apiKey: string, maxSize: number = 100): string | undefined {
  if (!photo?.name) return undefined;
  // Google Places API (New) photo URL format
  return `https://places.googleapis.com/v1/${photo.name}/media?maxHeightPx=${maxSize}&maxWidthPx=${maxSize}&key=${apiKey}`;
}

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

    // Convert our types to Google Places API types
    const googleTypes = types.map((t) => typeToGoogleType[t]).filter(Boolean);

    // Build Google Places API (New) request
    const requestBody = {
      includedTypes: googleTypes,
      maxResultCount: 20,
      languageCode: 'zh-TW', // Traditional Chinese
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
            'places.id,places.displayName,places.location,places.rating,places.userRatingCount,places.priceLevel,places.regularOpeningHours.openNow,places.formattedAddress,places.primaryType,places.types,places.photos'
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
    const places = (data.places || []).map((place) => {
      const mappedType = mapGoogleTypeToOurType(place.primaryType, place.types);

      // Debug logging
      console.log(`[POI] "${place.displayName?.text}" - primaryType: "${place.primaryType}", types: [${place.types?.join(', ')}] -> mapped: "${mappedType}"`);

      return {
        id: place.id,
        name: place.displayName?.text || 'Unknown',
        type: mappedType,
        location: {
          latitude: place.location?.latitude || 0,
          longitude: place.location?.longitude || 0
        },
        rating: place.rating || 0,
        ratingCount: place.userRatingCount || 0,
        priceLevel: mapPriceLevel(place.priceLevel),
        isOpen: place.regularOpeningHours?.openNow,
        address: place.formattedAddress,
        photoUrl: getPhotoUrl(place.photos?.[0], apiKey, 80)
      };
    });

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
      `https://places.googleapis.com/v1/places/${placeId}?languageCode=zh-TW`,
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

function mapGoogleTypeToOurType(primaryType?: string, types?: string[]): string {
  // Direct mappings for known types
  const directMap: Record<string, string> = {
    restaurant: 'restaurant',
    cafe: 'cafe',
    coffee_shop: 'cafe',
    tourist_attraction: 'attraction',
    lodging: 'hotel',
    hotel: 'hotel',
    motel: 'hotel',
    resort_hotel: 'hotel',
    gas_station: 'gas_station',
    convenience_store: 'convenience_store'
  };

  // Attraction types (museums, parks, landmarks, etc.)
  const attractionTypes = new Set([
    'tourist_attraction',
    'museum',
    'art_gallery',
    'park',
    'national_park',
    'state_park',
    'city_park',
    'dog_park',
    'zoo',
    'aquarium',
    'amusement_park',
    'historical_landmark',
    'monument',
    'stadium',
    'arena',
    'performing_arts_theater',
    'movie_theater',
    'cultural_center',
    'visitor_center',
    'church',
    'temple',
    'mosque',
    'synagogue',
    'hindu_temple',
    'buddhist_temple',
    'landmark',
    'plaza',
    'botanical_garden',
    'garden',
    'campground',
    'hiking_area',
    'ski_resort',
    'beach',
    'marina',
    'wildlife_park',
    'observation_deck',
    'planetarium',
    'science_museum',
    'childrens_museum',
    'history_museum',
    'library',
    'athletic_field',
    'golf_course',
    'playground',
    'swimming_pool',
    'sports_complex',
    'tourist_destination',
    'point_of_interest'
  ]);

  // Food/drink types
  const foodTypes = new Set([
    'restaurant',
    'bakery',
    'bar',
    'food',
    'meal_delivery',
    'meal_takeaway',
    'ice_cream_shop',
    'pizza_restaurant',
    'ramen_restaurant',
    'sushi_restaurant',
    'chinese_restaurant',
    'japanese_restaurant',
    'korean_restaurant',
    'thai_restaurant',
    'vietnamese_restaurant',
    'indian_restaurant',
    'italian_restaurant',
    'mexican_restaurant',
    'american_restaurant',
    'fast_food_restaurant',
    'seafood_restaurant',
    'steak_house',
    'vegetarian_restaurant',
    'vegan_restaurant',
    'breakfast_restaurant',
    'brunch_restaurant',
    'hamburger_restaurant',
    'noodle_restaurant',
    'sandwich_shop',
    'tea_house'
  ]);

  // Check primaryType first
  if (primaryType) {
    if (directMap[primaryType]) {
      return directMap[primaryType];
    }
    if (attractionTypes.has(primaryType)) {
      return 'attraction';
    }
    if (foodTypes.has(primaryType)) {
      return 'restaurant';
    }
  }

  // Check types array for better matching
  if (types && types.length > 0) {
    // First check for attraction types in the array
    for (const t of types) {
      if (attractionTypes.has(t)) {
        return 'attraction';
      }
    }

    // Then check for direct mappings
    for (const t of types) {
      if (directMap[t]) {
        return directMap[t];
      }
    }

    // Then check for food types
    for (const t of types) {
      if (foodTypes.has(t)) {
        return 'restaurant';
      }
    }
  }

  // Fallback: check if type name contains hints
  const typeToCheck = primaryType || (types && types[0]) || '';
  const lowerType = typeToCheck.toLowerCase();

  if (lowerType.includes('park') || lowerType.includes('garden')) {
    return 'attraction';
  }
  if (lowerType.includes('museum') || lowerType.includes('attraction') || lowerType.includes('landmark')) {
    return 'attraction';
  }
  if (lowerType.includes('restaurant') || lowerType.includes('food')) {
    return 'restaurant';
  }
  if (lowerType.includes('cafe') || lowerType.includes('coffee')) {
    return 'cafe';
  }
  if (lowerType.includes('hotel') || lowerType.includes('lodging')) {
    return 'hotel';
  }

  // Final fallback - default to attraction for unknown types
  return 'attraction';
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
