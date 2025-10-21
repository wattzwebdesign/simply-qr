import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { UAParser } from 'ua-parser-js'
import { Database } from '@/lib/db'

export const dynamic = 'force-dynamic'

function getDB(): D1Database | null {
  return null
}

async function getLocationData(ip: string) {
  try {
    // Use a geolocation API (ipapi.co, ipinfo.io, etc.)
    const response = await fetch(`https://ipapi.co/${ip}/json/`)
    if (!response.ok) return null

    const data = await response.json() as any
    return {
      country: data.country_name,
      region: data.region,
      city: data.city,
      latitude: data.latitude,
      longitude: data.longitude,
    }
  } catch (error) {
    console.error('Error fetching location data:', error)
    return null
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  try {
    const { shortCode } = await params
    const db = getDB()
    if (!db) {
      return NextResponse.json({ error: 'Database not available' }, { status: 500 })
    }

    const database = new Database(db)
    const qrCode = await database.getQRCodeByShortCode(shortCode)

    if (!qrCode) {
      return NextResponse.json({ error: 'QR code not found' }, { status: 404 })
    }

    if (qrCode.status !== 'active') {
      return NextResponse.json({ error: 'QR code is not active' }, { status: 403 })
    }

    // Get request metadata
    const userAgent = request.headers.get('user-agent') || ''
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown'
    const referrer = request.headers.get('referer') || undefined

    // Parse user agent
    const parser = new UAParser(userAgent)
    const uaResult = parser.getResult()

    // Get location data
    const locationData = ip !== 'unknown' ? await getLocationData(ip) : null

    // Record scan
    await database.createScan({
      id: nanoid(),
      qrCodeId: qrCode.id,
      ipAddress: ip,
      country: locationData?.country,
      region: locationData?.region,
      city: locationData?.city,
      latitude: locationData?.latitude,
      longitude: locationData?.longitude,
      userAgent,
      browser: uaResult.browser.name,
      browserVersion: uaResult.browser.version,
      os: uaResult.os.name,
      osVersion: uaResult.os.version,
      deviceType: (uaResult.device.type === 'mobile' || uaResult.device.type === 'tablet') ? uaResult.device.type : 'desktop',
      deviceBrand: uaResult.device.vendor,
      deviceModel: uaResult.device.model,
      referrer,
    })

    // Increment scan count
    await database.incrementScanCount(qrCode.id)

    // Redirect to target URL
    return NextResponse.redirect(qrCode.url, { status: 302 })
  } catch (error) {
    console.error('Error processing scan:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
