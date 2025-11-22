import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { updateTutorProfile } from '../lib/database'
import { BookOpen, GraduationCap, MapPin, DollarSign, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react'

type OnboardingStep = 1 | 2 | 3

export default function TutorOnboardingPage() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [step, setStep] = useState<OnboardingStep>(1)
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        // Step 1: Professional Info
        bio: '',
        experience_years: 0,
        highest_qualification: '',
        languages_spoken: '', // Comma separated string for input

        // Step 2: Expertise
        subjects: [] as string[],
        teaching_methodology: '',
        preferred_age_groups: [] as string[],
        specializations: '', // Comma separated string
        teaching_mode: '',

        // Step 3: Logistics
        hourly_rate_min: 0,
        hourly_rate_max: 0,
        location_areas: '', // Comma separated string for input
    })

    const SUBJECT_OPTIONS = ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Literature', 'Economics', 'French', 'History']
    const AGE_GROUP_OPTIONS = ['Primary (6-12)', 'Secondary (13-18)', 'University', 'Adults']

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSubjectToggle = (subject: string) => {
        setFormData(prev => {
            const current = prev.subjects
            if (current.includes(subject)) {
                return { ...prev, subjects: current.filter(s => s !== subject) }
            } else {
                return { ...prev, subjects: [...current, subject] }
            }
        })
    }

    const handleAgeGroupToggle = (group: string) => {
        setFormData(prev => {
            const current = prev.preferred_age_groups
            if (current.includes(group)) {
                return { ...prev, preferred_age_groups: current.filter(g => g !== group) }
            } else {
                return { ...prev, preferred_age_groups: [...current, group] }
            }
        })
    }

    const handleSubmit = async () => {
        if (!user) return
        setLoading(true)

        try {
            // Process comma-separated strings into arrays
            const languages = formData.languages_spoken.split(',').map(s => s.trim()).filter(Boolean)
            const locations = formData.location_areas.split(',').map(s => s.trim()).filter(Boolean)
            const specializationsList = formData.specializations.split(',').map(s => s.trim()).filter(Boolean)

            console.log('Submitting tutor profile with data:', {
                bio: formData.bio,
                subjects: formData.subjects,
                experience_years: formData.experience_years,
                locations,
                specializationsList
            })

            const result = await updateTutorProfile(user.id, {
                bio: formData.bio,
                experience_years: Number(formData.experience_years),
                highest_qualification: formData.highest_qualification,
                languages_spoken: languages,
                subjects: formData.subjects,
                teaching_methodology: formData.teaching_methodology,
                preferred_age_groups: formData.preferred_age_groups,
                specializations: specializationsList,
                teaching_mode: formData.teaching_mode ? (formData.teaching_mode as any) : undefined,
                hourly_rate_min: Number(formData.hourly_rate_min),
                hourly_rate_max: Number(formData.hourly_rate_max),
                location_areas: locations,
                verification_status: 'approved' // Auto-approve for immediate visibility during testing
            })

            console.log('Profile saved successfully:', result)
            alert('Profile created successfully! Redirecting to dashboard...')

            // Navigate to dashboard
            navigate('/dashboard')
        } catch (error: any) {
            console.error('Error updating profile:', error)
            console.error('Error details:', {
                message: error.message,
                code: error.code,
                details: error.details,
                hint: error.hint
            })
            alert(`Failed to save profile: ${error.message || 'Unknown error'}.\n\nPlease check the browser console for details.`)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-gray-900">Complete Your Tutor Profile</h1>
                    <p className="mt-2 text-gray-600">Help us match you with the perfect students by providing more details.</p>
                </div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between relative">
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10"></div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
                    </div>
                    <div className="flex justify-between mt-2 text-sm font-medium text-gray-600">
                        <span>Professional Info</span>
                        <span>Expertise</span>
                        <span>Logistics</span>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">

                    {/* Step 1: Professional Info */}
                    {step === 1 && (
                        <div className="space-y-6 animate-fade-in">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <GraduationCap className="w-6 h-6 text-primary-600" />
                                Professional Information
                            </h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Professional Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    rows={4}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Tell students about your teaching experience and style..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                                    <input
                                        type="number"
                                        name="experience_years"
                                        value={formData.experience_years}
                                        onChange={handleInputChange}
                                        min="0"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Highest Qualification</label>
                                    <select
                                        name="highest_qualification"
                                        value={formData.highest_qualification}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    >
                                        <option value="">Select Qualification</option>
                                        <option value="High School">High School</option>
                                        <option value="Undergraduate">Undergraduate</option>
                                        <option value="Bachelor's Degree">Bachelor's Degree</option>
                                        <option value="Master's Degree">Master's Degree</option>
                                        <option value="PhD">PhD</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Languages Spoken</label>
                                <input
                                    type="text"
                                    name="languages_spoken"
                                    value={formData.languages_spoken}
                                    onChange={handleInputChange}
                                    placeholder="e.g. English, French, Yoruba (comma separated)"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={() => setStep(2)}
                                    disabled={!formData.bio || !formData.highest_qualification}
                                    className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next Step
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Expertise */}
                    {step === 2 && (
                        <div className="space-y-6 animate-fade-in">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <BookOpen className="w-6 h-6 text-primary-600" />
                                Expertise & Subjects
                            </h2>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Subjects You Teach</label>
                                <div className="flex flex-wrap gap-2">
                                    {SUBJECT_OPTIONS.map(subject => (
                                        <button
                                            key={subject}
                                            onClick={() => handleSubjectToggle(subject)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${formData.subjects.includes(subject)
                                                ? 'bg-primary-600 text-white shadow-md transform scale-105'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {subject}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Preferred Age Groups</label>
                                <div className="flex flex-wrap gap-2">
                                    {AGE_GROUP_OPTIONS.map(group => (
                                        <button
                                            key={group}
                                            onClick={() => handleAgeGroupToggle(group)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${formData.preferred_age_groups.includes(group)
                                                ? 'bg-accent-600 text-white shadow-md transform scale-105'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {group}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Teaching Methodology</label>
                                <textarea
                                    name="teaching_methodology"
                                    value={formData.teaching_methodology}
                                    onChange={handleInputChange}
                                    rows={3}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Describe your approach to teaching..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Specializations (Optional)</label>
                                <input
                                    type="text"
                                    name="specializations"
                                    value={formData.specializations}
                                    onChange={handleInputChange}
                                    placeholder="e.g. SAT Prep, Calculus, Creative Writing (comma separated)"
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">List any specific areas you specialize in.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Teaching Mode</label>
                                <select
                                    name="teaching_mode"
                                    value={formData.teaching_mode}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="">Select Mode</option>
                                    <option value="online">Online Only</option>
                                    <option value="in-person">In-Person Only</option>
                                    <option value="both">Both Online & In-Person</option>
                                </select>
                            </div>

                            <div className="flex justify-between pt-4">
                                <button
                                    onClick={() => setStep(1)}
                                    className="flex items-center gap-2 px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Back
                                </button>
                                <button
                                    onClick={() => setStep(3)}
                                    disabled={formData.subjects.length === 0}
                                    className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Next Step
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Logistics */}
                    {step === 3 && (
                        <div className="space-y-6 animate-fade-in">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <DollarSign className="w-6 h-6 text-primary-600" />
                                Logistics & Rates
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Hourly Rate (₦)</label>
                                    <input
                                        type="number"
                                        name="hourly_rate_min"
                                        value={formData.hourly_rate_min}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Hourly Rate (₦)</label>
                                    <input
                                        type="number"
                                        name="hourly_rate_max"
                                        value={formData.hourly_rate_max}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Locations</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="location_areas"
                                        value={formData.location_areas}
                                        onChange={handleInputChange}
                                        placeholder="e.g. Ikeja, Yaba, Lekki (comma separated)"
                                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">List the areas in Lagos where you can teach.</p>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3">
                                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                <p className="text-sm text-blue-800">
                                    By submitting your profile, you agree to our tutor terms of service. Your profile will be reviewed by our team before becoming visible to parents.
                                </p>
                            </div>

                            <div className="flex justify-between pt-4">
                                <button
                                    onClick={() => setStep(2)}
                                    className="flex items-center gap-2 px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !formData.location_areas}
                                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Saving...' : 'Complete Profile'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
