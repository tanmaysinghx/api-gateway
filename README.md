# 🌌 TS API Gateway 1701

A production-grade, high-performance API Gateway written in **pure Go (Golang)**. 

This gateway leverages **Single-Port Multiplexing (h2c)** to serve standard HTTP/1.1 REST requests, legacy XML-based SOAP services, and binary-framed HTTP/2 gRPC streams simultaneously on a **single unified port (`8080`)** with zero deployment downtime.

---

## 🚀 Key Features

* **Single-Port h2c Multiplexing:** Routes REST (HTTP/1.1), SOAP (HTTP/1.1 XML), and gRPC (HTTP/2 protobuf cleartext) on port `8080` without requiring TLS setup.
* **Dynamic Control Plane:** Zero-downtime additions and removals of microservice clusters via standard JSON REST endpoints or our dynamic management console.
* **Dynamic Load Balancing:** Thread-safe execution of **Round Robin**, **Random**, and **Least Connections** load-balancing algorithms across registered service nodes.
* **Active Health Checker:** Background polling worker that executes routine HTTP GET pings (REST/SOAP) and TCP-port checks (gRPC) on a 5-second interval.
* **Integrated Security & Ingress:**
  * **Token-Bucket Rate Limiter:** Built-in client-IP based rate limiting (defaults to 10 req/s, 15 burst).
  * **JWT Authentication:** Cryptographic JWT validation for secured routes with custom exclusions.
  * **Structured JSON Logging:** Native high-performance structured logs feeding into a live circular ring buffer.
  * **CORS & Crash Recovery:** Standard CORS support and system panic recovery.
* **Embedded Monitoring Dashboard:** A futuristic glassmorphic single-page console embedded directly in the gateway binary (compiled in via Go `embed.FS`).

---

## 📂 Project Directory Layout

The codebase adheres strictly to enterprise Go directory layouts, separating the **Data Plane** (traffic proxying) from the **Control Plane** (registry management & admin API):

```
ts-api-gateway-1701/
├── cmd/
│   └── gateway/
│       └── main.go           # Server entrypoint (orchestrates gateway and mock nodes)
├── internal/
│   ├── admin/                # Control Plane: REST CRUD handlers for services & logs
│   │   └── handler.go
│   ├── config/               # Operational environment settings & defaults
│   │   └── config.go
│   ├── gateway/              # Data Plane: Reverse Proxy, Multiplexers, Load Balancers
│   │   ├── loadbalancer.go   # Round Robin, Random, Least Connections
│   │   ├── middleware.go     # Logger, JWT Authenticator, Rate Limiter, CORS
│   │   ├── proxy.go          # Custom ReverseProxy for HTTP/1.1 & HTTP/2 H2C
│   │   └── router.go
│   └── registry/             # Concurrency-safe service registry & active health checker
│       ├── models.go         # Struct representations for Services & Instances
│       └── registry.go       # Core lookup map & active background ping routine
├── mocks/
│   └── mocks.go              # Verification suite: REST mock nodes, SOAP XML mock, gRPC mock
├── web/                      # Embedded Admin Console Static Assets
│   ├── templates/
│   │   └── index.html        # Glassmorphic HTML5 template
│   ├── static/
│   │   ├── css/
│   │   │   └── dashboard.css # Futuristic stylesheet & keyframe pulses
│   │   └── js/
│   │       └── dashboard.js  # Live stats, autoscrolling terminal, and provision forms
│   └── embed.go              # Go standard embed compiler config
├── go.mod
└── go.sum
```

---

## 📦 Prerequisites

* **Go (Golang) compiler:** Version `1.20` or higher.
* **Homebrew (Optional for macOS):** Command `brew install go` is used if Go is not already installed.

---

## 🛠️ Installation & Compilation

Follow these simple commands to download, build, and run the API Gateway ecosystem.

### Step 1: Install Dependencies
Download required third-party routing, validation, and streaming dependencies:
```bash
go mod tidy
```

### Step 2: Compile the Binary
Build the self-contained production binary (this packs all HTML, CSS, and JS files directly inside the executable):
```bash
go build -o gateway cmd/gateway/main.go
```

### Step 3: Launch the API Gateway
You can run the gateway in **Standalone Production Mode** or **Sandbox Mock Mode**:

#### Option A: Standalone Production Mode (Default)
Run as a clean standalone gateway, standing by to route live microservice traffic (no mock servers are launched):
```bash
./gateway
```

#### Option B: Sandbox Mock Mode (For Local Testing)
Run with the `-mock` flag to automatically boot **four mock backend microservices** on ports `8081`, `8082`, `8083`, and `50051` for immediate sandbox validation:
```bash
./gateway -mock
```

Once started in Sandbox Mode, you will see mock node initialization logs:
```
[SYSTEM] Gateway port :8080 initialized.
[SYSTEM] Mock REST instances started on :8081 and :8082
[SYSTEM] Mock SOAP XML service started on :8083
[SYSTEM] Mock binary gRPC health service started on :50051
[SYSTEM] Dashboard accessible at http://localhost:8080/admin
```

### Alternative: Run with Docker

For a fully self-contained deployment with zero local Go compiler dependencies, you can compile and launch the entire gateway ecosystem using our optimized Docker setup:

#### 1. Build the Hardened Docker Image
Build the multi-stage, space-optimized container image:
```bash
docker build -t ts-api-gateway-1701 .
```

#### 2. Launch the Gateway Container
Run the container in standalone production mode (mapping port `8080` to your host machine):
```bash
docker run -d --name ts-api-gateway-1701 -p 8080:8080 ts-api-gateway-1701
```
*(To run with sandbox mock backends enabled inside Docker, simply append the `-mock` flag to your run command):*
```bash
docker run -d --name ts-api-gateway-1701 -p 8080:8080 ts-api-gateway-1701 -mock
```

#### 3. View Real-Time Logging Traces
Verify that the server and environments are booted:
```bash
docker logs -f ts-api-gateway-1701
```

Once running, the glassmorphic console is available immediately at **[http://localhost:8080/admin](http://localhost:8080/admin)**!

To stop and remove the container:
```bash
docker stop ts-api-gateway-1701 && docker rm ts-api-gateway-1701
```

---

## 📊 Real-Time Observability (Prometheus & Loki Stack)

The TS API Gateway features built-in **Prometheus metrics logging** and structured **JSON console output compatible with Grafana Loki** out-of-the-box!

We have provided a complete, pre-configured **Docker Compose Monitoring Stack** that spins up the entire observability infrastructure with a single command:

### 1. Spin up the Observability Pipeline
To launch the TS API Gateway (with sandboxed mock servers active to generate telemetry), Prometheus, Loki, Promtail, and Grafana simultaneously, run:
```bash
docker-compose up -d
```

### 2. Services Exposed on Host
Once booted, the following interfaces are fully accessible in your browser:

| Service | Host Port | Ingress Console URL | Default Credentials |
| :--- | :---: | :--- | :--- |
| **TS API Gateway** | `8080` | **[http://localhost:8080/admin](http://localhost:8080/admin)** | `tanmaysinghx@gmail.com` / `Tanmay@1999` |
| **Grafana Dashboard** | `3000` | **[http://localhost:3000](http://localhost:3000)** | `admin` / `admin` |
| **Prometheus Exporter** | `9090` | **[http://localhost:9090/graph](http://localhost:9090)** | *None (Public Scraper)* |
| **Loki Log Engine** | `3100` | `http://localhost:3100/loki/api/v1/status` | *Internal API* |

### 3. Visualizing Metrics & Logs inside Grafana
1. Navigate your browser to **[http://localhost:3000](http://localhost:3000)** and log in with username `admin` and password `admin`.
2. Both **Prometheus** and **Loki** data sources are automatically provisioned and connected!
3. Go to the **Explore** tab inside Grafana:
   - **For Metrics:** Select the **Prometheus** datasource and run search queries like `ts_gateway_requests_total` (total metrics by status code and route) or `ts_gateway_active_connections` (live active concurrent sockets) to see gorgeous real-time graphs!
   - **For Logs:** Select the **Loki** datasource and run query `{container="ts-api-gateway"}` to see your structured Go application logs streaming instantly in color!

To tear down the observability stack:
```bash
docker-compose down
```

---

## 🖥️ Interactive Verification Guide

By default, the gateway boots with an empty service catalog. You can provision, scale, and test backend microservices dynamically.

### Part 1: Open the Console
Navigate your browser to:
👉 **[http://localhost:8080/admin](http://localhost:8080/admin)**

You will be greeted by the secure login screen. Enter the administrator credentials:
- **Admin Username:** `tanmaysinghx@gmail.com`
- **Security Password:** `Tanmay@1999`

Once authenticated, you will be transitioned to the **TS API Gateway Control Console**, featuring modern glassmorphic statistics widgets, real-time node grids, an autoscrolling stdout terminal line, and theme selectors.

---

### Part 2: Register & Scale Backend Services

You can register services dynamically by filling out the **"Register Microservice" form** in the sidebar, or by sending standard `POST` commands directly to the Control Plane API.

#### Middleware Configuration Options:
When registering, you can set custom rules for each service:
* `requires_auth` (`bool`): Directs the gateway to enforce strict cryptographic JWT token validation for this service.
* `rate_limit_limit` (`float64`): Specific requests-per-second limit allocated to this cluster (use `0` for unlimited).
* `rate_limit_burst` (`int`): Specific burst capacity limit allocated to this cluster (use `0` for unlimited).

#### 1. Register the Load-Balanced REST Users Cluster (Go)
Form Inputs:
* **Service ID:** `users-cluster`
* **Service Name:** `Users Profiles Service`
* **Route Path Prefix:** `/api`
* **Health Endpoint:** `/health`
* **Protocol:** `REST` | **Tech Stack:** `Go` | **LB Policy:** `RoundRobin`
* **Rate Limit (RPS):** `5.0` | **Burst:** `10` | **Enforce Auth:** `true` (Checked)
* **Service Nodes:** `http://localhost:8081` and `http://localhost:8082`

*Alternative API Call:*
```bash
curl -i -X POST -H "Content-Type: application/json" -d '{
  "id": "users-cluster",
  "name": "Users Profiles Service",
  "prefix": "/api",
  "protocol": "REST",
  "tech_stack": "Go",
  "health_check_path": "/health",
  "load_balancer_policy": "RoundRobin",
  "instances": ["http://localhost:8081", "http://localhost:8082"],
  "requires_auth": true,
  "rate_limit_limit": 5.0,
  "rate_limit_burst": 10
}' http://localhost:8080/admin/api/services
```

#### 2. Register the Legacy SOAP XML Service
Form Inputs:
* **Service ID:** `soap-billing`
* **Service Name:** `SOAP Legacy Billing API`
* **Route Path Prefix:** `/soap`
* **Health Endpoint:** `/health`
* **Protocol:** `SOAP` | **Tech Stack:** `SOAP-Legacy` | **LB Policy:** `RoundRobin`
* **Service Nodes:** `http://localhost:8083`

*Alternative API Call:*
```bash
curl -i -X POST -H "Content-Type: application/json" -d '{
  "id": "soap-billing",
  "name": "SOAP Legacy Billing API",
  "prefix": "/soap",
  "protocol": "SOAP",
  "tech_stack": "SOAP-Legacy",
  "health_check_path": "/health",
  "load_balancer_policy": "RoundRobin",
  "instances": ["http://localhost:8083"]
}' http://localhost:8080/admin/api/services
```

#### 3. Register the High-Performance gRPC Engine
Form Inputs:
* **Service ID:** `grpc-engine`
* **Service Name:** `Core gRPC Engine`
* **Route Path Prefix:** `/grpc.health.v1.Health`
* **Health Endpoint:** *(leave blank)*
* **Protocol:** `gRPC` | **Tech Stack:** `Go` | **LB Policy:** `RoundRobin`
* **Service Nodes:** `http://localhost:50051`

*Alternative API Call:*
```bash
curl -i -X POST -H "Content-Type: application/json" -d '{
  "id": "grpc-engine",
  "name": "Core gRPC Engine",
  "prefix": "/grpc.health.v1.Health",
  "protocol": "gRPC",
  "tech_stack": "Go",
  "health_check_path": "",
  "load_balancer_policy": "RoundRobin",
  "instances": ["http://localhost:50051"]
}' http://localhost:8080/admin/api/services
```

*(Note: Within 5 seconds, the background health-checker pings each node and updates its indicator to neon-green on your browser!)*

---

### Part 3: Verify Data-Plane Ingress & Routing

With backends registered, run these test commands to verify multi-protocol routing over our multiplexed single port:

#### A. Verify REST Proxying & Load Balancing (Round-Robin)
Make multiple sequential `curl` requests to the gateway:
```bash
curl -i http://localhost:8080/api/users
```
Look at the returned header `X-Backend-Server` and body string. You will see traffic alternating evenly between `REST-Server:8081` and `REST-Server:8082` on consecutive calls!

#### B. Verify Legacy SOAP XML Payload Forwarding
POST a SOAP envelope requesting user `UserId=1`:
```bash
curl -X POST -H "Content-Type: text/xml" -H "SOAPAction: GetUser" \
-d '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"><soapenv:Body><GetUserRequest><UserId>1</UserId></GetUserRequest></soapenv:Body></soapenv:Envelope>' \
http://localhost:8080/soap/ws/users
```
The gateway will forward the request to the SOAP server on port `8083`. The SOAP server will parse the XML and return a fully compliant SOAP envelope showing Gregory House, MD!

#### C. Verify Binary gRPC Routing (Cleartext HTTP/2)
Since gRPC utilizes binary framing, use our pre-compiled client script to make a call to `grpc.health.v1.Health/Check` through the gateway:
```bash
go run scratch/grpc_client.go
```
*Expected Output:*
```
=================================
   gRPC ROUTING VERIFICATION   
=================================
gRPC Call Status : SUCCESS
Response Status  : SERVING
Endpoint Path    : /grpc.health.v1.Health/Check
=================================
```

---

### Part 4: Test Security Middlewares

#### 1. Rate-Limiting Demonstration
Run a loop to flood the gateway:
```bash
for i in {1..20}; do curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8080/api/users; done
```
You will observe that standard requests succeed (status `200`), but once the burst rate limit of `15` is crossed, the gateway blocks subsequent calls with HTTP status `429 Too Many Requests`.

#### 2. JWT Authentication Demonstration
Query the secured users endpoint:
```bash
curl -i http://localhost:8080/secured/data
```
The gateway blocks the call with `401 Unauthorized`.

To bypass:
1. Go to the **"Developer Sandbox"** panel at the bottom-left of your dashboard.
2. Click **"Generate JWT Token"**.
3. Copy the signature payload (starts with `Bearer eyJhbG...`).
4. Append this token to your request header:
```bash
curl -i -H "Authorization: Bearer <YOUR_GENERATED_JWT_TOKEN>" http://localhost:8080/secured/data
```
The gateway will validate the token signature, authorize the request, and route it to your backend!

---

## 🧹 Tearing Down

To stop the gateway server and all mock backend processes concurrently, simply hit `Ctrl + C` in the running terminal. The server will intercept the interrupt signal, run graceful shutdowns, and terminate safely!
# ts-api-gateway-1701
