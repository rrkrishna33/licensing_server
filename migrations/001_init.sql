CREATE TABLE IF NOT EXISTS customers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS licenses (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  license_key TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  max_machines INTEGER NOT NULL DEFAULT 1,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (status IN ('active', 'suspended', 'expired', 'cancelled'))
);

CREATE TABLE IF NOT EXISTS license_activations (
  id SERIAL PRIMARY KEY,
  license_id INTEGER NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
  machine_id TEXT NOT NULL,
  app_version TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  first_activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (license_id, machine_id)
);

CREATE INDEX IF NOT EXISTS idx_licenses_key ON licenses(license_key);
CREATE INDEX IF NOT EXISTS idx_activations_license ON license_activations(license_id);
