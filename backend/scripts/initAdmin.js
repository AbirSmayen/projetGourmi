const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const readline = require("readline");
require("dotenv").config();

const User = require("../models/user");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.CONNECTION_STRING);
    console.log(" Connecté à MongoDB");
  } catch (error) {
    console.error(" Erreur de connexion:", error);
    process.exit(1);
  }
};

const initAdmin = async () => {
  try {
    // Vérifier s'il existe déjà un admin
    const existingAdmin = await User.findOne({ role: "admin" });
    
    if (existingAdmin) {
      console.log("\nUn administrateur existe déjà!");
      console.log(` Email: ${existingAdmin.email}`);
      
      const replace = await question(
        "\n❓ Voulez-vous le remplacer? (oui/non): "
      );
      
      if (replace.toLowerCase() !== "oui") {
        console.log(" Opération annulée");
        rl.close();
        process.exit(0);
        return;
      }
      
      // Supprimer l'ancien admin
      await User.deleteOne({ _id: existingAdmin._id });
      console.log("Ancien admin supprimé");
    }

    console.log("\n🔐 Création du compte administrateur unique\n");

    // Demander les informations
    const email = await question("Email de l'admin: ");
    
    if (!email || !email.includes("@")) {
      console.log(" Email invalide");
      rl.close();
      process.exit(1);
      return;
    }

    const password = await question("Mot de passe (min. 6 caractères): ");
    
    if (!password || password.length < 6) {
      console.log(" Mot de passe trop court (minimum 6 caractères)");
      rl.close();
      process.exit(1);
      return;
    }

    const confirmPassword = await question(" Confirmer le mot de passe: ");
    
    if (password !== confirmPassword) {
      console.log(" Les mots de passe ne correspondent pas");
      rl.close();
      process.exit(1);
      return;
    }

    // Créer le hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'admin
    const admin = await User.create({
      email,
      password: hashedPassword,
      role: "admin",
      firstName: "Admin",
      lastName: "Principal",
    });

    console.log("\nAdministrateur créé avec succès!");
    console.log(`Email: ${admin.email}`);
    console.log(`ID: ${admin._id}`);
    console.log(`Rôle: ${admin.role}`);
    console.log("\n Vous pouvez maintenant vous connecter au backoffice!");

  } catch (error) {
    console.error("\n Erreur lors de la création:", error.message);
  } finally {
    rl.close();
    mongoose.connection.close();
    process.exit(0);
  }
};

// Exécuter
(async () => {
  await connectDb();
  await initAdmin();
})();