import type {
  NavigationProvider,
  NavigationDestination,
  NavigationMode
} from '@core/interfaces/navigation';

/**
 * Web 平台導航服務實作
 */
export class WebNavigationAdapter implements NavigationProvider {
  private isIOS(): boolean {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }

  private isAndroid(): boolean {
    return /Android/.test(navigator.userAgent);
  }

  private getGoogleMapsWebUrl(
    destination: NavigationDestination,
    mode: NavigationMode
  ): string {
    const { latitude, longitude, placeId } = destination;

    if (placeId) {
      return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_place_id=${placeId}&travelmode=${mode}`;
    }

    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=${mode}`;
  }

  private getGoogleMapsAppUrl(
    destination: NavigationDestination,
    mode: NavigationMode
  ): string {
    const { latitude, longitude } = destination;

    if (this.isIOS()) {
      return `comgooglemaps://?daddr=${latitude},${longitude}&directionsmode=${mode}`;
    }

    if (this.isAndroid()) {
      const modeMap: Record<NavigationMode, string> = {
        driving: 'd',
        walking: 'w',
        cycling: 'b',
        transit: 'r'
      };
      return `google.navigation:q=${latitude},${longitude}&mode=${modeMap[mode]}`;
    }

    return this.getGoogleMapsWebUrl(destination, mode);
  }

  private isPWA(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
  }

  async openNavigation(
    destination: NavigationDestination,
    mode: NavigationMode = 'driving'
  ): Promise<boolean> {
    try {
      const webUrl = this.getGoogleMapsWebUrl(destination, mode);

      // In PWA mode on iOS, use a simple link approach to avoid blank screen
      if (this.isPWA() && this.isIOS()) {
        // Create a temporary link and click it - this properly opens in Safari
        const link = document.createElement('a');
        link.href = webUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return true;
      }

      // For Android or non-PWA iOS, try deep link first
      if (this.isIOS() || this.isAndroid()) {
        const appUrl = this.getGoogleMapsAppUrl(destination, mode);

        // Use hidden iframe to try opening the app
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = appUrl;
        document.body.appendChild(iframe);

        await new Promise((resolve) => setTimeout(resolve, 500));
        document.body.removeChild(iframe);

        // Open web URL as fallback (for when app is not installed)
        window.open(webUrl, '_blank', 'noopener,noreferrer');
        return true;
      }

      // Desktop: just open web URL
      window.open(webUrl, '_blank', 'noopener,noreferrer');
      return true;
    } catch (error) {
      console.error('Failed to open navigation:', error);
      return false;
    }
  }

  async isNavigationAppAvailable(
    app: 'google' | 'apple' | 'waze'
  ): Promise<boolean> {
    if (app === 'apple') {
      return this.isIOS();
    }
    return true;
  }

  getNavigationUrl(
    destination: NavigationDestination,
    mode: NavigationMode = 'driving'
  ): string {
    return this.getGoogleMapsWebUrl(destination, mode);
  }
}
