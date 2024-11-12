#!/bin/sh
set -e

# Function to execute SQL commands
psql_execute() {
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -c "$1"
}

# Function to wait for PostgreSQL to be ready
wait_for_postgres() {
    until pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB" -h localhost; do
        echo "Waiting for PostgreSQL to be ready..."
        sleep 2
    done
}

echo >&2 "Creating extensions and setting up database..."

# Wait for PostgreSQL to be ready
wait_for_postgres

# Create extensions
psql_execute "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
psql_execute "CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";"

# Set timezone
psql_execute "ALTER DATABASE $POSTGRES_DB SET timezone TO 'UTC';"

# Grant privileges
psql_execute "GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO $POSTGRES_USER;"
psql_execute "ALTER USER $POSTGRES_USER CREATEDB SUPERUSER;"

# Create tables using Prisma
cd /app/packages/db

# Generate Prisma Client
echo >&2 "Generating Prisma Client..."
prisma generate

# Use the correct connection string for local database setup
export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}?schema=public"

echo >&2 "Running database migrations..."
prisma migrate deploy

echo >&2 "Pushing database schema..."
prisma db push --skip-generate --accept-data-loss

# Grant privileges on all tables
psql_execute "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $POSTGRES_USER;"
psql_execute "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $POSTGRES_USER;"
psql_execute "GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO $POSTGRES_USER;"

echo >&2 "Database initialization completed"
