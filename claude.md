# MIXXN Claude - n8n Workflow-to-App System

> Transform n8n workflows into interactive web applications with automatic error handling and seamless deployment

## Table of Contents

- [Project Overview](#project-overview)
- [Quick Start Guide](#quick-start-guide)
- [Architecture](#architecture)
- [Development Setup](#development-setup)
- [n8n Workflows](#n8n-workflows)
- [API Reference](#api-reference)
- [Error Handling](#error-handling)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Resources](#resources)

---

## Project Overview

### What is MIXXN Claude?

MIXXN Claude is a complete system that turns n8n workflows into interactive web applications. It provides bidirectional communication between your Next.js app and n8n workflows, with comprehensive error handling, visual feedback, and automated deployment.

### Key Features

- **Bidirectional Communication** - App sends data to n8n, n8n processes it, and sends results back
- **Automatic Error Correction** - Detects and fixes errors automatically where possible
- **Visual Feedback** - Real-time status indicators for every state (idle, processing, success, error, retrying)
- **Auto-Retry Logic** - Exponential backoff retry mechanism for transient failures
- **Type-Safe** - Full TypeScript support with Zod validation throughout
- **Local Testing** - Test everything locally before deployment
- **One-Click Deployment** - Push to GitHub, deploy to Vercel automatically
- **Beginner-Friendly** - Clear documentation and automation for complex tasks

### Tech Stack

**Frontend:**
- Next.js 14+ (React framework with App Router)
- React 18+ (UI library)
- TypeScript (type safety)
- Tailwind CSS (styling)
- shadcn/ui (component library)
- Zustand (state management)

**Backend/Workflows:**
- n8n (workflow automation)
- Node.js API routes (Next.js)

**Validation & Error Handling:**
- Zod (schema validation)
- Custom error classification system
- Exponential backoff retry logic

**Deployment:**
- GitHub (version control)
- Vercel (hosting and CI/CD)
- Docker (local n8n instance)

---

## Quick Start Guide

### Prerequisites

Before starting, make sure you have:
- Node.js 18 or higher ([Download](https://nodejs.org/))
- Docker Desktop ([Download](https://www.docker.com/products/docker-desktop/))
- Git ([Download](https://git-scm.com/))
- Vercel account (free tier available - [Sign up](https://vercel.com/signup))
- GitHub account ([Sign up](https://github.com/join))

### Setup in 10 Steps

#### Step 1: Install Docker Desktop

Download and install Docker Desktop from [docker.com](https://www.docker.com/products/docker-desktop/). Start Docker Desktop after installation.

#### Step 2: Start n8n Locally

Open your terminal and run:

```bash
docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n
```

This will start n8n on `http://localhost:5678`

#### Step 3: Set Up n8n

1. Open your browser and navigate to `http://localhost:5678`
2. Create your n8n account (email and password)
3. Complete the onboarding wizard
4. Go to Settings → API → Generate API Key
5. Save your API key - you'll need it later

#### Step 4: Navigate to Project Directory

```bash
cd "c:\Users\Rob\Documents\MIXXN Claude"
```

#### Step 5: Install Dependencies

```bash
npm install
```

This will install all required packages including Next.js, React, TypeScript, and more.

#### Step 6: Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# n8n Configuration
N8N_WEBHOOK_URL=http://localhost:5678
N8N_API_KEY=your-api-key-from-step-3
N8N_WEBHOOK_TEST_URL=http://localhost:5678/webhook-test

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=MIXXN Claude
NODE_ENV=development

# Error Handling
MAX_RETRY_ATTEMPTS=3
RETRY_DELAY_MS=1000
REQUEST_TIMEOUT_MS=30000

# Feature Flags
ENABLE_AUTO_RETRY=true
ENABLE_ERROR_LOGGING=true
```

**Replace `your-api-key-from-step-3` with the actual API key from n8n.**

#### Step 7: Import n8n Workflows

1. In n8n (http://localhost:5678), go to **Workflows**
2. Click **Import from File**
3. Import these files from the `workflows/` folder:
   - `echo-test.json`
   - `data-transform.json`
   - `error-simulation.json`
4. Activate each workflow by clicking the toggle switch

#### Step 8: Start Development Server

```bash
npm run dev
```

The app will start on `http://localhost:3000`

#### Step 9: Test the Connection

1. Open `http://localhost:3000` in your browser
2. You should see the MIXXN Claude app interface
3. Try submitting a test message through the Echo Test workflow
4. You should see a success response with your echoed message

#### Step 10: Verify Everything Works

Run through this checklist:
- [ ] n8n is running and accessible at http://localhost:5678
- [ ] All 3 workflows are imported and active
- [ ] Next.js dev server is running at http://localhost:3000
- [ ] Echo Test workflow returns your message successfully
- [ ] Connection status indicator shows "Connected"

**You're ready to build!**

---

## Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────┐
│                   MIXXN Claude System                    │
└─────────────────────────────────────────────────────────┘

┌──────────────────┐              ┌──────────────────┐
│   Next.js App    │◄────────────►│   n8n Instance   │
│  (Frontend UI)   │    HTTPS     │   (Workflows)    │
└──────────────────┘              └──────────────────┘
        │                                  │
        │                                  │
        ▼                                  ▼
┌──────────────────┐              ┌──────────────────┐
│  Error Handler   │              │ Webhook Handler  │
│   & Validator    │              │   & Processor    │
└──────────────────┘              └──────────────────┘
        │                                  │
        └──────────────┬───────────────────┘
                       ▼
              ┌────────────────┐
              │   Data Layer   │
              │  (State Mgmt)  │
              └────────────────┘
```

### Communication Flow

#### Request Flow (App → n8n)

1. **User Interaction** - User fills out form and clicks submit
2. **Client Validation** - TypeScript + Zod validate input on client
3. **API Route Handler** - Request sent to Next.js API route (`/api/workflow/*`)
4. **Request Transformation** - Data enriched with metadata (timestamp, request ID)
5. **n8n Webhook Trigger** - HTTP POST request sent to n8n webhook
6. **Workflow Processing** - n8n workflow executes with error handling
7. **Response** - n8n sends back success or error response

#### Response Flow (n8n → App)

1. **n8n Completes** - Workflow finishes processing
2. **Structured Response** - Returns JSON with success/error state
3. **API Route Receives** - Next.js API route processes response
4. **Error Detection** - Classifies errors if any occurred
5. **Auto-Retry Logic** - Retries request if applicable (network errors, timeouts)
6. **UI State Update** - Updates React state with results
7. **Visual Feedback** - Shows success animation or error message

### Error Handling Architecture

```
┌─────────────────────────────────────────────────────┐
│              Error Handling Flow                    │
└─────────────────────────────────────────────────────┘

Error Occurs
    │
    ▼
Detect Error Type
    │
    ├──► NetworkError ──────► Auto-Retry (3x with backoff)
    │
    ├──► ValidationError ───► Sanitize Input → Show Clear Message
    │
    ├──► WorkflowError ─────► Log Details → Suggest Fix
    │
    ├──► AuthError ─────────► Show Setup Instructions
    │
    └──► RateLimitError ────► Queue Request with Delay
```

### Error Handling Layers

**Layer 1 - Client Side:**
- Input validation with Zod schemas
- Immediate feedback for invalid data
- Type checking with TypeScript

**Layer 2 - API Routes:**
- Request/response validation
- Rate limiting protection
- Error classification

**Layer 3 - n8n Workflows:**
- Built-in error handling nodes
- Try/catch blocks
- Retry mechanisms

**Layer 4 - Monitoring:**
- Error logging
- Analytics tracking
- Performance monitoring

---

## Development Setup

### Project Structure

```
c:\Users\Rob\Documents\MIXXN Claude\
│
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Home page
│   │   ├── layout.tsx          # Root layout
│   │   ├── globals.css         # Global styles
│   │   └── api/                # API routes
│   │       ├── health/
│   │       └── workflow/
│   │
│   ├── components/             # React components
│   │   ├── layout/             # Layout components (Header, Footer)
│   │   ├── workflow/           # Workflow-related components
│   │   ├── error/              # Error handling components
│   │   └── feedback/           # Visual feedback components
│   │
│   ├── lib/                    # Core utilities
│   │   ├── n8n/                # n8n client and utilities
│   │   ├── validation/         # Zod schemas
│   │   └── config.ts           # App configuration
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useWorkflow.ts      # Execute workflows
│   │   ├── useAutoRetry.ts     # Auto-retry logic
│   │   └── useConnectionStatus.ts
│   │
│   └── store/                  # Zustand state management
│       └── workflowStore.ts
│
├── workflows/                  # n8n workflow exports
│   ├── echo-test.json
│   ├── data-transform.json
│   └── error-simulation.json
│
├── docs/                       # Additional documentation
├── .github/workflows/          # GitHub Actions CI/CD
├── .env.local                  # Local environment variables (DO NOT COMMIT)
├── .env.local.example          # Environment template
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── tailwind.config.ts          # Tailwind config
└── next.config.js              # Next.js config
```

### Environment Variables

#### Development Variables

Create a `.env.local` file (never commit this file):

```bash
# n8n Configuration
N8N_WEBHOOK_URL=http://localhost:5678
N8N_API_KEY=your-local-api-key
N8N_WEBHOOK_TEST_URL=http://localhost:5678/webhook-test

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=MIXXN Claude
NODE_ENV=development

# Error Handling Configuration
MAX_RETRY_ATTEMPTS=3           # Number of automatic retries
RETRY_DELAY_MS=1000            # Initial retry delay in milliseconds
REQUEST_TIMEOUT_MS=30000       # Request timeout (30 seconds)

# Feature Flags
ENABLE_AUTO_RETRY=true         # Enable automatic retry on errors
ENABLE_ERROR_LOGGING=true      # Log errors to console
ENABLE_ANALYTICS=false         # Disable analytics in development
```

#### Production Variables (Vercel)

Set these in the Vercel dashboard:

```bash
N8N_WEBHOOK_URL=https://n8n.yourdomain.com
N8N_API_KEY=your-production-api-key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production
MAX_RETRY_ATTEMPTS=3
RETRY_DELAY_MS=2000
REQUEST_TIMEOUT_MS=60000
ENABLE_AUTO_RETRY=true
ENABLE_ERROR_LOGGING=true
ENABLE_ANALYTICS=true
```

### Development Workflow

1. **Start n8n:**
   ```bash
   docker start n8n
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Make changes to code**

4. **Test changes locally:**
   - Navigate to http://localhost:3000
   - Test workflow execution
   - Verify error handling

5. **Commit changes:**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push origin main
   ```

6. **Automatic deployment** - Vercel automatically deploys when you push to GitHub

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript types
npm test             # Run tests
```

---

## n8n Workflows

### Workflow Overview

This project includes 3 example workflows that demonstrate different patterns:

### 1. Echo Test Workflow

**Purpose:** Validate bidirectional communication between app and n8n

**File:** `workflows/echo-test.json`

**Webhook URL:** `/webhook/echo`

**Input Schema:**
```typescript
{
  message: string;  // Message to echo back
}
```

**Output Schema:**
```typescript
{
  success: true;
  echo: string;      // Your message echoed back
  timestamp: string; // ISO 8601 timestamp
  requestId: string; // Unique request identifier
}
```

**Example Usage:**

```typescript
// In your app
const response = await fetch('/api/workflow/echo', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ message: 'Hello n8n!' })
});

const data = await response.json();
// { success: true, echo: "Hello n8n!", timestamp: "2026-01-31T10:30:00Z", requestId: "..." }
```

**Use Case:** Initial testing and connection verification

---

### 2. Data Transform Workflow

**Purpose:** Process and transform data with validation

**File:** `workflows/data-transform.json`

**Webhook URL:** `/webhook/process`

**Input Schema:**
```typescript
{
  data: any;           // Data to transform
  operation?: string;  // Optional: transformation type
}
```

**Output Schema:**
```typescript
{
  success: true;
  transformed: any;    // Transformed data
  originalData: any;   // Original input for reference
  timestamp: string;
  requestId: string;
}
```

**Supported Operations:**
- Data validation
- Format conversion
- Data enrichment
- Custom transformations

**Use Case:** Processing user input, API data, or file uploads

---

### 3. Error Simulation Workflow

**Purpose:** Test error handling and auto-retry mechanisms

**File:** `workflows/error-simulation.json`

**Webhook URL:** `/webhook/error-test`

**Input Schema:**
```typescript
{
  simulateError: boolean;  // Whether to trigger an error
  errorType?: string;      // Type of error to simulate
}
```

**Output Schema:**

**Success:**
```typescript
{
  success: true;
  message: "Error simulation completed successfully";
}
```

**Error:**
```typescript
{
  success: false;
  error: {
    code: string;      // Error code (NETWORK_ERROR, WORKFLOW_ERROR, etc.)
    message: string;   // Human-readable error message
    details?: any;     // Additional error details
  }
}
```

**Use Case:** Testing error handling, retry logic, and visual feedback

---

### Workflow Structure Pattern

All workflows follow this pattern for consistency:

```
1. Webhook Trigger
   │
   ▼
2. Input Validator (Function Node)
   - Validates input structure
   - Checks required fields
   │
   ▼
3. Try/Catch Error Handler
   │
   ▼
4. Main Processing Logic
   - Core workflow functionality
   - Business logic
   │
   ▼
5. Response Formatter (Function Node)
   - Standardizes response format
   - Adds metadata (timestamp, requestId)
   │
   ▼
6. Webhook Response
   - Returns JSON response to app
```

### Creating Custom Workflows

To create your own workflow:

1. **Start with the Echo Test template** - Use it as a base
2. **Add the Webhook Trigger** - Production + Test URLs
3. **Implement Input Validation** - Use Function node with Zod-like checks
4. **Add Error Handling** - Wrap logic in Try/Catch nodes
5. **Format Response** - Use Function node to standardize output
6. **Test Thoroughly** - Use n8n's test mode before deployment
7. **Export and Version** - Export JSON and commit to `workflows/` folder

**Best Practices:**
- Always validate inputs
- Use descriptive node names
- Add error catching for every operation
- Include logging for debugging
- Format responses consistently
- Document inputs/outputs

---

## API Reference

### API Endpoints

All API endpoints are located in `src/app/api/` and follow REST conventions.

### Base URL

- **Development:** `http://localhost:3000/api`
- **Production:** `https://your-app.vercel.app/api`

---

### Health Check

**GET** `/api/health`

Check if the API and n8n connection are healthy.

**Response:**
```typescript
{
  status: "ok" | "error";
  n8nConnection: "connected" | "disconnected";
  timestamp: string;
}
```

**Example:**
```bash
curl http://localhost:3000/api/health
```

---

### Echo Workflow

**POST** `/api/workflow/echo`

Execute the Echo Test workflow.

**Request Body:**
```typescript
{
  message: string;
}
```

**Response (Success):**
```typescript
{
  success: true;
  data: {
    echo: string;
    timestamp: string;
    requestId: string;
  }
}
```

**Response (Error):**
```typescript
{
  success: false;
  error: {
    code: "NETWORK_ERROR" | "VALIDATION_ERROR" | "WORKFLOW_ERROR";
    message: string;
    details?: any;
  }
}
```

**Example:**
```bash
curl -X POST http://localhost:3000/api/workflow/echo \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello"}'
```

---

### Process Workflow

**POST** `/api/workflow/process`

Execute the Data Transform workflow.

**Request Body:**
```typescript
{
  data: any;
  operation?: string;
}
```

**Response (Success):**
```typescript
{
  success: true;
  data: {
    transformed: any;
    originalData: any;
    timestamp: string;
    requestId: string;
  }
}
```

**Response (Error):**
```typescript
{
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  }
}
```

---

### Status Check

**GET** `/api/workflow/status?requestId={requestId}`

Check the status of a workflow execution.

**Query Parameters:**
- `requestId` (required) - The request ID from the workflow execution

**Response:**
```typescript
{
  requestId: string;
  status: "pending" | "processing" | "completed" | "failed";
  result?: any;
  error?: any;
}
```

---

### Error Codes Reference

| Code | Description | Auto-Retry | User Action |
|------|-------------|------------|-------------|
| `NETWORK_TIMEOUT` | Request timed out | ✅ Yes (3x) | Wait or check n8n |
| `NETWORK_ERROR` | Connection failed | ✅ Yes (3x) | Check n8n running |
| `VALIDATION_ERROR` | Invalid input data | ❌ No | Fix input and retry |
| `WORKFLOW_ERROR` | n8n processing error | ⚠️ Conditional | Check workflow logs |
| `AUTH_ERROR` | Invalid API key | ❌ No | Update API key |
| `RATE_LIMIT` | Too many requests | ✅ Yes (delayed) | Wait and retry |

---

## Error Handling

### Error Types and Handling

#### 1. Network Errors

**Causes:**
- Connection timeout
- n8n not running
- Network connectivity issues

**Auto-Fix:**
- Automatic retry with exponential backoff
- Up to 3 retry attempts
- Delays: 1s, 2s, 4s

**User Action:**
None required - handled automatically. If all retries fail, shows error message.

**Visual Feedback:**
- Status changes to "Retrying" (🟠)
- Shows retry attempt count
- Progress indicator during retry

---

#### 2. Validation Errors

**Causes:**
- Missing required fields
- Invalid data types
- Data doesn't match schema

**Auto-Fix:**
- Input sanitization (trim whitespace, normalize data)
- Type coercion where safe

**User Action:**
Review error message and correct input data.

**Visual Feedback:**
- Status changes to "Error" (🔴)
- Shows specific validation error
- Highlights problematic fields

**Example Error Message:**
```
Validation Error: 'message' is required
Please provide a message and try again.
```

---

#### 3. Workflow Errors

**Causes:**
- n8n workflow failed during execution
- Logic error in workflow
- Missing workflow dependencies

**Auto-Fix:**
- Logs detailed error information
- Suggests checking workflow configuration

**User Action:**
1. Check n8n workflow logs
2. Verify workflow is active
3. Test workflow in n8n UI

**Visual Feedback:**
- Status changes to "Error" (🔴)
- Shows workflow error details
- Provides link to workflow (if available)

---

#### 4. Authentication Errors

**Causes:**
- Invalid n8n API key
- Expired credentials
- Missing environment variables

**Auto-Fix:**
None - requires manual configuration update.

**User Action:**
1. Check `.env.local` file
2. Verify `N8N_API_KEY` is correct
3. Generate new API key in n8n if needed
4. Restart development server

**Visual Feedback:**
- Status changes to "Error" (🔴)
- Shows authentication error
- Provides setup instructions link

---

#### 5. Rate Limit Errors

**Causes:**
- Too many requests in short period
- n8n rate limiting triggered

**Auto-Fix:**
- Queues requests with delay
- Automatically retries after cooldown

**User Action:**
None required - wait for automatic retry.

**Visual Feedback:**
- Status changes to "Rate Limited" (🟠)
- Shows countdown to next retry
- Explains rate limit reason

---

### Visual Feedback States

The app uses color-coded status indicators:

| State | Color | Icon | Description |
|-------|-------|------|-------------|
| **Idle** | Blue 🔵 | ● | Ready to submit |
| **Processing** | Yellow 🟡 | ⟳ | Workflow executing |
| **Error** | Red 🔴 | ✕ | Failed with details |
| **Retrying** | Orange 🟠 | ↻ | Auto-retry in progress |
| **Success** | Green 🟢 | ✓ | Completed successfully |

### Error Logging

All errors are logged with:
- Timestamp
- Error type and code
- Request details
- Stack trace (in development)
- User context

**View Logs:**

Development:
```bash
# Logs appear in terminal
npm run dev
```

Production (Vercel):
```bash
# View logs in Vercel dashboard
https://vercel.com/your-username/your-app/logs
```

---

## Deployment

### Prerequisites

Before deploying:
- [ ] All workflows tested locally
- [ ] GitHub repository created
- [ ] Vercel account created
- [ ] Production n8n instance deployed

---

### Step 1: Deploy n8n to Production

**Option A: Railway (Recommended for Beginners)**

1. Go to [Railway.app](https://railway.app/)
2. Sign up with GitHub
3. Click "New Project" → "Deploy n8n"
4. Configure environment variables:
   - `N8N_BASIC_AUTH_ACTIVE=true`
   - `N8N_BASIC_AUTH_USER=your-username`
   - `N8N_BASIC_AUTH_PASSWORD=your-password`
5. Note your n8n URL: `https://your-app.railway.app`
6. Generate API key in n8n settings

**Option B: Render**

1. Go to [Render.com](https://render.com/)
2. Sign up and create a new Web Service
3. Connect your n8n repository or use Docker
4. Set environment variables
5. Deploy and note your URL

**Option C: DigitalOcean**

1. Create a Droplet (Ubuntu 22.04)
2. Install Docker
3. Deploy n8n with Docker Compose
4. Configure domain and SSL
5. Set up firewall rules

---

### Step 2: Initialize Git Repository

```bash
# Navigate to project directory
cd "c:\Users\Rob\Documents\MIXXN Claude"

# Initialize Git
git init

# Create .gitignore
echo ".env.local
.env*.local
node_modules
.next
out
*.log
.DS_Store
.vercel" > .gitignore

# Add files
git add .

# Initial commit
git commit -m "Initial commit: MIXXN Claude n8n workflow system

- Next.js 14 app with TypeScript
- n8n workflow integration
- Error handling with auto-retry
- Visual feedback system
- 3 example workflows (echo, transform, error simulation)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

### Step 3: Create GitHub Repository

**Using GitHub MCP (if configured):**

```bash
# Claude will use GitHub MCP to create repository
# Repository name: MIXXN-Claude-n8n
```

**Manual Method:**

1. Go to [GitHub](https://github.com/new)
2. Repository name: `MIXXN-Claude-n8n`
3. Description: "n8n workflow-to-app system with Next.js and automatic error handling"
4. Public or Private (your choice)
5. Don't initialize with README (we have one)
6. Click "Create repository"

**Push to GitHub:**

```bash
# Add remote
git remote add origin https://github.com/YOUR-USERNAME/MIXXN-Claude-n8n.git

# Push code
git branch -M main
git push -u origin main
```

---

### Step 4: Deploy to Vercel

#### 4.1: Connect GitHub to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository: `MIXXN-Claude-n8n`
4. Configure project:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`

#### 4.2: Configure Environment Variables

In Vercel project settings → Environment Variables, add:

```bash
N8N_WEBHOOK_URL=https://your-production-n8n.com
N8N_API_KEY=your-production-api-key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production
MAX_RETRY_ATTEMPTS=3
RETRY_DELAY_MS=2000
REQUEST_TIMEOUT_MS=60000
ENABLE_AUTO_RETRY=true
ENABLE_ERROR_LOGGING=true
```

**Important:** Add these for all environments (Production, Preview, Development)

#### 4.3: Deploy

1. Click "Deploy"
2. Wait for build to complete (2-5 minutes)
3. Vercel will provide your app URL: `https://your-app.vercel.app`

---

### Step 5: Configure n8n Production Webhooks

1. Open your production n8n instance
2. Import workflows from `workflows/` folder
3. Update webhook URLs in each workflow:
   - **Production URL:** `https://your-app.vercel.app/api/webhook/[endpoint]`
   - **Test URL:** Keep as local URL for testing
4. Activate all workflows

---

### Step 6: Test Production Deployment

1. Navigate to your Vercel URL
2. Test each workflow:
   - Echo Test
   - Data Transform
   - Error Simulation
3. Verify error handling works
4. Check Vercel logs for any issues

---

### Continuous Deployment

Now that everything is set up, any push to GitHub will automatically deploy:

```bash
# Make changes
git add .
git commit -m "Description of changes"
git push origin main

# Vercel automatically deploys
# Preview URL provided for testing
# Production deploys after approval (if configured)
```

**Deployment Flow:**
```
Code Change → Git Commit → Push to GitHub →
GitHub Actions CI (optional) → Vercel Build →
Preview Deployment → Test → Merge to Main →
Production Deployment
```

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: "Cannot connect to n8n"

**Symptoms:**
- Error message: "Failed to connect to n8n"
- Connection status shows "Disconnected"
- API requests timeout

**Solutions:**

1. **Check n8n is running:**
   ```bash
   docker ps
   # Should show n8n container running
   ```

2. **Restart n8n:**
   ```bash
   docker restart n8n
   ```

3. **Verify webhook URL:**
   - Check `.env.local` has correct `N8N_WEBHOOK_URL`
   - Should be `http://localhost:5678` for local

4. **Check firewall:**
   - Allow port 5678
   - Disable VPN if causing issues

5. **Verify API key:**
   - Generate new API key in n8n
   - Update `.env.local` with new key
   - Restart dev server: `npm run dev`

---

#### Issue: "Workflow not found"

**Symptoms:**
- Error: "Workflow does not exist"
- 404 errors from n8n

**Solutions:**

1. **Import workflows:**
   - Go to n8n UI: http://localhost:5678
   - Workflows → Import from File
   - Import from `workflows/` folder

2. **Activate workflows:**
   - Each workflow needs to be active
   - Toggle the switch to "Active"

3. **Verify webhook paths:**
   - Check workflow webhook URLs match API routes
   - Echo Test: `/webhook/echo`
   - Process: `/webhook/process`
   - Error Test: `/webhook/error-test`

4. **Check workflow IDs:**
   - Ensure workflow IDs haven't changed
   - Update API routes if needed

---

#### Issue: "Request timeout"

**Symptoms:**
- Requests take too long
- Error: "Request timed out"
- Processing state doesn't complete

**Solutions:**

1. **Increase timeout:**
   ```bash
   # In .env.local
   REQUEST_TIMEOUT_MS=60000  # Increase to 60 seconds
   ```

2. **Check n8n performance:**
   - Is n8n CPU/memory constrained?
   - Check Docker Desktop resources
   - Restart n8n: `docker restart n8n`

3. **Simplify workflow:**
   - Remove unnecessary nodes
   - Optimize data processing
   - Use Set node instead of Function node where possible

4. **Check network:**
   - Is your internet slow?
   - Disable VPN
   - Check for network congestion

---

#### Issue: "Environment variables not found"

**Symptoms:**
- Error: "N8N_API_KEY is not defined"
- Config validation errors
- Missing environment variables

**Solutions:**

1. **Create `.env.local`:**
   ```bash
   # Copy from example
   cp .env.local.example .env.local
   ```

2. **Fill in all variables:**
   - Don't leave any as `your-api-key`
   - Get actual values from n8n, Vercel, etc.

3. **Restart dev server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

4. **Check file location:**
   - `.env.local` must be in project root
   - Not in `src/` or any subdirectory

---

#### Issue: "Build fails on Vercel"

**Symptoms:**
- Vercel deployment fails
- Build errors in logs
- Type errors or missing dependencies

**Solutions:**

1. **Check build locally:**
   ```bash
   npm run build
   # Fix any errors shown
   ```

2. **Verify environment variables:**
   - All required variables set in Vercel
   - Check for typos in variable names

3. **Check Node.js version:**
   - Vercel uses Node 18 by default
   - Ensure package.json has correct engines

4. **Review build logs:**
   - Click "View Logs" in Vercel deployment
   - Look for specific error messages
   - Fix the root cause

5. **Clear build cache:**
   - In Vercel project settings
   - Go to "General" → "Build & Development Settings"
   - Clear build cache and redeploy

---

#### Issue: "Validation errors"

**Symptoms:**
- "Validation failed" errors
- Fields marked as invalid
- Type errors in forms

**Solutions:**

1. **Check input format:**
   - Ensure data matches expected schema
   - Review API reference for correct format

2. **Review Zod schemas:**
   - Check `src/lib/validation/schemas.ts`
   - Ensure schema matches your needs
   - Update schema if requirements changed

3. **Test with curl:**
   ```bash
   curl -X POST http://localhost:3000/api/workflow/echo \
     -H "Content-Type: application/json" \
     -d '{"message":"test"}'
   ```

4. **Check console logs:**
   - Open browser DevTools
   - Look for validation error details
   - Fix data to match schema

---

### Debug Mode

Enable detailed logging for troubleshooting:

```bash
# Add to .env.local
DEBUG=true
ENABLE_ERROR_LOGGING=true
LOG_LEVEL=debug
```

Restart the dev server and check console for detailed logs.

---

### Getting Help

If you can't resolve an issue:

1. **Check n8n Community:**
   - [n8n Community Forum](https://community.n8n.io/)
   - [n8n Discord](https://discord.gg/n8n)

2. **Check Next.js Docs:**
   - [Next.js Documentation](https://nextjs.org/docs)
   - [Next.js GitHub Discussions](https://github.com/vercel/next.js/discussions)

3. **Check Vercel Docs:**
   - [Vercel Documentation](https://vercel.com/docs)
   - [Vercel Support](https://vercel.com/support)

4. **Review GitHub Issues:**
   - Check your project's GitHub Issues
   - Search for similar problems
   - Create new issue with details

---

## Resources

### Documentation

- [Next.js Documentation](https://nextjs.org/docs) - Next.js framework docs
- [n8n Documentation](https://docs.n8n.io/) - n8n workflow automation docs
- [Vercel Documentation](https://vercel.com/docs) - Deployment and hosting docs
- [TypeScript Documentation](https://www.typescriptlang.org/docs/) - TypeScript language docs
- [Zod Documentation](https://zod.dev/) - Schema validation library docs
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Styling framework docs
- [shadcn/ui Documentation](https://ui.shadcn.com/) - Component library docs

### Tools

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) - Container platform
- [Node.js](https://nodejs.org/) - JavaScript runtime
- [Git](https://git-scm.com/) - Version control
- [VS Code](https://code.visualstudio.com/) - Code editor (recommended)

### Community

- [n8n Community Forum](https://community.n8n.io/) - Ask questions and share workflows
- [Next.js Discord](https://discord.gg/nextjs) - Next.js community support
- [Vercel Discord](https://discord.gg/vercel) - Vercel community support

### Tutorials

- [n8n Workflow Examples](https://n8n.io/workflows/) - Example workflows
- [Next.js Learn](https://nextjs.org/learn) - Interactive Next.js tutorial
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) - Learn TypeScript

---

## Contributing

Want to improve this project? Contributions are welcome!

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style

- Use TypeScript strict mode
- Follow ESLint rules (`npm run lint`)
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation for new features

---

## License

This project is licensed under the MIT License.

---

## Support

Need help? Here's how to get support:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review the [Resources](#resources) for documentation
3. Search existing GitHub Issues
4. Create a new GitHub Issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment details (OS, Node version, etc.)

---

**Built with Claude Code**

This project was created with [Claude Code](https://claude.com/claude-code), demonstrating automated workflow-to-app development with comprehensive error handling and modern deployment practices.

---

**Last Updated:** 2026-01-31
**Version:** 1.0.0
