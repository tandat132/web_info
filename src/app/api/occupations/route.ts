import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Profile from '@/models/Profile';
import { DEFAULT_OCCUPATIONS } from '@/lib/constants';

// GET /api/occupations - Get list of occupations
export async function GET() {
  try {
    await dbConnect();

    // Get unique occupations from the database
    const occupations = await Profile.distinct('occupation', { status: 'published' });
    
    // Filter out empty values and combine with default occupations
    const validOccupations = occupations.filter(Boolean);
    const allOccupations = Array.from(new Set([...DEFAULT_OCCUPATIONS, ...validOccupations]));

    return NextResponse.json({
      success: true,
      occupations: allOccupations.sort()
    });
  } catch (error) {
    console.error('Error fetching occupations:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch occupations',
        occupations: DEFAULT_OCCUPATIONS 
      },
      { status: 500 }
    );
  }
}