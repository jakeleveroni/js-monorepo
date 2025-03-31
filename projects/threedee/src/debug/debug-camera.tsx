import { OrbitControls } from '@react-three/drei';
import { useDebugContext } from './debug-provider';

export function DebugOrbitControls() {
  const { orbitEnabled } = useDebugContext();
  return orbitEnabled ? <OrbitControls /> : null;
}
