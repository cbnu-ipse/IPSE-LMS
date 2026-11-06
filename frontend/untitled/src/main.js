// 3D map for the cops-and-robbers room game (templates/game/untitled.html). The page owns the WebSocket; this module draws the
// map (rooms and corridors from untitled_maps) and everyone in the room, moves the local player with WASD (camera-relative, sliding
// along obstacles), and reports the local position (onMove) and name-tag anchors (onFrame). Collision uses the server's shapes: the
// player is a circle, props are circles or boxes sized from the real models; overlaps are pushed out so the player slides around things.
// During a round whatever the local player can't see is shaded dark (sight shader), and the server leaves out opponents we can't see.
// Space: thieves dash, cops fire the taser.
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

export function createRoomScene(container, { base, world }) {
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
    m.position.copy(onFloor(s.cx, s.cy, 0.6));
    m.renderOrder = 10;
    hitboxes.add(m);
  });
  const ringGeo = new THREE.RingGeometry(R * CELL - 0.25, R * CELL, 40);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x4f46e5, transparent: true, opacity: 0.8, side: THREE.DoubleSide, depthWrite: false });

  // ── team look: a blue police cap or a black beanie on the head bone (model units), and the colour of the ring underfoot ──
  const TEAM_RING = { cop: 0x2563eb, thief: 0xdc2626 };
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
    g.position.set(-0.01, -0.13, 0.05);
    g.scale.setScalar(1.6);                   // a bit oversized so it reads from the isometric camera
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
    if (team === 'cop' && arm) { rec.gun = taserGun(); arm.add(rec.gun); }    // cops carry a taser instead of dashing
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
      dressFor(rec, p.team);
      if (p.stun > 0) rec.stunEnd = performance.now() / 1000 + p.stun;
      if (p.id === meId) {                                     // my own position is driven locally; adopt it at first and whenever the server moves me
        if (!me || p.tp !== me.tp) { me = { ...(me || {}), x: p.x, y: p.y, dir: p.dir, tp: p.tp }; }
        me.speed = p.speed; me.frozen = p.frozen; me.jailed = p.jailed; me.team = p.team;
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
      if (p.dashing && !rec.dashing) rec.dashEnd = performance.now() / 1000 + world.dash.seconds;   // local expiry in case the "off" update is late
      rec.dashing = !!p.dashing;
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
  let dashUntil = 0, dashReady = 0, dashCb = null, taserReady = 0, shotCb = null;
  function onKeyDown(e) {
    const k = e.key.toLowerCase();
    if (k === ' ' && !e.target.closest('input, textarea, button') && me) {
      e.preventDefault();
      const now = performance.now() / 1000;
      if (me.frozen > 0 || me.jailed) return;
      if (me.team === 'thief' && now >= dashReady) {          // thieves dash
        dashUntil = now + world.dash.seconds;
        dashReady = now + world.dash.cooldown;
        if (dashCb) dashCb();
      } else if (me.team === 'cop' && now >= taserReady) {    // cops fire the taser where they face
        taserReady = now + world.taser.cooldown;
        muzzle(people.get(meId));
        if (shotCb) shotCb(+me.dir.toFixed(4));
      }
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
  const onKeyUp = (e) => keys.delete(e.key.toLowerCase());
  const onBlur = () => keys.clear();
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
    if (moving && !frozen) {
      const boost = performance.now() / 1000 < dashUntil ? world.dash.mult : 1;
      const dist = (me.speed || world.speed.lobby) * boost * dt, steps = Math.max(1, Math.ceil(dist / 0.08));
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
      moveCb({ x: +me.x.toFixed(3), y: +me.y.toFixed(3), dir: +me.dir.toFixed(3), moving });
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
        online: rec.online !== false, team: rec.team, jailed: rec.jailed, emote: age < 1.8 ? rec.emote.e : null, emoteAge: age };
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
      a.root.visible = mine || !rec.hidden;
      if (!a.root.visible) continue;
      const ahead = mine ? 0 : Math.min(0.12, performance.now() / 1000 - (rec.sampleAt || 0));
      const tx = mine ? me.x : rec.x + (rec.vx || 0) * ahead, ty = mine ? me.y : rec.y + (rec.vy || 0) * ahead;
      const target = onFloor(tx, ty);
      if (mine || rec.snap) { a.root.position.copy(target); rec.snap = false; }
      else a.root.position.lerp(target, Math.min(1, dt * 14));
      a.root.rotation.y = mine ? me.dir : rec.dir;
      const nowS = performance.now() / 1000;
      const dashing = mine ? nowS < dashUntil : rec.dashing && nowS < (rec.dashEnd || 0);
      if (rec.ring) {
        const flash = rec.safe > 0 && Math.floor(performance.now() / 150) % 2;
        rec.ring.material.color.setHex(rec.jailed ? 0x64748b : flash ? 0x22c55e : TEAM_RING[rec.team] || 0x4f46e5);
        if (dashing) rec.ring.material.color.lerp(WHITE, 0.45);
        rec.ring.scale.setScalar(dashing ? 1.45 : 1);
        rec.ring.material.opacity = dashing ? 1 : 0.8;
        rec.ring.visible = !!rec.team || hitboxes.visible || mine || dashing;
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
      const crouch = (rec.crouchUntil || 0) > nowS;
      a.pose(crouch ? 'sit' : !stunned && ((mine ? myMoving : rec.moving) || dashing) ? 'walk' : 'idle');
      if (a.mixer) a.mixer.timeScale = dashing ? 1.8 : stunned ? 3 : 1;
      a.update(dt);
    }
    checkTags();
    stepDarts();
    stepSight();
    stepArtifacts(dt);
    stepPuffs(dt);
    if (me) focus.lerp(onFloor(me.x, me.y), Math.min(1, dt * 5));
    if (padRing) padRing.material.opacity = 0.6 + Math.sin(performance.now() / 250) * 0.3;
    placeCamera();
    renderer.render(scene, camera);
    if (frameCb) frameCb(anchors());
    if (!dead) raf = requestAnimationFrame(tick);
  }
  let raf = requestAnimationFrame(tick);

  // ── tagging: a cop tells the server the moment a thief touches them on this screen. Others are drawn slightly late, so the
  // server judges the claim against where that thief was over the last few tenths of a second (untitled_world.Room.tag). ──
  let tagCb = null;
  function checkTags() {
    const mine = people.get(meId);
    if (!tagCb || !me || !mine || mine.team !== 'cop' || me.frozen > 0) return;
    const now = performance.now() / 1000;
    for (const [id, rec] of people) {
      if (id === meId || !rec.actor || rec.hidden || rec.team !== 'thief' || rec.jailed || rec.safe > 0) continue;
      const p = rec.actor.root.position;
      if (Math.hypot(p.x / CELL - me.x, p.z / CELL - me.y) > world.catch + 0.05 || now - (rec.tagAt || 0) < 0.25) continue;
      rec.tagAt = now;
      if (moveCb) { sinceSend = 0; moveCb({ x: +me.x.toFixed(3), y: +me.y.toFixed(3), dir: +me.dir.toFixed(3), moving: true }); }   // my latest spot first
      tagCb(id);
    }
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
      if (ev.t === 'shot') {
        const m = new THREE.Mesh(dartGeo, dartMat);
        m.rotation.y = ev.dir;
        const wires = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(12), 3)), wireMat);
        wires.frustumCulled = false;
        scene.add(m, wires);
        darts.push({ cop: ev.cop, x: ev.x, y: ev.y, dir: ev.dir, t0: now, end: null, endAt: 0, m, wires });
        if (ev.cop !== meId) muzzle(people.get(ev.cop));
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
    const flash = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 6), new THREE.MeshBasicMaterial({ color: 0x7dd3fc, transparent: true, opacity: 0.95 }));
    flash.position.set(0, 0, 0.24);
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
  const opaque = new Uint8Array(FX * FY);                     // quarter-cell grid of what blocks sight
  for (const b of world.sight || []) {
    for (let i = Math.max(0, Math.floor((b.cx - b.hx) * SUB)); i < Math.min(FX, Math.ceil((b.cx + b.hx) * SUB)); i++) {
      for (let j = Math.max(0, Math.floor((b.cy - b.hy) * SUB)); j < Math.min(FY, Math.ceil((b.cy + b.hy) * SUB)); j++) opaque[j * FX + i] = 1;
    }
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
  function stepSight() {
    const on = roundOn && !!me && !!me.team;
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
        const x = me.x + dx * d, y = me.y + dy * d;
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

  // ── artifacts: a spinning gem on a pedestal with a light beam (seen through the dark), and a ring that fills while a thief
  // steals it. The rescue pad gets the same kind of ring. ──
  const artifacts = new Map();                                // id → { group, gem, ring, p }
  const glow = (m) => { m.userData.noSight = true; return m; };
  function progressRing(r0, r1, p, color) {
    return new THREE.Mesh(new THREE.RingGeometry(r0, r1, 48, 1, Math.PI / 2, -Math.PI * 2 * Math.max(0.001, p)),
      glow(new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.95, depthWrite: false })));
  }
  function setArtifacts(list, padP) {
    const seenIds = new Set();
    for (const a of list || []) {
      seenIds.add(a.id);
      let rec = artifacts.get(a.id);
      if (!rec) {
        const group = new THREE.Group();
        const base = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.4, 1.0, 20), new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 }));
        base.position.y = 0.5;
        const gem = new THREE.Mesh(new THREE.OctahedronGeometry(1.0), glow(new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 0.9, metalness: 0.4, roughness: 0.25 })));
        gem.position.y = 2.7; gem.castShadow = true;
        const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.9, 16, 16, 1, true), glow(new THREE.MeshBasicMaterial({ color: 0xfde68a, transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide })));
        beam.position.y = 8;
        group.add(base, gem, beam);
        group.position.copy(onFloor(a.x, a.y));
        scene.add(group);
        rec = { group, gem, ring: null, p: -1 };
        artifacts.set(a.id, rec);
        for (let k = 0; k < 5; k++) puff(a.x + (Math.random() - 0.5), a.y + (Math.random() - 0.5));
      }
      if (Math.abs(a.p - rec.p) > 0.01) {                     // redraw the steal ring
        if (rec.ring) { rec.group.remove(rec.ring); rec.ring.geometry.dispose(); }
        rec.ring = a.p > 0 ? progressRing(world.steal.radius * CELL - 0.6, world.steal.radius * CELL, a.p, 0xef4444) : null;
        if (rec.ring) { rec.ring.rotation.x = -Math.PI / 2; rec.ring.position.y = 0.15; rec.group.add(rec.ring); }
        rec.p = a.p;
      }
    }
    for (const [id, rec] of artifacts) {
      if (seenIds.has(id)) continue;
      const p = rec.group.position;
      for (let k = 0; k < 10; k++) puff(p.x / CELL + (Math.random() - 0.5) * 1.5, p.z / CELL + (Math.random() - 0.5) * 1.5);
      scene.remove(rec.group);
      artifacts.delete(id);
    }
    if (padRing) {
      if (padFill) { scene.remove(padFill); padFill.geometry.dispose(); padFill = null; }
      if (padP > 0) {
        padFill = progressRing(world.pad.r * CELL - 0.7, world.pad.r * CELL + 0.4, padP, 0x22c55e);
        padFill.rotation.x = -Math.PI / 2;
        padFill.position.copy(onFloor(world.pad.cx, world.pad.cy, 0.12));
        scene.add(padFill);
      }
    }
  }
  let padFill = null;
  function stepArtifacts(dt) {
    const t = performance.now() / 1000;
    for (const rec of artifacts.values()) { rec.gem.rotation.y += dt * 1.6; rec.gem.position.y = 2.7 + Math.sin(t * 2.2) * 0.25; }
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
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement.remove();
  }

  return {
    setPlayers, correct, clear, dispose, mapKey: world.key,
    onTag(cb) { tagCb = cb; },
    focus() { renderer.domElement.focus(); },
    onMove(cb) { moveCb = cb; },
    onDash(cb) { dashCb = cb; },
    onShot(cb) { shotCb = cb; },
    onEmote(cb) { emoteCb = cb; },
    setArtifacts,
    events: handleEvents,
    setPhase(phase) { roundOn = phase === 'countdown' || phase === 'playing'; },
    abilityState() {                                           // what Space does for me right now, and how long until it's ready
      const now = performance.now() / 1000, team = me && me.team;
      if (team === 'cop') return { kind: 'taser', ready: Math.max(0, taserReady - now), cooldown: world.taser.cooldown, active: false };
      if (team === 'thief') return { kind: 'dash', ready: Math.max(0, dashReady - now), cooldown: world.dash.cooldown, active: now < dashUntil };
      return { kind: null };
    },
    onFrame(cb) { frameCb = cb; },
  };
}
