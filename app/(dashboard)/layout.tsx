import Sidebar from '@/components/layout/Sidebar'
import AuthProvider from '@/components/layout/AuthProvider'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div className="dashboard-container">
        <Sidebar />
        <main className="dashboard-main">
          {children}
        </main>
      </div>
    </AuthProvider>
  )
}
