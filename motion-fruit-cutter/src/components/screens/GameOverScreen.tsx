import React, { useEffect } from 'react';
import { RotateCcw, Home, Trophy, Flame, ShieldAlert, Sparkles, Award } from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { GameStats, ScreenState } from '../../types';
import { sound } from '../../utils/sound';

interface GameOverScreenProps {
  stats: GameStats;
  onPlayAgain: () => void;
  onNavigate: (screen: ScreenState) => void;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  stats,
  onPlayAgain,
  onNavigate,
}) => {
  const isNewHighScore = stats.score > 0 && stats.score >= stats.bestScore;

  useEffect(() => {
    if (isNewHighScore) {
      sound.playHighScoreFanfare();
      // Multi-wave confetti burst
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#f43f5e'],
        });
        setTimeout(() => {
          confetti({
            particleCount: 60,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#fbbf24', '#f97316', '#ffffff'],
          });
          confetti({
            particleCount: 60,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#fbbf24', '#f97316', '#ffffff'],
          });
        }, 300);
      } catch {
        // Safe fallback
      }
    } else {
      sound.playCountdownTick(true);
    }
  }, [isNewHighScore]);

  return (
    <div
      id="game-over-screen"
      className="relative w-full h-full flex flex-col items-center justify-between p-6 sm:p-10 z-30 select-none overflow-y-auto"
    >
      <div className="w-full max-w-xl my-auto flex flex-col items-center">
        {/* NEW HIGH SCORE CELEBRATION BADGE */}
        {isNewHighScore && (
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: [0.8, 1.15, 1], rotate: 0 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 border-2 border-yellow-200 text-slate-950 font-arcade text-xl sm:text-2xl tracking-wider shadow-[0_0_35px_rgba(245,158,11,0.9)] animate-pulse mb-3"
          >
            <Trophy className="w-6 h-6 fill-current text-slate-950" />
            <span>NEW HIGH SCORE!</span>
            <Sparkles className="w-6 h-6 fill-current text-slate-950" />
          </motion.div>
        )}

        {/* Title */}
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="font-arcade text-5xl sm:text-7xl text-transparent bg-clip-text bg-gradient-to-b from-red-400 via-orange-500 to-amber-500 arcade-title-shadow tracking-widest text-center mb-6"
        >
          GAME OVER
        </motion.h1>

        {/* Stats Summary Card */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="w-full bg-[#12141c]/95 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-[0_25px_60px_rgba(0,0,0,0.85)] flex flex-col gap-5 relative overflow-hidden"
        >
          {/* Subtle dot-grid texture on modal */}
          <div className="absolute inset-0 opacity-15 pointer-events-none vibrant-dot-grid" />

          {/* Main Score Display */}
          <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-[#0c0d12]/80 border border-white/10 z-10">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
              FINAL SCORE
            </span>
            <div
              className="text-5xl sm:text-6xl font-black text-[#ffcc00] drop-shadow-[0_0_15px_rgba(255,204,0,0.5)] tracking-tight leading-none"
              style={{ fontFamily: 'Arial, sans-serif' }}
            >
              {stats.score.toLocaleString()}
            </div>
          </div>

          {/* Stats Grid: Best Score, Fruits Cut, Max Combo, Bombs Hit */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 z-10">
            {/* BEST SCORE */}
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#1c1f2e]/80 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-[#ffcc00] shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[11px] font-bold text-gray-400 uppercase">
                  BEST SCORE
                </span>
                <span className="font-mono font-bold text-lg sm:text-xl text-[#ffcc00]">
                  {stats.bestScore.toLocaleString()}
                </span>
              </div>
            </div>

            {/* FRUITS CUT */}
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#1c1f2e]/80 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[11px] font-bold text-gray-400 uppercase">
                  FRUITS CUT
                </span>
                <span className="font-mono font-bold text-lg sm:text-xl text-emerald-400">
                  {stats.fruitsCut}
                </span>
              </div>
            </div>

            {/* MAX COMBO */}
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#1c1f2e]/80 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-[#ff3e3e] shrink-0">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[11px] font-bold text-gray-400 uppercase">
                  MAX COMBO
                </span>
                <span className="font-mono font-bold text-lg sm:text-xl text-orange-400">
                  x{stats.maxCombo}
                </span>
              </div>
            </div>

            {/* BOMBS HIT */}
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-[#1c1f2e]/80 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[11px] font-bold text-gray-400 uppercase">
                  BOMBS HIT
                </span>
                <span className="font-mono font-bold text-lg sm:text-xl text-rose-400">
                  {stats.bombsHit}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons: PLAY AGAIN & MAIN MENU */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 z-10">
            <button
              id="game-over-play-again-btn"
              onClick={() => {
                sound.playButton();
                sound.playSlice(2);
                onPlayAgain();
              }}
              className="flex-1 py-4 rounded-2xl bg-gradient-to-b from-amber-400 via-orange-500 to-red-600 hover:from-amber-300 hover:to-orange-500 text-white font-arcade text-xl tracking-wider border-2 border-amber-200 shadow-[0_6px_0_#9a3412,0_10px_25px_rgba(255,62,62,0.5)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-3"
            >
              <RotateCcw className="w-5 h-5" />
              <span>PLAY AGAIN</span>
            </button>

            <button
              id="game-over-main-menu-btn"
              onClick={() => {
                sound.playButton();
                onNavigate('MAIN_MENU');
              }}
              className="py-4 px-6 rounded-2xl bg-[#1c1f2e] hover:bg-[#252a3d] text-white font-arcade text-lg tracking-wider border border-white/10 shadow-lg active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              <span>MAIN MENU</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
