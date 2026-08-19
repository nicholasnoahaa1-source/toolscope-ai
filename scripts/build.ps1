<#
.SYNOPSIS
    Gera o build de produção do frontend do JARVIS Universal.
#>

. "$PSScriptRoot/_common.ps1"

Write-Host "== JARVIS Universal: build ==" -ForegroundColor Cyan

if (-not (Test-Path (Join-Path $WebDir 'node_modules'))) {
    throw "apps/web/node_modules não encontrado. Rode scripts\setup.ps1 primeiro."
}

Push-Location $WebDir
try {
    & npm run build
    if ($LASTEXITCODE -ne 0) { throw "Build do frontend falhou." }
} finally {
    Pop-Location
}

Write-Host "Build concluído em apps/web/dist." -ForegroundColor Green
