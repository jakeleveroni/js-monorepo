import * as THREE from "../node_modules/@types/three";

const onLoad = () => {
  console.log("loaded");
};
const onProgress = (url: string, loaded: number, total: number) => {
  console.log(`Loading URL: ${url}`);
  console.log(`Percent loaded: ${(100 * loaded) / total}%`);
};
const onError = (url: string) => {
  console.error(`Error loading: ${url}`);
};

const loadingManager = new THREE.LoadingManager(onLoad, onProgress, onError);

const textureLoader = new THREE.TextureLoader(loadingManager);

export { textureLoader };
