import { io } from "socket.io-client";
import { getToken } from "./auth";

const SOCKET_URL = "http://localhost:8000";

// Module-level singleton: this whole file only ever holds at most one
// live connection, no matter how many components call getSocket().
let socket = null;
let socketToken = null; // which token the current `socket` was opened with

// Lazily creates (and reuses) the single Socket.IO connection for the
// whole app. Returns null if nobody is logged in yet — callers should
// guard for that, e.g. `const socket = getSocket(); if (!socket) return;`.
//
// If the stored token has changed since the last call (e.g. a different
// user logged in without a full page reload), the stale connection is
// torn down and a fresh one is opened with the new token.
export function getSocket() {
  const token = getToken();

  if (!token) {
    disconnectSocket();
    return null;
  }

  if (socket && socketToken === token) {
    return socket;
  }

  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    // Sent two ways for compatibility — see backened/sockets/socketAuth.js,
    // which checks the Authorization header first and falls back to this.
    extraHeaders: { Authorization: `Bearer ${token}` },
    auth: { token },
  });
  socketToken = token;

  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err.message);
  });

  return socket;
}

// Called on logout (and automatically on a 401 from the REST API) so we
// don't leave a dangling authenticated connection open.
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
  }
  socket = null;
  socketToken = null;
}
