# CareFindr

AI-powered medical assistant for Pakistan. Describes symptoms in a conversational flow, suggests a specialist, then finds real doctors near you with clinic details, timings, and phone numbers.

---

## Features

- Conversational AI symptom checker (Llama 4 via Groq)
- Step-by-step flow: symptoms → assessment → specialist → doctors near you
- Real-time doctor search by city and specialty (Tavily)
- Doctor cards with clinic, address, timings, phone, and Google Maps link
- User accounts with JWT authentication
- Chat history saved per user in sidebar
- Redis caching for doctor search results (reduces Tavily API usage)
- Fully containerized with Docker

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React Native (Expo v54) |
| Backend | FastAPI + Python 3.11 |
| AI | Groq (Llama 4 Scout) + Tavily Search |
| Database | PostgreSQL + SQLAlchemy (async) |
| Cache | Redis |
| Auth | JWT (python-jose + passlib) |
| Migrations | Alembic |

---

## Project Structure

```
carefindr/
├── carefindr-backend/       # FastAPI backend
│   ├── app/
│   │   ├── ai/              # Groq + Tavily chat service
│   │   ├── api/routes/      # auth, chat, health endpoints
│   │   ├── core/            # config, security, JWT
│   │   └── db/              # models, database session
│   ├── alembic/             # database migrations
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example
├── carefindr-app/           # React Native (Expo) frontend
│   ├── src/
│   │   ├── screens/         # Login, Register, Chat
│   │   ├── components/      # DoctorCard, MessageBubble, DrawerContent
│   │   ├── context/         # AuthContext
│   │   ├── api/             # axios client
│   │   └── theme/           # colors
│   └── .env.example
└── docker-compose.yml
```

---

## Running with Docker (recommended)

**Prerequisites:** Docker and Docker Compose installed.

```bash
# 1. Clone the repo
git clone https://github.com/your-username/carefindr.git
cd carefindr

# 2. Set up backend environment
cp carefindr-backend/.env.example carefindr-backend/.env
```

Edit `carefindr-backend/.env` and fill in:

```env
GROQ_API_KEY=your_groq_key
TAVILY_API_KEY=your_tavily_key
POSTGRES_USER=carefindr
POSTGRES_PASSWORD=your_strong_password
JWT_SECRET=your_long_random_secret
```

```bash
# 3. Start everything (postgres + redis + backend)
docker compose up --build
```

The API will be available at `http://localhost:8000`.  
Database migrations run automatically on startup.

---

## Running Locally (without Docker)

**Prerequisites:** Python 3.11+, PostgreSQL, Redis (optional).

```bash
cd carefindr-backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# fill in .env with your values

alembic upgrade head
uvicorn app.main:app --reload
```

---

## Running the Frontend

**Prerequisites:** Node.js, Expo CLI.

```bash
cd carefindr-app

# Install dependencies
npm install

# Set the API URL (optional — defaults to localhost:8000)
cp .env.example .env

# Start Expo
npx expo start
```

- Press `w` for web browser
- Scan QR code with Expo Go app for mobile

---

## Environment Variables

### Backend (`carefindr-backend/.env`)

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Groq API key — [console.groq.com](https://console.groq.com) |
| `GROQ_MODEL` | Model ID (default: `meta-llama/llama-4-scout-17b-16e-instruct`) |
| `TAVILY_API_KEY` | Tavily API key — [tavily.com](https://tavily.com) |
| `POSTGRES_HOST` | Database host (Docker sets this to `postgres` automatically) |
| `POSTGRES_PORT` | Database port (default: `5432`) |
| `POSTGRES_DB` | Database name |
| `POSTGRES_USER` | Database user |
| `POSTGRES_PASSWORD` | Database password |
| `JWT_SECRET` | Secret key for signing JWT tokens — use a long random string |
| `JWT_ALGORITHM` | JWT algorithm (default: `HS256`) |
| `JWT_EXPIRE_HOURS` | Token expiry in hours (default: `24`) |
| `REDIS_URL` | Redis connection URL — leave empty to disable caching |

### Frontend (`carefindr-app/.env`)

| Variable | Description |
|---|---|
| `EXPO_PUBLIC_API_URL` | Backend API URL (default: `http://localhost:8000/api/v1`) |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Create a new account |
| POST | `/api/v1/auth/login` | Sign in, receive JWT token |
| GET | `/api/v1/auth/me` | Get current user info |
| POST | `/api/v1/chat` | Send a message to the AI |
| GET | `/api/v1/chat/{session_id}/history` | Get chat history for a session |
| GET | `/api/v1/user/sessions` | List all sessions for current user |
| GET | `/api/v1/health` | Health check |

---
