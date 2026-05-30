# 🚀 HR AI Multi-Tenant SaaS Platform — Backend Architecture

Welcome to the **HR AI Multi-Tenant SaaS Platform** backend repository. This project is built using a domain-driven, microservice-based architecture featuring **9 NestJS Fastify microservices**, **5 shared monorepo packages**, and a fully Dockerized local infrastructure stack.

---

## 🏗️ Monorepo Tech Stack

* **Core**: NestJS (v10) + Fastify (high-performance HTTP engine)
* **Monorepo Manager**: Yarn Workspaces + Turborepo (v2)
* **Database & ORM**: Prisma ORM + PostgreSQL 16 (with `pgvector` for semantic candidate search)
* **Event Bus & Queues**: Redis (v7) + BullMQ (CloudEvents 1.0 specifications)
* **Third-Party Integrations**: Resend (Emails), MinIO (S3-compatible File Storage), Mailpit (Local SMTP)

---

## ⚙️ First-Time System Setup

Follow these steps in order to set up your local development environment or EC2 server.

### Step 1: Spin up Infrastructure Containers
Start the required databases, queues, and object storage:
```bash
docker compose -f infra/docker-compose.yml up -d
```
*This starts: PostgreSQL, Redis, MinIO (S3), Mailpit (SMTP catchall), and Redis Commander (Queue UI).*

### Step 2: Configure Environment Variables (`.env` Files)
Each microservice requires its own `.env` file containing connection string parameters. Use the automated setup script corresponding to your operating system to generate all 9 `.env` files automatically:

#### 🐧 On Linux / macOS / EC2 (Bash):
Run this in the root of your project:
```bash
declare -A services=(
    ["identity-service"]="identity_db"
    ["job-service"]="job_db"
    ["candidate-service"]="candidate_db"
    ["pipeline-service"]="pipeline_db"
    ["document-service"]="document_db"
    ["ai-service"]="ai_db"
    ["communication-service"]="communication_db"
    ["audit-service"]="audit_db"
)

for serviceName in "${!services[@]}"; do
    dbName=${services[$serviceName]}
    examplePath="apps/$serviceName/.env.example"
    envPath="apps/$serviceName/.env"
    
    if [ -f "$examplePath" ]; then
        cp "$examplePath" "$envPath"
        sed -i "s|^DATABASE_URL=.*|DATABASE_URL=\"postgresql://postgres:postgres@localhost:5432/$dbName\"|g" "$envPath"
        echo "✅ Configured .env for $serviceName"
    fi
done

if [ -f "apps/api-gateway/.env.example" ]; then
    cp "apps/api-gateway/.env.example" "apps/api-gateway/.env"
    echo "✅ Configured .env for api-gateway"
fi
```

#### 🪟 On Windows (PowerShell):
Run this in your PowerShell terminal:
```powershell
$services = @{
    "identity-service"      = "identity_db"
    "job-service"           = "job_db"
    "candidate-service"     = "candidate_db"
    "pipeline-service"      = "pipeline_db"
    "document-service"      = "document_db"
    "ai-service"            = "ai_db"
    "communication-service" = "communication_db"
    "audit-service"         = "audit_db"
}

$services.GetEnumerator() | ForEach-Object {
    $serviceName = $_.Key
    $dbName = $_.Value
    $examplePath = "apps\$serviceName\.env.example"
    $envPath = "apps\$serviceName\.env"
    if (Test-Path $examplePath) {
        Copy-Item -Path $examplePath -Destination $envPath -Force
        $content = Get-Content $envPath
        $newUrl = "DATABASE_URL=`"postgresql://postgres:postgres@localhost:5432/$dbName`""
        $content = $content -replace '^DATABASE_URL=.*$', $newUrl
        $content | Set-Content $envPath
        Write-Host "✅ Configured .env for $serviceName" -ForegroundColor Green
    }
}

if (Test-Path "apps\api-gateway\.env.example") {
    Copy-Item -Path "apps\api-gateway\.env.example" -Destination "apps\api-gateway\.env" -Force
    Write-Host "✅ Configured .env for api-gateway" -ForegroundColor Green
}
```

### Step 3: Generate RSA RS256 JWT Keys
Since this multi-tenant system uses highly secure **RS256 JWT signatures**, you must generate an RSA private/public keypair and share the public key with the API Gateway. 

Run this command inside your EC2/Linux terminal to generate the keys, escape them, and inject them into `identity-service` and `api-gateway` `.env` files automatically:
```bash
# 1. Generate keys
openssl genrsa -out private.pem 2048 2>/dev/null
openssl rsa -pubout -in private.pem -out public.pem 2>/dev/null

# 2. Format to single-line variables
priv_key=$(awk '{printf "%s\\n", $0}' private.pem)
pub_key=$(awk '{printf "%s\\n", $0}' public.pem)

# 3. Inject keys
sed -i "s|^JWT_PRIVATE_KEY=.*|JWT_PRIVATE_KEY=\"$priv_key\"|g" apps/identity-service/.env
sed -i "s|^JWT_PUBLIC_KEY=.*|JWT_PUBLIC_KEY=\"$pub_key\"|g" apps/identity-service/.env
sed -i "s|^JWT_PUBLIC_KEY=.*|JWT_PUBLIC_KEY=\"$pub_key\"|g" apps/api-gateway/.env

# 4. Clean up temporary files
rm private.pem public.pem
echo "✅ RSA Keypair successfully generated and injected!"
```

### Step 4: Install Dependencies & Setup Databases
Install packages, generate isolated Prisma database clients, and sync schemas with PostgreSQL:
```bash
# 1. Install workspace dependencies
yarn install

# 2. Generate isolated Prisma clients sequentially (Memory-friendly)
yarn turbo run db:generate --concurrency=1

# 3. Push schemas directly to PostgreSQL databases
yarn turbo run db:push --concurrency=1
```

---

## 🚀 Running the Services

### Option A: Production Mode (Recommended for EC2 / Low-Memory Systems ⚡)
Running services in dev-watch mode (`ts-node`) consumes a massive amount of RAM (~1.8GB minimum). 

In **Production Mode**, Node.js runs pre-compiled JavaScript directly, **cutting RAM usage by 70%** (only ~45MB–60MB per service!). 

```bash
# 1. Build the production output for the entire project
yarn run build

# 2. Run the core services directly using Node in the background:
node apps/api-gateway/dist/main.js &
node apps/identity-service/dist/main.js &
node apps/job-service/dist/main.js &
```

### Option B: Development Mode (For Local Machines with > 8GB RAM)
Runs watch mode with automatic code reloading:
```bash
# Start the entire monorepo stack concurrently
yarn run dev

# OR start a single service individually
yarn --cwd apps/identity-service dev
```

### Option C: Selective Service Development (Recommended for Low Spec local dev)
You only need to run the specific services you are testing. Thanks to decoupled microservice boundaries and graceful degradation, services like the `job-service` will function even if the background `ai-service` or `communication-service` is offline!

Run only the gateway, auth, and jobs stack:
```bash
yarn --cwd apps/api-gateway dev &
yarn --cwd apps/identity-service dev &
yarn --cwd apps/job-service dev &
```

---

## 🔍 Verification & Testing

Verify that a service is online and healthy:
```bash
# Query the Identity Service health endpoint
curl http://localhost:3001/api/v1/health
```

**Expected Response**:
```json
{
  "status": "ok",
  "service": "identity-service",
  "timestamp": "2026-05-30T..."
}
```

---

## 🛠️ Infrastructure Dashboard Endpoints

When your Docker containers are running, you can access the following developer portals:

| Service Portal | URL | Purpose |
|----------------|-----|---------|
| **MinIO Console** | [http://localhost:9001](http://localhost:9001) | View/Manage uploaded candidate resumes (User: `minioadmin` / Pass: `minioadmin`) |
| **Mailpit Console** | [http://localhost:8025](http://localhost:8025) | Local SMTP catch-all UI (view all mock emails sent by `communication-service`) |
| **Redis Commander** | [http://localhost:8081](http://localhost:8081) | Inspect memory usage and BullMQ background task queues |
| **PostgreSQL DB** | `localhost:5432` | Main database (User: `postgres` / Pass: `postgres`) |
