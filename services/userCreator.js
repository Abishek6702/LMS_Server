const User = require("../models/User");
const bcrypt = require("bcryptjs");

const createUserLogin = async (name, email, role, userDetailId, userDetailModel) => {
  const plainPassword = "default123";
  const hashed = await bcrypt.hash(plainPassword, 12);

  const user = new User({
    name,
    email,
    password: hashed,
    role,
    userDetailId,
    userDetailModel,
  });

  await user.save();
  return user;
};

const getRoleFromDesignation = (designation) => {
  const roleMap = {
    hod: "hod",
    professor: "staff",
    "assistant professor": "staff",
    "associate professor": "staff",
    dean: "dean",
    student: "student",
  };
  return roleMap[designation.toLowerCase()] || "staff";
};

module.exports = { createUserLogin, getRoleFromDesignation };
