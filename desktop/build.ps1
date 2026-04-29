# ══════════════════════════════════════════════════════════
# build.ps1 — Script de compilation AsimovENT
# ══════════════════════════════════════════════════════════

Write-Host ""
Write-Host "Compilation .exe pour AsimovENT" -ForegroundColor Cyan
Write-Host ""

$dotnet = Get-Command dotnet -ErrorAction SilentlyContinue
if (-not $dotnet) {
    Write-Host ".NET SDK introuvable !" -ForegroundColor Red
    Write-Host "Telecharge-le sur : https://dotnet.microsoft.com/download/dotnet/8.0"
    Read-Host "Appuie sur Entree pour quitter"
    exit 1
}
Write-Host ".NET SDK detecte : $(dotnet --version)" -ForegroundColor Green

$scriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$rootDir    = Split-Path -Parent $scriptDir
$projectDir = Join-Path $rootDir "AsimovENT"
$distDir    = Join-Path $rootDir "dist"
$srcWeb     = Join-Path $projectDir "web"
$distWeb    = Join-Path $distDir "web"

if (-not (Test-Path $projectDir)) {
    Write-Host "Dossier AsimovENT introuvable a : $projectDir" -ForegroundColor Red
    Read-Host "Appuie sur Entree pour quitter"
    exit 1
}

Set-Location $projectDir

# Tuer le processus si ouvert
$proc = Get-Process -Name "AsimovENT" -ErrorAction SilentlyContinue
if ($proc) {
    Write-Host "Fermeture AsimovENT..." -ForegroundColor Yellow
    Stop-Process -InputObject $proc -Force
    Start-Sleep -Seconds 1
}

# Restaurer NuGet
Write-Host ""
Write-Host "Restauration NuGet..." -ForegroundColor Cyan
dotnet restore
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur restauration." -ForegroundColor Red
    Read-Host "Appuie sur Entree pour quitter"
    exit 1
}

# Compiler
Write-Host ""
Write-Host "Compilation..." -ForegroundColor Cyan
dotnet publish -c Release -r win-x64 --self-contained false -p:PublishSingleFile=true -o $distDir
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur compilation." -ForegroundColor Red
    Read-Host "Appuie sur Entree pour quitter"
    exit 1
}

# Synchroniser les fichiers web → dist/web/
Write-Host ""
Write-Host "Synchronisation web..." -ForegroundColor Cyan

if (-not (Test-Path $distWeb)) {
    New-Item -ItemType Directory -Path $distWeb | Out-Null
}

$files = Get-ChildItem -Path $srcWeb -File
foreach ($file in $files) {
    $dest = Join-Path $distWeb $file.Name
    Copy-Item -Path $file.FullName -Destination $dest -Force
    Write-Host "  OK $($file.Name)" -ForegroundColor Gray
}

# Creer le ZIP dans site-vitrine/ent/downloads/
$zipPath = Join-Path $rootDir "site-vitrine\ent\downloads\AsimovENT.zip"
$downloadsDir = Split-Path -Parent $zipPath
if (-not (Test-Path $downloadsDir)) {
    New-Item -ItemType Directory -Path $downloadsDir | Out-Null
}
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Compress-Archive -Path "$distDir\*" -DestinationPath $zipPath
Write-Host "ZIP cree : $zipPath" -ForegroundColor Green

# Resume
Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host " Compilation reussie !" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host " EXE : $distDir\AsimovENT.exe"
Write-Host " Web : $distWeb\"
Write-Host " ZIP : $zipPath"
Write-Host ""
Write-Host "Pour distribuer : partager le ZIP depuis site-vitrine/ent/downloads/"
Write-Host ""

$openFolder = Read-Host "Ouvrir dist/ ? (O/N)"
if ($openFolder -eq "O" -or $openFolder -eq "o") {
    Invoke-Item $distDir
}
