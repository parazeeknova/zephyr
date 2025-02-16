import { tagCache } from '@zephyr/db';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    await tagCache.syncTagCounts();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error syncing tag counts:', error);
    return NextResponse.json({ error: 'Failed to sync tags' }, { status: 500 });
  }
}
