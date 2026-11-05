// 3D plaza for the [untitled] room game (templates/game/untitled.html). The page owns the WebSocket; this module draws the
// plaza and everyone in the room, moves the local player with WASD (camera-relative, sliding along obstacles), and reports
// the local position (onMove) and name-tag anchors (onFrame). Collision uses the server's shapes (untitled_world.SHAPES): the player is a
// circle, props are circles or boxes sized from the real models; overlaps are pushed out so the player slides around things.
// Build: `npm run build` here → static/game/untitled3d/untitled3d.js.
import * as THREE from 'three';
import { furniture } from './assets.js';
import { Actor } from './actors.js';

const CELL = 5;
const WALL_H = 12.9;
const SEND_EVERY = 0.1;              // seconds between position reports while moving

export function createRoomScene(container, { base, world }) {
  const SIZE = world.size, W = SIZE * CELL;

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
      const [lx, lz] = p.rot % 2 ? [p.d, p.w] : [p.w, p.d];      // cells available along the model's own x / z (before turning)
      g.scale.set(Math.min(1, (lx + 0.12) * CELL / sz.x), 1, Math.min(1, (lz + 0.12) * CELL / sz.z));
      g.rotation.y = p.rot * Math.PI / 2;
      g.position.copy(toWorld(p.x + p.w / 2, p.y + p.d / 2));     // p.w / p.d are already the turned footprint
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

  // ── collision: circle player vs the server's shapes; overlaps are pushed out (so movement slides), small sub-steps avoid tunnelling ──
  const R = world.radius, SHAPES = world.shapes;
  function pushOut(pos, others) {
    for (let iter = 0; iter < 4; iter++) {
      let moved = false;
      for (const s of SHAPES) {
        let nx, ny;
        if (s.kind === 'circle') { nx = s.cx; ny = s.cy; }
        else { nx = Math.min(Math.max(pos.x, s.cx - s.hx), s.cx + s.hx); ny = Math.min(Math.max(pos.y, s.cy - s.hy), s.cy + s.hy); }
        let dx = pos.x - nx, dy = pos.y - ny;
        const reach = s.kind === 'circle' ? s.r + R : R;
        let dist = Math.hypot(dx, dy);
        if (dist >= reach) continue;
        if (dist < 1e-6) {                                    // centre inside a box: leave through the nearest side
          const ex = s.hx - Math.abs(pos.x - s.cx), ey = s.hy - Math.abs(pos.y - s.cy);
          if (ex < ey) { dx = Math.sign(pos.x - s.cx) || 1; dy = 0; dist = -ex; } else { dx = 0; dy = Math.sign(pos.y - s.cy) || 1; dist = -ey; }
          pos.x += dx * (reach - dist + 1e-3); pos.y += dy * (reach - dist + 1e-3);
        } else {
          pos.x += dx / dist * (reach - dist + 1e-3); pos.y += dy / dist * (reach - dist + 1e-3);
        }
        moved = true;
      }
      for (const o of others) {                              // other players: soft circles, only on this screen
        const dx = pos.x - o.x, dy = pos.y - o.y, dist = Math.hypot(dx, dy), reach = R * 2;
        if (dist >= reach || dist < 1e-6) continue;
        pos.x += dx / dist * (reach - dist); pos.y += dy / dist * (reach - dist);
        moved = true;
      }
      pos.x = Math.min(Math.max(pos.x, R), SIZE - R);
      pos.y = Math.min(Math.max(pos.y, R), SIZE - R);
      if (!moved) break;
    }
    return pos;
  }
  function blockedAt(x, y) {                                 // used only to refuse a server correction that would leave us inside something
    return SHAPES.some((s) => (s.kind === 'circle' ? Math.hypot(x - s.cx, y - s.cy) < s.r + R - 1e-3
      : Math.hypot(Math.max(Math.abs(x - s.cx) - s.hx, 0), Math.max(Math.abs(y - s.cy) - s.hy, 0)) < R - 1e-3));
  }

  // ── hitbox view (H) ──
  const hitboxes = new THREE.Group();
  hitboxes.visible = false;
  scene.add(hitboxes);
  const hitMat = new THREE.MeshBasicMaterial({ color: 0xff2bd6, transparent: true, opacity: 0.45, depthWrite: false });
  const hitLine = new THREE.LineBasicMaterial({ color: 0xff2bd6 });
  SHAPES.forEach((s) => {
    const geo = s.kind === 'circle' ? new THREE.CylinderGeometry(s.r * CELL, s.r * CELL, 1.2, 40) : new THREE.BoxGeometry(s.hx * 2 * CELL, 1.2, s.hy * 2 * CELL);
    const m = new THREE.Mesh(geo, hitMat);
    m.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 20), hitLine));   // outline so it reads on any floor colour
    m.position.copy(toWorld(s.cx, s.cy, 0.6));
    m.renderOrder = 10;
    hitboxes.add(m);
  });
  const ringGeo = new THREE.RingGeometry(R * CELL - 0.25, R * CELL, 40);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x4f46e5, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false });

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
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.3;
    ring.visible = hitboxes.visible;
    rec.ring = ring;
    actor.root.add(ring);
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
  function correct(x, y) { if (me && !blockedAt(x, y)) { me.x = x; me.y = y; } }
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
    if (k === 'h' && !e.target.closest('input, textarea') && meId) {
      hitboxes.visible = !hitboxes.visible;
      for (const rec of people.values()) if (rec.ring) rec.ring.visible = hitboxes.visible;
      return;
    }
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
      const dist = world.speed * dt, steps = Math.max(1, Math.ceil(dist / 0.08));
      const others = [...people.entries()].filter(([id]) => id !== meId).map(([, r]) => r);
      for (let i = 0; i < steps; i++) {                     // small steps, each pushed back out of whatever it touched
        me.x += vx / len * dist / steps;
        me.y += vy / len * dist / steps;
        pushOut(me, others);
      }
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
