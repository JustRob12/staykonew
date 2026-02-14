'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import NProgress from 'nprogress'
import Image from 'next/image'
import { LogOut, Building, User } from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu'

import { AddPropertyModal } from './AddPropertyModal'
import { ConfirmDialog } from './ui/confirm-dialog'

interface HeaderProps {
    user: {
        full_name: string | null
        avatar_url: string | null
    }
}

export default function Header({ user }: HeaderProps) {
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
    const router = useRouter()

    const handleNavigation = (href: string) => {
        NProgress.start()
        router.push(href)
    }

    const handleLogout = async () => {
        // Submit the logout form
        const form = document.getElementById('logout-form') as HTMLFormElement
        if (form) {
            form.submit()
        }
    }

    return (
        <>
            <nav className="bg-white border-b border-green-100 sticky top-0 z-50" suppressHydrationWarning>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" suppressHydrationWarning>
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            {/* Desktop Logo */}
                            <div className="hidden sm:block">
                                <Image
                                    src="/StayKoLandscape.png"
                                    alt="StayKo Logo"
                                    width={150}
                                    height={40}
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            {/* Mobile Logo */}
                            <div className="sm:hidden">
                                <Image
                                    src="/StayKoHouse.png"
                                    alt="StayKo Logo"
                                    width={40}
                                    height={40}
                                    className="object-contain"
                                    priority
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <AddPropertyModal />

                            <div className="h-8 w-px bg-gray-200 mx-2"></div>

                            <DropdownMenu>
                                <DropdownMenuTrigger className="flex items-center space-x-3 cursor-pointer outline-none group">
                                    <div className="relative h-10 w-10 rounded-full bg-green-100 flex items-center justify-center border-2 border-green-200 overflow-hidden group-hover:border-green-400 transition-colors">
                                        {user.avatar_url ? (
                                            <Image
                                                src={user.avatar_url}
                                                alt={user.full_name || 'User'}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <span className="text-green-700 font-bold text-lg">
                                                {user.full_name?.charAt(0) || 'U'}
                                            </span>
                                        )}
                                    </div>
                                    <span className="font-medium text-gray-700 hidden sm:block group-hover:text-green-700 transition-colors">
                                        {user.full_name}
                                    </span>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={() => handleNavigation('/dashboard/profile')}>
                                        <User className="h-4 w-4 mr-2" />
                                        <span>Profile</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleNavigation('/dashboard/my-properties')}>
                                        <Building className="h-4 w-4 mr-2" />
                                        <span>My Properties</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            setShowLogoutConfirm(true)
                                        }}
                                    >
                                        <LogOut className="h-4 w-4 mr-2" />
                                        <span>Logout</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hidden logout form */}
            <form id="logout-form" action="/auth/signout" method="post" className="hidden"></form>

            {/* Logout Confirmation Dialog */}
            <ConfirmDialog
                open={showLogoutConfirm}
                onOpenChange={setShowLogoutConfirm}
                title="Confirm Logout"
                description="Are you sure you want to logout? You'll need to sign in again to access your account."
                confirmText="Logout"
                cancelText="Cancel"
                onConfirm={handleLogout}
                variant="danger"
            />
        </>
    )
}
