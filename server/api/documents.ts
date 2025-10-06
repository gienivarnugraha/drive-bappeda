export default eventHandler(async (event) => {
    const query = getQuery(event)
    const { category, search } = query

    console.log(category, search)
    /* 
        const options = {
            limit: 10,
            offset: 0,
            sortBy: { column: 'name', order: 'asc' },
        }
    
        if (search) {
            Object.assign(options, { search })
        } */

    const { data, error } = await supabase
        .from('documents')
        .select()


    console.log(data, error)

    if (error) return false

    return data
})