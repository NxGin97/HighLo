import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppState } from "../state/AppStateContext.jsx";

export default function Login() {
  const { login, continueAsGuest } = useAppState();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [name, setName] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    // NOTE: no real backend is wired up — see the ambiguity note in the
    // README. This simulates a successful login/register for any
    // non-empty name so the rest of the flow can be built and tested.
    login(name.trim() || "Player");
    navigate("/seats");
  }

  function handleGuest() {
    continueAsGuest();
    navigate("/seats");
  }

  return (
    <div
      style={{
        minHeight: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div className="hlo-panel" style={{ width: 380, maxWidth: "100%" }}>
        <div className="hlo-panel__header" style={{ flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "2.2rem", letterSpacing: "0.05em" }}>
            HIGH<span style={{ color: "var(--red-bright)" }}>LO</span>
          </div>
          <p style={{ margin: 0, color: "var(--white-faint)", fontSize: "0.85rem" }}>
            Live table intelligence for blackjack.
          </p>
        </div>

        <div className="hlo-panel__body">
          <div style={{ display: "flex", gap: 4, marginBottom: 18 }}>
            <button
              className="hlo-btn"
              style={{
                flex: 1,
                background: mode === "login" ? "var(--charcoal-lighter)" : "transparent",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "var(--white)",
              }}
              onClick={() => setMode("login")}
            >
              Log in
            </button>
            <button
              className="hlo-btn"
              style={{
                flex: 1,
                background: mode === "register" ? "var(--charcoal-lighter)" : "transparent",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "var(--white)",
              }}
              onClick={() => setMode("register")}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label style={{ fontSize: "0.78rem", color: "var(--white-dim)" }}>
              Username
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. cardCounter22"
                style={{
                  width: "100%",
                  marginTop: 4,
                  padding: "10px 12px",
                  borderRadius: 6,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "var(--charcoal)",
                  color: "var(--white)",
                }}
              />
            </label>
            <label style={{ fontSize: "0.78rem", color: "var(--white-dim)" }}>
              Password
              <input
                type="password"
                placeholder="••••••••"
                style={{
                  width: "100%",
                  marginTop: 4,
                  padding: "10px 12px",
                  borderRadius: 6,
                  border: "1px solid rgba(255,255,255,0.15)",
                  background: "var(--charcoal)",
                  color: "var(--white)",
                }}
              />
            </label>
            <button type="submit" className="hlo-btn hlo-btn--primary" style={{ marginTop: 6 }}>
              {mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>

          <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "18px 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
            <span style={{ fontSize: "0.72rem", color: "var(--white-faint)" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
          </div>

          <button className="hlo-btn hlo-btn--ghost" style={{ width: "100%" }} onClick={handleGuest}>
            Continue as guest
          </button>
          <p style={{ fontSize: "0.72rem", color: "var(--white-faint)", marginTop: 10, lineHeight: 1.4 }}>
            Guests get real-time recommendations and the running count only —
            no stats are saved and no playstyle report is generated.
          </p>
        </div>
      </div>
    </div>
  );
}
