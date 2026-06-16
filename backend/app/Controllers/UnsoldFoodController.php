<?php
declare(strict_types=1);
namespace Controllers;
use Support\Auth;
use Support\Database;
use Support\Request;
use Support\Response;
use Support\AuditLogger;
class UnsoldFoodController
{
public function index(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CHEF']);
$stmt = Database::connection()->query(
"SELECT
uf.*,
p.product_name,
u.full_name AS declared_by_name
FROM unsold_food uf
JOIN products p ON p.id = uf.product_id
LEFT JOIN users u ON u.id = uf.declared_by
ORDER BY uf.created_at DESC"
);


Response::success(['unsold_food' => $stmt->fetchAll()]);
}
public function store(): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CHEF']);
$data = Request::body();
$stmt = Database::connection()->prepare(
'INSERT INTO unsold_food
(product_id, quantity, reason, declared_by)
VALUES (:product_id, :quantity, :reason, :declared_by)'
);
$stmt->execute([
'product_id' => $data['product_id'],
'quantity' => $data['quantity'],
'reason' => $data['reason'] ?? null,
'declared_by' => $user['id'],
]);
AuditLogger::log(
(int) $user['id'],
'UNSOLD_FOOD',
'DECLARE_UNSOLD_FOOD',
(int) $data['product_id'],
null,
$data
);
Response::success([], 'Unsold food declared');
}
}
