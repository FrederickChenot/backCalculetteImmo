// index.js
const express = require('express');
const cookieParser = require('cookie-parser');
const { incrementVisitCount, getVisitCount } = require('./hebergeurBase');
require('dotenv').config(); // Charge les variables d'environnement du fichier .env
const cors = require('cors');


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: 'http://localhost:3001', // Remplace par l'URL du front-end
  credentials: true, // Autorise l'envoi des cookies
}));

app.use(express.json());
app.use(cookieParser()); // Utilise cookie-parser pour manipuler les cookies

// Route pour récupérer le compteur de visites
app.get('/get-visit-count', async (req, res) => {
  try {
    const visitCount = await getVisitCount(); // Récupère le nombre de visites depuis la base de données
    res.json({ visitCount });
  } catch (error) {
    console.error('Erreur lors de la récupération du compteur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route pour incrémenter le compteur de visites
app.post('/increment-visit', async (req, res) => {
  const userVisited = req.cookies.user_visited; // Vérifie si le cookie existe
  
  if (userVisited) {
    // Si l'utilisateur a déjà visité, on ne l'incrémente pas
    return res.json({ message: 'Visite déjà comptabilisée' });
  }

  try {
    // Incrémente le compteur de visites dans la base de données
    const newVisitCount = await incrementVisitCount();
    
    // Crée un cookie pour l'utilisateur avec une durée de 24 heures
    res.cookie('user_visited', 'true', { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });

    res.json({ message: 'Visite comptabilisée', visitCount: newVisitCount });
  } catch (error) {
    console.error('Erreur lors de l\'incrémentation du compteur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Démarre le serveur
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
