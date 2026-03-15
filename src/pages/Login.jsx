import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Loader2, ShieldCheck, Zap } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError('AUTHENTICATION_FAILED: ACCESS_DENIED');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative bg-[#030712] px-4 overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-accent/10 blur-[160px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/5 blur-[160px] rounded-full"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-md w-full glass-card p-12 relative z-10 overflow-hidden"
            >
                {/* Shimmer Overlay */}
                <div className="absolute inset-0 shimmer pointer-events-none opacity-20"></div>

                <div className="flex flex-col items-center mb-12 relative">
                    <motion.div
                        whileHover={{ scale: 1.1, rotate: 12 }}
                        className="w-20 h-20 bg-gradient-to-br from-accent to-indigo-600 rounded-[2rem] flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.25)] mb-8"
                    >
                        <ShieldCheck className="w-10 h-10 text-white" />
                    </motion.div>
                    <h2 className="text-5xl logo-shimmer mb-3 uppercase">BITLAB</h2>
                    <div className="flex items-center space-x-2 text-slate-500 font-bold text-[10px] tracking-[0.3em] uppercase">
                        <Zap size={10} className="text-accent" />
                        <span>Secure Engineering Interface</span>
                    </div>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl mb-8 text-[11px] font-black tracking-widest text-center uppercase"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="relative group">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-premium peer"
                            placeholder=" "
                            required
                        />
                        <label className="absolute left-6 top-4 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] transition-all peer-focus:-top-3 peer-focus:left-4 peer-focus:text-accent peer-focus:bg-[#0b0f1a] peer-focus:px-2 peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:left-4 peer-[:not(:placeholder-shown)]:text-accent peer-[:not(:placeholder-shown)]:bg-[#0b0f1a] peer-[:not(:placeholder-shown)]:px-2 pointer-events-none">
                            Engineer Identity
                        </label>
                    </div>
                    <div className="relative group">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-premium peer"
                            placeholder=" "
                            required
                        />
                        <label className="absolute left-6 top-4 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] transition-all peer-focus:-top-3 peer-focus:left-4 peer-focus:text-accent peer-focus:bg-[#0b0f1a] peer-focus:px-2 peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:left-4 peer-[:not(:placeholder-shown)]:text-accent peer-[:not(:placeholder-shown)]:bg-[#0b0f1a] peer-[:not(:placeholder-shown)]:px-2 pointer-events-none">
                            Access Credentials
                        </label>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02, translateY: -2 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary py-5 flex items-center justify-center space-x-4 group"
                    >
                        {loading ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <>
                                <span className="tracking-[0.4em] uppercase text-xs font-black">Authorize</span>
                                <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </motion.button>
                </form>

                <div className="mt-12 pt-10 border-t border-white/[0.03] text-center">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">
                        New to the system?{' '}
                        <Link to="/register" className="text-accent hover:text-white transition-colors underline decoration-accent/30 underline-offset-8">
                            Protocol: Initialize
                        </Link>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
