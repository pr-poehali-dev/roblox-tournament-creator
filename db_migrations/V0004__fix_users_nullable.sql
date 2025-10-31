ALTER TABLE users ALTER COLUMN telegram_id SET DEFAULT NULL;
UPDATE users SET telegram_id = NULL WHERE telegram_id = 0;
CREATE UNIQUE INDEX idx_users_roblox_id_unique ON users(roblox_id) WHERE roblox_id IS NOT NULL;