import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from './utils/supabase/middleware'

export async function middleware(request: NextRequest) {
    const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true'
    const { pathname } = request.nextUrl

    if (isMaintenanceMode) {
        // Allow the maintenance page itself through (avoid infinite redirect)
        if (pathname === '/maintenance') {
            return NextResponse.next()
        }
        // Redirect everything else to /maintenance
        return NextResponse.redirect(new URL('/maintenance', request.url))
    }

    return await updateSession(request)
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
