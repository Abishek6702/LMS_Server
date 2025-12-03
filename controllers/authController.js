const mongoose = require("mongoose");
const User = require("../models/User");
const Faculty = require("../models/Faculty");
const Student = require("../models/Student");
const bcrypt = require("bcryptjs");
const transporter = require("../config/email");
const { generateToken } = require("../utils/jwt");


const createSuperAdmin = async (req, res) => {
    try {
      const { name, email, password } = req.body;
  
      // allow only if no superadmin exists (optional but safer)
      const existingAdmin = await User.findOne({ role: "superadmin" });
      if (existingAdmin) {
        return res
          .status(400)
          .json({ success: false, message: "Super admin already exists" });
      }
  
      const hashed = await bcrypt.hash(password, 12);
  
      const user = new User({
        name,
        email,
        password: hashed,
        role: "superadmin",
        userDetailId: new mongoose.Types.ObjectId(), // dummy
        userDetailModel: "Faculty" // or "Student" – not really used for superadmin
      });
  
      await user.save();
  
      const token = generateToken(user, { name });
  
      res.status(201).json({
        success: true,
        message: "Super admin created",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  };


// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid credentials" });

    // fetch extra data based on model
    let extra = {};
    if (user.userDetailModel === "Faculty") {
      const faculty = await Faculty.findById(user.userDetailId);
      extra = {
        name: faculty ? `${faculty.firstName} ${faculty.lastName}` : user.name,
        designation: faculty?.designation,
        department: faculty?.department
      };
    } else if (user.userDetailModel === "Student") {
      const student = await Student.findById(user.userDetailId);
      extra = {
        name: student ? `${student.firstName} ${student.lastName}` : user.name,
        designation: "student",
        department: student?.department
      };
    } else {
      extra = { name: user.name };
    }

    const token = generateToken(user, extra);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: extra.name,
        designation: extra.designation,
        department: extra.department
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// FORGOT PASSWORD – SEND OTP
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.resetOtp = otp;
    user.resetOtpExpires = expiry;
    await user.save();

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "LMS Password Reset OTP",
      html: `<p>Your OTP for password reset is <b>${otp}</b>. It is valid for 10 minutes.</p>`
    });

    res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// VERIFY OTP + SET NEW PASSWORD
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.resetOtp || !user.resetOtpExpires) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.resetOtpExpires < new Date()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    user.password = hashed;
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {createSuperAdmin, login, forgotPassword, resetPassword };
