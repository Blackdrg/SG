$secretDir = "C:\Users\mehta\Desktop\SpiceGarden\secrets"
if (!(Test-Path $secretDir)) { New-Item -ItemType Directory -Path $secretDir }

function New-Secret() {
    $bytes = New-Object byte[] 32
    ([System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes))
    return [Convert]::ToBase64String($bytes)
}

@(
    @{ Name = "jwt_secret.txt"; Value = (New-Secret) }
    @{ Name = "stripe_secret.txt"; Value = ""; Comment = "CRITICAL: Add sk_live_ or sk_test_ key" }
    @{ Name = "razorpay_key_id.txt"; Value = "" }
    @{ Name = "razorpay_key_secret.txt"; Value = "" }
    @{ Name = "fcm_server_key.txt"; Value = "" }
    @{ Name = "apns_private_key.txt"; Value = "" }
    @{ Name = "apns_key_id.txt"; Value = "" }
    @{ Name = "apns_team_id.txt"; Value = "" }
    @{ Name = "sendgrid_api_key.txt"; Value = "" }
    @{ Name = "google_maps_api_key.txt"; Value = "" }
    @{ Name = "twilio_account_sid.txt"; Value = "" }
    @{ Name = "twilio_auth_token.txt"; Value = "" }
    @{ Name = "db_password.txt"; Value = (New-Secret) }
    @{ Name = "grafana_admin_password.txt"; Value = (New-Secret) }
    @{ Name = "opensearch_admin_password.txt"; Value = (New-Secret) }
    @{ Name = "sentry_secret_key.txt"; Value = (New-Secret) }
    @{ Name = "sentry_system_secret.txt"; Value = (New-Secret) }
    @{ Name = "sentry_db_password.txt"; Value = (New-Secret) }
) | ForEach-Object {
    $_.Value | Out-File -FilePath (Join-Path $secretDir $_.Name) -NoNewline
    $comment = $_.Comment
    if ($comment) { Write-Host "$($_.Name): $comment" }
    else { Write-Host "Created $($_.Name)" }
}
Write-Host "Secrets generated successfully!"