import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Binary, Cpu, Terminal, Activity, Zap, Layers, Wind, Radio } from 'lucide-react';

const Dashboard = () => {
    const navigate = useNavigate();

    const labs = [
        {
            id: 'verilog',
            title: 'Verilog Core',
            desc: 'Hardware description language for digital logic design and RTL verification.',
            icon: Binary,
            color: 'from-accent/20 to-indigo-500/5',
            accent: 'text-accent',
            path: '/editor/verilog'
        },
        {
            id: 'vhdl',
            title: 'VHDL Logic',
            desc: 'High-level synthesis and formal verification for critical hardware architectures.',
            icon: Cpu,
            color: 'from-blue-600/20 to-blue-500/5',
            accent: 'text-blue-400',
            path: '/editor/vhdl'
        },
        {
            id: 'qnx',
            title: 'QNX Target',
            desc: 'Real-time operating system kernel development and deterministic execution.',
            icon: Terminal,
            color: 'from-emerald-600/20 to-emerald-500/5',
            accent: 'text-emerald-400',
            path: '/editor/qnx'
        }
    ];

    return (
        <div className="flex h-screen bg-[#030712] overflow-hidden">
            <Sidebar />

            <main className="flex-1 overflow-y-auto relative custom-scrollbar">
                {/* Abstract Background Elements */}
                <div className="absolute top-[10%] left-[20%] w-[30%] h-[30%] bg-accent/5 blur-[120px] rounded-full pointer-events-none"></div>
                <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-blue-600/5 blur-[140px] rounded-full pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-12 py-20 relative z-10">
                    {/* Dashboard Header */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="mb-20"
                    >
                        <div className="flex items-center space-x-4 mb-8">
                            <div className="px-4 py-1.5 bg-white/[0.03] border border-white/[0.08] rounded-full text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center">
                                <Radio size={12} className="mr-3 text-emerald-500 animate-pulse" />
                                Laboratory Node: 0xA7 - Active
                            </div>
                            <div className="h-px w-24 bg-gradient-to-r from-white/10 to-transparent"></div>
                        </div>

                        <h1 className="text-7xl font-black text-white tracking-tighter mb-8 leading-[0.9]">
                            Architectural <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-indigo-400 to-blue-400">Environment.</span>
                        </h1>

                        <div className="flex flex-wrap gap-8 items-center">
                            <p className="text-slate-400 text-lg font-medium max-w-xl leading-relaxed">
                                Welcome to BitLab Core. Efficiently synthesize, simulate, and deploy mission-critical engineering logic within parallel sandbox sessions.
                            </p>
                            <div className="flex items-center space-x-6">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Compute Load</span>
                                    <span className="text-sm font-black text-white">4.2 Gflops</span>
                                </div>
                                <div className="w-px h-8 bg-white/5"></div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Latency</span>
                                    <span className="text-sm font-black text-white">0.8 ms</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {labs.map((lab, idx) => (
                            <motion.div
                                key={lab.id}
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.15, duration: 0.8 }}
                                whileHover={{ y: -8 }}
                                onClick={() => navigate(lab.path)}
                                className={`group cursor-pointer glass-card p-10 bg-gradient-to-br border-white/[0.03] transition-all duration-700 ${lab.color} hover:border-accent/30 relative overflow-hidden`}
                            >
                                {/* Internal Shimmer */}
                                <div className="absolute inset-0 shimmer pointer-events-none opacity-0 group-hover:opacity-10"></div>

                                <div className="w-16 h-16 bg-black/40 rounded-3xl flex items-center justify-center mb-12 border border-white/[0.05] group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-[0_0_40px_rgba(139,92,246,0.2)] transition-all duration-700">
                                    <lab.icon className="text-white" size={32} />
                                </div>

                                <div className="space-y-4 mb-12">
                                    <h3 className="text-3xl font-black text-white tracking-tighter group-hover:translate-x-1 transition-transform">{lab.title}</h3>
                                    <p className="text-slate-500 font-medium leading-relaxed text-sm group-hover:text-slate-300 transition-colors">
                                        {lab.desc}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                        <Layers size={14} className="text-accent" />
                                        <span className="text-[10px] font-black text-accent uppercase tracking-[0.2em]">Instance: Idle</span>
                                    </div>
                                    <div className="flex items-center text-white/40 group-hover:text-accent font-black text-[10px] uppercase tracking-[0.3em] transition-colors">
                                        <span className="mr-3">Launch</span>
                                        <Zap size={14} className="group-hover:fill-accent transition-all animate-pulse" />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* System Status Footer */}
                    <motion.footer
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-32 pt-12 border-t border-white/[0.05] flex flex-col md:flex-row justify-between items-center gap-6"
                    >
                        <div className="flex items-center space-x-12">
                            <div className="flex items-center group">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 mr-4 shadow-[0_0_12px_rgba(16,185,129,0.5)] group-hover:scale-125 transition-transform"></div>
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Cluster Status: Operational</span>
                            </div>
                            <div className="flex items-center group">
                                <Wind size={12} className="mr-3 text-blue-400 group-hover:rotate-180 transition-transform duration-1000" />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Airflow: Optimal</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-8 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">
                            <span className="hover:text-accent transition-colors cursor-help">Security Protocol v4.0</span>
                            <span className="hover:text-accent transition-colors cursor-help">Kernel: 2.4.0-X</span>
                            <span className="text-white/10 uppercase font-black text-[20px] select-none">BitLab™</span>
                        </div>
                    </motion.footer>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
