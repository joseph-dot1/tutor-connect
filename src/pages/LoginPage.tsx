import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Users, GraduationCap, AlertCircle, Star, Award, TrendingUp, Eye, EyeOff } from 'lucide-react'

type UserRole = 'parent' | 'tutor'

export default function LoginPage() {
    const [role, setRole] = useState<UserRole>('parent')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const { signIn, isMockMode } = useAuth()
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        if (!email || !password) {
            setError('Please fill in all fields')
            setLoading(false)
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            setLoading(false)
            return
        }

        const { error } = await signIn(email, password, role)

        if (error) {
            setError(error.message || 'Invalid email or password')
            setLoading(false)
        } else {
            navigate('/dashboard')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
                <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-300 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-float" style={{ animationDelay: '4s' }}></div>
            </div>

            <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-12 items-center relative z-10">
                {/* Left side - Enhanced Branding with Images */}
                <div className="hidden lg:block animate-slide-up space-y-8">
                    {/* Logo and Title */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-300">
                                <GraduationCap className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-700 via-primary-600 to-primary-900 bg-clip-text text-transparent">
                                    TutorConnect
                                </h1>
                                <p className="text-gray-600 font-medium">Lagos, Nigeria</p>
                            </div>
                        </div>

                        <p className="text-2xl text-gray-700 font-semibold leading-relaxed">
                            Connecting Quality Education with Eager Learners
                        </p>
                    </div>

                    {/* Role-Specific Image */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-accent-500 rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                        <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                            <img
                                src={role === 'parent' ? '/images/happy-parent.png' : '/images/professional-tutor.png'}
                                alt={role === 'parent' ? 'Happy parent and child learning' : 'Professional tutor teaching'}
                                className="w-full h-80 object-cover transform group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                                <p className="text-white font-semibold text-lg">
                                    {role === 'parent'
                                        ? '🎓 Find the perfect tutor for your child'
                                        : '⭐ Share your knowledge and inspire learners'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-4">
                        <FeatureItem
                            icon={<Star className="w-6 h-6" />}
                            title="Verified Tutors"
                            description="All tutors are background-checked and certified"
                            color="primary"
                        />
                        <FeatureItem
                            icon={<Award className="w-6 h-6" />}
                            title="Quality Guaranteed"
                            description="Ratings and reviews from real parents"
                            color="accent"
                        />
                        <FeatureItem
                            icon={<TrendingUp className="w-6 h-6" />}
                            title="Track Progress"
                            description="Monitor learning outcomes with AI-powered insights"
                            color="primary"
                        />
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <StatBadge number="500+" label="Tutors" />
                        <StatBadge number="2000+" label="Students" />
                        <StatBadge number="4.8★" label="Rating" />
                    </div>
                </div>

                {/* Right side - Enhanced Login Form */}
                <div className="w-full animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="glass-card rounded-3xl p-8 md:p-12 shadow-2xl">
                        {/* Demo Mode Banner */}
                        {isMockMode && (
                            <div className="mb-6 bg-gradient-to-r from-accent-50 to-accent-100 border border-accent-300 rounded-xl p-5 animate-pulse">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-accent-500 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="text-white text-xl">🎭</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-accent-900">Demo Mode Active</p>
                                        <p className="text-xs text-accent-700">Use any email and password (6+ characters)</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="text-center mb-8">
                            <h2 className="text-4xl font-bold text-gray-900 mb-3">Welcome Back!</h2>
                            <p className="text-gray-600 text-lg">Sign in to continue your learning journey</p>
                        </div>

                        {/* Role Selection with Animation */}
                        <div className="relative mb-8">
                            <div className="flex gap-3 bg-gray-100 p-2 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setRole('parent')}
                                    className={`role-tab ${role === 'parent' ? 'role-tab-active' : 'role-tab-inactive'} transform transition-all duration-300 hover:scale-105`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Users className="w-5 h-5" />
                                        <div className="text-left">
                                            <div className="font-bold">Parent</div>
                                            <div className="text-xs opacity-80">Find tutors</div>
                                        </div>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('tutor')}
                                    className={`role-tab ${role === 'tutor' ? 'role-tab-active' : 'role-tab-inactive'} transform transition-all duration-300 hover:scale-105`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <GraduationCap className="w-5 h-5" />
                                        <div className="text-left">
                                            <div className="font-bold">Tutor</div>
                                            <div className="text-xs opacity-80">Teach students</div>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="transform transition-all duration-300 hover:translate-x-1">
                                <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={role === 'parent' ? 'parent@example.com' : 'tutor@example.com'}
                                    className="input-field transform transition-all duration-200 focus:scale-[1.02]"
                                    disabled={loading}
                                />
                            </div>

                            <div className="transform transition-all duration-300 hover:translate-x-1">
                                <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        className="input-field transform transition-all duration-200 focus:scale-[1.02] pr-12"
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3 animate-slide-up">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-800 font-medium">{error}</p>
                                </div>
                            )}

                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input type="checkbox" className="w-4 h-4 text-primary-600 rounded focus:ring-2 focus:ring-primary-500 cursor-pointer" />
                                    <span className="text-gray-600 group-hover:text-gray-900 transition-colors">Remember me</span>
                                </label>
                                <a href="#" className="text-primary-600 hover:text-primary-700 font-bold hover:underline transition-all">
                                    Forgot password?
                                </a>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                            >
                                <span className="relative z-10">
                                    {loading ? (
                                        <div className="flex items-center justify-center gap-3">
                                            <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>Signing in...</span>
                                        </div>
                                    ) : (
                                        `Sign in as ${role === 'parent' ? 'Parent' : 'Tutor'}`
                                    )}
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-primary-700 to-accent-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-gray-600 mb-4">
                                Don't have an account?
                            </p>
                            <button
                                onClick={() => navigate('/register')}
                                className="text-primary-600 hover:text-primary-700 font-bold text-lg hover:underline transition-all inline-flex items-center gap-2"
                            >
                                Sign up now
                                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                            </button>
                        </div>
                    </div>

                    {/* Mobile Image */}
                    <div className="lg:hidden mt-8 rounded-2xl overflow-hidden shadow-xl">
                        <img
                            src={role === 'parent' ? '/images/happy-parent.png' : '/images/professional-tutor.png'}
                            alt={role === 'parent' ? 'Happy parent and child' : 'Professional tutor'}
                            className="w-full h-48 object-cover"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

function FeatureItem({ icon, title, description, color }: {
    icon: React.ReactNode
    title: string
    description: string
    color: 'primary' | 'accent'
}) {
    const bgColor = color === 'primary' ? 'bg-primary-100 hover:bg-primary-200' : 'bg-accent-100 hover:bg-accent-200'
    const textColor = color === 'primary' ? 'text-primary-600' : 'text-accent-600'

    return (
        <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-white/50 transition-all duration-300 group cursor-pointer">
            <div className={`w-14 h-14 ${bgColor} rounded-xl flex items-center justify-center ${textColor} flex-shrink-0 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                {icon}
            </div>
            <div>
                <h3 className="font-bold text-gray-900 mb-1 group-hover:text-primary-700 transition-colors">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
            </div>
        </div>
    )
}

function StatBadge({ number, label }: { number: string; label: string }) {
    return (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-default">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                {number}
            </div>
            <div className="text-xs text-gray-600 font-semibold mt-1">{label}</div>
        </div>
    )
}
