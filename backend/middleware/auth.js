
const jwt = require("jsonwebtoken");

const verifyToken = async (req, res, next) => {
  try {
    //extraire d'abord le jeton des entetes
    let token = req.headers["authorization"];
    if (!token) return res.status(401).json({ message: "Token missing" });

    token = token.split(" ")[1]; // "Bearer <token>"
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token" });
      }
      //on stocke la valeur du charge utile que l'on envoyé lors de la génération du jeton dans la requete .user
      req.user = decoded; // { email, id, ... }
      next();
    });
  } catch (err) {
    console.error("verifyToken error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = verifyToken;
