export interface User {
  id: number;
  telegramId: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  photoUrl?: string | null;
  balance: number;
  createdAt: string;
}

export interface Bet {
  id: number;
  amount: number;
  createdAt: string;
  winPercentage: string;
  user: {
    id: number;
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    photoUrl?: string | null;
  };
}

export interface Game {
  id: number;
  status: string;
  totalPool: number;
  createdAt: string;
  gameStartTime?: string;
  bets?: Bet[];
  winnerId?: number | null;
  winner?: {
    id: number;
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  } | null;
  timeUntilStart?: number;
  gameStatus?: string;
  stats?: {
    totalBets: number;
    totalPool: number;
    averageBet: number;
    minBet: number;
    maxBet: number;
  };
}
