/**
 * Motion Fruit Cutter — Fruit Ninja-Inspired Arcade Game UI
 * Visual reference & playable interface for Python + Ursina & React Native controller
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ScreenState,
  GameStats,
  GameSettings,
  ControllerConfig,
  FruitType,
  HighScoreEntry,
} from './types';
import { INITIAL_HIGH_SCORES } from './data/fruits';
import { sound } from './utils/sound';

import { ArcadeGameCanvas } from './components/ArcadeGameCanvas';
import { HUD } from './components/HUD';
import { MainMenu } from './components/screens/MainMenu';
import { ConnectScreen } from './components/screens/ConnectScreen';
import { CalibrationScreen } from './components/screens/CalibrationScreen';
import { HowToPlayScreen } from './components/screens/HowToPlayScreen';
import { PauseOverlay } from './components/screens/PauseOverlay';
import { GameOverScreen } from './components/screens/GameOverScreen';
import { HighScoresScreen } from './components/screens/HighScoresScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { ScreenSwitcherBar } from './components/ScreenSwitcherBar';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('MAIN_MENU');
  const [highScores, setHighScores] = useState<HighScoreEntry[]>(INITIAL_HIGH_SCORES);

  // Game Stats
  const [stats, setStats] = useState<GameStats>({
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
  const [settings, setSettings] = useState<GameSettings>({
    soundEffects: true,
    music: false,
    controllerSensitivity: 7,
    motionSmoothing: 5,
    vibration: true,
    graphicsQuality: 'ULTRA',
    bladeStyle: 'CRIMSON',
  });

  // Smartphone Motion Controller Config
  const [controller, setController] = useState<ControllerConfig>({
    ipAddress: '192.168.1.10',
    port: '8765',
    status: 'DISCONNECTED',
    gyro: { pitch: 0, roll: 0, yaw: 0 },
    lastMotionTime: 0,
  });

  const [bombAlert, setBombAlert] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

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
  const handleFruitSliced = useCallback((points: number, _type: FruitType, comboCount: number) => {
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
  const handleComboIncrement = useCallback((combo: number) => {
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
            clearInterval(timerRef.current!);
            // Trigger game over
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

  // Update high scores on game over
  useEffect(() => {
    if (currentScreen === 'GAME_OVER' && stats.score > 0) {
      setHighScores((prev) => {
        const exists = prev.some((e) => e.score === stats.score && e.playerName === 'YOU');
        if (exists) return prev;
        const newEntry: HighScoreEntry = {
          rank: 0,
          playerName: 'YOU',
          score: stats.score,
          fruitsCut: stats.fruitsCut,
          combo: stats.maxCombo,
          date: 'JUST NOW',
        };
        const updated = [...prev, newEntry]
          .sort((a, b) => b.score - a.score)
          .slice(0, 5)
          .map((item, idx) => ({ ...item, rank: idx + 1 }));
        return updated;
      });
    }
  }, [currentScreen, stats.score, stats.fruitsCut, stats.maxCombo]);

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

  const simulateGameOver = (isHighScore: boolean) => {
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

      {/* Top Arcade Screen Switcher / Inspector Bar */}
      <ScreenSwitcherBar
        currentScreen={currentScreen}
        isPaused={stats.isPaused}
        onNavigate={(screen) => setCurrentScreen(screen)}
        onTogglePause={() => setStats((prev) => ({ ...prev, isPaused: !prev.isPaused }))}
        onSimulateSlice={simulateSlice}
        onSimulateCombo={simulateCombo}
        onSimulateBomb={simulateBomb}
        onSimulateGameOver={simulateGameOver}
      />

      {/* BACKGROUND 3D GAMEPLAY ARENA
          Active during GAMEPLAY and visible behind Pause & Game Over overlays */}
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
        {/* Screen 2: MAIN MENU */}
        {currentScreen === 'MAIN_MENU' && (
          <motion.div
            key="main-menu"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-30"
          >
            <MainMenu onNavigate={setCurrentScreen} bestScore={stats.bestScore} />
          </motion.div>
        )}

        {/* Screen 3: CONNECT CONTROLLER */}
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
            />
          </motion.div>
        )}

        {/* Screen 4: CALIBRATE CONTROLLER */}
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

        {/* Screen 5: HOW TO PLAY */}
        {currentScreen === 'HOW_TO_PLAY' && (
          <motion.div
            key="how-to-play-screen"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-30 bg-[#090b10]/90 backdrop-blur-md"
          >
            <HowToPlayScreen onNavigate={setCurrentScreen} />
          </motion.div>
        )}

        {/* Screen 7: GAME OVER */}
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

        {/* Screen 8: HIGH SCORES */}
        {currentScreen === 'HIGH_SCORES' && (
          <motion.div
            key="high-scores-screen"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 z-30 bg-[#090b10]/90 backdrop-blur-md"
          >
            <HighScoresScreen highScores={highScores} onNavigate={setCurrentScreen} />
          </motion.div>
        )}

        {/* Screen 9: SETTINGS */}
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

      {/* Screen 6: PAUSE OVERLAY (When paused in GAMEPLAY) */}
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
