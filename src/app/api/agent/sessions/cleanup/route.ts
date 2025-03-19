import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { io } from '@/lib/socketService';

// Disable logging
console.log = () => {};
console.error = () => {};

// Constants
const INACTIVE_TIMEOUT_MINUTES = 30; // Sessions inactive for 30 minutes are closed
const ABANDONED_TIMEOUT_MINUTES = 5; // Customer sessions inactive for 5 minutes while agent active are marked abandoned

/**
 * API endpoint to automatically clean up inactive chat sessions
 * This can be called:
 * 1. Periodically via a cron job or scheduled task
 * 2. When an agent loads their dashboard
 * 3. Manually for testing
 */
export async function GET(req: NextRequest) {
  try {
    // For now, we'll skip authentication checks to simplify implementation
    // This way the cleanup can run from cron jobs or other automated processes
    
    // Calculate cutoff timestamps
    const inactiveTimeoutDate = new Date(Date.now() - INACTIVE_TIMEOUT_MINUTES * 60 * 1000);
    const abandonedTimeoutDate = new Date(Date.now() - ABANDONED_TIMEOUT_MINUTES * 60 * 1000);
    
    // Find inactive sessions
    const inactiveSessions = await prisma.chatSession.findMany({
      where: {
        status: { in: ['active', 'waiting'] },
        updatedAt: { lt: inactiveTimeoutDate }
      },
      include: {
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      }
    });
    
    // Find abandoned sessions (active with agent but customer inactive)
    const abandonedSessions = await prisma.chatSession.findMany({
      where: {
        status: 'active',
        agentId: { not: null },
        updatedAt: { lt: abandonedTimeoutDate }
      },
      include: {
        messages: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      }
    });
    
    // Close inactive sessions
    const closedSessions = await Promise.all(
      inactiveSessions.map(async (session) => {
        // Update session status
        const updatedSession = await prisma.chatSession.update({
          where: { id: session.id },
          data: { 
            status: 'closed',
            closedAt: new Date(),
            closedReason: 'inactive'
          }
        });
        
        // Add system message about session closure
        await prisma.message.create({
          data: {
            sessionId: session.id,
            role: 'system',
            content: 'This chat session has been closed due to inactivity.',
            timestamp: new Date()
          }
        });
        
        // Notify clients via socket
        if (io) {
          io.to(String(session.id)).emit('sessionUpdated', {
            id: session.id,
            status: 'closed',
            closedReason: 'inactive'
          });
          
          io.to('agents').emit('sessionUpdated', {
            id: session.id,
            status: 'closed',
            closedReason: 'inactive'
          });
        }
        
        return updatedSession;
      })
    );
    
    // Mark abandoned sessions
    const markedAbandonedSessions = await Promise.all(
      abandonedSessions.map(async (session) => {
        // Check if last message was from agent
        const lastMessageFromAgent = session.messages.length > 0 && 
          session.messages[0].role === 'agent';
        
        if (lastMessageFromAgent) {
          // Update session status
          const updatedSession = await prisma.chatSession.update({
            where: { id: session.id },
            data: { 
              status: 'abandoned',
              closedAt: new Date(),
              closedReason: 'customer_abandoned'
            }
          });
          
          // Add system message about session abandonment
          await prisma.message.create({
            data: {
              sessionId: session.id,
              role: 'system',
              content: 'The customer appears to have left the chat. This session has been marked as abandoned.',
              timestamp: new Date()
            }
          });
          
          // Notify clients via socket
          if (io) {
            io.to(String(session.id)).emit('sessionUpdated', {
              id: session.id,
              status: 'abandoned',
              closedReason: 'customer_abandoned'
            });
            
            io.to('agents').emit('sessionUpdated', {
              id: session.id,
              status: 'abandoned', 
              closedReason: 'customer_abandoned'
            });
          }
          
          return updatedSession;
        }
        
        return null;
      })
    );
    
    // Filter out null results
    const validAbandonedSessions = markedAbandonedSessions.filter(
      (session) => session !== null
    );
    
    return NextResponse.json({
      success: true,
      inactiveClosed: closedSessions.length,
      abandonedMarked: validAbandonedSessions.length,
      inactiveSessions: closedSessions.map(s => s.id),
      abandonedSessions: validAbandonedSessions.map(s => s?.id)
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to clean up sessions'
      },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint to manually close a specific session
 */
export async function POST(req: NextRequest) {
  try {
    const { sessionId, reason = 'manual_close' } = await req.json();
    
    // Verify the session exists
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId }
    });
    
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Session not found' },
        { status: 404 }
      );
    }
    
    // Update session status
    const updatedSession = await prisma.chatSession.update({
      where: { id: sessionId },
      data: { 
        status: 'closed',
        closedAt: new Date(),
        closedReason: reason
      }
    });
    
    // Add system message about session closure
    await prisma.message.create({
      data: {
        sessionId,
        role: 'system',
        content: 'This chat session has been closed.',
        timestamp: new Date()
      }
    });
    
    // Notify clients via socket
    if (io) {
      io.to(String(sessionId)).emit('sessionUpdated', {
        id: sessionId,
        status: 'closed',
        closedReason: reason
      });
      
      io.to('agents').emit('sessionUpdated', {
        id: sessionId,
        status: 'closed',
        closedReason: reason
      });
    }
    
    return NextResponse.json({
      success: true,
      session: updatedSession
    });
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to close session'
      },
      { status: 500 }
    );
  }
} 