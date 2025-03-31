import { createRoot } from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import FloorBox from './components/floor-box';
import { Stats } from '@react-three/drei';
import { PlayerControls } from './controls/player-controls';
import { Player } from './player/player';
import { Physics } from '@react-three/rapier';
import { DebugProvider } from './debug/debug-provider';
import { DebugOrbitControls } from './debug/debug-camera';
import './styles.css';
import { DebugMenu } from './debug/debug-menu';

// biome-ignore lint/style/noNonNullAssertion: if initial render fails we have bigger prolems
createRoot(document.getElementById('root')!).render(<Root />);

function Root() {
  return (
    <DebugProvider>
      <DebugMenu />
      <PlayerControls>
        <Canvas camera={{ position: [0, 0, 10] }}>
          <Physics debug>
            <ambientLight intensity={Math.PI / 4} />
            <pointLight position={[20, 15, 10]} decay={0} intensity={Math.PI} />
            <Player speed={1} />
            <FloorBox position={[0, 0, 0]} scale={[4, 1, 4]} />
            <Stats />
          </Physics>
          <DebugOrbitControls />
        </Canvas>
      </PlayerControls>
    </DebugProvider>
  );
}
