"use client";

import { useState, useEffect, useRef } from "react";
import { Map, MapMarker, MarkerContent, type MapRef } from "@/components/ui/map";
import { getProperties } from "@/app/dashboard/property-actions";
import Image from "next/image";
import { X, Phone, MapPin, Search, Menu } from "lucide-react";


const styles = {
    default: undefined,
    openstreetmap: "https://tiles.openfreemap.org/styles/bright",
    openstreetmap3d: "https://tiles.openfreemap.org/styles/liberty",
};

type StyleKey = keyof typeof styles;

// Define Property Type based on the query
type Property = {
    id: string;
    title: string;
    description: string | null;
    price: number | null;
    address: string;
    latitude: number | null;
    longitude: number | null;
    status: string | null;
    available_slots: number | null;
    property_type: string;
    property_images: { image_url: string }[];
    profiles: {
        full_name: string | null;
        phone_number: string | null;
        avatar_url: string | null;
    } | null;
};

export function StayKoMap() {
    const mapRef = useRef<MapRef>(null);
    const [style, setStyle] = useState<StyleKey>("default");
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const selectedStyle = styles[style];
    const is3D = style === "openstreetmap3d";

    const [properties, setProperties] = useState<Property[]>([]);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isMaximized, setIsMaximized] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);


    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState("All");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");

    // Reset carousel when property changes
    useEffect(() => {
        setCurrentImageIndex(0);
    }, [selectedProperty]);

    // Get user's current location
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { longitude, latitude } = position.coords;
                    setUserLocation([longitude, latitude]);
                    // Center map on user's location
                    mapRef.current?.flyTo({ center: [longitude, latitude], zoom: 15, duration: 2000 });
                },
                (error) => {
                    // console.error("Error getting location:", error);
                }
            );
        }
    }, []);

    // Fetch properties
    useEffect(() => {
        const fetchProperties = async () => {
            const data = await getProperties();
            if (data) {
                // Cast data to Property type, assuming structure matches
                setProperties(data as any);
            }
        };
        fetchProperties();
    }, []);

    useEffect(() => {
        mapRef.current?.easeTo({ pitch: is3D ? 60 : 0, duration: 500 });
    }, [is3D]);

    const filteredProperties = properties.filter(property => {
        const matchesSearch =
            property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            property.address.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === "All" || property.property_type === filterType;
        const matchesMinPrice = minPrice === "" || (property.price !== null && property.price >= Number(minPrice));
        const matchesMaxPrice = maxPrice === "" || (property.price !== null && property.price <= Number(maxPrice));

        return matchesSearch && matchesType && matchesMinPrice && matchesMaxPrice;
    });

    return (
        <div className="absolute inset-0 w-full h-full">
            <Map
                ref={mapRef}
                center={[-0.1276, 51.5074]}
                zoom={14}
                theme="light"
                styles={
                    selectedStyle
                        ? { light: selectedStyle, dark: selectedStyle }
                        : undefined
                }
            >
                {/* User location marker */}
                {userLocation && (
                    <MapMarker longitude={userLocation[0]} latitude={userLocation[1]}>
                        <MarkerContent>
                            <div className="relative">
                                <div className="h-4 w-4 rounded-full bg-blue-500 border-2 border-white shadow-lg"></div>
                                <div className="absolute inset-0 h-4 w-4 rounded-full bg-blue-400 animate-ping"></div>
                            </div>
                        </MarkerContent>
                    </MapMarker>
                )}

                {/* Property Markers */}
                {filteredProperties.map((property) => (
                    property.latitude && property.longitude && (
                        <MapMarker
                            key={property.id}
                            longitude={property.longitude}
                            latitude={property.latitude}
                            onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProperty(property);
                                mapRef.current?.flyTo({ center: [property.longitude!, property.latitude!], zoom: 16, duration: 1500 });
                            }}
                        >
                            <MarkerContent>
                                <div className="group cursor-pointer transform transition-transform hover:scale-110">
                                    <div className="relative -mt-10 -ml-5">
                                        <MapPin className="h-10 w-10 text-red-600 fill-red-600 drop-shadow-xl" strokeWidth={1.5} />
                                        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                                            <div className="w-2 h-2 rounded-full bg-red-600"></div>
                                        </div>
                                    </div>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-white px-2 py-1 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                        <span className="text-xs font-bold text-gray-800">₱{property.price}</span>
                                    </div>
                                </div>
                            </MarkerContent>
                        </MapMarker>
                    )
                ))}
            </Map>

            {/* Search and Filter Panel */}
            <div className={`absolute top-4 left-4 z-10 flex flex-col gap-2 transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-full max-w-xs sm:max-w-sm max-h-[calc(100vh-2rem)]' : 'w-auto h-auto'}`}>

                {/* Toggle Button */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="bg-white p-2.5 rounded-xl shadow-md border border-gray-100 hover:bg-gray-50 transition-colors self-start focus:outline-none focus:ring-2 focus:ring-green-500/50"
                    aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
                >
                    {isSidebarOpen ? <X className="h-5 w-5 text-gray-700" /> : <Menu className="h-5 w-5 text-gray-700" />}
                </button>

                {isSidebarOpen && (
                    <>
                        <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-lg border border-gray-100/50 flex-shrink-0 animate-in slide-in-from-left-5 duration-200">
                            <div className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black" />
                                <input
                                    type="text"
                                    placeholder="Search by place or title..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all"
                                />
                            </div>

                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                                {["All", "Boarding House", "House for rent", "House and lot for sale", "Lot for sale"].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setFilterType(type)}
                                        className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterType === type
                                            ? "bg-green-600 text-white shadow-md shadow-green-200"
                                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-1">
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black text-xs">₱</span>
                                    <input
                                        type="number"
                                        placeholder="Min Price"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(e.target.value)}
                                        className="w-full pl-7 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                                    />
                                </div>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black text-xs">₱</span>
                                    <input
                                        type="number"
                                        placeholder="Max Price"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(e.target.value)}
                                        className="w-full pl-7 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500/50"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Search Results List (Google Maps Style) */}
                        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex-col flex min-h-0 transition-all duration-300 ease-in-out animate-in slide-in-from-left-5 duration-200 delay-75">

                            <div className="overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-200">
                                {filteredProperties.length > 0 ? (
                                    filteredProperties.map(property => (
                                        <div
                                            key={property.id}
                                            onClick={() => {
                                                setSelectedProperty(property);
                                                mapRef.current?.flyTo({ center: [property.longitude!, property.latitude!], zoom: 16, duration: 1500 });
                                                // Optional: Close sidebar on mobile when selecting? keeping open for now
                                            }}
                                            className="flex gap-3 p-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                                        >
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <h4 className="font-bold text-sm text-gray-900 truncate">{property.title}</h4>
                                                <div className="flex items-center gap-1 mt-0.5">


                                                    <span className="text-xs text-gray-500 truncate">{property.property_type}</span>
                                                </div>
                                                <p className="text-xs text-gray-500 truncate mt-0.5">{property.address}</p>
                                                <p className="text-xs font-bold text-green-600 mt-1">₱{property.price}</p>

                                                <div className="flex gap-1 mt-1.5">
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${property.status === 'available'
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-red-100 text-red-700'
                                                        }`}>
                                                        {property.status === 'available' ? 'Available' : 'Booked'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                                {property.property_images?.[0] ? (
                                                    <Image
                                                        src={property.property_images[0].image_url}
                                                        alt={property.title}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex items-center justify-center h-full text-gray-300">
                                                        <MapPin className="h-6 w-6" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-gray-500">
                                        <p className="text-sm font-medium">No results found</p>
                                        <p className="text-xs opacity-70">Try adjusting your filters</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="absolute top-4 right-4 z-10 flex gap-2">
                <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value as StyleKey)}
                    className="bg-white/90 backdrop-blur-sm text-gray-900 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium shadow-md hover:shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
                >
                    <option value="default">Default Map</option>
                    <option value="openstreetmap">OpenStreetMap</option>
                    <option value="openstreetmap3d">3D Map</option>
                </select>
            </div>

            {/* Property Details Modal */}
            {selectedProperty && (
                <div
                    className="absolute z-20 
                        bottom-0 left-0 right-0 p-4 sm:p-0
                        sm:top-4 sm:right-4 sm:left-auto sm:bottom-auto 
                        w-full sm:w-[24rem] sm:max-w-md"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-5 fade-in duration-300 sm:slide-in-from-right-5">
                        <div className="relative h-56 w-full bg-gray-100 group cursor-pointer" onClick={() => setIsMaximized(true)}>
                            {selectedProperty.property_images && selectedProperty.property_images.length > 0 ? (
                                <>
                                    <Image
                                        src={selectedProperty.property_images[currentImageIndex].image_url}
                                        alt={selectedProperty.title}
                                        fill
                                        className="object-cover transition-opacity duration-300 group-hover:opacity-90"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                        <span className="bg-black/50 text-white px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-sm">View Photos</span>
                                    </div>
                                    {selectedProperty.property_images.length > 1 && (
                                        <>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCurrentImageIndex(prev => prev === 0 ? selectedProperty.property_images.length - 1 : prev - 1);
                                                }}
                                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1.5 rounded-full backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100 placeholder-button"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setCurrentImageIndex(prev => prev === selectedProperty.property_images.length - 1 ? 0 : prev + 1);
                                                }}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1.5 rounded-full backdrop-blur-sm transition-colors opacity-0 group-hover:opacity-100 placeholder-button"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                            </button>
                                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                                                {selectedProperty.property_images.map((_, idx) => (
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
                                    setSelectedProperty(null);
                                }}
                                className="absolute top-3 right-3 bg-white/90 p-1.5 rounded-full text-gray-600 hover:text-black hover:bg-white shadow-sm transition-colors z-10"
                            >
                                <X className="h-4 w-4" />
                            </button>
                            <div className="absolute top-3 left-3 bg-green-600/90 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-white shadow-sm flex items-center">
                                <span className={`w-2 h-2 rounded-full mr-2 ${selectedProperty.status === 'available' ? 'bg-green-300' : 'bg-red-400'}`}></span>
                                {selectedProperty.status === 'available' ? 'Available' : selectedProperty.status}
                            </div>
                        </div>

                        <div className="p-5 overflow-y-auto max-h-[60vh] sm:max-h-[calc(100vh-20rem)] scrollbar-hide">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-xl text-gray-900 leading-tight">{selectedProperty.title}</h3>
                                <div className="text-right">
                                    <span className="block text-lg font-bold text-green-700">₱{selectedProperty.price}</span>

                                </div>
                            </div>

                            <div className="flex items-center text-xs text-black mb-4 bg-gray-50 p-2 rounded-lg">
                                <MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
                                <span className="line-clamp-1">{selectedProperty.address}</span>
                            </div>

                            <p className="text-sm text-black mb-4 leading-relaxed">Description: <br /> {selectedProperty.description || 'No description available'}</p>

                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <div className="bg-gray-50 p-2.5 rounded-xl text-center">
                                    <span className="block text-xs text-gray-400 uppercase tracking-wider font-semibold">Slots</span>
                                    <span className="block text-sm font-bold text-gray-800">{selectedProperty.available_slots}</span>
                                </div>
                                <div className="bg-gray-50 p-2.5 rounded-xl text-center">
                                    <span className="block text-xs text-gray-400 uppercase tracking-wider font-semibold">Type</span>
                                    <span className="block text-sm font-bold text-gray-800 capitalize">{selectedProperty.property_type}</span>
                                </div>
                            </div>

                            <div className="bg-green-50/50 rounded-xl p-4 border border-green-100">
                                <div className="flex items-center gap-4">
                                    <div className="relative h-14 w-14 rounded-full bg-white ring-2 ring-white shadow-md overflow-hidden flex-shrink-0">
                                        {selectedProperty.profiles?.avatar_url ? (
                                            <Image
                                                src={selectedProperty.profiles.avatar_url}
                                                alt={selectedProperty.profiles.full_name || "Owner"}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-green-100 text-green-700 font-bold text-lg">
                                                {selectedProperty.profiles?.full_name?.charAt(0).toUpperCase() || "U"}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs text-green-600 font-bold uppercase tracking-wide mb-0.5">Property Owner</p>
                                        <p className="text-lg font-bold text-gray-900 truncate max-w-[12rem]">
                                            {selectedProperty.profiles?.full_name || "Unknown Owner"}
                                        </p>
                                        <div className="flex items-center text-sm text-gray-600 mt-0.5 bg-white/60 inline-flex px-2 py-0.5 rounded-md border border-green-100/50">
                                            <Phone className="h-3.5 w-3.5 mr-2 text-green-600" />
                                            <span className="font-medium font-mono">{selectedProperty.profiles?.phone_number || "No contact"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Maximized Image Overlay */}
            {selectedProperty && isMaximized && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
                    onClick={() => setIsMaximized(false)}
                >
                    <button
                        onClick={() => setIsMaximized(false)}
                        className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>

                    {selectedProperty.property_images && selectedProperty.property_images.length > 0 && (
                        <div className="relative w-full h-full max-w-5xl max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                            <Image
                                src={selectedProperty.property_images[currentImageIndex].image_url}
                                alt={selectedProperty.title}
                                fill
                                className="object-contain"
                                quality={100}
                                priority
                            />

                            {selectedProperty.property_images.length > 1 && (
                                <>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentImageIndex(prev => prev === 0 ? selectedProperty.property_images.length - 1 : prev - 1);
                                        }}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                                    >
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentImageIndex(prev => prev === selectedProperty.property_images.length - 1 ? 0 : prev + 1);
                                        }}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
                                    >
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 bg-black/50 px-3 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
                                        {currentImageIndex + 1} / {selectedProperty.property_images.length}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
