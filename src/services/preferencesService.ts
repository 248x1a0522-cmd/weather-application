import { SavedCity, WeatherSettings } from '../types/weather';

const SETTINGS_KEY = 'skycast_settings_v1';
const SAVED_CITIES_KEY = 'skycast_saved_cities_v1';
const ACTIVE_CITY_KEY = 'skycast_active_city_v1';
const INITIALIZED_KEY = 'skycast_initialized_v1';

export const DEFAULT_SETTINGS: WeatherSettings = {
  temperatureUnit: 'celsius',
  windSpeedUnit: 'kmh',
  theme: 'light',
};

export const INITIAL_SAVED_CITIES: SavedCity[] = [
  {
    id: 'city_16.300_80.457',
    name: 'Guntur',
    admin1: 'Andhra Pradesh',
    country: 'India',
    latitude: 16.29974,
    longitude: 80.45729,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'city_51.509_-0.126',
    name: 'London',
    admin1: 'England',
    country: 'United Kingdom',
    latitude: 51.50853,
    longitude: -0.12574,
    timezone: 'Europe/London',
  },
  {
    id: 'city_35.690_139.692',
    name: 'Tokyo',
    admin1: 'Tokyo',
    country: 'Japan',
    latitude: 35.6895,
    longitude: 139.69171,
    timezone: 'Asia/Tokyo',
  },
];

export const preferencesService = {
  loadSettings(): WeatherSettings {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(raw);
      return {
        temperatureUnit:
          parsed.temperatureUnit === 'fahrenheit' ? 'fahrenheit' : 'celsius',
        windSpeedUnit: parsed.windSpeedUnit === 'mph' ? 'mph' : 'kmh',
        theme: parsed.theme === 'dark' ? 'dark' : 'light',
      };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: WeatherSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },

  loadSavedCities(): SavedCity[] {
    try {
      const initialized = localStorage.getItem(INITIALIZED_KEY);
      const raw = localStorage.getItem(SAVED_CITIES_KEY);

      if (!initialized && !raw) {
        localStorage.setItem(
          SAVED_CITIES_KEY,
          JSON.stringify(INITIAL_SAVED_CITIES)
        );
        localStorage.setItem(INITIALIZED_KEY, 'true');
        return INITIAL_SAVED_CITIES;
      }

      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (c): c is SavedCity =>
          Boolean(
            c &&
              typeof c.id === 'string' &&
              typeof c.name === 'string' &&
              typeof c.latitude === 'number' &&
              typeof c.longitude === 'number'
          )
      );
    } catch {
      return [];
    }
  },

  saveCities(cities: SavedCity[]): void {
    localStorage.setItem(SAVED_CITIES_KEY, JSON.stringify(cities));
    localStorage.setItem(INITIALIZED_KEY, 'true');
  },

  loadActiveCity(): SavedCity {
    try {
      const raw = localStorage.getItem(ACTIVE_CITY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (
          parsed &&
          typeof parsed.name === 'string' &&
          typeof parsed.latitude === 'number' &&
          typeof parsed.longitude === 'number'
        ) {
          return parsed;
        }
      }
    } catch {
      // Fallback to first saved city
    }
    const saved = this.loadSavedCities();
    return saved[0] ?? INITIAL_SAVED_CITIES[0];
  },

  saveActiveCity(city: SavedCity): void {
    localStorage.setItem(ACTIVE_CITY_KEY, JSON.stringify(city));
  },
};
