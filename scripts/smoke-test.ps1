$body = @{
  destination = "Tokyo"
  startDate = "2026-06-10"
  endDate = "2026-06-12"
  interests = @("food", "culture")
  pace = "balanced"
  constraints = @{
    budget = "mid"
    mobility = "moderate"
    vibe = "balanced"
  }
} | ConvertTo-Json -Depth 5

$trip = Invoke-RestMethod -Uri "http://localhost:3000/api/trips" -Method POST -Body $body -ContentType "application/json"
Write-Host "Trip ID: $($trip.id)"

$genBody = '{"fromDay":0}'
$gen = Invoke-RestMethod -Uri "http://localhost:3000/api/trips/$($trip.id)/generate" -Method POST -Body $genBody -ContentType "application/json"
Write-Host "Days generated: $($gen.daysGenerated)"
Write-Host "Day 1 blocks: $($gen.days[0].blocks.Count)"
Write-Host "OK"
