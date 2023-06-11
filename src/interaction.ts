import * as THREE from "three";
import { TERRAIN_SIZE } from "./consts";

// ================ MOUSE INTERACTION ================

export const interactionState = {
  isActive: false,
  norW: 0.5,
  norH: 0.5,
};

export function setInteration(camera: THREE.Camera) {
  const mouse = new THREE.Vector2();
  const intersectPoint = new THREE.Vector3();
  const raycaster = new THREE.Raycaster();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0));

  window.addEventListener("mousemove", (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(plane, intersectPoint);

    let x = intersectPoint.x;
    let z = intersectPoint.z;
    let norW = z / TERRAIN_SIZE + 0.5;
    let norH = x / TERRAIN_SIZE + 0.5;
    interactionState.norW = norW;
    interactionState.norH = norH;
  });

  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      interactionState.isActive = true;
    }
  });
  window.addEventListener("keyup", (e) => {
    if (e.code === "Space") {
      interactionState.isActive = false;
    }
  });
}
