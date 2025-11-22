import { useState } from 'react'
import { X, Calendar, Clock, CheckCircle, AlertCircle, ChevronRight, ShieldCheck, Loader2 } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

interface BookingModalProps {
    isOpen: boolean
    onClose: () => void
    tutorId: string
    tutorName: string
    hourlyRate: number
    subjects: string[]
}

type BookingStep = 'date' | 'details' | 'confirm' | 'success'

export default function BookingModal({ isOpen, onClose, tutorId, tutorName, hourlyRate, subjects }: BookingModalProps) {
    const { user, session } = useAuth()
    const navigate = useNavigate()
    const [step, setStep] = useState<BookingStep>('date')
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [selectedTime, setSelectedTime] = useState<string>('')
    const [selectedSubject, setSelectedSubject] = useState<string>('')
    const [notes, setNotes] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    if (!isOpen) return null

    // Mock available times
    const timeSlots = [
        '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'
    ]

    const handleNext = () => {
        if (step === 'date' && selectedDate && selectedTime) {
            setStep('details')
        } else if (step === 'details' && selectedSubject) {
            setStep('confirm')
        }
    }

    const handleBack = () => {
        if (step === 'details') setStep('date')
        else if (step === 'confirm') setStep('details')
    }

    const handleConfirm = async () => {
        if (!user || !session) {
            // Redirect to login if not authenticated
            // Ideally, we should save the current state to restore after login
            alert('Please log in to book a session')
            navigate('/login')
            return
        }

        setIsSubmitting(true)
        setError(null)

        try {
            console.log('Creating booking for tutor:', tutorId) // Debug log
            const bookingData = {
                tutor_id: tutorId,
                subject: selectedSubject,
                scheduled_date: selectedDate?.toISOString().split('T')[0],
                scheduled_start_time: selectedTime,
                scheduled_end_time: calculateEndTime(selectedTime),
                notes,
                price: hourlyRate
            }

            await api.bookings.create(bookingData, session.access_token)
            setStep('success')
        } catch (err: any) {
            console.error('Booking error:', err)
            setError(err.message || 'Failed to book session. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const calculateEndTime = (startTime: string) => {
        const [hours, minutes] = startTime.split(':').map(Number)
        const endHour = hours + 1
        return `${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    }

    // Simple calendar generation
    const generateCalendarDays = () => {
        const days = []
        const today = new Date()
        const currentMonth = today.getMonth()
        const daysInMonth = new Date(today.getFullYear(), currentMonth + 1, 0).getDate()

        for (let i = 1; i <= daysInMonth; i++) {
            days.push(new Date(today.getFullYear(), currentMonth, i))
        }
        return days
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-white border-b border-gray-100 p-6 flex items-center justify-between sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Book Session</h2>
                        <p className="text-sm text-gray-500">with {tutorName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Progress Bar */}
                {step !== 'success' && (
                    <div className="flex border-b border-gray-100 bg-gray-50/50">
                        <div className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider transition-colors ${step === 'date' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-400'}`}>
                            1. Time
                        </div>
                        <div className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider transition-colors ${step === 'details' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-400'}`}>
                            2. Details
                        </div>
                        <div className={`flex-1 py-3 text-center text-xs font-bold uppercase tracking-wider transition-colors ${step === 'confirm' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-400'}`}>
                            3. Confirm
                        </div>
                    </div>
                )}

                <div className="p-6 overflow-y-auto flex-1">
                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-100 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Step 1: Date & Time Selection */}
                    {step === 'date' && (
                        <div className="space-y-8">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-primary-600" />
                                    Select Date
                                </label>
                                <div className="grid grid-cols-7 gap-2 mb-2">
                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                        <div key={d} className="text-center text-xs font-bold text-gray-400 uppercase">{d}</div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-2">
                                    {generateCalendarDays().map((date, i) => {
                                        const isSelected = selectedDate?.toDateString() === date.toDateString()
                                        const isPast = date < new Date(new Date().setHours(0, 0, 0, 0))
                                        return (
                                            <button
                                                key={i}
                                                disabled={isPast}
                                                onClick={() => setSelectedDate(date)}
                                                className={`
                                                    aspect-square rounded-xl text-sm font-semibold transition-all flex items-center justify-center
                                                    ${isSelected
                                                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30 scale-105'
                                                        : isPast
                                                            ? 'text-gray-300 cursor-not-allowed'
                                                            : 'hover:bg-primary-50 text-gray-700 hover:text-primary-700'
                                                    }
                                                `}
                                            >
                                                {date.getDate()}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-primary-600" />
                                    Select Time
                                </label>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                    {timeSlots.map(time => (
                                        <button
                                            key={time}
                                            onClick={() => setSelectedTime(time)}
                                            className={`
                                                py-2.5 px-3 rounded-xl text-sm font-semibold border transition-all
                                                ${selectedTime === time
                                                    ? 'border-primary-600 bg-primary-50 text-primary-700 shadow-sm'
                                                    : 'border-gray-200 hover:border-primary-300 text-gray-600 hover:bg-gray-50'
                                                }
                                            `}
                                        >
                                            {time}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Session Details */}
                    {step === 'details' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Subject</label>
                                <select
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    className="w-full p-4 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all bg-gray-50 focus:bg-white"
                                >
                                    <option value="">Select a subject...</option>
                                    {subjects.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-900 mb-2">Learning Goals / Notes</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="What would you like to focus on in this session?"
                                    className="w-full p-4 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all h-32 resize-none bg-gray-50 focus:bg-white"
                                />
                            </div>

                            <div className="bg-blue-50 p-4 rounded-xl flex items-start gap-3 border border-blue-100">
                                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-blue-800 leading-relaxed">
                                    The tutor will review your request and confirm the session. You won't be charged until the session is confirmed.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Confirmation */}
                    {step === 'confirm' && (
                        <div className="space-y-6">
                            <div className="bg-gray-50 p-6 rounded-2xl space-y-4 border border-gray-100">
                                <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                                    <span className="text-gray-500 font-medium">Tutor</span>
                                    <span className="font-bold text-gray-900">{tutorName}</span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                                    <span className="text-gray-500 font-medium">Date & Time</span>
                                    <span className="font-bold text-gray-900">
                                        {selectedDate?.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} at {selectedTime}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                                    <span className="text-gray-500 font-medium">Subject</span>
                                    <span className="font-bold text-gray-900">{selectedSubject}</span>
                                </div>
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-lg font-bold text-gray-900">Total Price</span>
                                    <span className="text-2xl font-extrabold text-primary-600">₦{hourlyRate.toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                                <ShieldCheck className="w-6 h-6 text-green-600 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-bold text-green-800">Secure Booking</p>
                                    <p className="text-xs text-green-600">Your payment details are encrypted and secure.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Success State */}
                    {step === 'success' && (
                        <div className="text-center py-8">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-small">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Request Sent!</h3>
                            <p className="text-gray-500 mb-8 max-w-xs mx-auto">
                                {tutorName} will review your request shortly. You'll receive a notification once confirmed.
                            </p>
                            <button
                                onClick={onClose}
                                className="btn-primary px-8 py-3 w-full"
                            >
                                Return to Profile
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                {step !== 'success' && (
                    <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center sticky bottom-0 z-10">
                        {step !== 'date' ? (
                            <button
                                onClick={handleBack}
                                className="px-6 py-3 text-gray-600 font-semibold hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
                            >
                                Back
                            </button>
                        ) : (
                            <div></div>
                        )}

                        {step === 'confirm' ? (
                            <button
                                onClick={handleConfirm}
                                disabled={isSubmitting}
                                className="btn-primary px-8 py-3 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary-600/20"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        Confirm Booking
                                        <CheckCircle className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                disabled={
                                    (step === 'date' && (!selectedDate || !selectedTime)) ||
                                    (step === 'details' && !selectedSubject)
                                }
                                className="btn-primary px-8 py-3 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-600/20"
                            >
                                Next Step
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
