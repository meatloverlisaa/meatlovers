import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import DashboardLayout from '../layouts/DashboardLayout'
import DashboardPage from '../features/dashboard/pages/DashboardPage'
import LoginPage from '../features/auth/pages/LoginPage'
import NotFound from '../pages/NotFound'

// Batch generated imports
import AbsenceReportsPage from '../features/hrm/pages/AbsenceReportsPage'
import ApprovalHistoryPage from '../features/approvals/pages/ApprovalHistoryPage'
import ApprovalListPage from '../features/approvals/pages/ApprovalListPage'
import ApprovalRulesPage from '../features/approvals/pages/ApprovalRulesPage'
import AssetAssignmentsPage from '../features/assets/pages/AssetAssignmentsPage'
import AssetDamageReportsPage from '../features/assets/pages/AssetDamageReportsPage'
import AssetLifecycleDashboardPage from '../features/assets/pages/AssetLifecycleDashboardPage'
import AssetMaintenancePage from '../features/assets/pages/AssetMaintenancePage'
import AssetRepairLogsPage from '../features/assets/pages/AssetRepairLogsPage'
import AssetWriteoffPage from '../features/assets/pages/AssetWriteoffPage'
import AssetsOperationalPage from '../features/operations/pages/AssetsOperationalPage'
import AttendancePage from '../features/hrm/pages/AttendancePage'
import BarOperationalPage from '../features/operations/pages/BarOperationalPage'
import BonusRulesPage from '../features/staff-motivation/pages/BonusRulesPage'
import CRMActionToolsPage from '../features/crm/pages/CRMActionToolsPage'
import CashierReconciliationPage from '../features/finance/pages/CashierReconciliationPage'
import CategoryDashboardPage from '../features/pricing/pages/CategoryDashboardPage'
import CateringEnquiriesPage from '../features/website/pages/CateringEnquiriesPage'
import CustomerRatingPage from '../features/staff-motivation/pages/CustomerRatingPage'
import CustomerSegmentsPage from '../features/crm/pages/CustomerSegmentsPage'
import DailyTargetsPage from '../features/staff-motivation/pages/DailyTargetsPage'
import DeliveryEnquiriesPage from '../features/website/pages/DeliveryEnquiriesPage'
import DeliveryOrdersPage from '../features/deliveries/pages/DeliveryOrdersPage'
import DeliveryPerformanceReportPage from '../features/deliveries/pages/DeliveryPerformanceReportPage'
import DispatchControlPage from '../features/deliveries/pages/DispatchControlPage'
import DispatchOperationalPage from '../features/operations/pages/DispatchOperationalPage'
import DutyRosterPage from '../features/hrm/pages/DutyRosterPage'
import EnforcementActionsPage from '../features/enforcement/pages/EnforcementActionsPage'
import EnforcementAuditFeedPage from '../features/enforcement/pages/EnforcementAuditFeedPage'
import EnforcementDashboardPage from '../features/enforcement/pages/EnforcementDashboardPage'
import FeedbackPage from '../features/website/pages/FeedbackPage'
import FinanceCategoriesPage from '../features/finance/pages/FinanceCategoriesPage'
import FinanceOperationalPage from '../features/operations/pages/FinanceOperationalPage'
import FollowUpsPage from '../features/crm/pages/FollowUpsPage'
import FoodCostReportPage from '../features/production/pages/FoodCostReportPage'
import HRMComplianceDashboardPage from '../features/hrm/pages/HRMComplianceDashboardPage'
import HRMOperationalPage from '../features/operations/pages/HRMOperationalPage'
import HRMPerformanceReportPage from '../features/staff-motivation/pages/HRMPerformanceReportPage'
import IncomeStatementPage from '../features/operations/pages/IncomeStatementPage'
import IncomeStatementSnapshotsPage from '../features/finance/pages/IncomeStatementSnapshotsPage'
import IngredientConsumptionPage from '../features/production/pages/IngredientConsumptionPage'
import KitchenOperationalPage from '../features/operations/pages/KitchenOperationalPage'
import LoyaltyTransactionsPage from '../features/crm/pages/LoyaltyTransactionsPage'
import MarginAlertsPage from '../features/pricing/pages/MarginAlertsPage'
import MenuEngineeringReportPage from '../features/production/pages/MenuEngineeringReportPage'
import PayrollPlaceholderPage from '../features/hrm/pages/PayrollPlaceholderPage'
import PriceChangeAuditPage from '../features/pricing/pages/PriceChangeAuditPage'
import PricingRulesPage from '../features/pricing/pages/PricingRulesPage'
import ProductActivationControlPage from '../features/pricing/pages/ProductActivationControlPage'
import ProductPriceControlPage from '../features/pricing/pages/ProductPriceControlPage'
import ProductionPlansPage from '../features/production/pages/ProductionPlansPage'
import ProductsOperationalPage from '../features/operations/pages/ProductsOperationalPage'
import ProfitabilitySplitPage from '../features/finance/pages/ProfitabilitySplitPage'
import ReceivingNotesPage from '../features/storekeeping/pages/ReceivingNotesPage'
import RecipesPage from '../features/production/pages/RecipesPage'
import RepeatCustomerDashboardPage from '../features/crm/pages/RepeatCustomerDashboardPage'
import RidersPage from '../features/deliveries/pages/RidersPage'
import RiskScoresPage from '../features/enforcement/pages/RiskScoresPage'
import ShiftsPage from '../features/hrm/pages/ShiftsPage'
import StaffIncidentsPage from '../features/enforcement/pages/StaffIncidentsPage'
import StaffMotivationDashboardPage from '../features/staff-motivation/pages/StaffMotivationDashboardPage'
import StockMovementReportPage from '../features/storekeeping/pages/StockMovementReportPage'
import StockOperationalPage from '../features/operations/pages/StockOperationalPage'
import StockTransfersPage from '../features/storekeeping/pages/StockTransfersPage'
import SupplierInvoicesPage from '../features/storekeeping/pages/SupplierInvoicesPage'
import SupplierPerformanceReportPage from '../features/storekeeping/pages/SupplierPerformanceReportPage'
import SuppliersOperationalPage from '../features/operations/pages/SuppliersOperationalPage'
import UnsoldFoodOperationalPage from '../features/operations/pages/UnsoldFoodOperationalPage'
import VarianceAlertsPage from '../features/finance/pages/VarianceAlertsPage'
import VisitHistoryPage from '../features/crm/pages/VisitHistoryPage'
import WaiterLeaderboardPage from '../features/staff-motivation/pages/WaiterLeaderboardPage'
import WastageControlPage from '../features/production/pages/WastageControlPage'
import WebsiteAcquisitionDashboardPage from '../features/website/pages/WebsiteAcquisitionDashboardPage'
import WebsiteLeadsPage from '../features/website/pages/WebsiteLeadsPage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<DashboardLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/ops/suppliers" element={<SuppliersOperationalPage />} />
        <Route path="/ops/products" element={<ProductsOperationalPage />} />
        <Route path="/ops/stock" element={<StockOperationalPage />} />
        <Route path="/ops/bar" element={<BarOperationalPage />} />
        <Route path="/ops/kitchen" element={<KitchenOperationalPage />} />
        <Route path="/ops/dispatch" element={<DispatchOperationalPage />} />
        <Route path="/ops/unsold-food" element={<UnsoldFoodOperationalPage />} />
        <Route path="/ops/assets" element={<AssetsOperationalPage />} />
        <Route path="/ops/hrm" element={<HRMOperationalPage />} />
        <Route path="/ops/finance" element={<FinanceOperationalPage />} />
        <Route path="/ops/income-statement" element={<IncomeStatementPage />} />
        <Route path="/approvals" element={<ApprovalListPage />} />
        <Route path="/approvals/history" element={<ApprovalHistoryPage />} />
        <Route path="/approvals/rules" element={<ApprovalRulesPage />} />
        <Route path="/finance/categories" element={<FinanceCategoriesPage />} />
        <Route path="/finance/profitability-split" element={<ProfitabilitySplitPage />} />
        <Route path="/finance/reconciliations" element={<CashierReconciliationPage />} />
        <Route path="/finance/variance-alerts" element={<VarianceAlertsPage />} />
        <Route path="/finance/income-statement-snapshots" element={<IncomeStatementSnapshotsPage />} />
        <Route path="/staff-motivation" element={<StaffMotivationDashboardPage />} />
        <Route path="/staff-motivation/leaderboard" element={<WaiterLeaderboardPage />} />
        <Route path="/staff-motivation/customer-ratings" element={<CustomerRatingPage />} />
        <Route path="/staff-motivation/bonus-rules" element={<BonusRulesPage />} />
        <Route path="/staff-motivation/daily-targets" element={<DailyTargetsPage />} />
        <Route path="/staff-motivation/hrm-report" element={<HRMPerformanceReportPage />} />
        <Route path="/deliveries/orders" element={<DeliveryOrdersPage />} />
        <Route path="/deliveries/riders" element={<RidersPage />} />
        <Route path="/deliveries/dispatch-control" element={<DispatchControlPage />} />
        <Route path="/deliveries/performance" element={<DeliveryPerformanceReportPage />} />
        <Route path="/storekeeping/supplier-invoices" element={<SupplierInvoicesPage />} />
        <Route path="/storekeeping/receiving-notes" element={<ReceivingNotesPage />} />
        <Route path="/storekeeping/stock-transfers" element={<StockTransfersPage />} />
        <Route path="/storekeeping/stock-movement-report" element={<StockMovementReportPage />} />
        <Route path="/storekeeping/supplier-performance" element={<SupplierPerformanceReportPage />} />
        <Route path="/production/recipes" element={<RecipesPage />} />
        <Route path="/production/plans" element={<ProductionPlansPage />} />
        <Route path="/production/ingredient-consumption" element={<IngredientConsumptionPage />} />
        <Route path="/production/wastage" element={<WastageControlPage />} />
        <Route path="/production/menu-engineering" element={<MenuEngineeringReportPage />} />
        <Route path="/production/food-cost" element={<FoodCostReportPage />} />
        <Route path="/pricing/rules" element={<PricingRulesPage />} />
        <Route path="/pricing/category-dashboard" element={<CategoryDashboardPage />} />
        <Route path="/pricing/price-control" element={<ProductPriceControlPage />} />
        <Route path="/pricing/product-activation" element={<ProductActivationControlPage />} />
        <Route path="/pricing/price-audit" element={<PriceChangeAuditPage />} />
        <Route path="/pricing/margin-alerts" element={<MarginAlertsPage />} />
        <Route path="/crm/segments" element={<CustomerSegmentsPage />} />
        <Route path="/crm/visit-history" element={<VisitHistoryPage />} />
        <Route path="/crm/loyalty" element={<LoyaltyTransactionsPage />} />
        <Route path="/crm/follow-ups" element={<FollowUpsPage />} />
        <Route path="/crm/repeat-dashboard" element={<RepeatCustomerDashboardPage />} />
        <Route path="/crm/action-tools" element={<CRMActionToolsPage />} />
        <Route path="/assets/lifecycle-dashboard" element={<AssetLifecycleDashboardPage />} />
        <Route path="/assets/assignments" element={<AssetAssignmentsPage />} />
        <Route path="/assets/maintenance" element={<AssetMaintenancePage />} />
        <Route path="/assets/repair-logs" element={<AssetRepairLogsPage />} />
        <Route path="/assets/damage-reports" element={<AssetDamageReportsPage />} />
        <Route path="/assets/writeoff" element={<AssetWriteoffPage />} />
        <Route path="/hrm/compliance-dashboard" element={<HRMComplianceDashboardPage />} />
        <Route path="/hrm/shifts" element={<ShiftsPage />} />
        <Route path="/hrm/duty-roster" element={<DutyRosterPage />} />
        <Route path="/hrm/attendance" element={<AttendancePage />} />
        <Route path="/hrm/absences" element={<AbsenceReportsPage />} />
        <Route path="/hrm/payroll-placeholder" element={<PayrollPlaceholderPage />} />
        <Route path="/enforcement/dashboard" element={<EnforcementDashboardPage />} />
        <Route path="/enforcement/incidents" element={<StaffIncidentsPage />} />
        <Route path="/enforcement/risk-scores" element={<RiskScoresPage />} />
        <Route path="/enforcement/actions" element={<EnforcementActionsPage />} />
        <Route path="/enforcement/audit-feed" element={<EnforcementAuditFeedPage />} />
        <Route path="/website-acquisition" element={<WebsiteAcquisitionDashboardPage />} />
        <Route path="/website-leads" element={<WebsiteLeadsPage />} />
        <Route path="/catering-enquiries" element={<CateringEnquiriesPage />} />
        <Route path="/delivery-enquiries" element={<DeliveryEnquiriesPage />} />
        <Route path="/website-feedback" element={<FeedbackPage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
