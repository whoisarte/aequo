const MOCK_MINIMUM_WAGES: Record<string, Record<string, number>> = {
  general: { 2020: 123.22, 2021: 141.7, 2022: 172.87, 2023: 207.44, 2024: 248.93, 2025: 278.8, 2026: 300.0 },
  frontera_norte: { 2020: 185.56, 2021: 213.39, 2022: 260.34, 2023: 312.41, 2024: 374.89, 2025: 419.88, 2026: 450.0 },
}

interface MockUser {
  id: string
  email: string
  user_metadata: { full_name?: string }
  created_at?: string
}

interface MockSession {
  access_token: string
  refresh_token?: string
  user: MockUser
  expires_at?: number
}

interface MockAuthCallbacks {
  [key: string]: Array<(event: string, session: MockSession | null) => void>
}

class MockSupabaseAuth {
  private currentUser: MockUser | null = null
  private currentSession: MockSession | null = null
  private callbacks: MockAuthCallbacks = {}
  private listeners: Array<() => void> = []

  constructor() {
    console.log('[MOCK AUTH] Constructor called')
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mock_auth')
      console.log('[MOCK AUTH] localStorage mock_auth:', stored ? 'found' : 'not found')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          console.log('[MOCK AUTH] Loaded user:', parsed?.user?.id, parsed?.user?.email)
          this.currentUser = parsed.user
          this.currentSession = parsed.session
        } catch (e) {
          console.error('[MOCK AUTH] Failed to parse stored auth:', e)
        }
      }

      if (!this.currentUser) {
        const mockMode = process.env.NEXT_PUBLIC_APP_MODE
        const isLocalMode = mockMode === 'local'
        if (isLocalMode) {
          console.log('[MOCK AUTH] Auto-login as mock-user-1 for local mode')
          const user: MockUser = {
            id: 'mock-user-1',
            email: 'mock@example.com',
            user_metadata: { full_name: 'Usuario Mock' },
            created_at: new Date().toISOString(),
          }
          this.currentUser = user
          this.currentSession = {
            access_token: `mock_token_${Date.now()}`,
            refresh_token: `mock_refresh_${Date.now()}`,
            user,
            expires_at: Date.now() + 3600000,
          }
          this.persist()
        }
      }
    }
  }

  private persist() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('mock_auth', JSON.stringify({
        user: this.currentUser,
        session: this.currentSession,
      }))
    }
  }

  private notify(event: string, session: MockSession | null) {
    this.callbacks[event]?.forEach(cb => cb(event, session))
    this.listeners.forEach(cb => cb())
  }

  private setAuthCookie(userId: string) {
    if (typeof document !== 'undefined') {
      document.cookie = `mock_user_id=${userId}; path=/; max-age=${60 * 60 * 24 * 7}`
    }
  }

  private clearAuthCookie() {
    if (typeof document !== 'undefined') {
      document.cookie = 'mock_user_id=; path=/; max-age=0'
    }
  }

  getSession() {
    console.log('[MOCK AUTH] getSession called, currentUser:', this.currentUser?.id, this.currentUser?.email)
    return Promise.resolve({ data: { session: this.currentSession }, error: null })
  }

  getUser() {
    console.log('[MOCK AUTH] getUser called, currentUser:', this.currentUser?.id)

    if (!this.currentUser && typeof document !== 'undefined') {
      const cookieMatch = document.cookie.match(/mock_user_id=([^;]+)/)
      if (cookieMatch) {
        const userId = cookieMatch[1]
        console.log('[MOCK AUTH] Found mock_user_id cookie:', userId)
        const stored = localStorage.getItem('mock_auth')
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            if (parsed?.user?.id === userId) {
              this.currentUser = parsed.user
              this.currentSession = parsed.session
            }
          } catch (e) {
            console.error('[MOCK AUTH] Failed to parse stored auth from cookie:', e)
          }
        }
      }
    }

    if (!this.currentUser) {
      const mockMode = process.env.NEXT_PUBLIC_APP_MODE
      const isLocalMode = mockMode === 'local'
      if (isLocalMode) {
        console.log('[MOCK AUTH] Auto-login as mock-user-1 for local mode')
        const user: MockUser = {
          id: 'mock-user-1',
          email: 'mock@example.com',
          user_metadata: { full_name: 'Usuario Mock' },
          created_at: new Date().toISOString(),
        }
        this.currentUser = user
        this.currentSession = {
          access_token: `mock_token_${Date.now()}`,
          refresh_token: `mock_refresh_${Date.now()}`,
          user,
          expires_at: Date.now() + 3600000,
        }
        this.persist()
      }
    }

    return Promise.resolve({ data: { user: this.currentUser }, error: null })
  }

  async signInWithPassword({ email, password }: { email: string; password: string }) {
    console.log('[MOCK AUTH] signInWithPassword:', email, '-> mock-user-1')

    if (password.length < 6) {
      return {
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials', code: 'invalid_credentials' }
      }
    }

    const userId = 'mock-user-1'
    const user: MockUser = {
      id: userId,
      email,
      user_metadata: { full_name: email.split('@')[0] },
      created_at: new Date().toISOString(),
    }

    this.currentUser = user
    this.currentSession = {
      access_token: `mock_token_${Date.now()}`,
      refresh_token: `mock_refresh_${Date.now()}`,
      user,
      expires_at: Date.now() + 3600000,
    }

    this.persist()
    this.setAuthCookie(userId)
    this.notify('SIGNED_IN', this.currentSession)

    return { data: { user, session: this.currentSession }, error: null }
  }

  async signUp({ email, password }: { email: string; password: string }) {
    console.log('[MOCK AUTH] signUp:', email)

    const userId = 'mock-user-1'
    const user: MockUser = {
      id: userId,
      email,
      user_metadata: { full_name: email.split('@')[0] },
      created_at: new Date().toISOString(),
    }

    this.currentUser = user
    this.currentSession = {
      access_token: `mock_token_${Date.now()}`,
      refresh_token: `mock_refresh_${Date.now()}`,
      user,
      expires_at: Date.now() + 3600000,
    }

    this.persist()
    this.setAuthCookie(userId)
    this.notify('SIGNED_UP', this.currentSession)

    return { data: { user, session: this.currentSession }, error: null }
  }

  async signOut() {
    console.log('[MOCK AUTH] signOut')
    this.currentUser = null
    this.currentSession = null
    this.persist()
    this.clearAuthCookie()
    this.notify('SIGNED_OUT', null)
    return { error: null }
  }

  onAuthStateChange(callback: (event: string, session: MockSession | null) => void) {
    const wrappedCallback = (event: string, session: MockSession | null) => {
      callback(event, session)
    }

    if (!this.callbacks['*']) this.callbacks['*'] = []
    this.callbacks['*'].push(wrappedCallback)

    // Emit INITIAL_SESSION if there's an existing session (like real Supabase does)
    if (this.currentSession && this.currentUser) {
      setTimeout(() => callback('INITIAL_SESSION', this.currentSession), 0)
    }

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            this.callbacks['*'] = this.callbacks['*']?.filter(cb => cb !== wrappedCallback) || []
          }
        }
      }
    }
  }
}

interface MockDatabaseStore {
  profiles: Record<string, unknown>[]
  expedientes: Record<string, unknown>[]
  subscriptions: Record<string, unknown>[]
  products: Record<string, unknown>[]
  minimum_wages: Record<string, unknown>[]
  webhook_events: Record<string, unknown>[]
}

class MockSupabaseDatabase {
  store: MockDatabaseStore = {
    profiles: [
      {
        id: 'mock-user-1',
        nombre: 'Usuario Mock',
        despacho: 'Despacho Mock',
        correo: 'mock@example.com',
        color_primario: '#2563eb',
        color_secundario: '#1e40af',
        fuente: 'helvetica',
        porcentaje_conciliacion: 50,
        zona_salarial: 'general',
        full_name: 'Usuario Mock',
        cedula: '12345678',
        direccion: null,
        logo_url: null,
        phone: null,
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ],
    expedientes: [
      {
        id: 'mock-exp-1',
        user_id: 'mock-user-1',
        nombre_empleado: 'María García López',
        empresa: 'Corporativo Azul S.A. de C.V.',
        datos_calculo: {
          nombreEmpleado: 'María García López',
          puestoEmpleado: 'Auxiliar Contable',
          empresa: 'Corporativo Azul S.A. de C.V.',
          fechaIngreso: '2019-03-15',
          fechaSalida: '2025-09-01',
          tipoDocumento: 'despido',
          periodos: [
            {
              anio: 2025,
              salarioDiario: 450.00,
              diasVacacionesUsados: 0,
              aplicaVacaciones: true,
              aplicaPrimaVacacional: true,
              aplicaAguinaldo: true,
              incluirBeneficiosExtra: false,
            },
            {
              anio: 2024,
              salarioDiario: 420.00,
              diasVacacionesUsados: 6,
              aplicaVacaciones: true,
              aplicaPrimaVacacional: true,
              aplicaAguinaldo: true,
              incluirBeneficiosExtra: true,
              beneficiosExtra: [{ nombre: 'Vale de despensa', monto: 2000 }],
            },
          ],
        },
        resultado: {
          finiquito: {
            periodos: [
              { concepto: 'Días trabajados parte proporcional', dias: '30', total: 13500, propuestaConciliacion: 6750 },
              { concepto: 'Vacaciones proporcionales', dias: '5', total: 2250, propuestaConciliacion: 1125 },
              { concepto: 'Prima vacacional proporcional', dias: '1.5', total: 675, propuestaConciliacion: 337.50 },
              { concepto: 'Aguinaldo proporcional (9 meses)', dias: '11.25', total: 5062.50, propuestaConciliacion: 2531.25 },
            ],
            total: 21487.50,
            desglose: [],
          },
          liquidacion: {
            indemnizacion: 40500,
            diasPrimaAntiguedad: 60,
            montoPrimaAntiguedad: 18000,
            periodos: [
              { concepto: '3 meses de salario', dias: '90', total: 40500, propuestaConciliacion: 20250 },
              { concepto: '20 días por año (6 años)', dias: '120', total: 54000, propuestaConciliacion: 27000 },
              { concepto: 'Prima de antigüedad (90 SMG)', dias: '60', total: 18000, propuestaConciliacion: 9000 },
              { concepto: 'Parte proporcional vacaciones', dias: '5', total: 2250, propuestaConciliacion: 1125 },
              { concepto: 'Parte proporcional aguinaldo', dias: '11.25', total: 5062.50, propuestaConciliacion: 2531.25 },
            ],
            total: 119812.50,
            desglose: [],
          },
          diasLaborados: 2380,
          aniosServicio: 6,
          aniosCompletos: 6,
          mesesRestantes: 5,
          diasRestantes: 17,
          tipoDocumento: 'despido',
          datosCalculo: {},
        },
        conciliacion_date: '2025-10-15T10:00:00Z',
        conciliacion_title: 'Audiencia Conciliación',
        conciliacion_description: 'Audiencia inicial de conciliación ante CFCRL',
        created_at: '2025-09-02T14:30:00Z',
      },
      {
        id: 'mock-exp-2',
        user_id: 'mock-user-1',
        nombre_empleado: 'José Hernández Ruiz',
        empresa: 'Industrial Metálica del Norte',
        datos_calculo: {
          nombreEmpleado: 'José Hernández Ruiz',
          puestoEmpleado: 'Soldador Senior',
          empresa: 'Industrial Metálica del Norte',
          fechaIngreso: '2021-06-01',
          fechaSalida: '2025-08-31',
          tipoDocumento: 'renuncia',
          periodos: [
            {
              anio: 2025,
              salarioDiario: 520.00,
              diasVacacionesUsados: 0,
              aplicaVacaciones: true,
              aplicaPrimaVacacional: true,
              aplicaAguinaldo: true,
              incluirBeneficiosExtra: false,
            },
          ],
        },
        resultado: {
          finiquito: {
            periodos: [
              { concepto: 'Días trabajados parte proporcional', dias: '30', total: 15600, propuestaConciliacion: 7800 },
              { concepto: 'Vacaciones proporcionales', dias: '4', total: 2080, propuestaConciliacion: 1040 },
              { concepto: 'Prima vacacional proporcional', dias: '1.2', total: 624, propuestaConciliacion: 312 },
              { concepto: 'Aguinaldo proporcional (8 meses)', dias: '10', total: 5200, propuestaConciliacion: 2600 },
            ],
            total: 23504,
            desglose: [],
          },
          liquidacion: {
            indemnizacion: 0,
            diasPrimaAntiguedad: 0,
            montoPrimaAntiguedad: 0,
            periodos: [],
            total: 0,
            desglose: [],
          },
          diasLaborados: 1518,
          aniosServicio: 4,
          aniosCompletos: 4,
          mesesRestantes: 2,
          diasRestantes: 30,
          tipoDocumento: 'renuncia',
          datosCalculo: {},
        },
        conciliacion_date: null,
        conciliacion_title: null,
        conciliacion_description: null,
        created_at: '2025-09-01T09:15:00Z',
      },
      {
        id: 'mock-exp-3',
        user_id: 'mock-user-1',
        nombre_empleado: 'Laura Martínez Sánchez',
        empresa: 'Consultora Estratégica LATAM',
        datos_calculo: {
          nombreEmpleado: 'Laura Martínez Sánchez',
          puestoEmpleado: 'Gerente de Proyecto',
          empresa: 'Consultora Estratégica LATAM',
          fechaIngreso: '2018-01-10',
          fechaSalida: '2025-06-30',
          tipoDocumento: 'ambos',
          periodos: [
            {
              anio: 2025,
              salarioDiario: 850.00,
              diasVacacionesUsados: 0,
              aplicaVacaciones: true,
              aplicaPrimaVacacional: true,
              aplicaAguinaldo: true,
              incluirBeneficiosExtra: true,
              beneficiosExtra: [
                { nombre: 'Bono trimestral', monto: 15000 },
                { nombre: 'Gastos médicos mayores', monto: 5000 },
              ],
            },
            {
              anio: 2024,
              salarioDiario: 800.00,
              diasVacacionesUsados: 10,
              aplicaVacaciones: true,
              aplicaPrimaVacacional: true,
              aplicaAguinaldo: true,
              incluirBeneficiosExtra: true,
              beneficiosExtra: [{ nombre: 'Bono anual', monto: 50000 }],
            },
          ],
        },
        resultado: {
          finiquito: {
            periodos: [
              { concepto: 'Días trabajados parte proporcional', dias: '30', total: 25500, propuestaConciliacion: 12750 },
              { concepto: 'Vacaciones proporcionales', dias: '6', total: 5100, propuestaConciliacion: 2550 },
              { concepto: 'Prima vacacional proporcional', dias: '1.8', total: 1530, propuestaConciliacion: 765 },
              { concepto: 'Aguinaldo proporcional (6 meses)', dias: '7.5', total: 6375, propuestaConciliacion: 3187.50 },
            ],
            total: 38505,
            desglose: [],
          },
          liquidacion: {
            indemnizacion: 76500,
            diasPrimaAntiguedad: 90,
            montoPrimaAntiguedad: 25080,
            periodos: [
              { concepto: '3 meses de salario', dias: '90', total: 76500, propuestaConciliacion: 38250 },
              { concepto: '20 días por año (7 años)', dias: '140', total: 119000, propuestaConciliacion: 59500 },
              { concepto: 'Prima de antigüedad (90 SMG)', dias: '90', total: 25080, propuestaConciliacion: 12540 },
              { concepto: 'Parte proporcional vacaciones', dias: '6', total: 5100, propuestaConciliacion: 2550 },
              { concepto: 'Parte proporcional aguinaldo', dias: '7.5', total: 6375, propuestaConciliacion: 3187.50 },
            ],
            total: 231055,
            desglose: [],
          },
          diasLaborados: 2698,
          aniosServicio: 7,
          aniosCompletos: 7,
          mesesRestantes: 5,
          diasRestantes: 20,
          tipoDocumento: 'ambos',
          datosCalculo: {},
        },
        conciliacion_date: '2025-07-20T11:00:00Z',
        conciliacion_title: 'Audiencia de Pruebas',
        conciliacion_description: 'Presentación de documentación y testigos',
        created_at: '2025-07-01T16:45:00Z',
      },
    ],
    subscriptions: [
      {
        id: 'mock-sub-1',
        user_id: 'mock-user-1',
        plan: 'mock-product-1',
        status: 'active',
        stripe_customer_id: 'mock_customer_1',
        stripe_sub_id: 'mock_stripe_sub_1',
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ],
    products: [
      {
        id: 'mock-product-1',
        name: 'Plan Profesional',
        description: 'Plan mensual profesional',
        price_cents: 29900,
        currency: 'mxn',
        features: ['Documentos ilimitados', 'Soporte prioritario'],
        is_active: true,
        stripe_price_id: 'mock_price_1',
        stripe_product_id: 'mock_prod_1',
        doc_limit: 999,
        idx: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'mock-product-2',
        name: 'Generación individual',
        description: 'Genera un documento',
        price_cents: 5000,
        currency: 'mxn',
        features: ['1 documento'],
        is_active: true,
        stripe_price_id: 'mock_price_2',
        stripe_product_id: 'mock_prod_2',
        doc_limit: 1,
        idx: 2,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ],
    minimum_wages: Object.entries(MOCK_MINIMUM_WAGES).flatMap(([zone, wages]) =>
      Object.entries(wages).map(([year, wage]) => ({
        id: `wage-${zone}-${year}`,
        zone,
        year: parseInt(year),
        daily_wage: wage,
        created_at: new Date().toISOString(),
        effective_date: `${year}-01-01`,
        updated_at: new Date().toISOString(),
      }))
    ),
    webhook_events: [],
  }

  from(table: keyof MockDatabaseStore) {
    return new MockQueryBuilder(this.store[table])
  }
}

class MockQueryBuilder {
  private data: Record<string, unknown>[]
  private filteredData: Record<string, unknown>[]
  private headMode: { count: 'exact' } | null = null

  constructor(data: Record<string, unknown>[]) {
    this.data = [...data]
    this.filteredData = [...data]
  }

  private getFiltered() {
    return this.filteredData
  }

  select(_columns?: string, options?: { count?: 'exact'; head?: boolean }) {
    console.log('[MOCK QUERY] select, data count:', this.data.length, 'options:', options)
    this.filteredData = [...this.data]
    if (options?.head) {
      this.headMode = options.count ? { count: options.count } : null
    }
    return this
  }

  eq(column: string, value: unknown) {
    console.log('[MOCK QUERY] eq:', column, value, 'before filter count:', this.filteredData.length)
    this.filteredData = this.filteredData.filter(item => item[column] === value)
    console.log('[MOCK QUERY] eq result count:', this.filteredData.length)
    return this
  }

  in(column: string, values: unknown[]) {
    this.filteredData = this.filteredData.filter(item => values.includes(item[column]))
    return this
  }

  gte(column: string, value: number | string) {
    this.filteredData = this.filteredData.filter(item => {
      const itemVal = item[column]
      return itemVal !== null && itemVal !== undefined && itemVal >= value
    })
    return this
  }

  lte(column: string, value: number | string) {
    this.filteredData = this.filteredData.filter(item => {
      const itemVal = item[column]
      return itemVal !== null && itemVal !== undefined && itemVal <= value
    })
    return this
  }

  gt(column: string, value: number | string) {
    this.filteredData = this.filteredData.filter(item => {
      const itemVal = item[column]
      return itemVal !== null && itemVal !== undefined && itemVal > value
    })
    return this
  }

  lt(column: string, value: number | string) {
    this.filteredData = this.filteredData.filter(item => {
      const itemVal = item[column]
      return itemVal !== null && itemVal !== undefined && itemVal < value
    })
    return this
  }

  neq(column: string, value: unknown) {
    this.filteredData = this.filteredData.filter(item => item[column] !== value)
    return this
  }

  single() {
    return Promise.resolve({ data: this.filteredData[0] || null, error: null })
  }

  maybeSingle() {
    return Promise.resolve({ data: this.filteredData[0] || null, error: null })
  }

  order(column: string, options?: { ascending: boolean }) {
    console.log('[MOCK QUERY] order by', column, 'before count:', this.filteredData.length)
    this.filteredData.sort((a, b) => {
      const aVal = a[column] as string | number
      const bVal = b[column] as string | number
      if (aVal === bVal) return 0
      const cmp = aVal < bVal ? -1 : 1
      return options?.ascending === false ? -cmp : cmp
    })
    return this
  }

  limit(n: number) {
    this.filteredData = this.filteredData.slice(0, n)
    return this
  }

  then<TResult1 = { data: Record<string, unknown>[] | null; error: null }, TResult2 = never>(
    onfulfilled?: ((value: { data: Record<string, unknown>[] | null; error: null } | { count: number | null; error: null }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    console.log('[MOCK QUERY] then, returning data count:', this.getFiltered().length, 'headMode:', this.headMode)
    if (this.headMode) {
      return Promise.resolve({ count: this.getFiltered().length, error: null }).then(onfulfilled, onrejected)
    }
    return Promise.resolve({ data: this.getFiltered(), error: null }).then(onfulfilled, onrejected)
  }

  insert(record: Record<string, unknown>) {
    const newRecord = { ...record, id: record.id || `mock-${Date.now()}` }
    this.data.push(newRecord)
    this.filteredData.push(newRecord)
    return Promise.resolve({ data: newRecord, error: null })
  }

  update(updates: Record<string, unknown>) {
    const self = this
    return {
      eq: (column: string, value: unknown) => {
        self.data = self.data.map(item =>
          item[column] === value ? { ...item, ...updates } : item
        )
        self.filteredData = self.filteredData.map(item =>
          item[column] === value ? { ...item, ...updates } : item
        )
        return Promise.resolve({ data: self.filteredData[0] || null, error: null })
      }
    }
  }

  delete() {
    const self = this
    return {
      eq: (_column: string, _value: unknown) => {
        return Promise.resolve({ data: null, error: null })
      }
    }
  }
}

export interface MockSupabaseClient {
  auth: MockSupabaseAuth
  from: (table: string) => ReturnType<MockSupabaseDatabase['from']>
}

export function createMockSupabaseClient(): MockSupabaseClient {
  const auth = new MockSupabaseAuth()
  const db = new MockSupabaseDatabase()

  return {
    auth,
    from: (table: string) => db.from(table as keyof MockDatabaseStore),
  }
}

export { createMockStripeService } from './mock'
export { createMockChatbotService } from './mock'
export { createMockMinimumWageService } from './mock'
