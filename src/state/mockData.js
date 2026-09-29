// Default, non-empty snapshot of "what the camera would be seeing" right
// now. Everything here is a plausible in-progress hand so the dashboard
// reads as live rather than blank. Replace with real detection payloads
// once DETECTION_SOCKET_URL (see src/config.js) is wired to the Pi.

export const SEAT_COUNT = 6;

// Occupancy as the camera would report it: true = seat detected occupied.
export const defaultOccupancy = {
  1: true,
  2: true,
  3: true, // the demo user sits here
  4: false,
  5: true,
  6: false,
};

export const defaultPlayers = [
  {
    seat: 1,
    occupied: true,
    // 5 cards -> demonstrates the "2 over 3" shaped hand layout.
    hands: [{ cards: ["5D", "6C", "4H", "2S", "3D"], isBust: false, isSplit: false }],
    isTurn: false,
    confidence: "high", // high | medium | low
    lastAction: "HIT",
  },
  {
    seat: 2,
    occupied: true,
    // A split pair: the second hand renders smaller, to the left of the
    // main hand, and also demonstrates the 4-card "square" shape.
    hands: [
      { cards: ["9D", "3C", "2S", "2D"], isBust: false, isSplit: true },
      { cards: ["9S", "6D"], isBust: false, isSplit: true },
    ],
    isTurn: false,
    confidence: "medium",
    lastAction: "STAND",
  },
  {
    seat: 3,
    occupied: true,
    hands: [{ cards: ["AS", "7H"], isBust: false, isSplit: false }],
    isTurn: true,
    confidence: "high",
    lastAction: null,
  },
  {
    seat: 4,
    occupied: false,
    hands: [],
    isTurn: false,
    confidence: "low",
    lastAction: null,
  },
  {
    seat: 5,
    occupied: true,
    // 3 cards -> demonstrates the triangle-shaped hand layout.
    hands: [{ cards: ["10C", "4D", "7S"], isBust: false, isSplit: false }],
    isTurn: false,
    confidence: "high",
    lastAction: "HIT",
  },
  {
    seat: 6,
    occupied: false,
    hands: [],
    isTurn: false,
    confidence: "low",
    lastAction: null,
  },
];

// First card is the dealer's face-up card; second is the hole card, shown
// face-down until holeCardKnown flips true (round resolution).
export const defaultDealer = {
  cards: ["7D", "KH"],
  holeCardKnown: false,
};

export const defaultRecommendation = {
  action: "HIT", // HIT | STAND | DOUBLE
  recommendationConfidence: 0.87,
  cardDetectionConfidence: 0.94,
  dealerBustProbability: 0.31,
  runningCount: 4,
  trueCount: 1.8,
};

export const defaultCountHistory = [
  { card: "5D", value: 1, hand: 12 },
  { card: "KC", value: -1, hand: 12 },
  { card: "AS", value: -1, hand: 13 },
  { card: "7H", value: 0, hand: 13 },
  { card: "9S", value: 0, hand: 13 },
  { card: "10H", value: -1, hand: 14 },
  { card: "6C", value: 1, hand: 14 },
  { card: "9D", value: 0, hand: 14 },
  { card: "7D", value: 0, hand: 14 },
];

export const defaultShoeStats = {
  handsSinceShuffle: 14,
  decksRemainingEstimate: 4.2,
  lastShuffleHand: 0,
};

export const defaultAnalysis = {
  handsPlayed: 37,
  minHandsRequired: 5,
  playstyle: "Disciplined Basic-Strategy Follower",
  riskProfile: "Low-Moderate",
  decisionAccuracy: 0.91,
  bettingBehavior: "Flat betting, occasional 2x on true count > 2",
  // Longer, human-readable summary the analysis engine generated from
  // this player's recorded decisions — shown under the short stat line.
  description:
    "Across your last 37 recorded hands, you've followed basic strategy on the vast majority of hands, only deviating on a handful of soft-hand doubles against a dealer 6. Your bet sizing barely moves with the count, which keeps variance low but also caps your edge when the true count runs hot — increasing your spread on true counts above +2 is the single change most likely to raise your win rate. You tend to stand a beat too early on hard 12s against a dealer 2 or 3; tightening that up should close most of the remaining gap to perfect play.",
  // Win rate per day the player was logged in and dealt hands.
  trend: [
    { date: "Sep 12", winRate: 0.41 },
    { date: "Sep 15", winRate: 0.44 },
    { date: "Sep 19", winRate: 0.47 },
    { date: "Sep 23", winRate: 0.46 },
    { date: "Sep 27", winRate: 0.5 },
  ],
};

export const defaultMidShoeJoin = {
  isMidShoeJoin: true,
  countReliability: 0.6,
};
