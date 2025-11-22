import { Router, Response } from 'express'
import { supabase } from '../server'
import { AuthRequest } from '../middleware/auth'

const router = Router()

// GET /api/messages/conversations - List all conversations for the current user
router.get('/conversations', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        // If mock user, return mock conversations
        if (req.user?.email?.includes('test')) {
            return res.json([
                {
                    user: {
                        id: 'mock-tutor-id',
                        full_name: 'David O.',
                        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
                        role: 'tutor'
                    },
                    last_message: {
                        content: 'See you tomorrow at 4 PM!',
                        created_at: new Date().toISOString(),
                        is_read: false
                    },
                    unread_count: 1
                },
                {
                    user: {
                        id: 'mock-parent-id',
                        full_name: 'Sarah J.',
                        avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
                        role: 'parent'
                    },
                    last_message: {
                        content: 'Thanks for the lesson!',
                        created_at: new Date(Date.now() - 86400000).toISOString(),
                        is_read: true
                    },
                    unread_count: 0
                }
            ])
        }

        // Fetch all messages where user is sender or receiver
        const { data: messages, error } = await supabase
            .from('messages')
            .select(`
                *,
                sender:sender_id(raw_user_meta_data),
                receiver:receiver_id(raw_user_meta_data)
            `)
            .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching messages:', error)
            return res.status(500).json({ error: 'Failed to fetch messages' })
        }

        // Process messages to group by conversation
        const conversations = new Map()

        messages.forEach((msg: any) => {
            const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id
            const otherUser = msg.sender_id === userId ? msg.receiver : msg.sender

            if (!conversations.has(otherUserId)) {
                conversations.set(otherUserId, {
                    user: {
                        id: otherUserId,
                        full_name: otherUser?.raw_user_meta_data?.full_name || 'Unknown User',
                        avatar_url: otherUser?.raw_user_meta_data?.avatar_url,
                        role: otherUser?.raw_user_meta_data?.role
                    },
                    last_message: {
                        content: msg.content,
                        created_at: msg.created_at,
                        is_read: msg.is_read
                    },
                    unread_count: 0
                })
            }

            if (msg.receiver_id === userId && !msg.is_read) {
                conversations.get(otherUserId).unread_count++
            }
        })

        res.json(Array.from(conversations.values()))

    } catch (error) {
        console.error('Error in conversations route:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// GET /api/messages/:userId - Get messages with a specific user
router.get('/:otherUserId', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id
        const { otherUserId } = req.params

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        // Mock response
        if (req.user?.email?.includes('test')) {
            return res.json([
                {
                    id: '1',
                    sender_id: otherUserId,
                    receiver_id: userId,
                    content: 'Hello! I am interested in your math lessons.',
                    created_at: new Date(Date.now() - 10000000).toISOString(),
                    is_read: true
                },
                {
                    id: '2',
                    sender_id: userId,
                    receiver_id: otherUserId,
                    content: 'Hi! Thanks for reaching out. I have availability this week.',
                    created_at: new Date(Date.now() - 9000000).toISOString(),
                    is_read: true
                },
                {
                    id: '3',
                    sender_id: otherUserId,
                    receiver_id: userId,
                    content: 'Great, how about Tuesday at 4 PM?',
                    created_at: new Date(Date.now() - 8000000).toISOString(),
                    is_read: false
                }
            ])
        }

        const { data: messages, error } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
            .order('created_at', { ascending: true })

        if (error) {
            return res.status(500).json({ error: 'Failed to fetch messages' })
        }

        res.json(messages)

    } catch (error) {
        console.error('Error fetching chat history:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

// POST /api/messages - Send a message
router.post('/', async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id
        const { receiver_id, content } = req.body

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        if (!receiver_id || !content) {
            return res.status(400).json({ error: 'Missing required fields' })
        }

        // Mock response
        if (req.user?.email?.includes('test')) {
            return res.json({
                id: 'mock-new-message-id',
                sender_id: userId,
                receiver_id,
                content,
                created_at: new Date().toISOString(),
                is_read: false
            })
        }

        const { data: message, error } = await supabase
            .from('messages')
            .insert({
                sender_id: userId,
                receiver_id,
                content
            })
            .select()
            .single()

        if (error) {
            console.error('Supabase error:', error)
            return res.status(500).json({ error: 'Failed to send message' })
        }

        res.json(message)

    } catch (error) {
        console.error('Error sending message:', error)
        res.status(500).json({ error: 'Internal server error' })
    }
})

export default router
