export interface PeriodoAnual {
  anio: number
  salarioDiario: number
  diasVacacionesUsados: number
  aplicaVacaciones: boolean
  aplicaPrimaVacacional: boolean
  aplicaAguinaldo: boolean
  // New fields for extra benefits
  incluirBeneficiosExtra?: boolean
  beneficiosExtra?: { nombre: string; monto: number }[]
}

export type TipoDocumento = 'despido' | 'renuncia' | 'ambos'

export interface DatosEmpleado {
  nombreEmpleado: string
  puestoEmpleado: string
  empresa: string
  fechaIngreso: string
  fechaSalida: string
  tipoDocumento: TipoDocumento
  periodos: PeriodoAnual[]
}

export interface DesglosePaso {
  concepto: string
  dias: string
  total: number
  propuestaConciliacion: number
}

export interface ResultadoPeriodo {
  anio: number
  vacaciones: number
  primaVacacional: number
  aguinaldo: number
  subtotal: number
  desglose: DesglosePaso[]
}

export interface ResultadoFiniquito {
  periodos: ResultadoPeriodo[]
  total: number
  desglose: DesglosePaso[]
}

export interface ResultadoLiquidacion {
  indemnizacion: number
  diasPrimaAntiguedad: number // Store the days here
  montoPrimaAntiguedad: number // New field for monetary value
  periodos: ResultadoPeriodo[]
  total: number
  desglose: DesglosePaso[]
}

export interface ResultadoCalculo {
  finiquito: ResultadoFiniquito
  liquidacion: ResultadoLiquidacion
  diasLaborados: number
  aniosServicio: number
  aniosCompletos: number
  mesesRestantes: number
  diasRestantes: number
  tipoDocumento: TipoDocumento
  datosCalculo: DatosEmpleado // Add this field
}

export interface DatosAbogado {
  nombre: string
  despacho: string
  cedula: string
  correo: string
  direccion: string
  logoUrl: string
  colorPrimario: string
  porcentajeConciliacion: number
}

export interface Expediente {
  id: string
  nombreEmpleado: string
  puestoEmpleado: string
  empresa: string
  fechaIngreso: string
  fechaSalida: string
  salarioDiario: number
  tipoDocumento: string
  resultado?: ResultadoCalculo // Ahora es opcional para el transporte
  datosCalculo: DatosEmpleado
  creadoEn: string
}