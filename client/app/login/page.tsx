import { signInWithGoogle } from './actions'
import { LogIn } from 'lucide-react'

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f0fdf4] px-4">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-white p-8 shadow-sm border border-green-100">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">StayKo</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Welcome back! Please sign in with your Google account.
                    </p>
                </div>

                <form action={signInWithGoogle} className="mt-8 space-y-6">
                    <button
                        type="submit"
                        className="group relative flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200"
                    >
                        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                            <LogIn className="h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                        </span>
                        Sign in with Google
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-gray-500">
                    By signing in, you agree to our Terms of Service and Privacy Policy.
                </div>
            </div>
        </div>
    )
}
