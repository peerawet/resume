$ErrorActionPreference = "Stop"

$Bucket = "resume.forifi.xyz"
$DistributionId = "E3L4ENCY9HIV7R"
$Root = Split-Path -Parent $PSScriptRoot
$Dist = Join-Path $Root "dist"

Set-Location $Root

Write-Host "==> Building..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

if (-not (Test-Path (Join-Path $Dist "index.html"))) {
  Write-Error "dist/index.html not found after build"
  exit 1
}

Write-Host "==> Syncing assets to s3://$Bucket (keeping AWSLogs/)..." -ForegroundColor Cyan
aws s3 sync $Dist "s3://$Bucket/" `
  --exclude "AWSLogs/*" `
  --exclude "index.html" `
  --delete `
  --cache-control "public,max-age=31536000,immutable"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "==> Uploading index.html (no-cache)..." -ForegroundColor Cyan
aws s3 cp (Join-Path $Dist "index.html") "s3://$Bucket/index.html" `
  --cache-control "no-cache" `
  --content-type "text/html; charset=utf-8"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "==> Invalidating CloudFront ($DistributionId)..." -ForegroundColor Cyan
aws cloudfront create-invalidation `
  --distribution-id $DistributionId `
  --paths "/*"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "==> Deploy done: https://d1qwo10f5j4f1m.cloudfront.net/" -ForegroundColor Green
