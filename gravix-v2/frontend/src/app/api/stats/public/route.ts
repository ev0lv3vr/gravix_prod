import { NextResponse } from 'next/server';

export async function GET() {
  // These are sensible defaults - in production, fetch from backend
  const stats = {
    analysesCompleted: 847,
    substrateCombinations: 30,
    adhesiveFamilies: 7,
    resolutionRate: 73,
  };

  return NextResponse.json(stats);
}
