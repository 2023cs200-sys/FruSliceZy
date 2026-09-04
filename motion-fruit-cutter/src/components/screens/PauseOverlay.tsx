import React from 'react';
import { Play, RotateCcw, Settings, Home } from 'lucide-react';
import { motion } from 'motion/react';
import { sound } from '../../utils/sound';

interface PauseOverlayProps {
  onResume: () => void;
  onRestart: () => void;
  onSettings: () => void;
  onMainMenu: () => void;
}

export const PauseOverlay: React.FC<PauseOverlayProps> = ({
  onResume,
  onRestart,
  onSettings,
  onMainMenu,
}) => {
  return (
    <motion.div
      id="pause-menu-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-6 select-none"
    >
      <motion.div
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 20 }}
        className="w-full max-w-md bg-[#12141c]/95 border border-white/10 rounded-3xl p-8 shadow-[0_25px_60px_rgba(0,0,0,0.85)] flex flex-col items-center text-center backdrop-blur-xl relative overflow-hidden"
      >
        {/* Subtle dot-grid texture on modal */}
        <div className="absolute inset-0 opacity-15 pointer-events-none vibrant-dot-grid" />

        {/* Title */}
        <h2
          className="text-5xl sm:text-6xl font-black italic tracking-tighter text-white drop-shadow-lg mb-6 z-10"
          style={{ transform: 'skewX(-6deg)' }}
        >
          PAUSED
        </h2>

        {/* Buttons List */}
        <div className="w-full flex flex-col gap-3.5 z-10">
          {/* RESUME */}
          <button
            id="pause-resume-btn"
            onClick={() => {
              sound.playButton();
              onResume();
            }}
            className="w-full py-4 rounded-2xl bg-gradient-to-b from-amber-400 via-orange-500 to-red-600 hover:from-amber-300 hover:to-orange-500 text-white font-arcade text-xl sm:text-2xl tracking-wider border-2 border-amber-300 shadow-[0_6px_0_#9a3412,0_10px_20px_rgba(255,62,62,0.4)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-3"
          >
            <Play className="w-6 h-6 fill-white" />
            <span>RESUME</span>
          </button>

          {/* RESTART */}
          <button
            id="pause-restart-btn"
            onClick={() => {
              sound.playButton();
              onRestart();
            }}
            className="w-full py-3.5 rounded-2xl bg-[#1c1f2e] hover:bg-[#252a3d] text-white font-arcade text-lg tracking-wider border border-white/10 hover:border-amber-400/40 shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-3"
          >
            <RotateCcw className="w-5 h-5 text-[#ffcc00]" />
            <span>RESTART</span>
          </button>

          {/* SETTINGS */}
          <button
            id="pause-settings-btn"
            onClick={() => {
              sound.playButton();
              onSettings();
            }}
            className="w-full py-3.5 rounded-2xl bg-[#1c1f2e] hover:bg-[#252a3d] text-white font-arcade text-lg tracking-wider border border-white/10 hover:border-purple-400/40 shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-3"
          >
            <Settings className="w-5 h-5 text-purple-400" />
            <span>SETTINGS</span>
          </button>

          {/* MAIN MENU */}
          <button
            id="pause-main-menu-btn"
            onClick={() => {
              sound.playButton();
              onMainMenu();
            }}
            className="w-full py-3.5 rounded-2xl bg-[#0c0d12] hover:bg-[#181a24] text-gray-400 hover:text-white font-arcade text-base tracking-wider border border-white/5 hover:border-white/15 shadow active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-3"
          >
            <Home className="w-4 h-4" />
            <span>MAIN MENU</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
