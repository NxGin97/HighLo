import React from "react";
import { useAppState } from "../../state/AppStateContext.jsx";
import Dealer from "../../components/Dealer.jsx";
import ActivePlayers from "../../components/ActivePlayers.jsx";
import RecommendationPanel from "../../components/RecommendationPanel.jsx";

// Mobile is player-focused: the camera overview lives on desktop only.
// A phone at the table just needs the dealer's hand, the player's own
// hand(s), and their recommended move.
export default function MobileCurrentHand() {
  const { selectedSeat } = useAppState();

  return (
    <div className="hlo-page" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: "1.5rem", margin: 0 }}>Current Hand</h1>

      <div className="hlo-panel">
        <div className="hlo-panel__body">
          <Dealer compact />
        </div>
      </div>

      <RecommendationPanel compact />

      <div className="hlo-panel">
        <div className="hlo-panel__header">
          <h3 className="hlo-panel__title" style={{ fontSize: "1.05rem" }}>
            Your hand
          </h3>
        </div>
        <div className="hlo-panel__body">
          {selectedSeat ? (
            <ActivePlayers compact onlySeat={selectedSeat} />
          ) : (
            <p style={{ color: "var(--white-faint)" }}>Select a seat to see your hand here.</p>
          )}
        </div>
      </div>
    </div>
  );
}
