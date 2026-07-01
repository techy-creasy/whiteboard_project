const { Server } = require("socket.io");
const socketAuth = require("./socketAuth");
const registerCanvasHandlers = require("./canvasSocket");
const registerCommentHandlers = require("./commentSocket");

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      // Mirrors the existing Express `cors()` call (also unrestricted).
      // Tighten this to your real frontend origin before deploying
      // somewhere CORS actually matters.
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Every connection must pass JWT verification before "connection" fires.
  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id} (user ${socket.userId})`);

    registerCanvasHandlers(io, socket);
    registerCommentHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

module.exports = initSocket;
