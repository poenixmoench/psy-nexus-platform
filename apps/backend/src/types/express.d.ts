import { Request } from 'express'

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number
        email: string
        role: 'user' | 'developer' | 'admin'
      }
    }
  }
}

export interface UserPayload {
  id: number
  email: string
  role: 'user' | 'developer' | 'admin'
}

declare module 'express' {
  interface Request {
    user?: UserPayload
  }
}
