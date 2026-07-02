@echo off
echo Starting PromptCraft AI Backend...
start "Backend" cmd /k "cd backend && python -m uvicorn app.main:app --port 8080 --reload"

echo Starting PromptCraft AI Frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo Both servers are starting in separate windows.
