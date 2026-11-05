import React from 'react';
import {
  BookmarkPlus,
  Droplets,
  MapPin,
  RotateCcw,
  Trash2,
  Wind,
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { SavedCity, SkyCastScreen } from '../types/weather';
import {
  formatTemperature,
  formatWindSpeed,
  getWeatherConditionMeta,
} from '../utils/weatherFormatters';
import { CitySearchBar } from '../components/CitySearchBar';
import { WeatherIcon } from '../components/WeatherIcon';

interface SavedCitiesScreenProps {
  onSelectCityAndOpen: (city: SavedCity, targetScreen?: SkyCastScreen) => void;
}

export const SavedCitiesScreen: React.FC<SavedCitiesScreenProps> = ({
  onSelectCityAndOpen,
}) => {
  const {
    activeCity,
    savedCities,
    savedCitiesWeather,
    savedCitiesLoading,
    settings,
    isCitySaved,
    addSavedCity,
    removeSavedCity,
    restoreDefaultCities,
  } = useWeather();

  const tempUnit = settings.temperatureUnit;
  const windUnit = settings.windSpeedUnit;
  const currentSaved = isCitySaved(activeCity.id);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-[#F1F5F9]">
            Saved Cities
          </h1>
          <p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8] tabular-nums">
            {savedCities.length}{' '}
            {savedCities.length === 1 ? 'favourite location' : 'favourite locations'}{' '}
            · Tap any city to inspect full weather details
          </p>
        </div>

        {!currentSaved && (
          <button
            type="button"
            onClick={() => addSavedCity(activeCity)}
            className="inline-flex items-center gap-2 min-h-[42px] px-4 py-2 rounded-xl border border-[#0284C7] dark:border-[#38BDF8] text-xs font-semibold text-[#0284C7] dark:text-[#38BDF8] hover:bg-[#F0F9FF] dark:hover:bg-[#1B2845] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <BookmarkPlus className="w-4 h-4" />
            <span>Pin {activeCity.name}</span>
          </button>
        )}
      </div>

      {/* Add Favourite City Search Bar */}
      <section aria-label="Add favourite city">
        <CitySearchBar
          placeholder="Search and add a favourite city (e.g., Paris, Sydney, Bengaluru)..."
          submitLabel="Add City"
          onSelectCity={(city) => {
            addSavedCity(city);
          }}
        />
      </section>

      {/* Empty State */}
      {savedCities.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#1E293B] py-16 px-6 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-[#F0F9FF] dark:bg-[#1B2845] text-[#0284C7] dark:text-[#38BDF8] flex items-center justify-center mx-auto">
            <MapPin className="w-6 h-6" />
          </div>
          <h2 className="mt-4 font-display text-lg font-bold text-[#0F172A] dark:text-[#F1F5F9]">
            No Saved Cities Yet
          </h2>
          <p className="mt-1.5 text-sm text-[#64748B] dark:text-[#94A3B8]">
            Use the search bar above to add favourite cities worldwide, or
            restore default locations to compare live conditions.
          </p>
          <button
            type="button"
            onClick={restoreDefaultCities}
            className="mt-6 inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] dark:bg-[#0EA5E9] text-white text-sm font-medium transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restore Popular Cities</span>
          </button>
        </div>
      ) : (
        /* Saved Cities Live Weather Grid */
        <section
          aria-label="Saved cities live weather"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {savedCities.map((city) => {
            const live = savedCitiesWeather[city.id];
            const isActive = city.id === activeCity.id;
            const meta = live
              ? getWeatherConditionMeta(live.weatherCode, live.isDay)
              : null;

            return (
              <div
                key={city.id}
                className={`rounded-2xl bg-white dark:bg-[#131C31] border transition-colors p-5 flex flex-col justify-between gap-4 ${
                  isActive
                    ? 'border-[#0284C7] dark:border-[#38BDF8]'
                    : 'border-[#E2E8F0] dark:border-[#1E293B] hover:border-[#94A3B8] dark:hover:border-[#334155]'
                }`}
              >
                {/* Top Row: City Name & Remove Action */}
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => onSelectCityAndOpen(city, 'home')}
                    className="flex-1 min-w-0 text-left cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <h2 className="font-display text-lg font-bold text-[#0F172A] dark:text-[#F1F5F9] truncate">
                        {city.name}
                      </h2>
                      {isActive && (
                        <span className="text-xs font-semibold text-[#0284C7] dark:text-[#38BDF8] shrink-0">
                          · Active
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-[#64748B] dark:text-[#94A3B8] truncate">
                      {[city.admin1, city.country].filter(Boolean).join(', ')}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => removeSavedCity(city.id)}
                    aria-label={`Remove ${city.name} from saved cities`}
                    title="Remove city"
                    className="min-w-[40px] min-h-[40px] -mt-1 -mr-1 rounded-xl flex items-center justify-center text-[#64748B] dark:text-[#94A3B8] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Middle Row: Live Weather Icon & Temperature */}
                <button
                  type="button"
                  onClick={() => onSelectCityAndOpen(city, 'home')}
                  className="w-full flex items-center justify-between gap-4 text-left cursor-pointer"
                >
                  {live && meta ? (
                    <>
                      <div className="flex items-center gap-3">
                        <WeatherIcon
                          code={live.weatherCode}
                          isDay={live.isDay}
                          size="lg"
                        />
                        <div>
                          <p className="text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9]">
                            {meta.label}
                          </p>
                          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] tabular-nums">
                            Feels like{' '}
                            {formatTemperature(
                              live.apparentTemperatureC,
                              tempUnit
                            )}
                          </p>
                        </div>
                      </div>

                      <span className="font-mono-num text-3xl font-bold text-[#0F172A] dark:text-[#F1F5F9]">
                        {formatTemperature(live.temperatureC, tempUnit)}
                      </span>
                    </>
                  ) : savedCitiesLoading ? (
                    <div className="w-full py-2 flex items-center justify-between">
                      <div className="w-28 h-5 rounded bg-[#E2E8F0] dark:bg-[#1E293B]" />
                      <div className="w-16 h-8 rounded bg-[#E2E8F0] dark:bg-[#1E293B]" />
                    </div>
                  ) : (
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                      Tap to load live weather
                    </p>
                  )}
                </button>

                {/* Bottom Metrics Footer */}
                {live && (
                  <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between text-xs text-[#64748B] dark:text-[#94A3B8] tabular-nums">
                    <span className="inline-flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-[#0284C7] dark:text-[#38BDF8]" />
                      {Math.round(live.humidity)}% humidity
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Wind className="w-3.5 h-3.5 text-[#0284C7] dark:text-[#38BDF8]" />
                      {formatWindSpeed(live.windSpeedKmh, windUnit)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}
    </div>
  );
};
