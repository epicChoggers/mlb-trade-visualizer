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
  headshotUrl?: string;
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

const mlbStadiums = [
  { team: "Arizona Diamondbacks", stadium: "Chase Field", city: "Phoenix", state: "AZ", coordinates: { latitude: 33.44527778, longitude: -112.0669444 } },
  { team: "Atlanta Braves", stadium: "Truist Park", city: "Cumberland", state: "GA", coordinates: { latitude: 33.8906, longitude: -84.4678 } },
  { team: "Baltimore Orioles", stadium: "Oriole Park at Camden Yards", city: "Baltimore", state: "MD", coordinates: { latitude: 39.28388889, longitude: -76.62166667 } },
  { team: "Boston Red Sox", stadium: "Fenway Park", city: "Boston", state: "MA", coordinates: { latitude: 42.34638889, longitude: -71.0975 } },
  { team: "Chicago Cubs", stadium: "Wrigley Field", city: "Chicago", state: "IL", coordinates: { latitude: 41.94833333, longitude: -87.65555556 } },
  { team: "Chicago White Sox", stadium: "Guaranteed Rate Field", city: "Chicago", state: "IL", coordinates: { latitude: 39.83, longitude: -87.63388889 } },
  { team: "Cincinnati Reds", stadium: "Great American Ball Park", city: "Cincinnati", state: "OH", coordinates: { latitude: 39.0975, longitude: -84.50666667 } },
  { team: "Cleveland Guardians", stadium: "Progressive Field", city: "Cleveland", state: "OH", coordinates: { latitude: 41.49583333, longitude: -81.68527778 } },
  { team: "Colorado Rockies", stadium: "Coors Field", city: "Denver", state: "CO", coordinates: { latitude: 39.75611111, longitude: -104.9941667 } },
  { team: "Detroit Tigers", stadium: "Comerica Park", city: "Detroit", state: "MI", coordinates: { latitude: 42.33916667, longitude: -83.04861111 } },
  { team: "Houston Astros", stadium: "Minute Maid Park", city: "Houston", state: "TX", coordinates: { latitude: 29.75694444, longitude: -95.35555556 } },
  { team: "Kansas City Royals", stadium: "Kauffman Stadium", city: "Kansas City", state: "MO", coordinates: { latitude: 39.05138889, longitude: -94.48055556 } },
  { team: "Los Angeles Angels", stadium: "Angel Stadium of Anaheim", city: "Anaheim", state: "CA", coordinates: { latitude: 34.80027778, longitude: -117.8827778 } },
  { team: "Los Angeles Dodgers", stadium: "Dodger Stadium", city: "Los Angeles", state: "CA", coordinates: { latitude: 34.07361111, longitude: -120.24 } },
  { team: "Miami Marlins", stadium: "LoanDepot Park", city: "Miami", state: "FL", coordinates: { latitude: 25.77805556, longitude: -80.21972222 } },
  { team: "Milwaukee Brewers", stadium: "American Family Field", city: "Milwaukee", state: "WI", coordinates: { latitude: 44.02833333, longitude: -87.97111111 } },
  { team: "Minnesota Twins", stadium: "Target Field", city: "Minneapolis", state: "MN", coordinates: { latitude: 44.98166667, longitude: -93.27833333 } },
  { team: "New York Mets", stadium: "Citi Field", city: "Queens", state: "NY", coordinates: { latitude: 42.75694444, longitude: -73.84583333 } },
  { team: "New York Yankees", stadium: "Yankee Stadium", city: "Bronx", state: "NY", coordinates: { latitude: 40.82916667, longitude: -73.92638889 } },
  { team: "Athletics", stadium: "Former Glory", city: "Oakland", state: "CA", coordinates: { latitude: 37.75166667, longitude: -118.2005556 } },
  { team: "Philadelphia Phillies", stadium: "Citizens Bank Park", city: "Philadelphia", state: "PA", coordinates: { latitude: 39.90583333, longitude: -75.16638889 } },
  { team: "Pittsburgh Pirates", stadium: "PNC Park", city: "Pittsburgh", state: "PA", coordinates: { latitude: 40.44694444, longitude: -80.00583333 } },
  { team: "San Diego Padres", stadium: "Petco Park", city: "San Diego", state: "CA", coordinates: { latitude: 32.70729983, longitude: -117.1565998 } },
  { team: "San Francisco Giants", stadium: "Oracle Park", city: "San Francisco", state: "CA", coordinates: { latitude: 37.77833333, longitude: -122.3894444 } },
  { team: "Seattle Mariners", stadium: "T-Mobile Park", city: "Seattle", state: "WA", coordinates: { latitude: 47.59138889, longitude: -122.3325 } },
  { team: "St. Louis Cardinals", stadium: "Busch Stadium", city: "St. Louis", state: "MO", coordinates: { latitude: 38.6225, longitude: -90.19305556 } },
  { team: "Tampa Bay Rays", stadium: "Tropicana Field", city: "St. Petersburg", state: "FL", coordinates: { latitude: 27.76833333, longitude: -82.65333333 } },
  { team: "Texas Rangers", stadium: "Globe Life Field", city: "Arlington", state: "TX", coordinates: { latitude: 32.7475, longitude: -97.08277778 } },
  { team: "Toronto Blue Jays", stadium: "Rogers Centre", city: "Toronto", state: "ON", coordinates: { latitude: 43.64138889, longitude: -79.38916667 } },
  { team: "Washington Nationals", stadium: "Nationals Park", city: "Washington", state: "DC", coordinates: { latitude: 36.87277778, longitude: -74.0075 } }
];

const TimelineView: React.FC<TimelineViewProps> = ({ teams, transactions, loading }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [playerMovements, setPlayerMovements] = useState<PlayerMovement[]>([]);
  const [activeMovements, setActiveMovements] = useState<PlayerMovement[]>([]);
  const [hoveredTeam, setHoveredTeam] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [mapBounds, setMapBounds] = useState({
    minLat: 20.6,
    maxLat: 51.3,
    minLng: -123.3,
    maxLng: -65.1
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
        headshotUrl: transaction.headshotUrl,
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
      }, 1000); // 1 second per movement (decreased from 2 seconds)
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

  // Get team position on the map using stadium coordinates
  const getTeamPosition = (team: Team): TeamPosition => {
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

  // Simple function to get the center position of a team (for player movements)
  const getTeamCenter = (team: Team) => {
    const position = getTeamPosition(team);
    console.log(`Team ${team.name} center:`, position);
    return {
      x: position.x,
      y: position.y
    };
  };



  if (loading) {
    return (
      <div className="timeline-container">
        <div className="loading">Loading timeline...</div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      height: '100vh',
      padding: '20px',
      gap: '40px'
    }}>
      {/* Main visualization area */}
      <div style={{
        flex: 1,
        position: 'relative'
      }}>


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
          style={{ 
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
        </div>

        {/* Teams positioned on the map */}
        <div className="teams-map">
          {teams.map((team) => {
            const position = getTeamPosition(team);
            // Only highlight teams involved in the CURRENT movement (most recent one)
            const currentMovement = activeMovements.length > 0 ? activeMovements[activeMovements.length - 1] : null;
            const isCurrentlyActive = currentMovement && (
              currentMovement.fromTeam?.id === team.id || currentMovement.toTeam?.id === team.id
            );
            
            // Get players for this team
            const teamPlayers = activeMovements.filter(movement => 
              movement.toTeam?.id === team.id
            );

            return (
              <motion.div
                key={team.id}
                className={`team-node ${isCurrentlyActive ? 'active' : ''}`}
                style={{
                  position: 'absolute',
                  left: `${position.x}px`,
                  top: `${position.y}px`,
                  cursor: 'default',
                  zIndex: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: isCurrentlyActive ? 1.2 : 1, 
                  opacity: 1 
                }}
                transition={{ duration: 0.3 }}
                onMouseEnter={() => setHoveredTeam(team.id)}
                onMouseLeave={() => setHoveredTeam(null)}
              >
                <div className="team-logo" style={{
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <img 
                    src={team.logo} 
                    alt={team.name} 
                    style={{
                      maxWidth: '35px',
                      maxHeight: '35px',
                      width: 'auto',
                      height: 'auto'
                    }}
                  />
                </div>
                <div className="team-name" style={{
                  fontSize: '12px',
                  textAlign: 'center',
                  marginTop: '2px',
                  color: 'white',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                }}>
                  {team.abbreviation}
                </div>
                
                {/* Player icons on hover */}
                {hoveredTeam === team.id && teamPlayers.length > 0 && (
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
                          position: 'absolute',
                          left: '50%',
                          top: `${-45 - (playerIndex * 35)}px`,
                          transform: 'translateX(-50%)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          zIndex: 1000,
                          width: 'auto',
                          height: 'auto'
                        }}
                      >
                        <div className="player-name-small" style={{
                          textAlign: 'center',
                          marginBottom: '4px',
                          fontSize: '10px',
                          color: 'white',
                          textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                          whiteSpace: 'nowrap',
                          width: 'max-content',
                          zIndex: 1001
                        }}>{player.playerName}</div>
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
                            src={player.headshotUrl || mlbApi.getPlayerHeadshot(player.playerId || '')}
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
            
            const fromCenter = getTeamCenter(movement.fromTeam);
            const toCenter = getTeamCenter(movement.toTeam);
            
            // Add offset to adjust for visual centering
            const offsetX = 5; // Move left
            const offsetY = 4; // Move up
            
            const adjustedFrom = {
              x: fromCenter.x + offsetX,
              y: fromCenter.y + offsetY
            };
            const adjustedTo = {
              x: toCenter.x + offsetX,
              y: toCenter.y + offsetY
            };
            
            console.log(`Player movement from ${adjustedFrom.x},${adjustedFrom.y} to ${adjustedTo.x},${adjustedTo.y}`);
            
            return (
              <motion.div
                key={movement.id}
                className="player-movement"
                initial={{ 
                  left: adjustedFrom.x, 
                  top: adjustedFrom.y, 
                  opacity: 1
                }}
                animate={{ 
                  left: adjustedTo.x, 
                  top: adjustedTo.y, 
                  opacity: 1
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                style={{
                  position: 'absolute',
                  zIndex: 1000,
                  pointerEvents: 'none',
                  width: 'auto',
                  height: 'auto',
                  transformOrigin: 'center center'
                }}
              >
                <div className="player-name" style={{
                  position: 'absolute',
                  top: '-18px',
                  left: '50%',
                  transform: 'translateX(-17%)',
                  textAlign: 'center',
                  fontSize: '12px',
                  color: 'white',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                  whiteSpace: 'nowrap',
                  width: 'max-content',
                  zIndex: 1001
                }}>{movement.playerName}</div>
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
                    overflow: 'hidden'
                  }}
                >
                  <img 
                    src={movement.headshotUrl || mlbApi.getPlayerHeadshot(movement.playerId || '')}
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
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>
      </div>

      {/* Movement history - Right sidebar */}
      <div style={{
        width: '300px',
        height: '100%',
        background: 'rgba(0,0,0,0.8)',
        borderRadius: '12px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        marginLeft: 'auto'
      }}>
        <h3 style={{
          color: 'white',
          margin: '0 0 20px 0',
          fontSize: '18px',
          textAlign: 'center',
          flexShrink: 0
        }}>Trade Timeline</h3>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          flex: 1,
          overflowY: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          {activeMovements.map((movement, index) => (
            <motion.div
              key={`history-${movement.id}-${index}`}
              className="history-item"
              initial={{ opacity: 0, x: 20 }}
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
    </div>
  );
};

export default TimelineView; 