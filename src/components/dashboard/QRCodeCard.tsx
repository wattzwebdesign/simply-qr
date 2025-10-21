'use client'

import { QRCode } from '@/types'
import Link from 'next/link'

interface QRCodeCardProps {
  qrCode: QRCode
  onDelete: (id: string) => void
}

export function QRCodeCard({ qrCode, onDelete }: QRCodeCardProps) {
  const shortUrl = `${process.env.NEXT_PUBLIC_APP_URL}/s/${qrCode.shortCode}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl)
    alert('Short URL copied to clipboard!')
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition">
      {/* QR Code Preview */}
      <div className="bg-gray-50 p-6 flex items-center justify-center">
        {qrCode.imagePath ? (
          <img
            src={`/api/qr-codes/${qrCode.id}/image`}
            alt={qrCode.name}
            className="w-48 h-48 object-contain"
          />
        ) : (
          <div className="w-48 h-48 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-gray-400">No image</span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-1 truncate">
          {qrCode.name}
        </h3>
        {qrCode.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {qrCode.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center space-x-4 mb-4 text-sm">
          <div className="flex items-center space-x-1 text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span>{qrCode.scanCount} scans</span>
          </div>
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            qrCode.status === 'active'
              ? 'bg-green-100 text-green-800'
              : qrCode.status === 'paused'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {qrCode.status}
          </div>
        </div>

        {/* Short URL */}
        <div className="flex items-center space-x-2 mb-4">
          <input
            type="text"
            value={shortUrl}
            readOnly
            className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded truncate"
          />
          <button
            onClick={copyToClipboard}
            className="p-2 text-gray-600 hover:text-primary-600 transition"
            title="Copy URL"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Link
            href={`/dashboard/qr/${qrCode.id}`}
            className="flex-1 px-4 py-2 text-sm text-center bg-primary-600 text-white rounded hover:bg-primary-700 transition"
          >
            View Details
          </Link>
          <button
            onClick={() => onDelete(qrCode.id)}
            className="px-4 py-2 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
