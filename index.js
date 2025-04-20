const axios = require('axios'); // ✅ Import standard fonctionnel

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config(); // Charge les variables d'environnement du fichier .env

const { incrementVisitCount, getVisitCount } = require('./hebergeurBase');
const { authenticateToken } = require('./authMiddleware');
const loginRouter = require('./login');
const { addTransaction, getTransactions, deleteTransaction, calculateTax } = require('./cryptoBase');
console.log('addTransaction importé :', addTransaction); // 🔥 Vérifie si la fonction est bien définie

const app = express();
const PORT = process.env.PORT || 3000;

// Sélection du bon DATABASE_URL en fonction de l'environnement
const DATABASE_URL = process.env.NODE_ENV === 'production' ? process.env.DATABASE_URL : process.env.DATABASE_URL2;

// Définition des origines autorisées
const allowedOrigins = [
  'https://calculetteimmo.com', // Domaine de production
  'http://localhost:3001'       // Domaine de développement
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);  // Autorise l'origine
    } else {
      callback(new Error('Not allowed by CORS'));  // Refuse l'origine
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser()); // Pour manipuler les cookies

// 🔹 Route principale : Appel à l'API Banque de France
const API_URL = 'https://webstat.banque-france.fr/api/explore/v2.1/catalog/datasets/observations/records';
const API_KEY = process.env.API_KEY;

app.get('/taux', async (req, res) => {
  try {
    const response = await axios.get(API_URL, {
      params: {
        where: 'series_key IN ("MIR1.M.FR.B.A22.A.R.A.2254U6.EUR.N")',
        order_by: '-time_period_start',
        limit: '1'
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Apikey ${API_KEY}`,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Erreur lors de l\'appel à l\'API Banque de France:', error);
    res.status(500).json({ error: 'Erreur serveur lors de l\'appel à l\'API' });
  }
});

// 🔹 Route pour récupérer le compteur de visites
app.get('/get-visit-count', async (req, res) => {
  try {
    const visitCount = await getVisitCount();
    res.json({ visitCount });
  } catch (error) {
    console.error('Erreur lors de la récupération du compteur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// 🔹 Ping pour maintenir en vie l'application sur Glitch
app.get('/ping', (req, res) => {
  console.log('Ping reçu');
  res.status(200).send('pong');
});

// 🔹 Route pour incrémenter le compteur de visites
app.post('/increment-visit', async (req, res) => {
  const userVisited = req.cookies.user_visited;
  const hasConsented = req.body.hasConsented;
  
  console.log('Cookies:', req.cookies);
  console.log('userVisited:', userVisited);
  console.log('Has Consented:', hasConsented);
  
  if (userVisited) {
    return res.json({ message: 'Visite déjà comptabilisée' });
  }

  try {
    const newVisitCount = await incrementVisitCount();
    
    res.cookie('user_visited', 'true', {
      maxAge: 24 * 60 * 60 * 1000, // 24 heures
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    });

    res.json({ message: 'Visite comptabilisée', visitCount: newVisitCount });
  } catch (error) {
    console.error('Erreur lors de l\'incrémentation du compteur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// 🔹 Route d'authentification (login)
app.use('/api', loginRouter);

// 🔹 Routes sécurisées pour les transactions crypto
app.post('', authenticateToken, addTransaction);
app.get('/api/transactions/:user_id', authenticateToken, getTransactions);
app.delete('/api/transactions/:id/:user_id', authenticateToken, deleteTransaction);
app.post('/api/calculate-tax', authenticateToken, calculateTax);

// 🔹 Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
