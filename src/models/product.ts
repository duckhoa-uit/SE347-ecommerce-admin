import { makeKeyRemover } from "./common"

export interface Product {
   _id: string
   title?: string
   desc?: string
   img: string
   categories?: string[]
   size?: any
   color?: any
   price?: number
   quantity?: number
   countRating?: number
   rating?: number
   popular?: number
   inStock?: boolean
   deleted?: boolean
   createdAt: string
   updatedAt: string
}
export interface ProductPayload {
   _id: string
   title?: string
   desc?: string
   img?: string
   categories?: string[]
   price: number | null
   quantity: number | null
   images: File[]
}

export interface ProductQueryParams extends Record<keyof Product, string> {
   orderBy?: string
   search?: string
}
export const ProductPayloadWithoutImages = makeKeyRemover(['images'])