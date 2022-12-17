import {
   Box,
   Button,
   Chip,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   Grid,
   InputAdornment
} from '@mui/material'
import React, { ReactNode, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Category, Product, ProductPayload } from 'models'
import { CustomSelectField, CustomTextField } from 'components/form-controls'
import { LoadingButton } from '@mui/lab'
import useSWR from 'swr'
import FileUpload from 'components/file-upload/file-upload'

export interface ProductAddEditModalProps {
   isOpen: boolean
   isEdit: boolean
   data?: Product
   onClose: () => void
   onSubmit: (product: ProductPayload) => Promise<void>
}

const schema = yup.object({
   title: yup.string().max(255).required(),
   desc: yup.string().max(255).required(),
   categories: yup.array(yup.string().max(255)),
   price: yup.number().integer().min(0).nullable().required(),
   quantity: yup.number().integer().min(0).nullable().required()
})

export function ProductAddEditModal({
   isOpen,
   isEdit,
   data,
   onClose,
   onSubmit
}: ProductAddEditModalProps) {
   const [files, setFiles] = useState<File[]>([])
   const { data: options = [] } = useSWR('categories', {
      dedupingInterval: 60 * 60 * 1000, // 1hr
      revalidateOnFocus: false,
      revalidateOnMount: true
   })

   const form = useForm<ProductPayload>({
      defaultValues: {
         title: '',
         desc: '',
         categories: [],
         price: null,
         quantity: null
      },
      resolver: yupResolver(schema)
   })
   const {
      reset,
      control,
      formState: { isSubmitting }
   } = form

   const handleSaveProduct = async (values: ProductPayload) => {
      if (onSubmit) await onSubmit({ ...values, images: files })
   }

   useEffect(() => {
      console.log(data)
      if (isEdit) {
         reset({
            title: data?.title || '',
            desc: data?.desc || '',
            categories: data?.categories || [],
            price: data?.price,
            quantity: data?.quantity
         })
      } else {
         reset({
            title: '',
            desc: '',
            categories: [],
            price: null,
            quantity: null
         })
      }
   }, [data, reset, isEdit])

   const handleClose = (_: {}, reason: 'backdropClick' | 'escapeKeyDown') => {
      if (reason === 'backdropClick') return

      onClose()
      reset()
   }

   const updateUploadedFiles = (files: File[]) => setFiles(files)

   return (
      <Dialog
         open={isOpen}
         onClose={handleClose}
         scroll="body"
         maxWidth="lg"
         sx={{ width: '100%' }}
      >
         <DialogTitle>Product</DialogTitle>
         <DialogContent>
            <form>
               <CustomTextField
                  disabled={isSubmitting}
                  control={control}
                  name="title"
                  label="Product Title"
               />
               <CustomTextField
                  disabled={isSubmitting}
                  control={control}
                  name="desc"
                  label="Description"
                  multiline={true}
                  rows={4}
               />
               <CustomSelectField
                  control={control}
                  name="categories"
                  label="Categories"
                  multiple={true}
                  disabled={isSubmitting}
                  options={
                     options
                        ? options.map((item: Category) => ({
                             value: item.name,
                             label: item.name
                          }))
                        : []
                  }
               />
               <Grid container spacing={2}>
                  <Grid item xs={6}>
                     <CustomTextField
                        control={control}
                        name="price"
                        label="Price"
                        InputProps={{
                           startAdornment: <InputAdornment position="start">$</InputAdornment>
                        }}
                        type="number"
                        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                     />
                  </Grid>
                  <Grid item xs={6}>
                     <CustomTextField control={control} name="quantity" label="Quantity" />
                  </Grid>
               </Grid>
            </form>

            <FileUpload
               accept="image/*"
               label="Product Image(s)"
               multiple
               updateFilesCb={updateUploadedFiles}
            />
         </DialogContent>
         <DialogActions>
            <Button disabled={isSubmitting} onClick={onClose}>
               Cancel
            </Button>
            <LoadingButton
               loading={isSubmitting}
               type="submit"
               variant="contained"
               onClick={form.handleSubmit(handleSaveProduct)}
            >
               Save
            </LoadingButton>
         </DialogActions>
      </Dialog>
   )
}
