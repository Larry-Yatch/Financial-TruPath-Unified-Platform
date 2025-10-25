#!/bin/bash

# Start Agents - Google Apps Script Development Guardian
# Makes it easy to run individual or all agents

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🤖 Google Apps Script Agent System${NC}"
echo "=================================="
echo ""

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is required but not installed${NC}"
    exit 1
fi

# Show menu if no argument provided
if [ $# -eq 0 ]; then
    echo "Choose an agent to run:"
    echo ""
    echo "  1) 🤖 Master Agent (runs all agents)"
    echo "  2) 🏥 Gas-Doctor (diagnose GAS issues)"
    echo "  3) 🚀 Deploy-Guardian (deployment safety)"
    echo "  4) 📊 Sheets-Monitor (real-time monitoring)"
    echo "  5) 🔄 Callback-Surgeon (async fixes)"
    echo "  6) ⏱️  Quota-Keeper (resource tracking)"
    echo ""
    echo -n "Enter choice [1-6]: "
    read choice
else
    choice=$1
fi

case $choice in
    1|master|all)
        echo -e "${GREEN}Starting Master Agent...${NC}"
        echo "This will run all agents continuously."
        echo "Press Ctrl+C to stop"
        echo ""
        node agents/master-agent.js start
        ;;
        
    2|doctor|gas)
        echo -e "${GREEN}Running Gas-Doctor...${NC}"
        echo ""
        if [ "$2" == "--watch" ]; then
            node agents/gas-doctor.js watch
        elif [ "$2" == "--fix" ]; then
            node agents/gas-doctor.js Code.js --fix
        else
            node agents/gas-doctor.js
        fi
        ;;
        
    3|deploy|guardian)
        echo -e "${GREEN}Running Deploy-Guardian...${NC}"
        echo ""
        if [ "$2" == "--deploy" ]; then
            node agents/deploy-guardian.js deploy "$3"
        elif [ "$2" == "--cleanup" ]; then
            node agents/deploy-guardian.js cleanup
        else
            node agents/deploy-guardian.js check
        fi
        ;;
        
    4|sheets|monitor)
        echo -e "${GREEN}Starting Sheets-Monitor...${NC}"
        echo "Press Ctrl+C to stop"
        echo ""
        if [ "$2" == "--verbose" ]; then
            node agents/sheets-monitor.js start --verbose
        else
            node agents/sheets-monitor.js start
        fi
        ;;
        
    5|callback|surgeon)
        echo -e "${GREEN}Running Callback-Surgeon...${NC}"
        echo ""
        if [ "$2" == "--fix" ]; then
            node agents/callback-surgeon.js analyze --fix
        else
            node agents/callback-surgeon.js analyze
        fi
        ;;
        
    6|quota|keeper)
        echo -e "${GREEN}Running Quota-Keeper...${NC}"
        echo ""
        if [ "$2" == "--monitor" ]; then
            node agents/quota-keeper.js monitor
        else
            node agents/quota-keeper.js analyze
        fi
        ;;
        
    quick)
        echo -e "${GREEN}Quick Health Check${NC}"
        echo "Running all agents once..."
        echo ""
        echo "🏥 Gas-Doctor:"
        node agents/gas-doctor.js | head -20
        echo ""
        echo "🚀 Deploy-Guardian:"
        node agents/deploy-guardian.js check | head -20
        echo ""
        echo "🔄 Callback-Surgeon:"
        node agents/callback-surgeon.js analyze | head -20
        echo ""
        echo "⏱️ Quota-Keeper:"
        node agents/quota-keeper.js analyze | head -20
        ;;
        
    fix)
        echo -e "${YELLOW}Auto-Fix Mode${NC}"
        echo "Attempting to fix common issues..."
        echo ""
        node agents/gas-doctor.js Code.js --fix
        node agents/callback-surgeon.js analyze --fix
        echo ""
        echo -e "${GREEN}✅ Auto-fix complete${NC}"
        ;;
        
    *)
        echo -e "${RED}Invalid choice${NC}"
        echo ""
        echo "Usage: ./start-agents.sh [option]"
        echo ""
        echo "Options:"
        echo "  1|master|all     - Run all agents continuously"
        echo "  2|doctor         - Run Gas-Doctor"
        echo "  3|deploy         - Run Deploy-Guardian"
        echo "  4|sheets         - Run Sheets-Monitor"
        echo "  5|callback       - Run Callback-Surgeon"
        echo "  6|quota          - Run Quota-Keeper"
        echo "  quick            - Quick health check"
        echo "  fix              - Auto-fix common issues"
        echo ""
        echo "Examples:"
        echo "  ./start-agents.sh master"
        echo "  ./start-agents.sh doctor --fix"
        echo "  ./start-agents.sh deploy --deploy \"New feature\""
        echo "  ./start-agents.sh sheets --verbose"
        exit 1
        ;;
esac