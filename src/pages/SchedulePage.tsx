import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Calendar, Clock, User, MapPin, Video, CheckCircle, XCircle, Loader } from 'lucide-react'


interface Session {
    id: string
    student_name: string
    subject: string
    date: string
    time: string
    duration: number
    location_type: 'online' | 'in-person'
    status: 'upcoming' | 'completed' | 'cancelled'
}

export default function SchedulePage() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [sessions, setSessions] = useState<Session[]>([])
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all')

    useEffect(() => {
        loadSessions()
    }, [])

    const loadSessions = async () => {
        setLoading(true)
        // TODO: Fetch from API once booking backend is implemented
        // For now, using mock data
        setTimeout(() => {
            setSessions([
                {
                    id: '1',
                    student_name: 'John Doe',
                    subject: 'Mathematics',
                    date: '2025-11-25',
                    time: '10:00 AM',
                    duration: 60,
                    location_type: 'online',
                    status: 'upcoming'
                },
                {
                    id: '2',
                    student_name: 'Jane Smith',
                    subject: 'Physics',
                    date: '2025-11-20',
                    time: '2:00 PM',
                    duration: 90,
                    location_type: 'in-person',
                    status: 'completed'
                }
            ])
            setLoading(false)
        }, 500)
    }

    const filteredSessions = sessions.filter(session => {
        if (filter === 'all') return true
        return session.status === filter
    })

    const upcomingCount = sessions.filter(s => s.status === 'upcoming').length
    const completedCount = sessions.filter(s => s.status === 'completed').length

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
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
                            <p className="text-gray-600">Manage your teaching sessions</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="glass-card rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-1">Upcoming Sessions</p>
                                <p className="text-3xl font-bold text-gray-900">{upcomingCount}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="glass-card rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-1">Completed Sessions</p>
                                <p className="text-3xl font-bold text-gray-900">{completedCount}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="glass-card rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-1">Total Sessions</p>
                                <p className="text-3xl font-bold text-gray-900">{sessions.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-6 py-2 rounded-lg font-semibold transition-colors ${filter === 'all'
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        All Sessions
                    </button>
                    <button
                        onClick={() => setFilter('upcoming')}
                        className={`px-6 py-2 rounded-lg font-semibold transition-colors ${filter === 'upcoming'
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Upcoming
                    </button>
                    <button
                        onClick={() => setFilter('completed')}
                        className={`px-6 py-2 rounded-lg font-semibold transition-colors ${filter === 'completed'
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Completed
                    </button>
                </div>

                {/* Sessions List */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader className="w-8 h-8 text-primary-600 animate-spin" />
                    </div>
                ) : filteredSessions.length === 0 ? (
                    <div className="glass-card rounded-xl p-12 text-center">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No sessions found</h3>
                        <p className="text-gray-600">
                            {filter === 'all'
                                ? "You don't have any sessions yet."
                                : `You don't have any ${filter} sessions.`}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredSessions.map((session) => (
                            <SessionCard key={session.id} session={session} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

function SessionCard({ session }: { session: Session }) {
    const statusConfig = {
        upcoming: { color: 'bg-blue-100 text-blue-700', icon: Clock },
        completed: { color: 'bg-green-100 text-green-700', icon: CheckCircle },
        cancelled: { color: 'bg-red-100 text-red-700', icon: XCircle }
    }

    const config = statusConfig[session.status]
    const StatusIcon = config.icon

    return (
        <div className="glass-card rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                        <User className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">{session.student_name}</h3>
                        <p className="text-gray-600">{session.subject}</p>
                    </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${config.color} flex items-center gap-2`}>
                    <StatusIcon className="w-4 h-4" />
                    {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{new Date(session.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{session.time}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{session.duration} min</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                    {session.location_type === 'online' ? (
                        <Video className="w-4 h-4" />
                    ) : (
                        <MapPin className="w-4 h-4" />
                    )}
                    <span className="text-sm capitalize">{session.location_type}</span>
                </div>
            </div>
        </div>
    )
}
