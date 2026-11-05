import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  Droplets,
  RefreshCw,
  Sunrise,
  Sunset,
  Wind,
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import {
  convertTemperatureValue,
  formatClockTime,
  formatForecastDayLabel,
  formatHourShort,
  formatTemperature,
  formatWindSpeed,
  getWeatherConditionMeta,
} from '../utils/weatherFormatters';
import { WeatherIcon } from '../components/WeatherIcon';

export const ForecastScreen: React.FC = () => {
  const {
    activeCity,
    weatherBundle,
    status,
    errorMessage,
    savedCities,
    settings,
    selectCity,
    refreshWeather,
  } = useWeather();

  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [hoveredHourIdx, setHoveredHourIdx] = useState<number | null>(null);

  const tempUnit = settings.temperatureUnit;
  const windUnit = settings.windSpeedUnit;

  const weeklyRange = useMemo(() => {
    if (!weatherBundle || weatherBundle.daily.length === 0) {
      return { minC: 0, maxC: 30 };
    }
    const mins = weatherBundle.daily.map((d) => d.tempMinC);
    const maxs = weatherBundle.daily.map((d) => d.tempMaxC);
    return {
      minC: Math.min(...mins),
      maxC: Math.max(...maxs),
    };
  }, [weatherBundle]);

  // SVG hourly temperature curve
  const hourlyChart = useMemo(() => {
    const items = weatherBundle?.hourly.slice(0, 12) ?? [];
    if (items.length === 0) return null;

    const vals = items.map((h) =>
      convertTemperatureValue(h.temperatureC, tempUnit)
    );
    const minV = Math.min(...vals);
    const maxV = Math.max(...vals);
    const span = Math.max(1, maxV - minV);

    const width = 640;
    const height = 140;
    const padX = 28;
    const padTop = 26;
    const padBottom = 26;
    const usableW = width - padX * 2;
    const usableH = height - padTop - padBottom;

    const points = items.map((item, i) => {
      const x =
        items.length > 1
          ? padX + (i / (items.length - 1)) * usableW
          : width / 2;
      const y = padTop + usableH - ((vals[i] - minV) / span) * usableH;
      return { x, y, item, tempVal: Math.round(vals[i]) };
    });

    const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(' ');
    return { width, height, points, polylinePoints };
  }, [weatherBundle, tempUnit]);

  return (
    <div className="space-y-6">
      {/* Page Header & Quick Saved City Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
            {[activeCity.admin1, activeCity.country].filter(Boolean).join(', ')}
          </p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-[#F1F5F9]">
            {activeCity.name} Forecast
          </h1>
        </div>

        {savedCities.length > 1 && (
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#1E293B] overflow-x-auto max-w-full">
            {savedCities.slice(0, 5).map((city) => {
              const isCurrent = city.id === activeCity.id;
              return (
                <button
                  key={city.id}
                  type="button"
                  onClick={() => {
                    setSelectedDayIndex(0);
                    selectCity(city);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isCurrent
                      ? 'bg-[#0284C7] dark:bg-[#0EA5E9] text-white'
                      : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
                  }`}
                >
                  {city.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Loading State */}
      {status === 'loading' && (
        <div className="space-y-4">
          <div className="h-56 rounded-2xl bg-white dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#1E293B] p-6" />
          <div className="h-96 rounded-2xl bg-white dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#1E293B] p-6" />
        </div>
      )}

      {/* Error State */}
      {status === 'error' && (
        <div className="rounded-2xl bg-white dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#1E293B] p-10 text-center max-w-lg mx-auto">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h2 className="mt-3 font-display text-lg font-bold text-[#0F172A] dark:text-[#F1F5F9]">
            Forecast Unavailable
          </h2>
          <p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8]">
            {errorMessage || 'Could not retrieve multi-day forecast data.'}
          </p>
          <button
            type="button"
            onClick={refreshWeather}
            className="mt-5 inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#0284C7] dark:bg-[#0EA5E9] text-white text-sm font-medium cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      )}

      {/* Populated Hourly + 7-Day Forecast */}
      {status === 'ready' && weatherBundle && (
        <>
          {/* Hourly Temperature Curve & Breakdown */}
          <section className="rounded-2xl bg-white dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#1E293B] p-5 sm:p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-base sm:text-lg font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
                  Hourly Temperature &amp; Precipitation
                </h2>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  Next 24 hours · Hover or tap any point to inspect
                </p>
              </div>

              {hoveredHourIdx !== null &&
                weatherBundle.hourly[hoveredHourIdx] && (
                  <div className="text-xs font-medium text-[#0F172A] dark:text-[#F1F5F9] tabular-nums">
                    <span>
                      {formatClockTime(
                        weatherBundle.hourly[hoveredHourIdx].timeISO
                      )}
                    </span>
                    <span aria-hidden="true"> · </span>
                    <span className="font-mono-num font-bold text-[#0284C7] dark:text-[#38BDF8]">
                      {formatTemperature(
                        weatherBundle.hourly[hoveredHourIdx].temperatureC,
                        tempUnit
                      )}
                    </span>
                    <span aria-hidden="true"> · </span>
                    <span>
                      {Math.round(
                        weatherBundle.hourly[hoveredHourIdx]
                          .precipitationProbability
                      )}
                      % rain
                    </span>
                    <span aria-hidden="true"> · </span>
                    <span>
                      {formatWindSpeed(
                        weatherBundle.hourly[hoveredHourIdx].windSpeedKmh,
                        windUnit
                      )}
                    </span>
                  </div>
                )}
            </div>

            {hourlyChart && (
              <div className="w-full overflow-x-auto">
                <svg
                  viewBox={`0 0 ${hourlyChart.width} ${hourlyChart.height}`}
                  className="w-full min-w-[480px] h-auto overflow-visible"
                  role="img"
                  aria-label="Hourly temperature trend chart"
                >
                  <polyline
                    fill="none"
                    stroke="#0284C7"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={hourlyChart.polylinePoints}
                  />
                  {hourlyChart.points.map((pt, idx) => {
                    const isHovered = hoveredHourIdx === idx;
                    return (
                      <g
                        key={pt.item.timeISO}
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredHourIdx(idx)}
                        onMouseLeave={() => setHoveredHourIdx(null)}
                        onClick={() =>
                          setHoveredHourIdx(idx === hoveredHourIdx ? null : idx)
                        }
                      >
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? 6 : 4}
                          className="fill-white dark:fill-[#131C31] stroke-[#0284C7] dark:stroke-[#38BDF8]"
                          strokeWidth="2.5"
                        />
                        <text
                          x={pt.x}
                          y={pt.y - 10}
                          textAnchor="middle"
                          className="fill-[#0F172A] dark:fill-[#F1F5F9] font-mono-num text-[11px] font-semibold"
                        >
                          {pt.tempVal}°
                        </text>
                        <text
                          x={pt.x}
                          y={hourlyChart.height - 6}
                          textAnchor="middle"
                          className="fill-[#64748B] dark:fill-[#94A3B8] text-[10px]"
                        >
                          {idx === 0 ? 'Now' : formatHourShort(pt.item.timeISO)}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            )}

            {/* Hourly Cards Row */}
            <div className="flex items-stretch gap-3 overflow-x-auto pb-1">
              {weatherBundle.hourly.map((hour, idx) => (
                <div
                  key={hour.timeISO}
                  className="min-w-[92px] rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F4F7FB]/60 dark:bg-[#0B1120]/50 p-3 flex flex-col items-center justify-between gap-2 text-center shrink-0"
                >
                  <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                    {idx === 0 ? 'Now' : formatHourShort(hour.timeISO)}
                  </span>
                  <WeatherIcon
                    code={hour.weatherCode}
                    isDay={hour.isDay}
                    size="sm"
                  />
                  <span className="font-mono-num text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                    {formatTemperature(hour.temperatureC, tempUnit)}
                  </span>
                  <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] tabular-nums space-y-0.5">
                    <p className="text-[#0284C7] dark:text-[#38BDF8] font-medium">
                      {Math.round(hour.precipitationProbability)}% rain
                    </p>
                    <p>{formatWindSpeed(hour.windSpeedKmh, windUnit)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 7-Day Multi-Day Forecast */}
          <section className="rounded-2xl bg-white dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#1E293B] overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-[#E2E8F0] dark:border-[#1E293B]">
              <h2 className="font-display text-base sm:text-lg font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
                7-Day Weather Forecast
              </h2>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                Select any day to inspect daily humidity, wind, sunrise, and
                sunset details
              </p>
            </div>

            <div className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
              {weatherBundle.daily.map((day, idx) => {
                const { dayName, shortDate } = formatForecastDayLabel(
                  day.dateISO,
                  idx
                );
                const meta = getWeatherConditionMeta(day.weatherCode, true);
                const isExpanded = selectedDayIndex === idx;

                const totalSpan = Math.max(
                  1,
                  weeklyRange.maxC - weeklyRange.minC
                );
                const leftPct =
                  ((day.tempMinC - weeklyRange.minC) / totalSpan) * 100;
                const widthPct = Math.max(
                  8,
                  ((day.tempMaxC - day.tempMinC) / totalSpan) * 100
                );

                return (
                  <div key={day.dateISO}>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedDayIndex(isExpanded ? -1 : idx)
                      }
                      className="w-full px-5 sm:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-[#F4F7FB]/70 dark:hover:bg-[#18223A] transition-colors text-left cursor-pointer"
                    >
                      {/* Day & Condition */}
                      <div className="flex items-center justify-between md:justify-start gap-4 md:w-64 shrink-0">
                        <div className="min-w-[100px]">
                          <p className="text-sm font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
                            {dayName}
                          </p>
                          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                            {shortDate}
                          </p>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <WeatherIcon code={day.weatherCode} size="md" />
                          <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
                            {meta.label}
                          </span>
                        </div>
                      </div>

                      {/* Rain Probability & Wind */}
                      <div className="flex items-center gap-5 text-xs text-[#64748B] dark:text-[#94A3B8] tabular-nums">
                        <span className="inline-flex items-center gap-1.5 text-[#0284C7] dark:text-[#38BDF8] font-medium">
                          <Droplets className="w-3.5 h-3.5" />
                          {Math.round(day.precipitationProbabilityMax)}%
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Wind className="w-3.5 h-3.5" />
                          {formatWindSpeed(day.windSpeedMaxKmh, windUnit)}
                        </span>
                      </div>

                      {/* Min / Max Thermal Range Bar */}
                      <div className="flex items-center gap-3 md:w-64 shrink-0">
                        <span className="font-mono-num text-xs font-medium text-[#64748B] dark:text-[#94A3B8] w-11 text-right">
                          {formatTemperature(day.tempMinC, tempUnit)}
                        </span>
                        <div className="flex-1 h-2 rounded-full bg-[#E2E8F0] dark:bg-[#1E293B] relative overflow-hidden">
                          <div
                            className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-[#38BDF8] to-[#0284C7]"
                            style={{
                              left: `${leftPct}%`,
                              width: `${widthPct}%`,
                            }}
                          />
                        </div>
                        <span className="font-mono-num text-xs font-bold text-[#0F172A] dark:text-[#F1F5F9] w-11">
                          {formatTemperature(day.tempMaxC, tempUnit)}
                        </span>
                      </div>
                    </button>

                    {/* Expanded Day Details */}
                    {isExpanded && (
                      <div className="px-5 sm:px-6 pb-4 pt-1 bg-[#F4F7FB]/50 dark:bg-[#0B1120]/40 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                        <div>
                          <span className="text-[#64748B] dark:text-[#94A3B8] block">
                            Mean Humidity
                          </span>
                          <span className="mt-0.5 font-mono-num font-semibold text-[#0F172A] dark:text-[#F1F5F9] block">
                            {Math.round(day.humidityMean)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-[#64748B] dark:text-[#94A3B8] block">
                            Peak Wind
                          </span>
                          <span className="mt-0.5 font-mono-num font-semibold text-[#0F172A] dark:text-[#F1F5F9] block">
                            {formatWindSpeed(day.windSpeedMaxKmh, windUnit)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#64748B] dark:text-[#94A3B8] inline-flex items-center gap-1">
                            <Sunrise className="w-3.5 h-3.5 text-amber-500" />
                            Sunrise
                          </span>
                          <span className="mt-0.5 font-mono-num font-semibold text-[#0F172A] dark:text-[#F1F5F9] block">
                            {formatClockTime(day.sunriseISO)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#64748B] dark:text-[#94A3B8] inline-flex items-center gap-1">
                            <Sunset className="w-3.5 h-3.5 text-orange-500" />
                            Sunset
                          </span>
                          <span className="mt-0.5 font-mono-num font-semibold text-[#0F172A] dark:text-[#F1F5F9] block">
                            {formatClockTime(day.sunsetISO)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
};
