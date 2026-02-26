'use client'

import { useState, useEffect } from 'react'
import { getFavorites, toggleFavorite } from '@/app/dashboard/property-actions'
import { Property } from './StayKoMap'
import { Button } from '@/components/ui/button'
import { MapPin, Loader2, Home, Heart, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

export function FavoritesList() {
    const [properties, setProperties] = useState<Property[]>([])
    const [loading, setLoading] = useState(true)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const router = useRouter()

    const fetchFavorites = async () => {
        setLoading(true)
        const data = await getFavorites()
        // @ts-ignore
        setProperties(data || [])
        setLoading(false)
    }

    useEffect(() => {
        fetchFavorites()
    }, [])

    const handleRemoveClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        setSelectedId(id)
        setConfirmOpen(true)
    }

    const performRemoveFavorite = async () => {
        if (!selectedId) return
        const id = selectedId
        setProperties(prev => prev.filter(p => p.id !== id))
        const result = await toggleFavorite(id)
        if (result.error) {
            fetchFavorites()
            console.error('Failed to remove favorite:', result.error)
        } else {
            router.refresh()
        }
        setConfirmOpen(false)
        setSelectedId(null)
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                <p className="text-sm text-gray-400 font-medium">Loading your favorites...</p>
            </div>
        )
    }

    if (properties.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4">
                <div className="bg-rose-50 p-6 rounded-full">
                    <Heart className="h-12 w-12 text-rose-300" />
                </div>
                <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-900">No favorites yet</h3>
                    <p className="text-gray-500 mt-1 text-sm max-w-xs">
                        Explore properties and tap the heart icon to save the ones you love.
                    </p>
                </div>
                <Button
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl px-6 mt-2"
                    onClick={() => router.push('/dashboard')}
                >
                    Browse Properties
                </Button>
            </div>
        )
    }

    return (
        <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {properties.map((property) => (
                    <div
                        key={property.id}
                        className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col group"
                    >
                        {/* Image Section */}
                        <div className="relative h-52 w-full bg-gray-100 flex-shrink-0">
                            {property.property_images?.[0] ? (
                                <Image
                                    src={property.property_images[0].image_url}
                                    alt={property.title}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-300 bg-gray-50">
                                    <Home className="h-10 w-10" />
                                </div>
                            )}

                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                            {/* Property type badge */}
                            <div className="absolute top-3 left-3">
                                <span className="bg-green-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                                    {property.property_type}
                                </span>
                            </div>

                            {/* Remove favorite button */}
                            <button
                                onClick={(e) => handleRemoveClick(property.id, e)}
                                className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-rose-500 p-2 rounded-full hover:bg-white transition-all duration-200 shadow-sm"
                                title="Remove from favorites"
                            >
                                <Heart className="h-4 w-4 fill-rose-500" />
                            </button>

                            {/* Price overlay on image bottom */}
                            <div className="absolute bottom-3 right-3">
                                <span className="bg-white/95 backdrop-blur-sm text-green-700 font-bold text-sm px-3 py-1 rounded-full shadow-sm">
                                    ₱{property.price?.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="p-4 flex flex-col gap-3 flex-1">
                            {/* Title + Address */}
                            <div>
                                <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-1">
                                    {property.title}
                                </h3>
                                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1.5">
                                    <MapPin className="h-3 w-3 flex-shrink-0 text-gray-300" />
                                    <span className="line-clamp-1">{property.address}</span>
                                </p>
                            </div>

                            {/* Description */}
                            {property.description && (
                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                                    {property.description}
                                </p>
                            )}

                            {/* Owner Section */}
                            <div className="mt-auto pt-3 border-t border-gray-50">
                                <Link
                                    href={`/dashboard/user/${property.user_id}`}
                                    className="flex items-center gap-2.5 hover:bg-gray-50 p-1.5 -mx-1.5 rounded-xl transition-colors group/owner"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="relative h-9 w-9 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-white shadow-sm">
                                        {property.profiles?.avatar_url ? (
                                            <Image
                                                src={property.profiles.avatar_url}
                                                alt={property.profiles.full_name || 'Owner'}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">
                                                    {property.profiles?.full_name?.charAt(0).toUpperCase() || 'U'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mb-0.5">
                                            Listed by
                                        </p>
                                        <p className="text-sm font-semibold text-gray-800 truncate group-hover/owner:text-green-700 transition-colors">
                                            {property.profiles?.full_name || 'Unknown Owner'}
                                        </p>
                                    </div>
                                    <User className="h-4 w-4 text-gray-300 group-hover/owner:text-green-500 transition-colors flex-shrink-0" />
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Remove from Favorites?"
                description="Are you sure you want to remove this property from your favorites?"
                confirmText="Yes, Remove"
                cancelText="Keep It"
                onConfirm={performRemoveFavorite}
                variant="danger"
            />
        </div>
    )
}
