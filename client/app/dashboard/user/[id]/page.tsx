'use client'

import { useEffect, useState } from 'react'
import { getPublicProfile } from '@/app/dashboard/profile-actions'
import { getPublicUserProperties } from '@/app/dashboard/property-actions'
import { Property } from '@/components/StayKoMap'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Phone, MapPin, Facebook, Instagram, Music2, Check, Copy, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ImageLightbox } from '@/components/ui/image-lightbox'

export default function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const [userId, setUserId] = useState<string>('')
    const [profile, setProfile] = useState<any>(null)
    const [properties, setProperties] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [lightboxImages, setLightboxImages] = useState<string[]>([])
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    useEffect(() => {
        async function fetchData() {
            const resolvedParams = await params
            setUserId(resolvedParams.id)

            const [profileData, propertiesData] = await Promise.all([
                getPublicProfile(resolvedParams.id),
                getPublicUserProperties(resolvedParams.id)
            ])

            setProfile(profileData)
            setProperties(propertiesData || [])
            setLoading(false)
        }
        fetchData()
    }, [params])

    const openLightbox = (images: string[], index: number) => {
        setLightboxImages(images)
        setCurrentImageIndex(index)
        setLightboxOpen(true)
    }

    const closeLightbox = () => {
        setLightboxOpen(false)
    }

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % lightboxImages.length)
    }

    const previousImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + lightboxImages.length) % lightboxImages.length)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
                <div className="text-gray-500">Loading...</div>
            </div>
        )
    }

    if (!profile) {
        return (
            <div className="container mx-auto p-6 flex flex-col items-center justify-center min-h-[50vh]">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">User Not Found</h1>
                <p className="text-gray-500 mb-6">The user profile you are looking for does not exist.</p>
                <Link href="/dashboard" className="text-green-600 hover:underline flex items-center">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                </Link>
            </div>
        )
    }

    // Property card with clickable image
    const PropertyCard = ({ property }: { property: any }) => {
        const propertyImages = property.property_images?.map((img: any) => img.image_url) || []

        return (
            <Card className="overflow-hidden hover:shadow-lg transition-shadow border-gray-100 group">
                <div
                    className="relative h-48 w-full bg-gray-100 cursor-pointer"
                    onClick={() => propertyImages.length > 0 && openLightbox(propertyImages, 0)}
                >
                    {property.property_images && property.property_images.length > 0 ? (
                        <>
                            <Image
                                src={property.property_images[0].image_url}
                                alt={property.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            {/* Image count badge */}
                            {property.property_images.length > 1 && (
                                <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded-lg text-xs font-medium">
                                    1 / {property.property_images.length}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <MapPin className="h-8 w-8" />
                        </div>
                    )}
                    <div className="absolute top-3 left-3">
                        <Badge className={`${property.status === 'available' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
                            } text-white border-0 shadow-sm`}>
                            {property.status === 'available' ? 'Available' : 'Booked'}
                        </Badge>
                    </div>
                </div>
                <CardHeader className="p-4 pb-2">
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-lg font-bold text-gray-900 line-clamp-1">{property.title}</CardTitle>
                        <span className="text-green-600 font-bold text-lg whitespace-nowrap">₱{property.price}</span>
                    </div>
                    <div className="flex items-center text-gray-500 text-xs mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="truncate">{property.address}</span>
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-2 pb-3">
                    <p className="text-gray-600 text-sm line-clamp-2">{property.description}</p>
                </CardContent>
                <CardFooter className="p-4 pt-0 bg-gray-50/50 flex justify-between items-center text-xs text-gray-500 border-t border-gray-100/50">
                    <div className="flex items-center gap-3 w-full mt-3">
                        <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-medium">
                            {property.property_type}
                        </div>
                        <div className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md font-medium">
                            {property.available_slots} Slots
                        </div>
                    </div>
                </CardFooter>
            </Card>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50/30">
            {/* Header / Cover */}
            <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/dashboard" className="text-gray-500 hover:text-green-600 transition-colors flex items-center text-sm font-medium">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Map
                    </Link>
                    <h1 className="text-lg font-semibold text-gray-800">Public Profile</h1>
                    <div className="w-20"></div> {/* Spacer for centering */}
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-5xl">
                {/* Profile Header */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 mb-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-green-50 to-emerald-50/50"></div>

                    <div className="relative z-10">
                        <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                            <AvatarImage src={profile.avatar_url || ''} className="object-cover" />
                            <AvatarFallback className="text-3xl bg-green-100 text-green-700">
                                {profile.full_name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="flex-1 text-center md:text-left pt-2 md:pt-4 relative z-10">
                        <h1 className="text-3xl font-bold text-gray-900 mb-1">{profile.full_name}</h1>
                        <p className="text-gray-500 mb-2">@{profile.username || 'username'}</p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-600 mb-6">
                            {profile.phone_number && (
                                <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 text-sm font-medium">
                                    <Phone className="h-4 w-4 mr-2 text-green-600" />
                                    {profile.phone_number}
                                </div>
                            )}
                            {profile.address && (
                                <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100 text-sm font-medium">
                                    <MapPin className="h-4 w-4 mr-2 text-green-600" />
                                    {profile.address}
                                </div>
                            )}
                        </div>

                        {/* Social Media */}
                        {(() => {
                            const social = Array.isArray(profile.social_media) ? profile.social_media[0] : profile.social_media
                            if (!social) return null

                            return (
                                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                    {social.facebook && (
                                        <a
                                            href={social.facebook.startsWith('http') ? social.facebook : `https://facebook.com/${social.facebook}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:bg-blue-50 hover:-translate-y-0.5 transition-all group/fb flex items-center gap-2 text-sm"
                                        >
                                            <Facebook className="h-4 w-4 text-gray-400 group-hover/fb:text-blue-600 transition-colors" />
                                            <span className="font-medium text-gray-600 group-hover/fb:text-blue-700">Facebook</span>
                                        </a>
                                    )}
                                    {social.instagram && (
                                        <a
                                            href={social.instagram.startsWith('http') ? social.instagram : `https://instagram.com/${social.instagram}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:bg-pink-50 hover:-translate-y-0.5 transition-all group/ig flex items-center gap-2 text-sm"
                                        >
                                            <Instagram className="h-4 w-4 text-gray-400 group-hover/ig:text-pink-600 transition-colors" />
                                            <span className="font-medium text-gray-600 group-hover/ig:text-pink-700">Instagram</span>
                                        </a>
                                    )}
                                    {social.tiktok && (
                                        <a
                                            href={social.tiktok.startsWith('http') ? social.tiktok : `https://tiktok.com/@${social.tiktok}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:bg-gray-50 hover:-translate-y-0.5 transition-all group/tt flex items-center gap-2 text-sm"
                                        >
                                            <Music2 className="h-4 w-4 text-gray-400 group-hover/tt:text-black transition-colors" />
                                            <span className="font-medium text-gray-600 group-hover/tt:text-black">TikTok</span>
                                        </a>
                                    )}
                                </div>
                            )
                        })()}
                    </div>
                </div>

                {/* Listings */}
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-green-600" />
                    Listings by {profile.full_name}
                </h2>

                {properties && properties.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {properties.map((property: any) => (
                            <PropertyCard key={property.id} property={property} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 border-dashed">
                        <p className="text-gray-500">No active listings found for this user.</p>
                    </div>
                )}
            </div>

            {/* Image Lightbox */}
            <ImageLightbox
                images={lightboxImages}
                currentIndex={currentImageIndex}
                isOpen={lightboxOpen}
                onClose={closeLightbox}
                onNext={nextImage}
                onPrevious={previousImage}
            />
        </div>
    )
}
