import React from 'react';
import { ArrowLeft, Smartphone, Compass, Zap, ShieldAlert, Sparkles, Flame, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { sound } from '../../utils/sound.js';

export const HowToPlayScreen = ({ onNavigate }) => {
  const steps = [
    { num: '01', title: 'CONNECT', desc: 'Connect your smartphone to the game.', icon: Smartphone, color: 'from-emerald-500 to-teal-600', border: 'border-emerald-500/40', badge: 'Wi-Fi Bridge' },
    { num: '02', title: 'CALIBRATE', desc: 'Hold your phone still during calibration.', icon: Compass, color: 'from-cyan-500 to-blue-600', border: 'border-cyan-500/40', badge: 'Zero Gyro' },
    { num: '03', title: 'SLICE', desc: 'Move your phone like a sword to slice fruits.', icon: Zap, color: 'from-amber-500 to-orange-600', border: 'border-amber-500/40', badge: 'Motion Katana' },
    { num: '04', title: 'AVOID BOMBS', desc: 'Do not hit bombs.', icon: ShieldAlert, color: 'from-red-500 to-rose-700', border: 'border-red-500/40', badge: 'Danger!' },
  ];

  return (
    <div id="how-to-play-screen" className="relative w-full h-full flex flex-col items-center justify-between p-6 sm:p-10 z-30 select-none overflow-y-auto">
      <div className="w-full max-w-5xl flex items-center justify-between">
        <button
          onClick={() => { sound.playButton(); onNavigate('MAIN_MENU'); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-arcade text-sm">MENU</span>
        </button>
        <h1 className="font-arcade text-3xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-red-500 arcade-text-shadow">HOW TO PLAY</h1>
        <div className="w-16" />
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={step.num}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className={`flex flex-col justify-between p-5 rounded-3xl bg-slate-900/80 backdrop-blur-md border ${step.border} shadow-xl relative overflow-hidden`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="font-arcade text-3xl sm:text-4xl text-slate-400/50">{step.num}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">{step.badge}</span>
              </div>
              <div className="my-2 flex items-center justify-center">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg border border-white/20`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="mt-4 text-center">
                <h3 className="font-arcade text-xl sm:text-2xl text-white tracking-wider mb-1">{step.title}</h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{step.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-5xl bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-md border border-amber-500/40 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col md:flex-row items-center justify-around gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400"><Sparkles className="w-5 h-5" /></div>
          <div>
            <div className="font-arcade text-base sm:text-lg text-amber-300 tracking-wider">MORE FRUITS = MORE SCORE</div>
            <div className="text-xs text-slate-400">Each fruit grants 10-25 base points</div>
          </div>
        </div>
        <div className="hidden md:block w-px h-10 bg-slate-700" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400"><Flame className="w-5 h-5" /></div>
          <div>
            <div className="font-arcade text-base sm:text-lg text-orange-400 tracking-wider">CONSECUTIVE CUTS = COMBO</div>
            <div className="text-xs text-slate-400">Chain slices within 400ms for multiplier</div>
          </div>
        </div>
        <div className="hidden md:block w-px h-10 bg-slate-700" />
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-yellow-400"><Trophy className="w-5 h-5" /></div>
          <div>
            <div className="font-arcade text-base sm:text-lg text-yellow-300 tracking-wider">HIGH COMBO = HIGH SCORE</div>
            <div className="text-xs text-slate-400">Multiply points up to x10 or higher!</div>
          </div>
        </div>
      </motion.div>

      <div className="mt-6">
        <button
          onClick={() => { sound.playButton(); sound.playSlice(2); onNavigate('GAMEPLAY'); }}
          className="px-10 py-4 rounded-2xl bg-gradient-to-b from-amber-400 to-orange-600 hover:from-amber-300 hover:to-orange-500 text-white font-arcade text-xl tracking-wider border-2 border-amber-300 shadow-[0_6px_0_#9a3412,0_12px_25px_rgba(234,88,12,0.5)] active:scale-95 transition-all cursor-pointer"
        >
          PLAY NOW
        </button>
      </div>
    </div>
  );
};
