#!/bin/bash
# ═══════════════════════════════════════════════
# DIGITALIUM.IO — Production Deployment Script
# NEXUS-OMEGA M5 Sprint 10 — 2026-03-29
# ═══════════════════════════════════════════════
#
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh          # Full deploy (Convex + Docker + Firebase)
#   ./deploy.sh --only convex
#   ./deploy.sh --only docker
#   ./deploy.sh --only firebase
#
# Prerequisites:
#   - gcloud CLI authenticated
#   - firebase CLI authenticated
#   - Convex CLI authenticated
#   - .env.local with CONVEX_DEPLOY_KEY & GEMINI_API_KEY
# ═══════════════════════════════════════════════

set -euo pipefail

# ── Config ──
PROJECT_ID="digitalium-ga"
CLOUD_RUN_SERVICE="digitalium-nextjs"
REGION="europe-west1"
IMAGE="gcr.io/${PROJECT_ID}/${CLOUD_RUN_SERVICE}"
FIREBASE_SITE="digitalium-ga"

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

log() { echo -e "${BLUE}[DEPLOY]${NC} $1"; }
success() { echo -e "${GREEN}[✓]${NC} $1"; }
error() { echo -e "${RED}[✗]${NC} $1"; exit 1; }
header() { echo -e "\n${PURPLE}═══════════════════════════════════════${NC}"; echo -e "${PURPLE}  $1${NC}"; echo -e "${PURPLE}═══════════════════════════════════════${NC}\n"; }

ONLY="${1:-all}"

# ── Step 0: Pre-flight checks ──
header "NEXUS-OMEGA — Deployment Pre-flight"

log "Checking .env.production..."
[ -f .env.production ] || error ".env.production not found"

log "Checking .env.local for runtime secrets..."
[ -f .env.local ] || error ".env.local not found (needed for CONVEX_DEPLOY_KEY & GEMINI_API_KEY)"

# Load runtime secrets from .env.local
CONVEX_DEPLOY_KEY=$(grep '^CONVEX_DEPLOY_KEY=' .env.local | cut -d'=' -f2-)
GEMINI_API_KEY=$(grep '^GEMINI_API_KEY=' .env.local | cut -d'=' -f2-)
[ -n "$CONVEX_DEPLOY_KEY" ] || error "CONVEX_DEPLOY_KEY not found in .env.local"
[ -n "$GEMINI_API_KEY" ] || error "GEMINI_API_KEY not found in .env.local"
success "Runtime secrets loaded from .env.local"

log "Checking build..."
npm run build 2>&1 | tail -3
success "Build OK"

# ── Step 1: Deploy Convex ──
if [[ "$ONLY" == "all" || "$ONLY" == "--only convex" || "${2:-}" == "convex" ]]; then
    header "Step 1: Deploy Convex Backend"
    log "Deploying Convex functions..."
    npx convex deploy --cmd "npm run build"
    success "Convex deployed"
fi

# ── Step 2: Build & Push Docker Image ──
if [[ "$ONLY" == "all" || "$ONLY" == "--only docker" || "${2:-}" == "docker" ]]; then
    header "Step 2: Build & Push Docker Image"
    log "Building Docker image (Node 20, standalone)..."
    gcloud builds submit --tag "${IMAGE}" --project "${PROJECT_ID}"
    success "Docker image pushed: ${IMAGE}"

    log "Deploying to Cloud Run with runtime secrets..."
    gcloud run deploy "${CLOUD_RUN_SERVICE}" \
        --project "${PROJECT_ID}" \
        --image "${IMAGE}" \
        --region "${REGION}" \
        --platform managed \
        --memory 512Mi \
        --cpu 1 \
        --min-instances 0 \
        --max-instances 10 \
        --allow-unauthenticated \
        --port 3000 \
        --set-env-vars "CONVEX_DEPLOY_KEY=${CONVEX_DEPLOY_KEY},GEMINI_API_KEY=${GEMINI_API_KEY}"
    success "Cloud Run deployed: ${CLOUD_RUN_SERVICE}"
fi

# ── Step 3: Deploy Firebase Hosting ──
if [[ "$ONLY" == "all" || "$ONLY" == "--only firebase" || "${2:-}" == "firebase" ]]; then
    header "Step 3: Deploy Firebase Hosting"
    log "Deploying Firebase Hosting (proxy → Cloud Run)..."
    firebase deploy --only hosting --project "${PROJECT_ID}"
    success "Firebase Hosting deployed: https://digitalium.io"
fi

# ── Done ──
header "Deployment Complete"
echo -e "${GREEN}╔═══════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  DIGITALIUM.IO deployed successfully  ║${NC}"
echo -e "${GREEN}║                                       ║${NC}"
echo -e "${GREEN}║  URL:  https://digitalium.io          ║${NC}"
echo -e "${GREEN}║  Run:  ${CLOUD_RUN_SERVICE}            ║${NC}"
echo -e "${GREEN}║  DB:   calm-mammoth-671 (Convex)      ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════╝${NC}"
