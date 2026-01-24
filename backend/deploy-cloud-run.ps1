# Curebird Backend - Cloud Run Deployment Script (PowerShell)
# This script builds and deploys your Flask backend to Google Cloud Run

# Configuration
$PROJECT_ID = "curebird-535e5"
$SERVICE_NAME = "curebird-backend"
$REGION = "us-central1"
$MIN_INSTANCES = 1
$MAX_INSTANCES = 10
$MEMORY = "1Gi"
$CPU = 1
$TIMEOUT = 300

Write-Host "🚀 Curebird Cloud Run Deployment" -ForegroundColor Blue
Write-Host "==================================" -ForegroundColor Blue
Write-Host ""

# Check if gcloud is installed
try {
    $null = Get-Command gcloud -ErrorAction Stop
}
catch {
    Write-Host "❌ Google Cloud SDK not found. Please install it first:" -ForegroundColor Red
    Write-Host "   https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    exit 1
}

# Check authentication
Write-Host "📋 Checking authentication..." -ForegroundColor Blue
$authAccount = gcloud auth list --filter="status:ACTIVE" --format='value(account)' 2>$null
if (-not $authAccount) {
    Write-Host "❌ Not authenticated. Running 'gcloud auth login'..." -ForegroundColor Red
    gcloud auth login
}

# Set project
Write-Host "📋 Setting project to $PROJECT_ID..." -ForegroundColor Blue
gcloud config set project $PROJECT_ID

# Enable required APIs
Write-Host "🔧 Enabling required APIs..." -ForegroundColor Blue
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com

# Build and deploy
Write-Host "🏗️  Building and deploying to Cloud Run..." -ForegroundColor Blue
Write-Host "   This may take 5-10 minutes..." -ForegroundColor Yellow
Write-Host ""

gcloud run deploy $SERVICE_NAME `
    --source . `
    --region $REGION `
    --allow-unauthenticated `
    --min-instances $MIN_INSTANCES `
    --max-instances $MAX_INSTANCES `
    --memory $MEMORY `
    --cpu $CPU `
    --timeout $TIMEOUT `
    --platform managed

# Get the service URL
$SERVICE_URL = gcloud run services describe $SERVICE_NAME --region $REGION --format 'value(status.url)'

Write-Host ""
Write-Host "✅ Deployment successful!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Your backend is now live at:" -ForegroundColor Green
Write-Host "   $SERVICE_URL" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Blue
Write-Host "   1. Set environment variables in Cloud Run console:" -ForegroundColor White
Write-Host "      https://console.cloud.google.com/run/detail/$REGION/$SERVICE_NAME/variables?project=$PROJECT_ID" -ForegroundColor Yellow
Write-Host ""
Write-Host "      Required variables:" -ForegroundColor White
Write-Host "      - GROQ_API_KEY" -ForegroundColor Gray
Write-Host "      - GEMINI_API_KEY" -ForegroundColor Gray
Write-Host "      - CEREBRAS_API_KEY" -ForegroundColor Gray
Write-Host "      - GROQ_API_KEY_VISION" -ForegroundColor Gray
Write-Host "      - GROQ_API_KEY_ANALYZER" -ForegroundColor Gray
Write-Host ""
Write-Host "   2. Update your Vercel environment variable:" -ForegroundColor White
Write-Host "      REACT_APP_API_URL=$SERVICE_URL" -ForegroundColor Yellow
Write-Host ""
Write-Host "   3. Test your API:" -ForegroundColor White
Write-Host "      curl $SERVICE_URL/api/disease-trends" -ForegroundColor Gray
Write-Host ""
Write-Host "🎉 Deployment complete!" -ForegroundColor Green
