# PayNest Real-Time Bidding System

A robust, real-time auction platform built with **NestJS**, **React**, **Sequelize (PostgreSQL)**, and **WebSocket (Socket.IO)**.

**🚀 Live Application:** [playground-paynest-interview-iyikve-7171b6-159-195-50-172.traefik.me](http://playground-paynest-interview-iyikve-7171b6-159-195-50-172.traefik.me)

---

## 🏗️ Technical Approach

The system follows a modern microservices-ready architecture using the **Repository Pattern** and **Domain-Driven Design (DDD)** principles in the backend.

- **Backend (NestJS)**: Selected for its modularity and first-class TypeScript support. It uses **Sequelize** as the ORM to manage PostgreSQL interactions with strong typing and transaction safety.
- **Frontend (React + Vite)**: Built with a focus on real-time updates and a premium user experience. It uses **Socket.IO** for live bidding feedback and **Tailwind CSS** for a polished, dark-themed UI.
- **Real-Time Layer**: A dedicated WebSocket gateway handles bidirectional communication for bids and countdowns, ensuring users see the latest price without refreshing.

## 🔑 Key Decisions

1.  **Hybrid Bidding Logic**: Combining **Pessimistic Row-Level Locking** (to handle the majority of concurrent bids) with **Optimistic Versioning** (to catch rare edge cases where a transaction might bypass a lock).
2.  **Containerized Deployment**: Using **Docker** to ensure the environment is identical from local development to production, eliminating "works on my machine" issues.
3.  **Traefik-First Routing**: Leveraging Traefik as a reverse proxy to handle SSL and routing, allowing internal services to stay isolated on a private bridge network.
4.  **Simplified Networking**: Removing host port mappings in production to force all traffic through the proxy, significantly hardening the attack surface.

## 🛡️ Robustness & Scalability

- **Error Resilience**: The frontend implements a global `ErrorBoundary` to gracefully handle unexpected UI crashes.
- **Security Hardening**: Docker services use `security_opt` and `cap_drop` to restrict container permissions to the absolute minimum required.
- **Database Optimization**: PostgreSQL indexes are implemented on `status` and `endTime` columns for fast retrieval of active auctions.
- **Horizontal Scaling**: The architecture is stateless, allowing the `backend` service to be scaled to multiple replicas behind the Traefik load balancer.

## 🏎️ Race Condition Handling

We addressed concurrent bidding using a **two-tier strategy**:
1.  **Row-Level Locking**: `transaction.LOCK.UPDATE` is used when fetching an auction to place a bid, preventing other transactions from modifying it until the current bid is committed.
2.  **Optimistic Locking**: The `AuctionItem` model uses a `version` field. If two transactions somehow conflict, the database rejects the second one, throwing a `SequelizeOptimisticLockError`.
3.  **Conflict Response**: The API handles these conflicts and returns a user-friendly `409` status code.

## 🔄 CI/CD & Deployment

The project uses **GitHub Actions** for an automated pipeline. To run the pipeline:
1.  **Push to main**: Any commit to the `main` branch automatically triggers the `.github/workflows/ci-cd.yml`.
2.  **Validation & Build**: The pipeline runs lints, builds the React frontend, and packages both services into Docker images.
3.  **Deployment**: A secure webhook environment variable `DOKPLOY_COMPOSE_WEBHOOK` must be configured in your GitHub Secrets. The pipeline triggers a redeploy on **Dokploy** using a `POST` request with the `X-GitHub-Event: push` header.

---

## 🚀 Local Setup

### 1. Prerequisites
- **Docker** and **Docker Compose** installed.
- (Optional) **Node.js 20+** if running manually.

### 2. Run with Docker (Recommended)
Building and starting the containers is a single command:
```bash
docker compose up --build
```
- **Frontend**: [http://localhost:9001](http://localhost:9001)
- **Backend API**: [http://localhost:9000/api](http://localhost:9000/api)

### 3. Manual Development Setup
1.  **Backend**: 
    - `cd backend && npm install`
    - Configure `.env` with database credentials.
    - `npm run start:dev`
2.  **Frontend**: 
    - `cd frontend && npm install`
    - `npm run dev`

---

## 📡 Deliverables Summary
- **Live Link**: [Deployed App](http://playground-paynest-interview-iyikve-a69193-159-195-50-172.traefik.me/)
- **Source Code**: [GitHub Repository](https://github.com/lazy-d3v/paynest_interview_task)
- **Backend**: NestJS + Sequelize (PostgreSQL)
- **Frontend**: ReactJS + Socket.IO
- **Docker**: Included for both services with `docker-compose.yml`.
