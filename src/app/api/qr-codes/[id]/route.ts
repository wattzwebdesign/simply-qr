import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { Database } from '@/lib/db'
import { r2Storage } from '@/lib/r2-storage'
import { UpdateQRCodeInput } from '@/types'
import { generateQRCode } from '@/lib/qr-generator'

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
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = getDB()
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    const database = new Database(db)
    const qrCode = await database.getQRCodeById(id)

    if (!qrCode) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 })
    }

    // Verify ownership
    const user = await database.getUserByClerkId(userId)
    if (!user || qrCode.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ qrCode })
  } catch (error) {
    console.error('Error fetching QR code:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = getDB()
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    const database = new Database(db)
    const qrCode = await database.getQRCodeById(id)

    if (!qrCode) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 })
    }

    // Verify ownership
    const user = await database.getUserByClerkId(userId)
    if (!user || qrCode.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const updates: UpdateQRCodeInput = await request.json()

    // Check if visual properties changed (requires regeneration)
    const visualChanged =
      updates.url ||
      updates.foregroundColor ||
      updates.backgroundColor ||
      updates.logoUrl ||
      updates.errorCorrection ||
      updates.size

    if (visualChanged) {
      // Regenerate QR code
      const qrBuffer = await generateQRCode({
        url: updates.url || qrCode.url,
        size: updates.size || qrCode.size,
        foregroundColor: updates.foregroundColor || qrCode.foregroundColor,
        backgroundColor: updates.backgroundColor || qrCode.backgroundColor,
        errorCorrection: updates.errorCorrection || qrCode.errorCorrection,
        logoUrl: updates.logoUrl !== undefined ? updates.logoUrl : qrCode.logoUrl,
      })

      // Upload to R2 (replace existing)
      if (qrCode.imagePath) {
        await r2Storage.uploadQRCode(qrCode.imagePath, qrBuffer, 'image/png')
      }
    }

    // Update database
    await database.updateQRCode(id, updates)

    const updatedQRCode = await database.getQRCodeById(id)

    return NextResponse.json({ qrCode: updatedQRCode })
  } catch (error) {
    console.error('Error updating QR code:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = getDB()
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    const database = new Database(db)
    const qrCode = await database.getQRCodeById(id)

    if (!qrCode) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 })
    }

    // Verify ownership
    const user = await database.getUserByClerkId(userId)
    if (!user || qrCode.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Delete from R2
    if (qrCode.imagePath) {
      await r2Storage.deleteQRCode(qrCode.imagePath)
    }

    // Delete from database
    await database.deleteQRCode(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting QR code:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
