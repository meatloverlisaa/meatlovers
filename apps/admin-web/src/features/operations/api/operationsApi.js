import apiClient from '../../../lib/apiClient'
export const operationsApi = {
suppliers: async () => {
const { data } = await apiClient.get('/suppliers')
return data.data.suppliers
},
products: async () => {
const { data } = await apiClient.get('/products')
return data.data.products
},
stock: async () => {
const { data } = await apiClient.get('/inventory/stock-summary')
return data.data.stock
},
barStock: async () => {
const { data } = await apiClient.get('/bar/stock')
return data.data.bar_stock
},
kitchenOrders: async () => {
const { data } = await apiClient.get('/kitchen/orders')
return data.data.kitchen_orders
},
dispatchOrders: async () => {


const { data } = await apiClient.get('/dispatch/orders')
return data.data.deliveries
},
unsoldFood: async () => {
const { data } = await apiClient.get('/unsold-food')
return data.data.unsold_food
},
assets: async () => {
const { data } = await apiClient.get('/assets')
return data.data.assets
},
staff: async () => {
const { data } = await apiClient.get('/hrm/staff')
return data.data.staff
},
financeTransactions: async () => {
const { data } = await apiClient.get('/finance/transactions')
return data.data.finance_transactions
},
incomeStatementDaily: async () => {
const { data } = await apiClient.get('/income-statement/daily')
return data.data
},
incomeStatementWeekly: async () => {
const { data } = await apiClient.get('/income-statement/weekly')
return data.data
},
incomeStatementMonthly: async () => {
const { data } = await apiClient.get('/income-statement/monthly')
return data.data
},
  incomeStatementAnnual: async () => {
    const { data } = await apiClient.get('/income-statement/annual')
    return data.data
  },
  createSupplier: async (payload) => {
const { data } = await apiClient.post('/suppliers', payload)
return data
},
createProduct: async (payload) => {
const { data } = await apiClient.post('/products', payload)
return data
},
stockIn: async (payload) => {
const { data } = await apiClient.post('/inventory/stock-in', payload)
return data
},
barStockIssue: async (payload) => {
const { data } = await apiClient.post('/bar/stock-issue', payload)
return data
},
markKitchenReady: async (orderId) => {
const { data } = await apiClient.post(`/kitchen/orders/${orderId}/mark-ready`, {})
return data
},
dispatchOrder: async (orderId, payload) => {
const { data } = await apiClient.post(`/dispatch/orders/${orderId}/dispatch`, payload)
return data
},
markDelivered: async (orderId) => {
const { data } = await apiClient.post(`/dispatch/orders/${orderId}/deliver`, {})
return data
},
declareUnsoldFood: async (payload) => {
const { data } = await apiClient.post('/unsold-food', payload)
return data
},
createAsset: async (payload) => {
const { data } = await apiClient.post('/assets', payload)
return data
},
createStaff: async (payload) => {
const { data } = await apiClient.post('/hrm/staff', payload)
return data
},
createFinanceTransaction: async (payload) => {
const { data } = await apiClient.post('/finance/transactions', payload)
return data
},

financeCategories: async () => {
const { data } = await apiClient.get('/finance/categories')
return data.data.finance_categories
},
createFinanceCategory: async (payload) => {
const { data } = await apiClient.post('/finance/categories', payload)
return data


},
profitabilitySplit: async () => {
const { data } = await apiClient.get('/finance/profitability-split')
return data.data.profitability_split
},
createReconciliation: async (payload) => {
const { data } = await apiClient.post('/finance/reconciliations', payload)
return data
},
reconciliations: async () => {
const { data } = await apiClient.get('/finance/reconciliations')
return data.data.cashier_reconciliations
},
varianceAlerts: async () => {
const { data } = await apiClient.get('/finance/variance-alerts')
return data.data.variance_alerts
},
incomeStatementSnapshots: async () => {
const { data } = await apiClient.get('/income-statement/snapshots')
return data.data.income_statement_snapshots
},
snapshotDaily: async () => {
const { data } = await apiClient.post('/income-statement/snapshot/daily', {})
return data
},
snapshotWeekly: async () => {
const { data } = await apiClient.post('/income-statement/snapshot/weekly', {})
return data
},
snapshotMonthly: async () => {
const { data } = await apiClient.post('/income-statement/snapshot/monthly', {})
return data
},
snapshotAnnual: async () => {
const { data } = await apiClient.post('/income-statement/snapshot/annual', {})
return data
},

createDeliveryOrder: async (payload) => {
const { data } = await apiClient.post('/deliveries', payload)
return data
},
riders: async () => {
const { data } = await apiClient.get('/riders')
return data.data.riders
},
createRider: async (payload) => {
const { data } = await apiClient.post('/riders', payload)
return data
},
assignRider: async (orderId, payload) => {
const { data } = await apiClient.post(`/dispatch/orders/${orderId}/assign-rider`, payload)
return data
},
failDelivery: async (orderId, payload) => {
const { data } = await apiClient.post(`/dispatch/orders/${orderId}/fail`, payload)
return data
},
deliveryPerformanceReport: async () => {
const { data } = await apiClient.get('/dispatch/performance-report')
return data.data.delivery_performance
},

supplierInvoices: async () => {
const { data } = await apiClient.get('/storekeeping/supplier-invoices')
return data.data.supplier_invoices
},
createSupplierInvoice: async (payload) => {
const { data } = await apiClient.post('/storekeeping/supplier-invoices', payload)
return data
},
approveSupplierInvoice: async (id) => {
const { data } = await apiClient.post(`/storekeeping/supplier-invoices/${id}/approve`, {})
return data
},
rejectSupplierInvoice: async (id) => {
const { data } = await apiClient.post(`/storekeeping/supplier-invoices/${id}/reject`, {})
return data
},
receivingNotes: async () => {
const { data } = await apiClient.get('/storekeeping/receiving-notes')
return data.data.receiving_notes
},
createReceivingNote: async (payload) => {
const { data } = await apiClient.post('/storekeeping/receiving-notes', payload)
return data
},
receiveStockFromNote: async (id) => {
const { data } = await apiClient.post(`/storekeeping/receiving-notes/${id}/receive`, {})


return data
},
stockTransfers: async () => {
const { data } = await apiClient.get('/storekeeping/stock-transfers')
return data.data.stock_transfers
},
createStockTransfer: async (payload) => {
const { data } = await apiClient.post('/storekeeping/stock-transfers', payload)
return data
},
approveStockTransfer: async (id) => {
const { data } = await apiClient.post(`/storekeeping/stock-transfers/${id}/approve`, {})
return data
},
stockMovementReport: async () => {
const { data } = await apiClient.get('/storekeeping/stock-movement-report')
return data.data.stock_movement_report
},
supplierPerformanceReport: async () => {
const { data } = await apiClient.get('/storekeeping/supplier-performance-report')
return data.data.supplier_performance_report
},

recipes: async () => {
const { data } = await apiClient.get('/production/recipes')
return data.data.recipes
},
createRecipe: async (payload) => {
const { data } = await apiClient.post('/production/recipes', payload)
return data
},
productionPlans: async () => {
const { data } = await apiClient.get('/production/plans')
return data.data.production_plans
},
createProductionPlan: async (payload) => {
const { data } = await apiClient.post('/production/plans', payload)
return data
},
startProductionPlan: async (id) => {
const { data } = await apiClient.post(`/production/plans/${id}/start`, {})
return data
},
completeProductionPlan: async (id, payload) => {
const { data } = await apiClient.post(`/production/plans/${id}/complete`, payload)


return data
},
recordIngredientConsumption: async (payload) => {
const { data } = await apiClient.post('/production/ingredient-consumption', payload)
return data
},
recordWastage: async (payload) => {
const { data } = await apiClient.post('/production/wastage', payload)
return data
},
foodCostReport: async () => {
const { data } = await apiClient.get('/production/food-cost-report')
return data.data.food_cost_report
},
menuEngineeringReport: async () => {
const { data } = await apiClient.get('/production/menu-engineering-report')
return data.data.menu_engineering_report
},

pricingRules: async () => {
const { data } = await apiClient.get('/pricing/rules')
return data.data.pricing_rules
},
createPricingRule: async (payload) => {
const { data } = await apiClient.post('/pricing/rules', payload)
return data
},
categoryDashboard: async (id) => {
const { data } = await apiClient.get(`/pricing/category-dashboard/${id}`)
return data.data
},
updateProductPrice: async (id, payload) => {
const { data } = await apiClient.post(`/products/${id}/update-price`, payload)
return data
},
deactivateProduct: async (id) => {
const { data } = await apiClient.post(`/products/${id}/deactivate`, {})
return data
},
activateProduct: async (id) => {
const { data } = await apiClient.post(`/products/${id}/activate`, {})
return data
},
priceChangeAudit: async () => {
const { data } = await apiClient.get('/products/price-change-audit')
return data.data.price_change_audit
},
marginAlerts: async () => {
const { data } = await apiClient.get('/products/margin-alerts')


return data.data.margin_alerts
},
generateMarginAlerts: async () => {
const { data } = await apiClient.post('/products/margin-alerts/generate', {})
return data
},

customerSegments: async () => {
const { data } = await apiClient.get('/crm/customer-segments')
return data.data.customer_segments
},
visitHistory: async () => {
const { data } = await apiClient.get('/crm/visit-history')
return data.data.visit_history
},
recordVisit: async (payload) => {
const { data } = await apiClient.post('/crm/visit-history', payload)
return data
},
loyaltyTransactions: async () => {
const { data } = await apiClient.get('/crm/loyalty-transactions')
return data.data.loyalty_transactions
},
recordLoyaltyTransaction: async (payload) => {
const { data } = await apiClient.post('/crm/loyalty-transactions', payload)
return data
},
followUps: async () => {
const { data } = await apiClient.get('/crm/follow-ups')
return data.data.follow_ups


},
createFollowUp: async (payload) => {
const { data } = await apiClient.post('/crm/follow-ups', payload)
return data
},
updateFollowUpStatus: async (id, payload) => {
const { data } = await apiClient.post(`/crm/follow-ups/${id}/status`, payload)
return data
},
generateAbandonedLeadFollowUps: async () => {
const { data } = await apiClient.post('/crm/generate-abandoned-lead-followups', {})
return data
},
generateReminderPlaceholders: async () => {
const { data } = await apiClient.post('/crm/generate-reminder-placeholders', {})
return data
},
repeatCustomerDashboard: async () => {
const { data } = await apiClient.get('/crm/repeat-customer-dashboard')
return data.data
},

assetAssignments: async () => {
const { data } = await apiClient.get('/assets/assignments')
return data.data.asset_assignments
},
createAssetAssignment: async (payload) => {
const { data } = await apiClient.post('/assets/assignments', payload)
return data
},
assetMaintenanceSchedules: async () => {
const { data } = await apiClient.get('/assets/maintenance-schedules')
return data.data.maintenance_schedules
},
createAssetMaintenanceSchedule: async (payload) => {
const { data } = await apiClient.post('/assets/maintenance-schedules', payload)
return data
},
completeAssetMaintenanceSchedule: async (id) => {
const { data } = await apiClient.post(`/assets/maintenance-schedules/${id}/complete`, {})
return data


},
assetRepairLogs: async () => {
const { data } = await apiClient.get('/assets/repair-logs')
return data.data.repair_logs
},
createAssetRepairLog: async (payload) => {
const { data } = await apiClient.post('/assets/repair-logs', payload)
return data
},
assetDamageReports: async () => {
const { data } = await apiClient.get('/assets/damage-reports')
return data.data.damage_reports
},
createAssetDamageReport: async (payload) => {
const { data } = await apiClient.post('/assets/damage-reports', payload)
return data
},
assetWriteoffRequests: async () => {
const { data } = await apiClient.get('/assets/writeoff-requests')
return data.data.writeoff_requests
},
createAssetWriteoffRequest: async (payload) => {
const { data } = await apiClient.post('/assets/writeoff-requests', payload)
return data
},
approveAssetWriteoffRequest: async (id) => {
const { data } = await apiClient.post(`/assets/writeoff-requests/${id}/approve`, {})
return data
},
applyAssetWriteoffRequest: async (id) => {
const { data } = await apiClient.post(`/assets/writeoff-requests/${id}/apply`, {})
return data
},
assetLifecycleDashboard: async () => {
const { data } = await apiClient.get('/assets/lifecycle-dashboard')
return data.data
},

hrmShifts: async () => {
const { data } = await apiClient.get('/hrm/shifts')
return data.data.shifts
},
createHrmShift: async (payload) => {
const { data } = await apiClient.post('/hrm/shifts', payload)
return data
},
dutyRosters: async () => {
const { data } = await apiClient.get('/hrm/duty-rosters')
return data.data.duty_rosters
},
createDutyRoster: async (payload) => {
const { data } = await apiClient.post('/hrm/duty-rosters', payload)
return data
},
attendance: async () => {
const { data } = await apiClient.get('/hrm/attendance')
return data.data.attendance
},
clockIn: async (payload) => {
const { data } = await apiClient.post('/hrm/attendance/clock-in', payload)
return data
},
clockOut: async (payload) => {
const { data } = await apiClient.post('/hrm/attendance/clock-out', payload)
return data
},
absences: async () => {
const { data } = await apiClient.get('/hrm/absences')
return data.data.absences
},
createAbsence: async (payload) => {
const { data } = await apiClient.post('/hrm/absences', payload)
return data
},
payrollPlaceholders: async () => {
const { data } = await apiClient.get('/hrm/payroll-placeholders')
return data.data.payroll_placeholders
},
createPayrollPlaceholder: async (payload) => {
const { data } = await apiClient.post('/hrm/payroll-placeholders', payload)
return data
},
hrmComplianceDashboard: async () => {
const { data } = await apiClient.get('/hrm/compliance-dashboard')
return data.data
},

enforcementDashboard: async () => {
const { data } = await apiClient.get('/enforcement/dashboard')
return data.data
},


staffIncidents: async () => {
const { data } = await apiClient.get('/enforcement/staff-incidents')
return data.data.staff_incidents
},
createStaffIncident: async (payload) => {
const { data } = await apiClient.post('/enforcement/staff-incidents', payload)
return data
},
riskScores: async () => {
const { data } = await apiClient.get('/enforcement/risk-scores')
return data.data.risk_scores
},
generateRiskScores: async () => {
const { data } = await apiClient.post('/enforcement/generate-risk-scores', {})
return data
},
enforcementActions: async () => {
const { data } = await apiClient.get('/enforcement/actions')
return data.data.enforcement_actions
},
createEnforcementAction: async (payload) => {
const { data } = await apiClient.post('/enforcement/actions', payload)
return data
},
enforcementAuditFeed: async () => {
const { data } = await apiClient.get('/enforcement/audit-feed')
return data.data.audit_feed
},

}
