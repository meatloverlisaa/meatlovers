<?php
declare(strict_types=1);
namespace Controllers;
use Support\Auth;
use Support\Database;
use Support\Request;
use Support\Response;
use Support\AuditLogger;
class StaffPerformanceController
{
public function index(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'HR']);
$stmt = Database::connection()->query(
"SELECT
sp.*,
u.full_name AS staff_name,
u.role
FROM staff_performance sp
JOIN users u ON u.id = sp.staff_id
ORDER BY sp.report_date DESC"
);
Response::success(['staff_performance' => $stmt->fetchAll()]);
}
public function store(): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'HR']);
$data = Request::body();
$stmt = Database::connection()->prepare(
'INSERT INTO staff_performance
(staff_id, report_date, sales_amount, orders_served, customer_rating, bonus_amount)
VALUES (:staff_id, :report_date, :sales_amount, :orders_served, :rating, :bonus)'
);
$stmt->execute([
'staff_id' => $data['staff_id'],
'report_date' => $data['report_date'],
'sales_amount' => $data['sales_amount'] ?? 0,
'orders_served' => $data['orders_served'] ?? 0,
'rating' => $data['customer_rating'] ?? 0,
'bonus' => $data['bonus_amount'] ?? 0,
]);
AuditLogger::log(
(int) $user['id'],
'STAFF_PERFORMANCE',
'CREATE_PERFORMANCE_RECORD',
(int) $data['staff_id'],
null,
$data
);
Response::success([], 'Staff performance record created');
}

public function leaderboard(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'HR']);
$stmt = Database::connection()->query(
"SELECT
u.id AS staff_id,
u.full_name,
u.role,
COALESCE(SUM(o.total_amount), 0) AS total_sales,
COUNT(o.id) AS orders_served,
COALESCE(AVG(cr.rating), 0) AS average_rating
FROM users u
LEFT JOIN orders o ON o.waiter_id = u.id AND o.order_status = 'PAID'
LEFT JOIN customer_ratings cr ON cr.staff_id = u.id
WHERE u.role = 'WAITER'
GROUP BY u.id, u.full_name, u.role
ORDER BY total_sales DESC, orders_served DESC"
);


Response::success(['leaderboard' => $stmt->fetchAll()]);
}
public function servicePerformance(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'HR']);
$stmt = Database::connection()->query(
"SELECT
sp.*,
u.full_name,
u.role
FROM staff_performance sp
JOIN users u ON u.id = sp.staff_id
ORDER BY sp.report_date DESC"
);
Response::success(['service_performance' => $stmt->fetchAll()]);
}
public function storeCustomerRating(): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CASHIER', 'WAITER']);
$data = Request::body();
$stmt = Database::connection()->prepare(
'INSERT INTO customer_ratings
(order_id, staff_id, rating, comment, rating_source)
VALUES (:order_id, :staff_id, :rating, :comment, :source)'
);
$stmt->execute([
'order_id' => $data['order_id'] ?? null,
'staff_id' => $data['staff_id'],
'rating' => $data['rating'],
'comment' => $data['comment'] ?? null,
'source' => $data['rating_source'] ?? 'POS',
]);
AuditLogger::log(
(int) $user['id'],
'STAFF_MOTIVATION',
'CREATE_CUSTOMER_RATING',
(int) $data['staff_id'],
null,
$data
);
Response::success([], 'Customer rating captured');
}
public function bonusRules(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'HR']);
$stmt = Database::connection()->query(
'SELECT * FROM bonus_rules ORDER BY created_at DESC'
);
Response::success(['bonus_rules' => $stmt->fetchAll()]);
}
public function storeBonusRule(): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'HR']);
$data = Request::body();
$stmt = Database::connection()->prepare(
'INSERT INTO bonus_rules
(rule_name, role, target_type, target_value, bonus_amount, is_active)
VALUES (:rule_name, :role, :target_type, :target_value, :bonus_amount, 1)'
);
$stmt->execute([
'rule_name' => $data['rule_name'],
'role' => $data['role'],
'target_type' => $data['target_type'],
'target_value' => $data['target_value'],
'bonus_amount' => $data['bonus_amount'],
]);
AuditLogger::log(
(int) $user['id'],
'STAFF_MOTIVATION',
'CREATE_BONUS_RULE',
null,
null,


$data
);
Response::success([], 'Bonus rule created');
}
public function dailyTargets(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'HR']);
$stmt = Database::connection()->query(
"SELECT
dst.*,
u.full_name,
u.role
FROM daily_staff_targets dst
JOIN users u ON u.id = dst.staff_id
ORDER BY dst.target_date DESC"
);
Response::success(['daily_targets' => $stmt->fetchAll()]);
}
public function storeDailyTarget(): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'HR']);
$data = Request::body();
$stmt = Database::connection()->prepare(
'INSERT INTO daily_staff_targets
(staff_id, target_date, sales_target, orders_target, rating_target)
VALUES (:staff_id, :target_date, :sales_target, :orders_target, :rating_target)'
);
$stmt->execute([
'staff_id' => $data['staff_id'],
'target_date' => $data['target_date'],
'sales_target' => $data['sales_target'] ?? 0,
'orders_target' => $data['orders_target'] ?? 0,
'rating_target' => $data['rating_target'] ?? 0,
]);
AuditLogger::log(
(int) $user['id'],
'STAFF_MOTIVATION',
'CREATE_DAILY_TARGET',
(int) $data['staff_id'],
null,
$data
);
Response::success([], 'Daily target created');
}
public function motivationDashboard(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'HR']);
$db = Database::connection();
$topWaiter = $db->query(
"SELECT
u.full_name,
COALESCE(SUM(o.total_amount), 0) AS sales
FROM users u
LEFT JOIN orders o ON o.waiter_id = u.id AND o.order_status = 'PAID'
WHERE u.role = 'WAITER'
GROUP BY u.id, u.full_name
ORDER BY sales DESC
LIMIT 1"
)->fetch();
$ratings = $db->query(
"SELECT COALESCE(AVG(rating), 0) AS average_rating
FROM customer_ratings
WHERE DATE(created_at) = CURDATE()"
)->fetch();
$targets = $db->query(
"SELECT COUNT(*) AS total
FROM daily_staff_targets
WHERE target_date = CURDATE()"
)->fetch();
$achieved = $db->query(
"SELECT COUNT(*) AS total
FROM daily_staff_targets


WHERE target_date = CURDATE()
AND target_status = 'ACHIEVED'"
)->fetch();
Response::success([
'top_waiter_name' => $topWaiter['full_name'] ?? null,
'top_waiter_sales' => (float) ($topWaiter['sales'] ?? 0),
'average_customer_rating_today' => (float) $ratings['average_rating'],
'targets_today' => (int) $targets['total'],
'targets_achieved_today' => (int) $achieved['total'],
]);
}
public function hrmReport(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'HR']);
$stmt = Database::connection()->query(
"SELECT
u.id AS staff_id,
u.full_name,
u.role,
COALESCE(SUM(o.total_amount), 0) AS sales_amount,
COUNT(o.id) AS orders_served,
COALESCE(AVG(cr.rating), 0) AS average_rating,
COALESCE(SUM(sp.bonus_amount), 0) AS recorded_bonus
FROM users u
LEFT JOIN orders o ON o.waiter_id = u.id AND o.order_status = 'PAID'
LEFT JOIN customer_ratings cr ON cr.staff_id = u.id
LEFT JOIN staff_performance sp ON sp.staff_id = u.id
WHERE u.role IN ('WAITER', 'CASHIER', 'CHEF', 'BARMAN', 'DISPATCHER')
GROUP BY u.id, u.full_name, u.role
ORDER BY sales_amount DESC"
);
Response::success(['hrm_performance_report' => $stmt->fetchAll()]);
}

}