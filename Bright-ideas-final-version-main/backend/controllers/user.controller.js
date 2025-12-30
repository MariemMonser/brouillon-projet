import { User } from "../models/user.model.js";
import { Idea } from "../models/idea.model.js";

// GET ALL USERS (Admin only)
export const getAllUsers = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Accès refusé. Admin uniquement."
      });
    }

    // Récupérer uniquement les utilisateurs normaux (exclure les admins)
    const users = await User.find({ role: { $ne: 'admin' } })
      .select('-password -verificationToken -resetPasswordToken')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// UPDATE USER (Admin only)
export const updateUser = async (req, res) => {
  try {
    const adminId = req.user._id;
    const { id } = req.params;
    const { name, alias, email, dateOfBirth, address } = req.body;

    const admin = await User.findById(adminId);
    if (admin.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Accès refusé. Admin uniquement."
      });
    }

    // Validation
    if (!name || !alias || !email || !dateOfBirth || !address) {
      return res.status(400).json({
        success: false,
        message: "Tous les champs sont obligatoires"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Format d'email invalide"
      });
    }

    // Vérifier si l'email existe déjà pour un autre utilisateur
    const emailExists = await User.findOne({ email, _id: { $ne: id } });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Cet email est déjà utilisé"
      });
    }

    // Vérifier si l'alias existe déjà pour un autre utilisateur
    const aliasExists = await User.findOne({ alias, _id: { $ne: id } });
    if (aliasExists) {
      return res.status(400).json({
        success: false,
        message: "Cet alias est déjà utilisé"
      });
    }

    // Mettre à jour l'utilisateur (sans changer le rôle)
    const user = await User.findByIdAndUpdate(
      id,
      { name, alias, email, dateOfBirth, address },
      { new: true, runValidators: true }
    ).select('-password -verificationToken -resetPasswordToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }

    res.status(200).json({
      success: true,
      message: "Utilisateur mis à jour avec succès",
      user
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE USER (Admin only) - Supprime aussi toutes ses idées
export const deleteUser = async (req, res) => {
  try {
    const adminId = req.user._id;
    const { id } = req.params;

    const admin = await User.findById(adminId);
    if (admin.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Accès refusé. Admin uniquement."
      });
    }

    // Empêcher la suppression de soi-même
    if (adminId.toString() === id) {
      return res.status(400).json({
        success: false,
        message: "Vous ne pouvez pas supprimer votre propre compte"
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }

    // Supprimer toutes les idées de l'utilisateur
    await Idea.deleteMany({ author: id });

    // Supprimer l'utilisateur
    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Utilisateur et toutes ses idées supprimés avec succès"
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

