# PowerShell script to run Next.js dev server and filter baseline-browser-mapping warnings
$process = Start-Process -FilePath "npm" -ArgumentList "run", "dev:original" -NoNewWindow -PassThru -RedirectStandardOutput "temp_output.txt" -RedirectStandardError "temp_error.txt"

# Monitor and filter output
Get-Content "temp_output.txt" -Wait -ErrorAction SilentlyContinue | ForEach-Object {
    if ($_ -notmatch "baseline-browser-mapping") {
        Write-Host $_
    }
}

# Cleanup on exit
Register-ObjectEvent -InputObject $process -EventName Exited -Action {
    Remove-Item "temp_output.txt" -ErrorAction SilentlyContinue
    Remove-Item "temp_error.txt" -ErrorAction SilentlyContinue
}

