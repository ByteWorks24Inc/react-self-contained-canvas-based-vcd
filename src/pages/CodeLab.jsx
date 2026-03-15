import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import Sidebar from '../components/Sidebar';
import api from '../services/api';
import {
    Play,
    Terminal as TerminalIcon,
    Activity,
    Download,
    Loader2,
    ChevronDown,
    X,
    Binary,
    Cpu,
    Terminal,
    Zap,
    Box,
    HardDrive,
    Wifi,
    ChevronRight
} from 'lucide-react';

const CodeLab = () => {
    const { lang } = useParams();
    const navigate = useNavigate();

    const [designCode, setDesignCode] = useState('');
    const [testbenchCode, setTestbenchCode] = useState('');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [vcdData, setVcdData] = useState(null);
    const [isTerminalOpen, setIsTerminalOpen] = useState(true);
    const [isVcdOpen, setIsVcdOpen] = useState(false);

    const terminalRef = useRef(null);

    const labConfig = {
        verilog: { title: 'Verilog Core', mode: 'verilog', icon: Binary, hasTestbench: true },
        vhdl: { title: 'VHDL Logic', mode: 'vhdl', icon: Cpu, hasTestbench: true },
        systemverilog: { title: 'System Verilog', mode: 'systemverilog', icon: Cpu, hasTestbench: true },
        qnx: { title: 'QNX Target', mode: 'cpp', icon: Terminal, hasTestbench: false },
    };

    const currentLab = labConfig[lang] || labConfig.verilog;

    useEffect(() => {
        const savedDesign = localStorage.getItem(`${lang}_design`);
        const savedTB = localStorage.getItem(`${lang}_tb`);
        if (savedDesign) setDesignCode(savedDesign);
        else setDefaultTemplate();
    }, [lang]);

    const setDefaultTemplate = () => {
        if (lang === 'qnx') {
            setDesignCode('#include <stdio.h>\n\nint main() {\n  printf("Initializing BitLab QNX Engine...\\n");\n  return 0;\n}');
            setTestbenchCode('');
        } else if (lang === 'verilog') {
            setDesignCode('// BitLab Verilog Template\nmodule adder(input [3:0] a, b, output [4:0] sum);\n  assign sum = a + b;\nendmodule');
            setTestbenchCode('\`timescale 1ns/1ps\n\nmodule tb;\nreg [3:0] a, b;\nwire [4:0] sum;\n\nadder uut (.a(a), .b(b), .sum(sum));\n\ninitial begin\n  $dumpfile("demo.vcd");\n  $dumpvars(0, tb);\n  a = 0; b = 0;\n  #10 a = 3; b = 4;\n  #10 a = 7; b = 8;\n  #10 a = 15; b = 1;\n  #10 $finish;\nend\nendmodule');
        } else if (lang === 'vhdl') {
            setDesignCode('-- BitLab VHDL Template\nlibrary IEEE;\nuse IEEE.STD_LOGIC_1164.ALL;\n\nentity main is\nend main;\n\narchitecture Behavioral of main is\nbegin\nend Behavioral;');
            setTestbenchCode('-- VHDL Testbench\nlibrary IEEE;\nuse IEEE.STD_LOGIC_1164.ALL;');
        } else if (lang === 'systemverilog') {
            setDesignCode('// SystemVerilog Design\nmodule main();\n  initial begin\n    $display("BitLab SV Core: Ready");\n  end\nendmodule');
            setTestbenchCode('// SV Testbench\nmodule tb();\n  // Stimulus\nendmodule');
        }
    };

    const handleSave = (val, type) => {
        if (type === 'design') {
            setDesignCode(val);
            localStorage.setItem(`${lang}_design`, val);
        } else {
            setTestbenchCode(val);
            localStorage.setItem(`${lang}_tb`, val);
        }
    };

    const downloadVcd = () => {
        if (!vcdData) return;
        const byteCharacters = atob(vcdData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray]);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `simulation_${Date.now()}.vcd`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const executeCode = async () => {
        if (loading) return;
        setLoading(true);
        setLogs(prev => [...prev, `>>> [INIT] Initializing target environment: ${lang.toUpperCase()}...`]);
        try {
            const response = await api.post('/execute', {
                language: lang,
                designCode,
                testbenchCode: currentLab.hasTestbench ? testbenchCode : null
            });

            if (lang === 'qnx' && response.data.jobId) {
                const { jobId } = response.data;
                setLogs(prev => [...prev, `[QUEUED] Job ID: ${jobId}`, `Waiting for worker execution...`]);
                
                let attempts = 0;
                const maxAttempts = 60;
                
                const poll = setInterval(async () => {
                    attempts++;
                    try {
                        const res = await api.get(`/result/${jobId}`);
                        if (res.data && res.data.logs != null) {
                            clearInterval(poll);
                            setLogs(prev => [...prev, ...res.data.logs.split('\n')]);
                            setLoading(false);
                        }
                    } catch (err) {
                        if (err.response && err.response.status === 404) {
                            // Still pending
                            if (attempts >= maxAttempts) {
                                clearInterval(poll);
                                setLogs(prev => [
                                    ...prev, 
                                    `!!! TIMEOUT: Worker execution timed out.`,
                                    `*** PLEASE CONTACT MODERATOR TO TURN ON THE QNX VM SERVER TO ACCESS ***`
                                ]);
                                setLoading(false);
                            }
                        } else {
                            // other error
                            clearInterval(poll);
                            setLogs(prev => [
                                ...prev, 
                                `!!! ERROR: Failed to fetch results.`, 
                                `!!! DETAIL: ${err.message}`,
                                `*** PLEASE CONTACT MODERATOR TO TURN ON THE QNX VM SERVER TO ACCESS ***`
                            ]);
                            setLoading(false);
                        }
                    }
                }, 2000);
            } else {
                const { logs: outputLogs } = response.data;
                if (outputLogs) {
                    setLogs(prev => [...prev, ...outputLogs.split('\n')]);
                }
                setLoading(false);
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Unknown Transport Error';
            const status = err.response?.status ? ` [Status: ${err.response.status}]` : '';
            setLogs(prev => [
                ...prev, 
                `!!! CRITICAL_ERROR: Failed to establish handshake with remote execution kernel.`, 
                `!!! DETAIL: ${errorMsg}${status}`,
                lang === 'qnx' ? `*** PLEASE CONTACT MODERATOR TO TURN ON THE QNX VM SERVER TO ACCESS ***` : ''
            ].filter(Boolean));
            setLoading(false);
        }
    };

    const openWaveform = async () => {
        if (loading) return;
        setLoading(true);
        setLogs(prev => [...prev, `[WAVEFORM] Fetching VCD from server...`]);
        try {
            const response = await api.post('/execute/graph', {
                language: lang,
                designCode,
                testbenchCode: currentLab.hasTestbench ? testbenchCode : null
            }, { responseType: 'blob' });

            const vcdText = await response.data.text();
            if (!vcdText || vcdText.trim().length === 0) {
                throw new Error("Server returned an empty VCD file.");
            }

            const safeVcd = JSON.stringify(vcdText);

            const popupHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>BitLab VCD Viewer</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#0d1117;color:#c9d1d9;font-family:'Segoe UI',monospace;display:flex;flex-direction:column;height:100vh;overflow:hidden}
.bar{display:flex;align-items:center;justify-content:space-between;padding:10px 18px;background:#161b22;border-bottom:1px solid #30363d;flex-shrink:0}
.bar h1{font-size:14px;font-weight:700;color:#e6edf3;letter-spacing:.5px}
.controls{display:flex;gap:6px;align-items:center}
button{background:#21262d;color:#c9d1d9;border:1px solid #30363d;padding:4px 11px;border-radius:5px;cursor:pointer;font-size:12px;font-weight:600;transition:background .15s}
button:hover{background:#30363d;color:#e6edf3}
button.green{background:#238636;border-color:#2ea043;color:#fff}
button.green:hover{background:#2ea043}
.sep{width:1px;height:20px;background:#30363d;margin:0 4px}
.info{font-size:11px;color:#8b949e;padding:5px 18px;background:#0d1117;border-bottom:1px solid #21262d;flex-shrink:0;display:flex;gap:16px}
.info span{display:flex;align-items:center;gap:4px}
#canvas-wrap{flex:1;overflow:auto;position:relative;cursor:grab}
canvas{display:block}
#tooltip{position:fixed;background:#161b22;border:1px solid #30363d;color:#c9d1d9;font-size:11px;padding:5px 9px;border-radius:5px;pointer-events:none;display:none;font-family:monospace}
</style>
</head>
<body>
<div class="bar">
  <h1>&#x1F4E1; BitLab VCD Viewer</h1>
  <div class="controls">
    <span style="font-size:11px;color:#8b949e">Zoom</span>
    <button onclick="zoom(2)">&#x2b;</button>
    <button onclick="zoom(0.5)">&#x2212;</button>
    <div class="sep"></div>
    <button class="green" onclick="fitAll()">Fit All</button>
    <button onclick="resetZoom()">1:1</button>
    <div class="sep"></div>
    <span style="font-size:11px;color:#8b949e" id="zoomLabel">100%</span>
  </div>
</div>
<div class="info">
  <span id="sigCount">&#x23F3; Loading...</span>
  <span id="timeRange"></span>
  <span style="color:#484f58">Mousewheel = zoom &middot; Scroll = pan</span>
</div>
<div id="canvas-wrap"><canvas id="cv"></canvas></div>
<div id="tooltip"></div>

<script>
const RAW=${safeVcd};
let scale=1, SIG_H=38, LABEL_W=130, TS_H=22, PAD=4;
let parsed=null;

function parseVCD(src){
  const lines=src.split('\\n');
  const sigs={};const order=[];
  let t=0,unit='ns',magnitude=1;
  lines.forEach(l=>{
    l=l.trim();if(!l)return;
    if(l.startsWith('$timescale')){
      const m=l.match(/(\\d+)\\s*(fs|ps|ns|us|ms)/i);
      if(m){magnitude=parseInt(m[1]);unit=m[2].toLowerCase();}
    }
    else if(l.startsWith('$var')){
      const p=l.split(/\\s+/);
      if(p.length>=5){const id=p[3],nm=p[4].replace(/\\[.*\\]/,'');
        if(!sigs[id]){sigs[id]={nm,bits:parseInt(p[2])||1,events:[],lastV:'x'};order.push(id);}}
    }else if(l[0]==='#'){t=parseInt(l.slice(1));}
    else if(!l.startsWith('$')){
      let v,id;
      if(l[0]==='b'||l[0]==='B'){const p=l.split(/\\s+/);v=p[0].slice(1);id=p[1];}
      else{v=l[0];id=l.slice(1);}
      if(id&&sigs[id])sigs[id].events.push({t,v});
    }
  });
  return{sigs,order,maxT:t,unit,magnitude};
}

function fmtTime(t,unit,mag){
  const real=t*mag;
  if(real>=1e6)return(real/1e6).toFixed(1)+'ms';
  if(real>=1000)return(real/1000).toFixed(1)+'us';
  return real.toFixed(0)+unit;
}

function calcTickStep(maxT,availPx){
  // Target ~80px between ticks
  const rawStep=maxT/(availPx/80);
  const mag=Math.pow(10,Math.floor(Math.log10(rawStep)));
  const steps=[1,2,5,10,20,50,100,200,500];
  for(const s of steps)if(s*mag>=rawStep)return s*mag;
  return steps[steps.length-1]*mag;
}

function draw(){
  if(!parsed)parsed=parseVCD(RAW);
  const {sigs,order,maxT,unit,magnitude}=parsed;
  if(!order.length){document.getElementById('sigCount').textContent='No signals found.';return;}

  document.getElementById('sigCount').textContent=order.length+' signals';
  document.getElementById('timeRange').textContent='Duration: '+fmtTime(maxT,unit,magnitude);

  const wrap=document.getElementById('canvas-wrap');
  const viewW=wrap.clientWidth||1200;
  const dataW=Math.max(viewW-LABEL_W, maxT*scale+100);
  const H=TS_H+SIG_H*order.length+PAD*2;
  const cv=document.getElementById('cv');
  cv.width=LABEL_W+dataW;cv.height=H;
  const ctx=cv.getContext('2d');

  // Background
  ctx.fillStyle='#0d1117';ctx.fillRect(0,0,cv.width,H);

  const toPx=t=>t*scale;

  // Tick step
  const step=calcTickStep(maxT,dataW);

  // Grid verticals + time axis labels
  ctx.font='10px monospace';
  ctx.textBaseline='top';
  for(let t=0;t<=maxT+step;t+=step){
    const x=LABEL_W+toPx(t);
    if(x>cv.width)break;
    // Grid line
    ctx.strokeStyle='#1c2128';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(x,TS_H);ctx.lineTo(x,H);ctx.stroke();
    // Tick mark on timeline
    ctx.strokeStyle='#484f58';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(x,TS_H-5);ctx.lineTo(x,TS_H);ctx.stroke();
    // Label
    ctx.fillStyle='#8b949e';
    ctx.fillText(fmtTime(t,unit,magnitude),x+2,2);
  }

  // Timeline baseline
  ctx.strokeStyle='#30363d';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(LABEL_W,TS_H);ctx.lineTo(cv.width,TS_H);ctx.stroke();

  // Label panel bg
  ctx.fillStyle='#0d1117';ctx.fillRect(0,TS_H,LABEL_W,H);
  // Label panel border
  ctx.strokeStyle='#21262d';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(LABEL_W,0);ctx.lineTo(LABEL_W,H);ctx.stroke();

  order.forEach((id,i)=>{
    const sig=sigs[id];
    const y=TS_H+PAD+i*SIG_H;
    const mid=y+SIG_H/2;
    const hi=y+5, lo=y+SIG_H-7;
    const isBus=sig.bits>1;

    // Row bg alternating
    ctx.fillStyle=i%2===0?'transparent':'rgba(255,255,255,.02)';
    ctx.fillRect(LABEL_W,y,dataW,SIG_H);

    // Signal label
    ctx.fillStyle='#8b949e';ctx.font='bold 11px monospace';ctx.textBaseline='middle';
    ctx.fillText(sig.nm.length>14?sig.nm.slice(0,13)+'…':sig.nm,6,mid);
    if(sig.bits>1){ctx.fillStyle='#484f58';ctx.font='9px monospace';ctx.fillText('['+sig.bits+']',LABEL_W-30,mid);}

    // Row separator
    ctx.strokeStyle='#21262d';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(0,y+SIG_H);ctx.lineTo(cv.width,y+SIG_H);ctx.stroke();

    // Build event segments
    const evs=[{t:0,v:sig.events[0]?.v??'x'},...sig.events,{t:maxT,v:(sig.events.at(-1)?.v??'x')}];

    let prevX=LABEL_W,prevV=evs[0].v;
    for(let ei=1;ei<evs.length;ei++){
      const x=LABEL_W+toPx(evs[ei].t);
      const v=prevV.toLowerCase();
      const w=Math.max(x-prevX,0);
      if(!isBus){
        // Binary signal
        if(v==='0'||v==='1'){
          const y1=v==='1'?hi:lo;
          const ny=evs[ei].v.toLowerCase()==='1'?hi:lo;
          const col=v==='1'?'#3fb950':'#f85149';
          ctx.strokeStyle=col;ctx.lineWidth=1.5;
          ctx.beginPath();ctx.moveTo(prevX,y1);ctx.lineTo(x,y1);ctx.lineTo(x,ny);ctx.stroke();
          // Fill area under HIGH signal
          if(v==='1'){
            ctx.fillStyle='rgba(63,185,80,.1)';
            ctx.fillRect(prevX,hi,w,lo-hi);
          }
        }else if(v==='x'||v==='z'){
          const col=v==='x'?'rgba(248,81,73,.3)':'rgba(88,166,255,.3)';
          ctx.fillStyle=col;ctx.fillRect(prevX,hi,w,lo-hi);
          ctx.fillStyle=v==='x'?'#f85149':'#58a6ff';
          ctx.font='9px monospace';ctx.textBaseline='middle';
          if(w>12)ctx.fillText(v,prevX+4,mid);
        }
      }else{
        // Bus signal — diamond / trapezoid shape
        const tv=v.startsWith('b')?parseInt(v.slice(1),2):parseInt(v,16);
        const dsp=isNaN(tv)?v:('0x'+tv.toString(16).toUpperCase());
        ctx.strokeStyle='#58a6ff';ctx.lineWidth=1.5;
        ctx.beginPath();
        const sl=4; // slant px
        ctx.moveTo(prevX,mid);ctx.lineTo(Math.min(prevX+sl,x),hi);
        ctx.lineTo(x-sl,hi);ctx.lineTo(x,mid);ctx.lineTo(x-sl,lo);
        ctx.lineTo(Math.min(prevX+sl,x),lo);ctx.closePath();
        ctx.fillStyle='rgba(88,166,255,.12)';ctx.fill();ctx.stroke();
        ctx.fillStyle='#58a6ff';ctx.font='10px monospace';ctx.textBaseline='middle';
        if(w>30)ctx.fillText(dsp.length>10?dsp.slice(0,9)+'…':dsp,prevX+sl+4,mid);
      }
      prevX=x;prevV=evs[ei].v;
    }
  });

  document.getElementById('zoomLabel').textContent=Math.round(scale*100/fitScale())+'%';
}

function fitScale(){
  const {maxT}=parsed||{maxT:1};
  const wrap=document.getElementById('canvas-wrap');
  return Math.max(0.01,(wrap.clientWidth-LABEL_W-20)/Math.max(maxT,1));
}

function fitAll(){
  if(!parsed)parsed=parseVCD(RAW);
  scale=fitScale();
  draw();
}

function zoom(f){
  scale=Math.max(0.001,Math.min(scale*f,500));
  draw();
}

function resetZoom(){
  scale=fitScale();
  draw();
}


// Initial draw — fit all, then resize window to canvas
window.addEventListener('load',()=>{
  parsed=parseVCD(RAW);
  fitAll();
  // Resize window to fit the canvas + chrome (toolbar ~100px)
  const cv=document.getElementById('cv');
  const chromeH=window.outerHeight-window.innerHeight;
  const chromeW=window.outerWidth-window.innerWidth;
  const targetW=Math.min(cv.width+chromeW, screen.availWidth-40);
  const targetH=Math.min(cv.height+chromeH+80, screen.availHeight-60); // +80 for bar+info
  window.resizeTo(targetW, targetH);
});
<\/script>
</body></html>`;

            const blob = new Blob([popupHtml], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank', 'width=1200,height=700,menubar=no,toolbar=no');
            setLogs(prev => [...prev, `[WAVEFORM] VCD viewer opened.`]);
        } catch (err) {
            setLogs(prev => [...prev, `!!! WAVEFORM ERROR: ${err.message}`]);
        } finally {
            setLoading(false);
        }
    };

    // Keyboard & UI Sync
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.ctrlKey && e.key === 'Enter') executeCode();
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [designCode, testbenchCode, loading]);

    useEffect(() => {
        if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }, [logs]);

    return (
        <div className="flex h-screen bg-[#030712] overflow-hidden text-slate-300">
            <Sidebar />

            <div className="flex-1 flex flex-col relative overflow-hidden">
                {/* IDE Header */}
                <header className="h-14 border-b border-white/[0.03] bg-[#0b0f1a]/80 backdrop-blur-xl px-8 flex items-center justify-between z-40 relative overflow-hidden">
                    <div className="absolute inset-0 shimmer pointer-events-none opacity-5"></div>

                    <div className="flex items-center space-x-8">
                        <div className="flex items-center space-x-4">
                            <div className="p-2 bg-accent/10 border border-accent/20 rounded-xl text-accent shadow-[0_0_15px_rgba(139,92,246,0.1)]">
                                <currentLab.icon size={18} />
                            </div>
                            <div>
                                <h2 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">{currentLab.title}</h2>
                                <div className="flex items-center text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">
                                    <span className="w-1 h-1 rounded-full bg-emerald-500 mr-2 animate-pulse"></span> Remote Instance: 0xFD21
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center text-[10px] space-x-4">
                            <div className="h-4 w-px bg-white/5"></div>
                            <span className="text-slate-500 font-black uppercase tracking-widest flex items-center"><Box size={10} className="mr-2" /> Main.v</span>
                            <span className="text-slate-800 font-black uppercase tracking-widest">/</span>
                            <span className="text-slate-500 font-black uppercase tracking-widest flex items-center">Synthesis: Ready</span>
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        {lang !== 'qnx' && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={openWaveform}
                                disabled={loading}
                                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center space-x-3 transition-all duration-500 border border-accent/30 hover:bg-white/5 text-slate-300`}
                            >
                                {loading ? <Loader2 size={14} className="animate-spin" /> : <Activity size={14} className="text-accent" />}
                                <span>View Waveform</span>
                            </motion.button>
                        )}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={executeCode}
                            disabled={loading}
                            className={`px-8 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] flex items-center space-x-3 transition-all duration-500 ${loading ? 'bg-slate-800 text-slate-500' : 'bg-accent text-white shadow-glow hover:bg-accent-hover'}`}
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} className="fill-white" />}
                            <span>{loading ? 'Processing' : 'Execute Core'}</span>
                        </motion.button>
                    </div>
                </header>

                {/* Workspace */}
                <main key={lang} className="flex-1 flex overflow-hidden relative">
                    {/* Design Editor */}
                    <div className="flex-1 flex flex-col min-w-0">
                        <div className="h-8 px-6 flex items-center bg-[#070b14] border-b border-white/[0.03]">
                            <div className="flex items-center space-x-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent/40"></div>
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                    {lang === 'qnx' ? 'Source Console' : 'Logic Workspace'}
                                </span>
                            </div>
                        </div>
                        <div className="flex-1 bg-[#0b0f1a] relative">
                            <Editor
                                theme="vs-dark"
                                language={currentLab.mode}
                                value={designCode}
                                onChange={(val) => handleSave(val, 'design')}
                                options={{
                                    fontSize: 14,
                                    minimap: { enabled: false },
                                    scrollBeyondLastLine: false,
                                    padding: { top: 20 },
                                    backgroundColor: '#0b0f1a'
                                }}
                            />
                        </div>
                    </div>

                    {/* Conditional Testbench Editor */}
                    {currentLab.hasTestbench && (
                        <div className="w-[40%] flex flex-col bg-[#070b14]/50 backdrop-blur-sm border-l border-white/[0.03]">
                            <div className="h-8 px-6 flex items-center border-b border-white/[0.03]">
                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Simulation Stimulus</span>
                            </div>
                            <div className="flex-1">
                                <Editor
                                    theme="vs-dark"
                                    language={currentLab.mode}
                                    value={testbenchCode}
                                    onChange={(val) => handleSave(val, 'tb')}
                                    options={{
                                        fontSize: 14,
                                        minimap: { enabled: false },
                                        scrollBeyondLastLine: false,
                                        padding: { top: 20 },
                                        backgroundColor: '#070b14'
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </main>

                {/* Terminal / Status Bar Layout */}
                <div className={`transition-all duration-500 ${isTerminalOpen ? 'h-[280px]' : 'h-10'} border-t border-white/[0.03] bg-black/60 flex flex-col relative`}>
                    <div
                        onClick={() => setIsTerminalOpen(!isTerminalOpen)}
                        className="h-10 px-8 flex items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors relative z-10"
                    >
                        <div className="flex items-center space-x-4">
                            <TerminalIcon size={14} className="text-emerald-500" />
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Console Stream_09X</span>
                        </div>
                        <div className="flex items-center space-x-8">
                            <div className="flex items-center text-[8px] font-black text-slate-700 uppercase tracking-widest space-x-4">
                                <span className="flex items-center"><Wifi size={10} className="mr-2 text-emerald-500" /> Uplink: 1.2ms</span>
                                <span className="flex items-center"><Cpu size={10} className="mr-2" /> Host: Lab-7</span>
                            </div>
                            <ChevronDown size={14} className={`transform transition-transform duration-500 ${isTerminalOpen ? '' : 'rotate-180'} text-slate-600`} />
                        </div>
                    </div>

                    {isTerminalOpen && (
                        <div
                            ref={terminalRef}
                            className="flex-1 overflow-y-auto font-mono text-[11px] p-10 text-emerald-400/70 leading-relaxed selection:bg-emerald-500/20 custom-scrollbar relative"
                        >
                            {/* Terminal Scanline Effect */}
                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-emerald-500/[0.02] to-transparent bg-[length:100%_4px] opacity-10"></div>

                            <div className="max-w-6xl relative z-10">
                                {logs.map((log, i) => (
                                    <motion.div
                                        initial={{ opacity: 0, x: -5 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        key={i}
                                        className="mb-2 flex items-start"
                                    >
                                        <span className="text-emerald-900 font-bold mr-6 select-none">{i.toString().padStart(3, '0')}</span>
                                        <span className="flex-1">{log}</span>
                                    </motion.div>
                                ))}
                                {loading && (
                                    <div className="flex items-center space-x-4 mt-4">
                                        <span className="w-1.5 h-4 bg-accent animate-pulse"></span>
                                        <span className="text-accent font-black text-[10px] uppercase tracking-[0.3em]">Processing Logic Vectors...</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Global Footer / Tiny Status Bar */}
                <footer className="h-6 bg-[#0b0f1a] border-t border-white/[0.03] flex items-center justify-between px-6 z-50">
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center text-[8px] font-black text-accent uppercase tracking-widest">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span> System Ready
                        </div>
                        <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">BitLab Engine v4.0</span>
                    </div>
                    <div className="flex items-center space-x-6 text-[8px] font-black text-slate-700 uppercase tracking-widest">
                        <span className="flex items-center"><HardDrive size={10} className="mr-2" /> 2.4 TB Free</span>
                        <span className="flex items-center"><ChevronRight size={10} className="mx-1" /> Node: Primary</span>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default CodeLab;
