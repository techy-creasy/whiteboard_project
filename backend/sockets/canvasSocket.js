const Canvas = require("../models/Canvas");
const Comment = require("../models/Comment");
const { ensureRoom, getRoom, scheduleSave, memberJoined, memberLeft } = require("./roomState");

function registerCanvasHandlers(io, socket) {
  // Canvases this socket has actually passed the access check for.
  // drawingUpdate / newComment refuse to act on any canvasId not in here —
  // a client can't just claim a canvasId without us re-verifying once.
  socket.authorizedCanvases = new Set();

  socket.on("joinCanvas", async ({ canvasId }) => {
    try {
      const canvas = await Canvas.findById(canvasId);
      if (!canvas) {
        return socket.emit("canvasError", { message: "Canvas not found" });
      }

      // Never trust the frontend about who owns/can-access this canvas —
      // re-check against the DB using the userId we verified at handshake.
      if (!canvas.isAccessibleBy(socket.userId)) {
        return socket.emit("canvasError", {
          message: "You don't have access to this canvas",
        });
      }

      socket.join(canvasId);
      socket.authorizedCanvases.add(canvasId);

      const room = ensureRoom(canvasId, canvas.elements);
      memberJoined(canvasId);

      const comments = await Comment.find({ canvasId }).sort({ createdAt: 1 });

      // Only to this socket — it's just telling the new joiner the
      // current state, not broadcasting anything to the room.
      socket.emit("canvasData", {
        canvasId,
        elements: room.elements,
        comments,
      });
    } catch (error) {
      socket.emit("canvasError", { message: "Failed to join canvas" });
    }
  });

  socket.on("drawingUpdate", ({ canvasId, elements }) => {
    if (!socket.authorizedCanvases.has(canvasId)) return;

    const room = getRoom(canvasId);
    if (!room) return;

    room.elements = elements;

    // Everyone else in the room sees it live. The sender already has
    // these elements locally, so it's never echoed back to them.
    socket.to(canvasId).emit("drawingUpdate", { elements });

    scheduleSave(canvasId);
  });

  socket.on("disconnect", () => {
    socket.authorizedCanvases.forEach((canvasId) => memberLeft(canvasId));
  });
}

module.exports = registerCanvasHandlers;
