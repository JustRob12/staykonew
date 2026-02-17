'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Plus } from 'lucide-react'
import { PropertyForm, Property } from './PropertyForm'

// Re-export Property type for consumers
export type { Property }

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

    const handleSuccess = () => {
        setOpen(false)
    }

    const handleCancel = () => {
        setOpen(false)
    }

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

                <PropertyForm
                    property={property}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            </DialogContent>
        </Dialog>
    )
}
