"""
Alexa+ Guardian SafeRoute - Official FastMCP Server
Exposes civic hazard reports, safe havens, and emergency SOS dispatch tools over SSE.
"""

import sys
import os
import argparse
from typing import Dict

# Ensure utf-8 encoding on standard streams for cross-platform compatibility
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

# Ensure local imports work regardless of working directory
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

from tools import (
    execute_get_hazard_reports,
    execute_find_safe_haven,
    execute_dispatch_emergency_ping
)

# Robust import supporting FastMCP across SDK versions
try:
    from mcp.server.fastmcp import FastMCP
except ImportError:
    try:
        from mcp.server.mcpserver import MCPServer as FastMCP
    except ImportError:
        raise ImportError(
            "The official 'mcp' SDK is required. Please install 'mcp>=1.2.0,<2.0.0' or 'mcp>=2.0.0'."
        )

# Initialize the FastMCP Server instance
mcp = FastMCP(
    name="AlexaGuardianSafeRoute",
    host="127.0.0.1",
    port=8001
)

# ----------------------------------------------------------------------------
# Tool 1: get_hazard_reports
# ----------------------------------------------------------------------------
@mcp.tool(
    name="get_hazard_reports",
    description=(
        "Returns real-time civic hazard reports, road closures, flash floods, "
        "downed power lines, and municipal weather alerts for a specified location."
    )
)
def get_hazard_reports(location: str) -> Dict:
    """
    Retrieve real-time municipal hazard alerts for a location.

    Args:
        location: The municipal district, neighborhood, or city zone (e.g. 'Downtown', 'Riverside', 'Metro Central').

    Returns:
        Structured hazard alerts including severity, affected streets, recommended detour, and civil defense advisory.
    """
    return execute_get_hazard_reports(location)


# ----------------------------------------------------------------------------
# Tool 2: find_safe_haven
# ----------------------------------------------------------------------------
@mcp.tool(
    name="find_safe_haven",
    description=(
        "Returns the nearest verified emergency safe spots, clinics, fire stations, "
        "and resilience storm shelters with capacity, backup power, and medical staff status."
    )
)
def find_safe_haven(current_zone: str) -> Dict:
    """
    Find verified emergency refuge points and safe havens near a current zone.

    Args:
        current_zone: The citizen's current vicinity or neighborhood (e.g. 'Riverside', 'Downtown', 'Metro Central').

    Returns:
        Structured safe haven recommendations with distance, walking time, capacity status, power backup, and approach instructions.
    """
    return execute_find_safe_haven(current_zone)


# ----------------------------------------------------------------------------
# Tool 3: dispatch_emergency_ping
# ----------------------------------------------------------------------------
@mcp.tool(
    name="dispatch_emergency_ping",
    description=(
        "Dispatches an urgent SOS alert to civic first responders and municipal operations centers. "
        "Returns alert tracking ID, dispatched units, ETA, and immediate safety survival protocol."
    )
)
def dispatch_emergency_ping(zone: str, emergency_details: str) -> Dict:
    """
    Transmit an emergency SOS beacon to municipal first responders.

    Args:
        zone: Current municipal area or location where assistance is needed (e.g. 'Metro Central').
        emergency_details: Specific description of the distress scenario (e.g. 'flash flood entering basement', 'trapped in car').

    Returns:
        Structured confirmation with alert tracking ID, assigned units, estimated arrival time, and step-by-step safety guidance.
    """
    return execute_dispatch_emergency_ping(zone, emergency_details)


# ----------------------------------------------------------------------------
# Server Entry Point
# ----------------------------------------------------------------------------
def start_server(host: str = "127.0.0.1", port: int = 8001, transport: str = "sse"):
    """Starts the FastMCP server with Streamable HTTP / SSE transport."""
    print("=" * 70)
    print(" 🛡️  Alexa+ Guardian SafeRoute - Model Context Protocol (MCP) Server")
    print("=" * 70)
    print(f" • Transport: {transport.upper()} (Server-Sent Events)")
    print(f" • SSE Endpoint: http://{host}:{port}/sse")
    print(f" • Messages Endpoint: http://{host}:{port}/messages")
    print(f" • Loaded Tools: 3 registered (get_hazard_reports, find_safe_haven, dispatch_emergency_ping)")
    print("=" * 70)
    
    # Configure FastMCP server settings
    mcp.settings.host = host
    mcp.settings.port = port
    
    # Run server via SSE transport
    mcp.run(transport=transport)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Alexa+ Guardian SafeRoute MCP Server")
    parser.add_argument("--host", default="127.0.0.1", help="Host interface to bind (default: 127.0.0.1)")
    parser.add_argument("--port", type=int, default=8001, help="Port to listen on (default: 8001)")
    parser.add_argument("--transport", default="sse", choices=["sse", "stdio", "streamable-http"], help="MCP transport protocol (default: sse)")
    args = parser.parse_args()

    start_server(host=args.host, port=args.port, transport=args.transport)
