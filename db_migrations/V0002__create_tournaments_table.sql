CREATE TABLE tournaments (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  game_name VARCHAR(255) NOT NULL,
  roblox_server_url TEXT NOT NULL,
  max_players INTEGER NOT NULL,
  prize_robux INTEGER NOT NULL,
  creator_user_id INTEGER REFERENCES users(id),
  current_players INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'registration',
  start_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_creator ON tournaments(creator_user_id);