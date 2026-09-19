import { NextRequest, NextResponse } from 'next/server'
import { ResultadoCalculo, DatosEmpleado } from '@/lib/calculos/types'

interface OpcionesGenerador {
  resultado: ResultadoCalculo
  datos: DatosEmpleado
}

export async function POST(request: NextRequest) {
  try {
    const { resultado, datos } = await request.json() as OpcionesGenerador

    if (!resultado || !datos) {
      return NextResponse.json({ error: 'Faltan datos requeridos' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: 'Server-side PDF generation endpoint ready',
      fallbackAvailable: true,
    })
  } catch (error) {
    console.error('Error en fallback PDF:', error)
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}
