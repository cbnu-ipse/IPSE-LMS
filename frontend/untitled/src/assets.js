// Model loading and caching. Furniture is Kenney OBJ+MTL, characters and food are Kenney GLB (all CC0).
// Every loader returns a fresh clone that is already normalized: centered on x/z, resting on y=0.
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';

const cache = new Map();

function once(key, load) {
  if (!cache.has(key)) cache.set(key, load());
  return cache.get(key);
}

function normalize(object) {
  const box = new THREE.Box3().setFromObject(object);
  const center = box.getCenter(new THREE.Vector3());
  object.position.set(-center.x, -box.min.y, -center.z);
  const holder = new THREE.Group();
  holder.add(object);
  holder.userData.size = box.getSize(new THREE.Vector3());
  return holder;
}

function shadowed(object) {
  object.traverse((o) => {
    if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }
  });
  return object;
}

export function furniture(base, name) {
  return once('f:' + name, async () => {
    const dir = base + 'models/furniture/';
    const materials = await new MTLLoader().setPath(dir).loadAsync(name + '.mtl');
    materials.preload();
    Object.values(materials.materials).forEach((m) => { m.shininess = 8; m.specular = new THREE.Color(0x222222); });
    const obj = await new OBJLoader().setMaterials(materials).setPath(dir).loadAsync(name + '.obj');
    // Kenney furniture faces -z; turn it so its front looks at +z (toward the hall / the camera side).
    obj.rotation.y = Math.PI;
    const wrapped = new THREE.Group();
    wrapped.add(obj);
    return normalize(shadowed(wrapped));
  }).then((proto) => { const c = proto.clone(); c.userData.size = proto.userData.size; return c; });
}

function gltf(url) {
  return once('g:' + url, () => new GLTFLoader().loadAsync(url));
}

export async function food(base, name) {
  const g = await gltf(base + 'models/food/' + name + '.glb');
  return normalize(shadowed(g.scene.clone(true)));
}

export async function character(base, name) {
  const g = await gltf(base + 'models/characters/' + name + '.glb');
  const scene = shadowed(cloneSkinned(g.scene));
  return { scene, animations: g.animations };
}
