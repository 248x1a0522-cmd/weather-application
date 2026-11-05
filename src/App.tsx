import React, { useState } from 'react';
import { WeatherProvider, useWeather } from './context/WeatherContext';
import { SavedCity, SkyCastScreen } from './types/weather';
import { Navbar } from './components/Navbar';
import { HomeScreen } from './screens/HomeScreen';
import { ForecastScreen } from './screens/ForecastScreen';
import { SavedCitiesScreen } from './screens/SavedCitiesScreen';
import { SettingsScreen } from './screens/SettingsScreen';

const SkyCastShell: React.FC = () => {
  const { status, selectCity, refreshWeather } = useWeather();
  const [activeScreen, setActiveScreen] = useState<SkyCastScreen>('home');

  const handleNavigate = (screen: SkyCastScreen) => {
    setActiveScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCityAndOpen = (
    city: SavedCity,
    targetScreen: SkyCastScreen = 'home'
  ) => {
    selectCity(city);
    setActiveScreen(targetScreen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] dark:bg-[#0B1120] text-[#0F172A] dark:text-[#F1F5F9] pb-20 md:pb-12 transition-colors duration-150">
      <Navbar
        activeScreen={activeScreen}
        isRefreshing={status === 'loading'}
        onNavigate={handleNavigate}
        onRefresh={refreshWeather}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {activeScreen === 'home' && (
          <HomeScreen onNavigate={handleNavigate} />
        )}

        {activeScreen === 'forecast' && <ForecastScreen />}

        {activeScreen === 'saved' && (
          <SavedCitiesScreen onSelectCityAndOpen={handleSelectCityAndOpen} />
        )}

        {activeScreen === 'settings' && <SettingsScreen />}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <WeatherProvider>
      <SkyCastShell />
    </WeatherProvider>
  );
}
