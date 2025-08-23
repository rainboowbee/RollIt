import { prisma, finishGame } from './db';

const GAME_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export class GameManager {
  private static instance: GameManager;
  private gameTimer: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): GameManager {
    if (!GameManager.instance) {
      GameManager.instance = new GameManager();
    }
    return GameManager.instance;
  }

  public async startGameManagement() {
    console.log('Starting game management...');
    
    // Check for games that need to be finished
    await this.checkAndFinishGames();
    
    // Set up periodic checks
    setInterval(async () => {
      await this.checkAndFinishGames();
    }, 30000); // Check every 30 seconds
  }

  private async checkAndFinishGames() {
    try {
      // Find active games that should be finished
      const activeGames = await prisma.game.findMany({
        where: {
          OR: [
            { status: 'waiting' },
            { status: 'active' }
          ]
        }
      });

      for (const game of activeGames) {
        const gameAge = Date.now() - game.createdAt.getTime();
        
        // Finish game if it's old enough or has enough players
        if (gameAge > GAME_DURATION || game.status === 'active') {
          console.log(`Finishing game ${game.id} (age: ${Math.round(gameAge / 1000)}s)`);
          
          try {
            await finishGame(game.id);
            console.log(`Game ${game.id} finished successfully`);
          } catch (error) {
            console.error(`Error finishing game ${game.id}:`, error);
          }
        }
      }
    } catch (error) {
      console.error('Error in game management:', error);
    }
  }

  public async activateGame(gameId: number) {
    try {
      await prisma.game.update({
        where: { id: gameId },
        data: { status: 'active' }
      });
      
      console.log(`Game ${gameId} activated`);
    } catch (error) {
      console.error(`Error activating game ${gameId}:`, error);
    }
  }

  public async getGameStats() {
    try {
      const stats = await prisma.$transaction([
        prisma.game.count({ where: { status: 'waiting' } }),
        prisma.game.count({ where: { status: 'active' } }),
        prisma.game.count({ where: { status: 'finished' } }),
        prisma.user.count(),
        prisma.bet.count(),
      ]);

      return {
        waitingGames: stats[0],
        activeGames: stats[1],
        finishedGames: stats[2],
        totalUsers: stats[3],
        totalBets: stats[4],
      };
    } catch (error) {
      console.error('Error getting game stats:', error);
      return null;
    }
  }
}

// Export singleton instance
export const gameManager = GameManager.getInstance();
