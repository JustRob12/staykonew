'use client'

import { useState, useEffect } from 'react'
import { createProperty, updateProperty } from '@/app/dashboard/property-actions'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Plus, X, Upload, Loader2, MapPin, Pencil, RotateCcw, RefreshCw } from 'lucide-react'

import Image from 'next/image'
import { Map, MapMarker, MarkerContent, MapRoute, useMap } from '@/components/ui/map'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

// Define a minimal Property type for editing props
export type Property = {
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
};

function SubmitButton({ isEditing }: { isEditing: boolean }) {
    const { pending } = useFormStatus()

    return (
        <Button type="submit" disabled={pending} className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto rounded-xl">
            {pending ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditing ? 'Updating...' : 'Creating...'}
                </>
            ) : (
                isEditing ? 'Update Property' : 'List Property'
            )}
        </Button>
    )
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (loc: [number, number]) => void }) {
    const { map } = useMap();
    useEffect(() => {
        if (!map) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleClick = (e: any) => {
            onLocationSelect([e.lngLat.lng, e.lngLat.lat]);
        };

        map.on('click', handleClick);
        map.getCanvas().style.cursor = 'crosshair';

        return () => {
            map.off('click', handleClick);
            map.getCanvas().style.cursor = '';
        };
    }, [map, onLocationSelect]);
    return null;
}

interface AddPropertyModalProps {
    property?: Property;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactNode;
}

export function AddPropertyModal({ property, open: controlledOpen, onOpenChange: controlledOnOpenChange, trigger }: AddPropertyModalProps) {
    const [internalOpen, setInternalOpen] = useState(false)
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : internalOpen;
    const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen;

    const [images, setImages] = useState<string[]>([])
    const [uploading, setUploading] = useState(false)
    const [location, setLocation] = useState<[number, number] | null>(null)
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null)
    const [address, setAddress] = useState('')
    const [isAddressLoading, setIsAddressLoading] = useState(false)
    const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
    const [routeDistance, setRouteDistance] = useState<string | null>(null);
    const [routeDuration, setRouteDuration] = useState<string | null>(null);
    const [isRoutingLoading, setIsRoutingLoading] = useState(false);
    const [mapKey, setMapKey] = useState(0);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

    // Pre-fill data if property provided and open
    useEffect(() => {
        if (open && property) {
            setImages(property.property_images?.map(img => img.image_url) || [])
            if (property.longitude && property.latitude) {
                setLocation([property.longitude, property.latitude])
            }
            setAddress(property.address || '')
        } else if (open && !property) {
            // Reset if opening in create mode (optional, but good practice if checking user location)
            if ("geolocation" in navigator && !location) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { longitude, latitude } = position.coords;
                        setUserLocation([longitude, latitude]);
                        if (!location) setLocation([longitude, latitude]);
                    },
                    // (error) => console.error("Error getting location:", error)
                );
            }
        }
    }, [open, property]); // Remove location dependency to avoid reset loops

    // Reset when closed
    useEffect(() => {
        if (!open && !property) {
            setImages([])
            setLocation(null)
            setAddress('')
            setRouteCoordinates([])
            setRouteDistance(null)
            setRouteDuration(null)
        }
    }, [open, property])

    // Reverse Geocoding Effect
    useEffect(() => {
        if (location) {
            const fetchAddress = async () => {
                setIsAddressLoading(true)
                try {
                    // Using a more reliable geocoding service or handling CORS
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location[1]}&lon=${location[0]}`, {
                        headers: {
                            'User-Agent': 'StayKo/1.0'
                        }
                    })

                    if (!response.ok) {
                        throw new Error('Geocoding service unavailable')
                    }

                    const data = await response.json()
                    if (data.display_name) {
                        setAddress(data.display_name)
                    }
                } catch (error) {
                    console.warn("Reverse geocoding failed (CORS or rate limit). Please enter address manually:", error)
                    // Don't block user - they can enter address manually
                    // Optionally set a placeholder or default
                    if (!address) {
                        setAddress(`Lat: ${location[1].toFixed(4)}, Lon: ${location[0].toFixed(4)}`)
                    }
                } finally {
                    setIsAddressLoading(false)
                }
            }
            fetchAddress()
        }
    }, [location])

    // Routing Effect for AddPropertyModal
    useEffect(() => {
        const fetchRoute = async () => {
            if (!location || !userLocation) {
                setRouteCoordinates([]);
                setRouteDistance(null);
                return;
            }

            setIsRoutingLoading(true);
            try {
                const response = await fetch(
                    `https://router.project-osrm.org/route/v1/driving/${userLocation[0]},${userLocation[1]};${location[0]},${location[1]}?overview=full&geometries=geojson`
                );
                const data = await response.json();

                if (data.routes && data.routes.length > 0) {
                    const route = data.routes[0];
                    setRouteCoordinates(route.geometry.coordinates);

                    const distanceInKm = (route.distance / 1000).toFixed(1);
                    setRouteDistance(`${distanceInKm} km`);

                    const durationInMin = Math.round(route.duration / 60);
                    setRouteDuration(`${durationInMin} min`);
                }
            } catch (error) {
                console.error("Error fetching route:", error);
            } finally {
                setIsRoutingLoading(false);
            }
        };

        fetchRoute();
    }, [location, userLocation]);


    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setUploading(true)
        const newImages = [...images]

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i]
                const formData = new FormData()
                formData.append('file', file)
                formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!)

                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
                    {
                        method: 'POST',
                        body: formData,
                    }
                )

                if (!response.ok) {
                    console.error('Upload failed for file', file.name)
                    continue
                }

                const data = await response.json()
                newImages.push(data.secure_url)
            }
            setImages(newImages)
        } catch (error) {
            console.error('Upload error:', error)
            alert("Failed to upload images. Please try again.")
        } finally {
            setUploading(false)
        }
    }

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index))
    }

    async function clientAction(formData: FormData) {
        if (images.length === 0 && !property) {
            alert("Please upload at least one image.")
            return
        }

        if (!location) {
            alert("Please select a location on the map.")
            return
        }

        // Show confirmation dialog instead of executing immediately
        formData.append('image_urls', JSON.stringify(images))
        if (property) {
            formData.append('property_id', property.id)
        }
        setPendingFormData(formData)
        setShowConfirmDialog(true)
    }

    const handleConfirmSubmit = async () => {
        if (!pendingFormData) return

        const action = property ? updateProperty : createProperty;
        // @ts-ignore
        const result = await action({}, pendingFormData)

        if (result?.error) {
            alert(result.error)
        } else {
            setOpen(false)
            if (!property) {
                setImages([])
                setLocation(null)
            }
        }
        setPendingFormData(null)
    }

    const handleUseCurrentLocation = (e: React.MouseEvent) => {
        e.preventDefault();

        // If we already have the user's location stored from initial load, use it
        if (userLocation) {
            setLocation(userLocation);
            return;
        }

        // Otherwise try to get it again
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { longitude, latitude } = position.coords;
                    const newLocation: [number, number] = [longitude, latitude];
                    setUserLocation(newLocation);
                    setLocation(newLocation);
                },
                (error) => {
                    // console.error("Error getting location:", error);
                    // Silent fail or just log? User asked for "Reset" which implies simple action.
                    // But if it fails, maybe we just reset to default map center?
                    // Let's reset to default map center if geolocation fails completely
                    // setLocation([-0.1276, 51.5074]); // Default fallback
                }
            );
        } else {
            setLocation([120.9842, 14.5995]); // Default fallback
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-green-600 hover:bg-green-700 text-white shadow-sm font-semibold rounded-xl px-3 sm:px-4">
                        <Plus className="h-5 w-5 sm:mr-2 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Add Property</span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white border-none shadow-2xl rounded-2xl p-0 gap-0">
                <DialogHeader className="p-6 border-b border-gray-100 bg-white sticky top-0 z-10">
                    <DialogTitle className="text-2xl font-bold text-gray-900">{property ? 'Edit Property' : 'List Your Property'}</DialogTitle>
                    <DialogDescription className="text-gray-500 mt-1">
                        {property ? 'Update property details.' : 'Share your space with the StayKo community.'}
                    </DialogDescription>
                </DialogHeader>

                <form key={open ? 'open' : 'closed'} action={clientAction} className="grid gap-6 p-6">
                    <input type="hidden" name="latitude" value={location ? location[1] : ''} />
                    <input type="hidden" name="longitude" value={location ? location[0] : ''} />

                    <div className="grid gap-2">
                        <Label htmlFor="title" className="text-gray-900 font-medium">Property Title</Label>
                        <Input
                            id="title"
                            name="title"
                            defaultValue={property?.title}
                            placeholder="e.g. Cozy City Apartment"
                            required
                            className="bg-white text-gray-900 border-gray-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="property_type" className="text-black font-medium">Type</Label>
                            <Select name="property_type" required defaultValue={property?.property_type || "Boarding House"}>
                                <SelectTrigger className="bg-white text-black border-gray-200 focus:ring-green-500/20 rounded-xl">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-gray-200 shadow-lg rounded-xl">
                                    <SelectItem value="Boarding House">Boarding House</SelectItem>
                                    <SelectItem value="House for rent">House for rent</SelectItem>
                                    <SelectItem value="House and lot for sale">House and lot for sale</SelectItem>
                                    <SelectItem value="Lot for sale">Lot for sale</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="price" className="text-black font-medium">Price</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₱</span>
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    min="0"
                                    defaultValue={property?.price || ''}
                                    placeholder="0.00"
                                    required
                                    className="pl-7 bg-white text-gray-900 border-gray-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="address" className="text-gray-900 font-medium">Address</Label>
                        <div className="relative">
                            <Input
                                id="address"
                                name="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Full address"
                                required
                                className="bg-white text-gray-900 border-gray-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl pr-10"
                            />
                            {isAddressLoading && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Location Picker Map */}
                    <div className="grid gap-2">
                        <div className="flex justify-between items-center">
                            <Label className="text-gray-900 font-medium">Location</Label>
                            {routeDistance && (
                                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                    {routeDistance} from current location
                                </span>
                            )}
                        </div>
                        <div className="h-64 rounded-xl overflow-hidden border border-gray-200 relative">
                            <div className="absolute top-3 right-3 z-10 flex gap-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    className="bg-white/90 hover:bg-white text-gray-700 shadow-md font-medium text-xs backdrop-blur-sm"
                                    onClick={() => setMapKey(prev => prev + 1)}
                                >
                                    <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-blue-600" /> Refresh
                                </Button>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    className="bg-white/90 hover:bg-white text-gray-700 shadow-md font-medium text-xs backdrop-blur-sm"
                                    onClick={handleUseCurrentLocation}
                                >
                                    <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-green-600" /> Reset
                                </Button>
                            </div>
                            <Map
                                key={mapKey}
                                center={location || userLocation || [120.9842, 14.5995]}
                                zoom={13}
                                theme="light"
                                styles={{ light: "https://tiles.openfreemap.org/styles/bright", dark: "https://tiles.openfreemap.org/styles/bright" }}
                            >
                                <MapClickHandler onLocationSelect={setLocation} />
                                {location && (
                                    <>
                                        <MapMarker longitude={location[0]} latitude={location[1]}>
                                            <MarkerContent>
                                                <div className="relative -mt-8 -ml-4">
                                                    <MapPin className="h-8 w-8 text-red-500 fill-red-500 drop-shadow-md" />
                                                </div>
                                            </MarkerContent>
                                        </MapMarker>

                                        {/* Floating Badge in Picker Modal */}
                                        {routeDistance && routeDuration && (
                                            <MapMarker
                                                longitude={location[0]}
                                                latitude={location[1]}
                                                anchor="bottom"
                                                offset={[0, -40]}
                                            >
                                                <MarkerContent>
                                                    <div className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg shadow-lg border border-green-100 flex flex-col items-center animate-in fade-in zoom-in duration-300 pointer-events-none">
                                                        <span className="text-[10px] font-bold text-green-700 leading-tight">
                                                            {routeDistance}
                                                        </span>
                                                        <span className="text-[10px] font-medium text-gray-500 leading-tight">
                                                            {routeDuration}
                                                        </span>
                                                    </div>
                                                </MarkerContent>
                                            </MapMarker>
                                        )}
                                    </>
                                )}
                                {routeCoordinates.length > 0 && (
                                    <MapRoute
                                        coordinates={routeCoordinates}
                                        color="#22c55e"
                                        width={4}
                                        opacity={0.8}
                                    />
                                )}
                            </Map>
                            {!location && (
                                <div className="absolute inset-0 bg-black/5 pointer-events-none flex items-center justify-center">
                                    <span className="bg-white/90 px-3 py-1 rounded-full text-xs font-medium text-gray-600 shadow-sm">
                                        Click map to set location
                                    </span>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-500">Click on the map to pinpoint your property.</p>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description" className="text-gray-900 font-medium">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            defaultValue={property?.description || ''}
                            placeholder="Describe your property..."
                            rows={4}
                            required
                            className="bg-white text-gray-900 border-gray-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl resize-none"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="available_slots" className="text-gray-900 font-medium">Available Slots (Guests)</Label>
                        <Input
                            id="available_slots"
                            name="available_slots"
                            type="number"
                            min="1"
                            defaultValue={property?.available_slots || "2"}
                            required
                            className="bg-white text-gray-900 border-gray-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label className="text-gray-900 font-medium">Property Images</Label>
                        <div className="grid grid-cols-3 gap-3 mt-2">
                            {images.map((url, index) => (
                                <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group shadow-sm">
                                    <Image src={url} alt={`Property ${index + 1}`} fill className="object-cover transition-transform group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 bg-white/90 text-red-500 hover:text-red-600 hover:bg-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all shadow-sm transform scale-90 group-hover:scale-100"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}

                            <label
                                className={`flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 hover:border-green-500 hover:bg-green-50/50 cursor-pointer transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                                {uploading ? (
                                    <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
                                ) : (
                                    <>
                                        <div className="bg-white p-2 rounded-full shadow-sm mb-2 border border-gray-100">
                                            <Upload className="h-5 w-5 text-green-600" />
                                        </div>
                                        <span className="text-xs text-gray-600 font-semibold">Add Photos</span>
                                    </>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                />
                            </label>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            Upload at least one high-quality image of your property.
                        </p>
                    </div>

                    <DialogFooter className="mt-2 pt-4 border-t border-gray-100">
                        <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="mr-2 hover:bg-gray-100/80 rounded-xl font-medium text-gray-600">Cancel</Button>
                        <Button
                            type="submit"
                            disabled={uploading}
                            className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-8 font-medium shadow-sm"
                        >
                            {property ? 'Save Changes' : 'List Property'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>

            {/* Confirmation Dialog */}
            <ConfirmDialog
                open={showConfirmDialog}
                onOpenChange={setShowConfirmDialog}
                title={property ? "Confirm Changes" : "List Property"}
                description={
                    property
                        ? "Are you sure you want to save these changes to your property?"
                        : "Are you sure you want to list this property? It will be visible to all users."
                }
                confirmText={property ? "Save Changes" : "List Property"}
                cancelText="Cancel"
                onConfirm={handleConfirmSubmit}
                variant="default"
            />
        </Dialog>
    )
}
