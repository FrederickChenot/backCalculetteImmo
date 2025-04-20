const { Client } = require('pg'); // Package pour PostgreSQL
require('dotenv').config(); // Charge les variables d'environnement

// Connexion à la base de données PostgreSQL
const client = new Client({
  connectionString: process.env.DATABASE_URL, // Définir dans le fichier .env
});

// Connexion à la base de données
client.connect();

// Fonction pour récupérer le compteur de visites
async function getVisitCount() {
  try {
    const result = await client.query('SELECT * FROM "countercalculette" WHERE id = 1');
    if (result.rowCount === 0) {
      throw new Error('Compteur introuvable');
    }
    return result.rows[0].visit_count; // Retourne la valeur du compteur
  } catch (error) {
    console.error('Erreur lors de la récupération du compteur:', error);
    throw error;
  }
}

// Fonction pour incrémenter le compteur de visites
async function incrementVisitCount() {
  try {
    const result = await client.query('SELECT * FROM "countercalculette" WHERE id = 1');
    if (result.rowCount === 0) {
      throw new Error('Compteur introuvable');
    }

    const newCount = result.rows[0].visit_count + 1;

    // Mise à jour de la valeur du compteur
    await client.query('UPDATE "countercalculette" SET "visit_count" = $1 WHERE id = 1', [newCount]);
    return newCount; // Retourne la nouvelle valeur du compteur
  } catch (error) {
    console.error('Erreur lors de l\'incrémentation du compteur:', error);
    throw error;
  }
}

module.exports = { getVisitCount, incrementVisitCount };
