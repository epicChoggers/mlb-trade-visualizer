import axios from 'axios';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  fromTeam?: string;
  toTeam?: string;
  playerId?: string;
  playerName?: string;
}

export interface Team {
  id: number;
  name: string;
  abbreviation: string;
  logo: string;
}

export class MLBApi {
  private baseUrl = 'https://statsapi.mlb.com/api/v1';

  transactions = (startDate: string, endDate: string) => {
    return `${this.baseUrl}/transactions?startDate=${startDate}&endDate=${endDate}`;
  };

  spot = (personId: string) => {
    return `https://midfield.mlbstatic.com/v1/people/${personId}/spots/120`;
  };

  getPlayerHeadshot = (personId: string) => {
    return `https://midfield.mlbstatic.com/v1/people/${personId}/spots/120`;
  };

  async getAllTransactions(startDate: string, endDate: string): Promise<Transaction[]> {
    try {
      const response = await axios.get(this.transactions(startDate, endDate));
      const parsedTransactions = this.parseTransactions(response.data);
      return parsedTransactions;
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