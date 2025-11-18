import type { Division } from '#shared/types'
import { inspect } from 'node:util'
import { useDrizzle, tables } from '~~/server/utils/drizzle'
import { toSnakeCase, toTitleCase } from '#shared/utils'

export default eventHandler(async (event) => {
  const { name, metadata } = await readBody<Division>(event)

  const db = useDrizzle(event)

  let request = db
    .insert(tables.divisions)
    .values({ name: toSnakeCase(name), metadata: { display_name: toTitleCase(name), ...metadata } })
    .onConflictDoNothing()
    .returning()

  try {
    const response = await request

    return { message: `Success add division: ${name}`, data: response[0] }

  } catch (error: any) {
    console.error(`error add division: ${inspect(error, true, null, true)}`)

    throw createError({
      statusCode: 400,
      message: `Error add division:  ${error.message}`
    })

  }

})
