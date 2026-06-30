import { create } from 'zustand'

export type GameState = 'menu' | 'levelmap' | 'playing' | 'dead' | 'victory' | 'settings' | 'trackrecord' | 'warp'

export type Language = 'id' | 'en'
export type CameraView = 'isometric' | 'third-person' | 'first-person'
export type JoystickMode = 'single' | 'dual'

export interface AvatarConfig {
  skinColor: string
  shirtColor: string
  pantsColor: string
  accessory: 'none' | 'hat' | 'crown' | 'turban' | 'bandana'
}

export interface LevelRecord {
  level: number
  timeUsed: number   // seconds used
  treasures: number
  survived: boolean
  date: string
}

interface State {
  gameState: GameState
  score: number
  totalTreasures: number
  currentLevel: number
  // Life systems
  hp: number            // 0-100
  age: number           // 0-100 (represents remaining life vigor)
  timeLeft: number      // seconds
  isDead: boolean
  // Holy Aura
  isHolyAuraActive: boolean
  holyAuraCooldown: number // 0 means ready
  // Maze data
  joystickInput: { x: number, y: number }
  joystickLookInput: { x: number, y: number }
  playerPosition: [number, number]
  playerWorldPos: [number, number, number]
  forceTeleportPos: [number, number, number] | null
  mazeData: number[][] | null
  exitPosition: [number, number] | null
  playerStartPosition: [number, number] | null
  treasures: { x: number, z: number, id: string }[]
  beggars: { x: number, z: number, id: string }[]
  otherPlayers: Record<string, { position: [number, number, number], rotation: number, name: string, avatar: AvatarConfig, level: number }>
  // Player identity
  playerName: string
  avatarConfig: AvatarConfig
  // Settings
  language: Language
  musicVolume: number
  sfxVolume: number
  cameraView: CameraView
  joystickMode: JoystickMode
  // Records
  trackRecord: LevelRecord[]
  // Actions
  setGameState: (state: GameState) => void
  addScore: (points: number) => void
  setTotalTreasures: (total: number) => void
  setLevel: (level: number) => void
  setMazeData: (data: number[][], exitPos: [number, number], startPos: [number, number], treasures: {x: number, z: number, id: string}[], beggars: {x: number, z: number, id: string}[]) => void
  nextLevel: () => void
  setJoystickInput: (x: number, y: number) => void
  setJoystickLookInput: (x: number, y: number) => void
  setPlayerPosition: (pos: [number, number]) => void
  setPlayerWorldPos: (pos: [number, number, number]) => void
  teleportPlayer: (pos: [number, number, number]) => void
  clearTeleport: () => void
  setOtherPlayerPosition: (id: string, pos: [number, number, number], rot: number, name: string, avatar: AvatarConfig, level: number) => void
  removeOtherPlayer: (id: string) => void
  // Special Abilities
  activateHolyAura: () => void
  tickHolyAuraCooldown: (delta: number) => void
  // Life system actions
  takeDamage: (amount: number) => void
  tickTime: (delta: number) => void
  killPlayer: () => void
  revivePlayer: () => void
  collectTreasure: () => void
  giveAlms: (id: string) => boolean
  // Settings actions
  setPlayerName: (name: string) => void
  setAvatarConfig: (config: Partial<AvatarConfig>) => void
  setLanguage: (lang: Language) => void
  setCameraView: (view: CameraView) => void
  setJoystickMode: (mode: JoystickMode) => void
  setMusicVolume: (vol: number) => void
  setSfxVolume: (vol: number) => void
  addTrackRecord: (record: LevelRecord) => void
  resetGame: () => void
}

// Load from local storage
const savedLevel = localStorage.getItem('lq_level')
const initialLevel = savedLevel ? parseInt(savedLevel) : 1

const savedScore = localStorage.getItem('lq_score')
const initialScore = savedScore ? parseInt(savedScore) : 0

const savedName = localStorage.getItem('lq_name') || 'Pejalan'

const savedAvatar = localStorage.getItem('lq_avatar')
const initialAvatar: AvatarConfig = savedAvatar ? JSON.parse(savedAvatar) : {
  skinColor: '#f5cba7',
  shirtColor: '#2980b9',
  pantsColor: '#2c3e50',
  accessory: 'none'
}

const savedLang = (localStorage.getItem('lq_lang') || 'id') as Language
const savedMusicVol = parseFloat(localStorage.getItem('lq_music_vol') || '0.5')
const savedSfxVol = parseFloat(localStorage.getItem('lq_sfx_vol') || '0.8')
const savedTrack = localStorage.getItem('lq_track')
const initialTrack: LevelRecord[] = savedTrack ? JSON.parse(savedTrack) : []

const savedCameraView = (localStorage.getItem('lq_camera') || 'isometric') as CameraView
const savedJoystickMode = (localStorage.getItem('lq_joystick') || 'single') as JoystickMode

export function getTimeForLevel(level: number): number {
  if (level <= 40) return 9 * 60      // Easy: 9 minutes
  if (level <= 80) return 6 * 60      // Medium: 6 minutes
  return 3 * 60                        // Expert: 3 minutes
}

export const useGameStore = create<State>((set, get) => ({
  gameState: 'menu',
  score: initialScore,
  totalTreasures: 0,
  currentLevel: initialLevel,
  hp: 100,
  age: 100,
  timeLeft: getTimeForLevel(initialLevel),
  isDead: false,
  isHolyAuraActive: false,
  holyAuraCooldown: 0,
  joystickInput: { x: 0, y: 0 },
  joystickLookInput: { x: 0, y: 0 },
  playerPosition: [0, 0],
  playerWorldPos: [0, 0, 0],
  forceTeleportPos: null,
  mazeData: null,
  exitPosition: null,
  playerStartPosition: null,
  treasures: [],
  beggars: [],
  otherPlayers: {},
  playerName: savedName,
  avatarConfig: initialAvatar,
  language: savedLang,
  cameraView: savedCameraView,
  joystickMode: savedJoystickMode,
  musicVolume: savedMusicVol,
  sfxVolume: savedSfxVol,
  trackRecord: initialTrack,

  setGameState: (state) => set({ gameState: state }),
  
  addScore: (points) => set((s) => {
    const newScore = s.score + points;
    localStorage.setItem('lq_score', newScore.toString());
    return { score: newScore };
  }),
  
  setTotalTreasures: (total) => set({ totalTreasures: total }),
  
  setLevel: (level) => set(() => {
    localStorage.setItem('lq_level', level.toString());
    return { currentLevel: level, hp: 100, age: 100, isDead: false, timeLeft: getTimeForLevel(level), isHolyAuraActive: false, holyAuraCooldown: 0 };
  }),
  
  setMazeData: (data, exitPos, startPos, treasures, beggars) => set({ 
    mazeData: data, exitPosition: exitPos, playerStartPosition: startPos, treasures, beggars 
  }),
  
  nextLevel: () => set((s) => {
    const next = s.currentLevel + 1;
    localStorage.setItem('lq_level', next.toString());
    return { currentLevel: next, hp: 100, age: 100, isDead: false, timeLeft: getTimeForLevel(next), isHolyAuraActive: false, holyAuraCooldown: 0 };
  }),
  
  setJoystickInput: (x, y) => set({ joystickInput: { x, y } }),
  setJoystickLookInput: (x, y) => set({ joystickLookInput: { x, y } }),

  setPlayerPosition: (pos) => set({ playerPosition: pos }),
  setPlayerWorldPos: (pos) => set({ playerWorldPos: pos }),
  teleportPlayer: (pos) => set({ forceTeleportPos: pos, playerWorldPos: pos }),
  clearTeleport: () => set({ forceTeleportPos: null }),
  
  setOtherPlayerPosition: (id, pos, rot, name, avatar, level) => set((s) => ({
    otherPlayers: { ...s.otherPlayers, [id]: { position: pos, rotation: rot, name, avatar, level } }
  })),
  
  removeOtherPlayer: (id) => set((s) => {
    const newOthers = { ...s.otherPlayers }
    delete newOthers[id]
    return { otherPlayers: newOthers }
  }),

  activateHolyAura: () => {
    const { holyAuraCooldown } = get();
    const now = Date.now();
    // holyAuraCooldown now stores the timestamp when it will be ready
    if (now >= holyAuraCooldown) {
      set({ isHolyAuraActive: true, holyAuraCooldown: now + 20000 }); // 20s cooldown
      setTimeout(() => {
        set({ isHolyAuraActive: false });
      }, 10000); // 10s duration
    }
  },

  tickHolyAuraCooldown: () => {
    // we don't need this anymore, UI can just check Date.now() against holyAuraCooldown
  },

  takeDamage: (amount) => set((s) => {
    if (s.isDead || s.isHolyAuraActive) return {};
    const newHp = Math.max(0, s.hp - amount);
    const newAge = Math.max(0, s.age - amount * 0.5);
    const newTime = Math.max(0, s.timeLeft - amount * 2); // touching enemy cuts time
    if (newHp <= 0 || newTime <= 0) {
      return { hp: 0, age: newAge, timeLeft: 0, isDead: true };
    }
    return { hp: newHp, age: newAge, timeLeft: newTime };
  }),

  tickTime: (delta) => set((s) => {
    if (s.isDead || s.gameState !== 'playing') return {};
    const newTime = Math.max(0, s.timeLeft - delta);
    const newAge = Math.max(0, s.age - (delta / getTimeForLevel(s.currentLevel)) * 30);
    if (newTime <= 0) {
      return { timeLeft: 0, age: 0, isDead: true };
    }
    return { timeLeft: newTime, age: newAge };
  }),

  killPlayer: () => set({ isDead: true, timeLeft: 0 }),
  revivePlayer: () => set((s) => ({ isDead: false, hp: 100, age: 50, timeLeft: getTimeForLevel(s.currentLevel) })),

  collectTreasure: () => set((s) => {
    const newScore = s.score + 1;
    localStorage.setItem('lq_score', newScore.toString());
    return {
      score: newScore,
      hp: Math.min(100, s.hp + 10),
      age: Math.min(100, s.age + 15),
    };
  }),

  giveAlms: (id) => {
    const s = get();
    if (s.score >= 1) { // Player needs at least 1 score/emerald to give
      const newScore = s.score - 1 + 233;
      localStorage.setItem('lq_score', newScore.toString());
      set({
        score: newScore,
        hp: Math.min(100, s.hp + 117), // We cap at 100, wait, should we uncap? Let's cap at 100 but give huge amounts
        age: Math.min(100, s.age + 117), 
        // Note: the prompt says 234 split between hp and age, so 117 each.
        // Wait, the prompt says +234 HP/Age. But HP/Age are capped at 100.
        // I will just max them both out.
        beggars: s.beggars.filter(b => b.id !== id)
      });
      get().activateHolyAura(); // Instantly grant Holy Aura (invincibility/speed)
      return true; // Success
    }
    return false; // Failed, not enough
  },

  setPlayerName: (name) => {
    localStorage.setItem('lq_name', name);
    set({ playerName: name });
  },
  
  setAvatarConfig: (config) => set((s) => {
    const newAvatar = { ...s.avatarConfig, ...config };
    localStorage.setItem('lq_avatar', JSON.stringify(newAvatar));
    return { avatarConfig: newAvatar };
  }),
  
  setLanguage: (lang) => set(() => {
    localStorage.setItem('lq_lang', lang);
    return { language: lang };
  }),

  setCameraView: (view) => set(() => {
    localStorage.setItem('lq_camera', view);
    return { cameraView: view };
  }),

  setJoystickMode: (mode) => set(() => {
    localStorage.setItem('lq_joystick', mode);
    return { joystickMode: mode };
  }),

  setMusicVolume: (vol) => set(() => {
    localStorage.setItem('lq_music_vol', vol.toString());
    return { musicVolume: vol };
  }),
  
  setSfxVolume: (vol) => {
    localStorage.setItem('lq_sfx_vol', vol.toString());
    set({ sfxVolume: vol });
  },

  addTrackRecord: (record) => set((s) => {
    const newTrack = [...s.trackRecord, record];
    // Keep only last 50 records
    const trimmed = newTrack.slice(-50);
    localStorage.setItem('lq_track', JSON.stringify(trimmed));
    return { trackRecord: trimmed };
  }),

  resetGame: () => set((s) => ({ 
    score: 0, 
    gameState: 'playing', 
    playerPosition: [0, 0], 
    otherPlayers: {},
    hp: 100,
    age: 100,
    isDead: false,
    isHolyAuraActive: false,
    holyAuraCooldown: 0,
    timeLeft: getTimeForLevel(s.currentLevel)
  }))
}))
