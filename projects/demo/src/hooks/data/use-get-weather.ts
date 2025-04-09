import { useQuery } from '../useQuery';

export function useGetWeather(lat: number | undefined, long: number | undefined) {
  // example request: https://api.openweathermap.org/data/2.5/weather?q={city name}&appid={API key}
  return useQuery(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${import.meta.env.VITE_WEATHER_API_KEY}&units=metric`,
  );
}
