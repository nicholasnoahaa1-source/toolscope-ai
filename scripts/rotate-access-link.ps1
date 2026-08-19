<#
.SYNOPSIS
    Rotaciona o link de acesso do JARVIS Universal E derruba todas as
    sessões já abertas.

.DESCRIPTION
    Gera um novo token de acesso (como generate-access-link.ps1) e também
    um novo segredo de sessão (JARVIS_SESSION_SECRET). Trocar o segredo de
    sessão invalida imediatamente todo cookie de sessão já emitido — é o
    jeito de encerrar o acesso de quem tinha o link antigo, mesmo que já
    tivesse entrado.
#>

. "$PSScriptRoot/_common.ps1"

function New-RandomToken {
    param([int]$Bytes = 32)
    $buffer = [byte[]]::new($Bytes)
    [System.Security.Cryptography.RandomNumberGenerator]::Fill($buffer)
    return [Convert]::ToBase64String($buffer).TrimEnd('=').Replace('+', '-').Replace('/', '_')
}

function Get-Sha256Hex {
    param([Parameter(Mandatory)][string]$Text)
    $sha256 = [System.Security.Cryptography.SHA256]::Create()
    try {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($Text)
        $hashBytes = $sha256.ComputeHash($bytes)
        return -join ($hashBytes | ForEach-Object { $_.ToString('x2') })
    } finally {
        $sha256.Dispose()
    }
}

Write-Host "== JARVIS Universal: rotacionar link de acesso ==" -ForegroundColor Cyan
Write-Host "Isto gera um NOVO link e encerra TODAS as sessões abertas (celular e PC" -ForegroundColor DarkYellow
Write-Host "vão precisar entrar de novo com o novo link)." -ForegroundColor DarkYellow
Write-Host ""

$token = New-RandomToken
$tokenHash = Get-Sha256Hex -Text $token
$sessionSecret = New-RandomToken -Bytes 48

Write-Host "Novo token de acesso (salve em um gerenciador de senhas):" -ForegroundColor Yellow
Write-Host "  $token" -ForegroundColor White
Write-Host ""
Write-Host "Novo link de entrada:" -ForegroundColor Yellow
Write-Host "  https://SEU-DOMINIO/entrar/$token" -ForegroundColor White
Write-Host ""
Write-Host "Atualize as DUAS variáveis em apps/api/.env (NUNCA no Git):" -ForegroundColor Yellow
Write-Host "  JARVIS_ACCESS_TOKEN_HASH=$tokenHash" -ForegroundColor White
Write-Host "  JARVIS_SESSION_SECRET=$sessionSecret" -ForegroundColor White
Write-Host ""
Write-Host "Reinicie a API (scripts\dev.ps1) para aplicar. Todas as sessões antigas" -ForegroundColor Green
Write-Host "param de funcionar assim que o processo reiniciar com o novo segredo." -ForegroundColor Green
