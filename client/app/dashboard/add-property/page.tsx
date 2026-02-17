'use client'

import { useRouter } from 'next/navigation'
import { PropertyForm } from '@/components/PropertyForm'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AddPropertyPage() {
    const router = useRouter()

    const handleSuccess = () => {
        router.push('/dashboard')
        router.refresh() // Refresh to show new property
    }

    const handleCancel = () => {
        router.back()
    }

    return (
        <div className="max-w-4xl mx-auto p-6 pb-20">
            <div className="mb-6 flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-gray-100">
                    <Link href="/dashboard">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">List Your Property</h1>
                    <p className="text-gray-500">Share your space with the StayKo community.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <PropertyForm
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            </div>
        </div>
    )
}
