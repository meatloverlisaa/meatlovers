<?php


declare(strict_types=1);
namespace Controllers;
use Support\Auth;
use Support\Database;
use Support\Request;
use Support\Response;
use Support\AuditLogger;
class FinanceController
{
public function index(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT']);
$stmt = Database::connection()->query(
"SELECT
ft.*,
u.full_name AS created_by_name
FROM finance_transactions ft
LEFT JOIN users u ON u.id = ft.created_by
ORDER BY ft.created_at DESC"
);
Response::success(['finance_transactions' => $stmt->fetchAll()]);
}
public function store(): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT']);
$data = Request::body();
$stmt = Database::connection()->prepare(
'INSERT INTO finance_transactions
(transaction_type, category, amount, reference_number, notes, created_by)
VALUES (:type, :category, :amount, :reference, :notes, :created_by)'
);
$stmt->execute([
'type' => $data['transaction_type'],
'category' => $data['category'] ?? null,
'amount' => $data['amount'],
'reference' => $data['reference_number'] ?? null,
'notes' => $data['notes'] ?? null,
'created_by' => $user['id'],
]);
AuditLogger::log(
(int) $user['id'],
'FINANCE',
'CREATE_FINANCE_TRANSACTION',
null,
null,
$data
);
Response::success([], 'Finance transaction created');
}

public function categories(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT']);
$stmt = Database::connection()->query(
'SELECT * FROM finance_categories ORDER BY category_type, category_name ASC'
);
Response::success(['finance_categories' => $stmt->fetchAll()]);
}
public function storeCategory(): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT']);
$data = Request::body();
$stmt = Database::connection()->prepare(
'INSERT INTO finance_categories
(category_name, category_type, description, is_active)
VALUES (:name, :type, :description, 1)'
);
$stmt->execute([
'name' => $data['category_name'],
'type' => $data['category_type'],
'description' => $data['description'] ?? null,
]);
AuditLogger::log(
(int) $user['id'],
'FINANCE',
'CREATE_FINANCE_CATEGORY',


null,
null,
$data
);
Response::success([], 'Finance category created');
}
public function profitabilitySplit(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT']);
$stmt = Database::connection()->query(
"SELECT
p.product_category,
SUM(oi.total_price) AS sales,
SUM(oi.quantity * p.cost_price) AS cost,
SUM(oi.total_price) - SUM(oi.quantity * p.cost_price) AS gross_profit
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN orders o ON o.id = oi.order_id
WHERE o.order_status = 'PAID'
GROUP BY p.product_category"
);
Response::success(['profitability_split' => $stmt->fetchAll()]);
}
public function storeReconciliation(): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT', 'CASHIER']);
$data = Request::body();
$expectedCash = (float) ($data['expected_cash'] ?? 0);
$declaredCash = (float) ($data['declared_cash'] ?? 0);
$expectedMpesa = (float) ($data['expected_mpesa'] ?? 0);
$confirmedMpesa = (float) ($data['confirmed_mpesa'] ?? 0);
$cashVariance = $declaredCash - $expectedCash;
$mpesaVariance = $confirmedMpesa - $expectedMpesa;
$status = ($cashVariance == 0.0 && $mpesaVariance == 0.0)
? 'BALANCED'
: 'VARIANCE_FOUND';
$stmt = Database::connection()->prepare(
'INSERT INTO cashier_reconciliations
(cashier_id, reconciliation_date, expected_cash, declared_cash, variance_amount,
expected_mpesa, confirmed_mpesa, mpesa_variance, reconciliation_status, notes, created_by)
VALUES
(:cashier_id, :reconciliation_date, :expected_cash, :declared_cash, :variance_amount,
:expected_mpesa, :confirmed_mpesa, :mpesa_variance, :status, :notes, :created_by)'
);
$stmt->execute([
'cashier_id' => $data['cashier_id'],
'reconciliation_date' => $data['reconciliation_date'],
'expected_cash' => $expectedCash,
'declared_cash' => $declaredCash,
'variance_amount' => $cashVariance,
'expected_mpesa' => $expectedMpesa,
'confirmed_mpesa' => $confirmedMpesa,
'mpesa_variance' => $mpesaVariance,
'status' => $status,
'notes' => $data['notes'] ?? null,
'created_by' => $user['id'],
]);
$reconciliationId = (int) Database::connection()->lastInsertId();
if ($cashVariance != 0.0) {
$this->createVarianceAlert(
$cashVariance < 0 ? 'CASH_SHORTAGE' : 'CASH_EXCESS',
$reconciliationId,
$cashVariance,
'Cash reconciliation variance detected'
);
}
if ($mpesaVariance != 0.0) {
$this->createVarianceAlert(
'MPESA_MISMATCH',
$reconciliationId,
$mpesaVariance,
'M-Pesa reconciliation variance detected'
);
}


AuditLogger::log(
(int) $user['id'],
'FINANCE',
'CREATE_CASHIER_RECONCILIATION',
$reconciliationId,
null,
$data
);
Response::success([
'reconciliation_id' => $reconciliationId,
'status' => $status,
], 'Cashier reconciliation recorded');
}
public function reconciliations(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT']);
$stmt = Database::connection()->query(
"SELECT
cr.*,
cashier.full_name AS cashier_name,
creator.full_name AS created_by_name
FROM cashier_reconciliations cr
JOIN users cashier ON cashier.id = cr.cashier_id
LEFT JOIN users creator ON creator.id = cr.created_by
ORDER BY cr.created_at DESC"
);
Response::success(['cashier_reconciliations' => $stmt->fetchAll()]);
}
public function varianceAlerts(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT']);
$stmt = Database::connection()->query(
'SELECT * FROM variance_alerts ORDER BY created_at DESC'
);
Response::success(['variance_alerts' => $stmt->fetchAll()]);
}
private function createVarianceAlert(
string $varianceType,
int $referenceId,
float $amount,
string $notes
): void {
$stmt = Database::connection()->prepare(
'INSERT INTO variance_alerts
(variance_type, reference_id, variance_amount, notes)
VALUES (:type, :reference_id, :amount, :notes)'
);
$stmt->execute([
'type' => $varianceType,
'reference_id' => $referenceId,
'amount' => $amount,
'notes' => $notes,
]);
}

}