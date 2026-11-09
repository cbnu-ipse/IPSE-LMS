/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */
const Sa = "169";
const ja = "attached", hl = "detached";
const $n = "", wt = "srgb", Ht = "srgb-linear", Ea = "display-p3", _r = "display-p3-linear", dr = "linear", Et = "srgb", fr = "rec709", pr = "p3";
const Ya = "300 es";
class xi {
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
const Xt = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "0a", "0b", "0c", "0d", "0e", "0f", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "1a", "1b", "1c", "1d", "1e", "1f", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "2a", "2b", "2c", "2d", "2e", "2f", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "3a", "3b", "3c", "3d", "3e", "3f", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "4a", "4b", "4c", "4d", "4e", "4f", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "5a", "5b", "5c", "5d", "5e", "5f", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "6a", "6b", "6c", "6d", "6e", "6f", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "7a", "7b", "7c", "7d", "7e", "7f", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "8a", "8b", "8c", "8d", "8e", "8f", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "9a", "9b", "9c", "9d", "9e", "9f", "a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "aa", "ab", "ac", "ad", "ae", "af", "b0", "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9", "ba", "bb", "bc", "bd", "be", "bf", "c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "ca", "cb", "cc", "cd", "ce", "cf", "d0", "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "da", "db", "dc", "dd", "de", "df", "e0", "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9", "ea", "eb", "ec", "ed", "ee", "ef", "f0", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "fa", "fb", "fc", "fd", "fe", "ff"];
let Ka = 1234567;
const Xi = Math.PI / 180, Zi = 180 / Math.PI;
function Mn() {
  const s = Math.random() * 4294967295 | 0, e = Math.random() * 4294967295 | 0, t = Math.random() * 4294967295 | 0, n = Math.random() * 4294967295 | 0;
  return (Xt[s & 255] + Xt[s >> 8 & 255] + Xt[s >> 16 & 255] + Xt[s >> 24 & 255] + "-" + Xt[e & 255] + Xt[e >> 8 & 255] + "-" + Xt[e >> 16 & 15 | 64] + Xt[e >> 24 & 255] + "-" + Xt[t & 63 | 128] + Xt[t >> 8 & 255] + "-" + Xt[t >> 16 & 255] + Xt[t >> 24 & 255] + Xt[n & 255] + Xt[n >> 8 & 255] + Xt[n >> 16 & 255] + Xt[n >> 24 & 255]).toLowerCase();
}
function jt(s, e, t) {
  return Math.max(e, Math.min(t, s));
}
function Ta(s, e) {
  return (s % e + e) % e;
}
function ul(s, e, t, n, i) {
  return n + (s - e) * (i - n) / (t - e);
}
function dl(s, e, t) {
  return s !== e ? (t - s) / (e - s) : 0;
}
function vs(s, e, t) {
  return (1 - t) * s + t * e;
}
function fl(s, e, t, n) {
  return vs(s, e, 1 - Math.exp(-t * n));
}
function pl(s, e = 1) {
  return e - Math.abs(Ta(s, e * 2) - e);
}
function ml(s, e, t) {
  return s <= e ? 0 : s >= t ? 1 : (s = (s - e) / (t - e), s * s * (3 - 2 * s));
}
function gl(s, e, t) {
  return s <= e ? 0 : s >= t ? 1 : (s = (s - e) / (t - e), s * s * s * (s * (s * 6 - 15) + 10));
}
function _l(s, e) {
  return s + Math.floor(Math.random() * (e - s + 1));
}
function xl(s, e) {
  return s + Math.random() * (e - s);
}
function vl(s) {
  return s * (0.5 - Math.random());
}
function Ml(s) {
  s !== void 0 && (Ka = s);
  let e = Ka += 1831565813;
  return e = Math.imul(e ^ e >>> 15, e | 1), e ^= e + Math.imul(e ^ e >>> 7, e | 61), ((e ^ e >>> 14) >>> 0) / 4294967296;
}
function yl(s) {
  return s * Xi;
}
function Sl(s) {
  return s * Zi;
}
function El(s) {
  return (s & s - 1) === 0 && s !== 0;
}
function Tl(s) {
  return Math.pow(2, Math.ceil(Math.log(s) / Math.LN2));
}
function Al(s) {
  return Math.pow(2, Math.floor(Math.log(s) / Math.LN2));
}
function bl(s, e, t, n, i) {
  const r = Math.cos, a = Math.sin, o = r(t / 2), c = a(t / 2), l = r((e + n) / 2), u = a((e + n) / 2), h = r((e - n) / 2), d = a((e - n) / 2), f = r((n - e) / 2), g = a((n - e) / 2);
  switch (i) {
    case "XYX":
      s.set(o * u, c * h, c * d, o * l);
      break;
    case "YZY":
      s.set(c * d, o * u, c * h, o * l);
      break;
    case "ZXZ":
      s.set(c * h, c * d, o * u, o * l);
      break;
    case "XZX":
      s.set(o * u, c * g, c * f, o * l);
      break;
    case "YXY":
      s.set(c * f, o * u, c * g, o * l);
      break;
    case "ZYZ":
      s.set(c * g, c * f, o * u, o * l);
      break;
    default:
      console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: " + i);
  }
}
function vn(s, e) {
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
function gt(s, e) {
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
const wl = {
  DEG2RAD: Xi,
  RAD2DEG: Zi,
  generateUUID: Mn,
  clamp: jt,
  euclideanModulo: Ta,
  mapLinear: ul,
  inverseLerp: dl,
  lerp: vs,
  damp: fl,
  pingpong: pl,
  smoothstep: ml,
  smootherstep: gl,
  randInt: _l,
  randFloat: xl,
  randFloatSpread: vl,
  seededRandom: Ml,
  degToRad: yl,
  radToDeg: Sl,
  isPowerOfTwo: El,
  ceilPowerOfTwo: Tl,
  floorPowerOfTwo: Al,
  setQuaternionFromProperEuler: bl,
  normalize: gt,
  denormalize: vn
};
class qe {
  constructor(e = 0, t = 0) {
    qe.prototype.isVector2 = !0, this.x = e, this.y = t;
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
    return Math.acos(jt(n, -1, 1));
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
class Ke {
  constructor(e, t, n, i, r, a, o, c, l) {
    Ke.prototype.isMatrix3 = !0, this.elements = [
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
    const u = this.elements;
    return u[0] = e, u[1] = i, u[2] = o, u[3] = t, u[4] = r, u[5] = c, u[6] = n, u[7] = a, u[8] = l, this;
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
    const n = e.elements, i = t.elements, r = this.elements, a = n[0], o = n[3], c = n[6], l = n[1], u = n[4], h = n[7], d = n[2], f = n[5], g = n[8], x = i[0], p = i[3], m = i[6], T = i[1], S = i[4], E = i[7], F = i[2], P = i[5], L = i[8];
    return r[0] = a * x + o * T + c * F, r[3] = a * p + o * S + c * P, r[6] = a * m + o * E + c * L, r[1] = l * x + u * T + h * F, r[4] = l * p + u * S + h * P, r[7] = l * m + u * E + h * L, r[2] = d * x + f * T + g * F, r[5] = d * p + f * S + g * P, r[8] = d * m + f * E + g * L, this;
  }
  multiplyScalar(e) {
    const t = this.elements;
    return t[0] *= e, t[3] *= e, t[6] *= e, t[1] *= e, t[4] *= e, t[7] *= e, t[2] *= e, t[5] *= e, t[8] *= e, this;
  }
  determinant() {
    const e = this.elements, t = e[0], n = e[1], i = e[2], r = e[3], a = e[4], o = e[5], c = e[6], l = e[7], u = e[8];
    return t * a * u - t * o * l - n * r * u + n * o * c + i * r * l - i * a * c;
  }
  invert() {
    const e = this.elements, t = e[0], n = e[1], i = e[2], r = e[3], a = e[4], o = e[5], c = e[6], l = e[7], u = e[8], h = u * a - o * l, d = o * c - u * r, f = l * r - a * c, g = t * h + n * d + i * f;
    if (g === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
    const x = 1 / g;
    return e[0] = h * x, e[1] = (i * l - u * n) * x, e[2] = (o * n - i * a) * x, e[3] = d * x, e[4] = (u * t - i * c) * x, e[5] = (i * r - o * t) * x, e[6] = f * x, e[7] = (n * c - l * t) * x, e[8] = (a * t - n * r) * x, this;
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
    return this.premultiply(Cr.makeScale(e, t)), this;
  }
  rotate(e) {
    return this.premultiply(Cr.makeRotation(-e)), this;
  }
  translate(e, t) {
    return this.premultiply(Cr.makeTranslation(e, t)), this;
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
const Cr = /* @__PURE__ */ new Ke();
function mc(s) {
  for (let e = s.length - 1; e >= 0; --e)
    if (s[e] >= 65535) return !0;
  return !1;
}
function Ms(s) {
  return document.createElementNS("http://www.w3.org/1999/xhtml", s);
}
function Rl() {
  const s = Ms("canvas");
  return s.style.display = "block", s;
}
const Za = {};
function lr(s) {
  s in Za || (Za[s] = !0, console.warn(s));
}
function Cl(s, e, t) {
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
function Il(s) {
  const e = s.elements;
  e[2] = 0.5 * e[2] + 0.5 * e[3], e[6] = 0.5 * e[6] + 0.5 * e[7], e[10] = 0.5 * e[10] + 0.5 * e[11], e[14] = 0.5 * e[14] + 0.5 * e[15];
}
function Pl(s) {
  const e = s.elements;
  e[11] === -1 ? (e[10] = -e[10] - 1, e[14] = -e[14]) : (e[10] = -e[10], e[14] = -e[14] + 1);
}
const $a = /* @__PURE__ */ new Ke().set(
  0.8224621,
  0.177538,
  0,
  0.0331941,
  0.9668058,
  0,
  0.0170827,
  0.0723974,
  0.9105199
), Ja = /* @__PURE__ */ new Ke().set(
  1.2249401,
  -0.2249404,
  0,
  -0.0420569,
  1.0420571,
  0,
  -0.0196376,
  -0.0786361,
  1.0982735
), os = {
  [Ht]: {
    transfer: dr,
    primaries: fr,
    luminanceCoefficients: [0.2126, 0.7152, 0.0722],
    toReference: (s) => s,
    fromReference: (s) => s
  },
  [wt]: {
    transfer: Et,
    primaries: fr,
    luminanceCoefficients: [0.2126, 0.7152, 0.0722],
    toReference: (s) => s.convertSRGBToLinear(),
    fromReference: (s) => s.convertLinearToSRGB()
  },
  [_r]: {
    transfer: dr,
    primaries: pr,
    luminanceCoefficients: [0.2289, 0.6917, 0.0793],
    toReference: (s) => s.applyMatrix3(Ja),
    fromReference: (s) => s.applyMatrix3($a)
  },
  [Ea]: {
    transfer: Et,
    primaries: pr,
    luminanceCoefficients: [0.2289, 0.6917, 0.0793],
    toReference: (s) => s.convertSRGBToLinear().applyMatrix3(Ja),
    fromReference: (s) => s.applyMatrix3($a).convertLinearToSRGB()
  }
}, Ll = /* @__PURE__ */ new Set([Ht, _r]), at = {
  enabled: !0,
  _workingColorSpace: Ht,
  get workingColorSpace() {
    return this._workingColorSpace;
  },
  set workingColorSpace(s) {
    if (!Ll.has(s))
      throw new Error(`Unsupported working color space, "${s}".`);
    this._workingColorSpace = s;
  },
  convert: function(s, e, t) {
    if (this.enabled === !1 || e === t || !e || !t)
      return s;
    const n = os[e].toReference, i = os[t].fromReference;
    return i(n(s));
  },
  fromWorkingColorSpace: function(s, e) {
    return this.convert(s, this._workingColorSpace, e);
  },
  toWorkingColorSpace: function(s, e) {
    return this.convert(s, e, this._workingColorSpace);
  },
  getPrimaries: function(s) {
    return os[s].primaries;
  },
  getTransfer: function(s) {
    return s === $n ? dr : os[s].transfer;
  },
  getLuminanceCoefficients: function(s, e = this._workingColorSpace) {
    return s.fromArray(os[e].luminanceCoefficients);
  }
};
function qi(s) {
  return s < 0.04045 ? s * 0.0773993808 : Math.pow(s * 0.9478672986 + 0.0521327014, 2.4);
}
function Ir(s) {
  return s < 31308e-7 ? s * 12.92 : 1.055 * Math.pow(s, 0.41666) - 0.055;
}
let Ri;
class Dl {
  static getDataURL(e) {
    if (/^data:/i.test(e.src) || typeof HTMLCanvasElement > "u")
      return e.src;
    let t;
    if (e instanceof HTMLCanvasElement)
      t = e;
    else {
      Ri === void 0 && (Ri = Ms("canvas")), Ri.width = e.width, Ri.height = e.height;
      const n = Ri.getContext("2d");
      e instanceof ImageData ? n.putImageData(e, 0, 0) : n.drawImage(e, 0, 0, e.width, e.height), t = Ri;
    }
    return t.width > 2048 || t.height > 2048 ? (console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons", e), t.toDataURL("image/jpeg", 0.6)) : t.toDataURL("image/png");
  }
  static sRGBToLinear(e) {
    if (typeof HTMLImageElement < "u" && e instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && e instanceof ImageBitmap) {
      const t = Ms("canvas");
      t.width = e.width, t.height = e.height;
      const n = t.getContext("2d");
      n.drawImage(e, 0, 0, e.width, e.height);
      const i = n.getImageData(0, 0, e.width, e.height), r = i.data;
      for (let a = 0; a < r.length; a++)
        r[a] = qi(r[a] / 255) * 255;
      return n.putImageData(i, 0, 0), t;
    } else if (e.data) {
      const t = e.data.slice(0);
      for (let n = 0; n < t.length; n++)
        t instanceof Uint8Array || t instanceof Uint8ClampedArray ? t[n] = Math.floor(qi(t[n] / 255) * 255) : t[n] = qi(t[n]);
      return {
        data: t,
        width: e.width,
        height: e.height
      };
    } else
      return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."), e;
  }
}
let Ul = 0;
class gc {
  constructor(e = null) {
    this.isSource = !0, Object.defineProperty(this, "id", { value: Ul++ }), this.uuid = Mn(), this.data = e, this.dataReady = !0, this.version = 0;
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
          i[a].isDataTexture ? r.push(Pr(i[a].image)) : r.push(Pr(i[a]));
      } else
        r = Pr(i);
      n.url = r;
    }
    return t || (e.images[this.uuid] = n), n;
  }
}
function Pr(s) {
  return typeof HTMLImageElement < "u" && s instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && s instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && s instanceof ImageBitmap ? Dl.getDataURL(s) : s.data ? {
    data: Array.from(s.data),
    width: s.width,
    height: s.height,
    type: s.data.constructor.name
  } : (console.warn("THREE.Texture: Unable to serialize Texture."), {});
}
let Nl = 0;
class Ft extends xi {
  constructor(e = Ft.DEFAULT_IMAGE, t = Ft.DEFAULT_MAPPING, n = 1001, i = 1001, r = 1006, a = 1008, o = 1023, c = 1009, l = Ft.DEFAULT_ANISOTROPY, u = $n) {
    super(), this.isTexture = !0, Object.defineProperty(this, "id", { value: Nl++ }), this.uuid = Mn(), this.name = "", this.source = new gc(e), this.mipmaps = [], this.mapping = t, this.channel = 0, this.wrapS = n, this.wrapT = i, this.magFilter = r, this.minFilter = a, this.anisotropy = l, this.format = o, this.internalFormat = null, this.type = c, this.offset = new qe(0, 0), this.repeat = new qe(1, 1), this.center = new qe(0, 0), this.rotation = 0, this.matrixAutoUpdate = !0, this.matrix = new Ke(), this.generateMipmaps = !0, this.premultiplyAlpha = !1, this.flipY = !0, this.unpackAlignment = 4, this.colorSpace = u, this.userData = {}, this.version = 0, this.onUpdate = null, this.isRenderTargetTexture = !1, this.pmremVersion = 0;
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
Ft.DEFAULT_IMAGE = null;
Ft.DEFAULT_MAPPING = 300;
Ft.DEFAULT_ANISOTROPY = 1;
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
    const c = e.elements, l = c[0], u = c[4], h = c[8], d = c[1], f = c[5], g = c[9], x = c[2], p = c[6], m = c[10];
    if (Math.abs(u - d) < 0.01 && Math.abs(h - x) < 0.01 && Math.abs(g - p) < 0.01) {
      if (Math.abs(u + d) < 0.1 && Math.abs(h + x) < 0.1 && Math.abs(g + p) < 0.1 && Math.abs(l + f + m - 3) < 0.1)
        return this.set(1, 0, 0, 0), this;
      t = Math.PI;
      const S = (l + 1) / 2, E = (f + 1) / 2, F = (m + 1) / 2, P = (u + d) / 4, L = (h + x) / 4, z = (g + p) / 4;
      return S > E && S > F ? S < 0.01 ? (n = 0, i = 0.707106781, r = 0.707106781) : (n = Math.sqrt(S), i = P / n, r = L / n) : E > F ? E < 0.01 ? (n = 0.707106781, i = 0, r = 0.707106781) : (i = Math.sqrt(E), n = P / i, r = z / i) : F < 0.01 ? (n = 0.707106781, i = 0.707106781, r = 0) : (r = Math.sqrt(F), n = L / r, i = z / r), this.set(n, i, r, t), this;
    }
    let T = Math.sqrt((p - g) * (p - g) + (h - x) * (h - x) + (d - u) * (d - u));
    return Math.abs(T) < 1e-3 && (T = 1), this.x = (p - g) / T, this.y = (h - x) / T, this.z = (d - u) / T, this.w = Math.acos((l + f + m - 1) / 2), this;
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
class Fl extends xi {
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
    const r = new Ft(i, n.mapping, n.wrapS, n.wrapT, n.magFilter, n.minFilter, n.format, n.type, n.anisotropy, n.colorSpace);
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
    return this.texture.source = new gc(t), this.depthBuffer = e.depthBuffer, this.stencilBuffer = e.stencilBuffer, this.resolveDepthBuffer = e.resolveDepthBuffer, this.resolveStencilBuffer = e.resolveStencilBuffer, e.depthTexture !== null && (this.depthTexture = e.depthTexture.clone()), this.samples = e.samples, this;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
}
class _i extends Fl {
  constructor(e = 1, t = 1, n = {}) {
    super(e, t, n), this.isWebGLRenderTarget = !0;
  }
}
class _c extends Ft {
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
class Bl extends Ft {
  constructor(e = null, t = 1, n = 1, i = 1) {
    super(null), this.isData3DTexture = !0, this.image = { data: e, width: t, height: n, depth: i }, this.magFilter = 1003, this.minFilter = 1003, this.wrapR = 1001, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1;
  }
}
class yn {
  constructor(e = 0, t = 0, n = 0, i = 1) {
    this.isQuaternion = !0, this._x = e, this._y = t, this._z = n, this._w = i;
  }
  static slerpFlat(e, t, n, i, r, a, o) {
    let c = n[i + 0], l = n[i + 1], u = n[i + 2], h = n[i + 3];
    const d = r[a + 0], f = r[a + 1], g = r[a + 2], x = r[a + 3];
    if (o === 0) {
      e[t + 0] = c, e[t + 1] = l, e[t + 2] = u, e[t + 3] = h;
      return;
    }
    if (o === 1) {
      e[t + 0] = d, e[t + 1] = f, e[t + 2] = g, e[t + 3] = x;
      return;
    }
    if (h !== x || c !== d || l !== f || u !== g) {
      let p = 1 - o;
      const m = c * d + l * f + u * g + h * x, T = m >= 0 ? 1 : -1, S = 1 - m * m;
      if (S > Number.EPSILON) {
        const F = Math.sqrt(S), P = Math.atan2(F, m * T);
        p = Math.sin(p * P) / F, o = Math.sin(o * P) / F;
      }
      const E = o * T;
      if (c = c * p + d * E, l = l * p + f * E, u = u * p + g * E, h = h * p + x * E, p === 1 - o) {
        const F = 1 / Math.sqrt(c * c + l * l + u * u + h * h);
        c *= F, l *= F, u *= F, h *= F;
      }
    }
    e[t] = c, e[t + 1] = l, e[t + 2] = u, e[t + 3] = h;
  }
  static multiplyQuaternionsFlat(e, t, n, i, r, a) {
    const o = n[i], c = n[i + 1], l = n[i + 2], u = n[i + 3], h = r[a], d = r[a + 1], f = r[a + 2], g = r[a + 3];
    return e[t] = o * g + u * h + c * f - l * d, e[t + 1] = c * g + u * d + l * h - o * f, e[t + 2] = l * g + u * f + o * d - c * h, e[t + 3] = u * g - o * h - c * d - l * f, e;
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
    const n = e._x, i = e._y, r = e._z, a = e._order, o = Math.cos, c = Math.sin, l = o(n / 2), u = o(i / 2), h = o(r / 2), d = c(n / 2), f = c(i / 2), g = c(r / 2);
    switch (a) {
      case "XYZ":
        this._x = d * u * h + l * f * g, this._y = l * f * h - d * u * g, this._z = l * u * g + d * f * h, this._w = l * u * h - d * f * g;
        break;
      case "YXZ":
        this._x = d * u * h + l * f * g, this._y = l * f * h - d * u * g, this._z = l * u * g - d * f * h, this._w = l * u * h + d * f * g;
        break;
      case "ZXY":
        this._x = d * u * h - l * f * g, this._y = l * f * h + d * u * g, this._z = l * u * g + d * f * h, this._w = l * u * h - d * f * g;
        break;
      case "ZYX":
        this._x = d * u * h - l * f * g, this._y = l * f * h + d * u * g, this._z = l * u * g - d * f * h, this._w = l * u * h + d * f * g;
        break;
      case "YZX":
        this._x = d * u * h + l * f * g, this._y = l * f * h + d * u * g, this._z = l * u * g - d * f * h, this._w = l * u * h - d * f * g;
        break;
      case "XZY":
        this._x = d * u * h - l * f * g, this._y = l * f * h - d * u * g, this._z = l * u * g + d * f * h, this._w = l * u * h + d * f * g;
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
    const t = e.elements, n = t[0], i = t[4], r = t[8], a = t[1], o = t[5], c = t[9], l = t[2], u = t[6], h = t[10], d = n + o + h;
    if (d > 0) {
      const f = 0.5 / Math.sqrt(d + 1);
      this._w = 0.25 / f, this._x = (u - c) * f, this._y = (r - l) * f, this._z = (a - i) * f;
    } else if (n > o && n > h) {
      const f = 2 * Math.sqrt(1 + n - o - h);
      this._w = (u - c) / f, this._x = 0.25 * f, this._y = (i + a) / f, this._z = (r + l) / f;
    } else if (o > h) {
      const f = 2 * Math.sqrt(1 + o - n - h);
      this._w = (r - l) / f, this._x = (i + a) / f, this._y = 0.25 * f, this._z = (c + u) / f;
    } else {
      const f = 2 * Math.sqrt(1 + h - n - o);
      this._w = (a - i) / f, this._x = (r + l) / f, this._y = (c + u) / f, this._z = 0.25 * f;
    }
    return this._onChangeCallback(), this;
  }
  setFromUnitVectors(e, t) {
    let n = e.dot(t) + 1;
    return n < Number.EPSILON ? (n = 0, Math.abs(e.x) > Math.abs(e.z) ? (this._x = -e.y, this._y = e.x, this._z = 0, this._w = n) : (this._x = 0, this._y = -e.z, this._z = e.y, this._w = n)) : (this._x = e.y * t.z - e.z * t.y, this._y = e.z * t.x - e.x * t.z, this._z = e.x * t.y - e.y * t.x, this._w = n), this.normalize();
  }
  angleTo(e) {
    return 2 * Math.acos(Math.abs(jt(this.dot(e), -1, 1)));
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
    const n = e._x, i = e._y, r = e._z, a = e._w, o = t._x, c = t._y, l = t._z, u = t._w;
    return this._x = n * u + a * o + i * l - r * c, this._y = i * u + a * c + r * o - n * l, this._z = r * u + a * l + n * c - i * o, this._w = a * u - n * o - i * c - r * l, this._onChangeCallback(), this;
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
    const l = Math.sqrt(c), u = Math.atan2(l, o), h = Math.sin((1 - t) * u) / l, d = Math.sin(t * u) / l;
    return this._w = a * h + this._w * d, this._x = n * h + this._x * d, this._y = i * h + this._y * d, this._z = r * h + this._z * d, this._onChangeCallback(), this;
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
class N {
  constructor(e = 0, t = 0, n = 0) {
    N.prototype.isVector3 = !0, this.x = e, this.y = t, this.z = n;
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
    return this.applyQuaternion(Qa.setFromEuler(e));
  }
  applyAxisAngle(e, t) {
    return this.applyQuaternion(Qa.setFromAxisAngle(e, t));
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
    const t = this.x, n = this.y, i = this.z, r = e.x, a = e.y, o = e.z, c = e.w, l = 2 * (a * i - o * n), u = 2 * (o * t - r * i), h = 2 * (r * n - a * t);
    return this.x = t + c * l + a * h - o * u, this.y = n + c * u + o * l - r * h, this.z = i + c * h + r * u - a * l, this;
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
    return Lr.copy(this).projectOnVector(e), this.sub(Lr);
  }
  reflect(e) {
    return this.sub(Lr.copy(e).multiplyScalar(2 * this.dot(e)));
  }
  angleTo(e) {
    const t = Math.sqrt(this.lengthSq() * e.lengthSq());
    if (t === 0) return Math.PI / 2;
    const n = this.dot(e) / t;
    return Math.acos(jt(n, -1, 1));
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
const Lr = /* @__PURE__ */ new N(), Qa = /* @__PURE__ */ new yn();
class En {
  constructor(e = new N(1 / 0, 1 / 0, 1 / 0), t = new N(-1 / 0, -1 / 0, -1 / 0)) {
    this.isBox3 = !0, this.min = e, this.max = t;
  }
  set(e, t) {
    return this.min.copy(e), this.max.copy(t), this;
  }
  setFromArray(e) {
    this.makeEmpty();
    for (let t = 0, n = e.length; t < n; t += 3)
      this.expandByPoint(mn.fromArray(e, t));
    return this;
  }
  setFromBufferAttribute(e) {
    this.makeEmpty();
    for (let t = 0, n = e.count; t < n; t++)
      this.expandByPoint(mn.fromBufferAttribute(e, t));
    return this;
  }
  setFromPoints(e) {
    this.makeEmpty();
    for (let t = 0, n = e.length; t < n; t++)
      this.expandByPoint(e[t]);
    return this;
  }
  setFromCenterAndSize(e, t) {
    const n = mn.copy(t).multiplyScalar(0.5);
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
          e.isMesh === !0 ? e.getVertexPosition(a, mn) : mn.fromBufferAttribute(r, a), mn.applyMatrix4(e.matrixWorld), this.expandByPoint(mn);
      else
        e.boundingBox !== void 0 ? (e.boundingBox === null && e.computeBoundingBox(), Ps.copy(e.boundingBox)) : (n.boundingBox === null && n.computeBoundingBox(), Ps.copy(n.boundingBox)), Ps.applyMatrix4(e.matrixWorld), this.union(Ps);
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
    return this.clampPoint(e.center, mn), mn.distanceToSquared(e.center) <= e.radius * e.radius;
  }
  intersectsPlane(e) {
    let t, n;
    return e.normal.x > 0 ? (t = e.normal.x * this.min.x, n = e.normal.x * this.max.x) : (t = e.normal.x * this.max.x, n = e.normal.x * this.min.x), e.normal.y > 0 ? (t += e.normal.y * this.min.y, n += e.normal.y * this.max.y) : (t += e.normal.y * this.max.y, n += e.normal.y * this.min.y), e.normal.z > 0 ? (t += e.normal.z * this.min.z, n += e.normal.z * this.max.z) : (t += e.normal.z * this.max.z, n += e.normal.z * this.min.z), t <= -e.constant && n >= -e.constant;
  }
  intersectsTriangle(e) {
    if (this.isEmpty())
      return !1;
    this.getCenter(cs), Ls.subVectors(this.max, cs), Ci.subVectors(e.a, cs), Ii.subVectors(e.b, cs), Pi.subVectors(e.c, cs), Vn.subVectors(Ii, Ci), Wn.subVectors(Pi, Ii), ri.subVectors(Ci, Pi);
    let t = [
      0,
      -Vn.z,
      Vn.y,
      0,
      -Wn.z,
      Wn.y,
      0,
      -ri.z,
      ri.y,
      Vn.z,
      0,
      -Vn.x,
      Wn.z,
      0,
      -Wn.x,
      ri.z,
      0,
      -ri.x,
      -Vn.y,
      Vn.x,
      0,
      -Wn.y,
      Wn.x,
      0,
      -ri.y,
      ri.x,
      0
    ];
    return !Dr(t, Ci, Ii, Pi, Ls) || (t = [1, 0, 0, 0, 1, 0, 0, 0, 1], !Dr(t, Ci, Ii, Pi, Ls)) ? !1 : (Ds.crossVectors(Vn, Wn), t = [Ds.x, Ds.y, Ds.z], Dr(t, Ci, Ii, Pi, Ls));
  }
  clampPoint(e, t) {
    return t.copy(e).clamp(this.min, this.max);
  }
  distanceToPoint(e) {
    return this.clampPoint(e, mn).distanceTo(e);
  }
  getBoundingSphere(e) {
    return this.isEmpty() ? e.makeEmpty() : (this.getCenter(e.center), e.radius = this.getSize(mn).length() * 0.5), e;
  }
  intersect(e) {
    return this.min.max(e.min), this.max.min(e.max), this.isEmpty() && this.makeEmpty(), this;
  }
  union(e) {
    return this.min.min(e.min), this.max.max(e.max), this;
  }
  applyMatrix4(e) {
    return this.isEmpty() ? this : (Dn[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(e), Dn[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(e), Dn[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(e), Dn[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(e), Dn[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(e), Dn[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(e), Dn[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(e), Dn[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(e), this.setFromPoints(Dn), this);
  }
  translate(e) {
    return this.min.add(e), this.max.add(e), this;
  }
  equals(e) {
    return e.min.equals(this.min) && e.max.equals(this.max);
  }
}
const Dn = [
  /* @__PURE__ */ new N(),
  /* @__PURE__ */ new N(),
  /* @__PURE__ */ new N(),
  /* @__PURE__ */ new N(),
  /* @__PURE__ */ new N(),
  /* @__PURE__ */ new N(),
  /* @__PURE__ */ new N(),
  /* @__PURE__ */ new N()
], mn = /* @__PURE__ */ new N(), Ps = /* @__PURE__ */ new En(), Ci = /* @__PURE__ */ new N(), Ii = /* @__PURE__ */ new N(), Pi = /* @__PURE__ */ new N(), Vn = /* @__PURE__ */ new N(), Wn = /* @__PURE__ */ new N(), ri = /* @__PURE__ */ new N(), cs = /* @__PURE__ */ new N(), Ls = /* @__PURE__ */ new N(), Ds = /* @__PURE__ */ new N(), ai = /* @__PURE__ */ new N();
function Dr(s, e, t, n, i) {
  for (let r = 0, a = s.length - 3; r <= a; r += 3) {
    ai.fromArray(s, r);
    const o = i.x * Math.abs(ai.x) + i.y * Math.abs(ai.y) + i.z * Math.abs(ai.z), c = e.dot(ai), l = t.dot(ai), u = n.dot(ai);
    if (Math.max(-Math.max(c, l, u), Math.min(c, l, u)) > o)
      return !1;
  }
  return !0;
}
const Ol = /* @__PURE__ */ new En(), ls = /* @__PURE__ */ new N(), Ur = /* @__PURE__ */ new N();
class Cn {
  constructor(e = new N(), t = -1) {
    this.isSphere = !0, this.center = e, this.radius = t;
  }
  set(e, t) {
    return this.center.copy(e), this.radius = t, this;
  }
  setFromPoints(e, t) {
    const n = this.center;
    t !== void 0 ? n.copy(t) : Ol.setFromPoints(e).getCenter(n);
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
    ls.subVectors(e, this.center);
    const t = ls.lengthSq();
    if (t > this.radius * this.radius) {
      const n = Math.sqrt(t), i = (n - this.radius) * 0.5;
      this.center.addScaledVector(ls, i / n), this.radius += i;
    }
    return this;
  }
  union(e) {
    return e.isEmpty() ? this : this.isEmpty() ? (this.copy(e), this) : (this.center.equals(e.center) === !0 ? this.radius = Math.max(this.radius, e.radius) : (Ur.subVectors(e.center, this.center).setLength(e.radius), this.expandByPoint(ls.copy(e.center).add(Ur)), this.expandByPoint(ls.copy(e.center).sub(Ur))), this);
  }
  equals(e) {
    return e.center.equals(this.center) && e.radius === this.radius;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
const Un = /* @__PURE__ */ new N(), Nr = /* @__PURE__ */ new N(), Us = /* @__PURE__ */ new N(), Xn = /* @__PURE__ */ new N(), Fr = /* @__PURE__ */ new N(), Ns = /* @__PURE__ */ new N(), Br = /* @__PURE__ */ new N();
class Ss {
  constructor(e = new N(), t = new N(0, 0, -1)) {
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
    return this.origin.copy(this.at(e, Un)), this;
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
    const t = Un.subVectors(e, this.origin).dot(this.direction);
    return t < 0 ? this.origin.distanceToSquared(e) : (Un.copy(this.origin).addScaledVector(this.direction, t), Un.distanceToSquared(e));
  }
  distanceSqToSegment(e, t, n, i) {
    Nr.copy(e).add(t).multiplyScalar(0.5), Us.copy(t).sub(e).normalize(), Xn.copy(this.origin).sub(Nr);
    const r = e.distanceTo(t) * 0.5, a = -this.direction.dot(Us), o = Xn.dot(this.direction), c = -Xn.dot(Us), l = Xn.lengthSq(), u = Math.abs(1 - a * a);
    let h, d, f, g;
    if (u > 0)
      if (h = a * c - o, d = a * o - c, g = r * u, h >= 0)
        if (d >= -g)
          if (d <= g) {
            const x = 1 / u;
            h *= x, d *= x, f = h * (h + a * d + 2 * o) + d * (a * h + d + 2 * c) + l;
          } else
            d = r, h = Math.max(0, -(a * d + o)), f = -h * h + d * (d + 2 * c) + l;
        else
          d = -r, h = Math.max(0, -(a * d + o)), f = -h * h + d * (d + 2 * c) + l;
      else
        d <= -g ? (h = Math.max(0, -(-a * r + o)), d = h > 0 ? -r : Math.min(Math.max(-r, -c), r), f = -h * h + d * (d + 2 * c) + l) : d <= g ? (h = 0, d = Math.min(Math.max(-r, -c), r), f = d * (d + 2 * c) + l) : (h = Math.max(0, -(a * r + o)), d = h > 0 ? r : Math.min(Math.max(-r, -c), r), f = -h * h + d * (d + 2 * c) + l);
    else
      d = a > 0 ? -r : r, h = Math.max(0, -(a * d + o)), f = -h * h + d * (d + 2 * c) + l;
    return n && n.copy(this.origin).addScaledVector(this.direction, h), i && i.copy(Nr).addScaledVector(Us, d), f;
  }
  intersectSphere(e, t) {
    Un.subVectors(e.center, this.origin);
    const n = Un.dot(this.direction), i = Un.dot(Un) - n * n, r = e.radius * e.radius;
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
    const l = 1 / this.direction.x, u = 1 / this.direction.y, h = 1 / this.direction.z, d = this.origin;
    return l >= 0 ? (n = (e.min.x - d.x) * l, i = (e.max.x - d.x) * l) : (n = (e.max.x - d.x) * l, i = (e.min.x - d.x) * l), u >= 0 ? (r = (e.min.y - d.y) * u, a = (e.max.y - d.y) * u) : (r = (e.max.y - d.y) * u, a = (e.min.y - d.y) * u), n > a || r > i || ((r > n || isNaN(n)) && (n = r), (a < i || isNaN(i)) && (i = a), h >= 0 ? (o = (e.min.z - d.z) * h, c = (e.max.z - d.z) * h) : (o = (e.max.z - d.z) * h, c = (e.min.z - d.z) * h), n > c || o > i) || ((o > n || n !== n) && (n = o), (c < i || i !== i) && (i = c), i < 0) ? null : this.at(n >= 0 ? n : i, t);
  }
  intersectsBox(e) {
    return this.intersectBox(e, Un) !== null;
  }
  intersectTriangle(e, t, n, i, r) {
    Fr.subVectors(t, e), Ns.subVectors(n, e), Br.crossVectors(Fr, Ns);
    let a = this.direction.dot(Br), o;
    if (a > 0) {
      if (i) return null;
      o = 1;
    } else if (a < 0)
      o = -1, a = -a;
    else
      return null;
    Xn.subVectors(this.origin, e);
    const c = o * this.direction.dot(Ns.crossVectors(Xn, Ns));
    if (c < 0)
      return null;
    const l = o * this.direction.dot(Fr.cross(Xn));
    if (l < 0 || c + l > a)
      return null;
    const u = -o * Xn.dot(Br);
    return u < 0 ? null : this.at(u / a, r);
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
class je {
  constructor(e, t, n, i, r, a, o, c, l, u, h, d, f, g, x, p) {
    je.prototype.isMatrix4 = !0, this.elements = [
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
    ], e !== void 0 && this.set(e, t, n, i, r, a, o, c, l, u, h, d, f, g, x, p);
  }
  set(e, t, n, i, r, a, o, c, l, u, h, d, f, g, x, p) {
    const m = this.elements;
    return m[0] = e, m[4] = t, m[8] = n, m[12] = i, m[1] = r, m[5] = a, m[9] = o, m[13] = c, m[2] = l, m[6] = u, m[10] = h, m[14] = d, m[3] = f, m[7] = g, m[11] = x, m[15] = p, this;
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
    return new je().fromArray(this.elements);
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
    const t = this.elements, n = e.elements, i = 1 / Li.setFromMatrixColumn(e, 0).length(), r = 1 / Li.setFromMatrixColumn(e, 1).length(), a = 1 / Li.setFromMatrixColumn(e, 2).length();
    return t[0] = n[0] * i, t[1] = n[1] * i, t[2] = n[2] * i, t[3] = 0, t[4] = n[4] * r, t[5] = n[5] * r, t[6] = n[6] * r, t[7] = 0, t[8] = n[8] * a, t[9] = n[9] * a, t[10] = n[10] * a, t[11] = 0, t[12] = 0, t[13] = 0, t[14] = 0, t[15] = 1, this;
  }
  makeRotationFromEuler(e) {
    const t = this.elements, n = e.x, i = e.y, r = e.z, a = Math.cos(n), o = Math.sin(n), c = Math.cos(i), l = Math.sin(i), u = Math.cos(r), h = Math.sin(r);
    if (e.order === "XYZ") {
      const d = a * u, f = a * h, g = o * u, x = o * h;
      t[0] = c * u, t[4] = -c * h, t[8] = l, t[1] = f + g * l, t[5] = d - x * l, t[9] = -o * c, t[2] = x - d * l, t[6] = g + f * l, t[10] = a * c;
    } else if (e.order === "YXZ") {
      const d = c * u, f = c * h, g = l * u, x = l * h;
      t[0] = d + x * o, t[4] = g * o - f, t[8] = a * l, t[1] = a * h, t[5] = a * u, t[9] = -o, t[2] = f * o - g, t[6] = x + d * o, t[10] = a * c;
    } else if (e.order === "ZXY") {
      const d = c * u, f = c * h, g = l * u, x = l * h;
      t[0] = d - x * o, t[4] = -a * h, t[8] = g + f * o, t[1] = f + g * o, t[5] = a * u, t[9] = x - d * o, t[2] = -a * l, t[6] = o, t[10] = a * c;
    } else if (e.order === "ZYX") {
      const d = a * u, f = a * h, g = o * u, x = o * h;
      t[0] = c * u, t[4] = g * l - f, t[8] = d * l + x, t[1] = c * h, t[5] = x * l + d, t[9] = f * l - g, t[2] = -l, t[6] = o * c, t[10] = a * c;
    } else if (e.order === "YZX") {
      const d = a * c, f = a * l, g = o * c, x = o * l;
      t[0] = c * u, t[4] = x - d * h, t[8] = g * h + f, t[1] = h, t[5] = a * u, t[9] = -o * u, t[2] = -l * u, t[6] = f * h + g, t[10] = d - x * h;
    } else if (e.order === "XZY") {
      const d = a * c, f = a * l, g = o * c, x = o * l;
      t[0] = c * u, t[4] = -h, t[8] = l * u, t[1] = d * h + x, t[5] = a * u, t[9] = f * h - g, t[2] = g * h - f, t[6] = o * u, t[10] = x * h + d;
    }
    return t[3] = 0, t[7] = 0, t[11] = 0, t[12] = 0, t[13] = 0, t[14] = 0, t[15] = 1, this;
  }
  makeRotationFromQuaternion(e) {
    return this.compose(kl, e, zl);
  }
  lookAt(e, t, n) {
    const i = this.elements;
    return nn.subVectors(e, t), nn.lengthSq() === 0 && (nn.z = 1), nn.normalize(), qn.crossVectors(n, nn), qn.lengthSq() === 0 && (Math.abs(n.z) === 1 ? nn.x += 1e-4 : nn.z += 1e-4, nn.normalize(), qn.crossVectors(n, nn)), qn.normalize(), Fs.crossVectors(nn, qn), i[0] = qn.x, i[4] = Fs.x, i[8] = nn.x, i[1] = qn.y, i[5] = Fs.y, i[9] = nn.y, i[2] = qn.z, i[6] = Fs.z, i[10] = nn.z, this;
  }
  multiply(e) {
    return this.multiplyMatrices(this, e);
  }
  premultiply(e) {
    return this.multiplyMatrices(e, this);
  }
  multiplyMatrices(e, t) {
    const n = e.elements, i = t.elements, r = this.elements, a = n[0], o = n[4], c = n[8], l = n[12], u = n[1], h = n[5], d = n[9], f = n[13], g = n[2], x = n[6], p = n[10], m = n[14], T = n[3], S = n[7], E = n[11], F = n[15], P = i[0], L = i[4], z = i[8], ee = i[12], v = i[1], A = i[5], W = i[9], q = i[13], Y = i[2], se = i[6], j = i[10], he = i[14], X = i[3], xe = i[7], ve = i[11], we = i[15];
    return r[0] = a * P + o * v + c * Y + l * X, r[4] = a * L + o * A + c * se + l * xe, r[8] = a * z + o * W + c * j + l * ve, r[12] = a * ee + o * q + c * he + l * we, r[1] = u * P + h * v + d * Y + f * X, r[5] = u * L + h * A + d * se + f * xe, r[9] = u * z + h * W + d * j + f * ve, r[13] = u * ee + h * q + d * he + f * we, r[2] = g * P + x * v + p * Y + m * X, r[6] = g * L + x * A + p * se + m * xe, r[10] = g * z + x * W + p * j + m * ve, r[14] = g * ee + x * q + p * he + m * we, r[3] = T * P + S * v + E * Y + F * X, r[7] = T * L + S * A + E * se + F * xe, r[11] = T * z + S * W + E * j + F * ve, r[15] = T * ee + S * q + E * he + F * we, this;
  }
  multiplyScalar(e) {
    const t = this.elements;
    return t[0] *= e, t[4] *= e, t[8] *= e, t[12] *= e, t[1] *= e, t[5] *= e, t[9] *= e, t[13] *= e, t[2] *= e, t[6] *= e, t[10] *= e, t[14] *= e, t[3] *= e, t[7] *= e, t[11] *= e, t[15] *= e, this;
  }
  determinant() {
    const e = this.elements, t = e[0], n = e[4], i = e[8], r = e[12], a = e[1], o = e[5], c = e[9], l = e[13], u = e[2], h = e[6], d = e[10], f = e[14], g = e[3], x = e[7], p = e[11], m = e[15];
    return g * (+r * c * h - i * l * h - r * o * d + n * l * d + i * o * f - n * c * f) + x * (+t * c * f - t * l * d + r * a * d - i * a * f + i * l * u - r * c * u) + p * (+t * l * h - t * o * f - r * a * h + n * a * f + r * o * u - n * l * u) + m * (-i * o * u - t * c * h + t * o * d + i * a * h - n * a * d + n * c * u);
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
    const e = this.elements, t = e[0], n = e[1], i = e[2], r = e[3], a = e[4], o = e[5], c = e[6], l = e[7], u = e[8], h = e[9], d = e[10], f = e[11], g = e[12], x = e[13], p = e[14], m = e[15], T = h * p * l - x * d * l + x * c * f - o * p * f - h * c * m + o * d * m, S = g * d * l - u * p * l - g * c * f + a * p * f + u * c * m - a * d * m, E = u * x * l - g * h * l + g * o * f - a * x * f - u * o * m + a * h * m, F = g * h * c - u * x * c - g * o * d + a * x * d + u * o * p - a * h * p, P = t * T + n * S + i * E + r * F;
    if (P === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    const L = 1 / P;
    return e[0] = T * L, e[1] = (x * d * r - h * p * r - x * i * f + n * p * f + h * i * m - n * d * m) * L, e[2] = (o * p * r - x * c * r + x * i * l - n * p * l - o * i * m + n * c * m) * L, e[3] = (h * c * r - o * d * r - h * i * l + n * d * l + o * i * f - n * c * f) * L, e[4] = S * L, e[5] = (u * p * r - g * d * r + g * i * f - t * p * f - u * i * m + t * d * m) * L, e[6] = (g * c * r - a * p * r - g * i * l + t * p * l + a * i * m - t * c * m) * L, e[7] = (a * d * r - u * c * r + u * i * l - t * d * l - a * i * f + t * c * f) * L, e[8] = E * L, e[9] = (g * h * r - u * x * r - g * n * f + t * x * f + u * n * m - t * h * m) * L, e[10] = (a * x * r - g * o * r + g * n * l - t * x * l - a * n * m + t * o * m) * L, e[11] = (u * o * r - a * h * r - u * n * l + t * h * l + a * n * f - t * o * f) * L, e[12] = F * L, e[13] = (u * x * i - g * h * i + g * n * d - t * x * d - u * n * p + t * h * p) * L, e[14] = (g * o * i - a * x * i - g * n * c + t * x * c + a * n * p - t * o * p) * L, e[15] = (a * h * i - u * o * i + u * n * c - t * h * c - a * n * d + t * o * d) * L, this;
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
    const n = Math.cos(t), i = Math.sin(t), r = 1 - n, a = e.x, o = e.y, c = e.z, l = r * a, u = r * o;
    return this.set(
      l * a + n,
      l * o - i * c,
      l * c + i * o,
      0,
      l * o + i * c,
      u * o + n,
      u * c - i * a,
      0,
      l * c - i * o,
      u * c + i * a,
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
    const i = this.elements, r = t._x, a = t._y, o = t._z, c = t._w, l = r + r, u = a + a, h = o + o, d = r * l, f = r * u, g = r * h, x = a * u, p = a * h, m = o * h, T = c * l, S = c * u, E = c * h, F = n.x, P = n.y, L = n.z;
    return i[0] = (1 - (x + m)) * F, i[1] = (f + E) * F, i[2] = (g - S) * F, i[3] = 0, i[4] = (f - E) * P, i[5] = (1 - (d + m)) * P, i[6] = (p + T) * P, i[7] = 0, i[8] = (g + S) * L, i[9] = (p - T) * L, i[10] = (1 - (d + x)) * L, i[11] = 0, i[12] = e.x, i[13] = e.y, i[14] = e.z, i[15] = 1, this;
  }
  decompose(e, t, n) {
    const i = this.elements;
    let r = Li.set(i[0], i[1], i[2]).length();
    const a = Li.set(i[4], i[5], i[6]).length(), o = Li.set(i[8], i[9], i[10]).length();
    this.determinant() < 0 && (r = -r), e.x = i[12], e.y = i[13], e.z = i[14], gn.copy(this);
    const l = 1 / r, u = 1 / a, h = 1 / o;
    return gn.elements[0] *= l, gn.elements[1] *= l, gn.elements[2] *= l, gn.elements[4] *= u, gn.elements[5] *= u, gn.elements[6] *= u, gn.elements[8] *= h, gn.elements[9] *= h, gn.elements[10] *= h, t.setFromRotationMatrix(gn), n.x = r, n.y = a, n.z = o, this;
  }
  makePerspective(e, t, n, i, r, a, o = 2e3) {
    const c = this.elements, l = 2 * r / (t - e), u = 2 * r / (n - i), h = (t + e) / (t - e), d = (n + i) / (n - i);
    let f, g;
    if (o === 2e3)
      f = -(a + r) / (a - r), g = -2 * a * r / (a - r);
    else if (o === 2001)
      f = -a / (a - r), g = -a * r / (a - r);
    else
      throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: " + o);
    return c[0] = l, c[4] = 0, c[8] = h, c[12] = 0, c[1] = 0, c[5] = u, c[9] = d, c[13] = 0, c[2] = 0, c[6] = 0, c[10] = f, c[14] = g, c[3] = 0, c[7] = 0, c[11] = -1, c[15] = 0, this;
  }
  makeOrthographic(e, t, n, i, r, a, o = 2e3) {
    const c = this.elements, l = 1 / (t - e), u = 1 / (n - i), h = 1 / (a - r), d = (t + e) * l, f = (n + i) * u;
    let g, x;
    if (o === 2e3)
      g = (a + r) * h, x = -2 * h;
    else if (o === 2001)
      g = r * h, x = -1 * h;
    else
      throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: " + o);
    return c[0] = 2 * l, c[4] = 0, c[8] = 0, c[12] = -d, c[1] = 0, c[5] = 2 * u, c[9] = 0, c[13] = -f, c[2] = 0, c[6] = 0, c[10] = x, c[14] = -g, c[3] = 0, c[7] = 0, c[11] = 0, c[15] = 1, this;
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
const Li = /* @__PURE__ */ new N(), gn = /* @__PURE__ */ new je(), kl = /* @__PURE__ */ new N(0, 0, 0), zl = /* @__PURE__ */ new N(1, 1, 1), qn = /* @__PURE__ */ new N(), Fs = /* @__PURE__ */ new N(), nn = /* @__PURE__ */ new N(), eo = /* @__PURE__ */ new je(), to = /* @__PURE__ */ new yn();
class Sn {
  constructor(e = 0, t = 0, n = 0, i = Sn.DEFAULT_ORDER) {
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
    const i = e.elements, r = i[0], a = i[4], o = i[8], c = i[1], l = i[5], u = i[9], h = i[2], d = i[6], f = i[10];
    switch (t) {
      case "XYZ":
        this._y = Math.asin(jt(o, -1, 1)), Math.abs(o) < 0.9999999 ? (this._x = Math.atan2(-u, f), this._z = Math.atan2(-a, r)) : (this._x = Math.atan2(d, l), this._z = 0);
        break;
      case "YXZ":
        this._x = Math.asin(-jt(u, -1, 1)), Math.abs(u) < 0.9999999 ? (this._y = Math.atan2(o, f), this._z = Math.atan2(c, l)) : (this._y = Math.atan2(-h, r), this._z = 0);
        break;
      case "ZXY":
        this._x = Math.asin(jt(d, -1, 1)), Math.abs(d) < 0.9999999 ? (this._y = Math.atan2(-h, f), this._z = Math.atan2(-a, l)) : (this._y = 0, this._z = Math.atan2(c, r));
        break;
      case "ZYX":
        this._y = Math.asin(-jt(h, -1, 1)), Math.abs(h) < 0.9999999 ? (this._x = Math.atan2(d, f), this._z = Math.atan2(c, r)) : (this._x = 0, this._z = Math.atan2(-a, l));
        break;
      case "YZX":
        this._z = Math.asin(jt(c, -1, 1)), Math.abs(c) < 0.9999999 ? (this._x = Math.atan2(-u, l), this._y = Math.atan2(-h, r)) : (this._x = 0, this._y = Math.atan2(o, f));
        break;
      case "XZY":
        this._z = Math.asin(-jt(a, -1, 1)), Math.abs(a) < 0.9999999 ? (this._x = Math.atan2(d, l), this._y = Math.atan2(o, r)) : (this._x = Math.atan2(-u, f), this._y = 0);
        break;
      default:
        console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: " + t);
    }
    return this._order = t, n === !0 && this._onChangeCallback(), this;
  }
  setFromQuaternion(e, t, n) {
    return eo.makeRotationFromQuaternion(e), this.setFromRotationMatrix(eo, t, n);
  }
  setFromVector3(e, t = this._order) {
    return this.set(e.x, e.y, e.z, t);
  }
  reorder(e) {
    return to.setFromEuler(this), this.setFromQuaternion(to, e);
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
Sn.DEFAULT_ORDER = "XYZ";
class Aa {
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
let Gl = 0;
const no = /* @__PURE__ */ new N(), Di = /* @__PURE__ */ new yn(), Nn = /* @__PURE__ */ new je(), Bs = /* @__PURE__ */ new N(), hs = /* @__PURE__ */ new N(), Hl = /* @__PURE__ */ new N(), Vl = /* @__PURE__ */ new yn(), io = /* @__PURE__ */ new N(1, 0, 0), so = /* @__PURE__ */ new N(0, 1, 0), ro = /* @__PURE__ */ new N(0, 0, 1), ao = { type: "added" }, Wl = { type: "removed" }, Ui = { type: "childadded", child: null }, Or = { type: "childremoved", child: null };
class At extends xi {
  constructor() {
    super(), this.isObject3D = !0, Object.defineProperty(this, "id", { value: Gl++ }), this.uuid = Mn(), this.name = "", this.type = "Object3D", this.parent = null, this.children = [], this.up = At.DEFAULT_UP.clone();
    const e = new N(), t = new Sn(), n = new yn(), i = new N(1, 1, 1);
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
        value: new je()
      },
      normalMatrix: {
        value: new Ke()
      }
    }), this.matrix = new je(), this.matrixWorld = new je(), this.matrixAutoUpdate = At.DEFAULT_MATRIX_AUTO_UPDATE, this.matrixWorldAutoUpdate = At.DEFAULT_MATRIX_WORLD_AUTO_UPDATE, this.matrixWorldNeedsUpdate = !1, this.layers = new Aa(), this.visible = !0, this.castShadow = !1, this.receiveShadow = !1, this.frustumCulled = !0, this.renderOrder = 0, this.animations = [], this.userData = {};
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
    return Di.setFromAxisAngle(e, t), this.quaternion.multiply(Di), this;
  }
  rotateOnWorldAxis(e, t) {
    return Di.setFromAxisAngle(e, t), this.quaternion.premultiply(Di), this;
  }
  rotateX(e) {
    return this.rotateOnAxis(io, e);
  }
  rotateY(e) {
    return this.rotateOnAxis(so, e);
  }
  rotateZ(e) {
    return this.rotateOnAxis(ro, e);
  }
  translateOnAxis(e, t) {
    return no.copy(e).applyQuaternion(this.quaternion), this.position.add(no.multiplyScalar(t)), this;
  }
  translateX(e) {
    return this.translateOnAxis(io, e);
  }
  translateY(e) {
    return this.translateOnAxis(so, e);
  }
  translateZ(e) {
    return this.translateOnAxis(ro, e);
  }
  localToWorld(e) {
    return this.updateWorldMatrix(!0, !1), e.applyMatrix4(this.matrixWorld);
  }
  worldToLocal(e) {
    return this.updateWorldMatrix(!0, !1), e.applyMatrix4(Nn.copy(this.matrixWorld).invert());
  }
  lookAt(e, t, n) {
    e.isVector3 ? Bs.copy(e) : Bs.set(e, t, n);
    const i = this.parent;
    this.updateWorldMatrix(!0, !1), hs.setFromMatrixPosition(this.matrixWorld), this.isCamera || this.isLight ? Nn.lookAt(hs, Bs, this.up) : Nn.lookAt(Bs, hs, this.up), this.quaternion.setFromRotationMatrix(Nn), i && (Nn.extractRotation(i.matrixWorld), Di.setFromRotationMatrix(Nn), this.quaternion.premultiply(Di.invert()));
  }
  add(e) {
    if (arguments.length > 1) {
      for (let t = 0; t < arguments.length; t++)
        this.add(arguments[t]);
      return this;
    }
    return e === this ? (console.error("THREE.Object3D.add: object can't be added as a child of itself.", e), this) : (e && e.isObject3D ? (e.removeFromParent(), e.parent = this, this.children.push(e), e.dispatchEvent(ao), Ui.child = e, this.dispatchEvent(Ui), Ui.child = null) : console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", e), this);
  }
  remove(e) {
    if (arguments.length > 1) {
      for (let n = 0; n < arguments.length; n++)
        this.remove(arguments[n]);
      return this;
    }
    const t = this.children.indexOf(e);
    return t !== -1 && (e.parent = null, this.children.splice(t, 1), e.dispatchEvent(Wl), Or.child = e, this.dispatchEvent(Or), Or.child = null), this;
  }
  removeFromParent() {
    const e = this.parent;
    return e !== null && e.remove(this), this;
  }
  clear() {
    return this.remove(...this.children);
  }
  attach(e) {
    return this.updateWorldMatrix(!0, !1), Nn.copy(this.matrixWorld).invert(), e.parent !== null && (e.parent.updateWorldMatrix(!0, !1), Nn.multiply(e.parent.matrixWorld)), e.applyMatrix4(Nn), e.removeFromParent(), e.parent = this, this.children.push(e), e.updateWorldMatrix(!1, !0), e.dispatchEvent(ao), Ui.child = e, this.dispatchEvent(Ui), Ui.child = null, this;
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
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(hs, e, Hl), e;
  }
  getWorldScale(e) {
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(hs, Vl, e), e;
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
          for (let l = 0, u = c.length; l < u; l++) {
            const h = c[l];
            r(e.shapes, h);
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
      const o = a(e.geometries), c = a(e.materials), l = a(e.textures), u = a(e.images), h = a(e.shapes), d = a(e.skeletons), f = a(e.animations), g = a(e.nodes);
      o.length > 0 && (n.geometries = o), c.length > 0 && (n.materials = c), l.length > 0 && (n.textures = l), u.length > 0 && (n.images = u), h.length > 0 && (n.shapes = h), d.length > 0 && (n.skeletons = d), f.length > 0 && (n.animations = f), g.length > 0 && (n.nodes = g);
    }
    return n.object = i, n;
    function a(o) {
      const c = [];
      for (const l in o) {
        const u = o[l];
        delete u.metadata, c.push(u);
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
At.DEFAULT_UP = /* @__PURE__ */ new N(0, 1, 0);
At.DEFAULT_MATRIX_AUTO_UPDATE = !0;
At.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = !0;
const _n = /* @__PURE__ */ new N(), Fn = /* @__PURE__ */ new N(), kr = /* @__PURE__ */ new N(), Bn = /* @__PURE__ */ new N(), Ni = /* @__PURE__ */ new N(), Fi = /* @__PURE__ */ new N(), oo = /* @__PURE__ */ new N(), zr = /* @__PURE__ */ new N(), Gr = /* @__PURE__ */ new N(), Hr = /* @__PURE__ */ new N(), Vr = /* @__PURE__ */ new ut(), Wr = /* @__PURE__ */ new ut(), Xr = /* @__PURE__ */ new ut();
class dn {
  constructor(e = new N(), t = new N(), n = new N()) {
    this.a = e, this.b = t, this.c = n;
  }
  static getNormal(e, t, n, i) {
    i.subVectors(n, t), _n.subVectors(e, t), i.cross(_n);
    const r = i.lengthSq();
    return r > 0 ? i.multiplyScalar(1 / Math.sqrt(r)) : i.set(0, 0, 0);
  }
  // static/instance method to calculate barycentric coordinates
  // based on: http://www.blackpawn.com/texts/pointinpoly/default.html
  static getBarycoord(e, t, n, i, r) {
    _n.subVectors(i, t), Fn.subVectors(n, t), kr.subVectors(e, t);
    const a = _n.dot(_n), o = _n.dot(Fn), c = _n.dot(kr), l = Fn.dot(Fn), u = Fn.dot(kr), h = a * l - o * o;
    if (h === 0)
      return r.set(0, 0, 0), null;
    const d = 1 / h, f = (l * c - o * u) * d, g = (a * u - o * c) * d;
    return r.set(1 - f - g, g, f);
  }
  static containsPoint(e, t, n, i) {
    return this.getBarycoord(e, t, n, i, Bn) === null ? !1 : Bn.x >= 0 && Bn.y >= 0 && Bn.x + Bn.y <= 1;
  }
  static getInterpolation(e, t, n, i, r, a, o, c) {
    return this.getBarycoord(e, t, n, i, Bn) === null ? (c.x = 0, c.y = 0, "z" in c && (c.z = 0), "w" in c && (c.w = 0), null) : (c.setScalar(0), c.addScaledVector(r, Bn.x), c.addScaledVector(a, Bn.y), c.addScaledVector(o, Bn.z), c);
  }
  static getInterpolatedAttribute(e, t, n, i, r, a) {
    return Vr.setScalar(0), Wr.setScalar(0), Xr.setScalar(0), Vr.fromBufferAttribute(e, t), Wr.fromBufferAttribute(e, n), Xr.fromBufferAttribute(e, i), a.setScalar(0), a.addScaledVector(Vr, r.x), a.addScaledVector(Wr, r.y), a.addScaledVector(Xr, r.z), a;
  }
  static isFrontFacing(e, t, n, i) {
    return _n.subVectors(n, t), Fn.subVectors(e, t), _n.cross(Fn).dot(i) < 0;
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
    return _n.subVectors(this.c, this.b), Fn.subVectors(this.a, this.b), _n.cross(Fn).length() * 0.5;
  }
  getMidpoint(e) {
    return e.addVectors(this.a, this.b).add(this.c).multiplyScalar(1 / 3);
  }
  getNormal(e) {
    return dn.getNormal(this.a, this.b, this.c, e);
  }
  getPlane(e) {
    return e.setFromCoplanarPoints(this.a, this.b, this.c);
  }
  getBarycoord(e, t) {
    return dn.getBarycoord(e, this.a, this.b, this.c, t);
  }
  getInterpolation(e, t, n, i, r) {
    return dn.getInterpolation(e, this.a, this.b, this.c, t, n, i, r);
  }
  containsPoint(e) {
    return dn.containsPoint(e, this.a, this.b, this.c);
  }
  isFrontFacing(e) {
    return dn.isFrontFacing(this.a, this.b, this.c, e);
  }
  intersectsBox(e) {
    return e.intersectsTriangle(this);
  }
  closestPointToPoint(e, t) {
    const n = this.a, i = this.b, r = this.c;
    let a, o;
    Ni.subVectors(i, n), Fi.subVectors(r, n), zr.subVectors(e, n);
    const c = Ni.dot(zr), l = Fi.dot(zr);
    if (c <= 0 && l <= 0)
      return t.copy(n);
    Gr.subVectors(e, i);
    const u = Ni.dot(Gr), h = Fi.dot(Gr);
    if (u >= 0 && h <= u)
      return t.copy(i);
    const d = c * h - u * l;
    if (d <= 0 && c >= 0 && u <= 0)
      return a = c / (c - u), t.copy(n).addScaledVector(Ni, a);
    Hr.subVectors(e, r);
    const f = Ni.dot(Hr), g = Fi.dot(Hr);
    if (g >= 0 && f <= g)
      return t.copy(r);
    const x = f * l - c * g;
    if (x <= 0 && l >= 0 && g <= 0)
      return o = l / (l - g), t.copy(n).addScaledVector(Fi, o);
    const p = u * g - f * h;
    if (p <= 0 && h - u >= 0 && f - g >= 0)
      return oo.subVectors(r, i), o = (h - u) / (h - u + (f - g)), t.copy(i).addScaledVector(oo, o);
    const m = 1 / (p + x + d);
    return a = x * m, o = d * m, t.copy(n).addScaledVector(Ni, a).addScaledVector(Fi, o);
  }
  equals(e) {
    return e.a.equals(this.a) && e.b.equals(this.b) && e.c.equals(this.c);
  }
}
const xc = {
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
}, jn = { h: 0, s: 0, l: 0 }, Os = { h: 0, s: 0, l: 0 };
function qr(s, e, t) {
  return t < 0 && (t += 1), t > 1 && (t -= 1), t < 1 / 6 ? s + (e - s) * 6 * t : t < 1 / 2 ? e : t < 2 / 3 ? s + (e - s) * 6 * (2 / 3 - t) : s;
}
class De {
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
  setHex(e, t = wt) {
    return e = Math.floor(e), this.r = (e >> 16 & 255) / 255, this.g = (e >> 8 & 255) / 255, this.b = (e & 255) / 255, at.toWorkingColorSpace(this, t), this;
  }
  setRGB(e, t, n, i = at.workingColorSpace) {
    return this.r = e, this.g = t, this.b = n, at.toWorkingColorSpace(this, i), this;
  }
  setHSL(e, t, n, i = at.workingColorSpace) {
    if (e = Ta(e, 1), t = jt(t, 0, 1), n = jt(n, 0, 1), t === 0)
      this.r = this.g = this.b = n;
    else {
      const r = n <= 0.5 ? n * (1 + t) : n + t - n * t, a = 2 * n - r;
      this.r = qr(a, r, e + 1 / 3), this.g = qr(a, r, e), this.b = qr(a, r, e - 1 / 3);
    }
    return at.toWorkingColorSpace(this, i), this;
  }
  setStyle(e, t = wt) {
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
  setColorName(e, t = wt) {
    const n = xc[e.toLowerCase()];
    return n !== void 0 ? this.setHex(n, t) : console.warn("THREE.Color: Unknown color " + e), this;
  }
  clone() {
    return new this.constructor(this.r, this.g, this.b);
  }
  copy(e) {
    return this.r = e.r, this.g = e.g, this.b = e.b, this;
  }
  copySRGBToLinear(e) {
    return this.r = qi(e.r), this.g = qi(e.g), this.b = qi(e.b), this;
  }
  copyLinearToSRGB(e) {
    return this.r = Ir(e.r), this.g = Ir(e.g), this.b = Ir(e.b), this;
  }
  convertSRGBToLinear() {
    return this.copySRGBToLinear(this), this;
  }
  convertLinearToSRGB() {
    return this.copyLinearToSRGB(this), this;
  }
  getHex(e = wt) {
    return at.fromWorkingColorSpace(qt.copy(this), e), Math.round(jt(qt.r * 255, 0, 255)) * 65536 + Math.round(jt(qt.g * 255, 0, 255)) * 256 + Math.round(jt(qt.b * 255, 0, 255));
  }
  getHexString(e = wt) {
    return ("000000" + this.getHex(e).toString(16)).slice(-6);
  }
  getHSL(e, t = at.workingColorSpace) {
    at.fromWorkingColorSpace(qt.copy(this), t);
    const n = qt.r, i = qt.g, r = qt.b, a = Math.max(n, i, r), o = Math.min(n, i, r);
    let c, l;
    const u = (o + a) / 2;
    if (o === a)
      c = 0, l = 0;
    else {
      const h = a - o;
      switch (l = u <= 0.5 ? h / (a + o) : h / (2 - a - o), a) {
        case n:
          c = (i - r) / h + (i < r ? 6 : 0);
          break;
        case i:
          c = (r - n) / h + 2;
          break;
        case r:
          c = (n - i) / h + 4;
          break;
      }
      c /= 6;
    }
    return e.h = c, e.s = l, e.l = u, e;
  }
  getRGB(e, t = at.workingColorSpace) {
    return at.fromWorkingColorSpace(qt.copy(this), t), e.r = qt.r, e.g = qt.g, e.b = qt.b, e;
  }
  getStyle(e = wt) {
    at.fromWorkingColorSpace(qt.copy(this), e);
    const t = qt.r, n = qt.g, i = qt.b;
    return e !== wt ? `color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})` : `rgb(${Math.round(t * 255)},${Math.round(n * 255)},${Math.round(i * 255)})`;
  }
  offsetHSL(e, t, n) {
    return this.getHSL(jn), this.setHSL(jn.h + e, jn.s + t, jn.l + n);
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
    this.getHSL(jn), e.getHSL(Os);
    const n = vs(jn.h, Os.h, t), i = vs(jn.s, Os.s, t), r = vs(jn.l, Os.l, t);
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
const qt = /* @__PURE__ */ new De();
De.NAMES = xc;
let Xl = 0;
class rn extends xi {
  constructor() {
    super(), this.isMaterial = !0, Object.defineProperty(this, "id", { value: Xl++ }), this.uuid = Mn(), this.name = "", this.type = "Material", this.blending = 1, this.side = 0, this.vertexColors = !1, this.opacity = 1, this.transparent = !1, this.alphaHash = !1, this.blendSrc = 204, this.blendDst = 205, this.blendEquation = 100, this.blendSrcAlpha = null, this.blendDstAlpha = null, this.blendEquationAlpha = null, this.blendColor = new De(0, 0, 0), this.blendAlpha = 0, this.depthFunc = 3, this.depthTest = !0, this.depthWrite = !0, this.stencilWriteMask = 255, this.stencilFunc = 519, this.stencilRef = 0, this.stencilFuncMask = 255, this.stencilFail = 7680, this.stencilZFail = 7680, this.stencilZPass = 7680, this.stencilWrite = !1, this.clippingPlanes = null, this.clipIntersection = !1, this.clipShadows = !1, this.shadowSide = null, this.colorWrite = !0, this.precision = null, this.polygonOffset = !1, this.polygonOffsetFactor = 0, this.polygonOffsetUnits = 0, this.dithering = !1, this.alphaToCoverage = !1, this.premultipliedAlpha = !1, this.forceSinglePass = !1, this.visible = !0, this.toneMapped = !0, this.userData = {}, this.version = 0, this._alphaTest = 0;
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
class St extends rn {
  constructor(e) {
    super(), this.isMeshBasicMaterial = !0, this.type = "MeshBasicMaterial", this.color = new De(16777215), this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new Sn(), this.combine = 0, this.reflectivity = 1, this.refractionRatio = 0.98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.specularMap = e.specularMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapRotation.copy(e.envMapRotation), this.combine = e.combine, this.reflectivity = e.reflectivity, this.refractionRatio = e.refractionRatio, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.fog = e.fog, this;
  }
}
const Pt = /* @__PURE__ */ new N(), ks = /* @__PURE__ */ new qe();
class Jt {
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
        ks.fromBufferAttribute(this, t), ks.applyMatrix3(e), this.setXY(t, ks.x, ks.y);
    else if (this.itemSize === 3)
      for (let t = 0, n = this.count; t < n; t++)
        Pt.fromBufferAttribute(this, t), Pt.applyMatrix3(e), this.setXYZ(t, Pt.x, Pt.y, Pt.z);
    return this;
  }
  applyMatrix4(e) {
    for (let t = 0, n = this.count; t < n; t++)
      Pt.fromBufferAttribute(this, t), Pt.applyMatrix4(e), this.setXYZ(t, Pt.x, Pt.y, Pt.z);
    return this;
  }
  applyNormalMatrix(e) {
    for (let t = 0, n = this.count; t < n; t++)
      Pt.fromBufferAttribute(this, t), Pt.applyNormalMatrix(e), this.setXYZ(t, Pt.x, Pt.y, Pt.z);
    return this;
  }
  transformDirection(e) {
    for (let t = 0, n = this.count; t < n; t++)
      Pt.fromBufferAttribute(this, t), Pt.transformDirection(e), this.setXYZ(t, Pt.x, Pt.y, Pt.z);
    return this;
  }
  set(e, t = 0) {
    return this.array.set(e, t), this;
  }
  getComponent(e, t) {
    let n = this.array[e * this.itemSize + t];
    return this.normalized && (n = vn(n, this.array)), n;
  }
  setComponent(e, t, n) {
    return this.normalized && (n = gt(n, this.array)), this.array[e * this.itemSize + t] = n, this;
  }
  getX(e) {
    let t = this.array[e * this.itemSize];
    return this.normalized && (t = vn(t, this.array)), t;
  }
  setX(e, t) {
    return this.normalized && (t = gt(t, this.array)), this.array[e * this.itemSize] = t, this;
  }
  getY(e) {
    let t = this.array[e * this.itemSize + 1];
    return this.normalized && (t = vn(t, this.array)), t;
  }
  setY(e, t) {
    return this.normalized && (t = gt(t, this.array)), this.array[e * this.itemSize + 1] = t, this;
  }
  getZ(e) {
    let t = this.array[e * this.itemSize + 2];
    return this.normalized && (t = vn(t, this.array)), t;
  }
  setZ(e, t) {
    return this.normalized && (t = gt(t, this.array)), this.array[e * this.itemSize + 2] = t, this;
  }
  getW(e) {
    let t = this.array[e * this.itemSize + 3];
    return this.normalized && (t = vn(t, this.array)), t;
  }
  setW(e, t) {
    return this.normalized && (t = gt(t, this.array)), this.array[e * this.itemSize + 3] = t, this;
  }
  setXY(e, t, n) {
    return e *= this.itemSize, this.normalized && (t = gt(t, this.array), n = gt(n, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this;
  }
  setXYZ(e, t, n, i) {
    return e *= this.itemSize, this.normalized && (t = gt(t, this.array), n = gt(n, this.array), i = gt(i, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this.array[e + 2] = i, this;
  }
  setXYZW(e, t, n, i, r) {
    return e *= this.itemSize, this.normalized && (t = gt(t, this.array), n = gt(n, this.array), i = gt(i, this.array), r = gt(r, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this.array[e + 2] = i, this.array[e + 3] = r, this;
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
class vc extends Jt {
  constructor(e, t, n) {
    super(new Uint16Array(e), t, n);
  }
}
class Mc extends Jt {
  constructor(e, t, n) {
    super(new Uint32Array(e), t, n);
  }
}
class dt extends Jt {
  constructor(e, t, n) {
    super(new Float32Array(e), t, n);
  }
}
let ql = 0;
const ln = /* @__PURE__ */ new je(), jr = /* @__PURE__ */ new At(), Bi = /* @__PURE__ */ new N(), sn = /* @__PURE__ */ new En(), us = /* @__PURE__ */ new En(), kt = /* @__PURE__ */ new N();
class Rt extends xi {
  constructor() {
    super(), this.isBufferGeometry = !0, Object.defineProperty(this, "id", { value: ql++ }), this.uuid = Mn(), this.name = "", this.type = "BufferGeometry", this.index = null, this.attributes = {}, this.morphAttributes = {}, this.morphTargetsRelative = !1, this.groups = [], this.boundingBox = null, this.boundingSphere = null, this.drawRange = { start: 0, count: 1 / 0 }, this.userData = {};
  }
  getIndex() {
    return this.index;
  }
  setIndex(e) {
    return Array.isArray(e) ? this.index = new (mc(e) ? Mc : vc)(e, 1) : this.index = e, this;
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
      const r = new Ke().getNormalMatrix(e);
      n.applyNormalMatrix(r), n.needsUpdate = !0;
    }
    const i = this.attributes.tangent;
    return i !== void 0 && (i.transformDirection(e), i.needsUpdate = !0), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this;
  }
  applyQuaternion(e) {
    return ln.makeRotationFromQuaternion(e), this.applyMatrix4(ln), this;
  }
  rotateX(e) {
    return ln.makeRotationX(e), this.applyMatrix4(ln), this;
  }
  rotateY(e) {
    return ln.makeRotationY(e), this.applyMatrix4(ln), this;
  }
  rotateZ(e) {
    return ln.makeRotationZ(e), this.applyMatrix4(ln), this;
  }
  translate(e, t, n) {
    return ln.makeTranslation(e, t, n), this.applyMatrix4(ln), this;
  }
  scale(e, t, n) {
    return ln.makeScale(e, t, n), this.applyMatrix4(ln), this;
  }
  lookAt(e) {
    return jr.lookAt(e), jr.updateMatrix(), this.applyMatrix4(jr.matrix), this;
  }
  center() {
    return this.computeBoundingBox(), this.boundingBox.getCenter(Bi).negate(), this.translate(Bi.x, Bi.y, Bi.z), this;
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
    this.boundingBox === null && (this.boundingBox = new En());
    const e = this.attributes.position, t = this.morphAttributes.position;
    if (e && e.isGLBufferAttribute) {
      console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.", this), this.boundingBox.set(
        new N(-1 / 0, -1 / 0, -1 / 0),
        new N(1 / 0, 1 / 0, 1 / 0)
      );
      return;
    }
    if (e !== void 0) {
      if (this.boundingBox.setFromBufferAttribute(e), t)
        for (let n = 0, i = t.length; n < i; n++) {
          const r = t[n];
          sn.setFromBufferAttribute(r), this.morphTargetsRelative ? (kt.addVectors(this.boundingBox.min, sn.min), this.boundingBox.expandByPoint(kt), kt.addVectors(this.boundingBox.max, sn.max), this.boundingBox.expandByPoint(kt)) : (this.boundingBox.expandByPoint(sn.min), this.boundingBox.expandByPoint(sn.max));
        }
    } else
      this.boundingBox.makeEmpty();
    (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) && console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this);
  }
  computeBoundingSphere() {
    this.boundingSphere === null && (this.boundingSphere = new Cn());
    const e = this.attributes.position, t = this.morphAttributes.position;
    if (e && e.isGLBufferAttribute) {
      console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.", this), this.boundingSphere.set(new N(), 1 / 0);
      return;
    }
    if (e) {
      const n = this.boundingSphere.center;
      if (sn.setFromBufferAttribute(e), t)
        for (let r = 0, a = t.length; r < a; r++) {
          const o = t[r];
          us.setFromBufferAttribute(o), this.morphTargetsRelative ? (kt.addVectors(sn.min, us.min), sn.expandByPoint(kt), kt.addVectors(sn.max, us.max), sn.expandByPoint(kt)) : (sn.expandByPoint(us.min), sn.expandByPoint(us.max));
        }
      sn.getCenter(n);
      let i = 0;
      for (let r = 0, a = e.count; r < a; r++)
        kt.fromBufferAttribute(e, r), i = Math.max(i, n.distanceToSquared(kt));
      if (t)
        for (let r = 0, a = t.length; r < a; r++) {
          const o = t[r], c = this.morphTargetsRelative;
          for (let l = 0, u = o.count; l < u; l++)
            kt.fromBufferAttribute(o, l), c && (Bi.fromBufferAttribute(e, l), kt.add(Bi)), i = Math.max(i, n.distanceToSquared(kt));
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
    this.hasAttribute("tangent") === !1 && this.setAttribute("tangent", new Jt(new Float32Array(4 * n.count), 4));
    const a = this.getAttribute("tangent"), o = [], c = [];
    for (let z = 0; z < n.count; z++)
      o[z] = new N(), c[z] = new N();
    const l = new N(), u = new N(), h = new N(), d = new qe(), f = new qe(), g = new qe(), x = new N(), p = new N();
    function m(z, ee, v) {
      l.fromBufferAttribute(n, z), u.fromBufferAttribute(n, ee), h.fromBufferAttribute(n, v), d.fromBufferAttribute(r, z), f.fromBufferAttribute(r, ee), g.fromBufferAttribute(r, v), u.sub(l), h.sub(l), f.sub(d), g.sub(d);
      const A = 1 / (f.x * g.y - g.x * f.y);
      isFinite(A) && (x.copy(u).multiplyScalar(g.y).addScaledVector(h, -f.y).multiplyScalar(A), p.copy(h).multiplyScalar(f.x).addScaledVector(u, -g.x).multiplyScalar(A), o[z].add(x), o[ee].add(x), o[v].add(x), c[z].add(p), c[ee].add(p), c[v].add(p));
    }
    let T = this.groups;
    T.length === 0 && (T = [{
      start: 0,
      count: e.count
    }]);
    for (let z = 0, ee = T.length; z < ee; ++z) {
      const v = T[z], A = v.start, W = v.count;
      for (let q = A, Y = A + W; q < Y; q += 3)
        m(
          e.getX(q + 0),
          e.getX(q + 1),
          e.getX(q + 2)
        );
    }
    const S = new N(), E = new N(), F = new N(), P = new N();
    function L(z) {
      F.fromBufferAttribute(i, z), P.copy(F);
      const ee = o[z];
      S.copy(ee), S.sub(F.multiplyScalar(F.dot(ee))).normalize(), E.crossVectors(P, ee);
      const A = E.dot(c[z]) < 0 ? -1 : 1;
      a.setXYZW(z, S.x, S.y, S.z, A);
    }
    for (let z = 0, ee = T.length; z < ee; ++z) {
      const v = T[z], A = v.start, W = v.count;
      for (let q = A, Y = A + W; q < Y; q += 3)
        L(e.getX(q + 0)), L(e.getX(q + 1)), L(e.getX(q + 2));
    }
  }
  computeVertexNormals() {
    const e = this.index, t = this.getAttribute("position");
    if (t !== void 0) {
      let n = this.getAttribute("normal");
      if (n === void 0)
        n = new Jt(new Float32Array(t.count * 3), 3), this.setAttribute("normal", n);
      else
        for (let d = 0, f = n.count; d < f; d++)
          n.setXYZ(d, 0, 0, 0);
      const i = new N(), r = new N(), a = new N(), o = new N(), c = new N(), l = new N(), u = new N(), h = new N();
      if (e)
        for (let d = 0, f = e.count; d < f; d += 3) {
          const g = e.getX(d + 0), x = e.getX(d + 1), p = e.getX(d + 2);
          i.fromBufferAttribute(t, g), r.fromBufferAttribute(t, x), a.fromBufferAttribute(t, p), u.subVectors(a, r), h.subVectors(i, r), u.cross(h), o.fromBufferAttribute(n, g), c.fromBufferAttribute(n, x), l.fromBufferAttribute(n, p), o.add(u), c.add(u), l.add(u), n.setXYZ(g, o.x, o.y, o.z), n.setXYZ(x, c.x, c.y, c.z), n.setXYZ(p, l.x, l.y, l.z);
        }
      else
        for (let d = 0, f = t.count; d < f; d += 3)
          i.fromBufferAttribute(t, d + 0), r.fromBufferAttribute(t, d + 1), a.fromBufferAttribute(t, d + 2), u.subVectors(a, r), h.subVectors(i, r), u.cross(h), n.setXYZ(d + 0, u.x, u.y, u.z), n.setXYZ(d + 1, u.x, u.y, u.z), n.setXYZ(d + 2, u.x, u.y, u.z);
      this.normalizeNormals(), n.needsUpdate = !0;
    }
  }
  normalizeNormals() {
    const e = this.attributes.normal;
    for (let t = 0, n = e.count; t < n; t++)
      kt.fromBufferAttribute(e, t), kt.normalize(), e.setXYZ(t, kt.x, kt.y, kt.z);
  }
  toNonIndexed() {
    function e(o, c) {
      const l = o.array, u = o.itemSize, h = o.normalized, d = new l.constructor(c.length * u);
      let f = 0, g = 0;
      for (let x = 0, p = c.length; x < p; x++) {
        o.isInterleavedBufferAttribute ? f = c[x] * o.data.stride + o.offset : f = c[x] * u;
        for (let m = 0; m < u; m++)
          d[g++] = l[f++];
      }
      return new Jt(d, u, h);
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
      for (let u = 0, h = l.length; u < h; u++) {
        const d = l[u], f = e(d, n);
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
      const l = this.morphAttributes[c], u = [];
      for (let h = 0, d = l.length; h < d; h++) {
        const f = l[h];
        u.push(f.toJSON(e.data));
      }
      u.length > 0 && (i[c] = u, r = !0);
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
      const u = i[l];
      this.setAttribute(l, u.clone(t));
    }
    const r = e.morphAttributes;
    for (const l in r) {
      const u = [], h = r[l];
      for (let d = 0, f = h.length; d < f; d++)
        u.push(h[d].clone(t));
      this.morphAttributes[l] = u;
    }
    this.morphTargetsRelative = e.morphTargetsRelative;
    const a = e.groups;
    for (let l = 0, u = a.length; l < u; l++) {
      const h = a[l];
      this.addGroup(h.start, h.count, h.materialIndex);
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
const co = /* @__PURE__ */ new je(), oi = /* @__PURE__ */ new Ss(), zs = /* @__PURE__ */ new Cn(), lo = /* @__PURE__ */ new N(), Gs = /* @__PURE__ */ new N(), Hs = /* @__PURE__ */ new N(), Vs = /* @__PURE__ */ new N(), Yr = /* @__PURE__ */ new N(), Ws = /* @__PURE__ */ new N(), ho = /* @__PURE__ */ new N(), Xs = /* @__PURE__ */ new N();
class Le extends At {
  constructor(e = new Rt(), t = new St()) {
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
      Ws.set(0, 0, 0);
      for (let c = 0, l = r.length; c < l; c++) {
        const u = o[c], h = r[c];
        u !== 0 && (Yr.fromBufferAttribute(h, e), a ? Ws.addScaledVector(Yr, u) : Ws.addScaledVector(Yr.sub(t), u));
      }
      t.add(Ws);
    }
    return t;
  }
  raycast(e, t) {
    const n = this.geometry, i = this.material, r = this.matrixWorld;
    i !== void 0 && (n.boundingSphere === null && n.computeBoundingSphere(), zs.copy(n.boundingSphere), zs.applyMatrix4(r), oi.copy(e.ray).recast(e.near), !(zs.containsPoint(oi.origin) === !1 && (oi.intersectSphere(zs, lo) === null || oi.origin.distanceToSquared(lo) > (e.far - e.near) ** 2)) && (co.copy(r).invert(), oi.copy(e.ray).applyMatrix4(co), !(n.boundingBox !== null && oi.intersectsBox(n.boundingBox) === !1) && this._computeIntersections(e, t, oi)));
  }
  _computeIntersections(e, t, n) {
    let i;
    const r = this.geometry, a = this.material, o = r.index, c = r.attributes.position, l = r.attributes.uv, u = r.attributes.uv1, h = r.attributes.normal, d = r.groups, f = r.drawRange;
    if (o !== null)
      if (Array.isArray(a))
        for (let g = 0, x = d.length; g < x; g++) {
          const p = d[g], m = a[p.materialIndex], T = Math.max(p.start, f.start), S = Math.min(o.count, Math.min(p.start + p.count, f.start + f.count));
          for (let E = T, F = S; E < F; E += 3) {
            const P = o.getX(E), L = o.getX(E + 1), z = o.getX(E + 2);
            i = qs(this, m, e, n, l, u, h, P, L, z), i && (i.faceIndex = Math.floor(E / 3), i.face.materialIndex = p.materialIndex, t.push(i));
          }
        }
      else {
        const g = Math.max(0, f.start), x = Math.min(o.count, f.start + f.count);
        for (let p = g, m = x; p < m; p += 3) {
          const T = o.getX(p), S = o.getX(p + 1), E = o.getX(p + 2);
          i = qs(this, a, e, n, l, u, h, T, S, E), i && (i.faceIndex = Math.floor(p / 3), t.push(i));
        }
      }
    else if (c !== void 0)
      if (Array.isArray(a))
        for (let g = 0, x = d.length; g < x; g++) {
          const p = d[g], m = a[p.materialIndex], T = Math.max(p.start, f.start), S = Math.min(c.count, Math.min(p.start + p.count, f.start + f.count));
          for (let E = T, F = S; E < F; E += 3) {
            const P = E, L = E + 1, z = E + 2;
            i = qs(this, m, e, n, l, u, h, P, L, z), i && (i.faceIndex = Math.floor(E / 3), i.face.materialIndex = p.materialIndex, t.push(i));
          }
        }
      else {
        const g = Math.max(0, f.start), x = Math.min(c.count, f.start + f.count);
        for (let p = g, m = x; p < m; p += 3) {
          const T = p, S = p + 1, E = p + 2;
          i = qs(this, a, e, n, l, u, h, T, S, E), i && (i.faceIndex = Math.floor(p / 3), t.push(i));
        }
      }
  }
}
function jl(s, e, t, n, i, r, a, o) {
  let c;
  if (e.side === 1 ? c = n.intersectTriangle(a, r, i, !0, o) : c = n.intersectTriangle(i, r, a, e.side === 0, o), c === null) return null;
  Xs.copy(o), Xs.applyMatrix4(s.matrixWorld);
  const l = t.ray.origin.distanceTo(Xs);
  return l < t.near || l > t.far ? null : {
    distance: l,
    point: Xs.clone(),
    object: s
  };
}
function qs(s, e, t, n, i, r, a, o, c, l) {
  s.getVertexPosition(o, Gs), s.getVertexPosition(c, Hs), s.getVertexPosition(l, Vs);
  const u = jl(s, e, t, n, Gs, Hs, Vs, ho);
  if (u) {
    const h = new N();
    dn.getBarycoord(ho, Gs, Hs, Vs, h), i && (u.uv = dn.getInterpolatedAttribute(i, o, c, l, h, new qe())), r && (u.uv1 = dn.getInterpolatedAttribute(r, o, c, l, h, new qe())), a && (u.normal = dn.getInterpolatedAttribute(a, o, c, l, h, new N()), u.normal.dot(n.direction) > 0 && u.normal.multiplyScalar(-1));
    const d = {
      a: o,
      b: c,
      c: l,
      normal: new N(),
      materialIndex: 0
    };
    dn.getNormal(Gs, Hs, Vs, d.normal), u.face = d, u.barycoord = h;
  }
  return u;
}
class yt extends Rt {
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
    const c = [], l = [], u = [], h = [];
    let d = 0, f = 0;
    g("z", "y", "x", -1, -1, n, t, e, a, r, 0), g("z", "y", "x", 1, -1, n, t, -e, a, r, 1), g("x", "z", "y", 1, 1, e, n, t, i, a, 2), g("x", "z", "y", 1, -1, e, n, -t, i, a, 3), g("x", "y", "z", 1, -1, e, t, n, i, r, 4), g("x", "y", "z", -1, -1, e, t, -n, i, r, 5), this.setIndex(c), this.setAttribute("position", new dt(l, 3)), this.setAttribute("normal", new dt(u, 3)), this.setAttribute("uv", new dt(h, 2));
    function g(x, p, m, T, S, E, F, P, L, z, ee) {
      const v = E / L, A = F / z, W = E / 2, q = F / 2, Y = P / 2, se = L + 1, j = z + 1;
      let he = 0, X = 0;
      const xe = new N();
      for (let ve = 0; ve < j; ve++) {
        const we = ve * A - q;
        for (let Qe = 0; Qe < se; Qe++) {
          const ht = Qe * v - W;
          xe[x] = ht * T, xe[p] = we * S, xe[m] = Y, l.push(xe.x, xe.y, xe.z), xe[x] = 0, xe[p] = 0, xe[m] = P > 0 ? 1 : -1, u.push(xe.x, xe.y, xe.z), h.push(Qe / L), h.push(1 - ve / z), he += 1;
        }
      }
      for (let ve = 0; ve < z; ve++)
        for (let we = 0; we < L; we++) {
          const Qe = d + we + se * ve, ht = d + we + se * (ve + 1), Z = d + (we + 1) + se * (ve + 1), ce = d + (we + 1) + se * ve;
          c.push(Qe, ht, ce), c.push(ht, Z, ce), X += 6;
        }
      o.addGroup(f, X, ee), f += X, d += he;
    }
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new yt(e.width, e.height, e.depth, e.widthSegments, e.heightSegments, e.depthSegments);
  }
}
function $i(s) {
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
function $t(s) {
  const e = {};
  for (let t = 0; t < s.length; t++) {
    const n = $i(s[t]);
    for (const i in n)
      e[i] = n[i];
  }
  return e;
}
function Yl(s) {
  const e = [];
  for (let t = 0; t < s.length; t++)
    e.push(s[t].clone());
  return e;
}
function yc(s) {
  const e = s.getRenderTarget();
  return e === null ? s.outputColorSpace : e.isXRRenderTarget === !0 ? e.texture.colorSpace : at.workingColorSpace;
}
const Kl = { clone: $i, merge: $t };
var Zl = `void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`, $l = `void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;
class Qn extends rn {
  constructor(e) {
    super(), this.isShaderMaterial = !0, this.type = "ShaderMaterial", this.defines = {}, this.uniforms = {}, this.uniformsGroups = [], this.vertexShader = Zl, this.fragmentShader = $l, this.linewidth = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.fog = !1, this.lights = !1, this.clipping = !1, this.forceSinglePass = !0, this.extensions = {
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
    return super.copy(e), this.fragmentShader = e.fragmentShader, this.vertexShader = e.vertexShader, this.uniforms = $i(e.uniforms), this.uniformsGroups = Yl(e.uniformsGroups), this.defines = Object.assign({}, e.defines), this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.fog = e.fog, this.lights = e.lights, this.clipping = e.clipping, this.extensions = Object.assign({}, e.extensions), this.glslVersion = e.glslVersion, this;
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
class Sc extends At {
  constructor() {
    super(), this.isCamera = !0, this.type = "Camera", this.matrixWorldInverse = new je(), this.projectionMatrix = new je(), this.projectionMatrixInverse = new je(), this.coordinateSystem = 2e3;
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
const Yn = /* @__PURE__ */ new N(), uo = /* @__PURE__ */ new qe(), fo = /* @__PURE__ */ new qe();
class en extends Sc {
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
    this.fov = Zi * 2 * Math.atan(t), this.updateProjectionMatrix();
  }
  /**
   * Calculates the focal length from the current .fov and .filmGauge.
   */
  getFocalLength() {
    const e = Math.tan(Xi * 0.5 * this.fov);
    return 0.5 * this.getFilmHeight() / e;
  }
  getEffectiveFOV() {
    return Zi * 2 * Math.atan(
      Math.tan(Xi * 0.5 * this.fov) / this.zoom
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
    Yn.set(-1, -1, 0.5).applyMatrix4(this.projectionMatrixInverse), t.set(Yn.x, Yn.y).multiplyScalar(-e / Yn.z), Yn.set(1, 1, 0.5).applyMatrix4(this.projectionMatrixInverse), n.set(Yn.x, Yn.y).multiplyScalar(-e / Yn.z);
  }
  /**
   * Computes the width and height of the camera's viewable rectangle at a given distance along the viewing direction.
   * Copies the result into the target Vector2, where x is width and y is height.
   */
  getViewSize(e, t) {
    return this.getViewBounds(e, uo, fo), t.subVectors(fo, uo);
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
    let t = e * Math.tan(Xi * 0.5 * this.fov) / this.zoom, n = 2 * t, i = this.aspect * n, r = -0.5 * i;
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
const Oi = -90, ki = 1;
class Jl extends At {
  constructor(e, t, n) {
    super(), this.type = "CubeCamera", this.renderTarget = n, this.coordinateSystem = null, this.activeMipmapLevel = 0;
    const i = new en(Oi, ki, e, t);
    i.layers = this.layers, this.add(i);
    const r = new en(Oi, ki, e, t);
    r.layers = this.layers, this.add(r);
    const a = new en(Oi, ki, e, t);
    a.layers = this.layers, this.add(a);
    const o = new en(Oi, ki, e, t);
    o.layers = this.layers, this.add(o);
    const c = new en(Oi, ki, e, t);
    c.layers = this.layers, this.add(c);
    const l = new en(Oi, ki, e, t);
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
    const [r, a, o, c, l, u] = this.children, h = e.getRenderTarget(), d = e.getActiveCubeFace(), f = e.getActiveMipmapLevel(), g = e.xr.enabled;
    e.xr.enabled = !1;
    const x = n.texture.generateMipmaps;
    n.texture.generateMipmaps = !1, e.setRenderTarget(n, 0, i), e.render(t, r), e.setRenderTarget(n, 1, i), e.render(t, a), e.setRenderTarget(n, 2, i), e.render(t, o), e.setRenderTarget(n, 3, i), e.render(t, c), e.setRenderTarget(n, 4, i), e.render(t, l), n.texture.generateMipmaps = x, e.setRenderTarget(n, 5, i), e.render(t, u), e.setRenderTarget(h, d, f), e.xr.enabled = g, n.texture.needsPMREMUpdate = !0;
  }
}
class Ec extends Ft {
  constructor(e, t, n, i, r, a, o, c, l, u) {
    e = e !== void 0 ? e : [], t = t !== void 0 ? t : 301, super(e, t, n, i, r, a, o, c, l, u), this.isCubeTexture = !0, this.flipY = !1;
  }
  get images() {
    return this.image;
  }
  set images(e) {
    this.image = e;
  }
}
class Ql extends _i {
  constructor(e = 1, t = {}) {
    super(e, e, t), this.isWebGLCubeRenderTarget = !0;
    const n = { width: e, height: e, depth: 1 }, i = [n, n, n, n, n, n];
    this.texture = new Ec(i, t.mapping, t.wrapS, t.wrapT, t.magFilter, t.minFilter, t.format, t.type, t.anisotropy, t.colorSpace), this.texture.isRenderTargetTexture = !0, this.texture.generateMipmaps = t.generateMipmaps !== void 0 ? t.generateMipmaps : !1, this.texture.minFilter = t.minFilter !== void 0 ? t.minFilter : 1006;
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
    }, i = new yt(5, 5, 5), r = new Qn({
      name: "CubemapFromEquirect",
      uniforms: $i(n.uniforms),
      vertexShader: n.vertexShader,
      fragmentShader: n.fragmentShader,
      side: 1,
      blending: 0
    });
    r.uniforms.tEquirect.value = t;
    const a = new Le(i, r), o = t.minFilter;
    return t.minFilter === 1008 && (t.minFilter = 1006), new Jl(1, 10, this).update(e, a), t.minFilter = o, a.geometry.dispose(), a.material.dispose(), this;
  }
  clear(e, t, n, i) {
    const r = e.getRenderTarget();
    for (let a = 0; a < 6; a++)
      e.setRenderTarget(this, a), e.clear(t, n, i);
    e.setRenderTarget(r);
  }
}
const Kr = /* @__PURE__ */ new N(), eh = /* @__PURE__ */ new N(), th = /* @__PURE__ */ new Ke();
class Zn {
  constructor(e = new N(1, 0, 0), t = 0) {
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
    const i = Kr.subVectors(n, t).cross(eh.subVectors(e, t)).normalize();
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
    const n = e.delta(Kr), i = this.normal.dot(n);
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
    const n = t || th.getNormalMatrix(e), i = this.coplanarPoint(Kr).applyMatrix4(e), r = this.normal.applyMatrix3(n).normalize();
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
const ci = /* @__PURE__ */ new Cn(), js = /* @__PURE__ */ new N();
class ba {
  constructor(e = new Zn(), t = new Zn(), n = new Zn(), i = new Zn(), r = new Zn(), a = new Zn()) {
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
    const n = this.planes, i = e.elements, r = i[0], a = i[1], o = i[2], c = i[3], l = i[4], u = i[5], h = i[6], d = i[7], f = i[8], g = i[9], x = i[10], p = i[11], m = i[12], T = i[13], S = i[14], E = i[15];
    if (n[0].setComponents(c - r, d - l, p - f, E - m).normalize(), n[1].setComponents(c + r, d + l, p + f, E + m).normalize(), n[2].setComponents(c + a, d + u, p + g, E + T).normalize(), n[3].setComponents(c - a, d - u, p - g, E - T).normalize(), n[4].setComponents(c - o, d - h, p - x, E - S).normalize(), t === 2e3)
      n[5].setComponents(c + o, d + h, p + x, E + S).normalize();
    else if (t === 2001)
      n[5].setComponents(o, h, x, S).normalize();
    else
      throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: " + t);
    return this;
  }
  intersectsObject(e) {
    if (e.boundingSphere !== void 0)
      e.boundingSphere === null && e.computeBoundingSphere(), ci.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);
    else {
      const t = e.geometry;
      t.boundingSphere === null && t.computeBoundingSphere(), ci.copy(t.boundingSphere).applyMatrix4(e.matrixWorld);
    }
    return this.intersectsSphere(ci);
  }
  intersectsSprite(e) {
    return ci.center.set(0, 0, 0), ci.radius = 0.7071067811865476, ci.applyMatrix4(e.matrixWorld), this.intersectsSphere(ci);
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
      if (js.x = i.normal.x > 0 ? e.max.x : e.min.x, js.y = i.normal.y > 0 ? e.max.y : e.min.y, js.z = i.normal.z > 0 ? e.max.z : e.min.z, i.distanceToPoint(js) < 0)
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
function Tc() {
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
function nh(s) {
  const e = /* @__PURE__ */ new WeakMap();
  function t(o, c) {
    const l = o.array, u = o.usage, h = l.byteLength, d = s.createBuffer();
    s.bindBuffer(c, d), s.bufferData(c, l, u), o.onUploadCallback();
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
      size: h
    };
  }
  function n(o, c, l) {
    const u = c.array, h = c.updateRanges;
    if (s.bindBuffer(l, o), h.length === 0)
      s.bufferSubData(l, 0, u);
    else {
      h.sort((f, g) => f.start - g.start);
      let d = 0;
      for (let f = 1; f < h.length; f++) {
        const g = h[d], x = h[f];
        x.start <= g.start + g.count + 1 ? g.count = Math.max(
          g.count,
          x.start + x.count - g.start
        ) : (++d, h[d] = x);
      }
      h.length = d + 1;
      for (let f = 0, g = h.length; f < g; f++) {
        const x = h[f];
        s.bufferSubData(
          l,
          x.start * u.BYTES_PER_ELEMENT,
          u,
          x.start,
          x.count
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
      const u = e.get(o);
      (!u || u.version < o.version) && e.set(o, {
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
class ei extends Rt {
  constructor(e = 1, t = 1, n = 1, i = 1) {
    super(), this.type = "PlaneGeometry", this.parameters = {
      width: e,
      height: t,
      widthSegments: n,
      heightSegments: i
    };
    const r = e / 2, a = t / 2, o = Math.floor(n), c = Math.floor(i), l = o + 1, u = c + 1, h = e / o, d = t / c, f = [], g = [], x = [], p = [];
    for (let m = 0; m < u; m++) {
      const T = m * d - a;
      for (let S = 0; S < l; S++) {
        const E = S * h - r;
        g.push(E, -T, 0), x.push(0, 0, 1), p.push(S / o), p.push(1 - m / c);
      }
    }
    for (let m = 0; m < c; m++)
      for (let T = 0; T < o; T++) {
        const S = T + l * m, E = T + l * (m + 1), F = T + 1 + l * (m + 1), P = T + 1 + l * m;
        f.push(S, E, P), f.push(E, F, P);
      }
    this.setIndex(f), this.setAttribute("position", new dt(g, 3)), this.setAttribute("normal", new dt(x, 3)), this.setAttribute("uv", new dt(p, 2));
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new ei(e.width, e.height, e.widthSegments, e.heightSegments);
  }
}
var ih = `#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`, sh = `#ifdef USE_ALPHAHASH
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
#endif`, rh = `#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`, ah = `#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`, oh = `#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`, ch = `#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`, lh = `#ifdef USE_AOMAP
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
#endif`, hh = `#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`, uh = `#ifdef USE_BATCHING
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
#endif`, dh = `#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`, fh = `vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`, ph = `vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`, mh = `float G_BlinnPhong_Implicit( ) {
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
} // validated`, gh = `#ifdef USE_IRIDESCENCE
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
#endif`, _h = `#ifdef USE_BUMPMAP
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
#endif`, xh = `#if NUM_CLIPPING_PLANES > 0
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
#endif`, vh = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`, Mh = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`, yh = `#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`, Sh = `#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`, Eh = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`, Th = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`, Ah = `#if defined( USE_COLOR_ALPHA )
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
#endif`, bh = `#define PI 3.141592653589793
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
} // validated`, wh = `#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`, Rh = `vec3 transformedNormal = objectNormal;
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
#endif`, Ch = `#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`, Ih = `#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`, Ph = `#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`, Lh = `#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`, Dh = "gl_FragColor = linearToOutputTexel( gl_FragColor );", Uh = `
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
}`, Nh = `#ifdef USE_ENVMAP
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
#endif`, Fh = `#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`, Bh = `#ifdef USE_ENVMAP
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
#endif`, Oh = `#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`, kh = `#ifdef USE_ENVMAP
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
#endif`, zh = `#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`, Gh = `#ifdef USE_FOG
	varying float vFogDepth;
#endif`, Hh = `#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`, Vh = `#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`, Wh = `#ifdef USE_GRADIENTMAP
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
}`, Xh = `#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`, qh = `LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`, jh = `varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`, Yh = `uniform bool receiveShadow;
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
#endif`, Kh = `#ifdef USE_ENVMAP
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
#endif`, Zh = `ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`, $h = `varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`, Jh = `BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`, Qh = `varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`, eu = `PhysicalMaterial material;
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
#endif`, tu = `struct PhysicalMaterial {
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
}`, nu = `
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
#endif`, iu = `#if defined( RE_IndirectDiffuse )
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
#endif`, su = `#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`, ru = `#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`, au = `#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`, ou = `#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`, cu = `#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`, lu = `#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`, hu = `#ifdef USE_MAP
	uniform sampler2D map;
#endif`, uu = `#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`, du = `#if defined( USE_POINTS_UV )
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
#endif`, fu = `float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`, pu = `#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`, mu = `#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`, gu = `#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`, _u = `#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`, xu = `#ifdef USE_MORPHTARGETS
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
#endif`, vu = `#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`, Mu = `float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`, yu = `#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`, Su = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`, Eu = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`, Tu = `#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`, Au = `#ifdef USE_NORMALMAP
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
#endif`, bu = `#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`, wu = `#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`, Ru = `#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`, Cu = `#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`, Iu = `#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`, Pu = `vec3 packNormalToRGB( const in vec3 normal ) {
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
}`, Lu = `#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`, Du = `vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`, Uu = `#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`, Nu = `#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`, Fu = `float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`, Bu = `#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`, Ou = `#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`, ku = `#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`, zu = `#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`, Gu = `float getShadowMask() {
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
}`, Hu = `#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`, Vu = `#ifdef USE_SKINNING
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
#endif`, Wu = `#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`, Xu = `#ifdef USE_SKINNING
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
#endif`, qu = `float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`, ju = `#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`, Yu = `#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`, Ku = `#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`, Zu = `#ifdef USE_TRANSMISSION
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
#endif`, $u = `#ifdef USE_TRANSMISSION
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
#endif`, Ju = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`, Qu = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`, ed = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`, td = `#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;
const nd = `varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`, id = `uniform sampler2D t2D;
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
}`, sd = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`, rd = `#ifdef ENVMAP_TYPE_CUBE
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
}`, ad = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`, od = `uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, cd = `#include <common>
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
}`, ld = `#if DEPTH_PACKING == 3200
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
}`, hd = `#define DISTANCE
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
}`, ud = `#define DISTANCE
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
}`, dd = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`, fd = `uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, pd = `uniform float scale;
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
}`, md = `uniform vec3 diffuse;
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
}`, gd = `#include <common>
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
}`, _d = `uniform vec3 diffuse;
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
}`, xd = `#define LAMBERT
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
}`, vd = `#define LAMBERT
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
}`, Md = `#define MATCAP
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
}`, yd = `#define MATCAP
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
}`, Sd = `#define NORMAL
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
}`, Ed = `#define NORMAL
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
}`, Td = `#define PHONG
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
}`, Ad = `#define PHONG
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
}`, bd = `#define STANDARD
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
}`, wd = `#define STANDARD
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
}`, Rd = `#define TOON
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
}`, Cd = `#define TOON
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
}`, Id = `uniform float size;
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
}`, Pd = `uniform vec3 diffuse;
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
}`, Ld = `#include <common>
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
}`, Dd = `uniform vec3 color;
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
}`, Ud = `uniform float rotation;
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
}`, Nd = `uniform vec3 diffuse;
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
}`, Ye = {
  alphahash_fragment: ih,
  alphahash_pars_fragment: sh,
  alphamap_fragment: rh,
  alphamap_pars_fragment: ah,
  alphatest_fragment: oh,
  alphatest_pars_fragment: ch,
  aomap_fragment: lh,
  aomap_pars_fragment: hh,
  batching_pars_vertex: uh,
  batching_vertex: dh,
  begin_vertex: fh,
  beginnormal_vertex: ph,
  bsdfs: mh,
  iridescence_fragment: gh,
  bumpmap_pars_fragment: _h,
  clipping_planes_fragment: xh,
  clipping_planes_pars_fragment: vh,
  clipping_planes_pars_vertex: Mh,
  clipping_planes_vertex: yh,
  color_fragment: Sh,
  color_pars_fragment: Eh,
  color_pars_vertex: Th,
  color_vertex: Ah,
  common: bh,
  cube_uv_reflection_fragment: wh,
  defaultnormal_vertex: Rh,
  displacementmap_pars_vertex: Ch,
  displacementmap_vertex: Ih,
  emissivemap_fragment: Ph,
  emissivemap_pars_fragment: Lh,
  colorspace_fragment: Dh,
  colorspace_pars_fragment: Uh,
  envmap_fragment: Nh,
  envmap_common_pars_fragment: Fh,
  envmap_pars_fragment: Bh,
  envmap_pars_vertex: Oh,
  envmap_physical_pars_fragment: Kh,
  envmap_vertex: kh,
  fog_vertex: zh,
  fog_pars_vertex: Gh,
  fog_fragment: Hh,
  fog_pars_fragment: Vh,
  gradientmap_pars_fragment: Wh,
  lightmap_pars_fragment: Xh,
  lights_lambert_fragment: qh,
  lights_lambert_pars_fragment: jh,
  lights_pars_begin: Yh,
  lights_toon_fragment: Zh,
  lights_toon_pars_fragment: $h,
  lights_phong_fragment: Jh,
  lights_phong_pars_fragment: Qh,
  lights_physical_fragment: eu,
  lights_physical_pars_fragment: tu,
  lights_fragment_begin: nu,
  lights_fragment_maps: iu,
  lights_fragment_end: su,
  logdepthbuf_fragment: ru,
  logdepthbuf_pars_fragment: au,
  logdepthbuf_pars_vertex: ou,
  logdepthbuf_vertex: cu,
  map_fragment: lu,
  map_pars_fragment: hu,
  map_particle_fragment: uu,
  map_particle_pars_fragment: du,
  metalnessmap_fragment: fu,
  metalnessmap_pars_fragment: pu,
  morphinstance_vertex: mu,
  morphcolor_vertex: gu,
  morphnormal_vertex: _u,
  morphtarget_pars_vertex: xu,
  morphtarget_vertex: vu,
  normal_fragment_begin: Mu,
  normal_fragment_maps: yu,
  normal_pars_fragment: Su,
  normal_pars_vertex: Eu,
  normal_vertex: Tu,
  normalmap_pars_fragment: Au,
  clearcoat_normal_fragment_begin: bu,
  clearcoat_normal_fragment_maps: wu,
  clearcoat_pars_fragment: Ru,
  iridescence_pars_fragment: Cu,
  opaque_fragment: Iu,
  packing: Pu,
  premultiplied_alpha_fragment: Lu,
  project_vertex: Du,
  dithering_fragment: Uu,
  dithering_pars_fragment: Nu,
  roughnessmap_fragment: Fu,
  roughnessmap_pars_fragment: Bu,
  shadowmap_pars_fragment: Ou,
  shadowmap_pars_vertex: ku,
  shadowmap_vertex: zu,
  shadowmask_pars_fragment: Gu,
  skinbase_vertex: Hu,
  skinning_pars_vertex: Vu,
  skinning_vertex: Wu,
  skinnormal_vertex: Xu,
  specularmap_fragment: qu,
  specularmap_pars_fragment: ju,
  tonemapping_fragment: Yu,
  tonemapping_pars_fragment: Ku,
  transmission_fragment: Zu,
  transmission_pars_fragment: $u,
  uv_pars_fragment: Ju,
  uv_pars_vertex: Qu,
  uv_vertex: ed,
  worldpos_vertex: td,
  background_vert: nd,
  background_frag: id,
  backgroundCube_vert: sd,
  backgroundCube_frag: rd,
  cube_vert: ad,
  cube_frag: od,
  depth_vert: cd,
  depth_frag: ld,
  distanceRGBA_vert: hd,
  distanceRGBA_frag: ud,
  equirect_vert: dd,
  equirect_frag: fd,
  linedashed_vert: pd,
  linedashed_frag: md,
  meshbasic_vert: gd,
  meshbasic_frag: _d,
  meshlambert_vert: xd,
  meshlambert_frag: vd,
  meshmatcap_vert: Md,
  meshmatcap_frag: yd,
  meshnormal_vert: Sd,
  meshnormal_frag: Ed,
  meshphong_vert: Td,
  meshphong_frag: Ad,
  meshphysical_vert: bd,
  meshphysical_frag: wd,
  meshtoon_vert: Rd,
  meshtoon_frag: Cd,
  points_vert: Id,
  points_frag: Pd,
  shadow_vert: Ld,
  shadow_frag: Dd,
  sprite_vert: Ud,
  sprite_frag: Nd
}, me = {
  common: {
    diffuse: { value: /* @__PURE__ */ new De(16777215) },
    opacity: { value: 1 },
    map: { value: null },
    mapTransform: { value: /* @__PURE__ */ new Ke() },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new Ke() },
    alphaTest: { value: 0 }
  },
  specularmap: {
    specularMap: { value: null },
    specularMapTransform: { value: /* @__PURE__ */ new Ke() }
  },
  envmap: {
    envMap: { value: null },
    envMapRotation: { value: /* @__PURE__ */ new Ke() },
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
    aoMapTransform: { value: /* @__PURE__ */ new Ke() }
  },
  lightmap: {
    lightMap: { value: null },
    lightMapIntensity: { value: 1 },
    lightMapTransform: { value: /* @__PURE__ */ new Ke() }
  },
  bumpmap: {
    bumpMap: { value: null },
    bumpMapTransform: { value: /* @__PURE__ */ new Ke() },
    bumpScale: { value: 1 }
  },
  normalmap: {
    normalMap: { value: null },
    normalMapTransform: { value: /* @__PURE__ */ new Ke() },
    normalScale: { value: /* @__PURE__ */ new qe(1, 1) }
  },
  displacementmap: {
    displacementMap: { value: null },
    displacementMapTransform: { value: /* @__PURE__ */ new Ke() },
    displacementScale: { value: 1 },
    displacementBias: { value: 0 }
  },
  emissivemap: {
    emissiveMap: { value: null },
    emissiveMapTransform: { value: /* @__PURE__ */ new Ke() }
  },
  metalnessmap: {
    metalnessMap: { value: null },
    metalnessMapTransform: { value: /* @__PURE__ */ new Ke() }
  },
  roughnessmap: {
    roughnessMap: { value: null },
    roughnessMapTransform: { value: /* @__PURE__ */ new Ke() }
  },
  gradientmap: {
    gradientMap: { value: null }
  },
  fog: {
    fogDensity: { value: 25e-5 },
    fogNear: { value: 1 },
    fogFar: { value: 2e3 },
    fogColor: { value: /* @__PURE__ */ new De(16777215) }
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
    diffuse: { value: /* @__PURE__ */ new De(16777215) },
    opacity: { value: 1 },
    size: { value: 1 },
    scale: { value: 1 },
    map: { value: null },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new Ke() },
    alphaTest: { value: 0 },
    uvTransform: { value: /* @__PURE__ */ new Ke() }
  },
  sprite: {
    diffuse: { value: /* @__PURE__ */ new De(16777215) },
    opacity: { value: 1 },
    center: { value: /* @__PURE__ */ new qe(0.5, 0.5) },
    rotation: { value: 0 },
    map: { value: null },
    mapTransform: { value: /* @__PURE__ */ new Ke() },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new Ke() },
    alphaTest: { value: 0 }
  }
}, Rn = {
  basic: {
    uniforms: /* @__PURE__ */ $t([
      me.common,
      me.specularmap,
      me.envmap,
      me.aomap,
      me.lightmap,
      me.fog
    ]),
    vertexShader: Ye.meshbasic_vert,
    fragmentShader: Ye.meshbasic_frag
  },
  lambert: {
    uniforms: /* @__PURE__ */ $t([
      me.common,
      me.specularmap,
      me.envmap,
      me.aomap,
      me.lightmap,
      me.emissivemap,
      me.bumpmap,
      me.normalmap,
      me.displacementmap,
      me.fog,
      me.lights,
      {
        emissive: { value: /* @__PURE__ */ new De(0) }
      }
    ]),
    vertexShader: Ye.meshlambert_vert,
    fragmentShader: Ye.meshlambert_frag
  },
  phong: {
    uniforms: /* @__PURE__ */ $t([
      me.common,
      me.specularmap,
      me.envmap,
      me.aomap,
      me.lightmap,
      me.emissivemap,
      me.bumpmap,
      me.normalmap,
      me.displacementmap,
      me.fog,
      me.lights,
      {
        emissive: { value: /* @__PURE__ */ new De(0) },
        specular: { value: /* @__PURE__ */ new De(1118481) },
        shininess: { value: 30 }
      }
    ]),
    vertexShader: Ye.meshphong_vert,
    fragmentShader: Ye.meshphong_frag
  },
  standard: {
    uniforms: /* @__PURE__ */ $t([
      me.common,
      me.envmap,
      me.aomap,
      me.lightmap,
      me.emissivemap,
      me.bumpmap,
      me.normalmap,
      me.displacementmap,
      me.roughnessmap,
      me.metalnessmap,
      me.fog,
      me.lights,
      {
        emissive: { value: /* @__PURE__ */ new De(0) },
        roughness: { value: 1 },
        metalness: { value: 0 },
        envMapIntensity: { value: 1 }
      }
    ]),
    vertexShader: Ye.meshphysical_vert,
    fragmentShader: Ye.meshphysical_frag
  },
  toon: {
    uniforms: /* @__PURE__ */ $t([
      me.common,
      me.aomap,
      me.lightmap,
      me.emissivemap,
      me.bumpmap,
      me.normalmap,
      me.displacementmap,
      me.gradientmap,
      me.fog,
      me.lights,
      {
        emissive: { value: /* @__PURE__ */ new De(0) }
      }
    ]),
    vertexShader: Ye.meshtoon_vert,
    fragmentShader: Ye.meshtoon_frag
  },
  matcap: {
    uniforms: /* @__PURE__ */ $t([
      me.common,
      me.bumpmap,
      me.normalmap,
      me.displacementmap,
      me.fog,
      {
        matcap: { value: null }
      }
    ]),
    vertexShader: Ye.meshmatcap_vert,
    fragmentShader: Ye.meshmatcap_frag
  },
  points: {
    uniforms: /* @__PURE__ */ $t([
      me.points,
      me.fog
    ]),
    vertexShader: Ye.points_vert,
    fragmentShader: Ye.points_frag
  },
  dashed: {
    uniforms: /* @__PURE__ */ $t([
      me.common,
      me.fog,
      {
        scale: { value: 1 },
        dashSize: { value: 1 },
        totalSize: { value: 2 }
      }
    ]),
    vertexShader: Ye.linedashed_vert,
    fragmentShader: Ye.linedashed_frag
  },
  depth: {
    uniforms: /* @__PURE__ */ $t([
      me.common,
      me.displacementmap
    ]),
    vertexShader: Ye.depth_vert,
    fragmentShader: Ye.depth_frag
  },
  normal: {
    uniforms: /* @__PURE__ */ $t([
      me.common,
      me.bumpmap,
      me.normalmap,
      me.displacementmap,
      {
        opacity: { value: 1 }
      }
    ]),
    vertexShader: Ye.meshnormal_vert,
    fragmentShader: Ye.meshnormal_frag
  },
  sprite: {
    uniforms: /* @__PURE__ */ $t([
      me.sprite,
      me.fog
    ]),
    vertexShader: Ye.sprite_vert,
    fragmentShader: Ye.sprite_frag
  },
  background: {
    uniforms: {
      uvTransform: { value: /* @__PURE__ */ new Ke() },
      t2D: { value: null },
      backgroundIntensity: { value: 1 }
    },
    vertexShader: Ye.background_vert,
    fragmentShader: Ye.background_frag
  },
  backgroundCube: {
    uniforms: {
      envMap: { value: null },
      flipEnvMap: { value: -1 },
      backgroundBlurriness: { value: 0 },
      backgroundIntensity: { value: 1 },
      backgroundRotation: { value: /* @__PURE__ */ new Ke() }
    },
    vertexShader: Ye.backgroundCube_vert,
    fragmentShader: Ye.backgroundCube_frag
  },
  cube: {
    uniforms: {
      tCube: { value: null },
      tFlip: { value: -1 },
      opacity: { value: 1 }
    },
    vertexShader: Ye.cube_vert,
    fragmentShader: Ye.cube_frag
  },
  equirect: {
    uniforms: {
      tEquirect: { value: null }
    },
    vertexShader: Ye.equirect_vert,
    fragmentShader: Ye.equirect_frag
  },
  distanceRGBA: {
    uniforms: /* @__PURE__ */ $t([
      me.common,
      me.displacementmap,
      {
        referencePosition: { value: /* @__PURE__ */ new N() },
        nearDistance: { value: 1 },
        farDistance: { value: 1e3 }
      }
    ]),
    vertexShader: Ye.distanceRGBA_vert,
    fragmentShader: Ye.distanceRGBA_frag
  },
  shadow: {
    uniforms: /* @__PURE__ */ $t([
      me.lights,
      me.fog,
      {
        color: { value: /* @__PURE__ */ new De(0) },
        opacity: { value: 1 }
      }
    ]),
    vertexShader: Ye.shadow_vert,
    fragmentShader: Ye.shadow_frag
  }
};
Rn.physical = {
  uniforms: /* @__PURE__ */ $t([
    Rn.standard.uniforms,
    {
      clearcoat: { value: 0 },
      clearcoatMap: { value: null },
      clearcoatMapTransform: { value: /* @__PURE__ */ new Ke() },
      clearcoatNormalMap: { value: null },
      clearcoatNormalMapTransform: { value: /* @__PURE__ */ new Ke() },
      clearcoatNormalScale: { value: /* @__PURE__ */ new qe(1, 1) },
      clearcoatRoughness: { value: 0 },
      clearcoatRoughnessMap: { value: null },
      clearcoatRoughnessMapTransform: { value: /* @__PURE__ */ new Ke() },
      dispersion: { value: 0 },
      iridescence: { value: 0 },
      iridescenceMap: { value: null },
      iridescenceMapTransform: { value: /* @__PURE__ */ new Ke() },
      iridescenceIOR: { value: 1.3 },
      iridescenceThicknessMinimum: { value: 100 },
      iridescenceThicknessMaximum: { value: 400 },
      iridescenceThicknessMap: { value: null },
      iridescenceThicknessMapTransform: { value: /* @__PURE__ */ new Ke() },
      sheen: { value: 0 },
      sheenColor: { value: /* @__PURE__ */ new De(0) },
      sheenColorMap: { value: null },
      sheenColorMapTransform: { value: /* @__PURE__ */ new Ke() },
      sheenRoughness: { value: 1 },
      sheenRoughnessMap: { value: null },
      sheenRoughnessMapTransform: { value: /* @__PURE__ */ new Ke() },
      transmission: { value: 0 },
      transmissionMap: { value: null },
      transmissionMapTransform: { value: /* @__PURE__ */ new Ke() },
      transmissionSamplerSize: { value: /* @__PURE__ */ new qe() },
      transmissionSamplerMap: { value: null },
      thickness: { value: 0 },
      thicknessMap: { value: null },
      thicknessMapTransform: { value: /* @__PURE__ */ new Ke() },
      attenuationDistance: { value: 0 },
      attenuationColor: { value: /* @__PURE__ */ new De(0) },
      specularColor: { value: /* @__PURE__ */ new De(1, 1, 1) },
      specularColorMap: { value: null },
      specularColorMapTransform: { value: /* @__PURE__ */ new Ke() },
      specularIntensity: { value: 1 },
      specularIntensityMap: { value: null },
      specularIntensityMapTransform: { value: /* @__PURE__ */ new Ke() },
      anisotropyVector: { value: /* @__PURE__ */ new qe() },
      anisotropyMap: { value: null },
      anisotropyMapTransform: { value: /* @__PURE__ */ new Ke() }
    }
  ]),
  vertexShader: Ye.meshphysical_vert,
  fragmentShader: Ye.meshphysical_frag
};
const Ys = { r: 0, b: 0, g: 0 }, li = /* @__PURE__ */ new Sn(), Fd = /* @__PURE__ */ new je();
function Bd(s, e, t, n, i, r, a) {
  const o = new De(0);
  let c = r === !0 ? 0 : 1, l, u, h = null, d = 0, f = null;
  function g(T) {
    let S = T.isScene === !0 ? T.background : null;
    return S && S.isTexture && (S = (T.backgroundBlurriness > 0 ? t : e).get(S)), S;
  }
  function x(T) {
    let S = !1;
    const E = g(T);
    E === null ? m(o, c) : E && E.isColor && (m(E, 1), S = !0);
    const F = s.xr.getEnvironmentBlendMode();
    F === "additive" ? n.buffers.color.setClear(0, 0, 0, 1, a) : F === "alpha-blend" && n.buffers.color.setClear(0, 0, 0, 0, a), (s.autoClear || S) && (n.buffers.depth.setTest(!0), n.buffers.depth.setMask(!0), n.buffers.color.setMask(!0), s.clear(s.autoClearColor, s.autoClearDepth, s.autoClearStencil));
  }
  function p(T, S) {
    const E = g(S);
    E && (E.isCubeTexture || E.mapping === 306) ? (u === void 0 && (u = new Le(
      new yt(1, 1, 1),
      new Qn({
        name: "BackgroundCubeMaterial",
        uniforms: $i(Rn.backgroundCube.uniforms),
        vertexShader: Rn.backgroundCube.vertexShader,
        fragmentShader: Rn.backgroundCube.fragmentShader,
        side: 1,
        depthTest: !1,
        depthWrite: !1,
        fog: !1
      })
    ), u.geometry.deleteAttribute("normal"), u.geometry.deleteAttribute("uv"), u.onBeforeRender = function(F, P, L) {
      this.matrixWorld.copyPosition(L.matrixWorld);
    }, Object.defineProperty(u.material, "envMap", {
      get: function() {
        return this.uniforms.envMap.value;
      }
    }), i.update(u)), li.copy(S.backgroundRotation), li.x *= -1, li.y *= -1, li.z *= -1, E.isCubeTexture && E.isRenderTargetTexture === !1 && (li.y *= -1, li.z *= -1), u.material.uniforms.envMap.value = E, u.material.uniforms.flipEnvMap.value = E.isCubeTexture && E.isRenderTargetTexture === !1 ? -1 : 1, u.material.uniforms.backgroundBlurriness.value = S.backgroundBlurriness, u.material.uniforms.backgroundIntensity.value = S.backgroundIntensity, u.material.uniforms.backgroundRotation.value.setFromMatrix4(Fd.makeRotationFromEuler(li)), u.material.toneMapped = at.getTransfer(E.colorSpace) !== Et, (h !== E || d !== E.version || f !== s.toneMapping) && (u.material.needsUpdate = !0, h = E, d = E.version, f = s.toneMapping), u.layers.enableAll(), T.unshift(u, u.geometry, u.material, 0, 0, null)) : E && E.isTexture && (l === void 0 && (l = new Le(
      new ei(2, 2),
      new Qn({
        name: "BackgroundMaterial",
        uniforms: $i(Rn.background.uniforms),
        vertexShader: Rn.background.vertexShader,
        fragmentShader: Rn.background.fragmentShader,
        side: 0,
        depthTest: !1,
        depthWrite: !1,
        fog: !1
      })
    ), l.geometry.deleteAttribute("normal"), Object.defineProperty(l.material, "map", {
      get: function() {
        return this.uniforms.t2D.value;
      }
    }), i.update(l)), l.material.uniforms.t2D.value = E, l.material.uniforms.backgroundIntensity.value = S.backgroundIntensity, l.material.toneMapped = at.getTransfer(E.colorSpace) !== Et, E.matrixAutoUpdate === !0 && E.updateMatrix(), l.material.uniforms.uvTransform.value.copy(E.matrix), (h !== E || d !== E.version || f !== s.toneMapping) && (l.material.needsUpdate = !0, h = E, d = E.version, f = s.toneMapping), l.layers.enableAll(), T.unshift(l, l.geometry, l.material, 0, 0, null));
  }
  function m(T, S) {
    T.getRGB(Ys, yc(s)), n.buffers.color.setClear(Ys.r, Ys.g, Ys.b, S, a);
  }
  return {
    getClearColor: function() {
      return o;
    },
    setClearColor: function(T, S = 1) {
      o.set(T), c = S, m(o, c);
    },
    getClearAlpha: function() {
      return c;
    },
    setClearAlpha: function(T) {
      c = T, m(o, c);
    },
    render: x,
    addToRenderList: p
  };
}
function Od(s, e) {
  const t = s.getParameter(s.MAX_VERTEX_ATTRIBS), n = {}, i = d(null);
  let r = i, a = !1;
  function o(v, A, W, q, Y) {
    let se = !1;
    const j = h(q, W, A);
    r !== j && (r = j, l(r.object)), se = f(v, q, W, Y), se && g(v, q, W, Y), Y !== null && e.update(Y, s.ELEMENT_ARRAY_BUFFER), (se || a) && (a = !1, E(v, A, W, q), Y !== null && s.bindBuffer(s.ELEMENT_ARRAY_BUFFER, e.get(Y).buffer));
  }
  function c() {
    return s.createVertexArray();
  }
  function l(v) {
    return s.bindVertexArray(v);
  }
  function u(v) {
    return s.deleteVertexArray(v);
  }
  function h(v, A, W) {
    const q = W.wireframe === !0;
    let Y = n[v.id];
    Y === void 0 && (Y = {}, n[v.id] = Y);
    let se = Y[A.id];
    se === void 0 && (se = {}, Y[A.id] = se);
    let j = se[q];
    return j === void 0 && (j = d(c()), se[q] = j), j;
  }
  function d(v) {
    const A = [], W = [], q = [];
    for (let Y = 0; Y < t; Y++)
      A[Y] = 0, W[Y] = 0, q[Y] = 0;
    return {
      // for backward compatibility on non-VAO support browser
      geometry: null,
      program: null,
      wireframe: !1,
      newAttributes: A,
      enabledAttributes: W,
      attributeDivisors: q,
      object: v,
      attributes: {},
      index: null
    };
  }
  function f(v, A, W, q) {
    const Y = r.attributes, se = A.attributes;
    let j = 0;
    const he = W.getAttributes();
    for (const X in he)
      if (he[X].location >= 0) {
        const ve = Y[X];
        let we = se[X];
        if (we === void 0 && (X === "instanceMatrix" && v.instanceMatrix && (we = v.instanceMatrix), X === "instanceColor" && v.instanceColor && (we = v.instanceColor)), ve === void 0 || ve.attribute !== we || we && ve.data !== we.data) return !0;
        j++;
      }
    return r.attributesNum !== j || r.index !== q;
  }
  function g(v, A, W, q) {
    const Y = {}, se = A.attributes;
    let j = 0;
    const he = W.getAttributes();
    for (const X in he)
      if (he[X].location >= 0) {
        let ve = se[X];
        ve === void 0 && (X === "instanceMatrix" && v.instanceMatrix && (ve = v.instanceMatrix), X === "instanceColor" && v.instanceColor && (ve = v.instanceColor));
        const we = {};
        we.attribute = ve, ve && ve.data && (we.data = ve.data), Y[X] = we, j++;
      }
    r.attributes = Y, r.attributesNum = j, r.index = q;
  }
  function x() {
    const v = r.newAttributes;
    for (let A = 0, W = v.length; A < W; A++)
      v[A] = 0;
  }
  function p(v) {
    m(v, 0);
  }
  function m(v, A) {
    const W = r.newAttributes, q = r.enabledAttributes, Y = r.attributeDivisors;
    W[v] = 1, q[v] === 0 && (s.enableVertexAttribArray(v), q[v] = 1), Y[v] !== A && (s.vertexAttribDivisor(v, A), Y[v] = A);
  }
  function T() {
    const v = r.newAttributes, A = r.enabledAttributes;
    for (let W = 0, q = A.length; W < q; W++)
      A[W] !== v[W] && (s.disableVertexAttribArray(W), A[W] = 0);
  }
  function S(v, A, W, q, Y, se, j) {
    j === !0 ? s.vertexAttribIPointer(v, A, W, Y, se) : s.vertexAttribPointer(v, A, W, q, Y, se);
  }
  function E(v, A, W, q) {
    x();
    const Y = q.attributes, se = W.getAttributes(), j = A.defaultAttributeValues;
    for (const he in se) {
      const X = se[he];
      if (X.location >= 0) {
        let xe = Y[he];
        if (xe === void 0 && (he === "instanceMatrix" && v.instanceMatrix && (xe = v.instanceMatrix), he === "instanceColor" && v.instanceColor && (xe = v.instanceColor)), xe !== void 0) {
          const ve = xe.normalized, we = xe.itemSize, Qe = e.get(xe);
          if (Qe === void 0) continue;
          const ht = Qe.buffer, Z = Qe.type, ce = Qe.bytesPerElement, Te = Z === s.INT || Z === s.UNSIGNED_INT || xe.gpuType === 1013;
          if (xe.isInterleavedBufferAttribute) {
            const ye = xe.data, Xe = ye.stride, Be = xe.offset;
            if (ye.isInstancedInterleavedBuffer) {
              for (let et = 0; et < X.locationSize; et++)
                m(X.location + et, ye.meshPerAttribute);
              v.isInstancedMesh !== !0 && q._maxInstanceCount === void 0 && (q._maxInstanceCount = ye.meshPerAttribute * ye.count);
            } else
              for (let et = 0; et < X.locationSize; et++)
                p(X.location + et);
            s.bindBuffer(s.ARRAY_BUFFER, ht);
            for (let et = 0; et < X.locationSize; et++)
              S(
                X.location + et,
                we / X.locationSize,
                Z,
                ve,
                Xe * ce,
                (Be + we / X.locationSize * et) * ce,
                Te
              );
          } else {
            if (xe.isInstancedBufferAttribute) {
              for (let ye = 0; ye < X.locationSize; ye++)
                m(X.location + ye, xe.meshPerAttribute);
              v.isInstancedMesh !== !0 && q._maxInstanceCount === void 0 && (q._maxInstanceCount = xe.meshPerAttribute * xe.count);
            } else
              for (let ye = 0; ye < X.locationSize; ye++)
                p(X.location + ye);
            s.bindBuffer(s.ARRAY_BUFFER, ht);
            for (let ye = 0; ye < X.locationSize; ye++)
              S(
                X.location + ye,
                we / X.locationSize,
                Z,
                ve,
                we * ce,
                we / X.locationSize * ye * ce,
                Te
              );
          }
        } else if (j !== void 0) {
          const ve = j[he];
          if (ve !== void 0)
            switch (ve.length) {
              case 2:
                s.vertexAttrib2fv(X.location, ve);
                break;
              case 3:
                s.vertexAttrib3fv(X.location, ve);
                break;
              case 4:
                s.vertexAttrib4fv(X.location, ve);
                break;
              default:
                s.vertexAttrib1fv(X.location, ve);
            }
        }
      }
    }
    T();
  }
  function F() {
    z();
    for (const v in n) {
      const A = n[v];
      for (const W in A) {
        const q = A[W];
        for (const Y in q)
          u(q[Y].object), delete q[Y];
        delete A[W];
      }
      delete n[v];
    }
  }
  function P(v) {
    if (n[v.id] === void 0) return;
    const A = n[v.id];
    for (const W in A) {
      const q = A[W];
      for (const Y in q)
        u(q[Y].object), delete q[Y];
      delete A[W];
    }
    delete n[v.id];
  }
  function L(v) {
    for (const A in n) {
      const W = n[A];
      if (W[v.id] === void 0) continue;
      const q = W[v.id];
      for (const Y in q)
        u(q[Y].object), delete q[Y];
      delete W[v.id];
    }
  }
  function z() {
    ee(), a = !0, r !== i && (r = i, l(r.object));
  }
  function ee() {
    i.geometry = null, i.program = null, i.wireframe = !1;
  }
  return {
    setup: o,
    reset: z,
    resetDefaultState: ee,
    dispose: F,
    releaseStatesOfGeometry: P,
    releaseStatesOfProgram: L,
    initAttributes: x,
    enableAttribute: p,
    disableUnusedAttributes: T
  };
}
function kd(s, e, t) {
  let n;
  function i(l) {
    n = l;
  }
  function r(l, u) {
    s.drawArrays(n, l, u), t.update(u, n, 1);
  }
  function a(l, u, h) {
    h !== 0 && (s.drawArraysInstanced(n, l, u, h), t.update(u, n, h));
  }
  function o(l, u, h) {
    if (h === 0) return;
    e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n, l, 0, u, 0, h);
    let f = 0;
    for (let g = 0; g < h; g++)
      f += u[g];
    t.update(f, n, 1);
  }
  function c(l, u, h, d) {
    if (h === 0) return;
    const f = e.get("WEBGL_multi_draw");
    if (f === null)
      for (let g = 0; g < l.length; g++)
        a(l[g], u[g], d[g]);
    else {
      f.multiDrawArraysInstancedWEBGL(n, l, 0, u, 0, d, 0, h);
      let g = 0;
      for (let x = 0; x < h; x++)
        g += u[x];
      for (let x = 0; x < d.length; x++)
        t.update(g, n, d[x]);
    }
  }
  this.setMode = i, this.render = r, this.renderInstances = a, this.renderMultiDraw = o, this.renderMultiDrawInstances = c;
}
function zd(s, e, t, n) {
  let i;
  function r() {
    if (i !== void 0) return i;
    if (e.has("EXT_texture_filter_anisotropic") === !0) {
      const L = e.get("EXT_texture_filter_anisotropic");
      i = s.getParameter(L.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    } else
      i = 0;
    return i;
  }
  function a(L) {
    return !(L !== 1023 && n.convert(L) !== s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT));
  }
  function o(L) {
    const z = L === 1016 && (e.has("EXT_color_buffer_half_float") || e.has("EXT_color_buffer_float"));
    return !(L !== 1009 && n.convert(L) !== s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE) && // Edge and Chrome Mac < 52 (#9513)
    L !== 1015 && !z);
  }
  function c(L) {
    if (L === "highp") {
      if (s.getShaderPrecisionFormat(s.VERTEX_SHADER, s.HIGH_FLOAT).precision > 0 && s.getShaderPrecisionFormat(s.FRAGMENT_SHADER, s.HIGH_FLOAT).precision > 0)
        return "highp";
      L = "mediump";
    }
    return L === "mediump" && s.getShaderPrecisionFormat(s.VERTEX_SHADER, s.MEDIUM_FLOAT).precision > 0 && s.getShaderPrecisionFormat(s.FRAGMENT_SHADER, s.MEDIUM_FLOAT).precision > 0 ? "mediump" : "lowp";
  }
  let l = t.precision !== void 0 ? t.precision : "highp";
  const u = c(l);
  u !== l && (console.warn("THREE.WebGLRenderer:", l, "not supported, using", u, "instead."), l = u);
  const h = t.logarithmicDepthBuffer === !0, d = t.reverseDepthBuffer === !0 && e.has("EXT_clip_control");
  if (d === !0) {
    const L = e.get("EXT_clip_control");
    L.clipControlEXT(L.LOWER_LEFT_EXT, L.ZERO_TO_ONE_EXT);
  }
  const f = s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS), g = s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS), x = s.getParameter(s.MAX_TEXTURE_SIZE), p = s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE), m = s.getParameter(s.MAX_VERTEX_ATTRIBS), T = s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS), S = s.getParameter(s.MAX_VARYING_VECTORS), E = s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS), F = g > 0, P = s.getParameter(s.MAX_SAMPLES);
  return {
    isWebGL2: !0,
    // keeping this for backwards compatibility
    getMaxAnisotropy: r,
    getMaxPrecision: c,
    textureFormatReadable: a,
    textureTypeReadable: o,
    precision: l,
    logarithmicDepthBuffer: h,
    reverseDepthBuffer: d,
    maxTextures: f,
    maxVertexTextures: g,
    maxTextureSize: x,
    maxCubemapSize: p,
    maxAttributes: m,
    maxVertexUniforms: T,
    maxVaryings: S,
    maxFragmentUniforms: E,
    vertexTextures: F,
    maxSamples: P
  };
}
function Gd(s) {
  const e = this;
  let t = null, n = 0, i = !1, r = !1;
  const a = new Zn(), o = new Ke(), c = { value: null, needsUpdate: !1 };
  this.uniform = c, this.numPlanes = 0, this.numIntersection = 0, this.init = function(h, d) {
    const f = h.length !== 0 || d || // enable state of previous frame - the clipping code has to
    // run another frame in order to reset the state:
    n !== 0 || i;
    return i = d, n = h.length, f;
  }, this.beginShadows = function() {
    r = !0, u(null);
  }, this.endShadows = function() {
    r = !1;
  }, this.setGlobalState = function(h, d) {
    t = u(h, d, 0);
  }, this.setState = function(h, d, f) {
    const g = h.clippingPlanes, x = h.clipIntersection, p = h.clipShadows, m = s.get(h);
    if (!i || g === null || g.length === 0 || r && !p)
      r ? u(null) : l();
    else {
      const T = r ? 0 : n, S = T * 4;
      let E = m.clippingState || null;
      c.value = E, E = u(g, d, S, f);
      for (let F = 0; F !== S; ++F)
        E[F] = t[F];
      m.clippingState = E, this.numIntersection = x ? this.numPlanes : 0, this.numPlanes += T;
    }
  };
  function l() {
    c.value !== t && (c.value = t, c.needsUpdate = n > 0), e.numPlanes = n, e.numIntersection = 0;
  }
  function u(h, d, f, g) {
    const x = h !== null ? h.length : 0;
    let p = null;
    if (x !== 0) {
      if (p = c.value, g !== !0 || p === null) {
        const m = f + x * 4, T = d.matrixWorldInverse;
        o.getNormalMatrix(T), (p === null || p.length < m) && (p = new Float32Array(m));
        for (let S = 0, E = f; S !== x; ++S, E += 4)
          a.copy(h[S]).applyMatrix4(T, o), a.normal.toArray(p, E), p[E + 3] = a.constant;
      }
      c.value = p, c.needsUpdate = !0;
    }
    return e.numPlanes = x, e.numIntersection = 0, p;
  }
}
function Hd(s) {
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
            const l = new Ql(c.height);
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
class xr extends Sc {
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
      const l = (this.right - this.left) / this.view.fullWidth / this.zoom, u = (this.top - this.bottom) / this.view.fullHeight / this.zoom;
      r += l * this.view.offsetX, a = r + l * this.view.width, o -= u * this.view.offsetY, c = o - u * this.view.height;
    }
    this.projectionMatrix.makeOrthographic(r, a, o, c, this.near, this.far, this.coordinateSystem), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return t.object.zoom = this.zoom, t.object.left = this.left, t.object.right = this.right, t.object.top = this.top, t.object.bottom = this.bottom, t.object.near = this.near, t.object.far = this.far, this.view !== null && (t.object.view = Object.assign({}, this.view)), t;
  }
}
const Vi = 4, po = [0.125, 0.215, 0.35, 0.446, 0.526, 0.582], fi = 20, Zr = /* @__PURE__ */ new xr(), mo = /* @__PURE__ */ new De();
let $r = null, Jr = 0, Qr = 0, ea = !1;
const di = (1 + Math.sqrt(5)) / 2, zi = 1 / di, go = [
  /* @__PURE__ */ new N(-di, zi, 0),
  /* @__PURE__ */ new N(di, zi, 0),
  /* @__PURE__ */ new N(-zi, 0, di),
  /* @__PURE__ */ new N(zi, 0, di),
  /* @__PURE__ */ new N(0, di, -zi),
  /* @__PURE__ */ new N(0, di, zi),
  /* @__PURE__ */ new N(-1, 1, -1),
  /* @__PURE__ */ new N(1, 1, -1),
  /* @__PURE__ */ new N(-1, 1, 1),
  /* @__PURE__ */ new N(1, 1, 1)
];
class _o {
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
    $r = this._renderer.getRenderTarget(), Jr = this._renderer.getActiveCubeFace(), Qr = this._renderer.getActiveMipmapLevel(), ea = this._renderer.xr.enabled, this._renderer.xr.enabled = !1, this._setSize(256);
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
    this._cubemapMaterial === null && (this._cubemapMaterial = Mo(), this._compileMaterial(this._cubemapMaterial));
  }
  /**
   * Pre-compiles the equirectangular shader. You can get faster start-up by invoking this method during
   * your texture's network fetch for increased concurrency.
   */
  compileEquirectangularShader() {
    this._equirectMaterial === null && (this._equirectMaterial = vo(), this._compileMaterial(this._equirectMaterial));
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
    this._renderer.setRenderTarget($r, Jr, Qr), this._renderer.xr.enabled = ea, e.scissorTest = !1, Ks(e, 0, 0, e.width, e.height);
  }
  _fromTexture(e, t) {
    e.mapping === 301 || e.mapping === 302 ? this._setSize(e.image.length === 0 ? 16 : e.image[0].width || e.image[0].image.width) : this._setSize(e.image.width / 4), $r = this._renderer.getRenderTarget(), Jr = this._renderer.getActiveCubeFace(), Qr = this._renderer.getActiveMipmapLevel(), ea = this._renderer.xr.enabled, this._renderer.xr.enabled = !1;
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
      colorSpace: Ht,
      depthBuffer: !1
    }, i = xo(e, t, n);
    if (this._pingPongRenderTarget === null || this._pingPongRenderTarget.width !== e || this._pingPongRenderTarget.height !== t) {
      this._pingPongRenderTarget !== null && this._dispose(), this._pingPongRenderTarget = xo(e, t, n);
      const { _lodMax: r } = this;
      ({ sizeLods: this._sizeLods, lodPlanes: this._lodPlanes, sigmas: this._sigmas } = Vd(r)), this._blurMaterial = Wd(r, e, t);
    }
    return i;
  }
  _compileMaterial(e) {
    const t = new Le(this._lodPlanes[0], e);
    this._renderer.compile(t, Zr);
  }
  _sceneToCubeUV(e, t, n, i) {
    const o = new en(90, 1, t, n), c = [1, -1, 1, 1, 1, 1], l = [1, 1, 1, -1, -1, -1], u = this._renderer, h = u.autoClear, d = u.toneMapping;
    u.getClearColor(mo), u.toneMapping = 0, u.autoClear = !1;
    const f = new St({
      name: "PMREM.Background",
      side: 1,
      depthWrite: !1,
      depthTest: !1
    }), g = new Le(new yt(), f);
    let x = !1;
    const p = e.background;
    p ? p.isColor && (f.color.copy(p), e.background = null, x = !0) : (f.color.copy(mo), x = !0);
    for (let m = 0; m < 6; m++) {
      const T = m % 3;
      T === 0 ? (o.up.set(0, c[m], 0), o.lookAt(l[m], 0, 0)) : T === 1 ? (o.up.set(0, 0, c[m]), o.lookAt(0, l[m], 0)) : (o.up.set(0, c[m], 0), o.lookAt(0, 0, l[m]));
      const S = this._cubeSize;
      Ks(i, T * S, m > 2 ? S : 0, S, S), u.setRenderTarget(i), x && u.render(g, o), u.render(e, o);
    }
    g.geometry.dispose(), g.material.dispose(), u.toneMapping = d, u.autoClear = h, e.background = p;
  }
  _textureToCubeUV(e, t) {
    const n = this._renderer, i = e.mapping === 301 || e.mapping === 302;
    i ? (this._cubemapMaterial === null && (this._cubemapMaterial = Mo()), this._cubemapMaterial.uniforms.flipEnvMap.value = e.isRenderTargetTexture === !1 ? -1 : 1) : this._equirectMaterial === null && (this._equirectMaterial = vo());
    const r = i ? this._cubemapMaterial : this._equirectMaterial, a = new Le(this._lodPlanes[0], r), o = r.uniforms;
    o.envMap.value = e;
    const c = this._cubeSize;
    Ks(t, 0, 0, 3 * c, 2 * c), n.setRenderTarget(t), n.render(a, Zr);
  }
  _applyPMREM(e) {
    const t = this._renderer, n = t.autoClear;
    t.autoClear = !1;
    const i = this._lodPlanes.length;
    for (let r = 1; r < i; r++) {
      const a = Math.sqrt(this._sigmas[r] * this._sigmas[r] - this._sigmas[r - 1] * this._sigmas[r - 1]), o = go[(i - r - 1) % go.length];
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
    const u = 3, h = new Le(this._lodPlanes[i], l), d = l.uniforms, f = this._sizeLods[n] - 1, g = isFinite(r) ? Math.PI / (2 * f) : 2 * Math.PI / (2 * fi - 1), x = r / g, p = isFinite(r) ? 1 + Math.floor(u * x) : fi;
    p > fi && console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${fi}`);
    const m = [];
    let T = 0;
    for (let L = 0; L < fi; ++L) {
      const z = L / x, ee = Math.exp(-z * z / 2);
      m.push(ee), L === 0 ? T += ee : L < p && (T += 2 * ee);
    }
    for (let L = 0; L < m.length; L++)
      m[L] = m[L] / T;
    d.envMap.value = e.texture, d.samples.value = p, d.weights.value = m, d.latitudinal.value = a === "latitudinal", o && (d.poleAxis.value = o);
    const { _lodMax: S } = this;
    d.dTheta.value = g, d.mipInt.value = S - n;
    const E = this._sizeLods[i], F = 3 * E * (i > S - Vi ? i - S + Vi : 0), P = 4 * (this._cubeSize - E);
    Ks(t, F, P, 3 * E, 2 * E), c.setRenderTarget(t), c.render(h, Zr);
  }
}
function Vd(s) {
  const e = [], t = [], n = [];
  let i = s;
  const r = s - Vi + 1 + po.length;
  for (let a = 0; a < r; a++) {
    const o = Math.pow(2, i);
    t.push(o);
    let c = 1 / o;
    a > s - Vi ? c = po[a - s + Vi - 1] : a === 0 && (c = 0), n.push(c);
    const l = 1 / (o - 2), u = -l, h = 1 + l, d = [u, u, h, u, h, h, u, u, h, h, u, h], f = 6, g = 6, x = 3, p = 2, m = 1, T = new Float32Array(x * g * f), S = new Float32Array(p * g * f), E = new Float32Array(m * g * f);
    for (let P = 0; P < f; P++) {
      const L = P % 3 * 2 / 3 - 1, z = P > 2 ? 0 : -1, ee = [
        L,
        z,
        0,
        L + 2 / 3,
        z,
        0,
        L + 2 / 3,
        z + 1,
        0,
        L,
        z,
        0,
        L + 2 / 3,
        z + 1,
        0,
        L,
        z + 1,
        0
      ];
      T.set(ee, x * g * P), S.set(d, p * g * P);
      const v = [P, P, P, P, P, P];
      E.set(v, m * g * P);
    }
    const F = new Rt();
    F.setAttribute("position", new Jt(T, x)), F.setAttribute("uv", new Jt(S, p)), F.setAttribute("faceIndex", new Jt(E, m)), e.push(F), i > Vi && i--;
  }
  return { lodPlanes: e, sizeLods: t, sigmas: n };
}
function xo(s, e, t) {
  const n = new _i(s, e, t);
  return n.texture.mapping = 306, n.texture.name = "PMREM.cubeUv", n.scissorTest = !0, n;
}
function Ks(s, e, t, n, i) {
  s.viewport.set(e, t, n, i), s.scissor.set(e, t, n, i);
}
function Wd(s, e, t) {
  const n = new Float32Array(fi), i = new N(0, 1, 0);
  return new Qn({
    name: "SphericalGaussianBlur",
    defines: {
      n: fi,
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
    vertexShader: wa(),
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
function vo() {
  return new Qn({
    name: "EquirectangularToCubeUV",
    uniforms: {
      envMap: { value: null }
    },
    vertexShader: wa(),
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
function Mo() {
  return new Qn({
    name: "CubemapToCubeUV",
    uniforms: {
      envMap: { value: null },
      flipEnvMap: { value: -1 }
    },
    vertexShader: wa(),
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
function wa() {
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
function Xd(s) {
  let e = /* @__PURE__ */ new WeakMap(), t = null;
  function n(o) {
    if (o && o.isTexture) {
      const c = o.mapping, l = c === 303 || c === 304, u = c === 301 || c === 302;
      if (l || u) {
        let h = e.get(o);
        const d = h !== void 0 ? h.texture.pmremVersion : 0;
        if (o.isRenderTargetTexture && o.pmremVersion !== d)
          return t === null && (t = new _o(s)), h = l ? t.fromEquirectangular(o, h) : t.fromCubemap(o, h), h.texture.pmremVersion = o.pmremVersion, e.set(o, h), h.texture;
        if (h !== void 0)
          return h.texture;
        {
          const f = o.image;
          return l && f && f.height > 0 || u && f && i(f) ? (t === null && (t = new _o(s)), h = l ? t.fromEquirectangular(o) : t.fromCubemap(o), h.texture.pmremVersion = o.pmremVersion, e.set(o, h), o.addEventListener("dispose", r), h.texture) : null;
        }
      }
    }
    return o;
  }
  function i(o) {
    let c = 0;
    const l = 6;
    for (let u = 0; u < l; u++)
      o[u] !== void 0 && c++;
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
function qd(s) {
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
      return i === null && lr("THREE.WebGLRenderer: " + n + " extension not supported."), i;
    }
  };
}
function jd(s, e, t, n) {
  const i = {}, r = /* @__PURE__ */ new WeakMap();
  function a(h) {
    const d = h.target;
    d.index !== null && e.remove(d.index);
    for (const g in d.attributes)
      e.remove(d.attributes[g]);
    for (const g in d.morphAttributes) {
      const x = d.morphAttributes[g];
      for (let p = 0, m = x.length; p < m; p++)
        e.remove(x[p]);
    }
    d.removeEventListener("dispose", a), delete i[d.id];
    const f = r.get(d);
    f && (e.remove(f), r.delete(d)), n.releaseStatesOfGeometry(d), d.isInstancedBufferGeometry === !0 && delete d._maxInstanceCount, t.memory.geometries--;
  }
  function o(h, d) {
    return i[d.id] === !0 || (d.addEventListener("dispose", a), i[d.id] = !0, t.memory.geometries++), d;
  }
  function c(h) {
    const d = h.attributes;
    for (const g in d)
      e.update(d[g], s.ARRAY_BUFFER);
    const f = h.morphAttributes;
    for (const g in f) {
      const x = f[g];
      for (let p = 0, m = x.length; p < m; p++)
        e.update(x[p], s.ARRAY_BUFFER);
    }
  }
  function l(h) {
    const d = [], f = h.index, g = h.attributes.position;
    let x = 0;
    if (f !== null) {
      const T = f.array;
      x = f.version;
      for (let S = 0, E = T.length; S < E; S += 3) {
        const F = T[S + 0], P = T[S + 1], L = T[S + 2];
        d.push(F, P, P, L, L, F);
      }
    } else if (g !== void 0) {
      const T = g.array;
      x = g.version;
      for (let S = 0, E = T.length / 3 - 1; S < E; S += 3) {
        const F = S + 0, P = S + 1, L = S + 2;
        d.push(F, P, P, L, L, F);
      }
    } else
      return;
    const p = new (mc(d) ? Mc : vc)(d, 1);
    p.version = x;
    const m = r.get(h);
    m && e.remove(m), r.set(h, p);
  }
  function u(h) {
    const d = r.get(h);
    if (d) {
      const f = h.index;
      f !== null && d.version < f.version && l(h);
    } else
      l(h);
    return r.get(h);
  }
  return {
    get: o,
    update: c,
    getWireframeAttribute: u
  };
}
function Yd(s, e, t) {
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
  function u(d, f, g) {
    if (g === 0) return;
    e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n, f, 0, r, d, 0, g);
    let p = 0;
    for (let m = 0; m < g; m++)
      p += f[m];
    t.update(p, n, 1);
  }
  function h(d, f, g, x) {
    if (g === 0) return;
    const p = e.get("WEBGL_multi_draw");
    if (p === null)
      for (let m = 0; m < d.length; m++)
        l(d[m] / a, f[m], x[m]);
    else {
      p.multiDrawElementsInstancedWEBGL(n, f, 0, r, d, 0, x, 0, g);
      let m = 0;
      for (let T = 0; T < g; T++)
        m += f[T];
      for (let T = 0; T < x.length; T++)
        t.update(m, n, x[T]);
    }
  }
  this.setMode = i, this.setIndex = o, this.render = c, this.renderInstances = l, this.renderMultiDraw = u, this.renderMultiDrawInstances = h;
}
function Kd(s) {
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
function Zd(s, e, t) {
  const n = /* @__PURE__ */ new WeakMap(), i = new ut();
  function r(a, o, c) {
    const l = a.morphTargetInfluences, u = o.morphAttributes.position || o.morphAttributes.normal || o.morphAttributes.color, h = u !== void 0 ? u.length : 0;
    let d = n.get(o);
    if (d === void 0 || d.count !== h) {
      let ee = function() {
        L.dispose(), n.delete(o), o.removeEventListener("dispose", ee);
      };
      d !== void 0 && d.texture.dispose();
      const f = o.morphAttributes.position !== void 0, g = o.morphAttributes.normal !== void 0, x = o.morphAttributes.color !== void 0, p = o.morphAttributes.position || [], m = o.morphAttributes.normal || [], T = o.morphAttributes.color || [];
      let S = 0;
      f === !0 && (S = 1), g === !0 && (S = 2), x === !0 && (S = 3);
      let E = o.attributes.position.count * S, F = 1;
      E > e.maxTextureSize && (F = Math.ceil(E / e.maxTextureSize), E = e.maxTextureSize);
      const P = new Float32Array(E * F * 4 * h), L = new _c(P, E, F, h);
      L.type = 1015, L.needsUpdate = !0;
      const z = S * 4;
      for (let v = 0; v < h; v++) {
        const A = p[v], W = m[v], q = T[v], Y = E * F * 4 * v;
        for (let se = 0; se < A.count; se++) {
          const j = se * z;
          f === !0 && (i.fromBufferAttribute(A, se), P[Y + j + 0] = i.x, P[Y + j + 1] = i.y, P[Y + j + 2] = i.z, P[Y + j + 3] = 0), g === !0 && (i.fromBufferAttribute(W, se), P[Y + j + 4] = i.x, P[Y + j + 5] = i.y, P[Y + j + 6] = i.z, P[Y + j + 7] = 0), x === !0 && (i.fromBufferAttribute(q, se), P[Y + j + 8] = i.x, P[Y + j + 9] = i.y, P[Y + j + 10] = i.z, P[Y + j + 11] = q.itemSize === 4 ? i.w : 1);
        }
      }
      d = {
        count: h,
        texture: L,
        size: new qe(E, F)
      }, n.set(o, d), o.addEventListener("dispose", ee);
    }
    if (a.isInstancedMesh === !0 && a.morphTexture !== null)
      c.getUniforms().setValue(s, "morphTexture", a.morphTexture, t);
    else {
      let f = 0;
      for (let x = 0; x < l.length; x++)
        f += l[x];
      const g = o.morphTargetsRelative ? 1 : 1 - f;
      c.getUniforms().setValue(s, "morphTargetBaseInfluence", g), c.getUniforms().setValue(s, "morphTargetInfluences", l);
    }
    c.getUniforms().setValue(s, "morphTargetsTexture", d.texture, t), c.getUniforms().setValue(s, "morphTargetsTextureSize", d.size);
  }
  return {
    update: r
  };
}
function $d(s, e, t, n) {
  let i = /* @__PURE__ */ new WeakMap();
  function r(c) {
    const l = n.render.frame, u = c.geometry, h = e.get(c, u);
    if (i.get(h) !== l && (e.update(h), i.set(h, l)), c.isInstancedMesh && (c.hasEventListener("dispose", o) === !1 && c.addEventListener("dispose", o), i.get(c) !== l && (t.update(c.instanceMatrix, s.ARRAY_BUFFER), c.instanceColor !== null && t.update(c.instanceColor, s.ARRAY_BUFFER), i.set(c, l))), c.isSkinnedMesh) {
      const d = c.skeleton;
      i.get(d) !== l && (d.update(), i.set(d, l));
    }
    return h;
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
class Ac extends Ft {
  constructor(e, t, n, i, r, a, o, c, l, u = 1026) {
    if (u !== 1026 && u !== 1027)
      throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");
    n === void 0 && u === 1026 && (n = 1014), n === void 0 && u === 1027 && (n = 1020), super(null, i, r, a, o, c, u, n, l), this.isDepthTexture = !0, this.image = { width: e, height: t }, this.magFilter = o !== void 0 ? o : 1003, this.minFilter = c !== void 0 ? c : 1003, this.flipY = !1, this.generateMipmaps = !1, this.compareFunction = null;
  }
  copy(e) {
    return super.copy(e), this.compareFunction = e.compareFunction, this;
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return this.compareFunction !== null && (t.compareFunction = this.compareFunction), t;
  }
}
const bc = /* @__PURE__ */ new Ft(), yo = /* @__PURE__ */ new Ac(1, 1), wc = /* @__PURE__ */ new _c(), Rc = /* @__PURE__ */ new Bl(), Cc = /* @__PURE__ */ new Ec(), So = [], Eo = [], To = new Float32Array(16), Ao = new Float32Array(9), bo = new Float32Array(4);
function ts(s, e, t) {
  const n = s[0];
  if (n <= 0 || n > 0) return s;
  const i = e * t;
  let r = So[i];
  if (r === void 0 && (r = new Float32Array(i), So[i] = r), e !== 0) {
    n.toArray(r, 0);
    for (let a = 1, o = 0; a !== e; ++a)
      o += t, s[a].toArray(r, o);
  }
  return r;
}
function Bt(s, e) {
  if (s.length !== e.length) return !1;
  for (let t = 0, n = s.length; t < n; t++)
    if (s[t] !== e[t]) return !1;
  return !0;
}
function Ot(s, e) {
  for (let t = 0, n = e.length; t < n; t++)
    s[t] = e[t];
}
function vr(s, e) {
  let t = Eo[e];
  t === void 0 && (t = new Int32Array(e), Eo[e] = t);
  for (let n = 0; n !== e; ++n)
    t[n] = s.allocateTextureUnit();
  return t;
}
function Jd(s, e) {
  const t = this.cache;
  t[0] !== e && (s.uniform1f(this.addr, e), t[0] = e);
}
function Qd(s, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y) && (s.uniform2f(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);
  else {
    if (Bt(t, e)) return;
    s.uniform2fv(this.addr, e), Ot(t, e);
  }
}
function ef(s, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (s.uniform3f(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);
  else if (e.r !== void 0)
    (t[0] !== e.r || t[1] !== e.g || t[2] !== e.b) && (s.uniform3f(this.addr, e.r, e.g, e.b), t[0] = e.r, t[1] = e.g, t[2] = e.b);
  else {
    if (Bt(t, e)) return;
    s.uniform3fv(this.addr, e), Ot(t, e);
  }
}
function tf(s, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (s.uniform4f(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);
  else {
    if (Bt(t, e)) return;
    s.uniform4fv(this.addr, e), Ot(t, e);
  }
}
function nf(s, e) {
  const t = this.cache, n = e.elements;
  if (n === void 0) {
    if (Bt(t, e)) return;
    s.uniformMatrix2fv(this.addr, !1, e), Ot(t, e);
  } else {
    if (Bt(t, n)) return;
    bo.set(n), s.uniformMatrix2fv(this.addr, !1, bo), Ot(t, n);
  }
}
function sf(s, e) {
  const t = this.cache, n = e.elements;
  if (n === void 0) {
    if (Bt(t, e)) return;
    s.uniformMatrix3fv(this.addr, !1, e), Ot(t, e);
  } else {
    if (Bt(t, n)) return;
    Ao.set(n), s.uniformMatrix3fv(this.addr, !1, Ao), Ot(t, n);
  }
}
function rf(s, e) {
  const t = this.cache, n = e.elements;
  if (n === void 0) {
    if (Bt(t, e)) return;
    s.uniformMatrix4fv(this.addr, !1, e), Ot(t, e);
  } else {
    if (Bt(t, n)) return;
    To.set(n), s.uniformMatrix4fv(this.addr, !1, To), Ot(t, n);
  }
}
function af(s, e) {
  const t = this.cache;
  t[0] !== e && (s.uniform1i(this.addr, e), t[0] = e);
}
function of(s, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y) && (s.uniform2i(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);
  else {
    if (Bt(t, e)) return;
    s.uniform2iv(this.addr, e), Ot(t, e);
  }
}
function cf(s, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (s.uniform3i(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);
  else {
    if (Bt(t, e)) return;
    s.uniform3iv(this.addr, e), Ot(t, e);
  }
}
function lf(s, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (s.uniform4i(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);
  else {
    if (Bt(t, e)) return;
    s.uniform4iv(this.addr, e), Ot(t, e);
  }
}
function hf(s, e) {
  const t = this.cache;
  t[0] !== e && (s.uniform1ui(this.addr, e), t[0] = e);
}
function uf(s, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y) && (s.uniform2ui(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);
  else {
    if (Bt(t, e)) return;
    s.uniform2uiv(this.addr, e), Ot(t, e);
  }
}
function df(s, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (s.uniform3ui(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);
  else {
    if (Bt(t, e)) return;
    s.uniform3uiv(this.addr, e), Ot(t, e);
  }
}
function ff(s, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (s.uniform4ui(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);
  else {
    if (Bt(t, e)) return;
    s.uniform4uiv(this.addr, e), Ot(t, e);
  }
}
function pf(s, e, t) {
  const n = this.cache, i = t.allocateTextureUnit();
  n[0] !== i && (s.uniform1i(this.addr, i), n[0] = i);
  let r;
  this.type === s.SAMPLER_2D_SHADOW ? (yo.compareFunction = 515, r = yo) : r = bc, t.setTexture2D(e || r, i);
}
function mf(s, e, t) {
  const n = this.cache, i = t.allocateTextureUnit();
  n[0] !== i && (s.uniform1i(this.addr, i), n[0] = i), t.setTexture3D(e || Rc, i);
}
function gf(s, e, t) {
  const n = this.cache, i = t.allocateTextureUnit();
  n[0] !== i && (s.uniform1i(this.addr, i), n[0] = i), t.setTextureCube(e || Cc, i);
}
function _f(s, e, t) {
  const n = this.cache, i = t.allocateTextureUnit();
  n[0] !== i && (s.uniform1i(this.addr, i), n[0] = i), t.setTexture2DArray(e || wc, i);
}
function xf(s) {
  switch (s) {
    case 5126:
      return Jd;
    case 35664:
      return Qd;
    case 35665:
      return ef;
    case 35666:
      return tf;
    case 35674:
      return nf;
    case 35675:
      return sf;
    case 35676:
      return rf;
    case 5124:
    case 35670:
      return af;
    case 35667:
    case 35671:
      return of;
    case 35668:
    case 35672:
      return cf;
    case 35669:
    case 35673:
      return lf;
    case 5125:
      return hf;
    case 36294:
      return uf;
    case 36295:
      return df;
    case 36296:
      return ff;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return pf;
    case 35679:
    case 36299:
    case 36307:
      return mf;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return gf;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return _f;
  }
}
function vf(s, e) {
  s.uniform1fv(this.addr, e);
}
function Mf(s, e) {
  const t = ts(e, this.size, 2);
  s.uniform2fv(this.addr, t);
}
function yf(s, e) {
  const t = ts(e, this.size, 3);
  s.uniform3fv(this.addr, t);
}
function Sf(s, e) {
  const t = ts(e, this.size, 4);
  s.uniform4fv(this.addr, t);
}
function Ef(s, e) {
  const t = ts(e, this.size, 4);
  s.uniformMatrix2fv(this.addr, !1, t);
}
function Tf(s, e) {
  const t = ts(e, this.size, 9);
  s.uniformMatrix3fv(this.addr, !1, t);
}
function Af(s, e) {
  const t = ts(e, this.size, 16);
  s.uniformMatrix4fv(this.addr, !1, t);
}
function bf(s, e) {
  s.uniform1iv(this.addr, e);
}
function wf(s, e) {
  s.uniform2iv(this.addr, e);
}
function Rf(s, e) {
  s.uniform3iv(this.addr, e);
}
function Cf(s, e) {
  s.uniform4iv(this.addr, e);
}
function If(s, e) {
  s.uniform1uiv(this.addr, e);
}
function Pf(s, e) {
  s.uniform2uiv(this.addr, e);
}
function Lf(s, e) {
  s.uniform3uiv(this.addr, e);
}
function Df(s, e) {
  s.uniform4uiv(this.addr, e);
}
function Uf(s, e, t) {
  const n = this.cache, i = e.length, r = vr(t, i);
  Bt(n, r) || (s.uniform1iv(this.addr, r), Ot(n, r));
  for (let a = 0; a !== i; ++a)
    t.setTexture2D(e[a] || bc, r[a]);
}
function Nf(s, e, t) {
  const n = this.cache, i = e.length, r = vr(t, i);
  Bt(n, r) || (s.uniform1iv(this.addr, r), Ot(n, r));
  for (let a = 0; a !== i; ++a)
    t.setTexture3D(e[a] || Rc, r[a]);
}
function Ff(s, e, t) {
  const n = this.cache, i = e.length, r = vr(t, i);
  Bt(n, r) || (s.uniform1iv(this.addr, r), Ot(n, r));
  for (let a = 0; a !== i; ++a)
    t.setTextureCube(e[a] || Cc, r[a]);
}
function Bf(s, e, t) {
  const n = this.cache, i = e.length, r = vr(t, i);
  Bt(n, r) || (s.uniform1iv(this.addr, r), Ot(n, r));
  for (let a = 0; a !== i; ++a)
    t.setTexture2DArray(e[a] || wc, r[a]);
}
function Of(s) {
  switch (s) {
    case 5126:
      return vf;
    case 35664:
      return Mf;
    case 35665:
      return yf;
    case 35666:
      return Sf;
    case 35674:
      return Ef;
    case 35675:
      return Tf;
    case 35676:
      return Af;
    case 5124:
    case 35670:
      return bf;
    case 35667:
    case 35671:
      return wf;
    case 35668:
    case 35672:
      return Rf;
    case 35669:
    case 35673:
      return Cf;
    case 5125:
      return If;
    case 36294:
      return Pf;
    case 36295:
      return Lf;
    case 36296:
      return Df;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return Uf;
    case 35679:
    case 36299:
    case 36307:
      return Nf;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return Ff;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return Bf;
  }
}
class kf {
  constructor(e, t, n) {
    this.id = e, this.addr = n, this.cache = [], this.type = t.type, this.setValue = xf(t.type);
  }
}
class zf {
  constructor(e, t, n) {
    this.id = e, this.addr = n, this.cache = [], this.type = t.type, this.size = t.size, this.setValue = Of(t.type);
  }
}
class Gf {
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
const ta = /(\w+)(\])?(\[|\.)?/g;
function wo(s, e) {
  s.seq.push(e), s.map[e.id] = e;
}
function Hf(s, e, t) {
  const n = s.name, i = n.length;
  for (ta.lastIndex = 0; ; ) {
    const r = ta.exec(n), a = ta.lastIndex;
    let o = r[1];
    const c = r[2] === "]", l = r[3];
    if (c && (o = o | 0), l === void 0 || l === "[" && a + 2 === i) {
      wo(t, l === void 0 ? new kf(o, s, e) : new zf(o, s, e));
      break;
    } else {
      let h = t.map[o];
      h === void 0 && (h = new Gf(o), wo(t, h)), t = h;
    }
  }
}
class hr {
  constructor(e, t) {
    this.seq = [], this.map = {};
    const n = e.getProgramParameter(t, e.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; ++i) {
      const r = e.getActiveUniform(t, i), a = e.getUniformLocation(t, r.name);
      Hf(r, a, this);
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
function Ro(s, e, t) {
  const n = s.createShader(e);
  return s.shaderSource(n, t), s.compileShader(n), n;
}
const Vf = 37297;
let Wf = 0;
function Xf(s, e) {
  const t = s.split(`
`), n = [], i = Math.max(e - 6, 0), r = Math.min(e + 6, t.length);
  for (let a = i; a < r; a++) {
    const o = a + 1;
    n.push(`${o === e ? ">" : " "} ${o}: ${t[a]}`);
  }
  return n.join(`
`);
}
function qf(s) {
  const e = at.getPrimaries(at.workingColorSpace), t = at.getPrimaries(s);
  let n;
  switch (e === t ? n = "" : e === pr && t === fr ? n = "LinearDisplayP3ToLinearSRGB" : e === fr && t === pr && (n = "LinearSRGBToLinearDisplayP3"), s) {
    case Ht:
    case _r:
      return [n, "LinearTransferOETF"];
    case wt:
    case Ea:
      return [n, "sRGBTransferOETF"];
    default:
      return console.warn("THREE.WebGLProgram: Unsupported color space:", s), [n, "LinearTransferOETF"];
  }
}
function Co(s, e, t) {
  const n = s.getShaderParameter(e, s.COMPILE_STATUS), i = s.getShaderInfoLog(e).trim();
  if (n && i === "") return "";
  const r = /ERROR: 0:(\d+)/.exec(i);
  if (r) {
    const a = parseInt(r[1]);
    return t.toUpperCase() + `

` + i + `

` + Xf(s.getShaderSource(e), a);
  } else
    return i;
}
function jf(s, e) {
  const t = qf(e);
  return `vec4 ${s}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`;
}
function Yf(s, e) {
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
const Zs = /* @__PURE__ */ new N();
function Kf() {
  at.getLuminanceCoefficients(Zs);
  const s = Zs.x.toFixed(4), e = Zs.y.toFixed(4), t = Zs.z.toFixed(4);
  return [
    "float luminance( const in vec3 rgb ) {",
    `	const vec3 weights = vec3( ${s}, ${e}, ${t} );`,
    "	return dot( weights, rgb );",
    "}"
  ].join(`
`);
}
function Zf(s) {
  return [
    s.extensionClipCullDistance ? "#extension GL_ANGLE_clip_cull_distance : require" : "",
    s.extensionMultiDraw ? "#extension GL_ANGLE_multi_draw : require" : ""
  ].filter(xs).join(`
`);
}
function $f(s) {
  const e = [];
  for (const t in s) {
    const n = s[t];
    n !== !1 && e.push("#define " + t + " " + n);
  }
  return e.join(`
`);
}
function Jf(s, e) {
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
function xs(s) {
  return s !== "";
}
function Io(s, e) {
  const t = e.numSpotLightShadows + e.numSpotLightMaps - e.numSpotLightShadowsWithMaps;
  return s.replace(/NUM_DIR_LIGHTS/g, e.numDirLights).replace(/NUM_SPOT_LIGHTS/g, e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g, e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g, t).replace(/NUM_RECT_AREA_LIGHTS/g, e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g, e.numPointLights).replace(/NUM_HEMI_LIGHTS/g, e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g, e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g, e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g, e.numPointLightShadows);
}
function Po(s, e) {
  return s.replace(/NUM_CLIPPING_PLANES/g, e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g, e.numClippingPlanes - e.numClipIntersection);
}
const Qf = /^[ \t]*#include +<([\w\d./]+)>/gm;
function ma(s) {
  return s.replace(Qf, tp);
}
const ep = /* @__PURE__ */ new Map();
function tp(s, e) {
  let t = Ye[e];
  if (t === void 0) {
    const n = ep.get(e);
    if (n !== void 0)
      t = Ye[n], console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.', e, n);
    else
      throw new Error("Can not resolve #include <" + e + ">");
  }
  return ma(t);
}
const np = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
function Lo(s) {
  return s.replace(np, ip);
}
function ip(s, e, t, n) {
  let i = "";
  for (let r = parseInt(e); r < parseInt(t); r++)
    i += n.replace(/\[\s*i\s*\]/g, "[ " + r + " ]").replace(/UNROLLED_LOOP_INDEX/g, r);
  return i;
}
function Do(s) {
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
function sp(s) {
  let e = "SHADOWMAP_TYPE_BASIC";
  return s.shadowMapType === 1 ? e = "SHADOWMAP_TYPE_PCF" : s.shadowMapType === 2 ? e = "SHADOWMAP_TYPE_PCF_SOFT" : s.shadowMapType === 3 && (e = "SHADOWMAP_TYPE_VSM"), e;
}
function rp(s) {
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
function ap(s) {
  let e = "ENVMAP_MODE_REFLECTION";
  if (s.envMap)
    switch (s.envMapMode) {
      case 302:
        e = "ENVMAP_MODE_REFRACTION";
        break;
    }
  return e;
}
function op(s) {
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
function cp(s) {
  const e = s.envMapCubeUVHeight;
  if (e === null) return null;
  const t = Math.log2(e) - 2, n = 1 / e;
  return { texelWidth: 1 / (3 * Math.max(Math.pow(2, t), 7 * 16)), texelHeight: n, maxMip: t };
}
function lp(s, e, t, n) {
  const i = s.getContext(), r = t.defines;
  let a = t.vertexShader, o = t.fragmentShader;
  const c = sp(t), l = rp(t), u = ap(t), h = op(t), d = cp(t), f = Zf(t), g = $f(r), x = i.createProgram();
  let p, m, T = t.glslVersion ? "#version " + t.glslVersion + `
` : "";
  t.isRawShaderMaterial ? (p = [
    "#define SHADER_TYPE " + t.shaderType,
    "#define SHADER_NAME " + t.shaderName,
    g
  ].filter(xs).join(`
`), p.length > 0 && (p += `
`), m = [
    "#define SHADER_TYPE " + t.shaderType,
    "#define SHADER_NAME " + t.shaderName,
    g
  ].filter(xs).join(`
`), m.length > 0 && (m += `
`)) : (p = [
    Do(t),
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
    t.envMap ? "#define " + u : "",
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
  ].filter(xs).join(`
`), m = [
    Do(t),
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
    t.envMap ? "#define " + u : "",
    t.envMap ? "#define " + h : "",
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
    t.toneMapping !== 0 ? Ye.tonemapping_pars_fragment : "",
    // this code is required here because it is used by the toneMapping() function defined below
    t.toneMapping !== 0 ? Yf("toneMapping", t.toneMapping) : "",
    t.dithering ? "#define DITHERING" : "",
    t.opaque ? "#define OPAQUE" : "",
    Ye.colorspace_pars_fragment,
    // this code is required here because it is used by the various encoding/decoding function defined below
    jf("linearToOutputTexel", t.outputColorSpace),
    Kf(),
    t.useDepthPacking ? "#define DEPTH_PACKING " + t.depthPacking : "",
    `
`
  ].filter(xs).join(`
`)), a = ma(a), a = Io(a, t), a = Po(a, t), o = ma(o), o = Io(o, t), o = Po(o, t), a = Lo(a), o = Lo(o), t.isRawShaderMaterial !== !0 && (T = `#version 300 es
`, p = [
    f,
    "#define attribute in",
    "#define varying out",
    "#define texture2D texture"
  ].join(`
`) + `
` + p, m = [
    "#define varying in",
    t.glslVersion === Ya ? "" : "layout(location = 0) out highp vec4 pc_fragColor;",
    t.glslVersion === Ya ? "" : "#define gl_FragColor pc_fragColor",
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
  const S = T + p + a, E = T + m + o, F = Ro(i, i.VERTEX_SHADER, S), P = Ro(i, i.FRAGMENT_SHADER, E);
  i.attachShader(x, F), i.attachShader(x, P), t.index0AttributeName !== void 0 ? i.bindAttribLocation(x, 0, t.index0AttributeName) : t.morphTargets === !0 && i.bindAttribLocation(x, 0, "position"), i.linkProgram(x);
  function L(A) {
    if (s.debug.checkShaderErrors) {
      const W = i.getProgramInfoLog(x).trim(), q = i.getShaderInfoLog(F).trim(), Y = i.getShaderInfoLog(P).trim();
      let se = !0, j = !0;
      if (i.getProgramParameter(x, i.LINK_STATUS) === !1)
        if (se = !1, typeof s.debug.onShaderError == "function")
          s.debug.onShaderError(i, x, F, P);
        else {
          const he = Co(i, F, "vertex"), X = Co(i, P, "fragment");
          console.error(
            "THREE.WebGLProgram: Shader Error " + i.getError() + " - VALIDATE_STATUS " + i.getProgramParameter(x, i.VALIDATE_STATUS) + `

Material Name: ` + A.name + `
Material Type: ` + A.type + `

Program Info Log: ` + W + `
` + he + `
` + X
          );
        }
      else W !== "" ? console.warn("THREE.WebGLProgram: Program Info Log:", W) : (q === "" || Y === "") && (j = !1);
      j && (A.diagnostics = {
        runnable: se,
        programLog: W,
        vertexShader: {
          log: q,
          prefix: p
        },
        fragmentShader: {
          log: Y,
          prefix: m
        }
      });
    }
    i.deleteShader(F), i.deleteShader(P), z = new hr(i, x), ee = Jf(i, x);
  }
  let z;
  this.getUniforms = function() {
    return z === void 0 && L(this), z;
  };
  let ee;
  this.getAttributes = function() {
    return ee === void 0 && L(this), ee;
  };
  let v = t.rendererExtensionParallelShaderCompile === !1;
  return this.isReady = function() {
    return v === !1 && (v = i.getProgramParameter(x, Vf)), v;
  }, this.destroy = function() {
    n.releaseStatesOfProgram(this), i.deleteProgram(x), this.program = void 0;
  }, this.type = t.shaderType, this.name = t.shaderName, this.id = Wf++, this.cacheKey = e, this.usedTimes = 1, this.program = x, this.vertexShader = F, this.fragmentShader = P, this;
}
let hp = 0;
class up {
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
    return n === void 0 && (n = new dp(e), t.set(e, n)), n;
  }
}
class dp {
  constructor(e) {
    this.id = hp++, this.code = e, this.usedTimes = 0;
  }
}
function fp(s, e, t, n, i, r, a) {
  const o = new Aa(), c = new up(), l = /* @__PURE__ */ new Set(), u = [], h = i.logarithmicDepthBuffer, d = i.reverseDepthBuffer, f = i.vertexTextures;
  let g = i.precision;
  const x = {
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
  function p(v) {
    return l.add(v), v === 0 ? "uv" : `uv${v}`;
  }
  function m(v, A, W, q, Y) {
    const se = q.fog, j = Y.geometry, he = v.isMeshStandardMaterial ? q.environment : null, X = (v.isMeshStandardMaterial ? t : e).get(v.envMap || he), xe = X && X.mapping === 306 ? X.image.height : null, ve = x[v.type];
    v.precision !== null && (g = i.getMaxPrecision(v.precision), g !== v.precision && console.warn("THREE.WebGLProgram.getParameters:", v.precision, "not supported, using", g, "instead."));
    const we = j.morphAttributes.position || j.morphAttributes.normal || j.morphAttributes.color, Qe = we !== void 0 ? we.length : 0;
    let ht = 0;
    j.morphAttributes.position !== void 0 && (ht = 1), j.morphAttributes.normal !== void 0 && (ht = 2), j.morphAttributes.color !== void 0 && (ht = 3);
    let Z, ce, Te, ye;
    if (ve) {
      const Ct = Rn[ve];
      Z = Ct.vertexShader, ce = Ct.fragmentShader;
    } else
      Z = v.vertexShader, ce = v.fragmentShader, c.update(v), Te = c.getVertexShaderID(v), ye = c.getFragmentShaderID(v);
    const Xe = s.getRenderTarget(), Be = Y.isInstancedMesh === !0, et = Y.isBatchedMesh === !0, ft = !!v.map, nt = !!v.matcap, U = !!X, Vt = !!v.aoMap, Ze = !!v.lightMap, it = !!v.bumpMap, Ne = !!v.normalMap, _t = !!v.displacementMap, Oe = !!v.emissiveMap, C = !!v.metalnessMap, M = !!v.roughnessMap, G = v.anisotropy > 0, $ = v.clearcoat > 0, re = v.dispersion > 0, J = v.iridescence > 0, Re = v.sheen > 0, ie = v.transmission > 0, ae = G && !!v.anisotropyMap, D = $ && !!v.clearcoatMap, ue = $ && !!v.clearcoatNormalMap, Ee = $ && !!v.clearcoatRoughnessMap, Ge = J && !!v.iridescenceMap, He = J && !!v.iridescenceThicknessMap, Se = Re && !!v.sheenColorMap, tt = Re && !!v.sheenRoughnessMap, Ve = !!v.specularMap, xt = !!v.specularColorMap, B = !!v.specularIntensityMap, fe = ie && !!v.transmissionMap, K = ie && !!v.thicknessMap, te = !!v.gradientMap, ge = !!v.alphaMap, _e = v.alphaTest > 0, $e = !!v.alphaHash, bt = !!v.extensions;
    let Dt = 0;
    v.toneMapped && (Xe === null || Xe.isXRRenderTarget === !0) && (Dt = s.toneMapping);
    const st = {
      shaderID: ve,
      shaderType: v.type,
      shaderName: v.name,
      vertexShader: Z,
      fragmentShader: ce,
      defines: v.defines,
      customVertexShaderID: Te,
      customFragmentShaderID: ye,
      isRawShaderMaterial: v.isRawShaderMaterial === !0,
      glslVersion: v.glslVersion,
      precision: g,
      batching: et,
      batchingColor: et && Y._colorsTexture !== null,
      instancing: Be,
      instancingColor: Be && Y.instanceColor !== null,
      instancingMorph: Be && Y.morphTexture !== null,
      supportsVertexTextures: f,
      outputColorSpace: Xe === null ? s.outputColorSpace : Xe.isXRRenderTarget === !0 ? Xe.texture.colorSpace : Ht,
      alphaToCoverage: !!v.alphaToCoverage,
      map: ft,
      matcap: nt,
      envMap: U,
      envMapMode: U && X.mapping,
      envMapCubeUVHeight: xe,
      aoMap: Vt,
      lightMap: Ze,
      bumpMap: it,
      normalMap: Ne,
      displacementMap: f && _t,
      emissiveMap: Oe,
      normalMapObjectSpace: Ne && v.normalMapType === 1,
      normalMapTangentSpace: Ne && v.normalMapType === 0,
      metalnessMap: C,
      roughnessMap: M,
      anisotropy: G,
      anisotropyMap: ae,
      clearcoat: $,
      clearcoatMap: D,
      clearcoatNormalMap: ue,
      clearcoatRoughnessMap: Ee,
      dispersion: re,
      iridescence: J,
      iridescenceMap: Ge,
      iridescenceThicknessMap: He,
      sheen: Re,
      sheenColorMap: Se,
      sheenRoughnessMap: tt,
      specularMap: Ve,
      specularColorMap: xt,
      specularIntensityMap: B,
      transmission: ie,
      transmissionMap: fe,
      thicknessMap: K,
      gradientMap: te,
      opaque: v.transparent === !1 && v.blending === 1 && v.alphaToCoverage === !1,
      alphaMap: ge,
      alphaTest: _e,
      alphaHash: $e,
      combine: v.combine,
      //
      mapUv: ft && p(v.map.channel),
      aoMapUv: Vt && p(v.aoMap.channel),
      lightMapUv: Ze && p(v.lightMap.channel),
      bumpMapUv: it && p(v.bumpMap.channel),
      normalMapUv: Ne && p(v.normalMap.channel),
      displacementMapUv: _t && p(v.displacementMap.channel),
      emissiveMapUv: Oe && p(v.emissiveMap.channel),
      metalnessMapUv: C && p(v.metalnessMap.channel),
      roughnessMapUv: M && p(v.roughnessMap.channel),
      anisotropyMapUv: ae && p(v.anisotropyMap.channel),
      clearcoatMapUv: D && p(v.clearcoatMap.channel),
      clearcoatNormalMapUv: ue && p(v.clearcoatNormalMap.channel),
      clearcoatRoughnessMapUv: Ee && p(v.clearcoatRoughnessMap.channel),
      iridescenceMapUv: Ge && p(v.iridescenceMap.channel),
      iridescenceThicknessMapUv: He && p(v.iridescenceThicknessMap.channel),
      sheenColorMapUv: Se && p(v.sheenColorMap.channel),
      sheenRoughnessMapUv: tt && p(v.sheenRoughnessMap.channel),
      specularMapUv: Ve && p(v.specularMap.channel),
      specularColorMapUv: xt && p(v.specularColorMap.channel),
      specularIntensityMapUv: B && p(v.specularIntensityMap.channel),
      transmissionMapUv: fe && p(v.transmissionMap.channel),
      thicknessMapUv: K && p(v.thicknessMap.channel),
      alphaMapUv: ge && p(v.alphaMap.channel),
      //
      vertexTangents: !!j.attributes.tangent && (Ne || G),
      vertexColors: v.vertexColors,
      vertexAlphas: v.vertexColors === !0 && !!j.attributes.color && j.attributes.color.itemSize === 4,
      pointsUvs: Y.isPoints === !0 && !!j.attributes.uv && (ft || ge),
      fog: !!se,
      useFog: v.fog === !0,
      fogExp2: !!se && se.isFogExp2,
      flatShading: v.flatShading === !0,
      sizeAttenuation: v.sizeAttenuation === !0,
      logarithmicDepthBuffer: h,
      reverseDepthBuffer: d,
      skinning: Y.isSkinnedMesh === !0,
      morphTargets: j.morphAttributes.position !== void 0,
      morphNormals: j.morphAttributes.normal !== void 0,
      morphColors: j.morphAttributes.color !== void 0,
      morphTargetsCount: Qe,
      morphTextureStride: ht,
      numDirLights: A.directional.length,
      numPointLights: A.point.length,
      numSpotLights: A.spot.length,
      numSpotLightMaps: A.spotLightMap.length,
      numRectAreaLights: A.rectArea.length,
      numHemiLights: A.hemi.length,
      numDirLightShadows: A.directionalShadowMap.length,
      numPointLightShadows: A.pointShadowMap.length,
      numSpotLightShadows: A.spotShadowMap.length,
      numSpotLightShadowsWithMaps: A.numSpotLightShadowsWithMaps,
      numLightProbes: A.numLightProbes,
      numClippingPlanes: a.numPlanes,
      numClipIntersection: a.numIntersection,
      dithering: v.dithering,
      shadowMapEnabled: s.shadowMap.enabled && W.length > 0,
      shadowMapType: s.shadowMap.type,
      toneMapping: Dt,
      decodeVideoTexture: ft && v.map.isVideoTexture === !0 && at.getTransfer(v.map.colorSpace) === Et,
      premultipliedAlpha: v.premultipliedAlpha,
      doubleSided: v.side === 2,
      flipSided: v.side === 1,
      useDepthPacking: v.depthPacking >= 0,
      depthPacking: v.depthPacking || 0,
      index0AttributeName: v.index0AttributeName,
      extensionClipCullDistance: bt && v.extensions.clipCullDistance === !0 && n.has("WEBGL_clip_cull_distance"),
      extensionMultiDraw: (bt && v.extensions.multiDraw === !0 || et) && n.has("WEBGL_multi_draw"),
      rendererExtensionParallelShaderCompile: n.has("KHR_parallel_shader_compile"),
      customProgramCacheKey: v.customProgramCacheKey()
    };
    return st.vertexUv1s = l.has(1), st.vertexUv2s = l.has(2), st.vertexUv3s = l.has(3), l.clear(), st;
  }
  function T(v) {
    const A = [];
    if (v.shaderID ? A.push(v.shaderID) : (A.push(v.customVertexShaderID), A.push(v.customFragmentShaderID)), v.defines !== void 0)
      for (const W in v.defines)
        A.push(W), A.push(v.defines[W]);
    return v.isRawShaderMaterial === !1 && (S(A, v), E(A, v), A.push(s.outputColorSpace)), A.push(v.customProgramCacheKey), A.join();
  }
  function S(v, A) {
    v.push(A.precision), v.push(A.outputColorSpace), v.push(A.envMapMode), v.push(A.envMapCubeUVHeight), v.push(A.mapUv), v.push(A.alphaMapUv), v.push(A.lightMapUv), v.push(A.aoMapUv), v.push(A.bumpMapUv), v.push(A.normalMapUv), v.push(A.displacementMapUv), v.push(A.emissiveMapUv), v.push(A.metalnessMapUv), v.push(A.roughnessMapUv), v.push(A.anisotropyMapUv), v.push(A.clearcoatMapUv), v.push(A.clearcoatNormalMapUv), v.push(A.clearcoatRoughnessMapUv), v.push(A.iridescenceMapUv), v.push(A.iridescenceThicknessMapUv), v.push(A.sheenColorMapUv), v.push(A.sheenRoughnessMapUv), v.push(A.specularMapUv), v.push(A.specularColorMapUv), v.push(A.specularIntensityMapUv), v.push(A.transmissionMapUv), v.push(A.thicknessMapUv), v.push(A.combine), v.push(A.fogExp2), v.push(A.sizeAttenuation), v.push(A.morphTargetsCount), v.push(A.morphAttributeCount), v.push(A.numDirLights), v.push(A.numPointLights), v.push(A.numSpotLights), v.push(A.numSpotLightMaps), v.push(A.numHemiLights), v.push(A.numRectAreaLights), v.push(A.numDirLightShadows), v.push(A.numPointLightShadows), v.push(A.numSpotLightShadows), v.push(A.numSpotLightShadowsWithMaps), v.push(A.numLightProbes), v.push(A.shadowMapType), v.push(A.toneMapping), v.push(A.numClippingPlanes), v.push(A.numClipIntersection), v.push(A.depthPacking);
  }
  function E(v, A) {
    o.disableAll(), A.supportsVertexTextures && o.enable(0), A.instancing && o.enable(1), A.instancingColor && o.enable(2), A.instancingMorph && o.enable(3), A.matcap && o.enable(4), A.envMap && o.enable(5), A.normalMapObjectSpace && o.enable(6), A.normalMapTangentSpace && o.enable(7), A.clearcoat && o.enable(8), A.iridescence && o.enable(9), A.alphaTest && o.enable(10), A.vertexColors && o.enable(11), A.vertexAlphas && o.enable(12), A.vertexUv1s && o.enable(13), A.vertexUv2s && o.enable(14), A.vertexUv3s && o.enable(15), A.vertexTangents && o.enable(16), A.anisotropy && o.enable(17), A.alphaHash && o.enable(18), A.batching && o.enable(19), A.dispersion && o.enable(20), A.batchingColor && o.enable(21), v.push(o.mask), o.disableAll(), A.fog && o.enable(0), A.useFog && o.enable(1), A.flatShading && o.enable(2), A.logarithmicDepthBuffer && o.enable(3), A.reverseDepthBuffer && o.enable(4), A.skinning && o.enable(5), A.morphTargets && o.enable(6), A.morphNormals && o.enable(7), A.morphColors && o.enable(8), A.premultipliedAlpha && o.enable(9), A.shadowMapEnabled && o.enable(10), A.doubleSided && o.enable(11), A.flipSided && o.enable(12), A.useDepthPacking && o.enable(13), A.dithering && o.enable(14), A.transmission && o.enable(15), A.sheen && o.enable(16), A.opaque && o.enable(17), A.pointsUvs && o.enable(18), A.decodeVideoTexture && o.enable(19), A.alphaToCoverage && o.enable(20), v.push(o.mask);
  }
  function F(v) {
    const A = x[v.type];
    let W;
    if (A) {
      const q = Rn[A];
      W = Kl.clone(q.uniforms);
    } else
      W = v.uniforms;
    return W;
  }
  function P(v, A) {
    let W;
    for (let q = 0, Y = u.length; q < Y; q++) {
      const se = u[q];
      if (se.cacheKey === A) {
        W = se, ++W.usedTimes;
        break;
      }
    }
    return W === void 0 && (W = new lp(s, A, v, r), u.push(W)), W;
  }
  function L(v) {
    if (--v.usedTimes === 0) {
      const A = u.indexOf(v);
      u[A] = u[u.length - 1], u.pop(), v.destroy();
    }
  }
  function z(v) {
    c.remove(v);
  }
  function ee() {
    c.dispose();
  }
  return {
    getParameters: m,
    getProgramCacheKey: T,
    getUniforms: F,
    acquireProgram: P,
    releaseProgram: L,
    releaseShaderCache: z,
    // Exposed for resource monitoring & error feedback via renderer.info:
    programs: u,
    dispose: ee
  };
}
function pp() {
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
function mp(s, e) {
  return s.groupOrder !== e.groupOrder ? s.groupOrder - e.groupOrder : s.renderOrder !== e.renderOrder ? s.renderOrder - e.renderOrder : s.material.id !== e.material.id ? s.material.id - e.material.id : s.z !== e.z ? s.z - e.z : s.id - e.id;
}
function Uo(s, e) {
  return s.groupOrder !== e.groupOrder ? s.groupOrder - e.groupOrder : s.renderOrder !== e.renderOrder ? s.renderOrder - e.renderOrder : s.z !== e.z ? e.z - s.z : s.id - e.id;
}
function No() {
  const s = [];
  let e = 0;
  const t = [], n = [], i = [];
  function r() {
    e = 0, t.length = 0, n.length = 0, i.length = 0;
  }
  function a(h, d, f, g, x, p) {
    let m = s[e];
    return m === void 0 ? (m = {
      id: h.id,
      object: h,
      geometry: d,
      material: f,
      groupOrder: g,
      renderOrder: h.renderOrder,
      z: x,
      group: p
    }, s[e] = m) : (m.id = h.id, m.object = h, m.geometry = d, m.material = f, m.groupOrder = g, m.renderOrder = h.renderOrder, m.z = x, m.group = p), e++, m;
  }
  function o(h, d, f, g, x, p) {
    const m = a(h, d, f, g, x, p);
    f.transmission > 0 ? n.push(m) : f.transparent === !0 ? i.push(m) : t.push(m);
  }
  function c(h, d, f, g, x, p) {
    const m = a(h, d, f, g, x, p);
    f.transmission > 0 ? n.unshift(m) : f.transparent === !0 ? i.unshift(m) : t.unshift(m);
  }
  function l(h, d) {
    t.length > 1 && t.sort(h || mp), n.length > 1 && n.sort(d || Uo), i.length > 1 && i.sort(d || Uo);
  }
  function u() {
    for (let h = e, d = s.length; h < d; h++) {
      const f = s[h];
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
    finish: u,
    sort: l
  };
}
function gp() {
  let s = /* @__PURE__ */ new WeakMap();
  function e(n, i) {
    const r = s.get(n);
    let a;
    return r === void 0 ? (a = new No(), s.set(n, [a])) : i >= r.length ? (a = new No(), r.push(a)) : a = r[i], a;
  }
  function t() {
    s = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: e,
    dispose: t
  };
}
function _p() {
  const s = {};
  return {
    get: function(e) {
      if (s[e.id] !== void 0)
        return s[e.id];
      let t;
      switch (e.type) {
        case "DirectionalLight":
          t = {
            direction: new N(),
            color: new De()
          };
          break;
        case "SpotLight":
          t = {
            position: new N(),
            direction: new N(),
            color: new De(),
            distance: 0,
            coneCos: 0,
            penumbraCos: 0,
            decay: 0
          };
          break;
        case "PointLight":
          t = {
            position: new N(),
            color: new De(),
            distance: 0,
            decay: 0
          };
          break;
        case "HemisphereLight":
          t = {
            direction: new N(),
            skyColor: new De(),
            groundColor: new De()
          };
          break;
        case "RectAreaLight":
          t = {
            color: new De(),
            position: new N(),
            halfWidth: new N(),
            halfHeight: new N()
          };
          break;
      }
      return s[e.id] = t, t;
    }
  };
}
function xp() {
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
            shadowMapSize: new qe()
          };
          break;
        case "SpotLight":
          t = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new qe()
          };
          break;
        case "PointLight":
          t = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new qe(),
            shadowCameraNear: 1,
            shadowCameraFar: 1e3
          };
          break;
      }
      return s[e.id] = t, t;
    }
  };
}
let vp = 0;
function Mp(s, e) {
  return (e.castShadow ? 2 : 0) - (s.castShadow ? 2 : 0) + (e.map ? 1 : 0) - (s.map ? 1 : 0);
}
function yp(s) {
  const e = new _p(), t = xp(), n = {
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
  for (let l = 0; l < 9; l++) n.probe.push(new N());
  const i = new N(), r = new je(), a = new je();
  function o(l) {
    let u = 0, h = 0, d = 0;
    for (let ee = 0; ee < 9; ee++) n.probe[ee].set(0, 0, 0);
    let f = 0, g = 0, x = 0, p = 0, m = 0, T = 0, S = 0, E = 0, F = 0, P = 0, L = 0;
    l.sort(Mp);
    for (let ee = 0, v = l.length; ee < v; ee++) {
      const A = l[ee], W = A.color, q = A.intensity, Y = A.distance, se = A.shadow && A.shadow.map ? A.shadow.map.texture : null;
      if (A.isAmbientLight)
        u += W.r * q, h += W.g * q, d += W.b * q;
      else if (A.isLightProbe) {
        for (let j = 0; j < 9; j++)
          n.probe[j].addScaledVector(A.sh.coefficients[j], q);
        L++;
      } else if (A.isDirectionalLight) {
        const j = e.get(A);
        if (j.color.copy(A.color).multiplyScalar(A.intensity), A.castShadow) {
          const he = A.shadow, X = t.get(A);
          X.shadowIntensity = he.intensity, X.shadowBias = he.bias, X.shadowNormalBias = he.normalBias, X.shadowRadius = he.radius, X.shadowMapSize = he.mapSize, n.directionalShadow[f] = X, n.directionalShadowMap[f] = se, n.directionalShadowMatrix[f] = A.shadow.matrix, T++;
        }
        n.directional[f] = j, f++;
      } else if (A.isSpotLight) {
        const j = e.get(A);
        j.position.setFromMatrixPosition(A.matrixWorld), j.color.copy(W).multiplyScalar(q), j.distance = Y, j.coneCos = Math.cos(A.angle), j.penumbraCos = Math.cos(A.angle * (1 - A.penumbra)), j.decay = A.decay, n.spot[x] = j;
        const he = A.shadow;
        if (A.map && (n.spotLightMap[F] = A.map, F++, he.updateMatrices(A), A.castShadow && P++), n.spotLightMatrix[x] = he.matrix, A.castShadow) {
          const X = t.get(A);
          X.shadowIntensity = he.intensity, X.shadowBias = he.bias, X.shadowNormalBias = he.normalBias, X.shadowRadius = he.radius, X.shadowMapSize = he.mapSize, n.spotShadow[x] = X, n.spotShadowMap[x] = se, E++;
        }
        x++;
      } else if (A.isRectAreaLight) {
        const j = e.get(A);
        j.color.copy(W).multiplyScalar(q), j.halfWidth.set(A.width * 0.5, 0, 0), j.halfHeight.set(0, A.height * 0.5, 0), n.rectArea[p] = j, p++;
      } else if (A.isPointLight) {
        const j = e.get(A);
        if (j.color.copy(A.color).multiplyScalar(A.intensity), j.distance = A.distance, j.decay = A.decay, A.castShadow) {
          const he = A.shadow, X = t.get(A);
          X.shadowIntensity = he.intensity, X.shadowBias = he.bias, X.shadowNormalBias = he.normalBias, X.shadowRadius = he.radius, X.shadowMapSize = he.mapSize, X.shadowCameraNear = he.camera.near, X.shadowCameraFar = he.camera.far, n.pointShadow[g] = X, n.pointShadowMap[g] = se, n.pointShadowMatrix[g] = A.shadow.matrix, S++;
        }
        n.point[g] = j, g++;
      } else if (A.isHemisphereLight) {
        const j = e.get(A);
        j.skyColor.copy(A.color).multiplyScalar(q), j.groundColor.copy(A.groundColor).multiplyScalar(q), n.hemi[m] = j, m++;
      }
    }
    p > 0 && (s.has("OES_texture_float_linear") === !0 ? (n.rectAreaLTC1 = me.LTC_FLOAT_1, n.rectAreaLTC2 = me.LTC_FLOAT_2) : (n.rectAreaLTC1 = me.LTC_HALF_1, n.rectAreaLTC2 = me.LTC_HALF_2)), n.ambient[0] = u, n.ambient[1] = h, n.ambient[2] = d;
    const z = n.hash;
    (z.directionalLength !== f || z.pointLength !== g || z.spotLength !== x || z.rectAreaLength !== p || z.hemiLength !== m || z.numDirectionalShadows !== T || z.numPointShadows !== S || z.numSpotShadows !== E || z.numSpotMaps !== F || z.numLightProbes !== L) && (n.directional.length = f, n.spot.length = x, n.rectArea.length = p, n.point.length = g, n.hemi.length = m, n.directionalShadow.length = T, n.directionalShadowMap.length = T, n.pointShadow.length = S, n.pointShadowMap.length = S, n.spotShadow.length = E, n.spotShadowMap.length = E, n.directionalShadowMatrix.length = T, n.pointShadowMatrix.length = S, n.spotLightMatrix.length = E + F - P, n.spotLightMap.length = F, n.numSpotLightShadowsWithMaps = P, n.numLightProbes = L, z.directionalLength = f, z.pointLength = g, z.spotLength = x, z.rectAreaLength = p, z.hemiLength = m, z.numDirectionalShadows = T, z.numPointShadows = S, z.numSpotShadows = E, z.numSpotMaps = F, z.numLightProbes = L, n.version = vp++);
  }
  function c(l, u) {
    let h = 0, d = 0, f = 0, g = 0, x = 0;
    const p = u.matrixWorldInverse;
    for (let m = 0, T = l.length; m < T; m++) {
      const S = l[m];
      if (S.isDirectionalLight) {
        const E = n.directional[h];
        E.direction.setFromMatrixPosition(S.matrixWorld), i.setFromMatrixPosition(S.target.matrixWorld), E.direction.sub(i), E.direction.transformDirection(p), h++;
      } else if (S.isSpotLight) {
        const E = n.spot[f];
        E.position.setFromMatrixPosition(S.matrixWorld), E.position.applyMatrix4(p), E.direction.setFromMatrixPosition(S.matrixWorld), i.setFromMatrixPosition(S.target.matrixWorld), E.direction.sub(i), E.direction.transformDirection(p), f++;
      } else if (S.isRectAreaLight) {
        const E = n.rectArea[g];
        E.position.setFromMatrixPosition(S.matrixWorld), E.position.applyMatrix4(p), a.identity(), r.copy(S.matrixWorld), r.premultiply(p), a.extractRotation(r), E.halfWidth.set(S.width * 0.5, 0, 0), E.halfHeight.set(0, S.height * 0.5, 0), E.halfWidth.applyMatrix4(a), E.halfHeight.applyMatrix4(a), g++;
      } else if (S.isPointLight) {
        const E = n.point[d];
        E.position.setFromMatrixPosition(S.matrixWorld), E.position.applyMatrix4(p), d++;
      } else if (S.isHemisphereLight) {
        const E = n.hemi[x];
        E.direction.setFromMatrixPosition(S.matrixWorld), E.direction.transformDirection(p), x++;
      }
    }
  }
  return {
    setup: o,
    setupView: c,
    state: n
  };
}
function Fo(s) {
  const e = new yp(s), t = [], n = [];
  function i(u) {
    l.camera = u, t.length = 0, n.length = 0;
  }
  function r(u) {
    t.push(u);
  }
  function a(u) {
    n.push(u);
  }
  function o() {
    e.setup(t);
  }
  function c(u) {
    e.setupView(t, u);
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
function Sp(s) {
  let e = /* @__PURE__ */ new WeakMap();
  function t(i, r = 0) {
    const a = e.get(i);
    let o;
    return a === void 0 ? (o = new Fo(s), e.set(i, [o])) : r >= a.length ? (o = new Fo(s), a.push(o)) : o = a[r], o;
  }
  function n() {
    e = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: t,
    dispose: n
  };
}
class Ep extends rn {
  constructor(e) {
    super(), this.isMeshDepthMaterial = !0, this.type = "MeshDepthMaterial", this.depthPacking = 3200, this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.wireframe = !1, this.wireframeLinewidth = 1, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.depthPacking = e.depthPacking, this.map = e.map, this.alphaMap = e.alphaMap, this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this;
  }
}
class Tp extends rn {
  constructor(e) {
    super(), this.isMeshDistanceMaterial = !0, this.type = "MeshDistanceMaterial", this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.map = e.map, this.alphaMap = e.alphaMap, this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this;
  }
}
const Ap = `void main() {
	gl_Position = vec4( position, 1.0 );
}`, bp = `uniform sampler2D shadow_pass;
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
function wp(s, e, t) {
  let n = new ba();
  const i = new qe(), r = new qe(), a = new ut(), o = new Ep({ depthPacking: 3201 }), c = new Tp(), l = {}, u = t.maxTextureSize, h = { 0: 1, 1: 0, 2: 2 }, d = new Qn({
    defines: {
      VSM_SAMPLES: 8
    },
    uniforms: {
      shadow_pass: { value: null },
      resolution: { value: new qe() },
      radius: { value: 4 }
    },
    vertexShader: Ap,
    fragmentShader: bp
  }), f = d.clone();
  f.defines.HORIZONTAL_PASS = 1;
  const g = new Rt();
  g.setAttribute(
    "position",
    new Jt(
      new Float32Array([-1, -1, 0.5, 3, -1, 0.5, -1, 3, 0.5]),
      3
    )
  );
  const x = new Le(g, d), p = this;
  this.enabled = !1, this.autoUpdate = !0, this.needsUpdate = !1, this.type = 1;
  let m = this.type;
  this.render = function(P, L, z) {
    if (p.enabled === !1 || p.autoUpdate === !1 && p.needsUpdate === !1 || P.length === 0) return;
    const ee = s.getRenderTarget(), v = s.getActiveCubeFace(), A = s.getActiveMipmapLevel(), W = s.state;
    W.setBlending(0), W.buffers.color.setClear(1, 1, 1, 1), W.buffers.depth.setTest(!0), W.setScissorTest(!1);
    const q = m !== 3 && this.type === 3, Y = m === 3 && this.type !== 3;
    for (let se = 0, j = P.length; se < j; se++) {
      const he = P[se], X = he.shadow;
      if (X === void 0) {
        console.warn("THREE.WebGLShadowMap:", he, "has no shadow.");
        continue;
      }
      if (X.autoUpdate === !1 && X.needsUpdate === !1) continue;
      i.copy(X.mapSize);
      const xe = X.getFrameExtents();
      if (i.multiply(xe), r.copy(X.mapSize), (i.x > u || i.y > u) && (i.x > u && (r.x = Math.floor(u / xe.x), i.x = r.x * xe.x, X.mapSize.x = r.x), i.y > u && (r.y = Math.floor(u / xe.y), i.y = r.y * xe.y, X.mapSize.y = r.y)), X.map === null || q === !0 || Y === !0) {
        const we = this.type !== 3 ? { minFilter: 1003, magFilter: 1003 } : {};
        X.map !== null && X.map.dispose(), X.map = new _i(i.x, i.y, we), X.map.texture.name = he.name + ".shadowMap", X.camera.updateProjectionMatrix();
      }
      s.setRenderTarget(X.map), s.clear();
      const ve = X.getViewportCount();
      for (let we = 0; we < ve; we++) {
        const Qe = X.getViewport(we);
        a.set(
          r.x * Qe.x,
          r.y * Qe.y,
          r.x * Qe.z,
          r.y * Qe.w
        ), W.viewport(a), X.updateMatrices(he, we), n = X.getFrustum(), E(L, z, X.camera, he, this.type);
      }
      X.isPointLightShadow !== !0 && this.type === 3 && T(X, z), X.needsUpdate = !1;
    }
    m = this.type, p.needsUpdate = !1, s.setRenderTarget(ee, v, A);
  };
  function T(P, L) {
    const z = e.update(x);
    d.defines.VSM_SAMPLES !== P.blurSamples && (d.defines.VSM_SAMPLES = P.blurSamples, f.defines.VSM_SAMPLES = P.blurSamples, d.needsUpdate = !0, f.needsUpdate = !0), P.mapPass === null && (P.mapPass = new _i(i.x, i.y)), d.uniforms.shadow_pass.value = P.map.texture, d.uniforms.resolution.value = P.mapSize, d.uniforms.radius.value = P.radius, s.setRenderTarget(P.mapPass), s.clear(), s.renderBufferDirect(L, null, z, d, x, null), f.uniforms.shadow_pass.value = P.mapPass.texture, f.uniforms.resolution.value = P.mapSize, f.uniforms.radius.value = P.radius, s.setRenderTarget(P.map), s.clear(), s.renderBufferDirect(L, null, z, f, x, null);
  }
  function S(P, L, z, ee) {
    let v = null;
    const A = z.isPointLight === !0 ? P.customDistanceMaterial : P.customDepthMaterial;
    if (A !== void 0)
      v = A;
    else if (v = z.isPointLight === !0 ? c : o, s.localClippingEnabled && L.clipShadows === !0 && Array.isArray(L.clippingPlanes) && L.clippingPlanes.length !== 0 || L.displacementMap && L.displacementScale !== 0 || L.alphaMap && L.alphaTest > 0 || L.map && L.alphaTest > 0) {
      const W = v.uuid, q = L.uuid;
      let Y = l[W];
      Y === void 0 && (Y = {}, l[W] = Y);
      let se = Y[q];
      se === void 0 && (se = v.clone(), Y[q] = se, L.addEventListener("dispose", F)), v = se;
    }
    if (v.visible = L.visible, v.wireframe = L.wireframe, ee === 3 ? v.side = L.shadowSide !== null ? L.shadowSide : L.side : v.side = L.shadowSide !== null ? L.shadowSide : h[L.side], v.alphaMap = L.alphaMap, v.alphaTest = L.alphaTest, v.map = L.map, v.clipShadows = L.clipShadows, v.clippingPlanes = L.clippingPlanes, v.clipIntersection = L.clipIntersection, v.displacementMap = L.displacementMap, v.displacementScale = L.displacementScale, v.displacementBias = L.displacementBias, v.wireframeLinewidth = L.wireframeLinewidth, v.linewidth = L.linewidth, z.isPointLight === !0 && v.isMeshDistanceMaterial === !0) {
      const W = s.properties.get(v);
      W.light = z;
    }
    return v;
  }
  function E(P, L, z, ee, v) {
    if (P.visible === !1) return;
    if (P.layers.test(L.layers) && (P.isMesh || P.isLine || P.isPoints) && (P.castShadow || P.receiveShadow && v === 3) && (!P.frustumCulled || n.intersectsObject(P))) {
      P.modelViewMatrix.multiplyMatrices(z.matrixWorldInverse, P.matrixWorld);
      const q = e.update(P), Y = P.material;
      if (Array.isArray(Y)) {
        const se = q.groups;
        for (let j = 0, he = se.length; j < he; j++) {
          const X = se[j], xe = Y[X.materialIndex];
          if (xe && xe.visible) {
            const ve = S(P, xe, ee, v);
            P.onBeforeShadow(s, P, L, z, q, ve, X), s.renderBufferDirect(z, null, q, ve, P, X), P.onAfterShadow(s, P, L, z, q, ve, X);
          }
        }
      } else if (Y.visible) {
        const se = S(P, Y, ee, v);
        P.onBeforeShadow(s, P, L, z, q, se, null), s.renderBufferDirect(z, null, q, se, P, null), P.onAfterShadow(s, P, L, z, q, se, null);
      }
    }
    const W = P.children;
    for (let q = 0, Y = W.length; q < Y; q++)
      E(W[q], L, z, ee, v);
  }
  function F(P) {
    P.target.removeEventListener("dispose", F);
    for (const z in l) {
      const ee = l[z], v = P.target.uuid;
      v in ee && (ee[v].dispose(), delete ee[v]);
    }
  }
}
const Rp = {
  0: 1,
  2: 6,
  4: 7,
  3: 5,
  1: 0,
  6: 2,
  7: 4,
  5: 3
};
function Cp(s) {
  function e() {
    let B = !1;
    const fe = new ut();
    let K = null;
    const te = new ut(0, 0, 0, 0);
    return {
      setMask: function(ge) {
        K !== ge && !B && (s.colorMask(ge, ge, ge, ge), K = ge);
      },
      setLocked: function(ge) {
        B = ge;
      },
      setClear: function(ge, _e, $e, bt, Dt) {
        Dt === !0 && (ge *= bt, _e *= bt, $e *= bt), fe.set(ge, _e, $e, bt), te.equals(fe) === !1 && (s.clearColor(ge, _e, $e, bt), te.copy(fe));
      },
      reset: function() {
        B = !1, K = null, te.set(-1, 0, 0, 0);
      }
    };
  }
  function t() {
    let B = !1, fe = !1, K = null, te = null, ge = null;
    return {
      setReversed: function(_e) {
        fe = _e;
      },
      setTest: function(_e) {
        _e ? Te(s.DEPTH_TEST) : ye(s.DEPTH_TEST);
      },
      setMask: function(_e) {
        K !== _e && !B && (s.depthMask(_e), K = _e);
      },
      setFunc: function(_e) {
        if (fe && (_e = Rp[_e]), te !== _e) {
          switch (_e) {
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
          te = _e;
        }
      },
      setLocked: function(_e) {
        B = _e;
      },
      setClear: function(_e) {
        ge !== _e && (s.clearDepth(_e), ge = _e);
      },
      reset: function() {
        B = !1, K = null, te = null, ge = null;
      }
    };
  }
  function n() {
    let B = !1, fe = null, K = null, te = null, ge = null, _e = null, $e = null, bt = null, Dt = null;
    return {
      setTest: function(st) {
        B || (st ? Te(s.STENCIL_TEST) : ye(s.STENCIL_TEST));
      },
      setMask: function(st) {
        fe !== st && !B && (s.stencilMask(st), fe = st);
      },
      setFunc: function(st, Ct, Qt) {
        (K !== st || te !== Ct || ge !== Qt) && (s.stencilFunc(st, Ct, Qt), K = st, te = Ct, ge = Qt);
      },
      setOp: function(st, Ct, Qt) {
        (_e !== st || $e !== Ct || bt !== Qt) && (s.stencilOp(st, Ct, Qt), _e = st, $e = Ct, bt = Qt);
      },
      setLocked: function(st) {
        B = st;
      },
      setClear: function(st) {
        Dt !== st && (s.clearStencil(st), Dt = st);
      },
      reset: function() {
        B = !1, fe = null, K = null, te = null, ge = null, _e = null, $e = null, bt = null, Dt = null;
      }
    };
  }
  const i = new e(), r = new t(), a = new n(), o = /* @__PURE__ */ new WeakMap(), c = /* @__PURE__ */ new WeakMap();
  let l = {}, u = {}, h = /* @__PURE__ */ new WeakMap(), d = [], f = null, g = !1, x = null, p = null, m = null, T = null, S = null, E = null, F = null, P = new De(0, 0, 0), L = 0, z = !1, ee = null, v = null, A = null, W = null, q = null;
  const Y = s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
  let se = !1, j = 0;
  const he = s.getParameter(s.VERSION);
  he.indexOf("WebGL") !== -1 ? (j = parseFloat(/^WebGL (\d)/.exec(he)[1]), se = j >= 1) : he.indexOf("OpenGL ES") !== -1 && (j = parseFloat(/^OpenGL ES (\d)/.exec(he)[1]), se = j >= 2);
  let X = null, xe = {};
  const ve = s.getParameter(s.SCISSOR_BOX), we = s.getParameter(s.VIEWPORT), Qe = new ut().fromArray(ve), ht = new ut().fromArray(we);
  function Z(B, fe, K, te) {
    const ge = new Uint8Array(4), _e = s.createTexture();
    s.bindTexture(B, _e), s.texParameteri(B, s.TEXTURE_MIN_FILTER, s.NEAREST), s.texParameteri(B, s.TEXTURE_MAG_FILTER, s.NEAREST);
    for (let $e = 0; $e < K; $e++)
      B === s.TEXTURE_3D || B === s.TEXTURE_2D_ARRAY ? s.texImage3D(fe, 0, s.RGBA, 1, 1, te, 0, s.RGBA, s.UNSIGNED_BYTE, ge) : s.texImage2D(fe + $e, 0, s.RGBA, 1, 1, 0, s.RGBA, s.UNSIGNED_BYTE, ge);
    return _e;
  }
  const ce = {};
  ce[s.TEXTURE_2D] = Z(s.TEXTURE_2D, s.TEXTURE_2D, 1), ce[s.TEXTURE_CUBE_MAP] = Z(s.TEXTURE_CUBE_MAP, s.TEXTURE_CUBE_MAP_POSITIVE_X, 6), ce[s.TEXTURE_2D_ARRAY] = Z(s.TEXTURE_2D_ARRAY, s.TEXTURE_2D_ARRAY, 1, 1), ce[s.TEXTURE_3D] = Z(s.TEXTURE_3D, s.TEXTURE_3D, 1, 1), i.setClear(0, 0, 0, 1), r.setClear(1), a.setClear(0), Te(s.DEPTH_TEST), r.setFunc(3), Ze(!1), it(1), Te(s.CULL_FACE), U(0);
  function Te(B) {
    l[B] !== !0 && (s.enable(B), l[B] = !0);
  }
  function ye(B) {
    l[B] !== !1 && (s.disable(B), l[B] = !1);
  }
  function Xe(B, fe) {
    return u[B] !== fe ? (s.bindFramebuffer(B, fe), u[B] = fe, B === s.DRAW_FRAMEBUFFER && (u[s.FRAMEBUFFER] = fe), B === s.FRAMEBUFFER && (u[s.DRAW_FRAMEBUFFER] = fe), !0) : !1;
  }
  function Be(B, fe) {
    let K = d, te = !1;
    if (B) {
      K = h.get(fe), K === void 0 && (K = [], h.set(fe, K));
      const ge = B.textures;
      if (K.length !== ge.length || K[0] !== s.COLOR_ATTACHMENT0) {
        for (let _e = 0, $e = ge.length; _e < $e; _e++)
          K[_e] = s.COLOR_ATTACHMENT0 + _e;
        K.length = ge.length, te = !0;
      }
    } else
      K[0] !== s.BACK && (K[0] = s.BACK, te = !0);
    te && s.drawBuffers(K);
  }
  function et(B) {
    return f !== B ? (s.useProgram(B), f = B, !0) : !1;
  }
  const ft = {
    100: s.FUNC_ADD,
    101: s.FUNC_SUBTRACT,
    102: s.FUNC_REVERSE_SUBTRACT
  };
  ft[103] = s.MIN, ft[104] = s.MAX;
  const nt = {
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
  function U(B, fe, K, te, ge, _e, $e, bt, Dt, st) {
    if (B === 0) {
      g === !0 && (ye(s.BLEND), g = !1);
      return;
    }
    if (g === !1 && (Te(s.BLEND), g = !0), B !== 5) {
      if (B !== x || st !== z) {
        if ((p !== 100 || S !== 100) && (s.blendEquation(s.FUNC_ADD), p = 100, S = 100), st)
          switch (B) {
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
              console.error("THREE.WebGLState: Invalid blending: ", B);
              break;
          }
        else
          switch (B) {
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
              console.error("THREE.WebGLState: Invalid blending: ", B);
              break;
          }
        m = null, T = null, E = null, F = null, P.set(0, 0, 0), L = 0, x = B, z = st;
      }
      return;
    }
    ge = ge || fe, _e = _e || K, $e = $e || te, (fe !== p || ge !== S) && (s.blendEquationSeparate(ft[fe], ft[ge]), p = fe, S = ge), (K !== m || te !== T || _e !== E || $e !== F) && (s.blendFuncSeparate(nt[K], nt[te], nt[_e], nt[$e]), m = K, T = te, E = _e, F = $e), (bt.equals(P) === !1 || Dt !== L) && (s.blendColor(bt.r, bt.g, bt.b, Dt), P.copy(bt), L = Dt), x = B, z = !1;
  }
  function Vt(B, fe) {
    B.side === 2 ? ye(s.CULL_FACE) : Te(s.CULL_FACE);
    let K = B.side === 1;
    fe && (K = !K), Ze(K), B.blending === 1 && B.transparent === !1 ? U(0) : U(B.blending, B.blendEquation, B.blendSrc, B.blendDst, B.blendEquationAlpha, B.blendSrcAlpha, B.blendDstAlpha, B.blendColor, B.blendAlpha, B.premultipliedAlpha), r.setFunc(B.depthFunc), r.setTest(B.depthTest), r.setMask(B.depthWrite), i.setMask(B.colorWrite);
    const te = B.stencilWrite;
    a.setTest(te), te && (a.setMask(B.stencilWriteMask), a.setFunc(B.stencilFunc, B.stencilRef, B.stencilFuncMask), a.setOp(B.stencilFail, B.stencilZFail, B.stencilZPass)), _t(B.polygonOffset, B.polygonOffsetFactor, B.polygonOffsetUnits), B.alphaToCoverage === !0 ? Te(s.SAMPLE_ALPHA_TO_COVERAGE) : ye(s.SAMPLE_ALPHA_TO_COVERAGE);
  }
  function Ze(B) {
    ee !== B && (B ? s.frontFace(s.CW) : s.frontFace(s.CCW), ee = B);
  }
  function it(B) {
    B !== 0 ? (Te(s.CULL_FACE), B !== v && (B === 1 ? s.cullFace(s.BACK) : B === 2 ? s.cullFace(s.FRONT) : s.cullFace(s.FRONT_AND_BACK))) : ye(s.CULL_FACE), v = B;
  }
  function Ne(B) {
    B !== A && (se && s.lineWidth(B), A = B);
  }
  function _t(B, fe, K) {
    B ? (Te(s.POLYGON_OFFSET_FILL), (W !== fe || q !== K) && (s.polygonOffset(fe, K), W = fe, q = K)) : ye(s.POLYGON_OFFSET_FILL);
  }
  function Oe(B) {
    B ? Te(s.SCISSOR_TEST) : ye(s.SCISSOR_TEST);
  }
  function C(B) {
    B === void 0 && (B = s.TEXTURE0 + Y - 1), X !== B && (s.activeTexture(B), X = B);
  }
  function M(B, fe, K) {
    K === void 0 && (X === null ? K = s.TEXTURE0 + Y - 1 : K = X);
    let te = xe[K];
    te === void 0 && (te = { type: void 0, texture: void 0 }, xe[K] = te), (te.type !== B || te.texture !== fe) && (X !== K && (s.activeTexture(K), X = K), s.bindTexture(B, fe || ce[B]), te.type = B, te.texture = fe);
  }
  function G() {
    const B = xe[X];
    B !== void 0 && B.type !== void 0 && (s.bindTexture(B.type, null), B.type = void 0, B.texture = void 0);
  }
  function $() {
    try {
      s.compressedTexImage2D.apply(s, arguments);
    } catch (B) {
      console.error("THREE.WebGLState:", B);
    }
  }
  function re() {
    try {
      s.compressedTexImage3D.apply(s, arguments);
    } catch (B) {
      console.error("THREE.WebGLState:", B);
    }
  }
  function J() {
    try {
      s.texSubImage2D.apply(s, arguments);
    } catch (B) {
      console.error("THREE.WebGLState:", B);
    }
  }
  function Re() {
    try {
      s.texSubImage3D.apply(s, arguments);
    } catch (B) {
      console.error("THREE.WebGLState:", B);
    }
  }
  function ie() {
    try {
      s.compressedTexSubImage2D.apply(s, arguments);
    } catch (B) {
      console.error("THREE.WebGLState:", B);
    }
  }
  function ae() {
    try {
      s.compressedTexSubImage3D.apply(s, arguments);
    } catch (B) {
      console.error("THREE.WebGLState:", B);
    }
  }
  function D() {
    try {
      s.texStorage2D.apply(s, arguments);
    } catch (B) {
      console.error("THREE.WebGLState:", B);
    }
  }
  function ue() {
    try {
      s.texStorage3D.apply(s, arguments);
    } catch (B) {
      console.error("THREE.WebGLState:", B);
    }
  }
  function Ee() {
    try {
      s.texImage2D.apply(s, arguments);
    } catch (B) {
      console.error("THREE.WebGLState:", B);
    }
  }
  function Ge() {
    try {
      s.texImage3D.apply(s, arguments);
    } catch (B) {
      console.error("THREE.WebGLState:", B);
    }
  }
  function He(B) {
    Qe.equals(B) === !1 && (s.scissor(B.x, B.y, B.z, B.w), Qe.copy(B));
  }
  function Se(B) {
    ht.equals(B) === !1 && (s.viewport(B.x, B.y, B.z, B.w), ht.copy(B));
  }
  function tt(B, fe) {
    let K = c.get(fe);
    K === void 0 && (K = /* @__PURE__ */ new WeakMap(), c.set(fe, K));
    let te = K.get(B);
    te === void 0 && (te = s.getUniformBlockIndex(fe, B.name), K.set(B, te));
  }
  function Ve(B, fe) {
    const te = c.get(fe).get(B);
    o.get(fe) !== te && (s.uniformBlockBinding(fe, te, B.__bindingPointIndex), o.set(fe, te));
  }
  function xt() {
    s.disable(s.BLEND), s.disable(s.CULL_FACE), s.disable(s.DEPTH_TEST), s.disable(s.POLYGON_OFFSET_FILL), s.disable(s.SCISSOR_TEST), s.disable(s.STENCIL_TEST), s.disable(s.SAMPLE_ALPHA_TO_COVERAGE), s.blendEquation(s.FUNC_ADD), s.blendFunc(s.ONE, s.ZERO), s.blendFuncSeparate(s.ONE, s.ZERO, s.ONE, s.ZERO), s.blendColor(0, 0, 0, 0), s.colorMask(!0, !0, !0, !0), s.clearColor(0, 0, 0, 0), s.depthMask(!0), s.depthFunc(s.LESS), s.clearDepth(1), s.stencilMask(4294967295), s.stencilFunc(s.ALWAYS, 0, 4294967295), s.stencilOp(s.KEEP, s.KEEP, s.KEEP), s.clearStencil(0), s.cullFace(s.BACK), s.frontFace(s.CCW), s.polygonOffset(0, 0), s.activeTexture(s.TEXTURE0), s.bindFramebuffer(s.FRAMEBUFFER, null), s.bindFramebuffer(s.DRAW_FRAMEBUFFER, null), s.bindFramebuffer(s.READ_FRAMEBUFFER, null), s.useProgram(null), s.lineWidth(1), s.scissor(0, 0, s.canvas.width, s.canvas.height), s.viewport(0, 0, s.canvas.width, s.canvas.height), l = {}, X = null, xe = {}, u = {}, h = /* @__PURE__ */ new WeakMap(), d = [], f = null, g = !1, x = null, p = null, m = null, T = null, S = null, E = null, F = null, P = new De(0, 0, 0), L = 0, z = !1, ee = null, v = null, A = null, W = null, q = null, Qe.set(0, 0, s.canvas.width, s.canvas.height), ht.set(0, 0, s.canvas.width, s.canvas.height), i.reset(), r.reset(), a.reset();
  }
  return {
    buffers: {
      color: i,
      depth: r,
      stencil: a
    },
    enable: Te,
    disable: ye,
    bindFramebuffer: Xe,
    drawBuffers: Be,
    useProgram: et,
    setBlending: U,
    setMaterial: Vt,
    setFlipSided: Ze,
    setCullFace: it,
    setLineWidth: Ne,
    setPolygonOffset: _t,
    setScissorTest: Oe,
    activeTexture: C,
    bindTexture: M,
    unbindTexture: G,
    compressedTexImage2D: $,
    compressedTexImage3D: re,
    texImage2D: Ee,
    texImage3D: Ge,
    updateUBOMapping: tt,
    uniformBlockBinding: Ve,
    texStorage2D: D,
    texStorage3D: ue,
    texSubImage2D: J,
    texSubImage3D: Re,
    compressedTexSubImage2D: ie,
    compressedTexSubImage3D: ae,
    scissor: He,
    viewport: Se,
    reset: xt
  };
}
function Bo(s, e, t, n) {
  const i = Ip(n);
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
function Ip(s) {
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
function Pp(s, e, t, n, i, r, a) {
  const o = e.has("WEBGL_multisampled_render_to_texture") ? e.get("WEBGL_multisampled_render_to_texture") : null, c = typeof navigator > "u" ? !1 : /OculusBrowser/g.test(navigator.userAgent), l = new qe(), u = /* @__PURE__ */ new WeakMap();
  let h;
  const d = /* @__PURE__ */ new WeakMap();
  let f = !1;
  try {
    f = typeof OffscreenCanvas < "u" && new OffscreenCanvas(1, 1).getContext("2d") !== null;
  } catch {
  }
  function g(C, M) {
    return f ? (
      // eslint-disable-next-line compat/compat
      new OffscreenCanvas(C, M)
    ) : Ms("canvas");
  }
  function x(C, M, G) {
    let $ = 1;
    const re = Oe(C);
    if ((re.width > G || re.height > G) && ($ = G / Math.max(re.width, re.height)), $ < 1)
      if (typeof HTMLImageElement < "u" && C instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && C instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && C instanceof ImageBitmap || typeof VideoFrame < "u" && C instanceof VideoFrame) {
        const J = Math.floor($ * re.width), Re = Math.floor($ * re.height);
        h === void 0 && (h = g(J, Re));
        const ie = M ? g(J, Re) : h;
        return ie.width = J, ie.height = Re, ie.getContext("2d").drawImage(C, 0, 0, J, Re), console.warn("THREE.WebGLRenderer: Texture has been resized from (" + re.width + "x" + re.height + ") to (" + J + "x" + Re + ")."), ie;
      } else
        return "data" in C && console.warn("THREE.WebGLRenderer: Image in DataTexture is too big (" + re.width + "x" + re.height + ")."), C;
    return C;
  }
  function p(C) {
    return C.generateMipmaps && C.minFilter !== 1003 && C.minFilter !== 1006;
  }
  function m(C) {
    s.generateMipmap(C);
  }
  function T(C, M, G, $, re = !1) {
    if (C !== null) {
      if (s[C] !== void 0) return s[C];
      console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '" + C + "'");
    }
    let J = M;
    if (M === s.RED && (G === s.FLOAT && (J = s.R32F), G === s.HALF_FLOAT && (J = s.R16F), G === s.UNSIGNED_BYTE && (J = s.R8)), M === s.RED_INTEGER && (G === s.UNSIGNED_BYTE && (J = s.R8UI), G === s.UNSIGNED_SHORT && (J = s.R16UI), G === s.UNSIGNED_INT && (J = s.R32UI), G === s.BYTE && (J = s.R8I), G === s.SHORT && (J = s.R16I), G === s.INT && (J = s.R32I)), M === s.RG && (G === s.FLOAT && (J = s.RG32F), G === s.HALF_FLOAT && (J = s.RG16F), G === s.UNSIGNED_BYTE && (J = s.RG8)), M === s.RG_INTEGER && (G === s.UNSIGNED_BYTE && (J = s.RG8UI), G === s.UNSIGNED_SHORT && (J = s.RG16UI), G === s.UNSIGNED_INT && (J = s.RG32UI), G === s.BYTE && (J = s.RG8I), G === s.SHORT && (J = s.RG16I), G === s.INT && (J = s.RG32I)), M === s.RGB_INTEGER && (G === s.UNSIGNED_BYTE && (J = s.RGB8UI), G === s.UNSIGNED_SHORT && (J = s.RGB16UI), G === s.UNSIGNED_INT && (J = s.RGB32UI), G === s.BYTE && (J = s.RGB8I), G === s.SHORT && (J = s.RGB16I), G === s.INT && (J = s.RGB32I)), M === s.RGBA_INTEGER && (G === s.UNSIGNED_BYTE && (J = s.RGBA8UI), G === s.UNSIGNED_SHORT && (J = s.RGBA16UI), G === s.UNSIGNED_INT && (J = s.RGBA32UI), G === s.BYTE && (J = s.RGBA8I), G === s.SHORT && (J = s.RGBA16I), G === s.INT && (J = s.RGBA32I)), M === s.RGB && G === s.UNSIGNED_INT_5_9_9_9_REV && (J = s.RGB9_E5), M === s.RGBA) {
      const Re = re ? dr : at.getTransfer($);
      G === s.FLOAT && (J = s.RGBA32F), G === s.HALF_FLOAT && (J = s.RGBA16F), G === s.UNSIGNED_BYTE && (J = Re === Et ? s.SRGB8_ALPHA8 : s.RGBA8), G === s.UNSIGNED_SHORT_4_4_4_4 && (J = s.RGBA4), G === s.UNSIGNED_SHORT_5_5_5_1 && (J = s.RGB5_A1);
    }
    return (J === s.R16F || J === s.R32F || J === s.RG16F || J === s.RG32F || J === s.RGBA16F || J === s.RGBA32F) && e.get("EXT_color_buffer_float"), J;
  }
  function S(C, M) {
    let G;
    return C ? M === null || M === 1014 || M === 1020 ? G = s.DEPTH24_STENCIL8 : M === 1015 ? G = s.DEPTH32F_STENCIL8 : M === 1012 && (G = s.DEPTH24_STENCIL8, console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")) : M === null || M === 1014 || M === 1020 ? G = s.DEPTH_COMPONENT24 : M === 1015 ? G = s.DEPTH_COMPONENT32F : M === 1012 && (G = s.DEPTH_COMPONENT16), G;
  }
  function E(C, M) {
    return p(C) === !0 || C.isFramebufferTexture && C.minFilter !== 1003 && C.minFilter !== 1006 ? Math.log2(Math.max(M.width, M.height)) + 1 : C.mipmaps !== void 0 && C.mipmaps.length > 0 ? C.mipmaps.length : C.isCompressedTexture && Array.isArray(C.image) ? M.mipmaps.length : 1;
  }
  function F(C) {
    const M = C.target;
    M.removeEventListener("dispose", F), L(M), M.isVideoTexture && u.delete(M);
  }
  function P(C) {
    const M = C.target;
    M.removeEventListener("dispose", P), ee(M);
  }
  function L(C) {
    const M = n.get(C);
    if (M.__webglInit === void 0) return;
    const G = C.source, $ = d.get(G);
    if ($) {
      const re = $[M.__cacheKey];
      re.usedTimes--, re.usedTimes === 0 && z(C), Object.keys($).length === 0 && d.delete(G);
    }
    n.remove(C);
  }
  function z(C) {
    const M = n.get(C);
    s.deleteTexture(M.__webglTexture);
    const G = C.source, $ = d.get(G);
    delete $[M.__cacheKey], a.memory.textures--;
  }
  function ee(C) {
    const M = n.get(C);
    if (C.depthTexture && C.depthTexture.dispose(), C.isWebGLCubeRenderTarget)
      for (let $ = 0; $ < 6; $++) {
        if (Array.isArray(M.__webglFramebuffer[$]))
          for (let re = 0; re < M.__webglFramebuffer[$].length; re++) s.deleteFramebuffer(M.__webglFramebuffer[$][re]);
        else
          s.deleteFramebuffer(M.__webglFramebuffer[$]);
        M.__webglDepthbuffer && s.deleteRenderbuffer(M.__webglDepthbuffer[$]);
      }
    else {
      if (Array.isArray(M.__webglFramebuffer))
        for (let $ = 0; $ < M.__webglFramebuffer.length; $++) s.deleteFramebuffer(M.__webglFramebuffer[$]);
      else
        s.deleteFramebuffer(M.__webglFramebuffer);
      if (M.__webglDepthbuffer && s.deleteRenderbuffer(M.__webglDepthbuffer), M.__webglMultisampledFramebuffer && s.deleteFramebuffer(M.__webglMultisampledFramebuffer), M.__webglColorRenderbuffer)
        for (let $ = 0; $ < M.__webglColorRenderbuffer.length; $++)
          M.__webglColorRenderbuffer[$] && s.deleteRenderbuffer(M.__webglColorRenderbuffer[$]);
      M.__webglDepthRenderbuffer && s.deleteRenderbuffer(M.__webglDepthRenderbuffer);
    }
    const G = C.textures;
    for (let $ = 0, re = G.length; $ < re; $++) {
      const J = n.get(G[$]);
      J.__webglTexture && (s.deleteTexture(J.__webglTexture), a.memory.textures--), n.remove(G[$]);
    }
    n.remove(C);
  }
  let v = 0;
  function A() {
    v = 0;
  }
  function W() {
    const C = v;
    return C >= i.maxTextures && console.warn("THREE.WebGLTextures: Trying to use " + C + " texture units while this GPU supports only " + i.maxTextures), v += 1, C;
  }
  function q(C) {
    const M = [];
    return M.push(C.wrapS), M.push(C.wrapT), M.push(C.wrapR || 0), M.push(C.magFilter), M.push(C.minFilter), M.push(C.anisotropy), M.push(C.internalFormat), M.push(C.format), M.push(C.type), M.push(C.generateMipmaps), M.push(C.premultiplyAlpha), M.push(C.flipY), M.push(C.unpackAlignment), M.push(C.colorSpace), M.join();
  }
  function Y(C, M) {
    const G = n.get(C);
    if (C.isVideoTexture && Ne(C), C.isRenderTargetTexture === !1 && C.version > 0 && G.__version !== C.version) {
      const $ = C.image;
      if ($ === null)
        console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");
      else if ($.complete === !1)
        console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");
      else {
        ht(G, C, M);
        return;
      }
    }
    t.bindTexture(s.TEXTURE_2D, G.__webglTexture, s.TEXTURE0 + M);
  }
  function se(C, M) {
    const G = n.get(C);
    if (C.version > 0 && G.__version !== C.version) {
      ht(G, C, M);
      return;
    }
    t.bindTexture(s.TEXTURE_2D_ARRAY, G.__webglTexture, s.TEXTURE0 + M);
  }
  function j(C, M) {
    const G = n.get(C);
    if (C.version > 0 && G.__version !== C.version) {
      ht(G, C, M);
      return;
    }
    t.bindTexture(s.TEXTURE_3D, G.__webglTexture, s.TEXTURE0 + M);
  }
  function he(C, M) {
    const G = n.get(C);
    if (C.version > 0 && G.__version !== C.version) {
      Z(G, C, M);
      return;
    }
    t.bindTexture(s.TEXTURE_CUBE_MAP, G.__webglTexture, s.TEXTURE0 + M);
  }
  const X = {
    1e3: s.REPEAT,
    1001: s.CLAMP_TO_EDGE,
    1002: s.MIRRORED_REPEAT
  }, xe = {
    1003: s.NEAREST,
    1004: s.NEAREST_MIPMAP_NEAREST,
    1005: s.NEAREST_MIPMAP_LINEAR,
    1006: s.LINEAR,
    1007: s.LINEAR_MIPMAP_NEAREST,
    1008: s.LINEAR_MIPMAP_LINEAR
  }, ve = {
    512: s.NEVER,
    519: s.ALWAYS,
    513: s.LESS,
    515: s.LEQUAL,
    514: s.EQUAL,
    518: s.GEQUAL,
    516: s.GREATER,
    517: s.NOTEQUAL
  };
  function we(C, M) {
    if (M.type === 1015 && e.has("OES_texture_float_linear") === !1 && (M.magFilter === 1006 || M.magFilter === 1007 || M.magFilter === 1005 || M.magFilter === 1008 || M.minFilter === 1006 || M.minFilter === 1007 || M.minFilter === 1005 || M.minFilter === 1008) && console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."), s.texParameteri(C, s.TEXTURE_WRAP_S, X[M.wrapS]), s.texParameteri(C, s.TEXTURE_WRAP_T, X[M.wrapT]), (C === s.TEXTURE_3D || C === s.TEXTURE_2D_ARRAY) && s.texParameteri(C, s.TEXTURE_WRAP_R, X[M.wrapR]), s.texParameteri(C, s.TEXTURE_MAG_FILTER, xe[M.magFilter]), s.texParameteri(C, s.TEXTURE_MIN_FILTER, xe[M.minFilter]), M.compareFunction && (s.texParameteri(C, s.TEXTURE_COMPARE_MODE, s.COMPARE_REF_TO_TEXTURE), s.texParameteri(C, s.TEXTURE_COMPARE_FUNC, ve[M.compareFunction])), e.has("EXT_texture_filter_anisotropic") === !0) {
      if (M.magFilter === 1003 || M.minFilter !== 1005 && M.minFilter !== 1008 || M.type === 1015 && e.has("OES_texture_float_linear") === !1) return;
      if (M.anisotropy > 1 || n.get(M).__currentAnisotropy) {
        const G = e.get("EXT_texture_filter_anisotropic");
        s.texParameterf(C, G.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(M.anisotropy, i.getMaxAnisotropy())), n.get(M).__currentAnisotropy = M.anisotropy;
      }
    }
  }
  function Qe(C, M) {
    let G = !1;
    C.__webglInit === void 0 && (C.__webglInit = !0, M.addEventListener("dispose", F));
    const $ = M.source;
    let re = d.get($);
    re === void 0 && (re = {}, d.set($, re));
    const J = q(M);
    if (J !== C.__cacheKey) {
      re[J] === void 0 && (re[J] = {
        texture: s.createTexture(),
        usedTimes: 0
      }, a.memory.textures++, G = !0), re[J].usedTimes++;
      const Re = re[C.__cacheKey];
      Re !== void 0 && (re[C.__cacheKey].usedTimes--, Re.usedTimes === 0 && z(M)), C.__cacheKey = J, C.__webglTexture = re[J].texture;
    }
    return G;
  }
  function ht(C, M, G) {
    let $ = s.TEXTURE_2D;
    (M.isDataArrayTexture || M.isCompressedArrayTexture) && ($ = s.TEXTURE_2D_ARRAY), M.isData3DTexture && ($ = s.TEXTURE_3D);
    const re = Qe(C, M), J = M.source;
    t.bindTexture($, C.__webglTexture, s.TEXTURE0 + G);
    const Re = n.get(J);
    if (J.version !== Re.__version || re === !0) {
      t.activeTexture(s.TEXTURE0 + G);
      const ie = at.getPrimaries(at.workingColorSpace), ae = M.colorSpace === $n ? null : at.getPrimaries(M.colorSpace), D = M.colorSpace === $n || ie === ae ? s.NONE : s.BROWSER_DEFAULT_WEBGL;
      s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL, M.flipY), s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL, M.premultiplyAlpha), s.pixelStorei(s.UNPACK_ALIGNMENT, M.unpackAlignment), s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL, D);
      let ue = x(M.image, !1, i.maxTextureSize);
      ue = _t(M, ue);
      const Ee = r.convert(M.format, M.colorSpace), Ge = r.convert(M.type);
      let He = T(M.internalFormat, Ee, Ge, M.colorSpace, M.isVideoTexture);
      we($, M);
      let Se;
      const tt = M.mipmaps, Ve = M.isVideoTexture !== !0, xt = Re.__version === void 0 || re === !0, B = J.dataReady, fe = E(M, ue);
      if (M.isDepthTexture)
        He = S(M.format === 1027, M.type), xt && (Ve ? t.texStorage2D(s.TEXTURE_2D, 1, He, ue.width, ue.height) : t.texImage2D(s.TEXTURE_2D, 0, He, ue.width, ue.height, 0, Ee, Ge, null));
      else if (M.isDataTexture)
        if (tt.length > 0) {
          Ve && xt && t.texStorage2D(s.TEXTURE_2D, fe, He, tt[0].width, tt[0].height);
          for (let K = 0, te = tt.length; K < te; K++)
            Se = tt[K], Ve ? B && t.texSubImage2D(s.TEXTURE_2D, K, 0, 0, Se.width, Se.height, Ee, Ge, Se.data) : t.texImage2D(s.TEXTURE_2D, K, He, Se.width, Se.height, 0, Ee, Ge, Se.data);
          M.generateMipmaps = !1;
        } else
          Ve ? (xt && t.texStorage2D(s.TEXTURE_2D, fe, He, ue.width, ue.height), B && t.texSubImage2D(s.TEXTURE_2D, 0, 0, 0, ue.width, ue.height, Ee, Ge, ue.data)) : t.texImage2D(s.TEXTURE_2D, 0, He, ue.width, ue.height, 0, Ee, Ge, ue.data);
      else if (M.isCompressedTexture)
        if (M.isCompressedArrayTexture) {
          Ve && xt && t.texStorage3D(s.TEXTURE_2D_ARRAY, fe, He, tt[0].width, tt[0].height, ue.depth);
          for (let K = 0, te = tt.length; K < te; K++)
            if (Se = tt[K], M.format !== 1023)
              if (Ee !== null)
                if (Ve) {
                  if (B)
                    if (M.layerUpdates.size > 0) {
                      const ge = Bo(Se.width, Se.height, M.format, M.type);
                      for (const _e of M.layerUpdates) {
                        const $e = Se.data.subarray(
                          _e * ge / Se.data.BYTES_PER_ELEMENT,
                          (_e + 1) * ge / Se.data.BYTES_PER_ELEMENT
                        );
                        t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY, K, 0, 0, _e, Se.width, Se.height, 1, Ee, $e, 0, 0);
                      }
                      M.clearLayerUpdates();
                    } else
                      t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY, K, 0, 0, 0, Se.width, Se.height, ue.depth, Ee, Se.data, 0, 0);
                } else
                  t.compressedTexImage3D(s.TEXTURE_2D_ARRAY, K, He, Se.width, Se.height, ue.depth, 0, Se.data, 0, 0);
              else
                console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");
            else
              Ve ? B && t.texSubImage3D(s.TEXTURE_2D_ARRAY, K, 0, 0, 0, Se.width, Se.height, ue.depth, Ee, Ge, Se.data) : t.texImage3D(s.TEXTURE_2D_ARRAY, K, He, Se.width, Se.height, ue.depth, 0, Ee, Ge, Se.data);
        } else {
          Ve && xt && t.texStorage2D(s.TEXTURE_2D, fe, He, tt[0].width, tt[0].height);
          for (let K = 0, te = tt.length; K < te; K++)
            Se = tt[K], M.format !== 1023 ? Ee !== null ? Ve ? B && t.compressedTexSubImage2D(s.TEXTURE_2D, K, 0, 0, Se.width, Se.height, Ee, Se.data) : t.compressedTexImage2D(s.TEXTURE_2D, K, He, Se.width, Se.height, 0, Se.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : Ve ? B && t.texSubImage2D(s.TEXTURE_2D, K, 0, 0, Se.width, Se.height, Ee, Ge, Se.data) : t.texImage2D(s.TEXTURE_2D, K, He, Se.width, Se.height, 0, Ee, Ge, Se.data);
        }
      else if (M.isDataArrayTexture)
        if (Ve) {
          if (xt && t.texStorage3D(s.TEXTURE_2D_ARRAY, fe, He, ue.width, ue.height, ue.depth), B)
            if (M.layerUpdates.size > 0) {
              const K = Bo(ue.width, ue.height, M.format, M.type);
              for (const te of M.layerUpdates) {
                const ge = ue.data.subarray(
                  te * K / ue.data.BYTES_PER_ELEMENT,
                  (te + 1) * K / ue.data.BYTES_PER_ELEMENT
                );
                t.texSubImage3D(s.TEXTURE_2D_ARRAY, 0, 0, 0, te, ue.width, ue.height, 1, Ee, Ge, ge);
              }
              M.clearLayerUpdates();
            } else
              t.texSubImage3D(s.TEXTURE_2D_ARRAY, 0, 0, 0, 0, ue.width, ue.height, ue.depth, Ee, Ge, ue.data);
        } else
          t.texImage3D(s.TEXTURE_2D_ARRAY, 0, He, ue.width, ue.height, ue.depth, 0, Ee, Ge, ue.data);
      else if (M.isData3DTexture)
        Ve ? (xt && t.texStorage3D(s.TEXTURE_3D, fe, He, ue.width, ue.height, ue.depth), B && t.texSubImage3D(s.TEXTURE_3D, 0, 0, 0, 0, ue.width, ue.height, ue.depth, Ee, Ge, ue.data)) : t.texImage3D(s.TEXTURE_3D, 0, He, ue.width, ue.height, ue.depth, 0, Ee, Ge, ue.data);
      else if (M.isFramebufferTexture) {
        if (xt)
          if (Ve)
            t.texStorage2D(s.TEXTURE_2D, fe, He, ue.width, ue.height);
          else {
            let K = ue.width, te = ue.height;
            for (let ge = 0; ge < fe; ge++)
              t.texImage2D(s.TEXTURE_2D, ge, He, K, te, 0, Ee, Ge, null), K >>= 1, te >>= 1;
          }
      } else if (tt.length > 0) {
        if (Ve && xt) {
          const K = Oe(tt[0]);
          t.texStorage2D(s.TEXTURE_2D, fe, He, K.width, K.height);
        }
        for (let K = 0, te = tt.length; K < te; K++)
          Se = tt[K], Ve ? B && t.texSubImage2D(s.TEXTURE_2D, K, 0, 0, Ee, Ge, Se) : t.texImage2D(s.TEXTURE_2D, K, He, Ee, Ge, Se);
        M.generateMipmaps = !1;
      } else if (Ve) {
        if (xt) {
          const K = Oe(ue);
          t.texStorage2D(s.TEXTURE_2D, fe, He, K.width, K.height);
        }
        B && t.texSubImage2D(s.TEXTURE_2D, 0, 0, 0, Ee, Ge, ue);
      } else
        t.texImage2D(s.TEXTURE_2D, 0, He, Ee, Ge, ue);
      p(M) && m($), Re.__version = J.version, M.onUpdate && M.onUpdate(M);
    }
    C.__version = M.version;
  }
  function Z(C, M, G) {
    if (M.image.length !== 6) return;
    const $ = Qe(C, M), re = M.source;
    t.bindTexture(s.TEXTURE_CUBE_MAP, C.__webglTexture, s.TEXTURE0 + G);
    const J = n.get(re);
    if (re.version !== J.__version || $ === !0) {
      t.activeTexture(s.TEXTURE0 + G);
      const Re = at.getPrimaries(at.workingColorSpace), ie = M.colorSpace === $n ? null : at.getPrimaries(M.colorSpace), ae = M.colorSpace === $n || Re === ie ? s.NONE : s.BROWSER_DEFAULT_WEBGL;
      s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL, M.flipY), s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL, M.premultiplyAlpha), s.pixelStorei(s.UNPACK_ALIGNMENT, M.unpackAlignment), s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL, ae);
      const D = M.isCompressedTexture || M.image[0].isCompressedTexture, ue = M.image[0] && M.image[0].isDataTexture, Ee = [];
      for (let te = 0; te < 6; te++)
        !D && !ue ? Ee[te] = x(M.image[te], !0, i.maxCubemapSize) : Ee[te] = ue ? M.image[te].image : M.image[te], Ee[te] = _t(M, Ee[te]);
      const Ge = Ee[0], He = r.convert(M.format, M.colorSpace), Se = r.convert(M.type), tt = T(M.internalFormat, He, Se, M.colorSpace), Ve = M.isVideoTexture !== !0, xt = J.__version === void 0 || $ === !0, B = re.dataReady;
      let fe = E(M, Ge);
      we(s.TEXTURE_CUBE_MAP, M);
      let K;
      if (D) {
        Ve && xt && t.texStorage2D(s.TEXTURE_CUBE_MAP, fe, tt, Ge.width, Ge.height);
        for (let te = 0; te < 6; te++) {
          K = Ee[te].mipmaps;
          for (let ge = 0; ge < K.length; ge++) {
            const _e = K[ge];
            M.format !== 1023 ? He !== null ? Ve ? B && t.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + te, ge, 0, 0, _e.width, _e.height, He, _e.data) : t.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + te, ge, tt, _e.width, _e.height, 0, _e.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()") : Ve ? B && t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + te, ge, 0, 0, _e.width, _e.height, He, Se, _e.data) : t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + te, ge, tt, _e.width, _e.height, 0, He, Se, _e.data);
          }
        }
      } else {
        if (K = M.mipmaps, Ve && xt) {
          K.length > 0 && fe++;
          const te = Oe(Ee[0]);
          t.texStorage2D(s.TEXTURE_CUBE_MAP, fe, tt, te.width, te.height);
        }
        for (let te = 0; te < 6; te++)
          if (ue) {
            Ve ? B && t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + te, 0, 0, 0, Ee[te].width, Ee[te].height, He, Se, Ee[te].data) : t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + te, 0, tt, Ee[te].width, Ee[te].height, 0, He, Se, Ee[te].data);
            for (let ge = 0; ge < K.length; ge++) {
              const $e = K[ge].image[te].image;
              Ve ? B && t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + te, ge + 1, 0, 0, $e.width, $e.height, He, Se, $e.data) : t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + te, ge + 1, tt, $e.width, $e.height, 0, He, Se, $e.data);
            }
          } else {
            Ve ? B && t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + te, 0, 0, 0, He, Se, Ee[te]) : t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + te, 0, tt, He, Se, Ee[te]);
            for (let ge = 0; ge < K.length; ge++) {
              const _e = K[ge];
              Ve ? B && t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + te, ge + 1, 0, 0, He, Se, _e.image[te]) : t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + te, ge + 1, tt, He, Se, _e.image[te]);
            }
          }
      }
      p(M) && m(s.TEXTURE_CUBE_MAP), J.__version = re.version, M.onUpdate && M.onUpdate(M);
    }
    C.__version = M.version;
  }
  function ce(C, M, G, $, re, J) {
    const Re = r.convert(G.format, G.colorSpace), ie = r.convert(G.type), ae = T(G.internalFormat, Re, ie, G.colorSpace);
    if (!n.get(M).__hasExternalTextures) {
      const ue = Math.max(1, M.width >> J), Ee = Math.max(1, M.height >> J);
      re === s.TEXTURE_3D || re === s.TEXTURE_2D_ARRAY ? t.texImage3D(re, J, ae, ue, Ee, M.depth, 0, Re, ie, null) : t.texImage2D(re, J, ae, ue, Ee, 0, Re, ie, null);
    }
    t.bindFramebuffer(s.FRAMEBUFFER, C), it(M) ? o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER, $, re, n.get(G).__webglTexture, 0, Ze(M)) : (re === s.TEXTURE_2D || re >= s.TEXTURE_CUBE_MAP_POSITIVE_X && re <= s.TEXTURE_CUBE_MAP_NEGATIVE_Z) && s.framebufferTexture2D(s.FRAMEBUFFER, $, re, n.get(G).__webglTexture, J), t.bindFramebuffer(s.FRAMEBUFFER, null);
  }
  function Te(C, M, G) {
    if (s.bindRenderbuffer(s.RENDERBUFFER, C), M.depthBuffer) {
      const $ = M.depthTexture, re = $ && $.isDepthTexture ? $.type : null, J = S(M.stencilBuffer, re), Re = M.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT, ie = Ze(M);
      it(M) ? o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER, ie, J, M.width, M.height) : G ? s.renderbufferStorageMultisample(s.RENDERBUFFER, ie, J, M.width, M.height) : s.renderbufferStorage(s.RENDERBUFFER, J, M.width, M.height), s.framebufferRenderbuffer(s.FRAMEBUFFER, Re, s.RENDERBUFFER, C);
    } else {
      const $ = M.textures;
      for (let re = 0; re < $.length; re++) {
        const J = $[re], Re = r.convert(J.format, J.colorSpace), ie = r.convert(J.type), ae = T(J.internalFormat, Re, ie, J.colorSpace), D = Ze(M);
        G && it(M) === !1 ? s.renderbufferStorageMultisample(s.RENDERBUFFER, D, ae, M.width, M.height) : it(M) ? o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER, D, ae, M.width, M.height) : s.renderbufferStorage(s.RENDERBUFFER, ae, M.width, M.height);
      }
    }
    s.bindRenderbuffer(s.RENDERBUFFER, null);
  }
  function ye(C, M) {
    if (M && M.isWebGLCubeRenderTarget) throw new Error("Depth Texture with cube render targets is not supported");
    if (t.bindFramebuffer(s.FRAMEBUFFER, C), !(M.depthTexture && M.depthTexture.isDepthTexture))
      throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");
    (!n.get(M.depthTexture).__webglTexture || M.depthTexture.image.width !== M.width || M.depthTexture.image.height !== M.height) && (M.depthTexture.image.width = M.width, M.depthTexture.image.height = M.height, M.depthTexture.needsUpdate = !0), Y(M.depthTexture, 0);
    const $ = n.get(M.depthTexture).__webglTexture, re = Ze(M);
    if (M.depthTexture.format === 1026)
      it(M) ? o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER, s.DEPTH_ATTACHMENT, s.TEXTURE_2D, $, 0, re) : s.framebufferTexture2D(s.FRAMEBUFFER, s.DEPTH_ATTACHMENT, s.TEXTURE_2D, $, 0);
    else if (M.depthTexture.format === 1027)
      it(M) ? o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER, s.DEPTH_STENCIL_ATTACHMENT, s.TEXTURE_2D, $, 0, re) : s.framebufferTexture2D(s.FRAMEBUFFER, s.DEPTH_STENCIL_ATTACHMENT, s.TEXTURE_2D, $, 0);
    else
      throw new Error("Unknown depthTexture format");
  }
  function Xe(C) {
    const M = n.get(C), G = C.isWebGLCubeRenderTarget === !0;
    if (M.__boundDepthTexture !== C.depthTexture) {
      const $ = C.depthTexture;
      if (M.__depthDisposeCallback && M.__depthDisposeCallback(), $) {
        const re = () => {
          delete M.__boundDepthTexture, delete M.__depthDisposeCallback, $.removeEventListener("dispose", re);
        };
        $.addEventListener("dispose", re), M.__depthDisposeCallback = re;
      }
      M.__boundDepthTexture = $;
    }
    if (C.depthTexture && !M.__autoAllocateDepthBuffer) {
      if (G) throw new Error("target.depthTexture not supported in Cube render targets");
      ye(M.__webglFramebuffer, C);
    } else if (G) {
      M.__webglDepthbuffer = [];
      for (let $ = 0; $ < 6; $++)
        if (t.bindFramebuffer(s.FRAMEBUFFER, M.__webglFramebuffer[$]), M.__webglDepthbuffer[$] === void 0)
          M.__webglDepthbuffer[$] = s.createRenderbuffer(), Te(M.__webglDepthbuffer[$], C, !1);
        else {
          const re = C.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT, J = M.__webglDepthbuffer[$];
          s.bindRenderbuffer(s.RENDERBUFFER, J), s.framebufferRenderbuffer(s.FRAMEBUFFER, re, s.RENDERBUFFER, J);
        }
    } else if (t.bindFramebuffer(s.FRAMEBUFFER, M.__webglFramebuffer), M.__webglDepthbuffer === void 0)
      M.__webglDepthbuffer = s.createRenderbuffer(), Te(M.__webglDepthbuffer, C, !1);
    else {
      const $ = C.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT, re = M.__webglDepthbuffer;
      s.bindRenderbuffer(s.RENDERBUFFER, re), s.framebufferRenderbuffer(s.FRAMEBUFFER, $, s.RENDERBUFFER, re);
    }
    t.bindFramebuffer(s.FRAMEBUFFER, null);
  }
  function Be(C, M, G) {
    const $ = n.get(C);
    M !== void 0 && ce($.__webglFramebuffer, C, C.texture, s.COLOR_ATTACHMENT0, s.TEXTURE_2D, 0), G !== void 0 && Xe(C);
  }
  function et(C) {
    const M = C.texture, G = n.get(C), $ = n.get(M);
    C.addEventListener("dispose", P);
    const re = C.textures, J = C.isWebGLCubeRenderTarget === !0, Re = re.length > 1;
    if (Re || ($.__webglTexture === void 0 && ($.__webglTexture = s.createTexture()), $.__version = M.version, a.memory.textures++), J) {
      G.__webglFramebuffer = [];
      for (let ie = 0; ie < 6; ie++)
        if (M.mipmaps && M.mipmaps.length > 0) {
          G.__webglFramebuffer[ie] = [];
          for (let ae = 0; ae < M.mipmaps.length; ae++)
            G.__webglFramebuffer[ie][ae] = s.createFramebuffer();
        } else
          G.__webglFramebuffer[ie] = s.createFramebuffer();
    } else {
      if (M.mipmaps && M.mipmaps.length > 0) {
        G.__webglFramebuffer = [];
        for (let ie = 0; ie < M.mipmaps.length; ie++)
          G.__webglFramebuffer[ie] = s.createFramebuffer();
      } else
        G.__webglFramebuffer = s.createFramebuffer();
      if (Re)
        for (let ie = 0, ae = re.length; ie < ae; ie++) {
          const D = n.get(re[ie]);
          D.__webglTexture === void 0 && (D.__webglTexture = s.createTexture(), a.memory.textures++);
        }
      if (C.samples > 0 && it(C) === !1) {
        G.__webglMultisampledFramebuffer = s.createFramebuffer(), G.__webglColorRenderbuffer = [], t.bindFramebuffer(s.FRAMEBUFFER, G.__webglMultisampledFramebuffer);
        for (let ie = 0; ie < re.length; ie++) {
          const ae = re[ie];
          G.__webglColorRenderbuffer[ie] = s.createRenderbuffer(), s.bindRenderbuffer(s.RENDERBUFFER, G.__webglColorRenderbuffer[ie]);
          const D = r.convert(ae.format, ae.colorSpace), ue = r.convert(ae.type), Ee = T(ae.internalFormat, D, ue, ae.colorSpace, C.isXRRenderTarget === !0), Ge = Ze(C);
          s.renderbufferStorageMultisample(s.RENDERBUFFER, Ge, Ee, C.width, C.height), s.framebufferRenderbuffer(s.FRAMEBUFFER, s.COLOR_ATTACHMENT0 + ie, s.RENDERBUFFER, G.__webglColorRenderbuffer[ie]);
        }
        s.bindRenderbuffer(s.RENDERBUFFER, null), C.depthBuffer && (G.__webglDepthRenderbuffer = s.createRenderbuffer(), Te(G.__webglDepthRenderbuffer, C, !0)), t.bindFramebuffer(s.FRAMEBUFFER, null);
      }
    }
    if (J) {
      t.bindTexture(s.TEXTURE_CUBE_MAP, $.__webglTexture), we(s.TEXTURE_CUBE_MAP, M);
      for (let ie = 0; ie < 6; ie++)
        if (M.mipmaps && M.mipmaps.length > 0)
          for (let ae = 0; ae < M.mipmaps.length; ae++)
            ce(G.__webglFramebuffer[ie][ae], C, M, s.COLOR_ATTACHMENT0, s.TEXTURE_CUBE_MAP_POSITIVE_X + ie, ae);
        else
          ce(G.__webglFramebuffer[ie], C, M, s.COLOR_ATTACHMENT0, s.TEXTURE_CUBE_MAP_POSITIVE_X + ie, 0);
      p(M) && m(s.TEXTURE_CUBE_MAP), t.unbindTexture();
    } else if (Re) {
      for (let ie = 0, ae = re.length; ie < ae; ie++) {
        const D = re[ie], ue = n.get(D);
        t.bindTexture(s.TEXTURE_2D, ue.__webglTexture), we(s.TEXTURE_2D, D), ce(G.__webglFramebuffer, C, D, s.COLOR_ATTACHMENT0 + ie, s.TEXTURE_2D, 0), p(D) && m(s.TEXTURE_2D);
      }
      t.unbindTexture();
    } else {
      let ie = s.TEXTURE_2D;
      if ((C.isWebGL3DRenderTarget || C.isWebGLArrayRenderTarget) && (ie = C.isWebGL3DRenderTarget ? s.TEXTURE_3D : s.TEXTURE_2D_ARRAY), t.bindTexture(ie, $.__webglTexture), we(ie, M), M.mipmaps && M.mipmaps.length > 0)
        for (let ae = 0; ae < M.mipmaps.length; ae++)
          ce(G.__webglFramebuffer[ae], C, M, s.COLOR_ATTACHMENT0, ie, ae);
      else
        ce(G.__webglFramebuffer, C, M, s.COLOR_ATTACHMENT0, ie, 0);
      p(M) && m(ie), t.unbindTexture();
    }
    C.depthBuffer && Xe(C);
  }
  function ft(C) {
    const M = C.textures;
    for (let G = 0, $ = M.length; G < $; G++) {
      const re = M[G];
      if (p(re)) {
        const J = C.isWebGLCubeRenderTarget ? s.TEXTURE_CUBE_MAP : s.TEXTURE_2D, Re = n.get(re).__webglTexture;
        t.bindTexture(J, Re), m(J), t.unbindTexture();
      }
    }
  }
  const nt = [], U = [];
  function Vt(C) {
    if (C.samples > 0) {
      if (it(C) === !1) {
        const M = C.textures, G = C.width, $ = C.height;
        let re = s.COLOR_BUFFER_BIT;
        const J = C.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT, Re = n.get(C), ie = M.length > 1;
        if (ie)
          for (let ae = 0; ae < M.length; ae++)
            t.bindFramebuffer(s.FRAMEBUFFER, Re.__webglMultisampledFramebuffer), s.framebufferRenderbuffer(s.FRAMEBUFFER, s.COLOR_ATTACHMENT0 + ae, s.RENDERBUFFER, null), t.bindFramebuffer(s.FRAMEBUFFER, Re.__webglFramebuffer), s.framebufferTexture2D(s.DRAW_FRAMEBUFFER, s.COLOR_ATTACHMENT0 + ae, s.TEXTURE_2D, null, 0);
        t.bindFramebuffer(s.READ_FRAMEBUFFER, Re.__webglMultisampledFramebuffer), t.bindFramebuffer(s.DRAW_FRAMEBUFFER, Re.__webglFramebuffer);
        for (let ae = 0; ae < M.length; ae++) {
          if (C.resolveDepthBuffer && (C.depthBuffer && (re |= s.DEPTH_BUFFER_BIT), C.stencilBuffer && C.resolveStencilBuffer && (re |= s.STENCIL_BUFFER_BIT)), ie) {
            s.framebufferRenderbuffer(s.READ_FRAMEBUFFER, s.COLOR_ATTACHMENT0, s.RENDERBUFFER, Re.__webglColorRenderbuffer[ae]);
            const D = n.get(M[ae]).__webglTexture;
            s.framebufferTexture2D(s.DRAW_FRAMEBUFFER, s.COLOR_ATTACHMENT0, s.TEXTURE_2D, D, 0);
          }
          s.blitFramebuffer(0, 0, G, $, 0, 0, G, $, re, s.NEAREST), c === !0 && (nt.length = 0, U.length = 0, nt.push(s.COLOR_ATTACHMENT0 + ae), C.depthBuffer && C.resolveDepthBuffer === !1 && (nt.push(J), U.push(J), s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER, U)), s.invalidateFramebuffer(s.READ_FRAMEBUFFER, nt));
        }
        if (t.bindFramebuffer(s.READ_FRAMEBUFFER, null), t.bindFramebuffer(s.DRAW_FRAMEBUFFER, null), ie)
          for (let ae = 0; ae < M.length; ae++) {
            t.bindFramebuffer(s.FRAMEBUFFER, Re.__webglMultisampledFramebuffer), s.framebufferRenderbuffer(s.FRAMEBUFFER, s.COLOR_ATTACHMENT0 + ae, s.RENDERBUFFER, Re.__webglColorRenderbuffer[ae]);
            const D = n.get(M[ae]).__webglTexture;
            t.bindFramebuffer(s.FRAMEBUFFER, Re.__webglFramebuffer), s.framebufferTexture2D(s.DRAW_FRAMEBUFFER, s.COLOR_ATTACHMENT0 + ae, s.TEXTURE_2D, D, 0);
          }
        t.bindFramebuffer(s.DRAW_FRAMEBUFFER, Re.__webglMultisampledFramebuffer);
      } else if (C.depthBuffer && C.resolveDepthBuffer === !1 && c) {
        const M = C.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT;
        s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER, [M]);
      }
    }
  }
  function Ze(C) {
    return Math.min(i.maxSamples, C.samples);
  }
  function it(C) {
    const M = n.get(C);
    return C.samples > 0 && e.has("WEBGL_multisampled_render_to_texture") === !0 && M.__useRenderToTexture !== !1;
  }
  function Ne(C) {
    const M = a.render.frame;
    u.get(C) !== M && (u.set(C, M), C.update());
  }
  function _t(C, M) {
    const G = C.colorSpace, $ = C.format, re = C.type;
    return C.isCompressedTexture === !0 || C.isVideoTexture === !0 || G !== Ht && G !== $n && (at.getTransfer(G) === Et ? ($ !== 1023 || re !== 1009) && console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.") : console.error("THREE.WebGLTextures: Unsupported texture color space:", G)), M;
  }
  function Oe(C) {
    return typeof HTMLImageElement < "u" && C instanceof HTMLImageElement ? (l.width = C.naturalWidth || C.width, l.height = C.naturalHeight || C.height) : typeof VideoFrame < "u" && C instanceof VideoFrame ? (l.width = C.displayWidth, l.height = C.displayHeight) : (l.width = C.width, l.height = C.height), l;
  }
  this.allocateTextureUnit = W, this.resetTextureUnits = A, this.setTexture2D = Y, this.setTexture2DArray = se, this.setTexture3D = j, this.setTextureCube = he, this.rebindTextures = Be, this.setupRenderTarget = et, this.updateRenderTargetMipmap = ft, this.updateMultisampleRenderTarget = Vt, this.setupDepthRenderbuffer = Xe, this.setupFrameBufferTexture = ce, this.useMultisampledRTT = it;
}
function Lp(s, e) {
  function t(n, i = $n) {
    let r;
    const a = at.getTransfer(i);
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
      if (a === Et)
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
        if (n === 36196 || n === 37492) return a === Et ? r.COMPRESSED_SRGB8_ETC2 : r.COMPRESSED_RGB8_ETC2;
        if (n === 37496) return a === Et ? r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : r.COMPRESSED_RGBA8_ETC2_EAC;
      } else
        return null;
    if (n === 37808 || n === 37809 || n === 37810 || n === 37811 || n === 37812 || n === 37813 || n === 37814 || n === 37815 || n === 37816 || n === 37817 || n === 37818 || n === 37819 || n === 37820 || n === 37821)
      if (r = e.get("WEBGL_compressed_texture_astc"), r !== null) {
        if (n === 37808) return a === Et ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : r.COMPRESSED_RGBA_ASTC_4x4_KHR;
        if (n === 37809) return a === Et ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR : r.COMPRESSED_RGBA_ASTC_5x4_KHR;
        if (n === 37810) return a === Et ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR : r.COMPRESSED_RGBA_ASTC_5x5_KHR;
        if (n === 37811) return a === Et ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR : r.COMPRESSED_RGBA_ASTC_6x5_KHR;
        if (n === 37812) return a === Et ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR : r.COMPRESSED_RGBA_ASTC_6x6_KHR;
        if (n === 37813) return a === Et ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR : r.COMPRESSED_RGBA_ASTC_8x5_KHR;
        if (n === 37814) return a === Et ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR : r.COMPRESSED_RGBA_ASTC_8x6_KHR;
        if (n === 37815) return a === Et ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR : r.COMPRESSED_RGBA_ASTC_8x8_KHR;
        if (n === 37816) return a === Et ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR : r.COMPRESSED_RGBA_ASTC_10x5_KHR;
        if (n === 37817) return a === Et ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR : r.COMPRESSED_RGBA_ASTC_10x6_KHR;
        if (n === 37818) return a === Et ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR : r.COMPRESSED_RGBA_ASTC_10x8_KHR;
        if (n === 37819) return a === Et ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR : r.COMPRESSED_RGBA_ASTC_10x10_KHR;
        if (n === 37820) return a === Et ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR : r.COMPRESSED_RGBA_ASTC_12x10_KHR;
        if (n === 37821) return a === Et ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR : r.COMPRESSED_RGBA_ASTC_12x12_KHR;
      } else
        return null;
    if (n === 36492 || n === 36494 || n === 36495)
      if (r = e.get("EXT_texture_compression_bptc"), r !== null) {
        if (n === 36492) return a === Et ? r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT : r.COMPRESSED_RGBA_BPTC_UNORM_EXT;
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
class Dp extends en {
  constructor(e = []) {
    super(), this.isArrayCamera = !0, this.cameras = e;
  }
}
class It extends At {
  constructor() {
    super(), this.isGroup = !0, this.type = "Group";
  }
}
const Up = { type: "move" };
class na {
  constructor() {
    this._targetRay = null, this._grip = null, this._hand = null;
  }
  getHandSpace() {
    return this._hand === null && (this._hand = new It(), this._hand.matrixAutoUpdate = !1, this._hand.visible = !1, this._hand.joints = {}, this._hand.inputState = { pinching: !1 }), this._hand;
  }
  getTargetRaySpace() {
    return this._targetRay === null && (this._targetRay = new It(), this._targetRay.matrixAutoUpdate = !1, this._targetRay.visible = !1, this._targetRay.hasLinearVelocity = !1, this._targetRay.linearVelocity = new N(), this._targetRay.hasAngularVelocity = !1, this._targetRay.angularVelocity = new N()), this._targetRay;
  }
  getGripSpace() {
    return this._grip === null && (this._grip = new It(), this._grip.matrixAutoUpdate = !1, this._grip.visible = !1, this._grip.hasLinearVelocity = !1, this._grip.linearVelocity = new N(), this._grip.hasAngularVelocity = !1, this._grip.angularVelocity = new N()), this._grip;
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
        for (const x of e.hand.values()) {
          const p = t.getJointPose(x, n), m = this._getHandJoint(l, x);
          p !== null && (m.matrix.fromArray(p.transform.matrix), m.matrix.decompose(m.position, m.rotation, m.scale), m.matrixWorldNeedsUpdate = !0, m.jointRadius = p.radius), m.visible = p !== null;
        }
        const u = l.joints["index-finger-tip"], h = l.joints["thumb-tip"], d = u.position.distanceTo(h.position), f = 0.02, g = 5e-3;
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
      o !== null && (i = t.getPose(e.targetRaySpace, n), i === null && r !== null && (i = r), i !== null && (o.matrix.fromArray(i.transform.matrix), o.matrix.decompose(o.position, o.rotation, o.scale), o.matrixWorldNeedsUpdate = !0, i.linearVelocity ? (o.hasLinearVelocity = !0, o.linearVelocity.copy(i.linearVelocity)) : o.hasLinearVelocity = !1, i.angularVelocity ? (o.hasAngularVelocity = !0, o.angularVelocity.copy(i.angularVelocity)) : o.hasAngularVelocity = !1, this.dispatchEvent(Up)));
    }
    return o !== null && (o.visible = i !== null), c !== null && (c.visible = r !== null), l !== null && (l.visible = a !== null), this;
  }
  // private method
  _getHandJoint(e, t) {
    if (e.joints[t.jointName] === void 0) {
      const n = new It();
      n.matrixAutoUpdate = !1, n.visible = !1, e.joints[t.jointName] = n, e.add(n);
    }
    return e.joints[t.jointName];
  }
}
const Np = `
void main() {

	gl_Position = vec4( position, 1.0 );

}`, Fp = `
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
class Bp {
  constructor() {
    this.texture = null, this.mesh = null, this.depthNear = 0, this.depthFar = 0;
  }
  init(e, t, n) {
    if (this.texture === null) {
      const i = new Ft(), r = e.properties.get(i);
      r.__webglTexture = t.texture, (t.depthNear != n.depthNear || t.depthFar != n.depthFar) && (this.depthNear = t.depthNear, this.depthFar = t.depthFar), this.texture = i;
    }
  }
  getMesh(e) {
    if (this.texture !== null && this.mesh === null) {
      const t = e.cameras[0].viewport, n = new Qn({
        vertexShader: Np,
        fragmentShader: Fp,
        uniforms: {
          depthColor: { value: this.texture },
          depthWidth: { value: t.z },
          depthHeight: { value: t.w }
        }
      });
      this.mesh = new Le(new ei(20, 20), n);
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
class Op extends xi {
  constructor(e, t) {
    super();
    const n = this;
    let i = null, r = 1, a = null, o = "local-floor", c = 1, l = null, u = null, h = null, d = null, f = null, g = null;
    const x = new Bp(), p = t.getContextAttributes();
    let m = null, T = null;
    const S = [], E = [], F = new qe();
    let P = null;
    const L = new en();
    L.layers.enable(1), L.viewport = new ut();
    const z = new en();
    z.layers.enable(2), z.viewport = new ut();
    const ee = [L, z], v = new Dp();
    v.layers.enable(1), v.layers.enable(2);
    let A = null, W = null;
    this.cameraAutoUpdate = !0, this.enabled = !1, this.isPresenting = !1, this.getController = function(Z) {
      let ce = S[Z];
      return ce === void 0 && (ce = new na(), S[Z] = ce), ce.getTargetRaySpace();
    }, this.getControllerGrip = function(Z) {
      let ce = S[Z];
      return ce === void 0 && (ce = new na(), S[Z] = ce), ce.getGripSpace();
    }, this.getHand = function(Z) {
      let ce = S[Z];
      return ce === void 0 && (ce = new na(), S[Z] = ce), ce.getHandSpace();
    };
    function q(Z) {
      const ce = E.indexOf(Z.inputSource);
      if (ce === -1)
        return;
      const Te = S[ce];
      Te !== void 0 && (Te.update(Z.inputSource, Z.frame, l || a), Te.dispatchEvent({ type: Z.type, data: Z.inputSource }));
    }
    function Y() {
      i.removeEventListener("select", q), i.removeEventListener("selectstart", q), i.removeEventListener("selectend", q), i.removeEventListener("squeeze", q), i.removeEventListener("squeezestart", q), i.removeEventListener("squeezeend", q), i.removeEventListener("end", Y), i.removeEventListener("inputsourceschange", se);
      for (let Z = 0; Z < S.length; Z++) {
        const ce = E[Z];
        ce !== null && (E[Z] = null, S[Z].disconnect(ce));
      }
      A = null, W = null, x.reset(), e.setRenderTarget(m), f = null, d = null, h = null, i = null, T = null, ht.stop(), n.isPresenting = !1, e.setPixelRatio(P), e.setSize(F.width, F.height, !1), n.dispatchEvent({ type: "sessionend" });
    }
    this.setFramebufferScaleFactor = function(Z) {
      r = Z, n.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.");
    }, this.setReferenceSpaceType = function(Z) {
      o = Z, n.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.");
    }, this.getReferenceSpace = function() {
      return l || a;
    }, this.setReferenceSpace = function(Z) {
      l = Z;
    }, this.getBaseLayer = function() {
      return d !== null ? d : f;
    }, this.getBinding = function() {
      return h;
    }, this.getFrame = function() {
      return g;
    }, this.getSession = function() {
      return i;
    }, this.setSession = async function(Z) {
      if (i = Z, i !== null) {
        if (m = e.getRenderTarget(), i.addEventListener("select", q), i.addEventListener("selectstart", q), i.addEventListener("selectend", q), i.addEventListener("squeeze", q), i.addEventListener("squeezestart", q), i.addEventListener("squeezeend", q), i.addEventListener("end", Y), i.addEventListener("inputsourceschange", se), p.xrCompatible !== !0 && await t.makeXRCompatible(), P = e.getPixelRatio(), e.getSize(F), i.renderState.layers === void 0) {
          const ce = {
            antialias: p.antialias,
            alpha: !0,
            depth: p.depth,
            stencil: p.stencil,
            framebufferScaleFactor: r
          };
          f = new XRWebGLLayer(i, t, ce), i.updateRenderState({ baseLayer: f }), e.setPixelRatio(1), e.setSize(f.framebufferWidth, f.framebufferHeight, !1), T = new _i(
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
          let ce = null, Te = null, ye = null;
          p.depth && (ye = p.stencil ? t.DEPTH24_STENCIL8 : t.DEPTH_COMPONENT24, ce = p.stencil ? 1027 : 1026, Te = p.stencil ? 1020 : 1014);
          const Xe = {
            colorFormat: t.RGBA8,
            depthFormat: ye,
            scaleFactor: r
          };
          h = new XRWebGLBinding(i, t), d = h.createProjectionLayer(Xe), i.updateRenderState({ layers: [d] }), e.setPixelRatio(1), e.setSize(d.textureWidth, d.textureHeight, !1), T = new _i(
            d.textureWidth,
            d.textureHeight,
            {
              format: 1023,
              type: 1009,
              depthTexture: new Ac(d.textureWidth, d.textureHeight, Te, void 0, void 0, void 0, void 0, void 0, void 0, ce),
              stencilBuffer: p.stencil,
              colorSpace: e.outputColorSpace,
              samples: p.antialias ? 4 : 0,
              resolveDepthBuffer: d.ignoreDepthValues === !1
            }
          );
        }
        T.isXRRenderTarget = !0, this.setFoveation(c), l = null, a = await i.requestReferenceSpace(o), ht.setContext(i), ht.start(), n.isPresenting = !0, n.dispatchEvent({ type: "sessionstart" });
      }
    }, this.getEnvironmentBlendMode = function() {
      if (i !== null)
        return i.environmentBlendMode;
    }, this.getDepthTexture = function() {
      return x.getDepthTexture();
    };
    function se(Z) {
      for (let ce = 0; ce < Z.removed.length; ce++) {
        const Te = Z.removed[ce], ye = E.indexOf(Te);
        ye >= 0 && (E[ye] = null, S[ye].disconnect(Te));
      }
      for (let ce = 0; ce < Z.added.length; ce++) {
        const Te = Z.added[ce];
        let ye = E.indexOf(Te);
        if (ye === -1) {
          for (let Be = 0; Be < S.length; Be++)
            if (Be >= E.length) {
              E.push(Te), ye = Be;
              break;
            } else if (E[Be] === null) {
              E[Be] = Te, ye = Be;
              break;
            }
          if (ye === -1) break;
        }
        const Xe = S[ye];
        Xe && Xe.connect(Te);
      }
    }
    const j = new N(), he = new N();
    function X(Z, ce, Te) {
      j.setFromMatrixPosition(ce.matrixWorld), he.setFromMatrixPosition(Te.matrixWorld);
      const ye = j.distanceTo(he), Xe = ce.projectionMatrix.elements, Be = Te.projectionMatrix.elements, et = Xe[14] / (Xe[10] - 1), ft = Xe[14] / (Xe[10] + 1), nt = (Xe[9] + 1) / Xe[5], U = (Xe[9] - 1) / Xe[5], Vt = (Xe[8] - 1) / Xe[0], Ze = (Be[8] + 1) / Be[0], it = et * Vt, Ne = et * Ze, _t = ye / (-Vt + Ze), Oe = _t * -Vt;
      if (ce.matrixWorld.decompose(Z.position, Z.quaternion, Z.scale), Z.translateX(Oe), Z.translateZ(_t), Z.matrixWorld.compose(Z.position, Z.quaternion, Z.scale), Z.matrixWorldInverse.copy(Z.matrixWorld).invert(), Xe[10] === -1)
        Z.projectionMatrix.copy(ce.projectionMatrix), Z.projectionMatrixInverse.copy(ce.projectionMatrixInverse);
      else {
        const C = et + _t, M = ft + _t, G = it - Oe, $ = Ne + (ye - Oe), re = nt * ft / M * C, J = U * ft / M * C;
        Z.projectionMatrix.makePerspective(G, $, re, J, C, M), Z.projectionMatrixInverse.copy(Z.projectionMatrix).invert();
      }
    }
    function xe(Z, ce) {
      ce === null ? Z.matrixWorld.copy(Z.matrix) : Z.matrixWorld.multiplyMatrices(ce.matrixWorld, Z.matrix), Z.matrixWorldInverse.copy(Z.matrixWorld).invert();
    }
    this.updateCamera = function(Z) {
      if (i === null) return;
      let ce = Z.near, Te = Z.far;
      x.texture !== null && (x.depthNear > 0 && (ce = x.depthNear), x.depthFar > 0 && (Te = x.depthFar)), v.near = z.near = L.near = ce, v.far = z.far = L.far = Te, (A !== v.near || W !== v.far) && (i.updateRenderState({
        depthNear: v.near,
        depthFar: v.far
      }), A = v.near, W = v.far);
      const ye = Z.parent, Xe = v.cameras;
      xe(v, ye);
      for (let Be = 0; Be < Xe.length; Be++)
        xe(Xe[Be], ye);
      Xe.length === 2 ? X(v, L, z) : v.projectionMatrix.copy(L.projectionMatrix), ve(Z, v, ye);
    };
    function ve(Z, ce, Te) {
      Te === null ? Z.matrix.copy(ce.matrixWorld) : (Z.matrix.copy(Te.matrixWorld), Z.matrix.invert(), Z.matrix.multiply(ce.matrixWorld)), Z.matrix.decompose(Z.position, Z.quaternion, Z.scale), Z.updateMatrixWorld(!0), Z.projectionMatrix.copy(ce.projectionMatrix), Z.projectionMatrixInverse.copy(ce.projectionMatrixInverse), Z.isPerspectiveCamera && (Z.fov = Zi * 2 * Math.atan(1 / Z.projectionMatrix.elements[5]), Z.zoom = 1);
    }
    this.getCamera = function() {
      return v;
    }, this.getFoveation = function() {
      if (!(d === null && f === null))
        return c;
    }, this.setFoveation = function(Z) {
      c = Z, d !== null && (d.fixedFoveation = Z), f !== null && f.fixedFoveation !== void 0 && (f.fixedFoveation = Z);
    }, this.hasDepthSensing = function() {
      return x.texture !== null;
    }, this.getDepthSensingMesh = function() {
      return x.getMesh(v);
    };
    let we = null;
    function Qe(Z, ce) {
      if (u = ce.getViewerPose(l || a), g = ce, u !== null) {
        const Te = u.views;
        f !== null && (e.setRenderTargetFramebuffer(T, f.framebuffer), e.setRenderTarget(T));
        let ye = !1;
        Te.length !== v.cameras.length && (v.cameras.length = 0, ye = !0);
        for (let Be = 0; Be < Te.length; Be++) {
          const et = Te[Be];
          let ft = null;
          if (f !== null)
            ft = f.getViewport(et);
          else {
            const U = h.getViewSubImage(d, et);
            ft = U.viewport, Be === 0 && (e.setRenderTargetTextures(
              T,
              U.colorTexture,
              d.ignoreDepthValues ? void 0 : U.depthStencilTexture
            ), e.setRenderTarget(T));
          }
          let nt = ee[Be];
          nt === void 0 && (nt = new en(), nt.layers.enable(Be), nt.viewport = new ut(), ee[Be] = nt), nt.matrix.fromArray(et.transform.matrix), nt.matrix.decompose(nt.position, nt.quaternion, nt.scale), nt.projectionMatrix.fromArray(et.projectionMatrix), nt.projectionMatrixInverse.copy(nt.projectionMatrix).invert(), nt.viewport.set(ft.x, ft.y, ft.width, ft.height), Be === 0 && (v.matrix.copy(nt.matrix), v.matrix.decompose(v.position, v.quaternion, v.scale)), ye === !0 && v.cameras.push(nt);
        }
        const Xe = i.enabledFeatures;
        if (Xe && Xe.includes("depth-sensing")) {
          const Be = h.getDepthInformation(Te[0]);
          Be && Be.isValid && Be.texture && x.init(e, Be, i.renderState);
        }
      }
      for (let Te = 0; Te < S.length; Te++) {
        const ye = E[Te], Xe = S[Te];
        ye !== null && Xe !== void 0 && Xe.update(ye, ce, l || a);
      }
      we && we(Z, ce), ce.detectedPlanes && n.dispatchEvent({ type: "planesdetected", data: ce }), g = null;
    }
    const ht = new Tc();
    ht.setAnimationLoop(Qe), this.setAnimationLoop = function(Z) {
      we = Z;
    }, this.dispose = function() {
    };
  }
}
const hi = /* @__PURE__ */ new Sn(), kp = /* @__PURE__ */ new je();
function zp(s, e) {
  function t(p, m) {
    p.matrixAutoUpdate === !0 && p.updateMatrix(), m.value.copy(p.matrix);
  }
  function n(p, m) {
    m.color.getRGB(p.fogColor.value, yc(s)), m.isFog ? (p.fogNear.value = m.near, p.fogFar.value = m.far) : m.isFogExp2 && (p.fogDensity.value = m.density);
  }
  function i(p, m, T, S, E) {
    m.isMeshBasicMaterial || m.isMeshLambertMaterial ? r(p, m) : m.isMeshToonMaterial ? (r(p, m), h(p, m)) : m.isMeshPhongMaterial ? (r(p, m), u(p, m)) : m.isMeshStandardMaterial ? (r(p, m), d(p, m), m.isMeshPhysicalMaterial && f(p, m, E)) : m.isMeshMatcapMaterial ? (r(p, m), g(p, m)) : m.isMeshDepthMaterial ? r(p, m) : m.isMeshDistanceMaterial ? (r(p, m), x(p, m)) : m.isMeshNormalMaterial ? r(p, m) : m.isLineBasicMaterial ? (a(p, m), m.isLineDashedMaterial && o(p, m)) : m.isPointsMaterial ? c(p, m, T, S) : m.isSpriteMaterial ? l(p, m) : m.isShadowMaterial ? (p.color.value.copy(m.color), p.opacity.value = m.opacity) : m.isShaderMaterial && (m.uniformsNeedUpdate = !1);
  }
  function r(p, m) {
    p.opacity.value = m.opacity, m.color && p.diffuse.value.copy(m.color), m.emissive && p.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity), m.map && (p.map.value = m.map, t(m.map, p.mapTransform)), m.alphaMap && (p.alphaMap.value = m.alphaMap, t(m.alphaMap, p.alphaMapTransform)), m.bumpMap && (p.bumpMap.value = m.bumpMap, t(m.bumpMap, p.bumpMapTransform), p.bumpScale.value = m.bumpScale, m.side === 1 && (p.bumpScale.value *= -1)), m.normalMap && (p.normalMap.value = m.normalMap, t(m.normalMap, p.normalMapTransform), p.normalScale.value.copy(m.normalScale), m.side === 1 && p.normalScale.value.negate()), m.displacementMap && (p.displacementMap.value = m.displacementMap, t(m.displacementMap, p.displacementMapTransform), p.displacementScale.value = m.displacementScale, p.displacementBias.value = m.displacementBias), m.emissiveMap && (p.emissiveMap.value = m.emissiveMap, t(m.emissiveMap, p.emissiveMapTransform)), m.specularMap && (p.specularMap.value = m.specularMap, t(m.specularMap, p.specularMapTransform)), m.alphaTest > 0 && (p.alphaTest.value = m.alphaTest);
    const T = e.get(m), S = T.envMap, E = T.envMapRotation;
    S && (p.envMap.value = S, hi.copy(E), hi.x *= -1, hi.y *= -1, hi.z *= -1, S.isCubeTexture && S.isRenderTargetTexture === !1 && (hi.y *= -1, hi.z *= -1), p.envMapRotation.value.setFromMatrix4(kp.makeRotationFromEuler(hi)), p.flipEnvMap.value = S.isCubeTexture && S.isRenderTargetTexture === !1 ? -1 : 1, p.reflectivity.value = m.reflectivity, p.ior.value = m.ior, p.refractionRatio.value = m.refractionRatio), m.lightMap && (p.lightMap.value = m.lightMap, p.lightMapIntensity.value = m.lightMapIntensity, t(m.lightMap, p.lightMapTransform)), m.aoMap && (p.aoMap.value = m.aoMap, p.aoMapIntensity.value = m.aoMapIntensity, t(m.aoMap, p.aoMapTransform));
  }
  function a(p, m) {
    p.diffuse.value.copy(m.color), p.opacity.value = m.opacity, m.map && (p.map.value = m.map, t(m.map, p.mapTransform));
  }
  function o(p, m) {
    p.dashSize.value = m.dashSize, p.totalSize.value = m.dashSize + m.gapSize, p.scale.value = m.scale;
  }
  function c(p, m, T, S) {
    p.diffuse.value.copy(m.color), p.opacity.value = m.opacity, p.size.value = m.size * T, p.scale.value = S * 0.5, m.map && (p.map.value = m.map, t(m.map, p.uvTransform)), m.alphaMap && (p.alphaMap.value = m.alphaMap, t(m.alphaMap, p.alphaMapTransform)), m.alphaTest > 0 && (p.alphaTest.value = m.alphaTest);
  }
  function l(p, m) {
    p.diffuse.value.copy(m.color), p.opacity.value = m.opacity, p.rotation.value = m.rotation, m.map && (p.map.value = m.map, t(m.map, p.mapTransform)), m.alphaMap && (p.alphaMap.value = m.alphaMap, t(m.alphaMap, p.alphaMapTransform)), m.alphaTest > 0 && (p.alphaTest.value = m.alphaTest);
  }
  function u(p, m) {
    p.specular.value.copy(m.specular), p.shininess.value = Math.max(m.shininess, 1e-4);
  }
  function h(p, m) {
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
  function x(p, m) {
    const T = e.get(m).light;
    p.referencePosition.value.setFromMatrixPosition(T.matrixWorld), p.nearDistance.value = T.shadow.camera.near, p.farDistance.value = T.shadow.camera.far;
  }
  return {
    refreshFogUniforms: n,
    refreshMaterialUniforms: i
  };
}
function Gp(s, e, t, n) {
  let i = {}, r = {}, a = [];
  const o = s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);
  function c(T, S) {
    const E = S.program;
    n.uniformBlockBinding(T, E);
  }
  function l(T, S) {
    let E = i[T.id];
    E === void 0 && (g(T), E = u(T), i[T.id] = E, T.addEventListener("dispose", p));
    const F = S.program;
    n.updateUBOMapping(T, F);
    const P = e.render.frame;
    r[T.id] !== P && (d(T), r[T.id] = P);
  }
  function u(T) {
    const S = h();
    T.__bindingPointIndex = S;
    const E = s.createBuffer(), F = T.__size, P = T.usage;
    return s.bindBuffer(s.UNIFORM_BUFFER, E), s.bufferData(s.UNIFORM_BUFFER, F, P), s.bindBuffer(s.UNIFORM_BUFFER, null), s.bindBufferBase(s.UNIFORM_BUFFER, S, E), E;
  }
  function h() {
    for (let T = 0; T < o; T++)
      if (a.indexOf(T) === -1)
        return a.push(T), T;
    return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."), 0;
  }
  function d(T) {
    const S = i[T.id], E = T.uniforms, F = T.__cache;
    s.bindBuffer(s.UNIFORM_BUFFER, S);
    for (let P = 0, L = E.length; P < L; P++) {
      const z = Array.isArray(E[P]) ? E[P] : [E[P]];
      for (let ee = 0, v = z.length; ee < v; ee++) {
        const A = z[ee];
        if (f(A, P, ee, F) === !0) {
          const W = A.__offset, q = Array.isArray(A.value) ? A.value : [A.value];
          let Y = 0;
          for (let se = 0; se < q.length; se++) {
            const j = q[se], he = x(j);
            typeof j == "number" || typeof j == "boolean" ? (A.__data[0] = j, s.bufferSubData(s.UNIFORM_BUFFER, W + Y, A.__data)) : j.isMatrix3 ? (A.__data[0] = j.elements[0], A.__data[1] = j.elements[1], A.__data[2] = j.elements[2], A.__data[3] = 0, A.__data[4] = j.elements[3], A.__data[5] = j.elements[4], A.__data[6] = j.elements[5], A.__data[7] = 0, A.__data[8] = j.elements[6], A.__data[9] = j.elements[7], A.__data[10] = j.elements[8], A.__data[11] = 0) : (j.toArray(A.__data, Y), Y += he.storage / Float32Array.BYTES_PER_ELEMENT);
          }
          s.bufferSubData(s.UNIFORM_BUFFER, W, A.__data);
        }
      }
    }
    s.bindBuffer(s.UNIFORM_BUFFER, null);
  }
  function f(T, S, E, F) {
    const P = T.value, L = S + "_" + E;
    if (F[L] === void 0)
      return typeof P == "number" || typeof P == "boolean" ? F[L] = P : F[L] = P.clone(), !0;
    {
      const z = F[L];
      if (typeof P == "number" || typeof P == "boolean") {
        if (z !== P)
          return F[L] = P, !0;
      } else if (z.equals(P) === !1)
        return z.copy(P), !0;
    }
    return !1;
  }
  function g(T) {
    const S = T.uniforms;
    let E = 0;
    const F = 16;
    for (let L = 0, z = S.length; L < z; L++) {
      const ee = Array.isArray(S[L]) ? S[L] : [S[L]];
      for (let v = 0, A = ee.length; v < A; v++) {
        const W = ee[v], q = Array.isArray(W.value) ? W.value : [W.value];
        for (let Y = 0, se = q.length; Y < se; Y++) {
          const j = q[Y], he = x(j), X = E % F, xe = X % he.boundary, ve = X + xe;
          E += xe, ve !== 0 && F - ve < he.storage && (E += F - ve), W.__data = new Float32Array(he.storage / Float32Array.BYTES_PER_ELEMENT), W.__offset = E, E += he.storage;
        }
      }
    }
    const P = E % F;
    return P > 0 && (E += F - P), T.__size = E, T.__cache = {}, this;
  }
  function x(T) {
    const S = {
      boundary: 0,
      // bytes
      storage: 0
      // bytes
    };
    return typeof T == "number" || typeof T == "boolean" ? (S.boundary = 4, S.storage = 4) : T.isVector2 ? (S.boundary = 8, S.storage = 8) : T.isVector3 || T.isColor ? (S.boundary = 16, S.storage = 12) : T.isVector4 ? (S.boundary = 16, S.storage = 16) : T.isMatrix3 ? (S.boundary = 48, S.storage = 48) : T.isMatrix4 ? (S.boundary = 64, S.storage = 64) : T.isTexture ? console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.") : console.warn("THREE.WebGLRenderer: Unsupported uniform value type.", T), S;
  }
  function p(T) {
    const S = T.target;
    S.removeEventListener("dispose", p);
    const E = a.indexOf(S.__bindingPointIndex);
    a.splice(E, 1), s.deleteBuffer(i[S.id]), delete i[S.id], delete r[S.id];
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
class Hp {
  constructor(e = {}) {
    const {
      canvas: t = Rl(),
      context: n = null,
      depth: i = !0,
      stencil: r = !1,
      alpha: a = !1,
      antialias: o = !1,
      premultipliedAlpha: c = !0,
      preserveDrawingBuffer: l = !1,
      powerPreference: u = "default",
      failIfMajorPerformanceCaveat: h = !1
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
    let x = null, p = null;
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
    }, this.autoClear = !0, this.autoClearColor = !0, this.autoClearDepth = !0, this.autoClearStencil = !0, this.sortObjects = !0, this.clippingPlanes = [], this.localClippingEnabled = !1, this._outputColorSpace = wt, this.toneMapping = 0, this.toneMappingExposure = 1;
    const S = this;
    let E = !1, F = 0, P = 0, L = null, z = -1, ee = null;
    const v = new ut(), A = new ut();
    let W = null;
    const q = new De(0);
    let Y = 0, se = t.width, j = t.height, he = 1, X = null, xe = null;
    const ve = new ut(0, 0, se, j), we = new ut(0, 0, se, j);
    let Qe = !1;
    const ht = new ba();
    let Z = !1, ce = !1;
    const Te = new je(), ye = new je(), Xe = new N(), Be = new ut(), et = { background: null, fog: null, environment: null, overrideMaterial: null, isScene: !0 };
    let ft = !1;
    function nt() {
      return L === null ? he : 1;
    }
    let U = n;
    function Vt(y, O) {
      return t.getContext(y, O);
    }
    try {
      const y = {
        alpha: !0,
        depth: i,
        stencil: r,
        antialias: o,
        premultipliedAlpha: c,
        preserveDrawingBuffer: l,
        powerPreference: u,
        failIfMajorPerformanceCaveat: h
      };
      if ("setAttribute" in t && t.setAttribute("data-engine", `three.js r${Sa}`), t.addEventListener("webglcontextlost", te, !1), t.addEventListener("webglcontextrestored", ge, !1), t.addEventListener("webglcontextcreationerror", _e, !1), U === null) {
        const O = "webgl2";
        if (U = Vt(O, y), U === null)
          throw Vt(O) ? new Error("Error creating WebGL context with your selected attributes.") : new Error("Error creating WebGL context.");
      }
    } catch (y) {
      throw console.error("THREE.WebGLRenderer: " + y.message), y;
    }
    let Ze, it, Ne, _t, Oe, C, M, G, $, re, J, Re, ie, ae, D, ue, Ee, Ge, He, Se, tt, Ve, xt, B;
    function fe() {
      Ze = new qd(U), Ze.init(), Ve = new Lp(U, Ze), it = new zd(U, Ze, e, Ve), Ne = new Cp(U), it.reverseDepthBuffer && Ne.buffers.depth.setReversed(!0), _t = new Kd(U), Oe = new pp(), C = new Pp(U, Ze, Ne, Oe, it, Ve, _t), M = new Hd(S), G = new Xd(S), $ = new nh(U), xt = new Od(U, $), re = new jd(U, $, _t, xt), J = new $d(U, re, $, _t), He = new Zd(U, it, C), ue = new Gd(Oe), Re = new fp(S, M, G, Ze, it, xt, ue), ie = new zp(S, Oe), ae = new gp(), D = new Sp(Ze), Ge = new Bd(S, M, G, Ne, J, d, c), Ee = new wp(S, J, it), B = new Gp(U, _t, it, Ne), Se = new kd(U, Ze, _t), tt = new Yd(U, Ze, _t), _t.programs = Re.programs, S.capabilities = it, S.extensions = Ze, S.properties = Oe, S.renderLists = ae, S.shadowMap = Ee, S.state = Ne, S.info = _t;
    }
    fe();
    const K = new Op(S, U);
    this.xr = K, this.getContext = function() {
      return U;
    }, this.getContextAttributes = function() {
      return U.getContextAttributes();
    }, this.forceContextLoss = function() {
      const y = Ze.get("WEBGL_lose_context");
      y && y.loseContext();
    }, this.forceContextRestore = function() {
      const y = Ze.get("WEBGL_lose_context");
      y && y.restoreContext();
    }, this.getPixelRatio = function() {
      return he;
    }, this.setPixelRatio = function(y) {
      y !== void 0 && (he = y, this.setSize(se, j, !1));
    }, this.getSize = function(y) {
      return y.set(se, j);
    }, this.setSize = function(y, O, H = !0) {
      if (K.isPresenting) {
        console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");
        return;
      }
      se = y, j = O, t.width = Math.floor(y * he), t.height = Math.floor(O * he), H === !0 && (t.style.width = y + "px", t.style.height = O + "px"), this.setViewport(0, 0, y, O);
    }, this.getDrawingBufferSize = function(y) {
      return y.set(se * he, j * he).floor();
    }, this.setDrawingBufferSize = function(y, O, H) {
      se = y, j = O, he = H, t.width = Math.floor(y * H), t.height = Math.floor(O * H), this.setViewport(0, 0, y, O);
    }, this.getCurrentViewport = function(y) {
      return y.copy(v);
    }, this.getViewport = function(y) {
      return y.copy(ve);
    }, this.setViewport = function(y, O, H, V) {
      y.isVector4 ? ve.set(y.x, y.y, y.z, y.w) : ve.set(y, O, H, V), Ne.viewport(v.copy(ve).multiplyScalar(he).round());
    }, this.getScissor = function(y) {
      return y.copy(we);
    }, this.setScissor = function(y, O, H, V) {
      y.isVector4 ? we.set(y.x, y.y, y.z, y.w) : we.set(y, O, H, V), Ne.scissor(A.copy(we).multiplyScalar(he).round());
    }, this.getScissorTest = function() {
      return Qe;
    }, this.setScissorTest = function(y) {
      Ne.setScissorTest(Qe = y);
    }, this.setOpaqueSort = function(y) {
      X = y;
    }, this.setTransparentSort = function(y) {
      xe = y;
    }, this.getClearColor = function(y) {
      return y.copy(Ge.getClearColor());
    }, this.setClearColor = function() {
      Ge.setClearColor.apply(Ge, arguments);
    }, this.getClearAlpha = function() {
      return Ge.getClearAlpha();
    }, this.setClearAlpha = function() {
      Ge.setClearAlpha.apply(Ge, arguments);
    }, this.clear = function(y = !0, O = !0, H = !0) {
      let V = 0;
      if (y) {
        let k = !1;
        if (L !== null) {
          const de = L.texture.format;
          k = de === 1033 || de === 1031 || de === 1029;
        }
        if (k) {
          const de = L.texture.type, pe = de === 1009 || de === 1014 || de === 1012 || de === 1020 || de === 1017 || de === 1018, Me = Ge.getClearColor(), Ae = Ge.getClearAlpha(), Fe = Me.r, ke = Me.g, Ce = Me.b;
          pe ? (f[0] = Fe, f[1] = ke, f[2] = Ce, f[3] = Ae, U.clearBufferuiv(U.COLOR, 0, f)) : (g[0] = Fe, g[1] = ke, g[2] = Ce, g[3] = Ae, U.clearBufferiv(U.COLOR, 0, g));
        } else
          V |= U.COLOR_BUFFER_BIT;
      }
      O && (V |= U.DEPTH_BUFFER_BIT, U.clearDepth(this.capabilities.reverseDepthBuffer ? 0 : 1)), H && (V |= U.STENCIL_BUFFER_BIT, this.state.buffers.stencil.setMask(4294967295)), U.clear(V);
    }, this.clearColor = function() {
      this.clear(!0, !1, !1);
    }, this.clearDepth = function() {
      this.clear(!1, !0, !1);
    }, this.clearStencil = function() {
      this.clear(!1, !1, !0);
    }, this.dispose = function() {
      t.removeEventListener("webglcontextlost", te, !1), t.removeEventListener("webglcontextrestored", ge, !1), t.removeEventListener("webglcontextcreationerror", _e, !1), ae.dispose(), D.dispose(), Oe.dispose(), M.dispose(), G.dispose(), J.dispose(), xt.dispose(), B.dispose(), Re.dispose(), K.dispose(), K.removeEventListener("sessionstart", vi), K.removeEventListener("sessionend", Mi), Tn.stop();
    };
    function te(y) {
      y.preventDefault(), console.log("THREE.WebGLRenderer: Context Lost."), E = !0;
    }
    function ge() {
      console.log("THREE.WebGLRenderer: Context Restored."), E = !1;
      const y = _t.autoReset, O = Ee.enabled, H = Ee.autoUpdate, V = Ee.needsUpdate, k = Ee.type;
      fe(), _t.autoReset = y, Ee.enabled = O, Ee.autoUpdate = H, Ee.needsUpdate = V, Ee.type = k;
    }
    function _e(y) {
      console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ", y.statusMessage);
    }
    function $e(y) {
      const O = y.target;
      O.removeEventListener("dispose", $e), bt(O);
    }
    function bt(y) {
      Dt(y), Oe.remove(y);
    }
    function Dt(y) {
      const O = Oe.get(y).programs;
      O !== void 0 && (O.forEach(function(H) {
        Re.releaseProgram(H);
      }), y.isShaderMaterial && Re.releaseShaderCache(y));
    }
    this.renderBufferDirect = function(y, O, H, V, k, de) {
      O === null && (O = et);
      const pe = k.isMesh && k.matrixWorld.determinant() < 0, Me = ss(y, O, H, V, k);
      Ne.setMaterial(V, pe);
      let Ae = H.index, Fe = 1;
      if (V.wireframe === !0) {
        if (Ae = re.getWireframeAttribute(H), Ae === void 0) return;
        Fe = 2;
      }
      const ke = H.drawRange, Ce = H.attributes.position;
      let ot = ke.start * Fe, mt = (ke.start + ke.count) * Fe;
      de !== null && (ot = Math.max(ot, de.start * Fe), mt = Math.min(mt, (de.start + de.count) * Fe)), Ae !== null ? (ot = Math.max(ot, 0), mt = Math.min(mt, Ae.count)) : Ce != null && (ot = Math.max(ot, 0), mt = Math.min(mt, Ce.count));
      const vt = mt - ot;
      if (vt < 0 || vt === 1 / 0) return;
      xt.setup(k, V, Me, H, Ae);
      let zt, lt = Se;
      if (Ae !== null && (zt = $.get(Ae), lt = tt, lt.setIndex(zt)), k.isMesh)
        V.wireframe === !0 ? (Ne.setLineWidth(V.wireframeLinewidth * nt()), lt.setMode(U.LINES)) : lt.setMode(U.TRIANGLES);
      else if (k.isLine) {
        let Ie = V.linewidth;
        Ie === void 0 && (Ie = 1), Ne.setLineWidth(Ie * nt()), k.isLineSegments ? lt.setMode(U.LINES) : k.isLineLoop ? lt.setMode(U.LINE_LOOP) : lt.setMode(U.LINE_STRIP);
      } else k.isPoints ? lt.setMode(U.POINTS) : k.isSprite && lt.setMode(U.TRIANGLES);
      if (k.isBatchedMesh)
        if (k._multiDrawInstances !== null)
          lt.renderMultiDrawInstances(k._multiDrawStarts, k._multiDrawCounts, k._multiDrawCount, k._multiDrawInstances);
        else if (Ze.get("WEBGL_multi_draw"))
          lt.renderMultiDraw(k._multiDrawStarts, k._multiDrawCounts, k._multiDrawCount);
        else {
          const Ie = k._multiDrawStarts, Ut = k._multiDrawCounts, ct = k._multiDrawCount, tn = Ae ? $.get(Ae).bytesPerElement : 1, An = Oe.get(V).currentProgram.getUniforms();
          for (let Yt = 0; Yt < ct; Yt++)
            An.setValue(U, "_gl_DrawID", Yt), lt.render(Ie[Yt] / tn, Ut[Yt]);
        }
      else if (k.isInstancedMesh)
        lt.renderInstances(ot, vt, k.count);
      else if (H.isInstancedBufferGeometry) {
        const Ie = H._maxInstanceCount !== void 0 ? H._maxInstanceCount : 1 / 0, Ut = Math.min(H.instanceCount, Ie);
        lt.renderInstances(ot, vt, Ut);
      } else
        lt.render(ot, vt);
    };
    function st(y, O, H) {
      y.transparent === !0 && y.side === 2 && y.forceSinglePass === !1 ? (y.side = 1, y.needsUpdate = !0, Gn(y, O, H), y.side = 0, y.needsUpdate = !0, Gn(y, O, H), y.side = 2) : Gn(y, O, H);
    }
    this.compile = function(y, O, H = null) {
      H === null && (H = y), p = D.get(H), p.init(O), T.push(p), H.traverseVisible(function(k) {
        k.isLight && k.layers.test(O.layers) && (p.pushLight(k), k.castShadow && p.pushShadow(k));
      }), y !== H && y.traverseVisible(function(k) {
        k.isLight && k.layers.test(O.layers) && (p.pushLight(k), k.castShadow && p.pushShadow(k));
      }), p.setupLights();
      const V = /* @__PURE__ */ new Set();
      return y.traverse(function(k) {
        if (!(k.isMesh || k.isPoints || k.isLine || k.isSprite))
          return;
        const de = k.material;
        if (de)
          if (Array.isArray(de))
            for (let pe = 0; pe < de.length; pe++) {
              const Me = de[pe];
              st(Me, H, k), V.add(Me);
            }
          else
            st(de, H, k), V.add(de);
      }), T.pop(), p = null, V;
    }, this.compileAsync = function(y, O, H = null) {
      const V = this.compile(y, O, H);
      return new Promise((k) => {
        function de() {
          if (V.forEach(function(pe) {
            Oe.get(pe).currentProgram.isReady() && V.delete(pe);
          }), V.size === 0) {
            k(y);
            return;
          }
          setTimeout(de, 10);
        }
        Ze.get("KHR_parallel_shader_compile") !== null ? de() : setTimeout(de, 10);
      });
    };
    let Ct = null;
    function Qt(y) {
      Ct && Ct(y);
    }
    function vi() {
      Tn.stop();
    }
    function Mi() {
      Tn.start();
    }
    const Tn = new Tc();
    Tn.setAnimationLoop(Qt), typeof self < "u" && Tn.setContext(self), this.setAnimationLoop = function(y) {
      Ct = y, K.setAnimationLoop(y), y === null ? Tn.stop() : Tn.start();
    }, K.addEventListener("sessionstart", vi), K.addEventListener("sessionend", Mi), this.render = function(y, O) {
      if (O !== void 0 && O.isCamera !== !0) {
        console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");
        return;
      }
      if (E === !0) return;
      if (y.matrixWorldAutoUpdate === !0 && y.updateMatrixWorld(), O.parent === null && O.matrixWorldAutoUpdate === !0 && O.updateMatrixWorld(), K.enabled === !0 && K.isPresenting === !0 && (K.cameraAutoUpdate === !0 && K.updateCamera(O), O = K.getCamera()), y.isScene === !0 && y.onBeforeRender(S, y, O, L), p = D.get(y, T.length), p.init(O), T.push(p), ye.multiplyMatrices(O.projectionMatrix, O.matrixWorldInverse), ht.setFromProjectionMatrix(ye), ce = this.localClippingEnabled, Z = ue.init(this.clippingPlanes, ce), x = ae.get(y, m.length), x.init(), m.push(x), K.enabled === !0 && K.isPresenting === !0) {
        const de = S.xr.getDepthSensingMesh();
        de !== null && zn(de, O, -1 / 0, S.sortObjects);
      }
      zn(y, O, 0, S.sortObjects), x.finish(), S.sortObjects === !0 && x.sort(X, xe), ft = K.enabled === !1 || K.isPresenting === !1 || K.hasDepthSensing() === !1, ft && Ge.addToRenderList(x, y), this.info.render.frame++, Z === !0 && ue.beginShadows();
      const H = p.state.shadowsArray;
      Ee.render(H, y, O), Z === !0 && ue.endShadows(), this.info.autoReset === !0 && this.info.reset();
      const V = x.opaque, k = x.transmissive;
      if (p.setupLights(), O.isArrayCamera) {
        const de = O.cameras;
        if (k.length > 0)
          for (let pe = 0, Me = de.length; pe < Me; pe++) {
            const Ae = de[pe];
            fn(V, k, y, Ae);
          }
        ft && Ge.render(y);
        for (let pe = 0, Me = de.length; pe < Me; pe++) {
          const Ae = de[pe];
          yi(x, y, Ae, Ae.viewport);
        }
      } else
        k.length > 0 && fn(V, k, y, O), ft && Ge.render(y), yi(x, y, O);
      L !== null && (C.updateMultisampleRenderTarget(L), C.updateRenderTargetMipmap(L)), y.isScene === !0 && y.onAfterRender(S, y, O), xt.resetDefaultState(), z = -1, ee = null, T.pop(), T.length > 0 ? (p = T[T.length - 1], Z === !0 && ue.setGlobalState(S.clippingPlanes, p.state.camera)) : p = null, m.pop(), m.length > 0 ? x = m[m.length - 1] : x = null;
    };
    function zn(y, O, H, V) {
      if (y.visible === !1) return;
      if (y.layers.test(O.layers)) {
        if (y.isGroup)
          H = y.renderOrder;
        else if (y.isLOD)
          y.autoUpdate === !0 && y.update(O);
        else if (y.isLight)
          p.pushLight(y), y.castShadow && p.pushShadow(y);
        else if (y.isSprite) {
          if (!y.frustumCulled || ht.intersectsSprite(y)) {
            V && Be.setFromMatrixPosition(y.matrixWorld).applyMatrix4(ye);
            const pe = J.update(y), Me = y.material;
            Me.visible && x.push(y, pe, Me, H, Be.z, null);
          }
        } else if ((y.isMesh || y.isLine || y.isPoints) && (!y.frustumCulled || ht.intersectsObject(y))) {
          const pe = J.update(y), Me = y.material;
          if (V && (y.boundingSphere !== void 0 ? (y.boundingSphere === null && y.computeBoundingSphere(), Be.copy(y.boundingSphere.center)) : (pe.boundingSphere === null && pe.computeBoundingSphere(), Be.copy(pe.boundingSphere.center)), Be.applyMatrix4(y.matrixWorld).applyMatrix4(ye)), Array.isArray(Me)) {
            const Ae = pe.groups;
            for (let Fe = 0, ke = Ae.length; Fe < ke; Fe++) {
              const Ce = Ae[Fe], ot = Me[Ce.materialIndex];
              ot && ot.visible && x.push(y, pe, ot, H, Be.z, Ce);
            }
          } else Me.visible && x.push(y, pe, Me, H, Be.z, null);
        }
      }
      const de = y.children;
      for (let pe = 0, Me = de.length; pe < Me; pe++)
        zn(de[pe], O, H, V);
    }
    function yi(y, O, H, V) {
      const k = y.opaque, de = y.transmissive, pe = y.transparent;
      p.setupLightsView(H), Z === !0 && ue.setGlobalState(S.clippingPlanes, H), V && Ne.viewport(v.copy(V)), k.length > 0 && an(k, O, H), de.length > 0 && an(de, O, H), pe.length > 0 && an(pe, O, H), Ne.buffers.depth.setTest(!0), Ne.buffers.depth.setMask(!0), Ne.buffers.color.setMask(!0), Ne.setPolygonOffset(!1);
    }
    function fn(y, O, H, V) {
      if ((H.isScene === !0 ? H.overrideMaterial : null) !== null)
        return;
      p.state.transmissionRenderTarget[V.id] === void 0 && (p.state.transmissionRenderTarget[V.id] = new _i(1, 1, {
        generateMipmaps: !0,
        type: Ze.has("EXT_color_buffer_half_float") || Ze.has("EXT_color_buffer_float") ? 1016 : 1009,
        minFilter: 1008,
        samples: 4,
        stencilBuffer: r,
        resolveDepthBuffer: !1,
        resolveStencilBuffer: !1,
        colorSpace: at.workingColorSpace
      }));
      const de = p.state.transmissionRenderTarget[V.id], pe = V.viewport || v;
      de.setSize(pe.z, pe.w);
      const Me = S.getRenderTarget();
      S.setRenderTarget(de), S.getClearColor(q), Y = S.getClearAlpha(), Y < 1 && S.setClearColor(16777215, 0.5), S.clear(), ft && Ge.render(H);
      const Ae = S.toneMapping;
      S.toneMapping = 0;
      const Fe = V.viewport;
      if (V.viewport !== void 0 && (V.viewport = void 0), p.setupLightsView(V), Z === !0 && ue.setGlobalState(S.clippingPlanes, V), an(y, H, V), C.updateMultisampleRenderTarget(de), C.updateRenderTargetMipmap(de), Ze.has("WEBGL_multisampled_render_to_texture") === !1) {
        let ke = !1;
        for (let Ce = 0, ot = O.length; Ce < ot; Ce++) {
          const mt = O[Ce], vt = mt.object, zt = mt.geometry, lt = mt.material, Ie = mt.group;
          if (lt.side === 2 && vt.layers.test(V.layers)) {
            const Ut = lt.side;
            lt.side = 1, lt.needsUpdate = !0, Ts(vt, H, V, zt, lt, Ie), lt.side = Ut, lt.needsUpdate = !0, ke = !0;
          }
        }
        ke === !0 && (C.updateMultisampleRenderTarget(de), C.updateRenderTargetMipmap(de));
      }
      S.setRenderTarget(Me), S.setClearColor(q, Y), Fe !== void 0 && (V.viewport = Fe), S.toneMapping = Ae;
    }
    function an(y, O, H) {
      const V = O.isScene === !0 ? O.overrideMaterial : null;
      for (let k = 0, de = y.length; k < de; k++) {
        const pe = y[k], Me = pe.object, Ae = pe.geometry, Fe = V === null ? pe.material : V, ke = pe.group;
        Me.layers.test(H.layers) && Ts(Me, O, H, Ae, Fe, ke);
      }
    }
    function Ts(y, O, H, V, k, de) {
      y.onBeforeRender(S, O, H, V, k, de), y.modelViewMatrix.multiplyMatrices(H.matrixWorldInverse, y.matrixWorld), y.normalMatrix.getNormalMatrix(y.modelViewMatrix), k.onBeforeRender(S, O, H, V, y, de), k.transparent === !0 && k.side === 2 && k.forceSinglePass === !1 ? (k.side = 1, k.needsUpdate = !0, S.renderBufferDirect(H, O, V, k, y, de), k.side = 0, k.needsUpdate = !0, S.renderBufferDirect(H, O, V, k, y, de), k.side = 2) : S.renderBufferDirect(H, O, V, k, y, de), y.onAfterRender(S, O, H, V, k, de);
    }
    function Gn(y, O, H) {
      O.isScene !== !0 && (O = et);
      const V = Oe.get(y), k = p.state.lights, de = p.state.shadowsArray, pe = k.state.version, Me = Re.getParameters(y, k.state, de, O, H), Ae = Re.getProgramCacheKey(Me);
      let Fe = V.programs;
      V.environment = y.isMeshStandardMaterial ? O.environment : null, V.fog = O.fog, V.envMap = (y.isMeshStandardMaterial ? G : M).get(y.envMap || V.environment), V.envMapRotation = V.environment !== null && y.envMap === null ? O.environmentRotation : y.envMapRotation, Fe === void 0 && (y.addEventListener("dispose", $e), Fe = /* @__PURE__ */ new Map(), V.programs = Fe);
      let ke = Fe.get(Ae);
      if (ke !== void 0) {
        if (V.currentProgram === ke && V.lightsStateVersion === pe)
          return ni(y, Me), ke;
      } else
        Me.uniforms = Re.getUniforms(y), y.onBeforeCompile(Me, S), ke = Re.acquireProgram(Me, Ae), Fe.set(Ae, ke), V.uniforms = Me.uniforms;
      const Ce = V.uniforms;
      return (!y.isShaderMaterial && !y.isRawShaderMaterial || y.clipping === !0) && (Ce.clippingPlanes = ue.uniform), ni(y, Me), V.needsLights = Hn(y), V.lightsStateVersion = pe, V.needsLights && (Ce.ambientLightColor.value = k.state.ambient, Ce.lightProbe.value = k.state.probe, Ce.directionalLights.value = k.state.directional, Ce.directionalLightShadows.value = k.state.directionalShadow, Ce.spotLights.value = k.state.spot, Ce.spotLightShadows.value = k.state.spotShadow, Ce.rectAreaLights.value = k.state.rectArea, Ce.ltc_1.value = k.state.rectAreaLTC1, Ce.ltc_2.value = k.state.rectAreaLTC2, Ce.pointLights.value = k.state.point, Ce.pointLightShadows.value = k.state.pointShadow, Ce.hemisphereLights.value = k.state.hemi, Ce.directionalShadowMap.value = k.state.directionalShadowMap, Ce.directionalShadowMatrix.value = k.state.directionalShadowMatrix, Ce.spotShadowMap.value = k.state.spotShadowMap, Ce.spotLightMatrix.value = k.state.spotLightMatrix, Ce.spotLightMap.value = k.state.spotLightMap, Ce.pointShadowMap.value = k.state.pointShadowMap, Ce.pointShadowMatrix.value = k.state.pointShadowMatrix), V.currentProgram = ke, V.uniformsList = null, ke;
    }
    function As(y) {
      if (y.uniformsList === null) {
        const O = y.currentProgram.getUniforms();
        y.uniformsList = hr.seqWithValue(O.seq, y.uniforms);
      }
      return y.uniformsList;
    }
    function ni(y, O) {
      const H = Oe.get(y);
      H.outputColorSpace = O.outputColorSpace, H.batching = O.batching, H.batchingColor = O.batchingColor, H.instancing = O.instancing, H.instancingColor = O.instancingColor, H.instancingMorph = O.instancingMorph, H.skinning = O.skinning, H.morphTargets = O.morphTargets, H.morphNormals = O.morphNormals, H.morphColors = O.morphColors, H.morphTargetsCount = O.morphTargetsCount, H.numClippingPlanes = O.numClippingPlanes, H.numIntersection = O.numClipIntersection, H.vertexAlphas = O.vertexAlphas, H.vertexTangents = O.vertexTangents, H.toneMapping = O.toneMapping;
    }
    function ss(y, O, H, V, k) {
      O.isScene !== !0 && (O = et), C.resetTextureUnits();
      const de = O.fog, pe = V.isMeshStandardMaterial ? O.environment : null, Me = L === null ? S.outputColorSpace : L.isXRRenderTarget === !0 ? L.texture.colorSpace : Ht, Ae = (V.isMeshStandardMaterial ? G : M).get(V.envMap || pe), Fe = V.vertexColors === !0 && !!H.attributes.color && H.attributes.color.itemSize === 4, ke = !!H.attributes.tangent && (!!V.normalMap || V.anisotropy > 0), Ce = !!H.morphAttributes.position, ot = !!H.morphAttributes.normal, mt = !!H.morphAttributes.color;
      let vt = 0;
      V.toneMapped && (L === null || L.isXRRenderTarget === !0) && (vt = S.toneMapping);
      const zt = H.morphAttributes.position || H.morphAttributes.normal || H.morphAttributes.color, lt = zt !== void 0 ? zt.length : 0, Ie = Oe.get(V), Ut = p.state.lights;
      if (Z === !0 && (ce === !0 || y !== ee)) {
        const Gt = y === ee && V.id === z;
        ue.setState(V, y, Gt);
      }
      let ct = !1;
      V.version === Ie.__version ? (Ie.needsLights && Ie.lightsStateVersion !== Ut.state.version || Ie.outputColorSpace !== Me || k.isBatchedMesh && Ie.batching === !1 || !k.isBatchedMesh && Ie.batching === !0 || k.isBatchedMesh && Ie.batchingColor === !0 && k.colorTexture === null || k.isBatchedMesh && Ie.batchingColor === !1 && k.colorTexture !== null || k.isInstancedMesh && Ie.instancing === !1 || !k.isInstancedMesh && Ie.instancing === !0 || k.isSkinnedMesh && Ie.skinning === !1 || !k.isSkinnedMesh && Ie.skinning === !0 || k.isInstancedMesh && Ie.instancingColor === !0 && k.instanceColor === null || k.isInstancedMesh && Ie.instancingColor === !1 && k.instanceColor !== null || k.isInstancedMesh && Ie.instancingMorph === !0 && k.morphTexture === null || k.isInstancedMesh && Ie.instancingMorph === !1 && k.morphTexture !== null || Ie.envMap !== Ae || V.fog === !0 && Ie.fog !== de || Ie.numClippingPlanes !== void 0 && (Ie.numClippingPlanes !== ue.numPlanes || Ie.numIntersection !== ue.numIntersection) || Ie.vertexAlphas !== Fe || Ie.vertexTangents !== ke || Ie.morphTargets !== Ce || Ie.morphNormals !== ot || Ie.morphColors !== mt || Ie.toneMapping !== vt || Ie.morphTargetsCount !== lt) && (ct = !0) : (ct = !0, Ie.__version = V.version);
      let tn = Ie.currentProgram;
      ct === !0 && (tn = Gn(V, O, k));
      let An = !1, Yt = !1, Ei = !1;
      const Tt = tn.getUniforms(), on = Ie.uniforms;
      if (Ne.useProgram(tn.program) && (An = !0, Yt = !0, Ei = !0), V.id !== z && (z = V.id, Yt = !0), An || ee !== y) {
        it.reverseDepthBuffer ? (Te.copy(y.projectionMatrix), Il(Te), Pl(Te), Tt.setValue(U, "projectionMatrix", Te)) : Tt.setValue(U, "projectionMatrix", y.projectionMatrix), Tt.setValue(U, "viewMatrix", y.matrixWorldInverse);
        const Gt = Tt.map.cameraPosition;
        Gt !== void 0 && Gt.setValue(U, Xe.setFromMatrixPosition(y.matrixWorld)), it.logarithmicDepthBuffer && Tt.setValue(
          U,
          "logDepthBufFC",
          2 / (Math.log(y.far + 1) / Math.LN2)
        ), (V.isMeshPhongMaterial || V.isMeshToonMaterial || V.isMeshLambertMaterial || V.isMeshBasicMaterial || V.isMeshStandardMaterial || V.isShaderMaterial) && Tt.setValue(U, "isOrthographic", y.isOrthographicCamera === !0), ee !== y && (ee = y, Yt = !0, Ei = !0);
      }
      if (k.isSkinnedMesh) {
        Tt.setOptional(U, k, "bindMatrix"), Tt.setOptional(U, k, "bindMatrixInverse");
        const Gt = k.skeleton;
        Gt && (Gt.boneTexture === null && Gt.computeBoneTexture(), Tt.setValue(U, "boneTexture", Gt.boneTexture, C));
      }
      k.isBatchedMesh && (Tt.setOptional(U, k, "batchingTexture"), Tt.setValue(U, "batchingTexture", k._matricesTexture, C), Tt.setOptional(U, k, "batchingIdTexture"), Tt.setValue(U, "batchingIdTexture", k._indirectTexture, C), Tt.setOptional(U, k, "batchingColorTexture"), k._colorsTexture !== null && Tt.setValue(U, "batchingColorTexture", k._colorsTexture, C));
      const Ti = H.morphAttributes;
      if ((Ti.position !== void 0 || Ti.normal !== void 0 || Ti.color !== void 0) && He.update(k, H, tn), (Yt || Ie.receiveShadow !== k.receiveShadow) && (Ie.receiveShadow = k.receiveShadow, Tt.setValue(U, "receiveShadow", k.receiveShadow)), V.isMeshGouraudMaterial && V.envMap !== null && (on.envMap.value = Ae, on.flipEnvMap.value = Ae.isCubeTexture && Ae.isRenderTargetTexture === !1 ? -1 : 1), V.isMeshStandardMaterial && V.envMap === null && O.environment !== null && (on.envMapIntensity.value = O.environmentIntensity), Yt && (Tt.setValue(U, "toneMappingExposure", S.toneMappingExposure), Ie.needsLights && Si(on, Ei), de && V.fog === !0 && ie.refreshFogUniforms(on, de), ie.refreshMaterialUniforms(on, V, he, j, p.state.transmissionRenderTarget[y.id]), hr.upload(U, As(Ie), on, C)), V.isShaderMaterial && V.uniformsNeedUpdate === !0 && (hr.upload(U, As(Ie), on, C), V.uniformsNeedUpdate = !1), V.isSpriteMaterial && Tt.setValue(U, "center", k.center), Tt.setValue(U, "modelViewMatrix", k.modelViewMatrix), Tt.setValue(U, "normalMatrix", k.normalMatrix), Tt.setValue(U, "modelMatrix", k.matrixWorld), V.isShaderMaterial || V.isRawShaderMaterial) {
        const Gt = V.uniformsGroups;
        for (let rs = 0, bs = Gt.length; rs < bs; rs++) {
          const Ai = Gt[rs];
          B.update(Ai, tn), B.bind(Ai, tn);
        }
      }
      return tn;
    }
    function Si(y, O) {
      y.ambientLightColor.needsUpdate = O, y.lightProbe.needsUpdate = O, y.directionalLights.needsUpdate = O, y.directionalLightShadows.needsUpdate = O, y.pointLights.needsUpdate = O, y.pointLightShadows.needsUpdate = O, y.spotLights.needsUpdate = O, y.spotLightShadows.needsUpdate = O, y.rectAreaLights.needsUpdate = O, y.hemisphereLights.needsUpdate = O;
    }
    function Hn(y) {
      return y.isMeshLambertMaterial || y.isMeshToonMaterial || y.isMeshPhongMaterial || y.isMeshStandardMaterial || y.isShadowMaterial || y.isShaderMaterial && y.lights === !0;
    }
    this.getActiveCubeFace = function() {
      return F;
    }, this.getActiveMipmapLevel = function() {
      return P;
    }, this.getRenderTarget = function() {
      return L;
    }, this.setRenderTargetTextures = function(y, O, H) {
      Oe.get(y.texture).__webglTexture = O, Oe.get(y.depthTexture).__webglTexture = H;
      const V = Oe.get(y);
      V.__hasExternalTextures = !0, V.__autoAllocateDepthBuffer = H === void 0, V.__autoAllocateDepthBuffer || Ze.has("WEBGL_multisampled_render_to_texture") === !0 && (console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"), V.__useRenderToTexture = !1);
    }, this.setRenderTargetFramebuffer = function(y, O) {
      const H = Oe.get(y);
      H.__webglFramebuffer = O, H.__useDefaultFramebuffer = O === void 0;
    }, this.setRenderTarget = function(y, O = 0, H = 0) {
      L = y, F = O, P = H;
      let V = !0, k = null, de = !1, pe = !1;
      if (y) {
        const Ae = Oe.get(y);
        if (Ae.__useDefaultFramebuffer !== void 0)
          Ne.bindFramebuffer(U.FRAMEBUFFER, null), V = !1;
        else if (Ae.__webglFramebuffer === void 0)
          C.setupRenderTarget(y);
        else if (Ae.__hasExternalTextures)
          C.rebindTextures(y, Oe.get(y.texture).__webglTexture, Oe.get(y.depthTexture).__webglTexture);
        else if (y.depthBuffer) {
          const Ce = y.depthTexture;
          if (Ae.__boundDepthTexture !== Ce) {
            if (Ce !== null && Oe.has(Ce) && (y.width !== Ce.image.width || y.height !== Ce.image.height))
              throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");
            C.setupDepthRenderbuffer(y);
          }
        }
        const Fe = y.texture;
        (Fe.isData3DTexture || Fe.isDataArrayTexture || Fe.isCompressedArrayTexture) && (pe = !0);
        const ke = Oe.get(y).__webglFramebuffer;
        y.isWebGLCubeRenderTarget ? (Array.isArray(ke[O]) ? k = ke[O][H] : k = ke[O], de = !0) : y.samples > 0 && C.useMultisampledRTT(y) === !1 ? k = Oe.get(y).__webglMultisampledFramebuffer : Array.isArray(ke) ? k = ke[H] : k = ke, v.copy(y.viewport), A.copy(y.scissor), W = y.scissorTest;
      } else
        v.copy(ve).multiplyScalar(he).floor(), A.copy(we).multiplyScalar(he).floor(), W = Qe;
      if (Ne.bindFramebuffer(U.FRAMEBUFFER, k) && V && Ne.drawBuffers(y, k), Ne.viewport(v), Ne.scissor(A), Ne.setScissorTest(W), de) {
        const Ae = Oe.get(y.texture);
        U.framebufferTexture2D(U.FRAMEBUFFER, U.COLOR_ATTACHMENT0, U.TEXTURE_CUBE_MAP_POSITIVE_X + O, Ae.__webglTexture, H);
      } else if (pe) {
        const Ae = Oe.get(y.texture), Fe = O || 0;
        U.framebufferTextureLayer(U.FRAMEBUFFER, U.COLOR_ATTACHMENT0, Ae.__webglTexture, H || 0, Fe);
      }
      z = -1;
    }, this.readRenderTargetPixels = function(y, O, H, V, k, de, pe) {
      if (!(y && y.isWebGLRenderTarget)) {
        console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
        return;
      }
      let Me = Oe.get(y).__webglFramebuffer;
      if (y.isWebGLCubeRenderTarget && pe !== void 0 && (Me = Me[pe]), Me) {
        Ne.bindFramebuffer(U.FRAMEBUFFER, Me);
        try {
          const Ae = y.texture, Fe = Ae.format, ke = Ae.type;
          if (!it.textureFormatReadable(Fe)) {
            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");
            return;
          }
          if (!it.textureTypeReadable(ke)) {
            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");
            return;
          }
          O >= 0 && O <= y.width - V && H >= 0 && H <= y.height - k && U.readPixels(O, H, V, k, Ve.convert(Fe), Ve.convert(ke), de);
        } finally {
          const Ae = L !== null ? Oe.get(L).__webglFramebuffer : null;
          Ne.bindFramebuffer(U.FRAMEBUFFER, Ae);
        }
      }
    }, this.readRenderTargetPixelsAsync = async function(y, O, H, V, k, de, pe) {
      if (!(y && y.isWebGLRenderTarget))
        throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
      let Me = Oe.get(y).__webglFramebuffer;
      if (y.isWebGLCubeRenderTarget && pe !== void 0 && (Me = Me[pe]), Me) {
        const Ae = y.texture, Fe = Ae.format, ke = Ae.type;
        if (!it.textureFormatReadable(Fe))
          throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");
        if (!it.textureTypeReadable(ke))
          throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");
        if (O >= 0 && O <= y.width - V && H >= 0 && H <= y.height - k) {
          Ne.bindFramebuffer(U.FRAMEBUFFER, Me);
          const Ce = U.createBuffer();
          U.bindBuffer(U.PIXEL_PACK_BUFFER, Ce), U.bufferData(U.PIXEL_PACK_BUFFER, de.byteLength, U.STREAM_READ), U.readPixels(O, H, V, k, Ve.convert(Fe), Ve.convert(ke), 0);
          const ot = L !== null ? Oe.get(L).__webglFramebuffer : null;
          Ne.bindFramebuffer(U.FRAMEBUFFER, ot);
          const mt = U.fenceSync(U.SYNC_GPU_COMMANDS_COMPLETE, 0);
          return U.flush(), await Cl(U, mt, 4), U.bindBuffer(U.PIXEL_PACK_BUFFER, Ce), U.getBufferSubData(U.PIXEL_PACK_BUFFER, 0, de), U.deleteBuffer(Ce), U.deleteSync(mt), de;
        } else
          throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.");
      }
    }, this.copyFramebufferToTexture = function(y, O = null, H = 0) {
      y.isTexture !== !0 && (lr("WebGLRenderer: copyFramebufferToTexture function signature has changed."), O = arguments[0] || null, y = arguments[1]);
      const V = Math.pow(2, -H), k = Math.floor(y.image.width * V), de = Math.floor(y.image.height * V), pe = O !== null ? O.x : 0, Me = O !== null ? O.y : 0;
      C.setTexture2D(y, 0), U.copyTexSubImage2D(U.TEXTURE_2D, H, 0, 0, pe, Me, k, de), Ne.unbindTexture();
    }, this.copyTextureToTexture = function(y, O, H = null, V = null, k = 0) {
      y.isTexture !== !0 && (lr("WebGLRenderer: copyTextureToTexture function signature has changed."), V = arguments[0] || null, y = arguments[1], O = arguments[2], k = arguments[3] || 0, H = null);
      let de, pe, Me, Ae, Fe, ke;
      H !== null ? (de = H.max.x - H.min.x, pe = H.max.y - H.min.y, Me = H.min.x, Ae = H.min.y) : (de = y.image.width, pe = y.image.height, Me = 0, Ae = 0), V !== null ? (Fe = V.x, ke = V.y) : (Fe = 0, ke = 0);
      const Ce = Ve.convert(O.format), ot = Ve.convert(O.type);
      C.setTexture2D(O, 0), U.pixelStorei(U.UNPACK_FLIP_Y_WEBGL, O.flipY), U.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL, O.premultiplyAlpha), U.pixelStorei(U.UNPACK_ALIGNMENT, O.unpackAlignment);
      const mt = U.getParameter(U.UNPACK_ROW_LENGTH), vt = U.getParameter(U.UNPACK_IMAGE_HEIGHT), zt = U.getParameter(U.UNPACK_SKIP_PIXELS), lt = U.getParameter(U.UNPACK_SKIP_ROWS), Ie = U.getParameter(U.UNPACK_SKIP_IMAGES), Ut = y.isCompressedTexture ? y.mipmaps[k] : y.image;
      U.pixelStorei(U.UNPACK_ROW_LENGTH, Ut.width), U.pixelStorei(U.UNPACK_IMAGE_HEIGHT, Ut.height), U.pixelStorei(U.UNPACK_SKIP_PIXELS, Me), U.pixelStorei(U.UNPACK_SKIP_ROWS, Ae), y.isDataTexture ? U.texSubImage2D(U.TEXTURE_2D, k, Fe, ke, de, pe, Ce, ot, Ut.data) : y.isCompressedTexture ? U.compressedTexSubImage2D(U.TEXTURE_2D, k, Fe, ke, Ut.width, Ut.height, Ce, Ut.data) : U.texSubImage2D(U.TEXTURE_2D, k, Fe, ke, de, pe, Ce, ot, Ut), U.pixelStorei(U.UNPACK_ROW_LENGTH, mt), U.pixelStorei(U.UNPACK_IMAGE_HEIGHT, vt), U.pixelStorei(U.UNPACK_SKIP_PIXELS, zt), U.pixelStorei(U.UNPACK_SKIP_ROWS, lt), U.pixelStorei(U.UNPACK_SKIP_IMAGES, Ie), k === 0 && O.generateMipmaps && U.generateMipmap(U.TEXTURE_2D), Ne.unbindTexture();
    }, this.copyTextureToTexture3D = function(y, O, H = null, V = null, k = 0) {
      y.isTexture !== !0 && (lr("WebGLRenderer: copyTextureToTexture3D function signature has changed."), H = arguments[0] || null, V = arguments[1] || null, y = arguments[2], O = arguments[3], k = arguments[4] || 0);
      let de, pe, Me, Ae, Fe, ke, Ce, ot, mt;
      const vt = y.isCompressedTexture ? y.mipmaps[k] : y.image;
      H !== null ? (de = H.max.x - H.min.x, pe = H.max.y - H.min.y, Me = H.max.z - H.min.z, Ae = H.min.x, Fe = H.min.y, ke = H.min.z) : (de = vt.width, pe = vt.height, Me = vt.depth, Ae = 0, Fe = 0, ke = 0), V !== null ? (Ce = V.x, ot = V.y, mt = V.z) : (Ce = 0, ot = 0, mt = 0);
      const zt = Ve.convert(O.format), lt = Ve.convert(O.type);
      let Ie;
      if (O.isData3DTexture)
        C.setTexture3D(O, 0), Ie = U.TEXTURE_3D;
      else if (O.isDataArrayTexture || O.isCompressedArrayTexture)
        C.setTexture2DArray(O, 0), Ie = U.TEXTURE_2D_ARRAY;
      else {
        console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");
        return;
      }
      U.pixelStorei(U.UNPACK_FLIP_Y_WEBGL, O.flipY), U.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL, O.premultiplyAlpha), U.pixelStorei(U.UNPACK_ALIGNMENT, O.unpackAlignment);
      const Ut = U.getParameter(U.UNPACK_ROW_LENGTH), ct = U.getParameter(U.UNPACK_IMAGE_HEIGHT), tn = U.getParameter(U.UNPACK_SKIP_PIXELS), An = U.getParameter(U.UNPACK_SKIP_ROWS), Yt = U.getParameter(U.UNPACK_SKIP_IMAGES);
      U.pixelStorei(U.UNPACK_ROW_LENGTH, vt.width), U.pixelStorei(U.UNPACK_IMAGE_HEIGHT, vt.height), U.pixelStorei(U.UNPACK_SKIP_PIXELS, Ae), U.pixelStorei(U.UNPACK_SKIP_ROWS, Fe), U.pixelStorei(U.UNPACK_SKIP_IMAGES, ke), y.isDataTexture || y.isData3DTexture ? U.texSubImage3D(Ie, k, Ce, ot, mt, de, pe, Me, zt, lt, vt.data) : O.isCompressedArrayTexture ? U.compressedTexSubImage3D(Ie, k, Ce, ot, mt, de, pe, Me, zt, vt.data) : U.texSubImage3D(Ie, k, Ce, ot, mt, de, pe, Me, zt, lt, vt), U.pixelStorei(U.UNPACK_ROW_LENGTH, Ut), U.pixelStorei(U.UNPACK_IMAGE_HEIGHT, ct), U.pixelStorei(U.UNPACK_SKIP_PIXELS, tn), U.pixelStorei(U.UNPACK_SKIP_ROWS, An), U.pixelStorei(U.UNPACK_SKIP_IMAGES, Yt), k === 0 && O.generateMipmaps && U.generateMipmap(Ie), Ne.unbindTexture();
    }, this.initRenderTarget = function(y) {
      Oe.get(y).__webglFramebuffer === void 0 && C.setupRenderTarget(y);
    }, this.initTexture = function(y) {
      y.isCubeTexture ? C.setTextureCube(y, 0) : y.isData3DTexture ? C.setTexture3D(y, 0) : y.isDataArrayTexture || y.isCompressedArrayTexture ? C.setTexture2DArray(y, 0) : C.setTexture2D(y, 0), Ne.unbindTexture();
    }, this.resetState = function() {
      F = 0, P = 0, L = null, Ne.reset(), xt.reset();
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
    t.drawingBufferColorSpace = e === Ea ? "display-p3" : "srgb", t.unpackColorSpace = at.workingColorSpace === _r ? "display-p3" : "srgb";
  }
}
class Vp extends At {
  constructor() {
    super(), this.isScene = !0, this.type = "Scene", this.background = null, this.environment = null, this.fog = null, this.backgroundBlurriness = 0, this.backgroundIntensity = 1, this.backgroundRotation = new Sn(), this.environmentIntensity = 1, this.environmentRotation = new Sn(), this.overrideMaterial = null, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
  }
  copy(e, t) {
    return super.copy(e, t), e.background !== null && (this.background = e.background.clone()), e.environment !== null && (this.environment = e.environment.clone()), e.fog !== null && (this.fog = e.fog.clone()), this.backgroundBlurriness = e.backgroundBlurriness, this.backgroundIntensity = e.backgroundIntensity, this.backgroundRotation.copy(e.backgroundRotation), this.environmentIntensity = e.environmentIntensity, this.environmentRotation.copy(e.environmentRotation), e.overrideMaterial !== null && (this.overrideMaterial = e.overrideMaterial.clone()), this.matrixAutoUpdate = e.matrixAutoUpdate, this;
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return this.fog !== null && (t.object.fog = this.fog.toJSON()), this.backgroundBlurriness > 0 && (t.object.backgroundBlurriness = this.backgroundBlurriness), this.backgroundIntensity !== 1 && (t.object.backgroundIntensity = this.backgroundIntensity), t.object.backgroundRotation = this.backgroundRotation.toArray(), this.environmentIntensity !== 1 && (t.object.environmentIntensity = this.environmentIntensity), t.object.environmentRotation = this.environmentRotation.toArray(), t;
  }
}
class Wp {
  constructor(e, t) {
    this.isInterleavedBuffer = !0, this.array = e, this.stride = t, this.count = e !== void 0 ? e.length / t : 0, this.usage = 35044, this.updateRanges = [], this.version = 0, this.uuid = Mn();
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
    e.arrayBuffers === void 0 && (e.arrayBuffers = {}), this.array.buffer._uuid === void 0 && (this.array.buffer._uuid = Mn()), e.arrayBuffers[this.array.buffer._uuid] === void 0 && (e.arrayBuffers[this.array.buffer._uuid] = this.array.slice(0).buffer);
    const t = new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]), n = new this.constructor(t, this.stride);
    return n.setUsage(this.usage), n;
  }
  onUpload(e) {
    return this.onUploadCallback = e, this;
  }
  toJSON(e) {
    return e.arrayBuffers === void 0 && (e.arrayBuffers = {}), this.array.buffer._uuid === void 0 && (this.array.buffer._uuid = Mn()), e.arrayBuffers[this.array.buffer._uuid] === void 0 && (e.arrayBuffers[this.array.buffer._uuid] = Array.from(new Uint32Array(this.array.buffer))), {
      uuid: this.uuid,
      buffer: this.array.buffer._uuid,
      type: this.array.constructor.name,
      stride: this.stride
    };
  }
}
const Zt = /* @__PURE__ */ new N();
class Ra {
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
      Zt.fromBufferAttribute(this, t), Zt.applyMatrix4(e), this.setXYZ(t, Zt.x, Zt.y, Zt.z);
    return this;
  }
  applyNormalMatrix(e) {
    for (let t = 0, n = this.count; t < n; t++)
      Zt.fromBufferAttribute(this, t), Zt.applyNormalMatrix(e), this.setXYZ(t, Zt.x, Zt.y, Zt.z);
    return this;
  }
  transformDirection(e) {
    for (let t = 0, n = this.count; t < n; t++)
      Zt.fromBufferAttribute(this, t), Zt.transformDirection(e), this.setXYZ(t, Zt.x, Zt.y, Zt.z);
    return this;
  }
  getComponent(e, t) {
    let n = this.array[e * this.data.stride + this.offset + t];
    return this.normalized && (n = vn(n, this.array)), n;
  }
  setComponent(e, t, n) {
    return this.normalized && (n = gt(n, this.array)), this.data.array[e * this.data.stride + this.offset + t] = n, this;
  }
  setX(e, t) {
    return this.normalized && (t = gt(t, this.array)), this.data.array[e * this.data.stride + this.offset] = t, this;
  }
  setY(e, t) {
    return this.normalized && (t = gt(t, this.array)), this.data.array[e * this.data.stride + this.offset + 1] = t, this;
  }
  setZ(e, t) {
    return this.normalized && (t = gt(t, this.array)), this.data.array[e * this.data.stride + this.offset + 2] = t, this;
  }
  setW(e, t) {
    return this.normalized && (t = gt(t, this.array)), this.data.array[e * this.data.stride + this.offset + 3] = t, this;
  }
  getX(e) {
    let t = this.data.array[e * this.data.stride + this.offset];
    return this.normalized && (t = vn(t, this.array)), t;
  }
  getY(e) {
    let t = this.data.array[e * this.data.stride + this.offset + 1];
    return this.normalized && (t = vn(t, this.array)), t;
  }
  getZ(e) {
    let t = this.data.array[e * this.data.stride + this.offset + 2];
    return this.normalized && (t = vn(t, this.array)), t;
  }
  getW(e) {
    let t = this.data.array[e * this.data.stride + this.offset + 3];
    return this.normalized && (t = vn(t, this.array)), t;
  }
  setXY(e, t, n) {
    return e = e * this.data.stride + this.offset, this.normalized && (t = gt(t, this.array), n = gt(n, this.array)), this.data.array[e + 0] = t, this.data.array[e + 1] = n, this;
  }
  setXYZ(e, t, n, i) {
    return e = e * this.data.stride + this.offset, this.normalized && (t = gt(t, this.array), n = gt(n, this.array), i = gt(i, this.array)), this.data.array[e + 0] = t, this.data.array[e + 1] = n, this.data.array[e + 2] = i, this;
  }
  setXYZW(e, t, n, i, r) {
    return e = e * this.data.stride + this.offset, this.normalized && (t = gt(t, this.array), n = gt(n, this.array), i = gt(i, this.array), r = gt(r, this.array)), this.data.array[e + 0] = t, this.data.array[e + 1] = n, this.data.array[e + 2] = i, this.data.array[e + 3] = r, this;
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
      return new Jt(new this.array.constructor(t), this.itemSize, this.normalized);
    } else
      return e.interleavedBuffers === void 0 && (e.interleavedBuffers = {}), e.interleavedBuffers[this.data.uuid] === void 0 && (e.interleavedBuffers[this.data.uuid] = this.data.clone(e)), new Ra(e.interleavedBuffers[this.data.uuid], this.itemSize, this.offset, this.normalized);
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
const Oo = /* @__PURE__ */ new N(), ko = /* @__PURE__ */ new ut(), zo = /* @__PURE__ */ new ut(), Xp = /* @__PURE__ */ new N(), Go = /* @__PURE__ */ new je(), $s = /* @__PURE__ */ new N(), ia = /* @__PURE__ */ new Cn(), Ho = /* @__PURE__ */ new je(), sa = /* @__PURE__ */ new Ss();
class qp extends Le {
  constructor(e, t) {
    super(e, t), this.isSkinnedMesh = !0, this.type = "SkinnedMesh", this.bindMode = ja, this.bindMatrix = new je(), this.bindMatrixInverse = new je(), this.boundingBox = null, this.boundingSphere = null;
  }
  computeBoundingBox() {
    const e = this.geometry;
    this.boundingBox === null && (this.boundingBox = new En()), this.boundingBox.makeEmpty();
    const t = e.getAttribute("position");
    for (let n = 0; n < t.count; n++)
      this.getVertexPosition(n, $s), this.boundingBox.expandByPoint($s);
  }
  computeBoundingSphere() {
    const e = this.geometry;
    this.boundingSphere === null && (this.boundingSphere = new Cn()), this.boundingSphere.makeEmpty();
    const t = e.getAttribute("position");
    for (let n = 0; n < t.count; n++)
      this.getVertexPosition(n, $s), this.boundingSphere.expandByPoint($s);
  }
  copy(e, t) {
    return super.copy(e, t), this.bindMode = e.bindMode, this.bindMatrix.copy(e.bindMatrix), this.bindMatrixInverse.copy(e.bindMatrixInverse), this.skeleton = e.skeleton, e.boundingBox !== null && (this.boundingBox = e.boundingBox.clone()), e.boundingSphere !== null && (this.boundingSphere = e.boundingSphere.clone()), this;
  }
  raycast(e, t) {
    const n = this.material, i = this.matrixWorld;
    n !== void 0 && (this.boundingSphere === null && this.computeBoundingSphere(), ia.copy(this.boundingSphere), ia.applyMatrix4(i), e.ray.intersectsSphere(ia) !== !1 && (Ho.copy(i).invert(), sa.copy(e.ray).applyMatrix4(Ho), !(this.boundingBox !== null && sa.intersectsBox(this.boundingBox) === !1) && this._computeIntersections(e, t, sa)));
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
    super.updateMatrixWorld(e), this.bindMode === ja ? this.bindMatrixInverse.copy(this.matrixWorld).invert() : this.bindMode === hl ? this.bindMatrixInverse.copy(this.bindMatrix).invert() : console.warn("THREE.SkinnedMesh: Unrecognized bindMode: " + this.bindMode);
  }
  applyBoneTransform(e, t) {
    const n = this.skeleton, i = this.geometry;
    ko.fromBufferAttribute(i.attributes.skinIndex, e), zo.fromBufferAttribute(i.attributes.skinWeight, e), Oo.copy(t).applyMatrix4(this.bindMatrix), t.set(0, 0, 0);
    for (let r = 0; r < 4; r++) {
      const a = zo.getComponent(r);
      if (a !== 0) {
        const o = ko.getComponent(r);
        Go.multiplyMatrices(n.bones[o].matrixWorld, n.boneInverses[o]), t.addScaledVector(Xp.copy(Oo).applyMatrix4(Go), a);
      }
    }
    return t.applyMatrix4(this.bindMatrixInverse);
  }
}
class Ic extends At {
  constructor() {
    super(), this.isBone = !0, this.type = "Bone";
  }
}
class Ca extends Ft {
  constructor(e = null, t = 1, n = 1, i, r, a, o, c, l = 1003, u = 1003, h, d) {
    super(null, a, o, c, l, u, i, r, h, d), this.isDataTexture = !0, this.image = { data: e, width: t, height: n }, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1;
  }
}
const Vo = /* @__PURE__ */ new je(), jp = /* @__PURE__ */ new je();
class Ia {
  constructor(e = [], t = []) {
    this.uuid = Mn(), this.bones = e.slice(0), this.boneInverses = t, this.boneMatrices = null, this.boneTexture = null, this.init();
  }
  init() {
    const e = this.bones, t = this.boneInverses;
    if (this.boneMatrices = new Float32Array(e.length * 16), t.length === 0)
      this.calculateInverses();
    else if (e.length !== t.length) {
      console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."), this.boneInverses = [];
      for (let n = 0, i = this.bones.length; n < i; n++)
        this.boneInverses.push(new je());
    }
  }
  calculateInverses() {
    this.boneInverses.length = 0;
    for (let e = 0, t = this.bones.length; e < t; e++) {
      const n = new je();
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
      const o = e[r] ? e[r].matrixWorld : jp;
      Vo.multiplyMatrices(o, t[r]), Vo.toArray(n, r * 16);
    }
    i !== null && (i.needsUpdate = !0);
  }
  clone() {
    return new Ia(this.bones, this.boneInverses);
  }
  computeBoneTexture() {
    let e = Math.sqrt(this.bones.length * 4);
    e = Math.ceil(e / 4) * 4, e = Math.max(e, 4);
    const t = new Float32Array(e * e * 4);
    t.set(this.boneMatrices);
    const n = new Ca(t, e, e, 1023, 1015);
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
      a === void 0 && (console.warn("THREE.Skeleton: No bone found with UUID:", r), a = new Ic()), this.bones.push(a), this.boneInverses.push(new je().fromArray(e.boneInverses[n]));
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
class ga extends Jt {
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
const Gi = /* @__PURE__ */ new je(), Wo = /* @__PURE__ */ new je(), Js = [], Xo = /* @__PURE__ */ new En(), Yp = /* @__PURE__ */ new je(), ds = /* @__PURE__ */ new Le(), fs = /* @__PURE__ */ new Cn();
class Kp extends Le {
  constructor(e, t, n) {
    super(e, t), this.isInstancedMesh = !0, this.instanceMatrix = new ga(new Float32Array(n * 16), 16), this.instanceColor = null, this.morphTexture = null, this.count = n, this.boundingBox = null, this.boundingSphere = null;
    for (let i = 0; i < n; i++)
      this.setMatrixAt(i, Yp);
  }
  computeBoundingBox() {
    const e = this.geometry, t = this.count;
    this.boundingBox === null && (this.boundingBox = new En()), e.boundingBox === null && e.computeBoundingBox(), this.boundingBox.makeEmpty();
    for (let n = 0; n < t; n++)
      this.getMatrixAt(n, Gi), Xo.copy(e.boundingBox).applyMatrix4(Gi), this.boundingBox.union(Xo);
  }
  computeBoundingSphere() {
    const e = this.geometry, t = this.count;
    this.boundingSphere === null && (this.boundingSphere = new Cn()), e.boundingSphere === null && e.computeBoundingSphere(), this.boundingSphere.makeEmpty();
    for (let n = 0; n < t; n++)
      this.getMatrixAt(n, Gi), fs.copy(e.boundingSphere).applyMatrix4(Gi), this.boundingSphere.union(fs);
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
    if (ds.geometry = this.geometry, ds.material = this.material, ds.material !== void 0 && (this.boundingSphere === null && this.computeBoundingSphere(), fs.copy(this.boundingSphere), fs.applyMatrix4(n), e.ray.intersectsSphere(fs) !== !1))
      for (let r = 0; r < i; r++) {
        this.getMatrixAt(r, Gi), Wo.multiplyMatrices(n, Gi), ds.matrixWorld = Wo, ds.raycast(e, Js);
        for (let a = 0, o = Js.length; a < o; a++) {
          const c = Js[a];
          c.instanceId = r, c.object = this, t.push(c);
        }
        Js.length = 0;
      }
  }
  setColorAt(e, t) {
    this.instanceColor === null && (this.instanceColor = new ga(new Float32Array(this.instanceMatrix.count * 3).fill(1), 3)), t.toArray(this.instanceColor.array, e * 3);
  }
  setMatrixAt(e, t) {
    t.toArray(this.instanceMatrix.array, e * 16);
  }
  setMorphAt(e, t) {
    const n = t.morphTargetInfluences, i = n.length + 1;
    this.morphTexture === null && (this.morphTexture = new Ca(new Float32Array(i * this.count), i, this.count, 1028, 1015));
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
class xn extends rn {
  constructor(e) {
    super(), this.isLineBasicMaterial = !0, this.type = "LineBasicMaterial", this.color = new De(16777215), this.map = null, this.linewidth = 1, this.linecap = "round", this.linejoin = "round", this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.map = e.map, this.linewidth = e.linewidth, this.linecap = e.linecap, this.linejoin = e.linejoin, this.fog = e.fog, this;
  }
}
const mr = /* @__PURE__ */ new N(), gr = /* @__PURE__ */ new N(), qo = /* @__PURE__ */ new je(), ps = /* @__PURE__ */ new Ss(), Qs = /* @__PURE__ */ new Cn(), ra = /* @__PURE__ */ new N(), jo = /* @__PURE__ */ new N();
class ys extends At {
  constructor(e = new Rt(), t = new xn()) {
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
        mr.fromBufferAttribute(t, i - 1), gr.fromBufferAttribute(t, i), n[i] = n[i - 1], n[i] += mr.distanceTo(gr);
      e.setAttribute("lineDistance", new dt(n, 1));
    } else
      console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
    return this;
  }
  raycast(e, t) {
    const n = this.geometry, i = this.matrixWorld, r = e.params.Line.threshold, a = n.drawRange;
    if (n.boundingSphere === null && n.computeBoundingSphere(), Qs.copy(n.boundingSphere), Qs.applyMatrix4(i), Qs.radius += r, e.ray.intersectsSphere(Qs) === !1) return;
    qo.copy(i).invert(), ps.copy(e.ray).applyMatrix4(qo);
    const o = r / ((this.scale.x + this.scale.y + this.scale.z) / 3), c = o * o, l = this.isLineSegments ? 2 : 1, u = n.index, d = n.attributes.position;
    if (u !== null) {
      const f = Math.max(0, a.start), g = Math.min(u.count, a.start + a.count);
      for (let x = f, p = g - 1; x < p; x += l) {
        const m = u.getX(x), T = u.getX(x + 1), S = er(this, e, ps, c, m, T);
        S && t.push(S);
      }
      if (this.isLineLoop) {
        const x = u.getX(g - 1), p = u.getX(f), m = er(this, e, ps, c, x, p);
        m && t.push(m);
      }
    } else {
      const f = Math.max(0, a.start), g = Math.min(d.count, a.start + a.count);
      for (let x = f, p = g - 1; x < p; x += l) {
        const m = er(this, e, ps, c, x, x + 1);
        m && t.push(m);
      }
      if (this.isLineLoop) {
        const x = er(this, e, ps, c, g - 1, f);
        x && t.push(x);
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
function er(s, e, t, n, i, r) {
  const a = s.geometry.attributes.position;
  if (mr.fromBufferAttribute(a, i), gr.fromBufferAttribute(a, r), t.distanceSqToSegment(mr, gr, ra, jo) > n) return;
  ra.applyMatrix4(s.matrixWorld);
  const c = e.ray.origin.distanceTo(ra);
  if (!(c < e.near || c > e.far))
    return {
      distance: c,
      // What do we want? intersection point on the ray or on the segment??
      // point: raycaster.ray.at( distance ),
      point: jo.clone().applyMatrix4(s.matrixWorld),
      index: i,
      face: null,
      faceIndex: null,
      barycoord: null,
      object: s
    };
}
const Yo = /* @__PURE__ */ new N(), Ko = /* @__PURE__ */ new N();
class mi extends ys {
  constructor(e, t) {
    super(e, t), this.isLineSegments = !0, this.type = "LineSegments";
  }
  computeLineDistances() {
    const e = this.geometry;
    if (e.index === null) {
      const t = e.attributes.position, n = [];
      for (let i = 0, r = t.count; i < r; i += 2)
        Yo.fromBufferAttribute(t, i), Ko.fromBufferAttribute(t, i + 1), n[i] = i === 0 ? 0 : n[i - 1], n[i + 1] = n[i] + Yo.distanceTo(Ko);
      e.setAttribute("lineDistance", new dt(n, 1));
    } else
      console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
    return this;
  }
}
class Zp extends ys {
  constructor(e, t) {
    super(e, t), this.isLineLoop = !0, this.type = "LineLoop";
  }
}
class Wi extends rn {
  constructor(e) {
    super(), this.isPointsMaterial = !0, this.type = "PointsMaterial", this.color = new De(16777215), this.map = null, this.alphaMap = null, this.size = 1, this.sizeAttenuation = !0, this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.map = e.map, this.alphaMap = e.alphaMap, this.size = e.size, this.sizeAttenuation = e.sizeAttenuation, this.fog = e.fog, this;
  }
}
const Zo = /* @__PURE__ */ new je(), _a = /* @__PURE__ */ new Ss(), tr = /* @__PURE__ */ new Cn(), nr = /* @__PURE__ */ new N();
class ur extends At {
  constructor(e = new Rt(), t = new Wi()) {
    super(), this.isPoints = !0, this.type = "Points", this.geometry = e, this.material = t, this.updateMorphTargets();
  }
  copy(e, t) {
    return super.copy(e, t), this.material = Array.isArray(e.material) ? e.material.slice() : e.material, this.geometry = e.geometry, this;
  }
  raycast(e, t) {
    const n = this.geometry, i = this.matrixWorld, r = e.params.Points.threshold, a = n.drawRange;
    if (n.boundingSphere === null && n.computeBoundingSphere(), tr.copy(n.boundingSphere), tr.applyMatrix4(i), tr.radius += r, e.ray.intersectsSphere(tr) === !1) return;
    Zo.copy(i).invert(), _a.copy(e.ray).applyMatrix4(Zo);
    const o = r / ((this.scale.x + this.scale.y + this.scale.z) / 3), c = o * o, l = n.index, h = n.attributes.position;
    if (l !== null) {
      const d = Math.max(0, a.start), f = Math.min(l.count, a.start + a.count);
      for (let g = d, x = f; g < x; g++) {
        const p = l.getX(g);
        nr.fromBufferAttribute(h, p), $o(nr, p, c, i, e, t, this);
      }
    } else {
      const d = Math.max(0, a.start), f = Math.min(h.count, a.start + a.count);
      for (let g = d, x = f; g < x; g++)
        nr.fromBufferAttribute(h, g), $o(nr, g, c, i, e, t, this);
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
function $o(s, e, t, n, i, r, a) {
  const o = _a.distanceSqToPoint(s);
  if (o < t) {
    const c = new N();
    _a.closestPointToPoint(s, c), c.applyMatrix4(n);
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
class Pc extends Ft {
  constructor(e, t, n, i, r, a, o, c, l) {
    super(e, t, n, i, r, a, o, c, l), this.isCanvasTexture = !0, this.needsUpdate = !0;
  }
}
class Pa extends Rt {
  constructor(e = 1, t = 32, n = 0, i = Math.PI * 2) {
    super(), this.type = "CircleGeometry", this.parameters = {
      radius: e,
      segments: t,
      thetaStart: n,
      thetaLength: i
    }, t = Math.max(3, t);
    const r = [], a = [], o = [], c = [], l = new N(), u = new qe();
    a.push(0, 0, 0), o.push(0, 0, 1), c.push(0.5, 0.5);
    for (let h = 0, d = 3; h <= t; h++, d += 3) {
      const f = n + h / t * i;
      l.x = e * Math.cos(f), l.y = e * Math.sin(f), a.push(l.x, l.y, l.z), o.push(0, 0, 1), u.x = (a[d] / e + 1) / 2, u.y = (a[d + 1] / e + 1) / 2, c.push(u.x, u.y);
    }
    for (let h = 1; h <= t; h++)
      r.push(h, h + 1, 0);
    this.setIndex(r), this.setAttribute("position", new dt(a, 3)), this.setAttribute("normal", new dt(o, 3)), this.setAttribute("uv", new dt(c, 2));
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new Pa(e.radius, e.segments, e.thetaStart, e.thetaLength);
  }
}
class ji extends Rt {
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
    const u = [], h = [], d = [], f = [];
    let g = 0;
    const x = [], p = n / 2;
    let m = 0;
    T(), a === !1 && (e > 0 && S(!0), t > 0 && S(!1)), this.setIndex(u), this.setAttribute("position", new dt(h, 3)), this.setAttribute("normal", new dt(d, 3)), this.setAttribute("uv", new dt(f, 2));
    function T() {
      const E = new N(), F = new N();
      let P = 0;
      const L = (t - e) / n;
      for (let z = 0; z <= r; z++) {
        const ee = [], v = z / r, A = v * (t - e) + e;
        for (let W = 0; W <= i; W++) {
          const q = W / i, Y = q * c + o, se = Math.sin(Y), j = Math.cos(Y);
          F.x = A * se, F.y = -v * n + p, F.z = A * j, h.push(F.x, F.y, F.z), E.set(se, L, j).normalize(), d.push(E.x, E.y, E.z), f.push(q, 1 - v), ee.push(g++);
        }
        x.push(ee);
      }
      for (let z = 0; z < i; z++)
        for (let ee = 0; ee < r; ee++) {
          const v = x[ee][z], A = x[ee + 1][z], W = x[ee + 1][z + 1], q = x[ee][z + 1];
          e > 0 && (u.push(v, A, q), P += 3), t > 0 && (u.push(A, W, q), P += 3);
        }
      l.addGroup(m, P, 0), m += P;
    }
    function S(E) {
      const F = g, P = new qe(), L = new N();
      let z = 0;
      const ee = E === !0 ? e : t, v = E === !0 ? 1 : -1;
      for (let W = 1; W <= i; W++)
        h.push(0, p * v, 0), d.push(0, v, 0), f.push(0.5, 0.5), g++;
      const A = g;
      for (let W = 0; W <= i; W++) {
        const Y = W / i * c + o, se = Math.cos(Y), j = Math.sin(Y);
        L.x = ee * j, L.y = p * v, L.z = ee * se, h.push(L.x, L.y, L.z), d.push(0, v, 0), P.x = se * 0.5 + 0.5, P.y = j * 0.5 * v + 0.5, f.push(P.x, P.y), g++;
      }
      for (let W = 0; W < i; W++) {
        const q = F + W, Y = A + W;
        E === !0 ? u.push(Y, Y + 1, q) : u.push(Y + 1, Y, q), z += 3;
      }
      l.addGroup(m, z, E === !0 ? 1 : 2), m += z;
    }
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new ji(e.radiusTop, e.radiusBottom, e.height, e.radialSegments, e.heightSegments, e.openEnded, e.thetaStart, e.thetaLength);
  }
}
const ir = /* @__PURE__ */ new N(), sr = /* @__PURE__ */ new N(), aa = /* @__PURE__ */ new N(), rr = /* @__PURE__ */ new dn();
class $p extends Rt {
  constructor(e = null, t = 1) {
    if (super(), this.type = "EdgesGeometry", this.parameters = {
      geometry: e,
      thresholdAngle: t
    }, e !== null) {
      const i = Math.pow(10, 4), r = Math.cos(Xi * t), a = e.getIndex(), o = e.getAttribute("position"), c = a ? a.count : o.count, l = [0, 0, 0], u = ["a", "b", "c"], h = new Array(3), d = {}, f = [];
      for (let g = 0; g < c; g += 3) {
        a ? (l[0] = a.getX(g), l[1] = a.getX(g + 1), l[2] = a.getX(g + 2)) : (l[0] = g, l[1] = g + 1, l[2] = g + 2);
        const { a: x, b: p, c: m } = rr;
        if (x.fromBufferAttribute(o, l[0]), p.fromBufferAttribute(o, l[1]), m.fromBufferAttribute(o, l[2]), rr.getNormal(aa), h[0] = `${Math.round(x.x * i)},${Math.round(x.y * i)},${Math.round(x.z * i)}`, h[1] = `${Math.round(p.x * i)},${Math.round(p.y * i)},${Math.round(p.z * i)}`, h[2] = `${Math.round(m.x * i)},${Math.round(m.y * i)},${Math.round(m.z * i)}`, !(h[0] === h[1] || h[1] === h[2] || h[2] === h[0]))
          for (let T = 0; T < 3; T++) {
            const S = (T + 1) % 3, E = h[T], F = h[S], P = rr[u[T]], L = rr[u[S]], z = `${E}_${F}`, ee = `${F}_${E}`;
            ee in d && d[ee] ? (aa.dot(d[ee].normal) <= r && (f.push(P.x, P.y, P.z), f.push(L.x, L.y, L.z)), d[ee] = null) : z in d || (d[z] = {
              index0: l[T],
              index1: l[S],
              normal: aa.clone()
            });
          }
      }
      for (const g in d)
        if (d[g]) {
          const { index0: x, index1: p } = d[g];
          ir.fromBufferAttribute(o, x), sr.fromBufferAttribute(o, p), f.push(ir.x, ir.y, ir.z), f.push(sr.x, sr.y, sr.z);
        }
      this.setAttribute("position", new dt(f, 3));
    }
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
}
class pi extends Rt {
  constructor(e = 0.5, t = 1, n = 32, i = 1, r = 0, a = Math.PI * 2) {
    super(), this.type = "RingGeometry", this.parameters = {
      innerRadius: e,
      outerRadius: t,
      thetaSegments: n,
      phiSegments: i,
      thetaStart: r,
      thetaLength: a
    }, n = Math.max(3, n), i = Math.max(1, i);
    const o = [], c = [], l = [], u = [];
    let h = e;
    const d = (t - e) / i, f = new N(), g = new qe();
    for (let x = 0; x <= i; x++) {
      for (let p = 0; p <= n; p++) {
        const m = r + p / n * a;
        f.x = h * Math.cos(m), f.y = h * Math.sin(m), c.push(f.x, f.y, f.z), l.push(0, 0, 1), g.x = (f.x / t + 1) / 2, g.y = (f.y / t + 1) / 2, u.push(g.x, g.y);
      }
      h += d;
    }
    for (let x = 0; x < i; x++) {
      const p = x * (n + 1);
      for (let m = 0; m < n; m++) {
        const T = m + p, S = T, E = T + n + 1, F = T + n + 2, P = T + 1;
        o.push(S, E, P), o.push(E, F, P);
      }
    }
    this.setIndex(o), this.setAttribute("position", new dt(c, 3)), this.setAttribute("normal", new dt(l, 3)), this.setAttribute("uv", new dt(u, 2));
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new pi(e.innerRadius, e.outerRadius, e.thetaSegments, e.phiSegments, e.thetaStart, e.thetaLength);
  }
}
class gi extends Rt {
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
    const u = [], h = new N(), d = new N(), f = [], g = [], x = [], p = [];
    for (let m = 0; m <= n; m++) {
      const T = [], S = m / n;
      let E = 0;
      m === 0 && a === 0 ? E = 0.5 / t : m === n && c === Math.PI && (E = -0.5 / t);
      for (let F = 0; F <= t; F++) {
        const P = F / t;
        h.x = -e * Math.cos(i + P * r) * Math.sin(a + S * o), h.y = e * Math.cos(a + S * o), h.z = e * Math.sin(i + P * r) * Math.sin(a + S * o), g.push(h.x, h.y, h.z), d.copy(h).normalize(), x.push(d.x, d.y, d.z), p.push(P + E, 1 - S), T.push(l++);
      }
      u.push(T);
    }
    for (let m = 0; m < n; m++)
      for (let T = 0; T < t; T++) {
        const S = u[m][T + 1], E = u[m][T], F = u[m + 1][T], P = u[m + 1][T + 1];
        (m !== 0 || a > 0) && f.push(S, E, P), (m !== n - 1 || c < Math.PI) && f.push(E, F, P);
      }
    this.setIndex(f), this.setAttribute("position", new dt(g, 3)), this.setAttribute("normal", new dt(x, 3)), this.setAttribute("uv", new dt(p, 2));
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new gi(e.radius, e.widthSegments, e.heightSegments, e.phiStart, e.phiLength, e.thetaStart, e.thetaLength);
  }
}
class Lt extends rn {
  constructor(e) {
    super(), this.isMeshStandardMaterial = !0, this.defines = { STANDARD: "" }, this.type = "MeshStandardMaterial", this.color = new De(16777215), this.roughness = 1, this.metalness = 0, this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new De(0), this.emissiveIntensity = 1, this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = 0, this.normalScale = new qe(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.roughnessMap = null, this.metalnessMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new Sn(), this.envMapIntensity = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.flatShading = !1, this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.defines = { STANDARD: "" }, this.color.copy(e.color), this.roughness = e.roughness, this.metalness = e.metalness, this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.emissive.copy(e.emissive), this.emissiveMap = e.emissiveMap, this.emissiveIntensity = e.emissiveIntensity, this.bumpMap = e.bumpMap, this.bumpScale = e.bumpScale, this.normalMap = e.normalMap, this.normalMapType = e.normalMapType, this.normalScale.copy(e.normalScale), this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.roughnessMap = e.roughnessMap, this.metalnessMap = e.metalnessMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapRotation.copy(e.envMapRotation), this.envMapIntensity = e.envMapIntensity, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.flatShading = e.flatShading, this.fog = e.fog, this;
  }
}
class In extends Lt {
  constructor(e) {
    super(), this.isMeshPhysicalMaterial = !0, this.defines = {
      STANDARD: "",
      PHYSICAL: ""
    }, this.type = "MeshPhysicalMaterial", this.anisotropyRotation = 0, this.anisotropyMap = null, this.clearcoatMap = null, this.clearcoatRoughness = 0, this.clearcoatRoughnessMap = null, this.clearcoatNormalScale = new qe(1, 1), this.clearcoatNormalMap = null, this.ior = 1.5, Object.defineProperty(this, "reflectivity", {
      get: function() {
        return jt(2.5 * (this.ior - 1) / (this.ior + 1), 0, 1);
      },
      set: function(t) {
        this.ior = (1 + 0.4 * t) / (1 - 0.4 * t);
      }
    }), this.iridescenceMap = null, this.iridescenceIOR = 1.3, this.iridescenceThicknessRange = [100, 400], this.iridescenceThicknessMap = null, this.sheenColor = new De(0), this.sheenColorMap = null, this.sheenRoughness = 1, this.sheenRoughnessMap = null, this.transmissionMap = null, this.thickness = 0, this.thicknessMap = null, this.attenuationDistance = 1 / 0, this.attenuationColor = new De(1, 1, 1), this.specularIntensity = 1, this.specularIntensityMap = null, this.specularColor = new De(1, 1, 1), this.specularColorMap = null, this._anisotropy = 0, this._clearcoat = 0, this._dispersion = 0, this._iridescence = 0, this._sheen = 0, this._transmission = 0, this.setValues(e);
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
class Lc extends rn {
  constructor(e) {
    super(), this.isMeshPhongMaterial = !0, this.type = "MeshPhongMaterial", this.color = new De(16777215), this.specular = new De(1118481), this.shininess = 30, this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new De(0), this.emissiveIntensity = 1, this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = 0, this.normalScale = new qe(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new Sn(), this.combine = 0, this.reflectivity = 1, this.refractionRatio = 0.98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.flatShading = !1, this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.specular.copy(e.specular), this.shininess = e.shininess, this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.emissive.copy(e.emissive), this.emissiveMap = e.emissiveMap, this.emissiveIntensity = e.emissiveIntensity, this.bumpMap = e.bumpMap, this.bumpScale = e.bumpScale, this.normalMap = e.normalMap, this.normalMapType = e.normalMapType, this.normalScale.copy(e.normalScale), this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.specularMap = e.specularMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapRotation.copy(e.envMapRotation), this.combine = e.combine, this.reflectivity = e.reflectivity, this.refractionRatio = e.refractionRatio, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.flatShading = e.flatShading, this.fog = e.fog, this;
  }
}
function ar(s, e, t) {
  return !s || // let 'undefined' and 'null' pass
  !t && s.constructor === e ? s : typeof e.BYTES_PER_ELEMENT == "number" ? new e(s) : Array.prototype.slice.call(s);
}
function Jp(s) {
  return ArrayBuffer.isView(s) && !(s instanceof DataView);
}
function Qp(s) {
  function e(i, r) {
    return s[i] - s[r];
  }
  const t = s.length, n = new Array(t);
  for (let i = 0; i !== t; ++i) n[i] = i;
  return n.sort(e), n;
}
function Jo(s, e, t) {
  const n = s.length, i = new s.constructor(n);
  for (let r = 0, a = 0; a !== n; ++r) {
    const o = t[r] * e;
    for (let c = 0; c !== e; ++c)
      i[a++] = s[o + c];
  }
  return i;
}
function Dc(s, e, t, n) {
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
class Es {
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
class em extends Es {
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
    const l = (n - t) * 0.5, u = this.valueSize;
    this._weightPrev = l / (t - o), this._weightNext = l / (c - n), this._offsetPrev = r * u, this._offsetNext = a * u;
  }
  interpolate_(e, t, n, i) {
    const r = this.resultBuffer, a = this.sampleValues, o = this.valueSize, c = e * o, l = c - o, u = this._offsetPrev, h = this._offsetNext, d = this._weightPrev, f = this._weightNext, g = (n - t) / (i - t), x = g * g, p = x * g, m = -d * p + 2 * d * x - d * g, T = (1 + d) * p + (-1.5 - 2 * d) * x + (-0.5 + d) * g + 1, S = (-1 - f) * p + (1.5 + f) * x + 0.5 * g, E = f * p - f * x;
    for (let F = 0; F !== o; ++F)
      r[F] = m * a[u + F] + T * a[l + F] + S * a[c + F] + E * a[h + F];
    return r;
  }
}
class Uc extends Es {
  constructor(e, t, n, i) {
    super(e, t, n, i);
  }
  interpolate_(e, t, n, i) {
    const r = this.resultBuffer, a = this.sampleValues, o = this.valueSize, c = e * o, l = c - o, u = (n - t) / (i - t), h = 1 - u;
    for (let d = 0; d !== o; ++d)
      r[d] = a[l + d] * h + a[c + d] * u;
    return r;
  }
}
class tm extends Es {
  constructor(e, t, n, i) {
    super(e, t, n, i);
  }
  interpolate_(e) {
    return this.copySampleValue_(e - 1);
  }
}
class Pn {
  constructor(e, t, n, i) {
    if (e === void 0) throw new Error("THREE.KeyframeTrack: track name is undefined");
    if (t === void 0 || t.length === 0) throw new Error("THREE.KeyframeTrack: no keyframes in track named " + e);
    this.name = e, this.times = ar(t, this.TimeBufferType), this.values = ar(n, this.ValueBufferType), this.setInterpolation(i || this.DefaultInterpolation);
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
        times: ar(e.times, Array),
        values: ar(e.values, Array)
      };
      const i = e.getInterpolation();
      i !== e.DefaultInterpolation && (n.interpolation = i);
    }
    return n.type = e.ValueTypeName, n;
  }
  InterpolantFactoryMethodDiscrete(e) {
    return new tm(this.times, this.values, this.getValueSize(), e);
  }
  InterpolantFactoryMethodLinear(e) {
    return new Uc(this.times, this.values, this.getValueSize(), e);
  }
  InterpolantFactoryMethodSmooth(e) {
    return new em(this.times, this.values, this.getValueSize(), e);
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
    if (i !== void 0 && Jp(i))
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
      const l = e[o], u = e[o + 1];
      if (l !== u && (o !== 1 || l !== e[0]))
        if (i)
          c = !0;
        else {
          const h = o * n, d = h - n, f = h + n;
          for (let g = 0; g !== n; ++g) {
            const x = t[h + g];
            if (x !== t[d + g] || x !== t[f + g]) {
              c = !0;
              break;
            }
          }
        }
      if (c) {
        if (o !== a) {
          e[a] = e[o];
          const h = o * n, d = a * n;
          for (let f = 0; f !== n; ++f)
            t[d + f] = t[h + f];
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
Pn.prototype.TimeBufferType = Float32Array;
Pn.prototype.ValueBufferType = Float32Array;
Pn.prototype.DefaultInterpolation = 2301;
class ns extends Pn {
  // No interpolation parameter because only InterpolateDiscrete is valid.
  constructor(e, t, n) {
    super(e, t, n);
  }
}
ns.prototype.ValueTypeName = "bool";
ns.prototype.ValueBufferType = Array;
ns.prototype.DefaultInterpolation = 2300;
ns.prototype.InterpolantFactoryMethodLinear = void 0;
ns.prototype.InterpolantFactoryMethodSmooth = void 0;
class Nc extends Pn {
}
Nc.prototype.ValueTypeName = "color";
class Ji extends Pn {
}
Ji.prototype.ValueTypeName = "number";
class nm extends Es {
  constructor(e, t, n, i) {
    super(e, t, n, i);
  }
  interpolate_(e, t, n, i) {
    const r = this.resultBuffer, a = this.sampleValues, o = this.valueSize, c = (n - t) / (i - t);
    let l = e * o;
    for (let u = l + o; l !== u; l += 4)
      yn.slerpFlat(r, 0, a, l - o, a, l, c);
    return r;
  }
}
class Qi extends Pn {
  InterpolantFactoryMethodLinear(e) {
    return new nm(this.times, this.values, this.getValueSize(), e);
  }
}
Qi.prototype.ValueTypeName = "quaternion";
Qi.prototype.InterpolantFactoryMethodSmooth = void 0;
class is extends Pn {
  // No interpolation parameter because only InterpolateDiscrete is valid.
  constructor(e, t, n) {
    super(e, t, n);
  }
}
is.prototype.ValueTypeName = "string";
is.prototype.ValueBufferType = Array;
is.prototype.DefaultInterpolation = 2300;
is.prototype.InterpolantFactoryMethodLinear = void 0;
is.prototype.InterpolantFactoryMethodSmooth = void 0;
class es extends Pn {
}
es.prototype.ValueTypeName = "vector";
class xa {
  constructor(e = "", t = -1, n = [], i = 2500) {
    this.name = e, this.tracks = n, this.duration = t, this.blendMode = i, this.uuid = Mn(), this.duration < 0 && this.resetDuration();
  }
  static parse(e) {
    const t = [], n = e.tracks, i = 1 / (e.fps || 1);
    for (let a = 0, o = n.length; a !== o; ++a)
      t.push(sm(n[a]).scale(i));
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
      t.push(Pn.toJSON(n[r]));
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
      const u = Qp(c);
      c = Jo(c, 1, u), l = Jo(l, 1, u), !i && c[0] === 0 && (c.push(r), l.push(l[0])), a.push(
        new Ji(
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
      const l = e[o], u = l.name.match(r);
      if (u && u.length > 1) {
        const h = u[1];
        let d = i[h];
        d || (i[h] = d = []), d.push(l);
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
    const n = function(h, d, f, g, x) {
      if (f.length !== 0) {
        const p = [], m = [];
        Dc(f, p, m, g), p.length !== 0 && x.push(new h(d, p, m));
      }
    }, i = [], r = e.name || "default", a = e.fps || 30, o = e.blendMode;
    let c = e.length || -1;
    const l = e.hierarchy || [];
    for (let h = 0; h < l.length; h++) {
      const d = l[h].keys;
      if (!(!d || d.length === 0))
        if (d[0].morphTargets) {
          const f = {};
          let g;
          for (g = 0; g < d.length; g++)
            if (d[g].morphTargets)
              for (let x = 0; x < d[g].morphTargets.length; x++)
                f[d[g].morphTargets[x]] = -1;
          for (const x in f) {
            const p = [], m = [];
            for (let T = 0; T !== d[g].morphTargets.length; ++T) {
              const S = d[g];
              p.push(S.time), m.push(S.morphTarget === x ? 1 : 0);
            }
            i.push(new Ji(".morphTargetInfluence[" + x + "]", p, m));
          }
          c = f.length * a;
        } else {
          const f = ".bones[" + t[h].name + "]";
          n(
            es,
            f + ".position",
            d,
            "pos",
            i
          ), n(
            Qi,
            f + ".quaternion",
            d,
            "rot",
            i
          ), n(
            es,
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
function im(s) {
  switch (s.toLowerCase()) {
    case "scalar":
    case "double":
    case "float":
    case "number":
    case "integer":
      return Ji;
    case "vector":
    case "vector2":
    case "vector3":
    case "vector4":
      return es;
    case "color":
      return Nc;
    case "quaternion":
      return Qi;
    case "bool":
    case "boolean":
      return ns;
    case "string":
      return is;
  }
  throw new Error("THREE.KeyframeTrack: Unsupported typeName: " + s);
}
function sm(s) {
  if (s.type === void 0)
    throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");
  const e = im(s.type);
  if (s.times === void 0) {
    const t = [], n = [];
    Dc(s.keys, t, n, "value"), s.times = t, s.values = n;
  }
  return e.parse !== void 0 ? e.parse(s) : new e(s.name, s.times, s.values, s.interpolation);
}
const Jn = {
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
class rm {
  constructor(e, t, n) {
    const i = this;
    let r = !1, a = 0, o = 0, c;
    const l = [];
    this.onStart = void 0, this.onLoad = e, this.onProgress = t, this.onError = n, this.itemStart = function(u) {
      o++, r === !1 && i.onStart !== void 0 && i.onStart(u, a, o), r = !0;
    }, this.itemEnd = function(u) {
      a++, i.onProgress !== void 0 && i.onProgress(u, a, o), a === o && (r = !1, i.onLoad !== void 0 && i.onLoad());
    }, this.itemError = function(u) {
      i.onError !== void 0 && i.onError(u);
    }, this.resolveURL = function(u) {
      return c ? c(u) : u;
    }, this.setURLModifier = function(u) {
      return c = u, this;
    }, this.addHandler = function(u, h) {
      return l.push(u, h), this;
    }, this.removeHandler = function(u) {
      const h = l.indexOf(u);
      return h !== -1 && l.splice(h, 2), this;
    }, this.getHandler = function(u) {
      for (let h = 0, d = l.length; h < d; h += 2) {
        const f = l[h], g = l[h + 1];
        if (f.global && (f.lastIndex = 0), f.test(u))
          return g;
      }
      return null;
    };
  }
}
const Fc = /* @__PURE__ */ new rm();
class ti {
  constructor(e) {
    this.manager = e !== void 0 ? e : Fc, this.crossOrigin = "anonymous", this.withCredentials = !1, this.path = "", this.resourcePath = "", this.requestHeader = {};
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
ti.DEFAULT_MATERIAL_NAME = "__DEFAULT";
const On = {};
class am extends Error {
  constructor(e, t) {
    super(e), this.response = t;
  }
}
class Mr extends ti {
  constructor(e) {
    super(e);
  }
  load(e, t, n, i) {
    e === void 0 && (e = ""), this.path !== void 0 && (e = this.path + e), e = this.manager.resolveURL(e);
    const r = Jn.get(e);
    if (r !== void 0)
      return this.manager.itemStart(e), setTimeout(() => {
        t && t(r), this.manager.itemEnd(e);
      }, 0), r;
    if (On[e] !== void 0) {
      On[e].push({
        onLoad: t,
        onProgress: n,
        onError: i
      });
      return;
    }
    On[e] = [], On[e].push({
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
        const u = On[e], h = l.body.getReader(), d = l.headers.get("X-File-Size") || l.headers.get("Content-Length"), f = d ? parseInt(d) : 0, g = f !== 0;
        let x = 0;
        const p = new ReadableStream({
          start(m) {
            T();
            function T() {
              h.read().then(({ done: S, value: E }) => {
                if (S)
                  m.close();
                else {
                  x += E.byteLength;
                  const F = new ProgressEvent("progress", { lengthComputable: g, loaded: x, total: f });
                  for (let P = 0, L = u.length; P < L; P++) {
                    const z = u[P];
                    z.onProgress && z.onProgress(F);
                  }
                  m.enqueue(E), T();
                }
              }, (S) => {
                m.error(S);
              });
            }
          }
        });
        return new Response(p);
      } else
        throw new am(`fetch for "${l.url}" responded with ${l.status}: ${l.statusText}`, l);
    }).then((l) => {
      switch (c) {
        case "arraybuffer":
          return l.arrayBuffer();
        case "blob":
          return l.blob();
        case "document":
          return l.text().then((u) => new DOMParser().parseFromString(u, o));
        case "json":
          return l.json();
        default:
          if (o === void 0)
            return l.text();
          {
            const h = /charset="?([^;"\s]*)"?/i.exec(o), d = h && h[1] ? h[1].toLowerCase() : void 0, f = new TextDecoder(d);
            return l.arrayBuffer().then((g) => f.decode(g));
          }
      }
    }).then((l) => {
      Jn.add(e, l);
      const u = On[e];
      delete On[e];
      for (let h = 0, d = u.length; h < d; h++) {
        const f = u[h];
        f.onLoad && f.onLoad(l);
      }
    }).catch((l) => {
      const u = On[e];
      if (u === void 0)
        throw this.manager.itemError(e), l;
      delete On[e];
      for (let h = 0, d = u.length; h < d; h++) {
        const f = u[h];
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
class om extends ti {
  constructor(e) {
    super(e);
  }
  load(e, t, n, i) {
    this.path !== void 0 && (e = this.path + e), e = this.manager.resolveURL(e);
    const r = this, a = Jn.get(e);
    if (a !== void 0)
      return r.manager.itemStart(e), setTimeout(function() {
        t && t(a), r.manager.itemEnd(e);
      }, 0), a;
    const o = Ms("img");
    function c() {
      u(), Jn.add(e, this), t && t(this), r.manager.itemEnd(e);
    }
    function l(h) {
      u(), i && i(h), r.manager.itemError(e), r.manager.itemEnd(e);
    }
    function u() {
      o.removeEventListener("load", c, !1), o.removeEventListener("error", l, !1);
    }
    return o.addEventListener("load", c, !1), o.addEventListener("error", l, !1), e.slice(0, 5) !== "data:" && this.crossOrigin !== void 0 && (o.crossOrigin = this.crossOrigin), r.manager.itemStart(e), o.src = e, o;
  }
}
class Bc extends ti {
  constructor(e) {
    super(e);
  }
  load(e, t, n, i) {
    const r = new Ft(), a = new om(this.manager);
    return a.setCrossOrigin(this.crossOrigin), a.setPath(this.path), a.load(e, function(o) {
      r.image = o, r.needsUpdate = !0, t !== void 0 && t(r);
    }, n, i), r;
  }
}
class yr extends At {
  constructor(e, t = 1) {
    super(), this.isLight = !0, this.type = "Light", this.color = new De(e), this.intensity = t;
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
class cm extends yr {
  constructor(e, t, n) {
    super(e, n), this.isHemisphereLight = !0, this.type = "HemisphereLight", this.position.copy(At.DEFAULT_UP), this.updateMatrix(), this.groundColor = new De(t);
  }
  copy(e, t) {
    return super.copy(e, t), this.groundColor.copy(e.groundColor), this;
  }
}
const oa = /* @__PURE__ */ new je(), Qo = /* @__PURE__ */ new N(), ec = /* @__PURE__ */ new N();
class La {
  constructor(e) {
    this.camera = e, this.intensity = 1, this.bias = 0, this.normalBias = 0, this.radius = 1, this.blurSamples = 8, this.mapSize = new qe(512, 512), this.map = null, this.mapPass = null, this.matrix = new je(), this.autoUpdate = !0, this.needsUpdate = !1, this._frustum = new ba(), this._frameExtents = new qe(1, 1), this._viewportCount = 1, this._viewports = [
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
    Qo.setFromMatrixPosition(e.matrixWorld), t.position.copy(Qo), ec.setFromMatrixPosition(e.target.matrixWorld), t.lookAt(ec), t.updateMatrixWorld(), oa.multiplyMatrices(t.projectionMatrix, t.matrixWorldInverse), this._frustum.setFromProjectionMatrix(oa), n.set(
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
    ), n.multiply(oa);
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
class lm extends La {
  constructor() {
    super(new en(50, 1, 0.5, 500)), this.isSpotLightShadow = !0, this.focus = 1;
  }
  updateMatrices(e) {
    const t = this.camera, n = Zi * 2 * e.angle * this.focus, i = this.mapSize.width / this.mapSize.height, r = e.distance || t.far;
    (n !== t.fov || i !== t.aspect || r !== t.far) && (t.fov = n, t.aspect = i, t.far = r, t.updateProjectionMatrix()), super.updateMatrices(e);
  }
  copy(e) {
    return super.copy(e), this.focus = e.focus, this;
  }
}
class hm extends yr {
  constructor(e, t, n = 0, i = Math.PI / 3, r = 0, a = 2) {
    super(e, t), this.isSpotLight = !0, this.type = "SpotLight", this.position.copy(At.DEFAULT_UP), this.updateMatrix(), this.target = new At(), this.distance = n, this.angle = i, this.penumbra = r, this.decay = a, this.map = null, this.shadow = new lm();
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
const tc = /* @__PURE__ */ new je(), ms = /* @__PURE__ */ new N(), ca = /* @__PURE__ */ new N();
class um extends La {
  constructor() {
    super(new en(90, 1, 0.5, 500)), this.isPointLightShadow = !0, this._frameExtents = new qe(4, 2), this._viewportCount = 6, this._viewports = [
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
      new N(1, 0, 0),
      new N(-1, 0, 0),
      new N(0, 0, 1),
      new N(0, 0, -1),
      new N(0, 1, 0),
      new N(0, -1, 0)
    ], this._cubeUps = [
      new N(0, 1, 0),
      new N(0, 1, 0),
      new N(0, 1, 0),
      new N(0, 1, 0),
      new N(0, 0, 1),
      new N(0, 0, -1)
    ];
  }
  updateMatrices(e, t = 0) {
    const n = this.camera, i = this.matrix, r = e.distance || n.far;
    r !== n.far && (n.far = r, n.updateProjectionMatrix()), ms.setFromMatrixPosition(e.matrixWorld), n.position.copy(ms), ca.copy(n.position), ca.add(this._cubeDirections[t]), n.up.copy(this._cubeUps[t]), n.lookAt(ca), n.updateMatrixWorld(), i.makeTranslation(-ms.x, -ms.y, -ms.z), tc.multiplyMatrices(n.projectionMatrix, n.matrixWorldInverse), this._frustum.setFromProjectionMatrix(tc);
  }
}
class dm extends yr {
  constructor(e, t, n = 0, i = 2) {
    super(e, t), this.isPointLight = !0, this.type = "PointLight", this.distance = n, this.decay = i, this.shadow = new um();
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
class fm extends La {
  constructor() {
    super(new xr(-5, 5, 5, -5, 0.5, 500)), this.isDirectionalLightShadow = !0;
  }
}
class Oc extends yr {
  constructor(e, t) {
    super(e, t), this.isDirectionalLight = !0, this.type = "DirectionalLight", this.position.copy(At.DEFAULT_UP), this.updateMatrix(), this.target = new At(), this.shadow = new fm();
  }
  dispose() {
    this.shadow.dispose();
  }
  copy(e) {
    return super.copy(e), this.target = e.target.clone(), this.shadow = e.shadow.clone(), this;
  }
}
class Yi {
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
class pm extends ti {
  constructor(e) {
    super(e), this.isImageBitmapLoader = !0, typeof createImageBitmap > "u" && console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."), typeof fetch > "u" && console.warn("THREE.ImageBitmapLoader: fetch() not supported."), this.options = { premultiplyAlpha: "none" };
  }
  setOptions(e) {
    return this.options = e, this;
  }
  load(e, t, n, i) {
    e === void 0 && (e = ""), this.path !== void 0 && (e = this.path + e), e = this.manager.resolveURL(e);
    const r = this, a = Jn.get(e);
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
      return Jn.add(e, l), t && t(l), r.manager.itemEnd(e), l;
    }).catch(function(l) {
      i && i(l), Jn.remove(e), r.manager.itemError(e), r.manager.itemEnd(e);
    });
    Jn.add(e, c), r.manager.itemStart(e);
  }
}
class mm {
  constructor(e = !0) {
    this.autoStart = e, this.startTime = 0, this.oldTime = 0, this.elapsedTime = 0, this.running = !1;
  }
  start() {
    this.startTime = nc(), this.oldTime = this.startTime, this.elapsedTime = 0, this.running = !0;
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
      const t = nc();
      e = (t - this.oldTime) / 1e3, this.oldTime = t, this.elapsedTime += e;
    }
    return e;
  }
}
function nc() {
  return performance.now();
}
class gm {
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
    yn.slerpFlat(e, t, e, t, e, n, i);
  }
  _slerpAdditive(e, t, n, i, r) {
    const a = this._workIndex * r;
    yn.multiplyQuaternionsFlat(e, a, e, t, e, n), yn.slerpFlat(e, t, e, t, e, a, i);
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
const Da = "\\[\\]\\.:\\/", _m = new RegExp("[" + Da + "]", "g"), Ua = "[^" + Da + "]", xm = "[^" + Da.replace("\\.", "") + "]", vm = /* @__PURE__ */ /((?:WC+[\/:])*)/.source.replace("WC", Ua), Mm = /* @__PURE__ */ /(WCOD+)?/.source.replace("WCOD", xm), ym = /* @__PURE__ */ /(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC", Ua), Sm = /* @__PURE__ */ /\.(WC+)(?:\[(.+)\])?/.source.replace("WC", Ua), Em = new RegExp(
  "^" + vm + Mm + ym + Sm + "$"
), Tm = ["material", "materials", "bones", "map"];
class Am {
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
    return e.replace(/\s/g, "_").replace(_m, "");
  }
  static parseTrackName(e) {
    const t = Em.exec(e);
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
      Tm.indexOf(r) !== -1 && (n.nodeName = n.nodeName.substring(0, i), n.objectName = r);
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
          for (let u = 0; u < e.length; u++)
            if (e[u].name === l) {
              l = u;
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
pt.Composite = Am;
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
class bm {
  constructor(e, t, n = null, i = t.blendMode) {
    this._mixer = e, this._clip = t, this._localRoot = n, this.blendMode = i;
    const r = t.tracks, a = r.length, o = new Array(a), c = {
      endingStart: 2400,
      endingEnd: 2400
    };
    for (let l = 0; l !== a; ++l) {
      const u = r[l].createInterpolant(null);
      o[l] = u, u.settings = c;
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
          for (let u = 0, h = c.length; u !== h; ++u)
            c[u].evaluate(a), l[u].accumulateAdditive(o);
          break;
        case 2500:
        default:
          for (let u = 0, h = c.length; u !== h; ++u)
            c[u].evaluate(a), l[u].accumulate(i, o);
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
const wm = new Float32Array(1);
class Rm extends xi {
  constructor(e) {
    super(), this._root = e, this._initMemoryManager(), this._accuIndex = 0, this.time = 0, this.timeScale = 1;
  }
  _bindAction(e, t) {
    const n = e._localRoot || this._root, i = e._clip.tracks, r = i.length, a = e._propertyBindings, o = e._interpolants, c = n.uuid, l = this._bindingsByRootAndName;
    let u = l[c];
    u === void 0 && (u = {}, l[c] = u);
    for (let h = 0; h !== r; ++h) {
      const d = i[h], f = d.name;
      let g = u[f];
      if (g !== void 0)
        ++g.referenceCount, a[h] = g;
      else {
        if (g = a[h], g !== void 0) {
          g._cacheIndex === null && (++g.referenceCount, this._addInactiveBinding(g, c, f));
          continue;
        }
        const x = t && t._propertyBindings[h].binding.parsedPath;
        g = new gm(
          pt.create(n, f, x),
          d.ValueTypeName,
          d.getValueSize()
        ), ++g.referenceCount, this._addInactiveBinding(g, c, f), a[h] = g;
      }
      o[h].resultBuffer = g.buffer;
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
    const r = e._clip.uuid, a = this._actionsByClip, o = a[r], c = o.knownActions, l = c[c.length - 1], u = e._byClipCacheIndex;
    l._byClipCacheIndex = u, c[u] = l, c.pop(), e._byClipCacheIndex = null;
    const h = o.actionByRoot, d = (e._localRoot || this._root).uuid;
    delete h[d], c.length === 0 && delete a[r], this._removeInactiveBindingsForAction(e);
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
    return n === void 0 && (n = new Uc(
      new Float32Array(2),
      new Float32Array(2),
      1,
      wm
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
    let a = typeof e == "string" ? xa.findByName(i, e) : e;
    const o = a !== null ? a.uuid : e, c = this._actionsByClip[o];
    let l = null;
    if (n === void 0 && (a !== null ? n = a.blendMode : n = 2500), c !== void 0) {
      const h = c.actionByRoot[r];
      if (h !== void 0 && h.blendMode === n)
        return h;
      l = c.knownActions[0], a === null && (a = l._clip);
    }
    if (a === null) return null;
    const u = new bm(this, a, t, n);
    return this._bindAction(u, l), this._addInactiveAction(u, o, r), u;
  }
  // get an existing action
  existingAction(e, t) {
    const n = t || this._root, i = n.uuid, r = typeof e == "string" ? xa.findByName(n, e) : e, a = r ? r.uuid : e, o = this._actionsByClip[a];
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
        const u = l._cacheIndex, h = t[t.length - 1];
        l._cacheIndex = null, l._byClipCacheIndex = null, h._cacheIndex = u, t[u] = h, t.pop(), this._removeInactiveBindingsForAction(l);
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
const ic = /* @__PURE__ */ new je();
class Cm {
  constructor(e, t, n = 0, i = 1 / 0) {
    this.ray = new Ss(e, t), this.near = n, this.far = i, this.camera = null, this.layers = new Aa(), this.params = {
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
    return ic.identity().extractRotation(e.matrixWorld), this.ray.origin.setFromMatrixPosition(e.matrixWorld), this.ray.direction.set(0, 0, -1).applyMatrix4(ic), this;
  }
  intersectObject(e, t = !0, n = []) {
    return va(e, this, n, t), n.sort(sc), n;
  }
  intersectObjects(e, t = !0, n = []) {
    for (let i = 0, r = e.length; i < r; i++)
      va(e[i], this, n, t);
    return n.sort(sc), n;
  }
}
function sc(s, e) {
  return s.distance - e.distance;
}
function va(s, e, t, n) {
  let i = !0;
  if (s.layers.test(e.layers) && s.raycast(e, t) === !1 && (i = !1), i === !0 && n === !0) {
    const r = s.children;
    for (let a = 0, o = r.length; a < o; a++)
      va(r[a], e, t, !0);
  }
}
typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register", { detail: {
  revision: Sa
} }));
typeof window < "u" && (window.__THREE__ ? console.warn("WARNING: Multiple instances of Three.js being imported.") : window.__THREE__ = Sa);
const Im = /^[og]\s*(.+)?/, Pm = /^mtllib /, Lm = /^usemtl /, Dm = /^usemap /, rc = /\s+/, ac = new N(), la = new N(), oc = new N(), cc = new N(), hn = new N(), or = new De();
function Um() {
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
      ac.fromArray(i, e), la.fromArray(i, t), oc.fromArray(i, n), hn.subVectors(oc, la), cc.subVectors(ac, la), hn.cross(cc), hn.normalize(), r.push(hn.x, hn.y, hn.z), r.push(hn.x, hn.y, hn.z), r.push(hn.x, hn.y, hn.z);
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
      const u = this.vertices.length;
      let h = this.parseVertexIndex(e, u), d = this.parseVertexIndex(t, u), f = this.parseVertexIndex(n, u);
      if (this.addVertex(h, d, f), this.addColor(h, d, f), o !== void 0 && o !== "") {
        const g = this.normals.length;
        h = this.parseNormalIndex(o, g), d = this.parseNormalIndex(c, g), f = this.parseNormalIndex(l, g), this.addNormal(h, d, f);
      } else
        this.addFaceNormal(h, d, f);
      if (i !== void 0 && i !== "") {
        const g = this.uvs.length;
        h = this.parseUVIndex(i, g), d = this.parseUVIndex(r, g), f = this.parseUVIndex(a, g), this.addUV(h, d, f), this.object.geometry.hasUVIndices = !0;
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
class Nm extends ti {
  constructor(e) {
    super(e), this.materials = null;
  }
  load(e, t, n, i) {
    const r = this, a = new Mr(this.manager);
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
    const t = new Um();
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
      const u = l.charAt(0);
      if (u !== "#")
        if (u === "v") {
          const h = l.split(rc);
          switch (h[0]) {
            case "v":
              t.vertices.push(
                parseFloat(h[1]),
                parseFloat(h[2]),
                parseFloat(h[3])
              ), h.length >= 7 ? (or.setRGB(
                parseFloat(h[4]),
                parseFloat(h[5]),
                parseFloat(h[6]),
                wt
              ), t.colors.push(or.r, or.g, or.b)) : t.colors.push(void 0, void 0, void 0);
              break;
            case "vn":
              t.normals.push(
                parseFloat(h[1]),
                parseFloat(h[2]),
                parseFloat(h[3])
              );
              break;
            case "vt":
              t.uvs.push(
                parseFloat(h[1]),
                parseFloat(h[2])
              );
              break;
          }
        } else if (u === "f") {
          const d = l.slice(1).trim().split(rc), f = [];
          for (let x = 0, p = d.length; x < p; x++) {
            const m = d[x];
            if (m.length > 0) {
              const T = m.split("/");
              f.push(T);
            }
          }
          const g = f[0];
          for (let x = 1, p = f.length - 1; x < p; x++) {
            const m = f[x], T = f[x + 1];
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
        } else if (u === "l") {
          const h = l.substring(1).trim().split(" ");
          let d = [];
          const f = [];
          if (l.indexOf("/") === -1)
            d = h;
          else
            for (let g = 0, x = h.length; g < x; g++) {
              const p = h[g].split("/");
              p[0] !== "" && d.push(p[0]), p[1] !== "" && f.push(p[1]);
            }
          t.addLineGeometry(d, f);
        } else if (u === "p") {
          const d = l.slice(1).trim().split(" ");
          t.addPointGeometry(d);
        } else if ((i = Im.exec(l)) !== null) {
          const h = (" " + i[0].slice(1).trim()).slice(1);
          t.startObject(h);
        } else if (Lm.test(l))
          t.object.startMaterial(l.substring(7).trim(), t.materialLibraries);
        else if (Pm.test(l))
          t.materialLibraries.push(l.substring(7).trim());
        else if (Dm.test(l))
          console.warn('THREE.OBJLoader: Rendering identifier "usemap" not supported. Textures must be defined in MTL files.');
        else if (u === "s") {
          if (i = l.split(" "), i.length > 1) {
            const d = i[1].trim().toLowerCase();
            t.object.smooth = d !== "0" && d !== "off";
          } else
            t.object.smooth = !0;
          const h = t.object.currentMaterial();
          h && (h.smooth = t.object.smooth);
        } else {
          if (l === "\0") continue;
          console.warn('THREE.OBJLoader: Unexpected line: "' + l + '"');
        }
    }
    t.finalize();
    const r = new It();
    if (r.materialLibraries = [].concat(t.materialLibraries), !(t.objects.length === 1 && t.objects[0].geometry.vertices.length === 0) === !0)
      for (let o = 0, c = t.objects.length; o < c; o++) {
        const l = t.objects[o], u = l.geometry, h = l.materials, d = u.type === "Line", f = u.type === "Points";
        let g = !1;
        if (u.vertices.length === 0) continue;
        const x = new Rt();
        x.setAttribute("position", new dt(u.vertices, 3)), u.normals.length > 0 && x.setAttribute("normal", new dt(u.normals, 3)), u.colors.length > 0 && (g = !0, x.setAttribute("color", new dt(u.colors, 3))), u.hasUVIndices === !0 && x.setAttribute("uv", new dt(u.uvs, 2));
        const p = [];
        for (let T = 0, S = h.length; T < S; T++) {
          const E = h[T], F = E.name + "_" + E.smooth + "_" + g;
          let P = t.materials[F];
          if (this.materials !== null) {
            if (P = this.materials.create(E.name), d && P && !(P instanceof xn)) {
              const L = new xn();
              rn.prototype.copy.call(L, P), L.color.copy(P.color), P = L;
            } else if (f && P && !(P instanceof Wi)) {
              const L = new Wi({ size: 10, sizeAttenuation: !1 });
              rn.prototype.copy.call(L, P), L.color.copy(P.color), L.map = P.map, P = L;
            }
          }
          P === void 0 && (d ? P = new xn() : f ? P = new Wi({ size: 1, sizeAttenuation: !1 }) : P = new Lc(), P.name = E.name, P.flatShading = !E.smooth, P.vertexColors = g, t.materials[F] = P), p.push(P);
        }
        let m;
        if (p.length > 1) {
          for (let T = 0, S = h.length; T < S; T++) {
            const E = h[T];
            x.addGroup(E.groupStart, E.groupCount, T);
          }
          d ? m = new mi(x, p) : f ? m = new ur(x, p) : m = new Le(x, p);
        } else
          d ? m = new mi(x, p[0]) : f ? m = new ur(x, p[0]) : m = new Le(x, p[0]);
        m.name = l.name, r.add(m);
      }
    else if (t.vertices.length > 0) {
      const o = new Wi({ size: 1, sizeAttenuation: !1 }), c = new Rt();
      c.setAttribute("position", new dt(t.vertices, 3)), t.colors.length > 0 && t.colors[0] !== void 0 && (c.setAttribute("color", new dt(t.colors, 3)), o.vertexColors = !0);
      const l = new ur(c, o);
      r.add(l);
    }
    return r;
  }
}
class Fm extends ti {
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
    const r = this, a = this.path === "" ? Yi.extractUrlBase(e) : this.path, o = new Mr(this.manager);
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
      const u = l.indexOf(" ");
      let h = u >= 0 ? l.substring(0, u) : l;
      h = h.toLowerCase();
      let d = u >= 0 ? l.substring(u + 1) : "";
      if (d = d.trim(), h === "newmtl")
        i = { name: d }, a[d] = i;
      else if (h === "ka" || h === "kd" || h === "ks" || h === "ke") {
        const f = d.split(r, 3);
        i[h] = [parseFloat(f[0]), parseFloat(f[1]), parseFloat(f[2])];
      } else
        i[h] = d;
    }
    const o = new Bm(this.resourcePath || t, this.materialOptions);
    return o.setCrossOrigin(this.crossOrigin), o.setManager(this.manager), o.setMaterials(a), o;
  }
}
class Bm {
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
      const l = t.getTextureParams(c, i), u = t.loadTexture(r(t.baseUrl, l.url));
      u.repeat.copy(l.scale), u.offset.copy(l.offset), u.wrapS = t.wrap, u.wrapT = t.wrap, (o === "map" || o === "emissiveMap") && (u.colorSpace = wt), i[o] = u;
    }
    for (const o in n) {
      const c = n[o];
      let l;
      if (c !== "")
        switch (o.toLowerCase()) {
          case "kd":
            i.color = at.toWorkingColorSpace(new De().fromArray(c), wt);
            break;
          case "ks":
            i.specular = at.toWorkingColorSpace(new De().fromArray(c), wt);
            break;
          case "ke":
            i.emissive = at.toWorkingColorSpace(new De().fromArray(c), wt);
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
    return this.materials[e] = new Lc(i), this.materials[e];
  }
  getTextureParams(e, t) {
    const n = {
      scale: new qe(1, 1),
      offset: new qe(0, 0)
    }, i = e.split(/\s+/);
    let r;
    return r = i.indexOf("-bm"), r >= 0 && (t.bumpScale = parseFloat(i[r + 1]), i.splice(r, 2)), r = i.indexOf("-s"), r >= 0 && (n.scale.set(parseFloat(i[r + 1]), parseFloat(i[r + 2])), i.splice(r, 4)), r = i.indexOf("-o"), r >= 0 && (n.offset.set(parseFloat(i[r + 1]), parseFloat(i[r + 2])), i.splice(r, 4)), n.url = i.join(" ").trim(), n;
  }
  loadTexture(e, t, n, i, r) {
    const a = this.manager !== void 0 ? this.manager : Fc;
    let o = a.getHandler(e);
    o === null && (o = new Bc(a)), o.setCrossOrigin && o.setCrossOrigin(this.crossOrigin);
    const c = o.load(e, n, i, r);
    return t !== void 0 && (c.mapping = t), c;
  }
}
function lc(s, e) {
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
class Om extends ti {
  constructor(e) {
    super(e), this.dracoLoader = null, this.ktx2Loader = null, this.meshoptDecoder = null, this.pluginCallbacks = [], this.register(function(t) {
      return new Vm(t);
    }), this.register(function(t) {
      return new Wm(t);
    }), this.register(function(t) {
      return new Qm(t);
    }), this.register(function(t) {
      return new eg(t);
    }), this.register(function(t) {
      return new tg(t);
    }), this.register(function(t) {
      return new qm(t);
    }), this.register(function(t) {
      return new jm(t);
    }), this.register(function(t) {
      return new Ym(t);
    }), this.register(function(t) {
      return new Km(t);
    }), this.register(function(t) {
      return new Hm(t);
    }), this.register(function(t) {
      return new Zm(t);
    }), this.register(function(t) {
      return new Xm(t);
    }), this.register(function(t) {
      return new Jm(t);
    }), this.register(function(t) {
      return new $m(t);
    }), this.register(function(t) {
      return new zm(t);
    }), this.register(function(t) {
      return new ng(t);
    }), this.register(function(t) {
      return new ig(t);
    });
  }
  load(e, t, n, i) {
    const r = this;
    let a;
    if (this.resourcePath !== "")
      a = this.resourcePath;
    else if (this.path !== "") {
      const l = Yi.extractUrlBase(e);
      a = Yi.resolveURL(l, this.path);
    } else
      a = Yi.extractUrlBase(e);
    this.manager.itemStart(e);
    const o = function(l) {
      i ? i(l) : console.error(l), r.manager.itemError(e), r.manager.itemEnd(e);
    }, c = new Mr(this.manager);
    c.setPath(this.path), c.setResponseType("arraybuffer"), c.setRequestHeader(this.requestHeader), c.setWithCredentials(this.withCredentials), c.load(e, function(l) {
      try {
        r.parse(l, a, function(u) {
          t(u), r.manager.itemEnd(e);
        }, o);
      } catch (u) {
        o(u);
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
      if (c.decode(new Uint8Array(e, 0, 4)) === kc) {
        try {
          a[Je.KHR_BINARY_GLTF] = new sg(e);
        } catch (h) {
          i && i(h);
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
    const l = new _g(r, {
      path: t || this.resourcePath || "",
      crossOrigin: this.crossOrigin,
      requestHeader: this.requestHeader,
      manager: this.manager,
      ktx2Loader: this.ktx2Loader,
      meshoptDecoder: this.meshoptDecoder
    });
    l.fileLoader.setRequestHeader(this.requestHeader);
    for (let u = 0; u < this.pluginCallbacks.length; u++) {
      const h = this.pluginCallbacks[u](l);
      h.name || console.error("THREE.GLTFLoader: Invalid plugin found: missing name"), o[h.name] = h, a[h.name] = !0;
    }
    if (r.extensionsUsed)
      for (let u = 0; u < r.extensionsUsed.length; ++u) {
        const h = r.extensionsUsed[u], d = r.extensionsRequired || [];
        switch (h) {
          case Je.KHR_MATERIALS_UNLIT:
            a[h] = new Gm();
            break;
          case Je.KHR_DRACO_MESH_COMPRESSION:
            a[h] = new rg(r, this.dracoLoader);
            break;
          case Je.KHR_TEXTURE_TRANSFORM:
            a[h] = new ag();
            break;
          case Je.KHR_MESH_QUANTIZATION:
            a[h] = new og();
            break;
          default:
            d.indexOf(h) >= 0 && o[h] === void 0 && console.warn('THREE.GLTFLoader: Unknown extension "' + h + '".');
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
function km() {
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
class zm {
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
    const u = new De(16777215);
    c.color !== void 0 && u.setRGB(c.color[0], c.color[1], c.color[2], Ht);
    const h = c.range !== void 0 ? c.range : 0;
    switch (c.type) {
      case "directional":
        l = new Oc(u), l.target.position.set(0, 0, -1), l.add(l.target);
        break;
      case "point":
        l = new dm(u), l.distance = h;
        break;
      case "spot":
        l = new hm(u), l.distance = h, c.spot = c.spot || {}, c.spot.innerConeAngle = c.spot.innerConeAngle !== void 0 ? c.spot.innerConeAngle : 0, c.spot.outerConeAngle = c.spot.outerConeAngle !== void 0 ? c.spot.outerConeAngle : Math.PI / 4, l.angle = c.spot.outerConeAngle, l.penumbra = 1 - c.spot.innerConeAngle / c.spot.outerConeAngle, l.target.position.set(0, 0, -1), l.add(l.target);
        break;
      default:
        throw new Error("THREE.GLTFLoader: Unexpected light type: " + c.type);
    }
    return l.position.set(0, 0, 0), l.decay = 2, kn(l, c), c.intensity !== void 0 && (l.intensity = c.intensity), l.name = t.createUniqueName(c.name || "light_" + e), i = Promise.resolve(l), t.cache.add(n, i), i;
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
class Gm {
  constructor() {
    this.name = Je.KHR_MATERIALS_UNLIT;
  }
  getMaterialType() {
    return St;
  }
  extendParams(e, t, n) {
    const i = [];
    e.color = new De(1, 1, 1), e.opacity = 1;
    const r = t.pbrMetallicRoughness;
    if (r) {
      if (Array.isArray(r.baseColorFactor)) {
        const a = r.baseColorFactor;
        e.color.setRGB(a[0], a[1], a[2], Ht), e.opacity = a[3];
      }
      r.baseColorTexture !== void 0 && i.push(n.assignTexture(e, "map", r.baseColorTexture, wt));
    }
    return Promise.all(i);
  }
}
class Hm {
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
class Vm {
  constructor(e) {
    this.parser = e, this.name = Je.KHR_MATERIALS_CLEARCOAT;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : In;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, i = n.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = [], a = i.extensions[this.name];
    if (a.clearcoatFactor !== void 0 && (t.clearcoat = a.clearcoatFactor), a.clearcoatTexture !== void 0 && r.push(n.assignTexture(t, "clearcoatMap", a.clearcoatTexture)), a.clearcoatRoughnessFactor !== void 0 && (t.clearcoatRoughness = a.clearcoatRoughnessFactor), a.clearcoatRoughnessTexture !== void 0 && r.push(n.assignTexture(t, "clearcoatRoughnessMap", a.clearcoatRoughnessTexture)), a.clearcoatNormalTexture !== void 0 && (r.push(n.assignTexture(t, "clearcoatNormalMap", a.clearcoatNormalTexture)), a.clearcoatNormalTexture.scale !== void 0)) {
      const o = a.clearcoatNormalTexture.scale;
      t.clearcoatNormalScale = new qe(o, o);
    }
    return Promise.all(r);
  }
}
class Wm {
  constructor(e) {
    this.parser = e, this.name = Je.KHR_MATERIALS_DISPERSION;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : In;
  }
  extendMaterialParams(e, t) {
    const i = this.parser.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = i.extensions[this.name];
    return t.dispersion = r.dispersion !== void 0 ? r.dispersion : 0, Promise.resolve();
  }
}
class Xm {
  constructor(e) {
    this.parser = e, this.name = Je.KHR_MATERIALS_IRIDESCENCE;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : In;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, i = n.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = [], a = i.extensions[this.name];
    return a.iridescenceFactor !== void 0 && (t.iridescence = a.iridescenceFactor), a.iridescenceTexture !== void 0 && r.push(n.assignTexture(t, "iridescenceMap", a.iridescenceTexture)), a.iridescenceIor !== void 0 && (t.iridescenceIOR = a.iridescenceIor), t.iridescenceThicknessRange === void 0 && (t.iridescenceThicknessRange = [100, 400]), a.iridescenceThicknessMinimum !== void 0 && (t.iridescenceThicknessRange[0] = a.iridescenceThicknessMinimum), a.iridescenceThicknessMaximum !== void 0 && (t.iridescenceThicknessRange[1] = a.iridescenceThicknessMaximum), a.iridescenceThicknessTexture !== void 0 && r.push(n.assignTexture(t, "iridescenceThicknessMap", a.iridescenceThicknessTexture)), Promise.all(r);
  }
}
class qm {
  constructor(e) {
    this.parser = e, this.name = Je.KHR_MATERIALS_SHEEN;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : In;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, i = n.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = [];
    t.sheenColor = new De(0, 0, 0), t.sheenRoughness = 0, t.sheen = 1;
    const a = i.extensions[this.name];
    if (a.sheenColorFactor !== void 0) {
      const o = a.sheenColorFactor;
      t.sheenColor.setRGB(o[0], o[1], o[2], Ht);
    }
    return a.sheenRoughnessFactor !== void 0 && (t.sheenRoughness = a.sheenRoughnessFactor), a.sheenColorTexture !== void 0 && r.push(n.assignTexture(t, "sheenColorMap", a.sheenColorTexture, wt)), a.sheenRoughnessTexture !== void 0 && r.push(n.assignTexture(t, "sheenRoughnessMap", a.sheenRoughnessTexture)), Promise.all(r);
  }
}
class jm {
  constructor(e) {
    this.parser = e, this.name = Je.KHR_MATERIALS_TRANSMISSION;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : In;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, i = n.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = [], a = i.extensions[this.name];
    return a.transmissionFactor !== void 0 && (t.transmission = a.transmissionFactor), a.transmissionTexture !== void 0 && r.push(n.assignTexture(t, "transmissionMap", a.transmissionTexture)), Promise.all(r);
  }
}
class Ym {
  constructor(e) {
    this.parser = e, this.name = Je.KHR_MATERIALS_VOLUME;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : In;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, i = n.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = [], a = i.extensions[this.name];
    t.thickness = a.thicknessFactor !== void 0 ? a.thicknessFactor : 0, a.thicknessTexture !== void 0 && r.push(n.assignTexture(t, "thicknessMap", a.thicknessTexture)), t.attenuationDistance = a.attenuationDistance || 1 / 0;
    const o = a.attenuationColor || [1, 1, 1];
    return t.attenuationColor = new De().setRGB(o[0], o[1], o[2], Ht), Promise.all(r);
  }
}
class Km {
  constructor(e) {
    this.parser = e, this.name = Je.KHR_MATERIALS_IOR;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : In;
  }
  extendMaterialParams(e, t) {
    const i = this.parser.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = i.extensions[this.name];
    return t.ior = r.ior !== void 0 ? r.ior : 1.5, Promise.resolve();
  }
}
class Zm {
  constructor(e) {
    this.parser = e, this.name = Je.KHR_MATERIALS_SPECULAR;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : In;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, i = n.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = [], a = i.extensions[this.name];
    t.specularIntensity = a.specularFactor !== void 0 ? a.specularFactor : 1, a.specularTexture !== void 0 && r.push(n.assignTexture(t, "specularIntensityMap", a.specularTexture));
    const o = a.specularColorFactor || [1, 1, 1];
    return t.specularColor = new De().setRGB(o[0], o[1], o[2], Ht), a.specularColorTexture !== void 0 && r.push(n.assignTexture(t, "specularColorMap", a.specularColorTexture, wt)), Promise.all(r);
  }
}
class $m {
  constructor(e) {
    this.parser = e, this.name = Je.EXT_MATERIALS_BUMP;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : In;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, i = n.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = [], a = i.extensions[this.name];
    return t.bumpScale = a.bumpFactor !== void 0 ? a.bumpFactor : 1, a.bumpTexture !== void 0 && r.push(n.assignTexture(t, "bumpMap", a.bumpTexture)), Promise.all(r);
  }
}
class Jm {
  constructor(e) {
    this.parser = e, this.name = Je.KHR_MATERIALS_ANISOTROPY;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : In;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, i = n.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = [], a = i.extensions[this.name];
    return a.anisotropyStrength !== void 0 && (t.anisotropy = a.anisotropyStrength), a.anisotropyRotation !== void 0 && (t.anisotropyRotation = a.anisotropyRotation), a.anisotropyTexture !== void 0 && r.push(n.assignTexture(t, "anisotropyMap", a.anisotropyTexture)), Promise.all(r);
  }
}
class Qm {
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
class eg {
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
class tg {
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
class ng {
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
        const c = i.byteOffset || 0, l = i.byteLength || 0, u = i.count, h = i.byteStride, d = new Uint8Array(o, c, l);
        return a.decodeGltfBufferAsync ? a.decodeGltfBufferAsync(u, h, d, i.mode, i.filter).then(function(f) {
          return f.buffer;
        }) : a.ready.then(function() {
          const f = new ArrayBuffer(u * h);
          return a.decodeGltfBuffer(new Uint8Array(f), u, h, d, i.mode, i.filter), f;
        });
      });
    } else
      return null;
  }
}
class ig {
  constructor(e) {
    this.name = Je.EXT_MESH_GPU_INSTANCING, this.parser = e;
  }
  createNodeMesh(e) {
    const t = this.parser.json, n = t.nodes[e];
    if (!n.extensions || !n.extensions[this.name] || n.mesh === void 0)
      return null;
    const i = t.meshes[n.mesh];
    for (const l of i.primitives)
      if (l.mode !== un.TRIANGLES && l.mode !== un.TRIANGLE_STRIP && l.mode !== un.TRIANGLE_FAN && l.mode !== void 0)
        return null;
    const a = n.extensions[this.name].attributes, o = [], c = {};
    for (const l in a)
      o.push(this.parser.getDependency("accessor", a[l]).then((u) => (c[l] = u, c[l])));
    return o.length < 1 ? null : (o.push(this.parser.createNodeMesh(e)), Promise.all(o).then((l) => {
      const u = l.pop(), h = u.isGroup ? u.children : [u], d = l[0].count, f = [];
      for (const g of h) {
        const x = new je(), p = new N(), m = new yn(), T = new N(1, 1, 1), S = new Kp(g.geometry, g.material, d);
        for (let E = 0; E < d; E++)
          c.TRANSLATION && p.fromBufferAttribute(c.TRANSLATION, E), c.ROTATION && m.fromBufferAttribute(c.ROTATION, E), c.SCALE && T.fromBufferAttribute(c.SCALE, E), S.setMatrixAt(E, x.compose(p, m, T));
        for (const E in c)
          if (E === "_COLOR_0") {
            const F = c[E];
            S.instanceColor = new ga(F.array, F.itemSize, F.normalized);
          } else E !== "TRANSLATION" && E !== "ROTATION" && E !== "SCALE" && g.geometry.setAttribute(E, c[E]);
        At.prototype.copy.call(S, g), this.parser.assignFinalMaterial(S), f.push(S);
      }
      return u.isGroup ? (u.clear(), u.add(...f), u) : f[0];
    }));
  }
}
const kc = "glTF", gs = 12, hc = { JSON: 1313821514, BIN: 5130562 };
class sg {
  constructor(e) {
    this.name = Je.KHR_BINARY_GLTF, this.content = null, this.body = null;
    const t = new DataView(e, 0, gs), n = new TextDecoder();
    if (this.header = {
      magic: n.decode(new Uint8Array(e.slice(0, 4))),
      version: t.getUint32(4, !0),
      length: t.getUint32(8, !0)
    }, this.header.magic !== kc)
      throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");
    if (this.header.version < 2)
      throw new Error("THREE.GLTFLoader: Legacy binary file detected.");
    const i = this.header.length - gs, r = new DataView(e, gs);
    let a = 0;
    for (; a < i; ) {
      const o = r.getUint32(a, !0);
      a += 4;
      const c = r.getUint32(a, !0);
      if (a += 4, c === hc.JSON) {
        const l = new Uint8Array(e, gs + a, o);
        this.content = n.decode(l);
      } else if (c === hc.BIN) {
        const l = gs + a;
        this.body = e.slice(l, l + o);
      }
      a += o;
    }
    if (this.content === null)
      throw new Error("THREE.GLTFLoader: JSON content not found.");
  }
}
class rg {
  constructor(e, t) {
    if (!t)
      throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");
    this.name = Je.KHR_DRACO_MESH_COMPRESSION, this.json = e, this.dracoLoader = t, this.dracoLoader.preload();
  }
  decodePrimitive(e, t) {
    const n = this.json, i = this.dracoLoader, r = e.extensions[this.name].bufferView, a = e.extensions[this.name].attributes, o = {}, c = {}, l = {};
    for (const u in a) {
      const h = Ma[u] || u.toLowerCase();
      o[h] = a[u];
    }
    for (const u in e.attributes) {
      const h = Ma[u] || u.toLowerCase();
      if (a[u] !== void 0) {
        const d = n.accessors[e.attributes[u]], f = Ki[d.componentType];
        l[h] = f.name, c[h] = d.normalized === !0;
      }
    }
    return t.getDependency("bufferView", r).then(function(u) {
      return new Promise(function(h, d) {
        i.decodeDracoFile(u, function(f) {
          for (const g in f.attributes) {
            const x = f.attributes[g], p = c[g];
            p !== void 0 && (x.normalized = p);
          }
          h(f);
        }, o, l, Ht, d);
      });
    });
  }
}
class ag {
  constructor() {
    this.name = Je.KHR_TEXTURE_TRANSFORM;
  }
  extendTexture(e, t) {
    return (t.texCoord === void 0 || t.texCoord === e.channel) && t.offset === void 0 && t.rotation === void 0 && t.scale === void 0 || (e = e.clone(), t.texCoord !== void 0 && (e.channel = t.texCoord), t.offset !== void 0 && e.offset.fromArray(t.offset), t.rotation !== void 0 && (e.rotation = t.rotation), t.scale !== void 0 && e.repeat.fromArray(t.scale), e.needsUpdate = !0), e;
  }
}
class og {
  constructor() {
    this.name = Je.KHR_MESH_QUANTIZATION;
  }
}
class zc extends Es {
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
    const r = this.resultBuffer, a = this.sampleValues, o = this.valueSize, c = o * 2, l = o * 3, u = i - t, h = (n - t) / u, d = h * h, f = d * h, g = e * l, x = g - l, p = -2 * f + 3 * d, m = f - d, T = 1 - p, S = m - d + h;
    for (let E = 0; E !== o; E++) {
      const F = a[x + E + o], P = a[x + E + c] * u, L = a[g + E + o], z = a[g + E] * u;
      r[E] = T * F + S * P + p * L + m * z;
    }
    return r;
  }
}
const cg = new yn();
class lg extends zc {
  interpolate_(e, t, n, i) {
    const r = super.interpolate_(e, t, n, i);
    return cg.fromArray(r).normalize().toArray(r), r;
  }
}
const un = {
  POINTS: 0,
  LINES: 1,
  LINE_LOOP: 2,
  LINE_STRIP: 3,
  TRIANGLES: 4,
  TRIANGLE_STRIP: 5,
  TRIANGLE_FAN: 6
}, Ki = {
  5120: Int8Array,
  5121: Uint8Array,
  5122: Int16Array,
  5123: Uint16Array,
  5125: Uint32Array,
  5126: Float32Array
}, uc = {
  9728: 1003,
  9729: 1006,
  9984: 1004,
  9985: 1007,
  9986: 1005,
  9987: 1008
}, dc = {
  33071: 1001,
  33648: 1002,
  10497: 1e3
}, ha = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT2: 4,
  MAT3: 9,
  MAT4: 16
}, Ma = {
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
}, Kn = {
  scale: "scale",
  translation: "position",
  rotation: "quaternion",
  weights: "morphTargetInfluences"
}, hg = {
  CUBICSPLINE: void 0,
  // We use a custom interpolant (GLTFCubicSplineInterpolation) for CUBICSPLINE tracks. Each
  // keyframe track will be initialized with a default interpolation type, then modified.
  LINEAR: 2301,
  STEP: 2300
}, ua = {
  OPAQUE: "OPAQUE",
  MASK: "MASK",
  BLEND: "BLEND"
};
function ug(s) {
  return s.DefaultMaterial === void 0 && (s.DefaultMaterial = new Lt({
    color: 16777215,
    emissive: 0,
    metalness: 1,
    roughness: 1,
    transparent: !1,
    depthTest: !0,
    side: 0
  })), s.DefaultMaterial;
}
function ui(s, e, t) {
  for (const n in t.extensions)
    s[n] === void 0 && (e.userData.gltfExtensions = e.userData.gltfExtensions || {}, e.userData.gltfExtensions[n] = t.extensions[n]);
}
function kn(s, e) {
  e.extras !== void 0 && (typeof e.extras == "object" ? Object.assign(s.userData, e.extras) : console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, " + e.extras));
}
function dg(s, e, t) {
  let n = !1, i = !1, r = !1;
  for (let l = 0, u = e.length; l < u; l++) {
    const h = e[l];
    if (h.POSITION !== void 0 && (n = !0), h.NORMAL !== void 0 && (i = !0), h.COLOR_0 !== void 0 && (r = !0), n && i && r) break;
  }
  if (!n && !i && !r) return Promise.resolve(s);
  const a = [], o = [], c = [];
  for (let l = 0, u = e.length; l < u; l++) {
    const h = e[l];
    if (n) {
      const d = h.POSITION !== void 0 ? t.getDependency("accessor", h.POSITION) : s.attributes.position;
      a.push(d);
    }
    if (i) {
      const d = h.NORMAL !== void 0 ? t.getDependency("accessor", h.NORMAL) : s.attributes.normal;
      o.push(d);
    }
    if (r) {
      const d = h.COLOR_0 !== void 0 ? t.getDependency("accessor", h.COLOR_0) : s.attributes.color;
      c.push(d);
    }
  }
  return Promise.all([
    Promise.all(a),
    Promise.all(o),
    Promise.all(c)
  ]).then(function(l) {
    const u = l[0], h = l[1], d = l[2];
    return n && (s.morphAttributes.position = u), i && (s.morphAttributes.normal = h), r && (s.morphAttributes.color = d), s.morphTargetsRelative = !0, s;
  });
}
function fg(s, e) {
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
function pg(s) {
  let e;
  const t = s.extensions && s.extensions[Je.KHR_DRACO_MESH_COMPRESSION];
  if (t ? e = "draco:" + t.bufferView + ":" + t.indices + ":" + da(t.attributes) : e = s.indices + ":" + da(s.attributes) + ":" + s.mode, s.targets !== void 0)
    for (let n = 0, i = s.targets.length; n < i; n++)
      e += ":" + da(s.targets[n]);
  return e;
}
function da(s) {
  let e = "";
  const t = Object.keys(s).sort();
  for (let n = 0, i = t.length; n < i; n++)
    e += t[n] + ":" + s[t[n]] + ";";
  return e;
}
function ya(s) {
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
function mg(s) {
  return s.search(/\.jpe?g($|\?)/i) > 0 || s.search(/^data\:image\/jpeg/) === 0 ? "image/jpeg" : s.search(/\.webp($|\?)/i) > 0 || s.search(/^data\:image\/webp/) === 0 ? "image/webp" : "image/png";
}
const gg = new je();
class _g {
  constructor(e = {}, t = {}) {
    this.json = e, this.extensions = {}, this.plugins = {}, this.options = t, this.cache = new km(), this.associations = /* @__PURE__ */ new Map(), this.primitiveCache = {}, this.nodeCache = {}, this.meshCache = { refs: {}, uses: {} }, this.cameraCache = { refs: {}, uses: {} }, this.lightCache = { refs: {}, uses: {} }, this.sourceCache = {}, this.textureCache = {}, this.nodeNamesUsed = {};
    let n = !1, i = -1, r = !1, a = -1;
    if (typeof navigator < "u") {
      const o = navigator.userAgent;
      n = /^((?!chrome|android).)*safari/i.test(o) === !0;
      const c = o.match(/Version\/(\d+)/);
      i = n && c ? parseInt(c[1], 10) : -1, r = o.indexOf("Firefox") > -1, a = r ? o.match(/Firefox\/([0-9]+)\./)[1] : -1;
    }
    typeof createImageBitmap > "u" || n && i < 17 || r && a < 98 ? this.textureLoader = new Bc(this.options.manager) : this.textureLoader = new pm(this.options.manager), this.textureLoader.setCrossOrigin(this.options.crossOrigin), this.textureLoader.setRequestHeader(this.options.requestHeader), this.fileLoader = new Mr(this.options.manager), this.fileLoader.setResponseType("arraybuffer"), this.options.crossOrigin === "use-credentials" && this.fileLoader.setWithCredentials(!0);
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
      return ui(r, o, i), kn(o, i), Promise.all(n._invokeAll(function(c) {
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
      for (const [l, u] of a.children.entries())
        r(u, o.children[l]);
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
      n.load(Yi.resolveURL(t.uri, i.path), r, void 0, function() {
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
      const a = ha[i.type], o = Ki[i.componentType], c = i.normalized === !0, l = new o(i.count * a);
      return Promise.resolve(new Jt(l, a, c));
    }
    const r = [];
    return i.bufferView !== void 0 ? r.push(this.getDependency("bufferView", i.bufferView)) : r.push(null), i.sparse !== void 0 && (r.push(this.getDependency("bufferView", i.sparse.indices.bufferView)), r.push(this.getDependency("bufferView", i.sparse.values.bufferView))), Promise.all(r).then(function(a) {
      const o = a[0], c = ha[i.type], l = Ki[i.componentType], u = l.BYTES_PER_ELEMENT, h = u * c, d = i.byteOffset || 0, f = i.bufferView !== void 0 ? n.bufferViews[i.bufferView].byteStride : void 0, g = i.normalized === !0;
      let x, p;
      if (f && f !== h) {
        const m = Math.floor(d / f), T = "InterleavedBuffer:" + i.bufferView + ":" + i.componentType + ":" + m + ":" + i.count;
        let S = t.cache.get(T);
        S || (x = new l(o, m * f, i.count * f / u), S = new Wp(x, f / u), t.cache.add(T, S)), p = new Ra(S, c, d % f / u, g);
      } else
        o === null ? x = new l(i.count * c) : x = new l(o, d, i.count * c), p = new Jt(x, c, g);
      if (i.sparse !== void 0) {
        const m = ha.SCALAR, T = Ki[i.sparse.indices.componentType], S = i.sparse.indices.byteOffset || 0, E = i.sparse.values.byteOffset || 0, F = new T(a[1], S, i.sparse.count * m), P = new l(a[2], E, i.sparse.count * c);
        o !== null && (p = new Jt(p.array.slice(), p.itemSize, p.normalized)), p.normalized = !1;
        for (let L = 0, z = F.length; L < z; L++) {
          const ee = F[L];
          if (p.setX(ee, P[L * c]), c >= 2 && p.setY(ee, P[L * c + 1]), c >= 3 && p.setZ(ee, P[L * c + 2]), c >= 4 && p.setW(ee, P[L * c + 3]), c >= 5) throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.");
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
    const l = this.loadImageSource(t, n).then(function(u) {
      u.flipY = !1, u.name = a.name || o.name || "", u.name === "" && typeof o.uri == "string" && o.uri.startsWith("data:image/") === !1 && (u.name = o.uri);
      const d = (r.samplers || {})[a.sampler] || {};
      return u.magFilter = uc[d.magFilter] || 1006, u.minFilter = uc[d.minFilter] || 1008, u.wrapS = dc[d.wrapS] || 1e3, u.wrapT = dc[d.wrapT] || 1e3, i.associations.set(u, { textures: e }), u;
    }).catch(function() {
      return null;
    });
    return this.textureCache[c] = l, l;
  }
  loadImageSource(e, t) {
    const n = this, i = this.json, r = this.options;
    if (this.sourceCache[e] !== void 0)
      return this.sourceCache[e].then((h) => h.clone());
    const a = i.images[e], o = self.URL || self.webkitURL;
    let c = a.uri || "", l = !1;
    if (a.bufferView !== void 0)
      c = n.getDependency("bufferView", a.bufferView).then(function(h) {
        l = !0;
        const d = new Blob([h], { type: a.mimeType });
        return c = o.createObjectURL(d), c;
      });
    else if (a.uri === void 0)
      throw new Error("THREE.GLTFLoader: Image " + e + " is missing URI and bufferView");
    const u = Promise.resolve(c).then(function(h) {
      return new Promise(function(d, f) {
        let g = d;
        t.isImageBitmapLoader === !0 && (g = function(x) {
          const p = new Ft(x);
          p.needsUpdate = !0, d(p);
        }), t.load(Yi.resolveURL(h, r.path), g, void 0, f);
      });
    }).then(function(h) {
      return l === !0 && o.revokeObjectURL(c), kn(h, a), h.userData.mimeType = a.mimeType || mg(a.uri), h;
    }).catch(function(h) {
      throw console.error("THREE.GLTFLoader: Couldn't load texture", c), h;
    });
    return this.sourceCache[e] = u, u;
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
      c || (c = new Wi(), rn.prototype.copy.call(c, n), c.color.copy(n.color), c.map = n.map, c.sizeAttenuation = !1, this.cache.add(o, c)), n = c;
    } else if (e.isLine) {
      const o = "LineBasicMaterial:" + n.uuid;
      let c = this.cache.get(o);
      c || (c = new xn(), rn.prototype.copy.call(c, n), c.color.copy(n.color), c.map = n.map, this.cache.add(o, c)), n = c;
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
    return Lt;
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
      const h = i[Je.KHR_MATERIALS_UNLIT];
      a = h.getMaterialType(), l.push(h.extendParams(o, r, t));
    } else {
      const h = r.pbrMetallicRoughness || {};
      if (o.color = new De(1, 1, 1), o.opacity = 1, Array.isArray(h.baseColorFactor)) {
        const d = h.baseColorFactor;
        o.color.setRGB(d[0], d[1], d[2], Ht), o.opacity = d[3];
      }
      h.baseColorTexture !== void 0 && l.push(t.assignTexture(o, "map", h.baseColorTexture, wt)), o.metalness = h.metallicFactor !== void 0 ? h.metallicFactor : 1, o.roughness = h.roughnessFactor !== void 0 ? h.roughnessFactor : 1, h.metallicRoughnessTexture !== void 0 && (l.push(t.assignTexture(o, "metalnessMap", h.metallicRoughnessTexture)), l.push(t.assignTexture(o, "roughnessMap", h.metallicRoughnessTexture))), a = this._invokeOne(function(d) {
        return d.getMaterialType && d.getMaterialType(e);
      }), l.push(Promise.all(this._invokeAll(function(d) {
        return d.extendMaterialParams && d.extendMaterialParams(e, o);
      })));
    }
    r.doubleSided === !0 && (o.side = 2);
    const u = r.alphaMode || ua.OPAQUE;
    if (u === ua.BLEND ? (o.transparent = !0, o.depthWrite = !1) : (o.transparent = !1, u === ua.MASK && (o.alphaTest = r.alphaCutoff !== void 0 ? r.alphaCutoff : 0.5)), r.normalTexture !== void 0 && a !== St && (l.push(t.assignTexture(o, "normalMap", r.normalTexture)), o.normalScale = new qe(1, 1), r.normalTexture.scale !== void 0)) {
      const h = r.normalTexture.scale;
      o.normalScale.set(h, h);
    }
    if (r.occlusionTexture !== void 0 && a !== St && (l.push(t.assignTexture(o, "aoMap", r.occlusionTexture)), r.occlusionTexture.strength !== void 0 && (o.aoMapIntensity = r.occlusionTexture.strength)), r.emissiveFactor !== void 0 && a !== St) {
      const h = r.emissiveFactor;
      o.emissive = new De().setRGB(h[0], h[1], h[2], Ht);
    }
    return r.emissiveTexture !== void 0 && a !== St && l.push(t.assignTexture(o, "emissiveMap", r.emissiveTexture, wt)), Promise.all(l).then(function() {
      const h = new a(o);
      return r.name && (h.name = r.name), kn(h, r), t.associations.set(h, { materials: e }), r.extensions && ui(i, h, r), h;
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
        return fc(c, o, t);
      });
    }
    const a = [];
    for (let o = 0, c = e.length; o < c; o++) {
      const l = e[o], u = pg(l), h = i[u];
      if (h)
        a.push(h.promise);
      else {
        let d;
        l.extensions && l.extensions[Je.KHR_DRACO_MESH_COMPRESSION] ? d = r(l) : d = fc(new Rt(), l, t), i[u] = { primitive: l, promise: d }, a.push(d);
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
      const u = a[c].material === void 0 ? ug(this.cache) : this.getDependency("material", a[c].material);
      o.push(u);
    }
    return o.push(t.loadGeometries(a)), Promise.all(o).then(function(c) {
      const l = c.slice(0, c.length - 1), u = c[c.length - 1], h = [];
      for (let f = 0, g = u.length; f < g; f++) {
        const x = u[f], p = a[f];
        let m;
        const T = l[f];
        if (p.mode === un.TRIANGLES || p.mode === un.TRIANGLE_STRIP || p.mode === un.TRIANGLE_FAN || p.mode === void 0)
          m = r.isSkinnedMesh === !0 ? new qp(x, T) : new Le(x, T), m.isSkinnedMesh === !0 && m.normalizeSkinWeights(), p.mode === un.TRIANGLE_STRIP ? m.geometry = lc(m.geometry, 1) : p.mode === un.TRIANGLE_FAN && (m.geometry = lc(m.geometry, 2));
        else if (p.mode === un.LINES)
          m = new mi(x, T);
        else if (p.mode === un.LINE_STRIP)
          m = new ys(x, T);
        else if (p.mode === un.LINE_LOOP)
          m = new Zp(x, T);
        else if (p.mode === un.POINTS)
          m = new ur(x, T);
        else
          throw new Error("THREE.GLTFLoader: Primitive mode unsupported: " + p.mode);
        Object.keys(m.geometry.morphAttributes).length > 0 && fg(m, r), m.name = t.createUniqueName(r.name || "mesh_" + e), kn(m, r), p.extensions && ui(i, m, p), t.assignFinalMaterial(m), h.push(m);
      }
      for (let f = 0, g = h.length; f < g; f++)
        t.associations.set(h[f], {
          meshes: e,
          primitives: f
        });
      if (h.length === 1)
        return r.extensions && ui(i, h[0], r), h[0];
      const d = new It();
      r.extensions && ui(i, d, r), t.associations.set(d, { meshes: e });
      for (let f = 0, g = h.length; f < g; f++)
        d.add(h[f]);
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
    return n.type === "perspective" ? t = new en(wl.radToDeg(i.yfov), i.aspectRatio || 1, i.znear || 1, i.zfar || 2e6) : n.type === "orthographic" && (t = new xr(-i.xmag, i.xmag, i.ymag, -i.ymag, i.znear, i.zfar)), n.name && (t.name = this.createUniqueName(n.name)), kn(t, n), Promise.resolve(t);
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
      for (let l = 0, u = a.length; l < u; l++) {
        const h = a[l];
        if (h) {
          o.push(h);
          const d = new je();
          r !== null && d.fromArray(r.array, l * 16), c.push(d);
        } else
          console.warn('THREE.GLTFLoader: Joint "%s" could not be found.', t.joints[l]);
      }
      return new Ia(o, c);
    });
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#animations
   * @param {number} animationIndex
   * @return {Promise<AnimationClip>}
   */
  loadAnimation(e) {
    const t = this.json, n = this, i = t.animations[e], r = i.name ? i.name : "animation_" + e, a = [], o = [], c = [], l = [], u = [];
    for (let h = 0, d = i.channels.length; h < d; h++) {
      const f = i.channels[h], g = i.samplers[f.sampler], x = f.target, p = x.node, m = i.parameters !== void 0 ? i.parameters[g.input] : g.input, T = i.parameters !== void 0 ? i.parameters[g.output] : g.output;
      x.node !== void 0 && (a.push(this.getDependency("node", p)), o.push(this.getDependency("accessor", m)), c.push(this.getDependency("accessor", T)), l.push(g), u.push(x));
    }
    return Promise.all([
      Promise.all(a),
      Promise.all(o),
      Promise.all(c),
      Promise.all(l),
      Promise.all(u)
    ]).then(function(h) {
      const d = h[0], f = h[1], g = h[2], x = h[3], p = h[4], m = [];
      for (let T = 0, S = d.length; T < S; T++) {
        const E = d[T], F = f[T], P = g[T], L = x[T], z = p[T];
        if (E === void 0) continue;
        E.updateMatrix && E.updateMatrix();
        const ee = n._createAnimationTracks(E, F, P, L, z);
        if (ee)
          for (let v = 0; v < ee.length; v++)
            m.push(ee[v]);
      }
      return new xa(r, void 0, m);
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
    for (let l = 0, u = o.length; l < u; l++)
      a.push(n.getDependency("node", o[l]));
    const c = i.skin === void 0 ? Promise.resolve(null) : n.getDependency("skin", i.skin);
    return Promise.all([
      r,
      Promise.all(a),
      c
    ]).then(function(l) {
      const u = l[0], h = l[1], d = l[2];
      d !== null && u.traverse(function(f) {
        f.isSkinnedMesh && f.bind(d, gg);
      });
      for (let f = 0, g = h.length; f < g; f++)
        u.add(h[f]);
      return u;
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
      let u;
      if (r.isBone === !0 ? u = new Ic() : l.length > 1 ? u = new It() : l.length === 1 ? u = l[0] : u = new At(), u !== l[0])
        for (let h = 0, d = l.length; h < d; h++)
          u.add(l[h]);
      if (r.name && (u.userData.name = r.name, u.name = a), kn(u, r), r.extensions && ui(n, u, r), r.matrix !== void 0) {
        const h = new je();
        h.fromArray(r.matrix), u.applyMatrix4(h);
      } else
        r.translation !== void 0 && u.position.fromArray(r.translation), r.rotation !== void 0 && u.quaternion.fromArray(r.rotation), r.scale !== void 0 && u.scale.fromArray(r.scale);
      return i.associations.has(u) || i.associations.set(u, {}), i.associations.get(u).nodes = e, u;
    }), this.nodeCache[e];
  }
  /**
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#scenes
   * @param {number} sceneIndex
   * @return {Promise<Group>}
   */
  loadScene(e) {
    const t = this.extensions, n = this.json.scenes[e], i = this, r = new It();
    n.name && (r.name = i.createUniqueName(n.name)), kn(r, n), n.extensions && ui(t, r, n);
    const a = n.nodes || [], o = [];
    for (let c = 0, l = a.length; c < l; c++)
      o.push(i.getDependency("node", a[c]));
    return Promise.all(o).then(function(c) {
      for (let u = 0, h = c.length; u < h; u++)
        r.add(c[u]);
      const l = (u) => {
        const h = /* @__PURE__ */ new Map();
        for (const [d, f] of i.associations)
          (d instanceof rn || d instanceof Ft) && h.set(d, f);
        return u.traverse((d) => {
          const f = i.associations.get(d);
          f != null && h.set(d, f);
        }), h;
      };
      return i.associations = l(r), r;
    });
  }
  _createAnimationTracks(e, t, n, i, r) {
    const a = [], o = e.name ? e.name : e.uuid, c = [];
    Kn[r.path] === Kn.weights ? e.traverse(function(d) {
      d.morphTargetInfluences && c.push(d.name ? d.name : d.uuid);
    }) : c.push(o);
    let l;
    switch (Kn[r.path]) {
      case Kn.weights:
        l = Ji;
        break;
      case Kn.rotation:
        l = Qi;
        break;
      case Kn.position:
      case Kn.scale:
        l = es;
        break;
      default:
        switch (n.itemSize) {
          case 1:
            l = Ji;
            break;
          case 2:
          case 3:
          default:
            l = es;
            break;
        }
        break;
    }
    const u = i.interpolation !== void 0 ? hg[i.interpolation] : 2301, h = this._getArrayFromAccessor(n);
    for (let d = 0, f = c.length; d < f; d++) {
      const g = new l(
        c[d] + "." + Kn[r.path],
        t.array,
        h,
        u
      );
      i.interpolation === "CUBICSPLINE" && this._createCubicSplineTrackInterpolant(g), a.push(g);
    }
    return a;
  }
  _getArrayFromAccessor(e) {
    let t = e.array;
    if (e.normalized) {
      const n = ya(t.constructor), i = new Float32Array(t.length);
      for (let r = 0, a = t.length; r < a; r++)
        i[r] = t[r] * n;
      t = i;
    }
    return t;
  }
  _createCubicSplineTrackInterpolant(e) {
    e.createInterpolant = function(n) {
      const i = this instanceof Qi ? lg : zc;
      return new i(this.times, this.values, this.getValueSize() / 3, n);
    }, e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline = !0;
  }
}
function xg(s, e, t) {
  const n = e.attributes, i = new En();
  if (n.POSITION !== void 0) {
    const o = t.json.accessors[n.POSITION], c = o.min, l = o.max;
    if (c !== void 0 && l !== void 0) {
      if (i.set(
        new N(c[0], c[1], c[2]),
        new N(l[0], l[1], l[2])
      ), o.normalized) {
        const u = ya(Ki[o.componentType]);
        i.min.multiplyScalar(u), i.max.multiplyScalar(u);
      }
    } else {
      console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");
      return;
    }
  } else
    return;
  const r = e.targets;
  if (r !== void 0) {
    const o = new N(), c = new N();
    for (let l = 0, u = r.length; l < u; l++) {
      const h = r[l];
      if (h.POSITION !== void 0) {
        const d = t.json.accessors[h.POSITION], f = d.min, g = d.max;
        if (f !== void 0 && g !== void 0) {
          if (c.setX(Math.max(Math.abs(f[0]), Math.abs(g[0]))), c.setY(Math.max(Math.abs(f[1]), Math.abs(g[1]))), c.setZ(Math.max(Math.abs(f[2]), Math.abs(g[2]))), d.normalized) {
            const x = ya(Ki[d.componentType]);
            c.multiplyScalar(x);
          }
          o.max(c);
        } else
          console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");
      }
    }
    i.expandByVector(o);
  }
  s.boundingBox = i;
  const a = new Cn();
  i.getCenter(a.center), a.radius = i.min.distanceTo(i.max) / 2, s.boundingSphere = a;
}
function fc(s, e, t) {
  const n = e.attributes, i = [];
  function r(a, o) {
    return t.getDependency("accessor", a).then(function(c) {
      s.setAttribute(o, c);
    });
  }
  for (const a in n) {
    const o = Ma[a] || a.toLowerCase();
    o in s.attributes || i.push(r(n[a], o));
  }
  if (e.indices !== void 0 && !s.index) {
    const a = t.getDependency("accessor", e.indices).then(function(o) {
      s.setIndex(o);
    });
    i.push(a);
  }
  return at.workingColorSpace !== Ht && "COLOR_0" in n && console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${at.workingColorSpace}" not supported.`), kn(s, e), xg(s, e, t), Promise.all(i).then(function() {
    return e.targets !== void 0 ? dg(s, e.targets, t) : s;
  });
}
function vg(s) {
  const e = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new Map(), n = s.clone();
  return Gc(s, n, function(i, r) {
    e.set(r, i), t.set(i, r);
  }), n.traverse(function(i) {
    if (!i.isSkinnedMesh) return;
    const r = i, a = e.get(i), o = a.skeleton.bones;
    r.skeleton = a.skeleton.clone(), r.bindMatrix.copy(a.bindMatrix), r.skeleton.bones = o.map(function(c) {
      return t.get(c);
    }), r.bind(r.skeleton, r.bindMatrix);
  }), n;
}
function Gc(s, e, t) {
  t(s, e);
  for (let n = 0; n < s.children.length; n++)
    Gc(s.children[n], e.children[n], t);
}
const fa = /* @__PURE__ */ new Map();
function Hc(s, e) {
  return fa.has(s) || fa.set(s, e()), fa.get(s);
}
function Mg(s) {
  const e = new En().setFromObject(s), t = e.getCenter(new N());
  s.position.set(-t.x, -e.min.y, -t.z);
  const n = new It();
  return n.add(s), n.userData.size = e.getSize(new N()), n;
}
function Vc(s) {
  return s.traverse((e) => {
    e.isMesh && (e.castShadow = !0, e.receiveShadow = !0);
  }), s;
}
function cr(s, e) {
  return Hc("f:" + e, async () => {
    const t = s + "models/furniture/", n = await new Fm().setPath(t).loadAsync(e + ".mtl");
    n.preload(), Object.values(n.materials).forEach((a) => {
      a.shininess = 8, a.specular = new De(2236962);
    });
    const i = await new Nm().setMaterials(n).setPath(t).loadAsync(e + ".obj");
    i.rotation.y = Math.PI;
    const r = new It();
    return r.add(i), Mg(Vc(r));
  }).then((t) => {
    const n = t.clone();
    return n.userData.size = t.userData.size, n;
  });
}
function yg(s) {
  return Hc("g:" + s, () => new Om().loadAsync(s));
}
async function pa(s, e) {
  const t = await yg(s + "models/characters/" + e + ".glb");
  return { scene: Vc(vg(t.scene)), animations: t.animations };
}
const Sg = 4.6;
class Na {
  static async create(e, t, n = {}) {
    const { scene: i, animations: r } = await pa(e, t), a = new Na(i, r, n);
    if (n.wheelchair) {
      const o = await pa(e, "wheelchair");
      o.scene.scale.copy(i.scale), a.root.add(o.scene), a.wheel = !0, a.play("wheelchair-sit");
    }
    if (n.cane) {
      const o = await pa(e, "aid-cane"), c = i.getObjectByName("arm-right");
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
    this.root = new It();
    const r = new En().setFromObject(e), a = Sg / Math.max(0.01, r.max.y - r.min.y);
    if (e.scale.setScalar(a), e.position.y = -r.min.y * a, this.root.add(e), this.mixer = new Rm(e), this.actions = {}, t.forEach((o) => {
      this.actions[o.name] = this.mixer.clipAction(o);
    }), this.current = null, this.path = null, this.onArrive = null, this.yOffset = 0, n) {
      const o = e.getObjectByName("head"), c = new Lt({ color: 16777215, roughness: 0.7 }), l = new It(), u = new Le(new ji(0.19, 0.2, 0.07, 24), c), h = new Le(new gi(0.21, 24, 16), c);
      h.scale.y = 0.72, h.position.y = 0.1, l.add(u, h), l.traverse((d) => {
        d.isMesh && (d.castShadow = !0);
      }), l.position.set(0, 0.31, 0.01), (o || e).add(l);
    }
    if (i) {
      const o = e.getObjectByName("torso"), c = new Le(new ei(0.2, 0.15), new Lt({ color: i, roughness: 0.9, side: 2 }));
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
const We = 5, Eg = 0.1, pc = 3.4, _s = 3, Tg = 32;
function Ag(s) {
  const e = new De(s.color || "#94a3b8"), t = e.clone().multiplyScalar(0.5);
  return { color: e, opacity: s.opacity ?? 0.24, ink: `rgba(${Math.round(t.r * 255)},${Math.round(t.g * 255)},${Math.round(t.b * 255)},0.85)` };
}
function bg(s, e) {
  const t = document.createElement("canvas");
  t.width = 512, t.height = 128;
  const n = t.getContext("2d");
  n.font = '900 96px "Pretendard", "Noto Sans KR", sans-serif', n.textAlign = "center", n.textBaseline = "middle", n.fillStyle = e, n.fillText(s, 256, 68);
  const i = new Pc(t);
  i.colorSpace = wt;
  const r = new Le(new ei(32, 8), new St({ map: i, transparent: !0, depthWrite: !1 }));
  return r.rotation.x = -Math.PI / 2, r.rotation.z = Math.PI / 4, r;
}
const Hi = { uSight: { value: null }, uSightOn: { value: 0 }, uSightSize: { value: new qe(1, 1) } };
function wg(s, { base: e, world: t, mode: n }) {
  const i = n === "gun", r = t.w, a = t.h, o = r * We, c = a * We, l = Math.max(o, c);
  let u = !1;
  const h = new Hp({ antialias: !0, alpha: !0 });
  h.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)), h.outputColorSpace = wt, h.toneMapping = 4, h.shadowMap.enabled = !0, h.shadowMap.type = 2, h.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;outline:none", h.domElement.tabIndex = 0, s.prepend(h.domElement);
  const d = new Vp(), f = new xr(-10, 10, 10, -10, 0.1, 800), g = new cm(16773596, 9071439, 1.15), x = new Oc(16773334, 2.3);
  x.castShadow = !0, x.shadow.mapSize.set(2048, 2048), x.shadow.bias = -4e-4, x.shadow.normalBias = 0.05, Object.assign(x.shadow.camera, { left: -l, right: l, top: l, bottom: -l, near: 1, far: 300 + l }), x.position.set(o / 2 + 40 - l * 0.35, 90, c / 2 + 50 + l * 0.4), x.target.position.set(o / 2, 0, c / 2), d.add(g, x, x.target);
  const p = (_, R, b = 0) => new N(_ * We, b, R * We), m = new Int16Array(r * a).fill(-1);
  t.areas.forEach((_, R) => {
    for (let b = _.x0; b < _.x1; b++) for (let w = _.y0; w < _.y1; w++) m[w * r + b] = R;
  });
  function T(_, R) {
    const b = Math.floor(_), w = Math.floor(R);
    return b >= 0 && w >= 0 && b < r && w < a ? m[w * r + b] : -1;
  }
  function S(_, R) {
    const b = T(_, R);
    if (b < 0) return 0;
    const w = t.areas[b];
    if (w.kind !== "stairs") return w.h || 0;
    const I = w.axis === "x" ? (_ - w.x0) / (w.x1 - w.x0) : (R - w.y0) / (w.y1 - w.y0);
    return w.from + (w.to - w.from) * Math.min(1, Math.max(0, I));
  }
  const E = (_, R) => S(_, R) * _s, F = (_, R, b = 0) => p(_, R, E(_, R) + b), P = new De(13808780), L = /* @__PURE__ */ new Set();
  function z(_, R, b, w, I, ne) {
    const le = Math.min(I, 0) - 0.6, Q = new Le(new yt((b - _) * We, I - le, (w - R) * We), ne);
    Q.position.copy(p((_ + b) / 2, (R + w) / 2, (I + le) / 2)), Q.receiveShadow = !0, Q.castShadow = I > 0, d.add(Q);
  }
  for (const _ of t.areas) {
    const R = Ag(_);
    if (_.kind === "stairs") {
      const ne = new Lt({ color: 12101519, roughness: 0.8 }), le = _.axis === "x" ? _.x1 - _.x0 : _.y1 - _.y0, Q = le * 3;
      for (let oe = 0; oe < Q; oe++) {
        const Pe = oe / Q, be = (oe + 1) / Q, Ue = _.from + (_.to - _.from) * (_.from < _.to ? be : Pe);
        _.axis === "x" ? z(_.x0 + Pe * le, _.y0, _.x0 + be * le, _.y1, Ue * _s, ne) : z(_.x0, _.y0 + Pe * le, _.x1, _.y0 + be * le, Ue * _s, ne);
      }
      continue;
    }
    const b = _.kind === "jail" ? new De(9741240) : P.clone().lerp(R.color, _.kind === "corridor" ? 0.15 : 0.32);
    (_.h || 0) > 0 && b.offsetHSL(0, 0, 0.05), (_.h || 0) < 0 && b.offsetHSL(0, 0, -0.08), z(_.x0, _.y0, _.x1, _.y1, (_.h || 0) * _s, new Lt({ color: b, roughness: 0.85 }));
    const w = _.group || _.name + _.x0 + "," + _.y0;
    if (_.kind === "jail" || L.has(w)) continue;
    L.add(w);
    const I = bg(_.name, R.ink);
    I.scale.setScalar(Math.min(1, Math.min(_.x1 - _.x0, _.y1 - _.y0) * We * 1.3 / 32)), I.position.copy(p((_.x0 + _.x1) / 2, (_.y0 + _.y1) / 2, (_.h || 0) * _s + 0.025)), d.add(I);
  }
  function ee(_) {
    const b = (_.o === "v" ? [[_.f - 0.05, _.t + 0.5], [_.f + 0.05, _.t + 0.5]] : [[_.t + 0.5, _.f - 0.05], [_.t + 0.5, _.f + 0.05]]).filter(([w, I]) => T(w, I) >= 0).map(([w, I]) => E(w, I));
    return { bottom: Math.min(...b), top: Math.max(...b) };
  }
  (async () => {
    for (const _ of t.walls) {
      const R = await cr(e, "wallHalf");
      if (u) return;
      const b = ee(_);
      R.scale.set(We / R.userData.size.x, (b.top - b.bottom + pc) / R.userData.size.y, 1), _.o === "v" ? (R.rotation.y = Math.PI / 2, R.position.copy(p(_.f, _.t + 0.5, b.bottom))) : R.position.copy(p(_.t + 0.5, _.f, b.bottom)), d.add(R);
    }
    await tt();
    for (const _ of t.decor) {
      const R = await cr(e, _.model);
      if (u) return;
      R.position.copy(F(_.x + 1, _.y + 1, 0.03)), d.add(R);
    }
    for (const _ of t.props) {
      const R = await cr(e, _.model);
      if (u) return;
      const b = R.userData.size, [w, I] = _.rot % 2 ? [_.d, _.w] : [_.w, _.d];
      R.scale.set(Math.min(1, (w + 0.12) * We / b.x), 1, Math.min(1, (I + 0.12) * We / b.z)), R.rotation.y = _.rot * Math.PI / 2, R.position.copy(F(_.x + _.w / 2, _.y + _.d / 2)), d.add(R);
    }
  })();
  const v = new Lt({ color: 3359061, roughness: 0.5, metalness: 0.4 }), A = new yt(0.35, 5.5, 0.35);
  for (const _ of t.fences || []) {
    const R = ee(_).top, b = _.o === "v" ? (w) => p(_.f, _.t + w) : (w) => p(_.t + w, _.f);
    for (const w of [0, 0.5, 1]) {
      const I = new Le(A, v);
      I.position.copy(b(w)).setY(R + 2.75), I.castShadow = !0, d.add(I);
    }
    for (const w of [0.6, 5.2]) {
      const I = new Le(new yt(_.o === "v" ? 0.3 : We, 0.3, _.o === "v" ? We : 0.3), v);
      I.position.copy(b(0.5)).setY(R + w), d.add(I);
    }
  }
  let W = null;
  if (t.pad) {
    const _ = t.pad;
    W = new Le(new pi(_.r * We - 0.7, _.r * We, 48), new St({ color: 16436245, transparent: !0, opacity: 0.9, side: 2 })), W.userData.noSight = !0, W.rotation.x = -Math.PI / 2, W.position.copy(F(_.cx, _.cy, 0.08));
    const R = new Le(new Pa(_.r * We - 0.7, 48), new St({ color: 16639626, transparent: !0, opacity: 0.45 }));
    R.rotation.x = -Math.PI / 2, R.position.copy(F(_.cx, _.cy, 0.07)), d.add(W, R);
  }
  const q = 1.6, Y = new N(o / 2, 0, c / 2);
  function se() {
    const _ = s.clientWidth || 600, R = s.clientHeight || 400;
    h.setSize(_, R, !1);
    const b = Tg * We * 0.62 / q, w = _ / R;
    f.left = -b * w, f.right = b * w, f.top = b, f.bottom = -b, f.updateProjectionMatrix();
  }
  function j() {
    f.position.copy(Y).add(new N(1, 0.9, 1).normalize().multiplyScalar(300)), f.lookAt(Y);
  }
  se(), j();
  const he = new ResizeObserver(se);
  he.observe(s);
  const X = t.radius, xe = t.shapes;
  function ve(_, R) {
    for (let b = 0; b < 8; b++) {
      let w = !1;
      for (const I of R) {
        const ne = _.x - I.x, le = _.y - I.y, Q = Math.hypot(ne, le), oe = X * 2;
        Q >= oe || Q < 1e-6 || (_.x += ne / Q * (oe - Q), _.y += le / Q * (oe - Q), w = !0);
      }
      for (const I of xe) {
        let ne, le;
        I.kind === "circle" ? (ne = I.cx, le = I.cy) : (ne = Math.min(Math.max(_.x, I.cx - I.hx), I.cx + I.hx), le = Math.min(Math.max(_.y, I.cy - I.hy), I.cy + I.hy));
        let Q = _.x - ne, oe = _.y - le;
        const Pe = I.kind === "circle" ? I.r + X : X;
        let be = Math.hypot(Q, oe);
        if (!(be >= Pe)) {
          if (be < 1e-6) {
            const Ue = I.hx - Math.abs(_.x - I.cx), ze = I.hy - Math.abs(_.y - I.cy);
            Ue < ze ? (Q = Math.sign(_.x - I.cx) || 1, oe = 0, be = -Ue) : (Q = 0, oe = Math.sign(_.y - I.cy) || 1, be = -ze), _.x += Q * (Pe - be + 1e-3), _.y += oe * (Pe - be + 1e-3);
          } else
            _.x += Q / be * (Pe - be + 1e-3), _.y += oe / be * (Pe - be + 1e-3);
          w = !0;
        }
      }
      if (_.x = Math.min(Math.max(_.x, X), r - X), _.y = Math.min(Math.max(_.y, X), a - X), !w) break;
    }
    return _;
  }
  let we = "", Qe = null;
  const ht = (_, R) => {
    if (!Qe || !D || !D.team || !Qe[D.team]) return !1;
    const b = Qe[D.team];
    return ![[0, 0], [X, 0], [-X, 0], [0, X], [0, -X]].every(([w, I]) => b.has(T(_ + w, R + I)));
  };
  function Z(_, R) {
    return ht(_, R) ? !0 : xe.some((b) => b.kind === "circle" ? Math.hypot(_ - b.cx, R - b.cy) < b.r + X - 1e-3 : Math.hypot(Math.max(Math.abs(_ - b.cx) - b.hx, 0), Math.max(Math.abs(R - b.cy) - b.hy, 0)) < X - 1e-3);
  }
  const ce = new It();
  ce.visible = !1, d.add(ce);
  const Te = new St({ color: 16722902, transparent: !0, opacity: 0.45, depthWrite: !1 }), ye = new xn({ color: 16722902 });
  xe.forEach((_) => {
    const R = _.kind === "circle" ? new ji(_.r * We, _.r * We, 1.2, 40) : new yt(_.hx * 2 * We, 1.2, _.hy * 2 * We), b = new Le(R, Te);
    b.add(new mi(new $p(R, 20), ye)), b.position.copy(F(_.cx, _.cy, 0.6)), b.renderOrder = 10, ce.add(b);
  });
  const Xe = new pi(X * We - 0.25, X * We, 40), Be = new St({ color: 5195493, transparent: !0, opacity: 0.8, side: 2, depthWrite: !1 }), et = { cop: 2450411, thief: 14427686, red: 14427686, blue: 2450411 }, ft = new De(16777215);
  function nt(_) {
    const R = new It();
    if (_ === "cop") {
      const b = new Lt({ color: 1920728, roughness: 0.6 }), w = new Le(new ji(0.2, 0.22, 0.12, 24), b), I = new Le(new yt(0.3, 0.025, 0.14), new Lt({ color: 988970 }));
      I.position.set(0, -0.04, 0.2);
      const ne = new Le(new yt(0.07, 0.07, 0.02), new Lt({ color: 16436245, metalness: 0.6 }));
      ne.position.set(0, 0.01, 0.215), R.add(w, I, ne);
    } else if (_ === "red" || _ === "blue") {
      const b = new Lt({ color: _ === "red" ? 14427686 : 2450411, roughness: 0.55 }), w = new Le(new gi(0.235, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), b);
      w.scale.y = 0.7;
      const I = new Le(new yt(0.3, 0.03, 0.14), b);
      I.position.set(0, -0.03, 0.2), R.add(w, I);
    } else if (_ === "thief") {
      const b = new Lt({ color: 1120295, roughness: 0.9 }), w = new Le(new gi(0.235, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), b);
      w.scale.y = 0.7, R.add(w);
    }
    return R.position.set(0, 0.3, 0), R.traverse((b) => {
      b.isMesh && (b.castShadow = !0);
    }), R;
  }
  function U() {
    const _ = new It(), R = new Lt({ color: 16436245, roughness: 0.45 }), b = new Lt({ color: 1120295, roughness: 0.6 }), w = new Le(new yt(0.06, 0.07, 0.17), R);
    w.position.set(0, 0, 0.06);
    const I = new Le(new yt(0.05, 0.09, 0.05), b);
    I.position.set(0, -0.06, 0), I.rotation.x = -0.25;
    const ne = new Le(new yt(0.065, 0.075, 0.05), b);
    ne.position.set(0, 0, 0.16);
    const le = new Le(new yt(0.02, 0.02, 0.01), new St({ color: 3718648 }));
    return le.position.set(0, 0.025, 0.186), _.add(w, I, ne, le), _.position.set(-0.27, 0, 0.07), _.rotation.z = -Math.PI / 4, _.scale.setScalar(1.4), _.traverse((Q) => {
      Q.isMesh && (Q.castShadow = !0);
    }), _;
  }
  const Vt = {
    // [body length, body height, colour, barrel length] per weapon
    pistol: [0.17, 0.07, 3359061, 0],
    rifle: [0.34, 0.07, 1409085, 0.1],
    shotgun: [0.3, 0.09, 12730636, 0.08],
    sniper: [0.42, 0.06, 8266446, 0.16]
  };
  function Ze(_) {
    const [R, b, w, I] = Vt[_] || Vt.pistol, ne = new It(), le = new Le(new yt(0.06, b, R), new Lt({ color: w, roughness: 0.45 }));
    le.position.set(0, 0, R / 2 - 0.02);
    const Q = new Le(new yt(0.05, 0.09, 0.05), new Lt({ color: 1120295 }));
    if (Q.position.set(0, -0.06, 0), Q.rotation.x = -0.25, ne.add(le, Q), I) {
      const oe = new Le(new yt(0.03, 0.03, I), new Lt({ color: 988970 }));
      oe.position.set(0, 0.01, R - 0.02 + I / 2), ne.add(oe);
    }
    return ne.userData.muzzle = R + I, ne.position.set(-0.27, 0, 0.07), ne.rotation.z = -Math.PI / 4, ne.scale.setScalar(1.4), ne.traverse((oe) => {
      oe.isMesh && (oe.castShadow = !0);
    }), ne;
  }
  function it(_, R) {
    if (!_.actor || _.team === R) return;
    _.team = R;
    const b = _.actor.root.getObjectByName("head"), w = _.actor.root.getObjectByName("arm-right");
    _.hat && (_.hat.parent.remove(_.hat), _.hat = null), _.gun && (_.gun.parent.remove(_.gun), _.gun = null), R && b && (_.hat = nt(R), b.add(_.hat)), R === "cop" && w && (_.gun = U(), w.add(_.gun)), i && (R === "red" || R === "blue") && w && (_.gunKind = _.weapon || "pistol", _.gun = Ze(_.gunKind), w.add(_.gun));
  }
  const Ne = new It();
  d.add(Ne);
  const _t = [];
  function Oe(_, R, b, w, I, ne, le) {
    const Q = new Le(
      new ei((b - _) * We, (w - R) * We),
      new St({ color: I, transparent: !0, opacity: ne, depthWrite: !1, side: 2 })
    );
    return Q.rotation.x = -Math.PI / 2, Q.position.copy(p((_ + b) / 2, (R + w) / 2, le)), Q.userData.noSight = !0, Ne.add(Q), Q;
  }
  function C(_, R, b, w, I, ne) {
    const le = [[_, R], [b, R], [b, w], [_, w], [_, R]].map(([oe, Pe]) => p(oe, Pe, ne)), Q = new ys(new Rt().setFromPoints(le), new xn({ color: I, transparent: !0, opacity: 0.85 }));
    Q.userData.noSight = !0, Ne.add(Q);
  }
  function M(_, R, b, w, I, ne, le = 14) {
    const Q = document.createElement("canvas");
    Q.width = 512, Q.height = 512;
    const oe = Q.getContext("2d");
    oe.textAlign = "center", oe.textBaseline = "middle", oe.fillStyle = ne, oe.globalAlpha = 0.85, oe.font = '900 300px "Pretendard", "Noto Sans KR", sans-serif', oe.fillText(_, 256, 230), R && (oe.font = '900 64px "Pretendard", "Noto Sans KR", sans-serif', oe.fillText(R, 256, 440));
    const Pe = new Pc(Q);
    Pe.colorSpace = wt;
    const be = new Le(new ei(le, le), new St({ map: Pe, transparent: !0, depthWrite: !1 }));
    be.rotation.x = -Math.PI / 2, be.rotation.z = Math.PI / 4, be.position.copy(p(b, w, I)), be.userData.noSight = !0, Ne.add(be);
  }
  const G = { A: "#f59e0b", B: "#06b6d4" };
  if (i && t.gun_layout) {
    for (const _ of t.gun_layout.bases) {
      const R = _.rects.map(([b, w, I, ne]) => Oe(b, w, I, ne, 6583435, 0.16, E((b + I) / 2, (w + ne) / 2) + 0.12));
      _t.push(R);
    }
    for (const _ of t.gun_layout.sites) {
      const R = G[_.id] || "#f59e0b", b = parseInt(R.slice(1), 16);
      for (const [be, Ue, ze, rt] of _.rects) {
        const Mt = E((be + ze) / 2, (Ue + rt) / 2) + 0.14;
        Oe(be + 0.3, Ue + 0.3, ze - 0.3, rt - 0.3, b, 0.12, Mt), C(be + 0.3, Ue + 0.3, ze - 0.3, rt - 0.3, b, Mt + 0.02);
      }
      const w = _.rects.reduce((be, Ue) => (Ue[2] - Ue[0]) * (Ue[3] - Ue[1]) > (be[2] - be[0]) * (be[3] - be[1]) ? Ue : be), [I, ne, le, Q] = w, oe = (I + le) / 2, Pe = (ne + Q) / 2;
      M(_.id, "", oe - (le - I) * 0.2, Pe - (Q - ne) * 0.2, E(oe, Pe) + 0.18, R, 16);
    }
  }
  if (i && t.gun_pads)
    for (const [_, [R, b, w, I]] of Object.entries(t.gun_pads)) {
      const ne = _ === "red" ? 14427686 : 2450411;
      Oe(R, b, w, I, ne, 0.28, 0.14), C(R, b, w, I, ne, 0.18), M(_ === "red" ? "RED" : "BLUE", _ === "red" ? "레드팀 자리" : "블루팀 자리", (R + w) / 2, (b + I) / 2, 0.2, _ === "red" ? "#b91c1c" : "#1d4ed8", 10);
    }
  const $ = new It();
  d.add($);
  function re(_) {
    const R = _ ? JSON.stringify(_) : "";
    if (R !== we) {
      for (we = R, Qe = _ ? { red: new Set(_.red.areas), blue: new Set(_.blue.areas) } : null; $.children.length; ) {
        const b = $.children[0];
        $.remove(b), b.geometry.dispose(), b.material.dispose();
      }
      if (_)
        for (const b of ["red", "blue"])
          for (const [w, I, ne, le] of _[b].gates) {
            const Q = (le - ne) * We, oe = (ne + le) / 2, [Pe, be] = w === "h" ? [oe, I] : [I, oe], Ue = new Le(
              new yt(w === "h" ? Q : 0.5, 7, w === "h" ? 0.5 : Q),
              new St({ color: b === "red" ? 15680580 : 3900150, transparent: !0, opacity: 0.55, depthWrite: !1 })
            );
            Ue.position.copy(p(Pe, be, E(Pe, be) + 3.5)), Ue.userData.noSight = !0, $.add(Ue);
          }
    }
  }
  function J() {
    const _ = performance.now() / 1e3;
    $.children.forEach((R, b) => {
      R.material.opacity = 0.45 + 0.2 * Math.sin(_ * 5 + b);
    });
  }
  function Re(_) {
    _t.forEach((R, b) => R.forEach((w) => w.material.color.setHex(b === _ ? 14427686 : 2450411)));
  }
  const ie = /* @__PURE__ */ new Map();
  let ae = null, D = null;
  async function ue(_) {
    const R = { actor: null, x: _.x, y: _.y, dir: _.dir || 0, moving: !1, name: _.name, model: _.model, hidden: !!_.hidden };
    ie.set(_.id, R);
    const b = await Na.create(e, _.model, {});
    if (!ie.has(_.id)) return;
    R.actor = b, Number.isFinite(R.x) && b.root.position.copy(F(R.x, R.y));
    const w = new Le(Xe, Be.clone());
    w.rotation.x = -Math.PI / 2, w.position.y = 0.3, R.ring = w, b.root.add(w), d.add(b.root), it(R, R.wantTeam);
  }
  function Ee(_, R) {
    ae = R;
    const b = /* @__PURE__ */ new Set();
    _.forEach((w) => {
      b.add(w.id), ie.has(w.id) || ue(w);
      const I = ie.get(w.id);
      if (I.name = w.name, I.online = w.online, I.jailed = w.jailed, I.safe = w.safe, I.wantTeam = w.team, i) {
        I.hp = w.hp, I.dead = w.alive === !1 ? 1 : 0, I.weapon = w.weapon, I.pref = w.pref;
        const oe = I.actor && I.actor.root.getObjectByName("arm-right");
        oe && I.gun && I.gunKind !== w.weapon && w.team && (oe.remove(I.gun), I.gunKind = w.weapon, I.gun = Ze(w.weapon), oe.add(I.gun));
      }
      if (it(I, w.team), w.stun > 0 && (I.stunEnd = performance.now() / 1e3 + w.stun), w.id === ae) {
        (!D || w.tp !== D.tp) && (D = { ...D || {}, x: w.x, y: w.y, dir: w.dir, tp: w.tp }), D.speed = w.speed, D.frozen = w.frozen, D.jailed = w.jailed, D.team = w.team, D.grabbed = !!w.grabbed, D.grabbing = w.grabbing != null, i && (D.hp = w.hp, D.dead = w.alive === !1 ? 1 : 0, D.weapon = w.weapon, D.ammo = w.ammo, D.auto = !!w.auto);
        const oe = (w.stamina ?? 1) * t.run.stamina;
        (D.stamina == null || Math.abs(D.stamina - oe) > 0.6) && (D.stamina = oe), w.exhausted && (D.exhausted = !0);
        return;
      }
      if (w.hidden) {
        I.hidden = !0, I.moving = !1;
        return;
      }
      I.hidden && (I.hidden = !1, I.snap = !0, I.sampleAt = 0, I.x = w.x, I.y = w.y);
      const ne = performance.now() / 1e3, le = ne - (I.sampleAt || 0), Q = Math.hypot(w.x - I.x, w.y - I.y);
      if (!w.moving || Q > 3 || le > 0.5)
        I.vx = 0, I.vy = 0;
      else if (le > 0.02) {
        const oe = Math.min(1, 9 / Math.max(1e-6, Q / le));
        I.vx = (w.x - I.x) / le * oe, I.vy = (w.y - I.y) / le * oe;
      }
      I.snap = Q > 3, I.sampleAt = ne, I.x = w.x, I.y = w.y, I.dir = w.dir, I.moving = w.moving, I.running = !!w.running, I.grabbedNow = !!w.grabbed, I.grabbing = w.grabbing;
    });
    for (const [w, I] of ie)
      b.has(w) || (I.actor && d.remove(I.actor.root), ie.delete(w));
  }
  function Ge(_, R) {
    D && !Z(_, R) && (D.x = _, D.y = R);
  }
  function He() {
    for (const _ of ie.values()) _.actor && d.remove(_.actor.root);
    ie.clear(), D = null, ae = null;
  }
  const Se = [];
  async function tt() {
    if (!(t.doors || []).length) return;
    const _ = await cr(e, "doorway");
    let R = null;
    if (_.traverse((Q) => {
      Q.isMesh && Q.name && Q.name !== "doorway" && (R = Q);
    }), !R || u) return;
    const b = R.geometry.clone();
    b.computeBoundingBox();
    const w = b.boundingBox;
    b.translate(-w.min.x, -w.min.y, -(w.min.z + w.max.z) / 2);
    const I = w.max.x - w.min.x, ne = w.max.y - w.min.y, le = pc + 0.3;
    for (const Q of t.doors) {
      const oe = Q.t1 - Q.t0;
      if (oe > 2) continue;
      const Pe = oe / (oe === 2 ? 2 : 1), be = oe === 2 ? [[Q.t0, 1], [Q.t1, -1]] : [[Q.t0, 1]], Ue = (Q.t0 + Q.t1) / 2, [ze, rt] = Q.o === "h" ? [Ue, Q.f] : [Q.f, Ue];
      for (const [Mt, Nt] of be) {
        const cn = new Le(b, R.material);
        cn.castShadow = !0, cn.scale.set(Pe * We / I * 0.98, le / ne, 1);
        const Wt = new It();
        Wt.add(cn);
        const [pn, ii] = Q.o === "h" ? [Mt, Q.f] : [Q.f, Mt];
        Wt.position.copy(p(pn, ii, E(ze + (Q.o === "v" ? 0.01 : 0), rt + (Q.o === "h" ? 0.01 : 0))));
        const si = Q.o === "h" ? Nt > 0 ? 0 : Math.PI : Nt > 0 ? -Math.PI / 2 : Math.PI / 2, wi = Q.o === "h" ? Nt : -Nt;
        Wt.rotation.y = si, d.add(Wt), Se.push({ group: Wt, base: si, k: wi, o: Q.o, f: Q.f, cx: ze, cy: rt, hx: pn, hy: ii, len: Pe * 0.98, ang: 0, vel: 0 });
      }
    }
  }
  const Ve = 1.7, xt = 0.06;
  function B(_) {
    const R = Math.min(_, 0.04);
    for (const b of Se) {
      const w = -b.base - b.k * b.ang, I = Math.cos(w), ne = Math.sin(w), le = -ne, Q = I;
      let oe = 0, Pe = 0;
      for (const [be, Ue] of ie) {
        if (!Ue.actor || Ue.hidden && be !== ae) continue;
        const ze = be === ae && D ? D.x : Ue.actor.root.position.x / We, rt = be === ae && D ? D.y : Ue.actor.root.position.z / We, Mt = ze - b.hx, Nt = rt - b.hy;
        if (Math.abs(Mt) > b.len + X + 0.2 || Math.abs(Nt) > b.len + X + 0.2) continue;
        const cn = Math.max(0, Math.min(b.len, Mt * I + Nt * ne)), Wt = b.hx + I * cn, pn = b.hy + ne * cn;
        let ii = Wt - ze, si = pn - rt;
        const wi = Math.hypot(ii, si), qa = X + xt - wi;
        if (qa <= 0 || cn < 0.05) continue;
        wi > 1e-4 ? (ii /= wi, si /= wi) : (ii = le, si = Q);
        const ll = ii * le + si * Q, Rr = qa * ll / cn;
        Math.abs(Rr) > Math.abs(Pe) && (Pe = Rr, oe = -b.k * Rr);
      }
      oe && (b.ang += oe, b.vel = Math.max(-6, Math.min(6, oe / R))), b.vel += (60 * (0 - b.ang) - 7 * b.vel) * R, b.ang += b.vel * R, Math.abs(b.ang) > Ve && (b.ang = Math.sign(b.ang) * Ve, b.vel = 0), b.group.rotation.y = b.base + b.k * b.ang;
    }
  }
  const fe = { has: !1, x: 0, y: 0 }, K = new Cm(), te = new qe(), ge = new Zn(new N(0, 1, 0), 0), _e = new N();
  function $e(_) {
    const R = h.domElement.getBoundingClientRect();
    te.set((_.clientX - R.left) / R.width * 2 - 1, -((_.clientY - R.top) / R.height) * 2 + 1), K.setFromCamera(te, f), ge.constant = -(D ? E(D.x, D.y) : 0), K.ray.intersectPlane(ge, _e) && (fe.x = _e.x / We, fe.y = _e.z / We, fe.has = !0);
  }
  function bt(_) {
    if (i && _.button === 0 && D && D.dead > 0) {
      vi && vi(1);
      return;
    }
    _.button !== 0 || !D || !Dt() || ($e(_), i ? (Ct = !0, yi()) : H());
  }
  const Dt = () => i ? D && (D.team === "red" || D.team === "blue") : D && D.team === "cop", st = () => t.gun.weapons[D && D.weapon || "pistol"] || t.gun.weapons.pistol;
  let Ct = !1, Qt = 0, vi = null, Mi = null, Tn = "lobby";
  const zn = () => {
    Ct = !1;
  };
  window.addEventListener("pointerup", zn), window.addEventListener("pointercancel", zn);
  function yi() {
    const _ = performance.now() / 1e3;
    if (!D || !Dt() || Tn !== "playing" || D.frozen > 0 || D.dead > 0 || _ < Qt) return;
    const R = st();
    Qt = _ + R.cooldown;
    const b = fe.has ? Math.atan2(fe.x - D.x, fe.y - D.y) : D.dir;
    D.dir = b, Rs(ie.get(ae)), pe && (Me = 0, pe({ x: +D.x.toFixed(3), y: +D.y.toFixed(3), dir: +D.dir.toFixed(3), moving: !1, run: !1 })), O && O(+b.toFixed(4));
  }
  h.domElement.addEventListener("pointermove", $e), h.domElement.addEventListener("pointerdown", bt);
  const fn = new Le(new yt(1, 0.06, 0.3), new St({ color: 16436245, transparent: !0, opacity: 0.7, depthWrite: !1 })), an = new Le(new pi(0.8, 1.15, 32), new St({ color: 16436245, transparent: !0, opacity: 0.9, side: 2, depthWrite: !1 }));
  an.rotation.x = -Math.PI / 2, fn.userData.noSight = an.userData.noSight = !0, fn.visible = an.visible = !1, d.add(fn, an);
  function Ts() {
    const _ = Ar && D && Dt() && fe.has && !(D.frozen > 0) && !(D.dead > 0);
    if (fn.visible = an.visible = !!_, !_) return;
    const R = i ? st().range : t.taser.range, b = fe.x - D.x, w = fe.y - D.y, I = Math.min(R, Math.hypot(b, w)) || 0.01, ne = Math.atan2(b, w), le = D.x + Math.sin(ne) * I, Q = D.y + Math.cos(ne) * I, oe = E(D.x, D.y) + 0.15;
    fn.scale.x = I * We, fn.position.set((D.x + le) / 2 * We, oe, (D.y + Q) / 2 * We), fn.rotation.y = ne - Math.PI / 2, an.position.set(le * We, E(le, Q) + 0.16, Q * We);
    const Pe = performance.now() / 1e3 >= (i ? Qt : y);
    fn.material.color.setHex(Pe ? 16436245 : 9741240), an.material.color.setHex(Pe ? 16436245 : 9741240);
  }
  const Gn = new mi(
    new Rt().setAttribute("position", new dt(new Float32Array(8 * 2 * 3), 3)),
    new xn({ color: 16638023 })
  );
  Gn.frustumCulled = !1, d.add(Gn);
  function As() {
    const _ = Gn.geometry.attributes.position;
    let R = 0;
    for (const [b, w] of ie) {
      const I = b === ae && D ? D.grabbing ? [...ie.entries()].find(([, oe]) => oe.grabbedNow)?.[0] : null : w.grabbing, ne = I != null ? ie.get(I) : null;
      if (!w.actor || !ne || !ne.actor || R >= 8) continue;
      const le = w.actor.root.position, Q = ne.actor.root.position;
      _.setXYZ(R * 2, le.x, le.y + 2.2, le.z), _.setXYZ(R * 2 + 1, Q.x, Q.y + 2.6, Q.z), R++;
    }
    for (let b = R * 2; b < 16; b++) _.setXYZ(b, 0, -999, 0);
    _.needsUpdate = !0;
  }
  const ni = /* @__PURE__ */ new Set(), ss = { w: [-1, -1], arrowup: [-1, -1], s: [1, 1], arrowdown: [1, 1], a: [-1, 1], arrowleft: [-1, 1], d: [1, -1], arrowright: [1, -1] };
  let Si = !1, Hn = !1, y = 0, O = null;
  function H() {
    const _ = performance.now() / 1e3;
    if (!D || D.team !== "cop" || D.frozen > 0 || _ < y) return;
    y = _ + t.taser.cooldown;
    const R = fe.has ? Math.atan2(fe.x - D.x, fe.y - D.y) : D.dir;
    D.dir = R, Rs(ie.get(ae)), pe && (Me = 0, pe({ x: +D.x.toFixed(3), y: +D.y.toFixed(3), dir: +D.dir.toFixed(3), moving: !1, run: !1 })), O && O(+R.toFixed(4));
  }
  function V(_) {
    const R = _.key.toLowerCase();
    if ((R === " " || R === "shift") && !_.target.closest("input, textarea, button") && D) {
      _.preventDefault(), D.team === "thief" ? Si = !0 : R === " " && !_.repeat && (i ? (Ct = !0, yi()) : H());
      return;
    }
    if (R === "e" && !_.target.closest("input, textarea") && ae) {
      _.repeat || bs();
      return;
    }
    if (Xa[R] && !_.target.closest("input, textarea") && ae) {
      wr && !_.repeat && wr(Xa[R]);
      return;
    }
    if (R === "h" && !_.target.closest("input, textarea") && ae) {
      ce.visible = !ce.visible;
      return;
    }
    !ss[R] || _.target.closest("input, textarea") || !ae || (_.preventDefault(), ni.add(R));
  }
  const k = (_) => {
    const R = _.key.toLowerCase();
    ni.delete(R), (R === " " || R === "shift") && (Si = !1, i && (Ct = !1)), R === "e" && Er();
  }, de = () => {
    ni.clear(), Si = !1, Ct = !1, Er();
  };
  window.addEventListener("keydown", V), window.addEventListener("keyup", k), window.addEventListener("blur", de);
  let pe = null, Me = 0, Ae = !1;
  function Fe(_) {
    if (!D) return !1;
    let R = 0, b = 0;
    ni.forEach((le) => {
      R += ss[le][0], b += ss[le][1];
    });
    const w = Math.hypot(R, b), I = w > 0, ne = D.frozen > 0;
    if (ne && (D.frozen = Math.max(0, D.frozen - _)), D.exhausted && (D.stamina ?? 0) >= t.run.recover && (D.exhausted = !1), Hn = D.team === "thief" && Si && I && !ne && !D.jailed && !D.exhausted && (D.stamina ?? 0) > 0, Hn ? (D.stamina = Math.max(0, D.stamina - _), D.stamina <= 0 && (D.exhausted = !0)) : D.stamina != null && (D.stamina = Math.min(t.run.stamina, D.stamina + _ * t.run.regen)), I && !ne) {
      const le = D.grabbed ? t.arrest.slow : D.grabbing ? t.arrest.cop_slow : 1, Q = (D.speed || t.speed.lobby) * (Hn ? t.run.mult : 1) * le * _, oe = Math.max(1, Math.ceil(Q / 0.08)), Pe = [...ie.entries()].filter(([ze, rt]) => ze !== ae && !rt.hidden && Number.isFinite(rt.x) && Number.isFinite(rt.y)).map(([, ze]) => ze), be = R / w * Q / oe, Ue = b / w * Q / oe;
      for (let ze = 0; ze < oe; ze++) {
        const rt = D.x, Mt = D.y;
        if (D.x += be, D.y += Ue, ve(D, Pe), !Z(D.x, D.y)) continue;
        D.x = rt + be, D.y = Mt, ve(D, Pe), Z(D.x, D.y) && (D.x = rt, D.y = Mt);
        const Nt = D.x;
        D.y += Ue, ve(D, Pe), Z(D.x, D.y) && (D.x = Nt, D.y -= Ue, Z(D.x, D.y) && (D.x = rt, D.y = Mt)), (!Number.isFinite(D.x) || !Number.isFinite(D.y)) && (D.x = rt, D.y = Mt);
      }
      D.dir = Math.atan2(R, b);
    }
    return Me += _, pe && (I && Me >= Eg || I !== Ae) && (Me = 0, pe({ x: +D.x.toFixed(3), y: +D.y.toFixed(3), dir: +D.dir.toFixed(3), moving: I, run: Hn })), Ae = I && !ne, I && !ne;
  }
  const ke = new gi(0.75, 10, 8), Ce = new pi(1.1, 1.6, 40), ot = [];
  function mt(_, R, b) {
    const w = new Le(Ce, new St({ color: b, transparent: !0, opacity: 0.9, side: 2, depthWrite: !1 }));
    w.rotation.x = -Math.PI / 2, w.position.copy(F(_, R, 0.15)), w.userData.life = 0, d.add(w), ot.push(w);
  }
  const vt = [];
  function zt(_, R) {
    const b = new Le(ke, new St({ color: 16118248, transparent: !0, opacity: 0.85, depthWrite: !1 }));
    b.position.copy(F(_ + (Math.random() - 0.5) * 0.25, R + (Math.random() - 0.5) * 0.25, 0.35)), b.userData.life = 0, d.add(b), vt.push(b);
  }
  function lt(_) {
    for (let R = vt.length - 1; R >= 0; R--) {
      const b = vt[R];
      b.userData.life += _;
      const w = b.userData.life / 0.5;
      if (w >= 1) {
        d.remove(b), b.material.dispose(), vt.splice(R, 1);
        continue;
      }
      b.scale.setScalar(1 + w * 1.8), b.position.y = 0.35 + w * 1.2, b.material.opacity = 0.85 * (1 - w);
    }
    for (let R = ot.length - 1; R >= 0; R--) {
      const b = ot[R];
      b.userData.life += _;
      const w = b.userData.life / 0.4;
      if (w >= 1) {
        d.remove(b), b.material.dispose(), ot.splice(R, 1);
        continue;
      }
      b.scale.setScalar(1 + w * 2.6), b.material.opacity = 0.9 * (1 - w);
    }
  }
  const Ie = new yt(0.18, 0.18, 5.5);
  function Ut(_) {
    if (_.streaks) return _.streaks;
    const R = new It();
    for (const [b, w] of [[-0.9, 1.4], [0.9, 1.9], [-0.45, 3.1], [0.5, 0.7]]) {
      const I = new Le(Ie, new St({ color: 16777215, transparent: !0, opacity: 0.6, depthWrite: !1 }));
      I.position.set(b, w, -3.4), R.add(I);
    }
    return R.visible = !1, _.actor.root.add(R), _.streaks = R;
  }
  const ct = new N();
  function tn() {
    const _ = {};
    for (const [R, b] of ie) {
      if (!b.actor || b.hidden && R !== ae) continue;
      ct.copy(b.actor.root.position).setY(6.2).project(f);
      const w = b.emote ? performance.now() / 1e3 - b.emote.born : 9;
      _[R] = {
        x: (ct.x + 1) / 2 * s.clientWidth,
        y: (1 - ct.y) / 2 * s.clientHeight,
        name: b.name,
        me: R === ae,
        online: b.online !== !1,
        team: b.team,
        jailed: b.jailed,
        reach: R === Gt,
        hp: b.hp,
        dead: b.dead > 0,
        emote: w < 1.8 ? b.emote.e : null,
        emoteAge: w
      };
    }
    return _;
  }
  let An = null;
  const Yt = new mm();
  function Ei() {
    const _ = Math.min(0.05, Yt.getDelta()), R = Fe(_);
    for (const [w, I] of ie) {
      const ne = I.actor;
      if (!ne) continue;
      const le = w === ae && D;
      if (ne.root.visible = (le || !I.hidden) && !(I.dead > 0), !ne.root.visible) continue;
      const Q = le ? 0 : Math.min(0.12, performance.now() / 1e3 - (I.sampleAt || 0)), oe = le ? D.x : I.x + (I.vx || 0) * Q, Pe = le ? D.y : I.y + (I.vy || 0) * Q, be = F(oe, Pe);
      le || I.snap ? (ne.root.position.copy(be), I.snap = !1) : ne.root.position.lerp(be, Math.min(1, _ * 14)), ne.root.rotation.y = le ? D.dir : I.dir;
      const Ue = performance.now() / 1e3, ze = le ? Hn : !!I.running;
      if (I.ring) {
        const Wt = I.safe > 0 && Math.floor(performance.now() / 150) % 2;
        I.ring.material.color.setHex(I.jailed ? 6583435 : Wt ? 2278750 : et[I.team || I.pref] || 5195493), ze && I.ring.material.color.lerp(ft, 0.45), I.ring.scale.setScalar(ze ? 1.45 : 1), I.ring.material.opacity = ze ? 1 : 0.8, I.ring.visible = !!I.team || !!I.pref || ce.visible || le || ze;
      }
      ze && !I.wasDashing && mt(oe, Pe, I.jailed ? 9741240 : et[I.team] || 6514417), I.wasDashing = ze;
      const rt = Ut(I);
      rt.visible = ze, ze && (rt.children.forEach((Wt, pn) => {
        Wt.material.opacity = 0.5 + 0.4 * Math.abs(Math.sin(Ue * 30 + pn * 1.7)), Wt.scale.z = 0.8 + 0.4 * Math.abs(Math.sin(Ue * 22 + pn));
      }), I.puffT = (I.puffT || 0) + _, I.puffT > 0.05 && (I.puffT = 0, zt(oe, Pe)));
      const Mt = (I.stunEnd || 0) > Ue;
      Fa(I, Mt), Mt && (ne.root.rotation.y += Math.sin(Ue * 70) * 0.18, I.ring && I.ring.material.color.setHex(Math.floor(Ue * 20) % 2 ? 2282478 : 16777215));
      const Nt = (I.crouchUntil || 0) > Ue, cn = (I.grabUntil || 0) > Ue || (le ? D.grabbing : I.grabbing != null);
      (le ? D.grabbed : I.grabbedNow) && !Mt && (ne.root.rotation.y += Math.sin(Ue * 40) * 0.25), ne.pose(Nt ? "sit" : cn ? "work" : !Mt && ((le ? R : I.moving) || ze) ? "walk" : "idle"), ne.mixer && (ne.mixer.timeScale = ze ? 1.6 : Mt ? 3 : 1), ne.update(_);
    }
    rs(), i && (Ct && D && D.auto && yi(), Yc(), $c()), Jc(), sl(), B(_), Ts(), As(), i && J(), lt(_);
    const b = Wa();
    b && Y.lerp(F(b.x, b.y), Math.min(1, _ * 5)), W && (W.material.opacity = 0.6 + Math.sin(performance.now() / 250) * 0.3), j(), h.render(d, f), An && An(tn()), u || (Tt = requestAnimationFrame(Ei));
  }
  let Tt = requestAnimationFrame(Ei), on = null, Ti = 0, Gt = null;
  function rs() {
    Gt = null;
    const _ = ie.get(ae);
    if (!D || !_ || _.team !== "cop" || D.frozen > 0 || D.grabbing) return;
    let R = t.arrest.reach + 0.05;
    for (const [b, w] of ie) {
      if (b === ae || !w.actor || w.hidden || w.team !== "thief" || w.jailed || w.safe > 0) continue;
      const I = w.actor.root.position, ne = Math.hypot(I.x / We - D.x, I.z / We - D.y);
      ne <= R && (R = ne, Gt = b);
    }
  }
  function bs() {
    const _ = ie.get(ae), R = performance.now() / 1e3;
    !on || !D || !_ || _.team !== "cop" || D.frozen > 0 || R < Ti || (Ti = R + t.arrest.cooldown, _.grabUntil = R + 0.35, Ai = !0, pe && (Me = 0, pe({ x: +D.x.toFixed(3), y: +D.y.toFixed(3), dir: +D.dir.toFixed(3), moving: !1, run: !1 })), on(Gt));
  }
  let Ai = !1, Sr = null;
  function Er() {
    Ai && (Ai = !1, Sr && Sr());
  }
  const as = [], Wc = new yt(0.35, 0.35, 1.1), Xc = new St({ color: 16638023 }), qc = new xn({ color: 14742270, transparent: !0, opacity: 0.9 });
  function jc(_) {
    const R = performance.now() / 1e3;
    for (const b of _ || [])
      if (i && b.t === "gshot") {
        b.id !== ae && Rs(ie.get(b.id));
        const w = F(b.x, b.y, 2.3);
        for (const [I, ne] of b.ends) {
          const le = F(I, ne, 2.3), Q = new Rt().setFromPoints([w, le]), oe = new ys(Q, new xn({ color: b.w === "sniper" ? 15324671 : 16707722, transparent: !0, opacity: 0.95 }));
          oe.frustumCulled = !1, oe.userData.noSight = !0, d.add(oe), ws.push({ line: oe, born: R });
        }
      } else if (i && b.t === "hit") {
        const w = ie.get(b.id);
        if (w && w.actor && !w.hidden) {
          const I = b.id === ae && D ? D.x : w.x, ne = b.id === ae && D ? D.y : w.y;
          if (Number.isFinite(I) && Number.isFinite(ne)) for (let le = 0; le < 4; le++) zt(I + (Math.random() - 0.5) * 0.4, ne + (Math.random() - 0.5) * 0.4);
        }
        w && (w.hitAt = R);
      } else if (i && b.t === "kill") {
        const w = ie.get(b.victim);
        w && Number.isFinite(w.x) && mt(b.victim === ae && D ? D.x : w.x, b.victim === ae && D ? D.y : w.y, 15680580);
      } else if (i && b.t === "respawn") {
        const w = ie.get(b.id);
        w && Number.isFinite(w.x) && mt(b.id === ae && D ? D.x : w.x, b.id === ae && D ? D.y : w.y, 2278750);
      } else if (b.t === "shot") {
        const w = new Le(Wc, Xc);
        w.rotation.y = b.dir;
        const I = new mi(new Rt().setAttribute("position", new dt(new Float32Array(12), 3)), qc);
        I.frustumCulled = !1, d.add(w, I), as.push({ cop: b.cop, x: b.x, y: b.y, dir: b.dir, t0: R, end: null, endAt: 0, m: w, wires: I }), b.cop !== ae && Rs(ie.get(b.cop));
      } else if (b.t === "grab") {
        const w = ie.get(b.cop);
        w && b.cop !== ae && (w.grabUntil = R + 0.35);
      } else if (b.t === "caught") {
        const w = ie.get(b.thief);
        w && (w.stunEnd = 0, Fa(w, !1));
      } else if (b.t === "emote")
        ol(b.id, b.e);
      else if (b.t === "tase") {
        const w = as.find((I) => I.cop === b.cop && !I.end);
        if (w && (w.end = { x: b.x, y: b.y }), b.thief != null) {
          const I = ie.get(b.thief);
          I && (I.stunEnd = R + t.taser.stun);
          for (let ne = 0; ne < 6; ne++) zt(b.x + (Math.random() - 0.5) * 0.4, b.y + (Math.random() - 0.5) * 0.4);
        }
      }
  }
  const ws = [];
  function Yc() {
    const _ = performance.now() / 1e3;
    for (let R = ws.length - 1; R >= 0; R--) {
      const b = ws[R], w = _ - b.born;
      b.line.material.opacity = Math.max(0, 0.95 * (1 - w / 0.16)), w > 0.16 && (d.remove(b.line), b.line.geometry.dispose(), b.line.material.dispose(), ws.splice(R, 1));
    }
  }
  const Kc = { rifle: 2278750, shotgun: 16347926, sniper: 11032055, medkit: 15680580 }, Tr = /* @__PURE__ */ new Map();
  function Zc(_) {
    for (const R of _ || []) {
      let b = Tr.get(R.id);
      if (!b) {
        const w = new It(), I = Kc[R.kind] || 16777215, ne = new Le(new ji(1.7, 1.7, 0.15, 28), new St({ color: I, transparent: !0, opacity: 0.55, depthWrite: !1 }));
        ne.userData.noSight = !0;
        const le = new Le(new yt(1.5, 1.5, 1.5), new Lt({ color: I, roughness: 0.4, emissive: I, emissiveIntensity: 0.35 }));
        if (le.castShadow = !0, R.kind === "medkit") {
          const Q = new Le(new yt(1.6, 0.5, 1.6), new St({ color: 16777215 })), oe = new Le(new yt(0.5, 1.6, 1.6), new St({ color: 16777215 }));
          le.add(Q, oe);
        } else {
          const Q = new Le(new yt(0.35, 0.35, R.kind === "sniper" ? 2.4 : 1.8), new Lt({ color: 988970 }));
          Q.position.y = 1, Q.rotation.y = 0.6, le.add(Q);
        }
        w.add(ne, le), w.position.copy(F(R.x, R.y, 0.2)), w.userData.crate = le, d.add(w), b = { g: w, crate: le }, Tr.set(R.id, b);
      }
      b.g.visible = !!R.on;
    }
  }
  function $c() {
    const _ = performance.now() / 1e3;
    for (const R of Tr.values())
      R.g.visible && (R.crate.position.y = 2.1 + Math.sin(_ * 2.4 + R.g.position.x) * 0.35, R.crate.rotation.y = _ * 1.2);
  }
  function Jc() {
    const _ = performance.now() / 1e3, R = t.taser.speed, b = t.taser.range;
    for (let w = as.length - 1; w >= 0; w--) {
      const I = as[w];
      let ne = Math.min(b, (_ - I.t0) * R);
      I.end && (ne = Math.min(ne, Math.hypot(I.end.x - I.x, I.end.y - I.y)));
      const le = I.x + Math.sin(I.dir) * ne, Q = I.y + Math.cos(I.dir) * ne;
      I.m.position.copy(F(le, Q, 2.2));
      const oe = ie.get(I.cop), Pe = oe && oe.actor ? oe.actor.root.position : F(I.x, I.y), be = I.wires.geometry.attributes.position, Ue = E(le, Q);
      be.setXYZ(0, Pe.x - 0.25, Pe.y + 2.3, Pe.z), be.setXYZ(1, le * We - 0.15, Ue + 2.3, Q * We), be.setXYZ(2, Pe.x + 0.25, Pe.y + 2.1, Pe.z), be.setXYZ(3, le * We + 0.15, Ue + 2.1, Q * We), be.needsUpdate = !0, (I.end && ne >= Math.hypot(I.end.x - I.x, I.end.y - I.y) - 1e-3 || ne >= b) && !I.endAt && (I.endAt = _), (I.endAt && _ - I.endAt > 0.35 || _ - I.t0 > 2) && (d.remove(I.m, I.wires), I.wires.geometry.dispose(), as.splice(w, 1));
    }
  }
  function Rs(_) {
    if (!_ || !_.gun) return;
    const R = new Le(new gi(i ? 0.13 : 0.09, 8, 6), new St({ color: i ? 16638023 : 8246268, transparent: !0, opacity: 0.95 }));
    R.position.set(0, 0, i ? (_.gun.userData.muzzle || 0.24) + 0.04 : 0.24), _.gun.add(R), setTimeout(() => {
      _.gun && _.gun.remove(R), R.material.dispose();
    }, 120);
  }
  const Qc = new xn({ color: 6809849, transparent: !0, opacity: 0.95 });
  function Fa(_, R) {
    if (!R) {
      _.sparks && (_.sparks.visible = !1);
      return;
    }
    _.sparks || (_.sparks = new mi(new Rt().setAttribute("position", new dt(new Float32Array(3 * 2 * 18), 3)), Qc), _.sparks.frustumCulled = !1, _.actor.root.add(_.sparks)), _.sparks.visible = !0;
    const b = _.sparks.geometry.attributes.position;
    for (let w = 0; w < 3; w++) {
      let I = Math.random() * Math.PI * 2, ne = Math.cos(I) * 1.3, le = 0.3, Q = Math.sin(I) * 1.3;
      for (let oe = 0; oe < 6; oe++) {
        I += (Math.random() - 0.3) * 1.2;
        const Pe = Math.cos(I) * (1.1 + Math.random() * 0.6), be = le + 0.7 + Math.random() * 0.4, Ue = Math.sin(I) * (1.1 + Math.random() * 0.6), ze = (w * 6 + oe) * 2;
        b.setXYZ(ze, ne, le, Q), b.setXYZ(ze + 1, Pe, be, Ue), ne = Pe, le = be, Q = Ue;
      }
    }
    b.needsUpdate = !0;
  }
  let Ar = !1, Ba = 0;
  const bn = 4, Kt = r * bn, wn = a * bn, Cs = new Float32Array(Kt * wn), Oa = new Uint8Array(Kt * wn), bi = new Ca(Oa, Kt, wn, 1028, 1009);
  bi.magFilter = 1006, bi.minFilter = 1006, bi.needsUpdate = !0;
  const ka = Hi;
  Hi.uSight.value = bi, Hi.uSightOn.value = 0, Hi.uSightSize.value.set(o, c);
  const za = new Uint8Array(Kt * wn), br = new Uint8Array(Kt * wn), Ga = (_) => {
    const R = [];
    for (let b = Math.max(0, Math.floor((_.cx - _.hx) * bn)); b < Math.min(Kt, Math.ceil((_.cx + _.hx) * bn)); b++)
      for (let w = Math.max(0, Math.floor((_.cy - _.hy) * bn)); w < Math.min(wn, Math.ceil((_.cy + _.hy) * bn)); w++) R.push(w * Kt + b);
    return R;
  };
  for (const _ of t.sight || []) for (const R of Ga(_)) za[R] = 1;
  const el = new Map((t.door_sight || []).map((_) => [_.id, Ga(_)]));
  let Is = /* @__PURE__ */ new Set();
  function Ha() {
    br.set(za);
    for (const [_, R] of el) if (!Is.has(_)) for (const b of R) br[b] = 1;
  }
  Ha();
  function tl(_) {
    const R = new Set(_ || []);
    R.size === Is.size && [...R].every((b) => Is.has(b)) || (Is = R, Ha());
  }
  function nl(_) {
    !_ || _.userData.sight || _.userData.noSight || _.isLineBasicMaterial || _.isSpriteMaterial || (_.userData.sight = !0, _.onBeforeCompile = (R) => {
      Object.assign(R.uniforms, ka), R.vertexShader = `varying vec2 vSightXZ;
` + R.vertexShader.replace(
        "#include <project_vertex>",
        `#include <project_vertex>
  vSightXZ = (modelMatrix * vec4(transformed, 1.0)).xz;`
      ), R.fragmentShader = `uniform sampler2D uSight;
uniform float uSightOn;
uniform vec2 uSightSize;
varying vec2 vSightXZ;
` + R.fragmentShader.replace("#include <dithering_fragment>", `#include <dithering_fragment>
  if (uSightOn > 0.5) { float sv = texture2D(uSight, vSightXZ / uSightSize).r; gl_FragColor.rgb *= mix(vec3(0.2, 0.23, 0.34), vec3(1.0), sv); }`);
    }, _.customProgramCacheKey = () => "sight1", _.needsUpdate = !0);
  }
  let Va = 0;
  function il() {
    d.traverse((_) => {
      !_.material || _.userData.noSight || (Array.isArray(_.material) ? _.material : [_.material]).forEach(nl);
    });
  }
  function Wa() {
    if (i && D && D.dead > 0 && Mi != null) {
      const _ = ie.get(Mi);
      if (_ && _.actor) return { x: _.actor.root.position.x / We, y: _.actor.root.position.z / We };
    }
    return D;
  }
  function sl() {
    const _ = Wa(), R = Ar && !!_ && !!D.team;
    ka.uSightOn.value = R ? 1 : 0;
    const b = performance.now();
    if (b - Va > 700 && (Va = b, il()), !R || b - Ba < 100) return;
    Ba = b, Cs.fill(0);
    const w = t.view || 18, I = 5, ne = 720, le = 0.12, Q = (oe, Pe, be) => {
      const Ue = Math.floor(oe * bn), ze = Math.floor(Pe * bn);
      if (Ue < 0 || ze < 0 || Ue >= Kt || ze >= wn) return;
      const rt = ze * Kt + Ue;
      be > Cs[rt] && (Cs[rt] = be);
    };
    for (let oe = 0; oe < ne; oe++) {
      const Pe = oe / ne * Math.PI * 2, be = Math.cos(Pe), Ue = Math.sin(Pe);
      let ze = -1;
      for (let rt = 0; rt <= w; rt += le) {
        const Mt = _.x + be * rt, Nt = _.y + Ue * rt;
        T(Mt, Nt) < 0 && ze < 0 && (ze = 1);
        const cn = rt < w - I ? 1 : Math.max(0, (w - rt) / I);
        if (Q(Mt, Nt, cn), ze >= 0) {
          if (ze-- === 0) break;
          continue;
        }
        const Wt = Math.floor(Mt * bn), pn = Math.floor(Nt * bn);
        Wt >= 0 && pn >= 0 && Wt < Kt && pn < wn && br[pn * Kt + Wt] && (ze = 3);
      }
    }
    for (let oe = 0; oe < wn; oe++)
      for (let Pe = 0; Pe < Kt; Pe++) {
        let be = 0, Ue = 0;
        for (let ze = -1; ze <= 1; ze++) for (let rt = -1; rt <= 1; rt++) {
          const Mt = Pe + rt, Nt = oe + ze;
          Mt >= 0 && Nt >= 0 && Mt < Kt && Nt < wn && (be += Cs[Nt * Kt + Mt], Ue++);
        }
        Oa[oe * Kt + Pe] = Math.round(be / Ue * 255);
      }
    bi.needsUpdate = !0;
  }
  let Ln = null;
  function rl(_) {
    W && (Ln && (d.remove(Ln), Ln.geometry.dispose(), Ln = null), _ > 0 && (Ln = new Le(
      new pi(t.pad.r * We - 0.7, t.pad.r * We + 0.4, 48, 1, Math.PI / 2, -Math.PI * 2 * _),
      new St({ color: 2278750, side: 2, transparent: !0, opacity: 0.95, depthWrite: !1 })
    ), Ln.userData.noSight = !0, Ln.rotation.x = -Math.PI / 2, Ln.position.copy(F(t.pad.cx, t.pad.cy, 0.12)), d.add(Ln)));
  }
  const al = { laugh: "🤣", taunt: "😜", wave: "👋", angry: "😡", cool: "😎" }, Xa = { 1: "laugh", 2: "taunt", 3: "wave", 4: "angry", 5: "cool", c: "teabag" };
  function ol(_, R) {
    const b = ie.get(_);
    if (!b || !b.actor || b.hidden && _ !== ae) return !1;
    const w = performance.now() / 1e3;
    return R === "teabag" ? b.crouchUntil = w + 0.28 : b.emote = { e: al[R] || "❓", born: w }, !0;
  }
  let wr = null;
  function cl() {
    u = !0, Hi.uSight.value === bi && (Hi.uSightOn.value = 0), cancelAnimationFrame(Tt), he.disconnect(), window.removeEventListener("keydown", V), window.removeEventListener("keyup", k), window.removeEventListener("blur", de), window.removeEventListener("pointerup", zn), window.removeEventListener("pointercancel", zn), h.domElement.removeEventListener("pointermove", $e), h.domElement.removeEventListener("pointerdown", bt), h.dispose(), h.forceContextLoss(), h.domElement.remove();
  }
  return {
    setPlayers: Ee,
    correct: Ge,
    clear: He,
    dispose: cl,
    mapKey: t.key,
    onArrest(_) {
      on = _;
    },
    arrestNow: bs,
    focus() {
      h.domElement.focus();
    },
    onMove(_) {
      pe = _;
    },
    onRelease(_) {
      Sr = _;
    },
    releaseGrab: Er,
    fireTaser: H,
    onShot(_) {
      O = _;
    },
    onEmote(_) {
      wr = _;
    },
    setPad: rl,
    setOpenDoors: tl,
    setPickups: Zc,
    setLock: re,
    setSide: Re,
    events: jc,
    setPhase(_) {
      Tn = _, Ar = _ === "countdown" || _ === "playing" || _ === "buy";
    },
    setSpectate(_) {
      Mi = _;
    },
    onSpectate(_) {
      vi = _;
    },
    abilityState() {
      const _ = performance.now() / 1e3, R = D && D.team;
      if (i) {
        const b = st();
        return D && Dt() ? { kind: "gun", name: b.name, ammo: D.ammo, ready: Math.max(0, Qt - _), cooldown: b.cooldown } : { kind: null };
      }
      return R === "cop" ? { kind: "taser", ready: Math.max(0, y - _), cooldown: t.taser.cooldown, active: !1 } : R === "thief" ? { kind: "run", stamina: (D.stamina ?? t.run.stamina) / t.run.stamina, active: Hn, exhausted: !!D.exhausted } : { kind: null };
    },
    onFrame(_) {
      An = _;
    }
  };
}
export {
  wg as createRoomScene
};
