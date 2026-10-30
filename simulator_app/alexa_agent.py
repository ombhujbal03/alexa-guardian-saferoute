"""
Alexa+ Guardian SafeRoute - Voice Agent Orchestrator & MCP Client
Handles intent parsing, SSE MCP tool invocation, multimodal synthesis, and streaming.
"""

import os
import sys
import time
import json
import re
import asyncio
from typing import Dict, Any, AsyncGenerator, Optional
import httpx

# Ensure workspace paths are accessible
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if base_dir not in sys.path:
    sys.path.insert(0, base_dir)

# Import local direct execution fallback
from mcp_server.tools import (
    execute_get_hazard_reports,
    execute_find_safe_haven,
    execute_dispatch_emergency_ping
)

# Optional official MCP client session
MCP_CLIENT_AVAILABLE = False
try:
    from mcp import ClientSession
    from mcp.client.sse import sse_client
    MCP_CLIENT_AVAILABLE = True
except ImportError:
    MCP_CLIENT_AVAILABLE = False


class AlexaGuardianAgent:
    """
    Simulated Alexa+ Voice Agent that interfaces with the FastMCP Server.
    Provides dynamic tool routing, SSE client transport, and multimodal synthesis.
    """

    def __init__(self, mcp_sse_url: str = "http://127.0.0.1:8001/sse"):
        self.mcp_sse_url = mcp_sse_url

    async def check_mcp_server_health(self) -> Dict[str, Any]:
        """Checks if the external FastMCP SSE server is reachable."""
        import socket
        try:
            # Ultra-fast socket probe to port 8001 without blocking on persistent SSE streams
            loop = asyncio.get_running_loop()
            online = await loop.run_in_executor(
                None,
                lambda: self._check_socket_online("127.0.0.1", 8001)
            )
            if online:
                return {
                    "online": True,
                    "endpoint": self.mcp_sse_url,
                    "transport": "HTTP / Server-Sent Events (SSE)"
                }
            return {
                "online": False,
                "endpoint": self.mcp_sse_url,
                "transport": "Local Fallback Mode"
            }
        except Exception:
            return {
                "online": False,
                "endpoint": self.mcp_sse_url,
                "transport": "Local Fallback Mode"
            }

    @staticmethod
    def _check_socket_online(host: str, port: int) -> bool:
        import socket
        try:
            with socket.create_connection((host, port), timeout=0.5):
                return True
        except Exception:
            return False

    def route_intent(self, query: str) -> Dict[str, Any]:
        """
        Dynamically analyzes user spoken/text query and determines which MCP tool to call,
        extracting key parameters such as location, zone, and emergency details.
        """
        q = (query or "").strip()
        lower_q = q.lower()

        # Known zones for quick extraction
        zones = ["downtown", "riverside", "metro central", "uptown", "harbor", "west end", "eastside", "north district"]
        detected_zone = None
        for z in zones:
            if z in lower_q:
                detected_zone = z.title()
                break

        # Fallback zone regex if user said "in [location]"
        if not detected_zone:
            match = re.search(r'\b(?:in|at|near|for|around)\s+([A-Za-z0-9\s]+?)(?:,\s*|\.|$|\bwith\b|\bfacing\b)', q, re.IGNORECASE)
            if match:
                extracted = match.group(1).strip()
                # Exclude common stopping words
                if extracted.lower() not in ["the", "a", "an", "danger", "trouble", "emergency", "flood", "now"]:
                    detected_zone = extracted.title()

        # 1. Emergency Dispatch Intent (Highest Priority)
        sos_triggers = ["emergency", "sos", "help", "dispatch", "trapped", "ping", "rescue", "911", "distress", "urgent", "drowning", "stuck"]
        if any(trigger in lower_q for trigger in sos_triggers):
            zone = detected_zone or "Metro Central"
            # Extract emergency context
            details = q
            # Clean trigger prefix if user said "Alexa, dispatch an emergency SOS in Metro Central, flash flood entering building"
            details_clean = re.sub(r'^(alexa,?\s*)?(please\s*)?(dispatch|send|call)\s+(an?\s+)?(emergency\s+)?(sos|alert|ping)?\s*(in\s+[^,]+,?\s*)?', '', q, flags=re.IGNORECASE).strip()
            if not details_clean or len(details_clean) < 3:
                details_clean = "Civilian trapped in hazardous location requiring rapid first responder extraction."

            return {
                "tool": "dispatch_emergency_ping",
                "arguments": {
                    "zone": zone,
                    "emergency_details": details_clean
                },
                "intent_label": "Emergency SOS First Responder Dispatch",
                "rationale": f"High-urgency emergency indicators detected. Dispatching SOS alert to first responders in {zone}."
            }

        # 2. Safe Haven Finder Intent
        shelter_triggers = ["safe haven", "safe", "haven", "shelter", "clinic", "hospital", "refuge", "station", "where to go", "where can i go", "where should i go", "evacuate", "bunker"]
        if any(trigger in lower_q for trigger in shelter_triggers):
            zone = detected_zone or "Riverside"
            return {
                "tool": "find_safe_haven",
                "arguments": {
                    "current_zone": zone
                },
                "intent_label": "Verified Emergency Safe Haven Locator",
                "rationale": f"User seeking safe refuge or emergency clinic. Querying nearest verified havens for {zone}."
            }

        # 3. Hazard Reports Intent (Default / Civic Alerts)
        location = detected_zone or "Downtown"
        return {
            "tool": "get_hazard_reports",
            "arguments": {
                "location": location
            },
            "intent_label": "Real-Time Civic Hazard & Road Warning Retrieval",
            "rationale": f"Civilian requesting civic conditions. Pulling active hazard reports and detours for {location}."
        }

    async def execute_mcp_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes the tool via official FastMCP SSE Client transport, with
        seamless local fallback if the remote SSE server is starting or unreachable.
        """
        start_time = time.perf_counter()
        execution_transport = "LOCAL_MCP_INSTANCE"
        raw_result = None

        # Attempt remote FastMCP SSE execution if client is available
        if MCP_CLIENT_AVAILABLE:
            try:
                # 2.0 second connection timeout to preserve instant voice response latency
                async with asyncio.timeout(2.0):
                    async with sse_client(self.mcp_sse_url) as (read_stream, write_stream):
                        async with ClientSession(read_stream, write_stream) as session:
                            await session.initialize()
                            call_res = await session.call_tool(tool_name, arguments)
                            # Extract structured content
                            if hasattr(call_res, "content") and call_res.content:
                                text_content = call_res.content[0].text
                                raw_result = json.loads(text_content)
                            else:
                                raw_result = call_res
                            execution_transport = "REMOTE_SSE_MCP_SERVER"
            except Exception as e:
                # Gracefully fall back to local direct execution
                execution_transport = f"LOCAL_FALLBACK (SSE unreachable: {type(e).__name__})"

        # Local fallback execution
        if raw_result is None:
            if tool_name == "get_hazard_reports":
                raw_result = execute_get_hazard_reports(arguments.get("location", "Downtown"))
            elif tool_name == "find_safe_haven":
                raw_result = execute_find_safe_haven(arguments.get("current_zone", "Riverside"))
            elif tool_name == "dispatch_emergency_ping":
                raw_result = execute_dispatch_emergency_ping(
                    arguments.get("zone", "Metro Central"),
                    arguments.get("emergency_details", "Civilian trapped in floodwater")
                )
            else:
                raw_result = {"error": f"Unknown tool: {tool_name}"}

        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)

        return {
            "tool": tool_name,
            "arguments": arguments,
            "result": raw_result,
            "latency_ms": elapsed_ms,
            "transport": execution_transport
        }

    def synthesize_alexa_response(self, tool_name: str, result_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Synthesizes both conversational speech text (for Alexa TTS) and
        multimodal visual card data (for the Echo Show interface).
        """
        if tool_name == "get_hazard_reports":
            loc = result_data.get("location", "the area")
            risk = result_data.get("risk_level", "MODERATE")
            count = result_data.get("active_hazards_count", 0)
            hazards = result_data.get("hazards", [])

            if hazards:
                top_hazard = hazards[0]
                speech_text = (
                    f"In {loc}, there are {count} active hazard alerts with an overall {risk} risk rating. "
                    f"The primary concern is {top_hazard.get('hazard_type')}. {top_hazard.get('description')} "
                    f"Recommended detour: {top_hazard.get('recommended_detour')}"
                )
            else:
                speech_text = f"All roadways in {loc} are currently verified clear. No active hazard alerts found."

            card_data = {
                "card_type": "hazard_report",
                "headline": f"Civic Hazard Alert: {loc}",
                "risk_level": risk,
                "badge_color": "red" if risk == "CRITICAL" else ("amber" if risk == "HIGH" else "yellow"),
                "advisory": result_data.get("civil_defense_advisory", ""),
                "items": hazards,
                "timestamp": result_data.get("query_timestamp", "")
            }

        elif tool_name == "find_safe_haven":
            zone = result_data.get("current_zone", "your zone")
            primary = result_data.get("primary_recommendation", {})
            secondary = result_data.get("secondary_options", [])
            total = result_data.get("havens_found", 1)

            speech_text = (
                f"I found {total} verified safe spots near {zone}. The nearest is {primary.get('name')}, "
                f"located {primary.get('distance_miles')} miles away, approximately {primary.get('estimated_walk_mins')} minutes on foot. "
                f"Capacity status is {primary.get('capacity_status')}, with active emergency backup power and medical personnel present. "
                f"Navigation advice: {primary.get('recommended_approach')}"
            )

            card_data = {
                "card_type": "safe_haven",
                "headline": f"Verified Safe Havens: {zone}",
                "primary": primary,
                "secondary": secondary,
                "total_count": total,
                "timestamp": result_data.get("query_timestamp", "")
            }

        elif tool_name == "dispatch_emergency_ping":
            speech_text = result_data.get(
                "alexa_spoken_ack",
                f"Emergency SOS alert dispatched to first responders for {result_data.get('zone')}."
            )

            card_data = {
                "card_type": "emergency_dispatch",
                "headline": "🚨 SOS DISPATCH TRANSMITTED",
                "tracking_id": result_data.get("alert_tracking_id", "SOS-ALX-0000"),
                "zone": result_data.get("zone", ""),
                "priority_tier": result_data.get("priority_tier", "TIER_1"),
                "eta_minutes": result_data.get("estimated_arrival_minutes", 4),
                "assigned_units": result_data.get("assigned_units", []),
                "reported_emergency": result_data.get("reported_emergency", ""),
                "safety_protocol_steps": result_data.get("safety_protocol_steps", []),
                "beacon_status": result_data.get("beacon_status", "ACTIVE"),
                "timestamp": result_data.get("dispatch_timestamp", "")
            }

        else:
            speech_text = "I have processed your request with the civic safety database."
            card_data = {
                "card_type": "general",
                "headline": "Alexa+ Guardian SafeRoute",
                "details": result_data
            }

        return {
            "speech_text": speech_text,
            "card_data": card_data
        }

    async def stream_query_lifecycle(self, query: str) -> AsyncGenerator[str, None]:
        """
        Executes the full agent reasoning lifecycle, yielding formatted SSE events:
        1. thinking (Intent analysis)
        2. tool_call (MCP tool & arguments selected)
        3. tool_result (Raw MCP output & latency)
        4. alexa_response (TTS speech & Echo Show multimodal card)
        5. done
        """
        # Step 1: Thinking / Routing
        yield f"event: thinking\ndata: {json.dumps({'message': 'Alexa+ analyzing voice query & routing to MCP safety tool...', 'query': query})}\n\n"
        await asyncio.sleep(0.3)

        routing = self.route_intent(query)
        tool_name = routing["tool"]
        tool_args = routing["arguments"]

        # Step 2: Tool Call Dispatched
        yield f"event: tool_call\ndata: {json.dumps({'tool': tool_name, 'arguments': tool_args, 'intent_label': routing['intent_label'], 'rationale': routing['rationale']})}\n\n"
        await asyncio.sleep(0.2)

        # Step 3: MCP Tool Execution
        execution = await self.execute_mcp_tool(tool_name, tool_args)
        yield f"event: tool_result\ndata: {json.dumps(execution)}\n\n"
        await asyncio.sleep(0.2)

        # Step 4: Alexa Multimodal Synthesis
        synthesis = self.synthesize_alexa_response(tool_name, execution["result"])
        payload = {
            "speech_text": synthesis["speech_text"],
            "card_data": synthesis["card_data"],
            "tool_used": tool_name,
            "latency_ms": execution["latency_ms"],
            "transport": execution["transport"]
        }
        yield f"event: alexa_response\ndata: {json.dumps(payload)}\n\n"

        # Step 5: Completed
        yield f"event: done\ndata: {json.dumps({'status': 'complete'})}\n\n"
