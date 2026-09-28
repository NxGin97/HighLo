import React from "react";
import { Navigate, Link } from "react-router-dom";
import { useAppState } from "../state/AppStateContext.jsx";
import { useIsMobile } from "../hooks.js";
import CameraFeed from "../components/CameraFeed.jsx";
import ActivePlayers from "../components/ActivePlayers.jsx";
import RecommendationPanel from "../components/RecommendationPanel.jsx";
import CountHistory from "../components/CountHistory.jsx";

export default function MasterView() {
  const { players, selectedSeat, isGuest } = useAppState();
  const isMobile = useIsMobile();

  // Spec: "The desktop Master View is removed" on mobile — send phones to
  // their dedicated Current Hand screen instead of squeezing this in.
  if (isMobile) return <Navigate to="/hand" replace />;

  const selfPlayer = players.find((p) => p.seat === selectedSeat);
  const isSelfTurn = selfPlayer ? selfPlayer.isTurn : false;

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
            <ActivePlayers />
          </div>
        </div>

        <RecommendationPanel isViewerTurn={isSelfTurn} viewerIsGuest={isGuest} />

        <div>
          <CountHistory maxRows={8} />
        </div>
      </div>

    </div>
  );
}
