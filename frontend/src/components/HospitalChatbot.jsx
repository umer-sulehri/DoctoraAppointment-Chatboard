import React, { useState, useEffect, useRef, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { API } from '../services/api'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'

const HospitalChatbot = () => {
    const navigate = useNavigate()
    const { user, doctors: contextDoctors } = useContext(AppContext)
    const [isOpen, setIsOpen] = useState(false)
    const [hasUnread, setHasUnread] = useState(true)
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef(null)

    // Initial welcome message
    useEffect(() => {
        setMessages([
            {
                id: 1,
                sender: 'bot',
                text: "Hello! 👋 I am your **Hospital AI Assistant**. How can I help you today?\n\nYou can describe your symptoms, ask to find doctors, get appointment assistance, or inquire about hospital hours.",
                chips: ['🩺 Symptom Checker', '👨‍⚕️ Find a Doctor', '📅 How to Book', '🏥 Hospital Info & Emergency'],
                doctors: [],
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        ])
    }, [])

    // Scroll to bottom of chat
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
            setHasUnread(false)
        }
    }, [messages, isOpen, isTyping])

    const handleSendMessage = async (textToSend = null) => {
        const queryText = (textToSend || input).trim()
        if (!queryText) return

        if (!textToSend) setInput('')

        // Add user message
        const userMsg = {
            id: Date.now(),
            sender: 'user',
            text: queryText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }

        setMessages(prev => [...prev, userMsg])
        setIsTyping(true)

        try {
            const res = await API.queryChatbot(queryText)
            const botData = res.data

            const botMsg = {
                id: Date.now() + 1,
                sender: 'bot',
                text: botData.reply,
                chips: botData.chips || [],
                doctors: botData.doctors || [],
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
            setMessages(prev => [...prev, botMsg])
        } catch (error) {
            // Local fallback logic if backend route is unavailable
            const fallbackResponse = generateFallbackReply(queryText)
            const botMsg = {
                id: Date.now() + 1,
                sender: 'bot',
                text: fallbackResponse.reply,
                chips: fallbackResponse.chips,
                doctors: fallbackResponse.doctors,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
            setMessages(prev => [...prev, botMsg])
        } finally {
            setIsTyping(false)
        }
    }

    // Local smart fallback in case API is temporarily offline
    const generateFallbackReply = (text) => {
        const lower = text.toLowerCase()

        if (lower.includes('symptom') || lower.includes('headache') || lower.includes('fever') || lower.includes('cough') || lower.includes('pain') || lower.includes('skin') || lower.includes('stomach')) {
            const docList = (contextDoctors || []).slice(0, 2).map(d => ({
                id: d._id || d.id,
                name: d.name,
                specialty: d.speciality || d.specialty || 'General Physician',
                fees: d.fees || d.consultation_fee || 50,
                image: d.image || d.profile_image
            }))

            return {
                reply: "Based on common medical guidelines, if you are experiencing physical discomfort or symptoms, we recommend consulting a **General Physician** or relevant specialist.\n\nHere are available specialists you can consult:",
                chips: ['📅 Book Appointment', '👨‍⚕️ View All Doctors', '🏥 Emergency Number'],
                doctors: docList
            }
        }

        if (lower.includes('doctor') || lower.includes('find') || lower.includes('specialist')) {
            const docList = (contextDoctors || []).slice(0, 3).map(d => ({
                id: d._id || d.id,
                name: d.name,
                specialty: d.speciality || d.specialty || 'Specialist',
                fees: d.fees || d.consultation_fee || 60,
                image: d.image || d.profile_image
            }))

            return {
                reply: "Here are some of our top-rated medical specialists available for online booking:",
                chips: ['📅 Book Appointment', '🩺 Symptom Checker', '🏥 Hospital Location'],
                doctors: docList
            }
        }

        if (lower.includes('book') || lower.includes('appointment') || lower.includes('schedule')) {
            return {
                reply: "To book an appointment:\n1. Click **'All Doctors'** in the navigation bar.\n2. Select your desired doctor and view available time slots.\n3. Choose your date & slot, then confirm your booking!",
                chips: ['👨‍⚕️ View All Doctors', '📋 My Appointments', '💳 Payment Info'],
                doctors: []
            }
        }

        if (lower.includes('emergency') || lower.includes('phone') || lower.includes('whatsapp') || lower.includes('contact') || lower.includes('location') || lower.includes('hours') || lower.includes('office') || lower.includes('email')) {
            return {
                reply: "🏥 **Hospital Information & Contact**\n\n📍 **Our Office:** 123 Medical Center Drive, Lahore, Punjab, Pakistan\n📞 **Phone & WhatsApp:** +92 300 000 0000 (Mon - Sat, 9 AM to 6 PM)\n📧 **Email Address:** sulehriumer83@gmail.com / support@prescripto.pk\n🕒 **Working Hours:**\n  • Monday – Friday: 8:00 AM – 8:00 PM\n  • Saturday: 9:00 AM – 4:00 PM",
                chips: ['🚨 Call Emergency', '👨‍⚕️ Find Doctor', '📅 Book Appointment'],
                doctors: []
            }
        }

        return {
            reply: "I'm here to assist you with finding doctors, checking symptoms, and guiding appointment bookings. How can I help you?",
            chips: ['🩺 Symptom Checker', '👨‍⚕️ Find Doctor', '🏥 Hospital Hours', '📅 Book Slot'],
            doctors: []
        }
    }

    const clearChat = () => {
        setMessages([
            {
                id: Date.now(),
                sender: 'bot',
                text: "Chat cleared! How can I assist you now?",
                chips: ['🩺 Symptom Checker', '👨‍⚕️ Find a Doctor', '📅 How to Book', '🏥 Hospital Info'],
                doctors: [],
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        ])
    }

    const formatMessageText = (text) => {
        if (!text) return ''
        // Bold formatting
        let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic formatting
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Line breaks
        formatted = formatted.replace(/\n/g, '<br/>')
        return formatted
    }

    return (
        <div className='fixed bottom-5 right-5 z-50 font-sans'>
            {/* Floating Action Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className='group relative bg-gradient-to-r from-primary to-blue-600 hover:from-blue-700 hover:to-primary text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 flex items-center justify-center border-2 border-white/20'
                    title='Hospital AI Assistant'
                >
                    <span className='text-2xl leading-none transition-transform group-hover:rotate-12'>🤖</span>
                    {hasUnread && (
                        <span className='absolute -top-1 -right-1 flex h-4 w-4'>
                            <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75'></span>
                            <span className='relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white'></span>
                        </span>
                    )}
                    <span className='max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-500 ease-in-out font-bold text-xs pl-0 group-hover:pl-2'>
                        HealthBot AI
                    </span>
                </button>
            )}

            {/* Chatbot Window Modal */}
            {isOpen && (
                <div className='bg-white rounded-3xl shadow-2xl w-[92vw] sm:w-[400px] h-[580px] max-h-[85vh] flex flex-col overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-bottom-5 duration-200'>
                    {/* Header */}
                    <div className='bg-gradient-to-r from-primary via-blue-600 to-indigo-700 text-white p-4 flex items-center justify-between shadow-md flex-shrink-0'>
                        <div className='flex items-center gap-3'>
                            <div className='w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner border border-white/30'>
                                🤖
                            </div>
                            <div>
                                <h3 className='font-bold text-sm leading-tight flex items-center gap-1.5'>
                                    HealthBot AI
                                    <span className='w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse'></span>
                                </h3>
                                <p className='text-[11px] text-blue-100 mt-0.5 font-medium'>Hospital Virtual Assistant</p>
                            </div>
                        </div>
                        <div className='flex items-center gap-1'>
                            <button
                                onClick={clearChat}
                                title='Reset Chat'
                                className='p-1.5 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition text-xs font-medium'
                            >
                                🔄
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                title='Close'
                                className='w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs font-bold transition'
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    {/* Messages Container */}
                    <div className='flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50'>
                        {messages.map((msg) => {
                            const isBot = msg.sender === 'bot'
                            return (
                                <div key={msg.id} className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
                                    <div className='flex items-end gap-2 max-w-[88%]'>
                                        {isBot && (
                                            <div className='w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center flex-shrink-0 mb-1 font-bold'>
                                                🤖
                                            </div>
                                        )}
                                        <div
                                            className={`p-3.5 rounded-2xl text-xs leading-relaxed shadow-xs ${isBot
                                                    ? 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                                                    : 'bg-primary text-white rounded-br-none font-medium'
                                                }`}
                                        >
                                            <div
                                                dangerouslySetInnerHTML={{ __html: formatMessageText(msg.text) }}
                                            />

                                            {/* Doctor Recommendation Cards inside Chat */}
                                            {isBot && msg.doctors && msg.doctors.length > 0 && (
                                                <div className='mt-3 space-y-2.5 pt-2 border-t border-gray-100'>
                                                    <p className='text-[10px] uppercase font-bold text-gray-400 tracking-wider'>Recommended Specialists:</p>
                                                    {msg.doctors.map((doc) => (
                                                        <div
                                                            key={doc.id}
                                                            className='bg-blue-50/70 border border-blue-100 rounded-xl p-2.5 flex items-center justify-between gap-2 hover:bg-blue-100/70 transition'
                                                        >
                                                            <div className='flex items-center gap-2.5 min-w-0'>
                                                                <div className='w-8 h-8 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-xs flex-shrink-0 border border-primary/30 overflow-hidden'>
                                                                    {doc.image ? (
                                                                        <img src={doc.image} alt={doc.name} className='w-full h-full object-cover' />
                                                                    ) : (
                                                                        doc.name?.charAt(0) || 'D'
                                                                    )}
                                                                </div>
                                                                <div className='min-w-0'>
                                                                    <p className='font-bold text-xs text-gray-900 truncate'>{doc.name?.startsWith('Dr') ? doc.name : `Dr. ${doc.name}`}</p>
                                                                    <p className='text-[10px] text-primary font-medium truncate'>{doc.specialty}</p>
                                                                    <p className='text-[10px] text-gray-500 font-semibold mt-0.5'>Fee: ${doc.fees}</p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    setIsOpen(false)
                                                                    navigate(`/appointment/${doc.id}`)
                                                                }}
                                                                className='bg-primary text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg hover:bg-blue-700 transition flex-shrink-0 shadow-xs'
                                                            >
                                                                Book ➔
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <span className='text-[9px] text-gray-400 mt-1 px-1'>
                                        {msg.time}
                                    </span>

                                    {/* Interactive Suggestion Chips */}
                                    {isBot && msg.chips && msg.chips.length > 0 && (
                                        <div className='flex flex-wrap gap-1.5 mt-2 max-w-[95%] pl-8'>
                                            {msg.chips.map((chip, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handleSendMessage(chip.replace(/^[^\w\s]+/, '').trim())}
                                                    className='bg-white hover:bg-blue-50 border border-blue-200 hover:border-primary text-primary text-[11px] font-semibold px-2.5 py-1 rounded-full transition shadow-2xs hover:shadow-xs active:scale-95'
                                                >
                                                    {chip}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )
                        })}

                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className='flex items-center gap-2 text-gray-400 pl-2'>
                                <div className='w-6 h-6 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold'>
                                    🤖
                                </div>
                                <div className='bg-white p-3 rounded-2xl border border-gray-100 flex items-center gap-1.5 shadow-xs'>
                                    <span className='w-1.5 h-1.5 rounded-full bg-primary animate-bounce'></span>
                                    <span className='w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]'></span>
                                    <span className='w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]'></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Suggestions Toolbar */}
                    <div className='px-3 py-1.5 bg-slate-100/80 border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar flex-shrink-0 text-[10px] text-gray-600'>
                        <span className='font-semibold text-gray-400 flex-shrink-0'>Quick:</span>
                        <button onClick={() => handleSendMessage('Find top doctors')} className='hover:text-primary whitespace-nowrap bg-white px-2 py-0.5 rounded-md border border-gray-200'>👨‍⚕️ Doctors</button>
                        <button onClick={() => handleSendMessage('I have headache and fever')} className='hover:text-primary whitespace-nowrap bg-white px-2 py-0.5 rounded-md border border-gray-200'>🩺 Symptoms</button>
                        <button onClick={() => handleSendMessage('How to book appointment')} className='hover:text-primary whitespace-nowrap bg-white px-2 py-0.5 rounded-md border border-gray-200'>📅 Booking</button>
                        <button onClick={() => handleSendMessage('Hospital hours and helpline')} className='hover:text-primary whitespace-nowrap bg-white px-2 py-0.5 rounded-md border border-gray-200'>🏥 Hours</button>
                    </div>

                    {/* Input Form */}
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            handleSendMessage()
                        }}
                        className='p-3 bg-white border-t border-gray-100 flex items-center gap-2 flex-shrink-0'
                    >
                        <input
                            type='text'
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder='Ask AI assistant or describe symptoms...'
                            className='flex-1 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 bg-gray-50/50'
                        />
                        <button
                            type='submit'
                            disabled={!input.trim() || isTyping}
                            className='bg-gradient-to-r from-primary to-blue-600 hover:from-blue-700 hover:to-primary text-white p-2.5 rounded-xl font-bold text-xs transition disabled:opacity-40 shadow-sm flex items-center justify-center'
                            title='Send message'
                        >
                            ➔
                        </button>
                    </form>
                </div>
            )}
        </div>
    )
}

export default HospitalChatbot
