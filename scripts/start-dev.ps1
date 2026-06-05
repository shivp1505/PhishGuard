param(
  [switch]$Clean,
  [switch]$Restart
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$frontend = Join-Path $root "frontend"
$backend = Join-Path $root "backend"

# Some elevated Windows shells expose both Path and PATH, which can break Start-Process.
$pathValue = $env:Path
[Environment]::SetEnvironmentVariable("PATH", $null, "Process")
$env:Path = $pathValue

function Stop-Port {
  param([int]$Port)

  $lines = netstat -ano | Select-String ":$Port" | Select-String "LISTENING"
  foreach ($line in $lines) {
    $pidValue = ($line.ToString().Trim() -split "\s+")[-1]
    if ($pidValue -match "^\d+$") {
      Stop-Process -Id ([int]$pidValue) -Force -ErrorAction SilentlyContinue
    }
  }
}

if ($Restart) {
  Stop-Port -Port 3000
  Stop-Port -Port 5000
}

if ($Clean) {
  Remove-Item -LiteralPath (Join-Path $frontend ".next") -Recurse -Force -ErrorAction SilentlyContinue
}

Start-Process -FilePath "powershell.exe" -ArgumentList @(
  "-NoExit",
  "-NoProfile",
  "-ExecutionPolicy",
  "Bypass",
  "-Command",
  "cd '$backend'; npm.cmd run dev"
) -WindowStyle Normal

Start-Process -FilePath "powershell.exe" -ArgumentList @(
  "-NoExit",
  "-NoProfile",
  "-ExecutionPolicy",
  "Bypass",
  "-Command",
  "`$env:INTERNAL_API_URL='http://localhost:5000'; Remove-Item Env:NEXT_PUBLIC_API_URL -ErrorAction SilentlyContinue; cd '$frontend'; npm.cmd run dev -- -H 0.0.0.0"
) -WindowStyle Normal

Write-Host "Started PhishGuard dev servers in separate PowerShell windows."
Write-Host "Frontend: http://localhost:3000"
Write-Host "Backend:  http://localhost:5000"
