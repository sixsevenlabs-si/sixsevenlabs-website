// Procedural dot-figure: a muscled upper body doing the "6-7" gesture while spinning. Pure math, no DOM.
// ponytail: capsule+blob figure; swap for three.js + point-sampled GLB if a realistic silhouette is wanted

export type Vec3 = [number, number, number];
export type Range = [start: number, end: number];

export type Figure = {
  /** xyz triples. Body points are rest-pose world space; arm points are local to their elbow. */
  pts: Float32Array;
  count: number;
  ranges: { body: Range; lArm: Range; rArm: Range };
  elbows: { l: Vec3; r: Vec3 };
};

export const GESTURE_PERIOD = 1.1; // seconds per up/down cycle
export const SPIN_PERIOD = 20; // seconds per full turn when not being dragged
export const BOTTOM_Y = 1.0; // waist cut; the renderer fades body points out toward it
export const FADE = 0.12; // metres over which that fade happens
const ARM_AMP = (25 * Math.PI) / 180; // forearm pitch about the elbow
const ROLL_AMP = 0.035; // rad, slight weight shift in phase with the hands
const CAM_Z = 4;
const LOOK_Y = 1.4;
const FIT_HEIGHT = 0.86; // metres mapped onto 96% of the canvas height
const FIT_HALF_WIDTH = 0.62; // metres mapped onto half the canvas width (hands sweep a wide circle)

/** Points on the side of a tapered tube from a to b. `flat` squashes the cross-section's second axis. */
function tube(out: number[], rand: () => number, a: Vec3, b: Vec3, ra: number, rb: number, n: number, flat = 1) {
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
  const len = Math.hypot(dx, dy, dz);
  const ax = dx / len, ay = dy / len, az = dz / len;
  // u ⟂ axis: axis × z, or axis × x when the axis is (near) z
  let ux = ay, uy = -ax, uz = 0;
  if (Math.hypot(ux, uy) < 1e-6) { ux = 0; uy = az; uz = -ay; }
  const ul = Math.hypot(ux, uy, uz);
  ux /= ul; uy /= ul; uz /= ul;
  const vx = ay * uz - az * uy, vy = az * ux - ax * uz, vz = ax * uy - ay * ux;
  for (let i = 0; i < n; i++) {
    const t = rand(), th = rand() * 2 * Math.PI, r = ra + (rb - ra) * t;
    const cu = Math.cos(th) * r, cv = Math.sin(th) * r * flat;
    out.push(
      a[0] + dx * t + ux * cu + vx * cv,
      a[1] + dy * t + uy * cu + vy * cv,
      a[2] + dz * t + uz * cu + vz * cv,
    );
  }
}

/** Points on the surface of an ellipsoid. */
function blob(out: number[], rand: () => number, c: Vec3, rx: number, ry: number, rz: number, n: number) {
  for (let i = 0; i < n; i++) {
    const u = 1 - 2 * rand(), ph = rand() * 2 * Math.PI, q = Math.sqrt(1 - u * u);
    out.push(c[0] + rx * q * Math.cos(ph), c[1] + ry * u, c[2] + rz * q * Math.sin(ph));
  }
}

export function buildFigure(): Figure {
  const rand = Math.random;
  const body: number[] = [];
  blob(body, rand, [0, 1.68, 0], 0.105, 0.125, 0.11, 150); // head
  tube(body, rand, [0, 1.45, 0], [0, 1.57, 0], 0.065, 0.06, 30); // thick neck
  blob(body, rand, [0, 1.5, -0.01], 0.23, 0.06, 0.09, 90); // traps
  tube(body, rand, [0, BOTTOM_Y - 0.02, 0], [0, 1.3, 0], 0.17, 0.235, 190, 0.6); // waist → chest, V taper
  tube(body, rand, [0, 1.3, 0], [0, 1.47, 0], 0.235, 0.25, 130, 0.6); // upper chest
  for (const s of [-1, 1]) {
    blob(body, rand, [s * 0.17, 1.27, -0.05], 0.07, 0.12, 0.07, 50); // lat
    blob(body, rand, [s * 0.28, 1.44, 0], 0.095, 0.085, 0.09, 75); // deltoid
    // upper arm swells to a biceps peak mid-way, then tapers into the elbow
    tube(body, rand, [s * 0.3, 1.42, 0.01], [s * 0.325, 1.31, 0.05], 0.075, 0.09, 50);
    tube(body, rand, [s * 0.325, 1.31, 0.05], [s * 0.34, 1.21, 0.08], 0.09, 0.058, 50);
  }
  // Forearm + hand in elbow-local space: +z is forward, hand is a flat palm-up disc.
  const arm = () => {
    const a: number[] = [];
    tube(a, rand, [0, 0, 0], [0, 0, 0.1], 0.058, 0.066, 30); // forearm, thick near the elbow
    tube(a, rand, [0, 0, 0.1], [0, 0, 0.27], 0.066, 0.04, 55); // tapering to the wrist
    blob(a, rand, [0, 0, 0.33], 0.05, 0.014, 0.065, 60); // hand
    return a;
  };
  const l = arm(), r = arm();
  const nb = body.length / 3, na = l.length / 3;
  return {
    pts: new Float32Array([...body, ...l, ...r]),
    count: nb + 2 * na,
    ranges: { body: [0, nb], lArm: [nb, nb + na], rArm: [nb + na, nb + 2 * na] },
    elbows: { l: [-0.34, 1.21, 0.08], r: [0.34, 1.21, 0.08] },
  };
}

/** World xyz for every point at gesture time t (s) and spin yaw (rad); fills and returns `out`. */
export function pose(fig: Figure, t: number, yaw: number, out: Float32Array): Float32Array {
  const { pts, ranges, elbows } = fig;
  const s = Math.sin((2 * Math.PI * t) / GESTURE_PERIOD);
  const cy = Math.cos(yaw), sy = Math.sin(yaw);
  const roll = ROLL_AMP * s;
  const cr = Math.cos(roll), sr = Math.sin(roll);

  const put = (i: number, x: number, y: number, z: number) => {
    const hy = y - BOTTOM_Y; // roll about z through the waist
    const rx = x * cr - hy * sr;
    const ry = x * sr + hy * cr + BOTTOM_Y;
    out[i * 3] = rx * cy + z * sy; // spin about y
    out[i * 3 + 1] = ry;
    out[i * 3 + 2] = -rx * sy + z * cy;
  };
  const arm = ([a, b]: Range, e: Vec3, pitch: number) => {
    const c = Math.cos(pitch), sn = Math.sin(pitch); // pitch > 0 lowers the hand
    for (let i = a; i < b; i++) {
      const x = pts[i * 3], y = pts[i * 3 + 1], z = pts[i * 3 + 2];
      put(i, e[0] + x, e[1] + y * c - z * sn, e[2] + y * sn + z * c);
    }
  };

  for (let i = ranges.body[0]; i < ranges.body[1]; i++) put(i, pts[i * 3], pts[i * 3 + 1], pts[i * 3 + 2]);
  arm(ranges.lArm, elbows.l, -ARM_AMP * s);
  arm(ranges.rArm, elbows.r, ARM_AMP * s);
  return out;
}

/** Perspective-project world xyz to (screenX, screenY, nearness 0..1) triples in CSS pixels. */
export function project(world: Float32Array, w: number, h: number, out: Float32Array): Float32Array {
  const k0 = Math.min((h * 0.96) / FIT_HEIGHT, (w * 0.5) / FIT_HALF_WIDTH); // px per metre at z = 0
  const cx = w / 2, cy = h / 2;
  for (let i = 0; i < world.length / 3; i++) {
    const x = world[i * 3], y = world[i * 3 + 1], z = world[i * 3 + 2];
    const k = (k0 * CAM_Z) / (CAM_Z - z);
    out[i * 3] = cx + x * k;
    out[i * 3 + 1] = cy - (y - LOOK_Y) * k;
    out[i * 3 + 2] = Math.min(1, Math.max(0, z + 0.5));
  }
  return out;
}
