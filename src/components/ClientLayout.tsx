'use client'

import LiveUpdatesDashboard from './LiveUpdatesDashboard'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <LiveUpdatesDashboard />
    </>
  )
}