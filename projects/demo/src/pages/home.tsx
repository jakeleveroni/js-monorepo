import { useState } from 'react';
import { useGetWeather } from '../hooks/data/use-get-weather';
import { useGetLocation } from '../hooks/use-get-location';

export default function Component() {
  const [units, setUnits] = useState<'c' | 'f'>('c');
  const { location } = useGetLocation();
  const { isLoading, data, error } = useGetWeather({
    lat: location?.coords.latitude,
    long: location?.coords.longitude,
    enabled: !!location,
  });

  const formatTemp = () => {
    if (units === 'c') {
      return data.main.temp ?? 0;
    }
    return (data.main.temp * 9) / 5 + 32;
  };

  if (isLoading) {
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
      <p>
        {formatTemp()} {units.toUpperCase()}
      </p>
      <button onClick={() => setUnits(units === 'c' ? 'f' : 'c')} type="button">
        Convert
      </button>
    </div>
  );
}
