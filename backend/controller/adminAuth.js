// controllers/adminAuth.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.adminSignUp = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email et mot de passe requis" });

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: "Email déjà utilisé" });

    const hashedPwd = await bcrypt.hash(password, 10);

    const newAdmin = await User.create({
      email,
      password: hashedPwd,
      role: "admin", // c’est ici qu’on force le rôle admin
    });

    const token = jwt.sign(
      { id: newAdmin._id, role: newAdmin.role },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );

    return res.status(201).json({ token, user: newAdmin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: "Email et mot de passe requis" });

    const admin = await User.findOne({ email });
    if (!admin)
      return res.status(400).json({ error: "Compte administrateur introuvable" });

    if (admin.role !== "admin")
      return res.status(403).json({ error: "Accès réservé aux administrateurs" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch)
      return res.status(400).json({ error: "Mot de passe incorrect" });

    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );

    return res.status(200).json({ token, user: admin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
