<?php
declare(strict_types=1);
require_once __DIR__ . '/../bootstrap/app.php';
$router = require __DIR__ . '/../routes/api.php';
$router->dispatch(
$_SERVER['REQUEST_METHOD'],
parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH)
);
