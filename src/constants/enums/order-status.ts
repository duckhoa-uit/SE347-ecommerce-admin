import { ObjectValues } from './../../models/common';
export type OrderStatus = ObjectValues<typeof ORDER_STATUS>
export const ORDER_STATUS = {
   PENDING: 'PENDING',
   PROCESSING: 'PROCESSING',
   DELIVERED: 'DELIVERIED',
   REFUNDED: 'REFUNDED',
   CANCELED: 'CANCELED',
} as const