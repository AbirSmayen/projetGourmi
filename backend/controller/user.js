const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

// Configuration multer pour l'upload d'images de profil
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images/profiles");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Only image files are allowed!"));
  },
}).single("profileImage");

const userSignUp = async (req, res) => {
  const { email, password, firstName, lastName, role, preferences } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  if (!firstName || !lastName) {
    return res.status(400).json({ message: "First name and last name are required" });
  }

  let user = await User.findOne({ email });
  if (user) {
    return res.status(400).json({ error: "Email already exists" });
  }

  const hashPwd = await bcrypt.hash(password, 10);
  
  const userData = {
    firstName,
    lastName,
    email,
    password: hashPwd,
    role: role || "user",
  };

  // FIX: S'assurer que preferences est bien structuré
  if (preferences) {
    userData.preferences = {
      regime: Array.isArray(preferences.regime) ? preferences.regime : [],
      objectifs: Array.isArray(preferences.objectifs) ? preferences.objectifs : []
    };
  } else {
    userData.preferences = {
      regime: [],
      objectifs: []
    };
  }

  const newUser = await User.create(userData);

  const token = jwt.sign(
    { email, id: newUser._id, role: newUser.role },
    process.env.SECRET_KEY,
    { expiresIn: "7d" }
  );

  return res.status(200).json({ token, user: newUser });
};


const userLogin = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  let user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign(
      { email, id: user._id, role: user.role },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );
    return res.status(200).json({ token, user });
  } else {
    return res.status(400).json({ error: "Invalid credentials" });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Obtenir le profil de l'utilisateur connecté
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // S'assurer que les préférences existent
    if (!user.preferences) {
      user.preferences = { regime: [], objectifs: [] };
    }
    
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Mettre à jour le profil utilisateur
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, preferences } = req.body;
    
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (preferences) updateData.preferences = preferences;
    
    if (req.file) {
      updateData.image = req.file.filename;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Mettre à jour le localStorage
    res.json({ 
      success: true, 
      message: "Profile updated successfully", 
      user 
    });
  } catch (err) {
    res.status(500).json({ 
      message: "Error updating profile", 
      error: err.message 
    });
  }
};

// Changer le mot de passe
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: "Current password and new password are required" 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: "New password must be at least 6 characters long" 
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Vérifier le mot de passe actuel
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ 
      success: true, 
      message: "Password changed successfully" 
    });
  } catch (err) {
    res.status(500).json({ 
      message: "Error changing password", 
      error: err.message 
    });
  }
};

module.exports = { 
  userLogin, 
  userSignUp, 
  getUser, 
  getMyProfile, 
  updateProfile, 
  changePassword,
  upload 
};