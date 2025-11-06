import storageDriver from './storage'
import supabase from '~/utils/supabase'

export default defineNitroPlugin(async () => {
  const storage = useStorage()

  console.log('storage mounted')

  const { data, error } = await supabase.from('categories').select()

  if (error) {
    console.log('supabase error', error)
  }

  console.log('supabase', data)

  storage.mount('supabase-storage', storageDriver({
    bucketName: 'documents'
  }))
})