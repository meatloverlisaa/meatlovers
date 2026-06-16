<?php
declare(strict_types=1);
namespace Support;
class AuditLogger
{
public static function log(
?int $userId,
string $module,
string $action,
?int $entityId = null,
?array $oldData = null,
?array $newData = null
): void {
$stmt = Database::connection()->prepare(
'INSERT INTO audit_logs
(user_id, module_name, action_name, entity_id, old_data, new_data, ip_address)
VALUES (:user_id, :module, :action, :entity_id, :old_data, :new_data, :ip)'
);
$stmt->execute([
'user_id' => $userId,
'module' => $module,
'action' => $action,
'entity_id' => $entityId,
'old_data' => $oldData ? json_encode($oldData) : null,
'new_data' => $newData ? json_encode($newData) : null,
'ip' => $_SERVER['REMOTE_ADDR'] ?? null,
]);
}
}
