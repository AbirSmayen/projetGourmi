const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userSignUp = async (req, res) => {
  const { email, password, firstName, lastName, role, preferences } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  // Vérifier si firstName et lastName sont fournis lors de l'inscription
  if (!firstName || !lastName) {
    return res.status(400).json({ message: "First name and last name are required" });
  }

  let user = await User.findOne({ email });
  if (user) {
    return res.status(400).json({ error: "Email already exists" });
  }

  const hashPwd = await bcrypt.hash(password, 10);
  
  // Créer l'objet utilisateur
  const userData = {
    firstName,
    lastName,
    email,
    password: hashPwd,
    role: role || "user",
  };

  // Ajouter les préférences si elles sont fournies
  if (preferences) {
    userData.preferences = preferences;
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

  let user = await User.findOne({ email });  //vérifie si l'user existe ou non
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
  const user = await User.findById(req.params.id);
  res.json({ 
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    preferences: user.preferences
  });
};

module.exports = { userLogin, userSignUp, getUser };