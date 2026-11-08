/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */
const ta = "169";
const xa = "attached", vc = "detached";
const Hn = "", At = "srgb", Bt = "srgb-linear", na = "display-p3", tr = "display-p3-linear", Zs = "linear", yt = "srgb", $s = "rec709", Js = "p3";
const va = "300 es";
class ri {
  addEventListener(e, t) {
    this._listeners === void 0 && (this._listeners = {});
    const n = this._listeners;
    n[e] === void 0 && (n[e] = []), n[e].indexOf(t) === -1 && n[e].push(t);
  }
  hasEventListener(e, t) {
    if (this._listeners === void 0) return !1;
    const n = this._listeners;
    return n[e] !== void 0 && n[e].indexOf(t) !== -1;
  }
  removeEventListener(e, t) {
    if (this._listeners === void 0) return;
    const i = this._listeners[e];
    if (i !== void 0) {
      const r = i.indexOf(t);
      r !== -1 && i.splice(r, 1);
    }
  }
  dispatchEvent(e) {
    if (this._listeners === void 0) return;
    const n = this._listeners[e.type];
    if (n !== void 0) {
      e.target = this;
      const i = n.slice(0);
      for (let r = 0, a = i.length; r < a; r++)
        i[r].call(this, e);
      e.target = null;
    }
  }
}
const Gt = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "0a", "0b", "0c", "0d", "0e", "0f", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "1a", "1b", "1c", "1d", "1e", "1f", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "2a", "2b", "2c", "2d", "2e", "2f", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "3a", "3b", "3c", "3d", "3e", "3f", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "4a", "4b", "4c", "4d", "4e", "4f", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "5a", "5b", "5c", "5d", "5e", "5f", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "6a", "6b", "6c", "6d", "6e", "6f", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "7a", "7b", "7c", "7d", "7e", "7f", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "8a", "8b", "8c", "8d", "8e", "8f", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "9a", "9b", "9c", "9d", "9e", "9f", "a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "aa", "ab", "ac", "ad", "ae", "af", "b0", "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9", "ba", "bb", "bc", "bd", "be", "bf", "c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "ca", "cb", "cc", "cd", "ce", "cf", "d0", "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "da", "db", "dc", "dd", "de", "df", "e0", "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9", "ea", "eb", "ec", "ed", "ee", "ef", "f0", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "fa", "fb", "fc", "fd", "fe", "ff"];
let Ma = 1234567;
const Ci = Math.PI / 180, Ui = 180 / Math.PI;
function gn() {
  const s = Math.random() * 4294967295 | 0, e = Math.random() * 4294967295 | 0, t = Math.random() * 4294967295 | 0, n = Math.random() * 4294967295 | 0;
  return (Gt[s & 255] + Gt[s >> 8 & 255] + Gt[s >> 16 & 255] + Gt[s >> 24 & 255] + "-" + Gt[e & 255] + Gt[e >> 8 & 255] + "-" + Gt[e >> 16 & 15 | 64] + Gt[e >> 24 & 255] + "-" + Gt[t & 63 | 128] + Gt[t >> 8 & 255] + "-" + Gt[t >> 16 & 255] + Gt[t >> 24 & 255] + Gt[n & 255] + Gt[n >> 8 & 255] + Gt[n >> 16 & 255] + Gt[n >> 24 & 255]).toLowerCase();
}
function Vt(s, e, t) {
  return Math.max(e, Math.min(t, s));
}
function ia(s, e) {
  return (s % e + e) % e;
}
function Mc(s, e, t, n, i) {
  return n + (s - e) * (i - n) / (t - e);
}
function yc(s, e, t) {
  return s !== e ? (t - s) / (e - s) : 0;
}
function os(s, e, t) {
  return (1 - t) * s + t * e;
}
function Sc(s, e, t, n) {
  return os(s, e, 1 - Math.exp(-t * n));
}
function Ec(s, e = 1) {
  return e - Math.abs(ia(s, e * 2) - e);
}
function Tc(s, e, t) {
  return s <= e ? 0 : s >= t ? 1 : (s = (s - e) / (t - e), s * s * (3 - 2 * s));
}
function Ac(s, e, t) {
  return s <= e ? 0 : s >= t ? 1 : (s = (s - e) / (t - e), s * s * s * (s * (s * 6 - 15) + 10));
}
function bc(s, e) {
  return s + Math.floor(Math.random() * (e - s + 1));
}
function wc(s, e) {
  return s + Math.random() * (e - s);
}
function Rc(s) {
  return s * (0.5 - Math.random());
}
function Cc(s) {
  s !== void 0 && (Ma = s);
  let e = Ma += 1831565813;
  return e = Math.imul(e ^ e >>> 15, e | 1), e ^= e + Math.imul(e ^ e >>> 7, e | 61), ((e ^ e >>> 14) >>> 0) / 4294967296;
}
function Ic(s) {
  return s * Ci;
}
function Pc(s) {
  return s * Ui;
}
function Lc(s) {
  return (s & s - 1) === 0 && s !== 0;
}
function Dc(s) {
  return Math.pow(2, Math.ceil(Math.log(s) / Math.LN2));
}
function Uc(s) {
  return Math.pow(2, Math.floor(Math.log(s) / Math.LN2));
}
function Nc(s, e, t, n, i) {
  const r = Math.cos, a = Math.sin, o = r(t / 2), c = a(t / 2), l = r((e + n) / 2), h = a((e + n) / 2), u = r((e - n) / 2), d = a((e - n) / 2), f = r((n - e) / 2), g = a((n - e) / 2);
  switch (i) {
    case "XYX":
      s.set(o * h, c * u, c * d, o * l);
      break;
    case "YZY":
      s.set(c * d, o * h, c * u, o * l);
      break;
    case "ZXZ":
      s.set(c * u, c * d, o * h, o * l);
      break;
    case "XZX":
      s.set(o * h, c * g, c * f, o * l);
      break;
    case "YXY":
      s.set(c * f, o * h, c * g, o * l);
      break;
    case "ZYZ":
      s.set(c * g, c * f, o * h, o * l);
      break;
    default:
      console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: " + i);
  }
}
function mn(s, e) {
  switch (e.constructor) {
    case Float32Array:
      return s;
    case Uint32Array:
      return s / 4294967295;
    case Uint16Array:
      return s / 65535;
    case Uint8Array:
      return s / 255;
    case Int32Array:
      return Math.max(s / 2147483647, -1);
    case Int16Array:
      return Math.max(s / 32767, -1);
    case Int8Array:
      return Math.max(s / 127, -1);
    default:
      throw new Error("Invalid component type.");
  }
}
function mt(s, e) {
  switch (e.constructor) {
    case Float32Array:
      return s;
    case Uint32Array:
      return Math.round(s * 4294967295);
    case Uint16Array:
      return Math.round(s * 65535);
    case Uint8Array:
      return Math.round(s * 255);
    case Int32Array:
      return Math.round(s * 2147483647);
    case Int16Array:
      return Math.round(s * 32767);
    case Int8Array:
      return Math.round(s * 127);
    default:
      throw new Error("Invalid component type.");
  }
}
const Fc = {
  DEG2RAD: Ci,
  RAD2DEG: Ui,
  generateUUID: gn,
  clamp: Vt,
  euclideanModulo: ia,
  mapLinear: Mc,
  inverseLerp: yc,
  lerp: os,
  damp: Sc,
  pingpong: Ec,
  smoothstep: Tc,
  smootherstep: Ac,
  randInt: bc,
  randFloat: wc,
  randFloatSpread: Rc,
  seededRandom: Cc,
  degToRad: Ic,
  radToDeg: Pc,
  isPowerOfTwo: Lc,
  ceilPowerOfTwo: Dc,
  floorPowerOfTwo: Uc,
  setQuaternionFromProperEuler: Nc,
  normalize: mt,
  denormalize: mn
};
class Xe {
  constructor(e = 0, t = 0) {
    Xe.prototype.isVector2 = !0, this.x = e, this.y = t;
  }
  get width() {
    return this.x;
  }
  set width(e) {
    this.x = e;
  }
  get height() {
    return this.y;
  }
  set height(e) {
    this.y = e;
  }
  set(e, t) {
    return this.x = e, this.y = t, this;
  }
  setScalar(e) {
    return this.x = e, this.y = e, this;
  }
  setX(e) {
    return this.x = e, this;
  }
  setY(e) {
    return this.y = e, this;
  }
  setComponent(e, t) {
    switch (e) {
      case 0:
        this.x = t;
        break;
      case 1:
        this.y = t;
        break;
      default:
        throw new Error("index is out of range: " + e);
    }
    return this;
  }
  getComponent(e) {
    switch (e) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      default:
        throw new Error("index is out of range: " + e);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y);
  }
  copy(e) {
    return this.x = e.x, this.y = e.y, this;
  }
  add(e) {
    return this.x += e.x, this.y += e.y, this;
  }
  addScalar(e) {
    return this.x += e, this.y += e, this;
  }
  addVectors(e, t) {
    return this.x = e.x + t.x, this.y = e.y + t.y, this;
  }
  addScaledVector(e, t) {
    return this.x += e.x * t, this.y += e.y * t, this;
  }
  sub(e) {
    return this.x -= e.x, this.y -= e.y, this;
  }
  subScalar(e) {
    return this.x -= e, this.y -= e, this;
  }
  subVectors(e, t) {
    return this.x = e.x - t.x, this.y = e.y - t.y, this;
  }
  multiply(e) {
    return this.x *= e.x, this.y *= e.y, this;
  }
  multiplyScalar(e) {
    return this.x *= e, this.y *= e, this;
  }
  divide(e) {
    return this.x /= e.x, this.y /= e.y, this;
  }
  divideScalar(e) {
    return this.multiplyScalar(1 / e);
  }
  applyMatrix3(e) {
    const t = this.x, n = this.y, i = e.elements;
    return this.x = i[0] * t + i[3] * n + i[6], this.y = i[1] * t + i[4] * n + i[7], this;
  }
  min(e) {
    return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this;
  }
  max(e) {
    return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this;
  }
  clamp(e, t) {
    return this.x = Math.max(e.x, Math.min(t.x, this.x)), this.y = Math.max(e.y, Math.min(t.y, this.y)), this;
  }
  clampScalar(e, t) {
    return this.x = Math.max(e, Math.min(t, this.x)), this.y = Math.max(e, Math.min(t, this.y)), this;
  }
  clampLength(e, t) {
    const n = this.length();
    return this.divideScalar(n || 1).multiplyScalar(Math.max(e, Math.min(t, n)));
  }
  floor() {
    return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this;
  }
  ceil() {
    return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this;
  }
  round() {
    return this.x = Math.round(this.x), this.y = Math.round(this.y), this;
  }
  roundToZero() {
    return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this;
  }
  negate() {
    return this.x = -this.x, this.y = -this.y, this;
  }
  dot(e) {
    return this.x * e.x + this.y * e.y;
  }
  cross(e) {
    return this.x * e.y - this.y * e.x;
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  angle() {
    return Math.atan2(-this.y, -this.x) + Math.PI;
  }
  angleTo(e) {
    const t = Math.sqrt(this.lengthSq() * e.lengthSq());
    if (t === 0) return Math.PI / 2;
    const n = this.dot(e) / t;
    return Math.acos(Vt(n, -1, 1));
  }
  distanceTo(e) {
    return Math.sqrt(this.distanceToSquared(e));
  }
  distanceToSquared(e) {
    const t = this.x - e.x, n = this.y - e.y;
    return t * t + n * n;
  }
  manhattanDistanceTo(e) {
    return Math.abs(this.x - e.x) + Math.abs(this.y - e.y);
  }
  setLength(e) {
    return this.normalize().multiplyScalar(e);
  }
  lerp(e, t) {
    return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this;
  }
  lerpVectors(e, t, n) {
    return this.x = e.x + (t.x - e.x) * n, this.y = e.y + (t.y - e.y) * n, this;
  }
  equals(e) {
    return e.x === this.x && e.y === this.y;
  }
  fromArray(e, t = 0) {
    return this.x = e[t], this.y = e[t + 1], this;
  }
  toArray(e = [], t = 0) {
    return e[t] = this.x, e[t + 1] = this.y, e;
  }
  fromBufferAttribute(e, t) {
    return this.x = e.getX(t), this.y = e.getY(t), this;
  }
  rotateAround(e, t) {
    const n = Math.cos(t), i = Math.sin(t), r = this.x - e.x, a = this.y - e.y;
    return this.x = r * n - a * i + e.x, this.y = r * i + a * n + e.y, this;
  }
  random() {
    return this.x = Math.random(), this.y = Math.random(), this;
  }
  *[Symbol.iterator]() {
    yield this.x, yield this.y;
  }
}
class $e {
  constructor(e, t, n, i, r, a, o, c, l) {
    $e.prototype.isMatrix3 = !0, this.elements = [
      1,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      1
    ], e !== void 0 && this.set(e, t, n, i, r, a, o, c, l);
  }
  set(e, t, n, i, r, a, o, c, l) {
    const h = this.elements;
    return h[0] = e, h[1] = i, h[2] = o, h[3] = t, h[4] = r, h[5] = c, h[6] = n, h[7] = a, h[8] = l, this;
  }
  identity() {
    return this.set(
      1,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      1
    ), this;
  }
  copy(e) {
    const t = this.elements, n = e.elements;
    return t[0] = n[0], t[1] = n[1], t[2] = n[2], t[3] = n[3], t[4] = n[4], t[5] = n[5], t[6] = n[6], t[7] = n[7], t[8] = n[8], this;
  }
  extractBasis(e, t, n) {
    return e.setFromMatrix3Column(this, 0), t.setFromMatrix3Column(this, 1), n.setFromMatrix3Column(this, 2), this;
  }
  setFromMatrix4(e) {
    const t = e.elements;
    return this.set(
      t[0],
      t[4],
      t[8],
      t[1],
      t[5],
      t[9],
      t[2],
      t[6],
      t[10]
    ), this;
  }
  multiply(e) {
    return this.multiplyMatrices(this, e);
  }
  premultiply(e) {
    return this.multiplyMatrices(e, this);
  }
  multiplyMatrices(e, t) {
    const n = e.elements, i = t.elements, r = this.elements, a = n[0], o = n[3], c = n[6], l = n[1], h = n[4], u = n[7], d = n[2], f = n[5], g = n[8], _ = i[0], m = i[3], p = i[6], E = i[1], y = i[4], A = i[7], O = i[2], w = i[5], R = i[8];
    return r[0] = a * _ + o * E + c * O, r[3] = a * m + o * y + c * w, r[6] = a * p + o * A + c * R, r[1] = l * _ + h * E + u * O, r[4] = l * m + h * y + u * w, r[7] = l * p + h * A + u * R, r[2] = d * _ + f * E + g * O, r[5] = d * m + f * y + g * w, r[8] = d * p + f * A + g * R, this;
  }
  multiplyScalar(e) {
    const t = this.elements;
    return t[0] *= e, t[3] *= e, t[6] *= e, t[1] *= e, t[4] *= e, t[7] *= e, t[2] *= e, t[5] *= e, t[8] *= e, this;
  }
  determinant() {
    const e = this.elements, t = e[0], n = e[1], i = e[2], r = e[3], a = e[4], o = e[5], c = e[6], l = e[7], h = e[8];
    return t * a * h - t * o * l - n * r * h + n * o * c + i * r * l - i * a * c;
  }
  invert() {
    const e = this.elements, t = e[0], n = e[1], i = e[2], r = e[3], a = e[4], o = e[5], c = e[6], l = e[7], h = e[8], u = h * a - o * l, d = o * c - h * r, f = l * r - a * c, g = t * u + n * d + i * f;
    if (g === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
    const _ = 1 / g;
    return e[0] = u * _, e[1] = (i * l - h * n) * _, e[2] = (o * n - i * a) * _, e[3] = d * _, e[4] = (h * t - i * c) * _, e[5] = (i * r - o * t) * _, e[6] = f * _, e[7] = (n * c - l * t) * _, e[8] = (a * t - n * r) * _, this;
  }
  transpose() {
    let e;
    const t = this.elements;
    return e = t[1], t[1] = t[3], t[3] = e, e = t[2], t[2] = t[6], t[6] = e, e = t[5], t[5] = t[7], t[7] = e, this;
  }
  getNormalMatrix(e) {
    return this.setFromMatrix4(e).invert().transpose();
  }
  transposeIntoArray(e) {
    const t = this.elements;
    return e[0] = t[0], e[1] = t[3], e[2] = t[6], e[3] = t[1], e[4] = t[4], e[5] = t[7], e[6] = t[2], e[7] = t[5], e[8] = t[8], this;
  }
  setUvTransform(e, t, n, i, r, a, o) {
    const c = Math.cos(r), l = Math.sin(r);
    return this.set(
      n * c,
      n * l,
      -n * (c * a + l * o) + a + e,
      -i * l,
      i * c,
      -i * (-l * a + c * o) + o + t,
      0,
      0,
      1
    ), this;
  }
  //
  scale(e, t) {
    return this.premultiply(cr.makeScale(e, t)), this;
  }
  rotate(e) {
    return this.premultiply(cr.makeRotation(-e)), this;
  }
  translate(e, t) {
    return this.premultiply(cr.makeTranslation(e, t)), this;
  }
  // for 2D Transforms
  makeTranslation(e, t) {
    return e.isVector2 ? this.set(
      1,
      0,
      e.x,
      0,
      1,
      e.y,
      0,
      0,
      1
    ) : this.set(
      1,
      0,
      e,
      0,
      1,
      t,
      0,
      0,
      1
    ), this;
  }
  makeRotation(e) {
    const t = Math.cos(e), n = Math.sin(e);
    return this.set(
      t,
      -n,
      0,
      n,
      t,
      0,
      0,
      0,
      1
    ), this;
  }
  makeScale(e, t) {
    return this.set(
      e,
      0,
      0,
      0,
      t,
      0,
      0,
      0,
      1
    ), this;
  }
  //
  equals(e) {
    const t = this.elements, n = e.elements;
    for (let i = 0; i < 9; i++)
      if (t[i] !== n[i]) return !1;
    return !0;
  }
  fromArray(e, t = 0) {
    for (let n = 0; n < 9; n++)
      this.elements[n] = e[n + t];
    return this;
  }
  toArray(e = [], t = 0) {
    const n = this.elements;
    return e[t] = n[0], e[t + 1] = n[1], e[t + 2] = n[2], e[t + 3] = n[3], e[t + 4] = n[4], e[t + 5] = n[5], e[t + 6] = n[6], e[t + 7] = n[7], e[t + 8] = n[8], e;
  }
  clone() {
    return new this.constructor().fromArray(this.elements);
  }
}
const cr = /* @__PURE__ */ new $e();
function zo(s) {
  for (let e = s.length - 1; e >= 0; --e)
    if (s[e] >= 65535) return !0;
  return !1;
}
function cs(s) {
  return document.createElementNS("http://www.w3.org/1999/xhtml", s);
}
function Bc() {
  const s = cs("canvas");
  return s.style.display = "block", s;
}
const ya = {};
function js(s) {
  s in ya || (ya[s] = !0, console.warn(s));
}
function Oc(s, e, t) {
  return new Promise(function(n, i) {
    function r() {
      switch (s.clientWaitSync(e, s.SYNC_FLUSH_COMMANDS_BIT, 0)) {
        case s.WAIT_FAILED:
          i();
          break;
        case s.TIMEOUT_EXPIRED:
          setTimeout(r, t);
          break;
        default:
          n();
      }
    }
    setTimeout(r, t);
  });
}
function kc(s) {
  const e = s.elements;
  e[2] = 0.5 * e[2] + 0.5 * e[3], e[6] = 0.5 * e[6] + 0.5 * e[7], e[10] = 0.5 * e[10] + 0.5 * e[11], e[14] = 0.5 * e[14] + 0.5 * e[15];
}
function zc(s) {
  const e = s.elements;
  e[11] === -1 ? (e[10] = -e[10] - 1, e[14] = -e[14]) : (e[10] = -e[10], e[14] = -e[14] + 1);
}
const Sa = /* @__PURE__ */ new $e().set(
  0.8224621,
  0.177538,
  0,
  0.0331941,
  0.9668058,
  0,
  0.0170827,
  0.0723974,
  0.9105199
), Ea = /* @__PURE__ */ new $e().set(
  1.2249401,
  -0.2249404,
  0,
  -0.0420569,
  1.0420571,
  0,
  -0.0196376,
  -0.0786361,
  1.0982735
), Ki = {
  [Bt]: {
    transfer: Zs,
    primaries: $s,
    luminanceCoefficients: [0.2126, 0.7152, 0.0722],
    toReference: (s) => s,
    fromReference: (s) => s
  },
  [At]: {
    transfer: yt,
    primaries: $s,
    luminanceCoefficients: [0.2126, 0.7152, 0.0722],
    toReference: (s) => s.convertSRGBToLinear(),
    fromReference: (s) => s.convertLinearToSRGB()
  },
  [tr]: {
    transfer: Zs,
    primaries: Js,
    luminanceCoefficients: [0.2289, 0.6917, 0.0793],
    toReference: (s) => s.applyMatrix3(Ea),
    fromReference: (s) => s.applyMatrix3(Sa)
  },
  [na]: {
    transfer: yt,
    primaries: Js,
    luminanceCoefficients: [0.2289, 0.6917, 0.0793],
    toReference: (s) => s.convertSRGBToLinear().applyMatrix3(Ea),
    fromReference: (s) => s.applyMatrix3(Sa).convertLinearToSRGB()
  }
}, Gc = /* @__PURE__ */ new Set([Bt, tr]), it = {
  enabled: !0,
  _workingColorSpace: Bt,
  get workingColorSpace() {
    return this._workingColorSpace;
  },
  set workingColorSpace(s) {
    if (!Gc.has(s))
      throw new Error(`Unsupported working color space, "${s}".`);
    this._workingColorSpace = s;
  },
  convert: function(s, e, t) {
    if (this.enabled === !1 || e === t || !e || !t)
      return s;
    const n = Ki[e].toReference, i = Ki[t].fromReference;
    return i(n(s));
  },
  fromWorkingColorSpace: function(s, e) {
    return this.convert(s, this._workingColorSpace, e);
  },
  toWorkingColorSpace: function(s, e) {
    return this.convert(s, e, this._workingColorSpace);
  },
  getPrimaries: function(s) {
    return Ki[s].primaries;
  },
  getTransfer: function(s) {
    return s === Hn ? Zs : Ki[s].transfer;
  },
  getLuminanceCoefficients: function(s, e = this._workingColorSpace) {
    return s.fromArray(Ki[e].luminanceCoefficients);
  }
};
function Ii(s) {
  return s < 0.04045 ? s * 0.0773993808 : Math.pow(s * 0.9478672986 + 0.0521327014, 2.4);
}
function lr(s) {
  return s < 31308e-7 ? s * 12.92 : 1.055 * Math.pow(s, 0.41666) - 0.055;
}
let di;
class Hc {
  static getDataURL(e) {
    if (/^data:/i.test(e.src) || typeof HTMLCanvasElement > "u")
      return e.src;
    let t;
    if (e instanceof HTMLCanvasElement)
      t = e;
    else {
      di === void 0 && (di = cs("canvas")), di.width = e.width, di.height = e.height;
      const n = di.getContext("2d");
      e instanceof ImageData ? n.putImageData(e, 0, 0) : n.drawImage(e, 0, 0, e.width, e.height), t = di;
    }
    return t.width > 2048 || t.height > 2048 ? (console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons", e), t.toDataURL("image/jpeg", 0.6)) : t.toDataURL("image/png");
  }
  static sRGBToLinear(e) {
    if (typeof HTMLImageElement < "u" && e instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && e instanceof ImageBitmap) {
      const t = cs("canvas");
      t.width = e.width, t.height = e.height;
      const n = t.getContext("2d");
      n.drawImage(e, 0, 0, e.width, e.height);
      const i = n.getImageData(0, 0, e.width, e.height), r = i.data;
      for (let a = 0; a < r.length; a++)
        r[a] = Ii(r[a] / 255) * 255;
      return n.putImageData(i, 0, 0), t;
    } else if (e.data) {
      const t = e.data.slice(0);
      for (let n = 0; n < t.length; n++)
        t instanceof Uint8Array || t instanceof Uint8ClampedArray ? t[n] = Math.floor(Ii(t[n] / 255) * 255) : t[n] = Ii(t[n]);
      return {
        data: t,
        width: e.width,
        height: e.height
      };
    } else
      return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."), e;
  }
}
let Vc = 0;
class Go {
  constructor(e = null) {
    this.isSource = !0, Object.defineProperty(this, "id", { value: Vc++ }), this.uuid = gn(), this.data = e, this.dataReady = !0, this.version = 0;
  }
  set needsUpdate(e) {
    e === !0 && this.version++;
  }
  toJSON(e) {
    const t = e === void 0 || typeof e == "string";
    if (!t && e.images[this.uuid] !== void 0)
      return e.images[this.uuid];
    const n = {
      uuid: this.uuid,
      url: ""
    }, i = this.data;
    if (i !== null) {
      let r;
      if (Array.isArray(i)) {
        r = [];
        for (let a = 0, o = i.length; a < o; a++)
          i[a].isDataTexture ? r.push(hr(i[a].image)) : r.push(hr(i[a]));
      } else
        r = hr(i);
      n.url = r;
    }
    return t || (e.images[this.uuid] = n), n;
  }
}
function hr(s) {
  return typeof HTMLImageElement < "u" && s instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && s instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && s instanceof ImageBitmap ? Hc.getDataURL(s) : s.data ? {
    data: Array.from(s.data),
    width: s.width,
    height: s.height,
    type: s.data.constructor.name
  } : (console.warn("THREE.Texture: Unable to serialize Texture."), {});
}
let Wc = 0;
class It extends ri {
  constructor(e = It.DEFAULT_IMAGE, t = It.DEFAULT_MAPPING, n = 1001, i = 1001, r = 1006, a = 1008, o = 1023, c = 1009, l = It.DEFAULT_ANISOTROPY, h = Hn) {
    super(), this.isTexture = !0, Object.defineProperty(this, "id", { value: Wc++ }), this.uuid = gn(), this.name = "", this.source = new Go(e), this.mipmaps = [], this.mapping = t, this.channel = 0, this.wrapS = n, this.wrapT = i, this.magFilter = r, this.minFilter = a, this.anisotropy = l, this.format = o, this.internalFormat = null, this.type = c, this.offset = new Xe(0, 0), this.repeat = new Xe(1, 1), this.center = new Xe(0, 0), this.rotation = 0, this.matrixAutoUpdate = !0, this.matrix = new $e(), this.generateMipmaps = !0, this.premultiplyAlpha = !1, this.flipY = !0, this.unpackAlignment = 4, this.colorSpace = h, this.userData = {}, this.version = 0, this.onUpdate = null, this.isRenderTargetTexture = !1, this.pmremVersion = 0;
  }
  get image() {
    return this.source.data;
  }
  set image(e = null) {
    this.source.data = e;
  }
  updateMatrix() {
    this.matrix.setUvTransform(this.offset.x, this.offset.y, this.repeat.x, this.repeat.y, this.rotation, this.center.x, this.center.y);
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    return this.name = e.name, this.source = e.source, this.mipmaps = e.mipmaps.slice(0), this.mapping = e.mapping, this.channel = e.channel, this.wrapS = e.wrapS, this.wrapT = e.wrapT, this.magFilter = e.magFilter, this.minFilter = e.minFilter, this.anisotropy = e.anisotropy, this.format = e.format, this.internalFormat = e.internalFormat, this.type = e.type, this.offset.copy(e.offset), this.repeat.copy(e.repeat), this.center.copy(e.center), this.rotation = e.rotation, this.matrixAutoUpdate = e.matrixAutoUpdate, this.matrix.copy(e.matrix), this.generateMipmaps = e.generateMipmaps, this.premultiplyAlpha = e.premultiplyAlpha, this.flipY = e.flipY, this.unpackAlignment = e.unpackAlignment, this.colorSpace = e.colorSpace, this.userData = JSON.parse(JSON.stringify(e.userData)), this.needsUpdate = !0, this;
  }
  toJSON(e) {
    const t = e === void 0 || typeof e == "string";
    if (!t && e.textures[this.uuid] !== void 0)
      return e.textures[this.uuid];
    const n = {
      metadata: {
        version: 4.6,
        type: "Texture",
        generator: "Texture.toJSON"
      },
      uuid: this.uuid,
      name: this.name,
      image: this.source.toJSON(e).uuid,
      mapping: this.mapping,
      channel: this.channel,
      repeat: [this.repeat.x, this.repeat.y],
      offset: [this.offset.x, this.offset.y],
      center: [this.center.x, this.center.y],
      rotation: this.rotation,
      wrap: [this.wrapS, this.wrapT],
      format: this.format,
      internalFormat: this.internalFormat,
      type: this.type,
      colorSpace: this.colorSpace,
      minFilter: this.minFilter,
      magFilter: this.magFilter,
      anisotropy: this.anisotropy,
      flipY: this.flipY,
      generateMipmaps: this.generateMipmaps,
      premultiplyAlpha: this.premultiplyAlpha,
      unpackAlignment: this.unpackAlignment
    };
    return Object.keys(this.userData).length > 0 && (n.userData = this.userData), t || (e.textures[this.uuid] = n), n;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
  transformUv(e) {
    if (this.mapping !== 300) return e;
    if (e.applyMatrix3(this.matrix), e.x < 0 || e.x > 1)
      switch (this.wrapS) {
        case 1e3:
          e.x = e.x - Math.floor(e.x);
          break;
        case 1001:
          e.x = e.x < 0 ? 0 : 1;
          break;
        case 1002:
          Math.abs(Math.floor(e.x) % 2) === 1 ? e.x = Math.ceil(e.x) - e.x : e.x = e.x - Math.floor(e.x);
          break;
      }
    if (e.y < 0 || e.y > 1)
      switch (this.wrapT) {
        case 1e3:
          e.y = e.y - Math.floor(e.y);
          break;
        case 1001:
          e.y = e.y < 0 ? 0 : 1;
          break;
        case 1002:
          Math.abs(Math.floor(e.y) % 2) === 1 ? e.y = Math.ceil(e.y) - e.y : e.y = e.y - Math.floor(e.y);
          break;
      }
    return this.flipY && (e.y = 1 - e.y), e;
  }
  set needsUpdate(e) {
    e === !0 && (this.version++, this.source.needsUpdate = !0);
  }
  set needsPMREMUpdate(e) {
    e === !0 && this.pmremVersion++;
  }
}
It.DEFAULT_IMAGE = null;
It.DEFAULT_MAPPING = 300;
It.DEFAULT_ANISOTROPY = 1;
class ut {
  constructor(e = 0, t = 0, n = 0, i = 1) {
    ut.prototype.isVector4 = !0, this.x = e, this.y = t, this.z = n, this.w = i;
  }
  get width() {
    return this.z;
  }
  set width(e) {
    this.z = e;
  }
  get height() {
    return this.w;
  }
  set height(e) {
    this.w = e;
  }
  set(e, t, n, i) {
    return this.x = e, this.y = t, this.z = n, this.w = i, this;
  }
  setScalar(e) {
    return this.x = e, this.y = e, this.z = e, this.w = e, this;
  }
  setX(e) {
    return this.x = e, this;
  }
  setY(e) {
    return this.y = e, this;
  }
  setZ(e) {
    return this.z = e, this;
  }
  setW(e) {
    return this.w = e, this;
  }
  setComponent(e, t) {
    switch (e) {
      case 0:
        this.x = t;
        break;
      case 1:
        this.y = t;
        break;
      case 2:
        this.z = t;
        break;
      case 3:
        this.w = t;
        break;
      default:
        throw new Error("index is out of range: " + e);
    }
    return this;
  }
  getComponent(e) {
    switch (e) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      case 3:
        return this.w;
      default:
        throw new Error("index is out of range: " + e);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y, this.z, this.w);
  }
  copy(e) {
    return this.x = e.x, this.y = e.y, this.z = e.z, this.w = e.w !== void 0 ? e.w : 1, this;
  }
  add(e) {
    return this.x += e.x, this.y += e.y, this.z += e.z, this.w += e.w, this;
  }
  addScalar(e) {
    return this.x += e, this.y += e, this.z += e, this.w += e, this;
  }
  addVectors(e, t) {
    return this.x = e.x + t.x, this.y = e.y + t.y, this.z = e.z + t.z, this.w = e.w + t.w, this;
  }
  addScaledVector(e, t) {
    return this.x += e.x * t, this.y += e.y * t, this.z += e.z * t, this.w += e.w * t, this;
  }
  sub(e) {
    return this.x -= e.x, this.y -= e.y, this.z -= e.z, this.w -= e.w, this;
  }
  subScalar(e) {
    return this.x -= e, this.y -= e, this.z -= e, this.w -= e, this;
  }
  subVectors(e, t) {
    return this.x = e.x - t.x, this.y = e.y - t.y, this.z = e.z - t.z, this.w = e.w - t.w, this;
  }
  multiply(e) {
    return this.x *= e.x, this.y *= e.y, this.z *= e.z, this.w *= e.w, this;
  }
  multiplyScalar(e) {
    return this.x *= e, this.y *= e, this.z *= e, this.w *= e, this;
  }
  applyMatrix4(e) {
    const t = this.x, n = this.y, i = this.z, r = this.w, a = e.elements;
    return this.x = a[0] * t + a[4] * n + a[8] * i + a[12] * r, this.y = a[1] * t + a[5] * n + a[9] * i + a[13] * r, this.z = a[2] * t + a[6] * n + a[10] * i + a[14] * r, this.w = a[3] * t + a[7] * n + a[11] * i + a[15] * r, this;
  }
  divideScalar(e) {
    return this.multiplyScalar(1 / e);
  }
  setAxisAngleFromQuaternion(e) {
    this.w = 2 * Math.acos(e.w);
    const t = Math.sqrt(1 - e.w * e.w);
    return t < 1e-4 ? (this.x = 1, this.y = 0, this.z = 0) : (this.x = e.x / t, this.y = e.y / t, this.z = e.z / t), this;
  }
  setAxisAngleFromRotationMatrix(e) {
    let t, n, i, r;
    const c = e.elements, l = c[0], h = c[4], u = c[8], d = c[1], f = c[5], g = c[9], _ = c[2], m = c[6], p = c[10];
    if (Math.abs(h - d) < 0.01 && Math.abs(u - _) < 0.01 && Math.abs(g - m) < 0.01) {
      if (Math.abs(h + d) < 0.1 && Math.abs(u + _) < 0.1 && Math.abs(g + m) < 0.1 && Math.abs(l + f + p - 3) < 0.1)
        return this.set(1, 0, 0, 0), this;
      t = Math.PI;
      const y = (l + 1) / 2, A = (f + 1) / 2, O = (p + 1) / 2, w = (h + d) / 4, R = (u + _) / 4, k = (g + m) / 4;
      return y > A && y > O ? y < 0.01 ? (n = 0, i = 0.707106781, r = 0.707106781) : (n = Math.sqrt(y), i = w / n, r = R / n) : A > O ? A < 0.01 ? (n = 0.707106781, i = 0, r = 0.707106781) : (i = Math.sqrt(A), n = w / i, r = k / i) : O < 0.01 ? (n = 0.707106781, i = 0.707106781, r = 0) : (r = Math.sqrt(O), n = R / r, i = k / r), this.set(n, i, r, t), this;
    }
    let E = Math.sqrt((m - g) * (m - g) + (u - _) * (u - _) + (d - h) * (d - h));
    return Math.abs(E) < 1e-3 && (E = 1), this.x = (m - g) / E, this.y = (u - _) / E, this.z = (d - h) / E, this.w = Math.acos((l + f + p - 1) / 2), this;
  }
  setFromMatrixPosition(e) {
    const t = e.elements;
    return this.x = t[12], this.y = t[13], this.z = t[14], this.w = t[15], this;
  }
  min(e) {
    return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this.z = Math.min(this.z, e.z), this.w = Math.min(this.w, e.w), this;
  }
  max(e) {
    return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this.z = Math.max(this.z, e.z), this.w = Math.max(this.w, e.w), this;
  }
  clamp(e, t) {
    return this.x = Math.max(e.x, Math.min(t.x, this.x)), this.y = Math.max(e.y, Math.min(t.y, this.y)), this.z = Math.max(e.z, Math.min(t.z, this.z)), this.w = Math.max(e.w, Math.min(t.w, this.w)), this;
  }
  clampScalar(e, t) {
    return this.x = Math.max(e, Math.min(t, this.x)), this.y = Math.max(e, Math.min(t, this.y)), this.z = Math.max(e, Math.min(t, this.z)), this.w = Math.max(e, Math.min(t, this.w)), this;
  }
  clampLength(e, t) {
    const n = this.length();
    return this.divideScalar(n || 1).multiplyScalar(Math.max(e, Math.min(t, n)));
  }
  floor() {
    return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this.w = Math.floor(this.w), this;
  }
  ceil() {
    return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this.w = Math.ceil(this.w), this;
  }
  round() {
    return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this.w = Math.round(this.w), this;
  }
  roundToZero() {
    return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this.z = Math.trunc(this.z), this.w = Math.trunc(this.w), this;
  }
  negate() {
    return this.x = -this.x, this.y = -this.y, this.z = -this.z, this.w = -this.w, this;
  }
  dot(e) {
    return this.x * e.x + this.y * e.y + this.z * e.z + this.w * e.w;
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  setLength(e) {
    return this.normalize().multiplyScalar(e);
  }
  lerp(e, t) {
    return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this.z += (e.z - this.z) * t, this.w += (e.w - this.w) * t, this;
  }
  lerpVectors(e, t, n) {
    return this.x = e.x + (t.x - e.x) * n, this.y = e.y + (t.y - e.y) * n, this.z = e.z + (t.z - e.z) * n, this.w = e.w + (t.w - e.w) * n, this;
  }
  equals(e) {
    return e.x === this.x && e.y === this.y && e.z === this.z && e.w === this.w;
  }
  fromArray(e, t = 0) {
    return this.x = e[t], this.y = e[t + 1], this.z = e[t + 2], this.w = e[t + 3], this;
  }
  toArray(e = [], t = 0) {
    return e[t] = this.x, e[t + 1] = this.y, e[t + 2] = this.z, e[t + 3] = this.w, e;
  }
  fromBufferAttribute(e, t) {
    return this.x = e.getX(t), this.y = e.getY(t), this.z = e.getZ(t), this.w = e.getW(t), this;
  }
  random() {
    return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this.w = Math.random(), this;
  }
  *[Symbol.iterator]() {
    yield this.x, yield this.y, yield this.z, yield this.w;
  }
}
class Xc extends ri {
  constructor(e = 1, t = 1, n = {}) {
    super(), this.isRenderTarget = !0, this.width = e, this.height = t, this.depth = 1, this.scissor = new ut(0, 0, e, t), this.scissorTest = !1, this.viewport = new ut(0, 0, e, t);
    const i = { width: e, height: t, depth: 1 };
    n = Object.assign({
      generateMipmaps: !1,
      internalFormat: null,
      minFilter: 1006,
      depthBuffer: !0,
      stencilBuffer: !1,
      resolveDepthBuffer: !0,
      resolveStencilBuffer: !0,
      depthTexture: null,
      samples: 0,
      count: 1
    }, n);
    const r = new It(i, n.mapping, n.wrapS, n.wrapT, n.magFilter, n.minFilter, n.format, n.type, n.anisotropy, n.colorSpace);
    r.flipY = !1, r.generateMipmaps = n.generateMipmaps, r.internalFormat = n.internalFormat, this.textures = [];
    const a = n.count;
    for (let o = 0; o < a; o++)
      this.textures[o] = r.clone(), this.textures[o].isRenderTargetTexture = !0;
    this.depthBuffer = n.depthBuffer, this.stencilBuffer = n.stencilBuffer, this.resolveDepthBuffer = n.resolveDepthBuffer, this.resolveStencilBuffer = n.resolveStencilBuffer, this.depthTexture = n.depthTexture, this.samples = n.samples;
  }
  get texture() {
    return this.textures[0];
  }
  set texture(e) {
    this.textures[0] = e;
  }
  setSize(e, t, n = 1) {
    if (this.width !== e || this.height !== t || this.depth !== n) {
      this.width = e, this.height = t, this.depth = n;
      for (let i = 0, r = this.textures.length; i < r; i++)
        this.textures[i].image.width = e, this.textures[i].image.height = t, this.textures[i].image.depth = n;
      this.dispose();
    }
    this.viewport.set(0, 0, e, t), this.scissor.set(0, 0, e, t);
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    this.width = e.width, this.height = e.height, this.depth = e.depth, this.scissor.copy(e.scissor), this.scissorTest = e.scissorTest, this.viewport.copy(e.viewport), this.textures.length = 0;
    for (let n = 0, i = e.textures.length; n < i; n++)
      this.textures[n] = e.textures[n].clone(), this.textures[n].isRenderTargetTexture = !0;
    const t = Object.assign({}, e.texture.image);
    return this.texture.source = new Go(t), this.depthBuffer = e.depthBuffer, this.stencilBuffer = e.stencilBuffer, this.resolveDepthBuffer = e.resolveDepthBuffer, this.resolveStencilBuffer = e.resolveStencilBuffer, e.depthTexture !== null && (this.depthTexture = e.depthTexture.clone()), this.samples = e.samples, this;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
}
class si extends Xc {
  constructor(e = 1, t = 1, n = {}) {
    super(e, t, n), this.isWebGLRenderTarget = !0;
  }
}
class Ho extends It {
  constructor(e = null, t = 1, n = 1, i = 1) {
    super(null), this.isDataArrayTexture = !0, this.image = { data: e, width: t, height: n, depth: i }, this.magFilter = 1003, this.minFilter = 1003, this.wrapR = 1001, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1, this.layerUpdates = /* @__PURE__ */ new Set();
  }
  addLayerUpdate(e) {
    this.layerUpdates.add(e);
  }
  clearLayerUpdates() {
    this.layerUpdates.clear();
  }
}
class qc extends It {
  constructor(e = null, t = 1, n = 1, i = 1) {
    super(null), this.isData3DTexture = !0, this.image = { data: e, width: t, height: n, depth: i }, this.magFilter = 1003, this.minFilter = 1003, this.wrapR = 1001, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1;
  }
}
class _n {
  constructor(e = 0, t = 0, n = 0, i = 1) {
    this.isQuaternion = !0, this._x = e, this._y = t, this._z = n, this._w = i;
  }
  static slerpFlat(e, t, n, i, r, a, o) {
    let c = n[i + 0], l = n[i + 1], h = n[i + 2], u = n[i + 3];
    const d = r[a + 0], f = r[a + 1], g = r[a + 2], _ = r[a + 3];
    if (o === 0) {
      e[t + 0] = c, e[t + 1] = l, e[t + 2] = h, e[t + 3] = u;
      return;
    }
    if (o === 1) {
      e[t + 0] = d, e[t + 1] = f, e[t + 2] = g, e[t + 3] = _;
      return;
    }
    if (u !== _ || c !== d || l !== f || h !== g) {
      let m = 1 - o;
      const p = c * d + l * f + h * g + u * _, E = p >= 0 ? 1 : -1, y = 1 - p * p;
      if (y > Number.EPSILON) {
        const O = Math.sqrt(y), w = Math.atan2(O, p * E);
        m = Math.sin(m * w) / O, o = Math.sin(o * w) / O;
      }
      const A = o * E;
      if (c = c * m + d * A, l = l * m + f * A, h = h * m + g * A, u = u * m + _ * A, m === 1 - o) {
        const O = 1 / Math.sqrt(c * c + l * l + h * h + u * u);
        c *= O, l *= O, h *= O, u *= O;
      }
    }
    e[t] = c, e[t + 1] = l, e[t + 2] = h, e[t + 3] = u;
  }
  static multiplyQuaternionsFlat(e, t, n, i, r, a) {
    const o = n[i], c = n[i + 1], l = n[i + 2], h = n[i + 3], u = r[a], d = r[a + 1], f = r[a + 2], g = r[a + 3];
    return e[t] = o * g + h * u + c * f - l * d, e[t + 1] = c * g + h * d + l * u - o * f, e[t + 2] = l * g + h * f + o * d - c * u, e[t + 3] = h * g - o * u - c * d - l * f, e;
  }
  get x() {
    return this._x;
  }
  set x(e) {
    this._x = e, this._onChangeCallback();
  }
  get y() {
    return this._y;
  }
  set y(e) {
    this._y = e, this._onChangeCallback();
  }
  get z() {
    return this._z;
  }
  set z(e) {
    this._z = e, this._onChangeCallback();
  }
  get w() {
    return this._w;
  }
  set w(e) {
    this._w = e, this._onChangeCallback();
  }
  set(e, t, n, i) {
    return this._x = e, this._y = t, this._z = n, this._w = i, this._onChangeCallback(), this;
  }
  clone() {
    return new this.constructor(this._x, this._y, this._z, this._w);
  }
  copy(e) {
    return this._x = e.x, this._y = e.y, this._z = e.z, this._w = e.w, this._onChangeCallback(), this;
  }
  setFromEuler(e, t = !0) {
    const n = e._x, i = e._y, r = e._z, a = e._order, o = Math.cos, c = Math.sin, l = o(n / 2), h = o(i / 2), u = o(r / 2), d = c(n / 2), f = c(i / 2), g = c(r / 2);
    switch (a) {
      case "XYZ":
        this._x = d * h * u + l * f * g, this._y = l * f * u - d * h * g, this._z = l * h * g + d * f * u, this._w = l * h * u - d * f * g;
        break;
      case "YXZ":
        this._x = d * h * u + l * f * g, this._y = l * f * u - d * h * g, this._z = l * h * g - d * f * u, this._w = l * h * u + d * f * g;
        break;
      case "ZXY":
        this._x = d * h * u - l * f * g, this._y = l * f * u + d * h * g, this._z = l * h * g + d * f * u, this._w = l * h * u - d * f * g;
        break;
      case "ZYX":
        this._x = d * h * u - l * f * g, this._y = l * f * u + d * h * g, this._z = l * h * g - d * f * u, this._w = l * h * u + d * f * g;
        break;
      case "YZX":
        this._x = d * h * u + l * f * g, this._y = l * f * u + d * h * g, this._z = l * h * g - d * f * u, this._w = l * h * u - d * f * g;
        break;
      case "XZY":
        this._x = d * h * u - l * f * g, this._y = l * f * u - d * h * g, this._z = l * h * g + d * f * u, this._w = l * h * u + d * f * g;
        break;
      default:
        console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: " + a);
    }
    return t === !0 && this._onChangeCallback(), this;
  }
  setFromAxisAngle(e, t) {
    const n = t / 2, i = Math.sin(n);
    return this._x = e.x * i, this._y = e.y * i, this._z = e.z * i, this._w = Math.cos(n), this._onChangeCallback(), this;
  }
  setFromRotationMatrix(e) {
    const t = e.elements, n = t[0], i = t[4], r = t[8], a = t[1], o = t[5], c = t[9], l = t[2], h = t[6], u = t[10], d = n + o + u;
    if (d > 0) {
      const f = 0.5 / Math.sqrt(d + 1);
      this._w = 0.25 / f, this._x = (h - c) * f, this._y = (r - l) * f, this._z = (a - i) * f;
    } else if (n > o && n > u) {
      const f = 2 * Math.sqrt(1 + n - o - u);
      this._w = (h - c) / f, this._x = 0.25 * f, this._y = (i + a) / f, this._z = (r + l) / f;
    } else if (o > u) {
      const f = 2 * Math.sqrt(1 + o - n - u);
      this._w = (r - l) / f, this._x = (i + a) / f, this._y = 0.25 * f, this._z = (c + h) / f;
    } else {
      const f = 2 * Math.sqrt(1 + u - n - o);
      this._w = (a - i) / f, this._x = (r + l) / f, this._y = (c + h) / f, this._z = 0.25 * f;
    }
    return this._onChangeCallback(), this;
  }
  setFromUnitVectors(e, t) {
    let n = e.dot(t) + 1;
    return n < Number.EPSILON ? (n = 0, Math.abs(e.x) > Math.abs(e.z) ? (this._x = -e.y, this._y = e.x, this._z = 0, this._w = n) : (this._x = 0, this._y = -e.z, this._z = e.y, this._w = n)) : (this._x = e.y * t.z - e.z * t.y, this._y = e.z * t.x - e.x * t.z, this._z = e.x * t.y - e.y * t.x, this._w = n), this.normalize();
  }
  angleTo(e) {
    return 2 * Math.acos(Math.abs(Vt(this.dot(e), -1, 1)));
  }
  rotateTowards(e, t) {
    const n = this.angleTo(e);
    if (n === 0) return this;
    const i = Math.min(1, t / n);
    return this.slerp(e, i), this;
  }
  identity() {
    return this.set(0, 0, 0, 1);
  }
  invert() {
    return this.conjugate();
  }
  conjugate() {
    return this._x *= -1, this._y *= -1, this._z *= -1, this._onChangeCallback(), this;
  }
  dot(e) {
    return this._x * e._x + this._y * e._y + this._z * e._z + this._w * e._w;
  }
  lengthSq() {
    return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;
  }
  length() {
    return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
  }
  normalize() {
    let e = this.length();
    return e === 0 ? (this._x = 0, this._y = 0, this._z = 0, this._w = 1) : (e = 1 / e, this._x = this._x * e, this._y = this._y * e, this._z = this._z * e, this._w = this._w * e), this._onChangeCallback(), this;
  }
  multiply(e) {
    return this.multiplyQuaternions(this, e);
  }
  premultiply(e) {
    return this.multiplyQuaternions(e, this);
  }
  multiplyQuaternions(e, t) {
    const n = e._x, i = e._y, r = e._z, a = e._w, o = t._x, c = t._y, l = t._z, h = t._w;
    return this._x = n * h + a * o + i * l - r * c, this._y = i * h + a * c + r * o - n * l, this._z = r * h + a * l + n * c - i * o, this._w = a * h - n * o - i * c - r * l, this._onChangeCallback(), this;
  }
  slerp(e, t) {
    if (t === 0) return this;
    if (t === 1) return this.copy(e);
    const n = this._x, i = this._y, r = this._z, a = this._w;
    let o = a * e._w + n * e._x + i * e._y + r * e._z;
    if (o < 0 ? (this._w = -e._w, this._x = -e._x, this._y = -e._y, this._z = -e._z, o = -o) : this.copy(e), o >= 1)
      return this._w = a, this._x = n, this._y = i, this._z = r, this;
    const c = 1 - o * o;
    if (c <= Number.EPSILON) {
      const f = 1 - t;
      return this._w = f * a + t * this._w, this._x = f * n + t * this._x, this._y = f * i + t * this._y, this._z = f * r + t * this._z, this.normalize(), this;
    }
    const l = Math.sqrt(c), h = Math.atan2(l, o), u = Math.sin((1 - t) * h) / l, d = Math.sin(t * h) / l;
    return this._w = a * u + this._w * d, this._x = n * u + this._x * d, this._y = i * u + this._y * d, this._z = r * u + this._z * d, this._onChangeCallback(), this;
  }
  slerpQuaternions(e, t, n) {
    return this.copy(e).slerp(t, n);
  }
  random() {
    const e = 2 * Math.PI * Math.random(), t = 2 * Math.PI * Math.random(), n = Math.random(), i = Math.sqrt(1 - n), r = Math.sqrt(n);
    return this.set(
      i * Math.sin(e),
      i * Math.cos(e),
      r * Math.sin(t),
      r * Math.cos(t)
    );
  }
  equals(e) {
    return e._x === this._x && e._y === this._y && e._z === this._z && e._w === this._w;
  }
  fromArray(e, t = 0) {
    return this._x = e[t], this._y = e[t + 1], this._z = e[t + 2], this._w = e[t + 3], this._onChangeCallback(), this;
  }
  toArray(e = [], t = 0) {
    return e[t] = this._x, e[t + 1] = this._y, e[t + 2] = this._z, e[t + 3] = this._w, e;
  }
  fromBufferAttribute(e, t) {
    return this._x = e.getX(t), this._y = e.getY(t), this._z = e.getZ(t), this._w = e.getW(t), this._onChangeCallback(), this;
  }
  toJSON() {
    return this.toArray();
  }
  _onChange(e) {
    return this._onChangeCallback = e, this;
  }
  _onChangeCallback() {
  }
  *[Symbol.iterator]() {
    yield this._x, yield this._y, yield this._z, yield this._w;
  }
}
class L {
  constructor(e = 0, t = 0, n = 0) {
    L.prototype.isVector3 = !0, this.x = e, this.y = t, this.z = n;
  }
  set(e, t, n) {
    return n === void 0 && (n = this.z), this.x = e, this.y = t, this.z = n, this;
  }
  setScalar(e) {
    return this.x = e, this.y = e, this.z = e, this;
  }
  setX(e) {
    return this.x = e, this;
  }
  setY(e) {
    return this.y = e, this;
  }
  setZ(e) {
    return this.z = e, this;
  }
  setComponent(e, t) {
    switch (e) {
      case 0:
        this.x = t;
        break;
      case 1:
        this.y = t;
        break;
      case 2:
        this.z = t;
        break;
      default:
        throw new Error("index is out of range: " + e);
    }
    return this;
  }
  getComponent(e) {
    switch (e) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      default:
        throw new Error("index is out of range: " + e);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y, this.z);
  }
  copy(e) {
    return this.x = e.x, this.y = e.y, this.z = e.z, this;
  }
  add(e) {
    return this.x += e.x, this.y += e.y, this.z += e.z, this;
  }
  addScalar(e) {
    return this.x += e, this.y += e, this.z += e, this;
  }
  addVectors(e, t) {
    return this.x = e.x + t.x, this.y = e.y + t.y, this.z = e.z + t.z, this;
  }
  addScaledVector(e, t) {
    return this.x += e.x * t, this.y += e.y * t, this.z += e.z * t, this;
  }
  sub(e) {
    return this.x -= e.x, this.y -= e.y, this.z -= e.z, this;
  }
  subScalar(e) {
    return this.x -= e, this.y -= e, this.z -= e, this;
  }
  subVectors(e, t) {
    return this.x = e.x - t.x, this.y = e.y - t.y, this.z = e.z - t.z, this;
  }
  multiply(e) {
    return this.x *= e.x, this.y *= e.y, this.z *= e.z, this;
  }
  multiplyScalar(e) {
    return this.x *= e, this.y *= e, this.z *= e, this;
  }
  multiplyVectors(e, t) {
    return this.x = e.x * t.x, this.y = e.y * t.y, this.z = e.z * t.z, this;
  }
  applyEuler(e) {
    return this.applyQuaternion(Ta.setFromEuler(e));
  }
  applyAxisAngle(e, t) {
    return this.applyQuaternion(Ta.setFromAxisAngle(e, t));
  }
  applyMatrix3(e) {
    const t = this.x, n = this.y, i = this.z, r = e.elements;
    return this.x = r[0] * t + r[3] * n + r[6] * i, this.y = r[1] * t + r[4] * n + r[7] * i, this.z = r[2] * t + r[5] * n + r[8] * i, this;
  }
  applyNormalMatrix(e) {
    return this.applyMatrix3(e).normalize();
  }
  applyMatrix4(e) {
    const t = this.x, n = this.y, i = this.z, r = e.elements, a = 1 / (r[3] * t + r[7] * n + r[11] * i + r[15]);
    return this.x = (r[0] * t + r[4] * n + r[8] * i + r[12]) * a, this.y = (r[1] * t + r[5] * n + r[9] * i + r[13]) * a, this.z = (r[2] * t + r[6] * n + r[10] * i + r[14]) * a, this;
  }
  applyQuaternion(e) {
    const t = this.x, n = this.y, i = this.z, r = e.x, a = e.y, o = e.z, c = e.w, l = 2 * (a * i - o * n), h = 2 * (o * t - r * i), u = 2 * (r * n - a * t);
    return this.x = t + c * l + a * u - o * h, this.y = n + c * h + o * l - r * u, this.z = i + c * u + r * h - a * l, this;
  }
  project(e) {
    return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix);
  }
  unproject(e) {
    return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld);
  }
  transformDirection(e) {
    const t = this.x, n = this.y, i = this.z, r = e.elements;
    return this.x = r[0] * t + r[4] * n + r[8] * i, this.y = r[1] * t + r[5] * n + r[9] * i, this.z = r[2] * t + r[6] * n + r[10] * i, this.normalize();
  }
  divide(e) {
    return this.x /= e.x, this.y /= e.y, this.z /= e.z, this;
  }
  divideScalar(e) {
    return this.multiplyScalar(1 / e);
  }
  min(e) {
    return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this.z = Math.min(this.z, e.z), this;
  }
  max(e) {
    return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this.z = Math.max(this.z, e.z), this;
  }
  clamp(e, t) {
    return this.x = Math.max(e.x, Math.min(t.x, this.x)), this.y = Math.max(e.y, Math.min(t.y, this.y)), this.z = Math.max(e.z, Math.min(t.z, this.z)), this;
  }
  clampScalar(e, t) {
    return this.x = Math.max(e, Math.min(t, this.x)), this.y = Math.max(e, Math.min(t, this.y)), this.z = Math.max(e, Math.min(t, this.z)), this;
  }
  clampLength(e, t) {
    const n = this.length();
    return this.divideScalar(n || 1).multiplyScalar(Math.max(e, Math.min(t, n)));
  }
  floor() {
    return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this;
  }
  ceil() {
    return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this;
  }
  round() {
    return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this;
  }
  roundToZero() {
    return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this.z = Math.trunc(this.z), this;
  }
  negate() {
    return this.x = -this.x, this.y = -this.y, this.z = -this.z, this;
  }
  dot(e) {
    return this.x * e.x + this.y * e.y + this.z * e.z;
  }
  // TODO lengthSquared?
  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  setLength(e) {
    return this.normalize().multiplyScalar(e);
  }
  lerp(e, t) {
    return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this.z += (e.z - this.z) * t, this;
  }
  lerpVectors(e, t, n) {
    return this.x = e.x + (t.x - e.x) * n, this.y = e.y + (t.y - e.y) * n, this.z = e.z + (t.z - e.z) * n, this;
  }
  cross(e) {
    return this.crossVectors(this, e);
  }
  crossVectors(e, t) {
    const n = e.x, i = e.y, r = e.z, a = t.x, o = t.y, c = t.z;
    return this.x = i * c - r * o, this.y = r * a - n * c, this.z = n * o - i * a, this;
  }
  projectOnVector(e) {
    const t = e.lengthSq();
    if (t === 0) return this.set(0, 0, 0);
    const n = e.dot(this) / t;
    return this.copy(e).multiplyScalar(n);
  }
  projectOnPlane(e) {
    return ur.copy(this).projectOnVector(e), this.sub(ur);
  }
  reflect(e) {
    return this.sub(ur.copy(e).multiplyScalar(2 * this.dot(e)));
  }
  angleTo(e) {
    const t = Math.sqrt(this.lengthSq() * e.lengthSq());
    if (t === 0) return Math.PI / 2;
    const n = this.dot(e) / t;
    return Math.acos(Vt(n, -1, 1));
  }
  distanceTo(e) {
    return Math.sqrt(this.distanceToSquared(e));
  }
  distanceToSquared(e) {
    const t = this.x - e.x, n = this.y - e.y, i = this.z - e.z;
    return t * t + n * n + i * i;
  }
  manhattanDistanceTo(e) {
    return Math.abs(this.x - e.x) + Math.abs(this.y - e.y) + Math.abs(this.z - e.z);
  }
  setFromSpherical(e) {
    return this.setFromSphericalCoords(e.radius, e.phi, e.theta);
  }
  setFromSphericalCoords(e, t, n) {
    const i = Math.sin(t) * e;
    return this.x = i * Math.sin(n), this.y = Math.cos(t) * e, this.z = i * Math.cos(n), this;
  }
  setFromCylindrical(e) {
    return this.setFromCylindricalCoords(e.radius, e.theta, e.y);
  }
  setFromCylindricalCoords(e, t, n) {
    return this.x = e * Math.sin(t), this.y = n, this.z = e * Math.cos(t), this;
  }
  setFromMatrixPosition(e) {
    const t = e.elements;
    return this.x = t[12], this.y = t[13], this.z = t[14], this;
  }
  setFromMatrixScale(e) {
    const t = this.setFromMatrixColumn(e, 0).length(), n = this.setFromMatrixColumn(e, 1).length(), i = this.setFromMatrixColumn(e, 2).length();
    return this.x = t, this.y = n, this.z = i, this;
  }
  setFromMatrixColumn(e, t) {
    return this.fromArray(e.elements, t * 4);
  }
  setFromMatrix3Column(e, t) {
    return this.fromArray(e.elements, t * 3);
  }
  setFromEuler(e) {
    return this.x = e._x, this.y = e._y, this.z = e._z, this;
  }
  setFromColor(e) {
    return this.x = e.r, this.y = e.g, this.z = e.b, this;
  }
  equals(e) {
    return e.x === this.x && e.y === this.y && e.z === this.z;
  }
  fromArray(e, t = 0) {
    return this.x = e[t], this.y = e[t + 1], this.z = e[t + 2], this;
  }
  toArray(e = [], t = 0) {
    return e[t] = this.x, e[t + 1] = this.y, e[t + 2] = this.z, e;
  }
  fromBufferAttribute(e, t) {
    return this.x = e.getX(t), this.y = e.getY(t), this.z = e.getZ(t), this;
  }
  random() {
    return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this;
  }
  randomDirection() {
    const e = Math.random() * Math.PI * 2, t = Math.random() * 2 - 1, n = Math.sqrt(1 - t * t);
    return this.x = n * Math.cos(e), this.y = t, this.z = n * Math.sin(e), this;
  }
  *[Symbol.iterator]() {
    yield this.x, yield this.y, yield this.z;
  }
}
const ur = /* @__PURE__ */ new L(), Ta = /* @__PURE__ */ new _n();
class vn {
  constructor(e = new L(1 / 0, 1 / 0, 1 / 0), t = new L(-1 / 0, -1 / 0, -1 / 0)) {
    this.isBox3 = !0, this.min = e, this.max = t;
  }
  set(e, t) {
    return this.min.copy(e), this.max.copy(t), this;
  }
  setFromArray(e) {
    this.makeEmpty();
    for (let t = 0, n = e.length; t < n; t += 3)
      this.expandByPoint(dn.fromArray(e, t));
    return this;
  }
  setFromBufferAttribute(e) {
    this.makeEmpty();
    for (let t = 0, n = e.count; t < n; t++)
      this.expandByPoint(dn.fromBufferAttribute(e, t));
    return this;
  }
  setFromPoints(e) {
    this.makeEmpty();
    for (let t = 0, n = e.length; t < n; t++)
      this.expandByPoint(e[t]);
    return this;
  }
  setFromCenterAndSize(e, t) {
    const n = dn.copy(t).multiplyScalar(0.5);
    return this.min.copy(e).sub(n), this.max.copy(e).add(n), this;
  }
  setFromObject(e, t = !1) {
    return this.makeEmpty(), this.expandByObject(e, t);
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    return this.min.copy(e.min), this.max.copy(e.max), this;
  }
  makeEmpty() {
    return this.min.x = this.min.y = this.min.z = 1 / 0, this.max.x = this.max.y = this.max.z = -1 / 0, this;
  }
  isEmpty() {
    return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z;
  }
  getCenter(e) {
    return this.isEmpty() ? e.set(0, 0, 0) : e.addVectors(this.min, this.max).multiplyScalar(0.5);
  }
  getSize(e) {
    return this.isEmpty() ? e.set(0, 0, 0) : e.subVectors(this.max, this.min);
  }
  expandByPoint(e) {
    return this.min.min(e), this.max.max(e), this;
  }
  expandByVector(e) {
    return this.min.sub(e), this.max.add(e), this;
  }
  expandByScalar(e) {
    return this.min.addScalar(-e), this.max.addScalar(e), this;
  }
  expandByObject(e, t = !1) {
    e.updateWorldMatrix(!1, !1);
    const n = e.geometry;
    if (n !== void 0) {
      const r = n.getAttribute("position");
      if (t === !0 && r !== void 0 && e.isInstancedMesh !== !0)
        for (let a = 0, o = r.count; a < o; a++)
          e.isMesh === !0 ? e.getVertexPosition(a, dn) : dn.fromBufferAttribute(r, a), dn.applyMatrix4(e.matrixWorld), this.expandByPoint(dn);
      else
        e.boundingBox !== void 0 ? (e.boundingBox === null && e.computeBoundingBox(), ms.copy(e.boundingBox)) : (n.boundingBox === null && n.computeBoundingBox(), ms.copy(n.boundingBox)), ms.applyMatrix4(e.matrixWorld), this.union(ms);
    }
    const i = e.children;
    for (let r = 0, a = i.length; r < a; r++)
      this.expandByObject(i[r], t);
    return this;
  }
  containsPoint(e) {
    return e.x >= this.min.x && e.x <= this.max.x && e.y >= this.min.y && e.y <= this.max.y && e.z >= this.min.z && e.z <= this.max.z;
  }
  containsBox(e) {
    return this.min.x <= e.min.x && e.max.x <= this.max.x && this.min.y <= e.min.y && e.max.y <= this.max.y && this.min.z <= e.min.z && e.max.z <= this.max.z;
  }
  getParameter(e, t) {
    return t.set(
      (e.x - this.min.x) / (this.max.x - this.min.x),
      (e.y - this.min.y) / (this.max.y - this.min.y),
      (e.z - this.min.z) / (this.max.z - this.min.z)
    );
  }
  intersectsBox(e) {
    return e.max.x >= this.min.x && e.min.x <= this.max.x && e.max.y >= this.min.y && e.min.y <= this.max.y && e.max.z >= this.min.z && e.min.z <= this.max.z;
  }
  intersectsSphere(e) {
    return this.clampPoint(e.center, dn), dn.distanceToSquared(e.center) <= e.radius * e.radius;
  }
  intersectsPlane(e) {
    let t, n;
    return e.normal.x > 0 ? (t = e.normal.x * this.min.x, n = e.normal.x * this.max.x) : (t = e.normal.x * this.max.x, n = e.normal.x * this.min.x), e.normal.y > 0 ? (t += e.normal.y * this.min.y, n += e.normal.y * this.max.y) : (t += e.normal.y * this.max.y, n += e.normal.y * this.min.y), e.normal.z > 0 ? (t += e.normal.z * this.min.z, n += e.normal.z * this.max.z) : (t += e.normal.z * this.max.z, n += e.normal.z * this.min.z), t <= -e.constant && n >= -e.constant;
  }
  intersectsTriangle(e) {
    if (this.isEmpty())
      return !1;
    this.getCenter(Zi), gs.subVectors(this.max, Zi), fi.subVectors(e.a, Zi), pi.subVectors(e.b, Zi), mi.subVectors(e.c, Zi), Un.subVectors(pi, fi), Nn.subVectors(mi, pi), jn.subVectors(fi, mi);
    let t = [
      0,
      -Un.z,
      Un.y,
      0,
      -Nn.z,
      Nn.y,
      0,
      -jn.z,
      jn.y,
      Un.z,
      0,
      -Un.x,
      Nn.z,
      0,
      -Nn.x,
      jn.z,
      0,
      -jn.x,
      -Un.y,
      Un.x,
      0,
      -Nn.y,
      Nn.x,
      0,
      -jn.y,
      jn.x,
      0
    ];
    return !dr(t, fi, pi, mi, gs) || (t = [1, 0, 0, 0, 1, 0, 0, 0, 1], !dr(t, fi, pi, mi, gs)) ? !1 : (_s.crossVectors(Un, Nn), t = [_s.x, _s.y, _s.z], dr(t, fi, pi, mi, gs));
  }
  clampPoint(e, t) {
    return t.copy(e).clamp(this.min, this.max);
  }
  distanceToPoint(e) {
    return this.clampPoint(e, dn).distanceTo(e);
  }
  getBoundingSphere(e) {
    return this.isEmpty() ? e.makeEmpty() : (this.getCenter(e.center), e.radius = this.getSize(dn).length() * 0.5), e;
  }
  intersect(e) {
    return this.min.max(e.min), this.max.min(e.max), this.isEmpty() && this.makeEmpty(), this;
  }
  union(e) {
    return this.min.min(e.min), this.max.max(e.max), this;
  }
  applyMatrix4(e) {
    return this.isEmpty() ? this : (bn[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(e), bn[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(e), bn[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(e), bn[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(e), bn[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(e), bn[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(e), bn[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(e), bn[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(e), this.setFromPoints(bn), this);
  }
  translate(e) {
    return this.min.add(e), this.max.add(e), this;
  }
  equals(e) {
    return e.min.equals(this.min) && e.max.equals(this.max);
  }
}
const bn = [
  /* @__PURE__ */ new L(),
  /* @__PURE__ */ new L(),
  /* @__PURE__ */ new L(),
  /* @__PURE__ */ new L(),
  /* @__PURE__ */ new L(),
  /* @__PURE__ */ new L(),
  /* @__PURE__ */ new L(),
  /* @__PURE__ */ new L()
], dn = /* @__PURE__ */ new L(), ms = /* @__PURE__ */ new vn(), fi = /* @__PURE__ */ new L(), pi = /* @__PURE__ */ new L(), mi = /* @__PURE__ */ new L(), Un = /* @__PURE__ */ new L(), Nn = /* @__PURE__ */ new L(), jn = /* @__PURE__ */ new L(), Zi = /* @__PURE__ */ new L(), gs = /* @__PURE__ */ new L(), _s = /* @__PURE__ */ new L(), Yn = /* @__PURE__ */ new L();
function dr(s, e, t, n, i) {
  for (let r = 0, a = s.length - 3; r <= a; r += 3) {
    Yn.fromArray(s, r);
    const o = i.x * Math.abs(Yn.x) + i.y * Math.abs(Yn.y) + i.z * Math.abs(Yn.z), c = e.dot(Yn), l = t.dot(Yn), h = n.dot(Yn);
    if (Math.max(-Math.max(c, l, h), Math.min(c, l, h)) > o)
      return !1;
  }
  return !0;
}
const jc = /* @__PURE__ */ new vn(), $i = /* @__PURE__ */ new L(), fr = /* @__PURE__ */ new L();
class Sn {
  constructor(e = new L(), t = -1) {
    this.isSphere = !0, this.center = e, this.radius = t;
  }
  set(e, t) {
    return this.center.copy(e), this.radius = t, this;
  }
  setFromPoints(e, t) {
    const n = this.center;
    t !== void 0 ? n.copy(t) : jc.setFromPoints(e).getCenter(n);
    let i = 0;
    for (let r = 0, a = e.length; r < a; r++)
      i = Math.max(i, n.distanceToSquared(e[r]));
    return this.radius = Math.sqrt(i), this;
  }
  copy(e) {
    return this.center.copy(e.center), this.radius = e.radius, this;
  }
  isEmpty() {
    return this.radius < 0;
  }
  makeEmpty() {
    return this.center.set(0, 0, 0), this.radius = -1, this;
  }
  containsPoint(e) {
    return e.distanceToSquared(this.center) <= this.radius * this.radius;
  }
  distanceToPoint(e) {
    return e.distanceTo(this.center) - this.radius;
  }
  intersectsSphere(e) {
    const t = this.radius + e.radius;
    return e.center.distanceToSquared(this.center) <= t * t;
  }
  intersectsBox(e) {
    return e.intersectsSphere(this);
  }
  intersectsPlane(e) {
    return Math.abs(e.distanceToPoint(this.center)) <= this.radius;
  }
  clampPoint(e, t) {
    const n = this.center.distanceToSquared(e);
    return t.copy(e), n > this.radius * this.radius && (t.sub(this.center).normalize(), t.multiplyScalar(this.radius).add(this.center)), t;
  }
  getBoundingBox(e) {
    return this.isEmpty() ? (e.makeEmpty(), e) : (e.set(this.center, this.center), e.expandByScalar(this.radius), e);
  }
  applyMatrix4(e) {
    return this.center.applyMatrix4(e), this.radius = this.radius * e.getMaxScaleOnAxis(), this;
  }
  translate(e) {
    return this.center.add(e), this;
  }
  expandByPoint(e) {
    if (this.isEmpty())
      return this.center.copy(e), this.radius = 0, this;
    $i.subVectors(e, this.center);
    const t = $i.lengthSq();
    if (t > this.radius * this.radius) {
      const n = Math.sqrt(t), i = (n - this.radius) * 0.5;
      this.center.addScaledVector($i, i / n), this.radius += i;
    }
    return this;
  }
  union(e) {
    return e.isEmpty() ? this : this.isEmpty() ? (this.copy(e), this) : (this.center.equals(e.center) === !0 ? this.radius = Math.max(this.radius, e.radius) : (fr.subVectors(e.center, this.center).setLength(e.radius), this.expandByPoint($i.copy(e.center).add(fr)), this.expandByPoint($i.copy(e.center).sub(fr))), this);
  }
  equals(e) {
    return e.center.equals(this.center) && e.radius === this.radius;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
const wn = /* @__PURE__ */ new L(), pr = /* @__PURE__ */ new L(), xs = /* @__PURE__ */ new L(), Fn = /* @__PURE__ */ new L(), mr = /* @__PURE__ */ new L(), vs = /* @__PURE__ */ new L(), gr = /* @__PURE__ */ new L();
class hs {
  constructor(e = new L(), t = new L(0, 0, -1)) {
    this.origin = e, this.direction = t;
  }
  set(e, t) {
    return this.origin.copy(e), this.direction.copy(t), this;
  }
  copy(e) {
    return this.origin.copy(e.origin), this.direction.copy(e.direction), this;
  }
  at(e, t) {
    return t.copy(this.origin).addScaledVector(this.direction, e);
  }
  lookAt(e) {
    return this.direction.copy(e).sub(this.origin).normalize(), this;
  }
  recast(e) {
    return this.origin.copy(this.at(e, wn)), this;
  }
  closestPointToPoint(e, t) {
    t.subVectors(e, this.origin);
    const n = t.dot(this.direction);
    return n < 0 ? t.copy(this.origin) : t.copy(this.origin).addScaledVector(this.direction, n);
  }
  distanceToPoint(e) {
    return Math.sqrt(this.distanceSqToPoint(e));
  }
  distanceSqToPoint(e) {
    const t = wn.subVectors(e, this.origin).dot(this.direction);
    return t < 0 ? this.origin.distanceToSquared(e) : (wn.copy(this.origin).addScaledVector(this.direction, t), wn.distanceToSquared(e));
  }
  distanceSqToSegment(e, t, n, i) {
    pr.copy(e).add(t).multiplyScalar(0.5), xs.copy(t).sub(e).normalize(), Fn.copy(this.origin).sub(pr);
    const r = e.distanceTo(t) * 0.5, a = -this.direction.dot(xs), o = Fn.dot(this.direction), c = -Fn.dot(xs), l = Fn.lengthSq(), h = Math.abs(1 - a * a);
    let u, d, f, g;
    if (h > 0)
      if (u = a * c - o, d = a * o - c, g = r * h, u >= 0)
        if (d >= -g)
          if (d <= g) {
            const _ = 1 / h;
            u *= _, d *= _, f = u * (u + a * d + 2 * o) + d * (a * u + d + 2 * c) + l;
          } else
            d = r, u = Math.max(0, -(a * d + o)), f = -u * u + d * (d + 2 * c) + l;
        else
          d = -r, u = Math.max(0, -(a * d + o)), f = -u * u + d * (d + 2 * c) + l;
      else
        d <= -g ? (u = Math.max(0, -(-a * r + o)), d = u > 0 ? -r : Math.min(Math.max(-r, -c), r), f = -u * u + d * (d + 2 * c) + l) : d <= g ? (u = 0, d = Math.min(Math.max(-r, -c), r), f = d * (d + 2 * c) + l) : (u = Math.max(0, -(a * r + o)), d = u > 0 ? r : Math.min(Math.max(-r, -c), r), f = -u * u + d * (d + 2 * c) + l);
    else
      d = a > 0 ? -r : r, u = Math.max(0, -(a * d + o)), f = -u * u + d * (d + 2 * c) + l;
    return n && n.copy(this.origin).addScaledVector(this.direction, u), i && i.copy(pr).addScaledVector(xs, d), f;
  }
  intersectSphere(e, t) {
    wn.subVectors(e.center, this.origin);
    const n = wn.dot(this.direction), i = wn.dot(wn) - n * n, r = e.radius * e.radius;
    if (i > r) return null;
    const a = Math.sqrt(r - i), o = n - a, c = n + a;
    return c < 0 ? null : o < 0 ? this.at(c, t) : this.at(o, t);
  }
  intersectsSphere(e) {
    return this.distanceSqToPoint(e.center) <= e.radius * e.radius;
  }
  distanceToPlane(e) {
    const t = e.normal.dot(this.direction);
    if (t === 0)
      return e.distanceToPoint(this.origin) === 0 ? 0 : null;
    const n = -(this.origin.dot(e.normal) + e.constant) / t;
    return n >= 0 ? n : null;
  }
  intersectPlane(e, t) {
    const n = this.distanceToPlane(e);
    return n === null ? null : this.at(n, t);
  }
  intersectsPlane(e) {
    const t = e.distanceToPoint(this.origin);
    return t === 0 || e.normal.dot(this.direction) * t < 0;
  }
  intersectBox(e, t) {
    let n, i, r, a, o, c;
    const l = 1 / this.direction.x, h = 1 / this.direction.y, u = 1 / this.direction.z, d = this.origin;
    return l >= 0 ? (n = (e.min.x - d.x) * l, i = (e.max.x - d.x) * l) : (n = (e.max.x - d.x) * l, i = (e.min.x - d.x) * l), h >= 0 ? (r = (e.min.y - d.y) * h, a = (e.max.y - d.y) * h) : (r = (e.max.y - d.y) * h, a = (e.min.y - d.y) * h), n > a || r > i || ((r > n || isNaN(n)) && (n = r), (a < i || isNaN(i)) && (i = a), u >= 0 ? (o = (e.min.z - d.z) * u, c = (e.max.z - d.z) * u) : (o = (e.max.z - d.z) * u, c = (e.min.z - d.z) * u), n > c || o > i) || ((o > n || n !== n) && (n = o), (c < i || i !== i) && (i = c), i < 0) ? null : this.at(n >= 0 ? n : i, t);
  }
  intersectsBox(e) {
    return this.intersectBox(e, wn) !== null;
  }
  intersectTriangle(e, t, n, i, r) {
    mr.subVectors(t, e), vs.subVectors(n, e), gr.crossVectors(mr, vs);
    let a = this.direction.dot(gr), o;
    if (a > 0) {
      if (i) return null;
      o = 1;
    } else if (a < 0)
      o = -1, a = -a;
    else
      return null;
    Fn.subVectors(this.origin, e);
    const c = o * this.direction.dot(vs.crossVectors(Fn, vs));
    if (c < 0)
      return null;
    const l = o * this.direction.dot(mr.cross(Fn));
    if (l < 0 || c + l > a)
      return null;
    const h = -o * Fn.dot(gr);
    return h < 0 ? null : this.at(h / a, r);
  }
  applyMatrix4(e) {
    return this.origin.applyMatrix4(e), this.direction.transformDirection(e), this;
  }
  equals(e) {
    return e.origin.equals(this.origin) && e.direction.equals(this.direction);
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
class qe {
  constructor(e, t, n, i, r, a, o, c, l, h, u, d, f, g, _, m) {
    qe.prototype.isMatrix4 = !0, this.elements = [
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    ], e !== void 0 && this.set(e, t, n, i, r, a, o, c, l, h, u, d, f, g, _, m);
  }
  set(e, t, n, i, r, a, o, c, l, h, u, d, f, g, _, m) {
    const p = this.elements;
    return p[0] = e, p[4] = t, p[8] = n, p[12] = i, p[1] = r, p[5] = a, p[9] = o, p[13] = c, p[2] = l, p[6] = h, p[10] = u, p[14] = d, p[3] = f, p[7] = g, p[11] = _, p[15] = m, this;
  }
  identity() {
    return this.set(
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  clone() {
    return new qe().fromArray(this.elements);
  }
  copy(e) {
    const t = this.elements, n = e.elements;
    return t[0] = n[0], t[1] = n[1], t[2] = n[2], t[3] = n[3], t[4] = n[4], t[5] = n[5], t[6] = n[6], t[7] = n[7], t[8] = n[8], t[9] = n[9], t[10] = n[10], t[11] = n[11], t[12] = n[12], t[13] = n[13], t[14] = n[14], t[15] = n[15], this;
  }
  copyPosition(e) {
    const t = this.elements, n = e.elements;
    return t[12] = n[12], t[13] = n[13], t[14] = n[14], this;
  }
  setFromMatrix3(e) {
    const t = e.elements;
    return this.set(
      t[0],
      t[3],
      t[6],
      0,
      t[1],
      t[4],
      t[7],
      0,
      t[2],
      t[5],
      t[8],
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  extractBasis(e, t, n) {
    return e.setFromMatrixColumn(this, 0), t.setFromMatrixColumn(this, 1), n.setFromMatrixColumn(this, 2), this;
  }
  makeBasis(e, t, n) {
    return this.set(
      e.x,
      t.x,
      n.x,
      0,
      e.y,
      t.y,
      n.y,
      0,
      e.z,
      t.z,
      n.z,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  extractRotation(e) {
    const t = this.elements, n = e.elements, i = 1 / gi.setFromMatrixColumn(e, 0).length(), r = 1 / gi.setFromMatrixColumn(e, 1).length(), a = 1 / gi.setFromMatrixColumn(e, 2).length();
    return t[0] = n[0] * i, t[1] = n[1] * i, t[2] = n[2] * i, t[3] = 0, t[4] = n[4] * r, t[5] = n[5] * r, t[6] = n[6] * r, t[7] = 0, t[8] = n[8] * a, t[9] = n[9] * a, t[10] = n[10] * a, t[11] = 0, t[12] = 0, t[13] = 0, t[14] = 0, t[15] = 1, this;
  }
  makeRotationFromEuler(e) {
    const t = this.elements, n = e.x, i = e.y, r = e.z, a = Math.cos(n), o = Math.sin(n), c = Math.cos(i), l = Math.sin(i), h = Math.cos(r), u = Math.sin(r);
    if (e.order === "XYZ") {
      const d = a * h, f = a * u, g = o * h, _ = o * u;
      t[0] = c * h, t[4] = -c * u, t[8] = l, t[1] = f + g * l, t[5] = d - _ * l, t[9] = -o * c, t[2] = _ - d * l, t[6] = g + f * l, t[10] = a * c;
    } else if (e.order === "YXZ") {
      const d = c * h, f = c * u, g = l * h, _ = l * u;
      t[0] = d + _ * o, t[4] = g * o - f, t[8] = a * l, t[1] = a * u, t[5] = a * h, t[9] = -o, t[2] = f * o - g, t[6] = _ + d * o, t[10] = a * c;
    } else if (e.order === "ZXY") {
      const d = c * h, f = c * u, g = l * h, _ = l * u;
      t[0] = d - _ * o, t[4] = -a * u, t[8] = g + f * o, t[1] = f + g * o, t[5] = a * h, t[9] = _ - d * o, t[2] = -a * l, t[6] = o, t[10] = a * c;
    } else if (e.order === "ZYX") {
      const d = a * h, f = a * u, g = o * h, _ = o * u;
      t[0] = c * h, t[4] = g * l - f, t[8] = d * l + _, t[1] = c * u, t[5] = _ * l + d, t[9] = f * l - g, t[2] = -l, t[6] = o * c, t[10] = a * c;
    } else if (e.order === "YZX") {
      const d = a * c, f = a * l, g = o * c, _ = o * l;
      t[0] = c * h, t[4] = _ - d * u, t[8] = g * u + f, t[1] = u, t[5] = a * h, t[9] = -o * h, t[2] = -l * h, t[6] = f * u + g, t[10] = d - _ * u;
    } else if (e.order === "XZY") {
      const d = a * c, f = a * l, g = o * c, _ = o * l;
      t[0] = c * h, t[4] = -u, t[8] = l * h, t[1] = d * u + _, t[5] = a * h, t[9] = f * u - g, t[2] = g * u - f, t[6] = o * h, t[10] = _ * u + d;
    }
    return t[3] = 0, t[7] = 0, t[11] = 0, t[12] = 0, t[13] = 0, t[14] = 0, t[15] = 1, this;
  }
  makeRotationFromQuaternion(e) {
    return this.compose(Yc, e, Kc);
  }
  lookAt(e, t, n) {
    const i = this.elements;
    return en.subVectors(e, t), en.lengthSq() === 0 && (en.z = 1), en.normalize(), Bn.crossVectors(n, en), Bn.lengthSq() === 0 && (Math.abs(n.z) === 1 ? en.x += 1e-4 : en.z += 1e-4, en.normalize(), Bn.crossVectors(n, en)), Bn.normalize(), Ms.crossVectors(en, Bn), i[0] = Bn.x, i[4] = Ms.x, i[8] = en.x, i[1] = Bn.y, i[5] = Ms.y, i[9] = en.y, i[2] = Bn.z, i[6] = Ms.z, i[10] = en.z, this;
  }
  multiply(e) {
    return this.multiplyMatrices(this, e);
  }
  premultiply(e) {
    return this.multiplyMatrices(e, this);
  }
  multiplyMatrices(e, t) {
    const n = e.elements, i = t.elements, r = this.elements, a = n[0], o = n[4], c = n[8], l = n[12], h = n[1], u = n[5], d = n[9], f = n[13], g = n[2], _ = n[6], m = n[10], p = n[14], E = n[3], y = n[7], A = n[11], O = n[15], w = i[0], R = i[4], k = i[8], Q = i[12], x = i[1], T = i[5], q = i[9], X = i[13], j = i[2], te = i[6], W = i[10], oe = i[14], K = i[3], ge = i[7], fe = i[11], Ae = i[15];
    return r[0] = a * w + o * x + c * j + l * K, r[4] = a * R + o * T + c * te + l * ge, r[8] = a * k + o * q + c * W + l * fe, r[12] = a * Q + o * X + c * oe + l * Ae, r[1] = h * w + u * x + d * j + f * K, r[5] = h * R + u * T + d * te + f * ge, r[9] = h * k + u * q + d * W + f * fe, r[13] = h * Q + u * X + d * oe + f * Ae, r[2] = g * w + _ * x + m * j + p * K, r[6] = g * R + _ * T + m * te + p * ge, r[10] = g * k + _ * q + m * W + p * fe, r[14] = g * Q + _ * X + m * oe + p * Ae, r[3] = E * w + y * x + A * j + O * K, r[7] = E * R + y * T + A * te + O * ge, r[11] = E * k + y * q + A * W + O * fe, r[15] = E * Q + y * X + A * oe + O * Ae, this;
  }
  multiplyScalar(e) {
    const t = this.elements;
    return t[0] *= e, t[4] *= e, t[8] *= e, t[12] *= e, t[1] *= e, t[5] *= e, t[9] *= e, t[13] *= e, t[2] *= e, t[6] *= e, t[10] *= e, t[14] *= e, t[3] *= e, t[7] *= e, t[11] *= e, t[15] *= e, this;
  }
  determinant() {
    const e = this.elements, t = e[0], n = e[4], i = e[8], r = e[12], a = e[1], o = e[5], c = e[9], l = e[13], h = e[2], u = e[6], d = e[10], f = e[14], g = e[3], _ = e[7], m = e[11], p = e[15];
    return g * (+r * c * u - i * l * u - r * o * d + n * l * d + i * o * f - n * c * f) + _ * (+t * c * f - t * l * d + r * a * d - i * a * f + i * l * h - r * c * h) + m * (+t * l * u - t * o * f - r * a * u + n * a * f + r * o * h - n * l * h) + p * (-i * o * h - t * c * u + t * o * d + i * a * u - n * a * d + n * c * h);
  }
  transpose() {
    const e = this.elements;
    let t;
    return t = e[1], e[1] = e[4], e[4] = t, t = e[2], e[2] = e[8], e[8] = t, t = e[6], e[6] = e[9], e[9] = t, t = e[3], e[3] = e[12], e[12] = t, t = e[7], e[7] = e[13], e[13] = t, t = e[11], e[11] = e[14], e[14] = t, this;
  }
  setPosition(e, t, n) {
    const i = this.elements;
    return e.isVector3 ? (i[12] = e.x, i[13] = e.y, i[14] = e.z) : (i[12] = e, i[13] = t, i[14] = n), this;
  }
  invert() {
    const e = this.elements, t = e[0], n = e[1], i = e[2], r = e[3], a = e[4], o = e[5], c = e[6], l = e[7], h = e[8], u = e[9], d = e[10], f = e[11], g = e[12], _ = e[13], m = e[14], p = e[15], E = u * m * l - _ * d * l + _ * c * f - o * m * f - u * c * p + o * d * p, y = g * d * l - h * m * l - g * c * f + a * m * f + h * c * p - a * d * p, A = h * _ * l - g * u * l + g * o * f - a * _ * f - h * o * p + a * u * p, O = g * u * c - h * _ * c - g * o * d + a * _ * d + h * o * m - a * u * m, w = t * E + n * y + i * A + r * O;
    if (w === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    const R = 1 / w;
    return e[0] = E * R, e[1] = (_ * d * r - u * m * r - _ * i * f + n * m * f + u * i * p - n * d * p) * R, e[2] = (o * m * r - _ * c * r + _ * i * l - n * m * l - o * i * p + n * c * p) * R, e[3] = (u * c * r - o * d * r - u * i * l + n * d * l + o * i * f - n * c * f) * R, e[4] = y * R, e[5] = (h * m * r - g * d * r + g * i * f - t * m * f - h * i * p + t * d * p) * R, e[6] = (g * c * r - a * m * r - g * i * l + t * m * l + a * i * p - t * c * p) * R, e[7] = (a * d * r - h * c * r + h * i * l - t * d * l - a * i * f + t * c * f) * R, e[8] = A * R, e[9] = (g * u * r - h * _ * r - g * n * f + t * _ * f + h * n * p - t * u * p) * R, e[10] = (a * _ * r - g * o * r + g * n * l - t * _ * l - a * n * p + t * o * p) * R, e[11] = (h * o * r - a * u * r - h * n * l + t * u * l + a * n * f - t * o * f) * R, e[12] = O * R, e[13] = (h * _ * i - g * u * i + g * n * d - t * _ * d - h * n * m + t * u * m) * R, e[14] = (g * o * i - a * _ * i - g * n * c + t * _ * c + a * n * m - t * o * m) * R, e[15] = (a * u * i - h * o * i + h * n * c - t * u * c - a * n * d + t * o * d) * R, this;
  }
  scale(e) {
    const t = this.elements, n = e.x, i = e.y, r = e.z;
    return t[0] *= n, t[4] *= i, t[8] *= r, t[1] *= n, t[5] *= i, t[9] *= r, t[2] *= n, t[6] *= i, t[10] *= r, t[3] *= n, t[7] *= i, t[11] *= r, this;
  }
  getMaxScaleOnAxis() {
    const e = this.elements, t = e[0] * e[0] + e[1] * e[1] + e[2] * e[2], n = e[4] * e[4] + e[5] * e[5] + e[6] * e[6], i = e[8] * e[8] + e[9] * e[9] + e[10] * e[10];
    return Math.sqrt(Math.max(t, n, i));
  }
  makeTranslation(e, t, n) {
    return e.isVector3 ? this.set(
      1,
      0,
      0,
      e.x,
      0,
      1,
      0,
      e.y,
      0,
      0,
      1,
      e.z,
      0,
      0,
      0,
      1
    ) : this.set(
      1,
      0,
      0,
      e,
      0,
      1,
      0,
      t,
      0,
      0,
      1,
      n,
      0,
      0,
      0,
      1
    ), this;
  }
  makeRotationX(e) {
    const t = Math.cos(e), n = Math.sin(e);
    return this.set(
      1,
      0,
      0,
      0,
      0,
      t,
      -n,
      0,
      0,
      n,
      t,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  makeRotationY(e) {
    const t = Math.cos(e), n = Math.sin(e);
    return this.set(
      t,
      0,
      n,
      0,
      0,
      1,
      0,
      0,
      -n,
      0,
      t,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  makeRotationZ(e) {
    const t = Math.cos(e), n = Math.sin(e);
    return this.set(
      t,
      -n,
      0,
      0,
      n,
      t,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  makeRotationAxis(e, t) {
    const n = Math.cos(t), i = Math.sin(t), r = 1 - n, a = e.x, o = e.y, c = e.z, l = r * a, h = r * o;
    return this.set(
      l * a + n,
      l * o - i * c,
      l * c + i * o,
      0,
      l * o + i * c,
      h * o + n,
      h * c - i * a,
      0,
      l * c - i * o,
      h * c + i * a,
      r * c * c + n,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  makeScale(e, t, n) {
    return this.set(
      e,
      0,
      0,
      0,
      0,
      t,
      0,
      0,
      0,
      0,
      n,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  makeShear(e, t, n, i, r, a) {
    return this.set(
      1,
      n,
      r,
      0,
      e,
      1,
      a,
      0,
      t,
      i,
      1,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  compose(e, t, n) {
    const i = this.elements, r = t._x, a = t._y, o = t._z, c = t._w, l = r + r, h = a + a, u = o + o, d = r * l, f = r * h, g = r * u, _ = a * h, m = a * u, p = o * u, E = c * l, y = c * h, A = c * u, O = n.x, w = n.y, R = n.z;
    return i[0] = (1 - (_ + p)) * O, i[1] = (f + A) * O, i[2] = (g - y) * O, i[3] = 0, i[4] = (f - A) * w, i[5] = (1 - (d + p)) * w, i[6] = (m + E) * w, i[7] = 0, i[8] = (g + y) * R, i[9] = (m - E) * R, i[10] = (1 - (d + _)) * R, i[11] = 0, i[12] = e.x, i[13] = e.y, i[14] = e.z, i[15] = 1, this;
  }
  decompose(e, t, n) {
    const i = this.elements;
    let r = gi.set(i[0], i[1], i[2]).length();
    const a = gi.set(i[4], i[5], i[6]).length(), o = gi.set(i[8], i[9], i[10]).length();
    this.determinant() < 0 && (r = -r), e.x = i[12], e.y = i[13], e.z = i[14], fn.copy(this);
    const l = 1 / r, h = 1 / a, u = 1 / o;
    return fn.elements[0] *= l, fn.elements[1] *= l, fn.elements[2] *= l, fn.elements[4] *= h, fn.elements[5] *= h, fn.elements[6] *= h, fn.elements[8] *= u, fn.elements[9] *= u, fn.elements[10] *= u, t.setFromRotationMatrix(fn), n.x = r, n.y = a, n.z = o, this;
  }
  makePerspective(e, t, n, i, r, a, o = 2e3) {
    const c = this.elements, l = 2 * r / (t - e), h = 2 * r / (n - i), u = (t + e) / (t - e), d = (n + i) / (n - i);
    let f, g;
    if (o === 2e3)
      f = -(a + r) / (a - r), g = -2 * a * r / (a - r);
    else if (o === 2001)
      f = -a / (a - r), g = -a * r / (a - r);
    else
      throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: " + o);
    return c[0] = l, c[4] = 0, c[8] = u, c[12] = 0, c[1] = 0, c[5] = h, c[9] = d, c[13] = 0, c[2] = 0, c[6] = 0, c[10] = f, c[14] = g, c[3] = 0, c[7] = 0, c[11] = -1, c[15] = 0, this;
  }
  makeOrthographic(e, t, n, i, r, a, o = 2e3) {
    const c = this.elements, l = 1 / (t - e), h = 1 / (n - i), u = 1 / (a - r), d = (t + e) * l, f = (n + i) * h;
    let g, _;
    if (o === 2e3)
      g = (a + r) * u, _ = -2 * u;
    else if (o === 2001)
      g = r * u, _ = -1 * u;
    else
      throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: " + o);
    return c[0] = 2 * l, c[4] = 0, c[8] = 0, c[12] = -d, c[1] = 0, c[5] = 2 * h, c[9] = 0, c[13] = -f, c[2] = 0, c[6] = 0, c[10] = _, c[14] = -g, c[3] = 0, c[7] = 0, c[11] = 0, c[15] = 1, this;
  }
  equals(e) {
    const t = this.elements, n = e.elements;
    for (let i = 0; i < 16; i++)
      if (t[i] !== n[i]) return !1;
    return !0;
  }
  fromArray(e, t = 0) {
    for (let n = 0; n < 16; n++)
      this.elements[n] = e[n + t];
    return this;
  }
  toArray(e = [], t = 0) {
    const n = this.elements;
    return e[t] = n[0], e[t + 1] = n[1], e[t + 2] = n[2], e[t + 3] = n[3], e[t + 4] = n[4], e[t + 5] = n[5], e[t + 6] = n[6], e[t + 7] = n[7], e[t + 8] = n[8], e[t + 9] = n[9], e[t + 10] = n[10], e[t + 11] = n[11], e[t + 12] = n[12], e[t + 13] = n[13], e[t + 14] = n[14], e[t + 15] = n[15], e;
  }
}
const gi = /* @__PURE__ */ new L(), fn = /* @__PURE__ */ new qe(), Yc = /* @__PURE__ */ new L(0, 0, 0), Kc = /* @__PURE__ */ new L(1, 1, 1), Bn = /* @__PURE__ */ new L(), Ms = /* @__PURE__ */ new L(), en = /* @__PURE__ */ new L(), Aa = /* @__PURE__ */ new qe(), ba = /* @__PURE__ */ new _n();
class xn {
  constructor(e = 0, t = 0, n = 0, i = xn.DEFAULT_ORDER) {
    this.isEuler = !0, this._x = e, this._y = t, this._z = n, this._order = i;
  }
  get x() {
    return this._x;
  }
  set x(e) {
    this._x = e, this._onChangeCallback();
  }
  get y() {
    return this._y;
  }
  set y(e) {
    this._y = e, this._onChangeCallback();
  }
  get z() {
    return this._z;
  }
  set z(e) {
    this._z = e, this._onChangeCallback();
  }
  get order() {
    return this._order;
  }
  set order(e) {
    this._order = e, this._onChangeCallback();
  }
  set(e, t, n, i = this._order) {
    return this._x = e, this._y = t, this._z = n, this._order = i, this._onChangeCallback(), this;
  }
  clone() {
    return new this.constructor(this._x, this._y, this._z, this._order);
  }
  copy(e) {
    return this._x = e._x, this._y = e._y, this._z = e._z, this._order = e._order, this._onChangeCallback(), this;
  }
  setFromRotationMatrix(e, t = this._order, n = !0) {
    const i = e.elements, r = i[0], a = i[4], o = i[8], c = i[1], l = i[5], h = i[9], u = i[2], d = i[6], f = i[10];
    switch (t) {
      case "XYZ":
        this._y = Math.asin(Vt(o, -1, 1)), Math.abs(o) < 0.9999999 ? (this._x = Math.atan2(-h, f), this._z = Math.atan2(-a, r)) : (this._x = Math.atan2(d, l), this._z = 0);
        break;
      case "YXZ":
        this._x = Math.asin(-Vt(h, -1, 1)), Math.abs(h) < 0.9999999 ? (this._y = Math.atan2(o, f), this._z = Math.atan2(c, l)) : (this._y = Math.atan2(-u, r), this._z = 0);
        break;
      case "ZXY":
        this._x = Math.asin(Vt(d, -1, 1)), Math.abs(d) < 0.9999999 ? (this._y = Math.atan2(-u, f), this._z = Math.atan2(-a, l)) : (this._y = 0, this._z = Math.atan2(c, r));
        break;
      case "ZYX":
        this._y = Math.asin(-Vt(u, -1, 1)), Math.abs(u) < 0.9999999 ? (this._x = Math.atan2(d, f), this._z = Math.atan2(c, r)) : (this._x = 0, this._z = Math.atan2(-a, l));
        break;
      case "YZX":
        this._z = Math.asin(Vt(c, -1, 1)), Math.abs(c) < 0.9999999 ? (this._x = Math.atan2(-h, l), this._y = Math.atan2(-u, r)) : (this._x = 0, this._y = Math.atan2(o, f));
        break;
      case "XZY":
        this._z = Math.asin(-Vt(a, -1, 1)), Math.abs(a) < 0.9999999 ? (this._x = Math.atan2(d, l), this._y = Math.atan2(o, r)) : (this._x = Math.atan2(-h, f), this._y = 0);
        break;
      default:
        console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: " + t);
    }
    return this._order = t, n === !0 && this._onChangeCallback(), this;
  }
  setFromQuaternion(e, t, n) {
    return Aa.makeRotationFromQuaternion(e), this.setFromRotationMatrix(Aa, t, n);
  }
  setFromVector3(e, t = this._order) {
    return this.set(e.x, e.y, e.z, t);
  }
  reorder(e) {
    return ba.setFromEuler(this), this.setFromQuaternion(ba, e);
  }
  equals(e) {
    return e._x === this._x && e._y === this._y && e._z === this._z && e._order === this._order;
  }
  fromArray(e) {
    return this._x = e[0], this._y = e[1], this._z = e[2], e[3] !== void 0 && (this._order = e[3]), this._onChangeCallback(), this;
  }
  toArray(e = [], t = 0) {
    return e[t] = this._x, e[t + 1] = this._y, e[t + 2] = this._z, e[t + 3] = this._order, e;
  }
  _onChange(e) {
    return this._onChangeCallback = e, this;
  }
  _onChangeCallback() {
  }
  *[Symbol.iterator]() {
    yield this._x, yield this._y, yield this._z, yield this._order;
  }
}
xn.DEFAULT_ORDER = "XYZ";
class sa {
  constructor() {
    this.mask = 1;
  }
  set(e) {
    this.mask = (1 << e | 0) >>> 0;
  }
  enable(e) {
    this.mask |= 1 << e | 0;
  }
  enableAll() {
    this.mask = -1;
  }
  toggle(e) {
    this.mask ^= 1 << e | 0;
  }
  disable(e) {
    this.mask &= ~(1 << e | 0);
  }
  disableAll() {
    this.mask = 0;
  }
  test(e) {
    return (this.mask & e.mask) !== 0;
  }
  isEnabled(e) {
    return (this.mask & (1 << e | 0)) !== 0;
  }
}
let Zc = 0;
const wa = /* @__PURE__ */ new L(), _i = /* @__PURE__ */ new _n(), Rn = /* @__PURE__ */ new qe(), ys = /* @__PURE__ */ new L(), Ji = /* @__PURE__ */ new L(), $c = /* @__PURE__ */ new L(), Jc = /* @__PURE__ */ new _n(), Ra = /* @__PURE__ */ new L(1, 0, 0), Ca = /* @__PURE__ */ new L(0, 1, 0), Ia = /* @__PURE__ */ new L(0, 0, 1), Pa = { type: "added" }, Qc = { type: "removed" }, xi = { type: "childadded", child: null }, _r = { type: "childremoved", child: null };
class St extends ri {
  constructor() {
    super(), this.isObject3D = !0, Object.defineProperty(this, "id", { value: Zc++ }), this.uuid = gn(), this.name = "", this.type = "Object3D", this.parent = null, this.children = [], this.up = St.DEFAULT_UP.clone();
    const e = new L(), t = new xn(), n = new _n(), i = new L(1, 1, 1);
    function r() {
      n.setFromEuler(t, !1);
    }
    function a() {
      t.setFromQuaternion(n, void 0, !1);
    }
    t._onChange(r), n._onChange(a), Object.defineProperties(this, {
      position: {
        configurable: !0,
        enumerable: !0,
        value: e
      },
      rotation: {
        configurable: !0,
        enumerable: !0,
        value: t
      },
      quaternion: {
        configurable: !0,
        enumerable: !0,
        value: n
      },
      scale: {
        configurable: !0,
        enumerable: !0,
        value: i
      },
      modelViewMatrix: {
        value: new qe()
      },
      normalMatrix: {
        value: new $e()
      }
    }), this.matrix = new qe(), this.matrixWorld = new qe(), this.matrixAutoUpdate = St.DEFAULT_MATRIX_AUTO_UPDATE, this.matrixWorldAutoUpdate = St.DEFAULT_MATRIX_WORLD_AUTO_UPDATE, this.matrixWorldNeedsUpdate = !1, this.layers = new sa(), this.visible = !0, this.castShadow = !1, this.receiveShadow = !1, this.frustumCulled = !0, this.renderOrder = 0, this.animations = [], this.userData = {};
  }
  onBeforeShadow() {
  }
  onAfterShadow() {
  }
  onBeforeRender() {
  }
  onAfterRender() {
  }
  applyMatrix4(e) {
    this.matrixAutoUpdate && this.updateMatrix(), this.matrix.premultiply(e), this.matrix.decompose(this.position, this.quaternion, this.scale);
  }
  applyQuaternion(e) {
    return this.quaternion.premultiply(e), this;
  }
  setRotationFromAxisAngle(e, t) {
    this.quaternion.setFromAxisAngle(e, t);
  }
  setRotationFromEuler(e) {
    this.quaternion.setFromEuler(e, !0);
  }
  setRotationFromMatrix(e) {
    this.quaternion.setFromRotationMatrix(e);
  }
  setRotationFromQuaternion(e) {
    this.quaternion.copy(e);
  }
  rotateOnAxis(e, t) {
    return _i.setFromAxisAngle(e, t), this.quaternion.multiply(_i), this;
  }
  rotateOnWorldAxis(e, t) {
    return _i.setFromAxisAngle(e, t), this.quaternion.premultiply(_i), this;
  }
  rotateX(e) {
    return this.rotateOnAxis(Ra, e);
  }
  rotateY(e) {
    return this.rotateOnAxis(Ca, e);
  }
  rotateZ(e) {
    return this.rotateOnAxis(Ia, e);
  }
  translateOnAxis(e, t) {
    return wa.copy(e).applyQuaternion(this.quaternion), this.position.add(wa.multiplyScalar(t)), this;
  }
  translateX(e) {
    return this.translateOnAxis(Ra, e);
  }
  translateY(e) {
    return this.translateOnAxis(Ca, e);
  }
  translateZ(e) {
    return this.translateOnAxis(Ia, e);
  }
  localToWorld(e) {
    return this.updateWorldMatrix(!0, !1), e.applyMatrix4(this.matrixWorld);
  }
  worldToLocal(e) {
    return this.updateWorldMatrix(!0, !1), e.applyMatrix4(Rn.copy(this.matrixWorld).invert());
  }
  lookAt(e, t, n) {
    e.isVector3 ? ys.copy(e) : ys.set(e, t, n);
    const i = this.parent;
    this.updateWorldMatrix(!0, !1), Ji.setFromMatrixPosition(this.matrixWorld), this.isCamera || this.isLight ? Rn.lookAt(Ji, ys, this.up) : Rn.lookAt(ys, Ji, this.up), this.quaternion.setFromRotationMatrix(Rn), i && (Rn.extractRotation(i.matrixWorld), _i.setFromRotationMatrix(Rn), this.quaternion.premultiply(_i.invert()));
  }
  add(e) {
    if (arguments.length > 1) {
      for (let t = 0; t < arguments.length; t++)
        this.add(arguments[t]);
      return this;
    }
    return e === this ? (console.error("THREE.Object3D.add: object can't be added as a child of itself.", e), this) : (e && e.isObject3D ? (e.removeFromParent(), e.parent = this, this.children.push(e), e.dispatchEvent(Pa), xi.child = e, this.dispatchEvent(xi), xi.child = null) : console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", e), this);
  }
  remove(e) {
    if (arguments.length > 1) {
      for (let n = 0; n < arguments.length; n++)
        this.remove(arguments[n]);
      return this;
    }
    const t = this.children.indexOf(e);
    return t !== -1 && (e.parent = null, this.children.splice(t, 1), e.dispatchEvent(Qc), _r.child = e, this.dispatchEvent(_r), _r.child = null), this;
  }
  removeFromParent() {
    const e = this.parent;
    return e !== null && e.remove(this), this;
  }
  clear() {
    return this.remove(...this.children);
  }
  attach(e) {
    return this.updateWorldMatrix(!0, !1), Rn.copy(this.matrixWorld).invert(), e.parent !== null && (e.parent.updateWorldMatrix(!0, !1), Rn.multiply(e.parent.matrixWorld)), e.applyMatrix4(Rn), e.removeFromParent(), e.parent = this, this.children.push(e), e.updateWorldMatrix(!1, !0), e.dispatchEvent(Pa), xi.child = e, this.dispatchEvent(xi), xi.child = null, this;
  }
  getObjectById(e) {
    return this.getObjectByProperty("id", e);
  }
  getObjectByName(e) {
    return this.getObjectByProperty("name", e);
  }
  getObjectByProperty(e, t) {
    if (this[e] === t) return this;
    for (let n = 0, i = this.children.length; n < i; n++) {
      const a = this.children[n].getObjectByProperty(e, t);
      if (a !== void 0)
        return a;
    }
  }
  getObjectsByProperty(e, t, n = []) {
    this[e] === t && n.push(this);
    const i = this.children;
    for (let r = 0, a = i.length; r < a; r++)
      i[r].getObjectsByProperty(e, t, n);
    return n;
  }
  getWorldPosition(e) {
    return this.updateWorldMatrix(!0, !1), e.setFromMatrixPosition(this.matrixWorld);
  }
  getWorldQuaternion(e) {
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(Ji, e, $c), e;
  }
  getWorldScale(e) {
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(Ji, Jc, e), e;
  }
  getWorldDirection(e) {
    this.updateWorldMatrix(!0, !1);
    const t = this.matrixWorld.elements;
    return e.set(t[8], t[9], t[10]).normalize();
  }
  raycast() {
  }
  traverse(e) {
    e(this);
    const t = this.children;
    for (let n = 0, i = t.length; n < i; n++)
      t[n].traverse(e);
  }
  traverseVisible(e) {
    if (this.visible === !1) return;
    e(this);
    const t = this.children;
    for (let n = 0, i = t.length; n < i; n++)
      t[n].traverseVisible(e);
  }
  traverseAncestors(e) {
    const t = this.parent;
    t !== null && (e(t), t.traverseAncestors(e));
  }
  updateMatrix() {
    this.matrix.compose(this.position, this.quaternion, this.scale), this.matrixWorldNeedsUpdate = !0;
  }
  updateMatrixWorld(e) {
    this.matrixAutoUpdate && this.updateMatrix(), (this.matrixWorldNeedsUpdate || e) && (this.matrixWorldAutoUpdate === !0 && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), this.matrixWorldNeedsUpdate = !1, e = !0);
    const t = this.children;
    for (let n = 0, i = t.length; n < i; n++)
      t[n].updateMatrixWorld(e);
  }
  updateWorldMatrix(e, t) {
    const n = this.parent;
    if (e === !0 && n !== null && n.updateWorldMatrix(!0, !1), this.matrixAutoUpdate && this.updateMatrix(), this.matrixWorldAutoUpdate === !0 && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), t === !0) {
      const i = this.children;
      for (let r = 0, a = i.length; r < a; r++)
        i[r].updateWorldMatrix(!1, !0);
    }
  }
  toJSON(e) {
    const t = e === void 0 || typeof e == "string", n = {};
    t && (e = {
      geometries: {},
      materials: {},
      textures: {},
      images: {},
      shapes: {},
      skeletons: {},
      animations: {},
      nodes: {}
    }, n.metadata = {
      version: 4.6,
      type: "Object",
      generator: "Object3D.toJSON"
    });
    const i = {};
    i.uuid = this.uuid, i.type = this.type, this.name !== "" && (i.name = this.name), this.castShadow === !0 && (i.castShadow = !0), this.receiveShadow === !0 && (i.receiveShadow = !0), this.visible === !1 && (i.visible = !1), this.frustumCulled === !1 && (i.frustumCulled = !1), this.renderOrder !== 0 && (i.renderOrder = this.renderOrder), Object.keys(this.userData).length > 0 && (i.userData = this.userData), i.layers = this.layers.mask, i.matrix = this.matrix.toArray(), i.up = this.up.toArray(), this.matrixAutoUpdate === !1 && (i.matrixAutoUpdate = !1), this.isInstancedMesh && (i.type = "InstancedMesh", i.count = this.count, i.instanceMatrix = this.instanceMatrix.toJSON(), this.instanceColor !== null && (i.instanceColor = this.instanceColor.toJSON())), this.isBatchedMesh && (i.type = "BatchedMesh", i.perObjectFrustumCulled = this.perObjectFrustumCulled, i.sortObjects = this.sortObjects, i.drawRanges = this._drawRanges, i.reservedRanges = this._reservedRanges, i.visibility = this._visibility, i.active = this._active, i.bounds = this._bounds.map((o) => ({
      boxInitialized: o.boxInitialized,
      boxMin: o.box.min.toArray(),
      boxMax: o.box.max.toArray(),
      sphereInitialized: o.sphereInitialized,
      sphereRadius: o.sphere.radius,
      sphereCenter: o.sphere.center.toArray()
    })), i.maxInstanceCount = this._maxInstanceCount, i.maxVertexCount = this._maxVertexCount, i.maxIndexCount = this._maxIndexCount, i.geometryInitialized = this._geometryInitialized, i.geometryCount = this._geometryCount, i.matricesTexture = this._matricesTexture.toJSON(e), this._colorsTexture !== null && (i.colorsTexture = this._colorsTexture.toJSON(e)), this.boundingSphere !== null && (i.boundingSphere = {
      center: i.boundingSphere.center.toArray(),
      radius: i.boundingSphere.radius
    }), this.boundingBox !== null && (i.boundingBox = {
      min: i.boundingBox.min.toArray(),
      max: i.boundingBox.max.toArray()
    }));
    function r(o, c) {
      return o[c.uuid] === void 0 && (o[c.uuid] = c.toJSON(e)), c.uuid;
    }
    if (this.isScene)
      this.background && (this.background.isColor ? i.background = this.background.toJSON() : this.background.isTexture && (i.background = this.background.toJSON(e).uuid)), this.environment && this.environment.isTexture && this.environment.isRenderTargetTexture !== !0 && (i.environment = this.environment.toJSON(e).uuid);
    else if (this.isMesh || this.isLine || this.isPoints) {
      i.geometry = r(e.geometries, this.geometry);
      const o = this.geometry.parameters;
      if (o !== void 0 && o.shapes !== void 0) {
        const c = o.shapes;
        if (Array.isArray(c))
          for (let l = 0, h = c.length; l < h; l++) {
            const u = c[l];
            r(e.shapes, u);
          }
        else
          r(e.shapes, c);
      }
    }
    if (this.isSkinnedMesh && (i.bindMode = this.bindMode, i.bindMatrix = this.bindMatrix.toArray(), this.skeleton !== void 0 && (r(e.skeletons, this.skeleton), i.skeleton = this.skeleton.uuid)), this.material !== void 0)
      if (Array.isArray(this.material)) {
        const o = [];
        for (let c = 0, l = this.material.length; c < l; c++)
          o.push(r(e.materials, this.material[c]));
        i.material = o;
      } else
        i.material = r(e.materials, this.material);
    if (this.children.length > 0) {
      i.children = [];
      for (let o = 0; o < this.children.length; o++)
        i.children.push(this.children[o].toJSON(e).object);
    }
    if (this.animations.length > 0) {
      i.animations = [];
      for (let o = 0; o < this.animations.length; o++) {
        const c = this.animations[o];
        i.animations.push(r(e.animations, c));
      }
    }
    if (t) {
      const o = a(e.geometries), c = a(e.materials), l = a(e.textures), h = a(e.images), u = a(e.shapes), d = a(e.skeletons), f = a(e.animations), g = a(e.nodes);
      o.length > 0 && (n.geometries = o), c.length > 0 && (n.materials = c), l.length > 0 && (n.textures = l), h.length > 0 && (n.images = h), u.length > 0 && (n.shapes = u), d.length > 0 && (n.skeletons = d), f.length > 0 && (n.animations = f), g.length > 0 && (n.nodes = g);
    }
    return n.object = i, n;
    function a(o) {
      const c = [];
      for (const l in o) {
        const h = o[l];
        delete h.metadata, c.push(h);
      }
      return c;
    }
  }
  clone(e) {
    return new this.constructor().copy(this, e);
  }
  copy(e, t = !0) {
    if (this.name = e.name, this.up.copy(e.up), this.position.copy(e.position), this.rotation.order = e.rotation.order, this.quaternion.copy(e.quaternion), this.scale.copy(e.scale), this.matrix.copy(e.matrix), this.matrixWorld.copy(e.matrixWorld), this.matrixAutoUpdate = e.matrixAutoUpdate, this.matrixWorldAutoUpdate = e.matrixWorldAutoUpdate, this.matrixWorldNeedsUpdate = e.matrixWorldNeedsUpdate, this.layers.mask = e.layers.mask, this.visible = e.visible, this.castShadow = e.castShadow, this.receiveShadow = e.receiveShadow, this.frustumCulled = e.frustumCulled, this.renderOrder = e.renderOrder, this.animations = e.animations.slice(), this.userData = JSON.parse(JSON.stringify(e.userData)), t === !0)
      for (let n = 0; n < e.children.length; n++) {
        const i = e.children[n];
        this.add(i.clone());
      }
    return this;
  }
}
St.DEFAULT_UP = /* @__PURE__ */ new L(0, 1, 0);
St.DEFAULT_MATRIX_AUTO_UPDATE = !0;
St.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = !0;
const pn = /* @__PURE__ */ new L(), Cn = /* @__PURE__ */ new L(), xr = /* @__PURE__ */ new L(), In = /* @__PURE__ */ new L(), vi = /* @__PURE__ */ new L(), Mi = /* @__PURE__ */ new L(), La = /* @__PURE__ */ new L(), vr = /* @__PURE__ */ new L(), Mr = /* @__PURE__ */ new L(), yr = /* @__PURE__ */ new L(), Sr = /* @__PURE__ */ new ut(), Er = /* @__PURE__ */ new ut(), Tr = /* @__PURE__ */ new ut();
class ln {
  constructor(e = new L(), t = new L(), n = new L()) {
    this.a = e, this.b = t, this.c = n;
  }
  static getNormal(e, t, n, i) {
    i.subVectors(n, t), pn.subVectors(e, t), i.cross(pn);
    const r = i.lengthSq();
    return r > 0 ? i.multiplyScalar(1 / Math.sqrt(r)) : i.set(0, 0, 0);
  }
  // static/instance method to calculate barycentric coordinates
  // based on: http://www.blackpawn.com/texts/pointinpoly/default.html
  static getBarycoord(e, t, n, i, r) {
    pn.subVectors(i, t), Cn.subVectors(n, t), xr.subVectors(e, t);
    const a = pn.dot(pn), o = pn.dot(Cn), c = pn.dot(xr), l = Cn.dot(Cn), h = Cn.dot(xr), u = a * l - o * o;
    if (u === 0)
      return r.set(0, 0, 0), null;
    const d = 1 / u, f = (l * c - o * h) * d, g = (a * h - o * c) * d;
    return r.set(1 - f - g, g, f);
  }
  static containsPoint(e, t, n, i) {
    return this.getBarycoord(e, t, n, i, In) === null ? !1 : In.x >= 0 && In.y >= 0 && In.x + In.y <= 1;
  }
  static getInterpolation(e, t, n, i, r, a, o, c) {
    return this.getBarycoord(e, t, n, i, In) === null ? (c.x = 0, c.y = 0, "z" in c && (c.z = 0), "w" in c && (c.w = 0), null) : (c.setScalar(0), c.addScaledVector(r, In.x), c.addScaledVector(a, In.y), c.addScaledVector(o, In.z), c);
  }
  static getInterpolatedAttribute(e, t, n, i, r, a) {
    return Sr.setScalar(0), Er.setScalar(0), Tr.setScalar(0), Sr.fromBufferAttribute(e, t), Er.fromBufferAttribute(e, n), Tr.fromBufferAttribute(e, i), a.setScalar(0), a.addScaledVector(Sr, r.x), a.addScaledVector(Er, r.y), a.addScaledVector(Tr, r.z), a;
  }
  static isFrontFacing(e, t, n, i) {
    return pn.subVectors(n, t), Cn.subVectors(e, t), pn.cross(Cn).dot(i) < 0;
  }
  set(e, t, n) {
    return this.a.copy(e), this.b.copy(t), this.c.copy(n), this;
  }
  setFromPointsAndIndices(e, t, n, i) {
    return this.a.copy(e[t]), this.b.copy(e[n]), this.c.copy(e[i]), this;
  }
  setFromAttributeAndIndices(e, t, n, i) {
    return this.a.fromBufferAttribute(e, t), this.b.fromBufferAttribute(e, n), this.c.fromBufferAttribute(e, i), this;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    return this.a.copy(e.a), this.b.copy(e.b), this.c.copy(e.c), this;
  }
  getArea() {
    return pn.subVectors(this.c, this.b), Cn.subVectors(this.a, this.b), pn.cross(Cn).length() * 0.5;
  }
  getMidpoint(e) {
    return e.addVectors(this.a, this.b).add(this.c).multiplyScalar(1 / 3);
  }
  getNormal(e) {
    return ln.getNormal(this.a, this.b, this.c, e);
  }
  getPlane(e) {
    return e.setFromCoplanarPoints(this.a, this.b, this.c);
  }
  getBarycoord(e, t) {
    return ln.getBarycoord(e, this.a, this.b, this.c, t);
  }
  getInterpolation(e, t, n, i, r) {
    return ln.getInterpolation(e, this.a, this.b, this.c, t, n, i, r);
  }
  containsPoint(e) {
    return ln.containsPoint(e, this.a, this.b, this.c);
  }
  isFrontFacing(e) {
    return ln.isFrontFacing(this.a, this.b, this.c, e);
  }
  intersectsBox(e) {
    return e.intersectsTriangle(this);
  }
  closestPointToPoint(e, t) {
    const n = this.a, i = this.b, r = this.c;
    let a, o;
    vi.subVectors(i, n), Mi.subVectors(r, n), vr.subVectors(e, n);
    const c = vi.dot(vr), l = Mi.dot(vr);
    if (c <= 0 && l <= 0)
      return t.copy(n);
    Mr.subVectors(e, i);
    const h = vi.dot(Mr), u = Mi.dot(Mr);
    if (h >= 0 && u <= h)
      return t.copy(i);
    const d = c * u - h * l;
    if (d <= 0 && c >= 0 && h <= 0)
      return a = c / (c - h), t.copy(n).addScaledVector(vi, a);
    yr.subVectors(e, r);
    const f = vi.dot(yr), g = Mi.dot(yr);
    if (g >= 0 && f <= g)
      return t.copy(r);
    const _ = f * l - c * g;
    if (_ <= 0 && l >= 0 && g <= 0)
      return o = l / (l - g), t.copy(n).addScaledVector(Mi, o);
    const m = h * g - f * u;
    if (m <= 0 && u - h >= 0 && f - g >= 0)
      return La.subVectors(r, i), o = (u - h) / (u - h + (f - g)), t.copy(i).addScaledVector(La, o);
    const p = 1 / (m + _ + d);
    return a = _ * p, o = d * p, t.copy(n).addScaledVector(vi, a).addScaledVector(Mi, o);
  }
  equals(e) {
    return e.a.equals(this.a) && e.b.equals(this.b) && e.c.equals(this.c);
  }
}
const Vo = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
}, On = { h: 0, s: 0, l: 0 }, Ss = { h: 0, s: 0, l: 0 };
function Ar(s, e, t) {
  return t < 0 && (t += 1), t > 1 && (t -= 1), t < 1 / 6 ? s + (e - s) * 6 * t : t < 1 / 2 ? e : t < 2 / 3 ? s + (e - s) * 6 * (2 / 3 - t) : s;
}
class Pe {
  constructor(e, t, n) {
    return this.isColor = !0, this.r = 1, this.g = 1, this.b = 1, this.set(e, t, n);
  }
  set(e, t, n) {
    if (t === void 0 && n === void 0) {
      const i = e;
      i && i.isColor ? this.copy(i) : typeof i == "number" ? this.setHex(i) : typeof i == "string" && this.setStyle(i);
    } else
      this.setRGB(e, t, n);
    return this;
  }
  setScalar(e) {
    return this.r = e, this.g = e, this.b = e, this;
  }
  setHex(e, t = At) {
    return e = Math.floor(e), this.r = (e >> 16 & 255) / 255, this.g = (e >> 8 & 255) / 255, this.b = (e & 255) / 255, it.toWorkingColorSpace(this, t), this;
  }
  setRGB(e, t, n, i = it.workingColorSpace) {
    return this.r = e, this.g = t, this.b = n, it.toWorkingColorSpace(this, i), this;
  }
  setHSL(e, t, n, i = it.workingColorSpace) {
    if (e = ia(e, 1), t = Vt(t, 0, 1), n = Vt(n, 0, 1), t === 0)
      this.r = this.g = this.b = n;
    else {
      const r = n <= 0.5 ? n * (1 + t) : n + t - n * t, a = 2 * n - r;
      this.r = Ar(a, r, e + 1 / 3), this.g = Ar(a, r, e), this.b = Ar(a, r, e - 1 / 3);
    }
    return it.toWorkingColorSpace(this, i), this;
  }
  setStyle(e, t = At) {
    function n(r) {
      r !== void 0 && parseFloat(r) < 1 && console.warn("THREE.Color: Alpha component of " + e + " will be ignored.");
    }
    let i;
    if (i = /^(\w+)\(([^\)]*)\)/.exec(e)) {
      let r;
      const a = i[1], o = i[2];
      switch (a) {
        case "rgb":
        case "rgba":
          if (r = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))
            return n(r[4]), this.setRGB(
              Math.min(255, parseInt(r[1], 10)) / 255,
              Math.min(255, parseInt(r[2], 10)) / 255,
              Math.min(255, parseInt(r[3], 10)) / 255,
              t
            );
          if (r = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))
            return n(r[4]), this.setRGB(
              Math.min(100, parseInt(r[1], 10)) / 100,
              Math.min(100, parseInt(r[2], 10)) / 100,
              Math.min(100, parseInt(r[3], 10)) / 100,
              t
            );
          break;
        case "hsl":
        case "hsla":
          if (r = /^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))
            return n(r[4]), this.setHSL(
              parseFloat(r[1]) / 360,
              parseFloat(r[2]) / 100,
              parseFloat(r[3]) / 100,
              t
            );
          break;
        default:
          console.warn("THREE.Color: Unknown color model " + e);
      }
    } else if (i = /^\#([A-Fa-f\d]+)$/.exec(e)) {
      const r = i[1], a = r.length;
      if (a === 3)
        return this.setRGB(
          parseInt(r.charAt(0), 16) / 15,
          parseInt(r.charAt(1), 16) / 15,
          parseInt(r.charAt(2), 16) / 15,
          t
        );
      if (a === 6)
        return this.setHex(parseInt(r, 16), t);
      console.warn("THREE.Color: Invalid hex color " + e);
    } else if (e && e.length > 0)
      return this.setColorName(e, t);
    return this;
  }
  setColorName(e, t = At) {
    const n = Vo[e.toLowerCase()];
    return n !== void 0 ? this.setHex(n, t) : console.warn("THREE.Color: Unknown color " + e), this;
  }
  clone() {
    return new this.constructor(this.r, this.g, this.b);
  }
  copy(e) {
    return this.r = e.r, this.g = e.g, this.b = e.b, this;
  }
  copySRGBToLinear(e) {
    return this.r = Ii(e.r), this.g = Ii(e.g), this.b = Ii(e.b), this;
  }
  copyLinearToSRGB(e) {
    return this.r = lr(e.r), this.g = lr(e.g), this.b = lr(e.b), this;
  }
  convertSRGBToLinear() {
    return this.copySRGBToLinear(this), this;
  }
  convertLinearToSRGB() {
    return this.copyLinearToSRGB(this), this;
  }
  getHex(e = At) {
    return it.fromWorkingColorSpace(Ht.copy(this), e), Math.round(Vt(Ht.r * 255, 0, 255)) * 65536 + Math.round(Vt(Ht.g * 255, 0, 255)) * 256 + Math.round(Vt(Ht.b * 255, 0, 255));
  }
  getHexString(e = At) {
    return ("000000" + this.getHex(e).toString(16)).slice(-6);
  }
  getHSL(e, t = it.workingColorSpace) {
    it.fromWorkingColorSpace(Ht.copy(this), t);
    const n = Ht.r, i = Ht.g, r = Ht.b, a = Math.max(n, i, r), o = Math.min(n, i, r);
    let c, l;
    const h = (o + a) / 2;
    if (o === a)
      c = 0, l = 0;
    else {
      const u = a - o;
      switch (l = h <= 0.5 ? u / (a + o) : u / (2 - a - o), a) {
        case n:
          c = (i - r) / u + (i < r ? 6 : 0);
          break;
        case i:
          c = (r - n) / u + 2;
          break;
        case r:
          c = (n - i) / u + 4;
          break;
      }
      c /= 6;
    }
    return e.h = c, e.s = l, e.l = h, e;
  }
  getRGB(e, t = it.workingColorSpace) {
    return it.fromWorkingColorSpace(Ht.copy(this), t), e.r = Ht.r, e.g = Ht.g, e.b = Ht.b, e;
  }
  getStyle(e = At) {
    it.fromWorkingColorSpace(Ht.copy(this), e);
    const t = Ht.r, n = Ht.g, i = Ht.b;
    return e !== At ? `color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})` : `rgb(${Math.round(t * 255)},${Math.round(n * 255)},${Math.round(i * 255)})`;
  }
  offsetHSL(e, t, n) {
    return this.getHSL(On), this.setHSL(On.h + e, On.s + t, On.l + n);
  }
  add(e) {
    return this.r += e.r, this.g += e.g, this.b += e.b, this;
  }
  addColors(e, t) {
    return this.r = e.r + t.r, this.g = e.g + t.g, this.b = e.b + t.b, this;
  }
  addScalar(e) {
    return this.r += e, this.g += e, this.b += e, this;
  }
  sub(e) {
    return this.r = Math.max(0, this.r - e.r), this.g = Math.max(0, this.g - e.g), this.b = Math.max(0, this.b - e.b), this;
  }
  multiply(e) {
    return this.r *= e.r, this.g *= e.g, this.b *= e.b, this;
  }
  multiplyScalar(e) {
    return this.r *= e, this.g *= e, this.b *= e, this;
  }
  lerp(e, t) {
    return this.r += (e.r - this.r) * t, this.g += (e.g - this.g) * t, this.b += (e.b - this.b) * t, this;
  }
  lerpColors(e, t, n) {
    return this.r = e.r + (t.r - e.r) * n, this.g = e.g + (t.g - e.g) * n, this.b = e.b + (t.b - e.b) * n, this;
  }
  lerpHSL(e, t) {
    this.getHSL(On), e.getHSL(Ss);
    const n = os(On.h, Ss.h, t), i = os(On.s, Ss.s, t), r = os(On.l, Ss.l, t);
    return this.setHSL(n, i, r), this;
  }
  setFromVector3(e) {
    return this.r = e.x, this.g = e.y, this.b = e.z, this;
  }
  applyMatrix3(e) {
    const t = this.r, n = this.g, i = this.b, r = e.elements;
    return this.r = r[0] * t + r[3] * n + r[6] * i, this.g = r[1] * t + r[4] * n + r[7] * i, this.b = r[2] * t + r[5] * n + r[8] * i, this;
  }
  equals(e) {
    return e.r === this.r && e.g === this.g && e.b === this.b;
  }
  fromArray(e, t = 0) {
    return this.r = e[t], this.g = e[t + 1], this.b = e[t + 2], this;
  }
  toArray(e = [], t = 0) {
    return e[t] = this.r, e[t + 1] = this.g, e[t + 2] = this.b, e;
  }
  fromBufferAttribute(e, t) {
    return this.r = e.getX(t), this.g = e.getY(t), this.b = e.getZ(t), this;
  }
  toJSON() {
    return this.getHex();
  }
  *[Symbol.iterator]() {
    yield this.r, yield this.g, yield this.b;
  }
}
const Ht = /* @__PURE__ */ new Pe();
Pe.NAMES = Vo;
let el = 0;
class nn extends ri {
  constructor() {
    super(), this.isMaterial = !0, Object.defineProperty(this, "id", { value: el++ }), this.uuid = gn(), this.name = "", this.type = "Material", this.blending = 1, this.side = 0, this.vertexColors = !1, this.opacity = 1, this.transparent = !1, this.alphaHash = !1, this.blendSrc = 204, this.blendDst = 205, this.blendEquation = 100, this.blendSrcAlpha = null, this.blendDstAlpha = null, this.blendEquationAlpha = null, this.blendColor = new Pe(0, 0, 0), this.blendAlpha = 0, this.depthFunc = 3, this.depthTest = !0, this.depthWrite = !0, this.stencilWriteMask = 255, this.stencilFunc = 519, this.stencilRef = 0, this.stencilFuncMask = 255, this.stencilFail = 7680, this.stencilZFail = 7680, this.stencilZPass = 7680, this.stencilWrite = !1, this.clippingPlanes = null, this.clipIntersection = !1, this.clipShadows = !1, this.shadowSide = null, this.colorWrite = !0, this.precision = null, this.polygonOffset = !1, this.polygonOffsetFactor = 0, this.polygonOffsetUnits = 0, this.dithering = !1, this.alphaToCoverage = !1, this.premultipliedAlpha = !1, this.forceSinglePass = !1, this.visible = !0, this.toneMapped = !0, this.userData = {}, this.version = 0, this._alphaTest = 0;
  }
  get alphaTest() {
    return this._alphaTest;
  }
  set alphaTest(e) {
    this._alphaTest > 0 != e > 0 && this.version++, this._alphaTest = e;
  }
  // onBeforeRender and onBeforeCompile only supported in WebGLRenderer
  onBeforeRender() {
  }
  onBeforeCompile() {
  }
  customProgramCacheKey() {
    return this.onBeforeCompile.toString();
  }
  setValues(e) {
    if (e !== void 0)
      for (const t in e) {
        const n = e[t];
        if (n === void 0) {
          console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);
          continue;
        }
        const i = this[t];
        if (i === void 0) {
          console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);
          continue;
        }
        i && i.isColor ? i.set(n) : i && i.isVector3 && n && n.isVector3 ? i.copy(n) : this[t] = n;
      }
  }
  toJSON(e) {
    const t = e === void 0 || typeof e == "string";
    t && (e = {
      textures: {},
      images: {}
    });
    const n = {
      metadata: {
        version: 4.6,
        type: "Material",
        generator: "Material.toJSON"
      }
    };
    n.uuid = this.uuid, n.type = this.type, this.name !== "" && (n.name = this.name), this.color && this.color.isColor && (n.color = this.color.getHex()), this.roughness !== void 0 && (n.roughness = this.roughness), this.metalness !== void 0 && (n.metalness = this.metalness), this.sheen !== void 0 && (n.sheen = this.sheen), this.sheenColor && this.sheenColor.isColor && (n.sheenColor = this.sheenColor.getHex()), this.sheenRoughness !== void 0 && (n.sheenRoughness = this.sheenRoughness), this.emissive && this.emissive.isColor && (n.emissive = this.emissive.getHex()), this.emissiveIntensity !== void 0 && this.emissiveIntensity !== 1 && (n.emissiveIntensity = this.emissiveIntensity), this.specular && this.specular.isColor && (n.specular = this.specular.getHex()), this.specularIntensity !== void 0 && (n.specularIntensity = this.specularIntensity), this.specularColor && this.specularColor.isColor && (n.specularColor = this.specularColor.getHex()), this.shininess !== void 0 && (n.shininess = this.shininess), this.clearcoat !== void 0 && (n.clearcoat = this.clearcoat), this.clearcoatRoughness !== void 0 && (n.clearcoatRoughness = this.clearcoatRoughness), this.clearcoatMap && this.clearcoatMap.isTexture && (n.clearcoatMap = this.clearcoatMap.toJSON(e).uuid), this.clearcoatRoughnessMap && this.clearcoatRoughnessMap.isTexture && (n.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON(e).uuid), this.clearcoatNormalMap && this.clearcoatNormalMap.isTexture && (n.clearcoatNormalMap = this.clearcoatNormalMap.toJSON(e).uuid, n.clearcoatNormalScale = this.clearcoatNormalScale.toArray()), this.dispersion !== void 0 && (n.dispersion = this.dispersion), this.iridescence !== void 0 && (n.iridescence = this.iridescence), this.iridescenceIOR !== void 0 && (n.iridescenceIOR = this.iridescenceIOR), this.iridescenceThicknessRange !== void 0 && (n.iridescenceThicknessRange = this.iridescenceThicknessRange), this.iridescenceMap && this.iridescenceMap.isTexture && (n.iridescenceMap = this.iridescenceMap.toJSON(e).uuid), this.iridescenceThicknessMap && this.iridescenceThicknessMap.isTexture && (n.iridescenceThicknessMap = this.iridescenceThicknessMap.toJSON(e).uuid), this.anisotropy !== void 0 && (n.anisotropy = this.anisotropy), this.anisotropyRotation !== void 0 && (n.anisotropyRotation = this.anisotropyRotation), this.anisotropyMap && this.anisotropyMap.isTexture && (n.anisotropyMap = this.anisotropyMap.toJSON(e).uuid), this.map && this.map.isTexture && (n.map = this.map.toJSON(e).uuid), this.matcap && this.matcap.isTexture && (n.matcap = this.matcap.toJSON(e).uuid), this.alphaMap && this.alphaMap.isTexture && (n.alphaMap = this.alphaMap.toJSON(e).uuid), this.lightMap && this.lightMap.isTexture && (n.lightMap = this.lightMap.toJSON(e).uuid, n.lightMapIntensity = this.lightMapIntensity), this.aoMap && this.aoMap.isTexture && (n.aoMap = this.aoMap.toJSON(e).uuid, n.aoMapIntensity = this.aoMapIntensity), this.bumpMap && this.bumpMap.isTexture && (n.bumpMap = this.bumpMap.toJSON(e).uuid, n.bumpScale = this.bumpScale), this.normalMap && this.normalMap.isTexture && (n.normalMap = this.normalMap.toJSON(e).uuid, n.normalMapType = this.normalMapType, n.normalScale = this.normalScale.toArray()), this.displacementMap && this.displacementMap.isTexture && (n.displacementMap = this.displacementMap.toJSON(e).uuid, n.displacementScale = this.displacementScale, n.displacementBias = this.displacementBias), this.roughnessMap && this.roughnessMap.isTexture && (n.roughnessMap = this.roughnessMap.toJSON(e).uuid), this.metalnessMap && this.metalnessMap.isTexture && (n.metalnessMap = this.metalnessMap.toJSON(e).uuid), this.emissiveMap && this.emissiveMap.isTexture && (n.emissiveMap = this.emissiveMap.toJSON(e).uuid), this.specularMap && this.specularMap.isTexture && (n.specularMap = this.specularMap.toJSON(e).uuid), this.specularIntensityMap && this.specularIntensityMap.isTexture && (n.specularIntensityMap = this.specularIntensityMap.toJSON(e).uuid), this.specularColorMap && this.specularColorMap.isTexture && (n.specularColorMap = this.specularColorMap.toJSON(e).uuid), this.envMap && this.envMap.isTexture && (n.envMap = this.envMap.toJSON(e).uuid, this.combine !== void 0 && (n.combine = this.combine)), this.envMapRotation !== void 0 && (n.envMapRotation = this.envMapRotation.toArray()), this.envMapIntensity !== void 0 && (n.envMapIntensity = this.envMapIntensity), this.reflectivity !== void 0 && (n.reflectivity = this.reflectivity), this.refractionRatio !== void 0 && (n.refractionRatio = this.refractionRatio), this.gradientMap && this.gradientMap.isTexture && (n.gradientMap = this.gradientMap.toJSON(e).uuid), this.transmission !== void 0 && (n.transmission = this.transmission), this.transmissionMap && this.transmissionMap.isTexture && (n.transmissionMap = this.transmissionMap.toJSON(e).uuid), this.thickness !== void 0 && (n.thickness = this.thickness), this.thicknessMap && this.thicknessMap.isTexture && (n.thicknessMap = this.thicknessMap.toJSON(e).uuid), this.attenuationDistance !== void 0 && this.attenuationDistance !== 1 / 0 && (n.attenuationDistance = this.attenuationDistance), this.attenuationColor !== void 0 && (n.attenuationColor = this.attenuationColor.getHex()), this.size !== void 0 && (n.size = this.size), this.shadowSide !== null && (n.shadowSide = this.shadowSide), this.sizeAttenuation !== void 0 && (n.sizeAttenuation = this.sizeAttenuation), this.blending !== 1 && (n.blending = this.blending), this.side !== 0 && (n.side = this.side), this.vertexColors === !0 && (n.vertexColors = !0), this.opacity < 1 && (n.opacity = this.opacity), this.transparent === !0 && (n.transparent = !0), this.blendSrc !== 204 && (n.blendSrc = this.blendSrc), this.blendDst !== 205 && (n.blendDst = this.blendDst), this.blendEquation !== 100 && (n.blendEquation = this.blendEquation), this.blendSrcAlpha !== null && (n.blendSrcAlpha = this.blendSrcAlpha), this.blendDstAlpha !== null && (n.blendDstAlpha = this.blendDstAlpha), this.blendEquationAlpha !== null && (n.blendEquationAlpha = this.blendEquationAlpha), this.blendColor && this.blendColor.isColor && (n.blendColor = this.blendColor.getHex()), this.blendAlpha !== 0 && (n.blendAlpha = this.blendAlpha), this.depthFunc !== 3 && (n.depthFunc = this.depthFunc), this.depthTest === !1 && (n.depthTest = this.depthTest), this.depthWrite === !1 && (n.depthWrite = this.depthWrite), this.colorWrite === !1 && (n.colorWrite = this.colorWrite), this.stencilWriteMask !== 255 && (n.stencilWriteMask = this.stencilWriteMask), this.stencilFunc !== 519 && (n.stencilFunc = this.stencilFunc), this.stencilRef !== 0 && (n.stencilRef = this.stencilRef), this.stencilFuncMask !== 255 && (n.stencilFuncMask = this.stencilFuncMask), this.stencilFail !== 7680 && (n.stencilFail = this.stencilFail), this.stencilZFail !== 7680 && (n.stencilZFail = this.stencilZFail), this.stencilZPass !== 7680 && (n.stencilZPass = this.stencilZPass), this.stencilWrite === !0 && (n.stencilWrite = this.stencilWrite), this.rotation !== void 0 && this.rotation !== 0 && (n.rotation = this.rotation), this.polygonOffset === !0 && (n.polygonOffset = !0), this.polygonOffsetFactor !== 0 && (n.polygonOffsetFactor = this.polygonOffsetFactor), this.polygonOffsetUnits !== 0 && (n.polygonOffsetUnits = this.polygonOffsetUnits), this.linewidth !== void 0 && this.linewidth !== 1 && (n.linewidth = this.linewidth), this.dashSize !== void 0 && (n.dashSize = this.dashSize), this.gapSize !== void 0 && (n.gapSize = this.gapSize), this.scale !== void 0 && (n.scale = this.scale), this.dithering === !0 && (n.dithering = !0), this.alphaTest > 0 && (n.alphaTest = this.alphaTest), this.alphaHash === !0 && (n.alphaHash = !0), this.alphaToCoverage === !0 && (n.alphaToCoverage = !0), this.premultipliedAlpha === !0 && (n.premultipliedAlpha = !0), this.forceSinglePass === !0 && (n.forceSinglePass = !0), this.wireframe === !0 && (n.wireframe = !0), this.wireframeLinewidth > 1 && (n.wireframeLinewidth = this.wireframeLinewidth), this.wireframeLinecap !== "round" && (n.wireframeLinecap = this.wireframeLinecap), this.wireframeLinejoin !== "round" && (n.wireframeLinejoin = this.wireframeLinejoin), this.flatShading === !0 && (n.flatShading = !0), this.visible === !1 && (n.visible = !1), this.toneMapped === !1 && (n.toneMapped = !1), this.fog === !1 && (n.fog = !1), Object.keys(this.userData).length > 0 && (n.userData = this.userData);
    function i(r) {
      const a = [];
      for (const o in r) {
        const c = r[o];
        delete c.metadata, a.push(c);
      }
      return a;
    }
    if (t) {
      const r = i(e.textures), a = i(e.images);
      r.length > 0 && (n.textures = r), a.length > 0 && (n.images = a);
    }
    return n;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    this.name = e.name, this.blending = e.blending, this.side = e.side, this.vertexColors = e.vertexColors, this.opacity = e.opacity, this.transparent = e.transparent, this.blendSrc = e.blendSrc, this.blendDst = e.blendDst, this.blendEquation = e.blendEquation, this.blendSrcAlpha = e.blendSrcAlpha, this.blendDstAlpha = e.blendDstAlpha, this.blendEquationAlpha = e.blendEquationAlpha, this.blendColor.copy(e.blendColor), this.blendAlpha = e.blendAlpha, this.depthFunc = e.depthFunc, this.depthTest = e.depthTest, this.depthWrite = e.depthWrite, this.stencilWriteMask = e.stencilWriteMask, this.stencilFunc = e.stencilFunc, this.stencilRef = e.stencilRef, this.stencilFuncMask = e.stencilFuncMask, this.stencilFail = e.stencilFail, this.stencilZFail = e.stencilZFail, this.stencilZPass = e.stencilZPass, this.stencilWrite = e.stencilWrite;
    const t = e.clippingPlanes;
    let n = null;
    if (t !== null) {
      const i = t.length;
      n = new Array(i);
      for (let r = 0; r !== i; ++r)
        n[r] = t[r].clone();
    }
    return this.clippingPlanes = n, this.clipIntersection = e.clipIntersection, this.clipShadows = e.clipShadows, this.shadowSide = e.shadowSide, this.colorWrite = e.colorWrite, this.precision = e.precision, this.polygonOffset = e.polygonOffset, this.polygonOffsetFactor = e.polygonOffsetFactor, this.polygonOffsetUnits = e.polygonOffsetUnits, this.dithering = e.dithering, this.alphaTest = e.alphaTest, this.alphaHash = e.alphaHash, this.alphaToCoverage = e.alphaToCoverage, this.premultipliedAlpha = e.premultipliedAlpha, this.forceSinglePass = e.forceSinglePass, this.visible = e.visible, this.toneMapped = e.toneMapped, this.userData = JSON.parse(JSON.stringify(e.userData)), this;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
  set needsUpdate(e) {
    e === !0 && this.version++;
  }
  onBuild() {
    console.warn("Material: onBuild() has been removed.");
  }
}
class bt extends nn {
  constructor(e) {
    super(), this.isMeshBasicMaterial = !0, this.type = "MeshBasicMaterial", this.color = new Pe(16777215), this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new xn(), this.combine = 0, this.reflectivity = 1, this.refractionRatio = 0.98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.specularMap = e.specularMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapRotation.copy(e.envMapRotation), this.combine = e.combine, this.reflectivity = e.reflectivity, this.refractionRatio = e.refractionRatio, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.fog = e.fog, this;
  }
}
const wt = /* @__PURE__ */ new L(), Es = /* @__PURE__ */ new Xe();
class jt {
  constructor(e, t, n = !1) {
    if (Array.isArray(e))
      throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");
    this.isBufferAttribute = !0, this.name = "", this.array = e, this.itemSize = t, this.count = e !== void 0 ? e.length / t : 0, this.normalized = n, this.usage = 35044, this.updateRanges = [], this.gpuType = 1015, this.version = 0;
  }
  onUploadCallback() {
  }
  set needsUpdate(e) {
    e === !0 && this.version++;
  }
  setUsage(e) {
    return this.usage = e, this;
  }
  addUpdateRange(e, t) {
    this.updateRanges.push({ start: e, count: t });
  }
  clearUpdateRanges() {
    this.updateRanges.length = 0;
  }
  copy(e) {
    return this.name = e.name, this.array = new e.array.constructor(e.array), this.itemSize = e.itemSize, this.count = e.count, this.normalized = e.normalized, this.usage = e.usage, this.gpuType = e.gpuType, this;
  }
  copyAt(e, t, n) {
    e *= this.itemSize, n *= t.itemSize;
    for (let i = 0, r = this.itemSize; i < r; i++)
      this.array[e + i] = t.array[n + i];
    return this;
  }
  copyArray(e) {
    return this.array.set(e), this;
  }
  applyMatrix3(e) {
    if (this.itemSize === 2)
      for (let t = 0, n = this.count; t < n; t++)
        Es.fromBufferAttribute(this, t), Es.applyMatrix3(e), this.setXY(t, Es.x, Es.y);
    else if (this.itemSize === 3)
      for (let t = 0, n = this.count; t < n; t++)
        wt.fromBufferAttribute(this, t), wt.applyMatrix3(e), this.setXYZ(t, wt.x, wt.y, wt.z);
    return this;
  }
  applyMatrix4(e) {
    for (let t = 0, n = this.count; t < n; t++)
      wt.fromBufferAttribute(this, t), wt.applyMatrix4(e), this.setXYZ(t, wt.x, wt.y, wt.z);
    return this;
  }
  applyNormalMatrix(e) {
    for (let t = 0, n = this.count; t < n; t++)
      wt.fromBufferAttribute(this, t), wt.applyNormalMatrix(e), this.setXYZ(t, wt.x, wt.y, wt.z);
    return this;
  }
  transformDirection(e) {
    for (let t = 0, n = this.count; t < n; t++)
      wt.fromBufferAttribute(this, t), wt.transformDirection(e), this.setXYZ(t, wt.x, wt.y, wt.z);
    return this;
  }
  set(e, t = 0) {
    return this.array.set(e, t), this;
  }
  getComponent(e, t) {
    let n = this.array[e * this.itemSize + t];
    return this.normalized && (n = mn(n, this.array)), n;
  }
  setComponent(e, t, n) {
    return this.normalized && (n = mt(n, this.array)), this.array[e * this.itemSize + t] = n, this;
  }
  getX(e) {
    let t = this.array[e * this.itemSize];
    return this.normalized && (t = mn(t, this.array)), t;
  }
  setX(e, t) {
    return this.normalized && (t = mt(t, this.array)), this.array[e * this.itemSize] = t, this;
  }
  getY(e) {
    let t = this.array[e * this.itemSize + 1];
    return this.normalized && (t = mn(t, this.array)), t;
  }
  setY(e, t) {
    return this.normalized && (t = mt(t, this.array)), this.array[e * this.itemSize + 1] = t, this;
  }
  getZ(e) {
    let t = this.array[e * this.itemSize + 2];
    return this.normalized && (t = mn(t, this.array)), t;
  }
  setZ(e, t) {
    return this.normalized && (t = mt(t, this.array)), this.array[e * this.itemSize + 2] = t, this;
  }
  getW(e) {
    let t = this.array[e * this.itemSize + 3];
    return this.normalized && (t = mn(t, this.array)), t;
  }
  setW(e, t) {
    return this.normalized && (t = mt(t, this.array)), this.array[e * this.itemSize + 3] = t, this;
  }
  setXY(e, t, n) {
    return e *= this.itemSize, this.normalized && (t = mt(t, this.array), n = mt(n, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this;
  }
  setXYZ(e, t, n, i) {
    return e *= this.itemSize, this.normalized && (t = mt(t, this.array), n = mt(n, this.array), i = mt(i, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this.array[e + 2] = i, this;
  }
  setXYZW(e, t, n, i, r) {
    return e *= this.itemSize, this.normalized && (t = mt(t, this.array), n = mt(n, this.array), i = mt(i, this.array), r = mt(r, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this.array[e + 2] = i, this.array[e + 3] = r, this;
  }
  onUpload(e) {
    return this.onUploadCallback = e, this;
  }
  clone() {
    return new this.constructor(this.array, this.itemSize).copy(this);
  }
  toJSON() {
    const e = {
      itemSize: this.itemSize,
      type: this.array.constructor.name,
      array: Array.from(this.array),
      normalized: this.normalized
    };
    return this.name !== "" && (e.name = this.name), this.usage !== 35044 && (e.usage = this.usage), e;
  }
}
class Wo extends jt {
  constructor(e, t, n) {
    super(new Uint16Array(e), t, n);
  }
}
class Xo extends jt {
  constructor(e, t, n) {
    super(new Uint32Array(e), t, n);
  }
}
class dt extends jt {
  constructor(e, t, n) {
    super(new Float32Array(e), t, n);
  }
}
let tl = 0;
const an = /* @__PURE__ */ new qe(), br = /* @__PURE__ */ new St(), yi = /* @__PURE__ */ new L(), tn = /* @__PURE__ */ new vn(), Qi = /* @__PURE__ */ new vn(), Dt = /* @__PURE__ */ new L();
class Rt extends ri {
  constructor() {
    super(), this.isBufferGeometry = !0, Object.defineProperty(this, "id", { value: tl++ }), this.uuid = gn(), this.name = "", this.type = "BufferGeometry", this.index = null, this.attributes = {}, this.morphAttributes = {}, this.morphTargetsRelative = !1, this.groups = [], this.boundingBox = null, this.boundingSphere = null, this.drawRange = { start: 0, count: 1 / 0 }, this.userData = {};
  }
  getIndex() {
    return this.index;
  }
  setIndex(e) {
    return Array.isArray(e) ? this.index = new (zo(e) ? Xo : Wo)(e, 1) : this.index = e, this;
  }
  getAttribute(e) {
    return this.attributes[e];
  }
  setAttribute(e, t) {
    return this.attributes[e] = t, this;
  }
  deleteAttribute(e) {
    return delete this.attributes[e], this;
  }
  hasAttribute(e) {
    return this.attributes[e] !== void 0;
  }
  addGroup(e, t, n = 0) {
    this.groups.push({
      start: e,
      count: t,
      materialIndex: n
    });
  }
  clearGroups() {
    this.groups = [];
  }
  setDrawRange(e, t) {
    this.drawRange.start = e, this.drawRange.count = t;
  }
  applyMatrix4(e) {
    const t = this.attributes.position;
    t !== void 0 && (t.applyMatrix4(e), t.needsUpdate = !0);
    const n = this.attributes.normal;
    if (n !== void 0) {
      const r = new $e().getNormalMatrix(e);
      n.applyNormalMatrix(r), n.needsUpdate = !0;
    }
    const i = this.attributes.tangent;
    return i !== void 0 && (i.transformDirection(e), i.needsUpdate = !0), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this;
  }
  applyQuaternion(e) {
    return an.makeRotationFromQuaternion(e), this.applyMatrix4(an), this;
  }
  rotateX(e) {
    return an.makeRotationX(e), this.applyMatrix4(an), this;
  }
  rotateY(e) {
    return an.makeRotationY(e), this.applyMatrix4(an), this;
  }
  rotateZ(e) {
    return an.makeRotationZ(e), this.applyMatrix4(an), this;
  }
  translate(e, t, n) {
    return an.makeTranslation(e, t, n), this.applyMatrix4(an), this;
  }
  scale(e, t, n) {
    return an.makeScale(e, t, n), this.applyMatrix4(an), this;
  }
  lookAt(e) {
    return br.lookAt(e), br.updateMatrix(), this.applyMatrix4(br.matrix), this;
  }
  center() {
    return this.computeBoundingBox(), this.boundingBox.getCenter(yi).negate(), this.translate(yi.x, yi.y, yi.z), this;
  }
  setFromPoints(e) {
    const t = [];
    for (let n = 0, i = e.length; n < i; n++) {
      const r = e[n];
      t.push(r.x, r.y, r.z || 0);
    }
    return this.setAttribute("position", new dt(t, 3)), this;
  }
  computeBoundingBox() {
    this.boundingBox === null && (this.boundingBox = new vn());
    const e = this.attributes.position, t = this.morphAttributes.position;
    if (e && e.isGLBufferAttribute) {
      console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.", this), this.boundingBox.set(
        new L(-1 / 0, -1 / 0, -1 / 0),
        new L(1 / 0, 1 / 0, 1 / 0)
      );
      return;
    }
    if (e !== void 0) {
      if (this.boundingBox.setFromBufferAttribute(e), t)
        for (let n = 0, i = t.length; n < i; n++) {
          const r = t[n];
          tn.setFromBufferAttribute(r), this.morphTargetsRelative ? (Dt.addVectors(this.boundingBox.min, tn.min), this.boundingBox.expandByPoint(Dt), Dt.addVectors(this.boundingBox.max, tn.max), this.boundingBox.expandByPoint(Dt)) : (this.boundingBox.expandByPoint(tn.min), this.boundingBox.expandByPoint(tn.max));
        }
    } else
      this.boundingBox.makeEmpty();
    (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) && console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this);
  }
  computeBoundingSphere() {
    this.boundingSphere === null && (this.boundingSphere = new Sn());
    const e = this.attributes.position, t = this.morphAttributes.position;
    if (e && e.isGLBufferAttribute) {
      console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.", this), this.boundingSphere.set(new L(), 1 / 0);
      return;
    }
    if (e) {
      const n = this.boundingSphere.center;
      if (tn.setFromBufferAttribute(e), t)
        for (let r = 0, a = t.length; r < a; r++) {
          const o = t[r];
          Qi.setFromBufferAttribute(o), this.morphTargetsRelative ? (Dt.addVectors(tn.min, Qi.min), tn.expandByPoint(Dt), Dt.addVectors(tn.max, Qi.max), tn.expandByPoint(Dt)) : (tn.expandByPoint(Qi.min), tn.expandByPoint(Qi.max));
        }
      tn.getCenter(n);
      let i = 0;
      for (let r = 0, a = e.count; r < a; r++)
        Dt.fromBufferAttribute(e, r), i = Math.max(i, n.distanceToSquared(Dt));
      if (t)
        for (let r = 0, a = t.length; r < a; r++) {
          const o = t[r], c = this.morphTargetsRelative;
          for (let l = 0, h = o.count; l < h; l++)
            Dt.fromBufferAttribute(o, l), c && (yi.fromBufferAttribute(e, l), Dt.add(yi)), i = Math.max(i, n.distanceToSquared(Dt));
        }
      this.boundingSphere.radius = Math.sqrt(i), isNaN(this.boundingSphere.radius) && console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this);
    }
  }
  computeTangents() {
    const e = this.index, t = this.attributes;
    if (e === null || t.position === void 0 || t.normal === void 0 || t.uv === void 0) {
      console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");
      return;
    }
    const n = t.position, i = t.normal, r = t.uv;
    this.hasAttribute("tangent") === !1 && this.setAttribute("tangent", new jt(new Float32Array(4 * n.count), 4));
    const a = this.getAttribute("tangent"), o = [], c = [];
    for (let k = 0; k < n.count; k++)
      o[k] = new L(), c[k] = new L();
    const l = new L(), h = new L(), u = new L(), d = new Xe(), f = new Xe(), g = new Xe(), _ = new L(), m = new L();
    function p(k, Q, x) {
      l.fromBufferAttribute(n, k), h.fromBufferAttribute(n, Q), u.fromBufferAttribute(n, x), d.fromBufferAttribute(r, k), f.fromBufferAttribute(r, Q), g.fromBufferAttribute(r, x), h.sub(l), u.sub(l), f.sub(d), g.sub(d);
      const T = 1 / (f.x * g.y - g.x * f.y);
      isFinite(T) && (_.copy(h).multiplyScalar(g.y).addScaledVector(u, -f.y).multiplyScalar(T), m.copy(u).multiplyScalar(f.x).addScaledVector(h, -g.x).multiplyScalar(T), o[k].add(_), o[Q].add(_), o[x].add(_), c[k].add(m), c[Q].add(m), c[x].add(m));
    }
    let E = this.groups;
    E.length === 0 && (E = [{
      start: 0,
      count: e.count
    }]);
    for (let k = 0, Q = E.length; k < Q; ++k) {
      const x = E[k], T = x.start, q = x.count;
      for (let X = T, j = T + q; X < j; X += 3)
        p(
          e.getX(X + 0),
          e.getX(X + 1),
          e.getX(X + 2)
        );
    }
    const y = new L(), A = new L(), O = new L(), w = new L();
    function R(k) {
      O.fromBufferAttribute(i, k), w.copy(O);
      const Q = o[k];
      y.copy(Q), y.sub(O.multiplyScalar(O.dot(Q))).normalize(), A.crossVectors(w, Q);
      const T = A.dot(c[k]) < 0 ? -1 : 1;
      a.setXYZW(k, y.x, y.y, y.z, T);
    }
    for (let k = 0, Q = E.length; k < Q; ++k) {
      const x = E[k], T = x.start, q = x.count;
      for (let X = T, j = T + q; X < j; X += 3)
        R(e.getX(X + 0)), R(e.getX(X + 1)), R(e.getX(X + 2));
    }
  }
  computeVertexNormals() {
    const e = this.index, t = this.getAttribute("position");
    if (t !== void 0) {
      let n = this.getAttribute("normal");
      if (n === void 0)
        n = new jt(new Float32Array(t.count * 3), 3), this.setAttribute("normal", n);
      else
        for (let d = 0, f = n.count; d < f; d++)
          n.setXYZ(d, 0, 0, 0);
      const i = new L(), r = new L(), a = new L(), o = new L(), c = new L(), l = new L(), h = new L(), u = new L();
      if (e)
        for (let d = 0, f = e.count; d < f; d += 3) {
          const g = e.getX(d + 0), _ = e.getX(d + 1), m = e.getX(d + 2);
          i.fromBufferAttribute(t, g), r.fromBufferAttribute(t, _), a.fromBufferAttribute(t, m), h.subVectors(a, r), u.subVectors(i, r), h.cross(u), o.fromBufferAttribute(n, g), c.fromBufferAttribute(n, _), l.fromBufferAttribute(n, m), o.add(h), c.add(h), l.add(h), n.setXYZ(g, o.x, o.y, o.z), n.setXYZ(_, c.x, c.y, c.z), n.setXYZ(m, l.x, l.y, l.z);
        }
      else
        for (let d = 0, f = t.count; d < f; d += 3)
          i.fromBufferAttribute(t, d + 0), r.fromBufferAttribute(t, d + 1), a.fromBufferAttribute(t, d + 2), h.subVectors(a, r), u.subVectors(i, r), h.cross(u), n.setXYZ(d + 0, h.x, h.y, h.z), n.setXYZ(d + 1, h.x, h.y, h.z), n.setXYZ(d + 2, h.x, h.y, h.z);
      this.normalizeNormals(), n.needsUpdate = !0;
    }
  }
  normalizeNormals() {
    const e = this.attributes.normal;
    for (let t = 0, n = e.count; t < n; t++)
      Dt.fromBufferAttribute(e, t), Dt.normalize(), e.setXYZ(t, Dt.x, Dt.y, Dt.z);
  }
  toNonIndexed() {
    function e(o, c) {
      const l = o.array, h = o.itemSize, u = o.normalized, d = new l.constructor(c.length * h);
      let f = 0, g = 0;
      for (let _ = 0, m = c.length; _ < m; _++) {
        o.isInterleavedBufferAttribute ? f = c[_] * o.data.stride + o.offset : f = c[_] * h;
        for (let p = 0; p < h; p++)
          d[g++] = l[f++];
      }
      return new jt(d, h, u);
    }
    if (this.index === null)
      return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."), this;
    const t = new Rt(), n = this.index.array, i = this.attributes;
    for (const o in i) {
      const c = i[o], l = e(c, n);
      t.setAttribute(o, l);
    }
    const r = this.morphAttributes;
    for (const o in r) {
      const c = [], l = r[o];
      for (let h = 0, u = l.length; h < u; h++) {
        const d = l[h], f = e(d, n);
        c.push(f);
      }
      t.morphAttributes[o] = c;
    }
    t.morphTargetsRelative = this.morphTargetsRelative;
    const a = this.groups;
    for (let o = 0, c = a.length; o < c; o++) {
      const l = a[o];
      t.addGroup(l.start, l.count, l.materialIndex);
    }
    return t;
  }
  toJSON() {
    const e = {
      metadata: {
        version: 4.6,
        type: "BufferGeometry",
        generator: "BufferGeometry.toJSON"
      }
    };
    if (e.uuid = this.uuid, e.type = this.type, this.name !== "" && (e.name = this.name), Object.keys(this.userData).length > 0 && (e.userData = this.userData), this.parameters !== void 0) {
      const c = this.parameters;
      for (const l in c)
        c[l] !== void 0 && (e[l] = c[l]);
      return e;
    }
    e.data = { attributes: {} };
    const t = this.index;
    t !== null && (e.data.index = {
      type: t.array.constructor.name,
      array: Array.prototype.slice.call(t.array)
    });
    const n = this.attributes;
    for (const c in n) {
      const l = n[c];
      e.data.attributes[c] = l.toJSON(e.data);
    }
    const i = {};
    let r = !1;
    for (const c in this.morphAttributes) {
      const l = this.morphAttributes[c], h = [];
      for (let u = 0, d = l.length; u < d; u++) {
        const f = l[u];
        h.push(f.toJSON(e.data));
      }
      h.length > 0 && (i[c] = h, r = !0);
    }
    r && (e.data.morphAttributes = i, e.data.morphTargetsRelative = this.morphTargetsRelative);
    const a = this.groups;
    a.length > 0 && (e.data.groups = JSON.parse(JSON.stringify(a)));
    const o = this.boundingSphere;
    return o !== null && (e.data.boundingSphere = {
      center: o.center.toArray(),
      radius: o.radius
    }), e;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    this.index = null, this.attributes = {}, this.morphAttributes = {}, this.groups = [], this.boundingBox = null, this.boundingSphere = null;
    const t = {};
    this.name = e.name;
    const n = e.index;
    n !== null && this.setIndex(n.clone(t));
    const i = e.attributes;
    for (const l in i) {
      const h = i[l];
      this.setAttribute(l, h.clone(t));
    }
    const r = e.morphAttributes;
    for (const l in r) {
      const h = [], u = r[l];
      for (let d = 0, f = u.length; d < f; d++)
        h.push(u[d].clone(t));
      this.morphAttributes[l] = h;
    }
    this.morphTargetsRelative = e.morphTargetsRelative;
    const a = e.groups;
    for (let l = 0, h = a.length; l < h; l++) {
      const u = a[l];
      this.addGroup(u.start, u.count, u.materialIndex);
    }
    const o = e.boundingBox;
    o !== null && (this.boundingBox = o.clone());
    const c = e.boundingSphere;
    return c !== null && (this.boundingSphere = c.clone()), this.drawRange.start = e.drawRange.start, this.drawRange.count = e.drawRange.count, this.userData = e.userData, this;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
}
const Da = /* @__PURE__ */ new qe(), Kn = /* @__PURE__ */ new hs(), Ts = /* @__PURE__ */ new Sn(), Ua = /* @__PURE__ */ new L(), As = /* @__PURE__ */ new L(), bs = /* @__PURE__ */ new L(), ws = /* @__PURE__ */ new L(), wr = /* @__PURE__ */ new L(), Rs = /* @__PURE__ */ new L(), Na = /* @__PURE__ */ new L(), Cs = /* @__PURE__ */ new L();
class We extends St {
  constructor(e = new Rt(), t = new bt()) {
    super(), this.isMesh = !0, this.type = "Mesh", this.geometry = e, this.material = t, this.updateMorphTargets();
  }
  copy(e, t) {
    return super.copy(e, t), e.morphTargetInfluences !== void 0 && (this.morphTargetInfluences = e.morphTargetInfluences.slice()), e.morphTargetDictionary !== void 0 && (this.morphTargetDictionary = Object.assign({}, e.morphTargetDictionary)), this.material = Array.isArray(e.material) ? e.material.slice() : e.material, this.geometry = e.geometry, this;
  }
  updateMorphTargets() {
    const t = this.geometry.morphAttributes, n = Object.keys(t);
    if (n.length > 0) {
      const i = t[n[0]];
      if (i !== void 0) {
        this.morphTargetInfluences = [], this.morphTargetDictionary = {};
        for (let r = 0, a = i.length; r < a; r++) {
          const o = i[r].name || String(r);
          this.morphTargetInfluences.push(0), this.morphTargetDictionary[o] = r;
        }
      }
    }
  }
  getVertexPosition(e, t) {
    const n = this.geometry, i = n.attributes.position, r = n.morphAttributes.position, a = n.morphTargetsRelative;
    t.fromBufferAttribute(i, e);
    const o = this.morphTargetInfluences;
    if (r && o) {
      Rs.set(0, 0, 0);
      for (let c = 0, l = r.length; c < l; c++) {
        const h = o[c], u = r[c];
        h !== 0 && (wr.fromBufferAttribute(u, e), a ? Rs.addScaledVector(wr, h) : Rs.addScaledVector(wr.sub(t), h));
      }
      t.add(Rs);
    }
    return t;
  }
  raycast(e, t) {
    const n = this.geometry, i = this.material, r = this.matrixWorld;
    i !== void 0 && (n.boundingSphere === null && n.computeBoundingSphere(), Ts.copy(n.boundingSphere), Ts.applyMatrix4(r), Kn.copy(e.ray).recast(e.near), !(Ts.containsPoint(Kn.origin) === !1 && (Kn.intersectSphere(Ts, Ua) === null || Kn.origin.distanceToSquared(Ua) > (e.far - e.near) ** 2)) && (Da.copy(r).invert(), Kn.copy(e.ray).applyMatrix4(Da), !(n.boundingBox !== null && Kn.intersectsBox(n.boundingBox) === !1) && this._computeIntersections(e, t, Kn)));
  }
  _computeIntersections(e, t, n) {
    let i;
    const r = this.geometry, a = this.material, o = r.index, c = r.attributes.position, l = r.attributes.uv, h = r.attributes.uv1, u = r.attributes.normal, d = r.groups, f = r.drawRange;
    if (o !== null)
      if (Array.isArray(a))
        for (let g = 0, _ = d.length; g < _; g++) {
          const m = d[g], p = a[m.materialIndex], E = Math.max(m.start, f.start), y = Math.min(o.count, Math.min(m.start + m.count, f.start + f.count));
          for (let A = E, O = y; A < O; A += 3) {
            const w = o.getX(A), R = o.getX(A + 1), k = o.getX(A + 2);
            i = Is(this, p, e, n, l, h, u, w, R, k), i && (i.faceIndex = Math.floor(A / 3), i.face.materialIndex = m.materialIndex, t.push(i));
          }
        }
      else {
        const g = Math.max(0, f.start), _ = Math.min(o.count, f.start + f.count);
        for (let m = g, p = _; m < p; m += 3) {
          const E = o.getX(m), y = o.getX(m + 1), A = o.getX(m + 2);
          i = Is(this, a, e, n, l, h, u, E, y, A), i && (i.faceIndex = Math.floor(m / 3), t.push(i));
        }
      }
    else if (c !== void 0)
      if (Array.isArray(a))
        for (let g = 0, _ = d.length; g < _; g++) {
          const m = d[g], p = a[m.materialIndex], E = Math.max(m.start, f.start), y = Math.min(c.count, Math.min(m.start + m.count, f.start + f.count));
          for (let A = E, O = y; A < O; A += 3) {
            const w = A, R = A + 1, k = A + 2;
            i = Is(this, p, e, n, l, h, u, w, R, k), i && (i.faceIndex = Math.floor(A / 3), i.face.materialIndex = m.materialIndex, t.push(i));
          }
        }
      else {
        const g = Math.max(0, f.start), _ = Math.min(c.count, f.start + f.count);
        for (let m = g, p = _; m < p; m += 3) {
          const E = m, y = m + 1, A = m + 2;
          i = Is(this, a, e, n, l, h, u, E, y, A), i && (i.faceIndex = Math.floor(m / 3), t.push(i));
        }
      }
  }
}
function nl(s, e, t, n, i, r, a, o) {
  let c;
  if (e.side === 1 ? c = n.intersectTriangle(a, r, i, !0, o) : c = n.intersectTriangle(i, r, a, e.side === 0, o), c === null) return null;
  Cs.copy(o), Cs.applyMatrix4(s.matrixWorld);
  const l = t.ray.origin.distanceTo(Cs);
  return l < t.near || l > t.far ? null : {
    distance: l,
    point: Cs.clone(),
    object: s
  };
}
function Is(s, e, t, n, i, r, a, o, c, l) {
  s.getVertexPosition(o, As), s.getVertexPosition(c, bs), s.getVertexPosition(l, ws);
  const h = nl(s, e, t, n, As, bs, ws, Na);
  if (h) {
    const u = new L();
    ln.getBarycoord(Na, As, bs, ws, u), i && (h.uv = ln.getInterpolatedAttribute(i, o, c, l, u, new Xe())), r && (h.uv1 = ln.getInterpolatedAttribute(r, o, c, l, u, new Xe())), a && (h.normal = ln.getInterpolatedAttribute(a, o, c, l, u, new L()), h.normal.dot(n.direction) > 0 && h.normal.multiplyScalar(-1));
    const d = {
      a: o,
      b: c,
      c: l,
      normal: new L(),
      materialIndex: 0
    };
    ln.getNormal(As, bs, ws, d.normal), h.face = d, h.barycoord = u;
  }
  return h;
}
class Ut extends Rt {
  constructor(e = 1, t = 1, n = 1, i = 1, r = 1, a = 1) {
    super(), this.type = "BoxGeometry", this.parameters = {
      width: e,
      height: t,
      depth: n,
      widthSegments: i,
      heightSegments: r,
      depthSegments: a
    };
    const o = this;
    i = Math.floor(i), r = Math.floor(r), a = Math.floor(a);
    const c = [], l = [], h = [], u = [];
    let d = 0, f = 0;
    g("z", "y", "x", -1, -1, n, t, e, a, r, 0), g("z", "y", "x", 1, -1, n, t, -e, a, r, 1), g("x", "z", "y", 1, 1, e, n, t, i, a, 2), g("x", "z", "y", 1, -1, e, n, -t, i, a, 3), g("x", "y", "z", 1, -1, e, t, n, i, r, 4), g("x", "y", "z", -1, -1, e, t, -n, i, r, 5), this.setIndex(c), this.setAttribute("position", new dt(l, 3)), this.setAttribute("normal", new dt(h, 3)), this.setAttribute("uv", new dt(u, 2));
    function g(_, m, p, E, y, A, O, w, R, k, Q) {
      const x = A / R, T = O / k, q = A / 2, X = O / 2, j = w / 2, te = R + 1, W = k + 1;
      let oe = 0, K = 0;
      const ge = new L();
      for (let fe = 0; fe < W; fe++) {
        const Ae = fe * T - X;
        for (let at = 0; at < te; at++) {
          const lt = at * x - q;
          ge[_] = lt * E, ge[m] = Ae * y, ge[p] = j, l.push(ge.x, ge.y, ge.z), ge[_] = 0, ge[m] = 0, ge[p] = w > 0 ? 1 : -1, h.push(ge.x, ge.y, ge.z), u.push(at / R), u.push(1 - fe / k), oe += 1;
        }
      }
      for (let fe = 0; fe < k; fe++)
        for (let Ae = 0; Ae < R; Ae++) {
          const at = d + Ae + te * fe, lt = d + Ae + te * (fe + 1), $ = d + (Ae + 1) + te * (fe + 1), ie = d + (Ae + 1) + te * fe;
          c.push(at, lt, ie), c.push(lt, $, ie), K += 6;
        }
      o.addGroup(f, K, Q), f += K, d += oe;
    }
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new Ut(e.width, e.height, e.depth, e.widthSegments, e.heightSegments, e.depthSegments);
  }
}
function Ni(s) {
  const e = {};
  for (const t in s) {
    e[t] = {};
    for (const n in s[t]) {
      const i = s[t][n];
      i && (i.isColor || i.isMatrix3 || i.isMatrix4 || i.isVector2 || i.isVector3 || i.isVector4 || i.isTexture || i.isQuaternion) ? i.isRenderTargetTexture ? (console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."), e[t][n] = null) : e[t][n] = i.clone() : Array.isArray(i) ? e[t][n] = i.slice() : e[t][n] = i;
    }
  }
  return e;
}
function qt(s) {
  const e = {};
  for (let t = 0; t < s.length; t++) {
    const n = Ni(s[t]);
    for (const i in n)
      e[i] = n[i];
  }
  return e;
}
function il(s) {
  const e = [];
  for (let t = 0; t < s.length; t++)
    e.push(s[t].clone());
  return e;
}
function qo(s) {
  const e = s.getRenderTarget();
  return e === null ? s.outputColorSpace : e.isXRRenderTarget === !0 ? e.texture.colorSpace : it.workingColorSpace;
}
const sl = { clone: Ni, merge: qt };
var rl = `void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`, al = `void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;
class Wn extends nn {
  constructor(e) {
    super(), this.isShaderMaterial = !0, this.type = "ShaderMaterial", this.defines = {}, this.uniforms = {}, this.uniformsGroups = [], this.vertexShader = rl, this.fragmentShader = al, this.linewidth = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.fog = !1, this.lights = !1, this.clipping = !1, this.forceSinglePass = !0, this.extensions = {
      clipCullDistance: !1,
      // set to use vertex shader clipping
      multiDraw: !1
      // set to use vertex shader multi_draw / enable gl_DrawID
    }, this.defaultAttributeValues = {
      color: [1, 1, 1],
      uv: [0, 0],
      uv1: [0, 0]
    }, this.index0AttributeName = void 0, this.uniformsNeedUpdate = !1, this.glslVersion = null, e !== void 0 && this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.fragmentShader = e.fragmentShader, this.vertexShader = e.vertexShader, this.uniforms = Ni(e.uniforms), this.uniformsGroups = il(e.uniformsGroups), this.defines = Object.assign({}, e.defines), this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.fog = e.fog, this.lights = e.lights, this.clipping = e.clipping, this.extensions = Object.assign({}, e.extensions), this.glslVersion = e.glslVersion, this;
  }
  toJSON(e) {
    const t = super.toJSON(e);
    t.glslVersion = this.glslVersion, t.uniforms = {};
    for (const i in this.uniforms) {
      const a = this.uniforms[i].value;
      a && a.isTexture ? t.uniforms[i] = {
        type: "t",
        value: a.toJSON(e).uuid
      } : a && a.isColor ? t.uniforms[i] = {
        type: "c",
        value: a.getHex()
      } : a && a.isVector2 ? t.uniforms[i] = {
        type: "v2",
        value: a.toArray()
      } : a && a.isVector3 ? t.uniforms[i] = {
        type: "v3",
        value: a.toArray()
      } : a && a.isVector4 ? t.uniforms[i] = {
        type: "v4",
        value: a.toArray()
      } : a && a.isMatrix3 ? t.uniforms[i] = {
        type: "m3",
        value: a.toArray()
      } : a && a.isMatrix4 ? t.uniforms[i] = {
        type: "m4",
        value: a.toArray()
      } : t.uniforms[i] = {
        value: a
      };
    }
    Object.keys(this.defines).length > 0 && (t.defines = this.defines), t.vertexShader = this.vertexShader, t.fragmentShader = this.fragmentShader, t.lights = this.lights, t.clipping = this.clipping;
    const n = {};
    for (const i in this.extensions)
      this.extensions[i] === !0 && (n[i] = !0);
    return Object.keys(n).length > 0 && (t.extensions = n), t;
  }
}
class jo extends St {
  constructor() {
    super(), this.isCamera = !0, this.type = "Camera", this.matrixWorldInverse = new qe(), this.projectionMatrix = new qe(), this.projectionMatrixInverse = new qe(), this.coordinateSystem = 2e3;
  }
  copy(e, t) {
    return super.copy(e, t), this.matrixWorldInverse.copy(e.matrixWorldInverse), this.projectionMatrix.copy(e.projectionMatrix), this.projectionMatrixInverse.copy(e.projectionMatrixInverse), this.coordinateSystem = e.coordinateSystem, this;
  }
  getWorldDirection(e) {
    return super.getWorldDirection(e).negate();
  }
  updateMatrixWorld(e) {
    super.updateMatrixWorld(e), this.matrixWorldInverse.copy(this.matrixWorld).invert();
  }
  updateWorldMatrix(e, t) {
    super.updateWorldMatrix(e, t), this.matrixWorldInverse.copy(this.matrixWorld).invert();
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
const kn = /* @__PURE__ */ new L(), Fa = /* @__PURE__ */ new Xe(), Ba = /* @__PURE__ */ new Xe();
class $t extends jo {
  constructor(e = 50, t = 1, n = 0.1, i = 2e3) {
    super(), this.isPerspectiveCamera = !0, this.type = "PerspectiveCamera", this.fov = e, this.zoom = 1, this.near = n, this.far = i, this.focus = 10, this.aspect = t, this.view = null, this.filmGauge = 35, this.filmOffset = 0, this.updateProjectionMatrix();
  }
  copy(e, t) {
    return super.copy(e, t), this.fov = e.fov, this.zoom = e.zoom, this.near = e.near, this.far = e.far, this.focus = e.focus, this.aspect = e.aspect, this.view = e.view === null ? null : Object.assign({}, e.view), this.filmGauge = e.filmGauge, this.filmOffset = e.filmOffset, this;
  }
  /**
   * Sets the FOV by focal length in respect to the current .filmGauge.
   *
   * The default film gauge is 35, so that the focal length can be specified for
   * a 35mm (full frame) camera.
   *
   * Values for focal length and film gauge must have the same unit.
   */
  setFocalLength(e) {
    const t = 0.5 * this.getFilmHeight() / e;
    this.fov = Ui * 2 * Math.atan(t), this.updateProjectionMatrix();
  }
  /**
   * Calculates the focal length from the current .fov and .filmGauge.
   */
  getFocalLength() {
    const e = Math.tan(Ci * 0.5 * this.fov);
    return 0.5 * this.getFilmHeight() / e;
  }
  getEffectiveFOV() {
    return Ui * 2 * Math.atan(
      Math.tan(Ci * 0.5 * this.fov) / this.zoom
    );
  }
  getFilmWidth() {
    return this.filmGauge * Math.min(this.aspect, 1);
  }
  getFilmHeight() {
    return this.filmGauge / Math.max(this.aspect, 1);
  }
  /**
   * Computes the 2D bounds of the camera's viewable rectangle at a given distance along the viewing direction.
   * Sets minTarget and maxTarget to the coordinates of the lower-left and upper-right corners of the view rectangle.
   */
  getViewBounds(e, t, n) {
    kn.set(-1, -1, 0.5).applyMatrix4(this.projectionMatrixInverse), t.set(kn.x, kn.y).multiplyScalar(-e / kn.z), kn.set(1, 1, 0.5).applyMatrix4(this.projectionMatrixInverse), n.set(kn.x, kn.y).multiplyScalar(-e / kn.z);
  }
  /**
   * Computes the width and height of the camera's viewable rectangle at a given distance along the viewing direction.
   * Copies the result into the target Vector2, where x is width and y is height.
   */
  getViewSize(e, t) {
    return this.getViewBounds(e, Fa, Ba), t.subVectors(Ba, Fa);
  }
  /**
   * Sets an offset in a larger frustum. This is useful for multi-window or
   * multi-monitor/multi-machine setups.
   *
   * For example, if you have 3x2 monitors and each monitor is 1920x1080 and
   * the monitors are in grid like this
   *
   *   +---+---+---+
   *   | A | B | C |
   *   +---+---+---+
   *   | D | E | F |
   *   +---+---+---+
   *
   * then for each monitor you would call it like this
   *
   *   const w = 1920;
   *   const h = 1080;
   *   const fullWidth = w * 3;
   *   const fullHeight = h * 2;
   *
   *   --A--
   *   camera.setViewOffset( fullWidth, fullHeight, w * 0, h * 0, w, h );
   *   --B--
   *   camera.setViewOffset( fullWidth, fullHeight, w * 1, h * 0, w, h );
   *   --C--
   *   camera.setViewOffset( fullWidth, fullHeight, w * 2, h * 0, w, h );
   *   --D--
   *   camera.setViewOffset( fullWidth, fullHeight, w * 0, h * 1, w, h );
   *   --E--
   *   camera.setViewOffset( fullWidth, fullHeight, w * 1, h * 1, w, h );
   *   --F--
   *   camera.setViewOffset( fullWidth, fullHeight, w * 2, h * 1, w, h );
   *
   *   Note there is no reason monitors have to be the same size or in a grid.
   */
  setViewOffset(e, t, n, i, r, a) {
    this.aspect = e / t, this.view === null && (this.view = {
      enabled: !0,
      fullWidth: 1,
      fullHeight: 1,
      offsetX: 0,
      offsetY: 0,
      width: 1,
      height: 1
    }), this.view.enabled = !0, this.view.fullWidth = e, this.view.fullHeight = t, this.view.offsetX = n, this.view.offsetY = i, this.view.width = r, this.view.height = a, this.updateProjectionMatrix();
  }
  clearViewOffset() {
    this.view !== null && (this.view.enabled = !1), this.updateProjectionMatrix();
  }
  updateProjectionMatrix() {
    const e = this.near;
    let t = e * Math.tan(Ci * 0.5 * this.fov) / this.zoom, n = 2 * t, i = this.aspect * n, r = -0.5 * i;
    const a = this.view;
    if (this.view !== null && this.view.enabled) {
      const c = a.fullWidth, l = a.fullHeight;
      r += a.offsetX * i / c, t -= a.offsetY * n / l, i *= a.width / c, n *= a.height / l;
    }
    const o = this.filmOffset;
    o !== 0 && (r += e * o / this.getFilmWidth()), this.projectionMatrix.makePerspective(r, r + i, t, t - n, e, this.far, this.coordinateSystem), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return t.object.fov = this.fov, t.object.zoom = this.zoom, t.object.near = this.near, t.object.far = this.far, t.object.focus = this.focus, t.object.aspect = this.aspect, this.view !== null && (t.object.view = Object.assign({}, this.view)), t.object.filmGauge = this.filmGauge, t.object.filmOffset = this.filmOffset, t;
  }
}
const Si = -90, Ei = 1;
class ol extends St {
  constructor(e, t, n) {
    super(), this.type = "CubeCamera", this.renderTarget = n, this.coordinateSystem = null, this.activeMipmapLevel = 0;
    const i = new $t(Si, Ei, e, t);
    i.layers = this.layers, this.add(i);
    const r = new $t(Si, Ei, e, t);
    r.layers = this.layers, this.add(r);
    const a = new $t(Si, Ei, e, t);
    a.layers = this.layers, this.add(a);
    const o = new $t(Si, Ei, e, t);
    o.layers = this.layers, this.add(o);
    const c = new $t(Si, Ei, e, t);
    c.layers = this.layers, this.add(c);
    const l = new $t(Si, Ei, e, t);
    l.layers = this.layers, this.add(l);
  }
  updateCoordinateSystem() {
    const e = this.coordinateSystem, t = this.children.concat(), [n, i, r, a, o, c] = t;
    for (const l of t) this.remove(l);
    if (e === 2e3)
      n.up.set(0, 1, 0), n.lookAt(1, 0, 0), i.up.set(0, 1, 0), i.lookAt(-1, 0, 0), r.up.set(0, 0, -1), r.lookAt(0, 1, 0), a.up.set(0, 0, 1), a.lookAt(0, -1, 0), o.up.set(0, 1, 0), o.lookAt(0, 0, 1), c.up.set(0, 1, 0), c.lookAt(0, 0, -1);
    else if (e === 2001)
      n.up.set(0, -1, 0), n.lookAt(-1, 0, 0), i.up.set(0, -1, 0), i.lookAt(1, 0, 0), r.up.set(0, 0, 1), r.lookAt(0, 1, 0), a.up.set(0, 0, -1), a.lookAt(0, -1, 0), o.up.set(0, -1, 0), o.lookAt(0, 0, 1), c.up.set(0, -1, 0), c.lookAt(0, 0, -1);
    else
      throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: " + e);
    for (const l of t)
      this.add(l), l.updateMatrixWorld();
  }
  update(e, t) {
    this.parent === null && this.updateMatrixWorld();
    const { renderTarget: n, activeMipmapLevel: i } = this;
    this.coordinateSystem !== e.coordinateSystem && (this.coordinateSystem = e.coordinateSystem, this.updateCoordinateSystem());
    const [r, a, o, c, l, h] = this.children, u = e.getRenderTarget(), d = e.getActiveCubeFace(), f = e.getActiveMipmapLevel(), g = e.xr.enabled;
    e.xr.enabled = !1;
    const _ = n.texture.generateMipmaps;
    n.texture.generateMipmaps = !1, e.setRenderTarget(n, 0, i), e.render(t, r), e.setRenderTarget(n, 1, i), e.render(t, a), e.setRenderTarget(n, 2, i), e.render(t, o), e.setRenderTarget(n, 3, i), e.render(t, c), e.setRenderTarget(n, 4, i), e.render(t, l), n.texture.generateMipmaps = _, e.setRenderTarget(n, 5, i), e.render(t, h), e.setRenderTarget(u, d, f), e.xr.enabled = g, n.texture.needsPMREMUpdate = !0;
  }
}
class Yo extends It {
  constructor(e, t, n, i, r, a, o, c, l, h) {
    e = e !== void 0 ? e : [], t = t !== void 0 ? t : 301, super(e, t, n, i, r, a, o, c, l, h), this.isCubeTexture = !0, this.flipY = !1;
  }
  get images() {
    return this.image;
  }
  set images(e) {
    this.image = e;
  }
}
class cl extends si {
  constructor(e = 1, t = {}) {
    super(e, e, t), this.isWebGLCubeRenderTarget = !0;
    const n = { width: e, height: e, depth: 1 }, i = [n, n, n, n, n, n];
    this.texture = new Yo(i, t.mapping, t.wrapS, t.wrapT, t.magFilter, t.minFilter, t.format, t.type, t.anisotropy, t.colorSpace), this.texture.isRenderTargetTexture = !0, this.texture.generateMipmaps = t.generateMipmaps !== void 0 ? t.generateMipmaps : !1, this.texture.minFilter = t.minFilter !== void 0 ? t.minFilter : 1006;
  }
  fromEquirectangularTexture(e, t) {
    this.texture.type = t.type, this.texture.colorSpace = t.colorSpace, this.texture.generateMipmaps = t.generateMipmaps, this.texture.minFilter = t.minFilter, this.texture.magFilter = t.magFilter;
    const n = {
      uniforms: {
        tEquirect: { value: null }
      },
      vertexShader: (
        /* glsl */
        `

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`
      ),
      fragmentShader: (
        /* glsl */
        `

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`
      )
    }, i = new Ut(5, 5, 5), r = new Wn({
      name: "CubemapFromEquirect",
      uniforms: Ni(n.uniforms),
      vertexShader: n.vertexShader,
      fragmentShader: n.fragmentShader,
      side: 1,
      blending: 0
    });
    r.uniforms.tEquirect.value = t;
    const a = new We(i, r), o = t.minFilter;
    return t.minFilter === 1008 && (t.minFilter = 1006), new ol(1, 10, this).update(e, a), t.minFilter = o, a.geometry.dispose(), a.material.dispose(), this;
  }
  clear(e, t, n, i) {
    const r = e.getRenderTarget();
    for (let a = 0; a < 6; a++)
      e.setRenderTarget(this, a), e.clear(t, n, i);
    e.setRenderTarget(r);
  }
}
const Rr = /* @__PURE__ */ new L(), ll = /* @__PURE__ */ new L(), hl = /* @__PURE__ */ new $e();
class Gn {
  constructor(e = new L(1, 0, 0), t = 0) {
    this.isPlane = !0, this.normal = e, this.constant = t;
  }
  set(e, t) {
    return this.normal.copy(e), this.constant = t, this;
  }
  setComponents(e, t, n, i) {
    return this.normal.set(e, t, n), this.constant = i, this;
  }
  setFromNormalAndCoplanarPoint(e, t) {
    return this.normal.copy(e), this.constant = -t.dot(this.normal), this;
  }
  setFromCoplanarPoints(e, t, n) {
    const i = Rr.subVectors(n, t).cross(ll.subVectors(e, t)).normalize();
    return this.setFromNormalAndCoplanarPoint(i, e), this;
  }
  copy(e) {
    return this.normal.copy(e.normal), this.constant = e.constant, this;
  }
  normalize() {
    const e = 1 / this.normal.length();
    return this.normal.multiplyScalar(e), this.constant *= e, this;
  }
  negate() {
    return this.constant *= -1, this.normal.negate(), this;
  }
  distanceToPoint(e) {
    return this.normal.dot(e) + this.constant;
  }
  distanceToSphere(e) {
    return this.distanceToPoint(e.center) - e.radius;
  }
  projectPoint(e, t) {
    return t.copy(e).addScaledVector(this.normal, -this.distanceToPoint(e));
  }
  intersectLine(e, t) {
    const n = e.delta(Rr), i = this.normal.dot(n);
    if (i === 0)
      return this.distanceToPoint(e.start) === 0 ? t.copy(e.start) : null;
    const r = -(e.start.dot(this.normal) + this.constant) / i;
    return r < 0 || r > 1 ? null : t.copy(e.start).addScaledVector(n, r);
  }
  intersectsLine(e) {
    const t = this.distanceToPoint(e.start), n = this.distanceToPoint(e.end);
    return t < 0 && n > 0 || n < 0 && t > 0;
  }
  intersectsBox(e) {
    return e.intersectsPlane(this);
  }
  intersectsSphere(e) {
    return e.intersectsPlane(this);
  }
  coplanarPoint(e) {
    return e.copy(this.normal).multiplyScalar(-this.constant);
  }
  applyMatrix4(e, t) {
    const n = t || hl.getNormalMatrix(e), i = this.coplanarPoint(Rr).applyMatrix4(e), r = this.normal.applyMatrix3(n).normalize();
    return this.constant = -i.dot(r), this;
  }
  translate(e) {
    return this.constant -= e.dot(this.normal), this;
  }
  equals(e) {
    return e.normal.equals(this.normal) && e.constant === this.constant;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
const Zn = /* @__PURE__ */ new Sn(), Ps = /* @__PURE__ */ new L();
class ra {
  constructor(e = new Gn(), t = new Gn(), n = new Gn(), i = new Gn(), r = new Gn(), a = new Gn()) {
    this.planes = [e, t, n, i, r, a];
  }
  set(e, t, n, i, r, a) {
    const o = this.planes;
    return o[0].copy(e), o[1].copy(t), o[2].copy(n), o[3].copy(i), o[4].copy(r), o[5].copy(a), this;
  }
  copy(e) {
    const t = this.planes;
    for (let n = 0; n < 6; n++)
      t[n].copy(e.planes[n]);
    return this;
  }
  setFromProjectionMatrix(e, t = 2e3) {
    const n = this.planes, i = e.elements, r = i[0], a = i[1], o = i[2], c = i[3], l = i[4], h = i[5], u = i[6], d = i[7], f = i[8], g = i[9], _ = i[10], m = i[11], p = i[12], E = i[13], y = i[14], A = i[15];
    if (n[0].setComponents(c - r, d - l, m - f, A - p).normalize(), n[1].setComponents(c + r, d + l, m + f, A + p).normalize(), n[2].setComponents(c + a, d + h, m + g, A + E).normalize(), n[3].setComponents(c - a, d - h, m - g, A - E).normalize(), n[4].setComponents(c - o, d - u, m - _, A - y).normalize(), t === 2e3)
      n[5].setComponents(c + o, d + u, m + _, A + y).normalize();
    else if (t === 2001)
      n[5].setComponents(o, u, _, y).normalize();
    else
      throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: " + t);
    return this;
  }
  intersectsObject(e) {
    if (e.boundingSphere !== void 0)
      e.boundingSphere === null && e.computeBoundingSphere(), Zn.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);
    else {
      const t = e.geometry;
      t.boundingSphere === null && t.computeBoundingSphere(), Zn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld);
    }
    return this.intersectsSphere(Zn);
  }
  intersectsSprite(e) {
    return Zn.center.set(0, 0, 0), Zn.radius = 0.7071067811865476, Zn.applyMatrix4(e.matrixWorld), this.intersectsSphere(Zn);
  }
  intersectsSphere(e) {
    const t = this.planes, n = e.center, i = -e.radius;
    for (let r = 0; r < 6; r++)
      if (t[r].distanceToPoint(n) < i)
        return !1;
    return !0;
  }
  intersectsBox(e) {
    const t = this.planes;
    for (let n = 0; n < 6; n++) {
      const i = t[n];
      if (Ps.x = i.normal.x > 0 ? e.max.x : e.min.x, Ps.y = i.normal.y > 0 ? e.max.y : e.min.y, Ps.z = i.normal.z > 0 ? e.max.z : e.min.z, i.distanceToPoint(Ps) < 0)
        return !1;
    }
    return !0;
  }
  containsPoint(e) {
    const t = this.planes;
    for (let n = 0; n < 6; n++)
      if (t[n].distanceToPoint(e) < 0)
        return !1;
    return !0;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
function Ko() {
  let s = null, e = !1, t = null, n = null;
  function i(r, a) {
    t(r, a), n = s.requestAnimationFrame(i);
  }
  return {
    start: function() {
      e !== !0 && t !== null && (n = s.requestAnimationFrame(i), e = !0);
    },
    stop: function() {
      s.cancelAnimationFrame(n), e = !1;
    },
    setAnimationLoop: function(r) {
      t = r;
    },
    setContext: function(r) {
      s = r;
    }
  };
}
function ul(s) {
  const e = /* @__PURE__ */ new WeakMap();
  function t(o, c) {
    const l = o.array, h = o.usage, u = l.byteLength, d = s.createBuffer();
    s.bindBuffer(c, d), s.bufferData(c, l, h), o.onUploadCallback();
    let f;
    if (l instanceof Float32Array)
      f = s.FLOAT;
    else if (l instanceof Uint16Array)
      o.isFloat16BufferAttribute ? f = s.HALF_FLOAT : f = s.UNSIGNED_SHORT;
    else if (l instanceof Int16Array)
      f = s.SHORT;
    else if (l instanceof Uint32Array)
      f = s.UNSIGNED_INT;
    else if (l instanceof Int32Array)
      f = s.INT;
    else if (l instanceof Int8Array)
      f = s.BYTE;
    else if (l instanceof Uint8Array)
      f = s.UNSIGNED_BYTE;
    else if (l instanceof Uint8ClampedArray)
      f = s.UNSIGNED_BYTE;
    else
      throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: " + l);
    return {
      buffer: d,
      type: f,
      bytesPerElement: l.BYTES_PER_ELEMENT,
      version: o.version,
      size: u
    };
  }
  function n(o, c, l) {
    const h = c.array, u = c.updateRanges;
    if (s.bindBuffer(l, o), u.length === 0)
      s.bufferSubData(l, 0, h);
    else {
      u.sort((f, g) => f.start - g.start);
      let d = 0;
      for (let f = 1; f < u.length; f++) {
        const g = u[d], _ = u[f];
        _.start <= g.start + g.count + 1 ? g.count = Math.max(
          g.count,
          _.start + _.count - g.start
        ) : (++d, u[d] = _);
      }
      u.length = d + 1;
      for (let f = 0, g = u.length; f < g; f++) {
        const _ = u[f];
        s.bufferSubData(
          l,
          _.start * h.BYTES_PER_ELEMENT,
          h,
          _.start,
          _.count
        );
      }
      c.clearUpdateRanges();
    }
    c.onUploadCallback();
  }
  function i(o) {
    return o.isInterleavedBufferAttribute && (o = o.data), e.get(o);
  }
  function r(o) {
    o.isInterleavedBufferAttribute && (o = o.data);
    const c = e.get(o);
    c && (s.deleteBuffer(c.buffer), e.delete(o));
  }
  function a(o, c) {
    if (o.isInterleavedBufferAttribute && (o = o.data), o.isGLBufferAttribute) {
      const h = e.get(o);
      (!h || h.version < o.version) && e.set(o, {
        buffer: o.buffer,
        type: o.type,
        bytesPerElement: o.elementSize,
        version: o.version
      });
      return;
    }
    const l = e.get(o);
    if (l === void 0)
      e.set(o, t(o, c));
    else if (l.version < o.version) {
      if (l.size !== o.array.byteLength)
        throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");
      n(l.buffer, o, c), l.version = o.version;
    }
  }
  return {
    get: i,
    remove: r,
    update: a
  };
}
class ki extends Rt {
  constructor(e = 1, t = 1, n = 1, i = 1) {
    super(), this.type = "PlaneGeometry", this.parameters = {
      width: e,
      height: t,
      widthSegments: n,
      heightSegments: i
    };
    const r = e / 2, a = t / 2, o = Math.floor(n), c = Math.floor(i), l = o + 1, h = c + 1, u = e / o, d = t / c, f = [], g = [], _ = [], m = [];
    for (let p = 0; p < h; p++) {
      const E = p * d - a;
      for (let y = 0; y < l; y++) {
        const A = y * u - r;
        g.push(A, -E, 0), _.push(0, 0, 1), m.push(y / o), m.push(1 - p / c);
      }
    }
    for (let p = 0; p < c; p++)
      for (let E = 0; E < o; E++) {
        const y = E + l * p, A = E + l * (p + 1), O = E + 1 + l * (p + 1), w = E + 1 + l * p;
        f.push(y, A, w), f.push(A, O, w);
      }
    this.setIndex(f), this.setAttribute("position", new dt(g, 3)), this.setAttribute("normal", new dt(_, 3)), this.setAttribute("uv", new dt(m, 2));
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new ki(e.width, e.height, e.widthSegments, e.heightSegments);
  }
}
var dl = `#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`, fl = `#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`, pl = `#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`, ml = `#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`, gl = `#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`, _l = `#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`, xl = `#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`, vl = `#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`, Ml = `#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`, yl = `#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`, Sl = `vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`, El = `vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`, Tl = `float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`, Al = `#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`, bl = `#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`, wl = `#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`, Rl = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`, Cl = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`, Il = `#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`, Pl = `#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`, Ll = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`, Dl = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`, Ul = `#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`, Nl = `#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`, Fl = `#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`, Bl = `vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`, Ol = `#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`, kl = `#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`, zl = `#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`, Gl = `#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`, Hl = "gl_FragColor = linearToOutputTexel( gl_FragColor );", Vl = `
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`, Wl = `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`, Xl = `#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`, ql = `#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`, jl = `#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`, Yl = `#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`, Kl = `#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`, Zl = `#ifdef USE_FOG
	varying float vFogDepth;
#endif`, $l = `#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`, Jl = `#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`, Ql = `#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`, eh = `#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`, th = `LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`, nh = `varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`, ih = `uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`, sh = `#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`, rh = `ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`, ah = `varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`, oh = `BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`, ch = `varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`, lh = `PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`, hh = `struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`, uh = `
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`, dh = `#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`, fh = `#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`, ph = `#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`, mh = `#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`, gh = `#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`, _h = `#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`, xh = `#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`, vh = `#ifdef USE_MAP
	uniform sampler2D map;
#endif`, Mh = `#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`, yh = `#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`, Sh = `float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`, Eh = `#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`, Th = `#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`, Ah = `#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`, bh = `#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`, wh = `#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`, Rh = `#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`, Ch = `float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`, Ih = `#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`, Ph = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`, Lh = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`, Dh = `#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`, Uh = `#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`, Nh = `#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`, Fh = `#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`, Bh = `#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`, Oh = `#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`, kh = `#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`, zh = `vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`, Gh = `#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`, Hh = `vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`, Vh = `#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`, Wh = `#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`, Xh = `float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`, qh = `#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`, jh = `#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`, Yh = `#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`, Kh = `#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`, Zh = `float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`, $h = `#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`, Jh = `#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`, Qh = `#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`, eu = `#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`, tu = `float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`, nu = `#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`, iu = `#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`, su = `#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`, ru = `#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`, au = `#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`, ou = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`, cu = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`, lu = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`, hu = `#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;
const uu = `varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`, du = `uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, fu = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`, pu = `#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, mu = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`, gu = `uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, _u = `#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`, xu = `#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`, vu = `#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`, Mu = `#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`, yu = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`, Su = `uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, Eu = `uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`, Tu = `uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`, Au = `#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`, bu = `uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, wu = `#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`, Ru = `#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, Cu = `#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`, Iu = `#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, Pu = `#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`, Lu = `#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`, Du = `#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`, Uu = `#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, Nu = `#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`, Fu = `#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, Bu = `#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`, Ou = `#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`, ku = `uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`, zu = `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`, Gu = `#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`, Hu = `uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`, Vu = `uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`, Wu = `uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`, Ze = {
  alphahash_fragment: dl,
  alphahash_pars_fragment: fl,
  alphamap_fragment: pl,
  alphamap_pars_fragment: ml,
  alphatest_fragment: gl,
  alphatest_pars_fragment: _l,
  aomap_fragment: xl,
  aomap_pars_fragment: vl,
  batching_pars_vertex: Ml,
  batching_vertex: yl,
  begin_vertex: Sl,
  beginnormal_vertex: El,
  bsdfs: Tl,
  iridescence_fragment: Al,
  bumpmap_pars_fragment: bl,
  clipping_planes_fragment: wl,
  clipping_planes_pars_fragment: Rl,
  clipping_planes_pars_vertex: Cl,
  clipping_planes_vertex: Il,
  color_fragment: Pl,
  color_pars_fragment: Ll,
  color_pars_vertex: Dl,
  color_vertex: Ul,
  common: Nl,
  cube_uv_reflection_fragment: Fl,
  defaultnormal_vertex: Bl,
  displacementmap_pars_vertex: Ol,
  displacementmap_vertex: kl,
  emissivemap_fragment: zl,
  emissivemap_pars_fragment: Gl,
  colorspace_fragment: Hl,
  colorspace_pars_fragment: Vl,
  envmap_fragment: Wl,
  envmap_common_pars_fragment: Xl,
  envmap_pars_fragment: ql,
  envmap_pars_vertex: jl,
  envmap_physical_pars_fragment: sh,
  envmap_vertex: Yl,
  fog_vertex: Kl,
  fog_pars_vertex: Zl,
  fog_fragment: $l,
  fog_pars_fragment: Jl,
  gradientmap_pars_fragment: Ql,
  lightmap_pars_fragment: eh,
  lights_lambert_fragment: th,
  lights_lambert_pars_fragment: nh,
  lights_pars_begin: ih,
  lights_toon_fragment: rh,
  lights_toon_pars_fragment: ah,
  lights_phong_fragment: oh,
  lights_phong_pars_fragment: ch,
  lights_physical_fragment: lh,
  lights_physical_pars_fragment: hh,
  lights_fragment_begin: uh,
  lights_fragment_maps: dh,
  lights_fragment_end: fh,
  logdepthbuf_fragment: ph,
  logdepthbuf_pars_fragment: mh,
  logdepthbuf_pars_vertex: gh,
  logdepthbuf_vertex: _h,
  map_fragment: xh,
  map_pars_fragment: vh,
  map_particle_fragment: Mh,
  map_particle_pars_fragment: yh,
  metalnessmap_fragment: Sh,
  metalnessmap_pars_fragment: Eh,
  morphinstance_vertex: Th,
  morphcolor_vertex: Ah,
  morphnormal_vertex: bh,
  morphtarget_pars_vertex: wh,
  morphtarget_vertex: Rh,
  normal_fragment_begin: Ch,
  normal_fragment_maps: Ih,
  normal_pars_fragment: Ph,
  normal_pars_vertex: Lh,
  normal_vertex: Dh,
  normalmap_pars_fragment: Uh,
  clearcoat_normal_fragment_begin: Nh,
  clearcoat_normal_fragment_maps: Fh,
  clearcoat_pars_fragment: Bh,
  iridescence_pars_fragment: Oh,
  opaque_fragment: kh,
  packing: zh,
  premultiplied_alpha_fragment: Gh,
  project_vertex: Hh,
  dithering_fragment: Vh,
  dithering_pars_fragment: Wh,
  roughnessmap_fragment: Xh,
  roughnessmap_pars_fragment: qh,
  shadowmap_pars_fragment: jh,
  shadowmap_pars_vertex: Yh,
  shadowmap_vertex: Kh,
  shadowmask_pars_fragment: Zh,
  skinbase_vertex: $h,
  skinning_pars_vertex: Jh,
  skinning_vertex: Qh,
  skinnormal_vertex: eu,
  specularmap_fragment: tu,
  specularmap_pars_fragment: nu,
  tonemapping_fragment: iu,
  tonemapping_pars_fragment: su,
  transmission_fragment: ru,
  transmission_pars_fragment: au,
  uv_pars_fragment: ou,
  uv_pars_vertex: cu,
  uv_vertex: lu,
  worldpos_vertex: hu,
  background_vert: uu,
  background_frag: du,
  backgroundCube_vert: fu,
  backgroundCube_frag: pu,
  cube_vert: mu,
  cube_frag: gu,
  depth_vert: _u,
  depth_frag: xu,
  distanceRGBA_vert: vu,
  distanceRGBA_frag: Mu,
  equirect_vert: yu,
  equirect_frag: Su,
  linedashed_vert: Eu,
  linedashed_frag: Tu,
  meshbasic_vert: Au,
  meshbasic_frag: bu,
  meshlambert_vert: wu,
  meshlambert_frag: Ru,
  meshmatcap_vert: Cu,
  meshmatcap_frag: Iu,
  meshnormal_vert: Pu,
  meshnormal_frag: Lu,
  meshphong_vert: Du,
  meshphong_frag: Uu,
  meshphysical_vert: Nu,
  meshphysical_frag: Fu,
  meshtoon_vert: Bu,
  meshtoon_frag: Ou,
  points_vert: ku,
  points_frag: zu,
  shadow_vert: Gu,
  shadow_frag: Hu,
  sprite_vert: Vu,
  sprite_frag: Wu
}, he = {
  common: {
    diffuse: { value: /* @__PURE__ */ new Pe(16777215) },
    opacity: { value: 1 },
    map: { value: null },
    mapTransform: { value: /* @__PURE__ */ new $e() },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new $e() },
    alphaTest: { value: 0 }
  },
  specularmap: {
    specularMap: { value: null },
    specularMapTransform: { value: /* @__PURE__ */ new $e() }
  },
  envmap: {
    envMap: { value: null },
    envMapRotation: { value: /* @__PURE__ */ new $e() },
    flipEnvMap: { value: -1 },
    reflectivity: { value: 1 },
    // basic, lambert, phong
    ior: { value: 1.5 },
    // physical
    refractionRatio: { value: 0.98 }
    // basic, lambert, phong
  },
  aomap: {
    aoMap: { value: null },
    aoMapIntensity: { value: 1 },
    aoMapTransform: { value: /* @__PURE__ */ new $e() }
  },
  lightmap: {
    lightMap: { value: null },
    lightMapIntensity: { value: 1 },
    lightMapTransform: { value: /* @__PURE__ */ new $e() }
  },
  bumpmap: {
    bumpMap: { value: null },
    bumpMapTransform: { value: /* @__PURE__ */ new $e() },
    bumpScale: { value: 1 }
  },
  normalmap: {
    normalMap: { value: null },
    normalMapTransform: { value: /* @__PURE__ */ new $e() },
    normalScale: { value: /* @__PURE__ */ new Xe(1, 1) }
  },
  displacementmap: {
    displacementMap: { value: null },
    displacementMapTransform: { value: /* @__PURE__ */ new $e() },
    displacementScale: { value: 1 },
    displacementBias: { value: 0 }
  },
  emissivemap: {
    emissiveMap: { value: null },
    emissiveMapTransform: { value: /* @__PURE__ */ new $e() }
  },
  metalnessmap: {
    metalnessMap: { value: null },
    metalnessMapTransform: { value: /* @__PURE__ */ new $e() }
  },
  roughnessmap: {
    roughnessMap: { value: null },
    roughnessMapTransform: { value: /* @__PURE__ */ new $e() }
  },
  gradientmap: {
    gradientMap: { value: null }
  },
  fog: {
    fogDensity: { value: 25e-5 },
    fogNear: { value: 1 },
    fogFar: { value: 2e3 },
    fogColor: { value: /* @__PURE__ */ new Pe(16777215) }
  },
  lights: {
    ambientLightColor: { value: [] },
    lightProbe: { value: [] },
    directionalLights: { value: [], properties: {
      direction: {},
      color: {}
    } },
    directionalLightShadows: { value: [], properties: {
      shadowIntensity: 1,
      shadowBias: {},
      shadowNormalBias: {},
      shadowRadius: {},
      shadowMapSize: {}
    } },
    directionalShadowMap: { value: [] },
    directionalShadowMatrix: { value: [] },
    spotLights: { value: [], properties: {
      color: {},
      position: {},
      direction: {},
      distance: {},
      coneCos: {},
      penumbraCos: {},
      decay: {}
    } },
    spotLightShadows: { value: [], properties: {
      shadowIntensity: 1,
      shadowBias: {},
      shadowNormalBias: {},
      shadowRadius: {},
      shadowMapSize: {}
    } },
    spotLightMap: { value: [] },
    spotShadowMap: { value: [] },
    spotLightMatrix: { value: [] },
    pointLights: { value: [], properties: {
      color: {},
      position: {},
      decay: {},
      distance: {}
    } },
    pointLightShadows: { value: [], properties: {
      shadowIntensity: 1,
      shadowBias: {},
      shadowNormalBias: {},
      shadowRadius: {},
      shadowMapSize: {},
      shadowCameraNear: {},
      shadowCameraFar: {}
    } },
    pointShadowMap: { value: [] },
    pointShadowMatrix: { value: [] },
    hemisphereLights: { value: [], properties: {
      direction: {},
      skyColor: {},
      groundColor: {}
    } },
    // TODO (abelnation): RectAreaLight BRDF data needs to be moved from example to main src
    rectAreaLights: { value: [], properties: {
      color: {},
      position: {},
      width: {},
      height: {}
    } },
    ltc_1: { value: null },
    ltc_2: { value: null }
  },
  points: {
    diffuse: { value: /* @__PURE__ */ new Pe(16777215) },
    opacity: { value: 1 },
    size: { value: 1 },
    scale: { value: 1 },
    map: { value: null },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new $e() },
    alphaTest: { value: 0 },
    uvTransform: { value: /* @__PURE__ */ new $e() }
  },
  sprite: {
    diffuse: { value: /* @__PURE__ */ new Pe(16777215) },
    opacity: { value: 1 },
    center: { value: /* @__PURE__ */ new Xe(0.5, 0.5) },
    rotation: { value: 0 },
    map: { value: null },
    mapTransform: { value: /* @__PURE__ */ new $e() },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new $e() },
    alphaTest: { value: 0 }
  }
}, yn = {
  basic: {
    uniforms: /* @__PURE__ */ qt([
      he.common,
      he.specularmap,
      he.envmap,
      he.aomap,
      he.lightmap,
      he.fog
    ]),
    vertexShader: Ze.meshbasic_vert,
    fragmentShader: Ze.meshbasic_frag
  },
  lambert: {
    uniforms: /* @__PURE__ */ qt([
      he.common,
      he.specularmap,
      he.envmap,
      he.aomap,
      he.lightmap,
      he.emissivemap,
      he.bumpmap,
      he.normalmap,
      he.displacementmap,
      he.fog,
      he.lights,
      {
        emissive: { value: /* @__PURE__ */ new Pe(0) }
      }
    ]),
    vertexShader: Ze.meshlambert_vert,
    fragmentShader: Ze.meshlambert_frag
  },
  phong: {
    uniforms: /* @__PURE__ */ qt([
      he.common,
      he.specularmap,
      he.envmap,
      he.aomap,
      he.lightmap,
      he.emissivemap,
      he.bumpmap,
      he.normalmap,
      he.displacementmap,
      he.fog,
      he.lights,
      {
        emissive: { value: /* @__PURE__ */ new Pe(0) },
        specular: { value: /* @__PURE__ */ new Pe(1118481) },
        shininess: { value: 30 }
      }
    ]),
    vertexShader: Ze.meshphong_vert,
    fragmentShader: Ze.meshphong_frag
  },
  standard: {
    uniforms: /* @__PURE__ */ qt([
      he.common,
      he.envmap,
      he.aomap,
      he.lightmap,
      he.emissivemap,
      he.bumpmap,
      he.normalmap,
      he.displacementmap,
      he.roughnessmap,
      he.metalnessmap,
      he.fog,
      he.lights,
      {
        emissive: { value: /* @__PURE__ */ new Pe(0) },
        roughness: { value: 1 },
        metalness: { value: 0 },
        envMapIntensity: { value: 1 }
      }
    ]),
    vertexShader: Ze.meshphysical_vert,
    fragmentShader: Ze.meshphysical_frag
  },
  toon: {
    uniforms: /* @__PURE__ */ qt([
      he.common,
      he.aomap,
      he.lightmap,
      he.emissivemap,
      he.bumpmap,
      he.normalmap,
      he.displacementmap,
      he.gradientmap,
      he.fog,
      he.lights,
      {
        emissive: { value: /* @__PURE__ */ new Pe(0) }
      }
    ]),
    vertexShader: Ze.meshtoon_vert,
    fragmentShader: Ze.meshtoon_frag
  },
  matcap: {
    uniforms: /* @__PURE__ */ qt([
      he.common,
      he.bumpmap,
      he.normalmap,
      he.displacementmap,
      he.fog,
      {
        matcap: { value: null }
      }
    ]),
    vertexShader: Ze.meshmatcap_vert,
    fragmentShader: Ze.meshmatcap_frag
  },
  points: {
    uniforms: /* @__PURE__ */ qt([
      he.points,
      he.fog
    ]),
    vertexShader: Ze.points_vert,
    fragmentShader: Ze.points_frag
  },
  dashed: {
    uniforms: /* @__PURE__ */ qt([
      he.common,
      he.fog,
      {
        scale: { value: 1 },
        dashSize: { value: 1 },
        totalSize: { value: 2 }
      }
    ]),
    vertexShader: Ze.linedashed_vert,
    fragmentShader: Ze.linedashed_frag
  },
  depth: {
    uniforms: /* @__PURE__ */ qt([
      he.common,
      he.displacementmap
    ]),
    vertexShader: Ze.depth_vert,
    fragmentShader: Ze.depth_frag
  },
  normal: {
    uniforms: /* @__PURE__ */ qt([
      he.common,
      he.bumpmap,
      he.normalmap,
      he.displacementmap,
      {
        opacity: { value: 1 }
      }
    ]),
    vertexShader: Ze.meshnormal_vert,
    fragmentShader: Ze.meshnormal_frag
  },
  sprite: {
    uniforms: /* @__PURE__ */ qt([
      he.sprite,
      he.fog
    ]),
    vertexShader: Ze.sprite_vert,
    fragmentShader: Ze.sprite_frag
  },
  background: {
    uniforms: {
      uvTransform: { value: /* @__PURE__ */ new $e() },
      t2D: { value: null },
      backgroundIntensity: { value: 1 }
    },
    vertexShader: Ze.background_vert,
    fragmentShader: Ze.background_frag
  },
  backgroundCube: {
    uniforms: {
      envMap: { value: null },
      flipEnvMap: { value: -1 },
      backgroundBlurriness: { value: 0 },
      backgroundIntensity: { value: 1 },
      backgroundRotation: { value: /* @__PURE__ */ new $e() }
    },
    vertexShader: Ze.backgroundCube_vert,
    fragmentShader: Ze.backgroundCube_frag
  },
  cube: {
    uniforms: {
      tCube: { value: null },
      tFlip: { value: -1 },
      opacity: { value: 1 }
    },
    vertexShader: Ze.cube_vert,
    fragmentShader: Ze.cube_frag
  },
  equirect: {
    uniforms: {
      tEquirect: { value: null }
    },
    vertexShader: Ze.equirect_vert,
    fragmentShader: Ze.equirect_frag
  },
  distanceRGBA: {
    uniforms: /* @__PURE__ */ qt([
      he.common,
      he.displacementmap,
      {
        referencePosition: { value: /* @__PURE__ */ new L() },
        nearDistance: { value: 1 },
        farDistance: { value: 1e3 }
      }
    ]),
    vertexShader: Ze.distanceRGBA_vert,
    fragmentShader: Ze.distanceRGBA_frag
  },
  shadow: {
    uniforms: /* @__PURE__ */ qt([
      he.lights,
      he.fog,
      {
        color: { value: /* @__PURE__ */ new Pe(0) },
        opacity: { value: 1 }
      }
    ]),
    vertexShader: Ze.shadow_vert,
    fragmentShader: Ze.shadow_frag
  }
};
yn.physical = {
  uniforms: /* @__PURE__ */ qt([
    yn.standard.uniforms,
    {
      clearcoat: { value: 0 },
      clearcoatMap: { value: null },
      clearcoatMapTransform: { value: /* @__PURE__ */ new $e() },
      clearcoatNormalMap: { value: null },
      clearcoatNormalMapTransform: { value: /* @__PURE__ */ new $e() },
      clearcoatNormalScale: { value: /* @__PURE__ */ new Xe(1, 1) },
      clearcoatRoughness: { value: 0 },
      clearcoatRoughnessMap: { value: null },
      clearcoatRoughnessMapTransform: { value: /* @__PURE__ */ new $e() },
      dispersion: { value: 0 },
      iridescence: { value: 0 },
      iridescenceMap: { value: null },
      iridescenceMapTransform: { value: /* @__PURE__ */ new $e() },
      iridescenceIOR: { value: 1.3 },
      iridescenceThicknessMinimum: { value: 100 },
      iridescenceThicknessMaximum: { value: 400 },
      iridescenceThicknessMap: { value: null },
      iridescenceThicknessMapTransform: { value: /* @__PURE__ */ new $e() },
      sheen: { value: 0 },
      sheenColor: { value: /* @__PURE__ */ new Pe(0) },
      sheenColorMap: { value: null },
      sheenColorMapTransform: { value: /* @__PURE__ */ new $e() },
      sheenRoughness: { value: 1 },
      sheenRoughnessMap: { value: null },
      sheenRoughnessMapTransform: { value: /* @__PURE__ */ new $e() },
      transmission: { value: 0 },
      transmissionMap: { value: null },
      transmissionMapTransform: { value: /* @__PURE__ */ new $e() },
      transmissionSamplerSize: { value: /* @__PURE__ */ new Xe() },
      transmissionSamplerMap: { value: null },
      thickness: { value: 0 },
      thicknessMap: { value: null },
      thicknessMapTransform: { value: /* @__PURE__ */ new $e() },
      attenuationDistance: { value: 0 },
      attenuationColor: { value: /* @__PURE__ */ new Pe(0) },
      specularColor: { value: /* @__PURE__ */ new Pe(1, 1, 1) },
      specularColorMap: { value: null },
      specularColorMapTransform: { value: /* @__PURE__ */ new $e() },
      specularIntensity: { value: 1 },
      specularIntensityMap: { value: null },
      specularIntensityMapTransform: { value: /* @__PURE__ */ new $e() },
      anisotropyVector: { value: /* @__PURE__ */ new Xe() },
      anisotropyMap: { value: null },
      anisotropyMapTransform: { value: /* @__PURE__ */ new $e() }
    }
  ]),
  vertexShader: Ze.meshphysical_vert,
  fragmentShader: Ze.meshphysical_frag
};
const Ls = { r: 0, b: 0, g: 0 }, $n = /* @__PURE__ */ new xn(), Xu = /* @__PURE__ */ new qe();
function qu(s, e, t, n, i, r, a) {
  const o = new Pe(0);
  let c = r === !0 ? 0 : 1, l, h, u = null, d = 0, f = null;
  function g(E) {
    let y = E.isScene === !0 ? E.background : null;
    return y && y.isTexture && (y = (E.backgroundBlurriness > 0 ? t : e).get(y)), y;
  }
  function _(E) {
    let y = !1;
    const A = g(E);
    A === null ? p(o, c) : A && A.isColor && (p(A, 1), y = !0);
    const O = s.xr.getEnvironmentBlendMode();
    O === "additive" ? n.buffers.color.setClear(0, 0, 0, 1, a) : O === "alpha-blend" && n.buffers.color.setClear(0, 0, 0, 0, a), (s.autoClear || y) && (n.buffers.depth.setTest(!0), n.buffers.depth.setMask(!0), n.buffers.color.setMask(!0), s.clear(s.autoClearColor, s.autoClearDepth, s.autoClearStencil));
  }
  function m(E, y) {
    const A = g(y);
    A && (A.isCubeTexture || A.mapping === 306) ? (h === void 0 && (h = new We(
      new Ut(1, 1, 1),
      new Wn({
        name: "BackgroundCubeMaterial",
        uniforms: Ni(yn.backgroundCube.uniforms),
        vertexShader: yn.backgroundCube.vertexShader,
        fragmentShader: yn.backgroundCube.fragmentShader,
        side: 1,
        depthTest: !1,
        depthWrite: !1,
        fog: !1
      })
    ), h.geometry.deleteAttribute("normal"), h.geometry.deleteAttribute("uv"), h.onBeforeRender = function(O, w, R) {
      this.matrixWorld.copyPosition(R.matrixWorld);
    }, Object.defineProperty(h.material, "envMap", {
      get: function() {
        return this.uniforms.envMap.value;
      }
    }), i.update(h)), $n.copy(y.backgroundRotation), $n.x *= -1, $n.y *= -1, $n.z *= -1, A.isCubeTexture && A.isRenderTargetTexture === !1 && ($n.y *= -1, $n.z *= -1), h.material.uniforms.envMap.value = A, h.material.uniforms.flipEnvMap.value = A.isCubeTexture && A.isRenderTargetTexture === !1 ? -1 : 1, h.material.uniforms.backgroundBlurriness.value = y.backgroundBlurriness, h.material.uniforms.backgroundIntensity.value = y.backgroundIntensity, h.material.uniforms.backgroundRotation.value.setFromMatrix4(Xu.makeRotationFromEuler($n)), h.material.toneMapped = it.getTransfer(A.colorSpace) !== yt, (u !== A || d !== A.version || f !== s.toneMapping) && (h.material.needsUpdate = !0, u = A, d = A.version, f = s.toneMapping), h.layers.enableAll(), E.unshift(h, h.geometry, h.material, 0, 0, null)) : A && A.isTexture && (l === void 0 && (l = new We(
      new ki(2, 2),
      new Wn({
        name: "BackgroundMaterial",
        uniforms: Ni(yn.background.uniforms),
        vertexShader: yn.background.vertexShader,
        fragmentShader: yn.background.fragmentShader,
        side: 0,
        depthTest: !1,
        depthWrite: !1,
        fog: !1
      })
    ), l.geometry.deleteAttribute("normal"), Object.defineProperty(l.material, "map", {
      get: function() {
        return this.uniforms.t2D.value;
      }
    }), i.update(l)), l.material.uniforms.t2D.value = A, l.material.uniforms.backgroundIntensity.value = y.backgroundIntensity, l.material.toneMapped = it.getTransfer(A.colorSpace) !== yt, A.matrixAutoUpdate === !0 && A.updateMatrix(), l.material.uniforms.uvTransform.value.copy(A.matrix), (u !== A || d !== A.version || f !== s.toneMapping) && (l.material.needsUpdate = !0, u = A, d = A.version, f = s.toneMapping), l.layers.enableAll(), E.unshift(l, l.geometry, l.material, 0, 0, null));
  }
  function p(E, y) {
    E.getRGB(Ls, qo(s)), n.buffers.color.setClear(Ls.r, Ls.g, Ls.b, y, a);
  }
  return {
    getClearColor: function() {
      return o;
    },
    setClearColor: function(E, y = 1) {
      o.set(E), c = y, p(o, c);
    },
    getClearAlpha: function() {
      return c;
    },
    setClearAlpha: function(E) {
      c = E, p(o, c);
    },
    render: _,
    addToRenderList: m
  };
}
function ju(s, e) {
  const t = s.getParameter(s.MAX_VERTEX_ATTRIBS), n = {}, i = d(null);
  let r = i, a = !1;
  function o(x, T, q, X, j) {
    let te = !1;
    const W = u(X, q, T);
    r !== W && (r = W, l(r.object)), te = f(x, X, q, j), te && g(x, X, q, j), j !== null && e.update(j, s.ELEMENT_ARRAY_BUFFER), (te || a) && (a = !1, A(x, T, q, X), j !== null && s.bindBuffer(s.ELEMENT_ARRAY_BUFFER, e.get(j).buffer));
  }
  function c() {
    return s.createVertexArray();
  }
  function l(x) {
    return s.bindVertexArray(x);
  }
  function h(x) {
    return s.deleteVertexArray(x);
  }
  function u(x, T, q) {
    const X = q.wireframe === !0;
    let j = n[x.id];
    j === void 0 && (j = {}, n[x.id] = j);
    let te = j[T.id];
    te === void 0 && (te = {}, j[T.id] = te);
    let W = te[X];
    return W === void 0 && (W = d(c()), te[X] = W), W;
  }
  function d(x) {
    const T = [], q = [], X = [];
    for (let j = 0; j < t; j++)
      T[j] = 0, q[j] = 0, X[j] = 0;
    return {
      // for backward compatibility on non-VAO support browser
      geometry: null,
      program: null,
      wireframe: !1,
      newAttributes: T,
      enabledAttributes: q,
      attributeDivisors: X,
      object: x,
      attributes: {},
      index: null
    };
  }
  function f(x, T, q, X) {
    const j = r.attributes, te = T.attributes;
    let W = 0;
    const oe = q.getAttributes();
    for (const K in oe)
      if (oe[K].location >= 0) {
        const fe = j[K];
        let Ae = te[K];
        if (Ae === void 0 && (K === "instanceMatrix" && x.instanceMatrix && (Ae = x.instanceMatrix), K === "instanceColor" && x.instanceColor && (Ae = x.instanceColor)), fe === void 0 || fe.attribute !== Ae || Ae && fe.data !== Ae.data) return !0;
        W++;
      }
    return r.attributesNum !== W || r.index !== X;
  }
  function g(x, T, q, X) {
    const j = {}, te = T.attributes;
    let W = 0;
    const oe = q.getAttributes();
    for (const K in oe)
      if (oe[K].location >= 0) {
        let fe = te[K];
        fe === void 0 && (K === "instanceMatrix" && x.instanceMatrix && (fe = x.instanceMatrix), K === "instanceColor" && x.instanceColor && (fe = x.instanceColor));
        const Ae = {};
        Ae.attribute = fe, fe && fe.data && (Ae.data = fe.data), j[K] = Ae, W++;
      }
    r.attributes = j, r.attributesNum = W, r.index = X;
  }
  function _() {
    const x = r.newAttributes;
    for (let T = 0, q = x.length; T < q; T++)
      x[T] = 0;
  }
  function m(x) {
    p(x, 0);
  }
  function p(x, T) {
    const q = r.newAttributes, X = r.enabledAttributes, j = r.attributeDivisors;
    q[x] = 1, X[x] === 0 && (s.enableVertexAttribArray(x), X[x] = 1), j[x] !== T && (s.vertexAttribDivisor(x, T), j[x] = T);
  }
  function E() {
    const x = r.newAttributes, T = r.enabledAttributes;
    for (let q = 0, X = T.length; q < X; q++)
      T[q] !== x[q] && (s.disableVertexAttribArray(q), T[q] = 0);
  }
  function y(x, T, q, X, j, te, W) {
    W === !0 ? s.vertexAttribIPointer(x, T, q, j, te) : s.vertexAttribPointer(x, T, q, X, j, te);
  }
  function A(x, T, q, X) {
    _();
    const j = X.attributes, te = q.getAttributes(), W = T.defaultAttributeValues;
    for (const oe in te) {
      const K = te[oe];
      if (K.location >= 0) {
        let ge = j[oe];
        if (ge === void 0 && (oe === "instanceMatrix" && x.instanceMatrix && (ge = x.instanceMatrix), oe === "instanceColor" && x.instanceColor && (ge = x.instanceColor)), ge !== void 0) {
          const fe = ge.normalized, Ae = ge.itemSize, at = e.get(ge);
          if (at === void 0) continue;
          const lt = at.buffer, $ = at.type, ie = at.bytesPerElement, Ee = $ === s.INT || $ === s.UNSIGNED_INT || ge.gpuType === 1013;
          if (ge.isInterleavedBufferAttribute) {
            const Me = ge.data, He = Me.stride, Ue = ge.offset;
            if (Me.isInstancedInterleavedBuffer) {
              for (let Ce = 0; Ce < K.locationSize; Ce++)
                p(K.location + Ce, Me.meshPerAttribute);
              x.isInstancedMesh !== !0 && X._maxInstanceCount === void 0 && (X._maxInstanceCount = Me.meshPerAttribute * Me.count);
            } else
              for (let Ce = 0; Ce < K.locationSize; Ce++)
                m(K.location + Ce);
            s.bindBuffer(s.ARRAY_BUFFER, lt);
            for (let Ce = 0; Ce < K.locationSize; Ce++)
              y(
                K.location + Ce,
                Ae / K.locationSize,
                $,
                fe,
                He * ie,
                (Ue + Ae / K.locationSize * Ce) * ie,
                Ee
              );
          } else {
            if (ge.isInstancedBufferAttribute) {
              for (let Me = 0; Me < K.locationSize; Me++)
                p(K.location + Me, ge.meshPerAttribute);
              x.isInstancedMesh !== !0 && X._maxInstanceCount === void 0 && (X._maxInstanceCount = ge.meshPerAttribute * ge.count);
            } else
              for (let Me = 0; Me < K.locationSize; Me++)
                m(K.location + Me);
            s.bindBuffer(s.ARRAY_BUFFER, lt);
            for (let Me = 0; Me < K.locationSize; Me++)
              y(
                K.location + Me,
                Ae / K.locationSize,
                $,
                fe,
                Ae * ie,
                Ae / K.locationSize * Me * ie,
                Ee
              );
          }
        } else if (W !== void 0) {
          const fe = W[oe];
          if (fe !== void 0)
            switch (fe.length) {
              case 2:
                s.vertexAttrib2fv(K.location, fe);
                break;
              case 3:
                s.vertexAttrib3fv(K.location, fe);
                break;
              case 4:
                s.vertexAttrib4fv(K.location, fe);
                break;
              default:
                s.vertexAttrib1fv(K.location, fe);
            }
        }
      }
    }
    E();
  }
  function O() {
    k();
    for (const x in n) {
      const T = n[x];
      for (const q in T) {
        const X = T[q];
        for (const j in X)
          h(X[j].object), delete X[j];
        delete T[q];
      }
      delete n[x];
    }
  }
  function w(x) {
    if (n[x.id] === void 0) return;
    const T = n[x.id];
    for (const q in T) {
      const X = T[q];
      for (const j in X)
        h(X[j].object), delete X[j];
      delete T[q];
    }
    delete n[x.id];
  }
  function R(x) {
    for (const T in n) {
      const q = n[T];
      if (q[x.id] === void 0) continue;
      const X = q[x.id];
      for (const j in X)
        h(X[j].object), delete X[j];
      delete q[x.id];
    }
  }
  function k() {
    Q(), a = !0, r !== i && (r = i, l(r.object));
  }
  function Q() {
    i.geometry = null, i.program = null, i.wireframe = !1;
  }
  return {
    setup: o,
    reset: k,
    resetDefaultState: Q,
    dispose: O,
    releaseStatesOfGeometry: w,
    releaseStatesOfProgram: R,
    initAttributes: _,
    enableAttribute: m,
    disableUnusedAttributes: E
  };
}
function Yu(s, e, t) {
  let n;
  function i(l) {
    n = l;
  }
  function r(l, h) {
    s.drawArrays(n, l, h), t.update(h, n, 1);
  }
  function a(l, h, u) {
    u !== 0 && (s.drawArraysInstanced(n, l, h, u), t.update(h, n, u));
  }
  function o(l, h, u) {
    if (u === 0) return;
    e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n, l, 0, h, 0, u);
    let f = 0;
    for (let g = 0; g < u; g++)
      f += h[g];
    t.update(f, n, 1);
  }
  function c(l, h, u, d) {
    if (u === 0) return;
    const f = e.get("WEBGL_multi_draw");
    if (f === null)
      for (let g = 0; g < l.length; g++)
        a(l[g], h[g], d[g]);
    else {
      f.multiDrawArraysInstancedWEBGL(n, l, 0, h, 0, d, 0, u);
      let g = 0;
      for (let _ = 0; _ < u; _++)
        g += h[_];
      for (let _ = 0; _ < d.length; _++)
        t.update(g, n, d[_]);
    }
  }
  this.setMode = i, this.render = r, this.renderInstances = a, this.renderMultiDraw = o, this.renderMultiDrawInstances = c;
}
function Ku(s, e, t, n) {
  let i;
  function r() {
    if (i !== void 0) return i;
    if (e.has("EXT_texture_filter_anisotropic") === !0) {
      const R = e.get("EXT_texture_filter_anisotropic");
      i = s.getParameter(R.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    } else
      i = 0;
    return i;
  }
  function a(R) {
    return !(R !== 1023 && n.convert(R) !== s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT));
  }
  function o(R) {
    const k = R === 1016 && (e.has("EXT_color_buffer_half_float") || e.has("EXT_color_buffer_float"));
    return !(R !== 1009 && n.convert(R) !== s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE) && // Edge and Chrome Mac < 52 (#9513)
    R !== 1015 && !k);
  }
  function c(R) {
    if (R === "highp") {
      if (s.getShaderPrecisionFormat(s.VERTEX_SHADER, s.HIGH_FLOAT).precision > 0 && s.getShaderPrecisionFormat(s.FRAGMENT_SHADER, s.HIGH_FLOAT).precision > 0)
        return "highp";
      R = "mediump";
    }
    return R === "mediump" && s.getShaderPrecisionFormat(s.VERTEX_SHADER, s.MEDIUM_FLOAT).precision > 0 && s.getShaderPrecisionFormat(s.FRAGMENT_SHADER, s.MEDIUM_FLOAT).precision > 0 ? "mediump" : "lowp";
  }
  let l = t.precision !== void 0 ? t.precision : "highp";
  const h = c(l);
  h !== l && (console.warn("THREE.WebGLRenderer:", l, "not supported, using", h, "instead."), l = h);
  const u = t.logarithmicDepthBuffer === !0, d = t.reverseDepthBuffer === !0 && e.has("EXT_clip_control");
  if (d === !0) {
    const R = e.get("EXT_clip_control");
    R.clipControlEXT(R.LOWER_LEFT_EXT, R.ZERO_TO_ONE_EXT);
  }
  const f = s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS), g = s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS), _ = s.getParameter(s.MAX_TEXTURE_SIZE), m = s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE), p = s.getParameter(s.MAX_VERTEX_ATTRIBS), E = s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS), y = s.getParameter(s.MAX_VARYING_VECTORS), A = s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS), O = g > 0, w = s.getParameter(s.MAX_SAMPLES);
  return {
    isWebGL2: !0,
    // keeping this for backwards compatibility
    getMaxAnisotropy: r,
    getMaxPrecision: c,
    textureFormatReadable: a,
    textureTypeReadable: o,
    precision: l,
    logarithmicDepthBuffer: u,
    reverseDepthBuffer: d,
    maxTextures: f,
    maxVertexTextures: g,
    maxTextureSize: _,
    maxCubemapSize: m,
    maxAttributes: p,
    maxVertexUniforms: E,
    maxVaryings: y,
    maxFragmentUniforms: A,
    vertexTextures: O,
    maxSamples: w
  };
}
function Zu(s) {
  const e = this;
  let t = null, n = 0, i = !1, r = !1;
  const a = new Gn(), o = new $e(), c = { value: null, needsUpdate: !1 };
  this.uniform = c, this.numPlanes = 0, this.numIntersection = 0, this.init = function(u, d) {
    const f = u.length !== 0 || d || // enable state of previous frame - the clipping code has to
    // run another frame in order to reset the state:
    n !== 0 || i;
    return i = d, n = u.length, f;
  }, this.beginShadows = function() {
    r = !0, h(null);
  }, this.endShadows = function() {
    r = !1;
  }, this.setGlobalState = function(u, d) {
    t = h(u, d, 0);
  }, this.setState = function(u, d, f) {
    const g = u.clippingPlanes, _ = u.clipIntersection, m = u.clipShadows, p = s.get(u);
    if (!i || g === null || g.length === 0 || r && !m)
      r ? h(null) : l();
    else {
      const E = r ? 0 : n, y = E * 4;
      let A = p.clippingState || null;
      c.value = A, A = h(g, d, y, f);
      for (let O = 0; O !== y; ++O)
        A[O] = t[O];
      p.clippingState = A, this.numIntersection = _ ? this.numPlanes : 0, this.numPlanes += E;
    }
  };
  function l() {
    c.value !== t && (c.value = t, c.needsUpdate = n > 0), e.numPlanes = n, e.numIntersection = 0;
  }
  function h(u, d, f, g) {
    const _ = u !== null ? u.length : 0;
    let m = null;
    if (_ !== 0) {
      if (m = c.value, g !== !0 || m === null) {
        const p = f + _ * 4, E = d.matrixWorldInverse;
        o.getNormalMatrix(E), (m === null || m.length < p) && (m = new Float32Array(p));
        for (let y = 0, A = f; y !== _; ++y, A += 4)
          a.copy(u[y]).applyMatrix4(E, o), a.normal.toArray(m, A), m[A + 3] = a.constant;
      }
      c.value = m, c.needsUpdate = !0;
    }
    return e.numPlanes = _, e.numIntersection = 0, m;
  }
}
function $u(s) {
  let e = /* @__PURE__ */ new WeakMap();
  function t(a, o) {
    return o === 303 ? a.mapping = 301 : o === 304 && (a.mapping = 302), a;
  }
  function n(a) {
    if (a && a.isTexture) {
      const o = a.mapping;
      if (o === 303 || o === 304)
        if (e.has(a)) {
          const c = e.get(a).texture;
          return t(c, a.mapping);
        } else {
          const c = a.image;
          if (c && c.height > 0) {
            const l = new cl(c.height);
            return l.fromEquirectangularTexture(s, a), e.set(a, l), a.addEventListener("dispose", i), t(l.texture, a.mapping);
          } else
            return null;
        }
    }
    return a;
  }
  function i(a) {
    const o = a.target;
    o.removeEventListener("dispose", i);
    const c = e.get(o);
    c !== void 0 && (e.delete(o), c.dispose());
  }
  function r() {
    e = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: n,
    dispose: r
  };
}
class nr extends jo {
  constructor(e = -1, t = 1, n = 1, i = -1, r = 0.1, a = 2e3) {
    super(), this.isOrthographicCamera = !0, this.type = "OrthographicCamera", this.zoom = 1, this.view = null, this.left = e, this.right = t, this.top = n, this.bottom = i, this.near = r, this.far = a, this.updateProjectionMatrix();
  }
  copy(e, t) {
    return super.copy(e, t), this.left = e.left, this.right = e.right, this.top = e.top, this.bottom = e.bottom, this.near = e.near, this.far = e.far, this.zoom = e.zoom, this.view = e.view === null ? null : Object.assign({}, e.view), this;
  }
  setViewOffset(e, t, n, i, r, a) {
    this.view === null && (this.view = {
      enabled: !0,
      fullWidth: 1,
      fullHeight: 1,
      offsetX: 0,
      offsetY: 0,
      width: 1,
      height: 1
    }), this.view.enabled = !0, this.view.fullWidth = e, this.view.fullHeight = t, this.view.offsetX = n, this.view.offsetY = i, this.view.width = r, this.view.height = a, this.updateProjectionMatrix();
  }
  clearViewOffset() {
    this.view !== null && (this.view.enabled = !1), this.updateProjectionMatrix();
  }
  updateProjectionMatrix() {
    const e = (this.right - this.left) / (2 * this.zoom), t = (this.top - this.bottom) / (2 * this.zoom), n = (this.right + this.left) / 2, i = (this.top + this.bottom) / 2;
    let r = n - e, a = n + e, o = i + t, c = i - t;
    if (this.view !== null && this.view.enabled) {
      const l = (this.right - this.left) / this.view.fullWidth / this.zoom, h = (this.top - this.bottom) / this.view.fullHeight / this.zoom;
      r += l * this.view.offsetX, a = r + l * this.view.width, o -= h * this.view.offsetY, c = o - h * this.view.height;
    }
    this.projectionMatrix.makeOrthographic(r, a, o, c, this.near, this.far, this.coordinateSystem), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return t.object.zoom = this.zoom, t.object.left = this.left, t.object.right = this.right, t.object.top = this.top, t.object.bottom = this.bottom, t.object.near = this.near, t.object.far = this.far, this.view !== null && (t.object.view = Object.assign({}, this.view)), t;
  }
}
const wi = 4, Oa = [0.125, 0.215, 0.35, 0.446, 0.526, 0.582], ti = 20, Cr = /* @__PURE__ */ new nr(), ka = /* @__PURE__ */ new Pe();
let Ir = null, Pr = 0, Lr = 0, Dr = !1;
const ei = (1 + Math.sqrt(5)) / 2, Ti = 1 / ei, za = [
  /* @__PURE__ */ new L(-ei, Ti, 0),
  /* @__PURE__ */ new L(ei, Ti, 0),
  /* @__PURE__ */ new L(-Ti, 0, ei),
  /* @__PURE__ */ new L(Ti, 0, ei),
  /* @__PURE__ */ new L(0, ei, -Ti),
  /* @__PURE__ */ new L(0, ei, Ti),
  /* @__PURE__ */ new L(-1, 1, -1),
  /* @__PURE__ */ new L(1, 1, -1),
  /* @__PURE__ */ new L(-1, 1, 1),
  /* @__PURE__ */ new L(1, 1, 1)
];
class Ga {
  constructor(e) {
    this._renderer = e, this._pingPongRenderTarget = null, this._lodMax = 0, this._cubeSize = 0, this._lodPlanes = [], this._sizeLods = [], this._sigmas = [], this._blurMaterial = null, this._cubemapMaterial = null, this._equirectMaterial = null, this._compileMaterial(this._blurMaterial);
  }
  /**
   * Generates a PMREM from a supplied Scene, which can be faster than using an
   * image if networking bandwidth is low. Optional sigma specifies a blur radius
   * in radians to be applied to the scene before PMREM generation. Optional near
   * and far planes ensure the scene is rendered in its entirety (the cubeCamera
   * is placed at the origin).
   */
  fromScene(e, t = 0, n = 0.1, i = 100) {
    Ir = this._renderer.getRenderTarget(), Pr = this._renderer.getActiveCubeFace(), Lr = this._renderer.getActiveMipmapLevel(), Dr = this._renderer.xr.enabled, this._renderer.xr.enabled = !1, this._setSize(256);
    const r = this._allocateTargets();
    return r.depthBuffer = !0, this._sceneToCubeUV(e, n, i, r), t > 0 && this._blur(r, 0, 0, t), this._applyPMREM(r), this._cleanup(r), r;
  }
  /**
   * Generates a PMREM from an equirectangular texture, which can be either LDR
   * or HDR. The ideal input image size is 1k (1024 x 512),
   * as this matches best with the 256 x 256 cubemap output.
   * The smallest supported equirectangular image size is 64 x 32.
   */
  fromEquirectangular(e, t = null) {
    return this._fromTexture(e, t);
  }
  /**
   * Generates a PMREM from an cubemap texture, which can be either LDR
   * or HDR. The ideal input cube size is 256 x 256,
   * as this matches best with the 256 x 256 cubemap output.
   * The smallest supported cube size is 16 x 16.
   */
  fromCubemap(e, t = null) {
    return this._fromTexture(e, t);
  }
  /**
   * Pre-compiles the cubemap shader. You can get faster start-up by invoking this method during
   * your texture's network fetch for increased concurrency.
   */
  compileCubemapShader() {
    this._cubemapMaterial === null && (this._cubemapMaterial = Wa(), this._compileMaterial(this._cubemapMaterial));
  }
  /**
   * Pre-compiles the equirectangular shader. You can get faster start-up by invoking this method during
   * your texture's network fetch for increased concurrency.
   */
  compileEquirectangularShader() {
    this._equirectMaterial === null && (this._equirectMaterial = Va(), this._compileMaterial(this._equirectMaterial));
  }
  /**
   * Disposes of the PMREMGenerator's internal memory. Note that PMREMGenerator is a static class,
   * so you should not need more than one PMREMGenerator object. If you do, calling dispose() on
   * one of them will cause any others to also become unusable.
   */
  dispose() {
    this._dispose(), this._cubemapMaterial !== null && this._cubemapMaterial.dispose(), this._equirectMaterial !== null && this._equirectMaterial.dispose();
  }
  // private interface
  _setSize(e) {
    this._lodMax = Math.floor(Math.log2(e)), this._cubeSize = Math.pow(2, this._lodMax);
  }
  _dispose() {
    this._blurMaterial !== null && this._blurMaterial.dispose(), this._pingPongRenderTarget !== null && this._pingPongRenderTarget.dispose();
    for (let e = 0; e < this._lodPlanes.length; e++)
      this._lodPlanes[e].dispose();
  }
  _cleanup(e) {
    this._renderer.setRenderTarget(Ir, Pr, Lr), this._renderer.xr.enabled = Dr, e.scissorTest = !1, Ds(e, 0, 0, e.width, e.height);
  }
  _fromTexture(e, t) {
    e.mapping === 301 || e.mapping === 302 ? this._setSize(e.image.length === 0 ? 16 : e.image[0].width || e.image[0].image.width) : this._setSize(e.image.width / 4), Ir = this._renderer.getRenderTarget(), Pr = this._renderer.getActiveCubeFace(), Lr = this._renderer.getActiveMipmapLevel(), Dr = this._renderer.xr.enabled, this._renderer.xr.enabled = !1;
    const n = t || this._allocateTargets();
    return this._textureToCubeUV(e, n), this._applyPMREM(n), this._cleanup(n), n;
  }
  _allocateTargets() {
    const e = 3 * Math.max(this._cubeSize, 112), t = 4 * this._cubeSize, n = {
      magFilter: 1006,
      minFilter: 1006,
      generateMipmaps: !1,
      type: 1016,
      format: 1023,
      colorSpace: Bt,
      depthBuffer: !1
    }, i = Ha(e, t, n);
    if (this._pingPongRenderTarget === null || this._pingPongRenderTarget.width !== e || this._pingPongRenderTarget.height !== t) {
      this._pingPongRenderTarget !== null && this._dispose(), this._pingPongRenderTarget = Ha(e, t, n);
      const { _lodMax: r } = this;
      ({ sizeLods: this._sizeLods, lodPlanes: this._lodPlanes, sigmas: this._sigmas } = Ju(r)), this._blurMaterial = Qu(r, e, t);
    }
    return i;
  }
  _compileMaterial(e) {
    const t = new We(this._lodPlanes[0], e);
    this._renderer.compile(t, Cr);
  }
  _sceneToCubeUV(e, t, n, i) {
    const o = new $t(90, 1, t, n), c = [1, -1, 1, 1, 1, 1], l = [1, 1, 1, -1, -1, -1], h = this._renderer, u = h.autoClear, d = h.toneMapping;
    h.getClearColor(ka), h.toneMapping = 0, h.autoClear = !1;
    const f = new bt({
      name: "PMREM.Background",
      side: 1,
      depthWrite: !1,
      depthTest: !1
    }), g = new We(new Ut(), f);
    let _ = !1;
    const m = e.background;
    m ? m.isColor && (f.color.copy(m), e.background = null, _ = !0) : (f.color.copy(ka), _ = !0);
    for (let p = 0; p < 6; p++) {
      const E = p % 3;
      E === 0 ? (o.up.set(0, c[p], 0), o.lookAt(l[p], 0, 0)) : E === 1 ? (o.up.set(0, 0, c[p]), o.lookAt(0, l[p], 0)) : (o.up.set(0, c[p], 0), o.lookAt(0, 0, l[p]));
      const y = this._cubeSize;
      Ds(i, E * y, p > 2 ? y : 0, y, y), h.setRenderTarget(i), _ && h.render(g, o), h.render(e, o);
    }
    g.geometry.dispose(), g.material.dispose(), h.toneMapping = d, h.autoClear = u, e.background = m;
  }
  _textureToCubeUV(e, t) {
    const n = this._renderer, i = e.mapping === 301 || e.mapping === 302;
    i ? (this._cubemapMaterial === null && (this._cubemapMaterial = Wa()), this._cubemapMaterial.uniforms.flipEnvMap.value = e.isRenderTargetTexture === !1 ? -1 : 1) : this._equirectMaterial === null && (this._equirectMaterial = Va());
    const r = i ? this._cubemapMaterial : this._equirectMaterial, a = new We(this._lodPlanes[0], r), o = r.uniforms;
    o.envMap.value = e;
    const c = this._cubeSize;
    Ds(t, 0, 0, 3 * c, 2 * c), n.setRenderTarget(t), n.render(a, Cr);
  }
  _applyPMREM(e) {
    const t = this._renderer, n = t.autoClear;
    t.autoClear = !1;
    const i = this._lodPlanes.length;
    for (let r = 1; r < i; r++) {
      const a = Math.sqrt(this._sigmas[r] * this._sigmas[r] - this._sigmas[r - 1] * this._sigmas[r - 1]), o = za[(i - r - 1) % za.length];
      this._blur(e, r - 1, r, a, o);
    }
    t.autoClear = n;
  }
  /**
   * This is a two-pass Gaussian blur for a cubemap. Normally this is done
   * vertically and horizontally, but this breaks down on a cube. Here we apply
   * the blur latitudinally (around the poles), and then longitudinally (towards
   * the poles) to approximate the orthogonally-separable blur. It is least
   * accurate at the poles, but still does a decent job.
   */
  _blur(e, t, n, i, r) {
    const a = this._pingPongRenderTarget;
    this._halfBlur(
      e,
      a,
      t,
      n,
      i,
      "latitudinal",
      r
    ), this._halfBlur(
      a,
      e,
      n,
      n,
      i,
      "longitudinal",
      r
    );
  }
  _halfBlur(e, t, n, i, r, a, o) {
    const c = this._renderer, l = this._blurMaterial;
    a !== "latitudinal" && a !== "longitudinal" && console.error(
      "blur direction must be either latitudinal or longitudinal!"
    );
    const h = 3, u = new We(this._lodPlanes[i], l), d = l.uniforms, f = this._sizeLods[n] - 1, g = isFinite(r) ? Math.PI / (2 * f) : 2 * Math.PI / (2 * ti - 1), _ = r / g, m = isFinite(r) ? 1 + Math.floor(h * _) : ti;
    m > ti && console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${ti}`);
    const p = [];
    let E = 0;
    for (let R = 0; R < ti; ++R) {
      const k = R / _, Q = Math.exp(-k * k / 2);
      p.push(Q), R === 0 ? E += Q : R < m && (E += 2 * Q);
    }
    for (let R = 0; R < p.length; R++)
      p[R] = p[R] / E;
    d.envMap.value = e.texture, d.samples.value = m, d.weights.value = p, d.latitudinal.value = a === "latitudinal", o && (d.poleAxis.value = o);
    const { _lodMax: y } = this;
    d.dTheta.value = g, d.mipInt.value = y - n;
    const A = this._sizeLods[i], O = 3 * A * (i > y - wi ? i - y + wi : 0), w = 4 * (this._cubeSize - A);
    Ds(t, O, w, 3 * A, 2 * A), c.setRenderTarget(t), c.render(u, Cr);
  }
}
function Ju(s) {
  const e = [], t = [], n = [];
  let i = s;
  const r = s - wi + 1 + Oa.length;
  for (let a = 0; a < r; a++) {
    const o = Math.pow(2, i);
    t.push(o);
    let c = 1 / o;
    a > s - wi ? c = Oa[a - s + wi - 1] : a === 0 && (c = 0), n.push(c);
    const l = 1 / (o - 2), h = -l, u = 1 + l, d = [h, h, u, h, u, u, h, h, u, u, h, u], f = 6, g = 6, _ = 3, m = 2, p = 1, E = new Float32Array(_ * g * f), y = new Float32Array(m * g * f), A = new Float32Array(p * g * f);
    for (let w = 0; w < f; w++) {
      const R = w % 3 * 2 / 3 - 1, k = w > 2 ? 0 : -1, Q = [
        R,
        k,
        0,
        R + 2 / 3,
        k,
        0,
        R + 2 / 3,
        k + 1,
        0,
        R,
        k,
        0,
        R + 2 / 3,
        k + 1,
        0,
        R,
        k + 1,
        0
      ];
      E.set(Q, _ * g * w), y.set(d, m * g * w);
      const x = [w, w, w, w, w, w];
      A.set(x, p * g * w);
    }
    const O = new Rt();
    O.setAttribute("position", new jt(E, _)), O.setAttribute("uv", new jt(y, m)), O.setAttribute("faceIndex", new jt(A, p)), e.push(O), i > wi && i--;
  }
  return { lodPlanes: e, sizeLods: t, sigmas: n };
}
function Ha(s, e, t) {
  const n = new si(s, e, t);
  return n.texture.mapping = 306, n.texture.name = "PMREM.cubeUv", n.scissorTest = !0, n;
}
function Ds(s, e, t, n, i) {
  s.viewport.set(e, t, n, i), s.scissor.set(e, t, n, i);
}
function Qu(s, e, t) {
  const n = new Float32Array(ti), i = new L(0, 1, 0);
  return new Wn({
    name: "SphericalGaussianBlur",
    defines: {
      n: ti,
      CUBEUV_TEXEL_WIDTH: 1 / e,
      CUBEUV_TEXEL_HEIGHT: 1 / t,
      CUBEUV_MAX_MIP: `${s}.0`
    },
    uniforms: {
      envMap: { value: null },
      samples: { value: 1 },
      weights: { value: n },
      latitudinal: { value: !1 },
      dTheta: { value: 0 },
      mipInt: { value: 0 },
      poleAxis: { value: i }
    },
    vertexShader: aa(),
    fragmentShader: (
      /* glsl */
      `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`
    ),
    blending: 0,
    depthTest: !1,
    depthWrite: !1
  });
}
function Va() {
  return new Wn({
    name: "EquirectangularToCubeUV",
    uniforms: {
      envMap: { value: null }
    },
    vertexShader: aa(),
    fragmentShader: (
      /* glsl */
      `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`
    ),
    blending: 0,
    depthTest: !1,
    depthWrite: !1
  });
}
function Wa() {
  return new Wn({
    name: "CubemapToCubeUV",
    uniforms: {
      envMap: { value: null },
      flipEnvMap: { value: -1 }
    },
    vertexShader: aa(),
    fragmentShader: (
      /* glsl */
      `

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`
    ),
    blending: 0,
    depthTest: !1,
    depthWrite: !1
  });
}
function aa() {
  return (
    /* glsl */
    `

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`
  );
}
function ed(s) {
  let e = /* @__PURE__ */ new WeakMap(), t = null;
  function n(o) {
    if (o && o.isTexture) {
      const c = o.mapping, l = c === 303 || c === 304, h = c === 301 || c === 302;
      if (l || h) {
        let u = e.get(o);
        const d = u !== void 0 ? u.texture.pmremVersion : 0;
        if (o.isRenderTargetTexture && o.pmremVersion !== d)
          return t === null && (t = new Ga(s)), u = l ? t.fromEquirectangular(o, u) : t.fromCubemap(o, u), u.texture.pmremVersion = o.pmremVersion, e.set(o, u), u.texture;
        if (u !== void 0)
          return u.texture;
        {
          const f = o.image;
          return l && f && f.height > 0 || h && f && i(f) ? (t === null && (t = new Ga(s)), u = l ? t.fromEquirectangular(o) : t.fromCubemap(o), u.texture.pmremVersion = o.pmremVersion, e.set(o, u), o.addEventListener("dispose", r), u.texture) : null;
        }
      }
    }
    return o;
  }
  function i(o) {
    let c = 0;
    const l = 6;
    for (let h = 0; h < l; h++)
      o[h] !== void 0 && c++;
    return c === l;
  }
  function r(o) {
    const c = o.target;
    c.removeEventListener("dispose", r);
    const l = e.get(c);
    l !== void 0 && (e.delete(c), l.dispose());
  }
  function a() {
    e = /* @__PURE__ */ new WeakMap(), t !== null && (t.dispose(), t = null);
  }
  return {
    get: n,
    dispose: a
  };
}
function td(s) {
  const e = {};
  function t(n) {
    if (e[n] !== void 0)
      return e[n];
    let i;
    switch (n) {
      case "WEBGL_depth_texture":
        i = s.getExtension("WEBGL_depth_texture") || s.getExtension("MOZ_WEBGL_depth_texture") || s.getExtension("WEBKIT_WEBGL_depth_texture");
        break;
      case "EXT_texture_filter_anisotropic":
        i = s.getExtension("EXT_texture_filter_anisotropic") || s.getExtension("MOZ_EXT_texture_filter_anisotropic") || s.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
        break;
      case "WEBGL_compressed_texture_s3tc":
        i = s.getExtension("WEBGL_compressed_texture_s3tc") || s.getExtension("MOZ_WEBGL_compressed_texture_s3tc") || s.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
        break;
      case "WEBGL_compressed_texture_pvrtc":
        i = s.getExtension("WEBGL_compressed_texture_pvrtc") || s.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");
        break;
      default:
        i = s.getExtension(n);
    }
    return e[n] = i, i;
  }
  return {
    has: function(n) {
      return t(n) !== null;
    },
    init: function() {
      t("EXT_color_buffer_float"), t("WEBGL_clip_cull_distance"), t("OES_texture_float_linear"), t("EXT_color_buffer_half_float"), t("WEBGL_multisampled_render_to_texture"), t("WEBGL_render_shared_exponent");
    },
    get: function(n) {
      const i = t(n);
      return i === null && js("THREE.WebGLRenderer: " + n + " extension not supported."), i;
    }
  };
}
function nd(s, e, t, n) {
  const i = {}, r = /* @__PURE__ */ new WeakMap();
  function a(u) {
    const d = u.target;
    d.index !== null && e.remove(d.index);
    for (const g in d.attributes)
      e.remove(d.attributes[g]);
    for (const g in d.morphAttributes) {
      const _ = d.morphAttributes[g];
      for (let m = 0, p = _.length; m < p; m++)
        e.remove(_[m]);
    }
    d.removeEventListener("dispose", a), delete i[d.id];
    const f = r.get(d);
    f && (e.remove(f), r.delete(d)), n.releaseStatesOfGeometry(d), d.isInstancedBufferGeometry === !0 && delete d._maxInstanceCount, t.memory.geometries--;
  }
  function o(u, d) {
    return i[d.id] === !0 || (d.addEventListener("dispose", a), i[d.id] = !0, t.memory.geometries++), d;
  }
  function c(u) {
    const d = u.attributes;
    for (const g in d)
      e.update(d[g], s.ARRAY_BUFFER);
    const f = u.morphAttributes;
    for (const g in f) {
      const _ = f[g];
      for (let m = 0, p = _.length; m < p; m++)
        e.update(_[m], s.ARRAY_BUFFER);
    }
  }
  function l(u) {
    const d = [], f = u.index, g = u.attributes.position;
    let _ = 0;
    if (f !== null) {
      const E = f.array;
      _ = f.version;
      for (let y = 0, A = E.length; y < A; y += 3) {
        const O = E[y + 0], w = E[y + 1], R = E[y + 2];
        d.push(O, w, w, R, R, O);
      }
    } else if (g !== void 0) {
      const E = g.array;
      _ = g.version;
      for (let y = 0, A = E.length / 3 - 1; y < A; y += 3) {
        const O = y + 0, w = y + 1, R = y + 2;
        d.push(O, w, w, R, R, O);
      }
    } else
      return;
    const m = new (zo(d) ? Xo : Wo)(d, 1);
    m.version = _;
    const p = r.get(u);
    p && e.remove(p), r.set(u, m);
  }
  function h(u) {
    const d = r.get(u);
    if (d) {
      const f = u.index;
      f !== null && d.version < f.version && l(u);
    } else
      l(u);
    return r.get(u);
  }
  return {
    get: o,
    update: c,
    getWireframeAttribute: h
  };
}
function id(s, e, t) {
  let n;
  function i(d) {
    n = d;
  }
  let r, a;
  function o(d) {
    r = d.type, a = d.bytesPerElement;
  }
  function c(d, f) {
    s.drawElements(n, f, r, d * a), t.update(f, n, 1);
  }
  function l(d, f, g) {
    g !== 0 && (s.drawElementsInstanced(n, f, r, d * a, g), t.update(f, n, g));
  }
  function h(d, f, g) {
    if (g === 0) return;
    e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n, f, 0, r, d, 0, g);
    let m = 0;
    for (let p = 0; p < g; p++)
      m += f[p];
    t.update(m, n, 1);
  }
  function u(d, f, g, _) {
    if (g === 0) return;
    const m = e.get("WEBGL_multi_draw");
    if (m === null)
      for (let p = 0; p < d.length; p++)
        l(d[p] / a, f[p], _[p]);
    else {
      m.multiDrawElementsInstancedWEBGL(n, f, 0, r, d, 0, _, 0, g);
      let p = 0;
      for (let E = 0; E < g; E++)
        p += f[E];
      for (let E = 0; E < _.length; E++)
        t.update(p, n, _[E]);
    }
  }
  this.setMode = i, this.setIndex = o, this.render = c, this.renderInstances = l, this.renderMultiDraw = h, this.renderMultiDrawInstances = u;
}
function sd(s) {
  const e = {
    geometries: 0,
    textures: 0
  }, t = {
    frame: 0,
    calls: 0,
    triangles: 0,
    points: 0,
    lines: 0
  };
  function n(r, a, o) {
    switch (t.calls++, a) {
      case s.TRIANGLES:
        t.triangles += o * (r / 3);
        break;
      case s.LINES:
        t.lines += o * (r / 2);
        break;
      case s.LINE_STRIP:
        t.lines += o * (r - 1);
        break;
      case s.LINE_LOOP:
        t.lines += o * r;
        break;
      case s.POINTS:
        t.points += o * r;
        break;
      default:
        console.error("THREE.WebGLInfo: Unknown draw mode:", a);
        break;
    }
  }
  function i() {
    t.calls = 0, t.triangles = 0, t.points = 0, t.lines = 0;
  }
  return {
    memory: e,
    render: t,
    programs: null,
    autoReset: !0,
    reset: i,
    update: n
  };
}
function rd(s, e, t) {
  const n = /* @__PURE__ */ new WeakMap(), i = new ut();
  function r(a, o, c) {
    const l = a.morphTargetInfluences, h = o.morphAttributes.position || o.morphAttributes.normal || o.morphAttributes.color, u = h !== void 0 ? h.length : 0;
    let d = n.get(o);
    if (d === void 0 || d.count !== u) {
      let Q = function() {
        R.dispose(), n.delete(o), o.removeEventListener("dispose", Q);
      };
      d !== void 0 && d.texture.dispose();
      const f = o.morphAttributes.position !== void 0, g = o.morphAttributes.normal !== void 0, _ = o.morphAttributes.color !== void 0, m = o.morphAttributes.position || [], p = o.morphAttributes.normal || [], E = o.morphAttributes.color || [];
      let y = 0;
      f === !0 && (y = 1), g === !0 && (y = 2), _ === !0 && (y = 3);
      let A = o.attributes.position.count * y, O = 1;
      A > e.maxTextureSize && (O = Math.ceil(A / e.maxTextureSize), A = e.maxTextureSize);
      const w = new Float32Array(A * O * 4 * u), R = new Ho(w, A, O, u);
      R.type = 1015, R.needsUpdate = !0;
      const k = y * 4;
      for (let x = 0; x < u; x++) {
        const T = m[x], q = p[x], X = E[x], j = A * O * 4 * x;
        for (let te = 0; te < T.count; te++) {
          const W = te * k;
          f === !0 && (i.fromBufferAttribute(T, te), w[j + W + 0] = i.x, w[j + W + 1] = i.y, w[j + W + 2] = i.z, w[j + W + 3] = 0), g === !0 && (i.fromBufferAttribute(q, te), w[j + W + 4] = i.x, w[j + W + 5] = i.y, w[j + W + 6] = i.z, w[j + W + 7] = 0), _ === !0 && (i.fromBufferAttribute(X, te), w[j + W + 8] = i.x, w[j + W + 9] = i.y, w[j + W + 10] = i.z, w[j + W + 11] = X.itemSize === 4 ? i.w : 1);
        }
      }
      d = {
        count: u,
        texture: R,
        size: new Xe(A, O)
      }, n.set(o, d), o.addEventListener("dispose", Q);
    }
    if (a.isInstancedMesh === !0 && a.morphTexture !== null)
      c.getUniforms().setValue(s, "morphTexture", a.morphTexture, t);
    else {
      let f = 0;
      for (let _ = 0; _ < l.length; _++)
        f += l[_];
      const g = o.morphTargetsRelative ? 1 : 1 - f;
      c.getUniforms().setValue(s, "morphTargetBaseInfluence", g), c.getUniforms().setValue(s, "morphTargetInfluences", l);
    }
    c.getUniforms().setValue(s, "morphTargetsTexture", d.texture, t), c.getUniforms().setValue(s, "morphTargetsTextureSize", d.size);
  }
  return {
    update: r
  };
}
function ad(s, e, t, n) {
  let i = /* @__PURE__ */ new WeakMap();
  function r(c) {
    const l = n.render.frame, h = c.geometry, u = e.get(c, h);
    if (i.get(u) !== l && (e.update(u), i.set(u, l)), c.isInstancedMesh && (c.hasEventListener("dispose", o) === !1 && c.addEventListener("dispose", o), i.get(c) !== l && (t.update(c.instanceMatrix, s.ARRAY_BUFFER), c.instanceColor !== null && t.update(c.instanceColor, s.ARRAY_BUFFER), i.set(c, l))), c.isSkinnedMesh) {
      const d = c.skeleton;
      i.get(d) !== l && (d.update(), i.set(d, l));
    }
    return u;
  }
  function a() {
    i = /* @__PURE__ */ new WeakMap();
  }
  function o(c) {
    const l = c.target;
    l.removeEventListener("dispose", o), t.remove(l.instanceMatrix), l.instanceColor !== null && t.remove(l.instanceColor);
  }
  return {
    update: r,
    dispose: a
  };
}
class Zo extends It {
  constructor(e, t, n, i, r, a, o, c, l, h = 1026) {
    if (h !== 1026 && h !== 1027)
      throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");
    n === void 0 && h === 1026 && (n = 1014), n === void 0 && h === 1027 && (n = 1020), super(null, i, r, a, o, c, h, n, l), this.isDepthTexture = !0, this.image = { width: e, height: t }, this.magFilter = o !== void 0 ? o : 1003, this.minFilter = c !== void 0 ? c : 1003, this.flipY = !1, this.generateMipmaps = !1, this.compareFunction = null;
  }
  copy(e) {
    return super.copy(e), this.compareFunction = e.compareFunction, this;
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return this.compareFunction !== null && (t.compareFunction = this.compareFunction), t;
  }
}
const $o = /* @__PURE__ */ new It(), Xa = /* @__PURE__ */ new Zo(1, 1), Jo = /* @__PURE__ */ new Ho(), Qo = /* @__PURE__ */ new qc(), ec = /* @__PURE__ */ new Yo(), qa = [], ja = [], Ya = new Float32Array(16), Ka = new Float32Array(9), Za = new Float32Array(4);
function zi(s, e, t) {
  const n = s[0];
  if (n <= 0 || n > 0) return s;
  const i = e * t;
  let r = qa[i];
  if (r === void 0 && (r = new Float32Array(i), qa[i] = r), e !== 0) {
    n.toArray(r, 0);
    for (let a = 1, o = 0; a !== e; ++a)
      o += t, s[a].toArray(r, o);
  }
  return r;
}
function Pt(s, e) {
  if (s.length !== e.length) return !1;
  for (let t = 0, n = s.length; t < n; t++)
    if (s[t] !== e[t]) return !1;
  return !0;
}
function Lt(s, e) {
  for (let t = 0, n = e.length; t < n; t++)
    s[t] = e[t];
}
function ir(s, e) {
  let t = ja[e];
  t === void 0 && (t = new Int32Array(e), ja[e] = t);
  for (let n = 0; n !== e; ++n)
    t[n] = s.allocateTextureUnit();
  return t;
}
function od(s, e) {
  const t = this.cache;
  t[0] !== e && (s.uniform1f(this.addr, e), t[0] = e);
}
function cd(s, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y) && (s.uniform2f(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);
  else {
    if (Pt(t, e)) return;
    s.uniform2fv(this.addr, e), Lt(t, e);
  }
}
function ld(s, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (s.uniform3f(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);
  else if (e.r !== void 0)
    (t[0] !== e.r || t[1] !== e.g || t[2] !== e.b) && (s.uniform3f(this.addr, e.r, e.g, e.b), t[0] = e.r, t[1] = e.g, t[2] = e.b);
  else {
    if (Pt(t, e)) return;
    s.uniform3fv(this.addr, e), Lt(t, e);
  }
}
function hd(s, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (s.uniform4f(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);
  else {
    if (Pt(t, e)) return;
    s.uniform4fv(this.addr, e), Lt(t, e);
  }
}
function ud(s, e) {
  const t = this.cache, n = e.elements;
  if (n === void 0) {
    if (Pt(t, e)) return;
    s.uniformMatrix2fv(this.addr, !1, e), Lt(t, e);
  } else {
    if (Pt(t, n)) return;
    Za.set(n), s.uniformMatrix2fv(this.addr, !1, Za), Lt(t, n);
  }
}
function dd(s, e) {
  const t = this.cache, n = e.elements;
  if (n === void 0) {
    if (Pt(t, e)) return;
    s.uniformMatrix3fv(this.addr, !1, e), Lt(t, e);
  } else {
    if (Pt(t, n)) return;
    Ka.set(n), s.uniformMatrix3fv(this.addr, !1, Ka), Lt(t, n);
  }
}
function fd(s, e) {
  const t = this.cache, n = e.elements;
  if (n === void 0) {
    if (Pt(t, e)) return;
    s.uniformMatrix4fv(this.addr, !1, e), Lt(t, e);
  } else {
    if (Pt(t, n)) return;
    Ya.set(n), s.uniformMatrix4fv(this.addr, !1, Ya), Lt(t, n);
  }
}
function pd(s, e) {
  const t = this.cache;
  t[0] !== e && (s.uniform1i(this.addr, e), t[0] = e);
}
function md(s, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y) && (s.uniform2i(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);
  else {
    if (Pt(t, e)) return;
    s.uniform2iv(this.addr, e), Lt(t, e);
  }
}
function gd(s, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (s.uniform3i(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);
  else {
    if (Pt(t, e)) return;
    s.uniform3iv(this.addr, e), Lt(t, e);
  }
}
function _d(s, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (s.uniform4i(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);
  else {
    if (Pt(t, e)) return;
    s.uniform4iv(this.addr, e), Lt(t, e);
  }
}
function xd(s, e) {
  const t = this.cache;
  t[0] !== e && (s.uniform1ui(this.addr, e), t[0] = e);
}
function vd(s, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y) && (s.uniform2ui(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);
  else {
    if (Pt(t, e)) return;
    s.uniform2uiv(this.addr, e), Lt(t, e);
  }
}
function Md(s, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (s.uniform3ui(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);
  else {
    if (Pt(t, e)) return;
    s.uniform3uiv(this.addr, e), Lt(t, e);
  }
}
function yd(s, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (s.uniform4ui(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);
  else {
    if (Pt(t, e)) return;
    s.uniform4uiv(this.addr, e), Lt(t, e);
  }
}
function Sd(s, e, t) {
  const n = this.cache, i = t.allocateTextureUnit();
  n[0] !== i && (s.uniform1i(this.addr, i), n[0] = i);
  let r;
  this.type === s.SAMPLER_2D_SHADOW ? (Xa.compareFunction = 515, r = Xa) : r = $o, t.setTexture2D(e || r, i);
}
function Ed(s, e, t) {
  const n = this.cache, i = t.allocateTextureUnit();
  n[0] !== i && (s.uniform1i(this.addr, i), n[0] = i), t.setTexture3D(e || Qo, i);
}
function Td(s, e, t) {
  const n = this.cache, i = t.allocateTextureUnit();
  n[0] !== i && (s.uniform1i(this.addr, i), n[0] = i), t.setTextureCube(e || ec, i);
}
function Ad(s, e, t) {
  const n = this.cache, i = t.allocateTextureUnit();
  n[0] !== i && (s.uniform1i(this.addr, i), n[0] = i), t.setTexture2DArray(e || Jo, i);
}
function bd(s) {
  switch (s) {
    case 5126:
      return od;
    case 35664:
      return cd;
    case 35665:
      return ld;
    case 35666:
      return hd;
    case 35674:
      return ud;
    case 35675:
      return dd;
    case 35676:
      return fd;
    case 5124:
    case 35670:
      return pd;
    case 35667:
    case 35671:
      return md;
    case 35668:
    case 35672:
      return gd;
    case 35669:
    case 35673:
      return _d;
    case 5125:
      return xd;
    case 36294:
      return vd;
    case 36295:
      return Md;
    case 36296:
      return yd;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return Sd;
    case 35679:
    case 36299:
    case 36307:
      return Ed;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return Td;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return Ad;
  }
}
function wd(s, e) {
  s.uniform1fv(this.addr, e);
}
function Rd(s, e) {
  const t = zi(e, this.size, 2);
  s.uniform2fv(this.addr, t);
}
function Cd(s, e) {
  const t = zi(e, this.size, 3);
  s.uniform3fv(this.addr, t);
}
function Id(s, e) {
  const t = zi(e, this.size, 4);
  s.uniform4fv(this.addr, t);
}
function Pd(s, e) {
  const t = zi(e, this.size, 4);
  s.uniformMatrix2fv(this.addr, !1, t);
}
function Ld(s, e) {
  const t = zi(e, this.size, 9);
  s.uniformMatrix3fv(this.addr, !1, t);
}
function Dd(s, e) {
  const t = zi(e, this.size, 16);
  s.uniformMatrix4fv(this.addr, !1, t);
}
function Ud(s, e) {
  s.uniform1iv(this.addr, e);
}
function Nd(s, e) {
  s.uniform2iv(this.addr, e);
}
function Fd(s, e) {
  s.uniform3iv(this.addr, e);
}
function Bd(s, e) {
  s.uniform4iv(this.addr, e);
}
function Od(s, e) {
  s.uniform1uiv(this.addr, e);
}
function kd(s, e) {
  s.uniform2uiv(this.addr, e);
}
function zd(s, e) {
  s.uniform3uiv(this.addr, e);
}
function Gd(s, e) {
  s.uniform4uiv(this.addr, e);
}
function Hd(s, e, t) {
  const n = this.cache, i = e.length, r = ir(t, i);
  Pt(n, r) || (s.uniform1iv(this.addr, r), Lt(n, r));
  for (let a = 0; a !== i; ++a)
    t.setTexture2D(e[a] || $o, r[a]);
}
function Vd(s, e, t) {
  const n = this.cache, i = e.length, r = ir(t, i);
  Pt(n, r) || (s.uniform1iv(this.addr, r), Lt(n, r));
  for (let a = 0; a !== i; ++a)
    t.setTexture3D(e[a] || Qo, r[a]);
}
function Wd(s, e, t) {
  const n = this.cache, i = e.length, r = ir(t, i);
  Pt(n, r) || (s.uniform1iv(this.addr, r), Lt(n, r));
  for (let a = 0; a !== i; ++a)
    t.setTextureCube(e[a] || ec, r[a]);
}
function Xd(s, e, t) {
  const n = this.cache, i = e.length, r = ir(t, i);
  Pt(n, r) || (s.uniform1iv(this.addr, r), Lt(n, r));
  for (let a = 0; a !== i; ++a)
    t.setTexture2DArray(e[a] || Jo, r[a]);
}
function qd(s) {
  switch (s) {
    case 5126:
      return wd;
    case 35664:
      return Rd;
    case 35665:
      return Cd;
    case 35666:
      return Id;
    case 35674:
      return Pd;
    case 35675:
      return Ld;
    case 35676:
      return Dd;
    case 5124:
    case 35670:
      return Ud;
    case 35667:
    case 35671:
      return Nd;
    case 35668:
    case 35672:
      return Fd;
    case 35669:
    case 35673:
      return Bd;
    case 5125:
      return Od;
    case 36294:
      return kd;
    case 36295:
      return zd;
    case 36296:
      return Gd;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return Hd;
    case 35679:
    case 36299:
    case 36307:
      return Vd;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return Wd;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return Xd;
  }
}
class jd {
  constructor(e, t, n) {
    this.id = e, this.addr = n, this.cache = [], this.type = t.type, this.setValue = bd(t.type);
  }
}
class Yd {
  constructor(e, t, n) {
    this.id = e, this.addr = n, this.cache = [], this.type = t.type, this.size = t.size, this.setValue = qd(t.type);
  }
}
class Kd {
  constructor(e) {
    this.id = e, this.seq = [], this.map = {};
  }
  setValue(e, t, n) {
    const i = this.seq;
    for (let r = 0, a = i.length; r !== a; ++r) {
      const o = i[r];
      o.setValue(e, t[o.id], n);
    }
  }
}
const Ur = /(\w+)(\])?(\[|\.)?/g;
function $a(s, e) {
  s.seq.push(e), s.map[e.id] = e;
}
function Zd(s, e, t) {
  const n = s.name, i = n.length;
  for (Ur.lastIndex = 0; ; ) {
    const r = Ur.exec(n), a = Ur.lastIndex;
    let o = r[1];
    const c = r[2] === "]", l = r[3];
    if (c && (o = o | 0), l === void 0 || l === "[" && a + 2 === i) {
      $a(t, l === void 0 ? new jd(o, s, e) : new Yd(o, s, e));
      break;
    } else {
      let u = t.map[o];
      u === void 0 && (u = new Kd(o), $a(t, u)), t = u;
    }
  }
}
class Ys {
  constructor(e, t) {
    this.seq = [], this.map = {};
    const n = e.getProgramParameter(t, e.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; ++i) {
      const r = e.getActiveUniform(t, i), a = e.getUniformLocation(t, r.name);
      Zd(r, a, this);
    }
  }
  setValue(e, t, n, i) {
    const r = this.map[t];
    r !== void 0 && r.setValue(e, n, i);
  }
  setOptional(e, t, n) {
    const i = t[n];
    i !== void 0 && this.setValue(e, n, i);
  }
  static upload(e, t, n, i) {
    for (let r = 0, a = t.length; r !== a; ++r) {
      const o = t[r], c = n[o.id];
      c.needsUpdate !== !1 && o.setValue(e, c.value, i);
    }
  }
  static seqWithValue(e, t) {
    const n = [];
    for (let i = 0, r = e.length; i !== r; ++i) {
      const a = e[i];
      a.id in t && n.push(a);
    }
    return n;
  }
}
function Ja(s, e, t) {
  const n = s.createShader(e);
  return s.shaderSource(n, t), s.compileShader(n), n;
}
const $d = 37297;
let Jd = 0;
function Qd(s, e) {
  const t = s.split(`
`), n = [], i = Math.max(e - 6, 0), r = Math.min(e + 6, t.length);
  for (let a = i; a < r; a++) {
    const o = a + 1;
    n.push(`${o === e ? ">" : " "} ${o}: ${t[a]}`);
  }
  return n.join(`
`);
}
function ef(s) {
  const e = it.getPrimaries(it.workingColorSpace), t = it.getPrimaries(s);
  let n;
  switch (e === t ? n = "" : e === Js && t === $s ? n = "LinearDisplayP3ToLinearSRGB" : e === $s && t === Js && (n = "LinearSRGBToLinearDisplayP3"), s) {
    case Bt:
    case tr:
      return [n, "LinearTransferOETF"];
    case At:
    case na:
      return [n, "sRGBTransferOETF"];
    default:
      return console.warn("THREE.WebGLProgram: Unsupported color space:", s), [n, "LinearTransferOETF"];
  }
}
function Qa(s, e, t) {
  const n = s.getShaderParameter(e, s.COMPILE_STATUS), i = s.getShaderInfoLog(e).trim();
  if (n && i === "") return "";
  const r = /ERROR: 0:(\d+)/.exec(i);
  if (r) {
    const a = parseInt(r[1]);
    return t.toUpperCase() + `

` + i + `

` + Qd(s.getShaderSource(e), a);
  } else
    return i;
}
function tf(s, e) {
  const t = ef(e);
  return `vec4 ${s}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`;
}
function nf(s, e) {
  let t;
  switch (e) {
    case 1:
      t = "Linear";
      break;
    case 2:
      t = "Reinhard";
      break;
    case 3:
      t = "Cineon";
      break;
    case 4:
      t = "ACESFilmic";
      break;
    case 6:
      t = "AgX";
      break;
    case 7:
      t = "Neutral";
      break;
    case 5:
      t = "Custom";
      break;
    default:
      console.warn("THREE.WebGLProgram: Unsupported toneMapping:", e), t = "Linear";
  }
  return "vec3 " + s + "( vec3 color ) { return " + t + "ToneMapping( color ); }";
}
const Us = /* @__PURE__ */ new L();
function sf() {
  it.getLuminanceCoefficients(Us);
  const s = Us.x.toFixed(4), e = Us.y.toFixed(4), t = Us.z.toFixed(4);
  return [
    "float luminance( const in vec3 rgb ) {",
    `	const vec3 weights = vec3( ${s}, ${e}, ${t} );`,
    "	return dot( weights, rgb );",
    "}"
  ].join(`
`);
}
function rf(s) {
  return [
    s.extensionClipCullDistance ? "#extension GL_ANGLE_clip_cull_distance : require" : "",
    s.extensionMultiDraw ? "#extension GL_ANGLE_multi_draw : require" : ""
  ].filter(as).join(`
`);
}
function af(s) {
  const e = [];
  for (const t in s) {
    const n = s[t];
    n !== !1 && e.push("#define " + t + " " + n);
  }
  return e.join(`
`);
}
function of(s, e) {
  const t = {}, n = s.getProgramParameter(e, s.ACTIVE_ATTRIBUTES);
  for (let i = 0; i < n; i++) {
    const r = s.getActiveAttrib(e, i), a = r.name;
    let o = 1;
    r.type === s.FLOAT_MAT2 && (o = 2), r.type === s.FLOAT_MAT3 && (o = 3), r.type === s.FLOAT_MAT4 && (o = 4), t[a] = {
      type: r.type,
      location: s.getAttribLocation(e, a),
      locationSize: o
    };
  }
  return t;
}
function as(s) {
  return s !== "";
}
function eo(s, e) {
  const t = e.numSpotLightShadows + e.numSpotLightMaps - e.numSpotLightShadowsWithMaps;
  return s.replace(/NUM_DIR_LIGHTS/g, e.numDirLights).replace(/NUM_SPOT_LIGHTS/g, e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g, e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g, t).replace(/NUM_RECT_AREA_LIGHTS/g, e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g, e.numPointLights).replace(/NUM_HEMI_LIGHTS/g, e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g, e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g, e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g, e.numPointLightShadows);
}
function to(s, e) {
  return s.replace(/NUM_CLIPPING_PLANES/g, e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g, e.numClippingPlanes - e.numClipIntersection);
}
const cf = /^[ \t]*#include +<([\w\d./]+)>/gm;
function Yr(s) {
  return s.replace(cf, hf);
}
const lf = /* @__PURE__ */ new Map();
function hf(s, e) {
  let t = Ze[e];
  if (t === void 0) {
    const n = lf.get(e);
    if (n !== void 0)
      t = Ze[n], console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.', e, n);
    else
      throw new Error("Can not resolve #include <" + e + ">");
  }
  return Yr(t);
}
const uf = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
function no(s) {
  return s.replace(uf, df);
}
function df(s, e, t, n) {
  let i = "";
  for (let r = parseInt(e); r < parseInt(t); r++)
    i += n.replace(/\[\s*i\s*\]/g, "[ " + r + " ]").replace(/UNROLLED_LOOP_INDEX/g, r);
  return i;
}
function io(s) {
  let e = `precision ${s.precision} float;
	precision ${s.precision} int;
	precision ${s.precision} sampler2D;
	precision ${s.precision} samplerCube;
	precision ${s.precision} sampler3D;
	precision ${s.precision} sampler2DArray;
	precision ${s.precision} sampler2DShadow;
	precision ${s.precision} samplerCubeShadow;
	precision ${s.precision} sampler2DArrayShadow;
	precision ${s.precision} isampler2D;
	precision ${s.precision} isampler3D;
	precision ${s.precision} isamplerCube;
	precision ${s.precision} isampler2DArray;
	precision ${s.precision} usampler2D;
	precision ${s.precision} usampler3D;
	precision ${s.precision} usamplerCube;
	precision ${s.precision} usampler2DArray;
	`;
  return s.precision === "highp" ? e += `
#define HIGH_PRECISION` : s.precision === "mediump" ? e += `
#define MEDIUM_PRECISION` : s.precision === "lowp" && (e += `
#define LOW_PRECISION`), e;
}
function ff(s) {
  let e = "SHADOWMAP_TYPE_BASIC";
  return s.shadowMapType === 1 ? e = "SHADOWMAP_TYPE_PCF" : s.shadowMapType === 2 ? e = "SHADOWMAP_TYPE_PCF_SOFT" : s.shadowMapType === 3 && (e = "SHADOWMAP_TYPE_VSM"), e;
}
function pf(s) {
  let e = "ENVMAP_TYPE_CUBE";
  if (s.envMap)
    switch (s.envMapMode) {
      case 301:
      case 302:
        e = "ENVMAP_TYPE_CUBE";
        break;
      case 306:
        e = "ENVMAP_TYPE_CUBE_UV";
        break;
    }
  return e;
}
function mf(s) {
  let e = "ENVMAP_MODE_REFLECTION";
  if (s.envMap)
    switch (s.envMapMode) {
      case 302:
        e = "ENVMAP_MODE_REFRACTION";
        break;
    }
  return e;
}
function gf(s) {
  let e = "ENVMAP_BLENDING_NONE";
  if (s.envMap)
    switch (s.combine) {
      case 0:
        e = "ENVMAP_BLENDING_MULTIPLY";
        break;
      case 1:
        e = "ENVMAP_BLENDING_MIX";
        break;
      case 2:
        e = "ENVMAP_BLENDING_ADD";
        break;
    }
  return e;
}
function _f(s) {
  const e = s.envMapCubeUVHeight;
  if (e === null) return null;
  const t = Math.log2(e) - 2, n = 1 / e;
  return { texelWidth: 1 / (3 * Math.max(Math.pow(2, t), 7 * 16)), texelHeight: n, maxMip: t };
}
function xf(s, e, t, n) {
  const i = s.getContext(), r = t.defines;
  let a = t.vertexShader, o = t.fragmentShader;
  const c = ff(t), l = pf(t), h = mf(t), u = gf(t), d = _f(t), f = rf(t), g = af(r), _ = i.createProgram();
  let m, p, E = t.glslVersion ? "#version " + t.glslVersion + `
` : "";
  t.isRawShaderMaterial ? (m = [
    "#define SHADER_TYPE " + t.shaderType,
    "#define SHADER_NAME " + t.shaderName,
    g
  ].filter(as).join(`
`), m.length > 0 && (m += `
`), p = [
    "#define SHADER_TYPE " + t.shaderType,
    "#define SHADER_NAME " + t.shaderName,
    g
  ].filter(as).join(`
`), p.length > 0 && (p += `
`)) : (m = [
    io(t),
    "#define SHADER_TYPE " + t.shaderType,
    "#define SHADER_NAME " + t.shaderName,
    g,
    t.extensionClipCullDistance ? "#define USE_CLIP_DISTANCE" : "",
    t.batching ? "#define USE_BATCHING" : "",
    t.batchingColor ? "#define USE_BATCHING_COLOR" : "",
    t.instancing ? "#define USE_INSTANCING" : "",
    t.instancingColor ? "#define USE_INSTANCING_COLOR" : "",
    t.instancingMorph ? "#define USE_INSTANCING_MORPH" : "",
    t.useFog && t.fog ? "#define USE_FOG" : "",
    t.useFog && t.fogExp2 ? "#define FOG_EXP2" : "",
    t.map ? "#define USE_MAP" : "",
    t.envMap ? "#define USE_ENVMAP" : "",
    t.envMap ? "#define " + h : "",
    t.lightMap ? "#define USE_LIGHTMAP" : "",
    t.aoMap ? "#define USE_AOMAP" : "",
    t.bumpMap ? "#define USE_BUMPMAP" : "",
    t.normalMap ? "#define USE_NORMALMAP" : "",
    t.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "",
    t.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "",
    t.displacementMap ? "#define USE_DISPLACEMENTMAP" : "",
    t.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
    t.anisotropy ? "#define USE_ANISOTROPY" : "",
    t.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "",
    t.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
    t.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
    t.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
    t.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "",
    t.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "",
    t.specularMap ? "#define USE_SPECULARMAP" : "",
    t.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "",
    t.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "",
    t.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
    t.metalnessMap ? "#define USE_METALNESSMAP" : "",
    t.alphaMap ? "#define USE_ALPHAMAP" : "",
    t.alphaHash ? "#define USE_ALPHAHASH" : "",
    t.transmission ? "#define USE_TRANSMISSION" : "",
    t.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
    t.thicknessMap ? "#define USE_THICKNESSMAP" : "",
    t.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "",
    t.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "",
    //
    t.mapUv ? "#define MAP_UV " + t.mapUv : "",
    t.alphaMapUv ? "#define ALPHAMAP_UV " + t.alphaMapUv : "",
    t.lightMapUv ? "#define LIGHTMAP_UV " + t.lightMapUv : "",
    t.aoMapUv ? "#define AOMAP_UV " + t.aoMapUv : "",
    t.emissiveMapUv ? "#define EMISSIVEMAP_UV " + t.emissiveMapUv : "",
    t.bumpMapUv ? "#define BUMPMAP_UV " + t.bumpMapUv : "",
    t.normalMapUv ? "#define NORMALMAP_UV " + t.normalMapUv : "",
    t.displacementMapUv ? "#define DISPLACEMENTMAP_UV " + t.displacementMapUv : "",
    t.metalnessMapUv ? "#define METALNESSMAP_UV " + t.metalnessMapUv : "",
    t.roughnessMapUv ? "#define ROUGHNESSMAP_UV " + t.roughnessMapUv : "",
    t.anisotropyMapUv ? "#define ANISOTROPYMAP_UV " + t.anisotropyMapUv : "",
    t.clearcoatMapUv ? "#define CLEARCOATMAP_UV " + t.clearcoatMapUv : "",
    t.clearcoatNormalMapUv ? "#define CLEARCOAT_NORMALMAP_UV " + t.clearcoatNormalMapUv : "",
    t.clearcoatRoughnessMapUv ? "#define CLEARCOAT_ROUGHNESSMAP_UV " + t.clearcoatRoughnessMapUv : "",
    t.iridescenceMapUv ? "#define IRIDESCENCEMAP_UV " + t.iridescenceMapUv : "",
    t.iridescenceThicknessMapUv ? "#define IRIDESCENCE_THICKNESSMAP_UV " + t.iridescenceThicknessMapUv : "",
    t.sheenColorMapUv ? "#define SHEEN_COLORMAP_UV " + t.sheenColorMapUv : "",
    t.sheenRoughnessMapUv ? "#define SHEEN_ROUGHNESSMAP_UV " + t.sheenRoughnessMapUv : "",
    t.specularMapUv ? "#define SPECULARMAP_UV " + t.specularMapUv : "",
    t.specularColorMapUv ? "#define SPECULAR_COLORMAP_UV " + t.specularColorMapUv : "",
    t.specularIntensityMapUv ? "#define SPECULAR_INTENSITYMAP_UV " + t.specularIntensityMapUv : "",
    t.transmissionMapUv ? "#define TRANSMISSIONMAP_UV " + t.transmissionMapUv : "",
    t.thicknessMapUv ? "#define THICKNESSMAP_UV " + t.thicknessMapUv : "",
    //
    t.vertexTangents && t.flatShading === !1 ? "#define USE_TANGENT" : "",
    t.vertexColors ? "#define USE_COLOR" : "",
    t.vertexAlphas ? "#define USE_COLOR_ALPHA" : "",
    t.vertexUv1s ? "#define USE_UV1" : "",
    t.vertexUv2s ? "#define USE_UV2" : "",
    t.vertexUv3s ? "#define USE_UV3" : "",
    t.pointsUvs ? "#define USE_POINTS_UV" : "",
    t.flatShading ? "#define FLAT_SHADED" : "",
    t.skinning ? "#define USE_SKINNING" : "",
    t.morphTargets ? "#define USE_MORPHTARGETS" : "",
    t.morphNormals && t.flatShading === !1 ? "#define USE_MORPHNORMALS" : "",
    t.morphColors ? "#define USE_MORPHCOLORS" : "",
    t.morphTargetsCount > 0 ? "#define MORPHTARGETS_TEXTURE_STRIDE " + t.morphTextureStride : "",
    t.morphTargetsCount > 0 ? "#define MORPHTARGETS_COUNT " + t.morphTargetsCount : "",
    t.doubleSided ? "#define DOUBLE_SIDED" : "",
    t.flipSided ? "#define FLIP_SIDED" : "",
    t.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
    t.shadowMapEnabled ? "#define " + c : "",
    t.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "",
    t.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "",
    t.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "",
    t.reverseDepthBuffer ? "#define USE_REVERSEDEPTHBUF" : "",
    "uniform mat4 modelMatrix;",
    "uniform mat4 modelViewMatrix;",
    "uniform mat4 projectionMatrix;",
    "uniform mat4 viewMatrix;",
    "uniform mat3 normalMatrix;",
    "uniform vec3 cameraPosition;",
    "uniform bool isOrthographic;",
    "#ifdef USE_INSTANCING",
    "	attribute mat4 instanceMatrix;",
    "#endif",
    "#ifdef USE_INSTANCING_COLOR",
    "	attribute vec3 instanceColor;",
    "#endif",
    "#ifdef USE_INSTANCING_MORPH",
    "	uniform sampler2D morphTexture;",
    "#endif",
    "attribute vec3 position;",
    "attribute vec3 normal;",
    "attribute vec2 uv;",
    "#ifdef USE_UV1",
    "	attribute vec2 uv1;",
    "#endif",
    "#ifdef USE_UV2",
    "	attribute vec2 uv2;",
    "#endif",
    "#ifdef USE_UV3",
    "	attribute vec2 uv3;",
    "#endif",
    "#ifdef USE_TANGENT",
    "	attribute vec4 tangent;",
    "#endif",
    "#if defined( USE_COLOR_ALPHA )",
    "	attribute vec4 color;",
    "#elif defined( USE_COLOR )",
    "	attribute vec3 color;",
    "#endif",
    "#ifdef USE_SKINNING",
    "	attribute vec4 skinIndex;",
    "	attribute vec4 skinWeight;",
    "#endif",
    `
`
  ].filter(as).join(`
`), p = [
    io(t),
    "#define SHADER_TYPE " + t.shaderType,
    "#define SHADER_NAME " + t.shaderName,
    g,
    t.useFog && t.fog ? "#define USE_FOG" : "",
    t.useFog && t.fogExp2 ? "#define FOG_EXP2" : "",
    t.alphaToCoverage ? "#define ALPHA_TO_COVERAGE" : "",
    t.map ? "#define USE_MAP" : "",
    t.matcap ? "#define USE_MATCAP" : "",
    t.envMap ? "#define USE_ENVMAP" : "",
    t.envMap ? "#define " + l : "",
    t.envMap ? "#define " + h : "",
    t.envMap ? "#define " + u : "",
    d ? "#define CUBEUV_TEXEL_WIDTH " + d.texelWidth : "",
    d ? "#define CUBEUV_TEXEL_HEIGHT " + d.texelHeight : "",
    d ? "#define CUBEUV_MAX_MIP " + d.maxMip + ".0" : "",
    t.lightMap ? "#define USE_LIGHTMAP" : "",
    t.aoMap ? "#define USE_AOMAP" : "",
    t.bumpMap ? "#define USE_BUMPMAP" : "",
    t.normalMap ? "#define USE_NORMALMAP" : "",
    t.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "",
    t.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "",
    t.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
    t.anisotropy ? "#define USE_ANISOTROPY" : "",
    t.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "",
    t.clearcoat ? "#define USE_CLEARCOAT" : "",
    t.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
    t.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
    t.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
    t.dispersion ? "#define USE_DISPERSION" : "",
    t.iridescence ? "#define USE_IRIDESCENCE" : "",
    t.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "",
    t.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "",
    t.specularMap ? "#define USE_SPECULARMAP" : "",
    t.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "",
    t.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "",
    t.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
    t.metalnessMap ? "#define USE_METALNESSMAP" : "",
    t.alphaMap ? "#define USE_ALPHAMAP" : "",
    t.alphaTest ? "#define USE_ALPHATEST" : "",
    t.alphaHash ? "#define USE_ALPHAHASH" : "",
    t.sheen ? "#define USE_SHEEN" : "",
    t.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "",
    t.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "",
    t.transmission ? "#define USE_TRANSMISSION" : "",
    t.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
    t.thicknessMap ? "#define USE_THICKNESSMAP" : "",
    t.vertexTangents && t.flatShading === !1 ? "#define USE_TANGENT" : "",
    t.vertexColors || t.instancingColor || t.batchingColor ? "#define USE_COLOR" : "",
    t.vertexAlphas ? "#define USE_COLOR_ALPHA" : "",
    t.vertexUv1s ? "#define USE_UV1" : "",
    t.vertexUv2s ? "#define USE_UV2" : "",
    t.vertexUv3s ? "#define USE_UV3" : "",
    t.pointsUvs ? "#define USE_POINTS_UV" : "",
    t.gradientMap ? "#define USE_GRADIENTMAP" : "",
    t.flatShading ? "#define FLAT_SHADED" : "",
    t.doubleSided ? "#define DOUBLE_SIDED" : "",
    t.flipSided ? "#define FLIP_SIDED" : "",
    t.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
    t.shadowMapEnabled ? "#define " + c : "",
    t.premultipliedAlpha ? "#define PREMULTIPLIED_ALPHA" : "",
    t.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "",
    t.decodeVideoTexture ? "#define DECODE_VIDEO_TEXTURE" : "",
    t.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "",
    t.reverseDepthBuffer ? "#define USE_REVERSEDEPTHBUF" : "",
    "uniform mat4 viewMatrix;",
    "uniform vec3 cameraPosition;",
    "uniform bool isOrthographic;",
    t.toneMapping !== 0 ? "#define TONE_MAPPING" : "",
    t.toneMapping !== 0 ? Ze.tonemapping_pars_fragment : "",
    // this code is required here because it is used by the toneMapping() function defined below
    t.toneMapping !== 0 ? nf("toneMapping", t.toneMapping) : "",
    t.dithering ? "#define DITHERING" : "",
    t.opaque ? "#define OPAQUE" : "",
    Ze.colorspace_pars_fragment,
    // this code is required here because it is used by the various encoding/decoding function defined below
    tf("linearToOutputTexel", t.outputColorSpace),
    sf(),
    t.useDepthPacking ? "#define DEPTH_PACKING " + t.depthPacking : "",
    `
`
  ].filter(as).join(`
`)), a = Yr(a), a = eo(a, t), a = to(a, t), o = Yr(o), o = eo(o, t), o = to(o, t), a = no(a), o = no(o), t.isRawShaderMaterial !== !0 && (E = `#version 300 es
`, m = [
    f,
    "#define attribute in",
    "#define varying out",
    "#define texture2D texture"
  ].join(`
`) + `
` + m, p = [
    "#define varying in",
    t.glslVersion === va ? "" : "layout(location = 0) out highp vec4 pc_fragColor;",
    t.glslVersion === va ? "" : "#define gl_FragColor pc_fragColor",
    "#define gl_FragDepthEXT gl_FragDepth",
    "#define texture2D texture",
    "#define textureCube texture",
    "#define texture2DProj textureProj",
    "#define texture2DLodEXT textureLod",
    "#define texture2DProjLodEXT textureProjLod",
    "#define textureCubeLodEXT textureLod",
    "#define texture2DGradEXT textureGrad",
    "#define texture2DProjGradEXT textureProjGrad",
    "#define textureCubeGradEXT textureGrad"
  ].join(`
`) + `
` + p);
  const y = E + m + a, A = E + p + o, O = Ja(i, i.VERTEX_SHADER, y), w = Ja(i, i.FRAGMENT_SHADER, A);
  i.attachShader(_, O), i.attachShader(_, w), t.index0AttributeName !== void 0 ? i.bindAttribLocation(_, 0, t.index0AttributeName) : t.morphTargets === !0 && i.bindAttribLocation(_, 0, "position"), i.linkProgram(_);
  function R(T) {
    if (s.debug.checkShaderErrors) {
      const q = i.getProgramInfoLog(_).trim(), X = i.getShaderInfoLog(O).trim(), j = i.getShaderInfoLog(w).trim();
      let te = !0, W = !0;
      if (i.getProgramParameter(_, i.LINK_STATUS) === !1)
        if (te = !1, typeof s.debug.onShaderError == "function")
          s.debug.onShaderError(i, _, O, w);
        else {
          const oe = Qa(i, O, "vertex"), K = Qa(i, w, "fragment");
          console.error(
            "THREE.WebGLProgram: Shader Error " + i.getError() + " - VALIDATE_STATUS " + i.getProgramParameter(_, i.VALIDATE_STATUS) + `

Material Name: ` + T.name + `
Material Type: ` + T.type + `

Program Info Log: ` + q + `
` + oe + `
` + K
          );
        }
      else q !== "" ? console.warn("THREE.WebGLProgram: Program Info Log:", q) : (X === "" || j === "") && (W = !1);
      W && (T.diagnostics = {
        runnable: te,
        programLog: q,
        vertexShader: {
          log: X,
          prefix: m
        },
        fragmentShader: {
          log: j,
          prefix: p
        }
      });
    }
    i.deleteShader(O), i.deleteShader(w), k = new Ys(i, _), Q = of(i, _);
  }
  let k;
  this.getUniforms = function() {
    return k === void 0 && R(this), k;
  };
  let Q;
  this.getAttributes = function() {
    return Q === void 0 && R(this), Q;
  };
  let x = t.rendererExtensionParallelShaderCompile === !1;
  return this.isReady = function() {
    return x === !1 && (x = i.getProgramParameter(_, $d)), x;
  }, this.destroy = function() {
    n.releaseStatesOfProgram(this), i.deleteProgram(_), this.program = void 0;
  }, this.type = t.shaderType, this.name = t.shaderName, this.id = Jd++, this.cacheKey = e, this.usedTimes = 1, this.program = _, this.vertexShader = O, this.fragmentShader = w, this;
}
let vf = 0;
class Mf {
  constructor() {
    this.shaderCache = /* @__PURE__ */ new Map(), this.materialCache = /* @__PURE__ */ new Map();
  }
  update(e) {
    const t = e.vertexShader, n = e.fragmentShader, i = this._getShaderStage(t), r = this._getShaderStage(n), a = this._getShaderCacheForMaterial(e);
    return a.has(i) === !1 && (a.add(i), i.usedTimes++), a.has(r) === !1 && (a.add(r), r.usedTimes++), this;
  }
  remove(e) {
    const t = this.materialCache.get(e);
    for (const n of t)
      n.usedTimes--, n.usedTimes === 0 && this.shaderCache.delete(n.code);
    return this.materialCache.delete(e), this;
  }
  getVertexShaderID(e) {
    return this._getShaderStage(e.vertexShader).id;
  }
  getFragmentShaderID(e) {
    return this._getShaderStage(e.fragmentShader).id;
  }
  dispose() {
    this.shaderCache.clear(), this.materialCache.clear();
  }
  _getShaderCacheForMaterial(e) {
    const t = this.materialCache;
    let n = t.get(e);
    return n === void 0 && (n = /* @__PURE__ */ new Set(), t.set(e, n)), n;
  }
  _getShaderStage(e) {
    const t = this.shaderCache;
    let n = t.get(e);
    return n === void 0 && (n = new yf(e), t.set(e, n)), n;
  }
}
class yf {
  constructor(e) {
    this.id = vf++, this.code = e, this.usedTimes = 0;
  }
}
function Sf(s, e, t, n, i, r, a) {
  const o = new sa(), c = new Mf(), l = /* @__PURE__ */ new Set(), h = [], u = i.logarithmicDepthBuffer, d = i.reverseDepthBuffer, f = i.vertexTextures;
  let g = i.precision;
  const _ = {
    MeshDepthMaterial: "depth",
    MeshDistanceMaterial: "distanceRGBA",
    MeshNormalMaterial: "normal",
    MeshBasicMaterial: "basic",
    MeshLambertMaterial: "lambert",
    MeshPhongMaterial: "phong",
    MeshToonMaterial: "toon",
    MeshStandardMaterial: "physical",
    MeshPhysicalMaterial: "physical",
    MeshMatcapMaterial: "matcap",
    LineBasicMaterial: "basic",
    LineDashedMaterial: "dashed",
    PointsMaterial: "points",
    ShadowMaterial: "shadow",
    SpriteMaterial: "sprite"
  };
  function m(x) {
    return l.add(x), x === 0 ? "uv" : `uv${x}`;
  }
  function p(x, T, q, X, j) {
    const te = X.fog, W = j.geometry, oe = x.isMeshStandardMaterial ? X.environment : null, K = (x.isMeshStandardMaterial ? t : e).get(x.envMap || oe), ge = K && K.mapping === 306 ? K.image.height : null, fe = _[x.type];
    x.precision !== null && (g = i.getMaxPrecision(x.precision), g !== x.precision && console.warn("THREE.WebGLProgram.getParameters:", x.precision, "not supported, using", g, "instead."));
    const Ae = W.morphAttributes.position || W.morphAttributes.normal || W.morphAttributes.color, at = Ae !== void 0 ? Ae.length : 0;
    let lt = 0;
    W.morphAttributes.position !== void 0 && (lt = 1), W.morphAttributes.normal !== void 0 && (lt = 2), W.morphAttributes.color !== void 0 && (lt = 3);
    let $, ie, Ee, Me;
    if (fe) {
      const Ct = yn[fe];
      $ = Ct.vertexShader, ie = Ct.fragmentShader;
    } else
      $ = x.vertexShader, ie = x.fragmentShader, c.update(x), Ee = c.getVertexShaderID(x), Me = c.getFragmentShaderID(x);
    const He = s.getRenderTarget(), Ue = j.isInstancedMesh === !0, Ce = j.isBatchedMesh === !0, Le = !!x.map, z = !!x.matcap, P = !!K, Wt = !!x.aoMap, Qe = !!x.lightMap, st = !!x.bumpMap, Be = !!x.normalMap, gt = !!x.displacementMap, ze = !!x.emissiveMap, b = !!x.metalnessMap, v = !!x.roughnessMap, G = x.anisotropy > 0, J = x.clearcoat > 0, ne = x.dispersion > 0, Z = x.iridescence > 0, be = x.sheen > 0, ce = x.transmission > 0, de = G && !!x.anisotropyMap, rt = J && !!x.clearcoatMap, re = J && !!x.clearcoatNormalMap, ye = J && !!x.clearcoatRoughnessMap, De = Z && !!x.iridescenceMap, Ne = Z && !!x.iridescenceThicknessMap, ve = be && !!x.sheenColorMap, je = be && !!x.sheenRoughnessMap, ke = !!x.specularMap, ft = !!x.specularColorMap, U = !!x.specularIntensityMap, _e = ce && !!x.transmissionMap, Y = ce && !!x.thicknessMap, ee = !!x.gradientMap, le = !!x.alphaMap, ue = x.alphaTest > 0, et = !!x.alphaHash, Tt = !!x.extensions;
    let Ot = 0;
    x.toneMapped && (He === null || He.isXRRenderTarget === !0) && (Ot = s.toneMapping);
    const ot = {
      shaderID: fe,
      shaderType: x.type,
      shaderName: x.name,
      vertexShader: $,
      fragmentShader: ie,
      defines: x.defines,
      customVertexShaderID: Ee,
      customFragmentShaderID: Me,
      isRawShaderMaterial: x.isRawShaderMaterial === !0,
      glslVersion: x.glslVersion,
      precision: g,
      batching: Ce,
      batchingColor: Ce && j._colorsTexture !== null,
      instancing: Ue,
      instancingColor: Ue && j.instanceColor !== null,
      instancingMorph: Ue && j.morphTexture !== null,
      supportsVertexTextures: f,
      outputColorSpace: He === null ? s.outputColorSpace : He.isXRRenderTarget === !0 ? He.texture.colorSpace : Bt,
      alphaToCoverage: !!x.alphaToCoverage,
      map: Le,
      matcap: z,
      envMap: P,
      envMapMode: P && K.mapping,
      envMapCubeUVHeight: ge,
      aoMap: Wt,
      lightMap: Qe,
      bumpMap: st,
      normalMap: Be,
      displacementMap: f && gt,
      emissiveMap: ze,
      normalMapObjectSpace: Be && x.normalMapType === 1,
      normalMapTangentSpace: Be && x.normalMapType === 0,
      metalnessMap: b,
      roughnessMap: v,
      anisotropy: G,
      anisotropyMap: de,
      clearcoat: J,
      clearcoatMap: rt,
      clearcoatNormalMap: re,
      clearcoatRoughnessMap: ye,
      dispersion: ne,
      iridescence: Z,
      iridescenceMap: De,
      iridescenceThicknessMap: Ne,
      sheen: be,
      sheenColorMap: ve,
      sheenRoughnessMap: je,
      specularMap: ke,
      specularColorMap: ft,
      specularIntensityMap: U,
      transmission: ce,
      transmissionMap: _e,
      thicknessMap: Y,
      gradientMap: ee,
      opaque: x.transparent === !1 && x.blending === 1 && x.alphaToCoverage === !1,
      alphaMap: le,
      alphaTest: ue,
      alphaHash: et,
      combine: x.combine,
      //
      mapUv: Le && m(x.map.channel),
      aoMapUv: Wt && m(x.aoMap.channel),
      lightMapUv: Qe && m(x.lightMap.channel),
      bumpMapUv: st && m(x.bumpMap.channel),
      normalMapUv: Be && m(x.normalMap.channel),
      displacementMapUv: gt && m(x.displacementMap.channel),
      emissiveMapUv: ze && m(x.emissiveMap.channel),
      metalnessMapUv: b && m(x.metalnessMap.channel),
      roughnessMapUv: v && m(x.roughnessMap.channel),
      anisotropyMapUv: de && m(x.anisotropyMap.channel),
      clearcoatMapUv: rt && m(x.clearcoatMap.channel),
      clearcoatNormalMapUv: re && m(x.clearcoatNormalMap.channel),
      clearcoatRoughnessMapUv: ye && m(x.clearcoatRoughnessMap.channel),
      iridescenceMapUv: De && m(x.iridescenceMap.channel),
      iridescenceThicknessMapUv: Ne && m(x.iridescenceThicknessMap.channel),
      sheenColorMapUv: ve && m(x.sheenColorMap.channel),
      sheenRoughnessMapUv: je && m(x.sheenRoughnessMap.channel),
      specularMapUv: ke && m(x.specularMap.channel),
      specularColorMapUv: ft && m(x.specularColorMap.channel),
      specularIntensityMapUv: U && m(x.specularIntensityMap.channel),
      transmissionMapUv: _e && m(x.transmissionMap.channel),
      thicknessMapUv: Y && m(x.thicknessMap.channel),
      alphaMapUv: le && m(x.alphaMap.channel),
      //
      vertexTangents: !!W.attributes.tangent && (Be || G),
      vertexColors: x.vertexColors,
      vertexAlphas: x.vertexColors === !0 && !!W.attributes.color && W.attributes.color.itemSize === 4,
      pointsUvs: j.isPoints === !0 && !!W.attributes.uv && (Le || le),
      fog: !!te,
      useFog: x.fog === !0,
      fogExp2: !!te && te.isFogExp2,
      flatShading: x.flatShading === !0,
      sizeAttenuation: x.sizeAttenuation === !0,
      logarithmicDepthBuffer: u,
      reverseDepthBuffer: d,
      skinning: j.isSkinnedMesh === !0,
      morphTargets: W.morphAttributes.position !== void 0,
      morphNormals: W.morphAttributes.normal !== void 0,
      morphColors: W.morphAttributes.color !== void 0,
      morphTargetsCount: at,
      morphTextureStride: lt,
      numDirLights: T.directional.length,
      numPointLights: T.point.length,
      numSpotLights: T.spot.length,
      numSpotLightMaps: T.spotLightMap.length,
      numRectAreaLights: T.rectArea.length,
      numHemiLights: T.hemi.length,
      numDirLightShadows: T.directionalShadowMap.length,
      numPointLightShadows: T.pointShadowMap.length,
      numSpotLightShadows: T.spotShadowMap.length,
      numSpotLightShadowsWithMaps: T.numSpotLightShadowsWithMaps,
      numLightProbes: T.numLightProbes,
      numClippingPlanes: a.numPlanes,
      numClipIntersection: a.numIntersection,
      dithering: x.dithering,
      shadowMapEnabled: s.shadowMap.enabled && q.length > 0,
      shadowMapType: s.shadowMap.type,
      toneMapping: Ot,
      decodeVideoTexture: Le && x.map.isVideoTexture === !0 && it.getTransfer(x.map.colorSpace) === yt,
      premultipliedAlpha: x.premultipliedAlpha,
      doubleSided: x.side === 2,
      flipSided: x.side === 1,
      useDepthPacking: x.depthPacking >= 0,
      depthPacking: x.depthPacking || 0,
      index0AttributeName: x.index0AttributeName,
      extensionClipCullDistance: Tt && x.extensions.clipCullDistance === !0 && n.has("WEBGL_clip_cull_distance"),
      extensionMultiDraw: (Tt && x.extensions.multiDraw === !0 || Ce) && n.has("WEBGL_multi_draw"),
      rendererExtensionParallelShaderCompile: n.has("KHR_parallel_shader_compile"),
      customProgramCacheKey: x.customProgramCacheKey()
    };
    return ot.vertexUv1s = l.has(1), ot.vertexUv2s = l.has(2), ot.vertexUv3s = l.has(3), l.clear(), ot;
  }
  function E(x) {
    const T = [];
    if (x.shaderID ? T.push(x.shaderID) : (T.push(x.customVertexShaderID), T.push(x.customFragmentShaderID)), x.defines !== void 0)
      for (const q in x.defines)
        T.push(q), T.push(x.defines[q]);
    return x.isRawShaderMaterial === !1 && (y(T, x), A(T, x), T.push(s.outputColorSpace)), T.push(x.customProgramCacheKey), T.join();
  }
  function y(x, T) {
    x.push(T.precision), x.push(T.outputColorSpace), x.push(T.envMapMode), x.push(T.envMapCubeUVHeight), x.push(T.mapUv), x.push(T.alphaMapUv), x.push(T.lightMapUv), x.push(T.aoMapUv), x.push(T.bumpMapUv), x.push(T.normalMapUv), x.push(T.displacementMapUv), x.push(T.emissiveMapUv), x.push(T.metalnessMapUv), x.push(T.roughnessMapUv), x.push(T.anisotropyMapUv), x.push(T.clearcoatMapUv), x.push(T.clearcoatNormalMapUv), x.push(T.clearcoatRoughnessMapUv), x.push(T.iridescenceMapUv), x.push(T.iridescenceThicknessMapUv), x.push(T.sheenColorMapUv), x.push(T.sheenRoughnessMapUv), x.push(T.specularMapUv), x.push(T.specularColorMapUv), x.push(T.specularIntensityMapUv), x.push(T.transmissionMapUv), x.push(T.thicknessMapUv), x.push(T.combine), x.push(T.fogExp2), x.push(T.sizeAttenuation), x.push(T.morphTargetsCount), x.push(T.morphAttributeCount), x.push(T.numDirLights), x.push(T.numPointLights), x.push(T.numSpotLights), x.push(T.numSpotLightMaps), x.push(T.numHemiLights), x.push(T.numRectAreaLights), x.push(T.numDirLightShadows), x.push(T.numPointLightShadows), x.push(T.numSpotLightShadows), x.push(T.numSpotLightShadowsWithMaps), x.push(T.numLightProbes), x.push(T.shadowMapType), x.push(T.toneMapping), x.push(T.numClippingPlanes), x.push(T.numClipIntersection), x.push(T.depthPacking);
  }
  function A(x, T) {
    o.disableAll(), T.supportsVertexTextures && o.enable(0), T.instancing && o.enable(1), T.instancingColor && o.enable(2), T.instancingMorph && o.enable(3), T.matcap && o.enable(4), T.envMap && o.enable(5), T.normalMapObjectSpace && o.enable(6), T.normalMapTangentSpace && o.enable(7), T.clearcoat && o.enable(8), T.iridescence && o.enable(9), T.alphaTest && o.enable(10), T.vertexColors && o.enable(11), T.vertexAlphas && o.enable(12), T.vertexUv1s && o.enable(13), T.vertexUv2s && o.enable(14), T.vertexUv3s && o.enable(15), T.vertexTangents && o.enable(16), T.anisotropy && o.enable(17), T.alphaHash && o.enable(18), T.batching && o.enable(19), T.dispersion && o.enable(20), T.batchingColor && o.enable(21), x.push(o.mask), o.disableAll(), T.fog && o.enable(0), T.useFog && o.enable(1), T.flatShading && o.enable(2), T.logarithmicDepthBuffer && o.enable(3), T.reverseDepthBuffer && o.enable(4), T.skinning && o.enable(5), T.morphTargets && o.enable(6), T.morphNormals && o.enable(7), T.morphColors && o.enable(8), T.premultipliedAlpha && o.enable(9), T.shadowMapEnabled && o.enable(10), T.doubleSided && o.enable(11), T.flipSided && o.enable(12), T.useDepthPacking && o.enable(13), T.dithering && o.enable(14), T.transmission && o.enable(15), T.sheen && o.enable(16), T.opaque && o.enable(17), T.pointsUvs && o.enable(18), T.decodeVideoTexture && o.enable(19), T.alphaToCoverage && o.enable(20), x.push(o.mask);
  }
  function O(x) {
    const T = _[x.type];
    let q;
    if (T) {
      const X = yn[T];
      q = sl.clone(X.uniforms);
    } else
      q = x.uniforms;
    return q;
  }
  function w(x, T) {
    let q;
    for (let X = 0, j = h.length; X < j; X++) {
      const te = h[X];
      if (te.cacheKey === T) {
        q = te, ++q.usedTimes;
        break;
      }
    }
    return q === void 0 && (q = new xf(s, T, x, r), h.push(q)), q;
  }
  function R(x) {
    if (--x.usedTimes === 0) {
      const T = h.indexOf(x);
      h[T] = h[h.length - 1], h.pop(), x.destroy();
    }
  }
  function k(x) {
    c.remove(x);
  }
  function Q() {
    c.dispose();
  }
  return {
    getParameters: p,
    getProgramCacheKey: E,
    getUniforms: O,
    acquireProgram: w,
    releaseProgram: R,
    releaseShaderCache: k,
    // Exposed for resource monitoring & error feedback via renderer.info:
    programs: h,
    dispose: Q
  };
}
function Ef() {
  let s = /* @__PURE__ */ new WeakMap();
  function e(a) {
    return s.has(a);
  }
  function t(a) {
    let o = s.get(a);
    return o === void 0 && (o = {}, s.set(a, o)), o;
  }
  function n(a) {
    s.delete(a);
  }
  function i(a, o, c) {
    s.get(a)[o] = c;
  }
  function r() {
    s = /* @__PURE__ */ new WeakMap();
  }
  return {
    has: e,
    get: t,
    remove: n,
    update: i,
    dispose: r
  };
}
function Tf(s, e) {
  return s.groupOrder !== e.groupOrder ? s.groupOrder - e.groupOrder : s.renderOrder !== e.renderOrder ? s.renderOrder - e.renderOrder : s.material.id !== e.material.id ? s.material.id - e.material.id : s.z !== e.z ? s.z - e.z : s.id - e.id;
}
function so(s, e) {
  return s.groupOrder !== e.groupOrder ? s.groupOrder - e.groupOrder : s.renderOrder !== e.renderOrder ? s.renderOrder - e.renderOrder : s.z !== e.z ? e.z - s.z : s.id - e.id;
}
function ro() {
  const s = [];
  let e = 0;
  const t = [], n = [], i = [];
  function r() {
    e = 0, t.length = 0, n.length = 0, i.length = 0;
  }
  function a(u, d, f, g, _, m) {
    let p = s[e];
    return p === void 0 ? (p = {
      id: u.id,
      object: u,
      geometry: d,
      material: f,
      groupOrder: g,
      renderOrder: u.renderOrder,
      z: _,
      group: m
    }, s[e] = p) : (p.id = u.id, p.object = u, p.geometry = d, p.material = f, p.groupOrder = g, p.renderOrder = u.renderOrder, p.z = _, p.group = m), e++, p;
  }
  function o(u, d, f, g, _, m) {
    const p = a(u, d, f, g, _, m);
    f.transmission > 0 ? n.push(p) : f.transparent === !0 ? i.push(p) : t.push(p);
  }
  function c(u, d, f, g, _, m) {
    const p = a(u, d, f, g, _, m);
    f.transmission > 0 ? n.unshift(p) : f.transparent === !0 ? i.unshift(p) : t.unshift(p);
  }
  function l(u, d) {
    t.length > 1 && t.sort(u || Tf), n.length > 1 && n.sort(d || so), i.length > 1 && i.sort(d || so);
  }
  function h() {
    for (let u = e, d = s.length; u < d; u++) {
      const f = s[u];
      if (f.id === null) break;
      f.id = null, f.object = null, f.geometry = null, f.material = null, f.group = null;
    }
  }
  return {
    opaque: t,
    transmissive: n,
    transparent: i,
    init: r,
    push: o,
    unshift: c,
    finish: h,
    sort: l
  };
}
function Af() {
  let s = /* @__PURE__ */ new WeakMap();
  function e(n, i) {
    const r = s.get(n);
    let a;
    return r === void 0 ? (a = new ro(), s.set(n, [a])) : i >= r.length ? (a = new ro(), r.push(a)) : a = r[i], a;
  }
  function t() {
    s = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: e,
    dispose: t
  };
}
function bf() {
  const s = {};
  return {
    get: function(e) {
      if (s[e.id] !== void 0)
        return s[e.id];
      let t;
      switch (e.type) {
        case "DirectionalLight":
          t = {
            direction: new L(),
            color: new Pe()
          };
          break;
        case "SpotLight":
          t = {
            position: new L(),
            direction: new L(),
            color: new Pe(),
            distance: 0,
            coneCos: 0,
            penumbraCos: 0,
            decay: 0
          };
          break;
        case "PointLight":
          t = {
            position: new L(),
            color: new Pe(),
            distance: 0,
            decay: 0
          };
          break;
        case "HemisphereLight":
          t = {
            direction: new L(),
            skyColor: new Pe(),
            groundColor: new Pe()
          };
          break;
        case "RectAreaLight":
          t = {
            color: new Pe(),
            position: new L(),
            halfWidth: new L(),
            halfHeight: new L()
          };
          break;
      }
      return s[e.id] = t, t;
    }
  };
}
function wf() {
  const s = {};
  return {
    get: function(e) {
      if (s[e.id] !== void 0)
        return s[e.id];
      let t;
      switch (e.type) {
        case "DirectionalLight":
          t = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new Xe()
          };
          break;
        case "SpotLight":
          t = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new Xe()
          };
          break;
        case "PointLight":
          t = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new Xe(),
            shadowCameraNear: 1,
            shadowCameraFar: 1e3
          };
          break;
      }
      return s[e.id] = t, t;
    }
  };
}
let Rf = 0;
function Cf(s, e) {
  return (e.castShadow ? 2 : 0) - (s.castShadow ? 2 : 0) + (e.map ? 1 : 0) - (s.map ? 1 : 0);
}
function If(s) {
  const e = new bf(), t = wf(), n = {
    version: 0,
    hash: {
      directionalLength: -1,
      pointLength: -1,
      spotLength: -1,
      rectAreaLength: -1,
      hemiLength: -1,
      numDirectionalShadows: -1,
      numPointShadows: -1,
      numSpotShadows: -1,
      numSpotMaps: -1,
      numLightProbes: -1
    },
    ambient: [0, 0, 0],
    probe: [],
    directional: [],
    directionalShadow: [],
    directionalShadowMap: [],
    directionalShadowMatrix: [],
    spot: [],
    spotLightMap: [],
    spotShadow: [],
    spotShadowMap: [],
    spotLightMatrix: [],
    rectArea: [],
    rectAreaLTC1: null,
    rectAreaLTC2: null,
    point: [],
    pointShadow: [],
    pointShadowMap: [],
    pointShadowMatrix: [],
    hemi: [],
    numSpotLightShadowsWithMaps: 0,
    numLightProbes: 0
  };
  for (let l = 0; l < 9; l++) n.probe.push(new L());
  const i = new L(), r = new qe(), a = new qe();
  function o(l) {
    let h = 0, u = 0, d = 0;
    for (let Q = 0; Q < 9; Q++) n.probe[Q].set(0, 0, 0);
    let f = 0, g = 0, _ = 0, m = 0, p = 0, E = 0, y = 0, A = 0, O = 0, w = 0, R = 0;
    l.sort(Cf);
    for (let Q = 0, x = l.length; Q < x; Q++) {
      const T = l[Q], q = T.color, X = T.intensity, j = T.distance, te = T.shadow && T.shadow.map ? T.shadow.map.texture : null;
      if (T.isAmbientLight)
        h += q.r * X, u += q.g * X, d += q.b * X;
      else if (T.isLightProbe) {
        for (let W = 0; W < 9; W++)
          n.probe[W].addScaledVector(T.sh.coefficients[W], X);
        R++;
      } else if (T.isDirectionalLight) {
        const W = e.get(T);
        if (W.color.copy(T.color).multiplyScalar(T.intensity), T.castShadow) {
          const oe = T.shadow, K = t.get(T);
          K.shadowIntensity = oe.intensity, K.shadowBias = oe.bias, K.shadowNormalBias = oe.normalBias, K.shadowRadius = oe.radius, K.shadowMapSize = oe.mapSize, n.directionalShadow[f] = K, n.directionalShadowMap[f] = te, n.directionalShadowMatrix[f] = T.shadow.matrix, E++;
        }
        n.directional[f] = W, f++;
      } else if (T.isSpotLight) {
        const W = e.get(T);
        W.position.setFromMatrixPosition(T.matrixWorld), W.color.copy(q).multiplyScalar(X), W.distance = j, W.coneCos = Math.cos(T.angle), W.penumbraCos = Math.cos(T.angle * (1 - T.penumbra)), W.decay = T.decay, n.spot[_] = W;
        const oe = T.shadow;
        if (T.map && (n.spotLightMap[O] = T.map, O++, oe.updateMatrices(T), T.castShadow && w++), n.spotLightMatrix[_] = oe.matrix, T.castShadow) {
          const K = t.get(T);
          K.shadowIntensity = oe.intensity, K.shadowBias = oe.bias, K.shadowNormalBias = oe.normalBias, K.shadowRadius = oe.radius, K.shadowMapSize = oe.mapSize, n.spotShadow[_] = K, n.spotShadowMap[_] = te, A++;
        }
        _++;
      } else if (T.isRectAreaLight) {
        const W = e.get(T);
        W.color.copy(q).multiplyScalar(X), W.halfWidth.set(T.width * 0.5, 0, 0), W.halfHeight.set(0, T.height * 0.5, 0), n.rectArea[m] = W, m++;
      } else if (T.isPointLight) {
        const W = e.get(T);
        if (W.color.copy(T.color).multiplyScalar(T.intensity), W.distance = T.distance, W.decay = T.decay, T.castShadow) {
          const oe = T.shadow, K = t.get(T);
          K.shadowIntensity = oe.intensity, K.shadowBias = oe.bias, K.shadowNormalBias = oe.normalBias, K.shadowRadius = oe.radius, K.shadowMapSize = oe.mapSize, K.shadowCameraNear = oe.camera.near, K.shadowCameraFar = oe.camera.far, n.pointShadow[g] = K, n.pointShadowMap[g] = te, n.pointShadowMatrix[g] = T.shadow.matrix, y++;
        }
        n.point[g] = W, g++;
      } else if (T.isHemisphereLight) {
        const W = e.get(T);
        W.skyColor.copy(T.color).multiplyScalar(X), W.groundColor.copy(T.groundColor).multiplyScalar(X), n.hemi[p] = W, p++;
      }
    }
    m > 0 && (s.has("OES_texture_float_linear") === !0 ? (n.rectAreaLTC1 = he.LTC_FLOAT_1, n.rectAreaLTC2 = he.LTC_FLOAT_2) : (n.rectAreaLTC1 = he.LTC_HALF_1, n.rectAreaLTC2 = he.LTC_HALF_2)), n.ambient[0] = h, n.ambient[1] = u, n.ambient[2] = d;
    const k = n.hash;
    (k.directionalLength !== f || k.pointLength !== g || k.spotLength !== _ || k.rectAreaLength !== m || k.hemiLength !== p || k.numDirectionalShadows !== E || k.numPointShadows !== y || k.numSpotShadows !== A || k.numSpotMaps !== O || k.numLightProbes !== R) && (n.directional.length = f, n.spot.length = _, n.rectArea.length = m, n.point.length = g, n.hemi.length = p, n.directionalShadow.length = E, n.directionalShadowMap.length = E, n.pointShadow.length = y, n.pointShadowMap.length = y, n.spotShadow.length = A, n.spotShadowMap.length = A, n.directionalShadowMatrix.length = E, n.pointShadowMatrix.length = y, n.spotLightMatrix.length = A + O - w, n.spotLightMap.length = O, n.numSpotLightShadowsWithMaps = w, n.numLightProbes = R, k.directionalLength = f, k.pointLength = g, k.spotLength = _, k.rectAreaLength = m, k.hemiLength = p, k.numDirectionalShadows = E, k.numPointShadows = y, k.numSpotShadows = A, k.numSpotMaps = O, k.numLightProbes = R, n.version = Rf++);
  }
  function c(l, h) {
    let u = 0, d = 0, f = 0, g = 0, _ = 0;
    const m = h.matrixWorldInverse;
    for (let p = 0, E = l.length; p < E; p++) {
      const y = l[p];
      if (y.isDirectionalLight) {
        const A = n.directional[u];
        A.direction.setFromMatrixPosition(y.matrixWorld), i.setFromMatrixPosition(y.target.matrixWorld), A.direction.sub(i), A.direction.transformDirection(m), u++;
      } else if (y.isSpotLight) {
        const A = n.spot[f];
        A.position.setFromMatrixPosition(y.matrixWorld), A.position.applyMatrix4(m), A.direction.setFromMatrixPosition(y.matrixWorld), i.setFromMatrixPosition(y.target.matrixWorld), A.direction.sub(i), A.direction.transformDirection(m), f++;
      } else if (y.isRectAreaLight) {
        const A = n.rectArea[g];
        A.position.setFromMatrixPosition(y.matrixWorld), A.position.applyMatrix4(m), a.identity(), r.copy(y.matrixWorld), r.premultiply(m), a.extractRotation(r), A.halfWidth.set(y.width * 0.5, 0, 0), A.halfHeight.set(0, y.height * 0.5, 0), A.halfWidth.applyMatrix4(a), A.halfHeight.applyMatrix4(a), g++;
      } else if (y.isPointLight) {
        const A = n.point[d];
        A.position.setFromMatrixPosition(y.matrixWorld), A.position.applyMatrix4(m), d++;
      } else if (y.isHemisphereLight) {
        const A = n.hemi[_];
        A.direction.setFromMatrixPosition(y.matrixWorld), A.direction.transformDirection(m), _++;
      }
    }
  }
  return {
    setup: o,
    setupView: c,
    state: n
  };
}
function ao(s) {
  const e = new If(s), t = [], n = [];
  function i(h) {
    l.camera = h, t.length = 0, n.length = 0;
  }
  function r(h) {
    t.push(h);
  }
  function a(h) {
    n.push(h);
  }
  function o() {
    e.setup(t);
  }
  function c(h) {
    e.setupView(t, h);
  }
  const l = {
    lightsArray: t,
    shadowsArray: n,
    camera: null,
    lights: e,
    transmissionRenderTarget: {}
  };
  return {
    init: i,
    state: l,
    setupLights: o,
    setupLightsView: c,
    pushLight: r,
    pushShadow: a
  };
}
function Pf(s) {
  let e = /* @__PURE__ */ new WeakMap();
  function t(i, r = 0) {
    const a = e.get(i);
    let o;
    return a === void 0 ? (o = new ao(s), e.set(i, [o])) : r >= a.length ? (o = new ao(s), a.push(o)) : o = a[r], o;
  }
  function n() {
    e = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: t,
    dispose: n
  };
}
class Lf extends nn {
  constructor(e) {
    super(), this.isMeshDepthMaterial = !0, this.type = "MeshDepthMaterial", this.depthPacking = 3200, this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.wireframe = !1, this.wireframeLinewidth = 1, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.depthPacking = e.depthPacking, this.map = e.map, this.alphaMap = e.alphaMap, this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this;
  }
}
class Df extends nn {
  constructor(e) {
    super(), this.isMeshDistanceMaterial = !0, this.type = "MeshDistanceMaterial", this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.map = e.map, this.alphaMap = e.alphaMap, this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this;
  }
}
const Uf = `void main() {
	gl_Position = vec4( position, 1.0 );
}`, Nf = `uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;
function Ff(s, e, t) {
  let n = new ra();
  const i = new Xe(), r = new Xe(), a = new ut(), o = new Lf({ depthPacking: 3201 }), c = new Df(), l = {}, h = t.maxTextureSize, u = { 0: 1, 1: 0, 2: 2 }, d = new Wn({
    defines: {
      VSM_SAMPLES: 8
    },
    uniforms: {
      shadow_pass: { value: null },
      resolution: { value: new Xe() },
      radius: { value: 4 }
    },
    vertexShader: Uf,
    fragmentShader: Nf
  }), f = d.clone();
  f.defines.HORIZONTAL_PASS = 1;
  const g = new Rt();
  g.setAttribute(
    "position",
    new jt(
      new Float32Array([-1, -1, 0.5, 3, -1, 0.5, -1, 3, 0.5]),
      3
    )
  );
  const _ = new We(g, d), m = this;
  this.enabled = !1, this.autoUpdate = !0, this.needsUpdate = !1, this.type = 1;
  let p = this.type;
  this.render = function(w, R, k) {
    if (m.enabled === !1 || m.autoUpdate === !1 && m.needsUpdate === !1 || w.length === 0) return;
    const Q = s.getRenderTarget(), x = s.getActiveCubeFace(), T = s.getActiveMipmapLevel(), q = s.state;
    q.setBlending(0), q.buffers.color.setClear(1, 1, 1, 1), q.buffers.depth.setTest(!0), q.setScissorTest(!1);
    const X = p !== 3 && this.type === 3, j = p === 3 && this.type !== 3;
    for (let te = 0, W = w.length; te < W; te++) {
      const oe = w[te], K = oe.shadow;
      if (K === void 0) {
        console.warn("THREE.WebGLShadowMap:", oe, "has no shadow.");
        continue;
      }
      if (K.autoUpdate === !1 && K.needsUpdate === !1) continue;
      i.copy(K.mapSize);
      const ge = K.getFrameExtents();
      if (i.multiply(ge), r.copy(K.mapSize), (i.x > h || i.y > h) && (i.x > h && (r.x = Math.floor(h / ge.x), i.x = r.x * ge.x, K.mapSize.x = r.x), i.y > h && (r.y = Math.floor(h / ge.y), i.y = r.y * ge.y, K.mapSize.y = r.y)), K.map === null || X === !0 || j === !0) {
        const Ae = this.type !== 3 ? { minFilter: 1003, magFilter: 1003 } : {};
        K.map !== null && K.map.dispose(), K.map = new si(i.x, i.y, Ae), K.map.texture.name = oe.name + ".shadowMap", K.camera.updateProjectionMatrix();
      }
      s.setRenderTarget(K.map), s.clear();
      const fe = K.getViewportCount();
      for (let Ae = 0; Ae < fe; Ae++) {
        const at = K.getViewport(Ae);
        a.set(
          r.x * at.x,
          r.y * at.y,
          r.x * at.z,
          r.y * at.w
        ), q.viewport(a), K.updateMatrices(oe, Ae), n = K.getFrustum(), A(R, k, K.camera, oe, this.type);
      }
      K.isPointLightShadow !== !0 && this.type === 3 && E(K, k), K.needsUpdate = !1;
    }
    p = this.type, m.needsUpdate = !1, s.setRenderTarget(Q, x, T);
  };
  function E(w, R) {
    const k = e.update(_);
    d.defines.VSM_SAMPLES !== w.blurSamples && (d.defines.VSM_SAMPLES = w.blurSamples, f.defines.VSM_SAMPLES = w.blurSamples, d.needsUpdate = !0, f.needsUpdate = !0), w.mapPass === null && (w.mapPass = new si(i.x, i.y)), d.uniforms.shadow_pass.value = w.map.texture, d.uniforms.resolution.value = w.mapSize, d.uniforms.radius.value = w.radius, s.setRenderTarget(w.mapPass), s.clear(), s.renderBufferDirect(R, null, k, d, _, null), f.uniforms.shadow_pass.value = w.mapPass.texture, f.uniforms.resolution.value = w.mapSize, f.uniforms.radius.value = w.radius, s.setRenderTarget(w.map), s.clear(), s.renderBufferDirect(R, null, k, f, _, null);
  }
  function y(w, R, k, Q) {
    let x = null;
    const T = k.isPointLight === !0 ? w.customDistanceMaterial : w.customDepthMaterial;
    if (T !== void 0)
      x = T;
    else if (x = k.isPointLight === !0 ? c : o, s.localClippingEnabled && R.clipShadows === !0 && Array.isArray(R.clippingPlanes) && R.clippingPlanes.length !== 0 || R.displacementMap && R.displacementScale !== 0 || R.alphaMap && R.alphaTest > 0 || R.map && R.alphaTest > 0) {
      const q = x.uuid, X = R.uuid;
      let j = l[q];
      j === void 0 && (j = {}, l[q] = j);
      let te = j[X];
      te === void 0 && (te = x.clone(), j[X] = te, R.addEventListener("dispose", O)), x = te;
    }
    if (x.visible = R.visible, x.wireframe = R.wireframe, Q === 3 ? x.side = R.shadowSide !== null ? R.shadowSide : R.side : x.side = R.shadowSide !== null ? R.shadowSide : u[R.side], x.alphaMap = R.alphaMap, x.alphaTest = R.alphaTest, x.map = R.map, x.clipShadows = R.clipShadows, x.clippingPlanes = R.clippingPlanes, x.clipIntersection = R.clipIntersection, x.displacementMap = R.displacementMap, x.displacementScale = R.displacementScale, x.displacementBias = R.displacementBias, x.wireframeLinewidth = R.wireframeLinewidth, x.linewidth = R.linewidth, k.isPointLight === !0 && x.isMeshDistanceMaterial === !0) {
      const q = s.properties.get(x);
      q.light = k;
    }
    return x;
  }
  function A(w, R, k, Q, x) {
    if (w.visible === !1) return;
    if (w.layers.test(R.layers) && (w.isMesh || w.isLine || w.isPoints) && (w.castShadow || w.receiveShadow && x === 3) && (!w.frustumCulled || n.intersectsObject(w))) {
      w.modelViewMatrix.multiplyMatrices(k.matrixWorldInverse, w.matrixWorld);
      const X = e.update(w), j = w.material;
      if (Array.isArray(j)) {
        const te = X.groups;
        for (let W = 0, oe = te.length; W < oe; W++) {
          const K = te[W], ge = j[K.materialIndex];
          if (ge && ge.visible) {
            const fe = y(w, ge, Q, x);
            w.onBeforeShadow(s, w, R, k, X, fe, K), s.renderBufferDirect(k, null, X, fe, w, K), w.onAfterShadow(s, w, R, k, X, fe, K);
          }
        }
      } else if (j.visible) {
        const te = y(w, j, Q, x);
        w.onBeforeShadow(s, w, R, k, X, te, null), s.renderBufferDirect(k, null, X, te, w, null), w.onAfterShadow(s, w, R, k, X, te, null);
      }
    }
    const q = w.children;
    for (let X = 0, j = q.length; X < j; X++)
      A(q[X], R, k, Q, x);
  }
  function O(w) {
    w.target.removeEventListener("dispose", O);
    for (const k in l) {
      const Q = l[k], x = w.target.uuid;
      x in Q && (Q[x].dispose(), delete Q[x]);
    }
  }
}
const Bf = {
  0: 1,
  2: 6,
  4: 7,
  3: 5,
  1: 0,
  6: 2,
  7: 4,
  5: 3
};
function Of(s) {
  function e() {
    let U = !1;
    const _e = new ut();
    let Y = null;
    const ee = new ut(0, 0, 0, 0);
    return {
      setMask: function(le) {
        Y !== le && !U && (s.colorMask(le, le, le, le), Y = le);
      },
      setLocked: function(le) {
        U = le;
      },
      setClear: function(le, ue, et, Tt, Ot) {
        Ot === !0 && (le *= Tt, ue *= Tt, et *= Tt), _e.set(le, ue, et, Tt), ee.equals(_e) === !1 && (s.clearColor(le, ue, et, Tt), ee.copy(_e));
      },
      reset: function() {
        U = !1, Y = null, ee.set(-1, 0, 0, 0);
      }
    };
  }
  function t() {
    let U = !1, _e = !1, Y = null, ee = null, le = null;
    return {
      setReversed: function(ue) {
        _e = ue;
      },
      setTest: function(ue) {
        ue ? Ee(s.DEPTH_TEST) : Me(s.DEPTH_TEST);
      },
      setMask: function(ue) {
        Y !== ue && !U && (s.depthMask(ue), Y = ue);
      },
      setFunc: function(ue) {
        if (_e && (ue = Bf[ue]), ee !== ue) {
          switch (ue) {
            case 0:
              s.depthFunc(s.NEVER);
              break;
            case 1:
              s.depthFunc(s.ALWAYS);
              break;
            case 2:
              s.depthFunc(s.LESS);
              break;
            case 3:
              s.depthFunc(s.LEQUAL);
              break;
            case 4:
              s.depthFunc(s.EQUAL);
              break;
            case 5:
              s.depthFunc(s.GEQUAL);
              break;
            case 6:
              s.depthFunc(s.GREATER);
              break;
            case 7:
              s.depthFunc(s.NOTEQUAL);
              break;
            default:
              s.depthFunc(s.LEQUAL);
          }
          ee = ue;
        }
      },
      setLocked: function(ue) {
        U = ue;
      },
      setClear: function(ue) {
        le !== ue && (s.clearDepth(ue), le = ue);
      },
      reset: function() {
        U = !1, Y = null, ee = null, le = null;
      }
    };
  }
  function n() {
    let U = !1, _e = null, Y = null, ee = null, le = null, ue = null, et = null, Tt = null, Ot = null;
    return {
      setTest: function(ot) {
        U || (ot ? Ee(s.STENCIL_TEST) : Me(s.STENCIL_TEST));
      },
      setMask: function(ot) {
        _e !== ot && !U && (s.stencilMask(ot), _e = ot);
      },
      setFunc: function(ot, Ct, hn) {
        (Y !== ot || ee !== Ct || le !== hn) && (s.stencilFunc(ot, Ct, hn), Y = ot, ee = Ct, le = hn);
      },
      setOp: function(ot, Ct, hn) {
        (ue !== ot || et !== Ct || Tt !== hn) && (s.stencilOp(ot, Ct, hn), ue = ot, et = Ct, Tt = hn);
      },
      setLocked: function(ot) {
        U = ot;
      },
      setClear: function(ot) {
        Ot !== ot && (s.clearStencil(ot), Ot = ot);
      },
      reset: function() {
        U = !1, _e = null, Y = null, ee = null, le = null, ue = null, et = null, Tt = null, Ot = null;
      }
    };
  }
  const i = new e(), r = new t(), a = new n(), o = /* @__PURE__ */ new WeakMap(), c = /* @__PURE__ */ new WeakMap();
  let l = {}, h = {}, u = /* @__PURE__ */ new WeakMap(), d = [], f = null, g = !1, _ = null, m = null, p = null, E = null, y = null, A = null, O = null, w = new Pe(0, 0, 0), R = 0, k = !1, Q = null, x = null, T = null, q = null, X = null;
  const j = s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
  let te = !1, W = 0;
  const oe = s.getParameter(s.VERSION);
  oe.indexOf("WebGL") !== -1 ? (W = parseFloat(/^WebGL (\d)/.exec(oe)[1]), te = W >= 1) : oe.indexOf("OpenGL ES") !== -1 && (W = parseFloat(/^OpenGL ES (\d)/.exec(oe)[1]), te = W >= 2);
  let K = null, ge = {};
  const fe = s.getParameter(s.SCISSOR_BOX), Ae = s.getParameter(s.VIEWPORT), at = new ut().fromArray(fe), lt = new ut().fromArray(Ae);
  function $(U, _e, Y, ee) {
    const le = new Uint8Array(4), ue = s.createTexture();
    s.bindTexture(U, ue), s.texParameteri(U, s.TEXTURE_MIN_FILTER, s.NEAREST), s.texParameteri(U, s.TEXTURE_MAG_FILTER, s.NEAREST);
    for (let et = 0; et < Y; et++)
      U === s.TEXTURE_3D || U === s.TEXTURE_2D_ARRAY ? s.texImage3D(_e, 0, s.RGBA, 1, 1, ee, 0, s.RGBA, s.UNSIGNED_BYTE, le) : s.texImage2D(_e + et, 0, s.RGBA, 1, 1, 0, s.RGBA, s.UNSIGNED_BYTE, le);
    return ue;
  }
  const ie = {};
  ie[s.TEXTURE_2D] = $(s.TEXTURE_2D, s.TEXTURE_2D, 1), ie[s.TEXTURE_CUBE_MAP] = $(s.TEXTURE_CUBE_MAP, s.TEXTURE_CUBE_MAP_POSITIVE_X, 6), ie[s.TEXTURE_2D_ARRAY] = $(s.TEXTURE_2D_ARRAY, s.TEXTURE_2D_ARRAY, 1, 1), ie[s.TEXTURE_3D] = $(s.TEXTURE_3D, s.TEXTURE_3D, 1, 1), i.setClear(0, 0, 0, 1), r.setClear(1), a.setClear(0), Ee(s.DEPTH_TEST), r.setFunc(3), Qe(!1), st(1), Ee(s.CULL_FACE), P(0);
  function Ee(U) {
    l[U] !== !0 && (s.enable(U), l[U] = !0);
  }
  function Me(U) {
    l[U] !== !1 && (s.disable(U), l[U] = !1);
  }
  function He(U, _e) {
    return h[U] !== _e ? (s.bindFramebuffer(U, _e), h[U] = _e, U === s.DRAW_FRAMEBUFFER && (h[s.FRAMEBUFFER] = _e), U === s.FRAMEBUFFER && (h[s.DRAW_FRAMEBUFFER] = _e), !0) : !1;
  }
  function Ue(U, _e) {
    let Y = d, ee = !1;
    if (U) {
      Y = u.get(_e), Y === void 0 && (Y = [], u.set(_e, Y));
      const le = U.textures;
      if (Y.length !== le.length || Y[0] !== s.COLOR_ATTACHMENT0) {
        for (let ue = 0, et = le.length; ue < et; ue++)
          Y[ue] = s.COLOR_ATTACHMENT0 + ue;
        Y.length = le.length, ee = !0;
      }
    } else
      Y[0] !== s.BACK && (Y[0] = s.BACK, ee = !0);
    ee && s.drawBuffers(Y);
  }
  function Ce(U) {
    return f !== U ? (s.useProgram(U), f = U, !0) : !1;
  }
  const Le = {
    100: s.FUNC_ADD,
    101: s.FUNC_SUBTRACT,
    102: s.FUNC_REVERSE_SUBTRACT
  };
  Le[103] = s.MIN, Le[104] = s.MAX;
  const z = {
    200: s.ZERO,
    201: s.ONE,
    202: s.SRC_COLOR,
    204: s.SRC_ALPHA,
    210: s.SRC_ALPHA_SATURATE,
    208: s.DST_COLOR,
    206: s.DST_ALPHA,
    203: s.ONE_MINUS_SRC_COLOR,
    205: s.ONE_MINUS_SRC_ALPHA,
    209: s.ONE_MINUS_DST_COLOR,
    207: s.ONE_MINUS_DST_ALPHA,
    211: s.CONSTANT_COLOR,
    212: s.ONE_MINUS_CONSTANT_COLOR,
    213: s.CONSTANT_ALPHA,
    214: s.ONE_MINUS_CONSTANT_ALPHA
  };
  function P(U, _e, Y, ee, le, ue, et, Tt, Ot, ot) {
    if (U === 0) {
      g === !0 && (Me(s.BLEND), g = !1);
      return;
    }
    if (g === !1 && (Ee(s.BLEND), g = !0), U !== 5) {
      if (U !== _ || ot !== k) {
        if ((m !== 100 || y !== 100) && (s.blendEquation(s.FUNC_ADD), m = 100, y = 100), ot)
          switch (U) {
            case 1:
              s.blendFuncSeparate(s.ONE, s.ONE_MINUS_SRC_ALPHA, s.ONE, s.ONE_MINUS_SRC_ALPHA);
              break;
            case 2:
              s.blendFunc(s.ONE, s.ONE);
              break;
            case 3:
              s.blendFuncSeparate(s.ZERO, s.ONE_MINUS_SRC_COLOR, s.ZERO, s.ONE);
              break;
            case 4:
              s.blendFuncSeparate(s.ZERO, s.SRC_COLOR, s.ZERO, s.SRC_ALPHA);
              break;
            default:
              console.error("THREE.WebGLState: Invalid blending: ", U);
              break;
          }
        else
          switch (U) {
            case 1:
              s.blendFuncSeparate(s.SRC_ALPHA, s.ONE_MINUS_SRC_ALPHA, s.ONE, s.ONE_MINUS_SRC_ALPHA);
              break;
            case 2:
              s.blendFunc(s.SRC_ALPHA, s.ONE);
              break;
            case 3:
              s.blendFuncSeparate(s.ZERO, s.ONE_MINUS_SRC_COLOR, s.ZERO, s.ONE);
              break;
            case 4:
              s.blendFunc(s.ZERO, s.SRC_COLOR);
              break;
            default:
              console.error("THREE.WebGLState: Invalid blending: ", U);
              break;
          }
        p = null, E = null, A = null, O = null, w.set(0, 0, 0), R = 0, _ = U, k = ot;
      }
      return;
    }
    le = le || _e, ue = ue || Y, et = et || ee, (_e !== m || le !== y) && (s.blendEquationSeparate(Le[_e], Le[le]), m = _e, y = le), (Y !== p || ee !== E || ue !== A || et !== O) && (s.blendFuncSeparate(z[Y], z[ee], z[ue], z[et]), p = Y, E = ee, A = ue, O = et), (Tt.equals(w) === !1 || Ot !== R) && (s.blendColor(Tt.r, Tt.g, Tt.b, Ot), w.copy(Tt), R = Ot), _ = U, k = !1;
  }
  function Wt(U, _e) {
    U.side === 2 ? Me(s.CULL_FACE) : Ee(s.CULL_FACE);
    let Y = U.side === 1;
    _e && (Y = !Y), Qe(Y), U.blending === 1 && U.transparent === !1 ? P(0) : P(U.blending, U.blendEquation, U.blendSrc, U.blendDst, U.blendEquationAlpha, U.blendSrcAlpha, U.blendDstAlpha, U.blendColor, U.blendAlpha, U.premultipliedAlpha), r.setFunc(U.depthFunc), r.setTest(U.depthTest), r.setMask(U.depthWrite), i.setMask(U.colorWrite);
    const ee = U.stencilWrite;
    a.setTest(ee), ee && (a.setMask(U.stencilWriteMask), a.setFunc(U.stencilFunc, U.stencilRef, U.stencilFuncMask), a.setOp(U.stencilFail, U.stencilZFail, U.stencilZPass)), gt(U.polygonOffset, U.polygonOffsetFactor, U.polygonOffsetUnits), U.alphaToCoverage === !0 ? Ee(s.SAMPLE_ALPHA_TO_COVERAGE) : Me(s.SAMPLE_ALPHA_TO_COVERAGE);
  }
  function Qe(U) {
    Q !== U && (U ? s.frontFace(s.CW) : s.frontFace(s.CCW), Q = U);
  }
  function st(U) {
    U !== 0 ? (Ee(s.CULL_FACE), U !== x && (U === 1 ? s.cullFace(s.BACK) : U === 2 ? s.cullFace(s.FRONT) : s.cullFace(s.FRONT_AND_BACK))) : Me(s.CULL_FACE), x = U;
  }
  function Be(U) {
    U !== T && (te && s.lineWidth(U), T = U);
  }
  function gt(U, _e, Y) {
    U ? (Ee(s.POLYGON_OFFSET_FILL), (q !== _e || X !== Y) && (s.polygonOffset(_e, Y), q = _e, X = Y)) : Me(s.POLYGON_OFFSET_FILL);
  }
  function ze(U) {
    U ? Ee(s.SCISSOR_TEST) : Me(s.SCISSOR_TEST);
  }
  function b(U) {
    U === void 0 && (U = s.TEXTURE0 + j - 1), K !== U && (s.activeTexture(U), K = U);
  }
  function v(U, _e, Y) {
    Y === void 0 && (K === null ? Y = s.TEXTURE0 + j - 1 : Y = K);
    let ee = ge[Y];
    ee === void 0 && (ee = { type: void 0, texture: void 0 }, ge[Y] = ee), (ee.type !== U || ee.texture !== _e) && (K !== Y && (s.activeTexture(Y), K = Y), s.bindTexture(U, _e || ie[U]), ee.type = U, ee.texture = _e);
  }
  function G() {
    const U = ge[K];
    U !== void 0 && U.type !== void 0 && (s.bindTexture(U.type, null), U.type = void 0, U.texture = void 0);
  }
  function J() {
    try {
      s.compressedTexImage2D.apply(s, arguments);
    } catch (U) {
      console.error("THREE.WebGLState:", U);
    }
  }
  function ne() {
    try {
      s.compressedTexImage3D.apply(s, arguments);
    } catch (U) {
      console.error("THREE.WebGLState:", U);
    }
  }
  function Z() {
    try {
      s.texSubImage2D.apply(s, arguments);
    } catch (U) {
      console.error("THREE.WebGLState:", U);
    }
  }
  function be() {
    try {
      s.texSubImage3D.apply(s, arguments);
    } catch (U) {
      console.error("THREE.WebGLState:", U);
    }
  }
  function ce() {
    try {
      s.compressedTexSubImage2D.apply(s, arguments);
    } catch (U) {
      console.error("THREE.WebGLState:", U);
    }
  }
  function de() {
    try {
      s.compressedTexSubImage3D.apply(s, arguments);
    } catch (U) {
      console.error("THREE.WebGLState:", U);
    }
  }
  function rt() {
    try {
      s.texStorage2D.apply(s, arguments);
    } catch (U) {
      console.error("THREE.WebGLState:", U);
    }
  }
  function re() {
    try {
      s.texStorage3D.apply(s, arguments);
    } catch (U) {
      console.error("THREE.WebGLState:", U);
    }
  }
  function ye() {
    try {
      s.texImage2D.apply(s, arguments);
    } catch (U) {
      console.error("THREE.WebGLState:", U);
    }
  }
  function De() {
    try {
      s.texImage3D.apply(s, arguments);
    } catch (U) {
      console.error("THREE.WebGLState:", U);
    }
  }
  function Ne(U) {
    at.equals(U) === !1 && (s.scissor(U.x, U.y, U.z, U.w), at.copy(U));
  }
  function ve(U) {
    lt.equals(U) === !1 && (s.viewport(U.x, U.y, U.z, U.w), lt.copy(U));
  }
  function je(U, _e) {
    let Y = c.get(_e);
    Y === void 0 && (Y = /* @__PURE__ */ new WeakMap(), c.set(_e, Y));
    let ee = Y.get(U);
    ee === void 0 && (ee = s.getUniformBlockIndex(_e, U.name), Y.set(U, ee));
  }
  function ke(U, _e) {
    const ee = c.get(_e).get(U);
    o.get(_e) !== ee && (s.uniformBlockBinding(_e, ee, U.__bindingPointIndex), o.set(_e, ee));
  }
  function ft() {
    s.disable(s.BLEND), s.disable(s.CULL_FACE), s.disable(s.DEPTH_TEST), s.disable(s.POLYGON_OFFSET_FILL), s.disable(s.SCISSOR_TEST), s.disable(s.STENCIL_TEST), s.disable(s.SAMPLE_ALPHA_TO_COVERAGE), s.blendEquation(s.FUNC_ADD), s.blendFunc(s.ONE, s.ZERO), s.blendFuncSeparate(s.ONE, s.ZERO, s.ONE, s.ZERO), s.blendColor(0, 0, 0, 0), s.colorMask(!0, !0, !0, !0), s.clearColor(0, 0, 0, 0), s.depthMask(!0), s.depthFunc(s.LESS), s.clearDepth(1), s.stencilMask(4294967295), s.stencilFunc(s.ALWAYS, 0, 4294967295), s.stencilOp(s.KEEP, s.KEEP, s.KEEP), s.clearStencil(0), s.cullFace(s.BACK), s.frontFace(s.CCW), s.polygonOffset(0, 0), s.activeTexture(s.TEXTURE0), s.bindFramebuffer(s.FRAMEBUFFER, null), s.bindFramebuffer(s.DRAW_FRAMEBUFFER, null), s.bindFramebuffer(s.READ_FRAMEBUFFER, null), s.useProgram(null), s.lineWidth(1), s.scissor(0, 0, s.canvas.width, s.canvas.height), s.viewport(0, 0, s.canvas.width, s.canvas.height), l = {}, K = null, ge = {}, h = {}, u = /* @__PURE__ */ new WeakMap(), d = [], f = null, g = !1, _ = null, m = null, p = null, E = null, y = null, A = null, O = null, w = new Pe(0, 0, 0), R = 0, k = !1, Q = null, x = null, T = null, q = null, X = null, at.set(0, 0, s.canvas.width, s.canvas.height), lt.set(0, 0, s.canvas.width, s.canvas.height), i.reset(), r.reset(), a.reset();
  }
  return {
    buffers: {
      color: i,
      depth: r,
      stencil: a
    },
    enable: Ee,
    disable: Me,
    bindFramebuffer: He,
    drawBuffers: Ue,
    useProgram: Ce,
    setBlending: P,
    setMaterial: Wt,
    setFlipSided: Qe,
    setCullFace: st,
    setLineWidth: Be,
    setPolygonOffset: gt,
    setScissorTest: ze,
    activeTexture: b,
    bindTexture: v,
    unbindTexture: G,
    compressedTexImage2D: J,
    compressedTexImage3D: ne,
    texImage2D: ye,
    texImage3D: De,
    updateUBOMapping: je,
    uniformBlockBinding: ke,
    texStorage2D: rt,
    texStorage3D: re,
    texSubImage2D: Z,
    texSubImage3D: be,
    compressedTexSubImage2D: ce,
    compressedTexSubImage3D: de,
    scissor: Ne,
    viewport: ve,
    reset: ft
  };
}
function oo(s, e, t, n) {
  const i = kf(n);
  switch (t) {
    case 1021:
      return s * e;
    case 1024:
      return s * e;
    case 1025:
      return s * e * 2;
    case 1028:
      return s * e / i.components * i.byteLength;
    case 1029:
      return s * e / i.components * i.byteLength;
    case 1030:
      return s * e * 2 / i.components * i.byteLength;
    case 1031:
      return s * e * 2 / i.components * i.byteLength;
    case 1022:
      return s * e * 3 / i.components * i.byteLength;
    case 1023:
      return s * e * 4 / i.components * i.byteLength;
    case 1033:
      return s * e * 4 / i.components * i.byteLength;
    case 33776:
    case 33777:
      return Math.floor((s + 3) / 4) * Math.floor((e + 3) / 4) * 8;
    case 33778:
    case 33779:
      return Math.floor((s + 3) / 4) * Math.floor((e + 3) / 4) * 16;
    case 35841:
    case 35843:
      return Math.max(s, 16) * Math.max(e, 8) / 4;
    case 35840:
    case 35842:
      return Math.max(s, 8) * Math.max(e, 8) / 2;
    case 36196:
    case 37492:
      return Math.floor((s + 3) / 4) * Math.floor((e + 3) / 4) * 8;
    case 37496:
      return Math.floor((s + 3) / 4) * Math.floor((e + 3) / 4) * 16;
    case 37808:
      return Math.floor((s + 3) / 4) * Math.floor((e + 3) / 4) * 16;
    case 37809:
      return Math.floor((s + 4) / 5) * Math.floor((e + 3) / 4) * 16;
    case 37810:
      return Math.floor((s + 4) / 5) * Math.floor((e + 4) / 5) * 16;
    case 37811:
      return Math.floor((s + 5) / 6) * Math.floor((e + 4) / 5) * 16;
    case 37812:
      return Math.floor((s + 5) / 6) * Math.floor((e + 5) / 6) * 16;
    case 37813:
      return Math.floor((s + 7) / 8) * Math.floor((e + 4) / 5) * 16;
    case 37814:
      return Math.floor((s + 7) / 8) * Math.floor((e + 5) / 6) * 16;
    case 37815:
      return Math.floor((s + 7) / 8) * Math.floor((e + 7) / 8) * 16;
    case 37816:
      return Math.floor((s + 9) / 10) * Math.floor((e + 4) / 5) * 16;
    case 37817:
      return Math.floor((s + 9) / 10) * Math.floor((e + 5) / 6) * 16;
    case 37818:
      return Math.floor((s + 9) / 10) * Math.floor((e + 7) / 8) * 16;
    case 37819:
      return Math.floor((s + 9) / 10) * Math.floor((e + 9) / 10) * 16;
    case 37820:
      return Math.floor((s + 11) / 12) * Math.floor((e + 9) / 10) * 16;
    case 37821:
      return Math.floor((s + 11) / 12) * Math.floor((e + 11) / 12) * 16;
    case 36492:
    case 36494:
    case 36495:
      return Math.ceil(s / 4) * Math.ceil(e / 4) * 16;
    case 36283:
    case 36284:
      return Math.ceil(s / 4) * Math.ceil(e / 4) * 8;
    case 36285:
    case 36286:
      return Math.ceil(s / 4) * Math.ceil(e / 4) * 16;
  }
  throw new Error(
    `Unable to determine texture byte length for ${t} format.`
  );
}
function kf(s) {
  switch (s) {
    case 1009:
    case 1010:
      return { byteLength: 1, components: 1 };
    case 1012:
    case 1011:
    case 1016:
      return { byteLength: 2, components: 1 };
    case 1017:
    case 1018:
      return { byteLength: 2, components: 4 };
    case 1014:
    case 1013:
    case 1015:
      return { byteLength: 4, components: 1 };
    case 35902:
      return { byteLength: 4, components: 3 };
  }
  throw new Error(`Unknown texture type ${s}.`);
}
function zf(s, e, t, n, i, r, a) {
  const o = e.has("WEBGL_multisampled_render_to_texture") ? e.get("WEBGL_multisampled_render_to_texture") : null, c = typeof navigator > "u" ? !1 : /OculusBrowser/g.test(navigator.userAgent), l = new Xe(), h = /* @__PURE__ */ new WeakMap();
  let u;
  const d = /* @__PURE__ */ new WeakMap();
  let f = !1;
  try {
    f = typeof OffscreenCanvas < "u" && new OffscreenCanvas(1, 1).getContext("2d") !== null;
  } catch {
  }
  function g(b, v) {
    return f ? (
      // eslint-disable-next-line compat/compat
      new OffscreenCanvas(b, v)
    ) : cs("canvas");
  }
  function _(b, v, G) {
    let J = 1;
    const ne = ze(b);
    if ((ne.width > G || ne.height > G) && (J = G / Math.max(ne.width, ne.height)), J < 1)
      if (typeof HTMLImageElement < "u" && b instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && b instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && b instanceof ImageBitmap || typeof VideoFrame < "u" && b instanceof VideoFrame) {
        const Z = Math.floor(J * ne.width), be = Math.floor(J * ne.height);
        u === void 0 && (u = g(Z, be));
        const ce = v ? g(Z, be) : u;
        return ce.width = Z, ce.height = be, ce.getContext("2d").drawImage(b, 0, 0, Z, be), console.warn("THREE.WebGLRenderer: Texture has been resized from (" + ne.width + "x" + ne.height + ") to (" + Z + "x" + be + ")."), ce;
      } else
        return "data" in b && console.warn("THREE.WebGLRenderer: Image in DataTexture is too big (" + ne.width + "x" + ne.height + ")."), b;
    return b;
  }
  function m(b) {
    return b.generateMipmaps && b.minFilter !== 1003 && b.minFilter !== 1006;
  }
  function p(b) {
    s.generateMipmap(b);
  }
  function E(b, v, G, J, ne = !1) {
    if (b !== null) {
      if (s[b] !== void 0) return s[b];
      console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '" + b + "'");
    }
    let Z = v;
    if (v === s.RED && (G === s.FLOAT && (Z = s.R32F), G === s.HALF_FLOAT && (Z = s.R16F), G === s.UNSIGNED_BYTE && (Z = s.R8)), v === s.RED_INTEGER && (G === s.UNSIGNED_BYTE && (Z = s.R8UI), G === s.UNSIGNED_SHORT && (Z = s.R16UI), G === s.UNSIGNED_INT && (Z = s.R32UI), G === s.BYTE && (Z = s.R8I), G === s.SHORT && (Z = s.R16I), G === s.INT && (Z = s.R32I)), v === s.RG && (G === s.FLOAT && (Z = s.RG32F), G === s.HALF_FLOAT && (Z = s.RG16F), G === s.UNSIGNED_BYTE && (Z = s.RG8)), v === s.RG_INTEGER && (G === s.UNSIGNED_BYTE && (Z = s.RG8UI), G === s.UNSIGNED_SHORT && (Z = s.RG16UI), G === s.UNSIGNED_INT && (Z = s.RG32UI), G === s.BYTE && (Z = s.RG8I), G === s.SHORT && (Z = s.RG16I), G === s.INT && (Z = s.RG32I)), v === s.RGB_INTEGER && (G === s.UNSIGNED_BYTE && (Z = s.RGB8UI), G === s.UNSIGNED_SHORT && (Z = s.RGB16UI), G === s.UNSIGNED_INT && (Z = s.RGB32UI), G === s.BYTE && (Z = s.RGB8I), G === s.SHORT && (Z = s.RGB16I), G === s.INT && (Z = s.RGB32I)), v === s.RGBA_INTEGER && (G === s.UNSIGNED_BYTE && (Z = s.RGBA8UI), G === s.UNSIGNED_SHORT && (Z = s.RGBA16UI), G === s.UNSIGNED_INT && (Z = s.RGBA32UI), G === s.BYTE && (Z = s.RGBA8I), G === s.SHORT && (Z = s.RGBA16I), G === s.INT && (Z = s.RGBA32I)), v === s.RGB && G === s.UNSIGNED_INT_5_9_9_9_REV && (Z = s.RGB9_E5), v === s.RGBA) {
      const be = ne ? Zs : it.getTransfer(J);
      G === s.FLOAT && (Z = s.RGBA32F), G === s.HALF_FLOAT && (Z = s.RGBA16F), G === s.UNSIGNED_BYTE && (Z = be === yt ? s.SRGB8_ALPHA8 : s.RGBA8), G === s.UNSIGNED_SHORT_4_4_4_4 && (Z = s.RGBA4), G === s.UNSIGNED_SHORT_5_5_5_1 && (Z = s.RGB5_A1);
    }
    return (Z === s.R16F || Z === s.R32F || Z === s.RG16F || Z === s.RG32F || Z === s.RGBA16F || Z === s.RGBA32F) && e.get("EXT_color_buffer_float"), Z;
  }
  function y(b, v) {
    let G;
    return b ? v === null || v === 1014 || v === 1020 ? G = s.DEPTH24_STENCIL8 : v === 1015 ? G = s.DEPTH32F_STENCIL8 : v === 1012 && (G = s.DEPTH24_STENCIL8, console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")) : v === null || v === 1014 || v === 1020 ? G = s.DEPTH_COMPONENT24 : v === 1015 ? G = s.DEPTH_COMPONENT32F : v === 1012 && (G = s.DEPTH_COMPONENT16), G;
  }
  function A(b, v) {
    return m(b) === !0 || b.isFramebufferTexture && b.minFilter !== 1003 && b.minFilter !== 1006 ? Math.log2(Math.max(v.width, v.height)) + 1 : b.mipmaps !== void 0 && b.mipmaps.length > 0 ? b.mipmaps.length : b.isCompressedTexture && Array.isArray(b.image) ? v.mipmaps.length : 1;
  }
  function O(b) {
    const v = b.target;
    v.removeEventListener("dispose", O), R(v), v.isVideoTexture && h.delete(v);
  }
  function w(b) {
    const v = b.target;
    v.removeEventListener("dispose", w), Q(v);
  }
  function R(b) {
    const v = n.get(b);
    if (v.__webglInit === void 0) return;
    const G = b.source, J = d.get(G);
    if (J) {
      const ne = J[v.__cacheKey];
      ne.usedTimes--, ne.usedTimes === 0 && k(b), Object.keys(J).length === 0 && d.delete(G);
    }
    n.remove(b);
  }
  function k(b) {
    const v = n.get(b);
    s.deleteTexture(v.__webglTexture);
    const G = b.source, J = d.get(G);
    delete J[v.__cacheKey], a.memory.textures--;
  }
  function Q(b) {
    const v = n.get(b);
    if (b.depthTexture && b.depthTexture.dispose(), b.isWebGLCubeRenderTarget)
      for (let J = 0; J < 6; J++) {
        if (Array.isArray(v.__webglFramebuffer[J]))
          for (let ne = 0; ne < v.__webglFramebuffer[J].length; ne++) s.deleteFramebuffer(v.__webglFramebuffer[J][ne]);
        else
          s.deleteFramebuffer(v.__webglFramebuffer[J]);
        v.__webglDepthbuffer && s.deleteRenderbuffer(v.__webglDepthbuffer[J]);
      }
    else {
      if (Array.isArray(v.__webglFramebuffer))
        for (let J = 0; J < v.__webglFramebuffer.length; J++) s.deleteFramebuffer(v.__webglFramebuffer[J]);
      else
        s.deleteFramebuffer(v.__webglFramebuffer);
      if (v.__webglDepthbuffer && s.deleteRenderbuffer(v.__webglDepthbuffer), v.__webglMultisampledFramebuffer && s.deleteFramebuffer(v.__webglMultisampledFramebuffer), v.__webglColorRenderbuffer)
        for (let J = 0; J < v.__webglColorRenderbuffer.length; J++)
          v.__webglColorRenderbuffer[J] && s.deleteRenderbuffer(v.__webglColorRenderbuffer[J]);
      v.__webglDepthRenderbuffer && s.deleteRenderbuffer(v.__webglDepthRenderbuffer);
    }
    const G = b.textures;
    for (let J = 0, ne = G.length; J < ne; J++) {
      const Z = n.get(G[J]);
      Z.__webglTexture && (s.deleteTexture(Z.__webglTexture), a.memory.textures--), n.remove(G[J]);
    }
    n.remove(b);
  }
  let x = 0;
  function T() {
    x = 0;
  }
  function q() {
    const b = x;
    return b >= i.maxTextures && console.warn("THREE.WebGLTextures: Trying to use " + b + " texture units while this GPU supports only " + i.maxTextures), x += 1, b;
  }
  function X(b) {
    const v = [];
    return v.push(b.wrapS), v.push(b.wrapT), v.push(b.wrapR || 0), v.push(b.magFilter), v.push(b.minFilter), v.push(b.anisotropy), v.push(b.internalFormat), v.push(b.format), v.push(b.type), v.push(b.generateMipmaps), v.push(b.premultiplyAlpha), v.push(b.flipY), v.push(b.unpackAlignment), v.push(b.colorSpace), v.join();
  }
  function j(b, v) {
    const G = n.get(b);
    if (b.isVideoTexture && Be(b), b.isRenderTargetTexture === !1 && b.version > 0 && G.__version !== b.version) {
      const J = b.image;
      if (J === null)
        console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");
      else if (J.complete === !1)
        console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");
      else {
        lt(G, b, v);
        return;
      }
    }
    t.bindTexture(s.TEXTURE_2D, G.__webglTexture, s.TEXTURE0 + v);
  }
  function te(b, v) {
    const G = n.get(b);
    if (b.version > 0 && G.__version !== b.version) {
      lt(G, b, v);
      return;
    }
    t.bindTexture(s.TEXTURE_2D_ARRAY, G.__webglTexture, s.TEXTURE0 + v);
  }
  function W(b, v) {
    const G = n.get(b);
    if (b.version > 0 && G.__version !== b.version) {
      lt(G, b, v);
      return;
    }
    t.bindTexture(s.TEXTURE_3D, G.__webglTexture, s.TEXTURE0 + v);
  }
  function oe(b, v) {
    const G = n.get(b);
    if (b.version > 0 && G.__version !== b.version) {
      $(G, b, v);
      return;
    }
    t.bindTexture(s.TEXTURE_CUBE_MAP, G.__webglTexture, s.TEXTURE0 + v);
  }
  const K = {
    1e3: s.REPEAT,
    1001: s.CLAMP_TO_EDGE,
    1002: s.MIRRORED_REPEAT
  }, ge = {
    1003: s.NEAREST,
    1004: s.NEAREST_MIPMAP_NEAREST,
    1005: s.NEAREST_MIPMAP_LINEAR,
    1006: s.LINEAR,
    1007: s.LINEAR_MIPMAP_NEAREST,
    1008: s.LINEAR_MIPMAP_LINEAR
  }, fe = {
    512: s.NEVER,
    519: s.ALWAYS,
    513: s.LESS,
    515: s.LEQUAL,
    514: s.EQUAL,
    518: s.GEQUAL,
    516: s.GREATER,
    517: s.NOTEQUAL
  };
  function Ae(b, v) {
    if (v.type === 1015 && e.has("OES_texture_float_linear") === !1 && (v.magFilter === 1006 || v.magFilter === 1007 || v.magFilter === 1005 || v.magFilter === 1008 || v.minFilter === 1006 || v.minFilter === 1007 || v.minFilter === 1005 || v.minFilter === 1008) && console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."), s.texParameteri(b, s.TEXTURE_WRAP_S, K[v.wrapS]), s.texParameteri(b, s.TEXTURE_WRAP_T, K[v.wrapT]), (b === s.TEXTURE_3D || b === s.TEXTURE_2D_ARRAY) && s.texParameteri(b, s.TEXTURE_WRAP_R, K[v.wrapR]), s.texParameteri(b, s.TEXTURE_MAG_FILTER, ge[v.magFilter]), s.texParameteri(b, s.TEXTURE_MIN_FILTER, ge[v.minFilter]), v.compareFunction && (s.texParameteri(b, s.TEXTURE_COMPARE_MODE, s.COMPARE_REF_TO_TEXTURE), s.texParameteri(b, s.TEXTURE_COMPARE_FUNC, fe[v.compareFunction])), e.has("EXT_texture_filter_anisotropic") === !0) {
      if (v.magFilter === 1003 || v.minFilter !== 1005 && v.minFilter !== 1008 || v.type === 1015 && e.has("OES_texture_float_linear") === !1) return;
      if (v.anisotropy > 1 || n.get(v).__currentAnisotropy) {
        const G = e.get("EXT_texture_filter_anisotropic");
        s.texParameterf(b, G.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(v.anisotropy, i.getMaxAnisotropy())), n.get(v).__currentAnisotropy = v.anisotropy;
      }
    }
  }
  function at(b, v) {
    let G = !1;
    b.__webglInit === void 0 && (b.__webglInit = !0, v.addEventListener("dispose", O));
    const J = v.source;
    let ne = d.get(J);
    ne === void 0 && (ne = {}, d.set(J, ne));
    const Z = X(v);
    if (Z !== b.__cacheKey) {
      ne[Z] === void 0 && (ne[Z] = {
        texture: s.createTexture(),
        usedTimes: 0
      }, a.memory.textures++, G = !0), ne[Z].usedTimes++;
      const be = ne[b.__cacheKey];
      be !== void 0 && (ne[b.__cacheKey].usedTimes--, be.usedTimes === 0 && k(v)), b.__cacheKey = Z, b.__webglTexture = ne[Z].texture;
    }
    return G;
  }
  function lt(b, v, G) {
    let J = s.TEXTURE_2D;
    (v.isDataArrayTexture || v.isCompressedArrayTexture) && (J = s.TEXTURE_2D_ARRAY), v.isData3DTexture && (J = s.TEXTURE_3D);
    const ne = at(b, v), Z = v.source;
    t.bindTexture(J, b.__webglTexture, s.TEXTURE0 + G);
    const be = n.get(Z);
    if (Z.version !== be.__version || ne === !0) {
      t.activeTexture(s.TEXTURE0 + G);
      const ce = it.getPrimaries(it.workingColorSpace), de = v.colorSpace === Hn ? null : it.getPrimaries(v.colorSpace), rt = v.colorSpace === Hn || ce === de ? s.NONE : s.BROWSER_DEFAULT_WEBGL;
      s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL, v.flipY), s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL, v.premultiplyAlpha), s.pixelStorei(s.UNPACK_ALIGNMENT, v.unpackAlignment), s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL, rt);
      let re = _(v.image, !1, i.maxTextureSize);
      re = gt(v, re);
      const ye = r.convert(v.format, v.colorSpace), De = r.convert(v.type);
      let Ne = E(v.internalFormat, ye, De, v.colorSpace, v.isVideoTexture);
      Ae(J, v);
      let ve;
      const je = v.mipmaps, ke = v.isVideoTexture !== !0, ft = be.__version === void 0 || ne === !0, U = Z.dataReady, _e = A(v, re);
      if (v.isDepthTexture)
        Ne = y(v.format === 1027, v.type), ft && (ke ? t.texStorage2D(s.TEXTURE_2D, 1, Ne, re.width, re.height) : t.texImage2D(s.TEXTURE_2D, 0, Ne, re.width, re.height, 0, ye, De, null));
      else if (v.isDataTexture)
        if (je.length > 0) {
          ke && ft && t.texStorage2D(s.TEXTURE_2D, _e, Ne, je[0].width, je[0].height);
          for (let Y = 0, ee = je.length; Y < ee; Y++)
            ve = je[Y], ke ? U && t.texSubImage2D(s.TEXTURE_2D, Y, 0, 0, ve.width, ve.height, ye, De, ve.data) : t.texImage2D(s.TEXTURE_2D, Y, Ne, ve.width, ve.height, 0, ye, De, ve.data);
          v.generateMipmaps = !1;
        } else
          ke ? (ft && t.texStorage2D(s.TEXTURE_2D, _e, Ne, re.width, re.height), U && t.texSubImage2D(s.TEXTURE_2D, 0, 0, 0, re.width, re.height, ye, De, re.data)) : t.texImage2D(s.TEXTURE_2D, 0, Ne, re.width, re.height, 0, ye, De, re.data);
      else if (v.isCompressedTexture)
        if (v.isCompressedArrayTexture) {
          ke && ft && t.texStorage3D(s.TEXTURE_2D_ARRAY, _e, Ne, je[0].width, je[0].height, re.depth);
          for (let Y = 0, ee = je.length; Y < ee; Y++)
            if (ve = je[Y], v.format !== 1023)
              if (ye !== null)
                if (ke) {
                  if (U)
                    if (v.layerUpdates.size > 0) {
                      const le = oo(ve.width, ve.height, v.format, v.type);
                      for (const ue of v.layerUpdates) {
                        const et = ve.data.subarray(
                          ue * le / ve.data.BYTES_PER_ELEMENT,
                          (ue + 1) * le / ve.data.BYTES_PER_ELEMENT
                        );
                        t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY, Y, 0, 0, ue, ve.width, ve.height, 1, ye, et, 0, 0);
                      }
                      v.clearLayerUpdates();
                    } else
                      t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY, Y, 0, 0, 0, ve.width, ve.height, re.depth, ye, ve.data, 0, 0);
                } else
                  t.compressedTexImage3D(s.TEXTURE_2D_ARRAY, Y, Ne, ve.width, ve.height, re.depth, 0, ve.data, 0, 0);
              else
                console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");
            else
              ke ? U && t.texSubImage3D(s.TEXTURE_2D_ARRAY, Y, 0, 0, 0, ve.width, ve.height, re.depth, ye, De, ve.data) : t.texImage3D(s.TEXTURE_2D_ARRAY, Y, Ne, ve.width, ve.height, re.depth, 0, ye, De, ve.data);
        } else {
          ke && ft && t.texStorage2D(s.TEXTURE_2D, _e, Ne, je[0].width, je[0].height);
          for (let Y = 0, ee = je.length; Y < ee; Y++)
            ve = je[Y], v.format !== 1023 ? ye !== null ? ke ? U && t.compressedTexSubImage2D(s.TEXTURE_2D, Y, 0, 0, ve.width, ve.height, ye, ve.data) : t.compressedTexImage2D(s.TEXTURE_2D, Y, Ne, ve.width, ve.height, 0, ve.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : ke ? U && t.texSubImage2D(s.TEXTURE_2D, Y, 0, 0, ve.width, ve.height, ye, De, ve.data) : t.texImage2D(s.TEXTURE_2D, Y, Ne, ve.width, ve.height, 0, ye, De, ve.data);
        }
      else if (v.isDataArrayTexture)
        if (ke) {
          if (ft && t.texStorage3D(s.TEXTURE_2D_ARRAY, _e, Ne, re.width, re.height, re.depth), U)
            if (v.layerUpdates.size > 0) {
              const Y = oo(re.width, re.height, v.format, v.type);
              for (const ee of v.layerUpdates) {
                const le = re.data.subarray(
                  ee * Y / re.data.BYTES_PER_ELEMENT,
                  (ee + 1) * Y / re.data.BYTES_PER_ELEMENT
                );
                t.texSubImage3D(s.TEXTURE_2D_ARRAY, 0, 0, 0, ee, re.width, re.height, 1, ye, De, le);
              }
              v.clearLayerUpdates();
            } else
              t.texSubImage3D(s.TEXTURE_2D_ARRAY, 0, 0, 0, 0, re.width, re.height, re.depth, ye, De, re.data);
        } else
          t.texImage3D(s.TEXTURE_2D_ARRAY, 0, Ne, re.width, re.height, re.depth, 0, ye, De, re.data);
      else if (v.isData3DTexture)
        ke ? (ft && t.texStorage3D(s.TEXTURE_3D, _e, Ne, re.width, re.height, re.depth), U && t.texSubImage3D(s.TEXTURE_3D, 0, 0, 0, 0, re.width, re.height, re.depth, ye, De, re.data)) : t.texImage3D(s.TEXTURE_3D, 0, Ne, re.width, re.height, re.depth, 0, ye, De, re.data);
      else if (v.isFramebufferTexture) {
        if (ft)
          if (ke)
            t.texStorage2D(s.TEXTURE_2D, _e, Ne, re.width, re.height);
          else {
            let Y = re.width, ee = re.height;
            for (let le = 0; le < _e; le++)
              t.texImage2D(s.TEXTURE_2D, le, Ne, Y, ee, 0, ye, De, null), Y >>= 1, ee >>= 1;
          }
      } else if (je.length > 0) {
        if (ke && ft) {
          const Y = ze(je[0]);
          t.texStorage2D(s.TEXTURE_2D, _e, Ne, Y.width, Y.height);
        }
        for (let Y = 0, ee = je.length; Y < ee; Y++)
          ve = je[Y], ke ? U && t.texSubImage2D(s.TEXTURE_2D, Y, 0, 0, ye, De, ve) : t.texImage2D(s.TEXTURE_2D, Y, Ne, ye, De, ve);
        v.generateMipmaps = !1;
      } else if (ke) {
        if (ft) {
          const Y = ze(re);
          t.texStorage2D(s.TEXTURE_2D, _e, Ne, Y.width, Y.height);
        }
        U && t.texSubImage2D(s.TEXTURE_2D, 0, 0, 0, ye, De, re);
      } else
        t.texImage2D(s.TEXTURE_2D, 0, Ne, ye, De, re);
      m(v) && p(J), be.__version = Z.version, v.onUpdate && v.onUpdate(v);
    }
    b.__version = v.version;
  }
  function $(b, v, G) {
    if (v.image.length !== 6) return;
    const J = at(b, v), ne = v.source;
    t.bindTexture(s.TEXTURE_CUBE_MAP, b.__webglTexture, s.TEXTURE0 + G);
    const Z = n.get(ne);
    if (ne.version !== Z.__version || J === !0) {
      t.activeTexture(s.TEXTURE0 + G);
      const be = it.getPrimaries(it.workingColorSpace), ce = v.colorSpace === Hn ? null : it.getPrimaries(v.colorSpace), de = v.colorSpace === Hn || be === ce ? s.NONE : s.BROWSER_DEFAULT_WEBGL;
      s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL, v.flipY), s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL, v.premultiplyAlpha), s.pixelStorei(s.UNPACK_ALIGNMENT, v.unpackAlignment), s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL, de);
      const rt = v.isCompressedTexture || v.image[0].isCompressedTexture, re = v.image[0] && v.image[0].isDataTexture, ye = [];
      for (let ee = 0; ee < 6; ee++)
        !rt && !re ? ye[ee] = _(v.image[ee], !0, i.maxCubemapSize) : ye[ee] = re ? v.image[ee].image : v.image[ee], ye[ee] = gt(v, ye[ee]);
      const De = ye[0], Ne = r.convert(v.format, v.colorSpace), ve = r.convert(v.type), je = E(v.internalFormat, Ne, ve, v.colorSpace), ke = v.isVideoTexture !== !0, ft = Z.__version === void 0 || J === !0, U = ne.dataReady;
      let _e = A(v, De);
      Ae(s.TEXTURE_CUBE_MAP, v);
      let Y;
      if (rt) {
        ke && ft && t.texStorage2D(s.TEXTURE_CUBE_MAP, _e, je, De.width, De.height);
        for (let ee = 0; ee < 6; ee++) {
          Y = ye[ee].mipmaps;
          for (let le = 0; le < Y.length; le++) {
            const ue = Y[le];
            v.format !== 1023 ? Ne !== null ? ke ? U && t.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ee, le, 0, 0, ue.width, ue.height, Ne, ue.data) : t.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ee, le, je, ue.width, ue.height, 0, ue.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()") : ke ? U && t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ee, le, 0, 0, ue.width, ue.height, Ne, ve, ue.data) : t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ee, le, je, ue.width, ue.height, 0, Ne, ve, ue.data);
          }
        }
      } else {
        if (Y = v.mipmaps, ke && ft) {
          Y.length > 0 && _e++;
          const ee = ze(ye[0]);
          t.texStorage2D(s.TEXTURE_CUBE_MAP, _e, je, ee.width, ee.height);
        }
        for (let ee = 0; ee < 6; ee++)
          if (re) {
            ke ? U && t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ee, 0, 0, 0, ye[ee].width, ye[ee].height, Ne, ve, ye[ee].data) : t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ee, 0, je, ye[ee].width, ye[ee].height, 0, Ne, ve, ye[ee].data);
            for (let le = 0; le < Y.length; le++) {
              const et = Y[le].image[ee].image;
              ke ? U && t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ee, le + 1, 0, 0, et.width, et.height, Ne, ve, et.data) : t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ee, le + 1, je, et.width, et.height, 0, Ne, ve, et.data);
            }
          } else {
            ke ? U && t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ee, 0, 0, 0, Ne, ve, ye[ee]) : t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ee, 0, je, Ne, ve, ye[ee]);
            for (let le = 0; le < Y.length; le++) {
              const ue = Y[le];
              ke ? U && t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ee, le + 1, 0, 0, Ne, ve, ue.image[ee]) : t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ee, le + 1, je, Ne, ve, ue.image[ee]);
            }
          }
      }
      m(v) && p(s.TEXTURE_CUBE_MAP), Z.__version = ne.version, v.onUpdate && v.onUpdate(v);
    }
    b.__version = v.version;
  }
  function ie(b, v, G, J, ne, Z) {
    const be = r.convert(G.format, G.colorSpace), ce = r.convert(G.type), de = E(G.internalFormat, be, ce, G.colorSpace);
    if (!n.get(v).__hasExternalTextures) {
      const re = Math.max(1, v.width >> Z), ye = Math.max(1, v.height >> Z);
      ne === s.TEXTURE_3D || ne === s.TEXTURE_2D_ARRAY ? t.texImage3D(ne, Z, de, re, ye, v.depth, 0, be, ce, null) : t.texImage2D(ne, Z, de, re, ye, 0, be, ce, null);
    }
    t.bindFramebuffer(s.FRAMEBUFFER, b), st(v) ? o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER, J, ne, n.get(G).__webglTexture, 0, Qe(v)) : (ne === s.TEXTURE_2D || ne >= s.TEXTURE_CUBE_MAP_POSITIVE_X && ne <= s.TEXTURE_CUBE_MAP_NEGATIVE_Z) && s.framebufferTexture2D(s.FRAMEBUFFER, J, ne, n.get(G).__webglTexture, Z), t.bindFramebuffer(s.FRAMEBUFFER, null);
  }
  function Ee(b, v, G) {
    if (s.bindRenderbuffer(s.RENDERBUFFER, b), v.depthBuffer) {
      const J = v.depthTexture, ne = J && J.isDepthTexture ? J.type : null, Z = y(v.stencilBuffer, ne), be = v.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT, ce = Qe(v);
      st(v) ? o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER, ce, Z, v.width, v.height) : G ? s.renderbufferStorageMultisample(s.RENDERBUFFER, ce, Z, v.width, v.height) : s.renderbufferStorage(s.RENDERBUFFER, Z, v.width, v.height), s.framebufferRenderbuffer(s.FRAMEBUFFER, be, s.RENDERBUFFER, b);
    } else {
      const J = v.textures;
      for (let ne = 0; ne < J.length; ne++) {
        const Z = J[ne], be = r.convert(Z.format, Z.colorSpace), ce = r.convert(Z.type), de = E(Z.internalFormat, be, ce, Z.colorSpace), rt = Qe(v);
        G && st(v) === !1 ? s.renderbufferStorageMultisample(s.RENDERBUFFER, rt, de, v.width, v.height) : st(v) ? o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER, rt, de, v.width, v.height) : s.renderbufferStorage(s.RENDERBUFFER, de, v.width, v.height);
      }
    }
    s.bindRenderbuffer(s.RENDERBUFFER, null);
  }
  function Me(b, v) {
    if (v && v.isWebGLCubeRenderTarget) throw new Error("Depth Texture with cube render targets is not supported");
    if (t.bindFramebuffer(s.FRAMEBUFFER, b), !(v.depthTexture && v.depthTexture.isDepthTexture))
      throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");
    (!n.get(v.depthTexture).__webglTexture || v.depthTexture.image.width !== v.width || v.depthTexture.image.height !== v.height) && (v.depthTexture.image.width = v.width, v.depthTexture.image.height = v.height, v.depthTexture.needsUpdate = !0), j(v.depthTexture, 0);
    const J = n.get(v.depthTexture).__webglTexture, ne = Qe(v);
    if (v.depthTexture.format === 1026)
      st(v) ? o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER, s.DEPTH_ATTACHMENT, s.TEXTURE_2D, J, 0, ne) : s.framebufferTexture2D(s.FRAMEBUFFER, s.DEPTH_ATTACHMENT, s.TEXTURE_2D, J, 0);
    else if (v.depthTexture.format === 1027)
      st(v) ? o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER, s.DEPTH_STENCIL_ATTACHMENT, s.TEXTURE_2D, J, 0, ne) : s.framebufferTexture2D(s.FRAMEBUFFER, s.DEPTH_STENCIL_ATTACHMENT, s.TEXTURE_2D, J, 0);
    else
      throw new Error("Unknown depthTexture format");
  }
  function He(b) {
    const v = n.get(b), G = b.isWebGLCubeRenderTarget === !0;
    if (v.__boundDepthTexture !== b.depthTexture) {
      const J = b.depthTexture;
      if (v.__depthDisposeCallback && v.__depthDisposeCallback(), J) {
        const ne = () => {
          delete v.__boundDepthTexture, delete v.__depthDisposeCallback, J.removeEventListener("dispose", ne);
        };
        J.addEventListener("dispose", ne), v.__depthDisposeCallback = ne;
      }
      v.__boundDepthTexture = J;
    }
    if (b.depthTexture && !v.__autoAllocateDepthBuffer) {
      if (G) throw new Error("target.depthTexture not supported in Cube render targets");
      Me(v.__webglFramebuffer, b);
    } else if (G) {
      v.__webglDepthbuffer = [];
      for (let J = 0; J < 6; J++)
        if (t.bindFramebuffer(s.FRAMEBUFFER, v.__webglFramebuffer[J]), v.__webglDepthbuffer[J] === void 0)
          v.__webglDepthbuffer[J] = s.createRenderbuffer(), Ee(v.__webglDepthbuffer[J], b, !1);
        else {
          const ne = b.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT, Z = v.__webglDepthbuffer[J];
          s.bindRenderbuffer(s.RENDERBUFFER, Z), s.framebufferRenderbuffer(s.FRAMEBUFFER, ne, s.RENDERBUFFER, Z);
        }
    } else if (t.bindFramebuffer(s.FRAMEBUFFER, v.__webglFramebuffer), v.__webglDepthbuffer === void 0)
      v.__webglDepthbuffer = s.createRenderbuffer(), Ee(v.__webglDepthbuffer, b, !1);
    else {
      const J = b.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT, ne = v.__webglDepthbuffer;
      s.bindRenderbuffer(s.RENDERBUFFER, ne), s.framebufferRenderbuffer(s.FRAMEBUFFER, J, s.RENDERBUFFER, ne);
    }
    t.bindFramebuffer(s.FRAMEBUFFER, null);
  }
  function Ue(b, v, G) {
    const J = n.get(b);
    v !== void 0 && ie(J.__webglFramebuffer, b, b.texture, s.COLOR_ATTACHMENT0, s.TEXTURE_2D, 0), G !== void 0 && He(b);
  }
  function Ce(b) {
    const v = b.texture, G = n.get(b), J = n.get(v);
    b.addEventListener("dispose", w);
    const ne = b.textures, Z = b.isWebGLCubeRenderTarget === !0, be = ne.length > 1;
    if (be || (J.__webglTexture === void 0 && (J.__webglTexture = s.createTexture()), J.__version = v.version, a.memory.textures++), Z) {
      G.__webglFramebuffer = [];
      for (let ce = 0; ce < 6; ce++)
        if (v.mipmaps && v.mipmaps.length > 0) {
          G.__webglFramebuffer[ce] = [];
          for (let de = 0; de < v.mipmaps.length; de++)
            G.__webglFramebuffer[ce][de] = s.createFramebuffer();
        } else
          G.__webglFramebuffer[ce] = s.createFramebuffer();
    } else {
      if (v.mipmaps && v.mipmaps.length > 0) {
        G.__webglFramebuffer = [];
        for (let ce = 0; ce < v.mipmaps.length; ce++)
          G.__webglFramebuffer[ce] = s.createFramebuffer();
      } else
        G.__webglFramebuffer = s.createFramebuffer();
      if (be)
        for (let ce = 0, de = ne.length; ce < de; ce++) {
          const rt = n.get(ne[ce]);
          rt.__webglTexture === void 0 && (rt.__webglTexture = s.createTexture(), a.memory.textures++);
        }
      if (b.samples > 0 && st(b) === !1) {
        G.__webglMultisampledFramebuffer = s.createFramebuffer(), G.__webglColorRenderbuffer = [], t.bindFramebuffer(s.FRAMEBUFFER, G.__webglMultisampledFramebuffer);
        for (let ce = 0; ce < ne.length; ce++) {
          const de = ne[ce];
          G.__webglColorRenderbuffer[ce] = s.createRenderbuffer(), s.bindRenderbuffer(s.RENDERBUFFER, G.__webglColorRenderbuffer[ce]);
          const rt = r.convert(de.format, de.colorSpace), re = r.convert(de.type), ye = E(de.internalFormat, rt, re, de.colorSpace, b.isXRRenderTarget === !0), De = Qe(b);
          s.renderbufferStorageMultisample(s.RENDERBUFFER, De, ye, b.width, b.height), s.framebufferRenderbuffer(s.FRAMEBUFFER, s.COLOR_ATTACHMENT0 + ce, s.RENDERBUFFER, G.__webglColorRenderbuffer[ce]);
        }
        s.bindRenderbuffer(s.RENDERBUFFER, null), b.depthBuffer && (G.__webglDepthRenderbuffer = s.createRenderbuffer(), Ee(G.__webglDepthRenderbuffer, b, !0)), t.bindFramebuffer(s.FRAMEBUFFER, null);
      }
    }
    if (Z) {
      t.bindTexture(s.TEXTURE_CUBE_MAP, J.__webglTexture), Ae(s.TEXTURE_CUBE_MAP, v);
      for (let ce = 0; ce < 6; ce++)
        if (v.mipmaps && v.mipmaps.length > 0)
          for (let de = 0; de < v.mipmaps.length; de++)
            ie(G.__webglFramebuffer[ce][de], b, v, s.COLOR_ATTACHMENT0, s.TEXTURE_CUBE_MAP_POSITIVE_X + ce, de);
        else
          ie(G.__webglFramebuffer[ce], b, v, s.COLOR_ATTACHMENT0, s.TEXTURE_CUBE_MAP_POSITIVE_X + ce, 0);
      m(v) && p(s.TEXTURE_CUBE_MAP), t.unbindTexture();
    } else if (be) {
      for (let ce = 0, de = ne.length; ce < de; ce++) {
        const rt = ne[ce], re = n.get(rt);
        t.bindTexture(s.TEXTURE_2D, re.__webglTexture), Ae(s.TEXTURE_2D, rt), ie(G.__webglFramebuffer, b, rt, s.COLOR_ATTACHMENT0 + ce, s.TEXTURE_2D, 0), m(rt) && p(s.TEXTURE_2D);
      }
      t.unbindTexture();
    } else {
      let ce = s.TEXTURE_2D;
      if ((b.isWebGL3DRenderTarget || b.isWebGLArrayRenderTarget) && (ce = b.isWebGL3DRenderTarget ? s.TEXTURE_3D : s.TEXTURE_2D_ARRAY), t.bindTexture(ce, J.__webglTexture), Ae(ce, v), v.mipmaps && v.mipmaps.length > 0)
        for (let de = 0; de < v.mipmaps.length; de++)
          ie(G.__webglFramebuffer[de], b, v, s.COLOR_ATTACHMENT0, ce, de);
      else
        ie(G.__webglFramebuffer, b, v, s.COLOR_ATTACHMENT0, ce, 0);
      m(v) && p(ce), t.unbindTexture();
    }
    b.depthBuffer && He(b);
  }
  function Le(b) {
    const v = b.textures;
    for (let G = 0, J = v.length; G < J; G++) {
      const ne = v[G];
      if (m(ne)) {
        const Z = b.isWebGLCubeRenderTarget ? s.TEXTURE_CUBE_MAP : s.TEXTURE_2D, be = n.get(ne).__webglTexture;
        t.bindTexture(Z, be), p(Z), t.unbindTexture();
      }
    }
  }
  const z = [], P = [];
  function Wt(b) {
    if (b.samples > 0) {
      if (st(b) === !1) {
        const v = b.textures, G = b.width, J = b.height;
        let ne = s.COLOR_BUFFER_BIT;
        const Z = b.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT, be = n.get(b), ce = v.length > 1;
        if (ce)
          for (let de = 0; de < v.length; de++)
            t.bindFramebuffer(s.FRAMEBUFFER, be.__webglMultisampledFramebuffer), s.framebufferRenderbuffer(s.FRAMEBUFFER, s.COLOR_ATTACHMENT0 + de, s.RENDERBUFFER, null), t.bindFramebuffer(s.FRAMEBUFFER, be.__webglFramebuffer), s.framebufferTexture2D(s.DRAW_FRAMEBUFFER, s.COLOR_ATTACHMENT0 + de, s.TEXTURE_2D, null, 0);
        t.bindFramebuffer(s.READ_FRAMEBUFFER, be.__webglMultisampledFramebuffer), t.bindFramebuffer(s.DRAW_FRAMEBUFFER, be.__webglFramebuffer);
        for (let de = 0; de < v.length; de++) {
          if (b.resolveDepthBuffer && (b.depthBuffer && (ne |= s.DEPTH_BUFFER_BIT), b.stencilBuffer && b.resolveStencilBuffer && (ne |= s.STENCIL_BUFFER_BIT)), ce) {
            s.framebufferRenderbuffer(s.READ_FRAMEBUFFER, s.COLOR_ATTACHMENT0, s.RENDERBUFFER, be.__webglColorRenderbuffer[de]);
            const rt = n.get(v[de]).__webglTexture;
            s.framebufferTexture2D(s.DRAW_FRAMEBUFFER, s.COLOR_ATTACHMENT0, s.TEXTURE_2D, rt, 0);
          }
          s.blitFramebuffer(0, 0, G, J, 0, 0, G, J, ne, s.NEAREST), c === !0 && (z.length = 0, P.length = 0, z.push(s.COLOR_ATTACHMENT0 + de), b.depthBuffer && b.resolveDepthBuffer === !1 && (z.push(Z), P.push(Z), s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER, P)), s.invalidateFramebuffer(s.READ_FRAMEBUFFER, z));
        }
        if (t.bindFramebuffer(s.READ_FRAMEBUFFER, null), t.bindFramebuffer(s.DRAW_FRAMEBUFFER, null), ce)
          for (let de = 0; de < v.length; de++) {
            t.bindFramebuffer(s.FRAMEBUFFER, be.__webglMultisampledFramebuffer), s.framebufferRenderbuffer(s.FRAMEBUFFER, s.COLOR_ATTACHMENT0 + de, s.RENDERBUFFER, be.__webglColorRenderbuffer[de]);
            const rt = n.get(v[de]).__webglTexture;
            t.bindFramebuffer(s.FRAMEBUFFER, be.__webglFramebuffer), s.framebufferTexture2D(s.DRAW_FRAMEBUFFER, s.COLOR_ATTACHMENT0 + de, s.TEXTURE_2D, rt, 0);
          }
        t.bindFramebuffer(s.DRAW_FRAMEBUFFER, be.__webglMultisampledFramebuffer);
      } else if (b.depthBuffer && b.resolveDepthBuffer === !1 && c) {
        const v = b.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT;
        s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER, [v]);
      }
    }
  }
  function Qe(b) {
    return Math.min(i.maxSamples, b.samples);
  }
  function st(b) {
    const v = n.get(b);
    return b.samples > 0 && e.has("WEBGL_multisampled_render_to_texture") === !0 && v.__useRenderToTexture !== !1;
  }
  function Be(b) {
    const v = a.render.frame;
    h.get(b) !== v && (h.set(b, v), b.update());
  }
  function gt(b, v) {
    const G = b.colorSpace, J = b.format, ne = b.type;
    return b.isCompressedTexture === !0 || b.isVideoTexture === !0 || G !== Bt && G !== Hn && (it.getTransfer(G) === yt ? (J !== 1023 || ne !== 1009) && console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.") : console.error("THREE.WebGLTextures: Unsupported texture color space:", G)), v;
  }
  function ze(b) {
    return typeof HTMLImageElement < "u" && b instanceof HTMLImageElement ? (l.width = b.naturalWidth || b.width, l.height = b.naturalHeight || b.height) : typeof VideoFrame < "u" && b instanceof VideoFrame ? (l.width = b.displayWidth, l.height = b.displayHeight) : (l.width = b.width, l.height = b.height), l;
  }
  this.allocateTextureUnit = q, this.resetTextureUnits = T, this.setTexture2D = j, this.setTexture2DArray = te, this.setTexture3D = W, this.setTextureCube = oe, this.rebindTextures = Ue, this.setupRenderTarget = Ce, this.updateRenderTargetMipmap = Le, this.updateMultisampleRenderTarget = Wt, this.setupDepthRenderbuffer = He, this.setupFrameBufferTexture = ie, this.useMultisampledRTT = st;
}
function Gf(s, e) {
  function t(n, i = Hn) {
    let r;
    const a = it.getTransfer(i);
    if (n === 1009) return s.UNSIGNED_BYTE;
    if (n === 1017) return s.UNSIGNED_SHORT_4_4_4_4;
    if (n === 1018) return s.UNSIGNED_SHORT_5_5_5_1;
    if (n === 35902) return s.UNSIGNED_INT_5_9_9_9_REV;
    if (n === 1010) return s.BYTE;
    if (n === 1011) return s.SHORT;
    if (n === 1012) return s.UNSIGNED_SHORT;
    if (n === 1013) return s.INT;
    if (n === 1014) return s.UNSIGNED_INT;
    if (n === 1015) return s.FLOAT;
    if (n === 1016) return s.HALF_FLOAT;
    if (n === 1021) return s.ALPHA;
    if (n === 1022) return s.RGB;
    if (n === 1023) return s.RGBA;
    if (n === 1024) return s.LUMINANCE;
    if (n === 1025) return s.LUMINANCE_ALPHA;
    if (n === 1026) return s.DEPTH_COMPONENT;
    if (n === 1027) return s.DEPTH_STENCIL;
    if (n === 1028) return s.RED;
    if (n === 1029) return s.RED_INTEGER;
    if (n === 1030) return s.RG;
    if (n === 1031) return s.RG_INTEGER;
    if (n === 1033) return s.RGBA_INTEGER;
    if (n === 33776 || n === 33777 || n === 33778 || n === 33779)
      if (a === yt)
        if (r = e.get("WEBGL_compressed_texture_s3tc_srgb"), r !== null) {
          if (n === 33776) return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;
          if (n === 33777) return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
          if (n === 33778) return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
          if (n === 33779) return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
        } else
          return null;
      else if (r = e.get("WEBGL_compressed_texture_s3tc"), r !== null) {
        if (n === 33776) return r.COMPRESSED_RGB_S3TC_DXT1_EXT;
        if (n === 33777) return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;
        if (n === 33778) return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;
        if (n === 33779) return r.COMPRESSED_RGBA_S3TC_DXT5_EXT;
      } else
        return null;
    if (n === 35840 || n === 35841 || n === 35842 || n === 35843)
      if (r = e.get("WEBGL_compressed_texture_pvrtc"), r !== null) {
        if (n === 35840) return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
        if (n === 35841) return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
        if (n === 35842) return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
        if (n === 35843) return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
      } else
        return null;
    if (n === 36196 || n === 37492 || n === 37496)
      if (r = e.get("WEBGL_compressed_texture_etc"), r !== null) {
        if (n === 36196 || n === 37492) return a === yt ? r.COMPRESSED_SRGB8_ETC2 : r.COMPRESSED_RGB8_ETC2;
        if (n === 37496) return a === yt ? r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : r.COMPRESSED_RGBA8_ETC2_EAC;
      } else
        return null;
    if (n === 37808 || n === 37809 || n === 37810 || n === 37811 || n === 37812 || n === 37813 || n === 37814 || n === 37815 || n === 37816 || n === 37817 || n === 37818 || n === 37819 || n === 37820 || n === 37821)
      if (r = e.get("WEBGL_compressed_texture_astc"), r !== null) {
        if (n === 37808) return a === yt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : r.COMPRESSED_RGBA_ASTC_4x4_KHR;
        if (n === 37809) return a === yt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR : r.COMPRESSED_RGBA_ASTC_5x4_KHR;
        if (n === 37810) return a === yt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR : r.COMPRESSED_RGBA_ASTC_5x5_KHR;
        if (n === 37811) return a === yt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR : r.COMPRESSED_RGBA_ASTC_6x5_KHR;
        if (n === 37812) return a === yt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR : r.COMPRESSED_RGBA_ASTC_6x6_KHR;
        if (n === 37813) return a === yt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR : r.COMPRESSED_RGBA_ASTC_8x5_KHR;
        if (n === 37814) return a === yt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR : r.COMPRESSED_RGBA_ASTC_8x6_KHR;
        if (n === 37815) return a === yt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR : r.COMPRESSED_RGBA_ASTC_8x8_KHR;
        if (n === 37816) return a === yt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR : r.COMPRESSED_RGBA_ASTC_10x5_KHR;
        if (n === 37817) return a === yt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR : r.COMPRESSED_RGBA_ASTC_10x6_KHR;
        if (n === 37818) return a === yt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR : r.COMPRESSED_RGBA_ASTC_10x8_KHR;
        if (n === 37819) return a === yt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR : r.COMPRESSED_RGBA_ASTC_10x10_KHR;
        if (n === 37820) return a === yt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR : r.COMPRESSED_RGBA_ASTC_12x10_KHR;
        if (n === 37821) return a === yt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR : r.COMPRESSED_RGBA_ASTC_12x12_KHR;
      } else
        return null;
    if (n === 36492 || n === 36494 || n === 36495)
      if (r = e.get("EXT_texture_compression_bptc"), r !== null) {
        if (n === 36492) return a === yt ? r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT : r.COMPRESSED_RGBA_BPTC_UNORM_EXT;
        if (n === 36494) return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;
        if (n === 36495) return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT;
      } else
        return null;
    if (n === 36283 || n === 36284 || n === 36285 || n === 36286)
      if (r = e.get("EXT_texture_compression_rgtc"), r !== null) {
        if (n === 36492) return r.COMPRESSED_RED_RGTC1_EXT;
        if (n === 36284) return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;
        if (n === 36285) return r.COMPRESSED_RED_GREEN_RGTC2_EXT;
        if (n === 36286) return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT;
      } else
        return null;
    return n === 1020 ? s.UNSIGNED_INT_24_8 : s[n] !== void 0 ? s[n] : null;
  }
  return { convert: t };
}
class Hf extends $t {
  constructor(e = []) {
    super(), this.isArrayCamera = !0, this.cameras = e;
  }
}
class Ft extends St {
  constructor() {
    super(), this.isGroup = !0, this.type = "Group";
  }
}
const Vf = { type: "move" };
class Nr {
  constructor() {
    this._targetRay = null, this._grip = null, this._hand = null;
  }
  getHandSpace() {
    return this._hand === null && (this._hand = new Ft(), this._hand.matrixAutoUpdate = !1, this._hand.visible = !1, this._hand.joints = {}, this._hand.inputState = { pinching: !1 }), this._hand;
  }
  getTargetRaySpace() {
    return this._targetRay === null && (this._targetRay = new Ft(), this._targetRay.matrixAutoUpdate = !1, this._targetRay.visible = !1, this._targetRay.hasLinearVelocity = !1, this._targetRay.linearVelocity = new L(), this._targetRay.hasAngularVelocity = !1, this._targetRay.angularVelocity = new L()), this._targetRay;
  }
  getGripSpace() {
    return this._grip === null && (this._grip = new Ft(), this._grip.matrixAutoUpdate = !1, this._grip.visible = !1, this._grip.hasLinearVelocity = !1, this._grip.linearVelocity = new L(), this._grip.hasAngularVelocity = !1, this._grip.angularVelocity = new L()), this._grip;
  }
  dispatchEvent(e) {
    return this._targetRay !== null && this._targetRay.dispatchEvent(e), this._grip !== null && this._grip.dispatchEvent(e), this._hand !== null && this._hand.dispatchEvent(e), this;
  }
  connect(e) {
    if (e && e.hand) {
      const t = this._hand;
      if (t)
        for (const n of e.hand.values())
          this._getHandJoint(t, n);
    }
    return this.dispatchEvent({ type: "connected", data: e }), this;
  }
  disconnect(e) {
    return this.dispatchEvent({ type: "disconnected", data: e }), this._targetRay !== null && (this._targetRay.visible = !1), this._grip !== null && (this._grip.visible = !1), this._hand !== null && (this._hand.visible = !1), this;
  }
  update(e, t, n) {
    let i = null, r = null, a = null;
    const o = this._targetRay, c = this._grip, l = this._hand;
    if (e && t.session.visibilityState !== "visible-blurred") {
      if (l && e.hand) {
        a = !0;
        for (const _ of e.hand.values()) {
          const m = t.getJointPose(_, n), p = this._getHandJoint(l, _);
          m !== null && (p.matrix.fromArray(m.transform.matrix), p.matrix.decompose(p.position, p.rotation, p.scale), p.matrixWorldNeedsUpdate = !0, p.jointRadius = m.radius), p.visible = m !== null;
        }
        const h = l.joints["index-finger-tip"], u = l.joints["thumb-tip"], d = h.position.distanceTo(u.position), f = 0.02, g = 5e-3;
        l.inputState.pinching && d > f + g ? (l.inputState.pinching = !1, this.dispatchEvent({
          type: "pinchend",
          handedness: e.handedness,
          target: this
        })) : !l.inputState.pinching && d <= f - g && (l.inputState.pinching = !0, this.dispatchEvent({
          type: "pinchstart",
          handedness: e.handedness,
          target: this
        }));
      } else
        c !== null && e.gripSpace && (r = t.getPose(e.gripSpace, n), r !== null && (c.matrix.fromArray(r.transform.matrix), c.matrix.decompose(c.position, c.rotation, c.scale), c.matrixWorldNeedsUpdate = !0, r.linearVelocity ? (c.hasLinearVelocity = !0, c.linearVelocity.copy(r.linearVelocity)) : c.hasLinearVelocity = !1, r.angularVelocity ? (c.hasAngularVelocity = !0, c.angularVelocity.copy(r.angularVelocity)) : c.hasAngularVelocity = !1));
      o !== null && (i = t.getPose(e.targetRaySpace, n), i === null && r !== null && (i = r), i !== null && (o.matrix.fromArray(i.transform.matrix), o.matrix.decompose(o.position, o.rotation, o.scale), o.matrixWorldNeedsUpdate = !0, i.linearVelocity ? (o.hasLinearVelocity = !0, o.linearVelocity.copy(i.linearVelocity)) : o.hasLinearVelocity = !1, i.angularVelocity ? (o.hasAngularVelocity = !0, o.angularVelocity.copy(i.angularVelocity)) : o.hasAngularVelocity = !1, this.dispatchEvent(Vf)));
    }
    return o !== null && (o.visible = i !== null), c !== null && (c.visible = r !== null), l !== null && (l.visible = a !== null), this;
  }
  // private method
  _getHandJoint(e, t) {
    if (e.joints[t.jointName] === void 0) {
      const n = new Ft();
      n.matrixAutoUpdate = !1, n.visible = !1, e.joints[t.jointName] = n, e.add(n);
    }
    return e.joints[t.jointName];
  }
}
const Wf = `
void main() {

	gl_Position = vec4( position, 1.0 );

}`, Xf = `
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;
class qf {
  constructor() {
    this.texture = null, this.mesh = null, this.depthNear = 0, this.depthFar = 0;
  }
  init(e, t, n) {
    if (this.texture === null) {
      const i = new It(), r = e.properties.get(i);
      r.__webglTexture = t.texture, (t.depthNear != n.depthNear || t.depthFar != n.depthFar) && (this.depthNear = t.depthNear, this.depthFar = t.depthFar), this.texture = i;
    }
  }
  getMesh(e) {
    if (this.texture !== null && this.mesh === null) {
      const t = e.cameras[0].viewport, n = new Wn({
        vertexShader: Wf,
        fragmentShader: Xf,
        uniforms: {
          depthColor: { value: this.texture },
          depthWidth: { value: t.z },
          depthHeight: { value: t.w }
        }
      });
      this.mesh = new We(new ki(20, 20), n);
    }
    return this.mesh;
  }
  reset() {
    this.texture = null, this.mesh = null;
  }
  getDepthTexture() {
    return this.texture;
  }
}
class jf extends ri {
  constructor(e, t) {
    super();
    const n = this;
    let i = null, r = 1, a = null, o = "local-floor", c = 1, l = null, h = null, u = null, d = null, f = null, g = null;
    const _ = new qf(), m = t.getContextAttributes();
    let p = null, E = null;
    const y = [], A = [], O = new Xe();
    let w = null;
    const R = new $t();
    R.layers.enable(1), R.viewport = new ut();
    const k = new $t();
    k.layers.enable(2), k.viewport = new ut();
    const Q = [R, k], x = new Hf();
    x.layers.enable(1), x.layers.enable(2);
    let T = null, q = null;
    this.cameraAutoUpdate = !0, this.enabled = !1, this.isPresenting = !1, this.getController = function($) {
      let ie = y[$];
      return ie === void 0 && (ie = new Nr(), y[$] = ie), ie.getTargetRaySpace();
    }, this.getControllerGrip = function($) {
      let ie = y[$];
      return ie === void 0 && (ie = new Nr(), y[$] = ie), ie.getGripSpace();
    }, this.getHand = function($) {
      let ie = y[$];
      return ie === void 0 && (ie = new Nr(), y[$] = ie), ie.getHandSpace();
    };
    function X($) {
      const ie = A.indexOf($.inputSource);
      if (ie === -1)
        return;
      const Ee = y[ie];
      Ee !== void 0 && (Ee.update($.inputSource, $.frame, l || a), Ee.dispatchEvent({ type: $.type, data: $.inputSource }));
    }
    function j() {
      i.removeEventListener("select", X), i.removeEventListener("selectstart", X), i.removeEventListener("selectend", X), i.removeEventListener("squeeze", X), i.removeEventListener("squeezestart", X), i.removeEventListener("squeezeend", X), i.removeEventListener("end", j), i.removeEventListener("inputsourceschange", te);
      for (let $ = 0; $ < y.length; $++) {
        const ie = A[$];
        ie !== null && (A[$] = null, y[$].disconnect(ie));
      }
      T = null, q = null, _.reset(), e.setRenderTarget(p), f = null, d = null, u = null, i = null, E = null, lt.stop(), n.isPresenting = !1, e.setPixelRatio(w), e.setSize(O.width, O.height, !1), n.dispatchEvent({ type: "sessionend" });
    }
    this.setFramebufferScaleFactor = function($) {
      r = $, n.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.");
    }, this.setReferenceSpaceType = function($) {
      o = $, n.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.");
    }, this.getReferenceSpace = function() {
      return l || a;
    }, this.setReferenceSpace = function($) {
      l = $;
    }, this.getBaseLayer = function() {
      return d !== null ? d : f;
    }, this.getBinding = function() {
      return u;
    }, this.getFrame = function() {
      return g;
    }, this.getSession = function() {
      return i;
    }, this.setSession = async function($) {
      if (i = $, i !== null) {
        if (p = e.getRenderTarget(), i.addEventListener("select", X), i.addEventListener("selectstart", X), i.addEventListener("selectend", X), i.addEventListener("squeeze", X), i.addEventListener("squeezestart", X), i.addEventListener("squeezeend", X), i.addEventListener("end", j), i.addEventListener("inputsourceschange", te), m.xrCompatible !== !0 && await t.makeXRCompatible(), w = e.getPixelRatio(), e.getSize(O), i.renderState.layers === void 0) {
          const ie = {
            antialias: m.antialias,
            alpha: !0,
            depth: m.depth,
            stencil: m.stencil,
            framebufferScaleFactor: r
          };
          f = new XRWebGLLayer(i, t, ie), i.updateRenderState({ baseLayer: f }), e.setPixelRatio(1), e.setSize(f.framebufferWidth, f.framebufferHeight, !1), E = new si(
            f.framebufferWidth,
            f.framebufferHeight,
            {
              format: 1023,
              type: 1009,
              colorSpace: e.outputColorSpace,
              stencilBuffer: m.stencil
            }
          );
        } else {
          let ie = null, Ee = null, Me = null;
          m.depth && (Me = m.stencil ? t.DEPTH24_STENCIL8 : t.DEPTH_COMPONENT24, ie = m.stencil ? 1027 : 1026, Ee = m.stencil ? 1020 : 1014);
          const He = {
            colorFormat: t.RGBA8,
            depthFormat: Me,
            scaleFactor: r
          };
          u = new XRWebGLBinding(i, t), d = u.createProjectionLayer(He), i.updateRenderState({ layers: [d] }), e.setPixelRatio(1), e.setSize(d.textureWidth, d.textureHeight, !1), E = new si(
            d.textureWidth,
            d.textureHeight,
            {
              format: 1023,
              type: 1009,
              depthTexture: new Zo(d.textureWidth, d.textureHeight, Ee, void 0, void 0, void 0, void 0, void 0, void 0, ie),
              stencilBuffer: m.stencil,
              colorSpace: e.outputColorSpace,
              samples: m.antialias ? 4 : 0,
              resolveDepthBuffer: d.ignoreDepthValues === !1
            }
          );
        }
        E.isXRRenderTarget = !0, this.setFoveation(c), l = null, a = await i.requestReferenceSpace(o), lt.setContext(i), lt.start(), n.isPresenting = !0, n.dispatchEvent({ type: "sessionstart" });
      }
    }, this.getEnvironmentBlendMode = function() {
      if (i !== null)
        return i.environmentBlendMode;
    }, this.getDepthTexture = function() {
      return _.getDepthTexture();
    };
    function te($) {
      for (let ie = 0; ie < $.removed.length; ie++) {
        const Ee = $.removed[ie], Me = A.indexOf(Ee);
        Me >= 0 && (A[Me] = null, y[Me].disconnect(Ee));
      }
      for (let ie = 0; ie < $.added.length; ie++) {
        const Ee = $.added[ie];
        let Me = A.indexOf(Ee);
        if (Me === -1) {
          for (let Ue = 0; Ue < y.length; Ue++)
            if (Ue >= A.length) {
              A.push(Ee), Me = Ue;
              break;
            } else if (A[Ue] === null) {
              A[Ue] = Ee, Me = Ue;
              break;
            }
          if (Me === -1) break;
        }
        const He = y[Me];
        He && He.connect(Ee);
      }
    }
    const W = new L(), oe = new L();
    function K($, ie, Ee) {
      W.setFromMatrixPosition(ie.matrixWorld), oe.setFromMatrixPosition(Ee.matrixWorld);
      const Me = W.distanceTo(oe), He = ie.projectionMatrix.elements, Ue = Ee.projectionMatrix.elements, Ce = He[14] / (He[10] - 1), Le = He[14] / (He[10] + 1), z = (He[9] + 1) / He[5], P = (He[9] - 1) / He[5], Wt = (He[8] - 1) / He[0], Qe = (Ue[8] + 1) / Ue[0], st = Ce * Wt, Be = Ce * Qe, gt = Me / (-Wt + Qe), ze = gt * -Wt;
      if (ie.matrixWorld.decompose($.position, $.quaternion, $.scale), $.translateX(ze), $.translateZ(gt), $.matrixWorld.compose($.position, $.quaternion, $.scale), $.matrixWorldInverse.copy($.matrixWorld).invert(), He[10] === -1)
        $.projectionMatrix.copy(ie.projectionMatrix), $.projectionMatrixInverse.copy(ie.projectionMatrixInverse);
      else {
        const b = Ce + gt, v = Le + gt, G = st - ze, J = Be + (Me - ze), ne = z * Le / v * b, Z = P * Le / v * b;
        $.projectionMatrix.makePerspective(G, J, ne, Z, b, v), $.projectionMatrixInverse.copy($.projectionMatrix).invert();
      }
    }
    function ge($, ie) {
      ie === null ? $.matrixWorld.copy($.matrix) : $.matrixWorld.multiplyMatrices(ie.matrixWorld, $.matrix), $.matrixWorldInverse.copy($.matrixWorld).invert();
    }
    this.updateCamera = function($) {
      if (i === null) return;
      let ie = $.near, Ee = $.far;
      _.texture !== null && (_.depthNear > 0 && (ie = _.depthNear), _.depthFar > 0 && (Ee = _.depthFar)), x.near = k.near = R.near = ie, x.far = k.far = R.far = Ee, (T !== x.near || q !== x.far) && (i.updateRenderState({
        depthNear: x.near,
        depthFar: x.far
      }), T = x.near, q = x.far);
      const Me = $.parent, He = x.cameras;
      ge(x, Me);
      for (let Ue = 0; Ue < He.length; Ue++)
        ge(He[Ue], Me);
      He.length === 2 ? K(x, R, k) : x.projectionMatrix.copy(R.projectionMatrix), fe($, x, Me);
    };
    function fe($, ie, Ee) {
      Ee === null ? $.matrix.copy(ie.matrixWorld) : ($.matrix.copy(Ee.matrixWorld), $.matrix.invert(), $.matrix.multiply(ie.matrixWorld)), $.matrix.decompose($.position, $.quaternion, $.scale), $.updateMatrixWorld(!0), $.projectionMatrix.copy(ie.projectionMatrix), $.projectionMatrixInverse.copy(ie.projectionMatrixInverse), $.isPerspectiveCamera && ($.fov = Ui * 2 * Math.atan(1 / $.projectionMatrix.elements[5]), $.zoom = 1);
    }
    this.getCamera = function() {
      return x;
    }, this.getFoveation = function() {
      if (!(d === null && f === null))
        return c;
    }, this.setFoveation = function($) {
      c = $, d !== null && (d.fixedFoveation = $), f !== null && f.fixedFoveation !== void 0 && (f.fixedFoveation = $);
    }, this.hasDepthSensing = function() {
      return _.texture !== null;
    }, this.getDepthSensingMesh = function() {
      return _.getMesh(x);
    };
    let Ae = null;
    function at($, ie) {
      if (h = ie.getViewerPose(l || a), g = ie, h !== null) {
        const Ee = h.views;
        f !== null && (e.setRenderTargetFramebuffer(E, f.framebuffer), e.setRenderTarget(E));
        let Me = !1;
        Ee.length !== x.cameras.length && (x.cameras.length = 0, Me = !0);
        for (let Ue = 0; Ue < Ee.length; Ue++) {
          const Ce = Ee[Ue];
          let Le = null;
          if (f !== null)
            Le = f.getViewport(Ce);
          else {
            const P = u.getViewSubImage(d, Ce);
            Le = P.viewport, Ue === 0 && (e.setRenderTargetTextures(
              E,
              P.colorTexture,
              d.ignoreDepthValues ? void 0 : P.depthStencilTexture
            ), e.setRenderTarget(E));
          }
          let z = Q[Ue];
          z === void 0 && (z = new $t(), z.layers.enable(Ue), z.viewport = new ut(), Q[Ue] = z), z.matrix.fromArray(Ce.transform.matrix), z.matrix.decompose(z.position, z.quaternion, z.scale), z.projectionMatrix.fromArray(Ce.projectionMatrix), z.projectionMatrixInverse.copy(z.projectionMatrix).invert(), z.viewport.set(Le.x, Le.y, Le.width, Le.height), Ue === 0 && (x.matrix.copy(z.matrix), x.matrix.decompose(x.position, x.quaternion, x.scale)), Me === !0 && x.cameras.push(z);
        }
        const He = i.enabledFeatures;
        if (He && He.includes("depth-sensing")) {
          const Ue = u.getDepthInformation(Ee[0]);
          Ue && Ue.isValid && Ue.texture && _.init(e, Ue, i.renderState);
        }
      }
      for (let Ee = 0; Ee < y.length; Ee++) {
        const Me = A[Ee], He = y[Ee];
        Me !== null && He !== void 0 && He.update(Me, ie, l || a);
      }
      Ae && Ae($, ie), ie.detectedPlanes && n.dispatchEvent({ type: "planesdetected", data: ie }), g = null;
    }
    const lt = new Ko();
    lt.setAnimationLoop(at), this.setAnimationLoop = function($) {
      Ae = $;
    }, this.dispose = function() {
    };
  }
}
const Jn = /* @__PURE__ */ new xn(), Yf = /* @__PURE__ */ new qe();
function Kf(s, e) {
  function t(m, p) {
    m.matrixAutoUpdate === !0 && m.updateMatrix(), p.value.copy(m.matrix);
  }
  function n(m, p) {
    p.color.getRGB(m.fogColor.value, qo(s)), p.isFog ? (m.fogNear.value = p.near, m.fogFar.value = p.far) : p.isFogExp2 && (m.fogDensity.value = p.density);
  }
  function i(m, p, E, y, A) {
    p.isMeshBasicMaterial || p.isMeshLambertMaterial ? r(m, p) : p.isMeshToonMaterial ? (r(m, p), u(m, p)) : p.isMeshPhongMaterial ? (r(m, p), h(m, p)) : p.isMeshStandardMaterial ? (r(m, p), d(m, p), p.isMeshPhysicalMaterial && f(m, p, A)) : p.isMeshMatcapMaterial ? (r(m, p), g(m, p)) : p.isMeshDepthMaterial ? r(m, p) : p.isMeshDistanceMaterial ? (r(m, p), _(m, p)) : p.isMeshNormalMaterial ? r(m, p) : p.isLineBasicMaterial ? (a(m, p), p.isLineDashedMaterial && o(m, p)) : p.isPointsMaterial ? c(m, p, E, y) : p.isSpriteMaterial ? l(m, p) : p.isShadowMaterial ? (m.color.value.copy(p.color), m.opacity.value = p.opacity) : p.isShaderMaterial && (p.uniformsNeedUpdate = !1);
  }
  function r(m, p) {
    m.opacity.value = p.opacity, p.color && m.diffuse.value.copy(p.color), p.emissive && m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity), p.map && (m.map.value = p.map, t(p.map, m.mapTransform)), p.alphaMap && (m.alphaMap.value = p.alphaMap, t(p.alphaMap, m.alphaMapTransform)), p.bumpMap && (m.bumpMap.value = p.bumpMap, t(p.bumpMap, m.bumpMapTransform), m.bumpScale.value = p.bumpScale, p.side === 1 && (m.bumpScale.value *= -1)), p.normalMap && (m.normalMap.value = p.normalMap, t(p.normalMap, m.normalMapTransform), m.normalScale.value.copy(p.normalScale), p.side === 1 && m.normalScale.value.negate()), p.displacementMap && (m.displacementMap.value = p.displacementMap, t(p.displacementMap, m.displacementMapTransform), m.displacementScale.value = p.displacementScale, m.displacementBias.value = p.displacementBias), p.emissiveMap && (m.emissiveMap.value = p.emissiveMap, t(p.emissiveMap, m.emissiveMapTransform)), p.specularMap && (m.specularMap.value = p.specularMap, t(p.specularMap, m.specularMapTransform)), p.alphaTest > 0 && (m.alphaTest.value = p.alphaTest);
    const E = e.get(p), y = E.envMap, A = E.envMapRotation;
    y && (m.envMap.value = y, Jn.copy(A), Jn.x *= -1, Jn.y *= -1, Jn.z *= -1, y.isCubeTexture && y.isRenderTargetTexture === !1 && (Jn.y *= -1, Jn.z *= -1), m.envMapRotation.value.setFromMatrix4(Yf.makeRotationFromEuler(Jn)), m.flipEnvMap.value = y.isCubeTexture && y.isRenderTargetTexture === !1 ? -1 : 1, m.reflectivity.value = p.reflectivity, m.ior.value = p.ior, m.refractionRatio.value = p.refractionRatio), p.lightMap && (m.lightMap.value = p.lightMap, m.lightMapIntensity.value = p.lightMapIntensity, t(p.lightMap, m.lightMapTransform)), p.aoMap && (m.aoMap.value = p.aoMap, m.aoMapIntensity.value = p.aoMapIntensity, t(p.aoMap, m.aoMapTransform));
  }
  function a(m, p) {
    m.diffuse.value.copy(p.color), m.opacity.value = p.opacity, p.map && (m.map.value = p.map, t(p.map, m.mapTransform));
  }
  function o(m, p) {
    m.dashSize.value = p.dashSize, m.totalSize.value = p.dashSize + p.gapSize, m.scale.value = p.scale;
  }
  function c(m, p, E, y) {
    m.diffuse.value.copy(p.color), m.opacity.value = p.opacity, m.size.value = p.size * E, m.scale.value = y * 0.5, p.map && (m.map.value = p.map, t(p.map, m.uvTransform)), p.alphaMap && (m.alphaMap.value = p.alphaMap, t(p.alphaMap, m.alphaMapTransform)), p.alphaTest > 0 && (m.alphaTest.value = p.alphaTest);
  }
  function l(m, p) {
    m.diffuse.value.copy(p.color), m.opacity.value = p.opacity, m.rotation.value = p.rotation, p.map && (m.map.value = p.map, t(p.map, m.mapTransform)), p.alphaMap && (m.alphaMap.value = p.alphaMap, t(p.alphaMap, m.alphaMapTransform)), p.alphaTest > 0 && (m.alphaTest.value = p.alphaTest);
  }
  function h(m, p) {
    m.specular.value.copy(p.specular), m.shininess.value = Math.max(p.shininess, 1e-4);
  }
  function u(m, p) {
    p.gradientMap && (m.gradientMap.value = p.gradientMap);
  }
  function d(m, p) {
    m.metalness.value = p.metalness, p.metalnessMap && (m.metalnessMap.value = p.metalnessMap, t(p.metalnessMap, m.metalnessMapTransform)), m.roughness.value = p.roughness, p.roughnessMap && (m.roughnessMap.value = p.roughnessMap, t(p.roughnessMap, m.roughnessMapTransform)), p.envMap && (m.envMapIntensity.value = p.envMapIntensity);
  }
  function f(m, p, E) {
    m.ior.value = p.ior, p.sheen > 0 && (m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen), m.sheenRoughness.value = p.sheenRoughness, p.sheenColorMap && (m.sheenColorMap.value = p.sheenColorMap, t(p.sheenColorMap, m.sheenColorMapTransform)), p.sheenRoughnessMap && (m.sheenRoughnessMap.value = p.sheenRoughnessMap, t(p.sheenRoughnessMap, m.sheenRoughnessMapTransform))), p.clearcoat > 0 && (m.clearcoat.value = p.clearcoat, m.clearcoatRoughness.value = p.clearcoatRoughness, p.clearcoatMap && (m.clearcoatMap.value = p.clearcoatMap, t(p.clearcoatMap, m.clearcoatMapTransform)), p.clearcoatRoughnessMap && (m.clearcoatRoughnessMap.value = p.clearcoatRoughnessMap, t(p.clearcoatRoughnessMap, m.clearcoatRoughnessMapTransform)), p.clearcoatNormalMap && (m.clearcoatNormalMap.value = p.clearcoatNormalMap, t(p.clearcoatNormalMap, m.clearcoatNormalMapTransform), m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale), p.side === 1 && m.clearcoatNormalScale.value.negate())), p.dispersion > 0 && (m.dispersion.value = p.dispersion), p.iridescence > 0 && (m.iridescence.value = p.iridescence, m.iridescenceIOR.value = p.iridescenceIOR, m.iridescenceThicknessMinimum.value = p.iridescenceThicknessRange[0], m.iridescenceThicknessMaximum.value = p.iridescenceThicknessRange[1], p.iridescenceMap && (m.iridescenceMap.value = p.iridescenceMap, t(p.iridescenceMap, m.iridescenceMapTransform)), p.iridescenceThicknessMap && (m.iridescenceThicknessMap.value = p.iridescenceThicknessMap, t(p.iridescenceThicknessMap, m.iridescenceThicknessMapTransform))), p.transmission > 0 && (m.transmission.value = p.transmission, m.transmissionSamplerMap.value = E.texture, m.transmissionSamplerSize.value.set(E.width, E.height), p.transmissionMap && (m.transmissionMap.value = p.transmissionMap, t(p.transmissionMap, m.transmissionMapTransform)), m.thickness.value = p.thickness, p.thicknessMap && (m.thicknessMap.value = p.thicknessMap, t(p.thicknessMap, m.thicknessMapTransform)), m.attenuationDistance.value = p.attenuationDistance, m.attenuationColor.value.copy(p.attenuationColor)), p.anisotropy > 0 && (m.anisotropyVector.value.set(p.anisotropy * Math.cos(p.anisotropyRotation), p.anisotropy * Math.sin(p.anisotropyRotation)), p.anisotropyMap && (m.anisotropyMap.value = p.anisotropyMap, t(p.anisotropyMap, m.anisotropyMapTransform))), m.specularIntensity.value = p.specularIntensity, m.specularColor.value.copy(p.specularColor), p.specularColorMap && (m.specularColorMap.value = p.specularColorMap, t(p.specularColorMap, m.specularColorMapTransform)), p.specularIntensityMap && (m.specularIntensityMap.value = p.specularIntensityMap, t(p.specularIntensityMap, m.specularIntensityMapTransform));
  }
  function g(m, p) {
    p.matcap && (m.matcap.value = p.matcap);
  }
  function _(m, p) {
    const E = e.get(p).light;
    m.referencePosition.value.setFromMatrixPosition(E.matrixWorld), m.nearDistance.value = E.shadow.camera.near, m.farDistance.value = E.shadow.camera.far;
  }
  return {
    refreshFogUniforms: n,
    refreshMaterialUniforms: i
  };
}
function Zf(s, e, t, n) {
  let i = {}, r = {}, a = [];
  const o = s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);
  function c(E, y) {
    const A = y.program;
    n.uniformBlockBinding(E, A);
  }
  function l(E, y) {
    let A = i[E.id];
    A === void 0 && (g(E), A = h(E), i[E.id] = A, E.addEventListener("dispose", m));
    const O = y.program;
    n.updateUBOMapping(E, O);
    const w = e.render.frame;
    r[E.id] !== w && (d(E), r[E.id] = w);
  }
  function h(E) {
    const y = u();
    E.__bindingPointIndex = y;
    const A = s.createBuffer(), O = E.__size, w = E.usage;
    return s.bindBuffer(s.UNIFORM_BUFFER, A), s.bufferData(s.UNIFORM_BUFFER, O, w), s.bindBuffer(s.UNIFORM_BUFFER, null), s.bindBufferBase(s.UNIFORM_BUFFER, y, A), A;
  }
  function u() {
    for (let E = 0; E < o; E++)
      if (a.indexOf(E) === -1)
        return a.push(E), E;
    return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."), 0;
  }
  function d(E) {
    const y = i[E.id], A = E.uniforms, O = E.__cache;
    s.bindBuffer(s.UNIFORM_BUFFER, y);
    for (let w = 0, R = A.length; w < R; w++) {
      const k = Array.isArray(A[w]) ? A[w] : [A[w]];
      for (let Q = 0, x = k.length; Q < x; Q++) {
        const T = k[Q];
        if (f(T, w, Q, O) === !0) {
          const q = T.__offset, X = Array.isArray(T.value) ? T.value : [T.value];
          let j = 0;
          for (let te = 0; te < X.length; te++) {
            const W = X[te], oe = _(W);
            typeof W == "number" || typeof W == "boolean" ? (T.__data[0] = W, s.bufferSubData(s.UNIFORM_BUFFER, q + j, T.__data)) : W.isMatrix3 ? (T.__data[0] = W.elements[0], T.__data[1] = W.elements[1], T.__data[2] = W.elements[2], T.__data[3] = 0, T.__data[4] = W.elements[3], T.__data[5] = W.elements[4], T.__data[6] = W.elements[5], T.__data[7] = 0, T.__data[8] = W.elements[6], T.__data[9] = W.elements[7], T.__data[10] = W.elements[8], T.__data[11] = 0) : (W.toArray(T.__data, j), j += oe.storage / Float32Array.BYTES_PER_ELEMENT);
          }
          s.bufferSubData(s.UNIFORM_BUFFER, q, T.__data);
        }
      }
    }
    s.bindBuffer(s.UNIFORM_BUFFER, null);
  }
  function f(E, y, A, O) {
    const w = E.value, R = y + "_" + A;
    if (O[R] === void 0)
      return typeof w == "number" || typeof w == "boolean" ? O[R] = w : O[R] = w.clone(), !0;
    {
      const k = O[R];
      if (typeof w == "number" || typeof w == "boolean") {
        if (k !== w)
          return O[R] = w, !0;
      } else if (k.equals(w) === !1)
        return k.copy(w), !0;
    }
    return !1;
  }
  function g(E) {
    const y = E.uniforms;
    let A = 0;
    const O = 16;
    for (let R = 0, k = y.length; R < k; R++) {
      const Q = Array.isArray(y[R]) ? y[R] : [y[R]];
      for (let x = 0, T = Q.length; x < T; x++) {
        const q = Q[x], X = Array.isArray(q.value) ? q.value : [q.value];
        for (let j = 0, te = X.length; j < te; j++) {
          const W = X[j], oe = _(W), K = A % O, ge = K % oe.boundary, fe = K + ge;
          A += ge, fe !== 0 && O - fe < oe.storage && (A += O - fe), q.__data = new Float32Array(oe.storage / Float32Array.BYTES_PER_ELEMENT), q.__offset = A, A += oe.storage;
        }
      }
    }
    const w = A % O;
    return w > 0 && (A += O - w), E.__size = A, E.__cache = {}, this;
  }
  function _(E) {
    const y = {
      boundary: 0,
      // bytes
      storage: 0
      // bytes
    };
    return typeof E == "number" || typeof E == "boolean" ? (y.boundary = 4, y.storage = 4) : E.isVector2 ? (y.boundary = 8, y.storage = 8) : E.isVector3 || E.isColor ? (y.boundary = 16, y.storage = 12) : E.isVector4 ? (y.boundary = 16, y.storage = 16) : E.isMatrix3 ? (y.boundary = 48, y.storage = 48) : E.isMatrix4 ? (y.boundary = 64, y.storage = 64) : E.isTexture ? console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.") : console.warn("THREE.WebGLRenderer: Unsupported uniform value type.", E), y;
  }
  function m(E) {
    const y = E.target;
    y.removeEventListener("dispose", m);
    const A = a.indexOf(y.__bindingPointIndex);
    a.splice(A, 1), s.deleteBuffer(i[y.id]), delete i[y.id], delete r[y.id];
  }
  function p() {
    for (const E in i)
      s.deleteBuffer(i[E]);
    a = [], i = {}, r = {};
  }
  return {
    bind: c,
    update: l,
    dispose: p
  };
}
class $f {
  constructor(e = {}) {
    const {
      canvas: t = Bc(),
      context: n = null,
      depth: i = !0,
      stencil: r = !1,
      alpha: a = !1,
      antialias: o = !1,
      premultipliedAlpha: c = !0,
      preserveDrawingBuffer: l = !1,
      powerPreference: h = "default",
      failIfMajorPerformanceCaveat: u = !1
    } = e;
    this.isWebGLRenderer = !0;
    let d;
    if (n !== null) {
      if (typeof WebGLRenderingContext < "u" && n instanceof WebGLRenderingContext)
        throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");
      d = n.getContextAttributes().alpha;
    } else
      d = a;
    const f = new Uint32Array(4), g = new Int32Array(4);
    let _ = null, m = null;
    const p = [], E = [];
    this.domElement = t, this.debug = {
      /**
       * Enables error checking and reporting when shader programs are being compiled
       * @type {boolean}
       */
      checkShaderErrors: !0,
      /**
       * Callback for custom error reporting.
       * @type {?Function}
       */
      onShaderError: null
    }, this.autoClear = !0, this.autoClearColor = !0, this.autoClearDepth = !0, this.autoClearStencil = !0, this.sortObjects = !0, this.clippingPlanes = [], this.localClippingEnabled = !1, this._outputColorSpace = At, this.toneMapping = 0, this.toneMappingExposure = 1;
    const y = this;
    let A = !1, O = 0, w = 0, R = null, k = -1, Q = null;
    const x = new ut(), T = new ut();
    let q = null;
    const X = new Pe(0);
    let j = 0, te = t.width, W = t.height, oe = 1, K = null, ge = null;
    const fe = new ut(0, 0, te, W), Ae = new ut(0, 0, te, W);
    let at = !1;
    const lt = new ra();
    let $ = !1, ie = !1;
    const Ee = new qe(), Me = new qe(), He = new L(), Ue = new ut(), Ce = { background: null, fog: null, environment: null, overrideMaterial: null, isScene: !0 };
    let Le = !1;
    function z() {
      return R === null ? oe : 1;
    }
    let P = n;
    function Wt(S, N) {
      return t.getContext(S, N);
    }
    try {
      const S = {
        alpha: !0,
        depth: i,
        stencil: r,
        antialias: o,
        premultipliedAlpha: c,
        preserveDrawingBuffer: l,
        powerPreference: h,
        failIfMajorPerformanceCaveat: u
      };
      if ("setAttribute" in t && t.setAttribute("data-engine", `three.js r${ta}`), t.addEventListener("webglcontextlost", ee, !1), t.addEventListener("webglcontextrestored", le, !1), t.addEventListener("webglcontextcreationerror", ue, !1), P === null) {
        const N = "webgl2";
        if (P = Wt(N, S), P === null)
          throw Wt(N) ? new Error("Error creating WebGL context with your selected attributes.") : new Error("Error creating WebGL context.");
      }
    } catch (S) {
      throw console.error("THREE.WebGLRenderer: " + S.message), S;
    }
    let Qe, st, Be, gt, ze, b, v, G, J, ne, Z, be, ce, de, rt, re, ye, De, Ne, ve, je, ke, ft, U;
    function _e() {
      Qe = new td(P), Qe.init(), ke = new Gf(P, Qe), st = new Ku(P, Qe, e, ke), Be = new Of(P), st.reverseDepthBuffer && Be.buffers.depth.setReversed(!0), gt = new sd(P), ze = new Ef(), b = new zf(P, Qe, Be, ze, st, ke, gt), v = new $u(y), G = new ed(y), J = new ul(P), ft = new ju(P, J), ne = new nd(P, J, gt, ft), Z = new ad(P, ne, J, gt), Ne = new rd(P, st, b), re = new Zu(ze), be = new Sf(y, v, G, Qe, st, ft, re), ce = new Kf(y, ze), de = new Af(), rt = new Pf(Qe), De = new qu(y, v, G, Be, Z, d, c), ye = new Ff(y, Z, st), U = new Zf(P, gt, st, Be), ve = new Yu(P, Qe, gt), je = new id(P, Qe, gt), gt.programs = be.programs, y.capabilities = st, y.extensions = Qe, y.properties = ze, y.renderLists = de, y.shadowMap = ye, y.state = Be, y.info = gt;
    }
    _e();
    const Y = new jf(y, P);
    this.xr = Y, this.getContext = function() {
      return P;
    }, this.getContextAttributes = function() {
      return P.getContextAttributes();
    }, this.forceContextLoss = function() {
      const S = Qe.get("WEBGL_lose_context");
      S && S.loseContext();
    }, this.forceContextRestore = function() {
      const S = Qe.get("WEBGL_lose_context");
      S && S.restoreContext();
    }, this.getPixelRatio = function() {
      return oe;
    }, this.setPixelRatio = function(S) {
      S !== void 0 && (oe = S, this.setSize(te, W, !1));
    }, this.getSize = function(S) {
      return S.set(te, W);
    }, this.setSize = function(S, N, H = !0) {
      if (Y.isPresenting) {
        console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");
        return;
      }
      te = S, W = N, t.width = Math.floor(S * oe), t.height = Math.floor(N * oe), H === !0 && (t.style.width = S + "px", t.style.height = N + "px"), this.setViewport(0, 0, S, N);
    }, this.getDrawingBufferSize = function(S) {
      return S.set(te * oe, W * oe).floor();
    }, this.setDrawingBufferSize = function(S, N, H) {
      te = S, W = N, oe = H, t.width = Math.floor(S * H), t.height = Math.floor(N * H), this.setViewport(0, 0, S, N);
    }, this.getCurrentViewport = function(S) {
      return S.copy(x);
    }, this.getViewport = function(S) {
      return S.copy(fe);
    }, this.setViewport = function(S, N, H, V) {
      S.isVector4 ? fe.set(S.x, S.y, S.z, S.w) : fe.set(S, N, H, V), Be.viewport(x.copy(fe).multiplyScalar(oe).round());
    }, this.getScissor = function(S) {
      return S.copy(Ae);
    }, this.setScissor = function(S, N, H, V) {
      S.isVector4 ? Ae.set(S.x, S.y, S.z, S.w) : Ae.set(S, N, H, V), Be.scissor(T.copy(Ae).multiplyScalar(oe).round());
    }, this.getScissorTest = function() {
      return at;
    }, this.setScissorTest = function(S) {
      Be.setScissorTest(at = S);
    }, this.setOpaqueSort = function(S) {
      K = S;
    }, this.setTransparentSort = function(S) {
      ge = S;
    }, this.getClearColor = function(S) {
      return S.copy(De.getClearColor());
    }, this.setClearColor = function() {
      De.setClearColor.apply(De, arguments);
    }, this.getClearAlpha = function() {
      return De.getClearAlpha();
    }, this.setClearAlpha = function() {
      De.setClearAlpha.apply(De, arguments);
    }, this.clear = function(S = !0, N = !0, H = !0) {
      let V = 0;
      if (S) {
        let B = !1;
        if (R !== null) {
          const se = R.texture.format;
          B = se === 1033 || se === 1031 || se === 1029;
        }
        if (B) {
          const se = R.texture.type, pe = se === 1009 || se === 1014 || se === 1012 || se === 1020 || se === 1017 || se === 1018, Se = De.getClearColor(), Te = De.getClearAlpha(), Fe = Se.r, Oe = Se.g, we = Se.b;
          pe ? (f[0] = Fe, f[1] = Oe, f[2] = we, f[3] = Te, P.clearBufferuiv(P.COLOR, 0, f)) : (g[0] = Fe, g[1] = Oe, g[2] = we, g[3] = Te, P.clearBufferiv(P.COLOR, 0, g));
        } else
          V |= P.COLOR_BUFFER_BIT;
      }
      N && (V |= P.DEPTH_BUFFER_BIT, P.clearDepth(this.capabilities.reverseDepthBuffer ? 0 : 1)), H && (V |= P.STENCIL_BUFFER_BIT, this.state.buffers.stencil.setMask(4294967295)), P.clear(V);
    }, this.clearColor = function() {
      this.clear(!0, !1, !1);
    }, this.clearDepth = function() {
      this.clear(!1, !0, !1);
    }, this.clearStencil = function() {
      this.clear(!1, !1, !0);
    }, this.dispose = function() {
      t.removeEventListener("webglcontextlost", ee, !1), t.removeEventListener("webglcontextrestored", le, !1), t.removeEventListener("webglcontextcreationerror", ue, !1), de.dispose(), rt.dispose(), ze.dispose(), v.dispose(), G.dispose(), Z.dispose(), ft.dispose(), U.dispose(), be.dispose(), Y.dispose(), Y.removeEventListener("sessionstart", qn), Y.removeEventListener("sessionend", Vi), An.stop();
    };
    function ee(S) {
      S.preventDefault(), console.log("THREE.WebGLRenderer: Context Lost."), A = !0;
    }
    function le() {
      console.log("THREE.WebGLRenderer: Context Restored."), A = !1;
      const S = gt.autoReset, N = ye.enabled, H = ye.autoUpdate, V = ye.needsUpdate, B = ye.type;
      _e(), gt.autoReset = S, ye.enabled = N, ye.autoUpdate = H, ye.needsUpdate = V, ye.type = B;
    }
    function ue(S) {
      console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ", S.statusMessage);
    }
    function et(S) {
      const N = S.target;
      N.removeEventListener("dispose", et), Tt(N);
    }
    function Tt(S) {
      Ot(S), ze.remove(S);
    }
    function Ot(S) {
      const N = ze.get(S).programs;
      N !== void 0 && (N.forEach(function(H) {
        be.releaseProgram(H);
      }), S.isShaderMaterial && be.releaseShaderCache(S));
    }
    this.renderBufferDirect = function(S, N, H, V, B, se) {
      N === null && (N = Ce);
      const pe = B.isMesh && B.matrixWorld.determinant() < 0, Se = ji(S, N, H, V, B);
      Be.setMaterial(V, pe);
      let Te = H.index, Fe = 1;
      if (V.wireframe === !0) {
        if (Te = ne.getWireframeAttribute(H), Te === void 0) return;
        Fe = 2;
      }
      const Oe = H.drawRange, we = H.attributes.position;
      let ht = Oe.start * Fe, _t = (Oe.start + Oe.count) * Fe;
      se !== null && (ht = Math.max(ht, se.start * Fe), _t = Math.min(_t, (se.start + se.count) * Fe)), Te !== null ? (ht = Math.max(ht, 0), _t = Math.min(_t, Te.count)) : we != null && (ht = Math.max(ht, 0), _t = Math.min(_t, we.count));
      const vt = _t - ht;
      if (vt < 0 || vt === 1 / 0) return;
      ft.setup(B, V, Se, H, Te);
      let kt, Ye = ve;
      if (Te !== null && (kt = J.get(Te), Ye = je, Ye.setIndex(kt)), B.isMesh)
        V.wireframe === !0 ? (Be.setLineWidth(V.wireframeLinewidth * z()), Ye.setMode(P.LINES)) : Ye.setMode(P.TRIANGLES);
      else if (B.isLine) {
        let xe = V.linewidth;
        xe === void 0 && (xe = 1), Be.setLineWidth(xe * z()), B.isLineSegments ? Ye.setMode(P.LINES) : B.isLineLoop ? Ye.setMode(P.LINE_LOOP) : Ye.setMode(P.LINE_STRIP);
      } else B.isPoints ? Ye.setMode(P.POINTS) : B.isSprite && Ye.setMode(P.TRIANGLES);
      if (B.isBatchedMesh)
        if (B._multiDrawInstances !== null)
          Ye.renderMultiDrawInstances(B._multiDrawStarts, B._multiDrawCounts, B._multiDrawCount, B._multiDrawInstances);
        else if (Qe.get("WEBGL_multi_draw"))
          Ye.renderMultiDraw(B._multiDrawStarts, B._multiDrawCounts, B._multiDrawCount);
        else {
          const xe = B._multiDrawStarts, xt = B._multiDrawCounts, nt = B._multiDrawCount, Yt = Te ? J.get(Te).bytesPerElement : 1, Jt = ze.get(V).currentProgram.getUniforms();
          for (let zt = 0; zt < nt; zt++)
            Jt.setValue(P, "_gl_DrawID", zt), Ye.render(xe[zt] / Yt, xt[zt]);
        }
      else if (B.isInstancedMesh)
        Ye.renderInstances(ht, vt, B.count);
      else if (H.isInstancedBufferGeometry) {
        const xe = H._maxInstanceCount !== void 0 ? H._maxInstanceCount : 1 / 0, xt = Math.min(H.instanceCount, xe);
        Ye.renderInstances(ht, vt, xt);
      } else
        Ye.render(ht, vt);
    };
    function ot(S, N, H) {
      S.transparent === !0 && S.side === 2 && S.forceSinglePass === !1 ? (S.side = 1, S.needsUpdate = !0, li(S, N, H), S.side = 0, S.needsUpdate = !0, li(S, N, H), S.side = 2) : li(S, N, H);
    }
    this.compile = function(S, N, H = null) {
      H === null && (H = S), m = rt.get(H), m.init(N), E.push(m), H.traverseVisible(function(B) {
        B.isLight && B.layers.test(N.layers) && (m.pushLight(B), B.castShadow && m.pushShadow(B));
      }), S !== H && S.traverseVisible(function(B) {
        B.isLight && B.layers.test(N.layers) && (m.pushLight(B), B.castShadow && m.pushShadow(B));
      }), m.setupLights();
      const V = /* @__PURE__ */ new Set();
      return S.traverse(function(B) {
        if (!(B.isMesh || B.isPoints || B.isLine || B.isSprite))
          return;
        const se = B.material;
        if (se)
          if (Array.isArray(se))
            for (let pe = 0; pe < se.length; pe++) {
              const Se = se[pe];
              ot(Se, H, B), V.add(Se);
            }
          else
            ot(se, H, B), V.add(se);
      }), E.pop(), m = null, V;
    }, this.compileAsync = function(S, N, H = null) {
      const V = this.compile(S, N, H);
      return new Promise((B) => {
        function se() {
          if (V.forEach(function(pe) {
            ze.get(pe).currentProgram.isReady() && V.delete(pe);
          }), V.size === 0) {
            B(S);
            return;
          }
          setTimeout(se, 10);
        }
        Qe.get("KHR_parallel_shader_compile") !== null ? se() : setTimeout(se, 10);
      });
    };
    let Ct = null;
    function hn(S) {
      Ct && Ct(S);
    }
    function qn() {
      An.stop();
    }
    function Vi() {
      An.start();
    }
    const An = new Ko();
    An.setAnimationLoop(hn), typeof self < "u" && An.setContext(self), this.setAnimationLoop = function(S) {
      Ct = S, Y.setAnimationLoop(S), S === null ? An.stop() : An.start();
    }, Y.addEventListener("sessionstart", qn), Y.addEventListener("sessionend", Vi), this.render = function(S, N) {
      if (N !== void 0 && N.isCamera !== !0) {
        console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");
        return;
      }
      if (A === !0) return;
      if (S.matrixWorldAutoUpdate === !0 && S.updateMatrixWorld(), N.parent === null && N.matrixWorldAutoUpdate === !0 && N.updateMatrixWorld(), Y.enabled === !0 && Y.isPresenting === !0 && (Y.cameraAutoUpdate === !0 && Y.updateCamera(N), N = Y.getCamera()), S.isScene === !0 && S.onBeforeRender(y, S, N, R), m = rt.get(S, E.length), m.init(N), E.push(m), Me.multiplyMatrices(N.projectionMatrix, N.matrixWorldInverse), lt.setFromProjectionMatrix(Me), ie = this.localClippingEnabled, $ = re.init(this.clippingPlanes, ie), _ = de.get(S, p.length), _.init(), p.push(_), Y.enabled === !0 && Y.isPresenting === !0) {
        const se = y.xr.getDepthSensingMesh();
        se !== null && Wi(se, N, -1 / 0, y.sortObjects);
      }
      Wi(S, N, 0, y.sortObjects), _.finish(), y.sortObjects === !0 && _.sort(K, ge), Le = Y.enabled === !1 || Y.isPresenting === !1 || Y.hasDepthSensing() === !1, Le && De.addToRenderList(_, S), this.info.render.frame++, $ === !0 && re.beginShadows();
      const H = m.state.shadowsArray;
      ye.render(H, S, N), $ === !0 && re.endShadows(), this.info.autoReset === !0 && this.info.reset();
      const V = _.opaque, B = _.transmissive;
      if (m.setupLights(), N.isArrayCamera) {
        const se = N.cameras;
        if (B.length > 0)
          for (let pe = 0, Se = se.length; pe < Se; pe++) {
            const Te = se[pe];
            ai(V, B, S, Te);
          }
        Le && De.render(S);
        for (let pe = 0, Se = se.length; pe < Se; pe++) {
          const Te = se[pe];
          ds(_, S, Te, Te.viewport);
        }
      } else
        B.length > 0 && ai(V, B, S, N), Le && De.render(S), ds(_, S, N);
      R !== null && (b.updateMultisampleRenderTarget(R), b.updateRenderTargetMipmap(R)), S.isScene === !0 && S.onAfterRender(y, S, N), ft.resetDefaultState(), k = -1, Q = null, E.pop(), E.length > 0 ? (m = E[E.length - 1], $ === !0 && re.setGlobalState(y.clippingPlanes, m.state.camera)) : m = null, p.pop(), p.length > 0 ? _ = p[p.length - 1] : _ = null;
    };
    function Wi(S, N, H, V) {
      if (S.visible === !1) return;
      if (S.layers.test(N.layers)) {
        if (S.isGroup)
          H = S.renderOrder;
        else if (S.isLOD)
          S.autoUpdate === !0 && S.update(N);
        else if (S.isLight)
          m.pushLight(S), S.castShadow && m.pushShadow(S);
        else if (S.isSprite) {
          if (!S.frustumCulled || lt.intersectsSprite(S)) {
            V && Ue.setFromMatrixPosition(S.matrixWorld).applyMatrix4(Me);
            const pe = Z.update(S), Se = S.material;
            Se.visible && _.push(S, pe, Se, H, Ue.z, null);
          }
        } else if ((S.isMesh || S.isLine || S.isPoints) && (!S.frustumCulled || lt.intersectsObject(S))) {
          const pe = Z.update(S), Se = S.material;
          if (V && (S.boundingSphere !== void 0 ? (S.boundingSphere === null && S.computeBoundingSphere(), Ue.copy(S.boundingSphere.center)) : (pe.boundingSphere === null && pe.computeBoundingSphere(), Ue.copy(pe.boundingSphere.center)), Ue.applyMatrix4(S.matrixWorld).applyMatrix4(Me)), Array.isArray(Se)) {
            const Te = pe.groups;
            for (let Fe = 0, Oe = Te.length; Fe < Oe; Fe++) {
              const we = Te[Fe], ht = Se[we.materialIndex];
              ht && ht.visible && _.push(S, pe, ht, H, Ue.z, we);
            }
          } else Se.visible && _.push(S, pe, Se, H, Ue.z, null);
        }
      }
      const se = S.children;
      for (let pe = 0, Se = se.length; pe < Se; pe++)
        Wi(se[pe], N, H, V);
    }
    function ds(S, N, H, V) {
      const B = S.opaque, se = S.transmissive, pe = S.transparent;
      m.setupLightsView(H), $ === !0 && re.setGlobalState(y.clippingPlanes, H), V && Be.viewport(x.copy(V)), B.length > 0 && oi(B, N, H), se.length > 0 && oi(se, N, H), pe.length > 0 && oi(pe, N, H), Be.buffers.depth.setTest(!0), Be.buffers.depth.setMask(!0), Be.buffers.color.setMask(!0), Be.setPolygonOffset(!1);
    }
    function ai(S, N, H, V) {
      if ((H.isScene === !0 ? H.overrideMaterial : null) !== null)
        return;
      m.state.transmissionRenderTarget[V.id] === void 0 && (m.state.transmissionRenderTarget[V.id] = new si(1, 1, {
        generateMipmaps: !0,
        type: Qe.has("EXT_color_buffer_half_float") || Qe.has("EXT_color_buffer_float") ? 1016 : 1009,
        minFilter: 1008,
        samples: 4,
        stencilBuffer: r,
        resolveDepthBuffer: !1,
        resolveStencilBuffer: !1,
        colorSpace: it.workingColorSpace
      }));
      const se = m.state.transmissionRenderTarget[V.id], pe = V.viewport || x;
      se.setSize(pe.z, pe.w);
      const Se = y.getRenderTarget();
      y.setRenderTarget(se), y.getClearColor(X), j = y.getClearAlpha(), j < 1 && y.setClearColor(16777215, 0.5), y.clear(), Le && De.render(H);
      const Te = y.toneMapping;
      y.toneMapping = 0;
      const Fe = V.viewport;
      if (V.viewport !== void 0 && (V.viewport = void 0), m.setupLightsView(V), $ === !0 && re.setGlobalState(y.clippingPlanes, V), oi(S, H, V), b.updateMultisampleRenderTarget(se), b.updateRenderTargetMipmap(se), Qe.has("WEBGL_multisampled_render_to_texture") === !1) {
        let Oe = !1;
        for (let we = 0, ht = N.length; we < ht; we++) {
          const _t = N[we], vt = _t.object, kt = _t.geometry, Ye = _t.material, xe = _t.group;
          if (Ye.side === 2 && vt.layers.test(V.layers)) {
            const xt = Ye.side;
            Ye.side = 1, Ye.needsUpdate = !0, ci(vt, H, V, kt, Ye, xe), Ye.side = xt, Ye.needsUpdate = !0, Oe = !0;
          }
        }
        Oe === !0 && (b.updateMultisampleRenderTarget(se), b.updateRenderTargetMipmap(se));
      }
      y.setRenderTarget(Se), y.setClearColor(X, j), Fe !== void 0 && (V.viewport = Fe), y.toneMapping = Te;
    }
    function oi(S, N, H) {
      const V = N.isScene === !0 ? N.overrideMaterial : null;
      for (let B = 0, se = S.length; B < se; B++) {
        const pe = S[B], Se = pe.object, Te = pe.geometry, Fe = V === null ? pe.material : V, Oe = pe.group;
        Se.layers.test(H.layers) && ci(Se, N, H, Te, Fe, Oe);
      }
    }
    function ci(S, N, H, V, B, se) {
      S.onBeforeRender(y, N, H, V, B, se), S.modelViewMatrix.multiplyMatrices(H.matrixWorldInverse, S.matrixWorld), S.normalMatrix.getNormalMatrix(S.modelViewMatrix), B.onBeforeRender(y, N, H, V, S, se), B.transparent === !0 && B.side === 2 && B.forceSinglePass === !1 ? (B.side = 1, B.needsUpdate = !0, y.renderBufferDirect(H, N, V, B, S, se), B.side = 0, B.needsUpdate = !0, y.renderBufferDirect(H, N, V, B, S, se), B.side = 2) : y.renderBufferDirect(H, N, V, B, S, se), S.onAfterRender(y, N, H, V, B, se);
    }
    function li(S, N, H) {
      N.isScene !== !0 && (N = Ce);
      const V = ze.get(S), B = m.state.lights, se = m.state.shadowsArray, pe = B.state.version, Se = be.getParameters(S, B.state, se, N, H), Te = be.getProgramCacheKey(Se);
      let Fe = V.programs;
      V.environment = S.isMeshStandardMaterial ? N.environment : null, V.fog = N.fog, V.envMap = (S.isMeshStandardMaterial ? G : v).get(S.envMap || V.environment), V.envMapRotation = V.environment !== null && S.envMap === null ? N.environmentRotation : S.envMapRotation, Fe === void 0 && (S.addEventListener("dispose", et), Fe = /* @__PURE__ */ new Map(), V.programs = Fe);
      let Oe = Fe.get(Te);
      if (Oe !== void 0) {
        if (V.currentProgram === Oe && V.lightsStateVersion === pe)
          return qi(S, Se), Oe;
      } else
        Se.uniforms = be.getUniforms(S), S.onBeforeCompile(Se, y), Oe = be.acquireProgram(Se, Te), Fe.set(Te, Oe), V.uniforms = Se.uniforms;
      const we = V.uniforms;
      return (!S.isShaderMaterial && !S.isRawShaderMaterial || S.clipping === !0) && (we.clippingPlanes = re.uniform), qi(S, Se), V.needsLights = hi(S), V.lightsStateVersion = pe, V.needsLights && (we.ambientLightColor.value = B.state.ambient, we.lightProbe.value = B.state.probe, we.directionalLights.value = B.state.directional, we.directionalLightShadows.value = B.state.directionalShadow, we.spotLights.value = B.state.spot, we.spotLightShadows.value = B.state.spotShadow, we.rectAreaLights.value = B.state.rectArea, we.ltc_1.value = B.state.rectAreaLTC1, we.ltc_2.value = B.state.rectAreaLTC2, we.pointLights.value = B.state.point, we.pointLightShadows.value = B.state.pointShadow, we.hemisphereLights.value = B.state.hemi, we.directionalShadowMap.value = B.state.directionalShadowMap, we.directionalShadowMatrix.value = B.state.directionalShadowMatrix, we.spotShadowMap.value = B.state.spotShadowMap, we.spotLightMatrix.value = B.state.spotLightMatrix, we.spotLightMap.value = B.state.spotLightMap, we.pointShadowMap.value = B.state.pointShadowMap, we.pointShadowMatrix.value = B.state.pointShadowMatrix), V.currentProgram = Oe, V.uniformsList = null, Oe;
    }
    function Xi(S) {
      if (S.uniformsList === null) {
        const N = S.currentProgram.getUniforms();
        S.uniformsList = Ys.seqWithValue(N.seq, S.uniforms);
      }
      return S.uniformsList;
    }
    function qi(S, N) {
      const H = ze.get(S);
      H.outputColorSpace = N.outputColorSpace, H.batching = N.batching, H.batchingColor = N.batchingColor, H.instancing = N.instancing, H.instancingColor = N.instancingColor, H.instancingMorph = N.instancingMorph, H.skinning = N.skinning, H.morphTargets = N.morphTargets, H.morphNormals = N.morphNormals, H.morphColors = N.morphColors, H.morphTargetsCount = N.morphTargetsCount, H.numClippingPlanes = N.numClippingPlanes, H.numIntersection = N.numClipIntersection, H.vertexAlphas = N.vertexAlphas, H.vertexTangents = N.vertexTangents, H.toneMapping = N.toneMapping;
    }
    function ji(S, N, H, V, B) {
      N.isScene !== !0 && (N = Ce), b.resetTextureUnits();
      const se = N.fog, pe = V.isMeshStandardMaterial ? N.environment : null, Se = R === null ? y.outputColorSpace : R.isXRRenderTarget === !0 ? R.texture.colorSpace : Bt, Te = (V.isMeshStandardMaterial ? G : v).get(V.envMap || pe), Fe = V.vertexColors === !0 && !!H.attributes.color && H.attributes.color.itemSize === 4, Oe = !!H.attributes.tangent && (!!V.normalMap || V.anisotropy > 0), we = !!H.morphAttributes.position, ht = !!H.morphAttributes.normal, _t = !!H.morphAttributes.color;
      let vt = 0;
      V.toneMapped && (R === null || R.isXRRenderTarget === !0) && (vt = y.toneMapping);
      const kt = H.morphAttributes.position || H.morphAttributes.normal || H.morphAttributes.color, Ye = kt !== void 0 ? kt.length : 0, xe = ze.get(V), xt = m.state.lights;
      if ($ === !0 && (ie === !0 || S !== Q)) {
        const Kt = S === Q && V.id === k;
        re.setState(V, S, Kt);
      }
      let nt = !1;
      V.version === xe.__version ? (xe.needsLights && xe.lightsStateVersion !== xt.state.version || xe.outputColorSpace !== Se || B.isBatchedMesh && xe.batching === !1 || !B.isBatchedMesh && xe.batching === !0 || B.isBatchedMesh && xe.batchingColor === !0 && B.colorTexture === null || B.isBatchedMesh && xe.batchingColor === !1 && B.colorTexture !== null || B.isInstancedMesh && xe.instancing === !1 || !B.isInstancedMesh && xe.instancing === !0 || B.isSkinnedMesh && xe.skinning === !1 || !B.isSkinnedMesh && xe.skinning === !0 || B.isInstancedMesh && xe.instancingColor === !0 && B.instanceColor === null || B.isInstancedMesh && xe.instancingColor === !1 && B.instanceColor !== null || B.isInstancedMesh && xe.instancingMorph === !0 && B.morphTexture === null || B.isInstancedMesh && xe.instancingMorph === !1 && B.morphTexture !== null || xe.envMap !== Te || V.fog === !0 && xe.fog !== se || xe.numClippingPlanes !== void 0 && (xe.numClippingPlanes !== re.numPlanes || xe.numIntersection !== re.numIntersection) || xe.vertexAlphas !== Fe || xe.vertexTangents !== Oe || xe.morphTargets !== we || xe.morphNormals !== ht || xe.morphColors !== _t || xe.toneMapping !== vt || xe.morphTargetsCount !== Ye) && (nt = !0) : (nt = !0, xe.__version = V.version);
      let Yt = xe.currentProgram;
      nt === !0 && (Yt = li(V, N, B));
      let Jt = !1, zt = !1, ui = !1;
      const Et = Yt.getUniforms(), un = xe.uniforms;
      if (Be.useProgram(Yt.program) && (Jt = !0, zt = !0, ui = !0), V.id !== k && (k = V.id, zt = !0), Jt || Q !== S) {
        st.reverseDepthBuffer ? (Ee.copy(S.projectionMatrix), kc(Ee), zc(Ee), Et.setValue(P, "projectionMatrix", Ee)) : Et.setValue(P, "projectionMatrix", S.projectionMatrix), Et.setValue(P, "viewMatrix", S.matrixWorldInverse);
        const Kt = Et.map.cameraPosition;
        Kt !== void 0 && Kt.setValue(P, He.setFromMatrixPosition(S.matrixWorld)), st.logarithmicDepthBuffer && Et.setValue(
          P,
          "logDepthBufFC",
          2 / (Math.log(S.far + 1) / Math.LN2)
        ), (V.isMeshPhongMaterial || V.isMeshToonMaterial || V.isMeshLambertMaterial || V.isMeshBasicMaterial || V.isMeshStandardMaterial || V.isShaderMaterial) && Et.setValue(P, "isOrthographic", S.isOrthographicCamera === !0), Q !== S && (Q = S, zt = !0, ui = !0);
      }
      if (B.isSkinnedMesh) {
        Et.setOptional(P, B, "bindMatrix"), Et.setOptional(P, B, "bindMatrixInverse");
        const Kt = B.skeleton;
        Kt && (Kt.boneTexture === null && Kt.computeBoneTexture(), Et.setValue(P, "boneTexture", Kt.boneTexture, b));
      }
      B.isBatchedMesh && (Et.setOptional(P, B, "batchingTexture"), Et.setValue(P, "batchingTexture", B._matricesTexture, b), Et.setOptional(P, B, "batchingIdTexture"), Et.setValue(P, "batchingIdTexture", B._indirectTexture, b), Et.setOptional(P, B, "batchingColorTexture"), B._colorsTexture !== null && Et.setValue(P, "batchingColorTexture", B._colorsTexture, b));
      const Yi = H.morphAttributes;
      if ((Yi.position !== void 0 || Yi.normal !== void 0 || Yi.color !== void 0) && Ne.update(B, H, Yt), (zt || xe.receiveShadow !== B.receiveShadow) && (xe.receiveShadow = B.receiveShadow, Et.setValue(P, "receiveShadow", B.receiveShadow)), V.isMeshGouraudMaterial && V.envMap !== null && (un.envMap.value = Te, un.flipEnvMap.value = Te.isCubeTexture && Te.isRenderTargetTexture === !1 ? -1 : 1), V.isMeshStandardMaterial && V.envMap === null && N.environment !== null && (un.envMapIntensity.value = N.environmentIntensity), zt && (Et.setValue(P, "toneMappingExposure", y.toneMappingExposure), xe.needsLights && fs(un, ui), se && V.fog === !0 && ce.refreshFogUniforms(un, se), ce.refreshMaterialUniforms(un, V, oe, W, m.state.transmissionRenderTarget[S.id]), Ys.upload(P, Xi(xe), un, b)), V.isShaderMaterial && V.uniformsNeedUpdate === !0 && (Ys.upload(P, Xi(xe), un, b), V.uniformsNeedUpdate = !1), V.isSpriteMaterial && Et.setValue(P, "center", B.center), Et.setValue(P, "modelViewMatrix", B.modelViewMatrix), Et.setValue(P, "normalMatrix", B.normalMatrix), Et.setValue(P, "modelMatrix", B.matrixWorld), V.isShaderMaterial || V.isRawShaderMaterial) {
        const Kt = V.uniformsGroups;
        for (let Qt = 0, ar = Kt.length; Qt < ar; Qt++) {
          const ps = Kt[Qt];
          U.update(ps, Yt), U.bind(ps, Yt);
        }
      }
      return Yt;
    }
    function fs(S, N) {
      S.ambientLightColor.needsUpdate = N, S.lightProbe.needsUpdate = N, S.directionalLights.needsUpdate = N, S.directionalLightShadows.needsUpdate = N, S.pointLights.needsUpdate = N, S.pointLightShadows.needsUpdate = N, S.spotLights.needsUpdate = N, S.spotLightShadows.needsUpdate = N, S.rectAreaLights.needsUpdate = N, S.hemisphereLights.needsUpdate = N;
    }
    function hi(S) {
      return S.isMeshLambertMaterial || S.isMeshToonMaterial || S.isMeshPhongMaterial || S.isMeshStandardMaterial || S.isShadowMaterial || S.isShaderMaterial && S.lights === !0;
    }
    this.getActiveCubeFace = function() {
      return O;
    }, this.getActiveMipmapLevel = function() {
      return w;
    }, this.getRenderTarget = function() {
      return R;
    }, this.setRenderTargetTextures = function(S, N, H) {
      ze.get(S.texture).__webglTexture = N, ze.get(S.depthTexture).__webglTexture = H;
      const V = ze.get(S);
      V.__hasExternalTextures = !0, V.__autoAllocateDepthBuffer = H === void 0, V.__autoAllocateDepthBuffer || Qe.has("WEBGL_multisampled_render_to_texture") === !0 && (console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"), V.__useRenderToTexture = !1);
    }, this.setRenderTargetFramebuffer = function(S, N) {
      const H = ze.get(S);
      H.__webglFramebuffer = N, H.__useDefaultFramebuffer = N === void 0;
    }, this.setRenderTarget = function(S, N = 0, H = 0) {
      R = S, O = N, w = H;
      let V = !0, B = null, se = !1, pe = !1;
      if (S) {
        const Te = ze.get(S);
        if (Te.__useDefaultFramebuffer !== void 0)
          Be.bindFramebuffer(P.FRAMEBUFFER, null), V = !1;
        else if (Te.__webglFramebuffer === void 0)
          b.setupRenderTarget(S);
        else if (Te.__hasExternalTextures)
          b.rebindTextures(S, ze.get(S.texture).__webglTexture, ze.get(S.depthTexture).__webglTexture);
        else if (S.depthBuffer) {
          const we = S.depthTexture;
          if (Te.__boundDepthTexture !== we) {
            if (we !== null && ze.has(we) && (S.width !== we.image.width || S.height !== we.image.height))
              throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");
            b.setupDepthRenderbuffer(S);
          }
        }
        const Fe = S.texture;
        (Fe.isData3DTexture || Fe.isDataArrayTexture || Fe.isCompressedArrayTexture) && (pe = !0);
        const Oe = ze.get(S).__webglFramebuffer;
        S.isWebGLCubeRenderTarget ? (Array.isArray(Oe[N]) ? B = Oe[N][H] : B = Oe[N], se = !0) : S.samples > 0 && b.useMultisampledRTT(S) === !1 ? B = ze.get(S).__webglMultisampledFramebuffer : Array.isArray(Oe) ? B = Oe[H] : B = Oe, x.copy(S.viewport), T.copy(S.scissor), q = S.scissorTest;
      } else
        x.copy(fe).multiplyScalar(oe).floor(), T.copy(Ae).multiplyScalar(oe).floor(), q = at;
      if (Be.bindFramebuffer(P.FRAMEBUFFER, B) && V && Be.drawBuffers(S, B), Be.viewport(x), Be.scissor(T), Be.setScissorTest(q), se) {
        const Te = ze.get(S.texture);
        P.framebufferTexture2D(P.FRAMEBUFFER, P.COLOR_ATTACHMENT0, P.TEXTURE_CUBE_MAP_POSITIVE_X + N, Te.__webglTexture, H);
      } else if (pe) {
        const Te = ze.get(S.texture), Fe = N || 0;
        P.framebufferTextureLayer(P.FRAMEBUFFER, P.COLOR_ATTACHMENT0, Te.__webglTexture, H || 0, Fe);
      }
      k = -1;
    }, this.readRenderTargetPixels = function(S, N, H, V, B, se, pe) {
      if (!(S && S.isWebGLRenderTarget)) {
        console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
        return;
      }
      let Se = ze.get(S).__webglFramebuffer;
      if (S.isWebGLCubeRenderTarget && pe !== void 0 && (Se = Se[pe]), Se) {
        Be.bindFramebuffer(P.FRAMEBUFFER, Se);
        try {
          const Te = S.texture, Fe = Te.format, Oe = Te.type;
          if (!st.textureFormatReadable(Fe)) {
            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");
            return;
          }
          if (!st.textureTypeReadable(Oe)) {
            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");
            return;
          }
          N >= 0 && N <= S.width - V && H >= 0 && H <= S.height - B && P.readPixels(N, H, V, B, ke.convert(Fe), ke.convert(Oe), se);
        } finally {
          const Te = R !== null ? ze.get(R).__webglFramebuffer : null;
          Be.bindFramebuffer(P.FRAMEBUFFER, Te);
        }
      }
    }, this.readRenderTargetPixelsAsync = async function(S, N, H, V, B, se, pe) {
      if (!(S && S.isWebGLRenderTarget))
        throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
      let Se = ze.get(S).__webglFramebuffer;
      if (S.isWebGLCubeRenderTarget && pe !== void 0 && (Se = Se[pe]), Se) {
        const Te = S.texture, Fe = Te.format, Oe = Te.type;
        if (!st.textureFormatReadable(Fe))
          throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");
        if (!st.textureTypeReadable(Oe))
          throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");
        if (N >= 0 && N <= S.width - V && H >= 0 && H <= S.height - B) {
          Be.bindFramebuffer(P.FRAMEBUFFER, Se);
          const we = P.createBuffer();
          P.bindBuffer(P.PIXEL_PACK_BUFFER, we), P.bufferData(P.PIXEL_PACK_BUFFER, se.byteLength, P.STREAM_READ), P.readPixels(N, H, V, B, ke.convert(Fe), ke.convert(Oe), 0);
          const ht = R !== null ? ze.get(R).__webglFramebuffer : null;
          Be.bindFramebuffer(P.FRAMEBUFFER, ht);
          const _t = P.fenceSync(P.SYNC_GPU_COMMANDS_COMPLETE, 0);
          return P.flush(), await Oc(P, _t, 4), P.bindBuffer(P.PIXEL_PACK_BUFFER, we), P.getBufferSubData(P.PIXEL_PACK_BUFFER, 0, se), P.deleteBuffer(we), P.deleteSync(_t), se;
        } else
          throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.");
      }
    }, this.copyFramebufferToTexture = function(S, N = null, H = 0) {
      S.isTexture !== !0 && (js("WebGLRenderer: copyFramebufferToTexture function signature has changed."), N = arguments[0] || null, S = arguments[1]);
      const V = Math.pow(2, -H), B = Math.floor(S.image.width * V), se = Math.floor(S.image.height * V), pe = N !== null ? N.x : 0, Se = N !== null ? N.y : 0;
      b.setTexture2D(S, 0), P.copyTexSubImage2D(P.TEXTURE_2D, H, 0, 0, pe, Se, B, se), Be.unbindTexture();
    }, this.copyTextureToTexture = function(S, N, H = null, V = null, B = 0) {
      S.isTexture !== !0 && (js("WebGLRenderer: copyTextureToTexture function signature has changed."), V = arguments[0] || null, S = arguments[1], N = arguments[2], B = arguments[3] || 0, H = null);
      let se, pe, Se, Te, Fe, Oe;
      H !== null ? (se = H.max.x - H.min.x, pe = H.max.y - H.min.y, Se = H.min.x, Te = H.min.y) : (se = S.image.width, pe = S.image.height, Se = 0, Te = 0), V !== null ? (Fe = V.x, Oe = V.y) : (Fe = 0, Oe = 0);
      const we = ke.convert(N.format), ht = ke.convert(N.type);
      b.setTexture2D(N, 0), P.pixelStorei(P.UNPACK_FLIP_Y_WEBGL, N.flipY), P.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL, N.premultiplyAlpha), P.pixelStorei(P.UNPACK_ALIGNMENT, N.unpackAlignment);
      const _t = P.getParameter(P.UNPACK_ROW_LENGTH), vt = P.getParameter(P.UNPACK_IMAGE_HEIGHT), kt = P.getParameter(P.UNPACK_SKIP_PIXELS), Ye = P.getParameter(P.UNPACK_SKIP_ROWS), xe = P.getParameter(P.UNPACK_SKIP_IMAGES), xt = S.isCompressedTexture ? S.mipmaps[B] : S.image;
      P.pixelStorei(P.UNPACK_ROW_LENGTH, xt.width), P.pixelStorei(P.UNPACK_IMAGE_HEIGHT, xt.height), P.pixelStorei(P.UNPACK_SKIP_PIXELS, Se), P.pixelStorei(P.UNPACK_SKIP_ROWS, Te), S.isDataTexture ? P.texSubImage2D(P.TEXTURE_2D, B, Fe, Oe, se, pe, we, ht, xt.data) : S.isCompressedTexture ? P.compressedTexSubImage2D(P.TEXTURE_2D, B, Fe, Oe, xt.width, xt.height, we, xt.data) : P.texSubImage2D(P.TEXTURE_2D, B, Fe, Oe, se, pe, we, ht, xt), P.pixelStorei(P.UNPACK_ROW_LENGTH, _t), P.pixelStorei(P.UNPACK_IMAGE_HEIGHT, vt), P.pixelStorei(P.UNPACK_SKIP_PIXELS, kt), P.pixelStorei(P.UNPACK_SKIP_ROWS, Ye), P.pixelStorei(P.UNPACK_SKIP_IMAGES, xe), B === 0 && N.generateMipmaps && P.generateMipmap(P.TEXTURE_2D), Be.unbindTexture();
    }, this.copyTextureToTexture3D = function(S, N, H = null, V = null, B = 0) {
      S.isTexture !== !0 && (js("WebGLRenderer: copyTextureToTexture3D function signature has changed."), H = arguments[0] || null, V = arguments[1] || null, S = arguments[2], N = arguments[3], B = arguments[4] || 0);
      let se, pe, Se, Te, Fe, Oe, we, ht, _t;
      const vt = S.isCompressedTexture ? S.mipmaps[B] : S.image;
      H !== null ? (se = H.max.x - H.min.x, pe = H.max.y - H.min.y, Se = H.max.z - H.min.z, Te = H.min.x, Fe = H.min.y, Oe = H.min.z) : (se = vt.width, pe = vt.height, Se = vt.depth, Te = 0, Fe = 0, Oe = 0), V !== null ? (we = V.x, ht = V.y, _t = V.z) : (we = 0, ht = 0, _t = 0);
      const kt = ke.convert(N.format), Ye = ke.convert(N.type);
      let xe;
      if (N.isData3DTexture)
        b.setTexture3D(N, 0), xe = P.TEXTURE_3D;
      else if (N.isDataArrayTexture || N.isCompressedArrayTexture)
        b.setTexture2DArray(N, 0), xe = P.TEXTURE_2D_ARRAY;
      else {
        console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");
        return;
      }
      P.pixelStorei(P.UNPACK_FLIP_Y_WEBGL, N.flipY), P.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL, N.premultiplyAlpha), P.pixelStorei(P.UNPACK_ALIGNMENT, N.unpackAlignment);
      const xt = P.getParameter(P.UNPACK_ROW_LENGTH), nt = P.getParameter(P.UNPACK_IMAGE_HEIGHT), Yt = P.getParameter(P.UNPACK_SKIP_PIXELS), Jt = P.getParameter(P.UNPACK_SKIP_ROWS), zt = P.getParameter(P.UNPACK_SKIP_IMAGES);
      P.pixelStorei(P.UNPACK_ROW_LENGTH, vt.width), P.pixelStorei(P.UNPACK_IMAGE_HEIGHT, vt.height), P.pixelStorei(P.UNPACK_SKIP_PIXELS, Te), P.pixelStorei(P.UNPACK_SKIP_ROWS, Fe), P.pixelStorei(P.UNPACK_SKIP_IMAGES, Oe), S.isDataTexture || S.isData3DTexture ? P.texSubImage3D(xe, B, we, ht, _t, se, pe, Se, kt, Ye, vt.data) : N.isCompressedArrayTexture ? P.compressedTexSubImage3D(xe, B, we, ht, _t, se, pe, Se, kt, vt.data) : P.texSubImage3D(xe, B, we, ht, _t, se, pe, Se, kt, Ye, vt), P.pixelStorei(P.UNPACK_ROW_LENGTH, xt), P.pixelStorei(P.UNPACK_IMAGE_HEIGHT, nt), P.pixelStorei(P.UNPACK_SKIP_PIXELS, Yt), P.pixelStorei(P.UNPACK_SKIP_ROWS, Jt), P.pixelStorei(P.UNPACK_SKIP_IMAGES, zt), B === 0 && N.generateMipmaps && P.generateMipmap(xe), Be.unbindTexture();
    }, this.initRenderTarget = function(S) {
      ze.get(S).__webglFramebuffer === void 0 && b.setupRenderTarget(S);
    }, this.initTexture = function(S) {
      S.isCubeTexture ? b.setTextureCube(S, 0) : S.isData3DTexture ? b.setTexture3D(S, 0) : S.isDataArrayTexture || S.isCompressedArrayTexture ? b.setTexture2DArray(S, 0) : b.setTexture2D(S, 0), Be.unbindTexture();
    }, this.resetState = function() {
      O = 0, w = 0, R = null, Be.reset(), ft.reset();
    }, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
  }
  get coordinateSystem() {
    return 2e3;
  }
  get outputColorSpace() {
    return this._outputColorSpace;
  }
  set outputColorSpace(e) {
    this._outputColorSpace = e;
    const t = this.getContext();
    t.drawingBufferColorSpace = e === na ? "display-p3" : "srgb", t.unpackColorSpace = it.workingColorSpace === tr ? "display-p3" : "srgb";
  }
}
class Jf extends St {
  constructor() {
    super(), this.isScene = !0, this.type = "Scene", this.background = null, this.environment = null, this.fog = null, this.backgroundBlurriness = 0, this.backgroundIntensity = 1, this.backgroundRotation = new xn(), this.environmentIntensity = 1, this.environmentRotation = new xn(), this.overrideMaterial = null, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
  }
  copy(e, t) {
    return super.copy(e, t), e.background !== null && (this.background = e.background.clone()), e.environment !== null && (this.environment = e.environment.clone()), e.fog !== null && (this.fog = e.fog.clone()), this.backgroundBlurriness = e.backgroundBlurriness, this.backgroundIntensity = e.backgroundIntensity, this.backgroundRotation.copy(e.backgroundRotation), this.environmentIntensity = e.environmentIntensity, this.environmentRotation.copy(e.environmentRotation), e.overrideMaterial !== null && (this.overrideMaterial = e.overrideMaterial.clone()), this.matrixAutoUpdate = e.matrixAutoUpdate, this;
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return this.fog !== null && (t.object.fog = this.fog.toJSON()), this.backgroundBlurriness > 0 && (t.object.backgroundBlurriness = this.backgroundBlurriness), this.backgroundIntensity !== 1 && (t.object.backgroundIntensity = this.backgroundIntensity), t.object.backgroundRotation = this.backgroundRotation.toArray(), this.environmentIntensity !== 1 && (t.object.environmentIntensity = this.environmentIntensity), t.object.environmentRotation = this.environmentRotation.toArray(), t;
  }
}
class Qf {
  constructor(e, t) {
    this.isInterleavedBuffer = !0, this.array = e, this.stride = t, this.count = e !== void 0 ? e.length / t : 0, this.usage = 35044, this.updateRanges = [], this.version = 0, this.uuid = gn();
  }
  onUploadCallback() {
  }
  set needsUpdate(e) {
    e === !0 && this.version++;
  }
  setUsage(e) {
    return this.usage = e, this;
  }
  addUpdateRange(e, t) {
    this.updateRanges.push({ start: e, count: t });
  }
  clearUpdateRanges() {
    this.updateRanges.length = 0;
  }
  copy(e) {
    return this.array = new e.array.constructor(e.array), this.count = e.count, this.stride = e.stride, this.usage = e.usage, this;
  }
  copyAt(e, t, n) {
    e *= this.stride, n *= t.stride;
    for (let i = 0, r = this.stride; i < r; i++)
      this.array[e + i] = t.array[n + i];
    return this;
  }
  set(e, t = 0) {
    return this.array.set(e, t), this;
  }
  clone(e) {
    e.arrayBuffers === void 0 && (e.arrayBuffers = {}), this.array.buffer._uuid === void 0 && (this.array.buffer._uuid = gn()), e.arrayBuffers[this.array.buffer._uuid] === void 0 && (e.arrayBuffers[this.array.buffer._uuid] = this.array.slice(0).buffer);
    const t = new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]), n = new this.constructor(t, this.stride);
    return n.setUsage(this.usage), n;
  }
  onUpload(e) {
    return this.onUploadCallback = e, this;
  }
  toJSON(e) {
    return e.arrayBuffers === void 0 && (e.arrayBuffers = {}), this.array.buffer._uuid === void 0 && (this.array.buffer._uuid = gn()), e.arrayBuffers[this.array.buffer._uuid] === void 0 && (e.arrayBuffers[this.array.buffer._uuid] = Array.from(new Uint32Array(this.array.buffer))), {
      uuid: this.uuid,
      buffer: this.array.buffer._uuid,
      type: this.array.constructor.name,
      stride: this.stride
    };
  }
}
const Xt = /* @__PURE__ */ new L();
class oa {
  constructor(e, t, n, i = !1) {
    this.isInterleavedBufferAttribute = !0, this.name = "", this.data = e, this.itemSize = t, this.offset = n, this.normalized = i;
  }
  get count() {
    return this.data.count;
  }
  get array() {
    return this.data.array;
  }
  set needsUpdate(e) {
    this.data.needsUpdate = e;
  }
  applyMatrix4(e) {
    for (let t = 0, n = this.data.count; t < n; t++)
      Xt.fromBufferAttribute(this, t), Xt.applyMatrix4(e), this.setXYZ(t, Xt.x, Xt.y, Xt.z);
    return this;
  }
  applyNormalMatrix(e) {
    for (let t = 0, n = this.count; t < n; t++)
      Xt.fromBufferAttribute(this, t), Xt.applyNormalMatrix(e), this.setXYZ(t, Xt.x, Xt.y, Xt.z);
    return this;
  }
  transformDirection(e) {
    for (let t = 0, n = this.count; t < n; t++)
      Xt.fromBufferAttribute(this, t), Xt.transformDirection(e), this.setXYZ(t, Xt.x, Xt.y, Xt.z);
    return this;
  }
  getComponent(e, t) {
    let n = this.array[e * this.data.stride + this.offset + t];
    return this.normalized && (n = mn(n, this.array)), n;
  }
  setComponent(e, t, n) {
    return this.normalized && (n = mt(n, this.array)), this.data.array[e * this.data.stride + this.offset + t] = n, this;
  }
  setX(e, t) {
    return this.normalized && (t = mt(t, this.array)), this.data.array[e * this.data.stride + this.offset] = t, this;
  }
  setY(e, t) {
    return this.normalized && (t = mt(t, this.array)), this.data.array[e * this.data.stride + this.offset + 1] = t, this;
  }
  setZ(e, t) {
    return this.normalized && (t = mt(t, this.array)), this.data.array[e * this.data.stride + this.offset + 2] = t, this;
  }
  setW(e, t) {
    return this.normalized && (t = mt(t, this.array)), this.data.array[e * this.data.stride + this.offset + 3] = t, this;
  }
  getX(e) {
    let t = this.data.array[e * this.data.stride + this.offset];
    return this.normalized && (t = mn(t, this.array)), t;
  }
  getY(e) {
    let t = this.data.array[e * this.data.stride + this.offset + 1];
    return this.normalized && (t = mn(t, this.array)), t;
  }
  getZ(e) {
    let t = this.data.array[e * this.data.stride + this.offset + 2];
    return this.normalized && (t = mn(t, this.array)), t;
  }
  getW(e) {
    let t = this.data.array[e * this.data.stride + this.offset + 3];
    return this.normalized && (t = mn(t, this.array)), t;
  }
  setXY(e, t, n) {
    return e = e * this.data.stride + this.offset, this.normalized && (t = mt(t, this.array), n = mt(n, this.array)), this.data.array[e + 0] = t, this.data.array[e + 1] = n, this;
  }
  setXYZ(e, t, n, i) {
    return e = e * this.data.stride + this.offset, this.normalized && (t = mt(t, this.array), n = mt(n, this.array), i = mt(i, this.array)), this.data.array[e + 0] = t, this.data.array[e + 1] = n, this.data.array[e + 2] = i, this;
  }
  setXYZW(e, t, n, i, r) {
    return e = e * this.data.stride + this.offset, this.normalized && (t = mt(t, this.array), n = mt(n, this.array), i = mt(i, this.array), r = mt(r, this.array)), this.data.array[e + 0] = t, this.data.array[e + 1] = n, this.data.array[e + 2] = i, this.data.array[e + 3] = r, this;
  }
  clone(e) {
    if (e === void 0) {
      console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");
      const t = [];
      for (let n = 0; n < this.count; n++) {
        const i = n * this.data.stride + this.offset;
        for (let r = 0; r < this.itemSize; r++)
          t.push(this.data.array[i + r]);
      }
      return new jt(new this.array.constructor(t), this.itemSize, this.normalized);
    } else
      return e.interleavedBuffers === void 0 && (e.interleavedBuffers = {}), e.interleavedBuffers[this.data.uuid] === void 0 && (e.interleavedBuffers[this.data.uuid] = this.data.clone(e)), new oa(e.interleavedBuffers[this.data.uuid], this.itemSize, this.offset, this.normalized);
  }
  toJSON(e) {
    if (e === void 0) {
      console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");
      const t = [];
      for (let n = 0; n < this.count; n++) {
        const i = n * this.data.stride + this.offset;
        for (let r = 0; r < this.itemSize; r++)
          t.push(this.data.array[i + r]);
      }
      return {
        itemSize: this.itemSize,
        type: this.array.constructor.name,
        array: t,
        normalized: this.normalized
      };
    } else
      return e.interleavedBuffers === void 0 && (e.interleavedBuffers = {}), e.interleavedBuffers[this.data.uuid] === void 0 && (e.interleavedBuffers[this.data.uuid] = this.data.toJSON(e)), {
        isInterleavedBufferAttribute: !0,
        itemSize: this.itemSize,
        data: this.data.uuid,
        offset: this.offset,
        normalized: this.normalized
      };
  }
}
const co = /* @__PURE__ */ new L(), lo = /* @__PURE__ */ new ut(), ho = /* @__PURE__ */ new ut(), ep = /* @__PURE__ */ new L(), uo = /* @__PURE__ */ new qe(), Ns = /* @__PURE__ */ new L(), Fr = /* @__PURE__ */ new Sn(), fo = /* @__PURE__ */ new qe(), Br = /* @__PURE__ */ new hs();
class tp extends We {
  constructor(e, t) {
    super(e, t), this.isSkinnedMesh = !0, this.type = "SkinnedMesh", this.bindMode = xa, this.bindMatrix = new qe(), this.bindMatrixInverse = new qe(), this.boundingBox = null, this.boundingSphere = null;
  }
  computeBoundingBox() {
    const e = this.geometry;
    this.boundingBox === null && (this.boundingBox = new vn()), this.boundingBox.makeEmpty();
    const t = e.getAttribute("position");
    for (let n = 0; n < t.count; n++)
      this.getVertexPosition(n, Ns), this.boundingBox.expandByPoint(Ns);
  }
  computeBoundingSphere() {
    const e = this.geometry;
    this.boundingSphere === null && (this.boundingSphere = new Sn()), this.boundingSphere.makeEmpty();
    const t = e.getAttribute("position");
    for (let n = 0; n < t.count; n++)
      this.getVertexPosition(n, Ns), this.boundingSphere.expandByPoint(Ns);
  }
  copy(e, t) {
    return super.copy(e, t), this.bindMode = e.bindMode, this.bindMatrix.copy(e.bindMatrix), this.bindMatrixInverse.copy(e.bindMatrixInverse), this.skeleton = e.skeleton, e.boundingBox !== null && (this.boundingBox = e.boundingBox.clone()), e.boundingSphere !== null && (this.boundingSphere = e.boundingSphere.clone()), this;
  }
  raycast(e, t) {
    const n = this.material, i = this.matrixWorld;
    n !== void 0 && (this.boundingSphere === null && this.computeBoundingSphere(), Fr.copy(this.boundingSphere), Fr.applyMatrix4(i), e.ray.intersectsSphere(Fr) !== !1 && (fo.copy(i).invert(), Br.copy(e.ray).applyMatrix4(fo), !(this.boundingBox !== null && Br.intersectsBox(this.boundingBox) === !1) && this._computeIntersections(e, t, Br)));
  }
  getVertexPosition(e, t) {
    return super.getVertexPosition(e, t), this.applyBoneTransform(e, t), t;
  }
  bind(e, t) {
    this.skeleton = e, t === void 0 && (this.updateMatrixWorld(!0), this.skeleton.calculateInverses(), t = this.matrixWorld), this.bindMatrix.copy(t), this.bindMatrixInverse.copy(t).invert();
  }
  pose() {
    this.skeleton.pose();
  }
  normalizeSkinWeights() {
    const e = new ut(), t = this.geometry.attributes.skinWeight;
    for (let n = 0, i = t.count; n < i; n++) {
      e.fromBufferAttribute(t, n);
      const r = 1 / e.manhattanLength();
      r !== 1 / 0 ? e.multiplyScalar(r) : e.set(1, 0, 0, 0), t.setXYZW(n, e.x, e.y, e.z, e.w);
    }
  }
  updateMatrixWorld(e) {
    super.updateMatrixWorld(e), this.bindMode === xa ? this.bindMatrixInverse.copy(this.matrixWorld).invert() : this.bindMode === vc ? this.bindMatrixInverse.copy(this.bindMatrix).invert() : console.warn("THREE.SkinnedMesh: Unrecognized bindMode: " + this.bindMode);
  }
  applyBoneTransform(e, t) {
    const n = this.skeleton, i = this.geometry;
    lo.fromBufferAttribute(i.attributes.skinIndex, e), ho.fromBufferAttribute(i.attributes.skinWeight, e), co.copy(t).applyMatrix4(this.bindMatrix), t.set(0, 0, 0);
    for (let r = 0; r < 4; r++) {
      const a = ho.getComponent(r);
      if (a !== 0) {
        const o = lo.getComponent(r);
        uo.multiplyMatrices(n.bones[o].matrixWorld, n.boneInverses[o]), t.addScaledVector(ep.copy(co).applyMatrix4(uo), a);
      }
    }
    return t.applyMatrix4(this.bindMatrixInverse);
  }
}
class tc extends St {
  constructor() {
    super(), this.isBone = !0, this.type = "Bone";
  }
}
class ca extends It {
  constructor(e = null, t = 1, n = 1, i, r, a, o, c, l = 1003, h = 1003, u, d) {
    super(null, a, o, c, l, h, i, r, u, d), this.isDataTexture = !0, this.image = { data: e, width: t, height: n }, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1;
  }
}
const po = /* @__PURE__ */ new qe(), np = /* @__PURE__ */ new qe();
class la {
  constructor(e = [], t = []) {
    this.uuid = gn(), this.bones = e.slice(0), this.boneInverses = t, this.boneMatrices = null, this.boneTexture = null, this.init();
  }
  init() {
    const e = this.bones, t = this.boneInverses;
    if (this.boneMatrices = new Float32Array(e.length * 16), t.length === 0)
      this.calculateInverses();
    else if (e.length !== t.length) {
      console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."), this.boneInverses = [];
      for (let n = 0, i = this.bones.length; n < i; n++)
        this.boneInverses.push(new qe());
    }
  }
  calculateInverses() {
    this.boneInverses.length = 0;
    for (let e = 0, t = this.bones.length; e < t; e++) {
      const n = new qe();
      this.bones[e] && n.copy(this.bones[e].matrixWorld).invert(), this.boneInverses.push(n);
    }
  }
  pose() {
    for (let e = 0, t = this.bones.length; e < t; e++) {
      const n = this.bones[e];
      n && n.matrixWorld.copy(this.boneInverses[e]).invert();
    }
    for (let e = 0, t = this.bones.length; e < t; e++) {
      const n = this.bones[e];
      n && (n.parent && n.parent.isBone ? (n.matrix.copy(n.parent.matrixWorld).invert(), n.matrix.multiply(n.matrixWorld)) : n.matrix.copy(n.matrixWorld), n.matrix.decompose(n.position, n.quaternion, n.scale));
    }
  }
  update() {
    const e = this.bones, t = this.boneInverses, n = this.boneMatrices, i = this.boneTexture;
    for (let r = 0, a = e.length; r < a; r++) {
      const o = e[r] ? e[r].matrixWorld : np;
      po.multiplyMatrices(o, t[r]), po.toArray(n, r * 16);
    }
    i !== null && (i.needsUpdate = !0);
  }
  clone() {
    return new la(this.bones, this.boneInverses);
  }
  computeBoneTexture() {
    let e = Math.sqrt(this.bones.length * 4);
    e = Math.ceil(e / 4) * 4, e = Math.max(e, 4);
    const t = new Float32Array(e * e * 4);
    t.set(this.boneMatrices);
    const n = new ca(t, e, e, 1023, 1015);
    return n.needsUpdate = !0, this.boneMatrices = t, this.boneTexture = n, this;
  }
  getBoneByName(e) {
    for (let t = 0, n = this.bones.length; t < n; t++) {
      const i = this.bones[t];
      if (i.name === e)
        return i;
    }
  }
  dispose() {
    this.boneTexture !== null && (this.boneTexture.dispose(), this.boneTexture = null);
  }
  fromJSON(e, t) {
    this.uuid = e.uuid;
    for (let n = 0, i = e.bones.length; n < i; n++) {
      const r = e.bones[n];
      let a = t[r];
      a === void 0 && (console.warn("THREE.Skeleton: No bone found with UUID:", r), a = new tc()), this.bones.push(a), this.boneInverses.push(new qe().fromArray(e.boneInverses[n]));
    }
    return this.init(), this;
  }
  toJSON() {
    const e = {
      metadata: {
        version: 4.6,
        type: "Skeleton",
        generator: "Skeleton.toJSON"
      },
      bones: [],
      boneInverses: []
    };
    e.uuid = this.uuid;
    const t = this.bones, n = this.boneInverses;
    for (let i = 0, r = t.length; i < r; i++) {
      const a = t[i];
      e.bones.push(a.uuid);
      const o = n[i];
      e.boneInverses.push(o.toArray());
    }
    return e;
  }
}
class Kr extends jt {
  constructor(e, t, n, i = 1) {
    super(e, t, n), this.isInstancedBufferAttribute = !0, this.meshPerAttribute = i;
  }
  copy(e) {
    return super.copy(e), this.meshPerAttribute = e.meshPerAttribute, this;
  }
  toJSON() {
    const e = super.toJSON();
    return e.meshPerAttribute = this.meshPerAttribute, e.isInstancedBufferAttribute = !0, e;
  }
}
const Ai = /* @__PURE__ */ new qe(), mo = /* @__PURE__ */ new qe(), Fs = [], go = /* @__PURE__ */ new vn(), ip = /* @__PURE__ */ new qe(), es = /* @__PURE__ */ new We(), ts = /* @__PURE__ */ new Sn();
class sp extends We {
  constructor(e, t, n) {
    super(e, t), this.isInstancedMesh = !0, this.instanceMatrix = new Kr(new Float32Array(n * 16), 16), this.instanceColor = null, this.morphTexture = null, this.count = n, this.boundingBox = null, this.boundingSphere = null;
    for (let i = 0; i < n; i++)
      this.setMatrixAt(i, ip);
  }
  computeBoundingBox() {
    const e = this.geometry, t = this.count;
    this.boundingBox === null && (this.boundingBox = new vn()), e.boundingBox === null && e.computeBoundingBox(), this.boundingBox.makeEmpty();
    for (let n = 0; n < t; n++)
      this.getMatrixAt(n, Ai), go.copy(e.boundingBox).applyMatrix4(Ai), this.boundingBox.union(go);
  }
  computeBoundingSphere() {
    const e = this.geometry, t = this.count;
    this.boundingSphere === null && (this.boundingSphere = new Sn()), e.boundingSphere === null && e.computeBoundingSphere(), this.boundingSphere.makeEmpty();
    for (let n = 0; n < t; n++)
      this.getMatrixAt(n, Ai), ts.copy(e.boundingSphere).applyMatrix4(Ai), this.boundingSphere.union(ts);
  }
  copy(e, t) {
    return super.copy(e, t), this.instanceMatrix.copy(e.instanceMatrix), e.morphTexture !== null && (this.morphTexture = e.morphTexture.clone()), e.instanceColor !== null && (this.instanceColor = e.instanceColor.clone()), this.count = e.count, e.boundingBox !== null && (this.boundingBox = e.boundingBox.clone()), e.boundingSphere !== null && (this.boundingSphere = e.boundingSphere.clone()), this;
  }
  getColorAt(e, t) {
    t.fromArray(this.instanceColor.array, e * 3);
  }
  getMatrixAt(e, t) {
    t.fromArray(this.instanceMatrix.array, e * 16);
  }
  getMorphAt(e, t) {
    const n = t.morphTargetInfluences, i = this.morphTexture.source.data.data, r = n.length + 1, a = e * r + 1;
    for (let o = 0; o < n.length; o++)
      n[o] = i[a + o];
  }
  raycast(e, t) {
    const n = this.matrixWorld, i = this.count;
    if (es.geometry = this.geometry, es.material = this.material, es.material !== void 0 && (this.boundingSphere === null && this.computeBoundingSphere(), ts.copy(this.boundingSphere), ts.applyMatrix4(n), e.ray.intersectsSphere(ts) !== !1))
      for (let r = 0; r < i; r++) {
        this.getMatrixAt(r, Ai), mo.multiplyMatrices(n, Ai), es.matrixWorld = mo, es.raycast(e, Fs);
        for (let a = 0, o = Fs.length; a < o; a++) {
          const c = Fs[a];
          c.instanceId = r, c.object = this, t.push(c);
        }
        Fs.length = 0;
      }
  }
  setColorAt(e, t) {
    this.instanceColor === null && (this.instanceColor = new Kr(new Float32Array(this.instanceMatrix.count * 3).fill(1), 3)), t.toArray(this.instanceColor.array, e * 3);
  }
  setMatrixAt(e, t) {
    t.toArray(this.instanceMatrix.array, e * 16);
  }
  setMorphAt(e, t) {
    const n = t.morphTargetInfluences, i = n.length + 1;
    this.morphTexture === null && (this.morphTexture = new ca(new Float32Array(i * this.count), i, this.count, 1028, 1015));
    const r = this.morphTexture.source.data.data;
    let a = 0;
    for (let l = 0; l < n.length; l++)
      a += n[l];
    const o = this.geometry.morphTargetsRelative ? 1 : 1 - a, c = i * e;
    r[c] = o, r.set(n, c + 1);
  }
  updateMorphTargets() {
  }
  dispose() {
    return this.dispatchEvent({ type: "dispose" }), this.morphTexture !== null && (this.morphTexture.dispose(), this.morphTexture = null), this;
  }
}
class Dn extends nn {
  constructor(e) {
    super(), this.isLineBasicMaterial = !0, this.type = "LineBasicMaterial", this.color = new Pe(16777215), this.map = null, this.linewidth = 1, this.linecap = "round", this.linejoin = "round", this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.map = e.map, this.linewidth = e.linewidth, this.linecap = e.linecap, this.linejoin = e.linejoin, this.fog = e.fog, this;
  }
}
const Qs = /* @__PURE__ */ new L(), er = /* @__PURE__ */ new L(), _o = /* @__PURE__ */ new qe(), ns = /* @__PURE__ */ new hs(), Bs = /* @__PURE__ */ new Sn(), Or = /* @__PURE__ */ new L(), xo = /* @__PURE__ */ new L();
class ha extends St {
  constructor(e = new Rt(), t = new Dn()) {
    super(), this.isLine = !0, this.type = "Line", this.geometry = e, this.material = t, this.updateMorphTargets();
  }
  copy(e, t) {
    return super.copy(e, t), this.material = Array.isArray(e.material) ? e.material.slice() : e.material, this.geometry = e.geometry, this;
  }
  computeLineDistances() {
    const e = this.geometry;
    if (e.index === null) {
      const t = e.attributes.position, n = [0];
      for (let i = 1, r = t.count; i < r; i++)
        Qs.fromBufferAttribute(t, i - 1), er.fromBufferAttribute(t, i), n[i] = n[i - 1], n[i] += Qs.distanceTo(er);
      e.setAttribute("lineDistance", new dt(n, 1));
    } else
      console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
    return this;
  }
  raycast(e, t) {
    const n = this.geometry, i = this.matrixWorld, r = e.params.Line.threshold, a = n.drawRange;
    if (n.boundingSphere === null && n.computeBoundingSphere(), Bs.copy(n.boundingSphere), Bs.applyMatrix4(i), Bs.radius += r, e.ray.intersectsSphere(Bs) === !1) return;
    _o.copy(i).invert(), ns.copy(e.ray).applyMatrix4(_o);
    const o = r / ((this.scale.x + this.scale.y + this.scale.z) / 3), c = o * o, l = this.isLineSegments ? 2 : 1, h = n.index, d = n.attributes.position;
    if (h !== null) {
      const f = Math.max(0, a.start), g = Math.min(h.count, a.start + a.count);
      for (let _ = f, m = g - 1; _ < m; _ += l) {
        const p = h.getX(_), E = h.getX(_ + 1), y = Os(this, e, ns, c, p, E);
        y && t.push(y);
      }
      if (this.isLineLoop) {
        const _ = h.getX(g - 1), m = h.getX(f), p = Os(this, e, ns, c, _, m);
        p && t.push(p);
      }
    } else {
      const f = Math.max(0, a.start), g = Math.min(d.count, a.start + a.count);
      for (let _ = f, m = g - 1; _ < m; _ += l) {
        const p = Os(this, e, ns, c, _, _ + 1);
        p && t.push(p);
      }
      if (this.isLineLoop) {
        const _ = Os(this, e, ns, c, g - 1, f);
        _ && t.push(_);
      }
    }
  }
  updateMorphTargets() {
    const t = this.geometry.morphAttributes, n = Object.keys(t);
    if (n.length > 0) {
      const i = t[n[0]];
      if (i !== void 0) {
        this.morphTargetInfluences = [], this.morphTargetDictionary = {};
        for (let r = 0, a = i.length; r < a; r++) {
          const o = i[r].name || String(r);
          this.morphTargetInfluences.push(0), this.morphTargetDictionary[o] = r;
        }
      }
    }
  }
}
function Os(s, e, t, n, i, r) {
  const a = s.geometry.attributes.position;
  if (Qs.fromBufferAttribute(a, i), er.fromBufferAttribute(a, r), t.distanceSqToSegment(Qs, er, Or, xo) > n) return;
  Or.applyMatrix4(s.matrixWorld);
  const c = e.ray.origin.distanceTo(Or);
  if (!(c < e.near || c > e.far))
    return {
      distance: c,
      // What do we want? intersection point on the ray or on the segment??
      // point: raycaster.ray.at( distance ),
      point: xo.clone().applyMatrix4(s.matrixWorld),
      index: i,
      face: null,
      faceIndex: null,
      barycoord: null,
      object: s
    };
}
const vo = /* @__PURE__ */ new L(), Mo = /* @__PURE__ */ new L();
class ii extends ha {
  constructor(e, t) {
    super(e, t), this.isLineSegments = !0, this.type = "LineSegments";
  }
  computeLineDistances() {
    const e = this.geometry;
    if (e.index === null) {
      const t = e.attributes.position, n = [];
      for (let i = 0, r = t.count; i < r; i += 2)
        vo.fromBufferAttribute(t, i), Mo.fromBufferAttribute(t, i + 1), n[i] = i === 0 ? 0 : n[i - 1], n[i + 1] = n[i] + vo.distanceTo(Mo);
      e.setAttribute("lineDistance", new dt(n, 1));
    } else
      console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
    return this;
  }
}
class rp extends ha {
  constructor(e, t) {
    super(e, t), this.isLineLoop = !0, this.type = "LineLoop";
  }
}
class Ri extends nn {
  constructor(e) {
    super(), this.isPointsMaterial = !0, this.type = "PointsMaterial", this.color = new Pe(16777215), this.map = null, this.alphaMap = null, this.size = 1, this.sizeAttenuation = !0, this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.map = e.map, this.alphaMap = e.alphaMap, this.size = e.size, this.sizeAttenuation = e.sizeAttenuation, this.fog = e.fog, this;
  }
}
const yo = /* @__PURE__ */ new qe(), Zr = /* @__PURE__ */ new hs(), ks = /* @__PURE__ */ new Sn(), zs = /* @__PURE__ */ new L();
class Ks extends St {
  constructor(e = new Rt(), t = new Ri()) {
    super(), this.isPoints = !0, this.type = "Points", this.geometry = e, this.material = t, this.updateMorphTargets();
  }
  copy(e, t) {
    return super.copy(e, t), this.material = Array.isArray(e.material) ? e.material.slice() : e.material, this.geometry = e.geometry, this;
  }
  raycast(e, t) {
    const n = this.geometry, i = this.matrixWorld, r = e.params.Points.threshold, a = n.drawRange;
    if (n.boundingSphere === null && n.computeBoundingSphere(), ks.copy(n.boundingSphere), ks.applyMatrix4(i), ks.radius += r, e.ray.intersectsSphere(ks) === !1) return;
    yo.copy(i).invert(), Zr.copy(e.ray).applyMatrix4(yo);
    const o = r / ((this.scale.x + this.scale.y + this.scale.z) / 3), c = o * o, l = n.index, u = n.attributes.position;
    if (l !== null) {
      const d = Math.max(0, a.start), f = Math.min(l.count, a.start + a.count);
      for (let g = d, _ = f; g < _; g++) {
        const m = l.getX(g);
        zs.fromBufferAttribute(u, m), So(zs, m, c, i, e, t, this);
      }
    } else {
      const d = Math.max(0, a.start), f = Math.min(u.count, a.start + a.count);
      for (let g = d, _ = f; g < _; g++)
        zs.fromBufferAttribute(u, g), So(zs, g, c, i, e, t, this);
    }
  }
  updateMorphTargets() {
    const t = this.geometry.morphAttributes, n = Object.keys(t);
    if (n.length > 0) {
      const i = t[n[0]];
      if (i !== void 0) {
        this.morphTargetInfluences = [], this.morphTargetDictionary = {};
        for (let r = 0, a = i.length; r < a; r++) {
          const o = i[r].name || String(r);
          this.morphTargetInfluences.push(0), this.morphTargetDictionary[o] = r;
        }
      }
    }
  }
}
function So(s, e, t, n, i, r, a) {
  const o = Zr.distanceSqToPoint(s);
  if (o < t) {
    const c = new L();
    Zr.closestPointToPoint(s, c), c.applyMatrix4(n);
    const l = i.ray.origin.distanceTo(c);
    if (l < i.near || l > i.far) return;
    r.push({
      distance: l,
      distanceToRay: Math.sqrt(o),
      point: c,
      index: e,
      face: null,
      faceIndex: null,
      barycoord: null,
      object: a
    });
  }
}
class ap extends It {
  constructor(e, t, n, i, r, a, o, c, l) {
    super(e, t, n, i, r, a, o, c, l), this.isCanvasTexture = !0, this.needsUpdate = !0;
  }
}
class ua extends Rt {
  constructor(e = 1, t = 32, n = 0, i = Math.PI * 2) {
    super(), this.type = "CircleGeometry", this.parameters = {
      radius: e,
      segments: t,
      thetaStart: n,
      thetaLength: i
    }, t = Math.max(3, t);
    const r = [], a = [], o = [], c = [], l = new L(), h = new Xe();
    a.push(0, 0, 0), o.push(0, 0, 1), c.push(0.5, 0.5);
    for (let u = 0, d = 3; u <= t; u++, d += 3) {
      const f = n + u / t * i;
      l.x = e * Math.cos(f), l.y = e * Math.sin(f), a.push(l.x, l.y, l.z), o.push(0, 0, 1), h.x = (a[d] / e + 1) / 2, h.y = (a[d + 1] / e + 1) / 2, c.push(h.x, h.y);
    }
    for (let u = 1; u <= t; u++)
      r.push(u, u + 1, 0);
    this.setIndex(r), this.setAttribute("position", new dt(a, 3)), this.setAttribute("normal", new dt(o, 3)), this.setAttribute("uv", new dt(c, 2));
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new ua(e.radius, e.segments, e.thetaStart, e.thetaLength);
  }
}
class ls extends Rt {
  constructor(e = 1, t = 1, n = 1, i = 32, r = 1, a = !1, o = 0, c = Math.PI * 2) {
    super(), this.type = "CylinderGeometry", this.parameters = {
      radiusTop: e,
      radiusBottom: t,
      height: n,
      radialSegments: i,
      heightSegments: r,
      openEnded: a,
      thetaStart: o,
      thetaLength: c
    };
    const l = this;
    i = Math.floor(i), r = Math.floor(r);
    const h = [], u = [], d = [], f = [];
    let g = 0;
    const _ = [], m = n / 2;
    let p = 0;
    E(), a === !1 && (e > 0 && y(!0), t > 0 && y(!1)), this.setIndex(h), this.setAttribute("position", new dt(u, 3)), this.setAttribute("normal", new dt(d, 3)), this.setAttribute("uv", new dt(f, 2));
    function E() {
      const A = new L(), O = new L();
      let w = 0;
      const R = (t - e) / n;
      for (let k = 0; k <= r; k++) {
        const Q = [], x = k / r, T = x * (t - e) + e;
        for (let q = 0; q <= i; q++) {
          const X = q / i, j = X * c + o, te = Math.sin(j), W = Math.cos(j);
          O.x = T * te, O.y = -x * n + m, O.z = T * W, u.push(O.x, O.y, O.z), A.set(te, R, W).normalize(), d.push(A.x, A.y, A.z), f.push(X, 1 - x), Q.push(g++);
        }
        _.push(Q);
      }
      for (let k = 0; k < i; k++)
        for (let Q = 0; Q < r; Q++) {
          const x = _[Q][k], T = _[Q + 1][k], q = _[Q + 1][k + 1], X = _[Q][k + 1];
          e > 0 && (h.push(x, T, X), w += 3), t > 0 && (h.push(T, q, X), w += 3);
        }
      l.addGroup(p, w, 0), p += w;
    }
    function y(A) {
      const O = g, w = new Xe(), R = new L();
      let k = 0;
      const Q = A === !0 ? e : t, x = A === !0 ? 1 : -1;
      for (let q = 1; q <= i; q++)
        u.push(0, m * x, 0), d.push(0, x, 0), f.push(0.5, 0.5), g++;
      const T = g;
      for (let q = 0; q <= i; q++) {
        const j = q / i * c + o, te = Math.cos(j), W = Math.sin(j);
        R.x = Q * W, R.y = m * x, R.z = Q * te, u.push(R.x, R.y, R.z), d.push(0, x, 0), w.x = te * 0.5 + 0.5, w.y = W * 0.5 * x + 0.5, f.push(w.x, w.y), g++;
      }
      for (let q = 0; q < i; q++) {
        const X = O + q, j = T + q;
        A === !0 ? h.push(j, j + 1, X) : h.push(j + 1, j, X), k += 3;
      }
      l.addGroup(p, k, A === !0 ? 1 : 2), p += k;
    }
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new ls(e.radiusTop, e.radiusBottom, e.height, e.radialSegments, e.heightSegments, e.openEnded, e.thetaStart, e.thetaLength);
  }
}
const Gs = /* @__PURE__ */ new L(), Hs = /* @__PURE__ */ new L(), kr = /* @__PURE__ */ new L(), Vs = /* @__PURE__ */ new ln();
class op extends Rt {
  constructor(e = null, t = 1) {
    if (super(), this.type = "EdgesGeometry", this.parameters = {
      geometry: e,
      thresholdAngle: t
    }, e !== null) {
      const i = Math.pow(10, 4), r = Math.cos(Ci * t), a = e.getIndex(), o = e.getAttribute("position"), c = a ? a.count : o.count, l = [0, 0, 0], h = ["a", "b", "c"], u = new Array(3), d = {}, f = [];
      for (let g = 0; g < c; g += 3) {
        a ? (l[0] = a.getX(g), l[1] = a.getX(g + 1), l[2] = a.getX(g + 2)) : (l[0] = g, l[1] = g + 1, l[2] = g + 2);
        const { a: _, b: m, c: p } = Vs;
        if (_.fromBufferAttribute(o, l[0]), m.fromBufferAttribute(o, l[1]), p.fromBufferAttribute(o, l[2]), Vs.getNormal(kr), u[0] = `${Math.round(_.x * i)},${Math.round(_.y * i)},${Math.round(_.z * i)}`, u[1] = `${Math.round(m.x * i)},${Math.round(m.y * i)},${Math.round(m.z * i)}`, u[2] = `${Math.round(p.x * i)},${Math.round(p.y * i)},${Math.round(p.z * i)}`, !(u[0] === u[1] || u[1] === u[2] || u[2] === u[0]))
          for (let E = 0; E < 3; E++) {
            const y = (E + 1) % 3, A = u[E], O = u[y], w = Vs[h[E]], R = Vs[h[y]], k = `${A}_${O}`, Q = `${O}_${A}`;
            Q in d && d[Q] ? (kr.dot(d[Q].normal) <= r && (f.push(w.x, w.y, w.z), f.push(R.x, R.y, R.z)), d[Q] = null) : k in d || (d[k] = {
              index0: l[E],
              index1: l[y],
              normal: kr.clone()
            });
          }
      }
      for (const g in d)
        if (d[g]) {
          const { index0: _, index1: m } = d[g];
          Gs.fromBufferAttribute(o, _), Hs.fromBufferAttribute(o, m), f.push(Gs.x, Gs.y, Gs.z), f.push(Hs.x, Hs.y, Hs.z);
        }
      this.setAttribute("position", new dt(f, 3));
    }
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
}
class ni extends Rt {
  constructor(e = 0.5, t = 1, n = 32, i = 1, r = 0, a = Math.PI * 2) {
    super(), this.type = "RingGeometry", this.parameters = {
      innerRadius: e,
      outerRadius: t,
      thetaSegments: n,
      phiSegments: i,
      thetaStart: r,
      thetaLength: a
    }, n = Math.max(3, n), i = Math.max(1, i);
    const o = [], c = [], l = [], h = [];
    let u = e;
    const d = (t - e) / i, f = new L(), g = new Xe();
    for (let _ = 0; _ <= i; _++) {
      for (let m = 0; m <= n; m++) {
        const p = r + m / n * a;
        f.x = u * Math.cos(p), f.y = u * Math.sin(p), c.push(f.x, f.y, f.z), l.push(0, 0, 1), g.x = (f.x / t + 1) / 2, g.y = (f.y / t + 1) / 2, h.push(g.x, g.y);
      }
      u += d;
    }
    for (let _ = 0; _ < i; _++) {
      const m = _ * (n + 1);
      for (let p = 0; p < n; p++) {
        const E = p + m, y = E, A = E + n + 1, O = E + n + 2, w = E + 1;
        o.push(y, A, w), o.push(A, O, w);
      }
    }
    this.setIndex(o), this.setAttribute("position", new dt(c, 3)), this.setAttribute("normal", new dt(l, 3)), this.setAttribute("uv", new dt(h, 2));
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new ni(e.innerRadius, e.outerRadius, e.thetaSegments, e.phiSegments, e.thetaStart, e.thetaLength);
  }
}
class Pi extends Rt {
  constructor(e = 1, t = 32, n = 16, i = 0, r = Math.PI * 2, a = 0, o = Math.PI) {
    super(), this.type = "SphereGeometry", this.parameters = {
      radius: e,
      widthSegments: t,
      heightSegments: n,
      phiStart: i,
      phiLength: r,
      thetaStart: a,
      thetaLength: o
    }, t = Math.max(3, Math.floor(t)), n = Math.max(2, Math.floor(n));
    const c = Math.min(a + o, Math.PI);
    let l = 0;
    const h = [], u = new L(), d = new L(), f = [], g = [], _ = [], m = [];
    for (let p = 0; p <= n; p++) {
      const E = [], y = p / n;
      let A = 0;
      p === 0 && a === 0 ? A = 0.5 / t : p === n && c === Math.PI && (A = -0.5 / t);
      for (let O = 0; O <= t; O++) {
        const w = O / t;
        u.x = -e * Math.cos(i + w * r) * Math.sin(a + y * o), u.y = e * Math.cos(a + y * o), u.z = e * Math.sin(i + w * r) * Math.sin(a + y * o), g.push(u.x, u.y, u.z), d.copy(u).normalize(), _.push(d.x, d.y, d.z), m.push(w + A, 1 - y), E.push(l++);
      }
      h.push(E);
    }
    for (let p = 0; p < n; p++)
      for (let E = 0; E < t; E++) {
        const y = h[p][E + 1], A = h[p][E], O = h[p + 1][E], w = h[p + 1][E + 1];
        (p !== 0 || a > 0) && f.push(y, A, w), (p !== n - 1 || c < Math.PI) && f.push(A, O, w);
      }
    this.setIndex(f), this.setAttribute("position", new dt(g, 3)), this.setAttribute("normal", new dt(_, 3)), this.setAttribute("uv", new dt(m, 2));
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new Pi(e.radius, e.widthSegments, e.heightSegments, e.phiStart, e.phiLength, e.thetaStart, e.thetaLength);
  }
}
class Zt extends nn {
  constructor(e) {
    super(), this.isMeshStandardMaterial = !0, this.defines = { STANDARD: "" }, this.type = "MeshStandardMaterial", this.color = new Pe(16777215), this.roughness = 1, this.metalness = 0, this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new Pe(0), this.emissiveIntensity = 1, this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = 0, this.normalScale = new Xe(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.roughnessMap = null, this.metalnessMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new xn(), this.envMapIntensity = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.flatShading = !1, this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.defines = { STANDARD: "" }, this.color.copy(e.color), this.roughness = e.roughness, this.metalness = e.metalness, this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.emissive.copy(e.emissive), this.emissiveMap = e.emissiveMap, this.emissiveIntensity = e.emissiveIntensity, this.bumpMap = e.bumpMap, this.bumpScale = e.bumpScale, this.normalMap = e.normalMap, this.normalMapType = e.normalMapType, this.normalScale.copy(e.normalScale), this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.roughnessMap = e.roughnessMap, this.metalnessMap = e.metalnessMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapRotation.copy(e.envMapRotation), this.envMapIntensity = e.envMapIntensity, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.flatShading = e.flatShading, this.fog = e.fog, this;
  }
}
class En extends Zt {
  constructor(e) {
    super(), this.isMeshPhysicalMaterial = !0, this.defines = {
      STANDARD: "",
      PHYSICAL: ""
    }, this.type = "MeshPhysicalMaterial", this.anisotropyRotation = 0, this.anisotropyMap = null, this.clearcoatMap = null, this.clearcoatRoughness = 0, this.clearcoatRoughnessMap = null, this.clearcoatNormalScale = new Xe(1, 1), this.clearcoatNormalMap = null, this.ior = 1.5, Object.defineProperty(this, "reflectivity", {
      get: function() {
        return Vt(2.5 * (this.ior - 1) / (this.ior + 1), 0, 1);
      },
      set: function(t) {
        this.ior = (1 + 0.4 * t) / (1 - 0.4 * t);
      }
    }), this.iridescenceMap = null, this.iridescenceIOR = 1.3, this.iridescenceThicknessRange = [100, 400], this.iridescenceThicknessMap = null, this.sheenColor = new Pe(0), this.sheenColorMap = null, this.sheenRoughness = 1, this.sheenRoughnessMap = null, this.transmissionMap = null, this.thickness = 0, this.thicknessMap = null, this.attenuationDistance = 1 / 0, this.attenuationColor = new Pe(1, 1, 1), this.specularIntensity = 1, this.specularIntensityMap = null, this.specularColor = new Pe(1, 1, 1), this.specularColorMap = null, this._anisotropy = 0, this._clearcoat = 0, this._dispersion = 0, this._iridescence = 0, this._sheen = 0, this._transmission = 0, this.setValues(e);
  }
  get anisotropy() {
    return this._anisotropy;
  }
  set anisotropy(e) {
    this._anisotropy > 0 != e > 0 && this.version++, this._anisotropy = e;
  }
  get clearcoat() {
    return this._clearcoat;
  }
  set clearcoat(e) {
    this._clearcoat > 0 != e > 0 && this.version++, this._clearcoat = e;
  }
  get iridescence() {
    return this._iridescence;
  }
  set iridescence(e) {
    this._iridescence > 0 != e > 0 && this.version++, this._iridescence = e;
  }
  get dispersion() {
    return this._dispersion;
  }
  set dispersion(e) {
    this._dispersion > 0 != e > 0 && this.version++, this._dispersion = e;
  }
  get sheen() {
    return this._sheen;
  }
  set sheen(e) {
    this._sheen > 0 != e > 0 && this.version++, this._sheen = e;
  }
  get transmission() {
    return this._transmission;
  }
  set transmission(e) {
    this._transmission > 0 != e > 0 && this.version++, this._transmission = e;
  }
  copy(e) {
    return super.copy(e), this.defines = {
      STANDARD: "",
      PHYSICAL: ""
    }, this.anisotropy = e.anisotropy, this.anisotropyRotation = e.anisotropyRotation, this.anisotropyMap = e.anisotropyMap, this.clearcoat = e.clearcoat, this.clearcoatMap = e.clearcoatMap, this.clearcoatRoughness = e.clearcoatRoughness, this.clearcoatRoughnessMap = e.clearcoatRoughnessMap, this.clearcoatNormalMap = e.clearcoatNormalMap, this.clearcoatNormalScale.copy(e.clearcoatNormalScale), this.dispersion = e.dispersion, this.ior = e.ior, this.iridescence = e.iridescence, this.iridescenceMap = e.iridescenceMap, this.iridescenceIOR = e.iridescenceIOR, this.iridescenceThicknessRange = [...e.iridescenceThicknessRange], this.iridescenceThicknessMap = e.iridescenceThicknessMap, this.sheen = e.sheen, this.sheenColor.copy(e.sheenColor), this.sheenColorMap = e.sheenColorMap, this.sheenRoughness = e.sheenRoughness, this.sheenRoughnessMap = e.sheenRoughnessMap, this.transmission = e.transmission, this.transmissionMap = e.transmissionMap, this.thickness = e.thickness, this.thicknessMap = e.thicknessMap, this.attenuationDistance = e.attenuationDistance, this.attenuationColor.copy(e.attenuationColor), this.specularIntensity = e.specularIntensity, this.specularIntensityMap = e.specularIntensityMap, this.specularColor.copy(e.specularColor), this.specularColorMap = e.specularColorMap, this;
  }
}
class nc extends nn {
  constructor(e) {
    super(), this.isMeshPhongMaterial = !0, this.type = "MeshPhongMaterial", this.color = new Pe(16777215), this.specular = new Pe(1118481), this.shininess = 30, this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new Pe(0), this.emissiveIntensity = 1, this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = 0, this.normalScale = new Xe(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new xn(), this.combine = 0, this.reflectivity = 1, this.refractionRatio = 0.98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.flatShading = !1, this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.specular.copy(e.specular), this.shininess = e.shininess, this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.emissive.copy(e.emissive), this.emissiveMap = e.emissiveMap, this.emissiveIntensity = e.emissiveIntensity, this.bumpMap = e.bumpMap, this.bumpScale = e.bumpScale, this.normalMap = e.normalMap, this.normalMapType = e.normalMapType, this.normalScale.copy(e.normalScale), this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.specularMap = e.specularMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapRotation.copy(e.envMapRotation), this.combine = e.combine, this.reflectivity = e.reflectivity, this.refractionRatio = e.refractionRatio, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.flatShading = e.flatShading, this.fog = e.fog, this;
  }
}
function Ws(s, e, t) {
  return !s || // let 'undefined' and 'null' pass
  !t && s.constructor === e ? s : typeof e.BYTES_PER_ELEMENT == "number" ? new e(s) : Array.prototype.slice.call(s);
}
function cp(s) {
  return ArrayBuffer.isView(s) && !(s instanceof DataView);
}
function lp(s) {
  function e(i, r) {
    return s[i] - s[r];
  }
  const t = s.length, n = new Array(t);
  for (let i = 0; i !== t; ++i) n[i] = i;
  return n.sort(e), n;
}
function Eo(s, e, t) {
  const n = s.length, i = new s.constructor(n);
  for (let r = 0, a = 0; a !== n; ++r) {
    const o = t[r] * e;
    for (let c = 0; c !== e; ++c)
      i[a++] = s[o + c];
  }
  return i;
}
function ic(s, e, t, n) {
  let i = 1, r = s[0];
  for (; r !== void 0 && r[n] === void 0; )
    r = s[i++];
  if (r === void 0) return;
  let a = r[n];
  if (a !== void 0)
    if (Array.isArray(a))
      do
        a = r[n], a !== void 0 && (e.push(r.time), t.push.apply(t, a)), r = s[i++];
      while (r !== void 0);
    else if (a.toArray !== void 0)
      do
        a = r[n], a !== void 0 && (e.push(r.time), a.toArray(t, t.length)), r = s[i++];
      while (r !== void 0);
    else
      do
        a = r[n], a !== void 0 && (e.push(r.time), t.push(a)), r = s[i++];
      while (r !== void 0);
}
class us {
  constructor(e, t, n, i) {
    this.parameterPositions = e, this._cachedIndex = 0, this.resultBuffer = i !== void 0 ? i : new t.constructor(n), this.sampleValues = t, this.valueSize = n, this.settings = null, this.DefaultSettings_ = {};
  }
  evaluate(e) {
    const t = this.parameterPositions;
    let n = this._cachedIndex, i = t[n], r = t[n - 1];
    e: {
      t: {
        let a;
        n: {
          i: if (!(e < i)) {
            for (let o = n + 2; ; ) {
              if (i === void 0) {
                if (e < r) break i;
                return n = t.length, this._cachedIndex = n, this.copySampleValue_(n - 1);
              }
              if (n === o) break;
              if (r = i, i = t[++n], e < i)
                break t;
            }
            a = t.length;
            break n;
          }
          if (!(e >= r)) {
            const o = t[1];
            e < o && (n = 2, r = o);
            for (let c = n - 2; ; ) {
              if (r === void 0)
                return this._cachedIndex = 0, this.copySampleValue_(0);
              if (n === c) break;
              if (i = r, r = t[--n - 1], e >= r)
                break t;
            }
            a = n, n = 0;
            break n;
          }
          break e;
        }
        for (; n < a; ) {
          const o = n + a >>> 1;
          e < t[o] ? a = o : n = o + 1;
        }
        if (i = t[n], r = t[n - 1], r === void 0)
          return this._cachedIndex = 0, this.copySampleValue_(0);
        if (i === void 0)
          return n = t.length, this._cachedIndex = n, this.copySampleValue_(n - 1);
      }
      this._cachedIndex = n, this.intervalChanged_(n, r, i);
    }
    return this.interpolate_(n, r, e, i);
  }
  getSettings_() {
    return this.settings || this.DefaultSettings_;
  }
  copySampleValue_(e) {
    const t = this.resultBuffer, n = this.sampleValues, i = this.valueSize, r = e * i;
    for (let a = 0; a !== i; ++a)
      t[a] = n[r + a];
    return t;
  }
  // Template methods for derived classes:
  interpolate_() {
    throw new Error("call to abstract method");
  }
  intervalChanged_() {
  }
}
class hp extends us {
  constructor(e, t, n, i) {
    super(e, t, n, i), this._weightPrev = -0, this._offsetPrev = -0, this._weightNext = -0, this._offsetNext = -0, this.DefaultSettings_ = {
      endingStart: 2400,
      endingEnd: 2400
    };
  }
  intervalChanged_(e, t, n) {
    const i = this.parameterPositions;
    let r = e - 2, a = e + 1, o = i[r], c = i[a];
    if (o === void 0)
      switch (this.getSettings_().endingStart) {
        case 2401:
          r = e, o = 2 * t - n;
          break;
        case 2402:
          r = i.length - 2, o = t + i[r] - i[r + 1];
          break;
        default:
          r = e, o = n;
      }
    if (c === void 0)
      switch (this.getSettings_().endingEnd) {
        case 2401:
          a = e, c = 2 * n - t;
          break;
        case 2402:
          a = 1, c = n + i[1] - i[0];
          break;
        default:
          a = e - 1, c = t;
      }
    const l = (n - t) * 0.5, h = this.valueSize;
    this._weightPrev = l / (t - o), this._weightNext = l / (c - n), this._offsetPrev = r * h, this._offsetNext = a * h;
  }
  interpolate_(e, t, n, i) {
    const r = this.resultBuffer, a = this.sampleValues, o = this.valueSize, c = e * o, l = c - o, h = this._offsetPrev, u = this._offsetNext, d = this._weightPrev, f = this._weightNext, g = (n - t) / (i - t), _ = g * g, m = _ * g, p = -d * m + 2 * d * _ - d * g, E = (1 + d) * m + (-1.5 - 2 * d) * _ + (-0.5 + d) * g + 1, y = (-1 - f) * m + (1.5 + f) * _ + 0.5 * g, A = f * m - f * _;
    for (let O = 0; O !== o; ++O)
      r[O] = p * a[h + O] + E * a[l + O] + y * a[c + O] + A * a[u + O];
    return r;
  }
}
class sc extends us {
  constructor(e, t, n, i) {
    super(e, t, n, i);
  }
  interpolate_(e, t, n, i) {
    const r = this.resultBuffer, a = this.sampleValues, o = this.valueSize, c = e * o, l = c - o, h = (n - t) / (i - t), u = 1 - h;
    for (let d = 0; d !== o; ++d)
      r[d] = a[l + d] * u + a[c + d] * h;
    return r;
  }
}
class up extends us {
  constructor(e, t, n, i) {
    super(e, t, n, i);
  }
  interpolate_(e) {
    return this.copySampleValue_(e - 1);
  }
}
class Tn {
  constructor(e, t, n, i) {
    if (e === void 0) throw new Error("THREE.KeyframeTrack: track name is undefined");
    if (t === void 0 || t.length === 0) throw new Error("THREE.KeyframeTrack: no keyframes in track named " + e);
    this.name = e, this.times = Ws(t, this.TimeBufferType), this.values = Ws(n, this.ValueBufferType), this.setInterpolation(i || this.DefaultInterpolation);
  }
  // Serialization (in static context, because of constructor invocation
  // and automatic invocation of .toJSON):
  static toJSON(e) {
    const t = e.constructor;
    let n;
    if (t.toJSON !== this.toJSON)
      n = t.toJSON(e);
    else {
      n = {
        name: e.name,
        times: Ws(e.times, Array),
        values: Ws(e.values, Array)
      };
      const i = e.getInterpolation();
      i !== e.DefaultInterpolation && (n.interpolation = i);
    }
    return n.type = e.ValueTypeName, n;
  }
  InterpolantFactoryMethodDiscrete(e) {
    return new up(this.times, this.values, this.getValueSize(), e);
  }
  InterpolantFactoryMethodLinear(e) {
    return new sc(this.times, this.values, this.getValueSize(), e);
  }
  InterpolantFactoryMethodSmooth(e) {
    return new hp(this.times, this.values, this.getValueSize(), e);
  }
  setInterpolation(e) {
    let t;
    switch (e) {
      case 2300:
        t = this.InterpolantFactoryMethodDiscrete;
        break;
      case 2301:
        t = this.InterpolantFactoryMethodLinear;
        break;
      case 2302:
        t = this.InterpolantFactoryMethodSmooth;
        break;
    }
    if (t === void 0) {
      const n = "unsupported interpolation for " + this.ValueTypeName + " keyframe track named " + this.name;
      if (this.createInterpolant === void 0)
        if (e !== this.DefaultInterpolation)
          this.setInterpolation(this.DefaultInterpolation);
        else
          throw new Error(n);
      return console.warn("THREE.KeyframeTrack:", n), this;
    }
    return this.createInterpolant = t, this;
  }
  getInterpolation() {
    switch (this.createInterpolant) {
      case this.InterpolantFactoryMethodDiscrete:
        return 2300;
      case this.InterpolantFactoryMethodLinear:
        return 2301;
      case this.InterpolantFactoryMethodSmooth:
        return 2302;
    }
  }
  getValueSize() {
    return this.values.length / this.times.length;
  }
  // move all keyframes either forwards or backwards in time
  shift(e) {
    if (e !== 0) {
      const t = this.times;
      for (let n = 0, i = t.length; n !== i; ++n)
        t[n] += e;
    }
    return this;
  }
  // scale all keyframe times by a factor (useful for frame <-> seconds conversions)
  scale(e) {
    if (e !== 1) {
      const t = this.times;
      for (let n = 0, i = t.length; n !== i; ++n)
        t[n] *= e;
    }
    return this;
  }
  // removes keyframes before and after animation without changing any values within the range [startTime, endTime].
  // IMPORTANT: We do not shift around keys to the start of the track time, because for interpolated keys this will change their values
  trim(e, t) {
    const n = this.times, i = n.length;
    let r = 0, a = i - 1;
    for (; r !== i && n[r] < e; )
      ++r;
    for (; a !== -1 && n[a] > t; )
      --a;
    if (++a, r !== 0 || a !== i) {
      r >= a && (a = Math.max(a, 1), r = a - 1);
      const o = this.getValueSize();
      this.times = n.slice(r, a), this.values = this.values.slice(r * o, a * o);
    }
    return this;
  }
  // ensure we do not get a GarbageInGarbageOut situation, make sure tracks are at least minimally viable
  validate() {
    let e = !0;
    const t = this.getValueSize();
    t - Math.floor(t) !== 0 && (console.error("THREE.KeyframeTrack: Invalid value size in track.", this), e = !1);
    const n = this.times, i = this.values, r = n.length;
    r === 0 && (console.error("THREE.KeyframeTrack: Track is empty.", this), e = !1);
    let a = null;
    for (let o = 0; o !== r; o++) {
      const c = n[o];
      if (typeof c == "number" && isNaN(c)) {
        console.error("THREE.KeyframeTrack: Time is not a valid number.", this, o, c), e = !1;
        break;
      }
      if (a !== null && a > c) {
        console.error("THREE.KeyframeTrack: Out of order keys.", this, o, c, a), e = !1;
        break;
      }
      a = c;
    }
    if (i !== void 0 && cp(i))
      for (let o = 0, c = i.length; o !== c; ++o) {
        const l = i[o];
        if (isNaN(l)) {
          console.error("THREE.KeyframeTrack: Value is not a valid number.", this, o, l), e = !1;
          break;
        }
      }
    return e;
  }
  // removes equivalent sequential keys as common in morph target sequences
  // (0,0,0,0,1,1,1,0,0,0,0,0,0,0) --> (0,0,1,1,0,0)
  optimize() {
    const e = this.times.slice(), t = this.values.slice(), n = this.getValueSize(), i = this.getInterpolation() === 2302, r = e.length - 1;
    let a = 1;
    for (let o = 1; o < r; ++o) {
      let c = !1;
      const l = e[o], h = e[o + 1];
      if (l !== h && (o !== 1 || l !== e[0]))
        if (i)
          c = !0;
        else {
          const u = o * n, d = u - n, f = u + n;
          for (let g = 0; g !== n; ++g) {
            const _ = t[u + g];
            if (_ !== t[d + g] || _ !== t[f + g]) {
              c = !0;
              break;
            }
          }
        }
      if (c) {
        if (o !== a) {
          e[a] = e[o];
          const u = o * n, d = a * n;
          for (let f = 0; f !== n; ++f)
            t[d + f] = t[u + f];
        }
        ++a;
      }
    }
    if (r > 0) {
      e[a] = e[r];
      for (let o = r * n, c = a * n, l = 0; l !== n; ++l)
        t[c + l] = t[o + l];
      ++a;
    }
    return a !== e.length ? (this.times = e.slice(0, a), this.values = t.slice(0, a * n)) : (this.times = e, this.values = t), this;
  }
  clone() {
    const e = this.times.slice(), t = this.values.slice(), n = this.constructor, i = new n(this.name, e, t);
    return i.createInterpolant = this.createInterpolant, i;
  }
}
Tn.prototype.TimeBufferType = Float32Array;
Tn.prototype.ValueBufferType = Float32Array;
Tn.prototype.DefaultInterpolation = 2301;
class Gi extends Tn {
  // No interpolation parameter because only InterpolateDiscrete is valid.
  constructor(e, t, n) {
    super(e, t, n);
  }
}
Gi.prototype.ValueTypeName = "bool";
Gi.prototype.ValueBufferType = Array;
Gi.prototype.DefaultInterpolation = 2300;
Gi.prototype.InterpolantFactoryMethodLinear = void 0;
Gi.prototype.InterpolantFactoryMethodSmooth = void 0;
class rc extends Tn {
}
rc.prototype.ValueTypeName = "color";
class Fi extends Tn {
}
Fi.prototype.ValueTypeName = "number";
class dp extends us {
  constructor(e, t, n, i) {
    super(e, t, n, i);
  }
  interpolate_(e, t, n, i) {
    const r = this.resultBuffer, a = this.sampleValues, o = this.valueSize, c = (n - t) / (i - t);
    let l = e * o;
    for (let h = l + o; l !== h; l += 4)
      _n.slerpFlat(r, 0, a, l - o, a, l, c);
    return r;
  }
}
class Bi extends Tn {
  InterpolantFactoryMethodLinear(e) {
    return new dp(this.times, this.values, this.getValueSize(), e);
  }
}
Bi.prototype.ValueTypeName = "quaternion";
Bi.prototype.InterpolantFactoryMethodSmooth = void 0;
class Hi extends Tn {
  // No interpolation parameter because only InterpolateDiscrete is valid.
  constructor(e, t, n) {
    super(e, t, n);
  }
}
Hi.prototype.ValueTypeName = "string";
Hi.prototype.ValueBufferType = Array;
Hi.prototype.DefaultInterpolation = 2300;
Hi.prototype.InterpolantFactoryMethodLinear = void 0;
Hi.prototype.InterpolantFactoryMethodSmooth = void 0;
class Oi extends Tn {
}
Oi.prototype.ValueTypeName = "vector";
class $r {
  constructor(e = "", t = -1, n = [], i = 2500) {
    this.name = e, this.tracks = n, this.duration = t, this.blendMode = i, this.uuid = gn(), this.duration < 0 && this.resetDuration();
  }
  static parse(e) {
    const t = [], n = e.tracks, i = 1 / (e.fps || 1);
    for (let a = 0, o = n.length; a !== o; ++a)
      t.push(pp(n[a]).scale(i));
    const r = new this(e.name, e.duration, t, e.blendMode);
    return r.uuid = e.uuid, r;
  }
  static toJSON(e) {
    const t = [], n = e.tracks, i = {
      name: e.name,
      duration: e.duration,
      tracks: t,
      uuid: e.uuid,
      blendMode: e.blendMode
    };
    for (let r = 0, a = n.length; r !== a; ++r)
      t.push(Tn.toJSON(n[r]));
    return i;
  }
  static CreateFromMorphTargetSequence(e, t, n, i) {
    const r = t.length, a = [];
    for (let o = 0; o < r; o++) {
      let c = [], l = [];
      c.push(
        (o + r - 1) % r,
        o,
        (o + 1) % r
      ), l.push(0, 1, 0);
      const h = lp(c);
      c = Eo(c, 1, h), l = Eo(l, 1, h), !i && c[0] === 0 && (c.push(r), l.push(l[0])), a.push(
        new Fi(
          ".morphTargetInfluences[" + t[o].name + "]",
          c,
          l
        ).scale(1 / n)
      );
    }
    return new this(e, -1, a);
  }
  static findByName(e, t) {
    let n = e;
    if (!Array.isArray(e)) {
      const i = e;
      n = i.geometry && i.geometry.animations || i.animations;
    }
    for (let i = 0; i < n.length; i++)
      if (n[i].name === t)
        return n[i];
    return null;
  }
  static CreateClipsFromMorphTargetSequences(e, t, n) {
    const i = {}, r = /^([\w-]*?)([\d]+)$/;
    for (let o = 0, c = e.length; o < c; o++) {
      const l = e[o], h = l.name.match(r);
      if (h && h.length > 1) {
        const u = h[1];
        let d = i[u];
        d || (i[u] = d = []), d.push(l);
      }
    }
    const a = [];
    for (const o in i)
      a.push(this.CreateFromMorphTargetSequence(o, i[o], t, n));
    return a;
  }
  // parse the animation.hierarchy format
  static parseAnimation(e, t) {
    if (!e)
      return console.error("THREE.AnimationClip: No animation in JSONLoader data."), null;
    const n = function(u, d, f, g, _) {
      if (f.length !== 0) {
        const m = [], p = [];
        ic(f, m, p, g), m.length !== 0 && _.push(new u(d, m, p));
      }
    }, i = [], r = e.name || "default", a = e.fps || 30, o = e.blendMode;
    let c = e.length || -1;
    const l = e.hierarchy || [];
    for (let u = 0; u < l.length; u++) {
      const d = l[u].keys;
      if (!(!d || d.length === 0))
        if (d[0].morphTargets) {
          const f = {};
          let g;
          for (g = 0; g < d.length; g++)
            if (d[g].morphTargets)
              for (let _ = 0; _ < d[g].morphTargets.length; _++)
                f[d[g].morphTargets[_]] = -1;
          for (const _ in f) {
            const m = [], p = [];
            for (let E = 0; E !== d[g].morphTargets.length; ++E) {
              const y = d[g];
              m.push(y.time), p.push(y.morphTarget === _ ? 1 : 0);
            }
            i.push(new Fi(".morphTargetInfluence[" + _ + "]", m, p));
          }
          c = f.length * a;
        } else {
          const f = ".bones[" + t[u].name + "]";
          n(
            Oi,
            f + ".position",
            d,
            "pos",
            i
          ), n(
            Bi,
            f + ".quaternion",
            d,
            "rot",
            i
          ), n(
            Oi,
            f + ".scale",
            d,
            "scl",
            i
          );
        }
    }
    return i.length === 0 ? null : new this(r, c, i, o);
  }
  resetDuration() {
    const e = this.tracks;
    let t = 0;
    for (let n = 0, i = e.length; n !== i; ++n) {
      const r = this.tracks[n];
      t = Math.max(t, r.times[r.times.length - 1]);
    }
    return this.duration = t, this;
  }
  trim() {
    for (let e = 0; e < this.tracks.length; e++)
      this.tracks[e].trim(0, this.duration);
    return this;
  }
  validate() {
    let e = !0;
    for (let t = 0; t < this.tracks.length; t++)
      e = e && this.tracks[t].validate();
    return e;
  }
  optimize() {
    for (let e = 0; e < this.tracks.length; e++)
      this.tracks[e].optimize();
    return this;
  }
  clone() {
    const e = [];
    for (let t = 0; t < this.tracks.length; t++)
      e.push(this.tracks[t].clone());
    return new this.constructor(this.name, this.duration, e, this.blendMode);
  }
  toJSON() {
    return this.constructor.toJSON(this);
  }
}
function fp(s) {
  switch (s.toLowerCase()) {
    case "scalar":
    case "double":
    case "float":
    case "number":
    case "integer":
      return Fi;
    case "vector":
    case "vector2":
    case "vector3":
    case "vector4":
      return Oi;
    case "color":
      return rc;
    case "quaternion":
      return Bi;
    case "bool":
    case "boolean":
      return Gi;
    case "string":
      return Hi;
  }
  throw new Error("THREE.KeyframeTrack: Unsupported typeName: " + s);
}
function pp(s) {
  if (s.type === void 0)
    throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");
  const e = fp(s.type);
  if (s.times === void 0) {
    const t = [], n = [];
    ic(s.keys, t, n, "value"), s.times = t, s.values = n;
  }
  return e.parse !== void 0 ? e.parse(s) : new e(s.name, s.times, s.values, s.interpolation);
}
const Vn = {
  enabled: !1,
  files: {},
  add: function(s, e) {
    this.enabled !== !1 && (this.files[s] = e);
  },
  get: function(s) {
    if (this.enabled !== !1)
      return this.files[s];
  },
  remove: function(s) {
    delete this.files[s];
  },
  clear: function() {
    this.files = {};
  }
};
class mp {
  constructor(e, t, n) {
    const i = this;
    let r = !1, a = 0, o = 0, c;
    const l = [];
    this.onStart = void 0, this.onLoad = e, this.onProgress = t, this.onError = n, this.itemStart = function(h) {
      o++, r === !1 && i.onStart !== void 0 && i.onStart(h, a, o), r = !0;
    }, this.itemEnd = function(h) {
      a++, i.onProgress !== void 0 && i.onProgress(h, a, o), a === o && (r = !1, i.onLoad !== void 0 && i.onLoad());
    }, this.itemError = function(h) {
      i.onError !== void 0 && i.onError(h);
    }, this.resolveURL = function(h) {
      return c ? c(h) : h;
    }, this.setURLModifier = function(h) {
      return c = h, this;
    }, this.addHandler = function(h, u) {
      return l.push(h, u), this;
    }, this.removeHandler = function(h) {
      const u = l.indexOf(h);
      return u !== -1 && l.splice(u, 2), this;
    }, this.getHandler = function(h) {
      for (let u = 0, d = l.length; u < d; u += 2) {
        const f = l[u], g = l[u + 1];
        if (f.global && (f.lastIndex = 0), f.test(h))
          return g;
      }
      return null;
    };
  }
}
const ac = /* @__PURE__ */ new mp();
class Xn {
  constructor(e) {
    this.manager = e !== void 0 ? e : ac, this.crossOrigin = "anonymous", this.withCredentials = !1, this.path = "", this.resourcePath = "", this.requestHeader = {};
  }
  load() {
  }
  loadAsync(e, t) {
    const n = this;
    return new Promise(function(i, r) {
      n.load(e, i, t, r);
    });
  }
  parse() {
  }
  setCrossOrigin(e) {
    return this.crossOrigin = e, this;
  }
  setWithCredentials(e) {
    return this.withCredentials = e, this;
  }
  setPath(e) {
    return this.path = e, this;
  }
  setResourcePath(e) {
    return this.resourcePath = e, this;
  }
  setRequestHeader(e) {
    return this.requestHeader = e, this;
  }
}
Xn.DEFAULT_MATERIAL_NAME = "__DEFAULT";
const Pn = {};
class gp extends Error {
  constructor(e, t) {
    super(e), this.response = t;
  }
}
class sr extends Xn {
  constructor(e) {
    super(e);
  }
  load(e, t, n, i) {
    e === void 0 && (e = ""), this.path !== void 0 && (e = this.path + e), e = this.manager.resolveURL(e);
    const r = Vn.get(e);
    if (r !== void 0)
      return this.manager.itemStart(e), setTimeout(() => {
        t && t(r), this.manager.itemEnd(e);
      }, 0), r;
    if (Pn[e] !== void 0) {
      Pn[e].push({
        onLoad: t,
        onProgress: n,
        onError: i
      });
      return;
    }
    Pn[e] = [], Pn[e].push({
      onLoad: t,
      onProgress: n,
      onError: i
    });
    const a = new Request(e, {
      headers: new Headers(this.requestHeader),
      credentials: this.withCredentials ? "include" : "same-origin"
      // An abort controller could be added within a future PR
    }), o = this.mimeType, c = this.responseType;
    fetch(a).then((l) => {
      if (l.status === 200 || l.status === 0) {
        if (l.status === 0 && console.warn("THREE.FileLoader: HTTP Status 0 received."), typeof ReadableStream > "u" || l.body === void 0 || l.body.getReader === void 0)
          return l;
        const h = Pn[e], u = l.body.getReader(), d = l.headers.get("X-File-Size") || l.headers.get("Content-Length"), f = d ? parseInt(d) : 0, g = f !== 0;
        let _ = 0;
        const m = new ReadableStream({
          start(p) {
            E();
            function E() {
              u.read().then(({ done: y, value: A }) => {
                if (y)
                  p.close();
                else {
                  _ += A.byteLength;
                  const O = new ProgressEvent("progress", { lengthComputable: g, loaded: _, total: f });
                  for (let w = 0, R = h.length; w < R; w++) {
                    const k = h[w];
                    k.onProgress && k.onProgress(O);
                  }
                  p.enqueue(A), E();
                }
              }, (y) => {
                p.error(y);
              });
            }
          }
        });
        return new Response(m);
      } else
        throw new gp(`fetch for "${l.url}" responded with ${l.status}: ${l.statusText}`, l);
    }).then((l) => {
      switch (c) {
        case "arraybuffer":
          return l.arrayBuffer();
        case "blob":
          return l.blob();
        case "document":
          return l.text().then((h) => new DOMParser().parseFromString(h, o));
        case "json":
          return l.json();
        default:
          if (o === void 0)
            return l.text();
          {
            const u = /charset="?([^;"\s]*)"?/i.exec(o), d = u && u[1] ? u[1].toLowerCase() : void 0, f = new TextDecoder(d);
            return l.arrayBuffer().then((g) => f.decode(g));
          }
      }
    }).then((l) => {
      Vn.add(e, l);
      const h = Pn[e];
      delete Pn[e];
      for (let u = 0, d = h.length; u < d; u++) {
        const f = h[u];
        f.onLoad && f.onLoad(l);
      }
    }).catch((l) => {
      const h = Pn[e];
      if (h === void 0)
        throw this.manager.itemError(e), l;
      delete Pn[e];
      for (let u = 0, d = h.length; u < d; u++) {
        const f = h[u];
        f.onError && f.onError(l);
      }
      this.manager.itemError(e);
    }).finally(() => {
      this.manager.itemEnd(e);
    }), this.manager.itemStart(e);
  }
  setResponseType(e) {
    return this.responseType = e, this;
  }
  setMimeType(e) {
    return this.mimeType = e, this;
  }
}
class _p extends Xn {
  constructor(e) {
    super(e);
  }
  load(e, t, n, i) {
    this.path !== void 0 && (e = this.path + e), e = this.manager.resolveURL(e);
    const r = this, a = Vn.get(e);
    if (a !== void 0)
      return r.manager.itemStart(e), setTimeout(function() {
        t && t(a), r.manager.itemEnd(e);
      }, 0), a;
    const o = cs("img");
    function c() {
      h(), Vn.add(e, this), t && t(this), r.manager.itemEnd(e);
    }
    function l(u) {
      h(), i && i(u), r.manager.itemError(e), r.manager.itemEnd(e);
    }
    function h() {
      o.removeEventListener("load", c, !1), o.removeEventListener("error", l, !1);
    }
    return o.addEventListener("load", c, !1), o.addEventListener("error", l, !1), e.slice(0, 5) !== "data:" && this.crossOrigin !== void 0 && (o.crossOrigin = this.crossOrigin), r.manager.itemStart(e), o.src = e, o;
  }
}
class oc extends Xn {
  constructor(e) {
    super(e);
  }
  load(e, t, n, i) {
    const r = new It(), a = new _p(this.manager);
    return a.setCrossOrigin(this.crossOrigin), a.setPath(this.path), a.load(e, function(o) {
      r.image = o, r.needsUpdate = !0, t !== void 0 && t(r);
    }, n, i), r;
  }
}
class rr extends St {
  constructor(e, t = 1) {
    super(), this.isLight = !0, this.type = "Light", this.color = new Pe(e), this.intensity = t;
  }
  dispose() {
  }
  copy(e, t) {
    return super.copy(e, t), this.color.copy(e.color), this.intensity = e.intensity, this;
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return t.object.color = this.color.getHex(), t.object.intensity = this.intensity, this.groundColor !== void 0 && (t.object.groundColor = this.groundColor.getHex()), this.distance !== void 0 && (t.object.distance = this.distance), this.angle !== void 0 && (t.object.angle = this.angle), this.decay !== void 0 && (t.object.decay = this.decay), this.penumbra !== void 0 && (t.object.penumbra = this.penumbra), this.shadow !== void 0 && (t.object.shadow = this.shadow.toJSON()), this.target !== void 0 && (t.object.target = this.target.uuid), t;
  }
}
class xp extends rr {
  constructor(e, t, n) {
    super(e, n), this.isHemisphereLight = !0, this.type = "HemisphereLight", this.position.copy(St.DEFAULT_UP), this.updateMatrix(), this.groundColor = new Pe(t);
  }
  copy(e, t) {
    return super.copy(e, t), this.groundColor.copy(e.groundColor), this;
  }
}
const zr = /* @__PURE__ */ new qe(), To = /* @__PURE__ */ new L(), Ao = /* @__PURE__ */ new L();
class da {
  constructor(e) {
    this.camera = e, this.intensity = 1, this.bias = 0, this.normalBias = 0, this.radius = 1, this.blurSamples = 8, this.mapSize = new Xe(512, 512), this.map = null, this.mapPass = null, this.matrix = new qe(), this.autoUpdate = !0, this.needsUpdate = !1, this._frustum = new ra(), this._frameExtents = new Xe(1, 1), this._viewportCount = 1, this._viewports = [
      new ut(0, 0, 1, 1)
    ];
  }
  getViewportCount() {
    return this._viewportCount;
  }
  getFrustum() {
    return this._frustum;
  }
  updateMatrices(e) {
    const t = this.camera, n = this.matrix;
    To.setFromMatrixPosition(e.matrixWorld), t.position.copy(To), Ao.setFromMatrixPosition(e.target.matrixWorld), t.lookAt(Ao), t.updateMatrixWorld(), zr.multiplyMatrices(t.projectionMatrix, t.matrixWorldInverse), this._frustum.setFromProjectionMatrix(zr), n.set(
      0.5,
      0,
      0,
      0.5,
      0,
      0.5,
      0,
      0.5,
      0,
      0,
      0.5,
      0.5,
      0,
      0,
      0,
      1
    ), n.multiply(zr);
  }
  getViewport(e) {
    return this._viewports[e];
  }
  getFrameExtents() {
    return this._frameExtents;
  }
  dispose() {
    this.map && this.map.dispose(), this.mapPass && this.mapPass.dispose();
  }
  copy(e) {
    return this.camera = e.camera.clone(), this.intensity = e.intensity, this.bias = e.bias, this.radius = e.radius, this.mapSize.copy(e.mapSize), this;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  toJSON() {
    const e = {};
    return this.intensity !== 1 && (e.intensity = this.intensity), this.bias !== 0 && (e.bias = this.bias), this.normalBias !== 0 && (e.normalBias = this.normalBias), this.radius !== 1 && (e.radius = this.radius), (this.mapSize.x !== 512 || this.mapSize.y !== 512) && (e.mapSize = this.mapSize.toArray()), e.camera = this.camera.toJSON(!1).object, delete e.camera.matrix, e;
  }
}
class vp extends da {
  constructor() {
    super(new $t(50, 1, 0.5, 500)), this.isSpotLightShadow = !0, this.focus = 1;
  }
  updateMatrices(e) {
    const t = this.camera, n = Ui * 2 * e.angle * this.focus, i = this.mapSize.width / this.mapSize.height, r = e.distance || t.far;
    (n !== t.fov || i !== t.aspect || r !== t.far) && (t.fov = n, t.aspect = i, t.far = r, t.updateProjectionMatrix()), super.updateMatrices(e);
  }
  copy(e) {
    return super.copy(e), this.focus = e.focus, this;
  }
}
class Mp extends rr {
  constructor(e, t, n = 0, i = Math.PI / 3, r = 0, a = 2) {
    super(e, t), this.isSpotLight = !0, this.type = "SpotLight", this.position.copy(St.DEFAULT_UP), this.updateMatrix(), this.target = new St(), this.distance = n, this.angle = i, this.penumbra = r, this.decay = a, this.map = null, this.shadow = new vp();
  }
  get power() {
    return this.intensity * Math.PI;
  }
  set power(e) {
    this.intensity = e / Math.PI;
  }
  dispose() {
    this.shadow.dispose();
  }
  copy(e, t) {
    return super.copy(e, t), this.distance = e.distance, this.angle = e.angle, this.penumbra = e.penumbra, this.decay = e.decay, this.target = e.target.clone(), this.shadow = e.shadow.clone(), this;
  }
}
const bo = /* @__PURE__ */ new qe(), is = /* @__PURE__ */ new L(), Gr = /* @__PURE__ */ new L();
class yp extends da {
  constructor() {
    super(new $t(90, 1, 0.5, 500)), this.isPointLightShadow = !0, this._frameExtents = new Xe(4, 2), this._viewportCount = 6, this._viewports = [
      // These viewports map a cube-map onto a 2D texture with the
      // following orientation:
      //
      //  xzXZ
      //   y Y
      //
      // X - Positive x direction
      // x - Negative x direction
      // Y - Positive y direction
      // y - Negative y direction
      // Z - Positive z direction
      // z - Negative z direction
      // positive X
      new ut(2, 1, 1, 1),
      // negative X
      new ut(0, 1, 1, 1),
      // positive Z
      new ut(3, 1, 1, 1),
      // negative Z
      new ut(1, 1, 1, 1),
      // positive Y
      new ut(3, 0, 1, 1),
      // negative Y
      new ut(1, 0, 1, 1)
    ], this._cubeDirections = [
      new L(1, 0, 0),
      new L(-1, 0, 0),
      new L(0, 0, 1),
      new L(0, 0, -1),
      new L(0, 1, 0),
      new L(0, -1, 0)
    ], this._cubeUps = [
      new L(0, 1, 0),
      new L(0, 1, 0),
      new L(0, 1, 0),
      new L(0, 1, 0),
      new L(0, 0, 1),
      new L(0, 0, -1)
    ];
  }
  updateMatrices(e, t = 0) {
    const n = this.camera, i = this.matrix, r = e.distance || n.far;
    r !== n.far && (n.far = r, n.updateProjectionMatrix()), is.setFromMatrixPosition(e.matrixWorld), n.position.copy(is), Gr.copy(n.position), Gr.add(this._cubeDirections[t]), n.up.copy(this._cubeUps[t]), n.lookAt(Gr), n.updateMatrixWorld(), i.makeTranslation(-is.x, -is.y, -is.z), bo.multiplyMatrices(n.projectionMatrix, n.matrixWorldInverse), this._frustum.setFromProjectionMatrix(bo);
  }
}
class Sp extends rr {
  constructor(e, t, n = 0, i = 2) {
    super(e, t), this.isPointLight = !0, this.type = "PointLight", this.distance = n, this.decay = i, this.shadow = new yp();
  }
  get power() {
    return this.intensity * 4 * Math.PI;
  }
  set power(e) {
    this.intensity = e / (4 * Math.PI);
  }
  dispose() {
    this.shadow.dispose();
  }
  copy(e, t) {
    return super.copy(e, t), this.distance = e.distance, this.decay = e.decay, this.shadow = e.shadow.clone(), this;
  }
}
class Ep extends da {
  constructor() {
    super(new nr(-5, 5, 5, -5, 0.5, 500)), this.isDirectionalLightShadow = !0;
  }
}
class cc extends rr {
  constructor(e, t) {
    super(e, t), this.isDirectionalLight = !0, this.type = "DirectionalLight", this.position.copy(St.DEFAULT_UP), this.updateMatrix(), this.target = new St(), this.shadow = new Ep();
  }
  dispose() {
    this.shadow.dispose();
  }
  copy(e) {
    return super.copy(e), this.target = e.target.clone(), this.shadow = e.shadow.clone(), this;
  }
}
class Li {
  static decodeText(e) {
    if (console.warn("THREE.LoaderUtils: decodeText() has been deprecated with r165 and will be removed with r175. Use TextDecoder instead."), typeof TextDecoder < "u")
      return new TextDecoder().decode(e);
    let t = "";
    for (let n = 0, i = e.length; n < i; n++)
      t += String.fromCharCode(e[n]);
    try {
      return decodeURIComponent(escape(t));
    } catch {
      return t;
    }
  }
  static extractUrlBase(e) {
    const t = e.lastIndexOf("/");
    return t === -1 ? "./" : e.slice(0, t + 1);
  }
  static resolveURL(e, t) {
    return typeof e != "string" || e === "" ? "" : (/^https?:\/\//i.test(t) && /^\//.test(e) && (t = t.replace(/(^https?:\/\/[^\/]+).*/i, "$1")), /^(https?:)?\/\//i.test(e) || /^data:.*,.*$/i.test(e) || /^blob:.*$/i.test(e) ? e : t + e);
  }
}
class Tp extends Xn {
  constructor(e) {
    super(e), this.isImageBitmapLoader = !0, typeof createImageBitmap > "u" && console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."), typeof fetch > "u" && console.warn("THREE.ImageBitmapLoader: fetch() not supported."), this.options = { premultiplyAlpha: "none" };
  }
  setOptions(e) {
    return this.options = e, this;
  }
  load(e, t, n, i) {
    e === void 0 && (e = ""), this.path !== void 0 && (e = this.path + e), e = this.manager.resolveURL(e);
    const r = this, a = Vn.get(e);
    if (a !== void 0) {
      if (r.manager.itemStart(e), a.then) {
        a.then((l) => {
          t && t(l), r.manager.itemEnd(e);
        }).catch((l) => {
          i && i(l);
        });
        return;
      }
      return setTimeout(function() {
        t && t(a), r.manager.itemEnd(e);
      }, 0), a;
    }
    const o = {};
    o.credentials = this.crossOrigin === "anonymous" ? "same-origin" : "include", o.headers = this.requestHeader;
    const c = fetch(e, o).then(function(l) {
      return l.blob();
    }).then(function(l) {
      return createImageBitmap(l, Object.assign(r.options, { colorSpaceConversion: "none" }));
    }).then(function(l) {
      return Vn.add(e, l), t && t(l), r.manager.itemEnd(e), l;
    }).catch(function(l) {
      i && i(l), Vn.remove(e), r.manager.itemError(e), r.manager.itemEnd(e);
    });
    Vn.add(e, c), r.manager.itemStart(e);
  }
}
class Ap {
  constructor(e = !0) {
    this.autoStart = e, this.startTime = 0, this.oldTime = 0, this.elapsedTime = 0, this.running = !1;
  }
  start() {
    this.startTime = wo(), this.oldTime = this.startTime, this.elapsedTime = 0, this.running = !0;
  }
  stop() {
    this.getElapsedTime(), this.running = !1, this.autoStart = !1;
  }
  getElapsedTime() {
    return this.getDelta(), this.elapsedTime;
  }
  getDelta() {
    let e = 0;
    if (this.autoStart && !this.running)
      return this.start(), 0;
    if (this.running) {
      const t = wo();
      e = (t - this.oldTime) / 1e3, this.oldTime = t, this.elapsedTime += e;
    }
    return e;
  }
}
function wo() {
  return performance.now();
}
class bp {
  constructor(e, t, n) {
    this.binding = e, this.valueSize = n;
    let i, r, a;
    switch (t) {
      case "quaternion":
        i = this._slerp, r = this._slerpAdditive, a = this._setAdditiveIdentityQuaternion, this.buffer = new Float64Array(n * 6), this._workIndex = 5;
        break;
      case "string":
      case "bool":
        i = this._select, r = this._select, a = this._setAdditiveIdentityOther, this.buffer = new Array(n * 5);
        break;
      default:
        i = this._lerp, r = this._lerpAdditive, a = this._setAdditiveIdentityNumeric, this.buffer = new Float64Array(n * 5);
    }
    this._mixBufferRegion = i, this._mixBufferRegionAdditive = r, this._setIdentity = a, this._origIndex = 3, this._addIndex = 4, this.cumulativeWeight = 0, this.cumulativeWeightAdditive = 0, this.useCount = 0, this.referenceCount = 0;
  }
  // accumulate data in the 'incoming' region into 'accu<i>'
  accumulate(e, t) {
    const n = this.buffer, i = this.valueSize, r = e * i + i;
    let a = this.cumulativeWeight;
    if (a === 0) {
      for (let o = 0; o !== i; ++o)
        n[r + o] = n[o];
      a = t;
    } else {
      a += t;
      const o = t / a;
      this._mixBufferRegion(n, r, 0, o, i);
    }
    this.cumulativeWeight = a;
  }
  // accumulate data in the 'incoming' region into 'add'
  accumulateAdditive(e) {
    const t = this.buffer, n = this.valueSize, i = n * this._addIndex;
    this.cumulativeWeightAdditive === 0 && this._setIdentity(), this._mixBufferRegionAdditive(t, i, 0, e, n), this.cumulativeWeightAdditive += e;
  }
  // apply the state of 'accu<i>' to the binding when accus differ
  apply(e) {
    const t = this.valueSize, n = this.buffer, i = e * t + t, r = this.cumulativeWeight, a = this.cumulativeWeightAdditive, o = this.binding;
    if (this.cumulativeWeight = 0, this.cumulativeWeightAdditive = 0, r < 1) {
      const c = t * this._origIndex;
      this._mixBufferRegion(
        n,
        i,
        c,
        1 - r,
        t
      );
    }
    a > 0 && this._mixBufferRegionAdditive(n, i, this._addIndex * t, 1, t);
    for (let c = t, l = t + t; c !== l; ++c)
      if (n[c] !== n[c + t]) {
        o.setValue(n, i);
        break;
      }
  }
  // remember the state of the bound property and copy it to both accus
  saveOriginalState() {
    const e = this.binding, t = this.buffer, n = this.valueSize, i = n * this._origIndex;
    e.getValue(t, i);
    for (let r = n, a = i; r !== a; ++r)
      t[r] = t[i + r % n];
    this._setIdentity(), this.cumulativeWeight = 0, this.cumulativeWeightAdditive = 0;
  }
  // apply the state previously taken via 'saveOriginalState' to the binding
  restoreOriginalState() {
    const e = this.valueSize * 3;
    this.binding.setValue(this.buffer, e);
  }
  _setAdditiveIdentityNumeric() {
    const e = this._addIndex * this.valueSize, t = e + this.valueSize;
    for (let n = e; n < t; n++)
      this.buffer[n] = 0;
  }
  _setAdditiveIdentityQuaternion() {
    this._setAdditiveIdentityNumeric(), this.buffer[this._addIndex * this.valueSize + 3] = 1;
  }
  _setAdditiveIdentityOther() {
    const e = this._origIndex * this.valueSize, t = this._addIndex * this.valueSize;
    for (let n = 0; n < this.valueSize; n++)
      this.buffer[t + n] = this.buffer[e + n];
  }
  // mix functions
  _select(e, t, n, i, r) {
    if (i >= 0.5)
      for (let a = 0; a !== r; ++a)
        e[t + a] = e[n + a];
  }
  _slerp(e, t, n, i) {
    _n.slerpFlat(e, t, e, t, e, n, i);
  }
  _slerpAdditive(e, t, n, i, r) {
    const a = this._workIndex * r;
    _n.multiplyQuaternionsFlat(e, a, e, t, e, n), _n.slerpFlat(e, t, e, t, e, a, i);
  }
  _lerp(e, t, n, i, r) {
    const a = 1 - i;
    for (let o = 0; o !== r; ++o) {
      const c = t + o;
      e[c] = e[c] * a + e[n + o] * i;
    }
  }
  _lerpAdditive(e, t, n, i, r) {
    for (let a = 0; a !== r; ++a) {
      const o = t + a;
      e[o] = e[o] + e[n + a] * i;
    }
  }
}
const fa = "\\[\\]\\.:\\/", wp = new RegExp("[" + fa + "]", "g"), pa = "[^" + fa + "]", Rp = "[^" + fa.replace("\\.", "") + "]", Cp = /* @__PURE__ */ /((?:WC+[\/:])*)/.source.replace("WC", pa), Ip = /* @__PURE__ */ /(WCOD+)?/.source.replace("WCOD", Rp), Pp = /* @__PURE__ */ /(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC", pa), Lp = /* @__PURE__ */ /\.(WC+)(?:\[(.+)\])?/.source.replace("WC", pa), Dp = new RegExp(
  "^" + Cp + Ip + Pp + Lp + "$"
), Up = ["material", "materials", "bones", "map"];
class Np {
  constructor(e, t, n) {
    const i = n || pt.parseTrackName(t);
    this._targetGroup = e, this._bindings = e.subscribe_(t, i);
  }
  getValue(e, t) {
    this.bind();
    const n = this._targetGroup.nCachedObjects_, i = this._bindings[n];
    i !== void 0 && i.getValue(e, t);
  }
  setValue(e, t) {
    const n = this._bindings;
    for (let i = this._targetGroup.nCachedObjects_, r = n.length; i !== r; ++i)
      n[i].setValue(e, t);
  }
  bind() {
    const e = this._bindings;
    for (let t = this._targetGroup.nCachedObjects_, n = e.length; t !== n; ++t)
      e[t].bind();
  }
  unbind() {
    const e = this._bindings;
    for (let t = this._targetGroup.nCachedObjects_, n = e.length; t !== n; ++t)
      e[t].unbind();
  }
}
class pt {
  constructor(e, t, n) {
    this.path = t, this.parsedPath = n || pt.parseTrackName(t), this.node = pt.findNode(e, this.parsedPath.nodeName), this.rootNode = e, this.getValue = this._getValue_unbound, this.setValue = this._setValue_unbound;
  }
  static create(e, t, n) {
    return e && e.isAnimationObjectGroup ? new pt.Composite(e, t, n) : new pt(e, t, n);
  }
  /**
   * Replaces spaces with underscores and removes unsupported characters from
   * node names, to ensure compatibility with parseTrackName().
   *
   * @param {string} name Node name to be sanitized.
   * @return {string}
   */
  static sanitizeNodeName(e) {
    return e.replace(/\s/g, "_").replace(wp, "");
  }
  static parseTrackName(e) {
    const t = Dp.exec(e);
    if (t === null)
      throw new Error("PropertyBinding: Cannot parse trackName: " + e);
    const n = {
      // directoryName: matches[ 1 ], // (tschw) currently unused
      nodeName: t[2],
      objectName: t[3],
      objectIndex: t[4],
      propertyName: t[5],
      // required
      propertyIndex: t[6]
    }, i = n.nodeName && n.nodeName.lastIndexOf(".");
    if (i !== void 0 && i !== -1) {
      const r = n.nodeName.substring(i + 1);
      Up.indexOf(r) !== -1 && (n.nodeName = n.nodeName.substring(0, i), n.objectName = r);
    }
    if (n.propertyName === null || n.propertyName.length === 0)
      throw new Error("PropertyBinding: can not parse propertyName from trackName: " + e);
    return n;
  }
  static findNode(e, t) {
    if (t === void 0 || t === "" || t === "." || t === -1 || t === e.name || t === e.uuid)
      return e;
    if (e.skeleton) {
      const n = e.skeleton.getBoneByName(t);
      if (n !== void 0)
        return n;
    }
    if (e.children) {
      const n = function(r) {
        for (let a = 0; a < r.length; a++) {
          const o = r[a];
          if (o.name === t || o.uuid === t)
            return o;
          const c = n(o.children);
          if (c) return c;
        }
        return null;
      }, i = n(e.children);
      if (i)
        return i;
    }
    return null;
  }
  // these are used to "bind" a nonexistent property
  _getValue_unavailable() {
  }
  _setValue_unavailable() {
  }
  // Getters
  _getValue_direct(e, t) {
    e[t] = this.targetObject[this.propertyName];
  }
  _getValue_array(e, t) {
    const n = this.resolvedProperty;
    for (let i = 0, r = n.length; i !== r; ++i)
      e[t++] = n[i];
  }
  _getValue_arrayElement(e, t) {
    e[t] = this.resolvedProperty[this.propertyIndex];
  }
  _getValue_toArray(e, t) {
    this.resolvedProperty.toArray(e, t);
  }
  // Direct
  _setValue_direct(e, t) {
    this.targetObject[this.propertyName] = e[t];
  }
  _setValue_direct_setNeedsUpdate(e, t) {
    this.targetObject[this.propertyName] = e[t], this.targetObject.needsUpdate = !0;
  }
  _setValue_direct_setMatrixWorldNeedsUpdate(e, t) {
    this.targetObject[this.propertyName] = e[t], this.targetObject.matrixWorldNeedsUpdate = !0;
  }
  // EntireArray
  _setValue_array(e, t) {
    const n = this.resolvedProperty;
    for (let i = 0, r = n.length; i !== r; ++i)
      n[i] = e[t++];
  }
  _setValue_array_setNeedsUpdate(e, t) {
    const n = this.resolvedProperty;
    for (let i = 0, r = n.length; i !== r; ++i)
      n[i] = e[t++];
    this.targetObject.needsUpdate = !0;
  }
  _setValue_array_setMatrixWorldNeedsUpdate(e, t) {
    const n = this.resolvedProperty;
    for (let i = 0, r = n.length; i !== r; ++i)
      n[i] = e[t++];
    this.targetObject.matrixWorldNeedsUpdate = !0;
  }
  // ArrayElement
  _setValue_arrayElement(e, t) {
    this.resolvedProperty[this.propertyIndex] = e[t];
  }
  _setValue_arrayElement_setNeedsUpdate(e, t) {
    this.resolvedProperty[this.propertyIndex] = e[t], this.targetObject.needsUpdate = !0;
  }
  _setValue_arrayElement_setMatrixWorldNeedsUpdate(e, t) {
    this.resolvedProperty[this.propertyIndex] = e[t], this.targetObject.matrixWorldNeedsUpdate = !0;
  }
  // HasToFromArray
  _setValue_fromArray(e, t) {
    this.resolvedProperty.fromArray(e, t);
  }
  _setValue_fromArray_setNeedsUpdate(e, t) {
    this.resolvedProperty.fromArray(e, t), this.targetObject.needsUpdate = !0;
  }
  _setValue_fromArray_setMatrixWorldNeedsUpdate(e, t) {
    this.resolvedProperty.fromArray(e, t), this.targetObject.matrixWorldNeedsUpdate = !0;
  }
  _getValue_unbound(e, t) {
    this.bind(), this.getValue(e, t);
  }
  _setValue_unbound(e, t) {
    this.bind(), this.setValue(e, t);
  }
  // create getter / setter pair for a property in the scene graph
  bind() {
    let e = this.node;
    const t = this.parsedPath, n = t.objectName, i = t.propertyName;
    let r = t.propertyIndex;
    if (e || (e = pt.findNode(this.rootNode, t.nodeName), this.node = e), this.getValue = this._getValue_unavailable, this.setValue = this._setValue_unavailable, !e) {
      console.warn("THREE.PropertyBinding: No target node found for track: " + this.path + ".");
      return;
    }
    if (n) {
      let l = t.objectIndex;
      switch (n) {
        case "materials":
          if (!e.material) {
            console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.", this);
            return;
          }
          if (!e.material.materials) {
            console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.", this);
            return;
          }
          e = e.material.materials;
          break;
        case "bones":
          if (!e.skeleton) {
            console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.", this);
            return;
          }
          e = e.skeleton.bones;
          for (let h = 0; h < e.length; h++)
            if (e[h].name === l) {
              l = h;
              break;
            }
          break;
        case "map":
          if ("map" in e) {
            e = e.map;
            break;
          }
          if (!e.material) {
            console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.", this);
            return;
          }
          if (!e.material.map) {
            console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.", this);
            return;
          }
          e = e.material.map;
          break;
        default:
          if (e[n] === void 0) {
            console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.", this);
            return;
          }
          e = e[n];
      }
      if (l !== void 0) {
        if (e[l] === void 0) {
          console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.", this, e);
          return;
        }
        e = e[l];
      }
    }
    const a = e[i];
    if (a === void 0) {
      const l = t.nodeName;
      console.error("THREE.PropertyBinding: Trying to update property for track: " + l + "." + i + " but it wasn't found.", e);
      return;
    }
    let o = this.Versioning.None;
    this.targetObject = e, e.needsUpdate !== void 0 ? o = this.Versioning.NeedsUpdate : e.matrixWorldNeedsUpdate !== void 0 && (o = this.Versioning.MatrixWorldNeedsUpdate);
    let c = this.BindingType.Direct;
    if (r !== void 0) {
      if (i === "morphTargetInfluences") {
        if (!e.geometry) {
          console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.", this);
          return;
        }
        if (!e.geometry.morphAttributes) {
          console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.", this);
          return;
        }
        e.morphTargetDictionary[r] !== void 0 && (r = e.morphTargetDictionary[r]);
      }
      c = this.BindingType.ArrayElement, this.resolvedProperty = a, this.propertyIndex = r;
    } else a.fromArray !== void 0 && a.toArray !== void 0 ? (c = this.BindingType.HasFromToArray, this.resolvedProperty = a) : Array.isArray(a) ? (c = this.BindingType.EntireArray, this.resolvedProperty = a) : this.propertyName = i;
    this.getValue = this.GetterByBindingType[c], this.setValue = this.SetterByBindingTypeAndVersioning[c][o];
  }
  unbind() {
    this.node = null, this.getValue = this._getValue_unbound, this.setValue = this._setValue_unbound;
  }
}
pt.Composite = Np;
pt.prototype.BindingType = {
  Direct: 0,
  EntireArray: 1,
  ArrayElement: 2,
  HasFromToArray: 3
};
pt.prototype.Versioning = {
  None: 0,
  NeedsUpdate: 1,
  MatrixWorldNeedsUpdate: 2
};
pt.prototype.GetterByBindingType = [
  pt.prototype._getValue_direct,
  pt.prototype._getValue_array,
  pt.prototype._getValue_arrayElement,
  pt.prototype._getValue_toArray
];
pt.prototype.SetterByBindingTypeAndVersioning = [
  [
    // Direct
    pt.prototype._setValue_direct,
    pt.prototype._setValue_direct_setNeedsUpdate,
    pt.prototype._setValue_direct_setMatrixWorldNeedsUpdate
  ],
  [
    // EntireArray
    pt.prototype._setValue_array,
    pt.prototype._setValue_array_setNeedsUpdate,
    pt.prototype._setValue_array_setMatrixWorldNeedsUpdate
  ],
  [
    // ArrayElement
    pt.prototype._setValue_arrayElement,
    pt.prototype._setValue_arrayElement_setNeedsUpdate,
    pt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate
  ],
  [
    // HasToFromArray
    pt.prototype._setValue_fromArray,
    pt.prototype._setValue_fromArray_setNeedsUpdate,
    pt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate
  ]
];
class Fp {
  constructor(e, t, n = null, i = t.blendMode) {
    this._mixer = e, this._clip = t, this._localRoot = n, this.blendMode = i;
    const r = t.tracks, a = r.length, o = new Array(a), c = {
      endingStart: 2400,
      endingEnd: 2400
    };
    for (let l = 0; l !== a; ++l) {
      const h = r[l].createInterpolant(null);
      o[l] = h, h.settings = c;
    }
    this._interpolantSettings = c, this._interpolants = o, this._propertyBindings = new Array(a), this._cacheIndex = null, this._byClipCacheIndex = null, this._timeScaleInterpolant = null, this._weightInterpolant = null, this.loop = 2201, this._loopCount = -1, this._startTime = null, this.time = 0, this.timeScale = 1, this._effectiveTimeScale = 1, this.weight = 1, this._effectiveWeight = 1, this.repetitions = 1 / 0, this.paused = !1, this.enabled = !0, this.clampWhenFinished = !1, this.zeroSlopeAtStart = !0, this.zeroSlopeAtEnd = !0;
  }
  // State & Scheduling
  play() {
    return this._mixer._activateAction(this), this;
  }
  stop() {
    return this._mixer._deactivateAction(this), this.reset();
  }
  reset() {
    return this.paused = !1, this.enabled = !0, this.time = 0, this._loopCount = -1, this._startTime = null, this.stopFading().stopWarping();
  }
  isRunning() {
    return this.enabled && !this.paused && this.timeScale !== 0 && this._startTime === null && this._mixer._isActiveAction(this);
  }
  // return true when play has been called
  isScheduled() {
    return this._mixer._isActiveAction(this);
  }
  startAt(e) {
    return this._startTime = e, this;
  }
  setLoop(e, t) {
    return this.loop = e, this.repetitions = t, this;
  }
  // Weight
  // set the weight stopping any scheduled fading
  // although .enabled = false yields an effective weight of zero, this
  // method does *not* change .enabled, because it would be confusing
  setEffectiveWeight(e) {
    return this.weight = e, this._effectiveWeight = this.enabled ? e : 0, this.stopFading();
  }
  // return the weight considering fading and .enabled
  getEffectiveWeight() {
    return this._effectiveWeight;
  }
  fadeIn(e) {
    return this._scheduleFading(e, 0, 1);
  }
  fadeOut(e) {
    return this._scheduleFading(e, 1, 0);
  }
  crossFadeFrom(e, t, n) {
    if (e.fadeOut(t), this.fadeIn(t), n) {
      const i = this._clip.duration, r = e._clip.duration, a = r / i, o = i / r;
      e.warp(1, a, t), this.warp(o, 1, t);
    }
    return this;
  }
  crossFadeTo(e, t, n) {
    return e.crossFadeFrom(this, t, n);
  }
  stopFading() {
    const e = this._weightInterpolant;
    return e !== null && (this._weightInterpolant = null, this._mixer._takeBackControlInterpolant(e)), this;
  }
  // Time Scale Control
  // set the time scale stopping any scheduled warping
  // although .paused = true yields an effective time scale of zero, this
  // method does *not* change .paused, because it would be confusing
  setEffectiveTimeScale(e) {
    return this.timeScale = e, this._effectiveTimeScale = this.paused ? 0 : e, this.stopWarping();
  }
  // return the time scale considering warping and .paused
  getEffectiveTimeScale() {
    return this._effectiveTimeScale;
  }
  setDuration(e) {
    return this.timeScale = this._clip.duration / e, this.stopWarping();
  }
  syncWith(e) {
    return this.time = e.time, this.timeScale = e.timeScale, this.stopWarping();
  }
  halt(e) {
    return this.warp(this._effectiveTimeScale, 0, e);
  }
  warp(e, t, n) {
    const i = this._mixer, r = i.time, a = this.timeScale;
    let o = this._timeScaleInterpolant;
    o === null && (o = i._lendControlInterpolant(), this._timeScaleInterpolant = o);
    const c = o.parameterPositions, l = o.sampleValues;
    return c[0] = r, c[1] = r + n, l[0] = e / a, l[1] = t / a, this;
  }
  stopWarping() {
    const e = this._timeScaleInterpolant;
    return e !== null && (this._timeScaleInterpolant = null, this._mixer._takeBackControlInterpolant(e)), this;
  }
  // Object Accessors
  getMixer() {
    return this._mixer;
  }
  getClip() {
    return this._clip;
  }
  getRoot() {
    return this._localRoot || this._mixer._root;
  }
  // Interna
  _update(e, t, n, i) {
    if (!this.enabled) {
      this._updateWeight(e);
      return;
    }
    const r = this._startTime;
    if (r !== null) {
      const c = (e - r) * n;
      c < 0 || n === 0 ? t = 0 : (this._startTime = null, t = n * c);
    }
    t *= this._updateTimeScale(e);
    const a = this._updateTime(t), o = this._updateWeight(e);
    if (o > 0) {
      const c = this._interpolants, l = this._propertyBindings;
      switch (this.blendMode) {
        case 2501:
          for (let h = 0, u = c.length; h !== u; ++h)
            c[h].evaluate(a), l[h].accumulateAdditive(o);
          break;
        case 2500:
        default:
          for (let h = 0, u = c.length; h !== u; ++h)
            c[h].evaluate(a), l[h].accumulate(i, o);
      }
    }
  }
  _updateWeight(e) {
    let t = 0;
    if (this.enabled) {
      t = this.weight;
      const n = this._weightInterpolant;
      if (n !== null) {
        const i = n.evaluate(e)[0];
        t *= i, e > n.parameterPositions[1] && (this.stopFading(), i === 0 && (this.enabled = !1));
      }
    }
    return this._effectiveWeight = t, t;
  }
  _updateTimeScale(e) {
    let t = 0;
    if (!this.paused) {
      t = this.timeScale;
      const n = this._timeScaleInterpolant;
      if (n !== null) {
        const i = n.evaluate(e)[0];
        t *= i, e > n.parameterPositions[1] && (this.stopWarping(), t === 0 ? this.paused = !0 : this.timeScale = t);
      }
    }
    return this._effectiveTimeScale = t, t;
  }
  _updateTime(e) {
    const t = this._clip.duration, n = this.loop;
    let i = this.time + e, r = this._loopCount;
    const a = n === 2202;
    if (e === 0)
      return r === -1 ? i : a && (r & 1) === 1 ? t - i : i;
    if (n === 2200) {
      r === -1 && (this._loopCount = 0, this._setEndings(!0, !0, !1));
      e: {
        if (i >= t)
          i = t;
        else if (i < 0)
          i = 0;
        else {
          this.time = i;
          break e;
        }
        this.clampWhenFinished ? this.paused = !0 : this.enabled = !1, this.time = i, this._mixer.dispatchEvent({
          type: "finished",
          action: this,
          direction: e < 0 ? -1 : 1
        });
      }
    } else {
      if (r === -1 && (e >= 0 ? (r = 0, this._setEndings(!0, this.repetitions === 0, a)) : this._setEndings(this.repetitions === 0, !0, a)), i >= t || i < 0) {
        const o = Math.floor(i / t);
        i -= t * o, r += Math.abs(o);
        const c = this.repetitions - r;
        if (c <= 0)
          this.clampWhenFinished ? this.paused = !0 : this.enabled = !1, i = e > 0 ? t : 0, this.time = i, this._mixer.dispatchEvent({
            type: "finished",
            action: this,
            direction: e > 0 ? 1 : -1
          });
        else {
          if (c === 1) {
            const l = e < 0;
            this._setEndings(l, !l, a);
          } else
            this._setEndings(!1, !1, a);
          this._loopCount = r, this.time = i, this._mixer.dispatchEvent({
            type: "loop",
            action: this,
            loopDelta: o
          });
        }
      } else
        this.time = i;
      if (a && (r & 1) === 1)
        return t - i;
    }
    return i;
  }
  _setEndings(e, t, n) {
    const i = this._interpolantSettings;
    n ? (i.endingStart = 2401, i.endingEnd = 2401) : (e ? i.endingStart = this.zeroSlopeAtStart ? 2401 : 2400 : i.endingStart = 2402, t ? i.endingEnd = this.zeroSlopeAtEnd ? 2401 : 2400 : i.endingEnd = 2402);
  }
  _scheduleFading(e, t, n) {
    const i = this._mixer, r = i.time;
    let a = this._weightInterpolant;
    a === null && (a = i._lendControlInterpolant(), this._weightInterpolant = a);
    const o = a.parameterPositions, c = a.sampleValues;
    return o[0] = r, c[0] = t, o[1] = r + e, c[1] = n, this;
  }
}
const Bp = new Float32Array(1);
class Op extends ri {
  constructor(e) {
    super(), this._root = e, this._initMemoryManager(), this._accuIndex = 0, this.time = 0, this.timeScale = 1;
  }
  _bindAction(e, t) {
    const n = e._localRoot || this._root, i = e._clip.tracks, r = i.length, a = e._propertyBindings, o = e._interpolants, c = n.uuid, l = this._bindingsByRootAndName;
    let h = l[c];
    h === void 0 && (h = {}, l[c] = h);
    for (let u = 0; u !== r; ++u) {
      const d = i[u], f = d.name;
      let g = h[f];
      if (g !== void 0)
        ++g.referenceCount, a[u] = g;
      else {
        if (g = a[u], g !== void 0) {
          g._cacheIndex === null && (++g.referenceCount, this._addInactiveBinding(g, c, f));
          continue;
        }
        const _ = t && t._propertyBindings[u].binding.parsedPath;
        g = new bp(
          pt.create(n, f, _),
          d.ValueTypeName,
          d.getValueSize()
        ), ++g.referenceCount, this._addInactiveBinding(g, c, f), a[u] = g;
      }
      o[u].resultBuffer = g.buffer;
    }
  }
  _activateAction(e) {
    if (!this._isActiveAction(e)) {
      if (e._cacheIndex === null) {
        const n = (e._localRoot || this._root).uuid, i = e._clip.uuid, r = this._actionsByClip[i];
        this._bindAction(
          e,
          r && r.knownActions[0]
        ), this._addInactiveAction(e, i, n);
      }
      const t = e._propertyBindings;
      for (let n = 0, i = t.length; n !== i; ++n) {
        const r = t[n];
        r.useCount++ === 0 && (this._lendBinding(r), r.saveOriginalState());
      }
      this._lendAction(e);
    }
  }
  _deactivateAction(e) {
    if (this._isActiveAction(e)) {
      const t = e._propertyBindings;
      for (let n = 0, i = t.length; n !== i; ++n) {
        const r = t[n];
        --r.useCount === 0 && (r.restoreOriginalState(), this._takeBackBinding(r));
      }
      this._takeBackAction(e);
    }
  }
  // Memory manager
  _initMemoryManager() {
    this._actions = [], this._nActiveActions = 0, this._actionsByClip = {}, this._bindings = [], this._nActiveBindings = 0, this._bindingsByRootAndName = {}, this._controlInterpolants = [], this._nActiveControlInterpolants = 0;
    const e = this;
    this.stats = {
      actions: {
        get total() {
          return e._actions.length;
        },
        get inUse() {
          return e._nActiveActions;
        }
      },
      bindings: {
        get total() {
          return e._bindings.length;
        },
        get inUse() {
          return e._nActiveBindings;
        }
      },
      controlInterpolants: {
        get total() {
          return e._controlInterpolants.length;
        },
        get inUse() {
          return e._nActiveControlInterpolants;
        }
      }
    };
  }
  // Memory management for AnimationAction objects
  _isActiveAction(e) {
    const t = e._cacheIndex;
    return t !== null && t < this._nActiveActions;
  }
  _addInactiveAction(e, t, n) {
    const i = this._actions, r = this._actionsByClip;
    let a = r[t];
    if (a === void 0)
      a = {
        knownActions: [e],
        actionByRoot: {}
      }, e._byClipCacheIndex = 0, r[t] = a;
    else {
      const o = a.knownActions;
      e._byClipCacheIndex = o.length, o.push(e);
    }
    e._cacheIndex = i.length, i.push(e), a.actionByRoot[n] = e;
  }
  _removeInactiveAction(e) {
    const t = this._actions, n = t[t.length - 1], i = e._cacheIndex;
    n._cacheIndex = i, t[i] = n, t.pop(), e._cacheIndex = null;
    const r = e._clip.uuid, a = this._actionsByClip, o = a[r], c = o.knownActions, l = c[c.length - 1], h = e._byClipCacheIndex;
    l._byClipCacheIndex = h, c[h] = l, c.pop(), e._byClipCacheIndex = null;
    const u = o.actionByRoot, d = (e._localRoot || this._root).uuid;
    delete u[d], c.length === 0 && delete a[r], this._removeInactiveBindingsForAction(e);
  }
  _removeInactiveBindingsForAction(e) {
    const t = e._propertyBindings;
    for (let n = 0, i = t.length; n !== i; ++n) {
      const r = t[n];
      --r.referenceCount === 0 && this._removeInactiveBinding(r);
    }
  }
  _lendAction(e) {
    const t = this._actions, n = e._cacheIndex, i = this._nActiveActions++, r = t[i];
    e._cacheIndex = i, t[i] = e, r._cacheIndex = n, t[n] = r;
  }
  _takeBackAction(e) {
    const t = this._actions, n = e._cacheIndex, i = --this._nActiveActions, r = t[i];
    e._cacheIndex = i, t[i] = e, r._cacheIndex = n, t[n] = r;
  }
  // Memory management for PropertyMixer objects
  _addInactiveBinding(e, t, n) {
    const i = this._bindingsByRootAndName, r = this._bindings;
    let a = i[t];
    a === void 0 && (a = {}, i[t] = a), a[n] = e, e._cacheIndex = r.length, r.push(e);
  }
  _removeInactiveBinding(e) {
    const t = this._bindings, n = e.binding, i = n.rootNode.uuid, r = n.path, a = this._bindingsByRootAndName, o = a[i], c = t[t.length - 1], l = e._cacheIndex;
    c._cacheIndex = l, t[l] = c, t.pop(), delete o[r], Object.keys(o).length === 0 && delete a[i];
  }
  _lendBinding(e) {
    const t = this._bindings, n = e._cacheIndex, i = this._nActiveBindings++, r = t[i];
    e._cacheIndex = i, t[i] = e, r._cacheIndex = n, t[n] = r;
  }
  _takeBackBinding(e) {
    const t = this._bindings, n = e._cacheIndex, i = --this._nActiveBindings, r = t[i];
    e._cacheIndex = i, t[i] = e, r._cacheIndex = n, t[n] = r;
  }
  // Memory management of Interpolants for weight and time scale
  _lendControlInterpolant() {
    const e = this._controlInterpolants, t = this._nActiveControlInterpolants++;
    let n = e[t];
    return n === void 0 && (n = new sc(
      new Float32Array(2),
      new Float32Array(2),
      1,
      Bp
    ), n.__cacheIndex = t, e[t] = n), n;
  }
  _takeBackControlInterpolant(e) {
    const t = this._controlInterpolants, n = e.__cacheIndex, i = --this._nActiveControlInterpolants, r = t[i];
    e.__cacheIndex = i, t[i] = e, r.__cacheIndex = n, t[n] = r;
  }
  // return an action for a clip optionally using a custom root target
  // object (this method allocates a lot of dynamic memory in case a
  // previously unknown clip/root combination is specified)
  clipAction(e, t, n) {
    const i = t || this._root, r = i.uuid;
    let a = typeof e == "string" ? $r.findByName(i, e) : e;
    const o = a !== null ? a.uuid : e, c = this._actionsByClip[o];
    let l = null;
    if (n === void 0 && (a !== null ? n = a.blendMode : n = 2500), c !== void 0) {
      const u = c.actionByRoot[r];
      if (u !== void 0 && u.blendMode === n)
        return u;
      l = c.knownActions[0], a === null && (a = l._clip);
    }
    if (a === null) return null;
    const h = new Fp(this, a, t, n);
    return this._bindAction(h, l), this._addInactiveAction(h, o, r), h;
  }
  // get an existing action
  existingAction(e, t) {
    const n = t || this._root, i = n.uuid, r = typeof e == "string" ? $r.findByName(n, e) : e, a = r ? r.uuid : e, o = this._actionsByClip[a];
    return o !== void 0 && o.actionByRoot[i] || null;
  }
  // deactivates all previously scheduled actions
  stopAllAction() {
    const e = this._actions, t = this._nActiveActions;
    for (let n = t - 1; n >= 0; --n)
      e[n].stop();
    return this;
  }
  // advance the time and update apply the animation
  update(e) {
    e *= this.timeScale;
    const t = this._actions, n = this._nActiveActions, i = this.time += e, r = Math.sign(e), a = this._accuIndex ^= 1;
    for (let l = 0; l !== n; ++l)
      t[l]._update(i, e, r, a);
    const o = this._bindings, c = this._nActiveBindings;
    for (let l = 0; l !== c; ++l)
      o[l].apply(a);
    return this;
  }
  // Allows you to seek to a specific time in an animation.
  setTime(e) {
    this.time = 0;
    for (let t = 0; t < this._actions.length; t++)
      this._actions[t].time = 0;
    return this.update(e);
  }
  // return this mixer's root target object
  getRoot() {
    return this._root;
  }
  // free all resources specific to a particular clip
  uncacheClip(e) {
    const t = this._actions, n = e.uuid, i = this._actionsByClip, r = i[n];
    if (r !== void 0) {
      const a = r.knownActions;
      for (let o = 0, c = a.length; o !== c; ++o) {
        const l = a[o];
        this._deactivateAction(l);
        const h = l._cacheIndex, u = t[t.length - 1];
        l._cacheIndex = null, l._byClipCacheIndex = null, u._cacheIndex = h, t[h] = u, t.pop(), this._removeInactiveBindingsForAction(l);
      }
      delete i[n];
    }
  }
  // free all resources specific to a particular root target object
  uncacheRoot(e) {
    const t = e.uuid, n = this._actionsByClip;
    for (const a in n) {
      const o = n[a].actionByRoot, c = o[t];
      c !== void 0 && (this._deactivateAction(c), this._removeInactiveAction(c));
    }
    const i = this._bindingsByRootAndName, r = i[t];
    if (r !== void 0)
      for (const a in r) {
        const o = r[a];
        o.restoreOriginalState(), this._removeInactiveBinding(o);
      }
  }
  // remove a targeted clip from the cache
  uncacheAction(e, t) {
    const n = this.existingAction(e, t);
    n !== null && (this._deactivateAction(n), this._removeInactiveAction(n));
  }
}
const Ro = /* @__PURE__ */ new qe();
class kp {
  constructor(e, t, n = 0, i = 1 / 0) {
    this.ray = new hs(e, t), this.near = n, this.far = i, this.camera = null, this.layers = new sa(), this.params = {
      Mesh: {},
      Line: { threshold: 1 },
      LOD: {},
      Points: { threshold: 1 },
      Sprite: {}
    };
  }
  set(e, t) {
    this.ray.set(e, t);
  }
  setFromCamera(e, t) {
    t.isPerspectiveCamera ? (this.ray.origin.setFromMatrixPosition(t.matrixWorld), this.ray.direction.set(e.x, e.y, 0.5).unproject(t).sub(this.ray.origin).normalize(), this.camera = t) : t.isOrthographicCamera ? (this.ray.origin.set(e.x, e.y, (t.near + t.far) / (t.near - t.far)).unproject(t), this.ray.direction.set(0, 0, -1).transformDirection(t.matrixWorld), this.camera = t) : console.error("THREE.Raycaster: Unsupported camera type: " + t.type);
  }
  setFromXRController(e) {
    return Ro.identity().extractRotation(e.matrixWorld), this.ray.origin.setFromMatrixPosition(e.matrixWorld), this.ray.direction.set(0, 0, -1).applyMatrix4(Ro), this;
  }
  intersectObject(e, t = !0, n = []) {
    return Jr(e, this, n, t), n.sort(Co), n;
  }
  intersectObjects(e, t = !0, n = []) {
    for (let i = 0, r = e.length; i < r; i++)
      Jr(e[i], this, n, t);
    return n.sort(Co), n;
  }
}
function Co(s, e) {
  return s.distance - e.distance;
}
function Jr(s, e, t, n) {
  let i = !0;
  if (s.layers.test(e.layers) && s.raycast(e, t) === !1 && (i = !1), i === !0 && n === !0) {
    const r = s.children;
    for (let a = 0, o = r.length; a < o; a++)
      Jr(r[a], e, t, !0);
  }
}
typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register", { detail: {
  revision: ta
} }));
typeof window < "u" && (window.__THREE__ ? console.warn("WARNING: Multiple instances of Three.js being imported.") : window.__THREE__ = ta);
const zp = /^[og]\s*(.+)?/, Gp = /^mtllib /, Hp = /^usemtl /, Vp = /^usemap /, Io = /\s+/, Po = new L(), Hr = new L(), Lo = new L(), Do = new L(), on = new L(), Xs = new Pe();
function Wp() {
  const s = {
    objects: [],
    object: {},
    vertices: [],
    normals: [],
    colors: [],
    uvs: [],
    materials: {},
    materialLibraries: [],
    startObject: function(e, t) {
      if (this.object && this.object.fromDeclaration === !1) {
        this.object.name = e, this.object.fromDeclaration = t !== !1;
        return;
      }
      const n = this.object && typeof this.object.currentMaterial == "function" ? this.object.currentMaterial() : void 0;
      if (this.object && typeof this.object._finalize == "function" && this.object._finalize(!0), this.object = {
        name: e || "",
        fromDeclaration: t !== !1,
        geometry: {
          vertices: [],
          normals: [],
          colors: [],
          uvs: [],
          hasUVIndices: !1
        },
        materials: [],
        smooth: !0,
        startMaterial: function(i, r) {
          const a = this._finalize(!1);
          a && (a.inherited || a.groupCount <= 0) && this.materials.splice(a.index, 1);
          const o = {
            index: this.materials.length,
            name: i || "",
            mtllib: Array.isArray(r) && r.length > 0 ? r[r.length - 1] : "",
            smooth: a !== void 0 ? a.smooth : this.smooth,
            groupStart: a !== void 0 ? a.groupEnd : 0,
            groupEnd: -1,
            groupCount: -1,
            inherited: !1,
            clone: function(c) {
              const l = {
                index: typeof c == "number" ? c : this.index,
                name: this.name,
                mtllib: this.mtllib,
                smooth: this.smooth,
                groupStart: 0,
                groupEnd: -1,
                groupCount: -1,
                inherited: !1
              };
              return l.clone = this.clone.bind(l), l;
            }
          };
          return this.materials.push(o), o;
        },
        currentMaterial: function() {
          if (this.materials.length > 0)
            return this.materials[this.materials.length - 1];
        },
        _finalize: function(i) {
          const r = this.currentMaterial();
          if (r && r.groupEnd === -1 && (r.groupEnd = this.geometry.vertices.length / 3, r.groupCount = r.groupEnd - r.groupStart, r.inherited = !1), i && this.materials.length > 1)
            for (let a = this.materials.length - 1; a >= 0; a--)
              this.materials[a].groupCount <= 0 && this.materials.splice(a, 1);
          return i && this.materials.length === 0 && this.materials.push({
            name: "",
            smooth: this.smooth
          }), r;
        }
      }, n && n.name && typeof n.clone == "function") {
        const i = n.clone(0);
        i.inherited = !0, this.object.materials.push(i);
      }
      this.objects.push(this.object);
    },
    finalize: function() {
      this.object && typeof this.object._finalize == "function" && this.object._finalize(!0);
    },
    parseVertexIndex: function(e, t) {
      const n = parseInt(e, 10);
      return (n >= 0 ? n - 1 : n + t / 3) * 3;
    },
    parseNormalIndex: function(e, t) {
      const n = parseInt(e, 10);
      return (n >= 0 ? n - 1 : n + t / 3) * 3;
    },
    parseUVIndex: function(e, t) {
      const n = parseInt(e, 10);
      return (n >= 0 ? n - 1 : n + t / 2) * 2;
    },
    addVertex: function(e, t, n) {
      const i = this.vertices, r = this.object.geometry.vertices;
      r.push(i[e + 0], i[e + 1], i[e + 2]), r.push(i[t + 0], i[t + 1], i[t + 2]), r.push(i[n + 0], i[n + 1], i[n + 2]);
    },
    addVertexPoint: function(e) {
      const t = this.vertices;
      this.object.geometry.vertices.push(t[e + 0], t[e + 1], t[e + 2]);
    },
    addVertexLine: function(e) {
      const t = this.vertices;
      this.object.geometry.vertices.push(t[e + 0], t[e + 1], t[e + 2]);
    },
    addNormal: function(e, t, n) {
      const i = this.normals, r = this.object.geometry.normals;
      r.push(i[e + 0], i[e + 1], i[e + 2]), r.push(i[t + 0], i[t + 1], i[t + 2]), r.push(i[n + 0], i[n + 1], i[n + 2]);
    },
    addFaceNormal: function(e, t, n) {
      const i = this.vertices, r = this.object.geometry.normals;
      Po.fromArray(i, e), Hr.fromArray(i, t), Lo.fromArray(i, n), on.subVectors(Lo, Hr), Do.subVectors(Po, Hr), on.cross(Do), on.normalize(), r.push(on.x, on.y, on.z), r.push(on.x, on.y, on.z), r.push(on.x, on.y, on.z);
    },
    addColor: function(e, t, n) {
      const i = this.colors, r = this.object.geometry.colors;
      i[e] !== void 0 && r.push(i[e + 0], i[e + 1], i[e + 2]), i[t] !== void 0 && r.push(i[t + 0], i[t + 1], i[t + 2]), i[n] !== void 0 && r.push(i[n + 0], i[n + 1], i[n + 2]);
    },
    addUV: function(e, t, n) {
      const i = this.uvs, r = this.object.geometry.uvs;
      r.push(i[e + 0], i[e + 1]), r.push(i[t + 0], i[t + 1]), r.push(i[n + 0], i[n + 1]);
    },
    addDefaultUV: function() {
      const e = this.object.geometry.uvs;
      e.push(0, 0), e.push(0, 0), e.push(0, 0);
    },
    addUVLine: function(e) {
      const t = this.uvs;
      this.object.geometry.uvs.push(t[e + 0], t[e + 1]);
    },
    addFace: function(e, t, n, i, r, a, o, c, l) {
      const h = this.vertices.length;
      let u = this.parseVertexIndex(e, h), d = this.parseVertexIndex(t, h), f = this.parseVertexIndex(n, h);
      if (this.addVertex(u, d, f), this.addColor(u, d, f), o !== void 0 && o !== "") {
        const g = this.normals.length;
        u = this.parseNormalIndex(o, g), d = this.parseNormalIndex(c, g), f = this.parseNormalIndex(l, g), this.addNormal(u, d, f);
      } else
        this.addFaceNormal(u, d, f);
      if (i !== void 0 && i !== "") {
        const g = this.uvs.length;
        u = this.parseUVIndex(i, g), d = this.parseUVIndex(r, g), f = this.parseUVIndex(a, g), this.addUV(u, d, f), this.object.geometry.hasUVIndices = !0;
      } else
        this.addDefaultUV();
    },
    addPointGeometry: function(e) {
      this.object.geometry.type = "Points";
      const t = this.vertices.length;
      for (let n = 0, i = e.length; n < i; n++) {
        const r = this.parseVertexIndex(e[n], t);
        this.addVertexPoint(r), this.addColor(r);
      }
    },
    addLineGeometry: function(e, t) {
      this.object.geometry.type = "Line";
      const n = this.vertices.length, i = this.uvs.length;
      for (let r = 0, a = e.length; r < a; r++)
        this.addVertexLine(this.parseVertexIndex(e[r], n));
      for (let r = 0, a = t.length; r < a; r++)
        this.addUVLine(this.parseUVIndex(t[r], i));
    }
  };
  return s.startObject("", !1), s;
}
class Xp extends Xn {
  constructor(e) {
    super(e), this.materials = null;
  }
  load(e, t, n, i) {
    const r = this, a = new sr(this.manager);
    a.setPath(this.path), a.setRequestHeader(this.requestHeader), a.setWithCredentials(this.withCredentials), a.load(e, function(o) {
      try {
        t(r.parse(o));
      } catch (c) {
        i ? i(c) : console.error(c), r.manager.itemError(e);
      }
    }, n, i);
  }
  setMaterials(e) {
    return this.materials = e, this;
  }
  parse(e) {
    const t = new Wp();
    e.indexOf(`\r
`) !== -1 && (e = e.replace(/\r\n/g, `
`)), e.indexOf(`\\
`) !== -1 && (e = e.replace(/\\\n/g, ""));
    const n = e.split(`
`);
    let i = [];
    for (let o = 0, c = n.length; o < c; o++) {
      const l = n[o].trimStart();
      if (l.length === 0) continue;
      const h = l.charAt(0);
      if (h !== "#")
        if (h === "v") {
          const u = l.split(Io);
          switch (u[0]) {
            case "v":
              t.vertices.push(
                parseFloat(u[1]),
                parseFloat(u[2]),
                parseFloat(u[3])
              ), u.length >= 7 ? (Xs.setRGB(
                parseFloat(u[4]),
                parseFloat(u[5]),
                parseFloat(u[6]),
                At
              ), t.colors.push(Xs.r, Xs.g, Xs.b)) : t.colors.push(void 0, void 0, void 0);
              break;
            case "vn":
              t.normals.push(
                parseFloat(u[1]),
                parseFloat(u[2]),
                parseFloat(u[3])
              );
              break;
            case "vt":
              t.uvs.push(
                parseFloat(u[1]),
                parseFloat(u[2])
              );
              break;
          }
        } else if (h === "f") {
          const d = l.slice(1).trim().split(Io), f = [];
          for (let _ = 0, m = d.length; _ < m; _++) {
            const p = d[_];
            if (p.length > 0) {
              const E = p.split("/");
              f.push(E);
            }
          }
          const g = f[0];
          for (let _ = 1, m = f.length - 1; _ < m; _++) {
            const p = f[_], E = f[_ + 1];
            t.addFace(
              g[0],
              p[0],
              E[0],
              g[1],
              p[1],
              E[1],
              g[2],
              p[2],
              E[2]
            );
          }
        } else if (h === "l") {
          const u = l.substring(1).trim().split(" ");
          let d = [];
          const f = [];
          if (l.indexOf("/") === -1)
            d = u;
          else
            for (let g = 0, _ = u.length; g < _; g++) {
              const m = u[g].split("/");
              m[0] !== "" && d.push(m[0]), m[1] !== "" && f.push(m[1]);
            }
          t.addLineGeometry(d, f);
        } else if (h === "p") {
          const d = l.slice(1).trim().split(" ");
          t.addPointGeometry(d);
        } else if ((i = zp.exec(l)) !== null) {
          const u = (" " + i[0].slice(1).trim()).slice(1);
          t.startObject(u);
        } else if (Hp.test(l))
          t.object.startMaterial(l.substring(7).trim(), t.materialLibraries);
        else if (Gp.test(l))
          t.materialLibraries.push(l.substring(7).trim());
        else if (Vp.test(l))
          console.warn('THREE.OBJLoader: Rendering identifier "usemap" not supported. Textures must be defined in MTL files.');
        else if (h === "s") {
          if (i = l.split(" "), i.length > 1) {
            const d = i[1].trim().toLowerCase();
            t.object.smooth = d !== "0" && d !== "off";
          } else
            t.object.smooth = !0;
          const u = t.object.currentMaterial();
          u && (u.smooth = t.object.smooth);
        } else {
          if (l === "\0") continue;
          console.warn('THREE.OBJLoader: Unexpected line: "' + l + '"');
        }
    }
    t.finalize();
    const r = new Ft();
    if (r.materialLibraries = [].concat(t.materialLibraries), !(t.objects.length === 1 && t.objects[0].geometry.vertices.length === 0) === !0)
      for (let o = 0, c = t.objects.length; o < c; o++) {
        const l = t.objects[o], h = l.geometry, u = l.materials, d = h.type === "Line", f = h.type === "Points";
        let g = !1;
        if (h.vertices.length === 0) continue;
        const _ = new Rt();
        _.setAttribute("position", new dt(h.vertices, 3)), h.normals.length > 0 && _.setAttribute("normal", new dt(h.normals, 3)), h.colors.length > 0 && (g = !0, _.setAttribute("color", new dt(h.colors, 3))), h.hasUVIndices === !0 && _.setAttribute("uv", new dt(h.uvs, 2));
        const m = [];
        for (let E = 0, y = u.length; E < y; E++) {
          const A = u[E], O = A.name + "_" + A.smooth + "_" + g;
          let w = t.materials[O];
          if (this.materials !== null) {
            if (w = this.materials.create(A.name), d && w && !(w instanceof Dn)) {
              const R = new Dn();
              nn.prototype.copy.call(R, w), R.color.copy(w.color), w = R;
            } else if (f && w && !(w instanceof Ri)) {
              const R = new Ri({ size: 10, sizeAttenuation: !1 });
              nn.prototype.copy.call(R, w), R.color.copy(w.color), R.map = w.map, w = R;
            }
          }
          w === void 0 && (d ? w = new Dn() : f ? w = new Ri({ size: 1, sizeAttenuation: !1 }) : w = new nc(), w.name = A.name, w.flatShading = !A.smooth, w.vertexColors = g, t.materials[O] = w), m.push(w);
        }
        let p;
        if (m.length > 1) {
          for (let E = 0, y = u.length; E < y; E++) {
            const A = u[E];
            _.addGroup(A.groupStart, A.groupCount, E);
          }
          d ? p = new ii(_, m) : f ? p = new Ks(_, m) : p = new We(_, m);
        } else
          d ? p = new ii(_, m[0]) : f ? p = new Ks(_, m[0]) : p = new We(_, m[0]);
        p.name = l.name, r.add(p);
      }
    else if (t.vertices.length > 0) {
      const o = new Ri({ size: 1, sizeAttenuation: !1 }), c = new Rt();
      c.setAttribute("position", new dt(t.vertices, 3)), t.colors.length > 0 && t.colors[0] !== void 0 && (c.setAttribute("color", new dt(t.colors, 3)), o.vertexColors = !0);
      const l = new Ks(c, o);
      r.add(l);
    }
    return r;
  }
}
class qp extends Xn {
  constructor(e) {
    super(e);
  }
  /**
   * Loads and parses a MTL asset from a URL.
   *
   * @param {String} url - URL to the MTL file.
   * @param {Function} [onLoad] - Callback invoked with the loaded object.
   * @param {Function} [onProgress] - Callback for download progress.
   * @param {Function} [onError] - Callback for download errors.
   *
   * @see setPath setResourcePath
   *
   * @note In order for relative texture references to resolve correctly
   * you must call setResourcePath() explicitly prior to load.
   */
  load(e, t, n, i) {
    const r = this, a = this.path === "" ? Li.extractUrlBase(e) : this.path, o = new sr(this.manager);
    o.setPath(this.path), o.setRequestHeader(this.requestHeader), o.setWithCredentials(this.withCredentials), o.load(e, function(c) {
      try {
        t(r.parse(c, a));
      } catch (l) {
        i ? i(l) : console.error(l), r.manager.itemError(e);
      }
    }, n, i);
  }
  setMaterialOptions(e) {
    return this.materialOptions = e, this;
  }
  /**
   * Parses a MTL file.
   *
   * @param {String} text - Content of MTL file
   * @return {MaterialCreator}
   *
   * @see setPath setResourcePath
   *
   * @note In order for relative texture references to resolve correctly
   * you must call setResourcePath() explicitly prior to parse.
   */
  parse(e, t) {
    const n = e.split(`
`);
    let i = {};
    const r = /\s+/, a = {};
    for (let c = 0; c < n.length; c++) {
      let l = n[c];
      if (l = l.trim(), l.length === 0 || l.charAt(0) === "#")
        continue;
      const h = l.indexOf(" ");
      let u = h >= 0 ? l.substring(0, h) : l;
      u = u.toLowerCase();
      let d = h >= 0 ? l.substring(h + 1) : "";
      if (d = d.trim(), u === "newmtl")
        i = { name: d }, a[d] = i;
      else if (u === "ka" || u === "kd" || u === "ks" || u === "ke") {
        const f = d.split(r, 3);
        i[u] = [parseFloat(f[0]), parseFloat(f[1]), parseFloat(f[2])];
      } else
        i[u] = d;
    }
    const o = new jp(this.resourcePath || t, this.materialOptions);
    return o.setCrossOrigin(this.crossOrigin), o.setManager(this.manager), o.setMaterials(a), o;
  }
}
class jp {
  constructor(e = "", t = {}) {
    this.baseUrl = e, this.options = t, this.materialsInfo = {}, this.materials = {}, this.materialsArray = [], this.nameLookup = {}, this.crossOrigin = "anonymous", this.side = this.options.side !== void 0 ? this.options.side : 0, this.wrap = this.options.wrap !== void 0 ? this.options.wrap : 1e3;
  }
  setCrossOrigin(e) {
    return this.crossOrigin = e, this;
  }
  setManager(e) {
    this.manager = e;
  }
  setMaterials(e) {
    this.materialsInfo = this.convert(e), this.materials = {}, this.materialsArray = [], this.nameLookup = {};
  }
  convert(e) {
    if (!this.options) return e;
    const t = {};
    for (const n in e) {
      const i = e[n], r = {};
      t[n] = r;
      for (const a in i) {
        let o = !0, c = i[a];
        const l = a.toLowerCase();
        switch (l) {
          case "kd":
          case "ka":
          case "ks":
            this.options && this.options.normalizeRGB && (c = [c[0] / 255, c[1] / 255, c[2] / 255]), this.options && this.options.ignoreZeroRGBs && c[0] === 0 && c[1] === 0 && c[2] === 0 && (o = !1);
            break;
        }
        o && (r[l] = c);
      }
    }
    return t;
  }
  preload() {
    for (const e in this.materialsInfo)
      this.create(e);
  }
  getIndex(e) {
    return this.nameLookup[e];
  }
  getAsArray() {
    let e = 0;
    for (const t in this.materialsInfo)
      this.materialsArray[e] = this.create(t), this.nameLookup[t] = e, e++;
    return this.materialsArray;
  }
  create(e) {
    return this.materials[e] === void 0 && this.createMaterial_(e), this.materials[e];
  }
  createMaterial_(e) {
    const t = this, n = this.materialsInfo[e], i = {
      name: e,
      side: this.side
    };
    function r(o, c) {
      return typeof c != "string" || c === "" ? "" : /^https?:\/\//i.test(c) ? c : o + c;
    }
    function a(o, c) {
      if (i[o]) return;
      const l = t.getTextureParams(c, i), h = t.loadTexture(r(t.baseUrl, l.url));
      h.repeat.copy(l.scale), h.offset.copy(l.offset), h.wrapS = t.wrap, h.wrapT = t.wrap, (o === "map" || o === "emissiveMap") && (h.colorSpace = At), i[o] = h;
    }
    for (const o in n) {
      const c = n[o];
      let l;
      if (c !== "")
        switch (o.toLowerCase()) {
          case "kd":
            i.color = it.toWorkingColorSpace(new Pe().fromArray(c), At);
            break;
          case "ks":
            i.specular = it.toWorkingColorSpace(new Pe().fromArray(c), At);
            break;
          case "ke":
            i.emissive = it.toWorkingColorSpace(new Pe().fromArray(c), At);
            break;
          case "map_kd":
            a("map", c);
            break;
          case "map_ks":
            a("specularMap", c);
            break;
          case "map_ke":
            a("emissiveMap", c);
            break;
          case "norm":
            a("normalMap", c);
            break;
          case "map_bump":
          case "bump":
            a("bumpMap", c);
            break;
          case "map_d":
            a("alphaMap", c), i.transparent = !0;
            break;
          case "ns":
            i.shininess = parseFloat(c);
            break;
          case "d":
            l = parseFloat(c), l < 1 && (i.opacity = l, i.transparent = !0);
            break;
          case "tr":
            l = parseFloat(c), this.options && this.options.invertTrProperty && (l = 1 - l), l > 0 && (i.opacity = 1 - l, i.transparent = !0);
            break;
        }
    }
    return this.materials[e] = new nc(i), this.materials[e];
  }
  getTextureParams(e, t) {
    const n = {
      scale: new Xe(1, 1),
      offset: new Xe(0, 0)
    }, i = e.split(/\s+/);
    let r;
    return r = i.indexOf("-bm"), r >= 0 && (t.bumpScale = parseFloat(i[r + 1]), i.splice(r, 2)), r = i.indexOf("-s"), r >= 0 && (n.scale.set(parseFloat(i[r + 1]), parseFloat(i[r + 2])), i.splice(r, 4)), r = i.indexOf("-o"), r >= 0 && (n.offset.set(parseFloat(i[r + 1]), parseFloat(i[r + 2])), i.splice(r, 4)), n.url = i.join(" ").trim(), n;
  }
  loadTexture(e, t, n, i, r) {
    const a = this.manager !== void 0 ? this.manager : ac;
    let o = a.getHandler(e);
    o === null && (o = new oc(a)), o.setCrossOrigin && o.setCrossOrigin(this.crossOrigin);
    const c = o.load(e, n, i, r);
    return t !== void 0 && (c.mapping = t), c;
  }
}
function Uo(s, e) {
  if (e === 0)
    return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."), s;
  if (e === 2 || e === 1) {
    let t = s.getIndex();
    if (t === null) {
      const a = [], o = s.getAttribute("position");
      if (o !== void 0) {
        for (let c = 0; c < o.count; c++)
          a.push(c);
        s.setIndex(a), t = s.getIndex();
      } else
        return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."), s;
    }
    const n = t.count - 2, i = [];
    if (e === 2)
      for (let a = 1; a <= n; a++)
        i.push(t.getX(0)), i.push(t.getX(a)), i.push(t.getX(a + 1));
    else
      for (let a = 0; a < n; a++)
        a % 2 === 0 ? (i.push(t.getX(a)), i.push(t.getX(a + 1)), i.push(t.getX(a + 2))) : (i.push(t.getX(a + 2)), i.push(t.getX(a + 1)), i.push(t.getX(a)));
    i.length / 3 !== n && console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");
    const r = s.clone();
    return r.setIndex(i), r.clearGroups(), r;
  } else
    return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:", e), s;
}
class Yp extends Xn {
  constructor(e) {
    super(e), this.dracoLoader = null, this.ktx2Loader = null, this.meshoptDecoder = null, this.pluginCallbacks = [], this.register(function(t) {
      return new Qp(t);
    }), this.register(function(t) {
      return new em(t);
    }), this.register(function(t) {
      return new lm(t);
    }), this.register(function(t) {
      return new hm(t);
    }), this.register(function(t) {
      return new um(t);
    }), this.register(function(t) {
      return new nm(t);
    }), this.register(function(t) {
      return new im(t);
    }), this.register(function(t) {
      return new sm(t);
    }), this.register(function(t) {
      return new rm(t);
    }), this.register(function(t) {
      return new Jp(t);
    }), this.register(function(t) {
      return new am(t);
    }), this.register(function(t) {
      return new tm(t);
    }), this.register(function(t) {
      return new cm(t);
    }), this.register(function(t) {
      return new om(t);
    }), this.register(function(t) {
      return new Zp(t);
    }), this.register(function(t) {
      return new dm(t);
    }), this.register(function(t) {
      return new fm(t);
    });
  }
  load(e, t, n, i) {
    const r = this;
    let a;
    if (this.resourcePath !== "")
      a = this.resourcePath;
    else if (this.path !== "") {
      const l = Li.extractUrlBase(e);
      a = Li.resolveURL(l, this.path);
    } else
      a = Li.extractUrlBase(e);
    this.manager.itemStart(e);
    const o = function(l) {
      i ? i(l) : console.error(l), r.manager.itemError(e), r.manager.itemEnd(e);
    }, c = new sr(this.manager);
    c.setPath(this.path), c.setResponseType("arraybuffer"), c.setRequestHeader(this.requestHeader), c.setWithCredentials(this.withCredentials), c.load(e, function(l) {
      try {
        r.parse(l, a, function(h) {
          t(h), r.manager.itemEnd(e);
        }, o);
      } catch (h) {
        o(h);
      }
    }, n, o);
  }
  setDRACOLoader(e) {
    return this.dracoLoader = e, this;
  }
  setKTX2Loader(e) {
    return this.ktx2Loader = e, this;
  }
  setMeshoptDecoder(e) {
    return this.meshoptDecoder = e, this;
  }
  register(e) {
    return this.pluginCallbacks.indexOf(e) === -1 && this.pluginCallbacks.push(e), this;
  }
  unregister(e) {
    return this.pluginCallbacks.indexOf(e) !== -1 && this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e), 1), this;
  }
  parse(e, t, n, i) {
    let r;
    const a = {}, o = {}, c = new TextDecoder();
    if (typeof e == "string")
      r = JSON.parse(e);
    else if (e instanceof ArrayBuffer)
      if (c.decode(new Uint8Array(e, 0, 4)) === lc) {
        try {
          a[Je.KHR_BINARY_GLTF] = new pm(e);
        } catch (u) {
          i && i(u);
          return;
        }
        r = JSON.parse(a[Je.KHR_BINARY_GLTF].content);
      } else
        r = JSON.parse(c.decode(e));
    else
      r = e;
    if (r.asset === void 0 || r.asset.version[0] < 2) {
      i && i(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));
      return;
    }
    const l = new wm(r, {
      path: t || this.resourcePath || "",
      crossOrigin: this.crossOrigin,
      requestHeader: this.requestHeader,
      manager: this.manager,
      ktx2Loader: this.ktx2Loader,
      meshoptDecoder: this.meshoptDecoder
    });
    l.fileLoader.setRequestHeader(this.requestHeader);
    for (let h = 0; h < this.pluginCallbacks.length; h++) {
      const u = this.pluginCallbacks[h](l);
      u.name || console.error("THREE.GLTFLoader: Invalid plugin found: missing name"), o[u.name] = u, a[u.name] = !0;
    }
    if (r.extensionsUsed)
      for (let h = 0; h < r.extensionsUsed.length; ++h) {
        const u = r.extensionsUsed[h], d = r.extensionsRequired || [];
        switch (u) {
          case Je.KHR_MATERIALS_UNLIT:
            a[u] = new $p();
            break;
          case Je.KHR_DRACO_MESH_COMPRESSION:
            a[u] = new mm(r, this.dracoLoader);
            break;
          case Je.KHR_TEXTURE_TRANSFORM:
            a[u] = new gm();
            break;
          case Je.KHR_MESH_QUANTIZATION:
            a[u] = new _m();
            break;
          default:
            d.indexOf(u) >= 0 && o[u] === void 0 && console.warn('THREE.GLTFLoader: Unknown extension "' + u + '".');
        }
      }
    l.setExtensions(a), l.setPlugins(o), l.parse(n, i);
  }
  parseAsync(e, t) {
    const n = this;
    return new Promise(function(i, r) {
      n.parse(e, t, i, r);
    });
  }
}
function Kp() {
  let s = {};
  return {
    get: function(e) {
      return s[e];
    },
    add: function(e, t) {
      s[e] = t;
    },
    remove: function(e) {
      delete s[e];
    },
    removeAll: function() {
      s = {};
    }
  };
}
const Je = {
  KHR_BINARY_GLTF: "KHR_binary_glTF",
  KHR_DRACO_MESH_COMPRESSION: "KHR_draco_mesh_compression",
  KHR_LIGHTS_PUNCTUAL: "KHR_lights_punctual",
  KHR_MATERIALS_CLEARCOAT: "KHR_materials_clearcoat",
  KHR_MATERIALS_DISPERSION: "KHR_materials_dispersion",
  KHR_MATERIALS_IOR: "KHR_materials_ior",
  KHR_MATERIALS_SHEEN: "KHR_materials_sheen",
  KHR_MATERIALS_SPECULAR: "KHR_materials_specular",
  KHR_MATERIALS_TRANSMISSION: "KHR_materials_transmission",
  KHR_MATERIALS_IRIDESCENCE: "KHR_materials_iridescence",
  KHR_MATERIALS_ANISOTROPY: "KHR_materials_anisotropy",
  KHR_MATERIALS_UNLIT: "KHR_materials_unlit",
  KHR_MATERIALS_VOLUME: "KHR_materials_volume",
  KHR_TEXTURE_BASISU: "KHR_texture_basisu",
  KHR_TEXTURE_TRANSFORM: "KHR_texture_transform",
  KHR_MESH_QUANTIZATION: "KHR_mesh_quantization",
  KHR_MATERIALS_EMISSIVE_STRENGTH: "KHR_materials_emissive_strength",
  EXT_MATERIALS_BUMP: "EXT_materials_bump",
  EXT_TEXTURE_WEBP: "EXT_texture_webp",
  EXT_TEXTURE_AVIF: "EXT_texture_avif",
  EXT_MESHOPT_COMPRESSION: "EXT_meshopt_compression",
  EXT_MESH_GPU_INSTANCING: "EXT_mesh_gpu_instancing"
};
class Zp {
  constructor(e) {
    this.parser = e, this.name = Je.KHR_LIGHTS_PUNCTUAL, this.cache = { refs: {}, uses: {} };
  }
  _markDefs() {
    const e = this.parser, t = this.parser.json.nodes || [];
    for (let n = 0, i = t.length; n < i; n++) {
      const r = t[n];
      r.extensions && r.extensions[this.name] && r.extensions[this.name].light !== void 0 && e._addNodeRef(this.cache, r.extensions[this.name].light);
    }
  }
  _loadLight(e) {
    const t = this.parser, n = "light:" + e;
    let i = t.cache.get(n);
    if (i) return i;
    const r = t.json, c = ((r.extensions && r.extensions[this.name] || {}).lights || [])[e];
    let l;
    const h = new Pe(16777215);
    c.color !== void 0 && h.setRGB(c.color[0], c.color[1], c.color[2], Bt);
    const u = c.range !== void 0 ? c.range : 0;
    switch (c.type) {
      case "directional":
        l = new cc(h), l.target.position.set(0, 0, -1), l.add(l.target);
        break;
      case "point":
        l = new Sp(h), l.distance = u;
        break;
      case "spot":
        l = new Mp(h), l.distance = u, c.spot = c.spot || {}, c.spot.innerConeAngle = c.spot.innerConeAngle !== void 0 ? c.spot.innerConeAngle : 0, c.spot.outerConeAngle = c.spot.outerConeAngle !== void 0 ? c.spot.outerConeAngle : Math.PI / 4, l.angle = c.spot.outerConeAngle, l.penumbra = 1 - c.spot.innerConeAngle / c.spot.outerConeAngle, l.target.position.set(0, 0, -1), l.add(l.target);
        break;
      default:
        throw new Error("THREE.GLTFLoader: Unexpected light type: " + c.type);
    }
    return l.position.set(0, 0, 0), l.decay = 2, Ln(l, c), c.intensity !== void 0 && (l.intensity = c.intensity), l.name = t.createUniqueName(c.name || "light_" + e), i = Promise.resolve(l), t.cache.add(n, i), i;
  }
  getDependency(e, t) {
    if (e === "light")
      return this._loadLight(t);
  }
  createNodeAttachment(e) {
    const t = this, n = this.parser, r = n.json.nodes[e], o = (r.extensions && r.extensions[this.name] || {}).light;
    return o === void 0 ? null : this._loadLight(o).then(function(c) {
      return n._getNodeRef(t.cache, o, c);
    });
  }
}
class $p {
  constructor() {
    this.name = Je.KHR_MATERIALS_UNLIT;
  }
  getMaterialType() {
    return bt;
  }
  extendParams(e, t, n) {
    const i = [];
    e.color = new Pe(1, 1, 1), e.opacity = 1;
    const r = t.pbrMetallicRoughness;
    if (r) {
      if (Array.isArray(r.baseColorFactor)) {
        const a = r.baseColorFactor;
        e.color.setRGB(a[0], a[1], a[2], Bt), e.opacity = a[3];
      }
      r.baseColorTexture !== void 0 && i.push(n.assignTexture(e, "map", r.baseColorTexture, At));
    }
    return Promise.all(i);
  }
}
class Jp {
  constructor(e) {
    this.parser = e, this.name = Je.KHR_MATERIALS_EMISSIVE_STRENGTH;
  }
  extendMaterialParams(e, t) {
    const i = this.parser.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = i.extensions[this.name].emissiveStrength;
    return r !== void 0 && (t.emissiveIntensity = r), Promise.resolve();
  }
}
class Qp {
  constructor(e) {
    this.parser = e, this.name = Je.KHR_MATERIALS_CLEARCOAT;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : En;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, i = n.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = [], a = i.extensions[this.name];
    if (a.clearcoatFactor !== void 0 && (t.clearcoat = a.clearcoatFactor), a.clearcoatTexture !== void 0 && r.push(n.assignTexture(t, "clearcoatMap", a.clearcoatTexture)), a.clearcoatRoughnessFactor !== void 0 && (t.clearcoatRoughness = a.clearcoatRoughnessFactor), a.clearcoatRoughnessTexture !== void 0 && r.push(n.assignTexture(t, "clearcoatRoughnessMap", a.clearcoatRoughnessTexture)), a.clearcoatNormalTexture !== void 0 && (r.push(n.assignTexture(t, "clearcoatNormalMap", a.clearcoatNormalTexture)), a.clearcoatNormalTexture.scale !== void 0)) {
      const o = a.clearcoatNormalTexture.scale;
      t.clearcoatNormalScale = new Xe(o, o);
    }
    return Promise.all(r);
  }
}
class em {
  constructor(e) {
    this.parser = e, this.name = Je.KHR_MATERIALS_DISPERSION;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : En;
  }
  extendMaterialParams(e, t) {
    const i = this.parser.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = i.extensions[this.name];
    return t.dispersion = r.dispersion !== void 0 ? r.dispersion : 0, Promise.resolve();
  }
}
class tm {
  constructor(e) {
    this.parser = e, this.name = Je.KHR_MATERIALS_IRIDESCENCE;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : En;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, i = n.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = [], a = i.extensions[this.name];
    return a.iridescenceFactor !== void 0 && (t.iridescence = a.iridescenceFactor), a.iridescenceTexture !== void 0 && r.push(n.assignTexture(t, "iridescenceMap", a.iridescenceTexture)), a.iridescenceIor !== void 0 && (t.iridescenceIOR = a.iridescenceIor), t.iridescenceThicknessRange === void 0 && (t.iridescenceThicknessRange = [100, 400]), a.iridescenceThicknessMinimum !== void 0 && (t.iridescenceThicknessRange[0] = a.iridescenceThicknessMinimum), a.iridescenceThicknessMaximum !== void 0 && (t.iridescenceThicknessRange[1] = a.iridescenceThicknessMaximum), a.iridescenceThicknessTexture !== void 0 && r.push(n.assignTexture(t, "iridescenceThicknessMap", a.iridescenceThicknessTexture)), Promise.all(r);
  }
}
class nm {
  constructor(e) {
    this.parser = e, this.name = Je.KHR_MATERIALS_SHEEN;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : En;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, i = n.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = [];
    t.sheenColor = new Pe(0, 0, 0), t.sheenRoughness = 0, t.sheen = 1;
    const a = i.extensions[this.name];
    if (a.sheenColorFactor !== void 0) {
      const o = a.sheenColorFactor;
      t.sheenColor.setRGB(o[0], o[1], o[2], Bt);
    }
    return a.sheenRoughnessFactor !== void 0 && (t.sheenRoughness = a.sheenRoughnessFactor), a.sheenColorTexture !== void 0 && r.push(n.assignTexture(t, "sheenColorMap", a.sheenColorTexture, At)), a.sheenRoughnessTexture !== void 0 && r.push(n.assignTexture(t, "sheenRoughnessMap", a.sheenRoughnessTexture)), Promise.all(r);
  }
}
class im {
  constructor(e) {
    this.parser = e, this.name = Je.KHR_MATERIALS_TRANSMISSION;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : En;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, i = n.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = [], a = i.extensions[this.name];
    return a.transmissionFactor !== void 0 && (t.transmission = a.transmissionFactor), a.transmissionTexture !== void 0 && r.push(n.assignTexture(t, "transmissionMap", a.transmissionTexture)), Promise.all(r);
  }
}
class sm {
  constructor(e) {
    this.parser = e, this.name = Je.KHR_MATERIALS_VOLUME;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : En;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, i = n.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = [], a = i.extensions[this.name];
    t.thickness = a.thicknessFactor !== void 0 ? a.thicknessFactor : 0, a.thicknessTexture !== void 0 && r.push(n.assignTexture(t, "thicknessMap", a.thicknessTexture)), t.attenuationDistance = a.attenuationDistance || 1 / 0;
    const o = a.attenuationColor || [1, 1, 1];
    return t.attenuationColor = new Pe().setRGB(o[0], o[1], o[2], Bt), Promise.all(r);
  }
}
class rm {
  constructor(e) {
    this.parser = e, this.name = Je.KHR_MATERIALS_IOR;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : En;
  }
  extendMaterialParams(e, t) {
    const i = this.parser.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = i.extensions[this.name];
    return t.ior = r.ior !== void 0 ? r.ior : 1.5, Promise.resolve();
  }
}
class am {
  constructor(e) {
    this.parser = e, this.name = Je.KHR_MATERIALS_SPECULAR;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : En;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, i = n.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = [], a = i.extensions[this.name];
    t.specularIntensity = a.specularFactor !== void 0 ? a.specularFactor : 1, a.specularTexture !== void 0 && r.push(n.assignTexture(t, "specularIntensityMap", a.specularTexture));
    const o = a.specularColorFactor || [1, 1, 1];
    return t.specularColor = new Pe().setRGB(o[0], o[1], o[2], Bt), a.specularColorTexture !== void 0 && r.push(n.assignTexture(t, "specularColorMap", a.specularColorTexture, At)), Promise.all(r);
  }
}
class om {
  constructor(e) {
    this.parser = e, this.name = Je.EXT_MATERIALS_BUMP;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : En;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, i = n.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = [], a = i.extensions[this.name];
    return t.bumpScale = a.bumpFactor !== void 0 ? a.bumpFactor : 1, a.bumpTexture !== void 0 && r.push(n.assignTexture(t, "bumpMap", a.bumpTexture)), Promise.all(r);
  }
}
class cm {
  constructor(e) {
    this.parser = e, this.name = Je.KHR_MATERIALS_ANISOTROPY;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : En;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, i = n.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = [], a = i.extensions[this.name];
    return a.anisotropyStrength !== void 0 && (t.anisotropy = a.anisotropyStrength), a.anisotropyRotation !== void 0 && (t.anisotropyRotation = a.anisotropyRotation), a.anisotropyTexture !== void 0 && r.push(n.assignTexture(t, "anisotropyMap", a.anisotropyTexture)), Promise.all(r);
  }
}
class lm {
  constructor(e) {
    this.parser = e, this.name = Je.KHR_TEXTURE_BASISU;
  }
  loadTexture(e) {
    const t = this.parser, n = t.json, i = n.textures[e];
    if (!i.extensions || !i.extensions[this.name])
      return null;
    const r = i.extensions[this.name], a = t.options.ktx2Loader;
    if (!a) {
      if (n.extensionsRequired && n.extensionsRequired.indexOf(this.name) >= 0)
        throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");
      return null;
    }
    return t.loadTextureImage(e, r.source, a);
  }
}
class hm {
  constructor(e) {
    this.parser = e, this.name = Je.EXT_TEXTURE_WEBP, this.isSupported = null;
  }
  loadTexture(e) {
    const t = this.name, n = this.parser, i = n.json, r = i.textures[e];
    if (!r.extensions || !r.extensions[t])
      return null;
    const a = r.extensions[t], o = i.images[a.source];
    let c = n.textureLoader;
    if (o.uri) {
      const l = n.options.manager.getHandler(o.uri);
      l !== null && (c = l);
    }
    return this.detectSupport().then(function(l) {
      if (l) return n.loadTextureImage(e, a.source, c);
      if (i.extensionsRequired && i.extensionsRequired.indexOf(t) >= 0)
        throw new Error("THREE.GLTFLoader: WebP required by asset but unsupported.");
      return n.loadTexture(e);
    });
  }
  detectSupport() {
    return this.isSupported || (this.isSupported = new Promise(function(e) {
      const t = new Image();
      t.src = "data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA", t.onload = t.onerror = function() {
        e(t.height === 1);
      };
    })), this.isSupported;
  }
}
class um {
  constructor(e) {
    this.parser = e, this.name = Je.EXT_TEXTURE_AVIF, this.isSupported = null;
  }
  loadTexture(e) {
    const t = this.name, n = this.parser, i = n.json, r = i.textures[e];
    if (!r.extensions || !r.extensions[t])
      return null;
    const a = r.extensions[t], o = i.images[a.source];
    let c = n.textureLoader;
    if (o.uri) {
      const l = n.options.manager.getHandler(o.uri);
      l !== null && (c = l);
    }
    return this.detectSupport().then(function(l) {
      if (l) return n.loadTextureImage(e, a.source, c);
      if (i.extensionsRequired && i.extensionsRequired.indexOf(t) >= 0)
        throw new Error("THREE.GLTFLoader: AVIF required by asset but unsupported.");
      return n.loadTexture(e);
    });
  }
  detectSupport() {
    return this.isSupported || (this.isSupported = new Promise(function(e) {
      const t = new Image();
      t.src = "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=", t.onload = t.onerror = function() {
        e(t.height === 1);
      };
    })), this.isSupported;
  }
}
class dm {
  constructor(e) {
    this.name = Je.EXT_MESHOPT_COMPRESSION, this.parser = e;
  }
  loadBufferView(e) {
    const t = this.parser.json, n = t.bufferViews[e];
    if (n.extensions && n.extensions[this.name]) {
      const i = n.extensions[this.name], r = this.parser.getDependency("buffer", i.buffer), a = this.parser.options.meshoptDecoder;
      if (!a || !a.supported) {
        if (t.extensionsRequired && t.extensionsRequired.indexOf(this.name) >= 0)
          throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");
        return null;
      }
      return r.then(function(o) {
        const c = i.byteOffset || 0, l = i.byteLength || 0, h = i.count, u = i.byteStride, d = new Uint8Array(o, c, l);
        return a.decodeGltfBufferAsync ? a.decodeGltfBufferAsync(h, u, d, i.mode, i.filter).then(function(f) {
          return f.buffer;
        }) : a.ready.then(function() {
          const f = new ArrayBuffer(h * u);
          return a.decodeGltfBuffer(new Uint8Array(f), h, u, d, i.mode, i.filter), f;
        });
      });
    } else
      return null;
  }
}
class fm {
  constructor(e) {
    this.name = Je.EXT_MESH_GPU_INSTANCING, this.parser = e;
  }
  createNodeMesh(e) {
    const t = this.parser.json, n = t.nodes[e];
    if (!n.extensions || !n.extensions[this.name] || n.mesh === void 0)
      return null;
    const i = t.meshes[n.mesh];
    for (const l of i.primitives)
      if (l.mode !== cn.TRIANGLES && l.mode !== cn.TRIANGLE_STRIP && l.mode !== cn.TRIANGLE_FAN && l.mode !== void 0)
        return null;
    const a = n.extensions[this.name].attributes, o = [], c = {};
    for (const l in a)
      o.push(this.parser.getDependency("accessor", a[l]).then((h) => (c[l] = h, c[l])));
    return o.length < 1 ? null : (o.push(this.parser.createNodeMesh(e)), Promise.all(o).then((l) => {
      const h = l.pop(), u = h.isGroup ? h.children : [h], d = l[0].count, f = [];
      for (const g of u) {
        const _ = new qe(), m = new L(), p = new _n(), E = new L(1, 1, 1), y = new sp(g.geometry, g.material, d);
        for (let A = 0; A < d; A++)
          c.TRANSLATION && m.fromBufferAttribute(c.TRANSLATION, A), c.ROTATION && p.fromBufferAttribute(c.ROTATION, A), c.SCALE && E.fromBufferAttribute(c.SCALE, A), y.setMatrixAt(A, _.compose(m, p, E));
        for (const A in c)
          if (A === "_COLOR_0") {
            const O = c[A];
            y.instanceColor = new Kr(O.array, O.itemSize, O.normalized);
          } else A !== "TRANSLATION" && A !== "ROTATION" && A !== "SCALE" && g.geometry.setAttribute(A, c[A]);
        St.prototype.copy.call(y, g), this.parser.assignFinalMaterial(y), f.push(y);
      }
      return h.isGroup ? (h.clear(), h.add(...f), h) : f[0];
    }));
  }
}
const lc = "glTF", ss = 12, No = { JSON: 1313821514, BIN: 5130562 };
class pm {
  constructor(e) {
    this.name = Je.KHR_BINARY_GLTF, this.content = null, this.body = null;
    const t = new DataView(e, 0, ss), n = new TextDecoder();
    if (this.header = {
      magic: n.decode(new Uint8Array(e.slice(0, 4))),
      version: t.getUint32(4, !0),
      length: t.getUint32(8, !0)
    }, this.header.magic !== lc)
      throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");
    if (this.header.version < 2)
      throw new Error("THREE.GLTFLoader: Legacy binary file detected.");
    const i = this.header.length - ss, r = new DataView(e, ss);
    let a = 0;
    for (; a < i; ) {
      const o = r.getUint32(a, !0);
      a += 4;
      const c = r.getUint32(a, !0);
      if (a += 4, c === No.JSON) {
        const l = new Uint8Array(e, ss + a, o);
        this.content = n.decode(l);
      } else if (c === No.BIN) {
        const l = ss + a;
        this.body = e.slice(l, l + o);
      }
      a += o;
    }
    if (this.content === null)
      throw new Error("THREE.GLTFLoader: JSON content not found.");
  }
}
class mm {
  constructor(e, t) {
    if (!t)
      throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");
    this.name = Je.KHR_DRACO_MESH_COMPRESSION, this.json = e, this.dracoLoader = t, this.dracoLoader.preload();
  }
  decodePrimitive(e, t) {
    const n = this.json, i = this.dracoLoader, r = e.extensions[this.name].bufferView, a = e.extensions[this.name].attributes, o = {}, c = {}, l = {};
    for (const h in a) {
      const u = Qr[h] || h.toLowerCase();
      o[u] = a[h];
    }
    for (const h in e.attributes) {
      const u = Qr[h] || h.toLowerCase();
      if (a[h] !== void 0) {
        const d = n.accessors[e.attributes[h]], f = Di[d.componentType];
        l[u] = f.name, c[u] = d.normalized === !0;
      }
    }
    return t.getDependency("bufferView", r).then(function(h) {
      return new Promise(function(u, d) {
        i.decodeDracoFile(h, function(f) {
          for (const g in f.attributes) {
            const _ = f.attributes[g], m = c[g];
            m !== void 0 && (_.normalized = m);
          }
          u(f);
        }, o, l, Bt, d);
      });
    });
  }
}
class gm {
  constructor() {
    this.name = Je.KHR_TEXTURE_TRANSFORM;
  }
  extendTexture(e, t) {
    return (t.texCoord === void 0 || t.texCoord === e.channel) && t.offset === void 0 && t.rotation === void 0 && t.scale === void 0 || (e = e.clone(), t.texCoord !== void 0 && (e.channel = t.texCoord), t.offset !== void 0 && e.offset.fromArray(t.offset), t.rotation !== void 0 && (e.rotation = t.rotation), t.scale !== void 0 && e.repeat.fromArray(t.scale), e.needsUpdate = !0), e;
  }
}
class _m {
  constructor() {
    this.name = Je.KHR_MESH_QUANTIZATION;
  }
}
class hc extends us {
  constructor(e, t, n, i) {
    super(e, t, n, i);
  }
  copySampleValue_(e) {
    const t = this.resultBuffer, n = this.sampleValues, i = this.valueSize, r = e * i * 3 + i;
    for (let a = 0; a !== i; a++)
      t[a] = n[r + a];
    return t;
  }
  interpolate_(e, t, n, i) {
    const r = this.resultBuffer, a = this.sampleValues, o = this.valueSize, c = o * 2, l = o * 3, h = i - t, u = (n - t) / h, d = u * u, f = d * u, g = e * l, _ = g - l, m = -2 * f + 3 * d, p = f - d, E = 1 - m, y = p - d + u;
    for (let A = 0; A !== o; A++) {
      const O = a[_ + A + o], w = a[_ + A + c] * h, R = a[g + A + o], k = a[g + A] * h;
      r[A] = E * O + y * w + m * R + p * k;
    }
    return r;
  }
}
const xm = new _n();
class vm extends hc {
  interpolate_(e, t, n, i) {
    const r = super.interpolate_(e, t, n, i);
    return xm.fromArray(r).normalize().toArray(r), r;
  }
}
const cn = {
  POINTS: 0,
  LINES: 1,
  LINE_LOOP: 2,
  LINE_STRIP: 3,
  TRIANGLES: 4,
  TRIANGLE_STRIP: 5,
  TRIANGLE_FAN: 6
}, Di = {
  5120: Int8Array,
  5121: Uint8Array,
  5122: Int16Array,
  5123: Uint16Array,
  5125: Uint32Array,
  5126: Float32Array
}, Fo = {
  9728: 1003,
  9729: 1006,
  9984: 1004,
  9985: 1007,
  9986: 1005,
  9987: 1008
}, Bo = {
  33071: 1001,
  33648: 1002,
  10497: 1e3
}, Vr = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT2: 4,
  MAT3: 9,
  MAT4: 16
}, Qr = {
  POSITION: "position",
  NORMAL: "normal",
  TANGENT: "tangent",
  TEXCOORD_0: "uv",
  TEXCOORD_1: "uv1",
  TEXCOORD_2: "uv2",
  TEXCOORD_3: "uv3",
  COLOR_0: "color",
  WEIGHTS_0: "skinWeight",
  JOINTS_0: "skinIndex"
}, zn = {
  scale: "scale",
  translation: "position",
  rotation: "quaternion",
  weights: "morphTargetInfluences"
}, Mm = {
  CUBICSPLINE: void 0,
  // We use a custom interpolant (GLTFCubicSplineInterpolation) for CUBICSPLINE tracks. Each
  // keyframe track will be initialized with a default interpolation type, then modified.
  LINEAR: 2301,
  STEP: 2300
}, Wr = {
  OPAQUE: "OPAQUE",
  MASK: "MASK",
  BLEND: "BLEND"
};
function ym(s) {
  return s.DefaultMaterial === void 0 && (s.DefaultMaterial = new Zt({
    color: 16777215,
    emissive: 0,
    metalness: 1,
    roughness: 1,
    transparent: !1,
    depthTest: !0,
    side: 0
  })), s.DefaultMaterial;
}
function Qn(s, e, t) {
  for (const n in t.extensions)
    s[n] === void 0 && (e.userData.gltfExtensions = e.userData.gltfExtensions || {}, e.userData.gltfExtensions[n] = t.extensions[n]);
}
function Ln(s, e) {
  e.extras !== void 0 && (typeof e.extras == "object" ? Object.assign(s.userData, e.extras) : console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, " + e.extras));
}
function Sm(s, e, t) {
  let n = !1, i = !1, r = !1;
  for (let l = 0, h = e.length; l < h; l++) {
    const u = e[l];
    if (u.POSITION !== void 0 && (n = !0), u.NORMAL !== void 0 && (i = !0), u.COLOR_0 !== void 0 && (r = !0), n && i && r) break;
  }
  if (!n && !i && !r) return Promise.resolve(s);
  const a = [], o = [], c = [];
  for (let l = 0, h = e.length; l < h; l++) {
    const u = e[l];
    if (n) {
      const d = u.POSITION !== void 0 ? t.getDependency("accessor", u.POSITION) : s.attributes.position;
      a.push(d);
    }
    if (i) {
      const d = u.NORMAL !== void 0 ? t.getDependency("accessor", u.NORMAL) : s.attributes.normal;
      o.push(d);
    }
    if (r) {
      const d = u.COLOR_0 !== void 0 ? t.getDependency("accessor", u.COLOR_0) : s.attributes.color;
      c.push(d);
    }
  }
  return Promise.all([
    Promise.all(a),
    Promise.all(o),
    Promise.all(c)
  ]).then(function(l) {
    const h = l[0], u = l[1], d = l[2];
    return n && (s.morphAttributes.position = h), i && (s.morphAttributes.normal = u), r && (s.morphAttributes.color = d), s.morphTargetsRelative = !0, s;
  });
}
function Em(s, e) {
  if (s.updateMorphTargets(), e.weights !== void 0)
    for (let t = 0, n = e.weights.length; t < n; t++)
      s.morphTargetInfluences[t] = e.weights[t];
  if (e.extras && Array.isArray(e.extras.targetNames)) {
    const t = e.extras.targetNames;
    if (s.morphTargetInfluences.length === t.length) {
      s.morphTargetDictionary = {};
      for (let n = 0, i = t.length; n < i; n++)
        s.morphTargetDictionary[t[n]] = n;
    } else
      console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.");
  }
}
function Tm(s) {
  let e;
  const t = s.extensions && s.extensions[Je.KHR_DRACO_MESH_COMPRESSION];
  if (t ? e = "draco:" + t.bufferView + ":" + t.indices + ":" + Xr(t.attributes) : e = s.indices + ":" + Xr(s.attributes) + ":" + s.mode, s.targets !== void 0)
    for (let n = 0, i = s.targets.length; n < i; n++)
      e += ":" + Xr(s.targets[n]);
  return e;
}
function Xr(s) {
  let e = "";
  const t = Object.keys(s).sort();
  for (let n = 0, i = t.length; n < i; n++)
    e += t[n] + ":" + s[t[n]] + ";";
  return e;
}
function ea(s) {
  switch (s) {
    case Int8Array:
      return 1 / 127;
    case Uint8Array:
      return 1 / 255;
    case Int16Array:
      return 1 / 32767;
    case Uint16Array:
      return 1 / 65535;
    default:
      throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.");
  }
}
function Am(s) {
  return s.search(/\.jpe?g($|\?)/i) > 0 || s.search(/^data\:image\/jpeg/) === 0 ? "image/jpeg" : s.search(/\.webp($|\?)/i) > 0 || s.search(/^data\:image\/webp/) === 0 ? "image/webp" : "image/png";
}
const bm = new qe();
class wm {
  constructor(e = {}, t = {}) {
    this.json = e, this.extensions = {}, this.plugins = {}, this.options = t, this.cache = new Kp(), this.associations = /* @__PURE__ */ new Map(), this.primitiveCache = {}, this.nodeCache = {}, this.meshCache = { refs: {}, uses: {} }, this.cameraCache = { refs: {}, uses: {} }, this.lightCache = { refs: {}, uses: {} }, this.sourceCache = {}, this.textureCache = {}, this.nodeNamesUsed = {};
    let n = !1, i = -1, r = !1, a = -1;
    if (typeof navigator < "u") {
      const o = navigator.userAgent;
      n = /^((?!chrome|android).)*safari/i.test(o) === !0;
      const c = o.match(/Version\/(\d+)/);
      i = n && c ? parseInt(c[1], 10) : -1, r = o.indexOf("Firefox") > -1, a = r ? o.match(/Firefox\/([0-9]+)\./)[1] : -1;
    }
    typeof createImageBitmap > "u" || n && i < 17 || r && a < 98 ? this.textureLoader = new oc(this.options.manager) : this.textureLoader = new Tp(this.options.manager), this.textureLoader.setCrossOrigin(this.options.crossOrigin), this.textureLoader.setRequestHeader(this.options.requestHeader), this.fileLoader = new sr(this.options.manager), this.fileLoader.setResponseType("arraybuffer"), this.options.crossOrigin === "use-credentials" && this.fileLoader.setWithCredentials(!0);
  }
  setExtensions(e) {
    this.extensions = e;
  }
  setPlugins(e) {
    this.plugins = e;
  }
  parse(e, t) {
    const n = this, i = this.json, r = this.extensions;
    this.cache.removeAll(), this.nodeCache = {}, this._invokeAll(function(a) {
      return a._markDefs && a._markDefs();
    }), Promise.all(this._invokeAll(function(a) {
      return a.beforeRoot && a.beforeRoot();
    })).then(function() {
      return Promise.all([
        n.getDependencies("scene"),
        n.getDependencies("animation"),
        n.getDependencies("camera")
      ]);
    }).then(function(a) {
      const o = {
        scene: a[0][i.scene || 0],
        scenes: a[0],
        animations: a[1],
        cameras: a[2],
        asset: i.asset,
        parser: n,
        userData: {}
      };
      return Qn(r, o, i), Ln(o, i), Promise.all(n._invokeAll(function(c) {
        return c.afterRoot && c.afterRoot(o);
      })).then(function() {
        for (const c of o.scenes)
          c.updateMatrixWorld();
        e(o);
      });
    }).catch(t);
  }
  /**
   * Marks the special nodes/meshes in json for efficient parse.
   */
  _markDefs() {
    const e = this.json.nodes || [], t = this.json.skins || [], n = this.json.meshes || [];
    for (let i = 0, r = t.length; i < r; i++) {
      const a = t[i].joints;
      for (let o = 0, c = a.length; o < c; o++)
        e[a[o]].isBone = !0;
    }
    for (let i = 0, r = e.length; i < r; i++) {
      const a = e[i];
      a.mesh !== void 0 && (this._addNodeRef(this.meshCache, a.mesh), a.skin !== void 0 && (n[a.mesh].isSkinnedMesh = !0)), a.camera !== void 0 && this._addNodeRef(this.cameraCache, a.camera);
    }
  }
  /**
   * Counts references to shared node / Object3D resources. These resources
   * can be reused, or "instantiated", at multiple nodes in the scene
   * hierarchy. Mesh, Camera, and Light instances are instantiated and must
   * be marked. Non-scenegraph resources (like Materials, Geometries, and
   * Textures) can be reused directly and are not marked here.
   *
   * Example: CesiumMilkTruck sample model reuses "Wheel" meshes.
   */
  _addNodeRef(e, t) {
    t !== void 0 && (e.refs[t] === void 0 && (e.refs[t] = e.uses[t] = 0), e.refs[t]++);
  }
  /** Returns a reference to a shared resource, cloning it if necessary. */
  _getNodeRef(e, t, n) {
    if (e.refs[t] <= 1) return n;
    const i = n.clone(), r = (a, o) => {
      const c = this.associations.get(a);
      c != null && this.associations.set(o, c);
      for (const [l, h] of a.children.entries())
        r(h, o.children[l]);
    };
    return r(n, i), i.name += "_instance_" + e.uses[t]++, i;
  }
  _invokeOne(e) {
    const t = Object.values(this.plugins);
    t.push(this);
    for (let n = 0; n < t.length; n++) {
      const i = e(t[n]);
      if (i) return i;
    }
    return null;
  }
  _invokeAll(e) {
    const t = Object.values(this.plugins);
    t.unshift(this);
    const n = [];
    for (let i = 0; i < t.length; i++) {
      const r = e(t[i]);
      r && n.push(r);
    }
    return n;
  }
  /**
   * Requests the specified dependency asynchronously, with caching.
   * @param {string} type
   * @param {number} index
   * @return {Promise<Object3D|Material|THREE.Texture|AnimationClip|ArrayBuffer|Object>}
   */
  getDependency(e, t) {
    const n = e + ":" + t;
    let i = this.cache.get(n);
    if (!i) {
      switch (e) {
        case "scene":
          i = this.loadScene(t);
          break;
        case "node":
          i = this._invokeOne(function(r) {
            return r.loadNode && r.loadNode(t);
          });
          break;
        case "mesh":
          i = this._invokeOne(function(r) {
            return r.loadMesh && r.loadMesh(t);
          });
          break;
        case "accessor":
          i = this.loadAccessor(t);
          break;
        case "bufferView":
          i = this._invokeOne(function(r) {
            return r.loadBufferView && r.loadBufferView(t);
          });
          break;
        case "buffer":
          i = this.loadBuffer(t);
          break;
        case "material":
          i = this._invokeOne(function(r) {
            return r.loadMaterial && r.loadMaterial(t);
          });
          break;
        case "texture":
          i = this._invokeOne(function(r) {
            return r.loadTexture && r.loadTexture(t);
          });
          break;
        case "skin":
          i = this.loadSkin(t);
          break;
        case "animation":
          i = this._invokeOne(function(r) {
            return r.loadAnimation && r.loadAnimation(t);
          });
          break;
        case "camera":
          i = this.loadCamera(t);
          break;
        default:
          if (i = this._invokeOne(function(r) {
            return r != this && r.getDependency && r.getDependency(e, t);
          }), !i)
            throw new Error("Unknown type: " + e);
          break;
      }
      this.cache.add(n, i);
    }
    return i;
  }
  /**
   * Requests all dependencies of the specified type asynchronously, with caching.
   * @param {string} type
   * @return {Promise<Array<Object>>}
   */
  getDependencies(e) {
    let t = this.cache.get(e);
    if (!t) {
      const n = this, i = this.json[e + (e === "mesh" ? "es" : "s")] || [];
      t = Promise.all(i.map(function(r, a) {
        return n.getDependency(e, a);
      })), this.cache.add(e, t);
    }
    return t;
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
   * @param {number} bufferIndex
   * @return {Promise<ArrayBuffer>}
   */
  loadBuffer(e) {
    const t = this.json.buffers[e], n = this.fileLoader;
    if (t.type && t.type !== "arraybuffer")
      throw new Error("THREE.GLTFLoader: " + t.type + " buffer type is not supported.");
    if (t.uri === void 0 && e === 0)
      return Promise.resolve(this.extensions[Je.KHR_BINARY_GLTF].body);
    const i = this.options;
    return new Promise(function(r, a) {
      n.load(Li.resolveURL(t.uri, i.path), r, void 0, function() {
        a(new Error('THREE.GLTFLoader: Failed to load buffer "' + t.uri + '".'));
      });
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
   * @param {number} bufferViewIndex
   * @return {Promise<ArrayBuffer>}
   */
  loadBufferView(e) {
    const t = this.json.bufferViews[e];
    return this.getDependency("buffer", t.buffer).then(function(n) {
      const i = t.byteLength || 0, r = t.byteOffset || 0;
      return n.slice(r, r + i);
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#accessors
   * @param {number} accessorIndex
   * @return {Promise<BufferAttribute|InterleavedBufferAttribute>}
   */
  loadAccessor(e) {
    const t = this, n = this.json, i = this.json.accessors[e];
    if (i.bufferView === void 0 && i.sparse === void 0) {
      const a = Vr[i.type], o = Di[i.componentType], c = i.normalized === !0, l = new o(i.count * a);
      return Promise.resolve(new jt(l, a, c));
    }
    const r = [];
    return i.bufferView !== void 0 ? r.push(this.getDependency("bufferView", i.bufferView)) : r.push(null), i.sparse !== void 0 && (r.push(this.getDependency("bufferView", i.sparse.indices.bufferView)), r.push(this.getDependency("bufferView", i.sparse.values.bufferView))), Promise.all(r).then(function(a) {
      const o = a[0], c = Vr[i.type], l = Di[i.componentType], h = l.BYTES_PER_ELEMENT, u = h * c, d = i.byteOffset || 0, f = i.bufferView !== void 0 ? n.bufferViews[i.bufferView].byteStride : void 0, g = i.normalized === !0;
      let _, m;
      if (f && f !== u) {
        const p = Math.floor(d / f), E = "InterleavedBuffer:" + i.bufferView + ":" + i.componentType + ":" + p + ":" + i.count;
        let y = t.cache.get(E);
        y || (_ = new l(o, p * f, i.count * f / h), y = new Qf(_, f / h), t.cache.add(E, y)), m = new oa(y, c, d % f / h, g);
      } else
        o === null ? _ = new l(i.count * c) : _ = new l(o, d, i.count * c), m = new jt(_, c, g);
      if (i.sparse !== void 0) {
        const p = Vr.SCALAR, E = Di[i.sparse.indices.componentType], y = i.sparse.indices.byteOffset || 0, A = i.sparse.values.byteOffset || 0, O = new E(a[1], y, i.sparse.count * p), w = new l(a[2], A, i.sparse.count * c);
        o !== null && (m = new jt(m.array.slice(), m.itemSize, m.normalized)), m.normalized = !1;
        for (let R = 0, k = O.length; R < k; R++) {
          const Q = O[R];
          if (m.setX(Q, w[R * c]), c >= 2 && m.setY(Q, w[R * c + 1]), c >= 3 && m.setZ(Q, w[R * c + 2]), c >= 4 && m.setW(Q, w[R * c + 3]), c >= 5) throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.");
        }
        m.normalized = g;
      }
      return m;
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#textures
   * @param {number} textureIndex
   * @return {Promise<THREE.Texture|null>}
   */
  loadTexture(e) {
    const t = this.json, n = this.options, r = t.textures[e].source, a = t.images[r];
    let o = this.textureLoader;
    if (a.uri) {
      const c = n.manager.getHandler(a.uri);
      c !== null && (o = c);
    }
    return this.loadTextureImage(e, r, o);
  }
  loadTextureImage(e, t, n) {
    const i = this, r = this.json, a = r.textures[e], o = r.images[t], c = (o.uri || o.bufferView) + ":" + a.sampler;
    if (this.textureCache[c])
      return this.textureCache[c];
    const l = this.loadImageSource(t, n).then(function(h) {
      h.flipY = !1, h.name = a.name || o.name || "", h.name === "" && typeof o.uri == "string" && o.uri.startsWith("data:image/") === !1 && (h.name = o.uri);
      const d = (r.samplers || {})[a.sampler] || {};
      return h.magFilter = Fo[d.magFilter] || 1006, h.minFilter = Fo[d.minFilter] || 1008, h.wrapS = Bo[d.wrapS] || 1e3, h.wrapT = Bo[d.wrapT] || 1e3, i.associations.set(h, { textures: e }), h;
    }).catch(function() {
      return null;
    });
    return this.textureCache[c] = l, l;
  }
  loadImageSource(e, t) {
    const n = this, i = this.json, r = this.options;
    if (this.sourceCache[e] !== void 0)
      return this.sourceCache[e].then((u) => u.clone());
    const a = i.images[e], o = self.URL || self.webkitURL;
    let c = a.uri || "", l = !1;
    if (a.bufferView !== void 0)
      c = n.getDependency("bufferView", a.bufferView).then(function(u) {
        l = !0;
        const d = new Blob([u], { type: a.mimeType });
        return c = o.createObjectURL(d), c;
      });
    else if (a.uri === void 0)
      throw new Error("THREE.GLTFLoader: Image " + e + " is missing URI and bufferView");
    const h = Promise.resolve(c).then(function(u) {
      return new Promise(function(d, f) {
        let g = d;
        t.isImageBitmapLoader === !0 && (g = function(_) {
          const m = new It(_);
          m.needsUpdate = !0, d(m);
        }), t.load(Li.resolveURL(u, r.path), g, void 0, f);
      });
    }).then(function(u) {
      return l === !0 && o.revokeObjectURL(c), Ln(u, a), u.userData.mimeType = a.mimeType || Am(a.uri), u;
    }).catch(function(u) {
      throw console.error("THREE.GLTFLoader: Couldn't load texture", c), u;
    });
    return this.sourceCache[e] = h, h;
  }
  /**
   * Asynchronously assigns a texture to the given material parameters.
   * @param {Object} materialParams
   * @param {string} mapName
   * @param {Object} mapDef
   * @return {Promise<Texture>}
   */
  assignTexture(e, t, n, i) {
    const r = this;
    return this.getDependency("texture", n.index).then(function(a) {
      if (!a) return null;
      if (n.texCoord !== void 0 && n.texCoord > 0 && (a = a.clone(), a.channel = n.texCoord), r.extensions[Je.KHR_TEXTURE_TRANSFORM]) {
        const o = n.extensions !== void 0 ? n.extensions[Je.KHR_TEXTURE_TRANSFORM] : void 0;
        if (o) {
          const c = r.associations.get(a);
          a = r.extensions[Je.KHR_TEXTURE_TRANSFORM].extendTexture(a, o), r.associations.set(a, c);
        }
      }
      return i !== void 0 && (a.colorSpace = i), e[t] = a, a;
    });
  }
  /**
   * Assigns final material to a Mesh, Line, or Points instance. The instance
   * already has a material (generated from the glTF material options alone)
   * but reuse of the same glTF material may require multiple threejs materials
   * to accommodate different primitive types, defines, etc. New materials will
   * be created if necessary, and reused from a cache.
   * @param  {Object3D} mesh Mesh, Line, or Points instance.
   */
  assignFinalMaterial(e) {
    const t = e.geometry;
    let n = e.material;
    const i = t.attributes.tangent === void 0, r = t.attributes.color !== void 0, a = t.attributes.normal === void 0;
    if (e.isPoints) {
      const o = "PointsMaterial:" + n.uuid;
      let c = this.cache.get(o);
      c || (c = new Ri(), nn.prototype.copy.call(c, n), c.color.copy(n.color), c.map = n.map, c.sizeAttenuation = !1, this.cache.add(o, c)), n = c;
    } else if (e.isLine) {
      const o = "LineBasicMaterial:" + n.uuid;
      let c = this.cache.get(o);
      c || (c = new Dn(), nn.prototype.copy.call(c, n), c.color.copy(n.color), c.map = n.map, this.cache.add(o, c)), n = c;
    }
    if (i || r || a) {
      let o = "ClonedMaterial:" + n.uuid + ":";
      i && (o += "derivative-tangents:"), r && (o += "vertex-colors:"), a && (o += "flat-shading:");
      let c = this.cache.get(o);
      c || (c = n.clone(), r && (c.vertexColors = !0), a && (c.flatShading = !0), i && (c.normalScale && (c.normalScale.y *= -1), c.clearcoatNormalScale && (c.clearcoatNormalScale.y *= -1)), this.cache.add(o, c), this.associations.set(c, this.associations.get(n))), n = c;
    }
    e.material = n;
  }
  getMaterialType() {
    return Zt;
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#materials
   * @param {number} materialIndex
   * @return {Promise<Material>}
   */
  loadMaterial(e) {
    const t = this, n = this.json, i = this.extensions, r = n.materials[e];
    let a;
    const o = {}, c = r.extensions || {}, l = [];
    if (c[Je.KHR_MATERIALS_UNLIT]) {
      const u = i[Je.KHR_MATERIALS_UNLIT];
      a = u.getMaterialType(), l.push(u.extendParams(o, r, t));
    } else {
      const u = r.pbrMetallicRoughness || {};
      if (o.color = new Pe(1, 1, 1), o.opacity = 1, Array.isArray(u.baseColorFactor)) {
        const d = u.baseColorFactor;
        o.color.setRGB(d[0], d[1], d[2], Bt), o.opacity = d[3];
      }
      u.baseColorTexture !== void 0 && l.push(t.assignTexture(o, "map", u.baseColorTexture, At)), o.metalness = u.metallicFactor !== void 0 ? u.metallicFactor : 1, o.roughness = u.roughnessFactor !== void 0 ? u.roughnessFactor : 1, u.metallicRoughnessTexture !== void 0 && (l.push(t.assignTexture(o, "metalnessMap", u.metallicRoughnessTexture)), l.push(t.assignTexture(o, "roughnessMap", u.metallicRoughnessTexture))), a = this._invokeOne(function(d) {
        return d.getMaterialType && d.getMaterialType(e);
      }), l.push(Promise.all(this._invokeAll(function(d) {
        return d.extendMaterialParams && d.extendMaterialParams(e, o);
      })));
    }
    r.doubleSided === !0 && (o.side = 2);
    const h = r.alphaMode || Wr.OPAQUE;
    if (h === Wr.BLEND ? (o.transparent = !0, o.depthWrite = !1) : (o.transparent = !1, h === Wr.MASK && (o.alphaTest = r.alphaCutoff !== void 0 ? r.alphaCutoff : 0.5)), r.normalTexture !== void 0 && a !== bt && (l.push(t.assignTexture(o, "normalMap", r.normalTexture)), o.normalScale = new Xe(1, 1), r.normalTexture.scale !== void 0)) {
      const u = r.normalTexture.scale;
      o.normalScale.set(u, u);
    }
    if (r.occlusionTexture !== void 0 && a !== bt && (l.push(t.assignTexture(o, "aoMap", r.occlusionTexture)), r.occlusionTexture.strength !== void 0 && (o.aoMapIntensity = r.occlusionTexture.strength)), r.emissiveFactor !== void 0 && a !== bt) {
      const u = r.emissiveFactor;
      o.emissive = new Pe().setRGB(u[0], u[1], u[2], Bt);
    }
    return r.emissiveTexture !== void 0 && a !== bt && l.push(t.assignTexture(o, "emissiveMap", r.emissiveTexture, At)), Promise.all(l).then(function() {
      const u = new a(o);
      return r.name && (u.name = r.name), Ln(u, r), t.associations.set(u, { materials: e }), r.extensions && Qn(i, u, r), u;
    });
  }
  /** When Object3D instances are targeted by animation, they need unique names. */
  createUniqueName(e) {
    const t = pt.sanitizeNodeName(e || "");
    return t in this.nodeNamesUsed ? t + "_" + ++this.nodeNamesUsed[t] : (this.nodeNamesUsed[t] = 0, t);
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#geometry
   *
   * Creates BufferGeometries from primitives.
   *
   * @param {Array<GLTF.Primitive>} primitives
   * @return {Promise<Array<BufferGeometry>>}
   */
  loadGeometries(e) {
    const t = this, n = this.extensions, i = this.primitiveCache;
    function r(o) {
      return n[Je.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(o, t).then(function(c) {
        return Oo(c, o, t);
      });
    }
    const a = [];
    for (let o = 0, c = e.length; o < c; o++) {
      const l = e[o], h = Tm(l), u = i[h];
      if (u)
        a.push(u.promise);
      else {
        let d;
        l.extensions && l.extensions[Je.KHR_DRACO_MESH_COMPRESSION] ? d = r(l) : d = Oo(new Rt(), l, t), i[h] = { primitive: l, promise: d }, a.push(d);
      }
    }
    return Promise.all(a);
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#meshes
   * @param {number} meshIndex
   * @return {Promise<Group|Mesh|SkinnedMesh>}
   */
  loadMesh(e) {
    const t = this, n = this.json, i = this.extensions, r = n.meshes[e], a = r.primitives, o = [];
    for (let c = 0, l = a.length; c < l; c++) {
      const h = a[c].material === void 0 ? ym(this.cache) : this.getDependency("material", a[c].material);
      o.push(h);
    }
    return o.push(t.loadGeometries(a)), Promise.all(o).then(function(c) {
      const l = c.slice(0, c.length - 1), h = c[c.length - 1], u = [];
      for (let f = 0, g = h.length; f < g; f++) {
        const _ = h[f], m = a[f];
        let p;
        const E = l[f];
        if (m.mode === cn.TRIANGLES || m.mode === cn.TRIANGLE_STRIP || m.mode === cn.TRIANGLE_FAN || m.mode === void 0)
          p = r.isSkinnedMesh === !0 ? new tp(_, E) : new We(_, E), p.isSkinnedMesh === !0 && p.normalizeSkinWeights(), m.mode === cn.TRIANGLE_STRIP ? p.geometry = Uo(p.geometry, 1) : m.mode === cn.TRIANGLE_FAN && (p.geometry = Uo(p.geometry, 2));
        else if (m.mode === cn.LINES)
          p = new ii(_, E);
        else if (m.mode === cn.LINE_STRIP)
          p = new ha(_, E);
        else if (m.mode === cn.LINE_LOOP)
          p = new rp(_, E);
        else if (m.mode === cn.POINTS)
          p = new Ks(_, E);
        else
          throw new Error("THREE.GLTFLoader: Primitive mode unsupported: " + m.mode);
        Object.keys(p.geometry.morphAttributes).length > 0 && Em(p, r), p.name = t.createUniqueName(r.name || "mesh_" + e), Ln(p, r), m.extensions && Qn(i, p, m), t.assignFinalMaterial(p), u.push(p);
      }
      for (let f = 0, g = u.length; f < g; f++)
        t.associations.set(u[f], {
          meshes: e,
          primitives: f
        });
      if (u.length === 1)
        return r.extensions && Qn(i, u[0], r), u[0];
      const d = new Ft();
      r.extensions && Qn(i, d, r), t.associations.set(d, { meshes: e });
      for (let f = 0, g = u.length; f < g; f++)
        d.add(u[f]);
      return d;
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#cameras
   * @param {number} cameraIndex
   * @return {Promise<THREE.Camera>}
   */
  loadCamera(e) {
    let t;
    const n = this.json.cameras[e], i = n[n.type];
    if (!i) {
      console.warn("THREE.GLTFLoader: Missing camera parameters.");
      return;
    }
    return n.type === "perspective" ? t = new $t(Fc.radToDeg(i.yfov), i.aspectRatio || 1, i.znear || 1, i.zfar || 2e6) : n.type === "orthographic" && (t = new nr(-i.xmag, i.xmag, i.ymag, -i.ymag, i.znear, i.zfar)), n.name && (t.name = this.createUniqueName(n.name)), Ln(t, n), Promise.resolve(t);
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#skins
   * @param {number} skinIndex
   * @return {Promise<Skeleton>}
   */
  loadSkin(e) {
    const t = this.json.skins[e], n = [];
    for (let i = 0, r = t.joints.length; i < r; i++)
      n.push(this._loadNodeShallow(t.joints[i]));
    return t.inverseBindMatrices !== void 0 ? n.push(this.getDependency("accessor", t.inverseBindMatrices)) : n.push(null), Promise.all(n).then(function(i) {
      const r = i.pop(), a = i, o = [], c = [];
      for (let l = 0, h = a.length; l < h; l++) {
        const u = a[l];
        if (u) {
          o.push(u);
          const d = new qe();
          r !== null && d.fromArray(r.array, l * 16), c.push(d);
        } else
          console.warn('THREE.GLTFLoader: Joint "%s" could not be found.', t.joints[l]);
      }
      return new la(o, c);
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#animations
   * @param {number} animationIndex
   * @return {Promise<AnimationClip>}
   */
  loadAnimation(e) {
    const t = this.json, n = this, i = t.animations[e], r = i.name ? i.name : "animation_" + e, a = [], o = [], c = [], l = [], h = [];
    for (let u = 0, d = i.channels.length; u < d; u++) {
      const f = i.channels[u], g = i.samplers[f.sampler], _ = f.target, m = _.node, p = i.parameters !== void 0 ? i.parameters[g.input] : g.input, E = i.parameters !== void 0 ? i.parameters[g.output] : g.output;
      _.node !== void 0 && (a.push(this.getDependency("node", m)), o.push(this.getDependency("accessor", p)), c.push(this.getDependency("accessor", E)), l.push(g), h.push(_));
    }
    return Promise.all([
      Promise.all(a),
      Promise.all(o),
      Promise.all(c),
      Promise.all(l),
      Promise.all(h)
    ]).then(function(u) {
      const d = u[0], f = u[1], g = u[2], _ = u[3], m = u[4], p = [];
      for (let E = 0, y = d.length; E < y; E++) {
        const A = d[E], O = f[E], w = g[E], R = _[E], k = m[E];
        if (A === void 0) continue;
        A.updateMatrix && A.updateMatrix();
        const Q = n._createAnimationTracks(A, O, w, R, k);
        if (Q)
          for (let x = 0; x < Q.length; x++)
            p.push(Q[x]);
      }
      return new $r(r, void 0, p);
    });
  }
  createNodeMesh(e) {
    const t = this.json, n = this, i = t.nodes[e];
    return i.mesh === void 0 ? null : n.getDependency("mesh", i.mesh).then(function(r) {
      const a = n._getNodeRef(n.meshCache, i.mesh, r);
      return i.weights !== void 0 && a.traverse(function(o) {
        if (o.isMesh)
          for (let c = 0, l = i.weights.length; c < l; c++)
            o.morphTargetInfluences[c] = i.weights[c];
      }), a;
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#nodes-and-hierarchy
   * @param {number} nodeIndex
   * @return {Promise<Object3D>}
   */
  loadNode(e) {
    const t = this.json, n = this, i = t.nodes[e], r = n._loadNodeShallow(e), a = [], o = i.children || [];
    for (let l = 0, h = o.length; l < h; l++)
      a.push(n.getDependency("node", o[l]));
    const c = i.skin === void 0 ? Promise.resolve(null) : n.getDependency("skin", i.skin);
    return Promise.all([
      r,
      Promise.all(a),
      c
    ]).then(function(l) {
      const h = l[0], u = l[1], d = l[2];
      d !== null && h.traverse(function(f) {
        f.isSkinnedMesh && f.bind(d, bm);
      });
      for (let f = 0, g = u.length; f < g; f++)
        h.add(u[f]);
      return h;
    });
  }
  // ._loadNodeShallow() parses a single node.
  // skin and child nodes are created and added in .loadNode() (no '_' prefix).
  _loadNodeShallow(e) {
    const t = this.json, n = this.extensions, i = this;
    if (this.nodeCache[e] !== void 0)
      return this.nodeCache[e];
    const r = t.nodes[e], a = r.name ? i.createUniqueName(r.name) : "", o = [], c = i._invokeOne(function(l) {
      return l.createNodeMesh && l.createNodeMesh(e);
    });
    return c && o.push(c), r.camera !== void 0 && o.push(i.getDependency("camera", r.camera).then(function(l) {
      return i._getNodeRef(i.cameraCache, r.camera, l);
    })), i._invokeAll(function(l) {
      return l.createNodeAttachment && l.createNodeAttachment(e);
    }).forEach(function(l) {
      o.push(l);
    }), this.nodeCache[e] = Promise.all(o).then(function(l) {
      let h;
      if (r.isBone === !0 ? h = new tc() : l.length > 1 ? h = new Ft() : l.length === 1 ? h = l[0] : h = new St(), h !== l[0])
        for (let u = 0, d = l.length; u < d; u++)
          h.add(l[u]);
      if (r.name && (h.userData.name = r.name, h.name = a), Ln(h, r), r.extensions && Qn(n, h, r), r.matrix !== void 0) {
        const u = new qe();
        u.fromArray(r.matrix), h.applyMatrix4(u);
      } else
        r.translation !== void 0 && h.position.fromArray(r.translation), r.rotation !== void 0 && h.quaternion.fromArray(r.rotation), r.scale !== void 0 && h.scale.fromArray(r.scale);
      return i.associations.has(h) || i.associations.set(h, {}), i.associations.get(h).nodes = e, h;
    }), this.nodeCache[e];
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#scenes
   * @param {number} sceneIndex
   * @return {Promise<Group>}
   */
  loadScene(e) {
    const t = this.extensions, n = this.json.scenes[e], i = this, r = new Ft();
    n.name && (r.name = i.createUniqueName(n.name)), Ln(r, n), n.extensions && Qn(t, r, n);
    const a = n.nodes || [], o = [];
    for (let c = 0, l = a.length; c < l; c++)
      o.push(i.getDependency("node", a[c]));
    return Promise.all(o).then(function(c) {
      for (let h = 0, u = c.length; h < u; h++)
        r.add(c[h]);
      const l = (h) => {
        const u = /* @__PURE__ */ new Map();
        for (const [d, f] of i.associations)
          (d instanceof nn || d instanceof It) && u.set(d, f);
        return h.traverse((d) => {
          const f = i.associations.get(d);
          f != null && u.set(d, f);
        }), u;
      };
      return i.associations = l(r), r;
    });
  }
  _createAnimationTracks(e, t, n, i, r) {
    const a = [], o = e.name ? e.name : e.uuid, c = [];
    zn[r.path] === zn.weights ? e.traverse(function(d) {
      d.morphTargetInfluences && c.push(d.name ? d.name : d.uuid);
    }) : c.push(o);
    let l;
    switch (zn[r.path]) {
      case zn.weights:
        l = Fi;
        break;
      case zn.rotation:
        l = Bi;
        break;
      case zn.position:
      case zn.scale:
        l = Oi;
        break;
      default:
        switch (n.itemSize) {
          case 1:
            l = Fi;
            break;
          case 2:
          case 3:
          default:
            l = Oi;
            break;
        }
        break;
    }
    const h = i.interpolation !== void 0 ? Mm[i.interpolation] : 2301, u = this._getArrayFromAccessor(n);
    for (let d = 0, f = c.length; d < f; d++) {
      const g = new l(
        c[d] + "." + zn[r.path],
        t.array,
        u,
        h
      );
      i.interpolation === "CUBICSPLINE" && this._createCubicSplineTrackInterpolant(g), a.push(g);
    }
    return a;
  }
  _getArrayFromAccessor(e) {
    let t = e.array;
    if (e.normalized) {
      const n = ea(t.constructor), i = new Float32Array(t.length);
      for (let r = 0, a = t.length; r < a; r++)
        i[r] = t[r] * n;
      t = i;
    }
    return t;
  }
  _createCubicSplineTrackInterpolant(e) {
    e.createInterpolant = function(n) {
      const i = this instanceof Bi ? vm : hc;
      return new i(this.times, this.values, this.getValueSize() / 3, n);
    }, e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline = !0;
  }
}
function Rm(s, e, t) {
  const n = e.attributes, i = new vn();
  if (n.POSITION !== void 0) {
    const o = t.json.accessors[n.POSITION], c = o.min, l = o.max;
    if (c !== void 0 && l !== void 0) {
      if (i.set(
        new L(c[0], c[1], c[2]),
        new L(l[0], l[1], l[2])
      ), o.normalized) {
        const h = ea(Di[o.componentType]);
        i.min.multiplyScalar(h), i.max.multiplyScalar(h);
      }
    } else {
      console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");
      return;
    }
  } else
    return;
  const r = e.targets;
  if (r !== void 0) {
    const o = new L(), c = new L();
    for (let l = 0, h = r.length; l < h; l++) {
      const u = r[l];
      if (u.POSITION !== void 0) {
        const d = t.json.accessors[u.POSITION], f = d.min, g = d.max;
        if (f !== void 0 && g !== void 0) {
          if (c.setX(Math.max(Math.abs(f[0]), Math.abs(g[0]))), c.setY(Math.max(Math.abs(f[1]), Math.abs(g[1]))), c.setZ(Math.max(Math.abs(f[2]), Math.abs(g[2]))), d.normalized) {
            const _ = ea(Di[d.componentType]);
            c.multiplyScalar(_);
          }
          o.max(c);
        } else
          console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");
      }
    }
    i.expandByVector(o);
  }
  s.boundingBox = i;
  const a = new Sn();
  i.getCenter(a.center), a.radius = i.min.distanceTo(i.max) / 2, s.boundingSphere = a;
}
function Oo(s, e, t) {
  const n = e.attributes, i = [];
  function r(a, o) {
    return t.getDependency("accessor", a).then(function(c) {
      s.setAttribute(o, c);
    });
  }
  for (const a in n) {
    const o = Qr[a] || a.toLowerCase();
    o in s.attributes || i.push(r(n[a], o));
  }
  if (e.indices !== void 0 && !s.index) {
    const a = t.getDependency("accessor", e.indices).then(function(o) {
      s.setIndex(o);
    });
    i.push(a);
  }
  return it.workingColorSpace !== Bt && "COLOR_0" in n && console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${it.workingColorSpace}" not supported.`), Ln(s, e), Rm(s, e, t), Promise.all(i).then(function() {
    return e.targets !== void 0 ? Sm(s, e.targets, t) : s;
  });
}
function Cm(s) {
  const e = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new Map(), n = s.clone();
  return uc(s, n, function(i, r) {
    e.set(r, i), t.set(i, r);
  }), n.traverse(function(i) {
    if (!i.isSkinnedMesh) return;
    const r = i, a = e.get(i), o = a.skeleton.bones;
    r.skeleton = a.skeleton.clone(), r.bindMatrix.copy(a.bindMatrix), r.skeleton.bones = o.map(function(c) {
      return t.get(c);
    }), r.bind(r.skeleton, r.bindMatrix);
  }), n;
}
function uc(s, e, t) {
  t(s, e);
  for (let n = 0; n < s.children.length; n++)
    uc(s.children[n], e.children[n], t);
}
const qr = /* @__PURE__ */ new Map();
function dc(s, e) {
  return qr.has(s) || qr.set(s, e()), qr.get(s);
}
function Im(s) {
  const e = new vn().setFromObject(s), t = e.getCenter(new L());
  s.position.set(-t.x, -e.min.y, -t.z);
  const n = new Ft();
  return n.add(s), n.userData.size = e.getSize(new L()), n;
}
function fc(s) {
  return s.traverse((e) => {
    e.isMesh && (e.castShadow = !0, e.receiveShadow = !0);
  }), s;
}
function qs(s, e) {
  return dc("f:" + e, async () => {
    const t = s + "models/furniture/", n = await new qp().setPath(t).loadAsync(e + ".mtl");
    n.preload(), Object.values(n.materials).forEach((a) => {
      a.shininess = 8, a.specular = new Pe(2236962);
    });
    const i = await new Xp().setMaterials(n).setPath(t).loadAsync(e + ".obj");
    i.rotation.y = Math.PI;
    const r = new Ft();
    return r.add(i), Im(fc(r));
  }).then((t) => {
    const n = t.clone();
    return n.userData.size = t.userData.size, n;
  });
}
function Pm(s) {
  return dc("g:" + s, () => new Yp().loadAsync(s));
}
async function jr(s, e) {
  const t = await Pm(s + "models/characters/" + e + ".glb");
  return { scene: fc(Cm(t.scene)), animations: t.animations };
}
const Lm = 4.6;
class ma {
  static async create(e, t, n = {}) {
    const { scene: i, animations: r } = await jr(e, t), a = new ma(i, r, n);
    if (n.wheelchair) {
      const o = await jr(e, "wheelchair");
      o.scene.scale.copy(i.scale), a.root.add(o.scene), a.wheel = !0, a.play("wheelchair-sit");
    }
    if (n.cane) {
      const o = await jr(e, "aid-cane"), c = i.getObjectByName("arm-right");
      c && (o.scene.position.set(-0.05, -0.18, 0.06), c.add(o.scene));
    }
    return a;
  }
  // Pick the clip for what the actor is doing right now (wheelchair users have their own set).
  pose(e) {
    if (this.wheel) return this.play(e === "walk" ? "wheelchair-move-forward" : "wheelchair-sit");
    this.play({ walk: "walk", sit: "sit", work: "interact-right", idle: "idle", happy: "emote-yes", angry: "emote-no" }[e] || "idle");
  }
  constructor(e, t, { hat: n = !1, apron: i = null } = {}) {
    this.root = new Ft();
    const r = new vn().setFromObject(e), a = Lm / Math.max(0.01, r.max.y - r.min.y);
    if (e.scale.setScalar(a), e.position.y = -r.min.y * a, this.root.add(e), this.mixer = new Op(e), this.actions = {}, t.forEach((o) => {
      this.actions[o.name] = this.mixer.clipAction(o);
    }), this.current = null, this.path = null, this.onArrive = null, this.yOffset = 0, n) {
      const o = e.getObjectByName("head"), c = new Zt({ color: 16777215, roughness: 0.7 }), l = new Ft(), h = new We(new ls(0.19, 0.2, 0.07, 24), c), u = new We(new Pi(0.21, 24, 16), c);
      u.scale.y = 0.72, u.position.y = 0.1, l.add(h, u), l.traverse((d) => {
        d.isMesh && (d.castShadow = !0);
      }), l.position.set(0, 0.31, 0.01), (o || e).add(l);
    }
    if (i) {
      const o = e.getObjectByName("torso"), c = new We(new ki(0.2, 0.15), new Zt({ color: i, roughness: 0.9, side: 2 }));
      c.position.set(0, 0.03, 0.115), (o || e).add(c);
    }
    this.play("idle");
  }
  play(e, { once: t = !1, fade: n = 0.2 } = {}) {
    const i = this.actions[e];
    !i || this.current === i || (i.reset(), i.setLoop(t ? 2200 : 2201, 1 / 0), i.clampWhenFinished = t, i.fadeIn(n).play(), this.current && this.current.fadeOut(n), this.current = i);
  }
  // Walk through world points at `speed` units/s, then call done().
  walk(e, t, n) {
    this.path = e.map((i) => i.clone()), this.speed = t, this.onArrive = n || null, this.path.length && this.play("walk");
  }
  face(e) {
    const t = e.x - this.root.position.x, n = e.z - this.root.position.z;
    Math.hypot(t, n) > 0.01 && (this.root.rotation.y = Math.atan2(t, n));
  }
  update(e) {
    if (this.mixer.update(e), !this.path) return;
    let t = this.speed * e;
    for (; t > 0 && this.path.length; ) {
      const n = this.path[0], i = this.root.position, r = Math.hypot(n.x - i.x, n.z - i.z);
      this.face(n), r <= t ? (i.x = n.x, i.z = n.z, this.path.shift(), t -= r) : (i.x += (n.x - i.x) / r * t, i.z += (n.z - i.z) / r * t, t = 0);
    }
    if (!this.path.length) {
      this.path = null, this.play("idle");
      const n = this.onArrive;
      this.onArrive = null, n && n();
    }
  }
}
const Ke = 5, Dm = 0.1, ko = 3.4, rs = 3, Um = 32;
function Nm(s) {
  const e = new Pe(s.color || "#94a3b8"), t = e.clone().multiplyScalar(0.5);
  return { color: e, opacity: s.opacity ?? 0.24, ink: `rgba(${Math.round(t.r * 255)},${Math.round(t.g * 255)},${Math.round(t.b * 255)},0.85)` };
}
function Fm(s, e) {
  const t = document.createElement("canvas");
  t.width = 512, t.height = 128;
  const n = t.getContext("2d");
  n.font = '900 96px "Pretendard", "Noto Sans KR", sans-serif', n.textAlign = "center", n.textBaseline = "middle", n.fillStyle = e, n.fillText(s, 256, 68);
  const i = new ap(t);
  i.colorSpace = At;
  const r = new We(new ki(32, 8), new bt({ map: i, transparent: !0, depthWrite: !1 }));
  return r.rotation.x = -Math.PI / 2, r.rotation.z = Math.PI / 4, r;
}
const bi = { uSight: { value: null }, uSightOn: { value: 0 }, uSightSize: { value: new Xe(1, 1) } };
function Bm(s, { base: e, world: t }) {
  const n = t.w, i = t.h, r = n * Ke, a = i * Ke, o = Math.max(r, a);
  let c = !1;
  const l = new $f({ antialias: !0, alpha: !0 });
  l.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)), l.outputColorSpace = At, l.toneMapping = 4, l.shadowMap.enabled = !0, l.shadowMap.type = 2, l.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;outline:none", l.domElement.tabIndex = 0, s.prepend(l.domElement);
  const h = new Jf(), u = new nr(-10, 10, 10, -10, 0.1, 800), d = new xp(16773596, 9071439, 1.15), f = new cc(16773334, 2.3);
  f.castShadow = !0, f.shadow.mapSize.set(2048, 2048), f.shadow.bias = -4e-4, f.shadow.normalBias = 0.05, Object.assign(f.shadow.camera, { left: -o, right: o, top: o, bottom: -o, near: 1, far: 300 + o }), f.position.set(r / 2 + 40 - o * 0.35, 90, a / 2 + 50 + o * 0.4), f.target.position.set(r / 2, 0, a / 2), h.add(d, f, f.target);
  const g = (M, I, D = 0) => new L(M * Ke, D, I * Ke), _ = new Int16Array(n * i).fill(-1);
  t.areas.forEach((M, I) => {
    for (let D = M.x0; D < M.x1; D++) for (let C = M.y0; C < M.y1; C++) _[C * n + D] = I;
  });
  function m(M, I) {
    const D = Math.floor(M), C = Math.floor(I);
    return D >= 0 && C >= 0 && D < n && C < i ? _[C * n + D] : -1;
  }
  function p(M, I) {
    const D = m(M, I);
    if (D < 0) return 0;
    const C = t.areas[D];
    if (C.kind !== "stairs") return C.h || 0;
    const F = C.axis === "x" ? (M - C.x0) / (C.x1 - C.x0) : (I - C.y0) / (C.y1 - C.y0);
    return C.from + (C.to - C.from) * Math.min(1, Math.max(0, F));
  }
  const E = (M, I) => p(M, I) * rs, y = (M, I, D = 0) => g(M, I, E(M, I) + D), A = new Pe(13808780), O = /* @__PURE__ */ new Set();
  function w(M, I, D, C, F, me) {
    const Ie = Math.min(F, 0) - 0.6, ae = new We(new Ut((D - M) * Ke, F - Ie, (C - I) * Ke), me);
    ae.position.copy(g((M + D) / 2, (I + C) / 2, (F + Ie) / 2)), ae.receiveShadow = !0, ae.castShadow = F > 0, h.add(ae);
  }
  for (const M of t.areas) {
    const I = Nm(M);
    if (M.kind === "stairs") {
      const me = new Zt({ color: 12101519, roughness: 0.8 }), Ie = M.axis === "x" ? M.x1 - M.x0 : M.y1 - M.y0, ae = Ie * 3;
      for (let Re = 0; Re < ae; Re++) {
        const tt = Re / ae, Ge = (Re + 1) / ae, Ve = M.from + (M.to - M.from) * (M.from < M.to ? Ge : tt);
        M.axis === "x" ? w(M.x0 + tt * Ie, M.y0, M.x0 + Ge * Ie, M.y1, Ve * rs, me) : w(M.x0, M.y0 + tt * Ie, M.x1, M.y0 + Ge * Ie, Ve * rs, me);
      }
      continue;
    }
    const D = M.kind === "jail" ? new Pe(9741240) : A.clone().lerp(I.color, M.kind === "corridor" ? 0.15 : 0.32);
    (M.h || 0) > 0 && D.offsetHSL(0, 0, 0.05), (M.h || 0) < 0 && D.offsetHSL(0, 0, -0.08), w(M.x0, M.y0, M.x1, M.y1, (M.h || 0) * rs, new Zt({ color: D, roughness: 0.85 }));
    const C = M.group || M.name + M.x0 + "," + M.y0;
    if (M.kind === "jail" || O.has(C)) continue;
    O.add(C);
    const F = Fm(M.name, I.ink);
    F.scale.setScalar(Math.min(1, Math.min(M.x1 - M.x0, M.y1 - M.y0) * Ke * 1.3 / 32)), F.position.copy(g((M.x0 + M.x1) / 2, (M.y0 + M.y1) / 2, (M.h || 0) * rs + 0.025)), h.add(F);
  }
  function R(M) {
    const D = (M.o === "v" ? [[M.f - 0.05, M.t + 0.5], [M.f + 0.05, M.t + 0.5]] : [[M.t + 0.5, M.f - 0.05], [M.t + 0.5, M.f + 0.05]]).filter(([C, F]) => m(C, F) >= 0).map(([C, F]) => E(C, F));
    return { bottom: Math.min(...D), top: Math.max(...D) };
  }
  (async () => {
    for (const M of t.walls) {
      const I = await qs(e, "wallHalf");
      if (c) return;
      const D = R(M);
      I.scale.set(Ke / I.userData.size.x, (D.top - D.bottom + ko) / I.userData.size.y, 1), M.o === "v" ? (I.rotation.y = Math.PI / 2, I.position.copy(g(M.f, M.t + 0.5, D.bottom))) : I.position.copy(g(M.t + 0.5, M.f, D.bottom)), h.add(I);
    }
    await gt();
    for (const M of t.decor) {
      const I = await qs(e, M.model);
      if (c) return;
      I.position.copy(y(M.x + 1, M.y + 1, 0.03)), h.add(I);
    }
    for (const M of t.props) {
      const I = await qs(e, M.model);
      if (c) return;
      const D = I.userData.size, [C, F] = M.rot % 2 ? [M.d, M.w] : [M.w, M.d];
      I.scale.set(Math.min(1, (C + 0.12) * Ke / D.x), 1, Math.min(1, (F + 0.12) * Ke / D.z)), I.rotation.y = M.rot * Math.PI / 2, I.position.copy(y(M.x + M.w / 2, M.y + M.d / 2)), h.add(I);
    }
  })();
  const k = new Zt({ color: 3359061, roughness: 0.5, metalness: 0.4 }), Q = new Ut(0.35, 5.5, 0.35);
  for (const M of t.fences || []) {
    const I = R(M).top, D = M.o === "v" ? (C) => g(M.f, M.t + C) : (C) => g(M.t + C, M.f);
    for (const C of [0, 0.5, 1]) {
      const F = new We(Q, k);
      F.position.copy(D(C)).setY(I + 2.75), F.castShadow = !0, h.add(F);
    }
    for (const C of [0.6, 5.2]) {
      const F = new We(new Ut(M.o === "v" ? 0.3 : Ke, 0.3, M.o === "v" ? Ke : 0.3), k);
      F.position.copy(D(0.5)).setY(I + C), h.add(F);
    }
  }
  let x = null;
  if (t.pad) {
    const M = t.pad;
    x = new We(new ni(M.r * Ke - 0.7, M.r * Ke, 48), new bt({ color: 16436245, transparent: !0, opacity: 0.9, side: 2 })), x.userData.noSight = !0, x.rotation.x = -Math.PI / 2, x.position.copy(y(M.cx, M.cy, 0.08));
    const I = new We(new ua(M.r * Ke - 0.7, 48), new bt({ color: 16639626, transparent: !0, opacity: 0.45 }));
    I.rotation.x = -Math.PI / 2, I.position.copy(y(M.cx, M.cy, 0.07)), h.add(x, I);
  }
  const T = 1.6, q = new L(r / 2, 0, a / 2);
  function X() {
    const M = s.clientWidth || 600, I = s.clientHeight || 400;
    l.setSize(M, I, !1);
    const D = Um * Ke * 0.62 / T, C = M / I;
    u.left = -D * C, u.right = D * C, u.top = D, u.bottom = -D, u.updateProjectionMatrix();
  }
  function j() {
    u.position.copy(q).add(new L(1, 0.9, 1).normalize().multiplyScalar(300)), u.lookAt(q);
  }
  X(), j();
  const te = new ResizeObserver(X);
  te.observe(s);
  const W = t.radius, oe = t.shapes;
  function K(M, I) {
    for (let D = 0; D < 8; D++) {
      let C = !1;
      for (const F of I) {
        const me = M.x - F.x, Ie = M.y - F.y, ae = Math.hypot(me, Ie), Re = W * 2;
        ae >= Re || ae < 1e-6 || (M.x += me / ae * (Re - ae), M.y += Ie / ae * (Re - ae), C = !0);
      }
      for (const F of oe) {
        let me, Ie;
        F.kind === "circle" ? (me = F.cx, Ie = F.cy) : (me = Math.min(Math.max(M.x, F.cx - F.hx), F.cx + F.hx), Ie = Math.min(Math.max(M.y, F.cy - F.hy), F.cy + F.hy));
        let ae = M.x - me, Re = M.y - Ie;
        const tt = F.kind === "circle" ? F.r + W : W;
        let Ge = Math.hypot(ae, Re);
        if (!(Ge >= tt)) {
          if (Ge < 1e-6) {
            const Ve = F.hx - Math.abs(M.x - F.cx), ct = F.hy - Math.abs(M.y - F.cy);
            Ve < ct ? (ae = Math.sign(M.x - F.cx) || 1, Re = 0, Ge = -Ve) : (ae = 0, Re = Math.sign(M.y - F.cy) || 1, Ge = -ct), M.x += ae * (tt - Ge + 1e-3), M.y += Re * (tt - Ge + 1e-3);
          } else
            M.x += ae / Ge * (tt - Ge + 1e-3), M.y += Re / Ge * (tt - Ge + 1e-3);
          C = !0;
        }
      }
      if (M.x = Math.min(Math.max(M.x, W), n - W), M.y = Math.min(Math.max(M.y, W), i - W), !C) break;
    }
    return M;
  }
  function ge(M, I) {
    return oe.some((D) => D.kind === "circle" ? Math.hypot(M - D.cx, I - D.cy) < D.r + W - 1e-3 : Math.hypot(Math.max(Math.abs(M - D.cx) - D.hx, 0), Math.max(Math.abs(I - D.cy) - D.hy, 0)) < W - 1e-3);
  }
  const fe = new Ft();
  fe.visible = !1, h.add(fe);
  const Ae = new bt({ color: 16722902, transparent: !0, opacity: 0.45, depthWrite: !1 }), at = new Dn({ color: 16722902 });
  oe.forEach((M) => {
    const I = M.kind === "circle" ? new ls(M.r * Ke, M.r * Ke, 1.2, 40) : new Ut(M.hx * 2 * Ke, 1.2, M.hy * 2 * Ke), D = new We(I, Ae);
    D.add(new ii(new op(I, 20), at)), D.position.copy(y(M.cx, M.cy, 0.6)), D.renderOrder = 10, fe.add(D);
  });
  const lt = new ni(W * Ke - 0.25, W * Ke, 40), $ = new bt({ color: 5195493, transparent: !0, opacity: 0.8, side: 2, depthWrite: !1 }), ie = { cop: 2450411, thief: 14427686 }, Ee = new Pe(16777215);
  function Me(M) {
    const I = new Ft();
    if (M === "cop") {
      const D = new Zt({ color: 1920728, roughness: 0.6 }), C = new We(new ls(0.2, 0.22, 0.12, 24), D), F = new We(new Ut(0.3, 0.025, 0.14), new Zt({ color: 988970 }));
      F.position.set(0, -0.04, 0.2);
      const me = new We(new Ut(0.07, 0.07, 0.02), new Zt({ color: 16436245, metalness: 0.6 }));
      me.position.set(0, 0.01, 0.215), I.add(C, F, me);
    } else if (M === "thief") {
      const D = new Zt({ color: 1120295, roughness: 0.9 }), C = new We(new Pi(0.235, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), D);
      C.scale.y = 0.7, I.add(C);
    }
    return I.position.set(0, 0.3, 0), I.traverse((D) => {
      D.isMesh && (D.castShadow = !0);
    }), I;
  }
  function He() {
    const M = new Ft(), I = new Zt({ color: 16436245, roughness: 0.45 }), D = new Zt({ color: 1120295, roughness: 0.6 }), C = new We(new Ut(0.06, 0.07, 0.17), I);
    C.position.set(0, 0, 0.06);
    const F = new We(new Ut(0.05, 0.09, 0.05), D);
    F.position.set(0, -0.06, 0), F.rotation.x = -0.25;
    const me = new We(new Ut(0.065, 0.075, 0.05), D);
    me.position.set(0, 0, 0.16);
    const Ie = new We(new Ut(0.02, 0.02, 0.01), new bt({ color: 3718648 }));
    return Ie.position.set(0, 0.025, 0.186), M.add(C, F, me, Ie), M.position.set(-0.27, 0, 0.07), M.rotation.z = -Math.PI / 4, M.scale.setScalar(1.4), M.traverse((ae) => {
      ae.isMesh && (ae.castShadow = !0);
    }), M;
  }
  function Ue(M, I) {
    if (!M.actor || M.team === I) return;
    M.team = I;
    const D = M.actor.root.getObjectByName("head"), C = M.actor.root.getObjectByName("arm-right");
    M.hat && (M.hat.parent.remove(M.hat), M.hat = null), M.gun && (M.gun.parent.remove(M.gun), M.gun = null), I && D && (M.hat = Me(I), D.add(M.hat)), I === "cop" && C && (M.gun = He(), C.add(M.gun));
  }
  const Ce = /* @__PURE__ */ new Map();
  let Le = null, z = null;
  async function P(M) {
    const I = { actor: null, x: M.x, y: M.y, dir: M.dir || 0, moving: !1, name: M.name, model: M.model, hidden: !!M.hidden };
    Ce.set(M.id, I);
    const D = await ma.create(e, M.model, {});
    if (!Ce.has(M.id)) return;
    I.actor = D, Number.isFinite(I.x) && D.root.position.copy(y(I.x, I.y));
    const C = new We(lt, $.clone());
    C.rotation.x = -Math.PI / 2, C.position.y = 0.3, I.ring = C, D.root.add(C), h.add(D.root), Ue(I, I.wantTeam);
  }
  function Wt(M, I) {
    Le = I;
    const D = /* @__PURE__ */ new Set();
    M.forEach((C) => {
      D.add(C.id), Ce.has(C.id) || P(C);
      const F = Ce.get(C.id);
      if (F.name = C.name, F.online = C.online, F.jailed = C.jailed, F.safe = C.safe, F.wantTeam = C.team, Ue(F, C.team), C.stun > 0 && (F.stunEnd = performance.now() / 1e3 + C.stun), C.id === Le) {
        (!z || C.tp !== z.tp) && (z = { ...z || {}, x: C.x, y: C.y, dir: C.dir, tp: C.tp }), z.speed = C.speed, z.frozen = C.frozen, z.jailed = C.jailed, z.team = C.team, z.grabbed = !!C.grabbed, z.grabbing = C.grabbing != null;
        const Re = (C.stamina ?? 1) * t.run.stamina;
        (z.stamina == null || Math.abs(z.stamina - Re) > 0.6) && (z.stamina = Re);
        return;
      }
      if (C.hidden) {
        F.hidden = !0, F.moving = !1;
        return;
      }
      F.hidden && (F.hidden = !1, F.snap = !0, F.sampleAt = 0, F.x = C.x, F.y = C.y);
      const me = performance.now() / 1e3, Ie = me - (F.sampleAt || 0), ae = Math.hypot(C.x - F.x, C.y - F.y);
      if (!C.moving || ae > 3 || Ie > 0.5)
        F.vx = 0, F.vy = 0;
      else if (Ie > 0.02) {
        const Re = Math.min(1, 9 / Math.max(1e-6, ae / Ie));
        F.vx = (C.x - F.x) / Ie * Re, F.vy = (C.y - F.y) / Ie * Re;
      }
      F.snap = ae > 3, F.sampleAt = me, F.x = C.x, F.y = C.y, F.dir = C.dir, F.moving = C.moving, F.running = !!C.running, F.grabbedNow = !!C.grabbed, F.grabbing = C.grabbing;
    });
    for (const [C, F] of Ce)
      D.has(C) || (F.actor && h.remove(F.actor.root), Ce.delete(C));
  }
  function Qe(M, I) {
    z && !ge(M, I) && (z.x = M, z.y = I);
  }
  function st() {
    for (const M of Ce.values()) M.actor && h.remove(M.actor.root);
    Ce.clear(), z = null, Le = null;
  }
  const Be = [];
  async function gt() {
    if (!(t.doors || []).length) return;
    const M = await qs(e, "doorway");
    let I = null;
    if (M.traverse((ae) => {
      ae.isMesh && ae.name && ae.name !== "doorway" && (I = ae);
    }), !I || c) return;
    const D = I.geometry.clone();
    D.computeBoundingBox();
    const C = D.boundingBox;
    D.translate(-C.min.x, -C.min.y, -(C.min.z + C.max.z) / 2);
    const F = C.max.x - C.min.x, me = C.max.y - C.min.y, Ie = ko + 0.3;
    for (const ae of t.doors) {
      const Re = ae.t1 - ae.t0;
      if (Re > 2) continue;
      const tt = Re / (Re === 2 ? 2 : 1), Ge = Re === 2 ? [[ae.t0, 1], [ae.t1, -1]] : [[ae.t0, 1]], Ve = (ae.t0 + ae.t1) / 2, [ct, Mt] = ae.o === "h" ? [Ve, ae.f] : [ae.f, Ve];
      for (const [Nt, Mn] of Ge) {
        const sn = new We(D, I.material);
        sn.castShadow = !0, sn.scale.set(tt * Ke / F * 0.98, Ie / me, 1);
        const rn = new Ft();
        rn.add(sn);
        const [gc, _c] = ae.o === "h" ? [Nt, ae.f] : [ae.f, Nt];
        rn.position.copy(g(gc, _c, E(ct + (ae.o === "v" ? 0.01 : 0), Mt + (ae.o === "h" ? 0.01 : 0))));
        const _a = ae.o === "h" ? Mn > 0 ? 0 : Math.PI : Mn > 0 ? -Math.PI / 2 : Math.PI / 2, xc = ae.o === "h" ? Mn : -Mn;
        rn.rotation.y = _a, h.add(rn), Be.push({ group: rn, base: _a, k: xc, o: ae.o, f: ae.f, cx: ct, cy: Mt, cur: 0, side: 1 });
      }
    }
  }
  function ze(M) {
    for (const I of Be) {
      let D = null, C = 1.6;
      for (const [F, me] of Ce) {
        if (!me.actor || me.hidden && F !== Le) continue;
        const Ie = F === Le && z ? z.x : me.actor.root.position.x / Ke, ae = F === Le && z ? z.y : me.actor.root.position.z / Ke, Re = Math.hypot(Ie - I.cx, ae - I.cy);
        Re < C && (C = Re, D = [Ie, ae]);
      }
      D && (I.side = Math.sign(I.o === "h" ? D[1] - I.f : D[0] - I.f) || 1), I.cur += ((D ? 1.35 : 0) - I.cur) * Math.min(1, M * 9), I.group.rotation.y = I.base + I.k * I.side * I.cur;
    }
  }
  const b = { has: !1, x: 0, y: 0 }, v = new kp(), G = new Xe(), J = new Gn(new L(0, 1, 0), 0), ne = new L();
  function Z(M) {
    const I = l.domElement.getBoundingClientRect();
    G.set((M.clientX - I.left) / I.width * 2 - 1, -((M.clientY - I.top) / I.height) * 2 + 1), v.setFromCamera(G, u), J.constant = -(z ? E(z.x, z.y) : 0), v.ray.intersectPlane(J, ne) && (b.x = ne.x / Ke, b.y = ne.z / Ke, b.has = !0);
  }
  function be(M) {
    M.button !== 0 || !z || z.team !== "cop" || (Z(M), U());
  }
  l.domElement.addEventListener("pointermove", Z), l.domElement.addEventListener("pointerdown", be);
  const ce = new We(new Ut(1, 0.06, 0.3), new bt({ color: 16436245, transparent: !0, opacity: 0.7, depthWrite: !1 })), de = new We(new ni(0.8, 1.15, 32), new bt({ color: 16436245, transparent: !0, opacity: 0.9, side: 2, depthWrite: !1 }));
  de.rotation.x = -Math.PI / 2, ce.userData.noSight = de.userData.noSight = !0, ce.visible = de.visible = !1, h.add(ce, de);
  function rt() {
    const M = vt && z && z.team === "cop" && b.has && !(z.frozen > 0);
    if (ce.visible = de.visible = !!M, !M) return;
    const I = b.x - z.x, D = b.y - z.y, C = Math.min(t.taser.range, Math.hypot(I, D)) || 0.01, F = Math.atan2(I, D), me = z.x + Math.sin(F) * C, Ie = z.y + Math.cos(F) * C, ae = E(z.x, z.y) + 0.15;
    ce.scale.x = C * Ke, ce.position.set((z.x + me) / 2 * Ke, ae, (z.y + Ie) / 2 * Ke), ce.rotation.y = F - Math.PI / 2, de.position.set(me * Ke, E(me, Ie) + 0.16, Ie * Ke);
    const Re = performance.now() / 1e3 >= ke;
    ce.material.color.setHex(Re ? 16436245 : 9741240), de.material.color.setHex(Re ? 16436245 : 9741240);
  }
  const re = new ii(
    new Rt().setAttribute("position", new dt(new Float32Array(8 * 2 * 3), 3)),
    new Dn({ color: 16638023 })
  );
  re.frustumCulled = !1, h.add(re);
  function ye() {
    const M = re.geometry.attributes.position;
    let I = 0;
    for (const [D, C] of Ce) {
      const F = D === Le && z ? z.grabbing ? [...Ce.entries()].find(([, Re]) => Re.grabbedNow)?.[0] : null : C.grabbing, me = F != null ? Ce.get(F) : null;
      if (!C.actor || !me || !me.actor || I >= 8) continue;
      const Ie = C.actor.root.position, ae = me.actor.root.position;
      M.setXYZ(I * 2, Ie.x, Ie.y + 2.2, Ie.z), M.setXYZ(I * 2 + 1, ae.x, ae.y + 2.6, ae.z), I++;
    }
    for (let D = I * 2; D < 16; D++) M.setXYZ(D, 0, -999, 0);
    M.needsUpdate = !0;
  }
  const De = /* @__PURE__ */ new Set(), Ne = { w: [-1, -1], arrowup: [-1, -1], s: [1, 1], arrowdown: [1, 1], a: [-1, 1], arrowleft: [-1, 1], d: [1, -1], arrowright: [1, -1] };
  let ve = !1, je = !1, ke = 0, ft = null;
  function U() {
    const M = performance.now() / 1e3;
    if (!z || z.team !== "cop" || z.frozen > 0 || M < ke) return;
    ke = M + t.taser.cooldown;
    const I = b.has ? Math.atan2(b.x - z.x, b.y - z.y) : z.dir;
    z.dir = I, we(Ce.get(Le)), le && (ue = 0, le({ x: +z.x.toFixed(3), y: +z.y.toFixed(3), dir: +z.dir.toFixed(3), moving: !1, run: !1 })), ft && ft(+I.toFixed(4));
  }
  function _e(M) {
    const I = M.key.toLowerCase();
    if ((I === " " || I === "shift") && !M.target.closest("input, textarea, button") && z) {
      M.preventDefault(), z.team === "thief" ? ve = !0 : I === " " && !M.repeat && U();
      return;
    }
    if (I === "e" && !M.target.closest("input, textarea") && Le) {
      M.repeat || N();
      return;
    }
    if (ga[I] && !M.target.closest("input, textarea") && Le) {
      or && !M.repeat && or(ga[I]);
      return;
    }
    if (I === "h" && !M.target.closest("input, textarea") && Le) {
      fe.visible = !fe.visible;
      return;
    }
    !Ne[I] || M.target.closest("input, textarea") || !Le || (M.preventDefault(), De.add(I));
  }
  const Y = (M) => {
    const I = M.key.toLowerCase();
    De.delete(I), (I === " " || I === "shift") && (ve = !1), I === "e" && B();
  }, ee = () => {
    De.clear(), ve = !1, B();
  };
  window.addEventListener("keydown", _e), window.addEventListener("keyup", Y), window.addEventListener("blur", ee);
  let le = null, ue = 0, et = !1;
  function Tt(M) {
    if (!z) return !1;
    let I = 0, D = 0;
    De.forEach((Ie) => {
      I += Ne[Ie][0], D += Ne[Ie][1];
    });
    const C = Math.hypot(I, D), F = C > 0, me = z.frozen > 0;
    if (me && (z.frozen = Math.max(0, z.frozen - M)), je = z.team === "thief" && ve && F && !me && !z.jailed && (z.stamina ?? 0) > 0, je ? z.stamina = Math.max(0, z.stamina - M) : z.stamina != null && (z.stamina = Math.min(t.run.stamina, z.stamina + M * t.run.regen)), F && !me) {
      const Ie = z.grabbed ? t.arrest.slow : z.grabbing ? t.arrest.cop_slow : 1, ae = (z.speed || t.speed.lobby) * (je ? t.run.mult : 1) * Ie * M, Re = Math.max(1, Math.ceil(ae / 0.08)), tt = [...Ce.entries()].filter(([ct, Mt]) => ct !== Le && !Mt.hidden && Number.isFinite(Mt.x) && Number.isFinite(Mt.y)).map(([, ct]) => ct), Ge = I / C * ae / Re, Ve = D / C * ae / Re;
      for (let ct = 0; ct < Re; ct++) {
        const Mt = z.x, Nt = z.y;
        if (z.x += Ge, z.y += Ve, K(z, tt), !ge(z.x, z.y)) continue;
        z.x = Mt + Ge, z.y = Nt, K(z, tt), ge(z.x, z.y) && (z.x = Mt, z.y = Nt);
        const Mn = z.x;
        z.y += Ve, K(z, tt), ge(z.x, z.y) && (z.x = Mn, z.y -= Ve, ge(z.x, z.y) && (z.x = Mt, z.y = Nt)), (!Number.isFinite(z.x) || !Number.isFinite(z.y)) && (z.x = Mt, z.y = Nt);
      }
      z.dir = Math.atan2(I, D);
    }
    return ue += M, le && (F && ue >= Dm || F !== et) && (ue = 0, le({ x: +z.x.toFixed(3), y: +z.y.toFixed(3), dir: +z.dir.toFixed(3), moving: F, run: je })), et = F && !me, F && !me;
  }
  const Ot = new Pi(0.75, 10, 8), ot = new ni(1.1, 1.6, 40), Ct = [];
  function hn(M, I, D) {
    const C = new We(ot, new bt({ color: D, transparent: !0, opacity: 0.9, side: 2, depthWrite: !1 }));
    C.rotation.x = -Math.PI / 2, C.position.copy(y(M, I, 0.15)), C.userData.life = 0, h.add(C), Ct.push(C);
  }
  const qn = [];
  function Vi(M, I) {
    const D = new We(Ot, new bt({ color: 16118248, transparent: !0, opacity: 0.85, depthWrite: !1 }));
    D.position.copy(y(M + (Math.random() - 0.5) * 0.25, I + (Math.random() - 0.5) * 0.25, 0.35)), D.userData.life = 0, h.add(D), qn.push(D);
  }
  function An(M) {
    for (let I = qn.length - 1; I >= 0; I--) {
      const D = qn[I];
      D.userData.life += M;
      const C = D.userData.life / 0.5;
      if (C >= 1) {
        h.remove(D), D.material.dispose(), qn.splice(I, 1);
        continue;
      }
      D.scale.setScalar(1 + C * 1.8), D.position.y = 0.35 + C * 1.2, D.material.opacity = 0.85 * (1 - C);
    }
    for (let I = Ct.length - 1; I >= 0; I--) {
      const D = Ct[I];
      D.userData.life += M;
      const C = D.userData.life / 0.4;
      if (C >= 1) {
        h.remove(D), D.material.dispose(), Ct.splice(I, 1);
        continue;
      }
      D.scale.setScalar(1 + C * 2.6), D.material.opacity = 0.9 * (1 - C);
    }
  }
  const Wi = new Ut(0.18, 0.18, 5.5);
  function ds(M) {
    if (M.streaks) return M.streaks;
    const I = new Ft();
    for (const [D, C] of [[-0.9, 1.4], [0.9, 1.9], [-0.45, 3.1], [0.5, 0.7]]) {
      const F = new We(Wi, new bt({ color: 16777215, transparent: !0, opacity: 0.6, depthWrite: !1 }));
      F.position.set(D, C, -3.4), I.add(F);
    }
    return I.visible = !1, M.actor.root.add(I), M.streaks = I;
  }
  const ai = new L();
  function oi() {
    const M = {};
    for (const [I, D] of Ce) {
      if (!D.actor || D.hidden && I !== Le) continue;
      ai.copy(D.actor.root.position).setY(6.2).project(u);
      const C = D.emote ? performance.now() / 1e3 - D.emote.born : 9;
      M[I] = {
        x: (ai.x + 1) / 2 * s.clientWidth,
        y: (1 - ai.y) / 2 * s.clientHeight,
        name: D.name,
        me: I === Le,
        online: D.online !== !1,
        team: D.team,
        jailed: D.jailed,
        reach: I === hi,
        emote: C < 1.8 ? D.emote.e : null,
        emoteAge: C
      };
    }
    return M;
  }
  let ci = null;
  const li = new Ap();
  function Xi() {
    const M = Math.min(0.05, li.getDelta()), I = Tt(M);
    for (const [D, C] of Ce) {
      const F = C.actor;
      if (!F) continue;
      const me = D === Le && z;
      if (F.root.visible = me || !C.hidden, !F.root.visible) continue;
      const Ie = me ? 0 : Math.min(0.12, performance.now() / 1e3 - (C.sampleAt || 0)), ae = me ? z.x : C.x + (C.vx || 0) * Ie, Re = me ? z.y : C.y + (C.vy || 0) * Ie, tt = y(ae, Re);
      me || C.snap ? (F.root.position.copy(tt), C.snap = !1) : F.root.position.lerp(tt, Math.min(1, M * 14)), F.root.rotation.y = me ? z.dir : C.dir;
      const Ge = performance.now() / 1e3, Ve = me ? je : !!C.running;
      if (C.ring) {
        const sn = C.safe > 0 && Math.floor(performance.now() / 150) % 2;
        C.ring.material.color.setHex(C.jailed ? 6583435 : sn ? 2278750 : ie[C.team] || 5195493), Ve && C.ring.material.color.lerp(Ee, 0.45), C.ring.scale.setScalar(Ve ? 1.45 : 1), C.ring.material.opacity = Ve ? 1 : 0.8, C.ring.visible = !!C.team || fe.visible || me || Ve;
      }
      Ve && !C.wasDashing && hn(ae, Re, C.jailed ? 9741240 : ie[C.team] || 6514417), C.wasDashing = Ve;
      const ct = ds(C);
      ct.visible = Ve, Ve && (ct.children.forEach((sn, rn) => {
        sn.material.opacity = 0.5 + 0.4 * Math.abs(Math.sin(Ge * 30 + rn * 1.7)), sn.scale.z = 0.8 + 0.4 * Math.abs(Math.sin(Ge * 22 + rn));
      }), C.puffT = (C.puffT || 0) + M, C.puffT > 0.05 && (C.puffT = 0, Vi(ae, Re)));
      const Mt = (C.stunEnd || 0) > Ge;
      _t(C, Mt), Mt && (F.root.rotation.y += Math.sin(Ge * 70) * 0.18, C.ring && C.ring.material.color.setHex(Math.floor(Ge * 20) % 2 ? 2282478 : 16777215));
      const Nt = (C.crouchUntil || 0) > Ge, Mn = (C.grabUntil || 0) > Ge || (me ? z.grabbing : C.grabbing != null);
      (me ? z.grabbed : C.grabbedNow) && !Mt && (F.root.rotation.y += Math.sin(Ge * 40) * 0.25), F.pose(Nt ? "sit" : Mn ? "work" : !Mt && ((me ? I : C.moving) || Ve) ? "walk" : "idle"), F.mixer && (F.mixer.timeScale = Ve ? 1.6 : Mt ? 3 : 1), F.update(M);
    }
    S(), Oe(), Kt(), ze(M), rt(), ye(), An(M), z && q.lerp(y(z.x, z.y), Math.min(1, M * 5)), x && (x.material.opacity = 0.6 + Math.sin(performance.now() / 250) * 0.3), j(), l.render(h, u), ci && ci(oi()), c || (qi = requestAnimationFrame(Xi));
  }
  let qi = requestAnimationFrame(Xi), ji = null, fs = 0, hi = null;
  function S() {
    hi = null;
    const M = Ce.get(Le);
    if (!z || !M || M.team !== "cop" || z.frozen > 0 || z.grabbing) return;
    let I = t.arrest.reach + 0.05;
    for (const [D, C] of Ce) {
      if (D === Le || !C.actor || C.hidden || C.team !== "thief" || C.jailed || C.safe > 0) continue;
      const F = C.actor.root.position, me = Math.hypot(F.x / Ke - z.x, F.z / Ke - z.y);
      me <= I && (I = me, hi = D);
    }
  }
  function N() {
    const M = Ce.get(Le), I = performance.now() / 1e3;
    !ji || !z || !M || M.team !== "cop" || z.frozen > 0 || I < fs || (fs = I + t.arrest.cooldown, M.grabUntil = I + 0.35, H = !0, le && (ue = 0, le({ x: +z.x.toFixed(3), y: +z.y.toFixed(3), dir: +z.dir.toFixed(3), moving: !1, run: !1 })), ji(hi));
  }
  let H = !1, V = null;
  function B() {
    H && (H = !1, V && V());
  }
  const se = [], pe = new Ut(0.35, 0.35, 1.1), Se = new bt({ color: 16638023 }), Te = new Dn({ color: 14742270, transparent: !0, opacity: 0.9 });
  function Fe(M) {
    const I = performance.now() / 1e3;
    for (const D of M || [])
      if (D.t === "shot") {
        const C = new We(pe, Se);
        C.rotation.y = D.dir;
        const F = new ii(new Rt().setAttribute("position", new dt(new Float32Array(12), 3)), Te);
        F.frustumCulled = !1, h.add(C, F), se.push({ cop: D.cop, x: D.x, y: D.y, dir: D.dir, t0: I, end: null, endAt: 0, m: C, wires: F }), D.cop !== Le && we(Ce.get(D.cop));
      } else if (D.t === "grab") {
        const C = Ce.get(D.cop);
        C && D.cop !== Le && (C.grabUntil = I + 0.35);
      } else if (D.t === "emote")
        pc(D.id, D.e);
      else if (D.t === "tase") {
        const C = se.find((F) => F.cop === D.cop && !F.end);
        if (C && (C.end = { x: D.x, y: D.y }), D.thief != null) {
          const F = Ce.get(D.thief);
          F && (F.stunEnd = I + t.taser.stun);
          for (let me = 0; me < 6; me++) Vi(D.x + (Math.random() - 0.5) * 0.4, D.y + (Math.random() - 0.5) * 0.4);
        }
      }
  }
  function Oe() {
    const M = performance.now() / 1e3, I = t.taser.speed, D = t.taser.range;
    for (let C = se.length - 1; C >= 0; C--) {
      const F = se[C];
      let me = Math.min(D, (M - F.t0) * I);
      F.end && (me = Math.min(me, Math.hypot(F.end.x - F.x, F.end.y - F.y)));
      const Ie = F.x + Math.sin(F.dir) * me, ae = F.y + Math.cos(F.dir) * me;
      F.m.position.copy(y(Ie, ae, 2.2));
      const Re = Ce.get(F.cop), tt = Re && Re.actor ? Re.actor.root.position : y(F.x, F.y), Ge = F.wires.geometry.attributes.position, Ve = E(Ie, ae);
      Ge.setXYZ(0, tt.x - 0.25, tt.y + 2.3, tt.z), Ge.setXYZ(1, Ie * Ke - 0.15, Ve + 2.3, ae * Ke), Ge.setXYZ(2, tt.x + 0.25, tt.y + 2.1, tt.z), Ge.setXYZ(3, Ie * Ke + 0.15, Ve + 2.1, ae * Ke), Ge.needsUpdate = !0, (F.end && me >= Math.hypot(F.end.x - F.x, F.end.y - F.y) - 1e-3 || me >= D) && !F.endAt && (F.endAt = M), (F.endAt && M - F.endAt > 0.35 || M - F.t0 > 2) && (h.remove(F.m, F.wires), F.wires.geometry.dispose(), se.splice(C, 1));
    }
  }
  function we(M) {
    if (!M || !M.gun) return;
    const I = new We(new Pi(0.09, 8, 6), new bt({ color: 8246268, transparent: !0, opacity: 0.95 }));
    I.position.set(0, 0, 0.24), M.gun.add(I), setTimeout(() => {
      M.gun && M.gun.remove(I), I.material.dispose();
    }, 120);
  }
  const ht = new Dn({ color: 6809849, transparent: !0, opacity: 0.95 });
  function _t(M, I) {
    if (!I) {
      M.sparks && (M.sparks.visible = !1);
      return;
    }
    M.sparks || (M.sparks = new ii(new Rt().setAttribute("position", new dt(new Float32Array(3 * 2 * 18), 3)), ht), M.sparks.frustumCulled = !1, M.actor.root.add(M.sparks)), M.sparks.visible = !0;
    const D = M.sparks.geometry.attributes.position;
    for (let C = 0; C < 3; C++) {
      let F = Math.random() * Math.PI * 2, me = Math.cos(F) * 1.3, Ie = 0.3, ae = Math.sin(F) * 1.3;
      for (let Re = 0; Re < 6; Re++) {
        F += (Math.random() - 0.3) * 1.2;
        const tt = Math.cos(F) * (1.1 + Math.random() * 0.6), Ge = Ie + 0.7 + Math.random() * 0.4, Ve = Math.sin(F) * (1.1 + Math.random() * 0.6), ct = (C * 6 + Re) * 2;
        D.setXYZ(ct, me, Ie, ae), D.setXYZ(ct + 1, tt, Ge, Ve), me = tt, Ie = Ge, ae = Ve;
      }
    }
    D.needsUpdate = !0;
  }
  let vt = !1, kt = 0;
  const Ye = 4, xe = n * Ye, xt = i * Ye, nt = new Float32Array(xe * xt), Yt = new Uint8Array(xe * xt), Jt = new ca(Yt, xe, xt, 1028, 1009);
  Jt.magFilter = 1006, Jt.minFilter = 1006, Jt.needsUpdate = !0;
  const zt = bi;
  bi.uSight.value = Jt, bi.uSightOn.value = 0, bi.uSightSize.value.set(r, a);
  const ui = new Uint8Array(xe * xt);
  for (const M of t.sight || [])
    for (let I = Math.max(0, Math.floor((M.cx - M.hx) * Ye)); I < Math.min(xe, Math.ceil((M.cx + M.hx) * Ye)); I++)
      for (let D = Math.max(0, Math.floor((M.cy - M.hy) * Ye)); D < Math.min(xt, Math.ceil((M.cy + M.hy) * Ye)); D++) ui[D * xe + I] = 1;
  function Et(M) {
    !M || M.userData.sight || M.userData.noSight || M.isLineBasicMaterial || M.isSpriteMaterial || (M.userData.sight = !0, M.onBeforeCompile = (I) => {
      Object.assign(I.uniforms, zt), I.vertexShader = `varying vec2 vSightXZ;
` + I.vertexShader.replace(
        "#include <project_vertex>",
        `#include <project_vertex>
  vSightXZ = (modelMatrix * vec4(transformed, 1.0)).xz;`
      ), I.fragmentShader = `uniform sampler2D uSight;
uniform float uSightOn;
uniform vec2 uSightSize;
varying vec2 vSightXZ;
` + I.fragmentShader.replace("#include <dithering_fragment>", `#include <dithering_fragment>
  if (uSightOn > 0.5) { float sv = texture2D(uSight, vSightXZ / uSightSize).r; gl_FragColor.rgb *= mix(vec3(0.2, 0.23, 0.34), vec3(1.0), sv); }`);
    }, M.customProgramCacheKey = () => "sight1", M.needsUpdate = !0);
  }
  let un = 0;
  function Yi() {
    h.traverse((M) => {
      !M.material || M.userData.noSight || (Array.isArray(M.material) ? M.material : [M.material]).forEach(Et);
    });
  }
  function Kt() {
    const M = vt && !!z && !!z.team;
    zt.uSightOn.value = M ? 1 : 0;
    const I = performance.now();
    if (I - un > 700 && (un = I, Yi()), !M || I - kt < 100) return;
    kt = I, nt.fill(0);
    const D = t.view || 18, C = 5, F = 720, me = 0.12, Ie = (ae, Re, tt) => {
      const Ge = Math.floor(ae * Ye), Ve = Math.floor(Re * Ye);
      if (Ge < 0 || Ve < 0 || Ge >= xe || Ve >= xt) return;
      const ct = Ve * xe + Ge;
      tt > nt[ct] && (nt[ct] = tt);
    };
    for (let ae = 0; ae < F; ae++) {
      const Re = ae / F * Math.PI * 2, tt = Math.cos(Re), Ge = Math.sin(Re);
      let Ve = -1;
      for (let ct = 0; ct <= D; ct += me) {
        const Mt = z.x + tt * ct, Nt = z.y + Ge * ct;
        m(Mt, Nt) < 0 && Ve < 0 && (Ve = 1);
        const Mn = ct < D - C ? 1 : Math.max(0, (D - ct) / C);
        if (Ie(Mt, Nt, Mn), Ve >= 0) {
          if (Ve-- === 0) break;
          continue;
        }
        const sn = Math.floor(Mt * Ye), rn = Math.floor(Nt * Ye);
        sn >= 0 && rn >= 0 && sn < xe && rn < xt && ui[rn * xe + sn] && (Ve = 3);
      }
    }
    for (let ae = 0; ae < xt; ae++)
      for (let Re = 0; Re < xe; Re++) {
        let tt = 0, Ge = 0;
        for (let Ve = -1; Ve <= 1; Ve++) for (let ct = -1; ct <= 1; ct++) {
          const Mt = Re + ct, Nt = ae + Ve;
          Mt >= 0 && Nt >= 0 && Mt < xe && Nt < xt && (tt += nt[Nt * xe + Mt], Ge++);
        }
        Yt[ae * xe + Re] = Math.round(tt / Ge * 255);
      }
    Jt.needsUpdate = !0;
  }
  let Qt = null;
  function ar(M) {
    x && (Qt && (h.remove(Qt), Qt.geometry.dispose(), Qt = null), M > 0 && (Qt = new We(
      new ni(t.pad.r * Ke - 0.7, t.pad.r * Ke + 0.4, 48, 1, Math.PI / 2, -Math.PI * 2 * M),
      new bt({ color: 2278750, side: 2, transparent: !0, opacity: 0.95, depthWrite: !1 })
    ), Qt.userData.noSight = !0, Qt.rotation.x = -Math.PI / 2, Qt.position.copy(y(t.pad.cx, t.pad.cy, 0.12)), h.add(Qt)));
  }
  const ps = { laugh: "🤣", taunt: "😜", wave: "👋", angry: "😡", cool: "😎" }, ga = { 1: "laugh", 2: "taunt", 3: "wave", 4: "angry", 5: "cool", c: "teabag" };
  function pc(M, I) {
    const D = Ce.get(M);
    if (!D || !D.actor || D.hidden && M !== Le) return !1;
    const C = performance.now() / 1e3;
    return I === "teabag" ? D.crouchUntil = C + 0.28 : D.emote = { e: ps[I] || "❓", born: C }, !0;
  }
  let or = null;
  function mc() {
    c = !0, bi.uSight.value === Jt && (bi.uSightOn.value = 0), cancelAnimationFrame(qi), te.disconnect(), window.removeEventListener("keydown", _e), window.removeEventListener("keyup", Y), window.removeEventListener("blur", ee), l.domElement.removeEventListener("pointermove", Z), l.domElement.removeEventListener("pointerdown", be), l.dispose(), l.forceContextLoss(), l.domElement.remove();
  }
  return {
    setPlayers: Wt,
    correct: Qe,
    clear: st,
    dispose: mc,
    mapKey: t.key,
    onArrest(M) {
      ji = M;
    },
    arrestNow: N,
    focus() {
      l.domElement.focus();
    },
    onMove(M) {
      le = M;
    },
    onRelease(M) {
      V = M;
    },
    releaseGrab: B,
    fireTaser: U,
    onShot(M) {
      ft = M;
    },
    onEmote(M) {
      or = M;
    },
    setPad: ar,
    events: Fe,
    setPhase(M) {
      vt = M === "countdown" || M === "playing";
    },
    abilityState() {
      const M = performance.now() / 1e3, I = z && z.team;
      return I === "cop" ? { kind: "taser", ready: Math.max(0, ke - M), cooldown: t.taser.cooldown, active: !1 } : I === "thief" ? { kind: "run", stamina: (z.stamina ?? t.run.stamina) / t.run.stamina, active: je } : { kind: null };
    },
    onFrame(M) {
      ci = M;
    }
  };
}
export {
  Bm as createRoomScene
};
