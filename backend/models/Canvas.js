const mongoose = require('mongoose');

const canvasSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    shared: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    elements: [{
        type: mongoose.Schema.Types.Mixed
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Single place that answers "can this user open/edit this canvas?" —
// used by the REST controller AND the Socket.IO handlers below, so the
// access rule (owner OR shared) can never drift between the two.
canvasSchema.methods.isAccessibleBy = function (userId) {
    const id = userId.toString();
    return (
        this.owner.toString() === id ||
        this.shared.some((sharedId) => sharedId.toString() === id)
    );
};

const Canvas = mongoose.model("Canvas", canvasSchema);

module.exports = Canvas;
