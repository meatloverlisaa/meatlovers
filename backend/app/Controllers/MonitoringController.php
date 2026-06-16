<?php
declare(strict_types=1);
namespace Controllers;
use Support\Database;
use Support\Response;
class MonitoringController
{
public function overview(): void
{
$db = Database::connection();
$orders = $db->query("SELECT COUNT(*) AS count FROM orders")->fetch();
$paid = $db->query("SELECT COUNT(*) AS count FROM orders WHERE order_status = 'PAID'")->fetch();
$stock = $db->query("SELECT COUNT(*) AS count FROM stock_items WHERE current_quantity <=
reorder_level")->fetch();
Response::success([
'total_orders' => $orders['count'],
'paid_orders' => $paid['count'],
'low_stock_items' => $stock['count'],
]);
}

public function liveControl(): void
{
$db = Database::connection();
$sales = $db->query(
"SELECT COALESCE(SUM(total_amount), 0) AS total
FROM orders
WHERE order_status = 'PAID'
AND DATE(created_at) = CURDATE()"
)->fetch();
$orders = $db->query(
"SELECT COUNT(*) AS total
FROM orders
WHERE DATE(created_at) = CURDATE()"
)->fetch();
$paidOrders = $db->query(
"SELECT COUNT(*) AS total
FROM orders
WHERE order_status = 'PAID'
AND DATE(created_at) = CURDATE()"
)->fetch();
$lowStock = $db->query(
"SELECT COUNT(*) AS total
FROM stock_items
WHERE current_quantity <= reorder_level"
)->fetch();
$pendingApprovals = $db->query(
"SELECT COUNT(*) AS total
FROM approval_requests
WHERE approval_status = 'PENDING'"
)->fetch();
$pendingMpesa = $db->query(
"SELECT COUNT(*) AS total
FROM payments
WHERE payment_method = 'MPESA'
AND payment_status = 'PENDING'"
)->fetch();
$unsoldFood = $db->query(
"SELECT COUNT(*) AS total


FROM unsold_food
WHERE DATE(created_at) = CURDATE()"
)->fetch();
$kitchenQueue = $db->query(
"SELECT COUNT(*) AS total
FROM orders
WHERE order_status IN ('PENDING', 'PREPARING')"
)->fetch();
$barLowStock = $db->query(
"SELECT COUNT(*) AS total
FROM stock_items si
JOIN products p ON p.id = si.product_id
WHERE p.product_category = 'ALCOHOLIC_DRINK'
AND si.current_quantity <= si.reorder_level"
)->fetch();
$cashSettlements = $db->query(
"SELECT COUNT(*) AS total
FROM payments
WHERE payment_method = 'CASH'
AND payment_status = 'SUCCESS'
AND DATE(created_at) = CURDATE()"
)->fetch();
Response::success([
'today_sales' => (float) $sales['total'],
'today_orders' => (int) $orders['total'],
'paid_orders' => (int) $paidOrders['total'],
'low_stock_count' => (int) $lowStock['total'],
'pending_approvals_count' => (int) $pendingApprovals['total'],
'pending_mpesa_count' => (int) $pendingMpesa['total'],
'unsold_food_count' => (int) $unsoldFood['total'],
'kitchen_queue_count' => (int) $kitchenQueue['total'],
'bar_low_stock_count' => (int) $barLowStock['total'],
'cashier_settlement_count' => (int) $cashSettlements['total'],
]);
}
public function lowStockAlerts(): void
{
$stmt = Database::connection()->query(
"SELECT
p.product_name,
p.product_category,
si.current_quantity,
si.reorder_level
FROM stock_items si
JOIN products p ON p.id = si.product_id
WHERE si.current_quantity <= si.reorder_level
ORDER BY si.current_quantity ASC"
);
Response::success(['low_stock_alerts' => $stmt->fetchAll()]);
}
public function pendingApprovals(): void
{
$stmt = Database::connection()->query(
"SELECT
ar.*,
u.full_name AS requested_by_name
FROM approval_requests ar
JOIN users u ON u.id = ar.requested_by
WHERE ar.approval_status = 'PENDING'
ORDER BY ar.created_at ASC"
);
Response::success(['pending_approvals' => $stmt->fetchAll()]);
}
public function pendingMpesa(): void
{
$stmt = Database::connection()->query(
"SELECT
p.*,
o.order_number,
o.table_number,
o.total_amount
FROM payments p
JOIN orders o ON o.id = p.order_id
WHERE p.payment_method = 'MPESA'
AND p.payment_status = 'PENDING'
ORDER BY p.created_at ASC"
);


Response::success(['pending_mpesa' => $stmt->fetchAll()]);
}
public function unsoldFoodAlerts(): void
{
$stmt = Database::connection()->query(
"SELECT
uf.*,
p.product_name,
u.full_name AS declared_by_name
FROM unsold_food uf
JOIN products p ON p.id = uf.product_id
LEFT JOIN users u ON u.id = uf.declared_by
WHERE DATE(uf.created_at) = CURDATE()
ORDER BY uf.created_at DESC"
);
Response::success(['unsold_food_alerts' => $stmt->fetchAll()]);
}

}