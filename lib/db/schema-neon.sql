-- Database Schema for epàlwi-rèbbo Dictionary App
-- Neon-compatible version (without generated columns)

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table - core user profile information
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    display_name VARCHAR(255),
    photo_url TEXT,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    email_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Subscriptions table - Stripe subscription tracking
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(255) UNIQUE,
    stripe_subscription_id VARCHAR(255) UNIQUE,
    status VARCHAR(50) NOT NULL CHECK (status IN ('trial', 'active', 'expired', 'cancelled')),
    plan_id VARCHAR(255),
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    cancel_at_period_end BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trial periods table - 14-day free trial tracking (simplified)
CREATE TABLE trials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User preferences table - language and app preferences
CREATE TABLE user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    default_language VARCHAR(50) DEFAULT 'español' CHECK (default_language IN ('español', 'ndowe')),
    dark_mode BOOLEAN DEFAULT false,
    product_updates_notifications BOOLEAN DEFAULT true,
    language_tips_notifications BOOLEAN DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Search history table - user dictionary search tracking
CREATE TABLE search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    search_term VARCHAR(500) NOT NULL,
    search_language VARCHAR(50) NOT NULL CHECK (search_language IN ('español', 'ndowe')),
    result_count INTEGER DEFAULT 0,
    search_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Magic link tokens table - temporary token storage for authentication
CREATE TABLE magic_link_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    attempts INTEGER DEFAULT 0
);

-- Indexes for performance optimization
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_trials_user_id ON trials(user_id);
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX idx_search_history_user_id ON search_history(user_id);
CREATE INDEX idx_search_history_timestamp ON search_history(search_timestamp);
CREATE INDEX idx_magic_link_tokens_email ON magic_link_tokens(email);
CREATE INDEX idx_magic_link_tokens_token ON magic_link_tokens(token_hash);
CREATE INDEX idx_magic_link_tokens_expires ON magic_link_tokens(expires_at);

-- Function to automatically set updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at fields
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create trial period for new users
CREATE OR REPLACE FUNCTION create_trial_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO trials (user_id, end_date) 
    VALUES (NEW.id, CURRENT_TIMESTAMP + INTERVAL '14 days');
    
    INSERT INTO user_preferences (user_id)
    VALUES (NEW.id);
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create trial and preferences when user is created
CREATE TRIGGER create_trial_and_preferences_for_user AFTER INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION create_trial_for_new_user();

-- Function to clean up expired magic link tokens (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_magic_links()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM magic_link_tokens 
    WHERE expires_at < CURRENT_TIMESTAMP OR used_at IS NOT NULL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ language 'plpgsql';

-- Helper functions for computed values (replace generated columns)
CREATE OR REPLACE FUNCTION get_trial_days_remaining(trial_end_date TIMESTAMP WITH TIME ZONE)
RETURNS INTEGER AS $$
BEGIN
    IF trial_end_date > CURRENT_TIMESTAMP THEN
        RETURN EXTRACT(DAY FROM trial_end_date - CURRENT_TIMESTAMP)::INTEGER + 1;
    ELSE
        RETURN 0;
    END IF;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION is_trial_expired(trial_end_date TIMESTAMP WITH TIME ZONE)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN trial_end_date <= CURRENT_TIMESTAMP;
END;
$$ language 'plpgsql';

-- Views for commonly used queries
-- User profile complete view (matches existing UserProfile interface)
CREATE VIEW user_profiles AS
SELECT 
    u.id as uid,
    u.email,
    u.display_name,
    u.photo_url,
    u.role,
    u.email_verified,
    u.is_active,
    u.created_at,
    u.last_login_at,
    -- Trial information (using functions instead of generated columns)
    jsonb_build_object(
        'startDate', t.start_date,
        'endDate', t.end_date,
        'daysRemaining', get_trial_days_remaining(t.end_date),
        'isExpired', is_trial_expired(t.end_date)
    ) as trial,
    -- Subscription information
    jsonb_build_object(
        'status', COALESCE(s.status, 'trial'),
        'planId', s.plan_id,
        'currentPeriodStart', s.current_period_start,
        'currentPeriodEnd', s.current_period_end,
        'cancelAtPeriodEnd', s.cancel_at_period_end,
        'stripeCustomerId', s.stripe_customer_id,
        'stripeSubscriptionId', s.stripe_subscription_id
    ) as subscription,
    -- User preferences
    jsonb_build_object(
        'defaultLanguage', p.default_language,
        'darkMode', p.dark_mode,
        'notifications', jsonb_build_object(
            'productUpdates', p.product_updates_notifications,
            'languageTips', p.language_tips_notifications
        )
    ) as preferences,
    p.updated_at as preferences_updated_at
FROM users u
LEFT JOIN trials t ON u.id = t.user_id
LEFT JOIN subscriptions s ON u.id = s.user_id  
LEFT JOIN user_preferences p ON u.id = p.user_id;