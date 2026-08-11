import React, { useState, useContext, useEffect, useRef } from 'react'
import { assets } from '../assets/assets'
import { NavLink, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import { API } from '../services/api'
import ChatModal from './ChatModal'

const Navbar = () => {
    const navigate = useNavigate()
    const { isAuthenticated, user, logout } = useContext(AppContext)
    const [showMenu, setShowMenu] = useState(false)
    const [showDropdown, setShowDropdown] = useState(false)
    const [isChatOpen, setIsChatOpen] = useState(false)
    const [unreadMessages, setUnreadMessages] = useState(0)
    const dropdownRef = useRef(null)

    const handleLogout = async () => {
        try {
            setShowDropdown(false)
            await logout()
            toast.success('Logged out successfully')
            navigate('/')
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false)
            }
        }

        const handleScroll = () => {
            setShowDropdown(false)
        }

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside)
            window.addEventListener('scroll', handleScroll, { passive: true })
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            window.removeEventListener('scroll', handleScroll)
        }
    }, [showDropdown])

    useEffect(() => {
        if (isAuthenticated && user) {
            fetchUnreadCount()
            const interval = setInterval(fetchUnreadCount, 5000)
            return () => clearInterval(interval)
        }
    }, [isAuthenticated, user])

    const fetchUnreadCount = async () => {
        try {
            const res = await API.getUnreadCount()
            setUnreadMessages(res.data.unread_count || 0)
        } catch (e) {
            // silent fail
        }
    }

    const navLinks = [
        { to: '/', label: 'HOME' },
        { to: '/doctors', label: 'ALL DOCTORS' },
        { to: '/about', label: 'ABOUT' },
        { to: '/contact', label: 'CONTACT' },
    ]

    return (
        <div className='flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-200 sticky top-0 bg-white z-40'>
            <img onClick={() => navigate('/')} className='w-40 cursor-pointer' src={assets.logo} alt="Prescripto" />

            {/* Desktop Nav */}
            <ul className='hidden md:flex items-center gap-8 font-medium text-gray-600'>
                {navLinks.map((link) => (
                    <NavLink
                        key={link.to}
                        to={link.to}
                        className={({ isActive }) =>
                            `py-1 relative group text-xs tracking-wider transition-colors ${isActive ? 'text-primary font-semibold' : 'hover:text-primary'}`
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <li>{link.label}</li>
                                <span className={`absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300 ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                            </>
                        )}
                    </NavLink>
                ))}
            </ul>

            <div className='flex items-center gap-3'>
                {isAuthenticated && user && (
                    <button
                        onClick={() => setIsChatOpen(true)}
                        className='relative bg-blue-50 hover:bg-blue-100 text-primary p-2.5 rounded-full transition flex items-center justify-center border border-blue-100'
                        title='Direct Messages'
                    >
                        <span className='text-base leading-none'>💬</span>
                        {unreadMessages > 0 && (
                            <span className='absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full border-2 border-white animate-pulse'>
                                {unreadMessages}
                            </span>
                        )}
                    </button>
                )}
                {isAuthenticated && user ? (
                    <div className='flex items-center gap-2 cursor-pointer relative' ref={dropdownRef}>
                        <div
                            onClick={() => setShowDropdown(!showDropdown)}
                            className='flex items-center gap-2 bg-gray-50 hover:bg-blue-50 px-3 py-1.5 rounded-full transition border border-gray-200 hover:border-primary/30 select-none'
                        >
                            <img
                                className='w-7 h-7 rounded-full object-cover border border-gray-200'
                                src={user.profile_image || assets.profile_pic}
                                alt={user.name}
                                onError={(e) => { e.target.src = assets.profile_pic }}
                            />
                            <span className='text-xs font-medium text-gray-700 hidden sm:block max-w-24 truncate'>
                                {user.name?.split(' ')[0]}
                            </span>
                            <img
                                className={`w-2.5 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`}
                                src={assets.dropdown_icon}
                                alt=""
                            />
                        </div>

                        {/* Dropdown */}
                        {showDropdown && (
                            <div className="absolute top-full right-0 mt-2 text-base font-medium text-gray-600 z-50 animate-in fade-in duration-150">
                                <div className="min-w-52 bg-white rounded-2xl shadow-xl border border-gray-100 p-3">
                                    <div className='px-3 py-2 mb-2 border-b border-gray-100'>
                                        <p className='text-sm font-semibold text-gray-800'>{user.name}</p>
                                        <p className='text-xs text-gray-500 truncate'>{user.email}</p>
                                        <span className='text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full mt-1 inline-block capitalize'>{user.role}</span>
                                    </div>

                                    <div className='space-y-1'>
                                        {user.role === 'user' && (
                                            <>
                                                <button onClick={() => { navigate('/user-dashboard'); setShowDropdown(false) }} className='w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 hover:text-primary transition text-sm flex items-center gap-2'>
                                                    <span>📊</span> My Dashboard
                                                </button>
                                                <button onClick={() => { navigate('/my-profile'); setShowDropdown(false) }} className='w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 hover:text-primary transition text-sm flex items-center gap-2'>
                                                    <span>👤</span> My Profile
                                                </button>
                                                <button onClick={() => { navigate('/my-appontments'); setShowDropdown(false) }} className='w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 hover:text-primary transition text-sm flex items-center gap-2'>
                                                    <span>📅</span> My Appointments
                                                </button>
                                            </>
                                        )}
                                        {user.role === 'doctor' && (
                                            <button onClick={() => { navigate('/doctor-dashboard'); setShowDropdown(false) }} className='w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 hover:text-primary transition text-sm flex items-center gap-2'>
                                                <span>🏥</span> Doctor Dashboard
                                            </button>
                                        )}
                                        {user.role === 'admin' && (
                                            <button onClick={() => { navigate('/admin-dashboard'); setShowDropdown(false) }} className='w-full text-left px-3 py-2 rounded-lg hover:bg-blue-50 hover:text-primary transition text-sm flex items-center gap-2'>
                                                <span>⚙️</span> Admin Dashboard
                                            </button>
                                        )}
                                        <div className='border-t border-gray-100 my-1'></div>
                                        <button
                                            onClick={handleLogout}
                                            className='w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 text-red-500 transition text-sm flex items-center gap-2'
                                        >
                                            <span>🚪</span> Logout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className='flex items-center gap-2'>
                        <button
                            onClick={() => navigate('/login')}
                            className='hidden md:block text-gray-600 hover:text-primary px-4 py-2 rounded-full font-medium text-sm transition'
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className='bg-primary text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-blue-700 transition hidden md:block'
                        >
                            Get Started
                        </button>
                    </div>
                )}

                {/* Mobile Menu Toggle */}
                <button
                    className='md:hidden p-2 rounded-lg hover:bg-gray-100'
                    onClick={() => setShowMenu(!showMenu)}
                >
                    <img className='w-5' src={showMenu ? assets.cross_icon : assets.menu_icon} alt="Menu" />
                </button>
            </div>

            {/* Mobile Menu */}
            {showMenu && (
                <div className='absolute top-full left-0 right-0 bg-white shadow-xl border-t border-gray-100 md:hidden z-50'>
                    <div className='p-4 space-y-2'>
                        {navLinks.map(link => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                onClick={() => setShowMenu(false)}
                                className={({ isActive }) =>
                                    `block px-4 py-3 rounded-xl font-medium text-sm transition ${isActive ? 'bg-blue-50 text-primary' : 'text-gray-700 hover:bg-gray-50'}`
                                }
                            >
                                {link.label}
                            </NavLink>
                        ))}
                        {!isAuthenticated && (
                            <div className='pt-2 flex gap-2'>
                                <button onClick={() => { navigate('/login'); setShowMenu(false) }} className='flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl font-medium text-sm'>
                                    Sign In
                                </button>
                                <button onClick={() => { navigate('/register'); setShowMenu(false) }} className='flex-1 bg-primary text-white py-2.5 rounded-xl font-medium text-sm'>
                                    Register
                                </button>
                            </div>
                        )}
                        {isAuthenticated && (
                            <button
                                onClick={() => { handleLogout(); setShowMenu(false) }}
                                className='w-full text-left px-4 py-3 rounded-xl text-red-500 font-medium text-sm hover:bg-red-50 transition'
                            >
                                Logout
                            </button>
                        )}
                    </div>
                </div>
            )}

            <ChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </div>
    )
}

export default Navbar