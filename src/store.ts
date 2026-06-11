import { create } from 'zustand'

export type GameState = 'menu' | 'playing' | 'victory'

interface State {
  gameState: GameState
  score: number
  totalTreasures: number
  currentLevel: number
  joystickInput: { x: number, y: number }
  playerPosition: [number, number]
  mazeData: number[][] | null
  exitPosition: [number, number] | null
  playerStartPosition: [number, number] | null
  treasures: { x: number, z: number }[]
  enemies: { id: string, type: 'pocong' | 'kuntilanak' | 'animalHead', startPos: [number, number] }[]
  otherPlayers: Record<string, { position: [number, number, number], rotation: number, playerName: string, skinColor: string, shirtColor: string, isDead: boolean }>
  
  // Phase 4: Customization & Status
  playerName: string
  skinColor: string
  shirtColor: string
  health: number
  timeRemaining: number
  isDead: boolean
  
  setGameState: (state: GameState) => void
  addScore: (points: number) => void
  setTotalTreasures: (total: number) => void
  setLevel: (level: number) => void
  setMazeData: (data: number[][], exitPos: [number, number], startPos: [number, number], treasures: {x: number, z: number}[], enemies: any[]) => void
  nextLevel: () => void
  setJoystickInput: (x: number, y: number) => void
  setPlayerPosition: (pos: [number, number]) => void
  setOtherPlayerPosition: (id: string, pos: [number, number, number], rot: number, name: string, skin: string, shirt: string, dead: boolean) => void
  removeOtherPlayer: (id: string) => void
  resetGame: () => void
  
  // Phase 4 methods
  setPlayerConfig: (name: string, skin: string, shirt: string) => void
  updateTime: (deltaSeconds: number) => void
  damagePlayer: (amount: number) => void
  teleportTarget: [number, number] | null
  teleportPlayer: (pos: [number, number]) => void
  clearTeleport: () => void
}

// Load from local storage
const savedLevel = localStorage.getItem('labyrinth_level')
const initialLevel = savedLevel ? parseInt(savedLevel) : 1

const savedScore = localStorage.getItem('labyrinth_score')
const initialScore = savedScore ? parseInt(savedScore) : 0

const savedName = localStorage.getItem('labyrinth_name') || 'Pemain'
const savedSkin = localStorage.getItem('labyrinth_skin') || '#f1c27d'
const savedShirt = localStorage.getItem('labyrinth_shirt') || '#3498db'

export const useGameStore = create<State>((set) => ({
  gameState: 'menu',
  score: initialScore,
  totalTreasures: 0, // Will be set dynamically by the maze generator
  currentLevel: initialLevel,
  joystickInput: { x: 0, y: 0 },
  playerPosition: [0, 0],
  mazeData: null,
  exitPosition: null,
  playerStartPosition: null,
  treasures: [],
  enemies: [],
  otherPlayers: {},
  
  playerName: savedName,
  skinColor: savedSkin,
  shirtColor: savedShirt,
  health: 100,
  timeRemaining: 0,
  isDead: false,
  teleportTarget: null,

  setGameState: (state) => set({ gameState: state }),
  addScore: (points) => set((state) => {
    const newScore = state.score + points;
    localStorage.setItem('labyrinth_score', newScore.toString());
    return { score: newScore };
  }),
  setTotalTreasures: (total) => set({ totalTreasures: total }),
  setLevel: (level) => set(() => {
    localStorage.setItem('labyrinth_level', level.toString());
    return { currentLevel: level };
  }),
  setMazeData: (data, exitPos, startPos, treasures, enemies) => set((state) => {
    // Calculate time based on level
    let initialTime = 9 * 60; // Easy: 9 mins
    if (state.currentLevel >= 81) initialTime = 3 * 60; // Expert
    else if (state.currentLevel >= 41) initialTime = 6 * 60; // Medium

    return { 
      mazeData: data, 
      exitPosition: exitPos, 
      playerStartPosition: startPos, 
      treasures: treasures,
      enemies: enemies,
      health: 100,
      timeRemaining: initialTime,
      isDead: false
    };
  }),
  nextLevel: () => set((state) => {
    const next = state.currentLevel + 1;
    localStorage.setItem('labyrinth_level', next.toString());
    return { currentLevel: next };
  }),
  setJoystickInput: (x, y) => set({ joystickInput: { x, y } }),
  setPlayerPosition: (pos) => set({ playerPosition: pos }),
  setOtherPlayerPosition: (id, pos, rot, name, skin, shirt, dead) => set((state) => ({
    otherPlayers: {
      ...state.otherPlayers,
      [id]: { position: pos, rotation: rot, playerName: name, skinColor: skin, shirtColor: shirt, isDead: dead }
    }
  })),
  removeOtherPlayer: (id) => set((state) => {
    const newOthers = { ...state.otherPlayers }
    delete newOthers[id]
    return { otherPlayers: newOthers }
  }),
  resetGame: () => set({ score: 0, totalTreasures: 0, currentLevel: 1, isDead: false, health: 100, gameState: 'playing', playerPosition: [0, 0], otherPlayers: {} }),
  
  setPlayerConfig: (name, skin, shirt) => set(() => {
    localStorage.setItem('labyrinth_name', name);
    localStorage.setItem('labyrinth_skin', skin);
    localStorage.setItem('labyrinth_shirt', shirt);
    return { playerName: name, skinColor: skin, shirtColor: shirt };
  }),
  updateTime: (deltaSeconds) => set((state) => {
    if (state.isDead || state.gameState !== 'playing') return {};
    const newTime = state.timeRemaining - deltaSeconds;
    if (newTime <= 0) {
      return { timeRemaining: 0, isDead: true };
    }
    return { timeRemaining: newTime };
  }),
  damagePlayer: (amount) => set((state) => {
    if (state.isDead || state.gameState !== 'playing') return {};
    const newHealth = state.health - amount;
    if (newHealth <= 0) {
      return { health: 0, isDead: true };
    }
    return { health: newHealth };
  }),
  teleportPlayer: (pos) => set({ teleportTarget: pos }),
  clearTeleport: () => set({ teleportTarget: null })
}))
