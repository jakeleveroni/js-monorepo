import { useRef } from 'react';
import { RoundedBoxGeometry } from '../geometry/rounded-box-geometry';
import type { Mesh } from 'three';
import type { ThreeElements } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';

export default function FloorBox(props: ThreeElements['mesh']) {
  // biome-ignore lint/style/noNonNullAssertion: is immediate set to mesh element ref
  const meshRef = useRef<Mesh>(null!);

  return (
    <RigidBody type="fixed" colliders={'cuboid'} friction={0}>
      <mesh {...props} ref={meshRef}>
        <primitive object={new RoundedBoxGeometry(4, 0.4, 5, 4, 0.1)} />
        <meshStandardMaterial color={'#4bdb98'} />
      </mesh>
    </RigidBody>
  );
}
