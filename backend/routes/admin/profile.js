// backend/routes/admin/profile.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("../../models/user");

// GET - Obtenir les infos du profil admin
router.get("/", async (req, res) => {
  try {
    const admin = await User.findById(req.user.id).select("-password");
    if (!admin) {
      return res.status(404).json({ error: "Admin non trouvé" });
    }
    res.json({ success: true, data: admin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PUT - Modifier l'email
router.put("/email", async (req, res) => {
  try {
    const { newEmail } = req.body;

    if (!newEmail || !newEmail.includes("@")) {
      return res.status(400).json({ error: "Email invalide" });
    }

    // Vérifier si l'email est déjà utilisé
    const existing = await User.findOne({ email: newEmail, _id: { $ne: req.user.id } });
    if (existing) {
      return res.status(400).json({ error: "Cet email est déjà utilisé" });
    }

    const admin = await User.findByIdAndUpdate(
      req.user.id,
      { email: newEmail },
      { new: true }
    ).select("-password");

    res.json({ success: true, message: "Email modifié avec succès", data: admin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PUT - Changer le mot de passe
router.put("/password", async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    // Validations
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: "Tous les champs sont requis" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Les nouveaux mots de passe ne correspondent pas" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Le mot de passe doit contenir au moins 6 caractères" });
    }

    // Vérifier le mot de passe actuel
    const admin = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, admin.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Mot de passe actuel incorrect" });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Mettre à jour
    await User.findByIdAndUpdate(req.user.id, { password: hashedPassword });

    res.json({ success: true, message: "Mot de passe modifié avec succès" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;