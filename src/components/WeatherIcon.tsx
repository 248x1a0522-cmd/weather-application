import React from 'react';
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Moon,
  Sun,
} from 'lucide-react';
import { getWeatherConditionMeta } from '../utils/weatherFormatters';

interface WeatherIconProps {
  code: number;
  isDay?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onHero?: boolean;
  animated?: boolean;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({
  code,
  isDay = true,
  size = 'md',
  onHero = false,
  animated = false,
}) => {
  const meta = getWeatherConditionMeta(code, isDay);

  const dimensions =
    size === 'sm'
      ? 'w-5 h-5'
      : size === 'lg'
        ? 'w-9 h-9'
        : size === 'xl'
          ? 'w-16 h-16'
          : 'w-6 h-6';

  const floatClass = animated ? 'weather-float' : '';

  const colorClass = (() => {
    if (onHero) {
      switch (meta.visual) {
        case 'clear-day':
          return 'text-amber-300';
        case 'clear-night':
          return 'text-sky-200';
        case 'thunderstorm':
          return 'text-amber-300';
        default:
          return 'text-white';
      }
    }

    switch (meta.visual) {
      case 'clear-day':
        return 'text-amber-500 dark:text-amber-400';
      case 'clear-night':
        return 'text-indigo-500 dark:text-indigo-300';
      case 'partly-cloudy':
        return 'text-sky-500 dark:text-sky-400';
      case 'cloudy':
      case 'fog':
        return 'text-slate-500 dark:text-slate-400';
      case 'drizzle':
      case 'rain':
        return 'text-blue-600 dark:text-blue-400';
      case 'snow':
        return 'text-cyan-500 dark:text-cyan-300';
      case 'thunderstorm':
        return 'text-amber-500 dark:text-amber-400';
    }
  })();

  const props = {
    className: `${dimensions} ${colorClass} ${floatClass} shrink-0`,
    strokeWidth: size === 'xl' ? 1.75 : 2,
    'aria-hidden': true as const,
  };

  switch (meta.visual) {
    case 'clear-day':
      return <Sun {...props} />;
    case 'clear-night':
      return <Moon {...props} />;
    case 'partly-cloudy':
      return <CloudSun {...props} />;
    case 'cloudy':
      return <Cloud {...props} />;
    case 'fog':
      return <CloudFog {...props} />;
    case 'drizzle':
      return <CloudDrizzle {...props} />;
    case 'rain':
      return <CloudRain {...props} />;
    case 'snow':
      return <CloudSnow {...props} />;
    case 'thunderstorm':
      return <CloudLightning {...props} />;
  }
};
