ALTER TABLE payments
    ADD COLUMN platform_share DECIMAL(10,2) NULL,
    ADD COLUMN driver_settlement DECIMAL(10,2) NULL;