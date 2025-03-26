import { useDebugContext } from './debug-provider';

export function DebugMenu() {
  const { orbitEnabled, toggleOrbitCam } = useDebugContext();

  return (
    <div className="bg-gray-200/25 ml-22 w-full rounded py-2">
      <button
        type="button"
        className="rounded bg-green-300 text-black font-bold m-2 p-2"
        onClick={toggleOrbitCam}
      >
        {orbitEnabled ? 'Disable' : 'Enable'} Orbit
      </button>
    </div>
  );
}
