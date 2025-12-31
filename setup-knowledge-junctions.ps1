[CmdletBinding()]
param(
    [switch]$Force
)

$ErrorActionPreference = 'Stop'

function Write-Info([string]$Message) { Write-Host "[info] $Message" }
function Write-Warn([string]$Message) { Write-Warning $Message }

$repoRoot = $PSScriptRoot
$target = Join-Path $repoRoot 'knowledge'

if (-not (Test-Path -LiteralPath $target)) {
    throw "Target folder not found: $target"
}

$packagesRoot = Join-Path $repoRoot 'packages'
$projectNames = @(
    'stage-director',
    'vtube-stage',
    'vtuber-behavior-engine'
)

$projects = $projectNames | ForEach-Object { Join-Path $packagesRoot $_ }

Write-Info "Repo root: $repoRoot"
Write-Info "Target:    $target"

$hadErrors = $false

foreach ($projectPath in $projects) {
    if (-not (Test-Path -LiteralPath $projectPath)) {
        Write-Warn "Project not found, skip: $projectPath"
        continue
    }

    $linkPath = Join-Path $projectPath 'knowledge'

    if (Test-Path -LiteralPath $linkPath) {
        try {
            $item = Get-Item -LiteralPath $linkPath
            if ($item.LinkType -eq 'Junction') {
                $resolvedTargets = @($item.Target) | Where-Object { $_ }
                $matches = $resolvedTargets | Where-Object { $_ -ieq $target }
                if ($matches) {
                    Write-Info "OK (already junction): $linkPath -> $target"
                    continue
                }

                if (-not $Force) {
                    Write-Warn "Exists as junction but points elsewhere. Use -Force to recreate: $linkPath -> $($resolvedTargets -join ', ')"
                    $hadErrors = $true
                    continue
                }

                Write-Info "Recreating junction (Force): $linkPath"
                Remove-Item -LiteralPath $linkPath -Force
            }
            else {
                if (-not $Force) {
                    Write-Warn "Exists and is not a junction. Use -Force to remove & recreate: $linkPath"
                    $hadErrors = $true
                    continue
                }

                Write-Info "Removing existing path (Force): $linkPath"
                Remove-Item -LiteralPath $linkPath -Recurse -Force
            }
        }
        catch {
            Write-Warn "Failed to inspect/remove existing path: $linkPath. $($_.Exception.Message)"
            $hadErrors = $true
            continue
        }
    }

    Write-Info "Creating junction: $linkPath -> $target"
    $cmd = "mklink /J `"$linkPath`" `"$target`""
    $output = cmd /c $cmd 2>&1

    if ($LASTEXITCODE -ne 0) {
        Write-Warn "mklink failed for: $linkPath (exit=$LASTEXITCODE)"
        Write-Warn ($output | Out-String)
        $hadErrors = $true
        continue
    }

    $created = Get-Item -LiteralPath $linkPath
    if ($created.LinkType -ne 'Junction') {
        Write-Warn "Created path is not a junction (unexpected): $linkPath"
        $hadErrors = $true
        continue
    }

    Write-Info "Done: $linkPath -> $target"
}

if ($hadErrors) {
    throw "One or more junctions were not created/validated. Re-run with -Force if you intend to replace existing paths."
}

Write-Info "All set."
