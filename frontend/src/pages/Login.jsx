import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNotification } from '../context/NotificationContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const { showNotification } = useNotification();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const result = await login(email, password);
        if (result.success) {
            showNotification('Welcome back!', 'success');
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
            className="flex justify-center items-center pt-10 md:pt-20 pb-10"
        >
            <div className="glass w-full max-w-md p-8 md:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden mx-2">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

                <div className="text-center mb-8 md:mb-12 mt-4 md:mt-0">
                    <div className="inline-flex p-4 rounded-3xl bg-primary-500/10 text-primary-400 mb-6 border border-primary-500/20 shadow-inner">
                        <LogIn size={32} />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tighter italic">Sign In</h1>
                    <p className="text-slate-500 font-bold text-sm">Automated Booking Portal</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary-400 transition-colors" size={20} />
                            <input
                                type="email"
                                required
                                className="w-full bg-slate-950/50 border border-slate-900 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all font-medium text-sm"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-primary-400 transition-colors" size={20} />
                            <input
                                type="password"
                                required
                                className="w-full bg-slate-950/50 border border-slate-900 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all font-medium text-sm"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group w-full premium-gradient text-white font-black py-4 rounded-2xl flex justify-center items-center space-x-3 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-primary-500/20"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <span className="uppercase text-sm tracking-widest font-black">Enter Platform</span>
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 md:mt-12 text-center border-t border-white/5 pt-8">
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">
                        New?{' '}
                        <Link to="/register" className="text-primary-400 font-black hover:text-primary-300 transition-colors ml-1 border-b border-primary-500/20 pb-0.5">
                            Join Now
                        </Link>
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default Login;
