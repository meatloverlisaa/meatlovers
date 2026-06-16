<?php
declare(strict_types=1);
namespace Controllers;
use Support\Auth;
use Support\Database;
use Support\Request;
use Support\Response;
use Support\AuditLogger;
class DispatchController
{
public function orders(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DISPATCHER']);
$stmt = Database::connection()->query(
"SELECT
d.*,
o.order_number,
c.full_name AS customer_name
FROM deliveries d
JOIN orders o ON o.id = d.order_id
JOIN customers c ON c.id = d.customer_id
ORDER BY d.created_at DESC"
);
Response::success(['deliveries' => $stmt->fetchAll()]);
}
public function dispatch(int $orderId): void
{


$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DISPATCHER']);
$data = Request::body();
$stmt = Database::connection()->prepare(
"UPDATE deliveries
SET delivery_status = 'DISPATCHED',
rider_name = :rider_name,
rider_phone = :rider_phone
WHERE order_id = :order_id"
);
$stmt->execute([
'order_id' => $orderId,
'rider_name' => $data['rider_name'] ?? null,
'rider_phone' => $data['rider_phone'] ?? null,
]);
AuditLogger::log(
(int) $user['id'],
'DISPATCH',
'DISPATCH_ORDER',
$orderId,
null,
$data
);
Response::success([], 'Order dispatched');
}
public function deliver(int $orderId): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DISPATCHER']);
$stmt = Database::connection()->prepare(
"UPDATE deliveries
SET delivery_status = 'DELIVERED'
WHERE order_id = :order_id"
);
$stmt->execute(['order_id' => $orderId]);
AuditLogger::log(
(int) $user['id'],
'DISPATCH',
'MARK_DELIVERED',
$orderId
);
Response::success([], 'Order marked as delivered');
}

public function createDeliveryOrder(): void
{
$user = Auth::requireRole([
'SUPER_ADMIN',
'ADMIN',
'MANAGER',
'DISPATCHER',
'CASHIER'
]);
$data = Request::body();
$db = Database::connection();
$stmt = $db->prepare(
'INSERT INTO deliveries
(order_id, customer_id, delivery_status, rider_name, rider_phone, delivery_address,
delivery_fee, assigned_by, delivery_notes)
VALUES
(:order_id, :customer_id, "PENDING", :rider_name, :rider_phone, :address,
:fee, :assigned_by, :notes)'
);
$stmt->execute([
'order_id' => $data['order_id'],
'customer_id' => $data['customer_id'],
'rider_name' => $data['rider_name'] ?? null,
'rider_phone' => $data['rider_phone'] ?? null,
'address' => $data['delivery_address'],
'fee' => $data['delivery_fee'] ?? 0,
'assigned_by' => $user['id'],
'notes' => $data['delivery_notes'] ?? null,
]);
$deliveryId = (int) $db->lastInsertId();
if ((float) ($data['delivery_fee'] ?? 0) > 0) {
$finance = $db->prepare(
'INSERT INTO finance_transactions
(transaction_type, category, amount, reference_number, notes, created_by)
VALUES ("INCOME", "Delivery Income", :amount, :reference, :notes, :created_by)'
);
$finance->execute([
'amount' => $data['delivery_fee'],
'reference' => 'DELIVERY-FEE-' . $deliveryId,
'notes' => 'Delivery fee recorded from delivery order',
'created_by' => $user['id'],
]);
}
AuditLogger::log(
(int) $user['id'],
'DELIVERIES',
'CREATE_DELIVERY_ORDER',
$deliveryId,
null,
$data
);
Response::success([
'delivery_id' => $deliveryId,
], 'Delivery order created');
}
public function riders(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DISPATCHER']);


$stmt = Database::connection()->query(
'SELECT * FROM riders ORDER BY rider_name ASC'
);
Response::success(['riders' => $stmt->fetchAll()]);
}
public function storeRider(): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DISPATCHER']);
$data = Request::body();
$stmt = Database::connection()->prepare(
'INSERT INTO riders
(rider_name, rider_phone, rider_status, notes)
VALUES (:name, :phone, :status, :notes)'
);
$stmt->execute([
'name' => $data['rider_name'],
'phone' => $data['rider_phone'],
'status' => $data['rider_status'] ?? 'ACTIVE',
'notes' => $data['notes'] ?? null,
]);
AuditLogger::log(
(int) $user['id'],
'DELIVERIES',
'CREATE_RIDER',
null,
null,
$data
);
Response::success([], 'Rider created');
}
public function assignRider(int $orderId): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DISPATCHER']);
$data = Request::body();
$stmt = Database::connection()->prepare(
"UPDATE deliveries
SET rider_name = :rider_name,
rider_phone = :rider_phone,
assigned_by = :assigned_by,
delivery_status = 'PENDING'
WHERE order_id = :order_id"
);
$stmt->execute([
'rider_name' => $data['rider_name'],
'rider_phone' => $data['rider_phone'],
'assigned_by' => $user['id'],
'order_id' => $orderId,
]);
AuditLogger::log(
(int) $user['id'],
'DELIVERIES',
'ASSIGN_RIDER',
$orderId,
null,
$data
);
Response::success([], 'Rider assigned');
}
Replace the existing dispatch() method with:
public function dispatch(int $orderId): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DISPATCHER']);
$data = Request::body();
$stmt = Database::connection()->prepare(
"UPDATE deliveries
SET delivery_status = 'DISPATCHED',
rider_name = COALESCE(:rider_name, rider_name),
rider_phone = COALESCE(:rider_phone, rider_phone),
dispatched_at = NOW(),
assigned_by = :assigned_by
WHERE order_id = :order_id"
);


$stmt->execute([
'order_id' => $orderId,
'rider_name' => $data['rider_name'] ?? null,
'rider_phone' => $data['rider_phone'] ?? null,
'assigned_by' => $user['id'],
]);
AuditLogger::log(
(int) $user['id'],
'DISPATCH',
'DISPATCH_ORDER',
$orderId,
null,
$data
);
Response::success([], 'Order dispatched');
}
Replace the existing deliver() method with:
public function deliver(int $orderId): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DISPATCHER']);
$stmt = Database::connection()->prepare(
"UPDATE deliveries
SET delivery_status = 'DELIVERED',
delivered_at = NOW()
WHERE order_id = :order_id"
);
$stmt->execute(['order_id' => $orderId]);
AuditLogger::log(
(int) $user['id'],
'DISPATCH',
'MARK_DELIVERED',
$orderId
);
Response::success([], 'Order marked as delivered');
}
Add:
public function failDelivery(int $orderId): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DISPATCHER']);
$data = Request::body();
$stmt = Database::connection()->prepare(
"UPDATE deliveries
SET delivery_status = 'FAILED',
failed_at = NOW(),
failed_reason = :reason
WHERE order_id = :order_id"
);
$stmt->execute([
'order_id' => $orderId,
'reason' => $data['failed_reason'] ?? 'No reason provided',
]);
AuditLogger::log(
(int) $user['id'],
'DISPATCH',
'MARK_DELIVERY_FAILED',
$orderId,
null,
$data
);
Response::success([], 'Delivery marked as failed');
}
public function performanceReport(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'DISPATCHER']);
$stmt = Database::connection()->query(
"SELECT
rider_name,
rider_phone,
COUNT(*) AS total_deliveries,
SUM(CASE WHEN delivery_status = 'DELIVERED' THEN 1 ELSE 0 END) AS delivered_count,
SUM(CASE WHEN delivery_status = 'FAILED' THEN 1 ELSE 0 END) AS failed_count,


COALESCE(SUM(delivery_fee), 0) AS delivery_fee_total
FROM deliveries
GROUP BY rider_name, rider_phone
ORDER BY delivered_count DESC, failed_count ASC"
);
Response::success(['delivery_performance' => $stmt->fetchAll()]);
}

}