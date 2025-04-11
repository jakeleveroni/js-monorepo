import { useQuery } from '@tanstack/react-query';

type Args = {
  lat: number | undefined;
  long: number | undefined;
  enabled: boolean | undefined;
};

export function useGetWeather(args: Args) {
  const { enabled, lat, long } = args;
  return useQuery({
    queryKey: ['weather', lat, long],
    enabled: enabled ?? false,
    queryFn: () =>
      fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${import.meta.env.VITE_WEATHER_API_KEY}&units=metric`,
      ).then((res) => res.json()),
  });
}
