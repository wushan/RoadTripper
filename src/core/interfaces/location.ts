/**
 * 地理位置資訊
 */
export interface GeoPosition {
  /** 緯度 */
  latitude: number;
  /** 經度 */
  longitude: number;
  /** 行進方向 (0-360 度，null 表示無法取得) */
  heading: number | null;
  /** 速度 (公尺/秒，null 表示無法取得) */
  speed: number | null;
  /** 精確度 (公尺) */
  accuracy: number;
  /** 時間戳記 */
  timestamp: number;
}

/**
 * 定位錯誤類型
 */
export type LocationErrorCode =
  | 'PERMISSION_DENIED'
  | 'POSITION_UNAVAILABLE'
  | 'TIMEOUT'
  | 'UNKNOWN';

/**
 * 定位錯誤資訊
 */
export interface LocationError {
  code: LocationErrorCode;
  message: string;
}

/**
 * 定位服務配置
 */
export interface LocationOptions {
  /** 啟用高精確度 */
  enableHighAccuracy?: boolean;
  /** 最大快取時間 (毫秒) */
  maximumAge?: number;
  /** 逾時時間 (毫秒) */
  timeout?: number;
}

/**
 * 定位服務提供者介面
 * 所有平台必須實作此介面
 */
export interface LocationProvider {
  /**
   * 開始監聽位置變化
   * @param onSuccess 位置更新回調
   * @param onError 錯誤回調
   * @param options 配置選項
   */
  watchPosition(
    onSuccess: (position: GeoPosition) => void,
    onError: (error: LocationError) => void,
    options?: LocationOptions
  ): void;

  /**
   * 停止監聽位置變化
   */
  stopWatching(): void;

  /**
   * 取得當前位置 (一次性)
   * @param options 配置選項
   */
  getCurrentPosition(options?: LocationOptions): Promise<GeoPosition>;

  /**
   * 檢查定位權限狀態
   */
  checkPermission(): Promise<'granted' | 'denied' | 'prompt'>;

  /**
   * 請求定位權限
   */
  requestPermission(): Promise<boolean>;
}
