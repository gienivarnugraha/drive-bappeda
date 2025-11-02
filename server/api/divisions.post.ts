import { Division } from '~/types'
import { inspect } from 'node:util'
import supabase from '~/utils/supabase'

type EditSchema = {
  shouldDelete?: boolean
  id?: number
  name: string
  description: string
  icon: string
}

export default eventHandler(async (event) => {
  const { shouldDelete, ...payload } = await readBody<EditSchema>(event)

  let request

  if (shouldDelete) {
    request = supabase
      .from('divisions')
      .delete()
      .eq('id', payload.id)
  } else {
    request = supabase
      .from('divisions')
      .upsert(payload, { onConflict: 'name' })
      .select()
  }

  const { data, error } = await request

  if (error) {
    console.error(`error ${shouldDelete ? 'Delete' : 'Update'} division: ${inspect(error, true, null, true)}`)

    throw createError({
      statusCode: 400,
      statusMessage: `Error ${shouldDelete ? 'Delete' : 'Update'} division:  ${error}`
    })
  }

  return { message: `Success ${shouldDelete ? 'Delete' : 'Update'} division: ${payload.name}`, data: payload }
})
