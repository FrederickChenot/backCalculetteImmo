const { Client } = require('pg');
require('dotenv').config();

// Sélection de la bonne base en fonction de l'environnement
const DATABASE_URL = process.env.LOCALHOST === 'true' ? process.env.DATABASE_URL2 : process.env.DATABASE_URL;
console.log(`📌 Connexion à PostgreSQL : ${DATABASE_URL}`);

// Initialisation du client PostgreSQL
const client = new Client({
  connectionString: DATABASE_URL,
  keepAlive: true,  // 🔹 Empêche PostgreSQL de couper la connexion
});

// Connexion à PostgreSQL avec gestion d'erreur
client.connect()
  .then(() => console.log('✅ Connecté à PostgreSQL'))
  .catch((err) => console.error('❌ Erreur de connexion PostgreSQL:', err));

// 🔹 Écoute les erreurs de connexion
client.on('error', (err) => {
  console.error('🔥 Erreur détectée sur PostgreSQL:', err);
});
setInterval(async () => {
  try {
    await client.query('SELECT 1');
    console.log('🔄 Ping PostgreSQL pour éviter la déconnexion...');
  } catch (err) {
    console.error('❌ Erreur keep-alive PostgreSQL:', err);
  }
}, 1 * 60 * 1000); // Toutes les 4 minutes


// 🔹 Ajouter une transaction (achat ou vente)
async function addTransaction(req, res) {
  const { user_id, date, transaction_type, crypto, amount, portfolio_value } = req.body;

  if (!user_id || !date || !transaction_type || !crypto || !amount || !portfolio_value) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  try {
    const result = await client.query(
      `INSERT INTO crypto_transactions (user_id, date, transaction_type, crypto, amount, portfolio_value)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [user_id, date, transaction_type, crypto, amount, portfolio_value]
    );

    res.status(201).json({ message: 'Transaction ajoutée', transaction: result.rows[0] });
  } catch (error) {
    console.error('❌ Erreur ajout transaction:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// 🔹 Récupérer les transactions d'un utilisateur
async function getTransactions(req, res) {
  const { user_id } = req.params;

  if (!user_id) {
    return res.status(400).json({ error: 'ID utilisateur manquant' });
  }

  try {
    const result = await client.query(
      `SELECT * FROM crypto_transactions WHERE user_id = $1 ORDER BY date DESC`,
      [user_id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('❌ Erreur récupération transactions:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// 🔹 Supprimer une transaction spécifique
async function deleteTransaction(req, res) {
  const { id, user_id } = req.params;

  if (!id || !user_id) {
    return res.status(400).json({ error: 'ID transaction et utilisateur requis' });
  }

  try {
    const result = await client.query(
      'DELETE FROM crypto_transactions WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, user_id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Transaction introuvable' });
    }

    res.json({ message: 'Transaction supprimée avec succès', deletedTransaction: result.rows[0] });
  } catch (error) {
    console.error('❌ Erreur suppression transaction:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// 🔹 Calculer la plus-value en fonction de la valeur globale du portefeuille
async function calculateTax(req, res) {
  const { user_id, amount } = req.body;

  if (!user_id || !amount) {
    return res.status(400).json({ error: 'ID utilisateur et montant requis' });
  }

  try {
    // Récupérer le total des achats et le nombre d'achats
    const totalAchatResult = await client.query(
      `SELECT SUM(amount) AS total_achat, COUNT(*) AS nombre_achats
       FROM crypto_transactions
       WHERE transaction_type = 'achat' AND user_id = $1`,
      [user_id]
    );

    if (!totalAchatResult.rows[0].total_achat) {
      return res.status(400).json({ error: 'Aucun achat trouvé' });
    }

    const totalAchat = parseFloat(totalAchatResult.rows[0].total_achat);
    const nombreAchats = parseInt(totalAchatResult.rows[0].nombre_achats, 10);
    const prixAchatMoyen = totalAchat / nombreAchats;

    // Récupérer la dernière valeur du portefeuille
    const portefeuilleResult = await client.query(
      `SELECT portfolio_value FROM crypto_transactions
       WHERE user_id = $1
       ORDER BY date DESC LIMIT 1`,
      [user_id]
    );

    if (!portefeuilleResult.rows.length) {
      return res.status(400).json({ error: 'Valeur du portefeuille inconnue' });
    }

    const portefeuilleAvantVente = parseFloat(portefeuilleResult.rows[0].portfolio_value);
    const prixAchatProportionnel = (totalAchat / portefeuilleAvantVente) * amount;
    const plusValue = amount - prixAchatProportionnel;

    res.json({ 
      portefeuilleAvantVente, 
      totalAchat, 
      prixAchatMoyen, 
      montantVendu: amount, 
      prixAchatProportionnel, 
      plusValue 
    });
  } catch (error) {
    console.error('❌ Erreur lors du calcul de la plus-value:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

// 🔹 Fermer proprement la connexion PostgreSQL en cas d'arrêt du serveur
process.on('SIGINT', async () => {
  console.log('❗ Fermeture de la connexion PostgreSQL...');
  await client.end();
  process.exit(0);
});

// 🔹 Exportation des fonctions
console.log('✅ API Transactions chargée'); 


module.exports = { addTransaction, getTransactions, deleteTransaction, calculateTax };
