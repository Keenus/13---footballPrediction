-- =============================================
-- Migration: Payments & Stripe Integration
-- =============================================

USE football_prediction;

-- Update subscription plan prices
UPDATE subscription_plans SET price = 0.00 WHERE id = (SELECT id FROM (SELECT id FROM subscription_plans WHERE name = 'light') t);
UPDATE subscription_plans SET price = 20.00 WHERE id = (SELECT id FROM (SELECT id FROM subscription_plans WHERE name = 'standard') t);
UPDATE subscription_plans SET price = 25.00 WHERE id = (SELECT id FROM (SELECT id FROM subscription_plans WHERE name = 'gold') t);

-- Add Stripe price ID to subscription_plans
ALTER TABLE subscription_plans
  ADD COLUMN stripe_price_id VARCHAR(100) NULL AFTER price;

-- Add Stripe fields to users
ALTER TABLE users
  ADD COLUMN stripe_customer_id VARCHAR(100) NULL AFTER subscription_plan_id,
  ADD COLUMN stripe_subscription_id VARCHAR(100) NULL AFTER stripe_customer_id,
  ADD COLUMN subscription_expires_at TIMESTAMP NULL AFTER stripe_subscription_id;

-- Payments table for tracking transactions
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  subscription_plan_id INT NOT NULL,
  stripe_session_id VARCHAR(255) NULL,
  stripe_payment_intent_id VARCHAR(255) NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'pln',
  status ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_payments_plan FOREIGN KEY (subscription_plan_id)
    REFERENCES subscription_plans(id) ON DELETE CASCADE
) ENGINE=InnoDB;
