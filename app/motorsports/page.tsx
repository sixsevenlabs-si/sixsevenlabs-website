import type { Metadata } from "next";

export const metadata: Metadata = { title: "Motorsports" };

export default function MotorsportsPage() {
  return (
    <section className="page">
      <h1>
        Motorsports
        <span className="by">by SixSevenLabs</span>
      </h1>
      <p className="muted">Coming soon.</p>
    </section>
  );
}
