import { useState } from 'react'
import { Star, X, Loader2, MessageSquare, ThumbsUp, CheckCircle } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

interface ReviewModalProps {
    isOpen: boolean
    onClose: () => void
    tutorName: string
    onSubmit: (review: any) => Promise<void>
}

const AVAILABLE_TAGS = [
    'Patient', 'Knowledgeable', 'Punctual', 'Engaging',
    'Effective', 'Friendly', 'Professional', 'Encouraging'
]

export default function ReviewModal({ isOpen, onClose, tutorName, onSubmit }: ReviewModalProps) {
    const { user, session } = useAuth()
    const navigate = useNavigate()
    const [rating, setRating] = useState(0)
    const [hoveredRating, setHoveredRating] = useState(0)
    const [comment, setComment] = useState('')
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (rating === 0) return

        if (!user || !session) {
            alert('Please log in to submit a review')
            navigate('/login')
            return
        }

        setIsSubmitting(true)
        try {
            const reviewData = {
                tutor_id: 'd290f1ee-6c54-4b01-90e6-d701748f0851', // TODO: Pass real tutor ID prop
                rating,
                comment,
                tags: selectedTags
            }

            await api.reviews.create(reviewData, session.access_token)

            // Call parent handler if needed (e.g. to refresh list)
            if (onSubmit) await onSubmit(reviewData)

            setIsSuccess(true)
            setTimeout(() => {
                onClose()
                setIsSuccess(false)
                setRating(0)
                setComment('')
                setSelectedTags([])
            }, 2000)
        } catch (error) {
            console.error('Failed to submit review:', error)
            alert('Failed to submit review. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag))
        } else {
            if (selectedTags.length < 3) {
                setSelectedTags([...selectedTags, tag])
            }
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up relative">
                {/* Success Overlay */}
                {isSuccess && (
                    <div className="absolute inset-0 bg-white z-10 flex flex-col items-center justify-center animate-fade-in">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce-small">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Review Submitted!</h3>
                        <p className="text-gray-500">Thank you for your feedback.</p>
                    </div>
                )}

                {/* Header */}
                <div className="bg-white border-b border-gray-100 p-6 flex items-center justify-between sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Write a Review</h2>
                        <p className="text-sm text-gray-500">for {tutorName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {/* Star Rating */}
                    <div className="flex flex-col items-center gap-4 py-4">
                        <div className="flex gap-3">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    onClick={() => setRating(star)}
                                    className="group focus:outline-none transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`w-12 h-12 transition-all duration-200 ${star <= (hoveredRating || rating)
                                            ? 'text-yellow-400 fill-yellow-400 drop-shadow-md'
                                            : 'text-gray-200 group-hover:text-yellow-200'
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        <p className="text-lg font-semibold text-primary-600 h-6">
                            {rating === 5 ? 'Excellent!' :
                                rating === 4 ? 'Very Good' :
                                    rating === 3 ? 'Good' :
                                        rating === 2 ? 'Fair' :
                                            rating === 1 ? 'Poor' : ''}
                        </p>
                    </div>

                    {/* Tags */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-900">
                            <ThumbsUp className="w-4 h-4 text-primary-600" />
                            What went well? <span className="text-gray-400 font-normal">(Select up to 3)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {AVAILABLE_TAGS.map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => toggleTag(tag)}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border ${selectedTags.includes(tag)
                                        ? 'bg-primary-600 text-white border-primary-600 shadow-md shadow-primary-600/20 transform scale-105'
                                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-primary-300 hover:bg-white'
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Comment */}
                    <div className="space-y-3">
                        <label htmlFor="comment" className="flex items-center gap-2 text-sm font-bold text-gray-900">
                            <MessageSquare className="w-4 h-4 text-primary-600" />
                            Share your experience
                        </label>
                        <textarea
                            id="comment"
                            rows={4}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Tell us about your session. How was the tutor's teaching style?"
                            className="w-full p-4 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 outline-none transition-all resize-none bg-gray-50 focus:bg-white"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3.5 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={rating === 0 || isSubmitting}
                            className="flex-[2] btn-primary py-3.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-600/20"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                'Submit Review'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
