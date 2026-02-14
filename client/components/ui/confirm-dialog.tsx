'use client'

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ConfirmDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    onConfirm: () => void | Promise<void>
    variant?: 'danger' | 'default'
}

export function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    variant = 'default',
}: ConfirmDialogProps) {
    const handleConfirm = async () => {
        await onConfirm()
        onOpenChange(false)
    }

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-white border-gray-200 rounded-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-gray-900">{title}</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600">
                        {description}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl border-gray-200 hover:bg-gray-50">
                        {cancelText}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleConfirm}
                        className={`rounded-xl ${variant === 'danger'
                                ? 'bg-red-600 hover:bg-red-700 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                    >
                        {confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
