const express = require("express");
const router = express.Router();
const { adminSignUp, adminLogin } = require("../controller/adminAuth");


// Connexion admin
router.post("/login", adminLogin);

module.exports = router;
