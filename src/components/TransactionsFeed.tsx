import React from 'react';
import { motion } from 'framer-motion';
import { Transaction } from '../services/mlbApi';

interface TransactionsFeedProps {
  transactions: Transaction[];
  loading: boolean;
}

const TransactionsFeed: React.FC<TransactionsFeedProps> = ({ transactions, loading }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="transactions-feed">
        <h2>Trade Transactions</h2>
        <div className="loading">Loading transactions...</div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="transactions-feed">
        <h2>Trade Transactions</h2>
        <div className="loading">No trade transactions found for the selected period.</div>
      </div>
    );
  }

  return (
    <div className="transactions-feed">
      <h2>Trade Transactions</h2>
      <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
        {transactions.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            className="transaction-item"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <div className="transaction-date">
              {formatDate(transaction.date)}
            </div>
            <div className="transaction-description">
              {transaction.description}
            </div>
            {transaction.fromTeam && transaction.toTeam && (
              <div style={{ 
                fontSize: '0.8rem', 
                color: '#007bff', 
                marginTop: '5px',
                fontWeight: 'bold'
              }}>
                {transaction.fromTeam} → {transaction.toTeam}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TransactionsFeed; 