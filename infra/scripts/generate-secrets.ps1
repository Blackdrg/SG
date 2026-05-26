$secretDir = "C:\Users\mehta\Desktop\SpiceGarden\secrets"
if (!(Test-Path $secretDir)) { New-Item -ItemType Directory -Path $secretDir }

function New-Secret() {
    $bytes = New-Object byte[] 32
    ([System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes))
    return [Convert]::ToBase64String($bytes)
}

@(
    @{ Name = "db_password.txt"; Value = (New-Secret) }
    @{ Name = "jwt_secret.txt"; Value = (New-Secret) }
    @{ Name = "grafana_admin_password.txt"; Value = (New-Secret) }
    @{ Name = "opensearch_admin_password.txt"; Value = (New-Secret) }
    @{ Name = "sentry_secret_key.txt"; Value = (New-Secret) }
    @{ Name = "sentry_system_secret.txt"; Value = (New-Secret) }
    @{ Name = "sentry_db_password.txt"; Value = (New-Secret) }
    @{ Name = "stripe_secret.txt"; Value = "sk_test_placeholder" }
) | ForEach-Object {
    $_.Value | Out-File -FilePath (Join-Path $secretDir $_.Name) -NoNewline
    Write-Host "Created $($_.Name)"
}
Write-Host "Secrets generated successfully!"