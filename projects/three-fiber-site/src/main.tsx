import { createRoot } from 'react-dom/client';
import { Canvas } from '@react-three/fiber';
import FloorBox from './components/floor-box';
import { Stats, OrbitControls } from '@react-three/drei';
import './styles.css';
import { PlayerControls } from './controls/player-controls';
import { Player } from './player/player';
import { Physics } from '@react-three/rapier';

// biome-ignore lint/style/noNonNullAssertion: if initial render fails we have bigger prolems
createRoot(document.getElementById('root')!).render(
  <PlayerControls>
    <Canvas camera={{ position: [0, 0, 10] }}>
      <Physics debug>
        <ambientLight intensity={Math.PI / 2} />
        <pointLight position={[-20, 15, -10]} decay={0} intensity={Math.PI} />
        <Player speed={2} />
        <FloorBox position={[0, 0, 0]} rotation={[0, 0, 0]} scale={[2, 2, 2]} />
        <OrbitControls />
        <Stats />
      </Physics>
    </Canvas>
  </PlayerControls>,
);
