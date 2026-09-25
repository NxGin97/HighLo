import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useAppState } from "./state/AppStateContext.jsx";
import { useIsMobile } from "./hooks.js";

import Nav from "./components/Nav.jsx";
import MobileTabBar from "./components/MobileTabBar.jsx";

import Login from "./pages/Login.jsx";
import SeatSelection from "./pages/SeatSelection.jsx";
import MasterView from "./pages/MasterView.jsx";
import TableView from "./pages/TableView.jsx";
import AnalysisView from "./pages/AnalysisView.jsx";
import RunningCountView from "./pages/RunningCountView.jsx";
import MobileCurrentHand from "./pages/mobile/MobileCurrentHand.jsx";
import MobileAnalysis from "./pages/mobile/MobileAnalysis.jsx";
import MobileRunningCount from "./pages/mobile/MobileRunningCount.jsx";

function RequireSession({ children }) {
  const { isAuthenticated, isGuest } = useAppState();
  if (!isAuthenticated && !isGuest) return <Navigate to="/" replace />;
  return children;
}

function RequireSeat({ children }) {
  const { selectedSeat, isAuthenticated, isGuest } = useAppState();
  if (!isAuthenticated && !isGuest) return <Navigate to="/" replace />;
  if (!selectedSeat) return <Navigate to="/seats" replace />;
  return children;
}

// Watches for the camera reporting the user's seat as vacated (they got up)
// and surfaces the required prompt: switch seats or end session.
function VacancyWatcher() {
  const { occupancy, selectedSeat, setSelectedSeat, logout } = useAppState();
  const [showPrompt, setShowPrompt] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (selectedSeat && occupancy[selectedSeat] === false) {
      setShowPrompt(true);
    }
  }, [occupancy, selectedSeat]);

  if (!showPrompt) return null;

  return (
    <div
      role="alertdialog"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(8,10,9,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
      }}
    >
      <div className="hlo-panel" style={{ width: 360, maxWidth: "90vw", padding: 22 }}>
        <h3 style={{ fontFamily: "var(--font-display)", margin: "0 0 8px", letterSpacing: "0.03em" }}>
          Seat appears vacant
        </h3>
        <p style={{ color: "var(--white-dim)", fontSize: "0.88rem" }}>
          The camera no longer detects you at seat {selectedSeat}. Would you like to switch seats or end
          your session?
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <button
            className="hlo-btn hlo-btn--brass"
            style={{ flex: 1 }}
            onClick={() => {
              setShowPrompt(false);
              setSelectedSeat(null);
              navigate("/seats");
            }}
          >
            Switch seats
          </button>
          <button
            className="hlo-btn hlo-btn--ghost"
            style={{ flex: 1 }}
            onClick={() => {
              setShowPrompt(false);
              logout();
              navigate("/");
            }}
          >
            End session
          </button>
        </div>
      </div>
    </div>
  );
}

function DesktopLayout({ children }) {
  return (
    <>
      <Nav />
      {children}
      <VacancyWatcher />
    </>
  );
}

function MobileLayout({ children }) {
  return (
    <>
      {children}
      <MobileTabBar />
      <VacancyWatcher />
    </>
  );
}

export default function App() {
  const isMobile = useIsMobile();
  const Layout = isMobile ? MobileLayout : DesktopLayout;

  return (
    <div className="hlo-app">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/seats"
          element={
            <RequireSession>
              <SeatSelection />
            </RequireSession>
          }
        />

        {/* Desktop dashboard + its three expanded pages */}
        <Route
          path="/master"
          element={
            <RequireSeat>
              <DesktopLayout>
                <MasterView />
              </DesktopLayout>
            </RequireSeat>
          }
        />
        <Route
          path="/table"
          element={
            <RequireSeat>
              <Layout>
                <TableView />
              </Layout>
            </RequireSeat>
          }
        />
        <Route
          path="/analysis"
          element={
            <RequireSeat>
              {isMobile ? (
                <MobileLayout>
                  <MobileAnalysis />
                </MobileLayout>
              ) : (
                <DesktopLayout>
                  <AnalysisView />
                </DesktopLayout>
              )}
            </RequireSeat>
          }
        />
        <Route
          path="/count"
          element={
            <RequireSeat>
              {isMobile ? (
                <MobileLayout>
                  <MobileRunningCount />
                </MobileLayout>
              ) : (
                <DesktopLayout>
                  <RunningCountView />
                </DesktopLayout>
              )}
            </RequireSeat>
          }
        />

        {/* Mobile-only current-hand screen (desktop users get redirected
            away from /master instead of visiting this directly) */}
        <Route
          path="/hand"
          element={
            <RequireSeat>
              <MobileLayout>
                <MobileCurrentHand />
              </MobileLayout>
            </RequireSeat>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
