<?php
declare(strict_types=1);
namespace Controllers;
use Support\Database;
use Support\Request;
use Support\Response;
class SuppliersController
{
public function index(): void
{
$stmt = Database::connection()->query(
'SELECT * FROM suppliers ORDER BY created_at DESC'
);
Response::success(['suppliers' => $stmt->fetchAll()]);
}
public function store(): void
{
$data = Request::body();
$stmt = Database::connection()->prepare(
'INSERT INTO suppliers
(supplier_name, contact_person, phone, email, physical_address, supplier_type, status)
VALUES (:name, :contact, :phone, :email, :address, :type, :status)'
);
$stmt->execute([


'name' => $data['supplier_name'],
'contact' => $data['contact_person'] ?? null,
'phone' => $data['phone'] ?? null,
'email' => $data['email'] ?? null,
'address' => $data['physical_address'] ?? null,
'type' => $data['supplier_type'],
'status' => $data['status'] ?? 'ACTIVE',
]);
Response::success([], 'Supplier created');
}
}
