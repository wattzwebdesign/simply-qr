import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const R2_ENDPOINT = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
const R2_BUCKET = process.env.R2_BUCKET_NAME || 'simply-qr'

export class R2Storage {
  private client: S3Client

  constructor() {
    this.client = new S3Client({
      region: 'auto',
      endpoint: R2_ENDPOINT,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
      },
    })
  }

  async uploadQRCode(
    key: string,
    buffer: Buffer,
    contentType: string = 'image/png'
  ): Promise<string> {
    try {
      const command = new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })

      await this.client.send(command)

      // Return the public URL
      return this.getPublicUrl(key)
    } catch (error) {
      console.error('Error uploading to R2:', error)
      throw new Error('Failed to upload QR code to storage')
    }
  }

  async getQRCode(key: string): Promise<Buffer> {
    try {
      const command = new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
      })

      const response = await this.client.send(command)
      const stream = response.Body

      if (!stream) {
        throw new Error('No data in response')
      }

      // Convert stream to buffer
      const chunks: Uint8Array[] = []
      for await (const chunk of stream as any) {
        chunks.push(chunk)
      }

      return Buffer.concat(chunks)
    } catch (error) {
      console.error('Error retrieving from R2:', error)
      throw new Error('Failed to retrieve QR code from storage')
    }
  }

  async deleteQRCode(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
      })

      await this.client.send(command)
    } catch (error) {
      console.error('Error deleting from R2:', error)
      throw new Error('Failed to delete QR code from storage')
    }
  }

  async getSignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: R2_BUCKET,
        Key: key,
      })

      return await getSignedUrl(this.client, command, { expiresIn })
    } catch (error) {
      console.error('Error generating signed URL:', error)
      throw new Error('Failed to generate signed URL')
    }
  }

  getPublicUrl(key: string): string {
    const publicDomain = process.env.R2_PUBLIC_DOMAIN
    if (publicDomain) {
      return `https://${publicDomain}/${key}`
    }
    return `https://${R2_BUCKET}.${process.env.R2_ACCOUNT_ID}.r2.dev/${key}`
  }
}

export const r2Storage = new R2Storage()
