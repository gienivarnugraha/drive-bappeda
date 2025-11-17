import type { User as UserDB } from "#shared/types"

declare module '#auth-utils' {
    interface User extends UserDB { }

    interface UserSession {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        extended?: any
        jwt?: {
            accessToken: string
            refreshToken: string
        }
        loggedInAt: number
    }

    interface SecureSessionData {
    }
}

export { }