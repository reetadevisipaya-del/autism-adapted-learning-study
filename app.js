if (window.webgazer) {
  window.webgazer.params.faceMeshSolutionPath = "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619";
}

const BUILD = "EV-1.0";
const SCHEMA = "2.0";
const $ = (id) => document.getElementById(id);

const lessons = [
  { title: "Recognising facial emotions", body: `<p class="lead">We can use the eyes, eyebrows and mouth as clues. Look at the whole face before choosing.</p><div class="lesson-panel"><h2>Three useful clues</h2><div class="emotion-cues"><div class="cue"><b>🙂</b><strong>Happy</strong><br><small>Smile, relaxed eyes</small></div><div class="cue"><b>☹</b><strong>Sad</strong><br><small>Downturned mouth, lowered gaze</small></div><div class="cue"><b>😮</b><strong>Surprised</strong><br><small>Raised eyebrows, wide eyes</small></div></div></div>` },
  { title: "Everyday maths", body: `<p class="lead">Read the question, notice the operation, and work one step at a time.</p><div class="lesson-panel"><h2>Example: addition</h2><div class="equation">12 + 7 = 19</div><p>Start at 12 and count forward 7. For percentages, 50% means half.</p></div>` },
  { title: "Clear English", body: `<p class="lead">A sentence shares a complete idea. Context clues help us understand unfamiliar words.</p><div class="lesson-panel"><h2>Example</h2><div class="example-sentence">“Mira carried an umbrella because the sky was dark.”</div><p>The word <strong>because</strong> gives a reason. A synonym is a word with the same or a similar meaning.</p></div>` }
];

const questions = [
  { subject: "Faces", text: "What emotion is this person showing?", image: "happy.png", options: ["Happy", "Angry", "Confused"], answer: "Happy" },
  { subject: "Maths", text: "What is 12 + 7?", options: ["17", "19", "21"], answer: "19" },
  { subject: "English", text: "Choose the word that means the same as ‘quick’.", options: ["Slow", "Fast", "Quiet"], answer: "Fast" },
  { subject: "Faces", text: "What emotion is this person showing?", image: "sad.png", options: ["Excited", "Sad", "Surprised"], answer: "Sad" },
  { subject: "Maths", text: "What is 20 − 8?", options: ["10", "12", "14"], answer: "12" },
  { subject: "English", text: "Which sentence is complete?", options: ["Under the table.", "The dog slept under the table.", "Because the dog."], answer: "The dog slept under the table." },
  { subject: "Faces", text: "What emotion is this person showing?", image: "surprised.png", options: ["Surprised", "Bored", "Sad"], answer: "Surprised" },
  { subject: "Maths", text: "What is half of 18?", options: ["6", "8", "9"], answer: "9" },
  { subject: "English", text: "Which word best completes the sentence: ‘The sun is very ___.’", options: ["bright", "quietly", "jump"], answer: "bright" },
  { subject: "Maths", text: "A notebook costs ₹40. How much do two notebooks cost?", options: ["₹60", "₹80", "₹90"], answer: "₹80" }
];

let state = freshState();
function freshState() {
  return {
    build: BUILD,
    schemaVersion: SCHEMA,
    participantId: "",
    orderGroup: "",
    period: 1,
    studyStage: "pilot",
    condition: "standard",
    webgazerRequested: false,
    eyeTracking: false,
    sessionId: "",
    sessionStartedAt: null,
    activityStartedAt: null,
    phaseStartedAt: 0,
    lesson: 0,
    question: 0,
    answers: [],
    events: [],
    gazeSamples: [],
    lastGazeAt: 0,
    totalSamples: 0,
    validSamples: 0,
    calibration: { attempts: 0, errors: [], meanError: null, medianError: null, status: "not_run" },
    breakStart: null,
    totalBreakMs: 0,
    breakCount: 0,
    assistanceCount: 0,
    finished: false,
    resultSnapshot: null
  };
}

function logEvent(type, data = {}) {
  state.events.push({
    participant_id: state.participantId,
    session_id: state.sessionId,
    session: state.period,
    condition: state.condition,
    event: type,
    timestamp: new Date().toISOString(),
    performance_ms: state.sessionStartedAt ? Math.round(performance.now() - state.sessionStartedAt) : 0,
    lesson: currentView() === "lesson" ? state.lesson + 1 : null,
    question: currentView() === "quiz" ? state.question + 1 : null,
    ...data
  });
}

function show(id) {
  ["researcherView", "participantIntroView", "lessonView", "quizView", "completionView", "researcherResultsView"].forEach((view) => {
    $(view).classList.toggle("hidden", view !== id);
  });
  window.scrollTo({ top: 0, behavior: "auto" });
  $("main").focus();
}

function setMode(mode) {
  $("app").classList.toggle("researcher-mode", mode === "researcher");
  $("app").classList.toggle("participant-mode", mode === "participant");
  $("app").classList.toggle("standard", mode === "participant" && state.condition === "standard");
  $("app").classList.toggle("adapted", mode === "participant" && state.condition === "adapted");
  document.querySelector(".researcher-header").classList.toggle("hidden", mode !== "researcher");
}

function resolveConditionFromOrder() {
  const order = $("studyOrder").value;
  const period = Number($("studyPeriod").value);
  if (!order) return;
  const expected = order === "AS"
    ? (period === 1 ? "standard" : "adapted")
    : (period === 1 ? "adapted" : "standard");
  document.querySelectorAll('input[name="condition"]').forEach((r) => { r.checked = r.value === expected; });
}
$("studyOrder").addEventListener("change", resolveConditionFromOrder);
$("studyPeriod").addEventListener("change", resolveConditionFromOrder);

$("setupForm").addEventListener("submit", (e) => {
  e.preventDefault();
  resolveConditionFromOrder();
  state = freshState();
  state.participantId = $("participantId").value.trim();
  state.orderGroup = $("studyOrder").value;
  state.period = Number($("studyPeriod").value);
  state.studyStage = $("studyStage").value;
  state.condition = document.querySelector('input[name="condition"]:checked').value;
  state.webgazerRequested = $("eyeTrackingConsent").checked;
  state.sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  state.sessionStartedAt = performance.now();
  logEvent("session_configured", { webgazer_requested: state.webgazerRequested, order_group: state.orderGroup });
  setMode("participant");
  show("participantIntroView");
});

$("participantStart").addEventListener("click", () => {
  logEvent("participant_started");
  if (state.webgazerRequested) {
    $("calibrationView").classList.remove("hidden");
  } else {
    beginLessons();
  }
});

$("startCalibration").addEventListener("click", async () => {
  const button = $("startCalibration");
  button.disabled = true;
  $("cameraStatus").textContent = "Starting camera…";
  try {
    if (!window.webgazer) throw new Error("WebGazer did not load");
    await webgazer.saveDataAcrossSessions(false).setRegression("ridge").setGazeListener(onGaze).begin();
    webgazer.showVideoPreview(false).showPredictionPoints(false).applyKalmanFilter(true);
    state.eyeTracking = true;
    state.calibration.attempts += 1;
    logEvent("eye_tracking_started", { attempt: state.calibration.attempts });
    $("calibrationIntro").classList.add("hidden");
    $("calibrationStage").classList.remove("hidden");
    buildCalibration();
  } catch (error) {
    state.eyeTracking = false;
    state.calibration.status = "startup_failed";
    logEvent("eye_tracking_error", { message: String(error?.message || error) });
    $("cameraStatus").textContent = "Eye tracking could not start. Please call the researcher.";
  } finally {
    button.disabled = false;
  }
});

function buildCalibration() {
  const positions = [[8,10],[50,10],[92,10],[8,50],[50,50],[92,50],[8,90],[50,90],[92,90]];
  let total = 0;
  $("calibrationProgress").textContent = "0/27";
  $("calibrationPoints").innerHTML = positions.map((p, i) => `<button class="calibration-point" data-count="0" data-index="${i}" aria-label="Calibration point ${i + 1}" style="left:${p[0]}%;top:${p[1]}%"></button>`).join("");
  $("calibrationPoints").onclick = (e) => {
    const b = e.target.closest(".calibration-point");
    if (!b || b.classList.contains("done")) return;
    const n = Number(b.dataset.count) + 1;
    b.dataset.count = String(n);
    total += 1;
    if (n >= 3) b.classList.add("done");
    $("calibrationProgress").textContent = `${total}/27`;
    if (total >= 27) setTimeout(startValidation, 350);
  };
}

const validationPoints = [[20,20],[80,20],[50,50],[20,80],[80,80]];
let validationIndex = 0;
let validationReadings = [];
let validationBuffer = [];
let collectingValidation = false;

function startValidation() {
  $("calibrationStage").classList.add("hidden");
  $("validationStage").classList.remove("hidden");
  $("validationMessage").classList.add("hidden");
  validationIndex = 0;
  validationReadings = [];
  showValidationPoint();
}

function showValidationPoint() {
  if (validationIndex >= validationPoints.length) return finishValidation();
  const [x, y] = validationPoints[validationIndex];
  const target = $("validationTarget");
  target.style.left = `${x}%`;
  target.style.top = `${y}%`;
  target.classList.remove("hidden");
  validationBuffer = [];
  collectingValidation = false;
  setTimeout(() => { collectingValidation = true; }, 350);
  setTimeout(() => {
    collectingValidation = false;
    const usable = validationBuffer.filter(p => Number.isFinite(p.x) && Number.isFinite(p.y));
    if (usable.length) {
      const avgX = usable.reduce((s,p) => s + p.x, 0) / usable.length;
      const avgY = usable.reduce((s,p) => s + p.y, 0) / usable.length;
      const targetX = innerWidth * x / 100;
      const targetY = innerHeight * y / 100;
      validationReadings.push(Math.hypot(avgX - targetX, avgY - targetY));
    }
    validationIndex += 1;
    showValidationPoint();
  }, 1200);
}

function finishValidation() {
  $("validationTarget").classList.add("hidden");
  const values = validationReadings.filter(Number.isFinite).sort((a,b) => a-b);
  const mean = values.length ? values.reduce((a,b) => a+b, 0) / values.length : null;
  const median = values.length ? values[Math.floor(values.length / 2)] : null;
  state.calibration.errors = values.map(v => Math.round(v));
  state.calibration.meanError = mean == null ? null : Math.round(mean);
  state.calibration.medianError = median == null ? null : Math.round(median);
  const threshold = Math.min(innerWidth, innerHeight) * 0.18;
  const pass = values.length >= 3 && mean != null && mean <= threshold;
  state.calibration.status = pass ? "acceptable" : "recalibrate";
  logEvent("calibration_validated", { status: state.calibration.status, mean_error_px: state.calibration.meanError, median_error_px: state.calibration.medianError, points_valid: values.length });
  $("validationMessage").classList.remove("hidden");
  $("validationHeading").textContent = pass ? "You're ready." : "Let's try that once more.";
  $("validationText").textContent = pass ? "The activity will begin now." : "Please stay comfortably in the same position and look directly at each dot.";
  $("continueAfterValidation").classList.toggle("hidden", !pass);
  $("retryCalibration").classList.toggle("hidden", pass);
}

$("retryCalibration").addEventListener("click", () => {
  state.calibration.attempts += 1;
  logEvent("calibration_retried", { attempt: state.calibration.attempts });
  $("validationStage").classList.add("hidden");
  $("calibrationStage").classList.remove("hidden");
  buildCalibration();
});

$("continueAfterValidation").addEventListener("click", () => {
  $("calibrationView").classList.add("hidden");
  beginLessons();
});

function onGaze(data, elapsedTime) {
  state.totalSamples += 1;
  if (!data || !state.eyeTracking || !Number.isFinite(data.x) || !Number.isFinite(data.y) || document.hidden) return;
  state.validSamples += 1;
  if (collectingValidation) validationBuffer.push({ x: data.x, y: data.y });
  const view = currentView();
  if (view !== "lesson" && view !== "quiz") return;
  const now = performance.now();
  if (now - state.lastGazeAt < 100) return;
  state.lastGazeAt = now;
  state.gazeSamples.push({
    participant_id: state.participantId,
    session_id: state.sessionId,
    session: state.period,
    condition: state.condition,
    view,
    lesson: view === "lesson" ? state.lesson + 1 : null,
    question: view === "quiz" ? state.question + 1 : null,
    timestamp: new Date().toISOString(),
    elapsed_ms: Math.round(elapsedTime || 0),
    x: Math.round(data.x * 100) / 100,
    y: Math.round(data.y * 100) / 100,
    normalized_x: data.x / innerWidth,
    normalized_y: data.y / innerHeight,
    viewport_width: innerWidth,
    viewport_height: innerHeight,
    aoi: classifyAOI(data.x, data.y, view)
  });
}

function classifyAOI(x, y, view) {
  const candidates = view === "quiz"
    ? [["question", "#questionText"], ["stimulus", "#questionVisual"], ["answers", "#answers"], ["navigation", "#nextQuestion"], ["progress", ".question-map"]]
    : [["title", "#lessonTitle"], ["content", "#lessonBody"], ["navigation", "#nextLesson"]];
  for (const [name, selector] of candidates) {
    const el = document.querySelector(selector);
    if (!el) continue;
    const r = el.getBoundingClientRect();
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return name;
  }
  return (x < 0 || y < 0 || x > innerWidth || y > innerHeight) ? "offscreen" : "other";
}

function currentView() {
  if (!$("lessonView").classList.contains("hidden")) return "lesson";
  if (!$("quizView").classList.contains("hidden")) return "quiz";
  return "other";
}

function beginLessons() {
  state.activityStartedAt = performance.now();
  state.phaseStartedAt = performance.now();
  state.lesson = 0;
  $("progressShell").classList.remove("hidden");
  $("pauseSession").classList.remove("hidden");
  logEvent("activity_started");
  show("lessonView");
  renderLesson();
}

function renderLesson() {
  const lesson = lessons[state.lesson];
  state.phaseStartedAt = performance.now();
  $("lessonKicker").textContent = `Lesson ${state.lesson + 1} of ${lessons.length}`;
  $("lessonTitle").textContent = lesson.title;
  $("lessonBody").innerHTML = lesson.body;
  $("nextLesson").innerHTML = state.lesson === lessons.length - 1 ? 'Start questions <span aria-hidden="true">→</span>' : 'Next lesson <span aria-hidden="true">→</span>';
  setProgress((state.lesson + 1) / 4, `Lesson ${state.lesson + 1} of ${lessons.length}`);
  logEvent("lesson_presented", { lesson_number: state.lesson + 1 });
}

$("nextLesson").addEventListener("click", () => {
  logEvent("lesson_completed", { lesson_number: state.lesson + 1, duration_ms: adjustedPhaseDuration() });
  state.lesson += 1;
  if (state.lesson < lessons.length) renderLesson();
  else {
    state.question = 0;
    show("quizView");
    renderQuestion();
  }
});

function renderQuestion() {
  const q = questions[state.question];
  state.phaseStartedAt = performance.now();
  $("subjectPill").textContent = q.subject;
  $("questionCount").textContent = `Question ${state.question + 1} of ${questions.length}`;
  $("questionText").textContent = q.text;
  $("questionVisual").innerHTML = q.image ? `<img class="face-stimulus" src="${q.image}" alt="A person showing an emotion" />` : "";
  $("answers").innerHTML = q.options.map((o, i) => `<label class="answer-option"><input type="radio" name="answer" value="${escapeHtml(o)}"><span>${String.fromCharCode(65 + i)}. ${escapeHtml(o)}</span></label>`).join("");
  $("answerMessage").classList.add("hidden");
  $("nextQuestion").disabled = true;
  $("nextQuestion").innerHTML = state.question === questions.length - 1 ? 'Finish activity <span aria-hidden="true">→</span>' : 'Next question <span aria-hidden="true">→</span>';
  $("answers").onchange = chooseAnswer;
  renderDots();
  setProgress((3 + ((state.question + 1) / questions.length)) / 4, `Question ${state.question + 1} of ${questions.length}`);
  logEvent("question_presented", { question_number: state.question + 1, subject: q.subject });
}

function chooseAnswer(e) {
  document.querySelectorAll(".answer-option").forEach(x => x.classList.remove("selected"));
  e.target.closest(".answer-option").classList.add("selected");
  $("nextQuestion").disabled = false;
  $("answerMessage").textContent = "Answer recorded.";
  $("answerMessage").classList.remove("hidden");
}

$("nextQuestion").addEventListener("click", () => {
  const selected = document.querySelector('input[name="answer"]:checked');
  if (!selected) return;
  const q = questions[state.question];
  const response = {
    participant_id: state.participantId,
    session_id: state.sessionId,
    session: state.period,
    condition: state.condition,
    question: state.question + 1,
    subject: q.subject,
    response: selected.value,
    correct: selected.value === q.answer,
    response_ms: adjustedPhaseDuration()
  };
  state.answers.push(response);
  logEvent("answer_submitted", { question_number: state.question + 1, subject: q.subject, correct: response.correct, response_ms: response.response_ms });
  state.question += 1;
  if (state.question < questions.length) renderQuestion();
  else finishSession();
});

function adjustedPhaseDuration() {
  return Math.max(0, Math.round(performance.now() - state.phaseStartedAt));
}

$("pauseSession").addEventListener("click", async () => {
  if (state.breakStart == null) {
    state.breakStart = performance.now();
    state.breakCount += 1;
    logEvent("break_started", { break_number: state.breakCount });
    $("pauseSession").textContent = "Resume activity";
    document.body.classList.add("study-paused");
    if (state.eyeTracking && window.webgazer) webgazer.pause();
  } else {
    const duration = performance.now() - state.breakStart;
    state.totalBreakMs += duration;
    logEvent("break_ended", { break_number: state.breakCount, duration_ms: Math.round(duration) });
    state.breakStart = null;
    $("pauseSession").textContent = "Pause for a break";
    document.body.classList.remove("study-paused");
    if (state.eyeTracking && window.webgazer) await webgazer.resume();
  }
});

async function finishSession() {
  if (state.finished) return;
  state.finished = true;
  if (state.breakStart != null) {
    state.totalBreakMs += performance.now() - state.breakStart;
    state.breakStart = null;
  }
  if (state.eyeTracking && window.webgazer) webgazer.pause();
  $("progressShell").classList.add("hidden");
  $("pauseSession").classList.add("hidden");
  state.resultSnapshot = sessionSnapshot();
  saveLocal(state.resultSnapshot);
  show("completionView");
  logEvent("session_completed");
  setTimeout(() => enableResearcherUnlock(), 500);
}

function enableResearcherUnlock() {
  const unlock = (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "r") {
      document.removeEventListener("keydown", unlock);
      openResearcherResults();
    }
  };
  document.addEventListener("keydown", unlock);
}

function openResearcherResults() {
  setMode("researcher");
  const snapshot = state.resultSnapshot || sessionSnapshot();
  const quality = snapshot.gaze_valid_percentage == null ? "Not recorded" : `${snapshot.gaze_valid_percentage.toFixed(1)}%`;
  $("researcherSummary").innerHTML = [
    ["Participant", snapshot.participant_id],
    ["Session", snapshot.session],
    ["Condition", snapshot.condition === "adapted" ? "Autism-adapted" : "Conventional"],
    ["Calibration", snapshot.calibration_status],
    ["Mean validation error", snapshot.calibration_mean_error_px == null ? "—" : `${snapshot.calibration_mean_error_px} px`],
    ["Valid gaze samples", quality],
    ["Breaks", snapshot.break_count],
    ["Correct responses", `${snapshot.score}/${questions.length}`]
  ].map(([k,v]) => `<div class="summary-item"><span>${k}</span><strong>${v}</strong></div>`).join("");
  $("saveStatus").textContent = "Session is stored locally in this browser. Download the CSV files before clearing browser data.";
  show("researcherResultsView");
}

function sessionSnapshot() {
  const now = performance.now();
  const rawDuration = state.activityStartedAt ? now - state.activityStartedAt : 0;
  const activeBreak = state.breakStart == null ? 0 : now - state.breakStart;
  const breakMs = state.totalBreakMs + activeBreak;
  const score = state.answers.filter(a => a.correct).length;
  return {
    schema_version: SCHEMA,
    build: BUILD,
    participant_id: state.participantId,
    session_id: state.sessionId,
    order_group: state.orderGroup,
    session: state.period,
    study_stage: state.studyStage,
    condition: state.condition,
    completed_at: new Date().toISOString(),
    raw_duration_ms: Math.round(rawDuration),
    break_duration_ms: Math.round(breakMs),
    adjusted_duration_ms: Math.max(0, Math.round(rawDuration - breakMs)),
    break_count: state.breakCount,
    assistance_count: state.assistanceCount,
    score,
    incorrect: state.answers.length - score,
    eye_tracking_requested: state.webgazerRequested,
    eye_tracking_enabled: state.eyeTracking,
    calibration_attempts: state.calibration.attempts,
    calibration_status: state.calibration.status,
    calibration_mean_error_px: state.calibration.meanError,
    calibration_median_error_px: state.calibration.medianError,
    gaze_total_samples: state.totalSamples,
    gaze_valid_samples: state.validSamples,
    gaze_valid_percentage: state.totalSamples ? (state.validSamples / state.totalSamples) * 100 : null,
    viewport_width: innerWidth,
    viewport_height: innerHeight,
    answers: state.answers,
    events: state.events,
    gaze_samples: state.gazeSamples
  };
}

function saveLocal(snapshot) {
  const key = "adaptiveLearningStudySessions";
  const sessions = JSON.parse(localStorage.getItem(key) || "[]");
  sessions.push(snapshot);
  localStorage.setItem(key, JSON.stringify(sessions));
}

$("downloadCsv").addEventListener("click", () => {
  const snapshot = state.resultSnapshot || sessionSnapshot();
  downloadCSV(`session-${safe(state.participantId)}-${state.period}.csv`, [flattenSession(snapshot)]);
  downloadCSV(`responses-${safe(state.participantId)}-${state.period}.csv`, snapshot.answers);
  downloadCSV(`events-${safe(state.participantId)}-${state.period}.csv`, snapshot.events);
  downloadCSV(`gaze-${safe(state.participantId)}-${state.period}.csv`, snapshot.gaze_samples);
  $("saveStatus").textContent = "Four CSV downloads started: session, responses, events and gaze.";
});

function flattenSession(s) {
  const { answers, events, gaze_samples, ...flat } = s;
  return flat;
}

function downloadCSV(filename, rows) {
  if (!rows || !rows.length) rows = [{}];
  const headers = [...new Set(rows.flatMap(r => Object.keys(r)))];
  const csv = [headers.join(","), ...rows.map(r => headers.map(h => csvCell(r[h])).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function csvCell(value) {
  const text = value == null ? "" : typeof value === "object" ? JSON.stringify(value) : String(value);
  return `"${text.replaceAll('"','""')}"`;
}

$("newParticipant").addEventListener("click", () => {
  if (window.webgazer) {
    try { webgazer.end(); } catch (_) {}
  }
  state = freshState();
  setMode("researcher");
  $("setupForm").reset();
  $("eyeTrackingConsent").checked = true;
  $("calibrationIntro").classList.remove("hidden");
  $("calibrationStage").classList.add("hidden");
  $("validationStage").classList.add("hidden");
  $("cameraStatus").textContent = "";
  show("researcherView");
});

function setProgress(v, label) {
  const pct = Math.max(0, Math.min(100, Math.round(v * 100)));
  $("progressBar").style.width = `${pct}%`;
  $("percentLabel").textContent = `${pct}%`;
  $("stepLabel").textContent = label;
}

function renderDots() {
  $("questionDots").className = "question-dots";
  $("questionDots").innerHTML = questions.map((_, i) => `<span class="dot ${i < state.question ? "done" : i === state.question ? "current" : ""}">${i < state.question ? "✓" : i + 1}</span>`).join("");
}

function escapeHtml(s) {
  return s.replace(/[&<>'"]/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", "'":"&#39;", '"':"&quot;" }[c]));
}
function safe(s) { return String(s || "participant").replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 40); }

setMode("researcher");
show("researcherView");
