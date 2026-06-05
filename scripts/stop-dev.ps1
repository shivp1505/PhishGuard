$ErrorActionPreference = "Stop"

function Stop-Port {
  param([int]$Port)

  $lines = netstat -ano | Select-String ":$Port" | Select-String "LISTENING"
  foreach ($line in $lines) {
    $pidValue = ($line.ToString().Trim() -split "\s+")[-1]
    if ($pidValue -match "^\d+$") {
      Stop-Process -Id ([int]$pidValue) -Force -ErrorAction SilentlyContinue
      Write-Host "Stopped process $pidValue on port $Port"
    }
  }
}

Stop-Port -Port 3000
Stop-Port -Port 5000
