"use client";

import { signInWithGoogle } from './actions'
import { Map } from '@/components/ui/map'
import Image from 'next/image'
import { useState } from 'react'
import { X, ShieldCheck, FileText } from 'lucide-react'

type ModalType = 'terms' | 'privacy' | null;

export default function LoginPage() {
    const [agreed, setAgreed] = useState(false);
    const [activeModal, setActiveModal] = useState<ModalType>(null);

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

                    {/* Privacy Checkbox */}
                    <div className="mb-5 flex items-start gap-3 bg-green-50/70 border border-green-100 rounded-2xl p-4">
                        <input
                            id="agree-checkbox"
                            type="checkbox"
                            checked={agreed}
                            onChange={(e) => setAgreed(e.target.checked)}
                            className="mt-0.5 h-4 w-4 cursor-pointer accent-green-700 rounded"
                        />
                        <label htmlFor="agree-checkbox" className="text-xs text-gray-600 leading-relaxed cursor-pointer select-none">
                            I have read and agree to the{' '}
                            <button
                                type="button"
                                onClick={() => setActiveModal('terms')}
                                className="text-green-700 font-semibold hover:underline focus:outline-none"
                            >
                                Terms of Service
                            </button>
                            {' '}and{' '}
                            <button
                                type="button"
                                onClick={() => setActiveModal('privacy')}
                                className="text-green-700 font-semibold hover:underline focus:outline-none"
                            >
                                Privacy Policy
                            </button>
                            , including the collection and processing of my personal data.
                        </label>
                    </div>

                    <form action={signInWithGoogle} className="space-y-4">
                        <button
                            type="submit"
                            disabled={!agreed}
                            className={`group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-6 py-4 text-sm font-bold text-gray-800 shadow-md ring-1 ring-gray-200 transition-all duration-200
                                ${agreed
                                    ? 'hover:bg-gray-50 hover:shadow-lg active:scale-[0.98] cursor-pointer'
                                    : 'opacity-40 cursor-not-allowed'
                                }`}
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

                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-400 font-medium leading-relaxed">
                            You must agree to the terms before signing in.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Modal ───────────────────────────────────────── */}
            {activeModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                    onClick={() => setActiveModal(null)}
                >
                    <div
                        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center gap-3 px-7 py-5 border-b border-gray-100 bg-green-50">
                            {activeModal === 'terms'
                                ? <FileText className="h-5 w-5 text-green-700" />
                                : <ShieldCheck className="h-5 w-5 text-green-700" />
                            }
                            <h2 className="text-base font-bold text-gray-800">
                                {activeModal === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
                            </h2>
                            <button
                                onClick={() => setActiveModal(null)}
                                className="ml-auto text-gray-400 hover:text-gray-700 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="overflow-y-auto px-7 py-6 space-y-5 text-sm text-gray-600 leading-relaxed">
                            {activeModal === 'terms' ? (
                                <>
                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Effective Date: March 2025</p>

                                    <section>
                                        <h3 className="font-bold text-gray-800 mb-1">1. Acceptance of Terms</h3>
                                        <p>By accessing or using StayKo, you confirm that you are at least 18 years old and agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.</p>
                                    </section>

                                    <section>
                                        <h3 className="font-bold text-gray-800 mb-1">2. Use of the Platform</h3>
                                        <p>StayKo provides a platform to discover, book, and manage premium accommodations. You agree to use StayKo only for lawful purposes and in accordance with these terms. You must not misuse, reverse-engineer, or attempt to gain unauthorized access to any part of the platform.</p>
                                    </section>

                                    <section>
                                        <h3 className="font-bold text-gray-800 mb-1">3. Account Responsibility</h3>
                                        <p>You are responsible for maintaining the confidentiality of your account credentials. Any activity conducted through your account is your responsibility. Notify us immediately if you suspect unauthorized use.</p>
                                    </section>

                                    <section>
                                        <h3 className="font-bold text-gray-800 mb-1">4. Bookings & Payments</h3>
                                        <p>All bookings are subject to availability and confirmation by the property host. Payments processed through StayKo are handled securely. Cancellation and refund policies vary per listing and are displayed prior to booking.</p>
                                    </section>

                                    <section>
                                        <h3 className="font-bold text-gray-800 mb-1">5. Limitation of Liability</h3>
                                        <p>StayKo is not liable for any indirect, incidental, or consequential damages arising from your use of the platform. We do not guarantee the accuracy of listings provided by third-party hosts.</p>
                                    </section>

                                    <section>
                                        <h3 className="font-bold text-gray-800 mb-1">6. Changes to Terms</h3>
                                        <p>We reserve the right to update these Terms at any time. Continued use of StayKo after changes constitutes your acceptance of the revised terms.</p>
                                    </section>
                                </>
                            ) : (
                                <>
                                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Effective Date: March 2025</p>

                                    <section>
                                        <h3 className="font-bold text-gray-800 mb-1">1. Information We Collect</h3>
                                        <p>When you use StayKo, we collect the following types of data:</p>
                                        <ul className="list-disc ml-5 mt-1 space-y-1">
                                            <li><strong>Account Information:</strong> Name, email address, and profile photo obtained via Google Sign-In.</li>
                                            <li><strong>Usage Data:</strong> Pages visited, features used, and interactions within the platform.</li>
                                            <li><strong>Location Data:</strong> General location (city/region) to show nearby listings, only when permitted by your device.</li>
                                            <li><strong>Booking Data:</strong> Reservation details, payment records, and communication history.</li>
                                        </ul>
                                    </section>

                                    <section>
                                        <h3 className="font-bold text-gray-800 mb-1">2. How We Use Your Data</h3>
                                        <ul className="list-disc ml-5 space-y-1">
                                            <li>To create and manage your account</li>
                                            <li>To process bookings and payments</li>
                                            <li>To improve platform features and user experience</li>
                                            <li>To send important notifications (booking confirmations, policy updates)</li>
                                            <li>To detect and prevent fraud or misuse</li>
                                        </ul>
                                    </section>

                                    <section>
                                        <h3 className="font-bold text-gray-800 mb-1">3. Data Sharing</h3>
                                        <p>We do not sell your personal data. We may share necessary information with:</p>
                                        <ul className="list-disc ml-5 mt-1 space-y-1">
                                            <li>Property hosts (limited to booking-related details)</li>
                                            <li>Payment processors for secure transactions</li>
                                            <li>Service providers that help us operate the platform</li>
                                        </ul>
                                    </section>

                                    <section>
                                        <h3 className="font-bold text-gray-800 mb-1">4. Data Retention</h3>
                                        <p>We retain your data for as long as your account is active or as required to provide services. You may request deletion of your account and associated data by contacting our support team.</p>
                                    </section>

                                    <section>
                                        <h3 className="font-bold text-gray-800 mb-1">5. Your Rights</h3>
                                        <p>You have the right to access, correct, or delete your personal data. To exercise any of these rights, please contact us at <span className="text-green-700 font-medium">privacy@stayko.app</span>.</p>
                                    </section>

                                    <section>
                                        <h3 className="font-bold text-gray-800 mb-1">6. Cookies</h3>
                                        <p>StayKo uses cookies to enhance your browsing experience, remember preferences, and analyze platform usage. You can control cookie preferences through your browser settings.</p>
                                    </section>

                                    <section>
                                        <h3 className="font-bold text-gray-800 mb-1">7. Security</h3>
                                        <p>We use industry-standard security measures including encryption and secure connections (HTTPS) to protect your data. However, no method of transmitting data over the internet is 100% secure.</p>
                                    </section>
                                </>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-7 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setAgreed(true);
                                    setActiveModal(null);
                                }}
                                className="px-5 py-2.5 rounded-xl bg-green-700 text-white text-sm font-semibold hover:bg-green-800 transition-colors"
                            >
                                I Agree
                            </button>
                            <button
                                onClick={() => setActiveModal(null)}
                                className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 text-sm font-semibold hover:bg-gray-200 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
