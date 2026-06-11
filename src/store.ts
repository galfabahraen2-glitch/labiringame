import { create } from 'zustand'

export type GameState = 'menu' | 'playing' | 'victory'

interface State {
  gameState: GameState
  score: number
  totalTreasures: number
  joystickInput: { x: number, y: number }
  setGameState: (state: GameState) => void
  addScore: (points: number) => void
  setJoystickInput: (x: number, y: number) => void
  resetGame: () => void
}

export const useGameStore = create<State>((set) => ({
  gameState: 'menu',
  score: 0,
  totalTreasures: 5,
  joystickInput: { x: 0, y: 0 },
  setGameState: (state) => set({ gameState: state }),
  addScore: (points) => set((state) => ({ score: state.score + points })),
  setJoystickInput: (x, y) => set({ joystickInput: { x, y } }),
  resetGame: () => set({ score: 0, gameState: 'playing' })
}))
