#!/bin/bash

echo "📝 Clasp Authentication Helper"
echo "=============================="
echo ""
echo "Please follow these steps:"
echo ""
echo "1. Run this command in your terminal:"
echo "   clasp login"
echo ""
echo "2. When the browser opens, authorize with your Google account"
echo ""
echo "3. You should see 'Authorization successful' in your browser"
echo ""
echo "4. Once complete, run: ./download-missing-scripts.sh"
echo ""
echo "Press Enter to start clasp login..."
read

clasp login