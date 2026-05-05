# One-time setup: registers a weekly Windows Task Scheduler entry that runs
# the NHIA audit every Monday at 4:00am local time (= 9am Lagos during EDT,
# 10am Lagos during EST). Re-run this script to update the task definition.
#
# Run from an elevated PowerShell window:
#   powershell -ExecutionPolicy Bypass -File C:\Users\Dubem\meditir\scripts\install-nhia-task.ps1

$taskName = 'Meditir-NHIA-Weekly-Audit'
$scriptPath = 'C:\Users\Dubem\meditir\scripts\audit-nhia-weekly.ps1'

$action = New-ScheduledTaskAction `
    -Execute 'powershell.exe' `
    -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`""

$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At 4am

$settings = New-ScheduledTaskSettingsSet `
    -WakeToRun `
    -StartWhenAvailable `
    -AllowStartIfOnBatteries `
    -DontStopIfGoingOnBatteries `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 15)

$principal = New-ScheduledTaskPrincipal `
    -UserId $env:USERNAME `
    -LogonType Interactive `
    -RunLevel Limited

Register-ScheduledTask `
    -TaskName $taskName `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Principal $principal `
    -Description 'Weekly read-only NHIA tariff code accuracy audit. Pulls last 7 days from prod via Railway CLI, runs claude -p, writes report to audit-reports\.' `
    -Force | Out-Null

Write-Host "Registered task '$taskName'. Next run:"
(Get-ScheduledTask -TaskName $taskName | Get-ScheduledTaskInfo).NextRunTime
