import type { POI } from '../models/poi';

/**
 * 快取的 POI 資料
 */
export interface CachedPOI extends POI {
  /** 快取時間 */
  cachedAt: number;
  /** 搜尋中心點緯度 */
  searchLat: number;
  /** 搜尋中心點經度 */
  searchLng: number;
  /** 搜尋半徑 */
  searchRadius: number;
}

/**
 * 使用者偏好設定
 */
export interface UserPreferences {
  /** 最低評分篩選 */
  minRating: number;
  /** 啟用的 POI 類別 */
  enabledCategories: string[];
  /** 只顯示營業中 */
  openNowOnly: boolean;
  /** 主題模式 */
  theme: 'light' | 'dark' | 'system';
}

/**
 * 使用配額
 */
export interface UsageQuota {
  /** 已移動公尺數 */
  distanceTraveled: number;
  /** 距離限制 (5000 = 5KM) */
  distanceLimit: number;
  /** 已搜尋次數 */
  searchCount: number;
  /** 搜尋次數限制 (100 次/天) */
  searchLimit: number;
  /** 上次重置日期 (ISO 日期字串) */
  lastReset: string;
}

/**
 * 儲存服務提供者介面
 * 支援離線快取和偏好設定儲存
 */
export interface StorageProvider {
  // ===== POI 快取 =====

  /**
   * 儲存 POI 資料到快取
   */
  cachePOIs(pois: CachedPOI[]): Promise<void>;

  /**
   * 從快取取得 POI 資料
   * @param lat 中心點緯度
   * @param lng 中心點經度
   * @param radius 搜尋半徑
   * @param maxAge 最大快取時間 (毫秒)
   */
  getCachedPOIs(
    lat: number,
    lng: number,
    radius: number,
    maxAge?: number
  ): Promise<CachedPOI[]>;

  /**
   * 清除過期快取
   * @param maxAge 最大快取時間 (毫秒)
   */
  clearExpiredCache(maxAge: number): Promise<void>;

  // ===== 使用者偏好 =====

  /**
   * 取得使用者偏好設定
   */
  getPreferences(): Promise<UserPreferences | null>;

  /**
   * 儲存使用者偏好設定
   */
  savePreferences(preferences: UserPreferences): Promise<void>;

  // ===== 配額追蹤 =====

  /**
   * 取得今日使用配額
   */
  getQuota(): Promise<UsageQuota | null>;

  /**
   * 更新使用配額
   */
  updateQuota(quota: UsageQuota): Promise<void>;
}
