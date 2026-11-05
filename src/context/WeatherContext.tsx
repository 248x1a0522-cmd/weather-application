import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import {
  CurrentWeather,
  SavedCity,
  WeatherBundle,
  WeatherSettings,
} from '../types/weather';
import {
  INITIAL_SAVED_CITIES,
  preferencesService,
} from '../services/preferencesService';
import {
  fetchCurrentForSavedCities,
  fetchWeatherBundle,
} from '../services/weatherService';

export type WeatherLoadStatus = 'loading' | 'error' | 'ready';

interface WeatherContextValue {
  activeCity: SavedCity;
  weatherBundle: WeatherBundle | null;
  status: WeatherLoadStatus;
  errorMessage: string | null;
  isOffline: boolean;

  savedCities: SavedCity[];
  savedCitiesWeather: Record<string, CurrentWeather>;
  savedCitiesLoading: boolean;

  settings: WeatherSettings;

  selectCity: (city: SavedCity) => Promise<void>;
  refreshWeather: () => Promise<void>;
  isCitySaved: (cityId: string) => boolean;
  toggleSaveCity: (city: SavedCity) => void;
  addSavedCity: (city: SavedCity) => void;
  removeSavedCity: (cityId: string) => void;
  clearSavedCities: () => void;
  restoreDefaultCities: () => void;
  updateSettings: (partial: Partial<WeatherSettings>) => void;
}

const WeatherContext = createContext<WeatherContextValue | undefined>(undefined);

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeCity, setActiveCity] = useState<SavedCity>(() =>
    preferencesService.loadActiveCity()
  );
  const [weatherBundle, setWeatherBundle] = useState<WeatherBundle | null>(
    null
  );
  const [status, setStatus] = useState<WeatherLoadStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  const [savedCities, setSavedCities] = useState<SavedCity[]>(() =>
    preferencesService.loadSavedCities()
  );
  const [savedCitiesWeather, setSavedCitiesWeather] = useState<
    Record<string, CurrentWeather>
  >({});
  const [savedCitiesLoading, setSavedCitiesLoading] = useState<boolean>(false);

  const [settings, setSettings] = useState<WeatherSettings>(() =>
    preferencesService.loadSettings()
  );

  // Sync Tailwind v4 dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [settings.theme]);

  // Monitor browser online/offline connectivity
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadCityWeather = useCallback(async (city: SavedCity) => {
    setStatus('loading');
    setErrorMessage(null);
    try {
      const bundle = await fetchWeatherBundle(city);
      setWeatherBundle(bundle);
      setStatus('ready');
    } catch (err) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'Failed to load weather data. Please retry.'
      );
      setStatus('error');
    }
  }, []);

  const refreshSavedCitiesWeather = useCallback(async (cities: SavedCity[]) => {
    if (cities.length === 0) {
      setSavedCitiesWeather({});
      return;
    }
    setSavedCitiesLoading(true);
    try {
      const map = await fetchCurrentForSavedCities(cities);
      setSavedCitiesWeather(map);
    } finally {
      setSavedCitiesLoading(false);
    }
  }, []);

  // Initial load for active city
  useEffect(() => {
    loadCityWeather(activeCity);
  }, [activeCity, loadCityWeather]);

  // Refresh live weather whenever savedCities list changes
  useEffect(() => {
    refreshSavedCitiesWeather(savedCities);
  }, [savedCities, refreshSavedCitiesWeather]);

  const selectCity = useCallback(async (city: SavedCity) => {
    setActiveCity(city);
    preferencesService.saveActiveCity(city);
  }, []);

  const refreshWeather = useCallback(async () => {
    await Promise.all([
      loadCityWeather(activeCity),
      refreshSavedCitiesWeather(savedCities),
    ]);
  }, [activeCity, savedCities, loadCityWeather, refreshSavedCitiesWeather]);

  const isCitySaved = useCallback(
    (cityId: string) => savedCities.some((c) => c.id === cityId),
    [savedCities]
  );

  const addSavedCity = useCallback((city: SavedCity) => {
    setSavedCities((prev) => {
      if (prev.some((c) => c.id === city.id)) return prev;
      const next = [city, ...prev];
      preferencesService.saveCities(next);
      return next;
    });
  }, []);

  const removeSavedCity = useCallback((cityId: string) => {
    setSavedCities((prev) => {
      const next = prev.filter((c) => c.id !== cityId);
      preferencesService.saveCities(next);
      return next;
    });
  }, []);

  const toggleSaveCity = useCallback((city: SavedCity) => {
    setSavedCities((prev) => {
      const exists = prev.some((c) => c.id === city.id);
      const next = exists
        ? prev.filter((c) => c.id !== city.id)
        : [city, ...prev];
      preferencesService.saveCities(next);
      return next;
    });
  }, []);

  const clearSavedCities = useCallback(() => {
    setSavedCities([]);
    setSavedCitiesWeather({});
    preferencesService.saveCities([]);
  }, []);

  const restoreDefaultCities = useCallback(() => {
    setSavedCities(INITIAL_SAVED_CITIES);
    preferencesService.saveCities(INITIAL_SAVED_CITIES);
  }, []);

  const updateSettings = useCallback((partial: Partial<WeatherSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      preferencesService.saveSettings(next);
      return next;
    });
  }, []);

  return (
    <WeatherContext.Provider
      value={{
        activeCity,
        weatherBundle,
        status,
        errorMessage,
        isOffline,
        savedCities,
        savedCitiesWeather,
        savedCitiesLoading,
        settings,
        selectCity,
        refreshWeather,
        isCitySaved,
        toggleSaveCity,
        addSavedCity,
        removeSavedCity,
        clearSavedCities,
        restoreDefaultCities,
        updateSettings,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export function useWeather(): WeatherContextValue {
  const ctx = useContext(WeatherContext);
  if (!ctx) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return ctx;
}
