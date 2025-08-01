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
          <motion.img
            key={`incoming-${transaction.id}`}
            src={`https://midfield.mlbstatic.com/v1/people/${transaction.playerId}/spots/120`}
            alt={transaction.playerName}
            className="player-headshot"
            style={{
              top: `${20 + (index * 25)}px`,
              right: '10px',
              zIndex: 10
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.2, duration: 0.5 }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/40x40?text=' + (transaction.playerName?.charAt(0) || '?');
            }}
            title={`${transaction.playerName} → ${team.name}`}
          />
        ))}

        {/* Outgoing players */}
        {outgoingPlayers.map((transaction, index) => (
          <motion.img
            key={`outgoing-${transaction.id}`}
            src={`https://midfield.mlbstatic.com/v1/people/${transaction.playerId}/spots/120`}
            alt={transaction.playerName}
            className="player-headshot"
            style={{
              bottom: `${20 + (index * 25)}px`,
              left: '10px',
              zIndex: 10
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: index * 0.2, duration: 0.5 }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/40x40?text=' + (transaction.playerName?.charAt(0) || '?');
            }}
            title={`${transaction.playerName} ← ${team.name}`}
          />
        ))}
      </motion.div>
      <div className="team-name">{team.name}</div>
    </div>
  );
};

export default TeamCircle; 