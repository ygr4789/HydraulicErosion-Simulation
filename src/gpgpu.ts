import * as THREE from "three";
import { CONTROL } from "./control";

import { interactionState } from "./interaction";
import {
  CAPACITY_CONSTANT,
  DAMPING,
  DEPOSITION_CONSTANT,
  EPS,
  EROSION_CONSTANT,
  EVAPORATION,
  GRAVITY,
  PIPE_AREA,
  PIPE_LENGTH,
  TERRAIN_SIZE,
} from "./consts";
import { PRECIPITATION } from "./consts";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer";

export let outputTexture: THREE.Texture;
let gpuCompute: GPUComputationRenderer;

let width: number;
let height: number;

let waterIncreamentUniform: { [uniform: string]: THREE.IUniform<any> };
let fluxSimFluxUniform: { [uniform: string]: THREE.IUniform<any> };
let fluxSimHeightUniform: { [uniform: string]: THREE.IUniform<any> };
let fluxSimVelocityUniform: { [uniform: string]: THREE.IUniform<any> };
let erosionUniform: { [uniform: string]: THREE.IUniform<any> };
let sedimentUniform: { [uniform: string]: THREE.IUniform<any> };
let evaporationUniform: { [uniform: string]: THREE.IUniform<any> };

let waterIncreament: THREE.ShaderMaterial;
let fluxSimFlux: THREE.ShaderMaterial;
let fluxSimHeight: THREE.ShaderMaterial;
let fluxSimVelocity: THREE.ShaderMaterial;
let erosion: THREE.ShaderMaterial;
let sediment: THREE.ShaderMaterial;
let evaporation: THREE.ShaderMaterial;

let h1RenderTarget: THREE.WebGLRenderTarget;
let h2RenderTarget: THREE.WebGLRenderTarget;
let fluxRenderTarget: THREE.WebGLRenderTarget;
let velRenderTarget: THREE.WebGLRenderTarget;

let tmpTarget: THREE.WebGLRenderTarget;

export function initComputeRenderer(width_: number, height_: number, alt: Float32Array, renderer: THREE.WebGLRenderer) {
  width = width_;
  height = height_;
  gpuCompute = new GPUComputationRenderer(width, height, renderer);

  let altTexture = gpuCompute.createTexture();
  fillHeightTexture(altTexture, alt);

  let waterIncreamentShader = require("./shader/waterIncreament.glsl");
  let fluxSimFluxShader = require("./shader/fluxSimFlux.glsl");
  let fluxSimHeightShader = require("./shader/fluxSimHeight.glsl");
  let fluxSimVelocityShader = require("./shader/fluxSimVelocity.glsl");
  let erosionShader = require("./shader/erosion.glsl");
  let sedimentShader = require("./shader/sediment.glsl");
  let evaporationShader = require("./shader/evaporation.glsl");

  waterIncreament = gpuCompute.createShaderMaterial(waterIncreamentShader);
  fluxSimFlux = gpuCompute.createShaderMaterial(fluxSimFluxShader);
  fluxSimHeight = gpuCompute.createShaderMaterial(fluxSimHeightShader);
  fluxSimVelocity = gpuCompute.createShaderMaterial(fluxSimVelocityShader);
  erosion = gpuCompute.createShaderMaterial(erosionShader);
  sediment = gpuCompute.createShaderMaterial(sedimentShader);
  evaporation = gpuCompute.createShaderMaterial(evaporationShader);

  h1RenderTarget = newRenderTarget(gpuCompute);
  h2RenderTarget = newRenderTarget(gpuCompute);
  fluxRenderTarget = newRenderTarget(gpuCompute);
  velRenderTarget = newRenderTarget(gpuCompute);
  tmpTarget = newRenderTarget(gpuCompute);

  gpuCompute.renderTexture(altTexture, h1RenderTarget);
  gpuCompute.renderTexture(altTexture, h2RenderTarget);

  waterIncreamentUniform = waterIncreament.uniforms;
  waterIncreamentUniform.tex_h2 = { value: h2RenderTarget.texture };
  waterIncreamentUniform.u_active = { value: interactionState.isActive };
  waterIncreamentUniform.u_timestep = { value: CONTROL.TIMESTEP };
  waterIncreamentUniform.u_radius = { value: CONTROL.RAINFALL_SIZE };
  waterIncreamentUniform.u_arriv = { value: PRECIPITATION };
  waterIncreamentUniform.u_source = { value: [0.5, 0.5] };

  fluxSimFluxUniform = fluxSimFlux.uniforms;
  fluxSimFluxUniform.tex_h1 = { value: h1RenderTarget.texture };
  fluxSimFluxUniform.tex_flux = { value: fluxRenderTarget.texture };
  fluxSimFluxUniform.u_timestep = { value: CONTROL.TIMESTEP };
  fluxSimFluxUniform.u_gravity = { value: GRAVITY };
  fluxSimFluxUniform.u_damping = { value: DAMPING };
  fluxSimFluxUniform.u_pipeLength = { value: PIPE_LENGTH };
  fluxSimFluxUniform.u_pipeArea = { value: PIPE_AREA };
  fluxSimFluxUniform.u_cellWidth = { value: TERRAIN_SIZE / width };
  fluxSimFluxUniform.u_cellHeight = { value: TERRAIN_SIZE / height };
  fluxSimFluxUniform.u_div = { value: [1 / width, 1 / height] };

  fluxSimHeightUniform = fluxSimHeight.uniforms;
  fluxSimHeightUniform.tex_h1 = { value: h1RenderTarget.texture };
  fluxSimHeightUniform.tex_flux = { value: fluxRenderTarget.texture };
  fluxSimHeightUniform.u_timestep = { value: CONTROL.TIMESTEP };
  fluxSimHeightUniform.u_cellWidth = { value: TERRAIN_SIZE / width };
  fluxSimHeightUniform.u_cellHeight = { value: TERRAIN_SIZE / height };
  fluxSimHeightUniform.u_div = { value: [1 / width, 1 / height] };

  fluxSimVelocityUniform = fluxSimVelocity.uniforms;
  fluxSimVelocityUniform.tex_h1 = { value: h1RenderTarget.texture };
  fluxSimVelocityUniform.tex_h2 = { value: h2RenderTarget.texture };
  fluxSimVelocityUniform.tex_flux = { value: fluxRenderTarget.texture };
  fluxSimVelocityUniform.u_cellWidth = { value: TERRAIN_SIZE / width };
  fluxSimVelocityUniform.u_cellHeight = { value: TERRAIN_SIZE / height };
  fluxSimVelocityUniform.u_div = { value: [1 / width, 1 / height] };

  erosionUniform = erosion.uniforms;
  erosionUniform.tex_h2 = { value: h2RenderTarget.texture };
  erosionUniform.tex_vel = { value: velRenderTarget.texture };
  erosionUniform.u_erosion = { value: EROSION_CONSTANT };
  erosionUniform.u_depsition = { value: DEPOSITION_CONSTANT };
  erosionUniform.u_capacity = { value: CAPACITY_CONSTANT };

  sedimentUniform = sediment.uniforms;
  sedimentUniform.tex_h2 = { value: tmpTarget.texture };
  sedimentUniform.tex_vel = { value: velRenderTarget.texture };
  sedimentUniform.u_timestep = { value: CONTROL.TIMESTEP };
  sedimentUniform.u_cellWidth = { value: TERRAIN_SIZE / width };
  sedimentUniform.u_cellHeight = { value: TERRAIN_SIZE / height };
  sedimentUniform.u_div = { value: [1 / width, 1 / height] };

  evaporationUniform = evaporation.uniforms;
  evaporationUniform.tex_h2 = { value: h2RenderTarget.texture };
  evaporationUniform.u_timestep = { value: CONTROL.TIMESTEP };
  evaporationUniform.u_evaporation = { value: EVAPORATION };
  evaporationUniform.u_epsilon = { value: EPS };

  outputTexture = h1RenderTarget.texture;
}

export function computeTextures() {
  waterIncreamentUniform.u_active.value = interactionState.isActive;
  waterIncreamentUniform.u_radius.value = CONTROL.RAINFALL_SIZE;
  waterIncreamentUniform.u_source.value = [interactionState.norW, interactionState.norH];

  waterIncreamentUniform.u_timestep.value = CONTROL.TIMESTEP;
  fluxSimFluxUniform.u_timestep.value = CONTROL.TIMESTEP;
  fluxSimHeightUniform.u_timestep.value = CONTROL.TIMESTEP;

  gpuCompute.doRenderTarget(waterIncreament, h1RenderTarget);
  gpuCompute.doRenderTarget(fluxSimFlux, tmpTarget);
  gpuCompute.renderTexture(tmpTarget.texture, fluxRenderTarget);
  gpuCompute.doRenderTarget(fluxSimHeight, h2RenderTarget);
  gpuCompute.doRenderTarget(fluxSimVelocity, velRenderTarget);
  gpuCompute.doRenderTarget(erosion, tmpTarget);
  gpuCompute.doRenderTarget(sediment, h2RenderTarget);
  gpuCompute.doRenderTarget(evaporation, tmpTarget)
  gpuCompute.renderTexture(tmpTarget.texture, h2RenderTarget);
}

export function removeComputeRenderer() {
  if (gpuCompute !== undefined) gpuCompute.dispose();
}

function newRenderTarget(gpuCompute: GPUComputationRenderer) {
  return gpuCompute.createRenderTarget(
    width,
    height,
    THREE.RepeatWrapping,
    THREE.RepeatWrapping,
    THREE.NearestFilter,
    THREE.NearestFilter
  );
}

function fillHeightTexture(texture: THREE.DataTexture, alt: Float32Array) {
  const theArray = texture.image.data;
  for (let k = 0, kl = theArray.length; k < kl; k += 4) {
    theArray[k + 0] = alt[k / 4];
    theArray[k + 1] = 0;
    theArray[k + 2] = 0;
    theArray[k + 3] = 1;
  }
}
