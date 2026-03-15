import React from 'react';
import { motion } from 'framer-motion';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#030712] relative overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full animate-pulse"></div>

                <div className="relative z-10 flex flex-col items-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                        className="w-16 h-16 border-t-2 border-r-2 border-accent rounded-full mb-8 relative"
                    >
                        <div className="absolute inset-0 border-t-2 border-r-2 border-accent/20 rounded-full blur-sm"></div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col items-center"
                    >
                        <h2 className="text-[10px] font-black text-white uppercase tracking-[0.6em] mb-2">Synchronizing Core</h2>
                        <div className="flex space-x-1">
                            {[0, 1, 2].map(i => (
                                <motion.div
                                    key={i}
                                    animate={{ opacity: [0.2, 1, 0.2] }}
                                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                                    className="w-1 h-1 bg-accent rounded-full"
                                />
                            ))}
                        </div>
                    </motion.div>
                </div>

                <div className="absolute bottom-12 text-[8px] font-black text-slate-800 uppercase tracking-[0.4em]">
                    BitLab Secure Tunnel v4.0
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};
