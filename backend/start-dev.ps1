$env:PATH = "$PSScriptRoot\node;$env:PATH"

Write-Host "Using Node:"
node -v

npm install --legacy-peer-deps
npm run dev