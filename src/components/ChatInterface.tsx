import { useState, useRef, useEffect } from 'react'
import { Send, Paperclip, MoreVertical, Phone, Video, ArrowLeft } from 'lucide-react'

interface Message {
    id: string
    senderId: string
    text: string
    timestamp: Date
    isRead: boolean
}

interface ChatInterfaceProps {
    recipientName: string
    recipientAvatar?: string
    messages: Message[]
    currentUserId: string
    onSendMessage: (text: string) => void
    onBack?: () => void
}

export default function ChatInterface({
    recipientName,
    recipientAvatar,
    messages,
    currentUserId,
    onSendMessage,
    onBack
}: ChatInterfaceProps) {
    const [newMessage, setNewMessage] = useState('')
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault()
        if (newMessage.trim()) {
            onSendMessage(newMessage)
            setNewMessage('')
        }
    }

    return (
        <div className="flex flex-col h-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-100 p-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    {onBack && (
                        <button onClick={onBack} className="md:hidden p-2 -ml-2 text-gray-600">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div className="relative">
                        {recipientAvatar ? (
                            <img src={recipientAvatar} alt={recipientName} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                                {recipientName.charAt(0)}
                            </div>
                        )}
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900">{recipientName}</h3>
                        <p className="text-xs text-green-600 font-medium">Online</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <Video className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg) => {
                    const isMe = msg.senderId === currentUserId
                    return (
                        <div
                            key={msg.id}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${isMe
                                    ? 'bg-primary-600 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 rounded-bl-none'
                                    }`}
                            >
                                <p className="text-sm leading-relaxed">{msg.text}</p>
                                <p
                                    className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-100' : 'text-gray-400'
                                        }`}
                                >
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    <button
                        type="button"
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <Paperclip className="w-5 h-5" />
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 py-3 px-4 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="p-3 bg-primary-600 text-white rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    )
}
