const express=require("express")
const { getRecipes, getRecipe, addRecipe, editRecipe,deleteRecipe } = require("../controller/recipe")//toutes les méthodes du controlleur
const router=express.Router()

//les routes
router.get("/",getRecipes) //Get all recipes
router.get("/:id",getRecipe) //Get recipe by id
router.post("/",addRecipe) //Add recipe
router.put("/:id",editRecipe) //Edit recipe
router.delete("/:id",deleteRecipe) //Delete recipe

module.exports=router