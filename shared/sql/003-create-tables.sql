-- =============================================================================
-- 003-create-tables.sql
-- Creates the 3 core tables in the releases schema
-- =============================================================================

-- Service catalog (seeded from repository-list.txt)
CREATE TABLE IF NOT EXISTS releases.service (
  id                    UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  name                  VARCHAR(100)  NOT NULL UNIQUE,
  repository            VARCHAR(100)  NOT NULL,
  tier                  releases.service_tier NOT NULL DEFAULT 'ms',
  last_released_version VARCHAR(50),
  last_released_at      TIMESTAMPTZ,
  is_active             BOOLEAN       NOT NULL DEFAULT true,
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Release registry
CREATE TABLE IF NOT EXISTS releases.release (
  id          UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  version     VARCHAR(50)   NOT NULL UNIQUE,
  status      releases.release_status NOT NULL DEFAULT 'pending',
  created_by  VARCHAR(100)  NOT NULL,
  notes       TEXT,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Release <-> service mapping (1 release : N services)
CREATE TABLE IF NOT EXISTS releases.release_service (
  id               UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  release_id       UUID         NOT NULL REFERENCES releases.release(id)  ON DELETE CASCADE,
  service_id       UUID         NOT NULL REFERENCES releases.service(id)  ON DELETE RESTRICT,
  tag_name         VARCHAR(100) NOT NULL,
  git_sha          VARCHAR(40)  NOT NULL,
  image_tag        VARCHAR(150) NOT NULL,
  workflow_run_id  BIGINT,
  workflow_status  VARCHAR(50),
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (release_id, service_id)
);
