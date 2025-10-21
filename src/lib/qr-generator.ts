import QRCode from 'qrcode'
import sharp from 'sharp'
import { nanoid } from 'nanoid'

export interface QRCodeOptions {
  url: string
  size?: number
  foregroundColor?: string
  backgroundColor?: string
  errorCorrection?: 'L' | 'M' | 'Q' | 'H'
  logoUrl?: string
  format?: 'png' | 'svg'
}

const ERROR_CORRECTION_LEVELS = {
  L: 0.07, // ~7% damage
  M: 0.15, // ~15% damage
  Q: 0.25, // ~25% damage
  H: 0.30, // ~30% damage
}

export async function generateQRCode(options: QRCodeOptions): Promise<Buffer> {
  const {
    url,
    size = 300,
    foregroundColor = '#000000',
    backgroundColor = '#FFFFFF',
    errorCorrection = 'M',
    logoUrl,
    format = 'png',
  } = options

  // Generate base QR code
  const qrBuffer = await QRCode.toBuffer(url, {
    errorCorrectionLevel: errorCorrection,
    type: 'png',
    width: size,
    color: {
      dark: foregroundColor,
      light: backgroundColor,
    },
    margin: 2,
  })

  // If no logo, return the base QR code
  if (!logoUrl) {
    return qrBuffer
  }

  // Add logo to QR code
  return await addLogoToQRCode(qrBuffer, logoUrl, size, errorCorrection)
}

async function addLogoToQRCode(
  qrBuffer: Buffer,
  logoUrl: string,
  size: number,
  errorCorrection: 'L' | 'M' | 'Q' | 'H'
): Promise<Buffer> {
  try {
    // Fetch logo
    const logoResponse = await fetch(logoUrl)
    if (!logoResponse.ok) {
      throw new Error('Failed to fetch logo')
    }
    const logoBuffer = Buffer.from(await logoResponse.arrayBuffer())

    // Calculate logo size (based on error correction level)
    const maxLogoSizePercent = ERROR_CORRECTION_LEVELS[errorCorrection]
    const logoSize = Math.floor(size * Math.sqrt(maxLogoSizePercent))

    // Process logo
    const processedLogo = await sharp(logoBuffer)
      .resize(logoSize, logoSize, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png()
      .toBuffer()

    // Composite logo onto QR code
    const result = await sharp(qrBuffer)
      .composite([
        {
          input: processedLogo,
          gravity: 'center',
        },
      ])
      .png()
      .toBuffer()

    return result
  } catch (error) {
    console.error('Error adding logo to QR code:', error)
    // Return QR code without logo if logo processing fails
    return qrBuffer
  }
}

export function generateShortCode(length: number = 8): string {
  return nanoid(length)
}

export async function generateQRCodeSVG(options: QRCodeOptions): Promise<string> {
  const {
    url,
    size = 300,
    foregroundColor = '#000000',
    backgroundColor = '#FFFFFF',
    errorCorrection = 'M',
  } = options

  return await QRCode.toString(url, {
    errorCorrectionLevel: errorCorrection,
    type: 'svg',
    width: size,
    color: {
      dark: foregroundColor,
      light: backgroundColor,
    },
    margin: 2,
  })
}
