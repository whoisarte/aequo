import type { PeriodoAnual } from '@/lib/calculos/types'

export interface Branding {
  nombreDespacho: string
  nombreAbogado: string
  cedula: string
  correo: string
  direccion: string
  logoUrl: string
  colorPrimario: string
  porcentajeConciliacion: number
  fechaIngreso?: string
  fechaSalida?: string
  salarioDiario?: number
  periodos?: PeriodoAnual[]
}

export const brandingDefault: Branding = {
  nombreDespacho: '',
  nombreAbogado: '',
  cedula: '',
  correo: '',
  direccion: '',
  logoUrl: '',
  colorPrimario: '#0a0a0a',
  porcentajeConciliacion: 50,
}

export function aplicarEncabezado(
  doc: import('jspdf').jsPDF,
  branding: Branding
) {
  const margen = 20
  const anchoDoc = 215.9

  // Logo a la izquierda
  if (branding.logoUrl) {
    try {
      const imgProps = doc.getImageProperties(branding.logoUrl)
      const maxWidth = 40
      const maxHeight = 15
      const ratio = Math.min(maxWidth / imgProps.width, maxHeight / imgProps.height)
      const width = imgProps.width * ratio
      const height = imgProps.height * ratio
      
      // Centrar el logo en la caja de 40x15
      const x = margen + (maxWidth - width) / 2
      const y = 10 + (maxHeight - height) / 2
      
      doc.addImage(branding.logoUrl, 'PNG', x, y, width, height, undefined, 'FAST')
    } catch (e) {
      console.warn('Error al cargar logo en PDF:', e)
    }
  }

  if (branding.nombreDespacho) {
    doc.setFontSize(13)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(20)
    doc.text(branding.nombreDespacho.toUpperCase(), anchoDoc / 2, 20, { align: 'center' })
  }

  let y = 26
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(40)

  if (branding.nombreAbogado) {
    doc.text(`LIC. ${branding.nombreAbogado.toUpperCase()}`, anchoDoc / 2, y, { align: 'center' })
    y += 5
  }
  if (branding.cedula) {
    doc.text(`CEDULA: ${branding.cedula}`, anchoDoc / 2, y, { align: 'center' })
    y += 5
  }

  y += 2
  doc.setLineWidth(1)
  doc.setDrawColor(20)
  doc.line(margen, y, anchoDoc - margen, y)
  y += 1
  doc.setLineWidth(0.3)
  doc.line(margen, y, anchoDoc - margen, y)

  return y + 6
}

export function aplicarPiePagina(
  doc: import('jspdf').jsPDF,
  branding: Branding
) {
  const anchoDoc = 215.9
  const altoDoc = 279.4
  const margen = 20

  doc.setLineWidth(0.3)
  doc.setDrawColor(180)
  doc.line(margen, altoDoc - 18, anchoDoc - margen, altoDoc - 18)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100)

  if (branding.direccion) {
    doc.text(branding.direccion.toUpperCase(), anchoDoc / 2, altoDoc - 12, { align: 'center' })
  }
  if (branding.correo) {
    doc.text(branding.correo.toUpperCase(), anchoDoc / 2, altoDoc - 7, { align: 'center' })
  }
}