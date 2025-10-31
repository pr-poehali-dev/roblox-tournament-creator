CREATE TABLE player_reports (
  id SERIAL PRIMARY KEY,
  reporter_user_id INTEGER REFERENCES users(id),
  reported_player_name VARCHAR(255) NOT NULL,
  report_type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vip_servers (
  id SERIAL PRIMARY KEY,
  game_name VARCHAR(255) NOT NULL,
  server_url TEXT NOT NULL,
  creator_user_id INTEGER REFERENCES users(id),
  online_players INTEGER DEFAULT 0,
  max_players INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users ADD COLUMN roblox_id BIGINT UNIQUE;
ALTER TABLE users ADD COLUMN roblox_username VARCHAR(255);
ALTER TABLE users ADD COLUMN roblox_avatar_url TEXT;

CREATE INDEX idx_reports_status ON player_reports(status);
CREATE INDEX idx_vip_servers_creator ON vip_servers(creator_user_id);
CREATE INDEX idx_users_roblox_id ON users(roblox_id);