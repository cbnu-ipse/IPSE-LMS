// Animated people (Kenney Mini Characters). Purely visual; where they stand comes from the page / server.
import * as THREE from 'three';
import { character } from './assets.js';

const HEIGHT = 4.6;          // world units; a stove is 4.5 tall (these are big-headed chibi figures)

export class Actor {
  static async create(base, model, opts = {}) {
    const { scene, animations } = await character(base, model);
    const actor = new Actor(scene, animations, opts);
    if (opts.wheelchair) {                    // Kenney wheelchair under the character; the 'wheelchair-*' clips seat them in it
      const chair = await character(base, 'wheelchair');
      chair.scene.scale.copy(scene.scale);
      actor.root.add(chair.scene);
      actor.wheel = true;
      actor.play('wheelchair-sit');
    }
    if (opts.cane) {                          // a cane in the right hand
      const cane = await character(base, 'aid-cane');
      const arm = scene.getObjectByName('arm-right');
      if (arm) { cane.scene.position.set(-0.05, -0.18, 0.06); arm.add(cane.scene); }
    }
    return actor;
  }

  // Pick the clip for what the actor is doing right now (wheelchair users have their own set).
  pose(kind) {
    if (this.wheel) return this.play(kind === 'walk' ? 'wheelchair-move-forward' : 'wheelchair-sit');
    this.play({ walk: 'walk', sit: 'sit', work: 'interact-right', idle: 'idle', happy: 'emote-yes', angry: 'emote-no' }[kind] || 'idle');
  }

  constructor(scene, animations, { hat = false, apron = null } = {}) {
    this.root = new THREE.Group();
    const box = new THREE.Box3().setFromObject(scene);
    const s = HEIGHT / Math.max(0.01, box.max.y - box.min.y);
    scene.scale.setScalar(s);
    scene.position.y = -box.min.y * s;
    this.root.add(scene);
    this.mixer = new THREE.AnimationMixer(scene);
    this.actions = {};
    animations.forEach((clip) => { this.actions[clip.name] = this.mixer.clipAction(clip); });
    this.current = null;
    this.path = null;
    this.onArrive = null;
    this.yOffset = 0;
    if (hat) {
      const head = scene.getObjectByName('head');
      const white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 });
      const g = new THREE.Group();
      // model units: the head bone sits 0.32 below the top of the head, which is ~0.23 wide
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.2, 0.07, 24), white);
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.21, 24, 16), white);
      puff.scale.y = 0.72; puff.position.y = 0.1;
      g.add(band, puff);
      g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
      g.position.set(0, 0.31, 0.01);
      (head || scene).add(g);
    }
    if (apron) {
      const torso = scene.getObjectByName('torso');
      const a = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.15), new THREE.MeshStandardMaterial({ color: apron, roughness: 0.9, side: THREE.DoubleSide }));
      a.position.set(0, 0.03, 0.115);
      (torso || scene).add(a);
    }
    this.play('idle');
  }

  play(name, { once = false, fade = 0.2 } = {}) {
    const next = this.actions[name];
    if (!next || this.current === next) return;
    next.reset();
    next.setLoop(once ? THREE.LoopOnce : THREE.LoopRepeat, Infinity);
    next.clampWhenFinished = once;
    next.fadeIn(fade).play();
    if (this.current) this.current.fadeOut(fade);
    this.current = next;
  }

  // Walk through world points at `speed` units/s, then call done().
  walk(points, speed, done) {
    this.path = points.map((p) => p.clone());
    this.speed = speed;
    this.onArrive = done || null;
    if (this.path.length) this.play('walk');
  }

  face(target) {
    const dx = target.x - this.root.position.x, dz = target.z - this.root.position.z;
    if (Math.hypot(dx, dz) > 0.01) this.root.rotation.y = Math.atan2(dx, dz);
  }

  update(dt) {
    this.mixer.update(dt);
    if (!this.path) return;
    let left = this.speed * dt;
    while (left > 0 && this.path.length) {
      const target = this.path[0];
      const pos = this.root.position;
      const d = Math.hypot(target.x - pos.x, target.z - pos.z);
      this.face(target);
      if (d <= left) { pos.x = target.x; pos.z = target.z; this.path.shift(); left -= d; }
      else { pos.x += (target.x - pos.x) / d * left; pos.z += (target.z - pos.z) / d * left; left = 0; }
    }
    if (!this.path.length) {
      this.path = null;
      this.play('idle');
      const cb = this.onArrive; this.onArrive = null;
      if (cb) cb();
    }
  }
}
