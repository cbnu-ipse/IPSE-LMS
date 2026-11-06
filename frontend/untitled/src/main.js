// 3D plaza for the cops-and-robbers room game (templates/game/untitled.html). The page owns the WebSocket; this module draws the
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
const LOW_WALL_H = 3.4;              // partition walls are cut to waist height so the camera sees over them
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

  // ── plaza: Kenney floor slabs, two back walls with windows, props from the server's map ──
  (async () => {
    const cols = MW / 2, rows = MH / 2;                       // one floor slab covers 2×2 cells
    const slabs = await Promise.all(Array.from({ length: cols * rows }, () => furniture(base, 'floorFull')));
    if (dead) return;
    slabs.forEach((s, i) => { s.position.set((i % cols) * 10 + 5, -0.5, Math.floor(i / cols) * 10 + 5); s.traverse((o) => { o.receiveShadow = true; }); scene.add(s); });
    for (let i = 0; i < cols; i++) {                          // back wall along the top edge
      const back = await furniture(base, i % 2 ? 'wallWindow' : 'wall');
      back.position.set(i * 10 + 5, 0, -0.35);
      scene.add(back);
    }
    for (let i = 0; i < rows; i++) {                          // and along the left edge
      const left = await furniture(base, i % 2 ? 'wall' : 'wallWindow');
      left.rotation.y = Math.PI / 2;
      left.position.set(-0.35, 0, i * 10 + 5);
      scene.add(left);
    }
    if (dead) return;
    for (const z of world.zones || []) {                      // each zone gets its own floor tint and its name painted on the floor
      const look = zoneLook(z);
      const tint = new THREE.Mesh(new THREE.PlaneGeometry((z.x1 - z.x0) * CELL, (z.y1 - z.y0) * CELL),
        new THREE.MeshStandardMaterial({ color: look.color, transparent: true, opacity: look.opacity, depthWrite: false }));
      tint.rotation.x = -Math.PI / 2;
      tint.position.copy(toWorld((z.x0 + z.x1) / 2, (z.y0 + z.y1) / 2, 0.02));
      tint.receiveShadow = true;
      scene.add(tint);
      const label = floorLabel(z.name, look.ink);
      label.scale.setScalar(Math.min(1, Math.min(z.x1 - z.x0, z.y1 - z.y0) * CELL * 1.3 / 32));   // narrow corridors get a smaller name
      label.position.copy(toWorld((z.x0 + z.x1) / 2, (z.y0 + z.y1) / 2, 0.025));
      scene.add(label);
    }
    for (const piece of world.walls || []) {                  // low partition walls: Kenney half walls cut down to waist height
      const g = await furniture(base, 'wallHalf');
      g.scale.set(CELL / g.userData.size.x, LOW_WALL_H / g.userData.size.y, 1);
      if (piece.o === 'v') { g.rotation.y = Math.PI / 2; g.position.copy(toWorld(piece.f, piece.t + 0.5)); }
      else g.position.copy(toWorld(piece.t + 0.5, piece.f));
      scene.add(g);
    }
    for (const d of world.decor) {
      const g = await furniture(base, d.model);
      if (dead) return;
      g.position.copy(toWorld(d.x + 1, d.y + 1, 0.03));
      scene.add(g);
    }
    for (const p of world.props) {
      const g = await furniture(base, p.model);
      if (dead) return;
      const sz = g.userData.size;
      const [lx, lz] = p.rot % 2 ? [p.d, p.w] : [p.w, p.d];      // cells available along the model's own x / z (before turning)
      g.scale.set(Math.min(1, (lx + 0.12) * CELL / sz.x), 1, Math.min(1, (lz + 0.12) * CELL / sz.z));
      g.rotation.y = p.rot * Math.PI / 2;
      g.position.copy(toWorld(p.x + p.w / 2, p.y + p.d / 2));     // p.w / p.d are already the turned footprint
      scene.add(g);
    }
  })();

  // ── jail (fenced corner) and the rescue pad ──
  if (world.jail) {
    const J = world.jail, metal = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5, metalness: 0.4 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry((MW - J.x) * CELL, J.y * CELL), new THREE.MeshStandardMaterial({ color: 0x94a3b8, transparent: true, opacity: 0.55 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.copy(toWorld((MW + J.x) / 2, J.y / 2, 0.04));
    floor.receiveShadow = true;
    scene.add(floor);
    const post = (x, y) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.35, 5.5, 0.35), metal); m.position.copy(toWorld(x, y, 2.75)); m.castShadow = true; scene.add(m); };
    for (let y = 0; y <= J.y + 1e-6; y += 0.5) post(J.x, y);
    for (let x = J.x + 0.5; x <= MW + 1e-6; x += 0.5) post(x, J.y);
    for (const h of [0.6, 5.2]) {
      const a = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, J.y * CELL), metal); a.position.copy(toWorld(J.x, J.y / 2, h)); scene.add(a);
      const b = new THREE.Mesh(new THREE.BoxGeometry((MW - J.x) * CELL, 0.3, 0.3), metal); b.position.copy(toWorld((MW + J.x) / 2, J.y, h)); scene.add(b);
    }
  }
  let padRing = null;
  if (world.pad) {
    const P = world.pad;
    padRing = new THREE.Mesh(new THREE.RingGeometry(P.r * CELL - 0.7, P.r * CELL, 48), new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.9, side: THREE.DoubleSide }));
    padRing.rotation.x = -Math.PI / 2;
    padRing.position.copy(toWorld(P.cx, P.cy, 0.08));
    const disc = new THREE.Mesh(new THREE.CircleGeometry(P.r * CELL - 0.7, 48), new THREE.MeshBasicMaterial({ color: 0xfde68a, transparent: true, opacity: 0.45 }));
    disc.rotation.x = -Math.PI / 2;
    disc.position.copy(toWorld(P.cx, P.cy, 0.07));
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
    m.position.copy(toWorld(s.cx, s.cy, 0.6));
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
  function dressFor(rec, team) {
    if (!rec.actor || rec.team === team) return;
    rec.team = team;
    const head = rec.actor.root.getObjectByName('head');
    if (rec.hat) { rec.hat.parent.remove(rec.hat); rec.hat = null; }
    if (team && head) { rec.hat = teamHat(team); head.add(rec.hat); }
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
      if (p.id === meId) {                                     // my own position is driven locally; adopt it at first and whenever the server moves me
        if (!me || p.tp !== me.tp) { me = { ...(me || {}), x: p.x, y: p.y, dir: p.dir, tp: p.tp }; }
        me.speed = p.speed; me.frozen = p.frozen; me.jailed = p.jailed; me.dashLeft = p.dash;
        return;
      }
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
  let dashUntil = 0, dashReady = 0, dashCb = null;
  function onKeyDown(e) {
    const k = e.key.toLowerCase();
    if (k === ' ' && !e.target.closest('input, textarea, button') && me) {
      e.preventDefault();
      const now = performance.now() / 1000;
      if (now >= dashReady && !(me.frozen > 0) && !me.jailed) {
        dashUntil = now + world.dash.seconds;
        dashReady = now + world.dash.cooldown;
        if (dashCb) dashCb();
      }
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
      const others = [...people.entries()].filter(([id]) => id !== meId).map(([, r]) => r);
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
    m.position.copy(toWorld(x, y, 0.15));
    m.userData.life = 0;
    scene.add(m);
    bursts.push(m);
  }
  const puffs = [];
  function puff(x, y) {
    const m = new THREE.Mesh(puffGeo, new THREE.MeshBasicMaterial({ color: 0xf5f1e8, transparent: true, opacity: 0.85, depthWrite: false }));
    m.position.copy(toWorld(x + (Math.random() - 0.5) * 0.25, y + (Math.random() - 0.5) * 0.25, 0.35));
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
      if (!rec.actor) continue;
      v.copy(rec.actor.root.position).setY(6.2).project(camera);
      out[id] = { x: (v.x + 1) / 2 * container.clientWidth, y: (1 - v.y) / 2 * container.clientHeight, name: rec.name, me: id === meId,
        online: rec.online !== false, team: rec.team, jailed: rec.jailed };
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
      const ahead = mine ? 0 : Math.min(0.12, performance.now() / 1000 - (rec.sampleAt || 0));
      const tx = mine ? me.x : rec.x + (rec.vx || 0) * ahead, ty = mine ? me.y : rec.y + (rec.vy || 0) * ahead;
      const target = toWorld(tx, ty);
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
      a.pose((mine ? myMoving : rec.moving) || dashing ? 'walk' : 'idle');
      if (a.mixer) a.mixer.timeScale = dashing ? 1.8 : 1;
      a.update(dt);
    }
    checkTags();
    stepPuffs(dt);
    if (me) focus.lerp(toWorld(me.x, me.y), Math.min(1, dt * 5));
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
      if (id === meId || !rec.actor || rec.team !== 'thief' || rec.jailed || rec.safe > 0) continue;
      const p = rec.actor.root.position;
      if (Math.hypot(p.x / CELL - me.x, p.z / CELL - me.y) > world.catch + 0.05 || now - (rec.tagAt || 0) < 0.25) continue;
      rec.tagAt = now;
      if (moveCb) { sinceSend = 0; moveCb({ x: +me.x.toFixed(3), y: +me.y.toFixed(3), dir: +me.dir.toFixed(3), moving: true }); }   // my latest spot first
      tagCb(id);
    }
  }

  function dispose() {
    dead = true;
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
    dashState() { const now = performance.now() / 1000; return { ready: Math.max(0, dashReady - now), active: now < dashUntil }; },
    onFrame(cb) { frameCb = cb; },
  };
}
