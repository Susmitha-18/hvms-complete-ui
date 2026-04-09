$payload = @{ 
  date = '2025-10-30'
  month = '2025-10'
  records = @(
    @{ driverId = '68f4b2b5ed2a49d87498ade4'; status = 'P' }
  )
}
$body = $payload | ConvertTo-Json -Depth 5
try {
  $res = Invoke-RestMethod -Uri 'http://localhost:5000/api/attendance/mark' -Method Post -Body $body -ContentType 'application/json'
  $res | ConvertTo-Json -Depth 5
} catch {
  Write-Error $_
}
