# HR Module Documentation

## Overview

The HR (Human Resources) Module is a comprehensive system for managing all staff-related operations in the Meat Lovers CIMS platform. It provides end-to-end functionality for workforce management, from onboarding to payroll processing, ensuring efficient operations and compliance with employment regulations.

---

## Module Status

**Current Implementation**: ✅ Partially Implemented  
**Module Path**: `/api/src/hrm/`  
**Frontend Integration**: 🔄 Pending  
**Database Tables**: ✅ Configured

---

## Core Features

### 1. Staff Management

#### 1.1 Employee Records
- **Employee Profile Management**
  - Full name, email, phone contact details
  - Role assignment (admin, manager, cashier, chef, waiter, barman, storekeeper, accountant, dispatcher)
  - Employment start date and employment status (active/inactive)
  - Emergency contact information
  - National ID / Tax ID / Government-issued ID numbers
  - Bank account details for salary payments
  - Contract type (permanent, contract, part-time, casual)

#### 1.2 Staff Directory
- View all staff members with filtering options
- Filter by role, employment status, department
- Search functionality by name, email, or phone
- Quick access to individual staff profiles
- Staff count by role and department

#### 1.3 Onboarding & Offboarding
- **Onboarding Process**
  - New employee registration form
  - Document collection checklist (ID, certificates, references)
  - Initial training assignment
  - Probation period tracking
  - Access credentials setup

- **Offboarding Process**
  - Resignation/termination workflow
  - Exit interview documentation
  - Asset return checklist
  - Final payroll processing
  - Access revocation

---

### 2. Attendance Management

#### 2.1 Daily Attendance Tracking
- Check-in and check-out recording
- Manual and biometric attendance marking
- Late arrival and early departure tracking
- Attendance status types:
  - **PRESENT**: On time and working
  - **LATE**: Late arrival
  - **ABSENT**: No show without notification
  - **HALF_DAY**: Partial day worked
  - **ON_LEAVE**: Approved leave

#### 2.2 Attendance Reports
- Daily attendance summary dashboard
- Monthly attendance reports per employee
- Department-wise attendance analytics
- Attendance trends and patterns
- Absenteeism rate tracking
- Punctuality metrics

#### 2.3 Work Hours Calculation
- Total hours worked per day
- Weekly and monthly hour totals
- Overtime hour calculation
- Break time management
- Shift differential tracking

---

### 3. Duty Roster & Shift Management

#### 3.1 Shift Planning
- **Shift Types**:
  - **MORNING**: Early morning shift (6 AM - 2 PM)
  - **AFTERNOON**: Day shift (2 PM - 10 PM)
  - **NIGHT**: Night shift (10 PM - 6 AM)
  - **FULL_DAY**: Extended shift coverage
  - **SPLIT**: Split shift with breaks

#### 3.2 Roster Creation & Management
- Weekly/monthly roster creation
- Role-based shift assignment
- Automatic shift conflict detection
- Staff availability consideration
- Roster templates for recurring schedules
- Shift swapping and trading functionality

#### 3.3 Roster Notifications
- Automated shift reminders via email/SMS
- Change notifications for roster updates
- Advance schedule publishing
- On-call duty notifications

---

### 4. Leave Management

#### 4.1 Leave Types
- **ANNUAL**: Paid annual vacation leave
- **SICK**: Medical leave with certificate
- **CASUAL**: Short-term casual leave
- **MATERNITY**: Maternity/paternity leave
- **EMERGENCY**: Urgent family emergencies
- **UNPAID**: Leave without pay
- **STUDY**: Educational leave
- **COMPASSIONATE**: Bereavement leave

#### 4.2 Leave Request Workflow
- Employee leave application submission
- Leave balance checking before request
- Supervisor/manager approval workflow
- Multi-level approval for extended leaves
- Automatic calendar blocking upon approval
- Leave cancellation and modification

#### 4.3 Leave Balance Tracking
- Annual leave entitlement by employment contract
- Accrued leave calculation
- Used vs. remaining leave days
- Leave carry-forward rules
- Leave encashment options

#### 4.4 Leave Reports
- Department leave calendar view
- Staff availability forecasting
- Leave pattern analysis
- Public holiday management
- Leave abuse monitoring

---

### 5. Payroll Management

#### 5.1 Salary Components
- **Basic Salary**: Base monthly/hourly wage
- **Allowances**:
  - Housing allowance
  - Transport allowance
  - Meal allowance
  - Phone/communication allowance
  - Special role allowances
- **Overtime Pay**: Calculated based on extra hours
- **Bonuses**: Performance and seasonal bonuses
- **Commissions**: Sales-based earnings (for relevant roles)

#### 5.2 Deductions
- **Statutory Deductions**:
  - Income tax (PAYE)
  - Social security/pension contributions
  - National health insurance
- **Voluntary Deductions**:
  - Loan repayments
  - Salary advances recovery
  - Union dues
  - Insurance premiums
- **Disciplinary Deductions**: Fines and penalties

#### 5.3 Payroll Processing
- Monthly payroll cycle management
- Automated salary calculations
- Attendance-based pay adjustments
- Overtime and bonus inclusion
- Net salary computation
- Payslip generation (PDF)
- Bulk payment file generation for banks
- Payment history tracking

#### 5.4 Payroll Reports
- Monthly payroll summary
- Department-wise salary breakdown
- Tax and statutory deduction reports
- Year-to-date (YTD) earnings statements
- Cost center allocation reports
- Payroll variance analysis

---

### 6. Performance Management

#### 6.1 Performance Reviews
- Periodic performance appraisals (quarterly/annually)
- 360-degree feedback system
- Goal setting and tracking (KPIs)
- Competency assessments
- Performance improvement plans (PIP)

#### 6.2 Performance Metrics
- Individual performance scores
- Department performance averages
- Performance trend tracking
- Top performer identification
- Underperformance alerts

#### 6.3 Rewards & Recognition
- Employee of the month/quarter
- Performance-based bonuses
- Achievement badges and certificates
- Recognition announcements

---

### 7. Training & Development

#### 7.1 Training Programs
- Onboarding training modules
- Role-specific skill training
- Safety and hygiene training (mandatory for food handling)
- Customer service training
- Leadership development programs
- Cross-training opportunities

#### 7.2 Training Tracking
- Training schedule and calendar
- Employee training history
- Training completion certificates
- Skill matrix and competency mapping
- Training effectiveness evaluation
- Mandatory training compliance

#### 7.3 Career Development
- Career path planning
- Internal promotion tracking
- Skill gap analysis
- Professional development plans
- Mentorship programs

---

### 8. Disciplinary & Grievance Management

#### 8.1 Disciplinary Actions
- Incident reporting and documentation
- Warning system (verbal, written, final)
- Suspension procedures
- Termination workflows
- Disciplinary hearing records
- Appeal process management

#### 8.2 Grievance Handling
- Employee complaint submission
- Grievance investigation process
- Resolution tracking
- Confidential reporting channels
- Escalation procedures

---

### 9. HR Analytics & Reporting

#### 9.1 Workforce Analytics
- Headcount reports by role, department, and location
- Employee turnover rate and retention metrics
- Average tenure analysis
- Age and gender diversity reports
- Workforce cost analysis

#### 9.2 Compliance Reports
- Employment contract compliance
- Statutory contribution reports
- Leave balance audits
- Overtime regulation compliance
- Working hours compliance (labor laws)

#### 9.3 Dashboard Metrics
- Total active staff count
- Today's attendance percentage
- Pending leave requests
- Upcoming duty rosters
- Payroll cycle status
- Training compliance rate
- Open positions and recruitment pipeline

---

## API Endpoints

### Staff Management
```
GET    /hrm/staff              # Get all staff with filters
GET    /hrm/staff/:id          # Get staff details
POST   /hrm/staff              # Create new staff member
PATCH  /hrm/staff/:id          # Update staff details
DELETE /hrm/staff/:id          # Deactivate staff
```

### Attendance
```
GET    /hrm/attendance         # Get attendance records
GET    /hrm/attendance/summary # Daily attendance summary
POST   /hrm/attendance         # Mark attendance
PATCH  /hrm/attendance/:id     # Update attendance record
```

### Duty Roster
```
GET    /hrm/roster             # Get duty rosters
POST   /hrm/roster             # Create roster entry
PATCH  /hrm/roster/:id         # Update roster
DELETE /hrm/roster/:id         # Delete roster entry
```

### Leave Management
```
GET    /hrm/leave              # Get leave requests
GET    /hrm/leave/summary      # Leave statistics
POST   /hrm/leave              # Submit leave request
PATCH  /hrm/leave/:id/approve  # Approve leave
PATCH  /hrm/leave/:id/reject   # Reject leave
```

### Payroll
```
GET    /hrm/payroll            # Get payroll records
GET    /hrm/payroll/summary    # Payroll totals
POST   /hrm/payroll            # Create payroll entry
PATCH  /hrm/payroll/:id        # Update payroll
GET    /hrm/payroll/:id/slip   # Generate payslip
```

### HR Dashboard
```
GET    /hrm/summary            # Overall HR metrics
GET    /hrm/analytics          # Workforce analytics
```

---

## Database Schema

### Key Tables

#### 1. **Users** (Extended for HR)
- Personal information
- Employment details
- Contract information
- Banking details
- Emergency contacts

#### 2. **StaffAttendance**
- Date and time records
- Check-in/check-out timestamps
- Status (present, late, absent, leave)
- Hours worked
- Notes

#### 3. **DutyRoster**
- Shift assignments
- Shift type and timing
- User assignment
- Shift notes

#### 4. **LeaveRequest**
- Leave type and duration
- Request date and status
- Approval workflow
- Approver information

#### 5. **Payroll**
- Salary components
- Deductions
- Net pay
- Payment details
- Period information

#### 6. **PerformanceReview** (To be created)
- Review period
- Scores and ratings
- Goals and achievements
- Comments and feedback

#### 7. **TrainingRecord** (To be created)
- Training type and date
- Completion status
- Certificates
- Trainer information

#### 8. **DisciplinaryAction** (To be created)
- Incident details
- Action taken
- Warning level
- Resolution status

---

## Role-Based Access Control

### Admin
- Full access to all HR functions
- Can manage all staff records
- Approve/reject all leave requests
- Process payroll for all staff
- View all reports and analytics

### Manager
- View staff in their department
- Manage team attendance and rosters
- Approve/reject leave for team members
- View team payroll summaries
- Access team performance metrics

### HR Officer
- Manage staff records and onboarding
- Track attendance and leave
- Process payroll
- Generate HR reports
- Handle grievances and disciplinary actions

### Staff (Self-Service)
- View own profile and documents
- Mark own attendance (where applicable)
- Submit leave requests
- View own payslips
- Access training materials
- View own duty roster

---

## Integrations

### 1. Biometric Integration
- Fingerprint/face recognition devices
- Automatic attendance sync
- Real-time attendance updates

### 2. Email/SMS Notifications
- Leave approval notifications
- Roster change alerts
- Payslip delivery
- Training reminders

### 3. Accounting System Integration
- Payroll journal entries
- Expense allocations
- Cost center reporting

### 4. Government Compliance Systems
- Tax authority reporting
- Social security submissions
- Labor department compliance

---

## Implementation Priorities

### Phase 1: Core HR (✅ Completed)
- Staff management
- Attendance tracking
- Leave management
- Basic payroll
- Duty roster

### Phase 2: Advanced Features (🔄 In Progress)
- Performance management system
- Training and development module
- Disciplinary and grievance handling
- Advanced payroll with tax calculations

### Phase 3: Analytics & Automation (📋 Planned)
- HR analytics dashboard
- Predictive workforce planning
- Automated compliance reporting
- AI-powered recruitment assistance

### Phase 4: Employee Self-Service Portal (📋 Planned)
- Mobile app for staff
- Self-service attendance marking
- Leave application mobile interface
- Digital payslip access
- Training course enrollment

---

## Best Practices

### 1. Data Security
- Encrypt sensitive personal information
- Secure payroll data access
- Role-based data visibility
- Audit trails for all HR actions

### 2. Compliance
- Adhere to local labor laws
- Maintain statutory records
- Regular compliance audits
- Document retention policies

### 3. Process Efficiency
- Automate routine tasks
- Standardize workflows
- Reduce manual data entry
- Enable self-service where possible

### 4. Employee Experience
- User-friendly interfaces
- Mobile accessibility
- Timely notifications
- Transparent processes

---

## Future Enhancements

1. **Recruitment Module**
   - Job posting and application tracking
   - Interview scheduling
   - Candidate evaluation
   - Offer letter generation

2. **Document Management**
   - Contract storage and e-signatures
   - Certificate and license tracking
   - Document expiry alerts
   - Digital personnel files

3. **Time & Attendance Kiosks**
   - Physical kiosk installations
   - QR code/NFC attendance marking
   - Location-based attendance

4. **Succession Planning**
   - Key position identification
   - Talent pipeline development
   - Replacement planning

5. **Employee Wellness**
   - Health tracking
   - Wellness program enrollment
   - Mental health support resources

6. **Exit Analytics**
   - Exit interview analysis
   - Turnover prediction models
   - Retention strategy recommendations

---

## Conclusion

The HR Module is a critical component of the Meat Lovers CIMS platform, ensuring efficient workforce management across all restaurant operations. With features covering the entire employee lifecycle from hiring to retirement, it provides the tools needed to build and maintain a productive, engaged, and compliant workforce.

For technical implementation details, refer to:
- API: `/api/src/hrm/`
- Database: `/api/prisma/schema.prisma` (User, StaffAttendance, DutyRoster, LeaveRequest, Payroll tables)
- Frontend: `/ui/src/app/(roles)/*/hr/` (to be implemented for each role)

---

**Last Updated**: July 23, 2026  
**Module Owner**: HR & Operations Team  
**Version**: 1.0
