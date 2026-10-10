import type { Metadata } from "next";

export const metadata: Metadata = { title: "Fitness" };

export default function FitnessPage() {
  return (
    <section className="page">
      <h1>
        Fitness
        <span className="by">by SixSevenLabs</span>
      </h1>
      <p className="muted">Coming soon.</p>
    </section>
  );
}
