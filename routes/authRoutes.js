const express = require("express");
const {createSuperAdmin, login, forgotPassword, resetPassword } = require("../controllers/authController");

const router = express.Router();

// one-time superadmin creation
router.post("/create-superadmin", createSuperAdmin);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
