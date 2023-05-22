import {MediaKind} from "mediasoup-client/lib/RtpParameters";
import {RoomStore, RoomUserStore} from "../types";
import User from "../../../lib/MediasoupClient/User";
export const attachEvent = (eventName: string | symbol, listener: (...args: any[]) => void, state: RoomUserStore) => {
  state.user?.eventEmitter.on(eventName, listener)
  return state
}

export const createUser = (roomId: string, displayName: string, isAudioOnly: boolean, state: RoomStore) => {
  if (state.user) {
    if (state.user.roomId === roomId) return state.user
    else state.leave()
  }
  const createUser: Promise<User> = new Promise(resolve => {
    const user = new User(roomId, displayName, isAudioOnly)
    user.eventEmitter.on('connected', () => resolve(user))
    user.eventEmitter.on('addProducer', state.addProducer)
    user.eventEmitter.on('removeProducer', state.removeProducer)
    user.eventEmitter.on('toggleMedia', state.onToggleMedia)
  })
  return createUser
}

export const toggleMedia = (kind: MediaKind, state: RoomUserStore) => {
  state.user?.toggleMedia(kind)
  const currentValue = state.mediaState[kind]
  return {
    mediaState: {
      ...state.mediaState,
      [kind]: !currentValue
    }
  }
}

export const leave = (state: RoomStore) => {
  state.user?.leave()
  state.myScreenShare?.stop()
  return {
    user: undefined,
    myScreenShare: undefined,
    mediaState: {
      audio: true,
      video: true
    },
    participants: [],
    screenSharers: []
  }
}

export const stopShareScreen = (state: RoomUserStore) => {
  state?.myScreenShare?.stop()
  return {
    myScreenShare: undefined
  }
}