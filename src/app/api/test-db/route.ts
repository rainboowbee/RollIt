import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    console.log('=== Testing Database Connection ===');
    
    // Test basic connection
    await prisma.$connect();
    console.log('Database connection successful');
    
    // Test simple query
    const userCount = await prisma.user.count();
    console.log('User count:', userCount);
    
    // Test game count
    const gameCount = await prisma.game.count();
    console.log('Game count:', gameCount);
    
    // Test creating a test user
    const testUser = await prisma.user.upsert({
      where: { telegramId: 'test_user_123' },
      update: {},
      create: {
        telegramId: 'test_user_123',
        username: 'test_user',
        firstName: 'Test',
        lastName: 'User',
        balance: 1000,
      },
    });
    
    console.log('Test user created:', testUser);
    
    // Clean up test user
    await prisma.user.delete({
      where: { id: testUser.id }
    });
    
    console.log('Test user cleaned up');
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection and operations successful',
      userCount,
      gameCount,
      timestamp: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
