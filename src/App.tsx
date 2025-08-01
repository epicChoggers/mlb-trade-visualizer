import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TeamCircle from './components/TeamCircle';
import TransactionsFeed from './components/TransactionsFeed';
import TimelineView from './components/TimelineView';
import { mlbApi, Team, Transaction } from './services/mlbApi';

const App: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('timeline');

  // Trade deadline dates for 2025 - two weeks leading up to deadline
  const startDate = '2025-07-15';
  const endDate = '2025-08-01';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all teams
        const teamsData = await mlbApi.getAllTeams();
        setTeams(teamsData);

        // Fetch all transactions in one call
        const allTransactions = await mlbApi.getAllTransactions(startDate, endDate);

        // Sort by date (newest first)
        const sortedTransactions = allTransactions.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setTransactions(sortedTransactions);
      } catch (err) {
        setError('Failed to load data. Please try again later.');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTeamClick = (teamId: number) => {
    setSelectedTeam(selectedTeam === teamId ? null : teamId);
  };

  const getFilteredTransactions = () => {
    if (selectedTeam) {
      const selectedTeamName = teams.find(t => t.id === selectedTeam)?.name;
      return transactions.filter(t => 
        t.fromTeam === selectedTeamName || t.toTeam === selectedTeamName
      );
    }
    return transactions;
  };

  if (error) {
    return (
      <div className="container">
        <div className="header">
                  <h1>MLB Trade Deadline Visualizer</h1>
        <p>Visualizing the 2025 MLB Trade Deadline</p>
        </div>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="container">
      <motion.div 
        className="header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1>MLB Trade Deadline Visualizer</h1>
        <p>Visualizing the 2025 MLB Trade Deadline - July 29th</p>
        
        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'timeline' ? 'active' : ''}`}
            onClick={() => setViewMode('timeline')}
          >
            📊 Timeline View
          </button>
          <button
            className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            🏟️ Grid View
          </button>
        </div>
      </motion.div>

      {viewMode === 'timeline' ? (
        <TimelineView
          teams={teams}
          transactions={transactions}
          loading={loading}
        />
      ) : (
        <div className="visualization-container">
          <div className="teams-grid">
            <h2>MLB Teams</h2>
            {loading ? (
              <div className="loading">Loading teams and transactions...</div>
            ) : (
              <motion.div 
                className="teams-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {teams.map((team) => (
                  <TeamCircle
                    key={team.id}
                    team={team}
                    transactions={transactions}
                    onTeamClick={handleTeamClick}
                  />
                ))}
              </motion.div>
            )}
          </div>

          <TransactionsFeed 
            transactions={getFilteredTransactions()}
            loading={loading}
          />
        </div>
      )}

      {!loading && transactions.length > 0 && (
        <motion.div 
          style={{ 
            textAlign: 'center', 
            marginTop: '30px', 
            color: 'white',
            fontSize: '0.9rem',
            opacity: 0.8
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <p>💡 Click on a team to filter transactions</p>
          <p>📊 {transactions.length} total trade transactions found</p>
        </motion.div>
      )}
    </div>
  );
};

export default App; 