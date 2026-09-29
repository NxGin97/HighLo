import React from "react";
import { Navigate, Link } from "react-router-dom";
import { useIsMobile } from "../hooks.js";
import CameraFeed from "../components/CameraFeed.jsx";
import ActivePlayers from "../components/ActivePlayers.jsx";
import Dealer from "../components/Dealer.jsx";
import RecommendationPanel from "../components/RecommendationPanel.jsx";
import CountHistory from "../components/CountHistory.jsx";

export default function MasterView() {
  const isMobile = useIsMobile();

  // Spec: "The desktop Master View is removed" on mobile — send phones to
  // their dedicated Current Hand screen instead of squeezing this in.
  if (isMobile) return <Navigate to="/hand" replace />;

  return (
    <div className="hlo-page">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.6fr 1fr",
          gap: 18,
          alignItems: "start",
        }}
      >
        {/* Left column: live feed, then active players directly beneath it
            in a straight line, then running count beneath that. */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="hlo-panel">
            <div className="hlo-panel__header">
              <h3 className="hlo-panel__title">Live Table Feed</h3>
              <Link to="/table" className="hlo-pill" style={{ textDecoration: "none" }}>
                Expand →
              </Link>
            </div>
            <div className="hlo-panel__body">
              <CameraFeed />
            </div>
          </div>

          <div className="hlo-panel">
            <div className="hlo-panel__header">
              <h3 className="hlo-panel__title">Active Players</h3>
            </div>
            <div className="hlo-panel__body">
              <div style={{ marginBottom: 16 }}>
                <Dealer />
              </div>
              <ActivePlayers />
            </div>
          </div>

          <CountHistory maxRows={8} />
        </div>

        {/* Right column: recommendation, alongside the feed/players/count. */}
        <RecommendationPanel />
      </div>
    </div>
  );
}
