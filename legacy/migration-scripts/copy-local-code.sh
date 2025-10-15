#!/bin/bash

# Script to copy existing local code to unified platform
# Run this from the Financial-TruPath-Unified-Platform directory

echo "📂 Copying Existing Local Code to Unified Platform"
echo "============================================================"

# Tool 3b: External Validation (local portion)
echo ""
echo "✓ Copying External Validation (local code)"
cp -r /Users/Larry/code/External-Validation-Grounding/* apps/false-self-external-validation/external-validation-local/ 2>/dev/null || mkdir -p apps/false-self-external-validation/external-validation-local && cp -r /Users/Larry/code/External-Validation-Grounding/* apps/false-self-external-validation/external-validation-local/

# Tool 5: Issues Showing Love (local backup)
echo "❤️ Copying Issues Showing Love (local code)"
cp -r /Users/Larry/code/Issues-Showing-Love-Grounding/* apps/issues-showing-love-local/ 2>/dev/null || mkdir -p apps/issues-showing-love-local && cp -r /Users/Larry/code/Issues-Showing-Love-Grounding/* apps/issues-showing-love-local/

# Tool 6: Retirement Blueprint (if exists locally)
echo "📋 Checking for Retirement Blueprint (local code)"
if [ -d "/Users/Larry/code/retirement-blueprint" ]; then
    cp -r /Users/Larry/code/retirement-blueprint/* apps/retirement-blueprint-local/ 2>/dev/null || mkdir -p apps/retirement-blueprint-local && cp -r /Users/Larry/code/retirement-blueprint/* apps/retirement-blueprint-local/
    echo "  ✓ Copied"
else
    echo "  ⚠️ Not found locally - will use downloaded version"
fi

# Tool 7: Control Fear Grounding (local)
echo "🛡️ Copying Control Fear Grounding (local code)"
cp -r /Users/Larry/code/Control_Fear_Grounding/* apps/control-fear-grounding-local/ 2>/dev/null || mkdir -p apps/control-fear-grounding-local && cp -r /Users/Larry/code/Control_Fear_Grounding/* apps/control-fear-grounding-local/

# Tool 8: Investment Tool (local)
echo "📈 Copying Investment Tool (local code)"
cp -r /Users/Larry/code/Control_Fear_Investment_Tool/* apps/investment-tool-local/ 2>/dev/null || mkdir -p apps/investment-tool-local && cp -r /Users/Larry/code/Control_Fear_Investment_Tool/* apps/investment-tool-local/

# Shared Libraries
echo ""
echo "📚 Copying Shared Libraries"
cp -r /Users/Larry/code/shared-libs shared/ 2>/dev/null || mkdir -p shared && cp -r /Users/Larry/code/shared-libs/* shared/libs/

# Investment Tool Redirect
echo "🔀 Copying Investment Tool Redirect"
cp -r /Users/Larry/code/investment-tool-redirect apps/investment-tool-redirect/ 2>/dev/null || mkdir -p apps/investment-tool-redirect && cp -r /Users/Larry/code/investment-tool-redirect/* apps/investment-tool-redirect/

# Google Sheets Tools
echo "🔧 Copying Google Sheets Tools"
cp -r /Users/Larry/code/google-sheets-tools shared/google-sheets-tools/ 2>/dev/null || mkdir -p shared/google-sheets-tools && cp -r /Users/Larry/code/google-sheets-tools/* shared/google-sheets-tools/

echo ""
echo "============================================================"
echo "✅ Copy script created! Run with:"
echo "   chmod +x copy-local-code.sh && ./copy-local-code.sh"
echo ""
echo "After running both scripts, you'll have:"
echo "  • All Google Apps Scripts downloaded in apps/"
echo "  • All local code copied to apps/*-local/"
echo "  • Ready to organize and plan migration"