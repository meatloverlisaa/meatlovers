<?php
declare(strict_types=1);
namespace Support;
class Request
{
public static function body(): array
{
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
return is_array($data) ? $data : [];
}
public static function input(string $key, mixed $default = null): mixed
{
$body = self::body();
return $body[$key] ?? $_POST[$key] ?? $_GET[$key] ?? $default;
}
}
