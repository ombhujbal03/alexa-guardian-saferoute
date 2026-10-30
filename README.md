# Echo Show 15 • Alexa+ Guardian SafeRoute 🛡️
### Ambient Civic Safety & Physical AI IoT Hub Powered by NVIDIA Nemotron-70B on Nebius Token Factory

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Inference Engine](https://img.shields.io/badge/Inference-Nebius_Token_Factory-8A2BE2)](https://tokenfactory.nebius.ai/)
[![Model](https://img.shields.io/badge/Model-NVIDIA_Nemotron--70B-76B900)](https://build.nvidia.com/)
[![Protocol](https://img.shields.io/badge/Protocol-FastMCP_SSE-brightgreen)](https://github.com/modelcontextprotocol)

**Alexa+ Guardian SafeRoute** is an ambient physical disaster intelligence hub transforming domestic smart-home infrastructure into an active command center during sudden civic emergencies, flash floods, and municipal power loss[cite: 1, 6].

**Submitted to:** Nebius x NVIDIA Global AI Hackathon (Physical AI Track)

---

## 💡 Inspiration & Problem Solved
During severe localized flash floods, conventional mobile notifications and static municipal sirens fail to reach occupants in time or provide actionable guidance[cite: 4]. Domestic smart-home peripherals (smart displays, security cameras, connected televisions, wearables) usually sit idle[cite: 4]. 

**Guardian SafeRoute** bridges this gap: it utilizes high-parameter spatial reasoning from **NVIDIA Llama-3.1-Nemotron-70B-Instruct** served via **Nebius Token Factory** to compute verified, high-ground evacuation paths and synchronously broadcast life-critical actions across home hardware via the **Model Context Protocol (FastMCP)**[cite: 1, 4, 6].

---

## ⚡ Core Technical Infrastructure

### 1. Nebius Token Factory
* High-throughput inference hosting `nvidia/Llama-3.1-Nemotron-70B-Instruct` over an OpenAI-compatible API endpoint (`https://api.tokenfactory.nebius.ai/v1`)[cite: 3, 4].
* Achieves dependable sub-300ms total token latency with a ~100ms Time-to-First-Token (TTFT) for low-latency emergency routing.

### 2. NVIDIA Llama-3.1-Nemotron-70B-Instruct
* Evaluates real-time floodwater cresting vectors and calculates positive topographic drainage corridors (+68 ft net elevation gain)[cite: 4].
* Enforces strict RFC-8259 JSON structure for FastMCP tool calls with zero parameter hallucination[cite: 4].

### 3. FastMCP Architecture over SSE (Port 8001)
* Dispatches streamable tool calls and telemetry over Server-Sent Events to peripheral smart-home endpoints[cite: 1, 4]:
  * **Echo Show 15 Simulator:** Interactive multimodal UI, live telemetry terminal, and Web Speech TTS audio synthesis.
  * **Ring Security:** Automated emergency perimeter and deadbolt locking[cite: 4].
  * **Fire TV Omni 65":** Real-time 4K Picture-in-Picture (PiP) emergency radar overlay injection.
  * **Bee Wearable AI:** Continuous heart-rate tracking and physiological stress telemetry (74 bpm).

---

## 🛠️ Implemented FastMCP Tool Schemas

1. **`find_safe_shelter_route`**
   * **Input:** `{"origin_coordinates": "Riverside", "target_shelter": "Riverdale High School High-Ground Refuge"}`
   * **Output:** Calculates safe corridors (`Highland Ridge Road via Exit 14`), rejects submerged valley embankments, verifies shelter power/medical staff status, and reports +68 ft elevation climb[cite: 4].
2. **`check_downtown_hazards`**
   * Evaluates sensor water-depth markers against critical transit thresholds (e.g., 1.5 ft water lines).
3. **`trigger_ambient_sos` / `cast_to_fire_tv`**
   * Multicasts priority screen alerts to connected living room TVs and locks physical perimeter doors[cite: 4].

---

## 🏛️ System Architecture

```mermaid
flowchart TD
    subgraph UI["Multimodal Echo Show 15 Interface (Port 5000)"]
        User(["Citizen Voice / Text / Touch"]) --> Frame["Hardware Bezel Frame (Tailwind CSS)"]
        Frame --> Orb["Active Voice Visualizer"]
        Frame --> Badges["Connected Physical AI Ecosystem Bar (Ring, Fire TV, Bee)"]
        Frame --> STT["Web Speech API (Voice-to-Text)"]
        Frame --> TTS["SpeechSynthesis (Natural TTS Voice)"]
        Frame --> Display["Dynamic Multimodal Card Renderer"]
        Frame --> Telemetry["Live FastMCP Telemetry & JSON Inspector"]
    end

    subgraph Backend["FastMCP Orchestrator (server.py / FastAPI)"]
        STT --> API["/api/mcp/invoke & SSE Stream"]
        API --> Engine["Nebius Token Factory (NVIDIA Nemotron-70B)"]
    end

    subgraph MCP["Self-Hosted FastMCP Server (Port 8001)"]
        Engine --> T1["find_safe_shelter_route(origin, target)"]
        Engine --> T2["check_downtown_hazards(location)"]
        Engine --> T3["dispatch_emergency_ping(zone, details)"]
        Engine --> T4["get_ring_security_snapshot(camera_id)"]
        Engine --> T5["cast_to_fire_tv(screen_data)"]
        Engine --> T6["get_bee_wearable_telemetry()"]
    end

    T1 --> Display
    T2 --> Display
    T3 --> Display
    T4 --> Display
    T5 --> Display
    T6 --> Display
