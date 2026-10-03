import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import config from "../config.js";
import { handValue } from "../components/Card.jsx";
import { computeCountStats, hiLoValue, TOTAL_DECKS } from "../lib/count.js";
import {
  defaultOccupancy,
  defaultPlayers,
  defaultDealer,
  defaultRecommendation,
  defaultCountHistory,
  defaultShoeStats,
  defaultAnalysis,
  defaultMidShoeJoin,
  CURRENT_HAND_CARD_COUNT,
} from "./mockData.js";

const AppStateContext = createContext(null);

const SEAT_STORAGE_KEY = "highlo:selectedSeat";

export function AppStateProvider({ children }) {
  // ---- Auth / session -------------------------------------------------
  // isGuest=true and isAuthenticated=false are the sane defaults for a
  // fresh visit; nothing here is left undefined.
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [username, setUsername] = useState("");

  // ---- Seat selection ---------------------------------------------------
  const [selectedSeat, setSelectedSeatState] = useState(() => {
    const stored = window.localStorage.getItem(SEAT_STORAGE_KEY);
    return stored ? Number(stored) : null;
  });

  function setSelectedSeat(seat) {
    setSelectedSeatState(seat);
    if (seat) {
      window.localStorage.setItem(SEAT_STORAGE_KEY, String(seat));
    } else {
      window.localStorage.removeItem(SEAT_STORAGE_KEY);
    }
  }

  // ---- Live table data --------------------------------------------------
  // Defaults to a fully-populated mock hand so the dashboard always reads
  // as "a game is happening". The detection socket effect below is where a
  // real Raspberry Pi feed would overwrite these with live detections.
  const [occupancy, setOccupancy] = useState(defaultOccupancy);
  const [players, setPlayers] = useState(defaultPlayers);
  const [dealer, setDealer] = useState(defaultDealer);
  const [recommendation, setRecommendation] = useState(defaultRecommendation);
  const [countHistory, setCountHistory] = useState(defaultCountHistory);
  const [shoeStats, setShoeStats] = useState(defaultShoeStats);
  const [analysis, setAnalysis] = useState(defaultAnalysis);
  const [midShoeJoin] = useState(defaultMidShoeJoin);
  const [cameraConnected, setCameraConnected] = useState(Boolean(config.CAMERA_STREAM_URL));
  const [isCountHistoryVisible, setIsCountHistoryVisible] = useState(true);

  // Controls whether the Recommendation component shows every seat's
  // recommendation as each turn happens ("all") or only surfaces one when
  // it's this viewer's own seat's turn ("mine"). Desktop only — mobile is
  // always forced to "mine" regardless of this value (see RecommendationPanel).
  const [recommendationScope, setRecommendationScope] = useState("all");

  // Seat -> "win" | "lose" | "push", shown as a tinted overlay for a few
  // seconds after the dealer's hand resolves. See resolveRoundDemo().
  const [roundOutcomes, setRoundOutcomes] = useState({});

  // Per-user card corrections. Keyed by "seat-handIndex-cardIndex" (seat
  // can be a numeric seat or the string "dealer") so a correction only
  // ever affects this browser's view, never the shared detection state.
  const [localCorrections, setLocalCorrections] = useState({});

  function correctCard(seat, handIndex, cardIndex, newCode) {
    setLocalCorrections((prev) => ({
      ...prev,
      [`${seat}-${handIndex}-${cardIndex}`]: newCode,
    }));
    // Keep the Running Count history in sync: the history entry dealt
    // from this exact (seat, handIndex, cardIndex) slot — tagged that
    // way in mockData.js's buildCurrentHandEntries — gets its card/value
    // updated too, so correcting a misread card actually moves the
    // count instead of just changing what's shown on the seat.
    setCountHistory((prev) =>
      prev.map((entry) =>
        entry.seat === seat && entry.handIndex === handIndex && entry.cardIndex === cardIndex
          ? {
              ...entry,
              card: newCode,
              value: newCode === "??" ? 0 : hiLoValue(newCode),
              // A correction on the dealer's hole card only happens once
              // it's actually revealed (see Dealer.jsx), so it's known
              // now too and should start counting like any other card.
              isHiddenCard: false,
            }
          : entry
      )
    );
  }

  // ---- Derived running-count stats --------------------------------------
  // Computed from countHistory itself (Hi-Lo running count, true count,
  // cards counted / remaining in a 6-deck shoe) so the Running Count
  // component and page always agree, and update the instant a card is
  // added — no separate "runningCount" field to keep in sync by hand.
  const countStats = useMemo(() => computeCountStats(countHistory, TOTAL_DECKS), [countHistory]);

  // ---- Force Shuffle (manual "camera detected a shuffle" override) ------
  // Simulates a shuffle happening right now: keeps only the most recent
  // hand's cards as the post-shuffle reference (per the spec: "last
  // completed hand before shuffle remains visible for reference"), drops
  // everything else, and resets the running count to zero. The confirm
  // step lives in the UI (CountHistory.jsx) before this is called.
  function forceShuffle() {
    setCountHistory((prev) => {
      const nonMarkerEntries = prev.filter((e) => !e.isShuffleMarker);
      const referenceHand = nonMarkerEntries.slice(-CURRENT_HAND_CARD_COUNT);
      return [...referenceHand, { isShuffleMarker: true }];
    });
    setShoeStats((prev) => ({ ...prev, handsSinceShuffle: 0 }));
  }

  // ---- Demo: resolve the round (win/lose/push overlay, then reset) ------
  // Reveals the dealer's hole card, tints every occupied seat green/red/
  // yellow against the dealer's final total, then after 3 seconds clears
  // the tint and deals a fresh mock hand ("next hand begins").
  function resolveRoundDemo() {
    setDealer((prev) => ({ ...prev, holeCardKnown: true }));
    setPlayers((currentPlayers) => {
      const dealerTotal = handValue(dealer.cards);
      const dealerBust = dealerTotal > 21;
      const outcomes = {};
      currentPlayers.forEach((p) => {
        if (!p.occupied) return;
        const total = handValue(p.hands[0].cards);
        if (total > 21) {
          outcomes[p.seat] = "lose";
        } else if (dealerBust) {
          outcomes[p.seat] = "win";
        } else if (total > dealerTotal) {
          outcomes[p.seat] = "win";
        } else if (total < dealerTotal) {
          outcomes[p.seat] = "lose";
        } else {
          outcomes[p.seat] = "push";
        }
      });
      setRoundOutcomes(outcomes);
      return currentPlayers;
    });

    setTimeout(() => {
      setRoundOutcomes({});
      setPlayers(defaultPlayers);
      setDealer(defaultDealer);
      setLocalCorrections({});
    }, 3000);
  }

  // ---- Wire-up point for the Raspberry Pi detection socket ---------------
  useEffect(() => {
    if (!config.DETECTION_SOCKET_URL) {
      // No backend configured yet: keep serving the mock snapshot above.
      return undefined;
    }
    const socket = new WebSocket(config.DETECTION_SOCKET_URL);
    socket.onopen = () => setCameraConnected(true);
    socket.onclose = () => setCameraConnected(false);
    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        if (payload.occupancy) setOccupancy(payload.occupancy);
        if (payload.players) setPlayers(payload.players);
        if (payload.dealer) setDealer(payload.dealer);
        if (payload.recommendation) setRecommendation(payload.recommendation);
        if (payload.countHistory) setCountHistory(payload.countHistory);
        if (payload.shoeStats) setShoeStats(payload.shoeStats);
      } catch (err) {
        // Malformed frame from the Pi — ignore and keep last-known-good state.
        console.warn("HighLo: could not parse detection payload", err);
      }
    };
    return () => socket.close();
  }, []);

  const value = useMemo(
    () => ({
      isAuthenticated,
      isGuest,
      username,
      login: (name) => {
        setUsername(name);
        setIsAuthenticated(true);
        setIsGuest(false);
      },
      continueAsGuest: () => {
        setIsGuest(true);
        setIsAuthenticated(false);
        setUsername("Guest");
      },
      logout: () => {
        setIsAuthenticated(false);
        setIsGuest(false);
        setUsername("");
        setSelectedSeat(null);
      },
      selectedSeat,
      setSelectedSeat,
      occupancy,
      players,
      dealer,
      recommendation,
      countHistory,
      countStats,
      shoeStats,
      analysis,
      midShoeJoin,
      cameraConnected,
      isCountHistoryVisible,
      setIsCountHistoryVisible,
      recommendationScope,
      setRecommendationScope,
      roundOutcomes,
      resolveRoundDemo,
      forceShuffle,
      localCorrections,
      correctCard,
    }),
    [
      isAuthenticated,
      isGuest,
      username,
      selectedSeat,
      occupancy,
      players,
      dealer,
      recommendation,
      countHistory,
      countStats,
      shoeStats,
      analysis,
      midShoeJoin,
      cameraConnected,
      isCountHistoryVisible,
      recommendationScope,
      roundOutcomes,
      localCorrections,
    ]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState must be used within AppStateProvider");
  return ctx;
}
