import { useState } from 'react'
import { X, AlertCircle } from 'lucide-react'

interface AddChildModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    parentId: string
}

interface ChildFormData {
    name: string
    age: string
    grade: string
    subjects_needed: string
}

export default function AddChildModal({ isOpen, onClose, onSuccess, parentId }: AddChildModalProps) {
    const [formData, setFormData] = useState<ChildFormData>({
        name: '',
        age: '',
        grade: '',
        subjects_needed: ''
    })
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)

    const handleInputChange = (field: keyof ChildFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }
    }

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (!formData.name.trim()) newErrors.name = 'Name is required'
        if (!formData.age) newErrors.age = 'Age is required'
        else if (parseInt(formData.age) < 3 || parseInt(formData.age) > 18) {
            newErrors.age = 'Age must be between 3 and 18'
        }
        if (!formData.grade.trim()) newErrors.grade = 'Grade is required'
        if (!formData.subjects_needed.trim()) newErrors.subjects_needed = 'At least one subject is required'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setLoading(true)
        setErrors({})

        try {
            // Import supabase dynamically to avoid circular dependency
            const { supabase } = await import('../lib/supabase')

            if (!supabase) {
                throw new Error('Database not available')
            }

            // Parse subjects from comma-separated string
            const subjects = formData.subjects_needed
                .split(',')
                .map(s => s.trim())
                .filter(s => s.length > 0)

            const { error } = await supabase
                .from('children')
                .insert([{
                    parent_id: parentId,
                    name: formData.name,
                    age: parseInt(formData.age),
                    grade: formData.grade,
                    subjects_needed: subjects
                }])

            if (error) throw error

            // Reset form and close modal
            setFormData({ name: '', age: '', grade: '', subjects_needed: '' })
            onSuccess()
            onClose()
        } catch (error: any) {
            console.error('Error adding child:', error)
            setErrors({ submit: error.message || 'Failed to add child. Please try again.' })
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 relative animate-slide-up">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Header */}
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Child Profile</h2>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Child's Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="e.g., John Doe"
                            className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${errors.name
                                    ? 'border-red-500 focus:border-red-600'
                                    : 'border-gray-300 focus:border-primary-500'
                                } outline-none`}
                        />
                        {errors.name && (
                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {errors.name}
                            </p>
                        )}
                    </div>

                    {/* Age */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Age
                        </label>
                        <input
                            type="number"
                            value={formData.age}
                            onChange={(e) => handleInputChange('age', e.target.value)}
                            placeholder="e.g., 10"
                            min="3"
                            max="18"
                            className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${errors.age
                                    ? 'border-red-500 focus:border-red-600'
                                    : 'border-gray-300 focus:border-primary-500'
                                } outline-none`}
                        />
                        {errors.age && (
                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {errors.age}
                            </p>
                        )}
                    </div>

                    {/* Grade */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Grade/Class
                        </label>
                        <input
                            type="text"
                            value={formData.grade}
                            onChange={(e) => handleInputChange('grade', e.target.value)}
                            placeholder="e.g., Grade 5, JSS 2"
                            className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${errors.grade
                                    ? 'border-red-500 focus:border-red-600'
                                    : 'border-gray-300 focus:border-primary-500'
                                } outline-none`}
                        />
                        {errors.grade && (
                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {errors.grade}
                            </p>
                        )}
                    </div>

                    {/* Subjects Needed */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Subjects Needed
                        </label>
                        <input
                            type="text"
                            value={formData.subjects_needed}
                            onChange={(e) => handleInputChange('subjects_needed', e.target.value)}
                            placeholder="e.g., Mathematics, English, Science"
                            className={`w-full px-4 py-3 rounded-lg border-2 transition-all ${errors.subjects_needed
                                    ? 'border-red-500 focus:border-red-600'
                                    : 'border-gray-300 focus:border-primary-500'
                                } outline-none`}
                        />
                        <p className="mt-1 text-xs text-gray-500">Separate multiple subjects with commas</p>
                        {errors.subjects_needed && (
                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {errors.subjects_needed}
                            </p>
                        )}
                    </div>

                    {/* Submit error */}
                    {errors.submit && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                {errors.submit}
                            </p>
                        </div>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 btn-primary py-3 px-6 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? 'Adding...' : 'Add Child'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
