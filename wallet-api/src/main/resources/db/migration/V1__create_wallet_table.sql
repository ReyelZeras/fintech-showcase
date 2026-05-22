CREATE TABLE wallet (
    id UUID PRIMARY KEY,
    owner_name VARCHAR(255) NOT NULL,
    balance DECIMAL(19, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);