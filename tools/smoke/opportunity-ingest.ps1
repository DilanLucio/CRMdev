# Smoke test: POST /api/opportunities
# Usage: .\tools\smoke\opportunity-ingest.ps1 [-BaseUrl <url>] [-ApiKey <key>]
param(
    [string]$BaseUrl = "http://localhost:5000",
    [string]$ApiKey  = "dev-replace-before-prod"
)

$payload = @{
    companyName            = "Smoke Test Corp"
    contactName            = "Test User"
    contactEmail           = "smoke@test.dev"
    developmentPossibility = "## ERP Integration`nNeeds full ERP with inventory module."
    externalLeadId         = "smoke-$(Get-Date -Format 'yyyyMMddHHmmss')"
} | ConvertTo-Json

Write-Host "Posting to $BaseUrl/api/opportunities ..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod `
        -Uri "$BaseUrl/api/opportunities" `
        -Method Post `
        -Headers @{ "X-Api-Key" = $ApiKey; "Content-Type" = "application/json" } `
        -Body $payload

    if ($response.status -eq 0 -and $response.id) {
        Write-Host "PASS  status=AiGenerated  id=$($response.id)" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "FAIL  unexpected response: $($response | ConvertTo-Json)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "FAIL  $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
