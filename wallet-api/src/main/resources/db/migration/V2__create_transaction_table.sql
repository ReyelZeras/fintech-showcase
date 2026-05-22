CREATE TABLE transaction_history (
    id UUID PRIMARY KEY,
    wallet_id UUID NOT NULL,
    type VARCHAR(20) NOT NULL,
    amount DECIMAL(19, 2) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    CONSTRAINT fk_wallet FOREIGN KEY (wallet_id) REFERENCES wallet(id)
);