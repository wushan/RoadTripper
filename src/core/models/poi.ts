/**
 * POI 類型
 */
export type POIType =
  | 'restaurant'
  | 'cafe'
  | 'attraction'
  | 'hotel'
  | 'gas_station'
  | 'convenience_store';

/**
 * POI 類型對應的 Google Places API 類型
 */
export const POI_TYPE_MAP: Record<POIType, string> = {
  restaurant: 'restaurant',
  cafe: 'cafe',
  attraction: 'tourist_attraction',
  hotel: 'lodging',
  gas_station: 'gas_station',
  convenience_store: 'convenience_store'
};

/**
 * POI 類型對應的標記顏色
 */
export const POI_MARKER_COLORS: Record<POIType, string> = {
  restaurant: '#EF4444',
  cafe: '#F59E0B',
  attraction: '#10B981',
  hotel: '#3B82F6',
  gas_station: '#6B7280',
  convenience_store: '#8B5CF6'
};

/**
 * POI 類型對應的圖示
 */
export const POI_TYPE_ICONS: Record<POIType, string> = {
  restaurant: '\u{1F35C}',
  cafe: '\u2615',
  attraction: '\u{1F3DB}',
  hotel: '\u{1F3E8}',
  gas_station: '\u26FD',
  convenience_store: '\u{1F3EA}'
};

/**
 * POI 類型對應的中文名稱
 */
export const POI_TYPE_LABELS: Record<POIType, string> = {
  restaurant: '餐廳',
  cafe: '咖啡廳',
  attraction: '景點',
  hotel: '住宿',
  gas_station: '加油站',
  convenience_store: '便利商店'
};

/**
 * POI 資料模型
 */
export interface POI {
  /** 唯一識別碼 (Google Place ID) */
  id: string;
  /** 地點名稱 */
  name: string;
  /** POI 類型 */
  type: POIType;
  /** 位置座標 */
  location: {
    latitude: number;
    longitude: number;
  };
  /** 距離使用者的公尺數 */
  distance: number;
  /** 評分 (1-5) */
  rating: number;
  /** 評論數量 */
  ratingCount: number;
  /** 價位等級 (1-4，可選) */
  priceLevel?: number;
  /** 是否營業中 (可選) */
  isOpen?: boolean;
  /** 營業時間文字 (可選) */
  openingHours?: string;
  /** 縮圖 URL (可選) */
  thumbnail?: string;
  /** 地點照片 URL (可選) */
  photoUrl?: string;
  /** 地址 (可選) */
  address?: string;
  /** 電話 (可選) */
  phone?: string;
}

/**
 * POI 搜尋結果
 */
export interface POISearchResult {
  /** POI 列表 */
  pois: POI[];
  /** 實際搜尋半徑 */
  searchRadius: number;
  /** 建議的地圖縮放等級 */
  suggestedZoom: number;
  /** 搜尋中心點 */
  center: {
    latitude: number;
    longitude: number;
  };
  /** 是否還有更多結果 */
  hasMore: boolean;
}

/**
 * 根據搜尋半徑取得建議的縮放等級
 */
export function getZoomForRadius(radius: number): number {
  if (radius <= 1000) return 15;
  if (radius <= 2000) return 14;
  if (radius <= 3000) return 14;
  if (radius <= 5000) return 13;
  return 12;
}
