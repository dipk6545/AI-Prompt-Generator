# PromptCraft AI

PromptCraft AI is a premium prompt optimization web application designed to help prompt engineers and developers refine their LLM prompts for maximum efficacy. It supports multiple LLM providers (Groq, Mistral, Cerebras, Gemini) and features custom API credentials support, encrypted local storage, and secure admin tools.

## Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS v4.
- **Backend**: Python FastAPI with `httpx` async client.
- **Security**: Locally encrypted API keys using AES-256-GCM via standard Web Crypto API. Password-based session authentication for Admin Mode.

---

## Getting Started

### 1. Backend Setup

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   # On Windows:
   venv\Scripts\activate
   # On macOS/Linux:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy the `.env.example` file to `.env`:
   ```bash
   copy .env.example .env
   ```
5. Add your credentials in `.env` (like `ADMIN_PASSWORD`, `GROQ_API_KEY`, etc.).
6. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload
   ```
   The backend will be running at `http://127.0.0.1:8000`.

### 2. Frontend Setup

1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The application will be running at `http://localhost:5173`.

---

## Features & Usage

1. **Model Selection**: Switch between **GROQ**, **MISTRAL**, **CEREBRAS**, and **GEMINI** in the header.
2. **API Credentials**:
   - **Server Key**: Uses keys defined securely inside `backend/.env`.
   - **My API Key**: Allows users to save their own keys. The key is encrypted locally in the browser with **AES-256-GCM** before persistence and loaded securely on reopen.
3. **Admin Portal**: Toggle "Admin Mode" and enter the password configured in `backend/.env` (default is `admin123`). Admin sessions are held in Session Storage and end upon tab closure.
4. **Optimized Outputs**: Input your raw prompt in the left panel and click **Generate** to get a formatted, robustly structured prompt in the right panel.
