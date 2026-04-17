-- =============================================
-- Migration: Add deadline to matches
-- =============================================

USE football_prediction;

ALTER TABLE matches ADD COLUMN deadline DATETIME NULL AFTER is_played;
