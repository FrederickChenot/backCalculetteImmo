const { Client } = require('pg'); // Package pour PostgreSQL
require('dotenv').config();

// Création d'une instance du client PostgreSQL
const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Connexion à la base de données
client.connect();

// Fonction pour récupérer le compteur de visites
async function getVisitCount() {
  const result = await client.query('SELECT * FROM "countercalculette" WHERE id = 1');
  const error = { message: 'Counter not found', statusCode: 404 };
  if (result.rowCount === 0) throw error;

  return result.rows[0].visit_count; // Retourne la valeur du compteur
}

// Fonction pour incrémenter le compteur de visites
async function incrementVisitCount() {
  const result = await client.query('SELECT * FROM "countercalculette" WHERE id = 1');
  const error = { message: 'Counter not found', statusCode: 404 };
  if (result.rowCount === 0) throw error;

  const newData = result.rows[0].visit_count + 1;
  
  // Mise à jour du compteur dans la base de données
  const myQuery = {
    text: `UPDATE "countercalculette" SET "visit_count" = $1 WHERE id = 1`,
    values: [newData],
  };
  
  await client.query(myQuery);
  console.log('Nouveau compteur:', newData);

  return newData; // Retourne la nouvelle valeur du compteur
}

module.exports = { incrementVisitCount, getVisitCount };
