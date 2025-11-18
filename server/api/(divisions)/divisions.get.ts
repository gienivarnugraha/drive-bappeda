import { useDrizzle, tables } from '~~/server/utils/drizzle'

export default eventHandler(async (event) => {
  const db = useDrizzle()

  try {
    const response = await db.select().from(tables.divisions)

    return response
  } catch (error: any) {
    if (error) {
      console.error('error fetching divisions', error)

      throw createError({
        statusCode: 400,
        message: `Error fetching divisions:  ${error.message}`
      })
    }

  }
})
