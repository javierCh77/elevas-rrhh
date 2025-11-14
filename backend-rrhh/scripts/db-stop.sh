#!/bin/bash

# Script to stop PostgreSQL database for Elevas HR Backend
echo "🛑 Stopping Elevas HR PostgreSQL Database..."

# Stop PostgreSQL with docker-compose
docker-compose -f docker-compose.db.yml down

echo "✅ PostgreSQL database stopped successfully!"
echo ""
echo "💡 To start the database again:"
echo "   npm run db:start"
echo ""
echo "💡 To remove all data (reset database):"
echo "   npm run db:reset"