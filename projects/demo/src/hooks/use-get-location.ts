import { useEffect, useState } from 'react';

export function useGetLocation() {
  const [location, setLocation] = useState<GeolocationPosition | undefined>(undefined);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (loc) => {
        setLocation(loc);
      },
      () => {},
      {},
    );
  }, []);

  return {
    location,
  };
}
