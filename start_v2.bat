@echo off
echo Starting PromptCraft AI (v2) Backend...
start "Backend v2" cmd /k "cd backend && python -m uvicorn app.main:app --port 8080 --reload"

echo Starting PromptCraft AI (v2) Frontend...
start "Frontend v2" cmd /k "cd frontend && npm run dev"

echo Both v2 servers are starting in separate windows.
