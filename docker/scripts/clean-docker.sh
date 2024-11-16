#!/bin/bash

# Get the project root directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DEV_COMPOSE_FILE="$PROJECT_ROOT/docker-compose.dev.yml"
PROD_COMPOSE_FILE="$PROJECT_ROOT/docker-compose.prod.yml"

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
NC='\033[0m'

show_banner() {
    echo -e "${CYAN}"
    cat << "EOB"
███████╗███████╗██████╗ ██╗  ██╗██╗   ██╗██████╗ 
╚══███╔╝██╔════╝██╔══██╗██║  ██║╚██╗ ██╔╝██╔══██╗
  ███╔╝ █████╗  ██████╔╝███████║ ╚████╔╝ ██████╔╝
 ███╔╝  ██╔══╝  ██╔═══╝ ██╔══██║  ╚██╔╝  ██╔══██╗
███████╗███████╗██║     ██║  ██║   ██║   ██║  ██║
╚══════╝╚══════╝╚═╝     ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝
[DOCKER] Cleanup Utility
EOB
    echo -e "${NC}"
}

show_menu() {
    echo -e "${YELLOW}🧹 Docker Cleanup Options:${NC}"
    echo -e "${GRAY}----------------------------------------${NC}"
    echo -e "${GREEN}1. Clean Development Environment${NC}"
    echo -e "${RED}2. Clean Production Environment${NC}"
    echo -e "${MAGENTA}3. Clean All Docker Resources${NC}"
    echo -e "${BLUE}4. Show Docker Status${NC}"
    echo -e "${GRAY}5. Exit${NC}"
    echo -e "${GRAY}----------------------------------------${NC}"
}

get_docker_resources() {
    local result
    result=$(eval "docker $1" 2>/dev/null)
    if [ $? -eq 0 ] && [ -n "$result" ]; then
        echo "$result"
        return 0
    fi
    return 1
}

clean_dev_environment() {
    echo -e "${YELLOW}🧹 Cleaning Development Environment...${NC}"
    
    read -p "⚠️ This will remove all development containers, volumes, and networks. Continue? (y/N) " confirm
    if [ "$confirm" != "y" ]; then
        echo -e "${RED}❌ Operation cancelled${NC}"
        return
    fi

    echo -e "${YELLOW}🛑 Stopping development containers...${NC}"
    docker compose -f "$DEV_COMPOSE_FILE" down -v --remove-orphans

    echo -e "${YELLOW}🗑️ Removing development volumes...${NC}"
    dev_volumes=$(get_docker_resources "volume ls -q --filter name=zephyr_*_dev")
    if [ -n "$dev_volumes" ]; then
        docker volume rm $dev_volumes
    fi

    echo -e "${GREEN}✨ Development environment cleaned${NC}"
}

clean_prod_environment() {
    echo -e "${RED}🧹 Cleaning Production Environment...${NC}"
    
    read -p "⚠️ WARNING: This will remove all production data! Are you absolutely sure? (yes/N) " confirm
    if [ "$confirm" != "yes" ]; then
        echo -e "${RED}❌ Operation cancelled${NC}"
        return
    fi

    echo -e "${YELLOW}🛑 Stopping production containers...${NC}"
    docker compose -f "$PROD_COMPOSE_FILE" down -v --remove-orphans

    echo -e "${YELLOW}🗑️ Removing production volumes...${NC}"
    prod_volumes=$(get_docker_resources "volume ls -q --filter name=zephyr_*_prod")
    if [ -n "$prod_volumes" ]; then
        docker volume rm $prod_volumes
    fi

    echo -e "${GREEN}✨ Production environment cleaned${NC}"
}

clean_all_docker() {
    echo -e "${MAGENTA}🧹 Cleaning All Docker Resources...${NC}"
    
    read -p "⚠️ WARNING: This will remove ALL Docker resources! Continue? (yes/N) " confirm
    if [ "$confirm" != "yes" ]; then
        echo -e "${RED}❌ Operation cancelled${NC}"
        return
    fi

    echo -e "${YELLOW}🛑 Stopping all containers...${NC}"
    containers=$(get_docker_resources "ps -aq")
    if [ -n "$containers" ]; then
        docker stop $containers
        docker rm $containers
    fi

    echo -e "${YELLOW}🧹 Removing all images...${NC}"
    images=$(get_docker_resources "images -q")
    if [ -n "$images" ]; then
        docker rmi -f $images
    fi

    echo -e "${YELLOW}📦 Removing all volumes...${NC}"
    volumes=$(get_docker_resources "volume ls -q")
    if [ -n "$volumes" ]; then
        docker volume rm $volumes
    fi

    echo -e "${YELLOW}🌐 Removing all networks...${NC}"
    docker network prune -f

    echo -e "${YELLOW}🔄 Cleaning build cache...${NC}"
    docker builder prune -af

    echo -e "${GREEN}✨ All Docker resources cleaned${NC}"
}

show_docker_status() {
    echo -e "\n${BLUE}📊 Docker Status${NC}"
    echo -e "${GRAY}----------------------------------------${NC}"
    
    echo -e "${CYAN}🐋 Running Containers:${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    echo -e "\n${CYAN}💾 Volumes:${NC}"
    docker volume ls --format "table {{.Name}}\t{{.Driver}}"
    
    echo -e "\n${CYAN}🌐 Networks:${NC}"
    docker network ls --format "table {{.Name}}\t{{.Driver}}\t{{.Scope}}"
    
    echo -e "\n${CYAN}📦 Images:${NC}"
    docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
    
    echo -e "\n${CYAN}💽 Disk Usage:${NC}"
    docker system df
}

# Main script
cd "$PROJECT_ROOT"
clear
show_banner

while true; do
    show_menu
    read -p $'\n👉 Enter your choice: ' choice
    
    case $choice in
        1) clean_dev_environment ;;
        2) clean_prod_environment ;;
        3) clean_all_docker ;;
        4) show_docker_status ;;
        5) 
            echo -e "${CYAN}👋 Goodbye!${NC}"
            exit 0
            ;;
        *) echo -e "${RED}❌ Invalid choice${NC}" ;;
    esac
    
    echo -e "\nPress any key to continue..."
    read -n 1 -s
    clear
    show_banner
done
