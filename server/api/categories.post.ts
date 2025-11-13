import type { Category } from '#shared/types'
import { inspect } from 'node:util'
import { serverSupabaseClient } from '#supabase/server'
import { toKebabCase } from '#shared/utils'

type EditSchema = {
  shouldDelete: boolean
} & Category

export default eventHandler(async (event) => {
  const { shouldDelete, ...payload } = await readBody<EditSchema>(event)

  let request

  const supabase = await serverSupabaseClient(event)

  if (shouldDelete) {
    request = supabase
      .from('categories')
      .delete()
      .eq('id', payload.id)
      .single()
  } else {
    request = supabase
      .from('categories')
      .upsert({ name: toKebabCase(payload.name), metadata: { ...payload } }, { onConflict: 'name' })
      .single()
  }

  const { data, error } = await request

  if (error) {
    console.error(`error ${shouldDelete ? 'Delete' : 'Update'} category: ${inspect(error, true, null, true)}`)

    throw createError({
      statusCode: 400,
      statusMessage: `Error ${shouldDelete ? 'Delete' : 'Update'} category:  ${error}`
    })
  }

  return { message: `Success ${shouldDelete ? 'Delete' : 'Update'} category: ${payload.name}`, data }
})
