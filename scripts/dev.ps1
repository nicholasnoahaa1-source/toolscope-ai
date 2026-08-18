<#
.SYNOPSIS
    Inicia a API (FastAPI/uvicorn) e o frontend (Vite) em desenvolvimento.
    Cada serviço roda em sua própria janela; feche as janelas para parar.
#>

. "$PSScriptRoot/_common.ps1"

Write-Host "== JARVIS Universal: dev ==" -ForegroundColor Cyan

$venvPython = Get-VenvPython
if (-not (Test-Path (Join-Path $WebDir 'node_modules'))) {
    throw "apps/web/node_modules não encontrado. Rode scripts\setup.ps1 primeiro."
}

Write-Host "Iniciando API em http://localhost:8000 (janela separada)..."
Start-Process -FilePath $venvPython -ArgumentList '-m', 'uvicorn', 'app.main:app', '--reload', '--port', '8000' -WorkingDirectory $ApiDir

Write-Host "Iniciando frontend em http://localhost:5173 (janela separada)..."
Start-Process -FilePath 'npm' -ArgumentList 'run', 'dev' -WorkingDirectory $WebDir

Write-Host "Serviços iniciados em janelas separadas. Feche-as para encerrar." -ForegroundColor Green
