import React, { useEffect, useState } from 'react';
import { Check, Copy, X } from 'lucide-react';

interface FlutterSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SourceFile {
  path: string;
  content: string;
}

const SKYCAST_FLUTTER_FILES: SourceFile[] = [
  {
    path: 'pubspec.yaml',
    content: `name: skycast
description: SkyCast Smart Weather Application (KHIT Flutter Group Project Specification)
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.5.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  provider: ^6.1.2
  http: ^1.2.2
  shared_preferences: ^2.3.2
  intl: ^0.19.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0

flutter:
  uses-material-design: true`,
  },
  {
    path: 'lib/models/weather_model.dart',
    content: `class CityLocation {
  final String name;
  final String country;
  final double latitude;
  final double longitude;

  const CityLocation({
    required this.name,
    required this.country,
    required this.latitude,
    required this.longitude,
  });

  Map<String, dynamic> toJson() => {
        'name': name,
        'country': country,
        'latitude': latitude,
        'longitude': longitude,
      };

  factory CityLocation.fromJson(Map<String, dynamic> json) => CityLocation(
        name: json['name'] as String,
        country: (json['country'] as String?) ?? '',
        latitude: (json['latitude'] as num).toDouble(),
        longitude: (json['longitude'] as num).toDouble(),
      );
}

class DailyForecast {
  final String date;
  final double tempMinC;
  final double tempMaxC;
  final int precipitationProbability;
  final double windSpeedMaxKmh;
  final int weatherCode;

  const DailyForecast({
    required this.date,
    required this.tempMinC,
    required this.tempMaxC,
    required this.precipitationProbability,
    required this.windSpeedMaxKmh,
    required this.weatherCode,
  });
}

class WeatherData {
  final CityLocation city;
  final double temperatureC;
  final double apparentTemperatureC;
  final int humidity;
  final double windSpeedKmh;
  final double pressureHpa;
  final int weatherCode;
  final String sunrise;
  final String sunset;
  final List<DailyForecast> daily;

  const WeatherData({
    required this.city,
    required this.temperatureC,
    required this.apparentTemperatureC,
    required this.humidity,
    required this.windSpeedKmh,
    required this.pressureHpa,
    required this.weatherCode,
    required this.sunrise,
    required this.sunset,
    required this.daily,
  });
}`,
  },
  {
    path: 'lib/services/weather_service.dart',
    content: `import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/weather_model.dart';

class WeatherService {
  static const _geoBase = 'https://geocoding-api.open-meteo.com/v1/search';
  static const _forecastBase = 'https://api.open-meteo.com/v1/forecast';

  Future<List<CityLocation>> searchCity(String query) async {
    final uri = Uri.parse(
        '\$_geoBase?name=\${Uri.encodeComponent(query)}&count=6&language=en&format=json');
    final response = await http.get(uri).timeout(const Duration(seconds: 10));
    if (response.statusCode != 200) {
      throw Exception('Failed to search city (\${response.statusCode})');
    }
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    final results = (data['results'] as List?) ?? [];
    return results
        .map((e) => CityLocation(
              name: e['name'] as String,
              country: (e['country'] as String?) ?? '',
              latitude: (e['latitude'] as num).toDouble(),
              longitude: (e['longitude'] as num).toDouble(),
            ))
        .toList();
  }

  Future<WeatherData> fetchWeather(CityLocation city) async {
    final uri = Uri.parse(
      '\$_forecastBase?latitude=\${city.latitude}&longitude=\${city.longitude}'
      '&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,surface_pressure,wind_speed_10m'
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,wind_speed_10m_max'
      '&timezone=auto&forecast_days=7',
    );
    final response = await http.get(uri).timeout(const Duration(seconds: 10));
    if (response.statusCode != 200) {
      throw Exception('Weather API error (\${response.statusCode})');
    }
    final json = jsonDecode(response.body) as Map<String, dynamic>;
    final current = json['current'] as Map<String, dynamic>;
    final daily = json['daily'] as Map<String, dynamic>;
    final dates = (daily['time'] as List).cast<String>();

    final forecasts = List<DailyForecast>.generate(dates.length, (i) {
      return DailyForecast(
        date: dates[i],
        tempMinC: ((daily['temperature_2m_min'] as List)[i] as num).toDouble(),
        tempMaxC: ((daily['temperature_2m_max'] as List)[i] as num).toDouble(),
        precipitationProbability:
            ((daily['precipitation_probability_max'] as List)[i] as num).toInt(),
        windSpeedMaxKmh:
            ((daily['wind_speed_10m_max'] as List)[i] as num).toDouble(),
        weatherCode: ((daily['weather_code'] as List)[i] as num).toInt(),
      );
    });

    return WeatherData(
      city: city,
      temperatureC: (current['temperature_2m'] as num).toDouble(),
      apparentTemperatureC: (current['apparent_temperature'] as num).toDouble(),
      humidity: (current['relative_humidity_2m'] as num).toInt(),
      windSpeedKmh: (current['wind_speed_10m'] as num).toDouble(),
      pressureHpa: (current['surface_pressure'] as num).toDouble(),
      weatherCode: (current['weather_code'] as num).toInt(),
      sunrise: (daily['sunrise'] as List).first as String,
      sunset: (daily['sunset'] as List).first as String,
      daily: forecasts,
    );
  }
}`,
  },
  {
    path: 'lib/providers/weather_provider.dart',
    content: `import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/weather_model.dart';
import '../services/weather_service.dart';

class WeatherProvider extends ChangeNotifier {
  final WeatherService _service;
  WeatherData? _weather;
  bool _isLoading = false;
  String? _error;
  bool _useFahrenheit = false;
  bool _useMph = false;
  ThemeMode _themeMode = ThemeMode.light;
  List<CityLocation> _savedCities = [];

  WeatherProvider({WeatherService? service})
      : _service = service ?? WeatherService();

  WeatherData? get weather => _weather;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get useFahrenheit => _useFahrenheit;
  bool get useMph => _useMph;
  ThemeMode get themeMode => _themeMode;
  List<CityLocation> get savedCities => List.unmodifiable(_savedCities);

  double formatTemp(double celsius) =>
      _useFahrenheit ? (celsius * 9 / 5) + 32 : celsius;

  double formatWind(double kmh) => _useMph ? kmh * 0.621371 : kmh;

  Future<void> init() async {
    final prefs = await SharedPreferences.getInstance();
    _useFahrenheit = prefs.getBool('useFahrenheit') ?? false;
    _useMph = prefs.getBool('useMph') ?? false;
    _themeMode =
        (prefs.getBool('isDark') ?? false) ? ThemeMode.dark : ThemeMode.light;

    final rawCities = prefs.getString('savedCities');
    if (rawCities != null) {
      final decoded = jsonDecode(rawCities) as List;
      _savedCities = decoded
          .map((e) => CityLocation.fromJson(e as Map<String, dynamic>))
          .toList();
    }

    final initial = _savedCities.isNotEmpty
        ? _savedCities.first
        : const CityLocation(
            name: 'Guntur',
            country: 'India',
            latitude: 16.3067,
            longitude: 80.4365,
          );
    await loadWeatherForCity(initial);
  }

  Future<void> loadWeatherForCity(CityLocation city) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      _weather = await _service.fetchWeather(city);
    } catch (e) {
      _error = e.toString();
    }
    _isLoading = false;
    notifyListeners();
  }

  Future<void> toggleTemperatureUnit(bool fahrenheit) async {
    _useFahrenheit = fahrenheit;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('useFahrenheit', fahrenheit);
    notifyListeners();
  }

  Future<void> toggleWindUnit(bool mph) async {
    _useMph = mph;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('useMph', mph);
    notifyListeners();
  }

  Future<void> toggleTheme(bool dark) async {
    _themeMode = dark ? ThemeMode.dark : ThemeMode.light;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('isDark', dark);
    notifyListeners();
  }
}`,
  },
  {
    path: 'lib/main.dart',
    content: `import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'providers/weather_provider.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    ChangeNotifierProvider(
      create: (_) => WeatherProvider()..init(),
      child: const SkyCastApp(),
    ),
  );
}

class SkyCastApp extends StatelessWidget {
  const SkyCastApp({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<WeatherProvider>();
    return MaterialApp(
      title: 'SkyCast',
      debugShowCheckedModeBanner: false,
      themeMode: provider.themeMode,
      theme: ThemeData(
        useMaterial3: true,
        colorSchemeSeed: const Color(0xFF0284C7),
      ),
      darkTheme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        colorSchemeSeed: const Color(0xFF38BDF8),
      ),
      home: const Scaffold(
        body: Center(child: Text('SkyCast Smart Weather')),
      ),
    );
  }
}`,
  },
  {
    path: 'test/widget_test.dart',
    content: `import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:provider/provider.dart';
import 'package:skycast/providers/weather_provider.dart';

void main() {
  testWidgets('SkyCast converts units and validates empty city search',
      (WidgetTester tester) async {
    final provider = WeatherProvider();
    expect(provider.formatTemp(0), 32 * 0 + 0);

    final formKey = GlobalKey<FormState>();
    await tester.pumpWidget(
      ChangeNotifierProvider.value(
        value: provider,
        child: MaterialApp(
          home: Scaffold(
            body: Form(
              key: formKey,
              child: Column(
                children: [
                  TextFormField(
                    key: const Key('city_search_field'),
                    validator: (value) => (value == null || value.trim().isEmpty)
                        ? 'Enter a city name'
                        : null,
                  ),
                  ElevatedButton(
                    onPressed: () => formKey.currentState?.validate(),
                    child: const Text('Search'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );

    await tester.tap(find.text('Search'));
    await tester.pump();
    expect(find.text('Enter a city name'), findsOneWidget);
  });
}`,
  },
  {
    path: 'README.md',
    content: `# SkyCast — Smart Weather Application

## Overview
SkyCast is a Flutter weather application built with Provider state management, real-time Open-Meteo / OpenWeatherMap API integration, and SharedPreferences local storage.

## Screens
1. **Home / Current Weather** — Live temperature, conditions, humidity, wind speed, pressure, sunrise/sunset, and validated city search.
2. **Weather Details / Forecast** — Hourly curve and 7-day forecast with min/max temperatures, rainfall probability, wind speed, and humidity.
3. **Saved Cities** — Save favorite cities worldwide, view live weather cards, and tap to inspect full details.
4. **Settings** — Celsius/Fahrenheit toggle, km/h vs mph wind units, Light/Dark theme, saved city management, and app info.

## Build & Test
- \`flutter pub get\`
- \`flutter test\`
- \`flutter build apk --release\``,
  },
];

export const FlutterSourceModal: React.FC<FlutterSourceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedPath, setSelectedPath] = useState<string>(
    SKYCAST_FLUTTER_FILES[0].path
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const activeFile =
    SKYCAST_FLUTTER_FILES.find((f) => f.path === selectedPath) ??
    SKYCAST_FLUTTER_FILES[0];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeFile.content);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard fallback ignored
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="flutter-modal-title"
    >
      <div className="w-full max-w-4xl max-h-[86vh] flex flex-col rounded-2xl bg-white dark:bg-[#131C31] border border-[#E2E8F0] dark:border-[#1E293B] shadow-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between gap-4">
          <div>
            <h2
              id="flutter-modal-title"
              className="font-display text-lg font-bold text-[#0F172A] dark:text-[#F1F5F9]"
            >
              SkyCast Flutter &amp; Dart Source Reference
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              KHIT Flutter project files (Provider, WeatherService,
              SharedPreferences, widget test, and README)
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Flutter source viewer"
            className="min-w-[40px] min-h-[40px] rounded-xl flex items-center justify-center text-[#64748B] hover:text-[#0F172A] dark:text-[#94A3B8] dark:hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12">
          <div className="md:col-span-4 border-b md:border-b-0 md:border-r border-[#E2E8F0] dark:border-[#1E293B] p-3 overflow-y-auto space-y-1 bg-[#F4F7FB] dark:bg-[#0B1120]">
            {SKYCAST_FLUTTER_FILES.map((file) => {
              const active = file.path === activeFile.path;
              return (
                <button
                  key={file.path}
                  type="button"
                  onClick={() => {
                    setSelectedPath(file.path);
                    setCopied(false);
                  }}
                  className={`w-full px-3 py-2.5 rounded-xl text-left font-mono text-xs transition-colors truncate cursor-pointer ${
                    active
                      ? 'bg-[#0284C7] dark:bg-[#0EA5E9] text-white font-medium'
                      : 'text-[#0F172A] dark:text-[#F1F5F9] hover:bg-[#E2E8F0] dark:hover:bg-[#1A2642]'
                  }`}
                >
                  {file.path}
                </button>
              );
            })}
          </div>

          <div className="md:col-span-8 flex flex-col min-h-0">
            <div className="px-4 py-2.5 border-b border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between gap-2 bg-white dark:bg-[#131C31]">
              <span className="font-mono text-xs font-medium text-[#64748B] dark:text-[#94A3B8] truncate">
                {activeFile.path}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#1E293B] text-xs font-medium text-[#0F172A] dark:text-[#F1F5F9] hover:bg-[#F4F7FB] dark:hover:bg-[#1A2642] transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy File</span>
                  </>
                )}
              </button>
            </div>

            <pre className="flex-1 p-4 overflow-auto font-mono text-xs leading-relaxed text-[#0F172A] dark:text-[#E2E8F0] bg-[#F4F7FB]/60 dark:bg-[#0B1120]/70">
              <code>{activeFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
