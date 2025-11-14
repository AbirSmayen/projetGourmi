const User = require("../models/user");

const isAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const user = await User.findById(req.user.id).select("role");
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch (err) {
    console.error("isAdmin error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = isAdmin;
