#!/bin/bash

# Script to download all Google Apps Scripts for Financial TruPath tools

echo "📥 Downloading all Google Apps Scripts..."

# Create directories if they don't exist
mkdir -p apps/orientation-demographics/scripts
mkdir -p apps/financial-clarity/scripts
mkdir -p apps/false-self-view/scripts
mkdir -p apps/external-validation/scripts
mkdir -p apps/financial-freedom-framework/scripts
mkdir -p apps/issues-showing-love/scripts
mkdir -p apps/retirement-blueprint/scripts
mkdir -p apps/control-fear-grounding/scripts
mkdir -p apps/investment-tool/scripts

# Tool 1: Orientation-Demographics
echo "📊 Downloading Tool 1: Orientation-Demographics..."
cd apps/orientation-demographics/scripts
clasp clone 1S3ujOblMA1pRX4e3YEWGjj03r3yqD7PpbttcohslVuDPx8-KS3HdV60H
cd ../../..

# Tool 2: Financial Clarity
echo "💡 Downloading Tool 2: Financial Clarity..."
cd apps/financial-clarity/scripts
clasp clone 1mBM0aQkljcoWbOh-0Zu84XJrJtItCRSEJwtXnDxkZVpKdvJO7viE5lDo
cd ../../..

# Tool 3a: False Self-View
echo "🎭 Downloading Tool 3a: False Self-View..."
cd apps/false-self-view/scripts
clasp clone 1pZI5ShwefZ6tdHtLhnmxu-7LLlkBiI3yXKCrpQ6_RXPQK8WMgBXz295M
cd ../../..

# Tool 3b: External Validation
echo "✔️ Downloading Tool 3b: External Validation..."
cd apps/external-validation/scripts
clasp clone 1IHvqydiwlP8qXNuqNwBbqf5Pz5cCtziZdv51yRI9jxs3NaSs_dUmJdxM
cd ../../..

# Tool 4: Financial Freedom Framework
echo "🎯 Downloading Tool 4: Financial Freedom Framework..."
cd apps/financial-freedom-framework/scripts
clasp clone 1t9ZolLEffBEXiGc3c7ozA2aAJc9hA3awKFAP2620KHuHmVPERj_HdY0N
cd ../../..

# Tool 5: Issues Showing Love
echo "❤️ Downloading Tool 5: Issues Showing Love..."
cd apps/issues-showing-love/scripts
clasp clone 1RSVTQqeI-1oKlFdJAHxKEcZmvmOVO6kQw2tfxhfwRC5o2VaPGbmUrJMH
cd ../../..

# Tool 6: Retirement Blueprint
echo "📋 Downloading Tool 6: Retirement Blueprint..."
cd apps/retirement-blueprint/scripts
clasp clone 1u76NxCIbrJ0suSF5TKcI1VFE6KfaLxhdhCZ183CKQ-s217AaYq5O5TwD
cd ../../..

# Tool 7: Control Fear Grounding
echo "🛡️ Downloading Tool 7: Control Fear Grounding..."
cd apps/control-fear-grounding/scripts
clasp clone 1ERmo9o9fH8eAi9ZUbuFr0T31VgO3DrXZ1dMguEMedOqBzC-GnJwmTeqt
cd ../../..

# Tool 8: Investment Tool
echo "💰 Downloading Tool 8: Investment Tool..."
cd apps/investment-tool/scripts
clasp clone 1PoeKSstGaHaUXwo3ZldO2lyCGKHZab_r-ufu5OfCgnwdR8vRZ0ti5Ede
cd ../../..

echo "✅ All scripts download attempted!"
echo "📁 Scripts are located in apps/[tool-name]/scripts/"