<?php
declare(strict_types=1);
namespace Support;
class Router
{
private array $routes = [];
public function get(string $path, array $handler): void
{
$this->routes['GET'][$path] = $handler;
}
public function post(string $path, array $handler): void
{
$this->routes['POST'][$path] = $handler;
}
public function dispatch(string $method, string $uri): void
{
$path = str_replace('/backend/public', '', $uri);
foreach ($this->routes[$method] ?? [] as $route => $handler) {
$pattern = preg_replace('/\{[a-zA-Z_]+\}/', '([0-9]+)', $route);
$pattern = '#^' . $pattern . '$#';
if (preg_match($pattern, $path, $matches)) {
array_shift($matches);
[$class, $methodName] = $handler;
$controller = new $class();
call_user_func_array([$controller, $methodName], $matches);
return;
}
}
Response::error('Route not found', 404);
}
}
