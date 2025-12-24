import type {
  LocationProvider,
  GeoPosition,
  LocationError,
  LocationErrorCode,
  LocationOptions
} from '@core/interfaces/location';

/**
 * Web 平台定位服務實作
 * 使用 Geolocation API
 */
export class WebLocationAdapter implements LocationProvider {
  private watchId: number | null = null;

  /**
   * 將原生錯誤轉換為標準錯誤格式
   */
  private mapError(error: GeolocationPositionError): LocationError {
    const codeMap: Record<number, LocationErrorCode> = {
      1: 'PERMISSION_DENIED',
      2: 'POSITION_UNAVAILABLE',
      3: 'TIMEOUT'
    };

    return {
      code: codeMap[error.code] ?? 'UNKNOWN',
      message: error.message
    };
  }

  /**
   * 將原生位置轉換為標準格式
   */
  private mapPosition(position: GeolocationPosition): GeoPosition {
    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      heading: position.coords.heading,
      speed: position.coords.speed,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp
    };
  }

  /**
   * 取得預設配置
   */
  private getDefaultOptions(): PositionOptions {
    return {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 10000
    };
  }

  watchPosition(
    onSuccess: (position: GeoPosition) => void,
    onError: (error: LocationError) => void,
    options?: LocationOptions
  ): void {
    this.stopWatching();

    const positionOptions: PositionOptions = {
      ...this.getDefaultOptions(),
      ...options
    };

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        onSuccess(this.mapPosition(position));
      },
      (error) => {
        onError(this.mapError(error));
      },
      positionOptions
    );
  }

  stopWatching(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  async getCurrentPosition(options?: LocationOptions): Promise<GeoPosition> {
    const positionOptions: PositionOptions = {
      ...this.getDefaultOptions(),
      ...options
    };

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve(this.mapPosition(position));
        },
        (error) => {
          reject(this.mapError(error));
        },
        positionOptions
      );
    });
  }

  async checkPermission(): Promise<'granted' | 'denied' | 'prompt'> {
    if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({
          name: 'geolocation'
        });
        return result.state;
      } catch {
        return 'prompt';
      }
    }
    return 'prompt';
  }

  async requestPermission(): Promise<boolean> {
    try {
      await this.getCurrentPosition({ timeout: 5000 });
      return true;
    } catch (error) {
      const locationError = error as LocationError;
      return locationError.code !== 'PERMISSION_DENIED';
    }
  }
}
