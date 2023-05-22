import {create} from "zustand";
import {RoomStore} from "./types";
import {attachEvent, createUser, leave, stopShareScreen, toggleMedia} from "./actions/user";
import {addProducer, onToggleMedia, removeProducer} from "./actions/participants";

const useStore = create<RoomStore>((set, get) => ({
  /* state */
  user: undefined,
  myScreenShare: undefined,
  mediaState: {
    audio: true,
    video: true
  },
  participants: [],
  screenSharers: [],

  /* user actions */
  joinRoom: async (roomId, displayName, isAudioOnly) => {
    const user = await createUser(roomId, displayName, isAudioOnly, get())
    set({ user })
  },
  attachEvent: (eventName, listener) => set((state) => attachEvent(eventName, listener, state)),
  toggleMedia: (kind) => set((state) => toggleMedia(kind, state)),
  updateUser: (user) => set(() => ({ user })),
  updateMyScreenShare: (myScreenShare) => set(() => ({ myScreenShare })),
  leave: () => set(leave),
  stopShareScreen: () => set(state => stopShareScreen(state)),

  /* participant actions */
  addProducer: (
    participantId,
    producerId,
    displayName,
    isShareScreen,
    isEnabled,
    track
  ) => set((state) => addProducer(participantId, producerId, displayName, isShareScreen, isEnabled, track, state)),
  removeProducer: (participantId, producerId) => set((state) => removeProducer(participantId, producerId, state)),
  onToggleMedia: (participantId, isPlay, kind) => set(state => onToggleMedia(participantId, isPlay, kind, state))

}))

export default useStore

