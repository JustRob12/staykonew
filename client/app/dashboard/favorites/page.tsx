import { FavoritesList } from '@/components/FavoritesList'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/Header'

export default async function FavoritesPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*, role')
        .eq('id', user.id)
        .single()

    if (!profile || !profile.username) {
        return redirect('/onboarding')
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50">
            <Header user={profile} />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto flex flex-col">
                <div className="px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                    <h1 className="text-2xl font-bold text-gray-900">My Favorites</h1>
                    <p className="text-gray-500 text-sm">Properties you have saved for later.</p>
                </div>
                <div className="flex-1">
                    <FavoritesList />
                </div>
            </main>
        </div>
    )
}
