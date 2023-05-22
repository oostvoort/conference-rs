import useStore from "./useStore";
import useEmojiStore from "./useEmojiStore.ts";
import {SOUND_SRC} from "../../config/config";

/// React to notifications from the server on broadcast actions
const useOnActionBroadcast = () => {
  const activate = useEmojiStore(state => state.activate)
  return (kind: string, from: string) => {

    switch (kind) {
      case 'Applause':
        new Audio(SOUND_SRC.applause).play().then(r => r).catch(e => console.error("ERROR: ", e))
        break

      case 'Celebrate':
        activate()
        break

      default: {
        const user = useStore.getState().user
        const participants = useStore.getState().participants
        const participant = participants.find(participant => participant.id === from)
        const displayName = user?.id === from ? 'You' : participant ? participant.displayName : 'Unknown'
        console.error(`Unimplemented action: ${kind} was broadcast by ${displayName}`)
      }
    }
  }
}

export default useOnActionBroadcast