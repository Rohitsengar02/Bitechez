# Bitechez POS 🍽️
> **Premium Offline-First Restaurant Operating System & POS**  
> Built for fast-paced Windows desktop environments, local network orchestration, and cloud multi-outlet scaling.

---

## ⚡ Core Architecture

Bitechez POS operates across three resilient modes:
1. **Standalone Offline Mode**: Direct local SQLite embedded database (`better-sqlite3` + `Drizzle ORM`). Billing never stops even without router or internet connection.
2. **Local Network Mode**: Dedicated local restaurant server (`Node.js`, `Fastify`, `PostgreSQL`, `Socket.IO`). Real-time Kitchen Display (KDS), table status, and multi-terminal sync.
3. **Cloud Connected Mode**: High availability cloud backend (`Fastify`, `PostgreSQL`) for franchise analytics, centralized reporting, and multi-tenant outlets.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Desktop Application** | Electron, React 18, TypeScript, Vite, Electron Builder |
| **Styling & Design System** | Tailwind CSS, Lucide React, Bitechez Deep Maroon Theme (`#800D32`) |
| **State & Data Fetching** | Zustand, TanStack Query |
| **Local Terminal Database** | SQLite, `better-sqlite3`, Drizzle ORM |
| **Local Server & Cloud** | Node.js, Fastify, Socket.IO, PostgreSQL, Drizzle ORM |
| **Hardware & Printing** | ESC/POS 58mm/80mm, USB, LAN thermal printers, Cash Drawers |
| **Financial Integrity** | Integer minor currency units (**Paise: ₹1 = 100 paise**) – no floating point errors |

---

## 📁 Monorepo Layout

```
apps/
  desktop/        # Electron + React POS desktop terminal
  local-server/   # Local restaurant Fastify + Socket.IO server
  cloud-api/      # Multi-tenant cloud backend
  owner-web/      # Franchise & owner cloud portal

packages/
  config/           # Theme tokens, ports, Zod environment schemas
  shared-types/     # Full TypeScript types across POS entities
  validation/       # Zod validation schemas
  business-logic/   # Cart calculations, GST, discounts, KOT lifecycle
  database-schema/  # SQLite & PostgreSQL Drizzle schemas
  sync-engine/      # Outbox, inbox deduplication, exponential retry
  printing-engine/  # ESC/POS commands, 58mm & 80mm receipt/KOT templates
  api-client/       # Typed HTTP & WebSocket client
  ui-components/    # Reusable Bitechez design system components

infrastructure/     # Docker Compose (PostgreSQL), setup & precheck scripts
docs/               # Architectural & engineering specifications
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js LTS (v20+ or v24+)
- pnpm (v10+ / v12+)

### 2. Install Dependencies
```powershell
pnpm install
```

### 3. Verify System Environment
```powershell
pnpm run precheck
```

### 4. Run Development Services
```powershell
# Run the Desktop POS Application
pnpm run dev:desktop

# Run the Local Restaurant Fastify Server
pnpm run dev:server

# Run All Services via Turborepo
pnpm run dev
```

### 5. Run Automated Tests
```powershell
pnpm run test
```

---

## 🧾 GST & Financial Calculations (Paise Based)

All currency calculations strictly use integer **paise** ($1 \text{ INR} = 100 \text{ paise}$):
- ₹ 250.00 = `25000` paise
- 5% GST on ₹ 500.00 = `2500` paise (split into `1250` paise CGST + `1250` paise SGST)
- Automatic 50-paise / Rupee rounding adjustment.

