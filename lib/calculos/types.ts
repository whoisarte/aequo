export interface PeriodoAnual {
  anio: number
  salarioDiario: number
  diasVacacionesUsados: number
  aplicaVacaciones: boolean
  aplicaPrimaVacacional: boolean
  aplicaAguinaldo: boolean
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
  antiguedad: number
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