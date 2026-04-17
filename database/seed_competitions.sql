-- =============================================
-- Seed: Competition teams and rounds
-- Run AFTER migration_competitions.sql
-- =============================================

USE football_prediction;

-- Pobierz ID po wzorcu (unika problemów z kodowaniem)
SET @cl_id = (SELECT id FROM competitions WHERE name LIKE 'Liga Mistrz%');
SET @wc_id = (SELECT id FROM competitions WHERE name LIKE 'Mistrzostwa%');

-- Jeśli nie istnieją, stwórz je
INSERT INTO competitions (name, type, season)
  SELECT 'Liga Mistrzow 2024/25 - Faza pucharowa', 'tournament', '2024/25'
  FROM DUAL WHERE @cl_id IS NULL;
SET @cl_id = COALESCE(@cl_id, LAST_INSERT_ID());

INSERT INTO competitions (name, type, season)
  SELECT 'Mistrzostwa Swiata 2026', 'tournament', '2026'
  FROM DUAL WHERE @wc_id IS NULL;
SET @wc_id = COALESCE(@wc_id, LAST_INSERT_ID());

-- =============================================
-- 1. Liga Mistrzow - Faza pucharowa
-- =============================================

INSERT INTO teams (name, competition_id) VALUES
  ('Real Madryt', @cl_id),
  ('Manchester City', @cl_id),
  ('Bayern Monachium', @cl_id),
  ('Arsenal', @cl_id),
  ('FC Barcelona', @cl_id),
  ('Liverpool', @cl_id),
  ('Inter Mediolan', @cl_id),
  ('Atletico Madryt', @cl_id),
  ('Borussia Dortmund', @cl_id),
  ('PSG', @cl_id),
  ('AC Milan', @cl_id),
  ('Napoli', @cl_id),
  ('Benfica', @cl_id),
  ('FC Porto', @cl_id),
  ('PSV Eindhoven', @cl_id),
  ('Feyenoord', @cl_id);

INSERT INTO rounds (competition_id, number, name) VALUES
  (@cl_id, 1, '1/8 finalu - 1. mecz'),
  (@cl_id, 2, '1/8 finalu - 2. mecz'),
  (@cl_id, 3, 'Cwiercfinaly - 1. mecz'),
  (@cl_id, 4, 'Cwiercfinaly - 2. mecz'),
  (@cl_id, 5, 'Polfinaly - 1. mecz'),
  (@cl_id, 6, 'Polfinaly - 2. mecz'),
  (@cl_id, 7, 'Final');

SET @r1_id = (SELECT id FROM rounds WHERE competition_id = @cl_id AND number = 1);

INSERT INTO matches (round_id, home_team_id, away_team_id) VALUES
  (@r1_id, (SELECT id FROM teams WHERE name = 'FC Porto' AND competition_id = @cl_id), (SELECT id FROM teams WHERE name = 'Arsenal' AND competition_id = @cl_id)),
  (@r1_id, (SELECT id FROM teams WHERE name = 'Napoli' AND competition_id = @cl_id), (SELECT id FROM teams WHERE name = 'FC Barcelona' AND competition_id = @cl_id)),
  (@r1_id, (SELECT id FROM teams WHERE name = 'PSG' AND competition_id = @cl_id), (SELECT id FROM teams WHERE name = 'Real Madryt' AND competition_id = @cl_id)),
  (@r1_id, (SELECT id FROM teams WHERE name = 'Inter Mediolan' AND competition_id = @cl_id), (SELECT id FROM teams WHERE name = 'Atletico Madryt' AND competition_id = @cl_id)),
  (@r1_id, (SELECT id FROM teams WHERE name = 'PSV Eindhoven' AND competition_id = @cl_id), (SELECT id FROM teams WHERE name = 'Borussia Dortmund' AND competition_id = @cl_id)),
  (@r1_id, (SELECT id FROM teams WHERE name = 'Feyenoord' AND competition_id = @cl_id), (SELECT id FROM teams WHERE name = 'Bayern Monachium' AND competition_id = @cl_id)),
  (@r1_id, (SELECT id FROM teams WHERE name = 'AC Milan' AND competition_id = @cl_id), (SELECT id FROM teams WHERE name = 'Liverpool' AND competition_id = @cl_id)),
  (@r1_id, (SELECT id FROM teams WHERE name = 'Benfica' AND competition_id = @cl_id), (SELECT id FROM teams WHERE name = 'Manchester City' AND competition_id = @cl_id));

SET @r2_id = (SELECT id FROM rounds WHERE competition_id = @cl_id AND number = 2);

INSERT INTO matches (round_id, home_team_id, away_team_id) VALUES
  (@r2_id, (SELECT id FROM teams WHERE name = 'Arsenal' AND competition_id = @cl_id), (SELECT id FROM teams WHERE name = 'FC Porto' AND competition_id = @cl_id)),
  (@r2_id, (SELECT id FROM teams WHERE name = 'FC Barcelona' AND competition_id = @cl_id), (SELECT id FROM teams WHERE name = 'Napoli' AND competition_id = @cl_id)),
  (@r2_id, (SELECT id FROM teams WHERE name = 'Real Madryt' AND competition_id = @cl_id), (SELECT id FROM teams WHERE name = 'PSG' AND competition_id = @cl_id)),
  (@r2_id, (SELECT id FROM teams WHERE name = 'Atletico Madryt' AND competition_id = @cl_id), (SELECT id FROM teams WHERE name = 'Inter Mediolan' AND competition_id = @cl_id)),
  (@r2_id, (SELECT id FROM teams WHERE name = 'Borussia Dortmund' AND competition_id = @cl_id), (SELECT id FROM teams WHERE name = 'PSV Eindhoven' AND competition_id = @cl_id)),
  (@r2_id, (SELECT id FROM teams WHERE name = 'Bayern Monachium' AND competition_id = @cl_id), (SELECT id FROM teams WHERE name = 'Feyenoord' AND competition_id = @cl_id)),
  (@r2_id, (SELECT id FROM teams WHERE name = 'Liverpool' AND competition_id = @cl_id), (SELECT id FROM teams WHERE name = 'AC Milan' AND competition_id = @cl_id)),
  (@r2_id, (SELECT id FROM teams WHERE name = 'Manchester City' AND competition_id = @cl_id), (SELECT id FROM teams WHERE name = 'Benfica' AND competition_id = @cl_id));

-- =============================================
-- 2. Mistrzostwa Swiata 2026
-- =============================================

INSERT INTO teams (name, competition_id) VALUES
  ('Polska', @wc_id),
  ('Niemcy', @wc_id),
  ('Francja', @wc_id),
  ('Brazylia', @wc_id),
  ('Argentyna', @wc_id),
  ('Anglia', @wc_id),
  ('Hiszpania', @wc_id),
  ('Holandia', @wc_id),
  ('Portugalia', @wc_id),
  ('Wlochy', @wc_id),
  ('Belgia', @wc_id),
  ('Chorwacja', @wc_id),
  ('Urugwaj', @wc_id),
  ('Kolumbia', @wc_id),
  ('Meksyk', @wc_id),
  ('USA', @wc_id),
  ('Kanada', @wc_id),
  ('Japonia', @wc_id),
  ('Korea Poludniowa', @wc_id),
  ('Australia', @wc_id),
  ('Arabia Saudyjska', @wc_id),
  ('Iran', @wc_id),
  ('Maroko', @wc_id),
  ('Senegal', @wc_id),
  ('Ghana', @wc_id),
  ('Kamerun', @wc_id),
  ('Nigeria', @wc_id),
  ('Tunezja', @wc_id),
  ('Ekwador', @wc_id),
  ('Serbia', @wc_id),
  ('Szwajcaria', @wc_id),
  ('Dania', @wc_id);

INSERT INTO rounds (competition_id, number, name) VALUES
  (@wc_id, 1, 'Faza grupowa - Kolejka 1'),
  (@wc_id, 2, 'Faza grupowa - Kolejka 2'),
  (@wc_id, 3, 'Faza grupowa - Kolejka 3'),
  (@wc_id, 4, '1/16 finalu'),
  (@wc_id, 5, '1/8 finalu'),
  (@wc_id, 6, 'Cwiercfinaly'),
  (@wc_id, 7, 'Polfinaly'),
  (@wc_id, 8, 'Mecz o 3. miejsce'),
  (@wc_id, 9, 'Final');

SELECT 'Seed completed!' AS status;
