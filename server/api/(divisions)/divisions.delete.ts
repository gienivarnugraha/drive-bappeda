import type { Division } from '#shared/types'
import { inspect } from 'node:util'
import { useDrizzle, tables } from '~~/server/utils/drizzle'

export default eventHandler(async (event) => {
  const payload = await readBody<Pick<Division, 'id'>>(event)

  const db = useDrizzle()

  let request = db
    .delete(tables.divisions)
    .where(eq(tables.divisions.id, payload.id))
    .returning()

  try {
    const response = await request

    return { message: `Success Delete division: ${response[0].name}`, data: response[0] }

  } catch (error: any) {
    console.error(`error Delete division: ${inspect(error, true, null, true)}`)

    throw createError({
      statusCode: 400,
      message: `Error Delete division:  ${error.message}`
    })

  }

})
