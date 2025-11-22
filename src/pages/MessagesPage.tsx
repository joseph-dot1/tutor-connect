import { useState } from 'react'
import { Search, MoreHorizontal } from 'lucide-react'
import ChatInterface from '../components/ChatInterface'

// Mock data
const MOCK_CONVERSATIONS = [
    {
        id: '1',
        userId: 'tutor1',
        name: 'Adaeze Okonkwo',
        lastMessage: 'See you at the session tomorrow!',
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
        unread: 2,
        avatar: null
    },
    {
        id: '2',
        userId: 'tutor2',
        name: 'Chukwudi Okafor',
        lastMessage: 'The homework has been graded.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        unread: 0,
        avatar: null
    },
    {
        id: '3',
        userId: 'tutor3',
        name: 'Folake Adeyemi',
        lastMessage: 'Thanks for booking!',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        unread: 0,
        avatar: null
    }
]

const MOCK_MESSAGES = [
    {
        id: '1',
        senderId: 'tutor1',
        text: 'Hello! Thanks for booking a session.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        isRead: true
    },
    {
        id: '2',
        senderId: 'currentUser',
        text: 'Hi Adaeze, I am looking forward to it. My son needs help with Algebra.',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        isRead: true
    },
    {
        id: '3',
        senderId: 'tutor1',
        text: 'Perfect! I have prepared some materials for that. See you at the session tomorrow!',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        isRead: false
    }
]

export default function MessagesPage() {
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>('1')
    const [messages, setMessages] = useState(MOCK_MESSAGES)
    const [searchTerm, setSearchTerm] = useState('')

    const selectedConversation = MOCK_CONVERSATIONS.find(c => c.id === selectedConversationId)

    const handleSendMessage = (text: string) => {
        const newMessage = {
            id: Date.now().toString(),
            senderId: 'currentUser',
            text,
            timestamp: new Date(),
            isRead: false
        }
        setMessages([...messages, newMessage])
    }

    return (
        <div className="h-[calc(100vh-4rem)] bg-gray-50 p-4 md:p-6 flex gap-6">
            {/* Conversations List Sidebar */}
            <div className={`
        w-full md:w-80 lg:w-96 bg-white rounded-2xl shadow-lg flex flex-col border border-gray-200
        ${selectedConversationId ? 'hidden md:flex' : 'flex'}
      `}>
                <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {MOCK_CONVERSATIONS.filter(c =>
                        c.name.toLowerCase().includes(searchTerm.toLowerCase())
                    ).map(conversation => (
                        <button
                            key={conversation.id}
                            onClick={() => setSelectedConversationId(conversation.id)}
                            className={`w-full p-4 flex items-start gap-3 transition-colors border-b border-gray-50 hover:bg-gray-50
                ${selectedConversationId === conversation.id ? 'bg-primary-50 border-l-4 border-l-primary-600' : 'border-l-4 border-l-transparent'}
              `}
                        >
                            <div className="relative flex-shrink-0">
                                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-lg">
                                    {conversation.name.charAt(0)}
                                </div>
                                {conversation.unread > 0 && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                                        {conversation.unread}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                    <h3 className={`font-semibold truncate ${conversation.unread > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                                        {conversation.name}
                                    </h3>
                                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                        {conversation.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <p className={`text-sm truncate ${conversation.unread > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                                    {conversation.lastMessage}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`
        flex-1 h-full
        ${selectedConversationId ? 'flex' : 'hidden md:flex'}
      `}>
                {selectedConversation ? (
                    <ChatInterface
                        recipientName={selectedConversation.name}
                        messages={messages}
                        currentUserId="currentUser"
                        onSendMessage={handleSendMessage}
                        onBack={() => setSelectedConversationId(null)}
                    />
                ) : (
                    <div className="flex-1 bg-white rounded-2xl shadow-lg border border-gray-200 flex items-center justify-center text-center p-8">
                        <div className="max-w-md">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <MoreHorizontal className="w-10 h-10 text-gray-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Select a Conversation</h2>
                            <p className="text-gray-500">
                                Choose a conversation from the list to start chatting with your tutors.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
