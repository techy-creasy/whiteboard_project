const Canvas = require("../models/Canvas");
const User = require("../models/User");

exports.getUserCanvases = async (req, res) => {
    try {
        const userId = req.userId;

        const canvases = await Canvas.find({
            $or: [{ owner: userId }, { shared: userId }]
        }).sort({ createdAt: -1 });

        res.json(canvases);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch canvases", details: error.message });
    }
};

exports.loadCanvas = async (req, res) => {
    try {
        const canvasId = req.params.id;
        const userId = req.userId;

        const canvas = await Canvas.findById(canvasId);
        if (!canvas) {
            return res.status(404).json({ error: "Canvas not found" });
        }

        if (!canvas.isAccessibleBy(userId)) {
            return res.status(403).json({ error: "Unauthorized to access this canvas" });
        }

        res.json(canvas);
    } catch (error) {
        res.status(500).json({ error: "Failed to load canvas", details: error.message });
    }
};

exports.createCanvas = async (req, res) => {
    try {
        const userId = req.userId;

        const newCanvas = new Canvas({
            owner: userId,
            shared: [],
            elements: []
        });

        await newCanvas.save();
        res.status(201).json({ message: "Canvas created successfully", canvasId: newCanvas._id });
    } catch (error) {
        res.status(500).json({ error: "Failed to create canvas", details: error.message });
    }
};

exports.updateCanvas = async (req, res) => {
    try {
        const { canvasId, elements } = req.body;
        const userId = req.userId;

        const canvas = await Canvas.findById(canvasId);
        if (!canvas) {
            return res.status(404).json({ error: "Canvas not found" });
        }

        if (!canvas.isAccessibleBy(userId)) {
            return res.status(403).json({ error: "Unauthorized to update this canvas" });
        }

        canvas.elements = elements;
        await canvas.save();

        res.json({ message: "Canvas updated successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to update canvas", details: error.message });
    }
};

exports.deleteCanvas = async (req, res) => {
  try {
    const canvasId = req.params.canvasId;
    const userId = req.userId;

    const canvas = await Canvas.findById(canvasId);

    if (!canvas) {
      return res.status(404).json({ error: "Canvas not found" });
    }

    if (canvas.owner.toString() !== userId) {
      return res.status(403).json({
        error: "Only owner can delete canvas",
      });
    }

    await Canvas.findByIdAndDelete(canvasId);

    res.json({
      message: "Canvas deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: "Failed to delete canvas",
    });
  }
};

// PUT /api/canvas/share/:id  { email }
// Only the owner may share. Adds the target user to `shared`.
exports.shareCanvas = async (req, res) => {
  try {
    const canvasId = req.params.id;
    const userId = req.userId;
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const canvas = await Canvas.findById(canvasId);
    if (!canvas) {
      return res.status(404).json({ error: "Canvas not found" });
    }

    if (canvas.owner.toString() !== userId) {
      return res.status(403).json({ error: "Only the owner can share this canvas" });
    }

    const targetUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (!targetUser) {
      return res.status(404).json({ error: "No user found with that email" });
    }

    if (targetUser._id.toString() === userId) {
      return res.status(400).json({ error: "You can't share a canvas with yourself" });
    }

    const alreadyShared = canvas.shared.some(
      (sharedId) => sharedId.toString() === targetUser._id.toString()
    );
    if (alreadyShared) {
      return res.status(409).json({ error: "This canvas is already shared with that user" });
    }

    canvas.shared.push(targetUser._id);
    await canvas.save();

    res.json({
      message: `Canvas shared with ${targetUser.email}`,
      shared: canvas.shared,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to share canvas", details: error.message });
  }
};
