import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    // Essaie de récupérer le token de différentes sources
    let token = req.cookies.token;
    
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Authentification requise - Token manquant" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { _id: decoded.userId }; // Extrait userId du token et le met en _id
    next();
  } catch (error) {
    console.error("Erreur token:", error.message);
    return res.status(401).json({ 
      success: false, 
      message: "Token invalide ou expiré: " + error.message
    });
  }
};

export default verifyToken;