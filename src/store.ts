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
  otherPlayers: Record<string, { position: [number, number, number], rotation: number }>
  setGameState: (state: GameState) => void
  addScore: (points: number) => void
  setTotalTreasures: (total: number) => void
  setLevel: (level: number) => void
  setMazeData: (data: number[][], exitPos: [number, number], startPos: [number, number], treasures: {x: number, z: number}[]) => void
  nextLevel: () => void
  setJoystickInput: (x: number, y: number) => void
  setPlayerPosition: (pos: [number, number]) => void
  setOtherPlayerPosition: (id: string, pos: [number, number, number], rot: number) => void
  removeOtherPlayer: (id: string) => void
  resetGame: () => void
}

// Load from local storage
const savedLevel = localStorage.getItem('labyrinth_level')
const initialLevel = savedLevel ? parseInt(savedLevel) : 1

const savedScore = localStorage.getItem('labyrinth_score')
const initialScore = savedScore ? parseInt(savedScore) : 0

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
  otherPlayers: {},
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
  setMazeData: (data, exitPos, startPos, treasures) => set({ 
    mazeData: data, 
    exitPosition: exitPos, 
    playerStartPosition: startPos, 
    treasures: treasures 
  }),
  nextLevel: () => set((state) => {
    const next = state.currentLevel + 1;
    localStorage.setItem('labyrinth_level', next.toString());
    return { currentLevel: next };
  }),
  setJoystickInput: (x, y) => set({ joystickInput: { x, y } }),
  setPlayerPosition: (pos) => set({ playerPosition: pos }),
  setOtherPlayerPosition: (id, pos, rot) => set((state) => ({
    otherPlayers: { ...state.otherPlayers, [id]: { position: pos, rotation: rot } }
  })),
  removeOtherPlayer: (id) => set((state) => {
    const newOthers = { ...state.otherPlayers }
    delete newOthers[id]
    return { otherPlayers: newOthers }
  }),
  resetGame: () => set({ score: 0, gameState: 'playing', playerPosition: [0, 0], otherPlayers: {} })
}))
