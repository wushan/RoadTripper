import { useLocationStore } from '@store/location-store';
import type { GeoPosition } from '@core/interfaces/location';

// Sample route along Taipei streets (for testing)
const SAMPLE_ROUTE: [number, number][] = [
  [25.0330, 121.5654], // Start: Taipei 101
  [25.0340, 121.5640],
  [25.0350, 121.5625],
  [25.0365, 121.5610],
  [25.0380, 121.5595], // Moving northwest
  [25.0395, 121.5580],
  [25.0410, 121.5565],
  [25.0425, 121.5550],
  [25.0440, 121.5535],
  [25.0455, 121.5520],
  [25.0470, 121.5505], // Continue
  [25.0485, 121.5490],
  [25.0500, 121.5475],
  [25.0515, 121.5460],
  [25.0530, 121.5445],
  [25.0545, 121.5430], // Near Zhongxiao area
  [25.0560, 121.5415],
  [25.0575, 121.5400],
  [25.0590, 121.5385],
  [25.0605, 121.5370], // End
];

interface SimulatorOptions {
  intervalMs?: number; // Time between updates
  loop?: boolean; // Loop back to start
  speedMultiplier?: number; // 1 = normal, 2 = 2x speed
}

class LocationSimulator {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private currentIndex = 0;
  private route: [number, number][] = SAMPLE_ROUTE;
  private options: SimulatorOptions = {
    intervalMs: 2000,
    loop: true,
    speedMultiplier: 1
  };

  setRoute(route: [number, number][]) {
    this.route = route;
    this.currentIndex = 0;
  }

  setOptions(options: Partial<SimulatorOptions>) {
    this.options = { ...this.options, ...options };
  }

  start() {
    if (this.intervalId) {
      this.stop();
    }

    console.log('[LocationSimulator] Starting simulation...');

    // Set initial position and permission
    useLocationStore.setState({
      permissionState: 'granted',
      isTracking: true
    });

    // Emit first position immediately
    this.emitPosition();

    // Start interval
    const interval = this.options.intervalMs! / (this.options.speedMultiplier || 1);
    this.intervalId = setInterval(() => {
      this.currentIndex++;

      if (this.currentIndex >= this.route.length) {
        if (this.options.loop) {
          this.currentIndex = 0;
        } else {
          this.stop();
          return;
        }
      }

      this.emitPosition();
    }, interval);

    return this;
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[LocationSimulator] Simulation stopped');
    }
    return this;
  }

  reset() {
    this.stop();
    this.currentIndex = 0;
    return this;
  }

  jumpToIndex(index: number) {
    if (index >= 0 && index < this.route.length) {
      this.currentIndex = index;
      this.emitPosition();
    }
    return this;
  }

  private emitPosition() {
    const [lat, lng] = this.route[this.currentIndex]!;
    const prevIndex = Math.max(0, this.currentIndex - 1);
    const [prevLat, prevLng] = this.route[prevIndex]!;

    // Calculate heading
    const heading = this.calculateHeading(prevLat, prevLng, lat, lng);

    const position: GeoPosition = {
      latitude: lat,
      longitude: lng,
      heading: heading,
      speed: 15, // ~54 km/h driving speed
      accuracy: 10,
      timestamp: Date.now()
    };

    useLocationStore.getState().updatePosition(position);

    console.log(`[LocationSimulator] Position ${this.currentIndex + 1}/${this.route.length}:`, {
      lat: lat.toFixed(4),
      lng: lng.toFixed(4),
      heading: heading?.toFixed(0)
    });
  }

  private calculateHeading(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;

    const y = Math.sin(dLng) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);

    let heading = Math.atan2(y, x) * 180 / Math.PI;
    return (heading + 360) % 360;
  }

  getStatus() {
    return {
      isRunning: this.intervalId !== null,
      currentIndex: this.currentIndex,
      totalPoints: this.route.length,
      progress: ((this.currentIndex + 1) / this.route.length * 100).toFixed(1) + '%'
    };
  }
}

// Global singleton
export const locationSimulator = new LocationSimulator();

// Console helper for easy testing
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).sim = {
    start: () => locationSimulator.start(),
    stop: () => locationSimulator.stop(),
    reset: () => locationSimulator.reset(),
    status: () => locationSimulator.getStatus(),
    speed: (x: number) => locationSimulator.setOptions({ speedMultiplier: x }),
    interval: (ms: number) => locationSimulator.setOptions({ intervalMs: ms }),
    jump: (i: number) => locationSimulator.jumpToIndex(i),
    help: () => console.log(`
Location Simulator Commands:
  sim.start()     - Start simulation
  sim.stop()      - Stop simulation
  sim.reset()     - Reset to start
  sim.status()    - Get current status
  sim.speed(2)    - Set speed multiplier (2x faster)
  sim.interval(1000) - Set update interval (ms)
  sim.jump(5)     - Jump to position index
    `)
  };

  console.log('[LocationSimulator] Ready! Type sim.help() for commands');
}
