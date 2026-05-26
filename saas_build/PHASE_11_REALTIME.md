# Phase 11 — Real-Time Features

## Architecture

```
Browser (Socket.io client)
        │
        ▼
NestJS WebSocket Gateway (/realtime namespace)
        │
        ├── Redis Pub/Sub Adapter  ← syncs events across API instances
        │
        └── Rooms:
            tenant:{tenantId}           ← all school users
            user:{userId}               ← private notifications
            role:{tenantId}:{ROLE}      ← role-targeted broadcasts
            section:{tenantId}:{secId}  ← class-level events
```

## Events — Server → Client

| Event | Who Receives | When Fired |
|-------|-------------|-----------|
| `attendance:marked` | Section room | Teacher marks attendance |
| `alert:child_absent` | Parent (personal) | Child marked absent |
| `fee:payment_confirmed` | Student + Parents | Payment recorded |
| `exam:results_published` | Section + Tenant | Results published |
| `notification:new` | User (personal) | Any new notification |
| `notifications:unread_count` | User (personal) | Count changes |
| `announcement:new` | Tenant / Role | Admin broadcasts |
| `dashboard:live_stats` | SCHOOL_ADMIN role | Stats change |
| `presence:joined` | Tenant | User comes online |
| `presence:left` | Tenant | User goes offline |

## Events — Client → Server

| Event | Payload | Effect |
|-------|---------|--------|
| `join:section` | `{ sectionId }` | Join section room |
| `leave:section` | `{ sectionId }` | Leave section room |
| `attendance:session:start` | `{ sectionId, date }` | Notify section session started |
| `presence:list` | — | Returns list of online users |
| `heartbeat` | — | Refreshes presence TTL in Redis |

## Scaling

Socket.io uses `@socket.io/redis-adapter`.
Multiple API pods all share events via Redis pub/sub.
A user connected to Pod A will receive events emitted by Pod B.
No sticky sessions required.

## Frontend Usage

```tsx
// In any component — start WS connection
useRealtime();  // Already mounted in DashboardLayout

// Join a section room (teacher marking attendance)
const { joinSection } = useRealtime();
joinSection(sectionId);

// Listen for live alerts — automatic via LiveAlertBanner
// already mounted in DashboardLayout
```
