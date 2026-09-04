import React, { useState } from 'react';
import { Smartphone, Wifi, ArrowLeft, CheckCircle2, AlertCircle, RefreshCw, Compass, Sliders } from 'lucide-react';
import { motion } from 'motion/react';
import { sound } from '../../utils/sound.js';

export const ConnectScreen = ({ controller, onUpdateController, onNavigate }) => {
  const [ip, setIp] = useState(controller.ipAddress || '192.168.1.10');
  const [port, setPort] = useState(controller.port || '8765');
  const [isSimulatingTilt, setIsSimulatingTilt] = useState(false);

  const handleConnectToggle = () => {
    sound.playButton();
    if (controller.status === 'CONNECTED') {
      onUpdateController({ status: 'DISCONNECTED' });
    } else {
      onUpdateController({ status: 'CONNECTING' });
      setTimeout(() => {
        onUpdateController({ status: 'CONNECTED', ipAddress: ip, port: port, gyro: { pitch: 12, roll: -8, yaw: 4 } });
        sound.playCombo(3);
      }, 1200);
    }
  };

  const handleTestSlash = () => {
    sound.playSlice(2);
    setIsSimulatingTilt(true);
    setTimeout(() => setIsSimulatingTilt(false), 300);
  };

  return (
    <div id="connect-controller-screen" className="relative w-full h-full flex flex-col items-center justify-between p-6 sm:p-10 z-30 select-none overflow-y-auto">
      <div className="w-full max-w-4xl flex items-center justify-between">
        <button
          id="connect-back-btn"
          onClick={() => { sound.playButton(); onNavigate('MAIN_MENU'); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-arcade text-sm">MENU</span>
        </button>

        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700">
          <div className={`w-2.5 h-2.5 rounded-full ${
            controller.status === 'CONNECTED' ? 'bg-emerald-400 animate-pulse'
            : controller.status === 'CONNECTING' ? 'bg-amber-400 animate-ping'
            : 'bg-red-400'
          }`} />
          <span className="font-arcade text-xs tracking-wider text-slate-200">
            ● {controller.status === 'CONNECTING' ? 'CONNECTING...' : controller.status}
          </span>
        </div>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 my-auto items-center">
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">
              <Wifi className="w-4 h-4" />
              <span>Wireless WebSocket Sensor Bridge</span>
            </div>
            <h1 className="font-arcade text-3xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-400 arcade-text-shadow leading-tight">
              CONNECT CONTROLLER
            </h1>
            <p className="text-slate-300 text-sm sm:text-base mt-2 font-medium">Connect your phone to control the sword.</p>
          </div>

          <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs sm:text-sm">
            <Wifi className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-emerald-300">Same Wi-Fi Required</span>
              Make sure your phone and laptop are connected to the same Wi-Fi network.
            </div>
          </div>

          <div className="flex flex-col gap-4 bg-slate-900/80 backdrop-blur-md p-5 rounded-3xl border border-slate-700/80 shadow-xl">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Laptop IP Address</label>
              <input
                id="connect-ip-input"
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="192.168.1.10"
                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700 text-emerald-400 font-mono text-base focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Port</label>
              <input
                id="connect-port-input"
                type="text"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                placeholder="8765"
                className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700 text-emerald-400 font-mono text-base focus:outline-none focus:border-emerald-400 transition-colors"
              />
            </div>

            <button
              id="connect-toggle-btn"
              onClick={handleConnectToggle}
              className={`w-full mt-2 py-4 rounded-2xl font-arcade text-xl tracking-wider text-white transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-3 border-2 shadow-lg ${
                controller.status === 'CONNECTED'
                  ? 'bg-gradient-to-b from-red-600 to-rose-700 border-red-400 shadow-[0_6px_0_#991b1b]'
                  : controller.status === 'CONNECTING'
                  ? 'bg-gradient-to-b from-amber-500 to-orange-600 border-amber-300 shadow-[0_6px_0_#9a3412]'
                  : 'bg-gradient-to-b from-emerald-500 to-teal-700 border-emerald-300 shadow-[0_6px_0_#065f46]'
              }`}
            >
              {controller.status === 'CONNECTING' ? (
                <><RefreshCw className="w-5 h-5 animate-spin" /><span>CONNECTING...</span></>
              ) : controller.status === 'CONNECTED' ? (
                <><AlertCircle className="w-5 h-5" /><span>DISCONNECT</span></>
              ) : (
                <><CheckCircle2 className="w-5 h-5" /><span>CONNECT</span></>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center bg-slate-900/70 backdrop-blur-md p-8 rounded-3xl border border-slate-700/80 shadow-2xl relative">
          <div className="text-xs font-bold text-slate-400 tracking-wider uppercase mb-4 flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>Motion Controller Preview</span>
          </div>

          <motion.div
            animate={
              isSimulatingTilt
                ? { rotateZ: [-35, 30, 0], scale: [1, 1.08, 1], y: [-15, 10, 0] }
                : { rotateX: 12, rotateY: -10, rotateZ: controller.status === 'CONNECTED' ? [0, 4, -4, 0] : 0 }
            }
            transition={isSimulatingTilt ? { duration: 0.3 } : { repeat: Infinity, duration: 4, ease: 'easeInOut' }}
            className="w-48 h-80 rounded-[36px] bg-slate-950 border-4 border-slate-700 shadow-[0_20px_40px_rgba(0,0,0,0.8),0_0_30px_rgba(16,185,129,0.2)] p-3 relative flex flex-col justify-between items-center"
          >
            <div className="w-16 h-4 bg-slate-800 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-slate-700" />
            </div>
            <div className="w-full flex-1 my-2 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-3 flex flex-col items-center justify-between text-center overflow-hidden relative">
              <div className="absolute inset-0 bg-emerald-500/5 flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border border-emerald-500/20 animate-ping" />
              </div>
              <div className="z-10 mt-2">
                <span className="text-[10px] font-bold text-emerald-400 tracking-widest uppercase block">KATANA SENSOR</span>
                <span className="font-arcade text-lg text-white">READY</span>
              </div>
              <div className="z-10 w-full bg-slate-950/80 rounded-xl p-2 border border-slate-800 text-[11px] font-mono text-emerald-400 space-y-1">
                <div className="flex justify-between"><span className="text-slate-500">PITCH:</span><span>+12.4°</span></div>
                <div className="flex justify-between"><span className="text-slate-500">ROLL:</span><span>-08.1°</span></div>
                <div className="flex justify-between"><span className="text-slate-500">YAW:</span><span>+04.7°</span></div>
              </div>
              <div className="z-10 mb-1"><span className="text-[9px] text-slate-500">SWIPE PHONE TO SLASH</span></div>
            </div>
            <div className="w-14 h-1 bg-slate-700 rounded-full" />
          </motion.div>

          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full">
            <button
              onClick={handleTestSlash}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-slate-200 hover:text-white transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
            >
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>TEST MOTION SLASH</span>
            </button>

            {controller.status === 'CONNECTED' && (
              <button
                id="connect-proceed-btn"
                onClick={() => { sound.playButton(); onNavigate('CALIBRATE'); }}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 font-arcade text-xs tracking-wider text-white transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md active:scale-95"
              >
                <span>CALIBRATE</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500 z-10">
        React Native Expo app connects via WebSocket to Python game server.
      </div>
    </div>
  );
};
