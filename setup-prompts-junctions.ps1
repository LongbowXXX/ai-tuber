# GitHub Copilot Prompts ジャンクションセットアップスクリプト
# 
# 目的: ルートの .github/prompts をマスターとし、各パッケージからジャンクション（ディレクトリリンク）を作成
# ジャンクションは管理者権限不要で、どのパッケージからでも同じプロンプトにアクセス可能

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot

# マスタープロンプトディレクトリ
$masterPrompts = Join-Path $root ".github\prompts"

# 対象パッケージ
$packages = @(
    "packages\vtuber-behavior-engine",
    "packages\stage-director",
    "packages\vtube-stage"
)

Write-Host "=== GitHub Copilot Prompts ジャンクションセットアップ ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "マスター: $masterPrompts" -ForegroundColor Green

if (-not (Test-Path $masterPrompts)) {
    Write-Host "エラー: マスタープロンプトディレクトリが見つかりません" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "各パッケージにジャンクションを作成します..." -ForegroundColor Yellow
Write-Host ""

foreach ($pkg in $packages) {
    $pkgPath = Join-Path $root $pkg
    $githubDir = Join-Path $pkgPath ".github"
    $promptsJunction = Join-Path $githubDir "prompts"
    
    Write-Host "処理中: $pkg" -ForegroundColor White
    
    # .githubディレクトリが存在しない場合は作成
    if (-not (Test-Path $githubDir)) {
        New-Item -ItemType Directory -Path $githubDir -Force | Out-Null
        Write-Host "  → .githubディレクトリを作成" -ForegroundColor Gray
    }
    
    # 既存のpromptsディレクトリ/ジャンクションを確認
    if (Test-Path $promptsJunction) {
        $item = Get-Item $promptsJunction
        
        # ジャンクションの場合
        if ($item.Attributes -band [System.IO.FileAttributes]::ReparsePoint) {
            Write-Host "  → 既存のジャンクションを削除" -ForegroundColor Gray
            $item.Delete()
        }
        # 通常のディレクトリの場合
        else {
            Write-Host "  警告: 既存のpromptsディレクトリが見つかりました" -ForegroundColor Yellow
            Write-Host "         手動で削除するか、バックアップしてください: $promptsJunction" -ForegroundColor Yellow
            Write-Host "         スキップします" -ForegroundColor Yellow
            Write-Host ""
            continue
        }
    }
    
    # ジャンクション作成
    try {
        cmd /c mklink /J "$promptsJunction" "$masterPrompts" | Out-Null
        Write-Host "  ✓ ジャンクション作成成功" -ForegroundColor Green
    }
    catch {
        Write-Host "  ✗ ジャンクション作成失敗: $_" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "=== セットアップ完了 ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "今後の運用:" -ForegroundColor Yellow
Write-Host "  - プロンプトの追加/編集は $masterPrompts で行ってください" -ForegroundColor White
Write-Host "  - パッケージ固有のプロンプトは、ファイル名に接頭辞を付けてください" -ForegroundColor White
Write-Host "    例: py-adk-*, ts-react-*, fastapi-* など" -ForegroundColor White
Write-Host ""
