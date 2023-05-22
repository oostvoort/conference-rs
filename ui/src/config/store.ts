import {create} from 'zustand'
import {createJSONStorage, persist} from 'zustand/middleware'
interface ConfigState {
    userName: string
    updateUserName: (value: string) => void
    isVideoEnabled: boolean
    updateIsVideoEnabled: (value: boolean) => void
    isAudioEnabled: boolean
    updateIsAudioEnabled: (value: boolean) => void
    isShareScreen: boolean
    updateIsShareScreen: (value: boolean) => void

}

const useConfigStore = create<ConfigState>()(
    persist(
        (set) => ({
            userName: "",
            updateUserName: (value: string) => set(() => ({userName: value})),

            isVideoEnabled: true,
            updateIsVideoEnabled: (value: boolean) => set(() => ({isVideoEnabled: value})),

            isAudioEnabled: true,
            updateIsAudioEnabled: (value: boolean) => set(() => ({isAudioEnabled: value})),

            isShareScreen: false,
            updateIsShareScreen: (value: boolean) => set(() => ({isShareScreen: value})),
        }),
        {
            name: 'CONFERENCE_CONFIG',
            storage: createJSONStorage(() => localStorage)
        }
    )
)

export default useConfigStore
