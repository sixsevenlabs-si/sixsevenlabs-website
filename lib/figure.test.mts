import { test } from "node:test";
import assert from "node:assert/strict";
import { buildFigure, pose, project, BOTTOM_Y, GESTURE_PERIOD, type Range } from "./figure.ts";

const fig = buildFigure();
const at = (t: number, yaw = 0) => pose(fig, t, yaw, new Float32Array(fig.count * 3));
const meanY = (w: Float32Array, [a, b]: Range) => {
  let s = 0;
  for (let i = a; i < b; i++) s += w[i * 3 + 1];
  return s / (b - a);
};

test("points are finite and land inside landscape, square and portrait canvases", () => {
  assert.ok(fig.count > 1000);
  for (const [w, h] of [[709, 440], [400, 400], [353, 700]]) {
    for (let yaw = 0; yaw < 2 * Math.PI; yaw += 0.3) {
      const t = yaw * 1.7; // sweeps gesture phase too
      const world = at(t, yaw);
      for (const v of world) assert.ok(Number.isFinite(v));
      const s = project(world, w, h, new Float32Array(fig.count * 3));
      for (let i = 0; i < fig.count; i++) {
        // DotFigure never draws torso points at or below the waist cut, so they may sit at the very edge.
        if (i < fig.ranges.body[1] && world[i * 3 + 1] <= BOTTOM_Y) continue;
        assert.ok(s[i * 3] > 3 && s[i * 3] < w - 3, `x in range at yaw=${yaw} on ${w}x${h}`);
        assert.ok(s[i * 3 + 1] > 3 && s[i * 3 + 1] < h - 3, `y in range at yaw=${yaw} on ${w}x${h}`);
        assert.ok(s[i * 3 + 2] >= 0 && s[i * 3 + 2] <= 1);
      }
    }
  }
});

test("hands alternate: one up while the other is down", () => {
  const rest = at(0);
  const q = at(GESTURE_PERIOD / 4);
  const tq = at((3 * GESTURE_PERIOD) / 4);
  const l0 = meanY(rest, fig.ranges.lArm), r0 = meanY(rest, fig.ranges.rArm);
  assert.ok(meanY(q, fig.ranges.lArm) > l0 + 0.03, "left up at quarter period");
  assert.ok(meanY(q, fig.ranges.rArm) < r0 - 0.03, "right down at quarter period");
  assert.ok(meanY(tq, fig.ranges.lArm) < l0 - 0.03, "left down at three-quarter period");
  assert.ok(meanY(tq, fig.ranges.rArm) > r0 + 0.03, "right up at three-quarter period");
  assert.ok(Math.abs(meanY(q, fig.ranges.body) - meanY(rest, fig.ranges.body)) < 0.01, "body stays put");
});
