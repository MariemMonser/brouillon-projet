import express from "express";
import { getAllUsers, updateUser, deleteUser } from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Toutes les routes nécessitent une authentification et un rôle admin
router.get("/", verifyToken, getAllUsers);
router.put("/:id", verifyToken, updateUser);
router.delete("/:id", verifyToken, deleteUser);

export default router;

