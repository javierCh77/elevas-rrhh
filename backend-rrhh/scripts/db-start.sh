#!/bin/bash

# Script to start PostgreSQL database for Elevas HR Backend
echo "🗃️  Starting Elevas HR PostgreSQL Database..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Start PostgreSQL with docker-compose
docker-compose -f docker-compose.db.yml up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 5

# Check if database is ready
until docker exec elevas-backend-postgres pg_isready -U elevas_user -d elevas_hr > /dev/null 2>&1; do
    echo "⏳ Waiting for PostgreSQL to start..."
    sleep 2
done

echo "✅ PostgreSQL database is ready!"
echo "📊 Database: elevas_hr"
echo "👤 User: elevas_user"
echo "🔌 Port: 3034"
echo ""
echo "🔗 Connection string: postgresql://elevas_user:elevas_pass123@localhost:3034/elevas_hr"
echo ""
echo "To connect with psql:"
echo "   psql -h localhost -p 3034 -U elevas_user -d elevas_hr"
echo ""
echo "To stop the database:"
echo "   npm run db:stop"