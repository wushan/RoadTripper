import type { POI } from '@core/models/poi';

/**
 * Mock POI 資料 (台北市區)
 */
export const MOCK_POIS: POI[] = [
  {
    id: 'mock-1',
    name: '阿宗麵線',
    type: 'restaurant',
    location: { latitude: 25.0421, longitude: 121.5654 },
    distance: 850,
    rating: 4.6,
    ratingCount: 2341,
    priceLevel: 2,
    isOpen: true,
    address: '台北市萬華區西門町'
  },
  {
    id: 'mock-2',
    name: '鼎泰豐 (信義店)',
    type: 'restaurant',
    location: { latitude: 25.0330, longitude: 121.5654 },
    distance: 1200,
    rating: 4.8,
    ratingCount: 15234,
    priceLevel: 3,
    isOpen: true,
    address: '台北市信義區松高路'
  },
  {
    id: 'mock-3',
    name: 'Starbucks 星巴克',
    type: 'cafe',
    location: { latitude: 25.0350, longitude: 121.5680 },
    distance: 450,
    rating: 4.2,
    ratingCount: 892,
    priceLevel: 2,
    isOpen: true,
    address: '台北市信義區'
  },
  {
    id: 'mock-4',
    name: '路易莎咖啡',
    type: 'cafe',
    location: { latitude: 25.0380, longitude: 121.5620 },
    distance: 620,
    rating: 4.3,
    ratingCount: 456,
    priceLevel: 1,
    isOpen: true,
    address: '台北市中正區'
  },
  {
    id: 'mock-5',
    name: '台北101觀景台',
    type: 'attraction',
    location: { latitude: 25.0339, longitude: 121.5645 },
    distance: 980,
    rating: 4.7,
    ratingCount: 45678,
    isOpen: true,
    address: '台北市信義區信義路五段7號'
  },
  {
    id: 'mock-6',
    name: '國立故宮博物院',
    type: 'attraction',
    location: { latitude: 25.1024, longitude: 121.5485 },
    distance: 8500,
    rating: 4.6,
    ratingCount: 32456,
    isOpen: true,
    address: '台北市士林區至善路二段221號'
  },
  {
    id: 'mock-7',
    name: '台北W飯店',
    type: 'hotel',
    location: { latitude: 25.0360, longitude: 121.5650 },
    distance: 750,
    rating: 4.5,
    ratingCount: 3456,
    priceLevel: 4,
    isOpen: true,
    address: '台北市信義區忠孝東路五段10號'
  },
  {
    id: 'mock-8',
    name: '中油加油站',
    type: 'gas_station',
    location: { latitude: 25.0400, longitude: 121.5700 },
    distance: 520,
    rating: 4.0,
    ratingCount: 234,
    isOpen: true,
    address: '台北市信義區'
  },
  {
    id: 'mock-9',
    name: '7-ELEVEN 統一超商',
    type: 'convenience_store',
    location: { latitude: 25.0370, longitude: 121.5640 },
    distance: 180,
    rating: 4.1,
    ratingCount: 567,
    isOpen: true,
    address: '台北市信義區'
  },
  {
    id: 'mock-10',
    name: '永康牛肉麵',
    type: 'restaurant',
    location: { latitude: 25.0328, longitude: 121.5296 },
    distance: 3200,
    rating: 4.5,
    ratingCount: 8976,
    priceLevel: 2,
    isOpen: false,
    address: '台北市大安區永康街'
  }
];

/**
 * Mock 當前位置 (台北市信義區)
 */
export const MOCK_CURRENT_POSITION = {
  latitude: 25.0330,
  longitude: 121.5654,
  heading: 45,
  speed: 0,
  accuracy: 10,
  timestamp: Date.now()
};

/**
 * 根據類別篩選 Mock POI
 */
export function filterMockPOIsByCategories(
  categories: string[]
): POI[] {
  return MOCK_POIS.filter((poi) => categories.includes(poi.type));
}

/**
 * 根據評分篩選 Mock POI
 */
export function filterMockPOIsByRating(
  minRating: number
): POI[] {
  return MOCK_POIS.filter((poi) => poi.rating >= minRating);
}
