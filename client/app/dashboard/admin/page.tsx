'use client'

import { useState, useEffect } from 'react'
import { getPendingProperties, approveProperty, rejectProperty } from '@/app/dashboard/property-actions'
import { Button } from '@/components/ui/button'
import { Check, X, MapPin, Home, Loader2, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

// Reuse Property type but can be inferred or imported if exported
type Property = {
    id: string
    title: string
    address: string
    price: number | null
    property_images: { image_url: string }[]
    status: string | null
    profiles?: {
        full_name: string | null
        email: string | null
        avatar_url: string | null
    }
}

export default function AdminDashboardPage() {
    const [properties, setProperties] = useState<Property[]>([])
    const [loading, setLoading] = useState(true)
    const [actionId, setActionId] = useState<string | null>(null)
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null)
    const router = useRouter()

    const fetchPending = async () => {
        setLoading(true)
        const data = await getPendingProperties()
        // @ts-ignore
        setProperties(data || [])
        setLoading(false)
    }

    useEffect(() => {
        fetchPending()
    }, [])

    const handleAction = (id: string, action: 'approve' | 'reject') => {
        setActionId(id)
        setConfirmAction(action)
    }

    const executeAction = async () => {
        if (!actionId || !confirmAction) return

        setProcessingId(actionId)
        try {
            let result;
            if (confirmAction === 'approve') {
                result = await approveProperty(actionId)
            } else {
                result = await rejectProperty(actionId)
            }

            if (result.error) {
                alert(result.error)
            } else {
                // Remove locally to be snappy
                setProperties(prev => prev.filter(p => p.id !== actionId))
                router.refresh()
            }
        } catch (error) {
            console.error(error)
            alert("An error occurred")
        } finally {
            setProcessingId(null)
            setActionId(null)
            setConfirmAction(null)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            <div className="container mx-auto py-8 px-4 max-w-7xl">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/dashboard" className="group p-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all duration-200 shadow-sm">
                        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
                        <p className="text-gray-500 text-sm mt-1">Review and manage pending property listings</p>
                    </div>
                </div>

                {properties.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-dashed border-gray-300 text-center">
                        <div className="bg-green-50 p-4 rounded-full mb-4">
                            <Check className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">All Caught Up!</h3>
                        <p className="text-gray-500 mt-1">There are no pending properties to review at the moment.</p>
                        <Button variant="outline" className="mt-6" onClick={fetchPending}>
                            Refresh List
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map((property) => (
                            <div key={property.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                                <div className="relative h-48 w-full bg-gray-100">
                                    {property.property_images?.[0] ? (
                                        <Image
                                            src={property.property_images[0].image_url}
                                            alt={property.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-gray-400">
                                            <Home className="h-8 w-8" />
                                        </div>
                                    )}
                                    <div className="absolute top-2 right-2">
                                        <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded-lg shadow-sm border border-yellow-200">
                                            Pending Review
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 flex-1 flex flex-col">
                                    <div className="mb-4">
                                        <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{property.title}</h3>
                                        <p className="text-sm text-gray-500 flex items-start mt-1">
                                            <MapPin className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0 text-gray-400" />
                                            <span className="line-clamp-2">{property.address}</span>
                                        </p>
                                    </div>

                                    {property.profiles && (
                                        <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="relative h-8 w-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                                                {property.profiles.avatar_url ? (
                                                    <Image src={property.profiles.avatar_url} alt="User" fill className="object-cover" />
                                                ) : (
                                                    <span className="flex items-center justify-center h-full w-full text-xs font-bold text-gray-500">
                                                        {property.profiles.full_name?.charAt(0)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-sm font-medium text-gray-900 truncate">{property.profiles.full_name || 'Unknown User'}</p>
                                                <p className="text-xs text-gray-500 truncate">{property.profiles.email}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-auto pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                                        <Button
                                            variant="outline"
                                            className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                                            onClick={() => handleAction(property.id, 'reject')}
                                            disabled={!!processingId}
                                        >
                                            {processingId === property.id && confirmAction === 'reject' ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <X className="h-4 w-4 mr-1.5" /> Reject
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm"
                                            onClick={() => handleAction(property.id, 'approve')}
                                            disabled={!!processingId}
                                        >
                                            {processingId === property.id && confirmAction === 'approve' ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <>
                                                    <Check className="h-4 w-4 mr-1.5" /> Approve
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={!!actionId}
                onOpenChange={(open) => !open && setActionId(null)}
                title={confirmAction === 'approve' ? "Approve Property" : "Reject & Delete Property"}
                description={
                    confirmAction === 'approve'
                        ? "Are you sure you want to approve this property? It will become visible to all users."
                        : "Are you sure you want to reject this property? This action will permanently delete it."
                }
                confirmText={confirmAction === 'approve' ? "Approve" : "Reject & Delete"}
                cancelText="Cancel"
                onConfirm={executeAction}
                variant={confirmAction === 'approve' ? "default" : "danger"}
            />
        </div>
    )
}
