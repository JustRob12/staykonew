import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/Header'
import { DashboardContent } from '@/components/DashboardContent'

export default async function DashboardPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (!profile || !profile.username) {
        return redirect('/onboarding')
    }

    return (
        <div className="h-screen flex flex-col">
            <Header user={profile} />

            {/* Main Content - Full Screen */}
            <main className="flex-1 relative">
                <DashboardContent />
            </main>
        </div>
    )
}
