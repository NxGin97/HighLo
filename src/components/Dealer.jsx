import React from "react";
import Card, { handValue } from "./Card.jsx";
import { useAppState } from "../state/AppStateContext.jsx";

/**
 * Dealer
 * Shows the dealer's up card plus the hole card (face-down until the round
 * resolves and holeCardKnown flips true). Meant to sit centered above the
 * active-players grid on both the desktop dashboard and the mobile
 * Current Hand screen.
 */
export default function Dealer({ compact = false }) {
  const { dealer } = useAppState();
  const [upCard, holeCard] = dealer.cards;
  const visibleTotal = dealer.holeCardKnown ? handValue(dealer.cards) : handValue([upCard]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <span style={{ fontSize: "0.7rem", letterSpacing: "0.08em", color: "var(--white-faint)", fontWeight: 600 }}>
        DEALER
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div className="hlo-card-row">
          <Card code={upCard} size={compact ? "sm" : "md"} />
          <Card code={holeCard} size={compact ? "sm" : "md"} faceDown={!dealer.holeCardKnown} />
        </div>
        <span style={{ fontFamily: "var(--font-display)", fontSize: compact ? "1.2rem" : "1.5rem" }}>
          {visibleTotal}
          {!dealer.holeCardKnown && (
            <span style={{ fontSize: "0.6rem", color: "var(--white-faint)", fontFamily: "var(--font-body)", marginLeft: 4 }}>
              showing
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
