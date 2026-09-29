import React from "react";
import config from "../config.js";
import { useAppState } from "../state/AppStateContext.jsx";

const CONFIDENCE_BORDER = {
  high: "var(--confidence-high)",
  medium: "var(--confidence-medium)",
  low: "var(--confidence-low)",
};

// Rough seat anchor points as a percentage of the frame, arranged around a
// six-seat table. Seat 1 sits on the right of frame and seat 6 on the
// left, matching the dealer's clockwise deal (right-to-left from a
// player's point of view). A real pipeline would replace these with the
// actual detected bounding-box coordinates per seat.
const SEAT_ANCHORS = {
  1: { left: "92%", top: "62%" },
  2: { left: "76%", top: "80%" },
  3: { left: "54%", top: "86%" },
  4: { left: "32%", top: "80%" },
  5: { left: "16%", top: "62%" },
  6: { left: "50%", top: "18%" },
};

export default function CameraFeed({ compact = false }) {
  const { players, selectedSeat, cameraConnected } = useAppState();
  const streamUrl = config.CAMERA_STREAM_URL;

  return (
    <div
      className="hlo-camera"
      style={{
        position: "relative",
        width: "100%",
        aspectRatio: compact ? "16 / 10" : "16 / 9",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        background: streamUrl
          ? "#000"
          : "repeating-linear-gradient(45deg, #4b4d4d, #4b4d4d 10px, #444646 10px, #444646 20px)",
      }}
    >
      {streamUrl ? (
        // Raspberry Pi MJPEG/HLS endpoint plugs in right here.
        <img
          src={streamUrl}
          alt="Live table feed"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 6,
            color: "var(--white-faint)",
          }}
        >
          <span style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", letterSpacing: "0.04em" }}>
            CAMERA FEED OFFLINE
          </span>
          <span style={{ fontSize: "0.78rem" }}>
            Waiting on stream at <code style={{ fontFamily: "var(--font-mono)" }}>CAMERA_STREAM_URL</code>
          </span>
        </div>
      )}

      {/* Bounding boxes + seat labels, overlaid on top of feed or placeholder */}
      {players.map((p) => {
        if (!p.occupied) return null;
        const anchor = SEAT_ANCHORS[p.seat] || { left: "50%", top: "50%" };
        const isSelected = selectedSeat === p.seat;
        return (
          <div
            key={p.seat}
            style={{
              position: "absolute",
              left: anchor.left,
              top: anchor.top,
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            <div
              style={{
                width: compact ? 56 : 84,
                height: compact ? 40 : 58,
                border: `2px solid ${CONFIDENCE_BORDER[p.confidence] || CONFIDENCE_BORDER.low}`,
                borderRadius: 6,
                boxShadow: p.isTurn ? "0 0 0 3px rgba(168,134,63,0.55)" : "none",
                background: "rgba(0,0,0,0.15)",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.65rem",
                padding: "1px 6px",
                borderRadius: 4,
                background: isSelected ? "var(--brass)" : "rgba(27,28,29,0.85)",
                color: isSelected ? "var(--charcoal)" : "var(--white)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              SEAT {p.seat}
              {p.isTurn ? " \u2022 TURN" : ""}
            </span>
          </div>
        );
      })}

      <div
        style={{
          position: "absolute",
          top: 8,
          right: 10,
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: "0.7rem",
          color: "var(--white-dim)",
          background: "rgba(0,0,0,0.4)",
          padding: "3px 8px",
          borderRadius: 999,
        }}
      >
        <span
          className={`hlo-confidence-dot hlo-confidence-dot--${cameraConnected ? "high" : "low"}`}
        />
        {cameraConnected ? "LIVE" : "OFFLINE (MOCK DATA)"}
      </div>
    </div>
  );
}
