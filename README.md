# MLB Trade Visualizer

An interactive visualization of MLB trade deadline movements, showing player transactions between teams on a map of the United States.

## Features

- Interactive timeline of trade movements
- Geographic visualization of team locations
- Real-time player movement animations
- Trade history feed
- Responsive design

## Live Demo

Visit the live application: [MLB Trade Visualizer](https://yourusername.github.io/mlb-trade-visualizer)

## Local Development

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mlb-trade-visualizer.git
cd mlb-trade-visualizer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## Deployment

### GitHub Pages (Recommended)

This project is configured for automatic deployment to GitHub Pages using GitHub Actions.

1. **Fork or create a new repository** on GitHub
2. **Update the repository URL** in `package.json`:
   ```json
   "repository": {
     "type": "git",
     "url": "https://github.com/YOUR_USERNAME/mlb-trade-visualizer.git"
   },
   "homepage": "https://YOUR_USERNAME.github.io/mlb-trade-visualizer"
   ```
3. **Update the base path** in `vite.config.ts`:
   ```typescript
   base: '/mlb-trade-visualizer/',
   ```
4. **Push your code** to the main branch
5. **Enable GitHub Pages** in your repository settings:
   - Go to Settings > Pages
   - Source: Deploy from a branch
   - Branch: gh-pages
   - Folder: / (root)

The GitHub Actions workflow will automatically build and deploy your site on every push to the main branch.

### Manual Deployment

If you prefer manual deployment:

1. Install gh-pages:
```bash
npm install --save-dev gh-pages
```

2. Deploy:
```bash
npm run deploy
```

## Project Structure

```
mlb-trade-visualizer/
├── src/
│   ├── components/
│   │   └── TimelineView.tsx
│   ├── services/
│   │   └── mlbApi.ts
│   ├── App.tsx
│   └── index.tsx
├── public/
│   └── usa.svg
├── vite.config.ts
└── package.json
```

## Technologies Used

- React 18
- TypeScript
- Vite
- Framer Motion
- Axios

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details 