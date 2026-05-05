#requires -Version 5.1
<#
.SYNOPSIS
  Weekly NHIA tariff code accuracy audit (read-only).

.DESCRIPTION
  Pulls the last 7 days of NHIA billing codes from the prod Postgres via
  Railway CLI, joins SOAP/order context, hands the bundle to `claude -p`
  along with the canonical catalog, and writes a markdown report to
  audit-reports\nhia-YYYY-MM-DD.md.

  Designed to be run by Windows Task Scheduler. Everything stays on this
  machine - no PHI is sent anywhere except to the Claude CLI you already
  use locally. Credentials never leave the script.

.NOTES
  Prereqs (one-time):
    - `railway login` and `railway link` must be set up for the Meditir project
    - `claude`, `node`, `railway` must be on PATH
    - `npm install` has been run inside meditir-api/ (for @prisma/client)
#>

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$root = 'C:\Users\Dubem\meditir'
$apiDir = Join-Path $root 'meditir-api'
$reportDir = Join-Path $root 'audit-reports'
New-Item -ItemType Directory -Path $reportDir -Force | Out-Null

$today = Get-Date -Format 'yyyy-MM-dd'
$reportPath = Join-Path $reportDir "nhia-$today.md"
$logPath    = Join-Path $reportDir "nhia-$today.log"

function Log {
    param([string]$msg)
    $stamp = Get-Date -Format 'HH:mm:ss'
    "[$stamp] $msg" | Add-Content -Path $logPath -Encoding utf8
}

Log "Starting NHIA audit run."

# 1. Pull DATABASE_PUBLIC_URL from Railway (Postgres service)
# Railway link is scoped to meditir-api, so we run the CLI from there.
Set-Location $apiDir
$rawVars = & railway variables --service Postgres --kv 2>&1
if ($LASTEXITCODE -ne 0) {
    Log "FAIL: railway CLI returned exit $LASTEXITCODE. Output: $rawVars"
    "Audit failed: Railway CLI not authenticated or project not linked. See log: $logPath" | Set-Content $reportPath -Encoding utf8
    exit 1
}

$urlLine = $rawVars | Select-String -Pattern '^DATABASE_PUBLIC_URL=' | Select-Object -First 1
if (-not $urlLine) {
    Log "FAIL: DATABASE_PUBLIC_URL not found in railway variables output."
    "Audit failed: DATABASE_PUBLIC_URL missing. See log: $logPath" | Set-Content $reportPath -Encoding utf8
    exit 1
}
$dbUrl = ($urlLine.Line -split '=', 2)[1].Trim('"').Trim("'")
Log "Resolved DATABASE_PUBLIC_URL (length=$($dbUrl.Length))."

# 2. Run the fetch script - produces SQL results + catalog as one markdown bundle
$env:AUDIT_DATABASE_URL = $dbUrl
Set-Location $apiDir
$bundle = & node 'scripts\audit-nhia-fetch.mjs' 2>&1
$fetchExit = $LASTEXITCODE
Remove-Item Env:AUDIT_DATABASE_URL -ErrorAction SilentlyContinue

if ($fetchExit -ne 0) {
    Log "FAIL: fetch script exit $fetchExit. Output: $bundle"
    "Audit failed: data fetch error. See log: $logPath" | Set-Content $reportPath -Encoding utf8
    exit 1
}
Log "Fetched data bundle (length=$($bundle.Length) chars)."

# 3. Combine prompt + data, hand off to claude -p
Set-Location $root
$prompt = Get-Content (Join-Path $root 'scripts\nhia-audit-prompt.md') -Raw -Encoding utf8
$fullInput = "$prompt`n`n$bundle"

# Stage to a temp file so we can pipe it cleanly without quoting a huge string
$tempInput = New-TemporaryFile
try {
    Set-Content -Path $tempInput.FullName -Value $fullInput -Encoding utf8

    Log "Invoking claude -p ..."
    $report = Get-Content $tempInput.FullName -Raw -Encoding utf8 | & claude -p 2>&1
    $claudeExit = $LASTEXITCODE

    if ($claudeExit -ne 0) {
        Log "FAIL: claude exit $claudeExit. Output (first 500 chars): $($report.ToString().Substring(0, [Math]::Min(500, $report.ToString().Length)))"
        "Audit failed: claude CLI returned exit $claudeExit. See log: $logPath" | Set-Content $reportPath -Encoding utf8
        exit 1
    }

    "# NHIA Tariff Audit - $today`n" | Set-Content $reportPath -Encoding utf8
    Add-Content -Path $reportPath -Value $report -Encoding utf8
    Log "Report written: $reportPath"
    Write-Host "Report: $reportPath"
}
finally {
    Remove-Item $tempInput.FullName -ErrorAction SilentlyContinue
}
