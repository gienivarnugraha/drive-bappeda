import type { UserSession } from "#shared/types"

// file: ~/next-auth.d.ts
import type { DefaultSession } from 'next-auth'

declare module 'auth' {
    /* Returned by `useAuth`, `getSession` and `getServerSession` */
    interface Session extends DefaultSession {
        user: UserSession
    }
}

// file: ~/next-auth.d.ts
declare module 'auth/jwt' {
    /** Returned by the `jwt` callback and `getToken` */
    interface JWT {
        sessionToken?: string
    }
}