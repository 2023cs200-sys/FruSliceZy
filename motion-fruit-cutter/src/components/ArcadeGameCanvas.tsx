import React, { useEffect, useRef, useCallback } from 'react';
import { ActiveFruit, BladeTrailPoint, FloatingText, FruitType, GameSettings, Particle } from '../types';
import { FRUIT_CONFIGS, BLADE_COLORS } from '../data/fruits';
import { sound } from '../utils/sound';

interface ArcadeGameCanvasProps {
  isPaused: boolean;
  settings: GameSettings;
  onFruitSliced: (points: number, type: FruitType, comboCount: number) => void;
  onBombHit: () => void;
  onComboIncrement: (combo: number) => void;
  combo: number;
}

export const ArcadeGameCanvas: React.FC<ArcadeGameCanvasProps> = ({
  isPaused,
  settings,
  onFruitSliced,
  onBombHit,
  onComboIncrement,
  combo,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fruitsRef = useRef<ActiveFruit[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const bladeTrailRef = useRef<BladeTrailPoint[]>([]);
  const isMouseDownRef = useRef<boolean>(false);
  const lastMousePosRef = useRef<{ x: number; y: number } | null>(null);
  const nextFruitIdRef = useRef<number>(1);
  const nextTextIdRef = useRef<number>(1);
  const lastSpawnTimeRef = useRef<number>(0);
  const lastSliceTimeRef = useRef<number>(0);
  const currentComboSliceCountRef = useRef<number>(0);
  const screenShakeRef = useRef<number>(0);
  const screenFlashAlphaRef = useRef<number>(0);

  // Responsive canvas resizing
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Spawn random fruit or bomb
  const spawnFruit = useCallback((width: number, height: number) => {
    const types: FruitType[] = ['APPLE', 'WATERMELON', 'ORANGE', 'BANANA', 'PINEAPPLE', 'BOMB'];
    // 20% chance of bomb, 80% fruit
    const isBomb = Math.random() < 0.18;
    const fruitType = isBomb ? 'BOMB' : types[Math.floor(Math.random() * (types.length - 1))];
    const cfg = FRUIT_CONFIGS[fruitType];

    // Spawn along bottom 70% width
    const minX = width * 0.15;
    const maxX = width * 0.85;
    const startX = minX + Math.random() * (maxX - minX);
    const startY = height + 40;

    // Velocity towards center arc
    const targetX = width * 0.5 + (Math.random() - 0.5) * (width * 0.4);
    const timeToApex = 0.9 + Math.random() * 0.4;
    const vx = (targetX - startX) / (timeToApex * 60);
    // Apex height between 15% and 35% of screen height
    const targetApexY = height * (0.15 + Math.random() * 0.25);
    const gravity = 0.38;
    const vy = -Math.sqrt(2 * gravity * (startY - targetApexY));

    fruitsRef.current.push({
      id: nextFruitIdRef.current++,
      type: fruitType,
      x: startX,
      y: startY,
      vx,
      vy,
      radius: cfg.radius,
      rotation: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.08,
      isSliced: false,
      sliceAngle: 0,
      splitDistance: 0,
      isBomb,
      color: cfg.color,
      juiceColor: cfg.juiceColor,
    });
  }, []);

  // Trigger juice and fruit slice effects
  const sliceFruit = useCallback(
    (fruit: ActiveFruit, sliceAngle: number) => {
      fruit.isSliced = true;
      fruit.sliceAngle = sliceAngle;
      fruit.splitDistance = 0;

      // Velocities for the two halves pushed apart along the normal of the slice
      const normalAngle = sliceAngle + Math.PI / 2;
      const pushSpeed = 3.5 + Math.random() * 2.5;
      fruit.half1Vx = fruit.vx + Math.cos(normalAngle) * pushSpeed;
      fruit.half1Vy = fruit.vy + Math.sin(normalAngle) * pushSpeed - 1.5;
      fruit.half2Vx = fruit.vx - Math.cos(normalAngle) * pushSpeed;
      fruit.half2Vy = fruit.vy - Math.sin(normalAngle) * pushSpeed - 1.5;

      const now = performance.now();
      if (now - lastSliceTimeRef.current < 400) {
        currentComboSliceCountRef.current += 1;
      } else {
        currentComboSliceCountRef.current = 1;
      }
      lastSliceTimeRef.current = now;

      const currentCombo = currentComboSliceCountRef.current;
      if (currentCombo > 1) {
        onComboIncrement(currentCombo);
        sound.playCombo(currentCombo);
      }

      if (fruit.isBomb) {
        // Bomb Hit!
        screenShakeRef.current = 24;
        screenFlashAlphaRef.current = 0.75;
        sound.playBomb();
        onBombHit();

        // Bomb smoke & sparks explosion
        for (let i = 0; i < 45; i++) {
          const angle = Math.random() * Math.PI * 2;
          const spd = 2 + Math.random() * 9;
          particlesRef.current.push({
            x: fruit.x,
            y: fruit.y,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd,
            radius: 3 + Math.random() * 7,
            color: Math.random() < 0.4 ? '#ef4444' : Math.random() < 0.7 ? '#f97316' : '#64748b',
            alpha: 1,
            life: 0,
            maxLife: 30 + Math.random() * 25,
            isJuiceSplash: false,
          });
        }

        floatingTextsRef.current.push({
          id: nextTextIdRef.current++,
          text: 'BOMB!',
          x: fruit.x,
          y: fruit.y - 20,
          color: '#ef4444',
          alpha: 1,
          scale: 1.5,
          life: 0,
          maxLife: 45,
        });
      } else {
        // Fruit cut!
        const cfg = FRUIT_CONFIGS[fruit.type];
        const points = cfg.points * (currentCombo > 1 ? currentCombo : 1);
        sound.playSlice(currentCombo);
        onFruitSliced(points, fruit.type, currentCombo);

        // Splatter juice particles
        const particleCount = settings.graphicsQuality === 'ULTRA' ? 35 : settings.graphicsQuality === 'MEDIUM' ? 22 : 12;
        for (let i = 0; i < particleCount; i++) {
          const sprayAngle = normalAngle + (Math.random() - 0.5) * 1.5;
          const side = Math.random() > 0.5 ? 1 : -1;
          const spd = 3 + Math.random() * 7;
          particlesRef.current.push({
            x: fruit.x,
            y: fruit.y,
            vx: Math.cos(sprayAngle) * spd * side + (Math.random() - 0.5) * 2,
            vy: Math.sin(sprayAngle) * spd * side - 1.5 + (Math.random() - 0.5) * 3,
            radius: 3 + Math.random() * 5,
            color: fruit.juiceColor,
            alpha: 0.95,
            life: 0,
            maxLife: 25 + Math.random() * 25,
            isJuiceSplash: true,
          });
        }

        // Floating score indicator
        const textStr = currentCombo > 1 ? `+${points} x${currentCombo}` : `+${points}`;
        floatingTextsRef.current.push({
          id: nextTextIdRef.current++,
          text: textStr,
          x: fruit.x,
          y: fruit.y - 15,
          color: currentCombo > 1 ? '#ffcc00' : '#ffffff',
          alpha: 1,
          scale: currentCombo > 1 ? 1.4 : 1.1,
          life: 0,
          maxLife: 35,
        });

        // Vibrant "Critical!" splash for high-point slices or combos
        if (points >= 15 || currentCombo >= 3) {
          floatingTextsRef.current.push({
            id: nextTextIdRef.current++,
            text: 'Critical!',
            x: fruit.x + 18,
            y: fruit.y - 36,
            color: '#ffcc00',
            alpha: 1,
            scale: 1.15,
            life: 0,
            maxLife: 32,
          });
        }
      }
    },
    [onFruitSliced, onBombHit, onComboIncrement, settings.graphicsQuality]
  );

  // Line segment intersection with circle (fruit hit detection)
  const checkSliceCollision = useCallback(
    (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.hypot(dx, dy);
      if (len < 5) return;

      const sliceAngle = Math.atan2(dy, dx);

      fruitsRef.current.forEach((fruit) => {
        if (fruit.isSliced) return;

        // Distance from point to line segment
        const u = ((fruit.x - p1.x) * dx + (fruit.y - p1.y) * dy) / (len * len);
        const clampedU = Math.max(0, Math.min(1, u));
        const nearestX = p1.x + clampedU * dx;
        const nearestY = p1.y + clampedU * dy;
        const dist = Math.hypot(fruit.x - nearestX, fruit.y - nearestY);

        if (dist < fruit.radius + 8) {
          sliceFruit(fruit, sliceAngle);
        }
      });
    },
    [sliceFruit]
  );

  // Mouse & Touch event handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    isMouseDownRef.current = true;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    lastMousePosRef.current = pos;
    bladeTrailRef.current.push({
      x: pos.x,
      y: pos.y,
      time: performance.now(),
      width: 14,
    });
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isMouseDownRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    bladeTrailRef.current.push({
      x: pos.x,
      y: pos.y,
      time: performance.now(),
      width: 16,
    });

    if (lastMousePosRef.current) {
      checkSliceCollision(lastMousePosRef.current, pos);
    }
    lastMousePosRef.current = pos;
  };

  const handlePointerUp = () => {
    isMouseDownRef.current = false;
    lastMousePosRef.current = null;
  };

  // Main Render Loop
  useEffect(() => {
    let animId: number;

    const render = (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { width, height } = canvas;

      // Handle screen shake
      let shakeX = 0;
      let shakeY = 0;
      if (screenShakeRef.current > 0) {
        shakeX = (Math.random() - 0.5) * screenShakeRef.current;
        shakeY = (Math.random() - 0.5) * screenShakeRef.current;
        screenShakeRef.current *= 0.88;
        if (screenShakeRef.current < 0.5) screenShakeRef.current = 0;
      }

      ctx.save();
      ctx.translate(shakeX, shakeY);

      // Clear with dark atmospheric gradient
      ctx.clearRect(0, 0, width, height);

      // Dynamic ambient lighting behind arena (Vibrant Palette radial gradient)
      const centerGrad = ctx.createRadialGradient(
        width / 2,
        height * 0.45,
        10,
        width / 2,
        height * 0.45,
        width * 0.7
      );
      centerGrad.addColorStop(0, 'rgba(26, 28, 38, 0.65)');
      centerGrad.addColorStop(0.5, 'rgba(12, 13, 18, 0.3)');
      centerGrad.addColorStop(1, 'rgba(12, 13, 18, 0)');
      ctx.fillStyle = centerGrad;
      ctx.fillRect(0, 0, width, height);

      if (!isPaused) {
        // Spawn fruits periodically (2 to 4 waves)
        const spawnInterval = 1100;
        if (time - lastSpawnTimeRef.current > spawnInterval) {
          lastSpawnTimeRef.current = time;
          const count = 1 + Math.floor(Math.random() * 2.2);
          for (let i = 0; i < count; i++) {
            setTimeout(() => {
              if (canvasRef.current) {
                spawnFruit(width, height);
              }
            }, i * 160);
          }
        }

        // Update active fruits
        const gravity = 0.38;
        fruitsRef.current.forEach((fruit) => {
          if (!fruit.isSliced) {
            fruit.x += fruit.vx;
            fruit.y += fruit.vy;
            fruit.vy += gravity;
            fruit.rotation += fruit.vRot;
          } else {
            // Split halves fly outward
            if (fruit.half1Vx !== undefined && fruit.half1Vy !== undefined) {
              fruit.half1Vy += gravity * 1.1;
            }
            if (fruit.half2Vx !== undefined && fruit.half2Vy !== undefined) {
              fruit.half2Vy += gravity * 1.1;
            }
            fruit.splitDistance += 3.8;
            fruit.rotation += fruit.vRot * 1.5;
          }
        });

        // Filter out fruits that fell below screen
        fruitsRef.current = fruitsRef.current.filter((f) => f.y < height + 150);

        // Update juice & explosion particles
        particlesRef.current.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += p.isJuiceSplash ? 0.25 : 0.1;
          p.life++;
          p.alpha = Math.max(0, 1 - p.life / p.maxLife);
        });
        particlesRef.current = particlesRef.current.filter((p) => p.life < p.maxLife);

        // Update floating score texts
        floatingTextsRef.current.forEach((ft) => {
          ft.y -= 1.8;
          ft.life++;
          ft.alpha = Math.max(0, 1 - ft.life / ft.maxLife);
        });
        floatingTextsRef.current = floatingTextsRef.current.filter((ft) => ft.life < ft.maxLife);
      }

      // Draw background juice splatters/droplets
      particlesRef.current.forEach((p) => {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, p.radius * (1 - p.life / p.maxLife * 0.4)), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // Render 3D shaded fruits
      fruitsRef.current.forEach((fruit) => {
        ctx.save();
        if (!fruit.isSliced) {
          ctx.translate(fruit.x, fruit.y);
          ctx.rotate(fruit.rotation);
          drawFruit(ctx, fruit.type, fruit.radius, false);
        } else {
          // Render two split halves
          const normalAngle = fruit.sliceAngle + Math.PI / 2;
          const dist = fruit.splitDistance;

          // Half 1
          ctx.save();
          const h1x = fruit.x + Math.cos(normalAngle) * dist;
          const h1y = fruit.y + Math.sin(normalAngle) * dist;
          ctx.translate(h1x, h1y);
          ctx.rotate(fruit.rotation - dist * 0.02);
          drawFruitHalf(ctx, fruit.type, fruit.radius, 1);
          ctx.restore();

          // Half 2
          ctx.save();
          const h2x = fruit.x - Math.cos(normalAngle) * dist;
          const h2y = fruit.y - Math.sin(normalAngle) * dist;
          ctx.translate(h2x, h2y);
          ctx.rotate(fruit.rotation + dist * 0.02);
          drawFruitHalf(ctx, fruit.type, fruit.radius, -1);
          ctx.restore();
        }
        ctx.restore();
      });

      // Render Blade Slash Ribbon Trail
      const bladeColor = BLADE_COLORS[settings.bladeStyle];
      const trail = bladeTrailRef.current;
      const now = performance.now();
      const trailLifespan = 180; // ms

      // Filter old trail points
      bladeTrailRef.current = trail.filter((pt) => now - pt.time < trailLifespan);

      if (bladeTrailRef.current.length > 1) {
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Outer glow pass
        ctx.shadowBlur = 18;
        ctx.shadowColor = bladeColor.glow;
        ctx.strokeStyle = bladeColor.outer;
        ctx.lineWidth = 14;

        ctx.beginPath();
        ctx.moveTo(bladeTrailRef.current[0].x, bladeTrailRef.current[0].y);
        for (let i = 1; i < bladeTrailRef.current.length; i++) {
          const p0 = bladeTrailRef.current[i - 1];
          const p1 = bladeTrailRef.current[i];
          const midX = (p0.x + p1.x) / 2;
          const midY = (p0.y + p1.y) / 2;
          ctx.quadraticCurveTo(p0.x, p0.y, midX, midY);
        }
        ctx.stroke();

        // Inner bright laser core
        ctx.shadowBlur = 6;
        ctx.shadowColor = bladeColor.spark;
        ctx.strokeStyle = bladeColor.inner;
        ctx.lineWidth = 5;
        ctx.stroke();

        ctx.restore();
      }

      // Render floating score indicators (+10, COMBO x3)
      floatingTextsRef.current.forEach((ft) => {
        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.font = `900 ${Math.floor(22 * ft.scale)}px 'Luckiest Guy', cursive, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#000000';
        ctx.fillText(ft.text, ft.x + 2, ft.y + 2);
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      });

      // Screen Flash overlay (for Bomb hits)
      if (screenFlashAlphaRef.current > 0.01) {
        ctx.fillStyle = `rgba(239, 68, 68, ${screenFlashAlphaRef.current})`;
        ctx.fillRect(0, 0, width, height);
        screenFlashAlphaRef.current *= 0.85;
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, spawnFruit, settings.bladeStyle, settings.graphicsQuality]);

  // Helper: Draw intact 3D Fruit
  const drawFruit = (ctx: CanvasRenderingContext2D, type: FruitType, r: number, isHalf: boolean) => {
    switch (type) {
      case 'APPLE': {
        // Red 3D Apple with highlight and stem
        const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
        grad.addColorStop(0, '#f87171');
        grad.addColorStop(0.4, '#ef4444');
        grad.addColorStop(1, '#991b1b');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        // Gloss highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath();
        ctx.ellipse(-r * 0.35, -r * 0.35, r * 0.3, r * 0.16, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // Stem & green leaf
        ctx.strokeStyle = '#5c2b0e';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, -r * 0.85);
        ctx.quadraticCurveTo(4, -r * 1.25, 8, -r * 1.3);
        ctx.stroke();

        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.ellipse(8, -r * 1.1, 7, 3, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'WATERMELON': {
        // Dark green striped watermelon
        const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
        grad.addColorStop(0, '#4ade80');
        grad.addColorStop(0.6, '#16a34a');
        grad.addColorStop(1, '#14532d');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 1.15, r * 0.95, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dark green stripes
        ctx.strokeStyle = '#052e16';
        ctx.lineWidth = 5;
        for (let i = -2; i <= 2; i++) {
          ctx.beginPath();
          ctx.ellipse(i * (r * 0.35), 0, r * 0.18, r * 0.9, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
      }

      case 'ORANGE': {
        // 3D Citrus Orange
        const grad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
        grad.addColorStop(0, '#fed7aa');
        grad.addColorStop(0.3, '#f97316');
        grad.addColorStop(1, '#c2410c');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        // Navel stem point
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(0, -r * 0.9, 3, 0, Math.PI * 2);
        ctx.fill();

        // Sheen
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.beginPath();
        ctx.ellipse(-r * 0.3, -r * 0.3, r * 0.25, r * 0.15, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'BANANA': {
        // Curved Banana
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.ellipse(0, 0, r * 1.3, r * 0.45, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();

        // Dark tips & seam line
        ctx.strokeStyle = '#854d0e';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 5, r * 0.9, 0.2, Math.PI - 0.2);
        ctx.stroke();

        ctx.fillStyle = '#713f12';
        ctx.beginPath();
        ctx.arc(r * 0.9, r * 0.4, 4, 0, Math.PI * 2);
        ctx.arc(-r * 0.9, -r * 0.4, 4, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'PINEAPPLE': {
        // Golden textured pineapple with spiky green crown
        const grad = ctx.createRadialGradient(-r * 0.25, -r * 0.25, r * 0.1, 0, 0, r);
        grad.addColorStop(0, '#fde047');
        grad.addColorStop(0.5, '#d97706');
        grad.addColorStop(1, '#78350f');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(0, r * 0.1, r * 0.8, r * 0.95, 0, 0, Math.PI * 2);
        ctx.fill();

        // Diamond pattern lines
        ctx.strokeStyle = 'rgba(120, 53, 15, 0.6)';
        ctx.lineWidth = 2.5;
        for (let offset = -r * 0.6; offset <= r * 0.6; offset += 18) {
          ctx.beginPath();
          ctx.moveTo(offset - 15, -r * 0.6);
          ctx.lineTo(offset + 15, r * 0.8);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(offset + 15, -r * 0.6);
          ctx.lineTo(offset - 15, r * 0.8);
          ctx.stroke();
        }

        // Green spiky crown
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.moveTo(-18, -r * 0.7);
        ctx.lineTo(-24, -r * 1.35);
        ctx.lineTo(-8, -r * 0.9);
        ctx.lineTo(0, -r * 1.5);
        ctx.lineTo(8, -r * 0.9);
        ctx.lineTo(24, -r * 1.35);
        ctx.lineTo(18, -r * 0.7);
        ctx.closePath();
        ctx.fill();
        break;
      }

      case 'BOMB': {
        // Metallic cast-iron bomb with gray border, red shadow, and hazard exclamation
        ctx.save();
        ctx.shadowColor = 'rgba(255, 62, 62, 0.45)';
        ctx.shadowBlur = 24;

        const grad = ctx.createRadialGradient(-r * 0.35, -r * 0.35, r * 0.1, 0, 0, r);
        grad.addColorStop(0, '#374151');
        grad.addColorStop(0.5, '#111827');
        grad.addColorStop(1, '#030712');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();

        // Border-4 border-gray-700
        ctx.strokeStyle = '#4b5563';
        ctx.lineWidth = 3.5;
        ctx.stroke();
        ctx.restore();

        // Specular highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.beginPath();
        ctx.ellipse(-r * 0.35, -r * 0.35, r * 0.28, r * 0.14, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // Bomb cap
        ctx.fillStyle = '#64748b';
        ctx.fillRect(-8, -r - 5, 16, 6);

        // Curving fuse rope
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, -r - 5);
        ctx.quadraticCurveTo(10, -r - 18, 16, -r - 20);
        ctx.stroke();

        // Sparkling fuse tip with vibrant colors
        const sparkTime = performance.now() * 0.02;
        const sparkRadius = 7 + Math.sin(sparkTime) * 3;
        const sparkGrad = ctx.createRadialGradient(16, -r - 20, 1, 16, -r - 20, sparkRadius);
        sparkGrad.addColorStop(0, '#ffffff');
        sparkGrad.addColorStop(0.3, '#ffcc00');
        sparkGrad.addColorStop(0.8, '#ff3e3e');
        sparkGrad.addColorStop(1, 'rgba(255, 62, 62, 0)');
        ctx.fillStyle = sparkGrad;
        ctx.beginPath();
        ctx.arc(16, -r - 20, sparkRadius, 0, Math.PI * 2);
        ctx.fill();

        // Hazard Exclamation Mark '!' in vibrant #ff3e3e
        ctx.fillStyle = '#ff3e3e';
        ctx.font = `900 ${Math.floor(r * 0.85)}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', 0, 1);
        break;
      }
    }
  };

  // Helper: Draw sliced half fruit with juicy interior
  const drawFruitHalf = (ctx: CanvasRenderingContext2D, type: FruitType, r: number, side: number) => {
    // Clip half plane
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, r, side > 0 ? 0 : Math.PI, side > 0 ? Math.PI : Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    drawFruit(ctx, type, r, true);
    ctx.restore();

    // Sliced flat face interior
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(-r, 0);
    ctx.lineTo(r, 0);

    switch (type) {
      case 'WATERMELON': {
        // Red juicy flesh and seeds
        ctx.fillStyle = '#ff3e3e';
        ctx.fillRect(-r * 0.9, -4, r * 1.8, 8);
        ctx.fillStyle = '#0f172a';
        // Seeds
        ctx.beginPath();
        ctx.arc(-r * 0.4, 0, 2.5, 0, Math.PI * 2);
        ctx.arc(r * 0.35, 0, 2.5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'ORANGE': {
        ctx.fillStyle = '#fdba74';
        ctx.fillRect(-r * 0.9, -3, r * 1.8, 6);
        break;
      }
      case 'APPLE': {
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(-r * 0.9, -3, r * 1.8, 6);
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.arc(0, 0, 2, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'PINEAPPLE': {
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(-r * 0.9, -3, r * 1.8, 6);
        break;
      }
      default: {
        ctx.fillStyle = '#fde047';
        ctx.fillRect(-r * 0.9, -2, r * 1.8, 4);
      }
    }
    ctx.restore();
  };

  return (
    <div id="gameplay-arena-container" className="relative w-full h-full cursor-crosshair select-none touch-none overflow-hidden">
      <canvas
        id="fruit-slice-canvas"
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="w-full h-full block"
      />
    </div>
  );
};
