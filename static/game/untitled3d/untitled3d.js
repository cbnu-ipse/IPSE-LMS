/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */
const Sr = "169";
const Vr = "attached", ko = "detached";
const vn = "", lt = "srgb", xt = "srgb-linear", yr = "display-p3", xs = "display-p3-linear", us = "linear", rt = "srgb", ds = "rec709", fs = "p3";
const Hr = "300 es";
class Un {
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
const Mt = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "0a", "0b", "0c", "0d", "0e", "0f", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "1a", "1b", "1c", "1d", "1e", "1f", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "2a", "2b", "2c", "2d", "2e", "2f", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "3a", "3b", "3c", "3d", "3e", "3f", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "4a", "4b", "4c", "4d", "4e", "4f", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "5a", "5b", "5c", "5d", "5e", "5f", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "6a", "6b", "6c", "6d", "6e", "6f", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "7a", "7b", "7c", "7d", "7e", "7f", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "8a", "8b", "8c", "8d", "8e", "8f", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "9a", "9b", "9c", "9d", "9e", "9f", "a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "aa", "ab", "ac", "ad", "ae", "af", "b0", "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9", "ba", "bb", "bc", "bd", "be", "bf", "c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "ca", "cb", "cc", "cd", "ce", "cf", "d0", "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "da", "db", "dc", "dd", "de", "df", "e0", "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9", "ea", "eb", "ec", "ed", "ee", "ef", "f0", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "fa", "fb", "fc", "fd", "fe", "ff"];
let Wr = 1234567;
const Qn = Math.PI / 180, si = 180 / Math.PI;
function Yt() {
  const s = Math.random() * 4294967295 | 0, e = Math.random() * 4294967295 | 0, t = Math.random() * 4294967295 | 0, n = Math.random() * 4294967295 | 0;
  return (Mt[s & 255] + Mt[s >> 8 & 255] + Mt[s >> 16 & 255] + Mt[s >> 24 & 255] + "-" + Mt[e & 255] + Mt[e >> 8 & 255] + "-" + Mt[e >> 16 & 15 | 64] + Mt[e >> 24 & 255] + "-" + Mt[t & 63 | 128] + Mt[t >> 8 & 255] + "-" + Mt[t >> 16 & 255] + Mt[t >> 24 & 255] + Mt[n & 255] + Mt[n >> 8 & 255] + Mt[n >> 16 & 255] + Mt[n >> 24 & 255]).toLowerCase();
}
function yt(s, e, t) {
  return Math.max(e, Math.min(t, s));
}
function Er(s, e) {
  return (s % e + e) % e;
}
function Vo(s, e, t, n, i) {
  return n + (s - e) * (i - n) / (t - e);
}
function Ho(s, e, t) {
  return s !== e ? (t - s) / (e - s) : 0;
}
function Ai(s, e, t) {
  return (1 - t) * s + t * e;
}
function Wo(s, e, t, n) {
  return Ai(s, e, 1 - Math.exp(-t * n));
}
function Xo(s, e = 1) {
  return e - Math.abs(Er(s, e * 2) - e);
}
function qo(s, e, t) {
  return s <= e ? 0 : s >= t ? 1 : (s = (s - e) / (t - e), s * s * (3 - 2 * s));
}
function jo(s, e, t) {
  return s <= e ? 0 : s >= t ? 1 : (s = (s - e) / (t - e), s * s * s * (s * (s * 6 - 15) + 10));
}
function Yo(s, e) {
  return s + Math.floor(Math.random() * (e - s + 1));
}
function Ko(s, e) {
  return s + Math.random() * (e - s);
}
function Zo(s) {
  return s * (0.5 - Math.random());
}
function $o(s) {
  s !== void 0 && (Wr = s);
  let e = Wr += 1831565813;
  return e = Math.imul(e ^ e >>> 15, e | 1), e ^= e + Math.imul(e ^ e >>> 7, e | 61), ((e ^ e >>> 14) >>> 0) / 4294967296;
}
function Jo(s) {
  return s * Qn;
}
function Qo(s) {
  return s * si;
}
function ec(s) {
  return (s & s - 1) === 0 && s !== 0;
}
function tc(s) {
  return Math.pow(2, Math.ceil(Math.log(s) / Math.LN2));
}
function nc(s) {
  return Math.pow(2, Math.floor(Math.log(s) / Math.LN2));
}
function ic(s, e, t, n, i) {
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
function qt(s, e) {
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
function tt(s, e) {
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
const sc = {
  DEG2RAD: Qn,
  RAD2DEG: si,
  generateUUID: Yt,
  clamp: yt,
  euclideanModulo: Er,
  mapLinear: Vo,
  inverseLerp: Ho,
  lerp: Ai,
  damp: Wo,
  pingpong: Xo,
  smoothstep: qo,
  smootherstep: jo,
  randInt: Yo,
  randFloat: Ko,
  randFloatSpread: Zo,
  seededRandom: $o,
  degToRad: Jo,
  radToDeg: Qo,
  isPowerOfTwo: ec,
  ceilPowerOfTwo: tc,
  floorPowerOfTwo: nc,
  setQuaternionFromProperEuler: ic,
  normalize: tt,
  denormalize: qt
};
class Be {
  constructor(e = 0, t = 0) {
    Be.prototype.isVector2 = !0, this.x = e, this.y = t;
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
    return Math.acos(yt(n, -1, 1));
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
class Fe {
  constructor(e, t, n, i, r, a, o, c, l) {
    Fe.prototype.isMatrix3 = !0, this.elements = [
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
    const n = e.elements, i = t.elements, r = this.elements, a = n[0], o = n[3], c = n[6], l = n[1], h = n[4], u = n[7], d = n[2], f = n[5], g = n[8], _ = i[0], p = i[3], m = i[6], T = i[1], y = i[4], A = i[7], L = i[2], w = i[5], R = i[8];
    return r[0] = a * _ + o * T + c * L, r[3] = a * p + o * y + c * w, r[6] = a * m + o * A + c * R, r[1] = l * _ + h * T + u * L, r[4] = l * p + h * y + u * w, r[7] = l * m + h * A + u * R, r[2] = d * _ + f * T + g * L, r[5] = d * p + f * y + g * w, r[8] = d * m + f * A + g * R, this;
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
    return this.premultiply(Cs.makeScale(e, t)), this;
  }
  rotate(e) {
    return this.premultiply(Cs.makeRotation(-e)), this;
  }
  translate(e, t) {
    return this.premultiply(Cs.makeTranslation(e, t)), this;
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
const Cs = /* @__PURE__ */ new Fe();
function ao(s) {
  for (let e = s.length - 1; e >= 0; --e)
    if (s[e] >= 65535) return !0;
  return !1;
}
function bi(s) {
  return document.createElementNS("http://www.w3.org/1999/xhtml", s);
}
function rc() {
  const s = bi("canvas");
  return s.style.display = "block", s;
}
const Xr = {};
function cs(s) {
  s in Xr || (Xr[s] = !0, console.warn(s));
}
function ac(s, e, t) {
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
function oc(s) {
  const e = s.elements;
  e[2] = 0.5 * e[2] + 0.5 * e[3], e[6] = 0.5 * e[6] + 0.5 * e[7], e[10] = 0.5 * e[10] + 0.5 * e[11], e[14] = 0.5 * e[14] + 0.5 * e[15];
}
function cc(s) {
  const e = s.elements;
  e[11] === -1 ? (e[10] = -e[10] - 1, e[14] = -e[14]) : (e[10] = -e[10], e[14] = -e[14] + 1);
}
const qr = /* @__PURE__ */ new Fe().set(
  0.8224621,
  0.177538,
  0,
  0.0331941,
  0.9668058,
  0,
  0.0170827,
  0.0723974,
  0.9105199
), jr = /* @__PURE__ */ new Fe().set(
  1.2249401,
  -0.2249404,
  0,
  -0.0420569,
  1.0420571,
  0,
  -0.0196376,
  -0.0786361,
  1.0982735
), fi = {
  [xt]: {
    transfer: us,
    primaries: ds,
    luminanceCoefficients: [0.2126, 0.7152, 0.0722],
    toReference: (s) => s,
    fromReference: (s) => s
  },
  [lt]: {
    transfer: rt,
    primaries: ds,
    luminanceCoefficients: [0.2126, 0.7152, 0.0722],
    toReference: (s) => s.convertSRGBToLinear(),
    fromReference: (s) => s.convertLinearToSRGB()
  },
  [xs]: {
    transfer: us,
    primaries: fs,
    luminanceCoefficients: [0.2289, 0.6917, 0.0793],
    toReference: (s) => s.applyMatrix3(jr),
    fromReference: (s) => s.applyMatrix3(qr)
  },
  [yr]: {
    transfer: rt,
    primaries: fs,
    luminanceCoefficients: [0.2289, 0.6917, 0.0793],
    toReference: (s) => s.convertSRGBToLinear().applyMatrix3(jr),
    fromReference: (s) => s.applyMatrix3(qr).convertLinearToSRGB()
  }
}, lc = /* @__PURE__ */ new Set([xt, xs]), Ve = {
  enabled: !0,
  _workingColorSpace: xt,
  get workingColorSpace() {
    return this._workingColorSpace;
  },
  set workingColorSpace(s) {
    if (!lc.has(s))
      throw new Error(`Unsupported working color space, "${s}".`);
    this._workingColorSpace = s;
  },
  convert: function(s, e, t) {
    if (this.enabled === !1 || e === t || !e || !t)
      return s;
    const n = fi[e].toReference, i = fi[t].fromReference;
    return i(n(s));
  },
  fromWorkingColorSpace: function(s, e) {
    return this.convert(s, this._workingColorSpace, e);
  },
  toWorkingColorSpace: function(s, e) {
    return this.convert(s, e, this._workingColorSpace);
  },
  getPrimaries: function(s) {
    return fi[s].primaries;
  },
  getTransfer: function(s) {
    return s === vn ? us : fi[s].transfer;
  },
  getLuminanceCoefficients: function(s, e = this._workingColorSpace) {
    return s.fromArray(fi[e].luminanceCoefficients);
  }
};
function ei(s) {
  return s < 0.04045 ? s * 0.0773993808 : Math.pow(s * 0.9478672986 + 0.0521327014, 2.4);
}
function Is(s) {
  return s < 31308e-7 ? s * 12.92 : 1.055 * Math.pow(s, 0.41666) - 0.055;
}
let Bn;
class hc {
  static getDataURL(e) {
    if (/^data:/i.test(e.src) || typeof HTMLCanvasElement > "u")
      return e.src;
    let t;
    if (e instanceof HTMLCanvasElement)
      t = e;
    else {
      Bn === void 0 && (Bn = bi("canvas")), Bn.width = e.width, Bn.height = e.height;
      const n = Bn.getContext("2d");
      e instanceof ImageData ? n.putImageData(e, 0, 0) : n.drawImage(e, 0, 0, e.width, e.height), t = Bn;
    }
    return t.width > 2048 || t.height > 2048 ? (console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons", e), t.toDataURL("image/jpeg", 0.6)) : t.toDataURL("image/png");
  }
  static sRGBToLinear(e) {
    if (typeof HTMLImageElement < "u" && e instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && e instanceof ImageBitmap) {
      const t = bi("canvas");
      t.width = e.width, t.height = e.height;
      const n = t.getContext("2d");
      n.drawImage(e, 0, 0, e.width, e.height);
      const i = n.getImageData(0, 0, e.width, e.height), r = i.data;
      for (let a = 0; a < r.length; a++)
        r[a] = ei(r[a] / 255) * 255;
      return n.putImageData(i, 0, 0), t;
    } else if (e.data) {
      const t = e.data.slice(0);
      for (let n = 0; n < t.length; n++)
        t instanceof Uint8Array || t instanceof Uint8ClampedArray ? t[n] = Math.floor(ei(t[n] / 255) * 255) : t[n] = ei(t[n]);
      return {
        data: t,
        width: e.width,
        height: e.height
      };
    } else
      return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."), e;
  }
}
let uc = 0;
class oo {
  constructor(e = null) {
    this.isSource = !0, Object.defineProperty(this, "id", { value: uc++ }), this.uuid = Yt(), this.data = e, this.dataReady = !0, this.version = 0;
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
          i[a].isDataTexture ? r.push(Ps(i[a].image)) : r.push(Ps(i[a]));
      } else
        r = Ps(i);
      n.url = r;
    }
    return t || (e.images[this.uuid] = n), n;
  }
}
function Ps(s) {
  return typeof HTMLImageElement < "u" && s instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && s instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && s instanceof ImageBitmap ? hc.getDataURL(s) : s.data ? {
    data: Array.from(s.data),
    width: s.width,
    height: s.height,
    type: s.data.constructor.name
  } : (console.warn("THREE.Texture: Unable to serialize Texture."), {});
}
let dc = 0;
class gt extends Un {
  constructor(e = gt.DEFAULT_IMAGE, t = gt.DEFAULT_MAPPING, n = 1001, i = 1001, r = 1006, a = 1008, o = 1023, c = 1009, l = gt.DEFAULT_ANISOTROPY, h = vn) {
    super(), this.isTexture = !0, Object.defineProperty(this, "id", { value: dc++ }), this.uuid = Yt(), this.name = "", this.source = new oo(e), this.mipmaps = [], this.mapping = t, this.channel = 0, this.wrapS = n, this.wrapT = i, this.magFilter = r, this.minFilter = a, this.anisotropy = l, this.format = o, this.internalFormat = null, this.type = c, this.offset = new Be(0, 0), this.repeat = new Be(1, 1), this.center = new Be(0, 0), this.rotation = 0, this.matrixAutoUpdate = !0, this.matrix = new Fe(), this.generateMipmaps = !0, this.premultiplyAlpha = !1, this.flipY = !0, this.unpackAlignment = 4, this.colorSpace = h, this.userData = {}, this.version = 0, this.onUpdate = null, this.isRenderTargetTexture = !1, this.pmremVersion = 0;
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
gt.DEFAULT_IMAGE = null;
gt.DEFAULT_MAPPING = 300;
gt.DEFAULT_ANISOTROPY = 1;
class Ye {
  constructor(e = 0, t = 0, n = 0, i = 1) {
    Ye.prototype.isVector4 = !0, this.x = e, this.y = t, this.z = n, this.w = i;
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
    const c = e.elements, l = c[0], h = c[4], u = c[8], d = c[1], f = c[5], g = c[9], _ = c[2], p = c[6], m = c[10];
    if (Math.abs(h - d) < 0.01 && Math.abs(u - _) < 0.01 && Math.abs(g - p) < 0.01) {
      if (Math.abs(h + d) < 0.1 && Math.abs(u + _) < 0.1 && Math.abs(g + p) < 0.1 && Math.abs(l + f + m - 3) < 0.1)
        return this.set(1, 0, 0, 0), this;
      t = Math.PI;
      const y = (l + 1) / 2, A = (f + 1) / 2, L = (m + 1) / 2, w = (h + d) / 4, R = (u + _) / 4, N = (g + p) / 4;
      return y > A && y > L ? y < 0.01 ? (n = 0, i = 0.707106781, r = 0.707106781) : (n = Math.sqrt(y), i = w / n, r = R / n) : A > L ? A < 0.01 ? (n = 0.707106781, i = 0, r = 0.707106781) : (i = Math.sqrt(A), n = w / i, r = N / i) : L < 0.01 ? (n = 0.707106781, i = 0.707106781, r = 0) : (r = Math.sqrt(L), n = R / r, i = N / r), this.set(n, i, r, t), this;
    }
    let T = Math.sqrt((p - g) * (p - g) + (u - _) * (u - _) + (d - h) * (d - h));
    return Math.abs(T) < 1e-3 && (T = 1), this.x = (p - g) / T, this.y = (u - _) / T, this.z = (d - h) / T, this.w = Math.acos((l + f + m - 1) / 2), this;
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
class fc extends Un {
  constructor(e = 1, t = 1, n = {}) {
    super(), this.isRenderTarget = !0, this.width = e, this.height = t, this.depth = 1, this.scissor = new Ye(0, 0, e, t), this.scissorTest = !1, this.viewport = new Ye(0, 0, e, t);
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
    const r = new gt(i, n.mapping, n.wrapS, n.wrapT, n.magFilter, n.minFilter, n.format, n.type, n.anisotropy, n.colorSpace);
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
    return this.texture.source = new oo(t), this.depthBuffer = e.depthBuffer, this.stencilBuffer = e.stencilBuffer, this.resolveDepthBuffer = e.resolveDepthBuffer, this.resolveStencilBuffer = e.resolveStencilBuffer, e.depthTexture !== null && (this.depthTexture = e.depthTexture.clone()), this.samples = e.samples, this;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
}
class Nn extends fc {
  constructor(e = 1, t = 1, n = {}) {
    super(e, t, n), this.isWebGLRenderTarget = !0;
  }
}
class co extends gt {
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
class pc extends gt {
  constructor(e = null, t = 1, n = 1, i = 1) {
    super(null), this.isData3DTexture = !0, this.image = { data: e, width: t, height: n, depth: i }, this.magFilter = 1003, this.minFilter = 1003, this.wrapR = 1001, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1;
  }
}
class Kt {
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
      let p = 1 - o;
      const m = c * d + l * f + h * g + u * _, T = m >= 0 ? 1 : -1, y = 1 - m * m;
      if (y > Number.EPSILON) {
        const L = Math.sqrt(y), w = Math.atan2(L, m * T);
        p = Math.sin(p * w) / L, o = Math.sin(o * w) / L;
      }
      const A = o * T;
      if (c = c * p + d * A, l = l * p + f * A, h = h * p + g * A, u = u * p + _ * A, p === 1 - o) {
        const L = 1 / Math.sqrt(c * c + l * l + h * h + u * u);
        c *= L, l *= L, h *= L, u *= L;
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
    return 2 * Math.acos(Math.abs(yt(this.dot(e), -1, 1)));
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
class C {
  constructor(e = 0, t = 0, n = 0) {
    C.prototype.isVector3 = !0, this.x = e, this.y = t, this.z = n;
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
    return this.applyQuaternion(Yr.setFromEuler(e));
  }
  applyAxisAngle(e, t) {
    return this.applyQuaternion(Yr.setFromAxisAngle(e, t));
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
    return Ls.copy(this).projectOnVector(e), this.sub(Ls);
  }
  reflect(e) {
    return this.sub(Ls.copy(e).multiplyScalar(2 * this.dot(e)));
  }
  angleTo(e) {
    const t = Math.sqrt(this.lengthSq() * e.lengthSq());
    if (t === 0) return Math.PI / 2;
    const n = this.dot(e) / t;
    return Math.acos(yt(n, -1, 1));
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
const Ls = /* @__PURE__ */ new C(), Yr = /* @__PURE__ */ new Kt();
class $t {
  constructor(e = new C(1 / 0, 1 / 0, 1 / 0), t = new C(-1 / 0, -1 / 0, -1 / 0)) {
    this.isBox3 = !0, this.min = e, this.max = t;
  }
  set(e, t) {
    return this.min.copy(e), this.max.copy(t), this;
  }
  setFromArray(e) {
    this.makeEmpty();
    for (let t = 0, n = e.length; t < n; t += 3)
      this.expandByPoint(kt.fromArray(e, t));
    return this;
  }
  setFromBufferAttribute(e) {
    this.makeEmpty();
    for (let t = 0, n = e.count; t < n; t++)
      this.expandByPoint(kt.fromBufferAttribute(e, t));
    return this;
  }
  setFromPoints(e) {
    this.makeEmpty();
    for (let t = 0, n = e.length; t < n; t++)
      this.expandByPoint(e[t]);
    return this;
  }
  setFromCenterAndSize(e, t) {
    const n = kt.copy(t).multiplyScalar(0.5);
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
          e.isMesh === !0 ? e.getVertexPosition(a, kt) : kt.fromBufferAttribute(r, a), kt.applyMatrix4(e.matrixWorld), this.expandByPoint(kt);
      else
        e.boundingBox !== void 0 ? (e.boundingBox === null && e.computeBoundingBox(), Pi.copy(e.boundingBox)) : (n.boundingBox === null && n.computeBoundingBox(), Pi.copy(n.boundingBox)), Pi.applyMatrix4(e.matrixWorld), this.union(Pi);
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
    return this.clampPoint(e.center, kt), kt.distanceToSquared(e.center) <= e.radius * e.radius;
  }
  intersectsPlane(e) {
    let t, n;
    return e.normal.x > 0 ? (t = e.normal.x * this.min.x, n = e.normal.x * this.max.x) : (t = e.normal.x * this.max.x, n = e.normal.x * this.min.x), e.normal.y > 0 ? (t += e.normal.y * this.min.y, n += e.normal.y * this.max.y) : (t += e.normal.y * this.max.y, n += e.normal.y * this.min.y), e.normal.z > 0 ? (t += e.normal.z * this.min.z, n += e.normal.z * this.max.z) : (t += e.normal.z * this.max.z, n += e.normal.z * this.min.z), t <= -e.constant && n >= -e.constant;
  }
  intersectsTriangle(e) {
    if (this.isEmpty())
      return !1;
    this.getCenter(pi), Li.subVectors(this.max, pi), On.subVectors(e.a, pi), Gn.subVectors(e.b, pi), zn.subVectors(e.c, pi), dn.subVectors(Gn, On), fn.subVectors(zn, Gn), Tn.subVectors(On, zn);
    let t = [
      0,
      -dn.z,
      dn.y,
      0,
      -fn.z,
      fn.y,
      0,
      -Tn.z,
      Tn.y,
      dn.z,
      0,
      -dn.x,
      fn.z,
      0,
      -fn.x,
      Tn.z,
      0,
      -Tn.x,
      -dn.y,
      dn.x,
      0,
      -fn.y,
      fn.x,
      0,
      -Tn.y,
      Tn.x,
      0
    ];
    return !Ds(t, On, Gn, zn, Li) || (t = [1, 0, 0, 0, 1, 0, 0, 0, 1], !Ds(t, On, Gn, zn, Li)) ? !1 : (Di.crossVectors(dn, fn), t = [Di.x, Di.y, Di.z], Ds(t, On, Gn, zn, Li));
  }
  clampPoint(e, t) {
    return t.copy(e).clamp(this.min, this.max);
  }
  distanceToPoint(e) {
    return this.clampPoint(e, kt).distanceTo(e);
  }
  getBoundingSphere(e) {
    return this.isEmpty() ? e.makeEmpty() : (this.getCenter(e.center), e.radius = this.getSize(kt).length() * 0.5), e;
  }
  intersect(e) {
    return this.min.max(e.min), this.max.min(e.max), this.isEmpty() && this.makeEmpty(), this;
  }
  union(e) {
    return this.min.min(e.min), this.max.max(e.max), this;
  }
  applyMatrix4(e) {
    return this.isEmpty() ? this : (sn[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(e), sn[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(e), sn[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(e), sn[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(e), sn[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(e), sn[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(e), sn[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(e), sn[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(e), this.setFromPoints(sn), this);
  }
  translate(e) {
    return this.min.add(e), this.max.add(e), this;
  }
  equals(e) {
    return e.min.equals(this.min) && e.max.equals(this.max);
  }
}
const sn = [
  /* @__PURE__ */ new C(),
  /* @__PURE__ */ new C(),
  /* @__PURE__ */ new C(),
  /* @__PURE__ */ new C(),
  /* @__PURE__ */ new C(),
  /* @__PURE__ */ new C(),
  /* @__PURE__ */ new C(),
  /* @__PURE__ */ new C()
], kt = /* @__PURE__ */ new C(), Pi = /* @__PURE__ */ new $t(), On = /* @__PURE__ */ new C(), Gn = /* @__PURE__ */ new C(), zn = /* @__PURE__ */ new C(), dn = /* @__PURE__ */ new C(), fn = /* @__PURE__ */ new C(), Tn = /* @__PURE__ */ new C(), pi = /* @__PURE__ */ new C(), Li = /* @__PURE__ */ new C(), Di = /* @__PURE__ */ new C(), An = /* @__PURE__ */ new C();
function Ds(s, e, t, n, i) {
  for (let r = 0, a = s.length - 3; r <= a; r += 3) {
    An.fromArray(s, r);
    const o = i.x * Math.abs(An.x) + i.y * Math.abs(An.y) + i.z * Math.abs(An.z), c = e.dot(An), l = t.dot(An), h = n.dot(An);
    if (Math.max(-Math.max(c, l, h), Math.min(c, l, h)) > o)
      return !1;
  }
  return !0;
}
const mc = /* @__PURE__ */ new $t(), mi = /* @__PURE__ */ new C(), Ns = /* @__PURE__ */ new C();
class Qt {
  constructor(e = new C(), t = -1) {
    this.isSphere = !0, this.center = e, this.radius = t;
  }
  set(e, t) {
    return this.center.copy(e), this.radius = t, this;
  }
  setFromPoints(e, t) {
    const n = this.center;
    t !== void 0 ? n.copy(t) : mc.setFromPoints(e).getCenter(n);
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
    mi.subVectors(e, this.center);
    const t = mi.lengthSq();
    if (t > this.radius * this.radius) {
      const n = Math.sqrt(t), i = (n - this.radius) * 0.5;
      this.center.addScaledVector(mi, i / n), this.radius += i;
    }
    return this;
  }
  union(e) {
    return e.isEmpty() ? this : this.isEmpty() ? (this.copy(e), this) : (this.center.equals(e.center) === !0 ? this.radius = Math.max(this.radius, e.radius) : (Ns.subVectors(e.center, this.center).setLength(e.radius), this.expandByPoint(mi.copy(e.center).add(Ns)), this.expandByPoint(mi.copy(e.center).sub(Ns))), this);
  }
  equals(e) {
    return e.center.equals(this.center) && e.radius === this.radius;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
const rn = /* @__PURE__ */ new C(), Us = /* @__PURE__ */ new C(), Ni = /* @__PURE__ */ new C(), pn = /* @__PURE__ */ new C(), Fs = /* @__PURE__ */ new C(), Ui = /* @__PURE__ */ new C(), Bs = /* @__PURE__ */ new C();
class vs {
  constructor(e = new C(), t = new C(0, 0, -1)) {
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
    return this.origin.copy(this.at(e, rn)), this;
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
    const t = rn.subVectors(e, this.origin).dot(this.direction);
    return t < 0 ? this.origin.distanceToSquared(e) : (rn.copy(this.origin).addScaledVector(this.direction, t), rn.distanceToSquared(e));
  }
  distanceSqToSegment(e, t, n, i) {
    Us.copy(e).add(t).multiplyScalar(0.5), Ni.copy(t).sub(e).normalize(), pn.copy(this.origin).sub(Us);
    const r = e.distanceTo(t) * 0.5, a = -this.direction.dot(Ni), o = pn.dot(this.direction), c = -pn.dot(Ni), l = pn.lengthSq(), h = Math.abs(1 - a * a);
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
    return n && n.copy(this.origin).addScaledVector(this.direction, u), i && i.copy(Us).addScaledVector(Ni, d), f;
  }
  intersectSphere(e, t) {
    rn.subVectors(e.center, this.origin);
    const n = rn.dot(this.direction), i = rn.dot(rn) - n * n, r = e.radius * e.radius;
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
    return this.intersectBox(e, rn) !== null;
  }
  intersectTriangle(e, t, n, i, r) {
    Fs.subVectors(t, e), Ui.subVectors(n, e), Bs.crossVectors(Fs, Ui);
    let a = this.direction.dot(Bs), o;
    if (a > 0) {
      if (i) return null;
      o = 1;
    } else if (a < 0)
      o = -1, a = -a;
    else
      return null;
    pn.subVectors(this.origin, e);
    const c = o * this.direction.dot(Ui.crossVectors(pn, Ui));
    if (c < 0)
      return null;
    const l = o * this.direction.dot(Fs.cross(pn));
    if (l < 0 || c + l > a)
      return null;
    const h = -o * pn.dot(Bs);
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
class Ne {
  constructor(e, t, n, i, r, a, o, c, l, h, u, d, f, g, _, p) {
    Ne.prototype.isMatrix4 = !0, this.elements = [
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
    ], e !== void 0 && this.set(e, t, n, i, r, a, o, c, l, h, u, d, f, g, _, p);
  }
  set(e, t, n, i, r, a, o, c, l, h, u, d, f, g, _, p) {
    const m = this.elements;
    return m[0] = e, m[4] = t, m[8] = n, m[12] = i, m[1] = r, m[5] = a, m[9] = o, m[13] = c, m[2] = l, m[6] = h, m[10] = u, m[14] = d, m[3] = f, m[7] = g, m[11] = _, m[15] = p, this;
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
    return new Ne().fromArray(this.elements);
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
    const t = this.elements, n = e.elements, i = 1 / kn.setFromMatrixColumn(e, 0).length(), r = 1 / kn.setFromMatrixColumn(e, 1).length(), a = 1 / kn.setFromMatrixColumn(e, 2).length();
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
    return this.compose(gc, e, _c);
  }
  lookAt(e, t, n) {
    const i = this.elements;
    return Lt.subVectors(e, t), Lt.lengthSq() === 0 && (Lt.z = 1), Lt.normalize(), mn.crossVectors(n, Lt), mn.lengthSq() === 0 && (Math.abs(n.z) === 1 ? Lt.x += 1e-4 : Lt.z += 1e-4, Lt.normalize(), mn.crossVectors(n, Lt)), mn.normalize(), Fi.crossVectors(Lt, mn), i[0] = mn.x, i[4] = Fi.x, i[8] = Lt.x, i[1] = mn.y, i[5] = Fi.y, i[9] = Lt.y, i[2] = mn.z, i[6] = Fi.z, i[10] = Lt.z, this;
  }
  multiply(e) {
    return this.multiplyMatrices(this, e);
  }
  premultiply(e) {
    return this.multiplyMatrices(e, this);
  }
  multiplyMatrices(e, t) {
    const n = e.elements, i = t.elements, r = this.elements, a = n[0], o = n[4], c = n[8], l = n[12], h = n[1], u = n[5], d = n[9], f = n[13], g = n[2], _ = n[6], p = n[10], m = n[14], T = n[3], y = n[7], A = n[11], L = n[15], w = i[0], R = i[4], N = i[8], K = i[12], x = i[1], E = i[5], B = i[9], O = i[13], U = i[2], Q = i[6], k = i[10], ne = i[14], W = i[3], oe = i[7], he = i[11], ve = i[15];
    return r[0] = a * w + o * x + c * U + l * W, r[4] = a * R + o * E + c * Q + l * oe, r[8] = a * N + o * B + c * k + l * he, r[12] = a * K + o * O + c * ne + l * ve, r[1] = h * w + u * x + d * U + f * W, r[5] = h * R + u * E + d * Q + f * oe, r[9] = h * N + u * B + d * k + f * he, r[13] = h * K + u * O + d * ne + f * ve, r[2] = g * w + _ * x + p * U + m * W, r[6] = g * R + _ * E + p * Q + m * oe, r[10] = g * N + _ * B + p * k + m * he, r[14] = g * K + _ * O + p * ne + m * ve, r[3] = T * w + y * x + A * U + L * W, r[7] = T * R + y * E + A * Q + L * oe, r[11] = T * N + y * B + A * k + L * he, r[15] = T * K + y * O + A * ne + L * ve, this;
  }
  multiplyScalar(e) {
    const t = this.elements;
    return t[0] *= e, t[4] *= e, t[8] *= e, t[12] *= e, t[1] *= e, t[5] *= e, t[9] *= e, t[13] *= e, t[2] *= e, t[6] *= e, t[10] *= e, t[14] *= e, t[3] *= e, t[7] *= e, t[11] *= e, t[15] *= e, this;
  }
  determinant() {
    const e = this.elements, t = e[0], n = e[4], i = e[8], r = e[12], a = e[1], o = e[5], c = e[9], l = e[13], h = e[2], u = e[6], d = e[10], f = e[14], g = e[3], _ = e[7], p = e[11], m = e[15];
    return g * (+r * c * u - i * l * u - r * o * d + n * l * d + i * o * f - n * c * f) + _ * (+t * c * f - t * l * d + r * a * d - i * a * f + i * l * h - r * c * h) + p * (+t * l * u - t * o * f - r * a * u + n * a * f + r * o * h - n * l * h) + m * (-i * o * h - t * c * u + t * o * d + i * a * u - n * a * d + n * c * h);
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
    const e = this.elements, t = e[0], n = e[1], i = e[2], r = e[3], a = e[4], o = e[5], c = e[6], l = e[7], h = e[8], u = e[9], d = e[10], f = e[11], g = e[12], _ = e[13], p = e[14], m = e[15], T = u * p * l - _ * d * l + _ * c * f - o * p * f - u * c * m + o * d * m, y = g * d * l - h * p * l - g * c * f + a * p * f + h * c * m - a * d * m, A = h * _ * l - g * u * l + g * o * f - a * _ * f - h * o * m + a * u * m, L = g * u * c - h * _ * c - g * o * d + a * _ * d + h * o * p - a * u * p, w = t * T + n * y + i * A + r * L;
    if (w === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    const R = 1 / w;
    return e[0] = T * R, e[1] = (_ * d * r - u * p * r - _ * i * f + n * p * f + u * i * m - n * d * m) * R, e[2] = (o * p * r - _ * c * r + _ * i * l - n * p * l - o * i * m + n * c * m) * R, e[3] = (u * c * r - o * d * r - u * i * l + n * d * l + o * i * f - n * c * f) * R, e[4] = y * R, e[5] = (h * p * r - g * d * r + g * i * f - t * p * f - h * i * m + t * d * m) * R, e[6] = (g * c * r - a * p * r - g * i * l + t * p * l + a * i * m - t * c * m) * R, e[7] = (a * d * r - h * c * r + h * i * l - t * d * l - a * i * f + t * c * f) * R, e[8] = A * R, e[9] = (g * u * r - h * _ * r - g * n * f + t * _ * f + h * n * m - t * u * m) * R, e[10] = (a * _ * r - g * o * r + g * n * l - t * _ * l - a * n * m + t * o * m) * R, e[11] = (h * o * r - a * u * r - h * n * l + t * u * l + a * n * f - t * o * f) * R, e[12] = L * R, e[13] = (h * _ * i - g * u * i + g * n * d - t * _ * d - h * n * p + t * u * p) * R, e[14] = (g * o * i - a * _ * i - g * n * c + t * _ * c + a * n * p - t * o * p) * R, e[15] = (a * u * i - h * o * i + h * n * c - t * u * c - a * n * d + t * o * d) * R, this;
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
    const i = this.elements, r = t._x, a = t._y, o = t._z, c = t._w, l = r + r, h = a + a, u = o + o, d = r * l, f = r * h, g = r * u, _ = a * h, p = a * u, m = o * u, T = c * l, y = c * h, A = c * u, L = n.x, w = n.y, R = n.z;
    return i[0] = (1 - (_ + m)) * L, i[1] = (f + A) * L, i[2] = (g - y) * L, i[3] = 0, i[4] = (f - A) * w, i[5] = (1 - (d + m)) * w, i[6] = (p + T) * w, i[7] = 0, i[8] = (g + y) * R, i[9] = (p - T) * R, i[10] = (1 - (d + _)) * R, i[11] = 0, i[12] = e.x, i[13] = e.y, i[14] = e.z, i[15] = 1, this;
  }
  decompose(e, t, n) {
    const i = this.elements;
    let r = kn.set(i[0], i[1], i[2]).length();
    const a = kn.set(i[4], i[5], i[6]).length(), o = kn.set(i[8], i[9], i[10]).length();
    this.determinant() < 0 && (r = -r), e.x = i[12], e.y = i[13], e.z = i[14], Vt.copy(this);
    const l = 1 / r, h = 1 / a, u = 1 / o;
    return Vt.elements[0] *= l, Vt.elements[1] *= l, Vt.elements[2] *= l, Vt.elements[4] *= h, Vt.elements[5] *= h, Vt.elements[6] *= h, Vt.elements[8] *= u, Vt.elements[9] *= u, Vt.elements[10] *= u, t.setFromRotationMatrix(Vt), n.x = r, n.y = a, n.z = o, this;
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
const kn = /* @__PURE__ */ new C(), Vt = /* @__PURE__ */ new Ne(), gc = /* @__PURE__ */ new C(0, 0, 0), _c = /* @__PURE__ */ new C(1, 1, 1), mn = /* @__PURE__ */ new C(), Fi = /* @__PURE__ */ new C(), Lt = /* @__PURE__ */ new C(), Kr = /* @__PURE__ */ new Ne(), Zr = /* @__PURE__ */ new Kt();
class Zt {
  constructor(e = 0, t = 0, n = 0, i = Zt.DEFAULT_ORDER) {
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
        this._y = Math.asin(yt(o, -1, 1)), Math.abs(o) < 0.9999999 ? (this._x = Math.atan2(-h, f), this._z = Math.atan2(-a, r)) : (this._x = Math.atan2(d, l), this._z = 0);
        break;
      case "YXZ":
        this._x = Math.asin(-yt(h, -1, 1)), Math.abs(h) < 0.9999999 ? (this._y = Math.atan2(o, f), this._z = Math.atan2(c, l)) : (this._y = Math.atan2(-u, r), this._z = 0);
        break;
      case "ZXY":
        this._x = Math.asin(yt(d, -1, 1)), Math.abs(d) < 0.9999999 ? (this._y = Math.atan2(-u, f), this._z = Math.atan2(-a, l)) : (this._y = 0, this._z = Math.atan2(c, r));
        break;
      case "ZYX":
        this._y = Math.asin(-yt(u, -1, 1)), Math.abs(u) < 0.9999999 ? (this._x = Math.atan2(d, f), this._z = Math.atan2(c, r)) : (this._x = 0, this._z = Math.atan2(-a, l));
        break;
      case "YZX":
        this._z = Math.asin(yt(c, -1, 1)), Math.abs(c) < 0.9999999 ? (this._x = Math.atan2(-h, l), this._y = Math.atan2(-u, r)) : (this._x = 0, this._y = Math.atan2(o, f));
        break;
      case "XZY":
        this._z = Math.asin(-yt(a, -1, 1)), Math.abs(a) < 0.9999999 ? (this._x = Math.atan2(d, l), this._y = Math.atan2(o, r)) : (this._x = Math.atan2(-h, f), this._y = 0);
        break;
      default:
        console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: " + t);
    }
    return this._order = t, n === !0 && this._onChangeCallback(), this;
  }
  setFromQuaternion(e, t, n) {
    return Kr.makeRotationFromQuaternion(e), this.setFromRotationMatrix(Kr, t, n);
  }
  setFromVector3(e, t = this._order) {
    return this.set(e.x, e.y, e.z, t);
  }
  reorder(e) {
    return Zr.setFromEuler(this), this.setFromQuaternion(Zr, e);
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
Zt.DEFAULT_ORDER = "XYZ";
class lo {
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
let xc = 0;
const $r = /* @__PURE__ */ new C(), Vn = /* @__PURE__ */ new Kt(), an = /* @__PURE__ */ new Ne(), Bi = /* @__PURE__ */ new C(), gi = /* @__PURE__ */ new C(), vc = /* @__PURE__ */ new C(), Mc = /* @__PURE__ */ new Kt(), Jr = /* @__PURE__ */ new C(1, 0, 0), Qr = /* @__PURE__ */ new C(0, 1, 0), ea = /* @__PURE__ */ new C(0, 0, 1), ta = { type: "added" }, Sc = { type: "removed" }, Hn = { type: "childadded", child: null }, Os = { type: "childremoved", child: null };
class at extends Un {
  constructor() {
    super(), this.isObject3D = !0, Object.defineProperty(this, "id", { value: xc++ }), this.uuid = Yt(), this.name = "", this.type = "Object3D", this.parent = null, this.children = [], this.up = at.DEFAULT_UP.clone();
    const e = new C(), t = new Zt(), n = new Kt(), i = new C(1, 1, 1);
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
        value: new Ne()
      },
      normalMatrix: {
        value: new Fe()
      }
    }), this.matrix = new Ne(), this.matrixWorld = new Ne(), this.matrixAutoUpdate = at.DEFAULT_MATRIX_AUTO_UPDATE, this.matrixWorldAutoUpdate = at.DEFAULT_MATRIX_WORLD_AUTO_UPDATE, this.matrixWorldNeedsUpdate = !1, this.layers = new lo(), this.visible = !0, this.castShadow = !1, this.receiveShadow = !1, this.frustumCulled = !0, this.renderOrder = 0, this.animations = [], this.userData = {};
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
    return Vn.setFromAxisAngle(e, t), this.quaternion.multiply(Vn), this;
  }
  rotateOnWorldAxis(e, t) {
    return Vn.setFromAxisAngle(e, t), this.quaternion.premultiply(Vn), this;
  }
  rotateX(e) {
    return this.rotateOnAxis(Jr, e);
  }
  rotateY(e) {
    return this.rotateOnAxis(Qr, e);
  }
  rotateZ(e) {
    return this.rotateOnAxis(ea, e);
  }
  translateOnAxis(e, t) {
    return $r.copy(e).applyQuaternion(this.quaternion), this.position.add($r.multiplyScalar(t)), this;
  }
  translateX(e) {
    return this.translateOnAxis(Jr, e);
  }
  translateY(e) {
    return this.translateOnAxis(Qr, e);
  }
  translateZ(e) {
    return this.translateOnAxis(ea, e);
  }
  localToWorld(e) {
    return this.updateWorldMatrix(!0, !1), e.applyMatrix4(this.matrixWorld);
  }
  worldToLocal(e) {
    return this.updateWorldMatrix(!0, !1), e.applyMatrix4(an.copy(this.matrixWorld).invert());
  }
  lookAt(e, t, n) {
    e.isVector3 ? Bi.copy(e) : Bi.set(e, t, n);
    const i = this.parent;
    this.updateWorldMatrix(!0, !1), gi.setFromMatrixPosition(this.matrixWorld), this.isCamera || this.isLight ? an.lookAt(gi, Bi, this.up) : an.lookAt(Bi, gi, this.up), this.quaternion.setFromRotationMatrix(an), i && (an.extractRotation(i.matrixWorld), Vn.setFromRotationMatrix(an), this.quaternion.premultiply(Vn.invert()));
  }
  add(e) {
    if (arguments.length > 1) {
      for (let t = 0; t < arguments.length; t++)
        this.add(arguments[t]);
      return this;
    }
    return e === this ? (console.error("THREE.Object3D.add: object can't be added as a child of itself.", e), this) : (e && e.isObject3D ? (e.removeFromParent(), e.parent = this, this.children.push(e), e.dispatchEvent(ta), Hn.child = e, this.dispatchEvent(Hn), Hn.child = null) : console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", e), this);
  }
  remove(e) {
    if (arguments.length > 1) {
      for (let n = 0; n < arguments.length; n++)
        this.remove(arguments[n]);
      return this;
    }
    const t = this.children.indexOf(e);
    return t !== -1 && (e.parent = null, this.children.splice(t, 1), e.dispatchEvent(Sc), Os.child = e, this.dispatchEvent(Os), Os.child = null), this;
  }
  removeFromParent() {
    const e = this.parent;
    return e !== null && e.remove(this), this;
  }
  clear() {
    return this.remove(...this.children);
  }
  attach(e) {
    return this.updateWorldMatrix(!0, !1), an.copy(this.matrixWorld).invert(), e.parent !== null && (e.parent.updateWorldMatrix(!0, !1), an.multiply(e.parent.matrixWorld)), e.applyMatrix4(an), e.removeFromParent(), e.parent = this, this.children.push(e), e.updateWorldMatrix(!1, !0), e.dispatchEvent(ta), Hn.child = e, this.dispatchEvent(Hn), Hn.child = null, this;
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
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(gi, e, vc), e;
  }
  getWorldScale(e) {
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(gi, Mc, e), e;
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
at.DEFAULT_UP = /* @__PURE__ */ new C(0, 1, 0);
at.DEFAULT_MATRIX_AUTO_UPDATE = !0;
at.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = !0;
const Ht = /* @__PURE__ */ new C(), on = /* @__PURE__ */ new C(), Gs = /* @__PURE__ */ new C(), cn = /* @__PURE__ */ new C(), Wn = /* @__PURE__ */ new C(), Xn = /* @__PURE__ */ new C(), na = /* @__PURE__ */ new C(), zs = /* @__PURE__ */ new C(), ks = /* @__PURE__ */ new C(), Vs = /* @__PURE__ */ new C(), Hs = /* @__PURE__ */ new Ye(), Ws = /* @__PURE__ */ new Ye(), Xs = /* @__PURE__ */ new Ye();
class Gt {
  constructor(e = new C(), t = new C(), n = new C()) {
    this.a = e, this.b = t, this.c = n;
  }
  static getNormal(e, t, n, i) {
    i.subVectors(n, t), Ht.subVectors(e, t), i.cross(Ht);
    const r = i.lengthSq();
    return r > 0 ? i.multiplyScalar(1 / Math.sqrt(r)) : i.set(0, 0, 0);
  }
  // static/instance method to calculate barycentric coordinates
  // based on: http://www.blackpawn.com/texts/pointinpoly/default.html
  static getBarycoord(e, t, n, i, r) {
    Ht.subVectors(i, t), on.subVectors(n, t), Gs.subVectors(e, t);
    const a = Ht.dot(Ht), o = Ht.dot(on), c = Ht.dot(Gs), l = on.dot(on), h = on.dot(Gs), u = a * l - o * o;
    if (u === 0)
      return r.set(0, 0, 0), null;
    const d = 1 / u, f = (l * c - o * h) * d, g = (a * h - o * c) * d;
    return r.set(1 - f - g, g, f);
  }
  static containsPoint(e, t, n, i) {
    return this.getBarycoord(e, t, n, i, cn) === null ? !1 : cn.x >= 0 && cn.y >= 0 && cn.x + cn.y <= 1;
  }
  static getInterpolation(e, t, n, i, r, a, o, c) {
    return this.getBarycoord(e, t, n, i, cn) === null ? (c.x = 0, c.y = 0, "z" in c && (c.z = 0), "w" in c && (c.w = 0), null) : (c.setScalar(0), c.addScaledVector(r, cn.x), c.addScaledVector(a, cn.y), c.addScaledVector(o, cn.z), c);
  }
  static getInterpolatedAttribute(e, t, n, i, r, a) {
    return Hs.setScalar(0), Ws.setScalar(0), Xs.setScalar(0), Hs.fromBufferAttribute(e, t), Ws.fromBufferAttribute(e, n), Xs.fromBufferAttribute(e, i), a.setScalar(0), a.addScaledVector(Hs, r.x), a.addScaledVector(Ws, r.y), a.addScaledVector(Xs, r.z), a;
  }
  static isFrontFacing(e, t, n, i) {
    return Ht.subVectors(n, t), on.subVectors(e, t), Ht.cross(on).dot(i) < 0;
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
    return Ht.subVectors(this.c, this.b), on.subVectors(this.a, this.b), Ht.cross(on).length() * 0.5;
  }
  getMidpoint(e) {
    return e.addVectors(this.a, this.b).add(this.c).multiplyScalar(1 / 3);
  }
  getNormal(e) {
    return Gt.getNormal(this.a, this.b, this.c, e);
  }
  getPlane(e) {
    return e.setFromCoplanarPoints(this.a, this.b, this.c);
  }
  getBarycoord(e, t) {
    return Gt.getBarycoord(e, this.a, this.b, this.c, t);
  }
  getInterpolation(e, t, n, i, r) {
    return Gt.getInterpolation(e, this.a, this.b, this.c, t, n, i, r);
  }
  containsPoint(e) {
    return Gt.containsPoint(e, this.a, this.b, this.c);
  }
  isFrontFacing(e) {
    return Gt.isFrontFacing(this.a, this.b, this.c, e);
  }
  intersectsBox(e) {
    return e.intersectsTriangle(this);
  }
  closestPointToPoint(e, t) {
    const n = this.a, i = this.b, r = this.c;
    let a, o;
    Wn.subVectors(i, n), Xn.subVectors(r, n), zs.subVectors(e, n);
    const c = Wn.dot(zs), l = Xn.dot(zs);
    if (c <= 0 && l <= 0)
      return t.copy(n);
    ks.subVectors(e, i);
    const h = Wn.dot(ks), u = Xn.dot(ks);
    if (h >= 0 && u <= h)
      return t.copy(i);
    const d = c * u - h * l;
    if (d <= 0 && c >= 0 && h <= 0)
      return a = c / (c - h), t.copy(n).addScaledVector(Wn, a);
    Vs.subVectors(e, r);
    const f = Wn.dot(Vs), g = Xn.dot(Vs);
    if (g >= 0 && f <= g)
      return t.copy(r);
    const _ = f * l - c * g;
    if (_ <= 0 && l >= 0 && g <= 0)
      return o = l / (l - g), t.copy(n).addScaledVector(Xn, o);
    const p = h * g - f * u;
    if (p <= 0 && u - h >= 0 && f - g >= 0)
      return na.subVectors(r, i), o = (u - h) / (u - h + (f - g)), t.copy(i).addScaledVector(na, o);
    const m = 1 / (p + _ + d);
    return a = _ * m, o = d * m, t.copy(n).addScaledVector(Wn, a).addScaledVector(Xn, o);
  }
  equals(e) {
    return e.a.equals(this.a) && e.b.equals(this.b) && e.c.equals(this.c);
  }
}
const ho = {
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
}, gn = { h: 0, s: 0, l: 0 }, Oi = { h: 0, s: 0, l: 0 };
function qs(s, e, t) {
  return t < 0 && (t += 1), t > 1 && (t -= 1), t < 1 / 6 ? s + (e - s) * 6 * t : t < 1 / 2 ? e : t < 2 / 3 ? s + (e - s) * 6 * (2 / 3 - t) : s;
}
class be {
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
  setHex(e, t = lt) {
    return e = Math.floor(e), this.r = (e >> 16 & 255) / 255, this.g = (e >> 8 & 255) / 255, this.b = (e & 255) / 255, Ve.toWorkingColorSpace(this, t), this;
  }
  setRGB(e, t, n, i = Ve.workingColorSpace) {
    return this.r = e, this.g = t, this.b = n, Ve.toWorkingColorSpace(this, i), this;
  }
  setHSL(e, t, n, i = Ve.workingColorSpace) {
    if (e = Er(e, 1), t = yt(t, 0, 1), n = yt(n, 0, 1), t === 0)
      this.r = this.g = this.b = n;
    else {
      const r = n <= 0.5 ? n * (1 + t) : n + t - n * t, a = 2 * n - r;
      this.r = qs(a, r, e + 1 / 3), this.g = qs(a, r, e), this.b = qs(a, r, e - 1 / 3);
    }
    return Ve.toWorkingColorSpace(this, i), this;
  }
  setStyle(e, t = lt) {
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
  setColorName(e, t = lt) {
    const n = ho[e.toLowerCase()];
    return n !== void 0 ? this.setHex(n, t) : console.warn("THREE.Color: Unknown color " + e), this;
  }
  clone() {
    return new this.constructor(this.r, this.g, this.b);
  }
  copy(e) {
    return this.r = e.r, this.g = e.g, this.b = e.b, this;
  }
  copySRGBToLinear(e) {
    return this.r = ei(e.r), this.g = ei(e.g), this.b = ei(e.b), this;
  }
  copyLinearToSRGB(e) {
    return this.r = Is(e.r), this.g = Is(e.g), this.b = Is(e.b), this;
  }
  convertSRGBToLinear() {
    return this.copySRGBToLinear(this), this;
  }
  convertLinearToSRGB() {
    return this.copyLinearToSRGB(this), this;
  }
  getHex(e = lt) {
    return Ve.fromWorkingColorSpace(St.copy(this), e), Math.round(yt(St.r * 255, 0, 255)) * 65536 + Math.round(yt(St.g * 255, 0, 255)) * 256 + Math.round(yt(St.b * 255, 0, 255));
  }
  getHexString(e = lt) {
    return ("000000" + this.getHex(e).toString(16)).slice(-6);
  }
  getHSL(e, t = Ve.workingColorSpace) {
    Ve.fromWorkingColorSpace(St.copy(this), t);
    const n = St.r, i = St.g, r = St.b, a = Math.max(n, i, r), o = Math.min(n, i, r);
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
  getRGB(e, t = Ve.workingColorSpace) {
    return Ve.fromWorkingColorSpace(St.copy(this), t), e.r = St.r, e.g = St.g, e.b = St.b, e;
  }
  getStyle(e = lt) {
    Ve.fromWorkingColorSpace(St.copy(this), e);
    const t = St.r, n = St.g, i = St.b;
    return e !== lt ? `color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})` : `rgb(${Math.round(t * 255)},${Math.round(n * 255)},${Math.round(i * 255)})`;
  }
  offsetHSL(e, t, n) {
    return this.getHSL(gn), this.setHSL(gn.h + e, gn.s + t, gn.l + n);
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
    this.getHSL(gn), e.getHSL(Oi);
    const n = Ai(gn.h, Oi.h, t), i = Ai(gn.s, Oi.s, t), r = Ai(gn.l, Oi.l, t);
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
const St = /* @__PURE__ */ new be();
be.NAMES = ho;
let yc = 0;
class Nt extends Un {
  constructor() {
    super(), this.isMaterial = !0, Object.defineProperty(this, "id", { value: yc++ }), this.uuid = Yt(), this.name = "", this.type = "Material", this.blending = 1, this.side = 0, this.vertexColors = !1, this.opacity = 1, this.transparent = !1, this.alphaHash = !1, this.blendSrc = 204, this.blendDst = 205, this.blendEquation = 100, this.blendSrcAlpha = null, this.blendDstAlpha = null, this.blendEquationAlpha = null, this.blendColor = new be(0, 0, 0), this.blendAlpha = 0, this.depthFunc = 3, this.depthTest = !0, this.depthWrite = !0, this.stencilWriteMask = 255, this.stencilFunc = 519, this.stencilRef = 0, this.stencilFuncMask = 255, this.stencilFail = 7680, this.stencilZFail = 7680, this.stencilZPass = 7680, this.stencilWrite = !1, this.clippingPlanes = null, this.clipIntersection = !1, this.clipShadows = !1, this.shadowSide = null, this.colorWrite = !0, this.precision = null, this.polygonOffset = !1, this.polygonOffsetFactor = 0, this.polygonOffsetUnits = 0, this.dithering = !1, this.alphaToCoverage = !1, this.premultipliedAlpha = !1, this.forceSinglePass = !1, this.visible = !0, this.toneMapped = !0, this.userData = {}, this.version = 0, this._alphaTest = 0;
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
class jt extends Nt {
  constructor(e) {
    super(), this.isMeshBasicMaterial = !0, this.type = "MeshBasicMaterial", this.color = new be(16777215), this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new Zt(), this.combine = 0, this.reflectivity = 1, this.refractionRatio = 0.98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.specularMap = e.specularMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapRotation.copy(e.envMapRotation), this.combine = e.combine, this.reflectivity = e.reflectivity, this.refractionRatio = e.refractionRatio, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.fog = e.fog, this;
  }
}
const ut = /* @__PURE__ */ new C(), Gi = /* @__PURE__ */ new Be();
class At {
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
        Gi.fromBufferAttribute(this, t), Gi.applyMatrix3(e), this.setXY(t, Gi.x, Gi.y);
    else if (this.itemSize === 3)
      for (let t = 0, n = this.count; t < n; t++)
        ut.fromBufferAttribute(this, t), ut.applyMatrix3(e), this.setXYZ(t, ut.x, ut.y, ut.z);
    return this;
  }
  applyMatrix4(e) {
    for (let t = 0, n = this.count; t < n; t++)
      ut.fromBufferAttribute(this, t), ut.applyMatrix4(e), this.setXYZ(t, ut.x, ut.y, ut.z);
    return this;
  }
  applyNormalMatrix(e) {
    for (let t = 0, n = this.count; t < n; t++)
      ut.fromBufferAttribute(this, t), ut.applyNormalMatrix(e), this.setXYZ(t, ut.x, ut.y, ut.z);
    return this;
  }
  transformDirection(e) {
    for (let t = 0, n = this.count; t < n; t++)
      ut.fromBufferAttribute(this, t), ut.transformDirection(e), this.setXYZ(t, ut.x, ut.y, ut.z);
    return this;
  }
  set(e, t = 0) {
    return this.array.set(e, t), this;
  }
  getComponent(e, t) {
    let n = this.array[e * this.itemSize + t];
    return this.normalized && (n = qt(n, this.array)), n;
  }
  setComponent(e, t, n) {
    return this.normalized && (n = tt(n, this.array)), this.array[e * this.itemSize + t] = n, this;
  }
  getX(e) {
    let t = this.array[e * this.itemSize];
    return this.normalized && (t = qt(t, this.array)), t;
  }
  setX(e, t) {
    return this.normalized && (t = tt(t, this.array)), this.array[e * this.itemSize] = t, this;
  }
  getY(e) {
    let t = this.array[e * this.itemSize + 1];
    return this.normalized && (t = qt(t, this.array)), t;
  }
  setY(e, t) {
    return this.normalized && (t = tt(t, this.array)), this.array[e * this.itemSize + 1] = t, this;
  }
  getZ(e) {
    let t = this.array[e * this.itemSize + 2];
    return this.normalized && (t = qt(t, this.array)), t;
  }
  setZ(e, t) {
    return this.normalized && (t = tt(t, this.array)), this.array[e * this.itemSize + 2] = t, this;
  }
  getW(e) {
    let t = this.array[e * this.itemSize + 3];
    return this.normalized && (t = qt(t, this.array)), t;
  }
  setW(e, t) {
    return this.normalized && (t = tt(t, this.array)), this.array[e * this.itemSize + 3] = t, this;
  }
  setXY(e, t, n) {
    return e *= this.itemSize, this.normalized && (t = tt(t, this.array), n = tt(n, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this;
  }
  setXYZ(e, t, n, i) {
    return e *= this.itemSize, this.normalized && (t = tt(t, this.array), n = tt(n, this.array), i = tt(i, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this.array[e + 2] = i, this;
  }
  setXYZW(e, t, n, i, r) {
    return e *= this.itemSize, this.normalized && (t = tt(t, this.array), n = tt(n, this.array), i = tt(i, this.array), r = tt(r, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this.array[e + 2] = i, this.array[e + 3] = r, this;
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
class uo extends At {
  constructor(e, t, n) {
    super(new Uint16Array(e), t, n);
  }
}
class fo extends At {
  constructor(e, t, n) {
    super(new Uint32Array(e), t, n);
  }
}
class nt extends At {
  constructor(e, t, n) {
    super(new Float32Array(e), t, n);
  }
}
let Ec = 0;
const Ft = /* @__PURE__ */ new Ne(), js = /* @__PURE__ */ new at(), qn = /* @__PURE__ */ new C(), Dt = /* @__PURE__ */ new $t(), _i = /* @__PURE__ */ new $t(), pt = /* @__PURE__ */ new C();
class vt extends Un {
  constructor() {
    super(), this.isBufferGeometry = !0, Object.defineProperty(this, "id", { value: Ec++ }), this.uuid = Yt(), this.name = "", this.type = "BufferGeometry", this.index = null, this.attributes = {}, this.morphAttributes = {}, this.morphTargetsRelative = !1, this.groups = [], this.boundingBox = null, this.boundingSphere = null, this.drawRange = { start: 0, count: 1 / 0 }, this.userData = {};
  }
  getIndex() {
    return this.index;
  }
  setIndex(e) {
    return Array.isArray(e) ? this.index = new (ao(e) ? fo : uo)(e, 1) : this.index = e, this;
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
      const r = new Fe().getNormalMatrix(e);
      n.applyNormalMatrix(r), n.needsUpdate = !0;
    }
    const i = this.attributes.tangent;
    return i !== void 0 && (i.transformDirection(e), i.needsUpdate = !0), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this;
  }
  applyQuaternion(e) {
    return Ft.makeRotationFromQuaternion(e), this.applyMatrix4(Ft), this;
  }
  rotateX(e) {
    return Ft.makeRotationX(e), this.applyMatrix4(Ft), this;
  }
  rotateY(e) {
    return Ft.makeRotationY(e), this.applyMatrix4(Ft), this;
  }
  rotateZ(e) {
    return Ft.makeRotationZ(e), this.applyMatrix4(Ft), this;
  }
  translate(e, t, n) {
    return Ft.makeTranslation(e, t, n), this.applyMatrix4(Ft), this;
  }
  scale(e, t, n) {
    return Ft.makeScale(e, t, n), this.applyMatrix4(Ft), this;
  }
  lookAt(e) {
    return js.lookAt(e), js.updateMatrix(), this.applyMatrix4(js.matrix), this;
  }
  center() {
    return this.computeBoundingBox(), this.boundingBox.getCenter(qn).negate(), this.translate(qn.x, qn.y, qn.z), this;
  }
  setFromPoints(e) {
    const t = [];
    for (let n = 0, i = e.length; n < i; n++) {
      const r = e[n];
      t.push(r.x, r.y, r.z || 0);
    }
    return this.setAttribute("position", new nt(t, 3)), this;
  }
  computeBoundingBox() {
    this.boundingBox === null && (this.boundingBox = new $t());
    const e = this.attributes.position, t = this.morphAttributes.position;
    if (e && e.isGLBufferAttribute) {
      console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.", this), this.boundingBox.set(
        new C(-1 / 0, -1 / 0, -1 / 0),
        new C(1 / 0, 1 / 0, 1 / 0)
      );
      return;
    }
    if (e !== void 0) {
      if (this.boundingBox.setFromBufferAttribute(e), t)
        for (let n = 0, i = t.length; n < i; n++) {
          const r = t[n];
          Dt.setFromBufferAttribute(r), this.morphTargetsRelative ? (pt.addVectors(this.boundingBox.min, Dt.min), this.boundingBox.expandByPoint(pt), pt.addVectors(this.boundingBox.max, Dt.max), this.boundingBox.expandByPoint(pt)) : (this.boundingBox.expandByPoint(Dt.min), this.boundingBox.expandByPoint(Dt.max));
        }
    } else
      this.boundingBox.makeEmpty();
    (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) && console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this);
  }
  computeBoundingSphere() {
    this.boundingSphere === null && (this.boundingSphere = new Qt());
    const e = this.attributes.position, t = this.morphAttributes.position;
    if (e && e.isGLBufferAttribute) {
      console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.", this), this.boundingSphere.set(new C(), 1 / 0);
      return;
    }
    if (e) {
      const n = this.boundingSphere.center;
      if (Dt.setFromBufferAttribute(e), t)
        for (let r = 0, a = t.length; r < a; r++) {
          const o = t[r];
          _i.setFromBufferAttribute(o), this.morphTargetsRelative ? (pt.addVectors(Dt.min, _i.min), Dt.expandByPoint(pt), pt.addVectors(Dt.max, _i.max), Dt.expandByPoint(pt)) : (Dt.expandByPoint(_i.min), Dt.expandByPoint(_i.max));
        }
      Dt.getCenter(n);
      let i = 0;
      for (let r = 0, a = e.count; r < a; r++)
        pt.fromBufferAttribute(e, r), i = Math.max(i, n.distanceToSquared(pt));
      if (t)
        for (let r = 0, a = t.length; r < a; r++) {
          const o = t[r], c = this.morphTargetsRelative;
          for (let l = 0, h = o.count; l < h; l++)
            pt.fromBufferAttribute(o, l), c && (qn.fromBufferAttribute(e, l), pt.add(qn)), i = Math.max(i, n.distanceToSquared(pt));
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
    this.hasAttribute("tangent") === !1 && this.setAttribute("tangent", new At(new Float32Array(4 * n.count), 4));
    const a = this.getAttribute("tangent"), o = [], c = [];
    for (let N = 0; N < n.count; N++)
      o[N] = new C(), c[N] = new C();
    const l = new C(), h = new C(), u = new C(), d = new Be(), f = new Be(), g = new Be(), _ = new C(), p = new C();
    function m(N, K, x) {
      l.fromBufferAttribute(n, N), h.fromBufferAttribute(n, K), u.fromBufferAttribute(n, x), d.fromBufferAttribute(r, N), f.fromBufferAttribute(r, K), g.fromBufferAttribute(r, x), h.sub(l), u.sub(l), f.sub(d), g.sub(d);
      const E = 1 / (f.x * g.y - g.x * f.y);
      isFinite(E) && (_.copy(h).multiplyScalar(g.y).addScaledVector(u, -f.y).multiplyScalar(E), p.copy(u).multiplyScalar(f.x).addScaledVector(h, -g.x).multiplyScalar(E), o[N].add(_), o[K].add(_), o[x].add(_), c[N].add(p), c[K].add(p), c[x].add(p));
    }
    let T = this.groups;
    T.length === 0 && (T = [{
      start: 0,
      count: e.count
    }]);
    for (let N = 0, K = T.length; N < K; ++N) {
      const x = T[N], E = x.start, B = x.count;
      for (let O = E, U = E + B; O < U; O += 3)
        m(
          e.getX(O + 0),
          e.getX(O + 1),
          e.getX(O + 2)
        );
    }
    const y = new C(), A = new C(), L = new C(), w = new C();
    function R(N) {
      L.fromBufferAttribute(i, N), w.copy(L);
      const K = o[N];
      y.copy(K), y.sub(L.multiplyScalar(L.dot(K))).normalize(), A.crossVectors(w, K);
      const E = A.dot(c[N]) < 0 ? -1 : 1;
      a.setXYZW(N, y.x, y.y, y.z, E);
    }
    for (let N = 0, K = T.length; N < K; ++N) {
      const x = T[N], E = x.start, B = x.count;
      for (let O = E, U = E + B; O < U; O += 3)
        R(e.getX(O + 0)), R(e.getX(O + 1)), R(e.getX(O + 2));
    }
  }
  computeVertexNormals() {
    const e = this.index, t = this.getAttribute("position");
    if (t !== void 0) {
      let n = this.getAttribute("normal");
      if (n === void 0)
        n = new At(new Float32Array(t.count * 3), 3), this.setAttribute("normal", n);
      else
        for (let d = 0, f = n.count; d < f; d++)
          n.setXYZ(d, 0, 0, 0);
      const i = new C(), r = new C(), a = new C(), o = new C(), c = new C(), l = new C(), h = new C(), u = new C();
      if (e)
        for (let d = 0, f = e.count; d < f; d += 3) {
          const g = e.getX(d + 0), _ = e.getX(d + 1), p = e.getX(d + 2);
          i.fromBufferAttribute(t, g), r.fromBufferAttribute(t, _), a.fromBufferAttribute(t, p), h.subVectors(a, r), u.subVectors(i, r), h.cross(u), o.fromBufferAttribute(n, g), c.fromBufferAttribute(n, _), l.fromBufferAttribute(n, p), o.add(h), c.add(h), l.add(h), n.setXYZ(g, o.x, o.y, o.z), n.setXYZ(_, c.x, c.y, c.z), n.setXYZ(p, l.x, l.y, l.z);
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
      pt.fromBufferAttribute(e, t), pt.normalize(), e.setXYZ(t, pt.x, pt.y, pt.z);
  }
  toNonIndexed() {
    function e(o, c) {
      const l = o.array, h = o.itemSize, u = o.normalized, d = new l.constructor(c.length * h);
      let f = 0, g = 0;
      for (let _ = 0, p = c.length; _ < p; _++) {
        o.isInterleavedBufferAttribute ? f = c[_] * o.data.stride + o.offset : f = c[_] * h;
        for (let m = 0; m < h; m++)
          d[g++] = l[f++];
      }
      return new At(d, h, u);
    }
    if (this.index === null)
      return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."), this;
    const t = new vt(), n = this.index.array, i = this.attributes;
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
const ia = /* @__PURE__ */ new Ne(), bn = /* @__PURE__ */ new vs(), zi = /* @__PURE__ */ new Qt(), sa = /* @__PURE__ */ new C(), ki = /* @__PURE__ */ new C(), Vi = /* @__PURE__ */ new C(), Hi = /* @__PURE__ */ new C(), Ys = /* @__PURE__ */ new C(), Wi = /* @__PURE__ */ new C(), ra = /* @__PURE__ */ new C(), Xi = /* @__PURE__ */ new C();
class Qe extends at {
  constructor(e = new vt(), t = new jt()) {
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
      Wi.set(0, 0, 0);
      for (let c = 0, l = r.length; c < l; c++) {
        const h = o[c], u = r[c];
        h !== 0 && (Ys.fromBufferAttribute(u, e), a ? Wi.addScaledVector(Ys, h) : Wi.addScaledVector(Ys.sub(t), h));
      }
      t.add(Wi);
    }
    return t;
  }
  raycast(e, t) {
    const n = this.geometry, i = this.material, r = this.matrixWorld;
    i !== void 0 && (n.boundingSphere === null && n.computeBoundingSphere(), zi.copy(n.boundingSphere), zi.applyMatrix4(r), bn.copy(e.ray).recast(e.near), !(zi.containsPoint(bn.origin) === !1 && (bn.intersectSphere(zi, sa) === null || bn.origin.distanceToSquared(sa) > (e.far - e.near) ** 2)) && (ia.copy(r).invert(), bn.copy(e.ray).applyMatrix4(ia), !(n.boundingBox !== null && bn.intersectsBox(n.boundingBox) === !1) && this._computeIntersections(e, t, bn)));
  }
  _computeIntersections(e, t, n) {
    let i;
    const r = this.geometry, a = this.material, o = r.index, c = r.attributes.position, l = r.attributes.uv, h = r.attributes.uv1, u = r.attributes.normal, d = r.groups, f = r.drawRange;
    if (o !== null)
      if (Array.isArray(a))
        for (let g = 0, _ = d.length; g < _; g++) {
          const p = d[g], m = a[p.materialIndex], T = Math.max(p.start, f.start), y = Math.min(o.count, Math.min(p.start + p.count, f.start + f.count));
          for (let A = T, L = y; A < L; A += 3) {
            const w = o.getX(A), R = o.getX(A + 1), N = o.getX(A + 2);
            i = qi(this, m, e, n, l, h, u, w, R, N), i && (i.faceIndex = Math.floor(A / 3), i.face.materialIndex = p.materialIndex, t.push(i));
          }
        }
      else {
        const g = Math.max(0, f.start), _ = Math.min(o.count, f.start + f.count);
        for (let p = g, m = _; p < m; p += 3) {
          const T = o.getX(p), y = o.getX(p + 1), A = o.getX(p + 2);
          i = qi(this, a, e, n, l, h, u, T, y, A), i && (i.faceIndex = Math.floor(p / 3), t.push(i));
        }
      }
    else if (c !== void 0)
      if (Array.isArray(a))
        for (let g = 0, _ = d.length; g < _; g++) {
          const p = d[g], m = a[p.materialIndex], T = Math.max(p.start, f.start), y = Math.min(c.count, Math.min(p.start + p.count, f.start + f.count));
          for (let A = T, L = y; A < L; A += 3) {
            const w = A, R = A + 1, N = A + 2;
            i = qi(this, m, e, n, l, h, u, w, R, N), i && (i.faceIndex = Math.floor(A / 3), i.face.materialIndex = p.materialIndex, t.push(i));
          }
        }
      else {
        const g = Math.max(0, f.start), _ = Math.min(c.count, f.start + f.count);
        for (let p = g, m = _; p < m; p += 3) {
          const T = p, y = p + 1, A = p + 2;
          i = qi(this, a, e, n, l, h, u, T, y, A), i && (i.faceIndex = Math.floor(p / 3), t.push(i));
        }
      }
  }
}
function Tc(s, e, t, n, i, r, a, o) {
  let c;
  if (e.side === 1 ? c = n.intersectTriangle(a, r, i, !0, o) : c = n.intersectTriangle(i, r, a, e.side === 0, o), c === null) return null;
  Xi.copy(o), Xi.applyMatrix4(s.matrixWorld);
  const l = t.ray.origin.distanceTo(Xi);
  return l < t.near || l > t.far ? null : {
    distance: l,
    point: Xi.clone(),
    object: s
  };
}
function qi(s, e, t, n, i, r, a, o, c, l) {
  s.getVertexPosition(o, ki), s.getVertexPosition(c, Vi), s.getVertexPosition(l, Hi);
  const h = Tc(s, e, t, n, ki, Vi, Hi, ra);
  if (h) {
    const u = new C();
    Gt.getBarycoord(ra, ki, Vi, Hi, u), i && (h.uv = Gt.getInterpolatedAttribute(i, o, c, l, u, new Be())), r && (h.uv1 = Gt.getInterpolatedAttribute(r, o, c, l, u, new Be())), a && (h.normal = Gt.getInterpolatedAttribute(a, o, c, l, u, new C()), h.normal.dot(n.direction) > 0 && h.normal.multiplyScalar(-1));
    const d = {
      a: o,
      b: c,
      c: l,
      normal: new C(),
      materialIndex: 0
    };
    Gt.getNormal(ki, Vi, Hi, d.normal), h.face = d, h.barycoord = u;
  }
  return h;
}
class Wt extends vt {
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
    g("z", "y", "x", -1, -1, n, t, e, a, r, 0), g("z", "y", "x", 1, -1, n, t, -e, a, r, 1), g("x", "z", "y", 1, 1, e, n, t, i, a, 2), g("x", "z", "y", 1, -1, e, n, -t, i, a, 3), g("x", "y", "z", 1, -1, e, t, n, i, r, 4), g("x", "y", "z", -1, -1, e, t, -n, i, r, 5), this.setIndex(c), this.setAttribute("position", new nt(l, 3)), this.setAttribute("normal", new nt(h, 3)), this.setAttribute("uv", new nt(u, 2));
    function g(_, p, m, T, y, A, L, w, R, N, K) {
      const x = A / R, E = L / N, B = A / 2, O = L / 2, U = w / 2, Q = R + 1, k = N + 1;
      let ne = 0, W = 0;
      const oe = new C();
      for (let he = 0; he < k; he++) {
        const ve = he * E - O;
        for (let ke = 0; ke < Q; ke++) {
          const We = ke * x - B;
          oe[_] = We * T, oe[p] = ve * y, oe[m] = U, l.push(oe.x, oe.y, oe.z), oe[_] = 0, oe[p] = 0, oe[m] = w > 0 ? 1 : -1, h.push(oe.x, oe.y, oe.z), u.push(ke / R), u.push(1 - he / N), ne += 1;
        }
      }
      for (let he = 0; he < N; he++)
        for (let ve = 0; ve < R; ve++) {
          const ke = d + ve + Q * he, We = d + ve + Q * (he + 1), X = d + (ve + 1) + Q * (he + 1), te = d + (ve + 1) + Q * he;
          c.push(ke, We, te), c.push(We, X, te), W += 6;
        }
      o.addGroup(f, W, K), f += W, d += ne;
    }
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new Wt(e.width, e.height, e.depth, e.widthSegments, e.heightSegments, e.depthSegments);
  }
}
function ri(s) {
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
function Tt(s) {
  const e = {};
  for (let t = 0; t < s.length; t++) {
    const n = ri(s[t]);
    for (const i in n)
      e[i] = n[i];
  }
  return e;
}
function Ac(s) {
  const e = [];
  for (let t = 0; t < s.length; t++)
    e.push(s[t].clone());
  return e;
}
function po(s) {
  const e = s.getRenderTarget();
  return e === null ? s.outputColorSpace : e.isXRRenderTarget === !0 ? e.texture.colorSpace : Ve.workingColorSpace;
}
const bc = { clone: ri, merge: Tt };
var wc = `void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`, Rc = `void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;
class Sn extends Nt {
  constructor(e) {
    super(), this.isShaderMaterial = !0, this.type = "ShaderMaterial", this.defines = {}, this.uniforms = {}, this.uniformsGroups = [], this.vertexShader = wc, this.fragmentShader = Rc, this.linewidth = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.fog = !1, this.lights = !1, this.clipping = !1, this.forceSinglePass = !0, this.extensions = {
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
    return super.copy(e), this.fragmentShader = e.fragmentShader, this.vertexShader = e.vertexShader, this.uniforms = ri(e.uniforms), this.uniformsGroups = Ac(e.uniformsGroups), this.defines = Object.assign({}, e.defines), this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.fog = e.fog, this.lights = e.lights, this.clipping = e.clipping, this.extensions = Object.assign({}, e.extensions), this.glslVersion = e.glslVersion, this;
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
class mo extends at {
  constructor() {
    super(), this.isCamera = !0, this.type = "Camera", this.matrixWorldInverse = new Ne(), this.projectionMatrix = new Ne(), this.projectionMatrixInverse = new Ne(), this.coordinateSystem = 2e3;
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
const _n = /* @__PURE__ */ new C(), aa = /* @__PURE__ */ new Be(), oa = /* @__PURE__ */ new Be();
class Rt extends mo {
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
    this.fov = si * 2 * Math.atan(t), this.updateProjectionMatrix();
  }
  /**
   * Calculates the focal length from the current .fov and .filmGauge.
   */
  getFocalLength() {
    const e = Math.tan(Qn * 0.5 * this.fov);
    return 0.5 * this.getFilmHeight() / e;
  }
  getEffectiveFOV() {
    return si * 2 * Math.atan(
      Math.tan(Qn * 0.5 * this.fov) / this.zoom
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
    _n.set(-1, -1, 0.5).applyMatrix4(this.projectionMatrixInverse), t.set(_n.x, _n.y).multiplyScalar(-e / _n.z), _n.set(1, 1, 0.5).applyMatrix4(this.projectionMatrixInverse), n.set(_n.x, _n.y).multiplyScalar(-e / _n.z);
  }
  /**
   * Computes the width and height of the camera's viewable rectangle at a given distance along the viewing direction.
   * Copies the result into the target Vector2, where x is width and y is height.
   */
  getViewSize(e, t) {
    return this.getViewBounds(e, aa, oa), t.subVectors(oa, aa);
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
    let t = e * Math.tan(Qn * 0.5 * this.fov) / this.zoom, n = 2 * t, i = this.aspect * n, r = -0.5 * i;
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
const jn = -90, Yn = 1;
class Cc extends at {
  constructor(e, t, n) {
    super(), this.type = "CubeCamera", this.renderTarget = n, this.coordinateSystem = null, this.activeMipmapLevel = 0;
    const i = new Rt(jn, Yn, e, t);
    i.layers = this.layers, this.add(i);
    const r = new Rt(jn, Yn, e, t);
    r.layers = this.layers, this.add(r);
    const a = new Rt(jn, Yn, e, t);
    a.layers = this.layers, this.add(a);
    const o = new Rt(jn, Yn, e, t);
    o.layers = this.layers, this.add(o);
    const c = new Rt(jn, Yn, e, t);
    c.layers = this.layers, this.add(c);
    const l = new Rt(jn, Yn, e, t);
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
class go extends gt {
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
class Ic extends Nn {
  constructor(e = 1, t = {}) {
    super(e, e, t), this.isWebGLCubeRenderTarget = !0;
    const n = { width: e, height: e, depth: 1 }, i = [n, n, n, n, n, n];
    this.texture = new go(i, t.mapping, t.wrapS, t.wrapT, t.magFilter, t.minFilter, t.format, t.type, t.anisotropy, t.colorSpace), this.texture.isRenderTargetTexture = !0, this.texture.generateMipmaps = t.generateMipmaps !== void 0 ? t.generateMipmaps : !1, this.texture.minFilter = t.minFilter !== void 0 ? t.minFilter : 1006;
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
    }, i = new Wt(5, 5, 5), r = new Sn({
      name: "CubemapFromEquirect",
      uniforms: ri(n.uniforms),
      vertexShader: n.vertexShader,
      fragmentShader: n.fragmentShader,
      side: 1,
      blending: 0
    });
    r.uniforms.tEquirect.value = t;
    const a = new Qe(i, r), o = t.minFilter;
    return t.minFilter === 1008 && (t.minFilter = 1006), new Cc(1, 10, this).update(e, a), t.minFilter = o, a.geometry.dispose(), a.material.dispose(), this;
  }
  clear(e, t, n, i) {
    const r = e.getRenderTarget();
    for (let a = 0; a < 6; a++)
      e.setRenderTarget(this, a), e.clear(t, n, i);
    e.setRenderTarget(r);
  }
}
const Ks = /* @__PURE__ */ new C(), Pc = /* @__PURE__ */ new C(), Lc = /* @__PURE__ */ new Fe();
class Pn {
  constructor(e = new C(1, 0, 0), t = 0) {
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
    const i = Ks.subVectors(n, t).cross(Pc.subVectors(e, t)).normalize();
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
    const n = e.delta(Ks), i = this.normal.dot(n);
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
    const n = t || Lc.getNormalMatrix(e), i = this.coplanarPoint(Ks).applyMatrix4(e), r = this.normal.applyMatrix3(n).normalize();
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
const wn = /* @__PURE__ */ new Qt(), ji = /* @__PURE__ */ new C();
class Tr {
  constructor(e = new Pn(), t = new Pn(), n = new Pn(), i = new Pn(), r = new Pn(), a = new Pn()) {
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
    const n = this.planes, i = e.elements, r = i[0], a = i[1], o = i[2], c = i[3], l = i[4], h = i[5], u = i[6], d = i[7], f = i[8], g = i[9], _ = i[10], p = i[11], m = i[12], T = i[13], y = i[14], A = i[15];
    if (n[0].setComponents(c - r, d - l, p - f, A - m).normalize(), n[1].setComponents(c + r, d + l, p + f, A + m).normalize(), n[2].setComponents(c + a, d + h, p + g, A + T).normalize(), n[3].setComponents(c - a, d - h, p - g, A - T).normalize(), n[4].setComponents(c - o, d - u, p - _, A - y).normalize(), t === 2e3)
      n[5].setComponents(c + o, d + u, p + _, A + y).normalize();
    else if (t === 2001)
      n[5].setComponents(o, u, _, y).normalize();
    else
      throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: " + t);
    return this;
  }
  intersectsObject(e) {
    if (e.boundingSphere !== void 0)
      e.boundingSphere === null && e.computeBoundingSphere(), wn.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);
    else {
      const t = e.geometry;
      t.boundingSphere === null && t.computeBoundingSphere(), wn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld);
    }
    return this.intersectsSphere(wn);
  }
  intersectsSprite(e) {
    return wn.center.set(0, 0, 0), wn.radius = 0.7071067811865476, wn.applyMatrix4(e.matrixWorld), this.intersectsSphere(wn);
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
      if (ji.x = i.normal.x > 0 ? e.max.x : e.min.x, ji.y = i.normal.y > 0 ? e.max.y : e.min.y, ji.z = i.normal.z > 0 ? e.max.z : e.min.z, i.distanceToPoint(ji) < 0)
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
function _o() {
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
function Dc(s) {
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
class li extends vt {
  constructor(e = 1, t = 1, n = 1, i = 1) {
    super(), this.type = "PlaneGeometry", this.parameters = {
      width: e,
      height: t,
      widthSegments: n,
      heightSegments: i
    };
    const r = e / 2, a = t / 2, o = Math.floor(n), c = Math.floor(i), l = o + 1, h = c + 1, u = e / o, d = t / c, f = [], g = [], _ = [], p = [];
    for (let m = 0; m < h; m++) {
      const T = m * d - a;
      for (let y = 0; y < l; y++) {
        const A = y * u - r;
        g.push(A, -T, 0), _.push(0, 0, 1), p.push(y / o), p.push(1 - m / c);
      }
    }
    for (let m = 0; m < c; m++)
      for (let T = 0; T < o; T++) {
        const y = T + l * m, A = T + l * (m + 1), L = T + 1 + l * (m + 1), w = T + 1 + l * m;
        f.push(y, A, w), f.push(A, L, w);
      }
    this.setIndex(f), this.setAttribute("position", new nt(g, 3)), this.setAttribute("normal", new nt(_, 3)), this.setAttribute("uv", new nt(p, 2));
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new li(e.width, e.height, e.widthSegments, e.heightSegments);
  }
}
var Nc = `#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`, Uc = `#ifdef USE_ALPHAHASH
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
#endif`, Fc = `#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`, Bc = `#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`, Oc = `#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`, Gc = `#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`, zc = `#ifdef USE_AOMAP
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
#endif`, kc = `#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`, Vc = `#ifdef USE_BATCHING
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
#endif`, Hc = `#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`, Wc = `vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`, Xc = `vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`, qc = `float G_BlinnPhong_Implicit( ) {
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
} // validated`, jc = `#ifdef USE_IRIDESCENCE
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
#endif`, Yc = `#ifdef USE_BUMPMAP
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
#endif`, Kc = `#if NUM_CLIPPING_PLANES > 0
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
#endif`, Zc = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`, $c = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`, Jc = `#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`, Qc = `#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`, el = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`, tl = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`, nl = `#if defined( USE_COLOR_ALPHA )
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
#endif`, il = `#define PI 3.141592653589793
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
} // validated`, sl = `#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`, rl = `vec3 transformedNormal = objectNormal;
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
#endif`, al = `#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`, ol = `#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`, cl = `#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`, ll = `#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`, hl = "gl_FragColor = linearToOutputTexel( gl_FragColor );", ul = `
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
}`, dl = `#ifdef USE_ENVMAP
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
#endif`, fl = `#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`, pl = `#ifdef USE_ENVMAP
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
#endif`, ml = `#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`, gl = `#ifdef USE_ENVMAP
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
#endif`, _l = `#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`, xl = `#ifdef USE_FOG
	varying float vFogDepth;
#endif`, vl = `#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`, Ml = `#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`, Sl = `#ifdef USE_GRADIENTMAP
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
}`, yl = `#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`, El = `LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`, Tl = `varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`, Al = `uniform bool receiveShadow;
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
#endif`, bl = `#ifdef USE_ENVMAP
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
#endif`, wl = `ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`, Rl = `varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`, Cl = `BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`, Il = `varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`, Pl = `PhysicalMaterial material;
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
#endif`, Ll = `struct PhysicalMaterial {
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
}`, Dl = `
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
#endif`, Nl = `#if defined( RE_IndirectDiffuse )
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
#endif`, Ul = `#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`, Fl = `#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`, Bl = `#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`, Ol = `#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`, Gl = `#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`, zl = `#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`, kl = `#ifdef USE_MAP
	uniform sampler2D map;
#endif`, Vl = `#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`, Hl = `#if defined( USE_POINTS_UV )
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
#endif`, Wl = `float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`, Xl = `#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`, ql = `#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`, jl = `#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`, Yl = `#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`, Kl = `#ifdef USE_MORPHTARGETS
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
#endif`, Zl = `#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`, $l = `float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`, Jl = `#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`, Ql = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`, eh = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`, th = `#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`, nh = `#ifdef USE_NORMALMAP
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
#endif`, ih = `#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`, sh = `#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`, rh = `#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`, ah = `#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`, oh = `#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`, ch = `vec3 packNormalToRGB( const in vec3 normal ) {
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
}`, lh = `#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`, hh = `vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`, uh = `#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`, dh = `#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`, fh = `float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`, ph = `#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`, mh = `#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`, gh = `#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`, _h = `#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`, xh = `float getShadowMask() {
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
}`, vh = `#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`, Mh = `#ifdef USE_SKINNING
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
#endif`, Sh = `#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`, yh = `#ifdef USE_SKINNING
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
#endif`, Eh = `float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`, Th = `#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`, Ah = `#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`, bh = `#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`, wh = `#ifdef USE_TRANSMISSION
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
#endif`, Rh = `#ifdef USE_TRANSMISSION
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
#endif`, Ch = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`, Ih = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`, Ph = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`, Lh = `#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;
const Dh = `varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`, Nh = `uniform sampler2D t2D;
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
}`, Uh = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`, Fh = `#ifdef ENVMAP_TYPE_CUBE
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
}`, Bh = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`, Oh = `uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, Gh = `#include <common>
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
}`, zh = `#if DEPTH_PACKING == 3200
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
}`, kh = `#define DISTANCE
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
}`, Vh = `#define DISTANCE
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
}`, Hh = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`, Wh = `uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, Xh = `uniform float scale;
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
}`, qh = `uniform vec3 diffuse;
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
}`, jh = `#include <common>
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
}`, Yh = `uniform vec3 diffuse;
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
}`, Kh = `#define LAMBERT
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
}`, Zh = `#define LAMBERT
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
}`, $h = `#define MATCAP
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
}`, Jh = `#define MATCAP
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
}`, Qh = `#define NORMAL
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
}`, eu = `#define NORMAL
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
}`, tu = `#define PHONG
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
}`, nu = `#define PHONG
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
}`, iu = `#define STANDARD
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
}`, su = `#define STANDARD
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
}`, ru = `#define TOON
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
}`, au = `#define TOON
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
}`, ou = `uniform float size;
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
}`, cu = `uniform vec3 diffuse;
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
}`, lu = `#include <common>
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
}`, hu = `uniform vec3 color;
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
}`, uu = `uniform float rotation;
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
}`, du = `uniform vec3 diffuse;
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
}`, Ue = {
  alphahash_fragment: Nc,
  alphahash_pars_fragment: Uc,
  alphamap_fragment: Fc,
  alphamap_pars_fragment: Bc,
  alphatest_fragment: Oc,
  alphatest_pars_fragment: Gc,
  aomap_fragment: zc,
  aomap_pars_fragment: kc,
  batching_pars_vertex: Vc,
  batching_vertex: Hc,
  begin_vertex: Wc,
  beginnormal_vertex: Xc,
  bsdfs: qc,
  iridescence_fragment: jc,
  bumpmap_pars_fragment: Yc,
  clipping_planes_fragment: Kc,
  clipping_planes_pars_fragment: Zc,
  clipping_planes_pars_vertex: $c,
  clipping_planes_vertex: Jc,
  color_fragment: Qc,
  color_pars_fragment: el,
  color_pars_vertex: tl,
  color_vertex: nl,
  common: il,
  cube_uv_reflection_fragment: sl,
  defaultnormal_vertex: rl,
  displacementmap_pars_vertex: al,
  displacementmap_vertex: ol,
  emissivemap_fragment: cl,
  emissivemap_pars_fragment: ll,
  colorspace_fragment: hl,
  colorspace_pars_fragment: ul,
  envmap_fragment: dl,
  envmap_common_pars_fragment: fl,
  envmap_pars_fragment: pl,
  envmap_pars_vertex: ml,
  envmap_physical_pars_fragment: bl,
  envmap_vertex: gl,
  fog_vertex: _l,
  fog_pars_vertex: xl,
  fog_fragment: vl,
  fog_pars_fragment: Ml,
  gradientmap_pars_fragment: Sl,
  lightmap_pars_fragment: yl,
  lights_lambert_fragment: El,
  lights_lambert_pars_fragment: Tl,
  lights_pars_begin: Al,
  lights_toon_fragment: wl,
  lights_toon_pars_fragment: Rl,
  lights_phong_fragment: Cl,
  lights_phong_pars_fragment: Il,
  lights_physical_fragment: Pl,
  lights_physical_pars_fragment: Ll,
  lights_fragment_begin: Dl,
  lights_fragment_maps: Nl,
  lights_fragment_end: Ul,
  logdepthbuf_fragment: Fl,
  logdepthbuf_pars_fragment: Bl,
  logdepthbuf_pars_vertex: Ol,
  logdepthbuf_vertex: Gl,
  map_fragment: zl,
  map_pars_fragment: kl,
  map_particle_fragment: Vl,
  map_particle_pars_fragment: Hl,
  metalnessmap_fragment: Wl,
  metalnessmap_pars_fragment: Xl,
  morphinstance_vertex: ql,
  morphcolor_vertex: jl,
  morphnormal_vertex: Yl,
  morphtarget_pars_vertex: Kl,
  morphtarget_vertex: Zl,
  normal_fragment_begin: $l,
  normal_fragment_maps: Jl,
  normal_pars_fragment: Ql,
  normal_pars_vertex: eh,
  normal_vertex: th,
  normalmap_pars_fragment: nh,
  clearcoat_normal_fragment_begin: ih,
  clearcoat_normal_fragment_maps: sh,
  clearcoat_pars_fragment: rh,
  iridescence_pars_fragment: ah,
  opaque_fragment: oh,
  packing: ch,
  premultiplied_alpha_fragment: lh,
  project_vertex: hh,
  dithering_fragment: uh,
  dithering_pars_fragment: dh,
  roughnessmap_fragment: fh,
  roughnessmap_pars_fragment: ph,
  shadowmap_pars_fragment: mh,
  shadowmap_pars_vertex: gh,
  shadowmap_vertex: _h,
  shadowmask_pars_fragment: xh,
  skinbase_vertex: vh,
  skinning_pars_vertex: Mh,
  skinning_vertex: Sh,
  skinnormal_vertex: yh,
  specularmap_fragment: Eh,
  specularmap_pars_fragment: Th,
  tonemapping_fragment: Ah,
  tonemapping_pars_fragment: bh,
  transmission_fragment: wh,
  transmission_pars_fragment: Rh,
  uv_pars_fragment: Ch,
  uv_pars_vertex: Ih,
  uv_vertex: Ph,
  worldpos_vertex: Lh,
  background_vert: Dh,
  background_frag: Nh,
  backgroundCube_vert: Uh,
  backgroundCube_frag: Fh,
  cube_vert: Bh,
  cube_frag: Oh,
  depth_vert: Gh,
  depth_frag: zh,
  distanceRGBA_vert: kh,
  distanceRGBA_frag: Vh,
  equirect_vert: Hh,
  equirect_frag: Wh,
  linedashed_vert: Xh,
  linedashed_frag: qh,
  meshbasic_vert: jh,
  meshbasic_frag: Yh,
  meshlambert_vert: Kh,
  meshlambert_frag: Zh,
  meshmatcap_vert: $h,
  meshmatcap_frag: Jh,
  meshnormal_vert: Qh,
  meshnormal_frag: eu,
  meshphong_vert: tu,
  meshphong_frag: nu,
  meshphysical_vert: iu,
  meshphysical_frag: su,
  meshtoon_vert: ru,
  meshtoon_frag: au,
  points_vert: ou,
  points_frag: cu,
  shadow_vert: lu,
  shadow_frag: hu,
  sprite_vert: uu,
  sprite_frag: du
}, re = {
  common: {
    diffuse: { value: /* @__PURE__ */ new be(16777215) },
    opacity: { value: 1 },
    map: { value: null },
    mapTransform: { value: /* @__PURE__ */ new Fe() },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new Fe() },
    alphaTest: { value: 0 }
  },
  specularmap: {
    specularMap: { value: null },
    specularMapTransform: { value: /* @__PURE__ */ new Fe() }
  },
  envmap: {
    envMap: { value: null },
    envMapRotation: { value: /* @__PURE__ */ new Fe() },
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
    aoMapTransform: { value: /* @__PURE__ */ new Fe() }
  },
  lightmap: {
    lightMap: { value: null },
    lightMapIntensity: { value: 1 },
    lightMapTransform: { value: /* @__PURE__ */ new Fe() }
  },
  bumpmap: {
    bumpMap: { value: null },
    bumpMapTransform: { value: /* @__PURE__ */ new Fe() },
    bumpScale: { value: 1 }
  },
  normalmap: {
    normalMap: { value: null },
    normalMapTransform: { value: /* @__PURE__ */ new Fe() },
    normalScale: { value: /* @__PURE__ */ new Be(1, 1) }
  },
  displacementmap: {
    displacementMap: { value: null },
    displacementMapTransform: { value: /* @__PURE__ */ new Fe() },
    displacementScale: { value: 1 },
    displacementBias: { value: 0 }
  },
  emissivemap: {
    emissiveMap: { value: null },
    emissiveMapTransform: { value: /* @__PURE__ */ new Fe() }
  },
  metalnessmap: {
    metalnessMap: { value: null },
    metalnessMapTransform: { value: /* @__PURE__ */ new Fe() }
  },
  roughnessmap: {
    roughnessMap: { value: null },
    roughnessMapTransform: { value: /* @__PURE__ */ new Fe() }
  },
  gradientmap: {
    gradientMap: { value: null }
  },
  fog: {
    fogDensity: { value: 25e-5 },
    fogNear: { value: 1 },
    fogFar: { value: 2e3 },
    fogColor: { value: /* @__PURE__ */ new be(16777215) }
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
    diffuse: { value: /* @__PURE__ */ new be(16777215) },
    opacity: { value: 1 },
    size: { value: 1 },
    scale: { value: 1 },
    map: { value: null },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new Fe() },
    alphaTest: { value: 0 },
    uvTransform: { value: /* @__PURE__ */ new Fe() }
  },
  sprite: {
    diffuse: { value: /* @__PURE__ */ new be(16777215) },
    opacity: { value: 1 },
    center: { value: /* @__PURE__ */ new Be(0.5, 0.5) },
    rotation: { value: 0 },
    map: { value: null },
    mapTransform: { value: /* @__PURE__ */ new Fe() },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new Fe() },
    alphaTest: { value: 0 }
  }
}, Jt = {
  basic: {
    uniforms: /* @__PURE__ */ Tt([
      re.common,
      re.specularmap,
      re.envmap,
      re.aomap,
      re.lightmap,
      re.fog
    ]),
    vertexShader: Ue.meshbasic_vert,
    fragmentShader: Ue.meshbasic_frag
  },
  lambert: {
    uniforms: /* @__PURE__ */ Tt([
      re.common,
      re.specularmap,
      re.envmap,
      re.aomap,
      re.lightmap,
      re.emissivemap,
      re.bumpmap,
      re.normalmap,
      re.displacementmap,
      re.fog,
      re.lights,
      {
        emissive: { value: /* @__PURE__ */ new be(0) }
      }
    ]),
    vertexShader: Ue.meshlambert_vert,
    fragmentShader: Ue.meshlambert_frag
  },
  phong: {
    uniforms: /* @__PURE__ */ Tt([
      re.common,
      re.specularmap,
      re.envmap,
      re.aomap,
      re.lightmap,
      re.emissivemap,
      re.bumpmap,
      re.normalmap,
      re.displacementmap,
      re.fog,
      re.lights,
      {
        emissive: { value: /* @__PURE__ */ new be(0) },
        specular: { value: /* @__PURE__ */ new be(1118481) },
        shininess: { value: 30 }
      }
    ]),
    vertexShader: Ue.meshphong_vert,
    fragmentShader: Ue.meshphong_frag
  },
  standard: {
    uniforms: /* @__PURE__ */ Tt([
      re.common,
      re.envmap,
      re.aomap,
      re.lightmap,
      re.emissivemap,
      re.bumpmap,
      re.normalmap,
      re.displacementmap,
      re.roughnessmap,
      re.metalnessmap,
      re.fog,
      re.lights,
      {
        emissive: { value: /* @__PURE__ */ new be(0) },
        roughness: { value: 1 },
        metalness: { value: 0 },
        envMapIntensity: { value: 1 }
      }
    ]),
    vertexShader: Ue.meshphysical_vert,
    fragmentShader: Ue.meshphysical_frag
  },
  toon: {
    uniforms: /* @__PURE__ */ Tt([
      re.common,
      re.aomap,
      re.lightmap,
      re.emissivemap,
      re.bumpmap,
      re.normalmap,
      re.displacementmap,
      re.gradientmap,
      re.fog,
      re.lights,
      {
        emissive: { value: /* @__PURE__ */ new be(0) }
      }
    ]),
    vertexShader: Ue.meshtoon_vert,
    fragmentShader: Ue.meshtoon_frag
  },
  matcap: {
    uniforms: /* @__PURE__ */ Tt([
      re.common,
      re.bumpmap,
      re.normalmap,
      re.displacementmap,
      re.fog,
      {
        matcap: { value: null }
      }
    ]),
    vertexShader: Ue.meshmatcap_vert,
    fragmentShader: Ue.meshmatcap_frag
  },
  points: {
    uniforms: /* @__PURE__ */ Tt([
      re.points,
      re.fog
    ]),
    vertexShader: Ue.points_vert,
    fragmentShader: Ue.points_frag
  },
  dashed: {
    uniforms: /* @__PURE__ */ Tt([
      re.common,
      re.fog,
      {
        scale: { value: 1 },
        dashSize: { value: 1 },
        totalSize: { value: 2 }
      }
    ]),
    vertexShader: Ue.linedashed_vert,
    fragmentShader: Ue.linedashed_frag
  },
  depth: {
    uniforms: /* @__PURE__ */ Tt([
      re.common,
      re.displacementmap
    ]),
    vertexShader: Ue.depth_vert,
    fragmentShader: Ue.depth_frag
  },
  normal: {
    uniforms: /* @__PURE__ */ Tt([
      re.common,
      re.bumpmap,
      re.normalmap,
      re.displacementmap,
      {
        opacity: { value: 1 }
      }
    ]),
    vertexShader: Ue.meshnormal_vert,
    fragmentShader: Ue.meshnormal_frag
  },
  sprite: {
    uniforms: /* @__PURE__ */ Tt([
      re.sprite,
      re.fog
    ]),
    vertexShader: Ue.sprite_vert,
    fragmentShader: Ue.sprite_frag
  },
  background: {
    uniforms: {
      uvTransform: { value: /* @__PURE__ */ new Fe() },
      t2D: { value: null },
      backgroundIntensity: { value: 1 }
    },
    vertexShader: Ue.background_vert,
    fragmentShader: Ue.background_frag
  },
  backgroundCube: {
    uniforms: {
      envMap: { value: null },
      flipEnvMap: { value: -1 },
      backgroundBlurriness: { value: 0 },
      backgroundIntensity: { value: 1 },
      backgroundRotation: { value: /* @__PURE__ */ new Fe() }
    },
    vertexShader: Ue.backgroundCube_vert,
    fragmentShader: Ue.backgroundCube_frag
  },
  cube: {
    uniforms: {
      tCube: { value: null },
      tFlip: { value: -1 },
      opacity: { value: 1 }
    },
    vertexShader: Ue.cube_vert,
    fragmentShader: Ue.cube_frag
  },
  equirect: {
    uniforms: {
      tEquirect: { value: null }
    },
    vertexShader: Ue.equirect_vert,
    fragmentShader: Ue.equirect_frag
  },
  distanceRGBA: {
    uniforms: /* @__PURE__ */ Tt([
      re.common,
      re.displacementmap,
      {
        referencePosition: { value: /* @__PURE__ */ new C() },
        nearDistance: { value: 1 },
        farDistance: { value: 1e3 }
      }
    ]),
    vertexShader: Ue.distanceRGBA_vert,
    fragmentShader: Ue.distanceRGBA_frag
  },
  shadow: {
    uniforms: /* @__PURE__ */ Tt([
      re.lights,
      re.fog,
      {
        color: { value: /* @__PURE__ */ new be(0) },
        opacity: { value: 1 }
      }
    ]),
    vertexShader: Ue.shadow_vert,
    fragmentShader: Ue.shadow_frag
  }
};
Jt.physical = {
  uniforms: /* @__PURE__ */ Tt([
    Jt.standard.uniforms,
    {
      clearcoat: { value: 0 },
      clearcoatMap: { value: null },
      clearcoatMapTransform: { value: /* @__PURE__ */ new Fe() },
      clearcoatNormalMap: { value: null },
      clearcoatNormalMapTransform: { value: /* @__PURE__ */ new Fe() },
      clearcoatNormalScale: { value: /* @__PURE__ */ new Be(1, 1) },
      clearcoatRoughness: { value: 0 },
      clearcoatRoughnessMap: { value: null },
      clearcoatRoughnessMapTransform: { value: /* @__PURE__ */ new Fe() },
      dispersion: { value: 0 },
      iridescence: { value: 0 },
      iridescenceMap: { value: null },
      iridescenceMapTransform: { value: /* @__PURE__ */ new Fe() },
      iridescenceIOR: { value: 1.3 },
      iridescenceThicknessMinimum: { value: 100 },
      iridescenceThicknessMaximum: { value: 400 },
      iridescenceThicknessMap: { value: null },
      iridescenceThicknessMapTransform: { value: /* @__PURE__ */ new Fe() },
      sheen: { value: 0 },
      sheenColor: { value: /* @__PURE__ */ new be(0) },
      sheenColorMap: { value: null },
      sheenColorMapTransform: { value: /* @__PURE__ */ new Fe() },
      sheenRoughness: { value: 1 },
      sheenRoughnessMap: { value: null },
      sheenRoughnessMapTransform: { value: /* @__PURE__ */ new Fe() },
      transmission: { value: 0 },
      transmissionMap: { value: null },
      transmissionMapTransform: { value: /* @__PURE__ */ new Fe() },
      transmissionSamplerSize: { value: /* @__PURE__ */ new Be() },
      transmissionSamplerMap: { value: null },
      thickness: { value: 0 },
      thicknessMap: { value: null },
      thicknessMapTransform: { value: /* @__PURE__ */ new Fe() },
      attenuationDistance: { value: 0 },
      attenuationColor: { value: /* @__PURE__ */ new be(0) },
      specularColor: { value: /* @__PURE__ */ new be(1, 1, 1) },
      specularColorMap: { value: null },
      specularColorMapTransform: { value: /* @__PURE__ */ new Fe() },
      specularIntensity: { value: 1 },
      specularIntensityMap: { value: null },
      specularIntensityMapTransform: { value: /* @__PURE__ */ new Fe() },
      anisotropyVector: { value: /* @__PURE__ */ new Be() },
      anisotropyMap: { value: null },
      anisotropyMapTransform: { value: /* @__PURE__ */ new Fe() }
    }
  ]),
  vertexShader: Ue.meshphysical_vert,
  fragmentShader: Ue.meshphysical_frag
};
const Yi = { r: 0, b: 0, g: 0 }, Rn = /* @__PURE__ */ new Zt(), fu = /* @__PURE__ */ new Ne();
function pu(s, e, t, n, i, r, a) {
  const o = new be(0);
  let c = r === !0 ? 0 : 1, l, h, u = null, d = 0, f = null;
  function g(T) {
    let y = T.isScene === !0 ? T.background : null;
    return y && y.isTexture && (y = (T.backgroundBlurriness > 0 ? t : e).get(y)), y;
  }
  function _(T) {
    let y = !1;
    const A = g(T);
    A === null ? m(o, c) : A && A.isColor && (m(A, 1), y = !0);
    const L = s.xr.getEnvironmentBlendMode();
    L === "additive" ? n.buffers.color.setClear(0, 0, 0, 1, a) : L === "alpha-blend" && n.buffers.color.setClear(0, 0, 0, 0, a), (s.autoClear || y) && (n.buffers.depth.setTest(!0), n.buffers.depth.setMask(!0), n.buffers.color.setMask(!0), s.clear(s.autoClearColor, s.autoClearDepth, s.autoClearStencil));
  }
  function p(T, y) {
    const A = g(y);
    A && (A.isCubeTexture || A.mapping === 306) ? (h === void 0 && (h = new Qe(
      new Wt(1, 1, 1),
      new Sn({
        name: "BackgroundCubeMaterial",
        uniforms: ri(Jt.backgroundCube.uniforms),
        vertexShader: Jt.backgroundCube.vertexShader,
        fragmentShader: Jt.backgroundCube.fragmentShader,
        side: 1,
        depthTest: !1,
        depthWrite: !1,
        fog: !1
      })
    ), h.geometry.deleteAttribute("normal"), h.geometry.deleteAttribute("uv"), h.onBeforeRender = function(L, w, R) {
      this.matrixWorld.copyPosition(R.matrixWorld);
    }, Object.defineProperty(h.material, "envMap", {
      get: function() {
        return this.uniforms.envMap.value;
      }
    }), i.update(h)), Rn.copy(y.backgroundRotation), Rn.x *= -1, Rn.y *= -1, Rn.z *= -1, A.isCubeTexture && A.isRenderTargetTexture === !1 && (Rn.y *= -1, Rn.z *= -1), h.material.uniforms.envMap.value = A, h.material.uniforms.flipEnvMap.value = A.isCubeTexture && A.isRenderTargetTexture === !1 ? -1 : 1, h.material.uniforms.backgroundBlurriness.value = y.backgroundBlurriness, h.material.uniforms.backgroundIntensity.value = y.backgroundIntensity, h.material.uniforms.backgroundRotation.value.setFromMatrix4(fu.makeRotationFromEuler(Rn)), h.material.toneMapped = Ve.getTransfer(A.colorSpace) !== rt, (u !== A || d !== A.version || f !== s.toneMapping) && (h.material.needsUpdate = !0, u = A, d = A.version, f = s.toneMapping), h.layers.enableAll(), T.unshift(h, h.geometry, h.material, 0, 0, null)) : A && A.isTexture && (l === void 0 && (l = new Qe(
      new li(2, 2),
      new Sn({
        name: "BackgroundMaterial",
        uniforms: ri(Jt.background.uniforms),
        vertexShader: Jt.background.vertexShader,
        fragmentShader: Jt.background.fragmentShader,
        side: 0,
        depthTest: !1,
        depthWrite: !1,
        fog: !1
      })
    ), l.geometry.deleteAttribute("normal"), Object.defineProperty(l.material, "map", {
      get: function() {
        return this.uniforms.t2D.value;
      }
    }), i.update(l)), l.material.uniforms.t2D.value = A, l.material.uniforms.backgroundIntensity.value = y.backgroundIntensity, l.material.toneMapped = Ve.getTransfer(A.colorSpace) !== rt, A.matrixAutoUpdate === !0 && A.updateMatrix(), l.material.uniforms.uvTransform.value.copy(A.matrix), (u !== A || d !== A.version || f !== s.toneMapping) && (l.material.needsUpdate = !0, u = A, d = A.version, f = s.toneMapping), l.layers.enableAll(), T.unshift(l, l.geometry, l.material, 0, 0, null));
  }
  function m(T, y) {
    T.getRGB(Yi, po(s)), n.buffers.color.setClear(Yi.r, Yi.g, Yi.b, y, a);
  }
  return {
    getClearColor: function() {
      return o;
    },
    setClearColor: function(T, y = 1) {
      o.set(T), c = y, m(o, c);
    },
    getClearAlpha: function() {
      return c;
    },
    setClearAlpha: function(T) {
      c = T, m(o, c);
    },
    render: _,
    addToRenderList: p
  };
}
function mu(s, e) {
  const t = s.getParameter(s.MAX_VERTEX_ATTRIBS), n = {}, i = d(null);
  let r = i, a = !1;
  function o(x, E, B, O, U) {
    let Q = !1;
    const k = u(O, B, E);
    r !== k && (r = k, l(r.object)), Q = f(x, O, B, U), Q && g(x, O, B, U), U !== null && e.update(U, s.ELEMENT_ARRAY_BUFFER), (Q || a) && (a = !1, A(x, E, B, O), U !== null && s.bindBuffer(s.ELEMENT_ARRAY_BUFFER, e.get(U).buffer));
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
  function u(x, E, B) {
    const O = B.wireframe === !0;
    let U = n[x.id];
    U === void 0 && (U = {}, n[x.id] = U);
    let Q = U[E.id];
    Q === void 0 && (Q = {}, U[E.id] = Q);
    let k = Q[O];
    return k === void 0 && (k = d(c()), Q[O] = k), k;
  }
  function d(x) {
    const E = [], B = [], O = [];
    for (let U = 0; U < t; U++)
      E[U] = 0, B[U] = 0, O[U] = 0;
    return {
      // for backward compatibility on non-VAO support browser
      geometry: null,
      program: null,
      wireframe: !1,
      newAttributes: E,
      enabledAttributes: B,
      attributeDivisors: O,
      object: x,
      attributes: {},
      index: null
    };
  }
  function f(x, E, B, O) {
    const U = r.attributes, Q = E.attributes;
    let k = 0;
    const ne = B.getAttributes();
    for (const W in ne)
      if (ne[W].location >= 0) {
        const he = U[W];
        let ve = Q[W];
        if (ve === void 0 && (W === "instanceMatrix" && x.instanceMatrix && (ve = x.instanceMatrix), W === "instanceColor" && x.instanceColor && (ve = x.instanceColor)), he === void 0 || he.attribute !== ve || ve && he.data !== ve.data) return !0;
        k++;
      }
    return r.attributesNum !== k || r.index !== O;
  }
  function g(x, E, B, O) {
    const U = {}, Q = E.attributes;
    let k = 0;
    const ne = B.getAttributes();
    for (const W in ne)
      if (ne[W].location >= 0) {
        let he = Q[W];
        he === void 0 && (W === "instanceMatrix" && x.instanceMatrix && (he = x.instanceMatrix), W === "instanceColor" && x.instanceColor && (he = x.instanceColor));
        const ve = {};
        ve.attribute = he, he && he.data && (ve.data = he.data), U[W] = ve, k++;
      }
    r.attributes = U, r.attributesNum = k, r.index = O;
  }
  function _() {
    const x = r.newAttributes;
    for (let E = 0, B = x.length; E < B; E++)
      x[E] = 0;
  }
  function p(x) {
    m(x, 0);
  }
  function m(x, E) {
    const B = r.newAttributes, O = r.enabledAttributes, U = r.attributeDivisors;
    B[x] = 1, O[x] === 0 && (s.enableVertexAttribArray(x), O[x] = 1), U[x] !== E && (s.vertexAttribDivisor(x, E), U[x] = E);
  }
  function T() {
    const x = r.newAttributes, E = r.enabledAttributes;
    for (let B = 0, O = E.length; B < O; B++)
      E[B] !== x[B] && (s.disableVertexAttribArray(B), E[B] = 0);
  }
  function y(x, E, B, O, U, Q, k) {
    k === !0 ? s.vertexAttribIPointer(x, E, B, U, Q) : s.vertexAttribPointer(x, E, B, O, U, Q);
  }
  function A(x, E, B, O) {
    _();
    const U = O.attributes, Q = B.getAttributes(), k = E.defaultAttributeValues;
    for (const ne in Q) {
      const W = Q[ne];
      if (W.location >= 0) {
        let oe = U[ne];
        if (oe === void 0 && (ne === "instanceMatrix" && x.instanceMatrix && (oe = x.instanceMatrix), ne === "instanceColor" && x.instanceColor && (oe = x.instanceColor)), oe !== void 0) {
          const he = oe.normalized, ve = oe.itemSize, ke = e.get(oe);
          if (ke === void 0) continue;
          const We = ke.buffer, X = ke.type, te = ke.bytesPerElement, ge = X === s.INT || X === s.UNSIGNED_INT || oe.gpuType === 1013;
          if (oe.isInterleavedBufferAttribute) {
            const fe = oe.data, Ce = fe.stride, we = oe.offset;
            if (fe.isInstancedInterleavedBuffer) {
              for (let Oe = 0; Oe < W.locationSize; Oe++)
                m(W.location + Oe, fe.meshPerAttribute);
              x.isInstancedMesh !== !0 && O._maxInstanceCount === void 0 && (O._maxInstanceCount = fe.meshPerAttribute * fe.count);
            } else
              for (let Oe = 0; Oe < W.locationSize; Oe++)
                p(W.location + Oe);
            s.bindBuffer(s.ARRAY_BUFFER, We);
            for (let Oe = 0; Oe < W.locationSize; Oe++)
              y(
                W.location + Oe,
                ve / W.locationSize,
                X,
                he,
                Ce * te,
                (we + ve / W.locationSize * Oe) * te,
                ge
              );
          } else {
            if (oe.isInstancedBufferAttribute) {
              for (let fe = 0; fe < W.locationSize; fe++)
                m(W.location + fe, oe.meshPerAttribute);
              x.isInstancedMesh !== !0 && O._maxInstanceCount === void 0 && (O._maxInstanceCount = oe.meshPerAttribute * oe.count);
            } else
              for (let fe = 0; fe < W.locationSize; fe++)
                p(W.location + fe);
            s.bindBuffer(s.ARRAY_BUFFER, We);
            for (let fe = 0; fe < W.locationSize; fe++)
              y(
                W.location + fe,
                ve / W.locationSize,
                X,
                he,
                ve * te,
                ve / W.locationSize * fe * te,
                ge
              );
          }
        } else if (k !== void 0) {
          const he = k[ne];
          if (he !== void 0)
            switch (he.length) {
              case 2:
                s.vertexAttrib2fv(W.location, he);
                break;
              case 3:
                s.vertexAttrib3fv(W.location, he);
                break;
              case 4:
                s.vertexAttrib4fv(W.location, he);
                break;
              default:
                s.vertexAttrib1fv(W.location, he);
            }
        }
      }
    }
    T();
  }
  function L() {
    N();
    for (const x in n) {
      const E = n[x];
      for (const B in E) {
        const O = E[B];
        for (const U in O)
          h(O[U].object), delete O[U];
        delete E[B];
      }
      delete n[x];
    }
  }
  function w(x) {
    if (n[x.id] === void 0) return;
    const E = n[x.id];
    for (const B in E) {
      const O = E[B];
      for (const U in O)
        h(O[U].object), delete O[U];
      delete E[B];
    }
    delete n[x.id];
  }
  function R(x) {
    for (const E in n) {
      const B = n[E];
      if (B[x.id] === void 0) continue;
      const O = B[x.id];
      for (const U in O)
        h(O[U].object), delete O[U];
      delete B[x.id];
    }
  }
  function N() {
    K(), a = !0, r !== i && (r = i, l(r.object));
  }
  function K() {
    i.geometry = null, i.program = null, i.wireframe = !1;
  }
  return {
    setup: o,
    reset: N,
    resetDefaultState: K,
    dispose: L,
    releaseStatesOfGeometry: w,
    releaseStatesOfProgram: R,
    initAttributes: _,
    enableAttribute: p,
    disableUnusedAttributes: T
  };
}
function gu(s, e, t) {
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
function _u(s, e, t, n) {
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
    const N = R === 1016 && (e.has("EXT_color_buffer_half_float") || e.has("EXT_color_buffer_float"));
    return !(R !== 1009 && n.convert(R) !== s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE) && // Edge and Chrome Mac < 52 (#9513)
    R !== 1015 && !N);
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
  const f = s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS), g = s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS), _ = s.getParameter(s.MAX_TEXTURE_SIZE), p = s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE), m = s.getParameter(s.MAX_VERTEX_ATTRIBS), T = s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS), y = s.getParameter(s.MAX_VARYING_VECTORS), A = s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS), L = g > 0, w = s.getParameter(s.MAX_SAMPLES);
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
    maxCubemapSize: p,
    maxAttributes: m,
    maxVertexUniforms: T,
    maxVaryings: y,
    maxFragmentUniforms: A,
    vertexTextures: L,
    maxSamples: w
  };
}
function xu(s) {
  const e = this;
  let t = null, n = 0, i = !1, r = !1;
  const a = new Pn(), o = new Fe(), c = { value: null, needsUpdate: !1 };
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
    const g = u.clippingPlanes, _ = u.clipIntersection, p = u.clipShadows, m = s.get(u);
    if (!i || g === null || g.length === 0 || r && !p)
      r ? h(null) : l();
    else {
      const T = r ? 0 : n, y = T * 4;
      let A = m.clippingState || null;
      c.value = A, A = h(g, d, y, f);
      for (let L = 0; L !== y; ++L)
        A[L] = t[L];
      m.clippingState = A, this.numIntersection = _ ? this.numPlanes : 0, this.numPlanes += T;
    }
  };
  function l() {
    c.value !== t && (c.value = t, c.needsUpdate = n > 0), e.numPlanes = n, e.numIntersection = 0;
  }
  function h(u, d, f, g) {
    const _ = u !== null ? u.length : 0;
    let p = null;
    if (_ !== 0) {
      if (p = c.value, g !== !0 || p === null) {
        const m = f + _ * 4, T = d.matrixWorldInverse;
        o.getNormalMatrix(T), (p === null || p.length < m) && (p = new Float32Array(m));
        for (let y = 0, A = f; y !== _; ++y, A += 4)
          a.copy(u[y]).applyMatrix4(T, o), a.normal.toArray(p, A), p[A + 3] = a.constant;
      }
      c.value = p, c.needsUpdate = !0;
    }
    return e.numPlanes = _, e.numIntersection = 0, p;
  }
}
function vu(s) {
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
            const l = new Ic(c.height);
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
class Ms extends mo {
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
const $n = 4, ca = [0.125, 0.215, 0.35, 0.446, 0.526, 0.582], Dn = 20, Zs = /* @__PURE__ */ new Ms(), la = /* @__PURE__ */ new be();
let $s = null, Js = 0, Qs = 0, er = !1;
const Ln = (1 + Math.sqrt(5)) / 2, Kn = 1 / Ln, ha = [
  /* @__PURE__ */ new C(-Ln, Kn, 0),
  /* @__PURE__ */ new C(Ln, Kn, 0),
  /* @__PURE__ */ new C(-Kn, 0, Ln),
  /* @__PURE__ */ new C(Kn, 0, Ln),
  /* @__PURE__ */ new C(0, Ln, -Kn),
  /* @__PURE__ */ new C(0, Ln, Kn),
  /* @__PURE__ */ new C(-1, 1, -1),
  /* @__PURE__ */ new C(1, 1, -1),
  /* @__PURE__ */ new C(-1, 1, 1),
  /* @__PURE__ */ new C(1, 1, 1)
];
class ua {
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
    $s = this._renderer.getRenderTarget(), Js = this._renderer.getActiveCubeFace(), Qs = this._renderer.getActiveMipmapLevel(), er = this._renderer.xr.enabled, this._renderer.xr.enabled = !1, this._setSize(256);
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
    this._cubemapMaterial === null && (this._cubemapMaterial = pa(), this._compileMaterial(this._cubemapMaterial));
  }
  /**
   * Pre-compiles the equirectangular shader. You can get faster start-up by invoking this method during
   * your texture's network fetch for increased concurrency.
   */
  compileEquirectangularShader() {
    this._equirectMaterial === null && (this._equirectMaterial = fa(), this._compileMaterial(this._equirectMaterial));
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
    this._renderer.setRenderTarget($s, Js, Qs), this._renderer.xr.enabled = er, e.scissorTest = !1, Ki(e, 0, 0, e.width, e.height);
  }
  _fromTexture(e, t) {
    e.mapping === 301 || e.mapping === 302 ? this._setSize(e.image.length === 0 ? 16 : e.image[0].width || e.image[0].image.width) : this._setSize(e.image.width / 4), $s = this._renderer.getRenderTarget(), Js = this._renderer.getActiveCubeFace(), Qs = this._renderer.getActiveMipmapLevel(), er = this._renderer.xr.enabled, this._renderer.xr.enabled = !1;
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
      colorSpace: xt,
      depthBuffer: !1
    }, i = da(e, t, n);
    if (this._pingPongRenderTarget === null || this._pingPongRenderTarget.width !== e || this._pingPongRenderTarget.height !== t) {
      this._pingPongRenderTarget !== null && this._dispose(), this._pingPongRenderTarget = da(e, t, n);
      const { _lodMax: r } = this;
      ({ sizeLods: this._sizeLods, lodPlanes: this._lodPlanes, sigmas: this._sigmas } = Mu(r)), this._blurMaterial = Su(r, e, t);
    }
    return i;
  }
  _compileMaterial(e) {
    const t = new Qe(this._lodPlanes[0], e);
    this._renderer.compile(t, Zs);
  }
  _sceneToCubeUV(e, t, n, i) {
    const o = new Rt(90, 1, t, n), c = [1, -1, 1, 1, 1, 1], l = [1, 1, 1, -1, -1, -1], h = this._renderer, u = h.autoClear, d = h.toneMapping;
    h.getClearColor(la), h.toneMapping = 0, h.autoClear = !1;
    const f = new jt({
      name: "PMREM.Background",
      side: 1,
      depthWrite: !1,
      depthTest: !1
    }), g = new Qe(new Wt(), f);
    let _ = !1;
    const p = e.background;
    p ? p.isColor && (f.color.copy(p), e.background = null, _ = !0) : (f.color.copy(la), _ = !0);
    for (let m = 0; m < 6; m++) {
      const T = m % 3;
      T === 0 ? (o.up.set(0, c[m], 0), o.lookAt(l[m], 0, 0)) : T === 1 ? (o.up.set(0, 0, c[m]), o.lookAt(0, l[m], 0)) : (o.up.set(0, c[m], 0), o.lookAt(0, 0, l[m]));
      const y = this._cubeSize;
      Ki(i, T * y, m > 2 ? y : 0, y, y), h.setRenderTarget(i), _ && h.render(g, o), h.render(e, o);
    }
    g.geometry.dispose(), g.material.dispose(), h.toneMapping = d, h.autoClear = u, e.background = p;
  }
  _textureToCubeUV(e, t) {
    const n = this._renderer, i = e.mapping === 301 || e.mapping === 302;
    i ? (this._cubemapMaterial === null && (this._cubemapMaterial = pa()), this._cubemapMaterial.uniforms.flipEnvMap.value = e.isRenderTargetTexture === !1 ? -1 : 1) : this._equirectMaterial === null && (this._equirectMaterial = fa());
    const r = i ? this._cubemapMaterial : this._equirectMaterial, a = new Qe(this._lodPlanes[0], r), o = r.uniforms;
    o.envMap.value = e;
    const c = this._cubeSize;
    Ki(t, 0, 0, 3 * c, 2 * c), n.setRenderTarget(t), n.render(a, Zs);
  }
  _applyPMREM(e) {
    const t = this._renderer, n = t.autoClear;
    t.autoClear = !1;
    const i = this._lodPlanes.length;
    for (let r = 1; r < i; r++) {
      const a = Math.sqrt(this._sigmas[r] * this._sigmas[r] - this._sigmas[r - 1] * this._sigmas[r - 1]), o = ha[(i - r - 1) % ha.length];
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
    const h = 3, u = new Qe(this._lodPlanes[i], l), d = l.uniforms, f = this._sizeLods[n] - 1, g = isFinite(r) ? Math.PI / (2 * f) : 2 * Math.PI / (2 * Dn - 1), _ = r / g, p = isFinite(r) ? 1 + Math.floor(h * _) : Dn;
    p > Dn && console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${Dn}`);
    const m = [];
    let T = 0;
    for (let R = 0; R < Dn; ++R) {
      const N = R / _, K = Math.exp(-N * N / 2);
      m.push(K), R === 0 ? T += K : R < p && (T += 2 * K);
    }
    for (let R = 0; R < m.length; R++)
      m[R] = m[R] / T;
    d.envMap.value = e.texture, d.samples.value = p, d.weights.value = m, d.latitudinal.value = a === "latitudinal", o && (d.poleAxis.value = o);
    const { _lodMax: y } = this;
    d.dTheta.value = g, d.mipInt.value = y - n;
    const A = this._sizeLods[i], L = 3 * A * (i > y - $n ? i - y + $n : 0), w = 4 * (this._cubeSize - A);
    Ki(t, L, w, 3 * A, 2 * A), c.setRenderTarget(t), c.render(u, Zs);
  }
}
function Mu(s) {
  const e = [], t = [], n = [];
  let i = s;
  const r = s - $n + 1 + ca.length;
  for (let a = 0; a < r; a++) {
    const o = Math.pow(2, i);
    t.push(o);
    let c = 1 / o;
    a > s - $n ? c = ca[a - s + $n - 1] : a === 0 && (c = 0), n.push(c);
    const l = 1 / (o - 2), h = -l, u = 1 + l, d = [h, h, u, h, u, u, h, h, u, u, h, u], f = 6, g = 6, _ = 3, p = 2, m = 1, T = new Float32Array(_ * g * f), y = new Float32Array(p * g * f), A = new Float32Array(m * g * f);
    for (let w = 0; w < f; w++) {
      const R = w % 3 * 2 / 3 - 1, N = w > 2 ? 0 : -1, K = [
        R,
        N,
        0,
        R + 2 / 3,
        N,
        0,
        R + 2 / 3,
        N + 1,
        0,
        R,
        N,
        0,
        R + 2 / 3,
        N + 1,
        0,
        R,
        N + 1,
        0
      ];
      T.set(K, _ * g * w), y.set(d, p * g * w);
      const x = [w, w, w, w, w, w];
      A.set(x, m * g * w);
    }
    const L = new vt();
    L.setAttribute("position", new At(T, _)), L.setAttribute("uv", new At(y, p)), L.setAttribute("faceIndex", new At(A, m)), e.push(L), i > $n && i--;
  }
  return { lodPlanes: e, sizeLods: t, sigmas: n };
}
function da(s, e, t) {
  const n = new Nn(s, e, t);
  return n.texture.mapping = 306, n.texture.name = "PMREM.cubeUv", n.scissorTest = !0, n;
}
function Ki(s, e, t, n, i) {
  s.viewport.set(e, t, n, i), s.scissor.set(e, t, n, i);
}
function Su(s, e, t) {
  const n = new Float32Array(Dn), i = new C(0, 1, 0);
  return new Sn({
    name: "SphericalGaussianBlur",
    defines: {
      n: Dn,
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
    vertexShader: Ar(),
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
function fa() {
  return new Sn({
    name: "EquirectangularToCubeUV",
    uniforms: {
      envMap: { value: null }
    },
    vertexShader: Ar(),
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
function pa() {
  return new Sn({
    name: "CubemapToCubeUV",
    uniforms: {
      envMap: { value: null },
      flipEnvMap: { value: -1 }
    },
    vertexShader: Ar(),
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
function Ar() {
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
function yu(s) {
  let e = /* @__PURE__ */ new WeakMap(), t = null;
  function n(o) {
    if (o && o.isTexture) {
      const c = o.mapping, l = c === 303 || c === 304, h = c === 301 || c === 302;
      if (l || h) {
        let u = e.get(o);
        const d = u !== void 0 ? u.texture.pmremVersion : 0;
        if (o.isRenderTargetTexture && o.pmremVersion !== d)
          return t === null && (t = new ua(s)), u = l ? t.fromEquirectangular(o, u) : t.fromCubemap(o, u), u.texture.pmremVersion = o.pmremVersion, e.set(o, u), u.texture;
        if (u !== void 0)
          return u.texture;
        {
          const f = o.image;
          return l && f && f.height > 0 || h && f && i(f) ? (t === null && (t = new ua(s)), u = l ? t.fromEquirectangular(o) : t.fromCubemap(o), u.texture.pmremVersion = o.pmremVersion, e.set(o, u), o.addEventListener("dispose", r), u.texture) : null;
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
function Eu(s) {
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
      return i === null && cs("THREE.WebGLRenderer: " + n + " extension not supported."), i;
    }
  };
}
function Tu(s, e, t, n) {
  const i = {}, r = /* @__PURE__ */ new WeakMap();
  function a(u) {
    const d = u.target;
    d.index !== null && e.remove(d.index);
    for (const g in d.attributes)
      e.remove(d.attributes[g]);
    for (const g in d.morphAttributes) {
      const _ = d.morphAttributes[g];
      for (let p = 0, m = _.length; p < m; p++)
        e.remove(_[p]);
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
      for (let p = 0, m = _.length; p < m; p++)
        e.update(_[p], s.ARRAY_BUFFER);
    }
  }
  function l(u) {
    const d = [], f = u.index, g = u.attributes.position;
    let _ = 0;
    if (f !== null) {
      const T = f.array;
      _ = f.version;
      for (let y = 0, A = T.length; y < A; y += 3) {
        const L = T[y + 0], w = T[y + 1], R = T[y + 2];
        d.push(L, w, w, R, R, L);
      }
    } else if (g !== void 0) {
      const T = g.array;
      _ = g.version;
      for (let y = 0, A = T.length / 3 - 1; y < A; y += 3) {
        const L = y + 0, w = y + 1, R = y + 2;
        d.push(L, w, w, R, R, L);
      }
    } else
      return;
    const p = new (ao(d) ? fo : uo)(d, 1);
    p.version = _;
    const m = r.get(u);
    m && e.remove(m), r.set(u, p);
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
function Au(s, e, t) {
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
    let p = 0;
    for (let m = 0; m < g; m++)
      p += f[m];
    t.update(p, n, 1);
  }
  function u(d, f, g, _) {
    if (g === 0) return;
    const p = e.get("WEBGL_multi_draw");
    if (p === null)
      for (let m = 0; m < d.length; m++)
        l(d[m] / a, f[m], _[m]);
    else {
      p.multiDrawElementsInstancedWEBGL(n, f, 0, r, d, 0, _, 0, g);
      let m = 0;
      for (let T = 0; T < g; T++)
        m += f[T];
      for (let T = 0; T < _.length; T++)
        t.update(m, n, _[T]);
    }
  }
  this.setMode = i, this.setIndex = o, this.render = c, this.renderInstances = l, this.renderMultiDraw = h, this.renderMultiDrawInstances = u;
}
function bu(s) {
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
function wu(s, e, t) {
  const n = /* @__PURE__ */ new WeakMap(), i = new Ye();
  function r(a, o, c) {
    const l = a.morphTargetInfluences, h = o.morphAttributes.position || o.morphAttributes.normal || o.morphAttributes.color, u = h !== void 0 ? h.length : 0;
    let d = n.get(o);
    if (d === void 0 || d.count !== u) {
      let K = function() {
        R.dispose(), n.delete(o), o.removeEventListener("dispose", K);
      };
      d !== void 0 && d.texture.dispose();
      const f = o.morphAttributes.position !== void 0, g = o.morphAttributes.normal !== void 0, _ = o.morphAttributes.color !== void 0, p = o.morphAttributes.position || [], m = o.morphAttributes.normal || [], T = o.morphAttributes.color || [];
      let y = 0;
      f === !0 && (y = 1), g === !0 && (y = 2), _ === !0 && (y = 3);
      let A = o.attributes.position.count * y, L = 1;
      A > e.maxTextureSize && (L = Math.ceil(A / e.maxTextureSize), A = e.maxTextureSize);
      const w = new Float32Array(A * L * 4 * u), R = new co(w, A, L, u);
      R.type = 1015, R.needsUpdate = !0;
      const N = y * 4;
      for (let x = 0; x < u; x++) {
        const E = p[x], B = m[x], O = T[x], U = A * L * 4 * x;
        for (let Q = 0; Q < E.count; Q++) {
          const k = Q * N;
          f === !0 && (i.fromBufferAttribute(E, Q), w[U + k + 0] = i.x, w[U + k + 1] = i.y, w[U + k + 2] = i.z, w[U + k + 3] = 0), g === !0 && (i.fromBufferAttribute(B, Q), w[U + k + 4] = i.x, w[U + k + 5] = i.y, w[U + k + 6] = i.z, w[U + k + 7] = 0), _ === !0 && (i.fromBufferAttribute(O, Q), w[U + k + 8] = i.x, w[U + k + 9] = i.y, w[U + k + 10] = i.z, w[U + k + 11] = O.itemSize === 4 ? i.w : 1);
        }
      }
      d = {
        count: u,
        texture: R,
        size: new Be(A, L)
      }, n.set(o, d), o.addEventListener("dispose", K);
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
function Ru(s, e, t, n) {
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
class xo extends gt {
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
const vo = /* @__PURE__ */ new gt(), ma = /* @__PURE__ */ new xo(1, 1), Mo = /* @__PURE__ */ new co(), So = /* @__PURE__ */ new pc(), yo = /* @__PURE__ */ new go(), ga = [], _a = [], xa = new Float32Array(16), va = new Float32Array(9), Ma = new Float32Array(4);
function hi(s, e, t) {
  const n = s[0];
  if (n <= 0 || n > 0) return s;
  const i = e * t;
  let r = ga[i];
  if (r === void 0 && (r = new Float32Array(i), ga[i] = r), e !== 0) {
    n.toArray(r, 0);
    for (let a = 1, o = 0; a !== e; ++a)
      o += t, s[a].toArray(r, o);
  }
  return r;
}
function dt(s, e) {
  if (s.length !== e.length) return !1;
  for (let t = 0, n = s.length; t < n; t++)
    if (s[t] !== e[t]) return !1;
  return !0;
}
function ft(s, e) {
  for (let t = 0, n = e.length; t < n; t++)
    s[t] = e[t];
}
function Ss(s, e) {
  let t = _a[e];
  t === void 0 && (t = new Int32Array(e), _a[e] = t);
  for (let n = 0; n !== e; ++n)
    t[n] = s.allocateTextureUnit();
  return t;
}
function Cu(s, e) {
  const t = this.cache;
  t[0] !== e && (s.uniform1f(this.addr, e), t[0] = e);
}
function Iu(s, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y) && (s.uniform2f(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);
  else {
    if (dt(t, e)) return;
    s.uniform2fv(this.addr, e), ft(t, e);
  }
}
function Pu(s, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (s.uniform3f(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);
  else if (e.r !== void 0)
    (t[0] !== e.r || t[1] !== e.g || t[2] !== e.b) && (s.uniform3f(this.addr, e.r, e.g, e.b), t[0] = e.r, t[1] = e.g, t[2] = e.b);
  else {
    if (dt(t, e)) return;
    s.uniform3fv(this.addr, e), ft(t, e);
  }
}
function Lu(s, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (s.uniform4f(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);
  else {
    if (dt(t, e)) return;
    s.uniform4fv(this.addr, e), ft(t, e);
  }
}
function Du(s, e) {
  const t = this.cache, n = e.elements;
  if (n === void 0) {
    if (dt(t, e)) return;
    s.uniformMatrix2fv(this.addr, !1, e), ft(t, e);
  } else {
    if (dt(t, n)) return;
    Ma.set(n), s.uniformMatrix2fv(this.addr, !1, Ma), ft(t, n);
  }
}
function Nu(s, e) {
  const t = this.cache, n = e.elements;
  if (n === void 0) {
    if (dt(t, e)) return;
    s.uniformMatrix3fv(this.addr, !1, e), ft(t, e);
  } else {
    if (dt(t, n)) return;
    va.set(n), s.uniformMatrix3fv(this.addr, !1, va), ft(t, n);
  }
}
function Uu(s, e) {
  const t = this.cache, n = e.elements;
  if (n === void 0) {
    if (dt(t, e)) return;
    s.uniformMatrix4fv(this.addr, !1, e), ft(t, e);
  } else {
    if (dt(t, n)) return;
    xa.set(n), s.uniformMatrix4fv(this.addr, !1, xa), ft(t, n);
  }
}
function Fu(s, e) {
  const t = this.cache;
  t[0] !== e && (s.uniform1i(this.addr, e), t[0] = e);
}
function Bu(s, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y) && (s.uniform2i(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);
  else {
    if (dt(t, e)) return;
    s.uniform2iv(this.addr, e), ft(t, e);
  }
}
function Ou(s, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (s.uniform3i(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);
  else {
    if (dt(t, e)) return;
    s.uniform3iv(this.addr, e), ft(t, e);
  }
}
function Gu(s, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (s.uniform4i(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);
  else {
    if (dt(t, e)) return;
    s.uniform4iv(this.addr, e), ft(t, e);
  }
}
function zu(s, e) {
  const t = this.cache;
  t[0] !== e && (s.uniform1ui(this.addr, e), t[0] = e);
}
function ku(s, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y) && (s.uniform2ui(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);
  else {
    if (dt(t, e)) return;
    s.uniform2uiv(this.addr, e), ft(t, e);
  }
}
function Vu(s, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (s.uniform3ui(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);
  else {
    if (dt(t, e)) return;
    s.uniform3uiv(this.addr, e), ft(t, e);
  }
}
function Hu(s, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (s.uniform4ui(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);
  else {
    if (dt(t, e)) return;
    s.uniform4uiv(this.addr, e), ft(t, e);
  }
}
function Wu(s, e, t) {
  const n = this.cache, i = t.allocateTextureUnit();
  n[0] !== i && (s.uniform1i(this.addr, i), n[0] = i);
  let r;
  this.type === s.SAMPLER_2D_SHADOW ? (ma.compareFunction = 515, r = ma) : r = vo, t.setTexture2D(e || r, i);
}
function Xu(s, e, t) {
  const n = this.cache, i = t.allocateTextureUnit();
  n[0] !== i && (s.uniform1i(this.addr, i), n[0] = i), t.setTexture3D(e || So, i);
}
function qu(s, e, t) {
  const n = this.cache, i = t.allocateTextureUnit();
  n[0] !== i && (s.uniform1i(this.addr, i), n[0] = i), t.setTextureCube(e || yo, i);
}
function ju(s, e, t) {
  const n = this.cache, i = t.allocateTextureUnit();
  n[0] !== i && (s.uniform1i(this.addr, i), n[0] = i), t.setTexture2DArray(e || Mo, i);
}
function Yu(s) {
  switch (s) {
    case 5126:
      return Cu;
    case 35664:
      return Iu;
    case 35665:
      return Pu;
    case 35666:
      return Lu;
    case 35674:
      return Du;
    case 35675:
      return Nu;
    case 35676:
      return Uu;
    case 5124:
    case 35670:
      return Fu;
    case 35667:
    case 35671:
      return Bu;
    case 35668:
    case 35672:
      return Ou;
    case 35669:
    case 35673:
      return Gu;
    case 5125:
      return zu;
    case 36294:
      return ku;
    case 36295:
      return Vu;
    case 36296:
      return Hu;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return Wu;
    case 35679:
    case 36299:
    case 36307:
      return Xu;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return qu;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return ju;
  }
}
function Ku(s, e) {
  s.uniform1fv(this.addr, e);
}
function Zu(s, e) {
  const t = hi(e, this.size, 2);
  s.uniform2fv(this.addr, t);
}
function $u(s, e) {
  const t = hi(e, this.size, 3);
  s.uniform3fv(this.addr, t);
}
function Ju(s, e) {
  const t = hi(e, this.size, 4);
  s.uniform4fv(this.addr, t);
}
function Qu(s, e) {
  const t = hi(e, this.size, 4);
  s.uniformMatrix2fv(this.addr, !1, t);
}
function ed(s, e) {
  const t = hi(e, this.size, 9);
  s.uniformMatrix3fv(this.addr, !1, t);
}
function td(s, e) {
  const t = hi(e, this.size, 16);
  s.uniformMatrix4fv(this.addr, !1, t);
}
function nd(s, e) {
  s.uniform1iv(this.addr, e);
}
function id(s, e) {
  s.uniform2iv(this.addr, e);
}
function sd(s, e) {
  s.uniform3iv(this.addr, e);
}
function rd(s, e) {
  s.uniform4iv(this.addr, e);
}
function ad(s, e) {
  s.uniform1uiv(this.addr, e);
}
function od(s, e) {
  s.uniform2uiv(this.addr, e);
}
function cd(s, e) {
  s.uniform3uiv(this.addr, e);
}
function ld(s, e) {
  s.uniform4uiv(this.addr, e);
}
function hd(s, e, t) {
  const n = this.cache, i = e.length, r = Ss(t, i);
  dt(n, r) || (s.uniform1iv(this.addr, r), ft(n, r));
  for (let a = 0; a !== i; ++a)
    t.setTexture2D(e[a] || vo, r[a]);
}
function ud(s, e, t) {
  const n = this.cache, i = e.length, r = Ss(t, i);
  dt(n, r) || (s.uniform1iv(this.addr, r), ft(n, r));
  for (let a = 0; a !== i; ++a)
    t.setTexture3D(e[a] || So, r[a]);
}
function dd(s, e, t) {
  const n = this.cache, i = e.length, r = Ss(t, i);
  dt(n, r) || (s.uniform1iv(this.addr, r), ft(n, r));
  for (let a = 0; a !== i; ++a)
    t.setTextureCube(e[a] || yo, r[a]);
}
function fd(s, e, t) {
  const n = this.cache, i = e.length, r = Ss(t, i);
  dt(n, r) || (s.uniform1iv(this.addr, r), ft(n, r));
  for (let a = 0; a !== i; ++a)
    t.setTexture2DArray(e[a] || Mo, r[a]);
}
function pd(s) {
  switch (s) {
    case 5126:
      return Ku;
    case 35664:
      return Zu;
    case 35665:
      return $u;
    case 35666:
      return Ju;
    case 35674:
      return Qu;
    case 35675:
      return ed;
    case 35676:
      return td;
    case 5124:
    case 35670:
      return nd;
    case 35667:
    case 35671:
      return id;
    case 35668:
    case 35672:
      return sd;
    case 35669:
    case 35673:
      return rd;
    case 5125:
      return ad;
    case 36294:
      return od;
    case 36295:
      return cd;
    case 36296:
      return ld;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return hd;
    case 35679:
    case 36299:
    case 36307:
      return ud;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return dd;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return fd;
  }
}
class md {
  constructor(e, t, n) {
    this.id = e, this.addr = n, this.cache = [], this.type = t.type, this.setValue = Yu(t.type);
  }
}
class gd {
  constructor(e, t, n) {
    this.id = e, this.addr = n, this.cache = [], this.type = t.type, this.size = t.size, this.setValue = pd(t.type);
  }
}
class _d {
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
const tr = /(\w+)(\])?(\[|\.)?/g;
function Sa(s, e) {
  s.seq.push(e), s.map[e.id] = e;
}
function xd(s, e, t) {
  const n = s.name, i = n.length;
  for (tr.lastIndex = 0; ; ) {
    const r = tr.exec(n), a = tr.lastIndex;
    let o = r[1];
    const c = r[2] === "]", l = r[3];
    if (c && (o = o | 0), l === void 0 || l === "[" && a + 2 === i) {
      Sa(t, l === void 0 ? new md(o, s, e) : new gd(o, s, e));
      break;
    } else {
      let u = t.map[o];
      u === void 0 && (u = new _d(o), Sa(t, u)), t = u;
    }
  }
}
class ls {
  constructor(e, t) {
    this.seq = [], this.map = {};
    const n = e.getProgramParameter(t, e.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; ++i) {
      const r = e.getActiveUniform(t, i), a = e.getUniformLocation(t, r.name);
      xd(r, a, this);
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
function ya(s, e, t) {
  const n = s.createShader(e);
  return s.shaderSource(n, t), s.compileShader(n), n;
}
const vd = 37297;
let Md = 0;
function Sd(s, e) {
  const t = s.split(`
`), n = [], i = Math.max(e - 6, 0), r = Math.min(e + 6, t.length);
  for (let a = i; a < r; a++) {
    const o = a + 1;
    n.push(`${o === e ? ">" : " "} ${o}: ${t[a]}`);
  }
  return n.join(`
`);
}
function yd(s) {
  const e = Ve.getPrimaries(Ve.workingColorSpace), t = Ve.getPrimaries(s);
  let n;
  switch (e === t ? n = "" : e === fs && t === ds ? n = "LinearDisplayP3ToLinearSRGB" : e === ds && t === fs && (n = "LinearSRGBToLinearDisplayP3"), s) {
    case xt:
    case xs:
      return [n, "LinearTransferOETF"];
    case lt:
    case yr:
      return [n, "sRGBTransferOETF"];
    default:
      return console.warn("THREE.WebGLProgram: Unsupported color space:", s), [n, "LinearTransferOETF"];
  }
}
function Ea(s, e, t) {
  const n = s.getShaderParameter(e, s.COMPILE_STATUS), i = s.getShaderInfoLog(e).trim();
  if (n && i === "") return "";
  const r = /ERROR: 0:(\d+)/.exec(i);
  if (r) {
    const a = parseInt(r[1]);
    return t.toUpperCase() + `

` + i + `

` + Sd(s.getShaderSource(e), a);
  } else
    return i;
}
function Ed(s, e) {
  const t = yd(e);
  return `vec4 ${s}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`;
}
function Td(s, e) {
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
const Zi = /* @__PURE__ */ new C();
function Ad() {
  Ve.getLuminanceCoefficients(Zi);
  const s = Zi.x.toFixed(4), e = Zi.y.toFixed(4), t = Zi.z.toFixed(4);
  return [
    "float luminance( const in vec3 rgb ) {",
    `	const vec3 weights = vec3( ${s}, ${e}, ${t} );`,
    "	return dot( weights, rgb );",
    "}"
  ].join(`
`);
}
function bd(s) {
  return [
    s.extensionClipCullDistance ? "#extension GL_ANGLE_clip_cull_distance : require" : "",
    s.extensionMultiDraw ? "#extension GL_ANGLE_multi_draw : require" : ""
  ].filter(Ti).join(`
`);
}
function wd(s) {
  const e = [];
  for (const t in s) {
    const n = s[t];
    n !== !1 && e.push("#define " + t + " " + n);
  }
  return e.join(`
`);
}
function Rd(s, e) {
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
function Ti(s) {
  return s !== "";
}
function Ta(s, e) {
  const t = e.numSpotLightShadows + e.numSpotLightMaps - e.numSpotLightShadowsWithMaps;
  return s.replace(/NUM_DIR_LIGHTS/g, e.numDirLights).replace(/NUM_SPOT_LIGHTS/g, e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g, e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g, t).replace(/NUM_RECT_AREA_LIGHTS/g, e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g, e.numPointLights).replace(/NUM_HEMI_LIGHTS/g, e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g, e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g, e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g, e.numPointLightShadows);
}
function Aa(s, e) {
  return s.replace(/NUM_CLIPPING_PLANES/g, e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g, e.numClippingPlanes - e.numClipIntersection);
}
const Cd = /^[ \t]*#include +<([\w\d./]+)>/gm;
function mr(s) {
  return s.replace(Cd, Pd);
}
const Id = /* @__PURE__ */ new Map();
function Pd(s, e) {
  let t = Ue[e];
  if (t === void 0) {
    const n = Id.get(e);
    if (n !== void 0)
      t = Ue[n], console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.', e, n);
    else
      throw new Error("Can not resolve #include <" + e + ">");
  }
  return mr(t);
}
const Ld = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
function ba(s) {
  return s.replace(Ld, Dd);
}
function Dd(s, e, t, n) {
  let i = "";
  for (let r = parseInt(e); r < parseInt(t); r++)
    i += n.replace(/\[\s*i\s*\]/g, "[ " + r + " ]").replace(/UNROLLED_LOOP_INDEX/g, r);
  return i;
}
function wa(s) {
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
function Nd(s) {
  let e = "SHADOWMAP_TYPE_BASIC";
  return s.shadowMapType === 1 ? e = "SHADOWMAP_TYPE_PCF" : s.shadowMapType === 2 ? e = "SHADOWMAP_TYPE_PCF_SOFT" : s.shadowMapType === 3 && (e = "SHADOWMAP_TYPE_VSM"), e;
}
function Ud(s) {
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
function Fd(s) {
  let e = "ENVMAP_MODE_REFLECTION";
  if (s.envMap)
    switch (s.envMapMode) {
      case 302:
        e = "ENVMAP_MODE_REFRACTION";
        break;
    }
  return e;
}
function Bd(s) {
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
function Od(s) {
  const e = s.envMapCubeUVHeight;
  if (e === null) return null;
  const t = Math.log2(e) - 2, n = 1 / e;
  return { texelWidth: 1 / (3 * Math.max(Math.pow(2, t), 7 * 16)), texelHeight: n, maxMip: t };
}
function Gd(s, e, t, n) {
  const i = s.getContext(), r = t.defines;
  let a = t.vertexShader, o = t.fragmentShader;
  const c = Nd(t), l = Ud(t), h = Fd(t), u = Bd(t), d = Od(t), f = bd(t), g = wd(r), _ = i.createProgram();
  let p, m, T = t.glslVersion ? "#version " + t.glslVersion + `
` : "";
  t.isRawShaderMaterial ? (p = [
    "#define SHADER_TYPE " + t.shaderType,
    "#define SHADER_NAME " + t.shaderName,
    g
  ].filter(Ti).join(`
`), p.length > 0 && (p += `
`), m = [
    "#define SHADER_TYPE " + t.shaderType,
    "#define SHADER_NAME " + t.shaderName,
    g
  ].filter(Ti).join(`
`), m.length > 0 && (m += `
`)) : (p = [
    wa(t),
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
  ].filter(Ti).join(`
`), m = [
    wa(t),
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
    t.toneMapping !== 0 ? Ue.tonemapping_pars_fragment : "",
    // this code is required here because it is used by the toneMapping() function defined below
    t.toneMapping !== 0 ? Td("toneMapping", t.toneMapping) : "",
    t.dithering ? "#define DITHERING" : "",
    t.opaque ? "#define OPAQUE" : "",
    Ue.colorspace_pars_fragment,
    // this code is required here because it is used by the various encoding/decoding function defined below
    Ed("linearToOutputTexel", t.outputColorSpace),
    Ad(),
    t.useDepthPacking ? "#define DEPTH_PACKING " + t.depthPacking : "",
    `
`
  ].filter(Ti).join(`
`)), a = mr(a), a = Ta(a, t), a = Aa(a, t), o = mr(o), o = Ta(o, t), o = Aa(o, t), a = ba(a), o = ba(o), t.isRawShaderMaterial !== !0 && (T = `#version 300 es
`, p = [
    f,
    "#define attribute in",
    "#define varying out",
    "#define texture2D texture"
  ].join(`
`) + `
` + p, m = [
    "#define varying in",
    t.glslVersion === Hr ? "" : "layout(location = 0) out highp vec4 pc_fragColor;",
    t.glslVersion === Hr ? "" : "#define gl_FragColor pc_fragColor",
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
` + m);
  const y = T + p + a, A = T + m + o, L = ya(i, i.VERTEX_SHADER, y), w = ya(i, i.FRAGMENT_SHADER, A);
  i.attachShader(_, L), i.attachShader(_, w), t.index0AttributeName !== void 0 ? i.bindAttribLocation(_, 0, t.index0AttributeName) : t.morphTargets === !0 && i.bindAttribLocation(_, 0, "position"), i.linkProgram(_);
  function R(E) {
    if (s.debug.checkShaderErrors) {
      const B = i.getProgramInfoLog(_).trim(), O = i.getShaderInfoLog(L).trim(), U = i.getShaderInfoLog(w).trim();
      let Q = !0, k = !0;
      if (i.getProgramParameter(_, i.LINK_STATUS) === !1)
        if (Q = !1, typeof s.debug.onShaderError == "function")
          s.debug.onShaderError(i, _, L, w);
        else {
          const ne = Ea(i, L, "vertex"), W = Ea(i, w, "fragment");
          console.error(
            "THREE.WebGLProgram: Shader Error " + i.getError() + " - VALIDATE_STATUS " + i.getProgramParameter(_, i.VALIDATE_STATUS) + `

Material Name: ` + E.name + `
Material Type: ` + E.type + `

Program Info Log: ` + B + `
` + ne + `
` + W
          );
        }
      else B !== "" ? console.warn("THREE.WebGLProgram: Program Info Log:", B) : (O === "" || U === "") && (k = !1);
      k && (E.diagnostics = {
        runnable: Q,
        programLog: B,
        vertexShader: {
          log: O,
          prefix: p
        },
        fragmentShader: {
          log: U,
          prefix: m
        }
      });
    }
    i.deleteShader(L), i.deleteShader(w), N = new ls(i, _), K = Rd(i, _);
  }
  let N;
  this.getUniforms = function() {
    return N === void 0 && R(this), N;
  };
  let K;
  this.getAttributes = function() {
    return K === void 0 && R(this), K;
  };
  let x = t.rendererExtensionParallelShaderCompile === !1;
  return this.isReady = function() {
    return x === !1 && (x = i.getProgramParameter(_, vd)), x;
  }, this.destroy = function() {
    n.releaseStatesOfProgram(this), i.deleteProgram(_), this.program = void 0;
  }, this.type = t.shaderType, this.name = t.shaderName, this.id = Md++, this.cacheKey = e, this.usedTimes = 1, this.program = _, this.vertexShader = L, this.fragmentShader = w, this;
}
let zd = 0;
class kd {
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
    return n === void 0 && (n = new Vd(e), t.set(e, n)), n;
  }
}
class Vd {
  constructor(e) {
    this.id = zd++, this.code = e, this.usedTimes = 0;
  }
}
function Hd(s, e, t, n, i, r, a) {
  const o = new lo(), c = new kd(), l = /* @__PURE__ */ new Set(), h = [], u = i.logarithmicDepthBuffer, d = i.reverseDepthBuffer, f = i.vertexTextures;
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
  function p(x) {
    return l.add(x), x === 0 ? "uv" : `uv${x}`;
  }
  function m(x, E, B, O, U) {
    const Q = O.fog, k = U.geometry, ne = x.isMeshStandardMaterial ? O.environment : null, W = (x.isMeshStandardMaterial ? t : e).get(x.envMap || ne), oe = W && W.mapping === 306 ? W.image.height : null, he = _[x.type];
    x.precision !== null && (g = i.getMaxPrecision(x.precision), g !== x.precision && console.warn("THREE.WebGLProgram.getParameters:", x.precision, "not supported, using", g, "instead."));
    const ve = k.morphAttributes.position || k.morphAttributes.normal || k.morphAttributes.color, ke = ve !== void 0 ? ve.length : 0;
    let We = 0;
    k.morphAttributes.position !== void 0 && (We = 1), k.morphAttributes.normal !== void 0 && (We = 2), k.morphAttributes.color !== void 0 && (We = 3);
    let X, te, ge, fe;
    if (he) {
      const wt = Jt[he];
      X = wt.vertexShader, te = wt.fragmentShader;
    } else
      X = x.vertexShader, te = x.fragmentShader, c.update(x), ge = c.getVertexShaderID(x), fe = c.getFragmentShaderID(x);
    const Ce = s.getRenderTarget(), we = U.isInstancedMesh === !0, Oe = U.isBatchedMesh === !0, Ke = !!x.map, ze = !!x.matcap, M = !!W, J = !!x.aoMap, q = !!x.lightMap, Z = !!x.bumpMap, j = !!x.normalMap, Ae = !!x.displacementMap, pe = !!x.emissiveMap, b = !!x.metalnessMap, v = !!x.roughnessMap, F = x.anisotropy > 0, V = x.clearcoat > 0, ee = x.dispersion > 0, Y = x.iridescence > 0, ye = x.sheen > 0, ae = x.transmission > 0, me = F && !!x.anisotropyMap, qe = V && !!x.clearcoatMap, ie = V && !!x.clearcoatNormalMap, _e = V && !!x.clearcoatRoughnessMap, Pe = Y && !!x.iridescenceMap, Le = Y && !!x.iridescenceThicknessMap, xe = ye && !!x.sheenColorMap, He = ye && !!x.sheenRoughnessMap, De = !!x.specularMap, it = !!x.specularColorMap, I = !!x.specularIntensityMap, ue = ae && !!x.transmissionMap, H = ae && !!x.thicknessMap, $ = !!x.gradientMap, ce = !!x.alphaMap, de = x.alphaTest > 0, Xe = !!x.alphaHash, ht = !!x.extensions;
    let bt = 0;
    x.toneMapped && (Ce === null || Ce.isXRRenderTarget === !0) && (bt = s.toneMapping);
    const je = {
      shaderID: he,
      shaderType: x.type,
      shaderName: x.name,
      vertexShader: X,
      fragmentShader: te,
      defines: x.defines,
      customVertexShaderID: ge,
      customFragmentShaderID: fe,
      isRawShaderMaterial: x.isRawShaderMaterial === !0,
      glslVersion: x.glslVersion,
      precision: g,
      batching: Oe,
      batchingColor: Oe && U._colorsTexture !== null,
      instancing: we,
      instancingColor: we && U.instanceColor !== null,
      instancingMorph: we && U.morphTexture !== null,
      supportsVertexTextures: f,
      outputColorSpace: Ce === null ? s.outputColorSpace : Ce.isXRRenderTarget === !0 ? Ce.texture.colorSpace : xt,
      alphaToCoverage: !!x.alphaToCoverage,
      map: Ke,
      matcap: ze,
      envMap: M,
      envMapMode: M && W.mapping,
      envMapCubeUVHeight: oe,
      aoMap: J,
      lightMap: q,
      bumpMap: Z,
      normalMap: j,
      displacementMap: f && Ae,
      emissiveMap: pe,
      normalMapObjectSpace: j && x.normalMapType === 1,
      normalMapTangentSpace: j && x.normalMapType === 0,
      metalnessMap: b,
      roughnessMap: v,
      anisotropy: F,
      anisotropyMap: me,
      clearcoat: V,
      clearcoatMap: qe,
      clearcoatNormalMap: ie,
      clearcoatRoughnessMap: _e,
      dispersion: ee,
      iridescence: Y,
      iridescenceMap: Pe,
      iridescenceThicknessMap: Le,
      sheen: ye,
      sheenColorMap: xe,
      sheenRoughnessMap: He,
      specularMap: De,
      specularColorMap: it,
      specularIntensityMap: I,
      transmission: ae,
      transmissionMap: ue,
      thicknessMap: H,
      gradientMap: $,
      opaque: x.transparent === !1 && x.blending === 1 && x.alphaToCoverage === !1,
      alphaMap: ce,
      alphaTest: de,
      alphaHash: Xe,
      combine: x.combine,
      //
      mapUv: Ke && p(x.map.channel),
      aoMapUv: J && p(x.aoMap.channel),
      lightMapUv: q && p(x.lightMap.channel),
      bumpMapUv: Z && p(x.bumpMap.channel),
      normalMapUv: j && p(x.normalMap.channel),
      displacementMapUv: Ae && p(x.displacementMap.channel),
      emissiveMapUv: pe && p(x.emissiveMap.channel),
      metalnessMapUv: b && p(x.metalnessMap.channel),
      roughnessMapUv: v && p(x.roughnessMap.channel),
      anisotropyMapUv: me && p(x.anisotropyMap.channel),
      clearcoatMapUv: qe && p(x.clearcoatMap.channel),
      clearcoatNormalMapUv: ie && p(x.clearcoatNormalMap.channel),
      clearcoatRoughnessMapUv: _e && p(x.clearcoatRoughnessMap.channel),
      iridescenceMapUv: Pe && p(x.iridescenceMap.channel),
      iridescenceThicknessMapUv: Le && p(x.iridescenceThicknessMap.channel),
      sheenColorMapUv: xe && p(x.sheenColorMap.channel),
      sheenRoughnessMapUv: He && p(x.sheenRoughnessMap.channel),
      specularMapUv: De && p(x.specularMap.channel),
      specularColorMapUv: it && p(x.specularColorMap.channel),
      specularIntensityMapUv: I && p(x.specularIntensityMap.channel),
      transmissionMapUv: ue && p(x.transmissionMap.channel),
      thicknessMapUv: H && p(x.thicknessMap.channel),
      alphaMapUv: ce && p(x.alphaMap.channel),
      //
      vertexTangents: !!k.attributes.tangent && (j || F),
      vertexColors: x.vertexColors,
      vertexAlphas: x.vertexColors === !0 && !!k.attributes.color && k.attributes.color.itemSize === 4,
      pointsUvs: U.isPoints === !0 && !!k.attributes.uv && (Ke || ce),
      fog: !!Q,
      useFog: x.fog === !0,
      fogExp2: !!Q && Q.isFogExp2,
      flatShading: x.flatShading === !0,
      sizeAttenuation: x.sizeAttenuation === !0,
      logarithmicDepthBuffer: u,
      reverseDepthBuffer: d,
      skinning: U.isSkinnedMesh === !0,
      morphTargets: k.morphAttributes.position !== void 0,
      morphNormals: k.morphAttributes.normal !== void 0,
      morphColors: k.morphAttributes.color !== void 0,
      morphTargetsCount: ke,
      morphTextureStride: We,
      numDirLights: E.directional.length,
      numPointLights: E.point.length,
      numSpotLights: E.spot.length,
      numSpotLightMaps: E.spotLightMap.length,
      numRectAreaLights: E.rectArea.length,
      numHemiLights: E.hemi.length,
      numDirLightShadows: E.directionalShadowMap.length,
      numPointLightShadows: E.pointShadowMap.length,
      numSpotLightShadows: E.spotShadowMap.length,
      numSpotLightShadowsWithMaps: E.numSpotLightShadowsWithMaps,
      numLightProbes: E.numLightProbes,
      numClippingPlanes: a.numPlanes,
      numClipIntersection: a.numIntersection,
      dithering: x.dithering,
      shadowMapEnabled: s.shadowMap.enabled && B.length > 0,
      shadowMapType: s.shadowMap.type,
      toneMapping: bt,
      decodeVideoTexture: Ke && x.map.isVideoTexture === !0 && Ve.getTransfer(x.map.colorSpace) === rt,
      premultipliedAlpha: x.premultipliedAlpha,
      doubleSided: x.side === 2,
      flipSided: x.side === 1,
      useDepthPacking: x.depthPacking >= 0,
      depthPacking: x.depthPacking || 0,
      index0AttributeName: x.index0AttributeName,
      extensionClipCullDistance: ht && x.extensions.clipCullDistance === !0 && n.has("WEBGL_clip_cull_distance"),
      extensionMultiDraw: (ht && x.extensions.multiDraw === !0 || Oe) && n.has("WEBGL_multi_draw"),
      rendererExtensionParallelShaderCompile: n.has("KHR_parallel_shader_compile"),
      customProgramCacheKey: x.customProgramCacheKey()
    };
    return je.vertexUv1s = l.has(1), je.vertexUv2s = l.has(2), je.vertexUv3s = l.has(3), l.clear(), je;
  }
  function T(x) {
    const E = [];
    if (x.shaderID ? E.push(x.shaderID) : (E.push(x.customVertexShaderID), E.push(x.customFragmentShaderID)), x.defines !== void 0)
      for (const B in x.defines)
        E.push(B), E.push(x.defines[B]);
    return x.isRawShaderMaterial === !1 && (y(E, x), A(E, x), E.push(s.outputColorSpace)), E.push(x.customProgramCacheKey), E.join();
  }
  function y(x, E) {
    x.push(E.precision), x.push(E.outputColorSpace), x.push(E.envMapMode), x.push(E.envMapCubeUVHeight), x.push(E.mapUv), x.push(E.alphaMapUv), x.push(E.lightMapUv), x.push(E.aoMapUv), x.push(E.bumpMapUv), x.push(E.normalMapUv), x.push(E.displacementMapUv), x.push(E.emissiveMapUv), x.push(E.metalnessMapUv), x.push(E.roughnessMapUv), x.push(E.anisotropyMapUv), x.push(E.clearcoatMapUv), x.push(E.clearcoatNormalMapUv), x.push(E.clearcoatRoughnessMapUv), x.push(E.iridescenceMapUv), x.push(E.iridescenceThicknessMapUv), x.push(E.sheenColorMapUv), x.push(E.sheenRoughnessMapUv), x.push(E.specularMapUv), x.push(E.specularColorMapUv), x.push(E.specularIntensityMapUv), x.push(E.transmissionMapUv), x.push(E.thicknessMapUv), x.push(E.combine), x.push(E.fogExp2), x.push(E.sizeAttenuation), x.push(E.morphTargetsCount), x.push(E.morphAttributeCount), x.push(E.numDirLights), x.push(E.numPointLights), x.push(E.numSpotLights), x.push(E.numSpotLightMaps), x.push(E.numHemiLights), x.push(E.numRectAreaLights), x.push(E.numDirLightShadows), x.push(E.numPointLightShadows), x.push(E.numSpotLightShadows), x.push(E.numSpotLightShadowsWithMaps), x.push(E.numLightProbes), x.push(E.shadowMapType), x.push(E.toneMapping), x.push(E.numClippingPlanes), x.push(E.numClipIntersection), x.push(E.depthPacking);
  }
  function A(x, E) {
    o.disableAll(), E.supportsVertexTextures && o.enable(0), E.instancing && o.enable(1), E.instancingColor && o.enable(2), E.instancingMorph && o.enable(3), E.matcap && o.enable(4), E.envMap && o.enable(5), E.normalMapObjectSpace && o.enable(6), E.normalMapTangentSpace && o.enable(7), E.clearcoat && o.enable(8), E.iridescence && o.enable(9), E.alphaTest && o.enable(10), E.vertexColors && o.enable(11), E.vertexAlphas && o.enable(12), E.vertexUv1s && o.enable(13), E.vertexUv2s && o.enable(14), E.vertexUv3s && o.enable(15), E.vertexTangents && o.enable(16), E.anisotropy && o.enable(17), E.alphaHash && o.enable(18), E.batching && o.enable(19), E.dispersion && o.enable(20), E.batchingColor && o.enable(21), x.push(o.mask), o.disableAll(), E.fog && o.enable(0), E.useFog && o.enable(1), E.flatShading && o.enable(2), E.logarithmicDepthBuffer && o.enable(3), E.reverseDepthBuffer && o.enable(4), E.skinning && o.enable(5), E.morphTargets && o.enable(6), E.morphNormals && o.enable(7), E.morphColors && o.enable(8), E.premultipliedAlpha && o.enable(9), E.shadowMapEnabled && o.enable(10), E.doubleSided && o.enable(11), E.flipSided && o.enable(12), E.useDepthPacking && o.enable(13), E.dithering && o.enable(14), E.transmission && o.enable(15), E.sheen && o.enable(16), E.opaque && o.enable(17), E.pointsUvs && o.enable(18), E.decodeVideoTexture && o.enable(19), E.alphaToCoverage && o.enable(20), x.push(o.mask);
  }
  function L(x) {
    const E = _[x.type];
    let B;
    if (E) {
      const O = Jt[E];
      B = bc.clone(O.uniforms);
    } else
      B = x.uniforms;
    return B;
  }
  function w(x, E) {
    let B;
    for (let O = 0, U = h.length; O < U; O++) {
      const Q = h[O];
      if (Q.cacheKey === E) {
        B = Q, ++B.usedTimes;
        break;
      }
    }
    return B === void 0 && (B = new Gd(s, E, x, r), h.push(B)), B;
  }
  function R(x) {
    if (--x.usedTimes === 0) {
      const E = h.indexOf(x);
      h[E] = h[h.length - 1], h.pop(), x.destroy();
    }
  }
  function N(x) {
    c.remove(x);
  }
  function K() {
    c.dispose();
  }
  return {
    getParameters: m,
    getProgramCacheKey: T,
    getUniforms: L,
    acquireProgram: w,
    releaseProgram: R,
    releaseShaderCache: N,
    // Exposed for resource monitoring & error feedback via renderer.info:
    programs: h,
    dispose: K
  };
}
function Wd() {
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
function Xd(s, e) {
  return s.groupOrder !== e.groupOrder ? s.groupOrder - e.groupOrder : s.renderOrder !== e.renderOrder ? s.renderOrder - e.renderOrder : s.material.id !== e.material.id ? s.material.id - e.material.id : s.z !== e.z ? s.z - e.z : s.id - e.id;
}
function Ra(s, e) {
  return s.groupOrder !== e.groupOrder ? s.groupOrder - e.groupOrder : s.renderOrder !== e.renderOrder ? s.renderOrder - e.renderOrder : s.z !== e.z ? e.z - s.z : s.id - e.id;
}
function Ca() {
  const s = [];
  let e = 0;
  const t = [], n = [], i = [];
  function r() {
    e = 0, t.length = 0, n.length = 0, i.length = 0;
  }
  function a(u, d, f, g, _, p) {
    let m = s[e];
    return m === void 0 ? (m = {
      id: u.id,
      object: u,
      geometry: d,
      material: f,
      groupOrder: g,
      renderOrder: u.renderOrder,
      z: _,
      group: p
    }, s[e] = m) : (m.id = u.id, m.object = u, m.geometry = d, m.material = f, m.groupOrder = g, m.renderOrder = u.renderOrder, m.z = _, m.group = p), e++, m;
  }
  function o(u, d, f, g, _, p) {
    const m = a(u, d, f, g, _, p);
    f.transmission > 0 ? n.push(m) : f.transparent === !0 ? i.push(m) : t.push(m);
  }
  function c(u, d, f, g, _, p) {
    const m = a(u, d, f, g, _, p);
    f.transmission > 0 ? n.unshift(m) : f.transparent === !0 ? i.unshift(m) : t.unshift(m);
  }
  function l(u, d) {
    t.length > 1 && t.sort(u || Xd), n.length > 1 && n.sort(d || Ra), i.length > 1 && i.sort(d || Ra);
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
function qd() {
  let s = /* @__PURE__ */ new WeakMap();
  function e(n, i) {
    const r = s.get(n);
    let a;
    return r === void 0 ? (a = new Ca(), s.set(n, [a])) : i >= r.length ? (a = new Ca(), r.push(a)) : a = r[i], a;
  }
  function t() {
    s = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: e,
    dispose: t
  };
}
function jd() {
  const s = {};
  return {
    get: function(e) {
      if (s[e.id] !== void 0)
        return s[e.id];
      let t;
      switch (e.type) {
        case "DirectionalLight":
          t = {
            direction: new C(),
            color: new be()
          };
          break;
        case "SpotLight":
          t = {
            position: new C(),
            direction: new C(),
            color: new be(),
            distance: 0,
            coneCos: 0,
            penumbraCos: 0,
            decay: 0
          };
          break;
        case "PointLight":
          t = {
            position: new C(),
            color: new be(),
            distance: 0,
            decay: 0
          };
          break;
        case "HemisphereLight":
          t = {
            direction: new C(),
            skyColor: new be(),
            groundColor: new be()
          };
          break;
        case "RectAreaLight":
          t = {
            color: new be(),
            position: new C(),
            halfWidth: new C(),
            halfHeight: new C()
          };
          break;
      }
      return s[e.id] = t, t;
    }
  };
}
function Yd() {
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
            shadowMapSize: new Be()
          };
          break;
        case "SpotLight":
          t = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new Be()
          };
          break;
        case "PointLight":
          t = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new Be(),
            shadowCameraNear: 1,
            shadowCameraFar: 1e3
          };
          break;
      }
      return s[e.id] = t, t;
    }
  };
}
let Kd = 0;
function Zd(s, e) {
  return (e.castShadow ? 2 : 0) - (s.castShadow ? 2 : 0) + (e.map ? 1 : 0) - (s.map ? 1 : 0);
}
function $d(s) {
  const e = new jd(), t = Yd(), n = {
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
  for (let l = 0; l < 9; l++) n.probe.push(new C());
  const i = new C(), r = new Ne(), a = new Ne();
  function o(l) {
    let h = 0, u = 0, d = 0;
    for (let K = 0; K < 9; K++) n.probe[K].set(0, 0, 0);
    let f = 0, g = 0, _ = 0, p = 0, m = 0, T = 0, y = 0, A = 0, L = 0, w = 0, R = 0;
    l.sort(Zd);
    for (let K = 0, x = l.length; K < x; K++) {
      const E = l[K], B = E.color, O = E.intensity, U = E.distance, Q = E.shadow && E.shadow.map ? E.shadow.map.texture : null;
      if (E.isAmbientLight)
        h += B.r * O, u += B.g * O, d += B.b * O;
      else if (E.isLightProbe) {
        for (let k = 0; k < 9; k++)
          n.probe[k].addScaledVector(E.sh.coefficients[k], O);
        R++;
      } else if (E.isDirectionalLight) {
        const k = e.get(E);
        if (k.color.copy(E.color).multiplyScalar(E.intensity), E.castShadow) {
          const ne = E.shadow, W = t.get(E);
          W.shadowIntensity = ne.intensity, W.shadowBias = ne.bias, W.shadowNormalBias = ne.normalBias, W.shadowRadius = ne.radius, W.shadowMapSize = ne.mapSize, n.directionalShadow[f] = W, n.directionalShadowMap[f] = Q, n.directionalShadowMatrix[f] = E.shadow.matrix, T++;
        }
        n.directional[f] = k, f++;
      } else if (E.isSpotLight) {
        const k = e.get(E);
        k.position.setFromMatrixPosition(E.matrixWorld), k.color.copy(B).multiplyScalar(O), k.distance = U, k.coneCos = Math.cos(E.angle), k.penumbraCos = Math.cos(E.angle * (1 - E.penumbra)), k.decay = E.decay, n.spot[_] = k;
        const ne = E.shadow;
        if (E.map && (n.spotLightMap[L] = E.map, L++, ne.updateMatrices(E), E.castShadow && w++), n.spotLightMatrix[_] = ne.matrix, E.castShadow) {
          const W = t.get(E);
          W.shadowIntensity = ne.intensity, W.shadowBias = ne.bias, W.shadowNormalBias = ne.normalBias, W.shadowRadius = ne.radius, W.shadowMapSize = ne.mapSize, n.spotShadow[_] = W, n.spotShadowMap[_] = Q, A++;
        }
        _++;
      } else if (E.isRectAreaLight) {
        const k = e.get(E);
        k.color.copy(B).multiplyScalar(O), k.halfWidth.set(E.width * 0.5, 0, 0), k.halfHeight.set(0, E.height * 0.5, 0), n.rectArea[p] = k, p++;
      } else if (E.isPointLight) {
        const k = e.get(E);
        if (k.color.copy(E.color).multiplyScalar(E.intensity), k.distance = E.distance, k.decay = E.decay, E.castShadow) {
          const ne = E.shadow, W = t.get(E);
          W.shadowIntensity = ne.intensity, W.shadowBias = ne.bias, W.shadowNormalBias = ne.normalBias, W.shadowRadius = ne.radius, W.shadowMapSize = ne.mapSize, W.shadowCameraNear = ne.camera.near, W.shadowCameraFar = ne.camera.far, n.pointShadow[g] = W, n.pointShadowMap[g] = Q, n.pointShadowMatrix[g] = E.shadow.matrix, y++;
        }
        n.point[g] = k, g++;
      } else if (E.isHemisphereLight) {
        const k = e.get(E);
        k.skyColor.copy(E.color).multiplyScalar(O), k.groundColor.copy(E.groundColor).multiplyScalar(O), n.hemi[m] = k, m++;
      }
    }
    p > 0 && (s.has("OES_texture_float_linear") === !0 ? (n.rectAreaLTC1 = re.LTC_FLOAT_1, n.rectAreaLTC2 = re.LTC_FLOAT_2) : (n.rectAreaLTC1 = re.LTC_HALF_1, n.rectAreaLTC2 = re.LTC_HALF_2)), n.ambient[0] = h, n.ambient[1] = u, n.ambient[2] = d;
    const N = n.hash;
    (N.directionalLength !== f || N.pointLength !== g || N.spotLength !== _ || N.rectAreaLength !== p || N.hemiLength !== m || N.numDirectionalShadows !== T || N.numPointShadows !== y || N.numSpotShadows !== A || N.numSpotMaps !== L || N.numLightProbes !== R) && (n.directional.length = f, n.spot.length = _, n.rectArea.length = p, n.point.length = g, n.hemi.length = m, n.directionalShadow.length = T, n.directionalShadowMap.length = T, n.pointShadow.length = y, n.pointShadowMap.length = y, n.spotShadow.length = A, n.spotShadowMap.length = A, n.directionalShadowMatrix.length = T, n.pointShadowMatrix.length = y, n.spotLightMatrix.length = A + L - w, n.spotLightMap.length = L, n.numSpotLightShadowsWithMaps = w, n.numLightProbes = R, N.directionalLength = f, N.pointLength = g, N.spotLength = _, N.rectAreaLength = p, N.hemiLength = m, N.numDirectionalShadows = T, N.numPointShadows = y, N.numSpotShadows = A, N.numSpotMaps = L, N.numLightProbes = R, n.version = Kd++);
  }
  function c(l, h) {
    let u = 0, d = 0, f = 0, g = 0, _ = 0;
    const p = h.matrixWorldInverse;
    for (let m = 0, T = l.length; m < T; m++) {
      const y = l[m];
      if (y.isDirectionalLight) {
        const A = n.directional[u];
        A.direction.setFromMatrixPosition(y.matrixWorld), i.setFromMatrixPosition(y.target.matrixWorld), A.direction.sub(i), A.direction.transformDirection(p), u++;
      } else if (y.isSpotLight) {
        const A = n.spot[f];
        A.position.setFromMatrixPosition(y.matrixWorld), A.position.applyMatrix4(p), A.direction.setFromMatrixPosition(y.matrixWorld), i.setFromMatrixPosition(y.target.matrixWorld), A.direction.sub(i), A.direction.transformDirection(p), f++;
      } else if (y.isRectAreaLight) {
        const A = n.rectArea[g];
        A.position.setFromMatrixPosition(y.matrixWorld), A.position.applyMatrix4(p), a.identity(), r.copy(y.matrixWorld), r.premultiply(p), a.extractRotation(r), A.halfWidth.set(y.width * 0.5, 0, 0), A.halfHeight.set(0, y.height * 0.5, 0), A.halfWidth.applyMatrix4(a), A.halfHeight.applyMatrix4(a), g++;
      } else if (y.isPointLight) {
        const A = n.point[d];
        A.position.setFromMatrixPosition(y.matrixWorld), A.position.applyMatrix4(p), d++;
      } else if (y.isHemisphereLight) {
        const A = n.hemi[_];
        A.direction.setFromMatrixPosition(y.matrixWorld), A.direction.transformDirection(p), _++;
      }
    }
  }
  return {
    setup: o,
    setupView: c,
    state: n
  };
}
function Ia(s) {
  const e = new $d(s), t = [], n = [];
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
function Jd(s) {
  let e = /* @__PURE__ */ new WeakMap();
  function t(i, r = 0) {
    const a = e.get(i);
    let o;
    return a === void 0 ? (o = new Ia(s), e.set(i, [o])) : r >= a.length ? (o = new Ia(s), a.push(o)) : o = a[r], o;
  }
  function n() {
    e = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: t,
    dispose: n
  };
}
class Qd extends Nt {
  constructor(e) {
    super(), this.isMeshDepthMaterial = !0, this.type = "MeshDepthMaterial", this.depthPacking = 3200, this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.wireframe = !1, this.wireframeLinewidth = 1, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.depthPacking = e.depthPacking, this.map = e.map, this.alphaMap = e.alphaMap, this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this;
  }
}
class ef extends Nt {
  constructor(e) {
    super(), this.isMeshDistanceMaterial = !0, this.type = "MeshDistanceMaterial", this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.map = e.map, this.alphaMap = e.alphaMap, this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this;
  }
}
const tf = `void main() {
	gl_Position = vec4( position, 1.0 );
}`, nf = `uniform sampler2D shadow_pass;
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
function sf(s, e, t) {
  let n = new Tr();
  const i = new Be(), r = new Be(), a = new Ye(), o = new Qd({ depthPacking: 3201 }), c = new ef(), l = {}, h = t.maxTextureSize, u = { 0: 1, 1: 0, 2: 2 }, d = new Sn({
    defines: {
      VSM_SAMPLES: 8
    },
    uniforms: {
      shadow_pass: { value: null },
      resolution: { value: new Be() },
      radius: { value: 4 }
    },
    vertexShader: tf,
    fragmentShader: nf
  }), f = d.clone();
  f.defines.HORIZONTAL_PASS = 1;
  const g = new vt();
  g.setAttribute(
    "position",
    new At(
      new Float32Array([-1, -1, 0.5, 3, -1, 0.5, -1, 3, 0.5]),
      3
    )
  );
  const _ = new Qe(g, d), p = this;
  this.enabled = !1, this.autoUpdate = !0, this.needsUpdate = !1, this.type = 1;
  let m = this.type;
  this.render = function(w, R, N) {
    if (p.enabled === !1 || p.autoUpdate === !1 && p.needsUpdate === !1 || w.length === 0) return;
    const K = s.getRenderTarget(), x = s.getActiveCubeFace(), E = s.getActiveMipmapLevel(), B = s.state;
    B.setBlending(0), B.buffers.color.setClear(1, 1, 1, 1), B.buffers.depth.setTest(!0), B.setScissorTest(!1);
    const O = m !== 3 && this.type === 3, U = m === 3 && this.type !== 3;
    for (let Q = 0, k = w.length; Q < k; Q++) {
      const ne = w[Q], W = ne.shadow;
      if (W === void 0) {
        console.warn("THREE.WebGLShadowMap:", ne, "has no shadow.");
        continue;
      }
      if (W.autoUpdate === !1 && W.needsUpdate === !1) continue;
      i.copy(W.mapSize);
      const oe = W.getFrameExtents();
      if (i.multiply(oe), r.copy(W.mapSize), (i.x > h || i.y > h) && (i.x > h && (r.x = Math.floor(h / oe.x), i.x = r.x * oe.x, W.mapSize.x = r.x), i.y > h && (r.y = Math.floor(h / oe.y), i.y = r.y * oe.y, W.mapSize.y = r.y)), W.map === null || O === !0 || U === !0) {
        const ve = this.type !== 3 ? { minFilter: 1003, magFilter: 1003 } : {};
        W.map !== null && W.map.dispose(), W.map = new Nn(i.x, i.y, ve), W.map.texture.name = ne.name + ".shadowMap", W.camera.updateProjectionMatrix();
      }
      s.setRenderTarget(W.map), s.clear();
      const he = W.getViewportCount();
      for (let ve = 0; ve < he; ve++) {
        const ke = W.getViewport(ve);
        a.set(
          r.x * ke.x,
          r.y * ke.y,
          r.x * ke.z,
          r.y * ke.w
        ), B.viewport(a), W.updateMatrices(ne, ve), n = W.getFrustum(), A(R, N, W.camera, ne, this.type);
      }
      W.isPointLightShadow !== !0 && this.type === 3 && T(W, N), W.needsUpdate = !1;
    }
    m = this.type, p.needsUpdate = !1, s.setRenderTarget(K, x, E);
  };
  function T(w, R) {
    const N = e.update(_);
    d.defines.VSM_SAMPLES !== w.blurSamples && (d.defines.VSM_SAMPLES = w.blurSamples, f.defines.VSM_SAMPLES = w.blurSamples, d.needsUpdate = !0, f.needsUpdate = !0), w.mapPass === null && (w.mapPass = new Nn(i.x, i.y)), d.uniforms.shadow_pass.value = w.map.texture, d.uniforms.resolution.value = w.mapSize, d.uniforms.radius.value = w.radius, s.setRenderTarget(w.mapPass), s.clear(), s.renderBufferDirect(R, null, N, d, _, null), f.uniforms.shadow_pass.value = w.mapPass.texture, f.uniforms.resolution.value = w.mapSize, f.uniforms.radius.value = w.radius, s.setRenderTarget(w.map), s.clear(), s.renderBufferDirect(R, null, N, f, _, null);
  }
  function y(w, R, N, K) {
    let x = null;
    const E = N.isPointLight === !0 ? w.customDistanceMaterial : w.customDepthMaterial;
    if (E !== void 0)
      x = E;
    else if (x = N.isPointLight === !0 ? c : o, s.localClippingEnabled && R.clipShadows === !0 && Array.isArray(R.clippingPlanes) && R.clippingPlanes.length !== 0 || R.displacementMap && R.displacementScale !== 0 || R.alphaMap && R.alphaTest > 0 || R.map && R.alphaTest > 0) {
      const B = x.uuid, O = R.uuid;
      let U = l[B];
      U === void 0 && (U = {}, l[B] = U);
      let Q = U[O];
      Q === void 0 && (Q = x.clone(), U[O] = Q, R.addEventListener("dispose", L)), x = Q;
    }
    if (x.visible = R.visible, x.wireframe = R.wireframe, K === 3 ? x.side = R.shadowSide !== null ? R.shadowSide : R.side : x.side = R.shadowSide !== null ? R.shadowSide : u[R.side], x.alphaMap = R.alphaMap, x.alphaTest = R.alphaTest, x.map = R.map, x.clipShadows = R.clipShadows, x.clippingPlanes = R.clippingPlanes, x.clipIntersection = R.clipIntersection, x.displacementMap = R.displacementMap, x.displacementScale = R.displacementScale, x.displacementBias = R.displacementBias, x.wireframeLinewidth = R.wireframeLinewidth, x.linewidth = R.linewidth, N.isPointLight === !0 && x.isMeshDistanceMaterial === !0) {
      const B = s.properties.get(x);
      B.light = N;
    }
    return x;
  }
  function A(w, R, N, K, x) {
    if (w.visible === !1) return;
    if (w.layers.test(R.layers) && (w.isMesh || w.isLine || w.isPoints) && (w.castShadow || w.receiveShadow && x === 3) && (!w.frustumCulled || n.intersectsObject(w))) {
      w.modelViewMatrix.multiplyMatrices(N.matrixWorldInverse, w.matrixWorld);
      const O = e.update(w), U = w.material;
      if (Array.isArray(U)) {
        const Q = O.groups;
        for (let k = 0, ne = Q.length; k < ne; k++) {
          const W = Q[k], oe = U[W.materialIndex];
          if (oe && oe.visible) {
            const he = y(w, oe, K, x);
            w.onBeforeShadow(s, w, R, N, O, he, W), s.renderBufferDirect(N, null, O, he, w, W), w.onAfterShadow(s, w, R, N, O, he, W);
          }
        }
      } else if (U.visible) {
        const Q = y(w, U, K, x);
        w.onBeforeShadow(s, w, R, N, O, Q, null), s.renderBufferDirect(N, null, O, Q, w, null), w.onAfterShadow(s, w, R, N, O, Q, null);
      }
    }
    const B = w.children;
    for (let O = 0, U = B.length; O < U; O++)
      A(B[O], R, N, K, x);
  }
  function L(w) {
    w.target.removeEventListener("dispose", L);
    for (const N in l) {
      const K = l[N], x = w.target.uuid;
      x in K && (K[x].dispose(), delete K[x]);
    }
  }
}
const rf = {
  0: 1,
  2: 6,
  4: 7,
  3: 5,
  1: 0,
  6: 2,
  7: 4,
  5: 3
};
function af(s) {
  function e() {
    let I = !1;
    const ue = new Ye();
    let H = null;
    const $ = new Ye(0, 0, 0, 0);
    return {
      setMask: function(ce) {
        H !== ce && !I && (s.colorMask(ce, ce, ce, ce), H = ce);
      },
      setLocked: function(ce) {
        I = ce;
      },
      setClear: function(ce, de, Xe, ht, bt) {
        bt === !0 && (ce *= ht, de *= ht, Xe *= ht), ue.set(ce, de, Xe, ht), $.equals(ue) === !1 && (s.clearColor(ce, de, Xe, ht), $.copy(ue));
      },
      reset: function() {
        I = !1, H = null, $.set(-1, 0, 0, 0);
      }
    };
  }
  function t() {
    let I = !1, ue = !1, H = null, $ = null, ce = null;
    return {
      setReversed: function(de) {
        ue = de;
      },
      setTest: function(de) {
        de ? ge(s.DEPTH_TEST) : fe(s.DEPTH_TEST);
      },
      setMask: function(de) {
        H !== de && !I && (s.depthMask(de), H = de);
      },
      setFunc: function(de) {
        if (ue && (de = rf[de]), $ !== de) {
          switch (de) {
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
          $ = de;
        }
      },
      setLocked: function(de) {
        I = de;
      },
      setClear: function(de) {
        ce !== de && (s.clearDepth(de), ce = de);
      },
      reset: function() {
        I = !1, H = null, $ = null, ce = null;
      }
    };
  }
  function n() {
    let I = !1, ue = null, H = null, $ = null, ce = null, de = null, Xe = null, ht = null, bt = null;
    return {
      setTest: function(je) {
        I || (je ? ge(s.STENCIL_TEST) : fe(s.STENCIL_TEST));
      },
      setMask: function(je) {
        ue !== je && !I && (s.stencilMask(je), ue = je);
      },
      setFunc: function(je, wt, nn) {
        (H !== je || $ !== wt || ce !== nn) && (s.stencilFunc(je, wt, nn), H = je, $ = wt, ce = nn);
      },
      setOp: function(je, wt, nn) {
        (de !== je || Xe !== wt || ht !== nn) && (s.stencilOp(je, wt, nn), de = je, Xe = wt, ht = nn);
      },
      setLocked: function(je) {
        I = je;
      },
      setClear: function(je) {
        bt !== je && (s.clearStencil(je), bt = je);
      },
      reset: function() {
        I = !1, ue = null, H = null, $ = null, ce = null, de = null, Xe = null, ht = null, bt = null;
      }
    };
  }
  const i = new e(), r = new t(), a = new n(), o = /* @__PURE__ */ new WeakMap(), c = /* @__PURE__ */ new WeakMap();
  let l = {}, h = {}, u = /* @__PURE__ */ new WeakMap(), d = [], f = null, g = !1, _ = null, p = null, m = null, T = null, y = null, A = null, L = null, w = new be(0, 0, 0), R = 0, N = !1, K = null, x = null, E = null, B = null, O = null;
  const U = s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
  let Q = !1, k = 0;
  const ne = s.getParameter(s.VERSION);
  ne.indexOf("WebGL") !== -1 ? (k = parseFloat(/^WebGL (\d)/.exec(ne)[1]), Q = k >= 1) : ne.indexOf("OpenGL ES") !== -1 && (k = parseFloat(/^OpenGL ES (\d)/.exec(ne)[1]), Q = k >= 2);
  let W = null, oe = {};
  const he = s.getParameter(s.SCISSOR_BOX), ve = s.getParameter(s.VIEWPORT), ke = new Ye().fromArray(he), We = new Ye().fromArray(ve);
  function X(I, ue, H, $) {
    const ce = new Uint8Array(4), de = s.createTexture();
    s.bindTexture(I, de), s.texParameteri(I, s.TEXTURE_MIN_FILTER, s.NEAREST), s.texParameteri(I, s.TEXTURE_MAG_FILTER, s.NEAREST);
    for (let Xe = 0; Xe < H; Xe++)
      I === s.TEXTURE_3D || I === s.TEXTURE_2D_ARRAY ? s.texImage3D(ue, 0, s.RGBA, 1, 1, $, 0, s.RGBA, s.UNSIGNED_BYTE, ce) : s.texImage2D(ue + Xe, 0, s.RGBA, 1, 1, 0, s.RGBA, s.UNSIGNED_BYTE, ce);
    return de;
  }
  const te = {};
  te[s.TEXTURE_2D] = X(s.TEXTURE_2D, s.TEXTURE_2D, 1), te[s.TEXTURE_CUBE_MAP] = X(s.TEXTURE_CUBE_MAP, s.TEXTURE_CUBE_MAP_POSITIVE_X, 6), te[s.TEXTURE_2D_ARRAY] = X(s.TEXTURE_2D_ARRAY, s.TEXTURE_2D_ARRAY, 1, 1), te[s.TEXTURE_3D] = X(s.TEXTURE_3D, s.TEXTURE_3D, 1, 1), i.setClear(0, 0, 0, 1), r.setClear(1), a.setClear(0), ge(s.DEPTH_TEST), r.setFunc(3), q(!1), Z(1), ge(s.CULL_FACE), M(0);
  function ge(I) {
    l[I] !== !0 && (s.enable(I), l[I] = !0);
  }
  function fe(I) {
    l[I] !== !1 && (s.disable(I), l[I] = !1);
  }
  function Ce(I, ue) {
    return h[I] !== ue ? (s.bindFramebuffer(I, ue), h[I] = ue, I === s.DRAW_FRAMEBUFFER && (h[s.FRAMEBUFFER] = ue), I === s.FRAMEBUFFER && (h[s.DRAW_FRAMEBUFFER] = ue), !0) : !1;
  }
  function we(I, ue) {
    let H = d, $ = !1;
    if (I) {
      H = u.get(ue), H === void 0 && (H = [], u.set(ue, H));
      const ce = I.textures;
      if (H.length !== ce.length || H[0] !== s.COLOR_ATTACHMENT0) {
        for (let de = 0, Xe = ce.length; de < Xe; de++)
          H[de] = s.COLOR_ATTACHMENT0 + de;
        H.length = ce.length, $ = !0;
      }
    } else
      H[0] !== s.BACK && (H[0] = s.BACK, $ = !0);
    $ && s.drawBuffers(H);
  }
  function Oe(I) {
    return f !== I ? (s.useProgram(I), f = I, !0) : !1;
  }
  const Ke = {
    100: s.FUNC_ADD,
    101: s.FUNC_SUBTRACT,
    102: s.FUNC_REVERSE_SUBTRACT
  };
  Ke[103] = s.MIN, Ke[104] = s.MAX;
  const ze = {
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
  function M(I, ue, H, $, ce, de, Xe, ht, bt, je) {
    if (I === 0) {
      g === !0 && (fe(s.BLEND), g = !1);
      return;
    }
    if (g === !1 && (ge(s.BLEND), g = !0), I !== 5) {
      if (I !== _ || je !== N) {
        if ((p !== 100 || y !== 100) && (s.blendEquation(s.FUNC_ADD), p = 100, y = 100), je)
          switch (I) {
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
              console.error("THREE.WebGLState: Invalid blending: ", I);
              break;
          }
        else
          switch (I) {
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
              console.error("THREE.WebGLState: Invalid blending: ", I);
              break;
          }
        m = null, T = null, A = null, L = null, w.set(0, 0, 0), R = 0, _ = I, N = je;
      }
      return;
    }
    ce = ce || ue, de = de || H, Xe = Xe || $, (ue !== p || ce !== y) && (s.blendEquationSeparate(Ke[ue], Ke[ce]), p = ue, y = ce), (H !== m || $ !== T || de !== A || Xe !== L) && (s.blendFuncSeparate(ze[H], ze[$], ze[de], ze[Xe]), m = H, T = $, A = de, L = Xe), (ht.equals(w) === !1 || bt !== R) && (s.blendColor(ht.r, ht.g, ht.b, bt), w.copy(ht), R = bt), _ = I, N = !1;
  }
  function J(I, ue) {
    I.side === 2 ? fe(s.CULL_FACE) : ge(s.CULL_FACE);
    let H = I.side === 1;
    ue && (H = !H), q(H), I.blending === 1 && I.transparent === !1 ? M(0) : M(I.blending, I.blendEquation, I.blendSrc, I.blendDst, I.blendEquationAlpha, I.blendSrcAlpha, I.blendDstAlpha, I.blendColor, I.blendAlpha, I.premultipliedAlpha), r.setFunc(I.depthFunc), r.setTest(I.depthTest), r.setMask(I.depthWrite), i.setMask(I.colorWrite);
    const $ = I.stencilWrite;
    a.setTest($), $ && (a.setMask(I.stencilWriteMask), a.setFunc(I.stencilFunc, I.stencilRef, I.stencilFuncMask), a.setOp(I.stencilFail, I.stencilZFail, I.stencilZPass)), Ae(I.polygonOffset, I.polygonOffsetFactor, I.polygonOffsetUnits), I.alphaToCoverage === !0 ? ge(s.SAMPLE_ALPHA_TO_COVERAGE) : fe(s.SAMPLE_ALPHA_TO_COVERAGE);
  }
  function q(I) {
    K !== I && (I ? s.frontFace(s.CW) : s.frontFace(s.CCW), K = I);
  }
  function Z(I) {
    I !== 0 ? (ge(s.CULL_FACE), I !== x && (I === 1 ? s.cullFace(s.BACK) : I === 2 ? s.cullFace(s.FRONT) : s.cullFace(s.FRONT_AND_BACK))) : fe(s.CULL_FACE), x = I;
  }
  function j(I) {
    I !== E && (Q && s.lineWidth(I), E = I);
  }
  function Ae(I, ue, H) {
    I ? (ge(s.POLYGON_OFFSET_FILL), (B !== ue || O !== H) && (s.polygonOffset(ue, H), B = ue, O = H)) : fe(s.POLYGON_OFFSET_FILL);
  }
  function pe(I) {
    I ? ge(s.SCISSOR_TEST) : fe(s.SCISSOR_TEST);
  }
  function b(I) {
    I === void 0 && (I = s.TEXTURE0 + U - 1), W !== I && (s.activeTexture(I), W = I);
  }
  function v(I, ue, H) {
    H === void 0 && (W === null ? H = s.TEXTURE0 + U - 1 : H = W);
    let $ = oe[H];
    $ === void 0 && ($ = { type: void 0, texture: void 0 }, oe[H] = $), ($.type !== I || $.texture !== ue) && (W !== H && (s.activeTexture(H), W = H), s.bindTexture(I, ue || te[I]), $.type = I, $.texture = ue);
  }
  function F() {
    const I = oe[W];
    I !== void 0 && I.type !== void 0 && (s.bindTexture(I.type, null), I.type = void 0, I.texture = void 0);
  }
  function V() {
    try {
      s.compressedTexImage2D.apply(s, arguments);
    } catch (I) {
      console.error("THREE.WebGLState:", I);
    }
  }
  function ee() {
    try {
      s.compressedTexImage3D.apply(s, arguments);
    } catch (I) {
      console.error("THREE.WebGLState:", I);
    }
  }
  function Y() {
    try {
      s.texSubImage2D.apply(s, arguments);
    } catch (I) {
      console.error("THREE.WebGLState:", I);
    }
  }
  function ye() {
    try {
      s.texSubImage3D.apply(s, arguments);
    } catch (I) {
      console.error("THREE.WebGLState:", I);
    }
  }
  function ae() {
    try {
      s.compressedTexSubImage2D.apply(s, arguments);
    } catch (I) {
      console.error("THREE.WebGLState:", I);
    }
  }
  function me() {
    try {
      s.compressedTexSubImage3D.apply(s, arguments);
    } catch (I) {
      console.error("THREE.WebGLState:", I);
    }
  }
  function qe() {
    try {
      s.texStorage2D.apply(s, arguments);
    } catch (I) {
      console.error("THREE.WebGLState:", I);
    }
  }
  function ie() {
    try {
      s.texStorage3D.apply(s, arguments);
    } catch (I) {
      console.error("THREE.WebGLState:", I);
    }
  }
  function _e() {
    try {
      s.texImage2D.apply(s, arguments);
    } catch (I) {
      console.error("THREE.WebGLState:", I);
    }
  }
  function Pe() {
    try {
      s.texImage3D.apply(s, arguments);
    } catch (I) {
      console.error("THREE.WebGLState:", I);
    }
  }
  function Le(I) {
    ke.equals(I) === !1 && (s.scissor(I.x, I.y, I.z, I.w), ke.copy(I));
  }
  function xe(I) {
    We.equals(I) === !1 && (s.viewport(I.x, I.y, I.z, I.w), We.copy(I));
  }
  function He(I, ue) {
    let H = c.get(ue);
    H === void 0 && (H = /* @__PURE__ */ new WeakMap(), c.set(ue, H));
    let $ = H.get(I);
    $ === void 0 && ($ = s.getUniformBlockIndex(ue, I.name), H.set(I, $));
  }
  function De(I, ue) {
    const $ = c.get(ue).get(I);
    o.get(ue) !== $ && (s.uniformBlockBinding(ue, $, I.__bindingPointIndex), o.set(ue, $));
  }
  function it() {
    s.disable(s.BLEND), s.disable(s.CULL_FACE), s.disable(s.DEPTH_TEST), s.disable(s.POLYGON_OFFSET_FILL), s.disable(s.SCISSOR_TEST), s.disable(s.STENCIL_TEST), s.disable(s.SAMPLE_ALPHA_TO_COVERAGE), s.blendEquation(s.FUNC_ADD), s.blendFunc(s.ONE, s.ZERO), s.blendFuncSeparate(s.ONE, s.ZERO, s.ONE, s.ZERO), s.blendColor(0, 0, 0, 0), s.colorMask(!0, !0, !0, !0), s.clearColor(0, 0, 0, 0), s.depthMask(!0), s.depthFunc(s.LESS), s.clearDepth(1), s.stencilMask(4294967295), s.stencilFunc(s.ALWAYS, 0, 4294967295), s.stencilOp(s.KEEP, s.KEEP, s.KEEP), s.clearStencil(0), s.cullFace(s.BACK), s.frontFace(s.CCW), s.polygonOffset(0, 0), s.activeTexture(s.TEXTURE0), s.bindFramebuffer(s.FRAMEBUFFER, null), s.bindFramebuffer(s.DRAW_FRAMEBUFFER, null), s.bindFramebuffer(s.READ_FRAMEBUFFER, null), s.useProgram(null), s.lineWidth(1), s.scissor(0, 0, s.canvas.width, s.canvas.height), s.viewport(0, 0, s.canvas.width, s.canvas.height), l = {}, W = null, oe = {}, h = {}, u = /* @__PURE__ */ new WeakMap(), d = [], f = null, g = !1, _ = null, p = null, m = null, T = null, y = null, A = null, L = null, w = new be(0, 0, 0), R = 0, N = !1, K = null, x = null, E = null, B = null, O = null, ke.set(0, 0, s.canvas.width, s.canvas.height), We.set(0, 0, s.canvas.width, s.canvas.height), i.reset(), r.reset(), a.reset();
  }
  return {
    buffers: {
      color: i,
      depth: r,
      stencil: a
    },
    enable: ge,
    disable: fe,
    bindFramebuffer: Ce,
    drawBuffers: we,
    useProgram: Oe,
    setBlending: M,
    setMaterial: J,
    setFlipSided: q,
    setCullFace: Z,
    setLineWidth: j,
    setPolygonOffset: Ae,
    setScissorTest: pe,
    activeTexture: b,
    bindTexture: v,
    unbindTexture: F,
    compressedTexImage2D: V,
    compressedTexImage3D: ee,
    texImage2D: _e,
    texImage3D: Pe,
    updateUBOMapping: He,
    uniformBlockBinding: De,
    texStorage2D: qe,
    texStorage3D: ie,
    texSubImage2D: Y,
    texSubImage3D: ye,
    compressedTexSubImage2D: ae,
    compressedTexSubImage3D: me,
    scissor: Le,
    viewport: xe,
    reset: it
  };
}
function Pa(s, e, t, n) {
  const i = of(n);
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
function of(s) {
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
function cf(s, e, t, n, i, r, a) {
  const o = e.has("WEBGL_multisampled_render_to_texture") ? e.get("WEBGL_multisampled_render_to_texture") : null, c = typeof navigator > "u" ? !1 : /OculusBrowser/g.test(navigator.userAgent), l = new Be(), h = /* @__PURE__ */ new WeakMap();
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
    ) : bi("canvas");
  }
  function _(b, v, F) {
    let V = 1;
    const ee = pe(b);
    if ((ee.width > F || ee.height > F) && (V = F / Math.max(ee.width, ee.height)), V < 1)
      if (typeof HTMLImageElement < "u" && b instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && b instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && b instanceof ImageBitmap || typeof VideoFrame < "u" && b instanceof VideoFrame) {
        const Y = Math.floor(V * ee.width), ye = Math.floor(V * ee.height);
        u === void 0 && (u = g(Y, ye));
        const ae = v ? g(Y, ye) : u;
        return ae.width = Y, ae.height = ye, ae.getContext("2d").drawImage(b, 0, 0, Y, ye), console.warn("THREE.WebGLRenderer: Texture has been resized from (" + ee.width + "x" + ee.height + ") to (" + Y + "x" + ye + ")."), ae;
      } else
        return "data" in b && console.warn("THREE.WebGLRenderer: Image in DataTexture is too big (" + ee.width + "x" + ee.height + ")."), b;
    return b;
  }
  function p(b) {
    return b.generateMipmaps && b.minFilter !== 1003 && b.minFilter !== 1006;
  }
  function m(b) {
    s.generateMipmap(b);
  }
  function T(b, v, F, V, ee = !1) {
    if (b !== null) {
      if (s[b] !== void 0) return s[b];
      console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '" + b + "'");
    }
    let Y = v;
    if (v === s.RED && (F === s.FLOAT && (Y = s.R32F), F === s.HALF_FLOAT && (Y = s.R16F), F === s.UNSIGNED_BYTE && (Y = s.R8)), v === s.RED_INTEGER && (F === s.UNSIGNED_BYTE && (Y = s.R8UI), F === s.UNSIGNED_SHORT && (Y = s.R16UI), F === s.UNSIGNED_INT && (Y = s.R32UI), F === s.BYTE && (Y = s.R8I), F === s.SHORT && (Y = s.R16I), F === s.INT && (Y = s.R32I)), v === s.RG && (F === s.FLOAT && (Y = s.RG32F), F === s.HALF_FLOAT && (Y = s.RG16F), F === s.UNSIGNED_BYTE && (Y = s.RG8)), v === s.RG_INTEGER && (F === s.UNSIGNED_BYTE && (Y = s.RG8UI), F === s.UNSIGNED_SHORT && (Y = s.RG16UI), F === s.UNSIGNED_INT && (Y = s.RG32UI), F === s.BYTE && (Y = s.RG8I), F === s.SHORT && (Y = s.RG16I), F === s.INT && (Y = s.RG32I)), v === s.RGB_INTEGER && (F === s.UNSIGNED_BYTE && (Y = s.RGB8UI), F === s.UNSIGNED_SHORT && (Y = s.RGB16UI), F === s.UNSIGNED_INT && (Y = s.RGB32UI), F === s.BYTE && (Y = s.RGB8I), F === s.SHORT && (Y = s.RGB16I), F === s.INT && (Y = s.RGB32I)), v === s.RGBA_INTEGER && (F === s.UNSIGNED_BYTE && (Y = s.RGBA8UI), F === s.UNSIGNED_SHORT && (Y = s.RGBA16UI), F === s.UNSIGNED_INT && (Y = s.RGBA32UI), F === s.BYTE && (Y = s.RGBA8I), F === s.SHORT && (Y = s.RGBA16I), F === s.INT && (Y = s.RGBA32I)), v === s.RGB && F === s.UNSIGNED_INT_5_9_9_9_REV && (Y = s.RGB9_E5), v === s.RGBA) {
      const ye = ee ? us : Ve.getTransfer(V);
      F === s.FLOAT && (Y = s.RGBA32F), F === s.HALF_FLOAT && (Y = s.RGBA16F), F === s.UNSIGNED_BYTE && (Y = ye === rt ? s.SRGB8_ALPHA8 : s.RGBA8), F === s.UNSIGNED_SHORT_4_4_4_4 && (Y = s.RGBA4), F === s.UNSIGNED_SHORT_5_5_5_1 && (Y = s.RGB5_A1);
    }
    return (Y === s.R16F || Y === s.R32F || Y === s.RG16F || Y === s.RG32F || Y === s.RGBA16F || Y === s.RGBA32F) && e.get("EXT_color_buffer_float"), Y;
  }
  function y(b, v) {
    let F;
    return b ? v === null || v === 1014 || v === 1020 ? F = s.DEPTH24_STENCIL8 : v === 1015 ? F = s.DEPTH32F_STENCIL8 : v === 1012 && (F = s.DEPTH24_STENCIL8, console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")) : v === null || v === 1014 || v === 1020 ? F = s.DEPTH_COMPONENT24 : v === 1015 ? F = s.DEPTH_COMPONENT32F : v === 1012 && (F = s.DEPTH_COMPONENT16), F;
  }
  function A(b, v) {
    return p(b) === !0 || b.isFramebufferTexture && b.minFilter !== 1003 && b.minFilter !== 1006 ? Math.log2(Math.max(v.width, v.height)) + 1 : b.mipmaps !== void 0 && b.mipmaps.length > 0 ? b.mipmaps.length : b.isCompressedTexture && Array.isArray(b.image) ? v.mipmaps.length : 1;
  }
  function L(b) {
    const v = b.target;
    v.removeEventListener("dispose", L), R(v), v.isVideoTexture && h.delete(v);
  }
  function w(b) {
    const v = b.target;
    v.removeEventListener("dispose", w), K(v);
  }
  function R(b) {
    const v = n.get(b);
    if (v.__webglInit === void 0) return;
    const F = b.source, V = d.get(F);
    if (V) {
      const ee = V[v.__cacheKey];
      ee.usedTimes--, ee.usedTimes === 0 && N(b), Object.keys(V).length === 0 && d.delete(F);
    }
    n.remove(b);
  }
  function N(b) {
    const v = n.get(b);
    s.deleteTexture(v.__webglTexture);
    const F = b.source, V = d.get(F);
    delete V[v.__cacheKey], a.memory.textures--;
  }
  function K(b) {
    const v = n.get(b);
    if (b.depthTexture && b.depthTexture.dispose(), b.isWebGLCubeRenderTarget)
      for (let V = 0; V < 6; V++) {
        if (Array.isArray(v.__webglFramebuffer[V]))
          for (let ee = 0; ee < v.__webglFramebuffer[V].length; ee++) s.deleteFramebuffer(v.__webglFramebuffer[V][ee]);
        else
          s.deleteFramebuffer(v.__webglFramebuffer[V]);
        v.__webglDepthbuffer && s.deleteRenderbuffer(v.__webglDepthbuffer[V]);
      }
    else {
      if (Array.isArray(v.__webglFramebuffer))
        for (let V = 0; V < v.__webglFramebuffer.length; V++) s.deleteFramebuffer(v.__webglFramebuffer[V]);
      else
        s.deleteFramebuffer(v.__webglFramebuffer);
      if (v.__webglDepthbuffer && s.deleteRenderbuffer(v.__webglDepthbuffer), v.__webglMultisampledFramebuffer && s.deleteFramebuffer(v.__webglMultisampledFramebuffer), v.__webglColorRenderbuffer)
        for (let V = 0; V < v.__webglColorRenderbuffer.length; V++)
          v.__webglColorRenderbuffer[V] && s.deleteRenderbuffer(v.__webglColorRenderbuffer[V]);
      v.__webglDepthRenderbuffer && s.deleteRenderbuffer(v.__webglDepthRenderbuffer);
    }
    const F = b.textures;
    for (let V = 0, ee = F.length; V < ee; V++) {
      const Y = n.get(F[V]);
      Y.__webglTexture && (s.deleteTexture(Y.__webglTexture), a.memory.textures--), n.remove(F[V]);
    }
    n.remove(b);
  }
  let x = 0;
  function E() {
    x = 0;
  }
  function B() {
    const b = x;
    return b >= i.maxTextures && console.warn("THREE.WebGLTextures: Trying to use " + b + " texture units while this GPU supports only " + i.maxTextures), x += 1, b;
  }
  function O(b) {
    const v = [];
    return v.push(b.wrapS), v.push(b.wrapT), v.push(b.wrapR || 0), v.push(b.magFilter), v.push(b.minFilter), v.push(b.anisotropy), v.push(b.internalFormat), v.push(b.format), v.push(b.type), v.push(b.generateMipmaps), v.push(b.premultiplyAlpha), v.push(b.flipY), v.push(b.unpackAlignment), v.push(b.colorSpace), v.join();
  }
  function U(b, v) {
    const F = n.get(b);
    if (b.isVideoTexture && j(b), b.isRenderTargetTexture === !1 && b.version > 0 && F.__version !== b.version) {
      const V = b.image;
      if (V === null)
        console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");
      else if (V.complete === !1)
        console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");
      else {
        We(F, b, v);
        return;
      }
    }
    t.bindTexture(s.TEXTURE_2D, F.__webglTexture, s.TEXTURE0 + v);
  }
  function Q(b, v) {
    const F = n.get(b);
    if (b.version > 0 && F.__version !== b.version) {
      We(F, b, v);
      return;
    }
    t.bindTexture(s.TEXTURE_2D_ARRAY, F.__webglTexture, s.TEXTURE0 + v);
  }
  function k(b, v) {
    const F = n.get(b);
    if (b.version > 0 && F.__version !== b.version) {
      We(F, b, v);
      return;
    }
    t.bindTexture(s.TEXTURE_3D, F.__webglTexture, s.TEXTURE0 + v);
  }
  function ne(b, v) {
    const F = n.get(b);
    if (b.version > 0 && F.__version !== b.version) {
      X(F, b, v);
      return;
    }
    t.bindTexture(s.TEXTURE_CUBE_MAP, F.__webglTexture, s.TEXTURE0 + v);
  }
  const W = {
    1e3: s.REPEAT,
    1001: s.CLAMP_TO_EDGE,
    1002: s.MIRRORED_REPEAT
  }, oe = {
    1003: s.NEAREST,
    1004: s.NEAREST_MIPMAP_NEAREST,
    1005: s.NEAREST_MIPMAP_LINEAR,
    1006: s.LINEAR,
    1007: s.LINEAR_MIPMAP_NEAREST,
    1008: s.LINEAR_MIPMAP_LINEAR
  }, he = {
    512: s.NEVER,
    519: s.ALWAYS,
    513: s.LESS,
    515: s.LEQUAL,
    514: s.EQUAL,
    518: s.GEQUAL,
    516: s.GREATER,
    517: s.NOTEQUAL
  };
  function ve(b, v) {
    if (v.type === 1015 && e.has("OES_texture_float_linear") === !1 && (v.magFilter === 1006 || v.magFilter === 1007 || v.magFilter === 1005 || v.magFilter === 1008 || v.minFilter === 1006 || v.minFilter === 1007 || v.minFilter === 1005 || v.minFilter === 1008) && console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."), s.texParameteri(b, s.TEXTURE_WRAP_S, W[v.wrapS]), s.texParameteri(b, s.TEXTURE_WRAP_T, W[v.wrapT]), (b === s.TEXTURE_3D || b === s.TEXTURE_2D_ARRAY) && s.texParameteri(b, s.TEXTURE_WRAP_R, W[v.wrapR]), s.texParameteri(b, s.TEXTURE_MAG_FILTER, oe[v.magFilter]), s.texParameteri(b, s.TEXTURE_MIN_FILTER, oe[v.minFilter]), v.compareFunction && (s.texParameteri(b, s.TEXTURE_COMPARE_MODE, s.COMPARE_REF_TO_TEXTURE), s.texParameteri(b, s.TEXTURE_COMPARE_FUNC, he[v.compareFunction])), e.has("EXT_texture_filter_anisotropic") === !0) {
      if (v.magFilter === 1003 || v.minFilter !== 1005 && v.minFilter !== 1008 || v.type === 1015 && e.has("OES_texture_float_linear") === !1) return;
      if (v.anisotropy > 1 || n.get(v).__currentAnisotropy) {
        const F = e.get("EXT_texture_filter_anisotropic");
        s.texParameterf(b, F.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(v.anisotropy, i.getMaxAnisotropy())), n.get(v).__currentAnisotropy = v.anisotropy;
      }
    }
  }
  function ke(b, v) {
    let F = !1;
    b.__webglInit === void 0 && (b.__webglInit = !0, v.addEventListener("dispose", L));
    const V = v.source;
    let ee = d.get(V);
    ee === void 0 && (ee = {}, d.set(V, ee));
    const Y = O(v);
    if (Y !== b.__cacheKey) {
      ee[Y] === void 0 && (ee[Y] = {
        texture: s.createTexture(),
        usedTimes: 0
      }, a.memory.textures++, F = !0), ee[Y].usedTimes++;
      const ye = ee[b.__cacheKey];
      ye !== void 0 && (ee[b.__cacheKey].usedTimes--, ye.usedTimes === 0 && N(v)), b.__cacheKey = Y, b.__webglTexture = ee[Y].texture;
    }
    return F;
  }
  function We(b, v, F) {
    let V = s.TEXTURE_2D;
    (v.isDataArrayTexture || v.isCompressedArrayTexture) && (V = s.TEXTURE_2D_ARRAY), v.isData3DTexture && (V = s.TEXTURE_3D);
    const ee = ke(b, v), Y = v.source;
    t.bindTexture(V, b.__webglTexture, s.TEXTURE0 + F);
    const ye = n.get(Y);
    if (Y.version !== ye.__version || ee === !0) {
      t.activeTexture(s.TEXTURE0 + F);
      const ae = Ve.getPrimaries(Ve.workingColorSpace), me = v.colorSpace === vn ? null : Ve.getPrimaries(v.colorSpace), qe = v.colorSpace === vn || ae === me ? s.NONE : s.BROWSER_DEFAULT_WEBGL;
      s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL, v.flipY), s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL, v.premultiplyAlpha), s.pixelStorei(s.UNPACK_ALIGNMENT, v.unpackAlignment), s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL, qe);
      let ie = _(v.image, !1, i.maxTextureSize);
      ie = Ae(v, ie);
      const _e = r.convert(v.format, v.colorSpace), Pe = r.convert(v.type);
      let Le = T(v.internalFormat, _e, Pe, v.colorSpace, v.isVideoTexture);
      ve(V, v);
      let xe;
      const He = v.mipmaps, De = v.isVideoTexture !== !0, it = ye.__version === void 0 || ee === !0, I = Y.dataReady, ue = A(v, ie);
      if (v.isDepthTexture)
        Le = y(v.format === 1027, v.type), it && (De ? t.texStorage2D(s.TEXTURE_2D, 1, Le, ie.width, ie.height) : t.texImage2D(s.TEXTURE_2D, 0, Le, ie.width, ie.height, 0, _e, Pe, null));
      else if (v.isDataTexture)
        if (He.length > 0) {
          De && it && t.texStorage2D(s.TEXTURE_2D, ue, Le, He[0].width, He[0].height);
          for (let H = 0, $ = He.length; H < $; H++)
            xe = He[H], De ? I && t.texSubImage2D(s.TEXTURE_2D, H, 0, 0, xe.width, xe.height, _e, Pe, xe.data) : t.texImage2D(s.TEXTURE_2D, H, Le, xe.width, xe.height, 0, _e, Pe, xe.data);
          v.generateMipmaps = !1;
        } else
          De ? (it && t.texStorage2D(s.TEXTURE_2D, ue, Le, ie.width, ie.height), I && t.texSubImage2D(s.TEXTURE_2D, 0, 0, 0, ie.width, ie.height, _e, Pe, ie.data)) : t.texImage2D(s.TEXTURE_2D, 0, Le, ie.width, ie.height, 0, _e, Pe, ie.data);
      else if (v.isCompressedTexture)
        if (v.isCompressedArrayTexture) {
          De && it && t.texStorage3D(s.TEXTURE_2D_ARRAY, ue, Le, He[0].width, He[0].height, ie.depth);
          for (let H = 0, $ = He.length; H < $; H++)
            if (xe = He[H], v.format !== 1023)
              if (_e !== null)
                if (De) {
                  if (I)
                    if (v.layerUpdates.size > 0) {
                      const ce = Pa(xe.width, xe.height, v.format, v.type);
                      for (const de of v.layerUpdates) {
                        const Xe = xe.data.subarray(
                          de * ce / xe.data.BYTES_PER_ELEMENT,
                          (de + 1) * ce / xe.data.BYTES_PER_ELEMENT
                        );
                        t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY, H, 0, 0, de, xe.width, xe.height, 1, _e, Xe, 0, 0);
                      }
                      v.clearLayerUpdates();
                    } else
                      t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY, H, 0, 0, 0, xe.width, xe.height, ie.depth, _e, xe.data, 0, 0);
                } else
                  t.compressedTexImage3D(s.TEXTURE_2D_ARRAY, H, Le, xe.width, xe.height, ie.depth, 0, xe.data, 0, 0);
              else
                console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");
            else
              De ? I && t.texSubImage3D(s.TEXTURE_2D_ARRAY, H, 0, 0, 0, xe.width, xe.height, ie.depth, _e, Pe, xe.data) : t.texImage3D(s.TEXTURE_2D_ARRAY, H, Le, xe.width, xe.height, ie.depth, 0, _e, Pe, xe.data);
        } else {
          De && it && t.texStorage2D(s.TEXTURE_2D, ue, Le, He[0].width, He[0].height);
          for (let H = 0, $ = He.length; H < $; H++)
            xe = He[H], v.format !== 1023 ? _e !== null ? De ? I && t.compressedTexSubImage2D(s.TEXTURE_2D, H, 0, 0, xe.width, xe.height, _e, xe.data) : t.compressedTexImage2D(s.TEXTURE_2D, H, Le, xe.width, xe.height, 0, xe.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : De ? I && t.texSubImage2D(s.TEXTURE_2D, H, 0, 0, xe.width, xe.height, _e, Pe, xe.data) : t.texImage2D(s.TEXTURE_2D, H, Le, xe.width, xe.height, 0, _e, Pe, xe.data);
        }
      else if (v.isDataArrayTexture)
        if (De) {
          if (it && t.texStorage3D(s.TEXTURE_2D_ARRAY, ue, Le, ie.width, ie.height, ie.depth), I)
            if (v.layerUpdates.size > 0) {
              const H = Pa(ie.width, ie.height, v.format, v.type);
              for (const $ of v.layerUpdates) {
                const ce = ie.data.subarray(
                  $ * H / ie.data.BYTES_PER_ELEMENT,
                  ($ + 1) * H / ie.data.BYTES_PER_ELEMENT
                );
                t.texSubImage3D(s.TEXTURE_2D_ARRAY, 0, 0, 0, $, ie.width, ie.height, 1, _e, Pe, ce);
              }
              v.clearLayerUpdates();
            } else
              t.texSubImage3D(s.TEXTURE_2D_ARRAY, 0, 0, 0, 0, ie.width, ie.height, ie.depth, _e, Pe, ie.data);
        } else
          t.texImage3D(s.TEXTURE_2D_ARRAY, 0, Le, ie.width, ie.height, ie.depth, 0, _e, Pe, ie.data);
      else if (v.isData3DTexture)
        De ? (it && t.texStorage3D(s.TEXTURE_3D, ue, Le, ie.width, ie.height, ie.depth), I && t.texSubImage3D(s.TEXTURE_3D, 0, 0, 0, 0, ie.width, ie.height, ie.depth, _e, Pe, ie.data)) : t.texImage3D(s.TEXTURE_3D, 0, Le, ie.width, ie.height, ie.depth, 0, _e, Pe, ie.data);
      else if (v.isFramebufferTexture) {
        if (it)
          if (De)
            t.texStorage2D(s.TEXTURE_2D, ue, Le, ie.width, ie.height);
          else {
            let H = ie.width, $ = ie.height;
            for (let ce = 0; ce < ue; ce++)
              t.texImage2D(s.TEXTURE_2D, ce, Le, H, $, 0, _e, Pe, null), H >>= 1, $ >>= 1;
          }
      } else if (He.length > 0) {
        if (De && it) {
          const H = pe(He[0]);
          t.texStorage2D(s.TEXTURE_2D, ue, Le, H.width, H.height);
        }
        for (let H = 0, $ = He.length; H < $; H++)
          xe = He[H], De ? I && t.texSubImage2D(s.TEXTURE_2D, H, 0, 0, _e, Pe, xe) : t.texImage2D(s.TEXTURE_2D, H, Le, _e, Pe, xe);
        v.generateMipmaps = !1;
      } else if (De) {
        if (it) {
          const H = pe(ie);
          t.texStorage2D(s.TEXTURE_2D, ue, Le, H.width, H.height);
        }
        I && t.texSubImage2D(s.TEXTURE_2D, 0, 0, 0, _e, Pe, ie);
      } else
        t.texImage2D(s.TEXTURE_2D, 0, Le, _e, Pe, ie);
      p(v) && m(V), ye.__version = Y.version, v.onUpdate && v.onUpdate(v);
    }
    b.__version = v.version;
  }
  function X(b, v, F) {
    if (v.image.length !== 6) return;
    const V = ke(b, v), ee = v.source;
    t.bindTexture(s.TEXTURE_CUBE_MAP, b.__webglTexture, s.TEXTURE0 + F);
    const Y = n.get(ee);
    if (ee.version !== Y.__version || V === !0) {
      t.activeTexture(s.TEXTURE0 + F);
      const ye = Ve.getPrimaries(Ve.workingColorSpace), ae = v.colorSpace === vn ? null : Ve.getPrimaries(v.colorSpace), me = v.colorSpace === vn || ye === ae ? s.NONE : s.BROWSER_DEFAULT_WEBGL;
      s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL, v.flipY), s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL, v.premultiplyAlpha), s.pixelStorei(s.UNPACK_ALIGNMENT, v.unpackAlignment), s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL, me);
      const qe = v.isCompressedTexture || v.image[0].isCompressedTexture, ie = v.image[0] && v.image[0].isDataTexture, _e = [];
      for (let $ = 0; $ < 6; $++)
        !qe && !ie ? _e[$] = _(v.image[$], !0, i.maxCubemapSize) : _e[$] = ie ? v.image[$].image : v.image[$], _e[$] = Ae(v, _e[$]);
      const Pe = _e[0], Le = r.convert(v.format, v.colorSpace), xe = r.convert(v.type), He = T(v.internalFormat, Le, xe, v.colorSpace), De = v.isVideoTexture !== !0, it = Y.__version === void 0 || V === !0, I = ee.dataReady;
      let ue = A(v, Pe);
      ve(s.TEXTURE_CUBE_MAP, v);
      let H;
      if (qe) {
        De && it && t.texStorage2D(s.TEXTURE_CUBE_MAP, ue, He, Pe.width, Pe.height);
        for (let $ = 0; $ < 6; $++) {
          H = _e[$].mipmaps;
          for (let ce = 0; ce < H.length; ce++) {
            const de = H[ce];
            v.format !== 1023 ? Le !== null ? De ? I && t.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + $, ce, 0, 0, de.width, de.height, Le, de.data) : t.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + $, ce, He, de.width, de.height, 0, de.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()") : De ? I && t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + $, ce, 0, 0, de.width, de.height, Le, xe, de.data) : t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + $, ce, He, de.width, de.height, 0, Le, xe, de.data);
          }
        }
      } else {
        if (H = v.mipmaps, De && it) {
          H.length > 0 && ue++;
          const $ = pe(_e[0]);
          t.texStorage2D(s.TEXTURE_CUBE_MAP, ue, He, $.width, $.height);
        }
        for (let $ = 0; $ < 6; $++)
          if (ie) {
            De ? I && t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + $, 0, 0, 0, _e[$].width, _e[$].height, Le, xe, _e[$].data) : t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + $, 0, He, _e[$].width, _e[$].height, 0, Le, xe, _e[$].data);
            for (let ce = 0; ce < H.length; ce++) {
              const Xe = H[ce].image[$].image;
              De ? I && t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + $, ce + 1, 0, 0, Xe.width, Xe.height, Le, xe, Xe.data) : t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + $, ce + 1, He, Xe.width, Xe.height, 0, Le, xe, Xe.data);
            }
          } else {
            De ? I && t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + $, 0, 0, 0, Le, xe, _e[$]) : t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + $, 0, He, Le, xe, _e[$]);
            for (let ce = 0; ce < H.length; ce++) {
              const de = H[ce];
              De ? I && t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + $, ce + 1, 0, 0, Le, xe, de.image[$]) : t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + $, ce + 1, He, Le, xe, de.image[$]);
            }
          }
      }
      p(v) && m(s.TEXTURE_CUBE_MAP), Y.__version = ee.version, v.onUpdate && v.onUpdate(v);
    }
    b.__version = v.version;
  }
  function te(b, v, F, V, ee, Y) {
    const ye = r.convert(F.format, F.colorSpace), ae = r.convert(F.type), me = T(F.internalFormat, ye, ae, F.colorSpace);
    if (!n.get(v).__hasExternalTextures) {
      const ie = Math.max(1, v.width >> Y), _e = Math.max(1, v.height >> Y);
      ee === s.TEXTURE_3D || ee === s.TEXTURE_2D_ARRAY ? t.texImage3D(ee, Y, me, ie, _e, v.depth, 0, ye, ae, null) : t.texImage2D(ee, Y, me, ie, _e, 0, ye, ae, null);
    }
    t.bindFramebuffer(s.FRAMEBUFFER, b), Z(v) ? o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER, V, ee, n.get(F).__webglTexture, 0, q(v)) : (ee === s.TEXTURE_2D || ee >= s.TEXTURE_CUBE_MAP_POSITIVE_X && ee <= s.TEXTURE_CUBE_MAP_NEGATIVE_Z) && s.framebufferTexture2D(s.FRAMEBUFFER, V, ee, n.get(F).__webglTexture, Y), t.bindFramebuffer(s.FRAMEBUFFER, null);
  }
  function ge(b, v, F) {
    if (s.bindRenderbuffer(s.RENDERBUFFER, b), v.depthBuffer) {
      const V = v.depthTexture, ee = V && V.isDepthTexture ? V.type : null, Y = y(v.stencilBuffer, ee), ye = v.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT, ae = q(v);
      Z(v) ? o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER, ae, Y, v.width, v.height) : F ? s.renderbufferStorageMultisample(s.RENDERBUFFER, ae, Y, v.width, v.height) : s.renderbufferStorage(s.RENDERBUFFER, Y, v.width, v.height), s.framebufferRenderbuffer(s.FRAMEBUFFER, ye, s.RENDERBUFFER, b);
    } else {
      const V = v.textures;
      for (let ee = 0; ee < V.length; ee++) {
        const Y = V[ee], ye = r.convert(Y.format, Y.colorSpace), ae = r.convert(Y.type), me = T(Y.internalFormat, ye, ae, Y.colorSpace), qe = q(v);
        F && Z(v) === !1 ? s.renderbufferStorageMultisample(s.RENDERBUFFER, qe, me, v.width, v.height) : Z(v) ? o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER, qe, me, v.width, v.height) : s.renderbufferStorage(s.RENDERBUFFER, me, v.width, v.height);
      }
    }
    s.bindRenderbuffer(s.RENDERBUFFER, null);
  }
  function fe(b, v) {
    if (v && v.isWebGLCubeRenderTarget) throw new Error("Depth Texture with cube render targets is not supported");
    if (t.bindFramebuffer(s.FRAMEBUFFER, b), !(v.depthTexture && v.depthTexture.isDepthTexture))
      throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");
    (!n.get(v.depthTexture).__webglTexture || v.depthTexture.image.width !== v.width || v.depthTexture.image.height !== v.height) && (v.depthTexture.image.width = v.width, v.depthTexture.image.height = v.height, v.depthTexture.needsUpdate = !0), U(v.depthTexture, 0);
    const V = n.get(v.depthTexture).__webglTexture, ee = q(v);
    if (v.depthTexture.format === 1026)
      Z(v) ? o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER, s.DEPTH_ATTACHMENT, s.TEXTURE_2D, V, 0, ee) : s.framebufferTexture2D(s.FRAMEBUFFER, s.DEPTH_ATTACHMENT, s.TEXTURE_2D, V, 0);
    else if (v.depthTexture.format === 1027)
      Z(v) ? o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER, s.DEPTH_STENCIL_ATTACHMENT, s.TEXTURE_2D, V, 0, ee) : s.framebufferTexture2D(s.FRAMEBUFFER, s.DEPTH_STENCIL_ATTACHMENT, s.TEXTURE_2D, V, 0);
    else
      throw new Error("Unknown depthTexture format");
  }
  function Ce(b) {
    const v = n.get(b), F = b.isWebGLCubeRenderTarget === !0;
    if (v.__boundDepthTexture !== b.depthTexture) {
      const V = b.depthTexture;
      if (v.__depthDisposeCallback && v.__depthDisposeCallback(), V) {
        const ee = () => {
          delete v.__boundDepthTexture, delete v.__depthDisposeCallback, V.removeEventListener("dispose", ee);
        };
        V.addEventListener("dispose", ee), v.__depthDisposeCallback = ee;
      }
      v.__boundDepthTexture = V;
    }
    if (b.depthTexture && !v.__autoAllocateDepthBuffer) {
      if (F) throw new Error("target.depthTexture not supported in Cube render targets");
      fe(v.__webglFramebuffer, b);
    } else if (F) {
      v.__webglDepthbuffer = [];
      for (let V = 0; V < 6; V++)
        if (t.bindFramebuffer(s.FRAMEBUFFER, v.__webglFramebuffer[V]), v.__webglDepthbuffer[V] === void 0)
          v.__webglDepthbuffer[V] = s.createRenderbuffer(), ge(v.__webglDepthbuffer[V], b, !1);
        else {
          const ee = b.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT, Y = v.__webglDepthbuffer[V];
          s.bindRenderbuffer(s.RENDERBUFFER, Y), s.framebufferRenderbuffer(s.FRAMEBUFFER, ee, s.RENDERBUFFER, Y);
        }
    } else if (t.bindFramebuffer(s.FRAMEBUFFER, v.__webglFramebuffer), v.__webglDepthbuffer === void 0)
      v.__webglDepthbuffer = s.createRenderbuffer(), ge(v.__webglDepthbuffer, b, !1);
    else {
      const V = b.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT, ee = v.__webglDepthbuffer;
      s.bindRenderbuffer(s.RENDERBUFFER, ee), s.framebufferRenderbuffer(s.FRAMEBUFFER, V, s.RENDERBUFFER, ee);
    }
    t.bindFramebuffer(s.FRAMEBUFFER, null);
  }
  function we(b, v, F) {
    const V = n.get(b);
    v !== void 0 && te(V.__webglFramebuffer, b, b.texture, s.COLOR_ATTACHMENT0, s.TEXTURE_2D, 0), F !== void 0 && Ce(b);
  }
  function Oe(b) {
    const v = b.texture, F = n.get(b), V = n.get(v);
    b.addEventListener("dispose", w);
    const ee = b.textures, Y = b.isWebGLCubeRenderTarget === !0, ye = ee.length > 1;
    if (ye || (V.__webglTexture === void 0 && (V.__webglTexture = s.createTexture()), V.__version = v.version, a.memory.textures++), Y) {
      F.__webglFramebuffer = [];
      for (let ae = 0; ae < 6; ae++)
        if (v.mipmaps && v.mipmaps.length > 0) {
          F.__webglFramebuffer[ae] = [];
          for (let me = 0; me < v.mipmaps.length; me++)
            F.__webglFramebuffer[ae][me] = s.createFramebuffer();
        } else
          F.__webglFramebuffer[ae] = s.createFramebuffer();
    } else {
      if (v.mipmaps && v.mipmaps.length > 0) {
        F.__webglFramebuffer = [];
        for (let ae = 0; ae < v.mipmaps.length; ae++)
          F.__webglFramebuffer[ae] = s.createFramebuffer();
      } else
        F.__webglFramebuffer = s.createFramebuffer();
      if (ye)
        for (let ae = 0, me = ee.length; ae < me; ae++) {
          const qe = n.get(ee[ae]);
          qe.__webglTexture === void 0 && (qe.__webglTexture = s.createTexture(), a.memory.textures++);
        }
      if (b.samples > 0 && Z(b) === !1) {
        F.__webglMultisampledFramebuffer = s.createFramebuffer(), F.__webglColorRenderbuffer = [], t.bindFramebuffer(s.FRAMEBUFFER, F.__webglMultisampledFramebuffer);
        for (let ae = 0; ae < ee.length; ae++) {
          const me = ee[ae];
          F.__webglColorRenderbuffer[ae] = s.createRenderbuffer(), s.bindRenderbuffer(s.RENDERBUFFER, F.__webglColorRenderbuffer[ae]);
          const qe = r.convert(me.format, me.colorSpace), ie = r.convert(me.type), _e = T(me.internalFormat, qe, ie, me.colorSpace, b.isXRRenderTarget === !0), Pe = q(b);
          s.renderbufferStorageMultisample(s.RENDERBUFFER, Pe, _e, b.width, b.height), s.framebufferRenderbuffer(s.FRAMEBUFFER, s.COLOR_ATTACHMENT0 + ae, s.RENDERBUFFER, F.__webglColorRenderbuffer[ae]);
        }
        s.bindRenderbuffer(s.RENDERBUFFER, null), b.depthBuffer && (F.__webglDepthRenderbuffer = s.createRenderbuffer(), ge(F.__webglDepthRenderbuffer, b, !0)), t.bindFramebuffer(s.FRAMEBUFFER, null);
      }
    }
    if (Y) {
      t.bindTexture(s.TEXTURE_CUBE_MAP, V.__webglTexture), ve(s.TEXTURE_CUBE_MAP, v);
      for (let ae = 0; ae < 6; ae++)
        if (v.mipmaps && v.mipmaps.length > 0)
          for (let me = 0; me < v.mipmaps.length; me++)
            te(F.__webglFramebuffer[ae][me], b, v, s.COLOR_ATTACHMENT0, s.TEXTURE_CUBE_MAP_POSITIVE_X + ae, me);
        else
          te(F.__webglFramebuffer[ae], b, v, s.COLOR_ATTACHMENT0, s.TEXTURE_CUBE_MAP_POSITIVE_X + ae, 0);
      p(v) && m(s.TEXTURE_CUBE_MAP), t.unbindTexture();
    } else if (ye) {
      for (let ae = 0, me = ee.length; ae < me; ae++) {
        const qe = ee[ae], ie = n.get(qe);
        t.bindTexture(s.TEXTURE_2D, ie.__webglTexture), ve(s.TEXTURE_2D, qe), te(F.__webglFramebuffer, b, qe, s.COLOR_ATTACHMENT0 + ae, s.TEXTURE_2D, 0), p(qe) && m(s.TEXTURE_2D);
      }
      t.unbindTexture();
    } else {
      let ae = s.TEXTURE_2D;
      if ((b.isWebGL3DRenderTarget || b.isWebGLArrayRenderTarget) && (ae = b.isWebGL3DRenderTarget ? s.TEXTURE_3D : s.TEXTURE_2D_ARRAY), t.bindTexture(ae, V.__webglTexture), ve(ae, v), v.mipmaps && v.mipmaps.length > 0)
        for (let me = 0; me < v.mipmaps.length; me++)
          te(F.__webglFramebuffer[me], b, v, s.COLOR_ATTACHMENT0, ae, me);
      else
        te(F.__webglFramebuffer, b, v, s.COLOR_ATTACHMENT0, ae, 0);
      p(v) && m(ae), t.unbindTexture();
    }
    b.depthBuffer && Ce(b);
  }
  function Ke(b) {
    const v = b.textures;
    for (let F = 0, V = v.length; F < V; F++) {
      const ee = v[F];
      if (p(ee)) {
        const Y = b.isWebGLCubeRenderTarget ? s.TEXTURE_CUBE_MAP : s.TEXTURE_2D, ye = n.get(ee).__webglTexture;
        t.bindTexture(Y, ye), m(Y), t.unbindTexture();
      }
    }
  }
  const ze = [], M = [];
  function J(b) {
    if (b.samples > 0) {
      if (Z(b) === !1) {
        const v = b.textures, F = b.width, V = b.height;
        let ee = s.COLOR_BUFFER_BIT;
        const Y = b.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT, ye = n.get(b), ae = v.length > 1;
        if (ae)
          for (let me = 0; me < v.length; me++)
            t.bindFramebuffer(s.FRAMEBUFFER, ye.__webglMultisampledFramebuffer), s.framebufferRenderbuffer(s.FRAMEBUFFER, s.COLOR_ATTACHMENT0 + me, s.RENDERBUFFER, null), t.bindFramebuffer(s.FRAMEBUFFER, ye.__webglFramebuffer), s.framebufferTexture2D(s.DRAW_FRAMEBUFFER, s.COLOR_ATTACHMENT0 + me, s.TEXTURE_2D, null, 0);
        t.bindFramebuffer(s.READ_FRAMEBUFFER, ye.__webglMultisampledFramebuffer), t.bindFramebuffer(s.DRAW_FRAMEBUFFER, ye.__webglFramebuffer);
        for (let me = 0; me < v.length; me++) {
          if (b.resolveDepthBuffer && (b.depthBuffer && (ee |= s.DEPTH_BUFFER_BIT), b.stencilBuffer && b.resolveStencilBuffer && (ee |= s.STENCIL_BUFFER_BIT)), ae) {
            s.framebufferRenderbuffer(s.READ_FRAMEBUFFER, s.COLOR_ATTACHMENT0, s.RENDERBUFFER, ye.__webglColorRenderbuffer[me]);
            const qe = n.get(v[me]).__webglTexture;
            s.framebufferTexture2D(s.DRAW_FRAMEBUFFER, s.COLOR_ATTACHMENT0, s.TEXTURE_2D, qe, 0);
          }
          s.blitFramebuffer(0, 0, F, V, 0, 0, F, V, ee, s.NEAREST), c === !0 && (ze.length = 0, M.length = 0, ze.push(s.COLOR_ATTACHMENT0 + me), b.depthBuffer && b.resolveDepthBuffer === !1 && (ze.push(Y), M.push(Y), s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER, M)), s.invalidateFramebuffer(s.READ_FRAMEBUFFER, ze));
        }
        if (t.bindFramebuffer(s.READ_FRAMEBUFFER, null), t.bindFramebuffer(s.DRAW_FRAMEBUFFER, null), ae)
          for (let me = 0; me < v.length; me++) {
            t.bindFramebuffer(s.FRAMEBUFFER, ye.__webglMultisampledFramebuffer), s.framebufferRenderbuffer(s.FRAMEBUFFER, s.COLOR_ATTACHMENT0 + me, s.RENDERBUFFER, ye.__webglColorRenderbuffer[me]);
            const qe = n.get(v[me]).__webglTexture;
            t.bindFramebuffer(s.FRAMEBUFFER, ye.__webglFramebuffer), s.framebufferTexture2D(s.DRAW_FRAMEBUFFER, s.COLOR_ATTACHMENT0 + me, s.TEXTURE_2D, qe, 0);
          }
        t.bindFramebuffer(s.DRAW_FRAMEBUFFER, ye.__webglMultisampledFramebuffer);
      } else if (b.depthBuffer && b.resolveDepthBuffer === !1 && c) {
        const v = b.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT;
        s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER, [v]);
      }
    }
  }
  function q(b) {
    return Math.min(i.maxSamples, b.samples);
  }
  function Z(b) {
    const v = n.get(b);
    return b.samples > 0 && e.has("WEBGL_multisampled_render_to_texture") === !0 && v.__useRenderToTexture !== !1;
  }
  function j(b) {
    const v = a.render.frame;
    h.get(b) !== v && (h.set(b, v), b.update());
  }
  function Ae(b, v) {
    const F = b.colorSpace, V = b.format, ee = b.type;
    return b.isCompressedTexture === !0 || b.isVideoTexture === !0 || F !== xt && F !== vn && (Ve.getTransfer(F) === rt ? (V !== 1023 || ee !== 1009) && console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.") : console.error("THREE.WebGLTextures: Unsupported texture color space:", F)), v;
  }
  function pe(b) {
    return typeof HTMLImageElement < "u" && b instanceof HTMLImageElement ? (l.width = b.naturalWidth || b.width, l.height = b.naturalHeight || b.height) : typeof VideoFrame < "u" && b instanceof VideoFrame ? (l.width = b.displayWidth, l.height = b.displayHeight) : (l.width = b.width, l.height = b.height), l;
  }
  this.allocateTextureUnit = B, this.resetTextureUnits = E, this.setTexture2D = U, this.setTexture2DArray = Q, this.setTexture3D = k, this.setTextureCube = ne, this.rebindTextures = we, this.setupRenderTarget = Oe, this.updateRenderTargetMipmap = Ke, this.updateMultisampleRenderTarget = J, this.setupDepthRenderbuffer = Ce, this.setupFrameBufferTexture = te, this.useMultisampledRTT = Z;
}
function lf(s, e) {
  function t(n, i = vn) {
    let r;
    const a = Ve.getTransfer(i);
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
      if (a === rt)
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
        if (n === 36196 || n === 37492) return a === rt ? r.COMPRESSED_SRGB8_ETC2 : r.COMPRESSED_RGB8_ETC2;
        if (n === 37496) return a === rt ? r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : r.COMPRESSED_RGBA8_ETC2_EAC;
      } else
        return null;
    if (n === 37808 || n === 37809 || n === 37810 || n === 37811 || n === 37812 || n === 37813 || n === 37814 || n === 37815 || n === 37816 || n === 37817 || n === 37818 || n === 37819 || n === 37820 || n === 37821)
      if (r = e.get("WEBGL_compressed_texture_astc"), r !== null) {
        if (n === 37808) return a === rt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : r.COMPRESSED_RGBA_ASTC_4x4_KHR;
        if (n === 37809) return a === rt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR : r.COMPRESSED_RGBA_ASTC_5x4_KHR;
        if (n === 37810) return a === rt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR : r.COMPRESSED_RGBA_ASTC_5x5_KHR;
        if (n === 37811) return a === rt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR : r.COMPRESSED_RGBA_ASTC_6x5_KHR;
        if (n === 37812) return a === rt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR : r.COMPRESSED_RGBA_ASTC_6x6_KHR;
        if (n === 37813) return a === rt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR : r.COMPRESSED_RGBA_ASTC_8x5_KHR;
        if (n === 37814) return a === rt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR : r.COMPRESSED_RGBA_ASTC_8x6_KHR;
        if (n === 37815) return a === rt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR : r.COMPRESSED_RGBA_ASTC_8x8_KHR;
        if (n === 37816) return a === rt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR : r.COMPRESSED_RGBA_ASTC_10x5_KHR;
        if (n === 37817) return a === rt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR : r.COMPRESSED_RGBA_ASTC_10x6_KHR;
        if (n === 37818) return a === rt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR : r.COMPRESSED_RGBA_ASTC_10x8_KHR;
        if (n === 37819) return a === rt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR : r.COMPRESSED_RGBA_ASTC_10x10_KHR;
        if (n === 37820) return a === rt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR : r.COMPRESSED_RGBA_ASTC_12x10_KHR;
        if (n === 37821) return a === rt ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR : r.COMPRESSED_RGBA_ASTC_12x12_KHR;
      } else
        return null;
    if (n === 36492 || n === 36494 || n === 36495)
      if (r = e.get("EXT_texture_compression_bptc"), r !== null) {
        if (n === 36492) return a === rt ? r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT : r.COMPRESSED_RGBA_BPTC_UNORM_EXT;
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
class hf extends Rt {
  constructor(e = []) {
    super(), this.isArrayCamera = !0, this.cameras = e;
  }
}
class Ct extends at {
  constructor() {
    super(), this.isGroup = !0, this.type = "Group";
  }
}
const uf = { type: "move" };
class nr {
  constructor() {
    this._targetRay = null, this._grip = null, this._hand = null;
  }
  getHandSpace() {
    return this._hand === null && (this._hand = new Ct(), this._hand.matrixAutoUpdate = !1, this._hand.visible = !1, this._hand.joints = {}, this._hand.inputState = { pinching: !1 }), this._hand;
  }
  getTargetRaySpace() {
    return this._targetRay === null && (this._targetRay = new Ct(), this._targetRay.matrixAutoUpdate = !1, this._targetRay.visible = !1, this._targetRay.hasLinearVelocity = !1, this._targetRay.linearVelocity = new C(), this._targetRay.hasAngularVelocity = !1, this._targetRay.angularVelocity = new C()), this._targetRay;
  }
  getGripSpace() {
    return this._grip === null && (this._grip = new Ct(), this._grip.matrixAutoUpdate = !1, this._grip.visible = !1, this._grip.hasLinearVelocity = !1, this._grip.linearVelocity = new C(), this._grip.hasAngularVelocity = !1, this._grip.angularVelocity = new C()), this._grip;
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
          const p = t.getJointPose(_, n), m = this._getHandJoint(l, _);
          p !== null && (m.matrix.fromArray(p.transform.matrix), m.matrix.decompose(m.position, m.rotation, m.scale), m.matrixWorldNeedsUpdate = !0, m.jointRadius = p.radius), m.visible = p !== null;
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
      o !== null && (i = t.getPose(e.targetRaySpace, n), i === null && r !== null && (i = r), i !== null && (o.matrix.fromArray(i.transform.matrix), o.matrix.decompose(o.position, o.rotation, o.scale), o.matrixWorldNeedsUpdate = !0, i.linearVelocity ? (o.hasLinearVelocity = !0, o.linearVelocity.copy(i.linearVelocity)) : o.hasLinearVelocity = !1, i.angularVelocity ? (o.hasAngularVelocity = !0, o.angularVelocity.copy(i.angularVelocity)) : o.hasAngularVelocity = !1, this.dispatchEvent(uf)));
    }
    return o !== null && (o.visible = i !== null), c !== null && (c.visible = r !== null), l !== null && (l.visible = a !== null), this;
  }
  // private method
  _getHandJoint(e, t) {
    if (e.joints[t.jointName] === void 0) {
      const n = new Ct();
      n.matrixAutoUpdate = !1, n.visible = !1, e.joints[t.jointName] = n, e.add(n);
    }
    return e.joints[t.jointName];
  }
}
const df = `
void main() {

	gl_Position = vec4( position, 1.0 );

}`, ff = `
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
class pf {
  constructor() {
    this.texture = null, this.mesh = null, this.depthNear = 0, this.depthFar = 0;
  }
  init(e, t, n) {
    if (this.texture === null) {
      const i = new gt(), r = e.properties.get(i);
      r.__webglTexture = t.texture, (t.depthNear != n.depthNear || t.depthFar != n.depthFar) && (this.depthNear = t.depthNear, this.depthFar = t.depthFar), this.texture = i;
    }
  }
  getMesh(e) {
    if (this.texture !== null && this.mesh === null) {
      const t = e.cameras[0].viewport, n = new Sn({
        vertexShader: df,
        fragmentShader: ff,
        uniforms: {
          depthColor: { value: this.texture },
          depthWidth: { value: t.z },
          depthHeight: { value: t.w }
        }
      });
      this.mesh = new Qe(new li(20, 20), n);
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
class mf extends Un {
  constructor(e, t) {
    super();
    const n = this;
    let i = null, r = 1, a = null, o = "local-floor", c = 1, l = null, h = null, u = null, d = null, f = null, g = null;
    const _ = new pf(), p = t.getContextAttributes();
    let m = null, T = null;
    const y = [], A = [], L = new Be();
    let w = null;
    const R = new Rt();
    R.layers.enable(1), R.viewport = new Ye();
    const N = new Rt();
    N.layers.enable(2), N.viewport = new Ye();
    const K = [R, N], x = new hf();
    x.layers.enable(1), x.layers.enable(2);
    let E = null, B = null;
    this.cameraAutoUpdate = !0, this.enabled = !1, this.isPresenting = !1, this.getController = function(X) {
      let te = y[X];
      return te === void 0 && (te = new nr(), y[X] = te), te.getTargetRaySpace();
    }, this.getControllerGrip = function(X) {
      let te = y[X];
      return te === void 0 && (te = new nr(), y[X] = te), te.getGripSpace();
    }, this.getHand = function(X) {
      let te = y[X];
      return te === void 0 && (te = new nr(), y[X] = te), te.getHandSpace();
    };
    function O(X) {
      const te = A.indexOf(X.inputSource);
      if (te === -1)
        return;
      const ge = y[te];
      ge !== void 0 && (ge.update(X.inputSource, X.frame, l || a), ge.dispatchEvent({ type: X.type, data: X.inputSource }));
    }
    function U() {
      i.removeEventListener("select", O), i.removeEventListener("selectstart", O), i.removeEventListener("selectend", O), i.removeEventListener("squeeze", O), i.removeEventListener("squeezestart", O), i.removeEventListener("squeezeend", O), i.removeEventListener("end", U), i.removeEventListener("inputsourceschange", Q);
      for (let X = 0; X < y.length; X++) {
        const te = A[X];
        te !== null && (A[X] = null, y[X].disconnect(te));
      }
      E = null, B = null, _.reset(), e.setRenderTarget(m), f = null, d = null, u = null, i = null, T = null, We.stop(), n.isPresenting = !1, e.setPixelRatio(w), e.setSize(L.width, L.height, !1), n.dispatchEvent({ type: "sessionend" });
    }
    this.setFramebufferScaleFactor = function(X) {
      r = X, n.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.");
    }, this.setReferenceSpaceType = function(X) {
      o = X, n.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.");
    }, this.getReferenceSpace = function() {
      return l || a;
    }, this.setReferenceSpace = function(X) {
      l = X;
    }, this.getBaseLayer = function() {
      return d !== null ? d : f;
    }, this.getBinding = function() {
      return u;
    }, this.getFrame = function() {
      return g;
    }, this.getSession = function() {
      return i;
    }, this.setSession = async function(X) {
      if (i = X, i !== null) {
        if (m = e.getRenderTarget(), i.addEventListener("select", O), i.addEventListener("selectstart", O), i.addEventListener("selectend", O), i.addEventListener("squeeze", O), i.addEventListener("squeezestart", O), i.addEventListener("squeezeend", O), i.addEventListener("end", U), i.addEventListener("inputsourceschange", Q), p.xrCompatible !== !0 && await t.makeXRCompatible(), w = e.getPixelRatio(), e.getSize(L), i.renderState.layers === void 0) {
          const te = {
            antialias: p.antialias,
            alpha: !0,
            depth: p.depth,
            stencil: p.stencil,
            framebufferScaleFactor: r
          };
          f = new XRWebGLLayer(i, t, te), i.updateRenderState({ baseLayer: f }), e.setPixelRatio(1), e.setSize(f.framebufferWidth, f.framebufferHeight, !1), T = new Nn(
            f.framebufferWidth,
            f.framebufferHeight,
            {
              format: 1023,
              type: 1009,
              colorSpace: e.outputColorSpace,
              stencilBuffer: p.stencil
            }
          );
        } else {
          let te = null, ge = null, fe = null;
          p.depth && (fe = p.stencil ? t.DEPTH24_STENCIL8 : t.DEPTH_COMPONENT24, te = p.stencil ? 1027 : 1026, ge = p.stencil ? 1020 : 1014);
          const Ce = {
            colorFormat: t.RGBA8,
            depthFormat: fe,
            scaleFactor: r
          };
          u = new XRWebGLBinding(i, t), d = u.createProjectionLayer(Ce), i.updateRenderState({ layers: [d] }), e.setPixelRatio(1), e.setSize(d.textureWidth, d.textureHeight, !1), T = new Nn(
            d.textureWidth,
            d.textureHeight,
            {
              format: 1023,
              type: 1009,
              depthTexture: new xo(d.textureWidth, d.textureHeight, ge, void 0, void 0, void 0, void 0, void 0, void 0, te),
              stencilBuffer: p.stencil,
              colorSpace: e.outputColorSpace,
              samples: p.antialias ? 4 : 0,
              resolveDepthBuffer: d.ignoreDepthValues === !1
            }
          );
        }
        T.isXRRenderTarget = !0, this.setFoveation(c), l = null, a = await i.requestReferenceSpace(o), We.setContext(i), We.start(), n.isPresenting = !0, n.dispatchEvent({ type: "sessionstart" });
      }
    }, this.getEnvironmentBlendMode = function() {
      if (i !== null)
        return i.environmentBlendMode;
    }, this.getDepthTexture = function() {
      return _.getDepthTexture();
    };
    function Q(X) {
      for (let te = 0; te < X.removed.length; te++) {
        const ge = X.removed[te], fe = A.indexOf(ge);
        fe >= 0 && (A[fe] = null, y[fe].disconnect(ge));
      }
      for (let te = 0; te < X.added.length; te++) {
        const ge = X.added[te];
        let fe = A.indexOf(ge);
        if (fe === -1) {
          for (let we = 0; we < y.length; we++)
            if (we >= A.length) {
              A.push(ge), fe = we;
              break;
            } else if (A[we] === null) {
              A[we] = ge, fe = we;
              break;
            }
          if (fe === -1) break;
        }
        const Ce = y[fe];
        Ce && Ce.connect(ge);
      }
    }
    const k = new C(), ne = new C();
    function W(X, te, ge) {
      k.setFromMatrixPosition(te.matrixWorld), ne.setFromMatrixPosition(ge.matrixWorld);
      const fe = k.distanceTo(ne), Ce = te.projectionMatrix.elements, we = ge.projectionMatrix.elements, Oe = Ce[14] / (Ce[10] - 1), Ke = Ce[14] / (Ce[10] + 1), ze = (Ce[9] + 1) / Ce[5], M = (Ce[9] - 1) / Ce[5], J = (Ce[8] - 1) / Ce[0], q = (we[8] + 1) / we[0], Z = Oe * J, j = Oe * q, Ae = fe / (-J + q), pe = Ae * -J;
      if (te.matrixWorld.decompose(X.position, X.quaternion, X.scale), X.translateX(pe), X.translateZ(Ae), X.matrixWorld.compose(X.position, X.quaternion, X.scale), X.matrixWorldInverse.copy(X.matrixWorld).invert(), Ce[10] === -1)
        X.projectionMatrix.copy(te.projectionMatrix), X.projectionMatrixInverse.copy(te.projectionMatrixInverse);
      else {
        const b = Oe + Ae, v = Ke + Ae, F = Z - pe, V = j + (fe - pe), ee = ze * Ke / v * b, Y = M * Ke / v * b;
        X.projectionMatrix.makePerspective(F, V, ee, Y, b, v), X.projectionMatrixInverse.copy(X.projectionMatrix).invert();
      }
    }
    function oe(X, te) {
      te === null ? X.matrixWorld.copy(X.matrix) : X.matrixWorld.multiplyMatrices(te.matrixWorld, X.matrix), X.matrixWorldInverse.copy(X.matrixWorld).invert();
    }
    this.updateCamera = function(X) {
      if (i === null) return;
      let te = X.near, ge = X.far;
      _.texture !== null && (_.depthNear > 0 && (te = _.depthNear), _.depthFar > 0 && (ge = _.depthFar)), x.near = N.near = R.near = te, x.far = N.far = R.far = ge, (E !== x.near || B !== x.far) && (i.updateRenderState({
        depthNear: x.near,
        depthFar: x.far
      }), E = x.near, B = x.far);
      const fe = X.parent, Ce = x.cameras;
      oe(x, fe);
      for (let we = 0; we < Ce.length; we++)
        oe(Ce[we], fe);
      Ce.length === 2 ? W(x, R, N) : x.projectionMatrix.copy(R.projectionMatrix), he(X, x, fe);
    };
    function he(X, te, ge) {
      ge === null ? X.matrix.copy(te.matrixWorld) : (X.matrix.copy(ge.matrixWorld), X.matrix.invert(), X.matrix.multiply(te.matrixWorld)), X.matrix.decompose(X.position, X.quaternion, X.scale), X.updateMatrixWorld(!0), X.projectionMatrix.copy(te.projectionMatrix), X.projectionMatrixInverse.copy(te.projectionMatrixInverse), X.isPerspectiveCamera && (X.fov = si * 2 * Math.atan(1 / X.projectionMatrix.elements[5]), X.zoom = 1);
    }
    this.getCamera = function() {
      return x;
    }, this.getFoveation = function() {
      if (!(d === null && f === null))
        return c;
    }, this.setFoveation = function(X) {
      c = X, d !== null && (d.fixedFoveation = X), f !== null && f.fixedFoveation !== void 0 && (f.fixedFoveation = X);
    }, this.hasDepthSensing = function() {
      return _.texture !== null;
    }, this.getDepthSensingMesh = function() {
      return _.getMesh(x);
    };
    let ve = null;
    function ke(X, te) {
      if (h = te.getViewerPose(l || a), g = te, h !== null) {
        const ge = h.views;
        f !== null && (e.setRenderTargetFramebuffer(T, f.framebuffer), e.setRenderTarget(T));
        let fe = !1;
        ge.length !== x.cameras.length && (x.cameras.length = 0, fe = !0);
        for (let we = 0; we < ge.length; we++) {
          const Oe = ge[we];
          let Ke = null;
          if (f !== null)
            Ke = f.getViewport(Oe);
          else {
            const M = u.getViewSubImage(d, Oe);
            Ke = M.viewport, we === 0 && (e.setRenderTargetTextures(
              T,
              M.colorTexture,
              d.ignoreDepthValues ? void 0 : M.depthStencilTexture
            ), e.setRenderTarget(T));
          }
          let ze = K[we];
          ze === void 0 && (ze = new Rt(), ze.layers.enable(we), ze.viewport = new Ye(), K[we] = ze), ze.matrix.fromArray(Oe.transform.matrix), ze.matrix.decompose(ze.position, ze.quaternion, ze.scale), ze.projectionMatrix.fromArray(Oe.projectionMatrix), ze.projectionMatrixInverse.copy(ze.projectionMatrix).invert(), ze.viewport.set(Ke.x, Ke.y, Ke.width, Ke.height), we === 0 && (x.matrix.copy(ze.matrix), x.matrix.decompose(x.position, x.quaternion, x.scale)), fe === !0 && x.cameras.push(ze);
        }
        const Ce = i.enabledFeatures;
        if (Ce && Ce.includes("depth-sensing")) {
          const we = u.getDepthInformation(ge[0]);
          we && we.isValid && we.texture && _.init(e, we, i.renderState);
        }
      }
      for (let ge = 0; ge < y.length; ge++) {
        const fe = A[ge], Ce = y[ge];
        fe !== null && Ce !== void 0 && Ce.update(fe, te, l || a);
      }
      ve && ve(X, te), te.detectedPlanes && n.dispatchEvent({ type: "planesdetected", data: te }), g = null;
    }
    const We = new _o();
    We.setAnimationLoop(ke), this.setAnimationLoop = function(X) {
      ve = X;
    }, this.dispose = function() {
    };
  }
}
const Cn = /* @__PURE__ */ new Zt(), gf = /* @__PURE__ */ new Ne();
function _f(s, e) {
  function t(p, m) {
    p.matrixAutoUpdate === !0 && p.updateMatrix(), m.value.copy(p.matrix);
  }
  function n(p, m) {
    m.color.getRGB(p.fogColor.value, po(s)), m.isFog ? (p.fogNear.value = m.near, p.fogFar.value = m.far) : m.isFogExp2 && (p.fogDensity.value = m.density);
  }
  function i(p, m, T, y, A) {
    m.isMeshBasicMaterial || m.isMeshLambertMaterial ? r(p, m) : m.isMeshToonMaterial ? (r(p, m), u(p, m)) : m.isMeshPhongMaterial ? (r(p, m), h(p, m)) : m.isMeshStandardMaterial ? (r(p, m), d(p, m), m.isMeshPhysicalMaterial && f(p, m, A)) : m.isMeshMatcapMaterial ? (r(p, m), g(p, m)) : m.isMeshDepthMaterial ? r(p, m) : m.isMeshDistanceMaterial ? (r(p, m), _(p, m)) : m.isMeshNormalMaterial ? r(p, m) : m.isLineBasicMaterial ? (a(p, m), m.isLineDashedMaterial && o(p, m)) : m.isPointsMaterial ? c(p, m, T, y) : m.isSpriteMaterial ? l(p, m) : m.isShadowMaterial ? (p.color.value.copy(m.color), p.opacity.value = m.opacity) : m.isShaderMaterial && (m.uniformsNeedUpdate = !1);
  }
  function r(p, m) {
    p.opacity.value = m.opacity, m.color && p.diffuse.value.copy(m.color), m.emissive && p.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity), m.map && (p.map.value = m.map, t(m.map, p.mapTransform)), m.alphaMap && (p.alphaMap.value = m.alphaMap, t(m.alphaMap, p.alphaMapTransform)), m.bumpMap && (p.bumpMap.value = m.bumpMap, t(m.bumpMap, p.bumpMapTransform), p.bumpScale.value = m.bumpScale, m.side === 1 && (p.bumpScale.value *= -1)), m.normalMap && (p.normalMap.value = m.normalMap, t(m.normalMap, p.normalMapTransform), p.normalScale.value.copy(m.normalScale), m.side === 1 && p.normalScale.value.negate()), m.displacementMap && (p.displacementMap.value = m.displacementMap, t(m.displacementMap, p.displacementMapTransform), p.displacementScale.value = m.displacementScale, p.displacementBias.value = m.displacementBias), m.emissiveMap && (p.emissiveMap.value = m.emissiveMap, t(m.emissiveMap, p.emissiveMapTransform)), m.specularMap && (p.specularMap.value = m.specularMap, t(m.specularMap, p.specularMapTransform)), m.alphaTest > 0 && (p.alphaTest.value = m.alphaTest);
    const T = e.get(m), y = T.envMap, A = T.envMapRotation;
    y && (p.envMap.value = y, Cn.copy(A), Cn.x *= -1, Cn.y *= -1, Cn.z *= -1, y.isCubeTexture && y.isRenderTargetTexture === !1 && (Cn.y *= -1, Cn.z *= -1), p.envMapRotation.value.setFromMatrix4(gf.makeRotationFromEuler(Cn)), p.flipEnvMap.value = y.isCubeTexture && y.isRenderTargetTexture === !1 ? -1 : 1, p.reflectivity.value = m.reflectivity, p.ior.value = m.ior, p.refractionRatio.value = m.refractionRatio), m.lightMap && (p.lightMap.value = m.lightMap, p.lightMapIntensity.value = m.lightMapIntensity, t(m.lightMap, p.lightMapTransform)), m.aoMap && (p.aoMap.value = m.aoMap, p.aoMapIntensity.value = m.aoMapIntensity, t(m.aoMap, p.aoMapTransform));
  }
  function a(p, m) {
    p.diffuse.value.copy(m.color), p.opacity.value = m.opacity, m.map && (p.map.value = m.map, t(m.map, p.mapTransform));
  }
  function o(p, m) {
    p.dashSize.value = m.dashSize, p.totalSize.value = m.dashSize + m.gapSize, p.scale.value = m.scale;
  }
  function c(p, m, T, y) {
    p.diffuse.value.copy(m.color), p.opacity.value = m.opacity, p.size.value = m.size * T, p.scale.value = y * 0.5, m.map && (p.map.value = m.map, t(m.map, p.uvTransform)), m.alphaMap && (p.alphaMap.value = m.alphaMap, t(m.alphaMap, p.alphaMapTransform)), m.alphaTest > 0 && (p.alphaTest.value = m.alphaTest);
  }
  function l(p, m) {
    p.diffuse.value.copy(m.color), p.opacity.value = m.opacity, p.rotation.value = m.rotation, m.map && (p.map.value = m.map, t(m.map, p.mapTransform)), m.alphaMap && (p.alphaMap.value = m.alphaMap, t(m.alphaMap, p.alphaMapTransform)), m.alphaTest > 0 && (p.alphaTest.value = m.alphaTest);
  }
  function h(p, m) {
    p.specular.value.copy(m.specular), p.shininess.value = Math.max(m.shininess, 1e-4);
  }
  function u(p, m) {
    m.gradientMap && (p.gradientMap.value = m.gradientMap);
  }
  function d(p, m) {
    p.metalness.value = m.metalness, m.metalnessMap && (p.metalnessMap.value = m.metalnessMap, t(m.metalnessMap, p.metalnessMapTransform)), p.roughness.value = m.roughness, m.roughnessMap && (p.roughnessMap.value = m.roughnessMap, t(m.roughnessMap, p.roughnessMapTransform)), m.envMap && (p.envMapIntensity.value = m.envMapIntensity);
  }
  function f(p, m, T) {
    p.ior.value = m.ior, m.sheen > 0 && (p.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen), p.sheenRoughness.value = m.sheenRoughness, m.sheenColorMap && (p.sheenColorMap.value = m.sheenColorMap, t(m.sheenColorMap, p.sheenColorMapTransform)), m.sheenRoughnessMap && (p.sheenRoughnessMap.value = m.sheenRoughnessMap, t(m.sheenRoughnessMap, p.sheenRoughnessMapTransform))), m.clearcoat > 0 && (p.clearcoat.value = m.clearcoat, p.clearcoatRoughness.value = m.clearcoatRoughness, m.clearcoatMap && (p.clearcoatMap.value = m.clearcoatMap, t(m.clearcoatMap, p.clearcoatMapTransform)), m.clearcoatRoughnessMap && (p.clearcoatRoughnessMap.value = m.clearcoatRoughnessMap, t(m.clearcoatRoughnessMap, p.clearcoatRoughnessMapTransform)), m.clearcoatNormalMap && (p.clearcoatNormalMap.value = m.clearcoatNormalMap, t(m.clearcoatNormalMap, p.clearcoatNormalMapTransform), p.clearcoatNormalScale.value.copy(m.clearcoatNormalScale), m.side === 1 && p.clearcoatNormalScale.value.negate())), m.dispersion > 0 && (p.dispersion.value = m.dispersion), m.iridescence > 0 && (p.iridescence.value = m.iridescence, p.iridescenceIOR.value = m.iridescenceIOR, p.iridescenceThicknessMinimum.value = m.iridescenceThicknessRange[0], p.iridescenceThicknessMaximum.value = m.iridescenceThicknessRange[1], m.iridescenceMap && (p.iridescenceMap.value = m.iridescenceMap, t(m.iridescenceMap, p.iridescenceMapTransform)), m.iridescenceThicknessMap && (p.iridescenceThicknessMap.value = m.iridescenceThicknessMap, t(m.iridescenceThicknessMap, p.iridescenceThicknessMapTransform))), m.transmission > 0 && (p.transmission.value = m.transmission, p.transmissionSamplerMap.value = T.texture, p.transmissionSamplerSize.value.set(T.width, T.height), m.transmissionMap && (p.transmissionMap.value = m.transmissionMap, t(m.transmissionMap, p.transmissionMapTransform)), p.thickness.value = m.thickness, m.thicknessMap && (p.thicknessMap.value = m.thicknessMap, t(m.thicknessMap, p.thicknessMapTransform)), p.attenuationDistance.value = m.attenuationDistance, p.attenuationColor.value.copy(m.attenuationColor)), m.anisotropy > 0 && (p.anisotropyVector.value.set(m.anisotropy * Math.cos(m.anisotropyRotation), m.anisotropy * Math.sin(m.anisotropyRotation)), m.anisotropyMap && (p.anisotropyMap.value = m.anisotropyMap, t(m.anisotropyMap, p.anisotropyMapTransform))), p.specularIntensity.value = m.specularIntensity, p.specularColor.value.copy(m.specularColor), m.specularColorMap && (p.specularColorMap.value = m.specularColorMap, t(m.specularColorMap, p.specularColorMapTransform)), m.specularIntensityMap && (p.specularIntensityMap.value = m.specularIntensityMap, t(m.specularIntensityMap, p.specularIntensityMapTransform));
  }
  function g(p, m) {
    m.matcap && (p.matcap.value = m.matcap);
  }
  function _(p, m) {
    const T = e.get(m).light;
    p.referencePosition.value.setFromMatrixPosition(T.matrixWorld), p.nearDistance.value = T.shadow.camera.near, p.farDistance.value = T.shadow.camera.far;
  }
  return {
    refreshFogUniforms: n,
    refreshMaterialUniforms: i
  };
}
function xf(s, e, t, n) {
  let i = {}, r = {}, a = [];
  const o = s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);
  function c(T, y) {
    const A = y.program;
    n.uniformBlockBinding(T, A);
  }
  function l(T, y) {
    let A = i[T.id];
    A === void 0 && (g(T), A = h(T), i[T.id] = A, T.addEventListener("dispose", p));
    const L = y.program;
    n.updateUBOMapping(T, L);
    const w = e.render.frame;
    r[T.id] !== w && (d(T), r[T.id] = w);
  }
  function h(T) {
    const y = u();
    T.__bindingPointIndex = y;
    const A = s.createBuffer(), L = T.__size, w = T.usage;
    return s.bindBuffer(s.UNIFORM_BUFFER, A), s.bufferData(s.UNIFORM_BUFFER, L, w), s.bindBuffer(s.UNIFORM_BUFFER, null), s.bindBufferBase(s.UNIFORM_BUFFER, y, A), A;
  }
  function u() {
    for (let T = 0; T < o; T++)
      if (a.indexOf(T) === -1)
        return a.push(T), T;
    return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."), 0;
  }
  function d(T) {
    const y = i[T.id], A = T.uniforms, L = T.__cache;
    s.bindBuffer(s.UNIFORM_BUFFER, y);
    for (let w = 0, R = A.length; w < R; w++) {
      const N = Array.isArray(A[w]) ? A[w] : [A[w]];
      for (let K = 0, x = N.length; K < x; K++) {
        const E = N[K];
        if (f(E, w, K, L) === !0) {
          const B = E.__offset, O = Array.isArray(E.value) ? E.value : [E.value];
          let U = 0;
          for (let Q = 0; Q < O.length; Q++) {
            const k = O[Q], ne = _(k);
            typeof k == "number" || typeof k == "boolean" ? (E.__data[0] = k, s.bufferSubData(s.UNIFORM_BUFFER, B + U, E.__data)) : k.isMatrix3 ? (E.__data[0] = k.elements[0], E.__data[1] = k.elements[1], E.__data[2] = k.elements[2], E.__data[3] = 0, E.__data[4] = k.elements[3], E.__data[5] = k.elements[4], E.__data[6] = k.elements[5], E.__data[7] = 0, E.__data[8] = k.elements[6], E.__data[9] = k.elements[7], E.__data[10] = k.elements[8], E.__data[11] = 0) : (k.toArray(E.__data, U), U += ne.storage / Float32Array.BYTES_PER_ELEMENT);
          }
          s.bufferSubData(s.UNIFORM_BUFFER, B, E.__data);
        }
      }
    }
    s.bindBuffer(s.UNIFORM_BUFFER, null);
  }
  function f(T, y, A, L) {
    const w = T.value, R = y + "_" + A;
    if (L[R] === void 0)
      return typeof w == "number" || typeof w == "boolean" ? L[R] = w : L[R] = w.clone(), !0;
    {
      const N = L[R];
      if (typeof w == "number" || typeof w == "boolean") {
        if (N !== w)
          return L[R] = w, !0;
      } else if (N.equals(w) === !1)
        return N.copy(w), !0;
    }
    return !1;
  }
  function g(T) {
    const y = T.uniforms;
    let A = 0;
    const L = 16;
    for (let R = 0, N = y.length; R < N; R++) {
      const K = Array.isArray(y[R]) ? y[R] : [y[R]];
      for (let x = 0, E = K.length; x < E; x++) {
        const B = K[x], O = Array.isArray(B.value) ? B.value : [B.value];
        for (let U = 0, Q = O.length; U < Q; U++) {
          const k = O[U], ne = _(k), W = A % L, oe = W % ne.boundary, he = W + oe;
          A += oe, he !== 0 && L - he < ne.storage && (A += L - he), B.__data = new Float32Array(ne.storage / Float32Array.BYTES_PER_ELEMENT), B.__offset = A, A += ne.storage;
        }
      }
    }
    const w = A % L;
    return w > 0 && (A += L - w), T.__size = A, T.__cache = {}, this;
  }
  function _(T) {
    const y = {
      boundary: 0,
      // bytes
      storage: 0
      // bytes
    };
    return typeof T == "number" || typeof T == "boolean" ? (y.boundary = 4, y.storage = 4) : T.isVector2 ? (y.boundary = 8, y.storage = 8) : T.isVector3 || T.isColor ? (y.boundary = 16, y.storage = 12) : T.isVector4 ? (y.boundary = 16, y.storage = 16) : T.isMatrix3 ? (y.boundary = 48, y.storage = 48) : T.isMatrix4 ? (y.boundary = 64, y.storage = 64) : T.isTexture ? console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.") : console.warn("THREE.WebGLRenderer: Unsupported uniform value type.", T), y;
  }
  function p(T) {
    const y = T.target;
    y.removeEventListener("dispose", p);
    const A = a.indexOf(y.__bindingPointIndex);
    a.splice(A, 1), s.deleteBuffer(i[y.id]), delete i[y.id], delete r[y.id];
  }
  function m() {
    for (const T in i)
      s.deleteBuffer(i[T]);
    a = [], i = {}, r = {};
  }
  return {
    bind: c,
    update: l,
    dispose: m
  };
}
class vf {
  constructor(e = {}) {
    const {
      canvas: t = rc(),
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
    let _ = null, p = null;
    const m = [], T = [];
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
    }, this.autoClear = !0, this.autoClearColor = !0, this.autoClearDepth = !0, this.autoClearStencil = !0, this.sortObjects = !0, this.clippingPlanes = [], this.localClippingEnabled = !1, this._outputColorSpace = lt, this.toneMapping = 0, this.toneMappingExposure = 1;
    const y = this;
    let A = !1, L = 0, w = 0, R = null, N = -1, K = null;
    const x = new Ye(), E = new Ye();
    let B = null;
    const O = new be(0);
    let U = 0, Q = t.width, k = t.height, ne = 1, W = null, oe = null;
    const he = new Ye(0, 0, Q, k), ve = new Ye(0, 0, Q, k);
    let ke = !1;
    const We = new Tr();
    let X = !1, te = !1;
    const ge = new Ne(), fe = new Ne(), Ce = new C(), we = new Ye(), Oe = { background: null, fog: null, environment: null, overrideMaterial: null, isScene: !0 };
    let Ke = !1;
    function ze() {
      return R === null ? ne : 1;
    }
    let M = n;
    function J(S, P) {
      return t.getContext(S, P);
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
      if ("setAttribute" in t && t.setAttribute("data-engine", `three.js r${Sr}`), t.addEventListener("webglcontextlost", $, !1), t.addEventListener("webglcontextrestored", ce, !1), t.addEventListener("webglcontextcreationerror", de, !1), M === null) {
        const P = "webgl2";
        if (M = J(P, S), M === null)
          throw J(P) ? new Error("Error creating WebGL context with your selected attributes.") : new Error("Error creating WebGL context.");
      }
    } catch (S) {
      throw console.error("THREE.WebGLRenderer: " + S.message), S;
    }
    let q, Z, j, Ae, pe, b, v, F, V, ee, Y, ye, ae, me, qe, ie, _e, Pe, Le, xe, He, De, it, I;
    function ue() {
      q = new Eu(M), q.init(), De = new lf(M, q), Z = new _u(M, q, e, De), j = new af(M), Z.reverseDepthBuffer && j.buffers.depth.setReversed(!0), Ae = new bu(M), pe = new Wd(), b = new cf(M, q, j, pe, Z, De, Ae), v = new vu(y), F = new yu(y), V = new Dc(M), it = new mu(M, V), ee = new Tu(M, V, Ae, it), Y = new Ru(M, ee, V, Ae), Le = new wu(M, Z, b), ie = new xu(pe), ye = new Hd(y, v, F, q, Z, it, ie), ae = new _f(y, pe), me = new qd(), qe = new Jd(q), Pe = new pu(y, v, F, j, Y, d, c), _e = new sf(y, Y, Z), I = new xf(M, Ae, Z, j), xe = new gu(M, q, Ae), He = new Au(M, q, Ae), Ae.programs = ye.programs, y.capabilities = Z, y.extensions = q, y.properties = pe, y.renderLists = me, y.shadowMap = _e, y.state = j, y.info = Ae;
    }
    ue();
    const H = new mf(y, M);
    this.xr = H, this.getContext = function() {
      return M;
    }, this.getContextAttributes = function() {
      return M.getContextAttributes();
    }, this.forceContextLoss = function() {
      const S = q.get("WEBGL_lose_context");
      S && S.loseContext();
    }, this.forceContextRestore = function() {
      const S = q.get("WEBGL_lose_context");
      S && S.restoreContext();
    }, this.getPixelRatio = function() {
      return ne;
    }, this.setPixelRatio = function(S) {
      S !== void 0 && (ne = S, this.setSize(Q, k, !1));
    }, this.getSize = function(S) {
      return S.set(Q, k);
    }, this.setSize = function(S, P, G = !0) {
      if (H.isPresenting) {
        console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");
        return;
      }
      Q = S, k = P, t.width = Math.floor(S * ne), t.height = Math.floor(P * ne), G === !0 && (t.style.width = S + "px", t.style.height = P + "px"), this.setViewport(0, 0, S, P);
    }, this.getDrawingBufferSize = function(S) {
      return S.set(Q * ne, k * ne).floor();
    }, this.setDrawingBufferSize = function(S, P, G) {
      Q = S, k = P, ne = G, t.width = Math.floor(S * G), t.height = Math.floor(P * G), this.setViewport(0, 0, S, P);
    }, this.getCurrentViewport = function(S) {
      return S.copy(x);
    }, this.getViewport = function(S) {
      return S.copy(he);
    }, this.setViewport = function(S, P, G, z) {
      S.isVector4 ? he.set(S.x, S.y, S.z, S.w) : he.set(S, P, G, z), j.viewport(x.copy(he).multiplyScalar(ne).round());
    }, this.getScissor = function(S) {
      return S.copy(ve);
    }, this.setScissor = function(S, P, G, z) {
      S.isVector4 ? ve.set(S.x, S.y, S.z, S.w) : ve.set(S, P, G, z), j.scissor(E.copy(ve).multiplyScalar(ne).round());
    }, this.getScissorTest = function() {
      return ke;
    }, this.setScissorTest = function(S) {
      j.setScissorTest(ke = S);
    }, this.setOpaqueSort = function(S) {
      W = S;
    }, this.setTransparentSort = function(S) {
      oe = S;
    }, this.getClearColor = function(S) {
      return S.copy(Pe.getClearColor());
    }, this.setClearColor = function() {
      Pe.setClearColor.apply(Pe, arguments);
    }, this.getClearAlpha = function() {
      return Pe.getClearAlpha();
    }, this.setClearAlpha = function() {
      Pe.setClearAlpha.apply(Pe, arguments);
    }, this.clear = function(S = !0, P = !0, G = !0) {
      let z = 0;
      if (S) {
        let D = !1;
        if (R !== null) {
          const se = R.texture.format;
          D = se === 1033 || se === 1031 || se === 1029;
        }
        if (D) {
          const se = R.texture.type, le = se === 1009 || se === 1014 || se === 1012 || se === 1020 || se === 1017 || se === 1018, Me = Pe.getClearColor(), Se = Pe.getClearAlpha(), Re = Me.r, Ie = Me.g, Ee = Me.b;
          le ? (f[0] = Re, f[1] = Ie, f[2] = Ee, f[3] = Se, M.clearBufferuiv(M.COLOR, 0, f)) : (g[0] = Re, g[1] = Ie, g[2] = Ee, g[3] = Se, M.clearBufferiv(M.COLOR, 0, g));
        } else
          z |= M.COLOR_BUFFER_BIT;
      }
      P && (z |= M.DEPTH_BUFFER_BIT, M.clearDepth(this.capabilities.reverseDepthBuffer ? 0 : 1)), G && (z |= M.STENCIL_BUFFER_BIT, this.state.buffers.stencil.setMask(4294967295)), M.clear(z);
    }, this.clearColor = function() {
      this.clear(!0, !1, !1);
    }, this.clearDepth = function() {
      this.clear(!1, !0, !1);
    }, this.clearStencil = function() {
      this.clear(!1, !1, !0);
    }, this.dispose = function() {
      t.removeEventListener("webglcontextlost", $, !1), t.removeEventListener("webglcontextrestored", ce, !1), t.removeEventListener("webglcontextcreationerror", de, !1), me.dispose(), qe.dispose(), pe.dispose(), v.dispose(), F.dispose(), Y.dispose(), it.dispose(), I.dispose(), ye.dispose(), H.dispose(), H.removeEventListener("sessionstart", Nr), H.removeEventListener("sessionend", Ur), En.stop();
    };
    function $(S) {
      S.preventDefault(), console.log("THREE.WebGLRenderer: Context Lost."), A = !0;
    }
    function ce() {
      console.log("THREE.WebGLRenderer: Context Restored."), A = !1;
      const S = Ae.autoReset, P = _e.enabled, G = _e.autoUpdate, z = _e.needsUpdate, D = _e.type;
      ue(), Ae.autoReset = S, _e.enabled = P, _e.autoUpdate = G, _e.needsUpdate = z, _e.type = D;
    }
    function de(S) {
      console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ", S.statusMessage);
    }
    function Xe(S) {
      const P = S.target;
      P.removeEventListener("dispose", Xe), ht(P);
    }
    function ht(S) {
      bt(S), pe.remove(S);
    }
    function bt(S) {
      const P = pe.get(S).programs;
      P !== void 0 && (P.forEach(function(G) {
        ye.releaseProgram(G);
      }), S.isShaderMaterial && ye.releaseShaderCache(S));
    }
    this.renderBufferDirect = function(S, P, G, z, D, se) {
      P === null && (P = Oe);
      const le = D.isMesh && D.matrixWorld.determinant() < 0, Me = Bo(S, P, G, z, D);
      j.setMaterial(z, le);
      let Se = G.index, Re = 1;
      if (z.wireframe === !0) {
        if (Se = ee.getWireframeAttribute(G), Se === void 0) return;
        Re = 2;
      }
      const Ie = G.drawRange, Ee = G.attributes.position;
      let et = Ie.start * Re, st = (Ie.start + Ie.count) * Re;
      se !== null && (et = Math.max(et, se.start * Re), st = Math.min(st, (se.start + se.count) * Re)), Se !== null ? (et = Math.max(et, 0), st = Math.min(st, Se.count)) : Ee != null && (et = Math.max(et, 0), st = Math.min(st, Ee.count));
      const ot = st - et;
      if (ot < 0 || ot === 1 / 0) return;
      it.setup(D, z, Me, G, Se);
      let It, Ze = xe;
      if (Se !== null && (It = V.get(Se), Ze = He, Ze.setIndex(It)), D.isMesh)
        z.wireframe === !0 ? (j.setLineWidth(z.wireframeLinewidth * ze()), Ze.setMode(M.LINES)) : Ze.setMode(M.TRIANGLES);
      else if (D.isLine) {
        let Te = z.linewidth;
        Te === void 0 && (Te = 1), j.setLineWidth(Te * ze()), D.isLineSegments ? Ze.setMode(M.LINES) : D.isLineLoop ? Ze.setMode(M.LINE_LOOP) : Ze.setMode(M.LINE_STRIP);
      } else D.isPoints ? Ze.setMode(M.POINTS) : D.isSprite && Ze.setMode(M.TRIANGLES);
      if (D.isBatchedMesh)
        if (D._multiDrawInstances !== null)
          Ze.renderMultiDrawInstances(D._multiDrawStarts, D._multiDrawCounts, D._multiDrawCount, D._multiDrawInstances);
        else if (q.get("WEBGL_multi_draw"))
          Ze.renderMultiDraw(D._multiDrawStarts, D._multiDrawCounts, D._multiDrawCount);
        else {
          const Te = D._multiDrawStarts, _t = D._multiDrawCounts, $e = D._multiDrawCount, zt = Se ? V.get(Se).bytesPerElement : 1, Fn = pe.get(z).currentProgram.getUniforms();
          for (let Pt = 0; Pt < $e; Pt++)
            Fn.setValue(M, "_gl_DrawID", Pt), Ze.render(Te[Pt] / zt, _t[Pt]);
        }
      else if (D.isInstancedMesh)
        Ze.renderInstances(et, ot, D.count);
      else if (G.isInstancedBufferGeometry) {
        const Te = G._maxInstanceCount !== void 0 ? G._maxInstanceCount : 1 / 0, _t = Math.min(G.instanceCount, Te);
        Ze.renderInstances(et, ot, _t);
      } else
        Ze.render(et, ot);
    };
    function je(S, P, G) {
      S.transparent === !0 && S.side === 2 && S.forceSinglePass === !1 ? (S.side = 1, S.needsUpdate = !0, Ii(S, P, G), S.side = 0, S.needsUpdate = !0, Ii(S, P, G), S.side = 2) : Ii(S, P, G);
    }
    this.compile = function(S, P, G = null) {
      G === null && (G = S), p = qe.get(G), p.init(P), T.push(p), G.traverseVisible(function(D) {
        D.isLight && D.layers.test(P.layers) && (p.pushLight(D), D.castShadow && p.pushShadow(D));
      }), S !== G && S.traverseVisible(function(D) {
        D.isLight && D.layers.test(P.layers) && (p.pushLight(D), D.castShadow && p.pushShadow(D));
      }), p.setupLights();
      const z = /* @__PURE__ */ new Set();
      return S.traverse(function(D) {
        if (!(D.isMesh || D.isPoints || D.isLine || D.isSprite))
          return;
        const se = D.material;
        if (se)
          if (Array.isArray(se))
            for (let le = 0; le < se.length; le++) {
              const Me = se[le];
              je(Me, G, D), z.add(Me);
            }
          else
            je(se, G, D), z.add(se);
      }), T.pop(), p = null, z;
    }, this.compileAsync = function(S, P, G = null) {
      const z = this.compile(S, P, G);
      return new Promise((D) => {
        function se() {
          if (z.forEach(function(le) {
            pe.get(le).currentProgram.isReady() && z.delete(le);
          }), z.size === 0) {
            D(S);
            return;
          }
          setTimeout(se, 10);
        }
        q.get("KHR_parallel_shader_compile") !== null ? se() : setTimeout(se, 10);
      });
    };
    let wt = null;
    function nn(S) {
      wt && wt(S);
    }
    function Nr() {
      En.stop();
    }
    function Ur() {
      En.start();
    }
    const En = new _o();
    En.setAnimationLoop(nn), typeof self < "u" && En.setContext(self), this.setAnimationLoop = function(S) {
      wt = S, H.setAnimationLoop(S), S === null ? En.stop() : En.start();
    }, H.addEventListener("sessionstart", Nr), H.addEventListener("sessionend", Ur), this.render = function(S, P) {
      if (P !== void 0 && P.isCamera !== !0) {
        console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");
        return;
      }
      if (A === !0) return;
      if (S.matrixWorldAutoUpdate === !0 && S.updateMatrixWorld(), P.parent === null && P.matrixWorldAutoUpdate === !0 && P.updateMatrixWorld(), H.enabled === !0 && H.isPresenting === !0 && (H.cameraAutoUpdate === !0 && H.updateCamera(P), P = H.getCamera()), S.isScene === !0 && S.onBeforeRender(y, S, P, R), p = qe.get(S, T.length), p.init(P), T.push(p), fe.multiplyMatrices(P.projectionMatrix, P.matrixWorldInverse), We.setFromProjectionMatrix(fe), te = this.localClippingEnabled, X = ie.init(this.clippingPlanes, te), _ = me.get(S, m.length), _.init(), m.push(_), H.enabled === !0 && H.isPresenting === !0) {
        const se = y.xr.getDepthSensingMesh();
        se !== null && As(se, P, -1 / 0, y.sortObjects);
      }
      As(S, P, 0, y.sortObjects), _.finish(), y.sortObjects === !0 && _.sort(W, oe), Ke = H.enabled === !1 || H.isPresenting === !1 || H.hasDepthSensing() === !1, Ke && Pe.addToRenderList(_, S), this.info.render.frame++, X === !0 && ie.beginShadows();
      const G = p.state.shadowsArray;
      _e.render(G, S, P), X === !0 && ie.endShadows(), this.info.autoReset === !0 && this.info.reset();
      const z = _.opaque, D = _.transmissive;
      if (p.setupLights(), P.isArrayCamera) {
        const se = P.cameras;
        if (D.length > 0)
          for (let le = 0, Me = se.length; le < Me; le++) {
            const Se = se[le];
            Br(z, D, S, Se);
          }
        Ke && Pe.render(S);
        for (let le = 0, Me = se.length; le < Me; le++) {
          const Se = se[le];
          Fr(_, S, Se, Se.viewport);
        }
      } else
        D.length > 0 && Br(z, D, S, P), Ke && Pe.render(S), Fr(_, S, P);
      R !== null && (b.updateMultisampleRenderTarget(R), b.updateRenderTargetMipmap(R)), S.isScene === !0 && S.onAfterRender(y, S, P), it.resetDefaultState(), N = -1, K = null, T.pop(), T.length > 0 ? (p = T[T.length - 1], X === !0 && ie.setGlobalState(y.clippingPlanes, p.state.camera)) : p = null, m.pop(), m.length > 0 ? _ = m[m.length - 1] : _ = null;
    };
    function As(S, P, G, z) {
      if (S.visible === !1) return;
      if (S.layers.test(P.layers)) {
        if (S.isGroup)
          G = S.renderOrder;
        else if (S.isLOD)
          S.autoUpdate === !0 && S.update(P);
        else if (S.isLight)
          p.pushLight(S), S.castShadow && p.pushShadow(S);
        else if (S.isSprite) {
          if (!S.frustumCulled || We.intersectsSprite(S)) {
            z && we.setFromMatrixPosition(S.matrixWorld).applyMatrix4(fe);
            const le = Y.update(S), Me = S.material;
            Me.visible && _.push(S, le, Me, G, we.z, null);
          }
        } else if ((S.isMesh || S.isLine || S.isPoints) && (!S.frustumCulled || We.intersectsObject(S))) {
          const le = Y.update(S), Me = S.material;
          if (z && (S.boundingSphere !== void 0 ? (S.boundingSphere === null && S.computeBoundingSphere(), we.copy(S.boundingSphere.center)) : (le.boundingSphere === null && le.computeBoundingSphere(), we.copy(le.boundingSphere.center)), we.applyMatrix4(S.matrixWorld).applyMatrix4(fe)), Array.isArray(Me)) {
            const Se = le.groups;
            for (let Re = 0, Ie = Se.length; Re < Ie; Re++) {
              const Ee = Se[Re], et = Me[Ee.materialIndex];
              et && et.visible && _.push(S, le, et, G, we.z, Ee);
            }
          } else Me.visible && _.push(S, le, Me, G, we.z, null);
        }
      }
      const se = S.children;
      for (let le = 0, Me = se.length; le < Me; le++)
        As(se[le], P, G, z);
    }
    function Fr(S, P, G, z) {
      const D = S.opaque, se = S.transmissive, le = S.transparent;
      p.setupLightsView(G), X === !0 && ie.setGlobalState(y.clippingPlanes, G), z && j.viewport(x.copy(z)), D.length > 0 && Ci(D, P, G), se.length > 0 && Ci(se, P, G), le.length > 0 && Ci(le, P, G), j.buffers.depth.setTest(!0), j.buffers.depth.setMask(!0), j.buffers.color.setMask(!0), j.setPolygonOffset(!1);
    }
    function Br(S, P, G, z) {
      if ((G.isScene === !0 ? G.overrideMaterial : null) !== null)
        return;
      p.state.transmissionRenderTarget[z.id] === void 0 && (p.state.transmissionRenderTarget[z.id] = new Nn(1, 1, {
        generateMipmaps: !0,
        type: q.has("EXT_color_buffer_half_float") || q.has("EXT_color_buffer_float") ? 1016 : 1009,
        minFilter: 1008,
        samples: 4,
        stencilBuffer: r,
        resolveDepthBuffer: !1,
        resolveStencilBuffer: !1,
        colorSpace: Ve.workingColorSpace
      }));
      const se = p.state.transmissionRenderTarget[z.id], le = z.viewport || x;
      se.setSize(le.z, le.w);
      const Me = y.getRenderTarget();
      y.setRenderTarget(se), y.getClearColor(O), U = y.getClearAlpha(), U < 1 && y.setClearColor(16777215, 0.5), y.clear(), Ke && Pe.render(G);
      const Se = y.toneMapping;
      y.toneMapping = 0;
      const Re = z.viewport;
      if (z.viewport !== void 0 && (z.viewport = void 0), p.setupLightsView(z), X === !0 && ie.setGlobalState(y.clippingPlanes, z), Ci(S, G, z), b.updateMultisampleRenderTarget(se), b.updateRenderTargetMipmap(se), q.has("WEBGL_multisampled_render_to_texture") === !1) {
        let Ie = !1;
        for (let Ee = 0, et = P.length; Ee < et; Ee++) {
          const st = P[Ee], ot = st.object, It = st.geometry, Ze = st.material, Te = st.group;
          if (Ze.side === 2 && ot.layers.test(z.layers)) {
            const _t = Ze.side;
            Ze.side = 1, Ze.needsUpdate = !0, Or(ot, G, z, It, Ze, Te), Ze.side = _t, Ze.needsUpdate = !0, Ie = !0;
          }
        }
        Ie === !0 && (b.updateMultisampleRenderTarget(se), b.updateRenderTargetMipmap(se));
      }
      y.setRenderTarget(Me), y.setClearColor(O, U), Re !== void 0 && (z.viewport = Re), y.toneMapping = Se;
    }
    function Ci(S, P, G) {
      const z = P.isScene === !0 ? P.overrideMaterial : null;
      for (let D = 0, se = S.length; D < se; D++) {
        const le = S[D], Me = le.object, Se = le.geometry, Re = z === null ? le.material : z, Ie = le.group;
        Me.layers.test(G.layers) && Or(Me, P, G, Se, Re, Ie);
      }
    }
    function Or(S, P, G, z, D, se) {
      S.onBeforeRender(y, P, G, z, D, se), S.modelViewMatrix.multiplyMatrices(G.matrixWorldInverse, S.matrixWorld), S.normalMatrix.getNormalMatrix(S.modelViewMatrix), D.onBeforeRender(y, P, G, z, S, se), D.transparent === !0 && D.side === 2 && D.forceSinglePass === !1 ? (D.side = 1, D.needsUpdate = !0, y.renderBufferDirect(G, P, z, D, S, se), D.side = 0, D.needsUpdate = !0, y.renderBufferDirect(G, P, z, D, S, se), D.side = 2) : y.renderBufferDirect(G, P, z, D, S, se), S.onAfterRender(y, P, G, z, D, se);
    }
    function Ii(S, P, G) {
      P.isScene !== !0 && (P = Oe);
      const z = pe.get(S), D = p.state.lights, se = p.state.shadowsArray, le = D.state.version, Me = ye.getParameters(S, D.state, se, P, G), Se = ye.getProgramCacheKey(Me);
      let Re = z.programs;
      z.environment = S.isMeshStandardMaterial ? P.environment : null, z.fog = P.fog, z.envMap = (S.isMeshStandardMaterial ? F : v).get(S.envMap || z.environment), z.envMapRotation = z.environment !== null && S.envMap === null ? P.environmentRotation : S.envMapRotation, Re === void 0 && (S.addEventListener("dispose", Xe), Re = /* @__PURE__ */ new Map(), z.programs = Re);
      let Ie = Re.get(Se);
      if (Ie !== void 0) {
        if (z.currentProgram === Ie && z.lightsStateVersion === le)
          return zr(S, Me), Ie;
      } else
        Me.uniforms = ye.getUniforms(S), S.onBeforeCompile(Me, y), Ie = ye.acquireProgram(Me, Se), Re.set(Se, Ie), z.uniforms = Me.uniforms;
      const Ee = z.uniforms;
      return (!S.isShaderMaterial && !S.isRawShaderMaterial || S.clipping === !0) && (Ee.clippingPlanes = ie.uniform), zr(S, Me), z.needsLights = Go(S), z.lightsStateVersion = le, z.needsLights && (Ee.ambientLightColor.value = D.state.ambient, Ee.lightProbe.value = D.state.probe, Ee.directionalLights.value = D.state.directional, Ee.directionalLightShadows.value = D.state.directionalShadow, Ee.spotLights.value = D.state.spot, Ee.spotLightShadows.value = D.state.spotShadow, Ee.rectAreaLights.value = D.state.rectArea, Ee.ltc_1.value = D.state.rectAreaLTC1, Ee.ltc_2.value = D.state.rectAreaLTC2, Ee.pointLights.value = D.state.point, Ee.pointLightShadows.value = D.state.pointShadow, Ee.hemisphereLights.value = D.state.hemi, Ee.directionalShadowMap.value = D.state.directionalShadowMap, Ee.directionalShadowMatrix.value = D.state.directionalShadowMatrix, Ee.spotShadowMap.value = D.state.spotShadowMap, Ee.spotLightMatrix.value = D.state.spotLightMatrix, Ee.spotLightMap.value = D.state.spotLightMap, Ee.pointShadowMap.value = D.state.pointShadowMap, Ee.pointShadowMatrix.value = D.state.pointShadowMatrix), z.currentProgram = Ie, z.uniformsList = null, Ie;
    }
    function Gr(S) {
      if (S.uniformsList === null) {
        const P = S.currentProgram.getUniforms();
        S.uniformsList = ls.seqWithValue(P.seq, S.uniforms);
      }
      return S.uniformsList;
    }
    function zr(S, P) {
      const G = pe.get(S);
      G.outputColorSpace = P.outputColorSpace, G.batching = P.batching, G.batchingColor = P.batchingColor, G.instancing = P.instancing, G.instancingColor = P.instancingColor, G.instancingMorph = P.instancingMorph, G.skinning = P.skinning, G.morphTargets = P.morphTargets, G.morphNormals = P.morphNormals, G.morphColors = P.morphColors, G.morphTargetsCount = P.morphTargetsCount, G.numClippingPlanes = P.numClippingPlanes, G.numIntersection = P.numClipIntersection, G.vertexAlphas = P.vertexAlphas, G.vertexTangents = P.vertexTangents, G.toneMapping = P.toneMapping;
    }
    function Bo(S, P, G, z, D) {
      P.isScene !== !0 && (P = Oe), b.resetTextureUnits();
      const se = P.fog, le = z.isMeshStandardMaterial ? P.environment : null, Me = R === null ? y.outputColorSpace : R.isXRRenderTarget === !0 ? R.texture.colorSpace : xt, Se = (z.isMeshStandardMaterial ? F : v).get(z.envMap || le), Re = z.vertexColors === !0 && !!G.attributes.color && G.attributes.color.itemSize === 4, Ie = !!G.attributes.tangent && (!!z.normalMap || z.anisotropy > 0), Ee = !!G.morphAttributes.position, et = !!G.morphAttributes.normal, st = !!G.morphAttributes.color;
      let ot = 0;
      z.toneMapped && (R === null || R.isXRRenderTarget === !0) && (ot = y.toneMapping);
      const It = G.morphAttributes.position || G.morphAttributes.normal || G.morphAttributes.color, Ze = It !== void 0 ? It.length : 0, Te = pe.get(z), _t = p.state.lights;
      if (X === !0 && (te === !0 || S !== K)) {
        const Ut = S === K && z.id === N;
        ie.setState(z, S, Ut);
      }
      let $e = !1;
      z.version === Te.__version ? (Te.needsLights && Te.lightsStateVersion !== _t.state.version || Te.outputColorSpace !== Me || D.isBatchedMesh && Te.batching === !1 || !D.isBatchedMesh && Te.batching === !0 || D.isBatchedMesh && Te.batchingColor === !0 && D.colorTexture === null || D.isBatchedMesh && Te.batchingColor === !1 && D.colorTexture !== null || D.isInstancedMesh && Te.instancing === !1 || !D.isInstancedMesh && Te.instancing === !0 || D.isSkinnedMesh && Te.skinning === !1 || !D.isSkinnedMesh && Te.skinning === !0 || D.isInstancedMesh && Te.instancingColor === !0 && D.instanceColor === null || D.isInstancedMesh && Te.instancingColor === !1 && D.instanceColor !== null || D.isInstancedMesh && Te.instancingMorph === !0 && D.morphTexture === null || D.isInstancedMesh && Te.instancingMorph === !1 && D.morphTexture !== null || Te.envMap !== Se || z.fog === !0 && Te.fog !== se || Te.numClippingPlanes !== void 0 && (Te.numClippingPlanes !== ie.numPlanes || Te.numIntersection !== ie.numIntersection) || Te.vertexAlphas !== Re || Te.vertexTangents !== Ie || Te.morphTargets !== Ee || Te.morphNormals !== et || Te.morphColors !== st || Te.toneMapping !== ot || Te.morphTargetsCount !== Ze) && ($e = !0) : ($e = !0, Te.__version = z.version);
      let zt = Te.currentProgram;
      $e === !0 && (zt = Ii(z, P, D));
      let Fn = !1, Pt = !1, bs = !1;
      const ct = zt.getUniforms(), un = Te.uniforms;
      if (j.useProgram(zt.program) && (Fn = !0, Pt = !0, bs = !0), z.id !== N && (N = z.id, Pt = !0), Fn || K !== S) {
        Z.reverseDepthBuffer ? (ge.copy(S.projectionMatrix), oc(ge), cc(ge), ct.setValue(M, "projectionMatrix", ge)) : ct.setValue(M, "projectionMatrix", S.projectionMatrix), ct.setValue(M, "viewMatrix", S.matrixWorldInverse);
        const Ut = ct.map.cameraPosition;
        Ut !== void 0 && Ut.setValue(M, Ce.setFromMatrixPosition(S.matrixWorld)), Z.logarithmicDepthBuffer && ct.setValue(
          M,
          "logDepthBufFC",
          2 / (Math.log(S.far + 1) / Math.LN2)
        ), (z.isMeshPhongMaterial || z.isMeshToonMaterial || z.isMeshLambertMaterial || z.isMeshBasicMaterial || z.isMeshStandardMaterial || z.isShaderMaterial) && ct.setValue(M, "isOrthographic", S.isOrthographicCamera === !0), K !== S && (K = S, Pt = !0, bs = !0);
      }
      if (D.isSkinnedMesh) {
        ct.setOptional(M, D, "bindMatrix"), ct.setOptional(M, D, "bindMatrixInverse");
        const Ut = D.skeleton;
        Ut && (Ut.boneTexture === null && Ut.computeBoneTexture(), ct.setValue(M, "boneTexture", Ut.boneTexture, b));
      }
      D.isBatchedMesh && (ct.setOptional(M, D, "batchingTexture"), ct.setValue(M, "batchingTexture", D._matricesTexture, b), ct.setOptional(M, D, "batchingIdTexture"), ct.setValue(M, "batchingIdTexture", D._indirectTexture, b), ct.setOptional(M, D, "batchingColorTexture"), D._colorsTexture !== null && ct.setValue(M, "batchingColorTexture", D._colorsTexture, b));
      const ws = G.morphAttributes;
      if ((ws.position !== void 0 || ws.normal !== void 0 || ws.color !== void 0) && Le.update(D, G, zt), (Pt || Te.receiveShadow !== D.receiveShadow) && (Te.receiveShadow = D.receiveShadow, ct.setValue(M, "receiveShadow", D.receiveShadow)), z.isMeshGouraudMaterial && z.envMap !== null && (un.envMap.value = Se, un.flipEnvMap.value = Se.isCubeTexture && Se.isRenderTargetTexture === !1 ? -1 : 1), z.isMeshStandardMaterial && z.envMap === null && P.environment !== null && (un.envMapIntensity.value = P.environmentIntensity), Pt && (ct.setValue(M, "toneMappingExposure", y.toneMappingExposure), Te.needsLights && Oo(un, bs), se && z.fog === !0 && ae.refreshFogUniforms(un, se), ae.refreshMaterialUniforms(un, z, ne, k, p.state.transmissionRenderTarget[S.id]), ls.upload(M, Gr(Te), un, b)), z.isShaderMaterial && z.uniformsNeedUpdate === !0 && (ls.upload(M, Gr(Te), un, b), z.uniformsNeedUpdate = !1), z.isSpriteMaterial && ct.setValue(M, "center", D.center), ct.setValue(M, "modelViewMatrix", D.modelViewMatrix), ct.setValue(M, "normalMatrix", D.normalMatrix), ct.setValue(M, "modelMatrix", D.matrixWorld), z.isShaderMaterial || z.isRawShaderMaterial) {
        const Ut = z.uniformsGroups;
        for (let Rs = 0, zo = Ut.length; Rs < zo; Rs++) {
          const kr = Ut[Rs];
          I.update(kr, zt), I.bind(kr, zt);
        }
      }
      return zt;
    }
    function Oo(S, P) {
      S.ambientLightColor.needsUpdate = P, S.lightProbe.needsUpdate = P, S.directionalLights.needsUpdate = P, S.directionalLightShadows.needsUpdate = P, S.pointLights.needsUpdate = P, S.pointLightShadows.needsUpdate = P, S.spotLights.needsUpdate = P, S.spotLightShadows.needsUpdate = P, S.rectAreaLights.needsUpdate = P, S.hemisphereLights.needsUpdate = P;
    }
    function Go(S) {
      return S.isMeshLambertMaterial || S.isMeshToonMaterial || S.isMeshPhongMaterial || S.isMeshStandardMaterial || S.isShadowMaterial || S.isShaderMaterial && S.lights === !0;
    }
    this.getActiveCubeFace = function() {
      return L;
    }, this.getActiveMipmapLevel = function() {
      return w;
    }, this.getRenderTarget = function() {
      return R;
    }, this.setRenderTargetTextures = function(S, P, G) {
      pe.get(S.texture).__webglTexture = P, pe.get(S.depthTexture).__webglTexture = G;
      const z = pe.get(S);
      z.__hasExternalTextures = !0, z.__autoAllocateDepthBuffer = G === void 0, z.__autoAllocateDepthBuffer || q.has("WEBGL_multisampled_render_to_texture") === !0 && (console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"), z.__useRenderToTexture = !1);
    }, this.setRenderTargetFramebuffer = function(S, P) {
      const G = pe.get(S);
      G.__webglFramebuffer = P, G.__useDefaultFramebuffer = P === void 0;
    }, this.setRenderTarget = function(S, P = 0, G = 0) {
      R = S, L = P, w = G;
      let z = !0, D = null, se = !1, le = !1;
      if (S) {
        const Se = pe.get(S);
        if (Se.__useDefaultFramebuffer !== void 0)
          j.bindFramebuffer(M.FRAMEBUFFER, null), z = !1;
        else if (Se.__webglFramebuffer === void 0)
          b.setupRenderTarget(S);
        else if (Se.__hasExternalTextures)
          b.rebindTextures(S, pe.get(S.texture).__webglTexture, pe.get(S.depthTexture).__webglTexture);
        else if (S.depthBuffer) {
          const Ee = S.depthTexture;
          if (Se.__boundDepthTexture !== Ee) {
            if (Ee !== null && pe.has(Ee) && (S.width !== Ee.image.width || S.height !== Ee.image.height))
              throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");
            b.setupDepthRenderbuffer(S);
          }
        }
        const Re = S.texture;
        (Re.isData3DTexture || Re.isDataArrayTexture || Re.isCompressedArrayTexture) && (le = !0);
        const Ie = pe.get(S).__webglFramebuffer;
        S.isWebGLCubeRenderTarget ? (Array.isArray(Ie[P]) ? D = Ie[P][G] : D = Ie[P], se = !0) : S.samples > 0 && b.useMultisampledRTT(S) === !1 ? D = pe.get(S).__webglMultisampledFramebuffer : Array.isArray(Ie) ? D = Ie[G] : D = Ie, x.copy(S.viewport), E.copy(S.scissor), B = S.scissorTest;
      } else
        x.copy(he).multiplyScalar(ne).floor(), E.copy(ve).multiplyScalar(ne).floor(), B = ke;
      if (j.bindFramebuffer(M.FRAMEBUFFER, D) && z && j.drawBuffers(S, D), j.viewport(x), j.scissor(E), j.setScissorTest(B), se) {
        const Se = pe.get(S.texture);
        M.framebufferTexture2D(M.FRAMEBUFFER, M.COLOR_ATTACHMENT0, M.TEXTURE_CUBE_MAP_POSITIVE_X + P, Se.__webglTexture, G);
      } else if (le) {
        const Se = pe.get(S.texture), Re = P || 0;
        M.framebufferTextureLayer(M.FRAMEBUFFER, M.COLOR_ATTACHMENT0, Se.__webglTexture, G || 0, Re);
      }
      N = -1;
    }, this.readRenderTargetPixels = function(S, P, G, z, D, se, le) {
      if (!(S && S.isWebGLRenderTarget)) {
        console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
        return;
      }
      let Me = pe.get(S).__webglFramebuffer;
      if (S.isWebGLCubeRenderTarget && le !== void 0 && (Me = Me[le]), Me) {
        j.bindFramebuffer(M.FRAMEBUFFER, Me);
        try {
          const Se = S.texture, Re = Se.format, Ie = Se.type;
          if (!Z.textureFormatReadable(Re)) {
            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");
            return;
          }
          if (!Z.textureTypeReadable(Ie)) {
            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");
            return;
          }
          P >= 0 && P <= S.width - z && G >= 0 && G <= S.height - D && M.readPixels(P, G, z, D, De.convert(Re), De.convert(Ie), se);
        } finally {
          const Se = R !== null ? pe.get(R).__webglFramebuffer : null;
          j.bindFramebuffer(M.FRAMEBUFFER, Se);
        }
      }
    }, this.readRenderTargetPixelsAsync = async function(S, P, G, z, D, se, le) {
      if (!(S && S.isWebGLRenderTarget))
        throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
      let Me = pe.get(S).__webglFramebuffer;
      if (S.isWebGLCubeRenderTarget && le !== void 0 && (Me = Me[le]), Me) {
        const Se = S.texture, Re = Se.format, Ie = Se.type;
        if (!Z.textureFormatReadable(Re))
          throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");
        if (!Z.textureTypeReadable(Ie))
          throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");
        if (P >= 0 && P <= S.width - z && G >= 0 && G <= S.height - D) {
          j.bindFramebuffer(M.FRAMEBUFFER, Me);
          const Ee = M.createBuffer();
          M.bindBuffer(M.PIXEL_PACK_BUFFER, Ee), M.bufferData(M.PIXEL_PACK_BUFFER, se.byteLength, M.STREAM_READ), M.readPixels(P, G, z, D, De.convert(Re), De.convert(Ie), 0);
          const et = R !== null ? pe.get(R).__webglFramebuffer : null;
          j.bindFramebuffer(M.FRAMEBUFFER, et);
          const st = M.fenceSync(M.SYNC_GPU_COMMANDS_COMPLETE, 0);
          return M.flush(), await ac(M, st, 4), M.bindBuffer(M.PIXEL_PACK_BUFFER, Ee), M.getBufferSubData(M.PIXEL_PACK_BUFFER, 0, se), M.deleteBuffer(Ee), M.deleteSync(st), se;
        } else
          throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.");
      }
    }, this.copyFramebufferToTexture = function(S, P = null, G = 0) {
      S.isTexture !== !0 && (cs("WebGLRenderer: copyFramebufferToTexture function signature has changed."), P = arguments[0] || null, S = arguments[1]);
      const z = Math.pow(2, -G), D = Math.floor(S.image.width * z), se = Math.floor(S.image.height * z), le = P !== null ? P.x : 0, Me = P !== null ? P.y : 0;
      b.setTexture2D(S, 0), M.copyTexSubImage2D(M.TEXTURE_2D, G, 0, 0, le, Me, D, se), j.unbindTexture();
    }, this.copyTextureToTexture = function(S, P, G = null, z = null, D = 0) {
      S.isTexture !== !0 && (cs("WebGLRenderer: copyTextureToTexture function signature has changed."), z = arguments[0] || null, S = arguments[1], P = arguments[2], D = arguments[3] || 0, G = null);
      let se, le, Me, Se, Re, Ie;
      G !== null ? (se = G.max.x - G.min.x, le = G.max.y - G.min.y, Me = G.min.x, Se = G.min.y) : (se = S.image.width, le = S.image.height, Me = 0, Se = 0), z !== null ? (Re = z.x, Ie = z.y) : (Re = 0, Ie = 0);
      const Ee = De.convert(P.format), et = De.convert(P.type);
      b.setTexture2D(P, 0), M.pixelStorei(M.UNPACK_FLIP_Y_WEBGL, P.flipY), M.pixelStorei(M.UNPACK_PREMULTIPLY_ALPHA_WEBGL, P.premultiplyAlpha), M.pixelStorei(M.UNPACK_ALIGNMENT, P.unpackAlignment);
      const st = M.getParameter(M.UNPACK_ROW_LENGTH), ot = M.getParameter(M.UNPACK_IMAGE_HEIGHT), It = M.getParameter(M.UNPACK_SKIP_PIXELS), Ze = M.getParameter(M.UNPACK_SKIP_ROWS), Te = M.getParameter(M.UNPACK_SKIP_IMAGES), _t = S.isCompressedTexture ? S.mipmaps[D] : S.image;
      M.pixelStorei(M.UNPACK_ROW_LENGTH, _t.width), M.pixelStorei(M.UNPACK_IMAGE_HEIGHT, _t.height), M.pixelStorei(M.UNPACK_SKIP_PIXELS, Me), M.pixelStorei(M.UNPACK_SKIP_ROWS, Se), S.isDataTexture ? M.texSubImage2D(M.TEXTURE_2D, D, Re, Ie, se, le, Ee, et, _t.data) : S.isCompressedTexture ? M.compressedTexSubImage2D(M.TEXTURE_2D, D, Re, Ie, _t.width, _t.height, Ee, _t.data) : M.texSubImage2D(M.TEXTURE_2D, D, Re, Ie, se, le, Ee, et, _t), M.pixelStorei(M.UNPACK_ROW_LENGTH, st), M.pixelStorei(M.UNPACK_IMAGE_HEIGHT, ot), M.pixelStorei(M.UNPACK_SKIP_PIXELS, It), M.pixelStorei(M.UNPACK_SKIP_ROWS, Ze), M.pixelStorei(M.UNPACK_SKIP_IMAGES, Te), D === 0 && P.generateMipmaps && M.generateMipmap(M.TEXTURE_2D), j.unbindTexture();
    }, this.copyTextureToTexture3D = function(S, P, G = null, z = null, D = 0) {
      S.isTexture !== !0 && (cs("WebGLRenderer: copyTextureToTexture3D function signature has changed."), G = arguments[0] || null, z = arguments[1] || null, S = arguments[2], P = arguments[3], D = arguments[4] || 0);
      let se, le, Me, Se, Re, Ie, Ee, et, st;
      const ot = S.isCompressedTexture ? S.mipmaps[D] : S.image;
      G !== null ? (se = G.max.x - G.min.x, le = G.max.y - G.min.y, Me = G.max.z - G.min.z, Se = G.min.x, Re = G.min.y, Ie = G.min.z) : (se = ot.width, le = ot.height, Me = ot.depth, Se = 0, Re = 0, Ie = 0), z !== null ? (Ee = z.x, et = z.y, st = z.z) : (Ee = 0, et = 0, st = 0);
      const It = De.convert(P.format), Ze = De.convert(P.type);
      let Te;
      if (P.isData3DTexture)
        b.setTexture3D(P, 0), Te = M.TEXTURE_3D;
      else if (P.isDataArrayTexture || P.isCompressedArrayTexture)
        b.setTexture2DArray(P, 0), Te = M.TEXTURE_2D_ARRAY;
      else {
        console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");
        return;
      }
      M.pixelStorei(M.UNPACK_FLIP_Y_WEBGL, P.flipY), M.pixelStorei(M.UNPACK_PREMULTIPLY_ALPHA_WEBGL, P.premultiplyAlpha), M.pixelStorei(M.UNPACK_ALIGNMENT, P.unpackAlignment);
      const _t = M.getParameter(M.UNPACK_ROW_LENGTH), $e = M.getParameter(M.UNPACK_IMAGE_HEIGHT), zt = M.getParameter(M.UNPACK_SKIP_PIXELS), Fn = M.getParameter(M.UNPACK_SKIP_ROWS), Pt = M.getParameter(M.UNPACK_SKIP_IMAGES);
      M.pixelStorei(M.UNPACK_ROW_LENGTH, ot.width), M.pixelStorei(M.UNPACK_IMAGE_HEIGHT, ot.height), M.pixelStorei(M.UNPACK_SKIP_PIXELS, Se), M.pixelStorei(M.UNPACK_SKIP_ROWS, Re), M.pixelStorei(M.UNPACK_SKIP_IMAGES, Ie), S.isDataTexture || S.isData3DTexture ? M.texSubImage3D(Te, D, Ee, et, st, se, le, Me, It, Ze, ot.data) : P.isCompressedArrayTexture ? M.compressedTexSubImage3D(Te, D, Ee, et, st, se, le, Me, It, ot.data) : M.texSubImage3D(Te, D, Ee, et, st, se, le, Me, It, Ze, ot), M.pixelStorei(M.UNPACK_ROW_LENGTH, _t), M.pixelStorei(M.UNPACK_IMAGE_HEIGHT, $e), M.pixelStorei(M.UNPACK_SKIP_PIXELS, zt), M.pixelStorei(M.UNPACK_SKIP_ROWS, Fn), M.pixelStorei(M.UNPACK_SKIP_IMAGES, Pt), D === 0 && P.generateMipmaps && M.generateMipmap(Te), j.unbindTexture();
    }, this.initRenderTarget = function(S) {
      pe.get(S).__webglFramebuffer === void 0 && b.setupRenderTarget(S);
    }, this.initTexture = function(S) {
      S.isCubeTexture ? b.setTextureCube(S, 0) : S.isData3DTexture ? b.setTexture3D(S, 0) : S.isDataArrayTexture || S.isCompressedArrayTexture ? b.setTexture2DArray(S, 0) : b.setTexture2D(S, 0), j.unbindTexture();
    }, this.resetState = function() {
      L = 0, w = 0, R = null, j.reset(), it.reset();
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
    t.drawingBufferColorSpace = e === yr ? "display-p3" : "srgb", t.unpackColorSpace = Ve.workingColorSpace === xs ? "display-p3" : "srgb";
  }
}
class Mf extends at {
  constructor() {
    super(), this.isScene = !0, this.type = "Scene", this.background = null, this.environment = null, this.fog = null, this.backgroundBlurriness = 0, this.backgroundIntensity = 1, this.backgroundRotation = new Zt(), this.environmentIntensity = 1, this.environmentRotation = new Zt(), this.overrideMaterial = null, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
  }
  copy(e, t) {
    return super.copy(e, t), e.background !== null && (this.background = e.background.clone()), e.environment !== null && (this.environment = e.environment.clone()), e.fog !== null && (this.fog = e.fog.clone()), this.backgroundBlurriness = e.backgroundBlurriness, this.backgroundIntensity = e.backgroundIntensity, this.backgroundRotation.copy(e.backgroundRotation), this.environmentIntensity = e.environmentIntensity, this.environmentRotation.copy(e.environmentRotation), e.overrideMaterial !== null && (this.overrideMaterial = e.overrideMaterial.clone()), this.matrixAutoUpdate = e.matrixAutoUpdate, this;
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return this.fog !== null && (t.object.fog = this.fog.toJSON()), this.backgroundBlurriness > 0 && (t.object.backgroundBlurriness = this.backgroundBlurriness), this.backgroundIntensity !== 1 && (t.object.backgroundIntensity = this.backgroundIntensity), t.object.backgroundRotation = this.backgroundRotation.toArray(), this.environmentIntensity !== 1 && (t.object.environmentIntensity = this.environmentIntensity), t.object.environmentRotation = this.environmentRotation.toArray(), t;
  }
}
class Sf {
  constructor(e, t) {
    this.isInterleavedBuffer = !0, this.array = e, this.stride = t, this.count = e !== void 0 ? e.length / t : 0, this.usage = 35044, this.updateRanges = [], this.version = 0, this.uuid = Yt();
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
    e.arrayBuffers === void 0 && (e.arrayBuffers = {}), this.array.buffer._uuid === void 0 && (this.array.buffer._uuid = Yt()), e.arrayBuffers[this.array.buffer._uuid] === void 0 && (e.arrayBuffers[this.array.buffer._uuid] = this.array.slice(0).buffer);
    const t = new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]), n = new this.constructor(t, this.stride);
    return n.setUsage(this.usage), n;
  }
  onUpload(e) {
    return this.onUploadCallback = e, this;
  }
  toJSON(e) {
    return e.arrayBuffers === void 0 && (e.arrayBuffers = {}), this.array.buffer._uuid === void 0 && (this.array.buffer._uuid = Yt()), e.arrayBuffers[this.array.buffer._uuid] === void 0 && (e.arrayBuffers[this.array.buffer._uuid] = Array.from(new Uint32Array(this.array.buffer))), {
      uuid: this.uuid,
      buffer: this.array.buffer._uuid,
      type: this.array.constructor.name,
      stride: this.stride
    };
  }
}
const Et = /* @__PURE__ */ new C();
class br {
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
      Et.fromBufferAttribute(this, t), Et.applyMatrix4(e), this.setXYZ(t, Et.x, Et.y, Et.z);
    return this;
  }
  applyNormalMatrix(e) {
    for (let t = 0, n = this.count; t < n; t++)
      Et.fromBufferAttribute(this, t), Et.applyNormalMatrix(e), this.setXYZ(t, Et.x, Et.y, Et.z);
    return this;
  }
  transformDirection(e) {
    for (let t = 0, n = this.count; t < n; t++)
      Et.fromBufferAttribute(this, t), Et.transformDirection(e), this.setXYZ(t, Et.x, Et.y, Et.z);
    return this;
  }
  getComponent(e, t) {
    let n = this.array[e * this.data.stride + this.offset + t];
    return this.normalized && (n = qt(n, this.array)), n;
  }
  setComponent(e, t, n) {
    return this.normalized && (n = tt(n, this.array)), this.data.array[e * this.data.stride + this.offset + t] = n, this;
  }
  setX(e, t) {
    return this.normalized && (t = tt(t, this.array)), this.data.array[e * this.data.stride + this.offset] = t, this;
  }
  setY(e, t) {
    return this.normalized && (t = tt(t, this.array)), this.data.array[e * this.data.stride + this.offset + 1] = t, this;
  }
  setZ(e, t) {
    return this.normalized && (t = tt(t, this.array)), this.data.array[e * this.data.stride + this.offset + 2] = t, this;
  }
  setW(e, t) {
    return this.normalized && (t = tt(t, this.array)), this.data.array[e * this.data.stride + this.offset + 3] = t, this;
  }
  getX(e) {
    let t = this.data.array[e * this.data.stride + this.offset];
    return this.normalized && (t = qt(t, this.array)), t;
  }
  getY(e) {
    let t = this.data.array[e * this.data.stride + this.offset + 1];
    return this.normalized && (t = qt(t, this.array)), t;
  }
  getZ(e) {
    let t = this.data.array[e * this.data.stride + this.offset + 2];
    return this.normalized && (t = qt(t, this.array)), t;
  }
  getW(e) {
    let t = this.data.array[e * this.data.stride + this.offset + 3];
    return this.normalized && (t = qt(t, this.array)), t;
  }
  setXY(e, t, n) {
    return e = e * this.data.stride + this.offset, this.normalized && (t = tt(t, this.array), n = tt(n, this.array)), this.data.array[e + 0] = t, this.data.array[e + 1] = n, this;
  }
  setXYZ(e, t, n, i) {
    return e = e * this.data.stride + this.offset, this.normalized && (t = tt(t, this.array), n = tt(n, this.array), i = tt(i, this.array)), this.data.array[e + 0] = t, this.data.array[e + 1] = n, this.data.array[e + 2] = i, this;
  }
  setXYZW(e, t, n, i, r) {
    return e = e * this.data.stride + this.offset, this.normalized && (t = tt(t, this.array), n = tt(n, this.array), i = tt(i, this.array), r = tt(r, this.array)), this.data.array[e + 0] = t, this.data.array[e + 1] = n, this.data.array[e + 2] = i, this.data.array[e + 3] = r, this;
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
      return new At(new this.array.constructor(t), this.itemSize, this.normalized);
    } else
      return e.interleavedBuffers === void 0 && (e.interleavedBuffers = {}), e.interleavedBuffers[this.data.uuid] === void 0 && (e.interleavedBuffers[this.data.uuid] = this.data.clone(e)), new br(e.interleavedBuffers[this.data.uuid], this.itemSize, this.offset, this.normalized);
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
const La = /* @__PURE__ */ new C(), Da = /* @__PURE__ */ new Ye(), Na = /* @__PURE__ */ new Ye(), yf = /* @__PURE__ */ new C(), Ua = /* @__PURE__ */ new Ne(), $i = /* @__PURE__ */ new C(), ir = /* @__PURE__ */ new Qt(), Fa = /* @__PURE__ */ new Ne(), sr = /* @__PURE__ */ new vs();
class Ef extends Qe {
  constructor(e, t) {
    super(e, t), this.isSkinnedMesh = !0, this.type = "SkinnedMesh", this.bindMode = Vr, this.bindMatrix = new Ne(), this.bindMatrixInverse = new Ne(), this.boundingBox = null, this.boundingSphere = null;
  }
  computeBoundingBox() {
    const e = this.geometry;
    this.boundingBox === null && (this.boundingBox = new $t()), this.boundingBox.makeEmpty();
    const t = e.getAttribute("position");
    for (let n = 0; n < t.count; n++)
      this.getVertexPosition(n, $i), this.boundingBox.expandByPoint($i);
  }
  computeBoundingSphere() {
    const e = this.geometry;
    this.boundingSphere === null && (this.boundingSphere = new Qt()), this.boundingSphere.makeEmpty();
    const t = e.getAttribute("position");
    for (let n = 0; n < t.count; n++)
      this.getVertexPosition(n, $i), this.boundingSphere.expandByPoint($i);
  }
  copy(e, t) {
    return super.copy(e, t), this.bindMode = e.bindMode, this.bindMatrix.copy(e.bindMatrix), this.bindMatrixInverse.copy(e.bindMatrixInverse), this.skeleton = e.skeleton, e.boundingBox !== null && (this.boundingBox = e.boundingBox.clone()), e.boundingSphere !== null && (this.boundingSphere = e.boundingSphere.clone()), this;
  }
  raycast(e, t) {
    const n = this.material, i = this.matrixWorld;
    n !== void 0 && (this.boundingSphere === null && this.computeBoundingSphere(), ir.copy(this.boundingSphere), ir.applyMatrix4(i), e.ray.intersectsSphere(ir) !== !1 && (Fa.copy(i).invert(), sr.copy(e.ray).applyMatrix4(Fa), !(this.boundingBox !== null && sr.intersectsBox(this.boundingBox) === !1) && this._computeIntersections(e, t, sr)));
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
    const e = new Ye(), t = this.geometry.attributes.skinWeight;
    for (let n = 0, i = t.count; n < i; n++) {
      e.fromBufferAttribute(t, n);
      const r = 1 / e.manhattanLength();
      r !== 1 / 0 ? e.multiplyScalar(r) : e.set(1, 0, 0, 0), t.setXYZW(n, e.x, e.y, e.z, e.w);
    }
  }
  updateMatrixWorld(e) {
    super.updateMatrixWorld(e), this.bindMode === Vr ? this.bindMatrixInverse.copy(this.matrixWorld).invert() : this.bindMode === ko ? this.bindMatrixInverse.copy(this.bindMatrix).invert() : console.warn("THREE.SkinnedMesh: Unrecognized bindMode: " + this.bindMode);
  }
  applyBoneTransform(e, t) {
    const n = this.skeleton, i = this.geometry;
    Da.fromBufferAttribute(i.attributes.skinIndex, e), Na.fromBufferAttribute(i.attributes.skinWeight, e), La.copy(t).applyMatrix4(this.bindMatrix), t.set(0, 0, 0);
    for (let r = 0; r < 4; r++) {
      const a = Na.getComponent(r);
      if (a !== 0) {
        const o = Da.getComponent(r);
        Ua.multiplyMatrices(n.bones[o].matrixWorld, n.boneInverses[o]), t.addScaledVector(yf.copy(La).applyMatrix4(Ua), a);
      }
    }
    return t.applyMatrix4(this.bindMatrixInverse);
  }
}
class Eo extends at {
  constructor() {
    super(), this.isBone = !0, this.type = "Bone";
  }
}
class To extends gt {
  constructor(e = null, t = 1, n = 1, i, r, a, o, c, l = 1003, h = 1003, u, d) {
    super(null, a, o, c, l, h, i, r, u, d), this.isDataTexture = !0, this.image = { data: e, width: t, height: n }, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1;
  }
}
const Ba = /* @__PURE__ */ new Ne(), Tf = /* @__PURE__ */ new Ne();
class wr {
  constructor(e = [], t = []) {
    this.uuid = Yt(), this.bones = e.slice(0), this.boneInverses = t, this.boneMatrices = null, this.boneTexture = null, this.init();
  }
  init() {
    const e = this.bones, t = this.boneInverses;
    if (this.boneMatrices = new Float32Array(e.length * 16), t.length === 0)
      this.calculateInverses();
    else if (e.length !== t.length) {
      console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."), this.boneInverses = [];
      for (let n = 0, i = this.bones.length; n < i; n++)
        this.boneInverses.push(new Ne());
    }
  }
  calculateInverses() {
    this.boneInverses.length = 0;
    for (let e = 0, t = this.bones.length; e < t; e++) {
      const n = new Ne();
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
      const o = e[r] ? e[r].matrixWorld : Tf;
      Ba.multiplyMatrices(o, t[r]), Ba.toArray(n, r * 16);
    }
    i !== null && (i.needsUpdate = !0);
  }
  clone() {
    return new wr(this.bones, this.boneInverses);
  }
  computeBoneTexture() {
    let e = Math.sqrt(this.bones.length * 4);
    e = Math.ceil(e / 4) * 4, e = Math.max(e, 4);
    const t = new Float32Array(e * e * 4);
    t.set(this.boneMatrices);
    const n = new To(t, e, e, 1023, 1015);
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
      a === void 0 && (console.warn("THREE.Skeleton: No bone found with UUID:", r), a = new Eo()), this.bones.push(a), this.boneInverses.push(new Ne().fromArray(e.boneInverses[n]));
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
class gr extends At {
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
const Zn = /* @__PURE__ */ new Ne(), Oa = /* @__PURE__ */ new Ne(), Ji = [], Ga = /* @__PURE__ */ new $t(), Af = /* @__PURE__ */ new Ne(), xi = /* @__PURE__ */ new Qe(), vi = /* @__PURE__ */ new Qt();
class bf extends Qe {
  constructor(e, t, n) {
    super(e, t), this.isInstancedMesh = !0, this.instanceMatrix = new gr(new Float32Array(n * 16), 16), this.instanceColor = null, this.morphTexture = null, this.count = n, this.boundingBox = null, this.boundingSphere = null;
    for (let i = 0; i < n; i++)
      this.setMatrixAt(i, Af);
  }
  computeBoundingBox() {
    const e = this.geometry, t = this.count;
    this.boundingBox === null && (this.boundingBox = new $t()), e.boundingBox === null && e.computeBoundingBox(), this.boundingBox.makeEmpty();
    for (let n = 0; n < t; n++)
      this.getMatrixAt(n, Zn), Ga.copy(e.boundingBox).applyMatrix4(Zn), this.boundingBox.union(Ga);
  }
  computeBoundingSphere() {
    const e = this.geometry, t = this.count;
    this.boundingSphere === null && (this.boundingSphere = new Qt()), e.boundingSphere === null && e.computeBoundingSphere(), this.boundingSphere.makeEmpty();
    for (let n = 0; n < t; n++)
      this.getMatrixAt(n, Zn), vi.copy(e.boundingSphere).applyMatrix4(Zn), this.boundingSphere.union(vi);
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
    if (xi.geometry = this.geometry, xi.material = this.material, xi.material !== void 0 && (this.boundingSphere === null && this.computeBoundingSphere(), vi.copy(this.boundingSphere), vi.applyMatrix4(n), e.ray.intersectsSphere(vi) !== !1))
      for (let r = 0; r < i; r++) {
        this.getMatrixAt(r, Zn), Oa.multiplyMatrices(n, Zn), xi.matrixWorld = Oa, xi.raycast(e, Ji);
        for (let a = 0, o = Ji.length; a < o; a++) {
          const c = Ji[a];
          c.instanceId = r, c.object = this, t.push(c);
        }
        Ji.length = 0;
      }
  }
  setColorAt(e, t) {
    this.instanceColor === null && (this.instanceColor = new gr(new Float32Array(this.instanceMatrix.count * 3).fill(1), 3)), t.toArray(this.instanceColor.array, e * 3);
  }
  setMatrixAt(e, t) {
    t.toArray(this.instanceMatrix.array, e * 16);
  }
  setMorphAt(e, t) {
    const n = t.morphTargetInfluences, i = n.length + 1;
    this.morphTexture === null && (this.morphTexture = new To(new Float32Array(i * this.count), i, this.count, 1028, 1015));
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
class ti extends Nt {
  constructor(e) {
    super(), this.isLineBasicMaterial = !0, this.type = "LineBasicMaterial", this.color = new be(16777215), this.map = null, this.linewidth = 1, this.linecap = "round", this.linejoin = "round", this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.map = e.map, this.linewidth = e.linewidth, this.linecap = e.linecap, this.linejoin = e.linejoin, this.fog = e.fog, this;
  }
}
const ps = /* @__PURE__ */ new C(), ms = /* @__PURE__ */ new C(), za = /* @__PURE__ */ new Ne(), Mi = /* @__PURE__ */ new vs(), Qi = /* @__PURE__ */ new Qt(), rr = /* @__PURE__ */ new C(), ka = /* @__PURE__ */ new C();
class Rr extends at {
  constructor(e = new vt(), t = new ti()) {
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
        ps.fromBufferAttribute(t, i - 1), ms.fromBufferAttribute(t, i), n[i] = n[i - 1], n[i] += ps.distanceTo(ms);
      e.setAttribute("lineDistance", new nt(n, 1));
    } else
      console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
    return this;
  }
  raycast(e, t) {
    const n = this.geometry, i = this.matrixWorld, r = e.params.Line.threshold, a = n.drawRange;
    if (n.boundingSphere === null && n.computeBoundingSphere(), Qi.copy(n.boundingSphere), Qi.applyMatrix4(i), Qi.radius += r, e.ray.intersectsSphere(Qi) === !1) return;
    za.copy(i).invert(), Mi.copy(e.ray).applyMatrix4(za);
    const o = r / ((this.scale.x + this.scale.y + this.scale.z) / 3), c = o * o, l = this.isLineSegments ? 2 : 1, h = n.index, d = n.attributes.position;
    if (h !== null) {
      const f = Math.max(0, a.start), g = Math.min(h.count, a.start + a.count);
      for (let _ = f, p = g - 1; _ < p; _ += l) {
        const m = h.getX(_), T = h.getX(_ + 1), y = es(this, e, Mi, c, m, T);
        y && t.push(y);
      }
      if (this.isLineLoop) {
        const _ = h.getX(g - 1), p = h.getX(f), m = es(this, e, Mi, c, _, p);
        m && t.push(m);
      }
    } else {
      const f = Math.max(0, a.start), g = Math.min(d.count, a.start + a.count);
      for (let _ = f, p = g - 1; _ < p; _ += l) {
        const m = es(this, e, Mi, c, _, _ + 1);
        m && t.push(m);
      }
      if (this.isLineLoop) {
        const _ = es(this, e, Mi, c, g - 1, f);
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
function es(s, e, t, n, i, r) {
  const a = s.geometry.attributes.position;
  if (ps.fromBufferAttribute(a, i), ms.fromBufferAttribute(a, r), t.distanceSqToSegment(ps, ms, rr, ka) > n) return;
  rr.applyMatrix4(s.matrixWorld);
  const c = e.ray.origin.distanceTo(rr);
  if (!(c < e.near || c > e.far))
    return {
      distance: c,
      // What do we want? intersection point on the ray or on the segment??
      // point: raycaster.ray.at( distance ),
      point: ka.clone().applyMatrix4(s.matrixWorld),
      index: i,
      face: null,
      faceIndex: null,
      barycoord: null,
      object: s
    };
}
const Va = /* @__PURE__ */ new C(), Ha = /* @__PURE__ */ new C();
class gs extends Rr {
  constructor(e, t) {
    super(e, t), this.isLineSegments = !0, this.type = "LineSegments";
  }
  computeLineDistances() {
    const e = this.geometry;
    if (e.index === null) {
      const t = e.attributes.position, n = [];
      for (let i = 0, r = t.count; i < r; i += 2)
        Va.fromBufferAttribute(t, i), Ha.fromBufferAttribute(t, i + 1), n[i] = i === 0 ? 0 : n[i - 1], n[i + 1] = n[i] + Va.distanceTo(Ha);
      e.setAttribute("lineDistance", new nt(n, 1));
    } else
      console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
    return this;
  }
}
class wf extends Rr {
  constructor(e, t) {
    super(e, t), this.isLineLoop = !0, this.type = "LineLoop";
  }
}
class Jn extends Nt {
  constructor(e) {
    super(), this.isPointsMaterial = !0, this.type = "PointsMaterial", this.color = new be(16777215), this.map = null, this.alphaMap = null, this.size = 1, this.sizeAttenuation = !0, this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.map = e.map, this.alphaMap = e.alphaMap, this.size = e.size, this.sizeAttenuation = e.sizeAttenuation, this.fog = e.fog, this;
  }
}
const Wa = /* @__PURE__ */ new Ne(), _r = /* @__PURE__ */ new vs(), ts = /* @__PURE__ */ new Qt(), ns = /* @__PURE__ */ new C();
class hs extends at {
  constructor(e = new vt(), t = new Jn()) {
    super(), this.isPoints = !0, this.type = "Points", this.geometry = e, this.material = t, this.updateMorphTargets();
  }
  copy(e, t) {
    return super.copy(e, t), this.material = Array.isArray(e.material) ? e.material.slice() : e.material, this.geometry = e.geometry, this;
  }
  raycast(e, t) {
    const n = this.geometry, i = this.matrixWorld, r = e.params.Points.threshold, a = n.drawRange;
    if (n.boundingSphere === null && n.computeBoundingSphere(), ts.copy(n.boundingSphere), ts.applyMatrix4(i), ts.radius += r, e.ray.intersectsSphere(ts) === !1) return;
    Wa.copy(i).invert(), _r.copy(e.ray).applyMatrix4(Wa);
    const o = r / ((this.scale.x + this.scale.y + this.scale.z) / 3), c = o * o, l = n.index, u = n.attributes.position;
    if (l !== null) {
      const d = Math.max(0, a.start), f = Math.min(l.count, a.start + a.count);
      for (let g = d, _ = f; g < _; g++) {
        const p = l.getX(g);
        ns.fromBufferAttribute(u, p), Xa(ns, p, c, i, e, t, this);
      }
    } else {
      const d = Math.max(0, a.start), f = Math.min(u.count, a.start + a.count);
      for (let g = d, _ = f; g < _; g++)
        ns.fromBufferAttribute(u, g), Xa(ns, g, c, i, e, t, this);
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
function Xa(s, e, t, n, i, r, a) {
  const o = _r.distanceSqToPoint(s);
  if (o < t) {
    const c = new C();
    _r.closestPointToPoint(s, c), c.applyMatrix4(n);
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
class Cr extends vt {
  constructor(e = 1, t = 32, n = 0, i = Math.PI * 2) {
    super(), this.type = "CircleGeometry", this.parameters = {
      radius: e,
      segments: t,
      thetaStart: n,
      thetaLength: i
    }, t = Math.max(3, t);
    const r = [], a = [], o = [], c = [], l = new C(), h = new Be();
    a.push(0, 0, 0), o.push(0, 0, 1), c.push(0.5, 0.5);
    for (let u = 0, d = 3; u <= t; u++, d += 3) {
      const f = n + u / t * i;
      l.x = e * Math.cos(f), l.y = e * Math.sin(f), a.push(l.x, l.y, l.z), o.push(0, 0, 1), h.x = (a[d] / e + 1) / 2, h.y = (a[d + 1] / e + 1) / 2, c.push(h.x, h.y);
    }
    for (let u = 1; u <= t; u++)
      r.push(u, u + 1, 0);
    this.setIndex(r), this.setAttribute("position", new nt(a, 3)), this.setAttribute("normal", new nt(o, 3)), this.setAttribute("uv", new nt(c, 2));
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new Cr(e.radius, e.segments, e.thetaStart, e.thetaLength);
  }
}
class wi extends vt {
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
    const _ = [], p = n / 2;
    let m = 0;
    T(), a === !1 && (e > 0 && y(!0), t > 0 && y(!1)), this.setIndex(h), this.setAttribute("position", new nt(u, 3)), this.setAttribute("normal", new nt(d, 3)), this.setAttribute("uv", new nt(f, 2));
    function T() {
      const A = new C(), L = new C();
      let w = 0;
      const R = (t - e) / n;
      for (let N = 0; N <= r; N++) {
        const K = [], x = N / r, E = x * (t - e) + e;
        for (let B = 0; B <= i; B++) {
          const O = B / i, U = O * c + o, Q = Math.sin(U), k = Math.cos(U);
          L.x = E * Q, L.y = -x * n + p, L.z = E * k, u.push(L.x, L.y, L.z), A.set(Q, R, k).normalize(), d.push(A.x, A.y, A.z), f.push(O, 1 - x), K.push(g++);
        }
        _.push(K);
      }
      for (let N = 0; N < i; N++)
        for (let K = 0; K < r; K++) {
          const x = _[K][N], E = _[K + 1][N], B = _[K + 1][N + 1], O = _[K][N + 1];
          e > 0 && (h.push(x, E, O), w += 3), t > 0 && (h.push(E, B, O), w += 3);
        }
      l.addGroup(m, w, 0), m += w;
    }
    function y(A) {
      const L = g, w = new Be(), R = new C();
      let N = 0;
      const K = A === !0 ? e : t, x = A === !0 ? 1 : -1;
      for (let B = 1; B <= i; B++)
        u.push(0, p * x, 0), d.push(0, x, 0), f.push(0.5, 0.5), g++;
      const E = g;
      for (let B = 0; B <= i; B++) {
        const U = B / i * c + o, Q = Math.cos(U), k = Math.sin(U);
        R.x = K * k, R.y = p * x, R.z = K * Q, u.push(R.x, R.y, R.z), d.push(0, x, 0), w.x = Q * 0.5 + 0.5, w.y = k * 0.5 * x + 0.5, f.push(w.x, w.y), g++;
      }
      for (let B = 0; B < i; B++) {
        const O = L + B, U = E + B;
        A === !0 ? h.push(U, U + 1, O) : h.push(U + 1, U, O), N += 3;
      }
      l.addGroup(m, N, A === !0 ? 1 : 2), m += N;
    }
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new wi(e.radiusTop, e.radiusBottom, e.height, e.radialSegments, e.heightSegments, e.openEnded, e.thetaStart, e.thetaLength);
  }
}
const is = /* @__PURE__ */ new C(), ss = /* @__PURE__ */ new C(), ar = /* @__PURE__ */ new C(), rs = /* @__PURE__ */ new Gt();
class Rf extends vt {
  constructor(e = null, t = 1) {
    if (super(), this.type = "EdgesGeometry", this.parameters = {
      geometry: e,
      thresholdAngle: t
    }, e !== null) {
      const i = Math.pow(10, 4), r = Math.cos(Qn * t), a = e.getIndex(), o = e.getAttribute("position"), c = a ? a.count : o.count, l = [0, 0, 0], h = ["a", "b", "c"], u = new Array(3), d = {}, f = [];
      for (let g = 0; g < c; g += 3) {
        a ? (l[0] = a.getX(g), l[1] = a.getX(g + 1), l[2] = a.getX(g + 2)) : (l[0] = g, l[1] = g + 1, l[2] = g + 2);
        const { a: _, b: p, c: m } = rs;
        if (_.fromBufferAttribute(o, l[0]), p.fromBufferAttribute(o, l[1]), m.fromBufferAttribute(o, l[2]), rs.getNormal(ar), u[0] = `${Math.round(_.x * i)},${Math.round(_.y * i)},${Math.round(_.z * i)}`, u[1] = `${Math.round(p.x * i)},${Math.round(p.y * i)},${Math.round(p.z * i)}`, u[2] = `${Math.round(m.x * i)},${Math.round(m.y * i)},${Math.round(m.z * i)}`, !(u[0] === u[1] || u[1] === u[2] || u[2] === u[0]))
          for (let T = 0; T < 3; T++) {
            const y = (T + 1) % 3, A = u[T], L = u[y], w = rs[h[T]], R = rs[h[y]], N = `${A}_${L}`, K = `${L}_${A}`;
            K in d && d[K] ? (ar.dot(d[K].normal) <= r && (f.push(w.x, w.y, w.z), f.push(R.x, R.y, R.z)), d[K] = null) : N in d || (d[N] = {
              index0: l[T],
              index1: l[y],
              normal: ar.clone()
            });
          }
      }
      for (const g in d)
        if (d[g]) {
          const { index0: _, index1: p } = d[g];
          is.fromBufferAttribute(o, _), ss.fromBufferAttribute(o, p), f.push(is.x, is.y, is.z), f.push(ss.x, ss.y, ss.z);
        }
      this.setAttribute("position", new nt(f, 3));
    }
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
}
class _s extends vt {
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
    const d = (t - e) / i, f = new C(), g = new Be();
    for (let _ = 0; _ <= i; _++) {
      for (let p = 0; p <= n; p++) {
        const m = r + p / n * a;
        f.x = u * Math.cos(m), f.y = u * Math.sin(m), c.push(f.x, f.y, f.z), l.push(0, 0, 1), g.x = (f.x / t + 1) / 2, g.y = (f.y / t + 1) / 2, h.push(g.x, g.y);
      }
      u += d;
    }
    for (let _ = 0; _ < i; _++) {
      const p = _ * (n + 1);
      for (let m = 0; m < n; m++) {
        const T = m + p, y = T, A = T + n + 1, L = T + n + 2, w = T + 1;
        o.push(y, A, w), o.push(A, L, w);
      }
    }
    this.setIndex(o), this.setAttribute("position", new nt(c, 3)), this.setAttribute("normal", new nt(l, 3)), this.setAttribute("uv", new nt(h, 2));
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new _s(e.innerRadius, e.outerRadius, e.thetaSegments, e.phiSegments, e.thetaStart, e.thetaLength);
  }
}
class ys extends vt {
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
    const h = [], u = new C(), d = new C(), f = [], g = [], _ = [], p = [];
    for (let m = 0; m <= n; m++) {
      const T = [], y = m / n;
      let A = 0;
      m === 0 && a === 0 ? A = 0.5 / t : m === n && c === Math.PI && (A = -0.5 / t);
      for (let L = 0; L <= t; L++) {
        const w = L / t;
        u.x = -e * Math.cos(i + w * r) * Math.sin(a + y * o), u.y = e * Math.cos(a + y * o), u.z = e * Math.sin(i + w * r) * Math.sin(a + y * o), g.push(u.x, u.y, u.z), d.copy(u).normalize(), _.push(d.x, d.y, d.z), p.push(w + A, 1 - y), T.push(l++);
      }
      h.push(T);
    }
    for (let m = 0; m < n; m++)
      for (let T = 0; T < t; T++) {
        const y = h[m][T + 1], A = h[m][T], L = h[m + 1][T], w = h[m + 1][T + 1];
        (m !== 0 || a > 0) && f.push(y, A, w), (m !== n - 1 || c < Math.PI) && f.push(A, L, w);
      }
    this.setIndex(f), this.setAttribute("position", new nt(g, 3)), this.setAttribute("normal", new nt(_, 3)), this.setAttribute("uv", new nt(p, 2));
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new ys(e.radius, e.widthSegments, e.heightSegments, e.phiStart, e.phiLength, e.thetaStart, e.thetaLength);
  }
}
class Xt extends Nt {
  constructor(e) {
    super(), this.isMeshStandardMaterial = !0, this.defines = { STANDARD: "" }, this.type = "MeshStandardMaterial", this.color = new be(16777215), this.roughness = 1, this.metalness = 0, this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new be(0), this.emissiveIntensity = 1, this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = 0, this.normalScale = new Be(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.roughnessMap = null, this.metalnessMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new Zt(), this.envMapIntensity = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.flatShading = !1, this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.defines = { STANDARD: "" }, this.color.copy(e.color), this.roughness = e.roughness, this.metalness = e.metalness, this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.emissive.copy(e.emissive), this.emissiveMap = e.emissiveMap, this.emissiveIntensity = e.emissiveIntensity, this.bumpMap = e.bumpMap, this.bumpScale = e.bumpScale, this.normalMap = e.normalMap, this.normalMapType = e.normalMapType, this.normalScale.copy(e.normalScale), this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.roughnessMap = e.roughnessMap, this.metalnessMap = e.metalnessMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapRotation.copy(e.envMapRotation), this.envMapIntensity = e.envMapIntensity, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.flatShading = e.flatShading, this.fog = e.fog, this;
  }
}
class en extends Xt {
  constructor(e) {
    super(), this.isMeshPhysicalMaterial = !0, this.defines = {
      STANDARD: "",
      PHYSICAL: ""
    }, this.type = "MeshPhysicalMaterial", this.anisotropyRotation = 0, this.anisotropyMap = null, this.clearcoatMap = null, this.clearcoatRoughness = 0, this.clearcoatRoughnessMap = null, this.clearcoatNormalScale = new Be(1, 1), this.clearcoatNormalMap = null, this.ior = 1.5, Object.defineProperty(this, "reflectivity", {
      get: function() {
        return yt(2.5 * (this.ior - 1) / (this.ior + 1), 0, 1);
      },
      set: function(t) {
        this.ior = (1 + 0.4 * t) / (1 - 0.4 * t);
      }
    }), this.iridescenceMap = null, this.iridescenceIOR = 1.3, this.iridescenceThicknessRange = [100, 400], this.iridescenceThicknessMap = null, this.sheenColor = new be(0), this.sheenColorMap = null, this.sheenRoughness = 1, this.sheenRoughnessMap = null, this.transmissionMap = null, this.thickness = 0, this.thicknessMap = null, this.attenuationDistance = 1 / 0, this.attenuationColor = new be(1, 1, 1), this.specularIntensity = 1, this.specularIntensityMap = null, this.specularColor = new be(1, 1, 1), this.specularColorMap = null, this._anisotropy = 0, this._clearcoat = 0, this._dispersion = 0, this._iridescence = 0, this._sheen = 0, this._transmission = 0, this.setValues(e);
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
class Ao extends Nt {
  constructor(e) {
    super(), this.isMeshPhongMaterial = !0, this.type = "MeshPhongMaterial", this.color = new be(16777215), this.specular = new be(1118481), this.shininess = 30, this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new be(0), this.emissiveIntensity = 1, this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = 0, this.normalScale = new Be(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new Zt(), this.combine = 0, this.reflectivity = 1, this.refractionRatio = 0.98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.flatShading = !1, this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.specular.copy(e.specular), this.shininess = e.shininess, this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.emissive.copy(e.emissive), this.emissiveMap = e.emissiveMap, this.emissiveIntensity = e.emissiveIntensity, this.bumpMap = e.bumpMap, this.bumpScale = e.bumpScale, this.normalMap = e.normalMap, this.normalMapType = e.normalMapType, this.normalScale.copy(e.normalScale), this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.specularMap = e.specularMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapRotation.copy(e.envMapRotation), this.combine = e.combine, this.reflectivity = e.reflectivity, this.refractionRatio = e.refractionRatio, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.flatShading = e.flatShading, this.fog = e.fog, this;
  }
}
function as(s, e, t) {
  return !s || // let 'undefined' and 'null' pass
  !t && s.constructor === e ? s : typeof e.BYTES_PER_ELEMENT == "number" ? new e(s) : Array.prototype.slice.call(s);
}
function Cf(s) {
  return ArrayBuffer.isView(s) && !(s instanceof DataView);
}
function If(s) {
  function e(i, r) {
    return s[i] - s[r];
  }
  const t = s.length, n = new Array(t);
  for (let i = 0; i !== t; ++i) n[i] = i;
  return n.sort(e), n;
}
function qa(s, e, t) {
  const n = s.length, i = new s.constructor(n);
  for (let r = 0, a = 0; a !== n; ++r) {
    const o = t[r] * e;
    for (let c = 0; c !== e; ++c)
      i[a++] = s[o + c];
  }
  return i;
}
function bo(s, e, t, n) {
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
class Ri {
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
class Pf extends Ri {
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
    const r = this.resultBuffer, a = this.sampleValues, o = this.valueSize, c = e * o, l = c - o, h = this._offsetPrev, u = this._offsetNext, d = this._weightPrev, f = this._weightNext, g = (n - t) / (i - t), _ = g * g, p = _ * g, m = -d * p + 2 * d * _ - d * g, T = (1 + d) * p + (-1.5 - 2 * d) * _ + (-0.5 + d) * g + 1, y = (-1 - f) * p + (1.5 + f) * _ + 0.5 * g, A = f * p - f * _;
    for (let L = 0; L !== o; ++L)
      r[L] = m * a[h + L] + T * a[l + L] + y * a[c + L] + A * a[u + L];
    return r;
  }
}
class wo extends Ri {
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
class Lf extends Ri {
  constructor(e, t, n, i) {
    super(e, t, n, i);
  }
  interpolate_(e) {
    return this.copySampleValue_(e - 1);
  }
}
class tn {
  constructor(e, t, n, i) {
    if (e === void 0) throw new Error("THREE.KeyframeTrack: track name is undefined");
    if (t === void 0 || t.length === 0) throw new Error("THREE.KeyframeTrack: no keyframes in track named " + e);
    this.name = e, this.times = as(t, this.TimeBufferType), this.values = as(n, this.ValueBufferType), this.setInterpolation(i || this.DefaultInterpolation);
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
        times: as(e.times, Array),
        values: as(e.values, Array)
      };
      const i = e.getInterpolation();
      i !== e.DefaultInterpolation && (n.interpolation = i);
    }
    return n.type = e.ValueTypeName, n;
  }
  InterpolantFactoryMethodDiscrete(e) {
    return new Lf(this.times, this.values, this.getValueSize(), e);
  }
  InterpolantFactoryMethodLinear(e) {
    return new wo(this.times, this.values, this.getValueSize(), e);
  }
  InterpolantFactoryMethodSmooth(e) {
    return new Pf(this.times, this.values, this.getValueSize(), e);
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
    if (i !== void 0 && Cf(i))
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
tn.prototype.TimeBufferType = Float32Array;
tn.prototype.ValueBufferType = Float32Array;
tn.prototype.DefaultInterpolation = 2301;
class ui extends tn {
  // No interpolation parameter because only InterpolateDiscrete is valid.
  constructor(e, t, n) {
    super(e, t, n);
  }
}
ui.prototype.ValueTypeName = "bool";
ui.prototype.ValueBufferType = Array;
ui.prototype.DefaultInterpolation = 2300;
ui.prototype.InterpolantFactoryMethodLinear = void 0;
ui.prototype.InterpolantFactoryMethodSmooth = void 0;
class Ro extends tn {
}
Ro.prototype.ValueTypeName = "color";
class ai extends tn {
}
ai.prototype.ValueTypeName = "number";
class Df extends Ri {
  constructor(e, t, n, i) {
    super(e, t, n, i);
  }
  interpolate_(e, t, n, i) {
    const r = this.resultBuffer, a = this.sampleValues, o = this.valueSize, c = (n - t) / (i - t);
    let l = e * o;
    for (let h = l + o; l !== h; l += 4)
      Kt.slerpFlat(r, 0, a, l - o, a, l, c);
    return r;
  }
}
class oi extends tn {
  InterpolantFactoryMethodLinear(e) {
    return new Df(this.times, this.values, this.getValueSize(), e);
  }
}
oi.prototype.ValueTypeName = "quaternion";
oi.prototype.InterpolantFactoryMethodSmooth = void 0;
class di extends tn {
  // No interpolation parameter because only InterpolateDiscrete is valid.
  constructor(e, t, n) {
    super(e, t, n);
  }
}
di.prototype.ValueTypeName = "string";
di.prototype.ValueBufferType = Array;
di.prototype.DefaultInterpolation = 2300;
di.prototype.InterpolantFactoryMethodLinear = void 0;
di.prototype.InterpolantFactoryMethodSmooth = void 0;
class ci extends tn {
}
ci.prototype.ValueTypeName = "vector";
class xr {
  constructor(e = "", t = -1, n = [], i = 2500) {
    this.name = e, this.tracks = n, this.duration = t, this.blendMode = i, this.uuid = Yt(), this.duration < 0 && this.resetDuration();
  }
  static parse(e) {
    const t = [], n = e.tracks, i = 1 / (e.fps || 1);
    for (let a = 0, o = n.length; a !== o; ++a)
      t.push(Uf(n[a]).scale(i));
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
      t.push(tn.toJSON(n[r]));
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
      const h = If(c);
      c = qa(c, 1, h), l = qa(l, 1, h), !i && c[0] === 0 && (c.push(r), l.push(l[0])), a.push(
        new ai(
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
        const p = [], m = [];
        bo(f, p, m, g), p.length !== 0 && _.push(new u(d, p, m));
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
            const p = [], m = [];
            for (let T = 0; T !== d[g].morphTargets.length; ++T) {
              const y = d[g];
              p.push(y.time), m.push(y.morphTarget === _ ? 1 : 0);
            }
            i.push(new ai(".morphTargetInfluence[" + _ + "]", p, m));
          }
          c = f.length * a;
        } else {
          const f = ".bones[" + t[u].name + "]";
          n(
            ci,
            f + ".position",
            d,
            "pos",
            i
          ), n(
            oi,
            f + ".quaternion",
            d,
            "rot",
            i
          ), n(
            ci,
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
function Nf(s) {
  switch (s.toLowerCase()) {
    case "scalar":
    case "double":
    case "float":
    case "number":
    case "integer":
      return ai;
    case "vector":
    case "vector2":
    case "vector3":
    case "vector4":
      return ci;
    case "color":
      return Ro;
    case "quaternion":
      return oi;
    case "bool":
    case "boolean":
      return ui;
    case "string":
      return di;
  }
  throw new Error("THREE.KeyframeTrack: Unsupported typeName: " + s);
}
function Uf(s) {
  if (s.type === void 0)
    throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");
  const e = Nf(s.type);
  if (s.times === void 0) {
    const t = [], n = [];
    bo(s.keys, t, n, "value"), s.times = t, s.values = n;
  }
  return e.parse !== void 0 ? e.parse(s) : new e(s.name, s.times, s.values, s.interpolation);
}
const Mn = {
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
class Ff {
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
const Co = /* @__PURE__ */ new Ff();
class yn {
  constructor(e) {
    this.manager = e !== void 0 ? e : Co, this.crossOrigin = "anonymous", this.withCredentials = !1, this.path = "", this.resourcePath = "", this.requestHeader = {};
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
yn.DEFAULT_MATERIAL_NAME = "__DEFAULT";
const ln = {};
class Bf extends Error {
  constructor(e, t) {
    super(e), this.response = t;
  }
}
class Es extends yn {
  constructor(e) {
    super(e);
  }
  load(e, t, n, i) {
    e === void 0 && (e = ""), this.path !== void 0 && (e = this.path + e), e = this.manager.resolveURL(e);
    const r = Mn.get(e);
    if (r !== void 0)
      return this.manager.itemStart(e), setTimeout(() => {
        t && t(r), this.manager.itemEnd(e);
      }, 0), r;
    if (ln[e] !== void 0) {
      ln[e].push({
        onLoad: t,
        onProgress: n,
        onError: i
      });
      return;
    }
    ln[e] = [], ln[e].push({
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
        const h = ln[e], u = l.body.getReader(), d = l.headers.get("X-File-Size") || l.headers.get("Content-Length"), f = d ? parseInt(d) : 0, g = f !== 0;
        let _ = 0;
        const p = new ReadableStream({
          start(m) {
            T();
            function T() {
              u.read().then(({ done: y, value: A }) => {
                if (y)
                  m.close();
                else {
                  _ += A.byteLength;
                  const L = new ProgressEvent("progress", { lengthComputable: g, loaded: _, total: f });
                  for (let w = 0, R = h.length; w < R; w++) {
                    const N = h[w];
                    N.onProgress && N.onProgress(L);
                  }
                  m.enqueue(A), T();
                }
              }, (y) => {
                m.error(y);
              });
            }
          }
        });
        return new Response(p);
      } else
        throw new Bf(`fetch for "${l.url}" responded with ${l.status}: ${l.statusText}`, l);
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
      Mn.add(e, l);
      const h = ln[e];
      delete ln[e];
      for (let u = 0, d = h.length; u < d; u++) {
        const f = h[u];
        f.onLoad && f.onLoad(l);
      }
    }).catch((l) => {
      const h = ln[e];
      if (h === void 0)
        throw this.manager.itemError(e), l;
      delete ln[e];
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
class Of extends yn {
  constructor(e) {
    super(e);
  }
  load(e, t, n, i) {
    this.path !== void 0 && (e = this.path + e), e = this.manager.resolveURL(e);
    const r = this, a = Mn.get(e);
    if (a !== void 0)
      return r.manager.itemStart(e), setTimeout(function() {
        t && t(a), r.manager.itemEnd(e);
      }, 0), a;
    const o = bi("img");
    function c() {
      h(), Mn.add(e, this), t && t(this), r.manager.itemEnd(e);
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
class Io extends yn {
  constructor(e) {
    super(e);
  }
  load(e, t, n, i) {
    const r = new gt(), a = new Of(this.manager);
    return a.setCrossOrigin(this.crossOrigin), a.setPath(this.path), a.load(e, function(o) {
      r.image = o, r.needsUpdate = !0, t !== void 0 && t(r);
    }, n, i), r;
  }
}
class Ts extends at {
  constructor(e, t = 1) {
    super(), this.isLight = !0, this.type = "Light", this.color = new be(e), this.intensity = t;
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
class Gf extends Ts {
  constructor(e, t, n) {
    super(e, n), this.isHemisphereLight = !0, this.type = "HemisphereLight", this.position.copy(at.DEFAULT_UP), this.updateMatrix(), this.groundColor = new be(t);
  }
  copy(e, t) {
    return super.copy(e, t), this.groundColor.copy(e.groundColor), this;
  }
}
const or = /* @__PURE__ */ new Ne(), ja = /* @__PURE__ */ new C(), Ya = /* @__PURE__ */ new C();
class Ir {
  constructor(e) {
    this.camera = e, this.intensity = 1, this.bias = 0, this.normalBias = 0, this.radius = 1, this.blurSamples = 8, this.mapSize = new Be(512, 512), this.map = null, this.mapPass = null, this.matrix = new Ne(), this.autoUpdate = !0, this.needsUpdate = !1, this._frustum = new Tr(), this._frameExtents = new Be(1, 1), this._viewportCount = 1, this._viewports = [
      new Ye(0, 0, 1, 1)
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
    ja.setFromMatrixPosition(e.matrixWorld), t.position.copy(ja), Ya.setFromMatrixPosition(e.target.matrixWorld), t.lookAt(Ya), t.updateMatrixWorld(), or.multiplyMatrices(t.projectionMatrix, t.matrixWorldInverse), this._frustum.setFromProjectionMatrix(or), n.set(
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
    ), n.multiply(or);
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
class zf extends Ir {
  constructor() {
    super(new Rt(50, 1, 0.5, 500)), this.isSpotLightShadow = !0, this.focus = 1;
  }
  updateMatrices(e) {
    const t = this.camera, n = si * 2 * e.angle * this.focus, i = this.mapSize.width / this.mapSize.height, r = e.distance || t.far;
    (n !== t.fov || i !== t.aspect || r !== t.far) && (t.fov = n, t.aspect = i, t.far = r, t.updateProjectionMatrix()), super.updateMatrices(e);
  }
  copy(e) {
    return super.copy(e), this.focus = e.focus, this;
  }
}
class kf extends Ts {
  constructor(e, t, n = 0, i = Math.PI / 3, r = 0, a = 2) {
    super(e, t), this.isSpotLight = !0, this.type = "SpotLight", this.position.copy(at.DEFAULT_UP), this.updateMatrix(), this.target = new at(), this.distance = n, this.angle = i, this.penumbra = r, this.decay = a, this.map = null, this.shadow = new zf();
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
const Ka = /* @__PURE__ */ new Ne(), Si = /* @__PURE__ */ new C(), cr = /* @__PURE__ */ new C();
class Vf extends Ir {
  constructor() {
    super(new Rt(90, 1, 0.5, 500)), this.isPointLightShadow = !0, this._frameExtents = new Be(4, 2), this._viewportCount = 6, this._viewports = [
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
      new Ye(2, 1, 1, 1),
      // negative X
      new Ye(0, 1, 1, 1),
      // positive Z
      new Ye(3, 1, 1, 1),
      // negative Z
      new Ye(1, 1, 1, 1),
      // positive Y
      new Ye(3, 0, 1, 1),
      // negative Y
      new Ye(1, 0, 1, 1)
    ], this._cubeDirections = [
      new C(1, 0, 0),
      new C(-1, 0, 0),
      new C(0, 0, 1),
      new C(0, 0, -1),
      new C(0, 1, 0),
      new C(0, -1, 0)
    ], this._cubeUps = [
      new C(0, 1, 0),
      new C(0, 1, 0),
      new C(0, 1, 0),
      new C(0, 1, 0),
      new C(0, 0, 1),
      new C(0, 0, -1)
    ];
  }
  updateMatrices(e, t = 0) {
    const n = this.camera, i = this.matrix, r = e.distance || n.far;
    r !== n.far && (n.far = r, n.updateProjectionMatrix()), Si.setFromMatrixPosition(e.matrixWorld), n.position.copy(Si), cr.copy(n.position), cr.add(this._cubeDirections[t]), n.up.copy(this._cubeUps[t]), n.lookAt(cr), n.updateMatrixWorld(), i.makeTranslation(-Si.x, -Si.y, -Si.z), Ka.multiplyMatrices(n.projectionMatrix, n.matrixWorldInverse), this._frustum.setFromProjectionMatrix(Ka);
  }
}
class Hf extends Ts {
  constructor(e, t, n = 0, i = 2) {
    super(e, t), this.isPointLight = !0, this.type = "PointLight", this.distance = n, this.decay = i, this.shadow = new Vf();
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
class Wf extends Ir {
  constructor() {
    super(new Ms(-5, 5, 5, -5, 0.5, 500)), this.isDirectionalLightShadow = !0;
  }
}
class Po extends Ts {
  constructor(e, t) {
    super(e, t), this.isDirectionalLight = !0, this.type = "DirectionalLight", this.position.copy(at.DEFAULT_UP), this.updateMatrix(), this.target = new at(), this.shadow = new Wf();
  }
  dispose() {
    this.shadow.dispose();
  }
  copy(e) {
    return super.copy(e), this.target = e.target.clone(), this.shadow = e.shadow.clone(), this;
  }
}
class ni {
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
class Xf extends yn {
  constructor(e) {
    super(e), this.isImageBitmapLoader = !0, typeof createImageBitmap > "u" && console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."), typeof fetch > "u" && console.warn("THREE.ImageBitmapLoader: fetch() not supported."), this.options = { premultiplyAlpha: "none" };
  }
  setOptions(e) {
    return this.options = e, this;
  }
  load(e, t, n, i) {
    e === void 0 && (e = ""), this.path !== void 0 && (e = this.path + e), e = this.manager.resolveURL(e);
    const r = this, a = Mn.get(e);
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
      return Mn.add(e, l), t && t(l), r.manager.itemEnd(e), l;
    }).catch(function(l) {
      i && i(l), Mn.remove(e), r.manager.itemError(e), r.manager.itemEnd(e);
    });
    Mn.add(e, c), r.manager.itemStart(e);
  }
}
class qf {
  constructor(e = !0) {
    this.autoStart = e, this.startTime = 0, this.oldTime = 0, this.elapsedTime = 0, this.running = !1;
  }
  start() {
    this.startTime = Za(), this.oldTime = this.startTime, this.elapsedTime = 0, this.running = !0;
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
      const t = Za();
      e = (t - this.oldTime) / 1e3, this.oldTime = t, this.elapsedTime += e;
    }
    return e;
  }
}
function Za() {
  return performance.now();
}
class jf {
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
    Kt.slerpFlat(e, t, e, t, e, n, i);
  }
  _slerpAdditive(e, t, n, i, r) {
    const a = this._workIndex * r;
    Kt.multiplyQuaternionsFlat(e, a, e, t, e, n), Kt.slerpFlat(e, t, e, t, e, a, i);
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
const Pr = "\\[\\]\\.:\\/", Yf = new RegExp("[" + Pr + "]", "g"), Lr = "[^" + Pr + "]", Kf = "[^" + Pr.replace("\\.", "") + "]", Zf = /* @__PURE__ */ /((?:WC+[\/:])*)/.source.replace("WC", Lr), $f = /* @__PURE__ */ /(WCOD+)?/.source.replace("WCOD", Kf), Jf = /* @__PURE__ */ /(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC", Lr), Qf = /* @__PURE__ */ /\.(WC+)(?:\[(.+)\])?/.source.replace("WC", Lr), ep = new RegExp(
  "^" + Zf + $f + Jf + Qf + "$"
), tp = ["material", "materials", "bones", "map"];
class np {
  constructor(e, t, n) {
    const i = n || Je.parseTrackName(t);
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
class Je {
  constructor(e, t, n) {
    this.path = t, this.parsedPath = n || Je.parseTrackName(t), this.node = Je.findNode(e, this.parsedPath.nodeName), this.rootNode = e, this.getValue = this._getValue_unbound, this.setValue = this._setValue_unbound;
  }
  static create(e, t, n) {
    return e && e.isAnimationObjectGroup ? new Je.Composite(e, t, n) : new Je(e, t, n);
  }
  /**
   * Replaces spaces with underscores and removes unsupported characters from
   * node names, to ensure compatibility with parseTrackName().
   *
   * @param {string} name Node name to be sanitized.
   * @return {string}
   */
  static sanitizeNodeName(e) {
    return e.replace(/\s/g, "_").replace(Yf, "");
  }
  static parseTrackName(e) {
    const t = ep.exec(e);
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
      tp.indexOf(r) !== -1 && (n.nodeName = n.nodeName.substring(0, i), n.objectName = r);
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
    if (e || (e = Je.findNode(this.rootNode, t.nodeName), this.node = e), this.getValue = this._getValue_unavailable, this.setValue = this._setValue_unavailable, !e) {
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
Je.Composite = np;
Je.prototype.BindingType = {
  Direct: 0,
  EntireArray: 1,
  ArrayElement: 2,
  HasFromToArray: 3
};
Je.prototype.Versioning = {
  None: 0,
  NeedsUpdate: 1,
  MatrixWorldNeedsUpdate: 2
};
Je.prototype.GetterByBindingType = [
  Je.prototype._getValue_direct,
  Je.prototype._getValue_array,
  Je.prototype._getValue_arrayElement,
  Je.prototype._getValue_toArray
];
Je.prototype.SetterByBindingTypeAndVersioning = [
  [
    // Direct
    Je.prototype._setValue_direct,
    Je.prototype._setValue_direct_setNeedsUpdate,
    Je.prototype._setValue_direct_setMatrixWorldNeedsUpdate
  ],
  [
    // EntireArray
    Je.prototype._setValue_array,
    Je.prototype._setValue_array_setNeedsUpdate,
    Je.prototype._setValue_array_setMatrixWorldNeedsUpdate
  ],
  [
    // ArrayElement
    Je.prototype._setValue_arrayElement,
    Je.prototype._setValue_arrayElement_setNeedsUpdate,
    Je.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate
  ],
  [
    // HasToFromArray
    Je.prototype._setValue_fromArray,
    Je.prototype._setValue_fromArray_setNeedsUpdate,
    Je.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate
  ]
];
class ip {
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
const sp = new Float32Array(1);
class rp extends Un {
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
        g = new jf(
          Je.create(n, f, _),
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
    return n === void 0 && (n = new wo(
      new Float32Array(2),
      new Float32Array(2),
      1,
      sp
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
    let a = typeof e == "string" ? xr.findByName(i, e) : e;
    const o = a !== null ? a.uuid : e, c = this._actionsByClip[o];
    let l = null;
    if (n === void 0 && (a !== null ? n = a.blendMode : n = 2500), c !== void 0) {
      const u = c.actionByRoot[r];
      if (u !== void 0 && u.blendMode === n)
        return u;
      l = c.knownActions[0], a === null && (a = l._clip);
    }
    if (a === null) return null;
    const h = new ip(this, a, t, n);
    return this._bindAction(h, l), this._addInactiveAction(h, o, r), h;
  }
  // get an existing action
  existingAction(e, t) {
    const n = t || this._root, i = n.uuid, r = typeof e == "string" ? xr.findByName(n, e) : e, a = r ? r.uuid : e, o = this._actionsByClip[a];
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
typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register", { detail: {
  revision: Sr
} }));
typeof window < "u" && (window.__THREE__ ? console.warn("WARNING: Multiple instances of Three.js being imported.") : window.__THREE__ = Sr);
const ap = /^[og]\s*(.+)?/, op = /^mtllib /, cp = /^usemtl /, lp = /^usemap /, $a = /\s+/, Ja = new C(), lr = new C(), Qa = new C(), eo = new C(), Bt = new C(), os = new be();
function hp() {
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
      Ja.fromArray(i, e), lr.fromArray(i, t), Qa.fromArray(i, n), Bt.subVectors(Qa, lr), eo.subVectors(Ja, lr), Bt.cross(eo), Bt.normalize(), r.push(Bt.x, Bt.y, Bt.z), r.push(Bt.x, Bt.y, Bt.z), r.push(Bt.x, Bt.y, Bt.z);
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
class up extends yn {
  constructor(e) {
    super(e), this.materials = null;
  }
  load(e, t, n, i) {
    const r = this, a = new Es(this.manager);
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
    const t = new hp();
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
          const u = l.split($a);
          switch (u[0]) {
            case "v":
              t.vertices.push(
                parseFloat(u[1]),
                parseFloat(u[2]),
                parseFloat(u[3])
              ), u.length >= 7 ? (os.setRGB(
                parseFloat(u[4]),
                parseFloat(u[5]),
                parseFloat(u[6]),
                lt
              ), t.colors.push(os.r, os.g, os.b)) : t.colors.push(void 0, void 0, void 0);
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
          const d = l.slice(1).trim().split($a), f = [];
          for (let _ = 0, p = d.length; _ < p; _++) {
            const m = d[_];
            if (m.length > 0) {
              const T = m.split("/");
              f.push(T);
            }
          }
          const g = f[0];
          for (let _ = 1, p = f.length - 1; _ < p; _++) {
            const m = f[_], T = f[_ + 1];
            t.addFace(
              g[0],
              m[0],
              T[0],
              g[1],
              m[1],
              T[1],
              g[2],
              m[2],
              T[2]
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
              const p = u[g].split("/");
              p[0] !== "" && d.push(p[0]), p[1] !== "" && f.push(p[1]);
            }
          t.addLineGeometry(d, f);
        } else if (h === "p") {
          const d = l.slice(1).trim().split(" ");
          t.addPointGeometry(d);
        } else if ((i = ap.exec(l)) !== null) {
          const u = (" " + i[0].slice(1).trim()).slice(1);
          t.startObject(u);
        } else if (cp.test(l))
          t.object.startMaterial(l.substring(7).trim(), t.materialLibraries);
        else if (op.test(l))
          t.materialLibraries.push(l.substring(7).trim());
        else if (lp.test(l))
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
    const r = new Ct();
    if (r.materialLibraries = [].concat(t.materialLibraries), !(t.objects.length === 1 && t.objects[0].geometry.vertices.length === 0) === !0)
      for (let o = 0, c = t.objects.length; o < c; o++) {
        const l = t.objects[o], h = l.geometry, u = l.materials, d = h.type === "Line", f = h.type === "Points";
        let g = !1;
        if (h.vertices.length === 0) continue;
        const _ = new vt();
        _.setAttribute("position", new nt(h.vertices, 3)), h.normals.length > 0 && _.setAttribute("normal", new nt(h.normals, 3)), h.colors.length > 0 && (g = !0, _.setAttribute("color", new nt(h.colors, 3))), h.hasUVIndices === !0 && _.setAttribute("uv", new nt(h.uvs, 2));
        const p = [];
        for (let T = 0, y = u.length; T < y; T++) {
          const A = u[T], L = A.name + "_" + A.smooth + "_" + g;
          let w = t.materials[L];
          if (this.materials !== null) {
            if (w = this.materials.create(A.name), d && w && !(w instanceof ti)) {
              const R = new ti();
              Nt.prototype.copy.call(R, w), R.color.copy(w.color), w = R;
            } else if (f && w && !(w instanceof Jn)) {
              const R = new Jn({ size: 10, sizeAttenuation: !1 });
              Nt.prototype.copy.call(R, w), R.color.copy(w.color), R.map = w.map, w = R;
            }
          }
          w === void 0 && (d ? w = new ti() : f ? w = new Jn({ size: 1, sizeAttenuation: !1 }) : w = new Ao(), w.name = A.name, w.flatShading = !A.smooth, w.vertexColors = g, t.materials[L] = w), p.push(w);
        }
        let m;
        if (p.length > 1) {
          for (let T = 0, y = u.length; T < y; T++) {
            const A = u[T];
            _.addGroup(A.groupStart, A.groupCount, T);
          }
          d ? m = new gs(_, p) : f ? m = new hs(_, p) : m = new Qe(_, p);
        } else
          d ? m = new gs(_, p[0]) : f ? m = new hs(_, p[0]) : m = new Qe(_, p[0]);
        m.name = l.name, r.add(m);
      }
    else if (t.vertices.length > 0) {
      const o = new Jn({ size: 1, sizeAttenuation: !1 }), c = new vt();
      c.setAttribute("position", new nt(t.vertices, 3)), t.colors.length > 0 && t.colors[0] !== void 0 && (c.setAttribute("color", new nt(t.colors, 3)), o.vertexColors = !0);
      const l = new hs(c, o);
      r.add(l);
    }
    return r;
  }
}
class dp extends yn {
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
    const r = this, a = this.path === "" ? ni.extractUrlBase(e) : this.path, o = new Es(this.manager);
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
    const o = new fp(this.resourcePath || t, this.materialOptions);
    return o.setCrossOrigin(this.crossOrigin), o.setManager(this.manager), o.setMaterials(a), o;
  }
}
class fp {
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
      h.repeat.copy(l.scale), h.offset.copy(l.offset), h.wrapS = t.wrap, h.wrapT = t.wrap, (o === "map" || o === "emissiveMap") && (h.colorSpace = lt), i[o] = h;
    }
    for (const o in n) {
      const c = n[o];
      let l;
      if (c !== "")
        switch (o.toLowerCase()) {
          case "kd":
            i.color = Ve.toWorkingColorSpace(new be().fromArray(c), lt);
            break;
          case "ks":
            i.specular = Ve.toWorkingColorSpace(new be().fromArray(c), lt);
            break;
          case "ke":
            i.emissive = Ve.toWorkingColorSpace(new be().fromArray(c), lt);
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
    return this.materials[e] = new Ao(i), this.materials[e];
  }
  getTextureParams(e, t) {
    const n = {
      scale: new Be(1, 1),
      offset: new Be(0, 0)
    }, i = e.split(/\s+/);
    let r;
    return r = i.indexOf("-bm"), r >= 0 && (t.bumpScale = parseFloat(i[r + 1]), i.splice(r, 2)), r = i.indexOf("-s"), r >= 0 && (n.scale.set(parseFloat(i[r + 1]), parseFloat(i[r + 2])), i.splice(r, 4)), r = i.indexOf("-o"), r >= 0 && (n.offset.set(parseFloat(i[r + 1]), parseFloat(i[r + 2])), i.splice(r, 4)), n.url = i.join(" ").trim(), n;
  }
  loadTexture(e, t, n, i, r) {
    const a = this.manager !== void 0 ? this.manager : Co;
    let o = a.getHandler(e);
    o === null && (o = new Io(a)), o.setCrossOrigin && o.setCrossOrigin(this.crossOrigin);
    const c = o.load(e, n, i, r);
    return t !== void 0 && (c.mapping = t), c;
  }
}
function to(s, e) {
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
class pp extends yn {
  constructor(e) {
    super(e), this.dracoLoader = null, this.ktx2Loader = null, this.meshoptDecoder = null, this.pluginCallbacks = [], this.register(function(t) {
      return new vp(t);
    }), this.register(function(t) {
      return new Mp(t);
    }), this.register(function(t) {
      return new Cp(t);
    }), this.register(function(t) {
      return new Ip(t);
    }), this.register(function(t) {
      return new Pp(t);
    }), this.register(function(t) {
      return new yp(t);
    }), this.register(function(t) {
      return new Ep(t);
    }), this.register(function(t) {
      return new Tp(t);
    }), this.register(function(t) {
      return new Ap(t);
    }), this.register(function(t) {
      return new xp(t);
    }), this.register(function(t) {
      return new bp(t);
    }), this.register(function(t) {
      return new Sp(t);
    }), this.register(function(t) {
      return new Rp(t);
    }), this.register(function(t) {
      return new wp(t);
    }), this.register(function(t) {
      return new gp(t);
    }), this.register(function(t) {
      return new Lp(t);
    }), this.register(function(t) {
      return new Dp(t);
    });
  }
  load(e, t, n, i) {
    const r = this;
    let a;
    if (this.resourcePath !== "")
      a = this.resourcePath;
    else if (this.path !== "") {
      const l = ni.extractUrlBase(e);
      a = ni.resolveURL(l, this.path);
    } else
      a = ni.extractUrlBase(e);
    this.manager.itemStart(e);
    const o = function(l) {
      i ? i(l) : console.error(l), r.manager.itemError(e), r.manager.itemEnd(e);
    }, c = new Es(this.manager);
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
      if (c.decode(new Uint8Array(e, 0, 4)) === Lo) {
        try {
          a[Ge.KHR_BINARY_GLTF] = new Np(e);
        } catch (u) {
          i && i(u);
          return;
        }
        r = JSON.parse(a[Ge.KHR_BINARY_GLTF].content);
      } else
        r = JSON.parse(c.decode(e));
    else
      r = e;
    if (r.asset === void 0 || r.asset.version[0] < 2) {
      i && i(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));
      return;
    }
    const l = new jp(r, {
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
          case Ge.KHR_MATERIALS_UNLIT:
            a[u] = new _p();
            break;
          case Ge.KHR_DRACO_MESH_COMPRESSION:
            a[u] = new Up(r, this.dracoLoader);
            break;
          case Ge.KHR_TEXTURE_TRANSFORM:
            a[u] = new Fp();
            break;
          case Ge.KHR_MESH_QUANTIZATION:
            a[u] = new Bp();
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
function mp() {
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
const Ge = {
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
class gp {
  constructor(e) {
    this.parser = e, this.name = Ge.KHR_LIGHTS_PUNCTUAL, this.cache = { refs: {}, uses: {} };
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
    const h = new be(16777215);
    c.color !== void 0 && h.setRGB(c.color[0], c.color[1], c.color[2], xt);
    const u = c.range !== void 0 ? c.range : 0;
    switch (c.type) {
      case "directional":
        l = new Po(h), l.target.position.set(0, 0, -1), l.add(l.target);
        break;
      case "point":
        l = new Hf(h), l.distance = u;
        break;
      case "spot":
        l = new kf(h), l.distance = u, c.spot = c.spot || {}, c.spot.innerConeAngle = c.spot.innerConeAngle !== void 0 ? c.spot.innerConeAngle : 0, c.spot.outerConeAngle = c.spot.outerConeAngle !== void 0 ? c.spot.outerConeAngle : Math.PI / 4, l.angle = c.spot.outerConeAngle, l.penumbra = 1 - c.spot.innerConeAngle / c.spot.outerConeAngle, l.target.position.set(0, 0, -1), l.add(l.target);
        break;
      default:
        throw new Error("THREE.GLTFLoader: Unexpected light type: " + c.type);
    }
    return l.position.set(0, 0, 0), l.decay = 2, hn(l, c), c.intensity !== void 0 && (l.intensity = c.intensity), l.name = t.createUniqueName(c.name || "light_" + e), i = Promise.resolve(l), t.cache.add(n, i), i;
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
class _p {
  constructor() {
    this.name = Ge.KHR_MATERIALS_UNLIT;
  }
  getMaterialType() {
    return jt;
  }
  extendParams(e, t, n) {
    const i = [];
    e.color = new be(1, 1, 1), e.opacity = 1;
    const r = t.pbrMetallicRoughness;
    if (r) {
      if (Array.isArray(r.baseColorFactor)) {
        const a = r.baseColorFactor;
        e.color.setRGB(a[0], a[1], a[2], xt), e.opacity = a[3];
      }
      r.baseColorTexture !== void 0 && i.push(n.assignTexture(e, "map", r.baseColorTexture, lt));
    }
    return Promise.all(i);
  }
}
class xp {
  constructor(e) {
    this.parser = e, this.name = Ge.KHR_MATERIALS_EMISSIVE_STRENGTH;
  }
  extendMaterialParams(e, t) {
    const i = this.parser.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = i.extensions[this.name].emissiveStrength;
    return r !== void 0 && (t.emissiveIntensity = r), Promise.resolve();
  }
}
class vp {
  constructor(e) {
    this.parser = e, this.name = Ge.KHR_MATERIALS_CLEARCOAT;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : en;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, i = n.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = [], a = i.extensions[this.name];
    if (a.clearcoatFactor !== void 0 && (t.clearcoat = a.clearcoatFactor), a.clearcoatTexture !== void 0 && r.push(n.assignTexture(t, "clearcoatMap", a.clearcoatTexture)), a.clearcoatRoughnessFactor !== void 0 && (t.clearcoatRoughness = a.clearcoatRoughnessFactor), a.clearcoatRoughnessTexture !== void 0 && r.push(n.assignTexture(t, "clearcoatRoughnessMap", a.clearcoatRoughnessTexture)), a.clearcoatNormalTexture !== void 0 && (r.push(n.assignTexture(t, "clearcoatNormalMap", a.clearcoatNormalTexture)), a.clearcoatNormalTexture.scale !== void 0)) {
      const o = a.clearcoatNormalTexture.scale;
      t.clearcoatNormalScale = new Be(o, o);
    }
    return Promise.all(r);
  }
}
class Mp {
  constructor(e) {
    this.parser = e, this.name = Ge.KHR_MATERIALS_DISPERSION;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : en;
  }
  extendMaterialParams(e, t) {
    const i = this.parser.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = i.extensions[this.name];
    return t.dispersion = r.dispersion !== void 0 ? r.dispersion : 0, Promise.resolve();
  }
}
class Sp {
  constructor(e) {
    this.parser = e, this.name = Ge.KHR_MATERIALS_IRIDESCENCE;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : en;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, i = n.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = [], a = i.extensions[this.name];
    return a.iridescenceFactor !== void 0 && (t.iridescence = a.iridescenceFactor), a.iridescenceTexture !== void 0 && r.push(n.assignTexture(t, "iridescenceMap", a.iridescenceTexture)), a.iridescenceIor !== void 0 && (t.iridescenceIOR = a.iridescenceIor), t.iridescenceThicknessRange === void 0 && (t.iridescenceThicknessRange = [100, 400]), a.iridescenceThicknessMinimum !== void 0 && (t.iridescenceThicknessRange[0] = a.iridescenceThicknessMinimum), a.iridescenceThicknessMaximum !== void 0 && (t.iridescenceThicknessRange[1] = a.iridescenceThicknessMaximum), a.iridescenceThicknessTexture !== void 0 && r.push(n.assignTexture(t, "iridescenceThicknessMap", a.iridescenceThicknessTexture)), Promise.all(r);
  }
}
class yp {
  constructor(e) {
    this.parser = e, this.name = Ge.KHR_MATERIALS_SHEEN;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : en;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, i = n.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = [];
    t.sheenColor = new be(0, 0, 0), t.sheenRoughness = 0, t.sheen = 1;
    const a = i.extensions[this.name];
    if (a.sheenColorFactor !== void 0) {
      const o = a.sheenColorFactor;
      t.sheenColor.setRGB(o[0], o[1], o[2], xt);
    }
    return a.sheenRoughnessFactor !== void 0 && (t.sheenRoughness = a.sheenRoughnessFactor), a.sheenColorTexture !== void 0 && r.push(n.assignTexture(t, "sheenColorMap", a.sheenColorTexture, lt)), a.sheenRoughnessTexture !== void 0 && r.push(n.assignTexture(t, "sheenRoughnessMap", a.sheenRoughnessTexture)), Promise.all(r);
  }
}
class Ep {
  constructor(e) {
    this.parser = e, this.name = Ge.KHR_MATERIALS_TRANSMISSION;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : en;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, i = n.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = [], a = i.extensions[this.name];
    return a.transmissionFactor !== void 0 && (t.transmission = a.transmissionFactor), a.transmissionTexture !== void 0 && r.push(n.assignTexture(t, "transmissionMap", a.transmissionTexture)), Promise.all(r);
  }
}
class Tp {
  constructor(e) {
    this.parser = e, this.name = Ge.KHR_MATERIALS_VOLUME;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : en;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, i = n.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = [], a = i.extensions[this.name];
    t.thickness = a.thicknessFactor !== void 0 ? a.thicknessFactor : 0, a.thicknessTexture !== void 0 && r.push(n.assignTexture(t, "thicknessMap", a.thicknessTexture)), t.attenuationDistance = a.attenuationDistance || 1 / 0;
    const o = a.attenuationColor || [1, 1, 1];
    return t.attenuationColor = new be().setRGB(o[0], o[1], o[2], xt), Promise.all(r);
  }
}
class Ap {
  constructor(e) {
    this.parser = e, this.name = Ge.KHR_MATERIALS_IOR;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : en;
  }
  extendMaterialParams(e, t) {
    const i = this.parser.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = i.extensions[this.name];
    return t.ior = r.ior !== void 0 ? r.ior : 1.5, Promise.resolve();
  }
}
class bp {
  constructor(e) {
    this.parser = e, this.name = Ge.KHR_MATERIALS_SPECULAR;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : en;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, i = n.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = [], a = i.extensions[this.name];
    t.specularIntensity = a.specularFactor !== void 0 ? a.specularFactor : 1, a.specularTexture !== void 0 && r.push(n.assignTexture(t, "specularIntensityMap", a.specularTexture));
    const o = a.specularColorFactor || [1, 1, 1];
    return t.specularColor = new be().setRGB(o[0], o[1], o[2], xt), a.specularColorTexture !== void 0 && r.push(n.assignTexture(t, "specularColorMap", a.specularColorTexture, lt)), Promise.all(r);
  }
}
class wp {
  constructor(e) {
    this.parser = e, this.name = Ge.EXT_MATERIALS_BUMP;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : en;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, i = n.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = [], a = i.extensions[this.name];
    return t.bumpScale = a.bumpFactor !== void 0 ? a.bumpFactor : 1, a.bumpTexture !== void 0 && r.push(n.assignTexture(t, "bumpMap", a.bumpTexture)), Promise.all(r);
  }
}
class Rp {
  constructor(e) {
    this.parser = e, this.name = Ge.KHR_MATERIALS_ANISOTROPY;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : en;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, i = n.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = [], a = i.extensions[this.name];
    return a.anisotropyStrength !== void 0 && (t.anisotropy = a.anisotropyStrength), a.anisotropyRotation !== void 0 && (t.anisotropyRotation = a.anisotropyRotation), a.anisotropyTexture !== void 0 && r.push(n.assignTexture(t, "anisotropyMap", a.anisotropyTexture)), Promise.all(r);
  }
}
class Cp {
  constructor(e) {
    this.parser = e, this.name = Ge.KHR_TEXTURE_BASISU;
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
class Ip {
  constructor(e) {
    this.parser = e, this.name = Ge.EXT_TEXTURE_WEBP, this.isSupported = null;
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
class Pp {
  constructor(e) {
    this.parser = e, this.name = Ge.EXT_TEXTURE_AVIF, this.isSupported = null;
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
class Lp {
  constructor(e) {
    this.name = Ge.EXT_MESHOPT_COMPRESSION, this.parser = e;
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
class Dp {
  constructor(e) {
    this.name = Ge.EXT_MESH_GPU_INSTANCING, this.parser = e;
  }
  createNodeMesh(e) {
    const t = this.parser.json, n = t.nodes[e];
    if (!n.extensions || !n.extensions[this.name] || n.mesh === void 0)
      return null;
    const i = t.meshes[n.mesh];
    for (const l of i.primitives)
      if (l.mode !== Ot.TRIANGLES && l.mode !== Ot.TRIANGLE_STRIP && l.mode !== Ot.TRIANGLE_FAN && l.mode !== void 0)
        return null;
    const a = n.extensions[this.name].attributes, o = [], c = {};
    for (const l in a)
      o.push(this.parser.getDependency("accessor", a[l]).then((h) => (c[l] = h, c[l])));
    return o.length < 1 ? null : (o.push(this.parser.createNodeMesh(e)), Promise.all(o).then((l) => {
      const h = l.pop(), u = h.isGroup ? h.children : [h], d = l[0].count, f = [];
      for (const g of u) {
        const _ = new Ne(), p = new C(), m = new Kt(), T = new C(1, 1, 1), y = new bf(g.geometry, g.material, d);
        for (let A = 0; A < d; A++)
          c.TRANSLATION && p.fromBufferAttribute(c.TRANSLATION, A), c.ROTATION && m.fromBufferAttribute(c.ROTATION, A), c.SCALE && T.fromBufferAttribute(c.SCALE, A), y.setMatrixAt(A, _.compose(p, m, T));
        for (const A in c)
          if (A === "_COLOR_0") {
            const L = c[A];
            y.instanceColor = new gr(L.array, L.itemSize, L.normalized);
          } else A !== "TRANSLATION" && A !== "ROTATION" && A !== "SCALE" && g.geometry.setAttribute(A, c[A]);
        at.prototype.copy.call(y, g), this.parser.assignFinalMaterial(y), f.push(y);
      }
      return h.isGroup ? (h.clear(), h.add(...f), h) : f[0];
    }));
  }
}
const Lo = "glTF", yi = 12, no = { JSON: 1313821514, BIN: 5130562 };
class Np {
  constructor(e) {
    this.name = Ge.KHR_BINARY_GLTF, this.content = null, this.body = null;
    const t = new DataView(e, 0, yi), n = new TextDecoder();
    if (this.header = {
      magic: n.decode(new Uint8Array(e.slice(0, 4))),
      version: t.getUint32(4, !0),
      length: t.getUint32(8, !0)
    }, this.header.magic !== Lo)
      throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");
    if (this.header.version < 2)
      throw new Error("THREE.GLTFLoader: Legacy binary file detected.");
    const i = this.header.length - yi, r = new DataView(e, yi);
    let a = 0;
    for (; a < i; ) {
      const o = r.getUint32(a, !0);
      a += 4;
      const c = r.getUint32(a, !0);
      if (a += 4, c === no.JSON) {
        const l = new Uint8Array(e, yi + a, o);
        this.content = n.decode(l);
      } else if (c === no.BIN) {
        const l = yi + a;
        this.body = e.slice(l, l + o);
      }
      a += o;
    }
    if (this.content === null)
      throw new Error("THREE.GLTFLoader: JSON content not found.");
  }
}
class Up {
  constructor(e, t) {
    if (!t)
      throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");
    this.name = Ge.KHR_DRACO_MESH_COMPRESSION, this.json = e, this.dracoLoader = t, this.dracoLoader.preload();
  }
  decodePrimitive(e, t) {
    const n = this.json, i = this.dracoLoader, r = e.extensions[this.name].bufferView, a = e.extensions[this.name].attributes, o = {}, c = {}, l = {};
    for (const h in a) {
      const u = vr[h] || h.toLowerCase();
      o[u] = a[h];
    }
    for (const h in e.attributes) {
      const u = vr[h] || h.toLowerCase();
      if (a[h] !== void 0) {
        const d = n.accessors[e.attributes[h]], f = ii[d.componentType];
        l[u] = f.name, c[u] = d.normalized === !0;
      }
    }
    return t.getDependency("bufferView", r).then(function(h) {
      return new Promise(function(u, d) {
        i.decodeDracoFile(h, function(f) {
          for (const g in f.attributes) {
            const _ = f.attributes[g], p = c[g];
            p !== void 0 && (_.normalized = p);
          }
          u(f);
        }, o, l, xt, d);
      });
    });
  }
}
class Fp {
  constructor() {
    this.name = Ge.KHR_TEXTURE_TRANSFORM;
  }
  extendTexture(e, t) {
    return (t.texCoord === void 0 || t.texCoord === e.channel) && t.offset === void 0 && t.rotation === void 0 && t.scale === void 0 || (e = e.clone(), t.texCoord !== void 0 && (e.channel = t.texCoord), t.offset !== void 0 && e.offset.fromArray(t.offset), t.rotation !== void 0 && (e.rotation = t.rotation), t.scale !== void 0 && e.repeat.fromArray(t.scale), e.needsUpdate = !0), e;
  }
}
class Bp {
  constructor() {
    this.name = Ge.KHR_MESH_QUANTIZATION;
  }
}
class Do extends Ri {
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
    const r = this.resultBuffer, a = this.sampleValues, o = this.valueSize, c = o * 2, l = o * 3, h = i - t, u = (n - t) / h, d = u * u, f = d * u, g = e * l, _ = g - l, p = -2 * f + 3 * d, m = f - d, T = 1 - p, y = m - d + u;
    for (let A = 0; A !== o; A++) {
      const L = a[_ + A + o], w = a[_ + A + c] * h, R = a[g + A + o], N = a[g + A] * h;
      r[A] = T * L + y * w + p * R + m * N;
    }
    return r;
  }
}
const Op = new Kt();
class Gp extends Do {
  interpolate_(e, t, n, i) {
    const r = super.interpolate_(e, t, n, i);
    return Op.fromArray(r).normalize().toArray(r), r;
  }
}
const Ot = {
  POINTS: 0,
  LINES: 1,
  LINE_LOOP: 2,
  LINE_STRIP: 3,
  TRIANGLES: 4,
  TRIANGLE_STRIP: 5,
  TRIANGLE_FAN: 6
}, ii = {
  5120: Int8Array,
  5121: Uint8Array,
  5122: Int16Array,
  5123: Uint16Array,
  5125: Uint32Array,
  5126: Float32Array
}, io = {
  9728: 1003,
  9729: 1006,
  9984: 1004,
  9985: 1007,
  9986: 1005,
  9987: 1008
}, so = {
  33071: 1001,
  33648: 1002,
  10497: 1e3
}, hr = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT2: 4,
  MAT3: 9,
  MAT4: 16
}, vr = {
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
}, xn = {
  scale: "scale",
  translation: "position",
  rotation: "quaternion",
  weights: "morphTargetInfluences"
}, zp = {
  CUBICSPLINE: void 0,
  // We use a custom interpolant (GLTFCubicSplineInterpolation) for CUBICSPLINE tracks. Each
  // keyframe track will be initialized with a default interpolation type, then modified.
  LINEAR: 2301,
  STEP: 2300
}, ur = {
  OPAQUE: "OPAQUE",
  MASK: "MASK",
  BLEND: "BLEND"
};
function kp(s) {
  return s.DefaultMaterial === void 0 && (s.DefaultMaterial = new Xt({
    color: 16777215,
    emissive: 0,
    metalness: 1,
    roughness: 1,
    transparent: !1,
    depthTest: !0,
    side: 0
  })), s.DefaultMaterial;
}
function In(s, e, t) {
  for (const n in t.extensions)
    s[n] === void 0 && (e.userData.gltfExtensions = e.userData.gltfExtensions || {}, e.userData.gltfExtensions[n] = t.extensions[n]);
}
function hn(s, e) {
  e.extras !== void 0 && (typeof e.extras == "object" ? Object.assign(s.userData, e.extras) : console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, " + e.extras));
}
function Vp(s, e, t) {
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
function Hp(s, e) {
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
function Wp(s) {
  let e;
  const t = s.extensions && s.extensions[Ge.KHR_DRACO_MESH_COMPRESSION];
  if (t ? e = "draco:" + t.bufferView + ":" + t.indices + ":" + dr(t.attributes) : e = s.indices + ":" + dr(s.attributes) + ":" + s.mode, s.targets !== void 0)
    for (let n = 0, i = s.targets.length; n < i; n++)
      e += ":" + dr(s.targets[n]);
  return e;
}
function dr(s) {
  let e = "";
  const t = Object.keys(s).sort();
  for (let n = 0, i = t.length; n < i; n++)
    e += t[n] + ":" + s[t[n]] + ";";
  return e;
}
function Mr(s) {
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
function Xp(s) {
  return s.search(/\.jpe?g($|\?)/i) > 0 || s.search(/^data\:image\/jpeg/) === 0 ? "image/jpeg" : s.search(/\.webp($|\?)/i) > 0 || s.search(/^data\:image\/webp/) === 0 ? "image/webp" : "image/png";
}
const qp = new Ne();
class jp {
  constructor(e = {}, t = {}) {
    this.json = e, this.extensions = {}, this.plugins = {}, this.options = t, this.cache = new mp(), this.associations = /* @__PURE__ */ new Map(), this.primitiveCache = {}, this.nodeCache = {}, this.meshCache = { refs: {}, uses: {} }, this.cameraCache = { refs: {}, uses: {} }, this.lightCache = { refs: {}, uses: {} }, this.sourceCache = {}, this.textureCache = {}, this.nodeNamesUsed = {};
    let n = !1, i = -1, r = !1, a = -1;
    if (typeof navigator < "u") {
      const o = navigator.userAgent;
      n = /^((?!chrome|android).)*safari/i.test(o) === !0;
      const c = o.match(/Version\/(\d+)/);
      i = n && c ? parseInt(c[1], 10) : -1, r = o.indexOf("Firefox") > -1, a = r ? o.match(/Firefox\/([0-9]+)\./)[1] : -1;
    }
    typeof createImageBitmap > "u" || n && i < 17 || r && a < 98 ? this.textureLoader = new Io(this.options.manager) : this.textureLoader = new Xf(this.options.manager), this.textureLoader.setCrossOrigin(this.options.crossOrigin), this.textureLoader.setRequestHeader(this.options.requestHeader), this.fileLoader = new Es(this.options.manager), this.fileLoader.setResponseType("arraybuffer"), this.options.crossOrigin === "use-credentials" && this.fileLoader.setWithCredentials(!0);
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
      return In(r, o, i), hn(o, i), Promise.all(n._invokeAll(function(c) {
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
      return Promise.resolve(this.extensions[Ge.KHR_BINARY_GLTF].body);
    const i = this.options;
    return new Promise(function(r, a) {
      n.load(ni.resolveURL(t.uri, i.path), r, void 0, function() {
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
      const a = hr[i.type], o = ii[i.componentType], c = i.normalized === !0, l = new o(i.count * a);
      return Promise.resolve(new At(l, a, c));
    }
    const r = [];
    return i.bufferView !== void 0 ? r.push(this.getDependency("bufferView", i.bufferView)) : r.push(null), i.sparse !== void 0 && (r.push(this.getDependency("bufferView", i.sparse.indices.bufferView)), r.push(this.getDependency("bufferView", i.sparse.values.bufferView))), Promise.all(r).then(function(a) {
      const o = a[0], c = hr[i.type], l = ii[i.componentType], h = l.BYTES_PER_ELEMENT, u = h * c, d = i.byteOffset || 0, f = i.bufferView !== void 0 ? n.bufferViews[i.bufferView].byteStride : void 0, g = i.normalized === !0;
      let _, p;
      if (f && f !== u) {
        const m = Math.floor(d / f), T = "InterleavedBuffer:" + i.bufferView + ":" + i.componentType + ":" + m + ":" + i.count;
        let y = t.cache.get(T);
        y || (_ = new l(o, m * f, i.count * f / h), y = new Sf(_, f / h), t.cache.add(T, y)), p = new br(y, c, d % f / h, g);
      } else
        o === null ? _ = new l(i.count * c) : _ = new l(o, d, i.count * c), p = new At(_, c, g);
      if (i.sparse !== void 0) {
        const m = hr.SCALAR, T = ii[i.sparse.indices.componentType], y = i.sparse.indices.byteOffset || 0, A = i.sparse.values.byteOffset || 0, L = new T(a[1], y, i.sparse.count * m), w = new l(a[2], A, i.sparse.count * c);
        o !== null && (p = new At(p.array.slice(), p.itemSize, p.normalized)), p.normalized = !1;
        for (let R = 0, N = L.length; R < N; R++) {
          const K = L[R];
          if (p.setX(K, w[R * c]), c >= 2 && p.setY(K, w[R * c + 1]), c >= 3 && p.setZ(K, w[R * c + 2]), c >= 4 && p.setW(K, w[R * c + 3]), c >= 5) throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.");
        }
        p.normalized = g;
      }
      return p;
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
      return h.magFilter = io[d.magFilter] || 1006, h.minFilter = io[d.minFilter] || 1008, h.wrapS = so[d.wrapS] || 1e3, h.wrapT = so[d.wrapT] || 1e3, i.associations.set(h, { textures: e }), h;
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
          const p = new gt(_);
          p.needsUpdate = !0, d(p);
        }), t.load(ni.resolveURL(u, r.path), g, void 0, f);
      });
    }).then(function(u) {
      return l === !0 && o.revokeObjectURL(c), hn(u, a), u.userData.mimeType = a.mimeType || Xp(a.uri), u;
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
      if (n.texCoord !== void 0 && n.texCoord > 0 && (a = a.clone(), a.channel = n.texCoord), r.extensions[Ge.KHR_TEXTURE_TRANSFORM]) {
        const o = n.extensions !== void 0 ? n.extensions[Ge.KHR_TEXTURE_TRANSFORM] : void 0;
        if (o) {
          const c = r.associations.get(a);
          a = r.extensions[Ge.KHR_TEXTURE_TRANSFORM].extendTexture(a, o), r.associations.set(a, c);
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
      c || (c = new Jn(), Nt.prototype.copy.call(c, n), c.color.copy(n.color), c.map = n.map, c.sizeAttenuation = !1, this.cache.add(o, c)), n = c;
    } else if (e.isLine) {
      const o = "LineBasicMaterial:" + n.uuid;
      let c = this.cache.get(o);
      c || (c = new ti(), Nt.prototype.copy.call(c, n), c.color.copy(n.color), c.map = n.map, this.cache.add(o, c)), n = c;
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
    return Xt;
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
    if (c[Ge.KHR_MATERIALS_UNLIT]) {
      const u = i[Ge.KHR_MATERIALS_UNLIT];
      a = u.getMaterialType(), l.push(u.extendParams(o, r, t));
    } else {
      const u = r.pbrMetallicRoughness || {};
      if (o.color = new be(1, 1, 1), o.opacity = 1, Array.isArray(u.baseColorFactor)) {
        const d = u.baseColorFactor;
        o.color.setRGB(d[0], d[1], d[2], xt), o.opacity = d[3];
      }
      u.baseColorTexture !== void 0 && l.push(t.assignTexture(o, "map", u.baseColorTexture, lt)), o.metalness = u.metallicFactor !== void 0 ? u.metallicFactor : 1, o.roughness = u.roughnessFactor !== void 0 ? u.roughnessFactor : 1, u.metallicRoughnessTexture !== void 0 && (l.push(t.assignTexture(o, "metalnessMap", u.metallicRoughnessTexture)), l.push(t.assignTexture(o, "roughnessMap", u.metallicRoughnessTexture))), a = this._invokeOne(function(d) {
        return d.getMaterialType && d.getMaterialType(e);
      }), l.push(Promise.all(this._invokeAll(function(d) {
        return d.extendMaterialParams && d.extendMaterialParams(e, o);
      })));
    }
    r.doubleSided === !0 && (o.side = 2);
    const h = r.alphaMode || ur.OPAQUE;
    if (h === ur.BLEND ? (o.transparent = !0, o.depthWrite = !1) : (o.transparent = !1, h === ur.MASK && (o.alphaTest = r.alphaCutoff !== void 0 ? r.alphaCutoff : 0.5)), r.normalTexture !== void 0 && a !== jt && (l.push(t.assignTexture(o, "normalMap", r.normalTexture)), o.normalScale = new Be(1, 1), r.normalTexture.scale !== void 0)) {
      const u = r.normalTexture.scale;
      o.normalScale.set(u, u);
    }
    if (r.occlusionTexture !== void 0 && a !== jt && (l.push(t.assignTexture(o, "aoMap", r.occlusionTexture)), r.occlusionTexture.strength !== void 0 && (o.aoMapIntensity = r.occlusionTexture.strength)), r.emissiveFactor !== void 0 && a !== jt) {
      const u = r.emissiveFactor;
      o.emissive = new be().setRGB(u[0], u[1], u[2], xt);
    }
    return r.emissiveTexture !== void 0 && a !== jt && l.push(t.assignTexture(o, "emissiveMap", r.emissiveTexture, lt)), Promise.all(l).then(function() {
      const u = new a(o);
      return r.name && (u.name = r.name), hn(u, r), t.associations.set(u, { materials: e }), r.extensions && In(i, u, r), u;
    });
  }
  /** When Object3D instances are targeted by animation, they need unique names. */
  createUniqueName(e) {
    const t = Je.sanitizeNodeName(e || "");
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
      return n[Ge.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(o, t).then(function(c) {
        return ro(c, o, t);
      });
    }
    const a = [];
    for (let o = 0, c = e.length; o < c; o++) {
      const l = e[o], h = Wp(l), u = i[h];
      if (u)
        a.push(u.promise);
      else {
        let d;
        l.extensions && l.extensions[Ge.KHR_DRACO_MESH_COMPRESSION] ? d = r(l) : d = ro(new vt(), l, t), i[h] = { primitive: l, promise: d }, a.push(d);
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
      const h = a[c].material === void 0 ? kp(this.cache) : this.getDependency("material", a[c].material);
      o.push(h);
    }
    return o.push(t.loadGeometries(a)), Promise.all(o).then(function(c) {
      const l = c.slice(0, c.length - 1), h = c[c.length - 1], u = [];
      for (let f = 0, g = h.length; f < g; f++) {
        const _ = h[f], p = a[f];
        let m;
        const T = l[f];
        if (p.mode === Ot.TRIANGLES || p.mode === Ot.TRIANGLE_STRIP || p.mode === Ot.TRIANGLE_FAN || p.mode === void 0)
          m = r.isSkinnedMesh === !0 ? new Ef(_, T) : new Qe(_, T), m.isSkinnedMesh === !0 && m.normalizeSkinWeights(), p.mode === Ot.TRIANGLE_STRIP ? m.geometry = to(m.geometry, 1) : p.mode === Ot.TRIANGLE_FAN && (m.geometry = to(m.geometry, 2));
        else if (p.mode === Ot.LINES)
          m = new gs(_, T);
        else if (p.mode === Ot.LINE_STRIP)
          m = new Rr(_, T);
        else if (p.mode === Ot.LINE_LOOP)
          m = new wf(_, T);
        else if (p.mode === Ot.POINTS)
          m = new hs(_, T);
        else
          throw new Error("THREE.GLTFLoader: Primitive mode unsupported: " + p.mode);
        Object.keys(m.geometry.morphAttributes).length > 0 && Hp(m, r), m.name = t.createUniqueName(r.name || "mesh_" + e), hn(m, r), p.extensions && In(i, m, p), t.assignFinalMaterial(m), u.push(m);
      }
      for (let f = 0, g = u.length; f < g; f++)
        t.associations.set(u[f], {
          meshes: e,
          primitives: f
        });
      if (u.length === 1)
        return r.extensions && In(i, u[0], r), u[0];
      const d = new Ct();
      r.extensions && In(i, d, r), t.associations.set(d, { meshes: e });
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
    return n.type === "perspective" ? t = new Rt(sc.radToDeg(i.yfov), i.aspectRatio || 1, i.znear || 1, i.zfar || 2e6) : n.type === "orthographic" && (t = new Ms(-i.xmag, i.xmag, i.ymag, -i.ymag, i.znear, i.zfar)), n.name && (t.name = this.createUniqueName(n.name)), hn(t, n), Promise.resolve(t);
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
          const d = new Ne();
          r !== null && d.fromArray(r.array, l * 16), c.push(d);
        } else
          console.warn('THREE.GLTFLoader: Joint "%s" could not be found.', t.joints[l]);
      }
      return new wr(o, c);
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
      const f = i.channels[u], g = i.samplers[f.sampler], _ = f.target, p = _.node, m = i.parameters !== void 0 ? i.parameters[g.input] : g.input, T = i.parameters !== void 0 ? i.parameters[g.output] : g.output;
      _.node !== void 0 && (a.push(this.getDependency("node", p)), o.push(this.getDependency("accessor", m)), c.push(this.getDependency("accessor", T)), l.push(g), h.push(_));
    }
    return Promise.all([
      Promise.all(a),
      Promise.all(o),
      Promise.all(c),
      Promise.all(l),
      Promise.all(h)
    ]).then(function(u) {
      const d = u[0], f = u[1], g = u[2], _ = u[3], p = u[4], m = [];
      for (let T = 0, y = d.length; T < y; T++) {
        const A = d[T], L = f[T], w = g[T], R = _[T], N = p[T];
        if (A === void 0) continue;
        A.updateMatrix && A.updateMatrix();
        const K = n._createAnimationTracks(A, L, w, R, N);
        if (K)
          for (let x = 0; x < K.length; x++)
            m.push(K[x]);
      }
      return new xr(r, void 0, m);
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
        f.isSkinnedMesh && f.bind(d, qp);
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
      if (r.isBone === !0 ? h = new Eo() : l.length > 1 ? h = new Ct() : l.length === 1 ? h = l[0] : h = new at(), h !== l[0])
        for (let u = 0, d = l.length; u < d; u++)
          h.add(l[u]);
      if (r.name && (h.userData.name = r.name, h.name = a), hn(h, r), r.extensions && In(n, h, r), r.matrix !== void 0) {
        const u = new Ne();
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
    const t = this.extensions, n = this.json.scenes[e], i = this, r = new Ct();
    n.name && (r.name = i.createUniqueName(n.name)), hn(r, n), n.extensions && In(t, r, n);
    const a = n.nodes || [], o = [];
    for (let c = 0, l = a.length; c < l; c++)
      o.push(i.getDependency("node", a[c]));
    return Promise.all(o).then(function(c) {
      for (let h = 0, u = c.length; h < u; h++)
        r.add(c[h]);
      const l = (h) => {
        const u = /* @__PURE__ */ new Map();
        for (const [d, f] of i.associations)
          (d instanceof Nt || d instanceof gt) && u.set(d, f);
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
    xn[r.path] === xn.weights ? e.traverse(function(d) {
      d.morphTargetInfluences && c.push(d.name ? d.name : d.uuid);
    }) : c.push(o);
    let l;
    switch (xn[r.path]) {
      case xn.weights:
        l = ai;
        break;
      case xn.rotation:
        l = oi;
        break;
      case xn.position:
      case xn.scale:
        l = ci;
        break;
      default:
        switch (n.itemSize) {
          case 1:
            l = ai;
            break;
          case 2:
          case 3:
          default:
            l = ci;
            break;
        }
        break;
    }
    const h = i.interpolation !== void 0 ? zp[i.interpolation] : 2301, u = this._getArrayFromAccessor(n);
    for (let d = 0, f = c.length; d < f; d++) {
      const g = new l(
        c[d] + "." + xn[r.path],
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
      const n = Mr(t.constructor), i = new Float32Array(t.length);
      for (let r = 0, a = t.length; r < a; r++)
        i[r] = t[r] * n;
      t = i;
    }
    return t;
  }
  _createCubicSplineTrackInterpolant(e) {
    e.createInterpolant = function(n) {
      const i = this instanceof oi ? Gp : Do;
      return new i(this.times, this.values, this.getValueSize() / 3, n);
    }, e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline = !0;
  }
}
function Yp(s, e, t) {
  const n = e.attributes, i = new $t();
  if (n.POSITION !== void 0) {
    const o = t.json.accessors[n.POSITION], c = o.min, l = o.max;
    if (c !== void 0 && l !== void 0) {
      if (i.set(
        new C(c[0], c[1], c[2]),
        new C(l[0], l[1], l[2])
      ), o.normalized) {
        const h = Mr(ii[o.componentType]);
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
    const o = new C(), c = new C();
    for (let l = 0, h = r.length; l < h; l++) {
      const u = r[l];
      if (u.POSITION !== void 0) {
        const d = t.json.accessors[u.POSITION], f = d.min, g = d.max;
        if (f !== void 0 && g !== void 0) {
          if (c.setX(Math.max(Math.abs(f[0]), Math.abs(g[0]))), c.setY(Math.max(Math.abs(f[1]), Math.abs(g[1]))), c.setZ(Math.max(Math.abs(f[2]), Math.abs(g[2]))), d.normalized) {
            const _ = Mr(ii[d.componentType]);
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
  const a = new Qt();
  i.getCenter(a.center), a.radius = i.min.distanceTo(i.max) / 2, s.boundingSphere = a;
}
function ro(s, e, t) {
  const n = e.attributes, i = [];
  function r(a, o) {
    return t.getDependency("accessor", a).then(function(c) {
      s.setAttribute(o, c);
    });
  }
  for (const a in n) {
    const o = vr[a] || a.toLowerCase();
    o in s.attributes || i.push(r(n[a], o));
  }
  if (e.indices !== void 0 && !s.index) {
    const a = t.getDependency("accessor", e.indices).then(function(o) {
      s.setIndex(o);
    });
    i.push(a);
  }
  return Ve.workingColorSpace !== xt && "COLOR_0" in n && console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${Ve.workingColorSpace}" not supported.`), hn(s, e), Yp(s, e, t), Promise.all(i).then(function() {
    return e.targets !== void 0 ? Vp(s, e.targets, t) : s;
  });
}
function Kp(s) {
  const e = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new Map(), n = s.clone();
  return No(s, n, function(i, r) {
    e.set(r, i), t.set(i, r);
  }), n.traverse(function(i) {
    if (!i.isSkinnedMesh) return;
    const r = i, a = e.get(i), o = a.skeleton.bones;
    r.skeleton = a.skeleton.clone(), r.bindMatrix.copy(a.bindMatrix), r.skeleton.bones = o.map(function(c) {
      return t.get(c);
    }), r.bind(r.skeleton, r.bindMatrix);
  }), n;
}
function No(s, e, t) {
  t(s, e);
  for (let n = 0; n < s.children.length; n++)
    No(s.children[n], e.children[n], t);
}
const fr = /* @__PURE__ */ new Map();
function Uo(s, e) {
  return fr.has(s) || fr.set(s, e()), fr.get(s);
}
function Zp(s) {
  const e = new $t().setFromObject(s), t = e.getCenter(new C());
  s.position.set(-t.x, -e.min.y, -t.z);
  const n = new Ct();
  return n.add(s), n.userData.size = e.getSize(new C()), n;
}
function Fo(s) {
  return s.traverse((e) => {
    e.isMesh && (e.castShadow = !0, e.receiveShadow = !0);
  }), s;
}
function Ei(s, e) {
  return Uo("f:" + e, async () => {
    const t = s + "models/furniture/", n = await new dp().setPath(t).loadAsync(e + ".mtl");
    n.preload(), Object.values(n.materials).forEach((a) => {
      a.shininess = 8, a.specular = new be(2236962);
    });
    const i = await new up().setMaterials(n).setPath(t).loadAsync(e + ".obj");
    i.rotation.y = Math.PI;
    const r = new Ct();
    return r.add(i), Zp(Fo(r));
  }).then((t) => {
    const n = t.clone();
    return n.userData.size = t.userData.size, n;
  });
}
function $p(s) {
  return Uo("g:" + s, () => new pp().loadAsync(s));
}
async function pr(s, e) {
  const t = await $p(s + "models/characters/" + e + ".glb");
  return { scene: Fo(Kp(t.scene)), animations: t.animations };
}
const Jp = 4.6;
class Dr {
  static async create(e, t, n = {}) {
    const { scene: i, animations: r } = await pr(e, t), a = new Dr(i, r, n);
    if (n.wheelchair) {
      const o = await pr(e, "wheelchair");
      o.scene.scale.copy(i.scale), a.root.add(o.scene), a.wheel = !0, a.play("wheelchair-sit");
    }
    if (n.cane) {
      const o = await pr(e, "aid-cane"), c = i.getObjectByName("arm-right");
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
    this.root = new Ct();
    const r = new $t().setFromObject(e), a = Jp / Math.max(0.01, r.max.y - r.min.y);
    if (e.scale.setScalar(a), e.position.y = -r.min.y * a, this.root.add(e), this.mixer = new rp(e), this.actions = {}, t.forEach((o) => {
      this.actions[o.name] = this.mixer.clipAction(o);
    }), this.current = null, this.path = null, this.onArrive = null, this.yOffset = 0, n) {
      const o = e.getObjectByName("head"), c = new Xt({ color: 16777215, roughness: 0.7 }), l = new Ct(), h = new Qe(new wi(0.19, 0.2, 0.07, 24), c), u = new Qe(new ys(0.21, 24, 16), c);
      u.scale.y = 0.72, u.position.y = 0.1, l.add(h, u), l.traverse((d) => {
        d.isMesh && (d.castShadow = !0);
      }), l.position.set(0, 0.31, 0.01), (o || e).add(l);
    }
    if (i) {
      const o = e.getObjectByName("torso"), c = new Qe(new li(0.2, 0.15), new Xt({ color: i, roughness: 0.9, side: 2 }));
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
const mt = 5, Qp = 0.1;
function em(s, { base: e, world: t }) {
  const n = t.size, i = n * mt, r = new vf({ antialias: !0, alpha: !0 });
  r.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)), r.outputColorSpace = lt, r.toneMapping = 4, r.shadowMap.enabled = !0, r.shadowMap.type = 2, r.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;outline:none", r.domElement.tabIndex = 0, s.prepend(r.domElement);
  const a = new Mf(), o = new Ms(-10, 10, 10, -10, 0.1, 800), c = new Gf(16773596, 9071439, 1.15), l = new Po(16773334, 2.3);
  l.castShadow = !0, l.shadow.mapSize.set(2048, 2048), l.shadow.bias = -4e-4, l.shadow.normalBias = 0.05, Object.assign(l.shadow.camera, { left: -i, right: i, top: i, bottom: -i, near: 1, far: 300 }), l.position.set(i * 0.15 + 40, 90, i * 0.9 + 50), l.target.position.set(i / 2, 0, i / 2), a.add(c, l, l.target);
  const h = (M, J, q = 0) => new C(M * mt, q, J * mt);
  if ((async () => {
    (await Promise.all(Array.from({ length: (n / 2) ** 2 }, () => Ei(e, "floorFull")))).forEach((J, q) => {
      J.position.set(q % (n / 2) * 10 + 5, -0.5, Math.floor(q / (n / 2)) * 10 + 5), J.traverse((Z) => {
        Z.receiveShadow = !0;
      }), a.add(J);
    });
    for (let J = 0; J < n / 2; J++) {
      const q = await Ei(e, J % 2 ? "wallWindow" : "wall");
      q.position.set(J * 10 + 5, 0, -0.35);
      const Z = await Ei(e, J % 2 ? "wall" : "wallWindow");
      Z.rotation.y = Math.PI / 2, Z.position.set(-0.35, 0, J * 10 + 5), a.add(q, Z);
    }
    for (const J of t.decor) {
      const q = await Ei(e, J.model);
      q.position.copy(h(J.x + 1, J.y + 1, 0.03)), a.add(q);
    }
    for (const J of t.props) {
      const q = await Ei(e, J.model), Z = q.userData.size, [j, Ae] = J.rot % 2 ? [J.d, J.w] : [J.w, J.d];
      q.scale.set(Math.min(1, (j + 0.12) * mt / Z.x), 1, Math.min(1, (Ae + 0.12) * mt / Z.z)), q.rotation.y = J.rot * Math.PI / 2, q.position.copy(h(J.x + J.w / 2, J.y + J.d / 2)), a.add(q);
    }
  })(), t.jail) {
    const M = t.jail, J = new Xt({ color: 4674921, roughness: 0.5, metalness: 0.4 }), q = new Qe(new li((n - M.x) * mt, M.y * mt), new Xt({ color: 9741240, transparent: !0, opacity: 0.55 }));
    q.rotation.x = -Math.PI / 2, q.position.copy(h((n + M.x) / 2, M.y / 2, 0.04)), q.receiveShadow = !0, a.add(q);
    const Z = (j, Ae) => {
      const pe = new Qe(new Wt(0.35, 5.5, 0.35), J);
      pe.position.copy(h(j, Ae, 2.75)), pe.castShadow = !0, a.add(pe);
    };
    for (let j = 0; j <= M.y + 1e-6; j += 0.5) Z(M.x, j);
    for (let j = M.x + 0.5; j <= n + 1e-6; j += 0.5) Z(j, M.y);
    for (const j of [0.6, 5.2]) {
      const Ae = new Qe(new Wt(0.3, 0.3, M.y * mt), J);
      Ae.position.copy(h(M.x, M.y / 2, j)), a.add(Ae);
      const pe = new Qe(new Wt((n - M.x) * mt, 0.3, 0.3), J);
      pe.position.copy(h((n + M.x) / 2, M.y, j)), a.add(pe);
    }
  }
  let u = null;
  if (t.pad) {
    const M = t.pad;
    u = new Qe(new _s(M.r * mt - 0.7, M.r * mt, 48), new jt({ color: 16436245, transparent: !0, opacity: 0.9, side: 2 })), u.rotation.x = -Math.PI / 2, u.position.copy(h(M.cx, M.cy, 0.08));
    const J = new Qe(new Cr(M.r * mt - 0.7, 48), new jt({ color: 16639626, transparent: !0, opacity: 0.45 }));
    J.rotation.x = -Math.PI / 2, J.position.copy(h(M.cx, M.cy, 0.07)), a.add(u, J);
  }
  let d = 1.6;
  const f = new C(i / 2, 0, i / 2);
  function g() {
    const M = s.clientWidth || 600, J = s.clientHeight || 400;
    r.setSize(M, J, !1);
    const q = i * 0.62 / d, Z = M / J;
    o.left = -q * Z, o.right = q * Z, o.top = q, o.bottom = -q, o.updateProjectionMatrix();
  }
  function _() {
    o.position.copy(f).add(new C(1, 0.9, 1).normalize().multiplyScalar(300)), o.lookAt(f);
  }
  g(), _(), new ResizeObserver(g).observe(s), r.domElement.addEventListener("wheel", (M) => {
    M.preventDefault(), d = Math.max(0.8, Math.min(4, d * (M.deltaY < 0 ? 1.15 : 1 / 1.15))), g();
  }, { passive: !1 });
  const p = t.radius, m = t.shapes;
  function T(M, J) {
    for (let q = 0; q < 4; q++) {
      let Z = !1;
      for (const j of m) {
        let Ae, pe;
        j.kind === "circle" ? (Ae = j.cx, pe = j.cy) : (Ae = Math.min(Math.max(M.x, j.cx - j.hx), j.cx + j.hx), pe = Math.min(Math.max(M.y, j.cy - j.hy), j.cy + j.hy));
        let b = M.x - Ae, v = M.y - pe;
        const F = j.kind === "circle" ? j.r + p : p;
        let V = Math.hypot(b, v);
        if (!(V >= F)) {
          if (V < 1e-6) {
            const ee = j.hx - Math.abs(M.x - j.cx), Y = j.hy - Math.abs(M.y - j.cy);
            ee < Y ? (b = Math.sign(M.x - j.cx) || 1, v = 0, V = -ee) : (b = 0, v = Math.sign(M.y - j.cy) || 1, V = -Y), M.x += b * (F - V + 1e-3), M.y += v * (F - V + 1e-3);
          } else
            M.x += b / V * (F - V + 1e-3), M.y += v / V * (F - V + 1e-3);
          Z = !0;
        }
      }
      for (const j of J) {
        const Ae = M.x - j.x, pe = M.y - j.y, b = Math.hypot(Ae, pe), v = p * 2;
        b >= v || b < 1e-6 || (M.x += Ae / b * (v - b), M.y += pe / b * (v - b), Z = !0);
      }
      if (M.x = Math.min(Math.max(M.x, p), n - p), M.y = Math.min(Math.max(M.y, p), n - p), !Z) break;
    }
    return M;
  }
  function y(M, J) {
    return m.some((q) => q.kind === "circle" ? Math.hypot(M - q.cx, J - q.cy) < q.r + p - 1e-3 : Math.hypot(Math.max(Math.abs(M - q.cx) - q.hx, 0), Math.max(Math.abs(J - q.cy) - q.hy, 0)) < p - 1e-3);
  }
  const A = new Ct();
  A.visible = !1, a.add(A);
  const L = new jt({ color: 16722902, transparent: !0, opacity: 0.45, depthWrite: !1 }), w = new ti({ color: 16722902 });
  m.forEach((M) => {
    const J = M.kind === "circle" ? new wi(M.r * mt, M.r * mt, 1.2, 40) : new Wt(M.hx * 2 * mt, 1.2, M.hy * 2 * mt), q = new Qe(J, L);
    q.add(new gs(new Rf(J, 20), w)), q.position.copy(h(M.cx, M.cy, 0.6)), q.renderOrder = 10, A.add(q);
  });
  const R = new _s(p * mt - 0.25, p * mt, 40), N = new jt({ color: 5195493, transparent: !0, opacity: 0.8, side: 2, depthWrite: !1 }), K = { cop: 2450411, thief: 14427686 };
  function x(M) {
    const J = new Ct();
    if (M === "cop") {
      const q = new Xt({ color: 1920728, roughness: 0.6 }), Z = new Qe(new wi(0.2, 0.22, 0.12, 24), q), j = new Qe(new Wt(0.3, 0.025, 0.14), new Xt({ color: 988970 }));
      j.position.set(0, -0.04, 0.2);
      const Ae = new Qe(new Wt(0.07, 0.07, 0.02), new Xt({ color: 16436245, metalness: 0.6 }));
      Ae.position.set(0, 0.01, 0.215), J.add(Z, j, Ae);
    } else if (M === "thief") {
      const q = new Xt({ color: 1120295, roughness: 0.9 }), Z = new Qe(new ys(0.235, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), q);
      Z.scale.y = 0.7, J.add(Z);
    }
    return J.position.set(0, 0.3, 0), J.traverse((q) => {
      q.isMesh && (q.castShadow = !0);
    }), J;
  }
  function E(M, J) {
    if (!M.actor || M.team === J) return;
    M.team = J;
    const q = M.actor.root.getObjectByName("head");
    M.hat && (M.hat.parent.remove(M.hat), M.hat = null), J && q && (M.hat = x(J), q.add(M.hat));
  }
  const B = /* @__PURE__ */ new Map();
  let O = null, U = null;
  async function Q(M) {
    const J = { actor: null, x: M.x, y: M.y, dir: M.dir, moving: !1, name: M.name, model: M.model };
    B.set(M.id, J);
    const q = await Dr.create(e, M.model, {});
    if (!B.has(M.id)) return;
    J.actor = q, q.root.position.copy(h(J.x, J.y));
    const Z = new Qe(R, N.clone());
    Z.rotation.x = -Math.PI / 2, Z.position.y = 0.3, J.ring = Z, q.root.add(Z), a.add(q.root), E(J, J.wantTeam);
  }
  function k(M, J) {
    O = J;
    const q = /* @__PURE__ */ new Set();
    M.forEach((Z) => {
      q.add(Z.id), B.has(Z.id) || Q(Z);
      const j = B.get(Z.id);
      if (j.name = Z.name, j.online = Z.online, j.jailed = Z.jailed, j.safe = Z.safe, j.wantTeam = Z.team, E(j, Z.team), Z.id === O) {
        (!U || Z.tp !== U.tp) && (U = { ...U || {}, x: Z.x, y: Z.y, dir: Z.dir, tp: Z.tp }), U.speed = Z.speed, U.frozen = Z.frozen, U.jailed = Z.jailed, U.dashLeft = Z.dash;
        return;
      }
      j.x = Z.x, j.y = Z.y, j.dir = Z.dir, j.moving = Z.moving;
    });
    for (const [Z, j] of B)
      q.has(Z) || (j.actor && a.remove(j.actor.root), B.delete(Z));
  }
  function ne(M, J) {
    U && !y(M, J) && (U.x = M, U.y = J);
  }
  function W() {
    for (const M of B.values()) M.actor && a.remove(M.actor.root);
    B.clear(), U = null, O = null;
  }
  const oe = /* @__PURE__ */ new Set(), he = { w: [-1, -1], arrowup: [-1, -1], s: [1, 1], arrowdown: [1, 1], a: [-1, 1], arrowleft: [-1, 1], d: [1, -1], arrowright: [1, -1] };
  let ve = 0, ke = 0, We = null;
  window.addEventListener("keydown", (M) => {
    const J = M.key.toLowerCase();
    if (J === " " && !M.target.closest("input, textarea, button") && U) {
      M.preventDefault();
      const q = performance.now() / 1e3;
      q >= ke && !(U.frozen > 0) && !U.jailed && (ve = q + t.dash.seconds, ke = q + t.dash.cooldown, We && We());
      return;
    }
    if (J === "h" && !M.target.closest("input, textarea") && O) {
      A.visible = !A.visible;
      return;
    }
    !he[J] || M.target.closest("input, textarea") || !O || (M.preventDefault(), oe.add(J));
  }), window.addEventListener("keyup", (M) => oe.delete(M.key.toLowerCase())), window.addEventListener("blur", () => oe.clear());
  let X = null, te = 0, ge = !1;
  function fe(M) {
    if (!U) return !1;
    let J = 0, q = 0;
    oe.forEach((pe) => {
      J += he[pe][0], q += he[pe][1];
    });
    const Z = Math.hypot(J, q), j = Z > 0, Ae = U.frozen > 0;
    if (Ae && (U.frozen = Math.max(0, U.frozen - M)), j && !Ae) {
      const pe = performance.now() / 1e3 < ve ? t.dash.mult : 1, b = (U.speed || t.speed.lobby) * pe * M, v = Math.max(1, Math.ceil(b / 0.08)), F = [...B.entries()].filter(([V]) => V !== O).map(([, V]) => V);
      for (let V = 0; V < v; V++)
        U.x += J / Z * b / v, U.y += q / Z * b / v, T(U, F);
      U.dir = Math.atan2(J, q);
    }
    return te += M, X && (j && te >= Qp || j !== ge) && (te = 0, X({ x: +U.x.toFixed(3), y: +U.y.toFixed(3), dir: +U.dir.toFixed(3), moving: j })), ge = j && !Ae, j && !Ae;
  }
  const Ce = new C();
  function we() {
    const M = {};
    for (const [J, q] of B)
      q.actor && (Ce.copy(q.actor.root.position).setY(6.2).project(o), M[J] = {
        x: (Ce.x + 1) / 2 * s.clientWidth,
        y: (1 - Ce.y) / 2 * s.clientHeight,
        name: q.name,
        me: J === O,
        online: q.online !== !1,
        team: q.team,
        jailed: q.jailed
      });
    return M;
  }
  let Oe = null;
  const Ke = new qf();
  function ze() {
    const M = Math.min(0.05, Ke.getDelta()), J = fe(M);
    for (const [q, Z] of B) {
      const j = Z.actor;
      if (!j) continue;
      const Ae = q === O && U, pe = Ae ? U.x : Z.x, b = Ae ? U.y : Z.y, v = h(pe, b);
      if (Ae ? j.root.position.copy(v) : j.root.position.lerp(v, Math.min(1, M * 10)), j.root.rotation.y = Ae ? U.dir : Z.dir, Z.ring) {
        const F = Z.safe > 0 && Math.floor(performance.now() / 150) % 2;
        Z.ring.material.color.setHex(Z.jailed ? 6583435 : F ? 2278750 : K[Z.team] || 5195493), Z.ring.visible = !!Z.team || A.visible || Ae;
      }
      j.pose((Ae ? J : Z.moving) ? "walk" : "idle"), j.update(M);
    }
    U && f.lerp(h(U.x, U.y), Math.min(1, M * 5)), u && (u.material.opacity = 0.6 + Math.sin(performance.now() / 250) * 0.3), _(), r.render(a, o), Oe && Oe(we()), requestAnimationFrame(ze);
  }
  return requestAnimationFrame(ze), {
    setPlayers: k,
    correct: ne,
    clear: W,
    focus() {
      r.domElement.focus();
    },
    onMove(M) {
      X = M;
    },
    onDash(M) {
      We = M;
    },
    dashState() {
      const M = performance.now() / 1e3;
      return { ready: Math.max(0, ke - M), active: M < ve };
    },
    onFrame(M) {
      Oe = M;
    }
  };
}
export {
  em as createRoomScene
};
