<?php
declare(strict_types=1);
namespace Controllers;
use Support\Auth;
use Support\Database;
use Support\Request;
use Support\Response;
use Support\AuditLogger;
class ApprovalsController
{
public function index(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER']);
$stmt = Database::connection()->query(
'SELECT ar.*, u.full_name AS requested_by_name
FROM approval_requests ar
JOIN users u ON u.id = ar.requested_by


ORDER BY ar.created_at DESC'
);
Response::success(['approvals' => $stmt->fetchAll()]);
}
public function approve(int $id): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER']);
$data = Request::body();
$stmt = Database::connection()->prepare(
'UPDATE approval_requests
SET approval_status = "APPROVED",
approved_by = :approved_by,
approval_notes = :notes,
approved_at = NOW()
WHERE id = :id'
);
$stmt->execute([
'approved_by' => $user['id'],
'notes' => $data['approval_notes'] ?? null,
'id' => $id,
]);
AuditLogger::log(
(int) $user['id'],
'APPROVALS',
'APPROVE_REQUEST',
$id,
null,
$data
);
Response::success([], 'Approval request approved');
}
public function reject(int $id): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER']);
$data = Request::body();
$stmt = Database::connection()->prepare(
'UPDATE approval_requests
SET approval_status = "REJECTED",
approved_by = :approved_by,
approval_notes = :notes,
approved_at = NOW()
WHERE id = :id'
);
$stmt->execute([
'approved_by' => $user['id'],
'notes' => $data['approval_notes'] ?? null,
'id' => $id,
]);
AuditLogger::log(
(int) $user['id'],
'APPROVALS',
'REJECT_REQUEST',
$id,
null,
$data
);
Response::success([], 'Approval request rejected');
}

public function history(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER']);
$stmt = Database::connection()->query(
'SELECT
ar.*,
requester.full_name AS requested_by_name,
approver.full_name AS approved_by_name
FROM approval_requests ar
JOIN users requester ON requester.id = ar.requested_by
LEFT JOIN users approver ON approver.id = ar.approved_by
ORDER BY ar.created_at DESC'
);
Response::success(['approval_history' => $stmt->fetchAll()]);
}
public function apply(int $id): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER']);
$db = Database::connection();
$stmt = $db->prepare(
'SELECT * FROM approval_requests WHERE id = :id LIMIT 1'
);
$stmt->execute(['id' => $id]);
$approval = $stmt->fetch();
if (!$approval) {
Response::error('Approval request not found', 404);
}
if ($approval['approval_status'] !== 'APPROVED') {
Response::error('Only approved requests can be applied', 403);
}
$requestData = json_decode($approval['request_data'] ?? '{}', true) ?: [];
if ($approval['approval_type'] === 'ORDER_CANCELLATION') {
$this->applyOrderCancellation((int) $approval['reference_id']);
}
if ($approval['approval_type'] === 'DISCOUNT') {
$this->applyDiscount((int) $approval['reference_id'], $requestData);
}



if ($approval['approval_type'] === 'STOCK_ADJUSTMENT') {
$this->applyStockAdjustment((int) $approval['reference_id'], $requestData, (int) $user['id']);
}
if ($approval['approval_type'] === 'REFUND') {
Response::error('Refund execution is a placeholder and must be wired in the payment refund phase',
501);
}
AuditLogger::log(
(int) $user['id'],
'APPROVALS',
'APPLY_APPROVED_REQUEST',
$id,
null,
$approval
);
Response::success([], 'Approved request applied successfully');
}
private function applyOrderCancellation(int $orderId): void
{
$stmt = Database::connection()->prepare(
"UPDATE orders
SET order_status = 'CANCELLED'
WHERE id = :id"
);
$stmt->execute(['id' => $orderId]);
}
private function applyDiscount(int $orderId, array $requestData): void
{
$discount = (float) ($requestData['discount_amount'] ?? 0);
$stmt = Database::connection()->prepare(
'UPDATE orders
SET discount_amount = :discount,
total_amount = GREATEST(subtotal - :discount, 0)
WHERE id = :id'
);
$stmt->execute([
'discount' => $discount,
'id' => $orderId,
]);
}
private function applyStockAdjustment(int $productId, array $requestData, int $userId): void
{
$quantity = (float) ($requestData['quantity'] ?? 0);
$stmt = Database::connection()->prepare(
"INSERT INTO stock_movements
(product_id, movement_type, quantity, reference_number, notes, user_id)
VALUES (:product_id, 'ADJUSTMENT', :quantity, :reference_number, :notes, :user_id)"
);
$stmt->execute([
'product_id' => $productId,
'quantity' => $quantity,
'reference_number' => $requestData['reference_number'] ?? 'APPROVED-STOCK-ADJUSTMENT',
'notes' => $requestData['reason'] ?? 'Approved stock adjustment',
'user_id' => $userId,
]);
$update = Database::connection()->prepare(
'UPDATE stock_items
SET current_quantity = current_quantity + :quantity
WHERE product_id = :product_id'
);
$update->execute([
'quantity' => $quantity,
'product_id' => $productId,
]);
}

}