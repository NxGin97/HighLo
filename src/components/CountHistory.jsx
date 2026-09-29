import React from "react";
import Card from "./Card.jsx";
import { useAppState } from "../state/AppStateContext.jsx";

export default function CountHistory({ compact = false, maxRows }) {
  const { countHistory, shoeStats, recommendation, isCountHistoryVisible, setIsCountHistoryVisible } =
    useAppState();

  const rows = maxRows ? countHistory.slice(-maxRows) : countHistory;

  return (
    <div className="hlo-panel">
      <div className="hlo-panel__header">
        <h3 className="hlo-panel__title">Running Count</h3>
        <button
          className="hlo-btn hlo-btn--ghost"
          style={{ padding: "5px 12px", fontSize: "0.8rem" }}
          onClick={() => setIsCountHistoryVisible((v) => !v)}
        >
          {isCountHistoryVisible ? "Hide" : "Reveal"}
        </button>
      </div>
      <div className="hlo-panel__body">
        <div style={{ display: "flex", gap: 24, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: "0.7rem", color: "var(--white-faint)" }}>Running count</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem" }}>
              {recommendation.runningCount}
            </div>
          </div>
          <div>
            <div style={{ fontSize: "0.7rem", color: "var(--white-faint)" }}>Hands since shuffle</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "2rem" }}>
              {shoeStats.handsSinceShuffle}
            </div>
          </div>
        </div>

        {!isCountHistoryVisible && (
          <p style={{ color: "var(--white-faint)", fontSize: "0.8rem", marginBottom: 10 }}>
            Cards hidden — practicing mental counting.
          </p>
        )}

        <div
          className="hlo-card-row"
          style={{ maxHeight: compact ? 130 : 240, overflowY: "auto", paddingBottom: 2 }}
        >
          {rows.map((entry, i) => (
            <Card
              key={i}
              code={entry.card}
              variant="count"
              size="sm"
              countValue={entry.value}
              hidden={!isCountHistoryVisible}
              animate={false}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
