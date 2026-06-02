-- =============================================================================
-- 004-create-indexes.sql
-- Performance indexes for the releases schema
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_service_name
  ON releases.service (name);

CREATE INDEX IF NOT EXISTS idx_release_created_at
  ON releases.release (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_release_service_release_id
  ON releases.release_service (release_id);

CREATE INDEX IF NOT EXISTS idx_release_service_service_id
  ON releases.release_service (service_id);
