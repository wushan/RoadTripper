import type { LocationProvider } from '@core/interfaces/location';
import type { StorageProvider } from '@core/interfaces/storage';
import type { NavigationProvider } from '@core/interfaces/navigation';

import { WebLocationAdapter } from './web/location-adapter';
import { WebStorageAdapter } from './web/storage-adapter';
import { WebNavigationAdapter } from './web/navigation-adapter';

/**
 * 平台服務容器
 */
export interface PlatformServices {
  location: LocationProvider;
  storage: StorageProvider;
  navigation: NavigationProvider;
}

/**
 * 建立平台服務實例
 */
export function createPlatformServices(): PlatformServices {
  return {
    location: new WebLocationAdapter(),
    storage: new WebStorageAdapter(),
    navigation: new WebNavigationAdapter()
  };
}

let servicesInstance: PlatformServices | null = null;

/**
 * 取得平台服務實例 (單例模式)
 */
export function getPlatformServices(): PlatformServices {
  if (!servicesInstance) {
    servicesInstance = createPlatformServices();
  }
  return servicesInstance;
}

export { WebLocationAdapter, WebStorageAdapter, WebNavigationAdapter };
