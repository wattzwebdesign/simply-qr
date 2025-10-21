'use client'

import { useState } from 'react'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { QRCodeList } from '@/components/dashboard/QRCodeList'
import { CreateQRCodeModal } from '@/components/dashboard/CreateQRCodeModal'

export const runtime = 'edge'

export default function DashboardPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-lg"></div>
                <span className="text-xl font-bold text-gray-900">Simply QR</span>
              </Link>
              <div className="flex space-x-6">
                <Link
                  href="/dashboard"
                  className="text-primary-600 font-medium border-b-2 border-primary-600 pb-1"
                >
                  QR Codes
                </Link>
                <Link
                  href="/dashboard/analytics"
                  className="text-gray-600 hover:text-gray-900 pb-1"
                >
                  Analytics
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="text-gray-600 hover:text-gray-900 pb-1"
                >
                  Settings
                </Link>
              </div>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">QR Codes</h1>
            <p className="text-gray-600 mt-1">Manage and track your QR codes</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create QR Code</span>
          </button>
        </div>

        {/* QR Code List */}
        <QRCodeList />
      </main>

      {/* Create Modal */}
      <CreateQRCodeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  )
}
