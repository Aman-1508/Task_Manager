@echo off
echo ====================================================
echo Starting TaskFlow Kanban & Workload Balancing App
echo ====================================================

echo [1/3] Ensuring PostgreSQL container is running on port 5433...
docker compose up -d

echo [2/3] Starting Express Backend API on http://localhost:5001...
start "TaskFlow Backend (Port 5001)" cmd /k "cd backend && npm run dev"

echo [3/3] Starting Vite Frontend on http://localhost:3000...
start "TaskFlow Frontend (Port 3000)" cmd /k "cd frontend && npm run dev"

echo ====================================================
echo TaskFlow is launching!
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5001
echo ====================================================
pause
