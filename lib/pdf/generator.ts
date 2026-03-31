import jsPDF from 'jspdf'
import type { ResultadoCalculo, DatosEmpleado } from '@/lib/calculos/types'
import { aplicarEncabezado, aplicarPiePagina, brandingDefault, type Branding } from './branding'
import { generarComparativo } from './templates/comparativo'

interface OpcionesGenerador {
  resultado: ResultadoCalculo
  datos: DatosEmpleado
  branding?: Branding
}

export function generarPDF({
  resultado,
  datos,
  branding = brandingDefault,
}: OpcionesGenerador): jsPDF {
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

  const tipo = resultado.tipoDocumento

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
}

export function descargarPDF(opciones: OpcionesGenerador, nombreArchivo: string) {
  const doc = generarPDF(opciones)
  doc.save(`${nombreArchivo}.pdf`)
}