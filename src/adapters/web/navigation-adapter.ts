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

  async openNavigation(
    destination: NavigationDestination,
    mode: NavigationMode = 'driving'
  ): Promise<boolean> {
    try {
      if (this.isIOS() || this.isAndroid()) {
        const appUrl = this.getGoogleMapsAppUrl(destination, mode);

        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = appUrl;
        document.body.appendChild(iframe);

        await new Promise((resolve) => setTimeout(resolve, 500));
        document.body.removeChild(iframe);

        window.open(this.getGoogleMapsWebUrl(destination, mode), '_blank');
        return true;
      }

      window.open(this.getGoogleMapsWebUrl(destination, mode), '_blank');
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
