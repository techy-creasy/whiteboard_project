const { verifyToken, extractBearerToken } = require("../utils/jwt");

// Runs once per socket, before "connection" fires. Mirrors authMiddleware,
// but for the Socket.IO handshake instead of an HTTP request.
//
// We never trust a userId the client claims to be — the only userId we
// ever attach to a socket is the one decoded out of a verified JWT.
function socketAuth(socket, next) {
  const headerToken = extractBearerToken(socket.handshake.headers.authorization);
  // Fallback: some setups send it via the `auth` payload instead of a header
  // (e.g. socket.io-client's `auth: { token }` option). Either is accepted.
  const authToken = socket.handshake.auth?.token;
  const token = headerToken || authToken;

  if (!token) {
    return next(new Error("Authentication error: no token provided"));
  }

  try {
    const decoded = verifyToken(token);
    socket.userId = decoded.userId;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new Error("Authentication error: session expired"));
    }
    return next(new Error("Authentication error: invalid token"));
  }
}

module.exports = socketAuth;
