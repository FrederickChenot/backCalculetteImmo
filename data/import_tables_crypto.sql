BEGIN;

-- 🔹 Suppression sécurisée de la table si elle existe déjà
DROP TABLE IF EXISTS crypto_transactions;
DROP TABLE IF EXISTS users;

-- 🔹 Table des utilisateurs
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
);

-- 🔹 Table des transactions cryptos
CREATE TABLE crypto_transactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- ✅ Clé étrangère
    date DATE NOT NULL,
    transaction_type VARCHAR(10) CHECK (transaction_type IN ('achat', 'vente')), -- ✅ Validation
    crypto VARCHAR(50) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0), -- ✅ Vérifie montant positif
    portfolio_value NUMERIC(15, 2) NOT NULL CHECK (portfolio_value > 0), -- ✅ Vérifie valeur positive
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMIT;
