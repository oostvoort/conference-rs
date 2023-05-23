import User from "../../lib/MediasoupClient/User";
import ScreenShare from "../../lib/MediasoupClient/ScreenShare";
import {MediaKind} from "mediasoup-client/lib/RtpParameters";
import Participant from "../../lib/MediasoupClient/Participant";

export type RoomUserStore = {
  user?: User
  mediaState: {
    audio: boolean,
    video: boolean
  }
  myScreenShare?: ScreenShare
}

export type RoomUserActions = {
  attachEvent: (eventName: string | symbol, listener: (...args: any[]) => void) => void
  joinRoom: (roomId: string, displayName: string, isAudioOnly: boolean) => Promise<void>
  updateUser: (user: User) => void
  toggleMedia: (kind: MediaKind) => void
  updateMyScreenShare: (myScreenShare?: ScreenShare) => void,
  leave: () => void,
  stopShareScreen: () => void
}

export type RoomParticipantsStore = {
  participants: Participant[]
  screenSharers: Participant[]
}

export type RoomParticipantsActions = {
  addProducer: (participantId: string, producerId: string, displayName: string, isShareScreen: boolean, isEnabled: boolean, track: MediaStreamTrack) => void
  removeProducer: (participantId: string, producerId: string) => void,
  onToggleMedia: (participantId: string, isPlay: boolean, kind: MediaKind) => void
}

export type RoomStore = RoomUserStore & RoomUserActions & RoomParticipantsStore & RoomParticipantsActions