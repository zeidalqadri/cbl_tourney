-- Add match management columns for tournament administration
ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS actual_start_time TIMESTAMP;
ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS actual_end_time TIMESTAMP;
ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS delay_minutes INTEGER DEFAULT 0;
ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS is_walkover BOOLEAN DEFAULT FALSE;
ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS postponement_reason TEXT;
ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS referee_name VARCHAR(255);
ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS scorer_name VARCHAR(255);
ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS photographer_assigned VARCHAR(255);
ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS last_updated_by VARCHAR(255);
ALTER TABLE tournament_matches ADD COLUMN IF NOT EXISTS change_log JSONB DEFAULT '[]'::jsonb;

-- Create index for quick status lookups
CREATE INDEX IF NOT EXISTS idx_tournament_matches_status_scheduled 
ON tournament_matches(status, scheduled_time) 
WHERE tournament_id = '66666666-6666-6666-6666-666666666666';

-- Add comment to explain change_log structure
COMMENT ON COLUMN tournament_matches.change_log IS 'Array of change entries: [{timestamp, user, field, old_value, new_value, reason}]';

-- Create function to log match changes
CREATE OR REPLACE FUNCTION log_match_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if certain fields changed
  IF (OLD.scheduled_time IS DISTINCT FROM NEW.scheduled_time) OR
     (OLD.venue IS DISTINCT FROM NEW.venue) OR
     (OLD.court IS DISTINCT FROM NEW.court) OR
     (OLD.status IS DISTINCT FROM NEW.status) OR
     (OLD.delay_minutes IS DISTINCT FROM NEW.delay_minutes) OR
     (OLD.referee_name IS DISTINCT FROM NEW.referee_name) THEN
    
    -- Append to change log
    NEW.change_log = COALESCE(OLD.change_log, '[]'::jsonb) || 
      jsonb_build_object(
        'timestamp', NOW(),
        'user', NEW.last_updated_by,
        'changes', jsonb_build_object(
          'scheduled_time', CASE WHEN OLD.scheduled_time IS DISTINCT FROM NEW.scheduled_time 
            THEN jsonb_build_object('old', OLD.scheduled_time, 'new', NEW.scheduled_time) END,
          'venue', CASE WHEN OLD.venue IS DISTINCT FROM NEW.venue 
            THEN jsonb_build_object('old', OLD.venue, 'new', NEW.venue) END,
          'court', CASE WHEN OLD.court IS DISTINCT FROM NEW.court 
            THEN jsonb_build_object('old', OLD.court, 'new', NEW.court) END,
          'status', CASE WHEN OLD.status IS DISTINCT FROM NEW.status 
            THEN jsonb_build_object('old', OLD.status, 'new', NEW.status) END,
          'delay_minutes', CASE WHEN OLD.delay_minutes IS DISTINCT FROM NEW.delay_minutes 
            THEN jsonb_build_object('old', OLD.delay_minutes, 'new', NEW.delay_minutes) END
        )
      );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for change logging
DROP TRIGGER IF EXISTS trigger_log_match_changes ON tournament_matches;
CREATE TRIGGER trigger_log_match_changes
  BEFORE UPDATE ON tournament_matches
  FOR EACH ROW
  EXECUTE FUNCTION log_match_change();