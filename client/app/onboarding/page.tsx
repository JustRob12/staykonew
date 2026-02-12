import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import OnboardingClient from './OnboardingClient'

export default async function OnboardingPage() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    // Check if profile already exists
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (profile && profile.username) {
        return redirect('/dashboard')
    }

    // Transform User object to a serializable version for the Client Component
    const serializableUser = {
        id: user.id,
        email: user.email,
        user_metadata: {
            full_name: user.user_metadata.full_name,
            avatar_url: user.user_metadata.avatar_url,
        }
    }

    return <OnboardingClient user={serializableUser} />
}
