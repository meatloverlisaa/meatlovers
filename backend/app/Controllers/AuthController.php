<?php
declare(strict_types=1);
namespace Controllers;
use Support\Database;
use Support\Request;
use Support\Response;
class AuthController
{
public function login(): void
{
$email = Request::input('email');
$password = Request::input('password');
$stmt = Database::connection()->prepare(
'SELECT * FROM users WHERE email = :email AND is_active = 1 LIMIT 1'
);
$stmt->execute(['email' => $email]);
$user = $stmt->fetch();
if (!$user || !password_verify($password, $user['password_hash'])) {
Response::error('Invalid login credentials', 401);
}
Response::success([
'token' => base64_encode($user['id'] . '|' . time()),
'user' => [
'id' => $user['id'],
'full_name' => $user['full_name'],
'email' => $user['email'],
'role' => $user['role'],
],
], 'Login successful');
}
}
