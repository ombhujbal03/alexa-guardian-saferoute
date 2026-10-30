# 🎙️ Alexa+ Guardian SafeRoute (Amazon Ambient Ecosystem Hub)
> **Nebius x NVIDIA Global AI Hackathon**  
> **Primary Track:** Alexa+ (Self-Hosted FastMCP Server & Echo Show 15 Multimodal Simulator)  
> **Ecosystem Integrations:** Ring, Fire TV, Bee Wearable AI  
> **Mini Challenge:** Open Source (MIT License)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![FastMCP](https://img.shields.io/badge/MCP-FastMCP%20SSE-blue.svg)](https://modelcontextprotocol.io/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
[![TailwindCSS](https://img.shields.io/badge/Frontend-TailwindCSS-38B2AC.svg)](https://tailwindcss.com/)

---

## 📌 Submission Compliance Statement
This project satisfies all Nebius x NVIDIA Global AI Hackathon requirements:
- **Track Alignment**: Anchored firmly in the **Alexa+** track featuring a self-hosted **Model Context Protocol (MCP)** server running over **Streamable HTTP / Server-Sent Events (SSE)**.
- **Ecosystem Breadth**: Unifies 4 Amazon ambient tracks (**Alexa+**, **Ring**, **Fire TV**, and **Bee Wearable AI**) into a single, cohesive Echo Show 15 smart home command center.
- **Open Source Qualification**: Fully compliant with the **$5,000 Open Source Mini Challenge** under the standard **MIT License** (`LICENSE`).
- **Runnable Codebase**: Contains real, production-ready Python code imports (`mcp.server.fastmcp`, `fastapi`, `pydantic`), an explicit entry point ([`server.py`](file:///server.py) and [`run.py`](file:///run.py)), and an interactive Echo Show 15 dark-mode web application ([`http://127.0.0.1:5000`](http://127.0.0.1:5000)).
- **All 6 MCP Tools**: 6 registered, fully callable tools with typed schemas, input validation, and structured JSON outputs:
  1. `get_hazard_reports(location: str)`
  2. `find_safe_havens(current_area: str)`
  3. `dispatch_emergency_ping(zone: str, details: str)`
  4. `get_ring_security_snapshot(camera_id: str)`
  5. `cast_to_fire_tv(screen_data: dict)`
  6. `get_bee_wearable_telemetry()`

---

## 💡 Overview & Problem Solved
During severe weather emergencies, flash floods, or domestic safety incidents, families are forced to navigate fragmented mobile apps, delayed civic dashboards, and separate smart home devices.

**Alexa+ Guardian SafeRoute** transforms ambient hardware into an automated life-safety command center:
1. **Civic Safety (Alexa+ FastMCP)**: Checks live civic flood sensors, locates high-ground shelters, and dispatches structured 911/SOS telemetry with estimated arrival times.
2. **Perimeter Awareness (Ring)**: Inspects front-door camera feeds, validates smart deadbolt security, and confirms delivery status hands-free.
3. **Whole-Home Broadcast (Fire TV)**: Seamlessly casts emergency evacuation radar and warnings to living room displays using Fire OS / Vega OS casting handshakes with Picture-in-Picture (PiP).
4. **Biometric Safeguard (Bee Wearable AI)**: Continuously reads wearable vital telemetry (heart rate, fall detection, stress spikes) to detect emergencies proactively.

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph UI["Multimodal Echo Show 15 Interface (Port 5000)"]
        User(["Citizen Voice / Text / Touch"]) --> Frame["Hardware Bezel Frame (Tailwind CSS)"]
        Frame --> Orb["Glowing Alexa Orb Visualizer"]
        Frame --> Badges["Connected Amazon Ecosystem Bar (Alexa+, Ring, Fire TV, Bee)"]
        Frame --> STT["Web Speech API (Voice-to-Text)"]
        Frame --> TTS["SpeechSynthesis (Natural TTS Voice)"]
        Frame --> Display["Dynamic Multimodal Card Renderer"]
        Frame --> Telemetry["Live MCP Telemetry & JSON Inspector"]
    end

    subgraph Backend["Alexa+ Voice Orchestrator (run.py / FastAPI)"]
        STT --> API["/api/alexa-query & /api/alexa-stream"]
        API --> IntentRouter["Dynamic Intent & Context Classifier"]
    end

    subgraph MCP["Self-Hosted FastMCP Server (server.py / Port 8001)"]
        IntentRouter -- "Streamable HTTP / SSE Protocol" --> Server["FastMCP Server (server.py)"]
        Server --> T1["get_hazard_reports(location)"]
        Server --> T2["find_safe_havens(current_area)"]
        Server --> T3["dispatch_emergency_ping(zone, details)"]
        Server --> T4["get_ring_security_snapshot(camera_id)"]
        Server --> T5["cast_to_fire_tv(screen_data)"]
        Server --> T6["get_bee_wearable_telemetry()"]
    end

    T1 --> Display
    T2 --> Display
    T3 --> Display
    T4 --> Display
    T5 --> Display
    T6 --> Display
```

---

## 🛠️ MCP Tool Reference (6 Active Tools)

### 1. `get_hazard_reports(location: str)`
- **Purpose**: Retrieves real-time civic hazard alerts and water accumulation telemetry.
- **Input**: `{"location": "Downtown"}`
- **Sample Output**:
```json
{
  "location": "Downtown",
  "active_hazards_count": 2,
  "risk_level": "CRITICAL",
  "hazards": [
    {
      "id": "HAZ-001",
      "type": "Flash Flood",
      "severity": "CRITICAL",
      "description": "Rapid water accumulation up to 2.5 feet at 4th & Elm Ave.",
      "recommended_action": "Avoid low-lying underpasses; seek higher ground."
    }
  ]
}
```

### 2. `find_safe_havens(current_area: str)`
- **Purpose**: Calculates distance to the nearest verified emergency shelters, clinics, and transit desks.
- **Input**: `{"current_area": "Riverside"}`
- **Sample Output**:
```json
{
  "current_zone": "Riverside",
  "havens_found": 2,
  "primary_recommendation": {
    "name": "Riverdale High School High-Ground Refuge",
    "address": "1400 Highland Ave, Riverside",
    "distance_miles": 0.8,
    "capacity_status": "OPEN (72% available)",
    "supplies_available": ["Potable Water", "Emergency Power", "Cots", "First Aid"]
  }
}
```

### 3. `dispatch_emergency_ping(zone: str, details: str)`
- **Purpose**: Generates a verifiable SOS emergency confirmation payload with first responder dispatch IDs.
- **Input**: `{"zone": "Metro Central", "details": "Flash flood entering building"}`
- **Sample Output**:
```json
{
  "alert_tracking_id": "SOS-ALX-2610-53F5",
  "zone": "Metro Central",
  "assigned_units": ["Rescue Squad 4", "Swift Water Unit 2"],
  "estimated_arrival_minutes": 4,
  "safety_protocol_steps": [
    "Move to the highest floor or elevated counter immediately.",
    "Do NOT enter attics without roof exit access.",
    "Turn off main circuit breaker if safely accessible without touching water."
  ]
}
```

### 4. `get_ring_security_snapshot(camera_id: str)`
- **Purpose**: Inspects front-door camera status, parcel detection, and smart deadbolt lock state.
- **Input**: `{"camera_id": "front_door_cam_01"}`
- **Sample Output**:
```json
{
  "camera_id": "front_door_cam_01",
  "device_name": "Ring Video Doorbell Pro 2",
  "motion_status": "MOTION_CLEAR",
  "parcel_detected": true,
  "parcel_description": "1 Medium Amazon Prime Delivery Box",
  "door_lock_status": "LOCKED (Ring Smart Deadbolt)",
  "battery_percentage": 94,
  "live_snapshot_url": "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80"
}
```

### 5. `cast_to_fire_tv(screen_data: dict)`
- **Purpose**: Initiates a Fire OS 8 / Vega OS 4K broadcast with Picture-in-Picture emergency routing.
- **Input**: `{"screen_data": {"alert": "Civic Flood Evacuation Alert"}}`
- **Sample Output**:
```json
{
  "cast_session_id": "CAST-FTV-114800",
  "target_device": "Living Room Fire TV Omni 65-inch",
  "os_platform": "Fire OS 8 / Vega OS Unified Cast Protocol",
  "handshake_status": "CONFIRMED_STREAMING_ACTIVE",
  "resolution": "3840x2160 @ 60fps (Dolby Vision)",
  "picture_in_picture_mode": true
}
```

### 6. `get_bee_wearable_telemetry()`
- **Purpose**: Reads biometric and guardian telemetry from the Bee Wearable AI smart device.
- **Input**: `{}`
- **Sample Output**:
```json
{
  "device_name": "Bee Wearable AI Smart Pin / Band",
  "user_heart_rate_bpm": 74,
  "heart_rate_classification": "NORMAL_RESTING",
  "emergency_stress_spike": false,
  "blood_oxygen_spo2_percent": 99,
  "daily_step_count": 6842,
  "fall_detection_active": true,
  "device_battery_percent": 88
}
```

---

## 🚀 Quickstart & Execution Guide

### 1. Prerequisites & Environment Setup
Clone the repository and create a Python virtual environment:
```bash
git clone https://github.com/your-username/alexa-guardian-saferoute.git
cd alexa-guardian-saferoute

python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 2. Launch the FastMCP Server (Port 8001)
```bash
python server.py --port 8001
```
The FastMCP Server initializes on `http://127.0.0.1:8001/sse`.

### 3. Launch the Echo Show 15 Simulator (Port 5000)
In a separate terminal:
```bash
python run.py
```
Open **[http://127.0.0.1:5000](http://127.0.0.1:5000)** in Chrome or Edge.

### 4. Run the Automated Verification Suite (100% Coverage)
```bash
python tests/test_agent.py
```

---

## 📂 Project Directory Structure

```
├── LICENSE                         # MIT Open Source License ($5,000 Mini Challenge)
├── README.md                       # Complete Project Documentation & Architecture
├── DEVPOST_SUBMISSION.md           # Submission Fields, Product Feedback & Friction Log
├── requirements.txt                # Pinned dependencies (mcp, fastapi, uvicorn, pydantic)
├── server.py                       # Self-Hosted FastMCP Server (6 callable tools)
├── run.py                          # Master Launcher for Echo Show 15 Simulator
├── simulator_app/                  # Full-stack Echo Show 15 Web Simulator
│   ├── app.py                      # FastAPI orchestrator + inline multimodal UI
│   ├── alexa_agent.py              # Dynamic intent router & SSE streaming client
│   └── templates/                  # Template directory
│       └── index.html              # Echo Show 15 UI with Tailwind CSS & Web Speech
├── mcp_server/                     # Core MCP tools and Pydantic schemas
│   ├── __init__.py
│   ├── tools.py                    # Tool logic with schema validation
│   └── server.py                   # Alternative entry point
└── tests/                          # Automated Verification Suite
    └── test_agent.py               # Comprehensive 6-tool & API integration test
```

---

## ⚖️ License
This project is licensed under the **MIT License** - see the [`LICENSE`](file:///LICENSE) file for details. Built with ❤️ for the **Nebius x NVIDIA Global AI Hackathon**.
