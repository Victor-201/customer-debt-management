#!/bin/bash
# Customer Debt Management - GCloud Deployment Script
# Deploy to Compute Engine VM with Docker Compose
# Ports: Backend=4000, PostgreSQL=5433

set -e

# ============================================
# Configuration
# ============================================
PROJECT_ID="hailamdev"
ZONE="asia-southeast1-b"
INSTANCE_NAME="tech-store-vm"
MACHINE_TYPE="e2-medium"
DOMAIN="fecredit.hailamdev.space"
API_DOMAIN="api.fecredit.hailamdev.space"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║     Customer Debt Management - GCloud Deployment          ║"
echo "║     Deploying to: $INSTANCE_NAME                          ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# ============================================
# Pre-flight Checks
# ============================================
echo -e "${YELLOW}🔍 Running pre-flight checks...${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI is not installed. Please install it first.${NC}"
    echo "   Visit: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if gcloud is authenticated
gcloud auth print-identity-token > /dev/null 2>&1 || {
    echo -e "${RED}❌ Not authenticated with GCloud${NC}"
    echo -e "${YELLOW}   Please run: gcloud auth login${NC}"
    exit 1
}

echo -e "${GREEN}✅ GCloud CLI authenticated${NC}"

# Set project
gcloud config set project $PROJECT_ID
echo -e "${GREEN}✅ Project set to: $PROJECT_ID${NC}"

# ============================================
# Check VM Instance
# ============================================
echo ""
echo -e "${YELLOW}📦 Checking VM instance...${NC}"

if ! gcloud compute instances describe $INSTANCE_NAME --zone=$ZONE > /dev/null 2>&1; then
    echo -e "${RED}❌ VM instance '$INSTANCE_NAME' not found in zone '$ZONE'${NC}"
    echo -e "${YELLOW}   Creating new VM instance...${NC}"
    
    gcloud compute instances create $INSTANCE_NAME \
        --zone=$ZONE \
        --machine-type=$MACHINE_TYPE \
        --image-family=ubuntu-2204-lts \
        --image-project=ubuntu-os-cloud \
        --boot-disk-size=50GB \
        --boot-disk-type=pd-ssd \
        --tags=http-server,https-server \
        --metadata=startup-script='#!/bin/bash
apt-get update
apt-get install -y docker.io docker-compose-plugin git certbot python3-certbot-nginx
systemctl enable docker
systemctl start docker
usermod -aG docker $USER'
    
    echo -e "${YELLOW}⏳ Waiting for VM to be ready...${NC}"
    sleep 60
else
    echo -e "${GREEN}✅ VM instance found: $INSTANCE_NAME${NC}"
fi

# Get external IP
EXTERNAL_IP=$(gcloud compute instances describe $INSTANCE_NAME \
    --zone=$ZONE \
    --format='get(networkInterfaces[0].accessConfigs[0].natIP)')

echo -e "${GREEN}🌐 VM External IP: $EXTERNAL_IP${NC}"

# ============================================
# Check Running Ports on VM
# ============================================
echo ""
echo -e "${YELLOW}🔍 Checking running services on VM...${NC}"

gcloud compute ssh $INSTANCE_NAME --zone=$ZONE --command="
    echo '📊 Currently running Docker containers:'
    docker ps --format 'table {{.Names}}\t{{.Ports}}\t{{.Status}}' 2>/dev/null || echo 'No Docker containers running'
    
    echo ''
    echo '📊 Ports in use:'
    sudo netstat -tlnp 2>/dev/null | grep LISTEN | head -20 || sudo ss -tlnp | head -20
" || echo -e "${YELLOW}⚠️ Could not check running services (VM might be starting up)${NC}"

# ============================================
# Configure Firewall Rules
# ============================================
echo ""
echo -e "${YELLOW}🔥 Configuring firewall rules...${NC}"

# Allow HTTP
gcloud compute firewall-rules create allow-http \
    --allow=tcp:80 \
    --target-tags=http-server \
    --description="Allow HTTP traffic" 2>/dev/null || echo "Firewall rule 'allow-http' already exists"

# Allow HTTPS
gcloud compute firewall-rules create allow-https \
    --allow=tcp:443 \
    --target-tags=https-server \
    --description="Allow HTTPS traffic" 2>/dev/null || echo "Firewall rule 'allow-https' already exists"

# Allow custom ports for CDM (Customer Debt Management)
gcloud compute firewall-rules create allow-cdm-backend \
    --allow=tcp:4000 \
    --target-tags=http-server \
    --description="Allow CDM Backend API" 2>/dev/null || echo "Firewall rule 'allow-cdm-backend' already exists"

echo -e "${GREEN}✅ Firewall rules configured${NC}"

# ============================================
# Reserve Static IP (if not exists)
# ============================================
echo ""
echo -e "${YELLOW}📍 Checking static IP...${NC}"

STATIC_IP=$(gcloud compute addresses describe tech-store-ip \
    --region=asia-southeast1 \
    --format='get(address)' 2>/dev/null) || {
    echo "Creating new static IP..."
    gcloud compute addresses create tech-store-ip --region=asia-southeast1
    STATIC_IP=$(gcloud compute addresses describe tech-store-ip \
        --region=asia-southeast1 \
        --format='get(address)')
}

echo -e "${GREEN}📋 Static IP: ${STATIC_IP:-$EXTERNAL_IP}${NC}"

# ============================================
# DNS Configuration Reminder
# ============================================
echo ""
echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗"
echo -e "║              🔧 DNS CONFIGURATION REQUIRED                 ║"
echo -e "╠═══════════════════════════════════════════════════════════╣"
echo -e "║  Add these DNS records to your domain registrar:          ║"
echo -e "║                                                           ║"
echo -e "║  A    fecredit.hailamdev.space      →  ${STATIC_IP:-$EXTERNAL_IP}             ║"
echo -e "║  A    api.fecredit.hailamdev.space  →  ${STATIC_IP:-$EXTERNAL_IP}             ║"
echo -e "╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# ============================================
# Copy Project Files to VM
# ============================================
echo -e "${YELLOW}📤 Copying project files to VM...${NC}"

# Get the project root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "Project root: $PROJECT_ROOT"

# Create directory on VM
gcloud compute ssh $INSTANCE_NAME --zone=$ZONE --command="
    mkdir -p ~/customer-debt-management
"

# Copy files
gcloud compute scp --recurse \
    --zone=$ZONE \
    "$PROJECT_ROOT" $INSTANCE_NAME:~/

echo -e "${GREEN}✅ Files copied to VM${NC}"

# ============================================
# Setup and Deploy on VM
# ============================================
echo ""
echo -e "${YELLOW}🔨 Setting up Docker on VM...${NC}"

gcloud compute ssh $INSTANCE_NAME --zone=$ZONE --command="
    cd ~/customer-debt-management/deployment/docker
    
    # Wait for Docker to be ready
    echo 'Waiting for Docker...'
    while ! docker info > /dev/null 2>&1; do
        echo 'Docker not ready, waiting...'
        sleep 5
    done
    echo '✅ Docker is ready'
    
    # Check if .env file exists
    if [ ! -f .env ]; then
        echo '⚠️ .env file not found, creating from example...'
        if [ -f .env.example ]; then
            cp .env.example .env
            echo '⚠️ Please update .env with your actual values!'
        fi
    fi
    
    # Stop existing CDM containers if running
    echo 'Stopping existing CDM containers...'
    docker-compose -f docker-compose.yml down 2>/dev/null || true
    
    # Build and start services
    echo 'Building Docker images...'
    docker-compose -f docker-compose.yml build
    
    echo 'Starting services...'
    docker-compose -f docker-compose.yml up -d
    
    echo ''
    echo '✅ Services started!'
    echo ''
    docker-compose -f docker-compose.yml ps
"

# ============================================
# Final Summary
# ============================================
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗"
echo -e "║              ✅ DEPLOYMENT COMPLETED!                      ║"
echo -e "╠═══════════════════════════════════════════════════════════╣"
echo -e "║  VM Instance: $INSTANCE_NAME                              ║"
echo -e "║  VM IP: ${STATIC_IP:-$EXTERNAL_IP}                                        ║"
echo -e "║                                                           ║"
echo -e "║  Services:                                                ║"
echo -e "║  • Frontend:  http://${STATIC_IP:-$EXTERNAL_IP}:8080              ║"
echo -e "║  • Backend:   http://${STATIC_IP:-$EXTERNAL_IP}:4000/api          ║"
echo -e "║  • Database:  PostgreSQL on port 5433                     ║"
echo -e "╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Configure DNS records (see above)"
echo "2. Update .env file with production values:"
echo "   gcloud compute ssh $INSTANCE_NAME --zone=$ZONE"
echo "   cd ~/customer-debt-management/deployment/docker"
echo "   nano .env"
echo ""
echo "3. Setup SSL certificates:"
echo "   sudo certbot certonly --standalone -d $DOMAIN -d $API_DOMAIN"
echo ""
echo "4. Enable production profile with nginx:"
echo "   docker compose --profile production up -d"
echo ""
echo "5. Run database migrations:"
echo "   docker compose exec backend npm run migrate"
echo "   docker compose exec backend npm run seed"
