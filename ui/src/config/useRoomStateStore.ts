import { create } from 'zustand'

interface RoomState {
    roomId: number,
    setRoomId: (value: number) => void
    onlyVoice: boolean,
    setOnlyVoice: (value: boolean) => void
}

const useRoomStateStore = create<RoomState>((set) => ({
    roomId: 0,
    setRoomId: (value) => set({ roomId: value }),
    onlyVoice: false,
    setOnlyVoice: (value) => set({ onlyVoice: value }),
}))

export default useRoomStateStore
