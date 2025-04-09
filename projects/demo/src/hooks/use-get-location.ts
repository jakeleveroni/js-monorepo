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

  console.log(location);

  return {
    location: location ?? { coords: { latitude: 34.111, longitude: 118.111 } },
  };
}
