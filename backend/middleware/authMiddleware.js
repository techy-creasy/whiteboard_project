const { verifyToken, extractBearerToken } = require("../utils/jwt");

// Protects any route it's attached to: no valid token, no access.
// On success it sets req.userId so controllers know which user is asking.
exports.authMiddleware = (req, res, next) => {
  const header = req.header("Authorization");

  if (!header) {
    return res.status(401).json({ error: "Access denied: no token provided" });
  }

  const token = extractBearerToken(header);

  try {
    const decoded = verifyToken(token);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Session expired, please log in again" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
};
