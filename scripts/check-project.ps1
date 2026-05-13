Set-Location (Split-Path -Parent $PSScriptRoot)

Write-Host "`n=== Git Status ==="
git status --short

Write-Host "`n=== Core Files ==="
$core = @(
  ".\frontend\indexfft.html",
  ".\frontend\style.css",
  ".\frontend\script.js",
  ".\backend\app.py",
  ".\requirements.txt",
  ".\README.md"
)

foreach ($file in $core) {
  if (Test-Path $file) {
    Write-Host "[OK] $file"
  } else {
    Write-Host "[MISSING] $file"
  }
}

Write-Host "`n=== Local Server URLs ==="
Write-Host "Frontend: http://127.0.0.1:5500/frontend/indexfft.html"
Write-Host "Backend : http://127.0.0.1:5000"
