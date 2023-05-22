import {create} from "zustand";

type EmojiStore = {
    celebrate: boolean
}

type EmojiActions = {
    activate: () => void
    deactivate: () => void
}

const useEmojiStore = create<EmojiStore & EmojiActions>((set) => ({
    celebrate: false,
    activate: () => set({ celebrate: true }),
    deactivate: () => set({ celebrate: false })
}))

export default useEmojiStore