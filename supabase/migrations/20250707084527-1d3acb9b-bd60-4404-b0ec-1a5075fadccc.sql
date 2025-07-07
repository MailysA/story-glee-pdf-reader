-- Create a private stripe schema (not exposed to API)
CREATE SCHEMA IF NOT EXISTS stripe;

-- Table to store Stripe customers
CREATE TABLE stripe.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table to store subscription plans/products
CREATE TABLE stripe.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_product_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table to store pricing information
CREATE TABLE stripe.prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_price_id TEXT UNIQUE NOT NULL,
  product_id UUID NOT NULL REFERENCES stripe.products(id) ON DELETE CASCADE,
  unit_amount INTEGER, -- amount in cents
  currency TEXT NOT NULL DEFAULT 'eur',
  interval TEXT, -- month, year, etc.
  interval_count INTEGER DEFAULT 1,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table to store user subscriptions
CREATE TABLE stripe.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES stripe.customers(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL, -- active, canceled, past_due, etc.
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  canceled_at TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table to store subscription items (what products/prices are included)
CREATE TABLE stripe.subscription_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES stripe.subscriptions(id) ON DELETE CASCADE,
  stripe_subscription_item_id TEXT UNIQUE NOT NULL,
  price_id UUID NOT NULL REFERENCES stripe.prices(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table to store payment methods
CREATE TABLE stripe.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES stripe.customers(id) ON DELETE CASCADE,
  stripe_payment_method_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL, -- card, sepa_debit, etc.
  is_default BOOLEAN NOT NULL DEFAULT false,
  card_brand TEXT,
  card_last4 TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table to store invoices
CREATE TABLE stripe.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES stripe.customers(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES stripe.subscriptions(id) ON DELETE SET NULL,
  stripe_invoice_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL, -- draft, open, paid, void, uncollectible
  amount_due INTEGER NOT NULL, -- in cents
  amount_paid INTEGER NOT NULL DEFAULT 0, -- in cents
  currency TEXT NOT NULL DEFAULT 'eur',
  invoice_pdf TEXT, -- URL to PDF
  hosted_invoice_url TEXT, -- URL to hosted invoice
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table to store usage records for metered billing
CREATE TABLE stripe.usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_item_id UUID NOT NULL REFERENCES stripe.subscription_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  action TEXT NOT NULL, -- increment, set
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  stripe_usage_record_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table to store one-time payments/purchases
CREATE TABLE stripe.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES stripe.customers(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE NOT NULL,
  stripe_checkout_session_id TEXT,
  amount INTEGER NOT NULL, -- in cents
  currency TEXT NOT NULL DEFAULT 'eur',
  status TEXT NOT NULL, -- requires_payment_method, requires_confirmation, succeeded, etc.
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_stripe_customers_user_id ON stripe.customers(user_id);
CREATE INDEX idx_stripe_customers_stripe_id ON stripe.customers(stripe_customer_id);
CREATE INDEX idx_stripe_subscriptions_user_id ON stripe.subscriptions(user_id);
CREATE INDEX idx_stripe_subscriptions_customer_id ON stripe.subscriptions(customer_id);
CREATE INDEX idx_stripe_subscriptions_status ON stripe.subscriptions(status);
CREATE INDEX idx_stripe_invoices_user_id ON stripe.invoices(user_id);
CREATE INDEX idx_stripe_invoices_status ON stripe.invoices(status);
CREATE INDEX idx_stripe_payments_user_id ON stripe.payments(user_id);
CREATE INDEX idx_stripe_payments_status ON stripe.payments(status);

-- Create function to update updated_at timestamps
CREATE OR REPLACE FUNCTION stripe.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_stripe_customers_updated_at
  BEFORE UPDATE ON stripe.customers
  FOR EACH ROW EXECUTE FUNCTION stripe.update_updated_at_column();

CREATE TRIGGER update_stripe_products_updated_at
  BEFORE UPDATE ON stripe.products
  FOR EACH ROW EXECUTE FUNCTION stripe.update_updated_at_column();

CREATE TRIGGER update_stripe_prices_updated_at
  BEFORE UPDATE ON stripe.prices
  FOR EACH ROW EXECUTE FUNCTION stripe.update_updated_at_column();

CREATE TRIGGER update_stripe_subscriptions_updated_at
  BEFORE UPDATE ON stripe.subscriptions
  FOR EACH ROW EXECUTE FUNCTION stripe.update_updated_at_column();

CREATE TRIGGER update_stripe_subscription_items_updated_at
  BEFORE UPDATE ON stripe.subscription_items
  FOR EACH ROW EXECUTE FUNCTION stripe.update_updated_at_column();

CREATE TRIGGER update_stripe_payment_methods_updated_at
  BEFORE UPDATE ON stripe.payment_methods
  FOR EACH ROW EXECUTE FUNCTION stripe.update_updated_at_column();

CREATE TRIGGER update_stripe_invoices_updated_at
  BEFORE UPDATE ON stripe.invoices
  FOR EACH ROW EXECUTE FUNCTION stripe.update_updated_at_column();

CREATE TRIGGER update_stripe_payments_updated_at
  BEFORE UPDATE ON stripe.payments
  FOR EACH ROW EXECUTE FUNCTION stripe.update_updated_at_column();