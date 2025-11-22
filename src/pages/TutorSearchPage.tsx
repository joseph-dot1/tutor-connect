import { useState, useEffect } from 'react'
import { Search, MapPin, Star, DollarSign, Filter, X, GraduationCap, Award, Clock, Loader2, ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { searchTutors } from '../lib/database'

interface Tutor {
    id: string
    name?: string // Make optional as it might come from user metadata
    subjects: string[]
    rating_average: number
    total_reviews: number
    hourly_rate_min: number
    hourly_rate_max: number
    location_areas: string[]
    experience_years: number
    verification_status: string
    bio: string
    user?: {
        raw_user_meta_data: {
            full_name: string
            avatar_url?: string | null
        }
    }
}

const SUBJECTS = ['Mathematics', 'English', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'Literature', 'Economics']
const LOCATIONS = ['Ikeja', 'Yaba', 'Victoria Island', 'Lekki', 'Surulere', 'Ikoyi', 'Maryland', 'Gbagada']

export default function TutorSearchPage() {
    const [tutors, setTutors] = useState<Tutor[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedSubject, setSelectedSubject] = useState<string>('')
    const [selectedLocation, setSelectedLocation] = useState<string>('')
    const [minRating, setMinRating] = useState<number>(0)
    const [showFilters, setShowFilters] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        fetchTutors()
    }, [selectedSubject, selectedLocation, minRating])

    const fetchTutors = async () => {
        setLoading(true)
        try {
            const filters: any = {}
            if (selectedSubject) filters.subject = selectedSubject
            if (selectedLocation) filters.location = selectedLocation
            if (minRating) filters.minRating = minRating

            // Pass search query if implemented in backend, or filter client side
            // For now we filter client side for text search as implemented below

            const data = await searchTutors(filters)
            setTutors(data as any) // Cast to any to avoid strict type mismatch if minor differences
        } catch (error) {
            console.error('Error fetching tutors:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredTutors = tutors.filter(tutor => {
        if (!searchQuery) return true
        const name = tutor.user?.raw_user_meta_data.full_name || tutor.name || ''
        return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            tutor.subjects.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
    })

    const activeFilterCount = [selectedSubject, selectedLocation, minRating > 0].filter(Boolean).length

    const clearFilters = () => {
        setSelectedSubject('')
        setSelectedLocation('')
        setMinRating(0)
        setSearchQuery('')
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans selection:bg-primary-100 selection:text-primary-900">
            {/* Modern Header with Glassmorphism */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm transition-all duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/dashboard')}>
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-primary-500/30 transition-all duration-300 group-hover:scale-105">
                                <GraduationCap className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                                TutorConnect
                            </h1>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="px-5 py-2.5 text-gray-600 hover:text-gray-900 font-semibold hover:bg-gray-100 rounded-xl transition-all duration-200"
                        >
                            Dashboard
                        </button>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="bg-white pb-12 pt-8 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
                <div className="max-w-4xl mx-auto text-center space-y-4 animate-fade-in">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
                        Find Your Perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">Tutor</span>
                    </h2>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto">
                        Connect with verified experts for personalized learning in Lagos.
                    </p>
                </div>

                {/* Search Bar Container */}
                <div className="max-w-3xl mx-auto mt-8 relative z-20">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative flex items-center bg-white rounded-2xl shadow-xl p-2 border border-gray-100">
                            <Search className="ml-4 w-6 h-6 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="What do you want to learn today?"
                                className="w-full px-4 py-3 text-lg bg-transparent border-none focus:ring-0 placeholder-gray-400 text-gray-900"
                            />
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${showFilters || activeFilterCount > 0
                                    ? 'bg-primary-50 text-primary-700'
                                    : 'hover:bg-gray-50 text-gray-600'
                                    }`}
                            >
                                <Filter className="w-5 h-5" />
                                Filters
                                {activeFilterCount > 0 && (
                                    <span className="bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-full ml-1">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Mobile Filter Toggle */}
                <div className="md:hidden mb-6">
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl shadow-sm font-semibold text-gray-700"
                    >
                        <Filter className="w-5 h-5" />
                        {showFilters ? 'Hide Filters' : 'Show Filters'}
                        {activeFilterCount > 0 && (
                            <span className="bg-primary-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="mb-8 bg-white rounded-2xl border border-gray-100 shadow-lg p-6 animate-slide-up">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900">Refine Search</h3>
                            {activeFilterCount > 0 && (
                                <button
                                    onClick={clearFilters}
                                    className="text-sm font-semibold text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                    Clear All
                                </button>
                            )}
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Subject</label>
                                <select
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all bg-gray-50 focus:bg-white"
                                >
                                    <option value="">All Subjects</option>
                                    {SUBJECTS.map(subject => (
                                        <option key={subject} value={subject}>{subject}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Location</label>
                                <select
                                    value={selectedLocation}
                                    onChange={(e) => setSelectedLocation(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all bg-gray-50 focus:bg-white"
                                >
                                    <option value="">All Locations</option>
                                    {LOCATIONS.map(location => (
                                        <option key={location} value={location}>{location}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-gray-700">Minimum Rating</label>
                                <select
                                    value={minRating}
                                    onChange={(e) => setMinRating(Number(e.target.value))}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all bg-gray-50 focus:bg-white"
                                >
                                    <option value="0">Any Rating</option>
                                    <option value="4">4+ Stars</option>
                                    <option value="4.5">4.5+ Stars</option>
                                    <option value="4.8">4.8+ Stars</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results Grid */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32">
                        <Loader2 className="w-12 h-12 text-primary-600 animate-spin mb-4" />
                        <p className="text-gray-500 font-medium">Finding the best tutors for you...</p>
                    </div>
                ) : filteredTutors.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Search className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No tutors found</h3>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">We couldn't find any tutors matching your criteria. Try adjusting your filters or search terms.</p>
                        <button
                            onClick={clearFilters}
                            className="btn-primary px-8 py-3 shadow-lg shadow-primary-500/30"
                        >
                            Clear All Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredTutors.map((tutor, index) => (
                            <TutorCard key={tutor.id} tutor={tutor} index={index} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function TutorCard({ tutor, index }: { tutor: Tutor; index: number }) {
    const navigate = useNavigate()
    const displayName = tutor.user?.raw_user_meta_data.full_name || tutor.name || 'Unknown Tutor'
    const initials = displayName.split(' ').map((n: string) => n[0]).join('').substring(0, 2)

    return (
        <div
            onClick={() => navigate(`/tutor/${tutor.id}`)}
            className="group bg-white rounded-2xl border border-gray-100 p-6 cursor-pointer transition-all duration-300 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 relative overflow-hidden"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {/* Hover Gradient Border Effect */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary-500 to-accent-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>

            {/* Header */}
            <div className="flex items-start gap-4 mb-6">
                <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center text-primary-700 text-xl font-bold shadow-inner">
                        {initials}
                    </div>
                    {tutor.verification_status === 'approved' && (
                        <div className="absolute -bottom-2 -right-2 bg-white p-1 rounded-full shadow-sm">
                            <Award className="w-5 h-5 text-green-500 fill-green-500" />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-xl text-gray-900 truncate mb-1 group-hover:text-primary-600 transition-colors">
                        {displayName}
                    </h3>
                    <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-md border border-yellow-100">
                            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                            <span className="font-bold text-yellow-700">{tutor.rating_average}</span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-500">{tutor.total_reviews} reviews</span>
                    </div>
                </div>
            </div>

            {/* Subjects */}
            <div className="flex flex-wrap gap-2 mb-6 h-16 overflow-hidden content-start">
                {tutor.subjects.slice(0, 3).map(subject => (
                    <span key={subject} className="px-3 py-1.5 bg-gray-50 text-gray-600 rounded-lg text-xs font-semibold border border-gray-100 group-hover:border-primary-100 group-hover:bg-primary-50 group-hover:text-primary-700 transition-colors">
                        {subject}
                    </span>
                ))}
                {tutor.subjects.length > 3 && (
                    <span className="px-3 py-1.5 bg-gray-50 text-gray-400 rounded-lg text-xs font-semibold border border-gray-100">
                        +{tutor.subjects.length - 3} more
                    </span>
                )}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6 pt-6 border-t border-gray-50">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-medium uppercase tracking-wider">
                        <Clock className="w-3 h-3" />
                        Experience
                    </div>
                    <p className="text-gray-900 font-semibold">{tutor.experience_years} years</p>
                </div>
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-gray-400 text-xs font-medium uppercase tracking-wider">
                        <DollarSign className="w-3 h-3" />
                        Rate
                    </div>
                    <p className="text-primary-600 font-bold">₦{tutor.hourly_rate_min.toLocaleString()}/hr</p>
                </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-6">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{tutor.location_areas.join(', ')}</span>
            </div>

            {/* CTA */}
            <button className="w-full py-3 rounded-xl bg-gray-900 text-white font-semibold flex items-center justify-center gap-2 group-hover:bg-primary-600 transition-colors duration-300 shadow-lg shadow-gray-900/10 group-hover:shadow-primary-600/20">
                View Profile
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
    )
}
