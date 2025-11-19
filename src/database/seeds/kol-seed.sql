-- Add commission rate columns to existing players table
ALTER TABLE players 
ADD COLUMN IF NOT EXISTS sol_commission_rate DOUBLE PRECISION DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS mine_commission_rate DOUBLE PRECISION DEFAULT 0.0;

-- Create commission_logs table if not exists
CREATE TABLE IF NOT EXISTS commission_logs (
  id SERIAL PRIMARY KEY,
  kol_uuid VARCHAR(36) NOT NULL,
  sol_amount DECIMAL(20, 9) NOT NULL,
  mine_amount BIGINT NOT NULL,
  status VARCHAR(20) DEFAULT 'PAID',
  transaction_hash VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (kol_uuid) REFERENCES players(uuid) ON DELETE CASCADE
);

-- Update some existing users to be KOLs (assuming they exist)
-- You'll need to adjust these UUIDs based on your actual data
UPDATE players 
SET role = 'KOL', 
    sol_commission_rate = 10.0, 
    mine_commission_rate = 2.0
WHERE username IN ('StreamerX', 'CryptoGamer', 'GameMaster', 'ProPlayer')
  AND role = 'USER';

-- Insert sample commission logs for KOLs
-- Note: Replace these UUIDs with actual KOL UUIDs from your database
INSERT INTO commission_logs (kol_uuid, sol_amount, mine_amount, status, transaction_hash, created_at)
SELECT 
  uuid,
  1.52,
  24089,
  'PAID',
  '5f...e8y',
  NOW() - INTERVAL '3 days'
FROM players 
WHERE role = 'KOL' 
LIMIT 1;

INSERT INTO commission_logs (kol_uuid, sol_amount, mine_amount, status, transaction_hash, created_at)
SELECT 
  uuid,
  1.28,
  18268,
  'PAID',
  '8h...p1w',
  NOW() - INTERVAL '7 days'
FROM players 
WHERE role = 'KOL' 
LIMIT 1;

INSERT INTO commission_logs (kol_uuid, sol_amount, mine_amount, status, transaction_hash, created_at)
SELECT 
  uuid,
  0.94,
  14408,
  'PAID',
  '9k...j7s',
  NOW() - INTERVAL '10 days'
FROM players 
WHERE role = 'KOL' 
LIMIT 1;

