/**
 * 格式化距離顯示
 * @param meters 距離 (公尺)
 * @returns 格式化的距離字串
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} M`;
  }
  return `${(meters / 1000).toFixed(1)} KM`;
}

/**
 * 格式化價位等級
 * @param level 價位等級 (1-4)
 * @returns 格式化的價位字串 ($ - $$$$)
 */
export function formatPriceLevel(level?: number): string {
  if (!level || level < 1 || level > 4) return '';
  return '$'.repeat(level);
}

/**
 * 格式化評分
 * @param rating 評分 (1-5)
 * @returns 格式化的評分字串
 */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

/**
 * 格式化評論數量
 * @param count 評論數量
 * @returns 格式化的數量字串 (如: 1.2K, 3.5M)
 */
export function formatRatingCount(count: number): string {
  if (count < 1000) {
    return count.toString();
  }
  if (count < 1000000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return `${(count / 1000000).toFixed(1)}M`;
}

/**
 * 格式化營業狀態
 * @param isOpen 是否營業中
 * @returns 格式化的營業狀態字串
 */
export function formatOpenStatus(isOpen?: boolean): string {
  if (isOpen === undefined) return '';
  return isOpen ? '營業中' : '已打烊';
}

/**
 * 取得今天的日期字串 (YYYY-MM-DD)
 */
export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0]!;
}

/**
 * 檢查日期是否為今天
 * @param dateString ISO 日期字串
 */
export function isToday(dateString: string): boolean {
  return dateString === getTodayDateString();
}
