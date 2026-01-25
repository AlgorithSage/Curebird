#!/bin/bash

# Curebird Backend - Cloud Run Deployment Script
# This script builds and deploys your Flask backend to Google Cloud Run

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Curebird Cloud Run Deployment${NC}"
echo "=================================="

# Configuration
PROJECT_ID="curebird-535e5"
SERVICE_NAME="curebird-backend"
REGION="us-central1"
MIN_INSTANCES=1
MAX_INSTANCES=10
MEMORY="1Gi"
CPU=1
TIMEOUT=300

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Google Cloud SDK not found. Please install it first:${NC}"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
echo -e "${BLUE}📋 Checking authentication...${NC}"
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo -e "${RED}❌ Not authenticated. Running 'gcloud auth login'...${NC}"
    gcloud auth login
fi

# Set project
echo -e "${BLUE}📋 Setting project to ${PROJECT_ID}...${NC}"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo -e "${BLUE}🔧 Enabling required APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com

# Build and deploy
echo -e "${BLUE}🏗️  Building and deploying to Cloud Run...${NC}"
gcloud run deploy $SERVICE_NAME \
  --source . \
  --region $REGION \
  --allow-unauthenticated \
  --min-instances $MIN_INSTANCES \
  --max-instances $MAX_INSTANCES \
  --memory $MEMORY \
  --cpu $CPU \
  --timeout $TIMEOUT \
  --platform managed

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)')

echo ""
echo -e "${GREEN}✅ Deployment successful!${NC}"
echo ""
echo -e "${GREEN}🌐 Your backend is now live at:${NC}"
echo -e "${BLUE}   $SERVICE_URL${NC}"
echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo "   1. Set environment variables in Cloud Run console:"
echo "      - GROQ_API_KEY"
echo "      - GEMINI_API_KEY"
echo "      - CEREBRAS_API_KEY"
echo "      - GOOGLE_APPLICATION_CREDENTIALS (if using service account)"
echo ""
echo "   2. Update your frontend REACT_APP_API_URL to:"
echo "      $SERVICE_URL"
echo ""
echo "   3. Test your API:"
echo "      curl $SERVICE_URL/api/disease-trends"
echo ""
echo -e "${GREEN}🎉 Deployment complete!${NC}"