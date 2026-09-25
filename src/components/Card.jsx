import React from "react";

// ---------------------------------------------------------------------
// Deck data (52 cards, no jokers)
// ---------------------------------------------------------------------
export const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
export const SUITS = ["S", "H", "D", "C"]; // spades, hearts, diamonds, clubs

export const SUIT_SYMBOL = { S: "\u2660", H: "\u2665", D: "\u2666", C: "\u2663" };
export const SUIT_NAME = { S: "Spades", H: "Hearts", D: "Diamonds", C: "Clubs" };
export const RED_SUITS = ["H", "D"];

// Builds the full 52-card deck as codes like "AS", "10H", "KD".
export function buildDeck() {
  const deck = [];
  RANKS.forEach((rank) => {
    SUITS.forEach((suit) => {
      deck.push(`${rank}${suit}`);
    });
  });
  return deck;
}

// Parses a card code ("10H") into { rank, suit }.
export function parseCard(code) {
  if (!code) return { rank: "?", suit: "S" };
  const suit = code.slice(-1);
  const rank = code.slice(0, -1);
  return { rank, suit };
}

// Blackjack value of a single rank (Ace counted high here; hand totals
// should reduce Aces from 11 to 1 as needed — see handValue()).
export function rankValue(rank) {
  if (rank === "A") return 11;
  if (["K", "Q", "J", "10"].includes(rank)) return 10;
  return parseInt(rank, 10);
}

// Standard blackjack hand total with soft-ace reduction.
export function handValue(cardCodes) {
  let total = 0;
  let aces = 0;
  cardCodes.forEach((code) => {
    const { rank } = parseCard(code);
    total += rankValue(rank);
    if (rank === "A") aces += 1;
  });
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  return total;
}

const SIZE_STYLES = {
  sm: { width: 34, height: 48, fontSize: 12, pipSize: 14 },
  md: { width: 52, height: 74, fontSize: 16, pipSize: 20 },
  lg: { width: 74, height: 104, fontSize: 20, pipSize: 28 },
};

/**
 * Card
 * Renders a single playing card. Pass `code` (e.g. "AS", "10H"). Pass
 * `faceDown` to render the card back (used for a dealer hole card that
 * hasn't been revealed yet). `flagged` marks a card the CV pipeline is
 * unsure about (drives the manual-correction affordance upstream).
 */
export default function Card({
  code = "AS",
  size = "md",
  faceDown = false,
  flagged = false,
  onClick,
  className = "",
}) {
  const { rank, suit } = parseCard(code);
  const isRed = RED_SUITS.includes(suit);
  const dims = SIZE_STYLES[size] || SIZE_STYLES.md;

  if (faceDown) {
    return (
      <div
        className={`hlo-card hlo-card--back ${className}`}
        style={{ width: dims.width, height: dims.height }}
        aria-label="Face-down card"
      />
    );
  }

  return (
    <button
      type="button"
      className={`hlo-card ${isRed ? "hlo-card--red" : "hlo-card--black"} ${
        flagged ? "hlo-card--flagged" : ""
      } ${className}`}
      style={{ width: dims.width, height: dims.height, fontSize: dims.fontSize }}
      onClick={onClick}
      aria-label={`${rank} of ${SUIT_NAME[suit]}`}
      title={onClick ? "Click to correct this card" : undefined}
    >
      <span className="hlo-card__corner hlo-card__corner--tl">
        <span className="hlo-card__rank">{rank}</span>
        <span className="hlo-card__suit" style={{ fontSize: dims.pipSize * 0.55 }}>
          {SUIT_SYMBOL[suit]}
        </span>
      </span>
      <span className="hlo-card__center" style={{ fontSize: dims.pipSize }}>
        {SUIT_SYMBOL[suit]}
      </span>
      <span className="hlo-card__corner hlo-card__corner--br">
        <span className="hlo-card__rank">{rank}</span>
        <span className="hlo-card__suit" style={{ fontSize: dims.pipSize * 0.55 }}>
          {SUIT_SYMBOL[suit]}
        </span>
      </span>
      {flagged && <span className="hlo-card__flag" title="Low confidence detection">?</span>}
    </button>
  );
}

/** Small row of cards, used everywhere a hand needs to render. */
export function CardRow({ cards = [], size = "md", onCardClick, flaggedIndexes = [] }) {
  return (
    <div className="hlo-card-row">
      {cards.map((code, i) => (
        <Card
          key={`${code}-${i}`}
          code={code}
          size={size}
          flagged={flaggedIndexes.includes(i)}
          onClick={onCardClick ? () => onCardClick(i, code) : undefined}
        />
      ))}
    </div>
  );
}
