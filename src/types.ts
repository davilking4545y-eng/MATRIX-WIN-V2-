export type StrikeOutcome = 'WIN' | 'LOSS' | 'SURGE' | 'JACKPOT';

export type AppThemeId = 'matrix' | 'cyberpunk' | 'gold' | 'ocean' | 'crimson';

export interface ThemeConfig {
  id: AppThemeId;
  name: string;
  tagline: string;
  primary: string;
  primaryGlow: string;
  secondary: string;
  gold: string;
  bgGradient: string;
  cardBg: string;
  border: string;
  rainColor: string;
}

export interface WinGoIssue {
  issueNumber: string;
  number: string;
  color: string; // e.g. "green", "red", "green,violet", "red,violet"
  premium: string;
  sum?: number;
}

export type WinGoSize = 'BIG' | 'SMALL';
export type WinGoColor = 'GREEN' | 'RED';
export type PredictionStrategy =
  | 'matrix_win_v2'
  | 'neural_ensemble'
  | 'dragon_strike'
  | 'deepseek_fluid'
  | 'ronin_vip'
  | 'single_number_12'
  | 'ultimate_pro'
  | 'safe_dragon'
  | 'aggressive_trend'
  | 'contrarian_reversal';

export interface WinGoPrediction {
  targetIssue: string;
  size: WinGoSize;
  sizeConfidence: number; // e.g. 94.5%
  color: WinGoColor;
  colorConfidence: number;
  primaryNum: number; // pNum from Triad/Markov Seed
  hedgeNum: number;   // oNum from Triad/Markov Seed
  luckyNumbers: number[]; // e.g. [pNum, oNum, 3rd]
  pattern: string; // e.g. "Triad Historical Resonance"
  modelName: string; // "MATRIX V1 CORE"
  reasoning: string;
  riskLevel: number; // 1 to 6
  consensus: number; // e.g. 93%
  timestamp: number;
  recommendedAction: string;
  status: 'PENDING' | 'WIN' | 'LOSS';
  actualNumber?: number;
  actualSize?: WinGoSize;
  actualColor?: string;
  phaseLabel?: string;
  dragonCount?: number;
  engineName?: string;
  singleNumber?: number;
  hotDigits?: number[];
  coldDigits?: number[];
  martingaleLevel?: number;
  martingaleMultiplier?: string;
  engineVotes?: { name: string; vote: WinGoSize; confidence: number }[];
}

export type HistoryRecordStatus = 'JACKPOT' | 'WIN' | 'LOSS';

export interface PredictionHistoryRecord {
  issueNumber: string;
  actualNumber: number;
  actualSize: WinGoSize;
  actualColor: string;
  predictedSize: WinGoSize;
  predictedColor: WinGoColor;
  primaryNum: number;
  hedgeNum: number;
  level: number;
  levelMultiplier: string; // 'L1 (1X)', 'L2 (3X)', 'L3 (9X)'
  status: HistoryRecordStatus;
  isWin: boolean;
  confidence: number;
  pattern: string;
  modelName?: string;
  timestamp: number;
}

export interface PredictionTelemetry {
  totalRounds: number;
  totalWins: number;
  winRate: number;
  currentStreak: number;
  maxStreak: number;
  dragonStreak: number;
  lastPattern: string;
  apiLatencyMs: number;
  lastSyncedAt: number;
}

export interface TickData {
  time: number;
  price: number;
  volume: number;
  trend: 'UP' | 'DOWN' | 'FLAT';
  isStrikePoint?: boolean;
  strikeOutcome?: StrikeOutcome;
}

export interface WinSignal {
  id: string;
  timestamp: number;
  type: StrikeOutcome;
  multiplier: number;
  stake: number;
  payout: number;
  profit: number;
  confidence: number;
  coordinate: [number, number]; // [X, Y]
  hash: string;
  latencyMs: number;
}

export interface MatrixCell {
  x: number;
  y: number;
  label: string;
  winProbability: number;
  baseMultiplier: number;
  hitCount: number;
  entropy: number;
  status: 'idle' | 'hot' | 'active' | 'win' | 'loss';
}

export interface ClusterNode {
  id: string;
  name: string;
  region: string;
  ping: number;
  load: number;
  status: 'OPTIMAL' | 'SYNCED' | 'ROUTING';
  nodesCount: number;
}

export type StrategyMode = 'conservative' | 'balanced' | 'aggressive' | 'hyper_matrix';

export interface SystemTelemetry {
  fps: number;
  latencyMs: number;
  throughputEventsSec: number;
  memoryHeapMb: number;
  totalStrikes: number;
  totalWins: number;
  winRatio: number;
  netPnL: number;
  balance: number;
  streak: number;
  maxStreak: number;
}

export interface UserPreferences {
  soundEnabled: boolean;
  rainEnabled: boolean;
  scanlinesEnabled: boolean;
  autoRunner: boolean;
  autoRunnerSpeedMs: number;
  stake: number;
  strategy: StrategyMode;
  targetMultiplier: number;
  wingoStrategy: PredictionStrategy;
}

export interface AuthSession {
  authenticated: boolean;
  role: 'owner' | 'member';
  accessKey: string;
  deviceId: string;
  loginTime: string;
  expiryDate?: string;
}

