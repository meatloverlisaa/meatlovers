<?php
declare(strict_types=1);
namespace Controllers;
use Support\Database;
use Support\Request;
use Support\Response;
use Support\ApprovalEnforcer;
use Support\AuditLogger;
use Support\Auth;
class InventoryController
{
public function stockSummary(): void
{
$stmt = Database::connection()->query(
'SELECT
p.id,
p.product_name,


p.product_category,
si.current_quantity,
si.reorder_level
FROM stock_items si
JOIN products p ON p.id = si.product_id
ORDER BY p.product_name ASC'
);
Response::success(['stock' => $stmt->fetchAll()]);
}
public function stockIn(): void
{
$data = Request::body();
$db = Database::connection();
$db->beginTransaction();
$stmt = $db->prepare(
'INSERT INTO stock_movements
(product_id, movement_type, quantity, reference_number, notes, user_id)
VALUES (:product_id, :movement_type, :quantity, :reference, :notes, :user_id)'
);
$stmt->execute([
'product_id' => $data['product_id'],
'movement_type' => $data['movement_type'] ?? 'PURCHASE',
'quantity' => $data['quantity'],
'reference' => $data['reference_number'] ?? null,
'notes' => $data['notes'] ?? null,
'user_id' => $data['user_id'] ?? null,
]);
$update = $db->prepare(
'UPDATE stock_items
SET current_quantity = current_quantity + :quantity
WHERE product_id = :product_id'
);
$update->execute([
'quantity' => $data['quantity'],
'product_id' => $data['product_id'],
]);
$db->commit();
Response::success([], 'Stock movement recorded');
}

public function supplierInvoices(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STOREKEEPER', 'ACCOUNTANT']);
$stmt = Database::connection()->query(
"SELECT
si.*,
s.supplier_name,
u.full_name AS created_by_name
FROM supplier_invoices si
JOIN suppliers s ON s.id = si.supplier_id
LEFT JOIN users u ON u.id = si.created_by
ORDER BY si.created_at DESC"
);
Response::success(['supplier_invoices' => $stmt->fetchAll()]);
}
public function createSupplierInvoice(): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STOREKEEPER', 'ACCOUNTANT']);
$data = Request::body();
$stmt = Database::connection()->prepare(
'INSERT INTO supplier_invoices
(supplier_id, invoice_number, invoice_date, invoice_amount, notes, created_by)
VALUES (:supplier_id, :invoice_number, :invoice_date, :invoice_amount, :notes, :created_by)'
);
$stmt->execute([
'supplier_id' => $data['supplier_id'],
'invoice_number' => $data['invoice_number'],
'invoice_date' => $data['invoice_date'],
'invoice_amount' => $data['invoice_amount'],
'notes' => $data['notes'] ?? null,
'created_by' => $user['id'],
]);
AuditLogger::log(
(int) $user['id'],
'STOREKEEPING',
'CREATE_SUPPLIER_INVOICE',
null,
null,
$data
);
Response::success([], 'Supplier invoice created');
}
public function approveSupplierInvoice(int $id): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT']);
$stmt = Database::connection()->prepare(
"UPDATE supplier_invoices SET invoice_status = 'APPROVED' WHERE id = :id"
);
$stmt->execute(['id' => $id]);
AuditLogger::log(
(int) $user['id'],
'STOREKEEPING',
'APPROVE_SUPPLIER_INVOICE',
$id
);
Response::success([], 'Supplier invoice approved');
}
public function rejectSupplierInvoice(int $id): void


{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT']);
$stmt = Database::connection()->prepare(
"UPDATE supplier_invoices SET invoice_status = 'REJECTED' WHERE id = :id"
);
$stmt->execute(['id' => $id]);
AuditLogger::log(
(int) $user['id'],
'STOREKEEPING',
'REJECT_SUPPLIER_INVOICE',
$id
);
Response::success([], 'Supplier invoice rejected');
}
public function receivingNotes(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STOREKEEPER', 'ACCOUNTANT']);
$stmt = Database::connection()->query(
"SELECT
rn.*,
s.supplier_name,
u.full_name AS received_by_name
FROM receiving_notes rn
JOIN suppliers s ON s.id = rn.supplier_id
JOIN users u ON u.id = rn.received_by
ORDER BY rn.created_at DESC"
);
Response::success(['receiving_notes' => $stmt->fetchAll()]);
}
public function createReceivingNote(): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STOREKEEPER']);
$data = Request::body();
$db = Database::connection();
$db->beginTransaction();
$stmt = $db->prepare(
'INSERT INTO receiving_notes
(supplier_id, supplier_invoice_id, received_by, received_date, receiving_status, notes)
VALUES (:supplier_id, :supplier_invoice_id, :received_by, :received_date, "DRAFT", :notes)'
);
$stmt->execute([
'supplier_id' => $data['supplier_id'],
'supplier_invoice_id' => $data['supplier_invoice_id'] ?? null,
'received_by' => $user['id'],
'received_date' => $data['received_date'],
'notes' => $data['notes'] ?? null,
]);
$receivingNoteId = (int) $db->lastInsertId();
foreach ($data['items'] as $item) {
$itemStmt = $db->prepare(
'INSERT INTO receiving_note_items
(receiving_note_id, product_id, quantity_received, unit_cost, total_cost)
VALUES (:receiving_note_id, :product_id, :quantity, :unit_cost, :total_cost)'
);
$itemStmt->execute([
'receiving_note_id' => $receivingNoteId,
'product_id' => $item['product_id'],
'quantity' => $item['quantity_received'],
'unit_cost' => $item['unit_cost'],
'total_cost' => $item['quantity_received'] * $item['unit_cost'],
]);
}
AuditLogger::log(
(int) $user['id'],
'STOREKEEPING',
'CREATE_RECEIVING_NOTE',
$receivingNoteId,
null,
$data
);
$db->commit();


Response::success(['receiving_note_id' => $receivingNoteId], 'Receiving note created');
}
public function receiveStock(int $id): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STOREKEEPER']);
$db = Database::connection();
$db->beginTransaction();
$itemsStmt = $db->prepare(
'SELECT * FROM receiving_note_items WHERE receiving_note_id = :id'
);
$itemsStmt->execute(['id' => $id]);
$items = $itemsStmt->fetchAll();
foreach ($items as $item) {
$movement = $db->prepare(
"INSERT INTO stock_movements
(product_id, movement_type, quantity, reference_number, notes, user_id)
VALUES (:product_id, 'PURCHASE', :quantity, :reference, 'Stock received from receiving note',
:user_id)"
);
$movement->execute([
'product_id' => $item['product_id'],
'quantity' => $item['quantity_received'],
'reference' => 'RN-' . $id,
'user_id' => $user['id'],
]);
$stock = $db->prepare(
'UPDATE stock_items
SET current_quantity = current_quantity + :quantity
WHERE product_id = :product_id'
);
$stock->execute([
'quantity' => $item['quantity_received'],
'product_id' => $item['product_id'],
]);
}
$update = $db->prepare(
"UPDATE receiving_notes
SET receiving_status = 'RECEIVED'
WHERE id = :id"
);
$update->execute(['id' => $id]);
AuditLogger::log(
(int) $user['id'],
'STOREKEEPING',
'RECEIVE_STOCK_FROM_NOTE',
$id
);
$db->commit();
Response::success([], 'Stock received into store');
}
public function stockTransfers(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STOREKEEPER', 'BARMAN', 'CHEF']);
$stmt = Database::connection()->query(
"SELECT
st.*,
p.product_name,
requester.full_name AS requested_by_name,
approver.full_name AS approved_by_name
FROM stock_transfers st
JOIN products p ON p.id = st.product_id
JOIN users requester ON requester.id = st.requested_by
LEFT JOIN users approver ON approver.id = st.approved_by
ORDER BY st.created_at DESC"
);
Response::success(['stock_transfers' => $stmt->fetchAll()]);
}
public function createStockTransfer(): void
{


$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STOREKEEPER']);
$data = Request::body();
$stmt = Database::connection()->prepare(
'INSERT INTO stock_transfers
(product_id, transfer_from, transfer_to, quantity, requested_by, notes)
VALUES (:product_id, :transfer_from, :transfer_to, :quantity, :requested_by, :notes)'
);
$stmt->execute([
'product_id' => $data['product_id'],
'transfer_from' => $data['transfer_from'],
'transfer_to' => $data['transfer_to'],
'quantity' => $data['quantity'],
'requested_by' => $user['id'],
'notes' => $data['notes'] ?? null,
]);
AuditLogger::log(
(int) $user['id'],
'STOREKEEPING',
'CREATE_STOCK_TRANSFER',
(int) $data['product_id'],
null,
$data
);
Response::success([], 'Stock transfer requested');
}
public function approveStockTransfer(int $id): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER']);
$db = Database::connection();
$db->beginTransaction();
$stmt = $db->prepare('SELECT * FROM stock_transfers WHERE id = :id LIMIT 1');
$stmt->execute(['id' => $id]);
$transfer = $stmt->fetch();
if (!$transfer) {
Response::error('Stock transfer not found', 404);
}
$movementType = $transfer['transfer_to'] === 'BAR'
? 'STORE_TO_BAR'
: 'STORE_TO_KITCHEN';
$movement = $db->prepare(
'INSERT INTO stock_movements
(product_id, movement_type, quantity, reference_number, notes, user_id)
VALUES (:product_id, :movement_type, :quantity, :reference, :notes, :user_id)'
);
$movement->execute([
'product_id' => $transfer['product_id'],
'movement_type' => $movementType,
'quantity' => $transfer['quantity'],
'reference' => 'ST-' . $id,
'notes' => 'Approved stock transfer from ' . $transfer['transfer_from'] . ' to ' .
$transfer['transfer_to'],
'user_id' => $user['id'],
]);
$update = $db->prepare(
"UPDATE stock_transfers
SET transfer_status = 'COMPLETED',
approved_by = :approved_by,
approved_at = NOW()
WHERE id = :id"
);
$update->execute([
'approved_by' => $user['id'],
'id' => $id,
]);
AuditLogger::log(
(int) $user['id'],
'STOREKEEPING',
'APPROVE_STOCK_TRANSFER',
$id,
null,
$transfer
);


$db->commit();
Response::success([], 'Stock transfer approved and completed');
}
public function stockMovementReport(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STOREKEEPER', 'ACCOUNTANT']);
$stmt = Database::connection()->query(
"SELECT
sm.*,
p.product_name,
p.product_category,
u.full_name AS user_name
FROM stock_movements sm
JOIN products p ON p.id = sm.product_id
LEFT JOIN users u ON u.id = sm.user_id
ORDER BY sm.created_at DESC"
);
Response::success(['stock_movement_report' => $stmt->fetchAll()]);
}
public function supplierPerformanceReport(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'STOREKEEPER', 'ACCOUNTANT']);
$stmt = Database::connection()->query(
"SELECT
s.id AS supplier_id,
s.supplier_name,
s.supplier_type,
COUNT(DISTINCT si.id) AS invoice_count,
COALESCE(SUM(si.invoice_amount), 0) AS total_invoice_amount,
COUNT(DISTINCT rn.id) AS receiving_note_count
FROM suppliers s
LEFT JOIN supplier_invoices si ON si.supplier_id = s.id
LEFT JOIN receiving_notes rn ON rn.supplier_id = s.id
GROUP BY s.id, s.supplier_name, s.supplier_type
ORDER BY total_invoice_amount DESC"
);
Response::success(['supplier_performance_report' => $stmt->fetchAll()]);
}

public function requestStockAdjustment(): void
{
$user = Auth::requireRole([
'SUPER_ADMIN',
'ADMIN',
'MANAGER',
'STOREKEEPER'
]);
$data = Request::body();
$approvalId = ApprovalEnforcer::createRequest(
(int) $user['id'],
'STOCK_ADJUSTMENT',
(int) $data['product_id'],
$data['reason'] ?? 'Stock adjustment requested',
$data
);
AuditLogger::log(
(int) $user['id'],
'INVENTORY',
'REQUEST_STOCK_ADJUSTMENT',
(int) $data['product_id'],
null,
$data
);
Response::success([
'approval_id' => $approvalId,
], 'Stock adjustment request submitted for approval');
}
$user = Auth::requireRole([
'SUPER_ADMIN',
'ADMIN',
'MANAGER',
'STOREKEEPER'
]);
AuditLogger::log(
(int) $user['id'],
'INVENTORY',
'STOCK_IN',
(int) $data['product_id'],
null,
$data
);

}