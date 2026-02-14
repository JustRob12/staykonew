'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface ImageLightboxProps {
    images: string[]
    currentIndex: number
    isOpen: boolean
    onClose: () => void
    onNext: () => void
    onPrevious: () => void
}

export function ImageLightbox({
    images,
    currentIndex,
    isOpen,
    onClose,
    onNext,
    onPrevious
}: ImageLightboxProps) {
    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowRight') onNext()
            if (e.key === 'ArrowLeft') onPrevious()
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose, onNext, onPrevious])

    // Prevent body scroll when lightbox is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (!isOpen || images.length === 0) return null

    return (
        <div className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center">
            {/* Backdrop - click to close */}
            <div
                className="absolute inset-0"
                onClick={onClose}
            />

            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2 hover:bg-black/70"
                aria-label="Close"
            >
                <X className="h-6 w-6" />
            </button>

            {/* Image counter */}
            <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium">
                {currentIndex + 1} / {images.length}
            </div>

            {/* Previous button */}
            {images.length > 1 && (
                <button
                    onClick={onPrevious}
                    className="absolute left-4 z-10 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-3 hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Previous image"
                >
                    <ChevronLeft className="h-8 w-8" />
                </button>
            )}

            {/* Next button */}
            {images.length > 1 && (
                <button
                    onClick={onNext}
                    className="absolute right-4 z-10 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-3 hover:bg-black/70 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Next image"
                >
                    <ChevronRight className="h-8 w-8" />
                </button>
            )}

            {/* Image */}
            <div className="relative w-full h-full max-w-7xl max-h-[90vh] mx-auto flex items-center justify-center p-4">
                <div className="relative w-full h-full">
                    <Image
                        src={images[currentIndex]}
                        alt={`Image ${currentIndex + 1} of ${images.length}`}
                        fill
                        className="object-contain"
                        sizes="100vw"
                        priority
                    />
                </div>
            </div>
        </div>
    )
}
