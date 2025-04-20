BEGIN;

-- 🔹 Insertion des utilisateurs (OBLIGATOIRE AVANT les transactions)
INSERT INTO users (username, password_hash) VALUES
('testuser', 'testpassword'),
('user2', 'password2');

-- 🔹 Insertion des transactions associées aux utilisateurs
INSERT INTO crypto_transactions (user_id, date, transaction_type, crypto, amount, portfolio_value)
VALUES 
(1, '2024-02-16', 'achat', 'BTC', 500, 5000),  
(1, '2024-02-17', 'vente', 'ETH', 300, 5500),
(2, '2024-02-18', 'achat', 'DOGE', 1000, 2000);

COMMIT;
