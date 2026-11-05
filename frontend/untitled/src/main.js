// 3D plaza for the [untitled] room game (templates/game/untitled.html). The page owns the WebSocket; this module draws the
// plaza and everyone in the room, moves the local player with WASD (camera-relative, sliding along obstacles), and reports
// the local position (onMove) and name-tag anchors (onFrame). Build: `npm run build` here → static/game/untitled3d/untitled3d.js.
import * as THREE from 'three';
import { furniture } from './assets.js';
import { Actor } from './actors.js';

const CELL = 5;
const WALL_H = 12.9;
const SEND_EVERY = 0.1;              // seconds between position reports while moving

export function createRoomScene(container, { base, world }) {
  const SIZE = world.size, W = SIZE * CELL;
  const blocked = new Set();
  world.props.forEach((p) => { for (let i = 0; i < p.w; i++) for (let j = 0; j < p.d; j++) blocked.add((p.x + i) + ',' + (p.y + j)); });

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;outline:none';
  renderer.domElement.tabIndex = 0;
  container.prepend(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 800);
  const hemi = new THREE.HemisphereLight(0xfff1dc, 0x8a6b4f, 1.15);
  const sun = new THREE.DirectionalLight(0xfff0d6, 2.3);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.05;
  Object.assign(sun.shadow.camera, { left: -W, right: W, top: W, bottom: -W, near: 1, far: 300 });
  sun.position.set(W * 0.15 + 40, 90, W * 0.9 + 50);
  sun.target.position.set(W / 2, 0, W / 2);
  scene.add(hemi, sun, sun.target);

  const toWorld = (x, y, h = 0) => new THREE.Vector3(x * CELL, h, y * CELL);      // (x, y) in cells → world

  // ── plaza: Kenney floor slabs, two back walls with windows, props from the server's map ──
  (async () => {
    const slabs = await Promise.all(Array.from({ length: (SIZE / 2) ** 2 }, () => furniture(base, 'floorFull')));
    slabs.forEach((s, i) => { s.position.set((i % (SIZE / 2)) * 10 + 5, -0.5, Math.floor(i / (SIZE / 2)) * 10 + 5); s.traverse((o) => { o.receiveShadow = true; }); scene.add(s); });
    for (let i = 0; i < SIZE / 2; i++) {
      const back = await furniture(base, i % 2 ? 'wallWindow' : 'wall');
      back.position.set(i * 10 + 5, 0, -0.35);
      const left = await furniture(base, i % 2 ? 'wall' : 'wallWindow');
      left.rotation.y = Math.PI / 2;
      left.position.set(-0.35, 0, i * 10 + 5);
      scene.add(back, left);
    }
    for (const d of world.decor) {
      const g = await furniture(base, d.model);
      g.position.copy(toWorld(d.x + 1, d.y + 1, 0.03));
      scene.add(g);
    }
    for (const p of world.props) {
      const g = await furniture(base, p.model);
      const sz = g.userData.size;
      const [w, d] = p.rot % 2 ? [p.d, p.w] : [p.w, p.d];
      g.scale.set(Math.min(1, (w * CELL + 0.6) / sz.x), 1, Math.min(1, (d * CELL + 0.6) / sz.z));
      g.rotation.y = p.rot * Math.PI / 2;
      g.position.copy(toWorld(p.x + (p.rot % 2 ? p.d : p.w) / 2, p.y + (p.rot % 2 ? p.w : p.d) / 2));
      scene.add(g);
    }
  })();

  // ── camera: isometric, follows the local player, wheel zooms ──
  let zoom = 1.6;
  const focus = new THREE.Vector3(W / 2, 0, W / 2);
  function frame() {
    const width = container.clientWidth || 600, height = container.clientHeight || 400;
    renderer.setSize(width, height, false);
    const half = W * 0.62 / zoom, aspect = width / height;
    camera.left = -half * aspect; camera.right = half * aspect; camera.top = half; camera.bottom = -half;
    camera.updateProjectionMatrix();
  }
  function placeCamera() {
    camera.position.copy(focus).add(new THREE.Vector3(1, 0.9, 1).normalize().multiplyScalar(300));
    camera.lookAt(focus);
  }
  frame();
  placeCamera();
  new ResizeObserver(frame).observe(container);
  renderer.domElement.addEventListener('wheel', (e) => { e.preventDefault(); zoom = Math.max(0.8, Math.min(4, zoom * (e.deltaY < 0 ? 1.15 : 1 / 1.15))); frame(); }, { passive: false });

  // ── collision: same rule as untitled_world.free_at ──
  const R = world.radius;
  function freeAt(x, y) {
    if (x < R || y < R || x > SIZE - R || y > SIZE - R) return false;
    for (let cx = Math.floor(x - R); cx <= Math.floor(x + R); cx++) {
      for (let cy = Math.floor(y - R); cy <= Math.floor(y + R); cy++) {
        if (!blocked.has(cx + ',' + cy)) continue;
        const nx = Math.min(Math.max(x, cx), cx + 1), ny = Math.min(Math.max(y, cy), cy + 1);
        if ((x - nx) ** 2 + (y - ny) ** 2 < R * R - 1e-9) return false;
      }
    }
    return true;
  }

  // ── people ──
  const people = new Map();            // id → { actor, target, dir, moving, name }
  let meId = null, me = null;
  async function spawn(p) {
    const rec = { actor: null, x: p.x, y: p.y, dir: p.dir, moving: false, name: p.name, model: p.model };
    people.set(p.id, rec);
    const actor = await Actor.create(base, p.model, {});
    if (!people.has(p.id)) return;
    rec.actor = actor;
    actor.root.position.copy(toWorld(rec.x, rec.y));
    scene.add(actor.root);
  }
  function setPlayers(list, myId) {
    meId = myId;
    const seen = new Set();
    list.forEach((p) => {
      seen.add(p.id);
      if (!people.has(p.id)) spawn(p);
      const rec = people.get(p.id);
      rec.name = p.name; rec.online = p.online;
      if (p.id === meId) {                                     // my own position is driven locally; only adopt it the first time
        if (!me) { me = { x: p.x, y: p.y, dir: p.dir }; }
        return;
      }
      rec.x = p.x; rec.y = p.y; rec.dir = p.dir; rec.moving = p.moving;
    });
    for (const [id, rec] of people) {
      if (seen.has(id)) continue;
      if (rec.actor) scene.remove(rec.actor.root);
      people.delete(id);
    }
  }
  function correct(x, y) { if (me) { me.x = x; me.y = y; } }
  function clear() {
    for (const rec of people.values()) if (rec.actor) scene.remove(rec.actor.root);
    people.clear();
    me = null; meId = null;
  }

  // ── WASD: screen-relative (W = up the screen = toward the back corner) ──
  const keys = new Set();
  const MOVE_KEYS = { w: [-1, -1], arrowup: [-1, -1], s: [1, 1], arrowdown: [1, 1], a: [-1, 1], arrowleft: [-1, 1], d: [1, -1], arrowright: [1, -1] };
  window.addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (!MOVE_KEYS[k] || e.target.closest('input, textarea') || !meId) return;
    e.preventDefault();
    keys.add(k);
  });
  window.addEventListener('keyup', (e) => keys.delete(e.key.toLowerCase()));
  window.addEventListener('blur', () => keys.clear());
  let moveCb = null, sinceSend = 0, wasMoving = false;
  function stepMe(dt) {
    if (!me) return false;
    let vx = 0, vy = 0;
    keys.forEach((k) => { vx += MOVE_KEYS[k][0]; vy += MOVE_KEYS[k][1]; });
    const len = Math.hypot(vx, vy);
    const moving = len > 0;
    if (moving) {
      const step = world.speed * dt / len;
      const nx = me.x + vx * step, ny = me.y + vy * step;
      if (freeAt(nx, ny)) { me.x = nx; me.y = ny; }
      else if (freeAt(nx, me.y)) me.x = nx;                 // slide along whatever is in the way
      else if (freeAt(me.x, ny)) me.y = ny;
      me.dir = Math.atan2(vx, vy);
    }
    sinceSend += dt;
    if (moveCb && (moving && sinceSend >= SEND_EVERY || moving !== wasMoving)) {
      sinceSend = 0;
      moveCb({ x: +me.x.toFixed(3), y: +me.y.toFixed(3), dir: +me.dir.toFixed(3), moving });
    }
    wasMoving = moving;
    return moving;
  }

  // ── anchors for name tags ──
  const v = new THREE.Vector3();
  function anchors() {
    const out = {};
    for (const [id, rec] of people) {
      if (!rec.actor) continue;
      v.copy(rec.actor.root.position).setY(6.2).project(camera);
      out[id] = { x: (v.x + 1) / 2 * container.clientWidth, y: (1 - v.y) / 2 * container.clientHeight, name: rec.name, me: id === meId, online: rec.online !== false };
    }
    return out;
  }

  // ── loop ──
  let frameCb = null;
  const clock = new THREE.Clock();
  function tick() {
    const dt = Math.min(0.05, clock.getDelta());
    const myMoving = stepMe(dt);
    for (const [id, rec] of people) {
      const a = rec.actor;
      if (!a) continue;
      const mine = id === meId && me;
      const tx = mine ? me.x : rec.x, ty = mine ? me.y : rec.y;
      const target = toWorld(tx, ty);
      if (mine) a.root.position.copy(target);
      else a.root.position.lerp(target, Math.min(1, dt * 10));
      a.root.rotation.y = mine ? me.dir : rec.dir;
      a.pose((mine ? myMoving : rec.moving) ? 'walk' : 'idle');
      a.update(dt);
    }
    if (me) focus.lerp(toWorld(me.x, me.y), Math.min(1, dt * 5));
    placeCamera();
    renderer.render(scene, camera);
    if (frameCb) frameCb(anchors());
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  return {
    setPlayers, correct, clear,
    focus() { renderer.domElement.focus(); },
    onMove(cb) { moveCb = cb; },
    onFrame(cb) { frameCb = cb; },
  };
}
