# Start both Backend and Frontend in the SAME terminal using concurrently
Write-Host "Starting CureBird System..."
Write-Host "--------------------------------"
Write-Host "Backend: http://localhost:5000"
Write-Host "Frontend: http://localhost:3000"
Write-Host "--------------------------------"

# Use npx concurrently to pipe both outputs to this shell
# We use 'call' for activate.bat to ensure it runs in the cmd chain properly if needed, though && usually works.
npx -y concurrently -k -n "BACKEND,WebAPP" -c "bgBlue.bold,bgGreen.bold" "cd backend && venv\\Scripts\\activate && python run.py" "npm start"
