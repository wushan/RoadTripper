import type { POIType } from './poi';

/**
 * POI 篩選條件
 */
export interface POIFilter {
  /** 啟用的類別 */
  categories: POIType[];
  /** 最低評分 (預設 4.0) */
  minRating: number;
  /** 只顯示營業中 */
  openNow: boolean;
}

/**
 * 預設篩選條件
 */
export const DEFAULT_FILTER: POIFilter = {
  categories: ['restaurant', 'cafe', 'attraction'],
  minRating: 4.0,
  openNow: false
};

/**
 * 免費版可用的類別
 */
export const FREE_TIER_CATEGORIES: POIType[] = [
  'restaurant',
  'cafe',
  'attraction'
];

/**
 * 付費版額外的類別
 */
export const PREMIUM_CATEGORIES: POIType[] = [
  'hotel',
  'gas_station',
  'convenience_store'
];

/**
 * 所有 POI 類別
 */
export const ALL_CATEGORIES: POIType[] = [
  ...FREE_TIER_CATEGORIES,
  ...PREMIUM_CATEGORIES
];
