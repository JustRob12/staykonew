"use client";

import { useState, useEffect, useRef } from "react";
import { Map, MapMarker, MarkerContent, MapRoute, type MapRef } from "@/components/ui/map";
import { getProperties } from "@/app/dashboard/property-actions";
import Image from "next/image";
import { X, Phone, MapPin, Search, Menu } from "lucide-react";
import { PropertyDesc } from "./PropertyDesc";


const styles = {
    default: undefined,
    openstreetmap: "https://tiles.openfreemap.org/styles/bright",
    openstreetmap3d: "https://tiles.openfreemap.org/styles/liberty",
};

type StyleKey = keyof typeof styles;

// Define Property Type based on the query
export type Property = {
    id: string;
    user_id: string;
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
        social_media?: {
            tiktok: string | null;
            facebook: string | null;
            instagram: string | null;
        }[];
    } | null;
};

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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
    const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
    const [routeDistance, setRouteDistance] = useState<string | null>(null);
    const [routeDuration, setRouteDuration] = useState<string | null>(null);
    const [isRoutingLoading, setIsRoutingLoading] = useState(false);
    const [routedProperty, setRoutedProperty] = useState<Property | null>(null);


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
                setProperties(data as any);
            }
        };
        fetchProperties();
    }, []);

    // Handle routing when property is selected
    useEffect(() => {
        const fetchRoute = async () => {
            if (!selectedProperty || !userLocation || !selectedProperty.latitude || !selectedProperty.longitude) {
                // We DON'T clear coordinates here to persist the line when modal closes
                return;
            }

            // If we already have a route for this property, don't refetch
            if (routedProperty?.id === selectedProperty.id) return;

            setIsRoutingLoading(true);
            try {
                const response = await fetch(
                    `https://router.project-osrm.org/route/v1/driving/${userLocation[0]},${userLocation[1]};${selectedProperty.longitude},${selectedProperty.latitude}?overview=full&geometries=geojson`
                );
                const data = await response.json();

                if (data.routes && data.routes.length > 0) {
                    const route = data.routes[0];
                    setRouteCoordinates(route.geometry.coordinates);

                    // Convert distance from meters to km
                    const distanceInKm = (route.distance / 1000).toFixed(1);
                    setRouteDistance(`${distanceInKm} km`);

                    // Convert duration from seconds to minutes
                    const durationInMin = Math.round(route.duration / 60);
                    setRouteDuration(`${durationInMin} min`);

                    setRoutedProperty(selectedProperty);
                }
            } catch (error) {
                console.error("Error fetching route:", error);
            } finally {
                setIsRoutingLoading(false);
            }
        };

        fetchRoute();
    }, [selectedProperty, userLocation, routedProperty]);

    const handleClearRoute = () => {
        setRouteCoordinates([]);
        setRouteDistance(null);
        setRouteDuration(null);
        setRoutedProperty(null);
    };

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

                {/* Road following route */}
                {routeCoordinates.length > 0 && (
                    <>
                        <MapRoute
                            coordinates={routeCoordinates}
                            color="#22c55e" // Green
                            width={4}
                            opacity={0.8}
                        />
                        {/* Floating Time/Distance Badge at destination */}
                        {routedProperty && routedProperty.latitude && routedProperty.longitude && (
                            <MapMarker
                                longitude={routedProperty.longitude}
                                latitude={routedProperty.latitude}
                                anchor="bottom"
                                offset={[0, -50]} // Move above the pin
                            >
                                <MarkerContent>
                                    <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg border border-green-100 flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-green-700 leading-tight">
                                                {routeDistance}
                                            </span>
                                            <span className="text-[10px] font-medium text-gray-500 leading-tight">
                                                {routeDuration}
                                            </span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleClearRoute();
                                            }}
                                            className="ml-1 p-0.5 hover:bg-gray-100 rounded-full transition-colors"
                                        >
                                            <X className="h-3 w-3 text-gray-400" />
                                        </button>
                                    </div>
                                </MarkerContent>
                            </MapMarker>
                        )}
                    </>
                )}
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
                        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex flex-col min-h-0 flex-1 transition-all duration-300 ease-in-out animate-in slide-in-from-left-5 duration-200 delay-75">
                            <div className="overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-gray-200 flex-1">
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

            <div className="absolute top-4 right-4 z-10">
                <Select value={style} onValueChange={(value) => setStyle(value as StyleKey)}>
                    <SelectTrigger className="w-40 bg-white/90 backdrop-blur-sm text-gray-900 border-gray-200 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all">
                        <SelectValue placeholder="Map Style" />
                    </SelectTrigger>
                    <SelectContent position="popper" align="end" className="bg-white/95 backdrop-blur-md border-gray-100 rounded-xl shadow-xl">
                        <SelectItem value="default" className="text-xs font-medium focus:bg-green-50">Default Map</SelectItem>
                        <SelectItem value="openstreetmap" className="text-xs font-medium focus:bg-green-50">OpenStreetMap</SelectItem>
                        <SelectItem value="openstreetmap3d" className="text-xs font-medium focus:bg-green-50">3D Map</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Property Details Modal */}
            {selectedProperty && (
                <PropertyDesc
                    property={selectedProperty}
                    onClose={() => setSelectedProperty(null)}
                    isMaximized={isMaximized}
                    setIsMaximized={setIsMaximized}
                    currentImageIndex={currentImageIndex}
                    setCurrentImageIndex={setCurrentImageIndex}
                    routeDistance={routeDistance}
                />
            )}
        </div>
    );
}
