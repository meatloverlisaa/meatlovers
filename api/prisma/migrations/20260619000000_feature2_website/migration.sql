-- CreateTable
CREATE TABLE `content_pages` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(255) NOT NULL,
    `page_type` ENUM('HOMEPAGE', 'ABOUT', 'MENU', 'CONTACT', 'CUSTOM') NOT NULL DEFAULT 'CUSTOM',
    `content` TEXT NOT NULL,
    `is_published` BOOLEAN NOT NULL DEFAULT false,
    `meta_title` VARCHAR(255) NULL,
    `meta_description` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `content_pages_slug_key`(`slug`),
    INDEX `content_pages_slug_idx`(`slug`),
    INDEX `content_pages_is_published_idx`(`is_published`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `website_leads` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NULL,
    `phone` VARCHAR(50) NULL,
    `source` ENUM('LANDING_PAGE', 'CATERING_ENQUIRY', 'EVENT_BOOKING', 'RESERVATION', 'SOCIAL_MEDIA', 'REFERRAL', 'OTHER') NOT NULL,
    `status` ENUM('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST') NOT NULL DEFAULT 'NEW',
    `enquiry_type` VARCHAR(100) NULL,
    `message` TEXT NULL,
    `event_date` DATETIME(3) NULL,
    `guest_count` INTEGER NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `website_leads_source_idx`(`source`),
    INDEX `website_leads_status_idx`(`status`),
    INDEX `website_leads_created_at_idx`(`created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
