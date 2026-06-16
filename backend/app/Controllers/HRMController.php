<?php
declare(strict_types=1);
namespace Controllers;
use Support\Auth;
use Support\Database;
use Support\Request;
use Support\Response;
use Support\AuditLogger;
class HRMController
{
public function staff(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'HR']);
$stmt = Database::connection()->query(
"SELECT
id,
full_name,
email,
phone,
role,
is_active,
created_at
FROM users
ORDER BY created_at DESC"
);
Response::success(['staff' => $stmt->fetchAll()]);
}
public function storeStaff(): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'HR']);
$data = Request::body();
$passwordHash = password_hash(
$data['password'] ?? 'ChangeMe123',
PASSWORD_BCRYPT
);
$stmt = Database::connection()->prepare(
'INSERT INTO users
(full_name, email, phone, password_hash, role, is_active)
VALUES (:name, :email, :phone, :password_hash, :role, 1)'
);
$stmt->execute([
'name' => $data['full_name'],
'email' => $data['email'] ?? null,
'phone' => $data['phone'] ?? null,
'password_hash' => $passwordHash,
'role' => $data['role'],
]);
AuditLogger::log(
(int) $user['id'],
'HRM',
'CREATE_STAFF',
null,
null,
[
'full_name' => $data['full_name'],
'email' => $data['email'] ?? null,
'phone' => $data['phone'] ?? null,


'role' => $data['role'],
]
);
Response::success([], 'Staff user created');
}

public function shifts(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'HR']);
$stmt = Database::connection()->query(
'SELECT * FROM staff_shifts ORDER BY start_time ASC'
);
Response::success(['shifts' => $stmt->fetchAll()]);
}
public function createShift(): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'HR']);
$data = Request::body();
$stmt = Database::connection()->prepare(


'INSERT INTO staff_shifts
(shift_name, start_time, end_time, grace_minutes, shift_status, notes)
VALUES (:shift_name, :start_time, :end_time, :grace_minutes, :status, :notes)'
);
$stmt->execute([
'shift_name' => $data['shift_name'],
'start_time' => $data['start_time'],
'end_time' => $data['end_time'],
'grace_minutes' => $data['grace_minutes'] ?? 10,
'status' => $data['shift_status'] ?? 'ACTIVE',
'notes' => $data['notes'] ?? null,
]);
AuditLogger::log((int) $user['id'], 'HRM', 'CREATE_SHIFT', null, null, $data);
Response::success([], 'Shift created');
}
public function dutyRosters(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'HR']);
$stmt = Database::connection()->query(
"SELECT
dr.*,
u.full_name AS staff_name,
u.role,
ss.shift_name,
ss.start_time,
ss.end_time
FROM duty_rosters dr
JOIN users u ON u.id = dr.staff_id
JOIN staff_shifts ss ON ss.id = dr.shift_id
ORDER BY dr.duty_date DESC"
);
Response::success(['duty_rosters' => $stmt->fetchAll()]);
}
public function createDutyRoster(): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'HR']);
$data = Request::body();
$stmt = Database::connection()->prepare(
'INSERT INTO duty_rosters
(staff_id, shift_id, duty_date, duty_department, notes)
VALUES (:staff_id, :shift_id, :duty_date, :department, :notes)'
);
$stmt->execute([
'staff_id' => $data['staff_id'],
'shift_id' => $data['shift_id'],
'duty_date' => $data['duty_date'],
'department' => $data['duty_department'],
'notes' => $data['notes'] ?? null,
]);
AuditLogger::log((int) $user['id'], 'HRM', 'CREATE_DUTY_ROSTER', (int) $data['staff_id'], null, $data);
Response::success([], 'Duty roster created');
}
public function attendance(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'HR']);
$stmt = Database::connection()->query(
"SELECT
sa.*,
u.full_name AS staff_name,
u.role
FROM staff_attendance sa
JOIN users u ON u.id = sa.staff_id
ORDER BY sa.attendance_date DESC, sa.created_at DESC"
);
Response::success(['attendance' => $stmt->fetchAll()]);
}
public function clockIn(): void
{
$user = Auth::requireAuth();
$data = Request::body();
$db = Database::connection();


$staffId = $data['staff_id'] ?? $user['id'];
$attendanceDate = $data['attendance_date'] ?? date('Y-m-d');
$clockIn = $data['clock_in_time'] ?? date('Y-m-d H:i:s');
$rosterStmt = $db->prepare(
"SELECT
dr.*,
ss.start_time,
ss.grace_minutes
FROM duty_rosters dr
JOIN staff_shifts ss ON ss.id = dr.shift_id
WHERE dr.staff_id = :staff_id
AND dr.duty_date = :duty_date
LIMIT 1"
);
$rosterStmt->execute([
'staff_id' => $staffId,
'duty_date' => $attendanceDate,
]);
$roster = $rosterStmt->fetch();
$latenessMinutes = 0;
$status = 'PRESENT';
if ($roster) {
$expected = strtotime($attendanceDate . ' ' . $roster['start_time']);
$actual = strtotime($clockIn);
$graceSeconds = ((int) $roster['grace_minutes']) * 60;
if ($actual > ($expected + $graceSeconds)) {
$latenessMinutes = (int) floor(($actual - $expected) / 60);
$status = 'LATE';
}
}
$stmt = $db->prepare(
'INSERT INTO staff_attendance
(staff_id, duty_roster_id, attendance_date, clock_in_time, attendance_status, lateness_minutes,
clock_in_notes)
VALUES (:staff_id, :duty_roster_id, :attendance_date, :clock_in_time, :status, :lateness, :notes)'
);
$stmt->execute([
'staff_id' => $staffId,
'duty_roster_id' => $roster['id'] ?? null,
'attendance_date' => $attendanceDate,
'clock_in_time' => $clockIn,
'status' => $status,
'lateness' => $latenessMinutes,
'notes' => $data['clock_in_notes'] ?? null,
]);
AuditLogger::log((int) $user['id'], 'HRM', 'CLOCK_IN', (int) $staffId, null, $data);
Response::success([
'attendance_status' => $status,
'lateness_minutes' => $latenessMinutes,
], 'Clock-in recorded');
}
public function clockOut(): void
{
$user = Auth::requireAuth();
$data = Request::body();
$db = Database::connection();
$staffId = $data['staff_id'] ?? $user['id'];
$attendanceDate = $data['attendance_date'] ?? date('Y-m-d');
$clockOut = $data['clock_out_time'] ?? date('Y-m-d H:i:s');
$attendanceStmt = $db->prepare(
'SELECT * FROM staff_attendance
WHERE staff_id = :staff_id
AND attendance_date = :attendance_date
ORDER BY created_at DESC
LIMIT 1'
);
$attendanceStmt->execute([
'staff_id' => $staffId,
'attendance_date' => $attendanceDate,
]);
$attendance = $attendanceStmt->fetch();


if (!$attendance) {
Response::error('No clock-in record found for this staff/date', 404);
}
$stmt = $db->prepare(
'UPDATE staff_attendance
SET clock_out_time = :clock_out_time,
clock_out_notes = :notes,
attendance_status = CASE
WHEN attendance_status = "INCOMPLETE" THEN "PRESENT"
ELSE attendance_status
END
WHERE id = :id'
);
$stmt->execute([
'clock_out_time' => $clockOut,
'notes' => $data['clock_out_notes'] ?? null,
'id' => $attendance['id'],
]);
AuditLogger::log((int) $user['id'], 'HRM', 'CLOCK_OUT', (int) $staffId, null, $data);
Response::success([], 'Clock-out recorded');
}
public function absences(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'HR']);
$stmt = Database::connection()->query(
"SELECT
ar.*,
u.full_name AS staff_name,
reporter.full_name AS reported_by_name
FROM absence_reports ar
JOIN users u ON u.id = ar.staff_id
LEFT JOIN users reporter ON reporter.id = ar.reported_by
ORDER BY ar.absence_date DESC"
);
Response::success(['absences' => $stmt->fetchAll()]);
}
public function createAbsence(): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'HR']);
$data = Request::body();
$stmt = Database::connection()->prepare(
'INSERT INTO absence_reports
(staff_id, duty_roster_id, absence_date, absence_reason, absence_status, reported_by)
VALUES (:staff_id, :duty_roster_id, :absence_date, :reason, :status, :reported_by)'
);
$stmt->execute([
'staff_id' => $data['staff_id'],
'duty_roster_id' => $data['duty_roster_id'] ?? null,
'absence_date' => $data['absence_date'],
'reason' => $data['absence_reason'] ?? null,
'status' => $data['absence_status'] ?? 'REPORTED',
'reported_by' => $user['id'],
]);
AuditLogger::log((int) $user['id'], 'HRM', 'CREATE_ABSENCE_REPORT', (int) $data['staff_id'], null, $data);
Response::success([], 'Absence report created');
}
public function payrollPlaceholders(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'HR', 'ACCOUNTANT']);
$stmt = Database::connection()->query(
"SELECT
pp.*,
u.full_name AS staff_name,
u.role
FROM payroll_placeholders pp
JOIN users u ON u.id = pp.staff_id
ORDER BY pp.payroll_month DESC"
);
Response::success(['payroll_placeholders' => $stmt->fetchAll()]);
}
public function createPayrollPlaceholder(): void


{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'HR', 'ACCOUNTANT']);
$data = Request::body();
$gross = (float) ($data['base_pay'] ?? 0) + (float) ($data['bonus_pay'] ?? 0);
$deductions = (float) ($data['lateness_deduction'] ?? 0) + (float) ($data['absence_deduction'] ?? 0);
$net = $gross - $deductions;
$stmt = Database::connection()->prepare(
'INSERT INTO payroll_placeholders
(staff_id, payroll_month, base_pay, bonus_pay, lateness_deduction,
absence_deduction, gross_pay, net_pay, payroll_status, notes)
VALUES
(:staff_id, :payroll_month, :base_pay, :bonus_pay, :lateness_deduction,
:absence_deduction, :gross_pay, :net_pay, :status, :notes)'
);
$stmt->execute([
'staff_id' => $data['staff_id'],
'payroll_month' => $data['payroll_month'],
'base_pay' => $data['base_pay'] ?? 0,
'bonus_pay' => $data['bonus_pay'] ?? 0,
'lateness_deduction' => $data['lateness_deduction'] ?? 0,
'absence_deduction' => $data['absence_deduction'] ?? 0,
'gross_pay' => $gross,
'net_pay' => $net,
'status' => $data['payroll_status'] ?? 'DRAFT',
'notes' => $data['notes'] ?? null,
]);
AuditLogger::log((int) $user['id'], 'HRM', 'CREATE_PAYROLL_PLACEHOLDER', (int) $data['staff_id'], null,
$data);
Response::success([], 'Payroll placeholder created');
}
public function complianceDashboard(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'HR']);
$db = Database::connection();
$todayAttendance = $db->query(
"SELECT COUNT(*) AS total
FROM staff_attendance
WHERE attendance_date = CURDATE()"
)->fetch();
$lateToday = $db->query(
"SELECT COUNT(*) AS total
FROM staff_attendance
WHERE attendance_date = CURDATE()
AND attendance_status = 'LATE'"
)->fetch();
$absencesToday = $db->query(
"SELECT COUNT(*) AS total
FROM absence_reports
WHERE absence_date = CURDATE()"
)->fetch();
$scheduledToday = $db->query(
"SELECT COUNT(*) AS total
FROM duty_rosters
WHERE duty_date = CURDATE()"
)->fetch();
$payrollDrafts = $db->query(
"SELECT COUNT(*) AS total
FROM payroll_placeholders
WHERE payroll_status = 'DRAFT'"
)->fetch();
Response::success([
'scheduled_today' => (int) $scheduledToday['total'],
'clocked_in_today' => (int) $todayAttendance['total'],
'late_today' => (int) $lateToday['total'],
'absences_today' => (int) $absencesToday['total'],
'payroll_drafts' => (int) $payrollDrafts['total'],
]);
}

}