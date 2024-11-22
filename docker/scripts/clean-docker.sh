#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
DEV_COMPOSE_FILE="$PROJECT_ROOT/docker-compose.dev.yml"
PROD_COMPOSE_FILE="$PROJECT_ROOT/docker-compose.prod.yml"

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
    echo -e "${YELLOW}🧹 Docker Management Options:${NC}"
    echo -e "${GRAY}----------------------------------------${NC}"
    echo -e "${GREEN}1. Clean Development Environment${NC}"
    echo -e "${RED}2. Clean Production Environment${NC}"
    echo -e "${MAGENTA}3. Clean All Docker Resources${NC}"
    echo -e "${CYAN}4. Cleanup Specific Resources:${NC}"
    echo -e "   ${GRAY}a) Remove Dangling Images${NC}"
    echo -e "   ${GRAY}b) Remove Unused Networks${NC}"
    echo -e "   ${GRAY}c) Remove Unused Volumes${NC}"
    echo -e "   ${GRAY}d) Clean Build Cache${NC}"
    echo -e "   ${GRAY}e) Remove Exited Containers${NC}"
    echo -e "${YELLOW}5. Docker System Operations:${NC}"
    echo -e "   ${GRAY}a) Show Disk Usage${NC}"
    echo -e "   ${GRAY}b) Prune System${NC}"
    echo -e "   ${GRAY}c) Show Resource Stats${NC}"
    echo -e "${BLUE}6. Show Docker Status${NC}"
    echo -e "${MAGENTA}7. System Health Monitoring:${NC}"
    echo -e "   ${GRAY}a) Show Resource Usage${NC}"
    echo -e "   ${GRAY}b) Show Running Processes${NC}"
    echo -e "   ${GRAY}c) Show System Events${NC}"
    echo -e "   ${GRAY}d) Show Container Health Status${NC}"
    echo -e "${GREEN}8. Container Operations:${NC}"
    echo -e "   ${GRAY}a) Stop All Containers${NC}"
    echo -e "   ${GRAY}b) Restart All Containers${NC}"
    echo -e "   ${GRAY}c) Show Container Logs${NC}"
    echo -e "${CYAN}9. Network Management:${NC}"
    echo -e "   ${GRAY}a) List Network Details${NC}"
    echo -e "   ${GRAY}b) Inspect Network${NC}"
    echo -e "   ${GRAY}c) Create Network${NC}"
    echo -e "   ${GRAY}d) Remove Network${NC}"
    echo -e "${YELLOW}10. Image Management:${NC}"
    echo -e "   ${GRAY}a) List Images with Details${NC}"
    echo -e "   ${GRAY}b) Search Docker Hub${NC}"
    echo -e "   ${GRAY}c) Pull Image${NC}"
    echo -e "   ${GRAY}d) Remove Image${NC}"
    echo -e "   ${GRAY}e) Image History${NC}"
    echo -e "   ${GRAY}f) Export Image${NC}"
    echo -e "${MAGENTA}11. Volume Management:${NC}"
    echo -e "   ${GRAY}a) List Volumes with Details${NC}"
    echo -e "   ${GRAY}b) Inspect Volume${NC}"
    echo -e "   ${GRAY}c) Create Volume${NC}"
    echo -e "   ${GRAY}d) Remove Volume${NC}"
    echo -e "   ${GRAY}e) Backup Volume${NC}"
    echo -e "${RED}12. Exit${NC}"
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

cleanup_specific_resources() {
    echo -e "${CYAN}🧹 Cleanup Specific Resources${NC}"
    echo -e "a) Remove Dangling Images"
    echo -e "b) Remove Unused Networks"
    echo -e "c) Remove Unused Volumes"
    echo -e "d) Clean Build Cache"
    echo -e "e) Remove Exited Containers"
    
    read -p "Enter your choice (a-e): " choice
    
    case $choice in
        a) 
            echo -e "${YELLOW}🧹 Removing dangling images...${NC}"
            docker image prune -f
            ;;
        b)
            echo -e "${YELLOW}🧹 Removing unused networks...${NC}"
            docker network prune -f
            ;;
        c)
            echo -e "${YELLOW}🧹 Removing unused volumes...${NC}"
            docker volume prune -f
            ;;
        d)
            echo -e "${YELLOW}🧹 Cleaning build cache...${NC}"
            docker builder prune -f
            ;;
        e)
            echo -e "${YELLOW}🧹 Removing exited containers...${NC}"
            docker container prune -f
            ;;
        *)
            echo -e "${RED}❌ Invalid choice${NC}"
            ;;
    esac
}

docker_system_operations() {
    echo -e "${YELLOW}🐋 Docker System Operations${NC}"
    echo -e "a) Show Disk Usage"
    echo -e "b) Prune System"
    echo -e "c) Show Resource Stats"
    
    read -p "Enter your choice (a-c): " choice
    
    case $choice in
        a)
            echo -e "${CYAN}📊 Docker Disk Usage:${NC}"
            docker system df -v
            ;;
        b)
            read -p "⚠️ This will remove all unused data. Continue? (y/N) " confirm
            if [ "$confirm" == "y" ]; then
                docker system prune -af
            fi
            ;;
        c)
            echo -e "${CYAN}📊 Resource Statistics:${NC}"
            docker stats --no-stream
            ;;
        *)
            echo -e "${RED}❌ Invalid choice${NC}"
            ;;
    esac
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

system_health_monitoring() {
    echo -e "${CYAN}🏥 System Health Monitoring${NC}"
    echo -e "a) Show Resource Usage"
    echo -e "b) Show Running Processes"
    echo -e "c) Show System Events"
    echo -e "d) Show Container Health Status"
    
    read -p "Enter your choice (a-d): " choice
    
    case $choice in
        a)
            echo -e "${CYAN}📊 Resource Usage:${NC}"
            docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
            ;;
        b)
            echo -e "${CYAN}📋 Running Processes:${NC}"
            containers=$(get_docker_resources "ps -q")
            if [ -n "$containers" ]; then
                docker top $containers
            fi
            ;;
        c)
            echo -e "${CYAN}📅 System Events:${NC}"
            docker events --since 1h --until now
            ;;
        d)
            echo -e "${CYAN}🔍 Container Health Status:${NC}"
            docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Health}}"
            ;;
        *)
            echo -e "${RED}❌ Invalid choice${NC}"
            ;;
    esac
}

container_operations() {
    echo -e "${MAGENTA}🐳 Container Operations${NC}"
    echo -e "a) Stop All Containers"
    echo -e "b) Restart All Containers"
    echo -e "c) Show Container Logs"
    
    read -p "Enter your choice (a-c): " choice
    
    case $choice in
        a)
            echo -e "${YELLOW}🛑 Stopping all containers...${NC}"
            containers=$(get_docker_resources "ps -q")
            if [ -n "$containers" ]; then
                docker stop $containers
            fi
            ;;
        b)
            echo -e "${YELLOW}🔄 Restarting all containers...${NC}"
            containers=$(get_docker_resources "ps -q")
            if [ -n "$containers" ]; then
                docker restart $containers
            fi
            ;;
        c)
            containers=$(get_docker_resources "ps --format '{{.Names}}'")
            if [ -n "$containers" ]; then
                echo -e "\nAvailable containers:"
                IFS=$'\n' read -r -d '' -a containersArray <<< "$containers"
                for i in "${!containersArray[@]}"; do
                    echo "$((i + 1))) ${containersArray[i]}"
                done
                read -p "Enter container number: " containerChoice
                selectedContainer="${containersArray[$((containerChoice - 1))]}"
                if [ -n "$selectedContainer" ]; then
                    docker logs --tail 100 -f "$selectedContainer"
                fi
            fi
            ;;
        *)
            echo -e "${RED}❌ Invalid choice${NC}"
            ;;
    esac
}

network_management() {
    echo -e "${CYAN}🌐 Network Management${NC}"
    echo -e "a) List Network Details"
    echo -e "b) Inspect Network"
    echo -e "c) Create Network"
    echo -e "d) Remove Network"
    
    read -p "Enter your choice (a-d): " choice
    
    case $choice in
        a)
            docker network ls --format "table {{.ID}}\t{{.Name}}\t{{.Driver}}\t{{.Scope}}"
            ;;
        b)
            networks=$(get_docker_resources "network ls --format '{{.Name}}'")
            if [ -n "$networks" ]; then
                echo -e "\nAvailable networks:"
                IFS=$'\n' read -r -d '' -a networksArray <<< "$networks"
                for i in "${!networksArray[@]}"; do
                    echo "$((i + 1))) ${networksArray[i]}"
                done
                read -p "Enter network number: " netChoice
                selectedNetwork="${networksArray[$((netChoice - 1))]}"
                if [ -n "$selectedNetwork" ]; then
                    docker network inspect "$selectedNetwork"
                fi
            fi
            ;;
        c)
            read -p "Enter network name: " netName
            read -p "Enter driver (bridge/overlay/host/none): " driver
            docker network create --driver "$driver" "$netName"
            ;;
        d)
            read -p "Enter network name to remove: " netToRemove
            docker network rm "$netToRemove"
            ;;
        *)
            echo -e "${RED}❌ Invalid choice${NC}"
            ;;
    esac
}

image_management() {
    echo -e "${CYAN}📦 Image Management${NC}"
    echo -e "a) List Images with Details"
    echo -e "b) Search Docker Hub"
    echo -e "c) Pull Image"
    echo -e "d) Remove Image"
    echo -e "e) Image History"
    echo -e "f) Export Image"
    
    read -p "Enter your choice (a-f): " choice
    
    case $choice in
        a)
            docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedSince}}"
            ;;
        b)
            read -p "Enter search term: " searchTerm
            docker search "$searchTerm" --format "table {{.Name}}\t{{.Description}}\t{{.Stars}}"
            ;;
        c)
            read -p "Enter image name (e.g., nginx:latest): " imageToPull
            docker pull "$imageToPull"
            ;;
        d)
            read -p "Enter image name to remove: " imageToRemove
            docker rmi "$imageToRemove"
            ;;
        e)
            read -p "Enter image name: " imageHistory
            docker history "$imageHistory" --format "table {{.ID}}\t{{.CreatedSince}}\t{{.Size}}\t{{.Comment}}"
            ;;
        f)
            read -p "Enter image name: " imageToExport
            read -p "Enter export path (e.g., ./backup.tar): " exportPath
            docker save -o "$exportPath" "$imageToExport"
            ;;
        *)
            echo -e "${RED}❌ Invalid choice${NC}"
            ;;
    esac
}

volume_management() {
    echo -e "${CYAN}💾 Volume Management${NC}"
    echo -e "a) List Volumes with Details"
    echo -e "b) Inspect Volume"
    echo -e "c) Create Volume"
    echo -e "d) Remove Volume"
    echo -e "e) Backup Volume"
    
    read -p "Enter your choice (a-e): " choice
    
    case $choice in
        a)
            docker volume ls --format "table {{.Name}}\t{{.Driver}}\t{{.Scope}}"
            ;;
        b)
            volumes=$(get_docker_resources "volume ls --format '{{.Name}}'")
            if [ -n "$volumes" ]; then
                echo -e "\nAvailable volumes:"
                IFS=$'\n' read -r -d '' -a volumesArray <<< "$volumes"
                for i in "${!volumesArray[@]}"; do
                    echo "$((i + 1))) ${volumesArray[i]}"
                done
                read -p "Enter volume number: " volChoice
                selectedVolume="${volumesArray[$((volChoice - 1))]}"
                if [ -n "$selectedVolume" ]; then
                    docker volume inspect "$selectedVolume"
                fi
            fi
            ;;
        c)
            read -p "Enter volume name: " volName
            docker volume create "$volName"
            ;;
        d)
            read -p "Enter volume name to remove: " volToRemove
            docker volume rm "$volToRemove"
            ;;
        e)
            read -p "Enter volume name: " volToBackup
            read -p "Enter backup path (e.g., ./volume-backup.tar): " backupPath
            docker run --rm -v "${volToBackup}:/source" -v "$(pwd):/backup" alpine tar -czf "/backup/$backupPath" -C /source .
            ;;
        *)
            echo -e "${RED}❌ Invalid choice${NC}"
            ;;
    esac
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
        4) cleanup_specific_resources ;;
        5) docker_system_operations ;;
        6) show_docker_status ;;
        7) system_health_monitoring ;;
        8) container_operations ;;
        9) network_management ;;
        10) image_management ;;
        11) volume_management ;;
        12) 
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
