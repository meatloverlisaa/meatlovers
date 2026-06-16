<?php
declare(strict_types=1);

// Load .env file from the root directory
$envPath = __DIR__ . '/../../.env';
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || strpos($line, '#') === 0) {
            continue;
        }
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);
            // Remove quotes if present
            $value = preg_replace('/^[\'"]([\s\S]*)[\'"]$/', '$1', $value);
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
            putenv("{$name}={$value}");
        }
    }
}

spl_autoload_register(function ($class) {
    $baseDir = __DIR__ . '/../app/';
    $class = str_replace('\\', '/', $class);
    $file = $baseDir . $class . '.php';
    if (file_exists($file)) {
        require_once $file;
    }
});
require_once __DIR__ . '/../config/database.php';
header('Content-Type: application/json');

