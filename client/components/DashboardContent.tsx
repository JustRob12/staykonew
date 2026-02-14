'use client'

import { useState, useEffect } from 'react'
import { StayKoMap } from '@/components/StayKoMap'
import { MyPropertiesList } from '@/components/MyPropertiesList'
import { Map as MapIcon, Home, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DashboardContent() {
    // Request location permission on mount (especially for mobile)
    useEffect(() => {
        if ("geolocation" in navigator) {
            // Request location permission
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Success - permission granted
                    console.log("Location permission granted")
                },
                (error) => {
                    // Permission denied or error
                    console.log("Location permission denied or unavailable:", error.message)
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            )
        }
    }, [])

    return (
        <div className="flex-1 flex flex-col relative h-full overflow-hidden">
            <div className="flex-1 relative w-full h-full">
                <StayKoMap />
            </div>
        </div>
    )
}
