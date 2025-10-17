export default eventHandler(async (event) => {
    const { data, error } = await supabase
        .from('categories')
        .select()


    if (error) return false

    return data
})