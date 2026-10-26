'use client';

import React, { useEffect, useRef, useCallback } from 'react';

interface FundItIntroProps {
  onComplete: () => void;
}

// Exact curated palette matching the Fund It platform (Cyan, Electric Indigo, Neon Emerald, Violet, White)
const THEME_RIBBON_PALETTES = [
  { top: 'rgba(6, 182, 212, 0)', mid: '#06b6d4', bot: 'rgba(14, 116, 144, 0)' },     // Vivid Cyan
  { top: 'rgba(129, 140, 248, 0)', mid: '#818cf8', bot: 'rgba(79, 70, 229, 0)' },   // Electric Indigo
  { top: 'rgba(0, 229, 153, 0)', mid: '#00e599', bot: 'rgba(4, 120, 87, 0)' },       // Neon Emerald
  { top: 'rgba(56, 189, 248, 0)', mid: '#38bdf8', bot: 'rgba(2, 132, 199, 0)' },     // Sky Blue
  { top: 'rgba(168, 85, 247, 0)', mid: '#a855f7', bot: 'rgba(124, 58, 237, 0)' },   // Cyber Violet
  { top: 'rgba(99, 102, 241, 0)', mid: '#6366f1', bot: 'rgba(67, 56, 202, 0)' },     // Deep Indigo
  { top: 'rgba(52, 211, 153, 0)', mid: '#34d399', bot: 'rgba(5, 150, 105, 0)' },     // Mint Emerald
  { top: 'rgba(255, 255, 255, 0)', mid: '#ffffff', bot: 'rgba(224, 242, 254, 0)' }   // Specular White Core
];

interface LightBeam {
  normX: number; // Normalized position (-1.0 to +1.0) spanning the entire viewport
  width: number;
  palette: typeof THEME_RIBBON_PALETTES[0];
  speedMult: number;
  alphaMult: number;
  zDepth: number;
}

export const FundItIntro: React.FC<FundItIntroProps> = ({ onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isCompletedRef = useRef(false);
  const fastForwardRef = useRef(false);


  // End animation and open website
  const endAnimation = useCallback(() => {
    if (isCompletedRef.current) return;
    isCompletedRef.current = true;
    onComplete();
  }, [onComplete]);

  // Fast forward zoom through
  const triggerFastForward = useCallback(() => {
    fastForwardRef.current = true;
  }, []);

  // 90/120 FPS High-Performance Canvas Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI setup clamped to 2 for maximum fill-rate performance
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let cssWidth = window.innerWidth;
    let cssHeight = window.innerHeight;

    const setupSize = () => {
      cssWidth = window.innerWidth;
      cssHeight = window.innerHeight;
      canvas.width = Math.floor(cssWidth * dpr);
      canvas.height = Math.floor(cssHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setupSize();
    window.addEventListener('resize', setupSize);

    // High DPI offscreen staging buffers for zero-crease, monolithic vector rendering
    const offW = Math.ceil(360 * dpr);
    const offH = Math.ceil(120 * dpr);

    const fundCanvas = document.createElement('canvas');
    fundCanvas.width = offW;
    fundCanvas.height = offH;
    const fundCtx = fundCanvas.getContext('2d');

    const itCanvas = document.createElement('canvas');
    itCanvas.width = offW;
    itCanvas.height = offH;
    const itCtx = itCanvas.getContext('2d');

    // Pre-generate 76 streaming spectrum ribbons with balanced spread beyond text
    const beams: LightBeam[] = [];
    const beamCount = 76;

    for (let i = 0; i < beamCount; i++) {
      const p = THEME_RIBBON_PALETTES[i % THEME_RIBBON_PALETTES.length];
      
      const linearT = (i / (beamCount - 1) - 0.5) * 2; // -1.0 to +1.0
      const jitter = (Math.random() - 0.5) * 0.05;
      const normX = Math.max(-1.0, Math.min(1.0, linearT + jitter));

      let w = 1.8;
      if (i % 6 === 0) w = 5.2;
      else if (i % 3 === 0) w = 3.6;
      else if (i % 2 === 0) w = 2.4;

      beams.push({
        normX,
        width: w,
        palette: p,
        speedMult: 0.75 + Math.random() * 0.7,
        alphaMult: 0.6 + Math.random() * 0.4,
        zDepth: 0.4 + Math.random() * 1.2
      });
    }


    // Timing tracking using high-res performance.now()
    const startTime = performance.now();
    const NORMAL_DURATION = 3600; // 3.6s cinematic sequence
    let fastForwardStartTime: number | null = null;
    let fastForwardInitialProgress = 0;

    let animFrameId: number;

    const render = (now: number) => {
      if (isCompletedRef.current) return;

      let progress = (now - startTime) / NORMAL_DURATION;

      // Handle instant fast-forward on user interaction
      if (fastForwardRef.current) {
        if (fastForwardStartTime === null) {
          fastForwardStartTime = now;
          fastForwardInitialProgress = Math.max(0.45, progress);
        }
        const ffElapsed = now - fastForwardStartTime;
        progress = fastForwardInitialProgress + (ffElapsed / 220) * (1 - fastForwardInitialProgress);
      }

      // Check if sequence has completed -> reveal app
      if (progress >= 1.0) {
        endAnimation();
        return;
      }

      // Clear with pitch black
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, cssWidth, cssHeight);

      const cx = cssWidth / 2;
      const cy = cssHeight / 2;

      // Dynamic Large Scale: wordmark is bold, authoritative, and cinematic!
      const baseScale = Math.max(1.35, Math.min(1.72, (cssWidth * 0.88) / 320));

      // =========================================================================
      // CHOREOGRAPHED TIMELINE:
      // Act 1 (0.00 -> 0.18 | 0 - 648ms): Genesis right bar of "N" appears dead-center on pitch black
      // Act 2 (0.18 -> 0.48 | 648 - 1728ms): Right bar splits into "IT", while expanding into "FUND"!
      // Act 3 (0.48 -> 0.54 | 1728 - 1944ms): Complete "FUNDIT" holds in full glory (clean beat)
      // Act 4 (0.54 -> 0.80 | 1944 - 2880ms): TEXT FADES & RIBBONS ERUPT in direct synchrony!
      // Act 5 (0.80 -> 1.00 | 2880 - 3600ms): Hyperspace warp exit & live platform reveal
      // =========================================================================

      let cameraScale = 1.0;
      let textAlpha = 1.0;
      let ribbonIntensity = 0.0;
      let ribbonSpread = 0.0;
      let globalFade = 1.0;
      let pGrowth = 0.0;
      let uMorph = 0.0; // 0 = Genesis right bar of N; 1 = Full FUNDIT
      let genesisBarGrowth = 1.0;

      if (progress < 0.18) {
        // Act 1: The Genesis right bar of N appears dead-center on pitch black
        const t0 = progress / 0.18;
        genesisBarGrowth = Math.min(1, t0 * 1.5); // reaches full height by t0 = 0.67 (~430ms)
        const ease = 1 - Math.pow(1 - Math.min(1, t0 * 1.2), 3);
        cameraScale = 1.15 - ease * 0.15;
        textAlpha = Math.min(1, t0 * 4);
        uMorph = 0.0; // ONLY the solitary right bar of N is visible!
        ribbonIntensity = 0.0;
        ribbonSpread = 0.0;
        pGrowth = 0.0;
      } else if (progress < 0.48) {
        // Act 2: Metamorphosis - right bar splits to IT, and expands left/right into FUND
        genesisBarGrowth = 1.0;
        const pMorph = (progress - 0.18) / 0.30;
        uMorph = 1 - Math.pow(1 - pMorph, 3);
        cameraScale = 1.0 + pMorph * 0.04;
        textAlpha = 1.0;
        ribbonIntensity = 0.0; // Clean pitch black background during morph
        ribbonSpread = 0.0;
        pGrowth = 0.0;
      } else if (progress < 0.54) {
        // Act 3: Full FUNDIT stands complete in pure glory (clean beat)
        genesisBarGrowth = 1.0;
        uMorph = 1.0;
        cameraScale = 1.04;
        textAlpha = 1.0;
        ribbonIntensity = 0.0;
        ribbonSpread = 0.0;
        pGrowth = 0.0;
      } else if (progress < 0.80) {
        // Act 4: Text dissolves & ribbons erupt ("ribbons should come as the text fades")
        genesisBarGrowth = 1.0;
        const tDissolve = (progress - 0.54) / 0.26;
        uMorph = 1.0;

        // Text fades smoothly from 1.0 -> 0.0
        textAlpha = Math.max(0, 1 - Math.pow(tDissolve, 1.25));

        // Ribbons emerge from 0.0 -> 1.0 as text fades!
        ribbonIntensity = Math.min(1, Math.pow(tDissolve, 0.75));
        pGrowth = Math.min(1, tDissolve * 1.3);

        // Camera accelerates into the emerging light stream
        const pushEase = Math.pow(Math.max(0, (tDissolve - 0.15) / 0.85), 2.8);
        cameraScale = 1.04 + pushEase * 28.0;
        ribbonSpread = pGrowth * 0.2 + pushEase * 4.5;
      } else {
        // Act 5: Warp exit & reveal
        genesisBarGrowth = 1.0;
        const tExit = (progress - 0.80) / 0.20;
        uMorph = 1.0;
        cameraScale = 29.0 + tExit * 15.0;
        textAlpha = 0;
        ribbonIntensity = Math.max(0, 1 - tExit * 1.3);
        ribbonSpread = 4.8 + tExit * 5.0;
        globalFade = Math.max(0, 1 - tExit * 1.5);
        pGrowth = 1.0;
      }

      ctx.save();
      ctx.translate(cx, cy);

      // -----------------------------------------------------------------------
      // 1. CORE RADIANT BLOOM (Cyan -> Indigo -> Emerald aura behind ribbons)
      // -----------------------------------------------------------------------
      if (ribbonIntensity > 0.005 && globalFade > 0.005) {
        const auraAlpha = ribbonIntensity * globalFade * 0.85;
        const glowRad = Math.min(cssWidth * 0.85, (320 + ribbonSpread * 180) * (baseScale / 1.4));
        const glowGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, glowRad);
        glowGrad.addColorStop(0, `rgba(6, 182, 212, ${auraAlpha * 0.55})`);      // Vivid Cyan core
        glowGrad.addColorStop(0.35, `rgba(129, 140, 248, ${auraAlpha * 0.35})`);  // Electric Indigo
        glowGrad.addColorStop(0.7, `rgba(0, 229, 153, ${auraAlpha * 0.2})`);     // Neon Emerald
        glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(0, 0, glowRad, 0, Math.PI * 2);
        ctx.fill();
      }

      // -----------------------------------------------------------------------
      // 2. DRAW 76 STREAMING NEON RIBBONS EXPANDING DIRECTLY FROM "FUNDIT"
      // Lines burst vertically and horizontally outward as text fades!
      // -----------------------------------------------------------------------
      if (ribbonIntensity > 0.005 && globalFade > 0.005) {
        // Base horizontal width scaled to match the broader wordmark
        const wordmarkHalfWidth = 160 * baseScale * 1.25;
        const targetSpreadWidth = Math.min(cssWidth * 0.35, 420 * (baseScale / 1.4));
        const currentBaseWidth = wordmarkHalfWidth + (targetSpreadWidth - wordmarkHalfWidth) * Math.min(1, pGrowth * 1.4);

        for (let i = 0; i < beams.length; i++) {
          const b = beams[i];

          const shootT = Math.min(1, Math.max(0, pGrowth * (0.8 + b.speedMult * 0.4)));
          const verticalGrowth = Math.pow(shootT, 2.2);

          // Scaled to match the enlarged letter height (40px * baseScale)
          const letterHalfHeight = 40 * baseScale;
          const maxExtension = cssHeight * 1.7;
          const yTop = -letterHalfHeight - maxExtension * verticalGrowth;
          const yBottom = letterHalfHeight + maxExtension * verticalGrowth;
          const beamHeight = yBottom - yTop;

          const spreadFactor = 1 + ribbonSpread * (0.4 + b.speedMult * 1.1);
          const beamX = b.normX * currentBaseWidth * spreadFactor;
          const beamW = b.width * (1 + ribbonSpread * 0.4) * (baseScale / 1.35);

          const grad = ctx.createLinearGradient(0, yTop, 0, yBottom);
          grad.addColorStop(0, b.palette.top);
          grad.addColorStop(0.46, b.palette.mid);
          grad.addColorStop(0.50, '#ffffff'); // Intense specular center filament at letter origin
          grad.addColorStop(0.54, b.palette.mid);
          grad.addColorStop(1, b.palette.bot);

          ctx.fillStyle = grad;
          ctx.globalAlpha = ribbonIntensity * globalFade * b.alphaMult;
          ctx.fillRect(beamX - beamW / 2, yTop, beamW, beamHeight);

          if (shootT > 0.05 && shootT < 0.85) {
            const sparkAlpha = (1 - shootT) * ribbonIntensity * globalFade * 0.8;
            ctx.fillStyle = `rgba(255, 255, 255, ${sparkAlpha})`;
            ctx.fillRect(beamX - beamW, yTop - 2, beamW * 2, 4);
            ctx.fillRect(beamX - beamW, yBottom - 2, beamW * 2, 4);
          }
        }
      }

      // -----------------------------------------------------------------------
      // 3. DRAW BESPOKE CONNECTED ORBITRON "FUNDIT"
      // GENESIS: RIGHT BAR OF N APPEARS FIRST, THEN EXPANDS INTO THE REST!
      // Monolithic composite vector rendering: ZERO shadow creases!
      // Total coordinate bounds: 0..320, 0..80. Center shifts from 158 to 160.
      // -----------------------------------------------------------------------
      if (textAlpha > 0.005 && globalFade > 0.005 && fundCtx && itCtx) {
        // Clear offscreen staging buffers
        fundCtx.clearRect(0, 0, offW, offH);
        itCtx.clearRect(0, 0, offW, offH);

        // --- STAGE "FUND" (PRISTINE WHITE MONOLITHIC VECTOR) ---
        fundCtx.save();
        fundCtx.scale(dpr, dpr);
        fundCtx.translate(20, 20); // (0,0) is top-left of wordmark
        fundCtx.fillStyle = '#FFFFFF';

        const clamp = (v: number) => Math.min(1, Math.max(0, v));

        // 1. THE ROOT ANCHOR: RIGHT BAR OF "N" (x: 148..168, y: 0..80)
        // Act 1: Solitary right bar of N lands dead-center alone on pitch black with glowing neon aura
        // Act 2: Acts as the physical root from which all other strokes sequentially branch out!
        if (uMorph <= 0.01) {
          const barEase = 1 - Math.pow(1 - genesisBarGrowth, 3);
          const halfH = 40 * barEase;
          const pulse = 0.85 + 0.15 * Math.sin(progress * 28);

          fundCtx.save();
          fundCtx.fillStyle = '#FFFFFF';
          fundCtx.shadowColor = `rgba(6, 182, 212, ${0.92 * pulse})`;
          fundCtx.shadowBlur = 28 * pulse;
          fundCtx.fillRect(148, 40 - halfH, 20, halfH * 2);
          fundCtx.restore();
        } else {
          // Solid anchor bar
          fundCtx.fillRect(148, 0, 20, 80);
        }

        if (uMorph > 0.01) {
          // ===================================================================
          // BRANCH RIGHT: LETTER "D"
          // "starts forming top bar of D, then the right side bar, then the bottom bar"
          // ===================================================================
          const pD1 = clamp((uMorph - 0.00) / 0.32); // Top bar: 0.00 -> 0.32
          const pD2 = clamp((uMorph - 0.28) / 0.36); // Right vertical bar: 0.28 -> 0.64
          const pD3 = clamp((uMorph - 0.60) / 0.36); // Bottom bar: 0.60 -> 0.96

          // D Step 1: Top bar grows rightward from (168, 0)
          if (pD1 > 0) {
            const topMaxW = 202 - 168; // 34px straight top
            const dTopW = topMaxW * Math.min(1, pD1 * 1.3);
            fundCtx.fillRect(168, 0, dTopW, 20);

            // Top-right 45° chamfer to (216, 14)
            if (pD1 > 0.65) {
              const cProg = (pD1 - 0.65) / 0.35;
              const chPath = new Path2D();
              chPath.moveTo(202, 0);
              chPath.lineTo(202 + 14 * cProg, 14 * cProg);
              chPath.lineTo(196, 14 * cProg + 6);
              chPath.lineTo(196, 20);
              chPath.lineTo(196, 0);
              chPath.closePath();
              fundCtx.fill(chPath);
            }
          }

          // D Step 2: Right side bar grows downward from (216, 14) to (216, 66)
          if (pD2 > 0) {
            const dSideH = (66 - 14) * pD2;
            fundCtx.fillRect(196, 14, 20, dSideH);
          }

          // D Step 3: Bottom bar chamfers and sweeps leftward back to (168, 80)
          if (pD3 > 0) {
            // Bottom-right 45° chamfer from (216, 66) to (202, 80)
            const chProg = Math.min(1, pD3 * 2.5);
            const bChPath = new Path2D();
            bChPath.moveTo(216, 66);
            bChPath.lineTo(216 - 14 * chProg, 66 + 14 * chProg);
            bChPath.lineTo(196, 80);
            bChPath.lineTo(196, 60);
            bChPath.closePath();
            fundCtx.fill(bChPath);

            // Bottom horizontal bar sweeping back to stem (x: 202 -> 168)
            if (pD3 > 0.35) {
              const bProg = (pD3 - 0.35) / 0.65;
              const dBotW = (202 - 168) * bProg;
              fundCtx.fillRect(202 - dBotW, 60, dBotW, 20);
            }
          }

          // ===================================================================
          // BRANCH LEFT: LETTERS "N", "U", "F"
          // Sequential continuous stroke expansion leftward!
          // ===================================================================

          // N Step 1: Diagonal bar slices downward-left from right bar (168, 80) towards (100, 0)
          const pN1 = clamp((uMorph - 0.00) / 0.32);
          if (pN1 > 0) {
            const nClipX = 168 - (168 - 100) * pN1;
            fundCtx.save();
            fundCtx.beginPath();
            fundCtx.rect(nClipX, 0, 168 - nClipX, 80);
            fundCtx.clip();

            const nDiag = new Path2D(`
              M 100 0 L 128 0 L 148 52 L 168 80 L 140 80 L 120 28 Z
            `);
            fundCtx.fill(nDiag);
            fundCtx.restore();
          }

          // N Step 2: Left vertical stem of N grows downward (100..120, y: 0 -> 80)
          const pN2 = clamp((uMorph - 0.24) / 0.30);
          if (pN2 > 0) {
            fundCtx.fillRect(100, 0, 20, 80 * pN2);
          }

          // U Step 1: Bottom bowl of U sweeps leftward from N stem (100 -> 52, y: 60..80)
          const pU1 = clamp((uMorph - 0.44) / 0.28);
          if (pU1 > 0) {
            const uClipX = 100 - (100 - 52) * pU1;
            fundCtx.save();
            fundCtx.beginPath();
            fundCtx.rect(uClipX, 20, 120 - uClipX, 60);
            fundCtx.clip();

            const uPath = new Path2D(`
              M 52 20 L 72 20 L 72 60 L 100 60 L 100 20 L 120 20 L 120 64 L 104 80 L 68 80 L 52 64 Z
            `);
            fundCtx.fill(uPath);
            fundCtx.restore();
          }

          // U Step 2: Left stem of U shoots UPWARD from bottom curve (52..72, y: 64 -> 0)
          const pU2 = clamp((uMorph - 0.58) / 0.24);
          if (pU2 > 0) {
            const uStemH = 64 * pU2;
            fundCtx.fillRect(52, 64 - uStemH, 20, uStemH);
          }

          // F Step 1: Top connector bar sweeps leftward from U (x: 72 -> 0, y: 0..20)
          const pF1 = clamp((uMorph - 0.70) / 0.16);
          if (pF1 > 0) {
            const fTopW = 72 * pF1;
            fundCtx.fillRect(72 - fTopW, 0, fTopW, 20);
          }

          // F Step 2: Left vertical stem of F shoots DOWNWARD (x: 0..20, y: 0 -> 80)
          const pF2 = clamp((uMorph - 0.78) / 0.18);
          if (pF2 > 0) {
            fundCtx.fillRect(0, 0, 20, 80 * pF2);
          }

          // F Step 3: Middle horizontal arm shoots RIGHTWARD (x: 20 -> 46, y: 32..48)
          const pF3 = clamp((uMorph - 0.86) / 0.14);
          if (pF3 > 0) {
            fundCtx.fillRect(20, 32, 26 * pF3, 16);
          }

          // Specular neon energy sparks on leading stroke edges while drawing
          if (uMorph < 0.98) {
            fundCtx.save();
            fundCtx.fillStyle = '#FFFFFF';
            fundCtx.shadowColor = 'rgba(6, 182, 212, 0.95)';
            fundCtx.shadowBlur = 18;

            // Spark on D leading tip
            if (pD1 > 0 && pD1 < 0.95) {
              const sx = 168 + (202 - 168) * pD1;
              fundCtx.fillRect(sx - 2, 0, 4, 20);
            } else if (pD2 > 0 && pD2 < 0.95) {
              const sy = 14 + (66 - 14) * pD2;
              fundCtx.fillRect(196, sy - 2, 20, 4);
            } else if (pD3 > 0.35 && pD3 < 0.95) {
              const bProg = (pD3 - 0.35) / 0.65;
              const sx = 202 - (202 - 168) * bProg;
              fundCtx.fillRect(sx - 2, 60, 4, 20);
            }

            // Spark on F left stem tip while dropping
            if (pF2 > 0 && pF2 < 0.95) {
              fundCtx.fillRect(0, 80 * pF2 - 2, 20, 4);
            }

            fundCtx.restore();
          }
        }

        fundCtx.restore();

        // --- STAGE "IT" (PLATFORM NEON GRADIENT: INDIGO -> CYAN -> EMERALD) ---
        // Right bar of N / D triggers the expansion into IT!
        if (uMorph > 0.04) {
          itCtx.save();
          itCtx.scale(dpr, dpr);
          itCtx.translate(20, 20);

          const itGrad = itCtx.createLinearGradient(230, 0, 320, 80);
          itGrad.addColorStop(0, '#818CF8');    // Electric Indigo
          itGrad.addColorStop(0.5, '#06B6D4');  // Vivid Cyan
          itGrad.addColorStop(1, '#00E599');    // Neon Emerald
          itCtx.fillStyle = itGrad;

          const pI = clamp((uMorph - 0.14) / 0.36);   // I vertical stem: 0.14 -> 0.50
          const pT1 = clamp((uMorph - 0.46) / 0.28);  // T top crossbar: 0.46 -> 0.74
          const pT2 = clamp((uMorph - 0.68) / 0.28);  // T center stem: 0.68 -> 0.96

          // Electric laser filament connecting D to I while in flight
          if (pI > 0 && pI < 0.92) {
            itCtx.save();
            itCtx.globalAlpha = (1 - pI) * 0.85;
            itCtx.fillRect(216, 38, Math.max(0, 230 - 216), 4);
            itCtx.restore();
          }

          // 1. LETTER "I" grows downward from top (x: 230..250, y: 0 -> 80)
          if (pI > 0) {
            itCtx.fillRect(230, 0, 20, 80 * pI);
          }

          // 2. LETTER "T" top crossbar grows rightward (x: 256 -> 320, y: 0..20)
          if (pT1 > 0) {
            itCtx.fillRect(256, 0, 64 * pT1, 20);
          }

          // 3. LETTER "T" centered vertical stem grows downward (x: 278..298, y: 20 -> 80)
          if (pT2 > 0) {
            itCtx.fillRect(278, 20, 20, 60 * pT2);
          }

          itCtx.restore();
        }

        // --- COMPOSITE TO MAIN CANVAS WITH UNIFIED GLOW & SHADOW ---
        ctx.save();
        ctx.globalAlpha = textAlpha * globalFade;

        const finalScale = cameraScale * baseScale;
        ctx.scale(finalScale * 1.25, finalScale); // Broader horizontal stance (removes compressed look)

        // Center dynamically shifts:
        // At uMorph = 0, Genesis right bar of N (midpoint 158) is dead-center (0, 0)!
        // At uMorph = 1, full FUNDIT's center (160) is dead-center (0, 0)!
        const centerShiftX = 158 + (160 - 158) * uMorph;
        const drawDx = -(20 + centerShiftX);
        const drawDy = -60; // -(20 + 40)

        // 1. Draw "FUND" with deep 3D drop shadow (ZERO internal creases!)
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
        ctx.shadowBlur = 38;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 14;
        ctx.drawImage(
          fundCanvas,
          0, 0, offW, offH,
          drawDx, drawDy,
          offW / dpr, offH / dpr
        );
        ctx.restore();

        // 2. Draw "IT" with signature platform neon cyan/emerald glow
        if (uMorph > 0.02) {
          ctx.save();
          ctx.shadowColor = 'rgba(6, 182, 212, 0.95)';
          ctx.shadowBlur = 32;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          ctx.drawImage(
            itCanvas,
            0, 0, offW, offH,
            drawDx, drawDy,
            offW / dpr, offH / dpr
          );
          ctx.restore();
        }

        ctx.restore();
      }

      ctx.restore();

      animFrameId = requestAnimationFrame(render);
    };

    animFrameId = requestAnimationFrame(render);

    // Any user interaction (scroll, touch, click, key) fast-forwards and opens immediately
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > 8) triggerFastForward();
    };
    const onTouch = () => triggerFastForward();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'Escape') {
        triggerFastForward();
      }
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouch, { passive: true });
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('resize', setupSize);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouch);
      window.removeEventListener('keydown', onKey);
      cancelAnimationFrame(animFrameId);
    };
  }, [endAnimation, triggerFastForward]);

  return (
    <div
      onClick={triggerFastForward}
      className="fixed inset-0 z-[99999] bg-black text-white overflow-hidden select-none cursor-pointer"
      title="Click or scroll to enter directly"
    >
      {/* 90/120 FPS High-Performance Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
    </div>
  );
};

export default FundItIntro;
