export default eventHandler(async (event) => {
    const { data, error } = await supabase
        .from('divisions')
        .select()

    if (error) return false

    return data
})