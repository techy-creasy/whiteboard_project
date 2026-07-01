const Comment = require("../models/Comment");
const User = require("../models/User");

function registerCommentHandlers(io, socket) {
  socket.on("newComment", async ({ canvasId, x, y, text }) => {
    try {
      // Same rule as drawingUpdate: only act on canvases this socket
      // already passed the joinCanvas access check for.
      if (!socket.authorizedCanvases?.has(canvasId)) {
        return socket.emit("canvasError", {
          message: "Join the canvas before commenting",
        });
      }

      if (!text || !text.trim()) {
        return socket.emit("canvasError", { message: "Comment text is required" });
      }

      const user = await User.findById(socket.userId).select("email");
      if (!user) {
        return socket.emit("canvasError", { message: "User not found" });
      }

      const comment = await Comment.create({
        canvasId,
        author: socket.userId,
        authorEmail: user.email,
        x,
        y,
        text: text.trim(),
      });

      // Broadcast to the whole room, INCLUDING the author — their own
      // pin only appears once the server confirms it saved, same as
      // everyone else's. Keeps a single source of truth on the client.
      io.to(canvasId).emit("receiveComment", comment);
    } catch (error) {
      socket.emit("canvasError", { message: "Failed to post comment" });
    }
  });
}

module.exports = registerCommentHandlers;
