import { useEffect, useState } from 'react';

export function useQuery<T>(path: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [data, setData] = useState<T | undefined>();

  const [trigger, setTrigger] = useState(1);

  // biome-ignore lint/correctness/useExhaustiveDependencies: trigger exposes a refetch functionality for the query
  useEffect(() => {
    async function callApi() {
      setLoading(true);
      const res = await fetch(path);

      if (!res.ok) {
        setError(new Error(await res.text()));
        setLoading(false);
        return;
      }

      try {
        const json = (await res.json()) as T;
        setData(json);
      } catch {
        setError(new Error('Failed to parse response'));
        setData(undefined);
      } finally {
        setLoading(false);
      }
    }

    callApi();
  }, [trigger, path]);

  return {
    loading,
    error,
    data,
    fetchCount: trigger,
    refetch: () => setTrigger(trigger + 1),
  };
}
