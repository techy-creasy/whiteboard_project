const jwt = require("jsonwebtoken");

// Single source of truth for "is this token valid, and whose is it?"
// Used by both the REST authMiddleware and the Socket.IO handshake
// auth, so the two never drift apart.
//
// Returns the decoded payload (e.g. { userId, iat, exp }).
// Throws the original jsonwebtoken error (TokenExpiredError / JsonWebTokenError)
// so callers can branch on error.name exactly like before.
function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

// Both REST (`Authorization: Bearer xxx`) and Socket.IO handshake headers
// use the same "Bearer <token>" convention, so this is shared too.
function extractBearerToken(headerValue) {
  if (!headerValue) return null;
  return headerValue.startsWith("Bearer ") ? headerValue.slice(7) : headerValue;
}

module.exports = { verifyToken, extractBearerToken };
