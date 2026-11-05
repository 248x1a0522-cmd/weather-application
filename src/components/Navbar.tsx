import React from 'react';
import {
  Bookmark,
  CalendarDays,
  CloudSun,
  RefreshCw,
  Settings,
} from 'lucide-react';
import { SkyCastScreen } from '../types/weather';

interface NavbarProps {
  activeScreen: SkyCastScreen;
  isRefreshing: boolean;
  onNavigate: (screen: SkyCastScreen) => void;
  onRefresh: () => void;
}

const NAV_ITEMS: {
  id: SkyCastScreen;
  label: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  { id: 'home', label: 'Current', icon: CloudSun },
  { id: 'forecast', label: 'Forecast', icon: CalendarDays },
  { id: 'saved', label: 'Saved Cities', icon: Bookmark },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeScreen,
  isRefreshing,
  onNavigate,
  onRefresh,
}) => {
  return (
    <>
      {/* Desktop Top Navigation Bar (Strict 3-Zone Contract) */}
      <header className="hidden md:block sticky top-0 z-30 bg-white/90 dark:bg-[#131C31]/90 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#1E293B]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single-element Brand Wordmark */}
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="font-display text-xl font-bold tracking-tight text-[#0F172A] dark:text-[#F1F5F9] hover:text-[#0284C7] dark:hover:text-[#38BDF8] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            SkyCast
          </button>

          {/* Zone 2: 4 Single-Line Text Navigation Links */}
          <nav
            aria-label="Primary navigation"
            className="flex items-center gap-8"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className={`relative py-5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'text-[#0284C7] dark:text-[#38BDF8] font-semibold'
                      : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F1F5F9]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0284C7] dark:bg-[#38BDF8] rounded-t-full"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 Primary Action Button */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] dark:bg-[#0EA5E9] dark:hover:bg-[#0284C7] text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
            >
              <RefreshCw
                className={`w-4 h-4 shrink-0 ${
                  isRefreshing ? 'animate-spin' : ''
                }`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Compact Top Header */}
      <header className="md:hidden sticky top-0 z-30 h-12 px-4 flex items-center justify-between bg-white/92 dark:bg-[#131C31]/92 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#1E293B]">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="font-display text-lg font-bold tracking-tight text-[#0F172A] dark:text-[#F1F5F9] whitespace-nowrap shrink-0"
        >
          SkyCast
        </button>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-label="Refresh weather"
          className="inline-flex items-center gap-1.5 min-h-[36px] px-3 py-1.5 rounded-lg bg-[#0284C7] dark:bg-[#0EA5E9] text-white text-xs font-medium whitespace-nowrap shrink-0 disabled:opacity-60"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          <span>Refresh</span>
        </button>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-15 bg-white/95 dark:bg-[#131C31]/95 backdrop-blur-md border-t border-[#E2E8F0] dark:border-[#1E293B] grid grid-cols-4 items-center px-1"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 rounded-xl transition-colors ${
                isActive
                  ? 'text-[#0284C7] dark:text-[#38BDF8]'
                  : 'text-[#64748B] dark:text-[#94A3B8]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] font-medium leading-none tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
