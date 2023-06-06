import { Scene } from "three";
import { initMesh, renderMesh } from "./render";
import { GRAVITY, PIPE_AREA, PIPE_LENGTH, TERRAIN_MAX_ALT, TERRAIN_SIZE } from "./consts";

let terrainHeight: Float32Array;
let waterHeight: Float32Array;
let tmpHeight: Float32Array;

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
  width = Math.floor(imgWidth / stride);
  height = Math.floor(imgHeight / stride);

  let len = width * height;

  terrainHeight = new Float32Array(len);
  waterHeight = new Float32Array(len);
  tmpHeight = new Float32Array(len);

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
  flowSimulationWaterHeight(timeStep);
  flowSimulationVelocityField();
}

function waterIncrement(timeStep: number) {
  waterHeight[indexOfArr(width / 2, height / 2, width)] += timeStep * 0.1;
  waterHeight[indexOfArr(1 + width / 2, height / 2, width)] += timeStep * 0.1;
  waterHeight[indexOfArr(width / 2, 1 + height / 2, width)] += timeStep * 0.1;
  waterHeight[indexOfArr(1 + width / 2, 1 + height / 2, width)] += timeStep * 0.1;
}

function flowSimulationFlowFlux(timeStep: number) {
  let factor = (timeStep * PIPE_AREA * GRAVITY) / PIPE_LENGTH;
  let lw = TERRAIN_SIZE / width;
  let lh = TERRAIN_SIZE / height;
  for (let w = 0; w < width; w++) {
    for (let h = 0; h < height; h++) {
      let i = indexOfArr(w, h, width);
      let iL = indexOfArr(w - 1, h, width);
      let iR = indexOfArr(w + 1, h, width);
      let iB = indexOfArr(w, h - 1, width);
      let iT = indexOfArr(w, h + 1, width);
      let currHeight = terrainHeight[i] + waterHeight[i];
      if (w === 0) {
        flowL[i] = 0;
      } else {
        let dhL = currHeight - terrainHeight[iL] - waterHeight[iL];
        flowL[i] += factor * dhL;
        if (flowL[i] < 0) flowL[i] = 0;
      }
      if (w === width - 1) {
        flowR[i] = 0;
      } else {
        let dhR = currHeight - terrainHeight[iR] - waterHeight[iR];
        flowR[i] += factor * dhR;
        if (flowR[i] < 0) flowR[i] = 0;
      }
      if (h === 0) {
        flowB[i] = 0;
      } else {
        let dhB = currHeight - terrainHeight[iB] - waterHeight[iB];
        flowB[i] += factor * dhB;
        if (flowB[i] < 0) flowB[i] = 0;
      }
      if (h === height - 1) {
        flowT[i] = 0;
      } else {
        let dhT = currHeight - terrainHeight[iT] - waterHeight[iT];
        flowT[i] += factor * dhT;
        if (flowT[i] < 0) flowT[i] = 0;
      }
      let foTot = flowL[i] + flowR[i] + flowB[i] + flowT[i];
      if (foTot > 0) {
        let K = (waterHeight[i] * (lw * lh)) / timeStep / foTot;
        K = Math.min(1, K);
        flowL[i] *= K;
        flowR[i] *= K;
        flowB[i] *= K;
        flowT[i] *= K;
      }
    }
  }
  if (flowL.includes(NaN)) console.error("flowL includes NaN");
  if (flowR.includes(NaN)) console.error("flowR includes NaN");
  if (flowB.includes(NaN)) console.error("flowB includes NaN");
  if (flowT.includes(NaN)) console.error("flowT includes NaN");
}

function flowSimulationWaterHeight(timeStep: number) {
  let lw = TERRAIN_SIZE / width;
  let lh = TERRAIN_SIZE / height;
  for (let w = 0; w < width; w++) {
    for (let h = 0; h < height; h++) {
      let i = indexOfArr(w, h, width);
      let iL = indexOfArr(w - 1, h, width);
      let iR = indexOfArr(w + 1, h, width);
      let iB = indexOfArr(w, h - 1, width);
      let iT = indexOfArr(w, h + 1, width);
      let dV = -(flowL[i] + flowR[i] + flowB[i] + flowT[i]);
      if (w !== 0) {
        dV += flowR[iL];
      }
      if (w !== width - 1) {
        dV += flowL[iR];
      }
      if (h !== 0) {
        dV += flowT[iB];
      }
      if (h !== height - 1) {
        dV += flowB[iT];
      }
      dV *= timeStep;
      tmpHeight[i] = waterHeight[i];
      waterHeight[i] += dV / (lw * lh);
      tmpHeight[i] = (tmpHeight[i] + waterHeight[i]) / 2;
    }
  }
  if (tmpHeight.includes(NaN)) console.error("tmpHeight includes NaN");
  if (waterHeight.includes(NaN)) console.error("waterHeight includes NaN");
}

function flowSimulationVelocityField() {
  let lw = TERRAIN_SIZE / width;
  let lh = TERRAIN_SIZE / height;
  for (let w = 0; w < width; w++) {
    for (let h = 0; h < height; h++) {
      let i = indexOfArr(w, h, width);
      let iL = indexOfArr(w - 1, h, width);
      let iR = indexOfArr(w + 1, h, width);
      let iB = indexOfArr(w, h - 1, width);
      let iT = indexOfArr(w, h + 1, width);
      let fiR, fiL, fiT, fiB;
      if (w === 0) {
        fiR = 0;
      } else {
        fiR = flowR[iL];
      }
      if (w === width - 1) {
        fiL = 0;
      } else {
        fiL = flowL[iR];
      }
      if (h === 0) {
        fiT = 0;
      } else {
        fiT = flowT[iB];
      }
      if (h === height - 1) {
        fiB = 0;
      } else {
        fiB = flowB[iT];
      }
      let dWw = (fiR - flowL[i] + flowR[i] - fiL) / 2;
      let dWh = (fiT - flowB[i] + flowT[i] - fiB) / 2;
      if (tmpHeight[i] !== 0) {
        velLR[i] = dWw / (lw * tmpHeight[i]);
        velBT[i] = dWh / (lh * tmpHeight[i]);
      }
    }
  }
  if (velLR.includes(NaN)) console.error("velLR includes NaN");
  if (velBT.includes(NaN)) console.error("velBT includes NaN");
}

function erosionDeposition() {}

function sedimentTransport(timeStep: number) {}

function evaporation(timeStep: number) {}
