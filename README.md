# 🌌 TS API Gateway

A production-grade, high-performance API Gateway written in **pure Go (Golang)**. 

This gateway leverages **Single-Port Multiplexing (h2c)** to serve standard HTTP/1.1 REST requests, XML-based SOAP services, and binary-framed HTTP/2 gRPC streams simultaneously on a **single unified port (`8080` / `1701`)** with zero deployment downtime.

---

## 🚀 Key Features

* **Single-Port h2c Multiplexing:** Routes REST (HTTP/1.1), SOAP (HTTP/1.1 XML), and gRPC (HTTP/2 protobuf cleartext) without requiring TLS setup.
* **Premium Corporate Console:** Clean, enterprise-grade, light-themed admin dashboard utilizing the official TS logo and a signals-driven push notification engine.
* **Service Config Persistence:** Safe, thread-safe local file persistence saving your active service routing mappings automatically in `./services.json`. No configurations are lost on redeployments or container restarts.
* **Config Import/Export:** Single-click configuration **download (Export)** and **upload (Import)** toolbar inside the console for rapid gateway setup, backups, and staging.
* **Dynamic Load Balancing:** Thread-safe execution of **Round Robin**, **Random**, and **Least Connections** load-balancing algorithms across registered service nodes.
* **Active Health Checker:** Background polling worker that executes routine HTTP GET pings (REST/SOAP) and TCP-port checks (gRPC) on a 5-second interval.
* **Integrated Security & Ingress:**
  * **Token-Bucket Rate Limiter:** Built-in client-IP based rate limiting (configurable per service cluster).
  * **JWT Authentication:** Cryptographic JWT validation for secured routes with custom exclusions.
  * **Structured JSON Logging:** Native high-performance structured logs feeding into a live circular ring buffer.
  * **CORS & Crash Recovery:** Built-in CORS support and system panic recovery.

---

## 🖥️ UI Frontend Development & Compilation

The administration dashboard is a modern single-page Angular application embedded directly inside the compiled Go binary using the standard `embed.FS` compiler directive.

Before committing, pushing, or deploying, you must compile your frontend edits and bundle them into Go.

### Directory Mapping
* **Frontend Source Code:** `web-src/`
* **Go Embedding Targets:** `web/static/` and `web/templates/`

### Compilation Steps (Local Build Workflow)

#### Step 1: Install Node Dependencies
Navigate to the Angular directory and install dependencies:
```bash
cd web-src
npm install
```

#### Step 2: Local Development Server
To launch the Angular dev server on port `4200` (it will automatically proxy telemetry and API calls to your local Go gateway running on `1701`):
```bash
npm start
```

#### Step 3: Compile and Embed Frontend Bundle
To compile the Angular code for production and automatically stage the outputs into Go’s embedding folder, run our automation script from the project root:
```bash
./build-ui.sh
```
*This script cleans old bundles, triggers production compiler trees with strict routing baselines (`/admin/`), and stages assets into `web/static` and `web/templates/`.*

#### Step 4: Compile Go Binary
With the frontend files staged, compile your self-contained Go executable binary:
```bash
go build -o gateway cmd/gateway/main.go
```
*The output `gateway` binary includes all HTML, styles, scripts, and cropped logo assets bundled directly into its code footprint!*

---

## 📂 Project Directory Layout

```
ts-api-gateway-1701/
├── cmd/
│   └── gateway/
│       └── main.go           # Server entrypoint
├── internal/
│   ├── admin/                # Control Plane: REST APIs, Import/Export handlers
│   │   └── handler.go
│   ├── config/               # Operational settings & environments
│   │   └── config.go
│   ├── gateway/              # Data Plane: Reverse Proxy, Rate Limiter, JWT, CORS
│   │   ├── loadbalancer.go
│   │   ├── middleware.go
│   │   ├── proxy.go
│   │   └── router.go
│   └── registry/             # Concurrency-safe registry, health checks, persistence
│       ├── models.go
│       └── registry.go
├── mocks/
│   └── mocks.go              # Sandbox Suite: REST, SOAP, and gRPC test server nodes
├── web/                      # Embedded assets loaded into Go embed.FS
│   ├── templates/            # index.html entry shell
│   ├── static/               # JS, CSS bundles, and cropped logo assets
│   └── embed.go              # Go embedding compiler configuration
├── web-src/                  # Frontend: Source code of the Angular Administration Portal
└── build-ui.sh               # Automation script to compile UI and stage into Go
```

---

## 📦 Prerequisites

* **Go (Golang) Compiler:** Version `1.20` or higher.
* **Node.js:** Version `18.x` or higher (with `npm`).

---

## 🛠️ Deployment & Launch

You can run the gateway in **Standalone Production Mode** or **Sandbox Mock Mode**:

### Option A: Standalone Production Mode (Default)
Run as a clean standalone gateway, standing by to route live microservice traffic (reads `./services.json` on boot to restore routes):
```bash
./gateway
```

### Option B: Sandbox Mock Mode (For Local Testing)
Run with the `-mock` flag to automatically boot **four mock backend microservices** on ports `8081`, `8082`, `8083`, and `50051` for immediate sandbox validation:
```bash
./gateway -mock
```

---

## 📊 Real-Time Observability (Prometheus & Loki Stack)

The TS API Gateway features built-in **Prometheus metrics logging** and structured **JSON console output compatible with Grafana Loki** out-of-the-box!

We have provided a complete, pre-configured **Docker Compose Monitoring Stack** that spins up the entire observability infrastructure with a single command:

### 1. Spin up the Observability Pipeline
To launch the TS API Gateway, Prometheus, Loki, Promtail, and Grafana simultaneously, run:
```bash
docker-compose up -d
```

### 2. Services Exposed on Host

| Service | Host Port | Ingress Console URL | Default Credentials |
| :--- | :---: | :--- | :--- |
| **TS API Gateway** | `8080` | **[http://localhost:8080/admin](http://localhost:8080/admin)** | `tanmaysinghx@gmail.com` / `Tanmay@1999` |
| **Grafana Dashboard** | `3000` | **[http://localhost:3000](http://localhost:3000)** | `admin` / `admin` |
| **Prometheus Exporter** | `9090` | **[http://localhost:9090/graph](http://localhost:9090)** | *None (Public Scraper)* |

---

## 🧹 Tearing Down

To stop the gateway server and all mock backend processes concurrently, simply hit `Ctrl + C` in the running terminal. The server will intercept the interrupt signal, run graceful shutdowns, and terminate safely!
