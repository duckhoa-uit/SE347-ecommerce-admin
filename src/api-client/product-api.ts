import { transformObjToFormData } from 'utils'
import { ListParams, ResponseListData, Product, ProductPayload, ResponseData, ProductPayloadWithoutImages } from './../models'
import axiosClient from './axios-client'

export const productApi = {
   getList(payload: ListParams): Promise<ResponseListData<Product>> {
      return axiosClient.get('products', { params: payload })
   },
   getById(id: string): Promise<ResponseData<Product>> {
      return axiosClient.get(`products/${id}`)
   },
   update(productId: string, payload: Partial<ProductPayload>): Promise<ResponseData<Product>> {
      return axiosClient.put(`products/${productId}`, payload)
   },
   add(product: ProductPayload): Promise<ResponseData<Product>> {
      // const payload = ProductPayloadWithoutImages(product)
      const formData = transformObjToFormData(product)
      product.images.forEach(file => formData.append('images', file))

      return axiosClient.post(`products`, formData, {
         headers: {
            "Content-Type": "multipart/form-data"
         }
      })
   },
   delete(id: string): Promise<ResponseData<string>> {
      return axiosClient.delete(`products/${id}`)
   }
}
