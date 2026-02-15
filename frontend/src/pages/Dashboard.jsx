import { useEffect, useState } from 'react';
import { useAppointments } from '../hooks/useAppointments';
import { Calendar, Clock, CheckCircle, XCircle, Plus, RefreshCw, Trash2, AlertCircle } from 'lucide-react';
import { format, isAfter, parseISO } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Skeleton from '../components/Skeleton';
import { useNotification } from '../context/NotificationContext';

const Dashboard = () => {
    const { appointments, loading, error, fetchAppointments, updateAppointment, removeAppointment } = useAppointments();
    const { showNotification } = useNotification();
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [cancellingId, setCancellingId] = useState(null);
    const [isDeleting, setIsDeleting] = useState(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const params = {};
        if (activeFilter !== 'all') params.status = activeFilter;
        if (debouncedSearch) params.search = debouncedSearch;
        fetchAppointments(params);
    }, [fetchAppointments, activeFilter, debouncedSearch]);

    useEffect(() => {
        if (error) {
            showNotification(error, 'error');
        }
    }, [error, showNotification]);

    const handleCancel = async () => {
        if (!cancellingId) return;
        setIsDeleting(cancellingId); // Re-using state for loading
        try {
            await updateAppointment(cancellingId, { status: 'cancelled' });
            showNotification('Appointment cancelled successfully', 'success');
        } catch (err) {
        } finally {
            setIsDeleting(null);
            setCancellingId(null);
        }
    };

    const stats = {
        total: appointments.length,
        upcoming: appointments.filter(a => {
            if (a.status === 'cancelled') return false;
            try {
                return isAfter(parseISO(`${a.appointment_date}T${a.appointment_time}`), new Date());
            } catch { return false; }
        }).length,
        active: appointments.filter(a => ['pending', 'confirmed'].includes(a.status)).length,
        voided: appointments.filter(a => a.status === 'cancelled').length,
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'confirmed': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-400/20';
            case 'completed': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
            default: return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
        }
    };

    const CancelModal = () => (
        <AnimatePresence>
            {cancellingId && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setCancellingId(null)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
                    <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-slate-900 border border-white/10 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl p-8 text-center">
                        <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                            <XCircle className="text-red-400" size={32} />
                        </div>
                        <h3 className="text-2xl font-black text-white italic mb-2">Cancel Appointment?</h3>
                        <p className="text-slate-500 text-sm mb-8 font-medium">Are you sure you want to cancel this booking? This action cannot be undone efficiently.</p>
                        <div className="flex space-x-3">
                            <button onClick={() => setCancellingId(null)} className="flex-1 px-6 py-4 rounded-xl font-black text-[10px] uppercase bg-slate-800 text-slate-400 hover:text-white transition">No, Keep</button>
                            <button onClick={handleCancel} disabled={isDeleting} className="flex-1 px-6 py-4 rounded-xl font-black text-[10px] uppercase bg-red-500 text-white shadow-lg shadow-red-500/20 active:scale-95 transition flex items-center justify-center">
                                {isDeleting ? 'Cancelling...' : 'Yes, Cancel'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 md:space-y-8 pb-10">
            <CancelModal />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter italic">Workspace</h1>
                    <p className="text-slate-500 mt-1 text-sm md:text-base font-medium">Manage your automated sessions</p>
                </div>
                <div className="flex space-x-2 md:space-x-3 w-full md:w-auto">
                    <button onClick={() => { fetchAppointments(); showNotification('Refreshing...', 'info'); }} className="p-3 glass rounded-xl text-slate-400 hover:text-white transition active:scale-95 border border-white/5">
                        <RefreshCw size={20} className={loading && appointments.length > 0 ? 'animate-spin' : ''} />
                    </button>
                    <Link to="/chat" className="flex-grow md:flex-grow-0 premium-gradient px-6 md:px-8 py-3 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest flex items-center justify-center space-x-2 shadow-xl shadow-primary-500/20 active:scale-95">
                        <Plus size={18} />
                        <span>AI Booking</span>
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {[
                    { label: 'All', value: stats.total, icon: Calendar, color: 'text-primary-400' },
                    { label: 'Next', value: stats.upcoming, icon: Clock, color: 'text-indigo-400' },
                    { label: 'Active', value: stats.active, icon: CheckCircle, color: 'text-green-400' },
                    { label: 'Void', value: stats.voided, icon: XCircle, color: 'text-red-400' },
                ].map((stat, i) => (
                    <div key={i} className="glass p-4 md:p-6 rounded-2xl md:rounded-3xl relative overflow-hidden group border border-white/5 flex items-center justify-between">
                        <div className="relative z-10">
                            <p className="text-slate-500 font-black text-[9px] md:text-[14px] uppercase tracking-widest">{stat.label}</p>
                            <h3 className="text-2xl md:text-3xl font-black text-white mt-1">
                                {loading && appointments.length === 0 ? <Skeleton className="h-8 w-10" /> : stat.value}
                            </h3>
                        </div>
                        <div className={`p-2 opacity-40 group-hover:opacity-60 transition-opacity ${stat.color}`}>
                            <stat.icon size={32} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="glass rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5">
                <div className="px-6 md:px-8 py-5 border-b border-white/5 bg-slate-900/40 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 flex-grow">
                        <h2 className="font-black text-sm md:text-lg text-white uppercase tracking-widest shrink-0">Recent Activity</h2>
                        <div className="relative flex-grow max-w-md">
                            <input
                                type="text"
                                placeholder="Search appointments..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-950/50 border border-white/5 rounded-xl px-4 py-2 text-xs text-white focus:ring-1 focus:ring-primary-500/50 outline-none transition"
                            />
                        </div>
                    </div>
                    <div className="flex bg-slate-950/50 p-1 rounded-xl border border-white/5 w-fit max-w-full overflow-x-auto no-scrollbar">
                        {['all', 'pending', 'confirmed', 'cancelled', 'completed'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setActiveFilter(status)}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${activeFilter === status
                                    ? 'bg-primary-500 text-white shadow-lg'
                                    : 'text-slate-500 hover:text-slate-300 font-medium opacity-50'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="divide-y divide-white/5">
                    {loading && appointments.length === 0 ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="p-6 md:p-8 flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <Skeleton className="w-12 h-12 rounded-xl" />
                                    <div className="space-y-2">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-3 w-48" />
                                    </div>
                                </div>
                                <Skeleton className="h-8 w-24 rounded-lg" />
                            </div>
                        ))
                    ) : appointments.length === 0 ? (
                        <div className="p-16 md:p-20 text-center">
                            <div className="w-16 h-16 bg-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/5">
                                <Calendar className="text-slate-800" size={32} />
                            </div>
                            <h3 className="text-xl md:text-2xl font-black text-white italic">Clear Schedule</h3>
                            <p className="text-slate-500 mt-2 max-w-xs mx-auto text-xs md:text-sm font-medium px-4">No results found for your filters or search.</p>
                        </div>
                    ) : (
                        <div className="p-2 md:p-3 space-y-2">
                            {appointments.map((apt, i) => (
                                <motion.div
                                    key={apt.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    onClick={() => apt.chat_session_id && navigate(`/chat/${apt.chat_session_id}`)}
                                    className={`group relative p-4 md:p-6 bg-slate-900/20 hover:bg-slate-800/40 border border-white/[0.03] hover:border-primary-500/20 rounded-[1.5rem] md:rounded-[2rem] transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center gap-4 ${apt.chat_session_id ? 'cursor-pointer' : ''}`}
                                >
                                    {/* Left: Icon & Service */}
                                    <div className="flex items-center space-x-4 md:space-x-5 flex-grow">
                                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-slate-950 flex items-center justify-center text-primary-400 shrink-0 border border-white/5 shadow-inner group-hover:scale-105 transition-transform">
                                            <Calendar size={22} />
                                        </div>
                                        <div>
                                            <h4 className="font-black text-white text-base md:text-xl tracking-tight mb-0.5">{apt.service_type}</h4>
                                            <div className="flex items-center space-x-2 text-[10px] text-slate-500 uppercase font-black tracking-widest">
                                                <span>{apt.created_via === 'ai_chat' ? 'AI Session' : 'Manual Entry'}</span>
                                                {apt.notes && (
                                                    <>
                                                        <span className="w-1 h-1 bg-slate-800 rounded-full" />
                                                        <span className="truncate max-w-[120px] md:max-w-[200px] normal-case font-medium italic opacity-70">
                                                            "{apt.notes}"
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Status, Time & Actions */}
                                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 sm:gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                                        <div className="flex items-center space-x-3 sm:flex-row-reverse sm:space-x-reverse">
                                            <div className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-[0.15em] shadow-sm ${getStatusStyles(apt.status)}`}>
                                                {apt.status}
                                            </div>
                                            <div className="flex items-center space-x-1.5 text-slate-400 text-[11px] font-bold">
                                                <Clock size={12} className="text-primary-500/70" />
                                                <span>{apt.appointment_time.slice(0, 5)}</span>
                                                <span className="mx-1 text-slate-700">|</span>
                                                <span>{format(parseISO(apt.appointment_date), 'MMM do')}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            {apt.status === 'pending' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setCancellingId(apt.id);
                                                    }}
                                                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 rounded-xl transition-all text-[9px] font-black uppercase tracking-widest active:scale-95 shadow-lg shadow-red-500/5"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                            {/* Future actions like "Confirm" or "Reschedule" can go here */}
                                        </div>
                                    </div>

                                    {/* Hover Glow Effect */}
                                    <div className="absolute inset-0 bg-primary-500/[0.01] rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default Dashboard;
