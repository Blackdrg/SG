declare module '@react-native-community/geolocation' {
  export interface GeoError extends Error {
    code: number;
    message: string;
  }
  export interface GeoPosition {
    coords: {
      latitude: number;
      longitude: number;
      altitude?: number | null;
      accuracy: number;
      altitudeAccuracy?: number | null;
      heading?: number | null;
      speed?: number | null;
    };
    timestamp: number;
  }
  export function requestAuthorization(): void;
  export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  distanceFilter?: number;
  useSignificantChanges?: boolean;
}

export function getCurrentPosition(success: (position: GeoPosition) => void, error?: (error: GeoError) => void, options?: GeolocationOptions): void;
  export function watchPosition(success: (position: GeoPosition) => void, error?: (error: GeoError) => void, options?: GeolocationOptions): number;
  export function clearWatch(watchId: number): void;
}
