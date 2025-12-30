import { Idea } from "../models/idea.model.js";
import { User } from "../models/user.model.js";

// CREATE IDEA
export const createIdea = async (req, res) => {
  try {
    const { text, image } = req.body;
    const userId = req.user._id;

    if (!text || text.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "L'idée doit contenir au moins 10 caractères"
      });
    }

    if (text.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "L'idée ne peut pas dépasser 2000 caractères"
      });
    }

    const idea = new Idea({
      text: text.trim(),
      image: image || null,
      author: userId
    });

    await idea.save();
    await idea.populate('author', 'name alias profilePhoto');

    res.status(201).json({
      success: true,
      message: "Idée publiée avec succès",
      idea
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET ALL IDEAS (for feed)
export const getAllIdeas = async (req, res) => {
  try {
    const ideas = await Idea.find()
      .populate('author', 'name alias profilePhoto email')
      .populate('likes', 'name alias _id')
      .populate('comments.user', 'name alias profilePhoto')
      .sort({ createdAt: -1 });

    // Sort by likes count (most liked to least liked), then by creation date
    ideas.sort((a, b) => {
      const likesA = a.likes?.length || 0;
      const likesB = b.likes?.length || 0;
      if (likesB !== likesA) {
        return likesB - likesA; // Sort by likes count descending
      }
      // If likes are equal, sort by creation date descending
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    res.status(200).json({
      success: true,
      ideas
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET USER'S IDEAS
export const getUserIdeas = async (req, res) => {
  try {
    const userId = req.user._id;
    const ideas = await Idea.find({ author: userId })
      .populate('author', 'name alias profilePhoto')
      .populate('likes', 'name alias')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      ideas
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET IDEA BY ID
export const getIdeaById = async (req, res) => {
  try {
    const { id } = req.params;
    const idea = await Idea.findById(id)
      .populate('author', 'name alias profilePhoto')
      .populate('likes', 'name alias')
      .populate('comments.user', 'name alias profilePhoto');

    if (!idea) {
      return res.status(404).json({
        success: false,
        message: "Idée non trouvée"
      });
    }

    res.status(200).json({
      success: true,
      idea
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// UPDATE IDEA (Admin or author)
export const updateIdea = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text || text.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Le texte doit contenir au moins 10 caractères"
      });
    }

    if (text.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Le texte ne peut pas dépasser 2000 caractères"
      });
    }

    const idea = await Idea.findById(id);
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: "Idée non trouvée"
      });
    }

    // Vérifier que l'utilisateur est l'auteur ou un admin
    const user = await User.findById(userId);
    if (idea.author.toString() !== userId.toString() && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Vous n'êtes pas autorisé à modifier cette idée"
      });
    }

    idea.text = text.trim();
    await idea.save();
    await idea.populate('author', 'name alias profilePhoto');

    res.status(200).json({
      success: true,
      message: "Idée modifiée avec succès",
      idea
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE IDEA
export const deleteIdea = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const idea = await Idea.findById(id);
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: "Idée non trouvée"
      });
    }

    // Vérifier que l'utilisateur est l'auteur ou un admin
    const user = await User.findById(userId);
    if (idea.author.toString() !== userId.toString() && user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Vous n'êtes pas autorisé à supprimer cette idée"
      });
    }

    await Idea.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Idée supprimée avec succès"
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// LIKE/UNLIKE IDEA
export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const idea = await Idea.findById(id);
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: "Idée non trouvée"
      });
    }

    const isLiked = idea.likes.includes(userId);

    if (isLiked) {
      idea.likes = idea.likes.filter(likeId => likeId.toString() !== userId.toString());
    } else {
      idea.likes.push(userId);
    }

    await idea.save();
    await idea.populate('likes', 'name alias');

    res.status(200).json({
      success: true,
      message: isLiked ? "Like retiré" : "Idée likée",
      likesCount: idea.likes.length,
      isLiked: !isLiked
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ADD COMMENT
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Le commentaire ne peut pas être vide"
      });
    }

    if (text.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Le commentaire ne peut pas dépasser 500 caractères"
      });
    }

    const idea = await Idea.findById(id);
    if (!idea) {
      return res.status(404).json({
        success: false,
        message: "Idée non trouvée"
      });
    }

    idea.comments.push({
      user: userId,
      text: text.trim()
    });

    await idea.save();
    await idea.populate('comments.user', 'name alias profilePhoto');

    res.status(200).json({
      success: true,
      message: "Commentaire ajouté",
      comment: idea.comments[idea.comments.length - 1]
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET STATISTICS (for admin)
export const getStatistics = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Accès refusé. Admin uniquement."
      });
    }

    const totalUsers = await User.countDocuments();
    const totalIdeas = await Idea.countDocuments();
    const totalReports = await Idea.countDocuments({ isReported: true });
    
    // Calculer le total de likes
    const allIdeas = await Idea.find();
    const totalLikes = allIdeas.reduce((sum, idea) => sum + (idea.likes?.length || 0), 0);
    
    // Ideas created this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const ideasThisMonth = await Idea.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Users created this month
    const usersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth }
    });

    // Last month for comparison
    const lastMonth = new Date(startOfMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthEnd = new Date(startOfMonth);
    lastMonthEnd.setMilliseconds(lastMonthEnd.getMilliseconds() - 1);

    const ideasLastMonth = await Idea.countDocuments({
      createdAt: { $gte: lastMonth, $lte: lastMonthEnd }
    });

    const usersLastMonth = await User.countDocuments({
      createdAt: { $gte: lastMonth, $lte: lastMonthEnd }
    });

    // Calculate trends
    const ideasTrend = ideasLastMonth > 0 
      ? ((ideasThisMonth - ideasLastMonth) / ideasLastMonth * 100).toFixed(1)
      : ideasThisMonth > 0 ? '100' : '0';
    
    const usersTrend = usersLastMonth > 0
      ? ((usersThisMonth - usersLastMonth) / usersLastMonth * 100).toFixed(1)
      : usersThisMonth > 0 ? '100' : '0';

    res.status(200).json({
      success: true,
      statistics: {
        totalUsers,
        totalIdeas,
        totalLikes,
        totalReports,
        ideasThisMonth,
        usersThisMonth,
        ideasTrend: parseFloat(ideasTrend),
        usersTrend: parseFloat(usersTrend)
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

