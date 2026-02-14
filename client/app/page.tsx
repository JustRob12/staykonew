"use client";

import Link from 'next/link'
import { ArrowRight, MapPin, Navigation, Phone, Shield } from 'lucide-react'
import { Map } from '@/components/ui/map'

export default function Home() {
  return (
    <div className="relative min-h-screen font-sans overflow-hidden bg-white">
      {/* Map Background */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <Map
          center={[126.224842, 6.952465]} // Center on requested coordinates
          zoom={11}
          theme="light"
          styles={{
            light: "https://tiles.openfreemap.org/styles/bright"
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Navbar */}
        <nav className="flex items-center justify-between px-6 py-4 bg-white/40 backdrop-blur-md sticky top-0 z-50 border-b border-green-100/50">
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

            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-[1.1] mb-8 tracking-tight">
              Your Premium Stay, <br />
              <span className="text-green-600">Perfectly Handled.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
              Discover your next home with integrated road-following navigation, real-time travel estimates, and direct owner contact—all in one place.
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
          <section className="px-6 py-24 bg-white/40 backdrop-blur-md border-y border-green-50/50">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 bg-white/80 rounded-2xl flex items-center justify-center mb-6 border border-green-100 shadow-sm backdrop-blur-sm">
                  <Navigation className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Routing</h3>
                <p className="text-gray-700 font-medium leading-relaxed">Dynamic road-following routes from your location to any property.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 bg-white/80 rounded-2xl flex items-center justify-center mb-6 border border-green-100 shadow-sm backdrop-blur-sm">
                  <MapPin className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Real-time Info</h3>
                <p className="text-gray-700 font-medium leading-relaxed">Get accurate distances and estimated travel times at a glance.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="h-16 w-16 bg-white/80 rounded-2xl flex items-center justify-center mb-6 border border-green-100 shadow-sm backdrop-blur-sm">
                  <Phone className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Instant Contact</h3>
                <p className="text-gray-700 font-medium leading-relaxed">Connect with owners instantly with one-click contact copying.</p>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="py-12 px-6 text-center text-gray-600 text-sm border-t border-green-50/50 bg-white/40 backdrop-blur-md">
          &copy; {new Date().getFullYear()} StayKo. All rights reserved.
        </footer>
      </div>
    </div>
  )
}
