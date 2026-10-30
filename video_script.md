# 🎬 Alexa+ Guardian SafeRoute: Hackathon Video Demo Script
**Total Run Time:** 2 Minutes 20 Seconds *(Strictly under the 3:00 Hackathon Limit)*  
**Target Track:** Alexa+ (Self-Hosted MCP Server / Simulated Echo Show 15 Multimodal Experience)

---

### ⏱️ SECTION 1: THE HOOK & PROBLEM (0:00 – 0:30)

| Timestamp | Visual on Screen | Spoken Audio / Voiceover |
|---|---|---|
| **0:00 – 0:10** | Dramatic full-screen montage or news headlines of severe flash floods, road washouts, and downed power lines. | *"When a storm intensifies into a flash flood and the street outside begins to submerge, looking down at a phone map or browsing broken websites is the last thing you have time to do."* |
| **0:10 – 0:20** | Cut to the web browser showing **`http://127.0.0.1:5000`** with the sleek Echo Show 15 hardware bezel, pulsing Alexa Cyan orb, and dark mode interface. | *"What if your Echo Show could immediately become an active life-safety node—calmly speaking road detours, locating elevated shelters with generator power, and dispatching first responders?"* |
| **0:20 – 0:30** | Close-up on the header showing the green badge: **"MCP SSE Stream: Connected"** and **"Alexa+ Guardian SafeRoute"**. | *"This is Alexa+ Guardian SafeRoute, built for the Nebius x NVIDIA Global AI Hackathon using a self-hosted Model Context Protocol (MCP) server running over Server-Sent Events."* |

---

### ⏱️ SECTION 2: LIVE INTERACTIVE DEMO — 3 PROMPTS IN UNDER 70s (0:30 – 1:40)

| Timestamp | Visual on Screen | Spoken Audio / Voiceover |
|---|---|---|
| **0:30 – 0:40** | Cursor clicks **"⚠️ Check Downtown Hazards"** (or speaker uses mic: *"Alexa, check hazard reports in Downtown"*). | *"Let's test our first tool: civic hazard detection. I'll click our quick-prompt: 'Alexa, check hazard reports in Downtown.'"* |
| **0:40 – 0:55** | The Alexa Orb swirls into **THINKING** mode, then **SPEAKS**. Echo Show screen renders a high-contrast hazard card showing 2.5 ft flood depth at 4th & Pine, and 8th Ave Viaduct detour. The right terminal updates with latency (e.g. `12 ms`) and raw JSON. | **Alexa Voice (TTS):** *"In Downtown, there are 2 active hazard alerts with an overall CRITICAL risk rating. Primary concern: Flash Flooding. Recommended detour: Use 8th Avenue Viaduct."*<br/><br/>**Presenter:** *"Notice how Alexa speaks the immediate detour while the Echo Show screen displays the affected corridors. On the right, the telemetry inspector shows the MCP tool executed in just 12 milliseconds."* |
| **0:55 – 1:05** | Cursor clicks **"🛡️ Find Riverside Haven"**. | *"Next, what if we need immediate high-ground evacuation? Let's ask: 'Alexa, find the nearest safe haven in Riverside.'"* |
| **1:05 – 1:20** | Orb pulses. The Echo Show card updates to a green-accented shelter card for **Riverdale High School** showing `0.42 miles away`, `~8 min walk`, `Backup Power: Active`, and `Medical Staff: On Duty`. Raw JSON payload displays in the inspector. | **Alexa Voice (TTS):** *"I found verified safe spots near Riverside. The nearest is Riverdale High School High-Ground Refuge, located 0.42 miles away with active backup power and medical personnel."*<br/><br/>**Presenter:** *"Instant multimodal feedback. Citizens don't just get a generic address—they get verified walk times, generator status, and safe approach instructions."* |
| **1:20 – 1:30** | Cursor clicks **"🚨 SOS Dispatch (Metro Central)"**. | *"Now, the most critical scenario: an emergency distress situation. 'Alexa, dispatch an emergency SOS in Metro Central, flash flood entering building.'"* |
| **1:30 – 1:40** | Interface enters emergency mode: red flashing strobe card, Alert Tracking ID `SOS-ALX-2610-89F1`, 406MHz active beacon, dispatched Swiftwater Rescue units, 4-minute ETA, and immediate survival protocols. Click "Copy JSON" and see "Copied!" feedback. | **Alexa Voice (TTS):** *"Emergency SOS confirmed. Alert tracking ID SOS-ALX-2610-89F1 has been transmitted to Civic Swiftwater Rescue Unit 4. Estimated arrival: 4 minutes."*<br/><br/>**Presenter:** *"The screen locks onto an emergency beacon tracking ID, dispatches rescue units, and provides a clear 4-step survival checklist."* |

---

### ⏱️ SECTION 3: CODE & MCP ARCHITECTURE WALKTHROUGH (1:40 – 2:10)

| Timestamp | Visual on Screen | Spoken Audio / Voiceover |
|---|---|---|
| **1:40 – 1:55** | Switch to VS Code / code editor showing [`server.py`](file:///server.py). Highlight `@mcp.tool()` decorators for `get_hazard_reports`, `find_safe_havens`, and `dispatch_emergency_ping`. | *"Under the hood, everything runs on the official Python MCP SDK. In `server.py`, we define our FastMCP server running over Streamable HTTP and Server-Sent Events. We registered 3 typed tools with strict Pydantic validation."* |
| **1:55 – 2:10** | Switch to [`simulator_app/app.py`](file:///simulator_app/app.py) and show the `/api/alexa-query` endpoint and the embedded Tailwind Echo Show 15 HTML. Then briefly run `python tests/test_agent.py` in the terminal showing 100% PASS. | *"Our FastAPI backend bridges user voice to the MCP server. We've included automated verification tests with 100% coverage, and an in-depth Friction Log and Product Feedback document addressing the MCP 2.x SDK transition for the Amazon team."* |

---

### ⏱️ SECTION 4: CLOSING & INVITATION (2:10 – 2:20)

| Timestamp | Visual on Screen | Spoken Audio / Voiceover |
|---|---|---|
| **2:10 – 2:20** | Back to the Echo Show 15 interface running live. Show GitHub repository and Devpost submission page. Fade out with project title card. | *"Alexa+ Guardian SafeRoute proves that open MCP tools and ambient smart displays can save lives during civic emergencies. Thank you to Amazon and the Alexa team—we look forward to your review!"* |

---

### 💡 Recording & Production Tips for Submitter:
1. **Screen Resolution**: Set display scaling to 100% or 125% at 1080p (1920x1080) so all font sizes and hardware bezels look crisp.
2. **Audio Setup**: Turn your computer speaker on so the browser's SpeechSynthesis (Alexa voice) is clearly audible in the screen recording microphone.
3. **One-Command Pre-Flight**:
   ```bash
   python run.py
   ```
   Open `http://127.0.0.1:5000` in Google Chrome or Microsoft Edge before starting the recording.
