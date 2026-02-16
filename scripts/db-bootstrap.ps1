param(
  [string]$DbHost = "localhost",
  [int]$DbPort = 5432,
  [string]$DbUser = "postgres",
  [string]$DbPassword = "postgres",
  [string]$DbName = "ferretto_app"
)

$ErrorActionPreference = "Stop"

$pgBin = "C:\Program Files\PostgreSQL\16\bin"
$createdb = Join-Path $pgBin "createdb.exe"
$psql = Join-Path $pgBin "psql.exe"

if (-not (Test-Path $createdb) -or -not (Test-Path $psql)) {
  throw "PostgreSQL binaries not found in '$pgBin'. Install PostgreSQL 16 first."
}

$env:PGPASSWORD = $DbPassword

Write-Host "[1/4] Waiting for PostgreSQL on ${DbHost}:${DbPort}..."
$ready = $false
for ($i = 0; $i -lt 20; $i++) {
  try {
    & $psql -h $DbHost -p $DbPort -U $DbUser -d postgres -c "SELECT 1;" | Out-Null
    $ready = $true
    break
  } catch {
    Start-Sleep -Seconds 2
  }
}

if (-not $ready) {
  throw "PostgreSQL is not reachable on ${DbHost}:${DbPort}"
}

Write-Host "[2/4] Creating database '$DbName' if missing..."
try {
  & $createdb -h $DbHost -p $DbPort -U $DbUser $DbName 2>$null
} catch {
  # Ignore if db already exists
}

Write-Host "[3/4] Running Prisma migrate deploy..."
npx prisma migrate deploy

Write-Host "[4/4] Running Prisma seed..."
npx prisma db seed

Write-Host "Database bootstrap completed."
