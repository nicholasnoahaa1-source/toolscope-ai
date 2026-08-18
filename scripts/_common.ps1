# Funções e caminhos compartilhados pelos scripts do JARVIS Universal.
# Nunca solicita elevação; falha com mensagem clara quando algo estiver faltando.

$ErrorActionPreference = 'Stop'

$Script:RepoRoot = Split-Path -Parent $PSScriptRoot
$Script:WebDir = Join-Path $RepoRoot 'apps/web'
$Script:ApiDir = Join-Path $RepoRoot 'apps/api'
$Script:VenvDir = Join-Path $ApiDir '.venv'

function Assert-Command {
    param(
        [Parameter(Mandatory)][string]$Name,
        [Parameter(Mandatory)][string]$Hint
    )
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "'$Name' não foi encontrado no PATH. $Hint"
    }
}

function Get-VenvPython {
    if ($IsWindows -or -not (Test-Path variable:IsWindows)) {
        $candidate = Join-Path $VenvDir 'Scripts/python.exe'
    } else {
        $candidate = Join-Path $VenvDir 'bin/python'
    }
    if (-not (Test-Path $candidate)) {
        throw "Ambiente virtual não encontrado em '$VenvDir'. Rode scripts\setup.ps1 primeiro."
    }
    return $candidate
}
