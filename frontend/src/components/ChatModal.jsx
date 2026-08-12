import React, { useState, useEffect, useRef, useContext } from 'react'
import { API } from '../services/api'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'

const ChatModal = ({ isOpen, onClose, initialPartner = null }) => {
    const { user } = useContext(AppContext)
    const [conversations, setConversations] = useState([])
    const [activePartner, setActivePartner] = useState(initialPartner)
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState('')
    const [loadingConversations, setLoadingConversations] = useState(false)
    const [loadingMessages, setLoadingMessages] = useState(false)
    const [sending, setSending] = useState(false)

    const chatFeedRef = useRef(null)

    // Sync initial partner when prop changes
    useEffect(() => {
        if (initialPartner) {
            setActivePartner(initialPartner)
        }
    }, [initialPartner])

    // Load conversations when modal opens
    useEffect(() => {
        if (isOpen) {
            loadConversations()
        }
    }, [isOpen])

    // Load messages & start polling when active partner changes
    useEffect(() => {
        if (isOpen && activePartner?.id) {
            loadMessages(activePartner.id)

            // Auto poll every 3 seconds for new incoming messages
            const interval = setInterval(() => {
                pollMessages(activePartner.id)
            }, 3000)

            return () => clearInterval(interval)
        }
    }, [isOpen, activePartner])

    // Auto scroll to bottom of chat feed
    useEffect(() => {
        if (chatFeedRef.current) {
            chatFeedRef.current.scrollTop = chatFeedRef.current.scrollHeight
        }
    }, [messages])

    const loadConversations = async () => {
        try {
            setLoadingConversations(true)
            const res = await API.getConversations()
            setConversations(res.data.conversations || [])
            if (!activePartner && res.data.conversations?.length > 0) {
                setActivePartner(res.data.conversations[0].partner)
            }
        } catch (error) {
            console.error('Failed to load conversations:', error)
        } finally {
            setLoadingConversations(false)
        }
    }

    const loadMessages = async (partnerId) => {
        try {
            setLoadingMessages(true)
            const res = await API.getMessages(partnerId)
            setMessages(res.data.messages || [])
        } catch (error) {
            console.error('Failed to load messages:', error)
        } finally {
            setLoadingMessages(false)
        }
    }

    const pollMessages = async (partnerId) => {
        try {
            const res = await API.getMessages(partnerId)
            setMessages(res.data.messages || [])
        } catch (error) {
            // silent poll fail
        }
    }

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!newMessage.trim() || !activePartner) return

        const msgText = newMessage.trim()
        setNewMessage('')

        // Optimistic UI update
        const tempMsg = {
            id: Date.now(),
            sender_id: user.id,
            receiver_id: activePartner.id,
            message: msgText,
            created_at: new Date().toISOString(),
            is_read: false,
        }
        setMessages(prev => [...prev, tempMsg])

        try {
            setSending(true)
            await API.sendMessage({
                receiver_id: activePartner.id,
                message: msgText,
            })
            // Refresh feed
            pollMessages(activePartner.id)
            loadConversations()
        } catch (error) {
            toast.error('Failed to send message')
        } finally {
            setSending(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-sm'>
            <div className='bg-white rounded-2xl w-full max-w-4xl h-[85vh] sm:h-[80vh] shadow-2xl flex flex-col overflow-hidden'>
                {/* Modal Header */}
                <div className='bg-primary text-white p-4 flex justify-between items-center px-6 flex-shrink-0'>
                    <div className='flex items-center gap-3'>
                        <span className='text-2xl'>💬</span>
                        <div>
                            <h2 className='font-bold text-lg leading-none'>Medical Direct Messaging</h2>
                            <p className='text-xs text-blue-100 mt-1'>Real-time chat with doctors & patients</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className='w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white text-lg transition font-bold'
                    >
                        ✕
                    </button>
                </div>

                {/* Modal Content */}
                <div className='flex flex-1 overflow-hidden'>
                    {/* Contacts List (Sidebar) */}
                    <div className='w-full sm:w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/50 flex-shrink-0 hidden sm:flex'>
                        <div className='p-3 border-b border-gray-100 bg-white font-semibold text-xs text-gray-500 uppercase tracking-wider'>
                            Conversations
                        </div>
                        <div className='flex-1 overflow-y-auto divide-y divide-gray-100'>
                            {loadingConversations ? (
                                <div className='p-4 text-center text-xs text-gray-400'>Loading contacts...</div>
                            ) : conversations.length > 0 ? (
                                conversations.map(c => {
                                    const isSelected = activePartner?.id === c.partner.id
                                    return (
                                        <button
                                            key={c.partner.id}
                                            onClick={() => setActivePartner(c.partner)}
                                            className={`w-full p-3 text-left flex items-start gap-3 transition ${isSelected ? 'bg-blue-50/80 border-l-4 border-primary' : 'hover:bg-gray-100/60'}`}
                                        >
                                            <div className='w-10 h-10 rounded-full bg-blue-100 text-primary font-bold flex items-center justify-center text-sm flex-shrink-0 border border-blue-200'>
                                                {c.partner.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className='min-w-0 flex-1'>
                                                <div className='flex justify-between items-baseline'>
                                                    <p className={`text-xs font-bold truncate ${isSelected ? 'text-primary' : 'text-gray-800'}`}>
                                                        {c.partner.role === 'doctor' ? `Dr. ${c.partner.name}` : c.partner.name}
                                                    </p>
                                                    {c.unread_count > 0 && (
                                                        <span className='bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full'>
                                                            {c.unread_count}
                                                        </span>
                                                    )}
                                                </div>
                                                {c.partner.specialty && (
                                                    <p className='text-[10px] text-gray-400 font-medium'>{c.partner.specialty}</p>
                                                )}
                                                <p className='text-[11px] text-gray-500 truncate mt-0.5'>{c.last_message}</p>
                                            </div>
                                        </button>
                                    )
                                })
                            ) : (
                                <div className='p-6 text-center text-xs text-gray-400'>No prior conversations</div>
                            )}
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className='flex-1 flex flex-col bg-white min-w-0'>
                        {activePartner ? (
                            <>
                                {/* Active Contact Bar */}
                                <div className='p-3.5 px-5 border-b border-gray-100 flex items-center justify-between bg-white flex-shrink-0 shadow-xs'>
                                    <div className='flex items-center gap-3'>
                                        <div className='w-9 h-9 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm'>
                                            {activePartner.name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className='font-bold text-gray-900 text-sm'>
                                                {activePartner.role === 'doctor' ? `Dr. ${activePartner.name}` : activePartner.name}
                                            </h3>
                                            <p className='text-[11px] text-green-600 font-medium flex items-center gap-1'>
                                                <span className='w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse'></span> Active Session
                                            </p>
                                        </div>
                                    </div>
                                    {/* Mobile dropdown selector */}
                                    <div className='sm:hidden'>
                                        <select
                                            onChange={(e) => {
                                                const selected = conversations.find(c => c.partner.id == e.target.value)
                                                if (selected) setActivePartner(selected.partner)
                                            }}
                                            value={activePartner.id}
                                            className='text-xs border border-gray-200 rounded-lg p-1 bg-white'
                                        >
                                            {conversations.map(c => (
                                                <option key={c.partner.id} value={c.partner.id}>{c.partner.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Messages Feed */}
                                <div ref={chatFeedRef} className='flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30'>
                                    {loadingMessages ? (
                                        <div className='py-8 text-center text-xs text-gray-400'>Loading messages...</div>
                                    ) : messages.length > 0 ? (
                                        messages.map(msg => {
                                            const isMine = msg.sender_id === user.id
                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                                                >
                                                    <div
                                                        className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${isMine
                                                                ? 'bg-primary text-white rounded-br-none shadow-xs'
                                                                : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none shadow-xs'
                                                            }`}
                                                    >
                                                        {msg.message}
                                                    </div>
                                                    <span className='text-[10px] text-gray-400 mt-1 px-1'>
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <div className='py-12 text-center text-xs text-gray-400 flex flex-col items-center gap-2'>
                                            <span className='text-3xl'>💬</span>
                                            <p>No messages yet. Send a greeting to start chatting!</p>
                                        </div>
                                    )}
                                </div>

                                {/* Message Input Box */}
                                <form onSubmit={handleSendMessage} className='p-3 border-t border-gray-100 bg-white flex gap-2 flex-shrink-0'>
                                    <input
                                        type='text'
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder={`Message ${activePartner.name?.split(' ')[0]}...`}
                                        className='flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/30'
                                    />
                                    <button
                                        type='submit'
                                        disabled={!newMessage.trim() || sending}
                                        className='bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-1 shadow-xs'
                                    >
                                        Send ➔
                                    </button>
                                </form>
                            </>
                        ) : (
                            <div className='flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400'>
                                <span className='text-4xl mb-2'>💬</span>
                                <p className='text-sm font-medium'>Select a conversation from the sidebar to start chatting</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ChatModal
