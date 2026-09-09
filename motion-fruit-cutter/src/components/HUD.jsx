import React, { useEffect, useState } from 'react';
import { Pause, Volume2, VolumeX, ShieldAlert, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const HUD = ({ stats, onPause, soundEnabled, onToggleSound, bombAlert }) => {
  const [scoreScale, setScoreScale] = useState(1);
  const [lastScore, setLastScore] = useState(stats.score);

  useEffect(() => {
    if (stats.score > lastScore) {
      setScoreScale(1.25);
      const t = setTimeout(() => setScoreScale(1), 140);
      setLastScore(stats.score);
      return () => clearTimeout(t);
    }
    setLastScore(stats.score);
  }, [stats.score, lastScore]);

  const timePercent = Math.max(0, Math.min(100, (stats.timeRemaining / stats.initialTime) * 100));
  const isTimeCritical = stats.timeRemaining <= 10;

  const minutes = Math.floor(stats.timeRemaining / 60);
  const seconds = stats.timeRemaining % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div id="game-hud-overlay" className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-6 sm:p-8 select-none">
      {/* Bomb Alert Flash Banner */}
      <AnimatePresence>
        {bombAlert && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: -40 }}
            animate={{ opacity: 1, scale: 1.1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ duration: 0.15 }}
            className="absolute top-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-8 py-3 rounded-2xl bg-red-600/90 border-2 border-red-400 text-white shadow-[0_0_35px_rgba(255,62,62,0.8)] backdrop-blur-md"
          >
            <ShieldAlert className="w-8 h-8 text-[#ffcc00] animate-bounce" />
            <div className="font-arcade text-3xl sm:text-4xl tracking-wider text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              BOMB HIT!
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TOP ROW */}
      <div id="hud-top-bar" className="flex items-start justify-between w-full">
        {/* Score */}
        <div id="hud-score-widget" className="pointer-events-auto flex flex-col">
          <div className="text-gray-400 text-xs font-black tracking-widest uppercase mb-1">Score</div>
          <motion.div
            animate={{ scale: scoreScale }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
            className="text-5xl sm:text-6xl font-black text-[#ffcc00] drop-shadow-[0_0_15px_rgba(255,204,0,0.5)] tracking-tight leading-none"
            style={{ fontFamily: 'Arial, sans-serif' }}
          >
            {stats.score.toLocaleString()}
          </motion.div>
          <div className="mt-2.5 sm:mt-3 flex items-center gap-2">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 animate-pulse" />
            <div className="text-[10px] sm:text-xs text-green-400 font-bold uppercase tracking-tighter">
              Controller: Connected
            </div>
          </div>
        </div>

        {/* Combo */}
        <div id="hud-combo-widget" className="flex flex-col items-center">
          <AnimatePresence>
            {stats.currentCombo > 1 && (
              <motion.div
                key={stats.currentCombo}
                initial={{ scale: 0.5, y: -20, opacity: 0 }}
                animate={{ scale: [1, 1.2, 1], y: 0, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col items-center text-center"
              >
                <div className="bg-gradient-to-r from-transparent via-red-600 to-transparent px-10 sm:px-14 py-1">
                  <div
                    className="text-4xl sm:text-5xl font-black italic tracking-tighter text-white drop-shadow-lg"
                    style={{ transform: 'skewX(-10deg)' }}
                  >
                    x{stats.currentCombo} COMBO!
                  </div>
                </div>
                <div className="text-xs font-bold text-orange-400 uppercase tracking-[0.3em] mt-1.5">
                  Insane Slicing
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Timer */}
        <div id="hud-time-widget" className="pointer-events-auto flex flex-col items-end">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-800" />
              <circle
                cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="transparent"
                className={isTimeCritical ? 'text-red-400 animate-pulse' : 'text-[#ff3e3e]'}
                strokeDasharray="226"
                strokeDashoffset={226 - (226 * timePercent) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center font-black text-xl sm:text-2xl text-white">
              {stats.timeRemaining}s
            </div>
          </div>
          <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-2">Time Remaining</div>
        </div>
      </div>

      {/* BOTTOM ROW */}
      <div id="hud-bottom-bar" className="flex items-end justify-between w-full">
        <div id="hud-level-badge" className="pointer-events-auto flex flex-col gap-1">
          <div className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2">

          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
              Mode: <span className="text-emerald-400">{stats.difficulty}</span>
            </span>
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
              Fruits: <span className="text-[#ffcc00]">{stats.fruitsCut}</span>
            </span>
          </div>
        </div>

        <div id="hud-actions" className="pointer-events-auto flex items-center gap-4 sm:gap-6">
          <div className="flex flex-col items-end">
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-1">High Score</div>
            <div className="text-lg sm:text-xl font-bold font-mono text-white">{stats.bestScore.toLocaleString()}</div>
          </div>

          <button
            id="hud-sound-toggle-btn"
            onClick={onToggleSound}
            aria-label="Toggle Sound"
            className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center transition-colors group cursor-pointer shadow-lg active:scale-95 text-white"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            ) : (
              <VolumeX className="w-5 h-5 text-[#ff3e3e]" />
            )}
          </button>

          <button
            id="hud-pause-btn"
            onClick={onPause}
            aria-label="Pause Game"
            className="w-12 h-12 sm:w-14 sm:h-14 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center transition-colors group cursor-pointer shadow-lg active:scale-95 text-white"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
