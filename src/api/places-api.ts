import type { POI, POIType } from '@/core/models/poi';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

interface NearbySearchParams {
  latitude: number;
  longitude: number;
  radius: number;
  types: POIType[];
}

interface PlaceResponse {
  id: string;
  name: string;
  type: string;
  location: { latitude: number; longitude: number };
  rating?: number;
  ratingCount?: number;
  priceLevel?: number;
  isOpen?: boolean;
  address?: string;
  photoUrl?: string;
}

interface NearbySearchResponse {
  places: PlaceResponse[];
}

interface PlaceDetailsResponse extends PlaceResponse {
  phone?: string;
  website?: string;
  photos?: { name: string }[];
}

class PlacesAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async searchNearby(params: NearbySearchParams): Promise<POI[]> {
    const response = await fetch(`${this.baseUrl}/api/places/nearby`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `API error: ${response.status}`);
    }

    const data: NearbySearchResponse = await response.json();

    return data.places.map((place) => this.transformPlace(place));
  }

  async getPlaceDetails(placeId: string): Promise<POI> {
    const response = await fetch(`${this.baseUrl}/api/places/${encodeURIComponent(placeId)}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Place not found');
      }
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `API error: ${response.status}`);
    }

    const data: PlaceDetailsResponse = await response.json();
    return this.transformPlace(data);
  }

  private transformPlace(place: PlaceResponse): POI {
    return {
      id: place.id,
      name: place.name,
      type: this.mapType(place.type),
      location: {
        latitude: place.location.latitude,
        longitude: place.location.longitude,
      },
      distance: 0, // Will be calculated by the app
      rating: place.rating ?? 0,
      ratingCount: place.ratingCount ?? 0,
      priceLevel: place.priceLevel,
      isOpen: place.isOpen,
      address: place.address,
      photoUrl: place.photoUrl,
    };
  }

  private mapType(type: string): POIType {
    const typeMap: Record<string, POIType> = {
      restaurant: 'restaurant',
      cafe: 'cafe',
      attraction: 'attraction',
      hotel: 'hotel',
      gas_station: 'gas_station',
      convenience_store: 'convenience_store',
    };
    return typeMap[type] || 'restaurant';
  }
}

export const placesAPI = new PlacesAPI();
export type { NearbySearchParams };
