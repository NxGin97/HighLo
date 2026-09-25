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
    hands: [{ cards: ["10H", "6C"], value: 16, isBust: false, isSplit: false }],
    isTurn: false,
    confidence: "high", // high | medium | low
    lastAction: "HIT",
  },
  {
    seat: 2,
    occupied: true,
    hands: [{ cards: ["9S", "9D"], value: 18, isBust: false, isSplit: false }],
    isTurn: false,
    confidence: "medium",
    lastAction: "STAND",
  },
  {
    seat: 3,
    occupied: true,
    hands: [{ cards: ["AS", "7H"], value: 18, isBust: false, isSplit: false }],
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
    hands: [{ cards: ["KC", "QD"], value: 20, isBust: false, isSplit: false }],
    isTurn: false,
    confidence: "high",
    lastAction: "STAND",
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

export const defaultDealer = {
  upCard: "7D",
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
  trend: [
    { session: "Sep 12", accuracy: 0.82 },
    { session: "Sep 15", accuracy: 0.85 },
    { session: "Sep 19", accuracy: 0.88 },
    { session: "Sep 23", accuracy: 0.91 },
  ],
};

export const defaultMidShoeJoin = {
  isMidShoeJoin: true,
  countReliability: 0.6,
};
