import type { ResultadoCalculo, DatosEmpleado } from '@/lib/calculos/types'
import { aplicarEncabezado, aplicarPiePagina, brandingDefault, type Branding } from './branding'
import { generarComparativo } from './templates/comparativo'

interface OpcionesGenerador {
  resultado: ResultadoCalculo
  datos: DatosEmpleado
  branding?: Branding
}

async function loadJsPDF() {
  const { default: jsPDF } = await import('jspdf')
  return jsPDF
}

async function loadHtml2Canvas() {
  const html2canvas = await import('html2canvas')
  return html2canvas.default || html2canvas
}

export async function generarPDF({
  resultado,
  datos,
  branding = brandingDefault,
}: OpcionesGenerador) {
  try {
    const jsPDF = await loadJsPDF()
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })

    const ultimoPeriodo = datos.periodos[datos.periodos.length - 1]
    const salarioDiario = ultimoPeriodo?.salarioDiario ?? 0

    const brandingConDatos: Branding = {
      ...branding,
      fechaIngreso: datos.fechaIngreso,
      fechaSalida: datos.fechaSalida,
      salarioDiario,
      periodos: datos.periodos,
    }

    const tipo = resultado.tipoDocumento || datos.tipoDocumento;

    if (!tipo) {
      console.error('Tipo de documento no encontrado en resultado ni en datos');
      return doc;
    }

    if (tipo === 'despido' || tipo === 'ambos') {
      const yInicial = aplicarEncabezado(doc, brandingConDatos)
      generarComparativo(doc, resultado, datos.nombreEmpleado, datos.puestoEmpleado, datos.empresa, brandingConDatos, yInicial, 'despido')
      aplicarPiePagina(doc, brandingConDatos)
    }

    if (tipo === 'renuncia' || tipo === 'ambos') {
      if (tipo === 'ambos') doc.addPage()
      const yInicial = aplicarEncabezado(doc, brandingConDatos)
      generarComparativo(doc, resultado, datos.nombreEmpleado, datos.puestoEmpleado, datos.empresa, brandingConDatos, yInicial, 'renuncia')
      aplicarPiePagina(doc, brandingConDatos)
    }

    return doc
  } catch (error) {
    console.error('Error generando PDF en cliente, intentando fallback:', error)
    try {
      await fetch('/api/pdf/fallback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resultado, datos }),
      })
    } catch {
      console.error('Fallback PDF no disponible')
    }
    const jsPDF = await loadJsPDF()
    return new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })
  }
}

export async function descargarPDF(opciones: OpcionesGenerador, nombreArchivo: string) {
  const doc = await generarPDF(opciones)
  doc.save(`${nombreArchivo}.pdf`)
}