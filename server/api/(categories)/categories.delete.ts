import type { Category } from '#shared/types'
import { inspect } from 'node:util'
import { useDrizzle, tables } from '~~/server/utils/drizzle'

export default eventHandler(async (event) => {
  const payload = await readBody<Pick<Category, 'id'>>(event)

  const db = useDrizzle()

  let request = db
    .delete(tables.categories)
    .where(eq(tables.categories.id, payload.id))
    .returning()

  try {
    const response = await request

    return { message: `Success Delete category: ${response[0].name}`, data: response[0] }

  } catch (error: any) {
    console.error(`error Delete category: ${inspect(error, true, null, true)}`)

    throw createError({
      statusCode: 400,
      message: `Error Delete category:  ${error.message}`
    })

  }

})
