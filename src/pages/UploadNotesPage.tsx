import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Upload, FileText, X, CheckCircle, BookOpen, Trash2, Download, Loader, AlertCircle } from 'lucide-react'
import { uploadMaterial, getMaterials, deleteMaterial, getDownloadUrl, type Material } from '../lib/materials'


export default function UploadNotesPage() {
    const [uploadedNotes, setUploadedNotes] = useState<Material[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [uploadSuccess, setUploadSuccess] = useState(false)
    const [formData, setFormData] = useState<{
        title: string
        subject: string
        description: string
        file: File | null
    }>({
        title: '',
        subject: '',
        description: '',
        file: null
    })
    const navigate = useNavigate()

    const subjects = [
        'Mathematics', 'Physics', 'Chemistry', 'Biology',
        'English', 'History', 'Geography', 'Computer Science',
        'Economics', 'French', 'Other'
    ]

    useEffect(() => {
        loadMaterials()
    }, [])

    const loadMaterials = async () => {
        try {
            setLoading(true)
            const materials = await getMaterials()
            setUploadedNotes(materials)
        } catch (err: any) {
            console.error('Failed to load materials:', err)
            setError(err.message || 'Failed to load materials')
        } finally {
            setLoading(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]

            // Check file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                alert('File size must be less than 10MB')
                return
            }

            setFormData({ ...formData, file })
        }
    }

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.file || !formData.title || !formData.subject) {
            alert('Please fill in all required fields')
            return
        }

        setUploading(true)
        setError(null)

        try {
            await uploadMaterial(formData.file, {
                title: formData.title,
                subject: formData.subject,
                description: formData.description
            })

            setUploadSuccess(true)

            // Reset form
            setFormData({
                title: '',
                subject: '',
                description: '',
                file: null
            })

            // Reset file input
            const fileInput = document.getElementById('file-upload') as HTMLInputElement
            if (fileInput) fileInput.value = ''

            // Reload materials
            await loadMaterials()

            // Hide success message after 3 seconds
            setTimeout(() => setUploadSuccess(false), 3000)

        } catch (err: any) {
            console.error('Upload failed:', err)
            setError(err.message || 'Failed to upload file')
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this material?')) {
            return
        }

        try {
            await deleteMaterial(id)
            await loadMaterials()
        } catch (err: any) {
            console.error('Delete failed:', err)
            alert(err.message || 'Failed to delete material')
        }
    }

    const handleDownload = async (id: string) => {
        try {
            const downloadUrl = await getDownloadUrl(id)

            // Open in new tab
            window.open(downloadUrl, '_blank')
        } catch (err: any) {
            console.error('Download failed:', err)
            alert(err.message || 'Failed to download file')
        }
    }

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
            {/* Header */}
            <header className="glass-card border-b border-white/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Dashboard
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center">
                            <Upload className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Upload Notes</h1>
                            <p className="text-gray-600">Share lesson materials with your students</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Upload Form */}
                    <div className="glass-card rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload New Material</h2>

                        {uploadSuccess && (
                            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                <p className="text-green-800 font-semibold">File uploaded successfully!</p>
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600" />
                                <p className="text-red-800">{error}</p>
                            </div>
                        )}

                        <form onSubmit={handleUpload} className="space-y-6">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Title *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                                    placeholder="E.g., Introduction to Algebra"
                                    required
                                />
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Subject *
                                </label>
                                <select
                                    value={formData.subject}
                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                                    required
                                >
                                    <option value="">Select a subject</option>
                                    {subjects.map((subject) => (
                                        <option key={subject} value={subject}>
                                            {subject}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none"
                                    rows={4}
                                    placeholder="Brief description of the material..."
                                />
                            </div>

                            {/* File Upload */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    File *
                                </label>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary-500 transition-colors">
                                    <input
                                        type="file"
                                        id="file-upload"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt"
                                        required
                                    />
                                    <label
                                        htmlFor="file-upload"
                                        className="cursor-pointer flex flex-col items-center"
                                    >
                                        <Upload className="w-12 h-12 text-gray-400 mb-3" />
                                        {formData.file ? (
                                            <div className="flex items-center gap-2 text-primary-600">
                                                <FileText className="w-5 h-5" />
                                                <span className="font-semibold">{formData.file.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        setFormData({ ...formData, file: null })
                                                        const fileInput = document.getElementById('file-upload') as HTMLInputElement
                                                        if (fileInput) fileInput.value = ''
                                                    }}
                                                    className="p-1 hover:bg-red-100 rounded"
                                                >
                                                    <X className="w-4 h-4 text-red-600" />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <p className="text-gray-700 font-semibold mb-1">
                                                    Click to upload or drag and drop
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    PDF, DOC, PPT, XLS (max 10MB)
                                                </p>
                                            </>
                                        )}
                                    </label>
                                    {formData.file && (
                                        <p className="text-sm text-gray-500 mt-2">
                                            Size: {formatFileSize(formData.file.size)}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={uploading}
                                className="w-full btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {uploading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-5 h-5" />
                                        Upload Material
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Uploaded Notes List */}
                    <div className="glass-card rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Uploaded Materials</h2>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader className="w-8 h-8 text-primary-600 animate-spin" />
                            </div>
                        ) : uploadedNotes.length === 0 ? (
                            <div className="text-center py-12">
                                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-600">No materials uploaded yet</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {uploadedNotes.map((note) => (
                                    <div
                                        key={note.id}
                                        className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <FileText className="w-5 h-5 text-primary-600" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-900 mb-1">{note.title}</h3>
                                                {note.description && (
                                                    <p className="text-sm text-gray-600 mb-2">{note.description}</p>
                                                )}
                                                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                                                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded">
                                                        {note.subject}
                                                    </span>
                                                    <span>{formatFileSize(note.file_size)}</span>
                                                    <span>{new Date(note.uploaded_at).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleDownload(note.id)}
                                                        className="flex items-center gap-1 px-3 py-1 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded text-sm"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        Download
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(note.id)}
                                                        className="flex items-center gap-1 px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded text-sm"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}
