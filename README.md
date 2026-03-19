# PayNest Real-Time Bidding System

A full-stack real-time auction platform built with **NestJS**, **React**, **TypeORM**, **PostgreSQL**, and **WebSocket** (Socket.IO).

## 🏗️ Architecture

```
┌──────────────┐     WebSocket      ┌──────────────┐
│   React +    │◄──────────────────►│   NestJS     │
│   Vite App   │     REST API       │   Backend    │
│   (Port 80)  │◄──────────────────►│   (Port 3000)│
└──────────────┘                    └──────┬───────┘
                                          │
                                   ┌──────▼───────┐
                                   │  PostgreSQL   │
                                   │  (Port 5432)  │
                                   └──────────────┘
```

## ✨ Features

- **Real-time bidding** via WebSocket (Socket.IO)
- **Optimistic locking** to handle race conditions (409 Conflict on concurrent bids)
- **Live countdown timers** with urgency color changes
- **Auto-expiration** via cron job (checks every 10 seconds)
- **Repository pattern** architecture (Controller → Service → Repository → Entity)
- **Seeded users** (no auth needed for demo)
- **Dark premium UI** with animated gradients and micro-interactions

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 15+ (or use Docker)

### Option 1: Docker Compose (Recommended)

```bash
docker compose up --build --force-recreate
```

- Frontend: http://localhost:8080
- Backend API: http://localhost:3000/api

### Option 2: Local Development

**1. Start PostgreSQL** (ensure a `paynest_bidding` database exists)

**2. Backend**
```bash
cd backend
cp .env.example .env  # Edit credentials if needed
npm install
npm run start:dev
```

**3. Frontend**
```bash
cd frontend
npm install
npm run dev
```

### 🧹 Cleanup & Fresh Start

To completely remove all containers and volumes for a clean state:

```bash
docker compose down -v
docker compose up --build --force-recreate
```

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/users` | List all seeded users |
| `POST` | `/api/auctions` | Create a new auction |
| `GET` | `/api/auctions` | List all auctions |
| `GET` | `/api/auctions/:id` | Get auction detail |
| `POST` | `/api/auctions/:id/bids` | Place a bid |
| `GET` | `/api/auctions/:id/bids` | Get bid history |

## 🔌 WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `joinAuction` | Client → Server | Join an auction room |
| `leaveAuction` | Client → Server | Leave an auction room |
| `newBid` | Server → Client | New bid placed |
| `auctionEnded` | Server → Client | Auction expired |
| `auctionCreated` | Server → Client | New auction created |

## 🏛️ Project Structure

```
paynest_task/
├── backend/                    # NestJS application
│   └── src/
│       ├── user/               # User module (seeded)
│       ├── auction/            # Auction CRUD + expiration cron
│       ├── bid/                # Bid placement with race handling
│       ├── gateway/            # WebSocket gateway
│       └── common/             # Filters, interceptors
├── frontend/                   # React + Vite application
│   └── src/
│       ├── pages/              # Dashboard, AuctionDetail
│       ├── components/         # Reusable UI components
│       ├── hooks/              # useSocket
│       └── services/           # API client
├── docker-compose.yml
└── .github/workflows/ci-cd.yml
```

## 🧪 Testing

```bash
# Backend unit tests
cd backend && npm run test

# Backend e2e tests
cd backend && npm run test:e2e

# Frontend build verification
cd frontend && npm run build
```
