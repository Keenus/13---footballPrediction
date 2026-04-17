-- =============================================
-- Seed: Liga Mistrzow 2024/25 - prawdziwe dane
-- Faza pucharowa od cwiercfinalow
-- =============================================

USE football_prediction;

SET SQL_SAFE_UPDATES = 0;

SET @cl_id = (SELECT id FROM competitions WHERE name LIKE 'Liga Mistrz%' LIMIT 1);

-- Wyczysc stare dane dla tej competition
DELETE FROM matches WHERE round_id IN (SELECT id FROM rounds WHERE competition_id = @cl_id);
DELETE FROM rounds WHERE competition_id = @cl_id;
DELETE FROM teams WHERE competition_id = @cl_id;

-- Usun ligi typerskie i ich dane (czysta baza)
DELETE FROM predictions WHERE id > 0;
DELETE FROM league_competitions WHERE id > 0;
DELETE FROM scoring_rules WHERE id > 0;
DELETE FROM league_members WHERE id > 0;
DELETE FROM leagues WHERE id > 0;

SET SQL_SAFE_UPDATES = 1;

-- =============================================
-- Druzyny (8 cwiercfinalistow)
-- =============================================
INSERT INTO teams (name, competition_id) VALUES
  ('PSG', @cl_id),
  ('Liverpool', @cl_id),
  ('FC Barcelona', @cl_id),
  ('Atletico Madryt', @cl_id),
  ('Real Madryt', @cl_id),
  ('Bayern Monachium', @cl_id),
  ('Sporting Lizbona', @cl_id),
  ('Arsenal', @cl_id);

-- =============================================
-- Rundy
-- =============================================
INSERT INTO rounds (competition_id, number, name) VALUES
  (@cl_id, 1, 'Cwiercfinaly - 1. mecz'),
  (@cl_id, 2, 'Cwiercfinaly - 2. mecz'),
  (@cl_id, 3, 'Polfinaly - 1. mecz'),
  (@cl_id, 4, 'Polfinaly - 2. mecz'),
  (@cl_id, 5, 'Final');

-- =============================================
-- Runda 1: Cwiercfinaly - 1. mecz (ROZEGRANE)
-- =============================================
SET @r1 = (SELECT id FROM rounds WHERE competition_id = @cl_id AND number = 1);

INSERT INTO matches (round_id, home_team_id, away_team_id, home_score, away_score, is_played, deadline) VALUES
  (@r1,
   (SELECT id FROM teams WHERE name = 'PSG' AND competition_id = @cl_id),
   (SELECT id FROM teams WHERE name = 'Liverpool' AND competition_id = @cl_id),
   0, 2, TRUE, '2025-04-08 19:00:00'),
  (@r1,
   (SELECT id FROM teams WHERE name = 'FC Barcelona' AND competition_id = @cl_id),
   (SELECT id FROM teams WHERE name = 'Atletico Madryt' AND competition_id = @cl_id),
   0, 2, TRUE, '2025-04-08 19:00:00'),
  (@r1,
   (SELECT id FROM teams WHERE name = 'Real Madryt' AND competition_id = @cl_id),
   (SELECT id FROM teams WHERE name = 'Bayern Monachium' AND competition_id = @cl_id),
   1, 2, TRUE, '2025-04-09 19:00:00'),
  (@r1,
   (SELECT id FROM teams WHERE name = 'Sporting Lizbona' AND competition_id = @cl_id),
   (SELECT id FROM teams WHERE name = 'Arsenal' AND competition_id = @cl_id),
   0, 1, TRUE, '2025-04-09 19:00:00');

UPDATE rounds SET is_completed = TRUE WHERE id = @r1;

-- =============================================
-- Runda 2: Cwiercfinaly - 2. mecz (REWANZE)
-- =============================================
SET @r2 = (SELECT id FROM rounds WHERE competition_id = @cl_id AND number = 2);

INSERT INTO matches (round_id, home_team_id, away_team_id, deadline) VALUES
  (@r2,
   (SELECT id FROM teams WHERE name = 'Liverpool' AND competition_id = @cl_id),
   (SELECT id FROM teams WHERE name = 'PSG' AND competition_id = @cl_id),
   '2026-04-14 19:00:00'),
  (@r2,
   (SELECT id FROM teams WHERE name = 'Atletico Madryt' AND competition_id = @cl_id),
   (SELECT id FROM teams WHERE name = 'FC Barcelona' AND competition_id = @cl_id),
   '2026-04-14 19:00:00'),
  (@r2,
   (SELECT id FROM teams WHERE name = 'Bayern Monachium' AND competition_id = @cl_id),
   (SELECT id FROM teams WHERE name = 'Real Madryt' AND competition_id = @cl_id),
   '2026-04-15 19:00:00'),
  (@r2,
   (SELECT id FROM teams WHERE name = 'Arsenal' AND competition_id = @cl_id),
   (SELECT id FROM teams WHERE name = 'Sporting Lizbona' AND competition_id = @cl_id),
   '2026-04-15 19:00:00');

-- =============================================
-- Runda 3: Polfinaly - 1. mecz (druzyny TBD)
-- Mecze do ustalenia po cwiercfinalach
-- =============================================
SET @r3 = (SELECT id FROM rounds WHERE competition_id = @cl_id AND number = 3);

-- Placeholder: zostana zaktualizowane po cwiercfinalach
-- Deadline: 28.04.2026 19:00 UTC

-- =============================================
-- Runda 4: Polfinaly - 2. mecz (druzyny TBD)
-- Deadline: 29.04.2026 19:00 UTC
-- =============================================

-- =============================================
-- Runda 5: Final (druzyny TBD)
-- 30.05.2026 19:00 UTC
-- =============================================

-- Ustaw current_round_index na 1 (cwiercfinaly rewanze)
-- dla wszystkich lig ktore beda podpiete
-- (runda 1 = index 0 jest juz rozegrana)

SELECT 'CL 2024/25 seed completed!' AS status;
