from pathlib import Path
from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from . import db
from .schemas import StartRequest, AnswerRequest
from .agent import opening, respond, report, client

BASE=Path(__file__).resolve().parent.parent
app=FastAPI(title="InterviewIQ API",version="1.0.0",description="Agentic Voice AI Interview Platform")

@app.on_event("startup")
def startup(): db.init()

@app.get("/api/health")
def health(): return {"status":"ok","mode":"llm" if client else "demo","llm_enabled":bool(client)}

@app.get("/api/interviews")
def interviews(): return {"items":db.listing()}

@app.post("/api/interviews/start")
async def start(payload:StartRequest):
    q=await opening(payload.role,payload.level,payload.interview_type)
    iid=db.create(payload,q)
    return {"interview_id":iid,"question":q,"mode":"llm" if client else "demo"}

@app.get("/api/interviews/{iid}")
def get_interview(iid:int):
    x=db.get(iid)
    if not x: raise HTTPException(404,"Interview not found")
    return x

@app.post("/api/interviews/{iid}/turn")
async def turn(iid:int,payload:AnswerRequest):
    item=db.get(iid)
    if not item: raise HTTPException(404,"Interview not found")
    if item["status"]!="in_progress": raise HTTPException(409,"Interview is completed")
    history=[{"speaker":t["speaker"],"content":t["content"]} for t in item["turns"]]
    db.add_turn(iid,"candidate",payload.answer)
    result=await respond(item["role"],item["level"],item["interview_type"],item["question"],payload.answer,history,item["question_index"])
    with db.connect() as c:
        c.execute("UPDATE turns SET evaluation=? WHERE id=(SELECT MAX(id) FROM turns WHERE interview_id=? AND speaker='candidate')",
                  (__import__("json").dumps(result["evaluation"]),iid)); c.commit()
    db.add_turn(iid,"interviewer",result["reply"])
    db.update(iid,result["reply"],item["question_index"]+1)
    return result

@app.post("/api/interviews/{iid}/finish")
async def finish(iid:int):
    item=db.get(iid)
    if not item: raise HTTPException(404,"Interview not found")
    rep=await report(item["role"],item["turns"])
    db.finish(iid,rep)
    return {"report":rep}

@app.get("/")
def home(): return FileResponse(BASE/"static"/"index.html")

app.mount("/static",StaticFiles(directory=BASE/"static"),name="static")
