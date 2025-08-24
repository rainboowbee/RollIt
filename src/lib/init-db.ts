import { prisma } from './db';

export async function initializeDatabase() {
  try {
    console.log('Initializing database...');

    // Check if there's already a game
    const existingGame = await prisma.game.findFirst({
      where: {
        OR: [
          { status: 'waiting' },
          { status: 'active' }
        ]
      }
    });

    if (!existingGame) {
      // Create initial game
      const gameStartTime = new Date();
      gameStartTime.setSeconds(gameStartTime.getSeconds() + 30); // Игра начнется через 30 секунд
      
      const game = await prisma.game.create({
        data: {
          status: 'waiting',
          totalPool: 0,
          gameStartTime: gameStartTime,
          commission: 0,
        }
      });

      console.log('Created initial game:', game.id);
    } else {
      console.log('Game already exists:', existingGame.id);
    }

    console.log('Database initialization completed');
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

// Auto-initialize when this module is imported
if (process.env.NODE_ENV === 'development') {
  initializeDatabase().catch(console.error);
}
