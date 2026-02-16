param(
  [ValidateSet("start", "stop", "restart", "status", "logs")]
  [string]$Action = "status",
  [int]$Port = 3000
)

$ErrorActionPreference = "Stop"

$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$RuntimeDir = Join-Path $ProjectRoot ".runtime"
$BackendPidFile = Join-Path $RuntimeDir "dev-server.pid"
$BackendOutLog = Join-Path $RuntimeDir "dev-server.out.log"
$BackendErrLog = Join-Path $RuntimeDir "dev-server.err.log"
$BackendHealthUrl = "http://localhost:$Port/api/health"
$FrontendUrl = "http://localhost:$Port/app/"

function Ensure-RuntimeDir {
  if (-not (Test-Path $RuntimeDir)) {
    New-Item -ItemType Directory -Path $RuntimeDir | Out-Null
  }
}

function Get-ManagedProcess([string]$PidFilePath) {
  if (-not (Test-Path $PidFilePath)) {
    return $null
  }

  $storedPid = Get-Content $PidFilePath -ErrorAction SilentlyContinue
  if (-not $storedPid) {
    Remove-Item $PidFilePath -Force -ErrorAction SilentlyContinue
    return $null
  }

  $proc = Get-Process -Id ([int]$storedPid) -ErrorAction SilentlyContinue
  if (-not $proc) {
    Remove-Item $PidFilePath -Force -ErrorAction SilentlyContinue
    return $null
  }

  return $proc
}

function Get-ListenerPid([int]$LocalPort) {
  $line = netstat -ano |
    Select-String -Pattern "LISTENING" |
    Where-Object { $_.Line -match ":$LocalPort\s" } |
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

function Test-Url([string]$Url) {
  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 2
    return $response.StatusCode -eq 200
  } catch {
    return $false
  }
}

function Stop-ByPidFileOrPort([string]$PidFilePath, [int]$LocalPort, [string]$Name) {
  $proc = Get-ManagedProcess $PidFilePath
  if ($proc) {
    Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    Remove-Item $PidFilePath -Force -ErrorAction SilentlyContinue
    Write-Host "$Name stopped (PID=$($proc.Id))."
    return
  }

  $listenerPid = Get-ListenerPid $LocalPort
  if ($listenerPid) {
    Stop-Process -Id $listenerPid -Force -ErrorAction SilentlyContinue
    Write-Host "$Name listener stopped on port $LocalPort (PID=$listenerPid)."
    return
  }
}

function Start-Backend {
  $existing = Get-ListenerPid $Port
  if ($existing) {
    Set-Content -Path $BackendPidFile -Value "$existing"
    Write-Host "Backend already running (PID=$existing)."
    return
  }
  if (Test-Path $BackendOutLog) { Remove-Item $BackendOutLog -Force -ErrorAction SilentlyContinue }
  if (Test-Path $BackendErrLog) { Remove-Item $BackendErrLog -Force -ErrorAction SilentlyContinue }
  $proc = Start-Process -FilePath "cmd.exe" `
    -ArgumentList "/c npm run start:dev" `
    -WorkingDirectory $ProjectRoot `
    -RedirectStandardOutput $BackendOutLog `
    -RedirectStandardError $BackendErrLog `
    -PassThru
  Set-Content -Path $BackendPidFile -Value "$($proc.Id)"
  for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    $runningProc = Get-Process -Id $proc.Id -ErrorAction SilentlyContinue
    if (-not $runningProc) {
      Write-Host "Backend process exited early. Last log lines:"
      if (Test-Path $BackendOutLog) { Get-Content $BackendOutLog -Tail 20 }
      if (Test-Path $BackendErrLog) { Get-Content $BackendErrLog -Tail 20 }
      Remove-Item $BackendPidFile -Force -ErrorAction SilentlyContinue
      throw "Backend failed to stay running."
    }
    if (Test-Url $BackendHealthUrl) {
      $listenerPid = Get-ListenerPid $Port
      if ($listenerPid) {
        Set-Content -Path $BackendPidFile -Value "$listenerPid"
        Write-Host "Backend started. PID=$listenerPid"
      } else {
        Write-Host "Backend started. PID=$($proc.Id)"
      }
      Write-Host "Backend health: $BackendHealthUrl"
      Write-Host "Backend logs: $BackendOutLog"
      return
    }
  }
  Write-Host "Backend started (PID=$($proc.Id)) but healthcheck is not ready yet."
}

function Start-Server {
  Ensure-RuntimeDir
  Start-Backend
  Write-Host "Frontend URL (served by backend): $FrontendUrl"
}

function Stop-Server {
  Stop-ByPidFileOrPort $BackendPidFile $Port "Backend"
}

function Show-Status {
  $backendProc = Get-ManagedProcess $BackendPidFile
  $backendListenerPid = Get-ListenerPid $Port
  $backendHealthy = Test-Url $BackendHealthUrl
  $frontendHealthy = Test-Url $FrontendUrl

  if ($backendProc) {
    Write-Host "Backend managed process: running (PID=$($backendProc.Id))"
  } else {
    Write-Host "Backend managed process: not running"
  }

  if ($backendListenerPid) {
    Write-Host "Backend port ${Port}: listening (PID=$backendListenerPid)"
  } else {
    Write-Host "Backend port ${Port}: not listening"
  }

  if ($backendHealthy) {
    Write-Host "Backend health: OK ($BackendHealthUrl)"
  } else {
    Write-Host "Backend health: not reachable ($BackendHealthUrl)"
  }

  if ($frontendHealthy) {
    Write-Host "Frontend route: OK ($FrontendUrl)"
  } else {
    Write-Host "Frontend route: not reachable ($FrontendUrl)"
  }
}

switch ($Action) {
  "start" { Start-Server; break }
  "stop" { Stop-Server; break }
  "restart" { Stop-Server; Start-Server; break }
  "status" { Show-Status; break }
  "logs" {
    Ensure-RuntimeDir
    if (-not (Test-Path $BackendOutLog)) {
      Write-Host "No backend log file found at $BackendOutLog"
      break
    }
    Write-Host "Following backend logs: $BackendOutLog"
    Get-Content $BackendOutLog -Wait
    break
  }
}
