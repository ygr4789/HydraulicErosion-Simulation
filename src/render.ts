import * as THREE from "three";
import { TERRAIN_SIZE } from "./consts";

let mesh: THREE.Mesh;
let positions: Float32Array;
let width: number;
let height: number;

function indexOfArr(x: number, y: number, width: number) {
  return x * width + y;
}

export function initMesh(alt: Float32Array, width_: number, height_: number, scene: THREE.Scene) {
  let size = TERRAIN_SIZE;
  let pos = [];
  width = width_;
  height = height_;
  for (let w = 0; w < width - 1; w++) {
    for (let h = 0; h < height - 1; h++) {
      //upper tirangle
      // v1
      pos.push(size * (-0.5 + h / height));
      pos.push(alt[indexOfArr(w, h, width)]);
      pos.push(size * (-0.5 + w / width));
      // v2
      pos.push(size * (-0.5 + h / height));
      pos.push(alt[indexOfArr(w + 1, h, width)]);
      pos.push(size * (-0.5 + (w + 1) / width));
      // v3
      pos.push(size * (-0.5 + (h + 1) / height));
      pos.push(alt[indexOfArr(w, h + 1, width)]);
      pos.push(size * (-0.5 + w / width));
      //lower triangle
      // v2
      pos.push(size * (-0.5 + h / height));
      pos.push(alt[indexOfArr(w + 1, h, width)]);
      pos.push(size * (-0.5 + (w + 1) / width));
      // v4
      pos.push(size * (-0.5 + (h + 1) / height));
      pos.push(alt[indexOfArr(w + 1, h + 1, width)]);
      pos.push(size * (-0.5 + (w + 1) / width));
      // v3
      pos.push(size * (-0.5 + (h + 1) / height));
      pos.push(alt[indexOfArr(w, h + 1, width)]);
      pos.push(size * (-0.5 + w / width));
    }
  }
  positions = new Float32Array(pos);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({
    color: 0x808080,
    roughness: 1,
    wireframe: false,
  });
  mesh = new THREE.Mesh(geometry, material);

  scene.add(mesh);
}

export function renderMesh(alt1: Float32Array, alt2: Float32Array) {
  let i = -2;
  for (let w = 0; w < width - 1; w++) {
    for (let h = 0; h < height - 1; h++) {
      let iv1 = indexOfArr(w, h, width);
      let iv2 = indexOfArr(w + 1, h, width);
      let iv3 = indexOfArr(w, h + 1, width);
      let iv4 = indexOfArr(w + 1, h + 1, width);
      //upper tirangle
      // v1
      positions[i += 3] = alt1[iv1] + alt2[iv1];
      // v2
      positions[i += 3] = alt1[iv2] + alt2[iv2];
      // v3
      positions[i += 3] = alt1[iv3] + alt2[iv3];
      //lower triangle
      // v2
      positions[i += 3] = alt1[iv2] + alt2[iv2];
      // v4
      positions[i += 3] = alt1[iv4] + alt2[iv4];
      // v3
      positions[i += 3] = alt1[iv3] + alt2[iv3];
    }
  }
  mesh.geometry.computeVertexNormals();
  mesh.geometry.attributes.position.needsUpdate = true;
  mesh.geometry.computeBoundingSphere();
}

export function removeMesh(scene: THREE.Scene) {
  if (mesh !== undefined) {
    scene.remove(mesh);
    mesh.geometry.dispose();
    (mesh.material as THREE.Material).dispose();
  }
}
