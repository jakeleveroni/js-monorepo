import * as THREE from "../../node_modules/@types/three";

import { earthMaterial } from "../shared/materials";

const geometry = new THREE.SphereGeometry(0.5, 20, 20);

const sphere = new THREE.Mesh(geometry, earthMaterial);
sphere.position.x = -2;
sphere.castShadow = true;

export default sphere;
