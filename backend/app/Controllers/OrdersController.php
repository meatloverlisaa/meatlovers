<?php
declare(strict_types=1);
namespace Controllers;
use Support\Database;
use Support\Request;
use Support\Response;
use Support\ApprovalEnforcer;
use Support\AuditLogger;
use Support\Auth;
class OrdersController
{
public function index(): void
{
$stmt = Database::connection()->query(
'SELECT * FROM orders ORDER BY created_at DESC'
);
Response::success(['orders' => $stmt->fetchAll()]);
}
public function store(): void
{
$data = Request::body();
$db = Database::connection();
$db->beginTransaction();
$orderNumber = 'ML-' . time();


$stmt = $db->prepare(
'INSERT INTO orders
(order_number, customer_id, waiter_id, table_number, subtotal, discount_amount, total_amount)
VALUES (:order_number, :customer_id, :waiter_id, :table_number, :subtotal, :discount, :total)'
);
$stmt->execute([
'order_number' => $orderNumber,
'customer_id' => $data['customer_id'] ?? null,
'waiter_id' => $data['waiter_id'],
'table_number' => $data['table_number'],
'subtotal' => $data['subtotal'],
'discount' => $data['discount_amount'] ?? 0,
'total' => $data['total_amount'],
]);
$orderId = (int) $db->lastInsertId();
foreach ($data['items'] as $item) {
$itemStmt = $db->prepare(
'INSERT INTO order_items
(order_id, product_id, quantity, unit_price, total_price)
VALUES (:order_id, :product_id, :quantity, :unit_price, :total_price)'
);
$itemStmt->execute([
'order_id' => $orderId,
'product_id' => $item['product_id'],
'quantity' => $item['quantity'],
'unit_price' => $item['unit_price'],
'total_price' => $item['total_price'],
]);
}
$db->commit();
Response::success([
'order_id' => $orderId,
'order_number' => $orderNumber,
], 'Order created');
}

Inside store(), after order items are inserted and before $db->commit();, add:
$printTypes = ['KITCHEN'];
foreach ($data['items'] as $item) {
$categoryStmt = $db->prepare(
'SELECT product_category FROM products WHERE id = :id LIMIT 1'
);
$categoryStmt->execute(['id' => $item['product_id']]);
$product = $categoryStmt->fetch();
if ($product && $product['product_category'] === 'ALCOHOLIC_DRINK') {
$printTypes[] = 'BAR';
}
}
foreach (array_unique($printTypes) as $printType) {
$printStmt = $db->prepare(
'INSERT INTO print_queue
(order_id, print_type, print_status)
VALUES (:order_id, :print_type, "PENDING")'
);
$printStmt->execute([
'order_id' => $orderId,
'print_type' => $printType,
]);
}



public function requestCancellation(int $orderId): void
{
$user = Auth::requireRole([
'SUPER_ADMIN',
'ADMIN',
'MANAGER',
'WAITER',
'CASHIER'
]);
$data = Request::body();
$approvalId = ApprovalEnforcer::createRequest(
(int) $user['id'],
'ORDER_CANCELLATION',
$orderId,
$data['reason'] ?? 'Order cancellation requested',
$data
);
AuditLogger::log(
(int) $user['id'],
'ORDERS',
'REQUEST_ORDER_CANCELLATION',
$orderId,
null,
$data
);
Response::success([
'approval_id' => $approvalId,
], 'Order cancellation request submitted for approval');
}
public function requestDiscount(int $orderId): void
{
$user = Auth::requireRole([
'SUPER_ADMIN',
'ADMIN',
'MANAGER',
'WAITER',
'CASHIER'
]);
$data = Request::body();
$approvalId = ApprovalEnforcer::createRequest(
(int) $user['id'],
'DISCOUNT',
$orderId,
$data['reason'] ?? 'Discount requested',
$data
);
AuditLogger::log(
(int) $user['id'],
'ORDERS',
'REQUEST_DISCOUNT',
$orderId,
null,
$data
);
Response::success([
'approval_id' => $approvalId,
], 'Discount request submitted for approval');
}
$user = Auth::requireRole([
'SUPER_ADMIN',
'ADMIN',
'MANAGER',
'WAITER',
'CASHIER'
]);
AuditLogger::log(
(int) $user['id'],
'ORDERS',
'CREATE_ORDER',
$orderId,


null,
$data
);

}