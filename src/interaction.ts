import * as THREE from "three";
import { TERRAIN_SIZE } from "./consts";

// ================ MOUSE INTERACTION ================

export const interactionState = {
  isActive: false,
  onMesh: false,
  norW: 0.5,
  norH: 0.5,
};

export function setInteration(camera: THREE.Camera, mesh: THREE.Mesh) {
  const mouse = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();

  window.addEventListener("mousemove", (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(mesh);
    if(intersects.length === 0) interactionState.onMesh = false
    else {
      let intersectPoint = intersects[0].point;
      let x = intersectPoint.x;
      let z = intersectPoint.z;
      interactionState.onMesh = true;
      interactionState.norW = (z / TERRAIN_SIZE) + 0.5;
      interactionState.norH = (x / TERRAIN_SIZE) + 0.5;
    }
  });
  
  window.addEventListener("keydown", (e) => {
    if(e.code === 'Space') {
      interactionState.isActive = true;
    }
  })
  window.addEventListener("keyup", (e) => {
    if(e.code === 'Space') {
      interactionState.isActive = false;
    }
  })
}
