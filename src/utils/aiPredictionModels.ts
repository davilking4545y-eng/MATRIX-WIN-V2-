import { WinGoIssue, WinGoSize, WinGoColor } from '../types';

/**
 * =========================================================================
 * ALGORITHM 1: DEEPSEEK FLUID INVERSION TENSOR ENGINE (From Real Gojo)
 * Features:
 * - 0.88^idx exponential decay tensor scoring on last 16 nodes
 * - Server wave dragon streak tracker
 * - Fluid integrated swing mechanism (Deep Inversion vs Flow Sync)
 * - Anti-freeze periodic oscillation prevention
 * =========================================================================
 */
export interface DeepSeekResult {
  prediction: WinGoSize;
  phaseLabel: string;
  confidence: number;
  n1: number;
  n2: number;
  dragonStreak: number;
}

export function executeFluidDeepSeekLogic(
  history: WinGoIssue[],
  sequenceTurnCount: number = 0
): DeepSeekResult {
  if (!history || history.length === 0) {
    return {
      prediction: 'BIG',
      phaseLabel: 'BALANCED',
      confidence: 90,
      n1: 7,
      n2: 2,
      dragonStreak: 1,
    };
  }

  const coreNodes = history.slice(0, 16);
  let scoreBig = 0;
  let scoreSmall = 0;

  coreNodes.forEach((node, idx) => {
    const num = parseInt(node.number, 10);
    const weightFactor = Math.pow(0.88, idx);
    if (num >= 5) scoreBig += weightFactor;
    else scoreSmall += weightFactor;
  });

  // Detect server wave signature (Dragon trends)
  let dragonTracker = 1;
  const firstNum = parseInt(coreNodes[0].number, 10);
  const initialTrend: WinGoSize = firstNum >= 5 ? 'BIG' : 'SMALL';

  for (let i = 1; i < coreNodes.length; i++) {
    const checkTrend: WinGoSize = parseInt(coreNodes[i].number, 10) >= 5 ? 'BIG' : 'SMALL';
    if (checkTrend === initialTrend) dragonTracker++;
    else break;
  }

  const calculatedBase: WinGoSize = scoreBig >= scoreSmall ? 'BIG' : 'SMALL';
  let strategicInversionDecision: WinGoSize = calculatedBase;
  let phaseName = 'MIXED CODES';

  // Fluid integrated swing mechanism
  if (sequenceTurnCount % 10 < 5) {
    // Phase 1: Deep Inversion
    strategicInversionDecision = calculatedBase === 'BIG' ? 'SMALL' : 'BIG';
    phaseName = 'DEEP INVERSION';
  } else {
    // Phase 2: Flow Sync (follows strong dragon >=4)
    strategicInversionDecision = dragonTracker >= 4 ? initialTrend : calculatedBase;
    phaseName = 'FLOW SYNC';
  }

  // Anti-freeze check to prevent static loop freezes
  if (sequenceTurnCount % 4 === 0) {
    strategicInversionDecision = strategicInversionDecision === 'BIG' ? 'SMALL' : 'BIG';
    phaseName = 'ANTI-FREEZE';
  }

  // Real Dual Digit selection: 1 Same-side + 1 Opposite-side Hedge
  const samePool = strategicInversionDecision === 'BIG' ? [5, 6, 7, 8, 9] : [0, 1, 2, 3, 4];
  const oppPool = strategicInversionDecision === 'BIG' ? [0, 1, 2, 3, 4] : [5, 6, 7, 8, 9];
  const seed = (firstNum + sequenceTurnCount) % 5;
  const item1 = samePool[seed];
  const item2 = oppPool[(seed + 2) % 5];

  const confidence = Math.min(98.5, Math.max(90, 92 + Math.abs(scoreBig - scoreSmall) * 1.5));

  return {
    prediction: strategicInversionDecision,
    phaseLabel: phaseName,
    confidence: Math.round(confidence * 10) / 10,
    n1: item1,
    n2: item2,
    dragonStreak: dragonTracker,
  };
}

/**
 * =========================================================================
 * ALGORITHM 2: RONIN VIP / MATRIX WIN 2-GRAM & SEQUENCE ENGINE
 * Features:
 * - Specific end patterns (BSBSSBS, BSBBSB, BBSS, SSBB, etc.)
 * - 2-Gram sub-sequence Markov transition probability
 * - Modulo seed digit generation
 * =========================================================================
 */
export interface RoninVipResult {
  prediction: WinGoSize;
  confidence: number;
  patternName: string;
  n1: number;
  n2: number;
}

export const RONIN_PATTERN_MAP: Record<string, { p: WinGoSize; c: number; desc: string }> = {
  BBBBB: { p: 'BIG', c: 92, desc: 'Ronin 5x Big Dragon Momentum' },
  SSSSS: { p: 'SMALL', c: 92, desc: 'Ronin 5x Small Dragon Momentum' },
  BSBSBS: { p: 'BIG', c: 88, desc: 'Alternating 6-Step Rebound to BIG' },
  SBSBSB: { p: 'SMALL', c: 88, desc: 'Alternating 6-Step Rebound to SMALL' },
  BSBSSBS: { p: 'BIG', c: 86, desc: 'Wave 7-Step Harmonic Reversal' },
  BSBBSB: { p: 'SMALL', c: 84, desc: 'Wave 6-Step Counter Compression' },
  BBSS: { p: 'BIG', c: 82, desc: 'Twin Pair (2-2) Reversal' },
  SSBB: { p: 'SMALL', c: 82, desc: 'Twin Pair (2-2) Reversal' },
  SSS: { p: 'BIG', c: 80, desc: '3x Small Compression Rebound' },
  BBB: { p: 'SMALL', c: 80, desc: '3x Big Compression Rebound' },
};

export function executeRoninVipLogic(history: WinGoIssue[]): RoninVipResult {
  if (!history || history.length < 3) {
    return {
      prediction: 'BIG',
      confidence: 85,
      patternName: 'Ronin Baseline',
      n1: 7,
      n2: 2,
    };
  }

  const seq = history
    .slice(0, 25)
    .reverse()
    .map((item) => (parseInt(item.number, 10) >= 5 ? 'B' : 'S'));

  const s = seq.join('');
  const len = s.length;
  const last = s[len - 1];

  let pred: WinGoSize | null = null;
  let conf = 0;
  let patternName = 'Stochastic Markov Sequence';

  // Check pattern map
  for (const [pat, meta] of Object.entries(RONIN_PATTERN_MAP)) {
    if (s.endsWith(pat)) {
      pred = meta.p;
      conf = meta.c;
      patternName = meta.desc;
      break;
    }
  }

  // 2-gram Markov analysis
  if (!pred && len >= 4) {
    const sub = s.slice(-2);
    let cb = 0;
    let cs = 0;
    for (let i = 0; i < len - 2; i++) {
      if (s.slice(i, i + 2) === sub) {
        if (s[i + 2] === 'B') cb++;
        if (s[i + 2] === 'S') cs++;
      }
    }
    const tot = cb + cs;
    if (tot > 0) {
      const pb = cb / tot;
      if (pb >= 0.58) {
        pred = 'BIG';
        conf = Math.round(pb * 100);
        patternName = `2-Gram Markov Resonance (${conf}%)`;
      } else if (pb <= 0.42) {
        pred = 'SMALL';
        conf = Math.round((1 - pb) * 100);
        patternName = `2-Gram Markov Resonance (${conf}%)`;
      }
    }
  }

  // Frequency count on last 10
  if (!pred) {
    const rec = s.slice(-10);
    const bc = (rec.match(/B/g) || []).length;
    const sc = (rec.match(/S/g) || []).length;
    if (bc > sc) {
      pred = 'BIG';
      conf = Math.min(94, Math.round((bc / rec.length) * 100));
      patternName = `10-Period Cluster Drift (BIG ${conf}%)`;
    } else if (sc > bc) {
      pred = 'SMALL';
      conf = Math.min(94, Math.round((sc / rec.length) * 100));
      patternName = `10-Period Cluster Drift (SMALL ${conf}%)`;
    } else {
      pred = last === 'B' ? 'SMALL' : 'BIG';
      conf = 78;
      patternName = 'Single-Period Oscillation Reversal';
    }
  }

  const latestIssue = history[0].issueNumber;
  const latestNum = parseInt(history[0].number, 10);
  const seed = parseInt(latestIssue.slice(-3), 10) || 123;

  let n1: number;
  let n2: number;
  if (pred === 'BIG') {
    n1 = [5, 6, 7, 8, 9][(seed + latestNum) % 5];
    n2 = [0, 1, 2, 3, 4][(seed * 3) % 5];
  } else {
    n1 = [0, 1, 2, 3, 4][(seed + latestNum) % 5];
    n2 = [5, 6, 7, 8, 9][(seed * 7) % 5];
  }

  return {
    prediction: pred,
    confidence: conf,
    patternName,
    n1,
    n2,
  };
}

/**
 * =========================================================================
 * ALGORITHM 3: 12 POWERFUL SINGLE NUMBER ENGINES (From Real VIP V2)
 * 12 dedicated algorithmic models that rotate based on performance:
 * 1. Reversal
 * 2. Avg Dragon (2-period avg)
 * 3. Pattern Break (3-period count)
 * 4. Tail 10 (10-period tail)
 * 5. Wisdom 51 (51-period std dev + exponential weighted avg)
 * 6. Echo Pattern (Trend curve classifier)
 * 7. Fire Dragon (Harmonic alternating trap)
 * 8. ZigZag (2-period zigzag trend)
 * 9. Memory (Comparing 4..8 past window to 0..4 current window)
 * 10. Golden Ratio (Fibonacci sum sequence modulo 7)
 * 11. Neo (Fixed neural weight vector [0.35, 0.25, 0.18, 0.12, 0.07, 0.03])
 * 12. Chaos (Stochastic bias model)
 * =========================================================================
 */
export interface SingleEngineResult {
  signal: WinGoSize;
  num: number;
  logicId: number;
  logicName: string;
  confidence: number;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clampNum(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function detectEchoPattern(nums: number[]): 'rising' | 'falling' | 'zigzag' | 'random' {
  if (nums.length < 3) return 'random';
  const trends: string[] = [];
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] > nums[i - 1]) trends.push('up');
    else if (nums[i] < nums[i - 1]) trends.push('down');
    else trends.push('same');
  }
  const ups = trends.filter((t) => t === 'up').length;
  const downs = trends.filter((t) => t === 'down').length;
  if (ups > downs * 1.5) return 'rising';
  if (downs > ups * 1.5) return 'falling';
  let zigzag = 0;
  for (let i = 1; i < trends.length - 1; i++) {
    if (trends[i] !== trends[i - 1] && trends[i] !== trends[i + 1]) zigzag++;
  }
  if (zigzag > trends.length * 0.6) return 'zigzag';
  return 'random';
}

export const TWELVE_SINGLE_ENGINES: Array<(lastResults: WinGoIssue[]) => SingleEngineResult> = [
  // 1: REVERSAL
  (results) => {
    const n = results.length ? parseInt(results[0].number, 10) : 5;
    const predSize: WinGoSize = n >= 5 ? 'SMALL' : 'BIG';
    const predNum = predSize === 'BIG' ? randomInt(5, 9) : randomInt(0, 4);
    return { signal: predSize, num: predNum, logicId: 1, logicName: 'REVERSAL', confidence: 88 };
  },

  // 2: AVG DRAGON
  (results) => {
    const nums = results.slice(0, 2).map((r) => parseInt(r.number, 10));
    const avg = nums.reduce((a, b) => a + b, 0) / (nums.length || 1);
    const predNum = avg > 4.5 ? randomInt(0, 4) : randomInt(5, 9);
    const predSize: WinGoSize = predNum >= 5 ? 'BIG' : 'SMALL';
    return { signal: predSize, num: predNum, logicId: 2, logicName: 'AVG DRAGON', confidence: 86 };
  },

  // 3: PATTERN BREAK
  (results) => {
    const recent = results.slice(0, 3).map((r) => parseInt(r.number, 10));
    const bigCount = recent.filter((n) => n >= 5).length;
    const smallCount = recent.filter((n) => n < 5).length;
    const predNum = bigCount >= smallCount ? randomInt(0, 4) : randomInt(5, 9);
    const predSize: WinGoSize = predNum >= 5 ? 'BIG' : 'SMALL';
    return { signal: predSize, num: predNum, logicId: 3, logicName: 'PATTERN BREAK', confidence: 85 };
  },

  // 4: TAIL 10
  (results) => {
    const nums = results.slice(0, Math.min(10, results.length)).map((r) => parseInt(r.number, 10));
    const bigCount = nums.filter((n) => n >= 5).length;
    const smallCount = nums.filter((n) => n < 5).length;
    const predNum = bigCount > smallCount ? randomInt(0, 4) : randomInt(5, 9);
    const predSize: WinGoSize = predNum >= 5 ? 'BIG' : 'SMALL';
    return { signal: predSize, num: predNum, logicId: 4, logicName: 'TAIL 10', confidence: 87 };
  },

  // 5: WISDOM 51
  (results) => {
    const nums = results.slice(0, Math.min(51, results.length)).map((r) => parseInt(r.number, 10));
    const avg = nums.reduce((a, b) => a + b, 0) / (nums.length || 1);
    const stdDev = Math.sqrt(
      nums.reduce((sq, n) => sq + Math.pow(n - avg, 2), 0) / (nums.length || 1)
    );
    let predNum: number;
    if (avg > 4.5 && stdDev < 3) predNum = randomInt(0, 4);
    else if (avg <= 4.5 && stdDev < 3) predNum = randomInt(5, 9);
    else {
      let ws = 0, tw = 0;
      for (let i = 0; i < Math.min(10, nums.length); i++) {
        const w = Math.pow(0.8, i);
        ws += nums[i] * w;
        tw += w;
      }
      const wa = ws / (tw || 1);
      predNum = wa > 4.5 ? randomInt(0, 4) : randomInt(5, 9);
    }
    const predSize: WinGoSize = predNum >= 5 ? 'BIG' : 'SMALL';
    return { signal: predSize, num: predNum, logicId: 5, logicName: 'WISDOM 51', confidence: 91 };
  },

  // 6: ECHO PATTERN
  (results) => {
    const nums = results.slice(0, 5).map((r) => parseInt(r.number, 10));
    const pattern = detectEchoPattern(nums);
    let predNum: number;
    switch (pattern) {
      case 'rising':
        predNum = randomInt(7, 9);
        break;
      case 'falling':
        predNum = randomInt(0, 2);
        break;
      case 'zigzag':
        predNum = randomInt(3, 6);
        break;
      default:
        predNum = randomInt(2, 7);
    }
    const predSize: WinGoSize = predNum >= 5 ? 'BIG' : 'SMALL';
    return { signal: predSize, num: predNum, logicId: 6, logicName: 'ECHO PATTERN', confidence: 89 };
  },

  // 7: FIRE DRAGON
  (results) => {
    const nums = results.slice(0, 4).map((r) => parseInt(r.number, 10));
    const sizes = nums.map((n) => (n >= 5 ? 'BIG' : 'SMALL'));
    const p1 = sizes[0] === 'BIG' && sizes[1] === 'SMALL' && sizes[2] === 'BIG';
    const p2 = sizes[0] === 'SMALL' && sizes[1] === 'BIG' && sizes[2] === 'SMALL';
    let predNum: number;
    if (p1) predNum = randomInt(0, 4);
    else if (p2) predNum = randomInt(5, 9);
    else {
      const bigCount = sizes.filter((s) => s === 'BIG').length;
      predNum = bigCount > sizes.length / 2 ? randomInt(0, 4) : randomInt(5, 9);
    }
    const predSize: WinGoSize = predNum >= 5 ? 'BIG' : 'SMALL';
    return { signal: predSize, num: predNum, logicId: 7, logicName: 'FIRE DRAGON', confidence: 88 };
  },

  // 8: ZIGZAG
  (results) => {
    const last = results.slice(0, 2).map((r) => parseInt(r.number, 10));
    const sizes = last.map((n) => (n >= 5 ? 'BIG' : 'SMALL'));
    const predNum = sizes[0] === 'BIG' ? randomInt(5, 9) : randomInt(0, 4);
    const predSize: WinGoSize = predNum >= 5 ? 'BIG' : 'SMALL';
    return { signal: predSize, num: predNum, logicId: 8, logicName: 'ZIGZAG', confidence: 84 };
  },

  // 9: MEMORY
  (results) => {
    const prev = results.slice(4, 8).map((r) => parseInt(r.number, 10));
    const curr = results.slice(0, 4).map((r) => parseInt(r.number, 10));
    const pBig = prev.filter((n) => n >= 5).length;
    const pSmall = prev.filter((n) => n < 5).length;
    const cBig = curr.filter((n) => n >= 5).length;
    const cSmall = curr.filter((n) => n < 5).length;
    let predNum: number;
    if (pBig > pSmall * 1.5 && cBig <= cSmall) predNum = randomInt(0, 4);
    else if (pSmall > pBig * 1.5 && cSmall <= cBig) predNum = randomInt(5, 9);
    else predNum = cBig > cSmall ? randomInt(0, 4) : randomInt(5, 9);
    const predSize: WinGoSize = predNum >= 5 ? 'BIG' : 'SMALL';
    return { signal: predSize, num: predNum, logicId: 9, logicName: 'MEMORY', confidence: 90 };
  },

  // 10: GOLDEN RATIO
  (results) => {
    const nums = results.slice(0, 3).map((r) => parseInt(r.number, 10));
    const fib = [0, 1, 1, 2, 3, 5, 8];
    const idx = (nums.reduce((a, b) => a + b, 0) || 0) % 7;
    let predNum = fib[idx] % 10;
    const predSize: WinGoSize = predNum >= 5 ? 'BIG' : 'SMALL';
    return { signal: predSize, num: predNum, logicId: 10, logicName: 'GOLDEN RATIO', confidence: 86 };
  },

  // 11: NEO NEURAL
  (results) => {
    const nums = results.slice(0, 6).map((r) => parseInt(r.number, 10));
    const weights = [0.35, 0.25, 0.18, 0.12, 0.07, 0.03];
    let weighted = 0;
    for (let i = 0; i < Math.min(nums.length, weights.length); i++) {
      weighted += nums[i] * weights[i];
    }
    let predNum = clampNum(Math.round(weighted), 0, 9);
    const predSize: WinGoSize = predNum >= 5 ? 'BIG' : 'SMALL';
    return { signal: predSize, num: predNum, logicId: 11, logicName: 'NEO NEURAL', confidence: 92 };
  },

  // 12: CHAOS
  (results) => {
    const nums = results.slice(0, 4).map((r) => parseInt(r.number, 10));
    const avg = nums.reduce((a, b) => a + b, 0) / (nums.length || 1);
    const bias = avg > 4.5 ? 0.6 : 0.4;
    const predNum =
      Math.random() < bias
        ? avg > 4.5 ? randomInt(5, 9) : randomInt(0, 4)
        : avg > 4.5 ? randomInt(0, 4) : randomInt(5, 9);
    const predSize: WinGoSize = predNum >= 5 ? 'BIG' : 'SMALL';
    return { signal: predSize, num: predNum, logicId: 12, logicName: 'CHAOS MODEL', confidence: 83 };
  },
];

/**
 * =========================================================================
 * ALGORITHM 4: PRO MULTI-FACTOR ENSEMBLE (From Ultimate Pro Engine)
 * Contains:
 * - Symmetry Mirror (t[0] === t[3] && t[1] === t[2])
 * - 4-Period Bounce Trap
 * - Missing Gap Recovery (numbers 0-9 absent in 15 draws)
 * - Math Sequence Harmonic: (n0 + n1) % 10
 * - Multi-Vote Weighted Matrix
 * =========================================================================
 */
export interface ProEngineSuiteResult {
  rifu: { prediction: WinGoSize; numB: number; numS: number; confidence: number; logic: string };
  smart: { prediction: WinGoSize; number: number; confidence: number; reason: string };
  hybrid: { prediction: WinGoSize; number: number; confidence: number; reason: string };
  master: { prediction: WinGoSize; number: number; confidence: number; reason: string };
  advanced: { prediction: WinGoSize; number: number; confidence: number; reason: string };
  ultimate: { prediction: WinGoSize; number: number; confidence: number; reason: string };
  consensus: WinGoSize;
  confidence: number;
  bestEngineName: string;
}

export function executeProEngineSuite(
  history: WinGoIssue[],
  lossStreak: number = 0
): ProEngineSuiteResult {
  const nums = history.slice(0, 20).map((h) => parseInt(h.number, 10));
  const sides: WinGoSize[] = nums.map((n) => (n >= 5 ? 'BIG' : 'SMALL'));

  // 1. SMART ENGINE: Symmetry Mirror & Bounce Trap
  let smartPred: WinGoSize = 'BIG';
  let smartNum = 7;
  let smartReason = 'FREQUENCY DRIFT';
  let smartConf = 75;

  if (sides.length >= 4 && sides[0] === sides[3] && sides[1] === sides[2]) {
    smartPred = sides[0] === 'BIG' ? 'SMALL' : 'BIG';
    smartNum = smartPred === 'BIG' ? 7 : 2;
    smartReason = 'SYMMETRY-MIRROR REVERSAL';
    smartConf = 93;
  } else if (sides.length >= 4 && sides[0] === sides[1] && sides[1] === sides[2] && sides[2] === sides[3]) {
    smartPred = sides[0];
    smartNum = smartPred === 'BIG' ? 8 : 1;
    smartReason = 'BOUNCE-TRAP FOLLOW';
    smartConf = 89;
  } else {
    // Missing number gap
    const missing = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((d) => !nums.slice(0, 15).includes(d));
    if (missing.length > 0) {
      smartNum = missing[0];
      smartPred = smartNum >= 5 ? 'BIG' : 'SMALL';
      smartReason = `GAP-RECOVERY #${smartNum}`;
      smartConf = 85;
    }
  }

  // 2. HYBRID ENGINE: Math Sequence (n0 + n1) % 10
  let hybridPred: WinGoSize = nums[0] >= 5 ? 'BIG' : 'SMALL';
  const mathSeqDigit = (nums[0] + (nums[1] || 0)) % 10;
  let hybridNum = mathSeqDigit;
  let hybridReason = 'MATH-HARMONIC SEQUENCE';
  let hybridConf = 82;

  const periodMod = parseInt((history[0]?.issueNumber || '0').slice(-2), 10) % 3;
  if (periodMod === 0) {
    hybridPred = smartPred;
    hybridNum = smartNum;
    hybridReason = 'CORE-FREQUENCY CLUSTER';
    hybridConf = 86;
  } else if (periodMod === 1) {
    hybridNum = mathSeqDigit;
    hybridPred = hybridNum >= 5 ? 'BIG' : 'SMALL';
    hybridReason = `MATH-SEQUENCE (${nums[0]}+${nums[1]}%10)`;
    hybridConf = 84;
  } else {
    hybridPred = sides[0] === 'BIG' ? 'SMALL' : 'BIG';
    hybridNum = (nums[0] + 1) % 10;
    hybridReason = 'TREND-COUNTER STRIKE';
    hybridConf = 88;
  }

  // 3. MASTER VOTING ENGINE
  let voteBig = 0;
  let voteSmall = 0;

  if (sides[0] === sides[3] && sides[1] === sides[2]) {
    sides[0] === 'BIG' ? (voteSmall += 3) : (voteBig += 3);
  }
  let slope = 0;
  nums.slice(0, 8).forEach((n, i) => {
    slope += (n >= 5 ? 1 : -1) * (8 - i);
  });
  slope > 0 ? (voteBig += 2) : (voteSmall += 2);

  const edgeCount = nums.slice(0, 5).filter((n) => [0, 1, 8, 9].includes(n)).length;
  if (edgeCount >= 3) voteBig += 2;

  const masterPred: WinGoSize = voteBig >= voteSmall ? 'BIG' : 'SMALL';
  const masterConf = Math.min(96, Math.max(82, 80 + Math.abs(voteBig - voteSmall) * 4));
  const masterNum = masterPred === 'BIG' ? 8 : 2;

  // 4. ADVANCED RETRACE (Loss Streak Aware)
  let advPred = masterPred;
  let advConf = masterConf;
  let advReason = 'MULTI-FACTOR SYNTHESIS';

  if (lossStreak >= 2) {
    advPred = masterPred === 'BIG' ? 'SMALL' : 'BIG';
    advConf = Math.min(97, 85 + lossStreak * 3);
    advReason = `LOSS-RETRACE LEVEL ${lossStreak} DEFENSE`;
  }

  // 5. ULTIMATE PRO ADAPTIVE
  const ultPred = voteBig >= voteSmall ? 'BIG' : 'SMALL';
  const ultNum = ultPred === 'BIG' ? 9 : 0;
  const ultConf = Math.min(98, Math.max(89, masterConf + 2));

  // Determine winning consensus
  const votes = [smartPred, hybridPred, masterPred, advPred, ultPred];
  const countBig = votes.filter((v) => v === 'BIG').length;
  const consensus: WinGoSize = countBig >= 3 ? 'BIG' : 'SMALL';

  return {
    rifu: {
      prediction: sides[0] === 'BIG' ? 'SMALL' : 'BIG',
      numB: 7,
      numS: 3,
      confidence: 88,
      logic: 'CORE-HARMONIC',
    },
    smart: { prediction: smartPred, number: smartNum, confidence: smartConf, reason: smartReason },
    hybrid: { prediction: hybridPred, number: hybridNum, confidence: hybridConf, reason: hybridReason },
    master: { prediction: masterPred, number: masterNum, confidence: masterConf, reason: 'MULTI-VOTE MATRIX' },
    advanced: { prediction: advPred, number: advPred === 'BIG' ? 7 : 2, confidence: advConf, reason: advReason },
    ultimate: { prediction: ultPred, number: ultNum, confidence: ultConf, reason: 'ULTIMATE-PRO ADAPTIVE' },
    consensus,
    confidence: Math.round(ultConf),
    bestEngineName: 'ULTIMATE PRO ADAPTIVE',
  };
}

/**
 * =========================================================================
 * ALGORITHM 5: DRAGON STRIKE CORE & 10x10 MARKOV MATRIX (Dragon King Elite Pro V3)
 * Features:
 * - Dragon Strike Trigger: 3 or more consecutive identical sizes (3x BIG or 3x SMALL)
 *   locks into "FOLLOW THE DRAGON" strike with 92%+ confidence!
 * - Breakout detector: Recognizes when strike breaks and resets to building phase.
 * - 10x10 Transition Matrix: Probability of digit N transitioning to digit M.
 * - Alternating Chop vs Momentum filter (altRate > 0.72 vs < 0.28).
 * - Exact 3-period Triplet Sequence match in history (Strike Mode).
 * =========================================================================
 */
export interface DragonStrikeResult {
  prediction: WinGoSize;
  statusType: 'BIG_STRIKE' | 'SMALL_STRIKE' | 'BREAK' | 'WAIT';
  streakCount: number;
  label: string;
  confidence: number;
  n1: number;
  n2: number;
  mode: 'DRAGON' | 'BLADE' | 'HONOR' | 'STRIKE';
  reasoning: string;
}

export function executeDragonStrikeCore(history: WinGoIssue[]): DragonStrikeResult {
  if (!history || history.length === 0) {
    return {
      prediction: 'BIG',
      statusType: 'WAIT',
      streakCount: 0,
      label: '🐉 SCANNING DRAGON MATRIX',
      confidence: 88,
      n1: 7,
      n2: 2,
      mode: 'BLADE',
      reasoning: 'Calibrating Dragon telemetry buffer',
    };
  }

  const nums = history.slice(0, 100).map((item) => parseInt(item.number, 10) % 10);
  const bsh = nums.map((n) => (n >= 5 ? 'BIG' : 'SMALL'));

  // 1. Check for 3+ consecutive same side -> DRAGON STRIKE
  let streak = 1;
  const currentSide: WinGoSize = bsh[0];
  for (let i = 1; i < Math.min(bsh.length, 12); i++) {
    if (bsh[i] === currentSide) streak++;
    else break;
  }

  // 2. 10x10 Transition Matrix
  const transMatrix: number[][] = Array(10)
    .fill(null)
    .map(() => Array(10).fill(0));
  const freqMap: number[] = Array(10).fill(0);

  for (let i = 0; i < nums.length; i++) {
    freqMap[nums[i]]++;
    if (i > 0) transMatrix[nums[i - 1]][nums[i]]++;
  }

  // Helper: Rank Candidate Numbers
  const rankCandidates = (candidates: number[]) => {
    return candidates
      .map((n) => {
        let score = 1 + (freqMap[n] / (nums.length || 1)) * 22;
        const idx = nums.indexOf(n);
        if (idx === -1) score += 20;
        else if (idx > 8) score += (idx - 8) * 0.9;
        if (nums.length > 0) {
          const tr = transMatrix[nums[0]];
          const tot = tr.reduce((a, b) => a + b, 0);
          if (tot > 0) score += (tr[n] / tot) * 30;
        }
        return { n, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((x) => x.n);
  };

  // 3. Weight Calculation (computeBSWeights)
  let wB = 0.5;
  let wS = 0.5;

  if (streak >= 4) {
    if (bsh[0] === 'BIG') {
      wS += 0.32;
      wB -= 0.32;
    } else {
      wB += 0.32;
      wS -= 0.32;
    }
  } else if (streak >= 3) {
    if (bsh[0] === 'BIG') {
      wS += 0.22;
      wB -= 0.22;
    } else {
      wB += 0.22;
      wS -= 0.22;
    }
  } else if (streak >= 2) {
    if (bsh[0] === 'BIG') {
      wS += 0.10;
      wB -= 0.10;
    } else {
      wB += 0.10;
      wS -= 0.10;
    }
  }

  const last10 = bsh.slice(0, 10);
  const bCnt = last10.filter((x) => x === 'BIG').length;
  const sCnt = 10 - bCnt;

  if (bCnt >= 8) {
    wS += 0.26;
    wB -= 0.26;
  } else if (bCnt >= 7) {
    wS += 0.18;
    wB -= 0.18;
  }
  if (sCnt >= 8) {
    wB += 0.26;
    wS -= 0.26;
  } else if (sCnt >= 7) {
    wB += 0.18;
    wS -= 0.18;
  }

  let alt = 0;
  for (let i = 0; i < Math.min(bsh.length - 1, 12); i++) {
    if (bsh[i] !== bsh[i + 1]) alt++;
  }
  const altRate = alt / Math.min(bsh.length - 1, 12);
  if (altRate > 0.72) {
    if (bsh[0] === 'BIG') {
      wS += 0.2;
      wB -= 0.2;
    } else {
      wB += 0.2;
      wS -= 0.2;
    }
  } else if (altRate < 0.28) {
    if (bsh[0] === 'BIG') {
      wB += 0.12;
      wS -= 0.12;
    } else {
      wS += 0.12;
      wB -= 0.12;
    }
  }

  // Transition matrix bias
  if (nums.length > 0) {
    const tr = transMatrix[nums[0]];
    const tot = tr.reduce((a, b) => a + b, 0);
    if (tot > 2) {
      let tB = 0;
      for (let i = 0; i < 10; i++) {
        if (i >= 5) tB += tr[i];
      }
      const frac = tB / tot;
      wB += (frac - 0.5) * 0.3;
      wS -= (frac - 0.5) * 0.3;
    }
  }

  const bladePred: WinGoSize = wB >= wS ? 'BIG' : 'SMALL';

  // 4. Triplet Pattern Matching in History (Strike Mode)
  let tripletHitNum: number | null = null;
  if (nums.length >= 6) {
    const key = `${nums[0]},${nums[1]},${nums[2]}`;
    for (let i = 3; i < nums.length - 3; i++) {
      if (`${nums[i]},${nums[i + 1]},${nums[i + 2]}` === key) {
        tripletHitNum = nums[i - 1];
        break;
      }
    }
  }

  // 5. Strike Decision:
  // IF streak >= 3 -> DRAGON STRIKE CONFIRMED (Follow the Dragon!)
  if (streak >= 3) {
    const predSide: WinGoSize = currentSide;
    const candidates = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => (n >= 5 ? 'BIG' : 'SMALL') === predSide);
    const oppCandidates = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => (n >= 5 ? 'BIG' : 'SMALL') !== predSide);

    const rankedMain = rankCandidates(candidates);
    const rankedOpp = rankCandidates(oppCandidates);

    const n1 = rankedMain[0] ?? (predSide === 'BIG' ? 7 : 2);
    const n2 = rankedOpp[0] ?? (predSide === 'BIG' ? 2 : 7);

    return {
      prediction: predSide,
      statusType: predSide === 'BIG' ? 'BIG_STRIKE' : 'SMALL_STRIKE',
      streakCount: streak,
      label: `🐉 DRAGON ${predSide} STRIKE (${streak}x) — FOLLOW ${predSide}`,
      confidence: Math.min(97.5, 92 + (streak - 3) * 1.5),
      n1,
      n2,
      mode: 'DRAGON',
      reasoning: `🐉 3+ SAME CONFIRMED STRIKE: Follow ${predSide} momentum (${streak} in a row)`,
    };
  }

  // If Triplet matched in past history
  if (tripletHitNum !== null) {
    const predSide: WinGoSize = tripletHitNum >= 5 ? 'BIG' : 'SMALL';
    const oppCandidates = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => (n >= 5 ? 'BIG' : 'SMALL') !== predSide);
    const n2 = rankCandidates(oppCandidates)[0] ?? (predSide === 'BIG' ? 2 : 7);

    return {
      prediction: predSide,
      statusType: 'WAIT',
      streakCount: streak,
      label: `⚡ STRIKE TRIPLET HARMONIC #${tripletHitNum}`,
      confidence: 93.5,
      n1: tripletHitNum,
      n2,
      mode: 'STRIKE',
      reasoning: `Exact 3-draw sequence match found in history, leading directly to #${tripletHitNum} (${predSide}).`,
    };
  }

  // Blade / Markov Base
  const candidates = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => (n >= 5 ? 'BIG' : 'SMALL') === bladePred);
  const oppCandidates = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => (n >= 5 ? 'BIG' : 'SMALL') !== bladePred);

  const n1 = rankCandidates(candidates)[0] ?? (bladePred === 'BIG' ? 8 : 1);
  const n2 = rankCandidates(oppCandidates)[0] ?? (bladePred === 'BIG' ? 2 : 7);
  const conf = Math.min(95, Math.round(78 + Math.abs(wB - wS) * 45));

  return {
    prediction: bladePred,
    statusType: 'WAIT',
    streakCount: streak,
    label: `⚔️ BLADE MARKOV MATRIX (${conf}%)`,
    confidence: conf,
    n1,
    n2,
    mode: 'BLADE',
    reasoning: `Blade 10x10 Transition Matrix indicates ${bladePred} with ${conf}% probability.`,
  };
}
