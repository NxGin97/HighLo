import React from "react";
import { parseCard, SUIT_SYMBOL, RED_SUITS } from "./Card.jsx";
import { useAppState } from "../state/AppStateContext.jsx";

function tagColor(v) {
  if (v > 0) return "var(--confidence-high)";
  if (v < 0) return "var(--red-bright)";
  return "var(--white-faint)";
}

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

        {isCountHistoryVisible ? (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              maxHeight: compact ? 120 : 220,
              overflowY: "auto",
            }}
          >
            {rows.map((entry, i) => {
              const { rank, suit } = parseCard(entry.card);
              const isRed = RED_SUITS.includes(suit);
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: 6,
                    padding: "4px 8px",
                    fontSize: "0.78rem",
                  }}
                >
                  <span style={{ color: isRed ? "var(--red-bright)" : "var(--white)", fontWeight: 700 }}>
                    {rank}
                    {SUIT_SYMBOL[suit]}
                  </span>
                  <span style={{ color: tagColor(entry.value), fontFamily: "var(--font-mono)" }}>
                    {entry.value > 0 ? `+${entry.value}` : entry.value}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: "var(--white-faint)", fontSize: "0.8rem" }}>
            Count history hidden — practicing mental counting.
          </p>
        )}
      </div>
    </div>
  );
}
