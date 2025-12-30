import express from "express";
import { signup, login, logout, updateProfile, changePassword } from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js"; // À importer depuis ton middleware

const router = express.Router();

// Routes d'authentification
router.post("/signup", signup);   // POST pour créer un nouvel utilisateur
router.post("/login", login);     // POST pour se connecter
router.post("/logout", logout);   // POST pour se déconnecter

// Routes protégées (authentification requise)
router.put("/update-profile", verifyToken, updateProfile);   // PUT pour mettre à jour le profil
router.put("/change-password", verifyToken, changePassword); // PUT pour changer le mot de passe

export default router;
