import { useEffect, useRef } from 'react';
import { Vector3, type Mesh } from 'three';
import { useKeyboardControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import type { RapierRigidBody } from '@react-three/rapier';
import type { Controls } from '../controls/player-controls';

type Props = {
  speed: number;
};

export function Player(props: Props) {
  const { speed } = props;
  const meshRef = useRef<Mesh>(null);
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const [sub, get] = useKeyboardControls<Controls>();

  // biome-ignore lint/correctness/useExhaustiveDependencies: only subscribe to controls on mount
  useEffect(() => {
    return sub(
      (state) => state.forward,
      (pressed) => {
        console.log('forward', pressed);
      },
    );
  }, []);

  useFrame((_, delta) => {
    if (!rigidBodyRef.current) return;

    const pressed = get();
    const direction = new Vector3();

    if (pressed.forward) {
      direction.z -= 1;
    }
    if (pressed.back) {
      direction.z += 1;
    }
    if (pressed.left) {
      direction.x -= 1;
    }
    if (pressed.right) {
      direction.x += 1;
    }

    if (direction.lengthSq() > 0) {
      // Normalize to prevent diagonal speed boost
      direction.normalize().multiplyScalar(speed);
    }

    rigidBodyRef.current.setLinvel({ x: direction.x, y: 0, z: direction.z }, true);
  });

  return (
    <RigidBody ref={rigidBodyRef} type="kinematicVelocity">
      <mesh ref={meshRef} position={[0, 2, 2]}>
        {/* Radius, length, cap segments, radial segments */}
        <capsuleGeometry args={[0.5, 1, 10, 20]} /> <meshStandardMaterial color="blue" />
      </mesh>
    </RigidBody>
  );
}
