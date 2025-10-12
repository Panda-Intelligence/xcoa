import { type NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/db';
import { scaleResponseTable, ecoaScaleTable, ecoaItemTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getSessionFromCookie } from '@/utils/auth';
import { createId } from '@paralleldrive/cuid2';

// Validation schemas
interface ResponseSubmission {
  sessionId?: string; // Optional - will be generated if not provided
  responses: Array<{
    itemId: string;
    itemNumber: number;
    response: any;
    responseValue?: number;
    startedAt?: Date;
    completedAt?: Date;
    timeSpentSeconds?: number;
    isSkipped?: boolean;
  }>;
}

/**
 * POST /api/scales/[scaleId]/responses
 * Submit user responses to a scale assessment
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ scaleId: string }> }
) {
  try {
    // Check authentication
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login to submit responses' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const { scaleId } = params;
    const userId = session.user.id;

    // Parse request body
    const body = await request.json() as ResponseSubmission;

    if (!body.responses || !Array.isArray(body.responses) || body.responses.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request - responses array is required' },
        { status: 400 }
      );
    }

    const db = getDB();

    // Verify scale exists
    const scale = await db
      .select()
      .from(ecoaScaleTable)
      .where(eq(ecoaScaleTable.id, scaleId))
      .limit(1);

    if (scale.length === 0) {
      return NextResponse.json(
        { error: 'Scale not found' },
        { status: 404 }
      );
    }

    // Generate or use provided sessionId
    const sessionId = body.sessionId || `session_${createId()}`;

    // Get client IP
    const ipAddress = request.headers.get('x-forwarded-for') ||
                      request.headers.get('x-real-ip') ||
                      'unknown';

    // Validate and prepare responses for insertion
    const validatedResponses = [];
    const errors = [];

    for (let i = 0; i < body.responses.length; i++) {
      const resp = body.responses[i];

      // Validate required fields
      if (!resp.itemId) {
        errors.push(`Response ${i + 1}: itemId is required`);
        continue;
      }

      if (resp.itemNumber === undefined || resp.itemNumber === null) {
        errors.push(`Response ${i + 1}: itemNumber is required`);
        continue;
      }

      // Verify item exists and belongs to this scale
      const item = await db
        .select()
        .from(ecoaItemTable)
        .where(and(
          eq(ecoaItemTable.id, resp.itemId),
          eq(ecoaItemTable.scaleId, scaleId)
        ))
        .limit(1);

      if (item.length === 0) {
        errors.push(`Response ${i + 1}: Invalid itemId or item does not belong to this scale`);
        continue;
      }

      // Prepare response object
      validatedResponses.push({
        userId,
        scaleId,
        sessionId,
        itemId: resp.itemId,
        itemNumber: resp.itemNumber,
        response: resp.response,
        responseValue: resp.responseValue || null,
        startedAt: resp.startedAt ? new Date(resp.startedAt) : null,
        completedAt: resp.completedAt ? new Date(resp.completedAt) : new Date(),
        timeSpentSeconds: resp.timeSpentSeconds || null,
        isSkipped: resp.isSkipped ? 1 : 0,
        ipAddress: ipAddress.substring(0, 100), // Limit length
      });
    }

    // If there are validation errors, return them
    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: errors,
          successCount: validatedResponses.length,
          errorCount: errors.length
        },
        { status: 400 }
      );
    }

    // Insert all valid responses
    const insertedResponses = await db
      .insert(scaleResponseTable)
      .values(validatedResponses)
      .returning();

    // Update scale usage count
    await db
      .update(ecoaScaleTable)
      .set({
        usageCount: scale[0].usageCount + 1
      })
      .where(eq(ecoaScaleTable.id, scaleId));

    return NextResponse.json({
      success: true,
      sessionId,
      responsesCount: insertedResponses.length,
      message: 'Responses saved successfully',
      data: {
        scaleId,
        scaleName: scale[0].name,
        sessionId,
        totalResponses: insertedResponses.length,
        completionRate: calculateCompletionRate(insertedResponses.length, scale[0].itemsCount),
      }
    });

  } catch (error) {
    console.error('Error saving responses:', error);
    return NextResponse.json(
      { error: 'Failed to save responses', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/scales/[scaleId]/responses
 * Get user's responses for a specific session or all sessions
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ scaleId: string }> }
) {
  try {
    const session = await getSessionFromCookie();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const { scaleId } = params;
    const userId = session.user.id;

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('sessionId');
    const limit = Number.parseInt(searchParams.get('limit') || '100', 10);
    const offset = Number.parseInt(searchParams.get('offset') || '0', 10);

    const db = getDB();

    // Build query conditions
    let conditions = [
      eq(scaleResponseTable.userId, userId),
      eq(scaleResponseTable.scaleId, scaleId)
    ];

    if (sessionId) {
      conditions.push(eq(scaleResponseTable.sessionId, sessionId));
    }

    // Fetch responses
    const responses = await db
      .select()
      .from(scaleResponseTable)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset)
      .orderBy(scaleResponseTable.createdAt);

    // Get scale info
    const scale = await db
      .select()
      .from(ecoaScaleTable)
      .where(eq(ecoaScaleTable.id, scaleId))
      .limit(1);

    if (scale.length === 0) {
      return NextResponse.json(
        { error: 'Scale not found' },
        { status: 404 }
      );
    }

    // Group responses by session if no specific session requested
    const groupedBySession = sessionId ? null : groupResponsesBySession(responses);

    return NextResponse.json({
      success: true,
      scaleId,
      scaleName: scale[0].name,
      totalResponses: responses.length,
      responses: sessionId ? responses : groupedBySession,
      sessionId: sessionId || null,
    });

  } catch (error) {
    console.error('Error fetching responses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch responses' },
      { status: 500 }
    );
  }
}

// Helper functions
function calculateCompletionRate(responsesCount: number, totalItems: number): number {
  if (totalItems === 0) return 0;
  return Math.round((responsesCount / totalItems) * 100);
}

function groupResponsesBySession(responses: any[]) {
  const grouped: Record<string, any> = {};

  for (const response of responses) {
    if (!grouped[response.sessionId]) {
      grouped[response.sessionId] = {
        sessionId: response.sessionId,
        responses: [],
        startedAt: response.startedAt,
        lastUpdated: response.updatedAt,
        totalResponses: 0,
      };
    }

    grouped[response.sessionId].responses.push(response);
    grouped[response.sessionId].totalResponses++;

    // Update lastUpdated if this response is newer
    if (response.updatedAt > grouped[response.sessionId].lastUpdated) {
      grouped[response.sessionId].lastUpdated = response.updatedAt;
    }
  }

  return Object.values(grouped);
}
