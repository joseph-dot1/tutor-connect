import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Sparkles, BookOpen, FileText, Clipboard,
    ArrowLeft, Download, Copy, CheckCircle2, Loader2, Lightbulb
} from 'lucide-react'
import { aiApi, CurriculumParams, AssignmentParams, LessonPlanParams } from '../lib/ai'

type TabType = 'curriculum' | 'assignment' | 'lesson-plan'

export default function AIAssistantPage() {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState<TabType>('curriculum')
    const [isGenerating, setIsGenerating] = useState(false)
    const [generatedContent, setGeneratedContent] = useState<string>('')
    const [copied, setCopied] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Curriculum form state
    const [curriculumForm, setCurriculumForm] = useState<CurriculumParams>({
        subject: '',
        gradeLevel: '',
        duration: '',
        additionalInfo: ''
    })

    // Assignment form state
    const [assignmentForm, setAssignmentForm] = useState<AssignmentParams>({
        topic: '',
        difficulty: 'Medium',
        assignmentType: 'Homework',
        gradeLevel: '',
        additionalInfo: ''
    })

    // Lesson plan form state
    const [lessonPlanForm, setLessonPlanForm] = useState<LessonPlanParams>({
        topic: '',
        duration: '',
        gradeLevel: '',
        learningObjectives: '',
        additionalInfo: ''
    })

    const handleGenerateCurriculum = async () => {
        if (!curriculumForm.subject || !curriculumForm.gradeLevel || !curriculumForm.duration) {
            setError('Please fill in all required fields')
            return
        }

        setIsGenerating(true)
        setError(null)
        setGeneratedContent('')

        try {
            const result = await aiApi.generateCurriculum(curriculumForm)
            setGeneratedContent(result.curriculum)
        } catch (err: any) {
            setError(err.message || 'Failed to generate curriculum')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleGenerateAssignment = async () => {
        if (!assignmentForm.topic || !assignmentForm.difficulty || !assignmentForm.assignmentType) {
            setError('Please fill in all required fields')
            return
        }

        setIsGenerating(true)
        setError(null)
        setGeneratedContent('')

        try {
            const result = await aiApi.generateAssignment(assignmentForm)
            setGeneratedContent(result.assignment)
        } catch (err: any) {
            setError(err.message || 'Failed to generate assignment')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleGenerateLessonPlan = async () => {
        if (!lessonPlanForm.topic || !lessonPlanForm.duration) {
            setError('Please fill in all required fields')
            return
        }

        setIsGenerating(true)
        setError(null)
        setGeneratedContent('')

        try {
            const result = await aiApi.generateLessonPlan(lessonPlanForm)
            setGeneratedContent(result.lessonPlan)
        } catch (err: any) {
            setError(err.message || 'Failed to generate lesson plan')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedContent)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleDownload = () => {
        const blob = new Blob([generatedContent], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${activeTab}-${Date.now()}.txt`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 font-sans">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold transition-colors group"
                            >
                                <div className="p-2 rounded-full group-hover:bg-gray-100 transition-colors">
                                    <ArrowLeft className="w-5 h-5" />
                                </div>
                                Back to Dashboard
                            </button>
                        </div>
                        <div className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-full border border-purple-100">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                            <span className="font-bold text-purple-900 text-sm uppercase tracking-wide">AI Powered</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Page Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 rounded-full mb-4">
                        <Lightbulb className="w-6 h-6 text-white" />
                        <h1 className="text-2xl font-extrabold text-white">AI Teaching Assistant</h1>
                    </div>
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Let AI help you create comprehensive curriculum plans, engaging assignments, and detailed lesson plans in seconds
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left: Input Forms */}
                    <div className="space-y-6">
                        {/* Tabs */}
                        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="flex border-b border-gray-100">
                                <button
                                    onClick={() => {
                                        setActiveTab('curriculum')
                                        setGeneratedContent('')
                                        setError(null)
                                    }}
                                    className={`flex-1 py-4 px-6 text-sm font-bold flex items-center justify-center gap-2 transition-all relative ${activeTab === 'curriculum'
                                            ? 'text-primary-600 bg-primary-50'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <BookOpen className="w-5 h-5" />
                                    Curriculum
                                    {activeTab === 'curriculum' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600"></div>}
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveTab('assignment')
                                        setGeneratedContent('')
                                        setError(null)
                                    }}
                                    className={`flex-1 py-4 px-6 text-sm font-bold flex items-center justify-center gap-2 transition-all relative ${activeTab === 'assignment'
                                            ? 'text-primary-600 bg-primary-50'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <FileText className="w-5 h-5" />
                                    Assignment
                                    {activeTab === 'assignment' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600"></div>}
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveTab('lesson-plan')
                                        setGeneratedContent('')
                                        setError(null)
                                    }}
                                    className={`flex-1 py-4 px-6 text-sm font-bold flex items-center justify-center gap-2 transition-all relative ${activeTab === 'lesson-plan'
                                            ? 'text-primary-600 bg-primary-50'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <Clipboard className="w-5 h-5" />
                                    Lesson Plan
                                    {activeTab === 'lesson-plan' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600"></div>}
                                </button>
                            </div>

                            {/* Form Content */}
                            <div className="p-6">
                                {activeTab === 'curriculum' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Subject *</label>
                                            <input
                                                type="text"
                                                value={curriculumForm.subject}
                                                onChange={(e) => setCurriculumForm({ ...curriculumForm, subject: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="e.g., Mathematics, Physics, English"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Grade Level *</label>
                                            <input
                                                type="text"
                                                value={curriculumForm.gradeLevel}
                                                onChange={(e) => setCurriculumForm({ ...curriculumForm, gradeLevel: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="e.g., Grade 10, University Level"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Duration *</label>
                                            <input
                                                type="text"
                                                value={curriculumForm.duration}
                                                onChange={(e) => setCurriculumForm({ ...curriculumForm, duration: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="e.g., 12 weeks, 1 semester"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Additional Information</label>
                                            <textarea
                                                value={curriculumForm.additionalInfo}
                                                onChange={(e) => setCurriculumForm({ ...curriculumForm, additionalInfo: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                rows={3}
                                                placeholder="Any specific topics, focus areas, or requirements..."
                                            />
                                        </div>
                                        <button
                                            onClick={handleGenerateCurriculum}
                                            disabled={isGenerating}
                                            className="w-full btn-primary py-4 text-lg shadow-xl shadow-primary-600/20 flex items-center justify-center gap-2"
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-5 h-5" />
                                                    Generate Curriculum
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}

                                {activeTab === 'assignment' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Topic *</label>
                                            <input
                                                type="text"
                                                value={assignmentForm.topic}
                                                onChange={(e) => setAssignmentForm({ ...assignmentForm, topic: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="e.g., Quadratic Equations, Photosynthesis"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Assignment Type *</label>
                                            <select
                                                value={assignmentForm.assignmentType}
                                                onChange={(e) => setAssignmentForm({ ...assignmentForm, assignmentType: e.target.value as any })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            >
                                                <option value="Homework">Homework</option>
                                                <option value="Quiz">Quiz</option>
                                                <option value="Project">Project</option>
                                                <option value="Essay">Essay</option>
                                                <option value="Practice">Practice Exercises</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Difficulty *</label>
                                            <select
                                                value={assignmentForm.difficulty}
                                                onChange={(e) => setAssignmentForm({ ...assignmentForm, difficulty: e.target.value as any })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                            >
                                                <option value="Easy">Easy</option>
                                                <option value="Medium">Medium</option>
                                                <option value="Hard">Hard</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Grade Level</label>
                                            <input
                                                type="text"
                                                value={assignmentForm.gradeLevel}
                                                onChange={(e) => setAssignmentForm({ ...assignmentForm, gradeLevel: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="e.g., Grade 10"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Additional Information</label>
                                            <textarea
                                                value={assignmentForm.additionalInfo}
                                                onChange={(e) => setAssignmentForm({ ...assignmentForm, additionalInfo: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                rows={3}
                                                placeholder="Any specific requirements or focus areas..."
                                            />
                                        </div>
                                        <button
                                            onClick={handleGenerateAssignment}
                                            disabled={isGenerating}
                                            className="w-full btn-primary py-4 text-lg shadow-xl shadow-primary-600/20 flex items-center justify-center gap-2"
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-5 h-5" />
                                                    Generate Assignment
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}

                                {activeTab === 'lesson-plan' && (
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Topic *</label>
                                            <input
                                                type="text"
                                                value={lessonPlanForm.topic}
                                                onChange={(e) => setLessonPlanForm({ ...lessonPlanForm, topic: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="e.g., Introduction to Algebra"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Duration *</label>
                                            <input
                                                type="text"
                                                value={lessonPlanForm.duration}
                                                onChange={(e) => setLessonPlanForm({ ...lessonPlanForm, duration: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="e.g., 60 minutes, 1 hour"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Grade Level</label>
                                            <input
                                                type="text"
                                                value={lessonPlanForm.gradeLevel}
                                                onChange={(e) => setLessonPlanForm({ ...lessonPlanForm, gradeLevel: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                placeholder="e.g., Grade 9"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Learning Objectives</label>
                                            <textarea
                                                value={lessonPlanForm.learningObjectives}
                                                onChange={(e) => setLessonPlanForm({ ...lessonPlanForm, learningObjectives: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                rows={2}
                                                placeholder="What should students learn from this lesson?"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">Additional Information</label>
                                            <textarea
                                                value={lessonPlanForm.additionalInfo}
                                                onChange={(e) => setLessonPlanForm({ ...lessonPlanForm, additionalInfo: e.target.value })}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                rows={2}
                                                placeholder="Any specific activities, materials, or requirements..."
                                            />
                                        </div>
                                        <button
                                            onClick={handleGenerateLessonPlan}
                                            disabled={isGenerating}
                                            className="w-full btn-primary py-4 text-lg shadow-xl shadow-primary-600/20 flex items-center justify-center gap-2"
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <Sparkles className="w-5 h-5" />
                                                    Generate Lesson Plan
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Generated Content */}
                    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 sticky top-24 max-h-[calc(100vh-120px)] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-primary-600" />
                                Generated Content
                            </h3>
                            {generatedContent && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleCopy}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        title="Copy to clipboard"
                                    >
                                        {copied ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <Copy className="w-5 h-5 text-gray-600" />
                                        )}
                                    </button>
                                    <button
                                        onClick={handleDownload}
                                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        title="Download as file"
                                    >
                                        <Download className="w-5 h-5 text-gray-600" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
                                <p className="text-red-800 text-sm">{error}</p>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto">
                            {generatedContent ? (
                                <div className="prose prose-sm max-w-none">
                                    <pre className="whitespace-pre-wrap text-gray-700 leading-relaxed font-sans">
                                        {generatedContent}
                                    </pre>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                    <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                                        <Sparkles className="w-10 h-10 text-primary-600" />
                                    </div>
                                    <p className="text-gray-500 font-medium mb-2">
                                        {isGenerating ? 'AI is generating your content...' : 'Your generated content will appear here'}
                                    </p>
                                    <p className="text-gray-400 text-sm">
                                        Fill in the form and click generate to get started
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
