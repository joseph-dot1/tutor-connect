import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
    Star, MapPin, Clock, BookOpen, Languages,
    GraduationCap, Calendar, ArrowLeft, PenTool,
    Loader2, ShieldCheck, Share2, Heart
} from 'lucide-react'

import BookingModal from '../components/BookingModal'
import ReviewModal from '../components/ReviewModal'
import { api } from '../lib/api'

interface TutorDetails {
    id: string
    name: string
    subjects: string[]
    rating_average: number
    total_reviews: number
    total_sessions: number
    hourly_rate_min: number
    hourly_rate_max: number
    location_areas: string[]
    experience_years: number
    verification_status: string
    bio: string
    highest_qualification: string
    languages_spoken: string[]
    teaching_methodology?: string
    availability_schedule?: any
    user?: {
        raw_user_meta_data: {
            full_name: string
        }
    }
    reviews?: any[]
}

export default function TutorProfilePage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [tutor, setTutor] = useState<TutorDetails | null>(null)
    const [loading, setLoading] = useState(true)
    const [showBookingModal, setShowBookingModal] = useState(false)
    const [showReviewModal, setShowReviewModal] = useState(false)
    const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'schedule'>('overview')

    useEffect(() => {
        if (id) fetchTutorDetails(id)
    }, [id])

    const fetchTutorDetails = async (tutorId: string) => {
        setLoading(true)
        try {
            const data = await api.tutors.get(tutorId)
            setTutor(data)
        } catch (error) {
            console.error('Error fetching tutor:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleReviewSubmit = async (review: any) => {
        console.log('Submitting review:', review)
        await new Promise(resolve => setTimeout(resolve, 1000))
        alert('Review submitted successfully!')
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-12 h-12 text-primary-600 animate-spin" />
            </div>
        )
    }

    if (!tutor) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Tutor not found</h2>
                <button onClick={() => navigate('/search')} className="btn-primary px-6 py-2">
                    Back to Search
                </button>
            </div>
        )
    }

    const displayName = tutor.user?.raw_user_meta_data.full_name || tutor.name
    const initials = displayName.split(' ').map((n: string) => n[0]).join('').substring(0, 2)

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Navigation Bar */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/search')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold transition-colors group"
                    >
                        <div className="p-2 rounded-full group-hover:bg-gray-100 transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </div>
                        Back to Search
                    </button>
                    <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                            <Heart className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column: Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Profile Header Card */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-50 to-accent-50 rounded-bl-full opacity-50 -mr-16 -mt-16"></div>

                            <div className="flex flex-col md:flex-row gap-6 relative z-10">
                                <div className="flex-shrink-0">
                                    <div className="w-32 h-32 bg-gradient-to-br from-gray-900 to-gray-700 rounded-3xl flex items-center justify-center text-white text-4xl font-bold shadow-xl rotate-3 hover:rotate-0 transition-transform duration-300">
                                        {initials}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-3 mb-2">
                                        <h1 className="text-3xl font-bold text-gray-900">{displayName}</h1>
                                        {tutor.verification_status === 'approved' && (
                                            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 rounded-full border border-green-100">
                                                <ShieldCheck className="w-4 h-4" />
                                                <span className="text-xs font-bold uppercase tracking-wide">Verified Tutor</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-lg text-gray-600 mb-4">{tutor.highest_qualification}</p>

                                    <div className="flex flex-wrap gap-4 text-sm">
                                        <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-lg border border-yellow-100">
                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                            <span className="font-bold text-gray-900">{tutor.rating_average}</span>
                                            <span className="text-gray-500">({tutor.total_reviews} reviews)</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 text-gray-600">
                                            <MapPin className="w-4 h-4" />
                                            {tutor.location_areas[0]} + {tutor.location_areas.length - 1} more
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 text-gray-600">
                                            <Clock className="w-4 h-4" />
                                            {tutor.experience_years} Years Exp.
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Subjects */}
                            <div className="mt-8 pt-8 border-t border-gray-100">
                                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Teaches</p>
                                <div className="flex flex-wrap gap-2">
                                    {tutor.subjects.map(subject => (
                                        <span key={subject} className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold shadow-sm hover:border-primary-200 hover:text-primary-700 transition-colors cursor-default">
                                            {subject}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="flex border-b border-gray-100">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`flex-1 py-4 text-sm font-bold text-center transition-colors relative ${activeTab === 'overview' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Overview
                                    {activeTab === 'overview' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 mx-8"></div>}
                                </button>
                                <button
                                    onClick={() => setActiveTab('reviews')}
                                    className={`flex-1 py-4 text-sm font-bold text-center transition-colors relative ${activeTab === 'reviews' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Reviews ({tutor.total_reviews})
                                    {activeTab === 'reviews' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 mx-8"></div>}
                                </button>
                                <button
                                    onClick={() => setActiveTab('schedule')}
                                    className={`flex-1 py-4 text-sm font-bold text-center transition-colors relative ${activeTab === 'schedule' ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    Availability
                                    {activeTab === 'schedule' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 mx-8"></div>}
                                </button>
                            </div>

                            <div className="p-8">
                                {activeTab === 'overview' && (
                                    <div className="space-y-8 animate-fade-in">
                                        <section>
                                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                <div className="p-2 bg-primary-50 rounded-lg text-primary-600"><BookOpen className="w-5 h-5" /></div>
                                                About Me
                                            </h3>
                                            <p className="text-gray-600 leading-relaxed text-lg">{tutor.bio}</p>
                                        </section>

                                        <section>
                                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                <div className="p-2 bg-primary-50 rounded-lg text-primary-600"><GraduationCap className="w-5 h-5" /></div>
                                                Teaching Methodology
                                            </h3>
                                            <p className="text-gray-600 leading-relaxed text-lg">{tutor.teaching_methodology || "I adapt my teaching style to each student's unique learning needs, focusing on building confidence and deep understanding of core concepts."}</p>
                                        </section>

                                        <section>
                                            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                <div className="p-2 bg-primary-50 rounded-lg text-primary-600"><Languages className="w-5 h-5" /></div>
                                                Languages Spoken
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {tutor.languages_spoken.map(lang => (
                                                    <span key={lang} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg font-medium">
                                                        {lang}
                                                    </span>
                                                ))}
                                            </div>
                                        </section>
                                    </div>
                                )}

                                {activeTab === 'reviews' && (
                                    <div className="space-y-6 animate-fade-in">
                                        <div className="flex items-center justify-between mb-6">
                                            <h3 className="text-xl font-bold text-gray-900">Student Reviews</h3>
                                            <button
                                                onClick={() => setShowReviewModal(true)}
                                                className="text-primary-600 font-bold hover:underline flex items-center gap-2"
                                            >
                                                <PenTool className="w-4 h-4" />
                                                Write a Review
                                            </button>
                                        </div>
                                        {tutor.reviews && tutor.reviews.length > 0 ? (
                                            tutor.reviews.map(review => (
                                                <ReviewCard key={review.id} review={review} />
                                            ))
                                        ) : (
                                            <div className="text-center py-12 bg-gray-50 rounded-2xl">
                                                <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                                <p className="text-gray-500 font-medium">No reviews yet. Be the first!</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'schedule' && (
                                    <div className="animate-fade-in">
                                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                            <div className="p-2 bg-primary-50 rounded-lg text-primary-600"><Calendar className="w-5 h-5" /></div>
                                            Weekly Schedule
                                        </h3>
                                        <div className="grid gap-3">
                                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                                <div key={day} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                    <span className="font-bold text-gray-700">{day}</span>
                                                    <span className="text-gray-500 font-medium">Available upon request</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Sticky Booking Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-accent-500"></div>

                                <div className="flex items-baseline justify-between mb-6">
                                    <span className="text-gray-500 font-medium">Hourly Rate</span>
                                    <div className="text-right">
                                        <span className="text-3xl font-extrabold text-gray-900">₦{tutor.hourly_rate_min.toLocaleString()}</span>
                                        <span className="text-gray-400 text-sm font-medium">/hr</span>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl">
                                        <Clock className="w-5 h-5 text-primary-600" />
                                        <span className="font-medium">60 min session</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl">
                                        <MapPin className="w-5 h-5 text-primary-600" />
                                        <span className="font-medium">Online or In-person</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl">
                                        <ShieldCheck className="w-5 h-5 text-primary-600" />
                                        <span className="font-medium">Satisfaction Guaranteed</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowBookingModal(true)}
                                    className="w-full btn-primary py-4 text-lg shadow-xl shadow-primary-600/20 mb-3"
                                >
                                    Book a Session
                                </button>
                                <button
                                    onClick={() => navigate('/messages')}
                                    className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:border-primary-600 hover:text-primary-600 transition-all"
                                >
                                    Send Message
                                </button>
                            </div>

                            <div className="bg-gradient-to-br from-primary-900 to-gray-900 rounded-3xl p-6 text-white shadow-lg">
                                <h4 className="font-bold text-lg mb-2">Need help?</h4>
                                <p className="text-gray-300 text-sm mb-4">Chat with our support team to find the perfect match for your learning goals.</p>
                                <button className="text-white font-bold text-sm underline hover:text-primary-200">Contact Support</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Booking Modal */}
            <BookingModal
                isOpen={showBookingModal}
                onClose={() => setShowBookingModal(false)}
                tutorId={tutor.id}
                tutorName={displayName}
                hourlyRate={tutor.hourly_rate_min}
                subjects={tutor.subjects}
            />

            {/* Review Modal */}
            <ReviewModal
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                tutorName={displayName}
                onSubmit={handleReviewSubmit}
            />
        </div>
    )
}

function ReviewCard({ review }: { review: any }) {
    return (
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center font-bold text-gray-500 border border-gray-200">
                        {review.parent?.user?.raw_user_meta_data?.full_name?.[0] || 'U'}
                    </div>
                    <div>
                        <p className="font-bold text-gray-900">{review.parent?.user?.raw_user_meta_data?.full_name || 'Anonymous'}</p>
                        <p className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-gray-100 shadow-sm">
                    {[...Array(5)].map((_, i) => (
                        <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-200'
                                }`}
                        />
                    ))}
                </div>
            </div>
            <p className="text-gray-700 leading-relaxed">{review.comment}</p>
        </div>
    )
}
