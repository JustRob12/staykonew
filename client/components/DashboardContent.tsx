'use client'

import { useState } from 'react'
import { StayKoMap } from '@/components/StayKoMap'
import { MyPropertiesList } from '@/components/MyPropertiesList'
import { Map as MapIcon, Home, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DashboardContent() {
    return (
        <div className="flex-1 flex flex-col relative h-full overflow-hidden">
            <div className="flex-1 relative w-full h-full">
                <StayKoMap />
            </div>
        </div>
    )
}
