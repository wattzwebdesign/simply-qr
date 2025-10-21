import { QRCode, Scan, User, Folder, Tag, AnalyticsData } from '@/types'

// Database helper functions for D1
export class Database {
  private db: D1Database

  constructor(db: D1Database) {
    this.db = db
  }

  // User operations
  async createUser(user: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    const now = Math.floor(Date.now() / 1000)
    await this.db
      .prepare(
        `INSERT INTO users (id, clerk_id, email, first_name, last_name, image_url, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        user.id,
        user.clerkId,
        user.email,
        user.firstName || null,
        user.lastName || null,
        user.imageUrl || null,
        now,
        now
      )
      .run()

    return { ...user, createdAt: now, updatedAt: now }
  }

  async getUserByClerkId(clerkId: string): Promise<User | null> {
    const result = await this.db
      .prepare('SELECT * FROM users WHERE clerk_id = ?')
      .bind(clerkId)
      .first()

    return result as any as User | null
  }

  // QR Code operations
  async createQRCode(qrCode: Omit<QRCode, 'createdAt' | 'updatedAt'>): Promise<QRCode> {
    const now = Math.floor(Date.now() / 1000)
    await this.db
      .prepare(
        `INSERT INTO qr_codes (
          id, user_id, name, description, url, short_code,
          foreground_color, background_color, logo_url, error_correction, size,
          image_path, status, scan_count, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        qrCode.id,
        qrCode.userId,
        qrCode.name,
        qrCode.description || null,
        qrCode.url,
        qrCode.shortCode,
        qrCode.foregroundColor,
        qrCode.backgroundColor,
        qrCode.logoUrl || null,
        qrCode.errorCorrection,
        qrCode.size,
        qrCode.imagePath || null,
        qrCode.status,
        0,
        now,
        now
      )
      .run()

    return { ...qrCode, scanCount: 0, createdAt: now, updatedAt: now }
  }

  async getQRCodeById(id: string): Promise<QRCode | null> {
    const result = await this.db
      .prepare('SELECT * FROM qr_codes WHERE id = ?')
      .bind(id)
      .first()

    return result as any as QRCode | null
  }

  async getQRCodeByShortCode(shortCode: string): Promise<QRCode | null> {
    const result = await this.db
      .prepare('SELECT * FROM qr_codes WHERE short_code = ?')
      .bind(shortCode)
      .first()

    return result as any as QRCode | null
  }

  async getQRCodesByUserId(userId: string, limit: number = 50, offset: number = 0): Promise<QRCode[]> {
    const results = await this.db
      .prepare('SELECT * FROM qr_codes WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?')
      .bind(userId, limit, offset)
      .all()

    return results.results as any as QRCode[]
  }

  async updateQRCode(id: string, updates: Partial<QRCode>): Promise<void> {
    const now = Math.floor(Date.now() / 1000)
    const fields = Object.keys(updates)
      .filter(k => k !== 'id' && k !== 'createdAt')
      .map(k => `${k} = ?`)
      .join(', ')

    const values = Object.entries(updates)
      .filter(([k]) => k !== 'id' && k !== 'createdAt')
      .map(([, v]) => v)

    await this.db
      .prepare(`UPDATE qr_codes SET ${fields}, updated_at = ? WHERE id = ?`)
      .bind(...values, now, id)
      .run()
  }

  async deleteQRCode(id: string): Promise<void> {
    await this.db
      .prepare('DELETE FROM qr_codes WHERE id = ?')
      .bind(id)
      .run()
  }

  async incrementScanCount(qrCodeId: string): Promise<void> {
    await this.db
      .prepare('UPDATE qr_codes SET scan_count = scan_count + 1 WHERE id = ?')
      .bind(qrCodeId)
      .run()
  }

  // Scan operations
  async createScan(scan: Omit<Scan, 'scannedAt'>): Promise<Scan> {
    const now = Math.floor(Date.now() / 1000)
    await this.db
      .prepare(
        `INSERT INTO scans (
          id, qr_code_id, scanned_at, ip_address, country, region, city,
          latitude, longitude, user_agent, browser, browser_version,
          os, os_version, device_type, device_brand, device_model, referrer
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        scan.id,
        scan.qrCodeId,
        now,
        scan.ipAddress || null,
        scan.country || null,
        scan.region || null,
        scan.city || null,
        scan.latitude || null,
        scan.longitude || null,
        scan.userAgent || null,
        scan.browser || null,
        scan.browserVersion || null,
        scan.os || null,
        scan.osVersion || null,
        scan.deviceType || null,
        scan.deviceBrand || null,
        scan.deviceModel || null,
        scan.referrer || null
      )
      .run()

    return { ...scan, scannedAt: now }
  }

  async getScansByQRCodeId(qrCodeId: string, limit: number = 100): Promise<Scan[]> {
    const results = await this.db
      .prepare('SELECT * FROM scans WHERE qr_code_id = ? ORDER BY scanned_at DESC LIMIT ?')
      .bind(qrCodeId, limit)
      .all()

    return results.results as any as Scan[]
  }

  async getAnalytics(qrCodeId: string): Promise<AnalyticsData> {
    const now = Math.floor(Date.now() / 1000)
    const oneDayAgo = now - 86400
    const oneWeekAgo = now - 604800
    const oneMonthAgo = now - 2592000

    const [total, today, week, month, countries, devices, byDate] = await Promise.all([
      this.db.prepare('SELECT COUNT(*) as count FROM scans WHERE qr_code_id = ?').bind(qrCodeId).first(),
      this.db.prepare('SELECT COUNT(*) as count FROM scans WHERE qr_code_id = ? AND scanned_at >= ?').bind(qrCodeId, oneDayAgo).first(),
      this.db.prepare('SELECT COUNT(*) as count FROM scans WHERE qr_code_id = ? AND scanned_at >= ?').bind(qrCodeId, oneWeekAgo).first(),
      this.db.prepare('SELECT COUNT(*) as count FROM scans WHERE qr_code_id = ? AND scanned_at >= ?').bind(qrCodeId, oneMonthAgo).first(),
      this.db.prepare('SELECT country, COUNT(*) as count FROM scans WHERE qr_code_id = ? AND country IS NOT NULL GROUP BY country ORDER BY count DESC LIMIT 5').bind(qrCodeId).all(),
      this.db.prepare('SELECT device_type, COUNT(*) as count FROM scans WHERE qr_code_id = ? AND device_type IS NOT NULL GROUP BY device_type ORDER BY count DESC').bind(qrCodeId).all(),
      this.db.prepare("SELECT DATE(scanned_at, 'unixepoch') as date, COUNT(*) as count FROM scans WHERE qr_code_id = ? AND scanned_at >= ? GROUP BY date ORDER BY date").bind(qrCodeId, oneMonthAgo).all(),
    ])

    return {
      totalScans: (total as any)?.count || 0,
      scansToday: (today as any)?.count || 0,
      scansThisWeek: (week as any)?.count || 0,
      scansThisMonth: (month as any)?.count || 0,
      topCountries: (countries.results || []) as any[],
      topDevices: (devices.results || []) as any[],
      scansByDate: (byDate.results || []) as any[],
    }
  }

  // Folder operations
  async createFolder(folder: Omit<Folder, 'createdAt' | 'updatedAt'>): Promise<Folder> {
    const now = Math.floor(Date.now() / 1000)
    await this.db
      .prepare('INSERT INTO folders (id, user_id, name, parent_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(folder.id, folder.userId, folder.name, folder.parentId || null, now, now)
      .run()

    return { ...folder, createdAt: now, updatedAt: now }
  }

  async getFoldersByUserId(userId: string): Promise<Folder[]> {
    const results = await this.db
      .prepare('SELECT * FROM folders WHERE user_id = ? ORDER BY name')
      .bind(userId)
      .all()

    return results.results as any as Folder[]
  }

  // Tag operations
  async createTag(tag: Omit<Tag, 'createdAt'>): Promise<Tag> {
    const now = Math.floor(Date.now() / 1000)
    await this.db
      .prepare('INSERT INTO tags (id, user_id, name, color, created_at) VALUES (?, ?, ?, ?, ?)')
      .bind(tag.id, tag.userId, tag.name, tag.color, now)
      .run()

    return { ...tag, createdAt: now }
  }

  async getTagsByUserId(userId: string): Promise<Tag[]> {
    const results = await this.db
      .prepare('SELECT * FROM tags WHERE user_id = ? ORDER BY name')
      .bind(userId)
      .all()

    return results.results as any as Tag[]
  }

  async addTagToQRCode(qrCodeId: string, tagId: string): Promise<void> {
    const now = Math.floor(Date.now() / 1000)
    await this.db
      .prepare('INSERT OR IGNORE INTO qr_code_tags (qr_code_id, tag_id, created_at) VALUES (?, ?, ?)')
      .bind(qrCodeId, tagId, now)
      .run()
  }
}
