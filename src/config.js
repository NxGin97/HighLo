// -----------------------------------------------------------------------
// HighLo endpoint configuration
// -----------------------------------------------------------------------
// Everything the Raspberry Pi / computer-vision pipeline will eventually
// feed into the UI is centralized here. Right now every value is either
// `null` (feature disabled -> UI falls back to the grey placeholder / mock
// data) or points at a local mock. Swap these for real values and nothing
// else in the app needs to change.

const config = {
  // MJPEG / HLS / WebRTC URL for the raw camera feed. When null, the
  // CameraFeed component renders the grey placeholder box instead of a
  // <video>/<img> element.
  // Example once wired up: "http://raspberrypi.local:8080/stream.mjpg"
  CAMERA_STREAM_URL: null,

  // WebSocket endpoint that pushes live detection JSON: hand bounding
  // boxes, per-seat card detections, confidence scores, gesture events,
  // occupancy changes, and shuffle events. When null, useCameraSocket()
  // just replays mockData so the UI still looks alive during development.
  // Example once wired up: "ws://raspberrypi.local:8765/detections"
  DETECTION_SOCKET_URL: null,

  // REST base for auth / gameplay history / analysis reports. When null,
  // auth + history calls are simulated in-memory (see state/AppStateContext).
  API_BASE_URL: null,

  // How often (ms) to poll DETECTION_SOCKET_URL if the backend only
  // supports polling instead of a persistent socket.
  DETECTION_POLL_INTERVAL_MS: 1000,
};

export default config;
