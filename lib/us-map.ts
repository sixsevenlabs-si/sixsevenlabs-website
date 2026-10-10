// US state outlines as SVG paths, from us-atlas's pre-projected (Albers USA, 975×610) TopoJSON.
// Server-only: the page renders the paths, so the atlas never ships to the client.
import us from "us-atlas/states-albers-10m.json" with { type: "json" };

type Topo = {
  transform: { scale: [number, number]; translate: [number, number] };
  arcs: [number, number][][];
  objects: { states: { geometries: { type: "Polygon" | "MultiPolygon"; arcs: number[][] | number[][][]; properties: { name: string } }[] } };
};
const topo = us as unknown as Topo;

// Arcs are quantized and delta-encoded.
const { scale: [kx, ky], translate: [tx, ty] } = topo.transform;
const arcs = topo.arcs.map((arc) => {
  let x = 0, y = 0;
  return arc.map(([dx, dy]) => [(x += dx) * kx + tx, (y += dy) * ky + ty]);
});

// Index ~i means arc i reversed; consecutive arcs share their join point.
const ring = (ids: number[]) => ids.flatMap((i, k) => (i < 0 ? arcs[~i].toReversed() : arcs[i]).slice(k ? 1 : 0));

// The western Aleutians project to x < 0 and fall outside the viewBox, as in every Albers USA map.
export const STATES = topo.objects.states.geometries.map(({ type, arcs: a, properties }) => {
  const rings = (type === "Polygon" ? a : a.flat()) as number[][];
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const d = rings
    .map((ids) => {
      const pts = ring(ids).map(([x, y]) => {
        x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      });
      return `M${pts.join("L")}Z`;
    })
    .join("");
  // Bbox center: anchors the tooltip on keyboard focus and places the DC marker.
  return { name: properties.name, d, x: (x0 + x1) / 2, y: (y0 + y1) / 2 };
});

export type MapState = (typeof STATES)[number];
