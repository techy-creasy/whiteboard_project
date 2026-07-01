const express = require('express');
const router = express.Router();

const { loadCanvas, getUserCanvases, createCanvas, updateCanvas, deleteCanvas, shareCanvas } = require("../Controllers/canvasController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.delete("/:canvasId", authMiddleware, deleteCanvas);
router.get("/list", authMiddleware, getUserCanvases);
router.get("/load/:id", authMiddleware, loadCanvas);
router.post("/create", authMiddleware, createCanvas);
router.put("/update", authMiddleware, updateCanvas);
router.put("/share/:id", authMiddleware, shareCanvas);

module.exports = router;
