# node-ec2-backend

Local Node.js backend using Express, MongoDB, Mongoose, CommonJS, health checks, structured error handling, and Prometheus-compatible metrics.

## Requirements

Node.js 22+
npm
MongoDB Community Edition or MongoDB Atlas

## Installation

For Windows Command Prompt:

```bat
git clone REPOSITORY_URL
cd PROJECT_FOLDER
npm install
copy .env.example .env
npm run dev
```

For Git Bash:

```bash
git clone REPOSITORY_URL
cd PROJECT_FOLDER
npm install
cp .env.example .env
npm run dev
```

## Local MongoDB

Use this local connection string in `.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/node_ec2_backend
```

Confirm MongoDB is running. For Windows service installations:

```powershell
Get-Service MongoDB
```

You can also ping MongoDB with:

```bash
mongosh --eval "db.adminCommand({ ping: 1 })"
```

## MongoDB Atlas

Replace `MONGO_URI` in `.env` with your Atlas connection string:

```env
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER_HOST/node_ec2_backend?retryWrites=true&w=majority
```

Do not commit real credentials. Passwords containing reserved URI characters such as `@`, `:`, `/`, `?`, `#`, `[`, `]`, or `%` must be URL-encoded.

## Run Locally

```bash
npm run dev
```

## Production-Style Local Run

```bash
npm start
```

## Validation

```bash
npm run check
npm test
npm run verify
```

## Endpoint Testing

```bash
curl http://127.0.0.1:5000/
curl http://127.0.0.1:5000/api/health/live
curl http://127.0.0.1:5000/api/health/ready
curl http://127.0.0.1:5000/api/health
curl http://127.0.0.1:5000/metrics
```

Create a test document:

```bash
curl -X POST http://127.0.0.1:5000/api/tests \
  -H "Content-Type: application/json" \
  -d '{"name":"Local Test","message":"MongoDB is working","status":"active"}'
```

PowerShell examples:

```powershell
Invoke-RestMethod http://127.0.0.1:5000/api/health
```

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri http://127.0.0.1:5000/api/tests `
  -ContentType "application/json" `
  -Body '{"name":"Local Test","message":"MongoDB is working","status":"active"}'
```
