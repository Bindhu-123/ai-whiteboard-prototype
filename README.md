# AI Smart Whiteboard — Advanced Prototype

This is a hackathon-ready advanced prototype for an AI-native collaborative whiteboard.

Features:
- Real-time drawing with Socket.IO
- Stroke smoothing (perfect-freehand)
- Text summarization & translation (OpenAI)
- Idea → Flowchart generation (Mermaid + OpenAI)

## Run locally
1. Backend:
   - cd backend
   - copy .env.example to .env and set OPENAI_API_KEY
   - npm install
   - npm start
2. Frontend:
   - cd frontend
   - npm install
   - npm start (vite)
3. Open two browser windows to the frontend URL and demo.
