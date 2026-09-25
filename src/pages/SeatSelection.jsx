import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../state/AppStateContext.jsx";

export default function SeatSelection() {
  const { occupancy, selectedSeat, setSelectedSeat, isGuest, username } = useAppState();
  const navigate = useNavigate();
  const seats = Object.keys(occupancy).map(Number);

  function pick(seat) {
    if (!occupancy[seat]) return;
    setSelectedSeat(seat);
  }

  return (
    <div
      style={{
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        gap: 24,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", margin: 0, letterSpacing: "0.04em" }}>
          Choose your seat
        </h1>
        <p style={{ color: "var(--white-faint)", marginTop: 4 }}>
          Welcome, {isGuest ? "Guest" : username}. Only seats the camera sees occupied can be selected.
        </p>
      </div>

      {/* Semicircle table layout */}
      <div
        className="hlo-panel"
        style={{
          position: "relative",
          width: 560,
          maxWidth: "94vw",
          height: 340,
          borderRadius: "50% 50% 12px 12px / 60% 60% 12px 12px",
          background: "linear-gradient(180deg, var(--felt-light), var(--felt))",
        }}
      >
        {seats.map((seat, i) => {
          const angle = (Math.PI / (seats.length - 1)) * i;
          const radiusX = 230;
          const radiusY = 130;
          const left = 280 - radiusX * Math.cos(angle);
          const top = 220 - radiusY * Math.sin(angle);
          const occupied = occupancy[seat];
          const isSelected = selectedSeat === seat;
          return (
            <button
              key={seat}
              onClick={() => pick(seat)}
              disabled={!occupied}
              style={{
                position: "absolute",
                left,
                top,
                transform: "translate(-50%, -50%)",
                width: 84,
                height: 84,
                borderRadius: "50%",
                border: isSelected ? "3px solid var(--brass)" : "2px solid rgba(244,242,234,0.3)",
                background: occupied
                  ? isSelected
                    ? "var(--red)"
                    : "var(--charcoal-light)"
                  : "rgba(60,62,61,0.4)",
                color: occupied ? "var(--white)" : "var(--white-faint)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: occupied ? "pointer" : "not-allowed",
                fontWeight: 700,
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>{seat}</span>
              <span style={{ fontSize: "0.6rem", fontWeight: 500 }}>{occupied ? "occupied" : "empty"}</span>
            </button>
          );
        })}
      </div>

      <button
        className="hlo-btn hlo-btn--primary"
        style={{ fontSize: "1rem", padding: "12px 32px" }}
        disabled={!selectedSeat}
        onClick={() => navigate("/master")}
      >
        {selectedSeat ? `Sit at seat ${selectedSeat}` : "Select a seat to continue"}
      </button>
    </div>
  );
}
