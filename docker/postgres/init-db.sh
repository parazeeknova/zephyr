#!/bin/bash
set -eo pipefail

echo "Starting database initialization..."

# Function to execute SQL commands
psql_execute() {
    PGPASSWORD=$POSTGRES_PASSWORD psql -h localhost -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "$1"
}

# Function to wait for PostgreSQL to be ready
wait_for_postgres() {
    echo "Waiting for PostgreSQL to be ready..."
    until pg_isready -h localhost -U "$POSTGRES_USER" -d "$POSTGRES_DB"; do
        sleep 1
    done
    echo "PostgreSQL is ready"
}

# Wait for PostgreSQL to be ready
wait_for_postgres

echo "Creating extensions..."
# Create extensions
psql_execute "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
psql_execute "CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";"

echo "Setting timezone..."
# Set timezone
psql_execute "ALTER DATABASE $POSTGRES_DB SET timezone TO 'UTC';"

echo "Granting privileges..."
# Grant privileges
psql_execute "GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO $POSTGRES_USER;"
psql_execute "ALTER USER $POSTGRES_USER CREATEDB SUPERUSER;"

echo "Setting up Prisma..."
# Create tables using Prisma
cd /app/packages/db

# Generate Prisma Client
echo "Generating Prisma Client..."
prisma generate

# Use the correct connection string for local database setup
export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}?schema=public"

echo "Running database migrations..."
prisma migrate deploy

echo "Pushing database schema..."
prisma db push --skip-generate --accept-data-loss

echo "Granting table privileges..."
# Grant privileges on all tables
psql_execute "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $POSTGRES_USER;"
psql_execute "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $POSTGRES_USER;"
psql_execute "GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO $POSTGRES_USER;"

echo "Database initialization completed successfully"
