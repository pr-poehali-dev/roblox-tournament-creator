ALTER TABLE users DROP CONSTRAINT users_telegram_id_key;
ALTER TABLE users ADD CONSTRAINT users_telegram_id_key UNIQUE NULLS NOT DISTINCT (telegram_id);