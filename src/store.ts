import { create } from 'zustand'

export type GameState = 'menu' | 'playing' | 'victory'

interface State {
  gameState: GameState
  score: number
  totalTreasures: number
  joystickInput: { x: number, y: number }
  playerPosition: [number, number]
  otherPlayers: Record<string, { position: [number, number, number], rotation: number }>
  setGameState: (state: GameState) => void
  addScore: (points: number) => void
  setJoystickInput: (x: number, y: number) => void
  setPlayerPosition: (pos: [number, number]) => void
  setOtherPlayerPosition: (id: string, pos: [number, number, number], rot: number) => void
  removeOtherPlayer: (id: string) => void
  resetGame: () => void
}

export const useGameStore = create<State>((set) => ({
  gameState: 'menu',
  score: 0,
  totalTreasures: 5,
  joystickInput: { x: 0, y: 0 },
  playerPosition: [0, 0],
  otherPlayers: {},
  setGameState: (state) => set({ gameState: state }),
  addScore: (points) => set((state) => ({ score: state.score + points })),
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
