import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, UserPlus, Phone, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNotification } from '../context/NotificationContext';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
    });
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await register(formData);
        if (result.success) {
            showNotification('Account created successfully!', 'success');
            navigate('/');
        } else {
            showNotification(result.message, 'error');
        }
        setLoading(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex justify-center items-center pt-6 md:pt-16 pb-10"
        >
            <div className="glass w-full max-w-md p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden mx-2">
                <div className="absolute top-0 left-0 w-32 h-32 bg-primary-500/10 rounded-full -translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none" />

                <div className="text-center mb-8 md:mb-10 mt-4 md:mt-0">
                    <div className="inline-flex p-4 rounded-3xl bg-primary-500/10 text-primary-400 mb-6 border border-primary-500/20 shadow-inner">
                        <UserPlus size={32} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tighter italic">Join Us</h1>
                    <p className="text-slate-500 font-bold text-sm">Secure Booking Automation</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary-400 transition-colors" size={18} />
                            <input
                                name="name"
                                type="text"
                                required
                                className="w-full bg-slate-950/50 border border-slate-900 rounded-2xl py-3.5 pl-11 pr-4 text-white focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all font-medium text-sm"
                                placeholder="Steve Rogers"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary-400 transition-colors" size={18} />
                            <input
                                name="email"
                                type="email"
                                required
                                className="w-full bg-slate-950/50 border border-slate-900 rounded-2xl py-3.5 pl-11 pr-4 text-white focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all font-medium text-sm"
                                placeholder="steve@avengers.com"
                                value={formData.email}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone</label>
                        <div className="relative group">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary-400 transition-colors" size={18} />
                            <input
                                name="phone"
                                type="tel"
                                className="w-full bg-slate-950/50 border border-slate-900 rounded-2xl py-3.5 pl-11 pr-4 text-white focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all font-medium text-sm"
                                placeholder="+1 234 567 890"
                                value={formData.phone}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Security</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary-400 transition-colors" size={18} />
                            <input
                                name="password"
                                type="password"
                                required
                                className="w-full bg-slate-950/50 border border-slate-900 rounded-2xl py-3.5 pl-11 pr-4 text-white focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all font-medium text-sm"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group w-full premium-gradient text-white font-black py-4 mt-4 rounded-2xl flex justify-center items-center space-x-3 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-primary-500/20"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <span className="uppercase text-sm tracking-widest font-black">Generate Access</span>
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 md:mt-12 text-center border-t border-white/5 pt-8">
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">
                        Joined?{' '}
                        <Link to="/login" className="text-primary-400 font-black hover:text-primary-300 transition-colors ml-1 border-b border-primary-500/20 pb-0.5">
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default Register;
