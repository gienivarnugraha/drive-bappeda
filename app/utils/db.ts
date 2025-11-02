import { SqlDatabase } from 'langchain/sql_db'
import { DataSource, type DataSourceOptions } from 'typeorm'

import type { Category, Division, Document } from '~/types'
import { inspect } from 'node:util'
import supabase from '~/utils/supabase'

export const postgresConnectionOptions = {
  type: 'postgres',
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DB
}

export const connection = async (): Promise<DataSource> => {
  try {
    const connect = new DataSource(postgresConnectionOptions as DataSourceOptions)

    await connect.initialize()
    console.warn('✅ Database connected successfully')

    return connect
  } catch (error) {
    console.warn('❌ Database cannot connected')
    throw new Error('Failed to connect to database')
  }
}

export async function getLangchainDB() {
  try {
    const connect = await connection()
    const db = await SqlDatabase.fromDataSourceParams({
      appDataSource: connect
    })

    return db
  } catch (error) {
    console.error('db langchain connection error', error)
    throw new Error('Langchain failed to connect to database')
  }
}

export const modifyRelation = async (data: { document: Document, categories: number[], divisions: number[] }, action: 'edit' | 'delete') => {
  const { document, categories, divisions } = data

  let request

  if (action === 'delete') {
    request = supabase.from('categories_documents_divisions').delete().eq('document_id', document.id).select()
  } else {
    const relationData = []

    for (const categoryId of categories) {
      for (const divisionId of divisions) {
        relationData.push({
          document_id: document.id,
          category_id: categoryId,
          division_id: divisionId
        })
      }
    }

    request = supabase.from('categories_documents_divisions').insert(relationData).select()
  }

  const { data: result, error } = await request

  if (error) {
    console.error(`error ${action} relation: ${inspect(error, true, null, true)}`)

    throw createError({
      statusCode: 400,
      statusMessage: `Error ${action} relation:  ${error}`
    })
  }

  return result
}
