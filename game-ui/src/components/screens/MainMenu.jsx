import React, { useState } from 'react';
import { Play, BookOpen, Trophy, Settings, Smartphone, Zap, MousePointer2, X } from 'lucide-react';
import { motion } from 'motion/react';
import { sound } from '../../utils/sound.js';

export const MainMenu = ({ onNavigate, onStartGame, bestScore }) => {
  const [showPlayOptions, setShowPlayOptions] = useState(false);

  const handlePlayClick = () => {
    sound.playButton();
    setShowPlayOptions(true);
  };

  const handlePlayMode = (mode) => {
    sound.playButton();
    sound.playSlice(2);
    setShowPlayOptions(false);
    if (mode === 'controller') {
      onNavigate('CONNECT');
    } else {
      onStartGame();
    }
  };

  const handleNav = (screen) => {
    sound.playButton();
    onNavigate(screen);
  };

  return (
    <div
      id="main-menu-screen"
      className="relative w-full h-full flex flex-col items-center justify-between p-6 sm:p-10 z-30 select-none overflow-hidden"
    >
      {/* Dynamic 3D Floating Fruits in Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/5 w-72 h-72 rounded-full bg-orange-600/20 blur-[90px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/5 w-80 h-80 rounded-full bg-red-600/20 blur-[100px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-amber-500/15 blur-[120px]" />

        <motion.div
          animate={{ y: [-15, 15, -15], rotate: [0, 12, 0] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-16 left-[10%] opacity-40 text-7xl select-none"
        >
          🍉
        </motion.div>
        <motion.div
          animate={{ y: [20, -20, 20], rotate: [0, -15, 0] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-28 right-[12%] opacity-40 text-7xl select-none"
        >
          🍍
        </motion.div>
        <motion.div
          animate={{ y: [-10, 18, -10], rotate: [0, 20, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-24 left-[14%] opacity-35 text-6xl select-none"
        >
          🍎
        </motion.div>
        <motion.div
          animate={{ y: [15, -15, 15], rotate: [0, -25, 0] }}
          transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-28 right-[15%] opacity-35 text-6xl select-none"
        >
          🍌
        </motion.div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[3px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent -rotate-12 opacity-30 shadow-[0_0_20px_rgba(56,189,248,0.8)]" />
      </div>

      {/* TOP HEADER */}
      <div className="w-full flex items-center justify-end max-w-5xl z-10">
        <button
          onClick={() => handleNav('CONNECT')}
          className="group flex items-center gap-2.5 bg-[#12141c]/80 hover:bg-[#1a1d29] backdrop-blur-md px-4 py-2 rounded-full border border-white/10 hover:border-green-500/50 text-green-400 transition-all cursor-pointer shadow-lg active:scale-95"
        >
          <Smartphone className="w-4 h-4 group-hover:rotate-12 transition-transform" />
          <span className="text-[10px] sm:text-xs font-bold tracking-widest uppercase">CONTROLLER</span>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
        </button>
      </div>

      {/* CENTER LOGO */}
      <div className="flex flex-col items-center justify-center my-auto z-10 text-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/30 border border-red-500/50 text-red-300 text-xs font-bold tracking-widest uppercase mb-4 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
          <span>3D Motion Arcade Slicer</span>
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-current" />
        </motion.div>

        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative"
        >
          <h1 className="font-arcade text-5xl sm:text-7xl md:text-8xl tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-orange-400 to-red-600 arcade-title-shadow">
            FruSliceZy
          </h1>
          <div className="absolute -inset-x-6 top-1/2 h-[3px] bg-gradient-to-r from-transparent via-white to-transparent shadow-[0_0_12px_#fff] -rotate-3 pointer-events-none opacity-80" />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-3 text-sm sm:text-base md:text-lg font-bungee tracking-[0.3em] text-orange-200/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
        >
          SLICE • MOVE • MASTER
        </motion.p>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
          className="mt-8 sm:mt-10"
        >
          <button
            id="main-menu-play-btn"
            onClick={handlePlayClick}
            className="group relative px-12 sm:px-16 py-5 sm:py-6 rounded-3xl bg-gradient-to-b from-amber-400 via-orange-500 to-red-600 hover:from-amber-300 hover:via-orange-400 hover:to-red-500 active:scale-95 transition-all text-white border-4 border-amber-200 shadow-[0_8px_0_#9a3412,0_16px_35px_rgba(234,88,12,0.6)] cursor-pointer flex items-center justify-center gap-4"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/40 group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-white text-white translate-x-0.5" />
            </div>
            <span className="font-arcade text-3xl sm:text-5xl tracking-widest text-white arcade-text-shadow">
              PLAY
            </span>
          </button>
        </motion.div>
      </div>

      {showPlayOptions && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-[#05070b]/75 backdrop-blur-sm p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-xl rounded-3xl border border-amber-400/40 bg-[#12141c]/95 p-6 sm:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.7)]"
          >
            <button
              onClick={() => setShowPlayOptions(false)}
              aria-label="Close play options"
              className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 p-2 text-slate-400 transition-colors hover:text-white cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="text-center">
              <h2 className="font-arcade text-2xl sm:text-3xl tracking-wider text-amber-300">CHOOSE YOUR CONTROLLER</h2>
              <p className="mt-2 text-sm text-slate-400">Select how you want to slice the fruit.</p>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <button
                onClick={() => handlePlayMode('controller')}
                className="group rounded-2xl border-2 border-emerald-400/50 bg-emerald-950/40 p-5 text-left transition-all hover:border-emerald-300 hover:bg-emerald-900/50 active:scale-95 cursor-pointer"
              >
                <Smartphone className="h-8 w-8 text-emerald-300 transition-transform group-hover:-rotate-6" />
                <span className="mt-4 block font-arcade text-lg tracking-wider text-white">WITH CONTROLLER</span>
                <span className="mt-2 block text-sm text-emerald-100/70">Connect and calibrate your phone before playing.</span>
              </button>
              <button
                onClick={() => handlePlayMode('mouse')}
                className="group rounded-2xl border-2 border-cyan-400/50 bg-cyan-950/40 p-5 text-left transition-all hover:border-cyan-300 hover:bg-cyan-900/50 active:scale-95 cursor-pointer"
              >
                <MousePointer2 className="h-8 w-8 text-cyan-300 transition-transform group-hover:scale-110" />
                <span className="mt-4 block font-arcade text-lg tracking-wider text-white">WITHOUT CONTROLLER</span>
                <span className="mt-2 block text-sm text-cyan-100/70">Use your mouse to move and slice.</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* BOTTOM BUTTONS */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-3xl flex flex-wrap items-center justify-center gap-3 sm:gap-4 z-10"
      >
        <button
          id="main-menu-connect-btn"
          onClick={() => handleNav('CONNECT')}
          className="flex-1 min-w-[140px] flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-[#12141c]/90 hover:bg-[#1c1f2e] backdrop-blur-md border border-white/10 hover:border-emerald-400/50 text-white transition-all shadow-lg active:scale-95 cursor-pointer group"
        >
          <Smartphone className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="font-arcade text-base sm:text-lg tracking-wider">CONTROLLER</span>
        </button>

        <button
          id="main-menu-how-to-play-btn"
          onClick={() => handleNav('HOW_TO_PLAY')}
          className="flex-1 min-w-[140px] flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-[#12141c]/90 hover:bg-[#1c1f2e] backdrop-blur-md border border-white/10 hover:border-cyan-400/50 text-white transition-all shadow-lg active:scale-95 cursor-pointer group"
        >
          <BookOpen className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span className="font-arcade text-base sm:text-lg tracking-wider">HOW TO PLAY</span>
        </button>

        <button
          id="main-menu-settings-btn"
          onClick={() => handleNav('SETTINGS')}
          className="flex-1 min-w-[140px] flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-[#12141c]/90 hover:bg-[#1c1f2e] backdrop-blur-md border border-white/10 hover:border-purple-400/50 text-white transition-all shadow-lg active:scale-95 cursor-pointer group"
        >
          <Settings className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
          <span className="font-arcade text-base sm:text-lg tracking-wider">SETTINGS</span>
        </button>
      </motion.div>
    </div>
  );
};
