import Sidebar from '@/components/layout/Sidebar'
import AuthProvider from '@/components/layout/AuthProvider'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <main style={{
          marginLeft: 'var(--sidebar-width)',
          padding: '40px',
          flex: 1,
          minHeight: '100vh',
        }}>
          {children}
        </main>
      </div>
    </AuthProvider>
  )
}