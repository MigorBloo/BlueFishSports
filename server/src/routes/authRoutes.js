const express = require("express");
const router = express.Router();
const { register, login, getProfile, updateProfile, refreshToken } = require("../controllers/authController");
const { authenticateUser } = require("../middleware/auth");
const { upload } = require("../services/s3Service");

// Public routes
router.post("/register", register);
router.post("/login", login);
router.post("/refresh-token", refreshToken);

// Protected routes
router.get("/profile", authenticateUser, getProfile);
router.put("/profile", authenticateUser, (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'Error uploading file'
      });
    }
    next();
  });
}, updateProfile);

module.exports = router; 
