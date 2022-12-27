import { makeKeyRemover } from "./common"
import { Media } from "./media"

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
   images: Media[]
}
export interface ProductPayload {
   _id: string
   title?: string
   desc?: string
   img?: string
   categories?: string[]
   price: number | null
   quantity: number | null
   images: Array<File | Media>
}

export interface ProductQueryParams extends Record<keyof Product, string> {
   orderBy?: string
   search?: string
}
export const ProductPayloadWithoutImages = makeKeyRemover(['images'])