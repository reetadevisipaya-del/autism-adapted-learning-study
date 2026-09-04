// WebGazer's default relative model folder is not part of this static site.
// Pin a cross-origin-enabled host for the MediaPipe files before begin().
if (window.webgazer) {
  window.webgazer.params.faceMeshSolutionPath = "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619";
}
const lessons=[
 {title:"Recognising facial emotions",body:`<p class="lead">We can use the eyes, eyebrows and mouth as clues. Look at the whole face before choosing.</p><div class="lesson-panel"><h2>Three useful clues</h2><div class="emotion-cues"><div class="cue"><b>🙂</b><strong>Happy</strong><br><small>Smile, relaxed eyes</small></div><div class="cue"><b>☹</b><strong>Sad</strong><br><small>Downturned mouth, lowered gaze</small></div><div class="cue"><b>😮</b><strong>Surprised</strong><br><small>Raised eyebrows, wide eyes</small></div></div></div>`},
 {title:"Everyday maths",body:`<p class="lead">Read the question, notice the operation, and work one step at a time.</p><div class="lesson-panel"><h2>Example: addition</h2><div class="equation">12 + 7 = 19</div><p>Start at 12 and count forward 7. For percentages, 50% means half.</p></div>`},
 {title:"Clear English",body:`<p class="lead">A sentence shares a complete idea. Context clues help us understand unfamiliar words.</p><div class="lesson-panel"><h2>Example</h2><div class="example-sentence">“Mira carried an umbrella because the sky was dark.”</div><p>The word <strong>because</strong> gives a reason. A synonym is a word with the same or a similar meaning.</p></div>`}
];
const questions=[
 {subject:"Faces",text:"What emotion is this person showing?",image:"happy.png",options:["Happy","Angry","Confused"],answer:"Happy"},
 {subject:"Maths",text:"What is 12 + 7?",options:["17","19","21"],answer:"19"},
 {subject:"English",text:"Choose the word that means the same as ‘quick’.",options:["Slow","Fast","Quiet"],answer:"Fast"},
 {subject:"Faces",text:"What emotion is this person showing?",image:"sad.png",options:["Excited","Sad","Surprised"],answer:"Sad"},
 {subject:"Maths",text:"What is 20 − 8?",options:["10","12","14"],answer:"12"},
 {subject:"English",text:"Which sentence is complete?",options:["Under the table.","The dog slept under the table.","Because the dog."],answer:"The dog slept under the table."},
 {subject:"Faces",text:"What emotion is this person showing?",image:"surprised.png",options:["Surprised","Bored","Sad"],answer:"Surprised"},
 {subject:"Maths",text:"What is half of 18?",options:["6","8","9"],answer:"9"},
 {subject:"English",text:"Which word best completes the sentence: ‘The sun is very ___.’",options:["bright","quietly","jump"],answer:"bright"},
 {subject:"Maths",text:"A notebook costs ₹40. How much do two notebooks cost?",options:["₹60","₹80","₹90"],answer:"₹80"}
];
const $=id=>document.getElementById(id);let state={condition:"adapted",participantId:"",lesson:0,question:0,answers:[],startedAt:0,phaseStartedAt:0,changes:0,sessionId:"",eyeTracking:false,gazeSamples:[],lastGazeAt:0};
document.querySelectorAll('input[name="condition"]').forEach(r=>r.addEventListener("change",e=>{document.querySelectorAll(".condition-card").forEach(x=>x.classList.remove("selected"));e.target.closest(".condition-card").classList.add("selected");document.querySelectorAll(".choice-check").forEach(x=>x.textContent="Select");e.target.closest(".condition-card").querySelector(".choice-check").textContent="Selected";}));
$("setupForm").addEventListener("submit",e=>{e.preventDefault();state.condition=document.querySelector('input[name="condition"]:checked').value;state.participantId=$("participantId").value.trim();state.startedAt=performance.now();state.phaseStartedAt=performance.now();state.sessionId=`${Date.now()}-${Math.random().toString(36).slice(2,8)}`;$("app").className=`app ${state.condition}`;$("conditionBadge").textContent=state.condition==="adapted"?"Autism-adapted interface":"Standard interface";recordEvent("session_started",{condition:state.condition,eye_tracking_requested:$("eyeTrackingConsent").checked});if($("eyeTrackingConsent").checked){$("calibrationView").classList.remove("hidden")}else beginLessons();});
function beginLessons(){show("lessonView");$("progressShell").classList.remove("hidden");state.phaseStartedAt=performance.now();renderLesson()}
$("skipCalibration").addEventListener("click",()=>{$("calibrationView").classList.add("hidden");recordEvent("eye_tracking_skipped",{});beginLessons()});
$("startCalibration").addEventListener("click",async()=>{const button=$("startCalibration");let stage="Loading eye-tracking software";button.disabled=true;try{if(!window.webgazer)throw new Error("Tracker did not load");stage="Starting the camera and eye-tracking model";$("cameraStatus").textContent=stage+"…";webgazer.showVideoPreview(false);await webgazer.saveDataAcrossSessions(false).setRegression("ridge").setGazeListener(onGaze).begin();stage="Setting up camera preview";webgazer.showVideoPreview(false).showPredictionPoints(false).applyKalmanFilter(true);stage="Preparing calibration";state.eyeTracking=true;buildCalibration();$("calibrationIntro").classList.add("hidden");$("calibrationStage").classList.remove("hidden")}catch(error){state.eyeTracking=false;$("calibrationIntro").classList.remove("hidden");$("calibrationStage").classList.add("hidden");const name=error?.name||"Error",message=String(error?.message||error||"No error details supplied");$("cameraStatus").style.whiteSpace="pre-wrap";$("cameraStatus").setAttribute("role","alert");$("cameraStatus").textContent=`Eye tracking could not start.\nStep: ${stage}\nDetails: ${name}: ${message}\n\n${trackingErrorHelp(name,message)}\nYou can continue without eye tracking. Please send the researcher a screenshot of these details.`;console.error("Eye tracking startup failed:",stage,error);try{recordEvent("eye_tracking_error",{name,message,stage})}catch(logError){console.warn("Could not save diagnostic",logError)}}finally{button.disabled=false;button.textContent="Allow camera & start"}});
function trackingErrorHelp(name,message){if(name==="NotAllowedError"||name==="SecurityError")return"The browser or system blocked access. Check this site's camera permission and your device's camera privacy settings.";if(name==="NotFoundError")return"No compatible camera was found. Check that the camera is connected and enabled.";if(name==="NotReadableError"||name==="AbortError")return"The camera could not be started. Close other video-call apps and try again.";if(name==="OverconstrainedError")return"The camera does not support the requested settings. Send the details below to the researcher.";if(/tracker did not load|fetch|network|load/i.test(message))return"Eye-tracking software or model files may not have loaded. Check your internet connection, reload the page, and try again.";return"This may be an eye-tracking software error, rather than a webcam problem. The details above will help the researcher identify it.";}
function buildCalibration(){const positions=[[8,10],[50,10],[92,10],[8,50],[50,50],[92,50],[8,90],[50,90],[92,90]];let total=0;$("calibrationPoints").innerHTML=positions.map((p,i)=>`<button class="calibration-point" data-count="0" data-index="${i}" aria-label="Calibration point ${i+1}" style="left:${p[0]}%;top:${p[1]}%"></button>`).join("");$("calibrationPoints").addEventListener("click",e=>{const b=e.target.closest(".calibration-point");if(!b)return;const n=Number(b.dataset.count)+1;b.dataset.count=n;total++;b.style.transform=`translate(-50%,-50%) scale(${1+n*.12})`;if(n===3)b.classList.add("done");$("calibrationProgress").textContent=`${total}/27`;if(total===27)setTimeout(finishCalibration,450)})}
function finishCalibration(){webgazer.showVideoPreview(false).showPredictionPoints(false);$("calibrationView").classList.add("hidden");$("gazeDot").classList.add("hidden");recordEvent("eye_tracking_calibrated",{});beginLessons()}
function onGaze(data){
  if(!data||!state.eyeTracking||!Number.isFinite(data.x)||!Number.isFinite(data.y)||document.hidden)return;
  const view=currentView();
  if(view!=="lesson"&&view!=="quiz")return;
  const now=performance.now();if(now-state.lastGazeAt<100)return;state.lastGazeAt=now;
  state.gazeSamples.push({t:Math.round(now-state.startedAt),x:Math.round(data.x),y:Math.round(data.y),view,q:view==="quiz"?state.question+1:null,lesson:view==="lesson"?state.lesson+1:null,width:innerWidth,height:innerHeight,scroll_x:scrollX,scroll_y:scrollY});
}
function currentView(){if(!$("quizView").classList.contains("hidden"))return"quiz";if(!$("lessonView").classList.contains("hidden"))return"lesson";return"other"}
function gazeSummary(){const s={samples:state.gazeSamples.length,top:0,middle:0,bottom:0,offscreen:0};state.gazeSamples.forEach(g=>{const w=g.width||innerWidth,h=g.height||innerHeight;if(g.x<0||g.y<0||g.x>=w||g.y>=h)s.offscreen++;else if(g.y<h/3)s.top++;else if(g.y<h*2/3)s.middle++;else s.bottom++});return s}
$("nextLesson").addEventListener("click",()=>{recordEvent("lesson_completed",{lesson:state.lesson+1,duration_ms:Math.round(performance.now()-state.phaseStartedAt)});state.lesson++;state.phaseStartedAt=performance.now();if(state.lesson<lessons.length)renderLesson();else{state.question=0;show("quizView");renderQuestion();}});
function renderLesson(){const l=lessons[state.lesson];$("lessonKicker").textContent=`Lesson ${state.lesson+1} of 3`;$("lessonTitle").textContent=l.title;$("lessonBody").innerHTML=l.body;$("nextLesson").innerHTML=state.lesson===2?'Start the test <span aria-hidden="true">→</span>':'Next lesson <span aria-hidden="true">→</span>';setProgress((state.lesson+1)/4,`Lesson ${state.lesson+1} of 3`);focusMain();}
function renderQuestion(){const q=questions[state.question];state.phaseStartedAt=performance.now();state.changes=0;$("subjectPill").textContent=q.subject;$("questionCount").textContent=`Question ${state.question+1} of 10`;$("questionText").textContent=q.text;$("questionVisual").innerHTML=q.image?`<img class="face-stimulus" src="${q.image}" alt="A person showing an emotion" />`:"";$("answers").innerHTML=q.options.map((o,i)=>`<label class="answer-option"><input type="radio" name="answer" value="${escapeHtml(o)}"><span>${String.fromCharCode(65+i)}. ${escapeHtml(o)}</span></label>`).join("");$("answerMessage").classList.add("hidden");$("nextQuestion").disabled=true;$("nextQuestion").innerHTML=state.question===9?'See results <span aria-hidden="true">→</span>':'Continue <span aria-hidden="true">→</span>';$("answers").addEventListener("change",chooseAnswer);renderDots();setProgress((3+((state.question+1)/10))/4,`Test · Question ${state.question+1} of 10`);focusMain();}
function chooseAnswer(e){state.changes++;document.querySelectorAll(".answer-option").forEach(x=>x.classList.remove("selected"));e.target.closest(".answer-option").classList.add("selected");$("nextQuestion").disabled=false;const q=questions[state.question],correct=e.target.value===q.answer;$("answerMessage").textContent=correct?"Answer recorded. You can continue.":"Answer recorded. You can still continue.";$("answerMessage").classList.remove("hidden");}
$("nextQuestion").addEventListener("click",()=>{const selected=document.querySelector('input[name="answer"]:checked');if(!selected)return;const q=questions[state.question];state.answers.push({question:state.question+1,subject:q.subject,response:selected.value,correct:selected.value===q.answer,response_ms:Math.round(performance.now()-state.phaseStartedAt),answer_changes:Math.max(0,state.changes-1)});recordEvent("answer_submitted",state.answers.at(-1));state.question++;if(state.question<questions.length)renderQuestion();else finish();});
async function finish(){const ended=performance.now(),score=state.answers.filter(a=>a.correct).length,summary=gazeSummary();if(state.eyeTracking&&window.webgazer){webgazer.pause();$("gazeDot").classList.add("hidden")}const session={session_id:state.sessionId,participant_id:state.participantId,condition:state.condition,started_at:new Date(Date.now()-(ended-state.startedAt)).toISOString(),completed_at:new Date().toISOString(),completed:true,total_duration_ms:Math.round(ended-state.startedAt),score,incorrect:10-score,answers:state.answers,user_agent:navigator.userAgent,viewport:`${innerWidth}x${innerHeight}`,eye_tracking:state.eyeTracking,gaze_summary:summary,gaze_samples:state.gazeSamples};await saveSession(session);show("resultsView");$("progressShell").classList.add("hidden");$("scoreValue").textContent=$("correctValue").textContent=score;$("incorrectValue").textContent=10-score;$("scoreBar").style.width=`${score*10}%`;$("saveStatus").textContent=`Saved locally at ${new Date().toLocaleTimeString()}${state.eyeTracking?` · ${summary.samples} gaze samples`:""}`;focusMain();}
function setProgress(v,label){$("progressBar").style.width=`${Math.round(v*100)}%`;$("percentLabel").textContent=`${Math.round(v*100)}%`;$("stepLabel").textContent=label}function renderDots(){$("questionDots").className="question-dots";$("questionDots").innerHTML=questions.map((_,i)=>`<span class="dot ${i<state.question?'done':i===state.question?'current':''}">${i<state.question?'✓':i+1}</span>`).join("")}function show(id){["setupView","lessonView","quizView","resultsView"].forEach(x=>$(x).classList.toggle("hidden",x!==id))}function focusMain(){scrollTo({top:0,behavior:state.condition==="adapted"?"auto":"smooth"});$("main").focus()}function escapeHtml(s){return s.replace(/[&<>'"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]))}
function db(){return new Promise((resolve,reject)=>{const r=indexedDB.open("codexLearnStudy",1);r.onupgradeneeded=()=>r.result.createObjectStore("sessions",{keyPath:"session_id"});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}async function saveSession(s){const d=await db();return new Promise((resolve,reject)=>{const t=d.transaction("sessions","readwrite");t.objectStore("sessions").put(s);t.oncomplete=resolve;t.onerror=()=>reject(t.error)})}async function allSessions(){const d=await db();return new Promise((resolve,reject)=>{const r=d.transaction("sessions").objectStore("sessions").getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}function recordEvent(type,data){const log=JSON.parse(sessionStorage.getItem("codexEvents")||"[]");log.push({session_id:state.sessionId,type,at:new Date().toISOString(),...data});sessionStorage.setItem("codexEvents",JSON.stringify(log))}
$("downloadCsv").addEventListener("click",async()=>{const sessions=await allSessions(),rows=[["session_id","participant_id","condition","started_at","completed_at","completed","total_duration_ms","score","incorrect","question","subject","response","correct","response_ms","answer_changes","viewport","eye_tracking","gaze_samples","gaze_top","gaze_middle","gaze_bottom","gaze_offscreen"]];sessions.forEach(s=>s.answers.forEach(a=>rows.push([s.session_id,s.participant_id,s.condition,s.started_at,s.completed_at,s.completed,s.total_duration_ms,s.score,s.incorrect,a.question,a.subject,a.response,a.correct,a.response_ms,a.answer_changes,s.viewport,s.eye_tracking||false,s.gaze_summary?.samples||0,s.gaze_summary?.top||0,s.gaze_summary?.middle||0,s.gaze_summary?.bottom||0,s.gaze_summary?.offscreen||0])));const csv=rows.map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\r\n"),url=URL.createObjectURL(new Blob([csv],{type:"text/csv"})),a=document.createElement("a");a.href=url;a.download=`adaptive-learning-study-data-${new Date().toISOString().slice(0,10)}.csv`;a.click();URL.revokeObjectURL(url)});$("newParticipant").addEventListener("click",()=>location.reload());$("soundToggle").addEventListener("click",e=>{const on=e.currentTarget.getAttribute("aria-pressed")==="true";e.currentTarget.setAttribute("aria-pressed",String(!on));e.currentTarget.textContent=on?"Sound off":"Sound on"});
addEventListener("beforeunload",()=>{if(state.sessionId&&state.answers.length<10)recordEvent("session_abandoned",{last_question:state.question+1,answers_completed:state.answers.length})});

// Keep both gaze markers invisible. Recording continues without a visual cue.
const gazeVisibilityStyle=document.createElement("style");
gazeVisibilityStyle.textContent="#gazeDot,#webgazerGazeDot{display:none!important;pointer-events:none!important}";
document.head.appendChild(gazeVisibilityStyle);
if(window.webgazer)webgazer.showPredictionPoints(false);

const excelButton=document.createElement("button");
excelButton.id="downloadExcel";excelButton.type="button";excelButton.className="secondary-button";
excelButton.textContent="Download this session Excel + gaze diagram";
$("downloadCsv").parentElement.appendChild(excelButton);
let excelLoadPromise;
function loadExcelLibrary(){
  if(window.ExcelJS)return Promise.resolve(window.ExcelJS);
  if(excelLoadPromise)return excelLoadPromise;
  excelLoadPromise=new Promise((resolve,reject)=>{
    const script=document.createElement("script");
    const timer=setTimeout(()=>fail(),30000);
    function fail(){clearTimeout(timer);script.remove();excelLoadPromise=null;reject(new Error("Excel export software could not load. Check your connection and try again. CSV export is still available."));}
    script.src="https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js";
    script.onload=()=>{clearTimeout(timer);if(window.ExcelJS)resolve(window.ExcelJS);else fail();};
    script.onerror=fail;document.head.appendChild(script);
  });
  return excelLoadPromise;
}

function reportGaze(session){
  const fallback=String(session.viewport||"").split("x").map(Number);
  return (session.gaze_samples||[]).filter(g=>["lesson","quiz"].includes(g.view)).map(g=>{
    const w=g.width||fallback[0],h=g.height||fallback[1];
    const valid=Number.isFinite(g.x)&&Number.isFinite(g.y)&&w>0&&h>0;
    return {...g,width:w,height:h,nx:valid?g.x/w:null,ny:valid?g.y/h:null,on_screen:valid&&g.x>=0&&g.y>=0&&g.x<w&&g.y<h};
  });
}

function gazeDensityImage(samples){
  const canvas=document.createElement("canvas");canvas.width=1200;canvas.height=680;
  const ctx=canvas.getContext("2d");if(!ctx)throw new Error("This browser cannot draw the gaze diagram.");
  ctx.fillStyle="#ffffff";ctx.fillRect(0,0,1200,680);
  ctx.fillStyle="#17352f";ctx.font="bold 28px Arial";ctx.fillText("Estimated gaze density",42,42);
  ctx.font="17px Arial";ctx.fillText("Darker cells contain more recorded samples. Calibration and off-screen samples are excluded.",42,74);
  ["lesson","quiz"].forEach((phase,panel)=>{
    const x=65+panel*595,y=165,w=480,h=360,cols=20,rows=15;
    const selected=samples.filter(g=>g.view===phase&&g.on_screen),bins=Array(cols*rows).fill(0);
    selected.forEach(g=>bins[Math.floor(g.ny*rows)*cols+Math.floor(g.nx*cols)]++);
    const max=Math.max(0,...bins);
    ctx.fillStyle="#17352f";ctx.font="bold 23px Arial";ctx.fillText(phase==="lesson"?"Lessons":"Test",x,y-50);
    ctx.font="16px Arial";ctx.fillText(`${selected.length} on-screen samples`,x,y-24);
    for(let row=0;row<rows;row++)for(let col=0;col<cols;col++){
      const fraction=max?bins[row*cols+col]/max:0;
      const light=[240,245,243],dark=[32,105,94];
      ctx.fillStyle=`rgb(${light.map((v,i)=>Math.round(v+(dark[i]-v)*fraction)).join(",")})`;
      ctx.fillRect(x+col*w/cols,y+row*h/rows,w/cols,h/rows);
    }
    ctx.strokeStyle="#48635a";ctx.lineWidth=1;ctx.strokeRect(x,y,w,h);
    ctx.fillStyle="#17352f";ctx.font="15px Arial";
    ctx.fillText("0%",x-8,y+h+24);ctx.fillText("50%",x+w/2-15,y+h+24);ctx.fillText("100%",x+w-30,y+h+24);
    ctx.fillText("0%",x-34,y+5);ctx.fillText("50%",x-40,y+h/2+5);ctx.fillText("100%",x-45,y+h);
    ctx.fillText("Horizontal position in browser viewport",x+85,y+h+50);
    ctx.fillText(`Cell scale: 0 to ${max} samples (separate scale per panel)`,x,y+h+78);
    if(!selected.length){ctx.font="bold 20px Arial";ctx.fillText("No recorded on-screen gaze samples",x+52,y+h/2);}
  });
  ctx.fillStyle="#526960";ctx.font="16px Arial";
  ctx.fillText("Top-left origin. Screen positions are normalised; this is not a page-content overlay or a fixation map.",42,640);
  return canvas.toDataURL("image/png");
}

function excelTable(book,name,headers,rows,widths){
  const sheet=book.addWorksheet(name);sheet.addRow(headers);rows.forEach(row=>sheet.addRow(row));
  sheet.views=[{state:"frozen",ySplit:1}];
  headers.forEach((header,i)=>{sheet.getColumn(i+1).width=widths[i]||20;});
  sheet.getRow(1).height=34;
  sheet.getRow(1).eachCell(cell=>{cell.font={name:"Calibri",size:12,bold:true,color:{argb:"FFFFFFFF"}};cell.fill={type:"pattern",pattern:"solid",fgColor:{argb:"FF24685A"}};cell.alignment={vertical:"middle",wrapText:true};});
  if(rows.length)sheet.autoFilter={from:{row:1,column:1},to:{row:rows.length+1,column:headers.length}};
  return sheet;
}

async function buildSessionWorkbook(session,ExcelJS){
  const book=new ExcelJS.Workbook();book.creator="Adaptive Learning Study";
  const samples=reportGaze(session),onScreen=samples.filter(g=>g.on_screen).length;
  const summary=excelTable(book,"Session",["Measure","Value"],[
    ["Participant ID",session.participant_id],["Session ID",session.session_id],
    ["Interface",session.condition],["Started (UTC)",session.started_at],
    ["Completed (UTC)",session.completed_at],["Completed",Boolean(session.completed)],
    ["Correct responses",session.score],["Incorrect responses",session.incorrect],
    ["Total duration (ms)",session.total_duration_ms],["Eye tracking enabled",Boolean(session.eye_tracking)],
    ["Lesson/test gaze samples",samples.length],["On-screen samples",onScreen],
    ["Off-screen/invalid samples",samples.length-onScreen],
    ["Diagram type","Sample-density image; not fixation duration or attention scoring"],
    ["Sampling","At most 10 samples/second; actual intervals vary"],
    ["Scope","This completed session only; use CSV for all local sessions"],
    ["Privacy","No camera images in this file. Gaze coordinates remain sensitive research data."],
    ["Timing","Milliseconds since session start, including calibration/setup"],
    ["Coordinate origin","Top left of browser viewport; width/height are stored per sample"],
    ["Diagram exclusions","Calibration, hidden-tab samples and off-screen coordinates"],
    ["Interpretation","Screen position is not the same as attention to a specific element"],
    ["Source","WebGazer estimates recorded on this participant device"],
    ["Method reference","https://webgazer.cs.brown.edu/"],
  ],[32,92]);
  summary.getColumn(2).alignment={wrapText:true,vertical:"top"};
  for(let row=15;row<=24;row++)summary.getRow(row).height=32;
  excelTable(book,"Responses",["Question","Subject","Response","Correct","Response time (ms)","Answer changes"],
    (session.answers||[]).map(a=>[a.question,a.subject,a.response,a.correct,a.response_ms,a.answer_changes]),[12,18,48,12,23,20]);
  const gaze=excelTable(book,"Gaze samples",["Time (ms)","Phase","Lesson","Question","X (px)","Y (px)","Viewport width","Viewport height","X fraction","Y fraction","On screen","Scroll X (px)","Scroll Y (px)"],
    samples.map(g=>[g.t,g.view,g.lesson??null,g.view==="quiz"?g.q:null,g.x,g.y,g.width,g.height,g.nx,g.ny,g.on_screen,g.scroll_x??null,g.scroll_y??null]),[17,15,12,12,15,15,20,20,16,16,15,18,18]);
  gaze.getColumn(9).numFmt="0.0000";gaze.getColumn(10).numFmt="0.0000";
  const diagram=book.addWorksheet("Gaze pattern");
  diagram.getColumn(1).width=145;
  diagram.getCell("A1").value="Gaze pattern — this session";
  diagram.getCell("A1").font={name:"Calibri",size:18,bold:true,color:{argb:"FF17352F"}};
  diagram.getRow(1).height=30;
  diagram.getCell("A2").value="Estimated sample density during lessons and test. Darker cells mean more samples, not longer validated fixations.";
  diagram.getCell("A2").alignment={wrapText:true};diagram.getRow(2).height=32;
  const imageId=book.addImage({base64:gazeDensityImage(samples),extension:"png"});
  diagram.addImage(imageId,{tl:{col:0,row:3},ext:{width:960,height:544}});
  return book;
}

excelButton.addEventListener("click",async()=>{
  excelButton.disabled=true;$("saveStatus").textContent="Preparing Excel report…";
  try{
    const sessions=await allSessions(),session=sessions.find(s=>s.session_id===state.sessionId);
    if(!session)throw new Error("No saved completed session was found. Finish the test first.");
    const ExcelJS=await loadExcelLibrary();
    const workbook=await buildSessionWorkbook(session,ExcelJS);
    const buffer=await workbook.xlsx.writeBuffer();
    const url=URL.createObjectURL(new Blob([buffer],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}));
    const a=document.createElement("a");a.href=url;
    const safeId=String(session.participant_id||"participant").replace(/[^a-zA-Z0-9_-]/g,"_").slice(0,40);
    a.download=`learning-study-${safeId}-${session.session_id}.xlsx`;
    document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
    $("saveStatus").textContent="Excel report download started. It includes responses, gaze coordinates and the gaze diagram. Data stays on this device.";
  }catch(error){$("saveStatus").textContent=`Excel download failed: ${error.message||error}`;}
  finally{excelButton.disabled=false;}
});
