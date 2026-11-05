import React from 'react';
import {
  AlertCircle,
  ArrowRight,
  Bookmark,
  Check,
  Droplets,
  Gauge,
  RefreshCw,
  Sunrise,
  Sunset,
  WifiOff,
  Wind,
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { SkyCastScreen } from '../types/weather';
import {
  formatCityDate,
  formatClockTime,
  formatHourShort,
  formatPressure,
  formatTemperature,
  formatWindSpeed,
  getWeatherConditionMeta,
} from '../utils/weatherFormatters';
import { CitySearchBar } from '../components/CitySearchBar';
import { WeatherIcon } from '../components/WeatherIcon';

interface HomeScreenProps {
  onNavigate: (screen: SkyCastScreen) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigate }) => {
  const {
    activeCity,
    weatherBundle,
    status,
    errorMessage,
    isOffline,
    settings,
    selectCity,
    refreshWeather,
    isCitySaved,
    toggleSaveCity,
  } = useWeather();

  const tempUnit = settings.temperatureUnit;
  const windUnit = settings.windSpeedUnit;
  const current = weatherBundle?.current;
  const todayDaily = weatherBundle?.daily?.[0];
  const saved = isCitySaved(activeCity.id);

  const conditionMeta = current
    ? getWeatherConditionMeta(current.weatherCode, current.isDay)
    : getWeatherConditionMeta(0, true);

  return (
    <div className="space-y-6">
      {/* Validated Worldwide City Search Bar */}
      <section aria-label="Search weather by city">
        <CitySearchBar
          onSelectCity={(city) => {
            selectCity(city);
          }}
        />
      </section>

      {/* Internet Connectivity Notice */}
      {isOffline && (
        <div
          role="alert"
          className="rounded-2xl border border-amber-300 dark:border-amber-800/60 bg-amber-50/90 dark:bg-amber-950/30 p-4 flex items-center justify-between gap-4 text-amber-950 dark:text-amber-100"
        >
          <div className="flex items-center gap-3">
            <WifiOff className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-xs sm:text-sm font-medium">
              You appear to be offline. Live weather updates require an active
              internet connection.
            </p>
          </div>
          <button
            type="button"
            onClick={refreshWeather}
            className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] whitespace-nowrap shrink-0 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* STATE 1: LOADING SKELETON */}
      {status === 'loading' && (
        <div aria-label="Loading current weather" className="space-y-6">
          <div className="rounded-3xl bg-white dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#1E293B] p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="w-44 h-7 rounded-lg bg-[#E2E8F0] dark:bg-[#1E293B]" />
                <div className="w-56 h-4 rounded bg-[#E2E8F0] dark:bg-[#1E293B]" />
              </div>
              <div className="w-28 h-10 rounded-xl bg-[#E2E8F0] dark:bg-[#1E293B]" />
            </div>
            <div className="flex items-center justify-between pt-4">
              <div className="w-36 h-16 rounded-2xl bg-[#E2E8F0] dark:bg-[#1E293B]" />
              <div className="w-16 h-16 rounded-full bg-[#E2E8F0] dark:bg-[#1E293B]" />
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="h-28 rounded-2xl bg-white dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#1E293B] p-5"
              />
            ))}
          </div>
        </div>
      )}

      {/* STATE 2: ERROR WITH RETRY */}
      {status === 'error' && (
        <div
          role="alert"
          className="rounded-2xl bg-white dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#1E293B] p-8 sm:p-12 text-center max-w-lg mx-auto"
        >
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="mt-4 font-display text-lg font-bold text-[#0F172A] dark:text-[#F1F5F9]">
            Unable to Load Weather for {activeCity.name}
          </h2>
          <p className="mt-1.5 text-sm text-[#64748B] dark:text-[#94A3B8]">
            {errorMessage ||
              'Something went wrong while fetching live meteorological data.'}
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={refreshWeather}
              className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] dark:bg-[#0EA5E9] text-white text-sm font-medium transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      )}

      {/* STATE 3: POPULATED CURRENT WEATHER */}
      {status === 'ready' && weatherBundle && current && (
        <>
          {/* Weather-Based Gradient Hero Card */}
          <section
            aria-label="Current weather overview"
            className={`rounded-3xl p-6 sm:p-8 shadow-sm ${conditionMeta.heroGradient}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl sm:text-4xl font-bold tracking-tight">
                  {weatherBundle.city.name}
                </h1>
                <p className="mt-1 text-sm text-white/85">
                  {[weatherBundle.city.admin1, weatherBundle.city.country]
                    .filter(Boolean)
                    .join(', ')}
                  <span aria-hidden="true"> · </span>
                  <span>{formatCityDate(current.timeISO)}</span>
                  <span aria-hidden="true"> · </span>
                  <span className="font-mono-num">
                    {formatClockTime(current.timeISO)}
                  </span>
                </p>
              </div>

              {/* Save / Remove Favourite City Button */}
              <button
                type="button"
                onClick={() => toggleSaveCity(weatherBundle.city)}
                className={`inline-flex items-center gap-2 min-h-[42px] px-4 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 self-start cursor-pointer ${
                  saved
                    ? 'bg-white text-[#0F172A] hover:bg-white/90'
                    : 'bg-white/15 hover:bg-white/25 text-white border border-white/25'
                }`}
              >
                {saved ? (
                  <>
                    <Check className="w-4 h-4 text-[#0284C7]" />
                    <span>Saved City</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    <span>Save City</span>
                  </>
                )}
              </button>
            </div>

            {/* Temperature + Weather Icon Row */}
            <div className="mt-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="flex items-center gap-5">
                <WeatherIcon
                  code={current.weatherCode}
                  isDay={current.isDay}
                  size="xl"
                  onHero
                  animated
                />
                <div>
                  <p className="font-display text-5xl sm:text-6xl font-bold tracking-tight tabular-nums leading-none">
                    {formatTemperature(current.temperatureC, tempUnit)}
                  </p>
                  <p className="mt-2 text-base sm:text-lg font-medium text-white/95">
                    {conditionMeta.label}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/90 tabular-nums">
                <span>
                  Feels like{' '}
                  <strong className="font-semibold">
                    {formatTemperature(current.apparentTemperatureC, tempUnit)}
                  </strong>
                </span>
                {todayDaily && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span>
                      High{' '}
                      <strong className="font-semibold">
                        {formatTemperature(todayDaily.tempMaxC, tempUnit)}
                      </strong>
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>
                      Low{' '}
                      <strong className="font-semibold">
                        {formatTemperature(todayDaily.tempMinC, tempUnit)}
                      </strong>
                    </span>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* 4-Column Atmospheric Details Grid */}
          <section
            aria-label="Current atmospheric metrics"
            className="grid grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {/* Humidity */}
            <div className="rounded-2xl bg-white dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#1E293B] p-5">
              <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8]">
                <span className="text-xs font-medium">Humidity</span>
                <Droplets className="w-4 h-4 text-[#0284C7] dark:text-[#38BDF8]" />
              </div>
              <p className="mt-2.5 font-mono-num text-2xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                {Math.round(current.humidity)}%
              </p>
              <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
                {current.humidity >= 75
                  ? 'High moisture'
                  : current.humidity >= 40
                    ? 'Comfortable air'
                    : 'Dry air'}
              </p>
            </div>

            {/* Wind Speed */}
            <div className="rounded-2xl bg-white dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#1E293B] p-5">
              <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8]">
                <span className="text-xs font-medium">Wind Speed</span>
                <Wind className="w-4 h-4 text-[#0284C7] dark:text-[#38BDF8]" />
              </div>
              <p className="mt-2.5 font-mono-num text-2xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                {formatWindSpeed(current.windSpeedKmh, windUnit)}
              </p>
              <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
                10m surface wind
              </p>
            </div>

            {/* Pressure */}
            <div className="rounded-2xl bg-white dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#1E293B] p-5">
              <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8]">
                <span className="text-xs font-medium">Pressure</span>
                <Gauge className="w-4 h-4 text-[#0284C7] dark:text-[#38BDF8]" />
              </div>
              <p className="mt-2.5 font-mono-num text-2xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                {formatPressure(current.pressureHpa)}
              </p>
              <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
                {current.pressureHpa >= 1013
                  ? 'Steady high pressure'
                  : 'Low pressure system'}
              </p>
            </div>

            {/* Sunrise & Sunset */}
            <div className="rounded-2xl bg-white dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#1E293B] p-5">
              <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8]">
                <span className="text-xs font-medium">Sunrise &amp; Sunset</span>
                <Sunrise className="w-4 h-4 text-amber-500" />
              </div>
              <div className="mt-2.5 space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    Sunrise
                  </span>
                  <span className="font-mono-num font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                    {formatClockTime(current.sunriseISO)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-xs text-[#64748B] dark:text-[#94A3B8] inline-flex items-center gap-1">
                    <Sunset className="w-3.5 h-3.5 text-orange-500" />
                    Sunset
                  </span>
                  <span className="font-mono-num font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                    {formatClockTime(current.sunsetISO)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Today's Hourly Preview Strip + Link to Multi-Day Forecast */}
          <section className="rounded-2xl bg-white dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#1E293B] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="font-display text-base sm:text-lg font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
                  Hourly Outlook
                </h2>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  Next 24 hours in {weatherBundle.city.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('forecast')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0284C7] dark:text-[#38BDF8] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>7-Day Forecast</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-stretch gap-3 overflow-x-auto pb-2">
              {weatherBundle.hourly.slice(0, 12).map((hour, idx) => (
                <div
                  key={hour.timeISO}
                  className={`min-w-[82px] rounded-xl border p-3 flex flex-col items-center justify-between gap-2.5 text-center shrink-0 ${
                    idx === 0
                      ? 'border-[#0284C7] dark:border-[#38BDF8] bg-[#F0F9FF] dark:bg-[#1B2845]'
                      : 'border-[#E2E8F0] dark:border-[#1E293B] bg-[#F4F7FB]/60 dark:bg-[#0B1120]/50'
                  }`}
                >
                  <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8] whitespace-nowrap">
                    {idx === 0 ? 'Now' : formatHourShort(hour.timeISO)}
                  </span>

                  <WeatherIcon
                    code={hour.weatherCode}
                    isDay={hour.isDay}
                    size="md"
                  />

                  <div className="space-y-0.5">
                    <p className="font-mono-num text-sm font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                      {formatTemperature(hour.temperatureC, tempUnit)}
                    </p>
                    <p className="font-mono-num text-[11px] text-[#0284C7] dark:text-[#38BDF8]">
                      {Math.round(hour.precipitationProbability)}% rain
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};
