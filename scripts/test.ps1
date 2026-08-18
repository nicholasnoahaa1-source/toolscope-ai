<#
.SYNOPSIS
    Executa lint e testes do backend e do frontend do JARVIS Universal.
#>

. "$PSScriptRoot/_common.ps1"

Write-Host "== JARVIS Universal: test ==" -ForegroundColor Cyan

$venvPython = Get-VenvPython

Write-Host "-- Backend: ruff + pytest --"
& $venvPython -m ruff check $ApiDir
if ($LASTEXITCODE -ne 0) { throw "Lint do backend (ruff) falhou." }

Push-Location $ApiDir
try {
    & $venvPython -m pytest -q
    if ($LASTEXITCODE -ne 0) { throw "Testes do backend (pytest) falharam." }
} finally {
    Pop-Location
}

Write-Host "-- Frontend: eslint + vitest --"
Push-Location $WebDir
try {
    & npm run lint
    if ($LASTEXITCODE -ne 0) { throw "Lint do frontend (eslint) falhou." }

    & npm run test
    if ($LASTEXITCODE -ne 0) { throw "Testes do frontend (vitest) falharam." }
} finally {
    Pop-Location
}

Write-Host "Todos os lints e testes passaram." -ForegroundColor Green
