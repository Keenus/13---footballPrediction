-- =============================================
-- Fix: Dokończenie migracji - tylko brakujące kroki
-- =============================================

USE football_prediction;

DROP PROCEDURE IF EXISTS fix_migration;

DELIMITER //
CREATE PROCEDURE fix_migration()
BEGIN
  DECLARE idx_exists INT DEFAULT 0;

  -- Predictions: najpierw usuń FK która blokuje drop indeksu
  SELECT COUNT(*) INTO idx_exists
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'predictions'
      AND CONSTRAINT_NAME = 'fk_predictions_match';

  IF idx_exists > 0 THEN
    ALTER TABLE predictions DROP FOREIGN KEY fk_predictions_match;
  END IF;

  -- Teraz usuń stary indeks
  SET idx_exists = 0;
  SELECT COUNT(*) INTO idx_exists
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'predictions'
      AND INDEX_NAME = 'uq_predictions';

  IF idx_exists > 0 THEN
    ALTER TABLE predictions DROP INDEX uq_predictions;
  END IF;

  SET idx_exists = 0;
  SELECT COUNT(*) INTO idx_exists
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'predictions'
      AND INDEX_NAME = 'predictions_match_id_user_id_key';

  IF idx_exists > 0 THEN
    ALTER TABLE predictions DROP INDEX predictions_match_id_user_id_key;
  END IF;

  -- Nowy indeks + przywróć FK
  ALTER TABLE predictions ADD UNIQUE KEY uq_predictions (match_id, user_id, league_id);
  ALTER TABLE predictions ADD CONSTRAINT fk_predictions_match
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE;

END //
DELIMITER ;

CALL fix_migration();
DROP PROCEDURE fix_migration;

SELECT 'Done!' AS status;
