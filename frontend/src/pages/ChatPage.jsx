import { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, Calendar, Clock, Check, Loader2, ArrowLeft, Info, HelpCircle, ChevronUp, ChevronDown, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import chatService from '../services/chat.service';
import appointmentService from '../services/appointment.service';

const ChatPage = () => {
    const [session, setSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [appointmentDetails, setAppointmentDetails] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);

    const messagesEndRef = useRef(null);
    const navigate = useNavigate();
    const { sessionId } = useParams();
    const { showNotification } = useNotification();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, aiLoading]);

    const startNewSession = async () => {
        setBookingLoading(true);
        try {
            const data = await chatService.createSession();
            setSession(data.data.session);
            setMessages([{
                role: 'assistant',
                content: "Hello! I'm your AI booking assistant. How can I help you today? You can just say things like 'I want to book a hair cut for next Tuesday at 3pm'.",
                timestamp: new Date().toISOString()
            }]);
            setAppointmentDetails(null);
            setShowConfirmModal(false);
        } catch (err) {
            showNotification('Failed to start session', 'error');
        } finally {
            setBookingLoading(false);
        }
    };

    const loadExistingSession = async (sid) => {
        setAiLoading(true);
        try {
            const result = await chatService.getSession(sid);
            const loadedSession = result.data.session;
            setSession(loadedSession);

            if (loadedSession.messages && loadedSession.messages.length > 0) {
                setMessages(loadedSession.messages.map(m => ({
                    ...m,
                    timestamp: m.created_at
                })));
            } else {
                // Fallback: If session exists but has no messages, show welcome message
                setMessages([{
                    role: 'assistant',
                    content: "Hello! I'm your AI booking assistant. How can I help you today? You can just say things like 'I want to book a hair cut for next Tuesday at 3pm'.",
                    timestamp: new Date().toISOString()
                }]);
            }
        } catch (err) {
            showNotification('Failed to load chat history', 'error');
            startNewSession();
        } finally {
            setAiLoading(false);
        }
    };

    useEffect(() => {
        if (sessionId) {
            loadExistingSession(sessionId);
        } else {
            startNewSession();
        }
    }, [sessionId]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || aiLoading || !session) return;

        const userMessageContent = input.trim();
        setInput('');

        // Optimistic update
        setMessages(prev => [...prev, { role: 'user', content: userMessageContent, timestamp: new Date().toISOString() }]);
        setAiLoading(true);

        try {
            const result = await chatService.sendMessage(session.id, userMessageContent);
            const { message, appointmentDetails: details } = result.data;

            setMessages(prev => [...prev, {
                ...message,
                timestamp: new Date().toISOString()
            }]);

            if (details) {
                setAppointmentDetails(prev => ({
                    ...prev,
                    ...details
                }));
                if (details.is_complete) {
                    setShowConfirmModal(true);
                }
            }
        } catch (err) {
            showNotification('AI processing failed', 'error');
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "I'm sorry, I'm having trouble connecting to the brain. Can you try again?",
                timestamp: new Date().toISOString()
            }]);
        } finally {
            setAiLoading(false);
        }
    };

    const handleConfirmBooking = async () => {
        if (!appointmentDetails) return;
        setBookingLoading(true);
        try {
            await appointmentService.create({
                service_type: appointmentDetails.service_type,
                appointment_date: appointmentDetails.appointment_date,
                appointment_time: appointmentDetails.appointment_time,
                chat_session_id: session.id,
                notes: appointmentDetails.notes
            });

            setBookingSuccess(true);
            showNotification('Appointment booked successfully!', 'success');

            // Close modal after a short delay, then show AI reply
            setTimeout(() => {
                setShowConfirmModal(false);
                setBookingSuccess(false);

                // Show typing indicator for a second to feel natural
                setAiLoading(true);
                setTimeout(() => {
                    setAiLoading(false);
                    setMessages(prev => [...prev, {
                        role: 'assistant',
                        content: `Perfect! I've booked your ${appointmentDetails.service_type} for ${format(parseISO(appointmentDetails.appointment_date), 'MMMM do')} at ${appointmentDetails.appointment_time.slice(0, 5)}. You can see it in your dashboard.`,
                        timestamp: new Date().toISOString()
                    }]);
                    setAppointmentDetails(null);
                }, 1000);
            }, 1500);

        } catch (err) {
            showNotification(err.response?.data?.message || 'Booking failed', 'error');
        } finally {
            setBookingLoading(false);
        }
    };

    const ConfirmModal = () => (
        <AnimatePresence>
            {showConfirmModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowConfirmModal(false)} className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" />
                    <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-slate-900 border border-white/10 w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl p-10 text-center">
                        <div className="w-20 h-20 bg-primary-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary-500/20">
                            <Calendar className="text-primary-400" size={32} />
                        </div>
                        <h3 className="text-3xl font-black text-white italic mb-2">Review Booking</h3>
                        <p className="text-slate-400 text-sm mb-8 font-medium">Found an appointment based on your request. Save it?</p>

                        <div className="bg-slate-950/50 rounded-2xl p-6 mb-8 border border-white/5 space-y-4 text-left">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Service</span>
                                <span className="text-sm font-bold text-white uppercase italic">{appointmentDetails?.service_type}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</span>
                                <span className="text-sm font-bold text-white uppercase italic">{appointmentDetails?.appointment_date ? format(parseISO(appointmentDetails.appointment_date), 'MMMM do, yyyy') : 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Time</span>
                                <span className="text-sm font-bold text-white uppercase italic">{appointmentDetails?.appointment_time?.slice(0, 5)}</span>
                            </div>
                        </div>

                        {!bookingSuccess ? (
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => setShowConfirmModal(false)} className="px-6 py-4 rounded-xl font-black text-xs uppercase bg-slate-800 text-slate-400 hover:text-white transition">Cancel</button>
                                <button onClick={handleConfirmBooking} disabled={bookingLoading} className="px-6 py-4 rounded-xl font-black text-xs uppercase tracking-widest premium-gradient text-white shadow-xl shadow-primary-500/20 active:scale-95 transition flex items-center justify-center space-x-2">
                                    {bookingLoading ? <Loader2 className="animate-spin" size={18} /> : <span>Confirm & Save</span>}
                                </button>
                            </div>
                        ) : (
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-green-500 py-4 rounded-xl text-white font-black flex items-center justify-center space-x-2">
                                <Check size={20} />
                                <span>BOOKED SUCCESSFULLY!</span>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col gap-4">
            <ConfirmModal />
            <div className="flex items-center justify-between px-2">
                <button onClick={() => navigate('/')} className="group flex items-center space-x-2 text-slate-400 hover:text-white transition">
                    <div className="p-2 rounded-lg group-hover:bg-slate-800 transition"><ArrowLeft size={18} /></div>
                    <span className="font-bold text-xs uppercase tracking-wider">Back</span>
                </button>
                <div className="flex items-center space-x-3">
                    <button onClick={startNewSession} className="p-2.5 glass rounded-xl text-slate-400 hover:text-white transition active:scale-95 border border-white/5"><RefreshCw size={16} /></button>
                    <div className="flex items-center space-x-3 bg-slate-900/80 border border-white/5 px-4 py-2 rounded-2xl">
                        <div className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                        </div>
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Mistral AI Engine</span>
                    </div>
                </div>
            </div>

            <div className="flex-grow flex flex-col glass rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5">
                <div className="flex-grow overflow-y-auto p-4 md:p-8 space-y-8 no-scrollbar">
                    {messages.map((msg, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] flex items-start space-x-4 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-primary-600' : 'bg-slate-800 border border-white/10'}`}>
                                    {msg.role === 'user' ? <User size={18} /> : <Bot size={20} />}
                                </div>
                                <div className={`px-5 py-4 rounded-3xl ${msg.role === 'user' ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-slate-800/60 text-slate-200 rounded-tl-none border border-white/10'}`}>
                                    <p className="text-[0.95rem] leading-relaxed">{msg.content}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {aiLoading && (
                        <div className="flex justify-start">
                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-white/10 flex items-center justify-center"><Bot size={20} /></div>
                                <div className="bg-slate-800/60 px-5 py-4 rounded-2xl rounded-tl-none border border-white/10 flex space-x-1.5 self-center">
                                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-6 bg-slate-900/80 border-t border-white/5">
                    <form onSubmit={handleSendMessage} className="relative flex gap-3">
                        <input
                            type="text"
                            className="flex-grow bg-slate-950 border border-white/5 rounded-2xl px-6 py-4 text-white text-lg focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all placeholder:text-slate-600"
                            placeholder="Type to schedule (e.g. book dental for tomorrow at 2pm)..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={aiLoading}
                        />
                        <button type="submit" disabled={aiLoading || !input.trim()} className="p-4 premium-gradient rounded-2xl text-white shadow-xl shadow-primary-500/20 disabled:opacity-30 transition-all active:scale-95 shrink-0"><Send size={24} /></button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
