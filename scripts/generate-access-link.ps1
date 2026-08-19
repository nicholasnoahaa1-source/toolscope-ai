<#
.SYNOPSIS
    Gera um novo link de acesso secreto para o JARVIS Universal.

.DESCRIPTION
    Cria um token aleatório criptograficamente seguro e calcula seu hash
    SHA-256. O token em texto puro é mostrado só nesta execução — nunca é
    escrito em nenhum arquivo do repositório. Só o hash vai para
    apps/api/.env (variável JARVIS_ACCESS_TOKEN_HASH), que já está no
    .gitignore.
#>

. "$PSScriptRoot/_common.ps1"

function New-AccessToken {
    $bytes = [byte[]]::new(32)
    [System.Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
    $token = [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_')
    return $token
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

Write-Host "== JARVIS Universal: gerar link de acesso ==" -ForegroundColor Cyan

$token = New-AccessToken
$hash = Get-Sha256Hex -Text $token

Write-Host ""
Write-Host "Token de acesso (mostrado só agora — salve em um gerenciador de senhas):" -ForegroundColor Yellow
Write-Host "  $token" -ForegroundColor White
Write-Host ""
Write-Host "Link de entrada (troque SEU-DOMINIO pelo domínio real em produção;" -ForegroundColor Yellow
Write-Host "em desenvolvimento local use http://localhost:5173):"
Write-Host "  https://SEU-DOMINIO/entrar/$token" -ForegroundColor White
Write-Host ""
Write-Host "Configure em apps/api/.env (NUNCA no Git):" -ForegroundColor Yellow
Write-Host "  JARVIS_ACCESS_TOKEN_HASH=$hash" -ForegroundColor White
Write-Host ""
Write-Host "Reinicie a API (scripts\dev.ps1) para o novo hash entrar em vigor." -ForegroundColor Green
Write-Host "Se este link vazar, qualquer pessoa que o tiver poderá entrar — rotacione" -ForegroundColor DarkYellow
Write-Host "com scripts\rotate-access-link.ps1 assim que suspeitar de vazamento." -ForegroundColor DarkYellow
