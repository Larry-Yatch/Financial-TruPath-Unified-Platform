#!/bin/bash

# Start integrated monitoring with Claude bridge

echo "🤖 Starting Integrated Agent System"
echo "===================================="
echo ""

# Start Master Agent in background
echo "Starting Master Agent..."
node agents/master-agent.js start &
MASTER_PID=$!

# Start Claude Bridge
echo "Starting Claude Bridge..."
node agents/claude-bridge.js monitor &
BRIDGE_PID=$!

echo ""
echo "✅ Integrated system running!"
echo ""
echo "Local agents are monitoring continuously"
echo "Claude bridge will create requests for complex issues"
echo ""
echo "When you see 'CLAUDE AGENT REQUEST CREATED':"
echo "  1. Note the filename"
echo "  2. Tell Claude to process that request"
echo ""
echo "Press Ctrl+C to stop all agents"

# Wait and handle shutdown
trap "kill $MASTER_PID $BRIDGE_PID; exit" INT
wait
