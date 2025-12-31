import express from "express";
import { 
  createIdea, 
  getAllIdeas, 
  getUserIdeas, 
  getIdeaById, 
  updateIdea,
  deleteIdea, 
  toggleLike, 
  addComment,
  reportIdea,
  reportComment,
  getStatistics
} from "../controllers/idea.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

// Routes protégées (authentification requise)
router.post("/", verifyToken, createIdea);
router.get("/my-ideas", verifyToken, getUserIdeas);
router.get("/statistics", verifyToken, getStatistics);
router.get("/", getAllIdeas); // Public route for feed
router.get("/:id", getIdeaById);
router.put("/:id", verifyToken, updateIdea); // Update idea (admin or author)
router.delete("/:id", verifyToken, deleteIdea);
router.post("/:id/like", verifyToken, toggleLike);
router.post("/:id/comment", verifyToken, addComment);
router.post("/:id/report", verifyToken, reportIdea);
router.post("/:id/comments/:commentId/report", verifyToken, reportComment);

export default router;

