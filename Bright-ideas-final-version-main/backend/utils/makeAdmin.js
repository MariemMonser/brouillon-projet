import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/user.model.js";
import { connectDB } from "../db/connectDB.js";

dotenv.config();

/**
 * Script pour définir un utilisateur comme admin
 * Usage: node backend/utils/makeAdmin.js <email>
 */

const makeUserAdmin = async () => {
  try {
    // Connexion à la base de données
    await connectDB();

    // Récupérer l'email depuis les arguments de ligne de commande
    const email = process.argv[2];

    if (!email) {
      console.error("❌ Erreur: Veuillez fournir un email");
      console.log("Usage: node backend/utils/makeAdmin.js <email>");
      process.exit(1);
    }

    // Trouver l'utilisateur
    const user = await User.findOne({ email });

    if (!user) {
      console.error(`❌ Utilisateur avec l'email "${email}" non trouvé`);
      process.exit(1);
    }

    // Vérifier si l'utilisateur est déjà admin
    if (user.role === 'admin') {
      console.log(`ℹ️  L'utilisateur "${user.alias}" (${email}) est déjà admin`);
      process.exit(0);
    }

    // Définir comme admin
    user.role = 'admin';
    await user.save();

    console.log(`✅ L'utilisateur "${user.alias}" (${email}) est maintenant admin`);
    console.log(`   Nom: ${user.name}`);
    console.log(`   Alias: ${user.alias}`);
    
    // Fermer la connexion
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur:", error.message);
    process.exit(1);
  }
};

makeUserAdmin();

