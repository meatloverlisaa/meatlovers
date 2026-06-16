<?php
declare(strict_types=1);
namespace Controllers;
use Support\Database;
use Support\Request;
use Support\Response;
use Support\AuditLogger;
use Support\Auth;
class ProductsController
{
public function index(): void
{
$stmt = Database::connection()->query(
'SELECT * FROM products ORDER BY created_at DESC'
);
Response::success(['products' => $stmt->fetchAll()]);
}
public function store(): void
{
$data = Request::body();
$stmt = Database::connection()->prepare(
'INSERT INTO products
(product_name, product_category, selling_price, cost_price, barcode, is_active)
VALUES (:name, :category, :selling, :cost, :barcode, 1)'
);
$stmt->execute([
'name' => $data['product_name'],
'category' => $data['product_category'],
'selling' => $data['selling_price'],
'cost' => $data['cost_price'],
'barcode' => $data['barcode'] ?? null,
]);
Response::success([], 'Product created');
}



public function pricingRules(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT']);
$stmt = Database::connection()->query(
'SELECT
pr.*,
u.full_name AS created_by_name
FROM pricing_rules pr
LEFT JOIN users u ON u.id = pr.created_by
ORDER BY pr.product_category ASC'
);
Response::success(['pricing_rules' => $stmt->fetchAll()]);
}
public function createPricingRule(): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT']);
$data = Request::body();
$stmt = Database::connection()->prepare(
'INSERT INTO pricing_rules
(product_category, minimum_margin_percent, maximum_discount_percent, rule_status, notes, created_by)
VALUES (:category, :minimum_margin, :maximum_discount, :status, :notes, :created_by)'
);
$stmt->execute([
'category' => $data['product_category'],
'minimum_margin' => $data['minimum_margin_percent'],
'maximum_discount' => $data['maximum_discount_percent'],
'status' => $data['rule_status'] ?? 'ACTIVE',
'notes' => $data['notes'] ?? null,
'created_by' => $user['id'],
]);
AuditLogger::log(
(int) $user['id'],
'PRICING',
'CREATE_PRICING_RULE',
null,
null,
$data
);
Response::success([], 'Pricing rule created');
}
public function categoryDashboard(int $id): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT']);
$category = match ($id) {
1 => 'FOOD',
2 => 'SOFT_DRINK',
3 => 'ALCOHOLIC_DRINK',
default => null,
};
if (!$category) {
Response::error('Invalid category dashboard', 400);
}
$db = Database::connection();
$products = $db->prepare(
'SELECT
id,
product_name,
product_category,
selling_price,
cost_price,
is_active,
CASE
WHEN selling_price > 0 THEN ((selling_price - cost_price) / selling_price) * 100
ELSE 0
END AS margin_percent
FROM products
WHERE product_category = :category
ORDER BY product_name ASC'
);


$products->execute(['category' => $category]);
$summary = $db->prepare(
'SELECT
COUNT(*) AS product_count,
SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) AS active_count,
SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END) AS inactive_count,
AVG(CASE WHEN selling_price > 0 THEN ((selling_price - cost_price) / selling_price) * 100 ELSE 0
END) AS average_margin
FROM products
WHERE product_category = :category'
);
$summary->execute(['category' => $category]);
Response::success([
'category' => $category,
'summary' => $summary->fetch(),
'products' => $products->fetchAll(),
]);
}
public function updatePrice(int $id): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT']);
$data = Request::body();
$db = Database::connection();
$oldStmt = $db->prepare('SELECT * FROM products WHERE id = :id LIMIT 1');
$oldStmt->execute(['id' => $id]);
$old = $oldStmt->fetch();
if (!$old) {
Response::error('Product not found', 404);
}
$newSelling = $data['selling_price'] ?? $old['selling_price'];
$newCost = $data['cost_price'] ?? $old['cost_price'];
$update = $db->prepare(
'UPDATE products
SET selling_price = :selling_price,
cost_price = :cost_price
WHERE id = :id'
);
$update->execute([
'selling_price' => $newSelling,
'cost_price' => $newCost,
'id' => $id,
]);
$audit = $db->prepare(
'INSERT INTO price_change_audit
(product_id, old_selling_price, new_selling_price, old_cost_price, new_cost_price, changed_by,
change_reason)
VALUES (:product_id, :old_selling, :new_selling, :old_cost, :new_cost, :changed_by, :reason)'
);
$audit->execute([
'product_id' => $id,
'old_selling' => $old['selling_price'],
'new_selling' => $newSelling,
'old_cost' => $old['cost_price'],
'new_cost' => $newCost,
'changed_by' => $user['id'],
'reason' => $data['change_reason'] ?? null,
]);
AuditLogger::log(
(int) $user['id'],
'PRICING',
'UPDATE_PRODUCT_PRICE',
$id,
$old,
$data
);
Response::success([], 'Product price updated');
}
public function deactivateProduct(int $id): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER']);
$stmt = Database::connection()->prepare(
'UPDATE products SET is_active = 0 WHERE id = :id'


);
$stmt->execute(['id' => $id]);
AuditLogger::log(
(int) $user['id'],
'PRODUCTS',
'DEACTIVATE_PRODUCT',
$id
);
Response::success([], 'Product deactivated');
}
public function activateProduct(int $id): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER']);
$stmt = Database::connection()->prepare(
'UPDATE products SET is_active = 1 WHERE id = :id'
);
$stmt->execute(['id' => $id]);
AuditLogger::log(
(int) $user['id'],
'PRODUCTS',
'ACTIVATE_PRODUCT',
$id
);
Response::success([], 'Product activated');
}
public function priceChangeAudit(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT']);
$stmt = Database::connection()->query(
'SELECT
pca.*,
p.product_name,
u.full_name AS changed_by_name
FROM price_change_audit pca
JOIN products p ON p.id = pca.product_id
LEFT JOIN users u ON u.id = pca.changed_by
ORDER BY pca.created_at DESC'
);
Response::success(['price_change_audit' => $stmt->fetchAll()]);
}
public function marginAlerts(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT']);
$stmt = Database::connection()->query(
'SELECT
ma.*,
p.product_name
FROM margin_alerts ma
JOIN products p ON p.id = ma.product_id
ORDER BY ma.created_at DESC'
);
Response::success(['margin_alerts' => $stmt->fetchAll()]);
}
public function generateMarginAlerts(): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT']);
$db = Database::connection();
$stmt = $db->query(
'SELECT
p.id,
p.product_category,
p.selling_price,
p.cost_price,
pr.minimum_margin_percent,
CASE
WHEN p.selling_price > 0 THEN ((p.selling_price - p.cost_price) / p.selling_price) * 100
ELSE 0
END AS margin_percent
FROM products p
JOIN pricing_rules pr ON pr.product_category = p.product_category
WHERE pr.rule_status = "ACTIVE"


AND p.is_active = 1'
);
$products = $stmt->fetchAll();
$created = 0;
foreach ($products as $product) {
if ((float) $product['margin_percent'] < (float) $product['minimum_margin_percent']) {
$alert = $db->prepare(
'INSERT INTO margin_alerts
(product_id, product_category, selling_price, cost_price, margin_percent, notes)
VALUES (:product_id, :category, :selling, :cost, :margin, :notes)'
);
$alert->execute([
'product_id' => $product['id'],
'category' => $product['product_category'],
'selling' => $product['selling_price'],
'cost' => $product['cost_price'],
'margin' => $product['margin_percent'],
'notes' => 'Margin is below configured minimum',
]);
$created++;
}
}
AuditLogger::log(
(int) $user['id'],
'PRICING',
'GENERATE_MARGIN_ALERTS',
null,
null,
['alerts_created' => $created]
);
Response::success([
'alerts_created' => $created,
], 'Margin alerts generated');
}

}