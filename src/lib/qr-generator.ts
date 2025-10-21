import QRCode from 'qrcode'
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

  // Note: Logo overlay is not supported in Edge Runtime
  // Sharp (required for logo processing) is not compatible with Edge
  // If you need logo support, consider using a separate image processing service

  return qrBuffer
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
