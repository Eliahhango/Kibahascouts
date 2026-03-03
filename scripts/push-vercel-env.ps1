param(
  [string]$EnvFile = ".env.local",
  [string[]]$Targets = @("production", "preview", "development")
)

$ErrorActionPreference = "Stop"

if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
  throw "Vercel CLI is not installed. Install with: npm i -g vercel"
}

if (-not (Test-Path $EnvFile)) {
  throw "Env file not found: $EnvFile"
}

function Parse-EnvFile {
  param([string]$Path)

  $map = @{}
  Get-Content $Path | ForEach-Object {
    $line = $_.Trim()
    if ([string]::IsNullOrWhiteSpace($line)) { return }
    if ($line.StartsWith("#")) { return }

    $sep = $line.IndexOf("=")
    if ($sep -lt 1) { return }

    $key = $line.Substring(0, $sep).Trim()
    $value = $line.Substring($sep + 1)

    if ($value.Length -ge 2) {
      $first = $value.Substring(0, 1)
      $last = $value.Substring($value.Length - 1, 1)
      if (($first -eq '"' -and $last -eq '"') -or ($first -eq "'" -and $last -eq "'")) {
        $value = $value.Substring(1, $value.Length - 2)
      }
    }

    $map[$key] = $value
  }

  return $map
}

$vars = Parse-EnvFile -Path $EnvFile

if ($vars.Count -eq 0) {
  throw "No env vars found in $EnvFile"
}

Write-Host "Using env file: $EnvFile"
Write-Host "Targets: $($Targets -join ', ')"
Write-Host "Tip: run 'vercel link' first if this folder is not linked to your Vercel project."

foreach ($target in $Targets) {
  Write-Host ""
  Write-Host "Uploading vars to '$target'..."

  foreach ($name in ($vars.Keys | Sort-Object)) {
    $value = $vars[$name]
    if ([string]::IsNullOrWhiteSpace($value)) {
      continue
    }

    # Send value through stdin to avoid shell escaping issues.
    $value | vercel env add $name $target --force | Out-Null
    Write-Host "  Added/updated: $name"
  }
}

Write-Host ""
Write-Host "Done. Redeploy your project in Vercel so new variables take effect."
