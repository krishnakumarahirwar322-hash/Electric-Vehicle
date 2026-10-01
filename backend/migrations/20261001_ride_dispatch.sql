ALTER TABLE rides
    ADD COLUMN cancel_reason VARCHAR(255) NULL;

CREATE TABLE IF NOT EXISTS ride_driver_rejections (
    ride_id INT NOT NULL,
    driver_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ride_id, driver_id),
    INDEX idx_ride_driver_rejections_driver (driver_id)
) ENGINE=InnoDB;