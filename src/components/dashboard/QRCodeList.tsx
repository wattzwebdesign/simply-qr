'use client'

import { useEffect, useState } from 'react'
import { QRCode } from '@/types'
import { QRCodeCard } from './QRCodeCard'

export function QRCodeList() {
  const [qrCodes, setQRCodes] = useState<QRCode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchQRCodes()
  }, [])

  async function fetchQRCodes() {
    try {
      setLoading(true)
      const response = await fetch('/api/qr-codes')

      if (!response.ok) {
        throw new Error('Failed to fetch QR codes')
      }

      const data = await response.json() as any
      setQRCodes(data.qrCodes || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this QR code?')) {
      return
    }

    try {
      const response = await fetch(`/api/qr-codes/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete QR code')
      }

      setQRCodes(qrCodes.filter(qr => qr.id !== id))
    } catch (err) {
      alert('Failed to delete QR code')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
        Error: {error}
      </div>
    )
  }

  if (qrCodes.length === 0) {
    return (
      <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No QR codes yet</h3>
        <p className="text-gray-600">Get started by creating your first QR code</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {qrCodes.map(qrCode => (
        <QRCodeCard
          key={qrCode.id}
          qrCode={qrCode}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}
