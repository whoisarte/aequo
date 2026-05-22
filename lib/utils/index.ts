import type { PostgrestError, PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js'

export const DEFAULT_TIMEOUT_MS = 8000

export function createTimeoutError(message: string): PostgrestError {
  const error = {
    name: 'PostgrestError',
    message,
    details: '',
    hint: '',
    code: 'TIMEOUT',
    // Add toJSON method to satisfy PostgrestError interface
    toJSON() {
      return {
        name: this.name,
        message: this.message,
        details: this.details,
        hint: this.hint,
        code: this.code,
      };
    },
  };
  return error;
}

export function createTimeoutFailure<T>(message: string): PostgrestResponse<T> {
  return {
    data: null, // Data is null on failure
    error: createTimeoutError(message),
    count: null,
    status: 408,
    statusText: 'Request Timeout',
    success: false, // Literal false
  } as PostgrestResponse<T>; // Cast to ensure all properties are there
}

export function createTimeoutSingleFailure<T>(message: string): PostgrestSingleResponse<T> {
  return {
    data: null, // Data is null on failure
    error: createTimeoutError(message),
    count: null,
    status: 408,
    statusText: 'Request Timeout',
    success: false, // Literal false
  } as PostgrestSingleResponse<T>; // Explicitly typed as PostgrestSingleResponse
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
        resolve(value) // 'value' is already PostgrestResponse<any>
      }, () => {
        if (timer) clearTimeout(timer)
        resolve(fallback)
      })
  })
}

