import Image from 'next/image'
import { LogOut } from 'lucide-react'
import { AddPropertyModal } from './AddPropertyModal'

interface HeaderProps {
    user: {
        full_name: string | null
        avatar_url: string | null
    }
}

export default function Header({ user }: HeaderProps) {
    return (
        <nav className="bg-white border-b border-green-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center">
                        <span className="text-2xl font-bold text-green-600">StayKo</span>
                    </div>
                    <div className="flex items-center space-x-4">
                        <AddPropertyModal />

                        <div className="h-8 w-px bg-gray-200 mx-2"></div>

                        <div className="flex items-center space-x-3">
                            <div className="relative h-10 w-10 rounded-full bg-green-100 flex items-center justify-center border-2 border-green-200 overflow-hidden">
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
                            <span className="font-medium text-gray-700">
                                {user.full_name}
                            </span>
                        </div>
                        <form action="/auth/signout" method="post">
                            <button
                                type="submit"
                                className="p-2 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                title="Sign out"
                            >
                                <LogOut className="h-5 w-5" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </nav>
    )
}
