import Link from 'next/link'
import { ArrowRight, Plane, Shield, Sun } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f0fdf4] font-sans">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-green-100">
        <div className="text-2xl font-black text-green-600 tracking-tighter">StayKo</div>
        <Link
          href="/login"
          className="bg-green-600 text-white px-5 py-2.5 rounded-full font-semibold hover:bg-green-700 transition-all shadow-md hover:shadow-lg text-sm"
        >
          Sign In
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="px-6 pt-20 pb-32 text-center max-w-4xl mx-auto">
          <div className="inline-block px-4 py-1.5 mb-6 text-sm font-bold text-green-700 bg-green-100 rounded-full animate-bounce">
            Launching Soon 🚀
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-8 tracking-tight">
            Your Premium Stay, <br />
            <span className="text-green-600">Perfectly Handled.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            StayKo offers a seamless experience for your modern lifestyle. Log in once and manage everything from your dashboard.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-green-700 transition-all shadow-xl hover:translate-y-[-2px]"
            >
              Get Started Now <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-24 bg-white border-y border-green-50">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6 border border-green-100 shadow-sm">
                <Sun className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Seamless Stays</h3>
              <p className="text-gray-600 leading-relaxed">Expertly curated accommodations for the discerning traveler.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6 border border-green-100 shadow-sm">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Access</h3>
              <p className="text-gray-600 leading-relaxed">Top-tier security for your data and your physical peace of mind.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-16 w-16 bg-green-50 rounded-2xl flex items-center justify-center mb-6 border border-green-100 shadow-sm">
                <Plane className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Global Reach</h3>
              <p className="text-gray-600 leading-relaxed">Wherever life takes you, StayKo ensures you stay comfortable.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 text-center text-gray-500 text-sm border-t border-green-50 bg-white">
        &copy; {new Date().getFullYear()} StayKo. All rights reserved.
      </footer>
    </div>
  )
}
