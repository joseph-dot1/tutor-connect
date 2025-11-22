import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, GraduationCap, Mail, Phone, BookOpen, Loader } from 'lucide-react'


interface Student {
    id: string
    name: string
    email: string
    phone: string
    grade: string
    subjects: string[]
    total_sessions: number
    upcoming_sessions: number
    avatar_url?: string
}

export default function StudentsPage() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [students, setStudents] = useState<Student[]>([])
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        loadStudents()
    }, [])

    const loadStudents = async () => {
        setLoading(true)
        // TODO: Fetch from API once booking backend is implemented
        // For now, using mock data
        setTimeout(() => {
            setStudents([
                {
                    id: '1',
                    name: 'John Doe',
                    email: 'john@example.com',
                    phone: '+234 800 000 0001',
                    grade: 'Grade 10',
                    subjects: ['Mathematics', 'Physics'],
                    total_sessions: 12,
                    upcoming_sessions: 3
                },
                {
                    id: '2',
                    name: 'Jane Smith',
                    email: 'jane@example.com',
                    phone: '+234 800 000 0002',
                    grade: 'Grade 11',
                    subjects: ['Chemistry', 'Biology'],
                    total_sessions: 8,
                    upcoming_sessions: 1
                },
                {
                    id: '3',
                    name: 'Mike Johnson',
                    email: 'mike@example.com',
                    phone: '+234 800 000 0003',
                    grade: 'Grade 9',
                    subjects: ['Mathematics'],
                    total_sessions: 5,
                    upcoming_sessions: 2
                }
            ])
            setLoading(false)
        }, 500)
    }

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

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
                        <div className="w-12 h-12 bg-gradient-to-br from-accent-600 to-accent-700 rounded-xl flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">My Students</h1>
                            <p className="text-gray-600">Manage your student relationships</p>
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
                                <p className="text-gray-600 text-sm mb-1">Total Students</p>
                                <p className="text-3xl font-bold text-gray-900">{students.length}</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>
                    <div className="glass-card rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-1">Total Sessions</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {students.reduce((sum, s) => sum + s.total_sessions, 0)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>
                    <div className="glass-card rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-600 text-sm mb-1">Upcoming Sessions</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    {students.reduce((sum, s) => sum + s.upcoming_sessions, 0)}
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <GraduationCap className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search students by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-6 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                    />
                </div>

                {/* Students List */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader className="w-8 h-8 text-primary-600 animate-spin" />
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <div className="glass-card rounded-xl p-12 text-center">
                        <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {searchQuery ? 'No students found' : 'No students yet'}
                        </h3>
                        <p className="text-gray-600">
                            {searchQuery
                                ? 'Try adjusting your search query'
                                : 'Students will appear here once they book sessions with you'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStudents.map((student) => (
                            <StudentCard key={student.id} student={student} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

function StudentCard({ student }: { student: Student }) {
    return (
        <div className="glass-card rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-primary-700 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {student.name.charAt(0)}
                </div>
                <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg">{student.name}</h3>
                    <p className="text-sm text-gray-600">{student.grade}</p>
                </div>
            </div>

            <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{student.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Phone className="w-4 h-4" />
                    <span>{student.phone}</span>
                </div>
            </div>

            <div className="mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Subjects</p>
                <div className="flex flex-wrap gap-2">
                    {student.subjects.map((subject, index) => (
                        <span key={index} className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-md">
                            {subject}
                        </span>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                    <p className="text-xs text-gray-500">Total Sessions</p>
                    <p className="text-lg font-bold text-gray-900">{student.total_sessions}</p>
                </div>
                <div>
                    <p className="text-xs text-gray-500">Upcoming</p>
                    <p className="text-lg font-bold text-primary-600">{student.upcoming_sessions}</p>
                </div>
            </div>
        </div>
    )
}
