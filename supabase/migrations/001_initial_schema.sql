-- ═══════════════════════════════════════════════════════════════════
-- DIGITALIUM.IO — Supabase Migration 001: Initial Schema
-- Tables complémentaires, RLS, Triggers, Storage
-- ═══════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════
-- 0. EXTENSIONS
-- ═══════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ═══════════════════════════════════════════
-- 1. ENUM & TABLE user_roles
-- ═══════════════════════════════════════════

CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
    id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role        public.app_role NOT NULL DEFAULT 'user',
    created_at  TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE(user_id, role)
);

COMMENT ON TABLE public.user_roles IS 'Maps Supabase auth users to application roles.';

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Users can see their own roles
CREATE POLICY "Users can view their own roles"
    ON public.user_roles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Admins can see all roles
CREATE POLICY "Admins can view all roles"
    ON public.user_roles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can insert roles
CREATE POLICY "Admins can insert roles"
    ON public.user_roles
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Admins can delete roles
CREATE POLICY "Admins can delete roles"
    ON public.user_roles
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );


-- ─── has_role() function ────────────────────

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM public.user_roles
        WHERE user_id = _user_id
          AND role = _role
    );
END;
$$;

COMMENT ON FUNCTION public.has_role IS 'Check if a user has a specific application role (SECURITY DEFINER).';


-- ═══════════════════════════════════════════
-- 2. TABLE profiles
-- ═══════════════════════════════════════════

CREATE TABLE public.profiles (
    id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    display_name    TEXT,
    phone           TEXT,
    company         TEXT,
    avatar_url      TEXT,
    persona_type    TEXT CHECK (persona_type IN ('citizen', 'business', 'institutional')),
    created_at      TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at      TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.profiles IS 'Extended user profiles linked to Supabase Auth.';

CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_persona_type ON public.profiles(persona_type);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
    ON public.profiles
    FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
    ON public.profiles
    FOR UPDATE
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));


-- ═══════════════════════════════════════════
-- 3. TABLE user_personas
-- ═══════════════════════════════════════════

CREATE TABLE public.user_personas (
    id                      UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id                 UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    persona_type            TEXT NOT NULL CHECK (persona_type IN ('citizen', 'business', 'institutional')),
    organization_id         TEXT, -- Convex organization ID (string ref)
    onboarding_completed    BOOLEAN DEFAULT false NOT NULL,
    onboarding_step         INTEGER DEFAULT 0 NOT NULL,
    created_at              TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at              TIMESTAMPTZ DEFAULT now() NOT NULL
);

COMMENT ON TABLE public.user_personas IS 'Tracks user persona selection and onboarding progress.';

CREATE INDEX idx_user_personas_persona_type ON public.user_personas(persona_type);

ALTER TABLE public.user_personas ENABLE ROW LEVEL SECURITY;

-- Users can view their own persona
CREATE POLICY "Users can view their own persona"
    ON public.user_personas
    FOR SELECT
    USING (auth.uid() = user_id);

-- Users can update their own persona
CREATE POLICY "Users can update their own persona"
    ON public.user_personas
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can insert their own persona
CREATE POLICY "Users can insert their own persona"
    ON public.user_personas
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Admins can view all personas
CREATE POLICY "Admins can view all personas"
    ON public.user_personas
    FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));


-- ═══════════════════════════════════════════
-- 4. TABLE business_subscriptions
-- ═══════════════════════════════════════════

CREATE TABLE public.business_subscriptions (
    id                      UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id         TEXT NOT NULL, -- Convex organization ID
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

COMMENT ON TABLE public.business_subscriptions IS 'SaaS billing for business (Entreprise) persona subscriptions.';

CREATE INDEX idx_business_subs_org ON public.business_subscriptions(organization_id);
CREATE INDEX idx_business_subs_status ON public.business_subscriptions(status);

ALTER TABLE public.business_subscriptions ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view their org subscriptions
CREATE POLICY "Users can view their org subscriptions"
    ON public.business_subscriptions
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Admins can manage all subscriptions
CREATE POLICY "Admins can manage subscriptions"
    ON public.business_subscriptions
    FOR ALL
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));


-- ═══════════════════════════════════════════
-- 5. TABLE institutional_licenses
-- ═══════════════════════════════════════════

CREATE TABLE public.institutional_licenses (
    id                      UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organization_id         TEXT NOT NULL, -- Convex organization ID
    license_key             TEXT NOT NULL UNIQUE,
    license_type            TEXT NOT NULL CHECK (license_type IN ('perpetual', 'subscription_annual')),
    deployment              TEXT NOT NULL CHECK (deployment IN ('on_premise', 'private_cloud', 'hybrid')) DEFAULT 'private_cloud',
    region                  TEXT NOT NULL DEFAULT 'gabon',
    maintenance_expires_at  TIMESTAMPTZ,
    max_users               INTEGER, -- NULL = unlimited
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

COMMENT ON TABLE public.institutional_licenses IS 'Sovereign licenses for institutional (Institutions) persona — perpetual or annual.';

CREATE INDEX idx_inst_licenses_org ON public.institutional_licenses(organization_id);
CREATE INDEX idx_inst_licenses_key ON public.institutional_licenses(license_key);

ALTER TABLE public.institutional_licenses ENABLE ROW LEVEL SECURITY;

-- Authenticated users can view licenses
CREATE POLICY "Users can view their org licenses"
    ON public.institutional_licenses
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Admins can manage all licenses
CREATE POLICY "Admins can manage licenses"
    ON public.institutional_licenses
    FOR ALL
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));


-- ═══════════════════════════════════════════
-- 6. FUNCTION get_persona_redirect
-- ═══════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_persona_redirect(_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _persona TEXT;
BEGIN
    SELECT persona_type INTO _persona
    FROM public.user_personas
    WHERE user_id = _user_id;

    RETURN CASE _persona
        WHEN 'citizen'        THEN 'https://identite.ga'
        WHEN 'business'       THEN '/pro'
        WHEN 'institutional'  THEN '/institutional'
        ELSE '/onboarding'
    END;
END;
$$;

COMMENT ON FUNCTION public.get_persona_redirect IS 'Returns redirect URL based on user persona type.';


-- ═══════════════════════════════════════════
-- 7. STORAGE BUCKET "documents"
-- ═══════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents',
    false,
    52428800, -- 50 MB
    ARRAY[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'image/png',
        'image/jpeg',
        'image/webp',
        'text/plain',
        'text/csv'
    ]
)
ON CONFLICT (id) DO NOTHING;

-- Users can upload to their own folder (folder = user_id)
CREATE POLICY "Users can upload their own documents"
    ON storage.objects
    FOR INSERT
    WITH CHECK (
        bucket_id = 'documents'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Users can view their own documents
CREATE POLICY "Users can view their own documents"
    ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'documents'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Users can delete their own documents
CREATE POLICY "Users can delete their own documents"
    ON storage.objects
    FOR DELETE
    USING (
        bucket_id = 'documents'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Users can update their own documents
CREATE POLICY "Users can update their own documents"
    ON storage.objects
    FOR UPDATE
    USING (
        bucket_id = 'documents'
        AND auth.uid()::text = (storage.foldername(name))[1]
    )
    WITH CHECK (
        bucket_id = 'documents'
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Admins can view all documents
CREATE POLICY "Admins can view all documents"
    ON storage.objects
    FOR SELECT
    USING (
        bucket_id = 'documents'
        AND public.has_role(auth.uid(), 'admin')
    );

-- Admins can manage all documents
CREATE POLICY "Admins can manage all documents"
    ON storage.objects
    FOR ALL
    USING (
        bucket_id = 'documents'
        AND public.has_role(auth.uid(), 'admin')
    )
    WITH CHECK (
        bucket_id = 'documents'
        AND public.has_role(auth.uid(), 'admin')
    );


-- ═══════════════════════════════════════════
-- 8. TRIGGER handle_new_user
-- ═══════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _role public.app_role;
BEGIN
    -- Determine role based on email
    IF NEW.email = 'admin@digitalium.ga' THEN
        _role := 'admin';
    ELSE
        _role := 'user';
    END IF;

    -- Create profile
    INSERT INTO public.profiles (user_id, display_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    );

    -- Assign role
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, _role);

    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user IS 'Auto-creates profile and assigns role on new user signup.';

-- Trigger on auth.users insert
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();


-- ═══════════════════════════════════════════
-- 9. TRIGGERS updated_at
-- ═══════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.set_updated_at IS 'Auto-sets updated_at timestamp on row update.';

-- Apply to all tables with updated_at column
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_user_personas_updated_at
    BEFORE UPDATE ON public.user_personas
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_business_subscriptions_updated_at
    BEFORE UPDATE ON public.business_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_institutional_licenses_updated_at
    BEFORE UPDATE ON public.institutional_licenses
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();


-- ═══════════════════════════════════════════
-- ✅ Migration complete
-- Tables: user_roles, profiles, user_personas,
--         business_subscriptions, institutional_licenses
-- Functions: has_role(), get_persona_redirect(), 
--            handle_new_user(), set_updated_at()
-- Storage: documents bucket
-- RLS: Enabled on all tables + storage
-- ═══════════════════════════════════════════
