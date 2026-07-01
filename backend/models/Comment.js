const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    canvasId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Canvas",
      required: true,
      index: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Denormalized on purpose: lets the frontend show "who said this"
    // without a join/populate on every comment fetch.
    authorEmail: {
      type: String,
      required: true,
    },
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true } // gives us createdAt/updatedAt for free
);

const Comment = mongoose.model("Comment", commentSchema);

module.exports = Comment;
