# Website Lead Capture API
## System Name
Meat Lovers CIMS powered by YohPal
## Purpose
The website is not just an online brochure. It is an AI-enabled customer acquisition engine.
This API captures:
- general leads
- AI assistant enquiries
- food order interest
- soft drinks interest
- alcoholic drinks interest
- offers interest
- catering enquiries
- delivery enquiries
- customer feedback
## Tables Added
1. `website_leads`
2. `catering_enquiries`
3. `delivery_enquiries`
4. `customer_feedback`
## CRM Integration
Every website submission creates or updates a customer record in `customers`.
If the phone number already exists:
- customer is updated
- notes are appended
- customer type becomes `REGULAR`
If the phone number does not exist:
- a new customer is created
## Audit Logging
Each website submission creates an audit log entry.
Audit module:
```text
WEBSITE
Actions:
CREATE_WEBSITE_LEAD
CREATE_CATERING_ENQUIRY
CREATE_DELIVERY_ENQUIRY
CREATE_CUSTOMER_FEEDBACK


API Endpoints
POST /api/website/leads
POST /api/website/catering-enquiries
POST /api/website/delivery-enquiries
POST /api/website/feedback

Business Impact
This turns the Meat Lovers website into a measurable acquisition engine.
Management can track:
customer interest
catering demand
delivery demand
feedback trends
lead sources
repeat customer activity
--# Batch 8 Outcome
Website backend now supports:
website leads table
catering enquiries table
delivery enquiries table
feedback table
website controller
website routes
CRM integration
audit logging for website submissions
Meat Lovers CIMS powered by YohPal acquisition engine
# Next Smart Move
Build **Batch 9 — Admin Dashboard Website Leads Module**, including:
- leads listing page
- catering enquiries page
- delivery enquiries page
- feedback page
- lead status update API
- admin routes
- frontend API integration
- dashboard cards for acquisition performance
