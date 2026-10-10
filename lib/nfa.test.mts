import { test } from "node:test";
import assert from "node:assert/strict";
import { NFA, STATUSES, bucket } from "./nfa.ts";
import { STATES } from "./us-map.ts";

test("table parses into 51 rows of known statuses", () => {
  assert.equal(NFA.length, 51);
  for (const r of NFA) {
    assert.equal(r.items.length, 4, r.state);
    for (const s of r.items) assert.ok(STATUSES.includes(s), `${r.state}: ${s}`);
    assert.ok(r.note, r.state);
  }
});

// Source counts were 12 / 30 / 9; California moved to tied once its AOW path (PC 17710) was added.
test("overall buckets: 12 free, 31 tied, 7 states + DC banned", () => {
  const n = (b: string) => NFA.filter((r) => bucket(r) === b).length;
  assert.deepEqual([n("No restriction"), n("Tied to registration"), n("Banned")], [12, 31, 8]);
});

test("every row has a map shape and every shape has a row", () => {
  assert.deepEqual(STATES.map((s) => s.name).sort(), NFA.map((r) => r.state).sort());
  for (const s of STATES) {
    assert.match(s.d, /^M[-\d.,LMZ]+Z$/, s.name);
    assert.ok(s.x > 0 && s.x < 975 && s.y > 0 && s.y < 610, s.name);
  }
});
