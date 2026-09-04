import React, { useState, useEffect } from 'react';
import { CheckCircle2, RefreshCw, Smartphone, Play, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { sound } from '../../utils/sound.js';

export const CalibrationScreen = ({ onNavigate }) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    setProgress(0);
    setIsComplete(false);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsComplete(true);
          sound.playCombo(4);
          return 100;
        }
        return prev + 2;
      });
    }, 40);

    return () => clearInterval(interval);
  }, []);

  const handleRecalibrate = () => {
    sound.playButton();
    setIsComplete(false);
    setProgress(0);
  };

  const handleStartGame = () => {
    sound.playButton();
    sound.playSlice(3);
    onNavigate('GAMEPLAY');
  };

  return (
    <div id="calibration-screen" className="relative w-full h-full flex flex-col items-center justify-between p-6 sm:p-10 z-30 select-none">
      <div className="w-full max-w-xl flex items-center justify-between">
        <button
          onClick={() => { sound.playButton(); onNavigate('CONNECT'); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-arcade text-sm">BACK</span>
        </button>
        <span className="font-arcade text-xs text-emerald-400 tracking-wider">STEP 2 OF 2</span>
      </div>

      <div className="flex flex-col items-center text-center my-auto max-w-lg">
        <h1 className="font-arcade text-3xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-400 arcade-text-shadow leading-tight mb-2">
          CALIBRATE CONTROLLER
        </h1>

        <motion.p
          animate={{ opacity: isComplete ? 0.6 : [0.7, 1, 0.7] }}
          transition={{ duration: 1.5, repeat: isComplete ? 0 : Infinity }}
          className="font-arcade text-xl sm:text-2xl text-amber-300 tracking-wider mb-8"
        >
          {isComplete ? 'READY FOR BATTLE!' : 'Hold your phone still'}
        </motion.p>

        <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-xl animate-pulse" />
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" className="text-slate-800" strokeWidth="6" stroke="currentColor" fill="transparent" />
            <circle
              cx="50" cy="50" r="42"
              className={isComplete ? 'text-emerald-400' : 'text-cyan-400'}
              strokeWidth="6"
              strokeDasharray={`${progress * 2.64}, 264`}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              style={{ transition: 'stroke-dasharray 0.05s linear' }}
            />
          </svg>
          <div className="absolute inset-8 rounded-full border border-slate-700/60 flex flex-col items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <div className="absolute inset-x-4 top-1/2 h-px bg-slate-700/50" />
            <div className="absolute inset-y-4 left-1/2 w-px bg-slate-700/50" />
            {isComplete ? (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center gap-2 z-10">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]" />
                <span className="font-arcade text-base text-emerald-300 tracking-wider">COMPLETE!</span>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center gap-2 z-10">
                <Smartphone className="w-8 h-8 text-cyan-400 animate-bounce" />
                <span className="font-mono text-2xl font-black text-cyan-300">{progress}%</span>
                <span className="text-xs text-slate-400 font-medium">Calibrating...</span>
              </div>
            )}
          </div>
        </div>

        {isComplete ? (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-8 flex flex-col items-center gap-4 w-full">
            <div className="font-arcade text-2xl sm:text-3xl text-emerald-400 arcade-text-shadow">CALIBRATION COMPLETE</div>
            <button
              id="calibration-start-btn"
              onClick={handleStartGame}
              className="w-full sm:w-auto px-12 py-5 rounded-3xl bg-gradient-to-b from-amber-400 via-orange-500 to-red-600 hover:from-amber-300 hover:to-orange-500 text-white font-arcade text-2xl tracking-widest border-4 border-amber-200 shadow-[0_8px_0_#9a3412,0_16px_35px_rgba(234,88,12,0.6)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-3"
            >
              <Play className="w-6 h-6 fill-white text-white" />
              <span>START GAME</span>
            </button>
          </motion.div>
        ) : (
          <div className="mt-8 text-sm text-slate-400">Zeroing accelerometer & gyroscope sensors on your device...</div>
        )}
      </div>

      <div className="flex items-center gap-4 z-10">
        <button
          onClick={handleRecalibrate}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>RE-CALIBRATE</span>
        </button>
      </div>
    </div>
  );
};
