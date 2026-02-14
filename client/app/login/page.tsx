"use client";

import { signInWithGoogle } from './actions'
import { LogIn } from 'lucide-react'
import { Map } from '@/components/ui/map'
import Image from 'next/image'

export default function LoginPage() {
    return (
        <div className="relative min-h-screen flex items-center justify-center font-sans overflow-hidden bg-white px-4">
            {/* Map Background */}
            <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
                <Map
                    center={[126.224842, 6.952465]}
                    zoom={12}
                    theme="light"
                    styles={{
                        light: "https://tiles.openfreemap.org/styles/bright"
                    }}
                />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-white/60 backdrop-blur-xl rounded-3xl p-10 shadow-[0_8px_32px_0_rgba(22,101,52,0.1)] border border-white/40 animate-in fade-in zoom-in duration-500">
                    <div className="text-center space-y-3 mb-10">
                        <div className="flex justify-center mb-6">
                            <Image
                                src="/StayKoSquareLogo.png"
                                alt="StayKo Logo"
                                width={150}
                                height={150}
                                className="rounded-3xl shadow-lg"
                                priority
                            />
                        </div>
                        <p className="text-gray-600 font-medium">
                            Premium Stays, Seamlessly Handled.
                        </p>
                    </div>

                    <form action={signInWithGoogle} className="space-y-4">
                        <button
                            type="submit"
                            className="group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-6 py-4 text-sm font-bold text-gray-800 shadow-md ring-1 ring-gray-200 hover:bg-gray-50 hover:shadow-lg transition-all active:scale-[0.98] duration-200"
                        >
                            <svg className="h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Continue with Google
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-[240px] mx-auto">
                            By continuing, you agree to our <br />
                            <span className="text-green-700 cursor-pointer hover:underline">Terms</span> & <span className="text-green-700 cursor-pointer hover:underline">Privacy Policy</span>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
