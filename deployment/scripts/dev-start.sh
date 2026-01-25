#!/bin/bash
# Quick local development with Docker Compose
# Use this for local testing before deploying to GCloud

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR/../docker"

echo "🚀 Starting Customer Debt Management (Development Mode)"
echo "======================================================="

# Check if .env exists
if [ ! -f .env ]; then
    echo "📋 Creating .env from example..."
    cp "$SCRIPT_DIR/.env.example" .env
    echo "⚠️  Please update .env with your local values"
fi

# Build and start
docker compose build
docker compose up -d postgres backend frontend

echo ""
echo "✅ Services started!"
echo ""
echo "📊 Service Status:"
docker compose ps

echo ""
echo "🌐 Access URLs:"
echo "   Frontend:  http://localhost:8080"
echo "   Backend:   http://localhost:4000/api"
echo "   Database:  localhost:5433"
echo ""
echo "📝 Useful commands:"
echo "   View logs:     docker compose logs -f"
echo "   Stop:          docker compose down"
echo "   Rebuild:       docker compose build --no-cache"
echo "   Run migrate:   docker compose exec backend npm run migrate"
echo "   Run seed:      docker compose exec backend npm run seed"
