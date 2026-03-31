export function compartirWhatsApp(
  nombreEmpleado: string,
  totalFiniquito: number,
  totalLiquidacion: number,
  tipoDocumento: string
) {
  const fmt = (n: number) =>
    n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })

  let mensaje = `*Cálculo Aequo — ${nombreEmpleado}*\n\n`

  if (tipoDocumento === 'despido' || tipoDocumento === 'ambos') {
    mensaje += `⚖️ Liquidación (despido): ${fmt(totalLiquidacion)}\n`
  }
  if (tipoDocumento === 'renuncia' || tipoDocumento === 'ambos') {
    mensaje += `✅ Finiquito (renuncia): ${fmt(totalFiniquito)}\n`
  }

  mensaje += `\nReporte generado con Aequo.`

  window.open(`https://wa.me/?text=${encodeURIComponent(mensaje)}`, '_blank')
}

export function compartirCorreo(
  nombreEmpleado: string,
  totalFiniquito: number,
  totalLiquidacion: number,
  tipoDocumento: string
) {
  const fmt = (n: number) =>
    n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })

  const asunto = encodeURIComponent(`Cálculo laboral — ${nombreEmpleado}`)

  let cuerpo = `Cálculo Aequo\n\nEmpleado: ${nombreEmpleado}\n`

  if (tipoDocumento === 'despido' || tipoDocumento === 'ambos') {
    cuerpo += `Liquidación (despido injustificado): ${fmt(totalLiquidacion)}\n`
  }
  if (tipoDocumento === 'renuncia' || tipoDocumento === 'ambos') {
    cuerpo += `Finiquito (renuncia voluntaria): ${fmt(totalFiniquito)}\n`
  }

  cuerpo += `\nReporte generado con Aequo.`

  window.open(`mailto:?subject=${asunto}&body=${encodeURIComponent(cuerpo)}`, '_blank')
}