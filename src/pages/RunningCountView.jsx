import React from "react";
import { useAppState } from "../state/AppStateContext.jsx";
import CountHistory from "../components/CountHistory.jsx";

export default function RunningCountView() {
  const { shoeStats, recommendation } = useAppState();

  return (
    <div className="hlo-page">
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.8rem", letterSpacing: "0.03em", margin: "0 0 4px" }}>
        Running Count
      </h1>
      <p style={{ color: "var(--white-faint)", marginTop: 0, marginBottom: 20 }}>
        Full card history and count progression since the last shuffle.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 14,
          marginBottom: 20,
        }}
      >
        <div className="hlo-panel" style={{ padding: 16 }}>
          <div style={{ fontSize: "0.75rem", color: "var(--white-faint)" }}>True count</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem" }}>{recommendation.trueCount.toFixed(1)}</div>
        </div>
        <div className="hlo-panel" style={{ padding: 16 }}>
          <div style={{ fontSize: "0.75rem", color: "var(--white-faint)" }}>Estimated decks remaining</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem" }}>{shoeStats.decksRemainingEstimate}</div>
        </div>
        <div className="hlo-panel" style={{ padding: 16 }}>
          <div style={{ fontSize: "0.75rem", color: "var(--white-faint)" }}>Last shuffle</div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem" }}>
            {shoeStats.lastShuffleHand === 0 ? "This session" : `Hand ${shoeStats.lastShuffleHand}`}
          </div>
        </div>
      </div>

      <CountHistory />
    </div>
  );
}
