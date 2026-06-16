<?php
declare(strict_types=1);
namespace Controllers;
use Support\Database;
use Support\Request;
use Support\Response;
use Support\AuditLogger;
use Support\Auth;
class PaymentsController
{
public function cashSettle(int $orderId): void
{
$data = Request::body();
$db = Database::connection();
$stmt = $db->prepare(
'INSERT INTO payments
(order_id, payment_method, amount, transaction_reference, payment_status)
VALUES (:order_id, :method, :amount, :reference, :status)'
);
$stmt->execute([
'order_id' => $orderId,
'method' => 'CASH',
'amount' => $data['amount'],
'reference' => 'CASH-' . $orderId . '-' . time(),
'status' => 'SUCCESS',
]);
$update = $db->prepare(
"UPDATE orders SET order_status = 'PAID' WHERE id = :id"
);
$update->execute(['id' => $orderId]);


Response::success([], 'Cash payment settled');
}

public function mpesaPending(int $orderId): void
{
$user = Auth::requireRole([
'SUPER_ADMIN',
'ADMIN',
'MANAGER',
'CASHIER'


]);
$data = Request::body();
$db = Database::connection();
$stmt = $db->prepare(
'INSERT INTO payments
(order_id, payment_method, amount, transaction_reference, payment_status)
VALUES (:order_id, :method, :amount, :reference, :status)'
);
$stmt->execute([
'order_id' => $orderId,
'method' => 'MPESA',
'amount' => $data['amount'] ?? 0,
'reference' => 'MPESA-PENDING-' . $orderId . '-' . time(),
'status' => 'PENDING',
]);
AuditLogger::log(
(int) $user['id'],
'PAYMENTS',
'MPESA_PENDING',
$orderId,
null,
$data
);
Response::success([], 'M-Pesa payment marked as pending');
}
public function receipt(int $orderId): void
{
Auth::requireRole([
'SUPER_ADMIN',
'ADMIN',
'MANAGER',
'CASHIER',
'WAITER'
]);
$db = Database::connection();
$orderStmt = $db->prepare('SELECT * FROM orders WHERE id = :id LIMIT 1');
$orderStmt->execute(['id' => $orderId]);
$order = $orderStmt->fetch();
if (!$order) {
Response::error('Order not found', 404);
}
$itemsStmt = $db->prepare(
'SELECT
oi.*,
p.product_name
FROM order_items oi
JOIN products p ON p.id = oi.product_id
WHERE oi.order_id = :order_id'
);
$itemsStmt->execute(['order_id' => $orderId]);
$paymentsStmt = $db->prepare(
'SELECT * FROM payments WHERE order_id = :order_id ORDER BY created_at DESC'
);
$paymentsStmt->execute(['order_id' => $orderId]);
Response::success([
'order' => $order,
'items' => $itemsStmt->fetchAll(),
'payments' => $paymentsStmt->fetchAll(),
]);
}
public function printQueue(): void
{
Auth::requireRole([
'SUPER_ADMIN',
'ADMIN',
'MANAGER',
'CASHIER'
]);
$stmt = Database::connection()->query(
'SELECT
pq.*,


o.order_number
FROM print_queue pq
JOIN orders o ON o.id = pq.order_id
ORDER BY pq.created_at DESC'
);
Response::success(['print_queue' => $stmt->fetchAll()]);
}
public function audit(): void
{
Auth::requireRole([
'SUPER_ADMIN',
'ADMIN',
'MANAGER',
'CASHIER',
'ACCOUNTANT'
]);
$stmt = Database::connection()->query(
"SELECT
al.*,
u.full_name
FROM audit_logs al
LEFT JOIN users u ON u.id = al.user_id
WHERE al.module_name = 'PAYMENTS'
ORDER BY al.created_at DESC"
);
Response::success(['payment_audit' => $stmt->fetchAll()]);
}

Inside cashSettle(), before final response, add:
$printStmt = $db->prepare(
'INSERT INTO print_queue
(order_id, print_type, print_status)
VALUES (:order_id, "CUSTOMER_RECEIPT", "PENDING")'
);
$printStmt->execute([
'order_id' => $orderId,
]);


$user = Auth::requireRole([
'SUPER_ADMIN',
'ADMIN',
'MANAGER',
'CASHIER'
]);
AuditLogger::log(
(int) $user['id'],
'PAYMENTS',
'CASH_SETTLEMENT',
$orderId,
null,
$data
);

}