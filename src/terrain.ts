import { Scene, WebGLRenderer } from "three";
import { initMesh, removeMesh, updateMesh } from "./render";
import { TERRAIN_MAX_ALT } from "./consts";
import { computeTextures, initComputeRenderer, removeComputeRenderer } from "./gpgpu";

let terrainHeight: Float32Array;

let width: number;
let height: number;

function indexOfImg(x: number, y: number, width: number) {
  return 4 * (x * width + y);
}
function indexOfArr(x: number, y: number, width: number) {
  return x * width + y;
}

export function initTerrain(imgData: ImageData, stride: number, scene: Scene, renderer: WebGLRenderer) {
  removeComputeRenderer();
  removeMesh(scene);
  let imgWidth = imgData.width;
  let imgHeight = imgData.height;
  width = Math.floor(imgWidth / stride);
  height = Math.floor(imgHeight / stride);

  let len = width * height;
  terrainHeight = new Float32Array(len);

  for (let w = 0; w < width; w++) {
    for (let h = 0; h < height; h++) {
      let sum = 0;
      for (let sw = w * stride; sw < (w + 1) * stride; sw++) {
        for (let sh = h * stride; sh < (h + 1) * stride; sh++) {
          sum += imgData.data[indexOfImg(sw, sh, imgWidth)];
        }
      }
      sum /= 255 * stride ** 2;
      sum *= TERRAIN_MAX_ALT;
      terrainHeight[indexOfArr(w, h, width)] = sum;
    }
  }

  initComputeRenderer(width, height, terrainHeight, renderer);
  initMesh(width, height, scene);
}

export function updateTerain() {
  computeTextures();
  updateMesh();
}
