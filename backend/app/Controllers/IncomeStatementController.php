<?php
declare(strict_types=1);
namespace Controllers;
use Support\Auth;
use Support\Database;
use Support\Response;
class IncomeStatementController
{
public function daily(): void
{
$this->statement("DATE(created_at) = CURDATE()", 'Daily income statement');
}
public function weekly(): void
{


$this->statement("YEARWEEK(created_at, 1) = YEARWEEK(CURDATE(), 1)", 'Weekly income statement');
}
public function monthly(): void
{
$this->statement("YEAR(created_at) = YEAR(CURDATE()) AND MONTH(created_at) = MONTH(CURDATE())",
'Monthly income statement');
}
public function annual(): void
{
$this->statement("YEAR(created_at) = YEAR(CURDATE())", 'Annual income statement');
}
private function statement(string $where, string $label): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT']);
$db = Database::connection();
$income = $db->query(
"SELECT COALESCE(SUM(amount), 0) AS total
FROM finance_transactions
WHERE transaction_type = 'INCOME'
AND $where"
)->fetch();
$expenses = $db->query(
"SELECT COALESCE(SUM(amount), 0) AS total
FROM finance_transactions
WHERE transaction_type = 'EXPENSE'
AND $where"
)->fetch();
$sales = $db->query(
"SELECT COALESCE(SUM(total_amount), 0) AS total
FROM orders
WHERE order_status = 'PAID'
AND $where"
)->fetch();
$totalIncome = (float) $income['total'] + (float) $sales['total'];
$totalExpenses = (float) $expenses['total'];
$profit = $totalIncome - $totalExpenses;
Response::success([
'label' => $label,
'sales_income' => (float) $sales['total'],
'other_income' => (float) $income['total'],
'total_income' => $totalIncome,
'total_expenses' => $totalExpenses,
'net_profit' => $profit,
]);
}

public function snapshotDaily(): void
{
$this->snapshot('DAILY', date('Y-m-d'), date('Y-m-d'));
}
public function snapshotWeekly(): void
{
$start = date('Y-m-d', strtotime('monday this week'));
$end = date('Y-m-d', strtotime('sunday this week'));
$this->snapshot('WEEKLY', $start, $end);
}


public function snapshotMonthly(): void
{
$start = date('Y-m-01');
$end = date('Y-m-t');
$this->snapshot('MONTHLY', $start, $end);
}
public function snapshotAnnual(): void
{
$start = date('Y-01-01');
$end = date('Y-12-31');
$this->snapshot('ANNUAL', $start, $end);
}
public function snapshots(): void
{
Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT']);
$stmt = Database::connection()->query(
'SELECT * FROM income_statement_snapshots ORDER BY created_at DESC'
);
Response::success(['income_statement_snapshots' => $stmt->fetchAll()]);
}
private function snapshot(string $period, string $start, string $end): void
{
$user = Auth::requireRole(['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'ACCOUNTANT']);
$db = Database::connection();
$sales = $this->salesSplit($start, $end);
$otherIncome = $this->otherIncome($start, $end);
$expenses = $this->expenses($start, $end);
$foodSales = (float) ($sales['FOOD']['sales'] ?? 0);
$softSales = (float) ($sales['SOFT_DRINK']['sales'] ?? 0);
$alcoholSales = (float) ($sales['ALCOHOLIC_DRINK']['sales'] ?? 0);
$foodCost = (float) ($sales['FOOD']['cost'] ?? 0);
$softCost = (float) ($sales['SOFT_DRINK']['cost'] ?? 0);
$alcoholCost = (float) ($sales['ALCOHOLIC_DRINK']['cost'] ?? 0);
$totalSales = $foodSales + $softSales + $alcoholSales;
$totalCost = $foodCost + $softCost + $alcoholCost;
$totalIncome = $totalSales + $otherIncome;
$grossProfit = $totalSales - $totalCost;
$netProfit = $totalIncome - $totalCost - $expenses;
$stmt = $db->prepare(
'INSERT INTO income_statement_snapshots
(statement_period, period_start, period_end,
food_sales, soft_drinks_sales, alcoholic_drinks_sales,
total_sales, other_income, total_income,
food_cost, soft_drinks_cost, alcoholic_drinks_cost,
total_cost_of_goods, total_expenses, gross_profit, net_profit, created_by)
VALUES
(:period, :start, :end,
:food_sales, :soft_sales, :alcohol_sales,
:total_sales, :other_income, :total_income,
:food_cost, :soft_cost, :alcohol_cost,
:total_cost, :expenses, :gross_profit, :net_profit, :created_by)'
);
$stmt->execute([
'period' => $period,
'start' => $start,
'end' => $end,
'food_sales' => $foodSales,
'soft_sales' => $softSales,
'alcohol_sales' => $alcoholSales,
'total_sales' => $totalSales,
'other_income' => $otherIncome,
'total_income' => $totalIncome,
'food_cost' => $foodCost,
'soft_cost' => $softCost,
'alcohol_cost' => $alcoholCost,
'total_cost' => $totalCost,
'expenses' => $expenses,
'gross_profit' => $grossProfit,
'net_profit' => $netProfit,
'created_by' => $user['id'],
]);
Response::success([], $period . ' income statement snapshot created');


}
private function salesSplit(string $start, string $end): array
{
$stmt = Database::connection()->prepare(
"SELECT
p.product_category,
SUM(oi.total_price) AS sales,
SUM(oi.quantity * p.cost_price) AS cost
FROM order_items oi
JOIN products p ON p.id = oi.product_id
JOIN orders o ON o.id = oi.order_id
WHERE o.order_status = 'PAID'
AND DATE(o.created_at) BETWEEN :start AND :end
GROUP BY p.product_category"
);
$stmt->execute([
'start' => $start,
'end' => $end,
]);
$rows = $stmt->fetchAll();
$result = [];
foreach ($rows as $row) {
$result[$row['product_category']] = $row;
}
return $result;
}
private function otherIncome(string $start, string $end): float
{
$stmt = Database::connection()->prepare(
"SELECT COALESCE(SUM(amount), 0) AS total
FROM finance_transactions
WHERE transaction_type = 'INCOME'
AND DATE(created_at) BETWEEN :start AND :end"
);
$stmt->execute([
'start' => $start,
'end' => $end,
]);
$row = $stmt->fetch();
return (float) $row['total'];
}
private function expenses(string $start, string $end): float
{
$stmt = Database::connection()->prepare(
"SELECT COALESCE(SUM(amount), 0) AS total
FROM finance_transactions
WHERE transaction_type = 'EXPENSE'
AND DATE(created_at) BETWEEN :start AND :end"
);
$stmt->execute([
'start' => $start,
'end' => $end,
]);
$row = $stmt->fetch();
return (float) $row['total'];
}

}