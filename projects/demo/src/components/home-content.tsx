import { useState } from 'react';
import { Link } from 'react-aria-components';

export function Template() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1 className="text-4xl mb-8">Vite + React Template</h1>
      <div className="rounded-xl p-4 bg-white py-5 flex flex-col justify-center gap-y-4">
        <Link href="/other" className="w-full">
          <button
            className="w-full rounded-lg border-2 border-black py-3 p-2 text-black hover:bg-black hover:text-white"
            type="button"
          >
            Go to other
          </button>
        </Link>
        <button
          className="rounded-lg bg-black py-3 p-2 text-white hover:border-black border-2 hover:text-black hover:bg-white"
          type="button"
          onClick={() => setCount((count) => count + 1)}
        >
          count is {count}
        </button>
      </div>
    </>
  );
}
