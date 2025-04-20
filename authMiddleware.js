const jwt = require('jsonwebtoken');
require('dotenv').config();

function authenticateToken(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1]; // Récupère le token du header

  if (!token) {
    return res.status(401).json({ error: 'Accès refusé. Token manquant.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token invalide.' });
    }
    req.user = user; // Stocke l'utilisateur authentifié dans `req.user`
    next();
  });
}

module.exports = { authenticateToken };
