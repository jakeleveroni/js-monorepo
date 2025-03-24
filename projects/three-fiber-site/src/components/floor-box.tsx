import { useRef, useState } from 'react';
import { RoundedBoxGeometry } from '../geometry/rounded-box-geometry';
import type { Mesh } from 'three';
import type { ThreeElements } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';

export default function FloorBox(props: ThreeElements['mesh']) {
  // biome-ignore lint/style/noNonNullAssertion: is immediate set to mesh element ref
  const meshRef = useRef<Mesh>(null!);
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);

  return (
    <RigidBody type="fixed" colliders={'cuboid'}>
      <mesh
        {...props}
        ref={meshRef}
        onClick={() => setActive(!active)}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <primitive object={new RoundedBoxGeometry(4, 0.4, 5, 4, 0.1)} />
        <meshStandardMaterial color={hovered ? 'hotpink' : '#4bdb98'} />
      </mesh>
    </RigidBody>
  );
}
