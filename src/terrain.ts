import { Scene } from "three";
import { initMesh, renderMesh } from "./render";
import { GRAVITY, PIPE_AREA, PIPE_LENGTH, TERRAIN_MAX_ALT } from "./consts";

let terrainHeight: Float32Array;
let waterHeight: Float32Array;

let flowL: Float32Array;
let flowR: Float32Array;
let flowB: Float32Array;
let flowT: Float32Array;

let velLR: Float32Array;
let velBT: Float32Array;

let sedment: Float32Array;

let width: number;
let height: number;

function indexOfImg(x: number, y: number, width: number) {
  return 4 * (x * width + y);
}
function indexOfArr(x: number, y: number, width: number) {
  return x * width + y;
}

export function renderTerrain() {
  renderMesh(terrainHeight, waterHeight);
}

export function initTerrain(imgData: ImageData, stride: number, scene: Scene) {
  let imgWidth = imgData.width;
  let imgHeight = imgData.height;
  width = imgWidth / stride;
  height = imgHeight / stride;

  let len = width * height;

  terrainHeight = new Float32Array(len);
  waterHeight = new Float32Array(len);

  flowL = new Float32Array(len);
  flowR = new Float32Array(len);
  flowB = new Float32Array(len);
  flowT = new Float32Array(len);

  velLR = new Float32Array(len);
  velBT = new Float32Array(len);

  sedment = new Float32Array(len);

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

  initMesh(terrainHeight, width, height, scene);
}

export function updateTerain(timeStep: number) {
  waterIncrement(timeStep);
  flowSimulationFlowFlux(timeStep);
}

function waterIncrement(timeStep: number) {
  waterHeight[indexOfArr(width / 2, height / 2, width)] += timeStep * 0.1;
  waterHeight[indexOfArr(1 + width / 2, height / 2, width)] += timeStep * 0.1;
  waterHeight[indexOfArr(width / 2, 1 + height / 2, width)] += timeStep * 0.1;
  waterHeight[indexOfArr(1 + width / 2, 1 + height / 2, width)] += timeStep * 0.1;
}

function flowSimulationFlowFlux(timeStep: number) {
  let factor = (timeStep * PIPE_AREA * GRAVITY) / PIPE_LENGTH;
  for (let w = 0; w < width; w++) {
    for (let h = 0; h < height; h++) {
      let i = indexOfArr(w, h, width);
      let iL = indexOfArr(w - 1, h, width);
      let iR = indexOfArr(w + 1, h, width);
      let iB = indexOfArr(w, h - 1, width);
      let iT = indexOfArr(w, h + 1, width);
      if (w === 0) {
        flowL[i] = 0;
      } else {
        let dhL = terrainHeight[i] + waterHeight[i] - terrainHeight[iL] - waterHeight[iL];
        flowL[i] += factor * dhL;
        if (flowL[i] < 0) flowL[i] = 0;
      }
      if (w === width - 1) {
        flowR[i] = 0;
      } else {
        let dhR = terrainHeight[i] + waterHeight[i] - terrainHeight[iR] - waterHeight[iR];
        flowR[i] += factor * dhR;
        if (flowR[i] < 0) flowR[i] = 0;
      }
      if (h === 0) {
        flowB[i] = 0;
      } else {
        let dhB = terrainHeight[i] + waterHeight[i] - terrainHeight[iB] - waterHeight[iB];
        flowB[i] += factor * dhB;
        if (flowB[i] < 0) flowB[i] = 0;
      }
      if (h === height - 1) {
        flowT[i] = 0;
      } else {
        let dhT = terrainHeight[i] + waterHeight[i] - terrainHeight[iT] - waterHeight[iT];
        flowT[i] += factor * dhT;
        if (flowT[i] < 0) flowT[i] = 0;
      }
    }
  }
}

function flowSimulationWaterHeight() {}

function flowSimulationVelocityField() {}

function erosionDeposition() {}

function sedimentTransport(timeStep: number) {}

function evaporation(timeStep: number) {}
