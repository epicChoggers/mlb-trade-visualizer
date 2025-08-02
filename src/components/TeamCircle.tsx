import React from 'react';
import { motion } from 'framer-motion';
import { Transaction } from '../services/mlbApi';

interface TeamCircleProps {
  team: {
    id: number;
    name: string;
    abbreviation: string;
    logo: string;
  };
  transactions: Transaction[];
  onTeamClick: (teamId: number) => void;
}

const TeamCircle: React.FC<TeamCircleProps> = ({ team, transactions, onTeamClick }) => {
  // Get players that were traded to this team
  const incomingPlayers = transactions.filter(t => 
    t.toTeam === team.name && t.playerId
  );

  // Get players that were traded from this team
  const outgoingPlayers = transactions.filter(t => 
    t.fromTeam === team.name && t.playerId
  );

  return (
    <div className="team-circle-container">
      <motion.div
        className="team-circle"
        onClick={() => onTeamClick(team.id)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          background: `linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)`
        }}
      >
        <img 
          src={team.logo} 
          alt={team.name} 
          className="team-logo"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/80x80?text=' + team.abbreviation;
          }}
        />
        
        {/* Incoming players */}
        {incomingPlayers.map((transaction, index) => (
          <motion.div
            key={`incoming-${transaction.id}`}
            style={{
              position: 'absolute',
              top: `${20 + (index * 35)}px`,
              right: '10px',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.2, duration: 0.5 }}
          >
            <div style={{
              fontSize: '8px',
              color: 'white',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
              textAlign: 'center',
              marginBottom: '2px',
              whiteSpace: 'nowrap',
              maxWidth: '50px',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }} title={transaction.playerName}>
              {transaction.playerName}
            </div>
            <img
              src={transaction.headshotUrl || `https://midfield.mlbstatic.com/v1/people/${transaction.playerId}/spots/120`}
              alt={transaction.playerName}
              className="player-headshot"
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                border: '2px solid white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/30x30?text=' + (transaction.playerName?.charAt(0) || '?');
              }}
              title={`${transaction.playerName} → ${team.name}`}
            />
          </motion.div>
        ))}

        {/* Outgoing players */}
        {outgoingPlayers.map((transaction, index) => (
          <motion.div
            key={`outgoing-${transaction.id}`}
            style={{
              position: 'absolute',
              bottom: `${20 + (index * 35)}px`,
              left: '10px',
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.2, duration: 0.5 }}
          >
            <div style={{
              fontSize: '8px',
              color: 'white',
              textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
              textAlign: 'center',
              marginBottom: '2px',
              whiteSpace: 'nowrap',
              maxWidth: '50px',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }} title={transaction.playerName}>
              {transaction.playerName}
            </div>
            <img
              src={transaction.headshotUrl || `https://midfield.mlbstatic.com/v1/people/${transaction.playerId}/spots/120`}
              alt={transaction.playerName}
              className="player-headshot"
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                border: '2px solid white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
              }}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/30x30?text=' + (transaction.playerName?.charAt(0) || '?');
              }}
              title={`${transaction.playerName} ← ${team.name}`}
            />
          </motion.div>
        ))}
      </motion.div>
      <div className="team-name">{team.name}</div>
    </div>
  );
};

export default TeamCircle; 