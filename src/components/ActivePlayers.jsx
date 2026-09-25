import React, { useState } from "react";
import Card, { CardRow, RANKS, SUITS, handValue } from "./Card.jsx";
import { useAppState } from "../state/AppStateContext.jsx";

const CONFIDENCE_LABEL = { high: "High", medium: "Medium", low: "Low" };

function CorrectionModal({ onClose, onPick }) {
  const [mode, setMode] = useState(null); // "rank" | "suit" | "unknown"

  return (
    <div
      role="dialog"
      aria-label="Correct card"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(8,10,9,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100,
      }}
      onClick={onClose}
    >
      <div
        className="hlo-panel"
        style={{ width: 320, maxWidth: "90vw" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="hlo-panel__header">
          <h3 className="hlo-panel__title" style={{ fontSize: "1.1rem" }}>
            Correct card
          </h3>
          <button className="hlo-btn hlo-btn--ghost" style={{ padding: "4px 10px" }} onClick={onClose}>
            Close
          </button>
        </div>
        <div className="hlo-panel__body">
          {!mode && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button className="hlo-btn hlo-btn--ghost" onClick={() => setMode("rank")}>
                Incorrect rank
              </button>
              <button className="hlo-btn hlo-btn--ghost" onClick={() => setMode("suit")}>
                Incorrect suit
              </button>
              <button
                className="hlo-btn hlo-btn--ghost"
                onClick={() => {
                  onPick(null);
                  onClose();
                }}
              >
                Mark as unknown card
              </button>
            </div>
          )}
          {mode === "rank" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
              {RANKS.map((r) => (
                <button
                  key={r}
                  className="hlo-btn hlo-btn--ghost"
                  style={{ padding: "8px 0" }}
                  onClick={() => {
                    onPick({ type: "rank", value: r });
                    onClose();
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          )}
          {mode === "suit" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
              {SUITS.map((s) => (
                <button
                  key={s}
                  className="hlo-btn hlo-btn--ghost"
                  style={{ padding: "8px 0" }}
                  onClick={() => {
                    onPick({ type: "suit", value: s });
                    onClose();
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PlayerSeat({ player, isSelf, compact }) {
  const { localCorrections, correctCard } = useAppState();
  const [editing, setEditing] = useState(null); // { handIndex, cardIndex, code }

  const confidence = player.confidence || "low";

  function resolvedCard(handIndex, cardIndex, code) {
    const key = `${player.seat}-${handIndex}-${cardIndex}`;
    return localCorrections[key] || code;
  }

  function applyCorrection(pick) {
    if (!editing) return;
    const { handIndex, cardIndex, code } = editing;
    if (pick === null) {
      correctCard(player.seat, handIndex, cardIndex, "??");
      return;
    }
    const current = resolvedCard(handIndex, cardIndex, code);
    const currentRank = current.slice(0, -1) === "10" ? "10" : current.slice(0, -1);
    const currentSuit = current.slice(-1);
    const next =
      pick.type === "rank" ? `${pick.value}${currentSuit}` : `${currentRank}${pick.value}`;
    correctCard(player.seat, handIndex, cardIndex, next);
  }

  if (!player.occupied) {
    return (
      <div
        className="hlo-panel"
        style={{
          opacity: 0.35,
          padding: compact ? 10 : 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: compact ? 72 : 96,
        }}
      >
        <span style={{ fontSize: "0.8rem", color: "var(--white-faint)" }}>
          Seat {player.seat} — vacant
        </span>
      </div>
    );
  }

  return (
    <div
      className="hlo-panel"
      style={{
        padding: compact ? 10 : 14,
        opacity: player.isTurn ? 1 : 0.55,
        border: player.isTurn
          ? "1px solid var(--brass)"
          : isSelf
          ? "1px solid rgba(244,242,234,0.4)"
          : undefined,
        transition: "opacity 0.2s ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>
          Seat {player.seat}
          {isSelf ? " (you)" : ""}
        </span>
        <span
          className="hlo-pill"
          style={{ gap: 5 }}
          title={`Detection confidence: ${CONFIDENCE_LABEL[confidence]}`}
        >
          <span className={`hlo-confidence-dot hlo-confidence-dot--${confidence}`} />
          {CONFIDENCE_LABEL[confidence]}
        </span>
      </div>

      {player.hands.map((hand, hIdx) => {
        const resolvedCards = hand.cards.map((c, i) => resolvedCard(hIdx, i, c));
        return (
          <div key={hIdx} style={{ marginBottom: hIdx < player.hands.length - 1 ? 10 : 0 }}>
            {hand.isSplit && (
              <div style={{ fontSize: "0.68rem", color: "var(--white-faint)", marginBottom: 4 }}>
                Split hand {hIdx + 1}
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <CardRow
                cards={resolvedCards}
                size={compact ? "sm" : "md"}
                onCardClick={(cardIndex, code) => setEditing({ handIndex: hIdx, cardIndex, code })}
              />
              <span style={{ fontFamily: "var(--font-display)", fontSize: compact ? "1.1rem" : "1.4rem" }}>
                {handValue(resolvedCards)}
              </span>
            </div>
          </div>
        );
      })}

      {player.lastAction && !compact && (
        <div style={{ marginTop: 8, fontSize: "0.7rem", color: "var(--white-faint)" }}>
          Last action: {player.lastAction}
        </div>
      )}

      {editing && (
        <CorrectionModal onClose={() => setEditing(null)} onPick={applyCorrection} />
      )}
    </div>
  );
}

/**
 * ActivePlayers
 * Grid of up to six seats. `compact` tightens spacing/card size for the
 * mobile "current hand" view where only a couple of seats fit on screen.
 */
export default function ActivePlayers({ compact = false, onlySeat = null }) {
  const { players, selectedSeat } = useAppState();
  const visible = onlySeat ? players.filter((p) => p.seat === onlySeat) : players;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: compact ? "1fr" : "repeat(auto-fit, minmax(150px, 1fr))",
        gap: 10,
      }}
    >
      {visible.map((p) => (
        <PlayerSeat key={p.seat} player={p} isSelf={p.seat === selectedSeat} compact={compact} />
      ))}
    </div>
  );
}
