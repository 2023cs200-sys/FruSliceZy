import React from 'react';
import { ArrowLeft, Trophy, Medal, Flame, Play } from 'lucide-react';
import { motion } from 'motion/react';
import { HighScoreEntry, ScreenState } from '../../types';
import { sound } from '../../utils/sound';

interface HighScoresScreenProps {
  highScores: HighScoreEntry[];
  onNavigate: (screen: ScreenState) => void;
}

export const HighScoresScreen: React.FC<HighScoresScreenProps> = ({
  highScores,
  onNavigate,
}) => {
  return (
    <div
      id="high-scores-screen"
      className="relative w-full h-full flex flex-col items-center justify-between p-6 sm:p-10 z-30 select-none overflow-y-auto"
    >
      {/* Header Bar */}
      <div className="w-full max-w-2xl flex items-center justify-between">
        <button
          onClick={() => {
            sound.playButton();
            onNavigate('MAIN_MENU');
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-arcade text-sm">MENU</span>
        </button>

        <h1 className="font-arcade text-3xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 arcade-text-shadow">
          HIGH SCORES
        </h1>

        <div className="w-16" />
      </div>

      {/* Leaderboard Table */}
      <div className="w-full max-w-2xl my-auto bg-slate-900/90 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl flex flex-col gap-3">
        {/* Table Header */}
        <div className="flex items-center justify-between px-4 py-2 text-xs font-bold text-amber-400/80 uppercase tracking-widest border-b border-slate-800">
          <span className="w-12">RANK</span>
          <span className="flex-1 text-left">SLICER</span>
          <span className="hidden sm:inline w-20 text-center">COMBO</span>
          <span className="w-24 text-right">SCORE</span>
        </div>

        {/* Rows */}
        {highScores.map((entry, index) => {
          const isTop3 = entry.rank <= 3;
          const rankColors = [
            'from-amber-400 to-yellow-500 text-slate-950 border-amber-300', // Gold
            'from-slate-300 to-slate-400 text-slate-950 border-slate-200', // Silver
            'from-amber-700 to-amber-800 text-amber-100 border-amber-600', // Bronze
          ];

          return (
            <motion.div
              key={entry.rank}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.08 }}
              className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all ${
                entry.rank === 1
                  ? 'bg-amber-500/15 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800/80'
              }`}
            >
              {/* Rank Pill */}
              <div className="w-12 flex items-center">
                {isTop3 ? (
                  <div
                    className={`w-7 h-7 rounded-lg bg-gradient-to-br ${
                      rankColors[entry.rank - 1]
                    } font-arcade text-sm flex items-center justify-center font-bold shadow-md border`}
                  >
                    {entry.rank}
                  </div>
                ) : (
                  <span className="font-arcade text-base text-slate-500 pl-2">
                    {entry.rank}
                  </span>
                )}
              </div>

              {/* Player Name */}
              <div className="flex-1 flex items-center gap-2">
                <span className="font-arcade text-base sm:text-lg text-white tracking-wider">
                  {entry.playerName}
                </span>
                {entry.rank === 1 && (
                  <Trophy className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                )}
              </div>

              {/* Max Combo */}
              <div className="hidden sm:flex items-center justify-center gap-1 w-20 text-orange-400 text-xs font-bold">
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>x{entry.combo}</span>
              </div>

              {/* Score */}
              <div className="w-24 text-right">
                <span
                  className={`font-arcade text-xl sm:text-2xl tracking-wide ${
                    entry.rank === 1 ? 'text-amber-300' : 'text-slate-200'
                  }`}
                >
                  {entry.score.toLocaleString()}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Play Button */}
      <div className="mt-4">
        <button
          onClick={() => {
            sound.playButton();
            sound.playSlice(2);
            onNavigate('GAMEPLAY');
          }}
          className="px-10 py-4 rounded-2xl bg-gradient-to-b from-amber-400 to-orange-600 hover:from-amber-300 hover:to-orange-500 text-white font-arcade text-xl tracking-wider border-2 border-amber-300 shadow-[0_6px_0_#9a3412,0_12px_25px_rgba(234,88,12,0.5)] active:scale-95 transition-all cursor-pointer flex items-center gap-2"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>PLAY NOW</span>
        </button>
      </div>
    </div>
  );
};
