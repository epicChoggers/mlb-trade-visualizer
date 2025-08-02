# Deployment Guide for GitHub Pages

## Prerequisites

1. **GitHub Account**: Make sure you have a GitHub account
2. **Git**: Ensure Git is installed on your machine
3. **Node.js**: Version 18 or higher

## Step-by-Step Deployment

### 1. Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right and select "New repository"
3. Name your repository: `mlb-trade-visualizer`
4. Make it **Public** (required for GitHub Pages)
5. Don't initialize with README (we already have one)
6. Click "Create repository"

### 2. Update Configuration Files

**Important**: Replace `yourusername` with your actual GitHub username in these files:

#### Update `package.json`:
```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/mlb-trade-visualizer.git"
  },
  "homepage": "https://YOUR_USERNAME.github.io/mlb-trade-visualizer"
}
```

#### Update `vite.config.ts`:
```typescript
export default defineConfig({
  plugins: [react()],
  base: '/mlb-trade-visualizer/',
  // ... rest of config
})
```

### 3. Push Code to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit"

# Add remote repository
git remote add origin https://github.com/YOUR_USERNAME/mlb-trade-visualizer.git

# Push to main branch
git push -u origin main
```

### 4. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section (in the left sidebar)
4. Under **Source**, select **Deploy from a branch**
5. Under **Branch**, select **gh-pages** and **/(root)**
6. Click **Save**

### 5. Automatic Deployment

The GitHub Actions workflow will automatically:
- Build your project when you push to main
- Deploy to GitHub Pages
- Your site will be available at: `https://YOUR_USERNAME.github.io/mlb-trade-visualizer`

### 6. Manual Deployment (Alternative)

If you prefer manual deployment:

```bash
# Install gh-pages (already done)
npm install --save-dev gh-pages

# Deploy
npm run deploy
```

## Troubleshooting

### Common Issues

1. **404 Error**: Make sure the base path in `vite.config.ts` matches your repository name
2. **Build Fails**: Check the Actions tab in your GitHub repository for error details
3. **Assets Not Loading**: Ensure all paths are relative and the base path is correct

### Check Deployment Status

1. Go to your repository on GitHub
2. Click **Actions** tab
3. You should see a workflow running for your latest push
4. Click on the workflow to see detailed logs

### Verify Deployment

1. Wait 5-10 minutes after pushing to main
2. Visit: `https://YOUR_USERNAME.github.io/mlb-trade-visualizer`
3. Your application should be live!

## Updating Your Site

To update your deployed site:

```bash
# Make your changes
# Commit and push to main
git add .
git commit -m "Update description"
git push origin main
```

The GitHub Actions workflow will automatically rebuild and redeploy your site.

## Custom Domain (Optional)

If you want to use a custom domain:

1. Go to repository **Settings** > **Pages**
2. Under **Custom domain**, enter your domain
3. Add a `CNAME` file to your repository with your domain
4. Update your DNS settings to point to GitHub Pages

## Support

If you encounter issues:
1. Check the GitHub Actions logs
2. Verify all configuration files are correct
3. Ensure your repository is public
4. Check that GitHub Pages is enabled in settings 