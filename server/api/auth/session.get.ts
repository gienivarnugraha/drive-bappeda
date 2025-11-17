import { jwtVerify } from 'jose'
import { getUserSession } from '~~/server/utils/jwt'

export default defineEventHandler(async (event) => {
    return await getUserSession(event)
})
