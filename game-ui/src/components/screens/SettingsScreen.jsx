import React from 'react';
import { ArrowLeft, Volume2, Music, Sliders, Activity, Vibrate, Sword } from 'lucide-react';
import { sound } from '../../utils/sound.js';

export const SettingsScreen = ({ settings, onUpdateSettings, onNavigate }) => {
  const toggleSoundEffects = () => {
    const nextVal = !settings.soundEffects;
    sound.sfxEnabled = nextVal;
    onUpdateSettings({ soundEffects: nextVal });
    if (nextVal) sound.playButton();
  };

  const toggleMusic = () => {
    const nextVal = !settings.music;
    sound.toggleMusic(nextVal);
    onUpdateSettings({ music: nextVal });
    sound.playButton();
  };

  const toggleVibration = () => {
    sound.playButton();
    onUpdateSettings({ vibration: !settings.vibration });
  };

  return (
    <div id="settings-screen" className="relative w-full h-full flex flex-col items-center justify-between p-6 sm:p-10 z-30 select-none overflow-y-auto">
      <div className="w-full max-w-2xl flex items-center justify-between">
        <button
          onClick={() => { sound.playButton(); onNavigate('MAIN_MENU'); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-arcade text-sm">MENU</span>
        </button>
        <h1 className="font-arcade text-3xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-fuchsia-300 to-amber-300 arcade-text-shadow">SETTINGS</h1>
        <div className="w-16" />
      </div>

      <div className="w-full max-w-2xl my-auto bg-slate-900/90 border-2 border-purple-500/40 rounded-3xl p-6 sm:p-8 backdrop-blur-md shadow-2xl flex flex-col gap-6">
        {/* AUDIO SECTION */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-purple-400/80 uppercase tracking-widest block">Audio & Feedback</span>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400"><Volume2 className="w-5 h-5" /></div>
              <div>
                <span className="font-arcade text-base text-white tracking-wider block">SOUND EFFECTS</span>
                <span className="text-xs text-slate-400">Blade slashes, juicy splats & bombs</span>
              </div>
            </div>
            <button onClick={toggleSoundEffects} className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer ${settings.soundEffects ? 'bg-purple-600' : 'bg-slate-700'}`}>
              <div className={`w-6 h-6 rounded-full bg-white transition-transform ${settings.soundEffects ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400"><Music className="w-5 h-5" /></div>
              <div>
                <span className="font-arcade text-base text-white tracking-wider block">ARCADE MUSIC</span>
                <span className="text-xs text-slate-400">Synthwave arcade background groove</span>
              </div>
            </div>
            <button onClick={toggleMusic} className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer ${settings.music ? 'bg-purple-600' : 'bg-slate-700'}`}>
              <div className={`w-6 h-6 rounded-full bg-white transition-transform ${settings.music ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400"><Vibrate className="w-5 h-5" /></div>
              <div>
                <span className="font-arcade text-base text-white tracking-wider block">PHONE VIBRATION</span>
                <span className="text-xs text-slate-400">Haptic feedback on fruit cuts</span>
              </div>
            </div>
            <button onClick={toggleVibration} className={`w-14 h-8 rounded-full p-1 transition-colors cursor-pointer ${settings.vibration ? 'bg-purple-600' : 'bg-slate-700'}`}>
              <div className={`w-6 h-6 rounded-full bg-white transition-transform ${settings.vibration ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>

        {/* MOTION CONTROLLER SECTION */}
        <div className="space-y-4">
          <span className="text-xs font-bold text-cyan-400/80 uppercase tracking-widest block">Motion Sensors (WebSocket)</span>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                <span className="font-arcade text-sm sm:text-base text-white tracking-wider">CONTROLLER SENSITIVITY</span>
              </div>
              <span className="font-mono text-sm font-bold text-cyan-300">{settings.controllerSensitivity} / 10</span>
            </div>
            <input type="range" min={1} max={10} value={settings.controllerSensitivity} onChange={(e) => onUpdateSettings({ controllerSensitivity: Number(e.target.value) })} className="w-full accent-cyan-400 cursor-pointer" />
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="font-arcade text-sm sm:text-base text-white tracking-wider">MOTION SMOOTHING</span>
              </div>
              <span className="font-mono text-sm font-bold text-cyan-300">{settings.motionSmoothing} / 10</span>
            </div>
            <input type="range" min={1} max={10} value={settings.motionSmoothing} onChange={(e) => onUpdateSettings({ motionSmoothing: Number(e.target.value) })} className="w-full accent-cyan-400 cursor-pointer" />
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="font-arcade text-sm sm:text-base text-white tracking-wider">MOTION THRESHOLD</span>
              </div>
              <span className="font-mono text-sm font-bold text-cyan-300">{settings.motionThreshold.toFixed(1)}</span>
            </div>
            <input type="range" min={0.5} max={10} step={0.1} value={settings.motionThreshold} onChange={(e) => onUpdateSettings({ motionThreshold: Number(e.target.value) })} className="w-full accent-cyan-400 cursor-pointer" />
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="font-arcade text-sm sm:text-base text-white tracking-wider">SLASH THRESHOLD</span>
              </div>
              <span className="font-mono text-sm font-bold text-cyan-300">{settings.slashThreshold.toFixed(1)}</span>
            </div>
            <input type="range" min={1} max={10} step={0.1} value={settings.slashThreshold} onChange={(e) => onUpdateSettings({ slashThreshold: Number(e.target.value) })} className="w-full accent-cyan-400 cursor-pointer" />
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="font-arcade text-sm sm:text-base text-white tracking-wider">SWORD SPEED</span>
              </div>
              <span className="font-mono text-sm font-bold text-cyan-300">{settings.swordSpeed.toFixed(1)}</span>
            </div>
            <input type="range" min={5} max={30} step={1} value={settings.swordSpeed} onChange={(e) => onUpdateSettings({ swordSpeed: Number(e.target.value) })} className="w-full accent-cyan-400 cursor-pointer" />
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="font-arcade text-sm sm:text-base text-white tracking-wider">ROTATION SENSITIVITY</span>
              </div>
              <span className="font-mono text-sm font-bold text-cyan-300">{settings.rotationSensitivity.toFixed(0)}°</span>
            </div>
            <input type="range" min={10} max={90} step={5} value={settings.rotationSensitivity} onChange={(e) => onUpdateSettings({ rotationSensitivity: Number(e.target.value) })} className="w-full accent-cyan-400 cursor-pointer" />
          </div>
        </div>

        {/* BLADE SKINS */}
        <div className="space-y-3">
          <span className="text-xs font-bold text-amber-400/80 uppercase tracking-widest block">Blade Trail Style & Quality</span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {['CRIMSON', 'CYBER_AZURE', 'EMERALD', 'GOLDEN'].map((style) => {
              const names = { CRIMSON: 'Crimson', CYBER_AZURE: 'Azure', EMERALD: 'Jade', GOLDEN: 'Golden' };
              const colors = {
                CRIMSON: 'border-red-500 text-red-300 bg-red-950/40',
                CYBER_AZURE: 'border-cyan-500 text-cyan-300 bg-cyan-950/40',
                EMERALD: 'border-emerald-500 text-emerald-300 bg-emerald-950/40',
                GOLDEN: 'border-amber-500 text-amber-300 bg-amber-950/40',
              };
              const isSelected = settings.bladeStyle === style;
              return (
                <button
                  key={style}
                  onClick={() => { sound.playButton(); onUpdateSettings({ bladeStyle: style }); }}
                  className={`py-2 px-3 rounded-xl border text-xs font-arcade tracking-wider transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    isSelected ? `${colors[style]} ring-2 ring-white/50 scale-105 shadow-md` : 'border-slate-700 text-slate-400 bg-slate-800/40 hover:bg-slate-800'
                  }`}
                >
                  <Sword className="w-3.5 h-3.5" />
                  <span>{names[style]}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
            <span className="font-arcade text-sm text-white tracking-wider">GRAPHICS QUALITY</span>
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
              {['LOW', 'MEDIUM', 'ULTRA'].map((q) => (
                <button
                  key={q}
                  onClick={() => { sound.playButton(); onUpdateSettings({ graphicsQuality: q }); }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${settings.graphicsQuality === q ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => { sound.playButton(); onNavigate('MAIN_MENU'); }}
        className="mt-4 px-10 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-arcade text-lg tracking-wider border border-slate-600 shadow-md cursor-pointer active:scale-95 transition-all"
      >
        DONE
      </button>
    </div>
  );
};
