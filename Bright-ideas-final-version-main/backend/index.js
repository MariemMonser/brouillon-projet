import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from "./db/connectDB.js";

import authRoutes from "./routes/auth.route.js";
import ideaRoutes from "./routes/idea.route.js";
import userRoutes from "./routes/user.route.js";

// Chargement des variables d'environnement depuis le fichier .env
dotenv.config();

//Création d'une instance de l'application Express
const app = express();

// Si le fichier .env contient une variable PORT, on l'utilise, sinon on prend 5000 par défaut
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: "http://localhost:3000", // URL de votre frontend React
  credentials: true, // Important pour les cookies JWT
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ IMPORTANT : Cookie Parser doit être AVANT les routes
app.use(cookieParser());

// Middleware pour analyser le JSON avec limite augmentée pour les photos en base64
app.use(express.json({ limit: '50mb' })); // Accepte jusqu'à 50MB
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use("/api/auth", authRoutes); // Déclaration des routes d'authentification
app.use("/api/ideas", ideaRoutes); // Déclaration des routes d'idées
app.use("/api/users", userRoutes); // Déclaration des routes d'utilisateurs

// Démarrage du serveur sur le port défini
app.listen(PORT, () => {
  connectDB(); // Connexion à la base de données MongoDB quand le serveur démarre
  console.log(`Server is running on port ${PORT}`);
});