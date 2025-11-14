const express = require("express");
const router = express.Router();
const User = require("../../models/user");
const Recipe = require("../../models/recipe");

// ========== STATISTIQUES GÉNÉRALES ==========

// GET - Statistiques globales du dashboard
router.get("/", async (req, res) => {
  try {
    // Compter les utilisateurs
    const totalUsers = await User.countDocuments();
    
    // Compter les recettes
    const totalRecipes = await Recipe.countDocuments();
    const officialRecipes = await Recipe.countDocuments({ isOfficial: true });
    const userRecipes = await Recipe.countDocuments({ isOfficial: false });
    
    // Utilisateurs récents (derniers 30 jours)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    // Recettes récentes (derniers 30 jours)
    const recentRecipes = await Recipe.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    res.status(200).json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          recent: recentUsers
        },
        recipes: {
          total: totalRecipes,
          official: officialRecipes,
          user: userRecipes,
          recent: recentRecipes
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques",
      error: error.message
    });
  }
});

// GET - Statistiques des utilisateurs
router.get("/users", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    
    // Utilisateurs par mois (12 derniers mois)
    const usersByMonth = await User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": -1, "_id.month": -1 }
      },
      {
        $limit: 12
      }
    ]);
    
    // Top 5 utilisateurs avec le plus de recettes
    const topUsers = await Recipe.aggregate([
      {
        $group: {
          _id: "$createdBy",
          recipeCount: { $sum: 1 }
        }
      },
      {
        $sort: { recipeCount: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      },
      {
        $project: {
          _id: 1,
          recipeCount: 1,
          "user.firstName": 1,
          "user.lastName": 1,
          "user.email": 1
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        total: totalUsers,
        byMonth: usersByMonth,
        topContributors: topUsers
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques utilisateurs",
      error: error.message
    });
  }
});

// GET - Statistiques des recettes
router.get("/recipes", async (req, res) => {
  try {
    const totalRecipes = await Recipe.countDocuments();
    const officialRecipes = await Recipe.countDocuments({ isOfficial: true });
    const userRecipes = await Recipe.countDocuments({ isOfficial: false });
    
    // Recettes par mois (12 derniers mois)
    const recipesByMonth = await Recipe.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": -1, "_id.month": -1 }
      },
      {
        $limit: 12
      }
    ]);
    
    // Distribution par temps de préparation (si applicable)
    const recipesByTime = await Recipe.aggregate([
      {
        $group: {
          _id: "$time",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        total: totalRecipes,
        official: officialRecipes,
        user: userRecipes,
        byMonth: recipesByMonth,
        byTime: recipesByTime
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques des recettes",
      error: error.message
    });
  }
});

// GET - Statistiques d'activité récente
router.get("/activity", async (req, res) => {
  try {
    // Derniers utilisateurs inscrits
    const latestUsers = await User.find()
      .select('firstName lastName email createdAt')
      .sort({ createdAt: -1 })
      .limit(5);
    
    // Dernières recettes ajoutées
    const latestRecipes = await Recipe.find()
      .populate('createdBy', 'firstName lastName')
      .select('title createdAt isOfficial')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.status(200).json({
      success: true,
      data: {
        latestUsers,
        latestRecipes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération de l'activité récente",
      error: error.message
    });
  }
});

// GET - Statistiques par période personnalisée
router.get("/custom", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Les dates de début et de fin sont requises"
      });
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const usersInPeriod = await User.countDocuments({
      createdAt: { $gte: start, $lte: end }
    });
    
    const recipesInPeriod = await Recipe.countDocuments({
      createdAt: { $gte: start, $lte: end }
    });
    
    res.status(200).json({
      success: true,
      data: {
        period: {
          start: startDate,
          end: endDate
        },
        users: usersInPeriod,
        recipes: recipesInPeriod
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération des statistiques personnalisées",
      error: error.message
    });
  }
});

// GET - Dashboard résumé (pour la page d'accueil admin)
router.get("/dashboard", async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const stats = {
      users: {
        total: await User.countDocuments(),
        today: await User.countDocuments({ createdAt: { $gte: today } })
      },
      recipes: {
        total: await Recipe.countDocuments(),
        official: await Recipe.countDocuments({ isOfficial: true }),
        user: await Recipe.countDocuments({ isOfficial: false }),
        today: await Recipe.countDocuments({ createdAt: { $gte: today } })
      }
    };
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du dashboard",
      error: error.message
    });
  }
});

module.exports = router;