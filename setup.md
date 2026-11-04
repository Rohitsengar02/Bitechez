# CYBERLIM POS – MASTER ENGINEERING & DEVELOPMENT PROMPT

## ROLE

Act as a Senior Desktop Application Architect, Principal Full-Stack Engineer, Database Architect and Performance Engineer with extensive experience building enterprise-grade restaurant POS systems.

You are responsible for architecting and developing **CyberLim POS**, a premium, offline-first restaurant Point of Sale desktop application.

Do not just generate UI mockups. Build a functional, scalable, production-oriented application with real database persistence, local networking, offline capabilities, printing infrastructure and synchronization.

You have permission to inspect the development environment, install required dependencies, configure project files, create environment templates, run commands, build the application and execute tests.

Do not stop after generating the initial dashboard.

---

# 1. PRODUCT OBJECTIVE

Product: CyberLim POS  
Company: CyberLim Solutions  
Platform: Windows Desktop First  
Application Type: Offline-First Restaurant POS  
Architecture: Local-First + Cloud-Connected  
Primary Currency: INR (₹)  
Timezone: Asia/Kolkata  
Language: English initially

The application must work in three modes:

1. Online Mode: Full functionality with cloud synchronization.
2. Local Network Mode: Multiple computers, kitchen displays and printers work without internet.
3. Standalone Offline Mode: A single computer can continue operating using its own local SQLite database when the local restaurant server is unavailable.

The application must never require an internet connection to create a local bill or save an order.

# 2. APPROVED TECHNOLOGY STACK

Use these technologies. Do not change the stack without a compelling technical reason.

### Desktop
- Electron
- React
- TypeScript
- Vite
- Electron Builder

### Frontend UI
- Tailwind CSS
- shadcn/ui
- Lucide React
- React Router
- Zustand
- TanStack Query
- React Hook Form
- Zod

### Local Database
- SQLite
- better-sqlite3
- Drizzle ORM
- Versioned database migrations

### Local Restaurant Server
- Node.js
- Fastify
- PostgreSQL
- Drizzle ORM
- Socket.IO

### Cloud
- Node.js
- Fastify
- PostgreSQL
- Object storage for images and backups
- Authenticated REST APIs

### Synchronization
- Transactional Outbox
- Inbox Deduplication
- Retry Queue
- Idempotency Keys
- Versioned Events
- Conflict Resolution

### Hardware
- ESC/POS thermal printing
- USB printers
- LAN printers
- Barcode scanners
- Cash drawer integration

### Testing
- Vitest
- Playwright
- Electron end-to-end testing
- Database integration tests

# 3. DEVELOPMENT ENVIRONMENT SETUP

First inspect the computer and development environment.

Check:
- Windows version
- Node.js version
- npm / pnpm availability
- Git installation
- Available disk space
- Existing project files
- Available ports
- PostgreSQL installation or availability
- Docker availability, if needed

Then prepare the environment.

Use:
- Node.js LTS
- pnpm
- TypeScript strict mode
- ESLint
- Prettier
- Git

Create the monorepo using pnpm workspaces and Turborepo.

Do not overwrite existing project files without inspecting them first.

Create:
- package.json
- pnpm-workspace.yaml
- turbo.json
- tsconfig.json
- .gitignore
- .env.example
- README.md
- environment setup scripts

Create environment validation using Zod.

Do not hardcode passwords, API keys, database credentials or production secrets.

If a required credential is unavailable, provide a safe placeholder in .env.example and document how to configure it.

Never commit actual .env files.

# 4. PROJECT STRUCTURE

Create the following architecture:

cyberlim-pos/

apps/
  desktop/
    electron/
      main/
      preload/
      ipc/
      database/
      printing/
      hardware/
    renderer/
      components/
      layouts/
      pages/
      hooks/
      stores/
      services/
      routes/
      styles/

  local-server/
    src/
      modules/
      routes/
      services/
      websocket/
      synchronization/
      database/
      printing/

  cloud-api/
    src/
      modules/
      authentication/
      tenants/
      outlets/
      subscriptions/
      synchronization/

  owner-web/

packages/
  shared-types/
  validation/
  business-logic/
  database-schema/
  sync-engine/
  api-client/
  ui-components/
  printing-engine/
  config/

infrastructure/
  docker/
  scripts/
  migrations/
  deployment/

docs/
  architecture/
  database/
  api/
  offline-sync/
  hardware/

Use clear module boundaries and reusable business logic.

# 5. ELECTRON SECURITY

Implement Electron securely.

Mandatory:
- contextIsolation: true
- nodeIntegration: false
- sandbox where compatible
- Restricted preload APIs
- Typed IPC communication
- Validate all IPC inputs
- No unrestricted filesystem access from renderer
- No direct database access from renderer
- Secure external URL handling
- Safe application update process

Use the Electron main process for native operations and SQLite access.

The React renderer must communicate through typed and restricted IPC APIs.

# 6. UI DESIGN SYSTEM

Create a premium, modern restaurant SaaS interface.

Brand: CyberLim POS.

Primary theme:
- Deep maroon: #800D32
- Dark maroon: #600821
- White: #FFFFFF
- Background: #FAF8F9
- Light pink: #F9E8ED
- Text: #191923
- Success: #239B56
- Warning: #E9A23B
- Error: #DC4545

Design requirements:
- Professional enterprise UI.
- Consistent spacing.
- Rounded cards.
- Subtle shadows.
- Clean typography.
- Fast interactions.
- Desktop-first layout.
- Responsive layouts for smaller displays.
- Light theme as default.
- Dark theme as a future option.

Use the same persistent navigation across modules.

Main navigation:

1. Dashboard
2. POS
3. Tables
4. Kitchen KOT
5. Requests
6. Customers
7. Item Menu
8. Printers
9. More Tools

More Tools categories:

Operations:
- Orders Management
- Reservations
- Shift Management

Inventory:
- Stock Management
- Purchase Orders
- Suppliers
- Stock Alerts
- Wastage

Marketing:
- Offers & Discounts
- Loyalty Program
- Gift Cards
- Campaigns
- Coupons

Reports:
- Sales Reports
- Item Performance
- Inventory Reports
- Customer Insights
- Tax Reports
- Profit and Loss

Administration:
- Staff Management
- Roles and Permissions
- Settings
- Outlet Management

# 7. PERFORMANCE REQUIREMENTS

This is a performance-critical desktop application.

Build a React SPA with persistent navigation and no unnecessary full-page reloads.

Implement:
- Route-based code splitting.
- Lazy loading of non-critical modules.
- Zustand for immediate UI state.
- TanStack Query for server state.
- SQLite for local persistent data.
- IndexedDB only where browser-side caching is useful.
- Virtualized large tables.
- Debounced search.
- Memoized expensive components.
- Optimized images.
- Incremental data updates.
- Background synchronization.
- WebSocket event updates.

Do not fetch the entire database on each page navigation.

Use local database queries for frequently accessed data.

Do not wait for cloud APIs to:
- Add an item to the cart.
- Change quantity.
- Create a local order.
- Save an offline payment record.
- Open cached menu data.
- Load cached table information.

Engineering performance targets:
- Cached navigation: under 100 ms.
- Cart interaction: under 50 ms.
- Local order persistence: under 150 ms.
- LAN KOT delivery: under 250 ms.
- Cached menu loading: under 300 ms.

Measure actual performance and optimize bottlenecks rather than assuming targets have been achieved.

# 8. DATABASE ARCHITECTURE

Every Windows POS terminal must have its own local SQLite database.

The restaurant's dedicated local server must have PostgreSQL.

The cloud must have a separate PostgreSQL database.

Create migrations and schemas for:

- tenants
- outlets
- users
- roles
- permissions
- devices
- categories
- items
- item_variants
- item_addons
- tables
- customers
- orders
- order_items
- kot_tickets
- kot_items
- payments
- service_requests
- printers
- printer_jobs
- inventory
- stock_movements
- suppliers
- purchase_orders
- expenses
- discounts
- loyalty_transactions
- sync_events
- sync_checkpoints
- audit_logs

Requirements:
- UUID identifiers.
- Outlet and tenant isolation.
- Foreign keys.
- Database indexes.
- Transactions.
- Consistent timestamps.
- Soft deletion where appropriate.
- Append-only payment and inventory records.
- Versioned migrations.

Use integer minor currency units (paise) for financial calculations. Never use floating-point arithmetic for money.

# 9. OFFLINE-FIRST ENGINE

Implement an independent synchronization package.

Every locally created transaction must be saved before it is acknowledged as successful.

Implement:
- Durable local event queue.
- Transactional outbox.
- Inbox event deduplication.
- Unique event IDs.
- Idempotency keys.
- Retry with exponential backoff and jitter.
- Sync status tracking.
- Versioned event schemas.
- Conflict resolution.
- Sync diagnostics.

When a cashier creates an order:

1. Validate the order.
2. Save it in SQLite.
3. Create an outbox event in the same transaction.
4. Update the UI.
5. Send it to the local server when available.
6. Local server commits the transaction.
7. Kitchen receives the KOT event.
8. Cloud sync occurs in the background when internet returns.
9. Mark the event acknowledged only after durable confirmation.

Never delete pending events after a failed sync.

Do not use last-write-wins for orders, payments or inventory.

Use immutable order and payment events.

Handle server-unavailable and standalone-terminal operation explicitly. Display the current operating mode and any degraded capabilities.

# 10. LOCAL NETWORK ARCHITECTURE

The dedicated restaurant server must coordinate:

- Multiple cashier terminals.
- Kitchen KOT screens.
- Waiter devices in future versions.
- Thermal printers.
- Table state.
- Order state.

Use:
- Fastify REST APIs.
- Socket.IO.
- PostgreSQL transactions.
- Authenticated device registration.
- Outlet-scoped authorization.
- LAN discovery or configurable server address.

Implement health checks and automatic reconnect.

When internet fails but the local router remains operational, all devices must continue communicating through the local server.

When the local server fails, each terminal must be able to enter standalone mode with local persistence.

# 11. REAL-TIME COMMUNICATION

Implement Socket.IO events:

- order.created
- order.updated
- order.cancelled
- kot.created
- kot.preparing
- kot.ready
- kot.completed
- table.updated
- request.created
- payment.completed
- menu.updated
- printer.status
- sync.status

Use outlet-based and station-based rooms.

All events must be authenticated and authorized.

The receiving client must be able to recover missed events through versioned event replay or database reconciliation.

# 12. PRINTING ENGINE

Create an independent print service.

Implement:
- ESC/POS
- USB printer integration
- LAN printer integration
- Receipt printing
- Kitchen KOT printing
- Bar KOT printing
- Station-based routing
- 58mm and 80mm paper
- Test printing
- Reprint history
- Printer status
- Persistent print job queue

Printing must not block the React interface.

Persist print jobs before dispatch.

Handle ambiguous print failures safely and allow authorized manual reprints.

# 13. FUNCTIONAL MODULES

Build the following modules with real functionality.

A. Dashboard
- Sales summary
- Orders
- Available and occupied tables
- Pending KOT
- Recent transactions

B. POS
- Dine In
- Takeaway
- Delivery
- Search items
- Product categories
- Cart
- Quantity controls
- Variants and add-ons
- Discounts
- GST
- Payment
- Receipt
- Draft and held orders

C. Tables
- Add and edit tables
- Available
- Occupied
- Reserved
- Cleaning
- Transfer
- Merge
- Guest count

D. Kitchen KOT
- Live orders
- Preparing
- Ready
- Completed
- Timers
- Kitchen stations
- Item preparation status

E. Requests
- Call waiter
- Water
- Cutlery
- Bill
- Customer assistance
- Request tracking

F. Customers
- Profiles
- Contact information
- Order history
- Loyalty points

G. Item Menu
- Categories
- Products
- Images
- Prices
- Variants
- Add-ons
- Veg/non-veg
- Availability
- GST configuration

H. Printers
- Add printers
- Test printers
- Configure templates
- Assign stations
- Print jobs

I. More Tools
- Inventory
- Suppliers
- Purchase orders
- Marketing
- Discounts
- Loyalty
- Expenses
- Reports
- Staff management

# 14. CLOUD PLATFORM

Build cloud services separately.

Support:
- Multi-tenant architecture.
- Multiple outlets.
- Cloud authentication.
- Centralized reports.
- Cloud backup.
- Device management.
- Subscription management.
- Menu distribution.
- Application licensing.
- Sync monitoring.

Desktop applications must communicate with the cloud only through authenticated APIs.

Cloud unavailability must never block local billing.

# 15. ENVIRONMENT CONFIGURATION

Create:
- .env.example
- .env.local.example
- local-server/.env.example
- cloud-api/.env.example

Include documented settings for:

- APP_ENV
- APP_NAME
- APP_VERSION
- LOCAL_SERVER_HOST
- LOCAL_SERVER_PORT
- LOCAL_DATABASE_URL
- CLOUD_API_URL
- CLOUD_DATABASE_URL
- SOCKET_URL
- OUTLET_ID
- DEVICE_ID
- PRINTER_DEFAULT
- SYNC_INTERVAL
- LOG_LEVEL

Do not expose private environment variables to Vite renderer code.

Only use VITE_ variables for explicitly public configuration.

Create setup scripts that:
1. Check prerequisites.
2. Install dependencies.
3. Generate local secrets securely.
4. Initialize the local database.
5. Apply migrations.
6. Seed development data.
7. Start the desktop application.
8. Run the local server.
9. Validate connectivity.

Never generate production credentials in source code.

# 16. TESTING AND QUALITY

Write real automated tests.

Test:
- Order creation.
- Cart calculations.
- GST calculations.
- Discounts.
- Payment records.
- Table assignment conflicts.
- KOT transitions.
- SQLite persistence.
- Server synchronization.
- Duplicate event prevention.
- Printer job retries.
- Application restart recovery.
- Cloud disconnection.
- Local server disconnection.

Create an automated offline test suite.

Simulate:
- Internet disconnect.
- Router disconnect.
- Local server crash.
- Printer disconnect.
- Windows application restart.
- Reconnection with pending transactions.

Do not declare the product production-ready until these scenarios pass.

# 17. DEVELOPMENT EXECUTION PLAN

Work phase by phase.

Phase 1: Environment and monorepo.
Phase 2: Electron desktop foundation.
Phase 3: UI design system and navigation.
Phase 4: SQLite database and persistence.
Phase 5: POS billing and checkout.
Phase 6: Tables and KOT.
Phase 7: Local server and multi-device communication.
Phase 8: Offline synchronization engine.
Phase 9: Printing and hardware.
Phase 10: Inventory and marketing modules.
Phase 11: Cloud APIs and multi-outlet support.
Phase 12: Testing, optimization and Windows release.

After each phase:
- Run TypeScript checks.
- Run lint.
- Run unit tests.
- Run relevant integration tests.
- Fix errors before moving forward.
- Update documentation.
- Report completed functionality.

Do not create empty placeholder pages and claim the module is complete.

Do not silently mock database operations.

Use seeded demo data only in development mode.

# 18. FINAL DELIVERABLES

At completion provide:

1. Working Windows desktop application.
2. Complete source code.
3. Local restaurant server.
4. Cloud API.
5. Database migrations.
6. Environment templates.
7. Installation scripts.
8. Development scripts.
9. Windows installer.
10. Offline synchronization documentation.
11. Printer integration documentation.
12. Backup and recovery instructions.
13. Test reports.
14. Production deployment guide.

# 19. IMPORTANT WORKING INSTRUCTIONS

- First inspect the environment.
- Create the project structure.
- Install the approved dependencies.
- Configure all required environment templates.
- Build a working vertical slice before expanding all modules.
- Do not stop after planning.
- Do not ask for approval for ordinary technical implementation choices.
- Ask only when a genuine external credential, irreversible action or hardware-specific decision is required.
- Do not overwrite existing data.
- Do not use fake success states.
- Do not hide errors.
- Keep code modular and maintainable.
- Prefer simple, reliable implementations over unnecessary complexity.

Your priority is to deliver a fast, secure, reliable, offline-first restaurant POS that works in real restaurant conditions.

**PRODUCT OWNER: CYBERLIM SOLUTIONS**

**PRODUCT: CYBERLIM POS**

**MISSION: BUILD A PRODUCTION-GRADE WINDOWS RESTAURANT POS THAT NEVER STOPS BILLING JUST BECAUSE THE INTERNET IS DOWN.**