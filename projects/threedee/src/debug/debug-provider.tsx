import { createContext, useContext, useState } from 'react';
import type { PropsWithChildren } from 'react';

type DebugOptions = {
  orbitEnabled: boolean;
  toggleOrbitCam: () => void;
};

// biome-ignore lint/style/noNonNullAssertion: context init
const DebugContext = createContext<DebugOptions>(undefined!);

export function DebugProvider(props: PropsWithChildren) {
  const [orbitEnabled, setOrbitEnabled] = useState(false);

  const toggleOrbitCam = () => setOrbitEnabled(!orbitEnabled);

  return <DebugContext value={{ orbitEnabled, toggleOrbitCam }}>{props.children}</DebugContext>;
}

export function useDebugContext() {
  const ctx = useContext(DebugContext);

  if (!ctx) {
    console.error('Must call useDebugContext within a DebugProvider');
  }

  return ctx;
}
