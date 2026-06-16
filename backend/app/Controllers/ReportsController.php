<?php
declare(strict_types=1);
namespace Controllers;
use Support\Database;
use Support\Response;
class ReportsController
{
public function daily(): void
{
$stmt = Database::connection()->query(
"SELECT
p.product_category,
SUM(oi.total_price) AS total_sales
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN orders o ON o.id = oi.order_id
WHERE DATE(o.created_at) = CURDATE()
GROUP BY p.product_category"
);
Response::success(['daily_sales' => $stmt->fetchAll()]);
}
}
