import { type RefObject, useEffect, useRef } from 'react';
import { Vector3, type PerspectiveCamera as ThreePerspectiveCamera, type Mesh } from 'three';
import { useKeyboardControls, PerspectiveCamera } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { CapsuleCollider, RigidBody } from '@react-three/rapier';
import type { RapierRigidBody } from '@react-three/rapier';
import type { Controls } from '../controls/player-controls';

type Props = {
  speed: number;
};

export function Player(props: Props) {
  const { speed } = props;
  const meshRef = useRef<Mesh>(null);
  const rigidBodyRef = useRef<RapierRigidBody>(null);
  const cameraRef = useRef<ThreePerspectiveCamera>(null);
  const [sub, get] = useKeyboardControls<Controls>();

  // biome-ignore lint/correctness/useExhaustiveDependencies: only subscribe to controls on mount
  useEffect(() => {
    return sub(
      (state) => state,
      (state) => console.log(state),
    );
  }, []);

  useCameraFollow(cameraRef, rigidBodyRef);

  useFrame((_, delta) => {
    if (!rigidBodyRef.current) return;

    const pressed = get();
    if (!pressed.forward && !pressed.back && !pressed.left && !pressed.right) {
      const velocity = rigidBodyRef.current.linvel();

      // Decelerate smoothly by interpolating the velocity
      const newVelocity = {
        x: Math.abs(velocity.x) > 0.01 ? velocity.x - velocity.x * 0.05 : 0,
        y: velocity.y, // keep y velocity intact unless you want gravity to affect it
        z: Math.abs(velocity.z) > 0.01 ? velocity.z - velocity.z * 0.05 : 0,
      };

      rigidBodyRef.current.setLinvel(newVelocity, false);
    }

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

    rigidBodyRef.current.applyImpulse({ x: direction.x, y: 0, z: direction.z }, true);
  });

  return rigidBodyRef ? (
    <>
      <PerspectiveCamera
        ref={cameraRef}
        makeDefault
        position={[0, 8, 20]}
        rotation={[-0.15, 0, 0]}
      />

      <RigidBody
        ref={rigidBodyRef}
        mass={0}
        gravityScale={1.2}
        friction={0}
        type="dynamic"
        lockRotations
        position={[0, 2, 0]}
        linearDamping={0.9}
        angularDamping={0.9}
      >
        <CapsuleCollider args={[0.5, 0.55]} />
        <mesh ref={meshRef}>
          {/* Radius, length, cap segments, radial segments */}
          <capsuleGeometry args={[0.5, 1, 10, 20]} />
          <meshStandardMaterial color="blue" />
        </mesh>
      </RigidBody>
    </>
  ) : null;
}

function useCameraFollow(
  cameraRef: RefObject<ThreePerspectiveCamera | null>,
  targetRef: RefObject<RapierRigidBody | null>,
) {
  const cameraOffset = new Vector3(0, 6, 12);

  useFrame(() => {
    if (!targetRef?.current || !cameraRef?.current) return;

    // Get the player's position
    const { x, y, z } = targetRef.current.translation();

    // Compute the new camera position based on the player's position
    const targetPosition = new Vector3(x, y, z).add(cameraOffset);

    // Smoothly interpolate the camera position
    cameraRef.current.position.lerp(targetPosition, 0.1);

    // Make the camera look at the player
    cameraRef.current.lookAt(x, y, z);
  });
}
