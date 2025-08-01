# GitHub Setup Guide for mlbTradeMap

This guide will help you set up the mlbTradeMap project on GitHub with all the necessary configurations and best practices.

## 🚀 Quick Setup

### 1. Run the Setup Script

**Windows:**
```bash
setup-github.bat
```

**Mac/Linux:**
```bash
chmod +x setup-github.sh
./setup-github.sh
```

### 2. Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right and select "New repository"
3. Name the repository: `mlbTradeMap`
4. Make it **Public** (for GitHub Pages)
5. **Don't** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

### 3. Connect Local Repository to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/mlbTradeMap.git
git push -u origin main
```

## 📋 Repository Configuration

### Repository Settings

1. **Description**: "Interactive visualization of MLB trade deadline movements showing player transfers between teams on a geographic map of the United States."

2. **Topics**: Add these topics to your repository:
   - `mlb`
   - `trades`
   - `visualization`
   - `baseball`
   - `react`
   - `typescript`
   - `framer-motion`
   - `vite`

3. **Website**: Set to `https://YOUR_USERNAME.github.io/mlbTradeMap`

### Branch Protection Rules

1. Go to Settings → Branches
2. Add rule for `main` branch:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Include administrators

### GitHub Pages Setup

1. Go to Settings → Pages
2. Source: Deploy from a branch
3. Branch: `gh-pages` (will be created by GitHub Actions)
4. Folder: `/ (root)`
5. Save

## 🔧 GitHub Actions

The project includes two workflows:

### 1. Deploy Workflow (`.github/workflows/deploy.yml`)
- Automatically builds and deploys to GitHub Pages
- Triggers on pushes to main branch
- Uses Node.js 18 and npm

### 2. Test Workflow (`.github/workflows/test.yml`)
- Runs TypeScript checks and builds
- Checks for security vulnerabilities
- Triggers on pushes and pull requests

## 📝 Files Created

### Documentation
- `README.md` - Comprehensive project documentation
- `CONTRIBUTING.md` - Contribution guidelines
- `CODE_OF_CONDUCT.md` - Community standards
- `SECURITY.md` - Security policy
- `CHANGELOG.md` - Version history
- `LICENSE` - MIT license

### GitHub Templates
- `.github/ISSUE_TEMPLATE/bug_report.md` - Bug report template
- `.github/ISSUE_TEMPLATE/feature_request.md` - Feature request template
- `.github/pull_request_template.md` - Pull request template

### Configuration
- `.gitignore` - Comprehensive git ignore rules
- `package.json` - Updated with proper metadata
- `.github/workflows/deploy.yml` - Deployment workflow
- `.github/workflows/test.yml` - Testing workflow

## 🎯 Next Steps

### 1. Update Repository URLs

Replace `yourusername` with your actual GitHub username in:
- `package.json` (repository and homepage fields)
- `README.md` (all GitHub links)
- `CONTRIBUTING.md` (GitHub links)

### 2. Enable GitHub Pages

1. Go to repository Settings → Pages
2. Source: Deploy from a branch
3. Branch: `gh-pages`
4. Save

### 3. Set Up Dependabot (Optional)

1. Go to Settings → Security → Dependabot
2. Enable for npm
3. Configure update schedule

### 4. Add Repository Badges

Add these badges to your README:

```markdown
![Build Status](https://github.com/YOUR_USERNAME/mlbTradeMap/workflows/Test%20and%20Lint/badge.svg)
![Deploy Status](https://github.com/YOUR_USERNAME/mlbTradeMap/workflows/Deploy%20to%20GitHub%20Pages/badge.svg)
```

## 🔍 Verification Checklist

- [ ] Repository created on GitHub
- [ ] Local repository pushed to GitHub
- [ ] GitHub Pages enabled
- [ ] Branch protection rules configured
- [ ] Repository topics added
- [ ] URLs updated in package.json and README
- [ ] GitHub Actions workflows working
- [ ] Live site accessible at `https://YOUR_USERNAME.github.io/mlbTradeMap`

## 🆘 Troubleshooting

### Common Issues

1. **GitHub Pages not working**
   - Check that the `gh-pages` branch exists
   - Verify GitHub Actions workflow ran successfully
   - Check repository settings for Pages configuration

2. **Build failures**
   - Check GitHub Actions logs
   - Verify all dependencies are in package.json
   - Ensure TypeScript compilation passes

3. **Repository not found**
   - Verify the repository URL is correct
   - Check that the repository is public
   - Ensure you have proper permissions

## 📞 Support

If you encounter any issues:
1. Check the GitHub Actions logs
2. Review the repository settings
3. Open an issue in the repository
4. Check the troubleshooting section above

---

**Happy coding! ⚾** 