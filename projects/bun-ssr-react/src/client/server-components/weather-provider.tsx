import { createContext, useContext, type ReactNode, useState, useCallback, useEffect } from 'react';

// Define the shape of the weather data
export interface WeatherData {
  location: string;
  temperature: number;
  conditions: string;
  humidity: number;
  windSpeed: number;
  lastUpdated: string;
}

// Function to fetch weather data - can be used on server or client
export async function fetchWeatherData(location: string): Promise<WeatherData> {
  console.log(`Fetching weather data for ${location}...`);

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Generate some random weather data based on location
  const locationHash = location.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rand = (seed: number) => (locationHash * seed) % 100;

  return {
    location,
    temperature: Math.floor(50 + (rand(7) % 50)),
    conditions: ['Sunny', 'Cloudy', 'Rainy', 'Snowy', 'Partly Cloudy'][rand(13) % 5],
    humidity: Math.floor(30 + (rand(23) % 70)),
    windSpeed: Math.floor(rand(31) % 30),
    lastUpdated: new Date().toISOString(),
  };
}

interface WeatherContextType {
  data: WeatherData | null;
  isLoading: boolean;
  error: string | null;
  refreshWeather: (location?: string) => Promise<void>;
  setLocation: (newLocation: string) => void;
}

const WeatherContext = createContext<WeatherContextType | null>(null);

export function useWeather() {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
}

// Create the provider component
interface WeatherProviderProps {
  children: ReactNode;
  initialData?: WeatherData | null;
}

export function WeatherProvider({ children, initialData = null }: WeatherProviderProps) {
  const [data, setData] = useState<WeatherData | null>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [location, setLocation] = useState(initialData?.location || 'New York');

  const refreshWeather = useCallback(
    async (newLocation?: string) => {
      const targetLocation = newLocation || location;
      setIsLoading(true);
      setError(null);

      try {
        if (typeof window !== 'undefined') {
          // Client-side: fetch from our API endpoint
          const response = await fetch(
            `/api/weather-info?location=${encodeURIComponent(targetLocation)}`,
          );
          if (!response.ok) throw new Error('Failed to fetch weather data');
          const newData = await response.json();
          setData(newData);
        } else {
          // Server-side: use the direct fetch function
          const newData = await fetchWeatherData(targetLocation);
          setData(newData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    },
    [location],
  );

  useEffect(() => {
    if (typeof window !== 'undefined' && (!data || data.location !== location)) {
      refreshWeather();
    }
  }, [location, refreshWeather, data]);

  const contextValue: WeatherContextType = {
    data,
    isLoading,
    error,
    refreshWeather,
    setLocation,
  };

  return <WeatherContext.Provider value={contextValue}>{children}</WeatherContext.Provider>;
}
