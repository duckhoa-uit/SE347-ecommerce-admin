import type { NextApiRequest, NextApiResponse } from 'next'
import httpProxy, { ProxyResCallback } from 'http-proxy'
import { ResponseData, User } from '../../../models'
import Cookies from 'cookies'

type LoginData = {
   accessToken: string
   user: User
}

const proxy = httpProxy.createProxyServer()
export const config = {
   api: {
      bodyParser: false,
   },
}
export default function handler(
   req: NextApiRequest,
   res: NextApiResponse<ResponseData<LoginData | null>>,
) {
   if (req.method !== 'POST') {
      return res.status(404).json({
         data: null,
         errorCode: 0,
         message: 'Method is not supported',
      })
   }

   return new Promise(resolve => {
      //don't send cookies to API Server
      req.headers.cookie = ''

      const handleLoginRes: ProxyResCallback = (proxyRes, req, res) => {
         let body = ''
         proxyRes.on('data', function (chunk) {
            body += chunk
         })
         proxyRes.on('end', function () {
            try {
               const parsedBody = JSON.parse(body)
               const {
                  data,
                  errorCode
               } = parsedBody
               if (errorCode !== 0) {
                  ; (res as NextApiResponse).status(200).json(parsedBody)
                  resolve(true)
               }

               const { accessToken } = data

               //set cookies
               const cookies = new Cookies(req, res, {
                  secure: process.env.NODE_ENV !== 'development',
               })
               cookies.set('access_token', accessToken, {
                  httpOnly: true,
                  sameSite: 'lax',
               })
                  ; (res as NextApiResponse).status(200).json(parsedBody)
            } catch (error) {
               const parsedBody = JSON.parse(body)
                  ; (res as NextApiResponse).status(res.statusCode).json(parsedBody)
            }

            resolve(true)
         })
      }

      proxy.once('proxyRes', handleLoginRes)
      proxy.web(req, res, {
         target: process.env.API_URL,
         changeOrigin: true,
         selfHandleResponse: true,
      })
   })
}
