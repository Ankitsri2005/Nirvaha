# 🌿 FoodTrace — Agri Cold-Chain Traceability Platform

> **Farm → IoT Cold Chain → Buyer** — every batch of food gets a verifiable digital identity and is monitored continuously from harvest to delivery.

## 🔗 Live Demo

**[https://foodtrace-demo.vercel.app](https://foodtrace-demo.vercel.app)** *(replace with your deployed URL)*

Sign in with any of these — all use the password `demo1234`:

| Username          | Role        |
| ----------------- | ----------- |
| `kadam.farm`      | Farmer      |
| `ravi.transit`    | Transporter |
| `anita.cold`      | Warehouse   |
| `admin.farmchain` | Admin       |

---

## 🚨 The Problem We Are Solving

**Food safety and waste are information problems, not production problems.**

Every year:
- **420,000 people die** from foodborne illness caused by food that was mishandled during transport — with no way to trace *when* or *where* it happened.
- **1/3 of all food produced** is wasted, much of it due to cold-chain failures that go undetected until the food reaches the retailer or consumer.
- A consumer **cannot verify** where their food came from or whether it was kept at a safe temperature.
- A distributor **cannot prove** the cold chain was never broken — disputes between farmers, transporters, and buyers are resolved on trust, not data.

The root cause: **no single source of truth** that follows food through the supply chain.

### What we built

FoodTrace gives every batch a **digital passport** that travels with the physical batch:

| Layer | What it does |
|---|---|
| **IoT Hardware** | ESP32 sensors sample temperature, humidity, gas, GPS, door/tamper state and uplink over Wi-Fi |
| **Offline-first sync** | Readings buffered to microSD — a network outage never loses data; device syncs and de-duplicates on reconnect |
| **Alert engine** | Every reading checked against per-category thresholds and a trained ML model. Breaches raise alerts with exact value, threshold, location, and time |
| **Blockchain ledger** | Each custody handover is hashed and anchored to a Solidity contract — history cannot be silently rewritten |
| **ML spoilage risk** | Isolation Forest flags anomalies; Random Forest returns Low / Medium / High spoilage risk with every reading |
| **Live dashboard** | Role-based views for farmers, transporters, warehouse operators, and buyers — GPS map, sensor cards, alert console, traceability timeline |

---

## 📁 Repository Layout

| Path          | Purpose                                                     |
| ------------- | ----------------------------------------------------------- |
| `frontend/`   | React + Vite + Tailwind dashboard (Phase 1 — **complete**)  |
| `backend/`    | FastAPI service (REST + MQTT ingest + WebSocket telemetry)  |
| `simulator/`  | Device simulator — demo the whole system without hardware   |
| `database/`   | PostgreSQL schema, indexes, seed data                       |
| `blockchain/` | Solidity contract + Hardhat project for ledger anchoring    |
| `ml/`         | Spoilage prediction model (notebooks, dataset, `.pkl`)      |
| `hardware/`   | ESP32 firmware and per-sensor wiring notes (later phase)    |
| `docs/`       | Abstract, architecture, workflow, tech stack, DB design     |

---

## 🚀 Running Locally (Phase 1 — no backend needed)

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

The dashboard runs entirely off mock data. No database, no hardware, no API keys required.

```bash
npm test           # import audit + simulation engine + full-app render
npm run build      # production bundle
```

---

## 🐳 Full Stack Setup (planned — phases 2+)

```bash
cp .env.example .env
docker compose up -d --build
```

| Service   | URL                        |
| --------- | -------------------------- |
| Dashboard | http://localhost:5173      |
| API docs  | http://localhost:8000/docs |

Without Docker:

```bash
cd backend  && pip install -r requirements.txt && uvicorn app.main:app --reload
cd frontend && npm install && npm run dev
```

---

## 🗺 Build Phases

| Phase | Scope                               | Status       |
| ----- | ----------------------------------- | ------------ |
| 1     | Frontend with mock data + demo mode | ✅ Complete  |
| 2     | Database + FastAPI backend core     | 🔲 Planned   |
| 3     | Simulator, MQTT, alerts, SD sync    | 🔲 Planned   |
| 4     | Connect frontend to live backend    | 🔲 Planned   |
| 5     | ML spoilage risk model              | 🔲 Planned   |
| 6     | Blockchain ledger anchoring         | 🔲 Planned   |
| 7     | Testing, deployment, demo video     | 🔲 Planned   |

Phase dependencies:

```
Backend    2 → 3 → 4
Frontend   1 → 4
ML         5 → (served from backend, consumed by 4)
Blockchain 6 → (served from backend, consumed by 4)
Deploy     7 needs 1-6
```

Phase 1 is **independent** — the frontend runs off mock data and can be demoed before any API exists.

---

## 🔬 Demo Scenarios

| Scenario       | What it demonstrates                                  |
| -------------- | ----------------------------------------------------- |
| `normal`       | Steady cold chain, movement along route, all green    |
| `temp_breach`  | Temperature passes limit → red alert, batch flagged   |
| `sensor_fault` | Sensor goes silent → last valid reading + maintenance |
| `tamper`       | Door opened mid-route → tamper alert                  |
| `offline`      | Network drops → SD buffering, then de-duplicated sync |
| `spoilage`     | ML risk crosses threshold → predictive alert          |

---

## 📄 Documentation

- [`docs/abstract.md`](docs/abstract.md) — project abstract
- [`docs/system-architecture.md`](docs/system-architecture.md) — components and data flow
- [`docs/workflow.md`](docs/workflow.md) — end-to-end batch lifecycle
- [`docs/technology-stack.md`](docs/technology-stack.md) — chosen tools and rationale

---

## ⚙️ Hardware 

ESP32 + DS18B20 (temperature) + DHT22 (humidity) + MQ-135 (gas) + NEO-6M (GPS) + tamper switch on door. Readings buffered to microSD, uplinked over Wi-Fi. The hardware and simulator paths hit identical endpoints — late-arriving hardware never blocks a working demo.
