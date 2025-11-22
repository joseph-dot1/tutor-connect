import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Save, ArrowLeft, CheckCircle } from 'lucide-react'
import { getUserProfile, updateUserProfile } from '../lib/profile'

export default function ProfileSettingsPage() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        role: ''
    })

    useEffect(() => {
        loadProfile()
    }, [])

    const loadProfile = async () => {
        try {
            setLoading(true)
            const profile = await getUserProfile()
            setFormData(profile)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            setSaving(true)
            setError('')
            setSuccess(false)

            if (!formData.full_name.trim()) {
                setError('Name is required')
                return
            }

            await updateUserProfile({
                full_name: formData.full_name,
                phone: formData.phone
            })

            setSuccess(true)

            // Reload the page after 1.5 seconds to reflect changes
            setTimeout(() => {
                window.location.reload()
            }, 1500)
        } catch (err: any) {
            setError(err.message || 'Failed to update profile')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
                    <p className="text-gray-600 mt-2">Update your personal information</p>
                </div>

                {/* Settings Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    {/* Success Message */}
                    {success && (
                        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <p className="text-green-800 font-semibold">Profile updated successfully!</p>
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-800">{error}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Full Name *
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                                    placeholder="Enter your full name"
                                />
                            </div>
                        </div>

                        {/* Email (Read-only) */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Phone Number
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                                    placeholder="+234 800 000 0000"
                                />
                            </div>
                        </div>

                        {/* Role (Read-only) */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Account Type
                            </label>
                            <div className="px-4 py-3 rounded-lg border-2 border-gray-200 bg-gray-50 text-gray-700 capitalize">
                                {formData.role || 'Not set'}
                            </div>
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full btn-primary py-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
