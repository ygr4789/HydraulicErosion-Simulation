import * as dat from "dat.gui";
import * as Stats from "stats.js";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import "./style/style.css";
import { initTerrain, renderTerrain, updateTerain } from "./terrain";
import { mesh, removeMesh } from "./render";
import { imageData } from "./util/image";
import { setInteration } from "./interaction";
import { CONTROL, addControlsOn } from "./control";

const scene = new THREE.Scene();
const setcolor = "#000000";
scene.background = new THREE.Color(setcolor);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000.0);
camera.position.set(40, 40, 45);

const controls = new OrbitControls(camera, renderer.domElement);
controls.listenToKeyEvents(window);

function window_onsize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.onresize = window_onsize;

// ================ Light setting ================

const dirLight = new THREE.DirectionalLight(0xffffff);
dirLight.position.set(10, 10, 10);
scene.add(dirLight);

// ===================== Control =====================

const MAIN_UI = {
  RUN_PAUSE: () => {
    MAIN_UI.PAUSED = !MAIN_UI.PAUSED;
  },
  RESET: () => {
    initAll(CONTROL.STRIDE);
  },
  PAUSED: false,
};

// ===================== GUI =====================

function initGUI() {
  const gui = new dat.GUI();
  gui.add(MAIN_UI, "RUN_PAUSE").name("Run / Pause");
  gui.add(MAIN_UI, "RESET").name("Reset");
  addControlsOn(gui);
}
// ===================== MAIN =====================

async function main() {
  const stats = new Stats();
  document.body.appendChild(stats.dom);

  await initAll(CONTROL.STRIDE);

  // renderer.render(scene, camera);
  animate();
  function animate() {
    requestAnimationFrame(animate);
    stats.begin();
    if (!MAIN_UI.PAUSED) {
      updateStates(CONTROL.TIMESTEP / 1000);
      renderTerrain();
    }
    renderer.render(scene, camera);
    stats.end();
  }
}

async function initAll(stride: number) {
  removeMesh(scene);
  let terrain = await imageData(CONTROL.MAP);
  initTerrain(terrain, stride, scene);
  setInteration(camera, mesh);
}

function updateStates(dt: number) {
  updateTerain(dt);
}

function preventDefault() {
  document.oncontextmenu = () => false;
  document.onselectstart = () => false;
}

window.onload = async () => {
  preventDefault();
  initGUI();
  await main();
};
