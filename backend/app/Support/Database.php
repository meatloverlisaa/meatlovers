<?php
declare(strict_types=1);
namespace Support;
use PDO;
class Database
{
private static array $config;
private static ?PDO $connection = null;
public static function configure(array $config): void
{
self::$config = $config;
}
public static function connection(): PDO
{
if (self::$connection === null) {
$dsn = sprintf(
'mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4',
self::$config['host'],
self::$config['port'],
self::$config['database']
);
self::$connection = new PDO(
$dsn,
self::$config['username'],
self::$config['password'],
[
PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]
);
}
return self::$connection;
}
}
