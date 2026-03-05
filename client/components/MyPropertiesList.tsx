'use client'

import { useState, useEffect } from 'react'
import { getUserProperties, deleteProperty, togglePropertyStatus } from '@/app/dashboard/property-actions'
import { Property, AddPropertyModal } from './AddPropertyModal'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, MapPin, Loader2, Home, Clock } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

export function MyPropertiesList() {
    const [properties, setProperties] = useState<Property[]>([])
    const [loading, setLoading] = useState(true)
    const [editingProperty, setEditingProperty] = useState<Property | null>(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
    const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null)
    const router = useRouter()

    const fetchProperties = async () => {
        setLoading(true)
        const data = await getUserProperties()
        // @ts-ignore - Types compatibility
        setProperties(data || [])
        setLoading(false)
    }

    useEffect(() => {
        fetchProperties()
    }, [])

    const handleDelete = async (id: string) => {
        setPropertyToDelete(id)
        setDeleteConfirmOpen(true)
    }

    const confirmDelete = async () => {
        if (!propertyToDelete) return

        const result = await deleteProperty(propertyToDelete)
        if (result.error) {
            alert(result.error)
        } else {
            fetchProperties()
            router.refresh()
        }
        setPropertyToDelete(null)
    }

    const handleToggleStatus = async (id: string, currentStatus: string) => {
        const result = await togglePropertyStatus(id, currentStatus)
        if (result.error) {
            alert(result.error)
        } else {
            fetchProperties()
            router.refresh()
        }
    }

    const startEdit = (property: Property) => {
        setEditingProperty(property)
        setIsEditModalOpen(true)
    }

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-green-600" /></div>
    }

    if (properties.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <Home className="h-12 w-12 mb-4 text-gray-300" />
                <p className="text-lg font-medium">No properties listed yet.</p>
                <p className="text-sm">Click &quot;List Your Space&quot; to get started!</p>
            </div>
        )
    }

    return (
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto h-full">
            {properties.map((property) => {
                const isPending = property.status === 'Pending'

                return (
                    <div
                        key={property.id}
                        className={`relative bg-white rounded-2xl shadow-sm border overflow-hidden flex flex-col transition-shadow
                            ${isPending
                                ? 'border-amber-200 shadow-amber-50'
                                : 'border-gray-100 hover:shadow-md group'
                            }`}
                    >
                        {/* Image section */}
                        <div className="relative h-48 w-full bg-gray-100">
                            {property.property_images?.[0] ? (
                                <Image
                                    src={property.property_images[0].image_url}
                                    alt={property.title}
                                    fill
                                    className={`object-cover transition-all duration-300 ${isPending ? 'blur-[2px] brightness-75' : ''}`}
                                />
                            ) : (
                                <div className={`flex items-center justify-center h-full text-gray-400 ${isPending ? 'opacity-50' : ''}`}>
                                    <Home className="h-8 w-8" />
                                </div>
                            )}

                            {/* Pending overlay */}
                            {isPending && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-[1px]">
                                    <div className="flex items-center gap-1.5 bg-amber-400/90 backdrop-blur-sm text-amber-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                                        <Clock className="h-3.5 w-3.5" />
                                        Pending Approval
                                    </div>
                                    <p className="text-white/80 text-[10px] mt-1.5 font-medium">Under review by admin</p>
                                </div>
                            )}

                            {/* Status badge — only for approved properties */}
                            {!isPending && (
                                <div className="absolute top-2 right-2 flex gap-1">
                                    <button
                                        onClick={() => handleToggleStatus(property.id, property.status || 'available')}
                                        className={`px-2 py-1 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm transition-colors ${property.status === 'booked'
                                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                                            }`}
                                    >
                                        {property.status === 'booked' ? 'Booked' : 'Available'}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Card body */}
                        <div className={`p-4 flex-1 flex flex-col ${isPending ? 'opacity-60' : ''}`}>
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-bold text-gray-900 line-clamp-1">{property.title}</h3>
                                    <p className="text-xs text-gray-500 flex items-center mt-1">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        <span className="line-clamp-1">{property.address}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
                                <span className="font-bold text-green-600">₱{property.price}<span className="text-xs text-gray-400 font-normal"></span></span>

                                <div className="flex gap-2">
                                    {/* Edit — only for approved properties */}
                                    {!isPending && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-full hover:bg-gray-100 text-gray-500"
                                            onClick={() => startEdit(property)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    )}

                                    {/* Delete — always visible */}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-full hover:bg-red-50 text-red-500"
                                        onClick={() => handleDelete(property.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}

            {/* Edit Modal */}
            <AddPropertyModal
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                property={editingProperty || undefined}
                trigger={<span className="hidden"></span>}
            />

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={deleteConfirmOpen}
                onOpenChange={setDeleteConfirmOpen}
                title="Delete Property"
                description="Are you sure you want to delete this property? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmDelete}
                variant="danger"
            />
        </div>
    )
}
