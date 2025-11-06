import type { Session } from '@supabase/supabase-js'
import type { User } from '~/types'
import supabase from '~/utils/supabase'


export default eventHandler(async (event) => {

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) console.error('Session refresh error:', error)
      return data
    } catch (e) {
      console.error('An unexpected error occurred during session refresh:', e)
      return null
    }
  }

  const getUuid = async () => {
    let session: Session | null = null

    console.log('localstorage session not found, fetching session from supabase auth')

    const { data: getSession, error: getSessionError } = await supabase.auth.getSession()

    if (getSession) {
      session = getSession.session
    }

    if (getSessionError) {
      console.log('supabase session error, refreshing session: ', getSessionError)

      const refreshData = await refreshSession()

      if (refreshData) {
        session = refreshData.session
      }

    }

    return session?.user.id || null
  }

  try {
    const uuid = await getUuid()

    console.log('uuid found: ', uuid)

    if (uuid) {

      const { data, error } = await supabase
        .from('profiles')
        .select(`id, name, avatar, uuid`)
        .eq('uuid', uuid)
        .single()

      if (error && error.code !== '406') {
        throw error
      }

      return data as User

    }
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }

})
