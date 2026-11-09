// 3D map for the cops-and-robbers room game (templates/game/untitled.html). The page owns the WebSocket; this module draws the
// map (rooms and corridors from untitled_maps) and everyone in the room, moves the local player with WASD (camera-relative, sliding
// along obstacles), and reports the local position (onMove) and name-tag anchors (onFrame). Collision uses the server's shapes: the
// player is a circle, props are circles or boxes sized from the real models; overlaps are pushed out so the player slides around things.
// During a round whatever the local player can't see is shaded dark (sight shader), and the server leaves out opponents we can't see.
// Space: thieves dash, cops fire the taser.
// mode 'gun' (templates/game/gun.html, the team deathmatch on the same engine): everyone aims with the mouse and clicks to shoot (hitscan
// tracers from the server's 'gshot' events), pickups lie on the map, red/blue teams, health and respawns come from the server.
// Build: `npm run build` here → static/game/untitled3d/untitled3d.js.
import * as THREE from 'three';
import { furniture } from './assets.js';
import { Actor } from './actors.js';

const CELL = 5;
const SEND_EVERY = 0.1;              // seconds between position reports while moving
const LOW_WALL_H = 3.4;
const LEVEL_H = 3.0;                 // world units per floor level (walls are 3.4 tall, characters about 6)              // partition walls are cut to waist height so the camera sees over them
const VIEW_CELLS = 32;                 // the camera shows about this many cells across on every map (fixed zoom)

function zoneLook(z) {                  // floor tint from the server's zone colour, and a darker ink for its painted name
  const color = new THREE.Color(z.color || '#94a3b8');
  const ink = color.clone().multiplyScalar(0.5);
  return { color, opacity: z.opacity ?? 0.24, ink: `rgba(${Math.round(ink.r * 255)},${Math.round(ink.g * 255)},${Math.round(ink.b * 255)},0.85)` };
}

function floorLabel(text, ink) {                // zone name painted flat on the floor
  const c = document.createElement('canvas');
  c.width = 512; c.height = 128;
  const g = c.getContext('2d');
  g.font = '900 96px "Pretendard", "Noto Sans KR", sans-serif';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = ink;
  g.fillText(text, 256, 68);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(32, 8), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2;
  m.rotation.z = Math.PI / 4;                   // turned to read along the isometric screen
  return m;
}

// Sight uniforms are shared by every scene: model materials are cached across scenes (assets.js), so a material patched while the
// lobby was showing must read the same uniforms when the game map takes over. Only one scene is alive at a time.
const SIGHT = { uSight: { value: null }, uSightOn: { value: 0 }, uSightSize: { value: new THREE.Vector2(1, 1) } };

export function createRoomScene(container, { base, world, mode }) {
  const GUN = mode === 'gun';
  const MW = world.w, MH = world.h;                           // map size in cells (not square)
  const WX = MW * CELL, WZ = MH * CELL, WMAX = Math.max(WX, WZ);
  let dead = false;

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
  Object.assign(sun.shadow.camera, { left: -WMAX, right: WMAX, top: WMAX, bottom: -WMAX, near: 1, far: 300 + WMAX });
  sun.position.set(WX / 2 + 40 - WMAX * 0.35, 90, WZ / 2 + 50 + WMAX * 0.4);
  sun.target.position.set(WX / 2, 0, WZ / 2);
  scene.add(hemi, sun, sun.target);

  const toWorld = (x, y, h = 0) => new THREE.Vector3(x * CELL, h, y * CELL);      // (x, y) in cells → world

  // ── floor height: every area has a level (h: -1 basement, 0 ground, 1 upstairs …); stairs slope from one level to another
  // (untitled_maps.GameMap.height_at). Movement and collision stay flat; height is only drawn. ──
  const areaIndex = new Int16Array(MW * MH).fill(-1);
  world.areas.forEach((ar, k) => { for (let i = ar.x0; i < ar.x1; i++) for (let j = ar.y0; j < ar.y1; j++) areaIndex[j * MW + i] = k; });
  function areaAt(x, y) {
    const i = Math.floor(x), j = Math.floor(y);
    return i >= 0 && j >= 0 && i < MW && j < MH ? areaIndex[j * MW + i] : -1;
  }
  function levelAt(x, y) {                                    // in levels (stairs give in-between values); the void counts as 0
    const k = areaAt(x, y);
    if (k < 0) return 0;
    const ar = world.areas[k];
    if (ar.kind !== 'stairs') return ar.h || 0;
    const t = ar.axis === 'x' ? (x - ar.x0) / (ar.x1 - ar.x0) : (y - ar.y0) / (ar.y1 - ar.y0);
    return ar.from + (ar.to - ar.from) * Math.min(1, Math.max(0, t));
  }
  const heightAt = (x, y) => levelAt(x, y) * LEVEL_H;
  const onFloor = (x, y, dh = 0) => toWorld(x, y, heightAt(x, y) + dh);   // a point standing on the floor at (x, y)

  // ── map: one floor block per area, from the ground (or below it, for basements) up to its level; stairs are drawn as steps.
  // Nothing is drawn over the void. ──
  const WOOD = new THREE.Color(0xd2b48c);
  const labelled = new Set();
  function block(x0, y0, x1, y1, top, material) {
    const bottom = Math.min(top, 0) - 0.6;
    const m = new THREE.Mesh(new THREE.BoxGeometry((x1 - x0) * CELL, top - bottom, (y1 - y0) * CELL), material);
    m.position.copy(toWorld((x0 + x1) / 2, (y0 + y1) / 2, (top + bottom) / 2));
    m.receiveShadow = true; m.castShadow = top > 0;
    scene.add(m);
  }
  for (const ar of world.areas) {
    const look = zoneLook(ar);
    if (ar.kind === 'stairs') {
      const mat = new THREE.MeshStandardMaterial({ color: 0xb8a78f, roughness: 0.8 });
      const len = ar.axis === 'x' ? ar.x1 - ar.x0 : ar.y1 - ar.y0, steps = len * 3;
      for (let k = 0; k < steps; k++) {                        // each step's top is the stairs' height at the step's far edge
        const a = k / steps, b = (k + 1) / steps;
        const lvl = ar.from + (ar.to - ar.from) * (ar.from < ar.to ? b : a);
        if (ar.axis === 'x') block(ar.x0 + a * len, ar.y0, ar.x0 + b * len, ar.y1, lvl * LEVEL_H, mat);
        else block(ar.x0, ar.y0 + a * len, ar.x1, ar.y0 + b * len, lvl * LEVEL_H, mat);
      }
      continue;
    }
    const color = ar.kind === 'jail' ? new THREE.Color(0x94a3b8) : WOOD.clone().lerp(look.color, ar.kind === 'corridor' ? 0.15 : 0.32);
    if ((ar.h || 0) > 0) color.offsetHSL(0, 0, 0.05);       // upper floors a touch lighter, basements darker
    if ((ar.h || 0) < 0) color.offsetHSL(0, 0, -0.08);
    block(ar.x0, ar.y0, ar.x1, ar.y1, (ar.h || 0) * LEVEL_H, new THREE.MeshStandardMaterial({ color, roughness: 0.85 }));
    const key = ar.group || ar.name + ar.x0 + ',' + ar.y0;     // an L-shaped room (one group) gets one name
    if (ar.kind === 'jail' || labelled.has(key)) continue;
    labelled.add(key);
    const label = floorLabel(ar.name, look.ink);
    label.scale.setScalar(Math.min(1, Math.min(ar.x1 - ar.x0, ar.y1 - ar.y0) * CELL * 1.3 / 32));   // narrow corridors get a smaller name
    label.position.copy(toWorld((ar.x0 + ar.x1) / 2, (ar.y0 + ar.y1) / 2, (ar.h || 0) * LEVEL_H + 0.025));
    scene.add(label);
  }
  function edgeSpan(e) {                                      // floor heights on both sides of a one-cell edge (void sides skipped)
    const mid = e.o === 'v' ? [[e.f - 0.05, e.t + 0.5], [e.f + 0.05, e.t + 0.5]] : [[e.t + 0.5, e.f - 0.05], [e.t + 0.5, e.f + 0.05]];
    const hs = mid.filter(([x, y]) => areaAt(x, y) >= 0).map(([x, y]) => heightAt(x, y));
    return { bottom: Math.min(...hs), top: Math.max(...hs) };
  }
  (async () => {
    for (const piece of world.walls) {                       // walls: Kenney half walls cut down to waist height so the camera sees over them
      const g = await furniture(base, 'wallHalf');
      if (dead) return;
      const span = edgeSpan(piece);                          // from the lower floor up to waist height above the higher one
      g.scale.set(CELL / g.userData.size.x, (span.top - span.bottom + LOW_WALL_H) / g.userData.size.y, 1);
      if (piece.o === 'v') { g.rotation.y = Math.PI / 2; g.position.copy(toWorld(piece.f, piece.t + 0.5, span.bottom)); }
      else g.position.copy(toWorld(piece.t + 0.5, piece.f, span.bottom));
      scene.add(g);
    }
    await buildDoors();
    for (const d of world.decor) {
      const g = await furniture(base, d.model);
      if (dead) return;
      g.position.copy(onFloor(d.x + 1, d.y + 1, 0.03));
      scene.add(g);
    }
    for (const p of world.props) {
      const g = await furniture(base, p.model);
      if (dead) return;
      const sz = g.userData.size;
      const [lx, lz] = p.rot % 2 ? [p.d, p.w] : [p.w, p.d];      // cells available along the model's own x / z (before turning)
      g.scale.set(Math.min(1, (lx + 0.12) * CELL / sz.x), 1, Math.min(1, (lz + 0.12) * CELL / sz.z));
      g.rotation.y = p.rot * Math.PI / 2;
      g.position.copy(onFloor(p.x + p.w / 2, p.y + p.d / 2));     // p.w / p.d are already the turned footprint
      scene.add(g);
    }
  })();

  // ── jail fence (blocks walking, not sight): posts every half cell and two rails along each fenced edge ──
  const metal = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5, metalness: 0.4 });
  const postGeo = new THREE.BoxGeometry(0.35, 5.5, 0.35);
  for (const e of world.fences || []) {
    const base = edgeSpan(e).top;
    const along = e.o === 'v' ? (k) => toWorld(e.f, e.t + k) : (k) => toWorld(e.t + k, e.f);
    for (const k of [0, 0.5, 1]) { const m = new THREE.Mesh(postGeo, metal); m.position.copy(along(k)).setY(base + 2.75); m.castShadow = true; scene.add(m); }
    for (const h of [0.6, 5.2]) {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(e.o === 'v' ? 0.3 : CELL, 0.3, e.o === 'v' ? CELL : 0.3), metal);
      rail.position.copy(along(0.5)).setY(base + h);
      scene.add(rail);
    }
  }
  let padRing = null;
  if (world.pad) {
    const P = world.pad;
    padRing = new THREE.Mesh(new THREE.RingGeometry(P.r * CELL - 0.7, P.r * CELL, 48), new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.9, side: THREE.DoubleSide }));
    padRing.userData.noSight = true;
    padRing.rotation.x = -Math.PI / 2;
    padRing.position.copy(onFloor(P.cx, P.cy, 0.08));
    const disc = new THREE.Mesh(new THREE.CircleGeometry(P.r * CELL - 0.7, 48), new THREE.MeshBasicMaterial({ color: 0xfde68a, transparent: true, opacity: 0.45 }));
    disc.rotation.x = -Math.PI / 2;
    disc.position.copy(onFloor(P.cx, P.cy, 0.07));
    scene.add(padRing, disc);
  }

  // ── camera: isometric, follows the local player at a fixed zoom ──
  const zoom = 1.6;
  const focus = new THREE.Vector3(WX / 2, 0, WZ / 2);
  function frame() {
    const width = container.clientWidth || 600, height = container.clientHeight || 400;
    renderer.setSize(width, height, false);
    const half = VIEW_CELLS * CELL * 0.62 / zoom, aspect = width / height;
    camera.left = -half * aspect; camera.right = half * aspect; camera.top = half; camera.bottom = -half;
    camera.updateProjectionMatrix();
  }
  function placeCamera() {
    camera.position.copy(focus).add(new THREE.Vector3(1, 0.9, 1).normalize().multiplyScalar(300));
    camera.lookAt(focus);
  }
  frame();
  placeCamera();
  const resizer = new ResizeObserver(frame);
  resizer.observe(container);

  // ── collision: circle player vs the server's shapes; overlaps are pushed out (so movement slides), small sub-steps avoid tunnelling ──
  const R = world.radius, SHAPES = world.shapes;
  function pushOut(pos, others) {
    for (let iter = 0; iter < 8; iter++) {
      let moved = false;
      for (const o of others) {                              // other players first (soft circles, only on this screen) so solid shapes get the last word
        const dx = pos.x - o.x, dy = pos.y - o.y, dist = Math.hypot(dx, dy), reach = R * 2;
        if (dist >= reach || dist < 1e-6) continue;
        pos.x += dx / dist * (reach - dist); pos.y += dy / dist * (reach - dist);
        moved = true;
      }
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
      pos.x = Math.min(Math.max(pos.x, R), MW - R);
      pos.y = Math.min(Math.max(pos.y, R), MH - R);
      if (!moved) break;
    }
    return pos;
  }
  let lockInfo = null, lockKey = '', lockSets = null;         // gun mode: during the buy phase each team may not leave its base (server: gun_world.move)
  const lockedOut = (x, y) => {
    if (!lockSets || !me || !me.team || !lockSets[me.team]) return false;
    const set = lockSets[me.team];
    return ![[0, 0], [R, 0], [-R, 0], [0, R], [0, -R]].every(([dx, dy]) => set.has(areaAt(x + dx, y + dy)));
  };
  function blockedAt(x, y) {                                 // used only to refuse a server correction that would leave us inside something
    if (lockedOut(x, y)) return true;
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
    m.position.copy(onFloor(s.cx, s.cy, 0.6));
    m.renderOrder = 10;
    hitboxes.add(m);
  });
  const ringGeo = new THREE.RingGeometry(R * CELL - 0.25, R * CELL, 40);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x4f46e5, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false });

  // ── team look: a blue police cap or a black beanie on the head bone (model units), and the colour of the ring underfoot ──
  const TEAM_RING = { cop: 0x2563eb, thief: 0xdc2626, red: 0xdc2626, blue: 0x2563eb };
  const WHITE = new THREE.Color(0xffffff);
  function teamHat(team) {
    const g = new THREE.Group();
    if (team === 'cop') {
      const blue = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.6 });
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.12, 24), blue);
      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.025, 0.14), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
      visor.position.set(0, -0.04, 0.2);
      const badge = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.02), new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.6 }));
      badge.position.set(0, 0.01, 0.215);
      g.add(crown, visor, badge);
    } else if (team === 'red' || team === 'blue') {
      const mat = new THREE.MeshStandardMaterial({ color: team === 'red' ? 0xdc2626 : 0x2563eb, roughness: 0.55 });
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.235, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat);
      cap.scale.y = 0.7;
      const brim = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.03, 0.14), mat);
      brim.position.set(0, -0.03, 0.2);
      g.add(cap, brim);
    } else if (team === 'thief') {
      const black = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.9 });
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.235, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), black);
      cap.scale.y = 0.7;
      g.add(cap);
    }
    g.position.set(0, 0.3, 0.0);
    g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    return g;
  }
  function taserGun() {                       // a yellow-and-black taser held at the end of the right arm, pointing forward (model units)
    const g = new THREE.Group();
    const yellow = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.45 });
    const black = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.6 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.07, 0.17), yellow); body.position.set(0, 0, 0.06);
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.09, 0.05), black); grip.position.set(0, -0.06, 0.0); grip.rotation.x = -0.25;
    const cartridge = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.075, 0.05), black); cartridge.position.set(0, 0, 0.16);
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, 0.01), new THREE.MeshBasicMaterial({ color: 0x38bdf8 })); lamp.position.set(0, 0.025, 0.186);
    g.add(body, grip, cartridge, lamp);
    // held in the right hand: in bone space the arm runs along -x (T-pose) and the idle pose swings it 45° down, so the gun
    // sits at the hand (-0.27, 0, 0.07) and is turned back 45° to stand upright; its barrel points forward (+z)
    g.position.set(-0.27, 0.0, 0.07);
    g.rotation.z = -Math.PI / 4;
    g.scale.setScalar(1.4);                   // a bit oversized so it reads from the isometric camera
    g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    return g;
  }
  const GUN_LOOK = {                                          // [body length, body height, colour, barrel length] per weapon
    pistol: [0.17, 0.07, 0x334155, 0.0], rifle: [0.34, 0.07, 0x15803d, 0.1], shotgun: [0.3, 0.09, 0xc2410c, 0.08], sniper: [0.42, 0.06, 0x7e22ce, 0.16],
  };
  function blaster(kind) {                    // a held gun, shaped by weapon: same hand placement as the taser (barrel along +z)
    const [len, hgt, color, barrel] = GUN_LOOK[kind] || GUN_LOOK.pistol;
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.06, hgt, len), new THREE.MeshStandardMaterial({ color, roughness: 0.45 }));
    body.position.set(0, 0, len / 2 - 0.02);
    const grip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.09, 0.05), new THREE.MeshStandardMaterial({ color: 0x111827 }));
    grip.position.set(0, -0.06, 0.0); grip.rotation.x = -0.25;
    g.add(body, grip);
    if (barrel) {
      const tube = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, barrel), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
      tube.position.set(0, 0.01, len - 0.02 + barrel / 2);
      g.add(tube);
    }
    g.userData.muzzle = len + barrel;
    g.position.set(-0.27, 0.0, 0.07);
    g.rotation.z = -Math.PI / 4;
    g.scale.setScalar(1.4);
    g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    return g;
  }
  function dressFor(rec, team) {
    if (!rec.actor || rec.team === team) return;
    rec.team = team;
    const head = rec.actor.root.getObjectByName('head'), arm = rec.actor.root.getObjectByName('arm-right');
    if (rec.hat) { rec.hat.parent.remove(rec.hat); rec.hat = null; }
    if (rec.gun) { rec.gun.parent.remove(rec.gun); rec.gun = null; }
    if (team && head) { rec.hat = teamHat(team); head.add(rec.hat); }
    if (team === 'cop' && arm) { rec.gun = taserGun(); arm.add(rec.gun); }    // cops carry a taser
    if (GUN && (team === 'red' || team === 'blue') && arm) { rec.gunKind = rec.weapon || 'pistol'; rec.gun = blaster(rec.gunKind); arm.add(rec.gun); }
  }

  // ── gun mode map marks: base tints, A/B site markers on the floor, the lobby's red/blue pads, and the buy-phase gates ──
  const marks = new THREE.Group();
  scene.add(marks);
  const baseTints = [];
  function tintRect(x0, y0, x1, y1, color, opacity, h) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry((x1 - x0) * CELL, (y1 - y0) * CELL),
      new THREE.MeshBasicMaterial({ color, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide }));
    m.rotation.x = -Math.PI / 2;
    m.position.copy(toWorld((x0 + x1) / 2, (y0 + y1) / 2, h));
    m.userData.noSight = true;
    marks.add(m);
    return m;
  }
  function outline(x0, y0, x1, y1, color, h) {
    const pts = [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]].map(([x, y]) => toWorld(x, y, h));
    const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.85 }));
    l.userData.noSight = true;
    marks.add(l);
  }
  function bigLetter(text, sub, x, y, h, ink, size = 14) {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    const g = c.getContext('2d');
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = ink; g.globalAlpha = 0.85;
    g.font = '900 300px "Pretendard", "Noto Sans KR", sans-serif';
    g.fillText(text, 256, 230);
    if (sub) { g.font = '900 64px "Pretendard", "Noto Sans KR", sans-serif'; g.fillText(sub, 256, 440); }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
    m.rotation.x = -Math.PI / 2; m.rotation.z = Math.PI / 4;
    m.position.copy(toWorld(x, y, h));
    m.userData.noSight = true;                                // site and pad marks stay readable outside the sight cone
    marks.add(m);
  }
  const SITE_INK = { A: '#f59e0b', B: '#06b6d4' };
  if (GUN && world.gun_layout) {
    for (const base of world.gun_layout.bases) {
      const [x0, y0, x1, y1] = base.rect;
      baseTints.push(tintRect(x0, y0, x1, y1, 0x64748b, 0.16, heightAt((x0 + x1) / 2, (y0 + y1) / 2) + 0.12));
    }
    for (const site of world.gun_layout.sites) {
      const [x0, y0, x1, y1] = site.rect, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, h = heightAt(cx, cy) + 0.14;
      const ink = SITE_INK[site.id] || '#f59e0b';
      tintRect(x0 + 0.3, y0 + 0.3, x1 - 0.3, y1 - 0.3, parseInt(ink.slice(1), 16), 0.12, h);
      outline(x0 + 0.3, y0 + 0.3, x1 - 0.3, y1 - 0.3, parseInt(ink.slice(1), 16), h + 0.02);
      bigLetter(site.id, '', cx - (x1 - x0) * 0.2, cy - (y1 - y0) * 0.2, h + 0.04, ink, 16);      // off to a corner so it doesn't sit on the room's name
    }
  }
  if (GUN && world.gun_pads) {                                // the lobby: stand on a side to join that team
    for (const [team, [x0, y0, x1, y1]] of Object.entries(world.gun_pads)) {
      const color = team === 'red' ? 0xdc2626 : 0x2563eb;
      tintRect(x0, y0, x1, y1, color, 0.28, 0.14);
      outline(x0, y0, x1, y1, color, 0.18);
      bigLetter(team === 'red' ? 'RED' : 'BLUE', team === 'red' ? '레드팀 자리' : '블루팀 자리', (x0 + x1) / 2, (y0 + y1) / 2, 0.2, team === 'red' ? '#b91c1c' : '#1d4ed8', 10);
    }
  }
  const gateGroup = new THREE.Group();
  scene.add(gateGroup);
  function setLock(lock) {
    const key = lock ? JSON.stringify(lock) : '';
    if (key === lockKey) return;
    lockKey = key; lockInfo = lock;
    lockSets = lock ? { red: new Set(lock.red.areas), blue: new Set(lock.blue.areas) } : null;
    while (gateGroup.children.length) { const g = gateGroup.children[0]; gateGroup.remove(g); g.geometry.dispose(); g.material.dispose(); }
    if (!lock) return;
    for (const team of ['red', 'blue']) {
      for (const [o, f, t0, t1] of lock[team].gates) {
        const len = (t1 - t0) * CELL, mid = (t0 + t1) / 2, [cx, cy] = o === 'h' ? [mid, f] : [f, mid];
        const m = new THREE.Mesh(new THREE.BoxGeometry(o === 'h' ? len : 0.5, 7, o === 'h' ? 0.5 : len),
          new THREE.MeshBasicMaterial({ color: team === 'red' ? 0xef4444 : 0x3b82f6, transparent: true, opacity: 0.55, depthWrite: false }));
        m.position.copy(toWorld(cx, cy, heightAt(cx, cy) + 3.5));
        m.userData.noSight = true;
        gateGroup.add(m);
      }
    }
  }
  function stepGates() {
    const t = performance.now() / 1000;
    gateGroup.children.forEach((m, i) => { m.material.opacity = 0.45 + 0.2 * Math.sin(t * 5 + i); });
  }
  function setSide(side) {                                    // which base is red this round: tint them
    baseTints.forEach((m, i) => m.material.color.setHex((i === side) === true ? 0xdc2626 : 0x2563eb));
  }

  // ── people ──
  const people = new Map();            // id → { actor, target, dir, moving, name }
  let meId = null, me = null;
  async function spawn(p) {
    const rec = { actor: null, x: p.x, y: p.y, dir: p.dir || 0, moving: false, name: p.name, model: p.model, hidden: !!p.hidden };
    people.set(p.id, rec);
    const actor = await Actor.create(base, p.model, {});
    if (!people.has(p.id)) return;
    rec.actor = actor;
    if (Number.isFinite(rec.x)) actor.root.position.copy(onFloor(rec.x, rec.y));
    const ring = new THREE.Mesh(ringGeo, ringMat.clone());
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.3;
    rec.ring = ring;
    actor.root.add(ring);
    scene.add(actor.root);
    dressFor(rec, rec.wantTeam);                               // the team may have arrived while the model was loading
  }
  function setPlayers(list, myId) {
    meId = myId;
    const seen = new Set();
    list.forEach((p) => {
      seen.add(p.id);
      if (!people.has(p.id)) spawn(p);
      const rec = people.get(p.id);
      rec.name = p.name; rec.online = p.online; rec.jailed = p.jailed; rec.safe = p.safe; rec.wantTeam = p.team;
      if (GUN) {
        rec.hp = p.hp; rec.dead = p.alive === false ? 1 : 0; rec.weapon = p.weapon; rec.pref = p.pref;
        const arm = rec.actor && rec.actor.root.getObjectByName('arm-right');
        if (arm && rec.gun && rec.gunKind !== p.weapon && p.team) {          // picked up (or ran out of) a weapon: swap the model in hand
          arm.remove(rec.gun); rec.gunKind = p.weapon; rec.gun = blaster(p.weapon); arm.add(rec.gun);
        }
      }
      dressFor(rec, p.team);
      if (p.stun > 0) rec.stunEnd = performance.now() / 1000 + p.stun;
      if (p.id === meId) {                                     // my own position is driven locally; adopt it at first and whenever the server moves me
        if (!me || p.tp !== me.tp) { me = { ...(me || {}), x: p.x, y: p.y, dir: p.dir, tp: p.tp }; }
        me.speed = p.speed; me.frozen = p.frozen; me.jailed = p.jailed; me.team = p.team;
        me.grabbed = !!p.grabbed; me.grabbing = p.grabbing != null;
        if (GUN) { me.hp = p.hp; me.dead = p.alive === false ? 1 : 0; me.weapon = p.weapon; me.ammo = p.ammo; me.auto = !!p.auto; }
        const serverStamina = (p.stamina ?? 1) * world.run.stamina;    // keep my own running tally, but follow the server if it drifts
        if (me.stamina == null || Math.abs(me.stamina - serverStamina) > 0.6) me.stamina = serverStamina;
        if (p.exhausted) me.exhausted = true;                         // worn out: no running until it refills (server rule)
        return;
      }
      if (p.hidden) { rec.hidden = true; rec.moving = false; return; }   // out of my sight: the server didn't say where
      if (rec.hidden) { rec.hidden = false; rec.snap = true; rec.sampleAt = 0; rec.x = p.x; rec.y = p.y; }
      const t = performance.now() / 1000;                    // velocity from the last two samples: others are drawn a little ahead of the
      const since = t - (rec.sampleAt || 0);                 // last report so they lag less behind where they really are
      const jump = Math.hypot(p.x - rec.x, p.y - rec.y);
      if (!p.moving || jump > 3 || since > 0.5) { rec.vx = 0; rec.vy = 0; }
      else if (since > 0.02) {
        const k = Math.min(1, 9 / Math.max(1e-6, jump / since));           // cap at about dash speed
        rec.vx = (p.x - rec.x) / since * k; rec.vy = (p.y - rec.y) / since * k;
      }
      rec.snap = jump > 3;                                     // teleported (jail, rescue, new map): don't glide across the map
      rec.sampleAt = t;
      rec.x = p.x; rec.y = p.y; rec.dir = p.dir; rec.moving = p.moving;
      rec.running = !!p.running;
      rec.grabbedNow = !!p.grabbed;
      rec.grabbing = p.grabbing;
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

  // ── doors: the leaf of Kenney's doorway model, hung in pairs (one per cell) on doorways one or two cells wide and cut to the
  // walls' waist height. Each leaf is a damped spring: a person walking through pushes it away from them (the closer, the harder;
  // it swings through as they cross the door's plane), and once they are past it swings back, overshoots a little and settles
  // shut. Closed doors block sight (see the sight section; the server tells us which are open). ──
  const doors = [];                                           // { group, base, k, o, f, cx, cy, ang, vel }
  async function buildDoors() {
    if (!(world.doors || []).length) return;
    const model = await furniture(base, 'doorway');
    let leafMesh = null;
    model.traverse((o) => { if (o.isMesh && o.name && o.name !== 'doorway') leafMesh = o; });
    if (!leafMesh || dead) return;
    const geo = leafMesh.geometry.clone();
    geo.computeBoundingBox();
    const bb = geo.boundingBox;
    geo.translate(-bb.min.x, -bb.min.y, -(bb.min.z + bb.max.z) / 2);     // hinge edge at x = 0, bottom at y = 0
    const lw = bb.max.x - bb.min.x, lh = bb.max.y - bb.min.y, DOOR_H = LOW_WALL_H + 0.3;
    for (const d of world.doors) {
      const width = d.t1 - d.t0;
      if (width > 2) continue;                                // wider openings are passages, not doorways
      const per = width / (width === 2 ? 2 : 1);
      const hinges = width === 2 ? [[d.t0, 1], [d.t1, -1]] : [[d.t0, 1]];
      const mid = (d.t0 + d.t1) / 2;
      const [cx, cy] = d.o === 'h' ? [mid, d.f] : [d.f, mid];
      for (const [t, dirSign] of hinges) {
        const mesh = new THREE.Mesh(geo, leafMesh.material);
        mesh.castShadow = true;
        mesh.scale.set(per * CELL / lw * 0.98, DOOR_H / lh, 1);
        const group = new THREE.Group();
        group.add(mesh);
        const [hx, hy] = d.o === 'h' ? [t, d.f] : [d.f, t];
        group.position.copy(toWorld(hx, hy, heightAt(cx + (d.o === 'v' ? 0.01 : 0), cy + (d.o === 'h' ? 0.01 : 0))));
        // closed: an 'h' leaf points along +x (or -x from the far hinge), a 'v' leaf along +z (or -z)
        const baseAngle = d.o === 'h' ? (dirSign > 0 ? 0 : Math.PI) : (dirSign > 0 ? -Math.PI / 2 : Math.PI / 2);
        const k = d.o === 'h' ? dirSign : -dirSign;            // which way "away from the person" turns this leaf
        group.rotation.y = baseAngle;
        scene.add(group);
        doors.push({ group, base: baseAngle, k, o: d.o, f: d.f, cx, cy, hx, hy, len: per * 0.98, ang: 0, vel: 0 });
      }
    }
  }
  // Each leaf is a massless rigid bar on a spring hinge. It only moves when a person's body actually touches it: the contact point is
  // pushed out of the body (the person is never blocked), the leaf keeps the swing speed, then the hinge spring and damping bring it
  // back to shut with a small overshoot.
  const DOOR_MAX = 1.7, DOOR_THICK = 0.06;                    // max swing (rad), half thickness of the leaf in cells
  function stepDoors(dt) {
    const step = Math.min(dt, 0.04);
    for (const door of doors) {
      const phi = -door.base - door.k * door.ang;              // leaf direction in plan (x, y) coordinates
      const c = Math.cos(phi), sn = Math.sin(phi), ux = -sn, uy = c;       // leaf direction and its swing tangent
      let dAng = 0, best = 0;
      for (const [id, rec] of people) {
        if (!rec.actor || (rec.hidden && id !== meId)) continue;
        const px = id === meId && me ? me.x : rec.actor.root.position.x / CELL, py = id === meId && me ? me.y : rec.actor.root.position.z / CELL;
        const rx = px - door.hx, ry = py - door.hy;
        if (Math.abs(rx) > door.len + R + 0.2 || Math.abs(ry) > door.len + R + 0.2) continue;
        const t = Math.max(0, Math.min(door.len, rx * c + ry * sn));      // closest point on the leaf
        const qx = door.hx + c * t, qy = door.hy + sn * t;
        let ox = qx - px, oy = qy - py;                         // from the body to the leaf
        const d = Math.hypot(ox, oy);
        const pen = R + DOOR_THICK - d;
        if (pen <= 0 || t < 0.05) continue;
        if (d > 1e-4) { ox /= d; oy /= d; } else { ox = ux; oy = uy; }
        const along = ox * ux + oy * uy;                        // how much of the push turns the leaf
        const dphi = pen * along / t;
        if (Math.abs(dphi) > Math.abs(best)) { best = dphi; dAng = -door.k * dphi; }
      }
      if (dAng) { door.ang += dAng; door.vel = Math.max(-6, Math.min(6, dAng / step)); }
      door.vel += (60 * (0 - door.ang) - 7 * door.vel) * step;            // spring hinge back to shut, damped
      door.ang += door.vel * step;
      if (Math.abs(door.ang) > DOOR_MAX) { door.ang = Math.sign(door.ang) * DOOR_MAX; door.vel = 0; }
      door.group.rotation.y = door.base + door.k * door.ang;
    }
  }

  // ── mouse aim (cops): the taser shoots toward the cursor. A line on the floor shows where (yellow when ready). ──
  const aim = { has: false, x: 0, y: 0 };
  const raycaster = new THREE.Raycaster(), ndc = new THREE.Vector2(), aimPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), aimHit = new THREE.Vector3();
  function onPointerMove(e) {
    const rect = renderer.domElement.getBoundingClientRect();
    ndc.set((e.clientX - rect.left) / rect.width * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    aimPlane.constant = -(me ? heightAt(me.x, me.y) : 0);  // the floor I stand on
    if (raycaster.ray.intersectPlane(aimPlane, aimHit)) { aim.x = aimHit.x / CELL; aim.y = aimHit.z / CELL; aim.has = true; }
  }
  function onPointerDown(e) {
    if (GUN && e.button === 0 && me && me.dead > 0) { if (specCb) specCb(1); return; }      // fallen: a click switches to the next teammate
    if (e.button !== 0 || !me || !isShooter()) return;
    onPointerMove(e);
    if (GUN) { gunHeld = true; fireGun(); } else fireTaser();
  }
  const isShooter = () => GUN ? (me && (me.team === 'red' || me.team === 'blue')) : (me && me.team === 'cop');
  const gunStats = () => (world.gun.weapons[(me && me.weapon) || 'pistol']) || world.gun.weapons.pistol;
  let gunHeld = false, gunReady = 0, specCb = null, specId = null, phaseNow = 'lobby';
  const onPointerUp = () => { gunHeld = false; };
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);
  function fireGun() {                                        // aim at the mouse; weapons with auto keep firing while the button is held
    const now = performance.now() / 1000;
    if (!me || !isShooter() || phaseNow !== 'playing' || me.frozen > 0 || me.dead > 0 || now < gunReady) return;
    const st = gunStats();
    gunReady = now + st.cooldown;
    const dir = aim.has ? Math.atan2(aim.x - me.x, aim.y - me.y) : me.dir;
    me.dir = dir;
    muzzle(people.get(meId));
    if (moveCb) { sinceSend = 0; moveCb({ x: +me.x.toFixed(3), y: +me.y.toFixed(3), dir: +me.dir.toFixed(3), moving: false, run: false }); }   // my latest spot first
    if (shotCb) shotCb(+dir.toFixed(4));
  }
  renderer.domElement.addEventListener('pointermove', onPointerMove);
  renderer.domElement.addEventListener('pointerdown', onPointerDown);
  const aimLine = new THREE.Mesh(new THREE.BoxGeometry(1, 0.06, 0.3), new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.7, depthWrite: false }));
  const aimRing = new THREE.Mesh(new THREE.RingGeometry(0.8, 1.15, 32), new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false }));
  aimRing.rotation.x = -Math.PI / 2;
  aimLine.userData.noSight = aimRing.userData.noSight = true;
  aimLine.visible = aimRing.visible = false;
  scene.add(aimLine, aimRing);
  function stepAim() {
    const show = roundOn && me && isShooter() && aim.has && !(me.frozen > 0) && !(me.dead > 0);
    aimLine.visible = aimRing.visible = !!show;
    if (!show) return;
    const range = GUN ? gunStats().range : world.taser.range;
    const dx = aim.x - me.x, dy = aim.y - me.y, len = Math.min(range, Math.hypot(dx, dy)) || 0.01;
    const a = Math.atan2(dx, dy), ex = me.x + Math.sin(a) * len, ey = me.y + Math.cos(a) * len;
    const h = heightAt(me.x, me.y) + 0.15;
    aimLine.scale.x = len * CELL;
    aimLine.position.set((me.x + ex) / 2 * CELL, h, (me.y + ey) / 2 * CELL);
    aimLine.rotation.y = a - Math.PI / 2;
    aimRing.position.set(ex * CELL, heightAt(ex, ey) + 0.16, ey * CELL);
    const ready = performance.now() / 1000 >= (GUN ? gunReady : taserReady);
    aimLine.material.color.setHex(ready ? 0xfacc15 : 0x94a3b8);
    aimRing.material.color.setHex(ready ? 0xfacc15 : 0x94a3b8);
  }

  // ── grab rope: a line from each grabbing cop to the thief in their grip ──
  const rope = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(8 * 2 * 3), 3)),
    new THREE.LineBasicMaterial({ color: 0xfde047 }));
  rope.frustumCulled = false;
  scene.add(rope);
  function stepRope() {
    const pos = rope.geometry.attributes.position;
    let n = 0;
    for (const [id, rec] of people) {
      const target = id === meId && me ? (me.grabbing ? [...people.entries()].find(([, r]) => r.grabbedNow)?.[0] : null) : rec.grabbing;
      const t = target != null ? people.get(target) : null;
      if (!rec.actor || !t || !t.actor || n >= 8) continue;
      const a = rec.actor.root.position, b = t.actor.root.position;
      pos.setXYZ(n * 2, a.x, a.y + 2.2, a.z); pos.setXYZ(n * 2 + 1, b.x, b.y + 2.6, b.z);
      n++;
    }
    for (let k = n * 2; k < 16; k++) pos.setXYZ(k, 0, -999, 0);
    pos.needsUpdate = true;
  }

  // ── WASD: screen-relative (W = up the screen = toward the back corner) ──
  const keys = new Set();
  const MOVE_KEYS = { w: [-1, -1], arrowup: [-1, -1], s: [1, 1], arrowdown: [1, 1], a: [-1, 1], arrowleft: [-1, 1], d: [1, -1], arrowright: [1, -1] };
  let runHeld = false, running = false, taserReady = 0, shotCb = null;
  function fireTaser() {                                      // cops: shoot toward the mouse (or where I face if the mouse never moved)
    const now = performance.now() / 1000;
    if (!me || me.team !== 'cop' || me.frozen > 0 || now < taserReady) return;
    taserReady = now + world.taser.cooldown;
    const dir = aim.has ? Math.atan2(aim.x - me.x, aim.y - me.y) : me.dir;
    me.dir = dir;                                             // turn to face the shot
    muzzle(people.get(meId));
    if (moveCb) { sinceSend = 0; moveCb({ x: +me.x.toFixed(3), y: +me.y.toFixed(3), dir: +me.dir.toFixed(3), moving: false, run: false }); }
    if (shotCb) shotCb(+dir.toFixed(4));
  }
  function onKeyDown(e) {
    const k = e.key.toLowerCase();
    if ((k === ' ' || k === 'shift') && !e.target.closest('input, textarea, button') && me) {
      e.preventDefault();
      if (me.team === 'thief') runHeld = true;                // thieves run while the key is held (stamina)
      else if (k === ' ' && !e.repeat) { if (GUN) { gunHeld = true; fireGun(); } else fireTaser(); }
      return;
    }
    if (k === 'e' && !e.target.closest('input, textarea') && meId) {
      if (!e.repeat) arrestNow();                             // hold E to keep grabbing
      return;
    }
    if (EMOTE_KEYS[k] && !e.target.closest('input, textarea') && meId) {
      if (emoteCb && !e.repeat) emoteCb(EMOTE_KEYS[k]);
      return;
    }
    if (k === 'h' && !e.target.closest('input, textarea') && meId) {
      hitboxes.visible = !hitboxes.visible;
      return;
    }
    if (!MOVE_KEYS[k] || e.target.closest('input, textarea') || !meId) return;
    e.preventDefault();
    keys.add(k);
  }
  const onKeyUp = (e) => {
    const k = e.key.toLowerCase();
    keys.delete(k);
    if (k === ' ' || k === 'shift') { runHeld = false; if (GUN) gunHeld = false; }
    if (k === 'e') releaseGrab();
  };
  const onBlur = () => { keys.clear(); runHeld = false; gunHeld = false; releaseGrab(); };
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', onBlur);
  let moveCb = null, sinceSend = 0, wasMoving = false;
  function stepMe(dt) {
    if (!me) return false;
    let vx = 0, vy = 0;
    keys.forEach((k) => { vx += MOVE_KEYS[k][0]; vy += MOVE_KEYS[k][1]; });
    const len = Math.hypot(vx, vy);
    const moving = len > 0;
    const frozen = me.frozen > 0;
    if (frozen) me.frozen = Math.max(0, me.frozen - dt);
    // thieves run while Space/Shift is held and stamina lasts; stamina refills when not running (same rule as the server)
    if (me.exhausted && (me.stamina ?? 0) >= world.run.recover) me.exhausted = false;
    running = me.team === 'thief' && runHeld && moving && !frozen && !me.jailed && !me.exhausted && (me.stamina ?? 0) > 0;
    if (running) {
      me.stamina = Math.max(0, me.stamina - dt);
      if (me.stamina <= 0) me.exhausted = true;                   // used it all up: it has to recover before running again
    } else if (me.stamina != null) me.stamina = Math.min(world.run.stamina, me.stamina + dt * world.run.regen);
    if (moving && !frozen) {
      const slow = me.grabbed ? world.arrest.slow : me.grabbing ? world.arrest.cop_slow : 1;
      const dist = (me.speed || world.speed.lobby) * (running ? world.run.mult : 1) * slow * dt, steps = Math.max(1, Math.ceil(dist / 0.08));
      // other players push me softly, but only ones I can see and whose spot I know (hidden opponents arrive without x/y)
      const others = [...people.entries()].filter(([id, r]) => id !== meId && !r.hidden && Number.isFinite(r.x) && Number.isFinite(r.y)).map(([, r]) => r);
      const sx = vx / len * dist / steps, sy = vy / len * dist / steps;
      for (let i = 0; i < steps; i++) {                     // small steps, each pushed back out of whatever it touched
        const px = me.x, py = me.y;
        me.x += sx; me.y += sy;
        pushOut(me, others);
        if (!blockedAt(me.x, me.y)) continue;
        // squeezed into a notch the push could not settle: undo, then slide along one axis at a time (never report a blocked spot)
        me.x = px + sx; me.y = py; pushOut(me, others);
        if (blockedAt(me.x, me.y)) { me.x = px; me.y = py; }
        const qx = me.x;
        me.y += sy; pushOut(me, others);
        if (blockedAt(me.x, me.y)) { me.x = qx; me.y -= sy; if (blockedAt(me.x, me.y)) { me.x = px; me.y = py; } }
        if (!Number.isFinite(me.x) || !Number.isFinite(me.y)) { me.x = px; me.y = py; }    // never let a bad number stick
      }
      me.dir = Math.atan2(vx, vy);
    }
    sinceSend += dt;
    if (moveCb && (moving && sinceSend >= SEND_EVERY || moving !== wasMoving)) {
      sinceSend = 0;
      moveCb({ x: +me.x.toFixed(3), y: +me.y.toFixed(3), dir: +me.dir.toFixed(3), moving, run: running });
    }
    wasMoving = moving && !frozen;
    return moving && !frozen;
  }

  // ── dash look: dust puffs kicked up at the feet, speed streaks trailing the body, a brighter and wider ring ──
  const puffGeo = new THREE.SphereGeometry(0.75, 10, 8);
  const burstGeo = new THREE.RingGeometry(1.1, 1.6, 40);
  const bursts = [];
  function burst(x, y, color) {                              // shockwave ring at the moment a dash starts
    const m = new THREE.Mesh(burstGeo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false }));
    m.rotation.x = -Math.PI / 2;
    m.position.copy(onFloor(x, y, 0.15));
    m.userData.life = 0;
    scene.add(m);
    bursts.push(m);
  }
  const puffs = [];
  function puff(x, y) {
    const m = new THREE.Mesh(puffGeo, new THREE.MeshBasicMaterial({ color: 0xf5f1e8, transparent: true, opacity: 0.85, depthWrite: false }));
    m.position.copy(onFloor(x + (Math.random() - 0.5) * 0.25, y + (Math.random() - 0.5) * 0.25, 0.35));
    m.userData.life = 0;
    scene.add(m);
    puffs.push(m);
  }
  function stepPuffs(dt) {
    for (let i = puffs.length - 1; i >= 0; i--) {
      const m = puffs[i];
      m.userData.life += dt;
      const t = m.userData.life / 0.5;
      if (t >= 1) { scene.remove(m); m.material.dispose(); puffs.splice(i, 1); continue; }
      m.scale.setScalar(1 + t * 1.8);
      m.position.y = 0.35 + t * 1.2;
      m.material.opacity = 0.85 * (1 - t);
    }
    for (let i = bursts.length - 1; i >= 0; i--) {
      const m = bursts[i];
      m.userData.life += dt;
      const t = m.userData.life / 0.4;
      if (t >= 1) { scene.remove(m); m.material.dispose(); bursts.splice(i, 1); continue; }
      m.scale.setScalar(1 + t * 2.6);
      m.material.opacity = 0.9 * (1 - t);
    }
  }
  const streakGeo = new THREE.BoxGeometry(0.18, 0.18, 5.5);
  function streaks(rec) {
    if (rec.streaks) return rec.streaks;
    const g = new THREE.Group();
    for (const [x, h] of [[-0.9, 1.4], [0.9, 1.9], [-0.45, 3.1], [0.5, 0.7]]) {
      const s = new THREE.Mesh(streakGeo, new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false }));
      s.position.set(x, h, -3.4);                             // behind the body (the model faces +z)
      g.add(s);
    }
    g.visible = false;
    rec.actor.root.add(g);
    return (rec.streaks = g);
  }

  // ── anchors for name tags ──
  const v = new THREE.Vector3();
  function anchors() {
    const out = {};
    for (const [id, rec] of people) {
      if (!rec.actor || (rec.hidden && id !== meId)) continue;
      v.copy(rec.actor.root.position).setY(6.2).project(camera);
      const age = rec.emote ? performance.now() / 1000 - rec.emote.born : 9;
      out[id] = { x: (v.x + 1) / 2 * container.clientWidth, y: (1 - v.y) / 2 * container.clientHeight, name: rec.name, me: id === meId,
        online: rec.online !== false, team: rec.team, jailed: rec.jailed, reach: id === reachId, hp: rec.hp, dead: rec.dead > 0, emote: age < 1.8 ? rec.emote.e : null, emoteAge: age };
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
      a.root.visible = (mine || !rec.hidden) && !(rec.dead > 0);
      if (!a.root.visible) continue;
      const ahead = mine ? 0 : Math.min(0.12, performance.now() / 1000 - (rec.sampleAt || 0));
      const tx = mine ? me.x : rec.x + (rec.vx || 0) * ahead, ty = mine ? me.y : rec.y + (rec.vy || 0) * ahead;
      const target = onFloor(tx, ty);
      if (mine || rec.snap) { a.root.position.copy(target); rec.snap = false; }
      else a.root.position.lerp(target, Math.min(1, dt * 14));
      a.root.rotation.y = mine ? me.dir : rec.dir;
      const nowS = performance.now() / 1000;
      const dashing = mine ? running : !!rec.running;          // running look: streaks, dust, bright ring
      if (rec.ring) {
        const flash = rec.safe > 0 && Math.floor(performance.now() / 150) % 2;
        rec.ring.material.color.setHex(rec.jailed ? 0x64748b : flash ? 0x22c55e : TEAM_RING[rec.team || rec.pref] || 0x4f46e5);
        if (dashing) rec.ring.material.color.lerp(WHITE, 0.45);
        rec.ring.scale.setScalar(dashing ? 1.45 : 1);
        rec.ring.material.opacity = dashing ? 1 : 0.8;
        rec.ring.visible = !!rec.team || !!rec.pref || hitboxes.visible || mine || dashing;
      }
      if (dashing && !rec.wasDashing) burst(tx, ty, rec.jailed ? 0x94a3b8 : TEAM_RING[rec.team] || 0x6366f1);
      rec.wasDashing = dashing;
      const st = streaks(rec);
      st.visible = dashing;
      if (dashing) {
        st.children.forEach((s, k) => { s.material.opacity = 0.5 + 0.4 * Math.abs(Math.sin(nowS * 30 + k * 1.7)); s.scale.z = 0.8 + 0.4 * Math.abs(Math.sin(nowS * 22 + k)); });
        rec.puffT = (rec.puffT || 0) + dt;
        if (rec.puffT > 0.05) { rec.puffT = 0; puff(tx, ty); }
      }
      const stunned = (rec.stunEnd || 0) > nowS;
      sparks(rec, stunned);
      if (stunned) {                                           // electrocuted: shake in place, cyan flicker underfoot
        a.root.rotation.y += Math.sin(nowS * 70) * 0.18;
        if (rec.ring) rec.ring.material.color.setHex(Math.floor(nowS * 20) % 2 ? 0x22d3ee : 0xffffff);
      }
      const crouch = (rec.crouchUntil || 0) > nowS, grab = (rec.grabUntil || 0) > nowS || (mine ? me.grabbing : rec.grabbing != null);
      if ((mine ? me.grabbed : rec.grabbedNow) && !stunned) a.root.rotation.y += Math.sin(nowS * 40) * 0.25;   // squirming in a cop's grip
      a.pose(crouch ? 'sit' : grab ? 'work' : !stunned && ((mine ? myMoving : rec.moving) || dashing) ? 'walk' : 'idle');
      if (a.mixer) a.mixer.timeScale = dashing ? 1.6 : stunned ? 3 : 1;
      a.update(dt);
    }
    findReach();
    if (GUN) {
      if (gunHeld && me && me.auto) fireGun();
      stepTracers();
      stepPickups();
    }
    stepDarts();
    stepSight();
    stepDoors(dt);
    stepAim();
    stepRope();
    if (GUN) stepGates();
    stepPuffs(dt);
    const eye = eyePos();
    if (eye) focus.lerp(onFloor(eye.x, eye.y), Math.min(1, dt * 5));
    if (padRing) padRing.material.opacity = 0.6 + Math.sin(performance.now() / 250) * 0.3;
    placeCamera();
    renderer.render(scene, camera);
    if (frameCb) frameCb(anchors());
    if (!dead) raf = requestAnimationFrame(tick);
  }
  let raf = requestAnimationFrame(tick);

  // ── tagging: a cop tells the server the moment a thief touches them on this screen. Others are drawn slightly late, so the
  // server judges the claim against where that thief was over the last few tenths of a second (untitled_world.Room.tag). ──
  // ── arresting is an action, not a touch: a cop presses E (or the page's button) with a thief within world.arrest.reach on
  // this screen. The server judges it against where that thief was over the last few tenths of a second (Room.arrest). ──
  let arrestCb = null, arrestReady = 0, reachId = null;
  function findReach() {                                    // the nearest thief I could grab right now (shown as "E" on the name tag)
    reachId = null;
    const mine = people.get(meId);
    if (!me || !mine || mine.team !== 'cop' || me.frozen > 0 || me.grabbing) return;
    let best = world.arrest.reach + 0.05;
    for (const [id, rec] of people) {
      if (id === meId || !rec.actor || rec.hidden || rec.team !== 'thief' || rec.jailed || rec.safe > 0) continue;
      const p = rec.actor.root.position, d = Math.hypot(p.x / CELL - me.x, p.z / CELL - me.y);
      if (d <= best) { best = d; reachId = id; }
    }
  }
  function arrestNow() {
    const mine = people.get(meId), now = performance.now() / 1000;
    if (!arrestCb || !me || !mine || mine.team !== 'cop' || me.frozen > 0 || now < arrestReady) return;
    arrestReady = now + world.arrest.cooldown;
    mine.grabUntil = now + 0.35;                               // reach out right away; the server says if it got hold of anyone
    grabHeld = true;
    if (moveCb) { sinceSend = 0; moveCb({ x: +me.x.toFixed(3), y: +me.y.toFixed(3), dir: +me.dir.toFixed(3), moving: false, run: false }); }   // my latest spot first
    arrestCb(reachId);
  }
  let grabHeld = false, releaseCb = null;
  function releaseGrab() {                                    // letting go of E before the grab completes lets the thief go
    if (!grabHeld) return;
    grabHeld = false;
    if (releaseCb) releaseCb();
  }


  // ── taser: a dart flies from the cop along the shot direction (server 'shot' event) until the server's 'tase' event says where it
  // stopped (a thief, a wall, or the end of its range); two thin wires trail back to the gun. A hit sets the thief sparking. ──
  const darts = [];
  const dartGeo = new THREE.BoxGeometry(0.35, 0.35, 1.1);
  const dartMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });
  const wireMat = new THREE.LineBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.9 });
  function handleEvents(list) {
    const now = performance.now() / 1000;
    for (const ev of list || []) {
      if (GUN && ev.t === 'gshot') {
        if (ev.id !== meId) muzzle(people.get(ev.id));
        const from = onFloor(ev.x, ev.y, 2.3);
        for (const [ex, ey] of ev.ends) {
          const to = onFloor(ex, ey, 2.3);
          const geo = new THREE.BufferGeometry().setFromPoints([from, to]);
          const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: ev.w === 'sniper' ? 0xe9d5ff : 0xfef08a, transparent: true, opacity: 0.95 }));
          line.frustumCulled = false; line.userData.noSight = true;
          scene.add(line);
          tracers.push({ line, born: now });
        }
      } else if (GUN && ev.t === 'hit') {
        const rec = people.get(ev.id);
        if (rec && rec.actor && !rec.hidden) {
          const hx = ev.id === meId && me ? me.x : rec.x, hy = ev.id === meId && me ? me.y : rec.y;
          if (Number.isFinite(hx) && Number.isFinite(hy)) for (let k = 0; k < 4; k++) puff(hx + (Math.random() - 0.5) * 0.4, hy + (Math.random() - 0.5) * 0.4);
        }
        if (rec) rec.hitAt = now;
      } else if (GUN && ev.t === 'kill') {
        const rec = people.get(ev.victim);
        if (rec && Number.isFinite(rec.x)) burst(ev.victim === meId && me ? me.x : rec.x, ev.victim === meId && me ? me.y : rec.y, 0xef4444);
      } else if (GUN && ev.t === 'respawn') {
        const rec = people.get(ev.id);
        if (rec && Number.isFinite(rec.x)) burst(ev.id === meId && me ? me.x : rec.x, ev.id === meId && me ? me.y : rec.y, 0x22c55e);
      } else if (ev.t === 'shot') {
        const m = new THREE.Mesh(dartGeo, dartMat);
        m.rotation.y = ev.dir;
        const wires = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(12), 3)), wireMat);
        wires.frustumCulled = false;
        scene.add(m, wires);
        darts.push({ cop: ev.cop, x: ev.x, y: ev.y, dir: ev.dir, t0: now, end: null, endAt: 0, m, wires });
        if (ev.cop !== meId) muzzle(people.get(ev.cop));
      } else if (ev.t === 'grab') {
        const rec = people.get(ev.cop);
        if (rec && ev.cop !== meId) rec.grabUntil = now + 0.35;
      } else if (ev.t === 'caught') {
        const rec = people.get(ev.thief);                      // jailed while stunned: the sparks and shaking stop with the stun
        if (rec) { rec.stunEnd = 0; sparks(rec, false); }
      } else if (ev.t === 'emote') {
        showEmote(ev.id, ev.e);
      } else if (ev.t === 'tase') {
        const d = darts.find((q) => q.cop === ev.cop && !q.end);
        if (d) d.end = { x: ev.x, y: ev.y };
        if (ev.thief != null) {
          const rec = people.get(ev.thief);
          if (rec) rec.stunEnd = now + world.taser.stun;
          for (let k = 0; k < 6; k++) puff(ev.x + (Math.random() - 0.5) * 0.4, ev.y + (Math.random() - 0.5) * 0.4);
        }
      }
    }
  }
  const tracers = [];                                         // gun mode: bullet lines that fade out fast
  function stepTracers() {
    const now = performance.now() / 1000;
    for (let i = tracers.length - 1; i >= 0; i--) {
      const t = tracers[i], age = now - t.born;
      t.line.material.opacity = Math.max(0, 0.95 * (1 - age / 0.16));
      if (age > 0.16) { scene.remove(t.line); t.line.geometry.dispose(); t.line.material.dispose(); tracers.splice(i, 1); }
    }
  }
  // ── pickups (gun mode): a coloured crate on a glowing disc; bobs and turns, hidden while taken ──
  const PICKUP_LOOK = { rifle: 0x22c55e, shotgun: 0xf97316, sniper: 0xa855f7, medkit: 0xef4444 };
  const pickups = new Map();
  function setPickups(list) {
    for (const it of list || []) {
      let rec = pickups.get(it.id);
      if (!rec) {
        const g = new THREE.Group();
        const color = PICKUP_LOOK[it.kind] || 0xffffff;
        const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.7, 0.15, 28), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.55, depthWrite: false }));
        disc.userData.noSight = true;
        const crate = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.5, 1.5), new THREE.MeshStandardMaterial({ color, roughness: 0.4, emissive: color, emissiveIntensity: 0.35 }));
        crate.castShadow = true;
        if (it.kind === 'medkit') {
          const cross = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.5, 1.6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
          const cross2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.6, 1.6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
          crate.add(cross, cross2);
        } else {
          const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, it.kind === 'sniper' ? 2.4 : 1.8), new THREE.MeshStandardMaterial({ color: 0x0f172a }));
          barrel.position.y = 1.0; barrel.rotation.y = 0.6;
          crate.add(barrel);
        }
        g.add(disc, crate);
        g.position.copy(onFloor(it.x, it.y, 0.2));
        g.userData.crate = crate;
        scene.add(g);
        rec = { g, crate };
        pickups.set(it.id, rec);
      }
      rec.g.visible = !!it.on;
    }
  }
  function stepPickups() {
    const t = performance.now() / 1000;
    for (const rec of pickups.values()) {
      if (!rec.g.visible) continue;
      rec.crate.position.y = 2.1 + Math.sin(t * 2.4 + rec.g.position.x) * 0.35;
      rec.crate.rotation.y = t * 1.2;
    }
  }
  function stepDarts() {
    const now = performance.now() / 1000, speed = world.taser.speed, range = world.taser.range;
    for (let i = darts.length - 1; i >= 0; i--) {
      const d = darts[i];
      let dist = Math.min(range, (now - d.t0) * speed);
      if (d.end) dist = Math.min(dist, Math.hypot(d.end.x - d.x, d.end.y - d.y));
      const x = d.x + Math.sin(d.dir) * dist, y = d.y + Math.cos(d.dir) * dist;
      d.m.position.copy(onFloor(x, y, 2.2));
      const shooter = people.get(d.cop), from = shooter && shooter.actor ? shooter.actor.root.position : onFloor(d.x, d.y);
      const pos = d.wires.geometry.attributes.position, hy = heightAt(x, y);
      pos.setXYZ(0, from.x - 0.25, from.y + 2.3, from.z); pos.setXYZ(1, x * CELL - 0.15, hy + 2.3, y * CELL);
      pos.setXYZ(2, from.x + 0.25, from.y + 2.1, from.z); pos.setXYZ(3, x * CELL + 0.15, hy + 2.1, y * CELL);
      pos.needsUpdate = true;
      const arrived = (d.end && dist >= Math.hypot(d.end.x - d.x, d.end.y - d.y) - 1e-3) || dist >= range;
      if (arrived && !d.endAt) d.endAt = now;
      if (d.endAt && now - d.endAt > 0.35 || now - d.t0 > 2) {     // wires linger a moment, then reel in
        scene.remove(d.m, d.wires); d.wires.geometry.dispose(); darts.splice(i, 1);
      }
    }
  }
  function muzzle(rec) {                                      // flash at the gun when a taser fires
    if (!rec || !rec.gun) return;
    const flash = new THREE.Mesh(new THREE.SphereGeometry(GUN ? 0.13 : 0.09, 8, 6), new THREE.MeshBasicMaterial({ color: GUN ? 0xfde047 : 0x7dd3fc, transparent: true, opacity: 0.95 }));
    flash.position.set(0, 0, GUN ? (rec.gun.userData.muzzle || 0.24) + 0.04 : 0.24);
    rec.gun.add(flash);
    setTimeout(() => { rec.gun && rec.gun.remove(flash); flash.material.dispose(); }, 120);
  }
  const sparkMat = new THREE.LineBasicMaterial({ color: 0x67e8f9, transparent: true, opacity: 0.95 });
  function sparks(rec, on) {                                  // electric zigzags around a stunned body, redrawn every frame
    if (!on) { if (rec.sparks) rec.sparks.visible = false; return; }
    if (!rec.sparks) {
      rec.sparks = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(3 * 2 * 18), 3)), sparkMat);
      rec.sparks.frustumCulled = false;
      rec.actor.root.add(rec.sparks);
    }
    rec.sparks.visible = true;
    const pos = rec.sparks.geometry.attributes.position;
    for (let b = 0; b < 3; b++) {                              // three bolts of six segments each, from feet to head
      let a = Math.random() * Math.PI * 2, px = Math.cos(a) * 1.3, py = 0.3, pz = Math.sin(a) * 1.3;
      for (let k = 0; k < 6; k++) {
        a += (Math.random() - 0.3) * 1.2;
        const nx = Math.cos(a) * (1.1 + Math.random() * 0.6), ny = py + 0.7 + Math.random() * 0.4, nz = Math.sin(a) * (1.1 + Math.random() * 0.6);
        const idx = (b * 6 + k) * 2;
        pos.setXYZ(idx, px, py, pz); pos.setXYZ(idx + 1, nx, ny, nz);
        px = nx; py = ny; pz = nz;
      }
    }
    pos.needsUpdate = true;
  }

  // ── sight: during a round everything I can't see from where I stand (floor, walls, furniture, teammates) is shaded dark blue.
  // Rays are cast from me against walls and tall furniture (world.sight, the server's can_see rule); what a ray reaches is lit,
  // fading out toward world.view cells, and the result is blurred so shadow edges are soft. Every scene material reads this
  // texture (patched in sightify), so nothing in a dark room looks lit. Glowing effects opt out with userData.noSight. ──
  let roundOn = false, sightAt = 0;
  const SUB = 4, FX = MW * SUB, FY = MH * SUB;               // quarter-cell texels
  const sightRaw = new Float32Array(FX * FY), sightData = new Uint8Array(FX * FY);
  const sightTex = new THREE.DataTexture(sightData, FX, FY, THREE.RedFormat, THREE.UnsignedByteType);
  sightTex.magFilter = THREE.LinearFilter; sightTex.minFilter = THREE.LinearFilter; sightTex.needsUpdate = true;
  const sightU = SIGHT;
  SIGHT.uSight.value = sightTex; SIGHT.uSightOn.value = 0; SIGHT.uSightSize.value.set(WX, WZ);
  const opaqueBase = new Uint8Array(FX * FY);                 // quarter-cell grid of what always blocks sight (walls, tall furniture)
  const opaque = new Uint8Array(FX * FY);                     // opaqueBase plus the doors that are shut right now
  const cellsOf = (b) => {
    const out = [];
    for (let i = Math.max(0, Math.floor((b.cx - b.hx) * SUB)); i < Math.min(FX, Math.ceil((b.cx + b.hx) * SUB)); i++) {
      for (let j = Math.max(0, Math.floor((b.cy - b.hy) * SUB)); j < Math.min(FY, Math.ceil((b.cy + b.hy) * SUB)); j++) out.push(j * FX + i);
    }
    return out;
  };
  for (const b of world.sight || []) for (const k of cellsOf(b)) opaqueBase[k] = 1;
  const doorCells = new Map((world.door_sight || []).map((d) => [d.id, cellsOf(d)]));
  let openDoors = new Set();
  function applyDoorSight() {
    opaque.set(opaqueBase);
    for (const [id, cells] of doorCells) if (!openDoors.has(id)) for (const k of cells) opaque[k] = 1;
  }
  applyDoorSight();
  function setOpenDoors(list) {                               // from the server: doors with someone next to them (open = see-through)
    const next = new Set(list || []);
    if (next.size === openDoors.size && [...next].every((id) => openDoors.has(id))) return;
    openDoors = next;
    applyDoorSight();
  }
  function sightify(material) {
    if (!material || material.userData.sight || material.userData.noSight || material.isLineBasicMaterial || material.isSpriteMaterial) return;
    material.userData.sight = true;
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, sightU);
      shader.vertexShader = 'varying vec2 vSightXZ;\n' + shader.vertexShader.replace('#include <project_vertex>',
        '#include <project_vertex>\n  vSightXZ = (modelMatrix * vec4(transformed, 1.0)).xz;');
      shader.fragmentShader = 'uniform sampler2D uSight;\nuniform float uSightOn;\nuniform vec2 uSightSize;\nvarying vec2 vSightXZ;\n'
        + shader.fragmentShader.replace('#include <dithering_fragment>', `#include <dithering_fragment>
  if (uSightOn > 0.5) { float sv = texture2D(uSight, vSightXZ / uSightSize).r; gl_FragColor.rgb *= mix(vec3(0.2, 0.23, 0.34), vec3(1.0), sv); }`);
    };
    material.customProgramCacheKey = () => 'sight1';
    material.needsUpdate = true;
  }
  let sightScanAt = 0;
  function sightScan() {                                      // patch materials of whatever was added since the last scan
    scene.traverse((o) => {
      if (!o.material || o.userData.noSight) return;
      (Array.isArray(o.material) ? o.material : [o.material]).forEach(sightify);
    });
  }
  function eyePos() {                                         // where the sight cone is drawn from: me, or the teammate I'm spectating when I have fallen
    if (GUN && me && me.dead > 0 && specId != null) {
      const rec = people.get(specId);
      if (rec && rec.actor) return { x: rec.actor.root.position.x / CELL, y: rec.actor.root.position.z / CELL };
    }
    return me;
  }
  function stepSight() {
    const eye = eyePos();
    const on = roundOn && !!eye && !!me.team;
    sightU.uSightOn.value = on ? 1 : 0;
    const now = performance.now();
    if (now - sightScanAt > 700) { sightScanAt = now; sightScan(); }
    if (!on || now - sightAt < 100) return;
    sightAt = now;
    sightRaw.fill(0);
    const R = world.view || 18, FADE = 5, RAYS = 720, STEP = 0.12;
    const light = (x, y, v) => {
      const i = Math.floor(x * SUB), j = Math.floor(y * SUB);
      if (i < 0 || j < 0 || i >= FX || j >= FY) return;
      const k = j * FX + i;
      if (v > sightRaw[k]) sightRaw[k] = v;
    };
    for (let r = 0; r < RAYS; r++) {
      const a = r / RAYS * Math.PI * 2, dx = Math.cos(a), dy = Math.sin(a);
      let after = -1;                                         // once a ray hits a wall, light a little more so the wall's face shows
      for (let d = 0; d <= R; d += STEP) {
        const x = eye.x + dx * d, y = eye.y + dy * d;
        if (areaAt(x, y) < 0 && after < 0) after = 1;
        const v = d < R - FADE ? 1 : Math.max(0, (R - d) / FADE);
        light(x, y, v);
        if (after >= 0) { if (after-- === 0) break; continue; }
        const i = Math.floor(x * SUB), j = Math.floor(y * SUB);
        if (i >= 0 && j >= 0 && i < FX && j < FY && opaque[j * FX + i]) after = 3;
      }
    }
    for (let j = 0; j < FY; j++) {                            // 3×3 blur for soft edges
      for (let i = 0; i < FX; i++) {
        let sum = 0, n = 0;
        for (let b = -1; b <= 1; b++) for (let c = -1; c <= 1; c++) {
          const ii = i + c, jj = j + b;
          if (ii >= 0 && jj >= 0 && ii < FX && jj < FY) { sum += sightRaw[jj * FX + ii]; n++; }
        }
        sightData[j * FX + i] = Math.round(sum / n * 255);
      }
    }
    sightTex.needsUpdate = true;
  }

  // ── rescue pad: a green ring fills while a thief stands on it (world.rescue seconds) ──
  let padFill = null;
  function setPad(padP) {
    if (!padRing) return;
    if (padFill) { scene.remove(padFill); padFill.geometry.dispose(); padFill = null; }
    if (padP > 0) {
      padFill = new THREE.Mesh(new THREE.RingGeometry(world.pad.r * CELL - 0.7, world.pad.r * CELL + 0.4, 48, 1, Math.PI / 2, -Math.PI * 2 * padP),
        new THREE.MeshBasicMaterial({ color: 0x22c55e, side: THREE.DoubleSide, transparent: true, opacity: 0.95, depthWrite: false }));
      padFill.userData.noSight = true;
      padFill.rotation.x = -Math.PI / 2;
      padFill.position.copy(onFloor(world.pad.cx, world.pad.cy, 0.12));
      scene.add(padFill);
    }
  }

  // ── emotes: an emoji bubble over the head, or (teabag) a quick crouch. Keys 1–5 and C. ──
  const EMOJI = { laugh: '🤣', taunt: '😜', wave: '👋', angry: '😡', cool: '😎' };
  const EMOTE_KEYS = { 1: 'laugh', 2: 'taunt', 3: 'wave', 4: 'angry', 5: 'cool', c: 'teabag' };
  function showEmote(id, kind) {                             // the emoji itself is drawn by the page above the name tag (anchors)
    const rec = people.get(id);
    if (!rec || !rec.actor || (rec.hidden && id !== meId)) return false;
    const now = performance.now() / 1000;
    if (kind === 'teabag') rec.crouchUntil = now + 0.28;
    else rec.emote = { e: EMOJI[kind] || '❓', born: now };
    return true;
  }
  let emoteCb = null;

  function dispose() {
    dead = true;
    if (SIGHT.uSight.value === sightTex) SIGHT.uSightOn.value = 0;
    cancelAnimationFrame(raf);
    resizer.disconnect();
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('blur', onBlur);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerUp);
    renderer.domElement.removeEventListener('pointermove', onPointerMove);
    renderer.domElement.removeEventListener('pointerdown', onPointerDown);
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  }

  return {
    setPlayers, correct, clear, dispose, mapKey: world.key,
    onArrest(cb) { arrestCb = cb; },
    arrestNow,
    focus() { renderer.domElement.focus(); },
    onMove(cb) { moveCb = cb; },
    onRelease(cb) { releaseCb = cb; },
    releaseGrab,
    fireTaser,
    onShot(cb) { shotCb = cb; },
    onEmote(cb) { emoteCb = cb; },
    setPad,
    setOpenDoors,
    setPickups,
    setLock,
    setSide,
    events: handleEvents,
    setPhase(phase) { phaseNow = phase; roundOn = phase === 'countdown' || phase === 'playing' || phase === 'buy'; },
    setSpectate(id) { specId = id; },
    onSpectate(cb) { specCb = cb; },
    abilityState() {                                           // what Space does for me right now, and how long until it's ready
      const now = performance.now() / 1000, team = me && me.team;
      if (GUN) { const st = gunStats(); return me && isShooter() ? { kind: 'gun', name: st.name, ammo: me.ammo, ready: Math.max(0, gunReady - now), cooldown: st.cooldown } : { kind: null }; }
      if (team === 'cop') return { kind: 'taser', ready: Math.max(0, taserReady - now), cooldown: world.taser.cooldown, active: false };
      if (team === 'thief') return { kind: 'run', stamina: (me.stamina ?? world.run.stamina) / world.run.stamina, active: running, exhausted: !!me.exhausted };
      return { kind: null };
    },
    onFrame(cb) { frameCb = cb; },
  };
}
