import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { createTutorProfile, createParentProfile } from '../lib/database'
import { Users, GraduationCap, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react'

type UserRole = 'parent' | 'tutor'
type RegistrationStep = 'role' | 'details' | 'verification'

export default function RegisterPage() {
    const [step, setStep] = useState<RegistrationStep>('role')
    const [role, setRole] = useState<UserRole>('parent')
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        phone: '',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()
    const { isMockMode } = useAuth()

    const validateStep = (): boolean => {
        const newErrors: Record<string, string> = {}

        if (step === 'details') {
            if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
            if (!formData.email.trim()) newErrors.email = 'Email is required'
            else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = 'Invalid email format'
            if (!formData.password) newErrors.password = 'Password is required'
            else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
            if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
            if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleNext = () => {
        if (step === 'role') {
            setStep('details')
        } else if (step === 'details') {
            if (validateStep()) {
                setStep('verification')
                handleRegister()
            }
        }
    }

    const handleRegister = async () => {
        setLoading(true)
        setErrors({})

        try {
            if (isMockMode) {
                // Simulate registration for mock mode
                setTimeout(() => {
                    setLoading(false)
                    if (role === 'parent') {
                        navigate('/dashboard') // Skip onboarding for now
                    } else {
                        navigate('/tutor-onboarding')
                    }
                }, 2000)
            } else {
                console.log('[REGISTRATION] Starting Supabase signup...', {
                    email: formData.email,
                    role: role
                })

                // Real Supabase registration
                const { data, error } = await supabase!.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        emailRedirectTo: window.location.origin + '/dashboard',
                        data: {
                            full_name: formData.fullName,
                            role: role,
                            phone: formData.phone,
                        },
                    },
                })

                console.log('[REGISTRATION] Supabase signup response:', { data, error })

                if (error) {
                    console.error('[REGISTRATION] Signup error:', error)
                    alert(`Registration failed: ${error.message}`)
                    throw error
                }

                if (data.user) {
                    console.log('[REGISTRATION] User created successfully:', data.user.id)

                    // Create role-specific profile in database
                    try {
                        if (role === 'tutor') {
                            console.log('[REGISTRATION] Creating tutor profile...')
                            await createTutorProfile(data.user.id, {
                                bio: 'New tutor - profile coming soon!',
                                subjects: [], // Will be filled during onboarding
                                experience_years: 0,
                                highest_qualification: 'Not specified',
                                location_areas: [],
                            })

                            if (data.session) {
                                console.log('[REGISTRATION] Session exists, navigating to onboarding')
                                navigate('/tutor-onboarding')
                            } else {
                                console.log('[REGISTRATION] No session, showing verification step')
                                setStep('verification')
                            }
                        } else {
                            console.log('[REGISTRATION] Creating parent profile...')
                            await createParentProfile(data.user.id, {
                                location_address: 'Not specified', // Will be filled during onboarding
                            })

                            if (data.session) {
                                navigate('/dashboard')
                            } else {
                                setStep('verification')
                            }
                        }
                    } catch (profileError: any) {
                        console.error('[REGISTRATION] Profile creation error:', profileError)
                        alert(`Profile creation issue: ${profileError.message}. You can complete your profile later.`)

                        // If session exists, navigate anyway
                        if (data.session) {
                            if (role === 'tutor') navigate('/tutor-onboarding')
                            else navigate('/dashboard')
                        } else {
                            setStep('verification')
                        }
                    }
                } else {
                    console.warn('[REGISTRATION] No user returned from signup')
                    alert('Registration completed but no user was returned. Please check your email for verification.')
                    setStep('verification')
                }
            }
        } catch (error: any) {
            console.error('[REGISTRATION] Fatal error:', error)
            setErrors({ submit: error.message || 'Failed to register. Please try again.' })
            alert(`Registration error: ${error.message || 'Unknown error'}`)
        } finally {
            setLoading(false)
        }
    }

    const handleBack = () => {
        if (step === 'details') setStep('role')
        else if (step === 'verification') setStep('details')
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[field]
                return newErrors
            })
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-50 via-white to-accent-50 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="w-full max-w-2xl relative z-10">
                <div className="glass-card rounded-3xl p-8 md:p-12 shadow-2xl">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">Join TutorConnect</h1>
                        <p className="text-gray-600">Create your account and get started</p>
                    </div>

                    {/* Progress Indicator */}
                    <div className="flex items-center justify-center mb-10">
                        <StepIndicator number={1} active={step === 'role'} completed={step !== 'role'} label="Role" />
                        <div className={`w-16 h-1 mx-2 rounded ${step === 'role' ? 'bg-gray-300' : 'bg-primary-600'}`}></div>
                        <StepIndicator number={2} active={step === 'details'} completed={step === 'verification'} label="Details" />
                        <div className={`w-16 h-1 mx-2 rounded ${step === 'verification' ? 'bg-primary-600' : 'bg-gray-300'}`}></div>
                        <StepIndicator number={3} active={step === 'verification'} completed={false} label="Verify" />
                    </div>

                    {/* Step 1: Role Selection */}
                    {step === 'role' && (
                        <div className="space-y-6 animate-slide-up">
                            <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">I am a...</h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                <RoleCard
                                    icon={<Users className="w-12 h-12" />}
                                    title="Parent"
                                    description="Find qualified tutors for my children"
                                    selected={role === 'parent'}
                                    onClick={() => setRole('parent')}
                                    features={['Browse tutors', 'Book sessions', 'Track progress']}
                                />

                                <RoleCard
                                    icon={<GraduationCap className="w-12 h-12" />}
                                    title="Tutor"
                                    description="Share my knowledge and teach students"
                                    selected={role === 'tutor'}
                                    onClick={() => setRole('tutor')}
                                    features={['Create profile', 'Manage sessions', 'Earn income']}
                                />
                            </div>

                            <button
                                onClick={handleNext}
                                className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2"
                            >
                                Continue as {role === 'parent' ? 'Parent' : 'Tutor'}
                                <ArrowRight className="w-5 h-5" />
                            </button>

                            <div className="text-center">
                                <button
                                    onClick={() => navigate('/login')}
                                    className="text-gray-600 hover:text-gray-900 font-semibold"
                                >
                                    Already have an account? <span className="text-primary-600">Sign in</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Account Details */}
                    {step === 'details' && (
                        <div className="space-y-6 animate-slide-up">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {role === 'tutor' ? 'Create Tutor Account' : 'Create Parent Account'}
                                </h2>
                                <p className="text-sm text-gray-500 mt-1">
                                    {role === 'tutor'
                                        ? 'Step 1: Login Details. Next: Professional Profile.'
                                        : 'Step 1: Login Details. Next: Child Profile.'}
                                </p>
                            </div>

                            <InputField
                                icon={<User className="w-5 h-5" />}
                                label="Full Name"
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => handleInputChange('fullName', e.target.value)}
                                error={errors.fullName}
                                placeholder="John Doe"
                            />

                            <InputField
                                icon={<Mail className="w-5 h-5" />}
                                label="Email Address"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                error={errors.email}
                                placeholder="john@example.com"
                            />

                            <InputField
                                icon={<Phone className="w-5 h-5" />}
                                label="Phone Number"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => handleInputChange('phone', e.target.value)}
                                error={errors.phone}
                                placeholder="+234 800 000 0000"
                            />

                            <InputField
                                icon={<Lock className="w-5 h-5" />}
                                label="Password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => handleInputChange('password', e.target.value)}
                                error={errors.password}
                                placeholder="Minimum 6 characters"
                                showPassword={showPassword}
                                onTogglePassword={() => setShowPassword(!showPassword)}
                            />

                            <InputField
                                icon={<Lock className="w-5 h-5" />}
                                label="Confirm Password"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                                error={errors.confirmPassword}
                                placeholder="Re-enter your password"
                                showPassword={showConfirmPassword}
                                onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
                            />

                            <div className="flex gap-4">
                                <button
                                    onClick={handleBack}
                                    className="flex-1 py-3 px-6 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                    Back
                                </button>
                                <button
                                    onClick={handleNext}
                                    className="flex-1 btn-primary py-3 px-6 flex items-center justify-center gap-2"
                                >
                                    Next
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Email Verification */}
                    {step === 'verification' && (
                        <div className="space-y-6 animate-slide-up text-center">
                            {loading ? (
                                <>
                                    <div className="w-20 h-20 mx-auto bg-primary-100 rounded-full flex items-center justify-center">
                                        <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">Creating Your Account...</h2>
                                    <p className="text-gray-600">Please wait while we set things up for you</p>
                                </>
                            ) : (
                                <>
                                    <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                                        <CheckCircle className="w-12 h-12 text-green-600" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900">Account Created!</h2>
                                    <p className="text-gray-600">
                                        We've sent a verification email to <strong>{formData.email}</strong>
                                    </p>
                                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                                        <p className="text-blue-900 font-semibold mb-2">Next Steps:</p>
                                        <ol className="text-left text-blue-800 space-y-2">
                                            <li>1. Check your email inbox (and spam folder)</li>
                                            <li>2. Click the verification link</li>
                                            <li>3. Complete your profile setup</li>
                                        </ol>
                                    </div>

                                    <button
                                        onClick={() => navigate('/login')}
                                        className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                                    >
                                        Go to Login
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function StepIndicator({ number, active, completed, label }: {
    number: number
    active: boolean
    completed: boolean
    label: string
}) {
    return (
        <div className="flex flex-col items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${completed ? 'bg-primary-600 text-white' :
                active ? 'bg-primary-600 text-white ring-4 ring-primary-200' :
                    'bg-gray-200 text-gray-600'
                }`}>
                {completed ? <CheckCircle className="w-6 h-6" /> : number}
            </div>
            <span className={`text-xs mt-2 font-semibold ${active ? 'text-primary-600' : 'text-gray-500'}`}>
                {label}
            </span>
        </div>
    )
}

function RoleCard({ icon, title, description, selected, onClick, features }: {
    icon: React.ReactNode
    title: string
    description: string
    selected: boolean
    onClick: () => void
    features: string[]
}) {
    return (
        <button
            onClick={onClick}
            className={`relative p-8 rounded-2xl border-2 transition-all duration-300 text-left ${selected
                ? 'border-primary-600 bg-primary-50 shadow-xl transform scale-105'
                : 'border-gray-200 hover:border-primary-300 hover:shadow-lg'
                }`}
        >
            {selected && (
                <div className="absolute top-4 right-4">
                    <CheckCircle className="w-6 h-6 text-primary-600" />
                </div>
            )}

            <div className={`w-16 h-16 rounded-xl flex items-center justify-center mb-4 ${selected ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                {icon}
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 mb-4">{description}</p>

            <div className="space-y-2">
                {features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span>{feature}</span>
                    </div>
                ))}
            </div>
        </button>
    )
}

function InputField({ icon, label, type, value, onChange, error, placeholder, showPassword, onTogglePassword }: {
    icon: React.ReactNode
    label: string
    type: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    error?: string
    placeholder: string
    showPassword?: boolean
    onTogglePassword?: () => void
}) {
    const isPasswordField = type === 'password'
    const inputType = isPasswordField && showPassword ? 'text' : type

    return (
        <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">{label}</label>
            <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    {icon}
                </div>
                <input
                    type={inputType}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full pl-12 ${isPasswordField ? 'pr-12' : 'pr-4'} py-3 rounded-lg border-2 transition-all duration-200 ${error
                        ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-200'
                        : 'border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
                        } outline-none`}
                />
                {isPasswordField && onTogglePassword && (
                    <button
                        type="button"
                        onClick={onTogglePassword}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                )}
            </div>
            {error && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                </p>
            )}
        </div>
    )
}
