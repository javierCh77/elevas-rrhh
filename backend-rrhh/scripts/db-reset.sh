#!/bin/bash

# Script to reset PostgreSQL database for Elevas HR Backend
echo "🔄 Resetting Elevas HR PostgreSQL Database..."
echo "⚠️  This will DELETE ALL DATA in the database!"

read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Database reset cancelled."
    exit 1
fi

# Stop containers
echo "🛑 Stopping containers..."
docker-compose -f docker-compose.db.yml down

# Remove volumes
echo "🗑️  Removing database volumes..."
docker volume rm elevas_backend_postgres_data 2>/dev/null || true

# Start fresh
echo "🚀 Starting fresh database..."
docker-compose -f docker-compose.db.yml up -d

# Wait for database to be ready
echo "⏳ Waiting for database to initialize..."
sleep 10

until docker exec elevas-backend-postgres pg_isready -U elevas_user -d elevas_hr > /dev/null 2>&1; do
    echo "⏳ Waiting for PostgreSQL to start..."
    sleep 2
done

echo "✅ Database reset completed successfully!"
echo "📊 Fresh database is ready for development."