import { TemperatureUnit, WindSpeedUnit } from '../types/weather';

export type WeatherVisualCategory =
  | 'clear-day'
  | 'clear-night'
  | 'partly-cloudy'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'snow'
  | 'thunderstorm';

export interface WeatherConditionMeta {
  label: string;
  visual: WeatherVisualCategory;
  heroGradient: string;
}

export function convertTemperatureValue(
  tempC: number,
  unit: TemperatureUnit
): number {
  if (unit === 'fahrenheit') {
    return (tempC * 9) / 5 + 32;
  }
  return tempC;
}

export function formatTemperature(
  tempC: number,
  unit: TemperatureUnit,
  withUnit = true
): string {
  const val = Math.round(convertTemperatureValue(tempC, unit));
  if (!withUnit) return `${val}°`;
  return `${val}°${unit === 'fahrenheit' ? 'F' : 'C'}`;
}

export function convertWindValue(kmh: number, unit: WindSpeedUnit): number {
  if (unit === 'mph') {
    return kmh * 0.621371;
  }
  return kmh;
}

export function formatWindSpeed(kmh: number, unit: WindSpeedUnit): string {
  const val = Math.round(convertWindValue(kmh, unit));
  return `${val} ${unit === 'mph' ? 'mph' : 'km/h'}`;
}

export function formatPressure(hpa: number): string {
  return `${Math.round(hpa)} hPa`;
}

/**
 * Formats an Open-Meteo local ISO timestamp ("YYYY-MM-DDTHH:mm")
 * directly without applying the browser's local timezone offset.
 */
export function formatClockTime(isoDateTime: string): string {
  if (!isoDateTime || !isoDateTime.includes('T')) return '—';
  const timePart = isoDateTime.split('T')[1];
  const [hourStr, minStr] = timePart.split(':');
  const hour24 = Number(hourStr);
  const minute = Number(minStr);
  if (Number.isNaN(hour24) || Number.isNaN(minute)) return timePart;

  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12}:${String(minute).padStart(2, '0')} ${period}`;
}

export function formatHourShort(isoDateTime: string): string {
  if (!isoDateTime || !isoDateTime.includes('T')) return '—';
  const timePart = isoDateTime.split('T')[1];
  const hour24 = Number(timePart.split(':')[0]);
  if (Number.isNaN(hour24)) return timePart;
  const period = hour24 >= 12 ? 'PM' : 'AM';
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${hour12} ${period}`;
}

export function formatCityDate(isoDateTime: string): string {
  const datePart = isoDateTime.split('T')[0];
  const [y, m, d] = datePart.split('-').map(Number);
  if (!y || !m || !d) return datePart;
  const utcDate = new Date(Date.UTC(y, m - 1, d));
  return utcDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function formatForecastDayLabel(
  dateISO: string,
  index: number
): { dayName: string; shortDate: string } {
  const [y, m, d] = dateISO.split('-').map(Number);
  const utcDate = new Date(Date.UTC(y, m - 1, d));
  const shortDate = utcDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });

  if (index === 0) return { dayName: 'Today', shortDate };
  if (index === 1) return { dayName: 'Tomorrow', shortDate };

  const dayName = utcDate.toLocaleDateString('en-US', {
    weekday: 'long',
    timeZone: 'UTC',
  });
  return { dayName, shortDate };
}

export function getWeatherConditionMeta(
  code: number,
  isDay = true
): WeatherConditionMeta {
  if (code === 0) {
    return isDay
      ? {
          label: 'Clear Sky',
          visual: 'clear-day',
          heroGradient:
            'bg-gradient-to-br from-[#0284C7] via-[#0369A1] to-[#1D4ED8] text-white',
        }
      : {
          label: 'Clear Night',
          visual: 'clear-night',
          heroGradient:
            'bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#312E81] text-white',
        };
  }

  if (code === 1 || code === 2) {
    return isDay
      ? {
          label: code === 1 ? 'Mainly Clear' : 'Partly Cloudy',
          visual: 'partly-cloudy',
          heroGradient:
            'bg-gradient-to-br from-[#0EA5E9] via-[#2563EB] to-[#3730A3] text-white',
        }
      : {
          label: code === 1 ? 'Mainly Clear' : 'Partly Cloudy',
          visual: 'clear-night',
          heroGradient:
            'bg-gradient-to-br from-[#1E293B] via-[#1E3A5F] to-[#1E1B4B] text-white',
        };
  }

  if (code === 3) {
    return {
      label: 'Overcast',
      visual: 'cloudy',
      heroGradient:
        'bg-gradient-to-br from-[#334155] via-[#475569] to-[#1E293B] text-white',
    };
  }

  if (code === 45 || code === 48) {
    return {
      label: code === 48 ? 'Rime Fog' : 'Mist & Fog',
      visual: 'fog',
      heroGradient:
        'bg-gradient-to-br from-[#475569] via-[#334155] to-[#1E293B] text-white',
    };
  }

  if (code >= 51 && code <= 57) {
    return {
      label: 'Light Drizzle',
      visual: 'drizzle',
      heroGradient:
        'bg-gradient-to-br from-[#1D4ED8] via-[#1E40AF] to-[#1E293B] text-white',
    };
  }

  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) {
    const label =
      code === 65 || code === 82
        ? 'Heavy Rain'
        : code === 63 || code === 81
          ? 'Moderate Rain'
          : 'Light Rain';
    return {
      label,
      visual: 'rain',
      heroGradient:
        'bg-gradient-to-br from-[#1E3A8A] via-[#1D4ED8] to-[#0F172A] text-white',
    };
  }

  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return {
      label: 'Snowfall',
      visual: 'snow',
      heroGradient:
        'bg-gradient-to-br from-[#3B82F6] via-[#2563EB] to-[#1E3A8A] text-white',
    };
  }

  if (code >= 95 && code <= 99) {
    return {
      label: 'Thunderstorm',
      visual: 'thunderstorm',
      heroGradient:
        'bg-gradient-to-br from-[#1E1B4B] via-[#312E81] to-[#0F172A] text-white',
    };
  }

  return {
    label: 'Cloudy',
    visual: 'cloudy',
    heroGradient:
      'bg-gradient-to-br from-[#2563EB] via-[#1D4ED8] to-[#1E293B] text-white',
  };
}
