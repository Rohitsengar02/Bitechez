# Bitechez POS – Architecture & System Overview

## 1. Local-First Design
Bitechez POS guarantees continuous billing operations under any network failure:
- **Zero Network Delay for Cart Operations**: Cart operations, variant selections, and draft orders execute in-memory via Zustand in `< 50ms`.
- **Durable Local Persistence**: Every finalized order is committed to SQLite via `better-sqlite3` in `< 150ms` before user feedback is displayed.
- **Transactional Outbox**: An outbox event is committed in the same database transaction as the order, preventing missing events during power interruptions or crashes.

## 2. Sync Topology
```
[ POS Terminal 1 (SQLite) ] ---> [ Local Restaurant Server (Fastify + Socket.IO) ] <---> [ Cloud API ]
[ POS Terminal 2 (SQLite) ] --->               |
[ Kitchen KDS Display     ] <------------------+
[ Bar KOT Printer         ] <------------------+
```

## 3. Security
- `contextIsolation: true`
- `nodeIntegration: false`
- Renderer never accesses filesystem or SQLite directly.
- Strict IPC whitelist validation via Zod schemas.

