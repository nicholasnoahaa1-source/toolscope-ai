<#
.SYNOPSIS
    Prepara o ambiente local do JARVIS Universal (frontend + backend).
    Não instala nada globalmente e nunca pede privilégios de administrador.
#>

. "$PSScriptRoot/_common.ps1"

Write-Host "== JARVIS Universal: setup ==" -ForegroundColor Cyan

Assert-Command -Name 'node' -Hint 'Instale uma versão LTS ativa do Node.js: https://nodejs.org'
Assert-Command -Name 'npm' -Hint 'O npm normalmente acompanha o Node.js.'
Assert-Command -Name 'python' -Hint 'Instale o Python 3.12 ou superior: https://www.python.org/downloads/'

$pythonVersionOutput = & python --version 2>&1
if ($pythonVersionOutput -notmatch '(\d+)\.(\d+)\.(\d+)') {
    throw "Não foi possível interpretar a versão do Python retornada: '$pythonVersionOutput'"
}
$pyMajor = [int]$Matches[1]
$pyMinor = [int]$Matches[2]
if ($pyMajor -lt 3 -or ($pyMajor -eq 3 -and $pyMinor -lt 12)) {
    Write-Warning "Python $($Matches[0]) encontrado; recomendado 3.12 ou superior. Prosseguindo mesmo assim."
}

Write-Host "-- Backend (apps/api): criando ambiente virtual --"
if (-not (Test-Path $VenvDir)) {
    & python -m venv $VenvDir
    if ($LASTEXITCODE -ne 0) { throw "Falha ao criar o ambiente virtual em '$VenvDir'." }
}

$venvPython = Get-VenvPython
& $venvPython -m pip install --upgrade pip
if ($LASTEXITCODE -ne 0) { throw "Falha ao atualizar o pip dentro do ambiente virtual." }

& $venvPython -m pip install -e "${ApiDir}[dev]"
if ($LASTEXITCODE -ne 0) { throw "Falha ao instalar as dependências do backend." }

Write-Host "-- Frontend (apps/web): instalando dependências --"
Push-Location $WebDir
try {
    & npm install
    if ($LASTEXITCODE -ne 0) { throw "Falha ao instalar as dependências do frontend (npm install)." }
} finally {
    Pop-Location
}

if (-not (Test-Path (Join-Path $ApiDir '.env'))) {
    Copy-Item (Join-Path $ApiDir '.env.example') (Join-Path $ApiDir '.env')
    Write-Host "Criado apps/api/.env a partir de .env.example (valores fictícios)."
}

Write-Host "Setup concluído. Use scripts\dev.ps1 para iniciar o projeto." -ForegroundColor Green
