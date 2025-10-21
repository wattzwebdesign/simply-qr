'use client'

import { AnalyticsData } from '@/types'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface AnalyticsChartsProps {
  analytics: AnalyticsData
}

const COLORS = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981']

export function AnalyticsCharts({ analytics }: AnalyticsChartsProps) {
  return (
    <div className="space-y-8">
      {/* Scans Over Time */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Scans Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analytics.scansByDate}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#0ea5e9" name="Scans" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Top Countries */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Countries</h3>
          {analytics.topCountries.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.topCountries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="country" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#0ea5e9" name="Scans" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">No country data available</p>
            </div>
          )}
        </div>

        {/* Device Types */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Types</h3>
          {analytics.topDevices.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.topDevices}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ deviceType, percent }: any) => `${deviceType} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="deviceType"
                >
                  {analytics.topDevices.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">No device data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
