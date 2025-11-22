import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import { LogOut, User, Calendar, Star, BookOpen, Users, MessageCircle, Search, GraduationCap, Settings, Sparkles } from 'lucide-react'
import AddChildModal from '../components/AddChildModal'
import { getParentProfile, createParentProfile, getChildren, getTutorProfile } from '../lib/database'
import { api } from '../lib/api'

export default function DashboardPage() {
    const { user, session, signOut } = useAuth()
    const navigate = useNavigate()
    const [isAddChildModalOpen, setIsAddChildModalOpen] = useState(false)
    const [parentId, setParentId] = useState<string | null>(null)
    const [children, setChildren] = useState<any[]>([])
    const [loadingChildren, setLoadingChildren] = useState(false)
    const [bookings, setBookings] = useState<any[]>([])
    const [loadingBookings, setLoadingBookings] = useState(false)

    // Get parent ID if user is a parent
    useEffect(() => {
        async function fetchProfile() {
            if (!user) return

            if (user.role === 'parent') {
                try {
                    console.log('Fetching parent profile for user:', user.id)
                    // Try to get existing profile
                    let profile = await getParentProfile(user.id)

                    // Auto-create if missing
                    if (!profile) {
                        console.warn('No parent profile found. Attempting to create one...')
                        try {
                            profile = await createParentProfile(user.id, {
                                location_address: 'Not specified'
                            })
                        } catch (createError) {
                            console.error('Failed to auto-create parent profile:', createError)
                        }
                    }

                    if (profile) {
                        console.log('Parent profile confirmed:', profile.id)
                        setParentId(profile.id)

                        // Fetch children
                        setLoadingChildren(true)
                        try {
                            const childrenData = await getChildren(profile.id)
                            setChildren(childrenData || [])
                        } catch (childError) {
                            console.error('Error fetching children:', childError)
                        } finally {
                            setLoadingChildren(false)
                        }
                    }
                } catch (error) {
                    console.error('Error fetching parent profile:', error)
                }
            } else if (user.role === 'tutor') {
                console.log('User is a tutor, checking profile...')
                // Check if tutor profile is complete
                try {
                    const profile = await getTutorProfile(user.id)
                    console.log('Tutor profile fetched:', profile)

                    // If profile is missing OR subjects are empty, redirect
                    if (!profile || !profile.subjects || profile.subjects.length === 0) {
                        console.log('Tutor profile incomplete (missing subjects), redirecting to onboarding...')
                        navigate('/tutor-onboarding')
                    } else {
                        console.log('Tutor profile appears complete.')
                    }
                } catch (error) {
                    console.error('Error checking tutor profile:', error)
                }
            }
        }
        fetchProfile()
    }, [user, navigate])

    // Fetch bookings for the user
    useEffect(() => {
        async function fetchBookings() {
            if (!session?.access_token) return

            setLoadingBookings(true)
            try {
                const bookingsData = await api.bookings.list(session.access_token)
                setBookings(bookingsData || [])
            } catch (error) {
                console.error('Error fetching bookings:', error)
            } finally {
                setLoadingBookings(false)
            }
        }
        fetchBookings()
    }, [session])

    const handleLogout = async () => {
        await signOut()
        navigate('/login')
    }

    const handleAddChildSuccess = async () => {
        console.log('Child added successfully!')
        // Refresh children list
        if (parentId) {
            const childrenData = await getChildren(parentId)
            setChildren(childrenData || [])
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
            {/* Header */}
            <header className="glass-card border-b border-white/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-700 to-primary-900 bg-clip-text text-transparent">
                                TutorConnect
                            </h1>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 px-4 py-2 bg-white rounded-lg border border-gray-200">
                                <User className="w-5 h-5 text-gray-600" />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">{user?.full_name}</p>
                                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/settings')}
                                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Profile Settings"
                            >
                                <Settings className="w-5 h-5" />
                                <span className="font-semibold">Settings</span>
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="font-semibold">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome back, {user?.full_name}! 👋
                    </h2>
                    <p className="text-gray-600">
                        {user?.role === 'parent'
                            ? "Manage your children's learning journey and connect with qualified tutors."
                            : 'View your upcoming sessions and manage your teaching schedule.'}
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard
                        icon={<Calendar className="w-6 h-6" />}
                        title="Upcoming Sessions"
                        value={loadingBookings ? '...' : bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length.toString()}
                        color="primary"
                    />
                    <StatCard
                        icon={<Star className="w-6 h-6" />}
                        title={user?.role === 'parent' ? 'Active Tutors' : 'Average Rating'}
                        value={user?.role === 'parent' ? '0' : 'N/A'}
                        color="accent"
                    />
                    <StatCard
                        icon={<Users className="w-6 h-6" />}
                        title={user?.role === 'parent' ? 'Children' : 'Total Students'}
                        value={children.length.toString()}
                        color="primary"
                    />
                </div>

                {/* Quick Actions */}
                <div className="glass-card rounded-2xl p-8 mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {user?.role === 'parent' ? (
                            <>
                                <ActionButton
                                    icon={<Search className="w-6 h-6 text-primary-600" />}
                                    title="Find Tutors"
                                    description="Search for qualified tutors"
                                    onClick={() => navigate('/search')}
                                />
                                <ActionButton
                                    icon={<MessageCircle className="w-6 h-6 text-green-600" />}
                                    title="Messages"
                                    description="Chat with tutors"
                                    onClick={() => navigate('/messages')}
                                />
                                <ActionButton
                                    icon={<Users className="w-6 h-6 text-blue-600" />}
                                    title="Add Child"
                                    description="Add a new child profile"
                                    onClick={() => {
                                        console.log('Add Child clicked. ParentID:', parentId)
                                        if (!parentId) {
                                            alert('Error: Parent profile not found. Please try refreshing the page or logging out and back in.')
                                            return
                                        }
                                        setIsAddChildModalOpen(true)
                                    }}
                                />
                                <ActionButton
                                    icon={<Settings className="w-6 h-6 text-gray-600" />}
                                    title="Profile Settings"
                                    description="Update your personal info"
                                    onClick={() => navigate('/settings')}
                                />
                            </>
                        ) : (
                            <>
                                <ActionButton
                                    icon={<Sparkles className="w-6 h-6 text-purple-600" />}
                                    title="AI Assistant"
                                    description="Generate curricula & assignments"
                                    onClick={() => navigate('/ai-assistant')}
                                />
                                <ActionButton
                                    icon={<Calendar className="w-6 h-6 text-primary-600" />}
                                    title="My Schedule"
                                    description="View your teaching schedule"
                                    onClick={() => navigate('/schedule')}
                                />
                                <ActionButton
                                    icon={<Users className="w-6 h-6 text-accent-600" />}
                                    title="Students"
                                    description="Manage your students"
                                    onClick={() => navigate('/students')}
                                />
                                <ActionButton
                                    icon={<BookOpen className="w-6 h-6 text-green-600" />}
                                    title="Upload Notes"
                                    description="Share lesson materials"
                                    onClick={() => navigate('/upload-notes')}
                                />
                                <ActionButton
                                    icon={<User className="w-6 h-6 text-blue-600" />}
                                    title="Complete Profile"
                                    description="Update your tutor details"
                                    onClick={() => navigate('/tutor-onboarding')}
                                />
                                <ActionButton
                                    icon={<Settings className="w-6 h-6 text-gray-600" />}
                                    title="Profile Settings"
                                    description="Update your personal info"
                                    onClick={() => navigate('/settings')}
                                />
                            </>
                        )}
                    </div>
                </div>

                {/* My Children Section (Only for Parents) */}
                {user?.role === 'parent' && (
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900">My Children</h3>
                        </div>

                        {loadingChildren ? (
                            <div className="text-center py-8 text-gray-500">Loading children...</div>
                        ) : children.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {children.map((child) => (
                                    <div key={child.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                <GraduationCap className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                                                {child.age} years old
                                            </span>
                                        </div>
                                        <h4 className="text-lg font-bold text-gray-900 mb-1">{child.name}</h4>
                                        <p className="text-sm text-gray-500 mb-4">{child.grade}</p>

                                        <div className="space-y-2">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Subjects Needed</p>
                                            <div className="flex flex-wrap gap-2">
                                                {child.subjects_needed && child.subjects_needed.map((subject: string, index: number) => (
                                                    <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                                                        {subject}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Add Child Card */}
                                <button
                                    onClick={() => setIsAddChildModalOpen(true)}
                                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all group h-full min-h-[200px]"
                                >
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                                        <Users className="w-6 h-6 text-gray-400 group-hover:text-blue-600" />
                                    </div>
                                    <span className="font-semibold text-gray-600 group-hover:text-blue-700">Add Another Child</span>
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Users className="w-8 h-8 text-gray-400" />
                                </div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-2">No children added yet</h4>
                                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                    Add your children's profiles to start finding tutors and booking sessions for them.
                                </p>
                                <button
                                    onClick={() => setIsAddChildModalOpen(true)}
                                    className="btn-primary px-6 py-2"
                                >
                                    Add Your First Child
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Upcoming Sessions */}
                <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Upcoming Sessions</h3>
                    {loadingBookings ? (
                        <div className="text-center py-8 text-gray-500">Loading sessions...</div>
                    ) : bookings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {bookings.map((booking: any) => (
                                <SessionCard
                                    key={booking.id}
                                    booking={booking}
                                    userRole={user?.role || 'parent'}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Calendar className="w-8 h-8 text-gray-400" />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">No sessions yet</h4>
                            <p className="text-gray-500">
                                {user?.role === 'parent'
                                    ? 'Book your first session with a qualified tutor!'
                                    : 'No upcoming teaching sessions scheduled yet.'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Coming Soon Banner */}
                <div className="mt-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white">
                    <h3 className="text-2xl font-bold mb-2">🚀 More Features Coming Soon!</h3>
                    <p className="text-primary-100">
                        We're building an amazing platform with session management, AI-powered learning tools,
                        real-time notifications, and much more. Stay tuned!
                    </p>
                </div>
            </main>

            {/* Add Child Modal */}
            {parentId && (
                <AddChildModal
                    isOpen={isAddChildModalOpen}
                    onClose={() => setIsAddChildModalOpen(false)}
                    onSuccess={handleAddChildSuccess}
                    parentId={parentId}
                />
            )}
        </div>
    )
}

function StatCard({ icon, title, value, color }: { icon: React.ReactNode; title: string; value: string; color: 'primary' | 'accent' }) {
    const bgColor = color === 'primary' ? 'bg-primary-100' : 'bg-accent-100'
    const textColor = color === 'primary' ? 'text-primary-600' : 'text-accent-600'

    return (
        <div className="glass-card rounded-xl p-6">
            <div className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center ${textColor} mb-4`}>
                {icon}
            </div>
            <p className="text-gray-600 text-sm mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
    )
}

function ActionButton({ icon, title, description, onClick }: { icon: React.ReactNode; title: string; description: string; onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className="text-left p-4 rounded-xl border-2 border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all duration-300 group flex items-start gap-4"
        >
            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
                {icon}
            </div>
            <div>
                <h4 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-700">{title}</h4>
                <p className="text-sm text-gray-600">{description}</p>
            </div>
        </button>
    )
}

function SessionCard({ booking, userRole }: { booking: any; userRole: 'tutor' | 'parent' | 'admin' }) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    const formatTime = (timeString: string) => {
        return timeString || 'TBD'
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-100 text-green-700'
            case 'pending':
                return 'bg-yellow-100 text-yellow-700'
            case 'completed':
                return 'bg-blue-100 text-blue-700'
            case 'cancelled':
                return 'bg-red-100 text-red-700'
            default:
                return 'bg-gray-100 text-gray-700'
        }
    }

    // Extract names from the booking object
    const tutorName = booking.tutor?.user?.raw_user_meta_data?.full_name || 'Tutor'
    const parentName = booking.parent?.user?.raw_user_meta_data?.full_name || 'Parent'

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            {/* Status Badge */}
            <div className="flex items-center justify-between mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${getStatusColor(booking.status)}`}>
                    {booking.status}
                </span>
                <span className="text-sm text-gray-500">{formatDate(booking.session_date)}</span>
            </div>

            {/* Subject */}
            <h4 className="text-lg font-bold text-gray-900 mb-3">{booking.subject}</h4>

            {/* Session Details */}
            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{formatTime(booking.session_time)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="w-4 h-4" />
                    <span>{userRole === 'tutor' ? `Student: ${parentName}` : `Tutor: ${tutorName}`}</span>
                </div>
            </div>

            {/* Session Mode */}
            {booking.mode && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500">
                        Mode: <span className="font-medium text-gray-700 capitalize">{booking.mode}</span>
                    </p>
                </div>
            )}
        </div>
    )
}
