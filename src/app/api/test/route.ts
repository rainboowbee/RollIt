import { NextResponse } from 'next/server';
import { gameManager } from '@/lib/game-manager';

export async function GET() {
  try {
    const stats = await gameManager.getGameStats();
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      stats,
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
