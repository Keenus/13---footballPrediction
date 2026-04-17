-- =============================================
-- Seed: Konto admina
-- Login: admin@futbol.pl / admin123
-- =============================================

USE football_prediction;

INSERT INTO users (email, password_hash, username, role, subscription_plan_id)
VALUES (
  'admin@futbol.pl',
  '$2b$10$h2sCiyVvJDKfIqDnRO//c.1ED4wQLxsgcTHnXJyteqrTCgrVofbWS',
  'Admin',
  'admin',
  (SELECT id FROM subscription_plans WHERE name = 'gold' LIMIT 1)
);
