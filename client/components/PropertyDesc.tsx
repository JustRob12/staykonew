"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Phone, MapPin, Copy, Check, Facebook, Instagram, Music2 } from "lucide-react";
import { type Property } from "./StayKoMap";

interface PropertyDescProps {
    property: Property;
    onClose: () => void;
    isMaximized: boolean;
    setIsMaximized: (val: boolean) => void;
    currentImageIndex: number;
    setCurrentImageIndex: (val: number | ((prev: number) => number)) => void;
    routeDistance: string | null;
}

export function PropertyDesc({
    property,
    onClose,
    isMaximized,
    setIsMaximized,
    currentImageIndex,
    setCurrentImageIndex,
    routeDistance
}: PropertyDescProps) {
    const [isCopied, setIsCopied] = useState(false);

    console.log('PropertyDesc Render:', {
        profile: property.profiles,
        socialMedia: property.profiles?.social_media
    });

    const handleCopyNumber = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (property.profiles?.phone_number) {
            navigator.clipboard.writeText(property.profiles.phone_number);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    return (
        <>
            <div
                className="absolute z-20 
                        bottom-0 left-0 right-0 p-4 sm:p-0
                        sm:top-4 sm:right-4 sm:left-auto sm:bottom-auto 
                        w-full sm:w-[24rem] sm:max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-5 fade-in duration-300 sm:slide-in-from-right-5 flex flex-col max-h-[85vh] sm:max-h-[calc(100vh-2rem)]">
                    <div className="relative h-64 w-full bg-gray-100 group cursor-pointer" onClick={() => setIsMaximized(true)}>
                        {property.property_images && property.property_images.length > 0 ? (
                            <>
                                <Image
                                    src={property.property_images[currentImageIndex].image_url}
                                    alt={property.title}
                                    fill
                                    className="object-cover transition-opacity duration-300 group-hover:opacity-90"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                    <span className="bg-black/50 text-white px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm">View Photos</span>
                                </div>
                                {property.property_images.length > 1 && (
                                    <>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setCurrentImageIndex(prev => prev === 0 ? property.property_images.length - 1 : prev - 1);
                                            }}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1.5 rounded-full backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100 placeholder-button"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setCurrentImageIndex(prev => prev === property.property_images.length - 1 ? 0 : prev + 1);
                                            }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1.5 rounded-full backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100 placeholder-button"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </button>
                                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                                            {property.property_images.map((_, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`w-1.5 h-1.5 rounded-full transition-colors ${idx === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-400 bg-gray-50">
                                <span className="text-sm">No Images Available</span>
                            </div>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                            }}
                            className="absolute top-4 right-4 bg-white p-2 rounded-full text-gray-900 shadow-md border border-gray-100 transition-transform active:scale-90 z-50 hover:bg-gray-100"
                        >
                            <X className="h-5 w-5" />
                        </button>
                        <div className="absolute top-4 left-4 bg-green-600/90 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-white shadow-sm flex items-center z-50">
                            <span className={`w-2 h-2 rounded-full mr-2 ${property.status === 'available' ? 'bg-green-300' : 'bg-red-400'}`}></span>
                            {property.status === 'available' ? 'Available' : property.status}
                        </div>
                    </div>

                    <div className="p-5 overflow-y-auto scrollbar-hide text-black flex-1 min-h-0">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-xl text-gray-900 leading-tight">{property.title}</h3>
                            <div className="text-right">
                                <span className="block text-lg font-bold text-green-700">₱{property.price}</span>
                                {routeDistance && (
                                    <span className="block text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full mt-1">
                                        {routeDistance} away
                                    </span>
                                )}

                            </div>
                        </div>

                        <div className="flex items-center text-xs text-black mb-4 bg-gray-50 p-2 rounded-lg">
                            <MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
                            <span className="line-clamp-1">{property.address}</span>
                        </div>

                        <p className="text-sm text-black mb-4 leading-relaxed">Description: <br /> {property.description || 'No description available'}</p>

                        <div className="grid grid-cols-2 gap-3 mb-6">
                            <div className="bg-gray-50 p-2.5 rounded-xl text-center">
                                <span className="block text-xs text-gray-400 uppercase tracking-wider font-semibold">Slots</span>
                                <span className="block text-sm font-bold text-gray-800">{property.available_slots}</span>
                            </div>
                            <div className="bg-gray-50 p-2.5 rounded-xl text-center">
                                <span className="block text-xs text-gray-400 uppercase tracking-wider font-semibold">Type</span>
                                <span className="block text-sm font-bold text-gray-800 capitalize">{property.property_type}</span>
                            </div>
                        </div>

                        <div className="bg-green-50/50 rounded-xl p-4 border border-green-100">
                            <Link href={`/dashboard/user/${property.user_id}`} className="flex items-center gap-4 group/owner cursor-pointer transition-all hover:bg-green-100/50 p-2 -m-2 rounded-xl">
                                <div className="relative h-14 w-14 rounded-full bg-white ring-2 ring-white shadow-md overflow-hidden flex-shrink-0 group-hover/owner:ring-green-200 transition-all">
                                    {property.profiles?.avatar_url ? (
                                        <Image
                                            src={property.profiles.avatar_url}
                                            alt={property.profiles.full_name || "Owner"}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-green-100 text-green-700 font-bold text-lg">
                                            {property.profiles?.full_name?.charAt(0).toUpperCase() || "U"}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs text-green-600 font-bold uppercase tracking-wide mb-0.5 group-hover/owner:text-green-700">Property Owner</p>
                                    <p className="text-lg font-bold text-gray-900 truncate max-w-[12rem] group-hover/owner:text-green-800 underline-offset-2 group-hover/owner:underline">
                                        {property.profiles?.full_name || "Unknown Owner"}
                                    </p>
                                    <div className="flex items-center text-sm text-gray-600 mt-0.5 bg-white/60 inline-flex px-2 py-0.5 rounded-md border border-green-100/50">
                                        <Phone className="h-3.5 w-3.5 mr-2 text-green-600" />
                                        <span className="font-medium font-mono mr-2">{property.profiles?.phone_number || "No contact"}</span>
                                        {property.profiles?.phone_number && (
                                            <button
                                                onClick={handleCopyNumber}
                                                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                                                title="Copy phone number"
                                            >
                                                {isCopied ? (
                                                    <Check className="h-3.5 w-3.5 text-green-600" />
                                                ) : (
                                                    <Copy className="h-3.5 w-3.5 text-gray-400" />
                                                )}
                                            </button>
                                        )}
                                    </div>

                                    {/* Social Media Links relocated under phone number */}
                                    {property.profiles?.social_media?.[0] && (
                                        (property.profiles.social_media[0].facebook ||
                                            property.profiles.social_media[0].instagram ||
                                            property.profiles.social_media[0].tiktok)
                                    ) && (
                                            <div className="mt-3">
                                                <div className="flex flex-wrap gap-2">
                                                    {property.profiles.social_media[0].facebook && (
                                                        <a
                                                            href={`https://facebook.com/${property.profiles.social_media[0].facebook}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="bg-white px-2 py-1.5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:bg-blue-50 hover:-translate-y-0.5 transition-all group/fb flex items-center gap-1.5"
                                                            onClick={(e) => e.stopPropagation()}
                                                            title="Visit Facebook"
                                                        >
                                                            <Facebook className="h-3 w-3 text-gray-400 group-hover/fb:text-blue-600 transition-colors" />
                                                            <span className="text-[10px] font-medium text-gray-600 group-hover/fb:text-blue-700 truncate max-w-[70px]">{property.profiles.social_media[0].facebook}</span>
                                                        </a>
                                                    )}
                                                    {property.profiles.social_media[0].instagram && (
                                                        <a
                                                            href={`https://instagram.com/${property.profiles.social_media[0].instagram}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="bg-white px-2 py-1.5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:bg-pink-50 hover:-translate-y-0.5 transition-all group/ig flex items-center gap-1.5"
                                                            onClick={(e) => e.stopPropagation()}
                                                            title="Visit Instagram"
                                                        >
                                                            <Instagram className="h-3 w-3 text-gray-400 group-hover/ig:text-pink-600 transition-colors" />
                                                            <span className="text-[10px] font-medium text-gray-600 group-hover/ig:text-pink-700 truncate max-w-[70px]">{property.profiles.social_media[0].instagram}</span>
                                                        </a>
                                                    )}
                                                    {property.profiles.social_media[0].tiktok && (
                                                        <a
                                                            href={`https://tiktok.com/@${property.profiles.social_media[0].tiktok}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="bg-white px-2 py-1.5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:bg-gray-50 hover:-translate-y-0.5 transition-all group/tt flex items-center gap-1.5"
                                                            onClick={(e) => e.stopPropagation()}
                                                            title="Visit TikTok"
                                                        >
                                                            <Music2 className="h-3 w-3 text-gray-400 group-hover/tt:text-black transition-colors" />
                                                            <span className="text-[10px] font-medium text-gray-600 group-hover/tt:text-black truncate max-w-[70px]">{property.profiles.social_media[0].tiktok}</span>
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div >

            {/* Maximized Image Overlay */}
            {
                isMaximized && (
                    <div
                        className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4 animate-in fade-in duration-200"
                        onClick={() => setIsMaximized(false)}
                    >
                        {property.property_images && property.property_images.length > 0 && (
                            <div className="relative w-full h-full max-w-5xl max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                                <Image
                                    src={property.property_images[currentImageIndex].image_url}
                                    alt={property.title}
                                    fill
                                    className="object-contain"
                                    quality={100}
                                    priority
                                />

                                {property.property_images.length > 1 && (
                                    <>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setCurrentImageIndex(prev => prev === 0 ? property.property_images.length - 1 : prev - 1);
                                            }}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                                        >
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setCurrentImageIndex(prev => prev === property.property_images.length - 1 ? 0 : prev + 1);
                                            }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                                        >
                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                        </button>
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 bg-black/50 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                                            {currentImageIndex + 1} / {property.property_images.length}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsMaximized(false);
                            }}
                            className="absolute top-6 right-6 sm:top-4 sm:right-4 text-white bg-black/50 hover:bg-black/70 p-3 rounded-full transition-colors z-[101] backdrop-blur-sm border border-white/20 active:scale-95"
                            aria-label="Close full screen view"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                )
            }
        </>
    );
}
