<?php
declare(strict_types=1);
namespace Controllers;
use Support\Database;
use Support\Request;
use Support\Response;
use Support\AuditLogger;
use Support\Auth;
class CustomersController
{
public function index(): void
{
$stmt = Database::connection()->query(
'SELECT * FROM customers ORDER BY created_at DESC'
);
Response::success(['customers' => $stmt->fetchAll()]);
}
public function store(): void
{
$data = Request::body();
$stmt = Database::connection()->prepare(
'INSERT INTO customers
(full_name, phone, email, customer_type, loyalty_points, notes)
VALUES (:name, :phone, :email, :type, 0, :notes)'
);
$stmt->execute([
'name' => $data['full_name'],
'phone' => $data['phone'] ?? null,
'email' => $data['email'] ?? null,
'type' => $data['customer_type'] ?? 'WALK_IN',
'notes' => $data['notes'] ?? null,
]);
Response::success([], 'Customer created');
}

public function customerSegments(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CRM']);
$stmt = Database::connection()->query(
"SELECT
segment,
COUNT(*) AS customer_count,
COALESCE(SUM(lifetime_value), 0) AS lifetime_value
FROM customers
GROUP BY segment
ORDER BY customer_count DESC"
);
Response::success(['customer_segments' => $stmt->fetchAll()]);
}
public function visitHistory(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CRM']);
$stmt = Database::connection()->query(
"SELECT
cvh.*,
c.full_name,
c.phone
FROM customer_visit_history cvh
JOIN customers c ON c.id = cvh.customer_id
ORDER BY cvh.visit_date DESC, cvh.created_at DESC"
);
Response::success(['visit_history' => $stmt->fetchAll()]);
}
public function recordVisit(): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CRM', 'CASHIER']);
$data = Request::body();
$db = Database::connection();
$db->beginTransaction();
$stmt = $db->prepare(
'INSERT INTO customer_visit_history
(customer_id, order_id, visit_date, visit_source, total_spent)
VALUES (:customer_id, :order_id, :visit_date, :visit_source, :total_spent)'
);
$stmt->execute([
'customer_id' => $data['customer_id'],
'order_id' => $data['order_id'] ?? null,
'visit_date' => $data['visit_date'],
'visit_source' => $data['visit_source'] ?? 'WALK_IN',
'total_spent' => $data['total_spent'] ?? 0,
]);
$update = $db->prepare(
'UPDATE customers
SET total_visits = total_visits + 1,
last_visit_date = :visit_date,
lifetime_value = lifetime_value + :total_spent,
segment = CASE
WHEN lifetime_value + :total_spent >= 50000 THEN "VIP"
WHEN total_visits + 1 >= 3 THEN "REGULAR"
ELSE segment
END
WHERE id = :customer_id'
);
$update->execute([
'visit_date' => $data['visit_date'],
'total_spent' => $data['total_spent'] ?? 0,
'customer_id' => $data['customer_id'],


]);
AuditLogger::log(
(int) $user['id'],
'CRM',
'RECORD_CUSTOMER_VISIT',
(int) $data['customer_id'],
null,
$data
);
$db->commit();
Response::success([], 'Customer visit recorded');
}
public function loyaltyTransactions(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CRM']);
$stmt = Database::connection()->query(
"SELECT
lt.*,
c.full_name,
c.phone
FROM loyalty_transactions lt
JOIN customers c ON c.id = lt.customer_id
ORDER BY lt.created_at DESC"
);
Response::success(['loyalty_transactions' => $stmt->fetchAll()]);
}
public function recordLoyaltyTransaction(): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CRM', 'CASHIER']);
$data = Request::body();
$db = Database::connection();
$db->beginTransaction();
$stmt = $db->prepare(
'INSERT INTO loyalty_transactions
(customer_id, transaction_type, points, reference_type, reference_id, notes)
VALUES (:customer_id, :transaction_type, :points, :reference_type, :reference_id, :notes)'
);
$stmt->execute([
'customer_id' => $data['customer_id'],
'transaction_type' => $data['transaction_type'],
'points' => $data['points'],
'reference_type' => $data['reference_type'] ?? 'MANUAL',
'reference_id' => $data['reference_id'] ?? null,
'notes' => $data['notes'] ?? null,
]);
$pointsImpact = $data['transaction_type'] === 'REDEEMED'
? -1 * (float) $data['points']
: (float) $data['points'];
$update = $db->prepare(
'UPDATE customers
SET loyalty_points = loyalty_points + :points
WHERE id = :customer_id'
);
$update->execute([
'points' => $pointsImpact,
'customer_id' => $data['customer_id'],
]);
AuditLogger::log(
(int) $user['id'],
'CRM',
'RECORD_LOYALTY_TRANSACTION',
(int) $data['customer_id'],
null,
$data
);
$db->commit();
Response::success([], 'Loyalty transaction recorded');
}
public function followUps(): void
{


Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CRM']);
$stmt = Database::connection()->query(
"SELECT
cf.*,
c.full_name AS customer_name,
c.phone AS customer_phone,
u.full_name AS assigned_to_name
FROM customer_follow_ups cf
LEFT JOIN customers c ON c.id = cf.customer_id
LEFT JOIN users u ON u.id = cf.assigned_to
ORDER BY cf.created_at DESC"
);
Response::success(['follow_ups' => $stmt->fetchAll()]);
}
public function createFollowUp(): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CRM']);
$data = Request::body();
$stmt = Database::connection()->prepare(
'INSERT INTO customer_follow_ups
(customer_id, website_lead_id, feedback_id, follow_up_type, follow_up_status, assigned_to, notes,
due_date)
VALUES (:customer_id, :website_lead_id, :feedback_id, :type, "PENDING", :assigned_to, :notes,
:due_date)'
);
$stmt->execute([
'customer_id' => $data['customer_id'] ?? null,
'website_lead_id' => $data['website_lead_id'] ?? null,
'feedback_id' => $data['feedback_id'] ?? null,
'type' => $data['follow_up_type'],
'assigned_to' => $data['assigned_to'] ?? $user['id'],
'notes' => $data['notes'] ?? null,
'due_date' => $data['due_date'] ?? null,
]);
AuditLogger::log(
(int) $user['id'],
'CRM',
'CREATE_CUSTOMER_FOLLOW_UP',
null,
null,
$data
);
Response::success([], 'Customer follow-up created');
}
public function updateFollowUpStatus(int $id): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CRM']);
$data = Request::body();
$stmt = Database::connection()->prepare(
'UPDATE customer_follow_ups
SET follow_up_status = :status,
notes = CONCAT(COALESCE(notes, ""), "\n", :notes)
WHERE id = :id'
);
$stmt->execute([
'status' => $data['follow_up_status'],
'notes' => $data['notes'] ?? '',
'id' => $id,
]);
AuditLogger::log(
(int) $user['id'],
'CRM',
'UPDATE_FOLLOW_UP_STATUS',
$id,
null,
$data
);
Response::success([], 'Follow-up status updated');
}
public function generateAbandonedLeadFollowUps(): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CRM']);
$db = Database::connection();


$stmt = $db->query(
"SELECT wl.*
FROM website_leads wl
LEFT JOIN customer_follow_ups cf ON cf.website_lead_id = wl.id
WHERE wl.lead_status = 'NEW'
AND cf.id IS NULL"
);
$leads = $stmt->fetchAll();
$created = 0;
foreach ($leads as $lead) {
$insert = $db->prepare(
'INSERT INTO customer_follow_ups
(website_lead_id, follow_up_type, follow_up_status, assigned_to, notes, due_date)
VALUES (:lead_id, "ABANDONED_LEAD", "PENDING", :assigned_to, :notes, CURDATE())'
);
$insert->execute([
'lead_id' => $lead['id'],
'assigned_to' => $user['id'],
'notes' => 'Website lead has not yet been contacted',
]);
$created++;
}
AuditLogger::log(
(int) $user['id'],
'CRM',
'GENERATE_ABANDONED_LEAD_FOLLOWUPS',
null,
null,
['created' => $created]
);
Response::success(['created' => $created], 'Abandoned lead follow-ups generated');
}
public function generateReminderPlaceholders(): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CRM']);
$db = Database::connection();
$stmt = $db->query(
"SELECT id, birth_date, anniversary_date
FROM customers
WHERE birth_date IS NOT NULL
OR anniversary_date IS NOT NULL"
);
$customers = $stmt->fetchAll();
$created = 0;
foreach ($customers as $customer) {
if (!empty($customer['birth_date'])) {
$insert = $db->prepare(
'INSERT INTO customer_follow_ups
(customer_id, follow_up_type, follow_up_status, assigned_to, notes, due_date)
VALUES (:customer_id, "BIRTHDAY_REMINDER", "PENDING", :assigned_to, "Birthday reminder
placeholder", :due_date)'
);
$insert->execute([
'customer_id' => $customer['id'],
'assigned_to' => $user['id'],
'due_date' => $customer['birth_date'],
]);
$created++;
}
if (!empty($customer['anniversary_date'])) {
$insert = $db->prepare(
'INSERT INTO customer_follow_ups
(customer_id, follow_up_type, follow_up_status, assigned_to, notes, due_date)
VALUES (:customer_id, "ANNIVERSARY_REMINDER", "PENDING", :assigned_to, "Anniversary reminder
placeholder", :due_date)'
);
$insert->execute([
'customer_id' => $customer['id'],
'assigned_to' => $user['id'],
'due_date' => $customer['anniversary_date'],
]);
$created++;


}
}
AuditLogger::log(
(int) $user['id'],
'CRM',
'GENERATE_REMINDER_PLACEHOLDERS',
null,
null,
['created' => $created]
);
Response::success(['created' => $created], 'Reminder placeholders generated');
}
public function repeatCustomerDashboard(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'CRM']);
$db = Database::connection();
$summary = $db->query(
"SELECT
COUNT(*) AS total_customers,
SUM(CASE WHEN total_visits >= 2 THEN 1 ELSE 0 END) AS repeat_customers,
SUM(CASE WHEN segment = 'VIP' THEN 1 ELSE 0 END) AS vip_customers,
SUM(loyalty_points) AS total_loyalty_points,
SUM(lifetime_value) AS total_lifetime_value
FROM customers"
)->fetch();
$topCustomers = $db->query(
"SELECT
id,
full_name,
phone,
segment,
total_visits,
loyalty_points,
lifetime_value,
last_visit_date
FROM customers
ORDER BY lifetime_value DESC, total_visits DESC
LIMIT 20"
)->fetchAll();
Response::success([
'summary' => $summary,
'top_customers' => $topCustomers,
]);
}

}