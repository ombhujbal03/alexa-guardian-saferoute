/**
 * Alexa+ Guardian SafeRoute - Frontend Controller
 * Echo Show 15 Multimodal Simulator & Live FastMCP Inspector
 */

let isTtsEnabled = true;
let isListening = false;
let currentSpeechUtterance = null;
let lastAlexaSpeechText = "";
let recognition = null;
let rawPayloadData = null;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  initClock();
  initHealthCheck();
  initSpeechRecognition();
  initTtsControls();
});

// ----------------------------------------------------------------------------
// 1. Clock & Health Check
// ----------------------------------------------------------------------------
function initClock() {
  const clockEl = document.getElementById('current-clock');
  const update = () => {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };
  update();
  setInterval(update, 1000);
}

async function initHealthCheck() {
  const dot = document.getElementById('mcp-status-dot');
  const text = document.getElementById('mcp-status-text');

  const check = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        if (data.mcp_server && data.mcp_server.online) {
          dot.className = "w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse";
          text.textContent = "FastMCP Online (SSE:8001)";
          text.className = "text-emerald-400 font-semibold";
        } else {
          dot.className = "w-2.5 h-2.5 rounded-full bg-amber-400";
          text.textContent = "FastMCP Standalone / Fallback Active";
          text.className = "text-amber-300 font-medium";
        }
      }
    } catch (e) {
      dot.className = "w-2.5 h-2.5 rounded-full bg-rose-500";
      text.textContent = "MCP Server Offline";
      text.className = "text-rose-400 font-medium";
    }
  };

  await check();
  setInterval(check, 10000);
}

// ----------------------------------------------------------------------------
// 2. Orb State Machine
// ----------------------------------------------------------------------------
function setOrbState(state) {
  const orb = document.getElementById('alexa-orb');
  const halo = document.getElementById('orb-halo');
  const statusText = document.getElementById('orb-status-text');

  orb.className = `alexa-orb w-24 h-24 rounded-full flex items-center justify-center shadow-2xl cursor-pointer relative z-10 transition-transform state-${state}`;

  if (state === 'idle') {
    halo.className = "absolute w-36 h-36 rounded-full opacity-40 bg-cyan-500/20";
    statusText.textContent = 'Ready • "Alexa, check hazard reports in Downtown"';
    statusText.className = "mt-4 text-xs font-medium uppercase tracking-wider text-cyan-400";
  } else if (state === 'listening') {
    halo.className = "absolute w-44 h-44 rounded-full opacity-60 bg-cyan-400/30 animate-ping";
    statusText.textContent = 'Listening to Citizen Voice...';
    statusText.className = "mt-4 text-xs font-bold uppercase tracking-wider text-cyan-300 animate-pulse";
  } else if (state === 'thinking') {
    halo.className = "absolute w-40 h-40 rounded-full opacity-70 bg-purple-500/30";
    statusText.textContent = 'Routing Query & Executing FastMCP Tool...';
    statusText.className = "mt-4 text-xs font-bold uppercase tracking-wider text-purple-400 animate-pulse";
  } else if (state === 'speaking') {
    halo.className = "absolute w-40 h-40 rounded-full opacity-80 bg-blue-500/30";
    statusText.textContent = 'Alexa+ Responding (TTS Voice Active)...';
    statusText.className = "mt-4 text-xs font-bold uppercase tracking-wider text-sky-300";
  }
}

// ----------------------------------------------------------------------------
// 3. Web Speech API (Voice-to-Text STT)
// ----------------------------------------------------------------------------
function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const micBtn = document.getElementById('mic-btn');
  const micLabel = document.getElementById('mic-btn-label');
  const orb = document.getElementById('alexa-orb');

  if (!SpeechRecognition) {
    if (micLabel) micLabel.textContent = "Mic N/A";
    if (micBtn) micBtn.title = "SpeechRecognition not supported in this browser. Please use text input.";
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onstart = () => {
    isListening = true;
    setOrbState('listening');
    if (micLabel) micLabel.textContent = "Listening...";
    micBtn.classList.add('bg-cyan-950', 'border-cyan-400', 'text-cyan-300');
  };

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    document.getElementById('query-input').value = transcript;
    processQuery(transcript);
  };

  recognition.onerror = (event) => {
    console.warn("Speech recognition error:", event.error);
    stopListening();
  };

  recognition.onend = () => {
    stopListening();
  };

  const toggleMic = () => {
    if (isListening) {
      recognition.stop();
      stopListening();
    } else {
      // Stop any active speech before listening
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      try {
        recognition.start();
      } catch (err) {
        console.error("Mic start failed", err);
      }
    }
  };

  micBtn.addEventListener('click', toggleMic);
  orb.addEventListener('click', toggleMic);
}

function stopListening() {
  isListening = false;
  const micBtn = document.getElementById('mic-btn');
  const micLabel = document.getElementById('mic-btn-label');
  if (micLabel) micLabel.textContent = "Speak";
  if (micBtn) micBtn.classList.remove('bg-cyan-950', 'border-cyan-400', 'text-cyan-300');
  setOrbState('idle');
}

// ----------------------------------------------------------------------------
// 4. SpeechSynthesis (Text-to-Speech TTS)
// ----------------------------------------------------------------------------
function initTtsControls() {
  const ttsBtn = document.getElementById('tts-toggle-btn');
  const ttsIcon = document.getElementById('tts-icon');
  const ttsLabel = document.getElementById('tts-label');
  const replayBtn = document.getElementById('replay-speech-btn');

  ttsBtn.addEventListener('click', () => {
    isTtsEnabled = !isTtsEnabled;
    if (!isTtsEnabled) {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      ttsIcon.setAttribute('data-lucide', 'volume-x');
      ttsLabel.textContent = 'Voice: OFF';
      ttsBtn.classList.add('text-slate-500');
    } else {
      ttsIcon.setAttribute('data-lucide', 'volume-2');
      ttsLabel.textContent = 'Voice: ON';
      ttsBtn.classList.remove('text-slate-500');
    }
    lucide.createIcons();
  });

  replayBtn.addEventListener('click', () => {
    if (lastAlexaSpeechText) {
      speakAlexaText(lastAlexaSpeechText);
    }
  });
}

function speakAlexaText(text) {
  if (!isTtsEnabled || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();
  currentSpeechUtterance = new SpeechSynthesisUtterance(text);
  currentSpeechUtterance.rate = 1.05;
  currentSpeechUtterance.pitch = 1.0;

  // Attempt to select an English female / natural sounding voice
  const voices = window.speechSynthesis.getVoices();
  const naturalVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Google') || v.name.includes('Zira') || v.name.includes('Jenny')));
  if (naturalVoice) {
    currentSpeechUtterance.voice = naturalVoice;
  }

  currentSpeechUtterance.onstart = () => {
    setOrbState('speaking');
  };

  currentSpeechUtterance.onend = () => {
    setOrbState('idle');
  };

  currentSpeechUtterance.onerror = () => {
    setOrbState('idle');
  };

  window.speechSynthesis.speak(currentSpeechUtterance);
}

// ----------------------------------------------------------------------------
// 5. Query Processing & Server-Sent Events (SSE) Consumer
// ----------------------------------------------------------------------------
function triggerQuickPrompt(promptText) {
  document.getElementById('query-input').value = promptText;
  processQuery(promptText);
}

function handleFormSubmit(e) {
  e.preventDefault();
  const input = document.getElementById('query-input');
  const query = input.value.trim();
  if (!query) return;
  processQuery(query);
}

async function processQuery(query) {
  if (!query) return;

  // Display user query bubble
  const userTranscriptContainer = document.getElementById('user-transcript-container');
  const userTranscriptText = document.getElementById('user-transcript-text');
  userTranscriptContainer.classList.remove('hidden');
  userTranscriptText.textContent = `"${query}"`;

  // Reset Inspector UI
  resetLifecycleStepper();
  setStepActive('step-voice');
  setOrbState('thinking');

  // Cancel existing TTS
  if (window.speechSynthesis) window.speechSynthesis.cancel();

  // Connect to SSE stream
  const streamUrl = `/api/alexa-stream?q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(streamUrl);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop(); // keep last incomplete chunk

      for (const eventBlock of events) {
        if (!eventBlock.trim()) continue;
        parseSseEvent(eventBlock);
      }
    }
  } catch (error) {
    console.error('SSE Stream error:', error);
    setOrbState('idle');
    document.getElementById('speech-text').textContent = "I encountered an error connecting to the safety stream. Please try again.";
  }
}

function parseSseEvent(eventBlock) {
  const lines = eventBlock.split('\n');
  let eventType = 'message';
  let dataStr = '';

  for (const line of lines) {
    if (line.startsWith('event:')) {
      eventType = line.replace('event:', '').trim();
    } else if (line.startsWith('data:')) {
      dataStr = line.replace('data:', '').trim();
    }
  }

  if (!dataStr) return;

  try {
    const data = JSON.parse(dataStr);
    handleAgentEvent(eventType, data);
  } catch (err) {
    console.error("Failed to parse SSE JSON:", err, dataStr);
  }
}

function handleAgentEvent(type, data) {
  if (type === 'thinking') {
    setStepActive('step-intent');
  } else if (type === 'tool_call') {
    setStepActive('step-tool');
    document.getElementById('active-tool-badge').textContent = data.tool;
    document.getElementById('args-display').textContent = JSON.stringify(data.arguments, null, 2);
  } else if (type === 'tool_result') {
    rawPayloadData = data.result;
    document.getElementById('latency-display').textContent = `${data.latency_ms} ms`;
    document.getElementById('transport-badge').textContent = `Via: ${data.transport}`;
    document.getElementById('payload-display').textContent = JSON.stringify(data.result, null, 2);
  } else if (type === 'alexa_response') {
    setStepActive('step-synth');
    
    // Update speech transcript
    lastAlexaSpeechText = data.speech_text;
    document.getElementById('speech-text').textContent = data.speech_text;

    // Trigger TTS Audio
    speakAlexaText(data.speech_text);

    // Render Dynamic Echo Show Multimodal Card
    renderMultimodalCard(data.card_data);
  } else if (type === 'done') {
    // Finished lifecycle
  }
}

// ----------------------------------------------------------------------------
// 6. Echo Show Multimodal Card Renderers
// ----------------------------------------------------------------------------
function renderMultimodalCard(card) {
  const container = document.getElementById('multimodal-card');
  if (!card) return;

  if (card.card_type === 'hazard_report') {
    container.innerHTML = createHazardReportHtml(card);
  } else if (card.card_type === 'safe_haven') {
    container.innerHTML = createSafeHavenHtml(card);
  } else if (card.card_type === 'emergency_dispatch') {
    container.innerHTML = createEmergencyDispatchHtml(card);
  }

  lucide.createIcons();
}

function createHazardReportHtml(card) {
  const badgeClasses = card.risk_level === 'CRITICAL' 
    ? 'bg-rose-950 text-rose-300 border-rose-800' 
    : (card.risk_level === 'HIGH' ? 'bg-amber-950 text-amber-300 border-amber-800' : 'bg-yellow-950 text-yellow-300 border-yellow-800');

  let itemsHtml = '';
  (card.items || []).forEach(item => {
    itemsHtml += `
      <div class="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <span class="w-2 h-2 rounded-full ${item.severity === 'CRITICAL' ? 'bg-rose-500' : 'bg-amber-400'}"></span>
            <h4 class="text-xs font-bold text-white">${item.hazard_type}</h4>
          </div>
          <span class="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">${item.status}</span>
        </div>
        <p class="text-xs text-slate-300 leading-normal">${item.description}</p>
        <div class="pt-1 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 gap-1">
          <div><strong class="text-slate-300">Detour:</strong> ${item.recommended_detour}</div>
          <div class="text-[10px] text-slate-500 shrink-0">${item.reported_at}</div>
        </div>
      </div>
    `;
  });

  return `
    <div class="bg-gradient-to-br from-alexa-card to-slate-900 border border-alexa-border rounded-2xl p-5 space-y-4 shadow-xl">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <i data-lucide="alert-triangle" class="w-4 h-4 text-amber-400"></i>
            <span>${card.headline}</span>
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">${card.advisory}</p>
        </div>
        <span class="text-xs font-bold px-3 py-1 rounded-full border ${badgeClasses}">
          ${card.risk_level} RISK
        </span>
      </div>

      <div class="space-y-2.5">
        ${itemsHtml}
      </div>
    </div>
  `;
}

function createSafeHavenHtml(card) {
  const p = card.primary || {};
  let secondaryHtml = '';
  
  (card.secondary || []).forEach(s => {
    secondaryHtml += `
      <div class="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
        <div>
          <h5 class="text-xs font-semibold text-white">${s.name}</h5>
          <p class="text-[11px] text-slate-400">${s.category} &bull; ${s.distance_miles} miles away (~${s.estimated_walk_mins} min walk)</p>
        </div>
        <span class="text-[10px] font-medium bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded">
          ${s.capacity_status.split('-')[0]}
        </span>
      </div>
    `;
  });

  return `
    <div class="bg-gradient-to-br from-alexa-card to-slate-900 border border-alexa-border rounded-2xl p-5 space-y-4 shadow-xl">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <i data-lucide="shield-check" class="w-4 h-4 text-emerald-400"></i>
            <span>${card.headline}</span>
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">Found ${card.total_count} emergency shelters and verified trauma clinics</p>
        </div>
        <span class="text-xs font-bold px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
          NEAREST: ${p.distance_miles} MILES
        </span>
      </div>

      <!-- Primary Haven Hero Card -->
      <div class="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-4 space-y-3">
        <div class="flex items-start justify-between">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Primary Recommendation</span>
            <h4 class="text-sm font-bold text-white mt-0.5">${p.name}</h4>
            <p class="text-xs text-slate-400">${p.category}</p>
          </div>
          <div class="text-right">
            <span class="text-sm font-mono font-bold text-white">~${p.estimated_walk_mins} MINS</span>
            <p class="text-[10px] text-slate-400">Walking Time</p>
          </div>
        </div>

        <!-- Badges Grid -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] pt-1">
          <div class="bg-slate-950 p-2 rounded-lg border border-slate-800 flex items-center space-x-1.5 text-slate-300">
            <i data-lucide="zap" class="w-3.5 h-3.5 text-amber-400"></i>
            <span>Backup Power: Active</span>
          </div>
          <div class="bg-slate-950 p-2 rounded-lg border border-slate-800 flex items-center space-x-1.5 text-slate-300">
            <i data-lucide="heart-pulse" class="w-3.5 h-3.5 text-rose-400"></i>
            <span>Medical Staff On Duty</span>
          </div>
          <div class="bg-slate-950 p-2 rounded-lg border border-slate-800 flex items-center space-x-1.5 text-slate-300 col-span-2 sm:col-span-1">
            <i data-lucide="users" class="w-3.5 h-3.5 text-emerald-400"></i>
            <span class="truncate">${p.capacity_status}</span>
          </div>
        </div>

        <div class="pt-2 border-t border-slate-800 text-xs text-slate-300">
          <strong class="text-cyan-400">Approach Route:</strong> ${p.recommended_approach}
        </div>
      </div>

      <!-- Secondary Options -->
      ${secondaryHtml ? `<div class="space-y-2"><p class="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Secondary Safe Spots</p>${secondaryHtml}</div>` : ''}
    </div>
  `;
}

function createEmergencyDispatchHtml(card) {
  let stepsHtml = '';
  (card.safety_protocol_steps || []).forEach(step => {
    stepsHtml += `
      <li class="bg-slate-950/70 border border-slate-800/80 p-2.5 rounded-lg text-xs text-slate-200">
        ${step}
      </li>
    `;
  });

  let unitsHtml = '';
  (card.assigned_units || []).forEach(u => {
    unitsHtml += `<span class="bg-rose-950/80 text-rose-300 border border-rose-800/80 text-[11px] px-2.5 py-1 rounded-md font-mono">${u}</span>`;
  });

  return `
    <div class="emergency-alert-card bg-gradient-to-br from-rose-950/40 via-alexa-card to-slate-900 border-2 border-rose-500 rounded-2xl p-5 space-y-4 shadow-2xl">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <span class="w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
          <h3 class="text-sm font-black text-rose-400 tracking-wider uppercase">${card.headline}</h3>
        </div>
        <div class="text-right">
          <span class="text-base font-extrabold font-mono text-white">${card.eta_minutes} MINS</span>
          <p class="text-[10px] text-slate-400 uppercase">Estimated Arrival</p>
        </div>
      </div>

      <!-- Alert ID Banner -->
      <div class="bg-slate-950 border border-rose-900/60 p-3 rounded-xl flex items-center justify-between">
        <div>
          <p class="text-[10px] uppercase font-bold text-slate-400">Emergency Tracking ID</p>
          <p class="font-mono text-sm font-bold text-rose-300">${card.tracking_id}</p>
        </div>
        <div class="text-right">
          <span class="text-[10px] font-mono bg-rose-950 text-rose-400 border border-rose-800 px-2 py-0.5 rounded">
            ${card.beacon_status}
          </span>
        </div>
      </div>

      <!-- Dispatched Units -->
      <div class="space-y-1.5">
        <p class="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Assigned First Responder Units</p>
        <div class="flex flex-wrap gap-1.5">
          ${unitsHtml}
        </div>
      </div>

      <!-- Immediate Survival Steps -->
      <div class="space-y-2 pt-2 border-t border-slate-800">
        <p class="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
          <i data-lucide="life-buoy" class="w-3.5 h-3.5"></i>
          <span>Immediate Survival Protocol</span>
        </p>
        <ol class="space-y-1.5">
          ${stepsHtml}
        </ol>
      </div>
    </div>
  `;
}

// ----------------------------------------------------------------------------
// 7. Inspector Lifecycle Stepper & Utilities
// ----------------------------------------------------------------------------
function resetLifecycleStepper() {
  ['step-voice', 'step-intent', 'step-tool', 'step-synth'].forEach(id => {
    const el = document.getElementById(id);
    el.className = "bg-slate-900 text-slate-500 py-1.5 rounded-lg border border-slate-800 transition-colors";
  });
}

function setStepActive(stepId) {
  const el = document.getElementById(stepId);
  if (el) {
    el.className = "bg-cyan-950 text-cyan-300 py-1.5 rounded-lg border border-cyan-700 font-bold transition-all animate-pulse";
  }
}

function clearInspectorLogs() {
  document.getElementById('active-tool-badge').textContent = "Awaiting query...";
  document.getElementById('args-display').textContent = "{ /* Waiting for prompt */ }";
  document.getElementById('payload-display').textContent = "// Full structured JSON response returned by the MCP Server will appear here.";
  document.getElementById('latency-display').textContent = "-- ms";
  document.getElementById('transport-badge').textContent = "";
  resetLifecycleStepper();
  rawPayloadData = null;
}

function copyPayloadJSON() {
  if (!rawPayloadData) return;
  navigator.clipboard.writeText(JSON.stringify(rawPayloadData, null, 2)).then(() => {
    const btnText = document.getElementById('copy-btn-text');
    btnText.textContent = "Copied!";
    setTimeout(() => { btnText.textContent = "Copy JSON"; }, 2000);
  });
}
