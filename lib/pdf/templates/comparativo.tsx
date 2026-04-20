import jsPDF from 'jspdf'
import type { ResultadoCalculo } from '@/lib/calculos/types'
import type { Branding } from '@/lib/pdf/branding'

const fmt = (n: number) =>
  n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })

const fmtFecha = (fecha: string) => {
  if (!fecha) return ''
  const d = new Date(fecha + 'T12:00:00')
  return d.toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long', year: 'numeric'
  }).toUpperCase()
}

export function generarTabla(
  doc: jsPDF,
  titulo: string,
  desglose: ResultadoCalculo['finiquito']['desglose'],
  total: number,
  y: number,
  branding: Branding // Added branding parameter
): number {
  const margen = 20
  const anchoDoc = 215.9
  const anchoUtil = anchoDoc - margen * 2

  const colConcepto = margen
  const colDias = margen + anchoUtil * 0.45
  const colTotal = margen + anchoUtil * 0.63
  const colConciliacion = anchoDoc - margen

  // Convert hex color to RGB
  const colorPrimarioInt = parseInt(branding.colorPrimario.replace('#', ''), 16);
  const colorRGB = [(colorPrimarioInt >> 16) & 0xff, (colorPrimarioInt >> 8) & 0xff, colorPrimarioInt & 0xff];

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(colorRGB[0], colorRGB[1], colorRGB[2]) // Use branding color
  doc.text(titulo.toUpperCase(), anchoDoc / 2, y, { align: 'center' })
  y += 5

  doc.setLineWidth(0.8)
  doc.setDrawColor(colorRGB[0], colorRGB[1], colorRGB[2]) // Use branding color
  doc.line(margen, y, anchoDoc - margen, y)
  y += 1
  doc.setLineWidth(0.3)
  doc.line(margen, y, anchoDoc - margen, y)
  y += 6

  doc.setFontSize(8.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(colorRGB[0], colorRGB[1], colorRGB[2]) // Use branding color
  doc.text('PRESTACION', colConcepto, y)
  doc.text('DIAS', colDias, y, { align: 'center' })
  doc.text('TOTAL', colTotal, y, { align: 'right' })
  doc.text('CONCILIACION', colConciliacion, y, { align: 'right' })
  y += 3

  doc.setLineWidth(0.3)
  doc.setDrawColor(colorRGB[0], colorRGB[1], colorRGB[2]) // Use branding color
  doc.line(margen, y, anchoDoc - margen, y) // Corrected typo: manageable -> anchoDoc - margen
  y += 6

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.setTextColor(colorRGB[0], colorRGB[1], colorRGB[2]) // Use branding color
  doc.text('Total', colConcepto, y)
  doc.text(fmt(total), colTotal, y, { align: 'right' })
  const totalConciliacion = desglose.reduce((a, b) => a + b.propuestaConciliacion, 0)
  doc.text(fmt(totalConciliacion), colConciliacion, y, { align: 'right' })
  y += 10

  return y
}

export function generarComparativo(
  doc: jsPDF,
  resultado: ResultadoCalculo,
  empleado: string,
  puesto: string,
  empresa: string,
  branding: Branding,
  yInicial: number,
  tipo: 'despido' | 'renuncia'
) {
  const margen = 20
  const anchoDoc = 215.9
  let y = yInicial

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(20)
  doc.text(`TRABAJADOR: ${empleado.toUpperCase()}`, anchoDoc / 2, y, { align: 'center' })
  y += 10

  doc.setFontSize(9.5)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(20)
  doc.text('A QUIEN CORRESPONDA:', margen, y)
  y += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(40)
  doc.text('Calculo de finiquito, basado en las condiciones del trabajador, desempenando el cargo de', margen, y)
  y += 5

  doc.setFont('helvetica', 'bold')
  doc.setTextColor(20)
  const puestoTexto = puesto.toUpperCase()
  const enTexto = ' en la empresa denominada '
  const empresaTexto = empresa.toUpperCase() + ':'
  const anchoPuesto = doc.getTextWidth(puestoTexto)
  const anchoEn = doc.getTextWidth(enTexto)

  doc.text(puestoTexto, margen, y)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(40)
  doc.text(enTexto, margen + anchoPuesto, y)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(20)
  doc.text(empresaTexto, margen + anchoPuesto + anchoEn, y)
  y += 12

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(20)
  doc.text('CONDICIONES LABORALES', anchoDoc / 2, y, { align: 'center' })
  y += 4

  doc.setLineWidth(0.8)
  doc.setDrawColor(20)
  doc.line(margen, y, anchoDoc - margen, y)
  y += 1
  doc.setLineWidth(0.3)
  doc.line(margen, y, anchoDoc - margen, y)
  y += 8

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(30)

  const condiciones = [
    `FECHA DE INGRESO: ${fmtFecha(branding.fechaIngreso || '')}`,
    `FECHA DE ${tipo === 'despido' ? 'DESPIDO' : 'RENUNCIA'}: ${fmtFecha(branding.fechaSalida || '')}`,
    `ANTIGUEDAD: ${resultado.aniosCompletos} ANO${resultado.aniosCompletos !== 1 ? 'S' : ''}, ${resultado.mesesRestantes} MES${resultado.mesesRestantes !== 1 ? 'ES' : ''}, ${resultado.diasRestantes} DIA${resultado.diasRestantes !== 1 ? 'S' : ''}`,
  ]

  condiciones.forEach(c => {
    doc.text(`*  ${c}`, margen + 4, y)
    y += 7
  })

  if (branding.periodos && branding.periodos.length > 1) {
    branding.periodos.forEach(p => {
      doc.text(`*  SALARIO DIARIO ${p.anio}: $${p.salarioDiario.toFixed(2)}`, margen + 4, y)
      y += 7
    })
  } else {
    doc.text(`*  SALARIO DIARIO: $${(branding.salarioDiario ?? 0).toFixed(2)}`, margen + 4, y)
    y += 7
  }

  y += 4

  const tituloTabla = tipo === 'despido'
    ? 'Finiquito por despido injustificado'
    : 'Finiquito por renuncia voluntaria'

  const desglose = tipo === 'despido'
    ? resultado.liquidacion.desglose
    : resultado.finiquito.desglose

  const total = tipo === 'despido'
    ? resultado.liquidacion.total
    : resultado.finiquito.total

  y = generarTabla(doc, tituloTabla, desglose, total, y, branding) // Pass branding object

  return doc
}