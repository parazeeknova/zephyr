$PROJECT_ROOT = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$DEV_COMPOSE_FILE = Join-Path $PROJECT_ROOT "docker-compose.dev.yml"
$PROD_COMPOSE_FILE = Join-Path $PROJECT_ROOT "docker-compose.prod.yml"

function Show-Banner {
    $banner = @"
███████╗███████╗██████╗ ██╗  ██╗██╗   ██╗██████╗ 
╚══███╔╝██╔════╝██╔══██╗██║  ██║╚██╗ ██╔╝██╔══██╗
  ███╔╝ █████╗  ██████╔╝███████║ ╚████╔╝ ██████╔╝
 ███╔╝  ██╔══╝  ██╔═══╝ ██╔══██║  ╚██╔╝  ██╔══██╗
███████╗███████╗██║     ██║  ██║   ██║   ██║  ██║
╚══════╝╚══════╝╚═╝     ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝
[DOCKER] Cleanup Utility
"@
    Write-Host $banner -ForegroundColor Cyan
}

function Show-Menu {
    Write-Host "🧹 Docker Management Options:" -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor DarkGray
    
    # Environment Management
    Write-Host "1. Clean Development Environment" -ForegroundColor Green
    Write-Host "2. Clean Production Environment" -ForegroundColor Red
    Write-Host "3. Clean All Docker Resources" -ForegroundColor Magenta
    
    # Resource Management
    Write-Host "4. Cleanup Specific Resources:" -ForegroundColor Cyan
    Write-Host "   a) Remove Dangling Images" -ForegroundColor DarkGray
    Write-Host "   b) Remove Unused Networks" -ForegroundColor DarkGray
    Write-Host "   c) Remove Unused Volumes" -ForegroundColor DarkGray
    Write-Host "   d) Clean Build Cache" -ForegroundColor DarkGray
    Write-Host "   e) Remove Exited Containers" -ForegroundColor DarkGray
    
    # System Operations
    Write-Host "5. Docker System Operations:" -ForegroundColor Yellow
    Write-Host "   a) Show Disk Usage" -ForegroundColor DarkGray
    Write-Host "   b) Prune System" -ForegroundColor DarkGray
    Write-Host "   c) Show Resource Stats" -ForegroundColor DarkGray
    
    # Status and Monitoring
    Write-Host "6. Show Docker Status" -ForegroundColor Blue
    Write-Host "7. System Health Monitoring:" -ForegroundColor Magenta
    Write-Host "   a) Show Resource Usage" -ForegroundColor DarkGray
    Write-Host "   b) Show Running Processes" -ForegroundColor DarkGray
    Write-Host "   c) Show System Events" -ForegroundColor DarkGray
    Write-Host "   d) Show Container Health Status" -ForegroundColor DarkGray
    
    # Resource Management
    Write-Host "8. Container Operations:" -ForegroundColor Green
    Write-Host "   a) Stop All Containers" -ForegroundColor DarkGray
    Write-Host "   b) Restart All Containers" -ForegroundColor DarkGray
    Write-Host "   c) Show Container Logs" -ForegroundColor DarkGray
    
    Write-Host "9. Network Management:" -ForegroundColor Cyan
    Write-Host "   a) List Network Details" -ForegroundColor DarkGray
    Write-Host "   b) Inspect Network" -ForegroundColor DarkGray
    Write-Host "   c) Create Network" -ForegroundColor DarkGray
    Write-Host "   d) Remove Network" -ForegroundColor DarkGray
    
    Write-Host "10. Image Management:" -ForegroundColor Yellow
    Write-Host "    a) List Images with Details" -ForegroundColor DarkGray
    Write-Host "    b) Search Docker Hub" -ForegroundColor DarkGray
    Write-Host "    c) Pull Image" -ForegroundColor DarkGray
    Write-Host "    d) Remove Image" -ForegroundColor DarkGray
    Write-Host "    e) Image History" -ForegroundColor DarkGray
    Write-Host "    f) Export Image" -ForegroundColor DarkGray
    
    Write-Host "11. Volume Management:" -ForegroundColor Magenta
    Write-Host "    a) List Volumes with Details" -ForegroundColor DarkGray
    Write-Host "    b) Inspect Volume" -ForegroundColor DarkGray
    Write-Host "    c) Create Volume" -ForegroundColor DarkGray
    Write-Host "    d) Remove Volume" -ForegroundColor DarkGray
    Write-Host "    e) Backup Volume" -ForegroundColor DarkGray
    
    Write-Host "12. Exit" -ForegroundColor Red
    Write-Host "----------------------------------------" -ForegroundColor DarkGray
}

function Get-DockerResources {
    param (
        [string]$Command
    )
    
    try {
        $result = Invoke-Expression "docker $Command"
        if ($LASTEXITCODE -eq 0 -and $result) {
            return $result
        }
    }
    catch {
        Write-Host "Error executing docker command: $_" -ForegroundColor Red
    }
    return $null
}

function Clean-DevEnvironment {
    Write-Host "🧹 Cleaning Development Environment..." -ForegroundColor Yellow
    
    $confirm = Read-Host "⚠️ This will remove all development containers, volumes, and networks. Continue? (y/N)"
    if ($confirm -ne "y") {
        Write-Host "❌ Operation cancelled" -ForegroundColor Red
        return
    }

    Write-Host "🛑 Stopping development containers..." -ForegroundColor Yellow
    docker compose -f "$DEV_COMPOSE_FILE" down -v --remove-orphans

    Write-Host "🗑️ Removing development volumes..." -ForegroundColor Yellow
    $devVolumes = Get-DockerResources "volume ls -q --filter name=zephyr_*_dev"
    if ($devVolumes) {
        docker volume rm $devVolumes
    }

    Write-Host "✨ Development environment cleaned" -ForegroundColor Green
}

function Clean-ProdEnvironment {
    Write-Host "🧹 Cleaning Production Environment..." -ForegroundColor Red
    
    $confirm = Read-Host "⚠️ WARNING: This will remove all production data! Are you absolutely sure? (yes/N)"
    if ($confirm -ne "yes") {
        Write-Host "❌ Operation cancelled" -ForegroundColor Red
        return
    }

    Write-Host "🛑 Stopping production containers..." -ForegroundColor Yellow
    docker compose -f "$PROD_COMPOSE_FILE" down -v --remove-orphans

    Write-Host "🗑️ Removing production volumes..." -ForegroundColor Yellow
    $prodVolumes = Get-DockerResources "volume ls -q --filter name=zephyr_*_prod"
    if ($prodVolumes) {
        docker volume rm $prodVolumes
    }

    Write-Host "✨ Production environment cleaned" -ForegroundColor Green
}

function Clean-AllDocker {
    Write-Host "🧹 Cleaning All Docker Resources..." -ForegroundColor Magenta
    
    $confirm = Read-Host "⚠️ WARNING: This will remove ALL Docker resources! Continue? (yes/N)"
    if ($confirm -ne "yes") {
        Write-Host "❌ Operation cancelled" -ForegroundColor Red
        return
    }

    Write-Host "🛑 Stopping all containers..." -ForegroundColor Yellow
    $containers = Get-DockerResources "ps -aq"
    if ($containers) {
        docker stop $containers
        docker rm $containers
    }

    Write-Host "🧹 Removing all images..." -ForegroundColor Yellow
    $images = Get-DockerResources "images -q"
    if ($images) {
        docker rmi -f $images
    }

    Write-Host "📦 Removing all volumes..." -ForegroundColor Yellow
    $volumes = Get-DockerResources "volume ls -q"
    if ($volumes) {
        docker volume rm $volumes
    }

    Write-Host "🌐 Removing all networks..." -ForegroundColor Yellow
    docker network prune -f

    Write-Host "🔄 Cleaning build cache..." -ForegroundColor Yellow
    docker builder prune -af

    Write-Host "✨ All Docker resources cleaned" -ForegroundColor Green
}

function Clean-SpecificResources {
    Write-Host "🧹 Cleanup Specific Resources" -ForegroundColor Cyan
    Write-Host "a) Remove Dangling Images"
    Write-Host "b) Remove Unused Networks"
    Write-Host "c) Remove Unused Volumes"
    Write-Host "d) Clean Build Cache"
    Write-Host "e) Remove Exited Containers"
    
    $choice = Read-Host "Enter your choice (a-e)"
    
    switch ($choice.ToLower()) {
        "a" {
            Write-Host "🧹 Removing dangling images..." -ForegroundColor Yellow
            docker image prune -f
        }
        "b" {
            Write-Host "🧹 Removing unused networks..." -ForegroundColor Yellow
            docker network prune -f
        }
        "c" {
            Write-Host "🧹 Removing unused volumes..." -ForegroundColor Yellow
            docker volume prune -f
        }
        "d" {
            Write-Host "🧹 Cleaning build cache..." -ForegroundColor Yellow
            docker builder prune -f
        }
        "e" {
            Write-Host "🧹 Removing exited containers..." -ForegroundColor Yellow
            docker container prune -f
        }
        default { Write-Host "❌ Invalid choice" -ForegroundColor Red }
    }
}

function Show-SystemOperations {
    Write-Host "🐋 Docker System Operations" -ForegroundColor Yellow
    Write-Host "a) Show Disk Usage"
    Write-Host "b) Prune System"
    Write-Host "c) Show Resource Stats"
    
    $choice = Read-Host "Enter your choice (a-c)"
    
    switch ($choice.ToLower()) {
        "a" {
            Write-Host "📊 Docker Disk Usage:" -ForegroundColor Cyan
            docker system df -v
        }
        "b" {
            $confirm = Read-Host "⚠️ This will remove all unused data. Continue? (y/N)"
            if ($confirm -eq "y") {
                docker system prune -af
            }
        }
        "c" {
            Write-Host "📊 Resource Statistics:" -ForegroundColor Cyan
            docker stats --no-stream
        }
        default { Write-Host "❌ Invalid choice" -ForegroundColor Red }
    }
}

function Show-DockerStatus {
    Write-Host "`n📊 Docker Status" -ForegroundColor Blue
    Write-Host "----------------------------------------" -ForegroundColor DarkGray
    
    Write-Host "🐋 Running Containers:" -ForegroundColor Cyan
    docker ps --format "table {{.Names}}`t{{.Status}}`t{{.Ports}}"
    
    Write-Host "`n💾 Volumes:" -ForegroundColor Cyan
    docker volume ls --format "table {{.Name}}`t{{.Driver}}"
    
    Write-Host "`n🌐 Networks:" -ForegroundColor Cyan
    docker network ls --format "table {{.Name}}`t{{.Driver}}`t{{.Scope}}"
    
    Write-Host "`n📦 Images:" -ForegroundColor Cyan
    docker images --format "table {{.Repository}}`t{{.Tag}}`t{{.Size}}"
    
    Write-Host "`n💽 Disk Usage:" -ForegroundColor Cyan
    docker system df
}

function Show-SystemHealth {
    Write-Host "🏥 System Health Monitoring" -ForegroundColor Cyan
    Write-Host "a) Show Resource Usage"
    Write-Host "b) Show Running Processes"
    Write-Host "c) Show System Events"
    Write-Host "d) Show Container Health Status"
    
    $choice = Read-Host "Enter your choice (a-d)"
    
    switch ($choice.ToLower()) {
        "a" {
            Write-Host "📊 Resource Usage:" -ForegroundColor Cyan
            docker stats --no-stream --format "table {{.Name}}`t{{.CPUPerc}}`t{{.MemUsage}}`t{{.NetIO}}`t{{.BlockIO}}"
        }
        "b" {
            Write-Host "📋 Running Processes:" -ForegroundColor Cyan
            $containers = Get-DockerResources "ps -q"
            if ($containers) {
                docker top $containers
            }
        }
        "c" {
            Write-Host "📅 System Events:" -ForegroundColor Cyan
            docker events --since 1h --until now
        }
        "d" {
            Write-Host "🔍 Container Health Status:" -ForegroundColor Cyan
            docker ps --format "table {{.Names}}`t{{.Status}}`t{{.Health}}"
        }
        default { Write-Host "❌ Invalid choice" -ForegroundColor Red }
    }
}

function Container-Operations {
    Write-Host "🐳 Container Operations" -ForegroundColor Magenta
    Write-Host "a) Stop All Containers"
    Write-Host "b) Restart All Containers"
    Write-Host "c) Show Container Logs"
    
    $choice = Read-Host "Enter your choice (a-c)"
    
    switch ($choice.ToLower()) {
        "a" {
            Write-Host "🛑 Stopping all containers..." -ForegroundColor Yellow
            $containers = Get-DockerResources "ps -q"
            if ($containers) {
                docker stop $containers
            }
        }
        "b" {
            Write-Host "🔄 Restarting all containers..." -ForegroundColor Yellow
            $containers = Get-DockerResources "ps -q"
            if ($containers) {
                docker restart $containers
            }
        }
        "c" {
            $containers = Get-DockerResources "ps --format '{{.Names}}'"
            if ($containers) {
                Write-Host "`nAvailable containers:"
                $containersArray = $containers -split "`n"
                for ($i = 0; $i -lt $containersArray.Length; $i++) {
                    Write-Host "$($i + 1)) $($containersArray[$i])"
                }
                $containerChoice = Read-Host "Enter container number"
                $selectedContainer = $containersArray[$containerChoice - 1]
                if ($selectedContainer) {
                    docker logs --tail 100 -f $selectedContainer
                }
            }
        }
        default { Write-Host "❌ Invalid choice" -ForegroundColor Red }
    }
}

function Network-Management {
    Write-Host "🌐 Network Management" -ForegroundColor Cyan
    Write-Host "a) List Network Details"
    Write-Host "b) Inspect Network"
    Write-Host "c) Create Network"
    Write-Host "d) Remove Network"
    
    $choice = Read-Host "Enter your choice (a-d)"
    
    switch ($choice.ToLower()) {
        "a" {
            docker network ls --format "table {{.ID}}`t{{.Name}}`t{{.Driver}}`t{{.Scope}}"
        }
        "b" {
            $networks = Get-DockerResources "network ls --format '{{.Name}}'"
            if ($networks) {
                Write-Host "`nAvailable networks:"
                $networksArray = $networks -split "`n"
                for ($i = 0; $i -lt $networksArray.Length; $i++) {
                    Write-Host "$($i + 1)) $($networksArray[$i])"
                }
                $netChoice = Read-Host "Enter network number"
                $selectedNetwork = $networksArray[$netChoice - 1]
                if ($selectedNetwork) {
                    docker network inspect $selectedNetwork
                }
            }
        }
        "c" {
            $netName = Read-Host "Enter network name"
            $driver = Read-Host "Enter driver (bridge/overlay/host/none)"
            docker network create --driver $driver $netName
        }
        "d" {
            $netToRemove = Read-Host "Enter network name to remove"
            docker network rm $netToRemove
        }
        default { Write-Host "❌ Invalid choice" -ForegroundColor Red }
    }
}

function Image-Management {
    Write-Host "📦 Image Management" -ForegroundColor Cyan
    Write-Host "a) List Images with Details"
    Write-Host "b) Search Docker Hub"
    Write-Host "c) Pull Image"
    Write-Host "d) Remove Image"
    Write-Host "e) Image History"
    Write-Host "f) Export Image"
    
    $choice = Read-Host "Enter your choice (a-f)"
    
    switch ($choice.ToLower()) {
        "a" {
            docker images --format "table {{.Repository}}`t{{.Tag}}`t{{.Size}}`t{{.CreatedSince}}"
        }
        "b" {
            $searchTerm = Read-Host "Enter search term"
            docker search $searchTerm --format "table {{.Name}}`t{{.Description}}`t{{.Stars}}"
        }
        "c" {
            $imageToPull = Read-Host "Enter image name (e.g., nginx:latest)"
            docker pull $imageToPull
        }
        "d" {
            $imageToRemove = Read-Host "Enter image name to remove"
            docker rmi $imageToRemove
        }
        "e" {
            $imageHistory = Read-Host "Enter image name"
            docker history $imageHistory --format "table {{.ID}}`t{{.CreatedSince}}`t{{.Size}}`t{{.Comment}}"
        }
        "f" {
            $imageToExport = Read-Host "Enter image name"
            $exportPath = Read-Host "Enter export path (e.g., ./backup.tar)"
            docker save -o $exportPath $imageToExport
        }
        default { Write-Host "❌ Invalid choice" -ForegroundColor Red }
    }
}

function Volume-Management {
    Write-Host "💾 Volume Management" -ForegroundColor Cyan
    Write-Host "a) List Volumes with Details"
    Write-Host "b) Inspect Volume"
    Write-Host "c) Create Volume"
    Write-Host "d) Remove Volume"
    Write-Host "e) Backup Volume"
    
    $choice = Read-Host "Enter your choice (a-e)"
    
    switch ($choice.ToLower()) {
        "a" {
            docker volume ls --format "table {{.Name}}`t{{.Driver}}`t{{.Scope}}"
        }
        "b" {
            $volumes = Get-DockerResources "volume ls --format '{{.Name}}'"
            if ($volumes) {
                Write-Host "`nAvailable volumes:"
                $volumesArray = $volumes -split "`n"
                for ($i = 0; $i -lt $volumesArray.Length; $i++) {
                    Write-Host "$($i + 1)) $($volumesArray[$i])"
                }
                $volChoice = Read-Host "Enter volume number"
                $selectedVolume = $volumesArray[$volChoice - 1]
                if ($selectedVolume) {
                    docker volume inspect $selectedVolume
                }
            }
        }
        "c" {
            $volName = Read-Host "Enter volume name"
            docker volume create $volName
        }
        "d" {
            $volToRemove = Read-Host "Enter volume name to remove"
            docker volume rm $volToRemove
        }
        "e" {
            $volToBackup = Read-Host "Enter volume name"
            $backupPath = Read-Host "Enter backup path (e.g., ./volume-backup.tar)"
            docker run --rm -v ${volToBackup}:/source -v ${PWD}:/backup alpine tar -czf /backup/$backupPath -C /source .
        }
        default { Write-Host "❌ Invalid choice" -ForegroundColor Red }
    }
}

Set-Location $PROJECT_ROOT
Clear-Host
Show-Banner

while ($true) {
    Show-Menu
    $choice = Read-Host "`n👉 Enter your choice"
    
    switch ($choice) {
        "1" { Clean-DevEnvironment }
        "2" { Clean-ProdEnvironment }
        "3" { Clean-AllDocker }
        "4" { Clean-SpecificResources }
        "5" { Show-SystemOperations }
        "6" { Show-DockerStatus }
        "7" { Show-SystemHealth }
        "8" { Container-Operations }
        "9" { Network-Management }
        "10" { Image-Management }
        "11" { Volume-Management }
        "12" { 
            Write-Host "👋 Goodbye!" -ForegroundColor Cyan
            exit 
        }
        default { Write-Host "❌ Invalid choice" -ForegroundColor Red }
    }
    
    Write-Host "`nPress any key to continue..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    Clear-Host
    Show-Banner
}
