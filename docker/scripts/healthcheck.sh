#!/bin/bash
set -e

SERVICES=("postgres" "redis" "minio" "web")
TIMEOUT=5

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

check_service() {
    local service=$1
    local status
    
    case $service in
        postgres)
            pg_isready -h localhost -U $POSTGRES_USER -d $POSTGRES_DB -t $TIMEOUT
            status=$?
            ;;
        redis)
            redis-cli -a $REDIS_PASSWORD ping | grep -q "PONG"
            status=$?
            ;;
        minio)
            curl -sf "http://localhost:9000/minio/health/live" > /dev/null
            status=$?
            ;;
        web)
            curl -sf "http://localhost:3000/api/health" > /dev/null
            status=$?
            ;;
        *)
            echo "Unknown service: $service"
            return 1
            ;;
    esac
    
    return $status
}

print_status() {
    local service=$1
    local status=$2
    
    if [ $status -eq 0 ]; then
        echo -e "${GREEN}✅ $service: Healthy${NC}"
    else
        echo -e "${RED}❌ $service: Unhealthy${NC}"
        echo -e "${YELLOW}ℹ️  Troubleshooting $service:${NC}"
        case $service in
            postgres)
                echo "  • Check PostgreSQL logs: docker logs zephyr-postgres-prod"
                echo "  • Verify PostgreSQL config: cat /etc/postgresql/postgresql.conf"
                ;;
            redis)
                echo "  • Check Redis logs: docker logs zephyr-redis-prod"
                echo "  • Verify Redis connection: redis-cli -a \$REDIS_PASSWORD ping"
                ;;
            minio)
                echo "  • Check MinIO logs: docker logs zephyr-minio-prod"
                echo "  • Verify MinIO status: curl http://localhost:9000/minio/health/live"
                ;;
            web)
                echo "  • Check Web logs: docker logs zephyr-web-prod"
                echo "  • Verify Web process: ps aux | grep next"
                ;;
        esac
    fi
}

echo "🏥 Starting Health Check"
echo "------------------------"

unhealthy_services=0

for service in "${SERVICES[@]}"; do
    if check_service $service; then
        print_status $service 0
    else
        print_status $service 1
        ((unhealthy_services++))
    fi
done

echo "------------------------"
if [ $unhealthy_services -eq 0 ]; then
    echo -e "${GREEN}✅ All services are healthy${NC}"
    exit 0
else
    echo -e "${RED}❌ Found $unhealthy_services unhealthy service(s)${NC}"
    exit 1
fi
