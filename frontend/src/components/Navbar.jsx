import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MessageSquare, Calendar, LogOut, User, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
        setIsOpen(false);
    };

    const toggleMenu = () => setIsOpen(!isOpen);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const navLinks = [
        { to: "/", icon: Calendar, label: "Appointments" },
        { to: "/chat", icon: MessageSquare, label: "AI Chat" },
    ];

    return (
        <nav className={`sticky top-0 z-[60] px-4 md:px-8 py-4 flex justify-between items-center h-20 transition-all ${isOpen ? 'bg-slate-950' : 'glass'}`}>
            <Link
                to="/"
                className="text-xl md:text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-primary-600 tracking-tighter"
                onClick={() => setIsOpen(false)}
            >
                AI Appointment
            </Link>

            {user && (
                <>
                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className="flex items-center space-x-2 text-slate-400 hover:text-white transition font-bold text-sm tracking-tight"
                            >
                                <link.icon size={18} />
                                <span>{link.label}</span>
                            </Link>
                        ))}
                        <div className="h-6 w-px bg-slate-800" />
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2 bg-slate-900/80 px-4 py-2 rounded-2xl border border-white/5 shadow-inner">
                                <User size={16} className="text-primary-400" />
                                <span className="text-sm font-black text-slate-200">{user.name}</span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2.5 cursor-pointer text-slate-500 hover:text-red-400 transition hover:bg-red-400/10 rounded-xl border border-transparent hover:border-red-400/20"
                                title="Logout"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden p-2 text-slate-400 hover:text-white transition"
                        onClick={toggleMenu}
                    >
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>

                    {/* Mobile Drawer */}
                    <AnimatePresence>
                        {isOpen && (
                            <>
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsOpen(false)}
                                    className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[70] md:hidden"
                                />
                                <motion.div
                                    initial={{ x: '100%' }}
                                    animate={{ x: 0 }}
                                    exit={{ x: '100%' }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                    className="fixed top-0 right-0 h-full w-[80%] max-w-[300px] bg-slate-950 border-l border-white/10 z-[80] md:hidden p-6 flex flex-col shadow-2xl overflow-y-auto"
                                >
                                    <div className="flex justify-between items-center mb-10">
                                        <span className="font-black text-primary-400 uppercase tracking-widest text-xs">Menu</span>
                                        <button onClick={() => setIsOpen(false)} className="p-2 text-slate-400">
                                            <X size={24} />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {navLinks.map((link) => (
                                            <Link
                                                key={link.to}
                                                to={link.to}
                                                onClick={() => setIsOpen(false)}
                                                className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-800/50 text-slate-200 font-bold border border-white/5 active:bg-primary-500/10 active:border-primary-500/20 transition-all"
                                            >
                                                <div className="p-2 rounded-lg bg-slate-950 text-primary-400">
                                                    <link.icon size={20} />
                                                </div>
                                                <span>{link.label}</span>
                                            </Link>
                                        ))}
                                    </div>

                                    <div className="mt-auto pt-10 border-t border-white/5">
                                        <div className="flex items-center space-x-4 mb-6 p-4">
                                            <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-lg">
                                                <User size={24} />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-white font-black truncate">{user.name}</p>
                                                <p className="text-slate-500 text-xs truncate">{user.email}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center justify-center space-x-3 p-4 rounded-2xl bg-red-500/10 text-red-400 font-black border border-red-500/20 active:bg-red-500/20 transition-all"
                                        >
                                            <LogOut size={20} />
                                            <span>SIGN OUT</span>
                                        </button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </>
            )}
        </nav>
    );
};

export default Navbar;
