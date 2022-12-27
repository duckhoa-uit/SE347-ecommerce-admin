import { yupResolver } from '@hookform/resolvers/yup'
import { LoadingButton } from '@mui/lab'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputAdornment
} from '@mui/material'
import FileUpload from 'components/file-upload/file-upload'
import { CustomSelectField, CustomTextField } from 'components/form-controls'
import { Category, Product, ProductPayload } from 'models'
import { Media } from 'models/media'
import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import useSWR from 'swr'
import * as yup from 'yup'

export interface ProductAddEditModalProps {
  isOpen: boolean
  isEdit: boolean
  data?: Product
  onClose: () => void
  onSubmit: (product: ProductPayload) => Promise<void>
}

const transformImage = (file: Media | File) => {
  if ('url' in file) {
    return {
      ...file,
      name: file.original_filename,
      size: file.bytes
    }
  }

  return {
    ...file,
    url: URL.createObjectURL(file)
  }
}
const schema = yup.object({
  title: yup.string().max(255).required(),
  desc: yup.string().max(255).required(),
  categories: yup.array(yup.string().max(255)).min(1),
  price: yup.number().integer().min(0).nullable().required(),
  quantity: yup.number().integer().min(0).nullable().required(),
  images: yup.array().min(1)
  // .transform((value, originValue, context) => {
  //   return value.map((file: any) => transformImage(file))
  // })
})

export function ProductAddEditModal({
  isOpen,
  isEdit,
  data,
  onClose,
  onSubmit
}: ProductAddEditModalProps) {
  const { data: options = [] } = useSWR('categories', {
    dedupingInterval: 60 * 60 * 1000, // 1hr
    revalidateOnFocus: false,
    revalidateOnMount: true
  })

  const formMethods = useForm<ProductPayload>({
    defaultValues: {
      title: '',
      desc: '',
      categories: [],
      price: null,
      quantity: null,
      images: []
    },
    resolver: yupResolver(schema)
  })
  const {
    reset,
    control,
    formState: { isSubmitting }
  } = formMethods

  const handleSaveProduct = async (values: ProductPayload) => {
    if (onSubmit) await onSubmit(values)
  }

  useEffect(() => {
    console.log(data)
    if (isEdit) {
      reset({
        title: data?.title || '',
        desc: data?.desc || '',
        categories: data?.categories || [],
        price: data?.price,
        quantity: data?.quantity,
        images: data?.images ? data.images.map(file => transformImage(file)) : []
      })
    } else {
      reset({
        title: '',
        desc: '',
        categories: [],
        price: null,
        quantity: null,
        images: []
      })
    }
  }, [data, reset, isEdit])

  const handleClose = (_: {}, reason: 'backdropClick' | 'escapeKeyDown') => {
    if (reason === 'backdropClick') return

    onClose()
    reset()
  }

  return (
    <Dialog open={isOpen} onClose={handleClose} scroll="body">
      <DialogTitle>Product</DialogTitle>
      <DialogContent>
        <FormProvider {...formMethods}>
          <form>
            <CustomTextField disabled={isSubmitting} name="title" label="Product Title" />
            <CustomTextField
              disabled={isSubmitting}
              name="desc"
              label="Description"
              multiline={true}
              rows={4}
            />
            <CustomSelectField
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
                <CustomTextField name="quantity" label="Quantity" />
              </Grid>
              <Grid item xs={12}>
                <FileUpload name="images" accept="image/*" label="Product Image(s)" multiple />
              </Grid>
            </Grid>
          </form>
        </FormProvider>
      </DialogContent>
      <DialogActions>
        <Button disabled={isSubmitting} onClick={onClose}>
          Cancel
        </Button>
        <LoadingButton
          loading={isSubmitting}
          type="submit"
          variant="contained"
          onClick={formMethods.handleSubmit(handleSaveProduct)}
        >
          Save
        </LoadingButton>
      </DialogActions>
    </Dialog>
  )
}
