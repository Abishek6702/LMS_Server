const jwt = require("jsonwebtoken");

const generateToken = (user, extra) => {
  const payload = {
    id: user._id,
    email: user.email,
    role: user.role,
    name: extra?.name,
    designation: extra?.designation,
    department: extra?.department,
    isAllocatedAdmin:extra?.isAllocatedAdmin,

  };

  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
};

module.exports = { generateToken };
