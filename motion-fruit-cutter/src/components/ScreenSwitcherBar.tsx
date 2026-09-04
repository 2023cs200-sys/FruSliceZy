import React, { useState } from 'react';
import {
  Layers,
  Play,
  Menu as MenuIcon,
  Wifi,
  Compass,
  HelpCircle,
  Trophy,
  Settings as SettingsIcon,
  Pause,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Flame,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ScreenState } from '../types';
import { sound } from '../utils/sound';

interface ScreenSwitcherBarProps {
  currentScreen: ScreenState;
  isPaused: boolean;
  onNavigate: (screen: ScreenState) => void;
  onTogglePause: () => void;
  onSimulateSlice: () => void;
  onSimulateCombo: () => void;
  onSimulateBomb: () => void;
  onSimulateGameOver: (highScore: boolean) => void;
}

export const ScreenSwitcherBar: React.FC<ScreenSwitcherBarProps> = ({
  currentScreen,
  isPaused,
  onNavigate,
  onTogglePause,
  onSimulateSlice,
  onSimulateCombo,
  onSimulateBomb,
  onSimulateGameOver,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const screens: { id: ScreenState; label: string; icon: React.ElementType }[] = [
    { id: 'GAMEPLAY', label: '1. Arena & HUD', icon: Play },
    { id: 'MAIN_MENU', label: '2. Main Menu', icon: MenuIcon },
    { id: 'CONNECT', label: '3. Connect', icon: Wifi },
    { id: 'CALIBRATE', label: '4. Calibrate', icon: Compass },
    { id: 'HOW_TO_PLAY', label: '5. Tutorial', icon: HelpCircle },
    { id: 'HIGH_SCORES', label: '8. High Scores', icon: Trophy },
    { id: 'SETTINGS', label: '9. Settings', icon: SettingsIcon },
  ];

  return (
    <div
      id="arcade-screen-nav-bar"
      className="absolute top-2 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center select-none"
    >
      {/* Toggle Pill */}
      <button
        onClick={() => {
          sound.playButton();
          setIsExpanded(!isExpanded);
        }}
        className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 shadow-lg text-[11px] font-bold tracking-wider backdrop-blur-md cursor-pointer transition-all active:scale-95"
      >
        <Layers className="w-3.5 h-3.5 text-amber-400" />
        <span>SCREEN REFERENCE / INSPECT</span>
        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {/* Expanded Quick Switch Panel */}
      {isExpanded && (
        <div className="mt-2 p-3 rounded-2xl bg-slate-950/95 border border-amber-500/40 shadow-2xl backdrop-blur-xl flex flex-col gap-3 min-w-[320px] max-w-[95vw]">
          {/* Screens row */}
          <div>
            <span className="text-[10px] font-bold text-amber-400/90 uppercase tracking-widest block mb-1.5 px-1">
              Select Game Screen (Ursina Specs)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {screens.map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      sound.playButton();
                      onNavigate(item.id);
                    }}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md'
                        : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* Pause Overlay switch */}
              {currentScreen === 'GAMEPLAY' && (
                <button
                  onClick={() => {
                    sound.playButton();
                    onTogglePause();
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isPaused
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span>6. Pause Overlay {isPaused ? '(ON)' : '(OFF)'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick UI animation triggers */}
          <div className="border-t border-slate-800/80 pt-2">
            <span className="text-[10px] font-bold text-cyan-400/90 uppercase tracking-widest block mb-1.5 px-1">
              Test Game FX & Animations
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => {
                  onSimulateSlice();
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer border border-slate-800"
              >
                <Sparkles className="w-3 h-3 text-yellow-400" />
                <span>+10 Slice</span>
              </button>

              <button
                onClick={() => {
                  onSimulateCombo();
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer border border-slate-800"
              >
                <Flame className="w-3 h-3 text-orange-400" />
                <span>Combo Burst</span>
              </button>

              <button
                onClick={() => {
                  onSimulateBomb();
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer border border-slate-800"
              >
                <ShieldAlert className="w-3 h-3 text-red-400" />
                <span>Bomb Hit Flash</span>
              </button>

              <button
                onClick={() => {
                  onSimulateGameOver(false);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium cursor-pointer border border-slate-800"
              >
                <RotateCcw className="w-3 h-3 text-purple-400" />
                <span>7. Game Over</span>
              </button>

              <button
                onClick={() => {
                  onSimulateGameOver(true);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 text-xs font-bold cursor-pointer border border-amber-500/40"
              >
                <Trophy className="w-3 h-3 text-amber-400" />
                <span>High Score FX!</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
