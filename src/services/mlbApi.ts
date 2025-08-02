import axios from 'axios';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  fromTeam?: string;
  toTeam?: string;
  playerId?: string;
  playerName?: string;
  headshotUrl?: string; // Add headshot URL to transaction
}

export interface Team {
  id: number;
  name: string;
  abbreviation: string;
  logo: string;
}

export class MLBApi {
  private baseUrl = 'https://statsapi.mlb.com/api/v1';
  private headshotCache: Map<string, string> = new Map(); // Cache for headshot URLs

  transactions = (startDate: string, endDate: string) => {
    return `${this.baseUrl}/transactions?startDate=${startDate}&endDate=${endDate}`;
  };

  spot = (personId: string) => {
    return `https://midfield.mlbstatic.com/v1/people/${personId}/spots/120`;
  };

  getPlayerHeadshot = (personId: string) => {
    return `https://midfield.mlbstatic.com/v1/people/${personId}/spots/120`;
  };

  // Preload headshots for all players in transactions
  async preloadPlayerHeadshots(transactions: Transaction[]): Promise<Transaction[]> {
    const uniquePlayerIds = [...new Set(transactions
      .filter(t => t.playerId)
      .map(t => t.playerId!)
    )];

    console.log(`Preloading headshots for ${uniquePlayerIds.length} players...`);

    // Create promises for all headshot requests
    const headshotPromises = uniquePlayerIds.map(async (playerId) => {
      try {
        const headshotUrl = this.getPlayerHeadshot(playerId);
        // Test if the headshot URL is valid by making a HEAD request
        await axios.head(headshotUrl);
        this.headshotCache.set(playerId, headshotUrl);
        return { playerId, headshotUrl, success: true };
      } catch (error) {
        console.warn(`Failed to load headshot for player ${playerId}:`, error);
        this.headshotCache.set(playerId, ''); // Mark as failed
        return { playerId, headshotUrl: '', success: false };
      }
    });

    // Wait for all headshot requests to complete
    await Promise.allSettled(headshotPromises);

    // Update transactions with headshot URLs
    const updatedTransactions = transactions.map(transaction => ({
      ...transaction,
      headshotUrl: transaction.playerId ? this.headshotCache.get(transaction.playerId) || '' : undefined
    }));

    console.log(`Preloaded headshots for ${this.headshotCache.size} players`);
    return updatedTransactions;
  }

  // Get cached headshot URL
  getCachedHeadshot(playerId: string): string | undefined {
    return this.headshotCache.get(playerId);
  }

  async getAllTransactions(startDate: string, endDate: string): Promise<Transaction[]> {
    try {
      const response = await axios.get(this.transactions(startDate, endDate));
      const parsedTransactions = this.parseTransactions(response.data);
      
      // Preload headshots for all transactions
      const transactionsWithHeadshots = await this.preloadPlayerHeadshots(parsedTransactions);
      
      return transactionsWithHeadshots;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  async getAllTeams(): Promise<Team[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/teams?sportId=1`);
      
      const teams = response.data.teams.map((team: any) => ({
        id: team.id,
        name: team.name,
        abbreviation: team.abbreviation,
        logo: `https://www.mlbstatic.com/team-logos/team-cap-on-dark/${team.id}.svg`
      }));
      
      return teams;
    } catch (error) {
      console.error('Error fetching teams:', error);
      return [];
    }
  }

  private parseTransactions(data: any): Transaction[] {
    const transactions: Transaction[] = [];
    
    // MLB team IDs (main MLB teams)
    const mlbTeamIds = [108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 133, 134, 135, 136, 137, 138, 139, 140, 141, 142, 143, 144, 145, 146, 147, 158];
    
    if (data.transactions) {
      data.transactions.forEach((transaction: any) => {
        // Only include actual trades (typeCode: "TR") where at least one team is an MLB club
        if (transaction.typeCode === 'TR' && 
            transaction.fromTeam && 
            transaction.toTeam && 
            transaction.person && 
            transaction.fromTeam.id !== transaction.toTeam.id &&
            // At least one team must be an MLB club
            (mlbTeamIds.includes(transaction.fromTeam.id) || mlbTeamIds.includes(transaction.toTeam.id))) {
          
          const parsedTransaction = {
            id: `${transaction.id}-${transaction.person.id}`,
            date: transaction.date,
            description: transaction.description || `${transaction.person.fullName} traded`,
            fromTeam: transaction.fromTeam.name,
            toTeam: transaction.toTeam.name,
            playerId: transaction.person.id.toString(),
            playerName: transaction.person.fullName
          };
          
          transactions.push(parsedTransaction);
        }
      });
    }
    
    return transactions;
  }
}

export const mlbApi = new MLBApi(); 