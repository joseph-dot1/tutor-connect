import { Router, Response } from 'express'
import { Groq } from 'groq-sdk'
import { AuthRequest } from '../middleware/auth'

const router = Router()

// POST /api/ai-curriculum/generate - Generate curriculum
router.post('/generate', async (req: AuthRequest, res: Response) => {
    try {
        const { subject, gradeLevel, duration, additionalInfo } = req.body

        if (!subject || !gradeLevel || !duration) {
            return res.status(400).json({
                error: 'Missing required fields: subject, gradeLevel, duration'
            })
        }

        // Check if API key is configured
        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({
                error: 'Groq API key not configured'
            })
        }

        // Initialize Groq API
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY.trim() })

        const prompt = `Create a detailed curriculum plan for the following:
Subject: ${subject}
Grade Level: ${gradeLevel}
Duration: ${duration}
${additionalInfo ? `Additional Information: ${additionalInfo}` : ''}

Please provide:
1. Course Overview
2. Learning Objectives (5-7 key objectives)
3. Weekly Breakdown (with topics and subtopics for each week)
4. Recommended Resources
5. Assessment Methods

Format the response in a clear, structured manner that a tutor can directly use.`

        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 2000
        })

        const curriculum = completion.choices[0]?.message?.content || ''

        res.json({
            curriculum,
            metadata: {
                subject,
                gradeLevel,
                duration,
                generatedAt: new Date().toISOString()
            }
        })
    } catch (error: any) {
        console.error('Error generating curriculum:', error)
        res.status(500).json({
            error: 'Failed to generate curriculum',
            details: error.message
        })
    }
})

// POST /api/ai-curriculum/assignment - Generate assignment
router.post('/assignment', async (req: AuthRequest, res: Response) => {
    try {
        const { topic, difficulty, assignmentType, gradeLevel, additionalInfo } = req.body

        if (!topic || !difficulty || !assignmentType) {
            return res.status(400).json({
                error: 'Missing required fields: topic, difficulty, assignmentType'
            })
        }

        // Check if API key is configured
        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({
                error: 'Groq API key not configured'
            })
        }

        // Initialize Groq API
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY.trim() })

        const prompt = `Create a detailed ${assignmentType} assignment for students:
Topic: ${topic}
Difficulty Level: ${difficulty}
${gradeLevel ? `Grade Level: ${gradeLevel}` : ''}
${additionalInfo ? `Additional Information: ${additionalInfo}` : ''}

Please provide:
1. Assignment Title
2. Learning Objectives
3. Instructions (clear and detailed)
4. Questions/Tasks (appropriate for the difficulty level)
5. Grading Rubric
6. Estimated Time to Complete

Make it engaging and educational. Format the response clearly.`

        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 2000
        })

        const assignment = completion.choices[0]?.message?.content || ''

        res.json({
            assignment,
            metadata: {
                topic,
                difficulty,
                assignmentType,
                gradeLevel,
                generatedAt: new Date().toISOString()
            }
        })
    } catch (error: any) {
        console.error('Error generating assignment:', error)
        res.status(500).json({
            error: 'Failed to generate assignment',
            details: error.message
        })
    }
})

// POST /api/ai-curriculum/lesson-plan - Generate lesson plan
router.post('/lesson-plan', async (req: AuthRequest, res: Response) => {
    try {
        const { topic, duration, gradeLevel, learningObjectives, additionalInfo } = req.body

        if (!topic || !duration) {
            return res.status(400).json({
                error: 'Missing required fields: topic, duration'
            })
        }

        // Check if API key is configured
        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({
                error: 'Groq API key not configured'
            })
        }

        // Initialize Groq API
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY.trim() })

        const prompt = `Create a detailed lesson plan for:
Topic: ${topic}
Duration: ${duration}
${gradeLevel ? `Grade Level: ${gradeLevel}` : ''}
${learningObjectives ? `Learning Objectives: ${learningObjectives}` : ''}
${additionalInfo ? `Additional Information: ${additionalInfo}` : ''}

Please provide:
1. Lesson Title
2. Learning Objectives
3. Materials Needed
4. Introduction/Hook (to engage students)
5. Main Activities (with timing)
6. Practice Exercises
7. Closure/Summary
8. Assessment/Homework

Format it in a way that's easy to follow during an actual lesson.`

        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: prompt }],
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 2000
        })

        const lessonPlan = completion.choices[0]?.message?.content || ''

        res.json({
            lessonPlan,
            metadata: {
                topic,
                duration,
                gradeLevel,
                generatedAt: new Date().toISOString()
            }
        })
    } catch (error: any) {
        console.error('Error generating lesson plan:', error)
        res.status(500).json({
            error: 'Failed to generate lesson plan',
            details: error.message
        })
    }
})

export default router
