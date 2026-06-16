<?php
declare(strict_types=1);
namespace Support;
class Auth
{
public static function user(): ?array
{
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;
if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
return null;
}
$token = trim(str_replace('Bearer ', '', $authHeader));
$decoded = base64_decode($token);
if (!$decoded || !str_contains($decoded, '|')) {
return null;
}
[$userId] = explode('|', $decoded);
$stmt = Database::connection()->prepare(
'SELECT id, full_name, email, phone, role, is_active
FROM users
WHERE id = :id AND is_active = 1
LIMIT 1'
);
$stmt->execute(['id' => $userId]);
$user = $stmt->fetch();
return $user ?: null;
}
public static function requireAuth(): array
{
$user = self::user();
if (!$user) {
Response::error('Authentication required', 401);
}
return $user;
}
public static function requireRole(array $allowedRoles): array
{
$user = self::requireAuth();
if (!in_array($user['role'], $allowedRoles, true)) {
Response::error('Permission denied', 403);
}
return $user;
}
}
