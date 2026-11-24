import os, sqlite3, json
from datetime import datetime, timezone

DB = os.getenv("DATABASE_PATH", "interviewiq.db")

def connect():
    c = sqlite3.connect(DB)
    c.row_factory = sqlite3.Row
    return c

def now():
    return datetime.now(timezone.utc).isoformat()

def init():
    with connect() as c:
        c.execute("""CREATE TABLE IF NOT EXISTS interviews(
            id INTEGER PRIMARY KEY AUTOINCREMENT, candidate_name TEXT, role TEXT,
            level TEXT, interview_type TEXT, status TEXT DEFAULT 'in_progress',
            question TEXT, question_index INTEGER DEFAULT 0, created_at TEXT,
            report TEXT)""")
        c.execute("""CREATE TABLE IF NOT EXISTS turns(
            id INTEGER PRIMARY KEY AUTOINCREMENT, interview_id INTEGER,
            speaker TEXT, content TEXT, evaluation TEXT, created_at TEXT)""")
        c.commit()

def create(data, question):
    with connect() as c:
        cur = c.execute("""INSERT INTO interviews(candidate_name,role,level,interview_type,question,created_at)
            VALUES(?,?,?,?,?,?)""", (data.candidate_name, data.role, data.level, data.interview_type, question, now()))
        iid = cur.lastrowid
        c.execute("INSERT INTO turns(interview_id,speaker,content,created_at) VALUES(?,?,?,?)",
                  (iid, "interviewer", question, now()))
        c.commit()
        return iid

def get(iid):
    with connect() as c:
        row = c.execute("SELECT * FROM interviews WHERE id=?", (iid,)).fetchone()
        if not row: return None
        item = dict(row)
        item["turns"] = [dict(x) for x in c.execute("SELECT * FROM turns WHERE interview_id=? ORDER BY id", (iid,))]
        item["report"] = json.loads(item["report"]) if item["report"] else None
        return item

def add_turn(iid, speaker, content, evaluation=None):
    with connect() as c:
        c.execute("INSERT INTO turns(interview_id,speaker,content,evaluation,created_at) VALUES(?,?,?,?,?)",
                  (iid, speaker, content, json.dumps(evaluation) if evaluation else None, now()))
        c.commit()

def update(iid, question, index):
    with connect() as c:
        c.execute("UPDATE interviews SET question=?,question_index=? WHERE id=?", (question,index,iid))
        c.commit()

def finish(iid, report):
    with connect() as c:
        c.execute("UPDATE interviews SET status='completed',report=? WHERE id=?", (json.dumps(report),iid))
        c.commit()

def listing():
    with connect() as c:
        rows = c.execute("SELECT * FROM interviews ORDER BY id DESC LIMIT 50").fetchall()
        out=[]
        for r in rows:
            x=dict(r); rep=json.loads(x["report"]) if x["report"] else None
            x["score"]=rep.get("overall_score") if rep else None
            x.pop("report",None); out.append(x)
        return out
