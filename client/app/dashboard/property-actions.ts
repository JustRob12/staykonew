'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type PropertyState = {
    message?: string | null
    error?: string | null
}

export async function createProperty(prevState: PropertyState, formData: FormData) {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'You must be logged in to create a property.' }
    }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const property_type = formData.get('property_type') as string
    const price = parseFloat(formData.get('price') as string)
    const address = formData.get('address') as string
    const available_slots = parseInt(formData.get('available_slots') as string)
    const latitude = parseFloat(formData.get('latitude') as string) || 0
    const longitude = parseFloat(formData.get('longitude') as string) || 0

    // Image URLs are passed as a JSON string array to handle multiple files more easily
    // The client uploads to Cloudinary and sends back the list of URLs
    const imageUrlsString = formData.get('image_urls') as string
    let imageUrls: string[] = []
    try {
        if (imageUrlsString) {
            imageUrls = JSON.parse(imageUrlsString)
        }
    } catch (e) {
        console.error("Failed to parse image URLs", e)
        return { error: 'Invalid image data.' }
    }


    if (!title || !property_type || !address) {
        return { error: 'Please fill in all required fields.' }
    }

    // 1. Create the Property
    const { data: property, error: propertyError } = await supabase
        .from('properties')
        .insert({
            user_id: user.id,
            title,
            description,
            property_type,
            price,
            address,
            available_slots,
            status: 'available',
            // Start with placeholder lat/long if geocoding isn't implemented yet
            latitude,
            longitude,
        })
        .select()
        .single()

    if (propertyError) {
        console.error('Property creation error:', propertyError)
        return { error: 'Failed to create property. Please try again.' }
    }

    // 2. Add Images if any
    if (imageUrls.length > 0 && property) {
        const imagesToInsert = imageUrls.map(url => ({
            property_id: property.id,
            image_url: url
            // public_id could be extracted from Cloudinary URL if needed, or left null
        }))

        const { error: imagesError } = await supabase
            .from('property_images')
            .insert(imagesToInsert)

        if (imagesError) {
            console.error('Image insertion error:', imagesError)
            // Consider if we should rollback property creation here or just warn?
            // for simplicity now, we return error but property exists without images
            return { error: 'Property created, but failed to save images.', message: 'Property created with warnings.' }
        }
    }

    revalidatePath('/dashboard')
    return { message: 'Property created successfully!' }
}

export async function getProperties() {
    const supabase = await createClient()

    const { data: properties, error } = await supabase
        .from('properties')
        .select(`
      *,
      property_images (image_url),
      profiles:user_id (
        full_name,
        phone_number,
        avatar_url
      )
    `)

    if (error) {
        console.error('Error fetching properties:', error)
        return []
    }

    return properties
}

export async function getUserProperties() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return []
    }

    const { data: properties, error } = await supabase
        .from('properties')
        .select(`
            *,
            property_images (image_url)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching user properties:', error)
        return []
    }

    return properties
}

export async function deleteProperty(propertyId: string) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    // Verify ownership
    const { data: property } = await supabase
        .from('properties')
        .select('user_id')
        .eq('id', propertyId)
        .single()

    if (!property || property.user_id !== user.id) {
        return { error: 'Unauthorized' }
    }

    // Delete images first (if cascade isn't set up, but usually Supabase handles this if configured, 
    // but explicit delete is safer for strict FKs without cascade)
    // Actually, let's assume cascade or just delete property and let DB handle it. 
    // Best practice: Delete from storage if we were using it directly, but here we just store URLs.

    const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId)

    if (error) {
        console.error('Error deleting property:', error)
        return { error: 'Failed to delete property' }
    }

    revalidatePath('/dashboard')
    return { message: 'Property deleted successfully' }
}

export async function togglePropertyStatus(propertyId: string, currentStatus: string) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const newStatus = currentStatus === 'available' ? 'booked' : 'available'

    const { error } = await supabase
        .from('properties')
        .update({ status: newStatus })
        .eq('id', propertyId)
        .eq('user_id', user.id) // Ensure ownership

    if (error) {
        console.error('Error updating status:', error)
        return { error: 'Failed to update status' }
    }

    revalidatePath('/dashboard')
    return { message: 'Status updated', newStatus }
}

export async function updateProperty(prevState: PropertyState, formData: FormData) {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const propertyId = formData.get('property_id') as string
    if (!propertyId) return { error: 'Property ID missing' }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const property_type = formData.get('property_type') as string
    const price = parseFloat(formData.get('price') as string)
    const address = formData.get('address') as string
    const available_slots = parseInt(formData.get('available_slots') as string)
    const latitude = parseFloat(formData.get('latitude') as string)
    const longitude = parseFloat(formData.get('longitude') as string)

    const imageUrlsString = formData.get('image_urls') as string
    let imageUrls: string[] = []
    try {
        if (imageUrlsString) {
            imageUrls = JSON.parse(imageUrlsString)
        }
    } catch (e) {
        console.error("Failed to parse image URLs", e)
    }

    // Update Property Fields
    const { error: updateError } = await supabase
        .from('properties')
        .update({
            title,
            description,
            property_type,
            price,
            address,
            available_slots,
            latitude,
            longitude,
        })
        .eq('id', propertyId)
        .eq('user_id', user.id)

    if (updateError) {
        console.error('Update property error:', updateError)
        return { error: 'Failed to update property' }
    }

    // Handle Images
    // Strategy: Delete all existing images and re-insert? Or diff?
    // For simplicity: If new images are provided (or list changed), we can replace. 
    // But `imageUrls` from client might include old URLs too. 
    // Let's assume the client sends the FULL list of desired images.
    // So we delete all for this property and re-insert.

    if (imageUrls.length > 0) {
        // 1. Delete existing
        await supabase.from('property_images').delete().eq('property_id', propertyId)

        // 2. Insert all
        const imagesToInsert = imageUrls.map(url => ({
            property_id: propertyId,
            image_url: url
        }))

        const { error: imagesError } = await supabase
            .from('property_images')
            .insert(imagesToInsert)

        if (imagesError) {
            console.error('Image update error:', imagesError)
            return { error: 'Property updated but failed to save images' }
        }
    } else if (imageUrls.length === 0 && imageUrlsString) {
        // User might have deleted all images
        await supabase.from('property_images').delete().eq('property_id', propertyId)
    }

    revalidatePath('/dashboard')
    return { message: 'Property updated successfully!' }
}
