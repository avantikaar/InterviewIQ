let iid=null, recognition=null, recording=false, lastReply="", autoVoice=true, voicePaused=false;
let finalTranscript="", submitting=false, currentQuestion=0, interviewFinished=false;
const $=id=>document.getElementById(id);
async function api(url,opts={}){let r=await fetch(url,{headers:{"Content-Type":"application/json"},...opts});let d=await r.json();if(!r.ok)throw Error(d.detail||"API error");return d}
function safe(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function message(who,text){let el=document.createElement("div");el.className="bubble "+(who==="candidate"?"user":"");el.textContent=text;$("chat").appendChild(el);$("chat").scrollTop=$("chat").scrollHeight}
function setVoiceState(state,detail){
  const labels={speaking:"AI interviewer is speaking",listening:"Listening to your answer…",thinking:"Evaluating your response…",paused:"Voice mode paused",ready:"Ready for your answer",error:"Voice input unavailable"};
  $("voice-state").dataset.state=state;$("voice-state-text").textContent=detail||labels[state]||state;
  $("voice-title").textContent=labels[state]||"Voice interview";
  $("mic").classList.toggle("recording",state==="listening");
}
function speak(text,after){
  lastReply=text;
  if(!("speechSynthesis" in window)){setVoiceState("error","Speech playback is not supported. Read the question and continue by typing.");if(after)setTimeout(after,0);return}
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);u.lang="en-IN";u.rate=0.96;u.pitch=1;
  const voices=speechSynthesis.getVoices();const indian=voices.find(v=>/en-IN/i.test(v.lang));if(indian)u.voice=indian;
  u.onstart=()=>setVoiceState("speaking");
  u.onend=()=>{if(after)after();else setVoiceState("ready")};
  u.onerror=()=>{setVoiceState("ready","Audio playback had an issue. You can replay the question.");if(after)after()};
  speechSynthesis.speak(u);
}
function setupVoice(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){$("voice-help").textContent="Speech recognition is not available in this browser. Use Chrome or Edge, or type your answer."; $("auto-voice").checked=false;autoVoice=false;return}
  recognition=new SR();recognition.lang="en-IN";recognition.interimResults=true;recognition.continuous=false;recognition.maxAlternatives=1;
  recognition.onstart=()=>{recording=true;finalTranscript="";setVoiceState("listening");$("voice-help").textContent="Speak naturally. The answer will be submitted when you pause."};
  recognition.onresult=e=>{
    let interim="";
    for(let i=e.resultIndex;i<e.results.length;i++){
      const transcript=e.results[i][0].transcript;
      if(e.results[i].isFinal)finalTranscript+=transcript+" ";else interim+=transcript;
    }
    const t=(finalTranscript+interim).trim();$("response").value=t;$("chars").textContent=t.length+" / 6000";
  };
  recognition.onerror=e=>{
    recording=false;
    if(e.error==="not-allowed"||e.error==="service-not-allowed"){autoVoice=false;$("auto-voice").checked=false;$("voice-help").textContent="Microphone permission was blocked. Allow microphone access in your browser settings, then try again."}
    else $("voice-help").textContent="Voice recognition: "+e.error+". You can type your answer or try the microphone again.";
    setVoiceState("error");
  };
  recognition.onend=async()=>{
    recording=false;$("mic").classList.remove("recording");
    const answer=(finalTranscript||$("response").value).trim();
    if(answer && autoVoice && !voicePaused && iid && !submitting && !interviewFinished){
      await submitAnswer(answer);
    }else if(!answer && autoVoice && !voicePaused && iid && !interviewFinished){
      setVoiceState("ready","I didn't catch that. Tap the microphone to try again, or type your answer.");
    }else if(!voicePaused)setVoiceState("ready");
  };
}
function startListening(){
  if(!iid||!autoVoice||voicePaused||!recognition||recording||submitting||interviewFinished)return;
  $("response").value="";$("chars").textContent="0 / 6000";
  try{recognition.start()}catch(e){setVoiceState("ready","Microphone is busy. Tap the microphone to retry.");}
}
function askAndListen(text){
  speak(text,()=>{if(autoVoice&&!voicePaused&&iid){setTimeout(startListening,450)}else setVoiceState("ready")});
}
async function health(){try{let h=await api("/api/health");$("status").textContent="System operational";$("mode").textContent=h.llm_enabled?"LLM mode enabled":"Demo mode · configure API key"}catch{$("status").textContent="Backend unavailable";$("mode").textContent="Start the server"}}
function tab(name){$("studio").classList.toggle("hidden",name!=="studio");$("dashboard").classList.toggle("hidden",name!=="dashboard");$("heading").textContent=name==="studio"?"Interview Studio":"Analytics Dashboard";document.querySelectorAll(".nav").forEach(x=>x.classList.toggle("active",x.dataset.tab===name));if(name==="dashboard")loadDashboard()}
document.querySelectorAll(".nav").forEach(x=>x.onclick=()=>tab(x.dataset.tab));
$("auto-voice").onchange=()=>{autoVoice=$("auto-voice").checked;voicePaused=false;$("pause-voice").textContent="Pause voice mode";if(autoVoice&&iid){setVoiceState("ready","Automatic voice mode enabled.");if(!speechSynthesis.speaking)startListening()}else{if(recording)recognition.stop();setVoiceState("paused","Automatic mode is off. Use the microphone and Submit answer manually.")}};
$("start").onsubmit=async e=>{
  e.preventDefault();try{
    autoVoice=$("auto-voice").checked;voicePaused=false;interviewFinished=false;submitting=false;
    let d=await api("/api/interviews/start",{method:"POST",body:JSON.stringify({candidate_name:$("name").value,role:$("role").value,level:$("level").value,interview_type:$("type").value})});
    iid=d.interview_id;currentQuestion=1;$("setup").classList.add("hidden");$("session").classList.remove("hidden");
    $("candidate").textContent=$("name").value;$("roleline").textContent=$("role").value+" • "+$("level").value;
    $("counter").textContent="QUESTION 1 / 5";$("chat").innerHTML="";$("report").classList.add("hidden");
    message("interviewer",d.question);
    // The Start button is a user gesture, allowing the browser to request microphone permission.
    if(autoVoice){askAndListen(d.question)}else speak(d.question);
  }catch(err){alert(err.message)}
};
async function submitAnswer(raw){
  if(!iid||submitting||interviewFinished)return;
  const answer=String(raw||"").trim();if(!answer)return;
  submitting=true;if(recording){try{recognition.stop()}catch{}}
  $("response").value="";$("chars").textContent="0 / 6000";message("candidate",answer);setVoiceState("thinking");
  const btn=$("answer").querySelector("button");btn.disabled=true;btn.textContent="Evaluating…";
  try{
    let d=await api(`/api/interviews/${iid}/turn`,{method:"POST",body:JSON.stringify({answer})});
    message("interviewer",d.reply);currentQuestion=Math.min(currentQuestion+1,5);$("counter").textContent=`QUESTION ${Math.min(currentQuestion,5)} / 5`;
    $("voice-help").textContent=`Rubric: correctness ${d.evaluation.correctness}/5 · clarity ${d.evaluation.clarity}/5 · relevance ${d.evaluation.relevance}/5 · examples ${d.evaluation.examples}/5`;
    if(d.done){autoVoice=false;$("auto-voice").checked=false;setVoiceState("ready","Interview questions completed. Finish the interview to generate the report.");speak(d.reply)}
    else if(autoVoice&&!voicePaused)askAndListen(d.reply);else speak(d.reply);
  }catch(err){message("interviewer","Unable to evaluate answer: "+err.message);setVoiceState("error","Could not submit answer. Check your connection and try again.");}
  finally{submitting=false;btn.disabled=false;btn.textContent="Submit answer →";}
}
$("answer").onsubmit=async e=>{e.preventDefault();if(recording){try{recognition.stop()}catch{}}await submitAnswer($("response").value)};
$("response").oninput=()=>{$("chars").textContent=$("response").value.length+" / 6000"};
$("mic").onclick=()=>{
  if(!recognition)setupVoice();if(!recognition)return;
  if(recording){recognition.stop();return}
  voicePaused=false;try{recognition.start()}catch(e){setVoiceState("ready","Microphone is busy. Try again in a moment.");}
};
$("read").onclick=()=>{if(lastReply)speak(lastReply,()=>{if(autoVoice&&!voicePaused&&iid)startListening()})};
$("pause-voice").onclick=()=>{
  voicePaused=!voicePaused;
  if(voicePaused){autoVoice=false;$("auto-voice").checked=false;if(recording)recognition.stop();if("speechSynthesis"in window)speechSynthesis.cancel();$("pause-voice").textContent="Resume voice mode";setVoiceState("paused","Voice mode paused. You can type answers or resume.");}
  else{autoVoice=true;$("auto-voice").checked=true;$("pause-voice").textContent="Pause voice mode";if(lastReply)askAndListen(lastReply);else startListening();}
};
$("finish").onclick=async()=>{
  if(!iid)return;
  try{
    interviewFinished=true;if(recording)recognition.stop();if("speechSynthesis"in window)speechSynthesis.cancel();
    let d=await api(`/api/interviews/${iid}/finish`,{method:"POST"});let r=d.report;
    let list=a=>(a||[]).map(x=>"<li>"+safe(x)+"</li>").join("");
    $("report").innerHTML=`<h3>03 · Interview assessment report</h3><div class="report-score">${r.overall_score}/100</div><p>${safe(r.summary)}</p><div class="report-grid"><article><b>Strengths</b><ul>${list(r.strengths)}</ul></article><article><b>Improvement areas</b><ul>${list(r.improvement_areas)}</ul></article></div><p class="note">Evidence label: ${safe(r.recommendation)}. This is decision support, not a hiring decision.</p>`;
    $("report").classList.remove("hidden");$("session").classList.add("hidden");$("setup").classList.remove("hidden");iid=null;
    $("report").scrollIntoView({behavior:"smooth"});
  }catch(err){alert(err.message)}
};
let dashboardItems=[];
function renderInterviewRows(){
  const query=($("search-interviews")?.value||"").toLowerCase().trim();
  const status=$("status-filter")?.value||"all";
  const filtered=dashboardItems.filter(x=>(status==="all"||x.status===status)&&((x.candidate_name||"").toLowerCase().includes(query)||(x.role||"").toLowerCase().includes(query)));
  $("rows").innerHTML=filtered.length?filtered.map(x=>`<tr><td><b>${safe(x.candidate_name)}</b></td><td>${safe(x.role)}</td><td>${safe(x.interview_type)}</td><td><span class="status-chip ${x.status==="completed"?"completed":""}">${safe((x.status||"").replace("_"," "))}</span></td><td><b>${x.score??"—"}${x.score!==null&&x.score!==undefined?"%":""}</b></td><td>${new Date(x.created_at).toLocaleDateString()}</td></tr>`).join(""):'<tr><td colspan="6" class="empty-state">No interviews match these filters.</td></tr>';
}
function exportInterviews(){
  const cols=["Candidate","Role","Interview Type","Status","Score","Created At"];
  const rows=dashboardItems.map(x=>[x.candidate_name,x.role,x.interview_type,x.status,x.score??"",x.created_at]);
  const csv=[cols,...rows].map(row=>row.map(v=>'"'+String(v??"").replace(/"/g,'""')+'"').join(",")).join(String.fromCharCode(13,10));
  const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"}));
  const a=document.createElement("a");a.href=url;a.download="interviewiq-interviews.csv";a.click();URL.revokeObjectURL(url);
}
async function loadDashboard(){try{
  let d=await api("/api/interviews"),a=d.items||[];dashboardItems=a;
  let done=a.filter(x=>x.status==="completed"),scores=done.map(x=>Number(x.score)).filter(x=>Number.isFinite(x));
  let active=a.filter(x=>x.status==="in_progress").length,avg=scores.length?Math.round(scores.reduce((x,y)=>x+y,0)/scores.length):null;
  $("total").textContent=a.length;$("completed").textContent=done.length;$("active").textContent=active;$("average").textContent=avg===null?"—":avg+"%";
  const rate=a.length?Math.round(done.length/a.length*100):0;
  $("completion-rate").textContent=a.length?rate+"%":"—";$("completion-bar").style.width=rate+"%";
  $("latest-activity").textContent=a.length?new Date(a[0].created_at).toLocaleDateString():"—";
  $("type-count").textContent=new Set(a.map(x=>x.interview_type).filter(Boolean)).size;
  const buckets=[{label:"0–39",min:0,max:39},{label:"40–59",min:40,max:59},{label:"60–79",min:60,max:79},{label:"80–100",min:80,max:100}];
  const counts=buckets.map(b=>scores.filter(s=>s>=b.min&&s<=b.max).length),max=Math.max(1,...counts);
  $("score-chart").innerHTML=scores.length?buckets.map((b,i)=>`<div class="chart-col"><b>${counts[i]}</b><div class="chart-bar-wrap"><div class="chart-bar" style="height:${counts[i]/max*100}%"></div></div><label>${b.label}</label></div>`).join(""):'<p class="empty-state">Complete an interview to see score insights.</p>';
  renderInterviewRows();
}catch(e){$("rows").innerHTML="<tr><td colspan=6>"+safe(e.message)+"</td></tr>"}}
$("refresh").onclick=loadDashboard;
$("search-interviews").addEventListener("input",renderInterviewRows);
$("status-filter").addEventListener("change",renderInterviewRows);
$("export-csv").addEventListener("click",exportInterviews);
setupVoice();health();
