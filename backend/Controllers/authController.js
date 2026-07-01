const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");

const User = require("../models/User");

const SALT_ROUNDS = 10;

// Builds the JWT that proves who the user is on every future request.
// We only ever put the user's id in it — never the password.
function createToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ---- Validation ----
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    // ---- Hashing ----
    // Never store the plain-text password. Bcrypt salts + hashes it,
    // and the hash itself can't be reversed back into the password.
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const user = new User({
      email,
      password: hashedPassword,
    });

    await user.save();

    // Log the user straight in after registering, so the frontend
    // can take them directly to their profile.
    const token = createToken(user._id);

    res.status(201).json({
      message: "User registered successfully",
      token,
      userId: user._id,
      email: user.email,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }
    res.status(500).json({ message: "Something went wrong while registering", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Same generic message whether the email doesn't exist or the
    // password is wrong — don't reveal which one to a possible attacker.
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = createToken(user._id);

    res.json({
      token,
      userId: user._id,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong while logging in", error: error.message });
  }
};

// GET /api/auth/me — protected by authMiddleware.
// Lets the Profile page confirm who is logged in and show their email.
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ userId: user._id, email: user.email });
  } catch (error) {
    res.status(500).json({ message: "Failed to load profile", error: error.message });
  }
};
