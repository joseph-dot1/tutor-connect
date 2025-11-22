import { Router, Request, Response } from 'express'
import multer from 'multer'
import { supabase } from '../server'

const router = Router()

// Configure multer for file uploads (memory storage)
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (_req, file, cb) => {
        // Allowed file types
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain'
        ]

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error('Invalid file type. Only PDF, DOC, PPT, XLS, and TXT files are allowed.'))
        }
    }
})

// POST /api/materials/upload - Upload a new material
router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file provided' })
        }

        const { title, subject, description } = req.body
        const userId = req.headers['x-user-id'] as string // From auth middleware (to be added)

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        if (!title || !subject) {
            return res.status(400).json({ error: 'Title and subject are required' })
        }

        // Generate unique file name
        const timestamp = Date.now()
        const sanitizedFileName = req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')
        const fileName = `${timestamp}_${sanitizedFileName}`
        const filePath = `${userId}/${fileName}`

        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('lesson-materials')
            .upload(filePath, req.file.buffer, {
                contentType: req.file.mimetype,
                upsert: false
            })

        if (uploadError) {
            console.error('Storage upload error:', uploadError)
            return res.status(500).json({ error: 'Failed to upload file to storage' })
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('lesson-materials')
            .getPublicUrl(filePath)

        // Create database record
        const { data: material, error: dbError } = await supabase
            .from('lesson_materials')
            .insert({
                tutor_id: userId,
                title,
                subject,
                description: description || null,
                file_name: req.file.originalname,
                file_url: urlData.publicUrl,
                file_size: req.file.size,
                file_type: req.file.mimetype
            })
            .select()
            .single()

        if (dbError) {
            // Cleanup: delete uploaded file if database insert fails
            await supabase.storage.from('lesson-materials').remove([filePath])
            console.error('Database insert error:', dbError)
            return res.status(500).json({ error: 'Failed to save material metadata' })
        }

        res.status(201).json({ success: true, material })

    } catch (error: any) {
        console.error('Upload error:', error)
        res.status(500).json({ error: error.message || 'Internal server error' })
    }
})

// GET /api/materials - Get all materials for the authenticated tutor
router.get('/', async (req: Request, res: Response) => {
    try {
        const userId = req.headers['x-user-id'] as string

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const { data: materials, error } = await supabase
            .from('lesson_materials')
            .select('*')
            .eq('tutor_id', userId)
            .order('uploaded_at', { ascending: false })

        if (error) {
            console.error('Database query error:', error)
            return res.status(500).json({ error: 'Failed to fetch materials' })
        }

        res.json({ materials })

    } catch (error: any) {
        console.error('Fetch materials error:', error)
        res.status(500).json({ error: error.message || 'Internal server error' })
    }
})

// GET /api/materials/:id - Get a single material
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const userId = req.headers['x-user-id'] as string

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const { data: material, error } = await supabase
            .from('lesson_materials')
            .select('*')
            .eq('id', id)
            .eq('tutor_id', userId)
            .single()

        if (error || !material) {
            return res.status(404).json({ error: 'Material not found' })
        }

        res.json({ material })

    } catch (error: any) {
        console.error('Fetch material error:', error)
        res.status(500).json({ error: error.message || 'Internal server error' })
    }
})

// GET /api/materials/:id/download - Get signed download URL
router.get('/:id/download', async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const userId = req.headers['x-user-id'] as string

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        // Get material from database
        const { data: material, error } = await supabase
            .from('lesson_materials')
            .select('*')
            .eq('id', id)
            .eq('tutor_id', userId)
            .single()

        if (error || !material) {
            return res.status(404).json({ error: 'Material not found' })
        }

        // Extract file path from URL
        const urlParts = material.file_url.split('/')
        const fileName = urlParts[urlParts.length - 1]
        const filePath = `${userId}/${fileName}`

        // Generate signed URL (valid for 1 hour)
        const { data: signedUrlData, error: urlError } = await supabase.storage
            .from('lesson-materials')
            .createSignedUrl(filePath, 3600)

        if (urlError) {
            console.error('Signed URL error:', urlError)
            return res.status(500).json({ error: 'Failed to generate download link' })
        }

        res.json({ downloadUrl: signedUrlData.signedUrl })

    } catch (error: any) {
        console.error('Download URL error:', error)
        res.status(500).json({ error: error.message || 'Internal server error' })
    }
})

// DELETE /api/materials/:id - Delete a material
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const userId = req.headers['x-user-id'] as string

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        // Get material to get file path
        const { data: material, error: fetchError } = await supabase
            .from('lesson_materials')
            .select('*')
            .eq('id', id)
            .eq('tutor_id', userId)
            .single()

        if (fetchError || !material) {
            return res.status(404).json({ error: 'Material not found' })
        }

        // Extract file path from URL
        const urlParts = material.file_url.split('/')
        const fileName = urlParts[urlParts.length - 1]
        const filePath = `${userId}/${fileName}`

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
            .eq('tutor_id', userId)

        if (dbError) {
            console.error('Database deletion error:', dbError)
            return res.status(500).json({ error: 'Failed to delete material' })
        }

        res.json({ success: true, message: 'Material deleted successfully' })

    } catch (error: any) {
        console.error('Delete error:', error)
        res.status(500).json({ error: error.message || 'Internal server error' })
    }
})

export default router
