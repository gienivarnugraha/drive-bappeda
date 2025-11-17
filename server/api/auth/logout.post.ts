

export default defineEventHandler(async (event) => {
    // Clear the current user session

    return setResponseStatus(event, 201)
})
