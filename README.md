# 🎙️ InterviewIQ

### Agentic Voice AI Interview Platform for Automated Candidate Screening & Technical Assessment

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-Frontend-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?style=flat-square&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![OpenAI](https://img.shields.io/badge/OpenAI-Optional%20LLM%20Integration-412991?style=flat-square&logo=openai&logoColor=white)](https://platform.openai.com/)
[![Pytest](https://img.shields.io/badge/Pytest-Testing-0A9EDC?style=flat-square&logo=pytest&logoColor=white)](https://docs.pytest.org/)

---

## 📸 Screenshots

> Add screenshots from your running application to the `screenshots/` folder, then replace the filenames below with the images you capture.

### Main Dashboard

![InterviewIQ Dashboard](screenshots/dashboard.png)

### Voice Interview Studio

![Voice Interview Studio](screenshots/voice-interview.png)

### Candidate Interview and AI Conversation

![Interview Conversation](screenshots/interview-conversation.png)

### Automated Evaluation Report

![Interview Evaluation Report](screenshots/evaluation-report.png)

### Analytics Dashboard

![Analytics Dashboard](screenshots/analytics.png)

---

## 📌 Overview

**InterviewIQ** is a browser-based, voice-first AI interview platform designed to streamline preliminary candidate screening and structured technical assessment. It combines a web interface, a FastAPI backend, optional LLM-powered interviewer logic, answer evaluation and interview analytics.

The platform simulates an interview conversation: the interviewer asks a question aloud, the candidate responds through a microphone, browser speech recognition converts the response into text, and the backend evaluates the answer before returning the next interviewer turn.

The project currently supports Technical, HR and Mixed interview modes, candidate and role setup, interview history and a final assessment report.

### The platform:

- Conducts structured interviews based on candidate role, experience level and interview type.
- Reads interviewer questions and responses aloud using browser speech synthesis.
- Captures candidate responses through browser speech recognition where supported.
- Transcribes spoken responses and submits them to the FastAPI evaluation service.
- Uses an optional OpenAI integration for LLM-driven interviewer responses.
- Supports a demo mode with curated questions and a heuristic evaluation rubric.
- Stores interview sessions, turns and reports in SQLite.
- Presents interview activity and assessment summaries through an analytics dashboard.

---

## ✨ Features

| **Feature** | **Description** |
|---|---|
| 🎙️ **Voice-Based Interview** | Browser-based speech input captures candidate responses and converts them into text. |
| 🔊 **AI Interviewer Speech** | Browser SpeechSynthesis reads interviewer questions and responses aloud. |
| 🔁 **Automatic Voice Conversation** | In the voice-first mode, the interviewer speaks, the browser listens, the transcript is submitted, and the next response is spoken. |
| 🧠 **LLM-Powered Interview Flow** | Optional OpenAI API integration supports dynamic interviewer responses when an API key is configured. |
| 🧪 **Demo Interview Mode** | Curated question banks and a heuristic rubric allow a local demonstration without an external API key. |
| 📚 **Knowledge-Guided Responses** | Lightweight keyword-based retrieval uses the included interview guide as supporting context. |
| 📊 **Answer Evaluation** | Responses are assessed across correctness, clarity, relevance and use of examples. |
| 🗂️ **Interview History** | SQLite stores candidate sessions, turns, interview status and reports. |
| 📈 **Analytics Dashboard** | Displays total interviews, completed interviews, active sessions and average score. |
| 📄 **Assessment Report** | Generates a summary with strengths, improvement areas and a recommendation label. |
| 🔌 **REST API** | FastAPI exposes endpoints for starting interviews, submitting turns, retrieving records and finishing sessions. |

---

## 🔄 System Architecture

The platform follows a browser-to-backend request flow:

| **Stage** | **Component** | **Responsibility** |
|---|---|---|
| **1** | **Candidate Interface** | Collects candidate details and displays the interview studio, conversation and assessment report. |
| **2** | **Browser Voice Layer** | Uses SpeechSynthesis for spoken interviewer turns and Web Speech Recognition for candidate transcription where supported. |
| **3** | **FastAPI Backend** | Receives interview requests, validates inputs and coordinates interview state. |
| **4** | **Agent & Evaluation Logic** | Selects or generates interviewer responses, retrieves guide snippets and evaluates candidate answers. |
| **5** | **Optional OpenAI Integration** | Provides LLM-driven conversation and evaluation support when configured with a valid API key. |
| **6** | **SQLite Persistence** | Stores interview metadata, conversation turns and completed reports. |
| **7** | **Analytics & Reporting UI** | Retrieves stored interviews and presents summary metrics and assessment output. |

### Voice Interaction Pipeline

```text
AI Interviewer Prompt
        |
        v
Browser SpeechSynthesis
        |
        v
Candidate Hears Question
        |
        v
Browser Speech Recognition
        |
        v
Speech-to-Text Transcript
        |
        v
FastAPI Interview Endpoint
        |
        v
Agent / Evaluation Logic <----> Interview Guide Retrieval
        |
        +----> Optional OpenAI API
        |
        v
Evaluation + Next Interviewer Response
        |
        v
SQLite Session / Turn Persistence
        |
        v
Interviewer Speaks Next Response
```

---

## 🛠️ Tech Stack

### Backend & API Development
- Python
- FastAPI
- Uvicorn
- Pydantic
- REST API design
- Python-dotenv

### Voice & Frontend Development
- JavaScript (ES6+)
- HTML5
- CSS3
- Browser Web Speech API — SpeechRecognition / webkitSpeechRecognition
- SpeechSynthesis API
- Asynchronous JavaScript and Fetch API

### AI & Evaluation
- OpenAI API integration (optional; requires user-provided API key)
- Prompt-driven interviewer logic
- Heuristic answer evaluation in demo mode
- Keyword-based knowledge retrieval over a local Markdown knowledge base

### Database & Persistence
- SQLite
- SQL
- Session and conversation persistence

### Testing & Developer Tools
- Pytest
- HTTPX
- Visual Studio Code
- Git
- GitHub
- PowerShell

---

## ⚙️ Core API Endpoints

| **Method** | **Endpoint** | **Purpose** |
|---|---|---|
| GET | `/api/health` | Checks backend availability and configured LLM mode. |
| GET | `/api/interviews` | Retrieves interview records for the dashboard. |
| POST | `/api/interviews/start` | Creates a candidate interview session. |
| GET | `/api/interviews/{id}` | Retrieves an interview and its associated information. |
| POST | `/api/interviews/{id}/turn` | Submits a candidate answer and obtains an evaluation and interviewer reply. |
| POST | `/api/interviews/{id}/finish` | Completes the session and generates the assessment report. |

Interactive API documentation is available through FastAPI Swagger UI at `/docs`.

---

## 🚀 Getting Started

### Prerequisites

- Python 3.10 or later
- Google Chrome or Microsoft Edge recommended for browser voice input
- Git
- OpenAI API key only when using the optional LLM integration

### 1. Clone the repository

```bash
git clone https://github.com/avantikaar/InterviewIQ.git
cd InterviewIQ
```

### 2. Create a virtual environment

**Windows PowerShell**

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
```

**macOS / Linux**

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Copy `.env.example` to `.env` and configure the values:

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
DATABASE_PATH=interviewiq.db
```

The OpenAI API key is optional for demo mode. Keep your real `.env` file private and never commit API credentials.

### 5. Run the application

```bash
uvicorn app.main:app --reload
```

Open the application:

- **Dashboard:** http://127.0.0.1:8000
- **API Documentation:** http://127.0.0.1:8000/docs

---

## 🎧 Using the Voice Interview

1. Open the Interview Studio and enter the candidate name, role, experience level and interview type.
2. Keep **Automatic voice conversation** enabled and start the interview.
3. Allow microphone access when prompted by the browser.
4. Listen to the AI interviewer read the question aloud.
5. Speak your answer when the interface switches to listening mode.
6. The recognized transcript is submitted to the backend for evaluation.
7. The interviewer speaks its next response and continues the conversation.
8. Use **Replay question** or **Pause voice mode** when needed.
9. Finish the interview to generate the assessment report.

**Browser note:** Speech recognition is browser-dependent and may require an active network connection. If voice recognition is unavailable or microphone permission is denied, disable automatic voice conversation and use typed answers. Speech synthesis voice availability varies by operating system and browser.

---

## 🧪 Testing

Run the included test suite from the project root:

```bash
pytest -q
```

The tests cover the agent logic included in the repository. Add integration and browser-level tests before relying on the system in a production hiring workflow.

---

## 🔐 Responsible AI & Limitations

- Interview scores are decision-support signals, not hiring decisions.
- Human review is required before any candidate decision.
- The current demo-mode scoring uses heuristic logic and is not a validated psychometric or hiring assessment.
- The knowledge retriever is keyword-based; it is not an embedding-based vector database or a full production RAG pipeline.
- Browser-native speech recognition support, transcription accuracy and available voices vary by platform.
- The application does not currently implement authentication, enterprise access control, a candidate consent workflow or a candidate data deletion portal.
- SQLite is intended for local demonstration and lightweight usage, not high-concurrency production deployment.
- The current browser voice loop is not a low-latency, full-duplex real-time audio agent.
- LLM mode requires a valid API key and may incur provider charges.

---

## 🎯 Relevance to the MASAL.ai AI Forward Deployed Engineer Internship

The internship description emphasizes practical Voice AI agents, conversational design, Python, API integration, LLM APIs, speech-to-text, text-to-speech, testing and iterative improvement. InterviewIQ demonstrates several of these foundations in a candidate-screening use case.

| **JD Focus Area** | **How InterviewIQ Relates** | **Current Status** |
|---|---|---|
| Python development | FastAPI backend, interview orchestration and evaluation logic are implemented in Python. | Implemented |
| Voice AI / conversational AI | Multi-turn interviewer flow with spoken prompts and spoken responses. | Browser-based prototype |
| Speech-to-text (STT) | Browser Web Speech Recognition captures and transcribes candidate answers where supported. | Implemented via browser API |
| Text-to-speech (TTS) | Browser SpeechSynthesis reads interviewer questions and responses aloud. | Implemented via browser API |
| LLM APIs | Optional OpenAI Chat Completions integration generates interviewer turns and assessment summaries. | Implemented; requires API key |
| Prompt engineering and conversation flows | System instructions define interviewer behavior, answer evaluation criteria, follow-up behavior and interview completion. | Implemented |
| API integration | FastAPI REST endpoints connect the browser interface with interview and evaluation services. | Implemented |
| RAG / knowledge grounding | A local interview guide is searched using keyword overlap and relevant snippets are passed into the LLM prompt. | Lightweight retrieval only; not vector RAG |
| Agent frameworks / voice orchestration platforms | The current workflow is orchestrated with custom Python and browser APIs. | External platforms/frameworks not integrated |
| CRM, property and project-data integration | The API structure can be extended to connect external business systems. | Not implemented |
| Function calling / external tools | No LLM function-calling or external tool-execution layer is currently present. | Not implemented |
| Scenario testing and iteration | A Pytest test module is included for core agent behavior; broader conversation and browser voice testing remains future work. | Basic test coverage |

### Skills and tools demonstrated in this project

**Implemented technologies:** Python, FastAPI, REST APIs, OpenAI API integration, prompt-driven LLM interaction, conversational flow design, browser SpeechRecognition, SpeechSynthesis, JavaScript, HTML, CSS, SQLite, keyword-based knowledge retrieval, Pytest, Git and GitHub.

**Relevant engineering practices:** API integration, request/response handling, asynchronous Python endpoints, conversation history handling, answer evaluation, persistence, basic test-driven verification, debugging and technical documentation.

**Important distinction:** InterviewIQ is a voice-enabled interview-screening prototype. It demonstrates transferable Voice AI and agent-building foundations, but it is not yet a real-estate sales agent and does not currently integrate a CRM, property inventory, external voice orchestration platform, function calling or a production vector database. These are possible next steps rather than existing features.

---

## 🧭 Future Enhancements

- Integrate a dedicated real-time voice service for low-latency, interruption-aware conversations.
- Add role-specific interview plans and configurable competency rubrics.
- Upgrade keyword retrieval to embedding-based RAG with a vector store.
- Add interviewer configuration, question difficulty adaptation and richer follow-up logic.
- Add authentication, role-based access, candidate consent and data retention controls.
- Add comprehensive API integration tests and browser automation tests.
- Deploy with production-grade monitoring, logging and secure secret management.

---

## 👩‍💻 Author

**Avantikaa**  
GitHub: [@avantikaar](https://github.com/avantikaar)

---

<p align="center">
  <b>InterviewIQ — Making structured candidate screening more interactive through voice and AI.</b>
</p>
