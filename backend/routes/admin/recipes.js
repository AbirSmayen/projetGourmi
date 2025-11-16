const express = require("express");
const router = express.Router();
const Recipe = require("../../models/recipe");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Seules les images sont autorisées"));
  },
});

// GET toutes les recettes
router.get("/", async (req, res) => {
  try {
    const recipes = await Recipe.find()
      .populate("createdBy", "firstName lastName email")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: recipes });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

//Créer une recette officielle
router.post("/official", upload.single("file"), async (req, res) => {
  try {
    const { title, ingredients, instructions, time } = req.body;
    let parsedIngredients = ingredients;
    if (typeof ingredients === "string") {
      try {
        parsedIngredients = JSON.parse(ingredients);
      } catch {
        parsedIngredients = ingredients.split(",").map((i) => i.trim());
      }
    }
    const newRecipe = await Recipe.create({
      title,
      ingredients: parsedIngredients,
      instructions,
      time,
      coverImage: req.file ? req.file.filename : "default-recipe.jpg",
      isOfficial: true, // Recette officielle
      isAccepted: false, // N/A pour les recettes officielles
      createdBy: null, // null pour les recettes officielles
    });
    res
      .status(201)
      .json({ success: true, message: "Recette officielle créée", data: newRecipe });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

//Accepter une recette utilisateur
router.put("/:id/accept", async (req, res) => {
  try {
    const { isAccepted } = req.body;
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ success: false, message: "Recette introuvable" });
    }

    // Ne peut accepter que les recettes utilisateurs (non officielles)
    if (recipe.isOfficial) {
      return res.status(400).json({ 
        success: false, 
        message: "Impossible de modifier le statut d'une recette officielle" 
      });
    }

    const updated = await Recipe.findByIdAndUpdate(
      req.params.id,
      { isAccepted },
      { new: true }
    ).populate("createdBy", "firstName lastName");
    
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Supprimer une recette
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Recipe.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ success: false, message: "Recette introuvable" });
    res.status(200).json({ success: true, message: "Recette supprimée" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;