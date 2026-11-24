import os, json, re
from openai import AsyncOpenAI

KEY=os.getenv("OPENAI_API_KEY","").strip()
MODEL=os.getenv("OPENAI_MODEL","gpt-4o-mini")
client=AsyncOpenAI(api_key=KEY) if KEY else None

BANK={
"Technical":[
"Tell me about a Python project you have worked on. What problem did it solve?",
"In Python, what is the difference between a list and a tuple, and when would you use each?",
"How would you design a REST API for a task management application?",
"What is exception handling, and how do you use it reliably?",
"How would you debug a slow SQL query?"
],
"HR":[
"Could you briefly introduce yourself and describe the work you enjoy?",
"Tell me about a time you had to learn something quickly.",
"Describe a situation where you received feedback. How did you respond?",
"What kind of team environment helps you do your best work?",
"What are you looking for in your next opportunity?"
],
"Mixed":[
"Introduce yourself and describe a project you are proud of.",
"What technical decision did you make in that project, and why?",
"Tell me about a challenge you faced while working with others.",
"How would you explain a complex technical concept to a non-technical person?",
"What would you improve if you had another week?"
]}

def retrieve(query):
    path=os.path.join(os.path.dirname(__file__),"..","knowledge_base","interview_guide.md")
    if not os.path.exists(path): return ""
    chunks=open(path,encoding="utf-8").read().split("\n## ")
    words=set(re.findall(r"[a-zA-Z0-9+#.]+",query.lower()))
    ranked=sorted(((len(words & set(re.findall(r"[a-zA-Z0-9+#.]+",c.lower()))),c) for c in chunks),reverse=True)
    return "\n\n".join(c for n,c in ranked[:3] if n)

async def ask(system, payload):
    r=await client.chat.completions.create(model=MODEL,temperature=.35,response_format={"type":"json_object"},
        messages=[{"role":"system","content":system},{"role":"user","content":json.dumps(payload)}])
    return json.loads(r.choices[0].message.content)

async def opening(role,level,kind):
    if client:
        try:
            x=await ask("Return JSON with one role-specific opening interview question in key question. Be fair and concise.",{"role":role,"level":level,"type":kind})
            return x["question"]
        except Exception: pass
    q=BANK[kind][0]
    return f"For a {level.lower()} {role} role, {q[0].lower()+q[1:]}" if kind=="Technical" else q

def heuristic(question,answer):
    words=re.findall(r"\w+",answer.lower())
    q=set(re.findall(r"\w+",question.lower()))
    overlap=len(set(words)&q)
    return {"correctness":min(5,max(1,len(set(words))//8)),
            "clarity":min(5,max(1,len(words)//15)),
            "relevance":min(5,max(1,2+overlap)),
            "examples":5 if any(x in answer.lower() for x in ["for example","for instance","such as"]) else 2,
            "feedback":"Add a concrete example and explain the reasoning behind your answer.",
            "mode":"demo"}

async def respond(role,level,kind,question,answer,history,index):
    context=retrieve(role+" "+question+" "+answer)
    if client:
        try:
            data=await ask(
              "You are InterviewIQ, a fair job-related voice interviewer. Evaluate only answer content, never accent, voice, identity or protected traits. Return JSON keys reply, evaluation, done. evaluation must contain integer correctness, clarity, relevance, examples from 0-5 and feedback. Ask one useful follow-up or the next question. After five candidate answers set done=true.",
              {"role":role,"level":level,"type":kind,"question":question,"answer":answer,
               "history":history[-8:],"retrieved_knowledge":context[:3500],"answer_number":index+1})
            ev=data.get("evaluation",{})
            for k in ["correctness","clarity","relevance","examples"]:
                ev[k]=max(0,min(5,int(ev.get(k,0))))
            ev["mode"]="llm"
            return {"reply":data.get("reply","Thank you. Let's continue."),"evaluation":ev,"done":bool(data.get("done",index>=4))}
        except Exception: pass
    ev=heuristic(question,answer)
    bank=BANK[kind]
    done=index>=4
    nxt=bank[min(index+1,len(bank)-1)]
    if kind=="Technical": nxt=f"For the {role} role: {nxt}"
    reply=("Thank you for completing the interview. Finish the session to view your report."
           if done else f"Thank you. {ev['feedback']} Next question: {nxt}")
    return {"reply":reply,"evaluation":ev,"done":done}

async def report(role,turns):
    evaluations=[json.loads(t["evaluation"]) for t in turns if t["speaker"]=="candidate" and t["evaluation"]]
    vals=[e[k] for e in evaluations for k in ["correctness","clarity","relevance","examples"]]
    score=round(sum(vals)/(len(vals)*5)*100) if vals else 0
    if client and evaluations:
        try:
            x=await ask("Return JSON keys strengths (array), improvement_areas (array), summary (string), recommendation (string). This is evidence summary only, never a hiring decision. Do not infer protected traits.",
                        {"role":role,"evaluations":evaluations})
            x["overall_score"]=score; x["mode"]="llm"; return x
        except Exception: pass
    return {"overall_score":score,"strengths":["Candidate completed recorded responses."],
            "improvement_areas":["Use specific examples and explain reasoning and trade-offs."],
            "summary":"A content-based summary generated by the prototype rubric. Human review is required.",
            "recommendation":"Some evidence" if evaluations else "Insufficient evidence","mode":"demo"}
