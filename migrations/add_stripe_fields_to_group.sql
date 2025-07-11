-- Add Stripe-related fields to mp_core_group table
ALTER TABLE mp_core_group
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_product_id TEXT,
ADD COLUMN IF NOT EXISTS plan_name VARCHAR(50),
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(20);

-- Comment to explain the migration
COMMENT ON COLUMN mp_core_group.stripe_customer_id IS 'Stripe customer ID for the group';
COMMENT ON COLUMN mp_core_group.stripe_subscription_id IS 'Stripe subscription ID for the group';
COMMENT ON COLUMN mp_core_group.stripe_product_id IS 'Stripe product ID for the subscription';
COMMENT ON COLUMN mp_core_group.plan_name IS 'Name of the subscription plan';
COMMENT ON COLUMN mp_core_group.subscription_status IS 'Status of the subscription (active, canceled, etc.)';
