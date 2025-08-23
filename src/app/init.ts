// Initialize database and game manager when app starts
import '../lib/init-db';
import { gameManager } from '../lib/game-manager';

// Start game management in development mode
if (process.env.NODE_ENV === 'development') {
  gameManager.startGameManagement().catch(console.error);
}
