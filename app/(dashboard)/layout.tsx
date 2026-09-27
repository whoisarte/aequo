import Sidebar from '@/components/layout/Sidebar'
import AuthProvider from '@/components/layout/AuthProvider'
import { Suspense } from 'react';

function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Cargando...</p>
    </div>
  );
}

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
          <Suspense fallback={<Loading />}>
            {children}
          </Suspense>
        </main>
        <footer style={{
          position: 'fixed',
          bottom: 0,
          left: 'var(--sidebar-width)',
          right: 0,
          padding: '8px 16px',
          borderTop: '1px solid var(--border)',
          fontSize: '11px',
          color: 'var(--text-hint)',
          textAlign: 'center',
          background: 'var(--bg-primary)',
        }}>
          La informaci&oacute;n proporcionada por este chatbot es solo para fines informativos generales y no constituye asesoramiento legal.
        </footer>
      </div>
    </AuthProvider>
  )
}
