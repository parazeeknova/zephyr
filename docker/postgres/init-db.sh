#!/bin/bash
set -e

cat /etc/banner.txt
echo "🚀 Starting Zephyr Database initialization..."

psql_execute() {
    PGPASSWORD=$POSTGRES_PASSWORD psql -h /var/run/postgresql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "$1"
}

wait_for_postgres() {
    echo "⏳ Waiting for PostgreSQL to be ready..."
    until PGPASSWORD=$POSTGRES_PASSWORD psql -h /var/run/postgresql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\l' >/dev/null 2>&1; do
        sleep 1
    done
    echo "✅ PostgreSQL is ready"
}

print_manual_instructions() {
    cat << "EOT"

⚠️ Prisma setup needs manual initialization
==========================================

📝 Please follow these steps:
-----------------------------------------
1. Create .env file in packages/db with:
   POSTGRES_PRISMA_URL=postgresql://postgres:postgres@localhost:5433/zephyr?schema=public
   POSTGRES_URL_NON_POOLING=postgresql://postgres:postgres@localhost:5433/zephyr?schema=public

2. Run these commands:
   cd packages/db
   pnpm prisma generate
   pnpm prisma db push

🔍 Troubleshooting:
-----------------------------------------
• Ensure PostgreSQL is running:
  docker ps | grep postgres
  
• Check PostgreSQL logs:
  docker logs zephyr-postgres-dev
  
• Verify connection:
  psql -h localhost -p 5433 -U postgres -d zephyr

💡 Note: Use port 5433 for external connections

EOT
}

init_database() {
    echo "🔧 Creating extensions..."
    psql_execute "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"
    psql_execute "CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";"
    psql_execute "CREATE EXTENSION IF NOT EXISTS \"pg_stat_statements\";"

    echo "🌍 Setting timezone..."
    psql_execute "ALTER DATABASE $POSTGRES_DB SET timezone TO 'UTC';"

    echo "🔑 Setting up privileges..."
    psql_execute "GRANT ALL PRIVILEGES ON DATABASE $POSTGRES_DB TO $POSTGRES_USER;"
    psql_execute "ALTER USER $POSTGRES_USER WITH CREATEDB SUPERUSER;"
}

setup_prisma() {
    echo "⚡ Setting up Prisma..."    
    cd /app/packages/db
    cat > .env << EOL
POSTGRES_PRISMA_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}?schema=public
POSTGRES_URL_NON_POOLING=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${POSTGRES_DB}?schema=public
EOL
    
    echo "🔍 Environment configuration:"
    cat .env
    
    local PRISMA_BIN="/app/packages/db/node_modules/.bin/prisma"
    
    echo "🔄 Generating Prisma Client..."
    $PRISMA_BIN generate

    echo "📤 Pushing schema changes..."
    for i in {1..3}; do
        echo "Attempt $i: Testing database connection..."
        if PGPASSWORD=$POSTGRES_PASSWORD psql -h /var/run/postgresql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\l' >/dev/null 2>&1; then
            echo "Database is reachable"
            if PRISMA_SCHEMA_ENGINE_BINARY= $PRISMA_BIN db push --skip-generate --accept-data-loss; then
                echo "✅ Schema push completed successfully"
                break
            else
                echo "❌ Schema push failed, error output:"
                PRISMA_LOG_LEVEL=debug $PRISMA_BIN db push --skip-generate --accept-data-loss || true
                
                # Debug connection
                echo "Debug: Testing psql connection"
                PGPASSWORD=$POSTGRES_PASSWORD psql -h localhost -p 5432 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "\conninfo" || true
            fi
        else
            echo "Database is not reachable"
        fi
        
        if [ $i -eq 3 ]; then
            echo "❌ Schema push failed after 3 attempts"
            print_manual_instructions
            return 1
        fi
        echo "⚠️ Schema push attempt $i failed, retrying in 2 seconds..."
        sleep 2
    done
    
    rm -f .env
}

setup_privileges() {
    echo "🔐 Setting up final privileges..."
    psql_execute "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $POSTGRES_USER;"
    psql_execute "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $POSTGRES_USER;"
    psql_execute "GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO $POSTGRES_USER;"
}

echo "🚀 Starting initialization sequence..."
wait_for_postgres
init_database
setup_prisma || echo "⚠️ Prisma setup failed, see manual instructions above"
setup_privileges

echo "
🎉 Database initialization completed successfully!
   - Database: $POSTGRES_DB
   - User: $POSTGRES_USER
   - Port: 5432
   - Status: Ready for connections
"
