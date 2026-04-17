-- =============================================
-- Migration: Competitions & League restructure
-- Decouples real-world competitions from typing leagues
-- =============================================

USE football_prediction;

-- ---------------------------------------------
-- 1. Create competitions table
-- ---------------------------------------------
CREATE TABLE competitions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type ENUM('league', 'tournament', 'custom') NOT NULL DEFAULT 'tournament',
  season VARCHAR(50) NULL,
  is_finished BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------
-- 2. Add competition_id to teams, migrate from league_id
-- ---------------------------------------------
ALTER TABLE teams
  ADD COLUMN competition_id INT NULL AFTER league_id;

ALTER TABLE teams
  ADD CONSTRAINT fk_teams_competition FOREIGN KEY (competition_id)
    REFERENCES competitions(id) ON DELETE CASCADE;

-- Drop old FK and column (league_id)
ALTER TABLE teams DROP FOREIGN KEY fk_teams_league;
ALTER TABLE teams DROP COLUMN league_id;

ALTER TABLE teams MODIFY competition_id INT NOT NULL;

-- ---------------------------------------------
-- 3. Add competition_id to rounds, migrate from league_id
-- ---------------------------------------------
ALTER TABLE rounds
  ADD COLUMN competition_id INT NULL AFTER league_id,
  ADD COLUMN name VARCHAR(100) NULL AFTER number;

ALTER TABLE rounds
  ADD CONSTRAINT fk_rounds_competition FOREIGN KEY (competition_id)
    REFERENCES competitions(id) ON DELETE CASCADE;

-- Drop old FK and column (league_id)
ALTER TABLE rounds DROP FOREIGN KEY fk_rounds_league;
ALTER TABLE rounds DROP COLUMN league_id;

ALTER TABLE rounds MODIFY competition_id INT NOT NULL;

-- ---------------------------------------------
-- 4. Create league_competitions junction table
-- ---------------------------------------------
CREATE TABLE league_competitions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  league_id INT NOT NULL,
  competition_id INT NOT NULL,
  current_round_index INT NOT NULL DEFAULT 0,
  UNIQUE KEY uq_league_competition (league_id, competition_id),
  CONSTRAINT fk_lc_league FOREIGN KEY (league_id)
    REFERENCES leagues(id) ON DELETE CASCADE,
  CONSTRAINT fk_lc_competition FOREIGN KEY (competition_id)
    REFERENCES competitions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------
-- 5. Remove current_round_index from leagues
-- ---------------------------------------------
ALTER TABLE leagues DROP COLUMN current_round_index;

-- ---------------------------------------------
-- 6. Add league_id to predictions
-- ---------------------------------------------
ALTER TABLE predictions
  ADD COLUMN league_id INT NULL AFTER user_id;

ALTER TABLE predictions
  ADD CONSTRAINT fk_predictions_league FOREIGN KEY (league_id)
    REFERENCES leagues(id) ON DELETE CASCADE;

-- Drop old unique and create new one with league_id
ALTER TABLE predictions DROP INDEX uq_predictions;
ALTER TABLE predictions ADD UNIQUE KEY uq_predictions (match_id, user_id, league_id);

-- ---------------------------------------------
-- 7. Seed competitions
-- ---------------------------------------------
INSERT INTO competitions (name, type, season) VALUES
  ('Liga Mistrzów 2024/25 - Faza pucharowa', 'tournament', '2024/25'),
  ('Mistrzostwa Świata 2026', 'tournament', '2026');
