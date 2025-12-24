/**
 * 地球半徑 (公尺)
 */
const EARTH_RADIUS = 6371000;

/**
 * 將角度轉換為弧度
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * 使用 Haversine 公式計算兩點之間的距離
 * @param lat1 第一點緯度
 * @param lng1 第一點經度
 * @param lat2 第二點緯度
 * @param lng2 第二點經度
 * @returns 距離 (公尺)
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS * c;
}

/**
 * 快速計算兩點之間的近似距離 (適用於小範圍)
 * 比 Haversine 更快，但精度較低
 * @param lat1 第一點緯度
 * @param lng1 第一點經度
 * @param lat2 第二點緯度
 * @param lng2 第二點經度
 * @returns 距離 (公尺)
 */
export function approximateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const latDiff = Math.abs(lat1 - lat2) * 111000;
  const lngDiff = Math.abs(lng1 - lng2) * 111000 * Math.cos(toRadians(lat1));
  return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
}

/**
 * 計算兩點之間的方位角
 * @param lat1 起點緯度
 * @param lng1 起點經度
 * @param lat2 終點緯度
 * @param lng2 終點經度
 * @returns 方位角 (0-360 度)
 */
export function calculateBearing(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const dLng = toRadians(lng2 - lng1);
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);

  const y = Math.sin(dLng) * Math.cos(lat2Rad);
  const x =
    Math.cos(lat1Rad) * Math.sin(lat2Rad) -
    Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);

  let bearing = Math.atan2(y, x) * (180 / Math.PI);
  bearing = (bearing + 360) % 360;

  return bearing;
}

/**
 * 檢查位置變化是否為 GPS 漂移
 * @param distance 移動距離 (公尺)
 * @returns 是否可能是 GPS 漂移
 */
export function isGPSDrift(distance: number): boolean {
  return distance < 10 || distance > 500;
}

/**
 * 計算包含所有點的邊界框
 * @param points 座標點陣列
 * @returns 邊界框 [minLng, minLat, maxLng, maxLat]
 */
export function calculateBounds(
  points: Array<{ latitude: number; longitude: number }>
): [number, number, number, number] {
  if (points.length === 0) {
    throw new Error('Points array cannot be empty');
  }

  let minLat = points[0]!.latitude;
  let maxLat = points[0]!.latitude;
  let minLng = points[0]!.longitude;
  let maxLng = points[0]!.longitude;

  for (const point of points) {
    minLat = Math.min(minLat, point.latitude);
    maxLat = Math.max(maxLat, point.latitude);
    minLng = Math.min(minLng, point.longitude);
    maxLng = Math.max(maxLng, point.longitude);
  }

  return [minLng, minLat, maxLng, maxLat];
}
