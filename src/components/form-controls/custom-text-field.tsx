import { InputProps, TextField, TextFieldProps } from '@mui/material'
import React, { InputHTMLAttributes } from 'react'
import { Control, useController } from 'react-hook-form'

export type CustomTextFieldProps = {
   name: string
   control: Control<any>
   label?: string
   disabled?: boolean
   multiline?: boolean
   rows?: number | string | undefined
   inputProps?: InputHTMLAttributes<HTMLInputElement>
} & TextFieldProps

export function CustomTextField({
   name,
   control,
   label,
   disabled = false,
   multiline = false,
   rows,
   inputProps,
   InputProps,
   ...restProps
}: CustomTextFieldProps) {
   const {
      field: { value, onChange, onBlur, ref },
      fieldState: { error }
   } = useController({
      name,
      control
   })

   return (
      <TextField
         fullWidth
         variant="outlined"
         margin="normal"
         value={value}
         onChange={onChange}
         onBlur={onBlur}
         label={label}
         inputRef={ref}
         error={!!error}
         helperText={error?.message}
         disabled={disabled}
         multiline={multiline}
         rows={rows}
         inputProps={inputProps}
         InputProps={InputProps}
         {...restProps}
      />
   )
}
