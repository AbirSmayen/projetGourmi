const express = require("express");
const router = express.Router();
const { 
  userLogin, 
  userSignUp, 
  getUser,
  getMyProfile,
  updateProfile,
  changePassword,
  upload
} = require('../controller/user');
const verifyToken = require('../middleware/auth'); 

// Routes publiques
router.post("/signUp", userSignUp);
router.post("/login", userLogin);
router.get("/user/:id", getUser);

// Routes protégées (nécessitent authentification)
router.get("/profile", verifyToken, getMyProfile);
router.put("/profile", verifyToken, upload, updateProfile);
router.put("/change-password", verifyToken, changePassword);

module.exports = router;