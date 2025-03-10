import { createDoubleClickListener } from "./utils/fullscreen";
import canvas from "./canvas";
import { tick } from "./timer";
import torus from "./meshes/torus";
import floor from "./meshes/floor";
import axesHelper from "./helpers/axesHelper";
import {
  directionalLightHelper,
  hemisphereLightHelper,
} from "./helpers/lightHelpers";
import { directionalLightShadowCameraHelper } from "./helpers/shadowCameraHelpers";
import { ambientLight, directionalLight, hemisphereLight } from "./lights";

// import main scene
import scene from "./scenes/base-scene";

function main() {
  startDefaultScene()
}

function startDefaultScene() {
    // Meshes
    scene.add(torus);
    scene.add(floor);
  
    // Lights
    // scene.add(ambientLight);
    // scene.add(hemisphereLight);
    scene.add(directionalLight);
  
    // Helpers
    // scene.add(axesHelper);
    // scene.add(hemisphereLightHelper);
    // scene.add(directionalLightHelper);
    // scene.add(directionalLightShadowCameraHelper);

    // EventListeners
    createDoubleClickListener(canvas);
  
    tick();
}

main();
