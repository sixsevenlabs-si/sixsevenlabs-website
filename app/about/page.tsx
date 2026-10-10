import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return (
    <section className="page">
      <h1>About</h1>
      <p>
        SixSevenLabs was founded to bridge the gap between AI inference and AI enabled applications.
        Founded by an engineer with tenures at multiple Y Combinator companies and F500 company.
      </p>
      <p>
        Current clients include an EDA software company and a Commercial Real Estate brokerage.
      </p>
      <p>
        Contact: <a href="https://x.com/jackedtechbro">@jackedtechbro</a> on X
      </p>
    </section>
  );
}
