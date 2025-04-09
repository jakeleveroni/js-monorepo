import { useState } from 'react';
import { useGetWeather } from '../hooks/data/use-get-weather';
import { useGetLocation } from '../hooks/use-get-location';

export default function Component() {
  const [units, setUnits] = useState<'c' | 'f'>();
  const { location } = useGetLocation();
  const { loading, data, error } = useGetWeather(
    location?.coords.latitude,
    location?.coords.longitude,
  );

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const [temp] = useState<number>((data as any)?.main?.temp ?? 0);
  const [imperialTemp] = useState((temp - 32) / (9 / 5));

  if (loading) {
    return <p>Loading</p>;
  }

  if (error) {
    return <p>Something went wrong :(</p>;
  }

  if (!data) {
    return <p>No weather info found</p>;
  }

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const parsedData = data as any;
  return (
    <div className="w-full p-8 rounded-xl bg-blue-200 text-center">
      <h1 className="text-2xl font-bold">{parsedData.name}</h1>
      <p>{units === 'c' ? temp : imperialTemp}</p>
      <button onClick={() => setUnits(units === 'c' ? 'f' : 'c')} type="button">
        Convert
      </button>
    </div>
  );
}
