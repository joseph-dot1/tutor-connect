const API_URL = 'http://localhost:3000/api'

export interface CurriculumParams {
    subject: string
    gradeLevel: string
    duration: string
    additionalInfo?: string
}

export interface AssignmentParams {
    topic: string
    difficulty: 'Easy' | 'Medium' | 'Hard'
    assignmentType: 'Homework' | 'Quiz' | 'Project' | 'Essay' | 'Practice'
    gradeLevel?: string
    additionalInfo?: string
}

export interface LessonPlanParams {
    topic: string
    duration: string
    gradeLevel?: string
    learningObjectives?: string
    additionalInfo?: string
}

export const aiApi = {
    generateCurriculum: async (params: CurriculumParams) => {
        const response = await fetch(`${API_URL}/ai-curriculum/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params)
        })
        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to generate curriculum')
        }
        return response.json()
    },

    generateAssignment: async (params: AssignmentParams) => {
        const response = await fetch(`${API_URL}/ai-curriculum/assignment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params)
        })
        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to generate assignment')
        }
        return response.json()
    },

    generateLessonPlan: async (params: LessonPlanParams) => {
        const response = await fetch(`${API_URL}/ai-curriculum/lesson-plan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params)
        })
        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Failed to generate lesson plan')
        }
        return response.json()
    }
}
