import React from "react";
import { useAppState } from "../../state/AppStateContext.jsx";
import Dealer from "../../components/Dealer.jsx";
import ActivePlayers from "../../components/ActivePlayers.jsx";
import RecommendationPanel from "../../components/RecommendationPanel.jsx";

// Mobile is player-focused: the camera overview lives on desktop only.
// Order here matches the spec — recommendation first (what the player
// needs the instant they open the app), then dealer + their own hand
// underneath, with "your hand" given the most room since that's what
// they'll actually be looking at while at the table.
export default function MobileCurrentHand() {
  const { selectedSeat } = useAppState();

  return (
    <div className="hlo-page" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <RecommendationPanel mobile />

      <div className="hlo-panel">
        <div className="hlo-panel__body" style={{ display: "flex", justifyContent: "center" }}>
          <Dealer compact />
        </div>
      </div>

      <div className="hlo-panel" style={{ flex: 1 }}>
        <div className="hlo-panel__header">
          <h3 className="hlo-panel__title" style={{ fontSize: "1.1rem" }}>
            Your hand
          </h3>
        </div>
        <div className="hlo-panel__body" style={{ padding: "16px 12px 24px" }}>
          {selectedSeat ? (
            <ActivePlayers onlySeat={selectedSeat} hideLabel large />
          ) : (
            <p style={{ color: "var(--white-faint)" }}>Select a seat to see your hand here.</p>
          )}
        </div>
      </div>
    </div>
  );
}
