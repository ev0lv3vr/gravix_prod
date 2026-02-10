-- ============================================
-- GRAVIX V2 — INITIAL DATABASE SCHEMA
-- Supabase PostgreSQL Migration
-- Created: 2026-02-10
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- Extends Supabase auth.users with app-specific fields
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    company TEXT,
    role TEXT,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'team', 'enterprise')),
    analyses_this_month INTEGER DEFAULT 0,
    specs_this_month INTEGER DEFAULT 0,
    analyses_reset_date DATE DEFAULT CURRENT_DATE,
    specs_reset_date DATE DEFAULT CURRENT_DATE,
    stripe_customer_id TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer ON public.users(stripe_customer_id);

-- ============================================
-- SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT UNIQUE,
    plan TEXT NOT NULL CHECK (plan IN ('free', 'pro', 'team', 'enterprise')),
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe ON public.subscriptions(stripe_subscription_id);

-- ============================================
-- FAILURE_ANALYSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.failure_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Input Fields
    material_category TEXT NOT NULL CHECK (material_category IN ('adhesive', 'sealant', 'coating')),
    material_subcategory TEXT,
    material_product TEXT,
    failure_mode TEXT NOT NULL,
    failure_description TEXT,
    substrate_a TEXT,
    substrate_b TEXT,
    temperature_range TEXT,
    humidity TEXT,
    chemical_exposure TEXT,
    time_to_failure TEXT,
    application_method TEXT,
    surface_preparation TEXT,
    cure_conditions TEXT,
    photos JSONB DEFAULT '[]'::jsonb,
    test_results TEXT,
    additional_notes TEXT,
    
    -- Output Fields
    analysis_result JSONB,
    root_causes JSONB,
    contributing_factors JSONB,
    recommendations JSONB,
    prevention_plan TEXT,
    similar_cases JSONB,
    confidence_score REAL CHECK (confidence_score IS NULL OR (confidence_score >= 0 AND confidence_score <= 1)),
    
    -- Metadata
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    is_public BOOLEAN DEFAULT FALSE,
    ai_model_version TEXT,
    processing_time_ms INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_failure_analyses_user ON public.failure_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_failure_analyses_material ON public.failure_analyses(material_category, material_subcategory);
CREATE INDEX IF NOT EXISTS idx_failure_analyses_failure_mode ON public.failure_analyses(failure_mode);
CREATE INDEX IF NOT EXISTS idx_failure_analyses_created ON public.failure_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_failure_analyses_public ON public.failure_analyses(is_public) WHERE is_public = TRUE;

-- ============================================
-- SPEC_REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.spec_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Input Fields
    material_category TEXT NOT NULL CHECK (material_category IN ('adhesive', 'sealant', 'coating')),
    substrate_a TEXT NOT NULL,
    substrate_b TEXT NOT NULL,
    bond_requirements JSONB,
    environment JSONB,
    cure_constraints JSONB,
    production_volume TEXT,
    application_method TEXT,
    additional_requirements TEXT,
    
    -- Output Fields
    spec_result JSONB,
    recommended_spec JSONB,
    product_characteristics JSONB,
    application_guidance JSONB,
    warnings JSONB,
    alternatives JSONB,
    
    -- Metadata
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    ai_model_version TEXT,
    processing_time_ms INTEGER,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_spec_requests_user ON public.spec_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_spec_requests_material ON public.spec_requests(material_category);
CREATE INDEX IF NOT EXISTS idx_spec_requests_substrates ON public.spec_requests(substrate_a, substrate_b);
CREATE INDEX IF NOT EXISTS idx_spec_requests_created ON public.spec_requests(created_at DESC);

-- ============================================
-- MATERIALS TABLE (Reference Data)
-- ============================================
CREATE TABLE IF NOT EXISTS public.materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category TEXT NOT NULL CHECK (category IN ('adhesive', 'sealant', 'coating')),
    subcategory TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    properties JSONB,
    compatible_substrates JSONB,
    incompatible_substrates JSONB,
    common_failure_modes JSONB,
    application_guidelines TEXT,
    typical_applications TEXT[],
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(category, subcategory, name)
);

CREATE INDEX IF NOT EXISTS idx_materials_category ON public.materials(category, subcategory);

-- ============================================
-- CASE_LIBRARY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.case_library (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_analysis_id UUID REFERENCES public.failure_analyses(id) ON DELETE SET NULL,
    
    title TEXT NOT NULL,
    summary TEXT,
    material_category TEXT NOT NULL,
    material_subcategory TEXT,
    failure_mode TEXT NOT NULL,
    root_cause TEXT,
    contributing_factors TEXT[],
    solution TEXT,
    prevention_tips TEXT,
    lessons_learned TEXT,
    
    industry TEXT,
    application_type TEXT,
    tags TEXT[],
    
    views INTEGER DEFAULT 0,
    helpful_votes INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    
    slug TEXT UNIQUE,
    meta_description TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_case_library_material ON public.case_library(material_category, material_subcategory);
CREATE INDEX IF NOT EXISTS idx_case_library_failure_mode ON public.case_library(failure_mode);
CREATE INDEX IF NOT EXISTS idx_case_library_industry ON public.case_library(industry);
CREATE INDEX IF NOT EXISTS idx_case_library_featured ON public.case_library(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_case_library_slug ON public.case_library(slug);

-- ============================================
-- EXPERT_REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.expert_reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    analysis_id UUID REFERENCES public.failure_analyses(id) ON DELETE SET NULL,
    spec_id UUID REFERENCES public.spec_requests(id) ON DELETE SET NULL,
    
    request_type TEXT NOT NULL CHECK (request_type IN ('failure', 'spec')),
    user_notes TEXT,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'urgent')),
    
    review_result TEXT,
    expert_notes TEXT,
    recommendations JSONB,
    attachments JSONB,
    
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'canceled')),
    price DECIMAL(10, 2),
    stripe_payment_id TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT expert_review_reference CHECK (
        (analysis_id IS NOT NULL AND spec_id IS NULL) OR
        (analysis_id IS NULL AND spec_id IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS idx_expert_reviews_user ON public.expert_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_expert_reviews_status ON public.expert_reviews(status);

-- ============================================
-- USAGE_LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.usage_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    resource_type TEXT,
    resource_id UUID,
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_logs_user ON public.usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_action ON public.usage_logs(action);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created ON public.usage_logs(created_at DESC);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN SELECT unnest(ARRAY[
        'users', 'subscriptions', 'failure_analyses', 'spec_requests', 
        'materials', 'case_library', 'expert_reviews'
    ])
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%s_updated_at ON public.%I', t, t);
        EXECUTE format(
            'CREATE TRIGGER update_%s_updated_at BEFORE UPDATE ON public.%I 
             FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()', t, t
        );
    END LOOP;
END;
$$;

-- Auto-create user profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, plan)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        'free'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Usage limit checker
CREATE OR REPLACE FUNCTION increment_user_usage(
    p_user_id UUID,
    p_usage_type TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    v_plan TEXT;
    v_current_count INTEGER;
    v_limit INTEGER;
    v_reset_date DATE;
BEGIN
    SELECT plan, 
           CASE WHEN p_usage_type = 'analysis' THEN analyses_this_month ELSE specs_this_month END,
           CASE WHEN p_usage_type = 'analysis' THEN analyses_reset_date ELSE specs_reset_date END
    INTO v_plan, v_current_count, v_reset_date
    FROM public.users WHERE id = p_user_id;
    
    -- Reset if new month
    IF v_reset_date < DATE_TRUNC('month', CURRENT_DATE) THEN
        v_current_count := 0;
        IF p_usage_type = 'analysis' THEN
            UPDATE public.users SET analyses_this_month = 0, analyses_reset_date = CURRENT_DATE WHERE id = p_user_id;
        ELSE
            UPDATE public.users SET specs_this_month = 0, specs_reset_date = CURRENT_DATE WHERE id = p_user_id;
        END IF;
    END IF;
    
    v_limit := CASE v_plan
        WHEN 'free' THEN 2
        WHEN 'pro' THEN 15
        WHEN 'team' THEN 50
        WHEN 'enterprise' THEN 999999
        ELSE 2
    END;
    
    IF v_current_count >= v_limit THEN
        RETURN FALSE;
    END IF;
    
    IF p_usage_type = 'analysis' THEN
        UPDATE public.users SET analyses_this_month = analyses_this_month + 1 WHERE id = p_user_id;
    ELSE
        UPDATE public.users SET specs_this_month = specs_this_month + 1 WHERE id = p_user_id;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.failure_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spec_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.case_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- Users
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Failure analyses
CREATE POLICY "Users can view own analyses" ON public.failure_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own analyses" ON public.failure_analyses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Public can view public analyses" ON public.failure_analyses FOR SELECT USING (is_public = TRUE);

-- Spec requests
CREATE POLICY "Users can view own specs" ON public.spec_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own specs" ON public.spec_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Expert reviews
CREATE POLICY "Users can view own reviews" ON public.expert_reviews FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own reviews" ON public.expert_reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Case library (public read)
CREATE POLICY "Anyone can view cases" ON public.case_library FOR SELECT USING (TRUE);

-- Materials (public read)
CREATE POLICY "Anyone can view materials" ON public.materials FOR SELECT USING (TRUE);

-- Usage logs (own data only)
CREATE POLICY "Users can view own logs" ON public.usage_logs FOR SELECT USING (auth.uid() = user_id);

-- ============================================
-- SERVICE ROLE POLICIES
-- Backend API uses service_role key to bypass RLS
-- No additional policies needed for server-side operations
-- ============================================
