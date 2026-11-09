/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */
const _a = "169";
const Ha = "attached", Zc = "detached";
const Kn = "", Rt = "srgb", Gt = "srgb-linear", xa = "display-p3", ur = "display-p3-linear", ar = "linear", St = "srgb", or = "rec709", cr = "p3";
const Va = "300 es";
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
const Wt = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "0a", "0b", "0c", "0d", "0e", "0f", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "1a", "1b", "1c", "1d", "1e", "1f", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "2a", "2b", "2c", "2d", "2e", "2f", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "3a", "3b", "3c", "3d", "3e", "3f", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "4a", "4b", "4c", "4d", "4e", "4f", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "5a", "5b", "5c", "5d", "5e", "5f", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "6a", "6b", "6c", "6d", "6e", "6f", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "7a", "7b", "7c", "7d", "7e", "7f", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "8a", "8b", "8c", "8d", "8e", "8f", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "9a", "9b", "9c", "9d", "9e", "9f", "a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "aa", "ab", "ac", "ad", "ae", "af", "b0", "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9", "ba", "bb", "bc", "bd", "be", "bf", "c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "ca", "cb", "cc", "cd", "ce", "cf", "d0", "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "da", "db", "dc", "dd", "de", "df", "e0", "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9", "ea", "eb", "ec", "ed", "ee", "ef", "f0", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "fa", "fb", "fc", "fd", "fe", "ff"];
let Wa = 1234567;
const ki = Math.PI / 180, Wi = 180 / Math.PI;
function Mn() {
  const s = Math.random() * 4294967295 | 0, e = Math.random() * 4294967295 | 0, t = Math.random() * 4294967295 | 0, n = Math.random() * 4294967295 | 0;
  return (Wt[s & 255] + Wt[s >> 8 & 255] + Wt[s >> 16 & 255] + Wt[s >> 24 & 255] + "-" + Wt[e & 255] + Wt[e >> 8 & 255] + "-" + Wt[e >> 16 & 15 | 64] + Wt[e >> 24 & 255] + "-" + Wt[t & 63 | 128] + Wt[t >> 8 & 255] + "-" + Wt[t >> 16 & 255] + Wt[t >> 24 & 255] + Wt[n & 255] + Wt[n >> 8 & 255] + Wt[n >> 16 & 255] + Wt[n >> 24 & 255]).toLowerCase();
}
function qt(s, e, t) {
  return Math.max(e, Math.min(t, s));
}
function va(s, e) {
  return (s % e + e) % e;
}
function $c(s, e, t, n, i) {
  return n + (s - e) * (i - n) / (t - e);
}
function Jc(s, e, t) {
  return s !== e ? (t - s) / (e - s) : 0;
}
function gs(s, e, t) {
  return (1 - t) * s + t * e;
}
function Qc(s, e, t, n) {
  return gs(s, e, 1 - Math.exp(-t * n));
}
function el(s, e = 1) {
  return e - Math.abs(va(s, e * 2) - e);
}
function tl(s, e, t) {
  return s <= e ? 0 : s >= t ? 1 : (s = (s - e) / (t - e), s * s * (3 - 2 * s));
}
function nl(s, e, t) {
  return s <= e ? 0 : s >= t ? 1 : (s = (s - e) / (t - e), s * s * s * (s * (s * 6 - 15) + 10));
}
function il(s, e) {
  return s + Math.floor(Math.random() * (e - s + 1));
}
function sl(s, e) {
  return s + Math.random() * (e - s);
}
function rl(s) {
  return s * (0.5 - Math.random());
}
function al(s) {
  s !== void 0 && (Wa = s);
  let e = Wa += 1831565813;
  return e = Math.imul(e ^ e >>> 15, e | 1), e ^= e + Math.imul(e ^ e >>> 7, e | 61), ((e ^ e >>> 14) >>> 0) / 4294967296;
}
function ol(s) {
  return s * ki;
}
function cl(s) {
  return s * Wi;
}
function ll(s) {
  return (s & s - 1) === 0 && s !== 0;
}
function hl(s) {
  return Math.pow(2, Math.ceil(Math.log(s) / Math.LN2));
}
function ul(s) {
  return Math.pow(2, Math.floor(Math.log(s) / Math.LN2));
}
function dl(s, e, t, n, i) {
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
function _t(s, e) {
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
const fl = {
  DEG2RAD: ki,
  RAD2DEG: Wi,
  generateUUID: Mn,
  clamp: qt,
  euclideanModulo: va,
  mapLinear: $c,
  inverseLerp: Jc,
  lerp: gs,
  damp: Qc,
  pingpong: el,
  smoothstep: tl,
  smootherstep: nl,
  randInt: il,
  randFloat: sl,
  randFloatSpread: rl,
  seededRandom: al,
  degToRad: ol,
  radToDeg: cl,
  isPowerOfTwo: ll,
  ceilPowerOfTwo: hl,
  floorPowerOfTwo: ul,
  setQuaternionFromProperEuler: dl,
  normalize: _t,
  denormalize: vn
};
class je {
  constructor(e = 0, t = 0) {
    je.prototype.isVector2 = !0, this.x = e, this.y = t;
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
    return Math.acos(qt(n, -1, 1));
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
class Je {
  constructor(e, t, n, i, r, a, o, c, l) {
    Je.prototype.isMatrix3 = !0, this.elements = [
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
    const n = e.elements, i = t.elements, r = this.elements, a = n[0], o = n[3], c = n[6], l = n[1], u = n[4], h = n[7], d = n[2], f = n[5], g = n[8], _ = i[0], p = i[3], m = i[6], T = i[1], S = i[4], A = i[7], F = i[2], C = i[5], I = i[8];
    return r[0] = a * _ + o * T + c * F, r[3] = a * p + o * S + c * C, r[6] = a * m + o * A + c * I, r[1] = l * _ + u * T + h * F, r[4] = l * p + u * S + h * C, r[7] = l * m + u * A + h * I, r[2] = d * _ + f * T + g * F, r[5] = d * p + f * S + g * C, r[8] = d * m + f * A + g * I, this;
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
    const _ = 1 / g;
    return e[0] = h * _, e[1] = (i * l - u * n) * _, e[2] = (o * n - i * a) * _, e[3] = d * _, e[4] = (u * t - i * c) * _, e[5] = (i * r - o * t) * _, e[6] = f * _, e[7] = (n * c - l * t) * _, e[8] = (a * t - n * r) * _, this;
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
    return this.premultiply(Tr.makeScale(e, t)), this;
  }
  rotate(e) {
    return this.premultiply(Tr.makeRotation(-e)), this;
  }
  translate(e, t) {
    return this.premultiply(Tr.makeTranslation(e, t)), this;
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
const Tr = /* @__PURE__ */ new Je();
function hc(s) {
  for (let e = s.length - 1; e >= 0; --e)
    if (s[e] >= 65535) return !0;
  return !1;
}
function _s(s) {
  return document.createElementNS("http://www.w3.org/1999/xhtml", s);
}
function pl() {
  const s = _s("canvas");
  return s.style.display = "block", s;
}
const Xa = {};
function ir(s) {
  s in Xa || (Xa[s] = !0, console.warn(s));
}
function ml(s, e, t) {
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
function gl(s) {
  const e = s.elements;
  e[2] = 0.5 * e[2] + 0.5 * e[3], e[6] = 0.5 * e[6] + 0.5 * e[7], e[10] = 0.5 * e[10] + 0.5 * e[11], e[14] = 0.5 * e[14] + 0.5 * e[15];
}
function _l(s) {
  const e = s.elements;
  e[11] === -1 ? (e[10] = -e[10] - 1, e[14] = -e[14]) : (e[10] = -e[10], e[14] = -e[14] + 1);
}
const qa = /* @__PURE__ */ new Je().set(
  0.8224621,
  0.177538,
  0,
  0.0331941,
  0.9668058,
  0,
  0.0170827,
  0.0723974,
  0.9105199
), ja = /* @__PURE__ */ new Je().set(
  1.2249401,
  -0.2249404,
  0,
  -0.0420569,
  1.0420571,
  0,
  -0.0196376,
  -0.0786361,
  1.0982735
), ss = {
  [Gt]: {
    transfer: ar,
    primaries: or,
    luminanceCoefficients: [0.2126, 0.7152, 0.0722],
    toReference: (s) => s,
    fromReference: (s) => s
  },
  [Rt]: {
    transfer: St,
    primaries: or,
    luminanceCoefficients: [0.2126, 0.7152, 0.0722],
    toReference: (s) => s.convertSRGBToLinear(),
    fromReference: (s) => s.convertLinearToSRGB()
  },
  [ur]: {
    transfer: ar,
    primaries: cr,
    luminanceCoefficients: [0.2289, 0.6917, 0.0793],
    toReference: (s) => s.applyMatrix3(ja),
    fromReference: (s) => s.applyMatrix3(qa)
  },
  [xa]: {
    transfer: St,
    primaries: cr,
    luminanceCoefficients: [0.2289, 0.6917, 0.0793],
    toReference: (s) => s.convertSRGBToLinear().applyMatrix3(ja),
    fromReference: (s) => s.applyMatrix3(qa).convertLinearToSRGB()
  }
}, xl = /* @__PURE__ */ new Set([Gt, ur]), at = {
  enabled: !0,
  _workingColorSpace: Gt,
  get workingColorSpace() {
    return this._workingColorSpace;
  },
  set workingColorSpace(s) {
    if (!xl.has(s))
      throw new Error(`Unsupported working color space, "${s}".`);
    this._workingColorSpace = s;
  },
  convert: function(s, e, t) {
    if (this.enabled === !1 || e === t || !e || !t)
      return s;
    const n = ss[e].toReference, i = ss[t].fromReference;
    return i(n(s));
  },
  fromWorkingColorSpace: function(s, e) {
    return this.convert(s, this._workingColorSpace, e);
  },
  toWorkingColorSpace: function(s, e) {
    return this.convert(s, e, this._workingColorSpace);
  },
  getPrimaries: function(s) {
    return ss[s].primaries;
  },
  getTransfer: function(s) {
    return s === Kn ? ar : ss[s].transfer;
  },
  getLuminanceCoefficients: function(s, e = this._workingColorSpace) {
    return s.fromArray(ss[e].luminanceCoefficients);
  }
};
function zi(s) {
  return s < 0.04045 ? s * 0.0773993808 : Math.pow(s * 0.9478672986 + 0.0521327014, 2.4);
}
function Ar(s) {
  return s < 31308e-7 ? s * 12.92 : 1.055 * Math.pow(s, 0.41666) - 0.055;
}
let Si;
class vl {
  static getDataURL(e) {
    if (/^data:/i.test(e.src) || typeof HTMLCanvasElement > "u")
      return e.src;
    let t;
    if (e instanceof HTMLCanvasElement)
      t = e;
    else {
      Si === void 0 && (Si = _s("canvas")), Si.width = e.width, Si.height = e.height;
      const n = Si.getContext("2d");
      e instanceof ImageData ? n.putImageData(e, 0, 0) : n.drawImage(e, 0, 0, e.width, e.height), t = Si;
    }
    return t.width > 2048 || t.height > 2048 ? (console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons", e), t.toDataURL("image/jpeg", 0.6)) : t.toDataURL("image/png");
  }
  static sRGBToLinear(e) {
    if (typeof HTMLImageElement < "u" && e instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && e instanceof ImageBitmap) {
      const t = _s("canvas");
      t.width = e.width, t.height = e.height;
      const n = t.getContext("2d");
      n.drawImage(e, 0, 0, e.width, e.height);
      const i = n.getImageData(0, 0, e.width, e.height), r = i.data;
      for (let a = 0; a < r.length; a++)
        r[a] = zi(r[a] / 255) * 255;
      return n.putImageData(i, 0, 0), t;
    } else if (e.data) {
      const t = e.data.slice(0);
      for (let n = 0; n < t.length; n++)
        t instanceof Uint8Array || t instanceof Uint8ClampedArray ? t[n] = Math.floor(zi(t[n] / 255) * 255) : t[n] = zi(t[n]);
      return {
        data: t,
        width: e.width,
        height: e.height
      };
    } else
      return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."), e;
  }
}
let Ml = 0;
class uc {
  constructor(e = null) {
    this.isSource = !0, Object.defineProperty(this, "id", { value: Ml++ }), this.uuid = Mn(), this.data = e, this.dataReady = !0, this.version = 0;
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
          i[a].isDataTexture ? r.push(br(i[a].image)) : r.push(br(i[a]));
      } else
        r = br(i);
      n.url = r;
    }
    return t || (e.images[this.uuid] = n), n;
  }
}
function br(s) {
  return typeof HTMLImageElement < "u" && s instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && s instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && s instanceof ImageBitmap ? vl.getDataURL(s) : s.data ? {
    data: Array.from(s.data),
    width: s.width,
    height: s.height,
    type: s.data.constructor.name
  } : (console.warn("THREE.Texture: Unable to serialize Texture."), {});
}
let yl = 0;
class Nt extends xi {
  constructor(e = Nt.DEFAULT_IMAGE, t = Nt.DEFAULT_MAPPING, n = 1001, i = 1001, r = 1006, a = 1008, o = 1023, c = 1009, l = Nt.DEFAULT_ANISOTROPY, u = Kn) {
    super(), this.isTexture = !0, Object.defineProperty(this, "id", { value: yl++ }), this.uuid = Mn(), this.name = "", this.source = new uc(e), this.mipmaps = [], this.mapping = t, this.channel = 0, this.wrapS = n, this.wrapT = i, this.magFilter = r, this.minFilter = a, this.anisotropy = l, this.format = o, this.internalFormat = null, this.type = c, this.offset = new je(0, 0), this.repeat = new je(1, 1), this.center = new je(0, 0), this.rotation = 0, this.matrixAutoUpdate = !0, this.matrix = new Je(), this.generateMipmaps = !0, this.premultiplyAlpha = !1, this.flipY = !0, this.unpackAlignment = 4, this.colorSpace = u, this.userData = {}, this.version = 0, this.onUpdate = null, this.isRenderTargetTexture = !1, this.pmremVersion = 0;
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
Nt.DEFAULT_IMAGE = null;
Nt.DEFAULT_MAPPING = 300;
Nt.DEFAULT_ANISOTROPY = 1;
class ft {
  constructor(e = 0, t = 0, n = 0, i = 1) {
    ft.prototype.isVector4 = !0, this.x = e, this.y = t, this.z = n, this.w = i;
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
    const c = e.elements, l = c[0], u = c[4], h = c[8], d = c[1], f = c[5], g = c[9], _ = c[2], p = c[6], m = c[10];
    if (Math.abs(u - d) < 0.01 && Math.abs(h - _) < 0.01 && Math.abs(g - p) < 0.01) {
      if (Math.abs(u + d) < 0.1 && Math.abs(h + _) < 0.1 && Math.abs(g + p) < 0.1 && Math.abs(l + f + m - 3) < 0.1)
        return this.set(1, 0, 0, 0), this;
      t = Math.PI;
      const S = (l + 1) / 2, A = (f + 1) / 2, F = (m + 1) / 2, C = (u + d) / 4, I = (h + _) / 4, z = (g + p) / 4;
      return S > A && S > F ? S < 0.01 ? (n = 0, i = 0.707106781, r = 0.707106781) : (n = Math.sqrt(S), i = C / n, r = I / n) : A > F ? A < 0.01 ? (n = 0.707106781, i = 0, r = 0.707106781) : (i = Math.sqrt(A), n = C / i, r = z / i) : F < 0.01 ? (n = 0.707106781, i = 0.707106781, r = 0) : (r = Math.sqrt(F), n = I / r, i = z / r), this.set(n, i, r, t), this;
    }
    let T = Math.sqrt((p - g) * (p - g) + (h - _) * (h - _) + (d - u) * (d - u));
    return Math.abs(T) < 1e-3 && (T = 1), this.x = (p - g) / T, this.y = (h - _) / T, this.z = (d - u) / T, this.w = Math.acos((l + f + m - 1) / 2), this;
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
class Sl extends xi {
  constructor(e = 1, t = 1, n = {}) {
    super(), this.isRenderTarget = !0, this.width = e, this.height = t, this.depth = 1, this.scissor = new ft(0, 0, e, t), this.scissorTest = !1, this.viewport = new ft(0, 0, e, t);
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
    const r = new Nt(i, n.mapping, n.wrapS, n.wrapT, n.magFilter, n.minFilter, n.format, n.type, n.anisotropy, n.colorSpace);
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
    return this.texture.source = new uc(t), this.depthBuffer = e.depthBuffer, this.stencilBuffer = e.stencilBuffer, this.resolveDepthBuffer = e.resolveDepthBuffer, this.resolveStencilBuffer = e.resolveStencilBuffer, e.depthTexture !== null && (this.depthTexture = e.depthTexture.clone()), this.samples = e.samples, this;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
}
class _i extends Sl {
  constructor(e = 1, t = 1, n = {}) {
    super(e, t, n), this.isWebGLRenderTarget = !0;
  }
}
class dc extends Nt {
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
class El extends Nt {
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
    const d = r[a + 0], f = r[a + 1], g = r[a + 2], _ = r[a + 3];
    if (o === 0) {
      e[t + 0] = c, e[t + 1] = l, e[t + 2] = u, e[t + 3] = h;
      return;
    }
    if (o === 1) {
      e[t + 0] = d, e[t + 1] = f, e[t + 2] = g, e[t + 3] = _;
      return;
    }
    if (h !== _ || c !== d || l !== f || u !== g) {
      let p = 1 - o;
      const m = c * d + l * f + u * g + h * _, T = m >= 0 ? 1 : -1, S = 1 - m * m;
      if (S > Number.EPSILON) {
        const F = Math.sqrt(S), C = Math.atan2(F, m * T);
        p = Math.sin(p * C) / F, o = Math.sin(o * C) / F;
      }
      const A = o * T;
      if (c = c * p + d * A, l = l * p + f * A, u = u * p + g * A, h = h * p + _ * A, p === 1 - o) {
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
    return 2 * Math.acos(Math.abs(qt(this.dot(e), -1, 1)));
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
    return this.applyQuaternion(Ya.setFromEuler(e));
  }
  applyAxisAngle(e, t) {
    return this.applyQuaternion(Ya.setFromAxisAngle(e, t));
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
    return wr.copy(this).projectOnVector(e), this.sub(wr);
  }
  reflect(e) {
    return this.sub(wr.copy(e).multiplyScalar(2 * this.dot(e)));
  }
  angleTo(e) {
    const t = Math.sqrt(this.lengthSq() * e.lengthSq());
    if (t === 0) return Math.PI / 2;
    const n = this.dot(e) / t;
    return Math.acos(qt(n, -1, 1));
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
const wr = /* @__PURE__ */ new N(), Ya = /* @__PURE__ */ new yn();
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
      this.expandByPoint(gn.fromArray(e, t));
    return this;
  }
  setFromBufferAttribute(e) {
    this.makeEmpty();
    for (let t = 0, n = e.count; t < n; t++)
      this.expandByPoint(gn.fromBufferAttribute(e, t));
    return this;
  }
  setFromPoints(e) {
    this.makeEmpty();
    for (let t = 0, n = e.length; t < n; t++)
      this.expandByPoint(e[t]);
    return this;
  }
  setFromCenterAndSize(e, t) {
    const n = gn.copy(t).multiplyScalar(0.5);
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
          e.isMesh === !0 ? e.getVertexPosition(a, gn) : gn.fromBufferAttribute(r, a), gn.applyMatrix4(e.matrixWorld), this.expandByPoint(gn);
      else
        e.boundingBox !== void 0 ? (e.boundingBox === null && e.computeBoundingBox(), As.copy(e.boundingBox)) : (n.boundingBox === null && n.computeBoundingBox(), As.copy(n.boundingBox)), As.applyMatrix4(e.matrixWorld), this.union(As);
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
    return this.clampPoint(e.center, gn), gn.distanceToSquared(e.center) <= e.radius * e.radius;
  }
  intersectsPlane(e) {
    let t, n;
    return e.normal.x > 0 ? (t = e.normal.x * this.min.x, n = e.normal.x * this.max.x) : (t = e.normal.x * this.max.x, n = e.normal.x * this.min.x), e.normal.y > 0 ? (t += e.normal.y * this.min.y, n += e.normal.y * this.max.y) : (t += e.normal.y * this.max.y, n += e.normal.y * this.min.y), e.normal.z > 0 ? (t += e.normal.z * this.min.z, n += e.normal.z * this.max.z) : (t += e.normal.z * this.max.z, n += e.normal.z * this.min.z), t <= -e.constant && n >= -e.constant;
  }
  intersectsTriangle(e) {
    if (this.isEmpty())
      return !1;
    this.getCenter(rs), bs.subVectors(this.max, rs), Ei.subVectors(e.a, rs), Ti.subVectors(e.b, rs), Ai.subVectors(e.c, rs), Gn.subVectors(Ti, Ei), Hn.subVectors(Ai, Ti), ri.subVectors(Ei, Ai);
    let t = [
      0,
      -Gn.z,
      Gn.y,
      0,
      -Hn.z,
      Hn.y,
      0,
      -ri.z,
      ri.y,
      Gn.z,
      0,
      -Gn.x,
      Hn.z,
      0,
      -Hn.x,
      ri.z,
      0,
      -ri.x,
      -Gn.y,
      Gn.x,
      0,
      -Hn.y,
      Hn.x,
      0,
      -ri.y,
      ri.x,
      0
    ];
    return !Rr(t, Ei, Ti, Ai, bs) || (t = [1, 0, 0, 0, 1, 0, 0, 0, 1], !Rr(t, Ei, Ti, Ai, bs)) ? !1 : (ws.crossVectors(Gn, Hn), t = [ws.x, ws.y, ws.z], Rr(t, Ei, Ti, Ai, bs));
  }
  clampPoint(e, t) {
    return t.copy(e).clamp(this.min, this.max);
  }
  distanceToPoint(e) {
    return this.clampPoint(e, gn).distanceTo(e);
  }
  getBoundingSphere(e) {
    return this.isEmpty() ? e.makeEmpty() : (this.getCenter(e.center), e.radius = this.getSize(gn).length() * 0.5), e;
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
], gn = /* @__PURE__ */ new N(), As = /* @__PURE__ */ new En(), Ei = /* @__PURE__ */ new N(), Ti = /* @__PURE__ */ new N(), Ai = /* @__PURE__ */ new N(), Gn = /* @__PURE__ */ new N(), Hn = /* @__PURE__ */ new N(), ri = /* @__PURE__ */ new N(), rs = /* @__PURE__ */ new N(), bs = /* @__PURE__ */ new N(), ws = /* @__PURE__ */ new N(), ai = /* @__PURE__ */ new N();
function Rr(s, e, t, n, i) {
  for (let r = 0, a = s.length - 3; r <= a; r += 3) {
    ai.fromArray(s, r);
    const o = i.x * Math.abs(ai.x) + i.y * Math.abs(ai.y) + i.z * Math.abs(ai.z), c = e.dot(ai), l = t.dot(ai), u = n.dot(ai);
    if (Math.max(-Math.max(c, l, u), Math.min(c, l, u)) > o)
      return !1;
  }
  return !0;
}
const Tl = /* @__PURE__ */ new En(), as = /* @__PURE__ */ new N(), Cr = /* @__PURE__ */ new N();
class Rn {
  constructor(e = new N(), t = -1) {
    this.isSphere = !0, this.center = e, this.radius = t;
  }
  set(e, t) {
    return this.center.copy(e), this.radius = t, this;
  }
  setFromPoints(e, t) {
    const n = this.center;
    t !== void 0 ? n.copy(t) : Tl.setFromPoints(e).getCenter(n);
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
    as.subVectors(e, this.center);
    const t = as.lengthSq();
    if (t > this.radius * this.radius) {
      const n = Math.sqrt(t), i = (n - this.radius) * 0.5;
      this.center.addScaledVector(as, i / n), this.radius += i;
    }
    return this;
  }
  union(e) {
    return e.isEmpty() ? this : this.isEmpty() ? (this.copy(e), this) : (this.center.equals(e.center) === !0 ? this.radius = Math.max(this.radius, e.radius) : (Cr.subVectors(e.center, this.center).setLength(e.radius), this.expandByPoint(as.copy(e.center).add(Cr)), this.expandByPoint(as.copy(e.center).sub(Cr))), this);
  }
  equals(e) {
    return e.center.equals(this.center) && e.radius === this.radius;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
const Un = /* @__PURE__ */ new N(), Ir = /* @__PURE__ */ new N(), Rs = /* @__PURE__ */ new N(), Vn = /* @__PURE__ */ new N(), Pr = /* @__PURE__ */ new N(), Cs = /* @__PURE__ */ new N(), Lr = /* @__PURE__ */ new N();
class xs {
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
    Ir.copy(e).add(t).multiplyScalar(0.5), Rs.copy(t).sub(e).normalize(), Vn.copy(this.origin).sub(Ir);
    const r = e.distanceTo(t) * 0.5, a = -this.direction.dot(Rs), o = Vn.dot(this.direction), c = -Vn.dot(Rs), l = Vn.lengthSq(), u = Math.abs(1 - a * a);
    let h, d, f, g;
    if (u > 0)
      if (h = a * c - o, d = a * o - c, g = r * u, h >= 0)
        if (d >= -g)
          if (d <= g) {
            const _ = 1 / u;
            h *= _, d *= _, f = h * (h + a * d + 2 * o) + d * (a * h + d + 2 * c) + l;
          } else
            d = r, h = Math.max(0, -(a * d + o)), f = -h * h + d * (d + 2 * c) + l;
        else
          d = -r, h = Math.max(0, -(a * d + o)), f = -h * h + d * (d + 2 * c) + l;
      else
        d <= -g ? (h = Math.max(0, -(-a * r + o)), d = h > 0 ? -r : Math.min(Math.max(-r, -c), r), f = -h * h + d * (d + 2 * c) + l) : d <= g ? (h = 0, d = Math.min(Math.max(-r, -c), r), f = d * (d + 2 * c) + l) : (h = Math.max(0, -(a * r + o)), d = h > 0 ? r : Math.min(Math.max(-r, -c), r), f = -h * h + d * (d + 2 * c) + l);
    else
      d = a > 0 ? -r : r, h = Math.max(0, -(a * d + o)), f = -h * h + d * (d + 2 * c) + l;
    return n && n.copy(this.origin).addScaledVector(this.direction, h), i && i.copy(Ir).addScaledVector(Rs, d), f;
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
    Pr.subVectors(t, e), Cs.subVectors(n, e), Lr.crossVectors(Pr, Cs);
    let a = this.direction.dot(Lr), o;
    if (a > 0) {
      if (i) return null;
      o = 1;
    } else if (a < 0)
      o = -1, a = -a;
    else
      return null;
    Vn.subVectors(this.origin, e);
    const c = o * this.direction.dot(Cs.crossVectors(Vn, Cs));
    if (c < 0)
      return null;
    const l = o * this.direction.dot(Pr.cross(Vn));
    if (l < 0 || c + l > a)
      return null;
    const u = -o * Vn.dot(Lr);
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
class Ye {
  constructor(e, t, n, i, r, a, o, c, l, u, h, d, f, g, _, p) {
    Ye.prototype.isMatrix4 = !0, this.elements = [
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
    ], e !== void 0 && this.set(e, t, n, i, r, a, o, c, l, u, h, d, f, g, _, p);
  }
  set(e, t, n, i, r, a, o, c, l, u, h, d, f, g, _, p) {
    const m = this.elements;
    return m[0] = e, m[4] = t, m[8] = n, m[12] = i, m[1] = r, m[5] = a, m[9] = o, m[13] = c, m[2] = l, m[6] = u, m[10] = h, m[14] = d, m[3] = f, m[7] = g, m[11] = _, m[15] = p, this;
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
    return new Ye().fromArray(this.elements);
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
    const t = this.elements, n = e.elements, i = 1 / bi.setFromMatrixColumn(e, 0).length(), r = 1 / bi.setFromMatrixColumn(e, 1).length(), a = 1 / bi.setFromMatrixColumn(e, 2).length();
    return t[0] = n[0] * i, t[1] = n[1] * i, t[2] = n[2] * i, t[3] = 0, t[4] = n[4] * r, t[5] = n[5] * r, t[6] = n[6] * r, t[7] = 0, t[8] = n[8] * a, t[9] = n[9] * a, t[10] = n[10] * a, t[11] = 0, t[12] = 0, t[13] = 0, t[14] = 0, t[15] = 1, this;
  }
  makeRotationFromEuler(e) {
    const t = this.elements, n = e.x, i = e.y, r = e.z, a = Math.cos(n), o = Math.sin(n), c = Math.cos(i), l = Math.sin(i), u = Math.cos(r), h = Math.sin(r);
    if (e.order === "XYZ") {
      const d = a * u, f = a * h, g = o * u, _ = o * h;
      t[0] = c * u, t[4] = -c * h, t[8] = l, t[1] = f + g * l, t[5] = d - _ * l, t[9] = -o * c, t[2] = _ - d * l, t[6] = g + f * l, t[10] = a * c;
    } else if (e.order === "YXZ") {
      const d = c * u, f = c * h, g = l * u, _ = l * h;
      t[0] = d + _ * o, t[4] = g * o - f, t[8] = a * l, t[1] = a * h, t[5] = a * u, t[9] = -o, t[2] = f * o - g, t[6] = _ + d * o, t[10] = a * c;
    } else if (e.order === "ZXY") {
      const d = c * u, f = c * h, g = l * u, _ = l * h;
      t[0] = d - _ * o, t[4] = -a * h, t[8] = g + f * o, t[1] = f + g * o, t[5] = a * u, t[9] = _ - d * o, t[2] = -a * l, t[6] = o, t[10] = a * c;
    } else if (e.order === "ZYX") {
      const d = a * u, f = a * h, g = o * u, _ = o * h;
      t[0] = c * u, t[4] = g * l - f, t[8] = d * l + _, t[1] = c * h, t[5] = _ * l + d, t[9] = f * l - g, t[2] = -l, t[6] = o * c, t[10] = a * c;
    } else if (e.order === "YZX") {
      const d = a * c, f = a * l, g = o * c, _ = o * l;
      t[0] = c * u, t[4] = _ - d * h, t[8] = g * h + f, t[1] = h, t[5] = a * u, t[9] = -o * u, t[2] = -l * u, t[6] = f * h + g, t[10] = d - _ * h;
    } else if (e.order === "XZY") {
      const d = a * c, f = a * l, g = o * c, _ = o * l;
      t[0] = c * u, t[4] = -h, t[8] = l * u, t[1] = d * h + _, t[5] = a * u, t[9] = f * h - g, t[2] = g * h - f, t[6] = o * u, t[10] = _ * h + d;
    }
    return t[3] = 0, t[7] = 0, t[11] = 0, t[12] = 0, t[13] = 0, t[14] = 0, t[15] = 1, this;
  }
  makeRotationFromQuaternion(e) {
    return this.compose(Al, e, bl);
  }
  lookAt(e, t, n) {
    const i = this.elements;
    return rn.subVectors(e, t), rn.lengthSq() === 0 && (rn.z = 1), rn.normalize(), Wn.crossVectors(n, rn), Wn.lengthSq() === 0 && (Math.abs(n.z) === 1 ? rn.x += 1e-4 : rn.z += 1e-4, rn.normalize(), Wn.crossVectors(n, rn)), Wn.normalize(), Is.crossVectors(rn, Wn), i[0] = Wn.x, i[4] = Is.x, i[8] = rn.x, i[1] = Wn.y, i[5] = Is.y, i[9] = rn.y, i[2] = Wn.z, i[6] = Is.z, i[10] = rn.z, this;
  }
  multiply(e) {
    return this.multiplyMatrices(this, e);
  }
  premultiply(e) {
    return this.multiplyMatrices(e, this);
  }
  multiplyMatrices(e, t) {
    const n = e.elements, i = t.elements, r = this.elements, a = n[0], o = n[4], c = n[8], l = n[12], u = n[1], h = n[5], d = n[9], f = n[13], g = n[2], _ = n[6], p = n[10], m = n[14], T = n[3], S = n[7], A = n[11], F = n[15], C = i[0], I = i[4], z = i[8], Q = i[12], v = i[1], E = i[5], W = i[9], X = i[13], K = i[2], te = i[6], j = i[10], oe = i[14], q = i[3], xe = i[7], ve = i[11], Ae = i[15];
    return r[0] = a * C + o * v + c * K + l * q, r[4] = a * I + o * E + c * te + l * xe, r[8] = a * z + o * W + c * j + l * ve, r[12] = a * Q + o * X + c * oe + l * Ae, r[1] = u * C + h * v + d * K + f * q, r[5] = u * I + h * E + d * te + f * xe, r[9] = u * z + h * W + d * j + f * ve, r[13] = u * Q + h * X + d * oe + f * Ae, r[2] = g * C + _ * v + p * K + m * q, r[6] = g * I + _ * E + p * te + m * xe, r[10] = g * z + _ * W + p * j + m * ve, r[14] = g * Q + _ * X + p * oe + m * Ae, r[3] = T * C + S * v + A * K + F * q, r[7] = T * I + S * E + A * te + F * xe, r[11] = T * z + S * W + A * j + F * ve, r[15] = T * Q + S * X + A * oe + F * Ae, this;
  }
  multiplyScalar(e) {
    const t = this.elements;
    return t[0] *= e, t[4] *= e, t[8] *= e, t[12] *= e, t[1] *= e, t[5] *= e, t[9] *= e, t[13] *= e, t[2] *= e, t[6] *= e, t[10] *= e, t[14] *= e, t[3] *= e, t[7] *= e, t[11] *= e, t[15] *= e, this;
  }
  determinant() {
    const e = this.elements, t = e[0], n = e[4], i = e[8], r = e[12], a = e[1], o = e[5], c = e[9], l = e[13], u = e[2], h = e[6], d = e[10], f = e[14], g = e[3], _ = e[7], p = e[11], m = e[15];
    return g * (+r * c * h - i * l * h - r * o * d + n * l * d + i * o * f - n * c * f) + _ * (+t * c * f - t * l * d + r * a * d - i * a * f + i * l * u - r * c * u) + p * (+t * l * h - t * o * f - r * a * h + n * a * f + r * o * u - n * l * u) + m * (-i * o * u - t * c * h + t * o * d + i * a * h - n * a * d + n * c * u);
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
    const e = this.elements, t = e[0], n = e[1], i = e[2], r = e[3], a = e[4], o = e[5], c = e[6], l = e[7], u = e[8], h = e[9], d = e[10], f = e[11], g = e[12], _ = e[13], p = e[14], m = e[15], T = h * p * l - _ * d * l + _ * c * f - o * p * f - h * c * m + o * d * m, S = g * d * l - u * p * l - g * c * f + a * p * f + u * c * m - a * d * m, A = u * _ * l - g * h * l + g * o * f - a * _ * f - u * o * m + a * h * m, F = g * h * c - u * _ * c - g * o * d + a * _ * d + u * o * p - a * h * p, C = t * T + n * S + i * A + r * F;
    if (C === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    const I = 1 / C;
    return e[0] = T * I, e[1] = (_ * d * r - h * p * r - _ * i * f + n * p * f + h * i * m - n * d * m) * I, e[2] = (o * p * r - _ * c * r + _ * i * l - n * p * l - o * i * m + n * c * m) * I, e[3] = (h * c * r - o * d * r - h * i * l + n * d * l + o * i * f - n * c * f) * I, e[4] = S * I, e[5] = (u * p * r - g * d * r + g * i * f - t * p * f - u * i * m + t * d * m) * I, e[6] = (g * c * r - a * p * r - g * i * l + t * p * l + a * i * m - t * c * m) * I, e[7] = (a * d * r - u * c * r + u * i * l - t * d * l - a * i * f + t * c * f) * I, e[8] = A * I, e[9] = (g * h * r - u * _ * r - g * n * f + t * _ * f + u * n * m - t * h * m) * I, e[10] = (a * _ * r - g * o * r + g * n * l - t * _ * l - a * n * m + t * o * m) * I, e[11] = (u * o * r - a * h * r - u * n * l + t * h * l + a * n * f - t * o * f) * I, e[12] = F * I, e[13] = (u * _ * i - g * h * i + g * n * d - t * _ * d - u * n * p + t * h * p) * I, e[14] = (g * o * i - a * _ * i - g * n * c + t * _ * c + a * n * p - t * o * p) * I, e[15] = (a * h * i - u * o * i + u * n * c - t * h * c - a * n * d + t * o * d) * I, this;
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
    const i = this.elements, r = t._x, a = t._y, o = t._z, c = t._w, l = r + r, u = a + a, h = o + o, d = r * l, f = r * u, g = r * h, _ = a * u, p = a * h, m = o * h, T = c * l, S = c * u, A = c * h, F = n.x, C = n.y, I = n.z;
    return i[0] = (1 - (_ + m)) * F, i[1] = (f + A) * F, i[2] = (g - S) * F, i[3] = 0, i[4] = (f - A) * C, i[5] = (1 - (d + m)) * C, i[6] = (p + T) * C, i[7] = 0, i[8] = (g + S) * I, i[9] = (p - T) * I, i[10] = (1 - (d + _)) * I, i[11] = 0, i[12] = e.x, i[13] = e.y, i[14] = e.z, i[15] = 1, this;
  }
  decompose(e, t, n) {
    const i = this.elements;
    let r = bi.set(i[0], i[1], i[2]).length();
    const a = bi.set(i[4], i[5], i[6]).length(), o = bi.set(i[8], i[9], i[10]).length();
    this.determinant() < 0 && (r = -r), e.x = i[12], e.y = i[13], e.z = i[14], _n.copy(this);
    const l = 1 / r, u = 1 / a, h = 1 / o;
    return _n.elements[0] *= l, _n.elements[1] *= l, _n.elements[2] *= l, _n.elements[4] *= u, _n.elements[5] *= u, _n.elements[6] *= u, _n.elements[8] *= h, _n.elements[9] *= h, _n.elements[10] *= h, t.setFromRotationMatrix(_n), n.x = r, n.y = a, n.z = o, this;
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
    let g, _;
    if (o === 2e3)
      g = (a + r) * h, _ = -2 * h;
    else if (o === 2001)
      g = r * h, _ = -1 * h;
    else
      throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: " + o);
    return c[0] = 2 * l, c[4] = 0, c[8] = 0, c[12] = -d, c[1] = 0, c[5] = 2 * u, c[9] = 0, c[13] = -f, c[2] = 0, c[6] = 0, c[10] = _, c[14] = -g, c[3] = 0, c[7] = 0, c[11] = 0, c[15] = 1, this;
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
const bi = /* @__PURE__ */ new N(), _n = /* @__PURE__ */ new Ye(), Al = /* @__PURE__ */ new N(0, 0, 0), bl = /* @__PURE__ */ new N(1, 1, 1), Wn = /* @__PURE__ */ new N(), Is = /* @__PURE__ */ new N(), rn = /* @__PURE__ */ new N(), Ka = /* @__PURE__ */ new Ye(), Za = /* @__PURE__ */ new yn();
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
        this._y = Math.asin(qt(o, -1, 1)), Math.abs(o) < 0.9999999 ? (this._x = Math.atan2(-u, f), this._z = Math.atan2(-a, r)) : (this._x = Math.atan2(d, l), this._z = 0);
        break;
      case "YXZ":
        this._x = Math.asin(-qt(u, -1, 1)), Math.abs(u) < 0.9999999 ? (this._y = Math.atan2(o, f), this._z = Math.atan2(c, l)) : (this._y = Math.atan2(-h, r), this._z = 0);
        break;
      case "ZXY":
        this._x = Math.asin(qt(d, -1, 1)), Math.abs(d) < 0.9999999 ? (this._y = Math.atan2(-h, f), this._z = Math.atan2(-a, l)) : (this._y = 0, this._z = Math.atan2(c, r));
        break;
      case "ZYX":
        this._y = Math.asin(-qt(h, -1, 1)), Math.abs(h) < 0.9999999 ? (this._x = Math.atan2(d, f), this._z = Math.atan2(c, r)) : (this._x = 0, this._z = Math.atan2(-a, l));
        break;
      case "YZX":
        this._z = Math.asin(qt(c, -1, 1)), Math.abs(c) < 0.9999999 ? (this._x = Math.atan2(-u, l), this._y = Math.atan2(-h, r)) : (this._x = 0, this._y = Math.atan2(o, f));
        break;
      case "XZY":
        this._z = Math.asin(-qt(a, -1, 1)), Math.abs(a) < 0.9999999 ? (this._x = Math.atan2(d, l), this._y = Math.atan2(o, r)) : (this._x = Math.atan2(-u, f), this._y = 0);
        break;
      default:
        console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: " + t);
    }
    return this._order = t, n === !0 && this._onChangeCallback(), this;
  }
  setFromQuaternion(e, t, n) {
    return Ka.makeRotationFromQuaternion(e), this.setFromRotationMatrix(Ka, t, n);
  }
  setFromVector3(e, t = this._order) {
    return this.set(e.x, e.y, e.z, t);
  }
  reorder(e) {
    return Za.setFromEuler(this), this.setFromQuaternion(Za, e);
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
class Ma {
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
let wl = 0;
const $a = /* @__PURE__ */ new N(), wi = /* @__PURE__ */ new yn(), Nn = /* @__PURE__ */ new Ye(), Ps = /* @__PURE__ */ new N(), os = /* @__PURE__ */ new N(), Rl = /* @__PURE__ */ new N(), Cl = /* @__PURE__ */ new yn(), Ja = /* @__PURE__ */ new N(1, 0, 0), Qa = /* @__PURE__ */ new N(0, 1, 0), eo = /* @__PURE__ */ new N(0, 0, 1), to = { type: "added" }, Il = { type: "removed" }, Ri = { type: "childadded", child: null }, Dr = { type: "childremoved", child: null };
class bt extends xi {
  constructor() {
    super(), this.isObject3D = !0, Object.defineProperty(this, "id", { value: wl++ }), this.uuid = Mn(), this.name = "", this.type = "Object3D", this.parent = null, this.children = [], this.up = bt.DEFAULT_UP.clone();
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
        value: new Ye()
      },
      normalMatrix: {
        value: new Je()
      }
    }), this.matrix = new Ye(), this.matrixWorld = new Ye(), this.matrixAutoUpdate = bt.DEFAULT_MATRIX_AUTO_UPDATE, this.matrixWorldAutoUpdate = bt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE, this.matrixWorldNeedsUpdate = !1, this.layers = new Ma(), this.visible = !0, this.castShadow = !1, this.receiveShadow = !1, this.frustumCulled = !0, this.renderOrder = 0, this.animations = [], this.userData = {};
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
    return wi.setFromAxisAngle(e, t), this.quaternion.multiply(wi), this;
  }
  rotateOnWorldAxis(e, t) {
    return wi.setFromAxisAngle(e, t), this.quaternion.premultiply(wi), this;
  }
  rotateX(e) {
    return this.rotateOnAxis(Ja, e);
  }
  rotateY(e) {
    return this.rotateOnAxis(Qa, e);
  }
  rotateZ(e) {
    return this.rotateOnAxis(eo, e);
  }
  translateOnAxis(e, t) {
    return $a.copy(e).applyQuaternion(this.quaternion), this.position.add($a.multiplyScalar(t)), this;
  }
  translateX(e) {
    return this.translateOnAxis(Ja, e);
  }
  translateY(e) {
    return this.translateOnAxis(Qa, e);
  }
  translateZ(e) {
    return this.translateOnAxis(eo, e);
  }
  localToWorld(e) {
    return this.updateWorldMatrix(!0, !1), e.applyMatrix4(this.matrixWorld);
  }
  worldToLocal(e) {
    return this.updateWorldMatrix(!0, !1), e.applyMatrix4(Nn.copy(this.matrixWorld).invert());
  }
  lookAt(e, t, n) {
    e.isVector3 ? Ps.copy(e) : Ps.set(e, t, n);
    const i = this.parent;
    this.updateWorldMatrix(!0, !1), os.setFromMatrixPosition(this.matrixWorld), this.isCamera || this.isLight ? Nn.lookAt(os, Ps, this.up) : Nn.lookAt(Ps, os, this.up), this.quaternion.setFromRotationMatrix(Nn), i && (Nn.extractRotation(i.matrixWorld), wi.setFromRotationMatrix(Nn), this.quaternion.premultiply(wi.invert()));
  }
  add(e) {
    if (arguments.length > 1) {
      for (let t = 0; t < arguments.length; t++)
        this.add(arguments[t]);
      return this;
    }
    return e === this ? (console.error("THREE.Object3D.add: object can't be added as a child of itself.", e), this) : (e && e.isObject3D ? (e.removeFromParent(), e.parent = this, this.children.push(e), e.dispatchEvent(to), Ri.child = e, this.dispatchEvent(Ri), Ri.child = null) : console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", e), this);
  }
  remove(e) {
    if (arguments.length > 1) {
      for (let n = 0; n < arguments.length; n++)
        this.remove(arguments[n]);
      return this;
    }
    const t = this.children.indexOf(e);
    return t !== -1 && (e.parent = null, this.children.splice(t, 1), e.dispatchEvent(Il), Dr.child = e, this.dispatchEvent(Dr), Dr.child = null), this;
  }
  removeFromParent() {
    const e = this.parent;
    return e !== null && e.remove(this), this;
  }
  clear() {
    return this.remove(...this.children);
  }
  attach(e) {
    return this.updateWorldMatrix(!0, !1), Nn.copy(this.matrixWorld).invert(), e.parent !== null && (e.parent.updateWorldMatrix(!0, !1), Nn.multiply(e.parent.matrixWorld)), e.applyMatrix4(Nn), e.removeFromParent(), e.parent = this, this.children.push(e), e.updateWorldMatrix(!1, !0), e.dispatchEvent(to), Ri.child = e, this.dispatchEvent(Ri), Ri.child = null, this;
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
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(os, e, Rl), e;
  }
  getWorldScale(e) {
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(os, Cl, e), e;
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
bt.DEFAULT_UP = /* @__PURE__ */ new N(0, 1, 0);
bt.DEFAULT_MATRIX_AUTO_UPDATE = !0;
bt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = !0;
const xn = /* @__PURE__ */ new N(), Fn = /* @__PURE__ */ new N(), Ur = /* @__PURE__ */ new N(), Bn = /* @__PURE__ */ new N(), Ci = /* @__PURE__ */ new N(), Ii = /* @__PURE__ */ new N(), no = /* @__PURE__ */ new N(), Nr = /* @__PURE__ */ new N(), Fr = /* @__PURE__ */ new N(), Br = /* @__PURE__ */ new N(), Or = /* @__PURE__ */ new ft(), kr = /* @__PURE__ */ new ft(), zr = /* @__PURE__ */ new ft();
class fn {
  constructor(e = new N(), t = new N(), n = new N()) {
    this.a = e, this.b = t, this.c = n;
  }
  static getNormal(e, t, n, i) {
    i.subVectors(n, t), xn.subVectors(e, t), i.cross(xn);
    const r = i.lengthSq();
    return r > 0 ? i.multiplyScalar(1 / Math.sqrt(r)) : i.set(0, 0, 0);
  }
  // static/instance method to calculate barycentric coordinates
  // based on: http://www.blackpawn.com/texts/pointinpoly/default.html
  static getBarycoord(e, t, n, i, r) {
    xn.subVectors(i, t), Fn.subVectors(n, t), Ur.subVectors(e, t);
    const a = xn.dot(xn), o = xn.dot(Fn), c = xn.dot(Ur), l = Fn.dot(Fn), u = Fn.dot(Ur), h = a * l - o * o;
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
    return Or.setScalar(0), kr.setScalar(0), zr.setScalar(0), Or.fromBufferAttribute(e, t), kr.fromBufferAttribute(e, n), zr.fromBufferAttribute(e, i), a.setScalar(0), a.addScaledVector(Or, r.x), a.addScaledVector(kr, r.y), a.addScaledVector(zr, r.z), a;
  }
  static isFrontFacing(e, t, n, i) {
    return xn.subVectors(n, t), Fn.subVectors(e, t), xn.cross(Fn).dot(i) < 0;
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
    return xn.subVectors(this.c, this.b), Fn.subVectors(this.a, this.b), xn.cross(Fn).length() * 0.5;
  }
  getMidpoint(e) {
    return e.addVectors(this.a, this.b).add(this.c).multiplyScalar(1 / 3);
  }
  getNormal(e) {
    return fn.getNormal(this.a, this.b, this.c, e);
  }
  getPlane(e) {
    return e.setFromCoplanarPoints(this.a, this.b, this.c);
  }
  getBarycoord(e, t) {
    return fn.getBarycoord(e, this.a, this.b, this.c, t);
  }
  getInterpolation(e, t, n, i, r) {
    return fn.getInterpolation(e, this.a, this.b, this.c, t, n, i, r);
  }
  containsPoint(e) {
    return fn.containsPoint(e, this.a, this.b, this.c);
  }
  isFrontFacing(e) {
    return fn.isFrontFacing(this.a, this.b, this.c, e);
  }
  intersectsBox(e) {
    return e.intersectsTriangle(this);
  }
  closestPointToPoint(e, t) {
    const n = this.a, i = this.b, r = this.c;
    let a, o;
    Ci.subVectors(i, n), Ii.subVectors(r, n), Nr.subVectors(e, n);
    const c = Ci.dot(Nr), l = Ii.dot(Nr);
    if (c <= 0 && l <= 0)
      return t.copy(n);
    Fr.subVectors(e, i);
    const u = Ci.dot(Fr), h = Ii.dot(Fr);
    if (u >= 0 && h <= u)
      return t.copy(i);
    const d = c * h - u * l;
    if (d <= 0 && c >= 0 && u <= 0)
      return a = c / (c - u), t.copy(n).addScaledVector(Ci, a);
    Br.subVectors(e, r);
    const f = Ci.dot(Br), g = Ii.dot(Br);
    if (g >= 0 && f <= g)
      return t.copy(r);
    const _ = f * l - c * g;
    if (_ <= 0 && l >= 0 && g <= 0)
      return o = l / (l - g), t.copy(n).addScaledVector(Ii, o);
    const p = u * g - f * h;
    if (p <= 0 && h - u >= 0 && f - g >= 0)
      return no.subVectors(r, i), o = (h - u) / (h - u + (f - g)), t.copy(i).addScaledVector(no, o);
    const m = 1 / (p + _ + d);
    return a = _ * m, o = d * m, t.copy(n).addScaledVector(Ci, a).addScaledVector(Ii, o);
  }
  equals(e) {
    return e.a.equals(this.a) && e.b.equals(this.b) && e.c.equals(this.c);
  }
}
const fc = {
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
}, Xn = { h: 0, s: 0, l: 0 }, Ls = { h: 0, s: 0, l: 0 };
function Gr(s, e, t) {
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
  setHex(e, t = Rt) {
    return e = Math.floor(e), this.r = (e >> 16 & 255) / 255, this.g = (e >> 8 & 255) / 255, this.b = (e & 255) / 255, at.toWorkingColorSpace(this, t), this;
  }
  setRGB(e, t, n, i = at.workingColorSpace) {
    return this.r = e, this.g = t, this.b = n, at.toWorkingColorSpace(this, i), this;
  }
  setHSL(e, t, n, i = at.workingColorSpace) {
    if (e = va(e, 1), t = qt(t, 0, 1), n = qt(n, 0, 1), t === 0)
      this.r = this.g = this.b = n;
    else {
      const r = n <= 0.5 ? n * (1 + t) : n + t - n * t, a = 2 * n - r;
      this.r = Gr(a, r, e + 1 / 3), this.g = Gr(a, r, e), this.b = Gr(a, r, e - 1 / 3);
    }
    return at.toWorkingColorSpace(this, i), this;
  }
  setStyle(e, t = Rt) {
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
  setColorName(e, t = Rt) {
    const n = fc[e.toLowerCase()];
    return n !== void 0 ? this.setHex(n, t) : console.warn("THREE.Color: Unknown color " + e), this;
  }
  clone() {
    return new this.constructor(this.r, this.g, this.b);
  }
  copy(e) {
    return this.r = e.r, this.g = e.g, this.b = e.b, this;
  }
  copySRGBToLinear(e) {
    return this.r = zi(e.r), this.g = zi(e.g), this.b = zi(e.b), this;
  }
  copyLinearToSRGB(e) {
    return this.r = Ar(e.r), this.g = Ar(e.g), this.b = Ar(e.b), this;
  }
  convertSRGBToLinear() {
    return this.copySRGBToLinear(this), this;
  }
  convertLinearToSRGB() {
    return this.copyLinearToSRGB(this), this;
  }
  getHex(e = Rt) {
    return at.fromWorkingColorSpace(Xt.copy(this), e), Math.round(qt(Xt.r * 255, 0, 255)) * 65536 + Math.round(qt(Xt.g * 255, 0, 255)) * 256 + Math.round(qt(Xt.b * 255, 0, 255));
  }
  getHexString(e = Rt) {
    return ("000000" + this.getHex(e).toString(16)).slice(-6);
  }
  getHSL(e, t = at.workingColorSpace) {
    at.fromWorkingColorSpace(Xt.copy(this), t);
    const n = Xt.r, i = Xt.g, r = Xt.b, a = Math.max(n, i, r), o = Math.min(n, i, r);
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
    return at.fromWorkingColorSpace(Xt.copy(this), t), e.r = Xt.r, e.g = Xt.g, e.b = Xt.b, e;
  }
  getStyle(e = Rt) {
    at.fromWorkingColorSpace(Xt.copy(this), e);
    const t = Xt.r, n = Xt.g, i = Xt.b;
    return e !== Rt ? `color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})` : `rgb(${Math.round(t * 255)},${Math.round(n * 255)},${Math.round(i * 255)})`;
  }
  offsetHSL(e, t, n) {
    return this.getHSL(Xn), this.setHSL(Xn.h + e, Xn.s + t, Xn.l + n);
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
    this.getHSL(Xn), e.getHSL(Ls);
    const n = gs(Xn.h, Ls.h, t), i = gs(Xn.s, Ls.s, t), r = gs(Xn.l, Ls.l, t);
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
const Xt = /* @__PURE__ */ new Pe();
Pe.NAMES = fc;
let Pl = 0;
class on extends xi {
  constructor() {
    super(), this.isMaterial = !0, Object.defineProperty(this, "id", { value: Pl++ }), this.uuid = Mn(), this.name = "", this.type = "Material", this.blending = 1, this.side = 0, this.vertexColors = !1, this.opacity = 1, this.transparent = !1, this.alphaHash = !1, this.blendSrc = 204, this.blendDst = 205, this.blendEquation = 100, this.blendSrcAlpha = null, this.blendDstAlpha = null, this.blendEquationAlpha = null, this.blendColor = new Pe(0, 0, 0), this.blendAlpha = 0, this.depthFunc = 3, this.depthTest = !0, this.depthWrite = !0, this.stencilWriteMask = 255, this.stencilFunc = 519, this.stencilRef = 0, this.stencilFuncMask = 255, this.stencilFail = 7680, this.stencilZFail = 7680, this.stencilZPass = 7680, this.stencilWrite = !1, this.clippingPlanes = null, this.clipIntersection = !1, this.clipShadows = !1, this.shadowSide = null, this.colorWrite = !0, this.precision = null, this.polygonOffset = !1, this.polygonOffsetFactor = 0, this.polygonOffsetUnits = 0, this.dithering = !1, this.alphaToCoverage = !1, this.premultipliedAlpha = !1, this.forceSinglePass = !1, this.visible = !0, this.toneMapped = !0, this.userData = {}, this.version = 0, this._alphaTest = 0;
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
class At extends on {
  constructor(e) {
    super(), this.isMeshBasicMaterial = !0, this.type = "MeshBasicMaterial", this.color = new Pe(16777215), this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new Sn(), this.combine = 0, this.reflectivity = 1, this.refractionRatio = 0.98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.specularMap = e.specularMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapRotation.copy(e.envMapRotation), this.combine = e.combine, this.reflectivity = e.reflectivity, this.refractionRatio = e.refractionRatio, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.fog = e.fog, this;
  }
}
const Pt = /* @__PURE__ */ new N(), Ds = /* @__PURE__ */ new je();
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
        Ds.fromBufferAttribute(this, t), Ds.applyMatrix3(e), this.setXY(t, Ds.x, Ds.y);
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
    return this.normalized && (n = _t(n, this.array)), this.array[e * this.itemSize + t] = n, this;
  }
  getX(e) {
    let t = this.array[e * this.itemSize];
    return this.normalized && (t = vn(t, this.array)), t;
  }
  setX(e, t) {
    return this.normalized && (t = _t(t, this.array)), this.array[e * this.itemSize] = t, this;
  }
  getY(e) {
    let t = this.array[e * this.itemSize + 1];
    return this.normalized && (t = vn(t, this.array)), t;
  }
  setY(e, t) {
    return this.normalized && (t = _t(t, this.array)), this.array[e * this.itemSize + 1] = t, this;
  }
  getZ(e) {
    let t = this.array[e * this.itemSize + 2];
    return this.normalized && (t = vn(t, this.array)), t;
  }
  setZ(e, t) {
    return this.normalized && (t = _t(t, this.array)), this.array[e * this.itemSize + 2] = t, this;
  }
  getW(e) {
    let t = this.array[e * this.itemSize + 3];
    return this.normalized && (t = vn(t, this.array)), t;
  }
  setW(e, t) {
    return this.normalized && (t = _t(t, this.array)), this.array[e * this.itemSize + 3] = t, this;
  }
  setXY(e, t, n) {
    return e *= this.itemSize, this.normalized && (t = _t(t, this.array), n = _t(n, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this;
  }
  setXYZ(e, t, n, i) {
    return e *= this.itemSize, this.normalized && (t = _t(t, this.array), n = _t(n, this.array), i = _t(i, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this.array[e + 2] = i, this;
  }
  setXYZW(e, t, n, i, r) {
    return e *= this.itemSize, this.normalized && (t = _t(t, this.array), n = _t(n, this.array), i = _t(i, this.array), r = _t(r, this.array)), this.array[e + 0] = t, this.array[e + 1] = n, this.array[e + 2] = i, this.array[e + 3] = r, this;
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
class pc extends Jt {
  constructor(e, t, n) {
    super(new Uint16Array(e), t, n);
  }
}
class mc extends Jt {
  constructor(e, t, n) {
    super(new Uint32Array(e), t, n);
  }
}
class pt extends Jt {
  constructor(e, t, n) {
    super(new Float32Array(e), t, n);
  }
}
let Ll = 0;
const hn = /* @__PURE__ */ new Ye(), Hr = /* @__PURE__ */ new bt(), Pi = /* @__PURE__ */ new N(), an = /* @__PURE__ */ new En(), cs = /* @__PURE__ */ new En(), kt = /* @__PURE__ */ new N();
class It extends xi {
  constructor() {
    super(), this.isBufferGeometry = !0, Object.defineProperty(this, "id", { value: Ll++ }), this.uuid = Mn(), this.name = "", this.type = "BufferGeometry", this.index = null, this.attributes = {}, this.morphAttributes = {}, this.morphTargetsRelative = !1, this.groups = [], this.boundingBox = null, this.boundingSphere = null, this.drawRange = { start: 0, count: 1 / 0 }, this.userData = {};
  }
  getIndex() {
    return this.index;
  }
  setIndex(e) {
    return Array.isArray(e) ? this.index = new (hc(e) ? mc : pc)(e, 1) : this.index = e, this;
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
      const r = new Je().getNormalMatrix(e);
      n.applyNormalMatrix(r), n.needsUpdate = !0;
    }
    const i = this.attributes.tangent;
    return i !== void 0 && (i.transformDirection(e), i.needsUpdate = !0), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this;
  }
  applyQuaternion(e) {
    return hn.makeRotationFromQuaternion(e), this.applyMatrix4(hn), this;
  }
  rotateX(e) {
    return hn.makeRotationX(e), this.applyMatrix4(hn), this;
  }
  rotateY(e) {
    return hn.makeRotationY(e), this.applyMatrix4(hn), this;
  }
  rotateZ(e) {
    return hn.makeRotationZ(e), this.applyMatrix4(hn), this;
  }
  translate(e, t, n) {
    return hn.makeTranslation(e, t, n), this.applyMatrix4(hn), this;
  }
  scale(e, t, n) {
    return hn.makeScale(e, t, n), this.applyMatrix4(hn), this;
  }
  lookAt(e) {
    return Hr.lookAt(e), Hr.updateMatrix(), this.applyMatrix4(Hr.matrix), this;
  }
  center() {
    return this.computeBoundingBox(), this.boundingBox.getCenter(Pi).negate(), this.translate(Pi.x, Pi.y, Pi.z), this;
  }
  setFromPoints(e) {
    const t = [];
    for (let n = 0, i = e.length; n < i; n++) {
      const r = e[n];
      t.push(r.x, r.y, r.z || 0);
    }
    return this.setAttribute("position", new pt(t, 3)), this;
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
          an.setFromBufferAttribute(r), this.morphTargetsRelative ? (kt.addVectors(this.boundingBox.min, an.min), this.boundingBox.expandByPoint(kt), kt.addVectors(this.boundingBox.max, an.max), this.boundingBox.expandByPoint(kt)) : (this.boundingBox.expandByPoint(an.min), this.boundingBox.expandByPoint(an.max));
        }
    } else
      this.boundingBox.makeEmpty();
    (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) && console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this);
  }
  computeBoundingSphere() {
    this.boundingSphere === null && (this.boundingSphere = new Rn());
    const e = this.attributes.position, t = this.morphAttributes.position;
    if (e && e.isGLBufferAttribute) {
      console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.", this), this.boundingSphere.set(new N(), 1 / 0);
      return;
    }
    if (e) {
      const n = this.boundingSphere.center;
      if (an.setFromBufferAttribute(e), t)
        for (let r = 0, a = t.length; r < a; r++) {
          const o = t[r];
          cs.setFromBufferAttribute(o), this.morphTargetsRelative ? (kt.addVectors(an.min, cs.min), an.expandByPoint(kt), kt.addVectors(an.max, cs.max), an.expandByPoint(kt)) : (an.expandByPoint(cs.min), an.expandByPoint(cs.max));
        }
      an.getCenter(n);
      let i = 0;
      for (let r = 0, a = e.count; r < a; r++)
        kt.fromBufferAttribute(e, r), i = Math.max(i, n.distanceToSquared(kt));
      if (t)
        for (let r = 0, a = t.length; r < a; r++) {
          const o = t[r], c = this.morphTargetsRelative;
          for (let l = 0, u = o.count; l < u; l++)
            kt.fromBufferAttribute(o, l), c && (Pi.fromBufferAttribute(e, l), kt.add(Pi)), i = Math.max(i, n.distanceToSquared(kt));
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
    const l = new N(), u = new N(), h = new N(), d = new je(), f = new je(), g = new je(), _ = new N(), p = new N();
    function m(z, Q, v) {
      l.fromBufferAttribute(n, z), u.fromBufferAttribute(n, Q), h.fromBufferAttribute(n, v), d.fromBufferAttribute(r, z), f.fromBufferAttribute(r, Q), g.fromBufferAttribute(r, v), u.sub(l), h.sub(l), f.sub(d), g.sub(d);
      const E = 1 / (f.x * g.y - g.x * f.y);
      isFinite(E) && (_.copy(u).multiplyScalar(g.y).addScaledVector(h, -f.y).multiplyScalar(E), p.copy(h).multiplyScalar(f.x).addScaledVector(u, -g.x).multiplyScalar(E), o[z].add(_), o[Q].add(_), o[v].add(_), c[z].add(p), c[Q].add(p), c[v].add(p));
    }
    let T = this.groups;
    T.length === 0 && (T = [{
      start: 0,
      count: e.count
    }]);
    for (let z = 0, Q = T.length; z < Q; ++z) {
      const v = T[z], E = v.start, W = v.count;
      for (let X = E, K = E + W; X < K; X += 3)
        m(
          e.getX(X + 0),
          e.getX(X + 1),
          e.getX(X + 2)
        );
    }
    const S = new N(), A = new N(), F = new N(), C = new N();
    function I(z) {
      F.fromBufferAttribute(i, z), C.copy(F);
      const Q = o[z];
      S.copy(Q), S.sub(F.multiplyScalar(F.dot(Q))).normalize(), A.crossVectors(C, Q);
      const E = A.dot(c[z]) < 0 ? -1 : 1;
      a.setXYZW(z, S.x, S.y, S.z, E);
    }
    for (let z = 0, Q = T.length; z < Q; ++z) {
      const v = T[z], E = v.start, W = v.count;
      for (let X = E, K = E + W; X < K; X += 3)
        I(e.getX(X + 0)), I(e.getX(X + 1)), I(e.getX(X + 2));
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
          const g = e.getX(d + 0), _ = e.getX(d + 1), p = e.getX(d + 2);
          i.fromBufferAttribute(t, g), r.fromBufferAttribute(t, _), a.fromBufferAttribute(t, p), u.subVectors(a, r), h.subVectors(i, r), u.cross(h), o.fromBufferAttribute(n, g), c.fromBufferAttribute(n, _), l.fromBufferAttribute(n, p), o.add(u), c.add(u), l.add(u), n.setXYZ(g, o.x, o.y, o.z), n.setXYZ(_, c.x, c.y, c.z), n.setXYZ(p, l.x, l.y, l.z);
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
      for (let _ = 0, p = c.length; _ < p; _++) {
        o.isInterleavedBufferAttribute ? f = c[_] * o.data.stride + o.offset : f = c[_] * u;
        for (let m = 0; m < u; m++)
          d[g++] = l[f++];
      }
      return new Jt(d, u, h);
    }
    if (this.index === null)
      return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."), this;
    const t = new It(), n = this.index.array, i = this.attributes;
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
const io = /* @__PURE__ */ new Ye(), oi = /* @__PURE__ */ new xs(), Us = /* @__PURE__ */ new Rn(), so = /* @__PURE__ */ new N(), Ns = /* @__PURE__ */ new N(), Fs = /* @__PURE__ */ new N(), Bs = /* @__PURE__ */ new N(), Vr = /* @__PURE__ */ new N(), Os = /* @__PURE__ */ new N(), ro = /* @__PURE__ */ new N(), ks = /* @__PURE__ */ new N();
class Le extends bt {
  constructor(e = new It(), t = new At()) {
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
      Os.set(0, 0, 0);
      for (let c = 0, l = r.length; c < l; c++) {
        const u = o[c], h = r[c];
        u !== 0 && (Vr.fromBufferAttribute(h, e), a ? Os.addScaledVector(Vr, u) : Os.addScaledVector(Vr.sub(t), u));
      }
      t.add(Os);
    }
    return t;
  }
  raycast(e, t) {
    const n = this.geometry, i = this.material, r = this.matrixWorld;
    i !== void 0 && (n.boundingSphere === null && n.computeBoundingSphere(), Us.copy(n.boundingSphere), Us.applyMatrix4(r), oi.copy(e.ray).recast(e.near), !(Us.containsPoint(oi.origin) === !1 && (oi.intersectSphere(Us, so) === null || oi.origin.distanceToSquared(so) > (e.far - e.near) ** 2)) && (io.copy(r).invert(), oi.copy(e.ray).applyMatrix4(io), !(n.boundingBox !== null && oi.intersectsBox(n.boundingBox) === !1) && this._computeIntersections(e, t, oi)));
  }
  _computeIntersections(e, t, n) {
    let i;
    const r = this.geometry, a = this.material, o = r.index, c = r.attributes.position, l = r.attributes.uv, u = r.attributes.uv1, h = r.attributes.normal, d = r.groups, f = r.drawRange;
    if (o !== null)
      if (Array.isArray(a))
        for (let g = 0, _ = d.length; g < _; g++) {
          const p = d[g], m = a[p.materialIndex], T = Math.max(p.start, f.start), S = Math.min(o.count, Math.min(p.start + p.count, f.start + f.count));
          for (let A = T, F = S; A < F; A += 3) {
            const C = o.getX(A), I = o.getX(A + 1), z = o.getX(A + 2);
            i = zs(this, m, e, n, l, u, h, C, I, z), i && (i.faceIndex = Math.floor(A / 3), i.face.materialIndex = p.materialIndex, t.push(i));
          }
        }
      else {
        const g = Math.max(0, f.start), _ = Math.min(o.count, f.start + f.count);
        for (let p = g, m = _; p < m; p += 3) {
          const T = o.getX(p), S = o.getX(p + 1), A = o.getX(p + 2);
          i = zs(this, a, e, n, l, u, h, T, S, A), i && (i.faceIndex = Math.floor(p / 3), t.push(i));
        }
      }
    else if (c !== void 0)
      if (Array.isArray(a))
        for (let g = 0, _ = d.length; g < _; g++) {
          const p = d[g], m = a[p.materialIndex], T = Math.max(p.start, f.start), S = Math.min(c.count, Math.min(p.start + p.count, f.start + f.count));
          for (let A = T, F = S; A < F; A += 3) {
            const C = A, I = A + 1, z = A + 2;
            i = zs(this, m, e, n, l, u, h, C, I, z), i && (i.faceIndex = Math.floor(A / 3), i.face.materialIndex = p.materialIndex, t.push(i));
          }
        }
      else {
        const g = Math.max(0, f.start), _ = Math.min(c.count, f.start + f.count);
        for (let p = g, m = _; p < m; p += 3) {
          const T = p, S = p + 1, A = p + 2;
          i = zs(this, a, e, n, l, u, h, T, S, A), i && (i.faceIndex = Math.floor(p / 3), t.push(i));
        }
      }
  }
}
function Dl(s, e, t, n, i, r, a, o) {
  let c;
  if (e.side === 1 ? c = n.intersectTriangle(a, r, i, !0, o) : c = n.intersectTriangle(i, r, a, e.side === 0, o), c === null) return null;
  ks.copy(o), ks.applyMatrix4(s.matrixWorld);
  const l = t.ray.origin.distanceTo(ks);
  return l < t.near || l > t.far ? null : {
    distance: l,
    point: ks.clone(),
    object: s
  };
}
function zs(s, e, t, n, i, r, a, o, c, l) {
  s.getVertexPosition(o, Ns), s.getVertexPosition(c, Fs), s.getVertexPosition(l, Bs);
  const u = Dl(s, e, t, n, Ns, Fs, Bs, ro);
  if (u) {
    const h = new N();
    fn.getBarycoord(ro, Ns, Fs, Bs, h), i && (u.uv = fn.getInterpolatedAttribute(i, o, c, l, h, new je())), r && (u.uv1 = fn.getInterpolatedAttribute(r, o, c, l, h, new je())), a && (u.normal = fn.getInterpolatedAttribute(a, o, c, l, h, new N()), u.normal.dot(n.direction) > 0 && u.normal.multiplyScalar(-1));
    const d = {
      a: o,
      b: c,
      c: l,
      normal: new N(),
      materialIndex: 0
    };
    fn.getNormal(Ns, Fs, Bs, d.normal), u.face = d, u.barycoord = h;
  }
  return u;
}
class yt extends It {
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
    g("z", "y", "x", -1, -1, n, t, e, a, r, 0), g("z", "y", "x", 1, -1, n, t, -e, a, r, 1), g("x", "z", "y", 1, 1, e, n, t, i, a, 2), g("x", "z", "y", 1, -1, e, n, -t, i, a, 3), g("x", "y", "z", 1, -1, e, t, n, i, r, 4), g("x", "y", "z", -1, -1, e, t, -n, i, r, 5), this.setIndex(c), this.setAttribute("position", new pt(l, 3)), this.setAttribute("normal", new pt(u, 3)), this.setAttribute("uv", new pt(h, 2));
    function g(_, p, m, T, S, A, F, C, I, z, Q) {
      const v = A / I, E = F / z, W = A / 2, X = F / 2, K = C / 2, te = I + 1, j = z + 1;
      let oe = 0, q = 0;
      const xe = new N();
      for (let ve = 0; ve < j; ve++) {
        const Ae = ve * E - X;
        for (let Qe = 0; Qe < te; Qe++) {
          const ht = Qe * v - W;
          xe[_] = ht * T, xe[p] = Ae * S, xe[m] = K, l.push(xe.x, xe.y, xe.z), xe[_] = 0, xe[p] = 0, xe[m] = C > 0 ? 1 : -1, u.push(xe.x, xe.y, xe.z), h.push(Qe / I), h.push(1 - ve / z), oe += 1;
        }
      }
      for (let ve = 0; ve < z; ve++)
        for (let Ae = 0; Ae < I; Ae++) {
          const Qe = d + Ae + te * ve, ht = d + Ae + te * (ve + 1), Z = d + (Ae + 1) + te * (ve + 1), se = d + (Ae + 1) + te * ve;
          c.push(Qe, ht, se), c.push(ht, Z, se), q += 6;
        }
      o.addGroup(f, q, Q), f += q, d += oe;
    }
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new yt(e.width, e.height, e.depth, e.widthSegments, e.heightSegments, e.depthSegments);
  }
}
function Xi(s) {
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
    const n = Xi(s[t]);
    for (const i in n)
      e[i] = n[i];
  }
  return e;
}
function Ul(s) {
  const e = [];
  for (let t = 0; t < s.length; t++)
    e.push(s[t].clone());
  return e;
}
function gc(s) {
  const e = s.getRenderTarget();
  return e === null ? s.outputColorSpace : e.isXRRenderTarget === !0 ? e.texture.colorSpace : at.workingColorSpace;
}
const Nl = { clone: Xi, merge: $t };
var Fl = `void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`, Bl = `void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;
class $n extends on {
  constructor(e) {
    super(), this.isShaderMaterial = !0, this.type = "ShaderMaterial", this.defines = {}, this.uniforms = {}, this.uniformsGroups = [], this.vertexShader = Fl, this.fragmentShader = Bl, this.linewidth = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.fog = !1, this.lights = !1, this.clipping = !1, this.forceSinglePass = !0, this.extensions = {
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
    return super.copy(e), this.fragmentShader = e.fragmentShader, this.vertexShader = e.vertexShader, this.uniforms = Xi(e.uniforms), this.uniformsGroups = Ul(e.uniformsGroups), this.defines = Object.assign({}, e.defines), this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.fog = e.fog, this.lights = e.lights, this.clipping = e.clipping, this.extensions = Object.assign({}, e.extensions), this.glslVersion = e.glslVersion, this;
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
class _c extends bt {
  constructor() {
    super(), this.isCamera = !0, this.type = "Camera", this.matrixWorldInverse = new Ye(), this.projectionMatrix = new Ye(), this.projectionMatrixInverse = new Ye(), this.coordinateSystem = 2e3;
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
const qn = /* @__PURE__ */ new N(), ao = /* @__PURE__ */ new je(), oo = /* @__PURE__ */ new je();
class tn extends _c {
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
    this.fov = Wi * 2 * Math.atan(t), this.updateProjectionMatrix();
  }
  /**
   * Calculates the focal length from the current .fov and .filmGauge.
   */
  getFocalLength() {
    const e = Math.tan(ki * 0.5 * this.fov);
    return 0.5 * this.getFilmHeight() / e;
  }
  getEffectiveFOV() {
    return Wi * 2 * Math.atan(
      Math.tan(ki * 0.5 * this.fov) / this.zoom
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
    qn.set(-1, -1, 0.5).applyMatrix4(this.projectionMatrixInverse), t.set(qn.x, qn.y).multiplyScalar(-e / qn.z), qn.set(1, 1, 0.5).applyMatrix4(this.projectionMatrixInverse), n.set(qn.x, qn.y).multiplyScalar(-e / qn.z);
  }
  /**
   * Computes the width and height of the camera's viewable rectangle at a given distance along the viewing direction.
   * Copies the result into the target Vector2, where x is width and y is height.
   */
  getViewSize(e, t) {
    return this.getViewBounds(e, ao, oo), t.subVectors(oo, ao);
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
    let t = e * Math.tan(ki * 0.5 * this.fov) / this.zoom, n = 2 * t, i = this.aspect * n, r = -0.5 * i;
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
const Li = -90, Di = 1;
class Ol extends bt {
  constructor(e, t, n) {
    super(), this.type = "CubeCamera", this.renderTarget = n, this.coordinateSystem = null, this.activeMipmapLevel = 0;
    const i = new tn(Li, Di, e, t);
    i.layers = this.layers, this.add(i);
    const r = new tn(Li, Di, e, t);
    r.layers = this.layers, this.add(r);
    const a = new tn(Li, Di, e, t);
    a.layers = this.layers, this.add(a);
    const o = new tn(Li, Di, e, t);
    o.layers = this.layers, this.add(o);
    const c = new tn(Li, Di, e, t);
    c.layers = this.layers, this.add(c);
    const l = new tn(Li, Di, e, t);
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
    const _ = n.texture.generateMipmaps;
    n.texture.generateMipmaps = !1, e.setRenderTarget(n, 0, i), e.render(t, r), e.setRenderTarget(n, 1, i), e.render(t, a), e.setRenderTarget(n, 2, i), e.render(t, o), e.setRenderTarget(n, 3, i), e.render(t, c), e.setRenderTarget(n, 4, i), e.render(t, l), n.texture.generateMipmaps = _, e.setRenderTarget(n, 5, i), e.render(t, u), e.setRenderTarget(h, d, f), e.xr.enabled = g, n.texture.needsPMREMUpdate = !0;
  }
}
class xc extends Nt {
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
class kl extends _i {
  constructor(e = 1, t = {}) {
    super(e, e, t), this.isWebGLCubeRenderTarget = !0;
    const n = { width: e, height: e, depth: 1 }, i = [n, n, n, n, n, n];
    this.texture = new xc(i, t.mapping, t.wrapS, t.wrapT, t.magFilter, t.minFilter, t.format, t.type, t.anisotropy, t.colorSpace), this.texture.isRenderTargetTexture = !0, this.texture.generateMipmaps = t.generateMipmaps !== void 0 ? t.generateMipmaps : !1, this.texture.minFilter = t.minFilter !== void 0 ? t.minFilter : 1006;
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
    }, i = new yt(5, 5, 5), r = new $n({
      name: "CubemapFromEquirect",
      uniforms: Xi(n.uniforms),
      vertexShader: n.vertexShader,
      fragmentShader: n.fragmentShader,
      side: 1,
      blending: 0
    });
    r.uniforms.tEquirect.value = t;
    const a = new Le(i, r), o = t.minFilter;
    return t.minFilter === 1008 && (t.minFilter = 1006), new Ol(1, 10, this).update(e, a), t.minFilter = o, a.geometry.dispose(), a.material.dispose(), this;
  }
  clear(e, t, n, i) {
    const r = e.getRenderTarget();
    for (let a = 0; a < 6; a++)
      e.setRenderTarget(this, a), e.clear(t, n, i);
    e.setRenderTarget(r);
  }
}
const Wr = /* @__PURE__ */ new N(), zl = /* @__PURE__ */ new N(), Gl = /* @__PURE__ */ new Je();
class Yn {
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
    const i = Wr.subVectors(n, t).cross(zl.subVectors(e, t)).normalize();
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
    const n = e.delta(Wr), i = this.normal.dot(n);
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
    const n = t || Gl.getNormalMatrix(e), i = this.coplanarPoint(Wr).applyMatrix4(e), r = this.normal.applyMatrix3(n).normalize();
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
const ci = /* @__PURE__ */ new Rn(), Gs = /* @__PURE__ */ new N();
class ya {
  constructor(e = new Yn(), t = new Yn(), n = new Yn(), i = new Yn(), r = new Yn(), a = new Yn()) {
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
    const n = this.planes, i = e.elements, r = i[0], a = i[1], o = i[2], c = i[3], l = i[4], u = i[5], h = i[6], d = i[7], f = i[8], g = i[9], _ = i[10], p = i[11], m = i[12], T = i[13], S = i[14], A = i[15];
    if (n[0].setComponents(c - r, d - l, p - f, A - m).normalize(), n[1].setComponents(c + r, d + l, p + f, A + m).normalize(), n[2].setComponents(c + a, d + u, p + g, A + T).normalize(), n[3].setComponents(c - a, d - u, p - g, A - T).normalize(), n[4].setComponents(c - o, d - h, p - _, A - S).normalize(), t === 2e3)
      n[5].setComponents(c + o, d + h, p + _, A + S).normalize();
    else if (t === 2001)
      n[5].setComponents(o, h, _, S).normalize();
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
      if (Gs.x = i.normal.x > 0 ? e.max.x : e.min.x, Gs.y = i.normal.y > 0 ? e.max.y : e.min.y, Gs.z = i.normal.z > 0 ? e.max.z : e.min.z, i.distanceToPoint(Gs) < 0)
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
function vc() {
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
function Hl(s) {
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
        const g = h[d], _ = h[f];
        _.start <= g.start + g.count + 1 ? g.count = Math.max(
          g.count,
          _.start + _.count - g.start
        ) : (++d, h[d] = _);
      }
      h.length = d + 1;
      for (let f = 0, g = h.length; f < g; f++) {
        const _ = h[f];
        s.bufferSubData(
          l,
          _.start * u.BYTES_PER_ELEMENT,
          u,
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
class Ki extends It {
  constructor(e = 1, t = 1, n = 1, i = 1) {
    super(), this.type = "PlaneGeometry", this.parameters = {
      width: e,
      height: t,
      widthSegments: n,
      heightSegments: i
    };
    const r = e / 2, a = t / 2, o = Math.floor(n), c = Math.floor(i), l = o + 1, u = c + 1, h = e / o, d = t / c, f = [], g = [], _ = [], p = [];
    for (let m = 0; m < u; m++) {
      const T = m * d - a;
      for (let S = 0; S < l; S++) {
        const A = S * h - r;
        g.push(A, -T, 0), _.push(0, 0, 1), p.push(S / o), p.push(1 - m / c);
      }
    }
    for (let m = 0; m < c; m++)
      for (let T = 0; T < o; T++) {
        const S = T + l * m, A = T + l * (m + 1), F = T + 1 + l * (m + 1), C = T + 1 + l * m;
        f.push(S, A, C), f.push(A, F, C);
      }
    this.setIndex(f), this.setAttribute("position", new pt(g, 3)), this.setAttribute("normal", new pt(_, 3)), this.setAttribute("uv", new pt(p, 2));
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new Ki(e.width, e.height, e.widthSegments, e.heightSegments);
  }
}
var Vl = `#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`, Wl = `#ifdef USE_ALPHAHASH
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
#endif`, Xl = `#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`, ql = `#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`, jl = `#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`, Yl = `#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`, Kl = `#ifdef USE_AOMAP
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
#endif`, Zl = `#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`, $l = `#ifdef USE_BATCHING
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
#endif`, Jl = `#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`, Ql = `vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`, eh = `vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`, th = `float G_BlinnPhong_Implicit( ) {
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
} // validated`, nh = `#ifdef USE_IRIDESCENCE
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
#endif`, ih = `#ifdef USE_BUMPMAP
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
#endif`, sh = `#if NUM_CLIPPING_PLANES > 0
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
#endif`, rh = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`, ah = `#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`, oh = `#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`, ch = `#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`, lh = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`, hh = `#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`, uh = `#if defined( USE_COLOR_ALPHA )
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
#endif`, dh = `#define PI 3.141592653589793
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
} // validated`, fh = `#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`, ph = `vec3 transformedNormal = objectNormal;
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
#endif`, mh = `#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`, gh = `#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`, _h = `#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`, xh = `#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`, vh = "gl_FragColor = linearToOutputTexel( gl_FragColor );", Mh = `
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
}`, yh = `#ifdef USE_ENVMAP
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
#endif`, Sh = `#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`, Eh = `#ifdef USE_ENVMAP
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
#endif`, Th = `#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`, Ah = `#ifdef USE_ENVMAP
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
#endif`, bh = `#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`, wh = `#ifdef USE_FOG
	varying float vFogDepth;
#endif`, Rh = `#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`, Ch = `#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`, Ih = `#ifdef USE_GRADIENTMAP
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
}`, Ph = `#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`, Lh = `LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`, Dh = `varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`, Uh = `uniform bool receiveShadow;
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
#endif`, Nh = `#ifdef USE_ENVMAP
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
#endif`, Fh = `ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`, Bh = `varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`, Oh = `BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`, kh = `varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`, zh = `PhysicalMaterial material;
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
#endif`, Gh = `struct PhysicalMaterial {
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
}`, Hh = `
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
#endif`, Vh = `#if defined( RE_IndirectDiffuse )
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
#endif`, Wh = `#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`, Xh = `#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`, qh = `#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`, jh = `#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`, Yh = `#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`, Kh = `#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`, Zh = `#ifdef USE_MAP
	uniform sampler2D map;
#endif`, $h = `#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`, Jh = `#if defined( USE_POINTS_UV )
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
#endif`, Qh = `float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`, eu = `#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`, tu = `#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`, nu = `#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`, iu = `#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`, su = `#ifdef USE_MORPHTARGETS
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
#endif`, ru = `#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`, au = `float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`, ou = `#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`, cu = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`, lu = `#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`, hu = `#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`, uu = `#ifdef USE_NORMALMAP
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
#endif`, du = `#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`, fu = `#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`, pu = `#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`, mu = `#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`, gu = `#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`, _u = `vec3 packNormalToRGB( const in vec3 normal ) {
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
}`, xu = `#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`, vu = `vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`, Mu = `#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`, yu = `#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`, Su = `float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`, Eu = `#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`, Tu = `#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`, Au = `#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`, bu = `#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`, wu = `float getShadowMask() {
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
}`, Ru = `#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`, Cu = `#ifdef USE_SKINNING
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
#endif`, Iu = `#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`, Pu = `#ifdef USE_SKINNING
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
#endif`, Lu = `float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`, Du = `#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`, Uu = `#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`, Nu = `#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`, Fu = `#ifdef USE_TRANSMISSION
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
#endif`, Bu = `#ifdef USE_TRANSMISSION
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
#endif`, Ou = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`, ku = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`, zu = `#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`, Gu = `#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;
const Hu = `varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`, Vu = `uniform sampler2D t2D;
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
}`, Wu = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`, Xu = `#ifdef ENVMAP_TYPE_CUBE
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
}`, qu = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`, ju = `uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, Yu = `#include <common>
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
}`, Ku = `#if DEPTH_PACKING == 3200
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
}`, Zu = `#define DISTANCE
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
}`, $u = `#define DISTANCE
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
}`, Ju = `varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`, Qu = `uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`, ed = `uniform float scale;
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
}`, td = `uniform vec3 diffuse;
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
}`, nd = `#include <common>
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
}`, id = `uniform vec3 diffuse;
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
}`, sd = `#define LAMBERT
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
}`, rd = `#define LAMBERT
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
}`, ad = `#define MATCAP
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
}`, od = `#define MATCAP
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
}`, cd = `#define NORMAL
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
}`, ld = `#define NORMAL
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
}`, hd = `#define PHONG
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
}`, ud = `#define PHONG
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
}`, dd = `#define STANDARD
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
}`, fd = `#define STANDARD
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
}`, pd = `#define TOON
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
}`, md = `#define TOON
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
}`, gd = `uniform float size;
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
}`, _d = `uniform vec3 diffuse;
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
}`, xd = `#include <common>
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
}`, vd = `uniform vec3 color;
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
}`, Md = `uniform float rotation;
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
}`, yd = `uniform vec3 diffuse;
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
}`, $e = {
  alphahash_fragment: Vl,
  alphahash_pars_fragment: Wl,
  alphamap_fragment: Xl,
  alphamap_pars_fragment: ql,
  alphatest_fragment: jl,
  alphatest_pars_fragment: Yl,
  aomap_fragment: Kl,
  aomap_pars_fragment: Zl,
  batching_pars_vertex: $l,
  batching_vertex: Jl,
  begin_vertex: Ql,
  beginnormal_vertex: eh,
  bsdfs: th,
  iridescence_fragment: nh,
  bumpmap_pars_fragment: ih,
  clipping_planes_fragment: sh,
  clipping_planes_pars_fragment: rh,
  clipping_planes_pars_vertex: ah,
  clipping_planes_vertex: oh,
  color_fragment: ch,
  color_pars_fragment: lh,
  color_pars_vertex: hh,
  color_vertex: uh,
  common: dh,
  cube_uv_reflection_fragment: fh,
  defaultnormal_vertex: ph,
  displacementmap_pars_vertex: mh,
  displacementmap_vertex: gh,
  emissivemap_fragment: _h,
  emissivemap_pars_fragment: xh,
  colorspace_fragment: vh,
  colorspace_pars_fragment: Mh,
  envmap_fragment: yh,
  envmap_common_pars_fragment: Sh,
  envmap_pars_fragment: Eh,
  envmap_pars_vertex: Th,
  envmap_physical_pars_fragment: Nh,
  envmap_vertex: Ah,
  fog_vertex: bh,
  fog_pars_vertex: wh,
  fog_fragment: Rh,
  fog_pars_fragment: Ch,
  gradientmap_pars_fragment: Ih,
  lightmap_pars_fragment: Ph,
  lights_lambert_fragment: Lh,
  lights_lambert_pars_fragment: Dh,
  lights_pars_begin: Uh,
  lights_toon_fragment: Fh,
  lights_toon_pars_fragment: Bh,
  lights_phong_fragment: Oh,
  lights_phong_pars_fragment: kh,
  lights_physical_fragment: zh,
  lights_physical_pars_fragment: Gh,
  lights_fragment_begin: Hh,
  lights_fragment_maps: Vh,
  lights_fragment_end: Wh,
  logdepthbuf_fragment: Xh,
  logdepthbuf_pars_fragment: qh,
  logdepthbuf_pars_vertex: jh,
  logdepthbuf_vertex: Yh,
  map_fragment: Kh,
  map_pars_fragment: Zh,
  map_particle_fragment: $h,
  map_particle_pars_fragment: Jh,
  metalnessmap_fragment: Qh,
  metalnessmap_pars_fragment: eu,
  morphinstance_vertex: tu,
  morphcolor_vertex: nu,
  morphnormal_vertex: iu,
  morphtarget_pars_vertex: su,
  morphtarget_vertex: ru,
  normal_fragment_begin: au,
  normal_fragment_maps: ou,
  normal_pars_fragment: cu,
  normal_pars_vertex: lu,
  normal_vertex: hu,
  normalmap_pars_fragment: uu,
  clearcoat_normal_fragment_begin: du,
  clearcoat_normal_fragment_maps: fu,
  clearcoat_pars_fragment: pu,
  iridescence_pars_fragment: mu,
  opaque_fragment: gu,
  packing: _u,
  premultiplied_alpha_fragment: xu,
  project_vertex: vu,
  dithering_fragment: Mu,
  dithering_pars_fragment: yu,
  roughnessmap_fragment: Su,
  roughnessmap_pars_fragment: Eu,
  shadowmap_pars_fragment: Tu,
  shadowmap_pars_vertex: Au,
  shadowmap_vertex: bu,
  shadowmask_pars_fragment: wu,
  skinbase_vertex: Ru,
  skinning_pars_vertex: Cu,
  skinning_vertex: Iu,
  skinnormal_vertex: Pu,
  specularmap_fragment: Lu,
  specularmap_pars_fragment: Du,
  tonemapping_fragment: Uu,
  tonemapping_pars_fragment: Nu,
  transmission_fragment: Fu,
  transmission_pars_fragment: Bu,
  uv_pars_fragment: Ou,
  uv_pars_vertex: ku,
  uv_vertex: zu,
  worldpos_vertex: Gu,
  background_vert: Hu,
  background_frag: Vu,
  backgroundCube_vert: Wu,
  backgroundCube_frag: Xu,
  cube_vert: qu,
  cube_frag: ju,
  depth_vert: Yu,
  depth_frag: Ku,
  distanceRGBA_vert: Zu,
  distanceRGBA_frag: $u,
  equirect_vert: Ju,
  equirect_frag: Qu,
  linedashed_vert: ed,
  linedashed_frag: td,
  meshbasic_vert: nd,
  meshbasic_frag: id,
  meshlambert_vert: sd,
  meshlambert_frag: rd,
  meshmatcap_vert: ad,
  meshmatcap_frag: od,
  meshnormal_vert: cd,
  meshnormal_frag: ld,
  meshphong_vert: hd,
  meshphong_frag: ud,
  meshphysical_vert: dd,
  meshphysical_frag: fd,
  meshtoon_vert: pd,
  meshtoon_frag: md,
  points_vert: gd,
  points_frag: _d,
  shadow_vert: xd,
  shadow_frag: vd,
  sprite_vert: Md,
  sprite_frag: yd
}, pe = {
  common: {
    diffuse: { value: /* @__PURE__ */ new Pe(16777215) },
    opacity: { value: 1 },
    map: { value: null },
    mapTransform: { value: /* @__PURE__ */ new Je() },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new Je() },
    alphaTest: { value: 0 }
  },
  specularmap: {
    specularMap: { value: null },
    specularMapTransform: { value: /* @__PURE__ */ new Je() }
  },
  envmap: {
    envMap: { value: null },
    envMapRotation: { value: /* @__PURE__ */ new Je() },
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
    aoMapTransform: { value: /* @__PURE__ */ new Je() }
  },
  lightmap: {
    lightMap: { value: null },
    lightMapIntensity: { value: 1 },
    lightMapTransform: { value: /* @__PURE__ */ new Je() }
  },
  bumpmap: {
    bumpMap: { value: null },
    bumpMapTransform: { value: /* @__PURE__ */ new Je() },
    bumpScale: { value: 1 }
  },
  normalmap: {
    normalMap: { value: null },
    normalMapTransform: { value: /* @__PURE__ */ new Je() },
    normalScale: { value: /* @__PURE__ */ new je(1, 1) }
  },
  displacementmap: {
    displacementMap: { value: null },
    displacementMapTransform: { value: /* @__PURE__ */ new Je() },
    displacementScale: { value: 1 },
    displacementBias: { value: 0 }
  },
  emissivemap: {
    emissiveMap: { value: null },
    emissiveMapTransform: { value: /* @__PURE__ */ new Je() }
  },
  metalnessmap: {
    metalnessMap: { value: null },
    metalnessMapTransform: { value: /* @__PURE__ */ new Je() }
  },
  roughnessmap: {
    roughnessMap: { value: null },
    roughnessMapTransform: { value: /* @__PURE__ */ new Je() }
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
    alphaMapTransform: { value: /* @__PURE__ */ new Je() },
    alphaTest: { value: 0 },
    uvTransform: { value: /* @__PURE__ */ new Je() }
  },
  sprite: {
    diffuse: { value: /* @__PURE__ */ new Pe(16777215) },
    opacity: { value: 1 },
    center: { value: /* @__PURE__ */ new je(0.5, 0.5) },
    rotation: { value: 0 },
    map: { value: null },
    mapTransform: { value: /* @__PURE__ */ new Je() },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new Je() },
    alphaTest: { value: 0 }
  }
}, bn = {
  basic: {
    uniforms: /* @__PURE__ */ $t([
      pe.common,
      pe.specularmap,
      pe.envmap,
      pe.aomap,
      pe.lightmap,
      pe.fog
    ]),
    vertexShader: $e.meshbasic_vert,
    fragmentShader: $e.meshbasic_frag
  },
  lambert: {
    uniforms: /* @__PURE__ */ $t([
      pe.common,
      pe.specularmap,
      pe.envmap,
      pe.aomap,
      pe.lightmap,
      pe.emissivemap,
      pe.bumpmap,
      pe.normalmap,
      pe.displacementmap,
      pe.fog,
      pe.lights,
      {
        emissive: { value: /* @__PURE__ */ new Pe(0) }
      }
    ]),
    vertexShader: $e.meshlambert_vert,
    fragmentShader: $e.meshlambert_frag
  },
  phong: {
    uniforms: /* @__PURE__ */ $t([
      pe.common,
      pe.specularmap,
      pe.envmap,
      pe.aomap,
      pe.lightmap,
      pe.emissivemap,
      pe.bumpmap,
      pe.normalmap,
      pe.displacementmap,
      pe.fog,
      pe.lights,
      {
        emissive: { value: /* @__PURE__ */ new Pe(0) },
        specular: { value: /* @__PURE__ */ new Pe(1118481) },
        shininess: { value: 30 }
      }
    ]),
    vertexShader: $e.meshphong_vert,
    fragmentShader: $e.meshphong_frag
  },
  standard: {
    uniforms: /* @__PURE__ */ $t([
      pe.common,
      pe.envmap,
      pe.aomap,
      pe.lightmap,
      pe.emissivemap,
      pe.bumpmap,
      pe.normalmap,
      pe.displacementmap,
      pe.roughnessmap,
      pe.metalnessmap,
      pe.fog,
      pe.lights,
      {
        emissive: { value: /* @__PURE__ */ new Pe(0) },
        roughness: { value: 1 },
        metalness: { value: 0 },
        envMapIntensity: { value: 1 }
      }
    ]),
    vertexShader: $e.meshphysical_vert,
    fragmentShader: $e.meshphysical_frag
  },
  toon: {
    uniforms: /* @__PURE__ */ $t([
      pe.common,
      pe.aomap,
      pe.lightmap,
      pe.emissivemap,
      pe.bumpmap,
      pe.normalmap,
      pe.displacementmap,
      pe.gradientmap,
      pe.fog,
      pe.lights,
      {
        emissive: { value: /* @__PURE__ */ new Pe(0) }
      }
    ]),
    vertexShader: $e.meshtoon_vert,
    fragmentShader: $e.meshtoon_frag
  },
  matcap: {
    uniforms: /* @__PURE__ */ $t([
      pe.common,
      pe.bumpmap,
      pe.normalmap,
      pe.displacementmap,
      pe.fog,
      {
        matcap: { value: null }
      }
    ]),
    vertexShader: $e.meshmatcap_vert,
    fragmentShader: $e.meshmatcap_frag
  },
  points: {
    uniforms: /* @__PURE__ */ $t([
      pe.points,
      pe.fog
    ]),
    vertexShader: $e.points_vert,
    fragmentShader: $e.points_frag
  },
  dashed: {
    uniforms: /* @__PURE__ */ $t([
      pe.common,
      pe.fog,
      {
        scale: { value: 1 },
        dashSize: { value: 1 },
        totalSize: { value: 2 }
      }
    ]),
    vertexShader: $e.linedashed_vert,
    fragmentShader: $e.linedashed_frag
  },
  depth: {
    uniforms: /* @__PURE__ */ $t([
      pe.common,
      pe.displacementmap
    ]),
    vertexShader: $e.depth_vert,
    fragmentShader: $e.depth_frag
  },
  normal: {
    uniforms: /* @__PURE__ */ $t([
      pe.common,
      pe.bumpmap,
      pe.normalmap,
      pe.displacementmap,
      {
        opacity: { value: 1 }
      }
    ]),
    vertexShader: $e.meshnormal_vert,
    fragmentShader: $e.meshnormal_frag
  },
  sprite: {
    uniforms: /* @__PURE__ */ $t([
      pe.sprite,
      pe.fog
    ]),
    vertexShader: $e.sprite_vert,
    fragmentShader: $e.sprite_frag
  },
  background: {
    uniforms: {
      uvTransform: { value: /* @__PURE__ */ new Je() },
      t2D: { value: null },
      backgroundIntensity: { value: 1 }
    },
    vertexShader: $e.background_vert,
    fragmentShader: $e.background_frag
  },
  backgroundCube: {
    uniforms: {
      envMap: { value: null },
      flipEnvMap: { value: -1 },
      backgroundBlurriness: { value: 0 },
      backgroundIntensity: { value: 1 },
      backgroundRotation: { value: /* @__PURE__ */ new Je() }
    },
    vertexShader: $e.backgroundCube_vert,
    fragmentShader: $e.backgroundCube_frag
  },
  cube: {
    uniforms: {
      tCube: { value: null },
      tFlip: { value: -1 },
      opacity: { value: 1 }
    },
    vertexShader: $e.cube_vert,
    fragmentShader: $e.cube_frag
  },
  equirect: {
    uniforms: {
      tEquirect: { value: null }
    },
    vertexShader: $e.equirect_vert,
    fragmentShader: $e.equirect_frag
  },
  distanceRGBA: {
    uniforms: /* @__PURE__ */ $t([
      pe.common,
      pe.displacementmap,
      {
        referencePosition: { value: /* @__PURE__ */ new N() },
        nearDistance: { value: 1 },
        farDistance: { value: 1e3 }
      }
    ]),
    vertexShader: $e.distanceRGBA_vert,
    fragmentShader: $e.distanceRGBA_frag
  },
  shadow: {
    uniforms: /* @__PURE__ */ $t([
      pe.lights,
      pe.fog,
      {
        color: { value: /* @__PURE__ */ new Pe(0) },
        opacity: { value: 1 }
      }
    ]),
    vertexShader: $e.shadow_vert,
    fragmentShader: $e.shadow_frag
  }
};
bn.physical = {
  uniforms: /* @__PURE__ */ $t([
    bn.standard.uniforms,
    {
      clearcoat: { value: 0 },
      clearcoatMap: { value: null },
      clearcoatMapTransform: { value: /* @__PURE__ */ new Je() },
      clearcoatNormalMap: { value: null },
      clearcoatNormalMapTransform: { value: /* @__PURE__ */ new Je() },
      clearcoatNormalScale: { value: /* @__PURE__ */ new je(1, 1) },
      clearcoatRoughness: { value: 0 },
      clearcoatRoughnessMap: { value: null },
      clearcoatRoughnessMapTransform: { value: /* @__PURE__ */ new Je() },
      dispersion: { value: 0 },
      iridescence: { value: 0 },
      iridescenceMap: { value: null },
      iridescenceMapTransform: { value: /* @__PURE__ */ new Je() },
      iridescenceIOR: { value: 1.3 },
      iridescenceThicknessMinimum: { value: 100 },
      iridescenceThicknessMaximum: { value: 400 },
      iridescenceThicknessMap: { value: null },
      iridescenceThicknessMapTransform: { value: /* @__PURE__ */ new Je() },
      sheen: { value: 0 },
      sheenColor: { value: /* @__PURE__ */ new Pe(0) },
      sheenColorMap: { value: null },
      sheenColorMapTransform: { value: /* @__PURE__ */ new Je() },
      sheenRoughness: { value: 1 },
      sheenRoughnessMap: { value: null },
      sheenRoughnessMapTransform: { value: /* @__PURE__ */ new Je() },
      transmission: { value: 0 },
      transmissionMap: { value: null },
      transmissionMapTransform: { value: /* @__PURE__ */ new Je() },
      transmissionSamplerSize: { value: /* @__PURE__ */ new je() },
      transmissionSamplerMap: { value: null },
      thickness: { value: 0 },
      thicknessMap: { value: null },
      thicknessMapTransform: { value: /* @__PURE__ */ new Je() },
      attenuationDistance: { value: 0 },
      attenuationColor: { value: /* @__PURE__ */ new Pe(0) },
      specularColor: { value: /* @__PURE__ */ new Pe(1, 1, 1) },
      specularColorMap: { value: null },
      specularColorMapTransform: { value: /* @__PURE__ */ new Je() },
      specularIntensity: { value: 1 },
      specularIntensityMap: { value: null },
      specularIntensityMapTransform: { value: /* @__PURE__ */ new Je() },
      anisotropyVector: { value: /* @__PURE__ */ new je() },
      anisotropyMap: { value: null },
      anisotropyMapTransform: { value: /* @__PURE__ */ new Je() }
    }
  ]),
  vertexShader: $e.meshphysical_vert,
  fragmentShader: $e.meshphysical_frag
};
const Hs = { r: 0, b: 0, g: 0 }, li = /* @__PURE__ */ new Sn(), Sd = /* @__PURE__ */ new Ye();
function Ed(s, e, t, n, i, r, a) {
  const o = new Pe(0);
  let c = r === !0 ? 0 : 1, l, u, h = null, d = 0, f = null;
  function g(T) {
    let S = T.isScene === !0 ? T.background : null;
    return S && S.isTexture && (S = (T.backgroundBlurriness > 0 ? t : e).get(S)), S;
  }
  function _(T) {
    let S = !1;
    const A = g(T);
    A === null ? m(o, c) : A && A.isColor && (m(A, 1), S = !0);
    const F = s.xr.getEnvironmentBlendMode();
    F === "additive" ? n.buffers.color.setClear(0, 0, 0, 1, a) : F === "alpha-blend" && n.buffers.color.setClear(0, 0, 0, 0, a), (s.autoClear || S) && (n.buffers.depth.setTest(!0), n.buffers.depth.setMask(!0), n.buffers.color.setMask(!0), s.clear(s.autoClearColor, s.autoClearDepth, s.autoClearStencil));
  }
  function p(T, S) {
    const A = g(S);
    A && (A.isCubeTexture || A.mapping === 306) ? (u === void 0 && (u = new Le(
      new yt(1, 1, 1),
      new $n({
        name: "BackgroundCubeMaterial",
        uniforms: Xi(bn.backgroundCube.uniforms),
        vertexShader: bn.backgroundCube.vertexShader,
        fragmentShader: bn.backgroundCube.fragmentShader,
        side: 1,
        depthTest: !1,
        depthWrite: !1,
        fog: !1
      })
    ), u.geometry.deleteAttribute("normal"), u.geometry.deleteAttribute("uv"), u.onBeforeRender = function(F, C, I) {
      this.matrixWorld.copyPosition(I.matrixWorld);
    }, Object.defineProperty(u.material, "envMap", {
      get: function() {
        return this.uniforms.envMap.value;
      }
    }), i.update(u)), li.copy(S.backgroundRotation), li.x *= -1, li.y *= -1, li.z *= -1, A.isCubeTexture && A.isRenderTargetTexture === !1 && (li.y *= -1, li.z *= -1), u.material.uniforms.envMap.value = A, u.material.uniforms.flipEnvMap.value = A.isCubeTexture && A.isRenderTargetTexture === !1 ? -1 : 1, u.material.uniforms.backgroundBlurriness.value = S.backgroundBlurriness, u.material.uniforms.backgroundIntensity.value = S.backgroundIntensity, u.material.uniforms.backgroundRotation.value.setFromMatrix4(Sd.makeRotationFromEuler(li)), u.material.toneMapped = at.getTransfer(A.colorSpace) !== St, (h !== A || d !== A.version || f !== s.toneMapping) && (u.material.needsUpdate = !0, h = A, d = A.version, f = s.toneMapping), u.layers.enableAll(), T.unshift(u, u.geometry, u.material, 0, 0, null)) : A && A.isTexture && (l === void 0 && (l = new Le(
      new Ki(2, 2),
      new $n({
        name: "BackgroundMaterial",
        uniforms: Xi(bn.background.uniforms),
        vertexShader: bn.background.vertexShader,
        fragmentShader: bn.background.fragmentShader,
        side: 0,
        depthTest: !1,
        depthWrite: !1,
        fog: !1
      })
    ), l.geometry.deleteAttribute("normal"), Object.defineProperty(l.material, "map", {
      get: function() {
        return this.uniforms.t2D.value;
      }
    }), i.update(l)), l.material.uniforms.t2D.value = A, l.material.uniforms.backgroundIntensity.value = S.backgroundIntensity, l.material.toneMapped = at.getTransfer(A.colorSpace) !== St, A.matrixAutoUpdate === !0 && A.updateMatrix(), l.material.uniforms.uvTransform.value.copy(A.matrix), (h !== A || d !== A.version || f !== s.toneMapping) && (l.material.needsUpdate = !0, h = A, d = A.version, f = s.toneMapping), l.layers.enableAll(), T.unshift(l, l.geometry, l.material, 0, 0, null));
  }
  function m(T, S) {
    T.getRGB(Hs, gc(s)), n.buffers.color.setClear(Hs.r, Hs.g, Hs.b, S, a);
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
    render: _,
    addToRenderList: p
  };
}
function Td(s, e) {
  const t = s.getParameter(s.MAX_VERTEX_ATTRIBS), n = {}, i = d(null);
  let r = i, a = !1;
  function o(v, E, W, X, K) {
    let te = !1;
    const j = h(X, W, E);
    r !== j && (r = j, l(r.object)), te = f(v, X, W, K), te && g(v, X, W, K), K !== null && e.update(K, s.ELEMENT_ARRAY_BUFFER), (te || a) && (a = !1, A(v, E, W, X), K !== null && s.bindBuffer(s.ELEMENT_ARRAY_BUFFER, e.get(K).buffer));
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
  function h(v, E, W) {
    const X = W.wireframe === !0;
    let K = n[v.id];
    K === void 0 && (K = {}, n[v.id] = K);
    let te = K[E.id];
    te === void 0 && (te = {}, K[E.id] = te);
    let j = te[X];
    return j === void 0 && (j = d(c()), te[X] = j), j;
  }
  function d(v) {
    const E = [], W = [], X = [];
    for (let K = 0; K < t; K++)
      E[K] = 0, W[K] = 0, X[K] = 0;
    return {
      // for backward compatibility on non-VAO support browser
      geometry: null,
      program: null,
      wireframe: !1,
      newAttributes: E,
      enabledAttributes: W,
      attributeDivisors: X,
      object: v,
      attributes: {},
      index: null
    };
  }
  function f(v, E, W, X) {
    const K = r.attributes, te = E.attributes;
    let j = 0;
    const oe = W.getAttributes();
    for (const q in oe)
      if (oe[q].location >= 0) {
        const ve = K[q];
        let Ae = te[q];
        if (Ae === void 0 && (q === "instanceMatrix" && v.instanceMatrix && (Ae = v.instanceMatrix), q === "instanceColor" && v.instanceColor && (Ae = v.instanceColor)), ve === void 0 || ve.attribute !== Ae || Ae && ve.data !== Ae.data) return !0;
        j++;
      }
    return r.attributesNum !== j || r.index !== X;
  }
  function g(v, E, W, X) {
    const K = {}, te = E.attributes;
    let j = 0;
    const oe = W.getAttributes();
    for (const q in oe)
      if (oe[q].location >= 0) {
        let ve = te[q];
        ve === void 0 && (q === "instanceMatrix" && v.instanceMatrix && (ve = v.instanceMatrix), q === "instanceColor" && v.instanceColor && (ve = v.instanceColor));
        const Ae = {};
        Ae.attribute = ve, ve && ve.data && (Ae.data = ve.data), K[q] = Ae, j++;
      }
    r.attributes = K, r.attributesNum = j, r.index = X;
  }
  function _() {
    const v = r.newAttributes;
    for (let E = 0, W = v.length; E < W; E++)
      v[E] = 0;
  }
  function p(v) {
    m(v, 0);
  }
  function m(v, E) {
    const W = r.newAttributes, X = r.enabledAttributes, K = r.attributeDivisors;
    W[v] = 1, X[v] === 0 && (s.enableVertexAttribArray(v), X[v] = 1), K[v] !== E && (s.vertexAttribDivisor(v, E), K[v] = E);
  }
  function T() {
    const v = r.newAttributes, E = r.enabledAttributes;
    for (let W = 0, X = E.length; W < X; W++)
      E[W] !== v[W] && (s.disableVertexAttribArray(W), E[W] = 0);
  }
  function S(v, E, W, X, K, te, j) {
    j === !0 ? s.vertexAttribIPointer(v, E, W, K, te) : s.vertexAttribPointer(v, E, W, X, K, te);
  }
  function A(v, E, W, X) {
    _();
    const K = X.attributes, te = W.getAttributes(), j = E.defaultAttributeValues;
    for (const oe in te) {
      const q = te[oe];
      if (q.location >= 0) {
        let xe = K[oe];
        if (xe === void 0 && (oe === "instanceMatrix" && v.instanceMatrix && (xe = v.instanceMatrix), oe === "instanceColor" && v.instanceColor && (xe = v.instanceColor)), xe !== void 0) {
          const ve = xe.normalized, Ae = xe.itemSize, Qe = e.get(xe);
          if (Qe === void 0) continue;
          const ht = Qe.buffer, Z = Qe.type, se = Qe.bytesPerElement, Re = Z === s.INT || Z === s.UNSIGNED_INT || xe.gpuType === 1013;
          if (xe.isInterleavedBufferAttribute) {
            const Me = xe.data, Ve = Me.stride, Fe = xe.offset;
            if (Me.isInstancedInterleavedBuffer) {
              for (let it = 0; it < q.locationSize; it++)
                m(q.location + it, Me.meshPerAttribute);
              v.isInstancedMesh !== !0 && X._maxInstanceCount === void 0 && (X._maxInstanceCount = Me.meshPerAttribute * Me.count);
            } else
              for (let it = 0; it < q.locationSize; it++)
                p(q.location + it);
            s.bindBuffer(s.ARRAY_BUFFER, ht);
            for (let it = 0; it < q.locationSize; it++)
              S(
                q.location + it,
                Ae / q.locationSize,
                Z,
                ve,
                Ve * se,
                (Fe + Ae / q.locationSize * it) * se,
                Re
              );
          } else {
            if (xe.isInstancedBufferAttribute) {
              for (let Me = 0; Me < q.locationSize; Me++)
                m(q.location + Me, xe.meshPerAttribute);
              v.isInstancedMesh !== !0 && X._maxInstanceCount === void 0 && (X._maxInstanceCount = xe.meshPerAttribute * xe.count);
            } else
              for (let Me = 0; Me < q.locationSize; Me++)
                p(q.location + Me);
            s.bindBuffer(s.ARRAY_BUFFER, ht);
            for (let Me = 0; Me < q.locationSize; Me++)
              S(
                q.location + Me,
                Ae / q.locationSize,
                Z,
                ve,
                Ae * se,
                Ae / q.locationSize * Me * se,
                Re
              );
          }
        } else if (j !== void 0) {
          const ve = j[oe];
          if (ve !== void 0)
            switch (ve.length) {
              case 2:
                s.vertexAttrib2fv(q.location, ve);
                break;
              case 3:
                s.vertexAttrib3fv(q.location, ve);
                break;
              case 4:
                s.vertexAttrib4fv(q.location, ve);
                break;
              default:
                s.vertexAttrib1fv(q.location, ve);
            }
        }
      }
    }
    T();
  }
  function F() {
    z();
    for (const v in n) {
      const E = n[v];
      for (const W in E) {
        const X = E[W];
        for (const K in X)
          u(X[K].object), delete X[K];
        delete E[W];
      }
      delete n[v];
    }
  }
  function C(v) {
    if (n[v.id] === void 0) return;
    const E = n[v.id];
    for (const W in E) {
      const X = E[W];
      for (const K in X)
        u(X[K].object), delete X[K];
      delete E[W];
    }
    delete n[v.id];
  }
  function I(v) {
    for (const E in n) {
      const W = n[E];
      if (W[v.id] === void 0) continue;
      const X = W[v.id];
      for (const K in X)
        u(X[K].object), delete X[K];
      delete W[v.id];
    }
  }
  function z() {
    Q(), a = !0, r !== i && (r = i, l(r.object));
  }
  function Q() {
    i.geometry = null, i.program = null, i.wireframe = !1;
  }
  return {
    setup: o,
    reset: z,
    resetDefaultState: Q,
    dispose: F,
    releaseStatesOfGeometry: C,
    releaseStatesOfProgram: I,
    initAttributes: _,
    enableAttribute: p,
    disableUnusedAttributes: T
  };
}
function Ad(s, e, t) {
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
      for (let _ = 0; _ < h; _++)
        g += u[_];
      for (let _ = 0; _ < d.length; _++)
        t.update(g, n, d[_]);
    }
  }
  this.setMode = i, this.render = r, this.renderInstances = a, this.renderMultiDraw = o, this.renderMultiDrawInstances = c;
}
function bd(s, e, t, n) {
  let i;
  function r() {
    if (i !== void 0) return i;
    if (e.has("EXT_texture_filter_anisotropic") === !0) {
      const I = e.get("EXT_texture_filter_anisotropic");
      i = s.getParameter(I.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    } else
      i = 0;
    return i;
  }
  function a(I) {
    return !(I !== 1023 && n.convert(I) !== s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT));
  }
  function o(I) {
    const z = I === 1016 && (e.has("EXT_color_buffer_half_float") || e.has("EXT_color_buffer_float"));
    return !(I !== 1009 && n.convert(I) !== s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE) && // Edge and Chrome Mac < 52 (#9513)
    I !== 1015 && !z);
  }
  function c(I) {
    if (I === "highp") {
      if (s.getShaderPrecisionFormat(s.VERTEX_SHADER, s.HIGH_FLOAT).precision > 0 && s.getShaderPrecisionFormat(s.FRAGMENT_SHADER, s.HIGH_FLOAT).precision > 0)
        return "highp";
      I = "mediump";
    }
    return I === "mediump" && s.getShaderPrecisionFormat(s.VERTEX_SHADER, s.MEDIUM_FLOAT).precision > 0 && s.getShaderPrecisionFormat(s.FRAGMENT_SHADER, s.MEDIUM_FLOAT).precision > 0 ? "mediump" : "lowp";
  }
  let l = t.precision !== void 0 ? t.precision : "highp";
  const u = c(l);
  u !== l && (console.warn("THREE.WebGLRenderer:", l, "not supported, using", u, "instead."), l = u);
  const h = t.logarithmicDepthBuffer === !0, d = t.reverseDepthBuffer === !0 && e.has("EXT_clip_control");
  if (d === !0) {
    const I = e.get("EXT_clip_control");
    I.clipControlEXT(I.LOWER_LEFT_EXT, I.ZERO_TO_ONE_EXT);
  }
  const f = s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS), g = s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS), _ = s.getParameter(s.MAX_TEXTURE_SIZE), p = s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE), m = s.getParameter(s.MAX_VERTEX_ATTRIBS), T = s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS), S = s.getParameter(s.MAX_VARYING_VECTORS), A = s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS), F = g > 0, C = s.getParameter(s.MAX_SAMPLES);
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
    maxTextureSize: _,
    maxCubemapSize: p,
    maxAttributes: m,
    maxVertexUniforms: T,
    maxVaryings: S,
    maxFragmentUniforms: A,
    vertexTextures: F,
    maxSamples: C
  };
}
function wd(s) {
  const e = this;
  let t = null, n = 0, i = !1, r = !1;
  const a = new Yn(), o = new Je(), c = { value: null, needsUpdate: !1 };
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
    const g = h.clippingPlanes, _ = h.clipIntersection, p = h.clipShadows, m = s.get(h);
    if (!i || g === null || g.length === 0 || r && !p)
      r ? u(null) : l();
    else {
      const T = r ? 0 : n, S = T * 4;
      let A = m.clippingState || null;
      c.value = A, A = u(g, d, S, f);
      for (let F = 0; F !== S; ++F)
        A[F] = t[F];
      m.clippingState = A, this.numIntersection = _ ? this.numPlanes : 0, this.numPlanes += T;
    }
  };
  function l() {
    c.value !== t && (c.value = t, c.needsUpdate = n > 0), e.numPlanes = n, e.numIntersection = 0;
  }
  function u(h, d, f, g) {
    const _ = h !== null ? h.length : 0;
    let p = null;
    if (_ !== 0) {
      if (p = c.value, g !== !0 || p === null) {
        const m = f + _ * 4, T = d.matrixWorldInverse;
        o.getNormalMatrix(T), (p === null || p.length < m) && (p = new Float32Array(m));
        for (let S = 0, A = f; S !== _; ++S, A += 4)
          a.copy(h[S]).applyMatrix4(T, o), a.normal.toArray(p, A), p[A + 3] = a.constant;
      }
      c.value = p, c.needsUpdate = !0;
    }
    return e.numPlanes = _, e.numIntersection = 0, p;
  }
}
function Rd(s) {
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
            const l = new kl(c.height);
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
class dr extends _c {
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
const Bi = 4, co = [0.125, 0.215, 0.35, 0.446, 0.526, 0.582], fi = 20, Xr = /* @__PURE__ */ new dr(), lo = /* @__PURE__ */ new Pe();
let qr = null, jr = 0, Yr = 0, Kr = !1;
const di = (1 + Math.sqrt(5)) / 2, Ui = 1 / di, ho = [
  /* @__PURE__ */ new N(-di, Ui, 0),
  /* @__PURE__ */ new N(di, Ui, 0),
  /* @__PURE__ */ new N(-Ui, 0, di),
  /* @__PURE__ */ new N(Ui, 0, di),
  /* @__PURE__ */ new N(0, di, -Ui),
  /* @__PURE__ */ new N(0, di, Ui),
  /* @__PURE__ */ new N(-1, 1, -1),
  /* @__PURE__ */ new N(1, 1, -1),
  /* @__PURE__ */ new N(-1, 1, 1),
  /* @__PURE__ */ new N(1, 1, 1)
];
class uo {
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
    qr = this._renderer.getRenderTarget(), jr = this._renderer.getActiveCubeFace(), Yr = this._renderer.getActiveMipmapLevel(), Kr = this._renderer.xr.enabled, this._renderer.xr.enabled = !1, this._setSize(256);
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
    this._cubemapMaterial === null && (this._cubemapMaterial = mo(), this._compileMaterial(this._cubemapMaterial));
  }
  /**
   * Pre-compiles the equirectangular shader. You can get faster start-up by invoking this method during
   * your texture's network fetch for increased concurrency.
   */
  compileEquirectangularShader() {
    this._equirectMaterial === null && (this._equirectMaterial = po(), this._compileMaterial(this._equirectMaterial));
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
    this._renderer.setRenderTarget(qr, jr, Yr), this._renderer.xr.enabled = Kr, e.scissorTest = !1, Vs(e, 0, 0, e.width, e.height);
  }
  _fromTexture(e, t) {
    e.mapping === 301 || e.mapping === 302 ? this._setSize(e.image.length === 0 ? 16 : e.image[0].width || e.image[0].image.width) : this._setSize(e.image.width / 4), qr = this._renderer.getRenderTarget(), jr = this._renderer.getActiveCubeFace(), Yr = this._renderer.getActiveMipmapLevel(), Kr = this._renderer.xr.enabled, this._renderer.xr.enabled = !1;
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
      colorSpace: Gt,
      depthBuffer: !1
    }, i = fo(e, t, n);
    if (this._pingPongRenderTarget === null || this._pingPongRenderTarget.width !== e || this._pingPongRenderTarget.height !== t) {
      this._pingPongRenderTarget !== null && this._dispose(), this._pingPongRenderTarget = fo(e, t, n);
      const { _lodMax: r } = this;
      ({ sizeLods: this._sizeLods, lodPlanes: this._lodPlanes, sigmas: this._sigmas } = Cd(r)), this._blurMaterial = Id(r, e, t);
    }
    return i;
  }
  _compileMaterial(e) {
    const t = new Le(this._lodPlanes[0], e);
    this._renderer.compile(t, Xr);
  }
  _sceneToCubeUV(e, t, n, i) {
    const o = new tn(90, 1, t, n), c = [1, -1, 1, 1, 1, 1], l = [1, 1, 1, -1, -1, -1], u = this._renderer, h = u.autoClear, d = u.toneMapping;
    u.getClearColor(lo), u.toneMapping = 0, u.autoClear = !1;
    const f = new At({
      name: "PMREM.Background",
      side: 1,
      depthWrite: !1,
      depthTest: !1
    }), g = new Le(new yt(), f);
    let _ = !1;
    const p = e.background;
    p ? p.isColor && (f.color.copy(p), e.background = null, _ = !0) : (f.color.copy(lo), _ = !0);
    for (let m = 0; m < 6; m++) {
      const T = m % 3;
      T === 0 ? (o.up.set(0, c[m], 0), o.lookAt(l[m], 0, 0)) : T === 1 ? (o.up.set(0, 0, c[m]), o.lookAt(0, l[m], 0)) : (o.up.set(0, c[m], 0), o.lookAt(0, 0, l[m]));
      const S = this._cubeSize;
      Vs(i, T * S, m > 2 ? S : 0, S, S), u.setRenderTarget(i), _ && u.render(g, o), u.render(e, o);
    }
    g.geometry.dispose(), g.material.dispose(), u.toneMapping = d, u.autoClear = h, e.background = p;
  }
  _textureToCubeUV(e, t) {
    const n = this._renderer, i = e.mapping === 301 || e.mapping === 302;
    i ? (this._cubemapMaterial === null && (this._cubemapMaterial = mo()), this._cubemapMaterial.uniforms.flipEnvMap.value = e.isRenderTargetTexture === !1 ? -1 : 1) : this._equirectMaterial === null && (this._equirectMaterial = po());
    const r = i ? this._cubemapMaterial : this._equirectMaterial, a = new Le(this._lodPlanes[0], r), o = r.uniforms;
    o.envMap.value = e;
    const c = this._cubeSize;
    Vs(t, 0, 0, 3 * c, 2 * c), n.setRenderTarget(t), n.render(a, Xr);
  }
  _applyPMREM(e) {
    const t = this._renderer, n = t.autoClear;
    t.autoClear = !1;
    const i = this._lodPlanes.length;
    for (let r = 1; r < i; r++) {
      const a = Math.sqrt(this._sigmas[r] * this._sigmas[r] - this._sigmas[r - 1] * this._sigmas[r - 1]), o = ho[(i - r - 1) % ho.length];
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
    const u = 3, h = new Le(this._lodPlanes[i], l), d = l.uniforms, f = this._sizeLods[n] - 1, g = isFinite(r) ? Math.PI / (2 * f) : 2 * Math.PI / (2 * fi - 1), _ = r / g, p = isFinite(r) ? 1 + Math.floor(u * _) : fi;
    p > fi && console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${fi}`);
    const m = [];
    let T = 0;
    for (let I = 0; I < fi; ++I) {
      const z = I / _, Q = Math.exp(-z * z / 2);
      m.push(Q), I === 0 ? T += Q : I < p && (T += 2 * Q);
    }
    for (let I = 0; I < m.length; I++)
      m[I] = m[I] / T;
    d.envMap.value = e.texture, d.samples.value = p, d.weights.value = m, d.latitudinal.value = a === "latitudinal", o && (d.poleAxis.value = o);
    const { _lodMax: S } = this;
    d.dTheta.value = g, d.mipInt.value = S - n;
    const A = this._sizeLods[i], F = 3 * A * (i > S - Bi ? i - S + Bi : 0), C = 4 * (this._cubeSize - A);
    Vs(t, F, C, 3 * A, 2 * A), c.setRenderTarget(t), c.render(h, Xr);
  }
}
function Cd(s) {
  const e = [], t = [], n = [];
  let i = s;
  const r = s - Bi + 1 + co.length;
  for (let a = 0; a < r; a++) {
    const o = Math.pow(2, i);
    t.push(o);
    let c = 1 / o;
    a > s - Bi ? c = co[a - s + Bi - 1] : a === 0 && (c = 0), n.push(c);
    const l = 1 / (o - 2), u = -l, h = 1 + l, d = [u, u, h, u, h, h, u, u, h, h, u, h], f = 6, g = 6, _ = 3, p = 2, m = 1, T = new Float32Array(_ * g * f), S = new Float32Array(p * g * f), A = new Float32Array(m * g * f);
    for (let C = 0; C < f; C++) {
      const I = C % 3 * 2 / 3 - 1, z = C > 2 ? 0 : -1, Q = [
        I,
        z,
        0,
        I + 2 / 3,
        z,
        0,
        I + 2 / 3,
        z + 1,
        0,
        I,
        z,
        0,
        I + 2 / 3,
        z + 1,
        0,
        I,
        z + 1,
        0
      ];
      T.set(Q, _ * g * C), S.set(d, p * g * C);
      const v = [C, C, C, C, C, C];
      A.set(v, m * g * C);
    }
    const F = new It();
    F.setAttribute("position", new Jt(T, _)), F.setAttribute("uv", new Jt(S, p)), F.setAttribute("faceIndex", new Jt(A, m)), e.push(F), i > Bi && i--;
  }
  return { lodPlanes: e, sizeLods: t, sigmas: n };
}
function fo(s, e, t) {
  const n = new _i(s, e, t);
  return n.texture.mapping = 306, n.texture.name = "PMREM.cubeUv", n.scissorTest = !0, n;
}
function Vs(s, e, t, n, i) {
  s.viewport.set(e, t, n, i), s.scissor.set(e, t, n, i);
}
function Id(s, e, t) {
  const n = new Float32Array(fi), i = new N(0, 1, 0);
  return new $n({
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
    vertexShader: Sa(),
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
function po() {
  return new $n({
    name: "EquirectangularToCubeUV",
    uniforms: {
      envMap: { value: null }
    },
    vertexShader: Sa(),
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
function mo() {
  return new $n({
    name: "CubemapToCubeUV",
    uniforms: {
      envMap: { value: null },
      flipEnvMap: { value: -1 }
    },
    vertexShader: Sa(),
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
function Sa() {
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
function Pd(s) {
  let e = /* @__PURE__ */ new WeakMap(), t = null;
  function n(o) {
    if (o && o.isTexture) {
      const c = o.mapping, l = c === 303 || c === 304, u = c === 301 || c === 302;
      if (l || u) {
        let h = e.get(o);
        const d = h !== void 0 ? h.texture.pmremVersion : 0;
        if (o.isRenderTargetTexture && o.pmremVersion !== d)
          return t === null && (t = new uo(s)), h = l ? t.fromEquirectangular(o, h) : t.fromCubemap(o, h), h.texture.pmremVersion = o.pmremVersion, e.set(o, h), h.texture;
        if (h !== void 0)
          return h.texture;
        {
          const f = o.image;
          return l && f && f.height > 0 || u && f && i(f) ? (t === null && (t = new uo(s)), h = l ? t.fromEquirectangular(o) : t.fromCubemap(o), h.texture.pmremVersion = o.pmremVersion, e.set(o, h), o.addEventListener("dispose", r), h.texture) : null;
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
function Ld(s) {
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
      return i === null && ir("THREE.WebGLRenderer: " + n + " extension not supported."), i;
    }
  };
}
function Dd(s, e, t, n) {
  const i = {}, r = /* @__PURE__ */ new WeakMap();
  function a(h) {
    const d = h.target;
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
  function o(h, d) {
    return i[d.id] === !0 || (d.addEventListener("dispose", a), i[d.id] = !0, t.memory.geometries++), d;
  }
  function c(h) {
    const d = h.attributes;
    for (const g in d)
      e.update(d[g], s.ARRAY_BUFFER);
    const f = h.morphAttributes;
    for (const g in f) {
      const _ = f[g];
      for (let p = 0, m = _.length; p < m; p++)
        e.update(_[p], s.ARRAY_BUFFER);
    }
  }
  function l(h) {
    const d = [], f = h.index, g = h.attributes.position;
    let _ = 0;
    if (f !== null) {
      const T = f.array;
      _ = f.version;
      for (let S = 0, A = T.length; S < A; S += 3) {
        const F = T[S + 0], C = T[S + 1], I = T[S + 2];
        d.push(F, C, C, I, I, F);
      }
    } else if (g !== void 0) {
      const T = g.array;
      _ = g.version;
      for (let S = 0, A = T.length / 3 - 1; S < A; S += 3) {
        const F = S + 0, C = S + 1, I = S + 2;
        d.push(F, C, C, I, I, F);
      }
    } else
      return;
    const p = new (hc(d) ? mc : pc)(d, 1);
    p.version = _;
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
function Ud(s, e, t) {
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
  function h(d, f, g, _) {
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
  this.setMode = i, this.setIndex = o, this.render = c, this.renderInstances = l, this.renderMultiDraw = u, this.renderMultiDrawInstances = h;
}
function Nd(s) {
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
function Fd(s, e, t) {
  const n = /* @__PURE__ */ new WeakMap(), i = new ft();
  function r(a, o, c) {
    const l = a.morphTargetInfluences, u = o.morphAttributes.position || o.morphAttributes.normal || o.morphAttributes.color, h = u !== void 0 ? u.length : 0;
    let d = n.get(o);
    if (d === void 0 || d.count !== h) {
      let Q = function() {
        I.dispose(), n.delete(o), o.removeEventListener("dispose", Q);
      };
      d !== void 0 && d.texture.dispose();
      const f = o.morphAttributes.position !== void 0, g = o.morphAttributes.normal !== void 0, _ = o.morphAttributes.color !== void 0, p = o.morphAttributes.position || [], m = o.morphAttributes.normal || [], T = o.morphAttributes.color || [];
      let S = 0;
      f === !0 && (S = 1), g === !0 && (S = 2), _ === !0 && (S = 3);
      let A = o.attributes.position.count * S, F = 1;
      A > e.maxTextureSize && (F = Math.ceil(A / e.maxTextureSize), A = e.maxTextureSize);
      const C = new Float32Array(A * F * 4 * h), I = new dc(C, A, F, h);
      I.type = 1015, I.needsUpdate = !0;
      const z = S * 4;
      for (let v = 0; v < h; v++) {
        const E = p[v], W = m[v], X = T[v], K = A * F * 4 * v;
        for (let te = 0; te < E.count; te++) {
          const j = te * z;
          f === !0 && (i.fromBufferAttribute(E, te), C[K + j + 0] = i.x, C[K + j + 1] = i.y, C[K + j + 2] = i.z, C[K + j + 3] = 0), g === !0 && (i.fromBufferAttribute(W, te), C[K + j + 4] = i.x, C[K + j + 5] = i.y, C[K + j + 6] = i.z, C[K + j + 7] = 0), _ === !0 && (i.fromBufferAttribute(X, te), C[K + j + 8] = i.x, C[K + j + 9] = i.y, C[K + j + 10] = i.z, C[K + j + 11] = X.itemSize === 4 ? i.w : 1);
        }
      }
      d = {
        count: h,
        texture: I,
        size: new je(A, F)
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
function Bd(s, e, t, n) {
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
class Mc extends Nt {
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
const yc = /* @__PURE__ */ new Nt(), go = /* @__PURE__ */ new Mc(1, 1), Sc = /* @__PURE__ */ new dc(), Ec = /* @__PURE__ */ new El(), Tc = /* @__PURE__ */ new xc(), _o = [], xo = [], vo = new Float32Array(16), Mo = new Float32Array(9), yo = new Float32Array(4);
function Zi(s, e, t) {
  const n = s[0];
  if (n <= 0 || n > 0) return s;
  const i = e * t;
  let r = _o[i];
  if (r === void 0 && (r = new Float32Array(i), _o[i] = r), e !== 0) {
    n.toArray(r, 0);
    for (let a = 1, o = 0; a !== e; ++a)
      o += t, s[a].toArray(r, o);
  }
  return r;
}
function Ft(s, e) {
  if (s.length !== e.length) return !1;
  for (let t = 0, n = s.length; t < n; t++)
    if (s[t] !== e[t]) return !1;
  return !0;
}
function Bt(s, e) {
  for (let t = 0, n = e.length; t < n; t++)
    s[t] = e[t];
}
function fr(s, e) {
  let t = xo[e];
  t === void 0 && (t = new Int32Array(e), xo[e] = t);
  for (let n = 0; n !== e; ++n)
    t[n] = s.allocateTextureUnit();
  return t;
}
function Od(s, e) {
  const t = this.cache;
  t[0] !== e && (s.uniform1f(this.addr, e), t[0] = e);
}
function kd(s, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y) && (s.uniform2f(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);
  else {
    if (Ft(t, e)) return;
    s.uniform2fv(this.addr, e), Bt(t, e);
  }
}
function zd(s, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (s.uniform3f(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);
  else if (e.r !== void 0)
    (t[0] !== e.r || t[1] !== e.g || t[2] !== e.b) && (s.uniform3f(this.addr, e.r, e.g, e.b), t[0] = e.r, t[1] = e.g, t[2] = e.b);
  else {
    if (Ft(t, e)) return;
    s.uniform3fv(this.addr, e), Bt(t, e);
  }
}
function Gd(s, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (s.uniform4f(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);
  else {
    if (Ft(t, e)) return;
    s.uniform4fv(this.addr, e), Bt(t, e);
  }
}
function Hd(s, e) {
  const t = this.cache, n = e.elements;
  if (n === void 0) {
    if (Ft(t, e)) return;
    s.uniformMatrix2fv(this.addr, !1, e), Bt(t, e);
  } else {
    if (Ft(t, n)) return;
    yo.set(n), s.uniformMatrix2fv(this.addr, !1, yo), Bt(t, n);
  }
}
function Vd(s, e) {
  const t = this.cache, n = e.elements;
  if (n === void 0) {
    if (Ft(t, e)) return;
    s.uniformMatrix3fv(this.addr, !1, e), Bt(t, e);
  } else {
    if (Ft(t, n)) return;
    Mo.set(n), s.uniformMatrix3fv(this.addr, !1, Mo), Bt(t, n);
  }
}
function Wd(s, e) {
  const t = this.cache, n = e.elements;
  if (n === void 0) {
    if (Ft(t, e)) return;
    s.uniformMatrix4fv(this.addr, !1, e), Bt(t, e);
  } else {
    if (Ft(t, n)) return;
    vo.set(n), s.uniformMatrix4fv(this.addr, !1, vo), Bt(t, n);
  }
}
function Xd(s, e) {
  const t = this.cache;
  t[0] !== e && (s.uniform1i(this.addr, e), t[0] = e);
}
function qd(s, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y) && (s.uniform2i(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);
  else {
    if (Ft(t, e)) return;
    s.uniform2iv(this.addr, e), Bt(t, e);
  }
}
function jd(s, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (s.uniform3i(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);
  else {
    if (Ft(t, e)) return;
    s.uniform3iv(this.addr, e), Bt(t, e);
  }
}
function Yd(s, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (s.uniform4i(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);
  else {
    if (Ft(t, e)) return;
    s.uniform4iv(this.addr, e), Bt(t, e);
  }
}
function Kd(s, e) {
  const t = this.cache;
  t[0] !== e && (s.uniform1ui(this.addr, e), t[0] = e);
}
function Zd(s, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y) && (s.uniform2ui(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);
  else {
    if (Ft(t, e)) return;
    s.uniform2uiv(this.addr, e), Bt(t, e);
  }
}
function $d(s, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (s.uniform3ui(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);
  else {
    if (Ft(t, e)) return;
    s.uniform3uiv(this.addr, e), Bt(t, e);
  }
}
function Jd(s, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (s.uniform4ui(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);
  else {
    if (Ft(t, e)) return;
    s.uniform4uiv(this.addr, e), Bt(t, e);
  }
}
function Qd(s, e, t) {
  const n = this.cache, i = t.allocateTextureUnit();
  n[0] !== i && (s.uniform1i(this.addr, i), n[0] = i);
  let r;
  this.type === s.SAMPLER_2D_SHADOW ? (go.compareFunction = 515, r = go) : r = yc, t.setTexture2D(e || r, i);
}
function ef(s, e, t) {
  const n = this.cache, i = t.allocateTextureUnit();
  n[0] !== i && (s.uniform1i(this.addr, i), n[0] = i), t.setTexture3D(e || Ec, i);
}
function tf(s, e, t) {
  const n = this.cache, i = t.allocateTextureUnit();
  n[0] !== i && (s.uniform1i(this.addr, i), n[0] = i), t.setTextureCube(e || Tc, i);
}
function nf(s, e, t) {
  const n = this.cache, i = t.allocateTextureUnit();
  n[0] !== i && (s.uniform1i(this.addr, i), n[0] = i), t.setTexture2DArray(e || Sc, i);
}
function sf(s) {
  switch (s) {
    case 5126:
      return Od;
    case 35664:
      return kd;
    case 35665:
      return zd;
    case 35666:
      return Gd;
    case 35674:
      return Hd;
    case 35675:
      return Vd;
    case 35676:
      return Wd;
    case 5124:
    case 35670:
      return Xd;
    case 35667:
    case 35671:
      return qd;
    case 35668:
    case 35672:
      return jd;
    case 35669:
    case 35673:
      return Yd;
    case 5125:
      return Kd;
    case 36294:
      return Zd;
    case 36295:
      return $d;
    case 36296:
      return Jd;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return Qd;
    case 35679:
    case 36299:
    case 36307:
      return ef;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return tf;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return nf;
  }
}
function rf(s, e) {
  s.uniform1fv(this.addr, e);
}
function af(s, e) {
  const t = Zi(e, this.size, 2);
  s.uniform2fv(this.addr, t);
}
function of(s, e) {
  const t = Zi(e, this.size, 3);
  s.uniform3fv(this.addr, t);
}
function cf(s, e) {
  const t = Zi(e, this.size, 4);
  s.uniform4fv(this.addr, t);
}
function lf(s, e) {
  const t = Zi(e, this.size, 4);
  s.uniformMatrix2fv(this.addr, !1, t);
}
function hf(s, e) {
  const t = Zi(e, this.size, 9);
  s.uniformMatrix3fv(this.addr, !1, t);
}
function uf(s, e) {
  const t = Zi(e, this.size, 16);
  s.uniformMatrix4fv(this.addr, !1, t);
}
function df(s, e) {
  s.uniform1iv(this.addr, e);
}
function ff(s, e) {
  s.uniform2iv(this.addr, e);
}
function pf(s, e) {
  s.uniform3iv(this.addr, e);
}
function mf(s, e) {
  s.uniform4iv(this.addr, e);
}
function gf(s, e) {
  s.uniform1uiv(this.addr, e);
}
function _f(s, e) {
  s.uniform2uiv(this.addr, e);
}
function xf(s, e) {
  s.uniform3uiv(this.addr, e);
}
function vf(s, e) {
  s.uniform4uiv(this.addr, e);
}
function Mf(s, e, t) {
  const n = this.cache, i = e.length, r = fr(t, i);
  Ft(n, r) || (s.uniform1iv(this.addr, r), Bt(n, r));
  for (let a = 0; a !== i; ++a)
    t.setTexture2D(e[a] || yc, r[a]);
}
function yf(s, e, t) {
  const n = this.cache, i = e.length, r = fr(t, i);
  Ft(n, r) || (s.uniform1iv(this.addr, r), Bt(n, r));
  for (let a = 0; a !== i; ++a)
    t.setTexture3D(e[a] || Ec, r[a]);
}
function Sf(s, e, t) {
  const n = this.cache, i = e.length, r = fr(t, i);
  Ft(n, r) || (s.uniform1iv(this.addr, r), Bt(n, r));
  for (let a = 0; a !== i; ++a)
    t.setTextureCube(e[a] || Tc, r[a]);
}
function Ef(s, e, t) {
  const n = this.cache, i = e.length, r = fr(t, i);
  Ft(n, r) || (s.uniform1iv(this.addr, r), Bt(n, r));
  for (let a = 0; a !== i; ++a)
    t.setTexture2DArray(e[a] || Sc, r[a]);
}
function Tf(s) {
  switch (s) {
    case 5126:
      return rf;
    case 35664:
      return af;
    case 35665:
      return of;
    case 35666:
      return cf;
    case 35674:
      return lf;
    case 35675:
      return hf;
    case 35676:
      return uf;
    case 5124:
    case 35670:
      return df;
    case 35667:
    case 35671:
      return ff;
    case 35668:
    case 35672:
      return pf;
    case 35669:
    case 35673:
      return mf;
    case 5125:
      return gf;
    case 36294:
      return _f;
    case 36295:
      return xf;
    case 36296:
      return vf;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return Mf;
    case 35679:
    case 36299:
    case 36307:
      return yf;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return Sf;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return Ef;
  }
}
class Af {
  constructor(e, t, n) {
    this.id = e, this.addr = n, this.cache = [], this.type = t.type, this.setValue = sf(t.type);
  }
}
class bf {
  constructor(e, t, n) {
    this.id = e, this.addr = n, this.cache = [], this.type = t.type, this.size = t.size, this.setValue = Tf(t.type);
  }
}
class wf {
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
const Zr = /(\w+)(\])?(\[|\.)?/g;
function So(s, e) {
  s.seq.push(e), s.map[e.id] = e;
}
function Rf(s, e, t) {
  const n = s.name, i = n.length;
  for (Zr.lastIndex = 0; ; ) {
    const r = Zr.exec(n), a = Zr.lastIndex;
    let o = r[1];
    const c = r[2] === "]", l = r[3];
    if (c && (o = o | 0), l === void 0 || l === "[" && a + 2 === i) {
      So(t, l === void 0 ? new Af(o, s, e) : new bf(o, s, e));
      break;
    } else {
      let h = t.map[o];
      h === void 0 && (h = new wf(o), So(t, h)), t = h;
    }
  }
}
class sr {
  constructor(e, t) {
    this.seq = [], this.map = {};
    const n = e.getProgramParameter(t, e.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; ++i) {
      const r = e.getActiveUniform(t, i), a = e.getUniformLocation(t, r.name);
      Rf(r, a, this);
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
function Eo(s, e, t) {
  const n = s.createShader(e);
  return s.shaderSource(n, t), s.compileShader(n), n;
}
const Cf = 37297;
let If = 0;
function Pf(s, e) {
  const t = s.split(`
`), n = [], i = Math.max(e - 6, 0), r = Math.min(e + 6, t.length);
  for (let a = i; a < r; a++) {
    const o = a + 1;
    n.push(`${o === e ? ">" : " "} ${o}: ${t[a]}`);
  }
  return n.join(`
`);
}
function Lf(s) {
  const e = at.getPrimaries(at.workingColorSpace), t = at.getPrimaries(s);
  let n;
  switch (e === t ? n = "" : e === cr && t === or ? n = "LinearDisplayP3ToLinearSRGB" : e === or && t === cr && (n = "LinearSRGBToLinearDisplayP3"), s) {
    case Gt:
    case ur:
      return [n, "LinearTransferOETF"];
    case Rt:
    case xa:
      return [n, "sRGBTransferOETF"];
    default:
      return console.warn("THREE.WebGLProgram: Unsupported color space:", s), [n, "LinearTransferOETF"];
  }
}
function To(s, e, t) {
  const n = s.getShaderParameter(e, s.COMPILE_STATUS), i = s.getShaderInfoLog(e).trim();
  if (n && i === "") return "";
  const r = /ERROR: 0:(\d+)/.exec(i);
  if (r) {
    const a = parseInt(r[1]);
    return t.toUpperCase() + `

` + i + `

` + Pf(s.getShaderSource(e), a);
  } else
    return i;
}
function Df(s, e) {
  const t = Lf(e);
  return `vec4 ${s}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`;
}
function Uf(s, e) {
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
const Ws = /* @__PURE__ */ new N();
function Nf() {
  at.getLuminanceCoefficients(Ws);
  const s = Ws.x.toFixed(4), e = Ws.y.toFixed(4), t = Ws.z.toFixed(4);
  return [
    "float luminance( const in vec3 rgb ) {",
    `	const vec3 weights = vec3( ${s}, ${e}, ${t} );`,
    "	return dot( weights, rgb );",
    "}"
  ].join(`
`);
}
function Ff(s) {
  return [
    s.extensionClipCullDistance ? "#extension GL_ANGLE_clip_cull_distance : require" : "",
    s.extensionMultiDraw ? "#extension GL_ANGLE_multi_draw : require" : ""
  ].filter(ms).join(`
`);
}
function Bf(s) {
  const e = [];
  for (const t in s) {
    const n = s[t];
    n !== !1 && e.push("#define " + t + " " + n);
  }
  return e.join(`
`);
}
function Of(s, e) {
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
function ms(s) {
  return s !== "";
}
function Ao(s, e) {
  const t = e.numSpotLightShadows + e.numSpotLightMaps - e.numSpotLightShadowsWithMaps;
  return s.replace(/NUM_DIR_LIGHTS/g, e.numDirLights).replace(/NUM_SPOT_LIGHTS/g, e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g, e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g, t).replace(/NUM_RECT_AREA_LIGHTS/g, e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g, e.numPointLights).replace(/NUM_HEMI_LIGHTS/g, e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g, e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g, e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g, e.numPointLightShadows);
}
function bo(s, e) {
  return s.replace(/NUM_CLIPPING_PLANES/g, e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g, e.numClippingPlanes - e.numClipIntersection);
}
const kf = /^[ \t]*#include +<([\w\d./]+)>/gm;
function ha(s) {
  return s.replace(kf, Gf);
}
const zf = /* @__PURE__ */ new Map();
function Gf(s, e) {
  let t = $e[e];
  if (t === void 0) {
    const n = zf.get(e);
    if (n !== void 0)
      t = $e[n], console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.', e, n);
    else
      throw new Error("Can not resolve #include <" + e + ">");
  }
  return ha(t);
}
const Hf = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
function wo(s) {
  return s.replace(Hf, Vf);
}
function Vf(s, e, t, n) {
  let i = "";
  for (let r = parseInt(e); r < parseInt(t); r++)
    i += n.replace(/\[\s*i\s*\]/g, "[ " + r + " ]").replace(/UNROLLED_LOOP_INDEX/g, r);
  return i;
}
function Ro(s) {
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
function Wf(s) {
  let e = "SHADOWMAP_TYPE_BASIC";
  return s.shadowMapType === 1 ? e = "SHADOWMAP_TYPE_PCF" : s.shadowMapType === 2 ? e = "SHADOWMAP_TYPE_PCF_SOFT" : s.shadowMapType === 3 && (e = "SHADOWMAP_TYPE_VSM"), e;
}
function Xf(s) {
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
function qf(s) {
  let e = "ENVMAP_MODE_REFLECTION";
  if (s.envMap)
    switch (s.envMapMode) {
      case 302:
        e = "ENVMAP_MODE_REFRACTION";
        break;
    }
  return e;
}
function jf(s) {
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
function Yf(s) {
  const e = s.envMapCubeUVHeight;
  if (e === null) return null;
  const t = Math.log2(e) - 2, n = 1 / e;
  return { texelWidth: 1 / (3 * Math.max(Math.pow(2, t), 7 * 16)), texelHeight: n, maxMip: t };
}
function Kf(s, e, t, n) {
  const i = s.getContext(), r = t.defines;
  let a = t.vertexShader, o = t.fragmentShader;
  const c = Wf(t), l = Xf(t), u = qf(t), h = jf(t), d = Yf(t), f = Ff(t), g = Bf(r), _ = i.createProgram();
  let p, m, T = t.glslVersion ? "#version " + t.glslVersion + `
` : "";
  t.isRawShaderMaterial ? (p = [
    "#define SHADER_TYPE " + t.shaderType,
    "#define SHADER_NAME " + t.shaderName,
    g
  ].filter(ms).join(`
`), p.length > 0 && (p += `
`), m = [
    "#define SHADER_TYPE " + t.shaderType,
    "#define SHADER_NAME " + t.shaderName,
    g
  ].filter(ms).join(`
`), m.length > 0 && (m += `
`)) : (p = [
    Ro(t),
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
  ].filter(ms).join(`
`), m = [
    Ro(t),
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
    t.toneMapping !== 0 ? $e.tonemapping_pars_fragment : "",
    // this code is required here because it is used by the toneMapping() function defined below
    t.toneMapping !== 0 ? Uf("toneMapping", t.toneMapping) : "",
    t.dithering ? "#define DITHERING" : "",
    t.opaque ? "#define OPAQUE" : "",
    $e.colorspace_pars_fragment,
    // this code is required here because it is used by the various encoding/decoding function defined below
    Df("linearToOutputTexel", t.outputColorSpace),
    Nf(),
    t.useDepthPacking ? "#define DEPTH_PACKING " + t.depthPacking : "",
    `
`
  ].filter(ms).join(`
`)), a = ha(a), a = Ao(a, t), a = bo(a, t), o = ha(o), o = Ao(o, t), o = bo(o, t), a = wo(a), o = wo(o), t.isRawShaderMaterial !== !0 && (T = `#version 300 es
`, p = [
    f,
    "#define attribute in",
    "#define varying out",
    "#define texture2D texture"
  ].join(`
`) + `
` + p, m = [
    "#define varying in",
    t.glslVersion === Va ? "" : "layout(location = 0) out highp vec4 pc_fragColor;",
    t.glslVersion === Va ? "" : "#define gl_FragColor pc_fragColor",
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
  const S = T + p + a, A = T + m + o, F = Eo(i, i.VERTEX_SHADER, S), C = Eo(i, i.FRAGMENT_SHADER, A);
  i.attachShader(_, F), i.attachShader(_, C), t.index0AttributeName !== void 0 ? i.bindAttribLocation(_, 0, t.index0AttributeName) : t.morphTargets === !0 && i.bindAttribLocation(_, 0, "position"), i.linkProgram(_);
  function I(E) {
    if (s.debug.checkShaderErrors) {
      const W = i.getProgramInfoLog(_).trim(), X = i.getShaderInfoLog(F).trim(), K = i.getShaderInfoLog(C).trim();
      let te = !0, j = !0;
      if (i.getProgramParameter(_, i.LINK_STATUS) === !1)
        if (te = !1, typeof s.debug.onShaderError == "function")
          s.debug.onShaderError(i, _, F, C);
        else {
          const oe = To(i, F, "vertex"), q = To(i, C, "fragment");
          console.error(
            "THREE.WebGLProgram: Shader Error " + i.getError() + " - VALIDATE_STATUS " + i.getProgramParameter(_, i.VALIDATE_STATUS) + `

Material Name: ` + E.name + `
Material Type: ` + E.type + `

Program Info Log: ` + W + `
` + oe + `
` + q
          );
        }
      else W !== "" ? console.warn("THREE.WebGLProgram: Program Info Log:", W) : (X === "" || K === "") && (j = !1);
      j && (E.diagnostics = {
        runnable: te,
        programLog: W,
        vertexShader: {
          log: X,
          prefix: p
        },
        fragmentShader: {
          log: K,
          prefix: m
        }
      });
    }
    i.deleteShader(F), i.deleteShader(C), z = new sr(i, _), Q = Of(i, _);
  }
  let z;
  this.getUniforms = function() {
    return z === void 0 && I(this), z;
  };
  let Q;
  this.getAttributes = function() {
    return Q === void 0 && I(this), Q;
  };
  let v = t.rendererExtensionParallelShaderCompile === !1;
  return this.isReady = function() {
    return v === !1 && (v = i.getProgramParameter(_, Cf)), v;
  }, this.destroy = function() {
    n.releaseStatesOfProgram(this), i.deleteProgram(_), this.program = void 0;
  }, this.type = t.shaderType, this.name = t.shaderName, this.id = If++, this.cacheKey = e, this.usedTimes = 1, this.program = _, this.vertexShader = F, this.fragmentShader = C, this;
}
let Zf = 0;
class $f {
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
    return n === void 0 && (n = new Jf(e), t.set(e, n)), n;
  }
}
class Jf {
  constructor(e) {
    this.id = Zf++, this.code = e, this.usedTimes = 0;
  }
}
function Qf(s, e, t, n, i, r, a) {
  const o = new Ma(), c = new $f(), l = /* @__PURE__ */ new Set(), u = [], h = i.logarithmicDepthBuffer, d = i.reverseDepthBuffer, f = i.vertexTextures;
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
  function p(v) {
    return l.add(v), v === 0 ? "uv" : `uv${v}`;
  }
  function m(v, E, W, X, K) {
    const te = X.fog, j = K.geometry, oe = v.isMeshStandardMaterial ? X.environment : null, q = (v.isMeshStandardMaterial ? t : e).get(v.envMap || oe), xe = q && q.mapping === 306 ? q.image.height : null, ve = _[v.type];
    v.precision !== null && (g = i.getMaxPrecision(v.precision), g !== v.precision && console.warn("THREE.WebGLProgram.getParameters:", v.precision, "not supported, using", g, "instead."));
    const Ae = j.morphAttributes.position || j.morphAttributes.normal || j.morphAttributes.color, Qe = Ae !== void 0 ? Ae.length : 0;
    let ht = 0;
    j.morphAttributes.position !== void 0 && (ht = 1), j.morphAttributes.normal !== void 0 && (ht = 2), j.morphAttributes.color !== void 0 && (ht = 3);
    let Z, se, Re, Me;
    if (ve) {
      const Ot = bn[ve];
      Z = Ot.vertexShader, se = Ot.fragmentShader;
    } else
      Z = v.vertexShader, se = v.fragmentShader, c.update(v), Re = c.getVertexShaderID(v), Me = c.getFragmentShaderID(v);
    const Ve = s.getRenderTarget(), Fe = K.isInstancedMesh === !0, it = K.isBatchedMesh === !0, ut = !!v.map, tt = !!v.matcap, U = !!q, He = !!v.aoMap, Te = !!v.lightMap, D = !!v.bumpMap, Oe = !!v.normalMap, vt = !!v.displacementMap, ze = !!v.emissiveMap, w = !!v.metalnessMap, M = !!v.roughnessMap, G = v.anisotropy > 0, $ = v.clearcoat > 0, ne = v.dispersion > 0, J = v.iridescence > 0, _e = v.sheen > 0, de = v.transmission > 0, ye = G && !!v.anisotropyMap, st = $ && !!v.clearcoatMap, re = $ && !!v.clearcoatNormalMap, Se = $ && !!v.clearcoatRoughnessMap, Be = J && !!v.iridescenceMap, De = J && !!v.iridescenceThicknessMap, Ee = _e && !!v.sheenColorMap, Ke = _e && !!v.sheenRoughnessMap, ke = !!v.specularMap, mt = !!v.specularColorMap, B = !!v.specularIntensityMap, ge = de && !!v.transmissionMap, Y = de && !!v.thicknessMap, ee = !!v.gradientMap, he = !!v.alphaMap, fe = v.alphaTest > 0, rt = !!v.alphaHash, Et = !!v.extensions;
    let Ht = 0;
    v.toneMapped && (Ve === null || Ve.isXRRenderTarget === !0) && (Ht = s.toneMapping);
    const nt = {
      shaderID: ve,
      shaderType: v.type,
      shaderName: v.name,
      vertexShader: Z,
      fragmentShader: se,
      defines: v.defines,
      customVertexShaderID: Re,
      customFragmentShaderID: Me,
      isRawShaderMaterial: v.isRawShaderMaterial === !0,
      glslVersion: v.glslVersion,
      precision: g,
      batching: it,
      batchingColor: it && K._colorsTexture !== null,
      instancing: Fe,
      instancingColor: Fe && K.instanceColor !== null,
      instancingMorph: Fe && K.morphTexture !== null,
      supportsVertexTextures: f,
      outputColorSpace: Ve === null ? s.outputColorSpace : Ve.isXRRenderTarget === !0 ? Ve.texture.colorSpace : Gt,
      alphaToCoverage: !!v.alphaToCoverage,
      map: ut,
      matcap: tt,
      envMap: U,
      envMapMode: U && q.mapping,
      envMapCubeUVHeight: xe,
      aoMap: He,
      lightMap: Te,
      bumpMap: D,
      normalMap: Oe,
      displacementMap: f && vt,
      emissiveMap: ze,
      normalMapObjectSpace: Oe && v.normalMapType === 1,
      normalMapTangentSpace: Oe && v.normalMapType === 0,
      metalnessMap: w,
      roughnessMap: M,
      anisotropy: G,
      anisotropyMap: ye,
      clearcoat: $,
      clearcoatMap: st,
      clearcoatNormalMap: re,
      clearcoatRoughnessMap: Se,
      dispersion: ne,
      iridescence: J,
      iridescenceMap: Be,
      iridescenceThicknessMap: De,
      sheen: _e,
      sheenColorMap: Ee,
      sheenRoughnessMap: Ke,
      specularMap: ke,
      specularColorMap: mt,
      specularIntensityMap: B,
      transmission: de,
      transmissionMap: ge,
      thicknessMap: Y,
      gradientMap: ee,
      opaque: v.transparent === !1 && v.blending === 1 && v.alphaToCoverage === !1,
      alphaMap: he,
      alphaTest: fe,
      alphaHash: rt,
      combine: v.combine,
      //
      mapUv: ut && p(v.map.channel),
      aoMapUv: He && p(v.aoMap.channel),
      lightMapUv: Te && p(v.lightMap.channel),
      bumpMapUv: D && p(v.bumpMap.channel),
      normalMapUv: Oe && p(v.normalMap.channel),
      displacementMapUv: vt && p(v.displacementMap.channel),
      emissiveMapUv: ze && p(v.emissiveMap.channel),
      metalnessMapUv: w && p(v.metalnessMap.channel),
      roughnessMapUv: M && p(v.roughnessMap.channel),
      anisotropyMapUv: ye && p(v.anisotropyMap.channel),
      clearcoatMapUv: st && p(v.clearcoatMap.channel),
      clearcoatNormalMapUv: re && p(v.clearcoatNormalMap.channel),
      clearcoatRoughnessMapUv: Se && p(v.clearcoatRoughnessMap.channel),
      iridescenceMapUv: Be && p(v.iridescenceMap.channel),
      iridescenceThicknessMapUv: De && p(v.iridescenceThicknessMap.channel),
      sheenColorMapUv: Ee && p(v.sheenColorMap.channel),
      sheenRoughnessMapUv: Ke && p(v.sheenRoughnessMap.channel),
      specularMapUv: ke && p(v.specularMap.channel),
      specularColorMapUv: mt && p(v.specularColorMap.channel),
      specularIntensityMapUv: B && p(v.specularIntensityMap.channel),
      transmissionMapUv: ge && p(v.transmissionMap.channel),
      thicknessMapUv: Y && p(v.thicknessMap.channel),
      alphaMapUv: he && p(v.alphaMap.channel),
      //
      vertexTangents: !!j.attributes.tangent && (Oe || G),
      vertexColors: v.vertexColors,
      vertexAlphas: v.vertexColors === !0 && !!j.attributes.color && j.attributes.color.itemSize === 4,
      pointsUvs: K.isPoints === !0 && !!j.attributes.uv && (ut || he),
      fog: !!te,
      useFog: v.fog === !0,
      fogExp2: !!te && te.isFogExp2,
      flatShading: v.flatShading === !0,
      sizeAttenuation: v.sizeAttenuation === !0,
      logarithmicDepthBuffer: h,
      reverseDepthBuffer: d,
      skinning: K.isSkinnedMesh === !0,
      morphTargets: j.morphAttributes.position !== void 0,
      morphNormals: j.morphAttributes.normal !== void 0,
      morphColors: j.morphAttributes.color !== void 0,
      morphTargetsCount: Qe,
      morphTextureStride: ht,
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
      dithering: v.dithering,
      shadowMapEnabled: s.shadowMap.enabled && W.length > 0,
      shadowMapType: s.shadowMap.type,
      toneMapping: Ht,
      decodeVideoTexture: ut && v.map.isVideoTexture === !0 && at.getTransfer(v.map.colorSpace) === St,
      premultipliedAlpha: v.premultipliedAlpha,
      doubleSided: v.side === 2,
      flipSided: v.side === 1,
      useDepthPacking: v.depthPacking >= 0,
      depthPacking: v.depthPacking || 0,
      index0AttributeName: v.index0AttributeName,
      extensionClipCullDistance: Et && v.extensions.clipCullDistance === !0 && n.has("WEBGL_clip_cull_distance"),
      extensionMultiDraw: (Et && v.extensions.multiDraw === !0 || it) && n.has("WEBGL_multi_draw"),
      rendererExtensionParallelShaderCompile: n.has("KHR_parallel_shader_compile"),
      customProgramCacheKey: v.customProgramCacheKey()
    };
    return nt.vertexUv1s = l.has(1), nt.vertexUv2s = l.has(2), nt.vertexUv3s = l.has(3), l.clear(), nt;
  }
  function T(v) {
    const E = [];
    if (v.shaderID ? E.push(v.shaderID) : (E.push(v.customVertexShaderID), E.push(v.customFragmentShaderID)), v.defines !== void 0)
      for (const W in v.defines)
        E.push(W), E.push(v.defines[W]);
    return v.isRawShaderMaterial === !1 && (S(E, v), A(E, v), E.push(s.outputColorSpace)), E.push(v.customProgramCacheKey), E.join();
  }
  function S(v, E) {
    v.push(E.precision), v.push(E.outputColorSpace), v.push(E.envMapMode), v.push(E.envMapCubeUVHeight), v.push(E.mapUv), v.push(E.alphaMapUv), v.push(E.lightMapUv), v.push(E.aoMapUv), v.push(E.bumpMapUv), v.push(E.normalMapUv), v.push(E.displacementMapUv), v.push(E.emissiveMapUv), v.push(E.metalnessMapUv), v.push(E.roughnessMapUv), v.push(E.anisotropyMapUv), v.push(E.clearcoatMapUv), v.push(E.clearcoatNormalMapUv), v.push(E.clearcoatRoughnessMapUv), v.push(E.iridescenceMapUv), v.push(E.iridescenceThicknessMapUv), v.push(E.sheenColorMapUv), v.push(E.sheenRoughnessMapUv), v.push(E.specularMapUv), v.push(E.specularColorMapUv), v.push(E.specularIntensityMapUv), v.push(E.transmissionMapUv), v.push(E.thicknessMapUv), v.push(E.combine), v.push(E.fogExp2), v.push(E.sizeAttenuation), v.push(E.morphTargetsCount), v.push(E.morphAttributeCount), v.push(E.numDirLights), v.push(E.numPointLights), v.push(E.numSpotLights), v.push(E.numSpotLightMaps), v.push(E.numHemiLights), v.push(E.numRectAreaLights), v.push(E.numDirLightShadows), v.push(E.numPointLightShadows), v.push(E.numSpotLightShadows), v.push(E.numSpotLightShadowsWithMaps), v.push(E.numLightProbes), v.push(E.shadowMapType), v.push(E.toneMapping), v.push(E.numClippingPlanes), v.push(E.numClipIntersection), v.push(E.depthPacking);
  }
  function A(v, E) {
    o.disableAll(), E.supportsVertexTextures && o.enable(0), E.instancing && o.enable(1), E.instancingColor && o.enable(2), E.instancingMorph && o.enable(3), E.matcap && o.enable(4), E.envMap && o.enable(5), E.normalMapObjectSpace && o.enable(6), E.normalMapTangentSpace && o.enable(7), E.clearcoat && o.enable(8), E.iridescence && o.enable(9), E.alphaTest && o.enable(10), E.vertexColors && o.enable(11), E.vertexAlphas && o.enable(12), E.vertexUv1s && o.enable(13), E.vertexUv2s && o.enable(14), E.vertexUv3s && o.enable(15), E.vertexTangents && o.enable(16), E.anisotropy && o.enable(17), E.alphaHash && o.enable(18), E.batching && o.enable(19), E.dispersion && o.enable(20), E.batchingColor && o.enable(21), v.push(o.mask), o.disableAll(), E.fog && o.enable(0), E.useFog && o.enable(1), E.flatShading && o.enable(2), E.logarithmicDepthBuffer && o.enable(3), E.reverseDepthBuffer && o.enable(4), E.skinning && o.enable(5), E.morphTargets && o.enable(6), E.morphNormals && o.enable(7), E.morphColors && o.enable(8), E.premultipliedAlpha && o.enable(9), E.shadowMapEnabled && o.enable(10), E.doubleSided && o.enable(11), E.flipSided && o.enable(12), E.useDepthPacking && o.enable(13), E.dithering && o.enable(14), E.transmission && o.enable(15), E.sheen && o.enable(16), E.opaque && o.enable(17), E.pointsUvs && o.enable(18), E.decodeVideoTexture && o.enable(19), E.alphaToCoverage && o.enable(20), v.push(o.mask);
  }
  function F(v) {
    const E = _[v.type];
    let W;
    if (E) {
      const X = bn[E];
      W = Nl.clone(X.uniforms);
    } else
      W = v.uniforms;
    return W;
  }
  function C(v, E) {
    let W;
    for (let X = 0, K = u.length; X < K; X++) {
      const te = u[X];
      if (te.cacheKey === E) {
        W = te, ++W.usedTimes;
        break;
      }
    }
    return W === void 0 && (W = new Kf(s, E, v, r), u.push(W)), W;
  }
  function I(v) {
    if (--v.usedTimes === 0) {
      const E = u.indexOf(v);
      u[E] = u[u.length - 1], u.pop(), v.destroy();
    }
  }
  function z(v) {
    c.remove(v);
  }
  function Q() {
    c.dispose();
  }
  return {
    getParameters: m,
    getProgramCacheKey: T,
    getUniforms: F,
    acquireProgram: C,
    releaseProgram: I,
    releaseShaderCache: z,
    // Exposed for resource monitoring & error feedback via renderer.info:
    programs: u,
    dispose: Q
  };
}
function ep() {
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
function tp(s, e) {
  return s.groupOrder !== e.groupOrder ? s.groupOrder - e.groupOrder : s.renderOrder !== e.renderOrder ? s.renderOrder - e.renderOrder : s.material.id !== e.material.id ? s.material.id - e.material.id : s.z !== e.z ? s.z - e.z : s.id - e.id;
}
function Co(s, e) {
  return s.groupOrder !== e.groupOrder ? s.groupOrder - e.groupOrder : s.renderOrder !== e.renderOrder ? s.renderOrder - e.renderOrder : s.z !== e.z ? e.z - s.z : s.id - e.id;
}
function Io() {
  const s = [];
  let e = 0;
  const t = [], n = [], i = [];
  function r() {
    e = 0, t.length = 0, n.length = 0, i.length = 0;
  }
  function a(h, d, f, g, _, p) {
    let m = s[e];
    return m === void 0 ? (m = {
      id: h.id,
      object: h,
      geometry: d,
      material: f,
      groupOrder: g,
      renderOrder: h.renderOrder,
      z: _,
      group: p
    }, s[e] = m) : (m.id = h.id, m.object = h, m.geometry = d, m.material = f, m.groupOrder = g, m.renderOrder = h.renderOrder, m.z = _, m.group = p), e++, m;
  }
  function o(h, d, f, g, _, p) {
    const m = a(h, d, f, g, _, p);
    f.transmission > 0 ? n.push(m) : f.transparent === !0 ? i.push(m) : t.push(m);
  }
  function c(h, d, f, g, _, p) {
    const m = a(h, d, f, g, _, p);
    f.transmission > 0 ? n.unshift(m) : f.transparent === !0 ? i.unshift(m) : t.unshift(m);
  }
  function l(h, d) {
    t.length > 1 && t.sort(h || tp), n.length > 1 && n.sort(d || Co), i.length > 1 && i.sort(d || Co);
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
function np() {
  let s = /* @__PURE__ */ new WeakMap();
  function e(n, i) {
    const r = s.get(n);
    let a;
    return r === void 0 ? (a = new Io(), s.set(n, [a])) : i >= r.length ? (a = new Io(), r.push(a)) : a = r[i], a;
  }
  function t() {
    s = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: e,
    dispose: t
  };
}
function ip() {
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
            color: new Pe()
          };
          break;
        case "SpotLight":
          t = {
            position: new N(),
            direction: new N(),
            color: new Pe(),
            distance: 0,
            coneCos: 0,
            penumbraCos: 0,
            decay: 0
          };
          break;
        case "PointLight":
          t = {
            position: new N(),
            color: new Pe(),
            distance: 0,
            decay: 0
          };
          break;
        case "HemisphereLight":
          t = {
            direction: new N(),
            skyColor: new Pe(),
            groundColor: new Pe()
          };
          break;
        case "RectAreaLight":
          t = {
            color: new Pe(),
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
function sp() {
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
            shadowMapSize: new je()
          };
          break;
        case "SpotLight":
          t = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new je()
          };
          break;
        case "PointLight":
          t = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new je(),
            shadowCameraNear: 1,
            shadowCameraFar: 1e3
          };
          break;
      }
      return s[e.id] = t, t;
    }
  };
}
let rp = 0;
function ap(s, e) {
  return (e.castShadow ? 2 : 0) - (s.castShadow ? 2 : 0) + (e.map ? 1 : 0) - (s.map ? 1 : 0);
}
function op(s) {
  const e = new ip(), t = sp(), n = {
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
  const i = new N(), r = new Ye(), a = new Ye();
  function o(l) {
    let u = 0, h = 0, d = 0;
    for (let Q = 0; Q < 9; Q++) n.probe[Q].set(0, 0, 0);
    let f = 0, g = 0, _ = 0, p = 0, m = 0, T = 0, S = 0, A = 0, F = 0, C = 0, I = 0;
    l.sort(ap);
    for (let Q = 0, v = l.length; Q < v; Q++) {
      const E = l[Q], W = E.color, X = E.intensity, K = E.distance, te = E.shadow && E.shadow.map ? E.shadow.map.texture : null;
      if (E.isAmbientLight)
        u += W.r * X, h += W.g * X, d += W.b * X;
      else if (E.isLightProbe) {
        for (let j = 0; j < 9; j++)
          n.probe[j].addScaledVector(E.sh.coefficients[j], X);
        I++;
      } else if (E.isDirectionalLight) {
        const j = e.get(E);
        if (j.color.copy(E.color).multiplyScalar(E.intensity), E.castShadow) {
          const oe = E.shadow, q = t.get(E);
          q.shadowIntensity = oe.intensity, q.shadowBias = oe.bias, q.shadowNormalBias = oe.normalBias, q.shadowRadius = oe.radius, q.shadowMapSize = oe.mapSize, n.directionalShadow[f] = q, n.directionalShadowMap[f] = te, n.directionalShadowMatrix[f] = E.shadow.matrix, T++;
        }
        n.directional[f] = j, f++;
      } else if (E.isSpotLight) {
        const j = e.get(E);
        j.position.setFromMatrixPosition(E.matrixWorld), j.color.copy(W).multiplyScalar(X), j.distance = K, j.coneCos = Math.cos(E.angle), j.penumbraCos = Math.cos(E.angle * (1 - E.penumbra)), j.decay = E.decay, n.spot[_] = j;
        const oe = E.shadow;
        if (E.map && (n.spotLightMap[F] = E.map, F++, oe.updateMatrices(E), E.castShadow && C++), n.spotLightMatrix[_] = oe.matrix, E.castShadow) {
          const q = t.get(E);
          q.shadowIntensity = oe.intensity, q.shadowBias = oe.bias, q.shadowNormalBias = oe.normalBias, q.shadowRadius = oe.radius, q.shadowMapSize = oe.mapSize, n.spotShadow[_] = q, n.spotShadowMap[_] = te, A++;
        }
        _++;
      } else if (E.isRectAreaLight) {
        const j = e.get(E);
        j.color.copy(W).multiplyScalar(X), j.halfWidth.set(E.width * 0.5, 0, 0), j.halfHeight.set(0, E.height * 0.5, 0), n.rectArea[p] = j, p++;
      } else if (E.isPointLight) {
        const j = e.get(E);
        if (j.color.copy(E.color).multiplyScalar(E.intensity), j.distance = E.distance, j.decay = E.decay, E.castShadow) {
          const oe = E.shadow, q = t.get(E);
          q.shadowIntensity = oe.intensity, q.shadowBias = oe.bias, q.shadowNormalBias = oe.normalBias, q.shadowRadius = oe.radius, q.shadowMapSize = oe.mapSize, q.shadowCameraNear = oe.camera.near, q.shadowCameraFar = oe.camera.far, n.pointShadow[g] = q, n.pointShadowMap[g] = te, n.pointShadowMatrix[g] = E.shadow.matrix, S++;
        }
        n.point[g] = j, g++;
      } else if (E.isHemisphereLight) {
        const j = e.get(E);
        j.skyColor.copy(E.color).multiplyScalar(X), j.groundColor.copy(E.groundColor).multiplyScalar(X), n.hemi[m] = j, m++;
      }
    }
    p > 0 && (s.has("OES_texture_float_linear") === !0 ? (n.rectAreaLTC1 = pe.LTC_FLOAT_1, n.rectAreaLTC2 = pe.LTC_FLOAT_2) : (n.rectAreaLTC1 = pe.LTC_HALF_1, n.rectAreaLTC2 = pe.LTC_HALF_2)), n.ambient[0] = u, n.ambient[1] = h, n.ambient[2] = d;
    const z = n.hash;
    (z.directionalLength !== f || z.pointLength !== g || z.spotLength !== _ || z.rectAreaLength !== p || z.hemiLength !== m || z.numDirectionalShadows !== T || z.numPointShadows !== S || z.numSpotShadows !== A || z.numSpotMaps !== F || z.numLightProbes !== I) && (n.directional.length = f, n.spot.length = _, n.rectArea.length = p, n.point.length = g, n.hemi.length = m, n.directionalShadow.length = T, n.directionalShadowMap.length = T, n.pointShadow.length = S, n.pointShadowMap.length = S, n.spotShadow.length = A, n.spotShadowMap.length = A, n.directionalShadowMatrix.length = T, n.pointShadowMatrix.length = S, n.spotLightMatrix.length = A + F - C, n.spotLightMap.length = F, n.numSpotLightShadowsWithMaps = C, n.numLightProbes = I, z.directionalLength = f, z.pointLength = g, z.spotLength = _, z.rectAreaLength = p, z.hemiLength = m, z.numDirectionalShadows = T, z.numPointShadows = S, z.numSpotShadows = A, z.numSpotMaps = F, z.numLightProbes = I, n.version = rp++);
  }
  function c(l, u) {
    let h = 0, d = 0, f = 0, g = 0, _ = 0;
    const p = u.matrixWorldInverse;
    for (let m = 0, T = l.length; m < T; m++) {
      const S = l[m];
      if (S.isDirectionalLight) {
        const A = n.directional[h];
        A.direction.setFromMatrixPosition(S.matrixWorld), i.setFromMatrixPosition(S.target.matrixWorld), A.direction.sub(i), A.direction.transformDirection(p), h++;
      } else if (S.isSpotLight) {
        const A = n.spot[f];
        A.position.setFromMatrixPosition(S.matrixWorld), A.position.applyMatrix4(p), A.direction.setFromMatrixPosition(S.matrixWorld), i.setFromMatrixPosition(S.target.matrixWorld), A.direction.sub(i), A.direction.transformDirection(p), f++;
      } else if (S.isRectAreaLight) {
        const A = n.rectArea[g];
        A.position.setFromMatrixPosition(S.matrixWorld), A.position.applyMatrix4(p), a.identity(), r.copy(S.matrixWorld), r.premultiply(p), a.extractRotation(r), A.halfWidth.set(S.width * 0.5, 0, 0), A.halfHeight.set(0, S.height * 0.5, 0), A.halfWidth.applyMatrix4(a), A.halfHeight.applyMatrix4(a), g++;
      } else if (S.isPointLight) {
        const A = n.point[d];
        A.position.setFromMatrixPosition(S.matrixWorld), A.position.applyMatrix4(p), d++;
      } else if (S.isHemisphereLight) {
        const A = n.hemi[_];
        A.direction.setFromMatrixPosition(S.matrixWorld), A.direction.transformDirection(p), _++;
      }
    }
  }
  return {
    setup: o,
    setupView: c,
    state: n
  };
}
function Po(s) {
  const e = new op(s), t = [], n = [];
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
function cp(s) {
  let e = /* @__PURE__ */ new WeakMap();
  function t(i, r = 0) {
    const a = e.get(i);
    let o;
    return a === void 0 ? (o = new Po(s), e.set(i, [o])) : r >= a.length ? (o = new Po(s), a.push(o)) : o = a[r], o;
  }
  function n() {
    e = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: t,
    dispose: n
  };
}
class lp extends on {
  constructor(e) {
    super(), this.isMeshDepthMaterial = !0, this.type = "MeshDepthMaterial", this.depthPacking = 3200, this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.wireframe = !1, this.wireframeLinewidth = 1, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.depthPacking = e.depthPacking, this.map = e.map, this.alphaMap = e.alphaMap, this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this;
  }
}
class hp extends on {
  constructor(e) {
    super(), this.isMeshDistanceMaterial = !0, this.type = "MeshDistanceMaterial", this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.map = e.map, this.alphaMap = e.alphaMap, this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this;
  }
}
const up = `void main() {
	gl_Position = vec4( position, 1.0 );
}`, dp = `uniform sampler2D shadow_pass;
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
function fp(s, e, t) {
  let n = new ya();
  const i = new je(), r = new je(), a = new ft(), o = new lp({ depthPacking: 3201 }), c = new hp(), l = {}, u = t.maxTextureSize, h = { 0: 1, 1: 0, 2: 2 }, d = new $n({
    defines: {
      VSM_SAMPLES: 8
    },
    uniforms: {
      shadow_pass: { value: null },
      resolution: { value: new je() },
      radius: { value: 4 }
    },
    vertexShader: up,
    fragmentShader: dp
  }), f = d.clone();
  f.defines.HORIZONTAL_PASS = 1;
  const g = new It();
  g.setAttribute(
    "position",
    new Jt(
      new Float32Array([-1, -1, 0.5, 3, -1, 0.5, -1, 3, 0.5]),
      3
    )
  );
  const _ = new Le(g, d), p = this;
  this.enabled = !1, this.autoUpdate = !0, this.needsUpdate = !1, this.type = 1;
  let m = this.type;
  this.render = function(C, I, z) {
    if (p.enabled === !1 || p.autoUpdate === !1 && p.needsUpdate === !1 || C.length === 0) return;
    const Q = s.getRenderTarget(), v = s.getActiveCubeFace(), E = s.getActiveMipmapLevel(), W = s.state;
    W.setBlending(0), W.buffers.color.setClear(1, 1, 1, 1), W.buffers.depth.setTest(!0), W.setScissorTest(!1);
    const X = m !== 3 && this.type === 3, K = m === 3 && this.type !== 3;
    for (let te = 0, j = C.length; te < j; te++) {
      const oe = C[te], q = oe.shadow;
      if (q === void 0) {
        console.warn("THREE.WebGLShadowMap:", oe, "has no shadow.");
        continue;
      }
      if (q.autoUpdate === !1 && q.needsUpdate === !1) continue;
      i.copy(q.mapSize);
      const xe = q.getFrameExtents();
      if (i.multiply(xe), r.copy(q.mapSize), (i.x > u || i.y > u) && (i.x > u && (r.x = Math.floor(u / xe.x), i.x = r.x * xe.x, q.mapSize.x = r.x), i.y > u && (r.y = Math.floor(u / xe.y), i.y = r.y * xe.y, q.mapSize.y = r.y)), q.map === null || X === !0 || K === !0) {
        const Ae = this.type !== 3 ? { minFilter: 1003, magFilter: 1003 } : {};
        q.map !== null && q.map.dispose(), q.map = new _i(i.x, i.y, Ae), q.map.texture.name = oe.name + ".shadowMap", q.camera.updateProjectionMatrix();
      }
      s.setRenderTarget(q.map), s.clear();
      const ve = q.getViewportCount();
      for (let Ae = 0; Ae < ve; Ae++) {
        const Qe = q.getViewport(Ae);
        a.set(
          r.x * Qe.x,
          r.y * Qe.y,
          r.x * Qe.z,
          r.y * Qe.w
        ), W.viewport(a), q.updateMatrices(oe, Ae), n = q.getFrustum(), A(I, z, q.camera, oe, this.type);
      }
      q.isPointLightShadow !== !0 && this.type === 3 && T(q, z), q.needsUpdate = !1;
    }
    m = this.type, p.needsUpdate = !1, s.setRenderTarget(Q, v, E);
  };
  function T(C, I) {
    const z = e.update(_);
    d.defines.VSM_SAMPLES !== C.blurSamples && (d.defines.VSM_SAMPLES = C.blurSamples, f.defines.VSM_SAMPLES = C.blurSamples, d.needsUpdate = !0, f.needsUpdate = !0), C.mapPass === null && (C.mapPass = new _i(i.x, i.y)), d.uniforms.shadow_pass.value = C.map.texture, d.uniforms.resolution.value = C.mapSize, d.uniforms.radius.value = C.radius, s.setRenderTarget(C.mapPass), s.clear(), s.renderBufferDirect(I, null, z, d, _, null), f.uniforms.shadow_pass.value = C.mapPass.texture, f.uniforms.resolution.value = C.mapSize, f.uniforms.radius.value = C.radius, s.setRenderTarget(C.map), s.clear(), s.renderBufferDirect(I, null, z, f, _, null);
  }
  function S(C, I, z, Q) {
    let v = null;
    const E = z.isPointLight === !0 ? C.customDistanceMaterial : C.customDepthMaterial;
    if (E !== void 0)
      v = E;
    else if (v = z.isPointLight === !0 ? c : o, s.localClippingEnabled && I.clipShadows === !0 && Array.isArray(I.clippingPlanes) && I.clippingPlanes.length !== 0 || I.displacementMap && I.displacementScale !== 0 || I.alphaMap && I.alphaTest > 0 || I.map && I.alphaTest > 0) {
      const W = v.uuid, X = I.uuid;
      let K = l[W];
      K === void 0 && (K = {}, l[W] = K);
      let te = K[X];
      te === void 0 && (te = v.clone(), K[X] = te, I.addEventListener("dispose", F)), v = te;
    }
    if (v.visible = I.visible, v.wireframe = I.wireframe, Q === 3 ? v.side = I.shadowSide !== null ? I.shadowSide : I.side : v.side = I.shadowSide !== null ? I.shadowSide : h[I.side], v.alphaMap = I.alphaMap, v.alphaTest = I.alphaTest, v.map = I.map, v.clipShadows = I.clipShadows, v.clippingPlanes = I.clippingPlanes, v.clipIntersection = I.clipIntersection, v.displacementMap = I.displacementMap, v.displacementScale = I.displacementScale, v.displacementBias = I.displacementBias, v.wireframeLinewidth = I.wireframeLinewidth, v.linewidth = I.linewidth, z.isPointLight === !0 && v.isMeshDistanceMaterial === !0) {
      const W = s.properties.get(v);
      W.light = z;
    }
    return v;
  }
  function A(C, I, z, Q, v) {
    if (C.visible === !1) return;
    if (C.layers.test(I.layers) && (C.isMesh || C.isLine || C.isPoints) && (C.castShadow || C.receiveShadow && v === 3) && (!C.frustumCulled || n.intersectsObject(C))) {
      C.modelViewMatrix.multiplyMatrices(z.matrixWorldInverse, C.matrixWorld);
      const X = e.update(C), K = C.material;
      if (Array.isArray(K)) {
        const te = X.groups;
        for (let j = 0, oe = te.length; j < oe; j++) {
          const q = te[j], xe = K[q.materialIndex];
          if (xe && xe.visible) {
            const ve = S(C, xe, Q, v);
            C.onBeforeShadow(s, C, I, z, X, ve, q), s.renderBufferDirect(z, null, X, ve, C, q), C.onAfterShadow(s, C, I, z, X, ve, q);
          }
        }
      } else if (K.visible) {
        const te = S(C, K, Q, v);
        C.onBeforeShadow(s, C, I, z, X, te, null), s.renderBufferDirect(z, null, X, te, C, null), C.onAfterShadow(s, C, I, z, X, te, null);
      }
    }
    const W = C.children;
    for (let X = 0, K = W.length; X < K; X++)
      A(W[X], I, z, Q, v);
  }
  function F(C) {
    C.target.removeEventListener("dispose", F);
    for (const z in l) {
      const Q = l[z], v = C.target.uuid;
      v in Q && (Q[v].dispose(), delete Q[v]);
    }
  }
}
const pp = {
  0: 1,
  2: 6,
  4: 7,
  3: 5,
  1: 0,
  6: 2,
  7: 4,
  5: 3
};
function mp(s) {
  function e() {
    let B = !1;
    const ge = new ft();
    let Y = null;
    const ee = new ft(0, 0, 0, 0);
    return {
      setMask: function(he) {
        Y !== he && !B && (s.colorMask(he, he, he, he), Y = he);
      },
      setLocked: function(he) {
        B = he;
      },
      setClear: function(he, fe, rt, Et, Ht) {
        Ht === !0 && (he *= Et, fe *= Et, rt *= Et), ge.set(he, fe, rt, Et), ee.equals(ge) === !1 && (s.clearColor(he, fe, rt, Et), ee.copy(ge));
      },
      reset: function() {
        B = !1, Y = null, ee.set(-1, 0, 0, 0);
      }
    };
  }
  function t() {
    let B = !1, ge = !1, Y = null, ee = null, he = null;
    return {
      setReversed: function(fe) {
        ge = fe;
      },
      setTest: function(fe) {
        fe ? Re(s.DEPTH_TEST) : Me(s.DEPTH_TEST);
      },
      setMask: function(fe) {
        Y !== fe && !B && (s.depthMask(fe), Y = fe);
      },
      setFunc: function(fe) {
        if (ge && (fe = pp[fe]), ee !== fe) {
          switch (fe) {
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
          ee = fe;
        }
      },
      setLocked: function(fe) {
        B = fe;
      },
      setClear: function(fe) {
        he !== fe && (s.clearDepth(fe), he = fe);
      },
      reset: function() {
        B = !1, Y = null, ee = null, he = null;
      }
    };
  }
  function n() {
    let B = !1, ge = null, Y = null, ee = null, he = null, fe = null, rt = null, Et = null, Ht = null;
    return {
      setTest: function(nt) {
        B || (nt ? Re(s.STENCIL_TEST) : Me(s.STENCIL_TEST));
      },
      setMask: function(nt) {
        ge !== nt && !B && (s.stencilMask(nt), ge = nt);
      },
      setFunc: function(nt, Ot, Qt) {
        (Y !== nt || ee !== Ot || he !== Qt) && (s.stencilFunc(nt, Ot, Qt), Y = nt, ee = Ot, he = Qt);
      },
      setOp: function(nt, Ot, Qt) {
        (fe !== nt || rt !== Ot || Et !== Qt) && (s.stencilOp(nt, Ot, Qt), fe = nt, rt = Ot, Et = Qt);
      },
      setLocked: function(nt) {
        B = nt;
      },
      setClear: function(nt) {
        Ht !== nt && (s.clearStencil(nt), Ht = nt);
      },
      reset: function() {
        B = !1, ge = null, Y = null, ee = null, he = null, fe = null, rt = null, Et = null, Ht = null;
      }
    };
  }
  const i = new e(), r = new t(), a = new n(), o = /* @__PURE__ */ new WeakMap(), c = /* @__PURE__ */ new WeakMap();
  let l = {}, u = {}, h = /* @__PURE__ */ new WeakMap(), d = [], f = null, g = !1, _ = null, p = null, m = null, T = null, S = null, A = null, F = null, C = new Pe(0, 0, 0), I = 0, z = !1, Q = null, v = null, E = null, W = null, X = null;
  const K = s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
  let te = !1, j = 0;
  const oe = s.getParameter(s.VERSION);
  oe.indexOf("WebGL") !== -1 ? (j = parseFloat(/^WebGL (\d)/.exec(oe)[1]), te = j >= 1) : oe.indexOf("OpenGL ES") !== -1 && (j = parseFloat(/^OpenGL ES (\d)/.exec(oe)[1]), te = j >= 2);
  let q = null, xe = {};
  const ve = s.getParameter(s.SCISSOR_BOX), Ae = s.getParameter(s.VIEWPORT), Qe = new ft().fromArray(ve), ht = new ft().fromArray(Ae);
  function Z(B, ge, Y, ee) {
    const he = new Uint8Array(4), fe = s.createTexture();
    s.bindTexture(B, fe), s.texParameteri(B, s.TEXTURE_MIN_FILTER, s.NEAREST), s.texParameteri(B, s.TEXTURE_MAG_FILTER, s.NEAREST);
    for (let rt = 0; rt < Y; rt++)
      B === s.TEXTURE_3D || B === s.TEXTURE_2D_ARRAY ? s.texImage3D(ge, 0, s.RGBA, 1, 1, ee, 0, s.RGBA, s.UNSIGNED_BYTE, he) : s.texImage2D(ge + rt, 0, s.RGBA, 1, 1, 0, s.RGBA, s.UNSIGNED_BYTE, he);
    return fe;
  }
  const se = {};
  se[s.TEXTURE_2D] = Z(s.TEXTURE_2D, s.TEXTURE_2D, 1), se[s.TEXTURE_CUBE_MAP] = Z(s.TEXTURE_CUBE_MAP, s.TEXTURE_CUBE_MAP_POSITIVE_X, 6), se[s.TEXTURE_2D_ARRAY] = Z(s.TEXTURE_2D_ARRAY, s.TEXTURE_2D_ARRAY, 1, 1), se[s.TEXTURE_3D] = Z(s.TEXTURE_3D, s.TEXTURE_3D, 1, 1), i.setClear(0, 0, 0, 1), r.setClear(1), a.setClear(0), Re(s.DEPTH_TEST), r.setFunc(3), Te(!1), D(1), Re(s.CULL_FACE), U(0);
  function Re(B) {
    l[B] !== !0 && (s.enable(B), l[B] = !0);
  }
  function Me(B) {
    l[B] !== !1 && (s.disable(B), l[B] = !1);
  }
  function Ve(B, ge) {
    return u[B] !== ge ? (s.bindFramebuffer(B, ge), u[B] = ge, B === s.DRAW_FRAMEBUFFER && (u[s.FRAMEBUFFER] = ge), B === s.FRAMEBUFFER && (u[s.DRAW_FRAMEBUFFER] = ge), !0) : !1;
  }
  function Fe(B, ge) {
    let Y = d, ee = !1;
    if (B) {
      Y = h.get(ge), Y === void 0 && (Y = [], h.set(ge, Y));
      const he = B.textures;
      if (Y.length !== he.length || Y[0] !== s.COLOR_ATTACHMENT0) {
        for (let fe = 0, rt = he.length; fe < rt; fe++)
          Y[fe] = s.COLOR_ATTACHMENT0 + fe;
        Y.length = he.length, ee = !0;
      }
    } else
      Y[0] !== s.BACK && (Y[0] = s.BACK, ee = !0);
    ee && s.drawBuffers(Y);
  }
  function it(B) {
    return f !== B ? (s.useProgram(B), f = B, !0) : !1;
  }
  const ut = {
    100: s.FUNC_ADD,
    101: s.FUNC_SUBTRACT,
    102: s.FUNC_REVERSE_SUBTRACT
  };
  ut[103] = s.MIN, ut[104] = s.MAX;
  const tt = {
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
  function U(B, ge, Y, ee, he, fe, rt, Et, Ht, nt) {
    if (B === 0) {
      g === !0 && (Me(s.BLEND), g = !1);
      return;
    }
    if (g === !1 && (Re(s.BLEND), g = !0), B !== 5) {
      if (B !== _ || nt !== z) {
        if ((p !== 100 || S !== 100) && (s.blendEquation(s.FUNC_ADD), p = 100, S = 100), nt)
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
        m = null, T = null, A = null, F = null, C.set(0, 0, 0), I = 0, _ = B, z = nt;
      }
      return;
    }
    he = he || ge, fe = fe || Y, rt = rt || ee, (ge !== p || he !== S) && (s.blendEquationSeparate(ut[ge], ut[he]), p = ge, S = he), (Y !== m || ee !== T || fe !== A || rt !== F) && (s.blendFuncSeparate(tt[Y], tt[ee], tt[fe], tt[rt]), m = Y, T = ee, A = fe, F = rt), (Et.equals(C) === !1 || Ht !== I) && (s.blendColor(Et.r, Et.g, Et.b, Ht), C.copy(Et), I = Ht), _ = B, z = !1;
  }
  function He(B, ge) {
    B.side === 2 ? Me(s.CULL_FACE) : Re(s.CULL_FACE);
    let Y = B.side === 1;
    ge && (Y = !Y), Te(Y), B.blending === 1 && B.transparent === !1 ? U(0) : U(B.blending, B.blendEquation, B.blendSrc, B.blendDst, B.blendEquationAlpha, B.blendSrcAlpha, B.blendDstAlpha, B.blendColor, B.blendAlpha, B.premultipliedAlpha), r.setFunc(B.depthFunc), r.setTest(B.depthTest), r.setMask(B.depthWrite), i.setMask(B.colorWrite);
    const ee = B.stencilWrite;
    a.setTest(ee), ee && (a.setMask(B.stencilWriteMask), a.setFunc(B.stencilFunc, B.stencilRef, B.stencilFuncMask), a.setOp(B.stencilFail, B.stencilZFail, B.stencilZPass)), vt(B.polygonOffset, B.polygonOffsetFactor, B.polygonOffsetUnits), B.alphaToCoverage === !0 ? Re(s.SAMPLE_ALPHA_TO_COVERAGE) : Me(s.SAMPLE_ALPHA_TO_COVERAGE);
  }
  function Te(B) {
    Q !== B && (B ? s.frontFace(s.CW) : s.frontFace(s.CCW), Q = B);
  }
  function D(B) {
    B !== 0 ? (Re(s.CULL_FACE), B !== v && (B === 1 ? s.cullFace(s.BACK) : B === 2 ? s.cullFace(s.FRONT) : s.cullFace(s.FRONT_AND_BACK))) : Me(s.CULL_FACE), v = B;
  }
  function Oe(B) {
    B !== E && (te && s.lineWidth(B), E = B);
  }
  function vt(B, ge, Y) {
    B ? (Re(s.POLYGON_OFFSET_FILL), (W !== ge || X !== Y) && (s.polygonOffset(ge, Y), W = ge, X = Y)) : Me(s.POLYGON_OFFSET_FILL);
  }
  function ze(B) {
    B ? Re(s.SCISSOR_TEST) : Me(s.SCISSOR_TEST);
  }
  function w(B) {
    B === void 0 && (B = s.TEXTURE0 + K - 1), q !== B && (s.activeTexture(B), q = B);
  }
  function M(B, ge, Y) {
    Y === void 0 && (q === null ? Y = s.TEXTURE0 + K - 1 : Y = q);
    let ee = xe[Y];
    ee === void 0 && (ee = { type: void 0, texture: void 0 }, xe[Y] = ee), (ee.type !== B || ee.texture !== ge) && (q !== Y && (s.activeTexture(Y), q = Y), s.bindTexture(B, ge || se[B]), ee.type = B, ee.texture = ge);
  }
  function G() {
    const B = xe[q];
    B !== void 0 && B.type !== void 0 && (s.bindTexture(B.type, null), B.type = void 0, B.texture = void 0);
  }
  function $() {
    try {
      s.compressedTexImage2D.apply(s, arguments);
    } catch (B) {
      console.error("THREE.WebGLState:", B);
    }
  }
  function ne() {
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
  function _e() {
    try {
      s.texSubImage3D.apply(s, arguments);
    } catch (B) {
      console.error("THREE.WebGLState:", B);
    }
  }
  function de() {
    try {
      s.compressedTexSubImage2D.apply(s, arguments);
    } catch (B) {
      console.error("THREE.WebGLState:", B);
    }
  }
  function ye() {
    try {
      s.compressedTexSubImage3D.apply(s, arguments);
    } catch (B) {
      console.error("THREE.WebGLState:", B);
    }
  }
  function st() {
    try {
      s.texStorage2D.apply(s, arguments);
    } catch (B) {
      console.error("THREE.WebGLState:", B);
    }
  }
  function re() {
    try {
      s.texStorage3D.apply(s, arguments);
    } catch (B) {
      console.error("THREE.WebGLState:", B);
    }
  }
  function Se() {
    try {
      s.texImage2D.apply(s, arguments);
    } catch (B) {
      console.error("THREE.WebGLState:", B);
    }
  }
  function Be() {
    try {
      s.texImage3D.apply(s, arguments);
    } catch (B) {
      console.error("THREE.WebGLState:", B);
    }
  }
  function De(B) {
    Qe.equals(B) === !1 && (s.scissor(B.x, B.y, B.z, B.w), Qe.copy(B));
  }
  function Ee(B) {
    ht.equals(B) === !1 && (s.viewport(B.x, B.y, B.z, B.w), ht.copy(B));
  }
  function Ke(B, ge) {
    let Y = c.get(ge);
    Y === void 0 && (Y = /* @__PURE__ */ new WeakMap(), c.set(ge, Y));
    let ee = Y.get(B);
    ee === void 0 && (ee = s.getUniformBlockIndex(ge, B.name), Y.set(B, ee));
  }
  function ke(B, ge) {
    const ee = c.get(ge).get(B);
    o.get(ge) !== ee && (s.uniformBlockBinding(ge, ee, B.__bindingPointIndex), o.set(ge, ee));
  }
  function mt() {
    s.disable(s.BLEND), s.disable(s.CULL_FACE), s.disable(s.DEPTH_TEST), s.disable(s.POLYGON_OFFSET_FILL), s.disable(s.SCISSOR_TEST), s.disable(s.STENCIL_TEST), s.disable(s.SAMPLE_ALPHA_TO_COVERAGE), s.blendEquation(s.FUNC_ADD), s.blendFunc(s.ONE, s.ZERO), s.blendFuncSeparate(s.ONE, s.ZERO, s.ONE, s.ZERO), s.blendColor(0, 0, 0, 0), s.colorMask(!0, !0, !0, !0), s.clearColor(0, 0, 0, 0), s.depthMask(!0), s.depthFunc(s.LESS), s.clearDepth(1), s.stencilMask(4294967295), s.stencilFunc(s.ALWAYS, 0, 4294967295), s.stencilOp(s.KEEP, s.KEEP, s.KEEP), s.clearStencil(0), s.cullFace(s.BACK), s.frontFace(s.CCW), s.polygonOffset(0, 0), s.activeTexture(s.TEXTURE0), s.bindFramebuffer(s.FRAMEBUFFER, null), s.bindFramebuffer(s.DRAW_FRAMEBUFFER, null), s.bindFramebuffer(s.READ_FRAMEBUFFER, null), s.useProgram(null), s.lineWidth(1), s.scissor(0, 0, s.canvas.width, s.canvas.height), s.viewport(0, 0, s.canvas.width, s.canvas.height), l = {}, q = null, xe = {}, u = {}, h = /* @__PURE__ */ new WeakMap(), d = [], f = null, g = !1, _ = null, p = null, m = null, T = null, S = null, A = null, F = null, C = new Pe(0, 0, 0), I = 0, z = !1, Q = null, v = null, E = null, W = null, X = null, Qe.set(0, 0, s.canvas.width, s.canvas.height), ht.set(0, 0, s.canvas.width, s.canvas.height), i.reset(), r.reset(), a.reset();
  }
  return {
    buffers: {
      color: i,
      depth: r,
      stencil: a
    },
    enable: Re,
    disable: Me,
    bindFramebuffer: Ve,
    drawBuffers: Fe,
    useProgram: it,
    setBlending: U,
    setMaterial: He,
    setFlipSided: Te,
    setCullFace: D,
    setLineWidth: Oe,
    setPolygonOffset: vt,
    setScissorTest: ze,
    activeTexture: w,
    bindTexture: M,
    unbindTexture: G,
    compressedTexImage2D: $,
    compressedTexImage3D: ne,
    texImage2D: Se,
    texImage3D: Be,
    updateUBOMapping: Ke,
    uniformBlockBinding: ke,
    texStorage2D: st,
    texStorage3D: re,
    texSubImage2D: J,
    texSubImage3D: _e,
    compressedTexSubImage2D: de,
    compressedTexSubImage3D: ye,
    scissor: De,
    viewport: Ee,
    reset: mt
  };
}
function Lo(s, e, t, n) {
  const i = gp(n);
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
function gp(s) {
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
function _p(s, e, t, n, i, r, a) {
  const o = e.has("WEBGL_multisampled_render_to_texture") ? e.get("WEBGL_multisampled_render_to_texture") : null, c = typeof navigator > "u" ? !1 : /OculusBrowser/g.test(navigator.userAgent), l = new je(), u = /* @__PURE__ */ new WeakMap();
  let h;
  const d = /* @__PURE__ */ new WeakMap();
  let f = !1;
  try {
    f = typeof OffscreenCanvas < "u" && new OffscreenCanvas(1, 1).getContext("2d") !== null;
  } catch {
  }
  function g(w, M) {
    return f ? (
      // eslint-disable-next-line compat/compat
      new OffscreenCanvas(w, M)
    ) : _s("canvas");
  }
  function _(w, M, G) {
    let $ = 1;
    const ne = ze(w);
    if ((ne.width > G || ne.height > G) && ($ = G / Math.max(ne.width, ne.height)), $ < 1)
      if (typeof HTMLImageElement < "u" && w instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && w instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && w instanceof ImageBitmap || typeof VideoFrame < "u" && w instanceof VideoFrame) {
        const J = Math.floor($ * ne.width), _e = Math.floor($ * ne.height);
        h === void 0 && (h = g(J, _e));
        const de = M ? g(J, _e) : h;
        return de.width = J, de.height = _e, de.getContext("2d").drawImage(w, 0, 0, J, _e), console.warn("THREE.WebGLRenderer: Texture has been resized from (" + ne.width + "x" + ne.height + ") to (" + J + "x" + _e + ")."), de;
      } else
        return "data" in w && console.warn("THREE.WebGLRenderer: Image in DataTexture is too big (" + ne.width + "x" + ne.height + ")."), w;
    return w;
  }
  function p(w) {
    return w.generateMipmaps && w.minFilter !== 1003 && w.minFilter !== 1006;
  }
  function m(w) {
    s.generateMipmap(w);
  }
  function T(w, M, G, $, ne = !1) {
    if (w !== null) {
      if (s[w] !== void 0) return s[w];
      console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '" + w + "'");
    }
    let J = M;
    if (M === s.RED && (G === s.FLOAT && (J = s.R32F), G === s.HALF_FLOAT && (J = s.R16F), G === s.UNSIGNED_BYTE && (J = s.R8)), M === s.RED_INTEGER && (G === s.UNSIGNED_BYTE && (J = s.R8UI), G === s.UNSIGNED_SHORT && (J = s.R16UI), G === s.UNSIGNED_INT && (J = s.R32UI), G === s.BYTE && (J = s.R8I), G === s.SHORT && (J = s.R16I), G === s.INT && (J = s.R32I)), M === s.RG && (G === s.FLOAT && (J = s.RG32F), G === s.HALF_FLOAT && (J = s.RG16F), G === s.UNSIGNED_BYTE && (J = s.RG8)), M === s.RG_INTEGER && (G === s.UNSIGNED_BYTE && (J = s.RG8UI), G === s.UNSIGNED_SHORT && (J = s.RG16UI), G === s.UNSIGNED_INT && (J = s.RG32UI), G === s.BYTE && (J = s.RG8I), G === s.SHORT && (J = s.RG16I), G === s.INT && (J = s.RG32I)), M === s.RGB_INTEGER && (G === s.UNSIGNED_BYTE && (J = s.RGB8UI), G === s.UNSIGNED_SHORT && (J = s.RGB16UI), G === s.UNSIGNED_INT && (J = s.RGB32UI), G === s.BYTE && (J = s.RGB8I), G === s.SHORT && (J = s.RGB16I), G === s.INT && (J = s.RGB32I)), M === s.RGBA_INTEGER && (G === s.UNSIGNED_BYTE && (J = s.RGBA8UI), G === s.UNSIGNED_SHORT && (J = s.RGBA16UI), G === s.UNSIGNED_INT && (J = s.RGBA32UI), G === s.BYTE && (J = s.RGBA8I), G === s.SHORT && (J = s.RGBA16I), G === s.INT && (J = s.RGBA32I)), M === s.RGB && G === s.UNSIGNED_INT_5_9_9_9_REV && (J = s.RGB9_E5), M === s.RGBA) {
      const _e = ne ? ar : at.getTransfer($);
      G === s.FLOAT && (J = s.RGBA32F), G === s.HALF_FLOAT && (J = s.RGBA16F), G === s.UNSIGNED_BYTE && (J = _e === St ? s.SRGB8_ALPHA8 : s.RGBA8), G === s.UNSIGNED_SHORT_4_4_4_4 && (J = s.RGBA4), G === s.UNSIGNED_SHORT_5_5_5_1 && (J = s.RGB5_A1);
    }
    return (J === s.R16F || J === s.R32F || J === s.RG16F || J === s.RG32F || J === s.RGBA16F || J === s.RGBA32F) && e.get("EXT_color_buffer_float"), J;
  }
  function S(w, M) {
    let G;
    return w ? M === null || M === 1014 || M === 1020 ? G = s.DEPTH24_STENCIL8 : M === 1015 ? G = s.DEPTH32F_STENCIL8 : M === 1012 && (G = s.DEPTH24_STENCIL8, console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")) : M === null || M === 1014 || M === 1020 ? G = s.DEPTH_COMPONENT24 : M === 1015 ? G = s.DEPTH_COMPONENT32F : M === 1012 && (G = s.DEPTH_COMPONENT16), G;
  }
  function A(w, M) {
    return p(w) === !0 || w.isFramebufferTexture && w.minFilter !== 1003 && w.minFilter !== 1006 ? Math.log2(Math.max(M.width, M.height)) + 1 : w.mipmaps !== void 0 && w.mipmaps.length > 0 ? w.mipmaps.length : w.isCompressedTexture && Array.isArray(w.image) ? M.mipmaps.length : 1;
  }
  function F(w) {
    const M = w.target;
    M.removeEventListener("dispose", F), I(M), M.isVideoTexture && u.delete(M);
  }
  function C(w) {
    const M = w.target;
    M.removeEventListener("dispose", C), Q(M);
  }
  function I(w) {
    const M = n.get(w);
    if (M.__webglInit === void 0) return;
    const G = w.source, $ = d.get(G);
    if ($) {
      const ne = $[M.__cacheKey];
      ne.usedTimes--, ne.usedTimes === 0 && z(w), Object.keys($).length === 0 && d.delete(G);
    }
    n.remove(w);
  }
  function z(w) {
    const M = n.get(w);
    s.deleteTexture(M.__webglTexture);
    const G = w.source, $ = d.get(G);
    delete $[M.__cacheKey], a.memory.textures--;
  }
  function Q(w) {
    const M = n.get(w);
    if (w.depthTexture && w.depthTexture.dispose(), w.isWebGLCubeRenderTarget)
      for (let $ = 0; $ < 6; $++) {
        if (Array.isArray(M.__webglFramebuffer[$]))
          for (let ne = 0; ne < M.__webglFramebuffer[$].length; ne++) s.deleteFramebuffer(M.__webglFramebuffer[$][ne]);
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
    const G = w.textures;
    for (let $ = 0, ne = G.length; $ < ne; $++) {
      const J = n.get(G[$]);
      J.__webglTexture && (s.deleteTexture(J.__webglTexture), a.memory.textures--), n.remove(G[$]);
    }
    n.remove(w);
  }
  let v = 0;
  function E() {
    v = 0;
  }
  function W() {
    const w = v;
    return w >= i.maxTextures && console.warn("THREE.WebGLTextures: Trying to use " + w + " texture units while this GPU supports only " + i.maxTextures), v += 1, w;
  }
  function X(w) {
    const M = [];
    return M.push(w.wrapS), M.push(w.wrapT), M.push(w.wrapR || 0), M.push(w.magFilter), M.push(w.minFilter), M.push(w.anisotropy), M.push(w.internalFormat), M.push(w.format), M.push(w.type), M.push(w.generateMipmaps), M.push(w.premultiplyAlpha), M.push(w.flipY), M.push(w.unpackAlignment), M.push(w.colorSpace), M.join();
  }
  function K(w, M) {
    const G = n.get(w);
    if (w.isVideoTexture && Oe(w), w.isRenderTargetTexture === !1 && w.version > 0 && G.__version !== w.version) {
      const $ = w.image;
      if ($ === null)
        console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");
      else if ($.complete === !1)
        console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");
      else {
        ht(G, w, M);
        return;
      }
    }
    t.bindTexture(s.TEXTURE_2D, G.__webglTexture, s.TEXTURE0 + M);
  }
  function te(w, M) {
    const G = n.get(w);
    if (w.version > 0 && G.__version !== w.version) {
      ht(G, w, M);
      return;
    }
    t.bindTexture(s.TEXTURE_2D_ARRAY, G.__webglTexture, s.TEXTURE0 + M);
  }
  function j(w, M) {
    const G = n.get(w);
    if (w.version > 0 && G.__version !== w.version) {
      ht(G, w, M);
      return;
    }
    t.bindTexture(s.TEXTURE_3D, G.__webglTexture, s.TEXTURE0 + M);
  }
  function oe(w, M) {
    const G = n.get(w);
    if (w.version > 0 && G.__version !== w.version) {
      Z(G, w, M);
      return;
    }
    t.bindTexture(s.TEXTURE_CUBE_MAP, G.__webglTexture, s.TEXTURE0 + M);
  }
  const q = {
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
  function Ae(w, M) {
    if (M.type === 1015 && e.has("OES_texture_float_linear") === !1 && (M.magFilter === 1006 || M.magFilter === 1007 || M.magFilter === 1005 || M.magFilter === 1008 || M.minFilter === 1006 || M.minFilter === 1007 || M.minFilter === 1005 || M.minFilter === 1008) && console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."), s.texParameteri(w, s.TEXTURE_WRAP_S, q[M.wrapS]), s.texParameteri(w, s.TEXTURE_WRAP_T, q[M.wrapT]), (w === s.TEXTURE_3D || w === s.TEXTURE_2D_ARRAY) && s.texParameteri(w, s.TEXTURE_WRAP_R, q[M.wrapR]), s.texParameteri(w, s.TEXTURE_MAG_FILTER, xe[M.magFilter]), s.texParameteri(w, s.TEXTURE_MIN_FILTER, xe[M.minFilter]), M.compareFunction && (s.texParameteri(w, s.TEXTURE_COMPARE_MODE, s.COMPARE_REF_TO_TEXTURE), s.texParameteri(w, s.TEXTURE_COMPARE_FUNC, ve[M.compareFunction])), e.has("EXT_texture_filter_anisotropic") === !0) {
      if (M.magFilter === 1003 || M.minFilter !== 1005 && M.minFilter !== 1008 || M.type === 1015 && e.has("OES_texture_float_linear") === !1) return;
      if (M.anisotropy > 1 || n.get(M).__currentAnisotropy) {
        const G = e.get("EXT_texture_filter_anisotropic");
        s.texParameterf(w, G.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(M.anisotropy, i.getMaxAnisotropy())), n.get(M).__currentAnisotropy = M.anisotropy;
      }
    }
  }
  function Qe(w, M) {
    let G = !1;
    w.__webglInit === void 0 && (w.__webglInit = !0, M.addEventListener("dispose", F));
    const $ = M.source;
    let ne = d.get($);
    ne === void 0 && (ne = {}, d.set($, ne));
    const J = X(M);
    if (J !== w.__cacheKey) {
      ne[J] === void 0 && (ne[J] = {
        texture: s.createTexture(),
        usedTimes: 0
      }, a.memory.textures++, G = !0), ne[J].usedTimes++;
      const _e = ne[w.__cacheKey];
      _e !== void 0 && (ne[w.__cacheKey].usedTimes--, _e.usedTimes === 0 && z(M)), w.__cacheKey = J, w.__webglTexture = ne[J].texture;
    }
    return G;
  }
  function ht(w, M, G) {
    let $ = s.TEXTURE_2D;
    (M.isDataArrayTexture || M.isCompressedArrayTexture) && ($ = s.TEXTURE_2D_ARRAY), M.isData3DTexture && ($ = s.TEXTURE_3D);
    const ne = Qe(w, M), J = M.source;
    t.bindTexture($, w.__webglTexture, s.TEXTURE0 + G);
    const _e = n.get(J);
    if (J.version !== _e.__version || ne === !0) {
      t.activeTexture(s.TEXTURE0 + G);
      const de = at.getPrimaries(at.workingColorSpace), ye = M.colorSpace === Kn ? null : at.getPrimaries(M.colorSpace), st = M.colorSpace === Kn || de === ye ? s.NONE : s.BROWSER_DEFAULT_WEBGL;
      s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL, M.flipY), s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL, M.premultiplyAlpha), s.pixelStorei(s.UNPACK_ALIGNMENT, M.unpackAlignment), s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL, st);
      let re = _(M.image, !1, i.maxTextureSize);
      re = vt(M, re);
      const Se = r.convert(M.format, M.colorSpace), Be = r.convert(M.type);
      let De = T(M.internalFormat, Se, Be, M.colorSpace, M.isVideoTexture);
      Ae($, M);
      let Ee;
      const Ke = M.mipmaps, ke = M.isVideoTexture !== !0, mt = _e.__version === void 0 || ne === !0, B = J.dataReady, ge = A(M, re);
      if (M.isDepthTexture)
        De = S(M.format === 1027, M.type), mt && (ke ? t.texStorage2D(s.TEXTURE_2D, 1, De, re.width, re.height) : t.texImage2D(s.TEXTURE_2D, 0, De, re.width, re.height, 0, Se, Be, null));
      else if (M.isDataTexture)
        if (Ke.length > 0) {
          ke && mt && t.texStorage2D(s.TEXTURE_2D, ge, De, Ke[0].width, Ke[0].height);
          for (let Y = 0, ee = Ke.length; Y < ee; Y++)
            Ee = Ke[Y], ke ? B && t.texSubImage2D(s.TEXTURE_2D, Y, 0, 0, Ee.width, Ee.height, Se, Be, Ee.data) : t.texImage2D(s.TEXTURE_2D, Y, De, Ee.width, Ee.height, 0, Se, Be, Ee.data);
          M.generateMipmaps = !1;
        } else
          ke ? (mt && t.texStorage2D(s.TEXTURE_2D, ge, De, re.width, re.height), B && t.texSubImage2D(s.TEXTURE_2D, 0, 0, 0, re.width, re.height, Se, Be, re.data)) : t.texImage2D(s.TEXTURE_2D, 0, De, re.width, re.height, 0, Se, Be, re.data);
      else if (M.isCompressedTexture)
        if (M.isCompressedArrayTexture) {
          ke && mt && t.texStorage3D(s.TEXTURE_2D_ARRAY, ge, De, Ke[0].width, Ke[0].height, re.depth);
          for (let Y = 0, ee = Ke.length; Y < ee; Y++)
            if (Ee = Ke[Y], M.format !== 1023)
              if (Se !== null)
                if (ke) {
                  if (B)
                    if (M.layerUpdates.size > 0) {
                      const he = Lo(Ee.width, Ee.height, M.format, M.type);
                      for (const fe of M.layerUpdates) {
                        const rt = Ee.data.subarray(
                          fe * he / Ee.data.BYTES_PER_ELEMENT,
                          (fe + 1) * he / Ee.data.BYTES_PER_ELEMENT
                        );
                        t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY, Y, 0, 0, fe, Ee.width, Ee.height, 1, Se, rt, 0, 0);
                      }
                      M.clearLayerUpdates();
                    } else
                      t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY, Y, 0, 0, 0, Ee.width, Ee.height, re.depth, Se, Ee.data, 0, 0);
                } else
                  t.compressedTexImage3D(s.TEXTURE_2D_ARRAY, Y, De, Ee.width, Ee.height, re.depth, 0, Ee.data, 0, 0);
              else
                console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");
            else
              ke ? B && t.texSubImage3D(s.TEXTURE_2D_ARRAY, Y, 0, 0, 0, Ee.width, Ee.height, re.depth, Se, Be, Ee.data) : t.texImage3D(s.TEXTURE_2D_ARRAY, Y, De, Ee.width, Ee.height, re.depth, 0, Se, Be, Ee.data);
        } else {
          ke && mt && t.texStorage2D(s.TEXTURE_2D, ge, De, Ke[0].width, Ke[0].height);
          for (let Y = 0, ee = Ke.length; Y < ee; Y++)
            Ee = Ke[Y], M.format !== 1023 ? Se !== null ? ke ? B && t.compressedTexSubImage2D(s.TEXTURE_2D, Y, 0, 0, Ee.width, Ee.height, Se, Ee.data) : t.compressedTexImage2D(s.TEXTURE_2D, Y, De, Ee.width, Ee.height, 0, Ee.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : ke ? B && t.texSubImage2D(s.TEXTURE_2D, Y, 0, 0, Ee.width, Ee.height, Se, Be, Ee.data) : t.texImage2D(s.TEXTURE_2D, Y, De, Ee.width, Ee.height, 0, Se, Be, Ee.data);
        }
      else if (M.isDataArrayTexture)
        if (ke) {
          if (mt && t.texStorage3D(s.TEXTURE_2D_ARRAY, ge, De, re.width, re.height, re.depth), B)
            if (M.layerUpdates.size > 0) {
              const Y = Lo(re.width, re.height, M.format, M.type);
              for (const ee of M.layerUpdates) {
                const he = re.data.subarray(
                  ee * Y / re.data.BYTES_PER_ELEMENT,
                  (ee + 1) * Y / re.data.BYTES_PER_ELEMENT
                );
                t.texSubImage3D(s.TEXTURE_2D_ARRAY, 0, 0, 0, ee, re.width, re.height, 1, Se, Be, he);
              }
              M.clearLayerUpdates();
            } else
              t.texSubImage3D(s.TEXTURE_2D_ARRAY, 0, 0, 0, 0, re.width, re.height, re.depth, Se, Be, re.data);
        } else
          t.texImage3D(s.TEXTURE_2D_ARRAY, 0, De, re.width, re.height, re.depth, 0, Se, Be, re.data);
      else if (M.isData3DTexture)
        ke ? (mt && t.texStorage3D(s.TEXTURE_3D, ge, De, re.width, re.height, re.depth), B && t.texSubImage3D(s.TEXTURE_3D, 0, 0, 0, 0, re.width, re.height, re.depth, Se, Be, re.data)) : t.texImage3D(s.TEXTURE_3D, 0, De, re.width, re.height, re.depth, 0, Se, Be, re.data);
      else if (M.isFramebufferTexture) {
        if (mt)
          if (ke)
            t.texStorage2D(s.TEXTURE_2D, ge, De, re.width, re.height);
          else {
            let Y = re.width, ee = re.height;
            for (let he = 0; he < ge; he++)
              t.texImage2D(s.TEXTURE_2D, he, De, Y, ee, 0, Se, Be, null), Y >>= 1, ee >>= 1;
          }
      } else if (Ke.length > 0) {
        if (ke && mt) {
          const Y = ze(Ke[0]);
          t.texStorage2D(s.TEXTURE_2D, ge, De, Y.width, Y.height);
        }
        for (let Y = 0, ee = Ke.length; Y < ee; Y++)
          Ee = Ke[Y], ke ? B && t.texSubImage2D(s.TEXTURE_2D, Y, 0, 0, Se, Be, Ee) : t.texImage2D(s.TEXTURE_2D, Y, De, Se, Be, Ee);
        M.generateMipmaps = !1;
      } else if (ke) {
        if (mt) {
          const Y = ze(re);
          t.texStorage2D(s.TEXTURE_2D, ge, De, Y.width, Y.height);
        }
        B && t.texSubImage2D(s.TEXTURE_2D, 0, 0, 0, Se, Be, re);
      } else
        t.texImage2D(s.TEXTURE_2D, 0, De, Se, Be, re);
      p(M) && m($), _e.__version = J.version, M.onUpdate && M.onUpdate(M);
    }
    w.__version = M.version;
  }
  function Z(w, M, G) {
    if (M.image.length !== 6) return;
    const $ = Qe(w, M), ne = M.source;
    t.bindTexture(s.TEXTURE_CUBE_MAP, w.__webglTexture, s.TEXTURE0 + G);
    const J = n.get(ne);
    if (ne.version !== J.__version || $ === !0) {
      t.activeTexture(s.TEXTURE0 + G);
      const _e = at.getPrimaries(at.workingColorSpace), de = M.colorSpace === Kn ? null : at.getPrimaries(M.colorSpace), ye = M.colorSpace === Kn || _e === de ? s.NONE : s.BROWSER_DEFAULT_WEBGL;
      s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL, M.flipY), s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL, M.premultiplyAlpha), s.pixelStorei(s.UNPACK_ALIGNMENT, M.unpackAlignment), s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL, ye);
      const st = M.isCompressedTexture || M.image[0].isCompressedTexture, re = M.image[0] && M.image[0].isDataTexture, Se = [];
      for (let ee = 0; ee < 6; ee++)
        !st && !re ? Se[ee] = _(M.image[ee], !0, i.maxCubemapSize) : Se[ee] = re ? M.image[ee].image : M.image[ee], Se[ee] = vt(M, Se[ee]);
      const Be = Se[0], De = r.convert(M.format, M.colorSpace), Ee = r.convert(M.type), Ke = T(M.internalFormat, De, Ee, M.colorSpace), ke = M.isVideoTexture !== !0, mt = J.__version === void 0 || $ === !0, B = ne.dataReady;
      let ge = A(M, Be);
      Ae(s.TEXTURE_CUBE_MAP, M);
      let Y;
      if (st) {
        ke && mt && t.texStorage2D(s.TEXTURE_CUBE_MAP, ge, Ke, Be.width, Be.height);
        for (let ee = 0; ee < 6; ee++) {
          Y = Se[ee].mipmaps;
          for (let he = 0; he < Y.length; he++) {
            const fe = Y[he];
            M.format !== 1023 ? De !== null ? ke ? B && t.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ee, he, 0, 0, fe.width, fe.height, De, fe.data) : t.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ee, he, Ke, fe.width, fe.height, 0, fe.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()") : ke ? B && t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ee, he, 0, 0, fe.width, fe.height, De, Ee, fe.data) : t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ee, he, Ke, fe.width, fe.height, 0, De, Ee, fe.data);
          }
        }
      } else {
        if (Y = M.mipmaps, ke && mt) {
          Y.length > 0 && ge++;
          const ee = ze(Se[0]);
          t.texStorage2D(s.TEXTURE_CUBE_MAP, ge, Ke, ee.width, ee.height);
        }
        for (let ee = 0; ee < 6; ee++)
          if (re) {
            ke ? B && t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ee, 0, 0, 0, Se[ee].width, Se[ee].height, De, Ee, Se[ee].data) : t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ee, 0, Ke, Se[ee].width, Se[ee].height, 0, De, Ee, Se[ee].data);
            for (let he = 0; he < Y.length; he++) {
              const rt = Y[he].image[ee].image;
              ke ? B && t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ee, he + 1, 0, 0, rt.width, rt.height, De, Ee, rt.data) : t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ee, he + 1, Ke, rt.width, rt.height, 0, De, Ee, rt.data);
            }
          } else {
            ke ? B && t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ee, 0, 0, 0, De, Ee, Se[ee]) : t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ee, 0, Ke, De, Ee, Se[ee]);
            for (let he = 0; he < Y.length; he++) {
              const fe = Y[he];
              ke ? B && t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ee, he + 1, 0, 0, De, Ee, fe.image[ee]) : t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X + ee, he + 1, Ke, De, Ee, fe.image[ee]);
            }
          }
      }
      p(M) && m(s.TEXTURE_CUBE_MAP), J.__version = ne.version, M.onUpdate && M.onUpdate(M);
    }
    w.__version = M.version;
  }
  function se(w, M, G, $, ne, J) {
    const _e = r.convert(G.format, G.colorSpace), de = r.convert(G.type), ye = T(G.internalFormat, _e, de, G.colorSpace);
    if (!n.get(M).__hasExternalTextures) {
      const re = Math.max(1, M.width >> J), Se = Math.max(1, M.height >> J);
      ne === s.TEXTURE_3D || ne === s.TEXTURE_2D_ARRAY ? t.texImage3D(ne, J, ye, re, Se, M.depth, 0, _e, de, null) : t.texImage2D(ne, J, ye, re, Se, 0, _e, de, null);
    }
    t.bindFramebuffer(s.FRAMEBUFFER, w), D(M) ? o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER, $, ne, n.get(G).__webglTexture, 0, Te(M)) : (ne === s.TEXTURE_2D || ne >= s.TEXTURE_CUBE_MAP_POSITIVE_X && ne <= s.TEXTURE_CUBE_MAP_NEGATIVE_Z) && s.framebufferTexture2D(s.FRAMEBUFFER, $, ne, n.get(G).__webglTexture, J), t.bindFramebuffer(s.FRAMEBUFFER, null);
  }
  function Re(w, M, G) {
    if (s.bindRenderbuffer(s.RENDERBUFFER, w), M.depthBuffer) {
      const $ = M.depthTexture, ne = $ && $.isDepthTexture ? $.type : null, J = S(M.stencilBuffer, ne), _e = M.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT, de = Te(M);
      D(M) ? o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER, de, J, M.width, M.height) : G ? s.renderbufferStorageMultisample(s.RENDERBUFFER, de, J, M.width, M.height) : s.renderbufferStorage(s.RENDERBUFFER, J, M.width, M.height), s.framebufferRenderbuffer(s.FRAMEBUFFER, _e, s.RENDERBUFFER, w);
    } else {
      const $ = M.textures;
      for (let ne = 0; ne < $.length; ne++) {
        const J = $[ne], _e = r.convert(J.format, J.colorSpace), de = r.convert(J.type), ye = T(J.internalFormat, _e, de, J.colorSpace), st = Te(M);
        G && D(M) === !1 ? s.renderbufferStorageMultisample(s.RENDERBUFFER, st, ye, M.width, M.height) : D(M) ? o.renderbufferStorageMultisampleEXT(s.RENDERBUFFER, st, ye, M.width, M.height) : s.renderbufferStorage(s.RENDERBUFFER, ye, M.width, M.height);
      }
    }
    s.bindRenderbuffer(s.RENDERBUFFER, null);
  }
  function Me(w, M) {
    if (M && M.isWebGLCubeRenderTarget) throw new Error("Depth Texture with cube render targets is not supported");
    if (t.bindFramebuffer(s.FRAMEBUFFER, w), !(M.depthTexture && M.depthTexture.isDepthTexture))
      throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");
    (!n.get(M.depthTexture).__webglTexture || M.depthTexture.image.width !== M.width || M.depthTexture.image.height !== M.height) && (M.depthTexture.image.width = M.width, M.depthTexture.image.height = M.height, M.depthTexture.needsUpdate = !0), K(M.depthTexture, 0);
    const $ = n.get(M.depthTexture).__webglTexture, ne = Te(M);
    if (M.depthTexture.format === 1026)
      D(M) ? o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER, s.DEPTH_ATTACHMENT, s.TEXTURE_2D, $, 0, ne) : s.framebufferTexture2D(s.FRAMEBUFFER, s.DEPTH_ATTACHMENT, s.TEXTURE_2D, $, 0);
    else if (M.depthTexture.format === 1027)
      D(M) ? o.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER, s.DEPTH_STENCIL_ATTACHMENT, s.TEXTURE_2D, $, 0, ne) : s.framebufferTexture2D(s.FRAMEBUFFER, s.DEPTH_STENCIL_ATTACHMENT, s.TEXTURE_2D, $, 0);
    else
      throw new Error("Unknown depthTexture format");
  }
  function Ve(w) {
    const M = n.get(w), G = w.isWebGLCubeRenderTarget === !0;
    if (M.__boundDepthTexture !== w.depthTexture) {
      const $ = w.depthTexture;
      if (M.__depthDisposeCallback && M.__depthDisposeCallback(), $) {
        const ne = () => {
          delete M.__boundDepthTexture, delete M.__depthDisposeCallback, $.removeEventListener("dispose", ne);
        };
        $.addEventListener("dispose", ne), M.__depthDisposeCallback = ne;
      }
      M.__boundDepthTexture = $;
    }
    if (w.depthTexture && !M.__autoAllocateDepthBuffer) {
      if (G) throw new Error("target.depthTexture not supported in Cube render targets");
      Me(M.__webglFramebuffer, w);
    } else if (G) {
      M.__webglDepthbuffer = [];
      for (let $ = 0; $ < 6; $++)
        if (t.bindFramebuffer(s.FRAMEBUFFER, M.__webglFramebuffer[$]), M.__webglDepthbuffer[$] === void 0)
          M.__webglDepthbuffer[$] = s.createRenderbuffer(), Re(M.__webglDepthbuffer[$], w, !1);
        else {
          const ne = w.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT, J = M.__webglDepthbuffer[$];
          s.bindRenderbuffer(s.RENDERBUFFER, J), s.framebufferRenderbuffer(s.FRAMEBUFFER, ne, s.RENDERBUFFER, J);
        }
    } else if (t.bindFramebuffer(s.FRAMEBUFFER, M.__webglFramebuffer), M.__webglDepthbuffer === void 0)
      M.__webglDepthbuffer = s.createRenderbuffer(), Re(M.__webglDepthbuffer, w, !1);
    else {
      const $ = w.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT, ne = M.__webglDepthbuffer;
      s.bindRenderbuffer(s.RENDERBUFFER, ne), s.framebufferRenderbuffer(s.FRAMEBUFFER, $, s.RENDERBUFFER, ne);
    }
    t.bindFramebuffer(s.FRAMEBUFFER, null);
  }
  function Fe(w, M, G) {
    const $ = n.get(w);
    M !== void 0 && se($.__webglFramebuffer, w, w.texture, s.COLOR_ATTACHMENT0, s.TEXTURE_2D, 0), G !== void 0 && Ve(w);
  }
  function it(w) {
    const M = w.texture, G = n.get(w), $ = n.get(M);
    w.addEventListener("dispose", C);
    const ne = w.textures, J = w.isWebGLCubeRenderTarget === !0, _e = ne.length > 1;
    if (_e || ($.__webglTexture === void 0 && ($.__webglTexture = s.createTexture()), $.__version = M.version, a.memory.textures++), J) {
      G.__webglFramebuffer = [];
      for (let de = 0; de < 6; de++)
        if (M.mipmaps && M.mipmaps.length > 0) {
          G.__webglFramebuffer[de] = [];
          for (let ye = 0; ye < M.mipmaps.length; ye++)
            G.__webglFramebuffer[de][ye] = s.createFramebuffer();
        } else
          G.__webglFramebuffer[de] = s.createFramebuffer();
    } else {
      if (M.mipmaps && M.mipmaps.length > 0) {
        G.__webglFramebuffer = [];
        for (let de = 0; de < M.mipmaps.length; de++)
          G.__webglFramebuffer[de] = s.createFramebuffer();
      } else
        G.__webglFramebuffer = s.createFramebuffer();
      if (_e)
        for (let de = 0, ye = ne.length; de < ye; de++) {
          const st = n.get(ne[de]);
          st.__webglTexture === void 0 && (st.__webglTexture = s.createTexture(), a.memory.textures++);
        }
      if (w.samples > 0 && D(w) === !1) {
        G.__webglMultisampledFramebuffer = s.createFramebuffer(), G.__webglColorRenderbuffer = [], t.bindFramebuffer(s.FRAMEBUFFER, G.__webglMultisampledFramebuffer);
        for (let de = 0; de < ne.length; de++) {
          const ye = ne[de];
          G.__webglColorRenderbuffer[de] = s.createRenderbuffer(), s.bindRenderbuffer(s.RENDERBUFFER, G.__webglColorRenderbuffer[de]);
          const st = r.convert(ye.format, ye.colorSpace), re = r.convert(ye.type), Se = T(ye.internalFormat, st, re, ye.colorSpace, w.isXRRenderTarget === !0), Be = Te(w);
          s.renderbufferStorageMultisample(s.RENDERBUFFER, Be, Se, w.width, w.height), s.framebufferRenderbuffer(s.FRAMEBUFFER, s.COLOR_ATTACHMENT0 + de, s.RENDERBUFFER, G.__webglColorRenderbuffer[de]);
        }
        s.bindRenderbuffer(s.RENDERBUFFER, null), w.depthBuffer && (G.__webglDepthRenderbuffer = s.createRenderbuffer(), Re(G.__webglDepthRenderbuffer, w, !0)), t.bindFramebuffer(s.FRAMEBUFFER, null);
      }
    }
    if (J) {
      t.bindTexture(s.TEXTURE_CUBE_MAP, $.__webglTexture), Ae(s.TEXTURE_CUBE_MAP, M);
      for (let de = 0; de < 6; de++)
        if (M.mipmaps && M.mipmaps.length > 0)
          for (let ye = 0; ye < M.mipmaps.length; ye++)
            se(G.__webglFramebuffer[de][ye], w, M, s.COLOR_ATTACHMENT0, s.TEXTURE_CUBE_MAP_POSITIVE_X + de, ye);
        else
          se(G.__webglFramebuffer[de], w, M, s.COLOR_ATTACHMENT0, s.TEXTURE_CUBE_MAP_POSITIVE_X + de, 0);
      p(M) && m(s.TEXTURE_CUBE_MAP), t.unbindTexture();
    } else if (_e) {
      for (let de = 0, ye = ne.length; de < ye; de++) {
        const st = ne[de], re = n.get(st);
        t.bindTexture(s.TEXTURE_2D, re.__webglTexture), Ae(s.TEXTURE_2D, st), se(G.__webglFramebuffer, w, st, s.COLOR_ATTACHMENT0 + de, s.TEXTURE_2D, 0), p(st) && m(s.TEXTURE_2D);
      }
      t.unbindTexture();
    } else {
      let de = s.TEXTURE_2D;
      if ((w.isWebGL3DRenderTarget || w.isWebGLArrayRenderTarget) && (de = w.isWebGL3DRenderTarget ? s.TEXTURE_3D : s.TEXTURE_2D_ARRAY), t.bindTexture(de, $.__webglTexture), Ae(de, M), M.mipmaps && M.mipmaps.length > 0)
        for (let ye = 0; ye < M.mipmaps.length; ye++)
          se(G.__webglFramebuffer[ye], w, M, s.COLOR_ATTACHMENT0, de, ye);
      else
        se(G.__webglFramebuffer, w, M, s.COLOR_ATTACHMENT0, de, 0);
      p(M) && m(de), t.unbindTexture();
    }
    w.depthBuffer && Ve(w);
  }
  function ut(w) {
    const M = w.textures;
    for (let G = 0, $ = M.length; G < $; G++) {
      const ne = M[G];
      if (p(ne)) {
        const J = w.isWebGLCubeRenderTarget ? s.TEXTURE_CUBE_MAP : s.TEXTURE_2D, _e = n.get(ne).__webglTexture;
        t.bindTexture(J, _e), m(J), t.unbindTexture();
      }
    }
  }
  const tt = [], U = [];
  function He(w) {
    if (w.samples > 0) {
      if (D(w) === !1) {
        const M = w.textures, G = w.width, $ = w.height;
        let ne = s.COLOR_BUFFER_BIT;
        const J = w.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT, _e = n.get(w), de = M.length > 1;
        if (de)
          for (let ye = 0; ye < M.length; ye++)
            t.bindFramebuffer(s.FRAMEBUFFER, _e.__webglMultisampledFramebuffer), s.framebufferRenderbuffer(s.FRAMEBUFFER, s.COLOR_ATTACHMENT0 + ye, s.RENDERBUFFER, null), t.bindFramebuffer(s.FRAMEBUFFER, _e.__webglFramebuffer), s.framebufferTexture2D(s.DRAW_FRAMEBUFFER, s.COLOR_ATTACHMENT0 + ye, s.TEXTURE_2D, null, 0);
        t.bindFramebuffer(s.READ_FRAMEBUFFER, _e.__webglMultisampledFramebuffer), t.bindFramebuffer(s.DRAW_FRAMEBUFFER, _e.__webglFramebuffer);
        for (let ye = 0; ye < M.length; ye++) {
          if (w.resolveDepthBuffer && (w.depthBuffer && (ne |= s.DEPTH_BUFFER_BIT), w.stencilBuffer && w.resolveStencilBuffer && (ne |= s.STENCIL_BUFFER_BIT)), de) {
            s.framebufferRenderbuffer(s.READ_FRAMEBUFFER, s.COLOR_ATTACHMENT0, s.RENDERBUFFER, _e.__webglColorRenderbuffer[ye]);
            const st = n.get(M[ye]).__webglTexture;
            s.framebufferTexture2D(s.DRAW_FRAMEBUFFER, s.COLOR_ATTACHMENT0, s.TEXTURE_2D, st, 0);
          }
          s.blitFramebuffer(0, 0, G, $, 0, 0, G, $, ne, s.NEAREST), c === !0 && (tt.length = 0, U.length = 0, tt.push(s.COLOR_ATTACHMENT0 + ye), w.depthBuffer && w.resolveDepthBuffer === !1 && (tt.push(J), U.push(J), s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER, U)), s.invalidateFramebuffer(s.READ_FRAMEBUFFER, tt));
        }
        if (t.bindFramebuffer(s.READ_FRAMEBUFFER, null), t.bindFramebuffer(s.DRAW_FRAMEBUFFER, null), de)
          for (let ye = 0; ye < M.length; ye++) {
            t.bindFramebuffer(s.FRAMEBUFFER, _e.__webglMultisampledFramebuffer), s.framebufferRenderbuffer(s.FRAMEBUFFER, s.COLOR_ATTACHMENT0 + ye, s.RENDERBUFFER, _e.__webglColorRenderbuffer[ye]);
            const st = n.get(M[ye]).__webglTexture;
            t.bindFramebuffer(s.FRAMEBUFFER, _e.__webglFramebuffer), s.framebufferTexture2D(s.DRAW_FRAMEBUFFER, s.COLOR_ATTACHMENT0 + ye, s.TEXTURE_2D, st, 0);
          }
        t.bindFramebuffer(s.DRAW_FRAMEBUFFER, _e.__webglMultisampledFramebuffer);
      } else if (w.depthBuffer && w.resolveDepthBuffer === !1 && c) {
        const M = w.stencilBuffer ? s.DEPTH_STENCIL_ATTACHMENT : s.DEPTH_ATTACHMENT;
        s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER, [M]);
      }
    }
  }
  function Te(w) {
    return Math.min(i.maxSamples, w.samples);
  }
  function D(w) {
    const M = n.get(w);
    return w.samples > 0 && e.has("WEBGL_multisampled_render_to_texture") === !0 && M.__useRenderToTexture !== !1;
  }
  function Oe(w) {
    const M = a.render.frame;
    u.get(w) !== M && (u.set(w, M), w.update());
  }
  function vt(w, M) {
    const G = w.colorSpace, $ = w.format, ne = w.type;
    return w.isCompressedTexture === !0 || w.isVideoTexture === !0 || G !== Gt && G !== Kn && (at.getTransfer(G) === St ? ($ !== 1023 || ne !== 1009) && console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.") : console.error("THREE.WebGLTextures: Unsupported texture color space:", G)), M;
  }
  function ze(w) {
    return typeof HTMLImageElement < "u" && w instanceof HTMLImageElement ? (l.width = w.naturalWidth || w.width, l.height = w.naturalHeight || w.height) : typeof VideoFrame < "u" && w instanceof VideoFrame ? (l.width = w.displayWidth, l.height = w.displayHeight) : (l.width = w.width, l.height = w.height), l;
  }
  this.allocateTextureUnit = W, this.resetTextureUnits = E, this.setTexture2D = K, this.setTexture2DArray = te, this.setTexture3D = j, this.setTextureCube = oe, this.rebindTextures = Fe, this.setupRenderTarget = it, this.updateRenderTargetMipmap = ut, this.updateMultisampleRenderTarget = He, this.setupDepthRenderbuffer = Ve, this.setupFrameBufferTexture = se, this.useMultisampledRTT = D;
}
function xp(s, e) {
  function t(n, i = Kn) {
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
      if (a === St)
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
        if (n === 36196 || n === 37492) return a === St ? r.COMPRESSED_SRGB8_ETC2 : r.COMPRESSED_RGB8_ETC2;
        if (n === 37496) return a === St ? r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : r.COMPRESSED_RGBA8_ETC2_EAC;
      } else
        return null;
    if (n === 37808 || n === 37809 || n === 37810 || n === 37811 || n === 37812 || n === 37813 || n === 37814 || n === 37815 || n === 37816 || n === 37817 || n === 37818 || n === 37819 || n === 37820 || n === 37821)
      if (r = e.get("WEBGL_compressed_texture_astc"), r !== null) {
        if (n === 37808) return a === St ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : r.COMPRESSED_RGBA_ASTC_4x4_KHR;
        if (n === 37809) return a === St ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR : r.COMPRESSED_RGBA_ASTC_5x4_KHR;
        if (n === 37810) return a === St ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR : r.COMPRESSED_RGBA_ASTC_5x5_KHR;
        if (n === 37811) return a === St ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR : r.COMPRESSED_RGBA_ASTC_6x5_KHR;
        if (n === 37812) return a === St ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR : r.COMPRESSED_RGBA_ASTC_6x6_KHR;
        if (n === 37813) return a === St ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR : r.COMPRESSED_RGBA_ASTC_8x5_KHR;
        if (n === 37814) return a === St ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR : r.COMPRESSED_RGBA_ASTC_8x6_KHR;
        if (n === 37815) return a === St ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR : r.COMPRESSED_RGBA_ASTC_8x8_KHR;
        if (n === 37816) return a === St ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR : r.COMPRESSED_RGBA_ASTC_10x5_KHR;
        if (n === 37817) return a === St ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR : r.COMPRESSED_RGBA_ASTC_10x6_KHR;
        if (n === 37818) return a === St ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR : r.COMPRESSED_RGBA_ASTC_10x8_KHR;
        if (n === 37819) return a === St ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR : r.COMPRESSED_RGBA_ASTC_10x10_KHR;
        if (n === 37820) return a === St ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR : r.COMPRESSED_RGBA_ASTC_12x10_KHR;
        if (n === 37821) return a === St ? r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR : r.COMPRESSED_RGBA_ASTC_12x12_KHR;
      } else
        return null;
    if (n === 36492 || n === 36494 || n === 36495)
      if (r = e.get("EXT_texture_compression_bptc"), r !== null) {
        if (n === 36492) return a === St ? r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT : r.COMPRESSED_RGBA_BPTC_UNORM_EXT;
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
class vp extends tn {
  constructor(e = []) {
    super(), this.isArrayCamera = !0, this.cameras = e;
  }
}
class Ut extends bt {
  constructor() {
    super(), this.isGroup = !0, this.type = "Group";
  }
}
const Mp = { type: "move" };
class $r {
  constructor() {
    this._targetRay = null, this._grip = null, this._hand = null;
  }
  getHandSpace() {
    return this._hand === null && (this._hand = new Ut(), this._hand.matrixAutoUpdate = !1, this._hand.visible = !1, this._hand.joints = {}, this._hand.inputState = { pinching: !1 }), this._hand;
  }
  getTargetRaySpace() {
    return this._targetRay === null && (this._targetRay = new Ut(), this._targetRay.matrixAutoUpdate = !1, this._targetRay.visible = !1, this._targetRay.hasLinearVelocity = !1, this._targetRay.linearVelocity = new N(), this._targetRay.hasAngularVelocity = !1, this._targetRay.angularVelocity = new N()), this._targetRay;
  }
  getGripSpace() {
    return this._grip === null && (this._grip = new Ut(), this._grip.matrixAutoUpdate = !1, this._grip.visible = !1, this._grip.hasLinearVelocity = !1, this._grip.linearVelocity = new N(), this._grip.hasAngularVelocity = !1, this._grip.angularVelocity = new N()), this._grip;
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
      o !== null && (i = t.getPose(e.targetRaySpace, n), i === null && r !== null && (i = r), i !== null && (o.matrix.fromArray(i.transform.matrix), o.matrix.decompose(o.position, o.rotation, o.scale), o.matrixWorldNeedsUpdate = !0, i.linearVelocity ? (o.hasLinearVelocity = !0, o.linearVelocity.copy(i.linearVelocity)) : o.hasLinearVelocity = !1, i.angularVelocity ? (o.hasAngularVelocity = !0, o.angularVelocity.copy(i.angularVelocity)) : o.hasAngularVelocity = !1, this.dispatchEvent(Mp)));
    }
    return o !== null && (o.visible = i !== null), c !== null && (c.visible = r !== null), l !== null && (l.visible = a !== null), this;
  }
  // private method
  _getHandJoint(e, t) {
    if (e.joints[t.jointName] === void 0) {
      const n = new Ut();
      n.matrixAutoUpdate = !1, n.visible = !1, e.joints[t.jointName] = n, e.add(n);
    }
    return e.joints[t.jointName];
  }
}
const yp = `
void main() {

	gl_Position = vec4( position, 1.0 );

}`, Sp = `
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
class Ep {
  constructor() {
    this.texture = null, this.mesh = null, this.depthNear = 0, this.depthFar = 0;
  }
  init(e, t, n) {
    if (this.texture === null) {
      const i = new Nt(), r = e.properties.get(i);
      r.__webglTexture = t.texture, (t.depthNear != n.depthNear || t.depthFar != n.depthFar) && (this.depthNear = t.depthNear, this.depthFar = t.depthFar), this.texture = i;
    }
  }
  getMesh(e) {
    if (this.texture !== null && this.mesh === null) {
      const t = e.cameras[0].viewport, n = new $n({
        vertexShader: yp,
        fragmentShader: Sp,
        uniforms: {
          depthColor: { value: this.texture },
          depthWidth: { value: t.z },
          depthHeight: { value: t.w }
        }
      });
      this.mesh = new Le(new Ki(20, 20), n);
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
class Tp extends xi {
  constructor(e, t) {
    super();
    const n = this;
    let i = null, r = 1, a = null, o = "local-floor", c = 1, l = null, u = null, h = null, d = null, f = null, g = null;
    const _ = new Ep(), p = t.getContextAttributes();
    let m = null, T = null;
    const S = [], A = [], F = new je();
    let C = null;
    const I = new tn();
    I.layers.enable(1), I.viewport = new ft();
    const z = new tn();
    z.layers.enable(2), z.viewport = new ft();
    const Q = [I, z], v = new vp();
    v.layers.enable(1), v.layers.enable(2);
    let E = null, W = null;
    this.cameraAutoUpdate = !0, this.enabled = !1, this.isPresenting = !1, this.getController = function(Z) {
      let se = S[Z];
      return se === void 0 && (se = new $r(), S[Z] = se), se.getTargetRaySpace();
    }, this.getControllerGrip = function(Z) {
      let se = S[Z];
      return se === void 0 && (se = new $r(), S[Z] = se), se.getGripSpace();
    }, this.getHand = function(Z) {
      let se = S[Z];
      return se === void 0 && (se = new $r(), S[Z] = se), se.getHandSpace();
    };
    function X(Z) {
      const se = A.indexOf(Z.inputSource);
      if (se === -1)
        return;
      const Re = S[se];
      Re !== void 0 && (Re.update(Z.inputSource, Z.frame, l || a), Re.dispatchEvent({ type: Z.type, data: Z.inputSource }));
    }
    function K() {
      i.removeEventListener("select", X), i.removeEventListener("selectstart", X), i.removeEventListener("selectend", X), i.removeEventListener("squeeze", X), i.removeEventListener("squeezestart", X), i.removeEventListener("squeezeend", X), i.removeEventListener("end", K), i.removeEventListener("inputsourceschange", te);
      for (let Z = 0; Z < S.length; Z++) {
        const se = A[Z];
        se !== null && (A[Z] = null, S[Z].disconnect(se));
      }
      E = null, W = null, _.reset(), e.setRenderTarget(m), f = null, d = null, h = null, i = null, T = null, ht.stop(), n.isPresenting = !1, e.setPixelRatio(C), e.setSize(F.width, F.height, !1), n.dispatchEvent({ type: "sessionend" });
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
        if (m = e.getRenderTarget(), i.addEventListener("select", X), i.addEventListener("selectstart", X), i.addEventListener("selectend", X), i.addEventListener("squeeze", X), i.addEventListener("squeezestart", X), i.addEventListener("squeezeend", X), i.addEventListener("end", K), i.addEventListener("inputsourceschange", te), p.xrCompatible !== !0 && await t.makeXRCompatible(), C = e.getPixelRatio(), e.getSize(F), i.renderState.layers === void 0) {
          const se = {
            antialias: p.antialias,
            alpha: !0,
            depth: p.depth,
            stencil: p.stencil,
            framebufferScaleFactor: r
          };
          f = new XRWebGLLayer(i, t, se), i.updateRenderState({ baseLayer: f }), e.setPixelRatio(1), e.setSize(f.framebufferWidth, f.framebufferHeight, !1), T = new _i(
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
          let se = null, Re = null, Me = null;
          p.depth && (Me = p.stencil ? t.DEPTH24_STENCIL8 : t.DEPTH_COMPONENT24, se = p.stencil ? 1027 : 1026, Re = p.stencil ? 1020 : 1014);
          const Ve = {
            colorFormat: t.RGBA8,
            depthFormat: Me,
            scaleFactor: r
          };
          h = new XRWebGLBinding(i, t), d = h.createProjectionLayer(Ve), i.updateRenderState({ layers: [d] }), e.setPixelRatio(1), e.setSize(d.textureWidth, d.textureHeight, !1), T = new _i(
            d.textureWidth,
            d.textureHeight,
            {
              format: 1023,
              type: 1009,
              depthTexture: new Mc(d.textureWidth, d.textureHeight, Re, void 0, void 0, void 0, void 0, void 0, void 0, se),
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
      return _.getDepthTexture();
    };
    function te(Z) {
      for (let se = 0; se < Z.removed.length; se++) {
        const Re = Z.removed[se], Me = A.indexOf(Re);
        Me >= 0 && (A[Me] = null, S[Me].disconnect(Re));
      }
      for (let se = 0; se < Z.added.length; se++) {
        const Re = Z.added[se];
        let Me = A.indexOf(Re);
        if (Me === -1) {
          for (let Fe = 0; Fe < S.length; Fe++)
            if (Fe >= A.length) {
              A.push(Re), Me = Fe;
              break;
            } else if (A[Fe] === null) {
              A[Fe] = Re, Me = Fe;
              break;
            }
          if (Me === -1) break;
        }
        const Ve = S[Me];
        Ve && Ve.connect(Re);
      }
    }
    const j = new N(), oe = new N();
    function q(Z, se, Re) {
      j.setFromMatrixPosition(se.matrixWorld), oe.setFromMatrixPosition(Re.matrixWorld);
      const Me = j.distanceTo(oe), Ve = se.projectionMatrix.elements, Fe = Re.projectionMatrix.elements, it = Ve[14] / (Ve[10] - 1), ut = Ve[14] / (Ve[10] + 1), tt = (Ve[9] + 1) / Ve[5], U = (Ve[9] - 1) / Ve[5], He = (Ve[8] - 1) / Ve[0], Te = (Fe[8] + 1) / Fe[0], D = it * He, Oe = it * Te, vt = Me / (-He + Te), ze = vt * -He;
      if (se.matrixWorld.decompose(Z.position, Z.quaternion, Z.scale), Z.translateX(ze), Z.translateZ(vt), Z.matrixWorld.compose(Z.position, Z.quaternion, Z.scale), Z.matrixWorldInverse.copy(Z.matrixWorld).invert(), Ve[10] === -1)
        Z.projectionMatrix.copy(se.projectionMatrix), Z.projectionMatrixInverse.copy(se.projectionMatrixInverse);
      else {
        const w = it + vt, M = ut + vt, G = D - ze, $ = Oe + (Me - ze), ne = tt * ut / M * w, J = U * ut / M * w;
        Z.projectionMatrix.makePerspective(G, $, ne, J, w, M), Z.projectionMatrixInverse.copy(Z.projectionMatrix).invert();
      }
    }
    function xe(Z, se) {
      se === null ? Z.matrixWorld.copy(Z.matrix) : Z.matrixWorld.multiplyMatrices(se.matrixWorld, Z.matrix), Z.matrixWorldInverse.copy(Z.matrixWorld).invert();
    }
    this.updateCamera = function(Z) {
      if (i === null) return;
      let se = Z.near, Re = Z.far;
      _.texture !== null && (_.depthNear > 0 && (se = _.depthNear), _.depthFar > 0 && (Re = _.depthFar)), v.near = z.near = I.near = se, v.far = z.far = I.far = Re, (E !== v.near || W !== v.far) && (i.updateRenderState({
        depthNear: v.near,
        depthFar: v.far
      }), E = v.near, W = v.far);
      const Me = Z.parent, Ve = v.cameras;
      xe(v, Me);
      for (let Fe = 0; Fe < Ve.length; Fe++)
        xe(Ve[Fe], Me);
      Ve.length === 2 ? q(v, I, z) : v.projectionMatrix.copy(I.projectionMatrix), ve(Z, v, Me);
    };
    function ve(Z, se, Re) {
      Re === null ? Z.matrix.copy(se.matrixWorld) : (Z.matrix.copy(Re.matrixWorld), Z.matrix.invert(), Z.matrix.multiply(se.matrixWorld)), Z.matrix.decompose(Z.position, Z.quaternion, Z.scale), Z.updateMatrixWorld(!0), Z.projectionMatrix.copy(se.projectionMatrix), Z.projectionMatrixInverse.copy(se.projectionMatrixInverse), Z.isPerspectiveCamera && (Z.fov = Wi * 2 * Math.atan(1 / Z.projectionMatrix.elements[5]), Z.zoom = 1);
    }
    this.getCamera = function() {
      return v;
    }, this.getFoveation = function() {
      if (!(d === null && f === null))
        return c;
    }, this.setFoveation = function(Z) {
      c = Z, d !== null && (d.fixedFoveation = Z), f !== null && f.fixedFoveation !== void 0 && (f.fixedFoveation = Z);
    }, this.hasDepthSensing = function() {
      return _.texture !== null;
    }, this.getDepthSensingMesh = function() {
      return _.getMesh(v);
    };
    let Ae = null;
    function Qe(Z, se) {
      if (u = se.getViewerPose(l || a), g = se, u !== null) {
        const Re = u.views;
        f !== null && (e.setRenderTargetFramebuffer(T, f.framebuffer), e.setRenderTarget(T));
        let Me = !1;
        Re.length !== v.cameras.length && (v.cameras.length = 0, Me = !0);
        for (let Fe = 0; Fe < Re.length; Fe++) {
          const it = Re[Fe];
          let ut = null;
          if (f !== null)
            ut = f.getViewport(it);
          else {
            const U = h.getViewSubImage(d, it);
            ut = U.viewport, Fe === 0 && (e.setRenderTargetTextures(
              T,
              U.colorTexture,
              d.ignoreDepthValues ? void 0 : U.depthStencilTexture
            ), e.setRenderTarget(T));
          }
          let tt = Q[Fe];
          tt === void 0 && (tt = new tn(), tt.layers.enable(Fe), tt.viewport = new ft(), Q[Fe] = tt), tt.matrix.fromArray(it.transform.matrix), tt.matrix.decompose(tt.position, tt.quaternion, tt.scale), tt.projectionMatrix.fromArray(it.projectionMatrix), tt.projectionMatrixInverse.copy(tt.projectionMatrix).invert(), tt.viewport.set(ut.x, ut.y, ut.width, ut.height), Fe === 0 && (v.matrix.copy(tt.matrix), v.matrix.decompose(v.position, v.quaternion, v.scale)), Me === !0 && v.cameras.push(tt);
        }
        const Ve = i.enabledFeatures;
        if (Ve && Ve.includes("depth-sensing")) {
          const Fe = h.getDepthInformation(Re[0]);
          Fe && Fe.isValid && Fe.texture && _.init(e, Fe, i.renderState);
        }
      }
      for (let Re = 0; Re < S.length; Re++) {
        const Me = A[Re], Ve = S[Re];
        Me !== null && Ve !== void 0 && Ve.update(Me, se, l || a);
      }
      Ae && Ae(Z, se), se.detectedPlanes && n.dispatchEvent({ type: "planesdetected", data: se }), g = null;
    }
    const ht = new vc();
    ht.setAnimationLoop(Qe), this.setAnimationLoop = function(Z) {
      Ae = Z;
    }, this.dispose = function() {
    };
  }
}
const hi = /* @__PURE__ */ new Sn(), Ap = /* @__PURE__ */ new Ye();
function bp(s, e) {
  function t(p, m) {
    p.matrixAutoUpdate === !0 && p.updateMatrix(), m.value.copy(p.matrix);
  }
  function n(p, m) {
    m.color.getRGB(p.fogColor.value, gc(s)), m.isFog ? (p.fogNear.value = m.near, p.fogFar.value = m.far) : m.isFogExp2 && (p.fogDensity.value = m.density);
  }
  function i(p, m, T, S, A) {
    m.isMeshBasicMaterial || m.isMeshLambertMaterial ? r(p, m) : m.isMeshToonMaterial ? (r(p, m), h(p, m)) : m.isMeshPhongMaterial ? (r(p, m), u(p, m)) : m.isMeshStandardMaterial ? (r(p, m), d(p, m), m.isMeshPhysicalMaterial && f(p, m, A)) : m.isMeshMatcapMaterial ? (r(p, m), g(p, m)) : m.isMeshDepthMaterial ? r(p, m) : m.isMeshDistanceMaterial ? (r(p, m), _(p, m)) : m.isMeshNormalMaterial ? r(p, m) : m.isLineBasicMaterial ? (a(p, m), m.isLineDashedMaterial && o(p, m)) : m.isPointsMaterial ? c(p, m, T, S) : m.isSpriteMaterial ? l(p, m) : m.isShadowMaterial ? (p.color.value.copy(m.color), p.opacity.value = m.opacity) : m.isShaderMaterial && (m.uniformsNeedUpdate = !1);
  }
  function r(p, m) {
    p.opacity.value = m.opacity, m.color && p.diffuse.value.copy(m.color), m.emissive && p.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity), m.map && (p.map.value = m.map, t(m.map, p.mapTransform)), m.alphaMap && (p.alphaMap.value = m.alphaMap, t(m.alphaMap, p.alphaMapTransform)), m.bumpMap && (p.bumpMap.value = m.bumpMap, t(m.bumpMap, p.bumpMapTransform), p.bumpScale.value = m.bumpScale, m.side === 1 && (p.bumpScale.value *= -1)), m.normalMap && (p.normalMap.value = m.normalMap, t(m.normalMap, p.normalMapTransform), p.normalScale.value.copy(m.normalScale), m.side === 1 && p.normalScale.value.negate()), m.displacementMap && (p.displacementMap.value = m.displacementMap, t(m.displacementMap, p.displacementMapTransform), p.displacementScale.value = m.displacementScale, p.displacementBias.value = m.displacementBias), m.emissiveMap && (p.emissiveMap.value = m.emissiveMap, t(m.emissiveMap, p.emissiveMapTransform)), m.specularMap && (p.specularMap.value = m.specularMap, t(m.specularMap, p.specularMapTransform)), m.alphaTest > 0 && (p.alphaTest.value = m.alphaTest);
    const T = e.get(m), S = T.envMap, A = T.envMapRotation;
    S && (p.envMap.value = S, hi.copy(A), hi.x *= -1, hi.y *= -1, hi.z *= -1, S.isCubeTexture && S.isRenderTargetTexture === !1 && (hi.y *= -1, hi.z *= -1), p.envMapRotation.value.setFromMatrix4(Ap.makeRotationFromEuler(hi)), p.flipEnvMap.value = S.isCubeTexture && S.isRenderTargetTexture === !1 ? -1 : 1, p.reflectivity.value = m.reflectivity, p.ior.value = m.ior, p.refractionRatio.value = m.refractionRatio), m.lightMap && (p.lightMap.value = m.lightMap, p.lightMapIntensity.value = m.lightMapIntensity, t(m.lightMap, p.lightMapTransform)), m.aoMap && (p.aoMap.value = m.aoMap, p.aoMapIntensity.value = m.aoMapIntensity, t(m.aoMap, p.aoMapTransform));
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
  function _(p, m) {
    const T = e.get(m).light;
    p.referencePosition.value.setFromMatrixPosition(T.matrixWorld), p.nearDistance.value = T.shadow.camera.near, p.farDistance.value = T.shadow.camera.far;
  }
  return {
    refreshFogUniforms: n,
    refreshMaterialUniforms: i
  };
}
function wp(s, e, t, n) {
  let i = {}, r = {}, a = [];
  const o = s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);
  function c(T, S) {
    const A = S.program;
    n.uniformBlockBinding(T, A);
  }
  function l(T, S) {
    let A = i[T.id];
    A === void 0 && (g(T), A = u(T), i[T.id] = A, T.addEventListener("dispose", p));
    const F = S.program;
    n.updateUBOMapping(T, F);
    const C = e.render.frame;
    r[T.id] !== C && (d(T), r[T.id] = C);
  }
  function u(T) {
    const S = h();
    T.__bindingPointIndex = S;
    const A = s.createBuffer(), F = T.__size, C = T.usage;
    return s.bindBuffer(s.UNIFORM_BUFFER, A), s.bufferData(s.UNIFORM_BUFFER, F, C), s.bindBuffer(s.UNIFORM_BUFFER, null), s.bindBufferBase(s.UNIFORM_BUFFER, S, A), A;
  }
  function h() {
    for (let T = 0; T < o; T++)
      if (a.indexOf(T) === -1)
        return a.push(T), T;
    return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."), 0;
  }
  function d(T) {
    const S = i[T.id], A = T.uniforms, F = T.__cache;
    s.bindBuffer(s.UNIFORM_BUFFER, S);
    for (let C = 0, I = A.length; C < I; C++) {
      const z = Array.isArray(A[C]) ? A[C] : [A[C]];
      for (let Q = 0, v = z.length; Q < v; Q++) {
        const E = z[Q];
        if (f(E, C, Q, F) === !0) {
          const W = E.__offset, X = Array.isArray(E.value) ? E.value : [E.value];
          let K = 0;
          for (let te = 0; te < X.length; te++) {
            const j = X[te], oe = _(j);
            typeof j == "number" || typeof j == "boolean" ? (E.__data[0] = j, s.bufferSubData(s.UNIFORM_BUFFER, W + K, E.__data)) : j.isMatrix3 ? (E.__data[0] = j.elements[0], E.__data[1] = j.elements[1], E.__data[2] = j.elements[2], E.__data[3] = 0, E.__data[4] = j.elements[3], E.__data[5] = j.elements[4], E.__data[6] = j.elements[5], E.__data[7] = 0, E.__data[8] = j.elements[6], E.__data[9] = j.elements[7], E.__data[10] = j.elements[8], E.__data[11] = 0) : (j.toArray(E.__data, K), K += oe.storage / Float32Array.BYTES_PER_ELEMENT);
          }
          s.bufferSubData(s.UNIFORM_BUFFER, W, E.__data);
        }
      }
    }
    s.bindBuffer(s.UNIFORM_BUFFER, null);
  }
  function f(T, S, A, F) {
    const C = T.value, I = S + "_" + A;
    if (F[I] === void 0)
      return typeof C == "number" || typeof C == "boolean" ? F[I] = C : F[I] = C.clone(), !0;
    {
      const z = F[I];
      if (typeof C == "number" || typeof C == "boolean") {
        if (z !== C)
          return F[I] = C, !0;
      } else if (z.equals(C) === !1)
        return z.copy(C), !0;
    }
    return !1;
  }
  function g(T) {
    const S = T.uniforms;
    let A = 0;
    const F = 16;
    for (let I = 0, z = S.length; I < z; I++) {
      const Q = Array.isArray(S[I]) ? S[I] : [S[I]];
      for (let v = 0, E = Q.length; v < E; v++) {
        const W = Q[v], X = Array.isArray(W.value) ? W.value : [W.value];
        for (let K = 0, te = X.length; K < te; K++) {
          const j = X[K], oe = _(j), q = A % F, xe = q % oe.boundary, ve = q + xe;
          A += xe, ve !== 0 && F - ve < oe.storage && (A += F - ve), W.__data = new Float32Array(oe.storage / Float32Array.BYTES_PER_ELEMENT), W.__offset = A, A += oe.storage;
        }
      }
    }
    const C = A % F;
    return C > 0 && (A += F - C), T.__size = A, T.__cache = {}, this;
  }
  function _(T) {
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
    const A = a.indexOf(S.__bindingPointIndex);
    a.splice(A, 1), s.deleteBuffer(i[S.id]), delete i[S.id], delete r[S.id];
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
class Rp {
  constructor(e = {}) {
    const {
      canvas: t = pl(),
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
    }, this.autoClear = !0, this.autoClearColor = !0, this.autoClearDepth = !0, this.autoClearStencil = !0, this.sortObjects = !0, this.clippingPlanes = [], this.localClippingEnabled = !1, this._outputColorSpace = Rt, this.toneMapping = 0, this.toneMappingExposure = 1;
    const S = this;
    let A = !1, F = 0, C = 0, I = null, z = -1, Q = null;
    const v = new ft(), E = new ft();
    let W = null;
    const X = new Pe(0);
    let K = 0, te = t.width, j = t.height, oe = 1, q = null, xe = null;
    const ve = new ft(0, 0, te, j), Ae = new ft(0, 0, te, j);
    let Qe = !1;
    const ht = new ya();
    let Z = !1, se = !1;
    const Re = new Ye(), Me = new Ye(), Ve = new N(), Fe = new ft(), it = { background: null, fog: null, environment: null, overrideMaterial: null, isScene: !0 };
    let ut = !1;
    function tt() {
      return I === null ? oe : 1;
    }
    let U = n;
    function He(y, O) {
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
      if ("setAttribute" in t && t.setAttribute("data-engine", `three.js r${_a}`), t.addEventListener("webglcontextlost", ee, !1), t.addEventListener("webglcontextrestored", he, !1), t.addEventListener("webglcontextcreationerror", fe, !1), U === null) {
        const O = "webgl2";
        if (U = He(O, y), U === null)
          throw He(O) ? new Error("Error creating WebGL context with your selected attributes.") : new Error("Error creating WebGL context.");
      }
    } catch (y) {
      throw console.error("THREE.WebGLRenderer: " + y.message), y;
    }
    let Te, D, Oe, vt, ze, w, M, G, $, ne, J, _e, de, ye, st, re, Se, Be, De, Ee, Ke, ke, mt, B;
    function ge() {
      Te = new Ld(U), Te.init(), ke = new xp(U, Te), D = new bd(U, Te, e, ke), Oe = new mp(U), D.reverseDepthBuffer && Oe.buffers.depth.setReversed(!0), vt = new Nd(U), ze = new ep(), w = new _p(U, Te, Oe, ze, D, ke, vt), M = new Rd(S), G = new Pd(S), $ = new Hl(U), mt = new Td(U, $), ne = new Dd(U, $, vt, mt), J = new Bd(U, ne, $, vt), De = new Fd(U, D, w), re = new wd(ze), _e = new Qf(S, M, G, Te, D, mt, re), de = new bp(S, ze), ye = new np(), st = new cp(Te), Be = new Ed(S, M, G, Oe, J, d, c), Se = new fp(S, J, D), B = new wp(U, vt, D, Oe), Ee = new Ad(U, Te, vt), Ke = new Ud(U, Te, vt), vt.programs = _e.programs, S.capabilities = D, S.extensions = Te, S.properties = ze, S.renderLists = ye, S.shadowMap = Se, S.state = Oe, S.info = vt;
    }
    ge();
    const Y = new Tp(S, U);
    this.xr = Y, this.getContext = function() {
      return U;
    }, this.getContextAttributes = function() {
      return U.getContextAttributes();
    }, this.forceContextLoss = function() {
      const y = Te.get("WEBGL_lose_context");
      y && y.loseContext();
    }, this.forceContextRestore = function() {
      const y = Te.get("WEBGL_lose_context");
      y && y.restoreContext();
    }, this.getPixelRatio = function() {
      return oe;
    }, this.setPixelRatio = function(y) {
      y !== void 0 && (oe = y, this.setSize(te, j, !1));
    }, this.getSize = function(y) {
      return y.set(te, j);
    }, this.setSize = function(y, O, H = !0) {
      if (Y.isPresenting) {
        console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");
        return;
      }
      te = y, j = O, t.width = Math.floor(y * oe), t.height = Math.floor(O * oe), H === !0 && (t.style.width = y + "px", t.style.height = O + "px"), this.setViewport(0, 0, y, O);
    }, this.getDrawingBufferSize = function(y) {
      return y.set(te * oe, j * oe).floor();
    }, this.setDrawingBufferSize = function(y, O, H) {
      te = y, j = O, oe = H, t.width = Math.floor(y * H), t.height = Math.floor(O * H), this.setViewport(0, 0, y, O);
    }, this.getCurrentViewport = function(y) {
      return y.copy(v);
    }, this.getViewport = function(y) {
      return y.copy(ve);
    }, this.setViewport = function(y, O, H, V) {
      y.isVector4 ? ve.set(y.x, y.y, y.z, y.w) : ve.set(y, O, H, V), Oe.viewport(v.copy(ve).multiplyScalar(oe).round());
    }, this.getScissor = function(y) {
      return y.copy(Ae);
    }, this.setScissor = function(y, O, H, V) {
      y.isVector4 ? Ae.set(y.x, y.y, y.z, y.w) : Ae.set(y, O, H, V), Oe.scissor(E.copy(Ae).multiplyScalar(oe).round());
    }, this.getScissorTest = function() {
      return Qe;
    }, this.setScissorTest = function(y) {
      Oe.setScissorTest(Qe = y);
    }, this.setOpaqueSort = function(y) {
      q = y;
    }, this.setTransparentSort = function(y) {
      xe = y;
    }, this.getClearColor = function(y) {
      return y.copy(Be.getClearColor());
    }, this.setClearColor = function() {
      Be.setClearColor.apply(Be, arguments);
    }, this.getClearAlpha = function() {
      return Be.getClearAlpha();
    }, this.setClearAlpha = function() {
      Be.setClearAlpha.apply(Be, arguments);
    }, this.clear = function(y = !0, O = !0, H = !0) {
      let V = 0;
      if (y) {
        let k = !1;
        if (I !== null) {
          const ce = I.texture.format;
          k = ce === 1033 || ce === 1031 || ce === 1029;
        }
        if (k) {
          const ce = I.texture.type, me = ce === 1009 || ce === 1014 || ce === 1012 || ce === 1020 || ce === 1017 || ce === 1018, be = Be.getClearColor(), we = Be.getClearAlpha(), Ue = be.r, Ne = be.g, Ce = be.b;
          me ? (f[0] = Ue, f[1] = Ne, f[2] = Ce, f[3] = we, U.clearBufferuiv(U.COLOR, 0, f)) : (g[0] = Ue, g[1] = Ne, g[2] = Ce, g[3] = we, U.clearBufferiv(U.COLOR, 0, g));
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
      t.removeEventListener("webglcontextlost", ee, !1), t.removeEventListener("webglcontextrestored", he, !1), t.removeEventListener("webglcontextcreationerror", fe, !1), ye.dispose(), st.dispose(), ze.dispose(), M.dispose(), G.dispose(), J.dispose(), mt.dispose(), B.dispose(), _e.dispose(), Y.dispose(), Y.removeEventListener("sessionstart", Pn), Y.removeEventListener("sessionend", Qn), nn.stop();
    };
    function ee(y) {
      y.preventDefault(), console.log("THREE.WebGLRenderer: Context Lost."), A = !0;
    }
    function he() {
      console.log("THREE.WebGLRenderer: Context Restored."), A = !1;
      const y = vt.autoReset, O = Se.enabled, H = Se.autoUpdate, V = Se.needsUpdate, k = Se.type;
      ge(), vt.autoReset = y, Se.enabled = O, Se.autoUpdate = H, Se.needsUpdate = V, Se.type = k;
    }
    function fe(y) {
      console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ", y.statusMessage);
    }
    function rt(y) {
      const O = y.target;
      O.removeEventListener("dispose", rt), Et(O);
    }
    function Et(y) {
      Ht(y), ze.remove(y);
    }
    function Ht(y) {
      const O = ze.get(y).programs;
      O !== void 0 && (O.forEach(function(H) {
        _e.releaseProgram(H);
      }), y.isShaderMaterial && _e.releaseShaderCache(y));
    }
    this.renderBufferDirect = function(y, O, H, V, k, ce) {
      O === null && (O = it);
      const me = k.isMesh && k.matrixWorld.determinant() < 0, be = _r(y, O, H, V, k);
      Oe.setMaterial(V, me);
      let we = H.index, Ue = 1;
      if (V.wireframe === !0) {
        if (we = ne.getWireframeAttribute(H), we === void 0) return;
        Ue = 2;
      }
      const Ne = H.drawRange, Ce = H.attributes.position;
      let ct = Ne.start * Ue, xt = (Ne.start + Ne.count) * Ue;
      ce !== null && (ct = Math.max(ct, ce.start * Ue), xt = Math.min(xt, (ce.start + ce.count) * Ue)), we !== null ? (ct = Math.max(ct, 0), xt = Math.min(xt, we.count)) : Ce != null && (ct = Math.max(ct, 0), xt = Math.min(xt, Ce.count));
      const Mt = xt - ct;
      if (Mt < 0 || Mt === 1 / 0) return;
      mt.setup(k, V, be, H, we);
      let jt, lt = Ee;
      if (we !== null && (jt = $.get(we), lt = Ke, lt.setIndex(jt)), k.isMesh)
        V.wireframe === !0 ? (Oe.setLineWidth(V.wireframeLinewidth * tt()), lt.setMode(U.LINES)) : lt.setMode(U.TRIANGLES);
      else if (k.isLine) {
        let Ie = V.linewidth;
        Ie === void 0 && (Ie = 1), Oe.setLineWidth(Ie * tt()), k.isLineSegments ? lt.setMode(U.LINES) : k.isLineLoop ? lt.setMode(U.LINE_LOOP) : lt.setMode(U.LINE_STRIP);
      } else k.isPoints ? lt.setMode(U.POINTS) : k.isSprite && lt.setMode(U.TRIANGLES);
      if (k.isBatchedMesh)
        if (k._multiDrawInstances !== null)
          lt.renderMultiDrawInstances(k._multiDrawStarts, k._multiDrawCounts, k._multiDrawCount, k._multiDrawInstances);
        else if (Te.get("WEBGL_multi_draw"))
          lt.renderMultiDraw(k._multiDrawStarts, k._multiDrawCounts, k._multiDrawCount);
        else {
          const Ie = k._multiDrawStarts, Ct = k._multiDrawCounts, ot = k._multiDrawCount, zt = we ? $.get(we).bytesPerElement : 1, zn = ze.get(V).currentProgram.getUniforms();
          for (let Yt = 0; Yt < ot; Yt++)
            zn.setValue(U, "_gl_DrawID", Yt), lt.render(Ie[Yt] / zt, Ct[Yt]);
        }
      else if (k.isInstancedMesh)
        lt.renderInstances(ct, Mt, k.count);
      else if (H.isInstancedBufferGeometry) {
        const Ie = H._maxInstanceCount !== void 0 ? H._maxInstanceCount : 1 / 0, Ct = Math.min(H.instanceCount, Ie);
        lt.renderInstances(ct, Mt, Ct);
      } else
        lt.render(ct, Mt);
    };
    function nt(y, O, H) {
      y.transparent === !0 && y.side === 2 && y.forceSinglePass === !1 ? (y.side = 1, y.needsUpdate = !0, pn(y, O, H), y.side = 0, y.needsUpdate = !0, pn(y, O, H), y.side = 2) : pn(y, O, H);
    }
    this.compile = function(y, O, H = null) {
      H === null && (H = y), p = st.get(H), p.init(O), T.push(p), H.traverseVisible(function(k) {
        k.isLight && k.layers.test(O.layers) && (p.pushLight(k), k.castShadow && p.pushShadow(k));
      }), y !== H && y.traverseVisible(function(k) {
        k.isLight && k.layers.test(O.layers) && (p.pushLight(k), k.castShadow && p.pushShadow(k));
      }), p.setupLights();
      const V = /* @__PURE__ */ new Set();
      return y.traverse(function(k) {
        if (!(k.isMesh || k.isPoints || k.isLine || k.isSprite))
          return;
        const ce = k.material;
        if (ce)
          if (Array.isArray(ce))
            for (let me = 0; me < ce.length; me++) {
              const be = ce[me];
              nt(be, H, k), V.add(be);
            }
          else
            nt(ce, H, k), V.add(ce);
      }), T.pop(), p = null, V;
    }, this.compileAsync = function(y, O, H = null) {
      const V = this.compile(y, O, H);
      return new Promise((k) => {
        function ce() {
          if (V.forEach(function(me) {
            ze.get(me).currentProgram.isReady() && V.delete(me);
          }), V.size === 0) {
            k(y);
            return;
          }
          setTimeout(ce, 10);
        }
        Te.get("KHR_parallel_shader_compile") !== null ? ce() : setTimeout(ce, 10);
      });
    };
    let Ot = null;
    function Qt(y) {
      Ot && Ot(y);
    }
    function Pn() {
      nn.stop();
    }
    function Qn() {
      nn.start();
    }
    const nn = new vc();
    nn.setAnimationLoop(Qt), typeof self < "u" && nn.setContext(self), this.setAnimationLoop = function(y) {
      Ot = y, Y.setAnimationLoop(y), y === null ? nn.stop() : nn.start();
    }, Y.addEventListener("sessionstart", Pn), Y.addEventListener("sessionend", Qn), this.render = function(y, O) {
      if (O !== void 0 && O.isCamera !== !0) {
        console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");
        return;
      }
      if (A === !0) return;
      if (y.matrixWorldAutoUpdate === !0 && y.updateMatrixWorld(), O.parent === null && O.matrixWorldAutoUpdate === !0 && O.updateMatrixWorld(), Y.enabled === !0 && Y.isPresenting === !0 && (Y.cameraAutoUpdate === !0 && Y.updateCamera(O), O = Y.getCamera()), y.isScene === !0 && y.onBeforeRender(S, y, O, I), p = st.get(y, T.length), p.init(O), T.push(p), Me.multiplyMatrices(O.projectionMatrix, O.matrixWorldInverse), ht.setFromProjectionMatrix(Me), se = this.localClippingEnabled, Z = re.init(this.clippingPlanes, se), _ = ye.get(y, m.length), _.init(), m.push(_), Y.enabled === !0 && Y.isPresenting === !0) {
        const ce = S.xr.getDepthSensingMesh();
        ce !== null && ei(ce, O, -1 / 0, S.sortObjects);
      }
      ei(y, O, 0, S.sortObjects), _.finish(), S.sortObjects === !0 && _.sort(q, xe), ut = Y.enabled === !1 || Y.isPresenting === !1 || Y.hasDepthSensing() === !1, ut && Be.addToRenderList(_, y), this.info.render.frame++, Z === !0 && re.beginShadows();
      const H = p.state.shadowsArray;
      Se.render(H, y, O), Z === !0 && re.endShadows(), this.info.autoReset === !0 && this.info.reset();
      const V = _.opaque, k = _.transmissive;
      if (p.setupLights(), O.isArrayCamera) {
        const ce = O.cameras;
        if (k.length > 0)
          for (let me = 0, be = ce.length; me < be; me++) {
            const we = ce[me];
            es(V, k, y, we);
          }
        ut && Be.render(y);
        for (let me = 0, be = ce.length; me < be; me++) {
          const we = ce[me];
          Qi(_, y, we, we.viewport);
        }
      } else
        k.length > 0 && es(V, k, y, O), ut && Be.render(y), Qi(_, y, O);
      I !== null && (w.updateMultisampleRenderTarget(I), w.updateRenderTargetMipmap(I)), y.isScene === !0 && y.onAfterRender(S, y, O), mt.resetDefaultState(), z = -1, Q = null, T.pop(), T.length > 0 ? (p = T[T.length - 1], Z === !0 && re.setGlobalState(S.clippingPlanes, p.state.camera)) : p = null, m.pop(), m.length > 0 ? _ = m[m.length - 1] : _ = null;
    };
    function ei(y, O, H, V) {
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
            V && Fe.setFromMatrixPosition(y.matrixWorld).applyMatrix4(Me);
            const me = J.update(y), be = y.material;
            be.visible && _.push(y, me, be, H, Fe.z, null);
          }
        } else if ((y.isMesh || y.isLine || y.isPoints) && (!y.frustumCulled || ht.intersectsObject(y))) {
          const me = J.update(y), be = y.material;
          if (V && (y.boundingSphere !== void 0 ? (y.boundingSphere === null && y.computeBoundingSphere(), Fe.copy(y.boundingSphere.center)) : (me.boundingSphere === null && me.computeBoundingSphere(), Fe.copy(me.boundingSphere.center)), Fe.applyMatrix4(y.matrixWorld).applyMatrix4(Me)), Array.isArray(be)) {
            const we = me.groups;
            for (let Ue = 0, Ne = we.length; Ue < Ne; Ue++) {
              const Ce = we[Ue], ct = be[Ce.materialIndex];
              ct && ct.visible && _.push(y, me, ct, H, Fe.z, Ce);
            }
          } else be.visible && _.push(y, me, be, H, Fe.z, null);
        }
      }
      const ce = y.children;
      for (let me = 0, be = ce.length; me < be; me++)
        ei(ce[me], O, H, V);
    }
    function Qi(y, O, H, V) {
      const k = y.opaque, ce = y.transmissive, me = y.transparent;
      p.setupLightsView(H), Z === !0 && re.setGlobalState(S.clippingPlanes, H), V && Oe.viewport(v.copy(V)), k.length > 0 && ti(k, O, H), ce.length > 0 && ti(ce, O, H), me.length > 0 && ti(me, O, H), Oe.buffers.depth.setTest(!0), Oe.buffers.depth.setMask(!0), Oe.buffers.color.setMask(!0), Oe.setPolygonOffset(!1);
    }
    function es(y, O, H, V) {
      if ((H.isScene === !0 ? H.overrideMaterial : null) !== null)
        return;
      p.state.transmissionRenderTarget[V.id] === void 0 && (p.state.transmissionRenderTarget[V.id] = new _i(1, 1, {
        generateMipmaps: !0,
        type: Te.has("EXT_color_buffer_half_float") || Te.has("EXT_color_buffer_float") ? 1016 : 1009,
        minFilter: 1008,
        samples: 4,
        stencilBuffer: r,
        resolveDepthBuffer: !1,
        resolveStencilBuffer: !1,
        colorSpace: at.workingColorSpace
      }));
      const ce = p.state.transmissionRenderTarget[V.id], me = V.viewport || v;
      ce.setSize(me.z, me.w);
      const be = S.getRenderTarget();
      S.setRenderTarget(ce), S.getClearColor(X), K = S.getClearAlpha(), K < 1 && S.setClearColor(16777215, 0.5), S.clear(), ut && Be.render(H);
      const we = S.toneMapping;
      S.toneMapping = 0;
      const Ue = V.viewport;
      if (V.viewport !== void 0 && (V.viewport = void 0), p.setupLightsView(V), Z === !0 && re.setGlobalState(S.clippingPlanes, V), ti(y, H, V), w.updateMultisampleRenderTarget(ce), w.updateRenderTargetMipmap(ce), Te.has("WEBGL_multisampled_render_to_texture") === !1) {
        let Ne = !1;
        for (let Ce = 0, ct = O.length; Ce < ct; Ce++) {
          const xt = O[Ce], Mt = xt.object, jt = xt.geometry, lt = xt.material, Ie = xt.group;
          if (lt.side === 2 && Mt.layers.test(V.layers)) {
            const Ct = lt.side;
            lt.side = 1, lt.needsUpdate = !0, cn(Mt, H, V, jt, lt, Ie), lt.side = Ct, lt.needsUpdate = !0, Ne = !0;
          }
        }
        Ne === !0 && (w.updateMultisampleRenderTarget(ce), w.updateRenderTargetMipmap(ce));
      }
      S.setRenderTarget(be), S.setClearColor(X, K), Ue !== void 0 && (V.viewport = Ue), S.toneMapping = we;
    }
    function ti(y, O, H) {
      const V = O.isScene === !0 ? O.overrideMaterial : null;
      for (let k = 0, ce = y.length; k < ce; k++) {
        const me = y[k], be = me.object, we = me.geometry, Ue = V === null ? me.material : V, Ne = me.group;
        be.layers.test(H.layers) && cn(be, O, H, we, Ue, Ne);
      }
    }
    function cn(y, O, H, V, k, ce) {
      y.onBeforeRender(S, O, H, V, k, ce), y.modelViewMatrix.multiplyMatrices(H.matrixWorldInverse, y.matrixWorld), y.normalMatrix.getNormalMatrix(y.modelViewMatrix), k.onBeforeRender(S, O, H, V, y, ce), k.transparent === !0 && k.side === 2 && k.forceSinglePass === !1 ? (k.side = 1, k.needsUpdate = !0, S.renderBufferDirect(H, O, V, k, y, ce), k.side = 0, k.needsUpdate = !0, S.renderBufferDirect(H, O, V, k, y, ce), k.side = 2) : S.renderBufferDirect(H, O, V, k, y, ce), y.onAfterRender(S, O, H, V, k, ce);
    }
    function pn(y, O, H) {
      O.isScene !== !0 && (O = it);
      const V = ze.get(y), k = p.state.lights, ce = p.state.shadowsArray, me = k.state.version, be = _e.getParameters(y, k.state, ce, O, H), we = _e.getProgramCacheKey(be);
      let Ue = V.programs;
      V.environment = y.isMeshStandardMaterial ? O.environment : null, V.fog = O.fog, V.envMap = (y.isMeshStandardMaterial ? G : M).get(y.envMap || V.environment), V.envMapRotation = V.environment !== null && y.envMap === null ? O.environmentRotation : y.envMapRotation, Ue === void 0 && (y.addEventListener("dispose", rt), Ue = /* @__PURE__ */ new Map(), V.programs = Ue);
      let Ne = Ue.get(we);
      if (Ne !== void 0) {
        if (V.currentProgram === Ne && V.lightsStateVersion === me)
          return Ms(y, be), Ne;
      } else
        be.uniforms = _e.getUniforms(y), y.onBeforeCompile(be, S), Ne = _e.acquireProgram(be, we), Ue.set(we, Ne), V.uniforms = be.uniforms;
      const Ce = V.uniforms;
      return (!y.isShaderMaterial && !y.isRawShaderMaterial || y.clipping === !0) && (Ce.clippingPlanes = re.uniform), Ms(y, be), V.needsLights = vi(y), V.lightsStateVersion = me, V.needsLights && (Ce.ambientLightColor.value = k.state.ambient, Ce.lightProbe.value = k.state.probe, Ce.directionalLights.value = k.state.directional, Ce.directionalLightShadows.value = k.state.directionalShadow, Ce.spotLights.value = k.state.spot, Ce.spotLightShadows.value = k.state.spotShadow, Ce.rectAreaLights.value = k.state.rectArea, Ce.ltc_1.value = k.state.rectAreaLTC1, Ce.ltc_2.value = k.state.rectAreaLTC2, Ce.pointLights.value = k.state.point, Ce.pointLightShadows.value = k.state.pointShadow, Ce.hemisphereLights.value = k.state.hemi, Ce.directionalShadowMap.value = k.state.directionalShadowMap, Ce.directionalShadowMatrix.value = k.state.directionalShadowMatrix, Ce.spotShadowMap.value = k.state.spotShadowMap, Ce.spotLightMatrix.value = k.state.spotLightMatrix, Ce.spotLightMap.value = k.state.spotLightMap, Ce.pointShadowMap.value = k.state.pointShadowMap, Ce.pointShadowMatrix.value = k.state.pointShadowMatrix), V.currentProgram = Ne, V.uniformsList = null, Ne;
    }
    function ts(y) {
      if (y.uniformsList === null) {
        const O = y.currentProgram.getUniforms();
        y.uniformsList = sr.seqWithValue(O.seq, y.uniforms);
      }
      return y.uniformsList;
    }
    function Ms(y, O) {
      const H = ze.get(y);
      H.outputColorSpace = O.outputColorSpace, H.batching = O.batching, H.batchingColor = O.batchingColor, H.instancing = O.instancing, H.instancingColor = O.instancingColor, H.instancingMorph = O.instancingMorph, H.skinning = O.skinning, H.morphTargets = O.morphTargets, H.morphNormals = O.morphNormals, H.morphColors = O.morphColors, H.morphTargetsCount = O.morphTargetsCount, H.numClippingPlanes = O.numClippingPlanes, H.numIntersection = O.numClipIntersection, H.vertexAlphas = O.vertexAlphas, H.vertexTangents = O.vertexTangents, H.toneMapping = O.toneMapping;
    }
    function _r(y, O, H, V, k) {
      O.isScene !== !0 && (O = it), w.resetTextureUnits();
      const ce = O.fog, me = V.isMeshStandardMaterial ? O.environment : null, be = I === null ? S.outputColorSpace : I.isXRRenderTarget === !0 ? I.texture.colorSpace : Gt, we = (V.isMeshStandardMaterial ? G : M).get(V.envMap || me), Ue = V.vertexColors === !0 && !!H.attributes.color && H.attributes.color.itemSize === 4, Ne = !!H.attributes.tangent && (!!V.normalMap || V.anisotropy > 0), Ce = !!H.morphAttributes.position, ct = !!H.morphAttributes.normal, xt = !!H.morphAttributes.color;
      let Mt = 0;
      V.toneMapped && (I === null || I.isXRRenderTarget === !0) && (Mt = S.toneMapping);
      const jt = H.morphAttributes.position || H.morphAttributes.normal || H.morphAttributes.color, lt = jt !== void 0 ? jt.length : 0, Ie = ze.get(V), Ct = p.state.lights;
      if (Z === !0 && (se === !0 || y !== Q)) {
        const en = y === Q && V.id === z;
        re.setState(V, y, en);
      }
      let ot = !1;
      V.version === Ie.__version ? (Ie.needsLights && Ie.lightsStateVersion !== Ct.state.version || Ie.outputColorSpace !== be || k.isBatchedMesh && Ie.batching === !1 || !k.isBatchedMesh && Ie.batching === !0 || k.isBatchedMesh && Ie.batchingColor === !0 && k.colorTexture === null || k.isBatchedMesh && Ie.batchingColor === !1 && k.colorTexture !== null || k.isInstancedMesh && Ie.instancing === !1 || !k.isInstancedMesh && Ie.instancing === !0 || k.isSkinnedMesh && Ie.skinning === !1 || !k.isSkinnedMesh && Ie.skinning === !0 || k.isInstancedMesh && Ie.instancingColor === !0 && k.instanceColor === null || k.isInstancedMesh && Ie.instancingColor === !1 && k.instanceColor !== null || k.isInstancedMesh && Ie.instancingMorph === !0 && k.morphTexture === null || k.isInstancedMesh && Ie.instancingMorph === !1 && k.morphTexture !== null || Ie.envMap !== we || V.fog === !0 && Ie.fog !== ce || Ie.numClippingPlanes !== void 0 && (Ie.numClippingPlanes !== re.numPlanes || Ie.numIntersection !== re.numIntersection) || Ie.vertexAlphas !== Ue || Ie.vertexTangents !== Ne || Ie.morphTargets !== Ce || Ie.morphNormals !== ct || Ie.morphColors !== xt || Ie.toneMapping !== Mt || Ie.morphTargetsCount !== lt) && (ot = !0) : (ot = !0, Ie.__version = V.version);
      let zt = Ie.currentProgram;
      ot === !0 && (zt = pn(V, O, k));
      let zn = !1, Yt = !1, ns = !1;
      const wt = zt.getUniforms(), sn = Ie.uniforms;
      if (Oe.useProgram(zt.program) && (zn = !0, Yt = !0, ns = !0), V.id !== z && (z = V.id, Yt = !0), zn || Q !== y) {
        D.reverseDepthBuffer ? (Re.copy(y.projectionMatrix), gl(Re), _l(Re), wt.setValue(U, "projectionMatrix", Re)) : wt.setValue(U, "projectionMatrix", y.projectionMatrix), wt.setValue(U, "viewMatrix", y.matrixWorldInverse);
        const en = wt.map.cameraPosition;
        en !== void 0 && en.setValue(U, Ve.setFromMatrixPosition(y.matrixWorld)), D.logarithmicDepthBuffer && wt.setValue(
          U,
          "logDepthBufFC",
          2 / (Math.log(y.far + 1) / Math.LN2)
        ), (V.isMeshPhongMaterial || V.isMeshToonMaterial || V.isMeshLambertMaterial || V.isMeshBasicMaterial || V.isMeshStandardMaterial || V.isShaderMaterial) && wt.setValue(U, "isOrthographic", y.isOrthographicCamera === !0), Q !== y && (Q = y, Yt = !0, ns = !0);
      }
      if (k.isSkinnedMesh) {
        wt.setOptional(U, k, "bindMatrix"), wt.setOptional(U, k, "bindMatrixInverse");
        const en = k.skeleton;
        en && (en.boneTexture === null && en.computeBoneTexture(), wt.setValue(U, "boneTexture", en.boneTexture, w));
      }
      k.isBatchedMesh && (wt.setOptional(U, k, "batchingTexture"), wt.setValue(U, "batchingTexture", k._matricesTexture, w), wt.setOptional(U, k, "batchingIdTexture"), wt.setValue(U, "batchingIdTexture", k._indirectTexture, w), wt.setOptional(U, k, "batchingColorTexture"), k._colorsTexture !== null && wt.setValue(U, "batchingColorTexture", k._colorsTexture, w));
      const is = H.morphAttributes;
      if ((is.position !== void 0 || is.normal !== void 0 || is.color !== void 0) && De.update(k, H, zt), (Yt || Ie.receiveShadow !== k.receiveShadow) && (Ie.receiveShadow = k.receiveShadow, wt.setValue(U, "receiveShadow", k.receiveShadow)), V.isMeshGouraudMaterial && V.envMap !== null && (sn.envMap.value = we, sn.flipEnvMap.value = we.isCubeTexture && we.isRenderTargetTexture === !1 ? -1 : 1), V.isMeshStandardMaterial && V.envMap === null && O.environment !== null && (sn.envMapIntensity.value = O.environmentIntensity), Yt && (wt.setValue(U, "toneMappingExposure", S.toneMappingExposure), Ie.needsLights && xr(sn, ns), ce && V.fog === !0 && de.refreshFogUniforms(sn, ce), de.refreshMaterialUniforms(sn, V, oe, j, p.state.transmissionRenderTarget[y.id]), sr.upload(U, ts(Ie), sn, w)), V.isShaderMaterial && V.uniformsNeedUpdate === !0 && (sr.upload(U, ts(Ie), sn, w), V.uniformsNeedUpdate = !1), V.isSpriteMaterial && wt.setValue(U, "center", k.center), wt.setValue(U, "modelViewMatrix", k.modelViewMatrix), wt.setValue(U, "normalMatrix", k.normalMatrix), wt.setValue(U, "modelMatrix", k.matrixWorld), V.isShaderMaterial || V.isRawShaderMaterial) {
        const en = V.uniformsGroups;
        for (let ni = 0, vr = en.length; ni < vr; ni++) {
          const ys = en[ni];
          B.update(ys, zt), B.bind(ys, zt);
        }
      }
      return zt;
    }
    function xr(y, O) {
      y.ambientLightColor.needsUpdate = O, y.lightProbe.needsUpdate = O, y.directionalLights.needsUpdate = O, y.directionalLightShadows.needsUpdate = O, y.pointLights.needsUpdate = O, y.pointLightShadows.needsUpdate = O, y.spotLights.needsUpdate = O, y.spotLightShadows.needsUpdate = O, y.rectAreaLights.needsUpdate = O, y.hemisphereLights.needsUpdate = O;
    }
    function vi(y) {
      return y.isMeshLambertMaterial || y.isMeshToonMaterial || y.isMeshPhongMaterial || y.isMeshStandardMaterial || y.isShadowMaterial || y.isShaderMaterial && y.lights === !0;
    }
    this.getActiveCubeFace = function() {
      return F;
    }, this.getActiveMipmapLevel = function() {
      return C;
    }, this.getRenderTarget = function() {
      return I;
    }, this.setRenderTargetTextures = function(y, O, H) {
      ze.get(y.texture).__webglTexture = O, ze.get(y.depthTexture).__webglTexture = H;
      const V = ze.get(y);
      V.__hasExternalTextures = !0, V.__autoAllocateDepthBuffer = H === void 0, V.__autoAllocateDepthBuffer || Te.has("WEBGL_multisampled_render_to_texture") === !0 && (console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"), V.__useRenderToTexture = !1);
    }, this.setRenderTargetFramebuffer = function(y, O) {
      const H = ze.get(y);
      H.__webglFramebuffer = O, H.__useDefaultFramebuffer = O === void 0;
    }, this.setRenderTarget = function(y, O = 0, H = 0) {
      I = y, F = O, C = H;
      let V = !0, k = null, ce = !1, me = !1;
      if (y) {
        const we = ze.get(y);
        if (we.__useDefaultFramebuffer !== void 0)
          Oe.bindFramebuffer(U.FRAMEBUFFER, null), V = !1;
        else if (we.__webglFramebuffer === void 0)
          w.setupRenderTarget(y);
        else if (we.__hasExternalTextures)
          w.rebindTextures(y, ze.get(y.texture).__webglTexture, ze.get(y.depthTexture).__webglTexture);
        else if (y.depthBuffer) {
          const Ce = y.depthTexture;
          if (we.__boundDepthTexture !== Ce) {
            if (Ce !== null && ze.has(Ce) && (y.width !== Ce.image.width || y.height !== Ce.image.height))
              throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");
            w.setupDepthRenderbuffer(y);
          }
        }
        const Ue = y.texture;
        (Ue.isData3DTexture || Ue.isDataArrayTexture || Ue.isCompressedArrayTexture) && (me = !0);
        const Ne = ze.get(y).__webglFramebuffer;
        y.isWebGLCubeRenderTarget ? (Array.isArray(Ne[O]) ? k = Ne[O][H] : k = Ne[O], ce = !0) : y.samples > 0 && w.useMultisampledRTT(y) === !1 ? k = ze.get(y).__webglMultisampledFramebuffer : Array.isArray(Ne) ? k = Ne[H] : k = Ne, v.copy(y.viewport), E.copy(y.scissor), W = y.scissorTest;
      } else
        v.copy(ve).multiplyScalar(oe).floor(), E.copy(Ae).multiplyScalar(oe).floor(), W = Qe;
      if (Oe.bindFramebuffer(U.FRAMEBUFFER, k) && V && Oe.drawBuffers(y, k), Oe.viewport(v), Oe.scissor(E), Oe.setScissorTest(W), ce) {
        const we = ze.get(y.texture);
        U.framebufferTexture2D(U.FRAMEBUFFER, U.COLOR_ATTACHMENT0, U.TEXTURE_CUBE_MAP_POSITIVE_X + O, we.__webglTexture, H);
      } else if (me) {
        const we = ze.get(y.texture), Ue = O || 0;
        U.framebufferTextureLayer(U.FRAMEBUFFER, U.COLOR_ATTACHMENT0, we.__webglTexture, H || 0, Ue);
      }
      z = -1;
    }, this.readRenderTargetPixels = function(y, O, H, V, k, ce, me) {
      if (!(y && y.isWebGLRenderTarget)) {
        console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
        return;
      }
      let be = ze.get(y).__webglFramebuffer;
      if (y.isWebGLCubeRenderTarget && me !== void 0 && (be = be[me]), be) {
        Oe.bindFramebuffer(U.FRAMEBUFFER, be);
        try {
          const we = y.texture, Ue = we.format, Ne = we.type;
          if (!D.textureFormatReadable(Ue)) {
            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");
            return;
          }
          if (!D.textureTypeReadable(Ne)) {
            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");
            return;
          }
          O >= 0 && O <= y.width - V && H >= 0 && H <= y.height - k && U.readPixels(O, H, V, k, ke.convert(Ue), ke.convert(Ne), ce);
        } finally {
          const we = I !== null ? ze.get(I).__webglFramebuffer : null;
          Oe.bindFramebuffer(U.FRAMEBUFFER, we);
        }
      }
    }, this.readRenderTargetPixelsAsync = async function(y, O, H, V, k, ce, me) {
      if (!(y && y.isWebGLRenderTarget))
        throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
      let be = ze.get(y).__webglFramebuffer;
      if (y.isWebGLCubeRenderTarget && me !== void 0 && (be = be[me]), be) {
        const we = y.texture, Ue = we.format, Ne = we.type;
        if (!D.textureFormatReadable(Ue))
          throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");
        if (!D.textureTypeReadable(Ne))
          throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");
        if (O >= 0 && O <= y.width - V && H >= 0 && H <= y.height - k) {
          Oe.bindFramebuffer(U.FRAMEBUFFER, be);
          const Ce = U.createBuffer();
          U.bindBuffer(U.PIXEL_PACK_BUFFER, Ce), U.bufferData(U.PIXEL_PACK_BUFFER, ce.byteLength, U.STREAM_READ), U.readPixels(O, H, V, k, ke.convert(Ue), ke.convert(Ne), 0);
          const ct = I !== null ? ze.get(I).__webglFramebuffer : null;
          Oe.bindFramebuffer(U.FRAMEBUFFER, ct);
          const xt = U.fenceSync(U.SYNC_GPU_COMMANDS_COMPLETE, 0);
          return U.flush(), await ml(U, xt, 4), U.bindBuffer(U.PIXEL_PACK_BUFFER, Ce), U.getBufferSubData(U.PIXEL_PACK_BUFFER, 0, ce), U.deleteBuffer(Ce), U.deleteSync(xt), ce;
        } else
          throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.");
      }
    }, this.copyFramebufferToTexture = function(y, O = null, H = 0) {
      y.isTexture !== !0 && (ir("WebGLRenderer: copyFramebufferToTexture function signature has changed."), O = arguments[0] || null, y = arguments[1]);
      const V = Math.pow(2, -H), k = Math.floor(y.image.width * V), ce = Math.floor(y.image.height * V), me = O !== null ? O.x : 0, be = O !== null ? O.y : 0;
      w.setTexture2D(y, 0), U.copyTexSubImage2D(U.TEXTURE_2D, H, 0, 0, me, be, k, ce), Oe.unbindTexture();
    }, this.copyTextureToTexture = function(y, O, H = null, V = null, k = 0) {
      y.isTexture !== !0 && (ir("WebGLRenderer: copyTextureToTexture function signature has changed."), V = arguments[0] || null, y = arguments[1], O = arguments[2], k = arguments[3] || 0, H = null);
      let ce, me, be, we, Ue, Ne;
      H !== null ? (ce = H.max.x - H.min.x, me = H.max.y - H.min.y, be = H.min.x, we = H.min.y) : (ce = y.image.width, me = y.image.height, be = 0, we = 0), V !== null ? (Ue = V.x, Ne = V.y) : (Ue = 0, Ne = 0);
      const Ce = ke.convert(O.format), ct = ke.convert(O.type);
      w.setTexture2D(O, 0), U.pixelStorei(U.UNPACK_FLIP_Y_WEBGL, O.flipY), U.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL, O.premultiplyAlpha), U.pixelStorei(U.UNPACK_ALIGNMENT, O.unpackAlignment);
      const xt = U.getParameter(U.UNPACK_ROW_LENGTH), Mt = U.getParameter(U.UNPACK_IMAGE_HEIGHT), jt = U.getParameter(U.UNPACK_SKIP_PIXELS), lt = U.getParameter(U.UNPACK_SKIP_ROWS), Ie = U.getParameter(U.UNPACK_SKIP_IMAGES), Ct = y.isCompressedTexture ? y.mipmaps[k] : y.image;
      U.pixelStorei(U.UNPACK_ROW_LENGTH, Ct.width), U.pixelStorei(U.UNPACK_IMAGE_HEIGHT, Ct.height), U.pixelStorei(U.UNPACK_SKIP_PIXELS, be), U.pixelStorei(U.UNPACK_SKIP_ROWS, we), y.isDataTexture ? U.texSubImage2D(U.TEXTURE_2D, k, Ue, Ne, ce, me, Ce, ct, Ct.data) : y.isCompressedTexture ? U.compressedTexSubImage2D(U.TEXTURE_2D, k, Ue, Ne, Ct.width, Ct.height, Ce, Ct.data) : U.texSubImage2D(U.TEXTURE_2D, k, Ue, Ne, ce, me, Ce, ct, Ct), U.pixelStorei(U.UNPACK_ROW_LENGTH, xt), U.pixelStorei(U.UNPACK_IMAGE_HEIGHT, Mt), U.pixelStorei(U.UNPACK_SKIP_PIXELS, jt), U.pixelStorei(U.UNPACK_SKIP_ROWS, lt), U.pixelStorei(U.UNPACK_SKIP_IMAGES, Ie), k === 0 && O.generateMipmaps && U.generateMipmap(U.TEXTURE_2D), Oe.unbindTexture();
    }, this.copyTextureToTexture3D = function(y, O, H = null, V = null, k = 0) {
      y.isTexture !== !0 && (ir("WebGLRenderer: copyTextureToTexture3D function signature has changed."), H = arguments[0] || null, V = arguments[1] || null, y = arguments[2], O = arguments[3], k = arguments[4] || 0);
      let ce, me, be, we, Ue, Ne, Ce, ct, xt;
      const Mt = y.isCompressedTexture ? y.mipmaps[k] : y.image;
      H !== null ? (ce = H.max.x - H.min.x, me = H.max.y - H.min.y, be = H.max.z - H.min.z, we = H.min.x, Ue = H.min.y, Ne = H.min.z) : (ce = Mt.width, me = Mt.height, be = Mt.depth, we = 0, Ue = 0, Ne = 0), V !== null ? (Ce = V.x, ct = V.y, xt = V.z) : (Ce = 0, ct = 0, xt = 0);
      const jt = ke.convert(O.format), lt = ke.convert(O.type);
      let Ie;
      if (O.isData3DTexture)
        w.setTexture3D(O, 0), Ie = U.TEXTURE_3D;
      else if (O.isDataArrayTexture || O.isCompressedArrayTexture)
        w.setTexture2DArray(O, 0), Ie = U.TEXTURE_2D_ARRAY;
      else {
        console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");
        return;
      }
      U.pixelStorei(U.UNPACK_FLIP_Y_WEBGL, O.flipY), U.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL, O.premultiplyAlpha), U.pixelStorei(U.UNPACK_ALIGNMENT, O.unpackAlignment);
      const Ct = U.getParameter(U.UNPACK_ROW_LENGTH), ot = U.getParameter(U.UNPACK_IMAGE_HEIGHT), zt = U.getParameter(U.UNPACK_SKIP_PIXELS), zn = U.getParameter(U.UNPACK_SKIP_ROWS), Yt = U.getParameter(U.UNPACK_SKIP_IMAGES);
      U.pixelStorei(U.UNPACK_ROW_LENGTH, Mt.width), U.pixelStorei(U.UNPACK_IMAGE_HEIGHT, Mt.height), U.pixelStorei(U.UNPACK_SKIP_PIXELS, we), U.pixelStorei(U.UNPACK_SKIP_ROWS, Ue), U.pixelStorei(U.UNPACK_SKIP_IMAGES, Ne), y.isDataTexture || y.isData3DTexture ? U.texSubImage3D(Ie, k, Ce, ct, xt, ce, me, be, jt, lt, Mt.data) : O.isCompressedArrayTexture ? U.compressedTexSubImage3D(Ie, k, Ce, ct, xt, ce, me, be, jt, Mt.data) : U.texSubImage3D(Ie, k, Ce, ct, xt, ce, me, be, jt, lt, Mt), U.pixelStorei(U.UNPACK_ROW_LENGTH, Ct), U.pixelStorei(U.UNPACK_IMAGE_HEIGHT, ot), U.pixelStorei(U.UNPACK_SKIP_PIXELS, zt), U.pixelStorei(U.UNPACK_SKIP_ROWS, zn), U.pixelStorei(U.UNPACK_SKIP_IMAGES, Yt), k === 0 && O.generateMipmaps && U.generateMipmap(Ie), Oe.unbindTexture();
    }, this.initRenderTarget = function(y) {
      ze.get(y).__webglFramebuffer === void 0 && w.setupRenderTarget(y);
    }, this.initTexture = function(y) {
      y.isCubeTexture ? w.setTextureCube(y, 0) : y.isData3DTexture ? w.setTexture3D(y, 0) : y.isDataArrayTexture || y.isCompressedArrayTexture ? w.setTexture2DArray(y, 0) : w.setTexture2D(y, 0), Oe.unbindTexture();
    }, this.resetState = function() {
      F = 0, C = 0, I = null, Oe.reset(), mt.reset();
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
    t.drawingBufferColorSpace = e === xa ? "display-p3" : "srgb", t.unpackColorSpace = at.workingColorSpace === ur ? "display-p3" : "srgb";
  }
}
class Cp extends bt {
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
class Ip {
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
class Ea {
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
    return this.normalized && (n = _t(n, this.array)), this.data.array[e * this.data.stride + this.offset + t] = n, this;
  }
  setX(e, t) {
    return this.normalized && (t = _t(t, this.array)), this.data.array[e * this.data.stride + this.offset] = t, this;
  }
  setY(e, t) {
    return this.normalized && (t = _t(t, this.array)), this.data.array[e * this.data.stride + this.offset + 1] = t, this;
  }
  setZ(e, t) {
    return this.normalized && (t = _t(t, this.array)), this.data.array[e * this.data.stride + this.offset + 2] = t, this;
  }
  setW(e, t) {
    return this.normalized && (t = _t(t, this.array)), this.data.array[e * this.data.stride + this.offset + 3] = t, this;
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
    return e = e * this.data.stride + this.offset, this.normalized && (t = _t(t, this.array), n = _t(n, this.array)), this.data.array[e + 0] = t, this.data.array[e + 1] = n, this;
  }
  setXYZ(e, t, n, i) {
    return e = e * this.data.stride + this.offset, this.normalized && (t = _t(t, this.array), n = _t(n, this.array), i = _t(i, this.array)), this.data.array[e + 0] = t, this.data.array[e + 1] = n, this.data.array[e + 2] = i, this;
  }
  setXYZW(e, t, n, i, r) {
    return e = e * this.data.stride + this.offset, this.normalized && (t = _t(t, this.array), n = _t(n, this.array), i = _t(i, this.array), r = _t(r, this.array)), this.data.array[e + 0] = t, this.data.array[e + 1] = n, this.data.array[e + 2] = i, this.data.array[e + 3] = r, this;
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
      return e.interleavedBuffers === void 0 && (e.interleavedBuffers = {}), e.interleavedBuffers[this.data.uuid] === void 0 && (e.interleavedBuffers[this.data.uuid] = this.data.clone(e)), new Ea(e.interleavedBuffers[this.data.uuid], this.itemSize, this.offset, this.normalized);
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
const Do = /* @__PURE__ */ new N(), Uo = /* @__PURE__ */ new ft(), No = /* @__PURE__ */ new ft(), Pp = /* @__PURE__ */ new N(), Fo = /* @__PURE__ */ new Ye(), Xs = /* @__PURE__ */ new N(), Jr = /* @__PURE__ */ new Rn(), Bo = /* @__PURE__ */ new Ye(), Qr = /* @__PURE__ */ new xs();
class Lp extends Le {
  constructor(e, t) {
    super(e, t), this.isSkinnedMesh = !0, this.type = "SkinnedMesh", this.bindMode = Ha, this.bindMatrix = new Ye(), this.bindMatrixInverse = new Ye(), this.boundingBox = null, this.boundingSphere = null;
  }
  computeBoundingBox() {
    const e = this.geometry;
    this.boundingBox === null && (this.boundingBox = new En()), this.boundingBox.makeEmpty();
    const t = e.getAttribute("position");
    for (let n = 0; n < t.count; n++)
      this.getVertexPosition(n, Xs), this.boundingBox.expandByPoint(Xs);
  }
  computeBoundingSphere() {
    const e = this.geometry;
    this.boundingSphere === null && (this.boundingSphere = new Rn()), this.boundingSphere.makeEmpty();
    const t = e.getAttribute("position");
    for (let n = 0; n < t.count; n++)
      this.getVertexPosition(n, Xs), this.boundingSphere.expandByPoint(Xs);
  }
  copy(e, t) {
    return super.copy(e, t), this.bindMode = e.bindMode, this.bindMatrix.copy(e.bindMatrix), this.bindMatrixInverse.copy(e.bindMatrixInverse), this.skeleton = e.skeleton, e.boundingBox !== null && (this.boundingBox = e.boundingBox.clone()), e.boundingSphere !== null && (this.boundingSphere = e.boundingSphere.clone()), this;
  }
  raycast(e, t) {
    const n = this.material, i = this.matrixWorld;
    n !== void 0 && (this.boundingSphere === null && this.computeBoundingSphere(), Jr.copy(this.boundingSphere), Jr.applyMatrix4(i), e.ray.intersectsSphere(Jr) !== !1 && (Bo.copy(i).invert(), Qr.copy(e.ray).applyMatrix4(Bo), !(this.boundingBox !== null && Qr.intersectsBox(this.boundingBox) === !1) && this._computeIntersections(e, t, Qr)));
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
    const e = new ft(), t = this.geometry.attributes.skinWeight;
    for (let n = 0, i = t.count; n < i; n++) {
      e.fromBufferAttribute(t, n);
      const r = 1 / e.manhattanLength();
      r !== 1 / 0 ? e.multiplyScalar(r) : e.set(1, 0, 0, 0), t.setXYZW(n, e.x, e.y, e.z, e.w);
    }
  }
  updateMatrixWorld(e) {
    super.updateMatrixWorld(e), this.bindMode === Ha ? this.bindMatrixInverse.copy(this.matrixWorld).invert() : this.bindMode === Zc ? this.bindMatrixInverse.copy(this.bindMatrix).invert() : console.warn("THREE.SkinnedMesh: Unrecognized bindMode: " + this.bindMode);
  }
  applyBoneTransform(e, t) {
    const n = this.skeleton, i = this.geometry;
    Uo.fromBufferAttribute(i.attributes.skinIndex, e), No.fromBufferAttribute(i.attributes.skinWeight, e), Do.copy(t).applyMatrix4(this.bindMatrix), t.set(0, 0, 0);
    for (let r = 0; r < 4; r++) {
      const a = No.getComponent(r);
      if (a !== 0) {
        const o = Uo.getComponent(r);
        Fo.multiplyMatrices(n.bones[o].matrixWorld, n.boneInverses[o]), t.addScaledVector(Pp.copy(Do).applyMatrix4(Fo), a);
      }
    }
    return t.applyMatrix4(this.bindMatrixInverse);
  }
}
class Ac extends bt {
  constructor() {
    super(), this.isBone = !0, this.type = "Bone";
  }
}
class Ta extends Nt {
  constructor(e = null, t = 1, n = 1, i, r, a, o, c, l = 1003, u = 1003, h, d) {
    super(null, a, o, c, l, u, i, r, h, d), this.isDataTexture = !0, this.image = { data: e, width: t, height: n }, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1;
  }
}
const Oo = /* @__PURE__ */ new Ye(), Dp = /* @__PURE__ */ new Ye();
class Aa {
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
        this.boneInverses.push(new Ye());
    }
  }
  calculateInverses() {
    this.boneInverses.length = 0;
    for (let e = 0, t = this.bones.length; e < t; e++) {
      const n = new Ye();
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
      const o = e[r] ? e[r].matrixWorld : Dp;
      Oo.multiplyMatrices(o, t[r]), Oo.toArray(n, r * 16);
    }
    i !== null && (i.needsUpdate = !0);
  }
  clone() {
    return new Aa(this.bones, this.boneInverses);
  }
  computeBoneTexture() {
    let e = Math.sqrt(this.bones.length * 4);
    e = Math.ceil(e / 4) * 4, e = Math.max(e, 4);
    const t = new Float32Array(e * e * 4);
    t.set(this.boneMatrices);
    const n = new Ta(t, e, e, 1023, 1015);
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
      a === void 0 && (console.warn("THREE.Skeleton: No bone found with UUID:", r), a = new Ac()), this.bones.push(a), this.boneInverses.push(new Ye().fromArray(e.boneInverses[n]));
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
class ua extends Jt {
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
const Ni = /* @__PURE__ */ new Ye(), ko = /* @__PURE__ */ new Ye(), qs = [], zo = /* @__PURE__ */ new En(), Up = /* @__PURE__ */ new Ye(), ls = /* @__PURE__ */ new Le(), hs = /* @__PURE__ */ new Rn();
class Np extends Le {
  constructor(e, t, n) {
    super(e, t), this.isInstancedMesh = !0, this.instanceMatrix = new ua(new Float32Array(n * 16), 16), this.instanceColor = null, this.morphTexture = null, this.count = n, this.boundingBox = null, this.boundingSphere = null;
    for (let i = 0; i < n; i++)
      this.setMatrixAt(i, Up);
  }
  computeBoundingBox() {
    const e = this.geometry, t = this.count;
    this.boundingBox === null && (this.boundingBox = new En()), e.boundingBox === null && e.computeBoundingBox(), this.boundingBox.makeEmpty();
    for (let n = 0; n < t; n++)
      this.getMatrixAt(n, Ni), zo.copy(e.boundingBox).applyMatrix4(Ni), this.boundingBox.union(zo);
  }
  computeBoundingSphere() {
    const e = this.geometry, t = this.count;
    this.boundingSphere === null && (this.boundingSphere = new Rn()), e.boundingSphere === null && e.computeBoundingSphere(), this.boundingSphere.makeEmpty();
    for (let n = 0; n < t; n++)
      this.getMatrixAt(n, Ni), hs.copy(e.boundingSphere).applyMatrix4(Ni), this.boundingSphere.union(hs);
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
    if (ls.geometry = this.geometry, ls.material = this.material, ls.material !== void 0 && (this.boundingSphere === null && this.computeBoundingSphere(), hs.copy(this.boundingSphere), hs.applyMatrix4(n), e.ray.intersectsSphere(hs) !== !1))
      for (let r = 0; r < i; r++) {
        this.getMatrixAt(r, Ni), ko.multiplyMatrices(n, Ni), ls.matrixWorld = ko, ls.raycast(e, qs);
        for (let a = 0, o = qs.length; a < o; a++) {
          const c = qs[a];
          c.instanceId = r, c.object = this, t.push(c);
        }
        qs.length = 0;
      }
  }
  setColorAt(e, t) {
    this.instanceColor === null && (this.instanceColor = new ua(new Float32Array(this.instanceMatrix.count * 3).fill(1), 3)), t.toArray(this.instanceColor.array, e * 3);
  }
  setMatrixAt(e, t) {
    t.toArray(this.instanceMatrix.array, e * 16);
  }
  setMorphAt(e, t) {
    const n = t.morphTargetInfluences, i = n.length + 1;
    this.morphTexture === null && (this.morphTexture = new Ta(new Float32Array(i * this.count), i, this.count, 1028, 1015));
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
class wn extends on {
  constructor(e) {
    super(), this.isLineBasicMaterial = !0, this.type = "LineBasicMaterial", this.color = new Pe(16777215), this.map = null, this.linewidth = 1, this.linecap = "round", this.linejoin = "round", this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.map = e.map, this.linewidth = e.linewidth, this.linecap = e.linecap, this.linejoin = e.linejoin, this.fog = e.fog, this;
  }
}
const lr = /* @__PURE__ */ new N(), hr = /* @__PURE__ */ new N(), Go = /* @__PURE__ */ new Ye(), us = /* @__PURE__ */ new xs(), js = /* @__PURE__ */ new Rn(), ea = /* @__PURE__ */ new N(), Ho = /* @__PURE__ */ new N();
class pr extends bt {
  constructor(e = new It(), t = new wn()) {
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
        lr.fromBufferAttribute(t, i - 1), hr.fromBufferAttribute(t, i), n[i] = n[i - 1], n[i] += lr.distanceTo(hr);
      e.setAttribute("lineDistance", new pt(n, 1));
    } else
      console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
    return this;
  }
  raycast(e, t) {
    const n = this.geometry, i = this.matrixWorld, r = e.params.Line.threshold, a = n.drawRange;
    if (n.boundingSphere === null && n.computeBoundingSphere(), js.copy(n.boundingSphere), js.applyMatrix4(i), js.radius += r, e.ray.intersectsSphere(js) === !1) return;
    Go.copy(i).invert(), us.copy(e.ray).applyMatrix4(Go);
    const o = r / ((this.scale.x + this.scale.y + this.scale.z) / 3), c = o * o, l = this.isLineSegments ? 2 : 1, u = n.index, d = n.attributes.position;
    if (u !== null) {
      const f = Math.max(0, a.start), g = Math.min(u.count, a.start + a.count);
      for (let _ = f, p = g - 1; _ < p; _ += l) {
        const m = u.getX(_), T = u.getX(_ + 1), S = Ys(this, e, us, c, m, T);
        S && t.push(S);
      }
      if (this.isLineLoop) {
        const _ = u.getX(g - 1), p = u.getX(f), m = Ys(this, e, us, c, _, p);
        m && t.push(m);
      }
    } else {
      const f = Math.max(0, a.start), g = Math.min(d.count, a.start + a.count);
      for (let _ = f, p = g - 1; _ < p; _ += l) {
        const m = Ys(this, e, us, c, _, _ + 1);
        m && t.push(m);
      }
      if (this.isLineLoop) {
        const _ = Ys(this, e, us, c, g - 1, f);
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
function Ys(s, e, t, n, i, r) {
  const a = s.geometry.attributes.position;
  if (lr.fromBufferAttribute(a, i), hr.fromBufferAttribute(a, r), t.distanceSqToSegment(lr, hr, ea, Ho) > n) return;
  ea.applyMatrix4(s.matrixWorld);
  const c = e.ray.origin.distanceTo(ea);
  if (!(c < e.near || c > e.far))
    return {
      distance: c,
      // What do we want? intersection point on the ray or on the segment??
      // point: raycaster.ray.at( distance ),
      point: Ho.clone().applyMatrix4(s.matrixWorld),
      index: i,
      face: null,
      faceIndex: null,
      barycoord: null,
      object: s
    };
}
const Vo = /* @__PURE__ */ new N(), Wo = /* @__PURE__ */ new N();
class mi extends pr {
  constructor(e, t) {
    super(e, t), this.isLineSegments = !0, this.type = "LineSegments";
  }
  computeLineDistances() {
    const e = this.geometry;
    if (e.index === null) {
      const t = e.attributes.position, n = [];
      for (let i = 0, r = t.count; i < r; i += 2)
        Vo.fromBufferAttribute(t, i), Wo.fromBufferAttribute(t, i + 1), n[i] = i === 0 ? 0 : n[i - 1], n[i + 1] = n[i] + Vo.distanceTo(Wo);
      e.setAttribute("lineDistance", new pt(n, 1));
    } else
      console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");
    return this;
  }
}
class Fp extends pr {
  constructor(e, t) {
    super(e, t), this.isLineLoop = !0, this.type = "LineLoop";
  }
}
class Oi extends on {
  constructor(e) {
    super(), this.isPointsMaterial = !0, this.type = "PointsMaterial", this.color = new Pe(16777215), this.map = null, this.alphaMap = null, this.size = 1, this.sizeAttenuation = !0, this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.map = e.map, this.alphaMap = e.alphaMap, this.size = e.size, this.sizeAttenuation = e.sizeAttenuation, this.fog = e.fog, this;
  }
}
const Xo = /* @__PURE__ */ new Ye(), da = /* @__PURE__ */ new xs(), Ks = /* @__PURE__ */ new Rn(), Zs = /* @__PURE__ */ new N();
class rr extends bt {
  constructor(e = new It(), t = new Oi()) {
    super(), this.isPoints = !0, this.type = "Points", this.geometry = e, this.material = t, this.updateMorphTargets();
  }
  copy(e, t) {
    return super.copy(e, t), this.material = Array.isArray(e.material) ? e.material.slice() : e.material, this.geometry = e.geometry, this;
  }
  raycast(e, t) {
    const n = this.geometry, i = this.matrixWorld, r = e.params.Points.threshold, a = n.drawRange;
    if (n.boundingSphere === null && n.computeBoundingSphere(), Ks.copy(n.boundingSphere), Ks.applyMatrix4(i), Ks.radius += r, e.ray.intersectsSphere(Ks) === !1) return;
    Xo.copy(i).invert(), da.copy(e.ray).applyMatrix4(Xo);
    const o = r / ((this.scale.x + this.scale.y + this.scale.z) / 3), c = o * o, l = n.index, h = n.attributes.position;
    if (l !== null) {
      const d = Math.max(0, a.start), f = Math.min(l.count, a.start + a.count);
      for (let g = d, _ = f; g < _; g++) {
        const p = l.getX(g);
        Zs.fromBufferAttribute(h, p), qo(Zs, p, c, i, e, t, this);
      }
    } else {
      const d = Math.max(0, a.start), f = Math.min(h.count, a.start + a.count);
      for (let g = d, _ = f; g < _; g++)
        Zs.fromBufferAttribute(h, g), qo(Zs, g, c, i, e, t, this);
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
function qo(s, e, t, n, i, r, a) {
  const o = da.distanceSqToPoint(s);
  if (o < t) {
    const c = new N();
    da.closestPointToPoint(s, c), c.applyMatrix4(n);
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
class Bp extends Nt {
  constructor(e, t, n, i, r, a, o, c, l) {
    super(e, t, n, i, r, a, o, c, l), this.isCanvasTexture = !0, this.needsUpdate = !0;
  }
}
class ba extends It {
  constructor(e = 1, t = 32, n = 0, i = Math.PI * 2) {
    super(), this.type = "CircleGeometry", this.parameters = {
      radius: e,
      segments: t,
      thetaStart: n,
      thetaLength: i
    }, t = Math.max(3, t);
    const r = [], a = [], o = [], c = [], l = new N(), u = new je();
    a.push(0, 0, 0), o.push(0, 0, 1), c.push(0.5, 0.5);
    for (let h = 0, d = 3; h <= t; h++, d += 3) {
      const f = n + h / t * i;
      l.x = e * Math.cos(f), l.y = e * Math.sin(f), a.push(l.x, l.y, l.z), o.push(0, 0, 1), u.x = (a[d] / e + 1) / 2, u.y = (a[d + 1] / e + 1) / 2, c.push(u.x, u.y);
    }
    for (let h = 1; h <= t; h++)
      r.push(h, h + 1, 0);
    this.setIndex(r), this.setAttribute("position", new pt(a, 3)), this.setAttribute("normal", new pt(o, 3)), this.setAttribute("uv", new pt(c, 2));
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new ba(e.radius, e.segments, e.thetaStart, e.thetaLength);
  }
}
class Gi extends It {
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
    const _ = [], p = n / 2;
    let m = 0;
    T(), a === !1 && (e > 0 && S(!0), t > 0 && S(!1)), this.setIndex(u), this.setAttribute("position", new pt(h, 3)), this.setAttribute("normal", new pt(d, 3)), this.setAttribute("uv", new pt(f, 2));
    function T() {
      const A = new N(), F = new N();
      let C = 0;
      const I = (t - e) / n;
      for (let z = 0; z <= r; z++) {
        const Q = [], v = z / r, E = v * (t - e) + e;
        for (let W = 0; W <= i; W++) {
          const X = W / i, K = X * c + o, te = Math.sin(K), j = Math.cos(K);
          F.x = E * te, F.y = -v * n + p, F.z = E * j, h.push(F.x, F.y, F.z), A.set(te, I, j).normalize(), d.push(A.x, A.y, A.z), f.push(X, 1 - v), Q.push(g++);
        }
        _.push(Q);
      }
      for (let z = 0; z < i; z++)
        for (let Q = 0; Q < r; Q++) {
          const v = _[Q][z], E = _[Q + 1][z], W = _[Q + 1][z + 1], X = _[Q][z + 1];
          e > 0 && (u.push(v, E, X), C += 3), t > 0 && (u.push(E, W, X), C += 3);
        }
      l.addGroup(m, C, 0), m += C;
    }
    function S(A) {
      const F = g, C = new je(), I = new N();
      let z = 0;
      const Q = A === !0 ? e : t, v = A === !0 ? 1 : -1;
      for (let W = 1; W <= i; W++)
        h.push(0, p * v, 0), d.push(0, v, 0), f.push(0.5, 0.5), g++;
      const E = g;
      for (let W = 0; W <= i; W++) {
        const K = W / i * c + o, te = Math.cos(K), j = Math.sin(K);
        I.x = Q * j, I.y = p * v, I.z = Q * te, h.push(I.x, I.y, I.z), d.push(0, v, 0), C.x = te * 0.5 + 0.5, C.y = j * 0.5 * v + 0.5, f.push(C.x, C.y), g++;
      }
      for (let W = 0; W < i; W++) {
        const X = F + W, K = E + W;
        A === !0 ? u.push(K, K + 1, X) : u.push(K + 1, K, X), z += 3;
      }
      l.addGroup(m, z, A === !0 ? 1 : 2), m += z;
    }
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new Gi(e.radiusTop, e.radiusBottom, e.height, e.radialSegments, e.heightSegments, e.openEnded, e.thetaStart, e.thetaLength);
  }
}
const $s = /* @__PURE__ */ new N(), Js = /* @__PURE__ */ new N(), ta = /* @__PURE__ */ new N(), Qs = /* @__PURE__ */ new fn();
class Op extends It {
  constructor(e = null, t = 1) {
    if (super(), this.type = "EdgesGeometry", this.parameters = {
      geometry: e,
      thresholdAngle: t
    }, e !== null) {
      const i = Math.pow(10, 4), r = Math.cos(ki * t), a = e.getIndex(), o = e.getAttribute("position"), c = a ? a.count : o.count, l = [0, 0, 0], u = ["a", "b", "c"], h = new Array(3), d = {}, f = [];
      for (let g = 0; g < c; g += 3) {
        a ? (l[0] = a.getX(g), l[1] = a.getX(g + 1), l[2] = a.getX(g + 2)) : (l[0] = g, l[1] = g + 1, l[2] = g + 2);
        const { a: _, b: p, c: m } = Qs;
        if (_.fromBufferAttribute(o, l[0]), p.fromBufferAttribute(o, l[1]), m.fromBufferAttribute(o, l[2]), Qs.getNormal(ta), h[0] = `${Math.round(_.x * i)},${Math.round(_.y * i)},${Math.round(_.z * i)}`, h[1] = `${Math.round(p.x * i)},${Math.round(p.y * i)},${Math.round(p.z * i)}`, h[2] = `${Math.round(m.x * i)},${Math.round(m.y * i)},${Math.round(m.z * i)}`, !(h[0] === h[1] || h[1] === h[2] || h[2] === h[0]))
          for (let T = 0; T < 3; T++) {
            const S = (T + 1) % 3, A = h[T], F = h[S], C = Qs[u[T]], I = Qs[u[S]], z = `${A}_${F}`, Q = `${F}_${A}`;
            Q in d && d[Q] ? (ta.dot(d[Q].normal) <= r && (f.push(C.x, C.y, C.z), f.push(I.x, I.y, I.z)), d[Q] = null) : z in d || (d[z] = {
              index0: l[T],
              index1: l[S],
              normal: ta.clone()
            });
          }
      }
      for (const g in d)
        if (d[g]) {
          const { index0: _, index1: p } = d[g];
          $s.fromBufferAttribute(o, _), Js.fromBufferAttribute(o, p), f.push($s.x, $s.y, $s.z), f.push(Js.x, Js.y, Js.z);
        }
      this.setAttribute("position", new pt(f, 3));
    }
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
}
class pi extends It {
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
    const d = (t - e) / i, f = new N(), g = new je();
    for (let _ = 0; _ <= i; _++) {
      for (let p = 0; p <= n; p++) {
        const m = r + p / n * a;
        f.x = h * Math.cos(m), f.y = h * Math.sin(m), c.push(f.x, f.y, f.z), l.push(0, 0, 1), g.x = (f.x / t + 1) / 2, g.y = (f.y / t + 1) / 2, u.push(g.x, g.y);
      }
      h += d;
    }
    for (let _ = 0; _ < i; _++) {
      const p = _ * (n + 1);
      for (let m = 0; m < n; m++) {
        const T = m + p, S = T, A = T + n + 1, F = T + n + 2, C = T + 1;
        o.push(S, A, C), o.push(A, F, C);
      }
    }
    this.setIndex(o), this.setAttribute("position", new pt(c, 3)), this.setAttribute("normal", new pt(l, 3)), this.setAttribute("uv", new pt(u, 2));
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new pi(e.innerRadius, e.outerRadius, e.thetaSegments, e.phiSegments, e.thetaStart, e.thetaLength);
  }
}
class gi extends It {
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
    const u = [], h = new N(), d = new N(), f = [], g = [], _ = [], p = [];
    for (let m = 0; m <= n; m++) {
      const T = [], S = m / n;
      let A = 0;
      m === 0 && a === 0 ? A = 0.5 / t : m === n && c === Math.PI && (A = -0.5 / t);
      for (let F = 0; F <= t; F++) {
        const C = F / t;
        h.x = -e * Math.cos(i + C * r) * Math.sin(a + S * o), h.y = e * Math.cos(a + S * o), h.z = e * Math.sin(i + C * r) * Math.sin(a + S * o), g.push(h.x, h.y, h.z), d.copy(h).normalize(), _.push(d.x, d.y, d.z), p.push(C + A, 1 - S), T.push(l++);
      }
      u.push(T);
    }
    for (let m = 0; m < n; m++)
      for (let T = 0; T < t; T++) {
        const S = u[m][T + 1], A = u[m][T], F = u[m + 1][T], C = u[m + 1][T + 1];
        (m !== 0 || a > 0) && f.push(S, A, C), (m !== n - 1 || c < Math.PI) && f.push(A, F, C);
      }
    this.setIndex(f), this.setAttribute("position", new pt(g, 3)), this.setAttribute("normal", new pt(_, 3)), this.setAttribute("uv", new pt(p, 2));
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new gi(e.radius, e.widthSegments, e.heightSegments, e.phiStart, e.phiLength, e.thetaStart, e.thetaLength);
  }
}
class Lt extends on {
  constructor(e) {
    super(), this.isMeshStandardMaterial = !0, this.defines = { STANDARD: "" }, this.type = "MeshStandardMaterial", this.color = new Pe(16777215), this.roughness = 1, this.metalness = 0, this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new Pe(0), this.emissiveIntensity = 1, this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = 0, this.normalScale = new je(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.roughnessMap = null, this.metalnessMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new Sn(), this.envMapIntensity = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.flatShading = !1, this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.defines = { STANDARD: "" }, this.color.copy(e.color), this.roughness = e.roughness, this.metalness = e.metalness, this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.emissive.copy(e.emissive), this.emissiveMap = e.emissiveMap, this.emissiveIntensity = e.emissiveIntensity, this.bumpMap = e.bumpMap, this.bumpScale = e.bumpScale, this.normalMap = e.normalMap, this.normalMapType = e.normalMapType, this.normalScale.copy(e.normalScale), this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.roughnessMap = e.roughnessMap, this.metalnessMap = e.metalnessMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapRotation.copy(e.envMapRotation), this.envMapIntensity = e.envMapIntensity, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.flatShading = e.flatShading, this.fog = e.fog, this;
  }
}
class Cn extends Lt {
  constructor(e) {
    super(), this.isMeshPhysicalMaterial = !0, this.defines = {
      STANDARD: "",
      PHYSICAL: ""
    }, this.type = "MeshPhysicalMaterial", this.anisotropyRotation = 0, this.anisotropyMap = null, this.clearcoatMap = null, this.clearcoatRoughness = 0, this.clearcoatRoughnessMap = null, this.clearcoatNormalScale = new je(1, 1), this.clearcoatNormalMap = null, this.ior = 1.5, Object.defineProperty(this, "reflectivity", {
      get: function() {
        return qt(2.5 * (this.ior - 1) / (this.ior + 1), 0, 1);
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
class bc extends on {
  constructor(e) {
    super(), this.isMeshPhongMaterial = !0, this.type = "MeshPhongMaterial", this.color = new Pe(16777215), this.specular = new Pe(1118481), this.shininess = 30, this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new Pe(0), this.emissiveIntensity = 1, this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = 0, this.normalScale = new je(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new Sn(), this.combine = 0, this.reflectivity = 1, this.refractionRatio = 0.98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.flatShading = !1, this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.specular.copy(e.specular), this.shininess = e.shininess, this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.emissive.copy(e.emissive), this.emissiveMap = e.emissiveMap, this.emissiveIntensity = e.emissiveIntensity, this.bumpMap = e.bumpMap, this.bumpScale = e.bumpScale, this.normalMap = e.normalMap, this.normalMapType = e.normalMapType, this.normalScale.copy(e.normalScale), this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.specularMap = e.specularMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapRotation.copy(e.envMapRotation), this.combine = e.combine, this.reflectivity = e.reflectivity, this.refractionRatio = e.refractionRatio, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.flatShading = e.flatShading, this.fog = e.fog, this;
  }
}
function er(s, e, t) {
  return !s || // let 'undefined' and 'null' pass
  !t && s.constructor === e ? s : typeof e.BYTES_PER_ELEMENT == "number" ? new e(s) : Array.prototype.slice.call(s);
}
function kp(s) {
  return ArrayBuffer.isView(s) && !(s instanceof DataView);
}
function zp(s) {
  function e(i, r) {
    return s[i] - s[r];
  }
  const t = s.length, n = new Array(t);
  for (let i = 0; i !== t; ++i) n[i] = i;
  return n.sort(e), n;
}
function jo(s, e, t) {
  const n = s.length, i = new s.constructor(n);
  for (let r = 0, a = 0; a !== n; ++r) {
    const o = t[r] * e;
    for (let c = 0; c !== e; ++c)
      i[a++] = s[o + c];
  }
  return i;
}
function wc(s, e, t, n) {
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
class vs {
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
class Gp extends vs {
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
    const r = this.resultBuffer, a = this.sampleValues, o = this.valueSize, c = e * o, l = c - o, u = this._offsetPrev, h = this._offsetNext, d = this._weightPrev, f = this._weightNext, g = (n - t) / (i - t), _ = g * g, p = _ * g, m = -d * p + 2 * d * _ - d * g, T = (1 + d) * p + (-1.5 - 2 * d) * _ + (-0.5 + d) * g + 1, S = (-1 - f) * p + (1.5 + f) * _ + 0.5 * g, A = f * p - f * _;
    for (let F = 0; F !== o; ++F)
      r[F] = m * a[u + F] + T * a[l + F] + S * a[c + F] + A * a[h + F];
    return r;
  }
}
class Rc extends vs {
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
class Hp extends vs {
  constructor(e, t, n, i) {
    super(e, t, n, i);
  }
  interpolate_(e) {
    return this.copySampleValue_(e - 1);
  }
}
class In {
  constructor(e, t, n, i) {
    if (e === void 0) throw new Error("THREE.KeyframeTrack: track name is undefined");
    if (t === void 0 || t.length === 0) throw new Error("THREE.KeyframeTrack: no keyframes in track named " + e);
    this.name = e, this.times = er(t, this.TimeBufferType), this.values = er(n, this.ValueBufferType), this.setInterpolation(i || this.DefaultInterpolation);
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
        times: er(e.times, Array),
        values: er(e.values, Array)
      };
      const i = e.getInterpolation();
      i !== e.DefaultInterpolation && (n.interpolation = i);
    }
    return n.type = e.ValueTypeName, n;
  }
  InterpolantFactoryMethodDiscrete(e) {
    return new Hp(this.times, this.values, this.getValueSize(), e);
  }
  InterpolantFactoryMethodLinear(e) {
    return new Rc(this.times, this.values, this.getValueSize(), e);
  }
  InterpolantFactoryMethodSmooth(e) {
    return new Gp(this.times, this.values, this.getValueSize(), e);
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
    if (i !== void 0 && kp(i))
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
            const _ = t[h + g];
            if (_ !== t[d + g] || _ !== t[f + g]) {
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
In.prototype.TimeBufferType = Float32Array;
In.prototype.ValueBufferType = Float32Array;
In.prototype.DefaultInterpolation = 2301;
class $i extends In {
  // No interpolation parameter because only InterpolateDiscrete is valid.
  constructor(e, t, n) {
    super(e, t, n);
  }
}
$i.prototype.ValueTypeName = "bool";
$i.prototype.ValueBufferType = Array;
$i.prototype.DefaultInterpolation = 2300;
$i.prototype.InterpolantFactoryMethodLinear = void 0;
$i.prototype.InterpolantFactoryMethodSmooth = void 0;
class Cc extends In {
}
Cc.prototype.ValueTypeName = "color";
class qi extends In {
}
qi.prototype.ValueTypeName = "number";
class Vp extends vs {
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
class ji extends In {
  InterpolantFactoryMethodLinear(e) {
    return new Vp(this.times, this.values, this.getValueSize(), e);
  }
}
ji.prototype.ValueTypeName = "quaternion";
ji.prototype.InterpolantFactoryMethodSmooth = void 0;
class Ji extends In {
  // No interpolation parameter because only InterpolateDiscrete is valid.
  constructor(e, t, n) {
    super(e, t, n);
  }
}
Ji.prototype.ValueTypeName = "string";
Ji.prototype.ValueBufferType = Array;
Ji.prototype.DefaultInterpolation = 2300;
Ji.prototype.InterpolantFactoryMethodLinear = void 0;
Ji.prototype.InterpolantFactoryMethodSmooth = void 0;
class Yi extends In {
}
Yi.prototype.ValueTypeName = "vector";
class fa {
  constructor(e = "", t = -1, n = [], i = 2500) {
    this.name = e, this.tracks = n, this.duration = t, this.blendMode = i, this.uuid = Mn(), this.duration < 0 && this.resetDuration();
  }
  static parse(e) {
    const t = [], n = e.tracks, i = 1 / (e.fps || 1);
    for (let a = 0, o = n.length; a !== o; ++a)
      t.push(Xp(n[a]).scale(i));
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
      t.push(In.toJSON(n[r]));
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
      const u = zp(c);
      c = jo(c, 1, u), l = jo(l, 1, u), !i && c[0] === 0 && (c.push(r), l.push(l[0])), a.push(
        new qi(
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
    const n = function(h, d, f, g, _) {
      if (f.length !== 0) {
        const p = [], m = [];
        wc(f, p, m, g), p.length !== 0 && _.push(new h(d, p, m));
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
              for (let _ = 0; _ < d[g].morphTargets.length; _++)
                f[d[g].morphTargets[_]] = -1;
          for (const _ in f) {
            const p = [], m = [];
            for (let T = 0; T !== d[g].morphTargets.length; ++T) {
              const S = d[g];
              p.push(S.time), m.push(S.morphTarget === _ ? 1 : 0);
            }
            i.push(new qi(".morphTargetInfluence[" + _ + "]", p, m));
          }
          c = f.length * a;
        } else {
          const f = ".bones[" + t[h].name + "]";
          n(
            Yi,
            f + ".position",
            d,
            "pos",
            i
          ), n(
            ji,
            f + ".quaternion",
            d,
            "rot",
            i
          ), n(
            Yi,
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
function Wp(s) {
  switch (s.toLowerCase()) {
    case "scalar":
    case "double":
    case "float":
    case "number":
    case "integer":
      return qi;
    case "vector":
    case "vector2":
    case "vector3":
    case "vector4":
      return Yi;
    case "color":
      return Cc;
    case "quaternion":
      return ji;
    case "bool":
    case "boolean":
      return $i;
    case "string":
      return Ji;
  }
  throw new Error("THREE.KeyframeTrack: Unsupported typeName: " + s);
}
function Xp(s) {
  if (s.type === void 0)
    throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");
  const e = Wp(s.type);
  if (s.times === void 0) {
    const t = [], n = [];
    wc(s.keys, t, n, "value"), s.times = t, s.values = n;
  }
  return e.parse !== void 0 ? e.parse(s) : new e(s.name, s.times, s.values, s.interpolation);
}
const Zn = {
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
class qp {
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
const Ic = /* @__PURE__ */ new qp();
class Jn {
  constructor(e) {
    this.manager = e !== void 0 ? e : Ic, this.crossOrigin = "anonymous", this.withCredentials = !1, this.path = "", this.resourcePath = "", this.requestHeader = {};
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
Jn.DEFAULT_MATERIAL_NAME = "__DEFAULT";
const On = {};
class jp extends Error {
  constructor(e, t) {
    super(e), this.response = t;
  }
}
class mr extends Jn {
  constructor(e) {
    super(e);
  }
  load(e, t, n, i) {
    e === void 0 && (e = ""), this.path !== void 0 && (e = this.path + e), e = this.manager.resolveURL(e);
    const r = Zn.get(e);
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
        let _ = 0;
        const p = new ReadableStream({
          start(m) {
            T();
            function T() {
              h.read().then(({ done: S, value: A }) => {
                if (S)
                  m.close();
                else {
                  _ += A.byteLength;
                  const F = new ProgressEvent("progress", { lengthComputable: g, loaded: _, total: f });
                  for (let C = 0, I = u.length; C < I; C++) {
                    const z = u[C];
                    z.onProgress && z.onProgress(F);
                  }
                  m.enqueue(A), T();
                }
              }, (S) => {
                m.error(S);
              });
            }
          }
        });
        return new Response(p);
      } else
        throw new jp(`fetch for "${l.url}" responded with ${l.status}: ${l.statusText}`, l);
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
      Zn.add(e, l);
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
class Yp extends Jn {
  constructor(e) {
    super(e);
  }
  load(e, t, n, i) {
    this.path !== void 0 && (e = this.path + e), e = this.manager.resolveURL(e);
    const r = this, a = Zn.get(e);
    if (a !== void 0)
      return r.manager.itemStart(e), setTimeout(function() {
        t && t(a), r.manager.itemEnd(e);
      }, 0), a;
    const o = _s("img");
    function c() {
      u(), Zn.add(e, this), t && t(this), r.manager.itemEnd(e);
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
class Pc extends Jn {
  constructor(e) {
    super(e);
  }
  load(e, t, n, i) {
    const r = new Nt(), a = new Yp(this.manager);
    return a.setCrossOrigin(this.crossOrigin), a.setPath(this.path), a.load(e, function(o) {
      r.image = o, r.needsUpdate = !0, t !== void 0 && t(r);
    }, n, i), r;
  }
}
class gr extends bt {
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
class Kp extends gr {
  constructor(e, t, n) {
    super(e, n), this.isHemisphereLight = !0, this.type = "HemisphereLight", this.position.copy(bt.DEFAULT_UP), this.updateMatrix(), this.groundColor = new Pe(t);
  }
  copy(e, t) {
    return super.copy(e, t), this.groundColor.copy(e.groundColor), this;
  }
}
const na = /* @__PURE__ */ new Ye(), Yo = /* @__PURE__ */ new N(), Ko = /* @__PURE__ */ new N();
class wa {
  constructor(e) {
    this.camera = e, this.intensity = 1, this.bias = 0, this.normalBias = 0, this.radius = 1, this.blurSamples = 8, this.mapSize = new je(512, 512), this.map = null, this.mapPass = null, this.matrix = new Ye(), this.autoUpdate = !0, this.needsUpdate = !1, this._frustum = new ya(), this._frameExtents = new je(1, 1), this._viewportCount = 1, this._viewports = [
      new ft(0, 0, 1, 1)
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
    Yo.setFromMatrixPosition(e.matrixWorld), t.position.copy(Yo), Ko.setFromMatrixPosition(e.target.matrixWorld), t.lookAt(Ko), t.updateMatrixWorld(), na.multiplyMatrices(t.projectionMatrix, t.matrixWorldInverse), this._frustum.setFromProjectionMatrix(na), n.set(
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
    ), n.multiply(na);
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
class Zp extends wa {
  constructor() {
    super(new tn(50, 1, 0.5, 500)), this.isSpotLightShadow = !0, this.focus = 1;
  }
  updateMatrices(e) {
    const t = this.camera, n = Wi * 2 * e.angle * this.focus, i = this.mapSize.width / this.mapSize.height, r = e.distance || t.far;
    (n !== t.fov || i !== t.aspect || r !== t.far) && (t.fov = n, t.aspect = i, t.far = r, t.updateProjectionMatrix()), super.updateMatrices(e);
  }
  copy(e) {
    return super.copy(e), this.focus = e.focus, this;
  }
}
class $p extends gr {
  constructor(e, t, n = 0, i = Math.PI / 3, r = 0, a = 2) {
    super(e, t), this.isSpotLight = !0, this.type = "SpotLight", this.position.copy(bt.DEFAULT_UP), this.updateMatrix(), this.target = new bt(), this.distance = n, this.angle = i, this.penumbra = r, this.decay = a, this.map = null, this.shadow = new Zp();
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
const Zo = /* @__PURE__ */ new Ye(), ds = /* @__PURE__ */ new N(), ia = /* @__PURE__ */ new N();
class Jp extends wa {
  constructor() {
    super(new tn(90, 1, 0.5, 500)), this.isPointLightShadow = !0, this._frameExtents = new je(4, 2), this._viewportCount = 6, this._viewports = [
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
      new ft(2, 1, 1, 1),
      // negative X
      new ft(0, 1, 1, 1),
      // positive Z
      new ft(3, 1, 1, 1),
      // negative Z
      new ft(1, 1, 1, 1),
      // positive Y
      new ft(3, 0, 1, 1),
      // negative Y
      new ft(1, 0, 1, 1)
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
    r !== n.far && (n.far = r, n.updateProjectionMatrix()), ds.setFromMatrixPosition(e.matrixWorld), n.position.copy(ds), ia.copy(n.position), ia.add(this._cubeDirections[t]), n.up.copy(this._cubeUps[t]), n.lookAt(ia), n.updateMatrixWorld(), i.makeTranslation(-ds.x, -ds.y, -ds.z), Zo.multiplyMatrices(n.projectionMatrix, n.matrixWorldInverse), this._frustum.setFromProjectionMatrix(Zo);
  }
}
class Qp extends gr {
  constructor(e, t, n = 0, i = 2) {
    super(e, t), this.isPointLight = !0, this.type = "PointLight", this.distance = n, this.decay = i, this.shadow = new Jp();
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
class em extends wa {
  constructor() {
    super(new dr(-5, 5, 5, -5, 0.5, 500)), this.isDirectionalLightShadow = !0;
  }
}
class Lc extends gr {
  constructor(e, t) {
    super(e, t), this.isDirectionalLight = !0, this.type = "DirectionalLight", this.position.copy(bt.DEFAULT_UP), this.updateMatrix(), this.target = new bt(), this.shadow = new em();
  }
  dispose() {
    this.shadow.dispose();
  }
  copy(e) {
    return super.copy(e), this.target = e.target.clone(), this.shadow = e.shadow.clone(), this;
  }
}
class Hi {
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
class tm extends Jn {
  constructor(e) {
    super(e), this.isImageBitmapLoader = !0, typeof createImageBitmap > "u" && console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."), typeof fetch > "u" && console.warn("THREE.ImageBitmapLoader: fetch() not supported."), this.options = { premultiplyAlpha: "none" };
  }
  setOptions(e) {
    return this.options = e, this;
  }
  load(e, t, n, i) {
    e === void 0 && (e = ""), this.path !== void 0 && (e = this.path + e), e = this.manager.resolveURL(e);
    const r = this, a = Zn.get(e);
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
      return Zn.add(e, l), t && t(l), r.manager.itemEnd(e), l;
    }).catch(function(l) {
      i && i(l), Zn.remove(e), r.manager.itemError(e), r.manager.itemEnd(e);
    });
    Zn.add(e, c), r.manager.itemStart(e);
  }
}
class nm {
  constructor(e = !0) {
    this.autoStart = e, this.startTime = 0, this.oldTime = 0, this.elapsedTime = 0, this.running = !1;
  }
  start() {
    this.startTime = $o(), this.oldTime = this.startTime, this.elapsedTime = 0, this.running = !0;
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
      const t = $o();
      e = (t - this.oldTime) / 1e3, this.oldTime = t, this.elapsedTime += e;
    }
    return e;
  }
}
function $o() {
  return performance.now();
}
class im {
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
const Ra = "\\[\\]\\.:\\/", sm = new RegExp("[" + Ra + "]", "g"), Ca = "[^" + Ra + "]", rm = "[^" + Ra.replace("\\.", "") + "]", am = /* @__PURE__ */ /((?:WC+[\/:])*)/.source.replace("WC", Ca), om = /* @__PURE__ */ /(WCOD+)?/.source.replace("WCOD", rm), cm = /* @__PURE__ */ /(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC", Ca), lm = /* @__PURE__ */ /\.(WC+)(?:\[(.+)\])?/.source.replace("WC", Ca), hm = new RegExp(
  "^" + am + om + cm + lm + "$"
), um = ["material", "materials", "bones", "map"];
class dm {
  constructor(e, t, n) {
    const i = n || gt.parseTrackName(t);
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
class gt {
  constructor(e, t, n) {
    this.path = t, this.parsedPath = n || gt.parseTrackName(t), this.node = gt.findNode(e, this.parsedPath.nodeName), this.rootNode = e, this.getValue = this._getValue_unbound, this.setValue = this._setValue_unbound;
  }
  static create(e, t, n) {
    return e && e.isAnimationObjectGroup ? new gt.Composite(e, t, n) : new gt(e, t, n);
  }
  /**
   * Replaces spaces with underscores and removes unsupported characters from
   * node names, to ensure compatibility with parseTrackName().
   *
   * @param {string} name Node name to be sanitized.
   * @return {string}
   */
  static sanitizeNodeName(e) {
    return e.replace(/\s/g, "_").replace(sm, "");
  }
  static parseTrackName(e) {
    const t = hm.exec(e);
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
      um.indexOf(r) !== -1 && (n.nodeName = n.nodeName.substring(0, i), n.objectName = r);
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
    if (e || (e = gt.findNode(this.rootNode, t.nodeName), this.node = e), this.getValue = this._getValue_unavailable, this.setValue = this._setValue_unavailable, !e) {
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
gt.Composite = dm;
gt.prototype.BindingType = {
  Direct: 0,
  EntireArray: 1,
  ArrayElement: 2,
  HasFromToArray: 3
};
gt.prototype.Versioning = {
  None: 0,
  NeedsUpdate: 1,
  MatrixWorldNeedsUpdate: 2
};
gt.prototype.GetterByBindingType = [
  gt.prototype._getValue_direct,
  gt.prototype._getValue_array,
  gt.prototype._getValue_arrayElement,
  gt.prototype._getValue_toArray
];
gt.prototype.SetterByBindingTypeAndVersioning = [
  [
    // Direct
    gt.prototype._setValue_direct,
    gt.prototype._setValue_direct_setNeedsUpdate,
    gt.prototype._setValue_direct_setMatrixWorldNeedsUpdate
  ],
  [
    // EntireArray
    gt.prototype._setValue_array,
    gt.prototype._setValue_array_setNeedsUpdate,
    gt.prototype._setValue_array_setMatrixWorldNeedsUpdate
  ],
  [
    // ArrayElement
    gt.prototype._setValue_arrayElement,
    gt.prototype._setValue_arrayElement_setNeedsUpdate,
    gt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate
  ],
  [
    // HasToFromArray
    gt.prototype._setValue_fromArray,
    gt.prototype._setValue_fromArray_setNeedsUpdate,
    gt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate
  ]
];
class fm {
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
const pm = new Float32Array(1);
class mm extends xi {
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
        const _ = t && t._propertyBindings[h].binding.parsedPath;
        g = new im(
          gt.create(n, f, _),
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
    return n === void 0 && (n = new Rc(
      new Float32Array(2),
      new Float32Array(2),
      1,
      pm
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
    let a = typeof e == "string" ? fa.findByName(i, e) : e;
    const o = a !== null ? a.uuid : e, c = this._actionsByClip[o];
    let l = null;
    if (n === void 0 && (a !== null ? n = a.blendMode : n = 2500), c !== void 0) {
      const h = c.actionByRoot[r];
      if (h !== void 0 && h.blendMode === n)
        return h;
      l = c.knownActions[0], a === null && (a = l._clip);
    }
    if (a === null) return null;
    const u = new fm(this, a, t, n);
    return this._bindAction(u, l), this._addInactiveAction(u, o, r), u;
  }
  // get an existing action
  existingAction(e, t) {
    const n = t || this._root, i = n.uuid, r = typeof e == "string" ? fa.findByName(n, e) : e, a = r ? r.uuid : e, o = this._actionsByClip[a];
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
const Jo = /* @__PURE__ */ new Ye();
class gm {
  constructor(e, t, n = 0, i = 1 / 0) {
    this.ray = new xs(e, t), this.near = n, this.far = i, this.camera = null, this.layers = new Ma(), this.params = {
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
    return Jo.identity().extractRotation(e.matrixWorld), this.ray.origin.setFromMatrixPosition(e.matrixWorld), this.ray.direction.set(0, 0, -1).applyMatrix4(Jo), this;
  }
  intersectObject(e, t = !0, n = []) {
    return pa(e, this, n, t), n.sort(Qo), n;
  }
  intersectObjects(e, t = !0, n = []) {
    for (let i = 0, r = e.length; i < r; i++)
      pa(e[i], this, n, t);
    return n.sort(Qo), n;
  }
}
function Qo(s, e) {
  return s.distance - e.distance;
}
function pa(s, e, t, n) {
  let i = !0;
  if (s.layers.test(e.layers) && s.raycast(e, t) === !1 && (i = !1), i === !0 && n === !0) {
    const r = s.children;
    for (let a = 0, o = r.length; a < o; a++)
      pa(r[a], e, t, !0);
  }
}
typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register", { detail: {
  revision: _a
} }));
typeof window < "u" && (window.__THREE__ ? console.warn("WARNING: Multiple instances of Three.js being imported.") : window.__THREE__ = _a);
const _m = /^[og]\s*(.+)?/, xm = /^mtllib /, vm = /^usemtl /, Mm = /^usemap /, ec = /\s+/, tc = new N(), sa = new N(), nc = new N(), ic = new N(), un = new N(), tr = new Pe();
function ym() {
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
      tc.fromArray(i, e), sa.fromArray(i, t), nc.fromArray(i, n), un.subVectors(nc, sa), ic.subVectors(tc, sa), un.cross(ic), un.normalize(), r.push(un.x, un.y, un.z), r.push(un.x, un.y, un.z), r.push(un.x, un.y, un.z);
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
class Sm extends Jn {
  constructor(e) {
    super(e), this.materials = null;
  }
  load(e, t, n, i) {
    const r = this, a = new mr(this.manager);
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
    const t = new ym();
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
          const h = l.split(ec);
          switch (h[0]) {
            case "v":
              t.vertices.push(
                parseFloat(h[1]),
                parseFloat(h[2]),
                parseFloat(h[3])
              ), h.length >= 7 ? (tr.setRGB(
                parseFloat(h[4]),
                parseFloat(h[5]),
                parseFloat(h[6]),
                Rt
              ), t.colors.push(tr.r, tr.g, tr.b)) : t.colors.push(void 0, void 0, void 0);
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
          const d = l.slice(1).trim().split(ec), f = [];
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
        } else if (u === "l") {
          const h = l.substring(1).trim().split(" ");
          let d = [];
          const f = [];
          if (l.indexOf("/") === -1)
            d = h;
          else
            for (let g = 0, _ = h.length; g < _; g++) {
              const p = h[g].split("/");
              p[0] !== "" && d.push(p[0]), p[1] !== "" && f.push(p[1]);
            }
          t.addLineGeometry(d, f);
        } else if (u === "p") {
          const d = l.slice(1).trim().split(" ");
          t.addPointGeometry(d);
        } else if ((i = _m.exec(l)) !== null) {
          const h = (" " + i[0].slice(1).trim()).slice(1);
          t.startObject(h);
        } else if (vm.test(l))
          t.object.startMaterial(l.substring(7).trim(), t.materialLibraries);
        else if (xm.test(l))
          t.materialLibraries.push(l.substring(7).trim());
        else if (Mm.test(l))
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
    const r = new Ut();
    if (r.materialLibraries = [].concat(t.materialLibraries), !(t.objects.length === 1 && t.objects[0].geometry.vertices.length === 0) === !0)
      for (let o = 0, c = t.objects.length; o < c; o++) {
        const l = t.objects[o], u = l.geometry, h = l.materials, d = u.type === "Line", f = u.type === "Points";
        let g = !1;
        if (u.vertices.length === 0) continue;
        const _ = new It();
        _.setAttribute("position", new pt(u.vertices, 3)), u.normals.length > 0 && _.setAttribute("normal", new pt(u.normals, 3)), u.colors.length > 0 && (g = !0, _.setAttribute("color", new pt(u.colors, 3))), u.hasUVIndices === !0 && _.setAttribute("uv", new pt(u.uvs, 2));
        const p = [];
        for (let T = 0, S = h.length; T < S; T++) {
          const A = h[T], F = A.name + "_" + A.smooth + "_" + g;
          let C = t.materials[F];
          if (this.materials !== null) {
            if (C = this.materials.create(A.name), d && C && !(C instanceof wn)) {
              const I = new wn();
              on.prototype.copy.call(I, C), I.color.copy(C.color), C = I;
            } else if (f && C && !(C instanceof Oi)) {
              const I = new Oi({ size: 10, sizeAttenuation: !1 });
              on.prototype.copy.call(I, C), I.color.copy(C.color), I.map = C.map, C = I;
            }
          }
          C === void 0 && (d ? C = new wn() : f ? C = new Oi({ size: 1, sizeAttenuation: !1 }) : C = new bc(), C.name = A.name, C.flatShading = !A.smooth, C.vertexColors = g, t.materials[F] = C), p.push(C);
        }
        let m;
        if (p.length > 1) {
          for (let T = 0, S = h.length; T < S; T++) {
            const A = h[T];
            _.addGroup(A.groupStart, A.groupCount, T);
          }
          d ? m = new mi(_, p) : f ? m = new rr(_, p) : m = new Le(_, p);
        } else
          d ? m = new mi(_, p[0]) : f ? m = new rr(_, p[0]) : m = new Le(_, p[0]);
        m.name = l.name, r.add(m);
      }
    else if (t.vertices.length > 0) {
      const o = new Oi({ size: 1, sizeAttenuation: !1 }), c = new It();
      c.setAttribute("position", new pt(t.vertices, 3)), t.colors.length > 0 && t.colors[0] !== void 0 && (c.setAttribute("color", new pt(t.colors, 3)), o.vertexColors = !0);
      const l = new rr(c, o);
      r.add(l);
    }
    return r;
  }
}
class Em extends Jn {
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
    const r = this, a = this.path === "" ? Hi.extractUrlBase(e) : this.path, o = new mr(this.manager);
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
    const o = new Tm(this.resourcePath || t, this.materialOptions);
    return o.setCrossOrigin(this.crossOrigin), o.setManager(this.manager), o.setMaterials(a), o;
  }
}
class Tm {
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
      u.repeat.copy(l.scale), u.offset.copy(l.offset), u.wrapS = t.wrap, u.wrapT = t.wrap, (o === "map" || o === "emissiveMap") && (u.colorSpace = Rt), i[o] = u;
    }
    for (const o in n) {
      const c = n[o];
      let l;
      if (c !== "")
        switch (o.toLowerCase()) {
          case "kd":
            i.color = at.toWorkingColorSpace(new Pe().fromArray(c), Rt);
            break;
          case "ks":
            i.specular = at.toWorkingColorSpace(new Pe().fromArray(c), Rt);
            break;
          case "ke":
            i.emissive = at.toWorkingColorSpace(new Pe().fromArray(c), Rt);
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
    return this.materials[e] = new bc(i), this.materials[e];
  }
  getTextureParams(e, t) {
    const n = {
      scale: new je(1, 1),
      offset: new je(0, 0)
    }, i = e.split(/\s+/);
    let r;
    return r = i.indexOf("-bm"), r >= 0 && (t.bumpScale = parseFloat(i[r + 1]), i.splice(r, 2)), r = i.indexOf("-s"), r >= 0 && (n.scale.set(parseFloat(i[r + 1]), parseFloat(i[r + 2])), i.splice(r, 4)), r = i.indexOf("-o"), r >= 0 && (n.offset.set(parseFloat(i[r + 1]), parseFloat(i[r + 2])), i.splice(r, 4)), n.url = i.join(" ").trim(), n;
  }
  loadTexture(e, t, n, i, r) {
    const a = this.manager !== void 0 ? this.manager : Ic;
    let o = a.getHandler(e);
    o === null && (o = new Pc(a)), o.setCrossOrigin && o.setCrossOrigin(this.crossOrigin);
    const c = o.load(e, n, i, r);
    return t !== void 0 && (c.mapping = t), c;
  }
}
function sc(s, e) {
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
class Am extends Jn {
  constructor(e) {
    super(e), this.dracoLoader = null, this.ktx2Loader = null, this.meshoptDecoder = null, this.pluginCallbacks = [], this.register(function(t) {
      return new Im(t);
    }), this.register(function(t) {
      return new Pm(t);
    }), this.register(function(t) {
      return new zm(t);
    }), this.register(function(t) {
      return new Gm(t);
    }), this.register(function(t) {
      return new Hm(t);
    }), this.register(function(t) {
      return new Dm(t);
    }), this.register(function(t) {
      return new Um(t);
    }), this.register(function(t) {
      return new Nm(t);
    }), this.register(function(t) {
      return new Fm(t);
    }), this.register(function(t) {
      return new Cm(t);
    }), this.register(function(t) {
      return new Bm(t);
    }), this.register(function(t) {
      return new Lm(t);
    }), this.register(function(t) {
      return new km(t);
    }), this.register(function(t) {
      return new Om(t);
    }), this.register(function(t) {
      return new wm(t);
    }), this.register(function(t) {
      return new Vm(t);
    }), this.register(function(t) {
      return new Wm(t);
    });
  }
  load(e, t, n, i) {
    const r = this;
    let a;
    if (this.resourcePath !== "")
      a = this.resourcePath;
    else if (this.path !== "") {
      const l = Hi.extractUrlBase(e);
      a = Hi.resolveURL(l, this.path);
    } else
      a = Hi.extractUrlBase(e);
    this.manager.itemStart(e);
    const o = function(l) {
      i ? i(l) : console.error(l), r.manager.itemError(e), r.manager.itemEnd(e);
    }, c = new mr(this.manager);
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
      if (c.decode(new Uint8Array(e, 0, 4)) === Dc) {
        try {
          a[et.KHR_BINARY_GLTF] = new Xm(e);
        } catch (h) {
          i && i(h);
          return;
        }
        r = JSON.parse(a[et.KHR_BINARY_GLTF].content);
      } else
        r = JSON.parse(c.decode(e));
    else
      r = e;
    if (r.asset === void 0 || r.asset.version[0] < 2) {
      i && i(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));
      return;
    }
    const l = new sg(r, {
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
          case et.KHR_MATERIALS_UNLIT:
            a[h] = new Rm();
            break;
          case et.KHR_DRACO_MESH_COMPRESSION:
            a[h] = new qm(r, this.dracoLoader);
            break;
          case et.KHR_TEXTURE_TRANSFORM:
            a[h] = new jm();
            break;
          case et.KHR_MESH_QUANTIZATION:
            a[h] = new Ym();
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
function bm() {
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
const et = {
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
class wm {
  constructor(e) {
    this.parser = e, this.name = et.KHR_LIGHTS_PUNCTUAL, this.cache = { refs: {}, uses: {} };
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
    const u = new Pe(16777215);
    c.color !== void 0 && u.setRGB(c.color[0], c.color[1], c.color[2], Gt);
    const h = c.range !== void 0 ? c.range : 0;
    switch (c.type) {
      case "directional":
        l = new Lc(u), l.target.position.set(0, 0, -1), l.add(l.target);
        break;
      case "point":
        l = new Qp(u), l.distance = h;
        break;
      case "spot":
        l = new $p(u), l.distance = h, c.spot = c.spot || {}, c.spot.innerConeAngle = c.spot.innerConeAngle !== void 0 ? c.spot.innerConeAngle : 0, c.spot.outerConeAngle = c.spot.outerConeAngle !== void 0 ? c.spot.outerConeAngle : Math.PI / 4, l.angle = c.spot.outerConeAngle, l.penumbra = 1 - c.spot.innerConeAngle / c.spot.outerConeAngle, l.target.position.set(0, 0, -1), l.add(l.target);
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
class Rm {
  constructor() {
    this.name = et.KHR_MATERIALS_UNLIT;
  }
  getMaterialType() {
    return At;
  }
  extendParams(e, t, n) {
    const i = [];
    e.color = new Pe(1, 1, 1), e.opacity = 1;
    const r = t.pbrMetallicRoughness;
    if (r) {
      if (Array.isArray(r.baseColorFactor)) {
        const a = r.baseColorFactor;
        e.color.setRGB(a[0], a[1], a[2], Gt), e.opacity = a[3];
      }
      r.baseColorTexture !== void 0 && i.push(n.assignTexture(e, "map", r.baseColorTexture, Rt));
    }
    return Promise.all(i);
  }
}
class Cm {
  constructor(e) {
    this.parser = e, this.name = et.KHR_MATERIALS_EMISSIVE_STRENGTH;
  }
  extendMaterialParams(e, t) {
    const i = this.parser.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = i.extensions[this.name].emissiveStrength;
    return r !== void 0 && (t.emissiveIntensity = r), Promise.resolve();
  }
}
class Im {
  constructor(e) {
    this.parser = e, this.name = et.KHR_MATERIALS_CLEARCOAT;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : Cn;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, i = n.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = [], a = i.extensions[this.name];
    if (a.clearcoatFactor !== void 0 && (t.clearcoat = a.clearcoatFactor), a.clearcoatTexture !== void 0 && r.push(n.assignTexture(t, "clearcoatMap", a.clearcoatTexture)), a.clearcoatRoughnessFactor !== void 0 && (t.clearcoatRoughness = a.clearcoatRoughnessFactor), a.clearcoatRoughnessTexture !== void 0 && r.push(n.assignTexture(t, "clearcoatRoughnessMap", a.clearcoatRoughnessTexture)), a.clearcoatNormalTexture !== void 0 && (r.push(n.assignTexture(t, "clearcoatNormalMap", a.clearcoatNormalTexture)), a.clearcoatNormalTexture.scale !== void 0)) {
      const o = a.clearcoatNormalTexture.scale;
      t.clearcoatNormalScale = new je(o, o);
    }
    return Promise.all(r);
  }
}
class Pm {
  constructor(e) {
    this.parser = e, this.name = et.KHR_MATERIALS_DISPERSION;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : Cn;
  }
  extendMaterialParams(e, t) {
    const i = this.parser.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = i.extensions[this.name];
    return t.dispersion = r.dispersion !== void 0 ? r.dispersion : 0, Promise.resolve();
  }
}
class Lm {
  constructor(e) {
    this.parser = e, this.name = et.KHR_MATERIALS_IRIDESCENCE;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : Cn;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, i = n.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = [], a = i.extensions[this.name];
    return a.iridescenceFactor !== void 0 && (t.iridescence = a.iridescenceFactor), a.iridescenceTexture !== void 0 && r.push(n.assignTexture(t, "iridescenceMap", a.iridescenceTexture)), a.iridescenceIor !== void 0 && (t.iridescenceIOR = a.iridescenceIor), t.iridescenceThicknessRange === void 0 && (t.iridescenceThicknessRange = [100, 400]), a.iridescenceThicknessMinimum !== void 0 && (t.iridescenceThicknessRange[0] = a.iridescenceThicknessMinimum), a.iridescenceThicknessMaximum !== void 0 && (t.iridescenceThicknessRange[1] = a.iridescenceThicknessMaximum), a.iridescenceThicknessTexture !== void 0 && r.push(n.assignTexture(t, "iridescenceThicknessMap", a.iridescenceThicknessTexture)), Promise.all(r);
  }
}
class Dm {
  constructor(e) {
    this.parser = e, this.name = et.KHR_MATERIALS_SHEEN;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : Cn;
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
      t.sheenColor.setRGB(o[0], o[1], o[2], Gt);
    }
    return a.sheenRoughnessFactor !== void 0 && (t.sheenRoughness = a.sheenRoughnessFactor), a.sheenColorTexture !== void 0 && r.push(n.assignTexture(t, "sheenColorMap", a.sheenColorTexture, Rt)), a.sheenRoughnessTexture !== void 0 && r.push(n.assignTexture(t, "sheenRoughnessMap", a.sheenRoughnessTexture)), Promise.all(r);
  }
}
class Um {
  constructor(e) {
    this.parser = e, this.name = et.KHR_MATERIALS_TRANSMISSION;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : Cn;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, i = n.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = [], a = i.extensions[this.name];
    return a.transmissionFactor !== void 0 && (t.transmission = a.transmissionFactor), a.transmissionTexture !== void 0 && r.push(n.assignTexture(t, "transmissionMap", a.transmissionTexture)), Promise.all(r);
  }
}
class Nm {
  constructor(e) {
    this.parser = e, this.name = et.KHR_MATERIALS_VOLUME;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : Cn;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, i = n.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = [], a = i.extensions[this.name];
    t.thickness = a.thicknessFactor !== void 0 ? a.thicknessFactor : 0, a.thicknessTexture !== void 0 && r.push(n.assignTexture(t, "thicknessMap", a.thicknessTexture)), t.attenuationDistance = a.attenuationDistance || 1 / 0;
    const o = a.attenuationColor || [1, 1, 1];
    return t.attenuationColor = new Pe().setRGB(o[0], o[1], o[2], Gt), Promise.all(r);
  }
}
class Fm {
  constructor(e) {
    this.parser = e, this.name = et.KHR_MATERIALS_IOR;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : Cn;
  }
  extendMaterialParams(e, t) {
    const i = this.parser.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = i.extensions[this.name];
    return t.ior = r.ior !== void 0 ? r.ior : 1.5, Promise.resolve();
  }
}
class Bm {
  constructor(e) {
    this.parser = e, this.name = et.KHR_MATERIALS_SPECULAR;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : Cn;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, i = n.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = [], a = i.extensions[this.name];
    t.specularIntensity = a.specularFactor !== void 0 ? a.specularFactor : 1, a.specularTexture !== void 0 && r.push(n.assignTexture(t, "specularIntensityMap", a.specularTexture));
    const o = a.specularColorFactor || [1, 1, 1];
    return t.specularColor = new Pe().setRGB(o[0], o[1], o[2], Gt), a.specularColorTexture !== void 0 && r.push(n.assignTexture(t, "specularColorMap", a.specularColorTexture, Rt)), Promise.all(r);
  }
}
class Om {
  constructor(e) {
    this.parser = e, this.name = et.EXT_MATERIALS_BUMP;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : Cn;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, i = n.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = [], a = i.extensions[this.name];
    return t.bumpScale = a.bumpFactor !== void 0 ? a.bumpFactor : 1, a.bumpTexture !== void 0 && r.push(n.assignTexture(t, "bumpMap", a.bumpTexture)), Promise.all(r);
  }
}
class km {
  constructor(e) {
    this.parser = e, this.name = et.KHR_MATERIALS_ANISOTROPY;
  }
  getMaterialType(e) {
    const n = this.parser.json.materials[e];
    return !n.extensions || !n.extensions[this.name] ? null : Cn;
  }
  extendMaterialParams(e, t) {
    const n = this.parser, i = n.json.materials[e];
    if (!i.extensions || !i.extensions[this.name])
      return Promise.resolve();
    const r = [], a = i.extensions[this.name];
    return a.anisotropyStrength !== void 0 && (t.anisotropy = a.anisotropyStrength), a.anisotropyRotation !== void 0 && (t.anisotropyRotation = a.anisotropyRotation), a.anisotropyTexture !== void 0 && r.push(n.assignTexture(t, "anisotropyMap", a.anisotropyTexture)), Promise.all(r);
  }
}
class zm {
  constructor(e) {
    this.parser = e, this.name = et.KHR_TEXTURE_BASISU;
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
class Gm {
  constructor(e) {
    this.parser = e, this.name = et.EXT_TEXTURE_WEBP, this.isSupported = null;
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
class Hm {
  constructor(e) {
    this.parser = e, this.name = et.EXT_TEXTURE_AVIF, this.isSupported = null;
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
class Vm {
  constructor(e) {
    this.name = et.EXT_MESHOPT_COMPRESSION, this.parser = e;
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
class Wm {
  constructor(e) {
    this.name = et.EXT_MESH_GPU_INSTANCING, this.parser = e;
  }
  createNodeMesh(e) {
    const t = this.parser.json, n = t.nodes[e];
    if (!n.extensions || !n.extensions[this.name] || n.mesh === void 0)
      return null;
    const i = t.meshes[n.mesh];
    for (const l of i.primitives)
      if (l.mode !== dn.TRIANGLES && l.mode !== dn.TRIANGLE_STRIP && l.mode !== dn.TRIANGLE_FAN && l.mode !== void 0)
        return null;
    const a = n.extensions[this.name].attributes, o = [], c = {};
    for (const l in a)
      o.push(this.parser.getDependency("accessor", a[l]).then((u) => (c[l] = u, c[l])));
    return o.length < 1 ? null : (o.push(this.parser.createNodeMesh(e)), Promise.all(o).then((l) => {
      const u = l.pop(), h = u.isGroup ? u.children : [u], d = l[0].count, f = [];
      for (const g of h) {
        const _ = new Ye(), p = new N(), m = new yn(), T = new N(1, 1, 1), S = new Np(g.geometry, g.material, d);
        for (let A = 0; A < d; A++)
          c.TRANSLATION && p.fromBufferAttribute(c.TRANSLATION, A), c.ROTATION && m.fromBufferAttribute(c.ROTATION, A), c.SCALE && T.fromBufferAttribute(c.SCALE, A), S.setMatrixAt(A, _.compose(p, m, T));
        for (const A in c)
          if (A === "_COLOR_0") {
            const F = c[A];
            S.instanceColor = new ua(F.array, F.itemSize, F.normalized);
          } else A !== "TRANSLATION" && A !== "ROTATION" && A !== "SCALE" && g.geometry.setAttribute(A, c[A]);
        bt.prototype.copy.call(S, g), this.parser.assignFinalMaterial(S), f.push(S);
      }
      return u.isGroup ? (u.clear(), u.add(...f), u) : f[0];
    }));
  }
}
const Dc = "glTF", fs = 12, rc = { JSON: 1313821514, BIN: 5130562 };
class Xm {
  constructor(e) {
    this.name = et.KHR_BINARY_GLTF, this.content = null, this.body = null;
    const t = new DataView(e, 0, fs), n = new TextDecoder();
    if (this.header = {
      magic: n.decode(new Uint8Array(e.slice(0, 4))),
      version: t.getUint32(4, !0),
      length: t.getUint32(8, !0)
    }, this.header.magic !== Dc)
      throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");
    if (this.header.version < 2)
      throw new Error("THREE.GLTFLoader: Legacy binary file detected.");
    const i = this.header.length - fs, r = new DataView(e, fs);
    let a = 0;
    for (; a < i; ) {
      const o = r.getUint32(a, !0);
      a += 4;
      const c = r.getUint32(a, !0);
      if (a += 4, c === rc.JSON) {
        const l = new Uint8Array(e, fs + a, o);
        this.content = n.decode(l);
      } else if (c === rc.BIN) {
        const l = fs + a;
        this.body = e.slice(l, l + o);
      }
      a += o;
    }
    if (this.content === null)
      throw new Error("THREE.GLTFLoader: JSON content not found.");
  }
}
class qm {
  constructor(e, t) {
    if (!t)
      throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");
    this.name = et.KHR_DRACO_MESH_COMPRESSION, this.json = e, this.dracoLoader = t, this.dracoLoader.preload();
  }
  decodePrimitive(e, t) {
    const n = this.json, i = this.dracoLoader, r = e.extensions[this.name].bufferView, a = e.extensions[this.name].attributes, o = {}, c = {}, l = {};
    for (const u in a) {
      const h = ma[u] || u.toLowerCase();
      o[h] = a[u];
    }
    for (const u in e.attributes) {
      const h = ma[u] || u.toLowerCase();
      if (a[u] !== void 0) {
        const d = n.accessors[e.attributes[u]], f = Vi[d.componentType];
        l[h] = f.name, c[h] = d.normalized === !0;
      }
    }
    return t.getDependency("bufferView", r).then(function(u) {
      return new Promise(function(h, d) {
        i.decodeDracoFile(u, function(f) {
          for (const g in f.attributes) {
            const _ = f.attributes[g], p = c[g];
            p !== void 0 && (_.normalized = p);
          }
          h(f);
        }, o, l, Gt, d);
      });
    });
  }
}
class jm {
  constructor() {
    this.name = et.KHR_TEXTURE_TRANSFORM;
  }
  extendTexture(e, t) {
    return (t.texCoord === void 0 || t.texCoord === e.channel) && t.offset === void 0 && t.rotation === void 0 && t.scale === void 0 || (e = e.clone(), t.texCoord !== void 0 && (e.channel = t.texCoord), t.offset !== void 0 && e.offset.fromArray(t.offset), t.rotation !== void 0 && (e.rotation = t.rotation), t.scale !== void 0 && e.repeat.fromArray(t.scale), e.needsUpdate = !0), e;
  }
}
class Ym {
  constructor() {
    this.name = et.KHR_MESH_QUANTIZATION;
  }
}
class Uc extends vs {
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
    const r = this.resultBuffer, a = this.sampleValues, o = this.valueSize, c = o * 2, l = o * 3, u = i - t, h = (n - t) / u, d = h * h, f = d * h, g = e * l, _ = g - l, p = -2 * f + 3 * d, m = f - d, T = 1 - p, S = m - d + h;
    for (let A = 0; A !== o; A++) {
      const F = a[_ + A + o], C = a[_ + A + c] * u, I = a[g + A + o], z = a[g + A] * u;
      r[A] = T * F + S * C + p * I + m * z;
    }
    return r;
  }
}
const Km = new yn();
class Zm extends Uc {
  interpolate_(e, t, n, i) {
    const r = super.interpolate_(e, t, n, i);
    return Km.fromArray(r).normalize().toArray(r), r;
  }
}
const dn = {
  POINTS: 0,
  LINES: 1,
  LINE_LOOP: 2,
  LINE_STRIP: 3,
  TRIANGLES: 4,
  TRIANGLE_STRIP: 5,
  TRIANGLE_FAN: 6
}, Vi = {
  5120: Int8Array,
  5121: Uint8Array,
  5122: Int16Array,
  5123: Uint16Array,
  5125: Uint32Array,
  5126: Float32Array
}, ac = {
  9728: 1003,
  9729: 1006,
  9984: 1004,
  9985: 1007,
  9986: 1005,
  9987: 1008
}, oc = {
  33071: 1001,
  33648: 1002,
  10497: 1e3
}, ra = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT2: 4,
  MAT3: 9,
  MAT4: 16
}, ma = {
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
}, jn = {
  scale: "scale",
  translation: "position",
  rotation: "quaternion",
  weights: "morphTargetInfluences"
}, $m = {
  CUBICSPLINE: void 0,
  // We use a custom interpolant (GLTFCubicSplineInterpolation) for CUBICSPLINE tracks. Each
  // keyframe track will be initialized with a default interpolation type, then modified.
  LINEAR: 2301,
  STEP: 2300
}, aa = {
  OPAQUE: "OPAQUE",
  MASK: "MASK",
  BLEND: "BLEND"
};
function Jm(s) {
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
function Qm(s, e, t) {
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
function eg(s, e) {
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
function tg(s) {
  let e;
  const t = s.extensions && s.extensions[et.KHR_DRACO_MESH_COMPRESSION];
  if (t ? e = "draco:" + t.bufferView + ":" + t.indices + ":" + oa(t.attributes) : e = s.indices + ":" + oa(s.attributes) + ":" + s.mode, s.targets !== void 0)
    for (let n = 0, i = s.targets.length; n < i; n++)
      e += ":" + oa(s.targets[n]);
  return e;
}
function oa(s) {
  let e = "";
  const t = Object.keys(s).sort();
  for (let n = 0, i = t.length; n < i; n++)
    e += t[n] + ":" + s[t[n]] + ";";
  return e;
}
function ga(s) {
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
function ng(s) {
  return s.search(/\.jpe?g($|\?)/i) > 0 || s.search(/^data\:image\/jpeg/) === 0 ? "image/jpeg" : s.search(/\.webp($|\?)/i) > 0 || s.search(/^data\:image\/webp/) === 0 ? "image/webp" : "image/png";
}
const ig = new Ye();
class sg {
  constructor(e = {}, t = {}) {
    this.json = e, this.extensions = {}, this.plugins = {}, this.options = t, this.cache = new bm(), this.associations = /* @__PURE__ */ new Map(), this.primitiveCache = {}, this.nodeCache = {}, this.meshCache = { refs: {}, uses: {} }, this.cameraCache = { refs: {}, uses: {} }, this.lightCache = { refs: {}, uses: {} }, this.sourceCache = {}, this.textureCache = {}, this.nodeNamesUsed = {};
    let n = !1, i = -1, r = !1, a = -1;
    if (typeof navigator < "u") {
      const o = navigator.userAgent;
      n = /^((?!chrome|android).)*safari/i.test(o) === !0;
      const c = o.match(/Version\/(\d+)/);
      i = n && c ? parseInt(c[1], 10) : -1, r = o.indexOf("Firefox") > -1, a = r ? o.match(/Firefox\/([0-9]+)\./)[1] : -1;
    }
    typeof createImageBitmap > "u" || n && i < 17 || r && a < 98 ? this.textureLoader = new Pc(this.options.manager) : this.textureLoader = new tm(this.options.manager), this.textureLoader.setCrossOrigin(this.options.crossOrigin), this.textureLoader.setRequestHeader(this.options.requestHeader), this.fileLoader = new mr(this.options.manager), this.fileLoader.setResponseType("arraybuffer"), this.options.crossOrigin === "use-credentials" && this.fileLoader.setWithCredentials(!0);
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
      return Promise.resolve(this.extensions[et.KHR_BINARY_GLTF].body);
    const i = this.options;
    return new Promise(function(r, a) {
      n.load(Hi.resolveURL(t.uri, i.path), r, void 0, function() {
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
      const a = ra[i.type], o = Vi[i.componentType], c = i.normalized === !0, l = new o(i.count * a);
      return Promise.resolve(new Jt(l, a, c));
    }
    const r = [];
    return i.bufferView !== void 0 ? r.push(this.getDependency("bufferView", i.bufferView)) : r.push(null), i.sparse !== void 0 && (r.push(this.getDependency("bufferView", i.sparse.indices.bufferView)), r.push(this.getDependency("bufferView", i.sparse.values.bufferView))), Promise.all(r).then(function(a) {
      const o = a[0], c = ra[i.type], l = Vi[i.componentType], u = l.BYTES_PER_ELEMENT, h = u * c, d = i.byteOffset || 0, f = i.bufferView !== void 0 ? n.bufferViews[i.bufferView].byteStride : void 0, g = i.normalized === !0;
      let _, p;
      if (f && f !== h) {
        const m = Math.floor(d / f), T = "InterleavedBuffer:" + i.bufferView + ":" + i.componentType + ":" + m + ":" + i.count;
        let S = t.cache.get(T);
        S || (_ = new l(o, m * f, i.count * f / u), S = new Ip(_, f / u), t.cache.add(T, S)), p = new Ea(S, c, d % f / u, g);
      } else
        o === null ? _ = new l(i.count * c) : _ = new l(o, d, i.count * c), p = new Jt(_, c, g);
      if (i.sparse !== void 0) {
        const m = ra.SCALAR, T = Vi[i.sparse.indices.componentType], S = i.sparse.indices.byteOffset || 0, A = i.sparse.values.byteOffset || 0, F = new T(a[1], S, i.sparse.count * m), C = new l(a[2], A, i.sparse.count * c);
        o !== null && (p = new Jt(p.array.slice(), p.itemSize, p.normalized)), p.normalized = !1;
        for (let I = 0, z = F.length; I < z; I++) {
          const Q = F[I];
          if (p.setX(Q, C[I * c]), c >= 2 && p.setY(Q, C[I * c + 1]), c >= 3 && p.setZ(Q, C[I * c + 2]), c >= 4 && p.setW(Q, C[I * c + 3]), c >= 5) throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.");
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
      return u.magFilter = ac[d.magFilter] || 1006, u.minFilter = ac[d.minFilter] || 1008, u.wrapS = oc[d.wrapS] || 1e3, u.wrapT = oc[d.wrapT] || 1e3, i.associations.set(u, { textures: e }), u;
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
        t.isImageBitmapLoader === !0 && (g = function(_) {
          const p = new Nt(_);
          p.needsUpdate = !0, d(p);
        }), t.load(Hi.resolveURL(h, r.path), g, void 0, f);
      });
    }).then(function(h) {
      return l === !0 && o.revokeObjectURL(c), kn(h, a), h.userData.mimeType = a.mimeType || ng(a.uri), h;
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
      if (n.texCoord !== void 0 && n.texCoord > 0 && (a = a.clone(), a.channel = n.texCoord), r.extensions[et.KHR_TEXTURE_TRANSFORM]) {
        const o = n.extensions !== void 0 ? n.extensions[et.KHR_TEXTURE_TRANSFORM] : void 0;
        if (o) {
          const c = r.associations.get(a);
          a = r.extensions[et.KHR_TEXTURE_TRANSFORM].extendTexture(a, o), r.associations.set(a, c);
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
      c || (c = new Oi(), on.prototype.copy.call(c, n), c.color.copy(n.color), c.map = n.map, c.sizeAttenuation = !1, this.cache.add(o, c)), n = c;
    } else if (e.isLine) {
      const o = "LineBasicMaterial:" + n.uuid;
      let c = this.cache.get(o);
      c || (c = new wn(), on.prototype.copy.call(c, n), c.color.copy(n.color), c.map = n.map, this.cache.add(o, c)), n = c;
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
    if (c[et.KHR_MATERIALS_UNLIT]) {
      const h = i[et.KHR_MATERIALS_UNLIT];
      a = h.getMaterialType(), l.push(h.extendParams(o, r, t));
    } else {
      const h = r.pbrMetallicRoughness || {};
      if (o.color = new Pe(1, 1, 1), o.opacity = 1, Array.isArray(h.baseColorFactor)) {
        const d = h.baseColorFactor;
        o.color.setRGB(d[0], d[1], d[2], Gt), o.opacity = d[3];
      }
      h.baseColorTexture !== void 0 && l.push(t.assignTexture(o, "map", h.baseColorTexture, Rt)), o.metalness = h.metallicFactor !== void 0 ? h.metallicFactor : 1, o.roughness = h.roughnessFactor !== void 0 ? h.roughnessFactor : 1, h.metallicRoughnessTexture !== void 0 && (l.push(t.assignTexture(o, "metalnessMap", h.metallicRoughnessTexture)), l.push(t.assignTexture(o, "roughnessMap", h.metallicRoughnessTexture))), a = this._invokeOne(function(d) {
        return d.getMaterialType && d.getMaterialType(e);
      }), l.push(Promise.all(this._invokeAll(function(d) {
        return d.extendMaterialParams && d.extendMaterialParams(e, o);
      })));
    }
    r.doubleSided === !0 && (o.side = 2);
    const u = r.alphaMode || aa.OPAQUE;
    if (u === aa.BLEND ? (o.transparent = !0, o.depthWrite = !1) : (o.transparent = !1, u === aa.MASK && (o.alphaTest = r.alphaCutoff !== void 0 ? r.alphaCutoff : 0.5)), r.normalTexture !== void 0 && a !== At && (l.push(t.assignTexture(o, "normalMap", r.normalTexture)), o.normalScale = new je(1, 1), r.normalTexture.scale !== void 0)) {
      const h = r.normalTexture.scale;
      o.normalScale.set(h, h);
    }
    if (r.occlusionTexture !== void 0 && a !== At && (l.push(t.assignTexture(o, "aoMap", r.occlusionTexture)), r.occlusionTexture.strength !== void 0 && (o.aoMapIntensity = r.occlusionTexture.strength)), r.emissiveFactor !== void 0 && a !== At) {
      const h = r.emissiveFactor;
      o.emissive = new Pe().setRGB(h[0], h[1], h[2], Gt);
    }
    return r.emissiveTexture !== void 0 && a !== At && l.push(t.assignTexture(o, "emissiveMap", r.emissiveTexture, Rt)), Promise.all(l).then(function() {
      const h = new a(o);
      return r.name && (h.name = r.name), kn(h, r), t.associations.set(h, { materials: e }), r.extensions && ui(i, h, r), h;
    });
  }
  /** When Object3D instances are targeted by animation, they need unique names. */
  createUniqueName(e) {
    const t = gt.sanitizeNodeName(e || "");
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
      return n[et.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(o, t).then(function(c) {
        return cc(c, o, t);
      });
    }
    const a = [];
    for (let o = 0, c = e.length; o < c; o++) {
      const l = e[o], u = tg(l), h = i[u];
      if (h)
        a.push(h.promise);
      else {
        let d;
        l.extensions && l.extensions[et.KHR_DRACO_MESH_COMPRESSION] ? d = r(l) : d = cc(new It(), l, t), i[u] = { primitive: l, promise: d }, a.push(d);
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
      const u = a[c].material === void 0 ? Jm(this.cache) : this.getDependency("material", a[c].material);
      o.push(u);
    }
    return o.push(t.loadGeometries(a)), Promise.all(o).then(function(c) {
      const l = c.slice(0, c.length - 1), u = c[c.length - 1], h = [];
      for (let f = 0, g = u.length; f < g; f++) {
        const _ = u[f], p = a[f];
        let m;
        const T = l[f];
        if (p.mode === dn.TRIANGLES || p.mode === dn.TRIANGLE_STRIP || p.mode === dn.TRIANGLE_FAN || p.mode === void 0)
          m = r.isSkinnedMesh === !0 ? new Lp(_, T) : new Le(_, T), m.isSkinnedMesh === !0 && m.normalizeSkinWeights(), p.mode === dn.TRIANGLE_STRIP ? m.geometry = sc(m.geometry, 1) : p.mode === dn.TRIANGLE_FAN && (m.geometry = sc(m.geometry, 2));
        else if (p.mode === dn.LINES)
          m = new mi(_, T);
        else if (p.mode === dn.LINE_STRIP)
          m = new pr(_, T);
        else if (p.mode === dn.LINE_LOOP)
          m = new Fp(_, T);
        else if (p.mode === dn.POINTS)
          m = new rr(_, T);
        else
          throw new Error("THREE.GLTFLoader: Primitive mode unsupported: " + p.mode);
        Object.keys(m.geometry.morphAttributes).length > 0 && eg(m, r), m.name = t.createUniqueName(r.name || "mesh_" + e), kn(m, r), p.extensions && ui(i, m, p), t.assignFinalMaterial(m), h.push(m);
      }
      for (let f = 0, g = h.length; f < g; f++)
        t.associations.set(h[f], {
          meshes: e,
          primitives: f
        });
      if (h.length === 1)
        return r.extensions && ui(i, h[0], r), h[0];
      const d = new Ut();
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
    return n.type === "perspective" ? t = new tn(fl.radToDeg(i.yfov), i.aspectRatio || 1, i.znear || 1, i.zfar || 2e6) : n.type === "orthographic" && (t = new dr(-i.xmag, i.xmag, i.ymag, -i.ymag, i.znear, i.zfar)), n.name && (t.name = this.createUniqueName(n.name)), kn(t, n), Promise.resolve(t);
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
          const d = new Ye();
          r !== null && d.fromArray(r.array, l * 16), c.push(d);
        } else
          console.warn('THREE.GLTFLoader: Joint "%s" could not be found.', t.joints[l]);
      }
      return new Aa(o, c);
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
      const f = i.channels[h], g = i.samplers[f.sampler], _ = f.target, p = _.node, m = i.parameters !== void 0 ? i.parameters[g.input] : g.input, T = i.parameters !== void 0 ? i.parameters[g.output] : g.output;
      _.node !== void 0 && (a.push(this.getDependency("node", p)), o.push(this.getDependency("accessor", m)), c.push(this.getDependency("accessor", T)), l.push(g), u.push(_));
    }
    return Promise.all([
      Promise.all(a),
      Promise.all(o),
      Promise.all(c),
      Promise.all(l),
      Promise.all(u)
    ]).then(function(h) {
      const d = h[0], f = h[1], g = h[2], _ = h[3], p = h[4], m = [];
      for (let T = 0, S = d.length; T < S; T++) {
        const A = d[T], F = f[T], C = g[T], I = _[T], z = p[T];
        if (A === void 0) continue;
        A.updateMatrix && A.updateMatrix();
        const Q = n._createAnimationTracks(A, F, C, I, z);
        if (Q)
          for (let v = 0; v < Q.length; v++)
            m.push(Q[v]);
      }
      return new fa(r, void 0, m);
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
        f.isSkinnedMesh && f.bind(d, ig);
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
      if (r.isBone === !0 ? u = new Ac() : l.length > 1 ? u = new Ut() : l.length === 1 ? u = l[0] : u = new bt(), u !== l[0])
        for (let h = 0, d = l.length; h < d; h++)
          u.add(l[h]);
      if (r.name && (u.userData.name = r.name, u.name = a), kn(u, r), r.extensions && ui(n, u, r), r.matrix !== void 0) {
        const h = new Ye();
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
    const t = this.extensions, n = this.json.scenes[e], i = this, r = new Ut();
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
          (d instanceof on || d instanceof Nt) && h.set(d, f);
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
    jn[r.path] === jn.weights ? e.traverse(function(d) {
      d.morphTargetInfluences && c.push(d.name ? d.name : d.uuid);
    }) : c.push(o);
    let l;
    switch (jn[r.path]) {
      case jn.weights:
        l = qi;
        break;
      case jn.rotation:
        l = ji;
        break;
      case jn.position:
      case jn.scale:
        l = Yi;
        break;
      default:
        switch (n.itemSize) {
          case 1:
            l = qi;
            break;
          case 2:
          case 3:
          default:
            l = Yi;
            break;
        }
        break;
    }
    const u = i.interpolation !== void 0 ? $m[i.interpolation] : 2301, h = this._getArrayFromAccessor(n);
    for (let d = 0, f = c.length; d < f; d++) {
      const g = new l(
        c[d] + "." + jn[r.path],
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
      const n = ga(t.constructor), i = new Float32Array(t.length);
      for (let r = 0, a = t.length; r < a; r++)
        i[r] = t[r] * n;
      t = i;
    }
    return t;
  }
  _createCubicSplineTrackInterpolant(e) {
    e.createInterpolant = function(n) {
      const i = this instanceof ji ? Zm : Uc;
      return new i(this.times, this.values, this.getValueSize() / 3, n);
    }, e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline = !0;
  }
}
function rg(s, e, t) {
  const n = e.attributes, i = new En();
  if (n.POSITION !== void 0) {
    const o = t.json.accessors[n.POSITION], c = o.min, l = o.max;
    if (c !== void 0 && l !== void 0) {
      if (i.set(
        new N(c[0], c[1], c[2]),
        new N(l[0], l[1], l[2])
      ), o.normalized) {
        const u = ga(Vi[o.componentType]);
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
            const _ = ga(Vi[d.componentType]);
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
  const a = new Rn();
  i.getCenter(a.center), a.radius = i.min.distanceTo(i.max) / 2, s.boundingSphere = a;
}
function cc(s, e, t) {
  const n = e.attributes, i = [];
  function r(a, o) {
    return t.getDependency("accessor", a).then(function(c) {
      s.setAttribute(o, c);
    });
  }
  for (const a in n) {
    const o = ma[a] || a.toLowerCase();
    o in s.attributes || i.push(r(n[a], o));
  }
  if (e.indices !== void 0 && !s.index) {
    const a = t.getDependency("accessor", e.indices).then(function(o) {
      s.setIndex(o);
    });
    i.push(a);
  }
  return at.workingColorSpace !== Gt && "COLOR_0" in n && console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${at.workingColorSpace}" not supported.`), kn(s, e), rg(s, e, t), Promise.all(i).then(function() {
    return e.targets !== void 0 ? Qm(s, e.targets, t) : s;
  });
}
function ag(s) {
  const e = /* @__PURE__ */ new Map(), t = /* @__PURE__ */ new Map(), n = s.clone();
  return Nc(s, n, function(i, r) {
    e.set(r, i), t.set(i, r);
  }), n.traverse(function(i) {
    if (!i.isSkinnedMesh) return;
    const r = i, a = e.get(i), o = a.skeleton.bones;
    r.skeleton = a.skeleton.clone(), r.bindMatrix.copy(a.bindMatrix), r.skeleton.bones = o.map(function(c) {
      return t.get(c);
    }), r.bind(r.skeleton, r.bindMatrix);
  }), n;
}
function Nc(s, e, t) {
  t(s, e);
  for (let n = 0; n < s.children.length; n++)
    Nc(s.children[n], e.children[n], t);
}
const ca = /* @__PURE__ */ new Map();
function Fc(s, e) {
  return ca.has(s) || ca.set(s, e()), ca.get(s);
}
function og(s) {
  const e = new En().setFromObject(s), t = e.getCenter(new N());
  s.position.set(-t.x, -e.min.y, -t.z);
  const n = new Ut();
  return n.add(s), n.userData.size = e.getSize(new N()), n;
}
function Bc(s) {
  return s.traverse((e) => {
    e.isMesh && (e.castShadow = !0, e.receiveShadow = !0);
  }), s;
}
function nr(s, e) {
  return Fc("f:" + e, async () => {
    const t = s + "models/furniture/", n = await new Em().setPath(t).loadAsync(e + ".mtl");
    n.preload(), Object.values(n.materials).forEach((a) => {
      a.shininess = 8, a.specular = new Pe(2236962);
    });
    const i = await new Sm().setMaterials(n).setPath(t).loadAsync(e + ".obj");
    i.rotation.y = Math.PI;
    const r = new Ut();
    return r.add(i), og(Bc(r));
  }).then((t) => {
    const n = t.clone();
    return n.userData.size = t.userData.size, n;
  });
}
function cg(s) {
  return Fc("g:" + s, () => new Am().loadAsync(s));
}
async function la(s, e) {
  const t = await cg(s + "models/characters/" + e + ".glb");
  return { scene: Bc(ag(t.scene)), animations: t.animations };
}
const lg = 4.6;
class Ia {
  static async create(e, t, n = {}) {
    const { scene: i, animations: r } = await la(e, t), a = new Ia(i, r, n);
    if (n.wheelchair) {
      const o = await la(e, "wheelchair");
      o.scene.scale.copy(i.scale), a.root.add(o.scene), a.wheel = !0, a.play("wheelchair-sit");
    }
    if (n.cane) {
      const o = await la(e, "aid-cane"), c = i.getObjectByName("arm-right");
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
    this.root = new Ut();
    const r = new En().setFromObject(e), a = lg / Math.max(0.01, r.max.y - r.min.y);
    if (e.scale.setScalar(a), e.position.y = -r.min.y * a, this.root.add(e), this.mixer = new mm(e), this.actions = {}, t.forEach((o) => {
      this.actions[o.name] = this.mixer.clipAction(o);
    }), this.current = null, this.path = null, this.onArrive = null, this.yOffset = 0, n) {
      const o = e.getObjectByName("head"), c = new Lt({ color: 16777215, roughness: 0.7 }), l = new Ut(), u = new Le(new Gi(0.19, 0.2, 0.07, 24), c), h = new Le(new gi(0.21, 24, 16), c);
      h.scale.y = 0.72, h.position.y = 0.1, l.add(u, h), l.traverse((d) => {
        d.isMesh && (d.castShadow = !0);
      }), l.position.set(0, 0.31, 0.01), (o || e).add(l);
    }
    if (i) {
      const o = e.getObjectByName("torso"), c = new Le(new Ki(0.2, 0.15), new Lt({ color: i, roughness: 0.9, side: 2 }));
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
const qe = 5, hg = 0.1, lc = 3.4, ps = 3, ug = 32;
function dg(s) {
  const e = new Pe(s.color || "#94a3b8"), t = e.clone().multiplyScalar(0.5);
  return { color: e, opacity: s.opacity ?? 0.24, ink: `rgba(${Math.round(t.r * 255)},${Math.round(t.g * 255)},${Math.round(t.b * 255)},0.85)` };
}
function fg(s, e) {
  const t = document.createElement("canvas");
  t.width = 512, t.height = 128;
  const n = t.getContext("2d");
  n.font = '900 96px "Pretendard", "Noto Sans KR", sans-serif', n.textAlign = "center", n.textBaseline = "middle", n.fillStyle = e, n.fillText(s, 256, 68);
  const i = new Bp(t);
  i.colorSpace = Rt;
  const r = new Le(new Ki(32, 8), new At({ map: i, transparent: !0, depthWrite: !1 }));
  return r.rotation.x = -Math.PI / 2, r.rotation.z = Math.PI / 4, r;
}
const Fi = { uSight: { value: null }, uSightOn: { value: 0 }, uSightSize: { value: new je(1, 1) } };
function pg(s, { base: e, world: t, mode: n }) {
  const i = n === "gun", r = t.w, a = t.h, o = r * qe, c = a * qe, l = Math.max(o, c);
  let u = !1;
  const h = new Rp({ antialias: !0, alpha: !0 });
  h.setPixelRatio(Math.min(2, window.devicePixelRatio || 1)), h.outputColorSpace = Rt, h.toneMapping = 4, h.shadowMap.enabled = !0, h.shadowMap.type = 2, h.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;outline:none", h.domElement.tabIndex = 0, s.prepend(h.domElement);
  const d = new Cp(), f = new dr(-10, 10, 10, -10, 0.1, 800), g = new Kp(16773596, 9071439, 1.15), _ = new Lc(16773334, 2.3);
  _.castShadow = !0, _.shadow.mapSize.set(2048, 2048), _.shadow.bias = -4e-4, _.shadow.normalBias = 0.05, Object.assign(_.shadow.camera, { left: -l, right: l, top: l, bottom: -l, near: 1, far: 300 + l }), _.position.set(o / 2 + 40 - l * 0.35, 90, c / 2 + 50 + l * 0.4), _.target.position.set(o / 2, 0, c / 2), d.add(g, _, _.target);
  const p = (x, L, b = 0) => new N(x * qe, b, L * qe), m = new Int16Array(r * a).fill(-1);
  t.areas.forEach((x, L) => {
    for (let b = x.x0; b < x.x1; b++) for (let R = x.y0; R < x.y1; R++) m[R * r + b] = L;
  });
  function T(x, L) {
    const b = Math.floor(x), R = Math.floor(L);
    return b >= 0 && R >= 0 && b < r && R < a ? m[R * r + b] : -1;
  }
  function S(x, L) {
    const b = T(x, L);
    if (b < 0) return 0;
    const R = t.areas[b];
    if (R.kind !== "stairs") return R.h || 0;
    const P = R.axis === "x" ? (x - R.x0) / (R.x1 - R.x0) : (L - R.y0) / (R.y1 - R.y0);
    return R.from + (R.to - R.from) * Math.min(1, Math.max(0, P));
  }
  const A = (x, L) => S(x, L) * ps, F = (x, L, b = 0) => p(x, L, A(x, L) + b), C = new Pe(13808780), I = /* @__PURE__ */ new Set();
  function z(x, L, b, R, P, ae) {
    const le = Math.min(P, 0) - 0.6, ie = new Le(new yt((b - x) * qe, P - le, (R - L) * qe), ae);
    ie.position.copy(p((x + b) / 2, (L + R) / 2, (P + le) / 2)), ie.receiveShadow = !0, ie.castShadow = P > 0, d.add(ie);
  }
  for (const x of t.areas) {
    const L = dg(x);
    if (x.kind === "stairs") {
      const ae = new Lt({ color: 12101519, roughness: 0.8 }), le = x.axis === "x" ? x.x1 - x.x0 : x.y1 - x.y0, ie = le * 3;
      for (let ue = 0; ue < ie; ue++) {
        const Ge = ue / ie, Xe = (ue + 1) / ie, Ze = x.from + (x.to - x.from) * (x.from < x.to ? Xe : Ge);
        x.axis === "x" ? z(x.x0 + Ge * le, x.y0, x.x0 + Xe * le, x.y1, Ze * ps, ae) : z(x.x0, x.y0 + Ge * le, x.x1, x.y0 + Xe * le, Ze * ps, ae);
      }
      continue;
    }
    const b = x.kind === "jail" ? new Pe(9741240) : C.clone().lerp(L.color, x.kind === "corridor" ? 0.15 : 0.32);
    (x.h || 0) > 0 && b.offsetHSL(0, 0, 0.05), (x.h || 0) < 0 && b.offsetHSL(0, 0, -0.08), z(x.x0, x.y0, x.x1, x.y1, (x.h || 0) * ps, new Lt({ color: b, roughness: 0.85 }));
    const R = x.group || x.name + x.x0 + "," + x.y0;
    if (x.kind === "jail" || I.has(R)) continue;
    I.add(R);
    const P = fg(x.name, L.ink);
    P.scale.setScalar(Math.min(1, Math.min(x.x1 - x.x0, x.y1 - x.y0) * qe * 1.3 / 32)), P.position.copy(p((x.x0 + x.x1) / 2, (x.y0 + x.y1) / 2, (x.h || 0) * ps + 0.025)), d.add(P);
  }
  function Q(x) {
    const b = (x.o === "v" ? [[x.f - 0.05, x.t + 0.5], [x.f + 0.05, x.t + 0.5]] : [[x.t + 0.5, x.f - 0.05], [x.t + 0.5, x.f + 0.05]]).filter(([R, P]) => T(R, P) >= 0).map(([R, P]) => A(R, P));
    return { bottom: Math.min(...b), top: Math.max(...b) };
  }
  (async () => {
    for (const x of t.walls) {
      const L = await nr(e, "wallHalf");
      if (u) return;
      const b = Q(x);
      L.scale.set(qe / L.userData.size.x, (b.top - b.bottom + lc) / L.userData.size.y, 1), x.o === "v" ? (L.rotation.y = Math.PI / 2, L.position.copy(p(x.f, x.t + 0.5, b.bottom))) : L.position.copy(p(x.t + 0.5, x.f, b.bottom)), d.add(L);
    }
    await G();
    for (const x of t.decor) {
      const L = await nr(e, x.model);
      if (u) return;
      L.position.copy(F(x.x + 1, x.y + 1, 0.03)), d.add(L);
    }
    for (const x of t.props) {
      const L = await nr(e, x.model);
      if (u) return;
      const b = L.userData.size, [R, P] = x.rot % 2 ? [x.d, x.w] : [x.w, x.d];
      L.scale.set(Math.min(1, (R + 0.12) * qe / b.x), 1, Math.min(1, (P + 0.12) * qe / b.z)), L.rotation.y = x.rot * Math.PI / 2, L.position.copy(F(x.x + x.w / 2, x.y + x.d / 2)), d.add(L);
    }
  })();
  const v = new Lt({ color: 3359061, roughness: 0.5, metalness: 0.4 }), E = new yt(0.35, 5.5, 0.35);
  for (const x of t.fences || []) {
    const L = Q(x).top, b = x.o === "v" ? (R) => p(x.f, x.t + R) : (R) => p(x.t + R, x.f);
    for (const R of [0, 0.5, 1]) {
      const P = new Le(E, v);
      P.position.copy(b(R)).setY(L + 2.75), P.castShadow = !0, d.add(P);
    }
    for (const R of [0.6, 5.2]) {
      const P = new Le(new yt(x.o === "v" ? 0.3 : qe, 0.3, x.o === "v" ? qe : 0.3), v);
      P.position.copy(b(0.5)).setY(L + R), d.add(P);
    }
  }
  let W = null;
  if (t.pad) {
    const x = t.pad;
    W = new Le(new pi(x.r * qe - 0.7, x.r * qe, 48), new At({ color: 16436245, transparent: !0, opacity: 0.9, side: 2 })), W.userData.noSight = !0, W.rotation.x = -Math.PI / 2, W.position.copy(F(x.cx, x.cy, 0.08));
    const L = new Le(new ba(x.r * qe - 0.7, 48), new At({ color: 16639626, transparent: !0, opacity: 0.45 }));
    L.rotation.x = -Math.PI / 2, L.position.copy(F(x.cx, x.cy, 0.07)), d.add(W, L);
  }
  const X = 1.6, K = new N(o / 2, 0, c / 2);
  function te() {
    const x = s.clientWidth || 600, L = s.clientHeight || 400;
    h.setSize(x, L, !1);
    const b = ug * qe * 0.62 / X, R = x / L;
    f.left = -b * R, f.right = b * R, f.top = b, f.bottom = -b, f.updateProjectionMatrix();
  }
  function j() {
    f.position.copy(K).add(new N(1, 0.9, 1).normalize().multiplyScalar(300)), f.lookAt(K);
  }
  te(), j();
  const oe = new ResizeObserver(te);
  oe.observe(s);
  const q = t.radius, xe = t.shapes;
  function ve(x, L) {
    for (let b = 0; b < 8; b++) {
      let R = !1;
      for (const P of L) {
        const ae = x.x - P.x, le = x.y - P.y, ie = Math.hypot(ae, le), ue = q * 2;
        ie >= ue || ie < 1e-6 || (x.x += ae / ie * (ue - ie), x.y += le / ie * (ue - ie), R = !0);
      }
      for (const P of xe) {
        let ae, le;
        P.kind === "circle" ? (ae = P.cx, le = P.cy) : (ae = Math.min(Math.max(x.x, P.cx - P.hx), P.cx + P.hx), le = Math.min(Math.max(x.y, P.cy - P.hy), P.cy + P.hy));
        let ie = x.x - ae, ue = x.y - le;
        const Ge = P.kind === "circle" ? P.r + q : q;
        let Xe = Math.hypot(ie, ue);
        if (!(Xe >= Ge)) {
          if (Xe < 1e-6) {
            const Ze = P.hx - Math.abs(x.x - P.cx), We = P.hy - Math.abs(x.y - P.cy);
            Ze < We ? (ie = Math.sign(x.x - P.cx) || 1, ue = 0, Xe = -Ze) : (ie = 0, ue = Math.sign(x.y - P.cy) || 1, Xe = -We), x.x += ie * (Ge - Xe + 1e-3), x.y += ue * (Ge - Xe + 1e-3);
          } else
            x.x += ie / Xe * (Ge - Xe + 1e-3), x.y += ue / Xe * (Ge - Xe + 1e-3);
          R = !0;
        }
      }
      if (x.x = Math.min(Math.max(x.x, q), r - q), x.y = Math.min(Math.max(x.y, q), a - q), !R) break;
    }
    return x;
  }
  function Ae(x, L) {
    return xe.some((b) => b.kind === "circle" ? Math.hypot(x - b.cx, L - b.cy) < b.r + q - 1e-3 : Math.hypot(Math.max(Math.abs(x - b.cx) - b.hx, 0), Math.max(Math.abs(L - b.cy) - b.hy, 0)) < q - 1e-3);
  }
  const Qe = new Ut();
  Qe.visible = !1, d.add(Qe);
  const ht = new At({ color: 16722902, transparent: !0, opacity: 0.45, depthWrite: !1 }), Z = new wn({ color: 16722902 });
  xe.forEach((x) => {
    const L = x.kind === "circle" ? new Gi(x.r * qe, x.r * qe, 1.2, 40) : new yt(x.hx * 2 * qe, 1.2, x.hy * 2 * qe), b = new Le(L, ht);
    b.add(new mi(new Op(L, 20), Z)), b.position.copy(F(x.cx, x.cy, 0.6)), b.renderOrder = 10, Qe.add(b);
  });
  const se = new pi(q * qe - 0.25, q * qe, 40), Re = new At({ color: 5195493, transparent: !0, opacity: 0.8, side: 2, depthWrite: !1 }), Me = { cop: 2450411, thief: 14427686, red: 14427686, blue: 2450411 }, Ve = new Pe(16777215);
  function Fe(x) {
    const L = new Ut();
    if (x === "cop") {
      const b = new Lt({ color: 1920728, roughness: 0.6 }), R = new Le(new Gi(0.2, 0.22, 0.12, 24), b), P = new Le(new yt(0.3, 0.025, 0.14), new Lt({ color: 988970 }));
      P.position.set(0, -0.04, 0.2);
      const ae = new Le(new yt(0.07, 0.07, 0.02), new Lt({ color: 16436245, metalness: 0.6 }));
      ae.position.set(0, 0.01, 0.215), L.add(R, P, ae);
    } else if (x === "red" || x === "blue") {
      const b = new Lt({ color: x === "red" ? 14427686 : 2450411, roughness: 0.55 }), R = new Le(new gi(0.235, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), b);
      R.scale.y = 0.7;
      const P = new Le(new yt(0.3, 0.03, 0.14), b);
      P.position.set(0, -0.03, 0.2), L.add(R, P);
    } else if (x === "thief") {
      const b = new Lt({ color: 1120295, roughness: 0.9 }), R = new Le(new gi(0.235, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), b);
      R.scale.y = 0.7, L.add(R);
    }
    return L.position.set(0, 0.3, 0), L.traverse((b) => {
      b.isMesh && (b.castShadow = !0);
    }), L;
  }
  function it() {
    const x = new Ut(), L = new Lt({ color: 16436245, roughness: 0.45 }), b = new Lt({ color: 1120295, roughness: 0.6 }), R = new Le(new yt(0.06, 0.07, 0.17), L);
    R.position.set(0, 0, 0.06);
    const P = new Le(new yt(0.05, 0.09, 0.05), b);
    P.position.set(0, -0.06, 0), P.rotation.x = -0.25;
    const ae = new Le(new yt(0.065, 0.075, 0.05), b);
    ae.position.set(0, 0, 0.16);
    const le = new Le(new yt(0.02, 0.02, 0.01), new At({ color: 3718648 }));
    return le.position.set(0, 0.025, 0.186), x.add(R, P, ae, le), x.position.set(-0.27, 0, 0.07), x.rotation.z = -Math.PI / 4, x.scale.setScalar(1.4), x.traverse((ie) => {
      ie.isMesh && (ie.castShadow = !0);
    }), x;
  }
  const ut = {
    // [body length, body height, colour, barrel length] per weapon
    pistol: [0.17, 0.07, 3359061, 0],
    rifle: [0.34, 0.07, 1409085, 0.1],
    shotgun: [0.3, 0.09, 12730636, 0.08],
    sniper: [0.42, 0.06, 8266446, 0.16]
  };
  function tt(x) {
    const [L, b, R, P] = ut[x] || ut.pistol, ae = new Ut(), le = new Le(new yt(0.06, b, L), new Lt({ color: R, roughness: 0.45 }));
    le.position.set(0, 0, L / 2 - 0.02);
    const ie = new Le(new yt(0.05, 0.09, 0.05), new Lt({ color: 1120295 }));
    if (ie.position.set(0, -0.06, 0), ie.rotation.x = -0.25, ae.add(le, ie), P) {
      const ue = new Le(new yt(0.03, 0.03, P), new Lt({ color: 988970 }));
      ue.position.set(0, 0.01, L - 0.02 + P / 2), ae.add(ue);
    }
    return ae.userData.muzzle = L + P, ae.position.set(-0.27, 0, 0.07), ae.rotation.z = -Math.PI / 4, ae.scale.setScalar(1.4), ae.traverse((ue) => {
      ue.isMesh && (ue.castShadow = !0);
    }), ae;
  }
  function U(x, L) {
    if (!x.actor || x.team === L) return;
    x.team = L;
    const b = x.actor.root.getObjectByName("head"), R = x.actor.root.getObjectByName("arm-right");
    x.hat && (x.hat.parent.remove(x.hat), x.hat = null), x.gun && (x.gun.parent.remove(x.gun), x.gun = null), L && b && (x.hat = Fe(L), b.add(x.hat)), L === "cop" && R && (x.gun = it(), R.add(x.gun)), i && (L === "red" || L === "blue") && R && (x.gunKind = x.weapon || "pistol", x.gun = tt(x.gunKind), R.add(x.gun));
  }
  const He = /* @__PURE__ */ new Map();
  let Te = null, D = null;
  async function Oe(x) {
    const L = { actor: null, x: x.x, y: x.y, dir: x.dir || 0, moving: !1, name: x.name, model: x.model, hidden: !!x.hidden };
    He.set(x.id, L);
    const b = await Ia.create(e, x.model, {});
    if (!He.has(x.id)) return;
    L.actor = b, Number.isFinite(L.x) && b.root.position.copy(F(L.x, L.y));
    const R = new Le(se, Re.clone());
    R.rotation.x = -Math.PI / 2, R.position.y = 0.3, L.ring = R, b.root.add(R), d.add(b.root), U(L, L.wantTeam);
  }
  function vt(x, L) {
    Te = L;
    const b = /* @__PURE__ */ new Set();
    x.forEach((R) => {
      b.add(R.id), He.has(R.id) || Oe(R);
      const P = He.get(R.id);
      if (P.name = R.name, P.online = R.online, P.jailed = R.jailed, P.safe = R.safe, P.wantTeam = R.team, i) {
        P.hp = R.hp, P.dead = R.alive === !1 ? 1 : 0, P.weapon = R.weapon;
        const ue = P.actor && P.actor.root.getObjectByName("arm-right");
        ue && P.gun && P.gunKind !== R.weapon && R.team && (ue.remove(P.gun), P.gunKind = R.weapon, P.gun = tt(R.weapon), ue.add(P.gun));
      }
      if (U(P, R.team), R.stun > 0 && (P.stunEnd = performance.now() / 1e3 + R.stun), R.id === Te) {
        (!D || R.tp !== D.tp) && (D = { ...D || {}, x: R.x, y: R.y, dir: R.dir, tp: R.tp }), D.speed = R.speed, D.frozen = R.frozen, D.jailed = R.jailed, D.team = R.team, D.grabbed = !!R.grabbed, D.grabbing = R.grabbing != null, i && (D.hp = R.hp, D.dead = R.alive === !1 ? 1 : 0, D.weapon = R.weapon, D.ammo = R.ammo, D.auto = !!R.auto);
        const ue = (R.stamina ?? 1) * t.run.stamina;
        (D.stamina == null || Math.abs(D.stamina - ue) > 0.6) && (D.stamina = ue), R.exhausted && (D.exhausted = !0);
        return;
      }
      if (R.hidden) {
        P.hidden = !0, P.moving = !1;
        return;
      }
      P.hidden && (P.hidden = !1, P.snap = !0, P.sampleAt = 0, P.x = R.x, P.y = R.y);
      const ae = performance.now() / 1e3, le = ae - (P.sampleAt || 0), ie = Math.hypot(R.x - P.x, R.y - P.y);
      if (!R.moving || ie > 3 || le > 0.5)
        P.vx = 0, P.vy = 0;
      else if (le > 0.02) {
        const ue = Math.min(1, 9 / Math.max(1e-6, ie / le));
        P.vx = (R.x - P.x) / le * ue, P.vy = (R.y - P.y) / le * ue;
      }
      P.snap = ie > 3, P.sampleAt = ae, P.x = R.x, P.y = R.y, P.dir = R.dir, P.moving = R.moving, P.running = !!R.running, P.grabbedNow = !!R.grabbed, P.grabbing = R.grabbing;
    });
    for (const [R, P] of He)
      b.has(R) || (P.actor && d.remove(P.actor.root), He.delete(R));
  }
  function ze(x, L) {
    D && !Ae(x, L) && (D.x = x, D.y = L);
  }
  function w() {
    for (const x of He.values()) x.actor && d.remove(x.actor.root);
    He.clear(), D = null, Te = null;
  }
  const M = [];
  async function G() {
    if (!(t.doors || []).length) return;
    const x = await nr(e, "doorway");
    let L = null;
    if (x.traverse((ie) => {
      ie.isMesh && ie.name && ie.name !== "doorway" && (L = ie);
    }), !L || u) return;
    const b = L.geometry.clone();
    b.computeBoundingBox();
    const R = b.boundingBox;
    b.translate(-R.min.x, -R.min.y, -(R.min.z + R.max.z) / 2);
    const P = R.max.x - R.min.x, ae = R.max.y - R.min.y, le = lc + 0.3;
    for (const ie of t.doors) {
      const ue = ie.t1 - ie.t0;
      if (ue > 2) continue;
      const Ge = ue / (ue === 2 ? 2 : 1), Xe = ue === 2 ? [[ie.t0, 1], [ie.t1, -1]] : [[ie.t0, 1]], Ze = (ie.t0 + ie.t1) / 2, [We, dt] = ie.o === "h" ? [Ze, ie.f] : [ie.f, Ze];
      for (const [Tt, Dt] of Xe) {
        const ln = new Le(b, L.material);
        ln.castShadow = !0, ln.scale.set(Ge * qe / P * 0.98, le / ae, 1);
        const Vt = new Ut();
        Vt.add(ln);
        const [mn, ii] = ie.o === "h" ? [Tt, ie.f] : [ie.f, Tt];
        Vt.position.copy(p(mn, ii, A(We + (ie.o === "v" ? 0.01 : 0), dt + (ie.o === "h" ? 0.01 : 0))));
        const si = ie.o === "h" ? Dt > 0 ? 0 : Math.PI : Dt > 0 ? -Math.PI / 2 : Math.PI / 2, yi = ie.o === "h" ? Dt : -Dt;
        Vt.rotation.y = si, d.add(Vt), M.push({ group: Vt, base: si, k: yi, o: ie.o, f: ie.f, cx: We, cy: dt, hx: mn, hy: ii, len: Ge * 0.98, ang: 0, vel: 0 });
      }
    }
  }
  const $ = 1.7, ne = 0.06;
  function J(x) {
    const L = Math.min(x, 0.04);
    for (const b of M) {
      const R = -b.base - b.k * b.ang, P = Math.cos(R), ae = Math.sin(R), le = -ae, ie = P;
      let ue = 0, Ge = 0;
      for (const [Xe, Ze] of He) {
        if (!Ze.actor || Ze.hidden && Xe !== Te) continue;
        const We = Xe === Te && D ? D.x : Ze.actor.root.position.x / qe, dt = Xe === Te && D ? D.y : Ze.actor.root.position.z / qe, Tt = We - b.hx, Dt = dt - b.hy;
        if (Math.abs(Tt) > b.len + q + 0.2 || Math.abs(Dt) > b.len + q + 0.2) continue;
        const ln = Math.max(0, Math.min(b.len, Tt * P + Dt * ae)), Vt = b.hx + P * ln, mn = b.hy + ae * ln;
        let ii = Vt - We, si = mn - dt;
        const yi = Math.hypot(ii, si), Ga = q + ne - yi;
        if (Ga <= 0 || ln < 0.05) continue;
        yi > 1e-4 ? (ii /= yi, si /= yi) : (ii = le, si = ie);
        const Kc = ii * le + si * ie, Er = Ga * Kc / ln;
        Math.abs(Er) > Math.abs(Ge) && (Ge = Er, ue = -b.k * Er);
      }
      ue && (b.ang += ue, b.vel = Math.max(-6, Math.min(6, ue / L))), b.vel += (60 * (0 - b.ang) - 7 * b.vel) * L, b.ang += b.vel * L, Math.abs(b.ang) > $ && (b.ang = Math.sign(b.ang) * $, b.vel = 0), b.group.rotation.y = b.base + b.k * b.ang;
    }
  }
  const _e = { has: !1, x: 0, y: 0 }, de = new gm(), ye = new je(), st = new Yn(new N(0, 1, 0), 0), re = new N();
  function Se(x) {
    const L = h.domElement.getBoundingClientRect();
    ye.set((x.clientX - L.left) / L.width * 2 - 1, -((x.clientY - L.top) / L.height) * 2 + 1), de.setFromCamera(ye, f), st.constant = -(D ? A(D.x, D.y) : 0), de.ray.intersectPlane(st, re) && (_e.x = re.x / qe, _e.y = re.z / qe, _e.has = !0);
  }
  function Be(x) {
    if (i && x.button === 0 && D && D.dead > 0) {
      mt && mt(1);
      return;
    }
    x.button !== 0 || !D || !De() || (Se(x), i ? (Ke = !0, ee()) : ei());
  }
  const De = () => i ? D && (D.team === "red" || D.team === "blue") : D && D.team === "cop", Ee = () => t.gun.weapons[D && D.weapon || "pistol"] || t.gun.weapons.pistol;
  let Ke = !1, ke = 0, mt = null, B = null, ge = "lobby";
  const Y = () => {
    Ke = !1;
  };
  window.addEventListener("pointerup", Y), window.addEventListener("pointercancel", Y);
  function ee() {
    const x = performance.now() / 1e3;
    if (!D || !De() || ge !== "playing" || D.frozen > 0 || D.dead > 0 || x < ke) return;
    const L = Ee();
    ke = x + L.cooldown;
    const b = _e.has ? Math.atan2(_e.x - D.x, _e.y - D.y) : D.dir;
    D.dir = b, Ss(He.get(Te)), cn && (pn = 0, cn({ x: +D.x.toFixed(3), y: +D.y.toFixed(3), dir: +D.dir.toFixed(3), moving: !1, run: !1 })), nn && nn(+b.toFixed(4));
  }
  h.domElement.addEventListener("pointermove", Se), h.domElement.addEventListener("pointerdown", Be);
  const he = new Le(new yt(1, 0.06, 0.3), new At({ color: 16436245, transparent: !0, opacity: 0.7, depthWrite: !1 })), fe = new Le(new pi(0.8, 1.15, 32), new At({ color: 16436245, transparent: !0, opacity: 0.9, side: 2, depthWrite: !1 }));
  fe.rotation.x = -Math.PI / 2, he.userData.noSight = fe.userData.noSight = !0, he.visible = fe.visible = !1, d.add(he, fe);
  function rt() {
    const x = Mr && D && De() && _e.has && !(D.frozen > 0) && !(D.dead > 0);
    if (he.visible = fe.visible = !!x, !x) return;
    const L = i ? Ee().range : t.taser.range, b = _e.x - D.x, R = _e.y - D.y, P = Math.min(L, Math.hypot(b, R)) || 0.01, ae = Math.atan2(b, R), le = D.x + Math.sin(ae) * P, ie = D.y + Math.cos(ae) * P, ue = A(D.x, D.y) + 0.15;
    he.scale.x = P * qe, he.position.set((D.x + le) / 2 * qe, ue, (D.y + ie) / 2 * qe), he.rotation.y = ae - Math.PI / 2, fe.position.set(le * qe, A(le, ie) + 0.16, ie * qe);
    const Ge = performance.now() / 1e3 >= (i ? ke : Qn);
    he.material.color.setHex(Ge ? 16436245 : 9741240), fe.material.color.setHex(Ge ? 16436245 : 9741240);
  }
  const Et = new mi(
    new It().setAttribute("position", new pt(new Float32Array(8 * 2 * 3), 3)),
    new wn({ color: 16638023 })
  );
  Et.frustumCulled = !1, d.add(Et);
  function Ht() {
    const x = Et.geometry.attributes.position;
    let L = 0;
    for (const [b, R] of He) {
      const P = b === Te && D ? D.grabbing ? [...He.entries()].find(([, ue]) => ue.grabbedNow)?.[0] : null : R.grabbing, ae = P != null ? He.get(P) : null;
      if (!R.actor || !ae || !ae.actor || L >= 8) continue;
      const le = R.actor.root.position, ie = ae.actor.root.position;
      x.setXYZ(L * 2, le.x, le.y + 2.2, le.z), x.setXYZ(L * 2 + 1, ie.x, ie.y + 2.6, ie.z), L++;
    }
    for (let b = L * 2; b < 16; b++) x.setXYZ(b, 0, -999, 0);
    x.needsUpdate = !0;
  }
  const nt = /* @__PURE__ */ new Set(), Ot = { w: [-1, -1], arrowup: [-1, -1], s: [1, 1], arrowdown: [1, 1], a: [-1, 1], arrowleft: [-1, 1], d: [1, -1], arrowright: [1, -1] };
  let Qt = !1, Pn = !1, Qn = 0, nn = null;
  function ei() {
    const x = performance.now() / 1e3;
    if (!D || D.team !== "cop" || D.frozen > 0 || x < Qn) return;
    Qn = x + t.taser.cooldown;
    const L = _e.has ? Math.atan2(_e.x - D.x, _e.y - D.y) : D.dir;
    D.dir = L, Ss(He.get(Te)), cn && (pn = 0, cn({ x: +D.x.toFixed(3), y: +D.y.toFixed(3), dir: +D.dir.toFixed(3), moving: !1, run: !1 })), nn && nn(+L.toFixed(4));
  }
  function Qi(x) {
    const L = x.key.toLowerCase();
    if ((L === " " || L === "shift") && !x.target.closest("input, textarea, button") && D) {
      x.preventDefault(), D.team === "thief" ? Qt = !0 : L === " " && !x.repeat && (i ? (Ke = !0, ee()) : ei());
      return;
    }
    if (L === "e" && !x.target.closest("input, textarea") && Te) {
      x.repeat || lt();
      return;
    }
    if (za[L] && !x.target.closest("input, textarea") && Te) {
      Sr && !x.repeat && Sr(za[L]);
      return;
    }
    if (L === "h" && !x.target.closest("input, textarea") && Te) {
      Qe.visible = !Qe.visible;
      return;
    }
    !Ot[L] || x.target.closest("input, textarea") || !Te || (x.preventDefault(), nt.add(L));
  }
  const es = (x) => {
    const L = x.key.toLowerCase();
    nt.delete(L), (L === " " || L === "shift") && (Qt = !1, i && (Ke = !1)), L === "e" && ot();
  }, ti = () => {
    nt.clear(), Qt = !1, Ke = !1, ot();
  };
  window.addEventListener("keydown", Qi), window.addEventListener("keyup", es), window.addEventListener("blur", ti);
  let cn = null, pn = 0, ts = !1;
  function Ms(x) {
    if (!D) return !1;
    let L = 0, b = 0;
    nt.forEach((le) => {
      L += Ot[le][0], b += Ot[le][1];
    });
    const R = Math.hypot(L, b), P = R > 0, ae = D.frozen > 0;
    if (ae && (D.frozen = Math.max(0, D.frozen - x)), D.exhausted && (D.stamina ?? 0) >= t.run.recover && (D.exhausted = !1), Pn = D.team === "thief" && Qt && P && !ae && !D.jailed && !D.exhausted && (D.stamina ?? 0) > 0, Pn ? (D.stamina = Math.max(0, D.stamina - x), D.stamina <= 0 && (D.exhausted = !0)) : D.stamina != null && (D.stamina = Math.min(t.run.stamina, D.stamina + x * t.run.regen)), P && !ae) {
      const le = D.grabbed ? t.arrest.slow : D.grabbing ? t.arrest.cop_slow : 1, ie = (D.speed || t.speed.lobby) * (Pn ? t.run.mult : 1) * le * x, ue = Math.max(1, Math.ceil(ie / 0.08)), Ge = [...He.entries()].filter(([We, dt]) => We !== Te && !dt.hidden && Number.isFinite(dt.x) && Number.isFinite(dt.y)).map(([, We]) => We), Xe = L / R * ie / ue, Ze = b / R * ie / ue;
      for (let We = 0; We < ue; We++) {
        const dt = D.x, Tt = D.y;
        if (D.x += Xe, D.y += Ze, ve(D, Ge), !Ae(D.x, D.y)) continue;
        D.x = dt + Xe, D.y = Tt, ve(D, Ge), Ae(D.x, D.y) && (D.x = dt, D.y = Tt);
        const Dt = D.x;
        D.y += Ze, ve(D, Ge), Ae(D.x, D.y) && (D.x = Dt, D.y -= Ze, Ae(D.x, D.y) && (D.x = dt, D.y = Tt)), (!Number.isFinite(D.x) || !Number.isFinite(D.y)) && (D.x = dt, D.y = Tt);
      }
      D.dir = Math.atan2(L, b);
    }
    return pn += x, cn && (P && pn >= hg || P !== ts) && (pn = 0, cn({ x: +D.x.toFixed(3), y: +D.y.toFixed(3), dir: +D.dir.toFixed(3), moving: P, run: Pn })), ts = P && !ae, P && !ae;
  }
  const _r = new gi(0.75, 10, 8), xr = new pi(1.1, 1.6, 40), vi = [];
  function y(x, L, b) {
    const R = new Le(xr, new At({ color: b, transparent: !0, opacity: 0.9, side: 2, depthWrite: !1 }));
    R.rotation.x = -Math.PI / 2, R.position.copy(F(x, L, 0.15)), R.userData.life = 0, d.add(R), vi.push(R);
  }
  const O = [];
  function H(x, L) {
    const b = new Le(_r, new At({ color: 16118248, transparent: !0, opacity: 0.85, depthWrite: !1 }));
    b.position.copy(F(x + (Math.random() - 0.5) * 0.25, L + (Math.random() - 0.5) * 0.25, 0.35)), b.userData.life = 0, d.add(b), O.push(b);
  }
  function V(x) {
    for (let L = O.length - 1; L >= 0; L--) {
      const b = O[L];
      b.userData.life += x;
      const R = b.userData.life / 0.5;
      if (R >= 1) {
        d.remove(b), b.material.dispose(), O.splice(L, 1);
        continue;
      }
      b.scale.setScalar(1 + R * 1.8), b.position.y = 0.35 + R * 1.2, b.material.opacity = 0.85 * (1 - R);
    }
    for (let L = vi.length - 1; L >= 0; L--) {
      const b = vi[L];
      b.userData.life += x;
      const R = b.userData.life / 0.4;
      if (R >= 1) {
        d.remove(b), b.material.dispose(), vi.splice(L, 1);
        continue;
      }
      b.scale.setScalar(1 + R * 2.6), b.material.opacity = 0.9 * (1 - R);
    }
  }
  const k = new yt(0.18, 0.18, 5.5);
  function ce(x) {
    if (x.streaks) return x.streaks;
    const L = new Ut();
    for (const [b, R] of [[-0.9, 1.4], [0.9, 1.9], [-0.45, 3.1], [0.5, 0.7]]) {
      const P = new Le(k, new At({ color: 16777215, transparent: !0, opacity: 0.6, depthWrite: !1 }));
      P.position.set(b, R, -3.4), L.add(P);
    }
    return L.visible = !1, x.actor.root.add(L), x.streaks = L;
  }
  const me = new N();
  function be() {
    const x = {};
    for (const [L, b] of He) {
      if (!b.actor || b.hidden && L !== Te) continue;
      me.copy(b.actor.root.position).setY(6.2).project(f);
      const R = b.emote ? performance.now() / 1e3 - b.emote.born : 9;
      x[L] = {
        x: (me.x + 1) / 2 * s.clientWidth,
        y: (1 - me.y) / 2 * s.clientHeight,
        name: b.name,
        me: L === Te,
        online: b.online !== !1,
        team: b.team,
        jailed: b.jailed,
        reach: L === Mt,
        hp: b.hp,
        dead: b.dead > 0,
        emote: R < 1.8 ? b.emote.e : null,
        emoteAge: R
      };
    }
    return x;
  }
  let we = null;
  const Ue = new nm();
  function Ne() {
    const x = Math.min(0.05, Ue.getDelta()), L = Ms(x);
    for (const [R, P] of He) {
      const ae = P.actor;
      if (!ae) continue;
      const le = R === Te && D;
      if (ae.root.visible = (le || !P.hidden) && !(P.dead > 0), !ae.root.visible) continue;
      const ie = le ? 0 : Math.min(0.12, performance.now() / 1e3 - (P.sampleAt || 0)), ue = le ? D.x : P.x + (P.vx || 0) * ie, Ge = le ? D.y : P.y + (P.vy || 0) * ie, Xe = F(ue, Ge);
      le || P.snap ? (ae.root.position.copy(Xe), P.snap = !1) : ae.root.position.lerp(Xe, Math.min(1, x * 14)), ae.root.rotation.y = le ? D.dir : P.dir;
      const Ze = performance.now() / 1e3, We = le ? Pn : !!P.running;
      if (P.ring) {
        const Vt = P.safe > 0 && Math.floor(performance.now() / 150) % 2;
        P.ring.material.color.setHex(P.jailed ? 6583435 : Vt ? 2278750 : Me[P.team] || 5195493), We && P.ring.material.color.lerp(Ve, 0.45), P.ring.scale.setScalar(We ? 1.45 : 1), P.ring.material.opacity = We ? 1 : 0.8, P.ring.visible = !!P.team || Qe.visible || le || We;
      }
      We && !P.wasDashing && y(ue, Ge, P.jailed ? 9741240 : Me[P.team] || 6514417), P.wasDashing = We;
      const dt = ce(P);
      dt.visible = We, We && (dt.children.forEach((Vt, mn) => {
        Vt.material.opacity = 0.5 + 0.4 * Math.abs(Math.sin(Ze * 30 + mn * 1.7)), Vt.scale.z = 0.8 + 0.4 * Math.abs(Math.sin(Ze * 22 + mn));
      }), P.puffT = (P.puffT || 0) + x, P.puffT > 0.05 && (P.puffT = 0, H(ue, Ge)));
      const Tt = (P.stunEnd || 0) > Ze;
      Pa(P, Tt), Tt && (ae.root.rotation.y += Math.sin(Ze * 70) * 0.18, P.ring && P.ring.material.color.setHex(Math.floor(Ze * 20) % 2 ? 2282478 : 16777215));
      const Dt = (P.crouchUntil || 0) > Ze, ln = (P.grabUntil || 0) > Ze || (le ? D.grabbing : P.grabbing != null);
      (le ? D.grabbed : P.grabbedNow) && !Tt && (ae.root.rotation.y += Math.sin(Ze * 40) * 0.25), ae.pose(Dt ? "sit" : ln ? "work" : !Tt && ((le ? L : P.moving) || We) ? "walk" : "idle"), ae.mixer && (ae.mixer.timeScale = We ? 1.6 : Tt ? 3 : 1), ae.update(x);
    }
    jt(), i && (Ke && D && D.auto && ee(), is(), ys()), Oc(), Wc(), J(x), rt(), Ht(), V(x);
    const b = ka();
    b && K.lerp(F(b.x, b.y), Math.min(1, x * 5)), W && (W.material.opacity = 0.6 + Math.sin(performance.now() / 250) * 0.3), j(), h.render(d, f), we && we(be()), u || (Ce = requestAnimationFrame(Ne));
  }
  let Ce = requestAnimationFrame(Ne), ct = null, xt = 0, Mt = null;
  function jt() {
    Mt = null;
    const x = He.get(Te);
    if (!D || !x || x.team !== "cop" || D.frozen > 0 || D.grabbing) return;
    let L = t.arrest.reach + 0.05;
    for (const [b, R] of He) {
      if (b === Te || !R.actor || R.hidden || R.team !== "thief" || R.jailed || R.safe > 0) continue;
      const P = R.actor.root.position, ae = Math.hypot(P.x / qe - D.x, P.z / qe - D.y);
      ae <= L && (L = ae, Mt = b);
    }
  }
  function lt() {
    const x = He.get(Te), L = performance.now() / 1e3;
    !ct || !D || !x || x.team !== "cop" || D.frozen > 0 || L < xt || (xt = L + t.arrest.cooldown, x.grabUntil = L + 0.35, Ie = !0, cn && (pn = 0, cn({ x: +D.x.toFixed(3), y: +D.y.toFixed(3), dir: +D.dir.toFixed(3), moving: !1, run: !1 })), ct(Mt));
  }
  let Ie = !1, Ct = null;
  function ot() {
    Ie && (Ie = !1, Ct && Ct());
  }
  const zt = [], zn = new yt(0.35, 0.35, 1.1), Yt = new At({ color: 16638023 }), ns = new wn({ color: 14742270, transparent: !0, opacity: 0.9 });
  function wt(x) {
    const L = performance.now() / 1e3;
    for (const b of x || [])
      if (i && b.t === "gshot") {
        b.id !== Te && Ss(He.get(b.id));
        const R = F(b.x, b.y, 2.3);
        for (const [P, ae] of b.ends) {
          const le = F(P, ae, 2.3), ie = new It().setFromPoints([R, le]), ue = new pr(ie, new wn({ color: b.w === "sniper" ? 15324671 : 16707722, transparent: !0, opacity: 0.95 }));
          ue.frustumCulled = !1, ue.userData.noSight = !0, d.add(ue), sn.push({ line: ue, born: L });
        }
      } else if (i && b.t === "hit") {
        const R = He.get(b.id);
        if (R && R.actor && !R.hidden) {
          const P = b.id === Te && D ? D.x : R.x, ae = b.id === Te && D ? D.y : R.y;
          if (Number.isFinite(P) && Number.isFinite(ae)) for (let le = 0; le < 4; le++) H(P + (Math.random() - 0.5) * 0.4, ae + (Math.random() - 0.5) * 0.4);
        }
        R && (R.hitAt = L);
      } else if (i && b.t === "kill") {
        const R = He.get(b.victim);
        R && Number.isFinite(R.x) && y(b.victim === Te && D ? D.x : R.x, b.victim === Te && D ? D.y : R.y, 15680580);
      } else if (i && b.t === "respawn") {
        const R = He.get(b.id);
        R && Number.isFinite(R.x) && y(b.id === Te && D ? D.x : R.x, b.id === Te && D ? D.y : R.y, 2278750);
      } else if (b.t === "shot") {
        const R = new Le(zn, Yt);
        R.rotation.y = b.dir;
        const P = new mi(new It().setAttribute("position", new pt(new Float32Array(12), 3)), ns);
        P.frustumCulled = !1, d.add(R, P), zt.push({ cop: b.cop, x: b.x, y: b.y, dir: b.dir, t0: L, end: null, endAt: 0, m: R, wires: P }), b.cop !== Te && Ss(He.get(b.cop));
      } else if (b.t === "grab") {
        const R = He.get(b.cop);
        R && b.cop !== Te && (R.grabUntil = L + 0.35);
      } else if (b.t === "caught") {
        const R = He.get(b.thief);
        R && (R.stunEnd = 0, Pa(R, !1));
      } else if (b.t === "emote")
        jc(b.id, b.e);
      else if (b.t === "tase") {
        const R = zt.find((P) => P.cop === b.cop && !P.end);
        if (R && (R.end = { x: b.x, y: b.y }), b.thief != null) {
          const P = He.get(b.thief);
          P && (P.stunEnd = L + t.taser.stun);
          for (let ae = 0; ae < 6; ae++) H(b.x + (Math.random() - 0.5) * 0.4, b.y + (Math.random() - 0.5) * 0.4);
        }
      }
  }
  const sn = [];
  function is() {
    const x = performance.now() / 1e3;
    for (let L = sn.length - 1; L >= 0; L--) {
      const b = sn[L], R = x - b.born;
      b.line.material.opacity = Math.max(0, 0.95 * (1 - R / 0.16)), R > 0.16 && (d.remove(b.line), b.line.geometry.dispose(), b.line.material.dispose(), sn.splice(L, 1));
    }
  }
  const en = { rifle: 2278750, shotgun: 16347926, sniper: 11032055, medkit: 15680580 }, ni = /* @__PURE__ */ new Map();
  function vr(x) {
    for (const L of x || []) {
      let b = ni.get(L.id);
      if (!b) {
        const R = new Ut(), P = en[L.kind] || 16777215, ae = new Le(new Gi(1.7, 1.7, 0.15, 28), new At({ color: P, transparent: !0, opacity: 0.55, depthWrite: !1 }));
        ae.userData.noSight = !0;
        const le = new Le(new yt(1.5, 1.5, 1.5), new Lt({ color: P, roughness: 0.4, emissive: P, emissiveIntensity: 0.35 }));
        if (le.castShadow = !0, L.kind === "medkit") {
          const ie = new Le(new yt(1.6, 0.5, 1.6), new At({ color: 16777215 })), ue = new Le(new yt(0.5, 1.6, 1.6), new At({ color: 16777215 }));
          le.add(ie, ue);
        } else {
          const ie = new Le(new yt(0.35, 0.35, L.kind === "sniper" ? 2.4 : 1.8), new Lt({ color: 988970 }));
          ie.position.y = 1, ie.rotation.y = 0.6, le.add(ie);
        }
        R.add(ae, le), R.position.copy(F(L.x, L.y, 0.2)), R.userData.crate = le, d.add(R), b = { g: R, crate: le }, ni.set(L.id, b);
      }
      b.g.visible = !!L.on;
    }
  }
  function ys() {
    const x = performance.now() / 1e3;
    for (const L of ni.values())
      L.g.visible && (L.crate.position.y = 2.1 + Math.sin(x * 2.4 + L.g.position.x) * 0.35, L.crate.rotation.y = x * 1.2);
  }
  function Oc() {
    const x = performance.now() / 1e3, L = t.taser.speed, b = t.taser.range;
    for (let R = zt.length - 1; R >= 0; R--) {
      const P = zt[R];
      let ae = Math.min(b, (x - P.t0) * L);
      P.end && (ae = Math.min(ae, Math.hypot(P.end.x - P.x, P.end.y - P.y)));
      const le = P.x + Math.sin(P.dir) * ae, ie = P.y + Math.cos(P.dir) * ae;
      P.m.position.copy(F(le, ie, 2.2));
      const ue = He.get(P.cop), Ge = ue && ue.actor ? ue.actor.root.position : F(P.x, P.y), Xe = P.wires.geometry.attributes.position, Ze = A(le, ie);
      Xe.setXYZ(0, Ge.x - 0.25, Ge.y + 2.3, Ge.z), Xe.setXYZ(1, le * qe - 0.15, Ze + 2.3, ie * qe), Xe.setXYZ(2, Ge.x + 0.25, Ge.y + 2.1, Ge.z), Xe.setXYZ(3, le * qe + 0.15, Ze + 2.1, ie * qe), Xe.needsUpdate = !0, (P.end && ae >= Math.hypot(P.end.x - P.x, P.end.y - P.y) - 1e-3 || ae >= b) && !P.endAt && (P.endAt = x), (P.endAt && x - P.endAt > 0.35 || x - P.t0 > 2) && (d.remove(P.m, P.wires), P.wires.geometry.dispose(), zt.splice(R, 1));
    }
  }
  function Ss(x) {
    if (!x || !x.gun) return;
    const L = new Le(new gi(i ? 0.13 : 0.09, 8, 6), new At({ color: i ? 16638023 : 8246268, transparent: !0, opacity: 0.95 }));
    L.position.set(0, 0, i ? (x.gun.userData.muzzle || 0.24) + 0.04 : 0.24), x.gun.add(L), setTimeout(() => {
      x.gun && x.gun.remove(L), L.material.dispose();
    }, 120);
  }
  const kc = new wn({ color: 6809849, transparent: !0, opacity: 0.95 });
  function Pa(x, L) {
    if (!L) {
      x.sparks && (x.sparks.visible = !1);
      return;
    }
    x.sparks || (x.sparks = new mi(new It().setAttribute("position", new pt(new Float32Array(3 * 2 * 18), 3)), kc), x.sparks.frustumCulled = !1, x.actor.root.add(x.sparks)), x.sparks.visible = !0;
    const b = x.sparks.geometry.attributes.position;
    for (let R = 0; R < 3; R++) {
      let P = Math.random() * Math.PI * 2, ae = Math.cos(P) * 1.3, le = 0.3, ie = Math.sin(P) * 1.3;
      for (let ue = 0; ue < 6; ue++) {
        P += (Math.random() - 0.3) * 1.2;
        const Ge = Math.cos(P) * (1.1 + Math.random() * 0.6), Xe = le + 0.7 + Math.random() * 0.4, Ze = Math.sin(P) * (1.1 + Math.random() * 0.6), We = (R * 6 + ue) * 2;
        b.setXYZ(We, ae, le, ie), b.setXYZ(We + 1, Ge, Xe, Ze), ae = Ge, le = Xe, ie = Ze;
      }
    }
    b.needsUpdate = !0;
  }
  let Mr = !1, La = 0;
  const Tn = 4, Kt = r * Tn, An = a * Tn, Es = new Float32Array(Kt * An), Da = new Uint8Array(Kt * An), Mi = new Ta(Da, Kt, An, 1028, 1009);
  Mi.magFilter = 1006, Mi.minFilter = 1006, Mi.needsUpdate = !0;
  const Ua = Fi;
  Fi.uSight.value = Mi, Fi.uSightOn.value = 0, Fi.uSightSize.value.set(o, c);
  const Na = new Uint8Array(Kt * An), yr = new Uint8Array(Kt * An), Fa = (x) => {
    const L = [];
    for (let b = Math.max(0, Math.floor((x.cx - x.hx) * Tn)); b < Math.min(Kt, Math.ceil((x.cx + x.hx) * Tn)); b++)
      for (let R = Math.max(0, Math.floor((x.cy - x.hy) * Tn)); R < Math.min(An, Math.ceil((x.cy + x.hy) * Tn)); R++) L.push(R * Kt + b);
    return L;
  };
  for (const x of t.sight || []) for (const L of Fa(x)) Na[L] = 1;
  const zc = new Map((t.door_sight || []).map((x) => [x.id, Fa(x)]));
  let Ts = /* @__PURE__ */ new Set();
  function Ba() {
    yr.set(Na);
    for (const [x, L] of zc) if (!Ts.has(x)) for (const b of L) yr[b] = 1;
  }
  Ba();
  function Gc(x) {
    const L = new Set(x || []);
    L.size === Ts.size && [...L].every((b) => Ts.has(b)) || (Ts = L, Ba());
  }
  function Hc(x) {
    !x || x.userData.sight || x.userData.noSight || x.isLineBasicMaterial || x.isSpriteMaterial || (x.userData.sight = !0, x.onBeforeCompile = (L) => {
      Object.assign(L.uniforms, Ua), L.vertexShader = `varying vec2 vSightXZ;
` + L.vertexShader.replace(
        "#include <project_vertex>",
        `#include <project_vertex>
  vSightXZ = (modelMatrix * vec4(transformed, 1.0)).xz;`
      ), L.fragmentShader = `uniform sampler2D uSight;
uniform float uSightOn;
uniform vec2 uSightSize;
varying vec2 vSightXZ;
` + L.fragmentShader.replace("#include <dithering_fragment>", `#include <dithering_fragment>
  if (uSightOn > 0.5) { float sv = texture2D(uSight, vSightXZ / uSightSize).r; gl_FragColor.rgb *= mix(vec3(0.2, 0.23, 0.34), vec3(1.0), sv); }`);
    }, x.customProgramCacheKey = () => "sight1", x.needsUpdate = !0);
  }
  let Oa = 0;
  function Vc() {
    d.traverse((x) => {
      !x.material || x.userData.noSight || (Array.isArray(x.material) ? x.material : [x.material]).forEach(Hc);
    });
  }
  function ka() {
    if (i && D && D.dead > 0 && B != null) {
      const x = He.get(B);
      if (x && x.actor) return { x: x.actor.root.position.x / qe, y: x.actor.root.position.z / qe };
    }
    return D;
  }
  function Wc() {
    const x = ka(), L = Mr && !!x && !!D.team;
    Ua.uSightOn.value = L ? 1 : 0;
    const b = performance.now();
    if (b - Oa > 700 && (Oa = b, Vc()), !L || b - La < 100) return;
    La = b, Es.fill(0);
    const R = t.view || 18, P = 5, ae = 720, le = 0.12, ie = (ue, Ge, Xe) => {
      const Ze = Math.floor(ue * Tn), We = Math.floor(Ge * Tn);
      if (Ze < 0 || We < 0 || Ze >= Kt || We >= An) return;
      const dt = We * Kt + Ze;
      Xe > Es[dt] && (Es[dt] = Xe);
    };
    for (let ue = 0; ue < ae; ue++) {
      const Ge = ue / ae * Math.PI * 2, Xe = Math.cos(Ge), Ze = Math.sin(Ge);
      let We = -1;
      for (let dt = 0; dt <= R; dt += le) {
        const Tt = x.x + Xe * dt, Dt = x.y + Ze * dt;
        T(Tt, Dt) < 0 && We < 0 && (We = 1);
        const ln = dt < R - P ? 1 : Math.max(0, (R - dt) / P);
        if (ie(Tt, Dt, ln), We >= 0) {
          if (We-- === 0) break;
          continue;
        }
        const Vt = Math.floor(Tt * Tn), mn = Math.floor(Dt * Tn);
        Vt >= 0 && mn >= 0 && Vt < Kt && mn < An && yr[mn * Kt + Vt] && (We = 3);
      }
    }
    for (let ue = 0; ue < An; ue++)
      for (let Ge = 0; Ge < Kt; Ge++) {
        let Xe = 0, Ze = 0;
        for (let We = -1; We <= 1; We++) for (let dt = -1; dt <= 1; dt++) {
          const Tt = Ge + dt, Dt = ue + We;
          Tt >= 0 && Dt >= 0 && Tt < Kt && Dt < An && (Xe += Es[Dt * Kt + Tt], Ze++);
        }
        Da[ue * Kt + Ge] = Math.round(Xe / Ze * 255);
      }
    Mi.needsUpdate = !0;
  }
  let Ln = null;
  function Xc(x) {
    W && (Ln && (d.remove(Ln), Ln.geometry.dispose(), Ln = null), x > 0 && (Ln = new Le(
      new pi(t.pad.r * qe - 0.7, t.pad.r * qe + 0.4, 48, 1, Math.PI / 2, -Math.PI * 2 * x),
      new At({ color: 2278750, side: 2, transparent: !0, opacity: 0.95, depthWrite: !1 })
    ), Ln.userData.noSight = !0, Ln.rotation.x = -Math.PI / 2, Ln.position.copy(F(t.pad.cx, t.pad.cy, 0.12)), d.add(Ln)));
  }
  const qc = { laugh: "🤣", taunt: "😜", wave: "👋", angry: "😡", cool: "😎" }, za = { 1: "laugh", 2: "taunt", 3: "wave", 4: "angry", 5: "cool", c: "teabag" };
  function jc(x, L) {
    const b = He.get(x);
    if (!b || !b.actor || b.hidden && x !== Te) return !1;
    const R = performance.now() / 1e3;
    return L === "teabag" ? b.crouchUntil = R + 0.28 : b.emote = { e: qc[L] || "❓", born: R }, !0;
  }
  let Sr = null;
  function Yc() {
    u = !0, Fi.uSight.value === Mi && (Fi.uSightOn.value = 0), cancelAnimationFrame(Ce), oe.disconnect(), window.removeEventListener("keydown", Qi), window.removeEventListener("keyup", es), window.removeEventListener("blur", ti), window.removeEventListener("pointerup", Y), window.removeEventListener("pointercancel", Y), h.domElement.removeEventListener("pointermove", Se), h.domElement.removeEventListener("pointerdown", Be), h.dispose(), h.forceContextLoss(), h.domElement.remove();
  }
  return {
    setPlayers: vt,
    correct: ze,
    clear: w,
    dispose: Yc,
    mapKey: t.key,
    onArrest(x) {
      ct = x;
    },
    arrestNow: lt,
    focus() {
      h.domElement.focus();
    },
    onMove(x) {
      cn = x;
    },
    onRelease(x) {
      Ct = x;
    },
    releaseGrab: ot,
    fireTaser: ei,
    onShot(x) {
      nn = x;
    },
    onEmote(x) {
      Sr = x;
    },
    setPad: Xc,
    setOpenDoors: Gc,
    setPickups: vr,
    events: wt,
    setPhase(x) {
      ge = x, Mr = x === "countdown" || x === "playing" || x === "buy";
    },
    setSpectate(x) {
      B = x;
    },
    onSpectate(x) {
      mt = x;
    },
    abilityState() {
      const x = performance.now() / 1e3, L = D && D.team;
      if (i) {
        const b = Ee();
        return D && De() ? { kind: "gun", name: b.name, ammo: D.ammo, ready: Math.max(0, ke - x), cooldown: b.cooldown } : { kind: null };
      }
      return L === "cop" ? { kind: "taser", ready: Math.max(0, Qn - x), cooldown: t.taser.cooldown, active: !1 } : L === "thief" ? { kind: "run", stamina: (D.stamina ?? t.run.stamina) / t.run.stamina, active: Pn, exhausted: !!D.exhausted } : { kind: null };
    },
    onFrame(x) {
      we = x;
    }
  };
}
export {
  pg as createRoomScene
};
