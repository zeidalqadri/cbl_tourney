#!/bin/bash

echo "Testing Tournament Server on port 8477..."
echo "========================================="

# Check if server is running
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8477 | grep -q "200\|304"; then
    echo "✅ Server is running on http://localhost:8477"
    
    # Test different pages
    echo ""
    echo "Testing pages:"
    
    # Home page
    if curl -s http://localhost:8477 | grep -q "tournament\|Tournament"; then
        echo "✅ Home page is accessible"
    else
        echo "⚠️  Home page may have issues"
    fi
    
    # Admin page
    if curl -s http://localhost:8477/admin | grep -q "Admin\|admin"; then
        echo "✅ Admin page is accessible"
    else
        echo "⚠️  Admin page may have issues"
    fi
    
    # Photos page
    if curl -s http://localhost:8477/admin/photos | grep -q "Photo\|photo"; then
        echo "✅ Photo management page is accessible"
    else
        echo "⚠️  Photo management page may have issues"
    fi
    
    # Matches page
    if curl -s http://localhost:8477/admin/matches | grep -q "Match\|match"; then
        echo "✅ Match management page is accessible"
    else
        echo "⚠️  Match management page may have issues"
    fi
    
    echo ""
    echo "========================================="
    echo "You can now access the tournament system at:"
    echo ""
    echo "  🌐 Main site:     http://localhost:8477"
    echo "  ⚙️  Admin panel:   http://localhost:8477/admin"
    echo "  📸 Photos:        http://localhost:8477/admin/photos"
    echo "  🏆 Matches:       http://localhost:8477/admin/matches"
    echo ""
    echo "Google Drive integration is configured with:"
    echo "  Service Account: statpad-service@zeidgeistdotcom.iam.gserviceaccount.com"
    echo "  Folder ID: 1FhykHDxOmzjQ26tpJ8AbvFayFZ1qFSJk"
    
else
    echo "⚠️  Server is not responding on port 8477"
    echo ""
    echo "To start the server, run:"
    echo "  eval \"\$(/opt/homebrew/bin/conda shell.bash hook)\""
    echo "  conda activate tourney"
    echo "  npm run dev -- --port 8477"
fi