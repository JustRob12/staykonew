import Image from 'next/image'

export const metadata = {
    title: 'Under Maintenance — StayKo',
    description: 'We are currently performing scheduled maintenance. We\'ll be back shortly!',
}

export default function MaintenancePage() {
    return (
        <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-emerald-50 px-4 overflow-hidden font-sans">

            {/* Decorative blobs */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-green-200/30 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center text-center max-w-lg w-full">

                {/* Logo */}
                <div className="mb-8 animate-[fadeIn_0.6s_ease_both]">
                    <Image
                        src="/StayKoSquareLogo.png"
                        alt="StayKo Logo"
                        width={110}
                        height={110}
                        className="rounded-3xl shadow-xl"
                        priority
                    />
                </div>


                {/* Heading */}
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
                    We&apos;ll be right back!
                </h1>

                <p className="text-gray-500 text-base sm:text-lg leading-relaxed mb-8 max-w-sm">
                    StayKo is currently undergoing scheduled maintenance to bring you an even better experience.
                    <br className="hidden sm:block" />
                    <span className="font-semibold text-green-700"> Hang tight — we&apos;ll be back shortly!</span>
                </p>

                {/* Status pill */}
                <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                    </span>
                    Maintenance in progress
                </div>

                {/* Footer */}
                <p className="mt-12 text-xs text-gray-400">
                    &copy; {new Date().getFullYear()} StayKo &mdash; Premium Stays, Seamlessly Handled.
                </p>
            </div>
        </div>
    )
}
