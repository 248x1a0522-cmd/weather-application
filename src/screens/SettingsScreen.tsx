import React, { useState } from 'react';
import {
  Code2,
  Moon,
  RotateCcw,
  Sun,
  Thermometer,
  Trash2,
  Wind,
} from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { FlutterSourceModal } from '../components/FlutterSourceModal';

export const SettingsScreen: React.FC = () => {
  const {
    savedCities,
    settings,
    updateSettings,
    removeSavedCity,
    clearSavedCities,
    restoreDefaultCities,
  } = useWeather();

  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [flutterModalOpen, setFlutterModalOpen] = useState(false);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0F172A] dark:text-[#F1F5F9]">
          Settings
        </h1>
        <p className="mt-1 text-sm text-[#64748B] dark:text-[#94A3B8]">
          Customize temperature and wind units, interface theme, and saved
          cities.
        </p>
      </div>

      {/* 1. Temperature & Wind Units */}
      <section className="rounded-2xl bg-white dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#1E293B] p-5 sm:p-6 space-y-6">
        <div>
          <h2 className="font-display text-base sm:text-lg font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
            Measurement Units
          </h2>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            Preferences are saved locally and applied immediately across all
            weather screens
          </p>
        </div>

        {/* Celsius vs Fahrenheit */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2 text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9]">
            <Thermometer className="w-4 h-4 text-[#0284C7] dark:text-[#38BDF8]" />
            <span>Temperature Unit</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => updateSettings({ temperatureUnit: 'celsius' })}
              className={`min-h-[48px] px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
                settings.temperatureUnit === 'celsius'
                  ? 'border-[#0284C7] dark:border-[#38BDF8] bg-[#F0F9FF] dark:bg-[#1B2845] text-[#0284C7] dark:text-[#38BDF8] font-semibold'
                  : 'border-[#E2E8F0] dark:border-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F4F7FB] dark:hover:bg-[#18223A]'
              }`}
            >
              Celsius (°C)
            </button>

            <button
              type="button"
              onClick={() => updateSettings({ temperatureUnit: 'fahrenheit' })}
              className={`min-h-[48px] px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
                settings.temperatureUnit === 'fahrenheit'
                  ? 'border-[#0284C7] dark:border-[#38BDF8] bg-[#F0F9FF] dark:bg-[#1B2845] text-[#0284C7] dark:text-[#38BDF8] font-semibold'
                  : 'border-[#E2E8F0] dark:border-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F4F7FB] dark:hover:bg-[#18223A]'
              }`}
            >
              Fahrenheit (°F)
            </button>
          </div>
        </div>

        {/* km/h vs mph */}
        <div className="space-y-2.5 pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B]">
          <div className="flex items-center gap-2 text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9]">
            <Wind className="w-4 h-4 text-[#0284C7] dark:text-[#38BDF8]" />
            <span>Wind Speed Unit</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => updateSettings({ windSpeedUnit: 'kmh' })}
              className={`min-h-[48px] px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
                settings.windSpeedUnit === 'kmh'
                  ? 'border-[#0284C7] dark:border-[#38BDF8] bg-[#F0F9FF] dark:bg-[#1B2845] text-[#0284C7] dark:text-[#38BDF8] font-semibold'
                  : 'border-[#E2E8F0] dark:border-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F4F7FB] dark:hover:bg-[#18223A]'
              }`}
            >
              Kilometres/hour (km/h)
            </button>

            <button
              type="button"
              onClick={() => updateSettings({ windSpeedUnit: 'mph' })}
              className={`min-h-[48px] px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
                settings.windSpeedUnit === 'mph'
                  ? 'border-[#0284C7] dark:border-[#38BDF8] bg-[#F0F9FF] dark:bg-[#1B2845] text-[#0284C7] dark:text-[#38BDF8] font-semibold'
                  : 'border-[#E2E8F0] dark:border-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F4F7FB] dark:hover:bg-[#18223A]'
              }`}
            >
              Miles/hour (mph)
            </button>
          </div>
        </div>
      </section>

      {/* 2. Light and Dark Theme Selection */}
      <section className="rounded-2xl bg-white dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#1E293B] p-5 sm:p-6 space-y-4">
        <div>
          <h2 className="font-display text-base sm:text-lg font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
            Appearance Theme
          </h2>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            Choose between crisp daylight and deep night themes
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => updateSettings({ theme: 'light' })}
            className={`min-h-[50px] px-4 py-2.5 rounded-xl border flex items-center justify-center gap-2 text-sm font-medium transition-colors cursor-pointer ${
              settings.theme === 'light'
                ? 'border-[#0284C7] bg-[#F0F9FF] text-[#0284C7] font-semibold'
                : 'border-[#E2E8F0] dark:border-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F4F7FB] dark:hover:bg-[#18223A]'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Light Theme</span>
          </button>

          <button
            type="button"
            onClick={() => updateSettings({ theme: 'dark' })}
            className={`min-h-[50px] px-4 py-2.5 rounded-xl border flex items-center justify-center gap-2 text-sm font-medium transition-colors cursor-pointer ${
              settings.theme === 'dark'
                ? 'border-[#38BDF8] bg-[#1B2845] text-[#38BDF8] font-semibold'
                : 'border-[#E2E8F0] dark:border-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F4F7FB] dark:hover:bg-[#18223A]'
            }`}
          >
            <Moon className="w-4 h-4" />
            <span>Dark Theme</span>
          </button>
        </div>
      </section>

      {/* 3. Manage Saved Cities */}
      <section className="rounded-2xl bg-white dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#1E293B] p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base sm:text-lg font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
              Manage Saved Cities
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] tabular-nums">
              {savedCities.length}{' '}
              {savedCities.length === 1 ? 'saved city' : 'saved cities'} stored
              locally
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={restoreDefaultCities}
              className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] hover:bg-[#F4F7FB] dark:hover:bg-[#18223A] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Defaults</span>
            </button>

            <button
              type="button"
              onClick={() => setClearConfirmOpen(true)}
              disabled={savedCities.length === 0}
              className="inline-flex items-center gap-1.5 min-h-[40px] px-3.5 py-2 rounded-xl border border-rose-200 dark:border-rose-800/60 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 disabled:opacity-45 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>
        </div>

        {savedCities.length === 0 ? (
          <p className="py-4 text-xs text-[#64748B] dark:text-[#94A3B8]">
            No favourite cities saved. Add cities from Current Weather or Saved
            Cities, or restore defaults above.
          </p>
        ) : (
          <div className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B] border-t border-[#E2E8F0] dark:border-[#1E293B]">
            {savedCities.map((city) => (
              <div
                key={city.id}
                className="py-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#0F172A] dark:text-[#F1F5F9] truncate">
                    {city.name}
                  </p>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] truncate">
                    {[city.admin1, city.country].filter(Boolean).join(', ')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeSavedCity(city.id)}
                  aria-label={`Remove ${city.name}`}
                  className="min-h-[38px] px-3 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. About Application Section */}
      <section className="rounded-2xl bg-white dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#1E293B] p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-base sm:text-lg font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
              About SkyCast
            </h2>
            <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed max-w-xl">
              SkyCast provides real-time current weather conditions, hourly
              temperature and rainfall curves, 7-day forecasts, and saved
              city monitoring powered by live public meteorological APIs.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setFlutterModalOpen(true)}
            className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F4F7FB] dark:bg-[#0B1120] text-xs font-semibold text-[#0F172A] dark:text-[#F1F5F9] hover:border-[#0284C7] dark:hover:border-[#38BDF8] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Code2 className="w-4 h-4 text-[#0284C7] dark:text-[#38BDF8]" />
            <span>Flutter Source Code</span>
          </button>
        </div>

        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-[#E2E8F0] dark:border-[#1E293B] text-xs">
          <div>
            <dt className="text-[#64748B] dark:text-[#94A3B8]">Application</dt>
            <dd className="mt-0.5 font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
              SkyCast
            </dd>
          </div>
          <div>
            <dt className="text-[#64748B] dark:text-[#94A3B8]">Weather API</dt>
            <dd className="mt-0.5 font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
              Open-Meteo Live
            </dd>
          </div>
          <div>
            <dt className="text-[#64748B] dark:text-[#94A3B8]">Forecast Span</dt>
            <dd className="mt-0.5 font-mono-num font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
              24h + 7 Days
            </dd>
          </div>
          <div>
            <dt className="text-[#64748B] dark:text-[#94A3B8]">Preferences</dt>
            <dd className="mt-0.5 font-semibold text-[#0F172A] dark:text-[#F1F5F9]">
              Saved Locally
            </dd>
          </div>
        </dl>
      </section>

      <ConfirmDialog
        isOpen={clearConfirmOpen}
        title="Clear All Saved Cities"
        description={`Are you sure you want to remove all ${savedCities.length} saved cities from your favourites list?`}
        confirmLabel="Yes, Clear All"
        onCancel={() => setClearConfirmOpen(false)}
        onConfirm={() => {
          clearSavedCities();
          setClearConfirmOpen(false);
        }}
      />

      <FlutterSourceModal
        isOpen={flutterModalOpen}
        onClose={() => setFlutterModalOpen(false)}
      />
    </div>
  );
};
