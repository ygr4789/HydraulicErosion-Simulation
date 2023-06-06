import * as dat from "dat.gui";
import * as Stats from "stats.js";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import "./style/style.css";
import { initTerrain, renderTerrain, updateTerain } from "./terrain";
import { removeMesh } from "./render";
import { imageData } from "./util/image";

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

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
dirLight.position.set(10, 10, 10);
scene.add(dirLight);

// ===================== Control =====================

const ui = {
  toggleUpdating: () => {
    isPlaying = !isPlaying;
  },
  reset: () => {
    initAll(initialDistance);
  },
  subStepNum: 1,
  resolution: 0,
};

// ===================== GUI =====================

function initGUI() {
  const gui = new dat.GUI();
  gui.add(ui, "toggleUpdating").name("Run / Pause");
  gui.add(ui, "reset").name("Reset");
  gui.add(ui, "subStepNum", 1, 10).step(1).name("Sub Steps");
  gui.add(ui, "resolution", 0, 100).step(1).name("Resolution").onChange((val) => {
    initialDistance = 1 / ((10 + val) / 10) 
  });
}
// ===================== MAIN =====================

let isPlaying: Boolean = false;
let initialDistance = 1;
const timeStep = 13;

async function main() {
  const stats = new Stats();
  document.body.appendChild(stats.dom);

  await initAll(initialDistance);

  animate();
  function animate() {
    requestAnimationFrame(animate);
    stats.begin();
    if (isPlaying) {
      for (let i = 0; i < ui.subStepNum; i++) {
        updateStates(timeStep / ui.subStepNum / 1000);
      }
      renderTerrain();
    }
    renderer.render(scene, camera);
    stats.end();
  }
}

async function initAll(initialDistance: number) {
  removeMesh(scene);
  let terrain = await imageData();
  initTerrain(terrain, 4, scene);
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
