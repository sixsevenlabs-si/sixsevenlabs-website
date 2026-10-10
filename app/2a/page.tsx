import type { Metadata } from "next";
import NfaMap from "@/components/NfaMap";
import { CHECKED, ITEMS, NFA, TONE } from "@/lib/nfa";
import { STATES } from "@/lib/us-map";

export const metadata: Metadata = { title: "2A" };

export default function TwoAPage() {
  return (
    <section className="page">
      <h1>
        2A
        <span className="by">by SixSevenLabs</span>
      </h1>

      <h2>NFA items by state</h2>
      <p className="muted">
        Suppressors, SBRs, SBSs and AOWs: does state law still depend on federal NFA registration? Hover or tap a
        state.
      </p>
      <NfaMap states={STATES} />

      <details className="nfa-table">
        <summary>View as table</summary>
        <div className="nfa-scroll">
          <table>
            <thead>
              <tr>
                <th>State</th>
                {ITEMS.map((it) => (
                  <th key={it}>{it}</th>
                ))}
                <th>Tied</th>
                <th>What state law says</th>
              </tr>
            </thead>
            <tbody>
              {NFA.map((r) => (
                <tr key={r.state}>
                  <th scope="row">{r.state}</th>
                  {r.items.map((s, i) => (
                    <td key={ITEMS[i]}>
                      <i className="nfa-swatch" style={{ background: TONE[s] }} />
                      {s}
                    </td>
                  ))}
                  <td>{r.tied ? "Yes" : "No"}</td>
                  <td>{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      <p className="muted nfa-foot">
        “Tied” means state legality of at least one item depends on federal NFA registration. Last checked {CHECKED}.
        Not legal advice. Verify before relying on it.
      </p>
    </section>
  );
}
