-- Align dashboard index names with Prisma's generated PostgreSQL names.

DO $$
BEGIN
	IF to_regclass('public.idx_payments_created_at') IS NOT NULL
		 AND to_regclass('public.payments_created_at_idx') IS NULL THEN
		ALTER INDEX "idx_payments_created_at" RENAME TO "payments_created_at_idx";
	END IF;
	IF to_regclass('public.idx_payments_method') IS NOT NULL
		 AND to_regclass('public.payments_payment_method_idx') IS NULL THEN
		ALTER INDEX "idx_payments_method" RENAME TO "payments_payment_method_idx";
	END IF;
	IF to_regclass('public.idx_payments_status_date') IS NOT NULL
		 AND to_regclass('public.payments_payment_status_created_at_idx') IS NULL THEN
		ALTER INDEX "idx_payments_status_date" RENAME TO "payments_payment_status_created_at_idx";
	END IF;
	IF to_regclass('public.idx_products_active_category') IS NOT NULL
		 AND to_regclass('public.products_is_active_product_category_idx') IS NULL THEN
		ALTER INDEX "idx_products_active_category" RENAME TO "products_is_active_product_category_idx";
	END IF;
	IF to_regclass('public.idx_stock_items_quantity') IS NOT NULL
		 AND to_regclass('public.stock_items_quantity_idx') IS NULL THEN
		ALTER INDEX "idx_stock_items_quantity" RENAME TO "stock_items_quantity_idx";
	END IF;
	IF to_regclass('public.idx_stock_items_quantity_location') IS NOT NULL
		 AND to_regclass('public.stock_items_quantity_location_idx') IS NULL THEN
		ALTER INDEX "idx_stock_items_quantity_location" RENAME TO "stock_items_quantity_location_idx";
	END IF;
	IF to_regclass('public.idx_users_role') IS NOT NULL
		 AND to_regclass('public.users_role_idx') IS NULL THEN
		ALTER INDEX "idx_users_role" RENAME TO "users_role_idx";
	END IF;
	IF to_regclass('public.idx_users_role_active') IS NOT NULL
		 AND to_regclass('public.users_role_is_active_idx') IS NULL THEN
		ALTER INDEX "idx_users_role_active" RENAME TO "users_role_is_active_idx";
	END IF;
	IF to_regclass('public.idx_website_leads_status_date') IS NOT NULL
		 AND to_regclass('public.website_leads_status_created_at_idx') IS NULL THEN
		ALTER INDEX "idx_website_leads_status_date" RENAME TO "website_leads_status_created_at_idx";
	END IF;
END $$;
