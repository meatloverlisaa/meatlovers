<?php
declare(strict_types=1);
use Support\Database;
Database::configure([
'host' => $_ENV['DB_HOST'] ?? '127.0.0.1',
'port' => $_ENV['DB_PORT'] ?? '3306',
'database' => $_ENV['DB_DATABASE'] ?? 'meat_lovers_cims',
'username' => $_ENV['DB_USERNAME'] ?? 'root',
'password' => $_ENV['DB_PASSWORD'] ?? '',
]);
