import type { Division } from '#shared/types'
import { inspect } from 'node:util'
import { useDrizzle, tables } from '#imports'
import { toKebabCase } from '#shared/utils'

type EditSchema = {
  shouldDelete: boolean
} & Division

export default eventHandler(async (event) => {
  const { shouldDelete, ...payload } = await readBody<EditSchema>(event)

  let request

  const db = useDrizzle()

  if (shouldDelete) {
    request = db
      .delete(tables.divisions)
      .where(eq(tables.divisions.id, payload.id))
      .returning()

  } else {
    request = db
      .update(tables.divisions)
      .set({ name: toKebabCase(payload.name), metadata: { ...payload } })
      .where(eq(tables.divisions.id, payload.id))
      .returning()
  }

  try {
    const response = await request

    return { message: `Success ${shouldDelete ? 'Delete' : 'Update'} division: ${payload.name}`, response }

  } catch (error: any) {
    console.error(`error ${shouldDelete ? 'Delete' : 'Update'} division: ${inspect(error, true, null, true)}`)

    throw createError({
      statusCode: 400,
      message: `Error ${shouldDelete ? 'Delete' : 'Update'} division:  ${error.message}`
    })

  }

})
