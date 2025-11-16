const express = require("express");
const { 
    getRecipes, 
    getRecipe, 
    addRecipe, 
    editRecipe, 
    deleteRecipe, 
    getMyRecipes, 
    upload,
    toggleLike,
    addComment,
    editComment,    
    deleteComment
} = require("../controller/recipe");
const verifyToken = require("../middleware/auth");
const checkIfBlocked = require("../middleware/checkIfBlocked");
const router = express.Router();

//Les routes spécifiques DOIVENT venir AVANT les routes avec paramètres dynamiques

// Routes publiques
router.get("/", getRecipes);

// Routes protégées - METTRE /my AVANT /:id
router.get("/my", verifyToken, checkIfBlocked, getMyRecipes);

// Routes avec paramètres dynamiques (APRÈS les routes spécifiques)
router.get("/:id", getRecipe);
router.post("/", verifyToken, checkIfBlocked, upload.single('file'), addRecipe);
router.put("/:id", verifyToken, checkIfBlocked, upload.single('file'), editRecipe);
router.delete("/:id", verifyToken, checkIfBlocked, deleteRecipe);

// Routes d'interaction
router.post("/:id/like", verifyToken, checkIfBlocked, toggleLike);
router.post("/:id/comment", verifyToken, checkIfBlocked, addComment);
router.put("/:id/comment/:commentId", verifyToken, checkIfBlocked, editComment);
router.delete("/:id/comment/:commentId", verifyToken, checkIfBlocked, deleteComment);

module.exports = router;