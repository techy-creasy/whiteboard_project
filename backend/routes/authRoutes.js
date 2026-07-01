const express = require("express");
const router = express.Router();

const { register, login, getProfile } = require("../Controllers/authController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getProfile); // protected: who am I?

module.exports = router;
