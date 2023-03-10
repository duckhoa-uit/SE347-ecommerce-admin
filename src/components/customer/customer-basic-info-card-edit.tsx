import { yupResolver } from '@hookform/resolvers/yup'
import ReportProblemIcon from '@mui/icons-material/ReportProblem'
import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Skeleton,
  Typography
} from '@mui/material'
import { Box } from '@mui/system'
import axios, { AxiosResponse } from 'axios'
import { CustomSelectField, CustomTextField } from 'components/form-controls'
import { LoadingBackdrop } from 'components/loading'
import { ConfirmDialog } from 'components/product/confirm-dialog'
import { regexVietnamesePhoneNumber } from 'constants/regexes'
import { District, EditCustomerFormValues, Province, User } from 'models'
import Link from 'next/link'
import { MouseEvent, useEffect, useState } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import useSWR from 'swr'
import * as yup from 'yup'

export interface CustomerBasicInfoCardEditProps {
  customer?: User
  onSave: Function
  onDelete: Function
}

function fetcher<T>(url: string) {
  return axios.get<any, AxiosResponse<T>>(url).then((res: AxiosResponse<T>): T => {
    return res.data
  })
}
const schema = yup.object().shape({
  name: yup.string().max(255),
  phone: yup
    .string()
    .max(255)

    .test('is-vietnamese-phonenumber1', 'Incorrect phone number format.', number => {
      if (!number) return true

      return regexVietnamesePhoneNumber.test(number)
    }),
  email: yup.string().email().max(255).nullable(),
  deliveryInfo: yup.object().shape({
    name: yup.string().max(255),
    phone: yup
      .string()
      .max(255)

      .test('is-vietnamese-phonenumber2', 'Incorrect phone number format.', number => {
        if (!number) return true

        return regexVietnamesePhoneNumber.test(number)
      }),
    email: yup.string().email().max(255).nullable(),
    address: yup.object().shape({
      street: yup.string().max(255),
      ward: yup.string().max(255),
      district: yup.string().max(255),
      province: yup.string().max(255)
    })
  })
})
export function CustomerBasicInfoCardEdit({
  customer,
  onSave,
  onDelete
}: CustomerBasicInfoCardEditProps) {
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)
  const [loading, setLoading] = useState(false)

  const formMethods = useForm<EditCustomerFormValues>({
    defaultValues: {
      username: '',
      name: '',
      phone: '',
      email: '',
      deliveryInfo: {
        name: '',
        phone: '',
        email: '',
        address: {
          street: '',
          ward: '',
          district: '',
          province: ''
        }
      }
    },
    resolver: yupResolver(schema)
  })
  const {
    control,
    formState: { isSubmitting },
    handleSubmit,
    reset
  } = formMethods
  const watchProvince = useWatch({
    control,
    name: 'deliveryInfo.address.province'
  })
  const watchDistrict = useWatch({
    control,
    name: 'deliveryInfo.address.district'
  })

  const { data: provinceList } = useSWR<Province[]>(
    () => (customer ? 'https://provinces.open-api.vn/api/p' : null),
    fetcher,
    {
      revalidateOnFocus: false
    }
  )
  const { data: selectedProvince } = useSWR<Province>(
    () =>
      customer && watchProvince
        ? `https://provinces.open-api.vn/api/p/${watchProvince}?depth=2`
        : null,
    fetcher,
    {
      revalidateOnFocus: false
    }
  )
  const { data: selectedDistrict } = useSWR<District>(
    () =>
      customer && watchDistrict
        ? `https://provinces.open-api.vn/api/d/${watchDistrict}?depth=2`
        : null,
    fetcher,
    {
      revalidateOnFocus: false
    }
  )

  useEffect(() => {
    if (customer) {
      reset({
        username: customer.username,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        deliveryInfo: {
          name: customer.deliveryInfo.name,
          phone: customer.deliveryInfo.phone,
          email: customer.deliveryInfo.email,
          address: {
            street: customer.deliveryInfo.address.street,
            ward: customer.deliveryInfo.address.ward,
            district: customer.deliveryInfo.address.district,
            province: customer.deliveryInfo.address.province
          }
        }
      })
    }
  }, [customer, reset])

  const handleSave = async (values: EditCustomerFormValues) => {
    console.log(values)
    if (onSave) {
      const payload = { ...values }
      await onSave(payload)
    }
  }

  const handleDeleteClick = async (event: MouseEvent) => {
    setOpenConfirmDialog(false)
    setLoading(true)
    if (onDelete) await onDelete()
    setLoading(false)
  }

  function randomColor() {
    let backgroundColor = [
      '#ab000d',
      '#5c007a',
      '#00227b',
      '#00701a',
      '#8c9900',
      '#c68400',
      '#40241a',
      '#29434e'
    ]
    let random = Math.floor(Math.random() * backgroundColor.length)
    return backgroundColor[random]
  }

  return (
    <Card>
      <LoadingBackdrop open={loading} />

      <CardHeader title="Edit customer" />
      <Divider />
      <CardContent>
        <FormProvider {...formMethods}>
          <form onSubmit={handleSubmit(handleSave)}>
            <Typography variant="subtitle1">Account information</Typography>
            <Grid container columnSpacing={3} sx={{ mb: 2 }}>
              <Grid item md={9} xs={12}>
                <CustomTextField
                  disabled={isSubmitting || !customer}
                  name="name"
                  label="Full Name"
                />
              </Grid>
              <Grid item md={3} xs={12}>
                <CustomTextField disabled={true} name="username" label="Username" />
              </Grid>
              <Grid item md={6} xs={12}>
                <CustomTextField
                  disabled={isSubmitting || !customer}
                  type="number"
                  name="phone"
                  label="Phone Number"
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <CustomTextField disabled={isSubmitting || !customer} name="email" label="Email" />
              </Grid>
            </Grid>
            <Divider />
            <Typography sx={{ mt: 2 }} variant="subtitle1">
              Delivery information
            </Typography>
            <Grid container columnSpacing={3}>
              <Grid item md={12} xs={12}>
                <CustomTextField
                  disabled={isSubmitting || !customer}
                  name="deliveryInfo.name"
                  label="Recipient's Name"
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <CustomTextField
                  disabled={isSubmitting || !customer}
                  type="number"
                  name="deliveryInfo.phone"
                  label="Recipient's Phone Number"
                />
              </Grid>
              <Grid item md={6} xs={12}>
                <CustomTextField
                  disabled={isSubmitting || !customer}
                  name="deliveryInfo.email"
                  label="Recipient's Email"
                />
              </Grid>
            </Grid>
            <Typography sx={{ mt: 0 }} variant="subtitle2">
              {`Recipient's Address`}
            </Typography>
            {customer ? (
              <Grid container columnSpacing={3}>
                <Grid item md={12} xs={12}>
                  <CustomTextField
                    disabled={isSubmitting || !customer}
                    name="deliveryInfo.address.street"
                    label="Street"
                  />
                </Grid>
                <Grid item md={4} xs={12}>
                  <CustomSelectField
                    disabled={isSubmitting || !customer}
                    name="deliveryInfo.address.province"
                    label="Province"
                    options={
                      provinceList
                        ? provinceList.map(province => ({
                            label: province.name,
                            value: province.code.toString()
                          }))
                        : []
                    }
                  />
                </Grid>
                <Grid item md={4} xs={12}>
                  <CustomSelectField
                    disabled={isSubmitting || !customer}
                    name="deliveryInfo.address.district"
                    label="District"
                    options={
                      selectedProvince
                        ? selectedProvince.districts.map(district => ({
                            label: district.name,
                            value: district.code
                          }))
                        : []
                    }
                  />
                </Grid>
                <Grid item md={4} xs={12}>
                  <CustomSelectField
                    disabled={isSubmitting || !customer}
                    name="deliveryInfo.address.ward"
                    label="Ward"
                    options={
                      selectedDistrict
                        ? selectedDistrict.wards.map(ward => ({
                            label: ward.name,
                            value: ward.code
                          }))
                        : []
                    }
                  />
                </Grid>
              </Grid>
            ) : (
              <Skeleton variant="text" />
            )}
          </form>
        </FormProvider>
      </CardContent>
      {customer && (
        <CardActions sx={{ m: 2, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link href={`/customers/${customer._id}`} passHref legacyBehavior>
              <Button variant="outlined" disabled={isSubmitting}>
                Cancel
              </Button>
            </Link>
            <Button variant="contained" onClick={handleSubmit(handleSave)} disabled={isSubmitting}>
              Update
            </Button>
          </Box>
          <Button
            variant="text"
            color="error"
            disabled={isSubmitting}
            onClick={() => setOpenConfirmDialog(true)}
          >
            Delete customer
          </Button>
        </CardActions>
      )}

      <ConfirmDialog
        icon={
          <Avatar sx={{ bgcolor: 'rgba(209, 67, 67, 0.08)', color: 'rgb(209, 67, 67)' }}>
            <ReportProblemIcon />
          </Avatar>
        }
        isOpen={openConfirmDialog}
        title="Are you sure?"
        body="Are you sure to delete this customer?"
        onSubmit={handleDeleteClick}
        onClose={() => setOpenConfirmDialog(false)}
      />
    </Card>
  )
}
