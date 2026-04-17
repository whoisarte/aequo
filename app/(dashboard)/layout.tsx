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
      </div>
    </AuthProvider>
  )
}
