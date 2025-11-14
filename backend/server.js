const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv").config();
const connectDb = require("./config/connectionDb");
const verifyToken = require("./middleware/auth");
const isAdmin = require("./middleware/isAdmin");


const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

// pour servir les fichiers statiques
app.use('/images', express.static(path.join(__dirname, 'public/images'))); 

connectDb();

// Routes publiques utilisateurs
app.use("/", require("./routes/user"));
app.use("/api/recipes", require("./routes/recipe"));


// Routes pour l’authentification ADMIN
app.use("/api/admin/auth", require("./routes/adminAuth"));

// Routes protégées ADMIN
app.use(
  "/api/admin/users",verifyToken, isAdmin, require("./routes/admin/users"));
app.use(
  "/api/admin/recipes",
  verifyToken,
  isAdmin,
  require("./routes/admin/recipes")
);
app.use(
  "/api/admin/stats",
  verifyToken,
  isAdmin,
  require("./routes/admin/stats")
);

app.use(
  "/api/admin/profile",
  verifyToken,
  isAdmin,
  require("./routes/admin/profile")
);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
