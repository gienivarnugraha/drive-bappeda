

export default defineEventHandler(async (event) => {
    // Clear the current user session
    await clearUserSession(event)


    return setResponseStatus(event, 201)
})
