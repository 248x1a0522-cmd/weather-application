import {
  CurrentWeather,
  DailyForecastItem,
  HourlyForecastItem,
  SavedCity,
  WeatherBundle,
} from '../types/weather';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

async function fetchWithTimeout(
  url: string,
  timeoutMs = 10000
): Promise<Response> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw new Error(
      'No internet connection detected. Please check your network and retry.'
    );
  }

  const controller = new AbortController();
  const timer = globalThis.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(
        `Weather service responded with status ${response.status}. Please try again.`
      );
    }
    return response;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(
        'Weather request timed out. Please verify your connection and retry.'
      );
    }
    throw err instanceof Error
      ? err
      : new Error('Unable to connect to the weather service.');
  } finally {
    globalThis.clearTimeout(timer);
  }
}

export function buildCityId(lat: number, lon: number): string {
  return `city_${lat.toFixed(3)}_${lon.toFixed(3)}`;
}

export async function searchCities(query: string): Promise<SavedCity[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const url = `${GEOCODING_URL}?name=${encodeURIComponent(
    trimmed
  )}&count=8&language=en&format=json`;
  const res = await fetchWithTimeout(url);
  const data = await res.json();

  if (!data || !Array.isArray(data.results)) {
    return [];
  }

  return data.results.map(
    (item: {
      name: string;
      country?: string;
      admin1?: string;
      latitude: number;
      longitude: number;
      timezone?: string;
    }) => ({
      id: buildCityId(item.latitude, item.longitude),
      name: item.name,
      country: item.country ?? '',
      admin1: item.admin1,
      latitude: item.latitude,
      longitude: item.longitude,
      timezone: item.timezone,
    })
  );
}

export async function fetchWeatherBundle(
  city: SavedCity
): Promise<WeatherBundle> {
  const params = new URLSearchParams({
    latitude: String(city.latitude),
    longitude: String(city.longitude),
    current:
      'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,surface_pressure,wind_speed_10m',
    hourly:
      'temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m,is_day',
    daily:
      'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,wind_speed_10m_max,relative_humidity_2m_mean',
    timezone: 'auto',
    forecast_days: '7',
  });

  const url = `${FORECAST_URL}?${params.toString()}`;
  const res = await fetchWithTimeout(url);
  const data = await res.json();

  if (!data || !data.current || !data.daily || !data.hourly) {
    throw new Error('Received incomplete weather data from the server.');
  }

  const current: CurrentWeather = {
    temperatureC: Number(data.current.temperature_2m),
    apparentTemperatureC: Number(data.current.apparent_temperature),
    humidity: Number(data.current.relative_humidity_2m),
    windSpeedKmh: Number(data.current.wind_speed_10m),
    pressureHpa: Number(data.current.surface_pressure),
    weatherCode: Number(data.current.weather_code),
    isDay: Number(data.current.is_day) === 1,
    timeISO: String(data.current.time),
    sunriseISO: String(data.daily.sunrise?.[0] ?? ''),
    sunsetISO: String(data.daily.sunset?.[0] ?? ''),
  };

  // Extract next 24 hours starting from the city's current hour
  const currentHourPrefix = String(data.current.time).slice(0, 13);
  const hourlyTimes: string[] = Array.isArray(data.hourly.time)
    ? data.hourly.time
    : [];

  let startIdx = hourlyTimes.findIndex((t) =>
    t.startsWith(currentHourPrefix)
  );
  if (startIdx < 0) startIdx = 0;

  const hourly: HourlyForecastItem[] = hourlyTimes
    .slice(startIdx, startIdx + 24)
    .map((timeISO, idx) => {
      const i = startIdx + idx;
      return {
        timeISO,
        temperatureC: Number(data.hourly.temperature_2m?.[i] ?? 0),
        humidity: Number(data.hourly.relative_humidity_2m?.[i] ?? 0),
        precipitationProbability: Number(
          data.hourly.precipitation_probability?.[i] ?? 0
        ),
        windSpeedKmh: Number(data.hourly.wind_speed_10m?.[i] ?? 0),
        weatherCode: Number(data.hourly.weather_code?.[i] ?? 0),
        isDay: Number(data.hourly.is_day?.[i] ?? 1) === 1,
      };
    });

  const dailyTimes: string[] = Array.isArray(data.daily.time)
    ? data.daily.time
    : [];

  const daily: DailyForecastItem[] = dailyTimes.map((dateISO, i) => ({
    dateISO,
    tempMinC: Number(data.daily.temperature_2m_min?.[i] ?? 0),
    tempMaxC: Number(data.daily.temperature_2m_max?.[i] ?? 0),
    precipitationProbabilityMax: Number(
      data.daily.precipitation_probability_max?.[i] ?? 0
    ),
    windSpeedMaxKmh: Number(data.daily.wind_speed_10m_max?.[i] ?? 0),
    humidityMean: Number(data.daily.relative_humidity_2m_mean?.[i] ?? 0),
    weatherCode: Number(data.daily.weather_code?.[i] ?? 0),
    sunriseISO: String(data.daily.sunrise?.[i] ?? ''),
    sunsetISO: String(data.daily.sunset?.[i] ?? ''),
  }));

  return {
    city: {
      ...city,
      timezone: data.timezone ?? city.timezone,
    },
    timezone: String(data.timezone ?? 'UTC'),
    timezoneAbbreviation: String(data.timezone_abbreviation ?? ''),
    current,
    hourly,
    daily,
    fetchedAt: new Date().toISOString(),
  };
}

export async function fetchCurrentForSavedCities(
  cities: SavedCity[]
): Promise<Record<string, CurrentWeather>> {
  if (cities.length === 0) return {};

  const results = await Promise.allSettled(
    cities.map(async (city) => {
      const params = new URLSearchParams({
        latitude: String(city.latitude),
        longitude: String(city.longitude),
        current:
          'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,surface_pressure,wind_speed_10m',
        daily: 'sunrise,sunset',
        timezone: 'auto',
        forecast_days: '1',
      });
      const res = await fetchWithTimeout(`${FORECAST_URL}?${params.toString()}`);
      const data = await res.json();
      const current: CurrentWeather = {
        temperatureC: Number(data.current.temperature_2m),
        apparentTemperatureC: Number(data.current.apparent_temperature),
        humidity: Number(data.current.relative_humidity_2m),
        windSpeedKmh: Number(data.current.wind_speed_10m),
        pressureHpa: Number(data.current.surface_pressure),
        weatherCode: Number(data.current.weather_code),
        isDay: Number(data.current.is_day) === 1,
        timeISO: String(data.current.time),
        sunriseISO: String(data.daily?.sunrise?.[0] ?? ''),
        sunsetISO: String(data.daily?.sunset?.[0] ?? ''),
      };
      return { id: city.id, current };
    })
  );

  const map: Record<string, CurrentWeather> = {};
  for (const res of results) {
    if (res.status === 'fulfilled') {
      map[res.value.id] = res.value.current;
    }
  }
  return map;
}
