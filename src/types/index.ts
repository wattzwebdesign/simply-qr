export interface User {
  id: string
  clerkId: string
  email: string
  firstName?: string
  lastName?: string
  imageUrl?: string
  createdAt: number
  updatedAt: number
}

export interface QRCode {
  id: string
  userId: string
  name: string
  description?: string
  url: string
  shortCode: string
  foregroundColor: string
  backgroundColor: string
  logoUrl?: string
  errorCorrection: 'L' | 'M' | 'Q' | 'H'
  size: number
  imagePath?: string
  status: 'active' | 'paused' | 'archived'
  scanCount: number
  createdAt: number
  updatedAt: number
}

export interface Scan {
  id: string
  qrCodeId: string
  scannedAt: number
  ipAddress?: string
  country?: string
  region?: string
  city?: string
  latitude?: number
  longitude?: number
  userAgent?: string
  browser?: string
  browserVersion?: string
  os?: string
  osVersion?: string
  deviceType?: 'mobile' | 'tablet' | 'desktop'
  deviceBrand?: string
  deviceModel?: string
  referrer?: string
}

export interface Folder {
  id: string
  userId: string
  name: string
  parentId?: string
  createdAt: number
  updatedAt: number
}

export interface Tag {
  id: string
  userId: string
  name: string
  color: string
  createdAt: number
}

export interface QRCodeWithRelations extends QRCode {
  tags?: Tag[]
  folders?: Folder[]
}

export interface AnalyticsData {
  totalScans: number
  scansToday: number
  scansThisWeek: number
  scansThisMonth: number
  topCountries: { country: string; count: number }[]
  topDevices: { deviceType: string; count: number }[]
  scansByDate: { date: string; count: number }[]
}

export interface CreateQRCodeInput {
  name: string
  description?: string
  url: string
  foregroundColor?: string
  backgroundColor?: string
  logoUrl?: string
  errorCorrection?: 'L' | 'M' | 'Q' | 'H'
  size?: number
  folderIds?: string[]
  tagIds?: string[]
}

export interface UpdateQRCodeInput extends Partial<CreateQRCodeInput> {
  status?: 'active' | 'paused' | 'archived'
}

export interface CloudflareEnv {
  DB: D1Database
  QR_BUCKET: R2Bucket
  CLERK_SECRET_KEY: string
}
