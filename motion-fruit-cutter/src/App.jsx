import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { sound } from './utils/sound.js';
import { useWebSocket } from './hooks/useWebSocket.js';

import { ArcadeGameCanvas } from './components/ArcadeGameCanvas.jsx';
import { HUD } from './components/HUD.jsx';
import { MainMenu } from './components/screens/MainMenu.jsx';
import { ConnectScreen } from './components/screens/ConnectScreen.jsx';
import { CalibrationScreen } from './components/screens/CalibrationScreen.jsx';
import { HowToPlayScreen } from './components/screens/HowToPlayScreen.jsx';
import { PauseOverlay } from './components/screens/PauseOverlay.jsx';
import { GameOverScreen } from './components/screens/GameOverScreen.jsx';
import { SettingsScreen } from './components/screens/SettingsScreen.jsx';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('MAIN_MENU');
  // Game Stats
  const [stats, setStats] = useState({
    score: 0,
    bestScore: 1870,
    fruitsCut: 0,
    maxCombo: 1,
    currentCombo: 1,
    bombsHit: 0,
    timeRemaining: 60,
    initialTime: 60,
    difficulty: 'NORMAL',
    isPaused: false,
  });

  // Settings
  const [settings, setSettings] = useState({
    soundEffects: true,
    music: false,
    controllerSensitivity: 7,
    motionSmoothing: 5,
    vibration: true,
    graphicsQuality: 'ULTRA',
    bladeStyle: 'CRIMSON',
    motionThreshold: 2.5,
    slashThreshold: 1.5,
    swordSpeed: 15.0,
    rotationSensitivity: 45.0,
  });

  // Smartphone Motion Controller Config
  const [controller, setController] = useState({
    ipAddress: '',
    port: '8765',
    status: 'DISCONNECTED',
    gyro: { pitch: 0, roll: 0, yaw: 0 },
    lastMotionTime: 0,
    swordPosition: { x: 0, y: 0 },
    swordRotation: { z: 0 },
    isSlashing: false,
    slashDirection: 'NONE',
    motionMagnitude: 0,
    calibrated: false,
  });

  const [bombAlert, setBombAlert] = useState(false);
  const timerRef = useRef(null);

  const wsUrl = `ws://${controller.ipAddress}:${controller.port}`;

  const handleMotion = useCallback((data) => {
    const { accelerometer, gyroscope, sword_position, sword_rotation, motion_magnitude, is_slashing, slash_direction, calibrated } = data;
    const pitch = accelerometer ? accelerometer.x * 90 : 0;
    const roll = accelerometer ? accelerometer.y * 90 : 0;
    const yaw = gyroscope ? gyroscope.z * 90 : 0;

    setController((prev) => ({
      ...prev,
      gyro: { pitch, roll, yaw },
      lastMotionTime: Date.now(),
      swordPosition: sword_position || { x: 0, y: 0 },
      swordRotation: sword_rotation || { z: 0 },
      isSlashing: is_slashing || false,
      slashDirection: slash_direction || 'NONE',
      motionMagnitude: motion_magnitude || 0,
      calibrated: calibrated || false,
    }));
  }, []);

  const handleConnectionChange = useCallback((newStatus) => {
    const statusMap = {
      disconnected: 'DISCONNECTED',
      connecting: 'CONNECTING',
      connected: 'CONNECTED',
      error: 'ERROR',
    };
    setController((prev) => ({ ...prev, status: statusMap[newStatus] || 'DISCONNECTED' }));
  }, []);

  const {
    status: wsStatus,
    sendGameState,
    sendCalibrate,
    sendTuning,
    disconnect,
    reconnect,
  } = useWebSocket({
    url: wsUrl,
    role: 'browser',
    onMotion: handleMotion,
    onConnectionChange: handleConnectionChange,
    onError: (err) => console.error('[WebSocket] Error:', err),
    reconnectInterval: 3000,
    maxReconnectAttempts: 10,
    autoConnect: false,
  });

  useEffect(() => {
    const statusMap = {
      disconnected: 'DISCONNECTED',
      connecting: 'CONNECTING',
      connected: 'CONNECTED',
      error: 'ERROR',
    };
    setController((prev) => ({ ...prev, status: statusMap[wsStatus] || 'DISCONNECTED' }));
  }, [wsStatus]);

  useEffect(() => {
    if (wsStatus !== 'connected') return;
    sendTuning({
      sensitivity: settings.controllerSensitivity,
      smoothing: settings.motionSmoothing,
      motion_threshold: settings.motionThreshold,
      slash_threshold: settings.slashThreshold,
      sword_speed: settings.swordSpeed,
      rotation_sensitivity: settings.rotationSensitivity,
    });
  }, [settings, wsStatus, sendTuning]);

  // Start / Reset Game
  const resetGame = useCallback(() => {
    setStats((prev) => ({
      ...prev,
      score: 0,
      fruitsCut: 0,
      maxCombo: 1,
      currentCombo: 1,
      bombsHit: 0,
      timeRemaining: 60,
      isPaused: false,
    }));
    setBombAlert(false);
  }, []);

  const handleStartGame = () => {
    resetGame();
    setCurrentScreen('GAMEPLAY');
  };

  // Fruit Sliced Handler
  const handleFruitSliced = useCallback((points, _type, comboCount) => {
    setStats((prev) => {
      const newScore = prev.score + points;
      const newMaxCombo = Math.max(prev.maxCombo, comboCount);
      const newBest = Math.max(prev.bestScore, newScore);
      return {
        ...prev,
        score: newScore,
        bestScore: newBest,
        fruitsCut: prev.fruitsCut + 1,
        maxCombo: newMaxCombo,
        currentCombo: comboCount,
      };
    });
  }, []);

  // Bomb Hit Handler
  const handleBombHit = useCallback(() => {
    setBombAlert(true);
    setStats((prev) => ({
      ...prev,
      bombsHit: prev.bombsHit + 1,
      currentCombo: 1,
      score: Math.max(0, prev.score - 50),
    }));

    setTimeout(() => {
      setBombAlert(false);
    }, 1500);
  }, []);

  // Combo Increment Handler
  const handleComboIncrement = useCallback((combo) => {
    setStats((prev) => ({
      ...prev,
      currentCombo: combo,
      maxCombo: Math.max(prev.maxCombo, combo),
    }));
  }, []);

  // Countdown Timer when in GAMEPLAY
  useEffect(() => {
    if (currentScreen === 'GAMEPLAY' && !stats.isPaused) {
      timerRef.current = window.setInterval(() => {
        setStats((prev) => {
          if (prev.timeRemaining <= 1) {
            clearInterval(timerRef.current);
            setCurrentScreen('GAME_OVER');
            return { ...prev, timeRemaining: 0 };
          }
          if (prev.timeRemaining <= 6) {
            sound.playCountdownTick(prev.timeRemaining === 1);
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentScreen, stats.isPaused]);

  // Simulation test helpers
  const simulateSlice = () => {
    handleFruitSliced(10, 'APPLE', 1);
    sound.playSlice(1);
  };

  const simulateCombo = () => {
    handleComboIncrement(5);
    handleFruitSliced(50, 'WATERMELON', 5);
    sound.playCombo(5);
  };

  const simulateBomb = () => {
    handleBombHit();
  };

  const simulateGameOver = (isHighScore) => {
    setStats((prev) => ({
      ...prev,
      score: isHighScore ? 2850 : 1250,
      bestScore: isHighScore ? 2850 : 1870,
      fruitsCut: isHighScore ? 88 : 42,
      maxCombo: isHighScore ? 12 : 8,
      bombsHit: 1,
      timeRemaining: 0,
      isPaused: false,
    }));
    setCurrentScreen('GAME_OVER');
  };

  return (
    <main
      id="motion-fruit-cutter-app"
      className="relative w-screen h-screen overflow-hidden bg-[#0c0d12] text-white vibrant-bg select-none touch-none font-sans"
    >
      {/* Vibrant Palette Top Rainbow Accent Line */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#ff3e3e] via-[#ffcc00] to-[#4ade80] z-50 pointer-events-none" />

      {/* Vibrant Palette Bottom Line */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/5 z-50 pointer-events-none" />

      {/* Vibrant Palette Dot Grid Overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none vibrant-dot-grid z-10" />

      {/* BACKGROUND 3D GAMEPLAY ARENA */}
      <div
        id="arcade-game-arena-layer"
        className={`absolute inset-0 transition-opacity duration-300 ${
          currentScreen === 'GAMEPLAY'
            ? 'opacity-100 pointer-events-auto'
            : currentScreen === 'GAME_OVER'
            ? 'opacity-40 pointer-events-none'
            : 'opacity-25 pointer-events-none'
        }`}
      >
<ArcadeGameCanvas
	          isPaused={stats.isPaused || currentScreen !== 'GAMEPLAY'}
	          settings={settings}
	          onFruitSliced={handleFruitSliced}
	          onBombHit={handleBombHit}
	          onComboIncrement={handleComboIncrement}
	          combo={stats.currentCombo}
	          swordPosition={controller.swordPosition}
	          swordRotation={controller.swordRotation}
	          isSlashing={controller.isSlashing}
	          motionMagnitude={controller.motionMagnitude}
	        />

        {/* In-Game HUD (Only on GAMEPLAY screen) */}
        {currentScreen === 'GAMEPLAY' && (
          <HUD
            stats={stats}
            onPause={() => setStats((prev) => ({ ...prev, isPaused: true }))}
            soundEnabled={settings.soundEffects}
            onToggleSound={() => {
              const next = !settings.soundEffects;
              sound.sfxEnabled = next;
              setSettings((s) => ({ ...s, soundEffects: next }));
              if (next) sound.playButton();
            }}
            bombAlert={bombAlert}
          />
        )}
      </div>

      {/* SCREEN OVERLAYS & VIEWS */}
      <AnimatePresence mode="wait">
        {currentScreen === 'MAIN_MENU' && (
          <motion.div
            key="main-menu"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-30"
          >
            <MainMenu onNavigate={setCurrentScreen} onStartGame={handleStartGame} bestScore={stats.bestScore} />
          </motion.div>
        )}

        {currentScreen === 'CONNECT' && (
          <motion.div
            key="connect-screen"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-30 bg-[#090b10]/90 backdrop-blur-md"
          >
            <ConnectScreen
              controller={controller}
              onUpdateController={(updated) => setController((prev) => ({ ...prev, ...updated }))}
              onNavigate={setCurrentScreen}
              onConnect={reconnect}
              onDisconnect={disconnect}
            />
          </motion.div>
        )}

        {currentScreen === 'CALIBRATE' && (
          <motion.div
            key="calibrate-screen"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-30 bg-[#090b10]/90 backdrop-blur-md"
          >
            <CalibrationScreen onNavigate={setCurrentScreen} />
          </motion.div>
        )}

        {currentScreen === 'HOW_TO_PLAY' && (
          <motion.div
            key="how-to-play-screen"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-30 bg-[#090b10]/90 backdrop-blur-md"
          >
            <HowToPlayScreen onNavigate={setCurrentScreen} onStartGame={handleStartGame} />
          </motion.div>
        )}

        {currentScreen === 'GAME_OVER' && (
          <motion.div
            key="game-over-screen"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 z-30 bg-[#090b10]/85 backdrop-blur-md"
          >
            <GameOverScreen
              stats={stats}
              onPlayAgain={handleStartGame}
              onNavigate={setCurrentScreen}
            />
          </motion.div>
        )}

        {currentScreen === 'SETTINGS' && (
          <motion.div
            key="settings-screen"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-30 bg-[#090b10]/90 backdrop-blur-md"
          >
            <SettingsScreen
              settings={settings}
              onUpdateSettings={(updated) => setSettings((prev) => ({ ...prev, ...updated }))}
              onNavigate={setCurrentScreen}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* PAUSE OVERLAY */}
      <AnimatePresence>
        {currentScreen === 'GAMEPLAY' && stats.isPaused && (
          <PauseOverlay
            onResume={() => setStats((prev) => ({ ...prev, isPaused: false }))}
            onRestart={handleStartGame}
            onSettings={() => setCurrentScreen('SETTINGS')}
            onMainMenu={() => {
              setStats((prev) => ({ ...prev, isPaused: false }));
              setCurrentScreen('MAIN_MENU');
            }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
