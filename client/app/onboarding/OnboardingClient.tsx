'use client'

import { useState } from 'react'
import { updateProfile } from './actions'
import { Camera, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import Image from 'next/image'

interface OnboardingProps {
    user: {
        id: string
        email?: string
        user_metadata: {
            full_name?: string
            avatar_url?: string
        }
    }
}

export default function OnboardingClient({ user }: OnboardingProps) {
    const [step, setStep] = useState(1)
    const [uploading, setUploading] = useState(false)
    const [uploadError, setUploadError] = useState('')
    const [formData, setFormData] = useState({
        full_name: user.user_metadata.full_name || '',
        phone_number: '',
        address: '',
        avatar_url: '', // Don't use Gmail photo as default
    })

    const handleNext = () => setStep(step + 1)
    const handleBack = () => setStep(step - 1)

    const updateFormData = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        setUploadError('')

        try {
            const formDataUpload = new FormData()
            formDataUpload.append('file', file)
            formDataUpload.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formDataUpload,
                }
            )

            if (!response.ok) {
                throw new Error('Upload failed')
            }

            const data = await response.json()
            setFormData({ ...formData, avatar_url: data.secure_url })
        } catch (error) {
            console.error('Upload error:', error)
            setUploadError('Failed to upload image. Please try again.')
        } finally {
            setUploading(false)
        }
    }

    const steps = [
        { id: 1, title: 'Basic Info' },
        { id: 2, title: 'Profile Picture' }
    ]

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#f0fdf4] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-sm border border-green-100">
                {/* Step Indicator */}
                <div className="flex items-center justify-center space-x-4 mb-8">
                    {steps.map((s) => (
                        <div key={s.id} className="flex items-center">
                            <div className={`flex items-center justify-center h-10 w-10 rounded-full border-2 transition-all duration-300 ${step >= s.id
                                ? 'bg-green-600 border-green-600 text-white'
                                : 'bg-white border-gray-200 text-gray-400'
                                }`}>
                                {step > s.id ? <Check className="h-5 w-5" /> : s.id}
                            </div>
                            {s.id < steps.length && (
                                <div className={`h-1 w-10 ml-4 rounded-full transition-all duration-300 ${step > s.id ? 'bg-green-600' : 'bg-gray-200'
                                    }`} />
                            )}
                        </div>
                    ))}
                </div>

                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        {step === 1 ? 'Step 1: Your Details' : 'Step 2: Profile Picture'}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {step === 1
                            ? "Tell us a bit about yourself."
                            : "Add a face to your StayKo account."}
                    </p>
                </div>

                <form action={updateProfile} className="mt-8 space-y-6">
                    {/* Hidden inputs to preserve data from other steps */}
                    {step === 2 && (
                        <>
                            <input type="hidden" name="full_name" value={formData.full_name} />
                            <input type="hidden" name="phone_number" value={formData.phone_number} />
                            <input type="hidden" name="address" value={formData.address} />
                        </>
                    )}
                    <input type="hidden" name="avatar_url" value={formData.avatar_url} />

                    {step === 1 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div>
                                <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 mb-1">
                                    Full Name
                                </label>
                                <input
                                    id="full_name"
                                    name="full_name"
                                    type="text"
                                    required
                                    value={formData.full_name}
                                    onChange={updateFormData}
                                    className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all sm:text-sm"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    id="phone_number"
                                    name="phone_number"
                                    type="tel"
                                    required
                                    value={formData.phone_number}
                                    onChange={updateFormData}
                                    className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all sm:text-sm"
                                    placeholder="+1 (555) 000-0000"
                                />
                            </div>
                            <div>
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                    Address
                                </label>
                                <textarea
                                    id="address"
                                    name="address"
                                    rows={3}
                                    required
                                    value={formData.address}
                                    onChange={updateFormData}
                                    className="appearance-none rounded-xl relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all sm:text-sm resize-none"
                                    placeholder="123 StayKo Ave, Suite 101"
                                />
                            </div>

                            <div className="pt-4">
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={!formData.full_name || !formData.phone_number || !formData.address}
                                    className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                                >
                                    Continue <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex flex-col items-center justify-center">
                                <div className="relative group">
                                    <div className="h-32 w-32 rounded-full bg-green-50 border-4 border-white shadow-md overflow-hidden flex items-center justify-center relative">
                                        {formData.avatar_url ? (
                                            <Image
                                                src={formData.avatar_url}
                                                alt="Profile"
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <Camera className="h-10 w-10 text-green-300" />
                                        )}
                                    </div>
                                    <label
                                        htmlFor="file-upload"
                                        className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full shadow-lg border-2 border-white hover:bg-green-700 transition-all cursor-pointer"
                                    >
                                        <Camera className="h-4 w-4" />
                                        <input
                                            id="file-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleImageUpload}
                                            disabled={uploading}
                                        />
                                    </label>
                                </div>
                                {uploading && (
                                    <p className="mt-4 text-sm text-green-600 font-medium">Uploading...</p>
                                )}
                                {uploadError && (
                                    <p className="mt-4 text-sm text-red-600 font-medium">{uploadError}</p>
                                )}
                                {!uploading && !uploadError && (
                                    <p className="mt-4 text-xs text-gray-500 text-center max-w-[200px]">
                                        Click the camera icon to upload your profile picture.
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="flex-1 flex justify-center items-center gap-2 py-4 px-4 border border-gray-200 text-sm font-bold rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-all shadow-sm"
                                >
                                    <ChevronLeft className="h-4 w-4" /> Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="flex-[2] flex justify-center items-center gap-2 py-4 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Complete Setup <Check className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}
