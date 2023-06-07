import { Scene } from "three";
import { initMesh, renderMesh } from "./render";
import {
  CAPACITY_CONSTANT,
  CONST,
  DEPOSITION_CONSTANT,
  EPS,
  EROSION_CONSTANT,
  EVAPORATION,
  GRAVITY,
  PIPE_AREA,
  PIPE_LENGTH,
  PRECIPITATION,
  TERRAIN_MAX_ALT,
  TERRAIN_SIZE,
} from "./consts";
import { interactionState } from "./interaction";

let terrainHeight: Float32Array;
let waterHeight: Float32Array;
let tmpHeight: Float32Array;

let flowL: Float32Array;
let flowR: Float32Array;
let flowB: Float32Array;
let flowT: Float32Array;

let velLR: Float32Array;
let velBT: Float32Array;

let slope: Float32Array;
let sediment: Float32Array;
let tmpSediment: Float32Array;

let width: number;
let height: number;

function indexOfImg(x: number, y: number, width: number) {
  return 4 * (x * width + y);
}
function indexOfArr(x: number, y: number, width: number) {
  return x * width + y;
}

export function renderTerrain() {
  renderMesh(terrainHeight, waterHeight, sediment);
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

  slope = new Float32Array(len);
  sediment = new Float32Array(len);
  tmpSediment = new Float32Array(len);

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
  erosionDeposition();
  sedimentTransport(timeStep);
  evaporation(timeStep);
}

function waterIncrement(timeStep: number) {
  let IS = interactionState;
  let interactionValid = IS.isActive && IS.onMesh;
  if (interactionValid) {
    let w = Math.round(IS.norW * (width - 1));
    let h = Math.round(IS.norH * (height - 1));
    let dw = Math.round(width * CONST.RAINFALL_SIZE);
    let dh = Math.round(height * CONST.RAINFALL_SIZE);
    for (let w_ = w - dw; w_ <= w + dw; w_++) {
      for (let h_ = h - dh; h_ <= h + dh; h_++) {
        if (w_ >= 0 && w_ < width && h_ >= 0 && h_ < height) {
          let i = indexOfArr(w_, h_, width);
          waterHeight[i] += timeStep * PRECIPITATION;
        }
      }
    }
  }
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
      slope[i] = 0;
      if (w === 0) {
        flowL[i] = 0;
      } else {
        let dhL = currHeight - terrainHeight[iL] - waterHeight[iL];
        slope[i] += Math.abs(dhL);
        flowL[i] += factor * dhL;
        if (flowL[i] < 0) flowL[i] = 0;
      }
      if (w === width - 1) {
        flowR[i] = 0;
      } else {
        let dhR = currHeight - terrainHeight[iR] - waterHeight[iR];
        slope[i] += Math.abs(dhR);
        flowR[i] += factor * dhR;
        if (flowR[i] < 0) flowR[i] = 0;
      }
      if (h === 0) {
        flowB[i] = 0;
      } else {
        let dhB = currHeight - terrainHeight[iB] - waterHeight[iB];
        slope[i] += Math.abs(dhB);
        flowB[i] += factor * dhB;
        if (flowB[i] < 0) flowB[i] = 0;
      }
      if (h === height - 1) {
        flowT[i] = 0;
      } else {
        let dhT = currHeight - terrainHeight[iT] - waterHeight[iT];
        slope[i] += Math.abs(dhT);
        flowT[i] += factor * dhT;
        if (flowT[i] < 0) flowT[i] = 0;
      }
      slope[i] = slope[i] / (2 * (lw + lh) + slope[i]);
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
      if (tmpHeight[i] === 0) {
        velLR[i] = 0;
        velBT[i] = 0;
      } else {
        velLR[i] = dWw / (lw * tmpHeight[i]);
        velBT[i] = dWh / (lh * tmpHeight[i]);
      }
    }
  }
  if (velLR.includes(NaN)) console.error("velLR includes NaN");
  if (velBT.includes(NaN)) console.error("velBT includes NaN");
}

function erosionDeposition() {
  let Ks = EROSION_CONSTANT;
  let Kd = DEPOSITION_CONSTANT;
  for (let w = 0; w < width; w++) {
    for (let h = 0; h < height; h++) {
      let i = indexOfArr(w, h, width);
      let vel = Math.sqrt(velLR[i] ** 2 + velBT[i] ** 2);
      let C = CAPACITY_CONSTANT * slope[i] * vel;
      let s = sediment[i];
      if (C > s) {
        // Erosion
        terrainHeight[i] -= Ks * (C - s);
        sediment[i] += Ks * (C - s);
        tmpSediment[i] = sediment[i];
      } else {
        // Deposition
        terrainHeight[i] += Kd * (s - C);
        sediment[i] -= Kd * (s - C);
        tmpSediment[i] = sediment[i];
      }
    }
  }
  if (terrainHeight.includes(NaN)) console.error("terrainHeight includes NaN");
  if (tmpSediment.includes(NaN)) console.error("tmpSediment includes NaN");
}

function sedimentTransport(timeStep: number) {
  let lw = TERRAIN_SIZE / width;
  let lh = TERRAIN_SIZE / height;
  let cw = [-1, 1, 0, 0];
  let ch = [0, 0, -1, 1];
  for (let w = 0; w < width; w++) {
    for (let h = 0; h < height; h++) {
      let i = indexOfArr(w, h, width);
      let dw = Math.round((velLR[i] * timeStep) / lw);
      let dh = Math.round((velBT[i] * timeStep) / lh);
      let w_ = w - dw;
      let h_ = h - dh;
      if (w_ >= 0 && w_ < width && h_ >= 0 && h_ < height) {
        let i_ = indexOfArr(w_, h_, width);
        sediment[i] = tmpSediment[i_];
      } else {
        let cnt = 0;
        let sum = 0;
        for (let k = 0; k < 4; k++) {
          let nw = w + cw[k];
          let nh = h + ch[k];
          if (nw >= 0 && nw < width && nh >= 0 && nh < height) {
            let ni = indexOfArr(nw, nh, width);
            cnt++;
            sum += sediment[ni];
          }
        }
        sediment[i] = sum;
        if (cnt > 0) sediment[i] /= cnt;
      }
    }
  }
  if (sediment.includes(NaN)) console.error("tmpSediment includes NaN");
}

function evaporation(timeStep: number) {
  let factor = 1 - EVAPORATION * timeStep;
  if (factor < 0) factor = 0;
  for (let w = 0; w < width; w++) {
    for (let h = 0; h < height; h++) {
      let i = indexOfArr(w, h, width);
      waterHeight[i] *= factor;
      if (waterHeight[i] < EPS) waterHeight[i] = 0;
    }
  }
  if (waterHeight.includes(NaN)) console.error("waterHeight includes NaN");
}
