import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { generateQRCode, generateShortCode } from '@/lib/qr-generator'
import { r2Storage } from '@/lib/r2-storage'
import { Database } from '@/lib/db'
import { CreateQRCodeInput } from '@/types'

export const dynamic = 'force-dynamic'

// This would be provided by Cloudflare Workers in production
// For development, we'll need to handle this differently
function getDB(): D1Database | null {
  // In production with Cloudflare Pages, this would be available via context
  return null
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = getDB()
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    const database = new Database(db)

    // Get user from database
    const user = await database.getUserByClerkId(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const qrCodes = await database.getQRCodesByUserId(user.id, limit, offset)

    return NextResponse.json({ qrCodes })
  } catch (error) {
    console.error('Error fetching QR codes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = getDB()
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    const database = new Database(db)

    // Get user from database
    let user = await database.getUserByClerkId(userId)
    if (!user) {
      // Create user if doesn't exist
      const clerkUser = await auth()
      user = await database.createUser({
        id: nanoid(),
        clerkId: userId,
        email: (clerkUser as any).user?.emailAddresses?.[0]?.emailAddress || '',
        firstName: (clerkUser as any).user?.firstName,
        lastName: (clerkUser as any).user?.lastName,
        imageUrl: (clerkUser as any).user?.imageUrl,
      })
    }

    const input: CreateQRCodeInput = await request.json()

    // Validate input
    if (!input.name || !input.url) {
      return NextResponse.json({ error: 'Name and URL are required' }, { status: 400 })
    }

    // Generate QR code
    const qrCodeId = nanoid()
    const shortCode = generateShortCode()

    const qrBuffer = await generateQRCode({
      url: input.url,
      size: input.size || 300,
      foregroundColor: input.foregroundColor || '#000000',
      backgroundColor: input.backgroundColor || '#FFFFFF',
      errorCorrection: input.errorCorrection || 'M',
      logoUrl: input.logoUrl,
    })

    // Upload to R2
    const imagePath = `qr-codes/${user.id}/${qrCodeId}.png`
    await r2Storage.uploadQRCode(imagePath, qrBuffer, 'image/png')

    // Save to database
    const qrCode = await database.createQRCode({
      id: qrCodeId,
      userId: user.id,
      name: input.name,
      description: input.description,
      url: input.url,
      shortCode,
      foregroundColor: input.foregroundColor || '#000000',
      backgroundColor: input.backgroundColor || '#FFFFFF',
      logoUrl: input.logoUrl,
      errorCorrection: input.errorCorrection || 'M',
      size: input.size || 300,
      imagePath,
      status: 'active',
      scanCount: 0,
    })

    // Add tags if provided
    if (input.tagIds && input.tagIds.length > 0) {
      for (const tagId of input.tagIds) {
        await database.addTagToQRCode(qrCode.id, tagId)
      }
    }

    return NextResponse.json({ qrCode }, { status: 201 })
  } catch (error) {
    console.error('Error creating QR code:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
