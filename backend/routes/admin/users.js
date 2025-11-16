const express = require("express");
const router = express.Router();
const User = require("../../models/user");
const bcrypt = require("bcrypt");

// Récupérer tous les utilisateurs
router.get("/", async (req, res) => {
  try {
    const users = await User.find()
      .select("-password") 
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des utilisateurs",
      error: error.message
    });
  }
});

// Récupérer un utilisateur par ID
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur introuvable"
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de l'utilisateur",
      error: error.message
    });
  }
});

// Modifier un utilisateur (NOUVELLE VERSION)
router.put("/:id", async (req, res) => {
  try {
    const { firstName, lastName, email, password, image, preferences } = req.body;
    
    // Vérifier si l'utilisateur existe
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur introuvable"
      });
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Cet email est déjà utilisé"
        });
      }
    }
    
    const updateData = {};
    
    // Mettre à jour seulement les champs fournis
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email;
    if (image !== undefined) updateData.image = image;
    if (preferences !== undefined) updateData.preferences = preferences;

    // Si un nouveau mot de passe est fourni, le hasher
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json({
      success: true,
      message: "Utilisateur modifié avec succès",
      data: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la modification de l'utilisateur",
      error: error.message
    });
  }
});

// Bloquer/Débloquer un utilisateur
router.patch("/:id/block", async (req, res) => {
  try {
    const { isBlocked } = req.body;
    
    // Vérifier que isBlocked est un booléen
    if (typeof isBlocked !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "Le champ isBlocked doit être un booléen"
      });
    }

    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur introuvable"
      });
    }

    // Empêcher de bloquer un admin
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Impossible de bloquer un administrateur"
      });
    }

    // Mettre à jour le statut de blocage
    user.isBlocked = isBlocked;
    await user.save();

    // Retourner sans le mot de passe
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: isBlocked ? "Utilisateur bloqué avec succès" : "Utilisateur débloqué avec succès",
      data: userResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors du changement de statut",
      error: error.message
    });
  }
});

// Supprimer un utilisateur
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur introuvable"
      });
    }

    // Empêcher la suppression d'un admin
    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Impossible de supprimer un administrateur"
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Utilisateur supprimé avec succès",
      data: { id: req.params.id }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la suppression de l'utilisateur",
      error: error.message
    });
  }
});

module.exports = router;