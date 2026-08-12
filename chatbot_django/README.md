# Django Hospital Chatbot Backend

A dedicated **Django REST Framework** backend service for the Hospital AI Assistant Chatbot.

## Features
- **Django REST Framework API**: Serves `POST /api/chatbot/query/` and `GET /api/chatbot/health/`.
- **CORS Support**: Pre-configured with `django-cors-headers` to accept requests from the React frontend (`http://localhost:5173`).
- **Medical Intent & Symptom Analyzer**: Evaluates natural language user inputs, symptoms, doctor queries, and hospital FAQs.
- **Dynamic Doctor Recommendations**: Returns structured doctor cards with quick booking actions.

## Quick Start Guide

### 1. Navigate to directory
```bash
cd chatbot_django
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Apply database migrations
```bash
python manage.py migrate
```

### 4. Start the Django Server
```bash
python manage.py runserver 8001
```

The Django chatbot service will be running at:
- **API Endpoint:** `http://localhost:8001/api/chatbot/query/`
- **Health Check:** `http://localhost:8001/api/chatbot/health/`

## Testing with cURL

```bash
curl -X POST http://localhost:8001/api/chatbot/query/ \
     -H "Content-Type: application/json" \
     -d '{"message": "I have severe headache and dizziness"}'
```
