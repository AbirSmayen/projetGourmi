const User = require("../models/user");

const checkIfBlocked = async (req, res, next) => {
  try {
    // Vérifier que l'utilisateur est authentifié
    if (!req.user || !req.user.id) {
      return res.status(401).json({ 
        success: false,
        message: "Unauthorized - Authentication required" 
      });
    }

    // Récupérer l'utilisateur depuis la base de données
    const user = await User.findById(req.user.id).select("isBlocked role");
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // Les admins ne sont jamais bloqués
    if (user.role === "admin") {
      return next();
    }

    // Vérifier si l'utilisateur est bloqué
    if (user.isBlocked) {
      return res.status(403).json({ 
        success: false,
        message: "Your account has been blocked by an administrator. You cannot perform this action.",
        isBlocked: true
      });
    }

    // L'utilisateur n'est pas bloqué, continuer
    next();
  } catch (err) {
    console.error("checkIfBlocked error:", err);
    return res.status(500).json({ 
      success: false,
      message: "Server error while checking user status" 
    });
  }
};

module.exports = checkIfBlocked;