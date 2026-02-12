-- ═══════════════════════════════════════════════════════════════════
-- DIGITALIUM.IO — Cloud SQL Migration 001: Initial Schema
-- Adapted for Google Cloud SQL (PostgreSQL 15)
-- ═══════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════
-- 0. EXTENSIONS
-- ═══════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ═══════════════════════════════════════════
-- 1. ENUM & TABLE user_roles
-- ═══════════════════════════════════════════

DO $$ BEGIN
    CREATE TYPE app_role AS ENUM ('admin', 'user');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS user_roles (
    id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id     TEXT NOT NULL,  -- Firebase UID
    role        app_role NOT NULL DEFAULT 'user',
    created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(user_id, role)
);

COMMENT ON TABLE user_roles IS 'Maps Firebase auth users to application roles.';

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);


-- ─── has_role() function ────────────────────

CREATE OR REPLACE FUNCTION has_role(_user_id TEXT, _role app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_roles
        WHERE user_id = _user_id
          AND role = _role
    );
END;
$$;

COMMENT ON FUNCTION has_role IS 'Check if a user has a specific application role.';


-- ═══════════════════════════════════════════
-- 2. TABLE profiles
-- ═══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS profiles (
    id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id         TEXT NOT NULL UNIQUE,  -- Firebase UID
    display_name    TEXT,
    phone           TEXT,
    company         TEXT,
    avatar_url      TEXT,
    persona_type    TEXT CHECK (persona_type IN ('citizen', 'business', 'institutional')),
    created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Ensure columns exist if table already existed
DO $$ BEGIN
    ALTER TABLE profiles ADD COLUMN IF NOT EXISTS persona_type TEXT CHECK (persona_type IN ('citizen', 'business', 'institutional'));
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TABLE profiles IS 'Extended user profiles linked to Firebase Auth.';

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_persona_type ON profiles(persona_type);


-- ═══════════════════════════════════════════
-- 3. TABLE user_personas
-- ═══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS user_personas (
    id                      UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id                 TEXT NOT NULL UNIQUE,  -- Firebase UID
    persona_type            TEXT NOT NULL CHECK (persona_type IN ('citizen', 'business', 'institutional')),
    organization_id         TEXT,  -- Convex organization ID
    onboarding_completed    BOOLEAN DEFAULT false NOT NULL,
    onboarding_step         INTEGER DEFAULT 0 NOT NULL,
    created_at              TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at              TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE user_personas IS 'Tracks user persona selection and onboarding progress.';

CREATE INDEX IF NOT EXISTS idx_user_personas_user_id ON user_personas(user_id);
CREATE INDEX IF NOT EXISTS idx_user_personas_persona_type ON user_personas(persona_type);


-- ═══════════════════════════════════════════
-- 4. TABLE business_subscriptions
-- ═══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS business_subscriptions (
    id                      UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id         TEXT NOT NULL,  -- Convex organization ID
    plan                    TEXT NOT NULL CHECK (plan IN ('starter', 'pro', 'enterprise')),
    price_per_user          INTEGER NOT NULL DEFAULT 15000,
    currency                TEXT NOT NULL DEFAULT 'XAF',
    billing_cycle           TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'annual')) DEFAULT 'monthly',
    active_users            INTEGER NOT NULL DEFAULT 1,
    max_users               INTEGER NOT NULL DEFAULT 5,
    modules                 JSONB NOT NULL DEFAULT '{
        "iDocument": true,
        "iArchive": true,
        "iSignature": false,
        "iAsted": false
    }'::jsonb,
    status                  TEXT NOT NULL CHECK (status IN ('trial', 'active', 'past_due', 'cancelled')) DEFAULT 'trial',
    trial_ends_at           TIMESTAMPTZ,
    current_period_start    TIMESTAMPTZ DEFAULT now() NOT NULL,
    current_period_end      TIMESTAMPTZ DEFAULT (now() + interval '30 days') NOT NULL,
    payment_method          TEXT CHECK (payment_method IN ('mobile_money', 'bank_transfer', 'card')),
    created_at              TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at              TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE business_subscriptions IS 'SaaS billing for business persona subscriptions (XAF).';

CREATE INDEX IF NOT EXISTS idx_business_subs_org ON business_subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_business_subs_status ON business_subscriptions(status);


-- ═══════════════════════════════════════════
-- 5. TABLE institutional_licenses
-- ═══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS institutional_licenses (
    id                      UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id         TEXT NOT NULL,  -- Convex organization ID
    license_key             TEXT NOT NULL UNIQUE,
    license_type            TEXT NOT NULL CHECK (license_type IN ('perpetual', 'subscription_annual')),
    deployment              TEXT NOT NULL CHECK (deployment IN ('on_premise', 'private_cloud', 'hybrid')) DEFAULT 'private_cloud',
    region                  TEXT NOT NULL DEFAULT 'gabon',
    maintenance_expires_at  TIMESTAMPTZ,
    max_users               INTEGER,  -- NULL = unlimited
    modules                 JSONB NOT NULL DEFAULT '{
        "iDocument": true,
        "iArchive": true,
        "iSignature": true,
        "iAsted": true
    }'::jsonb,
    sla_config              JSONB DEFAULT '{
        "uptime": "99.9%",
        "response_time": "4h",
        "support_level": "priority"
    }'::jsonb,
    compliance_config       JSONB DEFAULT '{
        "data_residency": "gabon",
        "encryption": "AES-256",
        "audit_logging": true
    }'::jsonb,
    is_valid                BOOLEAN DEFAULT true NOT NULL,
    created_at              TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at              TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE institutional_licenses IS 'Sovereign licenses for institutional persona — perpetual or annual.';

CREATE INDEX IF NOT EXISTS idx_inst_licenses_org ON institutional_licenses(organization_id);
CREATE INDEX IF NOT EXISTS idx_inst_licenses_key ON institutional_licenses(license_key);
CREATE INDEX IF NOT EXISTS idx_inst_licenses_valid ON institutional_licenses(is_valid);


-- ═══════════════════════════════════════════
-- 6. TABLE document_storage (file metadata)
-- ═══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS document_storage (
    id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id         TEXT NOT NULL,          -- Firebase UID (uploader)
    organization_id TEXT,                   -- Convex organization ID
    file_name       TEXT NOT NULL,
    file_path       TEXT NOT NULL,          -- GCS bucket path
    file_size       BIGINT NOT NULL,
    mime_type       TEXT NOT NULL,
    sha256_hash     TEXT,
    is_public       BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE document_storage IS 'File metadata for documents stored in GCS.';

CREATE INDEX IF NOT EXISTS idx_doc_storage_user ON document_storage(user_id);
CREATE INDEX IF NOT EXISTS idx_doc_storage_org ON document_storage(organization_id);


-- ═══════════════════════════════════════════
-- 7. FUNCTION get_persona_redirect
-- ═══════════════════════════════════════════

CREATE OR REPLACE FUNCTION get_persona_redirect(_user_id TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    _persona TEXT;
BEGIN
    SELECT persona_type INTO _persona
    FROM user_personas
    WHERE user_id = _user_id;

    RETURN CASE _persona
        WHEN 'citizen'        THEN 'https://identite.ga'
        WHEN 'business'       THEN '/pro'
        WHEN 'institutional'  THEN '/institutional'
        ELSE '/onboarding'
    END;
END;
$$;

COMMENT ON FUNCTION get_persona_redirect IS 'Returns redirect URL based on user persona type.';


-- ═══════════════════════════════════════════
-- 8. FUNCTION handle_new_user
-- ═══════════════════════════════════════════

CREATE OR REPLACE FUNCTION handle_new_user(
    _user_id    TEXT,
    _email      TEXT,
    _display_name TEXT DEFAULT NULL,
    _avatar_url TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    _role app_role;
    _name TEXT;
BEGIN
    -- Determine role based on email
    IF _email = 'admin@digitalium.ga' THEN
        _role := 'admin';
    ELSE
        _role := 'user';
    END IF;

    -- Derive display name
    _name := COALESCE(_display_name, split_part(_email, '@', 1));

    -- Create profile (upsert to avoid conflicts)
    INSERT INTO profiles (user_id, display_name, avatar_url)
    VALUES (_user_id, _name, _avatar_url)
    ON CONFLICT (user_id) DO UPDATE
        SET display_name = EXCLUDED.display_name,
            avatar_url = EXCLUDED.avatar_url,
            updated_at = now();

    -- Assign role (upsert)
    INSERT INTO user_roles (user_id, role)
    VALUES (_user_id, _role)
    ON CONFLICT (user_id, role) DO NOTHING;
END;
$$;

COMMENT ON FUNCTION handle_new_user IS 'Creates profile and assigns role for a new Firebase user. Call from your backend on signup.';


-- ═══════════════════════════════════════════
-- 9. TRIGGERS updated_at
-- ═══════════════════════════════════════════

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION set_updated_at IS 'Auto-sets updated_at timestamp on row update.';

-- Drop existing triggers if any, then create
DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_user_personas_updated_at ON user_personas;
CREATE TRIGGER set_user_personas_updated_at
    BEFORE UPDATE ON user_personas
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_business_subs_updated_at ON business_subscriptions;
CREATE TRIGGER set_business_subs_updated_at
    BEFORE UPDATE ON business_subscriptions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_inst_licenses_updated_at ON institutional_licenses;
CREATE TRIGGER set_inst_licenses_updated_at
    BEFORE UPDATE ON institutional_licenses
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS set_doc_storage_updated_at ON document_storage;
CREATE TRIGGER set_doc_storage_updated_at
    BEFORE UPDATE ON document_storage
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ═══════════════════════════════════════════
-- ✅ Migration complete
-- Tables: user_roles, profiles, user_personas,
--         business_subscriptions, institutional_licenses,
--         document_storage
-- Functions: has_role(), get_persona_redirect(),
--            handle_new_user(), set_updated_at()
-- ═══════════════════════════════════════════
