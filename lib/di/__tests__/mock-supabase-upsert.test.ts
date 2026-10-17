import { describe, it, expect } from 'vitest'
import { createMockSupabaseClient } from '../mock-supabase'

describe('MockSupabase upsert (Bug 2 fix)', () => {
  it('inserts when the record id does not exist', async () => {
    const client = createMockSupabaseClient()
    const result = await client
      .from('profiles')
      .upsert({ id: 'new-user-1', nombre: 'Nuevo', color_primario: '#fff' })

    expect(result.error).toBeNull()
    expect(result.data).toMatchObject({
      id: 'new-user-1',
      nombre: 'Nuevo',
      color_primario: '#fff',
    })
  })

  it('updates in place when the record id already exists', async () => {
    const client = createMockSupabaseClient()
    const before = await client.from('profiles').select('*').eq('id', 'mock-user-1').maybeSingle()
    expect(before.data?.nombre).toBe('Usuario Mock')

    const result = await client
      .from('profiles')
      .upsert({ id: 'mock-user-1', nombre: 'Editado', color_primario: '#0a0a0a' })

    expect(result.error).toBeNull()
    expect(result.data).toMatchObject({
      id: 'mock-user-1',
      nombre: 'Editado',
      color_primario: '#0a0a0a',
    })

    const after = await client.from('profiles').select('*').eq('id', 'mock-user-1').maybeSingle()
    expect(after.data?.nombre).toBe('Editado')
    expect(after.data?.despacho).toBe('Despacho Mock')
  })

  it('generates an id when none is provided', async () => {
    const client = createMockSupabaseClient()
    const result = await client
      .from('profiles')
      .upsert({ nombre: 'Sin id' })

    expect(result.error).toBeNull()
    expect(result.data).toMatchObject({ nombre: 'Sin id' })
    expect((result.data as { id: string }).id).toMatch(/^mock-/)
  })

  it('mutations are visible to subsequent queries (insert + select)', async () => {
    const client = createMockSupabaseClient()
    await client.from('expedientes').insert({
      user_id: 'mock-user-1',
      nombre_empleado: 'Nuevo Exp',
      datos_calculo: {},
      resultado: {},
    })

    const all = await client.from('expedientes').select('*').eq('user_id', 'mock-user-1')
    const rows = (all as unknown as { data: Array<{ nombre_empleado: string }> }).data
    const inserted = rows.find(e => e.nombre_empleado === 'Nuevo Exp')
    expect(inserted).toBeDefined()
  })

  it('mutations are visible to subsequent queries (update)', async () => {
    const client = createMockSupabaseClient()
    await client.from('profiles').update({ color_primario: '#deadbe' }).eq('id', 'mock-user-1')

    const after = await client.from('profiles').select('*').eq('id', 'mock-user-1').maybeSingle()
    expect((after.data as { color_primario: string }).color_primario).toBe('#deadbe')
  })
})
