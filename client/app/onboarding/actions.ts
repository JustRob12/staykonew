'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Not authenticated' }
    }

    const username = user.email ? user.email.split('@')[0] : `user_${user.id.substring(0, 8)}`

    const profileData = {
        id: user.id,
        email: user.email!,
        full_name: formData.get('full_name') as string,
        username: username,
        address: formData.get('address') as string,
        phone_number: formData.get('phone_number') as string,
        avatar_url: (formData.get('avatar_url') as string) || null,
        updated_at: new Date().toISOString(),
    }

    const { error } = await supabase
        .from('profiles')
        .upsert(profileData)

    if (error) {
        console.error('Error updating profile:', error)
        return { error: error.message }
    }

    revalidatePath('/dashboard')
    return { success: true }
}
