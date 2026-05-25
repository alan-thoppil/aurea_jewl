import { NextResponse } from 'next/server'

// Auth check removed — admin dashboard is publicly accessible.
// All routes pass through without session gating.
export async function updateSession(request) {
  return NextResponse.next({ request })
}
