'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { label: 'Calculadora', href: '/calculadora' },
  { label: 'Expedientes', href: '/expedientes' },
  { label: 'Estilo', href: '/estilo' },
]

export default function Sidebar() {
  const pathname = usePathname()

  const handleLogout = async () => {
    console.log('Botón de cerrar sesión presionado');
    
    try {
      const supabase = createClient();
      console.log('Cliente de Supabase obtenido, intentando signOut...');
      
      // Intentamos cerrar sesión pero no bloqueamos el hilo con await si tarda mucho
      supabase.auth.signOut().then(() => {
        console.log('Supabase: Sesión cerrada correctamente');
      }).catch(err => {
        console.error('Supabase: Error al cerrar sesión:', err);
      });

      // Limpieza manual inmediata
      console.log('Limpiando localStorage y cookies...');
      localStorage.clear();
      sessionStorage.clear();
      
      // Borrar cookies manualmente
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      }

      console.log('Redirigiendo a /login...');
      window.location.href = '/login';
      
    } catch (error) {
      console.error('Error crítico en handleLogout:', error);
      window.location.href = '/login';
    }
  };

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      borderRight: '1px solid var(--border)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      position: 'fixed',
      top: 0,
      left: 0,
      background: 'var(--bg-primary)',
      zIndex: 9999, // Aseguramos que esté por encima de todo
    }}>
      <div style={{
        padding: '0 8px 24px',
        borderBottom: '1px solid var(--border)',
        marginBottom: '8px',
      }}>
        <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
          Aequo
        </span>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {navItems.map((item) => {
          const activo = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: '8px',
                borderRadius: 'var(--radius)',
                color: activo ? 'var(--text-primary)' : 'var(--text-secondary)',
                background: activo ? 'var(--bg-surface)' : 'transparent',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: activo ? '500' : '400',
              }}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
        <button
          type="button"
          onClick={() => {
            console.log('Click detectado en el botón');
            handleLogout();
          }}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: 'var(--radius)',
            color: 'var(--text-secondary)',
            background: 'transparent',
            border: 'none',
            fontSize: '14px',
            fontWeight: '400',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
