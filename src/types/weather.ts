export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindSpeedUnit = 'kmh' | 'mph';
export type ThemeMode = 'light' | 'dark';

export type SkyCastScreen = 'home' | 'forecast' | 'saved' | 'settings';

export interface SavedCity {
  id: string;
  name: string;
  country: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
}

export interface CurrentWeather {
  temperatureC: number;
  apparentTemperatureC: number;
  humidity: number;
  windSpeedKmh: number;
  pressureHpa: number;
  weatherCode: number;
  isDay: boolean;
  timeISO: string;
  sunriseISO: string;
  sunsetISO: string;
}

export interface HourlyForecastItem {
  timeISO: string;
  temperatureC: number;
  humidity: number;
  precipitationProbability: number;
  windSpeedKmh: number;
  weatherCode: number;
  isDay: boolean;
}

export interface DailyForecastItem {
  dateISO: string;
  tempMinC: number;
  tempMaxC: number;
  precipitationProbabilityMax: number;
  windSpeedMaxKmh: number;
  humidityMean: number;
  weatherCode: number;
  sunriseISO: string;
  sunsetISO: string;
}

export interface WeatherBundle {
  city: SavedCity;
  timezone: string;
  timezoneAbbreviation: string;
  current: CurrentWeather;
  hourly: HourlyForecastItem[];
  daily: DailyForecastItem[];
  fetchedAt: string;
}

export interface WeatherSettings {
  temperatureUnit: TemperatureUnit;
  windSpeedUnit: WindSpeedUnit;
  theme: ThemeMode;
}
