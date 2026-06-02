-- =============================================================================
-- 002-create-types.sql
-- Creates PostgreSQL enum types in the releases schema
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE releases.service_tier AS ENUM ('ms', 'api', 'web');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE releases.release_status AS ENUM ('pending', 'building', 'deployed', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
