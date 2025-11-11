import { serverSupabaseUser } from '#supabase/server'

export default eventHandler(async (event) => {
    return await serverSupabaseUser(event)
})
