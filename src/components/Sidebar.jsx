import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Binary,
    Cpu,
    Terminal,
    LogOut,
    ChevronLeft,
    ChevronRight,
    LayoutDashboard,
    ShieldAlert,
    Settings
} from 'lucide-react';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
        { id: 'verilog', label: 'Verilog Lab', icon: Binary, path: '/editor/verilog' },
        { id: 'vhdl', label: 'VHDL Lab', icon: Cpu, path: '/editor/vhdl' },
        { id: 'qnx', label: 'QNX OS Lab', icon: Terminal, path: '/editor/qnx' },
    ];

    return (
        <motion.aside
            initial={false}
            animate={{ width: isCollapsed ? 90 : 280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="h-screen bg-black/40 backdrop-blur-3xl border-r border-white/5 flex flex-col relative z-50 overflow-hidden"
        >
            <div className="absolute inset-0 shimmer pointer-events-none opacity-5"></div>

            {/* Collapse Toggle */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-20 w-6 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center text-slate-500 z-50 hover:text-accent hover:border-accent/40 transition-all hover:scale-110 active:scale-95"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Logo */}
            <div className={`pt-12 pb-16 flex items-center transition-all duration-500 ${isCollapsed ? 'justify-center' : 'px-8'}`}>
                <motion.div
                    animate={{
                        boxShadow: ["0 0 20px rgba(139,92,246,0.1)", "0 0 40px rgba(139,92,246,0.3)", "0 0 20px rgba(139,92,246,0.1)"]
                    }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="w-12 h-12 bg-gradient-to-br from-accent to-indigo-700 rounded-2xl flex items-center justify-center border border-white/10 group-hover:rotate-12 transition-transform"
                >
                    <span className="text-white font-black text-2xl">B</span>
                </motion.div>
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="ml-5"
                    >
                        <span className="text-2xl font-black text-white tracking-tighter block leading-none">BIT<span className="text-accent">LAB</span></span>
                        <span className="text-[8px] font-black text-slate-700 uppercase tracking-[0.4em] mt-1 block">Laboratory Core</span>
                    </motion.div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-3">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={`w-full flex items-center py-4 rounded-2xl transition-all duration-500 group relative
                ${isActive
                                    ? 'bg-accent/5 text-accent shadow-[inset_0_0_20px_rgba(139,92,246,0.02)]'
                                    : 'text-slate-500 hover:bg-white/[0.02] hover:text-slate-300'}`}
                        >
                            {isActive && <motion.div layoutId="activeNav" className="absolute left-0 w-1 h-6 bg-accent rounded-full" />}
                            <div className={`flex items-center transition-all duration-500 ${isCollapsed ? 'mx-auto' : 'px-6'}`}>
                                <item.icon size={20} className={isActive ? 'text-accent drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]' : 'group-hover:text-accent transition-colors'} />
                                {!isCollapsed && (
                                    <span className="ml-5 font-black text-[10px] uppercase tracking-[0.3em] truncate">
                                        {item.label}
                                    </span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </nav>

            {/* Footer Metrics */}
            <div className="p-4 border-t border-white/[0.03]">
                {!isCollapsed && (
                    <div className="px-5 mb-8 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Uplink</span>
                            <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest leading-none">Stable</span>
                        </div>
                        <div className="w-full h-1 bg-white/[0.03] rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '85%' }}
                                className="h-full bg-accent/40 rounded-full"
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    {!isCollapsed && (
                        <div className="p-4 bg-white/[0.01] rounded-2xl border border-white/[0.03] mb-4 flex items-center space-x-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">{user?.email || 'DEBUG@AUTO'}</span>
                        </div>
                    )}

                    <button
                        onClick={() => {
                            logout();
                            navigate('/login');
                        }}
                        className={`w-full flex items-center py-4 rounded-2xl text-slate-700 hover:bg-red-500/5 hover:text-red-500 transition-all duration-500 group ${isCollapsed ? 'justify-center' : 'px-6'}`}
                    >
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                        {!isCollapsed && <span className="ml-5 font-black text-[10px] uppercase tracking-[0.3em]">Terminate</span>}
                    </button>
                </div>
            </div>
        </motion.aside>
    );
};

export default Sidebar;
