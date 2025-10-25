const express=require("express")
const { getRecipes, getRecipe, addRecipe, editRecipe,deleteRecipe, getMyRecipes, upload } = require("../controller/recipe")//toutes les méthodes du controlleur
const verifyToken = require("../middleware/auth")
const router=express.Router()

//les routes
router.get("/",getRecipes) //Get all recipes
router.get("/my", verifyToken, getMyRecipes) // Get user's recipes
router.get("/:id",getRecipe) //Get recipe by id
router.post("/",upload.single('file'),verifyToken ,addRecipe) //Add recipe
router.put("/:id", verifyToken, upload.single('file'), editRecipe) //Edit recipe
router.delete("/:id",deleteRecipe) //Delete recipe

module.exports=router