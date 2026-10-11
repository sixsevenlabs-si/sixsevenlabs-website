"use client";

import { useEffect, useRef } from "react";
import { buildFigure, pose, project, BOTTOM_Y, FADE, SPIN_PERIOD } from "@/lib/figure";

const DRAG_RAD_PER_PX = 0.012;

export default function DotFigure({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const fig = buildFigure();
    const world = new Float32Array(fig.count * 3);
    const screen = new Float32Array(fig.count * 3);
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const bodyEnd = fig.ranges.body[1];
    let w = 0, h = 0, raf = 0;
    let yaw = 0.5; // start on a three-quarter view
    let dragging = false, lastX = 0, lastT = 0, dir = 1; // dir: auto-spin follows the last drag direction
    const start = performance.now();

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (t: number) => {
      if (!w || !h) return;
      pose(fig, t, yaw, world);
      project(world, w, h, screen);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = getComputedStyle(canvas).color; // follows the theme every frame
      for (let i = 0; i < fig.count; i++) {
        const near = screen[i * 3 + 2];
        let alpha = 0.3 + 0.7 * near;
        if (i < bodyEnd) {
          const fade = (world[i * 3 + 1] - BOTTOM_Y) / FADE; // dissolve the torso toward the waist cut
          if (fade <= 0) continue;
          if (fade < 1) alpha *= fade;
        }
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(screen[i * 3], screen[i * 3 + 1], 1.4 + 1.6 * near, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const elapsed = () => (performance.now() - start) / 1000;
    const loop = () => {
      const t = elapsed();
      if (!dragging) yaw += (dir * (t - lastT) * 2 * Math.PI) / SPIN_PERIOD;
      lastT = t;
      draw(t);
      raf = requestAnimationFrame(loop);
    };

    // Horizontal drag spins; auto-spin pauses while dragging and resumes the way you last dragged.
    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      if (Math.abs(dx) > 1) dir = dx > 0 ? 1 : -1; // ignore sub-pixel jitter when the pointer lifts
      yaw += dx * DRAG_RAD_PER_PX;
      lastX = e.clientX;
      if (reduceMotion) draw(elapsed());
    };
    const onUp = () => (dragging = false);
    const ac = new AbortController();
    const { signal } = ac;
    canvas.addEventListener("pointerdown", onDown, { signal });
    canvas.addEventListener("pointermove", onMove, { signal });
    canvas.addEventListener("pointerup", onUp, { signal });
    canvas.addEventListener("pointercancel", onUp, { signal });

    const ro = new ResizeObserver(() => {
      resize();
      if (reduceMotion) draw(elapsed());
    });
    ro.observe(canvas); // fires once on observe, which does the initial sizing
    if (reduceMotion) draw(1); // static, but still draggable
    else raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      ac.abort();
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
