# Meat Lovers CIMS

Meat Lovers CIMS is a multi-role restaurant and operations management system built with a Next.js frontend and a NestJS backend. It supports role-based dashboards for admin, manager, cashier, storekeeper, accountant, waiter, chef, barman, dispatcher, and other staff roles.

The system covers a wide range of business workflows, including:

- website and CMS content management
- customer and lead management
- product and supplier management
- stock control and stock movements
- order handling and payments
- pricing and margin alerts
- kitchen, bar, waste, and delivery operations

---

## 1. What this project is

This repository contains two main applications:

- UI: a React/Next.js web application for the operational dashboards and screens
- API: a NestJS backend that exposes REST endpoints and connects to Prisma and a MySQL database

The app is organized around role-specific experiences so each user sees the parts of the system relevant to their responsibilities.

---

## 2. Tech stack

### Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- App Router

### Backend
- NestJS
- TypeScript
- Prisma ORM
- MySQL
- JWT-based auth structure

### Project tooling
- ESLint
- Jest testing
- Prisma migrations and seeding

---

## 3. Project structure

```text
meetlovers/
├── api/                 # NestJS backend
│   ├── prisma/          # Prisma schema, migrations, seed
│   ├── src/             # Application modules and controllers
│   └── test/            # End-to-end tests
├── ui/                  # Next.js frontend
│   ├── src/app/         # App Router pages and dashboards
│   ├── src/components/  # Reusable UI components
│   └── public/          # Static assets
├── document/            # Project documentation and reports
├── formats/             # Additional documentation assets
├── .env.example         # Example environment variables
└── run-all-tests.sh     # Example automation script for smoke tests
```

---

## 4. Prerequisites

Before running the app, make sure you have:

- Node.js 20+ (the project has been tested with Node 20/22)
- npm
- MySQL running locally
- Git

If you are using Prisma, your database should be reachable and you should have a valid database user and password.

---

## 5. Environment setup

1. Copy the example environment file if needed:

```bash
cp .env.example .env
```

2. Update the environment values for your local setup, especially:

- database connection values
- JWT secret
- application URL

> The backend uses Prisma and expects a working database connection before you start the API.

---

## 6. How to run the project

### Start the backend

Open a terminal and run:

```bash
cd api
npm install
npm run start:dev
```

The API should start on:

- http://localhost:3001

### Start the frontend

Open a second terminal and run:

```bash
cd ui
npm install
npm run dev
```

The UI should open on:

- http://localhost:3000

### Database setup

If Prisma needs to be initialized or synced with your database, run:

```bash
cd api
npx prisma generate
npx prisma db push
```

If you use migrations, you can also apply them with:

```bash
npx prisma migrate deploy
```

---

## 7. What the frontend does

The UI is built as a role-aware application. Common dashboard areas include:

- admin dashboard
- manager dashboard
- cashier dashboard
- storekeeper dashboard
- accountant dashboard
- waiter and kitchen views
- bar and dispatch views

Each route is designed to show the right module and permission level for the logged-in role.

---

## 8. What the backend does

The API handles the business logic for the application. Major backend areas include:

- authentication and user management
- products and pricing
- suppliers
- stock and inventory movement
- orders and payments
- website pages and lead capture
- CMS and CRM endpoints
- dashboards and reporting data

The backend is modular, with each domain grouped into its own NestJS module.

---

## 9. Testing

You can run the available test scripts from the API folder:

```bash
cd api
npm run test
npm run test:e2e
```

There is also a helper script for smoke checks at the project root:

```bash
./run-all-tests.sh
```

---

## 10. Common development workflow

A typical development loop looks like this:

1. start MySQL
2. start the API with the watch mode
3. start the UI dev server
4. browse to the relevant role dashboard
5. make changes in the relevant UI or API module
6. run tests or smoke checks before handing off changes

---

## 11. Notes for contributors

- Keep role-based access consistent across UI routes and API endpoints.
- Prefer shared UI components for modules that are reused across roles.
- When changing database models, update the Prisma schema and migrations carefully.
- The shared modules status document in this repo is useful for tracking role-isolation work.

---

## 12. Useful project documents

The repository already includes supporting documentation for the system, including:

- [SHARED_MODULES_STATUS.md](SHARED_MODULES_STATUS.md)
- [ROLE_ISOLATION_VISUAL_MAP.md](ROLE_ISOLATION_VISUAL_MAP.md)
- [PRODUCTION_PLANS_MODULE_COMPLETE.md](PRODUCTION_PLANS_MODULE_COMPLETE.md)
- [SUPPLIER_ENDPOINT_DIAGNOSTIC_REPORT.md](SUPPLIER_ENDPOINT_DIAGNOSTIC_REPORT.md)

These files describe the module roadmap, current status, and implementation notes for the application.

---

## 13. Summary

In short, this project is a full-stack restaurant operations platform with a role-based frontend and a modular backend. It is designed to support day-to-day business operations for a restaurant or food-service business, from customer-facing website content to internal stock, ordering, and reporting workflows.
