'use client'

import { ReactNode } from 'react'
import { FormProvider as RHFFormProvider, UseFormReturn } from 'react-hook-form'

interface FormProviderProps {
  children: ReactNode
  methods: UseFormReturn<any>
  onSubmit: (data: any) => void | Promise<void>
}

export default function FormProvider({
  children,
  methods,
  onSubmit,
}: FormProviderProps) {
  return (
    <RHFFormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        {children}
      </form>
    </RHFFormProvider>
  )
}
