<?php
declare(strict_types=1);
namespace Controllers;
use Support\Auth;
use Support\Database;
use Support\Request;
use Support\Response;
use Support\AuditLogger;



class BarController
{
public function stock(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'BARMAN']);
$stmt = Database::connection()->query(
"SELECT
p.id,
p.product_name,
p.product_category,
si.current_quantity,
si.reorder_level
FROM stock_items si
JOIN products p ON p.id = si.product_id
WHERE p.product_category = 'ALCOHOLIC_DRINK'
ORDER BY p.product_name ASC"
);
Response::success(['bar_stock' => $stmt->fetchAll()]);
}
public function stockIssue(): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'BARMAN']);
$data = Request::body();
$db = Database::connection();
$db->beginTransaction();
$stmt = $db->prepare(
"INSERT INTO stock_movements
(product_id, movement_type, quantity, reference_number, notes, user_id)
VALUES (:product_id, 'BAR_SALE', :quantity, :reference, :notes, :user_id)"
);
$stmt->execute([
'product_id' => $data['product_id'],
'quantity' => $data['quantity'],
'reference' => $data['reference_number'] ?? null,
'notes' => $data['notes'] ?? 'Bar stock issued',
'user_id' => $user['id'],
]);
$update = $db->prepare(
'UPDATE stock_items
SET current_quantity = current_quantity - :quantity
WHERE product_id = :product_id'
);
$update->execute([
'quantity' => $data['quantity'],
'product_id' => $data['product_id'],
]);
AuditLogger::log(
(int) $user['id'],
'BAR',
'BAR_STOCK_ISSUE',
(int) $data['product_id'],
null,
$data
);
$db->commit();
Response::success([], 'Bar stock issued');
}
}
