$ErrorActionPreference = 'SilentlyContinue'
$ids = @('0ed090cc-8549-4efa-8daa-ba017b94b90b', '512dc7fa-ed03-4762-a227-444f99723fe6', '7a76503c-b5e8-42fc-911e-df8a4898d95e', '9ded9a3b-3ee6-4200-b299-7b07485342ff', 'babc0201-f638-4df0-a60d-10d6b4371c34')

foreach ($id in $ids) {
    Write-Host "## Conversation: $id"
    $path = "C:\Users\johnr\.gemini\antigravity-ide\brain\$id\.system_generated\logs\transcript.jsonl"
    if (Test-Path $path) {
        $lines = Get-Content $path -TotalCount 50
        foreach ($line in $lines) {
            if ($line -match '"type":"USER_INPUT"') {
                Write-Host "Match found in $id"
                Write-Host $line
                break
            }
        }
    } else {
        Write-Host "Transcript not found for $id"
    }
}
