<?php
declare(strict_types=1);
namespace Controllers;
use Support\Auth;
use Support\Database;
use Support\Response;


use Support\AuditLogger;
class KitchenController
{
public function orders(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CHEF']);
$stmt = Database::connection()->query(
"SELECT
o.id,
o.order_number,
o.table_number,
o.order_status,
o.created_at
FROM orders o
WHERE o.order_status IN ('PENDING', 'PREPARING')
ORDER BY o.created_at ASC"
);
Response::success(['kitchen_orders' => $stmt->fetchAll()]);
}
public function markReady(int $orderId): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CHEF']);
$stmt = Database::connection()->prepare(
"UPDATE orders
SET order_status = 'READY'
WHERE id = :id"
);
$stmt->execute(['id' => $orderId]);
AuditLogger::log(
(int) $user['id'],
'KITCHEN',
'MARK_ORDER_READY',
$orderId
);
Response::success([], 'Order marked as ready');
}

public function markPreparing(int $orderId): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CHEF']);
$stmt = Database::connection()->prepare(
"UPDATE orders
SET order_status = 'PREPARING'
WHERE id = :id"


);
$stmt->execute(['id' => $orderId]);
AuditLogger::log(
(int) $user['id'],
'KITCHEN',
'MARK_ORDER_PREPARING',
$orderId
);
Response::success([], 'Order marked as preparing');
}

public function recipes(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CHEF']);
$stmt = Database::connection()->query(
"SELECT
r.*,
p.product_name AS menu_product_name
FROM recipes r
JOIN products p ON p.id = r.menu_product_id
ORDER BY r.created_at DESC"
);
Response::success(['recipes' => $stmt->fetchAll()]);
}
public function createRecipe(): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CHEF']);
$data = Request::body();
$db = Database::connection();
$db->beginTransaction();
$stmt = $db->prepare(
'INSERT INTO recipes
(menu_product_id, recipe_name, serving_size, is_active)
VALUES (:menu_product_id, :recipe_name, :serving_size, 1)'
);
$stmt->execute([
'menu_product_id' => $data['menu_product_id'],
'recipe_name' => $data['recipe_name'],
'serving_size' => $data['serving_size'] ?? 1,
]);
$recipeId = (int) $db->lastInsertId();
foreach ($data['items'] as $item) {
$itemStmt = $db->prepare(
'INSERT INTO recipe_items
(recipe_id, ingredient_product_id, quantity_required, unit_cost)
VALUES (:recipe_id, :ingredient_product_id, :quantity_required, :unit_cost)'
);
$itemStmt->execute([
'recipe_id' => $recipeId,
'ingredient_product_id' => $item['ingredient_product_id'],
'quantity_required' => $item['quantity_required'],
'unit_cost' => $item['unit_cost'] ?? 0,
]);
}
AuditLogger::log(
(int) $user['id'],
'PRODUCTION',
'CREATE_RECIPE',
$recipeId,
null,
$data
);
$db->commit();
Response::success(['recipe_id' => $recipeId], 'Recipe created');
}
public function productionPlans(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CHEF']);
$stmt = Database::connection()->query(
"SELECT
kpp.*,
p.product_name,
u.full_name AS created_by_name
FROM kitchen_production_plans kpp
JOIN products p ON p.id = kpp.menu_product_id


LEFT JOIN users u ON u.id = kpp.created_by
ORDER BY kpp.production_date DESC"
);
Response::success(['production_plans' => $stmt->fetchAll()]);
}
public function createProductionPlan(): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CHEF']);
$data = Request::body();
$stmt = Database::connection()->prepare(
'INSERT INTO kitchen_production_plans
(production_date, menu_product_id, planned_quantity, created_by)
VALUES (:production_date, :menu_product_id, :planned_quantity, :created_by)'
);
$stmt->execute([
'production_date' => $data['production_date'],
'menu_product_id' => $data['menu_product_id'],
'planned_quantity' => $data['planned_quantity'],
'created_by' => $user['id'],
]);
AuditLogger::log(
(int) $user['id'],
'PRODUCTION',
'CREATE_PRODUCTION_PLAN',
null,
null,
$data
);
Response::success([], 'Production plan created');
}
public function startProductionPlan(int $id): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CHEF']);
$stmt = Database::connection()->prepare(
"UPDATE kitchen_production_plans
SET production_status = 'IN_PROGRESS'
WHERE id = :id"
);
$stmt->execute(['id' => $id]);
AuditLogger::log((int) $user['id'], 'PRODUCTION', 'START_PRODUCTION_PLAN', $id);
Response::success([], 'Production plan started');
}
public function completeProductionPlan(int $id): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CHEF']);
$data = Request::body();
$stmt = Database::connection()->prepare(
"UPDATE kitchen_production_plans
SET production_status = 'COMPLETED',
produced_quantity = :produced_quantity
WHERE id = :id"
);
$stmt->execute([
'produced_quantity' => $data['produced_quantity'],
'id' => $id,
]);
AuditLogger::log(
(int) $user['id'],
'PRODUCTION',
'COMPLETE_PRODUCTION_PLAN',
$id,
null,
$data
);
Response::success([], 'Production plan completed');
}
public function recordIngredientConsumption(): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CHEF']);
$data = Request::body();


$db = Database::connection();
$db->beginTransaction();
$stmt = $db->prepare(
'INSERT INTO ingredient_consumption
(production_plan_id, order_id, product_id, consumed_quantity, consumption_source, consumed_by)
VALUES (:production_plan_id, :order_id, :product_id, :consumed_quantity, :source, :consumed_by)'
);
$stmt->execute([
'production_plan_id' => $data['production_plan_id'] ?? null,
'order_id' => $data['order_id'] ?? null,
'product_id' => $data['product_id'],
'consumed_quantity' => $data['consumed_quantity'],
'source' => $data['consumption_source'],
'consumed_by' => $user['id'],
]);
$stock = $db->prepare(
'UPDATE stock_items
SET current_quantity = current_quantity - :quantity
WHERE product_id = :product_id'
);
$stock->execute([
'quantity' => $data['consumed_quantity'],
'product_id' => $data['product_id'],
]);
AuditLogger::log(
(int) $user['id'],
'PRODUCTION',
'RECORD_INGREDIENT_CONSUMPTION',
(int) $data['product_id'],
null,
$data
);
$db->commit();
Response::success([], 'Ingredient consumption recorded');
}
public function recordWastage(): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CHEF']);
$data = Request::body();
$db = Database::connection();
$db->beginTransaction();
$stmt = $db->prepare(
'INSERT INTO food_wastage
(product_id, production_plan_id, wasted_quantity, estimated_cost, wastage_reason, declared_by)
VALUES (:product_id, :production_plan_id, :wasted_quantity, :estimated_cost, :reason, :declared_by)'
);
$stmt->execute([
'product_id' => $data['product_id'],
'production_plan_id' => $data['production_plan_id'] ?? null,
'wasted_quantity' => $data['wasted_quantity'],
'estimated_cost' => $data['estimated_cost'] ?? 0,
'reason' => $data['wastage_reason'] ?? null,
'declared_by' => $user['id'],
]);
$stock = $db->prepare(
'UPDATE stock_items
SET current_quantity = current_quantity - :quantity
WHERE product_id = :product_id'
);
$stock->execute([
'quantity' => $data['wasted_quantity'],
'product_id' => $data['product_id'],
]);
AuditLogger::log(
(int) $user['id'],
'PRODUCTION',
'RECORD_WASTAGE',
(int) $data['product_id'],
null,
$data
);


$db->commit();
Response::success([], 'Food wastage recorded');
}
public function foodCostReport(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CHEF', 'ACCOUNTANT']);
$stmt = Database::connection()->query(
"SELECT
r.id AS recipe_id,
r.recipe_name,
p.product_name AS menu_item,
p.selling_price,
COALESCE(SUM(ri.quantity_required * ri.unit_cost), 0) AS food_cost_per_plate,
p.selling_price - COALESCE(SUM(ri.quantity_required * ri.unit_cost), 0) AS gross_margin_per_plate
FROM recipes r
JOIN products p ON p.id = r.menu_product_id
LEFT JOIN recipe_items ri ON ri.recipe_id = r.id
GROUP BY r.id, r.recipe_name, p.product_name, p.selling_price
ORDER BY gross_margin_per_plate DESC"
);
Response::success(['food_cost_report' => $stmt->fetchAll()]);
}
public function menuEngineeringReport(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CHEF', 'ACCOUNTANT']);
$stmt = Database::connection()->query(
"SELECT
p.id AS product_id,
p.product_name,
p.product_category,
p.selling_price,
p.cost_price,
COALESCE(SUM(oi.quantity), 0) AS quantity_sold,
COALESCE(SUM(oi.total_price), 0) AS sales_value,
COALESCE(SUM(oi.quantity * p.cost_price), 0) AS estimated_cost,
COALESCE(SUM(oi.total_price), 0) - COALESCE(SUM(oi.quantity * p.cost_price), 0) AS gross_profit
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
LEFT JOIN orders o ON o.id = oi.order_id AND o.order_status = 'PAID'
WHERE p.product_category = 'FOOD'
GROUP BY p.id, p.product_name, p.product_category, p.selling_price, p.cost_price
ORDER BY gross_profit DESC, quantity_sold DESC"
);
Response::success(['menu_engineering_report' => $stmt->fetchAll()]);
}

}