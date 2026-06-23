-- CreateTable
CREATE TABLE `users` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `full_name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NULL,
    `phone` VARCHAR(50) NULL,
    `password_hash` TEXT NOT NULL,
    `role` ENUM('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CASHIER', 'WAITER', 'CHEF', 'STOREKEEPER', 'BARMAN', 'DISPATCHER', 'ACCOUNTANT', 'HR') NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_email_key`(`email`),
    UNIQUE INDEX `users_phone_key`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pricing_rules` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `rule_type` ENUM('FIXED_PRICE', 'PERCENT_INCREASE', 'PERCENT_DECREASE') NOT NULL,
    `value` DECIMAL(12, 2) NOT NULL,
    `product_category` ENUM('FOOD', 'SOFT_DRINK', 'ALCOHOLIC_DRINK') NULL,
    `min_selling_price` DECIMAL(65, 30) NULL,
    `max_selling_price` DECIMAL(65, 30) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `price_change_audit_trails` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `product_id` BIGINT NOT NULL,
    `pricing_rule_id` BIGINT NULL,
    `actor_user_id` BIGINT NOT NULL,
    `old_selling_price` DECIMAL(12, 2) NOT NULL,
    `new_selling_price` DECIMAL(12, 2) NOT NULL,
    `note` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `price_change_audit_trails_product_id_idx`(`product_id`),
    INDEX `price_change_audit_trails_pricing_rule_id_idx`(`pricing_rule_id`),
    INDEX `price_change_audit_trails_actor_user_id_idx`(`actor_user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `suppliers` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `supplier_name` VARCHAR(255) NOT NULL,
    `contact_person` VARCHAR(255) NULL,
    `phone` VARCHAR(50) NULL,
    `email` VARCHAR(255) NULL,
    `physical_address` TEXT NULL,
    `supplier_type` ENUM('FOOD', 'SOFT_DRINKS', 'ALCOHOL', 'GENERAL') NOT NULL,
    `status` ENUM('ACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `product_name` VARCHAR(255) NOT NULL,
    `product_category` ENUM('FOOD', 'SOFT_DRINK', 'ALCOHOLIC_DRINK') NOT NULL,
    `selling_price` DECIMAL(12, 2) NOT NULL,
    `cost_price` DECIMAL(12, 2) NOT NULL,
    `barcode` VARCHAR(255) NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tables` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `table_name` VARCHAR(255) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `table_id` BIGINT NOT NULL,
    `waiter_id` BIGINT NOT NULL,
    `status` ENUM('PENDING', 'PREPARING', 'READY', 'SERVED', 'PAID', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `total_amount` DOUBLE NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `orders_table_id_idx`(`table_id`),
    INDEX `orders_waiter_id_idx`(`waiter_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_items` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `product_id` BIGINT NULL,
    `product_name` VARCHAR(255) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unit_price` DOUBLE NOT NULL,
    `line_total` DOUBLE NOT NULL,

    INDEX `order_items_order_id_idx`(`order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_items` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `product_id` BIGINT NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 0,
    `location` VARCHAR(100) NOT NULL DEFAULT 'MAIN_STORE',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `stock_items_product_id_key`(`product_id`),
    INDEX `stock_items_product_id_idx`(`product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `stock_movements` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `stock_item_id` BIGINT NOT NULL,
    `movement_type` ENUM('PURCHASE', 'ADJUSTMENT', 'TRANSFER', 'WASTE') NOT NULL,
    `quantity` INTEGER NOT NULL,
    `reference` VARCHAR(255) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `stock_movements_stock_item_id_idx`(`stock_item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `payment_method` ENUM('CASH', 'MPESA', 'CARD') NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `transaction_reference` VARCHAR(255) NULL,
    `payment_status` ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `payments_order_id_idx`(`order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `margin_alerts` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `alert_status` ENUM('OPEN', 'UNDER_REVIEW', 'RESOLVED') NOT NULL DEFAULT 'OPEN',
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recipes` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `product_id` BIGINT NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `instructions` TEXT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `recipes_product_id_key`(`product_id`),
    INDEX `recipes_product_id_idx`(`product_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `recipe_ingredients` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `recipe_id` BIGINT NOT NULL,
    `stock_item_id` BIGINT NOT NULL,
    `quantity` DECIMAL(10, 3) NOT NULL,
    `unit` VARCHAR(50) NOT NULL DEFAULT 'units',

    INDEX `recipe_ingredients_recipe_id_idx`(`recipe_id`),
    INDEX `recipe_ingredients_stock_item_id_idx`(`stock_item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `production_plans` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `recipe_id` BIGINT NOT NULL,
    `planned_quantity` INTEGER NOT NULL,
    `produced_quantity` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PLANNED',
    `planned_date` DATETIME(3) NOT NULL,
    `completed_date` DATETIME(3) NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `production_plans_recipe_id_idx`(`recipe_id`),
    INDEX `production_plans_status_idx`(`status`),
    INDEX `production_plans_planned_date_idx`(`planned_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `riders` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `phone` VARCHAR(50) NOT NULL,
    `license_number` VARCHAR(100) NULL,
    `vehicle_type` VARCHAR(50) NULL,
    `vehicle_plate` VARCHAR(50) NULL,
    `is_available` BOOLEAN NOT NULL DEFAULT true,
    `current_location` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `riders_user_id_key`(`user_id`),
    INDEX `riders_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `deliveries` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `order_id` BIGINT NOT NULL,
    `rider_id` BIGINT NOT NULL,
    `status` ENUM('ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'ASSIGNED',
    `pickup_address` TEXT NULL,
    `delivery_address` TEXT NOT NULL,
    `delivery_notes` TEXT NULL,
    `assigned_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `picked_up_at` DATETIME(3) NULL,
    `delivered_at` DATETIME(3) NULL,
    `cancelled_at` DATETIME(3) NULL,
    `cancellation_reason` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `deliveries_order_id_key`(`order_id`),
    INDEX `deliveries_order_id_idx`(`order_id`),
    INDEX `deliveries_rider_id_idx`(`rider_id`),
    INDEX `deliveries_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `waste_declarations` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `product_id` BIGINT NOT NULL,
    `quantity` INTEGER NOT NULL,
    `reason` ENUM('EXPIRED', 'SPOILED', 'OVERPRODUCTION', 'QUALITY_ISSUE', 'CUSTOMER_RETURN', 'THEFT', 'OTHER') NOT NULL,
    `notes` TEXT NULL,
    `declared_by` BIGINT NOT NULL,
    `cost_value` DECIMAL(12, 2) NOT NULL,
    `declared_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `waste_declarations_product_id_idx`(`product_id`),
    INDEX `waste_declarations_declared_by_idx`(`declared_by`),
    INDEX `waste_declarations_reason_idx`(`reason`),
    INDEX `waste_declarations_declared_at_idx`(`declared_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `price_change_audit_trails` ADD CONSTRAINT `price_change_audit_trails_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `price_change_audit_trails` ADD CONSTRAINT `price_change_audit_trails_pricing_rule_id_fkey` FOREIGN KEY (`pricing_rule_id`) REFERENCES `pricing_rules`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `price_change_audit_trails` ADD CONSTRAINT `price_change_audit_trails_actor_user_id_fkey` FOREIGN KEY (`actor_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_waiter_id_fkey` FOREIGN KEY (`waiter_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_table_id_fkey` FOREIGN KEY (`table_id`) REFERENCES `tables`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_items` ADD CONSTRAINT `order_items_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_items` ADD CONSTRAINT `stock_items_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_movements` ADD CONSTRAINT `stock_movements_stock_item_id_fkey` FOREIGN KEY (`stock_item_id`) REFERENCES `stock_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recipes` ADD CONSTRAINT `recipes_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recipe_ingredients` ADD CONSTRAINT `recipe_ingredients_recipe_id_fkey` FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `recipe_ingredients` ADD CONSTRAINT `recipe_ingredients_stock_item_id_fkey` FOREIGN KEY (`stock_item_id`) REFERENCES `stock_items`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `production_plans` ADD CONSTRAINT `production_plans_recipe_id_fkey` FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `riders` ADD CONSTRAINT `riders_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `deliveries` ADD CONSTRAINT `deliveries_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `deliveries` ADD CONSTRAINT `deliveries_rider_id_fkey` FOREIGN KEY (`rider_id`) REFERENCES `riders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `waste_declarations` ADD CONSTRAINT `waste_declarations_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `waste_declarations` ADD CONSTRAINT `waste_declarations_declared_by_fkey` FOREIGN KEY (`declared_by`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

