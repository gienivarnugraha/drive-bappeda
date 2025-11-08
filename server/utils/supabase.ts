import 'dotenv/config'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = globalThis.process?.env?.SUPABASE_URL || process.env.SUPABASE_URL as string
const supabaseKey = globalThis.process?.env?.SUPABASE_KEY || process.env.SUPABASE_KEY as string
const supabase = createClient(supabaseUrl, supabaseKey) as SupabaseClient

export default supabase
