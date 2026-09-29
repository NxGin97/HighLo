import React from "react";
import { useAppState } from "../state/AppStateContext.jsx";
import { basicStrategyAction, buildStrategyRow, handTypeLabel } from "../lib/strategy.js";

const ACTION_COLOR = {
  HIT: "var(--red-bright)",
  STAND: "#3f7fd1",
  DOUBLE: "var(--confidence-high)",
  SPLIT: "var(--brass)",
  SURRENDER: "var(--charcoal-lighter)",
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

function ScopeToggle({ scope, setScope }) {
  return (
    <div className="hlo-toggle" role="radiogroup" aria-label="Recommendation visibility">
      <button
        type="button"
        role="radio"
        aria-checked={scope === "all"}
        className={`hlo-toggle__option ${scope === "all" ? "active" : ""}`}
        onClick={() => setScope("all")}
      >
        All turns
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={scope === "mine"}
        className={`hlo-toggle__option ${scope === "mine" ? "active" : ""}`}
        onClick={() => setScope("mine")}
      >
        My turn only
      </button>
    </div>
  );
}

function StrategyChart({ cards, dealerUpCode }) {
  const row = buildStrategyRow(cards, dealerUpCode);
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
        <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--white-dim)" }}>
          Strategy chart — {handTypeLabel(cards)}
        </span>
        <InfoIcon text="The standard basic-strategy move for this hand against each possible dealer up card. Your dealer's actual up card is highlighted." />
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="hlo-strategy-table">
          <thead>
            <tr>
              {row.map((cell) => (
                <th key={cell.col}>{cell.col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {row.map((cell) => (
                <td
                  key={cell.col}
                  className={cell.active ? "active-cell" : ""}
                  style={{ color: ACTION_COLOR[cell.action] }}
                >
                  {cell.action[0]}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * RecommendationPanel
 * Shows the recommendation for whichever seat is "in view": under the
 * "all" scope that's whoever's turn is currently active (visible to
 * everyone, every turn); under "mine" it's only shown when it's the
 * viewer's own seat's turn. The basic-strategy chart is cross-checked
 * against the engine's suggested action and nudges the displayed
 * confidence up (agreement) or down (disagreement).
 */
export default function RecommendationPanel({ compact = false }) {
  const {
    recommendation,
    midShoeJoin,
    analysis,
    isGuest,
    players,
    selectedSeat,
    dealer,
    recommendationScope,
    setRecommendationScope,
  } = useAppState();

  const activeTurnPlayer = players.find((p) => p.isTurn);
  const showForSelfOnly = recommendationScope === "mine";
  const displayedPlayer =
    activeTurnPlayer && (!showForSelfOnly || activeTurnPlayer.seat === selectedSeat) ? activeTurnPlayer : null;

  const activeHand = displayedPlayer ? displayedPlayer.hands[displayedPlayer.hands.length - 1] : null;
  const dealerUpCard = dealer.cards[0];

  let adjustedConfidence = recommendation.recommendationConfidence;
  let strategyAction = null;
  let matchesStrategy = null;
  if (activeHand) {
    strategyAction = basicStrategyAction(activeHand.cards, dealerUpCard);
    matchesStrategy = strategyAction === recommendation.action;
    adjustedConfidence = matchesStrategy
      ? Math.min(0.99, recommendation.recommendationConfidence + 0.08)
      : Math.max(0.4, recommendation.recommendationConfidence - 0.15);
  }

  return (
    <div className="hlo-panel">
      <div className="hlo-panel__header">
        <h3 className="hlo-panel__title">Recommendation</h3>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {midShoeJoin.isMidShoeJoin && (
            <span className="hlo-pill" title="Tracking started after cards were already dealt this shoe">
              Mid-shoe join
            </span>
          )}
          <ScopeToggle scope={recommendationScope} setScope={setRecommendationScope} />
        </div>
      </div>
      <div className="hlo-panel__body">
        {displayedPlayer ? (
          <>
            <div style={{ fontSize: "0.72rem", color: "var(--white-faint)", marginBottom: 8 }}>
              Seat {displayedPlayer.seat}
              {displayedPlayer.seat === selectedSeat ? " (you)" : ""}'s turn
            </div>

            {/* Colored, high-contrast action box */}
            <div
              style={{
                display: "inline-block",
                background: ACTION_COLOR[recommendation.action],
                color: "var(--white)",
                fontFamily: "var(--font-display)",
                fontSize: compact ? "1.8rem" : "2.4rem",
                letterSpacing: "0.04em",
                padding: compact ? "8px 22px" : "10px 30px",
                borderRadius: "var(--radius-md)",
                boxShadow: "0 4px 14px rgba(0,0,0,0.35)",
                marginBottom: 14,
              }}
            >
              {recommendation.action}
            </div>

            {matchesStrategy === false && (
              <p style={{ fontSize: "0.72rem", color: "var(--confidence-medium)", marginTop: -6, marginBottom: 12 }}>
                Basic strategy chart suggests {strategyAction} instead — confidence lowered.
              </p>
            )}

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
                value={`${Math.round(adjustedConfidence * 100)}%`}
                info="How strongly this move is favored, adjusted up or down by whether it agrees with the basic-strategy chart below."
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

            <StrategyChart cards={activeHand.cards} dealerUpCode={dealerUpCard} />
          </>
        ) : (
          <p style={{ color: "var(--white-faint)", fontSize: "0.85rem" }}>
            {showForSelfOnly
              ? "Recommendation hidden until it's your turn."
              : "Waiting for the next turn to begin."}
          </p>
        )}

        {!isGuest && (
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
