const Recipes=require("../models/recipe")
const multer = require('multer')

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images')
  },
  filename: function (req, file, cb) {
    const filename = Date.now() + '-' + file.fieldname
    cb(null, filename)
  }
})

const upload = multer({ storage: storage })

const getRecipes=async(req,res)=>{
    const recipes=await Recipes.find()
    return res.json(recipes)
}

const getRecipe = async (req, res) => {
    try {
        const recipe = await Recipes.findById(req.params.id).populate("createdBy", "name email");
        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found" })
        }
        res.json(recipe);
    } catch (err) {
        console.error("Error fetching recipe:", err)
        return res.status(500).json({ message: "Error fetching recipe" })
    }
}

const addRecipe = async(req, res) => {
    console.log(req.user)
    const {title, ingredients, instructions, time} = req.body

    if(!title || !ingredients || !instructions){
        return res.json({message: "Required fields can't be empty"})
    }

    // Transformer la chaîne d'ingrédients en tableau
    let ingredientsArray = ingredients
    if (typeof ingredients === 'string') {
        ingredientsArray = ingredients.split(',').map(item => item.trim())
    }

    const newRecipe = await Recipes.create({
        title,
        ingredients: ingredientsArray,
        instructions,
        time,
        coverImage: req.file.filename,
        createdBy: req.user.id
    })
    return res.json(newRecipe)
}

// Fonction editRecipe 
const editRecipe = async(req, res) => {
    try {
        const {title, ingredients, instructions, time} = req.body
        
        // Vérifier si la recette existe
        let recipe = await Recipes.findById(req.params.id)
        
        if (!recipe) {
            return res.status(404).json({ 
                success: false, 
                message: "Recipe not found" 
            })
        }

        // Vérifier si l'utilisateur est le propriétaire
        if (recipe.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ 
                success: false, 
                message: "Not authorized to edit this recipe" 
            })
        }

        // Transformer les ingrédients en tableau si c'est une chaîne
        let ingredientsArray = ingredients
        if (typeof ingredients === 'string') {
            ingredientsArray = ingredients.split(',').map(item => item.trim())
        }

        // Gérer l'image : garder l'ancienne si aucune nouvelle n'est fournie
        let coverImage = req.file?.filename || recipe.coverImage

        // Mettre à jour la recette
        const updatedRecipe = await Recipes.findByIdAndUpdate(
            req.params.id,
            {
                title,
                ingredients: ingredientsArray,
                instructions,
                time,
                coverImage
            },
            { new: true }
        )

        return res.json({ 
            success: true,
            message: "Recipe updated successfully",
            recipe: updatedRecipe
        })
        
    } catch(err) {
        console.error("Error updating recipe:", err)
        return res.status(500).json({ 
            success: false, 
            message: "Error updating recipe: " + err.message 
        })
    }
}

const deleteRecipe = async(req, res) => {
    try {
        const recipe = await Recipes.findById(req.params.id)
        
        if (!recipe) {
            return res.status(404).json({ 
                success: false, 
                message: "Recipe not found" 
            })
        }

        await Recipes.deleteOne({ _id: req.params.id })
        
        return res.json({ 
            success: true,
            status: "ok",
            message: "Recipe deleted successfully" 
        })
    } catch(err) {
        console.error(err)
        return res.status(400).json({ 
            success: false,
            message: "Error deleting recipe" 
        })
    }
}

const getMyRecipes = async (req, res) => {
    try {
        const recipes = await Recipes.find({ createdBy: req.user.id })
        return res.json(recipes)
    } catch (err) {
        return res.status(500).json({ message: "Error fetching user recipes" })
    }
}

module.exports={getRecipes, getRecipe, addRecipe, editRecipe, deleteRecipe, getMyRecipes, upload}