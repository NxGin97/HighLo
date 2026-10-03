import React from "react";
import { Navigate, Link } from "react-router-dom";
import { useIsMobile } from "../hooks.js";
import { useAppState } from "../state/AppStateContext.jsx";
import CameraFeed from "../components/CameraFeed.jsx";
import ActivePlayers from "../components/ActivePlayers.jsx";
import Dealer from "../components/Dealer.jsx";
import RecommendationPanel from "../components/RecommendationPanel.jsx";
import CountHistory from "../components/CountHistory.jsx";

const TOP_ROW_HEIGHT = 460;

export default function MasterView() {
  const isMobile = useIsMobile();
  const { resolveRoundDemo } = useAppState();

  // Spec: "The desktop Master View is removed" on mobile — send phones to
  // their dedicated Current Hand screen instead of squeezing this in.
  if (isMobile) return <Navigate to="/hand" replace />;

  return (
    <div className="hlo-page">
      {/* Live feed and recommendation, side by side, matched in height. */}
      <div style={{ display: "flex", gap: 18, alignItems: "stretch", height: TOP_ROW_HEIGHT }}>
        <div className="hlo-panel" style={{ flex: "1.6", display: "flex", flexDirection: "column" }}>
          <div className="hlo-panel__header">
            <h3 className="hlo-panel__title">Live Table Feed</h3>
            <Link to="/table" className="hlo-pill" style={{ textDecoration: "none" }}>
              Expand →
            </Link>
          </div>
          <div className="hlo-panel__body" style={{ flex: 1, position: "relative" }}>
            <CameraFeed />
          </div>
        </div>

        <div style={{ flex: "1" }}>
          <RecommendationPanel fillHeight showAnalysis={false} />
        </div>
      </div>

      {/* Active players: one straight, non-wrapping row spanning the full
          width of both panels above, dealer centered above it. */}
      <div className="hlo-panel" style={{ marginTop: 18 }}>
        <div className="hlo-panel__header">
          <h3 className="hlo-panel__title">Active Players</h3>
          <button className="hlo-btn hlo-btn--ghost" style={{ padding: "5px 12px", fontSize: "0.78rem" }} onClick={resolveRoundDemo}>
            Simulate round end
          </button>
        </div>
        <div className="hlo-panel__body">
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <Dealer />
          </div>
          <ActivePlayers />
        </div>
      </div>

      {/* Running count, same full width as the row above. */}
      <div style={{ marginTop: 18 }}>
        <CountHistory masterView />
      </div>
    </div>
  );
}
