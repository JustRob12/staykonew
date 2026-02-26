"use client"

import { useState, useEffect } from 'react'
import { createProperty, updateProperty } from '@/app/dashboard/property-actions'
import { Button } from '@/components/ui/button'
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
import { Plus, X, Upload, Loader2, MapPin, RotateCcw, RefreshCw, Check } from 'lucide-react'
import Image from 'next/image'
import { Map, MapMarker, MarkerContent, MapRoute, useMap } from '@/components/ui/map'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

// Define Property Type
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

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (loc: [number, number]) => void }) {
    const { map } = useMap();
    useEffect(() => {
        if (!map) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleClick = (e: any) => {
            const { lng, lat } = e.lngLat;

            // Philippines bounds validation
            // Bounds: [116.5, 4.3, 126.7, 21.2]
            const isInsidePhilippines =
                lng >= 116.5 && lng <= 126.7 &&
                lat >= 4.3 && lat <= 21.2;

            if (!isInsidePhilippines) {
                alert("Please select a location within the Philippines.");
                return;
            }

            onLocationSelect([lng, lat]);
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

interface PropertyFormProps {
    property?: Property;
    onSuccess: () => void;
    onCancel: () => void;
}

export function PropertyForm({ property, onSuccess, onCancel }: PropertyFormProps) {
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
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Stepper State
    const [currentStep, setCurrentStep] = useState(1);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Validation State
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [validationMessage, setValidationMessage] = useState("");

    // Form inputs state for validation
    const [title, setTitle] = useState(property?.title || '');
    const [propertyType, setPropertyType] = useState(property?.property_type || "Boarding House");
    const [price, setPrice] = useState(property?.price?.toString() || '');
    const [description, setDescription] = useState(property?.description || '');
    const [availableSlots, setAvailableSlots] = useState(property?.available_slots?.toString() || "2");

    // Pre-fill data if property provided
    useEffect(() => {
        if (property) {
            setImages(property.property_images?.map(img => img.image_url) || [])
            if (property.longitude && property.latitude) {
                setLocation([property.longitude, property.latitude])
            }
            setAddress(property.address || '')
            setTitle(property.title);
            setPropertyType(property.property_type);
            setPrice(property.price?.toString() || '');
            setDescription(property.description || '');
            setAvailableSlots(property.available_slots?.toString() || "2");
        } else {
            // Initial user location for new property
            if ("geolocation" in navigator && !location) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { longitude, latitude } = position.coords;
                        setUserLocation([longitude, latitude]);
                        if (!location) setLocation([longitude, latitude]);
                    },
                    (error) => {
                        console.error("Error getting location:", error);
                    }
                );
            }
        }
    }, [property]);

    // Reverse Geocoding Effect
    useEffect(() => {
        if (location) {
            const fetchAddress = async () => {
                setIsAddressLoading(true)
                try {
                    // Try Nominatim first
                    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location[1]}&lon=${location[0]}`, {
                        headers: {
                            'User-Agent': 'StayKo/1.0 (contact@stayko.com)' // More descriptive User-Agent
                        }
                    })

                    if (response.ok) {
                        const data = await response.json()
                        if (data.display_name) {
                            setAddress(data.display_name)
                            return // Success, exit
                        }
                    }

                    // Fallback to BigDataCloud's free reverse geocoding API if Nominatim fails
                    const fallbackResponse = await fetch(
                        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${location[1]}&longitude=${location[0]}&localityLanguage=en`
                    )

                    if (fallbackResponse.ok) {
                        const data = await fallbackResponse.json()
                        // Construct address from components
                        const addressParts = [
                            data.locality,
                            data.city,
                            data.principalSubdivision,
                            data.countryName
                        ].filter(Boolean)

                        if (addressParts.length > 0) {
                            setAddress(addressParts.join(', '))
                            return
                        }
                    }

                    throw new Error('All geocoding services failed')
                } catch (error) {
                    console.warn("Reverse geocoding failed", error)
                    // Only set coordinates if address is effectively empty
                    // This prevents overwriting a manually entered address if the user is just adjusting the pin slightly and it fails
                    // But here we want to show *something* if they just clicked the map
                    if (!address) {
                        // Don't set Lat/Lon as it confuses users. Let them enter it manually.
                        // setAddress(`Lat: ${location[1].toFixed(4)}, Lon: ${location[0].toFixed(4)}`)
                    }
                } finally {
                    setIsAddressLoading(false)
                }
            }
            fetchAddress()
        }
    }, [location])

    // Routing Effect
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

                if (!response.ok) continue

                const data = await response.json()
                newImages.push(data.secure_url)
            }
            setImages(newImages)
        } catch (error) {
            console.error('Upload error:', error)
            alert("Failed to upload images.")
        } finally {
            setUploading(false)
        }
    }

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index))
    }

    // Step Validation Logic
    const validateStep = (step: number) => {
        if (step === 1) {
            if (!title) return "Please enter a property title.";
            if (!price) return "Please enter a price.";
            if (!description) return "Please enter a description.";
            if (!availableSlots) return "Please enter available slots.";
            return null;
        }
        if (step === 2) {
            if (!location) return "Please select a location on the map.";
            if (!address) return "Please ensure the address is set.";
            const [lng, lat] = location;
            const isInsidePhilippines =
                lng >= 116.5 && lng <= 126.7 &&
                lat >= 4.3 && lat <= 21.2;

            if (!isInsidePhilippines) {
                // Warn but don't block
            }
            return null;
        }
        if (step === 3) {
            if (images.length === 0 && !property) return "Please upload at least one image.";
            return null;
        }
        return null;
    }

    const [isStepTransitioning, setIsStepTransitioning] = useState(false);

    const handleNext = () => {
        if (isStepTransitioning) return;

        const error = validateStep(currentStep);
        if (error) {
            setValidationMessage(error);
            setShowValidationModal(true);
            return;
        }

        setIsStepTransitioning(true);
        setCurrentStep(prev => Math.min(prev + 1, 3));

        // Prevent accidental double-clicks or fast interactions
        setTimeout(() => setIsStepTransitioning(false), 500);
    }

    const handleBack = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    }

    // Prepare data for submission
    const handleFinalSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Prevent accidental submission using Enter key on earlier steps
        // or fast double-clicks on the Next button
        if (currentStep !== 3 || isStepTransitioning) {
            if (currentStep < 3 && !isStepTransitioning) {
                handleNext();
            }
            return;
        }

        const error = validateStep(3);
        if (error) {
            setValidationMessage(error);
            setShowValidationModal(true);
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('property_type', propertyType);
        formData.append('price', price);
        formData.append('description', description);
        formData.append('available_slots', availableSlots);
        formData.append('address', address);
        if (location) {
            formData.append('longitude', location[0].toString());
            formData.append('latitude', location[1].toString());
        }
        formData.append('image_urls', JSON.stringify(images));

        if (property) {
            formData.append('property_id', property.id);
        }

        setPendingFormData(formData);
        setShowConfirmDialog(true);
    }

    const handleConfirmSubmit = async () => {
        if (!pendingFormData) return

        setIsSubmitting(true)
        try {
            const action = property ? updateProperty : createProperty;
            // @ts-ignore
            const result = await action({}, pendingFormData)

            if (result?.error) {
                alert(result.error)
            } else {
                setShowConfirmDialog(false);
                setShowSuccessModal(true); // Show success modal instead of immediate onSuccess
            }
        } finally {
            setPendingFormData(null)
            setIsSubmitting(false)
        }
    }

    const handleUseCurrentLocation = (e: React.MouseEvent) => {
        e.preventDefault();

        if (userLocation) {
            const [lng, lat] = userLocation;
            const isInsidePhilippines =
                lng >= 116.5 && lng <= 126.7 &&
                lat >= 4.3 && lat <= 21.2;

            if (isInsidePhilippines) {
                setLocation(userLocation);
            } else {
                alert("Your current location is outside the Philippines.");
            }
            return;
        }

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { longitude, latitude } = position.coords;

                    const isInsidePhilippines =
                        longitude >= 116.5 && longitude <= 126.7 &&
                        latitude >= 4.3 && latitude <= 21.2;

                    if (!isInsidePhilippines) {
                        alert("Your current location is outside the Philippines.");
                        return;
                    }

                    const newLocation: [number, number] = [longitude, latitude];
                    setUserLocation(newLocation);
                    setLocation(newLocation);
                },
                (error) => {
                    alert("Could not get your location. Please select manually on the map.");
                }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    };

    const steps = [
        { id: 1, label: "Information" },
        { id: 2, label: "Location" },
        { id: 3, label: "Images" }
    ];

    return (
        <>
            {/* Stepper UI */}
            <div className="flex items-center justify-between px-8 py-4 bg-gray-50 border-b border-gray-100 mb-6">
                {steps.map((step, index) => (
                    <div key={step.id} className="flex flex-col items-center relative z-10 w-full">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${currentStep >= step.id
                            ? 'bg-green-600 border-green-600 text-white'
                            : 'bg-white border-gray-300 text-gray-400'
                            }`}>
                            {currentStep > step.id ? (
                                <Check className="w-5 h-5" />
                            ) : (
                                <span className="text-sm font-bold">{step.id}</span>
                            )}
                        </div>
                        <span className={`text-xs font-semibold mt-2 transition-colors duration-300 ${currentStep >= step.id ? 'text-green-700' : 'text-gray-400'
                            }`}>
                            {step.label}
                        </span>
                        {/* Progress Line */}
                        {index < steps.length - 1 && (
                            <div className={`absolute top-4 left-[50%] right-[-50%] h-[2px] -z-10 transition-colors duration-300 ${currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'
                                }`} />
                        )}
                    </div>
                ))}
            </div>

            <form onSubmit={handleFinalSubmit} className="grid gap-6 p-6">
                {/* Step 1: Information */}
                {currentStep === 1 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <div className="grid gap-2">
                            <Label htmlFor="title" className="text-gray-900 font-medium">Property Title</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Cozy City Apartment"
                                required
                                className="bg-white text-gray-900 border-gray-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="property_type" className="text-black font-medium">Type</Label>
                                <Select value={propertyType} onValueChange={setPropertyType} required>
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
                                        type="number"
                                        min="0"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="0.00"
                                        required
                                        className="pl-7 bg-white text-gray-900 border-gray-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description" className="text-gray-900 font-medium">Description</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
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
                                type="number"
                                min="1"
                                value={availableSlots}
                                onChange={(e) => setAvailableSlots(e.target.value)}
                                required
                                className="bg-white text-gray-900 border-gray-200 focus:border-green-500 focus:ring-green-500/20 rounded-xl"
                            />
                        </div>
                    </div>
                )}

                {/* Step 2: Location */}
                {currentStep === 2 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                        <div className="grid gap-2">
                            <Label htmlFor="address" className="text-gray-900 font-medium">Address</Label>
                            <div className="relative">
                                <Input
                                    id="address"
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

                        <div className="grid gap-2">
                            <div className="flex justify-between items-center">
                                <Label className="text-gray-900 font-medium">Location Map</Label>
                                {routeDistance && (
                                    <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                        {routeDistance} from current location
                                    </span>
                                )}
                            </div>
                            <div className="h-[400px] rounded-xl overflow-hidden border border-gray-200 relative">
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
                        </div>
                    </div>
                )}

                {/* Step 3: Images */}
                {currentStep === 3 && (
                    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
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
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="mt-2 pt-4 border-t border-gray-100 flex justify-end gap-3">
                    {currentStep === 1 ? (
                        <Button type="button" variant="ghost" onClick={onCancel} className="hover:bg-gray-100/80 rounded-xl font-medium text-gray-600">
                            Cancel
                        </Button>
                    ) : (
                        <Button type="button" variant="outline" onClick={handleBack} className="rounded-xl font-medium">
                            Back
                        </Button>
                    )}

                    {currentStep < 3 ? (
                        <Button
                            type="button"
                            onClick={handleNext}
                            className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-8 font-medium shadow-sm"
                        >
                            Next Step
                        </Button>
                    ) : (
                        <Button
                            type="submit"
                            disabled={uploading}
                            className="bg-green-600 hover:bg-green-700 text-white rounded-xl px-8 font-medium shadow-sm"
                        >
                            {property ? 'Save Changes' : 'Submit for Review'}
                        </Button>
                    )}
                </div>
            </form>

            <ConfirmDialog
                open={showConfirmDialog}
                onOpenChange={setShowConfirmDialog}
                title={property ? "Confirm Changes" : "Submit Property"}
                description={
                    property
                        ? "Are you sure you want to save these changes to your property?"
                        : "Are you sure you want to submit this property listing? It will be reviewed by an admin before being published."
                }
                confirmText={property ? "Save Changes" : "Submit"}
                cancelText="Cancel"
                onConfirm={handleConfirmSubmit}
                variant="default"
            />

            {/* Validation Modal */}
            <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${showValidationModal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className={`bg-white rounded-2xl p-8 max-w-sm w-full shadow-xl transform transition-all duration-300 ${showValidationModal ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
                    <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                            <X className="w-6 h-6" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">Missing Information</h2>
                        <p className="text-gray-500 mb-6 text-sm">
                            {validationMessage || "Please fill in all required fields."}
                        </p>
                        <Button
                            className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-2"
                            onClick={() => setShowValidationModal(false)}
                        >
                            Okay
                        </Button>
                    </div>
                </div>
            </div>

            {/* Success Modal */}
            <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${showSuccessModal ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className={`bg-white rounded-2xl p-8 max-w-md w-full shadow-xl transform transition-all duration-300 ${showSuccessModal ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600">
                            <Check className="w-8 h-8" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Submission Successful!</h2>
                        <p className="text-gray-500 mb-6">
                            Your property has been submitted successfully. Please wait for Admin confirmation before it becomes visible on the map.
                        </p>
                        <Button
                            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl py-6"
                            onClick={() => window.location.href = '/dashboard'}
                        >
                            Return to Dashboard
                        </Button>
                    </div>
                </div>
            </div>

            {isSubmitting && (
                <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-8 shadow-xl">
                        <LoadingSpinner size="lg" text={property ? "Saving changes..." : "Creating property..."} />
                    </div>
                </div>
            )}

            {isStepTransitioning && (
                <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-full p-6 shadow-2xl flex items-center justify-center">
                        <Loader2 className="h-10 w-10 text-green-600 animate-spin" />
                    </div>
                </div>
            )}
        </>
    )
}
