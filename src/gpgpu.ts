import * as THREE from "three";
import { CONTROL } from "./control";

import { interactionState } from "./interaction";
import { CONST, EPS, TERRAIN_SIZE } from "./consts";
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
let slippageFluxUniform: { [uniform: string]: THREE.IUniform<any> };
let slippageApplyUniform: { [uniform: string]: THREE.IUniform<any> };

let waterIncreament: THREE.ShaderMaterial;
let fluxSimFlux: THREE.ShaderMaterial;
let fluxSimHeight: THREE.ShaderMaterial;
let fluxSimVelocity: THREE.ShaderMaterial;
let erosion: THREE.ShaderMaterial;
let sediment: THREE.ShaderMaterial;
let evaporation: THREE.ShaderMaterial;
let slippageFlux: THREE.ShaderMaterial;
let slippageApply: THREE.ShaderMaterial;

let h1RenderTarget: THREE.WebGLRenderTarget;
let h2RenderTarget: THREE.WebGLRenderTarget;
let fluxRenderTarget: THREE.WebGLRenderTarget;
let velRenderTarget: THREE.WebGLRenderTarget;
let slipRenderTarget: THREE.WebGLRenderTarget;

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
  let slippageFluxShader = require("./shader/slippageFlux.glsl");
  let slippageApplyShader = require("./shader/slippageApply.glsl");

  waterIncreament = gpuCompute.createShaderMaterial(waterIncreamentShader);
  fluxSimFlux = gpuCompute.createShaderMaterial(fluxSimFluxShader);
  fluxSimHeight = gpuCompute.createShaderMaterial(fluxSimHeightShader);
  fluxSimVelocity = gpuCompute.createShaderMaterial(fluxSimVelocityShader);
  erosion = gpuCompute.createShaderMaterial(erosionShader);
  sediment = gpuCompute.createShaderMaterial(sedimentShader);
  evaporation = gpuCompute.createShaderMaterial(evaporationShader);
  slippageFlux = gpuCompute.createShaderMaterial(slippageFluxShader);
  slippageApply = gpuCompute.createShaderMaterial(slippageApplyShader);

  h1RenderTarget = newRenderTarget(gpuCompute);
  h2RenderTarget = newRenderTarget(gpuCompute);
  fluxRenderTarget = newRenderTarget(gpuCompute);
  velRenderTarget = newRenderTarget(gpuCompute);
  slipRenderTarget = newRenderTarget(gpuCompute);
  tmpTarget = newRenderTarget(gpuCompute);

  gpuCompute.renderTexture(altTexture, h1RenderTarget);
  gpuCompute.renderTexture(altTexture, h2RenderTarget);

  waterIncreamentUniform = waterIncreament.uniforms;
  waterIncreamentUniform.tex_h2 = { value: h2RenderTarget.texture };
  waterIncreamentUniform.u_active = { value: interactionState.isActive };
  waterIncreamentUniform.u_timestep = { value: CONTROL.TIMESTEP };
  waterIncreamentUniform.u_radius = { value: CONTROL.RAINFALL_SIZE };
  waterIncreamentUniform.u_arriv = { value: CONST.PRECIPITATION };
  waterIncreamentUniform.u_source = { value: [0.5, 0.5] };

  fluxSimFluxUniform = fluxSimFlux.uniforms;
  fluxSimFluxUniform.tex_h1 = { value: h1RenderTarget.texture };
  fluxSimFluxUniform.tex_flux = { value: fluxRenderTarget.texture };
  fluxSimFluxUniform.u_timestep = { value: CONTROL.TIMESTEP };
  fluxSimFluxUniform.u_gravity = { value: CONST.GRAVITY };
  fluxSimFluxUniform.u_damping = { value: CONST.DAMPING };
  fluxSimFluxUniform.u_pipeLength = { value: CONST.PIPE_LENGTH };
  fluxSimFluxUniform.u_pipeArea = { value: CONST.PIPE_AREA };
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
  erosionUniform.u_erosion = { value: CONST.EROSION_CONSTANT };
  erosionUniform.u_depsition = { value: CONST.DEPOSITION_CONSTANT };
  erosionUniform.u_capacity = { value: CONST.CAPACITY_CONSTANT };
  erosionUniform.u_cellWidth = { value: TERRAIN_SIZE / width };
  erosionUniform.u_cellHeight = { value: TERRAIN_SIZE / height };
  erosionUniform.u_div = { value: [1 / width, 1 / height] };

  sedimentUniform = sediment.uniforms;
  sedimentUniform.tex_h2 = { value: h2RenderTarget.texture };
  sedimentUniform.tex_vel = { value: velRenderTarget.texture };
  sedimentUniform.u_timestep = { value: CONTROL.TIMESTEP };
  sedimentUniform.u_cellWidth = { value: TERRAIN_SIZE / width };
  sedimentUniform.u_cellHeight = { value: TERRAIN_SIZE / height };
  sedimentUniform.u_div = { value: [1 / width, 1 / height] };

  slippageFluxUniform = slippageFlux.uniforms;
  slippageFluxUniform.tex_h2 = { value: h2RenderTarget.texture };
  slippageFluxUniform.u_timestep = { value: CONTROL.TIMESTEP };
  slippageFluxUniform.u_slippage = { value: CONST.THERMAL_CONSTANT };
  slippageFluxUniform.u_talusTangent = { value: CONST.TALUS_TANGENT };
  slippageFluxUniform.u_cellWidth = { value: TERRAIN_SIZE / width };
  slippageFluxUniform.u_cellHeight = { value: TERRAIN_SIZE / height };
  slippageFluxUniform.u_div = { value: [1 / width, 1 / height] };
  
  slippageApplyUniform = slippageApply.uniforms;
  slippageApplyUniform.tex_h2 = { value: h2RenderTarget.texture };
  slippageApplyUniform.tex_slip = { value: slipRenderTarget.texture };
  slippageApplyUniform.u_uncond = { value: CONTROL.UNCONDITIONAL_SLIPPAGE };
  slippageApplyUniform.u_timestep = { value: CONTROL.TIMESTEP };
  slippageApplyUniform.u_epsilon = { value: EPS };
  slippageApplyUniform.u_div = { value: [1 / width, 1 / height] };

  evaporationUniform = evaporation.uniforms;
  evaporationUniform.tex_h2 = { value: h2RenderTarget.texture };
  evaporationUniform.u_timestep = { value: CONTROL.TIMESTEP };
  evaporationUniform.u_evaporation = { value: CONST.EVAPORATION };
  evaporationUniform.u_epsilon = { value: EPS };
  evaporationUniform.u_cellWidth = { value: TERRAIN_SIZE / width };
  evaporationUniform.u_cellHeight = { value: TERRAIN_SIZE / height };
  evaporationUniform.u_div = { value: [1 / width, 1 / height] };

  outputTexture = h1RenderTarget.texture;
}

export function computeTextures() {
  // Setting Interactions
  waterIncreamentUniform.u_active.value = interactionState.isActive;
  waterIncreamentUniform.u_radius.value = CONTROL.RAINFALL_SIZE;
  waterIncreamentUniform.u_source.value = [interactionState.norW, interactionState.norH];
  // Setting Control Values
  waterIncreamentUniform.u_timestep.value = CONTROL.TIMESTEP;
  fluxSimFluxUniform.u_timestep.value = CONTROL.TIMESTEP;
  fluxSimHeightUniform.u_timestep.value = CONTROL.TIMESTEP;
  sedimentUniform.u_timestep.value = CONTROL.TIMESTEP;
  slippageFluxUniform.u_timestep.value = CONTROL.TIMESTEP;
  slippageApplyUniform.u_uncond.value = CONTROL.UNCONDITIONAL_SLIPPAGE;
  evaporationUniform.u_timestep.value = CONTROL.TIMESTEP;
  // Setting Constants (Tuning)
  waterIncreamentUniform.u_arriv.value = CONST.PRECIPITATION;
  fluxSimFluxUniform.u_gravity.value = CONST.GRAVITY;
  fluxSimFluxUniform.u_damping.value = CONST.DAMPING;
  fluxSimFluxUniform.u_pipeLength.value = CONST.PIPE_LENGTH;
  fluxSimFluxUniform.u_pipeArea.value = CONST.PIPE_AREA;
  erosionUniform.u_erosion.value = CONST.EROSION_CONSTANT;
  erosionUniform.u_depsition.value = CONST.DEPOSITION_CONSTANT;
  erosionUniform.u_capacity.value = CONST.CAPACITY_CONSTANT;
  slippageFluxUniform.u_slippage.value= CONST.THERMAL_CONSTANT;
  slippageFluxUniform.u_talusTangent.value = CONST.TALUS_TANGENT;
  evaporationUniform.u_evaporation.value = CONST.EVAPORATION;

  for (let it = 0; it < CONTROL.ITERATION; it++) {
    computeAll();
  }
}

export function computeAll() {
  // Water Increament
  gpuCompute.doRenderTarget(waterIncreament, h1RenderTarget);
  // Flux Simulation 1
  gpuCompute.doRenderTarget(fluxSimFlux, tmpTarget);
  gpuCompute.renderTexture(tmpTarget.texture, fluxRenderTarget);
  // Flux Simulation 2
  gpuCompute.doRenderTarget(fluxSimHeight, h2RenderTarget);
  // Flux Simulation 3
  gpuCompute.doRenderTarget(fluxSimVelocity, velRenderTarget);
  // Erosion & Deposition
  if (CONTROL.EROSION_DEPOSITOIN_ON) {
    gpuCompute.doRenderTarget(erosion, tmpTarget);
    gpuCompute.renderTexture(tmpTarget.texture, h2RenderTarget);
  }
  // Sediment Transportation
  if (CONTROL.SEDIMENT_TRANSPORTATION_ON) {
    gpuCompute.doRenderTarget(sediment, tmpTarget);
    gpuCompute.renderTexture(tmpTarget.texture, h2RenderTarget);
  }
  if (CONTROL.MATERIAL_SLIPPAGE_ON) {
    // Material Slippage 1
    gpuCompute.doRenderTarget(slippageFlux, tmpTarget);
    gpuCompute.renderTexture(tmpTarget.texture, slipRenderTarget);
    // Material Slippage 2
    gpuCompute.doRenderTarget(slippageApply, tmpTarget);
    gpuCompute.renderTexture(tmpTarget.texture, h2RenderTarget);
    // Evaporation
  }
  gpuCompute.doRenderTarget(evaporation, tmpTarget);
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
    THREE.LinearFilter,
    THREE.LinearFilter
  );
}

function fillHeightTexture(texture: THREE.DataTexture, alt: Float32Array) {
  const theArray = texture.image.data;
  for (let k = 0, kl = theArray.length; k < kl; k += 4) {
    theArray[k + 0] = alt[k / 4];
    theArray[k + 1] = 0;
    theArray[k + 2] = 0;
    theArray[k + 3] = 0;
  }
}
