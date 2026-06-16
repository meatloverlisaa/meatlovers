import React from 'react'
import { Link, useLocation } from 'react-router-dom'

const links = [
  ['Dashboard', '/dashboard'],
  ['Ops Suppliers', '/ops/suppliers'],
  ['Ops Products', '/ops/products'],
  ['Ops Stock', '/ops/stock'],
  ['Ops Bar', '/ops/bar'],
  ['Ops Kitchen', '/ops/kitchen'],
  ['Ops Dispatch', '/ops/dispatch'],
  ['Ops Unsold Food', '/ops/unsold-food'],
  ['Ops Assets', '/ops/assets'],
  ['Ops HRM', '/ops/hrm'],
  ['Ops Finance', '/ops/finance'],
  ['Income Statement', '/ops/income-statement'],
  ['Approvals', '/approvals'],
  ['Approval History', '/approvals/history'],
  ['Approval Rules', '/approvals/rules'],
  ['Finance Categories', '/finance/categories'],
  ['Profitability Split', '/finance/profitability-split'],
  ['Cashier Reconciliation', '/finance/reconciliations'],
  ['Variance Alerts', '/finance/variance-alerts'],
  ['P&L Snapshots', '/finance/income-statement-snapshots'],
  ['Staff Motivation', '/staff-motivation'],
  ['Waiter Leaderboard', '/staff-motivation/leaderboard'],
  ['Customer Ratings', '/staff-motivation/customer-ratings'],
  ['Bonus Rules', '/staff-motivation/bonus-rules'],
  ['Daily Targets', '/staff-motivation/daily-targets'],
  ['HRM Performance', '/staff-motivation/hrm-report'],
  ['Delivery Orders', '/deliveries/orders'],
  ['Riders', '/deliveries/riders'],
  ['Dispatch Control', '/deliveries/dispatch-control'],
  ['Delivery Performance', '/deliveries/performance'],
  ['Supplier Invoices', '/storekeeping/supplier-invoices'],
  ['Receiving Notes', '/storekeeping/receiving-notes'],
  ['Stock Transfers', '/storekeeping/stock-transfers'],
  ['Stock Movement Report', '/storekeeping/stock-movement-report'],
  ['Supplier Performance', '/storekeeping/supplier-performance'],
  ['Recipes / BOM', '/production/recipes'],
  ['Production Plans', '/production/plans'],
  ['Ingredient Consumption', '/production/ingredient-consumption'],
  ['Wastage Control', '/production/wastage'],
  ['Menu Engineering', '/production/menu-engineering'],
  ['Food Cost Report', '/production/food-cost'],
  ['Pricing Rules', '/pricing/rules'],
  ['Category Dashboard', '/pricing/category-dashboard'],
  ['Price Control', '/pricing/price-control'],
  ['Product Activation', '/pricing/product-activation'],
  ['Price Audit', '/pricing/price-audit'],
  ['Margin Alerts', '/pricing/margin-alerts'],
  ['CRM Segments', '/crm/segments'],
  ['Visit History', '/crm/visit-history'],
  ['Loyalty Points', '/crm/loyalty'],
  ['CRM Follow-Ups', '/crm/follow-ups'],
  ['Repeat Customers', '/crm/repeat-dashboard'],
  ['CRM Action Tools', '/crm/action-tools'],
  ['Asset Lifecycle', '/assets/lifecycle-dashboard'],
  ['Asset Assignments', '/assets/assignments'],
  ['Asset Maintenance', '/assets/maintenance'],
  ['Asset Repair Logs', '/assets/repair-logs'],
  ['Asset Damage Reports', '/assets/damage-reports'],
  ['Asset Write-Offs', '/assets/writeoff'],
  ['HRM Compliance', '/hrm/compliance-dashboard'],
  ['Staff Shifts', '/hrm/shifts'],
  ['Duty Roster', '/hrm/duty-roster'],
  ['Attendance', '/hrm/attendance'],
  ['Absence Reports', '/hrm/absences'],
  ['Payroll Placeholder', '/hrm/payroll-placeholder'],
  ['Enforcement Dashboard', '/enforcement/dashboard'],
  ['Staff Incidents', '/enforcement/incidents'],
  ['Risk Scores', '/enforcement/risk-scores'],
  ['Enforcement Actions', '/enforcement/actions'],
  ['Enforcement Audit Feed', '/enforcement/audit-feed'],
  ['Website Acquisition', '/website-acquisition'],
  ['Website Leads', '/website-leads'],
  ['Catering Enquiries', '/catering-enquiries'],
  ['Delivery Enquiries', '/delivery-enquiries'],
  ['Website Feedback', '/website-feedback']
]

export default function SidebarNav() {
  const location = useLocation()
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>Meat Lovers</h3>
        <span>CIMS Admin</span>
      </div>
      <nav className="sidebar-menu">
        {links.map(([label, path]) => {
          const isActive = location.pathname === path
          return (
            <Link
              key={path}
              to={path}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
