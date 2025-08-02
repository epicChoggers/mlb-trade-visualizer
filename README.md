# mlbTradeMap 🏟️⚾

An interactive visualization of MLB trade deadline movements showing player transfers between teams on a geographic map of the United States.

![MLB Trade Map](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9.5-blue)
![Framer Motion](https://img.shields.io/badge/Framer%20Motion-11.10.16-purple)
![License](https://img.shields.io/badge/License-MIT-green)

## 🌟 Features

- **Interactive US Map**: Teams positioned at their actual stadium locations
- **Animated Player Movements**: Real-time visualization of player transfers between teams
- **Timeline Controls**: Play, pause, reset, and skip through trade timeline
- **Transaction Feed**: Real-time feed of all trade transactions with timestamps
- **Team Filtering**: Click on any team to filter transactions for that specific team
- **Debug Mode**: Advanced positioning controls for fine-tuning team locations
- **Responsive Design**: Works on desktop and mobile devices

## 🎯 Live Demo

[View the live application](https://yourusername.github.io/mlbTradeMap)

## 🚀 Quick Start

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mlbTradeMap.git
   cd mlbTradeMap
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:5173](http://localhost:5173)

## 🏗️ Build for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## 📊 API Integration

The application uses the official MLB Stats API:

- **Transactions API**: `https://statsapi.mlb.com/api/v1/transactions`
- **Player Headshots**: `https://midfield.mlbstatic.com/v1/people/{personId}/spots/120`
- **Team Logos**: `https://www.mlbstatic.com/team-logos/team-cap-on-dark/{teamId}.svg`

## 🎮 How It Works

1. **Data Fetching**: Fetches all MLB teams and their transactions during the trade deadline period
2. **Geographic Positioning**: Teams are positioned on a US map at their actual stadium coordinates
3. **Player Movement**: When a player is traded, their headshot animates from the sending team to the receiving team
4. **Timeline Visualization**: All trades are displayed chronologically with play/pause controls
5. **Interactive Features**: Click teams to filter transactions, use debug mode for positioning

## 🛠️ Technologies Used

- **React 18** with TypeScript
- **Framer Motion** for smooth animations
- **Axios** for API calls
- **Vite** for fast development and building
- **CSS Grid** and **Flexbox** for responsive layout
- **MLB Stats API** for real trade data

## 📅 Trade Deadline Period

The visualization focuses on the 2024 MLB Trade Deadline period:
- **Start Date**: July 30, 2024
- **End Date**: August 1, 2024

This captures the most active trading period in MLB.

## 🔧 Development

### Project Structure

```
mlbTradeMap/
├── public/           # Static assets (US map SVG)
├── src/
│   ├── components/   # React components
│   ├── services/     # API services
│   ├── App.tsx       # Main application
│   └── index.tsx     # Entry point
├── package.json      # Dependencies and scripts
└── README.md         # This file
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm start` - Alias for dev server

## 🎨 Customization

### Debug Mode

Enable debug mode to fine-tune team positions on the map:
- Click the "Debug" button in the controls
- Drag teams to adjust their positions
- Export custom positions for future use

### Styling

The application uses CSS-in-JS for styling. Main styles are in:
- `src/index.css` - Global styles
- Component-specific styles in each `.tsx` file

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [MLB Stats API](https://statsapi.mlb.com/) for providing trade data
- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- [React](https://reactjs.org/) for the amazing framework

## 📞 Support

If you have any questions or issues, please [open an issue](https://github.com/yourusername/mlbTradeMap/issues) on GitHub.

---

**Made with ⚾ by [Your Name]** 