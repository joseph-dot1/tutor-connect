import { supabase } from './supabase'

export interface Material {
    id: string
    tutor_id: string
    title: string
    subject: string
    description?: string
    file_name: string
    file_url: string
    file_size: number
    file_type: string
    uploaded_at: string
}

export async function uploadMaterial(
    file: File,
    metadata: {
        title: string
        subject: string
        description?: string
    }
): Promise<Material> {
    if (!supabase) {
        throw new Error('Supabase client not initialized')
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    // Generate unique file name
    const timestamp = Date.now()
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}_${sanitizedFileName}`
    const filePath = `${user.id}/${fileName}`

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
        .from('lesson-materials')
        .upload(filePath, file, {
            contentType: file.type,
            upsert: false
        })

    if (uploadError) {
        throw new Error(`Failed to upload file: ${uploadError.message}`)
    }

    // Get public URL
    const { data: urlData } = supabase.storage
        .from('lesson-materials')
        .getPublicUrl(filePath)

    // Create database record
    const { data: material, error: dbError } = await supabase
        .from('lesson_materials')
        .insert({
            tutor_id: user.id,
            title: metadata.title,
            subject: metadata.subject,
            description: metadata.description || null,
            file_name: file.name,
            file_url: urlData.publicUrl,
            file_size: file.size,
            file_type: file.type
        })
        .select()
        .single()

    if (dbError) {
        // Cleanup: delete uploaded file if database insert fails
        await supabase.storage.from('lesson-materials').remove([filePath])
        throw new Error(`Failed to save material: ${dbError.message}`)
    }

    return material as Material
}

export async function getMaterials(): Promise<Material[]> {
    if (!supabase) {
        throw new Error('Supabase client not initialized')
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    const { data: materials, error } = await supabase
        .from('lesson_materials')
        .select('*')
        .eq('tutor_id', user.id)
        .order('uploaded_at', { ascending: false })

    if (error) {
        throw new Error(`Failed to fetch materials: ${error.message}`)
    }

    return (materials || []) as Material[]
}

export async function deleteMaterial(id: string): Promise<void> {
    if (!supabase) {
        throw new Error('Supabase client not initialized')
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    // Get material to get file path
    const { data: material, error: fetchError } = await supabase
        .from('lesson_materials')
        .select('*')
        .eq('id', id)
        .eq('tutor_id', user.id)
        .single()

    if (fetchError || !material) {
        throw new Error('Material not found')
    }

    // Extract file path from URL
    const urlParts = material.file_url.split('/')
    const fileName = urlParts[urlParts.length - 1]
    const filePath = `${user.id}/${fileName}`

    // Delete from storage
    const { error: storageError } = await supabase.storage
        .from('lesson-materials')
        .remove([filePath])

    if (storageError) {
        console.error('Storage deletion error:', storageError)
        // Continue with database deletion even if storage fails
    }

    // Delete from database
    const { error: dbError } = await supabase
        .from('lesson_materials')
        .delete()
        .eq('id', id)
        .eq('tutor_id', user.id)

    if (dbError) {
        throw new Error(`Failed to delete material: ${dbError.message}`)
    }
}

export async function getDownloadUrl(id: string): Promise<string> {
    if (!supabase) {
        throw new Error('Supabase client not initialized')
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Not authenticated')
    }

    // Get material from database
    const { data: material, error } = await supabase
        .from('lesson_materials')
        .select('*')
        .eq('id', id)
        .eq('tutor_id', user.id)
        .single()

    if (error || !material) {
        throw new Error('Material not found')
    }

    // Extract file path from URL
    const urlParts = material.file_url.split('/')
    const fileName = urlParts[urlParts.length - 1]
    const filePath = `${user.id}/${fileName}`

    // Generate signed URL (valid for 1 hour)
    const { data: signedUrlData, error: urlError } = await supabase.storage
        .from('lesson-materials')
        .createSignedUrl(filePath, 3600)

    if (urlError) {
        throw new Error(`Failed to generate download link: ${urlError.message}`)
    }

    return signedUrlData.signedUrl
}
