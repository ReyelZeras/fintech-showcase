CREATE TABLE users (
                       id UUID PRIMARY KEY,
                       full_name VARCHAR(255) NOT NULL,
                       email VARCHAR(255) NOT NULL UNIQUE,
                       password VARCHAR(255) NOT NULL,
                       pix_key VARCHAR(255) UNIQUE,
                       wallet_id UUID,
                       CONSTRAINT fk_user_wallet FOREIGN KEY (wallet_id) REFERENCES wallet(id)
);