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
    Write-Host "🧹 Docker Cleanup Options:" -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor DarkGray
    Write-Host "1. Clean Development Environment" -ForegroundColor Green
    Write-Host "2. Clean Production Environment" -ForegroundColor Red
    Write-Host "3. Clean All Docker Resources" -ForegroundColor Magenta
    Write-Host "4. Show Docker Status" -ForegroundColor Blue
    Write-Host "5. Exit" -ForegroundColor Gray
    Write-Host "----------------------------------------" -ForegroundColor DarkGray
}

function Get-DockerResources {
    param (
        [string]$Command
    )
    
    $result = Invoke-Expression "docker $Command"
    if ($LASTEXITCODE -eq 0 -and $result) {
        return $result
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
    
    Write-Host "----------------------------------------" -ForegroundColor DarkGray
}

# Main script
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
        "4" { Show-DockerStatus }
        "5" { 
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

