<?php
declare(strict_types=1);
namespace Support;
class ApprovalEnforcer
{
public static function createRequest(
int $requestedBy,
string $type,
?int $referenceId,
string $reason,
array $requestData = []
): int {
$stmt = Database::connection()->prepare(
'INSERT INTO approval_requests
(requested_by, approval_type, reference_id, request_reason, request_data, approval_status)
VALUES (:requested_by, :type, :reference_id, :reason, :request_data, "PENDING")'
);
$stmt->execute([
'requested_by' => $requestedBy,
'type' => $type,
'reference_id' => $referenceId,
'reason' => $reason,
'request_data' => json_encode($requestData),
]);
return (int) Database::connection()->lastInsertId();
}
public static function requireApproved(string $type, int $referenceId): void
{
$stmt = Database::connection()->prepare(
'SELECT id FROM approval_requests
WHERE approval_type = :type
AND reference_id = :reference_id
AND approval_status = "APPROVED"
LIMIT 1'
);
$stmt->execute([
'type' => $type,
'reference_id' => $referenceId,
]);
if (!$stmt->fetch()) {
Response::error('Approved request required before this action can proceed', 403);
}
}
}
