import { createRoot } from "react-dom/client";
import { useRef, useState } from "react";
import { useFrame, Canvas } from "@react-three/fiber";
import type { ThreeElements } from "@react-three/fiber";
import { Vector3, type Mesh } from "three";
import "./styles.css";
import { RoundedBoxGeometry } from "./geometry/rounded-box-geometry";

function Box(props: ThreeElements["mesh"]) {
	// biome-ignore lint/style/noNonNullAssertion: is immediate set to mesh element ref
	const meshRef = useRef<Mesh>(null!);
	const [hovered, setHover] = useState(false);
	const [active, setActive] = useState(false);
	useFrame((_, delta) => (meshRef.current.rotation.y += delta));
	return (
		<mesh
			{...props}
			ref={meshRef}
			scale={active ? new Vector3(2, 1, 1) : 1}
			onClick={() => setActive(!active)}
			onPointerOver={() => setHover(true)}
			onPointerOut={() => setHover(false)}
		>
			<primitive object={new RoundedBoxGeometry(4, 0.5, 5, 4, 0.15)} />
			<meshStandardMaterial color={hovered ? "hotpink" : "#4bdb98"} />
		</mesh>
	);
}

// biome-ignore lint/style/noNonNullAssertion: if initial render fails we have bigger problems
createRoot(document.getElementById("root")!).render(
	<Canvas>
		<ambientLight intensity={Math.PI / 2} />
		<spotLight
			position={[10, 10, 10]}
			angle={0.15}
			penumbra={1}
			decay={0}
			intensity={Math.PI}
		/>
		<pointLight position={[-10, -15, -10]} decay={0} intensity={Math.PI} />
		<Box position={[0, 0, 0]} rotation={[0.3, 0, 0]} />
	</Canvas>,
);
