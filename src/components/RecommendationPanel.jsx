import React from "react";
import { useAppState } from "../state/AppStateContext.jsx";

const ACTION_COLOR = {
  HIT: "var(--red-bright)",
  STAND: "#3f7fd1",
  DOUBLE: "var(--confidence-high)",
};

function InfoIcon({ text }) {
  return (
    <span className="hlo-info-icon" tabIndex={0}>
      i
      <span className="hlo-info-icon__tooltip">{text}</span>
    </span>
  );
}

function Metric({ label, value, info }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--white-faint)", fontSize: "0.7rem" }}>
        {label}
        <InfoIcon text={info} />
      </div>
      <div style={{ fontFamily: "var(--font-mono)", fontSize: "1.05rem" }}>{value}</div>
    </div>
  );
}

/**
 * RecommendationPanel
 * `viewerIsGuest`: guests see recommendations for every seat.
 * `isViewerTurn`: logged-in users only see the recommendation + it fades
 * when it isn't their turn (visibility rule from the spec).
 */
export default function RecommendationPanel({ isViewerTurn = true, viewerIsGuest = false, compact = false }) {
  const { recommendation, midShoeJoin, analysis, isGuest } = useAppState();
  const guest = viewerIsGuest || isGuest;
  const dimmed = !guest && !isViewerTurn;

  return (
    <div
      className="hlo-panel"
      style={{ opacity: dimmed ? 0.4 : 1, transition: "opacity 0.25s ease" }}
    >
      <div className="hlo-panel__header">
        <h3 className="hlo-panel__title">Recommendation</h3>
        {midShoeJoin.isMidShoeJoin && (
          <span className="hlo-pill" title="Tracking started after cards were already dealt this shoe">
            Mid-shoe join
          </span>
        )}
      </div>
      <div className="hlo-panel__body">
        {guest || isViewerTurn ? (
          <>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: compact ? "2.2rem" : "3rem",
                letterSpacing: "0.03em",
                color: ACTION_COLOR[recommendation.action],
                lineHeight: 1,
                marginBottom: 14,
              }}
            >
              {recommendation.action}
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: compact ? "1fr 1fr" : "repeat(auto-fit, minmax(120px, 1fr))",
                gap: 14,
              }}
            >
              <Metric
                label="Card detection confidence"
                value={`${Math.round(recommendation.cardDetectionConfidence * 100)}%`}
                info="How certain the vision model is that the cards it read for this hand are correct."
              />
              <Metric
                label="Recommendation confidence"
                value={`${Math.round(recommendation.recommendationConfidence * 100)}%`}
                info="How strongly basic strategy + count favor this move over the alternatives."
              />
              <Metric
                label="Dealer bust probability"
                value={`${Math.round(recommendation.dealerBustProbability * 100)}%`}
                info="Estimated chance the dealer busts, based on their up card and the current count."
              />
              <Metric
                label="True count"
                value={recommendation.trueCount.toFixed(1)}
                info="Running count divided by estimated decks remaining in the shoe."
              />
              <Metric
                label="Running count"
                value={recommendation.runningCount}
                info="Hi-Lo running total of every card seen since the last shuffle."
              />
            </div>
            {midShoeJoin.isMidShoeJoin && (
              <p style={{ fontSize: "0.72rem", color: "var(--white-faint)", marginTop: 12 }}>
                Count may be incomplete — tracking joined this shoe already in progress (
                {Math.round(midShoeJoin.countReliability * 100)}% estimated reliability).
              </p>
            )}
          </>
        ) : (
          <p style={{ color: "var(--white-faint)", fontSize: "0.85rem" }}>
            Recommendation hidden until it's your turn.
          </p>
        )}

        {!guest && (
          <div style={{ marginTop: 18, paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>Your playstyle analysis</span>
              {analysis.handsPlayed < analysis.minHandsRequired && (
                <span className="hlo-pill">
                  {analysis.handsPlayed}/{analysis.minHandsRequired} hands
                </span>
              )}
            </div>
            {analysis.handsPlayed >= analysis.minHandsRequired ? (
              <p style={{ fontSize: "0.78rem", color: "var(--white-dim)", marginTop: 6 }}>
                {analysis.playstyle} · {analysis.riskProfile} risk · {Math.round(analysis.decisionAccuracy * 100)}% decision accuracy
              </p>
            ) : (
              <p style={{ fontSize: "0.78rem", color: "var(--white-faint)", marginTop: 6 }}>
                Play {analysis.minHandsRequired - analysis.handsPlayed} more hand(s) to unlock your report.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
