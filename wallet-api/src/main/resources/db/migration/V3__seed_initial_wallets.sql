-- Insere 3 carteiras pré-configuradas para testes locais rápidos
INSERT INTO wallet (id, owner_name, balance, created_at, updated_at) VALUES
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'Reyel Soares', 5000.00, NOW(), NOW()),
('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'Carlos', 1500.50, NOW(), NOW()),
('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'Suporte Dev Fintech', 0.00, NOW(), NOW());