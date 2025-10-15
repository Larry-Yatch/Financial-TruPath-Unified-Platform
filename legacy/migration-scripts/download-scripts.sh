#!/bin/bash

# Script to download all Google Apps Scripts for Financial TruPath tools
# Run this from the Financial-TruPath-Unified-Platform directory

echo "📥 Downloading Google Apps Scripts for Financial TruPath Tools"
echo "============================================================"

# Create apps directory structure
mkdir -p apps/{orientation-demographics,financial-clarity,false-self-external-validation,financial-freedom-framework}

# Tool 1: Orientation-Demographics
echo ""
echo "📊 Tool 1: Orientation-Demographics"
cd apps/orientation-demographics
# Script ID appears to have extra characters, using the core ID
echo "  ⚠️ Script ID needs verification: 1S3ujOblMA1pRX4e3YEWGjj03r3yqD7PpbttcohslVuDPx8-KS3HdV60H"
echo "  Skipping for now - may need manual download"
cd ../..

# Tool 2: Financial Clarity Tool
echo ""
echo "💡 Tool 2: Financial Clarity"
cd apps/financial-clarity
clasp clone 1mBM0aQkljcoWbOh-0Zu84XJrJtItCRSEJwtXnDxkZVpKdvJO7viE5lDo
cd ../..

# Tool 3a: False Self-View
echo ""
echo "🎭 Tool 3a: False Self-View"
cd apps/false-self-external-validation
mkdir -p false-self-view
cd false-self-view
clasp clone 1pZI5ShwefZ6tdHtLhnmxu-7LLlkBiI3yXKCrpQ6_RXPQK8WMgBXz295M
cd ../../..

# Tool 3b: External Validation (already local but get latest)
echo ""
echo "✓ Tool 3b: External Validation"
cd apps/false-self-external-validation
mkdir -p external-validation
cd external-validation
clasp clone 1IHvqydiwlP8qXNuqNwBbqf5Pz5cCtziZdv51yRI9jxs3NaSs_dUmJdxM
cd ../../..

# Tool 4: Financial Freedom Framework
echo ""
echo "💰 Tool 4: Financial Freedom Framework"
cd apps/financial-freedom-framework
clasp clone 1t9ZolLEffBEXiGc3c7ozA2aAJc9hA3awKFAP2620KHuHmVPERj_HdY0N
cd ../..

# Tool 5: Issues Showing Love (download fresh copy even though local exists)
echo ""
echo "❤️ Tool 5: Issues Showing Love"
mkdir -p apps/issues-showing-love
cd apps/issues-showing-love
clasp clone 1RSVTQqeI-1oKlFdJAHxKEcZmvmOVO6kQw2tfxhfwRC5o2VaPGbmUrJMH
cd ../..

# Tool 6: Retirement Blueprint
echo ""
echo "📋 Tool 6: Retirement Blueprint"
mkdir -p apps/retirement-blueprint
cd apps/retirement-blueprint
clasp clone 1u76NxCIbrJ0suSF5TKcI1VFE6KfaLxhdhCZ183CKQ-s217AaYq5O5TwD
cd ../..

# Tool 7: Control Fear Grounding
echo ""
echo "🛡️ Tool 7: Control Fear Grounding"
mkdir -p apps/control-fear-grounding
cd apps/control-fear-grounding
clasp clone 1ERmo9o9fH8eAi9ZUbuFr0T31VgO3DrXZ1dMguEMedOqBzC-GnJwmTeqt
cd ../..

# Tool 8: Investment Tool
echo ""
echo "📈 Tool 8: Investment Tool"
mkdir -p apps/investment-tool
cd apps/investment-tool
clasp clone 1PoeKSstGaHaUXwo3ZldO2lyCGKHZab_r-ufu5OfCgnwdR8vRZ0ti5Ede
cd ../..

echo ""
echo "============================================================"
echo "✅ Download script created! Next steps:"
echo "1. Make sure you're logged in with clasp: clasp login"
echo "2. Run this script: chmod +x download-scripts.sh && ./download-scripts.sh"
echo "3. All scripts will be downloaded to apps/ directory"