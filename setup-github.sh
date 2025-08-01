#!/bin/bash

# mlbTradeMap GitHub Repository Setup Script
# This script helps set up the GitHub repository with proper configuration

echo "🏟️ Setting up mlbTradeMap for GitHub..."

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
fi

# Add all files
echo "📝 Adding files to git..."
git add .

# Create initial commit
echo "💾 Creating initial commit..."
git commit -m "feat: initial commit - MLB trade deadline visualization

- Interactive US map with team positioning
- Animated player movements between teams
- Timeline controls and transaction feed
- Debug mode for team positioning
- Comprehensive GitHub setup with templates"

# Set up main branch (if not already set)
if git branch --show-current | grep -q "main"; then
    echo "✅ Already on main branch"
else
    echo "🔄 Creating main branch..."
    git branch -M main
fi

echo ""
echo "🎉 Repository setup complete!"
echo ""
echo "Next steps:"
echo "1. Create a new repository on GitHub named 'mlbTradeMap'"
echo "2. Add the remote origin: git remote add origin https://github.com/YOUR_USERNAME/mlbTradeMap.git"
echo "3. Push to GitHub: git push -u origin main"
echo "4. Enable GitHub Pages in repository settings"
echo "5. Update the repository URL in package.json and README.md"
echo ""
echo "Optional:"
echo "- Set up branch protection rules"
echo "- Configure GitHub Actions secrets"
echo "- Add repository topics: mlb, trades, visualization, baseball, react, typescript" 