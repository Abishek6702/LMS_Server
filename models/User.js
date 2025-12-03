const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // will already be hashed
  role: {
    type: String,
    required: true,
    enum: ["superadmin", "hod", "staff", "dean", "student"],
  },
  userDetailId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: "userDetailModel",
    required: true,
  },
  userDetailModel: {
    type: String,
    enum: ["Faculty", "Student"],
    required: true,
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  resetOtp: { type: String },
  resetOtpExpires: { type: Date }
});



module.exports = mongoose.model("User", userSchema);
