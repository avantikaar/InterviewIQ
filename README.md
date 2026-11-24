# InterviewIQ — Agentic Voice AI Interview Platform

A portfolio-ready prototype demonstrating voice-first interviewing, LLM-based adaptive questioning, answer evaluation, lightweight RAG, API integration, persistence and analytics.

## Features
- Candidate setup: role, experience level and Technical / HR / Mixed interview.
- Voice input using browser SpeechRecognition where supported.
- Spoken interviewer responses using browser SpeechSynthesis.
- Dynamic LLM interviewer when an OpenAI key is configured.
- Demo mode works without an API key using curated question banks and a transparent heuristic rubric.
- Lightweight keyword-based retrieval over `knowledge_base/interview_guide.md`.
- SQLite persistence for interviews, turns and reports.
- Analytics dashboard and FastAPI Swagger docs.

## Quick start
Python 3.10+ recommended.

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
```

Copy `.env.example` to `.env`. Add `OPENAI_API_KEY` for dynamic LLM conversations. Never commit `.env`.

```bash
uvicorn app.main:app --reload
```
Open http://127.0.0.1:8000. API docs: http://127.0.0.1:8000/docs

## Voice use
Use Chrome or Edge, allow microphone access, click the microphone, speak, then submit the transcribed answer. Browser voice recognition is not supported in every browser; typing is always available. Speech synthesis reads interviewer turns aloud.

## API
- `GET /api/health`
- `GET /api/interviews`
- `POST /api/interviews/start`
- `GET /api/interviews/{id}`
- `POST /api/interviews/{id}/turn`
- `POST /api/interviews/{id}/finish`

## Architecture
Browser voice UI → FastAPI → agent orchestration → optional OpenAI API → SQLite. The agent retrieves relevant knowledge snippets from the included markdown knowledge base. The current retriever is intentionally lightweight and transparent; upgrade it to embeddings + ChromaDB for a production-grade RAG implementation.

## Responsible use
Scores are based only on answer content and a simple job-related rubric. Never assess accent, voice pitch, speed, identity or protected traits. This prototype is not a hiring decision system. Human review is required.

## Known limitations
- Browser-native speech recognition support varies; use Chrome/Edge.
- Demo-mode evaluation is heuristic, not a validated assessment model.
- SQLite is suitable for local demos, not concurrent production workloads.
- No authentication, consent workflow, candidate deletion portal, or production security controls are included.
- External LLM usage requires your own API key and may incur charges.

## Push to GitHub
```bash
git init
git add .
git commit -m "Build InterviewIQ voice AI interview platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/InterviewIQ.git
git push -u origin main
```


## Voice-first interview mode

The interview studio supports a hands-free browser voice loop:
1. Start the interview and allow microphone access.
2. The interviewer reads the prompt aloud using browser speech synthesis.
3. Browser speech recognition listens for the candidate's answer.
4. When the recognition session ends after the candidate pauses, the transcript is submitted to the FastAPI evaluator.
5. The interviewer speaks the next response and listens again.

Use Chrome or Edge and allow microphone access. Speech recognition availability and language quality depend on the browser, operating system, network and browser speech service. If voice recognition is unavailable, turn off **Automatic voice conversation**, type an answer, and submit it. The app also includes replay and pause/resume controls.

This is a browser-based voice prototype, not a low-latency full-duplex telephony/streaming voice agent. For production deployment, add a dedicated real-time audio service, authentication, consent/privacy controls, monitoring, and end-to-end tests.
