param(
  [ValidateSet("start", "stop", "restart", "status", "logs")]
  [string]$Action = "status",
  [int]$Port = 3000
)

$ErrorActionPreference = "Stop"

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$RuntimeDir = Join-Path $ProjectRoot ".runtime"
$PidFile = Join-Path $RuntimeDir "dev-server.pid"
$OutLog = Join-Path $RuntimeDir "dev-server.out.log"
$ErrLog = Join-Path $RuntimeDir "dev-server.err.log"
$HealthUrl = "http://localhost:$Port/api/health"

function Ensure-RuntimeDir {
  if (-not (Test-Path $RuntimeDir)) {
    New-Item -ItemType Directory -Path $RuntimeDir | Out-Null
  }
}

function Get-ServerProcess {
  if (-not (Test-Path $PidFile)) {
    return $null
  }

  $storedPid = Get-Content $PidFile -ErrorAction SilentlyContinue
  if (-not $storedPid) {
    Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
    return $null
  }

  $proc = Get-Process -Id ([int]$storedPid) -ErrorAction SilentlyContinue
  if (-not $proc) {
    Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
    return $null
  }

  return $proc
}

function Get-ListenerPid {
  $line = netstat -ano |
    Select-String -Pattern "LISTENING" |
    Where-Object { $_.Line -match ":$Port\s" } |
    Select-Object -First 1

  if (-not $line) {
    return $null
  }

  $parts = ($line.Line -split "\s+") | Where-Object { $_ -ne "" }
  if (-not $parts -or $parts.Count -lt 1) {
    return $null
  }

  return [int]$parts[-1]
}

function Test-Health {
  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri $HealthUrl -TimeoutSec 2
    return $response.StatusCode -eq 200
  } catch {
    return $false
  }
}

function Start-Server {
  Ensure-RuntimeDir

  $existing = Get-ServerProcess
  if ($existing) {
    Write-Host "Server already running (PID=$($existing.Id))."
    return
  }

  $listenerPid = Get-ListenerPid
  if ($listenerPid) {
    throw "Port $Port is already in use by PID $listenerPid. Stop it first or use another port."
  }

  if (Test-Path $OutLog) { Remove-Item $OutLog -Force -ErrorAction SilentlyContinue }
  if (Test-Path $ErrLog) { Remove-Item $ErrLog -Force -ErrorAction SilentlyContinue }

  $proc = Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c npm run start:dev" `
    -WorkingDirectory $ProjectRoot `
    -RedirectStandardOutput $OutLog `
    -RedirectStandardError $ErrLog `
    -PassThru

  Set-Content -Path $PidFile -Value "$($proc.Id)"

  for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1

    $runningProc = Get-Process -Id $proc.Id -ErrorAction SilentlyContinue
    if (-not $runningProc) {
      Write-Host "Server process exited early. Last log lines:"
      if (Test-Path $OutLog) { Get-Content $OutLog -Tail 20 }
      if (Test-Path $ErrLog) { Get-Content $ErrLog -Tail 20 }
      Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
      throw "Server failed to stay running."
    }

    if (Test-Health) {
      $listenerPid = Get-ListenerPid
      if ($listenerPid) {
        Set-Content -Path $PidFile -Value "$listenerPid"
        Write-Host "Server started. PID=$listenerPid"
      } else {
        Write-Host "Server started. PID=$($proc.Id)"
      }
      Write-Host "Health: $HealthUrl"
      Write-Host "Logs: $OutLog"
      return
    }
  }

  Write-Host "Server started (PID=$($proc.Id)) but healthcheck is not ready yet."
  Write-Host "Check logs: $OutLog"
}

function Stop-Server {
  $proc = Get-ServerProcess
  if (-not $proc) {
    $listenerPid = Get-ListenerPid
    if ($listenerPid) {
      Stop-Process -Id $listenerPid -Force -ErrorAction SilentlyContinue
      Write-Host "Stopped listener on port $Port (PID=$listenerPid)."
      return
    }

    Write-Host "Server is not running."
    return
  }

  Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
  Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
  Write-Host "Server stopped (PID=$($proc.Id))."
}

function Show-Status {
  $proc = Get-ServerProcess
  $listenerPid = Get-ListenerPid
  $healthy = Test-Health

  if ($proc) {
    Write-Host "Managed process: running (PID=$($proc.Id))"
  } else {
    Write-Host "Managed process: not running"
  }

  if ($listenerPid) {
    Write-Host "Port ${Port}: listening (PID=$listenerPid)"
  } else {
    Write-Host "Port ${Port}: not listening"
  }

  if ($healthy) {
    Write-Host "Health: OK ($HealthUrl)"
  } else {
    Write-Host "Health: not reachable ($HealthUrl)"
  }
}

switch ($Action) {
  "start" { Start-Server; break }
  "stop" { Stop-Server; break }
  "restart" { Stop-Server; Start-Server; break }
  "status" { Show-Status; break }
  "logs" {
    Ensure-RuntimeDir
    if (-not (Test-Path $OutLog)) {
      Write-Host "No log file found at $OutLog"
      break
    }
    Get-Content $OutLog -Wait
    break
  }
}
