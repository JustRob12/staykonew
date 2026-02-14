'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type SocialMedia = {
    tiktok: string | null
    facebook: string | null
    instagram: string | null
}

export async function getSocialMedia() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase
        .from('social_media')
        .select('tiktok, facebook, instagram')
        .eq('user_id', user.id)
        .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is code for "no rows found"
        console.error('Error fetching social media:', error)
        return null
    }

    return data as SocialMedia | null
}

export async function updateUserProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const fullName = formData.get('full_name') as string
    const phoneNumber = formData.get('phone_number') as string
    const tiktok = formData.get('tiktok') as string
    const facebook = formData.get('facebook') as string
    const instagram = formData.get('instagram') as string
    const avatarFile = formData.get('avatar') as File

    let avatarUrl = formData.get('current_avatar_url') as string

    // 1. Handle Avatar Upload if a new file is provided
    if (avatarFile && avatarFile.size > 0) {
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${user.id}-${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, avatarFile)

        if (uploadError) {
            console.error('Error uploading avatar:', uploadError)
            return { error: 'Failed to upload profile picture' }
        }

        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath)

        avatarUrl = publicUrl
    }

    // 2. Update Profiles table
    const { error: profileError } = await supabase
        .from('profiles')
        .update({
            full_name: fullName,
            phone_number: phoneNumber,
            avatar_url: avatarUrl,
            updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

    if (profileError) {
        console.error('Error updating profile:', profileError)
        return { error: 'Failed to update profile details' }
    }

    // 3. Update Social Media table
    const { error: socialMediaError } = await supabase
        .from('social_media')
        .upsert({
            user_id: user.id,
            tiktok: tiktok || null,
            facebook: facebook || null,
            instagram: instagram || null,
            updated_at: new Date().toISOString()
        }, {
            onConflict: 'user_id'
        })

    if (socialMediaError) {
        console.error('Error updating social media:', socialMediaError)
        return { error: 'Failed to update social media links' }
    }

    revalidatePath('/dashboard/profile')
    revalidatePath('/dashboard') // Revalidate map/header
    return { message: 'Profile updated successfully!' }
}

export async function getPublicProfile(userId: string) {
    const supabase = await createClient()

    // Basic UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!userId || !uuidRegex.test(userId)) {
        return null; // Invalid ID
    }

    const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
            full_name,
            avatar_url,
            phone_number,
            username,
            address,
            social_media (tiktok, facebook, instagram)
        `)
        .eq('id', userId)
        .single()

    if (error) {
        console.error('Error fetching public profile:', error)
        return null
    }

    return profile
}

export async function getUsers() {
    const supabase = await createClient()

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching users:', error)
        return []
    }

    return profiles
}
