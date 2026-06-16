<?php
declare(strict_types=1);
namespace Controllers;
use Support\Auth;
use Support\Database;
use Support\Request;
use Support\Response;
use Support\AuditLogger;
class AssetsController
{
public function index(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT']);
$stmt = Database::connection()->query(
'SELECT * FROM assets ORDER BY created_at DESC'
);
Response::success(['assets' => $stmt->fetchAll()]);
}
public function store(): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT']);
$data = Request::body();
$stmt = Database::connection()->prepare(
'INSERT INTO assets
(asset_name, asset_category, serial_number, purchase_cost, asset_status)
VALUES (:name, :category, :serial, :cost, :status)'
);
$stmt->execute([
'name' => $data['asset_name'],
'category' => $data['asset_category'] ?? null,
'serial' => $data['serial_number'] ?? null,
'cost' => $data['purchase_cost'] ?? 0,
'status' => $data['asset_status'] ?? 'ACTIVE',
]);
AuditLogger::log(


(int) $user['id'],
'ASSETS',
'CREATE_ASSET',
null,
null,
$data
);
Response::success([], 'Asset created');
}

public function assignments(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT', 'HR']);
$stmt = Database::connection()->query(
"SELECT
aa.*,
a.asset_name,
u.full_name AS assigned_to_name
FROM asset_assignments aa
JOIN assets a ON a.id = aa.asset_id
LEFT JOIN users u ON u.id = aa.assigned_to
ORDER BY aa.created_at DESC"
);
Response::success(['asset_assignments' => $stmt->fetchAll()]);
}
public function createAssignment(): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT', 'HR']);
$data = Request::body();
$stmt = Database::connection()->prepare(
'INSERT INTO asset_assignments
(asset_id, assigned_to, department, assigned_date, notes)
VALUES (:asset_id, :assigned_to, :department, :assigned_date, :notes)'
);
$stmt->execute([
'asset_id' => $data['asset_id'],
'assigned_to' => $data['assigned_to'] ?? null,


'department' => $data['department'],
'assigned_date' => $data['assigned_date'],
'notes' => $data['notes'] ?? null,
]);
AuditLogger::log((int) $user['id'], 'ASSETS', 'CREATE_ASSET_ASSIGNMENT', (int) $data['asset_id'], null,
$data);
Response::success([], 'Asset assignment created');
}
public function maintenanceSchedules(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT']);
$stmt = Database::connection()->query(
"SELECT
ams.*,
a.asset_name,
u.full_name AS assigned_to_name
FROM asset_maintenance_schedules ams
JOIN assets a ON a.id = ams.asset_id
LEFT JOIN users u ON u.id = ams.assigned_to
ORDER BY ams.scheduled_date ASC"
);
Response::success(['maintenance_schedules' => $stmt->fetchAll()]);
}
public function createMaintenanceSchedule(): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT']);
$data = Request::body();
$stmt = Database::connection()->prepare(
'INSERT INTO asset_maintenance_schedules
(asset_id, maintenance_type, scheduled_date, assigned_to, notes)
VALUES (:asset_id, :maintenance_type, :scheduled_date, :assigned_to, :notes)'
);
$stmt->execute([
'asset_id' => $data['asset_id'],
'maintenance_type' => $data['maintenance_type'],
'scheduled_date' => $data['scheduled_date'],
'assigned_to' => $data['assigned_to'] ?? null,
'notes' => $data['notes'] ?? null,
]);
AuditLogger::log((int) $user['id'], 'ASSETS', 'CREATE_MAINTENANCE_SCHEDULE', (int) $data['asset_id'], null,
$data);
Response::success([], 'Maintenance schedule created');
}
public function completeMaintenanceSchedule(int $id): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT']);
$stmt = Database::connection()->prepare(
"UPDATE asset_maintenance_schedules
SET maintenance_status = 'COMPLETED'
WHERE id = :id"
);
$stmt->execute(['id' => $id]);
AuditLogger::log((int) $user['id'], 'ASSETS', 'COMPLETE_MAINTENANCE_SCHEDULE', $id);
Response::success([], 'Maintenance schedule completed');
}
public function repairLogs(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT']);
$stmt = Database::connection()->query(
"SELECT
arl.*,
a.asset_name,
u.full_name AS recorded_by_name
FROM asset_repair_logs arl
JOIN assets a ON a.id = arl.asset_id
LEFT JOIN users u ON u.id = arl.recorded_by
ORDER BY arl.repair_date DESC"
);
Response::success(['repair_logs' => $stmt->fetchAll()]);


}
public function createRepairLog(): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT']);
$data = Request::body();
$stmt = Database::connection()->prepare(
'INSERT INTO asset_repair_logs
(asset_id, repair_date, repair_cost, repair_description, repaired_by, recorded_by)
VALUES (:asset_id, :repair_date, :repair_cost, :description, :repaired_by, :recorded_by)'
);
$stmt->execute([
'asset_id' => $data['asset_id'],
'repair_date' => $data['repair_date'],
'repair_cost' => $data['repair_cost'] ?? 0,
'description' => $data['repair_description'] ?? null,
'repaired_by' => $data['repaired_by'] ?? null,
'recorded_by' => $user['id'],
]);
if ((float) ($data['repair_cost'] ?? 0) > 0) {
$finance = Database::connection()->prepare(
'INSERT INTO finance_transactions
(transaction_type, category, amount, reference_number, notes, created_by)
VALUES ("EXPENSE", "Repairs and Maintenance", :amount, :reference, :notes, :created_by)'
);
$finance->execute([
'amount' => $data['repair_cost'],
'reference' => 'ASSET-REPAIR-' . $data['asset_id'],
'notes' => $data['repair_description'] ?? 'Asset repair cost',
'created_by' => $user['id'],
]);
}
AuditLogger::log((int) $user['id'], 'ASSETS', 'CREATE_REPAIR_LOG', (int) $data['asset_id'], null, $data);
Response::success([], 'Asset repair log created');
}
public function damageReports(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT', 'HR']);
$stmt = Database::connection()->query(
"SELECT
adr.*,
a.asset_name,
u.full_name AS reported_by_name
FROM asset_damage_reports adr
JOIN assets a ON a.id = adr.asset_id
LEFT JOIN users u ON u.id = adr.reported_by
ORDER BY adr.created_at DESC"
);
Response::success(['damage_reports' => $stmt->fetchAll()]);
}
public function createDamageReport(): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT', 'HR']);
$data = Request::body();
$stmt = Database::connection()->prepare(
'INSERT INTO asset_damage_reports
(asset_id, reported_by, damage_date, damage_description, estimated_loss)
VALUES (:asset_id, :reported_by, :damage_date, :description, :estimated_loss)'
);
$stmt->execute([
'asset_id' => $data['asset_id'],
'reported_by' => $user['id'],
'damage_date' => $data['damage_date'],
'description' => $data['damage_description'],
'estimated_loss' => $data['estimated_loss'] ?? 0,
]);
$assetUpdate = Database::connection()->prepare(
"UPDATE assets SET asset_status = 'DAMAGED' WHERE id = :id"
);
$assetUpdate->execute(['id' => $data['asset_id']]);
AuditLogger::log((int) $user['id'], 'ASSETS', 'CREATE_DAMAGE_REPORT', (int) $data['asset_id'], null,
$data);


Response::success([], 'Asset damage report created');
}
public function writeoffRequests(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT']);
$stmt = Database::connection()->query(
"SELECT
awr.*,
a.asset_name,
requester.full_name AS requested_by_name,
approver.full_name AS approved_by_name
FROM asset_writeoff_requests awr
JOIN assets a ON a.id = awr.asset_id
JOIN users requester ON requester.id = awr.requested_by
LEFT JOIN users approver ON approver.id = awr.approved_by
ORDER BY awr.created_at DESC"
);
Response::success(['writeoff_requests' => $stmt->fetchAll()]);
}
public function createWriteoffRequest(): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT']);
$data = Request::body();
$stmt = Database::connection()->prepare(
'INSERT INTO asset_writeoff_requests
(asset_id, requested_by, request_reason, estimated_loss)
VALUES (:asset_id, :requested_by, :reason, :estimated_loss)'
);
$stmt->execute([
'asset_id' => $data['asset_id'],
'requested_by' => $user['id'],
'reason' => $data['request_reason'],
'estimated_loss' => $data['estimated_loss'] ?? 0,
]);
AuditLogger::log((int) $user['id'], 'ASSETS', 'CREATE_WRITEOFF_REQUEST', (int) $data['asset_id'], null,
$data);
Response::success([], 'Asset write-off request created');
}
public function approveWriteoffRequest(int $id): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER']);
$stmt = Database::connection()->prepare(
"UPDATE asset_writeoff_requests
SET writeoff_status = 'APPROVED',
approved_by = :approved_by,
approved_at = NOW()
WHERE id = :id"
);
$stmt->execute([
'approved_by' => $user['id'],
'id' => $id,
]);
AuditLogger::log((int) $user['id'], 'ASSETS', 'APPROVE_WRITEOFF_REQUEST', $id);
Response::success([], 'Asset write-off request approved');
}
public function applyWriteoffRequest(int $id): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER']);
$db = Database::connection();
$stmt = $db->prepare(
'SELECT * FROM asset_writeoff_requests WHERE id = :id LIMIT 1'
);
$stmt->execute(['id' => $id]);
$request = $stmt->fetch();
if (!$request) {
Response::error('Write-off request not found', 404);
}
if ($request['writeoff_status'] !== 'APPROVED') {


Response::error('Write-off must be approved before applying', 403);
}
$asset = $db->prepare(
"UPDATE assets SET asset_status = 'DISPOSED' WHERE id = :asset_id"
);
$asset->execute(['asset_id' => $request['asset_id']]);
$update = $db->prepare(
"UPDATE asset_writeoff_requests
SET writeoff_status = 'APPLIED'
WHERE id = :id"
);
$update->execute(['id' => $id]);
AuditLogger::log((int) $user['id'], 'ASSETS', 'APPLY_WRITEOFF_REQUEST', $id, null, $request);
Response::success([], 'Asset write-off applied');
}
public function lifecycleDashboard(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT']);
$db = Database::connection();
$summary = $db->query(
"SELECT
COUNT(*) AS total_assets,
SUM(CASE WHEN asset_status = 'ACTIVE' THEN 1 ELSE 0 END) AS active_assets,
SUM(CASE WHEN asset_status = 'DAMAGED' THEN 1 ELSE 0 END) AS damaged_assets,
SUM(CASE WHEN asset_status = 'DISPOSED' THEN 1 ELSE 0 END) AS disposed_assets,
COALESCE(SUM(purchase_cost), 0) AS total_asset_value
FROM assets"
)->fetch();
$maintenance = $db->query(
"SELECT COUNT(*) AS pending_maintenance
FROM asset_maintenance_schedules
WHERE maintenance_status IN ('PENDING', 'OVERDUE')"
)->fetch();
$writeoffs = $db->query(
"SELECT COUNT(*) AS pending_writeoffs
FROM asset_writeoff_requests
WHERE writeoff_status = 'PENDING'"
)->fetch();
Response::success([
'summary' => $summary,
'pending_maintenance' => (int) $maintenance['pending_maintenance'],
'pending_writeoffs' => (int) $writeoffs['pending_writeoffs'],
]);
}

}