# Legt eine Desktop-Verknuepfung fuer HDR Merge an.
# Wird von "Verknuepfung auf Desktop.bat" aufgerufen.

$ordner = Split-Path -Parent $MyInvocation.MyCommand.Path
$ziel   = Join-Path ([Environment]::GetFolderPath("Desktop")) "HDR Merge.lnk"

try {
    $shell = New-Object -ComObject WScript.Shell
    $link  = $shell.CreateShortcut($ziel)
    $link.TargetPath       = Join-Path $ordner "HDR-Merge starten.bat"
    $link.WorkingDirectory = $ordner
    $link.IconLocation     = Join-Path $ordner "hdr_merge.ico"
    $link.WindowStyle      = 7   # minimiert starten, kein Fenster blitzt auf
    $link.Description      = "Belichtungsreihen zu Basisbildern zusammenrechnen"
    $link.Save()
    Write-Host ""
    Write-Host "Fertig. Auf dem Desktop liegt jetzt das Symbol HDR Merge." -ForegroundColor Green
    Write-Host "Du kannst einen Bilderordner auch direkt darauf ziehen."
} catch {
    Write-Host ""
    Write-Host "Die Verknuepfung konnte nicht angelegt werden:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
