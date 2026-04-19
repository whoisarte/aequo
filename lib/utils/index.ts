import type { PostgrestError } from '@supabase/supabase-js'

export const DEFAULT_TIMEOUT_MS = 8000

export function createTimeoutError(message: string): PostgrestError {
  return {
    name: 'PostgrestError',
    message,
    details: '',
    hint: '',
    code: 'TIMEOUT',
  }
}

export function createTimeoutFailure(message: string) {
  return {
    data: null,
    error: createTimeoutError(message),
    count: null,
    status: 408,
    statusText: 'Request Timeout',
  }
}

/**
 * Wraps a promise with a timeout.
 * If the promise doesn't resolve within timeoutMs, returns the fallback value.
 *
 * @param promise The promise to wrap
 * @param fallback The value to return if timeout occurs
 * @param timeoutMs Timeout duration in milliseconds (default: 8000)
 * @returns The promise result or fallback value
 */
export async function withTimeout<T>(
  promise: PromiseLike<T>,
  fallback: T,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | null = null

  return new Promise<T>((resolve) => {
    timer = setTimeout(() => {
      resolve(fallback)
    }, timeoutMs)

    void promise
      .then((value) => {
        if (timer) clearTimeout(timer)
        resolve(value)
      }, () => {
        if (timer) clearTimeout(timer)
        resolve(fallback)
      })
  })
}
