const Recipes = require("../models/recipe")
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

const getRecipes = async(req, res) => {
    const recipes = await Recipes.find()
    return res.json(recipes)
}

const getRecipe = async (req, res) => {
    try {
        const recipe = await Recipes.findById(req.params.id)
            .populate("createdBy", "firstName lastName")
            .populate("likes", "firstName lastName email")
            .populate("comments.user", "firstName lastName");
        
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

const editRecipe = async(req, res) => {
    try {
        const {title, ingredients, instructions, time} = req.body
        
        let recipe = await Recipes.findById(req.params.id)
        
        if (!recipe) {
            return res.status(404).json({ 
                success: false, 
                message: "Recipe not found" 
            })
        }

        if (recipe.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ 
                success: false, 
                message: "Not authorized to edit this recipe" 
            })
        }

        let ingredientsArray = ingredients
        if (typeof ingredients === 'string') {
            ingredientsArray = ingredients.split(',').map(item => item.trim())
        }

        let coverImage = req.file?.filename || recipe.coverImage

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

// ========== INTERACTIONS ==========

// Toggle Like
const toggleLike = async (req, res) => {
    try {
        const recipe = await Recipes.findById(req.params.id)
        
        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found" })
        }

        const userId = req.user.id
        const likeIndex = recipe.likes.indexOf(userId)

        if (likeIndex > -1) {
            // Unlike
            recipe.likes.splice(likeIndex, 1)
        } else {
            // Like
            recipe.likes.push(userId)
        }

        await recipe.save()

        return res.json({ 
            success: true,
            likes: recipe.likes.length,
            isLiked: likeIndex === -1
        })
    } catch (err) {
        console.error("Error toggling like:", err)
        return res.status(500).json({ message: "Error toggling like" })
    }
}

// Add Comment
const addComment = async (req, res) => {
    try {
        const { text } = req.body
        
        if (!text || text.trim() === "") {
            return res.status(400).json({ message: "Comment text is required" })
        }

        const recipe = await Recipes.findById(req.params.id)
        
        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found" })
        }

        const newComment = {
            user: req.user.id,
            text: text.trim(),
            createdAt: new Date()
        }

        recipe.comments.push(newComment)
        await recipe.save()

        // Populate le user du nouveau commentaire
        const populatedRecipe = await Recipes.findById(req.params.id)
            .populate("comments.user", "firstName lastName")
        
        const addedComment = populatedRecipe.comments[populatedRecipe.comments.length - 1]

        return res.json({ 
            success: true,
            comment: addedComment
        })
    } catch (err) {
        console.error("Error adding comment:", err)
        return res.status(500).json({ message: "Error adding comment" })
    }
}

// Delete Comment
const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params
        
        const recipe = await Recipes.findById(req.params.id)
        
        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found" })
        }

        // Trouver l'index du commentaire
        const commentIndex = recipe.comments.findIndex(
            comment => comment._id.toString() === commentId
        )
        
        if (commentIndex === -1) {
            return res.status(404).json({ message: "Comment not found" })
        }

        const comment = recipe.comments[commentIndex]

        // Vérifier si l'utilisateur est le propriétaire du commentaire
        if (comment.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to delete this comment" })
        }

        // Supprimer le commentaire avec splice
        recipe.comments.splice(commentIndex, 1)
        await recipe.save()

        return res.json({ 
            success: true,
            message: "Comment deleted successfully"
        })
    } catch (err) {
        console.error("Error deleting comment:", err)
        return res.status(500).json({ message: "Error deleting comment" })
    }
}

// Edit Comment
const editComment = async (req, res) => {
    try {
        const { commentId } = req.params
        const { text } = req.body
        
        if (!text || text.trim() === "") {
            return res.status(400).json({ message: "Comment text is required" })
        }

        const recipe = await Recipes.findById(req.params.id)
        
        if (!recipe) {
            return res.status(404).json({ message: "Recipe not found" })
        }

        // Trouver le commentaire
        const comment = recipe.comments.id(commentId)
        
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" })
        }

        // Vérifier si l'utilisateur est le propriétaire du commentaire
        if (comment.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to edit this comment" })
        }

        // Mettre à jour le commentaire
        comment.text = text.trim()
        comment.isEdited = true
        await recipe.save()

        // Populate le user
        const updatedRecipe = await Recipes.findById(req.params.id)
            .populate("comments.user", "firstName lastName")
        
        const updatedComment = updatedRecipe.comments.id(commentId)

        return res.json({ 
            success: true,
            comment: updatedComment,
            message: "Comment updated successfully"
        })
    } catch (err) {
        console.error("Error editing comment:", err)
        return res.status(500).json({ message: "Error editing comment" })
    }
}

module.exports = {
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
}