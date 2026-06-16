<?php
declare(strict_types=1);
namespace Controllers;
use Support\Database;
use Support\Request;
use Support\Response;
use Support\AuditLogger;


use Support\Auth;
class WebsiteController
{
public function storeLead(): void
{
$data = Request::body();
$db = Database::connection();
$db->beginTransaction();
$leadId = $this->createLead($data, $data['interest_type'] ?? 'GENERAL');
$this->createOrUpdateCustomer(
$data['full_name'],
$data['phone'],
$data['email'] ?? null,
$data['message'] ?? null,
'WEBSITE'
);
AuditLogger::log(
null,
'WEBSITE',
'CREATE_WEBSITE_LEAD',
$leadId,
null,
$data
);
$db->commit();
Response::success([
'lead_id' => $leadId,
], 'Website lead submitted');
}
public function storeCateringEnquiry(): void
{
$data = Request::body();
$db = Database::connection();
$db->beginTransaction();
$leadId = $this->createLead([
'full_name' => $data['full_name'],
'phone' => $data['phone'],
'email' => $data['email'] ?? null,
'message' => $data['message'] ?? null,
], 'CATERING');
$stmt = $db->prepare(
'INSERT INTO catering_enquiries
(lead_id, full_name, phone, event_date, guest_count, location, message)
VALUES (:lead_id, :full_name, :phone, :event_date, :guest_count, :location, :message)'
);
$stmt->execute([
'lead_id' => $leadId,
'full_name' => $data['full_name'],
'phone' => $data['phone'],
'event_date' => $data['event_date'] ?? null,
'guest_count' => $data['guest_count'] ?? null,
'location' => $data['location'] ?? null,
'message' => $data['message'] ?? null,
]);
$this->createOrUpdateCustomer(
$data['full_name'],
$data['phone'],
$data['email'] ?? null,
'Catering enquiry: ' . ($data['message'] ?? ''),
'WEBSITE_CATERING'
);
AuditLogger::log(
null,
'WEBSITE',
'CREATE_CATERING_ENQUIRY',
$leadId,
null,
$data
);
$db->commit();
Response::success([
'lead_id' => $leadId,
], 'Catering enquiry submitted');


}
public function storeDeliveryEnquiry(): void
{
$data = Request::body();
$db = Database::connection();
$db->beginTransaction();
$leadId = $this->createLead([
'full_name' => $data['full_name'],
'phone' => $data['phone'],
'email' => $data['email'] ?? null,
'message' => $data['order_request'] ?? null,
], 'DELIVERY');
$stmt = $db->prepare(
'INSERT INTO delivery_enquiries
(lead_id, full_name, phone, delivery_address, order_request)
VALUES (:lead_id, :full_name, :phone, :delivery_address, :order_request)'
);
$stmt->execute([
'lead_id' => $leadId,
'full_name' => $data['full_name'],
'phone' => $data['phone'],
'delivery_address' => $data['delivery_address'],
'order_request' => $data['order_request'],
]);
$this->createOrUpdateCustomer(
$data['full_name'],
$data['phone'],
$data['email'] ?? null,
'Delivery enquiry: ' . ($data['order_request'] ?? ''),
'WEBSITE_DELIVERY'
);
AuditLogger::log(
null,
'WEBSITE',
'CREATE_DELIVERY_ENQUIRY',
$leadId,
null,
$data
);
$db->commit();
Response::success([
'lead_id' => $leadId,
], 'Delivery enquiry submitted');
}
public function storeFeedback(): void
{
$data = Request::body();
$db = Database::connection();
$db->beginTransaction();
$leadId = $this->createLead([
'full_name' => $data['full_name'] ?? 'Anonymous Customer',
'phone' => $data['phone'] ?? 'UNKNOWN',
'email' => null,
'message' => $data['message'] ?? null,
], 'FEEDBACK');
$stmt = $db->prepare(
'INSERT INTO customer_feedback
(lead_id, full_name, phone, rating, message)
VALUES (:lead_id, :full_name, :phone, :rating, :message)'
);
$stmt->execute([
'lead_id' => $leadId,
'full_name' => $data['full_name'] ?? null,
'phone' => $data['phone'] ?? null,
'rating' => $data['rating'],
'message' => $data['message'] ?? null,
]);
if (!empty($data['full_name']) && !empty($data['phone'])) {
$this->createOrUpdateCustomer(
$data['full_name'],
$data['phone'],
null,


'Feedback: ' . ($data['message'] ?? ''),
'WEBSITE_FEEDBACK'
);
}
AuditLogger::log(
null,
'WEBSITE',
'CREATE_CUSTOMER_FEEDBACK',
$leadId,
null,
$data
);
$db->commit();
Response::success([
'lead_id' => $leadId,
], 'Feedback submitted');
}
private function createLead(array $data, string $interestType): int
{
$stmt = Database::connection()->prepare(
'INSERT INTO website_leads
(full_name, phone, email, interest_type, message, source)
VALUES (:full_name, :phone, :email, :interest_type, :message, :source)'
);
$stmt->execute([
'full_name' => $data['full_name'],
'phone' => $data['phone'],
'email' => $data['email'] ?? null,
'interest_type' => $interestType,
'message' => $data['message'] ?? null,
'source' => 'WEBSITE',
]);
return (int) Database::connection()->lastInsertId();
}
private function createOrUpdateCustomer(
string $fullName,
string $phone,
?string $email,
?string $notes,
string $source
): void {
$db = Database::connection();
$existing = $db->prepare(
'SELECT id FROM customers WHERE phone = :phone LIMIT 1'
);
$existing->execute(['phone' => $phone]);
$customer = $existing->fetch();
if ($customer) {
$stmt = $db->prepare(
'UPDATE customers
SET full_name = :full_name,
email = COALESCE(:email, email),
notes = CONCAT(COALESCE(notes, ""), "\n", :notes),
customer_type = "REGULAR"
WHERE id = :id'
);
$stmt->execute([
'full_name' => $fullName,
'email' => $email,
'notes' => '[' . $source . '] ' . ($notes ?? ''),
'id' => $customer['id'],
]);
return;
}
$stmt = $db->prepare(
'INSERT INTO customers
(full_name, phone, email, customer_type, loyalty_points, notes)
VALUES (:full_name, :phone, :email, :customer_type, 0, :notes)'
);
$stmt->execute([
'full_name' => $fullName,
'phone' => $phone,
'email' => $email,


'customer_type' => 'REGULAR',
'notes' => '[' . $source . '] ' . ($notes ?? ''),
]);
}

public function leads(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER']);
$stmt = Database::connection()->query(
'SELECT * FROM website_leads ORDER BY created_at DESC'
);
Response::success(['leads' => $stmt->fetchAll()]);
}
public function cateringEnquiries(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER']);
$stmt = Database::connection()->query(
'SELECT * FROM catering_enquiries ORDER BY created_at DESC'
);
Response::success(['catering_enquiries' => $stmt->fetchAll()]);
}


public function deliveryEnquiries(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER']);
$stmt = Database::connection()->query(
'SELECT * FROM delivery_enquiries ORDER BY created_at DESC'
);
Response::success(['delivery_enquiries' => $stmt->fetchAll()]);
}
public function feedback(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER']);
$stmt = Database::connection()->query(
'SELECT * FROM customer_feedback ORDER BY created_at DESC'
);
Response::success(['feedback' => $stmt->fetchAll()]);
}
public function acquisitionSummary(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER']);
$db = Database::connection();
$leads = $db->query('SELECT COUNT(*) AS total FROM website_leads')->fetch();
$newLeads = $db->query("SELECT COUNT(*) AS total FROM website_leads WHERE lead_status = 'NEW'")->fetch();
$converted = $db->query("SELECT COUNT(*) AS total FROM website_leads WHERE lead_status = 'CONVERTED'")>fetch();
$catering = $db->query('SELECT COUNT(*) AS total FROM catering_enquiries')->fetch();
$delivery = $db->query('SELECT COUNT(*) AS total FROM delivery_enquiries')->fetch();
$feedback = $db->query('SELECT COUNT(*) AS total FROM customer_feedback')->fetch();
Response::success([
'total_leads' => (int) $leads['total'],
'new_leads' => (int) $newLeads['total'],
'converted_leads' => (int) $converted['total'],
'catering_enquiries' => (int) $catering['total'],
'delivery_enquiries' => (int) $delivery['total'],
'feedback_count' => (int) $feedback['total'],
]);
}
public function updateLeadStatus(int $id): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER']);
$data = Request::body();
$stmt = Database::connection()->prepare(
'UPDATE website_leads SET lead_status = :status WHERE id = :id'
);
$stmt->execute([
'status' => $data['lead_status'],
'id' => $id,
]);
AuditLogger::log(
(int) $user['id'],
'WEBSITE',
'UPDATE_LEAD_STATUS',
$id,
null,
$data
);
Response::success([], 'Lead status updated');
}
public function updateCateringStatus(int $id): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER']);
$data = Request::body();
$stmt = Database::connection()->prepare(
'UPDATE catering_enquiries SET enquiry_status = :status WHERE id = :id'
);
$stmt->execute([
'status' => $data['enquiry_status'],
'id' => $id,
]);
AuditLogger::log(


(int) $user['id'],
'WEBSITE',
'UPDATE_CATERING_STATUS',
$id,
null,
$data
);
Response::success([], 'Catering status updated');
}
public function updateDeliveryStatus(int $id): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER']);
$data = Request::body();
$stmt = Database::connection()->prepare(
'UPDATE delivery_enquiries SET enquiry_status = :status WHERE id = :id'
);
$stmt->execute([
'status' => $data['enquiry_status'],
'id' => $id,
]);
AuditLogger::log(
(int) $user['id'],
'WEBSITE',
'UPDATE_DELIVERY_STATUS',
$id,
null,
$data
);
Response::success([], 'Delivery status updated');
}
public function updateFeedbackStatus(int $id): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER']);
$data = Request::body();
$stmt = Database::connection()->prepare(
'UPDATE customer_feedback SET feedback_status = :status WHERE id = :id'
);
$stmt->execute([
'status' => $data['feedback_status'],
'id' => $id,
]);
AuditLogger::log(
(int) $user['id'],
'WEBSITE',
'UPDATE_FEEDBACK_STATUS',
$id,
null,
$data
);
Response::success([], 'Feedback status updated');
}

}