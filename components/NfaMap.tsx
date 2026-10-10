"use client";

import { useState, type PointerEvent } from "react";
import { BUCKETS, ITEMS, NFA, STATUSES, TONE, bucket, type Row } from "@/lib/nfa";
import type { MapState } from "@/lib/us-map"; // type only: the atlas stays on the server

const W = 975, H = 610; // us-atlas Albers USA extent
const MODES = ["Overall", ...ITEMS] as const;
type Mode = (typeof MODES)[number];

const ROWS = new Map(NFA.map((r) => [r.state, r]));
const DC = "District of Columbia";
const level = (r: Row, mode: Mode) => (mode === "Overall" ? bucket(r) : r.items[ITEMS.indexOf(mode)]);

// Tooltip anchor as a percent of the map box, so it scales with the SVG.
type Tip = { row: Row; x: number; y: number };

export default function NfaMap({ states }: { states: MapState[] }) {
  const [mode, setMode] = useState<Mode>("Overall");
  const [tip, setTip] = useState<Tip | null>(null);
  const active = tip && states.find((s) => s.name === tip.row.state);
  const dc = states.find((s) => s.name === DC);

  const atPointer = (e: PointerEvent<SVGElement>, row: Row) => {
    const r = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
    setTip({ row, x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };

  const shape = (s: MapState) => {
    const row = ROWS.get(s.name)!;
    return {
      style: { fill: TONE[level(row, mode)] },
      tabIndex: 0,
      role: "img",
      "aria-label": `${row.state}: ${bucket(row)}. ${ITEMS.map((it, i) => `${it} ${row.items[i]}`).join(", ")}.`,
      onPointerEnter: (e: PointerEvent<SVGElement>) => atPointer(e, row),
      onPointerMove: (e: PointerEvent<SVGElement>) => atPointer(e, row),
      // Touch fires pointerleave right after the tap; keep the tooltip until the next tap or blur.
      onPointerLeave: (e: PointerEvent<SVGElement>) => e.pointerType === "mouse" && setTip(null),
      onFocus: () => setTip({ row, x: (s.x / W) * 100, y: (s.y / H) * 100 }),
      onBlur: () => setTip(null),
    };
  };

  return (
    <div className="nfa">
      <div className="nfa-modes" role="group" aria-label="Color the map by">
        {MODES.map((m) => (
          <button key={m} type="button" aria-pressed={m === mode} onClick={() => setMode(m)}>
            {m}
          </button>
        ))}
      </div>

      <div className="nfa-map">
        {/* Tapping the ocean closes the tooltip. */}
        <svg viewBox={`0 0 ${W} ${H}`} onPointerDown={(e) => e.target === e.currentTarget && setTip(null)}>
          {states.map((s) => (
            <path key={s.name} d={s.d} {...shape(s)} />
          ))}
          {active && <path d={active.d} className="on" style={{ fill: "none" }} pointerEvents="none" />}
          {/* DC is a few pixels wide; give it a marker big enough to hover and tap. */}
          {dc && <circle cx={dc.x} cy={dc.y} r={7} className={active === dc ? "on" : undefined} {...shape(dc)} />}
        </svg>

        {tip && (
          <div
            className="nfa-tip"
            style={{
              left: `${tip.x}%`,
              top: `${tip.y}%`,
              // Shifting by the anchor's own percent keeps the box inside the map at both edges.
              transform: `translate(-${tip.x}%, ${tip.y < 50 ? "1rem" : "calc(-100% - 1rem)"})`,
            }}
          >
            <strong>{tip.row.state}</strong>
            <p className="nfa-level">
              <i className="nfa-swatch" style={{ background: TONE[bucket(tip.row)] }} />
              {bucket(tip.row)}
            </p>
            <ul>
              {ITEMS.map((it, i) => (
                <li key={it}>
                  <i className="nfa-swatch" style={{ background: TONE[tip.row.items[i]] }} />
                  {it}
                  <span>{tip.row.items[i]}</span>
                </li>
              ))}
            </ul>
            <p className="muted">{tip.row.note}</p>
          </div>
        )}
      </div>

      <ul className="nfa-legend">
        {(mode === "Overall" ? BUCKETS : STATUSES)
          .map((l) => [l, NFA.filter((r) => level(r, mode) === l).length] as const)
          .filter(([, n]) => n > 0)
          .map(([l, n]) => (
            <li key={l}>
              <i className="nfa-swatch" style={{ background: TONE[l] }} />
              {l} ({n})
            </li>
          ))}
      </ul>
    </div>
  );
}
