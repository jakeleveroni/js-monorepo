import * as THREE from "../../node_modules/@types/three";
import sphere from "../meshes/sphere";
import torus from "../meshes/torus";
import floor from "../meshes/floor";
import axesHelper from "../helpers/axesHelper";
import {
  directionalLightHelper,
  hemisphereLightHelper,
} from "../helpers/lightHelpers";
import { directionalLightShadowCameraHelper } from "../helpers/shadowCameraHelpers";
import cube from "../meshes/cube";
import { ambientLight, directionalLight, hemisphereLight } from "../lights";

const scene = new THREE.Scene();

// Meshes
scene.add(cube);
scene.add(sphere);
scene.add(torus);
scene.add(floor);

// Lights
scene.add(ambientLight);
scene.add(hemisphereLight);
scene.add(directionalLight);

// Helpers
scene.add(axesHelper);
scene.add(hemisphereLightHelper);
scene.add(directionalLightHelper);
scene.add(directionalLightShadowCameraHelper);

export default scene;
