import * as THREE from "../../node_modules/@types/three";

import { directionalLight } from "../lights";

const directionalLightShadowCameraHelper = new THREE.CameraHelper(
  directionalLight.shadow.camera
);

export { directionalLightShadowCameraHelper };
