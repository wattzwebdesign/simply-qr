'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { QRCode, AnalyticsData } from '@/types'
import { AnalyticsCharts } from '@/components/qr/AnalyticsCharts'

export default function QRCodeDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [qrCode, setQRCode] = useState<QRCode | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchData()
    }
  }, [params.id])

  async function fetchData() {
    try {
      setLoading(true)
      const [qrResponse, analyticsResponse] = await Promise.all([
        fetch(`/api/qr-codes/${params.id}`),
        fetch(`/api/analytics/${params.id}`),
      ])

      if (qrResponse.ok) {
        const qrData = await qrResponse.json() as any
        setQRCode(qrData.qrCode)
      }

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json() as any
        setAnalytics(analyticsData.analytics)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!qrCode) return
    const link = document.createElement('a')
    link.href = `/api/qr-codes/${qrCode.id}/image`
    link.download = `${qrCode.name}.png`
    link.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!qrCode) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">QR Code Not Found</h2>
          <Link href="/dashboard" className="text-primary-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  const shortUrl = `${process.env.NEXT_PUBLIC_APP_URL}/s/${qrCode.shortCode}`

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">{qrCode.name}</h1>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - QR Code */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border p-6 sticky top-8">
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                {qrCode.imagePath ? (
                  <img
                    src={`/api/qr-codes/${qrCode.id}/image`}
                    alt={qrCode.name}
                    className="w-full"
                  />
                ) : (
                  <div className="aspect-square bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-gray-400">No image</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleDownload}
                className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition mb-4"
              >
                Download QR Code
              </button>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Short URL
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={shortUrl}
                      readOnly
                      className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(shortUrl)
                        alert('Copied!')
                      }}
                      className="p-2 text-gray-600 hover:text-primary-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target URL
                  </label>
                  <a
                    href={qrCode.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-600 hover:underline break-all"
                  >
                    {qrCode.url}
                  </a>
                </div>

                {qrCode.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <p className="text-sm text-gray-600">{qrCode.description}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className={`inline-block px-3 py-1 rounded text-sm font-medium ${
                    qrCode.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : qrCode.status === 'paused'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {qrCode.status}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Analytics */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics</h2>

              {analytics && (
                <>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Total Scans</div>
                      <div className="text-2xl font-bold text-gray-900">{analytics.totalScans}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Today</div>
                      <div className="text-2xl font-bold text-gray-900">{analytics.scansToday}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">This Week</div>
                      <div className="text-2xl font-bold text-gray-900">{analytics.scansThisWeek}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">This Month</div>
                      <div className="text-2xl font-bold text-gray-900">{analytics.scansThisMonth}</div>
                    </div>
                  </div>

                  {/* Charts */}
                  <AnalyticsCharts analytics={analytics} />
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
