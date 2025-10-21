import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/db'
import { r2Storage } from '@/lib/r2-storage'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

function getDB(): D1Database | null {
  return null
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = getDB()
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    const database = new Database(db)
    const qrCode = await database.getQRCodeById(id)

    if (!qrCode || !qrCode.imagePath) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 })
    }

    // Get image from R2
    const imageBuffer = await r2Storage.getQRCode(qrCode.imagePath)

    return new NextResponse(imageBuffer as any, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error serving QR code image:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
