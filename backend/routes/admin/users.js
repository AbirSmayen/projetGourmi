const express = require("express");
const router = express.Router();
const User = require("../../models/user");
const bcrypt = require("bcrypt");

// ========== GESTION DES UTILISATEURS ==========

// GET - Récupérer tous les utilisateurs
router.get("/", async (req, res) => {
  try {
    const users = await User.find()
      .select("-password") // Exclure les mots de passe
      .sort({ createdAt: -1 }); // Les plus récents en premier
    
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

// GET - Récupérer un utilisateur par ID
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

// POST - Ajouter un nouvel utilisateur (par l'admin)
router.post("/", async (req, res) => {
  try {
    const { firstName, lastName, email, password, image } = req.body;

    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Cet email est déjà utilisé"
      });
    }

    // Hasher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Créer le nouvel utilisateur
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      image: image || 'default-avatar.png'
    });

    // Retourner sans le mot de passe
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: "Utilisateur créé avec succès",
      data: userResponse
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la création de l'utilisateur",
      error: error.message
    });
  }
});

// PUT - Modifier un utilisateur
router.put("/:id", async (req, res) => {
  try {
    const { firstName, lastName, email, password, image } = req.body;
    
    const updateData = {
      firstName,
      lastName,
      email,
      image
    };

    // Si un nouveau mot de passe est fourni, le hasher
    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur introuvable"
      });
    }

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

// DELETE - Supprimer un utilisateur
router.delete("/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur introuvable"
      });
    }

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