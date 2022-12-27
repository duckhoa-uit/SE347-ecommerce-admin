import { yupResolver } from '@hookform/resolvers/yup'
import DeleteIcon from '@mui/icons-material/Delete'
import ReportProblemIcon from '@mui/icons-material/ReportProblem'
import { Avatar, Box, Button, InputAdornment, Typography } from '@mui/material'
import { CustomSelectField, CustomTextField } from 'components/form-controls'
import { ConfirmDialog } from 'components/product/confirm-dialog'
import { ORDER_STATUS } from 'constants/enums/order-status'
import { regexVietnamesePhoneNumber } from 'constants/regexes'
import { EditOrderFormValues, Order } from 'models'
import React, { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import * as yup from 'yup'
export interface EditOrderFormProps {
  order?: Order
  onSave: (payload: Partial<Order>) => void
  onDelete: () => void
  onCancel: () => void
}

const schema = yup.object().shape({
  customerName: yup.string().max(255).required(),
  street: yup.string().max(255).required(),
  ward: yup.string().max(255).required(),
  district: yup.string().max(255).required(),
  province: yup.string().max(255).required(),
  notes: yup.string().max(255),
  // TODO: validate phone
  phone: yup
    .string()
    .max(255)
    .required()
    .test('is-vietnamese-phonenumber', 'Incorrect phone number format.', number => {
      if (!number) return true

      return regexVietnamesePhoneNumber.test(number)
    }),
  email: yup.string().email().max(255).nullable().required(),
  amount: yup.number().integer().required().nullable().typeError('you must specify a number'),
  status: yup.string().max(255).required()
})

export function EditOrderForm({ order, onSave, onCancel, onDelete }: EditOrderFormProps) {
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)

  const defaultValues = {
    customerName: order?.deliveryInfo.name,
    street: order?.deliveryInfo.address.street,
    ward: order?.deliveryInfo.address.ward,
    district: order?.deliveryInfo.address.district,
    province: order?.deliveryInfo.address.province,
    notes: order?.notes,
    phone: order?.deliveryInfo.phone,
    email: order?.deliveryInfo.email,
    amount: order?.amount,
    status: order?.status
  }

  const formMethods = useForm<EditOrderFormValues>({
    defaultValues,
    resolver: yupResolver(schema)
  })

  const {
    control,
    formState: { isSubmitting, errors },
    handleSubmit
  } = formMethods

  const handleSave = async (values: EditOrderFormValues) => {
    console.log(values)
    if (onSave) {
      const payload = {
        deliveryInfo: values.deliveryInfo,
        notes: values.notes,
        amount: values.amount,
        status: values.status
      }
      await onSave(payload)
    }
  }

  const toggleConfirmDialog = () => {
    setOpenConfirmDialog(!openConfirmDialog)
  }

  return (
    <Box>
      <Box
        sx={{
          px: 3,
          py: 2.5,
          mb: 3,
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'background.default'
        }}
      >
        <Typography variant="h6" sx={{ color: 'gray', fontSize: 13, mr: 2 }}>
          ORDER
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={handleSubmit(handleSave)}>
            Save changes
          </Button>
          <Button variant="outlined" onClick={onCancel}>
            Cancel
          </Button>
        </Box>
      </Box>
      <Typography variant="h6" gutterBottom>
        Detail
      </Typography>
      <FormProvider {...formMethods}>
        <form>
          <CustomTextField disabled={isSubmitting} name="customerName" label="Customer Name" />
          <CustomTextField disabled={isSubmitting} name="street" label="Street" />
          <CustomTextField disabled={isSubmitting} name="ward" label="Ward" />
          <CustomTextField disabled={isSubmitting} name="district" label="District" />
          <CustomTextField disabled={isSubmitting} name="province" label="Province" />
          <CustomTextField disabled={isSubmitting} name="notes" label="Notes" />
          <CustomTextField disabled={isSubmitting} name="phone" label="Phone" />
          <CustomTextField disabled={isSubmitting} name="email" label="Email" />
          <CustomTextField
            disabled={isSubmitting}
            name="amount"
            label="Amount"
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>
            }}
          />
          <CustomSelectField
            name="status"
            label="Status"
            disabled={isSubmitting}
            options={Object.values(ORDER_STATUS).map(item => ({
              label: item,
              value: item
            }))}
          />
        </form>
      </FormProvider>
      <Button variant="text" startIcon={<DeleteIcon />} color="error" onClick={toggleConfirmDialog}>
        Delete Order
      </Button>

      <ConfirmDialog
        icon={
          <Avatar sx={{ bgcolor: 'rgba(209, 67, 67, 0.08)', color: 'rgb(209, 67, 67)' }}>
            <ReportProblemIcon />
          </Avatar>
        }
        isOpen={openConfirmDialog}
        title="Are you sure?"
        body="Are you sure to delete this order?"
        onSubmit={onDelete}
        onClose={toggleConfirmDialog}
      />
    </Box>
  )
}
