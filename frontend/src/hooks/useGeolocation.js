import { useEffect, useState } from 'react';

const DEFAULT = { lat: 28.6139, lng: 77.209, accuracy: null, error: null, loading: true };

export default function useGeolocation() {
  const [coords, setCoords] = useState(DEFAULT);

  useEffect(() => {
    if (!navigator.geolocation) {
      setCoords((c) => ({ ...c, loading: false, error: 'Geolocation is not supported' }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          error: null,
          loading: false,
        });
      },
      () => {
        setCoords((c) => ({
          ...c,
          loading: false,
          error: 'Location permission denied. Using a default city center.',
        }));
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  return coords;
}
