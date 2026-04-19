'use client'

import { ReactNode } from 'react'
import { useFormContext, Controller, FieldPath, FieldValues } from 'react-hook-form'

interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName
  label?: string
  children: (props: any) => ReactNode
  error?: string
}

export default function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ name, label, children, error }: FormFieldProps<TFieldValues, TName>) {
  const { control, formState: { errors } } = useFormContext()
  const fieldError = (errors[name] as any)?.message

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className="mb-4">
          {label && (
            <label 
              htmlFor={String(name)} 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {label}
            </label>
          )}
          {children(field)}
          {fieldError && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {String(fieldError)}
            </p>
          )}
        </div>
      )}
    />
  )
}
