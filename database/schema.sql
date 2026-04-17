-- =============================================
-- Football Prediction App - Database Schema
-- =============================================

CREATE DATABASE IF NOT EXISTS football_prediction
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE football_prediction;

-- ---------------------------------------------
-- Subscription Plans
-- ---------------------------------------------
CREATE TABLE subscription_plans (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  max_created_leagues INT NULL,
  max_joined_leagues INT NULL,
  can_create_leagues BOOLEAN NOT NULL DEFAULT FALSE,
  full_statistics BOOLEAN NOT NULL DEFAULT FALSE,
  custom_scoring BOOLEAN NOT NULL DEFAULT FALSE,
  price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- ---------------------------------------------
-- Users
-- ---------------------------------------------
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(100) NOT NULL,
  avatar VARCHAR(50) NOT NULL DEFAULT 'person',
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  subscription_plan_id INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email),
  CONSTRAINT fk_users_subscription FOREIGN KEY (subscription_plan_id)
    REFERENCES subscription_plans(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ---------------------------------------------
-- Competitions (real-world leagues/tournaments)
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
-- Leagues (typing leagues created by users)
-- ---------------------------------------------
CREATE TABLE leagues (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  owner_id INT NOT NULL,
  invite_code VARCHAR(20) NOT NULL,
  is_finished BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_leagues_invite_code (invite_code),
  CONSTRAINT fk_leagues_owner FOREIGN KEY (owner_id)
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------
-- League Competitions (junction: typing league <-> competition)
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
-- League Members
-- ---------------------------------------------
CREATE TABLE league_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  league_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('owner', 'member') NOT NULL DEFAULT 'member',
  total_points INT NOT NULL DEFAULT 0,
  joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_league_members (league_id, user_id),
  CONSTRAINT fk_lm_league FOREIGN KEY (league_id)
    REFERENCES leagues(id) ON DELETE CASCADE,
  CONSTRAINT fk_lm_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------
-- Teams (per competition)
-- ---------------------------------------------
CREATE TABLE teams (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  competition_id INT NOT NULL,
  CONSTRAINT fk_teams_competition FOREIGN KEY (competition_id)
    REFERENCES competitions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------
-- Rounds (per competition)
-- ---------------------------------------------
CREATE TABLE rounds (
  id INT AUTO_INCREMENT PRIMARY KEY,
  competition_id INT NOT NULL,
  number INT NOT NULL,
  name VARCHAR(100) NULL,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_rounds_competition FOREIGN KEY (competition_id)
    REFERENCES competitions(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------
-- Matches
-- ---------------------------------------------
CREATE TABLE matches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  round_id INT NOT NULL,
  home_team_id INT NOT NULL,
  away_team_id INT NOT NULL,
  home_score INT NULL,
  away_score INT NULL,
  is_played BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_matches_round FOREIGN KEY (round_id)
    REFERENCES rounds(id) ON DELETE CASCADE,
  CONSTRAINT fk_matches_home_team FOREIGN KEY (home_team_id)
    REFERENCES teams(id) ON DELETE CASCADE,
  CONSTRAINT fk_matches_away_team FOREIGN KEY (away_team_id)
    REFERENCES teams(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------
-- Predictions (scoped per typing league)
-- ---------------------------------------------
CREATE TABLE predictions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  match_id INT NOT NULL,
  user_id INT NOT NULL,
  league_id INT NOT NULL,
  home_score INT NULL,
  away_score INT NULL,
  points_earned INT NOT NULL DEFAULT 0,
  UNIQUE KEY uq_predictions (match_id, user_id, league_id),
  CONSTRAINT fk_predictions_match FOREIGN KEY (match_id)
    REFERENCES matches(id) ON DELETE CASCADE,
  CONSTRAINT fk_predictions_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_predictions_league FOREIGN KEY (league_id)
    REFERENCES leagues(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------
-- Scoring Rules (per league, for Gold custom scoring)
-- ---------------------------------------------
CREATE TABLE scoring_rules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  league_id INT NOT NULL,
  exact_score_points INT NOT NULL DEFAULT 3,
  correct_difference_points INT NOT NULL DEFAULT 2,
  correct_result_points INT NOT NULL DEFAULT 1,
  wrong_points INT NOT NULL DEFAULT 0,
  UNIQUE KEY uq_scoring_rules_league (league_id),
  CONSTRAINT fk_scoring_league FOREIGN KEY (league_id)
    REFERENCES leagues(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =============================================
-- Seed: Subscription Plans
-- =============================================
INSERT INTO subscription_plans (name, display_name, max_created_leagues, max_joined_leagues, can_create_leagues, full_statistics, custom_scoring, price) VALUES
  ('light',    'Light',    0,    3,    FALSE, FALSE, FALSE, 0.00),
  ('standard', 'Standard', 3,    NULL, TRUE,  TRUE,  FALSE, 19.99),
  ('gold',     'Gold',     NULL, NULL, TRUE,  TRUE,  TRUE,  39.99);

-- =============================================
-- Seed: Competitions
-- =============================================
INSERT INTO competitions (name, type, season) VALUES
  ('Liga Mistrzów 2024/25 - Faza pucharowa', 'tournament', '2024/25'),
  ('Mistrzostwa Świata 2026', 'tournament', '2026');
