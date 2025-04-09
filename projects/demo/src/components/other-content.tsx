import { Link } from 'react-aria-components';
import { useQuery } from '../hooks/useQuery';
import { LoaderBar } from './loader-bar';

export function OtherContent() {
  const { loading, data, error, refetch } = useQuery('/some/api/path');

  if (error) {
    return <p className="text-xl text-red font-bold">An error occurred</p>;
  }
  return (
    <>
      <LoaderBar loading={loading} />
      {!loading && data ? <p>Fetched Async Response: {JSON.stringify(data, null, 2)}</p> : null}
      <button
        type="button"
        className="rounded-xl px-3 py-2 text-white bg-black border-black border-2"
        onClick={refetch}
        disabled={loading}
      >
        Refetch
      </button>
      <Link href="/home" className="w-full">
        <button
          className="w-full rounded-lg border-2 border-black py-3 p-2 text-black hover:bg-black hover:text-white"
          type="button"
        >
          Go Home
        </button>
      </Link>
    </>
  );
}
