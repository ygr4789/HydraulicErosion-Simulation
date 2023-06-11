import * as THREE from "three";
import { TERRAIN_SIZE } from "./consts";
import { outputTexture } from "./gpgpu";

const vertexShader = require("./shader/terrainVS.glsl");
const fragmentShader = require("./shader/terrainFS.glsl");

let mesh: THREE.Mesh;
let verticies: Float32Array;
let reference: Float32Array;
let width: number;
let height: number;

let uniforms: any;

function indexOfArr(x: number, y: number, width: number) {
  return x * width + y;
}

export function initMesh(width_: number, height_: number, scene: THREE.Scene) {
  let size = TERRAIN_SIZE;
  let pos = [];
  let ref = [];
  let indicies = [];
  width = width_;
  height = height_;

  for (let w = 0; w < width; w++) {
    for (let h = 0; h < height; h++) {
      pos.push(size * (-0.5 + h / height));
      pos.push(0);
      pos.push(size * (-0.5 + w / width));
      ref.push(w / width);
      ref.push(h / height);
    }
  }

  for (let w = 0; w < width - 1; w++) {
    for (let h = 0; h < height - 1; h++) {
      // 1 - 2
      // | / |
      // 3 - 4
      //upper tirangle
      // v1
      indicies.push(indexOfArr(w, h, width));
      // v2
      indicies.push(indexOfArr(w + 1, h, width));
      // v3
      indicies.push(indexOfArr(w, h + 1, width));
      //lower triangle
      // v2
      indicies.push(indexOfArr(w + 1, h, width));
      // v4
      indicies.push(indexOfArr(w + 1, h + 1, width));
      // v3
      indicies.push(indexOfArr(w, h + 1, width));
    }
  }

  verticies = new Float32Array(pos);
  reference = new Float32Array(ref);

  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(indicies);
  geometry.setAttribute("position", new THREE.BufferAttribute(verticies, 3));
  geometry.setAttribute("reference", new THREE.BufferAttribute(reference, 2));
  geometry.computeVertexNormals();

  let posUniforms = { texturePosition: { value: null } };
  let lightUnifoms = THREE.UniformsLib["lights"];
  uniforms = THREE.UniformsUtils.merge([posUniforms, lightUnifoms]);

  const material = new THREE.ShaderMaterial({
    vertexColors: true,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    lights: true,
    uniforms: uniforms,
    wireframe: true,
  });

  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
}

export function updateMesh() {
  uniforms.texturePosition.value = outputTexture;
}

export function removeMesh(scene: THREE.Scene) {
  if (mesh !== undefined) {
    scene.remove(mesh);
    mesh.geometry.dispose();
    (mesh.material as THREE.Material).dispose();
  }
}
