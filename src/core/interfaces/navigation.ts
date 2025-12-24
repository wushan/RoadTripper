/**
 * 導航模式
 */
export type NavigationMode = 'driving' | 'walking' | 'cycling' | 'transit';

/**
 * 導航目的地
 */
export interface NavigationDestination {
  /** 緯度 */
  latitude: number;
  /** 經度 */
  longitude: number;
  /** 地點名稱 (可選，用於顯示) */
  name?: string;
  /** Google Place ID (可選，用於更精確的導航) */
  placeId?: string;
}

/**
 * 導航服務提供者介面
 */
export interface NavigationProvider {
  /**
   * 開啟外部導航 APP
   * @param destination 目的地資訊
   * @param mode 導航模式
   * @returns 是否成功開啟
   */
  openNavigation(
    destination: NavigationDestination,
    mode?: NavigationMode
  ): Promise<boolean>;

  /**
   * 檢查是否支援特定導航 APP
   * @param app 導航 APP 名稱
   */
  isNavigationAppAvailable(app: 'google' | 'apple' | 'waze'): Promise<boolean>;

  /**
   * 取得導航 URL (不開啟，僅回傳 URL)
   */
  getNavigationUrl(
    destination: NavigationDestination,
    mode?: NavigationMode
  ): string;
}
