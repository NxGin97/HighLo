import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import config from "../config.js";
import {
  defaultOccupancy,
  defaultPlayers,
  defaultDealer,
  defaultRecommendation,
  defaultCountHistory,
  defaultShoeStats,
  defaultAnalysis,
  defaultMidShoeJoin,
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
  // as "a game is happening". useCameraSocket (below) is where a real
  // Raspberry Pi feed would overwrite these with live detections.
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

  // Per-user card corrections. Keyed by "seat-handIndex-cardIndex" so a
  // correction only ever affects this browser's view, never the shared
  // detection state (per the "only affects the current user" requirement).
  const [localCorrections, setLocalCorrections] = useState({});

  function correctCard(seat, handIndex, cardIndex, newCode) {
    setLocalCorrections((prev) => ({
      ...prev,
      [`${seat}-${handIndex}-${cardIndex}`]: newCode,
    }));
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
      shoeStats,
      analysis,
      midShoeJoin,
      cameraConnected,
      isCountHistoryVisible,
      setIsCountHistoryVisible,
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
      shoeStats,
      analysis,
      midShoeJoin,
      cameraConnected,
      isCountHistoryVisible,
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
