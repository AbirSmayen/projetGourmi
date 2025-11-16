const mongoose = require("mongoose");

const recipeSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    ingredients: {
        type: Array,
        required: true
    },
    instructions: {
        type: String,
        required: true
    },
    time: {
        type: String,
    },
    coverImage: {
        type: String,
    },
    // Recette créée directement par l'admin
    isOfficial: {
        type: Boolean,
        default: false
    },
    // Recette utilisateur acceptée par l'admin
    isAccepted: {
        type: Boolean,
        default: false
    },
    // Pour stocker l'id de l'utilisateur qui a créé la recette
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    // Système de likes
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    // Système de commentaires
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        text: {
            type: String,
            required: true
        },
        isEdited: {
            type: Boolean,
            default: false
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

module.exports = mongoose.model("Recipes", recipeSchema);