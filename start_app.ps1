# Start both Backend and Frontend in the SAME terminal using concurrently
Write-Host "Starting CureBird System..."
Write-Host "--------------------------------"
Write-Host "Backend: http://localhost:5000"
Write-Host "Frontend: http://localhost:3000"
Write-Host "--------------------------------"

# Use npx concurrently to pipe both outputs to this shell
# We point to the venv inside the backend folder as requested.
npx -y concurrently -k -n "BACKEND,WebAPP" -c "bgBlue.bold,bgGreen.bold" "backend\venv\Scripts\python.exe backend\run.py" "npm start"
