import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction, Team, mlbApi } from '../services/mlbApi';

interface TimelineViewProps {
  teams: Team[];
  transactions: Transaction[];
  loading: boolean;
}

interface PlayerMovement {
  id: string;
  playerName: string;
  playerId: string;
  fromTeam: Team | null;
  toTeam: Team | null;
  date: string;
  description: string;
}

interface TeamPosition {
  x: number;
  y: number;
  division: string;
}

// MLB Stadium coordinates data
const mlbStadiums = [
  { team: "Arizona Diamondbacks", stadium: "Chase Field", city: "Phoenix", state: "AZ", coordinates: { latitude: 33.44527778, longitude: -112.0669444 } },
  { team: "Atlanta Braves", stadium: "Truist Park", city: "Cumberland", state: "GA", coordinates: { latitude: 33.8906, longitude: -84.4678 } },
  { team: "Baltimore Orioles", stadium: "Oriole Park at Camden Yards", city: "Baltimore", state: "MD", coordinates: { latitude: 39.28388889, longitude: -76.62166667 } },
  { team: "Boston Red Sox", stadium: "Fenway Park", city: "Boston", state: "MA", coordinates: { latitude: 42.34638889, longitude: -71.0975 } },
  { team: "Chicago Cubs", stadium: "Wrigley Field", city: "Chicago", state: "IL", coordinates: { latitude: 41.94833333, longitude: -87.65555556 } },
  { team: "Chicago White Sox", stadium: "Guaranteed Rate Field", city: "Chicago", state: "IL", coordinates: { latitude: 41.83, longitude: -87.63388889 } },
  { team: "Cincinnati Reds", stadium: "Great American Ball Park", city: "Cincinnati", state: "OH", coordinates: { latitude: 39.0975, longitude: -84.50666667 } },
  { team: "Cleveland Guardians", stadium: "Progressive Field", city: "Cleveland", state: "OH", coordinates: { latitude: 41.49583333, longitude: -81.68527778 } },
  { team: "Colorado Rockies", stadium: "Coors Field", city: "Denver", state: "CO", coordinates: { latitude: 39.75611111, longitude: -104.9941667 } },
  { team: "Detroit Tigers", stadium: "Comerica Park", city: "Detroit", state: "MI", coordinates: { latitude: 42.33916667, longitude: -83.04861111 } },
  { team: "Houston Astros", stadium: "Minute Maid Park", city: "Houston", state: "TX", coordinates: { latitude: 29.75694444, longitude: -95.35555556 } },
  { team: "Kansas City Royals", stadium: "Kauffman Stadium", city: "Kansas City", state: "MO", coordinates: { latitude: 39.05138889, longitude: -94.48055556 } },
  { team: "Los Angeles Angels", stadium: "Angel Stadium of Anaheim", city: "Anaheim", state: "CA", coordinates: { latitude: 33.80027778, longitude: -117.8827778 } },
  { team: "Los Angeles Dodgers", stadium: "Dodger Stadium", city: "Los Angeles", state: "CA", coordinates: { latitude: 34.07361111, longitude: -118.24 } },
  { team: "Miami Marlins", stadium: "LoanDepot Park", city: "Miami", state: "FL", coordinates: { latitude: 25.77805556, longitude: -80.21972222 } },
  { team: "Milwaukee Brewers", stadium: "American Family Field", city: "Milwaukee", state: "WI", coordinates: { latitude: 43.02833333, longitude: -87.97111111 } },
  { team: "Minnesota Twins", stadium: "Target Field", city: "Minneapolis", state: "MN", coordinates: { latitude: 44.98166667, longitude: -93.27833333 } },
  { team: "New York Mets", stadium: "Citi Field", city: "Queens", state: "NY", coordinates: { latitude: 40.75694444, longitude: -73.84583333 } },
  { team: "New York Yankees", stadium: "Yankee Stadium", city: "Bronx", state: "NY", coordinates: { latitude: 40.82916667, longitude: -73.92638889 } },
  { team: "Oakland Athletics", stadium: "Oakland Coliseum", city: "Oakland", state: "CA", coordinates: { latitude: 37.75166667, longitude: -122.2005556 } },
  { team: "Philadelphia Phillies", stadium: "Citizens Bank Park", city: "Philadelphia", state: "PA", coordinates: { latitude: 39.90583333, longitude: -75.16638889 } },
  { team: "Pittsburgh Pirates", stadium: "PNC Park", city: "Pittsburgh", state: "PA", coordinates: { latitude: 40.44694444, longitude: -80.00583333 } },
  { team: "San Diego Padres", stadium: "Petco Park", city: "San Diego", state: "CA", coordinates: { latitude: 32.70729983, longitude: -117.1565998 } },
  { team: "San Francisco Giants", stadium: "Oracle Park", city: "San Francisco", state: "CA", coordinates: { latitude: 37.77833333, longitude: -122.3894444 } },
  { team: "Seattle Mariners", stadium: "T-Mobile Park", city: "Seattle", state: "WA", coordinates: { latitude: 47.59138889, longitude: -122.3325 } },
  { team: "St. Louis Cardinals", stadium: "Busch Stadium", city: "St. Louis", state: "MO", coordinates: { latitude: 38.6225, longitude: -90.19305556 } },
  { team: "Tampa Bay Rays", stadium: "Tropicana Field", city: "St. Petersburg", state: "FL", coordinates: { latitude: 27.76833333, longitude: -82.65333333 } },
  { team: "Texas Rangers", stadium: "Globe Life Field", city: "Arlington", state: "TX", coordinates: { latitude: 32.7475, longitude: -97.08277778 } },
  { team: "Toronto Blue Jays", stadium: "Rogers Centre", city: "Toronto", state: "ON", coordinates: { latitude: 43.64138889, longitude: -79.38916667 } },
  { team: "Washington Nationals", stadium: "Nationals Park", city: "Washington", state: "DC", coordinates: { latitude: 38.87277778, longitude: -77.0075 } }
];

const TimelineView: React.FC<TimelineViewProps> = ({ teams, transactions, loading }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [playerMovements, setPlayerMovements] = useState<PlayerMovement[]>([]);
  const [activeMovements, setActiveMovements] = useState<PlayerMovement[]>([]);
  const [hoveredTeam, setHoveredTeam] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Add these refs near the top of your component
  const dragHandlersRef = useRef<{
    onMouseMove?: (e: MouseEvent) => void;
    onMouseUp?: () => void;
  }>({});

  // Debug mode state
  const [debugMode, setDebugMode] = useState(false);
  const [mapBounds, setMapBounds] = useState({
    minLat: 22,
    maxLat: 51.9,
    minLng: -124.3,
    maxLng: -66
  });
  const [mapSize, setMapSize] = useState({
    width: 1100,
    height: 700
  });
  const [mapOffset, setMapOffset] = useState({
    x: 50,
    y: 50
  });
  const [mapRotation, setMapRotation] = useState(0);
  const [hoveredCoordinates, setHoveredCoordinates] = useState<{lat: number, lng: number} | null>(null);

  // Drag and drop state
  const [draggedTeam, setDraggedTeam] = useState<number | null>(null);
  const [customPositions, setCustomPositions] = useState<Record<number, {x: number, y: number}>>({});
  const [isDragging, setIsDragging] = useState(false);

  // Process transactions into player movements
  useEffect(() => {
    if (transactions.length === 0) return;

    const movements: PlayerMovement[] = transactions.map(transaction => {
      const fromTeam = teams.find(team => team.name === transaction.fromTeam) || null;
      const toTeam = teams.find(team => team.name === transaction.toTeam) || null;

      return {
        id: transaction.id,
        playerName: transaction.playerName || 'Unknown Player',
        playerId: transaction.playerId || '',
        fromTeam,
        toTeam,
        date: transaction.date,
        description: transaction.description
      };
    });

    // Sort by date
    movements.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setPlayerMovements(movements);
  }, [transactions, teams]);

  // Handle play/pause functionality
  useEffect(() => {
    if (isPlaying && playerMovements.length > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentTimeIndex(prev => {
          if (prev >= playerMovements.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2000); // 2 seconds per movement
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, playerMovements.length]);

  // Update active movements based on current time
  useEffect(() => {
    if (currentTimeIndex >= 0 && currentTimeIndex < playerMovements.length) {
      setActiveMovements(playerMovements.slice(0, currentTimeIndex + 1));
    }
  }, [currentTimeIndex, playerMovements]);

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if (currentTimeIndex >= playerMovements.length - 1) {
        setCurrentTimeIndex(0);
      }
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentTimeIndex(0);
    setActiveMovements([]);
  };

  const handleSkip = () => {
    setCurrentTimeIndex(playerMovements.length - 1);
    setIsPlaying(false);
  };

  // Convert geographical coordinates to screen coordinates
  const getScreenPosition = (lat: number, lng: number) => {
    // Always use the mapBounds state for consistent positioning
    const bounds = mapBounds;
    
    // Convert to screen coordinates
    const x = ((lng - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * mapSize.width;
    const y = ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * mapSize.height;
    
    return { x: x + mapOffset.x, y: y + mapOffset.y };
  };

  // Get team position on the map using stadium coordinates or custom position
  const getTeamPosition = (team: Team): TeamPosition => {
    // If we have a custom position for this team, use it
    if (customPositions[team.id]) {
      return {
        x: customPositions[team.id].x,
        y: customPositions[team.id].y,
        division: 'Unknown'
      };
    }

    const stadiumData = mlbStadiums.find(stadium => stadium.team === team.name);
    if (!stadiumData) {
      console.warn(`No stadium data for team: ${team.name} (${team.id})`);
      return { x: 400, y: 300, division: 'Unknown' };
    }
    
    const screenPos = getScreenPosition(stadiumData.coordinates.latitude, stadiumData.coordinates.longitude);
    
    return {
      x: screenPos.x,
      y: screenPos.y,
      division: 'Unknown'
    };
  };

  // Handle map click for coordinate debugging
  const handleMapClick = (event: React.MouseEvent) => {
    if (!debugMode) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left - mapOffset.x;
    const y = event.clientY - rect.top - mapOffset.y;
    
    // Convert screen coordinates back to geographical coordinates
    const bounds = mapBounds;
    const lng = (x / mapSize.width) * (bounds.maxLng - bounds.minLng) + bounds.minLng;
    const lat = bounds.maxLat - (y / mapSize.height) * (bounds.maxLat - bounds.minLat);
    
    setHoveredCoordinates({ lat, lng });
  };

  const handleDragStart = (e: React.MouseEvent, teamId: number) => {
    if (!debugMode) return;
    e.preventDefault();
    setIsDragging(true); // Set isDragging to true
  
    // Store the ID of the team being dragged
    setDraggedTeam(teamId);
  
    // Define and store the handlers to be used on the window
    const onMouseMove = (moveEvent: MouseEvent) => {
      // We need to calculate the position relative to the map container
      const mapElement = document.querySelector('.us-map-background');
      if (!mapElement) return;
  
      const rect = mapElement.getBoundingClientRect();
      const x = moveEvent.clientX - rect.left;
      const y = moveEvent.clientY - rect.top;
  
      setCustomPositions(prev => ({
        ...prev,
        [teamId]: { x, y }
      }));
    };
  
    const onMouseUp = () => {
      setIsDragging(false); // Set isDragging to false
      setDraggedTeam(null);
      // Cleanup: remove the event listeners from the window
      window.removeEventListener('mousemove', dragHandlersRef.current.onMouseMove!);
      window.removeEventListener('mouseup', dragHandlersRef.current.onMouseUp!);
      dragHandlersRef.current = {};
    };
  
    // Store the handlers in the ref and attach them to the window
    dragHandlersRef.current = { onMouseMove, onMouseUp };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleDrag = (e: React.MouseEvent) => {
    if (!debugMode || !draggedTeam) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setCustomPositions(prev => ({
      ...prev,
      [draggedTeam]: { x, y }
    }));
  };

  const handleDragEnd = () => {
    if (!debugMode) return;
    setDraggedTeam(null);
    setIsDragging(false);
  };

  // Reset custom positions
  const resetCustomPositions = () => {
    setCustomPositions({});
  };

  // Export custom positions as coordinates
  const exportCustomPositions = () => {
    const positions = Object.keys(customPositions).map((teamIdStr) => {
      const teamId = parseInt(teamIdStr);
      const pos = customPositions[teamId];
      const team = teams.find(t => t.id === teamId);
      const bounds = mapBounds;
      
      // Convert screen coordinates back to geographical coordinates
      const x = pos.x - mapOffset.x;
      const y = pos.y - mapOffset.y;
      const lng = (x / mapSize.width) * (bounds.maxLng - bounds.minLng) + bounds.minLng;
      const lat = bounds.maxLat - (y / mapSize.height) * (bounds.maxLat - bounds.minLat);
      
      return {
        teamId: teamId,
        teamName: team?.name || 'Unknown',
        coordinates: { latitude: lat, longitude: lng },
        screenPosition: pos
      };
    });
    
    console.log('Custom Team Positions:', positions);
    alert('Custom positions exported to console!');
  };

  if (loading) {
    return (
      <div className="timeline-container">
        <div className="loading">Loading timeline...</div>
      </div>
    );
  }

  return (
    <div className="timeline-container" style={{
      display: 'flex',
      height: '100vh',
      gap: '20px',
      padding: '20px'
    }}>
      {/* Movement history - Left sidebar */}
      <div className="movement-history" style={{
        width: '250px',
        height: '100%',
        background: 'rgba(0,0,0,0.8)',
        borderRadius: '12px',
        padding: '20px',
        overflowY: 'auto',
        flexShrink: 0
      }}>
        <h3 style={{
          color: 'white',
          margin: '0 0 20px 0',
          fontSize: '18px',
          textAlign: 'center'
        }}>Trade Timeline</h3>
        <div className="history-list" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}>
          {activeMovements.map((movement, index) => (
            <motion.div
              key={`history-${movement.id}-${index}`}
              className="history-item"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '12px',
                border: '1px solid rgba(255,255,255,0.2)'
              }}
            >
              <div className="history-date" style={{
                color: '#888',
                fontSize: '12px',
                marginBottom: '5px'
              }}>
                {new Date(movement.date).toLocaleDateString()}
              </div>
              <div className="history-player" style={{
                color: 'white',
                fontSize: '14px',
                fontWeight: 'bold',
                marginBottom: '5px'
              }}>{movement.playerName}</div>
              <div className="history-teams" style={{
                color: '#ccc',
                fontSize: '12px'
              }}>
                {movement.fromTeam?.abbreviation} → {movement.toTeam?.abbreviation}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main visualization area */}
      <div style={{
        flex: 1,
        position: 'relative'
      }}>
        {/* Debug Controls */}
        {debugMode && (
          <div className="debug-panel" style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.9)',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          zIndex: 1000,
          minWidth: '300px',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#00ff00' }}>🔧 Debug Mode</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Map Bounds:</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label>Min Lat: <input 
                  type="number" 
                  value={mapBounds.minLat} 
                  onChange={(e) => setMapBounds(prev => ({ ...prev, minLat: parseFloat(e.target.value) }))}
                  step="0.1"
                  style={{ width: '60px' }}
                /></label>
              </div>
              <div>
                <label>Max Lat: <input 
                  type="number" 
                  value={mapBounds.maxLat} 
                  onChange={(e) => setMapBounds(prev => ({ ...prev, maxLat: parseFloat(e.target.value) }))}
                  step="0.1"
                  style={{ width: '60px' }}
                /></label>
              </div>
              <div>
                <label>Min Lng: <input 
                  type="number" 
                  value={mapBounds.minLng} 
                  onChange={(e) => setMapBounds(prev => ({ ...prev, minLng: parseFloat(e.target.value) }))}
                  step="0.1"
                  style={{ width: '60px' }}
                /></label>
              </div>
              <div>
                <label>Max Lng: <input 
                  type="number" 
                  value={mapBounds.maxLng} 
                  onChange={(e) => setMapBounds(prev => ({ ...prev, maxLng: parseFloat(e.target.value) }))}
                  step="0.1"
                  style={{ width: '60px' }}
                /></label>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Map Size:</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label>Width: <input 
                  type="number" 
                  value={mapSize.width} 
                  onChange={(e) => setMapSize(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                  style={{ width: '60px' }}
                /></label>
              </div>
              <div>
                <label>Height: <input 
                  type="number" 
                  value={mapSize.height} 
                  onChange={(e) => setMapSize(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                  style={{ width: '60px' }}
                /></label>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Map Offset:</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label>X: <input 
                  type="number" 
                  value={mapOffset.x} 
                  onChange={(e) => setMapOffset(prev => ({ ...prev, x: parseInt(e.target.value) }))}
                  style={{ width: '60px' }}
                /></label>
              </div>
              <div>
                <label>Y: <input 
                  type="number" 
                  value={mapOffset.y} 
                  onChange={(e) => setMapOffset(prev => ({ ...prev, y: parseInt(e.target.value) }))}
                  style={{ width: '60px' }}
                /></label>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Map Rotation:</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input 
                type="range" 
                min="-14" 
                max="0" 
                step="0.1"
                value={mapRotation} 
                onChange={(e) => setMapRotation(parseFloat(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ minWidth: '40px', textAlign: 'right' }}>
                {mapRotation}°
              </span>
            </div>
          </div>

          {hoveredCoordinates && (
            <div style={{ marginBottom: '15px', padding: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
              <strong>Clicked Coordinates:</strong><br/>
              Lat: {hoveredCoordinates.lat.toFixed(6)}<br/>
              Lng: {hoveredCoordinates.lng.toFixed(6)}
            </div>
          )}

          <div style={{ marginBottom: '15px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button 
                onClick={() => {
                  console.log('Current Debug Settings:', {
                    mapBounds,
                    mapSize,
                    mapOffset,
                    mapRotation
                  });
                  alert('Debug settings logged to console!');
                }}
                style={{
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Log Settings
              </button>
              <button 
                onClick={resetCustomPositions}
                style={{
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Reset Positions
              </button>
            </div>
          </div>

          {Object.keys(customPositions).length > 0 && (
            <div style={{ marginBottom: '15px' }}>
              <button 
                onClick={exportCustomPositions}
                style={{
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  width: '100%'
                }}
              >
                Export Custom Positions
              </button>
            </div>
          )}
        </div>
      )}

      <div className="timeline-controls">
        <button 
          onClick={handlePlayPause}
          className={`play-button ${isPlaying ? 'pause' : 'play'}`}
        >
          {isPlaying ? '⏸️ Pause' : '▶️ Play'}
        </button>
        <button onClick={handleReset} className="reset-button">
          🔄 Reset
        </button>
        <button onClick={handleSkip} className="skip-button">
          ⏭️ Skip to End
        </button>
        <button 
          onClick={() => setDebugMode(!debugMode)}
          style={{
            background: debugMode ? '#dc3545' : '#28a745',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginLeft: '10px'
          }}
        >
          {debugMode ? '🔧 Debug ON' : '🔧 Debug OFF'}
        </button>
        <div className="timeline-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ 
                width: `${playerMovements.length > 0 ? (currentTimeIndex + 1) / playerMovements.length * 100 : 0}%` 
              }}
            />
          </div>
          <span className="progress-text">
            {currentTimeIndex + 1} / {playerMovements.length} movements
          </span>
        </div>
      </div>

      <div className="timeline-visualization">
        {/* Central timeline hub */}


        {/* US Map Background */}
        <div 
          className="us-map-background" 
          onClick={handleMapClick} 
          style={{ 
            cursor: debugMode ? (isDragging ? 'grabbing' : 'crosshair') : 'default',
            position: 'relative'
          }}
        >
          <img 
            src="/usa.svg" 
            alt="United States Map"
            className="us-map-svg"
            style={{
              position: 'absolute',
              top: `${mapOffset.y}px`,
              left: `${mapOffset.x}px`,
              width: `${mapSize.width}px`,
              height: `${mapSize.height}px`,
              transform: `rotate(${mapRotation}deg)`,
              transformOrigin: 'center center',
              zIndex: 2,
              filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))'
            }}
          />
          
          {/* Debug grid overlay */}
          {debugMode && (
            <div style={{
              position: 'absolute',
              top: `${mapOffset.y}px`,
              left: `${mapOffset.x}px`,
              width: `${mapSize.width}px`,
              height: `${mapSize.height}px`,
              transform: `rotate(${mapRotation}deg)`,
              transformOrigin: 'center center',
              zIndex: 3,
              pointerEvents: 'none'
            }}>
              {/* Grid lines */}
              {Array.from({ length: 10 }, (_, i) => (
                <React.Fragment key={i}>
                  <div style={{
                    position: 'absolute',
                    left: `${(i + 1) * mapSize.width / 10}px`,
                    top: '0',
                    width: '1px',
                    height: '100%',
                    background: 'rgba(255,255,255,0.3)'
                  }} />
                  <div style={{
                    position: 'absolute',
                    top: `${(i + 1) * mapSize.height / 10}px`,
                    left: '0',
                    width: '100%',
                    height: '1px',
                    background: 'rgba(255,255,255,0.3)'
                  }} />
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        {/* Teams positioned on the map */}
        <div className="teams-map">
          {teams.map((team) => {
            const position = getTeamPosition(team);
            const hasActiveMovements = activeMovements.some(movement => 
              movement.fromTeam?.id === team.id || movement.toTeam?.id === team.id
            );
            
            // Get players for this team
            const teamPlayers = activeMovements.filter(movement => 
              movement.toTeam?.id === team.id
            );

            return (
              <motion.div
                key={team.id}
                className={`team-node ${hasActiveMovements ? 'active' : ''}`}
                style={{
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  position: 'absolute',
                  cursor: debugMode ? (isDragging && draggedTeam === team.id ? 'grabbing' : 'grab') : 'default',
                  zIndex: draggedTeam === team.id ? 1000 : 10,
                  transform: draggedTeam === team.id ? 'scale(1.1)' : 'scale(1)',
                  transition: 'transform 0.1s ease'
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: hasActiveMovements ? 1.2 : 1, 
                  opacity: 1 
                }}
                transition={{ duration: 0.3 }}
                onMouseEnter={() => setHoveredTeam(team.id)}
                onMouseLeave={() => setHoveredTeam(null)}
                onMouseDown={(e) => handleDragStart(e, team.id)}
                
              >
                <div className="team-logo" style={{
                  width: debugMode ? '20px' : '30px',
                  height: debugMode ? '20px' : '30px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: debugMode ? '2px solid #00ff00' : '2px solid white',
                  boxShadow: debugMode ? '0 0 10px #00ff00' : '0 2px 8px rgba(0,0,0,0.3)',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img 
                    src={team.logo} 
                    alt={team.name} 
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain'
                    }}
                  />
                </div>
                <div className="team-name" style={{
                  fontSize: debugMode ? '10px' : '12px',
                  textAlign: 'center',
                  marginTop: '2px',
                  color: debugMode ? '#00ff00' : 'white',
                  textShadow: debugMode ? '0 0 5px #00ff00' : '1px 1px 2px rgba(0,0,0,0.8)'
                }}>
                  {team.abbreviation}
                </div>
                
                {/* Debug coordinates on hover */}
                {debugMode && (
                  <div style={{
                    position: 'absolute',
                    top: '-40px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    padding: '5px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    whiteSpace: 'nowrap',
                    zIndex: 10
                  }}>
                    {position.x.toFixed(0)}, {position.y.toFixed(0)}
                  </div>
                )}
                
                {/* Player icons on hover */}
                {hoveredTeam === team.id && teamPlayers.length > 0 && !debugMode && (
                  <div className="team-players">
                    {teamPlayers.map((player, playerIndex) => (
                      <motion.div
                        key={`hover-${player.id}-${playerIndex}`}
                        className="hover-player-icon"
                        initial={{ scale: 0, y: 0 }}
                        animate={{ 
                          scale: 1, 
                          y: [-5, 5, -5],
                        }}
                        transition={{ 
                          duration: 0.6,
                          repeat: Infinity,
                          delay: playerIndex * 0.1
                        }}
                        style={{
                          left: `${playerIndex * 25}px`,
                          top: '-40px',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center'
                        }}
                      >
                        <div
                          className="player-headshot-small"
                          style={{ 
                            width: 30, 
                            height: 30, 
                            borderRadius: '50%', 
                            border: '2px solid white', 
                            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                            background: '#666',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '12px',
                            overflow: 'hidden'
                          }}
                        >
                          <img 
                            src={mlbApi.getPlayerHeadshot(player.playerId || '')}
                            alt={player.playerName}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                              borderRadius: '50%'
                            }}
                            onError={(e) => {
                              // Fallback to initial if image fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling!.textContent = player.playerName.charAt(0);
                            }}
                          />
                          <span style={{ display: 'none' }}>{player.playerName.charAt(0)}</span>
                        </div>
                        <div className="player-name-small" style={{
                          textAlign: 'center',
                          marginTop: '4px',
                          fontSize: '10px',
                          color: 'white',
                          textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                          whiteSpace: 'nowrap',
                          width: 'max-content',
                          zIndex: 1001
                        }}>{player.playerName}</div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Animated player movement: only the currently moving player, with headshot */}
        <AnimatePresence>
          {activeMovements.length > 0 && (() => {
            const movement = activeMovements[activeMovements.length - 1];
            if (!movement.fromTeam || !movement.toTeam) return null;
            const fromPosition = getTeamPosition(movement.fromTeam);
            const toPosition = getTeamPosition(movement.toTeam);
            return (
              <motion.div
                key={movement.id}
                className="player-movement"
                initial={{ x: fromPosition.x, y: fromPosition.y, opacity: 1, scale: 1 }}
                animate={{ x: toPosition.x, y: toPosition.y, opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 1000,
                  pointerEvents: 'none',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  width: 'auto',
                  height: 'auto'
                }}
              >
                <div
                  className="player-headshot"
                  style={{ 
                    width: 50, 
                    height: 50, 
                    borderRadius: '50%', 
                    border: '3px solid white', 
                    boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                    background: '#666',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '16px',
                    overflow: 'hidden',
                    marginBottom: '8px'
                  }}
                >
                  <img 
                    src={mlbApi.getPlayerHeadshot(movement.playerId || '')}
                    alt={movement.playerName}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '50%'
                    }}
                    onError={(e) => {
                      // Fallback to initial if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling!.textContent = movement.playerName.charAt(0);
                    }}
                  />
                  <span style={{ display: 'none' }}>{movement.playerName.charAt(0)}</span>
                </div>
                <div className="player-name" style={{
                  textAlign: 'center',
                  fontSize: '12px',
                  color: 'white',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                  whiteSpace: 'nowrap',
                  width: 'max-content',
                  zIndex: 1001
                }}>{movement.playerName}</div>
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>
      </div>
    </div>
  );
};

export default TimelineView; 