import { SqlDatabase } from 'langchain/sql_db'
import { DataSource, type DataSourceOptions } from 'typeorm'

import type { Documents } from '#shared/types'
import { inspect } from 'node:util'
import { useDrizzle, tables } from '~~/server/utils/drizzle'
import { H3Event } from 'h3';

// export const postgresConnectionOptions = {
//   type: 'postgres',
//   host: process.env.PG_HOST,
//   port: process.env.PG_PORT,
//   user: process.env.PG_USER,
//   password: process.env.PG_PASSWORD,
//   database: process.env.PG_DB
// }

// export const connection = async (): Promise<DataSource> => {
//   try {
//     const connect = new DataSource(postgresConnectionOptions as DataSourceOptions)

//     await connect.initialize()
//     console.warn('✅ Database connected successfully')

//     return connect
//   } catch (error) {
//     console.warn('❌ Database cannot connected')
//     throw new Error('Failed to connect to database')
//   }
// }

// export async function getLangchainDB() {
//   try {
//     const connect = await connection()
//     const db = await SqlDatabase.fromDataSourceParams({
//       appDataSource: connect
//     })

//     return db
//   } catch (error) {
//     console.error('db langchain connection error', error)
//     throw new Error('Langchain failed to connect to database')
//   }
// }

export const modifyRelation = async (event: H3Event, data: { documentId: Documents['id'], categoryIds?: number[], divisionIds?: number[] }, action: 'edit' | 'delete') => {

  const { documentId, categoryIds, divisionIds } = data

  const db = useDrizzle(event)

  let request

  if (action === 'delete') {
    request = db.delete(tables.categoriesDocumentsDivisions).where(eq(tables.categoriesDocumentsDivisions.documentId, documentId))
  } else {
    const relationData = []

    for (const categoryId of categoryIds as number[]) {
      for (const divisionId of divisionIds as number[]) {
        relationData.push({
          documentId,
          categoryId,
          divisionId
        })
      }
    }

    request = db.insert(tables.categoriesDocumentsDivisions).values(relationData)

  }

  try {
    const response = await request

    return response

  } catch (error) {
    console.error(`error ${action} relation: ${inspect(error, true, null, true)}`)

    throw createError({
      statusCode: 400,
      message: `Error ${action} relation:  ${error}`
    })
  }

}
