# Gellsoft Licensing Server

Node.js + TypeScript + Express + PostgreSQL backend for license activation and subscription control.

## Features

- Health endpoint
- Readiness endpoint with Postgres connectivity check
- Vendor-protected customer creation
- Vendor-protected license generation
- Client activation validation endpoint
- Vendor-protected license status endpoint
- Request logging and structured error handling

## Prerequisites

- Node.js 20+
- PostgreSQL 14+

## Setup

1. Copy `.env.example` to `.env` and update values.
2. Install dependencies:
   - `npm install`
3. Run migrations:
   - `npm run migrate`
4. Start development server:
   - `npm run dev`

## Scripts

- `npm run dev` - start dev server with watch mode
- `npm run build` - compile TypeScript
- `npm run typecheck` - run strict TypeScript checks without emit
- `npm run lint` - run ESLint checks
- `npm run lint:fix` - auto-fix lint issues where possible
- `npm run start` - run compiled server
- `npm run migrate` - apply SQL files in `migrations/`

## API Endpoints

- `GET /health`
- `GET /health/ready`
- `POST /api/customers` (vendor auth)
- `POST /api/licenses/generate` (vendor auth)
- `POST /api/licenses/activate-validate`
- `POST /api/licenses/status` (vendor auth)

Vendor auth header:

- `x-vendor-token: <VENDOR_API_TOKEN>`

## Example Payloads

Create customer:

```json
{
  "name": "ABC Traders",
  "contactEmail": "owner@abctraders.in",
  "contactPhone": "+91-9000000000"
}
```

Generate license:

```json
{
  "customerId": 1,
  "productName": "Gellsoft Billing Software",
  "maxMachines": 2,
  "validDays": 365
}
```

Activation validate:

```json
{
  "licenseKey": "GS-AAAAAA-BBBBBB-CCCCCC-DDDDDD",
  "machineId": "MACHINE-UNIQUE-ID",
  "appVersion": "0.1.0"
}
```

## VS Code

- Task: `Licensing Server: Dev`
- Task: `Licensing Server: Build`
- Launch config: `Licensing Server: Dev` or `Licensing Server: Build+Start`
# licensing_server
