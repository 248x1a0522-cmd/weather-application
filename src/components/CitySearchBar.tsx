import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, Loader2, MapPin, Search, X } from 'lucide-react';
import { SavedCity } from '../types/weather';
import { searchCities } from '../services/weatherService';

interface CitySearchBarProps {
  placeholder?: string;
  submitLabel?: string;
  onSelectCity: (city: SavedCity) => void;
}

export const CitySearchBar: React.FC<CitySearchBarProps> = ({
  placeholder = 'Search any city worldwide (e.g., Guntur, London, Tokyo)...',
  submitLabel = 'Search',
  onSelectCity,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SavedCity[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsSearching(false);
      setApiError(null);
      return;
    }

    let cancelled = false;
    setIsSearching(true);
    setApiError(null);

    const timer = window.setTimeout(async () => {
      try {
        const matches = await searchCities(trimmed);
        if (!cancelled) {
          setResults(matches);
          setActiveIndex(matches.length > 0 ? 0 : -1);
          setDropdownOpen(true);
        }
      } catch (err) {
        if (!cancelled) {
          setApiError(
            err instanceof Error ? err.message : 'Unable to search cities.'
          );
          setResults([]);
          setDropdownOpen(true);
        }
      } finally {
        if (!cancelled) {
          setIsSearching(false);
        }
      }
    }, 260);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [query]);

  const handleChooseCity = (city: SavedCity) => {
    onSelectCity(city);
    setQuery('');
    setResults([]);
    setDropdownOpen(false);
    setValidationError(null);
    setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();

    if (!trimmed) {
      setValidationError('Please enter a city name before searching.');
      return;
    }
    if (trimmed.length < 2) {
      setValidationError('City name must be at least 2 characters long.');
      return;
    }
    if (!/^[a-zA-Z0-9\s\-.,'()]+$/.test(trimmed)) {
      setValidationError(
        'Please enter a valid city name without special symbols.'
      );
      return;
    }

    setValidationError(null);

    if (results.length > 0) {
      const target = results[activeIndex >= 0 ? activeIndex : 0];
      handleChooseCity(target);
      return;
    }

    setIsSearching(true);
    setApiError(null);
    try {
      const matches = await searchCities(trimmed);
      if (matches.length > 0) {
        handleChooseCity(matches[0]);
      } else {
        setResults([]);
        setDropdownOpen(true);
      }
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : 'Failed to look up city.'
      );
      setDropdownOpen(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!dropdownOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Escape') {
      setDropdownOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form
        onSubmit={handleSubmit}
        noValidate
        className="flex items-center gap-2.5"
      >
        <div className="relative flex-1 flex items-center">
          <Search className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (validationError) setValidationError(null);
            }}
            onFocus={() => {
              if (query.trim().length >= 2) setDropdownOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-label="Search city by name"
            className={`w-full min-h-[46px] pl-11 pr-10 py-2.5 rounded-xl bg-white dark:bg-[#131C31] border text-sm text-[#0F172A] dark:text-[#F1F5F9] placeholder:text-[#64748B]/70 dark:placeholder:text-[#94A3B8]/60 focus:outline-none focus:ring-2 transition-colors ${
              validationError
                ? 'border-rose-500 focus:ring-rose-500/20'
                : 'border-[#E2E8F0] dark:border-[#1E293B] focus:border-[#0284C7] dark:focus:border-[#38BDF8] focus:ring-[#0284C7]/20'
            }`}
          />

          {isSearching ? (
            <Loader2 className="w-4 h-4 text-[#0284C7] dark:text-[#38BDF8] animate-spin absolute right-3.5" />
          ) : query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setResults([]);
                setDropdownOpen(false);
                setValidationError(null);
              }}
              aria-label="Clear city search"
              className="absolute right-2 min-w-[32px] min-h-[32px] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>

        <button
          type="submit"
          className="min-h-[46px] px-5 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] dark:bg-[#0EA5E9] dark:hover:bg-[#0284C7] text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {submitLabel}
        </button>
      </form>

      {validationError && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{validationError}</span>
        </p>
      )}

      {/* Autocomplete Results Dropdown */}
      {dropdownOpen && query.trim().length >= 2 && (
        <div
          role="listbox"
          aria-label="Matching cities"
          className="absolute left-0 right-0 mt-2 z-40 rounded-2xl bg-white dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#1E293B] shadow-xl overflow-hidden max-h-80 overflow-y-auto"
        >
          {apiError ? (
            <div className="p-4 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{apiError}</span>
            </div>
          ) : isSearching && results.length === 0 ? (
            <div className="p-4 text-xs text-[#64748B] dark:text-[#94A3B8]">
              Searching worldwide locations...
            </div>
          ) : results.length === 0 ? (
            <div className="p-4 text-xs text-[#64748B] dark:text-[#94A3B8]">
              No matching cities found for &ldquo;{query.trim()}&rdquo;. Check
              spelling or try a nearby major city.
            </div>
          ) : (
            <div className="divide-y divide-[#F1F5F9] dark:divide-[#1E293B]">
              {results.map((city, idx) => {
                const isHighlighted = idx === activeIndex;
                return (
                  <button
                    key={city.id}
                    type="button"
                    role="option"
                    aria-selected={isHighlighted}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => handleChooseCity(city)}
                    className={`w-full min-h-[52px] px-4 py-2.5 flex items-center justify-between gap-3 text-left transition-colors cursor-pointer ${
                      isHighlighted
                        ? 'bg-[#F0F9FF] dark:bg-[#1B2845]'
                        : 'hover:bg-[#F8FAFC] dark:hover:bg-[#17223B]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <MapPin className="w-4 h-4 text-[#0284C7] dark:text-[#38BDF8] shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#0F172A] dark:text-[#F1F5F9] truncate">
                          {city.name}
                        </p>
                        <p className="text-xs text-[#64748B] dark:text-[#94A3B8] truncate">
                          {[city.admin1, city.country]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono-num text-[11px] text-[#64748B] dark:text-[#94A3B8] shrink-0">
                      {city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}°
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
