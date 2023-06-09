import * as THREE from "three";
import { MAX_VISUZLIZE_WATER_HEIGHT, TERRAIN_SIZE } from "./consts";
import { CONTROL } from "./control";

const vertexShader = require("./shader/terrainVS.glsl");
const fragmentShader = require("./shader/terrainFS.glsl");

export let mesh: THREE.Mesh;
let verticies: Float32Array;
let colors: Float32Array;
let width: number;
let height: number;

function indexOfArr(x: number, y: number, width: number) {
  return x * width + y;
}

export function initMesh(alt: Float32Array, width_: number, height_: number, scene: THREE.Scene) {
  let size = TERRAIN_SIZE;
  let pos = [];
  let col = [];
  let indicies = [];
  width = width_;
  height = height_;

  for (let w = 0; w < width; w++) {
    for (let h = 0; h < height; h++) {
      pos.push(size * (-0.5 + h / height));
      pos.push(alt[indexOfArr(w, h, width)]);
      pos.push(size * (-0.5 + w / width));
    }
  }

  for (let w = 0; w < width - 1; w++) {
    for (let h = 0; h < height - 1; h++) {
      // 1-2
      // |/|
      // 3-4
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

  col = new Array(pos.length);
  col.fill(0.5);

  verticies = new Float32Array(pos);
  colors = new Float32Array(col);

  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(indicies);
  geometry.setAttribute("position", new THREE.BufferAttribute(verticies, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 1,
    wireframe: false,
  });

  let posUniforms = {};
  let lightUnifoms = THREE.UniformsLib["lights"];
  let uniforms = THREE.UniformsUtils.merge([posUniforms, lightUnifoms]);

  const material_ = new THREE.ShaderMaterial({
    vertexColors: true,
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    lights: true,
    uniforms: uniforms,
  });

  mesh = new THREE.Mesh(geometry, material_);

  scene.add(mesh);
}

function altToColor(alt: number) {
  if (!CONTROL.VISUALIZATION_ON) return 0.5;
  return 0.5 + alt / MAX_VISUZLIZE_WATER_HEIGHT;
}

export function renderMesh(alt1: Float32Array, alt2: Float32Array, alt3: Float32Array) {
  for (let w = 0; w < width; w++) {
    for (let h = 0; h < height; h++) {
      let i = indexOfArr(w, h, width);
      verticies[i * 3 + 1] = alt1[i] + alt2[i]; //+ alt3[iv1];
      colors[i * 3 + 2] = altToColor(alt2[i]);
    }
  }
  mesh.geometry.computeVertexNormals();
  mesh.geometry.attributes.position.needsUpdate = true;
  mesh.geometry.attributes.color.needsUpdate = true;
  mesh.geometry.computeBoundingSphere();
}

export function removeMesh(scene: THREE.Scene) {
  if (mesh !== undefined) {
    scene.remove(mesh);
    mesh.geometry.dispose();
    (mesh.material as THREE.Material).dispose();
  }
}
