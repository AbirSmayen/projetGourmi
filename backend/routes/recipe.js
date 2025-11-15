const express = require("express")
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
} = require("../controller/recipe")
const verifyToken = require("../middleware/auth")
const router = express.Router()

// Routes d'interaction (nécessitent authentification)
router.post("/:id/like", verifyToken, toggleLike)
router.post("/:id/comment", verifyToken, addComment)
router.put("/:id/comment/:commentId", verifyToken, editComment) 
router.delete("/:id/comment/:commentId", verifyToken, deleteComment)

// Routes de base
router.get("/", getRecipes)
router.get("/my", verifyToken, getMyRecipes)
router.get("/:id", getRecipe)
router.post("/", upload.single('file'), verifyToken, addRecipe)
router.put("/:id", verifyToken, upload.single('file'), editRecipe)
router.delete("/:id", deleteRecipe)

module.exports = router