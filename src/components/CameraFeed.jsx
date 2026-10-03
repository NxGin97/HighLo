import React from "react";
import config from "../config.js";
import { useAppState } from "../state/AppStateContext.jsx";

const CONFIDENCE_BORDER = {
  high: "var(--confidence-high)",
  medium: "var(--confidence-medium)",
  low: "var(--confidence-low)",
};

// Rough seat anchor points as a percentage of the frame, arranged along a
// single bottom arc. Seat 1 sits on the right of frame and seat 6 on the
// left, matching the dealer's clockwise deal (right-to-left from a
// player's point of view). All six sit on the same arc — none at the
// top-center "dealer" spot, which this view leaves empty, the way an
// overhead table camera actually would. A real pipeline would replace
// these with the actual detected bounding-box coordinates per seat.
// Seats 2 and 5 are nudged down and in toward center (vs. a perfectly
// even arc) so their boxes clear seats 1 and 6 respectively instead of
// overlapping them.
const SEAT_ANCHORS = {
  1: { left: "92%", top: "55%" },
  2: { left: "80%", top: "76%" },
  3: { left: "63%", top: "82%" },
  4: { left: "37%", top: "82%" },
  5: { left: "20%", top: "76%" },
  6: { left: "8%", top: "55%" },
};

// The dealer stands at the top-center of the table, beyond the seats'
// arc — the one spot the seat anchors above deliberately leave empty.
const DEALER_ANCHOR = { left: "50%", top: "16%" };

export default function CameraFeed() {
  const { players, selectedSeat, cameraConnected, dealer } = useAppState();
  const streamUrl = config.CAMERA_STREAM_URL;

  return (
    <div
      className="hlo-camera"
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        containerType: "inline-size",
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

      {/* Dealer's own detection box — the one spot on the arc the seat
          anchors leave empty — so the dealer's hand is visibly tracked
          too, not just the players'. */}
      <div
        style={{
          position: "absolute",
          left: DEALER_ANCHOR.left,
          top: DEALER_ANCHOR.top,
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
        }}
      >
        <div
          className="hlo-camera-box"
          style={{ borderColor: CONFIDENCE_BORDER[dealer.confidence] || CONFIDENCE_BORDER.low }}
        />
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.65rem",
            padding: "1px 6px",
            borderRadius: 4,
            background: "rgba(27,28,29,0.85)",
            color: "var(--white)",
            border: "1px solid rgba(255,255,255,0.15)",
            whiteSpace: "nowrap",
          }}
        >
          DEALER
        </span>
      </div>

      {/* Bounding boxes + seat labels, overlaid on top of feed or placeholder.
          Sized in container-query units (cqw) rather than fixed pixels so
          the box — including its border — shrinks smoothly as the feed
          itself shrinks, instead of staying put and looking oversized. */}
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
              className="hlo-camera-box"
              style={{
                borderColor: CONFIDENCE_BORDER[p.confidence] || CONFIDENCE_BORDER.low,
                boxShadow: p.isTurn ? "0 0 0 3px rgba(168,134,63,0.55)" : "none",
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
                whiteSpace: "nowrap",
              }}
            >
              SEAT {p.seat}
              {p.isTurn ? " • TURN" : ""}
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
