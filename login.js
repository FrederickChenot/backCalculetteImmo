const express = require('express');
const jwt = require('jsonwebtoken');
const { Client } = require('pg');
require('dotenv').config();

const router = express.Router();

// Connexion à PostgreSQL
const client = new Client({
  connectionString: process.env.DATABASE_URL2, // Vérifie que c'est bien ta base locale
});
client.connect();

// 🔹 Route de connexion avec vérification dans la BDD
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await client.query(
      'SELECT id, username FROM users WHERE username = $1 AND password_hash = $2',
      [username, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Identifiants incorrects' });
    }

    const user = result.rows[0];

    // Génération du token JWT
    const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
  } catch (error) {
    console.error('❌ Erreur lors de la connexion:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
module.exports = router;
